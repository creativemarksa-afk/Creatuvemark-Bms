"use client";
import { useEffect, useState, useContext } from "react";
import { FaChartBar, FaUsers, FaClock, FaCheckCircle, FaExclamationTriangle, FaDownload, FaFilter, FaSearch, FaCalendarAlt, FaUser, FaTasks, FaTrendingUp, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { adminListDailyReports } from "../../../services/dailyReportService";
import AuthContext from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminDailyReports() {
  const { requireAuth } = useContext(AuthContext);
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ employee: "", startDate: "", endDate: "" });
  const [analytics, setAnalytics] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [viewMode, setViewMode] = useState('employees'); // table, analytics, employees

  useEffect(() => {
    if (!requireAuth(["admin"])) return;
    loadReports(1, filters);
  }, []);

  const loadReports = async (p = 1, f = filters) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminListDailyReports({ page: p, limit: 50, ...f });
      const data = res?.data || {};
      setItems(data.items || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(data.pagination?.currentPage || p);
      
      // Calculate analytics
      calculateAnalytics(data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (reports) => {
    if (!reports.length) {
      setAnalytics(null);
      return;
    }

    const totalReports = reports.length;
    const totalEmployees = new Set(reports.map(r => r.employee?._id)).size;
    
    // Calculate total work hours
    const totalHours = reports.reduce((acc, r) => {
      const [startHour, startMin] = r.startTime.split(':').map(Number);
      const [endHour, endMin] = r.endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      // Handle case where end time is next day (cross midnight)
      let diffMinutes = endMinutes - startMinutes;
      if (diffMinutes < 0) {
        diffMinutes += 24 * 60; // Add 24 hours
      }
      
      const diffHours = diffMinutes / 60;
      return acc + diffHours;
    }, 0);

    // Calculate success rate (reports with no issues)
    const reportsWithNoIssues = reports.filter(r => !r.issues || r.issues.trim() === '');
    const successRate = (reportsWithNoIssues.length / totalReports) * 100;

    // Employee performance
    const employeeStats = {};
    reports.forEach(report => {
      const empId = report.employee?._id;
      if (!empId) return;
      
      if (!employeeStats[empId]) {
        employeeStats[empId] = {
          name: report.employee?.fullName || 'Unknown',
          email: report.employee?.email || '',
          totalReports: 0,
          totalHours: 0,
          issuesCount: 0,
          reports: []
        };
      }
      
      employeeStats[empId].totalReports++;
      employeeStats[empId].reports.push(report);
      
      const [startHour, startMin] = report.startTime.split(':').map(Number);
      const [endHour, endMin] = report.endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      // Handle case where end time is next day (cross midnight)
      let diffMinutes = endMinutes - startMinutes;
      if (diffMinutes < 0) {
        diffMinutes += 24 * 60; // Add 24 hours
      }
      
      const diffHours = diffMinutes / 60;
      employeeStats[empId].totalHours += diffHours;
      
      if (report.issues && report.issues.trim() !== '') {
        employeeStats[empId].issuesCount++;
      }
    });

    // Calculate employee success rates
    Object.keys(employeeStats).forEach(empId => {
      const emp = employeeStats[empId];
      emp.successRate = ((emp.totalReports - emp.issuesCount) / emp.totalReports) * 100;
      emp.avgHoursPerReport = emp.totalHours / emp.totalReports;
    });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentReports = reports.filter(r => new Date(r.date) >= sevenDaysAgo);

    setAnalytics({
      totalReports,
      totalEmployees,
      totalHours: Math.round(totalHours * 10) / 10,
      successRate: Math.round(successRate * 10) / 10,
      employeeStats,
      recentReports: recentReports.length,
      avgReportsPerDay: Math.round((recentReports.length / 7) * 10) / 10
    });
  };

  const onFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => loadReports(1, filters);

  const formatTime = (hhmm) => {
    if (!hhmm) return '';
    const [h, m] = hhmm.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const viewReport = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const viewEmployeeReports = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Employee', 'Start Time', 'End Time', 'Tasks Completed', 'Issues', 'Next Plans'],
      ...items.map(r => [
        r.date,
        r.employee?.fullName || '',
        r.startTime,
        r.endTime,
        r.tasksCompleted,
        r.issues || '',
        r.nextPlans || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-[#242021] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-sm">Admin</div>
              <h1 className="text-3xl font-bold mt-3">Daily Reports Analytics</h1>
              <p className="text-gray-300 mt-1">Comprehensive reporting and employee performance insights</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <FaDownload className="text-sm" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* View Mode Switcher */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <button
            onClick={() => setViewMode('employees')}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
              viewMode === 'employees' ? 'bg-[#242021] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaUsers className="text-sm" />
            <span className="hidden sm:inline">All Employees</span>
            <span className="sm:hidden">Employees</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
              viewMode === 'table' ? 'bg-[#242021] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaTasks className="text-sm" />
            <span className="hidden sm:inline">Reports Table</span>
            <span className="sm:hidden">Table</span>
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
              viewMode === 'analytics' ? 'bg-[#242021] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaChartBar className="text-sm" />
            <span className="hidden sm:inline">Analytics Dashboard</span>
            <span className="sm:hidden">Analytics</span>
          </button>
        </div>

        {/* Analytics Dashboard */}
        {analytics && viewMode === 'analytics' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 rounded-lg bg-blue-100">
                  <FaTasks className="text-blue-600 text-lg sm:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.totalReports}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Total Reports</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 rounded-lg bg-green-100">
                  <FaUsers className="text-green-600 text-lg sm:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.totalEmployees}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Active Employees</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 rounded-lg bg-purple-100">
                  <FaClock className="text-purple-600 text-lg sm:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.totalHours}h</div>
                  <div className="text-xs sm:text-sm text-gray-600">Total Work Hours</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 rounded-lg bg-emerald-100">
                  <FaCheckCircle className="text-emerald-600 text-lg sm:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.successRate}%</div>
                  <div className="text-xs sm:text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employee Performance View */}
        {analytics && viewMode === 'employees' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">All Employees</h3>
                <p className="text-sm text-gray-600 mt-1">Click on any employee to view their detailed daily reports</p>
              </div>
              
              {/* Desktop Employee Grid */}
              <div className="hidden lg:block p-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {Object.values(analytics.employeeStats).map((emp, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => viewEmployeeReports(emp)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-gray-900 truncate">{emp.name}</h4>
                          <p className="text-sm text-gray-500 truncate">{emp.email}</p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          emp.successRate >= 80 ? 'bg-green-100 text-green-800' :
                          emp.successRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {Math.round(emp.successRate * 10) / 10}% Success
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{emp.totalReports}</div>
                          <div className="text-sm text-gray-500">Total Reports</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{Math.round(emp.totalHours * 10) / 10}h</div>
                          <div className="text-sm text-gray-500">Total Hours</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{Math.round(emp.avgHoursPerReport * 10) / 10}h</div>
                          <div className="text-sm text-gray-500">Avg/Report</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{emp.issuesCount}</div>
                          <div className="text-sm text-gray-500">Issues</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <button
                          onClick={() => router.push(`/admin/daily-reports/${Object.keys(analytics.employeeStats)[index]}`)}
                          className="text-sm text-[#242021] hover:text-[#1a1718] font-medium transition-colors"
                        >
                          View Details →
                        </button>
                        <FaEye className="text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile/Tablet Employee Cards */}
              <div className="lg:hidden divide-y divide-gray-200">
                {Object.values(analytics.employeeStats).map((emp, index) => (
                  <div key={index} className="p-4 sm:p-6 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => viewEmployeeReports(emp)}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{emp.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{emp.email}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        emp.successRate >= 80 ? 'bg-green-100 text-green-800' :
                        emp.successRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {Math.round(emp.successRate * 10) / 10}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-3">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{emp.totalReports}</div>
                        <div className="text-xs text-gray-500">Reports</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{Math.round(emp.totalHours * 10) / 10}h</div>
                        <div className="text-xs text-gray-500">Total Hours</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{Math.round(emp.avgHoursPerReport * 10) / 10}h</div>
                        <div className="text-xs text-gray-500">Avg/Report</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{emp.issuesCount}</div>
                        <div className="text-xs text-gray-500">Issues</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <button
                        onClick={() => router.push(`/admin/daily-reports/${Object.keys(analytics.employeeStats)[index]}`)}
                        className="text-xs text-[#242021] hover:text-[#1a1718] font-medium transition-colors"
                      >
                        View Details →
                      </button>
                      <FaEye className="text-gray-400 text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <input
              type="text"
              name="employee"
              value={filters.employee}
              onChange={onFilterChange}
              placeholder="Employee ID or User ID"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#242021]/20 focus:border-[#242021]"
            />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={onFilterChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#242021]/20 focus:border-[#242021]"
            />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={onFilterChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#242021]/20 focus:border-[#242021]"
            />
            </div>
            <div className="flex items-end">
              <button 
                onClick={applyFilters} 
                className="w-full px-4 py-2 rounded-lg bg-[#242021] text-white hover:bg-[#1a1718] shadow-sm transition-colors"
              >
                Apply Filters
            </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="py-4 text-red-600">{error}</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Employee</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Time</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Tasks</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Issues</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{r.date}</td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium">{r.employee?.fullName || '—'}</div>
                        <div className="text-gray-500 text-xs">{r.employee?.email || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm">
                          {formatTime(r.startTime)} - {formatTime(r.endTime)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-800 max-w-xs truncate">{r.tasksCompleted}</td>
                      <td className="px-6 py-4">
                        {r.issues ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-sm">
                            {r.issues}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => viewReport(r)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tablet Table */}
            <div className="hidden sm:block lg:hidden overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Employee</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Time</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.date}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{r.employee?.fullName || '—'}</div>
                        <div className="text-xs text-gray-500">{r.employee?.email || '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs">
                          {formatTime(r.startTime)} - {formatTime(r.endTime)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => viewReport(r)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {items.map((r) => (
                <div key={r._id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{r.employee?.fullName || '—'}</div>
                      <div className="text-xs text-gray-500">{r.employee?.email || '—'}</div>
                      <div className="text-xs text-gray-500 mt-1">{r.date}</div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs">
                      {formatTime(r.startTime)} - {formatTime(r.endTime)}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-xs font-medium text-gray-700 mb-1">Tasks Completed:</div>
                    <div className="text-sm text-gray-800 line-clamp-2">{r.tasksCompleted}</div>
                  </div>
                  
                  {r.issues && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-700 mb-1">Issues:</div>
                      <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                        {r.issues}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => viewReport(r)}
                    className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2 border-t border-gray-100"
                  >
                    View Full Report
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadReports(Math.max(1, page - 1), filters)}
              disabled={page <= 1}
              className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => loadReports(Math.min(totalPages, page + 1), filters)}
              disabled={page >= totalPages}
              className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm"
            >
              Next
            </button>
          </div>
          <div className="text-gray-600 text-sm">
            Page {page} of {totalPages}
          </div>
        </div>
      </div>

      {/* Employee Reports Modal */}
      {showEmployeeModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#242021] px-6 py-5 rounded-t-2xl border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedEmployee.name}'s Daily Reports</h2>
                  <p className="text-gray-300 text-sm mt-1">{selectedEmployee.email}</p>
                </div>
                <button
                  onClick={() => setShowEmployeeModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Employee Stats Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedEmployee.totalReports}</div>
                  <div className="text-sm text-blue-800">Total Reports</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{Math.round(selectedEmployee.totalHours * 10) / 10}h</div>
                  <div className="text-sm text-green-800">Total Hours</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{Math.round(selectedEmployee.avgHoursPerReport * 10) / 10}h</div>
                  <div className="text-sm text-purple-800">Avg/Report</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{selectedEmployee.issuesCount}</div>
                  <div className="text-sm text-orange-800">Issues</div>
                </div>
              </div>

              {/* Reports List */}
              <div className="space-y-4">
                {selectedEmployee.reports && selectedEmployee.reports.length > 0 ? (
                  (() => {
                    const grouped = selectedEmployee.reports.reduce((acc, r) => {
                      acc[r.date] = acc[r.date] || [];
                      acc[r.date].push(r);
                      return acc;
                    }, {});
                    const sortedDates = Object.keys(grouped).sort((a, b) => (a > b ? -1 : 1));
                    
                    return sortedDates.map((date) => {
                      const dayReports = grouped[date].sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
                      return (
                        <div key={date} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-900">{date}</h3>
                              <span className="text-sm text-gray-500">{dayReports.length} {dayReports.length !== 1 ? 'reports' : 'report'}</span>
                            </div>
                          </div>
                          
                          <div className="divide-y divide-gray-100">
                            {dayReports.map((report) => (
                              <div key={report._id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-100 text-blue-800 text-sm font-medium">
                                      {formatTime(report.startTime)} - {formatTime(report.endTime)}
                                    </span>
                                    {report.issues && report.issues.trim() && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-medium">
                                        Has Issues
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => {
                                      setShowEmployeeModal(false);
                                      viewReport(report);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                  >
                                    <FaEye />
                                  </button>
                                </div>
                                
                                <div className="space-y-2">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-1">Tasks Completed:</h4>
                                    <p className="text-sm text-gray-700">{report.tasksCompleted}</p>
                                  </div>
                                  
                                  {report.issues && report.issues.trim() && (
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900 mb-1">Issues:</h4>
                                      <p className="text-sm text-amber-700">{report.issues}</p>
                                    </div>
                                  )}
                                  
                                  {report.nextPlans && report.nextPlans.trim() && (
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900 mb-1">Next Plans:</h4>
                                      <p className="text-sm text-gray-700">{report.nextPlans}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <FaListCheck className="text-gray-400 text-2xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
                    <p className="text-gray-500">This employee hasn't submitted any daily reports yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


