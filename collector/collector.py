"""
Khoborpath collector: newspaper RSS -> verified, categorized -> data/articles.json

Run locally:
    pip install -r collector/requirements.txt
    python collector/collector.py            # collect + save
    python collector/collector.py --check    # test every feed, print samples, save nothing

Optional env: GEMINI_API_KEY (free key from aistudio.google.com), GEMINI_MODEL

Authenticity rules (every article in the app must trace back to a real newspaper page):
  * Only feeds listed in collector/feeds.json are read.
  * An article is kept only if its link is on the same website as the feed.
  * Items older than KEEP_DAYS are ignored (catches dead/abandoned feeds).
  * AI output never replaces the original title, link or text. AI "key facts" and summaries
    are dropped if they contain any number that does not appear in the original article text.
"""
import hashlib, html, json, os, re, sys, time
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import urlparse

import feedparser
import requests

ROOT = Path(__file__).resolve().parent.parent
FEEDS_FILE = Path(os.getenv("FEEDS_FILE", ROOT / "collector" / "feeds.json"))
DATA_DIR = Path(os.getenv("DATA_DIR", ROOT / "data"))
DATA_FILE = DATA_DIR / "articles.json"
HEALTH_FILE = DATA_DIR / "health.json"

MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")  # verify current free-tier model name in AI Studio
API_KEY = os.getenv("GEMINI_API_KEY")
MAX_AI_CALLS_PER_RUN = 10   # per run; runs hourly, so ~240/day max, within the free tier
KEEP_DAYS = 90
MAX_ARTICLES = 1500
UA = ("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/130.0 Mobile Safari/537.36 KhoborpathBot/1.0")

# Must match the Category type in src/types.ts
CATEGORIES = {
    "Bangladesh Affairs": ["bangladesh", "dhaka", "padma", "liberation", "upazila", "district", "ঢাকা", "বাংলাদেশ", "জাতীয় সংসদ"],
    "International Affairs": ["united nations", "india", "china", "usa", " us ", "russia", "gaza", "rohingya", "asean", "saarc", "myanmar", "ukraine", "foreign"],
    "Economy": ["gdp", "inflation", "budget", "bank", "export", "remittance", "tax", "imf", "world bank", "rmg", "profit", "tk ", "ব্যাংক", "অর্থনীতি", "বাজেট", "রফতানি", "রেমিট্যান্স", "মূল্যস্ফীতি", "শেয়ার", "টাকা"],
    "Environment & Climate": ["climate", "flood", "cyclone", "pollution", "carbon", "sundarbans", "green", "জলবায়ু", "বন্যা", "ঘূর্ণিঝড়"],
    "Science & Tech": ["technology", "digital", "space", "internet", "cyber", "artificial intelligence", " ai "],
    "Governance & Law": ["constitution", "court", "reform", "election", "commission", "corruption", "law ", "minister", "police", "সংবিধান", "নির্বাচন", "আদালত", "সংস্কার", "মন্ত্রী"],
}
VALID = set(CATEGORIES) | {"General"}


# ---------- helpers ----------

def clean_html(s: str) -> str:
    s = re.sub(r"<[^>]+>", " ", s or "")
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


def base_domain(url: str) -> str:
    host = (urlparse(url).hostname or "").lower()
    parts = host.split(".")
    return ".".join(parts[-2:]) if len(parts) >= 2 else host


def to_iso(entry) -> str | None:
    """Normalize any RSS date to ISO-8601 UTC. Returns None if the item has no usable date."""
    for key in ("published_parsed", "updated_parsed"):
        t = entry.get(key)
        if t:
            return datetime(*t[:6], tzinfo=timezone.utc).isoformat()
    for key in ("published", "updated"):
        raw = (entry.get(key) or "").strip()
        if raw:
            try:
                d = parsedate_to_datetime(raw)
                if d.year < 100:  # e.g. Daily Star sends "31 Oct 26"
                    d = d.replace(year=2000 + d.year)
                return d.astimezone(timezone.utc).isoformat()
            except Exception:
                pass
    return None


def keyword_tags(text: str) -> list[str]:
    t = f" {text.lower()} "
    tags = [c for c, kws in CATEGORIES.items() if any(k in t for k in kws)]
    return tags or ["General"]


def entry_text(e) -> str:
    """Longest available original text: full content beats the short description."""
    candidates = [e.get("summary", "")] + [c.get("value", "") for c in (e.get("content") or [])]
    return max((clean_html(c) for c in candidates), key=len, default="")


def entry_image(e) -> str | None:
    for key in ("media_content", "media_thumbnail"):
        for m in e.get(key) or []:
            if m.get("url", "").startswith("https://"):
                return m["url"]
    for l in e.get("links") or []:
        if l.get("rel") == "enclosure" and str(l.get("type", "")).startswith("image") and l.get("href", "").startswith("https://"):
            return l["href"]
    m = re.search(r'<img[^>]+src="(https://[^"]+)"', e.get("summary", "") or "")
    return m.group(1) if m else None


NUM_RE = re.compile(r"[0-9][0-9,]*(?:\.[0-9]+)?")
BN_DIGITS = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")


def numbers_in(s: str) -> set[str]:
    return {n.replace(",", "") for n in NUM_RE.findall((s or "").translate(BN_DIGITS))}


def grounded(claim: str, source_text: str) -> bool:
    """A claim is kept only if every number in it also appears in the original article."""
    return numbers_in(claim) <= numbers_in(source_text)


class _Entry(dict):
    """Minimal stand-in for a feedparser entry, built from a sitemap + article page."""


def meta(html_text: str, name: str) -> str:
    m = re.search(r'<meta[^>]+?(?:property|name)="' + re.escape(name) + r'"[^>]*?content="([^"]*)"', html_text)
    return html.unescape(m.group(1)).strip() if m else ""


def fetch_sitemap_source(f):
    """For papers without RSS (e.g. Bonik Barta): read their daily Google-News sitemap,
    then read the title/description/image the paper itself publishes on each article page."""
    dhaka = datetime.now(timezone(timedelta(hours=6)))
    locs = []
    for d in (dhaka, dhaka - timedelta(days=1)):
        url = f["url"].replace("{date}", d.strftime("%Y-%m-%d"))
        try:
            r = requests.get(url, headers={"User-Agent": UA}, timeout=25)
            for m in re.finditer(r"<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>", r.text):
                locs.append((m.group(1).strip(), m.group(2).strip()))
        except Exception as ex:
            print(f"  sitemap error {url}: {ex}", file=sys.stderr)
    locs = list(dict(locs).items())  # de-duplicate
    locs.sort(key=lambda x: x[1], reverse=True)
    entries = []
    for loc, lastmod in locs[: f.get("max_items", 30)]:
        try:
            page = requests.get(loc, headers={"User-Agent": UA}, timeout=25).text
        except Exception:
            continue
        title = meta(page, "og:title")
        if not title:
            continue
        descs = re.findall(r'<meta[^>]+?name="description"[^>]*?content="([^"]*)"', page)
        desc = html.unescape(descs[-1]) if descs else ""  # last one is article-specific, first is site-wide
        e = _Entry(title=title, link=loc, summary=desc, published=lastmod)
        try:
            e["published_parsed"] = datetime.fromisoformat(lastmod.replace("Z", "+00:00")).astimezone(timezone.utc).timetuple()
        except Exception:
            pass
        img = meta(page, "og:image")
        if img.startswith("https://"):
            e["media_content"] = [{"url": img}]
        entries.append(e)
        time.sleep(0.4)  # be polite to the newspaper's server
    return entries


def fetch_feed(url: str):
    if url.startswith("file://") or Path(url).exists():  # local test fixtures
        return feedparser.parse(Path(url.removeprefix("file://")).read_bytes()), None
    last_err = None
    for attempt in range(3):
        try:
            r = requests.get(url, headers={"User-Agent": UA, "Accept": "application/rss+xml, application/xml, text/xml, */*"}, timeout=25)
            if r.status_code != 200:
                last_err = f"HTTP {r.status_code}"
            else:
                parsed = feedparser.parse(r.content)
                if parsed.entries:
                    return parsed, None
                last_err = "no entries (not an RSS feed?)"
        except Exception as ex:
            last_err = str(ex)
        time.sleep(2 * (attempt + 1))
    return None, last_err


# ---------- AI enrichment (optional) ----------

def ai_enrich(title: str, text: str) -> dict:
    if not API_KEY:
        return {}
    prompt = (
        "You help Bangladeshi candidates preparing for BCS and government job exams. "
        "Use ONLY the article text below. Never add outside knowledge, never guess numbers or names. "
        "Return JSON with keys: "
        f'"categories" (array, only from: {", ".join(sorted(VALID))}), '
        '"summary" (max 2 sentences, exam-focused, only facts from the text), '
        '"key_facts" (3-5 short items copied from the text: names, figures, dates, institutions), '
        '"exam_relevance" ("high", "medium" or "low").\n\n'
        f"Title: {title}\nText: {text[:3000]}"
    )
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
    for attempt in range(3):
        try:
            r = requests.post(
                url,
                headers={"x-goog-api-key": API_KEY},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"responseMimeType": "application/json", "temperature": 0.1},
                },
                timeout=40,
            )
            if r.status_code == 429:
                time.sleep(15 * (attempt + 1))
                continue
            r.raise_for_status()
            out = json.loads(r.json()["candidates"][0]["content"]["parts"][0]["text"])
            time.sleep(4.5)  # stay under free-tier requests/minute
            return out if isinstance(out, dict) else {}
        except Exception as ex:
            print(f"  AI attempt {attempt + 1} failed: {ex}", file=sys.stderr)
            time.sleep(3)
    return {}


# ---------- main ----------

def collect(feeds, existing, cutoff_dt):
    new_items, health = [], []
    for f in feeds:
        if f.get("type") == "sitemap":
            entries = fetch_sitemap_source(f)
            parsed, err = (type("P", (), {"entries": entries})(), None) if entries else (None, "no articles found in sitemap")
        else:
            parsed, err = fetch_feed(f["url"])
        status = {"source": f["source"], "url": f["url"], "ok": False, "items": 0, "newest": None, "error": err}
        if not parsed:
            print(f"WARN {f['source']} ({f['url']}): {err}", file=sys.stderr)
            health.append(status)
            continue
        feed_domain = base_domain(f.get("site") or f["url"])
        kept = 0
        newest = None
        for e in parsed.entries:
            link = (e.get("link") or "").strip()
            if not link.startswith("http") or base_domain(link) != feed_domain:
                continue  # authenticity: link must be on the newspaper's own site
            published = to_iso(e)
            if not published or published < cutoff_dt.isoformat():
                continue  # stale or undated
            newest = max(newest or published, published)
            kept += 1
            aid = hashlib.md5(link.encode()).hexdigest()[:16]
            if aid in existing or any(a["id"] == aid for a in new_items):
                continue
            text = entry_text(e)
            path = urlparse(link).path.lower()
            tags_text = " ".join(t.get("term", "") for t in e.get("tags") or [])
            is_ed = bool(f.get("editorial")) or "/editorial" in path or "editorial" in tags_text.lower()
            is_op = is_ed or "/opinion" in path or "/op-ed" in path
            item = {
                "id": aid,
                "source": f["source"],
                "title": clean_html(e.get("title", "")) or "Untitled",
                "link": link,
                "summary": text[:600],
                "published": published,
                "is_editorial": is_op,
                "categories": keyword_tags(f"{e.get('title', '')} {tags_text} {text[:800]}"),
                "exam_relevance": "high" if is_ed else "medium",
                "_text": text,
            }
            img = entry_image(e)
            if img:
                item["image"] = img
            new_items.append(item)
        status.update(ok=kept > 0, items=kept, newest=newest,
                      error=None if kept else "feed works but has no recent articles from its own site")
        print(f"{'OK  ' if kept else 'WARN'} {f['source']:<24} {kept:>3} recent items  newest={newest}  {f['url']}")
        health.append(status)
    return new_items, health


def check_mode(feeds):
    cutoff = datetime.now(timezone.utc) - timedelta(days=KEEP_DAYS)
    items, health = collect(feeds, {}, cutoff)
    print("\nSample articles (open a few links to confirm they are real):")
    for h in health:
        sample = [a for a in items if a["source"] == h["source"]][:3]
        for a in sample:
            print(f"  [{a['source']}] {a['published'][:16]}  {a['title'][:80]}\n      {a['link']}")
    bad = [h for h in health if not h["ok"]]
    print(f"\n{len(health) - len(bad)}/{len(health)} feeds healthy.")
    return 0 if len(bad) < len(health) else 1


def main():
    feeds = json.loads(FEEDS_FILE.read_text(encoding="utf-8"))
    if "--check" in sys.argv:
        sys.exit(check_mode(feeds))

    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    existing = {}
    if DATA_FILE.exists():
        try:
            existing = {a["id"]: a for a in json.loads(DATA_FILE.read_text(encoding="utf-8"))}
        except Exception:
            print("Could not read existing data, starting fresh", file=sys.stderr)

    cutoff = datetime.now(timezone.utc) - timedelta(days=KEEP_DAYS)
    new_items, health = collect(feeds, existing, cutoff)

    # Spend the limited AI quota on editorials first, then newest items
    new_items.sort(key=lambda a: a["published"], reverse=True)
    new_items.sort(key=lambda a: not a["is_editorial"])
    ai_budget, ai_dropped = MAX_AI_CALLS_PER_RUN, 0
    for art in new_items:
        if ai_budget <= 0 or not API_KEY:
            break
        if len(art["_text"]) < 120:
            continue  # too little original text to ground any facts
        ai_budget -= 1
        src = f"{art['title']} {art['_text']}"
        res = ai_enrich(art["title"], art["_text"])
        if not res:
            continue
        cats = [c for c in res.get("categories", []) if c in VALID]
        if cats:
            art["categories"] = cats
        s = res.get("summary")
        if isinstance(s, str) and s.strip():
            if grounded(s, src):
                art["ai_summary"] = s.strip()
            else:
                ai_dropped += 1
        facts = []
        for x in res.get("key_facts", []):
            if isinstance(x, str) and x.strip():
                if grounded(x, src):
                    facts.append(x.strip())
                else:
                    ai_dropped += 1
        if facts:
            art["key_facts"] = facts[:6]
        if res.get("exam_relevance") in ("high", "medium", "low"):
            art["exam_relevance"] = res["exam_relevance"]

    for art in new_items:
        art.pop("_text", None)
        existing[art["id"]] = art

    kept = [a for a in existing.values() if a.get("published", "") >= cutoff.isoformat()]
    kept.sort(key=lambda a: a["published"], reverse=True)
    kept = kept[:MAX_ARTICLES]
    DATA_FILE.write_text(json.dumps(kept, ensure_ascii=False, indent=1), encoding="utf-8")
    HEALTH_FILE.write_text(json.dumps({
        "run_at": datetime.now(timezone.utc).isoformat(),
        "added": len(new_items), "total": len(kept),
        "ai_claims_rejected": ai_dropped, "feeds": health,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Added {len(new_items)} new; total {len(kept)}; AI claims rejected as ungrounded: {ai_dropped}")
    if not any(h["ok"] for h in health):
        print("ERROR: every feed failed", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
