/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  X,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Article, Category, DateRange, Language } from '../types';
import { ALL_CATEGORIES } from '../config';
import { CATEGORY_NAMES_BN, TRANSLATIONS } from '../lib/translations';
import { DEFAULT_FILTERS, extractUniqueSources, filterArticles, FilterOptions } from '../lib/filterUtils';
import { ArticleCard } from './ArticleCard';

interface FeedScreenProps {
  articles: Article[];
  isLoading: boolean;
  isFallback: boolean;
  lastUpdatedTime: string;
  errorMessage: string | null;
  onRefresh: () => void;
  language: Language;
  onSelectArticle: (article: Article) => void;
  isBookmarked: (id: string) => boolean;
  isRead: (id: string) => boolean;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
}

const ITEMS_PER_PAGE = 20;

export const FeedScreen: React.FC<FeedScreenProps> = ({
  articles,
  isLoading,
  isFallback,
  lastUpdatedTime,
  errorMessage,
  onRefresh,
  language,
  onSelectArticle,
  isBookmarked,
  isRead,
  onToggleBookmark,
}) => {
  const t = TRANSLATIONS[language];
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  // Available unique sources
  const availableSources = useMemo(() => extractUniqueSources(articles), [articles]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return filterArticles(articles, filters);
  }, [articles, filters]);

  // Paginated articles
  const displayedArticles = useMemo(() => {
    return filteredArticles.slice(0, visibleCount);
  }, [filteredArticles, visibleCount]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchQuery.trim() !== '' ||
      filters.selectedCategories.length > 0 ||
      filters.selectedSource !== 'all' ||
      filters.dateRange !== 'all' ||
      filters.editorialsOnly ||
      filters.highRelevanceOnly
    );
  }, [filters]);

  const toggleCategory = (cat: Category) => {
    setFilters((prev) => {
      const exists = prev.selectedCategories.includes(cat);
      const updated = exists
        ? prev.selectedCategories.filter((c) => c !== cat)
        : [...prev.selectedCategories, cat];
      return { ...prev, selectedCategories: updated };
    });
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* Top Banner / Sync Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#006A4E]/10 dark:bg-emerald-500/20 text-[#006A4E] dark:text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
              {t.tabs.feed}
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {lastUpdatedTime
                ? t.feed.lastUpdated.replace('{time}', lastUpdatedTime)
                : t.heroSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {isFallback && (
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
              {language === 'bn' ? 'নমুনা ডেটাসেট' : 'Sample Archive'}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition disabled:opacity-60 min-h-[40px]"
            aria-label={t.feed.refresh}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t.feed.refresh}</span>
          </button>
        </div>
      </div>

      {isFallback && (
        <div role="alert" className="p-4 rounded-2xl bg-[#F42A41]/10 border border-[#F42A41]/30 text-[#b3172a] dark:text-red-300 text-xs sm:text-sm font-semibold">
          {language === 'bn'
            ? 'ডেমো মোড: এগুলো আসল খবর নয়, শুধু অ্যাপ দেখানোর নমুনা। পরীক্ষার জন্য এগুলোর তথ্য ব্যবহার করবেন না।'
            : 'Demo mode: these are NOT real news articles, only samples to show how the app works. Do not study facts from them.'}
        </div>
      )}

      {/* Network Error Alert with Retry */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{t.feed.fallbackNotice}</span>
          </div>
          <button
            onClick={onRefresh}
            className="px-3 py-1 rounded-lg bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 shadow-xs space-y-4">
        {/* Main Search Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              placeholder={t.feed.searchPlaceholder}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] dark:focus:ring-emerald-500 transition"
              aria-label="Search articles"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters({ ...filters, searchQuery: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition min-h-[42px] ${
              showFiltersPanel || hasActiveFilters
                ? 'bg-[#006A4E]/10 border-[#006A4E]/30 text-[#006A4E] dark:text-emerald-300'
                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
            }`}
            aria-expanded={showFiltersPanel}
            aria-label="Toggle filter options"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">{t.feed.filterButton}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#006A4E] dark:bg-emerald-400" />
            )}
          </button>
        </div>

        {/* Quick Toggles: Editorials only & High relevance only */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            onClick={() => setFilters({ ...filters, editorialsOnly: !filters.editorialsOnly })}
            className={`px-3 py-1.5 rounded-xl font-medium border transition ${
              filters.editorialsOnly
                ? 'bg-[#006A4E] text-white border-[#006A4E]'
                : 'bg-stone-50 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-300'
            }`}
          >
            {t.feed.editorialsOnly}
          </button>

          <button
            onClick={() => setFilters({ ...filters, highRelevanceOnly: !filters.highRelevanceOnly })}
            className={`px-3 py-1.5 rounded-xl font-medium border transition ${
              filters.highRelevanceOnly
                ? 'bg-[#F42A41] text-white border-[#F42A41]'
                : 'bg-stone-50 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-300'
            }`}
          >
            {t.feed.highRelevanceOnly}
          </button>

          {/* Date range quick selector */}
          <div className="flex items-center gap-1 ml-auto">
            <Clock className="w-3.5 h-3.5 text-stone-400 hidden sm:inline" />
            {(['all', 'today', '7days', '30days'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setFilters({ ...filters, dateRange: range })}
                className={`px-2 py-1 rounded-lg text-xs transition ${
                  filters.dateRange === range
                    ? 'font-bold text-[#006A4E] dark:text-emerald-400 bg-[#006A4E]/10 dark:bg-emerald-500/20'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                {t.feed.dateRanges[range]}
              </button>
            ))}
          </div>
        </div>

        {/* Expanded Filters Drawer */}
        {showFiltersPanel && (
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800/80 space-y-4">
            {/* Category Multi-select Pills */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                {t.feed.categoriesLabel}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_CATEGORIES.map((cat) => {
                  const isSelected = filters.selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs transition font-medium border ${
                        isSelected
                          ? 'bg-[#006A4E] text-white border-[#006A4E]'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-transparent hover:border-stone-300 dark:hover:border-stone-700'
                      }`}
                    >
                      {language === 'bn' ? CATEGORY_NAMES_BN[cat] || cat : cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Source Dropdown */}
            {availableSources.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  {t.feed.sourcesLabel}:
                </label>
                <select
                  value={filters.selectedSource}
                  onChange={(e) => setFilters({ ...filters, selectedSource: e.target.value })}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#006A4E]"
                >
                  <option value="all">{t.feed.allSources}</option>
                  {availableSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 text-xs font-semibold text-[#F42A41] hover:underline"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{t.feed.clearFilters}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Result Count Status */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-1">
        <span>
          {t.feed.showingResults
            .replace('{count}', String(displayedArticles.length))
            .replace('{total}', String(filteredArticles.length))}
        </span>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-[#006A4E] dark:text-emerald-400 hover:underline font-medium"
          >
            {t.feed.clearFilters}
          </button>
        )}
      </div>

      {/* Loading Skeletons */}
      {isLoading && displayedArticles.length === 0 && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 animate-pulse space-y-3"
            >
              <div className="flex gap-2">
                <div className="h-4 w-24 bg-stone-200 dark:bg-stone-800 rounded" />
                <div className="h-4 w-16 bg-stone-200 dark:bg-stone-800 rounded" />
              </div>
              <div className="h-6 w-3/4 bg-stone-200 dark:bg-stone-800 rounded" />
              <div className="h-4 w-full bg-stone-200 dark:bg-stone-800 rounded" />
              <div className="h-4 w-2/3 bg-stone-200 dark:bg-stone-800 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Articles Grid / List */}
      {displayedArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              language={language}
              isBookmarked={isBookmarked(article.id)}
              isRead={isRead(article.id)}
              onSelect={onSelectArticle}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        !isLoading && (
          <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="inline-flex p-3 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              {t.feed.noResults}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              {t.feed.noResultsAction}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#006A4E] text-white hover:bg-[#00543e] transition"
              >
                <span>{t.feed.clearFilters}</span>
              </button>
            )}
          </div>
        )
      )}

      {/* Pagination / Load More */}
      {filteredArticles.length > visibleCount && (
        <div className="text-center pt-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
            className="px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition border border-stone-200 dark:border-stone-700"
          >
            {t.feed.loadMore}
          </button>
        </div>
      )}
    </div>
  );
};
