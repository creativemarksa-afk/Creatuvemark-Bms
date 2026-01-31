"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmail, sendVerificationEmail } from "../../services/auth";
import { useTranslation } from "../../i18n/TranslationContext";

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic';

function VerifyEmailContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client side after mounting
    if (!mounted) return;
    
    // Safe check for SSR
    try {
      if (!searchParams) return;
      
      const token = searchParams.get("token");
    
      if (!token) {
        setStatus("error");
        setMessage(t('auth.invalidVerificationLink'));
        return;
      }
    
      const handleVerification = async () => {
        try {
          const res = await verifyEmail(token);
          
          if (res.success) {
            setStatus("success");
            
            // Check if email was already verified
            if (res.alreadyVerified) {
              setMessage(res.message || t('auth.emailAlreadyVerified'));
            } else {
              setMessage(res.message || t('auth.emailVerifiedSuccess'));
            }
            
            // Redirect to login page after 3 seconds
            setTimeout(() => router.push("/?verified=true"), 3000);
          } else {
            setStatus("error");
            setMessage(res.message || t('auth.verificationFailedOrExpired'));
          }
        } catch (err) {
          console.error("Email verification error:", err);
          setStatus("error");
          
          // Better error message handling
          const errorMessage = err.response?.data?.message || err.message || t('auth.verificationFailedOrExpired');
          setMessage(errorMessage);
        }
      };
    
      handleVerification();
    } catch (error) {
      console.error("Error in verification useEffect:", error);
      setStatus("error");
      setMessage(t('auth.verificationFailedOrExpired'));
    }
  }, [searchParams, router, t, mounted]);
  
 

  const handleResendEmail = async () => {
    if (!email) {
      setMessage(t('auth.enterYourEmail'));
      return;
    }

    setResending(true);
    try {
      const response = await sendVerificationEmail(email);
      setMessage(response.message || t('auth.verificationEmailSent'));
      setStatus("success");
    } catch (error) {
      console.error("Resend email error:", error);
      setMessage(error.message || t('auth.verificationFailedOrExpired'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/60 p-8 sm:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-br from-[#242021] to-[#2a2422] rounded-2xl shadow-xl mx-auto">
              <img
                src="/CreativeMarkFavicon.png"
                alt="CreativeMark Logo"
                className="w-8 h-8 object-contain"
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/32x32/242021/ffd17a?text=CM"; }}
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {status === "verifying" && t('auth.verifyingEmail')}
              {status === "success" && t('auth.emailVerified')}
              {status === "error" && t('auth.verificationFailed')}
            </h2>
          </div>

          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {status === "verifying" && (
              <div className="w-20 h-20 border-4 border-[#ffd17a] border-t-transparent rounded-full animate-spin"></div>
            )}
            {status === "success" && (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === "error" && (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-scale-in">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="text-center mb-8">
            <p className={`text-base ${
              status === "success" ? "text-green-800" : 
              status === "error" ? "text-red-800" : 
              "text-gray-600"
            }`}>
              {message}
            </p>
            
            {status === "success" && (
              <p className="text-sm text-gray-500 mt-4">
                {t('auth.redirectingToLogin')}
              </p>
            )}
          </div>

          {/* Actions */}
          {status === "error" && (
            <div className="space-y-4">
              {/* Email Input for Resend */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('auth.emailAddress')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.enterYourEmail')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 bg-white text-sm"
                />
              </div>

              <button
                onClick={handleResendEmail}
                disabled={resending || !email}
                className={`w-full py-3 font-bold rounded-xl transition-all duration-200 ${
                  resending || !email
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-[#242021] text-white hover:bg-[#242021]/90"
                }`}
              >
                {resending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('auth.sending')}</span>
                  </div>
                ) : (
                  t('auth.resendVerificationEmail')
                )}
              </button>

              <button
                onClick={() => router.push("/")}
                className="w-full py-3 font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
              >
                {t('auth.backToLogin')}
              </button>
            </div>
          )}

          {status === "verifying" && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {t('auth.pleaseWaitVerifying')}
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <button
                onClick={() => router.push("/")}
                className="w-full py-3 font-bold text-white bg-[#242021] rounded-xl hover:bg-[#242021]/90 transition-all duration-200"
              >
                {t('auth.goToLogin')}
              </button>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('auth.needHelp')}{" "}
            <a href="mailto:support@creativemark.com" className="font-semibold text-[#242021] hover:underline">
              {t('auth.contactSupport')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#ffd17a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
