# Khoborpath (খবরপাঠ)
> *Read the news. Ace the exam.*

Khoborpath is a mobile-first web app designed for Bangladeshi candidates preparing for competitive government job examinations, including the Bangladesh Civil Service (BCS), Bangladesh Bank Officer recruitment, and ministry exams. It transforms daily newspaper editorials and contemporary affairs into organized, high-yield study material.

---

## 🚀 Quick Setup & Configuration

All remote endpoints and application settings are configured in a single file: `src/config.ts`.

```typescript
// src/config.ts
export const CONFIG = {
  // 1. Remote raw JSON feed containing daily articles
  ARTICLES_URL: 'https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/data/articles.json',

  // 2. Optional AI proxy URL for custom dynamic question generation
  AI_PROXY_URL: '',

  // Cache duration in minutes for local storage cache
  CACHE_TTL_MINUTES: 60,

  VERSION: '1.0.0',
};
```

### 1. Connecting Your Own Article Feed (`ARTICLES_URL`)
You can host your daily scraped or curated articles anywhere that returns a JSON array (e.g., GitHub raw files, Cloudflare Workers, Supabase storage, or an Express proxy).

If `ARTICLES_URL` is empty, unreachable, or contains the placeholder string, Khoborpath **automatically falls back to a built-in offline archive of 12 comprehensive sample articles** (`src/data/sampleArticles.ts`), ensuring the app is always functional.

#### Article JSON Schema (`articles.json`)
```json
[
  {
    "id": "art-001",
    "source": "The Daily Star",
    "title": "Constitutional Reform Roadmap: Rebalancing State Power and Judicial Autonomy",
    "link": "https://www.thedailystar.net/opinion/views/editorial-constitutional-reforms",
    "summary": "Full editorial or report summary...",
    "ai_summary": "Concise key analytical takeaways...",
    "key_facts": [
      "Key memorization point 1 with dates, articles, or figures.",
      "Key memorization point 2."
    ],
    "categories": ["Bangladesh Affairs", "Governance & Law"],
    "is_editorial": true,
    "exam_relevance": "high",
    "published": "2026-10-31T06:30:00Z"
  }
]
```

**Allowed Categories:**
- `Bangladesh Affairs` (বাংলাদেশ বিষয়াবলী)
- `International Affairs` (আন্তর্জাতিক বিষয়াবলী)
- `Economy` (অর্থনীতি)
- `Environment & Climate` (পরিবেশ ও জলবায়ু)
- `Science & Tech` (বিজ্ঞান ও প্রযুক্তি)
- `Governance & Law` (সুশাসন ও আইন)
- `General` (সাধারণ)

---

### 2. Setting Up the AI Proxy (`AI_PROXY_URL`)
Khoborpath includes a built-in offline question generator that creates 5 multiple-choice questions from the article's key facts and analytical context.

If you have a server-side proxy route powered by Gemini or another LLM:
1. Provide the URL in `CONFIG.AI_PROXY_URL` in `src/config.ts`.
2. Khoborpath will send a `POST` request with the following JSON payload:
   ```json
   {
     "title": "Article Title",
     "summary": "Article full summary...",
     "ai_summary": "Executive summary...",
     "key_facts": ["Fact 1", "Fact 2"]
   }
   ```
3. Your proxy should respond with:
   ```json
   {
     "questions": [
       {
         "q": "What is the primary finding regarding judicial collegiums?",
         "options": [
           "Option A",
           "Option B",
           "Option C",
           "Option D"
         ],
         "answerIndex": 0,
         "explanation": "Detailed syllabus explanation..."
       }
     ]
   }
   ```
4. **Security Notice**: Never hardcode API keys directly in client-side code. Always pass calls through a secured proxy. If your proxy is down or times out (>6s), Khoborpath gracefully falls back to the built-in generator.

---

## 🌟 Key Features

1. **Feed (Home)**:
   - Search across headline, analytical digest, and facts.
   - Filter by multi-select category, source, date range (Today, 7 days, 30 days, All), Editorials-only, and High-relevance.
   - Visual badges: Exam Relevance (High = red, Medium = amber, Low = grey), Editorial tag, Read status, Bookmarks.
   - Pagination (20 per page).

2. **Article Detail**:
   - Executive AI digest and full report summary.
   - Interactive **"Key facts to memorize" checklist** (candidates can check off facts as they review).
   - "Read original" external link.
   - Auto-saving **Personal Study Notes** stored locally in `localStorage`.
   - Direct "Quiz me" button.

3. **Daily Digest**:
   - High and medium relevance articles grouped by subject.
   - **"Copy Digest for Study Group"**: Copies clean formatted plain text ready to share directly in WhatsApp or Telegram candidate study groups.

4. **Saved (Bookmarks)**:
   - Bookmarked articles with category filters.
   - Inline notes preview.
   - **"Export Notes (.txt)"**: Downloads all saved bookmarks, key facts, and personal candidate study notes as a `.txt` file.

5. **Practice Quiz**:
   - 5 exam questions per article.
   - Instant visual feedback upon option selection with full BCS syllabus explanations.
   - Final score percentage, candidate evaluation, and local best score saving.

6. **Study Tracker & Progress**:
   - Daily reading streak counter (`🔥`).
   - Weekly articles read indicator.
   - Average quiz performance.
   - Category coverage distribution bar chart.

7. **Bilingual UI & Ergonomics**:
   - Full English and বাংলা translation toggle.
   - Theme options: Light, Dark, and System default.
   - Reading font size toggle: Small (14px), Medium (16px), Large (18px).
   - PWA Install prompt and iOS Safari instructions.
