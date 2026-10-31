/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  Flame,
  CheckCircle2,
  Award,
  BarChart2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Article, Category, Language, QuizResult, UserStreak } from '../types';
import { ALL_CATEGORIES } from '../config';
import { CATEGORY_NAMES_BN, TRANSLATIONS } from '../lib/translations';

interface ProgressScreenProps {
  articles: Article[];
  readArticleIds: string[];
  quizScores: Record<string, QuizResult>;
  userStreak: UserStreak;
  language: Language;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  articles,
  readArticleIds,
  quizScores,
  userStreak,
  language,
}) => {
  const t = TRANSLATIONS[language];

  // Articles read
  const readArticles = useMemo(() => {
    return articles.filter((a) => readArticleIds.includes(a.id));
  }, [articles, readArticleIds]);

  // Quiz statistics
  const quizResultsList = Object.values(quizScores);
  const quizAverage = useMemo(() => {
    if (quizResultsList.length === 0) return 0;
    const sum = quizResultsList.reduce((acc, curr) => acc + (curr.score / curr.total) * 100, 0);
    return Math.round(sum / quizResultsList.length);
  }, [quizResultsList]);

  // Category counts for read articles
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_CATEGORIES.forEach((cat) => {
      counts[cat] = 0;
    });

    readArticles.forEach((art) => {
      (art.categories || []).forEach((cat) => {
        if (counts[cat] !== undefined) {
          counts[cat]++;
        } else {
          counts[cat] = 1;
        }
      });
    });

    const maxCount = Math.max(1, ...Object.values(counts));
    return { counts, maxCount };
  }, [readArticles]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 lg:pb-16">
      {/* Title */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#006A4E]/10 text-[#006A4E] dark:text-emerald-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            {t.progress.title}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
          {t.progress.subtitle}
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Streak Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              {t.progress.streakTitle}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Flame className="w-5 h-5 fill-amber-500 animate-pulse" />
            </div>
          </div>
          <div className="text-3xl font-black text-stone-900 dark:text-stone-100">
            {t.progress.streakDays.replace('{days}', String(userStreak.currentStreak))}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {t.progress.streakSub}
          </p>
        </div>

        {/* Read Articles Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              {t.progress.weeklyReadTitle}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-stone-900 dark:text-stone-100">
            {readArticles.length}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {t.progress.weeklyTarget.replace('{count}', String(readArticles.length))}
          </p>
        </div>

        {/* Quiz Avg Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              {t.progress.quizAvgTitle}
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-stone-900 dark:text-stone-100">
            {quizAverage}%
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {t.progress.quizAvgSub.replace('{count}', String(quizResultsList.length))}
          </p>
        </div>
      </div>

      {/* Category Reading Distribution Chart */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#006A4E]/10 text-[#006A4E] dark:text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
              {t.progress.coverageChartTitle}
            </h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {t.progress.coverageChartSubtitle}
          </p>
        </div>

        {/* Lightweight SVG Bar Chart & Distribution list */}
        <div className="space-y-4 pt-2">
          {ALL_CATEGORIES.map((cat) => {
            const count = categoryStats.counts[cat] || 0;
            const pct = Math.round((count / categoryStats.maxCount) * 100);
            const catName = language === 'bn' ? CATEGORY_NAMES_BN[cat] || cat : cat;

            return (
              <div key={cat} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                    {catName}
                  </span>
                  <span className="font-bold text-stone-500 dark:text-stone-400">
                    {count} {language === 'bn' ? 'টি নিবন্ধ' : 'articles'}
                  </span>
                </div>

                {/* SVG/CSS Bar */}
                <div className="w-full h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden relative">
                  <div
                    className="h-full rounded-full bg-[#006A4E] dark:bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.max(count > 0 ? 8 : 0, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {readArticles.length === 0 && (
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 text-center text-xs text-stone-500 dark:text-stone-400">
            {t.progress.noReadData}
          </div>
        )}
      </div>
    </div>
  );
};
