/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  Award,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { Article, Language, QuizQuestion } from '../types';
import { CONFIG } from '../config';
import { TRANSLATIONS } from '../lib/translations';
import { fetchOrGenerateQuiz } from '../lib/quizGenerator';

interface QuizScreenProps {
  article: Article | null;
  articles: Article[];
  language: Language;
  onSelectArticle: (article: Article) => void;
  onBackToArticle: () => void;
  onSaveQuizScore: (articleId: string, score: number, total: number) => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  article,
  articles,
  language,
  onSelectArticle,
  onBackToArticle,
  onSaveQuizScore,
}) => {
  const t = TRANSLATIONS[language];

  const [loading, setLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isOfflineGenerated, setIsOfflineGenerated] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Initialize or generate quiz questions when article changes
  const loadQuiz = useCallback(async (targetArticle: Article) => {
    setLoading(true);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsFinished(false);

    try {
      const res = await fetchOrGenerateQuiz(targetArticle, CONFIG.AI_PROXY_URL);
      setQuestions(res.questions);
      setIsOfflineGenerated(res.isOfflineGenerated);
    } catch (e) {
      console.warn('Quiz generation error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (article) {
      loadQuiz(article);
    }
  }, [article, loadQuiz]);

  const handleSelectOption = (idx: number) => {
    if (selectedAnswer !== null) return; // Answer already submitted

    setSelectedAnswer(idx);
    const currentQ = questions[currentIndex];
    const isCorrect = idx === currentQ.answerIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz finished
      setIsFinished(true);
      if (article) {
        onSaveQuizScore(article.id, score + (selectedAnswer === questions[currentIndex].answerIndex ? 0 : 0), questions.length);
      }
    }
  };

  const handleRetry = () => {
    if (article) {
      loadQuiz(article);
    }
  };

  // View A: No article selected -> picker list
  if (!article) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-24 lg:pb-16">
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#006A4E]/10 text-[#006A4E] dark:text-emerald-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
              {t.quiz.title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            {t.quiz.subtitle}
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider px-1">
            {t.quiz.selectArticleTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {articles.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectArticle(item)}
                className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-left hover:border-[#006A4E] dark:hover:border-emerald-600 transition shadow-xs group flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#006A4E] dark:text-emerald-400">
                    <span>{item.source}</span>
                    {item.exam_relevance === 'high' && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#F42A41]/10 text-[#F42A41] text-[10px]">
                        ★ High
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-[#006A4E] line-clamp-2">
                    {item.title}
                  </h3>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#006A4E] group-hover:translate-x-0.5 transition shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // View B: Loading state
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="inline-flex p-4 rounded-2xl bg-[#006A4E]/10 text-[#006A4E] animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          {t.quiz.generating}
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
          {article.title}
        </p>
      </div>
    );
  }

  // View C: Results Summary Screen
  if (isFinished) {
    const total = questions.length;
    const percent = Math.round((score / total) * 100);

    let evaluation = t.quiz.evaluationMedium;
    if (percent >= 80) evaluation = t.quiz.evaluationHigh;
    else if (percent < 50) evaluation = t.quiz.evaluationLow;

    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-24 lg:pb-16 text-center">
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6">
          <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-[#006A4E] dark:text-emerald-400">
            <Award className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100">
              {t.quiz.resultTitle}
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {article.title}
            </p>
          </div>

          {/* Score Circle Card */}
          <div className="p-6 rounded-2xl bg-[#006A4E]/5 dark:bg-emerald-950/20 border border-[#006A4E]/20 max-w-xs mx-auto space-y-1">
            <div className="text-4xl sm:text-5xl font-black text-[#006A4E] dark:text-emerald-400">
              {score} / {total}
            </div>
            <div className="text-sm font-bold text-stone-600 dark:text-stone-300">
              {percent}% Correct
            </div>
          </div>

          <p className="text-sm font-medium text-stone-700 dark:text-stone-300 max-w-md mx-auto leading-relaxed">
            {evaluation}
          </p>

          <div className="pt-4 flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#006A4E] text-white hover:bg-[#00543e] transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.quiz.retryQuiz}</span>
            </button>

            <button
              onClick={onBackToArticle}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 transition border border-stone-200 dark:border-stone-700"
            >
              <BookOpen className="w-4 h-4" />
              <span>{t.quiz.backToArticle}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View D: Question Active Screen
  const currentQ = questions[currentIndex] || {
    q: 'Question unavailable',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    answerIndex: 0,
    explanation: 'No explanation provided.',
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 lg:pb-16">
      {/* Top Header & Back */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBackToArticle}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.quiz.backToArticle}</span>
        </button>

        {/* Notice of Generator Type */}
        <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
          {isOfflineGenerated ? t.quiz.offlineBadge : t.quiz.aiBadge}
        </span>
      </div>

      {/* Progress Bar & Counter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-stone-600 dark:text-stone-400">
          <span>
            {t.quiz.questionCount
              .replace('{current}', String(currentIndex + 1))
              .replace('{total}', String(questions.length))}
          </span>
          <span>Score: {score}</span>
        </div>

        <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
          <div
            className="h-full bg-[#006A4E] transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-6">
        <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug">
          {currentQ.q}
        </h2>

        {/* 4 Answer Option Buttons */}
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === currentQ.answerIndex;
            const hasAnswered = selectedAnswer !== null;

            let btnStyle = 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200';
            let badgeStyle = 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300';

            if (hasAnswered) {
              if (isCorrect) {
                btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 font-semibold';
                badgeStyle = 'bg-emerald-600 text-white';
              } else if (isSelected && !isCorrect) {
                btnStyle = 'border-[#F42A41] bg-[#F42A41]/10 text-red-900 dark:text-red-200 font-semibold';
                badgeStyle = 'bg-[#F42A41] text-white';
              } else {
                btnStyle = 'opacity-50 border-stone-200 dark:border-stone-800';
              }
            }

            return (
              <button
                key={idx}
                disabled={hasAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-4 rounded-2xl border text-left transition flex items-start gap-3 min-h-[50px] ${btnStyle}`}
              >
                <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${badgeStyle}`}>
                  {optionLetters[idx]}
                </span>
                <span className="text-xs sm:text-sm leading-relaxed flex-1">
                  {opt}
                </span>
                {hasAnswered && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                {hasAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-[#F42A41] shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Instant Feedback & Explanation Card */}
        {selectedAnswer !== null && (
          <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 space-y-1.5 animate-fadeIn">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.quiz.explanationTitle}</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Action Button: Next Question or See Results */}
        {selectedAnswer !== null && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#006A4E] text-white hover:bg-[#00543e] transition shadow-sm"
            >
              <span>
                {currentIndex + 1 < questions.length ? t.quiz.nextQuestion : t.quiz.seeResults}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
