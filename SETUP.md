# Khoborpath: deployment guide (all free)

## 1. Push to GitHub (public repo)
    git init && git add . && git commit -m "Khoborpath" 
    git remote add origin https://github.com/YOUR_USER/khoborpath.git && git push -u origin main
The repo must be public so the app can read `data/articles.json` from raw.githubusercontent.com.

## 2. Collector (GitHub Actions)
1. Get a free key at https://aistudio.google.com (Get API key).
2. Repo > Settings > Secrets and variables > Actions > New secret: `GEMINI_API_KEY`.
3. Repo > Settings > Actions > General > Workflow permissions: **Read and write**.
4. Actions tab > "Collect news" > Run workflow. Check the log for any `WARN no entries` lines
   and fix those feed URLs in `collector/feeds.json` (open each URL in a browser first).
5. It then runs every 6 hours automatically.

## 3. AI quiz proxy (Cloudflare Worker, optional but recommended)
1. dash.cloudflare.com > Workers & Pages > Create > Worker > paste `worker/worker.js` > Deploy.
2. Worker > Settings > Variables: add secret `GEMINI_API_KEY`, and variable `ALLOWED_ORIGIN`
   = your site URL from step 4 (no trailing slash), e.g. `https://khoborpath.pages.dev`.
3. Copy the worker URL (https://xxx.workers.dev).

## 4. Frontend (Cloudflare Pages)
1. Workers & Pages > Create > Pages > Connect to Git > select the repo.
2. Build command: `npm run build`   Output directory: `dist`
3. Environment variables (build):
   - `VITE_ARTICLES_URL` = https://raw.githubusercontent.com/YOUR_USER/khoborpath/main/data/articles.json
   - `VITE_AI_PROXY_URL` = your worker URL
   - `NODE_VERSION` = 22
4. Deploy. Then set the Worker's `ALLOWED_ORIGIN` to the final Pages URL.

## Local dev
    npm install
    cp .env.example .env.local   # edit values
    npm run dev


## Verified news feeds (checked 31 Oct 2026)
The Daily Star (editorial, Bangladesh, business), Prothom Alo English, Dhaka Tribune, The Business Standard (Bangladesh, economy), and Bonik Barta (বণিক বার্তা). Bonik Barta has no RSS, so the collector reads its daily news sitemap and the title/summary/photo from each article page.
bdnews24 and New Age no longer publish RSS, so they were removed. To add a paper, add a line to `collector/feeds.json`
and run `python collector/collector.py --check`.

Next: see **BETA_TESTING.md** for the 1-week private test.


## How fresh is the news?
The collector runs every hour (GitHub Actions, free), and the app re-checks every time you open it. So new articles usually appear within about 1 hour of the newspaper publishing them. To update right now: GitHub → Actions → Collect news → Run workflow.
