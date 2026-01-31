"use client";

import { forwardRef } from 'react';

const Section = forwardRef(({ 
  title, 
  subtitle,
  icon: Icon, 
  color = 'gray',
  children, 
  className = '',
  headerClassName = '',
  contentClassName = '',
  ...props 
}, ref) => {
  const colorClasses = {
    blue: 'from-blue-50 to-indigo-50 border-blue-200/50',
    purple: 'from-purple-50 to-pink-50 border-purple-200/50',
    green: 'from-green-50 to-emerald-50 border-green-200/50',
    orange: 'from-orange-50 to-yellow-50 border-orange-200/50',
    red: 'from-red-50 to-pink-50 border-red-200/50',
    emerald: 'from-emerald-50 to-green-50 border-emerald-200/50',
    indigo: 'from-indigo-50 to-purple-50 border-indigo-200/50',
    amber: 'from-amber-50 to-yellow-50 border-amber-200/50',
    gray: 'from-gray-50 to-gray-100 border-gray-200/50'
  };

  const iconColorClasses = {
    blue: 'bg-[#242021] text-white',
    purple: 'bg-[#242021] text-white',
    green: 'bg-[#242021] text-white',
    orange: 'bg-[#242021] text-white',
    red: 'bg-[#242021] text-white',
    emerald: 'bg-[#242021] text-white',
    indigo: 'bg-[#242021] text-white',
    amber: 'bg-[#242021] text-white',
    gray: 'bg-[#242021] text-white'
  };

  return (
    <div 
      ref={ref}
      className={`bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group ${className}`}
      {...props}
    >
      {(title || Icon) && (
        <div className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-r from-[#ffd17a]/10 to-[#ffd17a]/20 border-b border-[#ffd17a]/20 ${headerClassName}`}>
          <div className="flex items-center space-x-3 sm:space-x-4">
            {Icon && (
              <div className={`p-2 sm:p-3 rounded-lg ${iconColorClasses[color]} group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            )}
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{title}</h2>
              {subtitle && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className={`p-4 sm:p-6 lg:p-8 ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
});

Section.displayName = 'Section';

export default Section;
