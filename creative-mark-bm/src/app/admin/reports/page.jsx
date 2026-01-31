"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FullPageLoading } from "../../../components/LoadingSpinner";
import { 
  FaChartBar, 
  FaUsers, 
  FaFileAlt, 
  FaDollarSign,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaDownload,
  FaCalendarAlt,
  FaUserCheck,
  FaHandshake,
  FaPrint,
  FaTasks,
  FaUserTie,
  FaBuilding,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaEdit,
  FaTrash,
  FaStar,
  FaPercent,
  FaTrophy,
  FaMedal,
  FaAward,
  FaTrendingUp,
  FaTrendingDown,
  FaMinus
} from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { getDashboardAnalytics, getApplicationReports, getEmployeeReports, getFinancialReports } from "../../../services/reportsApi";
import { getAllApplications } from "../../../services/applicationService";
import { getAllEmployees } from "../../../services/employeeApi";
import { getAllClients } from "../../../services/clientApi";
import { useTranslation } from '../../../i18n/TranslationContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ReportsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [applicationReports, setApplicationReports] = useState(null);
  const [employeeReports, setEmployeeReports] = useState(null);
  const [financialReports, setFinancialReports] = useState(null);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Real data from APIs
  const [applications, setApplications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [comprehensiveStats, setComprehensiveStats] = useState({
    totalApplications: 0,
    totalClients: 0,
    totalEmployees: 0,
    totalPartners: 0,
    activeClients: 0,
    activeEmployees: 0,
    pendingApplications: 0,
    completedApplications: 0,
    inProgressApplications: 0,
    rejectedApplications: 0,
    totalRevenue: 0,
    averageProcessingTime: 0,
    successRate: 0,
    clientSatisfaction: 0
  });

  useEffect(() => {
    const initializePage = async () => {
      try {
        await loadDashboardData();
      } catch (error) {
        console.error('Error initializing reports page:', error);
        setError(t('admin.reportsManagement.failedToLoadReportsData'));
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel including backend analytics (which now includes monthly revenue)
      const [applicationsResponse, employeesResponse, clientsResponse, analyticsResponse] = await Promise.all([
        getAllApplications(),
        getAllEmployees(),
        getAllClients(),
        getDashboardAnalytics()
      ]);
      
      const applicationsData = applicationsResponse.data || [];
      const employeesData = employeesResponse.success ? (employeesResponse.data || []) : [];
      const clientsData = clientsResponse.success ? (clientsResponse.data || []) : [];
      const backendAnalytics = analyticsResponse.success ? analyticsResponse.data : null;
      
      setApplications(applicationsData);
      setEmployees(employeesData);
      setClients(clientsData);
      
      // Calculate comprehensive statistics from real data
      const stats = calculateComprehensiveStats(applicationsData, employeesData, clientsData);
      
      // If backend analytics has revenue data, update stats with real revenue
      if (backendAnalytics && backendAnalytics.monthlyRevenue) {
        const totalRevenue = backendAnalytics.monthlyRevenue.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
        stats.totalRevenue = totalRevenue;
      }
      
      setComprehensiveStats(stats);
      
      // Use backend analytics with monthly revenue
      if (backendAnalytics) {
        setAnalytics(backendAnalytics);
      } else {
        const mockAnalytics = createMockAnalytics(applicationsData, employeesData, clientsData, stats);
        setAnalytics(mockAnalytics);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(t('admin.reportsManagement.failedToLoadAnalyticsData'));
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationReports = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (dateRange.startDate) filters.startDate = dateRange.startDate;
      if (dateRange.endDate) filters.endDate = dateRange.endDate;
      
      const response = await getApplicationReports(filters);
      if (response.success) {
        setApplicationReports(response.data);
      } else {
        setError(t('admin.reportsManagement.failedToLoadApplicationReports'));
      }
    } catch (error) {
      console.error('Error loading application reports:', error);
      setError(t('admin.reportsManagement.failedToLoadApplicationReports'));
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeReports = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (dateRange.startDate) filters.startDate = dateRange.startDate;
      if (dateRange.endDate) filters.endDate = dateRange.endDate;
      
      const response = await getEmployeeReports(filters);
      if (response.success) {
        setEmployeeReports(response.data);
      } else {
        setError(t('admin.reportsManagement.failedToLoadEmployeeReports'));
      }
    } catch (error) {
      console.error('Error loading employee reports:', error);
      setError(t('admin.reportsManagement.failedToLoadEmployeeReports'));
    } finally {
      setLoading(false);
    }
  };

  const loadFinancialReports = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (dateRange.startDate) filters.startDate = dateRange.startDate;
      if (dateRange.endDate) filters.endDate = dateRange.endDate;
      
      const response = await getFinancialReports(filters);
      if (response.success) {
        setFinancialReports(response.data);
      } else {
        setError(t('admin.reportsManagement.failedToLoadFinancialReports'));
      }
    } catch (error) {
      console.error('Error loading financial reports:', error);
      setError(t('admin.reportsManagement.failedToLoadFinancialReports'));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    setError(null);
    
    switch (tab) {
      case 'applications':
        await loadApplicationReports();
        break;
      case 'employees':
        await loadEmployeeReports();
        break;
      case 'financial':
        await loadFinancialReports();
        break;
      default:
        break;
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to prepare monthly trend data for charts
  const prepareMonthlyTrendData = () => {
    if (!analytics || !analytics.monthlyTrends) {
      // Return mock data if backend data not available
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        completedData: [12, 19, 15, 25, 22, 30, 28, 35, 32, 38, 42, 45],
        inProgressData: [8, 12, 10, 15, 18, 20, 17, 22, 19, 25, 28, 30],
        pendingData: [15, 18, 12, 20, 16, 14, 18, 15, 20, 18, 16, 14]
      };
    }

    // Process backend monthly trends data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const completedData = new Array(12).fill(0);
    const inProgressData = new Array(12).fill(0);
    const pendingData = new Array(12).fill(0);

    (Array.isArray(analytics.monthlyTrends) ? analytics.monthlyTrends : []).forEach((trend) => {
      const rawMonth = trend?.month ?? trend?._id?.month;
      if (typeof rawMonth !== 'number') return;
      const monthIndex = rawMonth - 1; // Months are 1-indexed in MongoDB aggregations
      if (monthIndex < 0 || monthIndex > 11) return;

      const total = Number(trend?.count ?? trend?.total ?? trend?.value ?? 0) || 0;
      completedData[monthIndex] = Math.floor(total * 0.5);
      inProgressData[monthIndex] = Math.floor(total * 0.3);
      pendingData[monthIndex] = Math.floor(total * 0.2);
    });

    return {
      labels: months,
      completedData,
      inProgressData,
      pendingData
    };
  };

  // Helper function to prepare revenue data
  const prepareRevenueData = () => {
    if (!analytics || !analytics.monthlyRevenue || analytics.monthlyRevenue.length === 0) {
      // Return mock data
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: [18000, 28500, 22500, 37500, 33000, 45000, 42000, 52500, 48000, 57000, 63000, 67500]
      };
    }

    // Process backend revenue data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueData = new Array(12).fill(0);

    analytics.monthlyRevenue.forEach(revenue => {
      // Backend returns { month, year, totalRevenue, paymentCount }
      const monthIndex = (revenue.month || revenue._id?.month) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        revenueData[monthIndex] = revenue.totalRevenue || 0;
      }
    });

    return {
      labels: months,
      data: revenueData
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'in_process': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return <FaFileAlt className="text-blue-600" />;
      case 'under_review': return <FaClock className="text-yellow-600" />;
      case 'in_process': return <FaSpinner className="text-purple-600" />;
      case 'approved': return <FaCheckCircle className="text-green-600" />;
      case 'completed': return <FaCheckCircle className="text-emerald-600" />;
      case 'rejected': return <FaExclamationTriangle className="text-red-600" />;
      default: return <FaFileAlt className="text-gray-600" />;
    }
  };

  // Helper function to calculate comprehensive statistics
  const calculateComprehensiveStats = (applicationsData, employeesData, clientsData) => {
    const totalApplications = applicationsData.length;
    const totalClients = clientsData.length;
    const totalEmployees = employeesData.length;
    
    // Calculate active users
    const activeClients = clientsData.filter(client => 
      client.status === 'active' || client.status === 'Active' || !client.status
    ).length;
    
    const activeEmployees = employeesData.filter(emp => 
      emp.status === 'active' || emp.status === 'Active' || !emp.status
    ).length;
    
    // Calculate application status breakdown
    const pendingApplications = applicationsData.filter(app => 
      app.status?.current === 'submitted' || app.status === 'submitted'
    ).length;
    
    const completedApplications = applicationsData.filter(app => 
      app.status?.current === 'completed' || app.status?.current === 'approved' || 
      app.status === 'completed' || app.status === 'approved'
    ).length;
    
    const inProgressApplications = applicationsData.filter(app => 
      app.status?.current === 'under_review' || app.status?.current === 'in_process' ||
      app.status === 'under_review' || app.status === 'in_process'
    ).length;
    
    const rejectedApplications = applicationsData.filter(app => 
      app.status?.current === 'rejected' || app.status === 'rejected'
    ).length;
    
    // Calculate success rate
    const successRate = totalApplications > 0 ? (completedApplications / totalApplications) * 100 : 0;
    
    // Calculate average processing time (mock calculation)
    const averageProcessingTime = completedApplications > 0 ? 
      applicationsData.filter(app => 
        app.status?.current === 'completed' || app.status === 'completed'
      ).reduce((acc, app) => {
        const created = new Date(app.timestamps?.createdAt || app.createdAt);
        const completed = new Date(app.timestamps?.updatedAt || app.updatedAt);
        return acc + Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
      }, 0) / completedApplications : 0;
    
    // Calculate revenue (mock calculation - 1500 SAR per completed application)
    const totalRevenue = completedApplications * 1500;
    
    // Mock client satisfaction (85-95% range)
    const clientSatisfaction = 85 + Math.random() * 10;
    
    return {
      totalApplications,
      totalClients,
      totalEmployees,
      totalPartners: 0, // Mock data
      activeClients,
      activeEmployees,
      pendingApplications,
      completedApplications,
      inProgressApplications,
      rejectedApplications,
      totalRevenue,
      averageProcessingTime: Math.round(averageProcessingTime),
      successRate: Math.round(successRate * 100) / 100,
      clientSatisfaction: Math.round(clientSatisfaction * 100) / 100
    };
  };

  // Helper function to create mock analytics for compatibility
  const createMockAnalytics = (applicationsData, employeesData, clientsData, stats) => {
    const statusBreakdown = [
      { status: 'submitted', count: stats.pendingApplications },
      { status: 'under_review', count: Math.floor(stats.inProgressApplications / 2) },
      { status: 'in_process', count: Math.ceil(stats.inProgressApplications / 2) },
      { status: 'completed', count: stats.completedApplications },
      { status: 'rejected', count: stats.rejectedApplications }
    ];

    const serviceTypeBreakdown = [
      { serviceType: 'business_registration', count: Math.floor(stats.totalApplications * 0.4) },
      { serviceType: 'commercial_registration', count: Math.floor(stats.totalApplications * 0.3) },
      { serviceType: 'engineering_consultation', count: Math.floor(stats.totalApplications * 0.2) },
      { serviceType: 'other_services', count: Math.floor(stats.totalApplications * 0.1) }
    ];

    const recentApplications = applicationsData
      .sort((a, b) => new Date(b.timestamps?.createdAt || b.createdAt) - new Date(a.timestamps?.createdAt || a.createdAt))
      .slice(0, 10)
      .map(app => ({
        clientName: app.client?.name || t('admin.reportsManagement.unknownClient'),
        clientEmail: app.client?.email || t('admin.reportsManagement.unknownEmail'),
        serviceType: app.serviceDetails?.serviceType || app.serviceType || 'business_registration',
        status: app.status,
        assignedEmployees: Math.floor(Math.random() * 3) + 1,
        createdAt: app.timestamps?.createdAt || app.createdAt
      }));

    return {
      overview: {
        totalApplications: stats.totalApplications,
        totalClients: stats.totalClients,
        totalEmployees: stats.totalEmployees,
        totalPartners: stats.totalPartners
      },
      statusBreakdown,
      serviceTypeBreakdown,
      recentApplications
    };
  };

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#242021] rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-4">
              <FaSpinner className="animate-spin text-lg sm:text-2xl text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#ffd17a] border-2 border-white rounded-full"></div>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('admin.loadingReports')}</h3>
          <p className="text-sm sm:text-base text-gray-600">{t('admin.fetchingAnalyticsData')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-lg sm:text-2xl text-red-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('admin.errorLoadingReports')}</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#242021] text-white hover:bg-[#242021]/90 transition-colors font-medium rounded-lg"
          >
            {t('admin.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Modern Header - Matching Admin Dashboard Style */}
        <div className="relative overflow-hidden bg-[#242021] text-white shadow-2xl rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-48 sm:w-64 lg:w-96 h-48 sm:h-64 lg:h-96 bg-[#ffd17a]/10 transform rotate-45 translate-x-16 sm:translate-x-24 lg:translate-x-32 -translate-y-16 sm:-translate-y-24 lg:-translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-[#ffd17a]/10 transform -rotate-45 -translate-x-8 sm:-translate-x-12 lg:-translate-x-16 translate-y-8 sm:translate-y-12 lg:translate-y-16"></div>
          
          <div className="relative p-4 sm:p-6 lg:p-8 xl:p-12">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 sm:gap-6">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#ffd17a] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg sm:shadow-xl">
                    <FaChartBar className="text-lg sm:text-2xl text-[#242021]" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
                      {t('admin.reportsAndAnalytics')}
                    </h1>
                    <p className="text-[#ffd17a] text-sm sm:text-base lg:text-lg">
                      {t('admin.businessIntelligenceDashboard')}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 mt-4 sm:mt-6">
                  <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg">
                    <FaFileAlt className="text-[#ffd17a] text-xs sm:text-sm lg:text-base" />
                    <span className='text-xs sm:text-sm'>{t('admin.totalApplications')}: {formatNumber(comprehensiveStats.totalApplications)}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg">
                    <FaUsers className="text-[#ffd17a] text-xs sm:text-sm lg:text-base" />
                    <span className='text-xs sm:text-sm'>{t('admin.totalClients')}: {formatNumber(comprehensiveStats.totalClients)}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg">
                    <FaDollarSign className="text-[#ffd17a] text-xs sm:text-sm lg:text-base" />
                    <span className='text-xs sm:text-sm'>{t('admin.revenue')}: {formatCurrency(comprehensiveStats.totalRevenue)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <button className="group bg-white/10 rounded-lg sm:rounded-xl backdrop-blur-sm text-white border border-white/20 px-4 sm:px-6 py-2.5 sm:py-3 font-semibold hover:bg-white/20 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base">
                  <FaDownload className="text-sm sm:text-base" />
                  {t('admin.exportData')}
                </button>
                <button className="group bg-[#ffd17a] rounded-lg sm:rounded-xl text-[#242021] px-4 sm:px-6 py-2.5 sm:py-3 font-semibold hover:bg-[#ffd17a]/90 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base">
                  <FaPrint className="text-sm sm:text-base" />
                  {t('admin.generateReport')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2 text-[#ffd17a] w-4 h-4 sm:w-5 sm:h-5" />
              <span className='text-sm sm:text-base font-medium text-gray-700'>{t('admin.dateRange')}:</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200/50 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 text-sm sm:text-base"
              />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200/50 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 text-sm sm:text-base"
              />
              <button
                onClick={() => {
                  setDateRange({ startDate: '', endDate: '' });
                  if (activeTab !== 'overview') {
                    handleTabChange(activeTab);
                  }
                }}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors rounded-lg sm:rounded-xl text-sm sm:text-base"
              >
                {t('admin.clear')}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
          <nav className="flex overflow-x-auto">
            {[
              { id: 'overview', label: t('admin.overview'), icon: FaChartBar },
              { id: 'applications', label: t('admin.applications'), icon: FaFileAlt },
              { id: 'employees', label: t('admin.employees'), icon: FaUsers },
              { id: 'clients', label: t('admin.clients'), icon: FaUserTie },
              { id: 'performance', label: t('admin.performance'), icon: FaTrophy },
              { id: 'financial', label: t('admin.financial'), icon: FaDollarSign }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center justify-center py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium transition-all duration-200 flex-1 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#ffd17a]/10 to-[#ffd17a]/20 text-[#ffd17a] border-b-2 border-[#ffd17a]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <Icon className="mr-2 text-sm sm:text-lg" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl sm:rounded-2xl overflow-hidden">
          {activeTab === 'overview' && analytics && (
            <div className="p-6">
              {/* Enhanced Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="group relative bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">{t('admin.reportsManagement.totalApplications')}</p>
                      <p className="text-3xl font-bold">{formatNumber(comprehensiveStats.totalApplications)}</p>
                      <p className="text-blue-200 text-xs mt-1">
                        {comprehensiveStats.completedApplications} {t('admin.reportsManagement.completed')}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                      <FaFileAlt className="text-2xl text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="group relative bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium">{t('admin.reportsManagement.activeClients')}</p>
                      <p className="text-3xl font-bold">{formatNumber(comprehensiveStats.activeClients)}</p>
                      <p className="text-emerald-200 text-xs mt-1">
                        {comprehensiveStats.totalClients} {t('admin.reportsManagement.totalClients')}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                      <FaUsers className="text-2xl text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="group relative bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">{t('admin.reportsManagement.teamMembers')}</p>
                      <p className="text-3xl font-bold">{formatNumber(comprehensiveStats.activeEmployees)}</p>
                      <p className="text-purple-200 text-xs mt-1">
                        {comprehensiveStats.totalEmployees} {t('admin.reportsManagement.totalEmployees')}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                      <FaUserCheck className="text-2xl text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="group relative bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">{t('admin.reportsManagement.successRate')}</p>
                      <p className="text-3xl font-bold">{comprehensiveStats.successRate.toFixed(1)}%</p>
                      <p className="text-orange-200 text-xs mt-1">
                        {comprehensiveStats.averageProcessingTime} {t('admin.reportsManagement.avgDays')}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                      <FaTrophy className="text-2xl text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <FaCheckCircle className="text-white text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {formatNumber(comprehensiveStats.completedApplications)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.reportsManagement.completedApplications')}</h3>
                  <p className="text-sm text-gray-600">{t('admin.reportsManagement.successfullyProcessed')}</p>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                      <FaClock className="text-white text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-yellow-600">
                      {formatNumber(comprehensiveStats.pendingApplications)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.reportsManagement.pendingApplications')}</h3>
                  <p className="text-sm text-gray-600">{t('admin.reportsManagement.awaitingReview')}</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <FaSpinner className="text-white text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-purple-600">
                      {formatNumber(comprehensiveStats.inProgressApplications)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.reportsManagement.inProgressApplications')}</h3>
                  <p className="text-sm text-gray-600">{t('admin.reportsManagement.currentlyBeingProcessed')}</p>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                      <FaExclamationTriangle className="text-white text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-red-600">
                      {formatNumber(comprehensiveStats.rejectedApplications)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.reportsManagement.rejectedApplications')}</h3>
                  <p className="text-sm text-gray-600">{t('admin.reportsManagement.applicationsRejected')}</p>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Application Status Doughnut Chart */}
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaChartBar className="text-white text-lg" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{t('admin.reportsManagement.applicationStatus')}</h3>
                  </div>
                  <div className="relative h-72">
                    <Doughnut
                      data={{
                        labels: analytics.statusBreakdown.map(item => item.status.replace('_', ' ').toUpperCase()),
                        datasets: [{
                          label: t('admin.applications'),
                          data: analytics.statusBreakdown.map(item => item.count),
                          backgroundColor: [
                            'rgba(59, 130, 246, 0.8)',   // blue - submitted
                            'rgba(234, 179, 8, 0.8)',    // yellow - under review
                            'rgba(168, 85, 247, 0.8)',   // purple - in process
                            'rgba(34, 197, 94, 0.8)',    // green - completed
                            'rgba(239, 68, 68, 0.8)'     // red - rejected
                          ],
                          borderColor: [
                            'rgb(59, 130, 246)',
                            'rgb(234, 179, 8)',
                            'rgb(168, 85, 247)',
                            'rgb(34, 197, 94)',
                            'rgb(239, 68, 68)'
                          ],
                          borderWidth: 2,
                          hoverOffset: 10
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              padding: 15,
                              font: {
                                size: 12,
                                weight: 'bold'
                              },
                              usePointStyle: true,
                              pointStyle: 'circle'
                            }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: {
                              size: 14,
                              weight: 'bold'
                            },
                            bodyFont: {
                              size: 13
                            },
                            cornerRadius: 8
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Service Types Pie Chart */}
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaBuilding className="text-white text-lg" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{t('admin.reportsManagement.serviceTypes')}</h3>
                  </div>
                  <div className="relative h-72">
                    <Pie
                      data={{
                        labels: analytics.serviceTypeBreakdown.map(item => item.serviceType.replace('_', ' ').toUpperCase()),
                        datasets: [{
                          label: t('admin.reportsManagement.serviceTypes'),
                          data: analytics.serviceTypeBreakdown.map(item => item.count),
                          backgroundColor: [
                            'rgba(99, 102, 241, 0.8)',   // indigo
                            'rgba(236, 72, 153, 0.8)',   // pink
                            'rgba(14, 165, 233, 0.8)',   // sky
                            'rgba(251, 146, 60, 0.8)'    // orange
                          ],
                          borderColor: [
                            'rgb(99, 102, 241)',
                            'rgb(236, 72, 153)',
                            'rgb(14, 165, 233)',
                            'rgb(251, 146, 60)'
                          ],
                          borderWidth: 2,
                          hoverOffset: 10
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              padding: 15,
                              font: {
                                size: 12,
                                weight: 'bold'
                              },
                              usePointStyle: true,
                              pointStyle: 'circle'
                            }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: {
                              size: 14,
                              weight: 'bold'
                            },
                            bodyFont: {
                              size: 13
                            },
                            cornerRadius: 8
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Applications Trend Line Chart */}
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl p-6 mb-8 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FaChartLine className="text-white text-lg" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{t('admin.reportsManagement.applicationsTrend')}</h3>
                </div>
                <div className="relative h-80">
                  {(() => {
                    const trendData = prepareMonthlyTrendData();
                    return (
                      <Line
                        data={{
                          labels: trendData.labels,
                          datasets: [
                            {
                              label: t('admin.reportsManagement.completed'),
                              data: trendData.completedData,
                              borderColor: 'rgb(34, 197, 94)',
                              backgroundColor: 'rgba(34, 197, 94, 0.1)',
                              borderWidth: 3,
                              fill: true,
                              tension: 0.4,
                              pointRadius: 4,
                              pointHoverRadius: 6,
                              pointBackgroundColor: 'rgb(34, 197, 94)',
                              pointBorderColor: '#fff',
                              pointBorderWidth: 2
                            },
                            {
                              label: t('admin.reportsManagement.inProgress'),
                              data: trendData.inProgressData,
                              borderColor: 'rgb(168, 85, 247)',
                              backgroundColor: 'rgba(168, 85, 247, 0.1)',
                              borderWidth: 3,
                              fill: true,
                              tension: 0.4,
                              pointRadius: 4,
                              pointHoverRadius: 6,
                              pointBackgroundColor: 'rgb(168, 85, 247)',
                              pointBorderColor: '#fff',
                              pointBorderWidth: 2
                            },
                            {
                              label: t('admin.reportsManagement.pending'),
                              data: trendData.pendingData,
                              borderColor: 'rgb(234, 179, 8)',
                              backgroundColor: 'rgba(234, 179, 8, 0.1)',
                              borderWidth: 3,
                              fill: true,
                              tension: 0.4,
                              pointRadius: 4,
                              pointHoverRadius: 6,
                              pointBackgroundColor: 'rgb(234, 179, 8)',
                              pointBorderColor: '#fff',
                              pointBorderWidth: 2
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: {
                            mode: 'index',
                            intersect: false
                          },
                          plugins: {
                            legend: {
                              position: 'top',
                              align: 'end',
                              labels: {
                                padding: 20,
                                font: {
                                  size: 13,
                                  weight: 'bold'
                                },
                                usePointStyle: true,
                                boxWidth: 8,
                                boxHeight: 8
                              }
                            },
                            tooltip: {
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              padding: 12,
                              titleFont: {
                                size: 14,
                                weight: 'bold'
                              },
                              bodyFont: {
                                size: 13
                              },
                              cornerRadius: 8,
                              displayColors: true
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: 'rgba(0, 0, 0, 0.05)',
                                drawBorder: false
                              },
                              ticks: {
                                font: {
                                  size: 12,
                                  weight: '500'
                                },
                                padding: 10
                              }
                            },
                            x: {
                              grid: {
                                display: false
                              },
                              ticks: {
                                font: {
                                  size: 12,
                                  weight: '500'
                                },
                                padding: 10
                              }
                            }
                          }
                        }}
                      />
                    );
                  })()}
                </div>
              </div>

              {/* Revenue & Performance Bar Chart */}
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl p-6 mb-8 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FaDollarSign className="text-white text-lg" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{t('admin.reportsManagement.monthlyRevenue')}</h3>
                </div>
                <div className="relative h-80">
                  {(() => {
                    const revenueData = prepareRevenueData();
                    return (
                      <Bar
                        data={{
                          labels: revenueData.labels,
                          datasets: [{
                            label: t('admin.revenue') + ' (SAR)',
                            data: revenueData.data,
                            backgroundColor: revenueData.data.map(() => 'rgba(34, 197, 94, 0.8)'),
                            borderColor: 'rgb(34, 197, 94)',
                            borderWidth: 2,
                            borderRadius: 8,
                            hoverBackgroundColor: 'rgba(34, 197, 94, 1)'
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false
                            },
                            tooltip: {
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              padding: 12,
                              titleFont: {
                                size: 14,
                                weight: 'bold'
                              },
                              bodyFont: {
                                size: 13
                              },
                              cornerRadius: 8,
                              callbacks: {
                                label: function(context) {
                                  return t('admin.revenue') + ': ' + formatCurrency(context.parsed.y);
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: 'rgba(0, 0, 0, 0.05)',
                                drawBorder: false
                              },
                              ticks: {
                                font: {
                                  size: 12,
                                  weight: '500'
                                },
                                padding: 10,
                                callback: function(value) {
                                  return value.toLocaleString() + ' SAR';
                                }
                              }
                            },
                            x: {
                              grid: {
                                display: false
                              },
                              ticks: {
                                font: {
                                  size: 12,
                                  weight: '500'
                                },
                                padding: 10
                              }
                            }
                          }
                        }}
                      />
                    );
                  })()}
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FaFileAlt className="text-white text-sm" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('admin.reportsManagement.recentApplications')}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-purple-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.client')}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.serviceType')}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.status')}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.assigned')}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.date')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentApplications.map((app, index) => (
                        <tr key={index} className="border-b border-purple-100 hover:bg-white/50 transition-colors">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-semibold text-gray-900">{app.clientName}</p>
                              <p className="text-sm text-gray-500">{app.clientEmail}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700 capitalize">
                            {app.serviceType.replace('_', ' ')}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(typeof app.status === 'object' ? app.status.current : app.status)}`}>
                              {getStatusIcon(typeof app.status === 'object' ? app.status.current : app.status)}
                              <span className="ml-1 capitalize">{(typeof app.status === 'object' ? app.status.current : app.status)?.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {app.assignedEmployees} {t('admin.employees')}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {formatDate(app.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && applicationReports && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.reportsManagement.applicationReports')}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.applicationId')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.client')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.serviceType')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.status')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.processingDays')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.created')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicationReports.applications.map((app, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm font-mono text-gray-600">
                          {app.id.slice(-8)}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{app.client.name}</p>
                            <p className="text-sm text-gray-500">{app.client.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 capitalize">
                          {app.serviceType.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${getStatusColor(typeof app.status === 'object' ? app.status.current : app.status)}`}>
                            {getStatusIcon(typeof app.status === 'object' ? app.status.current : app.status)}
                            <span className="ml-1 capitalize">{(typeof app.status === 'object' ? app.status.current : app.status)?.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {app.processingDays} {t('admin.reportsManagement.days')}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {formatDate(app.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'employees' && employeeReports && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.reportsManagement.employeePerformance')}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.employee')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.assignedApplications')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.completedApplications')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.inProgressApplications')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.completionRate')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.avgProcessing')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeReports.employeePerformance.map((emp, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{emp.employeeName}</p>
                            <p className="text-sm text-gray-500">{emp.employeeEmail}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {formatNumber(emp.assignedApplications)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {formatNumber(emp.completedApplications)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {formatNumber(emp.inProgressApplications)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          <span className={`font-medium ${emp.completionRate >= 80 ? 'text-green-600' : emp.completionRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {emp.completionRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {emp.avgProcessingDays ? `${emp.avgProcessingDays} ${t('admin.reportsManagement.days')}` : t('admin.paymentManagement.nA')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.reportsManagement.clientAnalytics')}</h3>
              
              {/* Client Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <FaUsers className="text-white text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatNumber(comprehensiveStats.totalClients)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.reportsManagement.totalClients')}</h3>
                  <p className="text-sm text-gray-600">{t('admin.reportsManagement.registeredClients')}</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <FaCheckCircle className="text-white text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {formatNumber(comprehensiveStats.activeClients)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.reportsManagement.activeClients')}</h3>
                  <p className="text-sm text-gray-600">{t('admin.reportsManagement.currentlyActive')}</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <FaPercent className="text-white text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-purple-600">
                      {((comprehensiveStats.activeClients / comprehensiveStats.totalClients) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.reportsManagement.activityRate')}</h3>
                  <p className="text-sm text-gray-600">{t('admin.reportsManagement.percentageActive')}</p>
                </div>
              </div>

              {/* Client List */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.reportsManagement.clientDetails')}</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.clientName')}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.email')}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.status')}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.applications')}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.reportsManagement.joinedDate')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.slice(0, 10).map((client, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                                <FaUserTie className="text-white text-sm" />
                              </div>
                              <span className="font-semibold text-gray-900">{client.fullName || client.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">{client.email}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                              client.status === 'active' || !client.status ? 
                                'bg-green-100 text-green-800' : 
                                'bg-gray-100 text-gray-800'
                            }`}>
                              {client.status === 'active' || !client.status ? t('admin.reportsManagement.active') : client.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {applications.filter(app => app.client?.email === client.email).length}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {formatDate(client.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.reportsManagement.performanceAnalytics')}</h3>
              
              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <FaTrophy className="text-white text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {comprehensiveStats.successRate.toFixed(1)}%
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.reportsManagement.successRate')}</h3>
                  <p className="text-sm text-gray-600">{t('admin.reportsManagement.applicationCompletion')}</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <FaClock className="text-white text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {comprehensiveStats.averageProcessingTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.reportsManagement.avgProcessingTime')}</h3>
                  <p className="text-sm text-gray-600">{t('admin.reportsManagement.daysToComplete')}</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <FaStar className="text-white text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-purple-600">
                      {comprehensiveStats.clientSatisfaction.toFixed(1)}%
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.reportsManagement.clientSatisfaction')}</h3>
                  <p className="text-sm text-gray-600">{t('admin.reportsManagement.overallSatisfaction')}</p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <FaDollarSign className="text-white text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-orange-600">
                      {formatCurrency(comprehensiveStats.totalRevenue)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.reportsManagement.totalRevenue')}</h3>
                  <p className="text-sm text-gray-600">{t('admin.reportsManagement.generatedFromCompleted')}</p>
                </div>
              </div>

              {/* Employee Performance */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200 mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.reportsManagement.employeePerformanceOverview')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employees.slice(0, 6).map((employee, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-indigo-200">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                          <FaUserCheck className="text-white text-sm" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">{employee.fullName || employee.name}</h5>
                          <p className="text-sm text-gray-600">{employee.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-green-600">
                            {applications.filter(app => app.assignedEmployees?.some(emp => emp === employee._id)).length}
                          </p>
                          <p className="text-gray-600">{t('admin.reportsManagement.assignedApplications')}</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-blue-600">
                            {Math.floor(Math.random() * 90) + 10}%
                          </p>
                          <p className="text-gray-600">{t('admin.reportsManagement.success')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.reportsManagement.financialReports')}</h3>
              
              {/* Financial Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <FaDollarSign className="text-white text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(comprehensiveStats.totalRevenue)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.reportsManagement.totalRevenue')}</h3>
                  <p className="text-sm text-gray-600">{t('admin.reportsManagement.generatedFromCompleted')}</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <FaCheckCircle className="text-white text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatNumber(comprehensiveStats.completedApplications)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.reportsManagement.paidApplications')}</h3>
                  <p className="text-sm text-gray-600">{t('admin.reportsManagement.applicationsWithCompleted')}</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <FaChartLine className="text-white text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-purple-600">
                      {formatCurrency(comprehensiveStats.totalRevenue / Math.max(comprehensiveStats.completedApplications, 1))}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.reportsManagement.averageRevenue')}</h3>
                  <p className="text-sm text-gray-600">{t('admin.reportsManagement.perCompletedApplication')}</p>
                </div>
              </div>

              {/* Service Revenue Breakdown */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.reportsManagement.serviceRevenueBreakdown')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { service: t('admin.reportsManagement.businessRegistration'), revenue: comprehensiveStats.totalRevenue * 0.4, count: Math.floor(comprehensiveStats.completedApplications * 0.4) },
                    { service: t('admin.reportsManagement.commercialRegistration'), revenue: comprehensiveStats.totalRevenue * 0.3, count: Math.floor(comprehensiveStats.completedApplications * 0.3) },
                    { service: t('admin.reportsManagement.engineeringConsultation'), revenue: comprehensiveStats.totalRevenue * 0.2, count: Math.floor(comprehensiveStats.completedApplications * 0.2) },
                    { service: t('admin.reportsManagement.otherServices'), revenue: comprehensiveStats.totalRevenue * 0.1, count: Math.floor(comprehensiveStats.completedApplications * 0.1) }
                  ].map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-gray-900">{item.service}</h5>
                        <span className="text-lg font-bold text-emerald-600">{formatCurrency(item.revenue)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{item.count} {t('admin.reportsManagement.applicationsCount')}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(item.revenue / comprehensiveStats.totalRevenue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
