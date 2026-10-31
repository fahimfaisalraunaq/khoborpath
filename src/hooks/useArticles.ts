/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Article } from '../types';
import { CONFIG, isPlaceholderUrl } from '../config';
import { SAMPLE_ARTICLES } from '../data/sampleArticles';

/**
 * Sanitizes incoming raw article objects defensively to protect UI from crashes.
 */
function sanitizeArticles(rawList: unknown): Article[] {
  if (!Array.isArray(rawList)) return [];

  const valid: Article[] = [];
  rawList.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const r = item as Record<string, unknown>;

    const id = typeof r.id === 'string' && r.id ? r.id : `art-${index + 1}`;
    const title = typeof r.title === 'string' && r.title ? r.title : 'Untitled Article';
    const source = typeof r.source === 'string' && r.source ? r.source : 'National Daily';
    const link = typeof r.link === 'string' && /^https?:\/\//.test(r.link) ? r.link : '';
    if (!link) return; // never show an article we cannot trace back to its newspaper
    const summary = typeof r.summary === 'string' ? r.summary : '';
    const ai_summary = typeof r.ai_summary === 'string' ? r.ai_summary : undefined;

    let key_facts: string[] | undefined = undefined;
    if (Array.isArray(r.key_facts)) {
      key_facts = r.key_facts.filter((f) => typeof f === 'string' && f.trim().length > 0);
    }

    let categories: string[] = ['General'];
    if (Array.isArray(r.categories) && r.categories.length > 0) {
      categories = r.categories.filter((c) => typeof c === 'string');
    }

    const is_editorial = Boolean(r.is_editorial);
    let exam_relevance: 'high' | 'medium' | 'low' = 'medium';
    if (r.exam_relevance === 'high' || r.exam_relevance === 'medium' || r.exam_relevance === 'low') {
      exam_relevance = r.exam_relevance;
    }

    const published = typeof r.published === 'string' ? r.published : new Date().toISOString();
    const image = typeof r.image === 'string' && r.image.startsWith('https://') ? r.image : undefined;

    valid.push({
      id,
      source,
      title,
      link,
      summary,
      ai_summary,
      key_facts,
      categories,
      is_editorial,
      exam_relevance,
      published,
      image,
    });
  });

  return valid;
}

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>(SAMPLE_ARTICLES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFallback, setIsFallback] = useState<boolean>(true);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchArticles = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setErrorMessage(null);

    // If URL is placeholder, use built-in sample articles
    if (isPlaceholderUrl(CONFIG.ARTICLES_URL)) {
      setArticles(SAMPLE_ARTICLES);
      setIsFallback(true);
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastUpdatedTime(nowStr);
      setIsLoading(false);
      return;
    }

    // Try checking localStorage cache if not force refreshing
    if (!forceRefresh) {
      try {
        const cached = window.localStorage.getItem('khoborpath_cached_articles');
        const cachedTime = window.localStorage.getItem('khoborpath_last_fetch_time');
        if (cached && cachedTime) {
          const parsedCache = JSON.parse(cached);
          const cacheAgeMs = Date.now() - new Date(cachedTime).getTime();
          if (cacheAgeMs < CONFIG.CACHE_TTL_MINUTES * 60 * 1000) {
            setArticles(sanitizeArticles(parsedCache));
            setIsFallback(false);
            setLastUpdatedTime(new Date(cachedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Error reading article cache:', e);
      }
    }

    // Attempt remote fetch
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(CONFIG.ARTICLES_URL, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      const clean = sanitizeArticles(json);
      if (clean.length === 0) throw new Error('News feed is empty');
      setArticles(clean);
      setIsFallback(false);

      const now = new Date();
      const nowStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastUpdatedTime(nowStr);

      try {
        window.localStorage.setItem('khoborpath_cached_articles', JSON.stringify(clean));
        window.localStorage.setItem('khoborpath_last_fetch_time', now.toISOString());
      } catch (e) {
        console.warn('Could not cache articles:', e);
      }
    } catch (err) {
      console.warn('Failed to fetch from ARTICLES_URL:', err);
      // Prefer the last real articles we downloaded over demo content
      let usedCache = false;
      try {
        const cached = window.localStorage.getItem('khoborpath_cached_articles');
        const cachedTime = window.localStorage.getItem('khoborpath_last_fetch_time');
        const parsed = cached ? sanitizeArticles(JSON.parse(cached)) : [];
        if (parsed.length > 0) {
          setArticles(parsed);
          setIsFallback(false);
          setLastUpdatedTime(cachedTime ? new Date(cachedTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '');
          usedCache = true;
        }
      } catch {
        /* ignore */
      }
      if (!usedCache) {
        setArticles(SAMPLE_ARTICLES);
        setIsFallback(true);
        setLastUpdatedTime('');
      }
      setErrorMessage(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
    // Re-check for fresh news whenever the app is reopened / brought back to the screen
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchArticles();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchArticles]);

  return {
    articles,
    isLoading,
    isFallback,
    lastUpdatedTime,
    errorMessage,
    refreshArticles: () => fetchArticles(true),
  };
}
