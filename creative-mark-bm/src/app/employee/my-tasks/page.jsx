"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaTasks,
  FaSpinner,
  FaExclamationTriangle,
  FaSearch,
  FaArrowLeft,
  FaFilter,
  FaCalendarAlt,
  FaUser,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaSyncAlt,
  FaChevronRight,
  FaBars,
  FaSort,
  FaDownload,
  FaPlus,
} from "react-icons/fa";
import { getEmployeeApplications } from "../../../services/employeeDashboardService";

export default function MyTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  useEffect(() => {
    loadTasks();
  }, [filterStatus, searchTerm, sortBy]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);


      const response = await getEmployeeApplications({ limit: 100 });
      let allTasks = response.data || [];

      // Filter by status
      if (filterStatus !== "all") {
        allTasks = allTasks.filter(
          (task) => task.status.toLowerCase() === filterStatus.toLowerCase()
        );
      }

      // Filter by search term
      if (searchTerm) {
        allTasks = allTasks.filter(
          (task) =>
            task.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Sort tasks
      allTasks.sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "oldest":
            return new Date(a.createdAt) - new Date(b.createdAt);
          case "status":
            return a.status.localeCompare(b.status);
          case "client":
            return (a.client?.name || "").localeCompare(b.client?.name || "");
          default:
            return 0;
        }
      });

      console.log('Loaded tasks:', allTasks);
      setTasks(allTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "under review":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "in progress":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return <FaClock className="w-3 h-3" />;
      case "under review":
        return <FaExclamationCircle className="w-3 h-3" />;
      case "in progress":
        return <FaSyncAlt className="w-3 h-3" />;
      case "completed":
        return <FaCheckCircle className="w-3 h-3" />;
      case "rejected":
        return <FaTimesCircle className="w-3 h-3" />;
      default:
        return <FaClock className="w-3 h-3" />;
    }
  };

  const handleViewDetails = (taskId) => {
    console.log('Navigating to task details for ID:', taskId);
    router.push(`/employee/my-tasks/${taskId}`);
  };

  const getStatusCounts = () => {
    const counts = {
      all: tasks.length,
      submitted: 0,
      "under review": 0,
      "in progress": 0,
      completed: 0,
      rejected: 0,
    };

    tasks.forEach(task => {
      const status = task.status.toLowerCase();
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      }
    });

    return counts;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-green-100 rounded-full animate-pulse bg-white shadow-2xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaSpinner className="animate-spin text-3xl text-green-600" />
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-lg px-8 py-6 rounded-2xl shadow-2xl border border-green-100 max-w-sm">
            <p className="text-lg text-gray-800 font-semibold mb-2">Loading your tasks...</p>
            <p className="text-sm text-gray-500">Fetching the latest updates</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl border border-red-100 max-w-md w-full">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="text-3xl text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
          <button
            onClick={loadTasks}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                My Tasks
              </h1>
              <p className="text-lg text-gray-600">
                Manage and track your assigned tasks
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button 
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium rounded-lg shadow-sm"
              >
                <FaBars className="h-4 w-4 mr-2" />
                <span>{viewMode === "grid" ? "List View" : "Grid View"}</span>
              </button>
              <button 
                onClick={loadTasks}
                className="flex items-center justify-center px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md"
              >
                <FaSyncAlt className="h-4 w-4 mr-2" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{statusCounts.all}</p>
                <p className="text-xs text-gray-500">All assigned tasks</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200">
                <FaTasks className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{statusCounts["in progress"]}</p>
                <p className="text-xs text-gray-500">Currently working on</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200">
                <FaClock className="text-2xl text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{statusCounts.submitted}</p>
                <p className="text-xs text-gray-500">Awaiting action</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-200">
                <FaExclamationCircle className="text-2xl text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{statusCounts.completed}</p>
                <p className="text-xs text-gray-500">Successfully finished</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-green-200">
                <FaCheckCircle className="text-2xl text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          {/* Mobile: Stacked Layout, Desktop: Grid */}
          <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-end">
            {/* Search - Full width on mobile, spans 5 columns on desktop */}
            <div className="lg:col-span-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Tasks
              </label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500 text-sm" />
                <input
                  type="text"
                  placeholder="Search tasks, clients, or requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-gray-50 placeholder-gray-400 text-sm"
                />
              </div>
            </div>

            {/* Filters Row - Mobile: 2 columns, Desktop: Continues grid */}
            <div className="grid grid-cols-2 gap-3 lg:col-span-4 lg:grid-cols-2 lg:gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-gray-50 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="under review">Under Review</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-gray-50 text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="status">By Status</option>
                  <option value="client">By Client</option>
                </select>
              </div>
            </div>

            {/* Actions - Mobile: Full width, Desktop: Remaining columns */}
            <div className="flex space-x-2 lg:col-span-3">
              <button
                onClick={loadTasks}
                className="flex-1 lg:flex-none flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
              >
                <FaSyncAlt className="mr-2 text-xs" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="flex items-center justify-center px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 lg:px-4"
              >
                <FaBars className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Grid - Responsive */}
        {tasks.length > 0 ? (
          <div className={`grid gap-4 lg:gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {tasks.map((task) => (
              <div
                key={task._id}
                className={`group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-green-200 transition-all duration-300 transform hover:-translate-y-1 ${
                  viewMode === 'list' ? 'p-4 lg:p-6' : 'p-6 lg:p-8'
                }`}
              >
                {viewMode === 'grid' ? (
                  // Grid View
                  <>
                    <div className="flex items-start justify-between mb-4 lg:mb-6">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg lg:text-xl mb-2 group-hover:text-green-700 transition-colors duration-300 truncate">
                          {task.type || "Service Request"}
                        </h3>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 border border-green-200">
                          <span className="text-xs font-semibold text-green-700 truncate">
                            #{task.requestNumber || task._id.slice(-8)}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ml-2 flex-shrink-0 ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {getStatusIcon(task.status)}
                        <span className="ml-1.5 capitalize hidden sm:inline">{task.status}</span>
                      </span>
                    </div>

                    <div className="space-y-3 lg:space-y-4 mb-6 lg:mb-8">
                      <div className="flex items-center text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                        <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-green-50 rounded-lg mr-3 lg:mr-4 flex-shrink-0">
                          <FaUser className="text-green-600 text-sm" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500">Client</p>
                          <p className="font-semibold truncate text-sm lg:text-base">{task.client?.name || "Unknown Client"}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                        <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-green-50 rounded-lg mr-3 lg:mr-4 flex-shrink-0">
                          <FaCalendarAlt className="text-green-600 text-sm" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500">Created</p>
                          <p className="font-semibold text-sm lg:text-base">{formatDate(task.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // List View
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start space-x-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-green-700 transition-colors duration-300 truncate">
                            {task.type || "Service Request"}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            #{task.requestNumber || task._id.slice(-8)} • {task.client?.name || "Unknown Client"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(task.createdAt)}</p>
                        </div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {getStatusIcon(task.status)}
                          <span className="ml-1.5 capitalize">{task.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 lg:pt-6 border-t border-gray-100">
                  <button
                    onClick={() => handleViewDetails(task._id)}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform group-hover:scale-105 text-sm"
                  >
                    <FaEye className="mr-2" />
                    View Details
                    <FaChevronRight className="ml-2 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 lg:py-20">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 lg:p-16 max-w-lg mx-auto">
              <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 lg:mb-8">
                <FaTasks className="text-2xl lg:text-4xl text-green-600" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">
                No tasks found
              </h3>
              <p className="text-gray-600 mb-6 lg:mb-8 leading-relaxed text-sm lg:text-base">
                {searchTerm || filterStatus !== "all"
                  ? "No tasks match your current filters. Try adjusting your search criteria."
                  : "You don't have any assigned tasks at the moment. New tasks will appear here when assigned."}
              </p>
              {(searchTerm || filterStatus !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                  }}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm lg:text-base"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}