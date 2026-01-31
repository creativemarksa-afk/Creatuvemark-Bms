"use client";

import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClientOnly } from '../../hooks/useClientOnly';
import { 
  FaFileAlt, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaHourglassHalf,
  FaExclamationTriangle,
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaBell,
  FaCalendarAlt,
  FaDollarSign as FaRiyalSign,
  FaChartLine,
  FaUsers,
  FaBuilding,
  FaSpinner,
  FaArrowUp as FaTrendingUp,
  FaArrowDown as FaTrendingDown,
  FaFileAlt as FaFileContract,
  FaUsers as FaHandshake,
  FaCog,
  FaBuilding as FaShieldAlt
} from 'react-icons/fa';
import { getUserApplications, getApplicationProgress } from '../../services/applicationService';
import AuthContext from '../../contexts/AuthContext';
import { FullPageLoading } from '../../components/LoadingSpinner';
import { useTranslation } from '../../i18n/TranslationContext';



const ClientDashboard = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isClient = useClientOnly();

  // Load real dashboard data from backend
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch user's applications from backend
        const response = await getUserApplications();
        const applications = response.data || [];
        
        // Calculate statistics from real data
        const statistics = calculateStatistics(applications);
        
        // Fetch progress data for each application
        const recentApplications = applications.slice(0, 5);
        const applicationsWithProgress = await Promise.all(
          recentApplications.map(async (app) => {
            try {
              const progressResponse = await getApplicationProgress(app._id);
              return {
                id: app._id,
                _id: app._id,
                type: formatServiceType(app.serviceType),
                date: new Date(app.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                }),
                status: formatStatus(app.status),
                progress: progressResponse.data.progressPercentage !== undefined ? progressResponse.data.progressPercentage : getProgressPercentage(app.status),
                nextAction: getNextAction(app.status),
                progressData: progressResponse.data
              };
            } catch (error) {
              console.error(`Error fetching progress for application ${app._id}:`, error);
              // Fallback to hardcoded progress if API fails
              return {
                id: app._id,
                _id: app._id,
                type: formatServiceType(app.serviceType),
                date: new Date(app.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                }),
                status: formatStatus(app.status),
                progress: getProgressPercentage(app.status),
                nextAction: getNextAction(app.status),
                progressData: null
              };
            }
          })
        );
        
        // Prepare dashboard data
        const dashboardData = {
          user: {
            name: user.fullName || user.email,
            memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            }) : 'Recently',
            lastLogin: "Just now"
          },
          statistics,
          recentRequests: applicationsWithProgress,
          notifications: generateNotifications(applications),
          upcomingDeadlines: generateDeadlines(applications)
        };
        
        setDashboardData(dashboardData);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Helper functions for data processing
  const calculateStatistics = (applications) => {
    const totalRequests = applications.length;
    const inProgressRequests = applications.filter(app => 
      ['submitted', 'under_review', 'in_process'].includes(app.status)
    ).length;
    const completedRequests = applications.filter(app => 
      ['completed', 'approved'].includes(app.status)
    ).length;
    
    // Calculate total spent (mock calculation - you can enhance this with real payment data)
    const totalSpent = applications.length * 5000; // Assuming 5000 SAR per application
    
    return {
      totalRequests,
      inProgressRequests,
      completedRequests,
      totalSpent,
      documentsUploaded: applications.length * 3, // Mock calculation
      avgProcessingTime: 14 // Mock calculation
    };
  };

  const formatServiceType = (serviceType) => {
    const serviceMap = {
      'commercial': t('client.services.commercial'),
      'engineering': t('client.services.engineering'),
      'real_estate': t('client.services.realEstate'),
      'industrial': t('client.services.industrial'),
      'agricultural': t('client.services.agricultural'),
      'service': t('client.services.service'),
      'advertising': t('client.services.advertising')
    };
    return serviceMap[serviceType] || serviceType;
  };

  const formatStatus = (status) => {
    const statusMap = {
      'submitted': t('client.status.submitted'),
      'under_review': t('client.status.underReview'),
      'approved': t('client.status.approved'),
      'in_process': t('client.status.inProcess'),
      'completed': t('client.status.completed'),
      'rejected': t('client.status.rejected')
    };
    return statusMap[status] || status;
  };

  const getProgressPercentage = (status) => {
    const progressMap = {
      'submitted': 20,
      'under_review': 40,
      'approved': 60,
      'in_process': 80,
      'completed': 100,
      'rejected': 0
    };
    return progressMap[status] || 0;
  };

  const getNextAction = (status) => {
    const actionMap = {
      'submitted': t('client.actions.submitted'),
      'under_review': t('client.actions.underReview'),
      'approved': t('client.actions.approved'),
      'in_process': t('client.actions.inProcess'),
      'completed': t('client.actions.completed'),
      'rejected': t('client.actions.rejected')
    };
    return actionMap[status] || t('client.actions.processing');
  };

  const generateNotifications = (applications) => {
    const notifications = [];
    
    applications.forEach(app => {
      if (app.status === 'submitted') {
        notifications.push({
          id: `notif_${app._id}_submitted`,
          type: 'info',
          title: t('client.notifications.submitted'),
          message: t('client.notifications.submittedMessage', { service: formatServiceType(app.serviceType) }),
          time: t('client.notifications.justNow'),
          actionUrl: `/client/requests/${app._id}`
        });
      }
      
      if (app.status === 'under_review') {
        notifications.push({
          id: `notif_${app._id}_review`,
          type: 'info',
          title: t('client.notifications.underReview'),
          message: t('client.notifications.underReviewMessage', { service: formatServiceType(app.serviceType) }),
          time: t('client.notifications.oneHourAgo'),
          actionUrl: `/client/requests/${app._id}`
        });
      }
      
      if (app.status === 'approved') {
        notifications.push({
          id: `notif_${app._id}_approved`,
          type: 'urgent',
          title: t('client.notifications.approved'),
          message: t('client.notifications.approvedMessage', { service: formatServiceType(app.serviceType) }),
          time: t('client.notifications.twoHoursAgo'),
          actionUrl: `/client/requests/${app._id}`
        });
      }
    });
    
    return notifications.slice(0, 3);
  };

  const generateDeadlines = (applications) => {
    if (!isClient) return []; // Return empty array during SSR
    
    const deadlines = [];
    
    applications.forEach(app => {
      if (app.status === 'submitted' || app.status === 'under_review') {
        const deadlineDate = new Date(app.createdAt);
        deadlineDate.setDate(deadlineDate.getDate() + 30); // 30 days from submission
        
        const daysLeft = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));
        
        if (daysLeft > 0) {
          deadlines.push({
            id: `deadline_${app._id}`,
            title: `${formatServiceType(app.serviceType)} ${t('client.deadlines.review')}`,
            date: deadlineDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            daysLeft,
            priority: daysLeft <= 7 ? 'high' : daysLeft <= 14 ? 'medium' : 'low'
          });
        }
      }
    });
    
    return deadlines.slice(0, 2);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-[#ffd17a] bg-[#ffd17a]/20';
      case 'approved': return 'text-[#ffd17a] bg-[#ffd17a]/20';
      case 'in progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-[#ffd17a] bg-[#ffd17a]/20';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'urgent': return <FaExclamationTriangle className="text-red-500" />;
      case 'info': return <FaBell className="text-blue-500" />;
      case 'reminder': return <FaClock className="text-[#ffd17a]" />;
      default: return <FaBell className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-gray-50 border-l-4 border-[#ffd17a] p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="animate-spin h-8 w-8 border-4 border-[#ffd17a] border-t-transparent"></div>
              <span className="text-gray-700 font-medium">{t('client.loading.dashboard')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-red-50 border-l-4 border-red-600 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-red-900 mb-1">{t('client.error.loadingDashboard')}</h3>
                <p className="text-sm text-red-800 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold uppercase tracking-wide transition-all duration-200"
                >
                  {t('buttons.tryAgain')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center py-16 sm:py-24 bg-gray-50 border-2 border-gray-200">
            <div className="max-w-md mx-auto px-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#ffd17a]/20 to-[#ffd17a]/30 flex items-center justify-center mx-auto mb-6">
                <FaFileAlt className="w-10 h-10 text-[#ffd17a]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                {t('client.noData.title')}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base mb-8 leading-relaxed">
                {t('client.noData.description')}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-8 py-4 bg-[#ffd17a] hover:bg-[#ffd17a]/80 text-white text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-lg"
              >
                {t('buttons.retry')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header Section */}
        <div className="backdrop-blur-sm p-4 lg:m-2 rounded-b-4xl lg:rounded-3xl border-b border-[#ffd17a]/20 bg-[#242021]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-2 h-2 rounded-full shadow-lg animate-pulse bg-[#ffd17a]"></div>
                  <span className="text-sm font-medium uppercase tracking-wider text-[#ffd17a]/80">{t('client.dashboard.title')}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-3 text-[#ffd17a]">
                  {t('client.dashboard.welcomeBack', { name: dashboardData.user.name })}
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-white/70">
                  {t('client.dashboard.memberSince', { date: dashboardData.user.memberSince })} • {t('client.dashboard.lastLogin', { time: dashboardData.user.lastLogin })}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Link
                  href="/client/track-application"
                  className="w-full sm:w-auto px-6 py-3 text-sm font-semibold uppercase tracking-wider border border-[#ffd17a]/30 bg-[#ffd17a]/10 text-[#ffd17a] rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:bg-[#ffd17a]/20 group"
                >
                  <span className="group-hover:scale-105 transition-transform duration-300">{t('client.buttons.trackApplications')}</span>
                </Link>
                <Link
                  href="/client/application"
                  className="w-full sm:w-auto px-6 py-3 text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-[#ffd17a] to-[#ffd17a] text-gray-900 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-lg group"
                >
                  <span className="group-hover:scale-105 transition-transform duration-300">{t('client.buttons.newApplication')}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="group bg-white border border-[#ffd17a]/50 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-lg shadow-sm">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 sm:mb-2">
                    {t('client.stats.totalApplications')}
                  </h3>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">{dashboardData.statistics.totalRequests}</p>
                  <div className="flex items-center text-xs sm:text-sm font-medium text-[#ffd17a]">
                    <FaTrendingUp className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                    <span>{t('client.stats.allTime')}</span>
                  </div>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a] rounded-lg">
                  <FaFileContract className="text-sm sm:text-base lg:text-xl text-gray-900" />
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white border border-[#ffd17a]/50 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-lg shadow-sm">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 sm:mb-2">
                    {t('client.stats.inProgress')}
                  </h3>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">{dashboardData.statistics.inProgressRequests}</p>
                  <div className="flex items-center text-xs sm:text-sm font-medium text-[#ffd17a]">
                    <FaHourglassHalf className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                    <span>{t('client.stats.activeProcesses')}</span>
                  </div>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a] rounded-lg">
                  <FaClock className="text-sm sm:text-base lg:text-xl text-gray-900" />
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white border border-[#ffd17a]/50 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-lg shadow-sm">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 sm:mb-2">
                    {t('client.stats.completed')}
                  </h3>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">{dashboardData.statistics.completedRequests}</p>
                  <div className="flex items-center text-xs sm:text-sm font-medium text-[#ffd17a]">
                    <FaCheckCircle className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                    <span>{t('client.stats.successfullyFinished')}</span>
                  </div>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a] rounded-lg">
                  <FaCheckCircle className="text-sm sm:text-base lg:text-xl text-gray-900" />
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white border border-[#ffd17a]/50 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-lg shadow-sm">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 sm:mb-2">
                    {t('client.stats.totalInvestment')}
                  </h3>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">{dashboardData.statistics.totalSpent.toLocaleString()} SAR</p>
                  <div className="flex items-center text-xs sm:text-sm font-medium text-[#ffd17a]">
                    <FaRiyalSign className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                    <span>{t('client.stats.serviceInvestments')}</span>
                  </div>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a] rounded-lg">
                  <FaRiyalSign className="text-sm sm:text-base lg:text-xl text-gray-900" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Recent Applications */}
          <div className="lg:col-span-2 bg-white rounded-t-4xl  border border-[#ffd17a]/50 overflow-hidden group hover:shadow-lg transition-all duration-300 rounded-lg shadow-sm">
            <div className="p-4 sm:p-6 bg-[#242021]">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full shadow-lg animate-pulse bg-[#ffd17a]"></div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#ffd17a]">{t('client.recentApplications.title')}</h2>
                </div>
                <Link
                  href="/client/track-application"
                  className="px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-[#ffd17a]/10 text-[#ffd17a] border border-[#ffd17a]/30 rounded-lg hover:bg-[#ffd17a]/20"
                >
                  {t('client.recentApplications.viewAll')}
                </Link>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {dashboardData.recentRequests.length > 0 ? (
                  dashboardData.recentRequests.map((request) => (
                    <div key={request.id} className="group bg-gray-50 border border-[#ffd17a]/50 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-lg">
                      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                              <div className="w-1.5 h-1.5 rounded-full shadow-sm bg-[#ffd17a]"></div>
                              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                {t('client.recentApplications.applicationDetails')}
                              </h3>
                            </div>
                            <p className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">{request.type}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                              <div className="flex items-center space-x-2 text-[#ffd17a]">
                                <FaFileAlt className="text-xs sm:text-sm" />
                                <span className="font-medium">ID: {request.id.slice(-8).toUpperCase()}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-500">
                                <FaCalendarAlt className="text-xs sm:text-sm" />
                                <span>{request.date}</span>
                              </div>
                            </div>
                          </div>
                          <span className={`flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 group-hover:scale-105 ${getStatusColor(request.status)} rounded-lg shadow-sm`}>
                            {request.status}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex justify-between text-xs sm:text-sm font-medium text-gray-700">
                            <span>{t('client.recentApplications.progress')}</span>
                            <span className="font-bold text-[#ffd17a]">{request.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 sm:h-3 rounded-lg overflow-hidden">
                            <div
                              className="h-2 sm:h-3 transition-all duration-1000 ease-out bg-gradient-to-r from-[#ffd17a] to-[#ffd17a] rounded-lg"
                              style={{ width: `${request.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-2">
                          <p className="text-xs sm:text-sm font-medium text-gray-600">{request.nextAction}</p>
                          <Link
                            href={`/client/track-application/${request._id}`}
                            className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group bg-gradient-to-r from-[#ffd17a] to-[#ffd17a] text-gray-900 rounded-lg"
                          >
                            <span className="group-hover:scale-105 transition-transform duration-300">{t('client.recentApplications.viewDetails')}</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 sm:py-24 bg-gray-50 border-2 border-gray-200">
                    <div className="max-w-md mx-auto px-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#ffd17a]/20 to-[#ffd17a]/30 flex items-center justify-center mx-auto mb-6">
                        <FaFileAlt className="w-10 h-10 text-[#ffd17a]" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                        {t('client.noApplications.title')}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base mb-8 leading-relaxed">
                        {t('client.noApplications.description')}
                      </p>
                      <Link 
                        href="/client/application"
                        className="w-full sm:w-auto px-8 py-4 bg-[#ffd17a] hover:bg-[#ffd17a]/80 text-white text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-lg"
                      >
                        {t('client.noApplications.startNew')}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Notifications */}
            <div className="bg-white border border-[#ffd17a]/50 overflow-hidden group hover:shadow-lg transition-all duration-300 rounded-lg shadow-sm">
              <div className="p-4 sm:p-6 bg-[#242021]">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full shadow-lg animate-pulse bg-[#ffd17a]"></div>
                  <h3 className="text-base sm:text-lg font-bold text-[#ffd17a]">{t('client.notifications.recent')}</h3>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {dashboardData.notifications && dashboardData.notifications.length > 0 ? (
                    dashboardData.notifications.slice(0, 3).map((notification) => (
                      <Link
                        key={notification.id}
                        href={notification.actionUrl}
                        className="block p-3 sm:p-4 bg-gray-50 border border-[#ffd17a]/30 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 group rounded-lg"
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a] rounded-lg">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">{notification.title}</p>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{notification.message}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-2">
                              <FaClock className="text-xs" />
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 mx-auto mb-3 sm:mb-4 flex items-center justify-center rounded-lg">
                        <FaBell className="text-lg sm:text-2xl text-gray-400" />
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">{t('client.notifications.none')}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[#ffd17a]/30">
                  <Link
                    href="/client/notifications"
                    className="inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-[#ffd17a]/10 text-[#ffd17a] border border-[#ffd17a]/30 rounded-lg hover:bg-[#ffd17a]/20"
                  >
                    {t('client.notifications.viewAll')}
                  </Link>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white border border-[#ffd17a]/50 overflow-hidden group hover:shadow-lg transition-all duration-300 rounded-lg shadow-sm">
              <div className="p-4 sm:p-6 bg-[#242021]">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full shadow-lg animate-pulse bg-[#ffd17a]"></div>
                  <h3 className="text-base sm:text-lg font-bold text-[#ffd17a]">{t('client.deadlines.upcoming')}</h3>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {!isClient ? (
                    <div className="text-center py-6 sm:py-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 mx-auto mb-3 sm:mb-4 flex items-center justify-center rounded-lg">
                        <FaCalendarAlt className="text-lg sm:text-2xl text-gray-400" />
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">{t('client.deadlines.loading')}</p>
                    </div>
                  ) : dashboardData.upcomingDeadlines && dashboardData.upcomingDeadlines.length > 0 ? (
                    dashboardData.upcomingDeadlines.map((deadline) => (
                      <div key={deadline.id} className="bg-gray-50 border border-[#ffd17a]/30 p-3 sm:p-4 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 group rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-gray-800">{deadline.title}</h4>
                          <span className={`px-2 sm:px-3 py-1 text-xs font-bold transition-all duration-300 group-hover:scale-105 ${
                            deadline.priority === 'high' ? 'bg-red-100 text-red-800' :
                            deadline.priority === 'medium' ? 'bg-[#ffd17a]/20 text-[#ffd17a]' :
                            'bg-[#ffd17a]/20 text-[#ffd17a]'
                          } rounded-lg`}>
                            {deadline.daysLeft} {t('client.deadlines.daysLeft')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          {t('client.deadlines.due')}: {deadline.date}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 mx-auto mb-3 sm:mb-4 flex items-center justify-center rounded-lg">
                        <FaCalendarAlt className="text-lg sm:text-2xl text-gray-400" />
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">{t('client.deadlines.none')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white border border-[#ffd17a]/50 overflow-hidden group hover:shadow-lg transition-all duration-300 rounded-lg shadow-sm">
              <div className="p-4 sm:p-6 bg-[#242021]">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full shadow-lg animate-pulse bg-[#ffd17a]"></div>
                  <h3 className="text-base sm:text-lg font-bold text-[#ffd17a]">{t('client.quickStats.title')}</h3>
                </div>
              </div>
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 border border-[#ffd17a]/30 hover:bg-white hover:shadow-sm transition-all duration-300 group rounded-lg">
                  <span className='text-xs sm:text-sm font-medium text-gray-700'>{t('client.quickStats.documentsUploaded')}</span>
                  <span className="font-bold text-sm sm:text-lg text-[#ffd17a]">{dashboardData.statistics.documentsUploaded}</span>
                </div>
                <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 border border-[#ffd17a]/30 hover:bg-white hover:shadow-sm transition-all duration-300 group rounded-lg">
                  <span className='text-xs sm:text-sm font-medium text-gray-700'>{t('client.quickStats.avgProcessingTime')}</span>
                  <span className="font-bold text-sm sm:text-lg text-[#ffd17a]">{dashboardData.statistics.avgProcessingTime} days</span>
                </div>
                <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 border border-[#ffd17a]/30 hover:bg-white hover:shadow-sm transition-all duration-300 group rounded-lg">
                  <span className='text-xs sm:text-sm font-medium text-gray-700'>{t('client.quickStats.successRate')}</span>
                  <span className="font-bold text-sm sm:text-lg text-[#ffd17a]">95%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-[#ffd17a]/50 overflow-hidden group hover:shadow-lg transition-all duration-300 rounded-lg shadow-sm">
          <div className="p-4 sm:p-6 lg:p-8 bg-[#242021]">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full shadow-lg animate-pulse bg-[#ffd17a]"></div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#ffd17a]">{t('client.quickActions.title')}</h2>
            </div>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <Link
                href="/client/application"
                className="group flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-gray-50 border border-[#ffd17a]/50 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-lg"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center mb-4 sm:mb-6 shadow-md group-hover:scale-110 transition-all duration-300 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a] rounded-lg">
                  <FaPlus className="text-sm sm:text-base lg:text-xl text-gray-900" />
                </div>
                <span className='font-bold text-gray-900 text-center text-xs sm:text-sm uppercase tracking-wider group-hover:scale-105 transition-transform duration-300'>{t('client.quickActions.newApplication')}</span>
              </Link>

              <Link
                href="/client/track-application"
                className="group flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-gray-50 border border-[#ffd17a]/50 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-lg"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center mb-4 sm:mb-6 shadow-md group-hover:scale-110 transition-all duration-300 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a] rounded-lg">
                  <FaEye className="text-sm sm:text-base lg:text-xl text-gray-900" />
                </div>
                <span className='font-bold text-gray-900 text-center text-xs sm:text-sm uppercase tracking-wider group-hover:scale-105 transition-transform duration-300'>{t('client.quickActions.trackApplications')}</span>
              </Link>

              <Link
                href="/client/payments"
                className="group flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-gray-50 border border-[#ffd17a]/50 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-lg"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center mb-4 sm:mb-6 shadow-md group-hover:scale-110 transition-all duration-300 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a] rounded-lg">
                  <FaRiyalSign className="text-sm sm:text-base lg:text-xl text-gray-900" />
                </div>
                <span className='font-bold text-gray-900 text-center text-xs sm:text-sm uppercase tracking-wider group-hover:scale-105 transition-transform duration-300'>{t('client.quickActions.viewPayments')}</span>
              </Link>

              <Link
                href="/client/support"
                className="group flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-gray-50 border border-[#ffd17a]/50 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-lg"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center mb-4 sm:mb-6 shadow-md group-hover:scale-110 transition-all duration-300 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a] rounded-lg">
                  <FaHandshake className="text-sm sm:text-base lg:text-xl text-gray-900" />
                </div>
                <span className='font-bold text-gray-900 text-center text-xs sm:text-sm uppercase tracking-wider group-hover:scale-105 transition-transform duration-300'>{t('client.quickActions.contactSupport')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;