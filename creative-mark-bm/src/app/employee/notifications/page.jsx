"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaBell,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaArrowLeft,
  FaFilter,
  FaSearch,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaCalendarAlt,
  FaUser,
  FaFileAlt
} from 'react-icons/fa';
import { getEmployeeApplications } from '../../../services/employeeDashboardService';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);


      // Generate notifications from request data
      const response = await getEmployeeApplications({ limit: 100 });
      const requests = response.data || [];
      
      const generatedNotifications = generateNotificationsFromRequests(requests);
      setNotifications(generatedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const generateNotificationsFromRequests = (requests) => {
    const notifications = [];
    
    requests.forEach((request, index) => {
      // Status change notifications
      if (request.status === 'Submitted' && index < 5) {
        notifications.push({
          id: `status-${request._id}`,
          type: 'info',
          title: 'New Request Submitted',
          message: `A new ${request.type || 'service request'} has been submitted by ${request.client?.name || 'Unknown Client'}`,
          date: request.createdAt,
          read: false,
          priority: 'medium',
          actionUrl: `/employee/my-tasks?id=${request._id}`,
          requestId: request._id
        });
      }

      // Overdue notifications
      if (request.expectedCompletion && 
          new Date(request.expectedCompletion) < new Date() && 
          request.status !== 'Completed' &&
          index < 3) {
        notifications.push({
          id: `overdue-${request._id}`,
          type: 'urgent',
          title: 'Task Overdue',
          message: `${request.type || 'Service request'} is past its due date`,
          date: request.expectedCompletion,
          read: false,
          priority: 'high',
          actionUrl: `/employee/my-tasks?id=${request._id}`,
          requestId: request._id
        });
      }

      // Completion notifications
      if (request.status === 'Completed' && index < 3) {
        notifications.push({
          id: `completed-${request._id}`,
          type: 'success',
          title: 'Task Completed',
          message: `Successfully completed ${request.type || 'service request'}`,
          date: request.updatedAt,
          read: false,
          priority: 'low',
          actionUrl: `/employee/my-tasks?id=${request._id}`,
          requestId: request._id
        });
      }
    });

    // Add some system notifications
    notifications.push(
      {
        id: 'system-1',
        type: 'info',
        title: 'System Update',
        message: 'The system has been updated with new features',
        date: '2024-01-15T10:00:00.000Z',
        read: true,
        priority: 'low',
        actionUrl: null,
        requestId: null
      },
      {
        id: 'system-2',
        type: 'urgent',
        title: 'Maintenance Scheduled',
        message: 'System maintenance scheduled for tomorrow at 2 AM',
        date: '2024-01-16T10:00:00.000Z',
        read: false,
        priority: 'high',
        actionUrl: null,
        requestId: null
      }
    );

    // Sort by date (newest first)
    return notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'urgent':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'info':
        return <FaInfoCircle className="text-blue-500" />;
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
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

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesRead = filterRead === 'all' || 
      (filterRead === 'read' && notification.read) ||
      (filterRead === 'unread' && !notification.read);
    
    return matchesSearch && matchesType && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-green-600 mb-4" />
          <p className="text-xl text-gray-800 font-semibold">Loading notifications...</p>
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
            onClick={loadNotifications}
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
                Notifications
              </h1>
              <p className="text-lg text-gray-600">
                Stay updated with your tasks and system alerts
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-800 px-3 py-1 text-sm font-medium rounded-full">
                  {unreadCount} unread
                </span>
              )}
              <button 
                onClick={markAllAsRead}
                className="flex items-center justify-center px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md"
              >
                Mark All Read
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
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Types</option>
              <option value="urgent">Urgent</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
            </select>

            {/* Read Status Filter */}
            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
              className="px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={loadNotifications}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <FaFilter className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`bg-white border border-gray-300 p-6 hover:shadow-md transition-shadow ${
                  !notification.read ? 'border-l-4 border-l-green-500' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Notification Icon */}
                  <div className={`p-3 ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500 flex items-center">
                            <FaCalendarAlt className="mr-1" />
                            {formatDate(notification.date)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {getTimeAgo(notification.date)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium ${
                            notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                            notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {notification.priority} priority
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-green-600 hover:text-green-700"
                            title="Mark as read"
                          >
                            <FaEye />
                          </button>
                        )}
                        {notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Mark as unread"
                          >
                            <FaEyeSlash />
                          </button>
                        )}
                        {notification.actionUrl && (
                          <button
                            onClick={() => router.push(notification.actionUrl)}
                            className="text-blue-600 hover:text-blue-700"
                            title="View details"
                          >
                            <FaFileAlt />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete notification"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterType !== 'all' || filterRead !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'You\'re all caught up! No new notifications.'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterRead('all');
              }}
              className="bg-green-600 text-white px-6 py-3 hover:bg-green-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
