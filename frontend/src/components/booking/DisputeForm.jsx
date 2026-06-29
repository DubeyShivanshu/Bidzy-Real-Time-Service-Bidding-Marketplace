import React, { useState } from 'react';
import { AlertTriangle, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as disputeService from '../../services/disputes/dispute.service.js';

const DisputeForm = ({ bookingId, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please enter a reason for the dispute.');
      return;
    }

    setLoading(true);
    try {
      const res = await disputeService.raiseDispute({ bookingId, reason });
      toast.success('Dispute raised successfully.');
      if (onSuccess) onSuccess(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to raise dispute.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-black text-gray-900 mb-2 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        Raise a Dispute
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        If you are unsatisfied with the service or have encountered an issue, you can raise a dispute. Our admin team will review the case and make a decision.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reason" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Reason for Dispute <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            rows="4"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-sm text-gray-800 resize-none disabled:opacity-50"
            placeholder="Please describe the issue in detail..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || !reason.trim()}
          className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Dispute
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default DisputeForm;
