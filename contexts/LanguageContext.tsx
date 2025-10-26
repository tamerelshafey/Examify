import React, { createContext, useState, useContext } from 'react';
import { Language } from '../types';

export const LanguageContext = createContext<{ lang: Language; toggleLang: () => void; } | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('ar');
  
  const toggleLang = () => {
    setLang(prevLang => prevLang === 'en' ? 'ar' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
