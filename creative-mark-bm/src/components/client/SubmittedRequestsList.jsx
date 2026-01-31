"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaFileAlt, 
  FaClock, 
  FaEye, 
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaHourglassHalf
} from 'react-icons/fa';
import { getMockApplications } from '../../services/clientService';

const SubmittedRequestsList = () => {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    initializeRequests();
  }, []);

  const initializeRequests = async () => {
    try {
      setLoading(true);
      

      // Load requests
      await loadRequests();
    } catch (error) {
      console.error('Error initializing requests:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get mock applications and convert to request format
      const mockApplications = getMockApplications();
      const submittedRequests = mockApplications.map(app => ({
        _id: app.id,
        requestNumber: `REQ-${app.id}`,
        type: app.serviceType,
        status: app.status === 'submitted' ? 'Submitted' : 
                app.status === 'approved' ? 'Under Review' :
                app.status === 'in_process' ? 'In Progress' : 'Completed',
        progressPercentage: app.status === 'submitted' ? 25 :
                           app.status === 'approved' ? 50 :
                           app.status === 'in_process' ? 75 : 100,
        description: `Application for ${app.serviceType} service`,
        createdAt: app.createdAt,
        expectedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      setRequests(submittedRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleViewRequest = (requestId) => {
    router.push(`/client/track-request?id=${requestId}`);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Submitted':
        return <FaFileAlt className="text-blue-600" />;
      case 'Under Review':
        return <FaEye className="text-yellow-600" />;
      case 'In Progress':
        return <FaHourglassHalf className="text-orange-600" />;
      case 'Completed':
        return <FaCheckCircle className="text-green-600" />;
      case 'Cancelled':
        return <FaTimesCircle className="text-red-600" />;
      case 'On Hold':
        return <FaExclamationTriangle className="text-yellow-600" />;
      default:
        return <FaClock className="text-gray-500" />;
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

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(req => req.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-16 px-8">
        <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-6" />
        <h3 className="text-2xl font-light text-gray-900 mb-3">No Submitted Requests</h3>
        <p className="text-gray-500 mb-8 font-light">You haven't submitted any requests yet.</p>
        <button
          onClick={() => router.push('/client/requests')}
          className="bg-blue-600 text-white px-8 py-3 font-medium hover:bg-blue-700 transition-colors"
        >
          Create New Request
        </button>
      </div>
    );
  }

  return (
    <div className="px-8 py-12">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-4xl font-light text-gray-900 mb-3">
            Submitted Requests
          </h2>
          <p className="text-gray-600 font-light">Track the progress of your submitted requests</p>
        </div>
        
        {/* Filter Dropdown */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white font-medium"
          >
            <option value="all">All Status</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {filteredRequests.map((request) => (
          <div
            key={request._id}
            className="bg-white border border-gray-200 p-8 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-green-50 border border-green-200">
                    {getStatusIcon(request.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      {request.type || 'Service Request'}
                    </h3>
                    <span className={`inline-block text-sm font-medium px-3 py-1 border ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="border-l-4 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Request Number</p>
                    <p className="font-medium text-gray-900">{request.requestNumber}</p>
                  </div>
                  <div className="border-l-4 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Service Type</p>
                    <p className="font-medium text-gray-900">{request.type || 'Not specified'}</p>
                  </div>
                  <div className="border-l-4 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Progress</p>
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
                  </div>
                  <div className="border-l-4 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Submitted</p>
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-gray-400 text-sm" />
                      <p className="text-sm font-medium text-gray-700">{formatDate(request.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {request.description && (
                  <div className="mb-6 border-l-4 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {request.description}
                    </p>
                  </div>
                )}

                {request.expectedCompletion && (
                  <div className="mb-6 border-l-4 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Expected Completion</p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatDate(request.expectedCompletion)}
                    </p>
                  </div>
                )}
              </div>

              <div className="ml-8">
                <button
                  onClick={() => handleViewRequest(request._id)}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                >
                  <FaEye className="mr-2" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && filter !== 'all' && (
        <div className="text-center py-12">
          <p className="text-gray-500 font-light">No requests found with status: {filter}</p>
        </div>
      )}

      {requests.length > 0 && (
        <div className="mt-12 p-6 bg-blue-50 border-l-4 border-blue-400">
          <div className="flex items-start space-x-3">
            <FaFileAlt className="text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Request Tracking</h4>
              <p className="text-sm text-blue-700">
                Click "View Details" to track the progress of your requests and see the complete timeline.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmittedRequestsList;