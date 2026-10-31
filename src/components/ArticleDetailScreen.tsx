/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Bookmark,
  CheckCircle,
  HelpCircle,
  Sparkles,
  CheckSquare,
  Square,
  FileEdit,
  Save,
  Feather,
  Award,
} from 'lucide-react';
import { Article, Language, QuizResult } from '../types';
import { CATEGORY_NAMES_BN, TRANSLATIONS } from '../lib/translations';
import { formatReadableDate } from '../lib/dateUtils';

interface ArticleDetailScreenProps {
  article: Article;
  language: Language;
  onBack: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  isRead: boolean;
  onToggleRead: () => void;
  onQuizMe: (article: Article) => void;
  savedNote: string;
  onSaveNote: (text: string) => void;
  isFactChecked: (fact: string) => boolean;
  onToggleFactCheck: (fact: string) => void;
  bestScore?: QuizResult;
}

export const ArticleDetailScreen: React.FC<ArticleDetailScreenProps> = ({
  article,
  language,
  onBack,
  isBookmarked,
  onToggleBookmark,
  isRead,
  onToggleRead,
  onQuizMe,
  savedNote,
  onSaveNote,
  isFactChecked,
  onToggleFactCheck,
  bestScore,
}) => {
  const t = TRANSLATIONS[language];
  const [noteText, setNoteText] = useState<string>(savedNote);
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);

  useEffect(() => {
    setNoteText(savedNote);
  }, [savedNote]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNoteText(val);
    onSaveNote(val);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2000);
  };

  const facts = article.key_facts || [];
  const checkedCount = facts.filter((f) => isFactChecked(f)).length;

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
      className: 'bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-700',
      dotClass: 'bg-stone-400',
    },
  }[relevance];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 lg:pb-16">
      {/* Top Navigation / Back button */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.detail.back}</span>
        </button>

        {/* Action quick buttons */}
        <div className="flex items-center gap-2">
          {/* Bookmark */}
          <button
            onClick={onToggleBookmark}
            className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
              isBookmarked
                ? 'bg-[#006A4E]/10 border-[#006A4E]/30 text-[#006A4E] dark:text-emerald-400'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100'
            }`}
            title={isBookmarked ? t.detail.bookmarked : t.detail.bookmark}
            aria-label={isBookmarked ? t.detail.bookmarked : t.detail.bookmark}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">
              {isBookmarked ? t.detail.bookmarked : t.detail.bookmark}
            </span>
          </button>

          {/* Mark Read */}
          <button
            onClick={onToggleRead}
            className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
              isRead
                ? 'bg-emerald-600/10 border-emerald-600/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100'
            }`}
          >
            <CheckCircle className={`w-4 h-4 ${isRead ? 'fill-emerald-600/20 text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">
              {isRead ? t.detail.markUnread : t.detail.markRead}
            </span>
          </button>
        </div>
      </div>

      {/* Main Article Header Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-xs space-y-5">
        {/* Metadata Row */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-bold text-sm text-[#006A4E] dark:text-emerald-400">
            {article.source}
          </span>
          <span className="text-stone-300 dark:text-stone-700">•</span>
          <span className="text-stone-500 dark:text-stone-400">
            {formatReadableDate(article.published, language)}
          </span>

          {article.is_editorial && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#006A4E]/10 text-[#006A4E] dark:bg-emerald-500/20 dark:text-emerald-300">
              <Feather className="w-3 h-3" />
              <span>{t.editorialBadge}</span>
            </span>
          )}

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${relevanceConfig.className}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${relevanceConfig.dotClass}`} />
            <span>{relevanceConfig.label}</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
          {article.title}
        </h1>

        {/* Category Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {article.categories.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
            >
              {language === 'bn' ? CATEGORY_NAMES_BN[cat] || cat : cat}
            </span>
          ))}
        </div>

        {/* Best Score Banner if tested */}
        {bestScore && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-medium">
            <Award className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {t.detail.bestScore
                .replace('{score}', String(bestScore.score))
                .replace('{total}', String(bestScore.total))}
            </span>
          </div>
        )}

        {/* Action Buttons: Quiz me & Read Original */}
        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <button
            onClick={() => onQuizMe(article)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-[#006A4E] text-white hover:bg-[#00543e] transition shadow-md shadow-[#006A4E]/20"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t.detail.quizMe}</span>
          </button>

          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl font-semibold text-xs sm:text-sm bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition border border-stone-200 dark:border-stone-700"
          >
            <span>{t.detail.readOriginal}</span>
            <ExternalLink className="w-4 h-4 ml-0.5" />
          </a>
        </div>
      </div>

      {/* Summary Content Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-xs space-y-5">
        {article.ai_summary && (
          <div className="p-4 rounded-2xl bg-[#006A4E]/5 dark:bg-emerald-950/20 border border-[#006A4E]/15 dark:border-emerald-800/30">
            <div className="flex items-center gap-2 text-xs font-bold text-[#006A4E] dark:text-emerald-400 uppercase tracking-wider mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{language === 'bn' ? 'এআই সারসংক্ষেপ ও বিশ্লেষণ' : 'Executive Digest & Focus'}</span>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-stone-800 dark:text-stone-200">
              {article.ai_summary}
            </p>
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
          <p>{article.summary}</p>
        </div>
      </div>

      {/* Key Facts to Memorize Checklist */}
      {facts.length > 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                  {t.detail.keyFactsTitle}
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {t.detail.keyFactsHint}
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300">
              {t.detail.factsMemorized
                .replace('{checked}', String(checkedCount))
                .replace('{total}', String(facts.length))}
            </span>
          </div>

          <div className="space-y-2.5 pt-2">
            {facts.map((fact, index) => {
              const checked = isFactChecked(fact);
              return (
                <button
                  key={index}
                  onClick={() => onToggleFactCheck(fact)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition flex items-start gap-3 group ${
                    checked
                      ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 text-stone-700 dark:text-stone-300'
                      : 'bg-stone-50/60 dark:bg-stone-800/60 border-stone-200/80 dark:border-stone-700/80 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200'
                  }`}
                  aria-pressed={checked}
                >
                  <span className="mt-0.5 text-stone-400 group-hover:text-[#006A4E] transition shrink-0">
                    {checked ? (
                      <CheckSquare className="w-5 h-5 text-[#006A4E] dark:text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </span>
                  <span className={`text-xs sm:text-sm leading-relaxed ${checked ? 'line-through text-stone-500 dark:text-stone-400' : ''}`}>
                    {fact}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Personal Candidate Study Notes */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#006A4E]/10 text-[#006A4E] dark:text-emerald-400">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                {t.detail.personalNotesTitle}
              </h2>
            </div>
          </div>

          {showSavedFeedback && (
            <span className="text-xs font-semibold text-[#006A4E] dark:text-emerald-400 flex items-center gap-1">
              <Save className="w-3.5 h-3.5" />
              <span>{t.detail.notesSaved}</span>
            </span>
          )}
        </div>

        <textarea
          value={noteText}
          onChange={handleNoteChange}
          placeholder={t.detail.personalNotesPlaceholder}
          rows={4}
          className="w-full p-4 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] leading-relaxed resize-y"
          aria-label="Personal study notes for this article"
        />
      </div>
    </div>
  );
};
