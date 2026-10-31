/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DateRange, Language } from '../types';

/**
 * Safely parses any date string without throwing.
 */
export function parseSafeDate(dateStr?: string | null): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d;
}

/**
 * Formats relative date (e.g., "2h ago", "Yesterday", "3d ago", "গতকাল")
 */
export function formatRelativeDate(
  dateStr?: string | null,
  lang: Language = 'en',
  now: Date = new Date()
): string {
  const d = parseSafeDate(dateStr);
  if (!d) {
    return lang === 'bn' ? 'সম্প্রতি' : 'Recently';
  }

  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return lang === 'bn' ? 'এইমাত্র' : 'Just now';
  }
  if (diffMins < 60) {
    return lang === 'bn' ? `${diffMins} মিনিট আগে` : `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return lang === 'bn' ? `${diffHours} ঘণ্টা আগে` : `${diffHours}h ago`;
  }
  if (diffDays === 1) {
    return lang === 'bn' ? 'গতকাল' : 'Yesterday';
  }
  if (diffDays < 30) {
    return lang === 'bn' ? `${diffDays} দিন আগে` : `${diffDays}d ago`;
  }

  return formatReadableDate(dateStr, lang);
}

/**
 * Formats a readable date like "31 Oct 2026" or "৩১ অক্টোবর ২০২৬"
 */
export function formatReadableDate(dateStr?: string | null, lang: Language = 'en'): string {
  const d = parseSafeDate(dateStr);
  if (!d) {
    return lang === 'bn' ? 'তারিখ অনুপলব্ধ' : 'Date unavailable';
  }

  try {
    const locale = lang === 'bn' ? 'bn-BD' : 'en-GB';
    return d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

/**
 * Checks whether an article's published date falls within a selected DateRange
 */
export function isDateInRange(
  dateStr?: string | null,
  range: DateRange = 'all',
  now: Date = new Date()
): boolean {
  if (range === 'all') return true;

  const d = parseSafeDate(dateStr);
  if (!d) return false;

  const diffMs = now.getTime() - d.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  if (range === 'today') {
    // Within 24 hours or same calendar day
    const isSameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    return isSameDay || diffMs < dayMs;
  }

  if (range === '7days') {
    return diffMs >= 0 && diffMs <= 7 * dayMs;
  }

  if (range === '30days') {
    return diffMs >= 0 && diffMs <= 30 * dayMs;
  }

  return true;
}
