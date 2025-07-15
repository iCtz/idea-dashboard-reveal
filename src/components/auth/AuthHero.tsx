
"use client";

import { Lightbulb, Users, BarChart3, Zap } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export const AuthPageHero = () => {
  const { t, isRTL } = useLanguage();

  return (
    <div className={`space-y-6 text-gray-800 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="space-y-4">
        <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
          <div className="p-2 bg-you-accent rounded-xl border border-you-accent">
            <Zap className="h-8 w-8 text-you-purple" />
          </div>
          <h1 className="text-4xl font-bold font-poppins text-gray-900">
            {t('auth', 'app_title')}
          </h1>
        </div>
        <p className="text-xl text-gray-600 font-light">
          {t('auth', 'app_description')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className={`flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm ${isRTL ? 'space-x-reverse' : ''}`}>
          <div className="p-2 bg-you-orange rounded-lg">
            <Lightbulb className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{t('auth', 'feature_submit_title')}</h3>
            <p className="text-sm text-gray-600">{t('auth', 'feature_submit_desc')}</p>
          </div>
        </div>

        <div className={`flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm ${isRTL ? 'space-x-reverse' : ''}`}>
          <div className="p-2 bg-you-green rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{t('auth', 'feature_evaluation_title')}</h3>
            <p className="text-sm text-gray-600">{t('auth', 'feature_evaluation_desc')}</p>
          </div>
        </div>

        <div className={`flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm ${isRTL ? 'space-x-reverse' : ''}`}>
          <div className="p-2 bg-you-blue rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{t('auth', 'feature_analytics_title')}</h3>
            <p className="text-sm text-gray-600">{t('auth', 'feature_analytics_desc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
