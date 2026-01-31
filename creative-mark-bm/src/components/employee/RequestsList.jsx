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
  FaSort
} from 'react-icons/fa';
import { getEmployeeApplications } from '../../services/employeeDashboardService';

const RequestsList = ({ statusFilter = 'all', assignedFilter = 'all', onRequestSelect, onRequestAssign }) => {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadRequests();
  }, [statusFilter, assignedFilter, currentPage, searchTerm, sortBy, sortOrder]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      

      const filters = {
        status: statusFilter,
        assignedTo: assignedFilter,
        page: currentPage,
        limit: 10
      };

      const response = await getEmployeeApplications(filters);
      setRequests(response.data);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      console.error('Error loading requests:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Submitted':
        return <FaFileAlt className="text-blue-600" />;
      case 'Under Review':
        return <FaClock className="text-yellow-600" />;
      case 'In Progress':
        return <FaHourglassHalf className="text-orange-600" />;
      case 'Completed':
        return <FaCheckCircle className="text-green-600" />;
      case 'Cancelled':
        return <FaTimesCircle className="text-red-600" />;
      case 'On Hold':
        return <FaExclamationTriangle className="text-yellow-600" />;
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
      case 'On Hold':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
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

  const filteredRequests = requests.filter(request =>
    request.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.client?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <FaSpinner className="animate-spin text-4xl text-green-600" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-16 px-8">
        <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-6" />
        <h3 className="text-2xl font-light text-gray-900 mb-3">No Requests Found</h3>
        <p className="text-gray-500 mb-8 font-light">No requests match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="px-8 py-8">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by request number, type, or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 focus:border-green-600 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-4 py-3 border-2 border-gray-300 focus:border-green-600 focus:outline-none"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="priority-desc">High Priority First</option>
            <option value="status-asc">Status A-Z</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-6">
        {filteredRequests.map((request) => (
          <div
            key={request._id}
            className="bg-white border border-gray-200 p-8 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-green-50 border border-green-200">
                    {getStatusIcon(request.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-medium text-gray-900">
                        {request.type || 'Service Request'}
                      </h3>
                      <span className={`inline-block text-sm font-medium px-3 py-1 border ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      <span className={`inline-block text-xs font-medium px-2 py-1 ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-600">
                      Request #{request.requestNumber}
                    </p>
                  </div>
                </div>

                {/* Client and Request Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div className="border-l-4 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Client</p>
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900 flex items-center">
                        <FaUser className="mr-2 text-gray-400" />
                        {request.client?.name || 'N/A'}
                      </p>
                      {request.client?.email && (
                        <p className="text-sm text-gray-600 flex items-center">
                          {request.client.email}
                        </p>
                      )}
                      {request.client?.phone && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <FaPhone className="mr-2 text-gray-400" />
                          {request.client.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-l-4 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Progress</p>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 h-2">
                        <div
                          className="bg-green-600 h-2 transition-all duration-300"
                          style={{ width: `${request.progressPercentage || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 min-w-12">
                        {request.progressPercentage || 0}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{request.currentStep}</p>
                  </div>

                  <div className="border-l-4 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Timeline</p>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-700">
                        Created: {formatDate(request.createdAt)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Updated: {formatDate(request.lastActivity || request.updatedAt)}
                      </p>
                      {request.assignedTo && (
                        <p className="text-sm text-green-600 flex items-center">
                          <FaUserCheck className="mr-2" />
                          Assigned to {request.assignedTo.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {request.description && (
                  <div className="mb-6 border-l-4 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {request.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="ml-8 flex flex-col space-y-3">
                <button
                  onClick={() => onRequestSelect(request)}
                  className="flex items-center px-6 py-3 bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
                >
                  <FaEye className="mr-2" />
                  View Details
                </button>
                
                {!request.assignedTo && (
                  <button
                    onClick={() => onRequestAssign(request)}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                  >
                    <FaUserCheck className="mr-2" />
                    Assign
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className={`px-4 py-2 border ${
                    currentPage === page
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
