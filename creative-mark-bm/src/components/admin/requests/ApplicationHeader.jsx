"use client";

import { forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaCalendarAlt, FaUser, FaFileAlt } from 'react-icons/fa';
import StatusChip from './StatusChip';

const ApplicationHeader = forwardRef(({ 
  application,
  className = '',
  onBack,
  ...props 
}, ref) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/admin/requests');
    }
  };

  const getProgressPercentage = (status) => {
    const currentStatus = status?.current || status;
    switch (currentStatus) {
      case 'completed': return 100;
      case 'in_process': return 80;
      case 'approved': return 60;
      case 'under_review': return 40;
      case 'submitted': return 20;
      case 'rejected': return 0;
      default: return 0;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const progress = getProgressPercentage(application?.status);

  return (
    <div ref={ref} className={`mb-6 sm:mb-8 ${className}`} {...props}>
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4 sm:mb-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 group transition-colors duration-200"
          aria-label="Back to applications"
        >
          <div className="mr-2 p-1 rounded-full group-hover:bg-gray-100 transition-colors duration-200">
            <FaArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-medium">Applications</span>
        </button>
        <span>/</span>
        <span className="text-gray-900 font-medium">Application Details</span>
      </div>

      {/* Modern Header - Matching Admin Dashboard Style */}
      <div className="relative overflow-hidden bg-[#242021] text-white shadow-2xl rounded-xl sm:rounded-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-48 sm:w-64 lg:w-96 h-48 sm:h-64 lg:h-96 bg-[#ffd17a]/10 transform rotate-45 translate-x-16 sm:translate-x-24 lg:translate-x-32 -translate-y-16 sm:-translate-y-24 lg:-translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-[#ffd17a]/10 transform -rotate-45 -translate-x-8 sm:-translate-x-12 lg:-translate-x-16 translate-y-8 sm:translate-y-12 lg:translate-y-16"></div>
        
        <div className="relative p-4 sm:p-6 lg:p-8 xl:p-12">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#ffd17a] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg sm:shadow-xl">
                  <FaFileAlt className="text-lg sm:text-2xl text-[#242021]" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
                    Application Details
                  </h1>
                  <p className="text-[#ffd17a] text-sm sm:text-base lg:text-lg">
                    Creative Mark BMS • Application Management Portal
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 mt-4 sm:mt-6">
                <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg">
                  <FaFileAlt className="text-[#ffd17a] text-xs sm:text-sm lg:text-base" />
                  <span className="text-xs sm:text-sm">ID: {application?.applicationId || application?._id || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg">
                  <FaCalendarAlt className="text-[#ffd17a] text-xs sm:text-sm lg:text-base" />
                  <span className="text-xs sm:text-sm">Submitted: {formatDate(application?.timestamps?.createdAt || application?.createdAt)}</span>
                </div>
                {application?.client && (
                  <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg">
                    <FaUser className="text-[#ffd17a] text-xs sm:text-sm lg:text-base" />
                    <span className="text-xs sm:text-sm">Client: {application.client.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              {/* Status */}
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-[#ffd17a] mb-2 sm:mb-3">Current Status</p>
                <StatusChip status={application?.status} size="large" />
              </div>

              {/* Progress */}
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-[#ffd17a] mb-2 sm:mb-3">Progress</p>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="relative w-24 sm:w-32 h-2 sm:h-3 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#ffd17a] rounded-full transition-all duration-1000 ease-out shadow-sm"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white min-w-[2.5rem] sm:min-w-[3rem]">
                    {progress}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ApplicationHeader.displayName = 'ApplicationHeader';

export default ApplicationHeader;
