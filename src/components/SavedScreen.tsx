/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Download,
  Trash2,
  ChevronRight,
  FileText,
  Filter,
  Check,
} from 'lucide-react';
import { Article, Category, Language } from '../types';
import { ALL_CATEGORIES } from '../config';
import { CATEGORY_NAMES_BN, TRANSLATIONS } from '../lib/translations';
import { formatReadableDate } from '../lib/dateUtils';

interface SavedScreenProps {
  articles: Article[];
  bookmarks: string[];
  notes: Record<string, string>;
  language: Language;
  onSelectArticle: (article: Article) => void;
  onRemoveBookmark: (id: string, e: React.MouseEvent) => void;
  onNavigateFeed: () => void;
}

export const SavedScreen: React.FC<SavedScreenProps> = ({
  articles,
  bookmarks,
  notes,
  language,
  onSelectArticle,
  onRemoveBookmark,
  onNavigateFeed,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [exported, setExported] = useState<boolean>(false);

  // Get full article objects for bookmarks
  const savedArticles = useMemo(() => {
    return articles.filter((a) => bookmarks.includes(a.id));
  }, [articles, bookmarks]);

  // Filter by category
  const filteredSavedArticles = useMemo(() => {
    if (selectedCategory === 'all') return savedArticles;
    return savedArticles.filter((a) =>
      a.categories.some((c) => c.toLowerCase() === selectedCategory.toLowerCase())
    );
  }, [savedArticles, selectedCategory]);

  // Export notes and bookmarks to a clean .txt file
  const handleExportNotes = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    let content = `========================================\n`;
    content += `KHOBORPATH (খবরপাঠ) - BCS STUDY NOTES & BOOKMARKS\n`;
    content += `Export Date: ${timestamp}\n`;
    content += `Total Bookmarked Articles: ${savedArticles.length}\n`;
    content += `========================================\n\n`;

    savedArticles.forEach((art, index) => {
      content += `[${index + 1}] ${art.title}\n`;
      content += `Source: ${art.source} | Date: ${art.published}\n`;
      content += `Categories: ${art.categories.join(', ')}\n`;
      content += `Exam Relevance: ${(art.exam_relevance || 'medium').toUpperCase()}\n`;
      content += `Link: ${art.link}\n\n`;

      content += `SUMMARY:\n${art.ai_summary || art.summary}\n\n`;

      if (art.key_facts && art.key_facts.length > 0) {
        content += `KEY FACTS TO MEMORIZE:\n`;
        art.key_facts.forEach((fact, fIdx) => {
          content += `  ${fIdx + 1}. ${fact}\n`;
        });
        content += `\n`;
      }

      const note = notes[art.id];
      if (note && note.trim().length > 0) {
        content += `MY PERSONAL STUDY NOTES:\n${note}\n\n`;
      } else {
        content += `MY PERSONAL STUDY NOTES: [No notes written yet]\n\n`;
      }

      content += `----------------------------------------\n\n`;
    });

    // Create blob and download link
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `khoborpath_bcs_study_notes_${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 lg:pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#006A4E]/10 text-[#006A4E] dark:text-emerald-400">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
              {t.saved.title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#006A4E]/10 text-[#006A4E] dark:bg-emerald-500/20 dark:text-emerald-300">
              {savedArticles.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            {t.saved.subtitle}
          </p>
        </div>

        {savedArticles.length > 0 && (
          <button
            onClick={handleExportNotes}
            className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#006A4E] text-white hover:bg-[#00543e] transition shadow-sm"
            aria-label={t.saved.exportNotes}
          >
            {exported ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>{t.saved.exportSuccess}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{t.saved.exportNotes}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Category Filter Pills if items exist */}
      {savedArticles.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
              selectedCategory === 'all'
                ? 'bg-[#006A4E] text-white'
                : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            {t.feed.allCategories}
          </button>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-[#006A4E] text-white'
                  : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              {language === 'bn' ? CATEGORY_NAMES_BN[cat] || cat : cat}
            </button>
          ))}
        </div>
      )}

      {/* Bookmarked Articles List */}
      {filteredSavedArticles.length > 0 ? (
        <div className="space-y-4">
          {filteredSavedArticles.map((article) => {
            const candidateNote = notes[article.id];
            return (
              <div
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs hover:border-[#006A4E]/40 transition cursor-pointer group space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <span className="font-bold text-[#006A4E] dark:text-emerald-400">
                        {article.source}
                      </span>
                      <span className="text-stone-300 dark:text-stone-700">•</span>
                      <span className="text-stone-500 dark:text-stone-400">
                        {formatReadableDate(article.published, language)}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-[#006A4E] dark:group-hover:text-emerald-300 transition-colors">
                      {article.title}
                    </h3>
                  </div>

                  {/* Remove Bookmark Button */}
                  <button
                    onClick={(e) => onRemoveBookmark(article.id, e)}
                    className="p-2 rounded-xl text-stone-400 hover:text-[#F42A41] hover:bg-red-50 dark:hover:bg-red-950/30 transition shrink-0"
                    title={t.saved.removeBookmark}
                    aria-label={`Remove ${article.title} from bookmarks`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 line-clamp-2">
                  {article.ai_summary || article.summary}
                </p>

                {/* Candidate Personal Note Snippet */}
                {candidateNote && candidateNote.trim().length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2">
                    <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 overflow-hidden">
                      <span className="font-bold text-amber-800 dark:text-amber-400">
                        {t.saved.notesExcerpt}
                      </span>
                      <p className="line-clamp-2 italic text-stone-600 dark:text-stone-400">
                        "{candidateNote}"
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between text-xs font-semibold text-[#006A4E] dark:text-emerald-400">
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium">
                    {article.categories[0]}
                  </span>
                  <div className="flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    <span>{language === 'bn' ? 'নোট ও বিস্তারিত দেখুন' : 'View Notes & Details'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-3">
          <Bookmark className="w-10 h-10 text-stone-300 dark:text-stone-700 mx-auto" />
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
            {t.saved.emptyTitle}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
            {t.saved.emptySubtitle}
          </p>
          <button
            onClick={onNavigateFeed}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#006A4E] text-white hover:bg-[#00543e] transition"
          >
            <span>{t.saved.exploreFeed}</span>
          </button>
        </div>
      )}
    </div>
  );
};
