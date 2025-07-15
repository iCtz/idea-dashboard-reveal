
"use client"

import React, { createContext } from 'react';
import { Language, Translation } from "./LanguageProvider";

interface LanguageContextType {
	language: Language;
	setLanguage: (lang: Language) => void;
	translations: Record<string, Record<string, Translation>>;
	t: (interfaceName: string, key: string) => string;
	isRTL: boolean;
	loading: boolean;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
