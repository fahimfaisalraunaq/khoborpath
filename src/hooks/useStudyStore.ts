/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Language, QuizResult, TextSize, ThemeMode, UserStreak } from '../types';

export function useStudyStore() {
  const [bookmarks, setBookmarks] = useLocalStorage<string[]>('khoborpath_bookmarks', []);
  const [readArticleIds, setReadArticleIds] = useLocalStorage<string[]>('khoborpath_read_ids', []);
  const [notes, setNotes] = useLocalStorage<Record<string, string>>('khoborpath_notes', {});
  const [quizScores, setQuizScores] = useLocalStorage<Record<string, QuizResult>>('khoborpath_quiz_scores', {});
  const [checkedFacts, setCheckedFacts] = useLocalStorage<Record<string, string[]>>('khoborpath_checked_facts', {});
  const [userStreak, setUserStreak] = useLocalStorage<UserStreak>('khoborpath_user_streak', {
    currentStreak: 1,
    lastActiveDate: new Date().toISOString().slice(0, 10),
  });

  const [language, setLanguage] = useLocalStorage<Language>('khoborpath_lang', 'en');
  const [theme, setTheme] = useLocalStorage<ThemeMode>('khoborpath_theme', 'system');
  const [textSize, setTextSize] = useLocalStorage<TextSize>('khoborpath_text_size', 'base');

  // Apply theme class to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System default
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      const listener = (e: MediaQueryListEvent) => {
        if (theme === 'system') {
          if (e.matches) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  // Touch streak on activity
  const recordActivity = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    setUserStreak((prev) => {
      if (prev.lastActiveDate === today) {
        return prev;
      }

      const lastDate = new Date(prev.lastActiveDate);
      const currentDate = new Date(today);
      const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return {
          currentStreak: prev.currentStreak + 1,
          lastActiveDate: today,
        };
      } else {
        return {
          currentStreak: 1,
          lastActiveDate: today,
        };
      }
    });
  }, [setUserStreak]);

  const toggleBookmark = useCallback(
    (id: string) => {
      recordActivity();
      setBookmarks((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
    },
    [setBookmarks, recordActivity]
  );

  const isBookmarked = useCallback((id: string) => bookmarks.includes(id), [bookmarks]);

  const toggleRead = useCallback(
    (id: string) => {
      recordActivity();
      setReadArticleIds((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
    },
    [setReadArticleIds, recordActivity]
  );

  const isRead = useCallback((id: string) => readArticleIds.includes(id), [readArticleIds]);

  const saveNote = useCallback(
    (id: string, text: string) => {
      recordActivity();
      setNotes((prev) => ({
        ...prev,
        [id]: text,
      }));
    },
    [setNotes, recordActivity]
  );

  const getNote = useCallback((id: string) => notes[id] || '', [notes]);

  const toggleFactCheck = useCallback(
    (articleId: string, factText: string) => {
      recordActivity();
      setCheckedFacts((prev) => {
        const currentList = prev[articleId] || [];
        const exists = currentList.includes(factText);
        const updated = exists ? currentList.filter((f) => f !== factText) : [...currentList, factText];
        return {
          ...prev,
          [articleId]: updated,
        };
      });
    },
    [setCheckedFacts, recordActivity]
  );

  const isFactChecked = useCallback(
    (articleId: string, factText: string) => {
      return (checkedFacts[articleId] || []).includes(factText);
    },
    [checkedFacts]
  );

  const saveQuizScore = useCallback(
    (articleId: string, score: number, total: number) => {
      recordActivity();
      setQuizScores((prev) => {
        const existing = prev[articleId];
        // Keep best score or record latest if higher
        if (!existing || score > existing.score) {
          return {
            ...prev,
            [articleId]: {
              score,
              total,
              timestamp: new Date().toISOString(),
            },
          };
        }
        return prev;
      });
    },
    [setQuizScores, recordActivity]
  );

  const clearAllData = useCallback(() => {
    try {
      window.localStorage.removeItem('khoborpath_bookmarks');
      window.localStorage.removeItem('khoborpath_read_ids');
      window.localStorage.removeItem('khoborpath_notes');
      window.localStorage.removeItem('khoborpath_quiz_scores');
      window.localStorage.removeItem('khoborpath_checked_facts');
      window.localStorage.removeItem('khoborpath_user_streak');
      window.localStorage.removeItem('khoborpath_cached_articles');
      window.localStorage.removeItem('khoborpath_last_fetch_time');

      setBookmarks([]);
      setReadArticleIds([]);
      setNotes({});
      setQuizScores({});
      setCheckedFacts({});
      setUserStreak({
        currentStreak: 1,
        lastActiveDate: new Date().toISOString().slice(0, 10),
      });
    } catch (e) {
      console.warn('Error clearing localStorage:', e);
    }
  }, [setBookmarks, setReadArticleIds, setNotes, setQuizScores, setCheckedFacts, setUserStreak]);

  return {
    bookmarks,
    readArticleIds,
    notes,
    quizScores,
    checkedFacts,
    userStreak,
    language,
    theme,
    textSize,
    setLanguage,
    setTheme,
    setTextSize,
    toggleBookmark,
    isBookmarked,
    toggleRead,
    isRead,
    saveNote,
    getNote,
    toggleFactCheck,
    isFactChecked,
    saveQuizScore,
    clearAllData,
    recordActivity,
  };
}
