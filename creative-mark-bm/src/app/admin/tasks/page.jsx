"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  FaClock,
  FaExclamationTriangle,
  FaBars,
  FaTimes,
  FaEdit,
  FaTrash,
  FaEye
} from 'react-icons/fa';
import api from '../../../services/api';
import { useTranslation } from '../../../i18n/TranslationContext';

const AdminTasksPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Form state for creating tasks
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    applicationId: '',
    dueDate: '',
    estimatedHours: '',
    tags: []
  });

  const tabs = [
    { id: 'all', label: t('admin.taskManagement.allTasks'), icon: FaList, count: 0 },
    { id: 'open', label: t('admin.taskManagement.open'), icon: FaClock, count: 0 },
    { id: 'in_progress', label: t('admin.taskManagement.inProgress'), icon: FaTasks, count: 0 },
    { id: 'completed', label: t('admin.taskManagement.completed'), icon: FaCheckCircle, count: 0 },
  ];

  useEffect(() => {
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, employeesRes, applicationsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/employees'),
        api.get('/applications/all')
      ]);

      setTasks(tasksRes.data.data || []);
      setEmployees(employeesRes.data.data || []);
      setApplications(applicationsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      // Prepare data for API call
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
        applicationId: formData.applicationId || null,
        tags: formData.tags || []
      };
      
      const response = await api.post('/tasks', taskData);
      if (response.data.success) {
        setTasks(prev => [response.data.data, ...prev]);
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          assignedTo: '',
          applicationId: '',
          dueDate: '',
          estimatedHours: '',
          tags: []
        });
        
        // Show success message
        alert(t('admin.taskManagement.taskCreatedSuccessfully'));
      }
    } catch (error) {
      console.error('Error creating task:', error);
      console.error('Error response:', error.response?.data);
      console.error('Form data being sent:', taskData);
      
      // Show user-friendly error message
      if (error.response?.data?.message) {
        alert(`${t('admin.taskManagement.errorCreatingTask')} ${error.response.data.message}`);
      } else {
        alert(t('admin.taskManagement.errorCreatingTaskCheckConsole'));
      }
    }
  };

  const handleStatusUpdate = async (taskId, status, note = '') => {
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, {
        status,
        note
      });
      if (response.data.success) {
        setTasks(prev => prev.map(task => 
          task._id === taskId ? response.data.data : task
        ));
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesTab = activeTab === 'all' || task.status === activeTab;
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate, status) => {
    return new Date(dueDate) < new Date() && status !== 'completed';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200/50">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#242021] rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSpinner className="animate-spin text-lg sm:text-2xl text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#ffd17a] border-2 border-white rounded-full"></div>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('admin.taskManagement.loadingTasks')}</h3>
          <p className="text-sm sm:text-base text-gray-600">{t('admin.taskManagement.fetchingLatestTaskData')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8 lg:mb-12">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 sm:gap-6">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#242021] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg sm:shadow-xl">
                    <FaTasks className="text-lg sm:text-2xl text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                      {t('admin.taskManagement.taskManagement')}
                    </h1>
                    <p className="text-sm text-[#242021] font-medium uppercase tracking-wider">
                      {t('admin.taskManagement.creativeMarkAdminPortal')}
                    </p>
                  </div>
                </div>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium max-w-2xl">
                  {t('admin.taskManagement.createAssignTrack')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-[#ffd17a] text-[#242021] hover:bg-[#ffd17a]/90 transition-all duration-200 font-semibold rounded-lg sm:rounded-xl shadow-md hover:shadow-lg hover:scale-105 text-sm sm:text-base"
                >
                  <FaPlus className="mr-2 text-sm sm:text-base" />
                  {t('admin.taskManagement.createTask')}
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                    <input
                      type="text"
                      placeholder={t('admin.taskManagement.searchTasks')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Task Analytics Dashboard */}
          <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{t('admin.taskManagement.totalTasks')}</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{tasks.length}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('admin.taskManagement.allTime')}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#242021] rounded-lg sm:rounded-xl flex items-center justify-center">
                    <FaTasks className="text-white text-sm sm:text-lg" />
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{t('admin.taskManagement.inProgress')}</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
                      {tasks.filter(task => task.status === 'in_progress').length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {tasks.length > 0 ? Math.round((tasks.filter(task => task.status === 'in_progress').length / tasks.length) * 100) : 0}{t('admin.taskManagement.ofTotal')}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <FaClock className="text-white text-sm sm:text-lg" />
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{t('admin.taskManagement.completed')}</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#242021]">
                      {tasks.filter(task => task.status === 'completed').length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {tasks.length > 0 ? Math.round((tasks.filter(task => task.status === 'completed').length / tasks.length) * 100) : 0}{t('admin.taskManagement.completionRate')}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#ffd17a] rounded-lg sm:rounded-xl flex items-center justify-center">
                    <FaCheckCircle className="text-[#242021] text-sm sm:text-lg" />
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{t('admin.taskManagement.overdue')}</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">
                      {tasks.filter(task => isOverdue(task.dueDate, task.status)).length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{t('admin.taskManagement.needAttention')}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <FaExclamationTriangle className="text-white text-sm sm:text-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Tab Navigation */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl shadow-lg p-2">
              <nav className="flex flex-col sm:flex-row gap-2">
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
                      className={`group relative flex-1 flex items-center justify-center py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-medium text-sm transition-all duration-300 ${
                        isActive
                          ? 'bg-[#242021] text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`text-sm sm:text-base ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          isActive 
                            ? 'bg-white/20 text-white' 
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTasks.map((task) => (
              <div key={task._id} className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105">
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-3">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-[#242021] transition-colors">
                          {task.title}
                        </h3>
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {task.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-[#ffd17a]/20 text-[#242021] text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                            {task.tags.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{task.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">
                        {task.description}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-2 sm:ml-4 flex-shrink-0">
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTaskModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-[#ffd17a] transition-colors"
                        title={t('admin.taskManagement.viewDetails')}
                      >
                        <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <FaUsers className="w-3 h-3 sm:w-4 sm:h-4 text-[#ffd17a] flex-shrink-0" />
                      <span className="truncate">{t('admin.taskManagement.assignedTo')} {task.assignedTo?.fullName || task.assignedTo?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <FaClock className="w-3 h-3 sm:w-4 sm:h-4 text-[#ffd17a] flex-shrink-0" />
                      <span className={isOverdue(task.dueDate, task.status) ? 'text-red-600 font-medium' : ''}>
                        {t('admin.taskManagement.due')} {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {task.applicationId && (
                    <div className="mb-4 sm:mb-6 p-3 bg-gradient-to-r from-[#ffd17a]/10 to-[#ffd17a]/20 rounded-xl border border-[#ffd17a]/30">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <span className="text-xs sm:text-sm font-semibold text-[#242021]">{t('admin.taskManagement.relatedApplication')}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              typeof task.applicationId.status === 'object' 
                                ? task.applicationId.status.current === 'approved' ? 'bg-green-100 text-green-800' :
                                  task.applicationId.status.current === 'in_process' ? 'bg-blue-100 text-blue-800' :
                                  task.applicationId.status.current === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {typeof task.applicationId.status === 'object' ? task.applicationId.status.current : task.applicationId.status || t('admin.taskManagement.unknown')}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#242021] font-medium truncate">
                            {typeof task.applicationId === 'object' 
                              ? task.applicationId.serviceType?.replace('_', ' ') || t('admin.taskManagement.unknownService')
                              : t('admin.taskManagement.application')
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-16 sm:py-20 px-4 sm:px-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <FaTasks className="text-2xl sm:text-3xl text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">{t('admin.taskManagement.noTasksFound')}</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">
                {searchTerm ? t('admin.taskManagement.tryAdjustingSearch') : t('admin.taskManagement.getStartedCreating')}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-[#ffd17a] text-[#242021] hover:bg-[#ffd17a]/90 transition-all duration-200 font-semibold rounded-lg sm:rounded-xl shadow-md hover:shadow-lg hover:scale-105 text-sm sm:text-base"
                >
                  <FaPlus className="mr-2 text-sm sm:text-base" />
                  {t('admin.taskManagement.createTask')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200/50">
            <div className="p-4 sm:p-6 border-b border-gray-200/50 bg-gradient-to-r from-[#ffd17a]/10 to-[#ffd17a]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#242021] rounded-lg sm:rounded-xl flex items-center justify-center">
                    <FaPlus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('admin.taskManagement.createNewTask')}</h2>
                    <p className="text-xs sm:text-sm text-[#242021] font-medium">{t('admin.taskManagement.assignTasksToTeam')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <FaTimes className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.taskManagement.taskTitle')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 text-sm sm:text-base"
                    placeholder={t('admin.taskManagement.enterClearDescriptive')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.taskManagement.description')} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 resize-none text-sm sm:text-base"
                  placeholder={t('admin.taskManagement.provideDetailedInstructions')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.taskManagement.priorityLevel')}
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 text-sm sm:text-base"
                  >
                    <option value="low">{t('admin.taskManagement.lowPriority')}</option>
                    <option value="medium">{t('admin.taskManagement.mediumPriority')}</option>
                    <option value="high">{t('admin.taskManagement.highPriority')}</option>
                    <option value="urgent">{t('admin.taskManagement.urgent')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.taskManagement.assignToEmployee')} *
                  </label>
                  <select
                    required
                    value={formData.assignedTo}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 text-sm sm:text-base"
                  >
                    <option value="">{t('admin.taskManagement.selectEmployee')}</option>
                    {employees.map((employee, index) => (
                      <option key={employee._id || `employee-${index}`} value={employee._id}>
                        {employee.fullName || employee.name} - {employee.role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.taskManagement.dueDateTime')} *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.taskManagement.estimatedHours')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 text-sm sm:text-base"
                    placeholder={t('admin.taskManagement.eg8Hours')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.taskManagement.relatedApplicationOptional')}
                  </label>
                  <select
                    value={formData.applicationId}
                    onChange={(e) => setFormData(prev => ({ ...prev, applicationId: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 text-sm sm:text-base"
                  >
                    <option value="">{t('admin.taskManagement.noRelatedApplication')}</option>
                    {applications.map((app, index) => (
                      <option key={app._id || `app-${index}`} value={app._id}>
                        {app.serviceType?.replace('_', ' ')} - {typeof app.status === 'object' ? app.status.current : app.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.taskManagement.tagsOptional')}
                  </label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    }))}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 text-sm sm:text-base"
                    placeholder={t('admin.taskManagement.egFrontendUrgent')}
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('admin.taskManagement.separateTagsWithCommas')}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200/50">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-200 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold text-sm sm:text-base"
                >
                  {t('admin.taskManagement.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#ffd17a] hover:bg-[#ffd17a]/90 text-[#242021] rounded-lg sm:rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                  {t('admin.taskManagement.createTask')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminTasksPage;