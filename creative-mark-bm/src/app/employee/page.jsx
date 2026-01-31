"use client";

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaTachometerAlt,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaUsers,
  FaExclamationTriangle,
  FaSpinner,
  FaArrowRight,
  FaPlus,
  FaEye,
  FaBell,
  FaCalendarAlt,
  FaChartBar,
  FaUserCheck,
  FaTasks,
  FaArrowUp,
  FaArrowDown,
  FaCalendar,
  FaUser,
  FaClipboardList,
  FaStopwatch,
  FaFlag,
  FaThumbsUp,
  FaComments,
  FaUpload,
  FaDownload,
  FaBuilding,
  FaUserTie,
  FaDollarSign,
  FaFileInvoice,
  FaHandshake,
  FaSearch,
  FaFilter,
  FaCog
} from 'react-icons/fa';
import { FullPageLoading } from '../../components/LoadingSpinner';
import AuthContext from '../../contexts/AuthContext';
import { 
  getEmployeeDashboardStats,
  getEmployeeApplications,
  getEmployeeRecentActivities,
  getEmployeePerformance,
  getEmployeeDeadlines,
  getEmployeeNotifications
} from '../../services/employeeDashboardService';

export default function EmployeeDashboard() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  
  // State management
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalAssigned: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
      thisWeek: 0,
      completionRate: 0,
      avgCompletionTime: 0
    },
    recentApplications: [],
    recentActivities: [],
    performance: {
      thisMonth: 0,
      lastMonth: 0,
      trend: 'up'
    },
    deadlines: [],
    notifications: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);


      // Fetch all dashboard data in parallel
      const [
        statsResponse,
        applicationsResponse,
        activitiesResponse,
        performanceResponse,
        deadlinesResponse,
        notificationsResponse
      ] = await Promise.allSettled([
        getEmployeeDashboardStats(),
        getEmployeeApplications({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        getEmployeeRecentActivities(8),
        getEmployeePerformance('month'),
        getEmployeeDeadlines(),
        getEmployeeNotifications()
      ]);

      // Process responses and map to frontend structure
      const statsData = statsResponse.status === 'fulfilled' ? statsResponse.value.data : {};
      const applicationsData = applicationsResponse.status === 'fulfilled' ? applicationsResponse.value.data : [];
      const activitiesData = activitiesResponse.status === 'fulfilled' ? activitiesResponse.value.data : [];
      const performanceData = performanceResponse.status === 'fulfilled' ? performanceResponse.value.data : {};
      const deadlinesData = deadlinesResponse.status === 'fulfilled' ? deadlinesResponse.value.data : [];
      const notificationsData = notificationsResponse.status === 'fulfilled' ? notificationsResponse.value.data : [];

      const newDashboardData = {
        stats: {
          totalAssigned: statsData.totalApplications || 0,
          pending: statsData.pendingApplications || 0,
          inProgress: 0, // Will be calculated from applications
          completed: statsData.completedApplications || 0,
          overdue: statsData.overdueApplications || 0,
          thisWeek: statsData.thisWeekApplications || 0,
          completionRate: statsData.completionRate || 0,
          avgCompletionTime: statsData.averageCompletionTime || 0
        },
        recentApplications: applicationsData,
        recentActivities: activitiesData,
        performance: {
          totalTasks: performanceData.totalTasks || 0,
          completedTasks: performanceData.completedTasks || 0,
          pendingTasks: performanceData.pendingTasks || 0,
          overdueTasks: performanceData.overdueTasks || 0,
          averageCompletionTime: performanceData.averageCompletionTime || 0,
          successRate: performanceData.successRate || 0,
          monthlyData: performanceData.monthlyData || []
        },
        deadlines: deadlinesData,
        notifications: notificationsData
      };

      setDashboardData(newDashboardData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Modern Stat Card Component
  const StatCard = ({ title, value, icon: Icon, color, onClick, subtitle, trend, trendValue }) => (
    <div 
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 transition-all duration-300 group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mb-2">{subtitle}</p>}
          {trend && (
            <div className="flex items-center space-x-1">
              {trend === 'up' ? (
                <FaArrowUp className="h-3 w-3 text-emerald-500" />
              ) : (
                <FaArrowDown className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br from-${color}-100 to-${color}-200 group-hover:from-${color}-200 group-hover:to-${color}-300 transition-all duration-300`}>
          <Icon className={`text-2xl text-${color}-600`} />
        </div>
      </div>
    </div>
  );

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading State
  if (loading) {
    return <FullPageLoading text="Loading Employee Dashboard..." />;
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <FaExclamationTriangle className="text-4xl text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="btn-primary px-8 py-3"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name || 'Employee'}! 👋
              </h1>
              <p className="text-lg text-gray-600">
                Here's what's happening with your tasks today
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button 
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium rounded-lg shadow-sm"
              >
                <FaSpinner className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button 
                onClick={() => router.push('/employee/my-tasks')}
                className="flex items-center justify-center px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md"
              >
                <FaTasks className="h-4 w-4 mr-2" />
                <span>View All Tasks</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Assigned"
            value={dashboardData.stats.totalAssigned}
            icon={FaClipboardList}
            color="blue"
            subtitle="All tasks assigned to you"
            trend="up"
            trendValue="+12%"
            onClick={() => router.push('/employee/my-tasks')}
          />
          <StatCard
            title="Pending"
            value={dashboardData.stats.pending}
            icon={FaClock}
            color="yellow"
            subtitle="Awaiting your action"
            onClick={() => router.push('/employee/my-tasks?status=pending')}
          />
          <StatCard
            title="Completed"
            value={dashboardData.stats.completed}
            icon={FaCheckCircle}
            color="emerald"
            subtitle="Successfully finished"
            trend="up"
            trendValue="+8%"
            onClick={() => router.push('/employee/my-tasks?status=completed')}
          />
          <StatCard
            title="Overdue"
            value={dashboardData.stats.overdue}
            icon={FaFlag}
            color="red"
            subtitle="Past due date"
            onClick={() => router.push('/employee/my-tasks?status=overdue')}
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Completion Rate</h3>
              <FaThumbsUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-2">
              {dashboardData.stats.completionRate}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${dashboardData.stats.completionRate}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">This month's performance</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Avg. Completion Time</h3>
              <FaClock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {dashboardData.stats.avgCompletionTime}
            </div>
            <p className="text-sm text-gray-600">Days per task</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
              <FaCalendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {dashboardData.stats.thisWeek}
            </div>
            <p className="text-sm text-gray-600">Tasks due this week</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Recent Applications */}
          <div className="xl:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
                  <button 
                    onClick={() => router.push('/employee/my-tasks')}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <span>View All</span>
                    <FaArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {dashboardData.recentApplications.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentApplications.map((application) => (
                      <div 
                        key={application._id}
                        className="p-4 border border-gray-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/50 cursor-pointer transition-all duration-200 group"
                        onClick={() => router.push(`/employee/application-details/${application._id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700">
                                {application.serviceType || 'Service Request'}
                              </h3>
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                                {application.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              #{application.requestNumber || application._id.slice(-8)}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              Client: {application.client?.name || 'Unknown Client'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(application.createdAt)}
                            </p>
                            {application.progressPercentage && (
                              <div className="mt-3">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span>Progress</span>
                                  <span>{application.progressPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${application.progressPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                          <button className="text-gray-400 group-hover:text-emerald-600 transition-colors">
                            <FaEye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaClipboardList className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-500">You'll see your assigned tasks here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/employee/my-tasks?status=pending')}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                        <FaClock className="h-4 w-4 text-yellow-600" />
                      </div>
                      <span className="font-medium text-gray-900">Pending Tasks</span>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 text-sm font-medium rounded-full">
                      {dashboardData.stats.pending}
                    </span>
                  </button>

                  <button 
                    onClick={() => router.push('/employee/my-tasks?status=in-progress')}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                        <FaStopwatch className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="font-medium text-gray-900">Continue Working</span>
                    </div>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 text-sm font-medium rounded-full">
                      {dashboardData.stats.inProgress}
                    </span>
                  </button>

                  <button 
                    onClick={() => router.push('/employee/my-tasks?status=overdue')}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                        <FaFlag className="h-4 w-4 text-red-600" />
                      </div>
                      <span className="font-medium text-gray-900">Urgent Tasks</span>
                    </div>
                    <span className="bg-red-100 text-red-800 px-3 py-1 text-sm font-medium rounded-full">
                      {dashboardData.stats.overdue}
                    </span>
                  </button>

                  <button 
                    onClick={() => router.push('/employee/reports')}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                        <FaChartBar className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="font-medium text-gray-900">My Performance</span>
                    </div>
                    <FaArrowRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  </button>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
              </div>
              <div className="p-6">
                {dashboardData.deadlines.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.deadlines.slice(0, 3).map((deadline) => (
                      <div key={deadline.id} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200">
                        <div className={`p-2 rounded-lg ${
                          deadline.priority === 'urgent' ? 'bg-red-100' :
                          deadline.priority === 'high' ? 'bg-orange-100' :
                          'bg-blue-100'
                        }`}>
                          <FaCalendar className={`h-4 w-4 ${
                            deadline.priority === 'urgent' ? 'text-red-600' :
                            deadline.priority === 'high' ? 'text-orange-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                          <p className="text-xs text-gray-600">Client: {deadline.client}</p>
                          <p className="text-xs text-gray-500">
                            {deadline.daysUntilDeadline > 0 ? 
                              `${deadline.daysUntilDeadline} days left` : 
                              deadline.daysUntilDeadline === 0 ? 
                              'Due today' : 
                              `${Math.abs(deadline.daysUntilDeadline)} days overdue`
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaCalendar className="text-4xl text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No upcoming deadlines</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              </div>
              <div className="p-6">
                {dashboardData.recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentActivities.slice(0, 4).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FaComments className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-600">
                            {activity.application?.type} - {activity.application?.status}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(activity.date)} by {activity.user?.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaComments className="text-4xl text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No recent activities</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
