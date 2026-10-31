/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Globe,
  Sun,
  Moon,
  Monitor,
  Type,
  Trash2,
  AlertTriangle,
  Check,
  Code2,
  ExternalLink,
  Download,
  Info,
} from 'lucide-react';
import { Language, TextSize, ThemeMode } from '../types';
import { CONFIG } from '../config';
import { TRANSLATIONS } from '../lib/translations';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SettingsScreenProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  textSize: TextSize;
  onTextSizeChange: (size: TextSize) => void;
  onClearAllData: () => void;
  cachedCount: number;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  textSize,
  onTextSizeChange,
  onClearAllData,
  cachedCount,
}) => {
  const t = TRANSLATIONS[language];
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [clearedToast, setClearedToast] = useState<boolean>(false);
  const [showConfigGuide, setShowConfigGuide] = useState<boolean>(false);

  const handleConfirmClear = () => {
    onClearAllData();
    setShowClearConfirm(false);
    setClearedToast(true);
    setTimeout(() => setClearedToast(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 lg:pb-16">
      {/* Title */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#006A4E]/10 text-[#006A4E] dark:text-emerald-400">
            <Settings className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            {t.settings.title}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
          {t.settings.subtitle}
        </p>
      </div>

      {clearedToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{t.settings.clearSuccess}</span>
        </div>
      )}

      {/* Language Preferences */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#006A4E] dark:text-emerald-400" />
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            {t.settings.languageTitle}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            onClick={() => onLanguageChange('en')}
            className={`p-3 rounded-2xl border text-center font-bold text-sm transition ${
              language === 'en'
                ? 'bg-[#006A4E] text-white border-[#006A4E] shadow-sm'
                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
            }`}
          >
            English
          </button>
          <button
            onClick={() => onLanguageChange('bn')}
            className={`p-3 rounded-2xl border text-center font-bold text-sm transition ${
              language === 'bn'
                ? 'bg-[#006A4E] text-white border-[#006A4E] shadow-sm'
                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
            }`}
          >
            বাংলা (Bengali)
          </button>
        </div>
      </div>

      {/* Theme Preferences */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            {t.settings.themeTitle}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-md">
          {[
            { id: 'light' as ThemeMode, label: t.settings.themes.light, icon: Sun },
            { id: 'dark' as ThemeMode, label: t.settings.themes.dark, icon: Moon },
            { id: 'system' as ThemeMode, label: t.settings.themes.system, icon: Monitor },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onThemeChange(item.id)}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 font-semibold text-xs transition ${
                  isSelected
                    ? 'bg-[#006A4E] text-white border-[#006A4E] shadow-sm'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Text Size Preferences */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Type className="w-5 h-5 text-[#006A4E] dark:text-emerald-400" />
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            {t.settings.textSizeTitle}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-md">
          {[
            { id: 'sm' as TextSize, label: t.settings.textSizes.sm, sample: 'Aa (14px)' },
            { id: 'base' as TextSize, label: t.settings.textSizes.base, sample: 'Aa (16px)' },
            { id: 'lg' as TextSize, label: t.settings.textSizes.lg, sample: 'Aa (18px)' },
          ].map((item) => {
            const isSelected = textSize === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTextSizeChange(item.id)}
                className={`p-3 rounded-2xl border text-center transition ${
                  isSelected
                    ? 'bg-[#006A4E] text-white border-[#006A4E] shadow-sm'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                }`}
              >
                <div className="text-sm font-bold">{item.sample}</div>
                <div className="text-[11px] opacity-80 mt-1">{item.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PWA App Installation */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-[#006A4E] dark:text-emerald-400" />
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            {t.settings.installPwaTitle}
          </h2>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {t.settings.installPwaDesc}
        </p>

        {isInstallable && (
          <button
            onClick={install}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#006A4E] text-white hover:bg-[#00543e] transition"
          >
            <Download className="w-4 h-4" />
            <span>{t.settings.installBtn}</span>
          </button>
        )}

        {!isInstalled && !isInstallable && (
          <ol className="text-xs text-stone-600 dark:text-stone-300 list-decimal pl-5 space-y-1">
            {isIOS ? (
              <>
                <li>{language === 'bn' ? 'Safari-তে এই পেজটি খুলুন।' : 'Open this page in Safari.'}</li>
                <li>{language === 'bn' ? 'Share বোতামে চাপুন (তীরসহ বর্গ)।' : 'Tap the Share button (square with an arrow).'}</li>
                <li>{language === 'bn' ? '"Add to Home Screen" বেছে নিন।' : 'Choose "Add to Home Screen", then "Add".'}</li>
              </>
            ) : (
              <>
                <li>{language === 'bn' ? 'Chrome বা Samsung Internet-এ খুলুন।' : 'Open this page in Chrome or Samsung Internet.'}</li>
                <li>{language === 'bn' ? 'ওপরের ⋮ মেনুতে চাপুন।' : 'Tap the ⋮ menu (≡ in Samsung Internet).'}</li>
                <li>{language === 'bn' ? '"Install app" বা "Add to Home screen" বেছে নিন।' : 'Choose "Install app" or "Add to Home screen".'}</li>
              </>
            )}
          </ol>
        )}

        {isInstalled && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-[#006A4E] dark:text-emerald-400">
            <Check className="w-3.5 h-3.5" />
            <span>{t.settings.installedBadge}</span>
          </span>
        )}
      </div>

      {CONFIG.FEEDBACK_URL && (
        <a
          href={CONFIG.FEEDBACK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-5 rounded-3xl bg-amber-400/10 border border-amber-400/40 text-sm font-bold text-amber-800 dark:text-amber-200"
        >
          <span>{language === 'bn' ? 'বেটা টেস্টার? মতামত বা ভুল তথ্য জানান' : 'Beta tester? Send feedback or report wrong info'}</span>
          <span aria-hidden>→</span>
        </a>
      )}

      {/* Data & Developer Guide / README */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#006A4E] dark:text-emerald-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {t.settings.setupHelpTitle}
            </h2>
          </div>
          <button
            onClick={() => setShowConfigGuide(!showConfigGuide)}
            className="text-xs font-semibold text-[#006A4E] dark:text-emerald-400 hover:underline"
          >
            {showConfigGuide ? 'Hide Guide' : 'View Documentation'}
          </button>
        </div>

        <div className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 font-mono text-[11px]">
            <span className="font-semibold text-stone-700 dark:text-stone-300">ARTICLES_URL:</span>
            <span className="truncate max-w-[260px] sm:max-w-md">{CONFIG.ARTICLES_URL}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 font-mono text-[11px]">
            <span className="font-semibold text-stone-700 dark:text-stone-300">AI_PROXY_URL:</span>
            <span className="truncate max-w-[260px] sm:max-w-md">{CONFIG.AI_PROXY_URL || '(Disabled / Using offline generator)'}</span>
          </div>

          <p className="text-[11px] text-stone-500">
            {t.settings.cacheStatus.replace('{count}', String(cachedCount))}
          </p>
        </div>

        {showConfigGuide && (
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3 text-xs leading-relaxed">
            <h3 className="font-bold text-stone-900 dark:text-stone-100">
              How to configure custom endpoints in `src/config.ts`:
            </h3>
            <ol className="list-decimal pl-4 space-y-2 text-stone-700 dark:text-stone-300">
              <li>
                <strong>ARTICLES_URL:</strong> Set this to your raw GitHub file URL or API endpoint serving an array of articles (e.g. `https://raw.githubusercontent.com/username/repo/main/data/articles.json`).
              </li>
              <li>
                <strong>Offline Resilience:</strong> If `ARTICLES_URL` is empty, unreachable, or is a placeholder, Khoborpath automatically renders the 12 comprehensive sample articles offline with zero interruptions.
              </li>
              <li>
                <strong>AI_PROXY_URL (Optional):</strong> Khoborpath sends a POST request with JSON payload containing title, summary, and key_facts, expecting a JSON response formatted as questions: [{'{'} q, options: [4 strings], answerIndex, explanation {'}'}]. If omitted or failing, Khoborpath's smart built-in generator produces 5 questions deterministically.
              </li>
              <li>
                <strong>Security:</strong> Never hardcode API keys in frontend code. Use server-side proxy routes.
              </li>
            </ol>
          </div>
        )}
      </div>

      {/* Clear Local Data */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-[#F42A41]" />
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            {t.settings.clearDataTitle}
          </h2>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {t.settings.clearDataDesc}
        </p>

        <button
          onClick={() => setShowClearConfirm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-red-50 dark:bg-red-950/30 text-[#F42A41] hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50 transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>{t.settings.clearDataButton}</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-red-500/10 text-[#F42A41]">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">
                {t.settings.confirmClearTitle}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {t.settings.confirmClearMessage}
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                {t.settings.cancelBtn}
              </button>
              <button
                onClick={handleConfirmClear}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F42A41] text-white hover:bg-red-700 transition shadow-sm"
              >
                {t.settings.confirmClearBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
