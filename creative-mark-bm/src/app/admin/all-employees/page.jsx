"use client";

import { useState, useEffect } from "react";
import { getAllEmployees } from "../../../services/employeeApi";
import { deleteUser } from "../../../services/userService";
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
  FaEdit,
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
  FaShieldAlt
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';
import { useTranslation } from '../../../i18n/TranslationContext';

export default function AllEmployeesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchEmployees();
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

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await getAllEmployees();
      console.log("Employees API response:", response);
      
      if (response.success && response.data) {
        setEmployees(response.data);
      } else {
        console.error("Failed to fetch employees:", response.message);
        setEmployees([]);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setEmployees([]);
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
      default:
        return <FaUser className="text-gray-600" />;
    }
  };

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || employee.status === filterStatus;
    const matchesDepartment = filterDepartment === "all" || employee.department === filterDepartment;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Get unique departments for filter
  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];

  // Handle actions
  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  const handleEditEmployee = (employee) => {
    // TODO: Implement edit employee functionality
    console.log("Edit employee:", employee);
  };

  const handleDeleteEmployee = async (employee) => {
    if (!currentUser || currentUser.role !== "admin") {
      Swal.fire({
        title: t('admin.employeeManagementDetails.permissionDenied'),
        text: t('admin.employeeManagementDetails.onlyAdminCanDelete'),
        icon: 'error',
        confirmButtonColor: '#dc2626',
        confirmButtonText: t('buttons.confirm'),
        background: '#ffffff',
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
          title: 'text-gray-900 font-semibold',
          content: 'text-gray-600'
        }
      });
      return;
    }

    const result = await Swal.fire({
      title: t('admin.employeeManagementDetails.deleteEmployee'),
      html: `
        <div class="text-left">
          <p class="text-gray-700 mb-4">
            ${t('admin.employeeManagementDetails.areYouSureDelete')} <strong>${employee.name}</strong>?
          </p>
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p class="text-red-800 font-semibold mb-2">${t('admin.employeeManagementDetails.actionCannotBeUndone')}</p>
            <ul class="text-red-700 text-sm space-y-1">
              <li>${t('admin.employeeManagementDetails.employeeAccountAndProfile')}</li>
              <li>${t('admin.employeeManagementDetails.allAssociatedData')}</li>
              <li>${t('admin.employeeManagementDetails.accessPermissions')}</li>
            </ul>
          </div>
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p class="text-gray-600 text-sm">
              <strong>${t('admin.employeeManagementDetails.employeeLabel')}</strong> ${employee.name}
            </p>
            <p class="text-gray-600 text-sm">
              <strong>${t('admin.employeeManagementDetails.emailLabel')}</strong> ${employee.email}
            </p>
            <p class="text-gray-600 text-sm">
              <strong>${t('admin.employeeManagementDetails.departmentLabel')}</strong> ${employee.department || t('admin.employeeManagementDetails.nA')}
            </p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('admin.employeeManagementDetails.yesDeleteEmployee'),
      cancelButtonText: t('buttons.cancel'),
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
        setDeletingId(employee._id || employee.id);

        // Show loading alert
        Swal.fire({
          title: t('admin.employeeManagementDetails.deletingEmployee'),
          text: t('admin.employeeManagementDetails.pleaseWaitDelete'),
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

        await deleteUser(employee._id || employee.id, currentUser._id);

        // Remove the deleted employee from the local state
        setEmployees(prev => prev.filter(emp => (emp._id || emp.id) !== (employee._id || employee.id)));

        // Show success alert
        Swal.fire({
          title: t('admin.employeeManagementDetails.successfullyDeleted'),
          text: `${employee.name} ${t('admin.employeeManagementDetails.hasBeenPermanentlyDeleted')}`,
          icon: 'success',
          confirmButtonColor: '#059669',
          confirmButtonText: t('buttons.confirm'),
          background: '#ffffff',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-gray-900 font-semibold',
            content: 'text-gray-600',
            confirmButton: 'rounded-lg font-medium px-6 py-3'
          }
        });
      } catch (error) {
        console.error('Error deleting employee:', error);
        Swal.fire({
          title: t('admin.employeeManagementDetails.deletionFailed'),
          text: `${t('admin.employeeManagementDetails.failedToDeleteEmployee')} ${error.message}`,
          icon: 'error',
          confirmButtonColor: '#dc2626',
          confirmButtonText: t('buttons.confirm'),
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
    if (!dateString) return t('admin.employeeManagementDetails.nA');
    return new Date(dateString).toLocaleDateString();
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
                    {t('admin.employeeManagement')}
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1 sm:mt-2">
                    {t('admin.manageEmployeeAccounts')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={() => router.push('/admin/add-user')}
                className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-[#ffd17a] text-[#242021] hover:bg-[#ffd17a]/90 transition-all duration-200 font-semibold rounded-lg sm:rounded-xl shadow-md hover:shadow-lg hover:scale-105 text-sm sm:text-base"
              >
                <FaPlus className="mr-2 text-sm sm:text-base" />
                {t('admin.addEmployee')}
              </button>
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
                <p className='text-xs sm:text-sm font-medium text-gray-600 mb-1'>{t('admin.totalEmployees')}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{employees.length}</p>
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
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#242021]">{employees.filter(emp => emp.status === 'active').length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#ffd17a] rounded-lg sm:rounded-xl flex items-center justify-center">
                <FaCheckCircle className="text-[#242021] text-sm sm:text-lg" />
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className='text-xs sm:text-sm font-medium text-gray-600 mb-1'>{t('admin.departments')}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{departments.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <FaBuilding className="text-white text-sm sm:text-lg" />
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className='text-xs sm:text-sm font-medium text-gray-600 mb-1'>{t('admin.filtered')}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">{filteredEmployees.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <FaFilter className="text-white text-sm sm:text-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                <input
                  type="text"
                  placeholder={t('admin.searchEmployeesPlaceholder')}
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
              </select>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:border-[#ffd17a] focus:ring-2 focus:ring-[#ffd17a]/20 focus:outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md text-sm sm:text-base"
              >
                <option value='all'>{t('admin.allDepartments')}</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Employees Content */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 sm:py-20">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#242021] rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaSpinner className="animate-spin text-lg sm:text-2xl text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('admin.loadingEmployees')}</h3>
                <p className="text-sm sm:text-base text-gray-600">{t('admin.fetchingEmployeeData')}</p>
              </div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-16 sm:py-20 px-4 sm:px-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <FaUsers className="text-2xl sm:text-3xl text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">{t('admin.noEmployeesFound')}</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">{t('admin.noEmployeesMatchFilters')}</p>
              <button
                onClick={() => router.push('/admin/add-user')}
                className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-[#ffd17a] text-[#242021] hover:bg-[#ffd17a]/90 transition-all duration-200 font-semibold rounded-lg sm:rounded-xl shadow-md hover:shadow-lg hover:scale-105 text-sm sm:text-base"
              >
                <FaPlus className="mr-2 text-sm sm:text-base" />
                {t('admin.addFirstEmployee')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee._id || employee.id}
                  className="group bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  {/* Employee Header */}
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#ffd17a] border border-[#ffd17a]/20 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:bg-[#ffd17a]/90 transition-all duration-300 flex-shrink-0">
                        <FaUser className="text-[#242021] text-lg sm:text-2xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-[#242021] transition-colors truncate">{employee.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{employee.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(employee.status)}
                        <span className={`text-xs font-medium px-2 sm:px-3 py-1 border rounded-full ${getStatusColor(employee.status)}`}>
                          {employee.status === 'active' ? t('admin.active') : employee.status === 'inactive' ? t('admin.inactive') : employee.status || t('admin.active')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Employee Details */}
                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <FaBuilding className="mr-2 sm:mr-3 text-[#ffd17a] flex-shrink-0" />
                      <span className='truncate'>{employee.department || t('admin.employeeManagementDetails.nA')}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <FaUserCheck className="mr-2 sm:mr-3 text-[#ffd17a] flex-shrink-0" />
                      <span className='truncate'>{employee.role || t('admin.employee')}</span>
                    </div>
                    {employee.phone && (
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <FaPhone className="mr-2 sm:mr-3 text-[#ffd17a] flex-shrink-0" />
                        <span className="truncate">{employee.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <FaCalendar className="mr-2 sm:mr-3 text-[#ffd17a] flex-shrink-0" />
                      <span className='truncate'>{t('admin.joined')}: {formatDate(employee.createdAt)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 sm:gap-3">
                    <button
                      onClick={() => handleViewEmployee(employee)}
                      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg sm:rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
                    >
                      <FaEye className="text-xs sm:text-sm" />
                      {t('admin.view')}
                    </button>
                    {currentUser && currentUser.role === "admin" && (
                      <button
                        onClick={() => handleDeleteEmployee(employee)}
                        disabled={deletingId === (employee._id || employee.id)}
                        className="sm:col-span-2 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 disabled:opacity-50 rounded-lg sm:rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 disabled:hover:scale-100"
                      >
                        {deletingId === (employee._id || employee.id) ? (
                          <>
                            <FaSpinner className="animate-spin text-xs sm:text-sm" />
                            {t('admin.deleting')}
                          </>
                        ) : (
                          <>
                            <FaTrash className="text-xs sm:text-sm" />
                            {t('admin.deleteEmployee')}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Employee Details Modal */}
        {showDetailsModal && selectedEmployee && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-2xl max-h-screen overflow-y-auto border border-gray-200/50">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {t('admin.employeeDetails')}
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
                        <p className="text-sm sm:text-base text-gray-700 font-semibold truncate">{selectedEmployee.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaEnvelope className="mr-3 sm:mr-4 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className='text-xs sm:text-sm text-gray-500'>{t('admin.email')}</span>
                        <p className="text-sm sm:text-base text-gray-700 font-semibold truncate">{selectedEmployee.email}</p>
                      </div>
                    </div>
                    {selectedEmployee.phone && (
                      <div className="flex items-center">
                        <FaPhone className="mr-3 sm:mr-4 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className='text-xs sm:text-sm text-gray-500'>{t('admin.phone')}</span>
                          <p className="text-sm sm:text-base text-gray-700 font-semibold truncate">{selectedEmployee.phone}</p>
                        </div>
                      </div>
                    )}
                    {selectedEmployee.address && (
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-3 sm:mr-4 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className='text-xs sm:text-sm text-gray-500'>{t('admin.address')}</span>
                          <p className="text-sm sm:text-base text-gray-700 font-semibold truncate">{selectedEmployee.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Work Information */}
                <div className="bg-gradient-to-br from-[#ffd17a]/10 to-[#ffd17a]/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#ffd17a]/30">
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#242021] rounded-lg sm:rounded-xl flex items-center justify-center">
                      <FaBuilding className="text-white text-sm sm:text-lg" />
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-gray-800">{t('admin.workInformation')}</h4>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center">
                      <FaBuilding className="mr-3 sm:mr-4 text-[#ffd17a] flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className='text-xs sm:text-sm text-gray-500'>{t('admin.department')}</span>
                        <p className="text-sm sm:text-base text-gray-700 font-semibold truncate">{selectedEmployee.department || t('admin.employeeManagementDetails.nA')}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaUserCheck className="mr-3 sm:mr-4 text-[#ffd17a] flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className='text-xs sm:text-sm text-gray-500'>{t('admin.role')}</span>
                        <p className="text-sm sm:text-base text-gray-700 font-semibold truncate">{selectedEmployee.role || t('admin.employeeManagementDetails.employee')}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-3 sm:mr-4 flex-shrink-0">
                      {getStatusIcon(selectedEmployee.status)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className='text-xs sm:text-sm text-gray-500'>{t('admin.status')}</span>
                        <p className="text-sm sm:text-base text-gray-700 font-semibold truncate">{selectedEmployee.status || t('admin.employeeManagementDetails.active')}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-3 sm:mr-4 text-[#ffd17a] flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className='text-xs sm:text-sm text-gray-500'>{t('admin.joinedDate')}</span>
                        <p className="text-sm sm:text-base text-gray-700 font-semibold truncate">{formatDate(selectedEmployee.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
                {currentUser && currentUser.role === "admin" && (
                  <button
                    onClick={() => handleDeleteEmployee(selectedEmployee)}
                    className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
                  >
                    <FaTrash className="inline mr-2 text-sm sm:text-base" />
                    {t('admin.deleteEmployee')}
                  </button>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold rounded-lg sm:rounded-xl shadow-sm hover:shadow-md text-sm sm:text-base"
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