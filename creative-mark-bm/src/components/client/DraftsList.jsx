"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaFileAlt, 
  FaClock, 
  FaEdit, 
  FaTrash, 
  FaSpinner,
  FaExclamationTriangle 
} from 'react-icons/fa';


const DraftsList = () => {
  const router = useRouter();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);

 

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStepProgress = (stepNumber, totalSteps = 5) => {
    return Math.round(((stepNumber + 1) / totalSteps) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="text-center py-16 px-8">
        <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-6" />
        <h3 className="text-2xl font-light text-gray-900 mb-3">No Drafts Found</h3>
        <p className="text-gray-500 mb-8 font-light">You don't have any saved drafts yet.</p>
        <button
          onClick={() => router.push('/client/requests')}
          className="bg-blue-600 text-white px-8 py-3 font-medium hover:bg-blue-700 transition-colors"
        >
          Start New Request
        </button>
      </div>
    );
  }

  return (
    <div className="px-8 py-12">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-4xl font-light text-gray-900 mb-3">
            Draft Requests
          </h2>
          <p className="text-gray-600 font-light">Continue your saved draft requests</p>
        </div>
        <button
          onClick={() => router.push('/client/requests')}
          className="bg-blue-600 text-white px-8 py-3 font-medium hover:bg-blue-700 transition-colors"
        >
          Create New Request
        </button>
      </div>

      <div className="space-y-6">
        {drafts.map((draft) => (
          <div
            key={draft._id}
            className="bg-white border border-gray-200 p-8 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-orange-50 border border-orange-200">
                    <FaFileAlt className="text-orange-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      {draft.title || 'Draft Request'}
                    </h3>
                    <span className="inline-block bg-orange-50 text-orange-800 text-sm font-medium px-3 py-1 border border-orange-200">
                      Draft
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="border-l-4 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Service Type</p>
                    <p className="font-medium text-gray-900">
                      {draft.formData?.type || 'Not specified'}
                    </p>
                  </div>
                  <div className="border-l-4 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Current Step</p>
                    <p className="font-medium text-gray-900">
                      {draft.currentStep || 'Personal Details'}
                    </p>
                  </div>
                  <div className="border-l-4 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Progress</p>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 h-2">
                        <div
                          className="bg-blue-600 h-2 transition-all duration-300"
                          style={{ width: `${getStepProgress(draft.stepNumber)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 min-w-12">
                        {getStepProgress(draft.stepNumber)}%
                      </span>
                    </div>
                  </div>
                  <div className="border-l-4 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Last Modified</p>
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-gray-400 text-sm" />
                      <p className="text-sm font-medium text-gray-700">{formatDate(draft.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {draft.formData?.serviceDescription && (
                  <div className="mb-6 border-l-4 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {draft.formData.serviceDescription}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 ml-8">
                <button
                  onClick={() => handleContinueDraft(draft._id)}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                >
                  <FaEdit className="mr-2" />
                  Continue
                </button>
                <button
                  onClick={() => handleDeleteDraft(draft._id)}
                  disabled={deleteLoading === draft._id}
                  className="flex items-center px-6 py-3 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {deleteLoading === draft._id ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    <FaTrash className="mr-2" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {drafts.length > 0 && (
        <div className="mt-12 p-6 bg-yellow-50 border-l-4 border-yellow-400">
          <div className="flex items-start space-x-3">
            <FaExclamationTriangle className="text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Important Note</h4>
              <p className="text-sm text-yellow-700">
                Draft requests are automatically saved as you fill out the form. You can continue 
                from where you left off at any time. Drafts will be kept for 30 days.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftsList;