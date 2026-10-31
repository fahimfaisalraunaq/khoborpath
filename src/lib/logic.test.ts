/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE_ARTICLES } from '../data/sampleArticles';
import { generateFallbackQuestions } from './quizGenerator';
import { isDateInRange, formatRelativeDate, parseSafeDate } from './dateUtils';
import { filterArticles, DEFAULT_FILTERS, extractUniqueSources } from './filterUtils';

test('quizGenerator generates exactly 5 questions with 4 options and valid answerIndex', () => {
  const article = SAMPLE_ARTICLES[0];
  const questions = generateFallbackQuestions(article);

  assert.equal(questions.length, 5, 'Must generate exactly 5 questions');

  for (const q of questions) {
    assert.ok(q.q && q.q.length > 5, 'Question prompt must not be empty');
    assert.equal(q.options.length, 4, 'Must have exactly 4 answer options');
    assert.ok(q.answerIndex >= 0 && q.answerIndex <= 3, 'Answer index must be 0, 1, 2, or 3');
    assert.ok(q.explanation && q.explanation.length > 0, 'Explanation must be provided');
    assert.ok(q.options[q.answerIndex], 'Option at answerIndex must exist');
  }
});

test('quizGenerator safely handles article with empty key_facts and missing fields', () => {
  const minimalArticle = {
    id: 'empty-test',
    source: 'Test Source',
    title: 'Test Short Headline',
    link: 'https://example.com',
    summary: 'A short summary for testing fallback robustness.',
    categories: [],
    is_editorial: false,
    published: 'invalid-date-string',
  };

  const questions = generateFallbackQuestions(minimalArticle);
  assert.equal(questions.length, 5);
  assert.equal(questions[0].options.length, 4);
});

test('dateUtils safely parses dates and handles invalid inputs', () => {
  assert.equal(parseSafeDate(undefined), null);
  assert.equal(parseSafeDate('invalid-date'), null);
  assert.notEqual(parseSafeDate('2026-10-31T06:30:00Z'), null);

  const relEn = formatRelativeDate('not-a-date', 'en');
  assert.equal(relEn, 'Recently');

  const relBn = formatRelativeDate('not-a-date', 'bn');
  assert.equal(relBn, 'সম্প্রতি');

  const now = new Date('2026-10-31T12:00:00Z');
  const pastToday = new Date('2026-10-31T10:00:00Z').toISOString();
  assert.equal(formatRelativeDate(pastToday, 'en', now), '2h ago');
});

test('dateUtils isDateInRange checks ranges accurately', () => {
  const now = new Date('2026-10-31T12:00:00Z');
  const todayDate = '2026-10-31T06:00:00Z';
  const threeDaysAgo = '2026-10-28T12:00:00Z';
  const twentyDaysAgo = '2026-10-11T12:00:00Z';
  const twoMonthsAgo = '2026-08-01T12:00:00Z';

  assert.equal(isDateInRange(todayDate, 'today', now), true);
  assert.equal(isDateInRange(threeDaysAgo, 'today', now), false);
  assert.equal(isDateInRange(threeDaysAgo, '7days', now), true);
  assert.equal(isDateInRange(twentyDaysAgo, '7days', now), false);
  assert.equal(isDateInRange(twentyDaysAgo, '30days', now), true);
  assert.equal(isDateInRange(twoMonthsAgo, '30days', now), false);
  assert.equal(isDateInRange(twoMonthsAgo, 'all', now), true);
});

test('filterUtils filters articles by search, categories, and flags', () => {
  const allArticles = SAMPLE_ARTICLES;
  assert.equal(allArticles.length, 12);

  // 1. Default filters return all
  const filteredAll = filterArticles(allArticles, DEFAULT_FILTERS);
  assert.equal(filteredAll.length, 12);

  // 2. Search by keyword (English & Bengali)
  const searchEn = filterArticles(allArticles, {
    ...DEFAULT_FILTERS,
    searchQuery: 'Constitutional',
  });
  assert.ok(searchEn.length >= 1, 'Should find Constitutional article');
  assert.ok(searchEn[0].title.includes('Constitutional'));

  const searchBn = filterArticles(allArticles, {
    ...DEFAULT_FILTERS,
    searchQuery: 'সুন্দরবন',
  });
  assert.ok(searchBn.length >= 1, 'Should find Sundarbans Bangla article');
  assert.ok(searchBn[0].title.includes('সুন্দরবন'));

  // 3. Category filter
  const econResult = filterArticles(allArticles, {
    ...DEFAULT_FILTERS,
    selectedCategories: ['Economy'],
  });
  assert.ok(econResult.length > 0);
  assert.ok(econResult.every((a) => a.categories.includes('Economy')));

  // 4. Editorials only
  const editorials = filterArticles(allArticles, {
    ...DEFAULT_FILTERS,
    editorialsOnly: true,
  });
  assert.ok(editorials.length > 0);
  assert.ok(editorials.every((a) => a.is_editorial === true));

  // 5. High relevance only
  const highRel = filterArticles(allArticles, {
    ...DEFAULT_FILTERS,
    highRelevanceOnly: true,
  });
  assert.ok(highRel.length > 0);
  assert.ok(highRel.every((a) => a.exam_relevance === 'high'));

  // 6. Extract unique sources
  const sources = extractUniqueSources(allArticles);
  assert.ok(sources.includes('The Daily Star'));
  assert.ok(sources.includes('Dhaka Tribune'));
});
