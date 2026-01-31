"use client";

import { useTranslation } from '../i18n/TranslationContext';

export default function TranslationTest() {
  const { t, locale, isRTL, loading } = useTranslation();

  if (loading) {
    return <div>Loading translations...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Translation Test</h3>
      <p><strong>Current Locale:</strong> {locale}</p>
      <p><strong>Is RTL:</strong> {isRTL ? 'Yes' : 'No'}</p>
      <p><strong>Dashboard:</strong> {t('navigation.dashboard')}</p>
      <p><strong>Add User:</strong> {t('navigation.addUser')}</p>
      <p><strong>Forms Add New User:</strong> {t('forms.addNewUser')}</p>
      <p><strong>Buttons Cancel:</strong> {t('buttons.cancel')}</p>
    </div>
  );
}
