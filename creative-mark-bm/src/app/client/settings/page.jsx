"use client";

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import AuthContext from '../../../contexts/AuthContext';
import { getCurrentUser, updatePassword, updateUserSettings } from '../../../services/auth';
import { useTranslation } from '../../../i18n/TranslationContext';
import {
  FaLock,
  FaBell,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaTimes,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
  FaUser,
  FaEnvelope,
  FaGlobe,
  FaMoon,
  FaSun,
  FaDesktop,
  FaLanguage,
  FaPalette,
  FaCog,
  FaTrash,
  FaDownload,
  FaKey,
  FaFileContract,
  FaCreditCard,
  FaChartLine,
  FaCalendarAlt
} from 'react-icons/fa';

export default function ClientSettingsPage() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('security');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Settings form
  const [settingsForm, setSettingsForm] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    securityAlerts: true,
    projectUpdates: true,
    paymentReminders: true,
    language: 'en',
    timezone: 'UTC',
    theme: 'light',
    twoFactorAuth: false,
    sessionTimeout: 30,
    // Client-specific settings
    autoSaveDrafts: true,
    showProjectProgress: true,
    enableNotifications: true,
    dataSharing: false,
    analyticsTracking: true
  });
  
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const tabs = [
    { id: 'security', label: t('settings.security'), icon: FaShieldAlt },
    { id: 'notifications', label: t('settings.notifications'), icon: FaBell },
    { id: 'preferences', label: t('settings.preferences'), icon: FaCog },
    { id: 'privacy', label: t('settings.privacy'), icon: FaUser },
    { id: 'billing', label: t('settings.billing'), icon: FaCreditCard }
  ];

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      const response = await getCurrentUser();
      if (response.success) {
        const userData = response.data;
        setCurrentUser(userData);
        setSettingsForm({
          emailNotifications: userData.settings?.emailNotifications ?? true,
          smsNotifications: userData.settings?.smsNotifications ?? false,
          marketingEmails: userData.settings?.marketingEmails ?? true,
          securityAlerts: userData.settings?.securityAlerts ?? true,
          projectUpdates: userData.settings?.projectUpdates ?? true,
          paymentReminders: userData.settings?.paymentReminders ?? true,
          language: userData.settings?.language ?? 'en',
          timezone: userData.settings?.timezone ?? 'UTC',
          theme: userData.settings?.theme ?? 'light',
          twoFactorAuth: userData.settings?.twoFactorAuth ?? false,
          sessionTimeout: userData.settings?.sessionTimeout ?? 30,
          autoSaveDrafts: userData.settings?.autoSaveDrafts ?? true,
          showProjectProgress: userData.settings?.showProjectProgress ?? true,
          enableNotifications: userData.settings?.enableNotifications ?? true,
          dataSharing: userData.settings?.dataSharing ?? false,
          analyticsTracking: userData.settings?.analyticsTracking ?? true
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
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

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettingsForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = t('settings.currentPasswordRequired');
    }
    
    if (!passwordForm.newPassword) {
      newErrors.newPassword = t('settings.newPasswordRequired');
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = t('settings.passwordMinLength');
    }
    
    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = t('settings.confirmPasswordRequired');
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = t('settings.passwordsDoNotMatch');
    }
    
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      newErrors.newPassword = t('settings.passwordMustBeDifferent');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordUpdate = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    try {
      setSaving(true);
      setSuccess('');
      
      const response = await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (response.success) {
        setSuccess(t('settings.passwordUpdatedSuccessfully'));
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setErrors({ general: response.message || t('settings.failedToUpdatePassword') });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setErrors({ general: t('settings.failedToUpdatePasswordTryAgain') });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsUpdate = async () => {
    try {
      setSaving(true);
      setSuccess('');
      
      const response = await updateUserSettings(settingsForm);
      
      if (response.success) {
        setCurrentUser(prev => ({
          ...prev,
          settings: settingsForm
        }));
        setSuccess(t('settings.settingsUpdatedSuccessfully'));
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setErrors({ general: response.message || t('settings.failedToUpdateSettings') });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setErrors({ general: t('settings.failedToUpdateSettingsTryAgain') });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    const exportData = {
      user: currentUser,
      settings: settingsForm,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `client-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FaSpinner className="animate-spin text-white text-2xl" />
          </div>
          <p className="text-xl text-gray-800 font-bold">{t('settings.loadingSettings')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: '#242021' }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#ffd17a' }}>
                  <FaCog className="text-xl" style={{ color: '#242021' }} />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: '#ffd17a' }}>
                    {t('settings.clientSettings')}
                  </h1>
                  <p className="text-sm font-medium uppercase tracking-wider" style={{ color: 'gray' }}>
                    {t('settings.manageYourClientAccount')}
                  </p>
                </div>
              </div>
              <p className="text-base sm:text-lg font-medium max-w-2xl" style={{ color: 'gray' }}>
                {t('settings.configureAccountPreferences')}
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg flex items-center">
            <FaCheck className="text-emerald-600 mr-3" />
            <p className="text-emerald-800 font-medium">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg flex items-center">
            <FaExclamationTriangle className="text-red-600 mr-3" />
            <p className="text-red-800 font-medium">{errors.general}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`mr-3 text-lg ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Change Password */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <FaLock className="mr-3 text-emerald-600" />
                    Change Password
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-200 ${
                            errors.currentPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200'
                          }`}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-red-600 text-sm mt-1">{errors.currentPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-200 ${
                            errors.newPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200'
                          }`}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-200 ${
                            errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200'
                          }`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <button
                      onClick={handlePasswordUpdate}
                      disabled={saving}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md"
                    >
                      {saving ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaSave className="mr-2" />
                      )}
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <FaShieldAlt className="mr-3 text-emerald-600" />
                    Two-Factor Authentication
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Enable 2FA</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="twoFactorAuth"
                        checked={settingsForm.twoFactorAuth}
                        onChange={handleSettingsChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <FaBell className="mr-3 text-emerald-600" />
                    Notification Preferences
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive notifications via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          checked={settingsForm.emailNotifications}
                          onChange={handleSettingsChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Project Updates</p>
                        <p className="text-sm text-gray-600">Get notified about project progress</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="projectUpdates"
                          checked={settingsForm.projectUpdates}
                          onChange={handleSettingsChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Payment Reminders</p>
                        <p className="text-sm text-gray-600">Get reminded about upcoming payments</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="paymentReminders"
                          checked={settingsForm.paymentReminders}
                          onChange={handleSettingsChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Marketing Emails</p>
                        <p className="text-sm text-gray-600">Receive promotional and marketing emails</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="marketingEmails"
                          checked={settingsForm.marketingEmails}
                          onChange={handleSettingsChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <button
                      onClick={handleSettingsUpdate}
                      disabled={saving}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md"
                    >
                      {saving ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaSave className="mr-2" />
                      )}
                      {saving ? 'Saving...' : 'Save Notification Settings'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <FaCog className="mr-3 text-emerald-600" />
                    General Preferences
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaLanguage className="inline mr-2" />
                        Language
                      </label>
                      <select
                        name="language"
                        value={settingsForm.language}
                        onChange={handleSettingsChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-200"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="ar">Arabic</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaGlobe className="inline mr-2" />
                        Timezone
                      </label>
                      <select
                        name="timezone"
                        value={settingsForm.timezone}
                        onChange={handleSettingsChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-200"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaPalette className="inline mr-2" />
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                          settingsForm.theme === 'light' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                          <input
                            type="radio"
                            name="theme"
                            value="light"
                            checked={settingsForm.theme === 'light'}
                            onChange={handleSettingsChange}
                            className="sr-only"
                          />
                          <FaSun className="mr-2 text-yellow-500" />
                          <span className="text-sm font-medium">Light</span>
                        </label>
                        
                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                          settingsForm.theme === 'dark' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                          <input
                            type="radio"
                            name="theme"
                            value="dark"
                            checked={settingsForm.theme === 'dark'}
                            onChange={handleSettingsChange}
                            className="sr-only"
                          />
                          <FaMoon className="mr-2 text-blue-500" />
                          <span className="text-sm font-medium">Dark</span>
                        </label>
                        
                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                          settingsForm.theme === 'auto' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                          <input
                            type="radio"
                            name="theme"
                            value="auto"
                            checked={settingsForm.theme === 'auto'}
                            onChange={handleSettingsChange}
                            className="sr-only"
                          />
                          <FaDesktop className="mr-2 text-gray-500" />
                          <span className="text-sm font-medium">Auto</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Auto-save Drafts</p>
                        <p className="text-sm text-gray-600">Automatically save form drafts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="autoSaveDrafts"
                          checked={settingsForm.autoSaveDrafts}
                          onChange={handleSettingsChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Show Project Progress</p>
                        <p className="text-sm text-gray-600">Display project progress indicators</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="showProjectProgress"
                          checked={settingsForm.showProjectProgress}
                          onChange={handleSettingsChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <button
                      onClick={handleSettingsUpdate}
                      disabled={saving}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md"
                    >
                      {saving ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaSave className="mr-2" />
                      )}
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <FaUser className="mr-3 text-emerald-600" />
                    Data Management
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Analytics Tracking</p>
                        <p className="text-sm text-gray-600">Allow analytics tracking for better service</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="analyticsTracking"
                          checked={settingsForm.analyticsTracking}
                          onChange={handleSettingsChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Data Sharing</p>
                        <p className="text-sm text-gray-600">Share data with trusted partners</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="dataSharing"
                          checked={settingsForm.dataSharing}
                          onChange={handleSettingsChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-blue-900">Export Your Data</p>
                        <p className="text-sm text-blue-700">Download a copy of your account data</p>
                      </div>
                      <button
                        onClick={handleExportData}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md"
                      >
                        <FaDownload className="mr-2" />
                        Export
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-red-900">Delete Account</p>
                        <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                            alert('Account deletion feature will be implemented soon.');
                          }
                        }}
                        className="flex items-center px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md"
                      >
                        <FaTrash className="mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <FaCreditCard className="mr-3 text-emerald-600" />
                    Billing Information
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-emerald-900">Current Plan</p>
                          <p className="text-sm text-emerald-700">Basic Client Plan</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-full">
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Billing Address
                        </label>
                        <textarea
                          rows="4"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-200"
                          placeholder="Enter your billing address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method
                        </label>
                        <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-200">
                          <option value="">Select payment method</option>
                          <option value="credit">Credit Card</option>
                          <option value="debit">Debit Card</option>
                          <option value="bank">Bank Transfer</option>
                          <option value="paypal">PayPal</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-blue-900">Download Invoice</p>
                        <p className="text-sm text-blue-700">Download your latest invoice</p>
                      </div>
                      <button className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md">
                        <FaDownload className="mr-2" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

