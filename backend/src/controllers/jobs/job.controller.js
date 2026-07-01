/**
 * Job Controller
 *
 * Responsibilities:
 *  - createJob: Validate, create Job, emit job:new via Socket.io to all providers
 *  - getOpenJobs: Return open jobs geo-filtered near provider's location (or city)
 *  - getMyJobs: Return all jobs for authenticated customer
 *  - getJobById: Return single job with bid count
 *  - expireJob: Mark job as expired (admin or scheduled task)
 *  - cancelJob: Cancel open job (customer — only if no accepted bid)
 */

import Job from '../../models/Job.js';
import { JOB_STATUS } from '../../config/constants.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { getIO } from '../../config/socket.js';

export const createJob = async (req, res, next) => {
  console.log('📬 Received Job Posting Request:', {
    body: req.body,
    file: req.file ? { fieldname: req.file.fieldname, originalname: req.file.originalname, size: req.file.size } : null,
    user: req.user ? req.user._id : null
  });

  const { service, description, budget, urgency, scheduledDate, address, location } = req.body;
  let imageUrl = req.body.imageUrl || '';
  if (req.file) {
    try {
      console.log('☁️ Uploading image to Cloudinary...');
      const cloudinary = (await import('../../config/cloudinary.js')).default;
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `bidzy/jobs/${req.user._id}`,
            public_id: `job-${Date.now()}`,
          },
          (error, result) => {
            if (error) {
              console.error('❌ Cloudinary stream upload failed:', error);
              reject(error);
            } else {
              console.log('✅ Cloudinary stream upload success:', result.secure_url);
              resolve(result);
            }
          }
        );
        stream.end(req.file.buffer);
      });
      const result = await uploadPromise;
      imageUrl = result.secure_url;
    } catch (uploadError) {
      console.error('❌ Cloudinary Upload Error:', uploadError);
      return errorResponse(res, 'Failed to upload image. Please try again.', 500);
    }
  }

  // Parse location and budget since they might come as strings from FormData
  let parsedLocation = location;
  if (typeof location === 'string') {
    try { parsedLocation = JSON.parse(location); } catch(e){}
  }
  let parsedAddress = address;
  if (typeof address === 'string') {
    try { parsedAddress = JSON.parse(address); } catch(e){}
  }

  console.log('🔍 Parsed parameters:', { parsedLocation, parsedAddress, budget });

  try {
    if (!service || !description || !budget || !parsedAddress || !parsedLocation || !parsedLocation.coordinates) {
      console.warn('⚠️ Missing required fields:', { service, description, budget, parsedAddress, parsedLocation });
      return errorResponse(res, 'Missing required fields for job posting', 400);
    }

    console.log('💾 Writing Job to MongoDB...');
    const job = await Job.create({
      customerId: req.user._id,
      service,
      description,
      budget: Number(budget),
      urgency: urgency || 'today',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      imageUrl,
      address: parsedAddress,
      location: parsedLocation,
    });
    console.log('✅ Job created in DB:', job._id);

    console.log('Populating job customer info...');
    const populatedJob = await Job.findById(job._id).populate('customerId', 'name phone');

    // Notify all listening providers in real-time
    try {
      console.log('📡 Broadcasting job:new socket event...');
      const io = getIO();
      if (io) {
        io.emit('job:new', populatedJob);
        console.log('✅ Broadcast success.');
      }
    } catch (socketError) {
      console.warn('Real-time socket emit for new job failed:', socketError.message);
    }

    console.log('🎉 Responding success to client.');
    return successResponse(res, populatedJob, 'Job posted successfully', 201);
  } catch (error) {
    console.error('❌ Error in createJob:', error);
    next(error);
  }
};

export const getOpenJobs = async (req, res, next) => {
  const { lng, lat, maxDistance = 5000, service } = req.query; // maxDistance in meters (default 5km)

  try {
    let query = {
      status: JOB_STATUS.OPEN,
      expiresAt: { $gt: new Date() },
    };

    if (service) {
      query.service = service;
    }

    if (lng && lat) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      };
    }

    const jobs = await Job.find(query).populate('customerId', 'name phone');
    return successResponse(res, jobs, 'Open jobs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ customerId: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, jobs, 'Your jobs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const job = await Job.findById(id).populate('customerId', 'name phone');
    if (!job) {
      return errorResponse(res, 'Job not found', 404);
    }
    return successResponse(res, job, 'Job retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const expireJob = async (req, res, next) => {
  const { id } = req.params;

  try {
    const job = await Job.findById(id);
    if (!job) {
      return errorResponse(res, 'Job not found', 404);
    }

    if (job.status !== JOB_STATUS.OPEN) {
      return errorResponse(res, 'Only open jobs can be expired', 400);
    }

    job.status = JOB_STATUS.EXPIRED;
    await job.save();

    try {
      const io = getIO();
      if (io) {
        io.emit('job:expired', { jobId: job._id });
      }
    } catch (socketError) {
      console.warn('Real-time socket emit for expired job failed:', socketError.message);
    }

    return successResponse(res, job, 'Job expired successfully');
  } catch (error) {
    next(error);
  }
};

export const cancelJob = async (req, res, next) => {
  const { id } = req.params;

  try {
    const job = await Job.findById(id);
    if (!job) {
      return errorResponse(res, 'Job not found', 404);
    }

    // Verify ownership
    if (job.customerId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to cancel this job', 403);
    }

    if (job.status !== JOB_STATUS.OPEN) {
      return errorResponse(res, 'Only open jobs can be cancelled', 400);
    }

    job.status = JOB_STATUS.CANCELLED;
    await job.save();

    try {
      const io = getIO();
      if (io) {
        io.emit('job:cancelled', { jobId: job._id });
      }
    } catch (socketError) {
      console.warn('Real-time socket emit for cancelled job failed:', socketError.message);
    }

    return successResponse(res, job, 'Job cancelled successfully');
  } catch (error) {
    next(error);
  }
};

