/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { isPlaceholderUrl } from '../config';
import { Article, QuizQuestion } from '../types';

/**
 * Generates 5 realistic multiple-choice questions from an article's key_facts and summary.
 * Designed deterministically for BCS candidates preparing for preliminary exams.
 */
export function generateFallbackQuestions(article: Article): QuizQuestion[] {
  const title = article.title || 'General Affairs';
  const facts = (article.key_facts && article.key_facts.length > 0)
    ? article.key_facts
    : [article.ai_summary || article.summary || 'Important national development topic.'];

  const questions: QuizQuestion[] = [];

  // Helper to safely format answer options
  const buildOptions = (
    correct: string,
    distractors: [string, string, string]
  ): { options: [string, string, string, string]; answerIndex: number } => {
    // Deterministic pseudo-shuffle based on title length
    const targetIdx = (title.length + questions.length) % 4;
    const opts: string[] = [...distractors];
    opts.splice(targetIdx, 0, correct);
    return {
      options: opts as [string, string, string, string],
      answerIndex: targetIdx,
    };
  };

  // Question 1: Core fact / primary finding
  const fact1 = facts[0] || 'National policy update';
  const q1Opts = buildOptions(
    fact1,
    [
      'Direct subsidies were abolished across all sectors without transition.',
      'All bilateral tariffs were raised uniformly by 25 percent.',
      'The initiative was deferred indefinitely pending constitutional debate.',
    ]
  );
  questions.push({
    id: `q-1-${article.id}`,
    q: `According to the analysis on "${title.slice(0, 75)}...", which of the following is highlighted as a primary finding or policy measure?`,
    options: q1Opts.options,
    answerIndex: q1Opts.answerIndex,
    explanation: `Accurate BCS point: ${fact1}`,
  });

  // Question 2: Second key fact or institutional role
  const fact2 = facts[1] || facts[0] || 'Institutional coordination framework';
  const q2Opts = buildOptions(
    fact2,
    [
      'A private commercial consortium was granted exclusive non-regulated jurisdiction.',
      'The policy operates outside of the existing constitutional oversight framework.',
      'All state audits and citizen monitoring provisions were permanently exempted.',
    ]
  );
  questions.push({
    id: `q-2-${article.id}`,
    q: `Which key institutional provision or structural observation is emphasized in relation to this topic?`,
    options: q2Opts.options,
    answerIndex: q2Opts.answerIndex,
    explanation: `Key syllabus fact: ${fact2}`,
  });

  // Question 3: Category relevance & policy objective
  const cat = article.categories[0] || 'Bangladesh Affairs';
  const fact3 = facts[2] || facts[0] || 'Sustainable reform roadmap';
  const q3Opts = buildOptions(
    `It directly impacts Bangladesh's ${cat} preparedness and strategic governance.`,
    [
      'It has no direct relevance to civil service or national administrative policy.',
      'It represents an obsolete historical protocol with no active regulatory force.',
      'It solely applies to extraterritorial maritime zones outside domestic law.',
    ]
  );
  questions.push({
    id: `q-3-${article.id}`,
    q: `Why is this development considered of high strategic importance for candidates studying ${cat}?`,
    options: q3Opts.options,
    answerIndex: q3Opts.answerIndex,
    explanation: `This topic is classified under ${cat}. Key factor: ${fact3}`,
  });

  // Question 4: Factual data / numeric / regulatory detail
  const fact4 = facts[3] || facts[1] || facts[0] || 'International compliance';
  const q4Opts = buildOptions(
    fact4,
    [
      'The timeline was compressed to 7 days without stakeholder consultation.',
      'The international donor agency cancelled all committed funding.',
      'The framework was rejected unanimously by parliamentary oversight.',
    ]
  );
  questions.push({
    id: `q-4-${article.id}`,
    q: `Regarding the operational roadmap or compliance targets, which statement is true?`,
    options: q4Opts.options,
    answerIndex: q4Opts.answerIndex,
    explanation: `Verified context: ${fact4}`,
  });

  // Question 5: Analytical inference for written / viva exams
  const summarySnippet = (article.ai_summary || article.summary || title).slice(0, 120);
  const q5Opts = buildOptions(
    `Comprehensive institutional reform combining policy coordination and long-term sustainability.`,
    [
      `Ignoring environmental and economic spillover effects completely.`,
      `Solely relying on short-term discretionary circulars without statutory backing.`,
      `Decentralizing all national security infrastructures to unverified third parties.`,
    ]
  );
  questions.push({
    id: `q-5-${article.id}`,
    q: `What is the core takeaway or policy implication derived from this editorial analysis?`,
    options: q5Opts.options,
    answerIndex: q5Opts.answerIndex,
    explanation: `Core insight: "${summarySnippet}..." - requires balanced policy coordination and statutory alignment.`,
  });

  return questions;
}

/**
 * Requests 5 multiple choice questions from AI_PROXY_URL, or safely falls back to local generation.
 */
export async function fetchOrGenerateQuiz(
  article: Article,
  aiProxyUrl?: string
): Promise<{ questions: QuizQuestion[]; isOfflineGenerated: boolean }> {
  // If no valid proxy is configured, immediately generate offline questions
  if (!aiProxyUrl || isPlaceholderUrl(aiProxyUrl)) {
    return {
      questions: generateFallbackQuestions(article),
      isOfflineGenerated: true,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(aiProxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: article.title,
        summary: article.summary,
        ai_summary: article.ai_summary,
        key_facts: article.key_facts || [],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Proxy responded with status ${response.status}`);
    }

    const data = await response.json();

    if (
      data &&
      Array.isArray(data.questions) &&
      data.questions.length >= 3 &&
      data.questions.every(
        (q: QuizQuestion) =>
          typeof q.q === 'string' &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          typeof q.answerIndex === 'number'
      )
    ) {
      return {
        questions: data.questions.slice(0, 5),
        isOfflineGenerated: false,
      };
    }

    throw new Error('Invalid quiz response schema from AI proxy');
  } catch (err) {
    // Non-blocking fallback
    console.warn('AI proxy unavailable or timed out, using built-in question engine:', err);
    return {
      questions: generateFallbackQuestions(article),
      isOfflineGenerated: true,
    };
  }
}
