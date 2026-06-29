/**
 * pages/provider/VerificationUpload.jsx — Provider Verification Document Upload
 *
 * Responsibilities:
 *  - Fetch current verification status from GET /providers/verification/status
 *  - Show status badge (not_submitted / pending / approved / rejected)
 *  - If rejected: show admin rejection note prominently
 *  - File inputs for Aadhaar, PAN, and optional other docs
 *  - Submit via POST /providers/verification (multipart/form-data)
 *  - Upload progress bar
 *  - Disable re-submit when status is pending or approved
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, ShieldX, Clock, Upload, FileText,
  CheckCircle, AlertCircle, Loader2, X, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as providerService from '../../services/providers/provider.service.js';

// ── Status Badge ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  not_submitted: {
    label: 'Not Submitted',
    icon: Upload,
    bg: 'bg-gray-50 border-gray-200',
    text: 'text-gray-600',
    iconColor: 'text-gray-400',
    desc: 'Upload your documents to get verified and unlock more opportunities.',
  },
  pending: {
    label: 'Under Review',
    icon: Clock,
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    iconColor: 'text-amber-500',
    desc: 'Your documents are being reviewed by our team. This usually takes 1-2 business days.',
  },
  approved: {
    label: 'Verified ✓',
    icon: ShieldCheck,
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-700',
    iconColor: 'text-green-600',
    desc: 'Your account is verified! You now have a verified badge on your profile.',
  },
  rejected: {
    label: 'Rejected',
    icon: ShieldX,
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    iconColor: 'text-red-500',
    desc: 'Your verification was rejected. Please review the admin note below and re-submit.',
  },
};

// ── File Picker Row ───────────────────────────────────────────────────────
const FilePicker = ({ id, label, required, accept, onChange, file, disabled }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className={`relative flex items-center gap-3 border rounded-xl px-4 py-3 transition
      ${file ? 'border-green-400 bg-green-50/30' : 'border-gray-200 bg-gray-50/50'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300 cursor-pointer'}
    `}>
      <FileText className={`h-5 w-5 flex-shrink-0 ${file ? 'text-green-600' : 'text-gray-400'}`} />
      <span className={`text-sm flex-1 truncate ${file ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>
        {file ? file.name : `Choose ${label} file…`}
      </span>
      {file && !disabled && (
        <button type="button" onClick={() => onChange(null)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
          <X className="h-4 w-4" />
        </button>
      )}
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
    </div>
    <p className="text-[10px] text-gray-400 font-medium">JPG, PNG or PDF · Max 5 MB</p>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────
const VerificationUpload = () => {
  const [status, setStatus] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [aadhaar, setAadhaar] = useState(null);
  const [pan, setPan] = useState(null);
  const [other, setOther] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await providerService.getVerificationStatus();
      setStatus(res.data.data.status);
      setAdminNote(res.data.data.adminNote || '');
    } catch (err) {
      console.error(err);
      setStatus('not_submitted');
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const canSubmit = status === 'not_submitted' || status === 'rejected';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!aadhaar && !pan && !other) {
      toast.error('Please select at least one document to upload.');
      return;
    }

    const formData = new FormData();
    if (aadhaar) formData.append('aadhaar', aadhaar);
    if (pan) formData.append('pan', pan);
    if (other) formData.append('other', other);

    setUploading(true);
    setProgress(0);
    try {
      await providerService.submitVerification(formData, {
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      toast.success('Documents submitted! Our team will review within 1-2 business days.');
      setAadhaar(null);
      setPan(null);
      setOther(null);
      fetchStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_submitted;
  const StatusIcon = cfg.icon;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Provider Verification</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload your KYC documents to get a verified badge on your profile and boost trust with customers.
        </p>
      </div>

      {/* Status Card */}
      {loadingStatus ? (
        <div className="flex items-center justify-center h-28 bg-white border border-gray-200 rounded-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className={`border rounded-2xl p-6 flex items-start gap-4 ${cfg.bg}`}>
          <div className={`p-3 rounded-xl bg-white/60 flex-shrink-0`}>
            <StatusIcon className={`h-6 w-6 ${cfg.iconColor}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-base font-black ${cfg.text}`}>{cfg.label}</p>
              {status !== 'not_submitted' && (
                <button
                  onClick={fetchStatus}
                  className="text-gray-400 hover:text-gray-600 transition"
                  title="Refresh status"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{cfg.desc}</p>
          </div>
        </div>
      )}

      {/* Admin Rejection Note */}
      {status === 'rejected' && adminNote && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700 mb-1">Admin Note</p>
            <p className="text-sm text-red-600 leading-relaxed">{adminNote}</p>
          </div>
        </div>
      )}

      {/* Upload Form */}
      {!loadingStatus && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6"
        >
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Upload className="h-4 w-4 text-green-600" />
              {canSubmit ? 'Upload Documents' : 'Submitted Documents'}
            </h2>
            <p className="text-xs text-gray-400">
              {canSubmit
                ? 'Upload at least one document. Aadhaar + PAN gives faster approval.'
                : 'Your documents have been submitted. Re-submission is available if rejected.'}
            </p>
          </div>

          <div className="space-y-4">
            <FilePicker
              id="upload-aadhaar"
              label="Aadhaar Card"
              required={false}
              accept=".jpg,.jpeg,.png,.pdf"
              file={aadhaar}
              onChange={setAadhaar}
              disabled={!canSubmit || uploading}
            />
            <FilePicker
              id="upload-pan"
              label="PAN Card"
              required={false}
              accept=".jpg,.jpeg,.png,.pdf"
              file={pan}
              onChange={setPan}
              disabled={!canSubmit || uploading}
            />
            <FilePicker
              id="upload-other"
              label="Other Document"
              required={false}
              accept=".jpg,.jpeg,.png,.pdf"
              file={other}
              onChange={setOther}
              disabled={!canSubmit || uploading}
            />
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-gray-500">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            id="submit-verification-btn"
            disabled={!canSubmit || uploading || (!aadhaar && !pan && !other)}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading Documents…
              </>
            ) : status === 'pending' ? (
              <>
                <Clock className="h-4 w-4" />
                Submission Under Review
              </>
            ) : status === 'approved' ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Already Verified
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Submit for Verification
              </>
            )}
          </button>

          {status === 'pending' && (
            <p className="text-center text-xs text-amber-600 font-semibold">
              ⏳ Your submission is being reviewed. You'll be notified of the outcome.
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default VerificationUpload;

