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
import AssignmentModal from '../../../components/admin/AssignmentModal';
import { useTranslation } from '../../../i18n/TranslationContext';

const InternalRequestsContent = () => {
  // Updated navigation to use new details page
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequestForAssign, setSelectedRequestForAssign] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tab = searchParams.get('tab');

  useEffect(() => {
    const initializePage = async () => {
      try {
        if (tab) {
          setActiveTab(tab);
        }
      } catch (error) {
        console.error('Error initializing page:', error);
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [tab, router]);

  const tabs = [
    {
      id: 'all',
      label: t('admin.requests.tabs.all'),
      icon: FaList,
      description: t('admin.requests.tabs.allDescription'),
      color: 'blue',
      count: 24
    },
    {
      id: 'pending',
      label: t('admin.requests.tabs.pending'),
      icon: FaClock,
      description: t('admin.requests.tabs.pendingDescription'),
      color: 'amber',
      count: 8
    },
    {
      id: 'in-progress',
      label: t('admin.requests.tabs.inProgress'),
      icon: FaTasks,
      description: t('admin.requests.tabs.inProgressDescription'),
      color: 'emerald',
      count: 12
    },
  ];

  const getStatusFilter = (tabId) => {
    switch (tabId) {
      case 'pending':
        return t('admin.requests.statuses.submitted');
      case 'in-progress':
        return t('admin.requests.statuses.inProgress');
      default:
        return 'all';
    }
  };

  const handleRequestSelect = (request) => {
    // Navigate to the new modernized details page
    router.push(`/admin/requests/${request.applicationId}`);
  };

  const handleAssignRequest = (request) => {
    setSelectedRequestForAssign(request);
    setShowAssignModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white border border-gray-200 p-6 sm:p-8">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#242021] flex items-center justify-center mx-auto mb-4">
              <FaSpinner className="animate-spin text-lg sm:text-2xl text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#ffd17a] border-2 border-white"></div>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('admin.requests.loadingApplications')}</h3>
          <p className="text-sm sm:text-base text-gray-600">{t('admin.requests.fetchingData')}</p>
        </div>
      </div>
    );
  }


  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Modern Header - Matching Admin Dashboard Style */}
          <div className="relative overflow-hidden bg-[#242021] text-white mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-48 sm:w-64 lg:w-96 h-48 sm:h-64 lg:h-96 bg-[#ffd17a]/10 transform rotate-45 translate-x-16 sm:translate-x-24 lg:translate-x-32 -translate-y-16 sm:-translate-y-24 lg:-translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-[#ffd17a]/10 transform -rotate-45 -translate-x-8 sm:-translate-x-12 lg:-translate-x-16 translate-y-8 sm:translate-y-12 lg:translate-y-16"></div>
            
            <div className="relative p-4 sm:p-6 lg:p-8 xl:p-12">
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 sm:gap-6">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#ffd17a] flex items-center justify-center">
                      <FaFileAlt className="text-lg sm:text-2xl text-[#242021]" />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
                        {t('admin.requests.title')}
                      </h1>
                      <p className="text-[#ffd17a] text-sm sm:text-base lg:text-lg">
                        {t('admin.requests.subtitle')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 mt-4 sm:mt-6">
                    <div className="flex items-center gap-1 sm:gap-2 bg-white/10 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2">
                      <FaList className="text-[#ffd17a] text-xs sm:text-sm lg:text-base" />
                      <span className="text-xs sm:text-sm">{t('admin.requests.totalApplications')}: 24</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 bg-white/10 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2">
                      <FaClock className="text-[#ffd17a] text-xs sm:text-sm lg:text-base" />
                      <span className="text-xs sm:text-sm">{t('admin.requests.pending')}: 8</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 bg-white/10 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2">
                      <FaTasks className="text-[#ffd17a] text-xs sm:text-sm lg:text-base" />
                      <span className="text-xs sm:text-sm">{t('admin.requests.inProgress')}: 12</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => setRefreshTrigger(prev => prev + 1)}
                    className="group bg-[#ffd17a] text-[#242021] px-4 sm:px-6 py-2.5 sm:py-3 font-semibold hover:bg-[#ffd17a]/90 transition-colors flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                  >
                    <FaSpinner className="text-sm sm:text-base group-hover:rotate-180 transition-transform duration-300" />
                    {t('admin.requests.refreshData')}
                  </button>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="group bg-white/10 text-white border border-white/20 px-4 sm:px-6 py-2.5 sm:py-3 font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                  >
                    <FaUserCheck className="text-sm sm:text-base" />
                    {t('admin.requests.assignRequest')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Tab Navigation */}
          <div className="mb-6 sm:mb-8">
            {/* Desktop Tabs */}
            <div className="hidden md:block">
              <div className="bg-white border border-gray-200 p-2">
                <nav className="flex space-x-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`group relative flex-1 flex items-center justify-center py-4 px-6 font-medium text-sm transition-colors ${
                          isActive
                            ? 'bg-[#242021] text-white'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`text-lg ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                          <div className="text-left">
                            <div className="flex items-center space-x-2">
                              <span>{tab.label}</span>
                              <span className={`px-2 py-1 text-xs font-bold ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {tab.count}
                              </span>
                            </div>
                            <p className={`text-xs mt-1 ${
                              isActive ? 'text-[#ffd17a]' : 'text-gray-500'
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
              <div className="bg-white border border-gray-200 p-2">
                <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-shrink-0 flex flex-col items-center py-3 px-4 font-medium text-sm transition-colors min-w-[120px] ${
                          isActive
                            ? 'bg-[#242021] text-white'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`text-lg mb-2 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                        <span className="text-xs whitespace-nowrap">{tab.label}</span>
                        <span className={`px-2 py-0.5 text-xs font-bold mt-1 ${
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
          <div className="bg-white border border-gray-200 overflow-hidden">
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
      {showAssignModal && selectedRequestForAssign && (
        <AssignmentModal
          request={selectedRequestForAssign}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedRequestForAssign(null);
          }}
          onAssigned={() => {
            setShowAssignModal(false);
            setSelectedRequestForAssign(null);
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
  const { t } = useTranslation();
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white border border-gray-200 p-6 sm:p-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#242021] flex items-center justify-center mx-auto mb-4">
            <FaSpinner className="animate-spin text-lg sm:text-2xl text-white" />
          </div>
          <p className="text-sm sm:text-base text-gray-600">{t('admin.requests.loadingRequests')}</p>
        </div>
      </div>
    }>
      <InternalRequestsContent />
    </Suspense>
  );
};

export default InternalRequestsPage;