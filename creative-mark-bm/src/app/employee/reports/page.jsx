"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaArrowLeft,
  FaDownload,
  FaCalendarAlt,
  FaFilter,
  FaFileAlt,
  FaTrophy,
  FaStar,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { getEmployeeApplications } from '../../../services/employeeDashboardService';

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState({
    performance: {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      averageCompletionTime: 0,
      successRate: 0
    },
    monthly: [],
    recentActivity: [],
    achievements: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    loadReportsData();
  }, [selectedPeriod]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      setError(null);


      const response = await getEmployeeApplications({ limit: 200 });
      const tasks = response.data || [];

      // Calculate performance metrics
      const completedTasks = tasks.filter(task => task.status === 'Completed');
      const pendingTasks = tasks.filter(task => 
        task.status === 'Submitted' || task.status === 'Under Review' || task.status === 'In Progress'
      );

      // Calculate average completion time
      const completedWithTime = completedTasks.filter(task => 
        task.actualCompletion && task.createdAt
      );
      const avgCompletionTime = completedWithTime.length > 0 
        ? completedWithTime.reduce((sum, task) => {
            const completionTime = (new Date(task.actualCompletion) - new Date(task.createdAt)) / (1000 * 60 * 60 * 24);
            return sum + completionTime;
          }, 0) / completedWithTime.length
        : 0;

      const successRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

      // Generate monthly data
      const monthlyData = generateMonthlyData(tasks, parseInt(selectedPeriod));

      // Generate recent activity
      const recentActivity = generateRecentActivity(tasks);

      // Generate achievements
      const achievements = generateAchievements(tasks, completedTasks);

      setReports({
        performance: {
          totalTasks: tasks.length,
          completedTasks: completedTasks.length,
          pendingTasks: pendingTasks.length,
          averageCompletionTime: Math.round(avgCompletionTime * 10) / 10,
          successRate: Math.round(successRate * 10) / 10
        },
        monthly: monthlyData,
        recentActivity,
        achievements
      });
    } catch (error) {
      console.error('Error loading reports data:', error);
      setError('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (tasks, months) => {
    const data = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthTasks = tasks.filter(task => 
        task.createdAt >= monthStart && task.createdAt <= monthEnd
      );
      const monthCompleted = monthTasks.filter(task => task.status === 'Completed');
      
      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        tasks: monthTasks.length,
        completed: monthCompleted.length,
        successRate: monthTasks.length > 0 ? (monthCompleted.length / monthTasks.length) * 100 : 0
      });
    }
    
    return data;
  };

  const generateRecentActivity = (tasks) => {
    return tasks
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 10)
      .map(task => ({
        id: task._id,
        type: task.type || 'Service Request',
        status: task.status,
        client: task.client?.name || 'Unknown Client',
        date: task.updatedAt,
        progress: task.progressPercentage || 0
      }));
  };

  const generateAchievements = (tasks, completedTasks) => {
    const achievements = [];
    
    if (completedTasks.length >= 10) {
      achievements.push({
        title: "Task Master",
        description: "Completed 10+ tasks",
        icon: FaTrophy,
        color: "yellow",
        unlocked: true
      });
    }
    
    if (completedTasks.length >= 50) {
      achievements.push({
        title: "Productivity Champion",
        description: "Completed 50+ tasks",
        icon: FaStar,
        color: "gold",
        unlocked: true
      });
    }
    
    if (tasks.length >= 100) {
      achievements.push({
        title: "Workhorse",
        description: "Handled 100+ tasks",
        icon: FaFileAlt,
        color: "blue",
        unlocked: true
      });
    }
    
    const avgTime = completedTasks.length > 0 
      ? completedTasks.reduce((sum, task) => {
          if (task.actualCompletion && task.createdAt) {
            const completionTime = (new Date(task.actualCompletion) - new Date(task.createdAt)) / (1000 * 60 * 60 * 24);
            return sum + completionTime;
          }
          return sum;
        }, 0) / completedTasks.length
      : 0;
    
    if (avgTime <= 5) {
      achievements.push({
        title: "Speed Demon",
        description: "Average completion time under 5 days",
        icon: FaClock,
        color: "green",
        unlocked: true
      });
    }
    
    return achievements;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-green-600 mb-4" />
          <p className="text-xl text-gray-800 font-semibold">Loading reports...</p>
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
            onClick={loadReportsData}
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
                Performance Reports
              </h1>
              <p className="text-lg text-gray-600">
                Track your productivity and achievements
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-200"
              >
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="180">Last 6 months</option>
                <option value="365">Last year</option>
              </select>
              <button className="flex items-center justify-center px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md">
                <FaDownload className="mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{reports.performance.totalTasks}</p>
              </div>
              <div className="p-3 bg-blue-100">
                <FaFileAlt className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{reports.performance.completedTasks}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <FaArrowUp className="mr-1" />
                  {reports.performance.successRate}% success rate
                </p>
              </div>
              <div className="p-3 bg-green-100">
                <FaCheckCircle className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{reports.performance.pendingTasks}</p>
              </div>
              <div className="p-3 bg-yellow-100">
                <FaClock className="text-2xl text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                <p className="text-3xl font-bold text-gray-900">{reports.performance.averageCompletionTime}</p>
                <p className="text-sm text-gray-600">days</p>
              </div>
              <div className="p-3 bg-purple-100">
                <FaClock className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900">{reports.performance.successRate}%</p>
              </div>
              <div className="p-3 bg-green-100">
                <FaChartLine className="text-2xl text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Performance Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Monthly Performance</h2>
              <FaChartBar className="text-gray-400" />
            </div>
            <div className="space-y-4">
              {reports.monthly.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500"></div>
                    <span className="font-medium text-gray-900">{month.month}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">{month.tasks} tasks</span>
                    <span className="text-sm text-green-600">{month.completed} completed</span>
                    <span className="text-sm font-medium text-gray-900">{Math.round(month.successRate)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Achievements</h2>
              <FaTrophy className="text-yellow-500" />
            </div>
            <div className="space-y-4">
              {reports.achievements.length > 0 ? (
                reports.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200">
                    <div className={`p-2 bg-${achievement.color}-100`}>
                      <achievement.icon className={`text-lg text-${achievement.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{achievement.title}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FaTrophy className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No achievements yet</p>
                  <p className="text-sm text-gray-400">Complete more tasks to unlock achievements</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-300 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <FaFilter className="text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            {reports.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {reports.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 flex items-center justify-center">
                        <FaFileAlt className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{activity.type}</h3>
                        <p className="text-sm text-gray-600">{activity.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs font-medium border ${
                        activity.status === 'Completed' ? 'bg-green-50 text-green-800 border-green-200' :
                        activity.status === 'In Progress' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                        'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                        {activity.status}
                      </span>
                      <span className="text-sm text-gray-600">{getTimeAgo(activity.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaChartLine className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
