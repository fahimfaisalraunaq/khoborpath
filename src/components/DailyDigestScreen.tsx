/**
 * Daily Digest: a short, ranked brief so nobody has to read every article.
 * 1) Top stories (max 10) with summary + key points inline
 * 2) Browse the rest by topic (titles + one line)
 * 3) Editorials
 */

import React, { useMemo, useState } from 'react';
import { Check, ChevronRight, Copy, ExternalLink, Feather, Clock } from 'lucide-react';
import { Article, Language } from '../types';
import { ALL_CATEGORIES } from '../config';
import { CATEGORY_NAMES_BN } from '../lib/translations';

interface DailyDigestScreenProps {
  articles: Article[];
  language: Language;
  onSelectArticle: (article: Article) => void;
}

type Day = 'today' | 'yesterday' | 'week';

const dhakaDay = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });

function inDay(iso: string, day: Day): boolean {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  if (day === 'today') return dhakaDay(d) === dhakaDay(now);
  if (day === 'yesterday') return dhakaDay(d) === dhakaDay(new Date(now.getTime() - 864e5));
  return now.getTime() - d.getTime() <= 7 * 864e5;
}

function score(a: Article): number {
  let s = 0;
  if (a.exam_relevance === 'high') s += 6;
  else if (a.exam_relevance === 'medium') s += 3;
  if (a.is_editorial) s += 3;
  if (a.ai_summary) s += 2;
  if (a.key_facts && a.key_facts.length >= 3) s += 2;
  if (a.categories.some((c) => c !== 'General')) s += 1;
  const ageH = (Date.now() - new Date(a.published).getTime()) / 36e5;
  s += Math.max(0, 2 - ageH / 12); // small freshness bonus
  return s;
}

// Same story from several papers -> keep one
const storyKey = (t: string) =>
  t.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, '').split(/\s+/).filter((w) => w.length > 3).slice(0, 5).sort().join(' ');

export const DailyDigestScreen: React.FC<DailyDigestScreenProps> = ({ articles, language, onSelectArticle }) => {
  const bn = language === 'bn';
  const [day, setDay] = useState<Day>('today');
  const [topic, setTopic] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const pool = useMemo(() => {
    let list = articles.filter((a) => inDay(a.published, day));
    if (day === 'today' && list.length < 5) list = articles.filter((a) => inDay(a.published, 'yesterday')).concat(list);
    const seen = new Set<string>();
    return list
      .slice()
      .sort((a, b) => score(b) - score(a))
      .filter((a) => {
        const k = storyKey(a.title);
        if (!k || seen.has(k)) return !k;
        seen.add(k);
        return true;
      });
  }, [articles, day]);

  const top = useMemo(() => pool.filter((a) => !a.is_editorial).slice(0, 10), [pool]);
  const editorials = useMemo(() => pool.filter((a) => a.is_editorial).slice(0, 6), [pool]);
  const rest = useMemo(() => {
    const used = new Set([...top, ...editorials].map((a) => a.id));
    return pool.filter((a) => !used.has(a.id) && (topic === 'all' || a.categories.includes(topic)));
  }, [pool, top, editorials, topic]);

  const topicCounts = useMemo(() => {
    const used = new Set([...top, ...editorials].map((a) => a.id));
    const m: Record<string, number> = {};
    pool.filter((a) => !used.has(a.id)).forEach((a) => a.categories.forEach((c) => (m[c] = (m[c] || 0) + 1)));
    return m;
  }, [pool, top, editorials]);

  const minutes = Math.max(1, Math.round((top.length * 45 + editorials.length * 30) / 60));
  const catName = (c: string) => (bn ? CATEGORY_NAMES_BN[c] || c : c);

  const copyDigest = async () => {
    const lines: string[] = [`📰 Khoborpath — ${bn ? 'আজকের সংক্ষেপ' : 'Daily brief'} (${new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka' })})`, ''];
    top.forEach((a, i) => {
      lines.push(`${i + 1}. ${a.title} — ${a.source}`);
      (a.key_facts || []).slice(0, 3).forEach((f) => lines.push(`   • ${f}`));
      lines.push(`   ${a.link}`);
    });
    if (editorials.length) {
      lines.push('', bn ? 'সম্পাদকীয়' : 'Editorials');
      editorials.forEach((a) => lines.push(`• ${a.title} — ${a.source}  ${a.link}`));
    }
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  const L = {
    title: bn ? 'দৈনিক সংক্ষেপ' : 'Daily brief',
    sub: bn ? 'সব খবর পড়ার দরকার নেই — পরীক্ষার জন্য সবচেয়ে গুরুত্বপূর্ণগুলো এখানে।' : "No need to read everything — the stories that matter most for exams.",
    days: { today: bn ? 'আজ' : 'Today', yesterday: bn ? 'গতকাল' : 'Yesterday', week: bn ? 'এই সপ্তাহ' : 'This week' },
    top: bn ? 'শীর্ষ খবর' : 'Top stories',
    eds: bn ? 'সম্পাদকীয়' : 'Editorials',
    more: bn ? 'বিষয় অনুযায়ী আরও খবর' : 'More by topic',
    all: bn ? 'সব' : 'All',
    empty: bn ? 'এই দিনের কোনো খবর নেই।' : 'No stories for this day yet.',
    open: bn ? 'বিস্তারিত' : 'Details',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 lg:pb-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">{L.title}</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">{L.sub}</p>
          </div>
          <button
            onClick={copyDigest}
            className="shrink-0 h-10 px-3 rounded-full ring-1 ring-stone-200 dark:ring-stone-800 bg-white dark:bg-stone-900 text-xs font-semibold flex items-center gap-1.5"
            aria-label="Copy digest"
          >
            {copied ? <Check className="w-4 h-4 text-[#006A4E]" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          {(['today', 'yesterday', 'week'] as Day[]).map((d) => (
            <button key={d} onClick={() => setDay(d)} className={`chip ${day === d ? 'chip-on' : ''}`}>
              {L.days[d]}
            </button>
          ))}
          <span className="ml-auto flex items-center gap-1 text-xs text-stone-500">
            <Clock className="w-3.5 h-3.5" />
            {bn ? `~${minutes} মিনিট` : `~${minutes} min read`}
          </span>
        </div>
      </div>

      {pool.length === 0 && <p className="text-center text-sm text-stone-500 py-12">{L.empty}</p>}

      {/* Top stories */}
      {top.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#006A4E] dark:text-emerald-400">
            {L.top} · {top.length}
          </h2>
          {top.map((a, i) => (
            <article key={a.id} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 ring-1 ring-stone-200/80 dark:ring-stone-800">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 shrink-0 rounded-full bg-[#006A4E] text-white text-sm font-bold grid place-items-center">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                    {a.source}
                    {a.categories[0] && a.categories[0] !== 'General' ? ` · ${catName(a.categories[0])}` : ''}
                  </p>
                  <h3 className="font-bold text-[15px] leading-snug text-stone-900 dark:text-stone-100 mt-0.5">{a.title}</h3>
                  {(a.ai_summary || a.summary) && (
                    <p className="text-sm leading-6 text-stone-600 dark:text-stone-300 mt-1.5 line-clamp-3">{a.ai_summary || a.summary}</p>
                  )}
                  {a.key_facts && a.key_facts.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {a.key_facts.slice(0, 3).map((f, j) => (
                        <li key={j} className="flex gap-2 text-[13px] leading-5 text-stone-700 dark:text-stone-300">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs font-semibold">
                    <button onClick={() => onSelectArticle(a)} className="flex items-center gap-0.5 text-[#006A4E] dark:text-emerald-400">
                      {L.open} <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <a href={a.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-stone-500">
                      {bn ? 'মূল প্রতিবেদন' : 'Original'} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Editorials */}
      {editorials.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#006A4E] dark:text-emerald-400 flex items-center gap-1.5">
            <Feather className="w-3.5 h-3.5" /> {L.eds}
          </h2>
          <div className="rounded-2xl bg-white dark:bg-stone-900 ring-1 ring-stone-200/80 dark:ring-stone-800 divide-y divide-stone-100 dark:divide-stone-800">
            {editorials.map((a) => (
              <button key={a.id} onClick={() => onSelectArticle(a)} className="w-full text-left p-4 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-stone-500">{a.source}</p>
                  <p className="font-semibold text-sm text-stone-900 dark:text-stone-100 leading-snug">{a.title}</p>
                  {(a.ai_summary || a.summary) && (
                    <p className="text-[13px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-0.5">{a.ai_summary || a.summary}</p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 mt-1 shrink-0" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* More by topic */}
      {Object.keys(topicCounts).length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#006A4E] dark:text-emerald-400">{L.more}</h2>
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button onClick={() => setTopic('all')} className={`chip ${topic === 'all' ? 'chip-on' : ''}`}>
              {L.all}
            </button>
            {ALL_CATEGORIES.filter((c) => topicCounts[c]).map((c) => (
              <button key={c} onClick={() => setTopic(c)} className={`chip ${topic === c ? 'chip-on' : ''}`}>
                {catName(c)} · {topicCounts[c]}
              </button>
            ))}
          </div>
          <div className="rounded-2xl bg-white dark:bg-stone-900 ring-1 ring-stone-200/80 dark:ring-stone-800 divide-y divide-stone-100 dark:divide-stone-800">
            {rest.slice(0, 25).map((a) => (
              <button key={a.id} onClick={() => onSelectArticle(a)} className="w-full text-left px-4 py-3 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug">{a.title}</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">{a.source}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
