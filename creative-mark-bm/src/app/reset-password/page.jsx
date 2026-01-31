"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "../../services/auth";
import { useTranslation } from "../../i18n/TranslationContext";

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic';

function ResetPasswordForm() {
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setError(t('auth.invalidResetLink'));
    }
  }, [token, email, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!newPassword || !confirmPassword) {
      return setError(t('auth.fillAllFields'));
    }
    if (newPassword !== confirmPassword) {
      return setError(t('auth.passwordsDoNotMatch'));
    }
    if (newPassword.length < 6) {
      return setError(t('auth.passwordTooShort'));
    }

    try {
      setLoading(true);
      const res = await resetPassword({ token, email, newPassword });
      setMessage(res.message || t('auth.passwordResetSuccess'));
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.message || t('auth.resetPasswordFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 lg:bg-white ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Left Side with #242021 Background - Desktop Only */}
      <div className={`hidden lg:block fixed top-0 bottom-0 w-1/2 bg-[#242021] overflow-hidden ${isRTL ? 'right-0' : 'left-0'}`}>
        {/* Animated Background Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ffd17a]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ffd17a]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#ffd17a]/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Floating Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[15%] w-3 h-3 bg-[#ffd17a]/40 rounded-full animate-float" />
          <div className="absolute top-40 left-[30%] w-4 h-4 bg-[#ffd17a]/30 rounded-full animate-float-delayed" />
          <div className="absolute bottom-32 left-[20%] w-3 h-3 bg-[#ffd17a]/50 rounded-full animate-float-slow" />
          <div className="absolute bottom-48 left-[40%] w-4 h-4 bg-[#ffd17a]/35 rounded-full animate-float" />
          <div className="absolute top-1/3 left-[25%] w-3 h-3 bg-[#ffd17a]/45 rounded-full animate-float-delayed" />
          <div className="absolute top-1/4 left-[50%] w-2 h-2 bg-[#ffd17a]/60 rounded-full animate-float-slow" />
          <div className="absolute bottom-1/3 left-[35%] w-3 h-3 bg-[#ffd17a]/40 rounded-full animate-float" />
          <div className="absolute top-2/3 left-[45%] w-2 h-2 bg-[#ffd17a]/55 rounded-full animate-float-delayed" />
        </div>

        {/* Content for Left Side */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-12">
          <div className="text-center">
            {/* Large Logo with Glow */}
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a]/60 rounded-3xl blur-2xl opacity-40 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-[#ffd17a] via-[#ffd17a]/95 to-[#ffd17a]/90 rounded-3xl flex items-center justify-center shadow-2xl">
                <img 
                  src="/CreativeMarkFavicon.png" 
                  alt="CreativeMark Logo" 
                  className="w-16 h-16 object-contain drop-shadow-lg"
                />
              </div>
            </div>

            <h1 className="text-5xl font-black text-white mb-6 tracking-tight">
              {t('auth.resetPasswordTitle')}
            </h1>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-[#ffd17a] to-transparent rounded-full mb-6" />
            <p className="text-gray-300 text-lg max-w-md">
              {t('auth.resetPasswordSubtitle')}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold mb-2 text-[#ffd17a]">🔐</div>
                <div className='text-sm text-white/80'>{t('auth.secureProcess')}</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold mb-2 text-[#ffd17a]">✅</div>
                <div className='text-sm text-white/80'>{t('auth.quickReset')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Background Only */}
      <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ffd17a]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#242021]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#ffd17a]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Mobile Floating Shapes Only */}
      <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-2 h-2 bg-[#ffd17a] rounded-full animate-float" />
        <div className="absolute top-40 right-[15%] w-3 h-3 bg-[#242021]/20 rounded-full animate-float-delayed" />
        <div className="absolute bottom-32 left-[20%] w-2 h-2 bg-[#ffd17a]/60 rounded-full animate-float-slow" />
        <div className="absolute bottom-48 right-[25%] w-3 h-3 bg-[#242021]/30 rounded-full animate-float" />
        <div className="absolute top-1/3 right-[40%] w-2 h-2 bg-[#ffd17a]/40 rounded-full animate-float-delayed" />
      </div>

      {/* Main Content */}
      <div className={`relative z-10 min-h-screen flex items-center justify-center px-4 py-8 lg:px-12 xl:px-20 ${isRTL ? 'lg:mr-[50%]' : 'lg:ml-[50%]'}`}>
        <div className="w-full max-w-md">
          {/* Reset Password Card with Glassmorphism */}
          <div className="md:bg-white/60 md:backdrop-blur-xl md:rounded-3xl md:border md:border-white/50 md:shadow-2xl p-6 sm:p-8 lg:p-10 md:hover:shadow-3xl transition-all duration-500">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              {/* Logo with Glow Effect */}
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a]/60 rounded-2xl blur-xl opacity-60 animate-pulse" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-[#ffd17a] via-[#ffd17a]/95 to-[#ffd17a]/90 rounded-2xl flex items-center justify-center shadow-xl backdrop-blur-sm border border-white/20">
                  <img 
                    src="/CreativeMarkFavicon.png" 
                    alt="CreativeMark Logo" 
                    className="w-10 h-10 object-contain drop-shadow-lg"
                  />
                </div>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 tracking-tight">{t('auth.resetPassword')}</h2>
              <div className="h-1 w-16 mx-auto bg-gradient-to-r from-transparent via-[#ffd17a] to-transparent rounded-full mb-3" />
              <p className="text-gray-600 text-sm sm:text-base">{t('auth.enterNewPassword')}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl animate-shake">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-green-800">{message}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 sm:space-y-6">
                {/* New Password Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('auth.newPassword')} *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder={t('auth.enterNewPassword')}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md text-sm sm:text-base pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#242021] transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('auth.confirmPassword')} *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder={t('auth.confirmNewPassword')}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md text-sm sm:text-base pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#242021] transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button with Gradient Effect */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative overflow-hidden w-full py-4 text-base font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 ${
                    loading
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-gradient-to-br from-[#242021] to-[#2a2422] text-white hover:shadow-2xl"
                  }`}
                >
                  {!loading && (
                    <span className="absolute inset-0 bg-gradient-to-r from-[#ffd17a]/0 via-[#ffd17a]/20 to-[#ffd17a]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  )}
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="relative">{t('auth.resettingPassword')}</span>
                    </>
                  ) : (
                    <>
                      <span className="relative">{t('auth.resetPasswordButton')}</span>
                      <svg className="w-5 h-5 relative group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer Links */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200/50">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  {t('auth.rememberPassword')}{" "}
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="group font-semibold text-[#242021] hover:text-[#ffd17a] transition-all duration-200 inline-flex items-center gap-2"
                  >
                    <span>{t('auth.signIn')}</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-25px) translateX(-10px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
