/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category } from './types';

export const CONFIG = {
  // Remote raw JSON URL for automated scrapers or GitHub action pipelines.
  // Replace YOUR_USER and YOUR_REPO with your actual GitHub repo or API endpoint.
  ARTICLES_URL: (import.meta.env.VITE_ARTICLES_URL as string | undefined) ||
    'https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/data/articles.json',

  // Optional AI proxy endpoint to generate custom quiz questions from articles.
  // When empty or failing, Khoborpath uses its intelligent built-in offline generator.
  AI_PROXY_URL: (import.meta.env.VITE_AI_PROXY_URL as string | undefined) || '',

  // Where beta testers send feedback (a Google Form link, WhatsApp link, or mailto:you@example.com)
  FEEDBACK_URL: (import.meta.env.VITE_FEEDBACK_URL as string | undefined) || '',

  // Shows a BETA badge. Set VITE_BETA=false at public launch.
  IS_BETA: (import.meta.env.VITE_BETA as string | undefined) !== 'false',

  // Cache duration in minutes for local storage cache of articles
  CACHE_TTL_MINUTES: 15,

  // App version
  VERSION: '1.1.0-beta',
};

export const ALL_CATEGORIES: Category[] = [
  'Bangladesh Affairs',
  'International Affairs',
  'Economy',
  'Environment & Climate',
  'Science & Tech',
  'Governance & Law',
  'General',
];

/**
 * Checks if a given URL is still a placeholder or empty
 */
export function isPlaceholderUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim();
  return (
    trimmed === '' ||
    trimmed.includes('YOUR_USER') ||
    trimmed.includes('YOUR_REPO') ||
    trimmed.includes('example.com')
  );
}
