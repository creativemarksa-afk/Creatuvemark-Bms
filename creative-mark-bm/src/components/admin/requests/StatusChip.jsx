"use client";

import { FaCheckCircle, FaClock, FaExclamationTriangle, FaSpinner, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';

const StatusChip = ({ status, size = 'default' }) => {
  const getStatusConfig = (status) => {
    const currentStatus = status?.current || status;
    
    switch (currentStatus) {
      case 'submitted':
        return {
          icon: FaClock,
          label: 'Submitted',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          iconClassName: 'text-blue-600'
        };
      case 'under_review':
        return {
          icon: FaSpinner,
          label: 'Under Review',
          className: 'bg-amber-100 text-amber-800 border-amber-200',
          iconClassName: 'text-amber-600 animate-spin'
        };
      case 'approved':
        return {
          icon: FaCheckCircle,
          label: 'Approved',
          className: 'bg-green-100 text-green-800 border-green-200',
          iconClassName: 'text-green-600'
        };
      case 'in_process':
        return {
          icon: FaHourglassHalf,
          label: 'In Process',
          className: 'bg-purple-100 text-purple-800 border-purple-200',
          iconClassName: 'text-purple-600'
        };
      case 'completed':
        return {
          icon: FaCheckCircle,
          label: 'Completed',
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          iconClassName: 'text-emerald-600'
        };
      case 'rejected':
        return {
          icon: FaTimesCircle,
          label: 'Rejected',
          className: 'bg-red-100 text-red-800 border-red-200',
          iconClassName: 'text-red-600'
        };
      default:
        return {
          icon: FaExclamationTriangle,
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          iconClassName: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    default: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  };

  return (
    <span 
      className={`inline-flex items-center gap-2 font-medium rounded-full border ${config.className} ${sizeClasses[size]}`}
      role="status"
      aria-label={`Application status: ${config.label}`}
    >
      <Icon className={`w-4 h-4 ${config.iconClassName}`} />
      {config.label}
    </span>
  );
};

export default StatusChip;
