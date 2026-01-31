"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { locales, defaultLocale, localeNames, isRTL, getDirection } from './config';

const TranslationContext = createContext();

export function TranslationProvider({ children }) {
  const [locale, setLocale] = useState(defaultLocale);
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  // Load translations when locale changes
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/locales/${locale}/common.json`);
        
        if (response.ok) {
          const data = await response.json();
          setTranslations(data);
        } else {
          console.error(`Failed to load translations for locale: ${locale}`);
          // Fallback to default locale if current locale fails
          if (locale !== defaultLocale) {
            const fallbackResponse = await fetch(`/locales/${defaultLocale}/common.json`);
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              setTranslations(fallbackData);
            }
          }
        }
      } catch (error) {
        console.error('Error loading translations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [locale]);

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale && locales.includes(savedLocale)) {
      setLocale(savedLocale);
    }
  }, []);

  // Save locale to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('locale', locale);
    // Update document direction and language
    document.documentElement.dir = getDirection(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const changeLocale = (newLocale) => {
    if (locales.includes(newLocale)) {
      setLocale(newLocale);
    }
  };

  const t = (key, params = {}) => {
    if (loading || Object.keys(translations).length === 0) {
      console.log('Translations not loaded yet, returning key:', key);
      return key;
    }
    
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`, { translations, keys });
        return key; // Return the key if translation not found
      }
    }
    
    // Ensure we always return a string
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string for key: ${key}`, { value, type: typeof value });
      return key; // Return the key if value is not a string
    }
    
    // Handle parameter replacement
    if (Object.keys(params).length > 0) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param] || match;
      });
    }
    
    return value;
  };

  const value = {
    locale,
    setLocale: changeLocale,
    locales,
    localeNames,
    isRTL: isRTL(locale),
    direction: getDirection(locale),
    t,
    loading
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
