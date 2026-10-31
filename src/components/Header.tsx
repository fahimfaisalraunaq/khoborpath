/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CONFIG } from '../config';
import { Flame, Moon, Sun, Monitor, Download, Globe } from 'lucide-react';
import { Language, ThemeMode } from '../types';
import { TRANSLATIONS } from '../lib/translations';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  streakDays: number;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  streakDays,
  onNavigateHome,
}) => {
  const t = TRANSLATIONS[language];
  const { isInstallable, install } = usePWAInstall();

  const toggleTheme = () => {
    if (theme === 'light') onThemeChange('dark');
    else if (theme === 'dark') onThemeChange('system');
    else onThemeChange('light');
  };

  return (
    <header className="pt-safe sticky top-0 z-30 w-full border-b border-stone-200/80 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 sm:gap-3 min-w-0 shrink text-left focus:outline-none focus:ring-2 focus:ring-[#006A4E] rounded-xl p-1 -ml-1 transition group"
          aria-label="Khoborpath Home"
        >
          <img
            src="/logo.svg"
            alt="Khoborpath Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl shadow-sm group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg sm:text-xl tracking-tight truncate text-stone-900 dark:text-stone-50">
                {t.appName}
              </span>
              <span className="hidden sm:inline text-xs px-1.5 py-0.5 rounded-full font-semibold bg-[#006A4E]/10 text-[#006A4E] dark:bg-emerald-500/20 dark:text-emerald-300">
                BCS
              </span>
              {CONFIG.IS_BETA && (
                <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-400/20 text-amber-700 dark:text-amber-300">
                  BETA
                </span>
              )}
            </div>
            <p className="hidden md:block text-xs text-stone-500 dark:text-stone-400 font-medium">
              {t.tagline}
            </p>
          </div>
        </button>

        {/* Right Action Bar */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Daily Streak Indicator */}
          <div
            title={`${streakDays} days streak`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{streakDays}</span>
            <span className="hidden sm:inline font-normal text-stone-600 dark:text-stone-400">
              {language === 'bn' ? 'দিন' : 'days'}
            </span>
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(language === 'en' ? 'bn' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 transition"
            aria-label={`Switch language to ${language === 'en' ? 'Bengali' : 'English'}`}
          >
            <Globe className="hidden min-[380px]:block w-3.5 h-3.5 text-[#006A4E] dark:text-emerald-400" />
            <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="hidden min-[380px]:block p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 transition"
            title={`Current theme: ${theme}. Click to change`}
            aria-label="Toggle theme mode"
          >
            {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
            {theme === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
            {theme === 'system' && <Monitor className="w-4 h-4 text-stone-500" />}
          </button>

          {/* PWA Install Button if available */}
          {isInstallable && (
            <button
              onClick={install}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#006A4E] text-white hover:bg-[#00543e] transition shadow-sm"
              aria-label="Install App"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ইনস্টল' : 'Install'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
