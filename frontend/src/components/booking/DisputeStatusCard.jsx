import React from 'react';
import { ShieldAlert, CheckCircle, Clock, Info } from 'lucide-react';

const STATUS_CONFIG = {
  open: {
    label: 'Dispute Open',
    icon: ShieldAlert,
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    iconColor: 'text-red-500',
  },
  under_review: {
    label: 'Under Review',
    icon: Clock,
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    iconColor: 'text-amber-500',
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle,
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-700',
    iconColor: 'text-green-600',
  },
  closed: {
    label: 'Closed',
    icon: Info,
    bg: 'bg-gray-50 border-gray-200',
    text: 'text-gray-700',
    iconColor: 'text-gray-500',
  },
};

import useAuthStore from '../../store/auth/authStore.js';

const DisputeStatusCard = ({ dispute }) => {
  const { user } = useAuthStore();
  if (!dispute) return null;

  const cfg = STATUS_CONFIG[dispute.status] || STATUS_CONFIG.open;
  const StatusIcon = cfg.icon;
  
  const isRaiser = dispute.raisedBy === user?._id;
  const raiserName = isRaiser ? 'You' : (user?.role === 'provider' ? 'The Customer' : 'The Provider');

  let desc = '';
  if (dispute.status === 'open') {
    desc = isRaiser ? 'You have raised a dispute. Our team will review the case shortly.' : `${raiserName} has raised a dispute. Our team will review the case shortly.`;
  } else if (dispute.status === 'under_review') {
    desc = 'An admin is currently reviewing this dispute. Please wait for an update.';
  } else if (dispute.status === 'resolved') {
    desc = 'The dispute has been resolved by our admin team.';
  } else {
    desc = 'This dispute has been closed.';
  }

  return (
    <div className={`border rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4 ${cfg.bg}`}>
      <div className="p-3 rounded-xl bg-white/60 flex-shrink-0">
        <StatusIcon className={`h-6 w-6 ${cfg.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className={`text-base font-black ${cfg.text}`}>{cfg.label}</p>
          <span className="text-xs text-gray-500 font-semibold">
            Raised on {new Date(dispute.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className={`text-sm mt-1 leading-relaxed ${cfg.text} opacity-90`}>{desc}</p>
        
        <div className="mt-4 pt-4 border-t border-black/5 space-y-3">
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              {isRaiser ? 'Your Reason' : `${raiserName}'s Reason`}
            </span>
            <p className="text-sm text-gray-700 bg-white/50 p-3 rounded-lg border border-black/5 italic">
              "{dispute.reason}"
            </p>
          </div>

          {dispute.resolution && (
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Admin Resolution</span>
              <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border border-black/10 font-medium">
                {dispute.resolution}
              </p>
              {dispute.refundIssued && (
                <p className="text-xs font-bold text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Refund Issued: ₹{dispute.refundAmount}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisputeStatusCard;
