
"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { LanguageContext } from './LanguageContext';

export type Translation = Tables<"translations">;
export type Language = 'en' | 'ar';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state without accessing localStorage. Default to 'ar' or your preferred default.
  const [language, setLanguage] = useState<Language>('ar');
  const [translations, setTranslations] = useState<Record<string, Record<string, Translation>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    const storedLanguage = localStorage.getItem('language') as Language;
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
    fetchTranslations();
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    // Update document direction and language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const fetchTranslations = async () => {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*');

      if (error) throw error;

      // Group translations by interface_name and position_key
      const grouped = data.reduce((acc, translation) => {
        if (!acc[translation.interface_name]) {
          acc[translation.interface_name] = {};
        }
        acc[translation.interface_name][translation.position_key] = translation;
        return acc;
      }, {} as Record<string, Record<string, Translation>>);

      setTranslations(grouped);
    } catch (error) {
      console.error('Error fetching translations:', error);
    } finally {
      setLoading(false);
    }
  };

  const t = useCallback((interfaceName: string, key: string): string => {
    const translation = translations[interfaceName]?.[key];
    if (!translation) {
      console.warn(`Translation not found: ${interfaceName}.${key}`);
      return key;
    }
    return language === 'ar' ? translation.arabic_text : translation.english_text;
  }, [translations, language]);

  const isRTL = language === 'ar';

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    translations,
    t,
    isRTL,
    loading
  }), [language, setLanguage, translations, t, isRTL, loading]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};


