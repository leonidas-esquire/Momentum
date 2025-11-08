import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(localStorage.getItem('momentum_language') || 'en');
  const [translations, setTranslations] = useState<{ en: any, current: any }>({ en: null, current: null });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchTranslations = async () => {
      setIsLoaded(false);
      try {
        // Always fetch English for fallback
        const enResponse = await fetch('/locales/en.json');
        if (!enResponse.ok) throw new Error('Failed to load English translations');
        const enData = await enResponse.json();

        let currentLangData = enData;
        if (language !== 'en') {
          try {
            const langResponse = await fetch(`/locales/${language}.json`);
            if (langResponse.ok) {
              currentLangData = await langResponse.json();
            } else {
              console.warn(`Translation file for '${language}' not found. Falling back to English.`);
            }
          } catch (error) {
            console.warn(`Error fetching translation for '${language}'. Falling back to English.`, error);
          }
        }
        setTranslations({ en: enData, current: currentLangData });
      } catch (error) {
        console.error("Could not load translation files.", error);
        setTranslations({ en: {}, current: {} }); // Set empty objects to prevent crashes
      } finally {
        setIsLoaded(true);
      }
    };

    fetchTranslations();
  }, [language]);

  const setLanguage = (lang: string) => {
    localStorage.setItem('momentum_language', lang);
    setLanguageState(lang);
  };

  const t = useCallback((key: string, options?: Record<string, string | number>): string => {
    const keys = key.split('.');
    
    // Check current language translations first
    let result = translations.current;
    for (const k of keys) {
      if (result === undefined) break;
      result = result[k];
    }
    
    // If not found, check English fallback
    if (result === undefined) {
        let fallbackResult = translations.en;
        for (const fk of keys) {
            if (fallbackResult === undefined) break;
            fallbackResult = fallbackResult[fk];
        }
        result = fallbackResult;
    }

    if (result === undefined) {
      return key; // Return the key if not found anywhere
    }

    if (typeof result === 'string' && options) {
      return Object.entries(options).reduce((acc, [key, value]) => {
        return acc.replace(`{{${key}}}`, String(value));
      }, result);
    }

    return result || key;
  }, [translations]);

  // Don't render the app until the initial translations are loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
