/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ExamRelevance = 'high' | 'medium' | 'low';

export type Category =
  | 'Bangladesh Affairs'
  | 'International Affairs'
  | 'Economy'
  | 'Environment & Climate'
  | 'Science & Tech'
  | 'Governance & Law'
  | 'General';

export interface Article {
  id: string;
  source: string;
  title: string;
  link: string;
  summary: string;
  ai_summary?: string;
  key_facts?: string[];
  categories: string[];
  is_editorial: boolean;
  exam_relevance?: ExamRelevance;
  published: string;
  image?: string;
}

export interface QuizQuestion {
  id?: string;
  q: string;
  options: [string, string, string, string] | string[];
  answerIndex: number;
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  timestamp: string;
}

export type TabType = 'feed' | 'detail' | 'digest' | 'saved' | 'quiz' | 'progress' | 'settings';

export type DateRange = 'today' | '7days' | '30days' | 'all';

export type Language = 'en' | 'bn';

export type ThemeMode = 'light' | 'dark' | 'system';

export type TextSize = 'sm' | 'base' | 'lg';

export interface UserStreak {
  currentStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
}
