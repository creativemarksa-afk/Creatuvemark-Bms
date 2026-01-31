"use client";
import { useEffect, useState, useContext, use } from "react";
import { FaArrowLeft, FaDownload, FaSpinner, FaCalendarDay, FaClock, FaListCheck, FaUser, FaClipboardList, FaChartBar } from "react-icons/fa6";
import { adminListDailyReports } from "../../../../services/dailyReportService";
import AuthContext from "../../../../contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function EmployeeReportsDetail({ params }) {
  const { requireAuth } = useContext(AuthContext);
  const router = useRouter();
  const resolvedParams = use(params);
  const employeeId = resolvedParams.id;

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });
  const [employee, setEmployee] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!requireAuth(["admin"])) return;
    loadReports(1, filters);
  }, [employeeId]);

  const loadReports = async (pageNum = 1, currentFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        page: pageNum,
        limit: 20,
        employee: employeeId,
        ...currentFilters
      };
      
      const res = await adminListDailyReports(queryParams);
      const data = res?.data || {};
      
      setReports(data.items || []);
      setTotalPages(data.totalPages || 1);
      setPage(data.currentPage || 1);
      
      // Set employee info from first report
      if (data.items && data.items.length > 0) {
        setEmployee(data.items[0].employee);
        calculateEmployeeAnalytics(data.items);
      }
    } catch (err) {
      setError("Failed to load reports");
      console.error("Load reports error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateEmployeeAnalytics = (reports) => {
    if (!reports.length) {
      setAnalytics(null);
      return;
    }

    const totalReports = reports.length;
    
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

    // Calculate issues count
    const issuesCount = reports.filter(r => r.issues && r.issues.trim() !== '').length;

    setAnalytics({
      totalReports,
      totalHours: Math.round(totalHours * 10) / 10,
      successRate: Math.round(successRate * 10) / 10,
      issuesCount,
      avgHoursPerReport: Math.round((totalHours / totalReports) * 10) / 10
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = () => {
    loadReports(1, filters);
  };

  const clearFilters = () => {
    setFilters({ startDate: "", endDate: "" });
    loadReports(1, { startDate: "", endDate: "" });
  };

  const formatTime = (hhmm) => {
    if (!hhmm) return '';
    const [h, m] = hhmm.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
    
    // Handle 24-hour format properly
    if (h === 0) {
      return `12:${m.toString().padStart(2, '0')} AM`;
    } else if (h < 12) {
      return `${h}:${m.toString().padStart(2, '0')} AM`;
    } else if (h === 12) {
      return `12:${m.toString().padStart(2, '0')} PM`;
    } else {
      return `${h - 12}:${m.toString().padStart(2, '0')} PM`;
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Start Time', 'End Time', 'Tasks Completed', 'Issues', 'Next Plans'],
      ...reports.map(r => [
        r.date,
        formatTime(r.startTime),
        formatTime(r.endTime),
        r.tasksCompleted,
        r.issues || '',
        r.nextPlans || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${employee?.fullName || 'employee'}-reports.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading employee reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Reports</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#242021] text-white rounded-lg hover:bg-[#1a1718] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#242021] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {employee?.fullName || 'Employee'} Reports
                </h1>
                <p className="text-gray-300 text-sm mt-1">{employee?.email || ''}</p>
              </div>
            </div>
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

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Employee Analytics */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-100">
                  <FaListCheck className="text-blue-600 text-xl" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 font-medium">Total Reports</div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.totalReports}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100">
                  <FaClock className="text-green-600 text-xl" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 font-medium">Total Hours</div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.totalHours}h</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-100">
                  <FaChartBar className="text-purple-600 text-xl" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 font-medium">Success Rate</div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.successRate}%</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-orange-100">
                  <FaClipboardList className="text-orange-600 text-xl" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 font-medium">Avg Hours/Report</div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.avgHoursPerReport}h</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#242021] focus:border-transparent"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#242021] focus:border-transparent"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-2 flex items-end gap-3">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-[#242021] text-white rounded-lg hover:bg-[#1a1718] transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        {reports.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time Period</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tasks Completed</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Issues</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Next Plans</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.map((report) => {
                    const [startHour, startMin] = report.startTime.split(':').map(Number);
                    const [endHour, endMin] = report.endTime.split(':').map(Number);
                    const startMinutes = startHour * 60 + startMin;
                    const endMinutes = endHour * 60 + endMin;
                    let diffMinutes = endMinutes - startMinutes;
                    if (diffMinutes < 0) diffMinutes += 24 * 60;
                    const duration = Math.round((diffMinutes / 60) * 10) / 10;

                    return (
                      <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{report.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 text-sm font-medium">
                            {formatTime(report.startTime)} - {formatTime(report.endTime)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{report.tasksCompleted}</div>
                        </td>
                        <td className="px-6 py-4">
                          {report.issues ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-sm">
                              {report.issues.length > 50 ? `${report.issues.substring(0, 50)}...` : report.issues}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">No issues</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{report.nextPlans || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{duration}h</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Cards */}
            <div className="lg:hidden divide-y divide-gray-100">
              {reports.map((report) => {
                const [startHour, startMin] = report.startTime.split(':').map(Number);
                const [endHour, endMin] = report.endTime.split(':').map(Number);
                const startMinutes = startHour * 60 + startMin;
                const endMinutes = endHour * 60 + endMin;
                let diffMinutes = endMinutes - startMinutes;
                if (diffMinutes < 0) diffMinutes += 24 * 60;
                const duration = Math.round((diffMinutes / 60) * 10) / 10;

                return (
                  <div key={report._id} className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.date}</div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 text-sm font-medium mt-1">
                          {formatTime(report.startTime)} - {formatTime(report.endTime)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{duration}h</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Tasks Completed:</h4>
                        <p className="text-sm text-gray-700">{report.tasksCompleted}</p>
                      </div>
                      
                      {report.issues && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Issues:</h4>
                          <p className="text-sm text-amber-700">{report.issues}</p>
                        </div>
                      )}
                      
                      {report.nextPlans && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Next Plans:</h4>
                          <p className="text-sm text-gray-700">{report.nextPlans}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FaListCheck className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-500">This employee hasn't submitted any daily reports yet.</p>
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
    </div>
  );
}
