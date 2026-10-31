/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Article, Category, DateRange } from '../types';
import { isDateInRange } from './dateUtils';

export interface FilterOptions {
  searchQuery: string;
  selectedCategories: Category[];
  selectedSource: string; // 'all' or specific source
  dateRange: DateRange;
  editorialsOnly: boolean;
  highRelevanceOnly: boolean;
}

export const DEFAULT_FILTERS: FilterOptions = {
  searchQuery: '',
  selectedCategories: [],
  selectedSource: 'all',
  dateRange: 'all',
  editorialsOnly: false,
  highRelevanceOnly: false,
};

/**
 * Filters a list of articles based on criteria.
 */
export function filterArticles(
  articles: Article[],
  filters: FilterOptions,
  now: Date = new Date()
): Article[] {
  if (!Array.isArray(articles)) return [];

  const query = filters.searchQuery.trim().toLowerCase();

  return articles.filter((article) => {
    // 1. Search Query (title, summary, ai_summary, key_facts)
    if (query) {
      const matchTitle = (article.title || '').toLowerCase().includes(query);
      const matchSummary = (article.summary || '').toLowerCase().includes(query);
      const matchAiSummary = (article.ai_summary || '').toLowerCase().includes(query);
      const matchFacts = (article.key_facts || []).some((f) => f.toLowerCase().includes(query));

      if (!matchTitle && !matchSummary && !matchAiSummary && !matchFacts) {
        return false;
      }
    }

    // 2. Category multi-select
    if (filters.selectedCategories.length > 0) {
      const hasMatchingCategory = (article.categories || []).some((cat) =>
        filters.selectedCategories.includes(cat as Category)
      );
      if (!hasMatchingCategory) {
        return false;
      }
    }

    // 3. Source dropdown
    if (filters.selectedSource && filters.selectedSource !== 'all') {
      if (article.source !== filters.selectedSource) {
        return false;
      }
    }

    // 4. Date Range
    if (filters.dateRange && filters.dateRange !== 'all') {
      if (!isDateInRange(article.published, filters.dateRange, now)) {
        return false;
      }
    }

    // 5. Editorials Only
    if (filters.editorialsOnly && !article.is_editorial) {
      return false;
    }

    // 6. High Relevance Only
    if (filters.highRelevanceOnly && article.exam_relevance !== 'high') {
      return false;
    }

    return true;
  });
}

/**
 * Extracts unique list of sources from articles
 */
export function extractUniqueSources(articles: Article[]): string[] {
  if (!Array.isArray(articles)) return [];
  const set = new Set<string>();
  articles.forEach((a) => {
    if (a.source && typeof a.source === 'string') {
      set.add(a.source.trim());
    }
  });
  return Array.from(set).sort();
}
