"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaArrowLeft,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaFileAlt,
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaEdit,
  FaUserCheck,
  FaSave,
  FaTimes,
  FaPlus,
  FaDownload
} from 'react-icons/fa';
import {
  getRequestDetails,
  updateRequestStatus,
  approveRequest,
  rejectRequest
} from '../../services/employeeApi';

const RequestDetails = ({ requestId, request: initialRequest, onClose, onAssign }) => {
  const router = useRouter();
  const [request, setRequest] = useState(initialRequest);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(!initialRequest);
  const [updating, setUpdating] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [statusFormData, setStatusFormData] = useState({
    status: '',
    currentStep: '',
    note: '',
    progressPercentage: 0
  });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (requestId && !initialRequest) {
      loadRequestDetails();
    }
  }, [requestId, initialRequest]);

  const loadRequestDetails = async () => {
    try {
      setLoading(true);
      

      const response = await getRequestDetails(requestId);
      console.log(response)
      setRequest(response.request);
      setTimeline(response.timeline);
      

      // Initialize status form with current values
      setStatusFormData({
        status: response.request.status,
        currentStep: response.request.currentStep,
        note: '',
        progressPercentage: response.request.progressPercentage || 0
      });
    } catch (error) {
      console.error('Error loading request details:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      
      const response = await updateRequestStatus(request._id, statusFormData);
      if (response.success) {
        setRequest(response.request);
        setShowStatusForm(false);
        // Reload to get updated timeline
        await loadRequestDetails();
        alert('Request status updated successfully!');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating request status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleApprove = async () => {
    try {
      setUpdating(true);
      
      const response = await approveRequest(request._id, {
        note: 'Request approved for processing'
      });
      
      if (response.success) {
        setRequest(response.request);
        await loadRequestDetails();
        alert('Request approved successfully!');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error approving request. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    try {
      setUpdating(true);
      
      const response = await rejectRequest(request._id, {
        note: rejectReason
      });
      
      if (response.success) {
        setRequest(response.request);
        setShowRejectForm(false);
        await loadRequestDetails();
        alert('Request rejected successfully.');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Submitted':
        return <FaFileAlt className="text-blue-600" />;
      case 'Under Review':
        return <FaClock className="text-yellow-600" />;
      case 'In Progress':
        return <FaSpinner className="text-orange-600" />;
      case 'Completed':
        return <FaCheckCircle className="text-green-600" />;
      case 'Cancelled':
        return <FaTimesCircle className="text-red-600" />;
      default:
        return <FaClock className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Under Review':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'In Progress':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'Completed':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusOptions = [
    'Submitted',
    'Under Review',
    'In Progress',
    'Pending Documents',
    'Pending Payment',
    'Government Processing',
    'External Partner',
    'Quality Check',
    'Ready for Delivery',
    'Completed',
    'On Hold'
  ];

  const stepOptions = [
    'Initial Review',
    'Document Collection',
    'Payment Processing',
    'Government Submission',
    'External Processing',
    'Approval Pending',
    'Final Review',
    'Delivery',
    'Completed'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-green-600 mb-4" />
          <p className="text-xl text-gray-800 font-semibold">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-6xl text-red-600 mb-4" />
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">Request Not Found</h2>
          <p className="text-gray-600 mb-6">The request you are looking for does not exist.</p>
          <button
            onClick={onClose}
            className="bg-green-600 text-white px-6 py-3 font-medium text-sm hover:bg-green-700 transition-colors"
          >
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onClose}
            className="flex items-center text-green-600 hover:text-green-700 mb-6 font-medium text-sm transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Requests
          </button>
          
          <div className="bg-white border border-gray-300 p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-4xl font-semibold text-gray-900 mb-2">Request Details</h1>
                <div className="flex items-center space-x-4">
                  <p className="text-base text-gray-600 font-medium">Request #{request.requestNumber}</p>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100">
                      {getStatusIcon(request.status)}
                    </div>
                    <span className={`px-4 py-2 text-sm font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {request.status === 'Submitted' && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={updating}
                      className="flex items-center px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
                    >
                      <FaCheckCircle className="mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="flex items-center px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                    >
                      <FaTimesCircle className="mr-2" />
                      Reject
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setShowStatusForm(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                >
                  <FaEdit className="mr-2" />
                  Update Status
                </button>
                
                {!request.assignedTo && (
                  <button
                    onClick={() => onAssign(request)}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium"
                  >
                    <FaUserCheck className="mr-2" />
                    Assign
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <div className="bg-white border border-gray-300 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Client Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FaUser className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-lg font-semibold text-gray-900">{request.client?.name || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-lg font-semibold text-gray-900">{request.client?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FaPhone className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-lg font-semibold text-gray-900">{request.client?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <FaMapMarkerAlt className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-lg font-semibold text-gray-900">{request.client?.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Request Information */}
            <div className="bg-white border border-gray-300 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Request Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-100 p-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Service Type</label>
                  <p className="text-lg font-semibold text-gray-900">{request.type}</p>
                </div>
                
                <div className="bg-gray-100 p-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Priority</label>
                  <p className="text-lg font-semibold text-gray-900">{request.priority}</p>
                </div>
                
                <div className="bg-gray-100 p-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Current Step</label>
                  <p className="text-lg font-semibold text-gray-900">{request.currentStep}</p>
                </div>
                
                <div className="bg-gray-100 p-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Submitted</label>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(request.createdAt)}</p>
                </div>
              </div>

              {request.description && (
                <div className="mt-6 bg-gray-100 p-4">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
                  <p className="text-base text-gray-700 leading-relaxed">{request.description}</p>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="bg-white border border-gray-300 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Progress</h2>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span className="text-lg font-semibold text-green-600">{request.progressPercentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 h-3">
                  <div
                    className="bg-green-600 h-3 transition-all duration-500"
                    style={{ width: `${request.progressPercentage || 0}%` }}
                  />
                </div>
              </div>

              {request.assignedTo && (
                <div className="bg-green-100 p-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Assigned To</label>
                  <p className="text-lg font-semibold text-green-900">{request.assignedTo.name}</p>
                  <p className="text-sm text-green-700">{request.assignedTo.email}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            {timeline.length > 0 && (
              <div className="bg-white border border-gray-300 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Timeline</h2>
                
                <div className="space-y-4">
                  {timeline.map((entry, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-100 flex items-center justify-center">
                          <FaClock className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-100 p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{entry.stage}</h3>
                          <time className="text-sm font-medium text-gray-500">{formatDate(entry.createdAt)}</time>
                        </div>
                        {entry.note && (
                          <p className="text-base text-gray-600 leading-relaxed">{entry.note}</p>
                        )}
                        {entry.actor && (
                          <p className="text-sm text-gray-500 mt-2">by {entry.actor.name}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white border border-gray-300 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium text-gray-700 hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors">
                  <FaDownload className="mr-2" />
                  Download Documents
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium text-gray-700 hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors">
                  <FaFileAlt className="mr-2" />
                  View Form Data
                </button>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="bg-white border border-gray-300 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Internal Notes</h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {request.internalNotes?.map((note, index) => (
                  <div key={index} className="bg-gray-100 p-3">
                    <p className="text-sm text-gray-700">{note.note}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(note.addedAt)}
                    </p>
                  </div>
                ))}
                
                {(!request.internalNotes || request.internalNotes.length === 0) && (
                  <p className="text-sm text-gray-500">No internal notes yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Request Status</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFormData.status}
                  onChange={(e) => setStatusFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {statusOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Step</label>
                <select
                  value={statusFormData.currentStep}
                  onChange={(e) => setStatusFormData(prev => ({ ...prev, currentStep: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {stepOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progress ({statusFormData.progressPercentage}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={statusFormData.progressPercentage}
                  onChange={(e) => setStatusFormData(prev => ({ ...prev, progressPercentage: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea
                  value={statusFormData.note}
                  onChange={(e) => setStatusFormData(prev => ({ ...prev, note: e.target.value }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Add a note about this update..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="flex-1 bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {updating ? <FaSpinner className="animate-spin mx-auto" /> : 'Update'}
              </button>
              <button
                onClick={() => setShowStatusForm(false)}
                className="flex-1 bg-gray-600 text-white px-4 py-2 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Request</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Rejection</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Please provide a detailed reason for rejecting this request..."
                required
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleReject}
                disabled={updating || !rejectReason.trim()}
                className="flex-1 bg-red-600 text-white px-4 py-2 hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {updating ? <FaSpinner className="animate-spin mx-auto" /> : 'Reject Request'}
              </button>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectReason('');
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetails;
