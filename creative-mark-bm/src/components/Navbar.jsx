// Navbar.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../i18n/TranslationContext";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationDropdown from "./NotificationDropdown";
import { useSocket } from "../contexts/SocketContext";
import { 
  FaBars, FaTimes, FaChevronDown, FaSignOutAlt, FaUser, FaCog, FaQuestionCircle, 
  FaSpinner, FaCalendar, FaPhone, FaEnvelope, FaHeadset, FaFileAlt, FaClock, FaCheckCircle
} from "react-icons/fa";

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const { user: currentUser, handleLogout: authHandleLogout } = useAuth();
  const { t, isRTL } = useTranslation();
  const router = useRouter();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const { notifications, unreadCount } = useSocket();

  const refreshUserData = async () => {
    setRefreshing(true);
    try {
      // Refresh handled by AuthContext
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      authHandleLogout();
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
      router.push("/");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-[#292422] border-b border-gray-700">
        <div className="flex items-center justify-between h-18 sm:h-20 lg:h-22 px-6 sm:px-8 lg:px-12">
          
          {/* Left Section */}
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2 sm:space-x-3 lg:space-x-4' : 'space-x-2 sm:space-x-3 lg:space-x-4'}`}>
            {/* Mobile Menu Toggle */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-3 hover:bg-gray-800 transition-colors"
              style={{ color: '#ffd17a' }}
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <FaTimes className="h-5 w-5 sm:h-6 sm:w-6" /> : <FaBars className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>

            {/* Breadcrumb / Title */}
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
              {!isSidebarOpen && (
                <div className="hidden md:block lg:hidden">
                  <h1 className="text-lg sm:text-xl font-bold" style={{ color: '#ffd17a' }}>Creative Mark</h1>
                </div>
              )}
              <div className={`hidden lg:flex items-center text-sm ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <span className="text-gray-300">{t('navigation.dashboard')}</span>
                <FaChevronDown className={`h-3 w-3 text-gray-400 transform ${isRTL ? 'rotate-90' : '-rotate-90'}`} />
                <span className="text-[#ffd17a] font-medium">{t('navigation.overview')}</span>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-0 md:space-x-2 lg:space-x-4' : 'space-x-0 md:space-x-2 lg:space-x-4'}`}>
            
            {/* Notifications */}
            {currentUser && <NotificationDropdown />}

            {/* Help Modal */}
            {currentUser?.role === 'client' && (
              <button
                onClick={() => setShowHelpModal(true)}
                className="p-3 hover:bg-gray-800 transition-colors"
                style={{ color: '#ffd17a' }}
                aria-label={t('navigation.helpSupport')}
              >
                <FaQuestionCircle className="h-4 w-4 sm:h-6 sm:w-6" />
              </button>
            )}

            {currentUser?.role === 'client' && (
              <div className="hidden sm:block w-px h-6 bg-gray-400/30"></div>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center p-2 sm:p-3 hover:bg-gray-800 transition-colors ${isRTL ? 'space-x-reverse space-x-2 sm:space-x-3' : 'space-x-2 sm:space-x-3'}`}
                style={{ color: '#ffd17a' }}
              >
                {/* Avatar */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#ffd17a]/30">
                  {currentUser?.profilePicture ? (
                    <img src={currentUser.profilePicture} alt="Profile" className="w-full h-full object-cover"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm sm:text-base"
                         style={{ backgroundColor: '#ffd17a', color: '#242021' }}>
                      {(currentUser?.fullName || currentUser?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">{currentUser?.fullName || currentUser?.name || 'User'}</div>
                  <div className="text-xs opacity-80">{currentUser?.role || 'User'}</div>
                </div>

                <FaChevronDown className={`h-3 w-3 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className={`absolute mt-2 w-64 sm:w-72 bg-white border border-gray-200 py-4 z-30 ${isRTL ? 'left-0' : 'right-0'} max-w-[calc(100vw-2rem)]`}>
                  <div className="px-4 pb-3 border-b border-gray-200/50">
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className={`flex items-center w-full p-2 hover:bg-gray-50 transition-colors ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                        {currentUser?.profilePicture ? (
                          <img src={currentUser.profilePicture} alt="Profile" className="w-full h-full object-cover"/>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                               style={{ backgroundColor: '#ffd17a', color: '#242021' }}>
                            {(currentUser?.fullName || currentUser?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className="font-semibold text-gray-900 text-sm">{currentUser?.fullName || 'User'}</div>
                        <div className="text-xs text-gray-600">{currentUser?.email || 'user@example.com'}</div>
                        <div className="text-xs text-gray-500 mt-1">{currentUser?.role}</div>
                      </div>
                    </button>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={() => { setShowUserMenu(false); router.push(`/${currentUser?.role}/profile`) }}
                      className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors ${isRTL ? 'space-x-reverse space-x-3 text-right' : 'space-x-3 text-left'}`}
                    >
                      <FaUser className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">{t('navigation.profileSettings')}</span>
                    </button>

                    <button
                      onClick={() => { setShowUserMenu(false); router.push(`/${currentUser?.role}/settings`) }}
                      className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors ${isRTL ? 'space-x-reverse space-x-3 text-right' : 'space-x-3 text-left'}`}
                    >
                      <FaCog className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">{t('navigation.accountSettings')}</span>
                    </button>

                    <button
                      onClick={refreshUserData}
                      disabled={refreshing}
                      className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 ${isRTL ? 'space-x-reverse space-x-3 text-right' : 'space-x-3 text-left'}`}
                    >
                      {refreshing ? <FaSpinner className="h-4 w-4 text-blue-600 animate-spin" /> : <FaCalendar className="h-4 w-4 text-blue-600" />}
                      <span className="text-sm font-medium text-blue-900">{refreshing ? t('messages.refreshing') : t('navigation.refreshProfile')}</span>
                    </button>

                    <div className="border-t border-gray-200 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-red-600 ${isRTL ? 'space-x-reverse space-x-3 text-right' : 'space-x-3 text-left'}`}
                    >
                      <FaSignOutAlt className="h-4 w-4" />
                      <span className="text-sm font-medium">{t('buttons.logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelpModal && currentUser?.role === 'client' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal content here - same as your previous implementation */}
          </div>
        </div>
      )}
    </>
  );
}
