/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Article, TabType } from './types';
import { useArticles } from './hooks/useArticles';
import { useStudyStore } from './hooks/useStudyStore';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { FeedScreen } from './components/FeedScreen';
import { ArticleDetailScreen } from './components/ArticleDetailScreen';
import { DailyDigestScreen } from './components/DailyDigestScreen';
import { SavedScreen } from './components/SavedScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { SettingsScreen } from './components/SettingsScreen';

export default function App() {
  const {
    articles,
    isLoading,
    isFallback,
    lastUpdatedTime,
    errorMessage,
    refreshArticles,
  } = useArticles();

  const {
    bookmarks,
    readArticleIds,
    notes,
    quizScores,
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
  } = useStudyStore();

  const [currentTab, setCurrentTab] = useState<TabType>('feed');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [previousTab, setPreviousTab] = useState<TabType>('feed');

  // Navigate to article detail
  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
    setPreviousTab(currentTab === 'detail' ? 'feed' : currentTab);
    setCurrentTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back from Article Detail
  const handleBackFromDetail = () => {
    setCurrentTab(previousTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Card Bookmark Toggle with event stop propagation
  const handleCardBookmarkToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(id);
  };

  // Card Remove Bookmark
  const handleRemoveBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(id);
  };

  // Text size class mapping for reading comfort
  const textSizeClass = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  }[textSize];

  return (
    <div className={`min-h-screen flex flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100 transition-colors ${textSizeClass}`}>
      {/* Top Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeChange={setTheme}
        streakDays={userStreak.currentStreak}
        onNavigateHome={() => {
          setCurrentTab('feed');
          setSelectedArticle(null);
        }}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation (Sidebar on Desktop, Bottom bar on Mobile) */}
        <Navigation
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          language={language}
          savedCount={bookmarks.length}
        />

        {/* Content View Container */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pb-8" id="main-content">
          {currentTab === 'feed' && (
            <FeedScreen
              articles={articles}
              isLoading={isLoading}
              isFallback={isFallback}
              lastUpdatedTime={lastUpdatedTime}
              errorMessage={errorMessage}
              onRefresh={refreshArticles}
              language={language}
              onSelectArticle={handleSelectArticle}
              isBookmarked={isBookmarked}
              isRead={isRead}
              onToggleBookmark={handleCardBookmarkToggle}
            />
          )}

          {currentTab === 'detail' && selectedArticle && (
            <ArticleDetailScreen
              article={selectedArticle}
              language={language}
              onBack={handleBackFromDetail}
              isBookmarked={isBookmarked(selectedArticle.id)}
              onToggleBookmark={() => toggleBookmark(selectedArticle.id)}
              isRead={isRead(selectedArticle.id)}
              onToggleRead={() => toggleRead(selectedArticle.id)}
              savedNote={getNote(selectedArticle.id)}
              onSaveNote={(text) => saveNote(selectedArticle.id, text)}
              isFactChecked={(fact) => isFactChecked(selectedArticle.id, fact)}
              onToggleFactCheck={(fact) => toggleFactCheck(selectedArticle.id, fact)}
            />
          )}

          {currentTab === 'digest' && (
            <DailyDigestScreen
              articles={articles}
              language={language}
              onSelectArticle={handleSelectArticle}
            />
          )}

          {currentTab === 'saved' && (
            <SavedScreen
              articles={articles}
              bookmarks={bookmarks}
              notes={notes}
              language={language}
              onSelectArticle={handleSelectArticle}
              onRemoveBookmark={handleRemoveBookmark}
              onNavigateFeed={() => setCurrentTab('feed')}
            />
          )}

          {currentTab === 'progress' && (
            <ProgressScreen
              articles={articles}
              readArticleIds={readArticleIds}
              quizScores={quizScores}
              userStreak={userStreak}
              language={language}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsScreen
              language={language}
              onLanguageChange={setLanguage}
              theme={theme}
              onThemeChange={setTheme}
              textSize={textSize}
              onTextSizeChange={setTextSize}
              onClearAllData={clearAllData}
              cachedCount={articles.length}
            />
          )}
        </main>
      </div>
    </div>
  );
}
