"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserApplications, getApplicationProgress } from "../../../services/applicationService";
import { useAuth } from "../../../contexts/AuthContext";
import { useTranslation } from "../../../i18n/TranslationContext";

export default function MyApplicationsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserApplications();
      const apps = response.data || [];
      setApplications(apps);

      // Fetch progress data for each application
      const progressPromises = apps.map(async (app) => {
        try {
          const progressResponse = await getApplicationProgress(app._id);
          return {
            applicationId: app._id,
            progress: progressResponse.data
          };
        } catch (err) {
          console.error(`Error fetching progress for application ${app._id}:`, err);
          return {
            applicationId: app._id,
            progress: { progressPercentage: 0, currentStatus: app.status }
          };
        }
      });

      const progressResults = await Promise.all(progressPromises);
      const progressMap = {};
      progressResults.forEach(result => {
        progressMap[result.applicationId] = result.progress;
      });
      
      setProgressData(progressMap);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(err.message || "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "submitted":
        return "bg-blue-50 text-blue-900 border-l-4 border-blue-600";
      case "under_review":
        return "bg-amber-50 text-amber-900 border-l-4 border-amber-600";
      case "approved":
        return "bg-amber-50 text-amber-900 border-l-4 border-amber-600";
      case "in_process":
        return "bg-purple-50 text-purple-900 border-l-4 border-purple-600";
      case "completed":
        return "bg-amber-50 text-amber-900 border-l-4 border-amber-600";
      case "rejected":
        return "bg-red-50 text-red-900 border-l-4 border-red-600";
      default:
        return "bg-gray-50 text-gray-900 border-l-4 border-gray-400";
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "under_review":
        return "bg-amber-100 text-amber-800";
      case "approved":
        return "bg-amber-100 text-amber-800";
      case "in_process":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-amber-100 text-amber-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressPercentage = (applicationId, fallbackStatus) => {
    const progress = progressData[applicationId];
    if (progress && progress.progressPercentage !== undefined) {
      return progress.progressPercentage;
    }
    
    // Fallback to status-based calculation if no progress data
    switch (fallbackStatus) {
      case "submitted":
        return 20;
      case "under_review":
        return 40;
      case "approved":
        return 60;
      case "in_process":
        return 80;
      case "completed":
        return 100;
      case "rejected":
        return 0;
      default:
        return 0;
    }
  };

  const getProgressColor = (applicationId, fallbackStatus) => {
    const progress = progressData[applicationId];
    const currentStatus = progress?.currentStatus || fallbackStatus;
    
    switch (currentStatus) {
      case "submitted":
        return "bg-blue-500";
      case "under_review":
        return "bg-amber-500";
      case "approved":
        return "bg-green-500";
      case "in_process":
        return "bg-purple-500";
      case "completed":
        return "bg-green-600";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header Section */}
        <div className="backdrop-blur-sm border-b border-amber-200/20 bg-[#242021]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-2 h-2 rounded-full shadow-lg animate-pulse bg-amber-400"></div>
                  <span className='text-sm font-medium uppercase tracking-wider text-amber-400/80'>{t('trackApplication.applications')}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-3 text-amber-400">
                  {t('trackApplication.myApplications')}
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-white/70">
                  {t('trackApplication.subtitle')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <button
                  onClick={fetchApplications}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-semibold uppercase tracking-wider border border-amber-400/30 bg-amber-400/10 text-amber-400 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:bg-amber-400/20 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className='group-hover:scale-105 transition-transform duration-300'>{loading ? t('trackApplication.loading') : t('trackApplication.refresh')}</span>
                </button>
                <button
                  onClick={() => router.push("/client/application")}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-lg group"
                >
                  <span className='group-hover:scale-105 transition-transform duration-300'>{t('trackApplication.newApplication')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 sm:mb-8 bg-white border border-red-200/50 overflow-hidden group hover:shadow-lg transition-all duration-300 rounded-lg shadow-sm">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                    <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className='text-lg sm:text-xl font-bold text-gray-900 mb-2'>{t('trackApplication.errorLoading')}</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">{error}</p>
                  <button
                    onClick={fetchApplications}
                    className="px-6 sm:px-8 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-lg group bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg"
                  >
                    <span className='group-hover:scale-105 transition-transform duration-300'>{t('trackApplication.tryAgain')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white border border-amber-100/50 overflow-hidden group hover:shadow-lg transition-all duration-300 rounded-lg shadow-sm">
            <div className="p-12 sm:p-16">
              <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shadow-lg bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg">
                    <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-4 border-white border-t-transparent rounded-full"></div>
                  </div>
                </div>
                <span className='text-base sm:text-lg font-semibold text-gray-700'>{t('trackApplication.loadingApplications')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Table View */}
        {!loading && !error && applications.length > 0 && (
          <>
            <div className="hidden lg:block bg-white border border-amber-100/50 overflow-hidden group hover:shadow-lg transition-all duration-300 rounded-lg shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="text-white bg-[#242021]">
                    <th className="px-6 lg:px-8 py-4 lg:py-6 text-left text-xs font-bold uppercase tracking-wider">
                      {t('trackApplication.applicationId')}
                    </th>
                    <th className="px-6 lg:px-8 py-4 lg:py-6 text-left text-xs font-bold uppercase tracking-wider">
                      {t('trackApplication.serviceType')}
                    </th>
                    <th className="px-6 lg:px-8 py-4 lg:py-6 text-left text-xs font-bold uppercase tracking-wider">
                      {t('trackApplication.status')}
                    </th>
                    <th className="px-6 lg:px-8 py-4 lg:py-6 text-left text-xs font-bold uppercase tracking-wider">
                      {t('trackApplication.progress')}
                    </th>
                    <th className="px-6 lg:px-8 py-4 lg:py-6 text-left text-xs font-bold uppercase tracking-wider">
                      {t('trackApplication.submittedDate')}
                    </th>
                    <th className="px-6 lg:px-8 py-4 lg:py-6 text-center text-xs font-bold uppercase tracking-wider">
                      {t('trackApplication.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100/30">
                  {applications.map((app) => (
                    <tr
                      key={app._id}
                      className="hover:bg-gray-50/50 transition-all duration-300 group bg-white"
                    >
                      <td className="px-6 lg:px-8 py-4 lg:py-5">
                        <span className="font-mono text-sm text-gray-900 font-semibold">
                          {app._id}
                        </span>
                      </td>
                      <td className="px-6 lg:px-8 py-4 lg:py-5">
                        <span className="text-sm font-semibold text-gray-900">
                          {app.serviceType}
                        </span>
                      </td>
                      <td className="px-6 lg:px-8 py-4 lg:py-5">
                        <span
                          className={`inline-block px-3 py-1.5 lg:px-4 lg:py-2 text-xs font-bold uppercase tracking-wide transition-all duration-300 group-hover:scale-105 ${getStatusBadgeStyle(
                            app.status
                          )} rounded-lg shadow-sm`}
                        >
                          {app.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 lg:px-8 py-4 lg:py-5">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor(app._id, app.status)}`}
                                style={{ width: `${getProgressPercentage(app._id, app.status)}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-gray-600 min-w-[3rem] text-right">
                            {getProgressPercentage(app._id, app.status)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 lg:px-8 py-4 lg:py-5">
                        <span className="text-sm font-medium text-gray-700">
                          {new Date(app.createdAt || app.submittedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-6 lg:px-8 py-4 lg:py-5 text-center">
                        <button
                          onClick={() => router.push(`/client/track-application/${app._id}`)}
                          className="px-4 lg:px-6 py-2 lg:py-3 text-xs lg:text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-lg group bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 rounded-lg"
                        >
                          <span className="group-hover:scale-105 transition-transform duration-300">{t('trackApplication.viewDetails')}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 sm:space-y-6">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-white border border-amber-100/50 overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-lg shadow-sm"
                >
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                          <div className="w-1.5 h-1.5 rounded-full shadow-sm bg-amber-400"></div>
                          <h3 className='text-xs font-bold uppercase tracking-wider text-gray-500'>
                            {t('trackApplication.applicationDetails')}
                          </h3>
                        </div>
                        <p className="font-mono text-xs sm:text-sm font-semibold text-gray-900 break-all mb-2">
                          {app._id}
                        </p>
                      </div>
                      <span
                        className={`flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold uppercase tracking-wide transition-all duration-300 group-hover:scale-105 ${getStatusBadgeStyle(
                          app.status
                        )} rounded-lg shadow-sm`}
                      >
                        {app.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full shadow-sm bg-amber-400"></div>
                          <h3 className='text-xs font-bold uppercase tracking-wider text-gray-500'>
                            {t('trackApplication.serviceType')}
                          </h3>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {app.serviceType}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full shadow-sm bg-amber-400"></div>
                          <h3 className='text-xs font-bold uppercase tracking-wider text-gray-500'>
                            {t('trackApplication.submitted')}
                          </h3>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(app.createdAt || app.submittedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full shadow-sm bg-amber-400"></div>
                        <h3 className='text-xs font-bold uppercase tracking-wider text-gray-500'>
                          {t('trackApplication.progress')}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(app._id, app.status)}`}
                              style={{ width: `${getProgressPercentage(app._id, app.status)}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-600 min-w-[3rem] text-right">
                          {getProgressPercentage(app._id, app.status)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center pt-2 sm:pt-4">
                      <button
                        onClick={() => router.push(`/client/track-application/${app._id}`)}
                        className="px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-lg group bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 rounded-lg"
                      >
                        <span className="group-hover:scale-105 transition-transform duration-300">{t('trackApplication.viewDetails')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && applications.length === 0 && (
          <div className="bg-white border border-amber-100/50 overflow-hidden group hover:shadow-lg transition-all duration-300 rounded-lg shadow-sm">
            <div className="text-center p-12 sm:p-16 lg:p-24">
              <div className="max-w-lg mx-auto">
                <div className="relative mb-6 sm:mb-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center mx-auto shadow-lg bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {t('trackApplication.noApplicationsYet')}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-8 sm:mb-10 leading-relaxed">
                  {t('trackApplication.noApplicationsDescription')}
                </p>
                <button
                  onClick={() => router.push("/client/application")}
                  className="px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-bold uppercase tracking-wider transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-lg group bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 rounded-lg"
                >
                  <span className='group-hover:scale-105 transition-transform duration-300'>{t('trackApplication.startNewApplication')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}