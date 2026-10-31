/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const TRANSLATIONS = {
  en: {
    appName: 'Khoborpath',
    appBengaliName: 'খবরপাঠ',
    tagline: 'Read the news. Ace the exam.',
    heroSubtitle: 'Transforming daily newspaper editorials & affairs into organized study material for BCS and government job exams.',
    
    // Navigation
    tabs: {
      feed: 'Feed',
      digest: 'Daily Digest',
      saved: 'Saved',
      quiz: 'Quiz',
      progress: 'Progress',
      settings: 'Settings',
    },

    // Badges & Relevance
    relevance: {
      high: 'High BCS Relevance',
      medium: 'Medium Relevance',
      low: 'Low Relevance',
    },
    editorialBadge: 'Editorial',
    newsBadge: 'News',
    readStatus: 'Read',
    unreadStatus: 'Unread',

    // Feed screen
    feed: {
      searchPlaceholder: 'Search by headline, topic, or keyword...',
      filterButton: 'Filters',
      categoriesLabel: 'Categories',
      allCategories: 'All Categories',
      sourcesLabel: 'Newspaper Source',
      allSources: 'All Newspapers',
      dateRangeLabel: 'Date Range',
      dateRanges: {
        all: 'All Time',
        today: 'Today',
        '7days': 'Last 7 Days',
        '30days': 'Last 30 Days',
      },
      editorialsOnly: 'Editorials only',
      highRelevanceOnly: 'High relevance only',
      clearFilters: 'Clear filters',
      showingResults: 'Showing {count} of {total} articles',
      noResults: 'No articles match your selected filters.',
      noResultsAction: 'Reset your filters or try a different search keyword.',
      loadMore: 'Load more articles',
      allLoaded: 'You have caught up with all articles for now.',
      refresh: 'Refresh feed',
      lastUpdated: 'Last updated: {time}',
      fallbackNotice: 'Could not reach the news server. Showing the last downloaded news (or demo articles if none). Tap Retry when online.',
    },

    // Article detail
    detail: {
      back: 'Back to feed',
      publishedOn: 'Published on',
      keyFactsTitle: 'Key Facts to Memorize',
      keyFactsHint: 'Check off facts as you memorize them for revision.',
      factsMemorized: '{checked} of {total} facts memorized',
      readOriginal: 'Read Original Article',
      markRead: 'Mark as Read',
      markUnread: 'Mark as Unread',
      bookmark: 'Bookmark',
      bookmarked: 'Bookmarked',
      quizMe: 'Quiz Me on This Article',
      personalNotesTitle: 'Personal Study Notes',
      personalNotesPlaceholder: 'Write your own analytical summary, BCS viva arguments, or mnemonic notes here... (Saved automatically)',
      notesSaved: 'Note saved locally',
      bestScore: 'Best Quiz Score: {score}/{total}',
    },

    // Daily digest
    digest: {
      title: 'Daily Editorial Digest',
      subtitle: 'High & Medium relevance editorial insights categorized for fast morning revision.',
      copyDigest: 'Copy Digest for Study Group',
      copiedSuccess: 'Digest copied to clipboard!',
      copyFailed: 'Could not copy to clipboard.',
      emptyDigest: 'No high-priority articles recorded today. Check back with tomorrow’s morning edition.',
      totalArticlesCount: '{count} curated exam-focused topics today',
    },

    // Saved
    saved: {
      title: 'Saved Articles & Study Notes',
      subtitle: 'Review your bookmarked articles and personal revision notes.',
      emptyTitle: 'No saved articles yet',
      emptySubtitle: 'Bookmark articles from the feed or digest to build your high-yield revision library.',
      exploreFeed: 'Browse Feed',
      exportNotes: 'Export Notes (.txt)',
      exportSuccess: 'Exported notes downloaded!',
      notesExcerpt: 'Note:',
      removeBookmark: 'Remove bookmark',
      filterByCategory: 'Filter by category',
    },

    // Quiz
    quiz: {
      title: 'BCS Exam Practice Quiz',
      subtitle: 'Test your retention of facts, economic indicators, and governance policies.',
      selectArticleTitle: 'Choose an article to quiz on:',
      generating: 'Preparing 5 exam questions...',
      offlineBadge: 'Generated with built-in BCS question engine',
      aiBadge: 'Generated via AI Proxy',
      questionCount: 'Question {current} of {total}',
      selectAnswerPrompt: 'Select the most accurate option:',
      explanationTitle: 'BCS Exam Explanation:',
      nextQuestion: 'Next Question',
      seeResults: 'See Results',
      resultTitle: 'Quiz Complete!',
      scoreCard: 'You scored {score} out of {total} ({percent}%)',
      evaluationHigh: 'Excellent work! You have strong mastery of this topic.',
      evaluationMedium: 'Good effort! Review the key facts checklist to lock in details.',
      evaluationLow: 'Needs revision. Re-read the article summary and retry.',
      retryQuiz: 'Retry Quiz',
      backToArticle: 'Back to Article',
      practiceMore: 'Practice Another Quiz',
    },

    // Progress
    progress: {
      title: 'My Study Tracker',
      subtitle: 'Monitor your reading consistency, retention scores, and syllabus coverage.',
      streakTitle: 'Daily Reading Streak',
      streakDays: '{days} Days',
      streakSub: 'Active revision habit',
      weeklyReadTitle: 'Articles Read This Week',
      weeklyTarget: '{count} read (Target: 10)',
      quizAvgTitle: 'Average Quiz Score',
      quizAvgSub: '{count} quizzes completed',
      coverageChartTitle: 'Reading Distribution by Category',
      coverageChartSubtitle: 'Ensure balanced coverage across Bangladesh Affairs, International, and Economy.',
      noReadData: 'Start reading articles to view your category coverage chart.',
    },

    // Settings
    settings: {
      title: 'Preferences & Configuration',
      subtitle: 'Customize reading preferences and review data sync settings.',
      languageTitle: 'Language / ভাষা',
      themeTitle: 'Theme Mode',
      themes: {
        light: 'Light',
        dark: 'Dark',
        system: 'System Default',
      },
      textSizeTitle: 'Reading Text Size',
      textSizes: {
        sm: 'Compact (Small)',
        base: 'Standard (Medium)',
        lg: 'Comfortable (Large)',
      },
      dataConfigTitle: 'Data & Sync Configuration',
      articlesUrlLabel: 'Articles Feed URL',
      aiProxyUrlLabel: 'AI Proxy Endpoint',
      statusConnected: 'Connected',
      statusFallback: 'Using Built-in Sample Dataset (12 articles)',
      cacheStatus: 'Cached articles: {count}',
      clearDataTitle: 'Data Management',
      clearDataDesc: 'Reset all bookmarks, read statuses, personal notes, and quiz history from this device.',
      clearDataButton: 'Clear All Local Data',
      confirmClearTitle: 'Are you sure?',
      confirmClearMessage: 'This will erase all your saved notes, quiz scores, and reading bookmarks permanently. This action cannot be undone.',
      confirmClearBtn: 'Yes, Clear Everything',
      cancelBtn: 'Cancel',
      clearSuccess: 'All local study data cleared successfully.',
      setupHelpTitle: 'How to Connect Your Custom Feed',
      setupHelpDesc: 'Khoborpath is designed to read any JSON feed hosted on GitHub, Cloudflare, or your custom server.',
      installPwaTitle: 'Install Khoborpath PWA',
      installPwaDesc: 'Install on your device for fast access and offline reading without browser bars.',
      installBtn: 'Install Khoborpath App',
      installedBadge: 'Installed as App',
    },

    // Common
    common: {
      close: 'Close',
      open: 'Open',
      cancel: 'Cancel',
      share: 'Share',
      copied: 'Copied!',
      learnMore: 'Learn More',
      offline: 'You are currently offline. Showing cached material.',
      minsAgo: '{m}m ago',
      hoursAgo: '{h}h ago',
      yesterday: 'Yesterday',
      daysAgo: '{d}d ago',
    },
  },

  bn: {
    appName: 'খবরপাঠ',
    appBengaliName: 'Khoborpath',
    tagline: 'পত্রিকা পড়ুন। পরীক্ষায় এগিয়ে থাকুন।',
    heroSubtitle: 'দৈনিক সংবাদপত্রের সম্পাদকীয় ও গুরুত্বপূর্ণ বিষয়াবলীকে বিসিএস এবং সরকারি চাকরির সুসংগঠিত প্রস্তুতিতে রূপান্তর করুন।',

    // Navigation
    tabs: {
      feed: 'ফিড',
      digest: 'দৈনিক ডাইজেস্ট',
      saved: 'সংরক্ষিত',
      quiz: 'কুইজ',
      progress: 'অগ্রগতি',
      settings: 'সেটিংস',
    },

    // Badges & Relevance
    relevance: {
      high: 'বিসিএস পরীক্ষার জন্য গুরুত্বপূর্ণ',
      medium: 'মাঝারি গুরুত্ব',
      low: 'সাধারণ প্রাসঙ্গিকতা',
    },
    editorialBadge: 'সম্পাদকীয়',
    newsBadge: 'সংবাদ',
    readStatus: 'পড়া হয়েছে',
    unreadStatus: 'অপঠিত',

    // Feed screen
    feed: {
      searchPlaceholder: 'শিরোনাম, বিষয় বা কি-ওয়ার্ড দিয়ে খুঁজুন...',
      filterButton: 'ফিল্টার',
      categoriesLabel: 'বিষয়শ্রেণী',
      allCategories: 'সকল বিষয়',
      sourcesLabel: 'সংবাদপত্র',
      allSources: 'সকল পত্রিকা',
      dateRangeLabel: 'সময়সীমা',
      dateRanges: {
        all: 'সব সময়',
        today: 'আজকের',
        '7days': 'গত ৭ দিন',
        '30days': 'গত ৩০ দিন',
      },
      editorialsOnly: 'কেবল সম্পাদকীয়',
      highRelevanceOnly: 'কেবল অতি-গুরুত্বপূর্ণ',
      clearFilters: 'ফিল্টার মুছুন',
      showingResults: '{total} টির মধ্যে {count} টি নিবন্ধ দেখানো হচ্ছে',
      noResults: 'আপনার নির্বাচিত ফিল্টারের সাথে কোনো নিবন্ধ মেলেনি।',
      noResultsAction: 'ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।',
      loadMore: 'আরও দেখুন',
      allLoaded: 'সবগুলো নিবন্ধ দেখা সম্পন্ন হয়েছে।',
      refresh: 'ফিড রিফ্রেশ',
      lastUpdated: 'সর্বশেষ আপডেট: {time}',
      fallbackNotice: 'সংবাদ সার্ভারে সংযোগ করা যায়নি। সর্বশেষ ডাউনলোড করা খবর (না থাকলে ডেমো নিবন্ধ) দেখানো হচ্ছে।',
    },

    // Article detail
    detail: {
      back: 'ফিরে যান',
      publishedOn: 'প্রকাশের তারিখ',
      keyFactsTitle: 'মুখস্থ রাখার মতো গুরুত্বপূর্ণ তথ্যসমূহ',
      keyFactsHint: 'রিভিশনের সুবিধার্থে মুখস্থ হওয়ার পর টিক চিহ্ন দিন।',
      factsMemorized: '{total} টির মধ্যে {checked} টি তথ্য আয়ত্ত করা হয়েছে',
      readOriginal: 'মূল প্রতিবেদন পড়ুন',
      markRead: 'পড়া হয়েছে চিহ্নিত করুন',
      markUnread: 'অপঠিত চিহ্নিত করুন',
      bookmark: 'বুকমার্ক',
      bookmarked: 'বুকমার্কড',
      quizMe: 'এই বিষয়ে কুইজ দিন',
      personalNotesTitle: 'ব্যক্তিগত পড়ার নোট',
      personalNotesPlaceholder: 'আপনার বিশ্লেষণধর্মী নোট, ভাইভা পয়েন্ট বা শর্টকাট কৌশল লিখে রাখুন... (স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে)',
      notesSaved: 'নোট সংরক্ষিত হয়েছে',
      bestScore: 'সর্বোচ্চ স্কোর: {score}/{total}',
    },

    // Daily digest
    digest: {
      title: 'দৈনিক সম্পাদকীয় ডাইজেস্ট',
      subtitle: 'দ্রুত সকালের রিভিশনের জন্য সাজানো গুরুত্বপূর্ণ সম্পাদকীয় ও বিশ্লেষণ।',
      copyDigest: 'স্টাডি গ্রুপের জন্য কপি করুন',
      copiedSuccess: 'ডাইজেস্ট ক্লিপবোর্ডে কপি করা হয়েছে!',
      copyFailed: 'ক্লিপবোর্ডে কপি করা সম্ভব হয়নি।',
      emptyDigest: 'আজকের কোনো উচ্চ-গুরুত্বপূর্ণ নিবন্ধ পাওয়া যায়নি।',
      totalArticlesCount: 'আজকের নির্বাচিত {count} টি বিষয়ের সারসংক্ষেপ',
    },

    // Saved
    saved: {
      title: 'সংরক্ষিত বিষয় ও নোটস',
      subtitle: 'আপনার বুকমার্ক করা নিবন্ধ এবং ব্যক্তিগত স্টাডি নোট পুনরায় দেখুন।',
      emptyTitle: 'এখনো কোনো নিবন্ধ সংরক্ষিত নেই',
      emptySubtitle: 'ফিড বা ডাইজেস্ট থেকে গুরুত্বপূর্ণ সম্পাদকীয় বুকমার্ক করে নিজস্ব লাইব্রেরি গড়ে তুলুন।',
      exploreFeed: 'ফিড দেখুন',
      exportNotes: 'নোটস এক্সপোর্ট (.txt)',
      exportSuccess: 'নোটস ফাইল ডাউনলোড সম্পন্ন হয়েছে!',
      notesExcerpt: 'নোট:',
      removeBookmark: 'বুকমার্ক সরান',
      filterByCategory: 'বিষয় অনুযায়ী ফিল্টার',
    },

    // Quiz
    quiz: {
      title: 'বিসিএস প্রস্তুতি কুইজ',
      subtitle: 'তথ্য, অর্থনৈতিক সূচক এবং শাসন কাঠামোর ওপর নিজের প্রস্তুতি যাচাই করুন।',
      selectArticleTitle: 'যে নিবন্ধের ওপর পরীক্ষা দিতে চান নির্বাচন করুন:',
      generating: '৫টি বহুনির্বাচনী প্রশ্ন তৈরি হচ্ছে...',
      offlineBadge: 'বিল্ট-ইন বিসিএস প্রশ্ন জেনারেটর',
      aiBadge: 'এআই প্রক্সি সংযোগ',
      questionCount: 'প্রশ্ন {current} / {total}',
      selectAnswerPrompt: 'সঠিক উত্তরটি নির্বাচন করুন:',
      explanationTitle: 'ব্যাখ্যা ও প্রয়োজনীয় তথ্য:',
      nextQuestion: 'পরবর্তী প্রশ্ন',
      seeResults: 'ফলাফল দেখুন',
      resultTitle: 'কুইজ সম্পন্ন হয়েছে!',
      scoreCard: 'আপনি {total} এর মধ্যে {score} পেয়েছেন ({percent}%)',
      evaluationHigh: 'চমৎকার প্রস্তুতি! বিসিএস প্রিলিমিনারির জন্য এটি খুবই প্রশংসনীয়।',
      evaluationMedium: 'ভালো প্রচেষ্টা! আরও দৃঢ় করতে তথ্যগুলো পুনরায় রিভিশন দিন।',
      evaluationLow: 'আরও প্রস্তুতি প্রয়োজন। নিবন্ধের সারসংক্ষেপ ও তথ্যগুলো আবার পড়ুন।',
      retryQuiz: 'পুনরায় কুইজ দিন',
      backToArticle: 'নিবন্ধে ফিরে যান',
      practiceMore: 'অন্য নিবন্ধ থেকে পরীক্ষা দিন',
    },

    // Progress
    progress: {
      title: 'পড়ার অগ্রগতি ও ট্র্যাকার',
      subtitle: 'নিয়মিত পড়ার অভ্যাস, বিষয়ভিত্তিক বিস্তার ও রিটেনশন রেট পর্যবেক্ষণ করুন।',
      streakTitle: 'ধারাবাহিক পড়ার স্ট্রিক',
      streakDays: '{days} দিন',
      streakSub: 'দৈনিক পড়ার অভ্যাস',
      weeklyReadTitle: 'এই সপ্তাহে পঠিত নিবন্ধ',
      weeklyTarget: '{count} টি পড়া হয়েছে (লক্ষ্য: ১০)',
      quizAvgTitle: 'কুইজ গড় স্কোর',
      quizAvgSub: '{count} টি কুইজ দেওয়া হয়েছে',
      coverageChartTitle: 'বিষয়ভিত্তিক পড়ার বিস্তার',
      coverageChartSubtitle: 'বাংলাদেশ, আন্তর্জাতিক ও অর্থনীতি বিষয়ের মধ্যে ভারসাম্য বজায় রাখুন।',
      noReadData: 'বিষয়ভিত্তিক গ্রাফ দেখতে নিবন্ধ পড়া শুরু করুন।',
    },

    // Settings
    settings: {
      title: 'পছন্দসমূহ ও কনফিগারেশন',
      subtitle: 'অ্যাপের ভাষা, থিম এবং ডেটা সমন্বয় নিয়ন্ত্রণ করুন।',
      languageTitle: 'ভাষা / Language',
      themeTitle: 'থিম মোড',
      themes: {
        light: 'লাইট',
        dark: 'ডার্ক',
        system: 'সিস্টেম ডিফল্ট',
      },
      textSizeTitle: 'পড়ার লেখার আকার',
      textSizes: {
        sm: 'ছোট (Small)',
        base: 'সাধারণ (Medium)',
        lg: 'বড় (Large)',
      },
      dataConfigTitle: 'ডেটা ও সিঙ্ক তথ্য',
      articlesUrlLabel: 'নিবন্ধের ফিড লিঙ্ক (ARTICLES_URL)',
      aiProxyUrlLabel: 'এআই প্রক্সি লিঙ্ক (AI_PROXY_URL)',
      statusConnected: 'সংযুক্ত',
      statusFallback: 'নমুনা তথ্যভাণ্ডার ব্যবহার হচ্ছে (১২টি নিবন্ধ)',
      cacheStatus: 'ক্যাশড নিবন্ধ: {count} টি',
      clearDataTitle: 'ডেটা ব্যবস্থাপনা',
      clearDataDesc: 'এই ডিভাইস থেকে সমস্ত বুকমার্ক, পড়ার ইতিহাস, নোটস ও কুইজ স্কোর মুছে ফেলুন।',
      clearDataButton: 'সমস্ত লোকাল ডেটা মুছে ফেলুন',
      confirmClearTitle: 'আপনি কি নিশ্চিত?',
      confirmClearMessage: 'এর ফলে আপনার সকল সংরক্ষিত নোট, কুইজ রেকর্ড এবং পড়ার তালিকা চিরতরে মুছে যাবে। এটি আর ফিরিয়ে আনা সম্ভব নয়।',
      confirmClearBtn: 'হ্যাঁ, সব মুছে ফেলুন',
      cancelBtn: 'বাতিল',
      clearSuccess: 'সকল লোকাল ডেটা সফলভাবে মুছে ফেলা হয়েছে।',
      setupHelpTitle: 'কীভাবে নিজস্ব ফিড যুক্ত করবেন',
      setupHelpDesc: 'খবরপাঠ যেকোনো গিটহাব বা সার্ভারে সংরক্ষিত JSON ফিড সরাসরি পাঠ করতে সক্ষম।',
      installPwaTitle: 'খবরপাঠ অ্যাপ ইনস্টল করুন',
      installPwaDesc: 'ব্রাউজার ছাড়াই দ্রুত অফলাইনে ব্যবহারের জন্য হোমস্ক্রিনে অ্যাপ হিসেবে যুক্ত করুন।',
      installBtn: 'অ্যাপ ইনস্টল করুন',
      installedBadge: 'অ্যাপ হিসেবে ইনস্টল করা আছে',
    },

    // Common
    common: {
      close: 'বন্ধ করুন',
      open: 'খুলুন',
      cancel: 'বাতিল',
      share: 'শেয়ার',
      copied: 'কপি হয়েছে!',
      learnMore: 'বিস্তারিত',
      offline: 'আপনি অফলাইনে আছেন। সংরক্ষিত তথ্য প্রদর্শিত হচ্ছে।',
      minsAgo: '{m} মিনিট আগে',
      hoursAgo: '{h} ঘণ্টা আগে',
      yesterday: 'গতকাল',
      daysAgo: '{d} দিন আগে',
    },
  },
};

/**
 * Category names in Bengali for nice display
 */
export const CATEGORY_NAMES_BN: Record<string, string> = {
  'Bangladesh Affairs': 'বাংলাদেশ বিষয়াবলী',
  'International Affairs': 'আন্তর্জাতিক বিষয়াবলী',
  'Economy': 'অর্থনীতি',
  'Environment & Climate': 'পরিবেশ ও জলবায়ু',
  'Science & Tech': 'বিজ্ঞান ও প্রযুক্তি',
  'Governance & Law': 'সুশাসন ও আইন',
  'General': 'সাধারণ',
};
