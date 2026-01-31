"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllClients, deleteClient } from "../../../services/clientApi";
import { getAllApplications } from "../../../services/applicationService";
import { getCurrentUser } from "../../../services/auth";
import { 
  FaSearch, 
  FaFilter, 
  FaUser, 
  FaUserCheck, 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt,
  FaSpinner,
  FaUsers,
  FaBuilding,
  FaClock,
  FaEye,
  FaUserPlus,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendar,
  FaMapMarkerAlt,
  FaTrash,
  FaArrowLeft,
  FaPlus,
  FaIdCard,
  FaShieldAlt,
  FaFileAlt,
  FaChartLine,
  FaDollarSign,
  FaHandshake,
  FaUserTimes
} from "react-icons/fa";
import Swal from 'sweetalert2';
import { useTranslation } from '../../../i18n/TranslationContext';

export default function ClientsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchData();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user.data);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch clients and applications in parallel
      const [clientsResponse, applicationsResponse] = await Promise.all([
        getAllClients(),
        getAllApplications()
      ]);
      
    
      
      const clientsData = clientsResponse.success ? (clientsResponse.data || []) : [];
      const applicationsData = applicationsResponse.data || [];
      
      setClients(clientsData);
      setApplications(applicationsData);
      
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setClients([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "suspended":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <FaCheckCircle className="text-emerald-600" />;
      case "inactive":
        return <FaTimesCircle className="text-red-600" />;
      case "pending":
        return <FaClock className="text-amber-600" />;
      case "suspended":
        return <FaExclamationTriangle className="text-orange-600" />;
      default:
        return <FaUser className="text-gray-600" />;
    }
  };

  // Filter clients based on search and filters
  const filteredClients = clients.filter(client => {
    const matchesSearch = (client.fullName || client.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get unique statuses for filter
  const statuses = [...new Set(clients.map(client => client.status).filter(Boolean))];

  // Handle actions
  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
  };


  const handleDeleteClient = async (client) => {
    if (!currentUser || currentUser.role !== "admin") {
      Swal.fire({
        title: 'Permission Denied',
        text: 'Only admin can delete clients.',
        icon: 'error',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK',
        background: '#ffffff',
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
          title: 'text-gray-900 font-semibold',
          content: 'text-gray-600'
        }
      });
      return;
    }

    // Get client's applications count
    const clientApplications = applications.filter(app => app.client?.email === client.email);
    
    const result = await Swal.fire({
      title: 'Delete Client',
      html: `
        <div class="text-left">
          <p class="text-gray-700 mb-4">
            Are you sure you want to delete <strong>${client.fullName || client.name}</strong>?
          </p>
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p class="text-red-800 font-semibold mb-2">⚠️ This action cannot be undone and will permanently remove:</p>
            <ul class="text-red-700 text-sm space-y-1">
              <li>• Client account and profile</li>
              <li>• ${clientApplications.length} application(s) and associated data</li>
              <li>• All uploaded documents and timeline entries</li>
              <li>• All payment records and communication history</li>
            </ul>
          </div>
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p class="text-gray-600 text-sm">
              <strong>Client:</strong> ${client.fullName || client.name}
            </p>
            <p class="text-gray-600 text-sm">
              <strong>Email:</strong> ${client.email}
            </p>
            <p class="text-gray-600 text-sm">
              <strong>Applications:</strong> ${clientApplications.length}
            </p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete Client!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      background: '#ffffff',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-gray-900 font-semibold',
        content: 'text-gray-600',
        confirmButton: 'rounded-lg font-medium px-6 py-3',
        cancelButton: 'rounded-lg font-medium px-6 py-3'
      }
    });

    if (result.isConfirmed) {
      try {
        setDeletingId(client._id || client.id);

        // Show loading alert
        Swal.fire({
          title: 'Deleting Client...',
          text: 'Please wait while we delete the client and all associated data.',
          icon: 'info',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          background: '#ffffff',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-gray-900 font-semibold'
          },
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const result = await deleteClient(client._id || client.id);
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to delete client');
        }

        // Remove the deleted client from the local state
        setClients(prev => prev.filter(c => (c._id || c.id) !== (client._id || client.id)));

        // Show success alert
        Swal.fire({
          title: 'Successfully Deleted!',
          text: `${client.fullName || client.name} and all associated data have been permanently deleted.`,
          icon: 'success',
          confirmButtonColor: '#059669',
          confirmButtonText: 'OK',
          background: '#ffffff',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-gray-900 font-semibold',
            content: 'text-gray-600',
            confirmButton: 'rounded-lg font-medium px-6 py-3'
          }
        });
      } catch (error) {
        console.error('Error deleting client:', error);
        Swal.fire({
          title: 'Deletion Failed',
          text: `Failed to delete client: ${error.message}`,
          icon: 'error',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'OK',
          background: '#ffffff',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-gray-900 font-semibold',
            content: 'text-gray-600',
            confirmButton: 'rounded-lg font-medium px-6 py-3'
          }
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getClientApplications = (clientEmail) => {
    return applications.filter(app => app.client?.email === clientEmail);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Modern Header */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#242021] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg sm:shadow-xl">
                  <FaUsers className="text-lg sm:text-2xl text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                    {t('admin.clientManagement')}
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1 sm:mt-2">
                    {t('admin.manageClientAccounts')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 text-gray-600 hover:text-gray-900 hover:bg-white/80 border border-gray-200 hover:border-gray-300 rounded-lg sm:rounded-xl transition-all duration-200 font-medium text-sm sm:text-base"
              >
                <FaArrowLeft className="mr-2 text-sm sm:text-base" />
                {t('admin.backToDashboard')}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className='text-xs sm:text-sm font-medium text-gray-600 mb-1'>{t('admin.totalClients')}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{clients.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#242021] rounded-lg sm:rounded-xl flex items-center justify-center">
                <FaUsers className="text-white text-sm sm:text-lg" />
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className='text-xs sm:text-sm font-medium text-gray-600 mb-1'>{t('admin.active')}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#242021]">{clients.filter(client => client.status === 'active' || !client.status).length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#ffd17a] rounded-lg sm:rounded-xl flex items-center justify-center">
                <FaCheckCircle className="text-[#242021] text-sm sm:text-lg" />
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className='text-xs sm:text-sm font-medium text-gray-600 mb-1'>{t('admin.totalApplications')}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{applications.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <FaFileAlt className="text-white text-sm sm:text-lg" />
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className='text-xs sm:text-sm font-medium text-gray-600 mb-1'>{t('admin.filtered')}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">{filteredClients.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <FaFilter className="text-white text-sm sm:text-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                <input
                  type="text"
                  placeholder={t('admin.searchClientsPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:border-[#ffd17a] focus:ring-2 focus:ring-[#ffd17a]/20 focus:outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:border-[#ffd17a] focus:ring-2 focus:ring-[#ffd17a]/20 focus:outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md text-sm sm:text-base"
              >
                <option value='all'>{t('admin.allStatus')}</option>
                <option value='active'>{t('admin.active')}</option>
                <option value='inactive'>{t('admin.inactive')}</option>
                <option value='pending'>{t('admin.pending')}</option>
                <option value='suspended'>{t('admin.suspended')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clients Content */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 sm:py-20">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#242021] rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaSpinner className="animate-spin text-lg sm:text-2xl text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('admin.loadingClients')}</h3>
                <p className="text-sm sm:text-base text-gray-600">{t('admin.fetchingClientData')}</p>
              </div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-16 sm:py-20 px-4 sm:px-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <FaUsers className="text-2xl sm:text-3xl text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">{t('admin.noClientsFound')}</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">{t('admin.noClientsMatchFilters')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">
              {filteredClients.map((client) => {
                const clientApplications = getClientApplications(client.email);
                return (
                  <div
                    key={client._id || client.id}
                    className="group bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    {/* Client Header */}
                    <div className="flex items-start justify-between mb-4 sm:mb-6">
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#ffd17a] border border-[#ffd17a]/20 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:bg-[#ffd17a]/90 transition-all duration-300 flex-shrink-0">
                          <FaUser className="text-[#242021] text-lg sm:text-2xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-[#242021] transition-colors truncate">
                            {client.fullName || client.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{client.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(client.status)}
                          <span className={`text-xs font-medium px-2 sm:px-3 py-1 border rounded-full ${getStatusColor(client.status)}`}>
                            {client.status === 'active' ? t('admin.active') : client.status === 'inactive' ? t('admin.inactive') : client.status || t('admin.active')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Client Details */}
                    <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <FaEnvelope className="mr-2 sm:mr-3 text-[#ffd17a] flex-shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <FaPhone className="mr-2 sm:mr-3 text-[#ffd17a] flex-shrink-0" />
                          <span className="truncate">{client.phone}</span>
                        </div>
                      )}
                      {client.address?.city && (
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <FaMapMarkerAlt className="mr-2 sm:mr-3 text-[#ffd17a] flex-shrink-0" />
                          <span className="truncate">{client.address.city}</span>
                        </div>
                      )}
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <FaFileAlt className="mr-2 sm:mr-3 text-[#ffd17a] flex-shrink-0" />
                        <span className='truncate'>{clientApplications.length} {t('admin.applications')}</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <FaCalendar className="mr-2 sm:mr-3 text-[#ffd17a] flex-shrink-0" />
                        <span className='truncate'>{t('admin.joined')}: {formatDate(client.createdAt)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 sm:gap-3">
                      <button
                        onClick={() => handleViewClient(client)}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg sm:rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
                      >
                        <FaEye className="text-xs sm:text-sm" />
                        {t('admin.view')}
                      </button>
                      {currentUser && currentUser.role === "admin" && (
                        <button
                          onClick={() => handleDeleteClient(client)}
                          disabled={deletingId === (client._id || client.id)}
                          className="sm:col-span-2 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 disabled:opacity-50 rounded-lg sm:rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 disabled:hover:scale-100"
                        >
                          {deletingId === (client._id || client.id) ? (
                            <>
                              <FaSpinner className="animate-spin text-xs sm:text-sm" />
                              {t('admin.deleting')}
                            </>
                          ) : (
                            <>
                              <FaTrash className="text-xs sm:text-sm" />
                              {t('admin.deleteClient')}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Client Details Modal */}
        {showDetailsModal && selectedClient && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-2xl max-h-screen overflow-y-auto border border-gray-200/50">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {t('admin.clientDetails')}
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <FaTimesCircle className="text-lg sm:text-xl" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Personal Information */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200">
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <FaUser className="text-white text-sm sm:text-lg" />
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-gray-800">{t('admin.personalInformation')}</h4>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center">
                      <FaUser className="mr-3 sm:mr-4 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className='text-xs sm:text-sm text-gray-500'>{t('admin.name')}</span>
                        <p className="text-sm sm:text-base text-gray-700 font-semibold truncate">{selectedClient.fullName || selectedClient.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaEnvelope className="mr-3 sm:mr-4 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className='text-xs sm:text-sm text-gray-500'>{t('admin.email')}</span>
                        <p className="text-sm sm:text-base text-gray-700 font-semibold truncate">{selectedClient.email}</p>
                      </div>
                    </div>
                    {selectedClient.phone && (
                      <div className="flex items-center">
                        <FaPhone className="mr-3 sm:mr-4 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className='text-xs sm:text-sm text-gray-500'>{t('admin.phone')}</span>
                          <p className="text-sm sm:text-base text-gray-700 font-semibold truncate">{selectedClient.phone}</p>
                        </div>
                      </div>
                    )}
                    {selectedClient.address && (
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-3 sm:mr-4 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className='text-xs sm:text-sm text-gray-500'>{t('admin.address')}</span>
                          <p className="text-sm sm:text-base text-gray-700 font-semibold truncate">
                            {selectedClient.address.street && `${selectedClient.address.street}, `}
                            {selectedClient.address.city && `${selectedClient.address.city}, `}
                            {selectedClient.address.country}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-gradient-to-br from-[#ffd17a]/10 to-[#ffd17a]/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#ffd17a]/30">
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#242021] rounded-lg sm:rounded-xl flex items-center justify-center">
                      <FaIdCard className="text-white text-sm sm:text-lg" />
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-gray-800">{t('admin.accountInformation')}</h4>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center">
                      <div className="mr-3 sm:mr-4 flex-shrink-0">
                        {getStatusIcon(selectedClient.status)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className='text-xs sm:text-sm text-gray-500'>{t('admin.status')}</span>
                        <p className="text-sm sm:text-base text-gray-700 font-semibold truncate">{selectedClient.status || "Active"}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-3 sm:mr-4 text-[#ffd17a] flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className='text-xs sm:text-sm text-gray-500'>{t('admin.joinedDate')}</span>
                        <p className="text-sm sm:text-base text-gray-700 font-semibold truncate">{formatDate(selectedClient.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaFileAlt className="mr-3 sm:mr-4 text-[#ffd17a] flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className='text-xs sm:text-sm text-gray-500'>{t('admin.totalApplications')}</span>
                        <p className="text-sm sm:text-base text-gray-700 font-semibold truncate">{getClientApplications(selectedClient.email).length}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaUserCheck className="mr-3 sm:mr-4 text-[#ffd17a] flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className='text-xs sm:text-sm text-gray-500'>{t('admin.accountType')}</span>
                        <p className="text-sm sm:text-base text-gray-700 font-semibold truncate">Client</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Applications Section */}
              {getClientApplications(selectedClient.email).length > 0 && (
                <div className="mt-6 sm:mt-8">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-200">
                    <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <FaFileAlt className="text-white text-sm sm:text-lg" />
                      </div>
                      <h4 className="text-lg sm:text-xl font-bold text-gray-800">{t('admin.applications')}</h4>
                    </div>
                    <div className="space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                      {getClientApplications(selectedClient.email).slice(0, 5).map((app, index) => (
                        <div key={index} className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-purple-200">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                {app.serviceDetails?.serviceType || app.serviceType || 'Application'}
                              </h5>
                              <p className='text-xs sm:text-sm text-gray-600'>{t('admin.id')}: {app.applicationId}</p>
                              <p className="text-xs text-gray-500">
                                {t('admin.created')}: {formatDate(app.timestamps?.createdAt || app.createdAt)}
                              </p>
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full border flex-shrink-0 ${
                              app.status?.current === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                              app.status?.current === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              {app.status?.current || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {getClientApplications(selectedClient.email).length > 5 && (
                        <p className="text-xs sm:text-sm text-gray-500 text-center">
                          {t('admin.andMoreApplications', { count: getClientApplications(selectedClient.email).length - 5 })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
                {currentUser && currentUser.role === "admin" && (
                  <button
                    onClick={() => handleDeleteClient(selectedClient)}
                    className="flex-1 px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
                  >
                    <FaTrash className="inline mr-2 text-xs sm:text-sm" />
                    {t('admin.deleteClient')}
                  </button>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 sm:px-8 py-3 sm:py-4 border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium rounded-lg sm:rounded-xl shadow-sm hover:shadow-md text-sm sm:text-base"
                >
                  {t('admin.close')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}