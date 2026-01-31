"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  FaPlus, 
  FaList, 
  FaTasks, 
  FaUserCheck, 
  FaSpinner,
  FaFilter,
  FaSearch,
  FaFileAlt,
  FaUsers,
  FaCheckCircle,
  FaEmail,
  FaClock,
  FaExclamationTriangle,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import RequestsList from '../../../components/admin/RequestsList';
import RequestDetails from '../../../components/admin/RequestDetails';
import AssignmentModal from '../../../components/admin/AssignmentModal';
import api from '../../../services/api';

const InternalRequestsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const requestId = searchParams.get('id');
  const tab = searchParams.get('tab');

  useEffect(() => {
    const initializePage = async () => {
      try {

        if (tab) {
          setActiveTab(tab);
        }
      } catch (error) {
        console.error('Error initializing page:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [tab, router]);

  const tabs = [
    {
      id: 'all',
      label: 'All Requests',
      icon: FaList,
      description: 'View all service requests',
      color: 'blue',
      count: 24
    },
    {
      id: 'pending',
      label: 'Pending Review',
      icon: FaClock,
      description: 'Requests awaiting review',
      color: 'amber',
      count: 8
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      icon: FaTasks,
      description: 'Active requests being processed',
      color: 'emerald',
      count: 12
    },
  ];

  const getStatusFilter = (tabId) => {
    switch (tabId) {
      case 'pending':
        return 'Submitted';
      case 'in-progress':
        return 'In Progress';
      default:
        return 'all';
    }
  };

  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
    router.push(`/internal/requests?id=${request.applicationId}&tab=${activeTab}`);
  };

  const handleCloseDetails = () => {
    setSelectedRequest(null);
    router.push('/internal/requests');
  };

  const handleAssignRequest = (request) => {
    setSelectedRequest(request);
    setShowAssignModal(true);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSpinner className="animate-spin text-2xl text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Applications</h3>
          <p className="text-gray-600">Fetching the latest application data...</p>
        </div>
      </div>
    );
  }

  // Show request details if ID is provided
  if (requestId && !selectedRequest) {
    return (
      <RequestDetails
        requestId={requestId}
        onClose={handleCloseDetails}
        onAssign={handleAssignRequest}
      />
    );
  }

  if (selectedRequest && !showAssignModal) {
    return (
      <RequestDetails
        request={selectedRequest}
        onClose={handleCloseDetails}
        onAssign={handleAssignRequest}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FaFileAlt className="text-white text-xl" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                      Application Management
                    </h1>
                    <p className="text-sm text-emerald-600 font-medium uppercase tracking-wider">
                      Creative Mark Admin Portal
                    </p>
                  </div>
                </div>
                <p className="text-base sm:text-lg text-gray-600 font-medium max-w-2xl">
                  Review, assign, and manage all client applications efficiently
                </p>
              </div>
              
            </div>
          </div>

          {/* Modern Tab Navigation */}
          <div className="mb-8">
            {/* Desktop Tabs */}
            <div className="hidden md:block">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
                <nav className="flex space-x-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`group relative flex-1 flex items-center justify-center py-4 px-6 rounded-lg font-medium text-sm transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`text-lg ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                          <div className="text-left">
                            <div className="flex items-center space-x-2">
                              <span>{tab.label}</span>
                              <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                isActive 
                                  ? 'bg-white/20 text-white' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {tab.count}
                              </span>
                            </div>
                            <p className={`text-xs mt-1 ${
                              isActive ? 'text-emerald-100' : 'text-gray-500'
                            }`}>
                              {tab.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Mobile Tabs - Horizontal Scroll */}
            <div className="md:hidden">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
                <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-shrink-0 flex flex-col items-center py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 min-w-[120px] ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`text-lg mb-2 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                        <span className="text-xs whitespace-nowrap">{tab.label}</span>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full mt-1 ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <RequestsList
              statusFilter={getStatusFilter(activeTab)}
              assignedFilter={activeTab === 'assigned' ? 'me' : 'all'}
              onRequestSelect={handleRequestSelect}
              onRequestAssign={handleAssignRequest}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedRequest && (
        <AssignmentModal
          request={selectedRequest}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedRequest(null);
          }}
          onAssigned={() => {
            setShowAssignModal(false);
            setSelectedRequest(null);
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

const InternalRequestsPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    }>
      <InternalRequestsContent />
    </Suspense>
  );
};

export default InternalRequestsPage;