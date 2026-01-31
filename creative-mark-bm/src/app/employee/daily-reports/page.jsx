"use client";
import { useEffect, useState, useContext } from "react";
import { FaPlus, FaSpinner, FaCalendarDay, FaClock, FaListCheck } from "react-icons/fa6";
import { createDailyReport, getMyDailyReports } from "../../../services/dailyReportService";
import AuthContext from "../../../contexts/AuthContext";

export default function EmployeeReports() {
  const { requireAuth } = useContext(AuthContext);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    startTime: "",
    endTime: "",
    tasksCompleted: "",
    issues: "",
    nextPlans: "",
  });


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



  useEffect(() => {
    if (!requireAuth(["employee", "admin"])) return;
    loadReports();
  }, []);


  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyDailyReports({ limit: 50 });
      const items = res?.data?.items || [];
      setReports(items);
    } catch (err) {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...formData };
      const res = await createDailyReport(payload);
      const created = res?.data;
      if (created) setReports((prev) => [created, ...prev]);
      setShowModal(false);
      setFormData({
        date: new Date().toISOString().slice(0, 10),
        startTime: "",
        endTime: "",
        tasksCompleted: "",
        issues: "",
        nextPlans: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <div className="bg-[#242021] border-b rounded-3xl border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-sm">
                Employee Portal
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-3">Daily Work Reports</h1>
              <p className="text-gray-300 mt-2">Track your progress with continuous work sessions</p>
            </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all bg-white text-[#242021] hover:bg-gray-100 shadow-lg hover:shadow-xl"
        >
          <FaPlus className="mr-2" /> New Report
        </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-white/20">
                  <FaCalendarDay className="text-white text-xl" />
                </div>
                <div>
                  <div className="text-sm text-gray-300 font-medium">Today's Date</div>
                  <div className="text-xl font-bold text-white mt-0.5">{new Date().toISOString().slice(0, 10)}</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <FaClock className="text-green-300 text-xl" />
                </div>
                <div>
                  <div className="text-sm text-gray-300 font-medium">Status</div>
                  <div className="text-xl font-bold text-white mt-0.5">Always Available</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <FaListCheck className="text-blue-300 text-xl" />
                </div>
                <div>
                  <div className="text-sm text-gray-300 font-medium">Today's Entries</div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {reports.filter(r => r.date === new Date().toISOString().slice(0, 10)).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32 text-gray-400">
            <FaSpinner className="animate-spin mr-3 text-2xl" />
            <span className="text-lg">Loading reports...</span>
          </div>
        ) : reports.length > 0 ? (
          <div className="space-y-6">
            {(() => {
              const grouped = reports.reduce((acc, r) => {
                acc[r.date] = acc[r.date] || [];
                acc[r.date].push(r);
                return acc;
              }, {});
              const sortedDates = Object.keys(grouped).sort((a, b) => (a > b ? -1 : 1));
              return sortedDates.map((date) => {
                const rows = grouped[date].sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
                return (
                  <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-[#242021] flex items-center justify-between">
                      <div className="text-lg font-bold text-white">{date}</div>
                      <div className="text-xs px-3 py-1 rounded-full bg-white/20 text-white font-medium backdrop-blur-sm">
                        {rows.length} {rows.length !== 1 ? 'reports' : 'report'}
                      </div>
                    </div>
                    {/* Desktop Table */}
                    <div className="overflow-x-auto hidden sm:block">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left px-6 py-4 font-semibold text-sm text-gray-700">Time Period</th>
                            <th className="text-left px-6 py-4 font-semibold text-sm text-gray-700">Tasks Completed</th>
                            <th className="text-left px-6 py-4 font-semibold text-sm text-gray-700">Issues</th>
            </tr>
          </thead>
                        <tbody className="divide-y divide-gray-100">
                          {rows.map((r) => (
                            <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 text-[#242021] font-medium text-sm">
                                  {formatTime(r.startTime)} - {formatTime(r.endTime)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-gray-900 font-medium">{r.tasksCompleted}</div>
                                {r.nextPlans && (
                                  <div className="text-gray-500 text-sm mt-1.5 flex items-start gap-2">
                                    <span className="font-medium text-gray-700">Next:</span>
                                    <span>{r.nextPlans}</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {r.issues ? (
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-sm">
                                    {r.issues}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-sm">No issues reported</span>
                                )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="block sm:hidden divide-y divide-gray-100">
                      {rows.map((r) => (
                        <div key={r._id} className="p-4">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-[#242021] font-medium text-sm">
                              {formatTime(r.startTime)} - {formatTime(r.endTime)}
                            </span>
                          </div>
                          <div className="mt-3 text-gray-900 font-medium">
                            {r.tasksCompleted}
                          </div>
                          {r.nextPlans && (
                            <div className="text-gray-500 text-sm mt-1">Next: {r.nextPlans}</div>
                          )}
                          <div className="mt-3">
                            {r.issues ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-sm">
                                {r.issues}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">No issues reported</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="mx-auto max-w-md bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                <FaListCheck className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Reports Yet</h3>
              <p className="text-gray-600 mb-6">Start tracking your work by creating your first report.</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all bg-[#242021] text-white hover:bg-[#1a1718] shadow-lg hover:shadow-xl"
              >
                <FaPlus className="mr-2" /> Create First Report
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          You can submit reports anytime - no restrictions!
        </div>
      </div>

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#242021] px-6 py-5 rounded-t-2xl border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Add Daily Report</h2>
                  <p className="text-gray-300 text-sm mt-1">Document your work session</p>
                </div>
            <button
              onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2"
            >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
            </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#242021] focus:border-transparent"
                  max={new Date().toISOString().slice(0, 10)}
                  min={new Date().toISOString().slice(0, 10)}
                  readOnly
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#242021] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#242021] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tasks Completed</label>
                <textarea
                  name="tasksCompleted"
                  value={formData.tasksCompleted}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#242021] focus:border-transparent resize-none"
                  rows="4"
                  required
                  placeholder="Describe what you accomplished during this time period..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Issues / Challenges (Optional)</label>
                <textarea
                  name="issues"
                  value={formData.issues}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#242021] focus:border-transparent resize-none"
                  rows="3"
                  placeholder="Any blockers or challenges you faced..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Next Plans (Optional)</label>
                <textarea
                  name="nextPlans"
                  value={formData.nextPlans}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#242021] focus:border-transparent resize-none"
                  rows="3"
                  placeholder="What you plan to work on next..."
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              <button
                type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#242021] text-white py-3 rounded-lg hover:bg-[#1a1718] transition font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {submitting && <FaSpinner className="animate-spin mr-2" />}
                  {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}