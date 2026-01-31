"use client";

import React from 'react';

const LoadingSpinner = ({ 
  size = 'large', 
  text = 'Loading...', 
  showText = true,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Modern Spinning Ring */}
      <div className="relative">
        {/* Outer Ring */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-emerald-200 animate-spin`} 
             style={{ 
               borderTopColor: 'transparent',
               borderRightColor: 'transparent',
               borderBottomColor: 'transparent',
               animation: 'spin 1s linear infinite'
             }}>
        </div>
        
        {/* Inner Ring */}
        <div className={`absolute top-1 left-1 ${sizeClasses[size] === 'w-12 h-12' ? 'w-10 h-10' : 
                        sizeClasses[size] === 'w-8 h-8' ? 'w-6 h-6' : 
                        sizeClasses[size] === 'w-6 h-6' ? 'w-4 h-4' : 'w-14 h-14'} 
                        rounded-full border-2 border-emerald-400 animate-spin`}
             style={{ 
               borderTopColor: 'transparent',
               borderRightColor: 'transparent',
               borderBottomColor: 'transparent',
               animation: 'spin 1.5s linear infinite reverse'
             }}>
        </div>
        
        {/* Center Dot */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        ${sizeClasses[size] === 'w-12 h-12' ? 'w-3 h-3' : 
                          sizeClasses[size] === 'w-8 h-8' ? 'w-2 h-2' : 
                          sizeClasses[size] === 'w-6 h-6' ? 'w-1.5 h-1.5' : 'w-4 h-4'} 
                        bg-emerald-600 rounded-full animate-pulse`}>
        </div>
      </div>

      {/* Loading Text */}
      {showText && (
        <div className="text-center">
          <p className={`${textSizeClasses[size]} font-semibold text-emerald-700 animate-pulse`}>
            {text}
          </p>
          <div className="flex justify-center space-x-1 mt-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Full Page Loading Component
export const FullPageLoading = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xlarge" text={text} />
        <div className="mt-8">
          <div className="w-64 h-1 bg-emerald-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inline Loading Component
export const InlineLoading = ({ text = 'Loading...', size = 'medium' }) => {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size={size} text={text} />
    </div>
  );
};

// Button Loading Component
export const ButtonLoading = ({ size = 'small' }) => {
  return (
    <div className="flex items-center justify-center">
      <LoadingSpinner size={size} showText={false} />
    </div>
  );
};

// Card Loading Component
export const CardLoading = ({ text = 'Loading...' }) => {
  return (
    <div className="bg-white rounded-2xl border border-emerald-200 shadow-lg p-8">
      <LoadingSpinner size="large" text={text} />
    </div>
  );
};

export default LoadingSpinner;

