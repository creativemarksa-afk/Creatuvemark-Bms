"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaFileAlt,
  FaClock,
  FaUser,
  FaPhone,
  FaSpinner,
  FaExclamationTriangle,
  FaEye,
  FaUserCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaSearch,
  FaFilter,
  FaSort,
  FaTrash,
  FaTrashAlt
} from 'react-icons/fa';
import { getAllApplications, deleteApplication } from '../../services/applicationService';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n/TranslationContext';
import Swal from 'sweetalert2';

const RequestsList = ({ statusFilter = 'all', assignedFilter = 'all', onRequestSelect, onRequestAssign, refreshTrigger }) => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadRequests();
  }, [statusFilter, assignedFilter, currentPage, searchTerm, sortBy, sortOrder, refreshTrigger]);


  const loadRequests = async () => {
    try {
      setLoading(true);
    

      const response = await getAllApplications();
      
            if (response.success && response.data) {
              let applications = response.data;
            
        
        // Filter by status if needed
        if (statusFilter !== 'all') {
          applications = applications.filter(app => {
            const currentStatus = app.status?.current || app.status;
            switch (statusFilter) {
              case 'Submitted':
                return currentStatus === 'submitted';
              case 'In Progress':
                return currentStatus === 'under_review' || currentStatus === 'in_process';
              default:
                return true;
            }
          });
        }
        
        setRequests(applications);
        setTotalPages(1); // For now, we'll show all applications without pagination
      } else {
        setRequests([]);
        setTotalPages(1);
      }
    } catch (error) {
      setRequests([]);
      setTotalPages(1);
      
      // Show user-friendly error message
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const currentStatus = status?.current || status;
    switch (currentStatus) {
      case 'submitted':
        return <FaFileAlt className="text-blue-600" />;
      case 'under_review':
        return <FaClock className="text-yellow-600" />;
      case 'in_process':
        return <FaHourglassHalf className="text-orange-600" />;
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

  const formatStatus = (status) => {
    const currentStatus = status?.current || status;
    switch (currentStatus) {
      case 'submitted':
        return t('admin.requests.statuses.submitted');
      case 'under_review':
        return t('admin.requests.statuses.underReview');
      case 'in_process':
        return t('admin.requests.statuses.inProcess');
      case 'approved':
        return t('admin.requests.statuses.approved');
      case 'completed':
        return t('admin.requests.statuses.completed');
      default:
        return currentStatus || t('admin.requests.statuses.unknown');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border border-orange-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-800 border border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteRequest = async (request) => {
    if (!currentUser || !["admin", "staff"].includes(currentUser.role)) {
      Swal.fire({
        title: t('admin.requests.alerts.permissionDenied'),
        text: t('admin.requests.alerts.permissionDeniedMessage'),
        icon: 'error',
        confirmButtonColor: '#dc2626',
        confirmButtonText: t('admin.requests.alerts.ok'),
        background: '#ffffff',
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
          title: 'text-gray-900 font-semibold',
          content: 'text-gray-600'
        }
      });
      return;
    }

    const result = await Swal.fire({
      title: t('admin.requests.alerts.deleteApplication'),
      html: `
        <div class="text-left">
          <p class="text-gray-700 mb-4">
            Are you sure you want to delete this <strong>${request.serviceDetails?.serviceType || 'application'}</strong> request?
          </p>
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p class="text-red-800 font-semibold mb-2">⚠️ This action cannot be undone and will permanently remove:</p>
            <ul class="text-red-700 text-sm space-y-1">
              <li>• The application</li>
              <li>• All uploaded documents</li>
              <li>• Timeline entries</li>
              <li>• Payment records</li>
            </ul>
          </div>
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p class="text-gray-600 text-sm">
              <strong>Application ID:</strong> ${request.applicationId}
            </p>
            <p class="text-gray-600 text-sm">
              <strong>Client:</strong> ${request.client?.name || 'N/A'}
            </p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('admin.requests.actions.delete'),
      cancelButtonText: t('admin.requests.alerts.cancel'),
      reverseButtons: true,
      background: '#ffffff',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-gray-900 font-semibold',
        content: 'text-gray-600',
        confirmButton: 'rounded-lg font-medium px-6 py-3',
        cancelButton: 'rounded-lg font-medium px-6 py-3'
      }
    });

    if (result.isConfirmed) {
      try {
        // Check if user is available
        if (!currentUser || (!currentUser.id && !currentUser._id)) {
          throw new Error('User information not available. Please refresh the page and try again.');
        }

        setDeletingId(request.applicationId);
        
        // Show loading alert
        Swal.fire({
          title: 'Deleting Application...',
          text: 'Please wait while we delete the application.',
          icon: 'info',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          background: '#ffffff',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-gray-900 font-semibold'
          },
          didOpen: () => {
            Swal.showLoading();
          }
        });

        await deleteApplication(request.applicationId, currentUser.id || currentUser._id);
        
        // Remove the deleted request from the local state
        setRequests(prev => prev.filter(req => req.applicationId !== request.applicationId));
        
        // Show success alert
        Swal.fire({
          title: t('admin.requests.alerts.deleteApplication'),
          text: t('admin.requests.alerts.deleteApplicationMessage'),
          icon: 'success',
          confirmButtonColor: '#059669',
          confirmButtonText: t('admin.requests.alerts.ok'),
          background: '#ffffff',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-gray-900 font-semibold',
            content: 'text-gray-600',
            confirmButton: 'rounded-lg font-medium px-6 py-3'
          }
        });
      } catch (error) {
        console.error('Error deleting application:', error);
        Swal.fire({
          title: t('admin.requests.alerts.deletionFailed'),
          text: t('admin.requests.alerts.deletionFailedMessage'),
          icon: 'error',
          confirmButtonColor: '#dc2626',
          confirmButtonText: t('admin.requests.alerts.ok'),
          background: '#ffffff',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-gray-900 font-semibold',
            content: 'text-gray-600',
            confirmButton: 'rounded-lg font-medium px-6 py-3'
          }
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  const filteredRequests = requests.filter(request =>
    request.applicationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.serviceDetails?.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.client?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 sm:py-16">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#242021] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
            <FaSpinner className="animate-spin text-white text-lg sm:text-xl" />
          </div>
          <p className="text-sm sm:text-base text-gray-600 font-medium">Loading requests...</p>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 px-6 sm:px-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm">
          <FaFileAlt className="text-2xl sm:text-3xl text-gray-400" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No Requests Found</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 font-medium">No requests match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex-1">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search by request number, type, or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-200/50 rounded-lg sm:rounded-xl focus:border-[#ffd17a] focus:ring-2 focus:ring-[#ffd17a]/20 focus:outline-none transition-all duration-200 text-sm sm:text-base"
            />
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200/50 rounded-lg sm:rounded-xl focus:border-[#ffd17a] focus:ring-2 focus:ring-[#ffd17a]/20 focus:outline-none transition-all duration-200 text-sm sm:text-base"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="priority-desc">High Priority First</option>
            <option value="status-asc">Status A-Z</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4 sm:space-y-6">
        {filteredRequests.map((request) => (
          <div
            key={request.applicationId}
            className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-xl hover:border-[#ffd17a]/30 transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
              <div className="flex-1">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="p-3 bg-gradient-to-br from-[#ffd17a]/10 to-[#ffd17a]/20 border border-[#ffd17a]/20 rounded-lg">
                    {getStatusIcon(request.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                        {request.serviceDetails?.serviceType || t('admin.requests.serviceTypes.businessRegistration')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-block text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 border rounded-full ${getStatusColor(request.status)}`}>
                          {formatStatus(request.status)}
                        </span>
                        <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor('Medium')}`}>
                          {t('admin.requests.priorities.medium')}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      Application ID: {request.applicationId}
                    </p>
                  </div>
                </div>

                {/* Client and Request Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="border-l-4 border-[#ffd17a]/30 pl-3 sm:pl-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Client</p>
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-sm sm:text-base font-medium text-gray-900 flex items-center">
                        <FaUser className="mr-2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                        {request.client?.name || 'N/A'}
                      </p>
                      {request.client?.email && (
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                          {request.client.email}
                        </p>
                      )}
                      {request.client?.phone && (
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                          <FaPhone className="mr-2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                          {request.client.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-l-4 border-[#ffd17a]/30 pl-3 sm:pl-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Service Details</p>
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-xs sm:text-sm font-medium text-gray-700">
                        Partner Type: {request.serviceDetails?.partnerType || 'N/A'}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        External Companies: {request.serviceDetails?.externalCompaniesCount || 0}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Virtual Office: {request.serviceDetails?.needVirtualOffice ? t('admin.requests.virtualOffice.yes') : t('admin.requests.virtualOffice.no')}
                      </p>
                    </div>
                  </div>

                  <div className="border-l-4 border-[#ffd17a]/30 pl-3 sm:pl-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Timeline</p>
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-xs sm:text-sm font-medium text-gray-700">
                        Created: {formatDate(request.timestamps?.createdAt || request.createdAt)}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Updated: {formatDate(request.timestamps?.updatedAt || request.updatedAt)}
                      </p>
                      {request.assignedEmployees && request.assignedEmployees.length > 0 && (
                        <p className="text-xs sm:text-sm text-[#ffd17a] flex items-center">
                          <FaUserCheck className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                          Assigned to {request.assignedEmployees.length} employee(s)
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {request.description && (
                  <div className="mb-4 sm:mb-6 border-l-4 border-gray-200/50 pl-3 sm:pl-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Description</p>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                      {request.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3">
                <button
                  onClick={() => onRequestSelect(request)}
                  className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-[#242021] text-white hover:bg-[#242021]/90 transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md group"
                >
                  <FaEye className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">{t('admin.requests.actions.view')}</span>
                </button>
                
                {/* Show assign button if no employees assigned or if assignedEmployees is empty/undefined */}
                {(!request.assignedEmployees || request.assignedEmployees.length === 0) && (
                  <button
                    onClick={() => {
                      console.log('Assign button clicked for request:', request);
                      console.log('assignedEmployees:', request.assignedEmployees);
                      console.log('assignedEmployees length:', request.assignedEmployees?.length);
                      onRequestAssign(request);
                    }}
                    className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-[#ffd17a] text-gray-900 hover:bg-[#ffd17a]/90 transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md group"
                  >
                    <FaUserCheck className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">{t('admin.requests.actions.assign')}</span>
                  </button>
                )}
                
                {/* Show assigned status if employees are assigned */}
                {request.assignedEmployees && request.assignedEmployees.length > 0 && (
                  <div className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#ffd17a]/10 to-[#ffd17a]/20 text-[#ffd17a] border border-[#ffd17a]/20 rounded-lg">
                    <FaUserCheck className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">Assigned ({request.assignedEmployees.length})</span>
                  </div>
                )}

                {/* Delete button - only show for admin/staff */}
                {currentUser && ["admin", "staff"].includes(currentUser.role) && (
                  <button
                    onClick={() => handleDeleteRequest(request)}
                    disabled={deletingId === request.applicationId}
                    className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md group"
                  >
                    {deletingId === request.applicationId ? (
                      <>
                        <FaSpinner className="mr-2 animate-spin w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">Deleting...</span>
                      </>
                    ) : (
                      <>
                        <FaTrashAlt className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">Delete</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 sm:mt-8 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-2 border border-gray-200/50 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 text-sm sm:text-base"
            >
              Previous
            </button>
            
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              const page = currentPage > 3 ? currentPage - 2 + index : index + 1;
              if (page > totalPages) return null;
              
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 sm:px-4 py-2 border rounded-lg transition-all duration-200 text-sm sm:text-base ${
                    currentPage === page
                      ? 'border-[#ffd17a] bg-[#ffd17a] text-gray-900 shadow-sm'
                      : 'border-gray-200/50 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-2 border border-gray-200/50 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 text-sm sm:text-base"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsList;
