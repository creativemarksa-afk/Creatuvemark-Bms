"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSpinner,
  FaArrowLeft,
  FaFilter,
  FaSearch,
  FaCog,
  FaDollarSign,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser,
  FaCalendarAlt,
  FaFileAlt,
  FaStar,
  FaTag
} from 'react-icons/fa';
import { getEmployeeApplications } from '../../../services/employeeDashboardService';

export default function AdditionalServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);


      // Generate services from request data and add some additional services
      const response = await getEmployeeApplications({ limit: 100 });
      const requests = response.data || [];
      
      const generatedServices = generateServicesFromRequests(requests);
      setServices(generatedServices);
    } catch (error) {
      console.error('Error loading services:', error);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const generateServicesFromRequests = (requests) => {
    const services = [];
    
    // Generate services from existing requests
    requests.forEach((request) => {
      if (request.subServices && request.subServices.length > 0) {
        request.subServices.forEach((subService, index) => {
          services.push({
            id: `service-${request._id}-${index}`,
            name: subService,
            category: request.serviceCategory || 'General',
            description: `Additional service for ${request.type || 'Service Request'}`,
            status: 'active',
            priority: 'Medium',
            cost: 2500,
            estimatedDuration: 15,
            clientName: request.client?.name || 'Unknown Client',
            requestId: request._id,
            requestType: request.type || 'Service Request',
            assignedTo: request.assignedTo?.name || 'Unassigned',
            createdAt: request.createdAt,
            dueDate: request.expectedCompletion,
            progress: 75,
            tags: [subService, request.serviceCategory || 'General']
          });
        });
      }
    });

    // Add some standalone additional services
    const standaloneServices = [
      {
        id: 'service-standalone-1',
        name: 'Document Translation',
        category: 'Documentation',
        description: 'Professional translation services for legal and business documents',
        status: 'active',
        priority: 'Medium',
        cost: 1500,
        estimatedDuration: 5,
        clientName: 'Global Corp',
        requestId: null,
        requestType: 'Translation Service',
        assignedTo: 'Sarah Johnson',
        createdAt: '2024-01-15T10:00:00.000Z',
        dueDate: '2024-01-20T10:00:00.000Z',
        progress: 75,
        tags: ['Translation', 'Documentation', 'Multilingual']
      },
      {
        id: 'service-standalone-2',
        name: 'Business Consultation',
        category: 'Consultation',
        description: 'Strategic business consultation and planning services',
        status: 'pending',
        priority: 'High',
        cost: 3500,
        estimatedDuration: 14,
        clientName: 'StartupXYZ',
        requestId: null,
        requestType: 'Consultation Service',
        assignedTo: 'Michael Chen',
        createdAt: '2024-01-16T10:00:00.000Z',
        dueDate: '2024-01-30T10:00:00.000Z',
        progress: 25,
        tags: ['Consultation', 'Strategy', 'Business Planning']
      },
      {
        id: 'service-standalone-3',
        name: 'Legal Compliance Review',
        category: 'Legal',
        description: 'Comprehensive legal compliance review and documentation',
        status: 'completed',
        priority: 'High',
        cost: 2800,
        estimatedDuration: 7,
        clientName: 'TechCorp Ltd',
        requestId: null,
        requestType: 'Legal Service',
        assignedTo: 'Emily Davis',
        createdAt: '2024-01-10T10:00:00.000Z',
        dueDate: '2024-01-16T10:00:00.000Z',
        progress: 100,
        tags: ['Legal', 'Compliance', 'Review']
      }
    ];

    services.push(...standaloneServices);

    // Sort by creation date (newest first)
    return services.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-50 text-green-800 border-green-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="text-green-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'completed':
        return <FaCheckCircle className="text-blue-500" />;
      case 'cancelled':
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = searchTerm === '' || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(services.map(service => service.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-green-600 mb-4" />
          <p className="text-xl text-gray-800 font-semibold">Loading services...</p>
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
            onClick={loadServices}
            className="bg-green-600 text-white px-6 py-3 hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Additional Services
              </h1>
              <p className="text-lg text-gray-600">
                Manage and track additional services for clients
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 text-sm font-medium rounded-full">
                {services.length} services
              </span>
              <button 
                onClick={() => {
                  setSelectedService(null);
                  setShowServiceModal(true);
                }}
                className="flex items-center justify-center px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md"
              >
                <FaPlus className="mr-2" />
                Add Service
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={loadServices}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <FaFilter className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div 
                key={service.id}
                className="bg-white border border-gray-300 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedService(service);
                  setShowServiceModal(true);
                }}
              >
                {/* Service Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600">{service.category}</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <span className={`px-2 py-1 text-xs font-medium border ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium border ${getPriorityColor(service.priority)}`}>
                      {service.priority}
                    </span>
                  </div>
                </div>

                {/* Service Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {service.description}
                </p>

                {/* Service Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaUser className="mr-2" />
                    {service.clientName}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaDollarSign className="mr-2" />
                    {formatCurrency(service.cost)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaClock className="mr-2" />
                    {service.estimatedDuration} days
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaCalendarAlt className="mr-2" />
                    Due: {service.dueDate ? formatDate(service.dueDate) : 'TBD'}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{service.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2">
                    <div 
                      className="bg-green-600 h-2 transition-all duration-300"
                      style={{ width: `${service.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {service.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600">
                      <FaTag className="inline mr-1" />
                      {tag}
                    </span>
                  ))}
                  {service.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600">
                      +{service.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(service.status)}
                    <span className="text-xs text-gray-500">
                      {getTimeAgo(service.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(service);
                        setShowServiceModal(true);
                      }}
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="text-green-600 hover:text-green-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle edit action
                      }}
                    >
                      <FaEdit />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaCog className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'No additional services have been created yet.'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
                setFilterStatus('all');
              }}
              className="bg-green-600 text-white px-6 py-3 hover:bg-green-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Service Modal */}
        {showServiceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedService ? selectedService.name : 'Add New Service'}
                    </h2>
                    <p className="text-gray-600">
                      {selectedService ? selectedService.category : 'Create a new additional service'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowServiceModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                {/* Service Details */}
                {selectedService ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <span className={`px-3 py-1 text-sm font-medium border ${getStatusColor(selectedService.status)}`}>
                          {selectedService.status}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <span className={`px-3 py-1 text-sm font-medium border ${getPriorityColor(selectedService.priority)}`}>
                          {selectedService.priority}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                        <p className="text-gray-900">{selectedService.clientName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                        <p className="text-gray-900">{selectedService.assignedTo}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cost</label>
                        <p className="text-gray-900">{formatCurrency(selectedService.cost)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                        <p className="text-gray-900">{selectedService.estimatedDuration} days</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <p className="text-gray-900 bg-gray-50 p-4">{selectedService.description}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Progress</label>
                      <div className="w-full bg-gray-200 h-3">
                        <div 
                          className="bg-green-600 h-3 transition-all duration-300"
                          style={{ width: `${selectedService.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{selectedService.progress}% complete</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedService.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 text-sm bg-gray-100 text-gray-600">
                            <FaTag className="inline mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter service name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                        <option value="">Select category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        rows={3}
                        placeholder="Enter service description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cost</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-300">
                  <button
                    onClick={() => setShowServiceModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {selectedService ? 'Close' : 'Cancel'}
                  </button>
                  {!selectedService && (
                    <button className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors">
                      Create Service
                    </button>
                  )}
                  {selectedService && (
                    <button className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors">
                      Edit Service
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
