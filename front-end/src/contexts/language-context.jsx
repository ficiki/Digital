import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resources from '../i18n/resources'; // Import resources from the dedicated file

// Initialize i18n
const storedLanguage = localStorage.getItem('digiba-language') || 'id';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: storedLanguage, // Use language from localStorage or default to 'id'
    fallbackLng: 'id',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false,
    }
  });

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const changeLanguage = async (lng) => {
    try {
      await i18n.changeLanguage(lng);
      setCurrentLanguage(lng);
      localStorage.setItem('digiba-language', lng);
      document.documentElement.lang = lng;
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  useEffect(() => {
    // This useEffect is now mostly for ensuring document.documentElement.lang is set
    // as i18n is initialized with the correct language from the start.
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const value = {
    currentLanguage,
    changeLanguage,
    t: i18n.t,
    i18n
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default i18n;