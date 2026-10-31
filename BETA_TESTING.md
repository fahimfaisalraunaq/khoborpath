# Khoborpath – 1-week private beta

Everything here is free: GitHub (collector + data), Cloudflare Pages (app), Cloudflare Workers (AI quiz proxy), Gemini free tier.

## Day 0 – launch privately (≈30 min)
1. Follow **SETUP.md** steps 1–4 (GitHub repo, secrets, Worker, Cloudflare Pages).
2. In Cloudflare Pages → Settings → Environment variables, set:
   - `VITE_ARTICLES_URL` = raw URL of `data/articles.json`
   - `VITE_AI_PROXY_URL` = your Worker URL
   - `VITE_FEEDBACK_URL` = a Google Form link (free) or `https://wa.me/8801XXXXXXXXX`
   - leave `VITE_BETA=true` – shows the BETA badge and keeps Google from indexing the site.
3. GitHub → Actions → **Collect news** → **Run workflow**. Open the run log: every feed should print `OK`.
   Then open `data/health.json` in the repo to see per-feed status.
4. Open your `*.pages.dev` link on your own phone and install it (Settings screen shows the steps).
5. Share the link only with your testers (WhatsApp/Messenger). It is not listed anywhere.

## Checking the news is authentic
- Every card links to the original newspaper page – testers should tap "Read original" on a few each day.
- The collector only keeps links on the newspaper's own website, ignores items older than 90 days,
  and throws away AI summaries/facts containing numbers that are not in the original text
  (`ai_claims_rejected` in `data/health.json`).
- If the app ever shows a red **Demo mode** banner, it could not load real news – those samples are not real.
- Run `python collector/collector.py --check` on your PC any time to test every feed and print sample links.

## What to ask testers (put these in your Google Form)
1. Phone model + browser (e.g. Samsung A15 / Chrome, iPhone 12 / Safari)
2. Did it install to the home screen? Did it open offline?
3. Any article whose summary or key facts did not match the original? (paste link)
4. Any quiz question that was wrong or confusing?
5. Anything slow, broken, or cut off on screen?

## Phone support
Works on Android 8+ with up-to-date Chrome / Samsung Internet / Edge / Firefox, and iPhone/iPad on iOS 16.4+ (Safari).
Older iPhones (iOS 15 and below) will show broken styling – ask testers their iOS version.

## Going public after the week
Set `VITE_BETA=false` and `VITE_ROBOTS=index, follow` in Cloudflare Pages, then redeploy.
