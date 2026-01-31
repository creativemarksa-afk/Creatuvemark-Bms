export const locales = ['en', 'ar'];
export const defaultLocale = 'en';

export const localeNames = {
  en: 'English',
  ar: 'العربية'
};

export const rtlLocales = ['ar'];

export function isRTL(locale) {
  return rtlLocales.includes(locale);
}

export function getDirection(locale) {
  return isRTL(locale) ? 'rtl' : 'ltr';
}
