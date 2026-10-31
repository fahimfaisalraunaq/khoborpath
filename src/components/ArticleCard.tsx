/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bookmark, CheckCircle2, ChevronRight, Sparkles, Feather } from 'lucide-react';
import { Article, Language } from '../types';
import { CATEGORY_NAMES_BN, TRANSLATIONS } from '../lib/translations';
import { formatRelativeDate } from '../lib/dateUtils';

interface ArticleCardProps {
  article: Article;
  language: Language;
  isBookmarked: boolean;
  isRead: boolean;
  onSelect: (article: Article) => void;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  language,
  isBookmarked,
  isRead,
  onSelect,
  onToggleBookmark,
}) => {
  const t = TRANSLATIONS[language];
  const summaryText = article.ai_summary || article.summary || '';
  const relativeDate = formatRelativeDate(article.published, language);

  // Relevance styling
  const relevance = article.exam_relevance || 'medium';
  const relevanceConfig = {
    high: {
      label: t.relevance.high,
      className: 'bg-[#F42A41]/10 text-[#F42A41] border-[#F42A41]/30 font-bold',
      dotClass: 'bg-[#F42A41]',
    },
    medium: {
      label: t.relevance.medium,
      className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-medium',
      dotClass: 'bg-amber-500',
    },
    low: {
      label: t.relevance.low,
      className: 'bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-700 font-normal',
      dotClass: 'bg-stone-400',
    },
  }[relevance];

  return (
    <article
      onClick={() => onSelect(article)}
      className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 cursor-pointer text-left bg-white dark:bg-stone-900 hover:shadow-md hover:border-[#006A4E]/40 dark:hover:border-emerald-600/50 ${
        isRead
          ? 'border-stone-200/60 dark:border-stone-800/80 opacity-90'
          : 'border-stone-200 dark:border-stone-800 shadow-xs'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(article);
        }
      }}
      aria-label={`View article: ${article.title}`}
    >
      <div>
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Source */}
            <span className="font-bold text-[#006A4E] dark:text-emerald-400">
              {article.source}
            </span>

            <span className="text-stone-300 dark:text-stone-700">•</span>

            {/* Relative Date */}
            <span className="text-stone-500 dark:text-stone-400 text-xs">
              {relativeDate}
            </span>

            {/* Read check indicator */}
            {isRead && (
              <span
                title={t.readStatus}
                className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.readStatus}</span>
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={(e) => onToggleBookmark(article.id, e)}
            className={`p-2 rounded-xl transition min-w-[40px] min-h-[40px] flex items-center justify-center -mr-1.5 -mt-1.5 ${
              isBookmarked
                ? 'text-[#006A4E] dark:text-emerald-400 bg-[#006A4E]/10 dark:bg-emerald-500/20'
                : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title={isBookmarked ? t.detail.bookmarked : t.detail.bookmark}
            aria-label={isBookmarked ? `Remove bookmark for ${article.title}` : `Bookmark ${article.title}`}
          >
            <Bookmark
              className={`w-4 h-4 transition-transform ${isBookmarked ? 'fill-current scale-110' : ''}`}
            />
          </button>
        </div>

        {article.image && (
          <img
            src={article.image}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
            className="w-full aspect-[16/9] object-cover rounded-xl mb-3 bg-stone-100 dark:bg-stone-800"
          />
        )}

        {/* Title */}
        <h3 className="font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 group-hover:text-[#006A4E] dark:group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug mb-2">
          {article.title}
        </h3>

        {/* Summary (ai_summary or summary) */}
        <p className="text-sm text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed mb-4">
          {summaryText}
        </p>
      </div>

      {/* Footer: Badges & Tags */}
      <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Editorial Badge */}
          {article.is_editorial && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#006A4E]/10 text-[#006A4E] dark:bg-emerald-500/20 dark:text-emerald-300">
              <Feather className="w-3 h-3" />
              <span>{t.editorialBadge}</span>
            </span>
          )}

          {/* Exam Relevance Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${relevanceConfig.className}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${relevanceConfig.dotClass}`} />
            <span>{relevanceConfig.label}</span>
          </span>

          {/* Category Chips */}
          {(article.categories || []).slice(0, 2).map((cat) => (
            <span
              key={cat}
              className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
            >
              {language === 'bn' ? CATEGORY_NAMES_BN[cat] || cat : cat}
            </span>
          ))}

          {article.key_facts && article.key_facts.length > 0 && (
            <span
              title={`${article.key_facts.length} key facts`}
              className="inline-flex items-center gap-0.5 text-xs text-stone-500 dark:text-stone-400 font-medium px-1.5 py-0.5"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{article.key_facts.length} {language === 'bn' ? 'তথ্য' : 'facts'}</span>
            </span>
          )}
        </div>

        <div className="flex items-center text-xs font-semibold text-[#006A4E] dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
          <span>{language === 'bn' ? 'পড়ুন' : 'Read'}</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </div>
      </div>
    </article>
  );
};
