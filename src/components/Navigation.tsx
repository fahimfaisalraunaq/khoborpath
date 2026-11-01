/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Newspaper, Sparkles, Bookmark, HelpCircle, BarChart3, Settings } from 'lucide-react';
import { Language, TabType } from '../types';
import { TRANSLATIONS } from '../lib/translations';

interface NavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  language: Language;
  savedCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  language,
  savedCount,
}) => {
  const t = TRANSLATIONS[language];

  const navItems = [
    { id: 'feed' as TabType, label: t.tabs.feed, icon: Newspaper },
    { id: 'digest' as TabType, label: t.tabs.digest, icon: Sparkles },
    { id: 'saved' as TabType, label: t.tabs.saved, icon: Bookmark, badge: savedCount },
    { id: 'progress' as TabType, label: t.tabs.progress, icon: BarChart3 },
    { id: 'settings' as TabType, label: t.tabs.settings, icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-stone-200/80 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition group ${
                  isActive
                    ? 'bg-[#006A4E] text-white shadow-sm shadow-[#006A4E]/20'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-stone-500 dark:text-stone-400 group-hover:text-[#006A4E]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop Quick Study Tip Card */}
        <div className="mt-auto pt-6">
          <div className="p-3.5 rounded-2xl bg-[#006A4E]/5 dark:bg-emerald-950/20 border border-[#006A4E]/15 dark:border-emerald-800/30 text-stone-700 dark:text-stone-300">
            <div className="flex items-center gap-2 text-xs font-bold text-[#006A4E] dark:text-emerald-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'বিসিএস প্রস্তুতি টিপ' : 'BCS Study Tip'}</span>
            </div>
            <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">
              {language === 'bn'
                ? 'সম্পাদকীয় পড়ার সময় গুরুত্বপূর্ণ পরিসংখ্যান ও সাংবিধানিক ধারাগুলো নোট করে রাখুন।'
                : 'Read editorials critically. Focus on constitutional articles, economic indicators, and policy shifts.'}
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 pb-safe shadow-lg"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex flex-col items-center justify-center min-h-[44px] transition py-1 ${
                  isActive
                    ? 'text-[#006A4E] dark:text-emerald-400 font-bold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center text-[10px] font-bold rounded-full bg-[#F42A41] text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px] leading-tight">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#006A4E] dark:bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
