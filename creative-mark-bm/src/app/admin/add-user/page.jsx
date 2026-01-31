"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUser } from '../../../services/userService';
import { FullPageLoading } from '../../../components/LoadingSpinner';
import { useTranslation } from '../../../i18n/TranslationContext';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaCalendar,
  FaSave,
  FaTimes,
  FaSpinner,
  FaCamera,
  FaCheck,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserCircle,
  FaIdCard,
  FaShieldAlt,
  FaUserPlus,
  FaUserTie,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaHandshake,
  FaFileAlt
} from 'react-icons/fa';

export default function AddUserPage() {
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    department: '',
    position: '',
    dateOfBirth: '',
    nationality: '',
    profilePicture: null,
    // Employee fields
    hireDate: '',
    permissions: [],
    workLocation: '',
    emergencyContact: '',
    // Common fields
    userRole: 'employee',
    autoApprove: false
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const departments = [
    t('admin.addUserManagement.departments.administration'),
    t('admin.addUserManagement.departments.humanResources'),
    t('admin.addUserManagement.departments.finance'),
    t('admin.addUserManagement.departments.operations'),
    t('admin.addUserManagement.departments.it'),
    t('admin.addUserManagement.departments.legal'),
    t('admin.addUserManagement.departments.marketing'),
    t('admin.addUserManagement.departments.sales'),
    t('admin.addUserManagement.departments.customerService')
  ];

  const userRoles = [
    { value: 'employee', label: t('forms.employee'), icon: '👤' },
    { value: 'admin', label: t('forms.administrator'), icon: '👑' }
  ];

  // Access levels removed - no longer needed

  const workLocations = [
    t('admin.addUserManagement.workLocations.headOffice'),
    t('admin.addUserManagement.workLocations.branchOffice'),
    t('admin.addUserManagement.workLocations.remote'),
    t('admin.addUserManagement.workLocations.hybrid')
  ];



  const legalFormOfEntityOptions = [
    t('admin.addUserManagement.legalFormOfEntity.limitedLiabilityCompany'),
    t('admin.addUserManagement.legalFormOfEntity.publicJointStockCompany'),
    t('admin.addUserManagement.legalFormOfEntity.privateJointStockCompany'),
    t('admin.addUserManagement.legalFormOfEntity.partnershipLimitedByShares'),
    t('admin.addUserManagement.legalFormOfEntity.limitedPartnership'),
    t('admin.addUserManagement.legalFormOfEntity.generalPartnership'),
    t('admin.addUserManagement.legalFormOfEntity.soleProprietorship'),
    t('admin.addUserManagement.legalFormOfEntity.branchOffice'),
    t('admin.addUserManagement.legalFormOfEntity.representativeOffice'),
    t('admin.addUserManagement.legalFormOfEntity.freeZoneCompany'),
    t('admin.addUserManagement.legalFormOfEntity.other')
  ];

  const titleOptions = [
    t('admin.addUserManagement.titles.mr'),
    t('admin.addUserManagement.titles.ms'),
    t('admin.addUserManagement.titles.dr'),
    t('admin.addUserManagement.titles.prof'),
    t('admin.addUserManagement.titles.eng'),
    t('admin.addUserManagement.titles.other')
  ];

  const genderOptions = [
    t('admin.addUserManagement.genders.male'),
    t('admin.addUserManagement.genders.female'),
    t('admin.addUserManagement.genders.other')
  ];

  const specializations = [
    t('admin.addUserManagement.specializations.legalServices'),
    t('admin.addUserManagement.specializations.financialConsulting'),
    t('admin.addUserManagement.specializations.technicalSupport'),
    t('admin.addUserManagement.specializations.marketing'),
    t('admin.addUserManagement.specializations.design'),
    t('admin.addUserManagement.specializations.translation'),
    t('admin.addUserManagement.specializations.research'),
    t('admin.addUserManagement.specializations.training'),
    t('admin.addUserManagement.specializations.qualityAssurance'),
    t('admin.addUserManagement.specializations.projectManagement')
  ];

  const serviceAreas = [
    t('admin.addUserManagement.serviceAreas.northAmerica'),
    t('admin.addUserManagement.serviceAreas.southAmerica'),
    t('admin.addUserManagement.serviceAreas.europe'),
    t('admin.addUserManagement.serviceAreas.asia'),
    t('admin.addUserManagement.serviceAreas.africa'),
    t('admin.addUserManagement.serviceAreas.australia'),
    t('admin.addUserManagement.serviceAreas.middleEast'),
    t('admin.addUserManagement.serviceAreas.global')
  ];

  const languages = [
    t('admin.addUserManagement.languages.english'),
    t('admin.addUserManagement.languages.spanish'),
    t('admin.addUserManagement.languages.french'),
    t('admin.addUserManagement.languages.german'),
    t('admin.addUserManagement.languages.italian'),
    t('admin.addUserManagement.languages.portuguese'),
    t('admin.addUserManagement.languages.arabic'),
    t('admin.addUserManagement.languages.chinese'),
    t('admin.addUserManagement.languages.japanese'),
    t('admin.addUserManagement.languages.russian')
  ];

  const availabilityOptions = [
    { value: 'available', label: t('admin.addUserManagement.availability.available') },
    { value: 'busy', label: t('admin.addUserManagement.availability.busy') },
    { value: 'unavailable', label: t('admin.addUserManagement.availability.unavailable') }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };


  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  // Helper function to get input className with error styling
  const getInputClassName = (fieldName, baseClasses = "") => {
    const errorClasses = errors[fieldName] ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200';
    return `${baseClasses} ${errorClasses}`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const fieldName = e.target.name;
    
    if (file) {
      // Check file type based on field
      if (fieldName === 'profilePicture') {
        if (!file.type.startsWith('image/')) {
          setErrors(prev => ({
            ...prev,
            profilePicture: t('admin.addUserManagement.pleaseSelectValidImageFile')
          }));
          return;
        }
      } else {
        // For document files, allow PDF, DOC, DOCX
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
          setErrors(prev => ({
            ...prev,
            [fieldName]: t('admin.addUserManagement.pleaseSelectValidDocumentFile')
          }));
          return;
        }
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB for documents
        setErrors(prev => ({
          ...prev,
          [fieldName]: t('admin.addUserManagement.fileSizeMustBeLessThan10MB')
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));
      
      if (errors[fieldName]) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = t('admin.addUserManagement.fullNameIsRequired');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('admin.addUserManagement.emailIsRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('admin.addUserManagement.emailIsInvalid');
    }
    
    if (!formData.password) {
      newErrors.password = t('admin.addUserManagement.passwordIsRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('admin.addUserManagement.passwordMustBeAtLeast8Characters');
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('admin.addUserManagement.pleaseConfirmPassword');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('admin.addUserManagement.passwordsDoNotMatch');
    }
    
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t('admin.addUserManagement.phoneNumberIsInvalid');
    }
    
    // Website field removed - no validation needed

    if (!formData.userRole) {
      newErrors.userRole = t('admin.addUserManagement.userRoleIsRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setSuccess('');
      setErrors({}); // Clear previous errors
      
      // Prepare user data for API
      const userData = {
        ...formData,
        role: formData.userRole // Map userRole to role for API
      };
      
      const response = await createUser(userData);
      
      if (response.success) {
        const successMessage = response.autoApproved
          ? `${formData.userRole === 'employee' ? t('admin.addUserManagement.employeeCreatedSuccessfully') : t('admin.addUserManagement.userCreatedSuccessfully')} and auto-approved`
          : `${formData.userRole === 'employee' ? t('admin.addUserManagement.employeeCreatedSuccessfully') : t('admin.addUserManagement.userCreatedSuccessfully')}. Email verification sent`;
        setSuccess(successMessage);

        // Reset form after success
        setTimeout(() => {
          router.push('/admin/all-employees');
        }, 2000);
      } else {
        setErrors({ general: response.message || t('admin.addUserManagement.failedToCreateUser') });
      }
      
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Handle backend validation errors
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Handle validation errors array
          const fieldErrors = {};
          errorData.errors.forEach(errorMsg => {
            // Try to extract field name from error message
            if (errorMsg.toLowerCase().includes('email')) {
              fieldErrors.email = errorMsg;
            } else if (errorMsg.toLowerCase().includes('password')) {
              fieldErrors.password = errorMsg;
            } else if (errorMsg.toLowerCase().includes('name')) {
              fieldErrors.fullName = errorMsg;
            } else if (errorMsg.toLowerCase().includes('phone')) {
              fieldErrors.phone = errorMsg;
            } else {
              // If we can't map to a specific field, add to general errors
              fieldErrors.general = fieldErrors.general ? `${fieldErrors.general}; ${errorMsg}` : errorMsg;
            }
          });
          setErrors(fieldErrors);
        } else if (errorData.message) {
          // Handle single error message
          setErrors({ general: errorData.message });
        } else {
          setErrors({ general: error.message || t('admin.addUserManagement.failedToCreateUser') });
        }
      } else {
        setErrors({ general: error.message || t('admin.addUserManagement.failedToCreateUser') });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/all-employees');
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
      department: '',
      position: '',
      dateOfBirth: '',
      nationality: '',
      profilePicture: null,
      // Employee fields
      hireDate: '',
      permissions: [],
      workLocation: '',
      emergencyContact: '',
      // Common fields
      userRole: 'employee',
      autoApprove: false
    });
    setErrors({});
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#242021] flex items-center justify-center">
                <FaUserPlus className="text-xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('forms.addNewUser')}
                </h1>
                <p className="text-gray-600 mt-1">
                  {t('forms.createNewAccount')}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 transition-colors font-medium"
            >
              <FaTimes className="mr-2" />
              {t('buttons.cancel')}
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="bg-white border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{t('descriptions.formProgress')}</h3>
              <span className="text-sm font-medium text-gray-600">
                {(() => {
                  const fields = ['fullName', 'email', 'password', 'userRole'];
                  const completed = fields.filter(field => formData[field] && formData[field].toString().trim() !== '').length;
                  return `${completed}/${fields.length} ${t('descriptions.completed')}`;
                })()}
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2">
              <div
                className="bg-[#ffd17a] h-2 transition-all duration-500"
                style={{
                  width: `${(() => {
                    const fields = ['fullName', 'email', 'password', 'userRole'];
                    const completed = fields.filter(field => formData[field] && formData[field].toString().trim() !== '').length;
                    return (completed / fields.length) * 100;
                  })()}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 flex items-center">
            <div className="w-10 h-10 bg-emerald-500 flex items-center justify-center mr-4 flex-shrink-0">
              <FaCheck className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-emerald-900 font-bold">{success}</p>
              <p className="text-emerald-700 text-sm">{t('admin.addUserManagement.redirectingToUsersList')}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 flex items-center">
            <div className="w-10 h-10 bg-red-500 flex items-center justify-center mr-4 flex-shrink-0">
              <FaExclamationTriangle className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-red-900 font-bold">{t('admin.addUserManagement.error')}</p>
              <p className="text-red-700 text-sm">{errors.general}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture Section */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <FaCamera className="mr-2 text-gray-600" />
                  {t('admin.addUserManagement.profilePicture')}
                </h3>

                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                      {formData.profilePicture ? (
                        <img
                          src={URL.createObjectURL(formData.profilePicture)}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUserCircle className="text-6xl text-gray-400" />
                      )}
                    </div>

                    <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#ffd17a] flex items-center justify-center cursor-pointer hover:bg-[#ffd17a]/90 transition-colors">
                      <FaCamera className="text-[#242021] text-sm" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.addUserManagement.uploadProfilePhoto')}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-[#ffd17a] file:text-[#242021] hover:file:bg-[#ffd17a]/90"
                    />
                    {errors.profilePicture && (
                      <p className="text-red-600 text-sm mt-1">{errors.profilePicture}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {t('admin.addUserManagement.maxSizeFormats')}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Form Fields */}
          <div className="lg:col-span-2 space-y-6">
              {/* Account Information */}
              <div className="bg-white border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <FaLock className="mr-2 text-gray-600" />
                  {t('admin.addUserManagement.accountInformation')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center">
                      <FaUser className="mr-2 text-gray-500" />
                      {t('forms.userRole')} *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {userRoles.map(role => (
                        <label
                          key={role.value}
                          className={`relative flex flex-col items-center p-6 border-2 cursor-pointer transition-colors ${
                            formData.userRole === role.value
                              ? 'border-[#ffd17a] bg-[#ffd17a]/5'
                              : 'border-gray-200 hover:border-[#ffd17a]/50 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="userRole"
                            value={role.value}
                            checked={formData.userRole === role.value}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className={`w-16 h-16 flex items-center justify-center ${
                              formData.userRole === role.value
                                ? 'bg-[#ffd17a]'
                                : 'bg-gray-100'
                            }`}>
                              <span className="text-2xl">{role.icon}</span>
                            </div>
                            <div>
                              <div className={`text-lg font-bold ${
                                formData.userRole === role.value ? 'text-[#242021]' : 'text-gray-900'
                              }`}>
                                {role.label}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {role.value === 'employee' && t('admin.addUserManagement.internalTeamMember')}
                                {role.value === 'admin' && t('admin.addUserManagement.systemAdministrator')}
                              </div>
                            </div>
                          </div>
                          {formData.userRole === role.value && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#ffd17a] flex items-center justify-center">
                              <FaCheck className="text-[#242021] text-xs" />
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                    {errors.userRole && (
                      <p className="text-red-600 text-sm mt-2">{errors.userRole}</p>
                    )}
                  </div>

                  {/* Auto Approve Checkbox */}
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="autoApprove"
                        checked={formData.autoApprove}
                        onChange={(e) => setFormData(prev => ({ ...prev, autoApprove: e.target.checked }))}
                        className="w-4 h-4 text-[#ffd17a] border-gray-300 focus:ring-[#ffd17a] focus:ring-2"
                      />
                      <div className="flex items-center">
                        <FaCheckCircle className="mr-2 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Auto-approve user (skip email verification)
                        </span>
                      </div>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-7">
                      If checked, user will be automatically verified and can log in immediately
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaLock className="mr-2 text-gray-500" />
                      {t('forms.password')} *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-colors pr-12 bg-white text-sm ${
                          errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'
                        }`}
                        placeholder={t('admin.addUserManagement.enterPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaLock className="mr-2 text-gray-500" />
                      {t('forms.confirmPassword')} *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-colors pr-12 bg-white text-sm ${
                          errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'
                        }`}
                        placeholder={t('admin.addUserManagement.confirmPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <FaUser className="mr-2 text-gray-600" />
                  {t('admin.addUserManagement.personalInformation')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaUser className="mr-2 text-gray-500" />
                      {t('forms.fullName')} *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-colors bg-white text-sm ${
                        errors.fullName ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'
                      }`}
                      placeholder={t('admin.addUserManagement.enterFullName')}
                    />
                    {errors.fullName && (
                      <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaEnvelope className="mr-2 text-gray-500" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-colors bg-white text-sm ${
                        errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'
                      }`}
                      placeholder={t('admin.addUserManagement.enterEmailAddress')}
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Employment Information - Only show for employees */}
              {formData.userRole === 'employee' && (
                <div className="bg-white border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <FaUserTie className="mr-2 text-gray-600" />
                  {t('admin.addUserManagement.employmentInformation')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaBuilding className="mr-2 text-gray-500" />
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-colors bg-white text-sm ${
                        errors.department ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="text-red-600 text-sm mt-1">{errors.department}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaIdCard className="mr-2 text-gray-500" />
                      Position
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-colors bg-white text-sm ${
                        errors.position ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'
                      }`}
                      placeholder={t('admin.addUserManagement.enterPosition')}
                    />
                    {errors.position && (
                      <p className="text-red-600 text-sm mt-1">{errors.position}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaCalendar className="mr-2 text-gray-500" />
                      Hire Date
                    </label>
                    <input
                      type="date"
                      name="hireDate"
                      value={formData.hireDate}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-colors bg-white text-sm ${
                        errors.hireDate ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'
                      }`}
                    />
                    {errors.hireDate && (
                      <p className="text-red-600 text-sm mt-1">{errors.hireDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-gray-500" />
                      Work Location
                    </label>
                    <select
                      name="workLocation"
                      value={formData.workLocation}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-colors bg-white text-sm ${
                        errors.workLocation ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select work location</option>
                      {workLocations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                    {errors.workLocation && (
                      <p className="text-red-600 text-sm mt-1">{errors.workLocation}</p>
                    )}
                  </div>

                </div>
                </div>
              )}

            </div>

            {/* Action Buttons */}
            <div className="mt-8">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium"
                >
                  <FaTimes className="mr-2" />
                  {t('buttons.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white hover:bg-gray-700 transition-colors font-medium"
                >
                  <FaTimes className="mr-2" />
                  {t('admin.addUserManagement.resetForm')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center px-6 py-3 bg-[#242021] text-white hover:bg-[#242021]/90 disabled:opacity-50 transition-colors font-medium"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      {t('buttons.creating')} {formData.userRole === 'employee' ? t('forms.employee') : t('forms.administrator')}...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      {t('buttons.create')} {formData.userRole === 'employee' ? t('forms.employee') : t('forms.administrator')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
  );
}