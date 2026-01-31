"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaList, 
  FaFileAlt, 
  FaSpinner,
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaEye,
  FaEdit,
  FaCalendarAlt,
  FaUser,
  FaFlag,
  FaTimes,
  FaArrowLeft,
  FaClipboardList,
  FaPlay
} from 'react-icons/fa';
import api from '../../../services/api';

const AssignTasksPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  const tabs = [
    { id: 'all', label: 'All Tasks', icon: FaList, count: 0, color: 'blue' },
    { id: 'open', label: 'Open', icon: FaClock, count: 0, color: 'gray' },
    { id: 'in_progress', label: 'In Progress', icon: FaPlay, count: 0, color: 'blue' },
    { id: 'completed', label: 'Completed', icon: FaCheckCircle, count: 0, color: 'green' },
    { id: 'cancelled', label: 'Cancelled', icon: FaTimes, count: 0, color: 'red' },
  ];

  useEffect(() => {
    fetchAssignedTasks();
  }, [router]);

  const fetchAssignedTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks/my-tasks');
      setTasks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, status, note = '') => {
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, {
        status,
        note,
        updatedBy: 'employee'
      });
      if (response.data.success) {
        setTasks(prev => prev.map(task => 
          task._id === taskId ? response.data.data : task
        ));
        setShowTaskModal(false);
        setStatusNote('');
        
        // Show success message
        const task = tasks.find(t => t._id === taskId);
        alert(`Task "${task?.title}" status updated to ${status}! Admin has been notified.`);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Error updating task status. Please try again.');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesTab = activeTab === 'all' || task.status === activeTab;
    const matchesSearch = searchTerm === '' || 
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return '📋';
      case 'in_progress': return '⚙️';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      default: return '📄';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'open': return 0;
      case 'in_progress': return 50;
      case 'completed': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-white/20">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <FaSpinner className="animate-spin text-3xl text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 border-3 border-white rounded-full shadow-lg"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Loading Your Tasks</h3>
          <p className="text-gray-600 text-lg">Fetching assigned tasks from administrators...</p>
          <div className="mt-6 w-32 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <button
                    onClick={() => router.back()}
                    className="p-3 hover:bg-white/60 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/20 shadow-sm"
                  >
                    <FaArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <FaClipboardList className="text-white text-2xl" />
                  </div>
                  <div>
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-transparent tracking-tight">
                      Assigned Tasks
                    </h1>
                    <p className="text-sm text-green-600 font-semibold uppercase tracking-widest mt-1">
                      Creative Mark Employee Portal
                    </p>
                  </div>
                </div>
                <p className="text-lg sm:text-xl text-gray-700 font-medium max-w-3xl leading-relaxed">
                  Manage and track tasks assigned to you by administrators with real-time updates and progress tracking
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search tasks by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-700 placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Task Statistics Dashboard */}
          <div className="mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Total Tasks</p>
                    <p className="text-3xl font-bold text-gray-900">{tasks.length}</p>
                    <p className="text-xs text-gray-500 mt-1">All assigned tasks</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FaList className="w-7 h-7 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">In Progress</p>
                    <p className="text-3xl font-bold text-green-600">
                      {tasks.filter(task => task.status === 'in_progress').length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Currently working</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FaPlay className="w-7 h-7 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-green-600">
                      {tasks.filter(task => task.status === 'completed').length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Successfully finished</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FaCheckCircle className="w-7 h-7 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Open</p>
                    <p className="text-3xl font-bold text-gray-600">
                      {tasks.filter(task => task.status === 'open').length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Waiting to start</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FaClock className="w-7 h-7 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Tab Navigation */}
          <div className="mb-10">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-3">
              <nav className="flex space-x-3 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const count = tasks.filter(task => 
                    tab.id === 'all' || task.status === tab.id
                  ).length;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group relative flex-shrink-0 flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 text-white shadow-xl transform scale-105'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                        <span>{tab.label}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isActive 
                            ? 'bg-white/25 text-white' 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        }`}>
                          {count}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredTasks.map((task) => (
              <div key={task._id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 group hover:scale-[1.02]">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors leading-tight">
                          {task.title}
                        </h3>
                        <span className="text-3xl">{getStatusIcon(task.status)}</span>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskModal(true);
                      }}
                      className="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200"
                      title="View Details"
                    >
                      <FaEye className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-gray-800">{getProgressPercentage(task.status)}%</span>
                    </div>
                    <div className="w-full bg-gray-200/60 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          task.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          task.status === 'in_progress' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          'bg-gradient-to-r from-gray-300 to-gray-400'
                        }`}
                        style={{ width: `${getProgressPercentage(task.status)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    {task.priority && (
                      <span className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 ${getPriorityColor(task.priority)}`}>
                        <FaFlag className="w-4 h-4 inline mr-2" />
                        {task.priority}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <FaUser className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="font-medium">Assigned by: {task.assignedBy?.fullName || task.assignedBy?.name || 'Admin'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <FaCalendarAlt className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="font-medium">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    {task.estimatedHours && (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <FaClock className="w-4 h-4 text-orange-600" />
                        </div>
                        <span className="font-medium">Est. {task.estimatedHours}h</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {task.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-sm rounded-full font-medium border border-gray-200">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related Application */}
                  {task.applicationId && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-bold text-emerald-900">📋 Related Application</span>
                            <span className={`px-3 py-1 rounded-xl text-xs font-bold border-2 ${
                              typeof task.applicationId.status === 'object'
                                ? task.applicationId.status.current === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                                  task.applicationId.status.current === 'in_process' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  task.applicationId.status.current === 'under_review' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                  'bg-gray-100 text-gray-800 border-gray-200'
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              {typeof task.applicationId.status === 'object' ? task.applicationId.status.current : task.applicationId.status || 'Unknown'}
                            </span>
                          </div>
                          <p className="text-sm text-emerald-800 font-semibold">
                            {typeof task.applicationId === 'object'
                              ? task.applicationId.serviceType?.replace('_', ' ') || 'Unknown Service'
                              : 'Application'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskModal(true);
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <FaEdit className="w-4 h-4" />
                      Update Status
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskModal(true);
                      }}
                      className="px-6 py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-bold rounded-xl transition-all duration-200 hover:bg-gray-50 shadow-md hover:shadow-lg"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FaClipboardList className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No tasks found</h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                {searchTerm ? 'Try adjusting your search criteria to find the tasks you\'re looking for.' : 'No tasks have been assigned to you by administrators yet.'}
              </p>
              {!searchTerm && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 max-w-md mx-auto">
                  <p className="text-green-800 font-medium">
                    💡 Tasks will appear here once administrators assign them to you.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Task Details Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-8 border-b border-gray-100/50 bg-gradient-to-r from-green-50/80 to-emerald-50/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FaClipboardList className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Task Details</h2>
                    <p className="text-lg text-green-600 font-semibold">
                      {selectedTask.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="p-3 hover:bg-white/60 rounded-xl transition-all duration-200 border border-white/20"
                >
                  <FaTimes className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Task Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Title</h3>
                  <p className="text-gray-900 font-bold text-lg">
                    {selectedTask.title}
                  </p>
                </div>
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Assigned By</h3>
                  <p className="text-gray-900 font-bold text-lg">
                    {selectedTask.assignedBy?.fullName || selectedTask.assignedBy?.name || 'Admin'}
                  </p>
                </div>
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Current Status</h3>
                  <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getStatusColor(selectedTask.status)}`}>
                    {getStatusIcon(selectedTask.status)} {selectedTask.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Due Date</h3>
                  <p className="text-gray-900 font-bold text-lg">
                    {new Date(selectedTask.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Description</h3>
                <p className="text-gray-900 text-lg leading-relaxed">
                  {selectedTask.description}
                </p>
              </div>

              {/* Related Application */}
              {selectedTask.applicationId && (
                <div className="bg-gradient-to-r from-emerald-50/80 to-green-50/80 rounded-2xl p-6 border-2 border-emerald-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Related Application</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-emerald-900">Application Details</span>
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold border-2 ${
                          typeof selectedTask.applicationId.status === 'object'
                            ? selectedTask.applicationId.status.current === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                              selectedTask.applicationId.status.current === 'in_process' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              selectedTask.applicationId.status.current === 'under_review' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {typeof selectedTask.applicationId.status === 'object' ? selectedTask.applicationId.status.current : selectedTask.applicationId.status || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-sm text-emerald-800 font-bold">
                        {typeof selectedTask.applicationId === 'object'
                          ? selectedTask.applicationId.serviceType?.replace('_', ' ') || 'Unknown Service'
                          : 'Application'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Update Section */}
              <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-2xl p-6 border-2 border-green-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Update Task Status</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                      New Status
                    </label>
                    <select
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold"
                      onChange={(e) => {
                        // Handle status change
                      }}
                    >
                      <option value="open">📋 Open</option>
                      <option value="in_progress">⚙️ In Progress</option>
                      <option value="completed">✅ Completed</option>
                      <option value="cancelled">❌ Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                      Update Note (Optional)
                    </label>
                    <textarea
                      rows={4}
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 resize-none bg-white/80 backdrop-blur-sm text-gray-700 placeholder-gray-500"
                      placeholder="Add a note about this status update..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-200 font-bold shadow-lg hover:shadow-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const newStatus = document.querySelector('select').value;
                    handleStatusUpdate(selectedTask._id, newStatus, statusNote);
                  }}
                  className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl transition-all duration-200 font-bold shadow-xl hover:shadow-2xl flex items-center gap-3 transform hover:scale-105"
                >
                  <FaEdit className="w-5 h-5" />
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssignTasksPage;