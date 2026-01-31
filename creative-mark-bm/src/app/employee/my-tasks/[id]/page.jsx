"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaFileAlt,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaBuilding,
  FaUsers,
  FaDollarSign,
  FaHome,
  FaEdit,
  FaSave,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaChartLine,
  FaFlag,
  FaComments,
  FaDownload,
  FaCog
} from "react-icons/fa";
import { 
  getEmployeeApplicationDetails,
  updateEmployeeApplicationData
} from "../../../../services/employeeDashboardService";

export default function TaskDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusData, setStatusData] = useState({
    status: '',
    note: ''
  });

  useEffect(() => {
    if (id) {
      console.log('Loading application details for ID:', id);
      loadApplicationDetails();
    }
  }, [id]);

  const loadApplicationDetails = async () => {
    try {
      setLoading(true);
      setError(null);


      // First try to get detailed application data
      try {
        const response = await getEmployeeApplicationDetails(id);
        console.log('Application details:', response.data);
        setApplication(response.data);
      } catch (detailError) {
        console.log('Detailed API failed, trying basic applications list:', detailError);
        
        // Fallback: get from applications list
      const response = await getEmployeeApplications({ limit: 100 });
        const allApplications = response.data || [];
        const foundApplication = allApplications.find((app) => app._id === id);
        
        if (foundApplication) {
          // Transform the basic application data to match expected structure
          const transformedApplication = {
            ...foundApplication,
            client: foundApplication.client || { name: 'Unknown', email: '', phone: '', nationality: '' },
            timeline: foundApplication.timeline || [],
            documents: foundApplication.documents || [],
            payment: foundApplication.payment || null,
            externalCompaniesDetails: foundApplication.externalCompaniesDetails || [],
            familyMembers: foundApplication.familyMembers || []
          };
          setApplication(transformedApplication);
      } else {
          setError("Application not found");
        }
      }
    } catch (error) {
      console.error('Error loading application details:', error);
      setError(error.message || 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      
      // Update status via the backend API
      const response = await updateEmployeeApplicationData(id, { 
        status: statusData.status, 
        note: statusData.note 
      });
      
      // Update local state with the complete updated application from backend
      setApplication(response.data);
      
      setShowStatusModal(false);
      setStatusData({ status: '', note: '' });
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'under_review':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'in_process':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'completed':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <FaFileAlt className="h-4 w-4" />;
      case 'under_review':
        return <FaEye className="h-4 w-4" />;
      case 'approved':
        return <FaCheckCircle className="h-4 w-4" />;
      case 'in_process':
        return <FaCog className="h-4 w-4" />;
      case 'completed':
        return <FaCheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <FaExclamationTriangle className="h-4 w-4" />;
      default:
        return <FaFileAlt className="h-4 w-4" />;
    }
  };

  const getProgressPercentage = () => {
    if (!application?.timeline?.length) return 0;
    const latestEntry = application.timeline[0];
    return latestEntry.progress || 0;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-emerald-600 mb-4" />
          <p className="text-xl text-gray-800 font-semibold">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-5xl text-red-500 mb-4" />
          <p className="text-xl text-red-600 mb-4">{error}</p>
        <button
            onClick={() => router.push('/employee/my-tasks')}
            className="bg-emerald-600 text-white px-6 py-3 hover:bg-emerald-700 transition-colors"
        >
            Back to Tasks
        </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaFileAlt className="text-5xl text-gray-400 mb-4" />
          <p className="text-xl text-gray-600">Application not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/employee/my-tasks')}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <FaArrowLeft className="text-lg" />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Task Details
                </h1>
                <p className="text-lg text-gray-600">
                  {application.serviceType} Application - #{application._id.slice(-8)}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setShowStatusModal(true)}
                className="flex items-center justify-center px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md"
              >
                <FaEdit className="mr-2" />
                Update Status
              </button>
            </div>
          </div>
        </div>

        {/* Status and Progress Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
              {getStatusIcon(application.status)}
            </div>
            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium border ${getStatusColor(application.status)}`}>
              {application.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
              <FaChartLine className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-2">
              {getProgressPercentage() || 0}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage() || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Created</h3>
              <FaCalendarAlt className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-gray-600">{formatDate(application.createdAt)}</p>
            {application.approvedAt && (
              <p className="text-sm text-gray-500 mt-1">
                Completed: {formatDate(application.approvedAt)}
              </p>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Application Details */}
          <div className="xl:col-span-2 space-y-6">
            {/* Client Information */}
            <div className="card-modern">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-xl font-semibold text-gray-900">Client Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <FaUser className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{application.client.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{application.client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaPhone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{application.client.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaGlobe className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Nationality</p>
                      <p className="font-medium text-gray-900">{application.client.nationality || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="card-modern">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Service Type</p>
                    <p className="font-medium text-gray-900 capitalize">{application.serviceType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Partner Type</p>
                    <p className="font-medium text-gray-900 capitalize">{application.partnerType || 'N/A'}</p>
                  </div>
                  {application.projectEstimatedValue && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Project Value</p>
                      <p className="font-medium text-gray-900">${application.projectEstimatedValue.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Virtual Office</p>
                    <p className="font-medium text-gray-900">{application.needVirtualOffice ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {application.externalCompaniesDetails?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">External Companies</h3>
                    <div className="space-y-3">
                      {application.externalCompaniesDetails.map((company, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Company Name</p>
                              <p className="font-medium text-gray-900">{company.companyName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Country</p>
                              <p className="font-medium text-gray-900">{company.country}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Share Percentage</p>
                              <p className="font-medium text-gray-900">{company.sharePercentage}%</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {application.familyMembers?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Family Members</h3>
                    <div className="space-y-3">
                      {application.familyMembers.map((member, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Name</p>
                              <p className="font-medium text-gray-900">{member.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Relation</p>
                              <p className="font-medium text-gray-900 capitalize">{member.relation}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Passport No</p>
                              <p className="font-medium text-gray-900">{member.passportNo}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            {application.documents?.length > 0 && (
              <div className="card-modern">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {application.documents.map((doc) => (
                      <div key={doc._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-200">
                        <div className="flex items-center space-x-3">
                          <FaFileAlt className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <p className="text-sm text-gray-500">{doc.type}</p>
                          </div>
                        </div>
                        <button className="text-emerald-600 hover:text-emerald-700">
                          <FaDownload className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            <div className="card-modern">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <h2 className="text-xl font-semibold text-gray-900">Activity Timeline</h2>
              </div>
              <div className="p-6">
                {application.timeline?.length > 0 ? (
                  <div className="space-y-4">
                    {application.timeline.map((entry) => (
                      <div key={entry._id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            entry.status === 'completed' ? 'bg-green-100' :
                            entry.status === 'in_process' ? 'bg-orange-100' :
                            entry.status === 'rejected' ? 'bg-red-100' :
                            'bg-blue-100'
                          }`}>
                            {getStatusIcon(entry.status)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {entry.note}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(entry.createdAt)} by {entry.updatedBy?.name || 'System'}
                          </p>
                          {entry.progress && !isNaN(entry.progress) && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{entry.progress || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div 
                                  className="bg-emerald-500 h-1 rounded-full"
                                  style={{ width: `${entry.progress || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaComments className="text-4xl text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No timeline entries yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
            </div>
          </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusData.status}
                  onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="in_process">In Process</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <textarea
                  value={statusData.note}
                  onChange={(e) => setStatusData({ ...statusData, note: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Add a note about this status change..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || !statusData.status}
                className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? <FaSpinner className="animate-spin" /> : 'Update'}
              </button>
            </div>
          </div>
            </div>
          )}

    </div>
  );
}
