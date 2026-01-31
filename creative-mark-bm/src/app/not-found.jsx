"use client";

import { useRouter } from 'next/navigation';
import { useTranslation } from '../i18n/TranslationContext';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function NotFound() {
  const router = useRouter();
  const { t } = useTranslation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Animated Background Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-[#ffd17a]/20 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            transition: 'transform 0.5s ease-out'
          }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#242021]/10 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
            transition: 'transform 0.5s ease-out',
            animationDelay: '1s'
          }}
        />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#ffd17a]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Floating Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-2 h-2 bg-[#ffd17a] rounded-full animate-float" />
        <div className="absolute top-40 right-[15%] w-3 h-3 bg-[#242021]/20 rounded-full animate-float-delayed" />
        <div className="absolute bottom-32 left-[20%] w-2 h-2 bg-[#ffd17a]/60 rounded-full animate-float-slow" />
        <div className="absolute bottom-48 right-[25%] w-3 h-3 bg-[#242021]/30 rounded-full animate-float" />
        <div className="absolute top-1/3 right-[40%] w-2 h-2 bg-[#ffd17a]/40 rounded-full animate-float-delayed" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className={`max-w-2xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* 404 Illustration with Glassmorphism */}
          <div className="mb-8 sm:mb-12">
            <div className="relative inline-block">
              {/* Main 404 Text */}
              <div className="relative">
                <div className="text-[8rem] sm:text-[12rem] md:text-[14rem] lg:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-[#242021]/30 via-[#242021]/20 to-[#242021]/10 select-none leading-none tracking-tighter animate-gradient">
                  404
                </div>
                
                {/* Glowing effect behind text */}
                <div className="absolute inset-0 text-[8rem] sm:text-[12rem] md:text-[14rem] lg:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-[#ffd17a]/40 to-[#ffd17a]/20 select-none leading-none tracking-tighter blur-2xl animate-pulse">
                  404
                </div>
              </div>
              
              {/* Floating Logo with Glassmorphism */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="group relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a]/60 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500 animate-pulse" />
                  
                  {/* Main logo container */}
                  <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br from-[#ffd17a] via-[#ffd17a]/95 to-[#ffd17a]/90 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/20 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 animate-float">
                    <Image 
                      src="/CreativeMarkFavicon.png" 
                      alt="CreativeMark Logo" 
                      width={64}
                      height={64}
                      className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain drop-shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message with Animation */}
          <div className="mb-8 sm:mb-10 space-y-4 px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight tracking-tight animate-slide-up">
              {t('notFound.title') || 'Page Not Found'}
            </h1>
            <div className="h-1 w-20 mx-auto bg-gradient-to-r from-transparent via-[#ffd17a] to-transparent rounded-full animate-slide-up" style={{ animationDelay: '0.1s' }} />
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-lg mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {t('notFound.description') || 'Oops! The page you\'re looking for has wandered off into the digital void. Let\'s get you back on track.'}
            </p>
          </div>

          {/* Action Buttons with Modern Styling */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mb-10 sm:mb-12 px-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => router.back()}
              className="group relative overflow-hidden bg-[#242021] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#ffd17a]/0 via-[#ffd17a]/10 to-[#ffd17a]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="relative">{t('notFound.goBack') || 'Go Back'}</span>
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="group relative overflow-hidden bg-gradient-to-br from-[#ffd17a] to-[#ffd17a]/90 text-[#242021] px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="relative">{t('notFound.goHome') || 'Go Home'}</span>
            </button>
          </div>

          {/* Help Card with Glassmorphism */}
          <div className="mx-4 p-6 sm:p-8 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:bg-white/70 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a]/80 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[#242021]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {t('notFound.needHelp') || 'Need Help?'}
              </h3>
            </div>
            <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
              {t('notFound.helpDescription') || 'If something seems wrong, our support team is here to help you out.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center items-center">
              <button
                onClick={() => router.push('/client/support')}
                className="group text-[#242021] hover:text-[#ffd17a] font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:gap-3"
              >
                <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
                <span>{t('notFound.contactSupport') || 'Contact Support'}</span>
              </button>
              
              <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full" />
              
              <button
                onClick={() => window.location.reload()}
                className="group text-[#242021] hover:text-[#ffd17a] font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:gap-3"
              >
                <svg className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{t('notFound.refreshPage') || 'Refresh Page'}</span>
              </button>
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
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes gradient {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.2; }
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
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        .animate-gradient {
          animation: gradient 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}