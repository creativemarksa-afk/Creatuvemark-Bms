"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { login, sendVerificationEmail } from "../services/auth";
import Image from "next/image";
import { useTranslation } from "../i18n/TranslationContext";

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic';

function LoginForm() {
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "client" // Default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check if user just verified their email - only on client side
    if (!mounted) return;
    
    try {
      if (searchParams) {
        const verified = searchParams.get("verified");
        if (verified === "true") {
          setSuccess(t('auth.emailVerifiedSuccess'));
        }
      }
    } catch (error) {
      console.error("Error reading search params:", error);
    }
  }, [searchParams, t, mounted]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
    if (needsVerification) setNeedsVerification(false);
  }

  async function handleResendVerification() {
    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }

    setResendingEmail(true);
    setError("");
    setSuccess("");

    try {
      const response = await sendVerificationEmail(formData.email);
      setSuccess(response.message || t('auth.verificationEmailSent'));
      setNeedsVerification(false);
    } catch (error) {
      console.error("Resend verification error:", error);
      setError(error.message || t('auth.verificationFailedOrExpired'));
    } finally {
      setResendingEmail(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Call backend login API
      console.log("Frontend: Attempting login with:", formData);
      const response = await login({
        email: formData.email,
        password: formData.password
      });
      
      console.log("Frontend: Login response received:", response);
      
      if (response.success) {
        console.log("Frontend: Login successful, user data:", response.user);
        console.log("Frontend: Cookies after login:", document.cookie);
        
        // Update AuthContext with user data
        updateUser(response.user);
        
        // Navigate to appropriate page
        console.log("Frontend: Navigating to role:", response.user.role);
        switch (response.user.role) {
          case 'employee':
            console.log("Frontend: Redirecting to /employee");
            router.push('/employee');
            break;
          case 'admin':
            console.log("Frontend: Redirecting to /admin");
            router.push('/admin');
            break;
          case 'client':
          default:
            console.log("Frontend: Redirecting to /client");
            router.push('/client');
            break;
        }
      } else {
        setError(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = error.message || "Login failed. Please try again.";
      
      // Check if it's an email verification error
      if (errorMsg.includes("verify your email") || errorMsg.includes("verify")) {
        setNeedsVerification(true);
        setError(errorMsg);
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }

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
              <div className="relative w-32 h-32 bg-gradient-to-br from-[#ffd17a] via-[#ffd17a]/95 to-[#ffd17a]/90 rounded-full flex items-center justify-center shadow-2xl">
                <Image
                  src="/CreativeMarkFavicon.png"
                  alt="CreativeMark Logo"
                  width={120}
                  height={120}
                  className="object-contain drop-shadow-lg"
                />
              </div>
            </div>

            <h1 className="text-5xl font-black text-white mb-6 tracking-tight">
              CreativeMark
            </h1>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-[#ffd17a] to-transparent rounded-full mb-6" />
            <p className="text-gray-300 text-lg max-w-md">
              {mounted && t('auth.welcomeToCreativeMark')}
            </p>
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
        <div className={`w-full max-w-5xl transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Login Card with Glassmorphism */}
          <div className=" p-6 sm:p-8 lg:p-10 transition-all duration-500">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              {/* Logo with Glow Effect */}
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a]/60 rounded-2xl blur-xl opacity-60 animate-pulse" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-[#ffd17a] via-[#ffd17a]/95 to-[#ffd17a]/90 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-white/20">
                  <Image
                    src="/CreativeMarkFavicon.png"
                    alt="CreativeMark Logo"
                    width={100}
                    height={100}
                    className="object-contain drop-shadow-lg"
                  />
                </div>
              </div>
              
              <h2 className={`text-3xl sm:text-4xl font-black text-gray-900 mb-2 tracking-tight ${isRTL ? 'text-right' : 'text-center'}`}>{t('auth.signIn')}</h2>
              <div className={`h-1 w-16 bg-gradient-to-r from-transparent via-[#ffd17a] to-transparent rounded-full mb-3 ${isRTL ? 'mr-auto' : 'mx-auto'}`} />
              <p className={`text-gray-600 text-sm sm:text-base ${isRTL ? 'text-right' : 'text-center'}`}>{t('auth.welcomeBackSignIn')}</p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-green-800">{success}</span>
                </div>
              </div>
            )}

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

            {/* Resend Verification Button */}
            {needsVerification && formData.email && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-blue-800">{t('auth.didntReceiveEmail')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendingEmail}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {resendingEmail ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {t('auth.sending')}
                      </span>
                    ) : (
                      t('auth.resendEmail')
                    )}
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 sm:space-y-6">
                {/* Email Field */}
                <div className="group">
                  <label className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('auth.emailAddress')} *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder={t('auth.enterEmailAddress')}
                    className={`w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md text-sm sm:text-base ${isRTL ? 'text-right' : 'text-left'}`}
                    dir={isRTL ? 'ltr' : 'ltr'}
                  />
                </div>

                {/* Password Field */}
                <div className="group">
                  <label className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('auth.password')} *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder={t('auth.enterPassword')}
                      className={`w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md text-sm sm:text-base ${isRTL ? 'pr-3 pl-12 text-right' : 'pr-12 text-left'}`}
                      dir={isRTL ? 'ltr' : 'ltr'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#242021] transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
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

                {/* Remember Me & Forgot Password */}
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
                  <label className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    <input
                      type="checkbox"
                      className="w-4 h-4 border-gray-300 rounded focus:ring-[#ffd17a]/20 focus:ring-2"
                      style={{accentColor: '#ffd17a'}}
                    />
                    <span className={`text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>{t('auth.rememberMe')}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => router.push('/forgot-password')}
                    className={`text-sm cursor-pointer cursor-pointer font-semibold text-[#242021] hover:text-[#242021]/80 hover:underline transition-colors ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    {t('auth.forgotPassword')}
                  </button>
                </div>

                {/* Submit Button with Gradient Effect */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative overflow-hidden w-full py-4 text-base font-bold rounded-2xl transition-all cursor-pointer duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 ${
                    isLoading
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-gradient-to-br from-[#242021] to-[#2a2422] text-white hover:shadow-2xl"
                  }`}
                >
                  {!isLoading && (
                    <span className="absolute inset-0 bg-gradient-to-r from-[#ffd17a]/0 via-[#ffd17a]/20 to-[#ffd17a]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  )}
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="relative">{t('auth.signingIn')}</span>
                    </>
                  ) : (
                    <>
                      <span className="relative">{t('auth.signInButton')}</span>
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
              <div className={isRTL ? 'text-right' : 'text-center'}>
                <p className={`text-sm text-gray-600 mb-4 ${isRTL ? 'text-right' : 'text-center'}`}>
                  {t('auth.dontHaveAccount')}{" "}
                  <button
                    type="button"
                    onClick={() => router.push('/register')}
                    className={`group font-semibold text-[#242021] hover:text-[#ffd17a] transition-all duration-200 cursor-pointer inline-flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <span>{t('auth.registerHere')}</span>
                    <svg className={`w-4 h-4 transition-transform ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isRTL ? "M11 7l-5 5m0 0l5 5m-5-5h12" : "M13 7l5 5m0 0l-5 5m5-5H6"} />
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
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#ffd17a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}