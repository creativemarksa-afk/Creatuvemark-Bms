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
  FaDownload,
  FaFilePdf,
  FaFileWord,
  FaImage,
  FaFile,
  FaEye
} from 'react-icons/fa';
import {
  getApplication
} from '../../services/applicationService';

const RequestDetails = ({ requestId, request: initialRequest, onClose, onAssign }) => {
  const router = useRouter();
  const [request, setRequest] = useState(initialRequest);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(!initialRequest);
  const [formData, setFormData] = useState({});
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
  const [downloadingDoc, setDownloadingDoc] = useState(null);

  useEffect(() => {
    if (requestId && !initialRequest) {
      loadRequestDetails();
    }
  }, [requestId, initialRequest]);

  const loadRequestDetails = async () => {
    try {
      setLoading(true);
      

      const response = await getApplication(requestId);
      
      if (response.success && response.data) {
        const application = response.data;
        setRequest(application);
        setTimeline(application.timeline || []);
        setFormData(application.formData || {});
        
        // Initialize status form with current values
        setStatusFormData({
          status: application.status?.current || application.status || '',
          currentStep: application.currentStep || '',
          note: '',
          progressPercentage: application.progressPercentage || 0
        });
      } else {
        console.error('Invalid response:', response);
        alert('Failed to load application details');
      }
    } catch (error) {
      console.error('Error loading request details:', error);
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

  const getFileIcon = (fileType) => {
    if (!fileType || typeof fileType !== 'string') return <FaFile className="text-gray-500" />;
    
    const lowerFileType = fileType.toLowerCase();
    if (lowerFileType.includes('pdf')) return <FaFilePdf className="text-red-500" />;
    if (lowerFileType.includes('word') || lowerFileType.includes('document')) return <FaFileWord className="text-blue-500" />;
    if (lowerFileType.includes('image') || lowerFileType.includes('jpg') || lowerFileType.includes('jpeg') || lowerFileType.includes('png')) return <FaImage className="text-green-500" />;
    return <FaFile className="text-gray-500" />;
  };

  const formatStatus = (status) => {
    const currentStatus = status?.current || status;
    switch (currentStatus) {
      case 'submitted':
        return 'Submitted';
      case 'under_review':
        return 'Under Review';
      case 'in_process':
        return 'In Process';
      case 'approved':
        return 'Approved';
      case 'completed':
        return 'Completed';
      default:
        return currentStatus || 'Unknown';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadDocument = (doc) => {
    if (!doc.fileUrl) {
      console.error('No file URL available for document:', doc);
      alert('File URL not available');
      return;
    }
  
    console.log('Downloading document:', {
      type: doc.type,
      fileUrl: doc.fileUrl,
      createdAt: doc.createdAt
    });
  
    // Create a link and set correct filename with extension
    const link = document.createElement("a");
    link.href = doc.fileUrl;
    
    // Use type with extension
    link.download = `${doc.type || 'document'}.pdf`; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  

  const handleViewDocument = (doc) => {
    if (!doc.fileUrl) {
      console.error('No file URL available for document:', doc);
      alert('File URL not available');
      return;
    }
  
    console.log('Viewing document:', {
      type: doc.type,
      fileUrl: doc.fileUrl,
      createdAt: doc.createdAt
    });
  
    // Open in new tab (browser will handle PDF rendering)
    window.open(doc.fileUrl, "_blank");
  };
  
  

  const getStatusIcon = (status) => {
    const currentStatus = status?.current || status;
    switch (currentStatus) {
      case 'submitted':
        return <FaFileAlt className="text-blue-600" />;
      case 'under_review':
        return <FaClock className="text-yellow-600" />;
      case 'in_process':
        return <FaSpinner className="text-orange-600" />;
      case 'approved':
        return <FaCheckCircle className="text-green-600" />;
      case 'completed':
        return <FaCheckCircle className="text-green-600" />;
      default:
        return <FaClock className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    const currentStatus = status?.current || status;
    switch (currentStatus) {
      case 'submitted':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'under_review':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'in_process':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'approved':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'completed':
        return 'bg-green-50 text-green-800 border-green-200';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FaSpinner className="animate-spin text-white text-2xl" />
          </div>
          <p className="text-xl text-gray-800 font-bold">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <FaExclamationTriangle className="text-3xl text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Request Not Found</h2>
          <p className="text-gray-600 mb-6 font-medium">The request you are looking for does not exist.</p>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 font-medium text-sm hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
          >
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onClose}
            className="flex items-center text-emerald-600 hover:text-emerald-700 mb-6 font-medium text-sm transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Requests
          </button>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Request Details</h1>
                <div className="flex items-center space-x-4">
                  <p className="text-base text-gray-600 font-medium">Request #{request.requestNumber}</p>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg">
                      {getStatusIcon(request.status)}
                    </div>
                    <span className={`px-4 py-2 text-sm font-medium border rounded-full ${getStatusColor(request.status)}`}>
                      {formatStatus(request.status)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {(request.status?.current || request.status) === 'submitted' && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={updating}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md"
                    >
                      <FaCheckCircle className="mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md"
                    >
                      <FaTimesCircle className="mr-2" />
                      Reject
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setShowStatusForm(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md"
                >
                  <FaEdit className="mr-2" />
                  Update Status
                </button>
                
                
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Information</h2>
              
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
                      <p className="text-sm font-medium text-gray-500">Nationality</p>
                      <p className="text-lg font-semibold text-gray-900">{request.client?.nationality || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Request Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Service Type</label>
                  <p className="text-lg font-bold text-gray-900">{request.serviceDetails?.servicetype}</p>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Priority</label>
                  <p className="text-lg font-bold text-gray-900">{request.serviceDetails?.priority}</p>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Current Step</label>
                  <p className="text-lg font-bold text-gray-900">{request.serviceDetails?.currentStep}</p>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Submitted</label>
                  <p className="text-lg font-bold text-gray-900">{formatDate(request.serviceDetails?.createdAt)}</p>
                </div>
              </div>

              {request.description && (
                <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
                  <p className="text-base text-gray-700 leading-relaxed">{request.description}</p>
                </div>
              )}
            </div>

            {/* Documents Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Uploaded Documents</h2>
              
              {request.documents && request.documents.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600">
                      {request.documents.length} document(s) uploaded
                    </p>
                    <button
                      onClick={() => {
                        // Download all documents as a zip (future enhancement)
                        alert('Bulk download feature coming soon!');
                      }}
                      className="flex items-center px-3 py-2 text-sm bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
                    >
                      <FaDownload className="mr-2" />
                      Download All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {request.documents.map((doc, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex-shrink-0 mt-1">
                              {getFileIcon(doc.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {doc.type || 'Document'}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {doc.type || 'General'}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Uploaded: {formatDate(doc.createdAt)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-3">
                            <button
                              onClick={() => handleViewDocument(doc)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View document"
                            >
                              <FaEye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadDocument(doc)}
                              disabled={downloadingDoc === (doc._id || doc.type)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                              title="Download document"
                            >
                              {downloadingDoc === (doc._id || doc.type) ? (
                                <FaSpinner className="h-4 w-4 animate-spin" />
                              ) : (
                                <FaDownload className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                console.log('Testing URL accessibility:', doc.fileUrl);
                                fetch(doc.fileUrl, { method: 'HEAD' })
                                  .then(response => {
                                    console.log('URL accessibility test:', {
                                      status: response.status,
                                      statusText: response.statusText,
                                      url: doc.fileUrl
                                    });
                                    if (response.ok) {
                                      alert('URL is accessible!');
                                    } else {
                                      alert(`URL not accessible: ${response.status} ${response.statusText}`);
                                    }
                                  })
                                  .catch(error => {
                                    console.error('URL accessibility test failed:', error);
                                    alert('URL accessibility test failed: ' + error.message);
                                  });
                              }}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                              title="Test URL accessibility"
                            >
                              <FaFileAlt className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {doc.isVerified !== undefined && (
                          <div className="mt-3 flex items-center">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              doc.isVerified 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {doc.isVerified ? (
                                <>
                                  <FaCheckCircle className="mr-1 h-3 w-3" />
                                  Verified
                                </>
                              ) : (
                                <>
                                  <FaClock className="mr-1 h-3 w-3" />
                                  Pending Verification
                                </>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <FaFileAlt className="text-2xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Documents Uploaded</h3>
                  <p className="text-gray-600 font-medium">
                    This request doesn't have any uploaded documents yet.
                  </p>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Progress</h2>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span className="text-lg font-semibold text-green-600">{request.progressPercentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 h-3 rounded-full">
                  <div
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 h-3 transition-all duration-500 rounded-full"
                    style={{ width: `${request.progressPercentage || 0}%` }}
                  />
                </div>
              </div>

              {request.assignedTo && (
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Assigned To</label>
                  <p className="text-lg font-bold text-emerald-900">{request.assignedTo.name}</p>
                  <p className="text-sm text-emerald-700">{request.assignedTo.email}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            {timeline.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Timeline</h2>
                
                <div className="space-y-4">
                  {timeline.map((entry, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center rounded-lg border border-emerald-200">
                          <FaClock className="w-5 h-5 text-emerald-600" />
                        </div>
                      </div>
                      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-bold text-gray-900">{entry.stage}</h3>
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
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    if (request.documents && request.documents.length > 0) {
                      // Download all documents
                      request.documents.forEach((doc, index) => {
                        setTimeout(() => {
                          handleDownloadDocument(doc);
                        }, index * 500); // Stagger downloads
                      });
                    } else {
                      alert('No documents available for download.');
                    }
                  }}
                  disabled={!request.documents || request.documents.length === 0}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-emerald-700 hover:text-white hover:border-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm hover:shadow-md"
                >
                  <FaDownload className="mr-2" />
                  Download All Documents
                </button>
                
                <button 
                  onClick={() => {
                    if (formData && Object.keys(formData).length > 0) {
                      // Create a downloadable JSON file of form data
                      const dataStr = JSON.stringify(formData, null, 2);
                      const dataBlob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `request-${request.requestNumber}-form-data.json`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    } else {
                      alert('No form data available.');
                    }
                  }}
                  disabled={!formData || Object.keys(formData).length === 0}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-emerald-700 hover:text-white hover:border-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm hover:shadow-md"
                >
                  <FaFileAlt className="mr-2" />
                  Export Form Data
                </button>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Internal Notes</h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {request.internalNotes?.map((note, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
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
    <div className="bg-white p-6 max-w-md w-full mx-4 rounded-xl shadow-lg">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Update Request Status</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={statusFormData.status}
            onChange={(e) => setStatusFormData(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-200"
          >
            {statusOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
          <textarea
            value={statusFormData.note}
            onChange={(e) => setStatusFormData(prev => ({ ...prev, note: e.target.value }))}
            rows="3"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-200"
            placeholder="Add a note about this update..."
          />
        </div>
      </div>
      
      <div className="flex space-x-3 mt-6">
        <button
          onClick={handleStatusUpdate}
          disabled={updating}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
        >
          {updating ? <FaSpinner className="animate-spin mx-auto" /> : 'Update'}
        </button>
        <button
          onClick={() => setShowStatusForm(false)}
          className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 hover:from-gray-700 hover:to-gray-800 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
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
          <div className="bg-white p-6 max-w-md w-full mx-4 rounded-xl shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Request</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Rejection</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500 transition-all duration-200"
                placeholder="Please provide a detailed reason for rejecting this request..."
                required
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleReject}
                disabled={updating || !rejectReason.trim()}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 hover:from-red-700 hover:to-red-800 disabled:opacity-50 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
              >
                {updating ? <FaSpinner className="animate-spin mx-auto" /> : 'Reject Request'}
              </button>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectReason('');
                }}
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 hover:from-gray-700 hover:to-gray-800 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
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
