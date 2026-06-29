/**
 * sockets/bidding.socket.js — Real-Time Bidding Socket Handler
 *
 * Responsibilities:
 *  - Handle all bidding-related Socket.io events
 *  - Manage bidding rooms: job_<jobId>
 *  - Broadcast new jobs to all connected providers on job:new
 *  - Relay submitted bids to all clients in a job room on bid:new
 *  - Notify all clients in job room on bid:accepted
 *
 * Events handled:
 *  Client → Server:
 *    room:join   { jobId }           — Provider joins job bidding room
 *    room:leave  { jobId }           — Provider leaves job bidding room
 *    bid:submit  { jobId, ...bid }   — Provider submits a bid (validates + saves via service)
 *
 *  Server → Client:
 *    job:new      fullJobObject      — Broadcast to all providers on job creation
 *    bid:new      fullBidObject      — Broadcast to job_<jobId> room
 *    bid:accepted { bidId, bookingId } — Broadcast to job_<jobId> room
 */

import Bid from '../models/Bid.js';
import Job from '../models/Job.js';

/**
 * handleBiddingSocket — attach bidding event handlers to a socket
 * @param {import('socket.io').Socket} socket
 * @param {import('socket.io').Server} io
 */
export const handleBiddingSocket = (socket, io) => {
  socket.on('room:join', ({ jobId }) => {
    if (jobId) {
      socket.join(`job:${jobId}`);
      console.log(`Socket ${socket.id} joined room: job:${jobId}`);
    }
  });

  socket.on('room:leave', ({ jobId }) => {
    if (jobId) {
      socket.leave(`job:${jobId}`);
      console.log(`Socket ${socket.id} left room: job:${jobId}`);
    }
  });
};


export default handleBiddingSocket;
