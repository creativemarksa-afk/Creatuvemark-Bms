"use client";

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaSpinner,
  FaCamera,
  FaExclamationTriangle,
  FaCheckCircle,
  FaIdCard
} from 'react-icons/fa';
import { getCurrentUser, updateUserProfile } from '../../../services/auth';
import AuthContext from '../../../contexts/AuthContext';
import { useTranslation } from '../../../i18n/TranslationContext';

export default function ClientProfile() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationality: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    bio: '',
    clientId: ''
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await getCurrentUser();
      if (response.success) {
        const userData = response.data;
        setFormData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          nationality: userData.nationality || '',
          address: userData.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          bio: userData.bio || '',
          clientId: userData.clientDetails?.clientId || ''
        });
        setPreviewImage(userData.profilePicture || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError(t('profile.failedToLoadProfile'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Create FormData for file upload
      const updateData = new FormData();
      
      // Add all form fields to FormData
      updateData.append('fullName', formData.fullName);
      updateData.append('email', formData.email);
      updateData.append('phone', formData.phone);
      updateData.append('nationality', formData.nationality);
      updateData.append('bio', formData.bio);
      updateData.append('address', JSON.stringify(formData.address));
      
      // Add profile picture if selected
      if (profilePicture) {
        updateData.append('profilePicture', profilePicture);
      }

      const response = await updateUserProfile(updateData);
      
      if (response.success) {
        setSuccess(t('profile.profileUpdatedSuccessfully'));
        setEditing(false);
        setProfilePicture(null);
        // Update context
        if (setUser) {
          setUser(response.data);
        }
        // Dispatch event to update navbar profile picture
        window.dispatchEvent(new CustomEvent('profileUpdated'));
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || t('profile.failedToUpdateProfile'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(t('profile.failedToUpdateProfileTryAgain'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setProfilePicture(null);
    setPreviewImage(user?.profilePicture || '');
    loadUserProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="bg-white border-0 overflow-hidden group hover:shadow-xl transition-all duration-300"
               style={{
                 background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                 borderRadius: '20px',
                 boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                 border: '1px solid rgba(255, 209, 122, 0.1)'
               }}>
            <div className="p-16">
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 flex items-center justify-center shadow-xl"
                       style={{
                         background: 'linear-gradient(135deg, #ffd17a 0%, #e6b855 100%)',
                         borderRadius: '16px',
                         boxShadow: '0 8px 25px rgba(255, 209, 122, 0.3)'
                       }}>
                    <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
                  </div>
                </div>
                <span className='text-lg font-semibold text-gray-700'>{t('profile.loadingProfile')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      {/* Header Section */}
      <div className="backdrop-blur-sm border-b" style={{
        background: 'linear-gradient(135deg, #242021 0%, #2a2422 50%, #242021 100%)',
        borderBottomColor: 'rgba(255, 209, 122, 0.2)'
      }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-3 h-3 rounded-full shadow-lg animate-pulse" style={{ backgroundColor: '#ffd17a' }}></div>
                  <span className="text-xs sm:text-sm font-medium uppercase tracking-wider" style={{ color: 'rgba(255, 209, 122, 0.8)' }}>{t('profile.profile')}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-4" style={{ color: '#ffd17a' }}>
                  {t('profile.myProfile')}
                </h1>
                <p className="text-sm sm:text-base lg:text-lg" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {t('profile.managePersonalInformation')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12">
        {/* Action Buttons */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="w-full sm:w-auto px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg shadow-lg group"
                style={{
                  background: 'linear-gradient(135deg, #ffd17a 0%, #e6b855 100%)',
                  color: '#242021',
                  borderRadius: '12px',
                  boxShadow: '0 8px 25px rgba(255, 209, 122, 0.3)'
                }}
              >
                <span className="group-hover:scale-105 transition-transform duration-300">
                  <FaEdit className="inline mr-3" />
                {t('profile.editProfile')}
                </span>
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-8 py-4 text-sm font-semibold uppercase tracking-wider border transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg group"
                  style={{
                    backgroundColor: 'rgba(255, 209, 122, 0.1)',
                    color: '#ffd17a',
                    borderColor: 'rgba(255, 209, 122, 0.3)',
                    borderRadius: '12px'
                  }}
                >
                  <span className="group-hover:scale-105 transition-transform duration-300">
                    <FaTimes className="inline mr-3" />
                  {t('profile.cancel')}
                  </span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="w-full sm:w-auto px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg shadow-lg group disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #ffd17a 0%, #e6b855 100%)',
                    color: '#242021',
                    borderRadius: '12px',
                    boxShadow: '0 8px 25px rgba(255, 209, 122, 0.3)'
                  }}
                >
                  <span className="group-hover:scale-105 transition-transform duration-300">
                  {saving ? (
                    <>
                        <FaSpinner className="animate-spin inline mr-3" />
                      {t('profile.saving')}
                    </>
                  ) : (
                    <>
                        <FaSave className="inline mr-3" />
                      {t('profile.saveChanges')}
                    </>
                  )}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-8 bg-white border-0 overflow-hidden group hover:shadow-xl transition-all duration-300"
               style={{
                 background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                 borderRadius: '12px',
                 boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                 border: '1px solid rgba(34, 197, 94, 0.2)'
               }}>
            <div className="p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="flex-shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center shadow-lg"
                       style={{
                         background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                         borderRadius: '12px',
                         boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                       }}>
                    <FaCheckCircle className="h-6 w-6 text-white" />
                  </div>
              </div>
              <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('profile.success')}</h3>
                  <p className="text-base text-gray-700 mb-6">{success}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 bg-white border-0 overflow-hidden group hover:shadow-xl transition-all duration-300"
               style={{
                 background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                 borderRadius: '12px',
                 boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                 border: '1px solid rgba(239, 68, 68, 0.2)'
               }}>
            <div className="p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="flex-shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center shadow-lg"
                       style={{
                         background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                         borderRadius: '12px',
                         boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                       }}>
                    <FaExclamationTriangle className="h-6 w-6 text-white" />
                  </div>
              </div>
              <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('profile.error')}</h3>
                  <p className="text-base text-gray-700 mb-6">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            
            {/* Profile Picture Section */}
            <div className="lg:col-span-1">
              <div className="bg-white border-0 overflow-hidden group hover:shadow-xl transition-all duration-300"
                   style={{
                     background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                     borderRadius: '20px',
                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                     border: '1px solid rgba(255, 209, 122, 0.1)'
                   }}>
                <div className="p-8" style={{
                  background: 'linear-gradient(135deg, #242021 0%, #2a2422 50%, #242021 100%)',
                  borderRadius: '20px 20px 0 0'
                }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center shadow-lg"
                         style={{
                           background: 'linear-gradient(135deg, #ffd17a 0%, #e6b855 100%)',
                           borderRadius: '8px',
                           boxShadow: '0 4px 12px rgba(255, 209, 122, 0.3)'
                         }}>
                      <FaCamera className="w-5 h-5" style={{ color: '#242021' }} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#ffd17a' }}>{t('profile.profilePicture')}</h3>
                  </div>
                </div>
                <div className="p-8">
                
                  <div className="text-center">
                    <div className="relative inline-block group">
                      <div className="w-32 h-32 bg-gray-50 border-0 flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                           style={{
                             background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                             borderRadius: '16px',
                             border: '2px solid rgba(255, 209, 122, 0.2)',
                             boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                           }}>
                        {previewImage ? (
                          <img
                            src={previewImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            style={{ borderRadius: '14px' }}
                          />
                        ) : (
                          <FaUser className="text-4xl" style={{ color: '#ffd17a' }} />
                        )}
                      </div>
                      {editing && (
                        <label className="absolute -bottom-2 -right-2 w-10 h-10 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-all duration-300"
                               style={{
                                 background: 'linear-gradient(135deg, #ffd17a 0%, #e6b855 100%)',
                                 borderRadius: '50%',
                                 boxShadow: '0 4px 12px rgba(255, 209, 122, 0.4)',
                                 border: '2px solid rgba(255, 255, 255, 0.8)'
                               }}>
                          <FaCamera className="h-5 w-5" style={{ color: '#242021' }} />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    
                    <div className="mt-6 text-center">
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{formData.fullName}</h4>
                      <p className='text-sm text-gray-600 mb-2'>{t('profile.client')}</p>
                      {formData.clientId && (
                        <p className="text-xs sm:text-sm font-semibold px-3 py-1 inline-block"
                           style={{
                             backgroundColor: 'rgba(255, 209, 122, 0.1)',
                             color: '#ffd17a',
                             borderRadius: '8px',
                             border: '1px solid rgba(255, 209, 122, 0.2)'
                           }}>
                          ID: {formData.clientId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Personal Information */}
              <div className="bg-white border-0 overflow-hidden group hover:shadow-xl transition-all duration-300"
                   style={{
                     background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                     borderRadius: '20px',
                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                     border: '1px solid rgba(255, 209, 122, 0.1)'
                   }}>
                <div className="p-8" style={{
                  background: 'linear-gradient(135deg, #242021 0%, #2a2422 50%, #242021 100%)',
                  borderRadius: '20px 20px 0 0'
                }}>
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105"
                         style={{
                           background: 'linear-gradient(135deg, #ffd17a 0%, #e6b855 100%)',
                           borderRadius: '10px',
                           boxShadow: '0 6px 16px rgba(255, 209, 122, 0.4)'
                         }}>
                      <FaUser className="w-6 h-6" style={{ color: '#242021' }} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold" style={{ color: '#ffd17a' }}>{t('profile.personalInformation')}</h3>
                  </div>
                </div>
                <div className="p-8">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="group">
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                      {t('profile.fullName')} *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className={`w-full px-5 py-4 border-0 focus:ring-4 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500 group-hover:shadow-md ${
                        editing ? 'focus:ring-amber-100/50' : ''
                      }`}
                      style={{
                        backgroundColor: editing ? 'rgba(248, 249, 250, 0.8)' : 'rgba(243, 244, 246, 0.5)',
                        borderRadius: '10px',
                        border: editing ? '2px solid rgba(255, 209, 122, 0.2)' : '2px solid rgba(156, 163, 175, 0.2)'
                      }}
                      placeholder={t('profile.enterFullName')}
                    />
                  </div>

                  <div className="group">
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                      {t('profile.emailAddress')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className={`w-full px-5 py-4 border-0 focus:ring-4 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500 group-hover:shadow-md ${
                        editing ? 'focus:ring-amber-100/50' : ''
                      }`}
                      style={{
                        backgroundColor: editing ? 'rgba(248, 249, 250, 0.8)' : 'rgba(243, 244, 246, 0.5)',
                        borderRadius: '10px',
                        border: editing ? '2px solid rgba(255, 209, 122, 0.2)' : '2px solid rgba(156, 163, 175, 0.2)'
                      }}
                      placeholder={t('profile.enterEmail')}
                    />
                  </div>

                  <div className="group">
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                      {t('profile.phoneNumber')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className={`w-full px-5 py-4 border-0 focus:ring-4 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500 group-hover:shadow-md ${
                        editing ? 'focus:ring-amber-100/50' : ''
                      }`}
                      style={{
                        backgroundColor: editing ? 'rgba(248, 249, 250, 0.8)' : 'rgba(243, 244, 246, 0.5)',
                        borderRadius: '10px',
                        border: editing ? '2px solid rgba(255, 209, 122, 0.2)' : '2px solid rgba(156, 163, 175, 0.2)'
                      }}
                      placeholder={t('profile.enterPhoneNumber')}
                    />
                  </div>

                  <div className="group">
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                      {t('profile.nationality')}
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className={`w-full px-5 py-4 border-0 focus:ring-4 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500 group-hover:shadow-md ${
                        editing ? 'focus:ring-amber-100/50' : ''
                      }`}
                      style={{
                        backgroundColor: editing ? 'rgba(248, 249, 250, 0.8)' : 'rgba(243, 244, 246, 0.5)',
                        borderRadius: '10px',
                        border: editing ? '2px solid rgba(255, 209, 122, 0.2)' : '2px solid rgba(156, 163, 175, 0.2)'
                      }}
                      placeholder={t('profile.enterNationality')}
                    />
                  </div>

                  <div className="md:col-span-2 group">
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                      {t('profile.bio')}
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!editing}
                      rows={4}
                      className={`w-full px-5 py-4 border-0 focus:ring-4 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500 group-hover:shadow-md resize-none ${
                        editing ? 'focus:ring-amber-100/50' : ''
                      }`}
                      style={{
                        backgroundColor: editing ? 'rgba(248, 249, 250, 0.8)' : 'rgba(243, 244, 246, 0.5)',
                        borderRadius: '10px',
                        border: editing ? '2px solid rgba(255, 209, 122, 0.2)' : '2px solid rgba(156, 163, 175, 0.2)'
                      }}
                      placeholder={t('profile.tellAboutYourself')}
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white border-0 overflow-hidden group hover:shadow-xl transition-all duration-300"
                   style={{
                     background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                     borderRadius: '20px',
                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                     border: '1px solid rgba(255, 209, 122, 0.1)'
                   }}>
                <div className="p-8" style={{
                  background: 'linear-gradient(135deg, #242021 0%, #2a2422 50%, #242021 100%)',
                  borderRadius: '20px 20px 0 0'
                }}>
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105"
                         style={{
                           background: 'linear-gradient(135deg, #ffd17a 0%, #e6b855 100%)',
                           borderRadius: '10px',
                           boxShadow: '0 6px 16px rgba(255, 209, 122, 0.4)'
                         }}>
                      <FaMapMarkerAlt className="w-6 h-6" style={{ color: '#242021' }} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold" style={{ color: '#ffd17a' }}>{t('profile.addressInformation')}</h3>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2 group">
                      <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                      {t('profile.streetAddress')}
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      disabled={!editing}
                        className={`w-full px-5 py-4 border-0 focus:ring-4 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500 group-hover:shadow-md ${
                          editing ? 'focus:ring-amber-100/50' : ''
                        }`}
                        style={{
                          backgroundColor: editing ? 'rgba(248, 249, 250, 0.8)' : 'rgba(243, 244, 246, 0.5)',
                          borderRadius: '10px',
                          border: editing ? '2px solid rgba(255, 209, 122, 0.2)' : '2px solid rgba(156, 163, 175, 0.2)'
                        }}
                      placeholder={t('profile.enterStreetAddress')}
                    />
                  </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      <div className="group">
                        <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                      {t('profile.city')}
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      disabled={!editing}
                          className={`w-full px-5 py-4 border-0 focus:ring-4 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500 group-hover:shadow-md ${
                            editing ? 'focus:ring-amber-100/50' : ''
                          }`}
                          style={{
                            backgroundColor: editing ? 'rgba(248, 249, 250, 0.8)' : 'rgba(243, 244, 246, 0.5)',
                            borderRadius: '10px',
                            border: editing ? '2px solid rgba(255, 209, 122, 0.2)' : '2px solid rgba(156, 163, 175, 0.2)'
                          }}
                      placeholder={t('profile.enterCity')}
                    />
                  </div>

                      <div className="group">
                        <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                      {t('profile.stateProvince')}
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      disabled={!editing}
                          className={`w-full px-5 py-4 border-0 focus:ring-4 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500 group-hover:shadow-md ${
                            editing ? 'focus:ring-amber-100/50' : ''
                          }`}
                          style={{
                            backgroundColor: editing ? 'rgba(248, 249, 250, 0.8)' : 'rgba(243, 244, 246, 0.5)',
                            borderRadius: '10px',
                            border: editing ? '2px solid rgba(255, 209, 122, 0.2)' : '2px solid rgba(156, 163, 175, 0.2)'
                          }}
                      placeholder={t('profile.enterStateProvince')}
                    />
                  </div>

                      <div className="group">
                        <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                      {t('profile.zipPostalCode')}
                    </label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleInputChange}
                      disabled={!editing}
                          className={`w-full px-5 py-4 border-0 focus:ring-4 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500 group-hover:shadow-md ${
                            editing ? 'focus:ring-amber-100/50' : ''
                          }`}
                          style={{
                            backgroundColor: editing ? 'rgba(248, 249, 250, 0.8)' : 'rgba(243, 244, 246, 0.5)',
                            borderRadius: '10px',
                            border: editing ? '2px solid rgba(255, 209, 122, 0.2)' : '2px solid rgba(156, 163, 175, 0.2)'
                          }}
                      placeholder={t('profile.enterZipPostalCode')}
                    />
                  </div>

                      <div className="group">
                        <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                      {t('profile.country')}
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                      disabled={!editing}
                          className={`w-full px-5 py-4 border-0 focus:ring-4 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500 group-hover:shadow-md ${
                            editing ? 'focus:ring-amber-100/50' : ''
                          }`}
                          style={{
                            backgroundColor: editing ? 'rgba(248, 249, 250, 0.8)' : 'rgba(243, 244, 246, 0.5)',
                            borderRadius: '10px',
                            border: editing ? '2px solid rgba(255, 209, 122, 0.2)' : '2px solid rgba(156, 163, 175, 0.2)'
                          }}
                      placeholder={t('profile.enterCountry')}
                    />
                      </div>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-white border-0 overflow-hidden group hover:shadow-xl transition-all duration-300"
                   style={{
                     background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                     borderRadius: '20px',
                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                     border: '1px solid rgba(255, 209, 122, 0.1)'
                   }}>
                <div className="p-8" style={{
                  background: 'linear-gradient(135deg, #242021 0%, #2a2422 50%, #242021 100%)',
                  borderRadius: '20px 20px 0 0'
                }}>
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105"
                         style={{
                           background: 'linear-gradient(135deg, #ffd17a 0%, #e6b855 100%)',
                           borderRadius: '10px',
                           boxShadow: '0 6px 16px rgba(255, 209, 122, 0.4)'
                         }}>
                      <FaIdCard className="w-6 h-6" style={{ color: '#242021' }} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold" style={{ color: '#ffd17a' }}>{t('profile.clientInformation')}</h3>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="grid grid-cols-1 gap-8">
                    <div className="group">
                      <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                      {t('profile.clientId')}
                    </label>
                      <div className="p-5 bg-gray-50 border-0"
                           style={{
                             borderRadius: '10px',
                             border: '2px solid rgba(156, 163, 175, 0.2)',
                             backgroundColor: 'rgba(243, 244, 246, 0.5)'
                           }}>
                        <p className="text-sm sm:text-base font-semibold text-gray-900">{formData.clientId || "Auto-generated"}</p>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
          </div>
          </div>
          </div>
          
        </form>
        
 
 
      </div>
    </div>
  );
}