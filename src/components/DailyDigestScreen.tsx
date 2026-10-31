/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  BookOpen,
  Calendar,
  Layers,
} from 'lucide-react';
import { Article, Category, Language } from '../types';
import { CATEGORY_NAMES_BN, TRANSLATIONS } from '../lib/translations';
import { isDateInRange, formatReadableDate } from '../lib/dateUtils';

interface DailyDigestScreenProps {
  articles: Article[];
  language: Language;
  onSelectArticle: (article: Article) => void;
}

export const DailyDigestScreen: React.FC<DailyDigestScreenProps> = ({
  articles,
  language,
  onSelectArticle,
}) => {
  const t = TRANSLATIONS[language];
  const [copied, setCopied] = useState<boolean>(false);

  // Filter for high and medium relevance articles.
  // First check today's articles; if today has fewer than 3, fall back to recent high/medium articles
  const digestArticles = useMemo(() => {
    const todayList = articles.filter(
      (a) =>
        (a.exam_relevance === 'high' || a.exam_relevance === 'medium') &&
        isDateInRange(a.published, 'today')
    );

    if (todayList.length >= 3) {
      return todayList;
    }

    // Include recent 7-day high/medium articles if today's count is small
    const recentList = articles.filter(
      (a) =>
        (a.exam_relevance === 'high' || a.exam_relevance === 'medium') &&
        isDateInRange(a.published, '7days')
    );

    return recentList.length > 0
      ? recentList
      : articles.filter((a) => a.exam_relevance === 'high' || a.exam_relevance === 'medium');
  }, [articles]);

  // Group articles by category
  const groupedByCategory = useMemo(() => {
    const map = new Map<Category, Article[]>();
    digestArticles.forEach((art) => {
      const primaryCat = (art.categories[0] as Category) || 'Bangladesh Affairs';
      if (!map.has(primaryCat)) {
        map.set(primaryCat, []);
      }
      map.get(primaryCat)!.push(art);
    });
    return map;
  }, [digestArticles]);

  // Formats digest as clean plain text for WhatsApp, Telegram, and Study Groups
  const generatePlainTextDigest = (): string => {
    const todayStr = formatReadableDate(new Date().toISOString(), language);
    let output = `🇧🇩 ${t.appName.toUpperCase()} - ${t.digest.title.toUpperCase()}\n`;
    output += `📅 ${todayStr}\n`;
    output += `🎯 ${t.tagline}\n`;
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    groupedByCategory.forEach((arts, cat) => {
      const catLabel = language === 'bn' ? CATEGORY_NAMES_BN[cat] || cat : cat;
      output += `📂 [${catLabel.toUpperCase()}]\n`;

      arts.forEach((a) => {
        const relevanceMark = a.exam_relevance === 'high' ? '⭐ [High BCS Focus]' : '';
        output += `\n• ${a.title} (${a.source}) ${relevanceMark}\n`;
        const summary = a.ai_summary || a.summary;
        if (summary) {
          output += `  Summary: ${summary.slice(0, 160)}...\n`;
        }
        if (a.key_facts && a.key_facts.length > 0) {
          output += `  Key Facts:\n`;
          a.key_facts.slice(0, 2).forEach((f) => {
            output += `   - ${f}\n`;
          });
        }
      });
      output += `\n`;
    });

    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    output += `Study full editorials & take practice quizzes on Khoborpath.\n`;
    return output;
  };

  const handleCopy = async () => {
    try {
      const text = generatePlainTextDigest();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 lg:pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-br from-[#006A4E] to-[#004f3a] text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-xs text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {t.digest.totalArticlesCount.replace('{count}', String(digestArticles.length))}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
            {t.digest.title}
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
            {t.digest.subtitle}
          </p>

          <div className="pt-2 flex items-center gap-3 flex-wrap">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white text-[#006A4E] hover:bg-stone-100 transition shadow-sm"
              aria-label={t.digest.copyDigest}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{t.digest.copiedSuccess}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{t.digest.copyDigest}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Grouped Articles */}
      {digestArticles.length > 0 ? (
        <div className="space-y-6">
          {Array.from(groupedByCategory.entries()).map(([cat, arts]) => {
            const catName = language === 'bn' ? CATEGORY_NAMES_BN[cat] || cat : cat;
            return (
              <div
                key={cat}
                className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-xs space-y-4"
              >
                {/* Category Header */}
                <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                  <div className="p-1.5 rounded-xl bg-[#006A4E]/10 text-[#006A4E] dark:text-emerald-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                    {catName}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-semibold ml-auto">
                    {arts.length}
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-stone-100 dark:divide-stone-800/80">
                  {arts.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => onSelectArticle(article)}
                      className="py-4 first:pt-1 last:pb-1 cursor-pointer group space-y-2 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 -mx-3 px-3 rounded-2xl transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-[#006A4E] dark:text-emerald-400">
                              {article.source}
                            </span>
                            {article.exam_relevance === 'high' && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F42A41]/10 text-[#F42A41]">
                                {t.relevance.high}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#006A4E] dark:group-hover:text-emerald-300 transition-colors">
                            {article.title}
                          </h3>
                        </div>
                        <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-[#006A4E] group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
                      </div>

                      <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                        {article.ai_summary || article.summary}
                      </p>

                      {article.key_facts && article.key_facts.length > 0 && (
                        <div className="pt-1 flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                          <span className="font-medium text-amber-600 dark:text-amber-400">• Fact:</span>
                          <span className="truncate">{article.key_facts[0]}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-3">
          <BookOpen className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
            {t.digest.emptyDigest}
          </h3>
        </div>
      )}
    </div>
  );
};
