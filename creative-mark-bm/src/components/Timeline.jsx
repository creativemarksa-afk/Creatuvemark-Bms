"use client";

import { useState } from "react";

const Timeline = ({ events = [], currentStatus = "submitted", progressData = null }) => {
  const [expandedEvent, setExpandedEvent] = useState(null);

  // Debug logging
  console.log("Timeline component received events:", events);
  console.log("Timeline component received currentStatus:", currentStatus);
  console.log("Timeline component received progressData:", progressData);

  const getStatusIcon = (status) => {
    switch (status) {
      case "submitted":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case "under_review":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case "approved":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case "in_process":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        );
      case "completed":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case "rejected":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getStatusColor = (status, isActive) => {
    if (isActive) {
      switch (status) {
        case "submitted":
          return "bg-blue-500 text-white";
        case "under_review":
          return "bg-yellow-500 text-white";
        case "approved":
          return "bg-green-500 text-white";
        case "in_process":
          return "bg-purple-500 text-white";
        case "completed":
          return "bg-green-600 text-white";
        case "rejected":
          return "bg-red-500 text-white";
        default:
          return "bg-gray-500 text-white";
      }
    } else {
      return "bg-gray-200 text-gray-600";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusOrder = (status) => {
    const order = {
      "submitted": 1,
      "under_review": 2,
      "approved": 3,
      "in_process": 4,
      "completed": 5,
      "rejected": 6
    };
    return order[status] || 0;
  };

  // Sort events by status order
  const sortedEvents = [...events].sort((a, b) => {
    return getStatusOrder(a.status) - getStatusOrder(b.status);
  });

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Timeline Events</h3>
        <p className="text-gray-500">Timeline events will appear here as your application progresses.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Progress Display */}
      {progressData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Current Progress</h3>
            <span className="text-2xl font-bold text-blue-600">{progressData.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressData.progressPercentage}%` }}
            ></div>
          </div>
          {progressData.note && (
            <p className="text-sm text-gray-600 mt-2">{progressData.note}</p>
          )}
          {progressData.latestUpdate && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {formatDate(progressData.latestUpdate)}
            </p>
          )}
        </div>
      )}
      
      {/* Timeline Events */}
      {sortedEvents.map((event, index) => {
        const isActive = event.status === currentStatus;
        const isCompleted = getStatusOrder(event.status) < getStatusOrder(currentStatus);
        const isLast = index === sortedEvents.length - 1;

        return (
          <div key={index} className="relative">
            {/* Timeline Line */}
            {!isLast && (
              <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
            )}
            
            <div className="flex items-start">
              {/* Status Icon */}
              <div className={`flex-shrink-0 w-12 h-12 ${getStatusColor(event.status, isActive || isCompleted)} flex items-center justify-center`}>
                {getStatusIcon(event.status)}
              </div>
              
              {/* Event Content */}
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                    {String(event.status || '').replace("_", " ").toUpperCase()}
                  </h3>
                  <p className="text-xs text-gray-500">{formatDate(event.createdAt)}</p>
                </div>
                
                {event.note && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">{event.note}</p>
                  </div>
                )}
                
                {event.progress !== undefined && event.progress !== null && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Progress:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${event.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-700">{event.progress}%</span>
                    </div>
                  </div>
                )}
                
                <div className="mt-1">
                  <p className="text-xs text-gray-400">
                    Event ID: {event._id}
                  </p>
                </div>
                
                {event.updatedBy && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Updated by: {typeof event.updatedBy === 'object' 
                        ? (event.updatedBy.fullName || event.updatedBy.email || "System")
                        : "System"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
