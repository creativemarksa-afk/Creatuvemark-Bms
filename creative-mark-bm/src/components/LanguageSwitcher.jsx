"use client";

import { useTranslation } from '../i18n/TranslationContext';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';

export default function LanguageSwitcher() {
  const { locale, setLocale, locales, localeNames, isRTL } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (newLocale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-2 md:px-3 py-2 text-[#ffd17a] hover:text-[#242021] hover:bg-[#ffd17a] rounded-lg transition-colors duration-200"
        aria-label="Change language"
      >
        <FaGlobe className="text-sm" />
        <span className="text-xs md:text-sm font-medium">
          {localeNames[locale]}
        </span>
        <FaChevronDown 
          className={`text-xs transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-36 bg-[#ffd17a] rounded-lg shadow-lg z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLanguageChange(loc)}
              className={`w-full text-left px-4 py-2 text-xs md:text-sm hover:bg-gray-100 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                locale === loc 
                  ? 'bg-[#242021] text-[#ffd17a] font-medium' 
                  : 'text-[#242021]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{localeNames[loc]}</span>
                {locale === loc && (
                  <span className="text-[#ffd17a]">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
