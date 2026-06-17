'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, ChevronDown, ArrowLeft, Trophy, Clock, Flame, Sparkles, Check, BarChart3, CircleDollarSign, Crown, Clapperboard, Music, Gamepad2, Plane, Globe, Utensils, Briefcase, Leaf, Tv, BookOpen, Landmark, Type, Shuffle, MapPin, Image } from 'lucide-react';
import { COLORS } from '@/lib/data';
import { QUIZZES } from '@/lib/quizzes';
import { fetchBootstrap } from '@/lib/api';
import { quizDept as deptOf, quizIcon as iconOf, DEPT_COLOR, DEPT_LABEL, DEPT_NAV } from '@/lib/quiz-departments';
import Grain from '../Grain';
import Footer from '../Footer';
import Count from '../Count';

function seededShuffle(arr, seed) {
  const out = arr.slice();
  let s = seed >>> 0 || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    const j = (s >>> 0) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const SORTS = [
  { id: 'discover', label: 'Discover', short: 'Discover' },
  { id: 'trending', label: 'Trending', short: 'Trending' },
  { id: 'popularity', label: 'Most Played', short: 'Most Played' },
  { id: 'recent', label: 'Most Recently Added', short: 'Recent' },
];

// Compact clock label for a quiz's total time budget (seconds -> '90 sec' / '2 min' / '3:15').
function fmtQuizTime(s) {
  if (!s || s <= 0) return '';
  if (s < 120) return `${s} sec`;
  if (s % 60 === 0) return `${s / 60} min`;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Strip the leading "Name (the) " verb from a quiz title for display.
function cleanTitle(t) {
  return (t || '').replace(/^Name (the )?/i, '').trim();
}

// Activity-feed board names drop the leading action verb, so a cramped column
// reads "Countries of South America No Outline" rather than "Click the
// Countries of South America No Outline". Covers Click/Name/Guess/Find/etc.
function boardTitle(t) {
  return cleanTitle(t).replace(/^(Click|Name|Guess|Find|Identify|Locate|Pick|Select|Match|Pinpoint)\s+(the\s+|all\s+the\s+|these\s+)?/i, '').trim();
}

// Whole-word short form for the cramped Most-Played board: keep adding words
// until we'd exceed `max` characters, then stop — no ellipsis, no mid-word cut,
// and the board's CSS wraps anything still long instead of clipping it.
function shortTitle(t, max = 32) {
  const s = cleanTitle(t);
  if (s.length <= max) return s;
  const words = s.split(/\s+/);
  let out = '';
  for (const w of words) {
    const next = out ? `${out} ${w}` : w;
    if (next.length > max) break;
    out = next;
  }
  return out || words[0] || s;
}

// Quiz "type" classification for the Type filter. Primary type is one of
// name / match / locate; picture is an overlay flag (image-based quizzes,
// which also belong to name or match). Selecting Picture shows every image
// quiz; selecting Name/Match shows that primary type incl. its picture ones.
const MATCH_FORMATS = new Set(['matched', 'bank', 'pairs', 'type-it']);
const IMG_FORMATS = new Set(['photo', 'posters', 'logos', 'images']);
function quizPrimaryType(q) {
  if (q.format === 'map') return 'locate';
  if (MATCH_FORMATS.has(q.format) || /^match\b/i.test(q.title || '')) return 'match';
  return 'name';
}
function quizIsPicture(q) {
  if (IMG_FORMATS.has(q.format)) return true;
  if (Array.isArray(q.answers) && q.answers.some((a) => a && a.img)) return true;
  if (Array.isArray(q.pairs) && q.pairs.some((pr) => pr && (pr.img || (pr.left && pr.left.img) || (pr.right && pr.right.img)))) return true;
  return false;
}
function quizMatchesType(q, t) {
  if (t === 'all') return true;
  if (t === 'picture') return quizIsPicture(q);
  return quizPrimaryType(q) === t;
}

function QuizTile({ quiz, plays, leader }) {
  const [hover, setHover] = useState(false);
  const Icon = iconOf(quiz);
  const dept = deptOf(quiz);
  const accent = DEPT_COLOR[dept] || DEPT_COLOR.misc;
  const deptLabel = DEPT_LABEL[dept] || 'Quiz';
  const heading = quiz.title || '';
  return (
    <Link
      href={`/quiz/${quiz.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ cursor: 'pointer', textDecoration: 'none', display: 'flex', flexDirection: 'column', background: hover ? '#e4dbc8' : COLORS.paper, color: COLORS.ink, border: `1.5px solid ${COLORS.ink}`, overflow: 'hidden', transition: 'all 0.2s ease', transform: hover ? 'translate(-2px, -2px)' : 'none', boxShadow: hover ? `3px 3px 0 ${accent.c}` : 'none' }}
    >
      <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 18px', background: accent.t, borderBottom: `1.5px solid ${COLORS.ink}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ flex: 'none', width: 38, height: 38, borderRadius: '50%', background: COLORS.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={20} strokeWidth={2} aria-hidden="true" style={{ color: accent.c }} /></span>
          <span style={{ flex: 'none', fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.cream, background: accent.c, padding: '5px 10px' }}>{deptLabel}</span>
        </div>
      </div>
      <div style={{ padding: '16px 18px 18px', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 26, lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 12px', fontVariationSettings: '"SOFT" 100', color: COLORS.ink }}>{heading}</h3>
        {quiz.blurb && (<p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 14.5, lineHeight: 1.5, color: COLORS.faded, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{quiz.blurb}</p>)}
        <span style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0, fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, color: accent.c }}>
          <span style={{ flex: 'none' }}>Current Leader:</span>
          <span style={{ flex: '1 1 auto', minWidth: 0, fontWeight: 700, color: leader ? COLORS.ink : COLORS.faded, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leader || 'Empty'}</span>
        </span>
        <div style={{ paddingTop: 10, display: 'flex', alignItems: 'baseline', gap: 8, fontFamily: 'DM Mono, monospace', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: accent.c }}>
          <span>▶ Play</span>
          {plays > 0 && (<span style={{ color: COLORS.faded, fontWeight: 600, fontSize: 11, letterSpacing: '0.1em' }}>· <Count value={plays} /> plays</span>)}
        </div>
      </div>
    </Link>
  );
}

const MEDAL = ['#caa12e', '#9c968a', '#b1763f'];

// Shared card chrome for the two side-by-side boards below the ribbon: a
// paper panel with an ember drop-shadow that lifts on hover. Used as a Link
// (right/Top Players board) or as a clickable div (left/Most Played board,
// which contains its own per-quiz links and so can't be an anchor).
const boardCss = `
  .qz-boards{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:12px;align-items:start;}
  @media(max-width:680px){.qz-boards{grid-template-columns:1fr;gap:10px;}.qz-boards .qb{margin-bottom:0;}}
  .lb-card{display:flex;flex-direction:column;background:${COLORS.paper};border:1.5px solid ${COLORS.ink};box-shadow:3px 3px 0 ${COLORS.ember};padding:10px 16px 10px;margin-bottom:16px;box-sizing:border-box;}
  .lb-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:3px;}
  .lb-kicker{font-family:'DM Mono',monospace;font-size:10.5px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${COLORS.ember};}
  .lb-cta{font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:0.14em;text-transform:uppercase;color:${COLORS.faded};white-space:nowrap;text-decoration:none;}
  .lb-cta:hover{color:${COLORS.ember};}
  .lb-rule1{border-bottom:1px solid ${COLORS.ink};}
  .lb-rule2{border-bottom:2px solid ${COLORS.ember};margin-bottom:4px;}
  .lb-cats{display:flex;flex-direction:column;}
  .lb-cat{border-top:1px solid rgba(26,22,17,0.1);}
  .lb-cat:first-child{border-top:none;}
  .lb-cat-head{display:flex;align-items:center;gap:8px;width:100%;background:transparent;border:none;cursor:pointer;padding:10px 0;font-family:'DM Mono',monospace;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${COLORS.ink};text-align:left;}
  .lb-cat-label{flex:1 1 auto;min-width:0;}
  .lb-cat-chev{flex:none;transition:transform 0.18s;color:${COLORS.faded};}
  .lb-cat.open .lb-cat-head{color:${COLORS.ember};}
  .lb-cat.open .lb-cat-chev{transform:rotate(180deg);color:${COLORS.ember};}
  .lb-list{display:flex;flex-direction:column;padding:0 0 8px;}
  .lb-list-2col{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(3,auto);grid-auto-flow:column;column-gap:20px;padding:0 0 8px;}
  .lb-row{display:flex;align-items:center;gap:10px;padding:5px 0;text-decoration:none;}
  .lb-rank{flex:none;width:19px;height:19px;border-radius:50%;border:1.25px solid ${COLORS.ink};display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:10.5px;font-weight:500;color:${COLORS.ink};}
  .lb-name{flex:1 1 auto;min-width:0;font-family:'Fraunces',serif;font-size:13px;font-weight:500;color:${COLORS.ink};line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  a.lb-row:hover .lb-name{color:${COLORS.ember};}
  .lb-val{flex:none;font-family:'DM Mono',monospace;font-weight:500;font-size:12px;color:${COLORS.ink};white-space:nowrap;}
  .lb-empty{font-family:'Fraunces',serif;font-style:italic;font-size:12.5px;color:${COLORS.faded};padding:2px 0 8px;}
  .qz-wide-cols{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}
  .qz-wide-col{min-width:0;}
  .qz-wide-label{font-family:'DM Mono',monospace;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${COLORS.ink};display:flex;align-items:center;gap:6px;padding:7px 10px;margin-bottom:4px;}
  .qz-wide-list{display:flex;flex-direction:column;padding:0 10px;}
  .lb-mid{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:${COLORS.faded};display:flex;align-items:center;gap:7px;white-space:nowrap;}
  .qz-pulse{width:7px;height:7px;border-radius:50%;background:#2e7d6b;flex:none;}
  .qb{margin-bottom:0;}
  .qb-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px 12px;background:${COLORS.ember};border:1.5px solid ${COLORS.ink};box-shadow:3px 3px 0 ${COLORS.ink};padding:11px 15px;}
  .qb-title{font-family:'DM Mono',monospace;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${COLORS.cream};}
  .qb-mid{font-family:'DM Mono',monospace;font-size:9.5px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#f4d9d4;display:flex;align-items:center;gap:7px;white-space:nowrap;}
  .qb-cta{font-family:'DM Mono',monospace;font-size:9.5px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#f4d9d4;white-space:nowrap;text-decoration:none;}
  .qb-cta:hover{color:${COLORS.cream};}
  .qb-body{border:1.5px solid ${COLORS.ink};border-top:none;background:${COLORS.paper};padding:12px 15px 13px;}
  @media(max-width:680px){.lb-row-extra{display:none;}.lb-list-2col{display:flex;flex-direction:column;}.lb-name{white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:anywhere;}
    .qz-wide-cols{grid-template-columns:1fr;gap:8px;}.lb-mid,.qb-mid{display:none;}}
  .ql-controls{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:9px 12px;margin-bottom:16px;background:${COLORS.paper};border:1.5px solid ${COLORS.ink};}
  .ql-gb{display:inline-flex;border:1.5px solid ${COLORS.ink};flex:none;}
  .ql-gb-btn{padding:6px 13px;background:transparent;border:none;border-left:1.5px solid ${COLORS.ink};font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:0.1em;text-transform:uppercase;font-weight:700;color:${COLORS.ink};cursor:pointer;white-space:nowrap;}
  .ql-gb-btn:first-child{border-left:none;}
  .ql-jumplabel{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:${COLORS.faded};font-weight:700;flex:none;}
  .ql-jumps{display:flex;flex-wrap:wrap;gap:6px;flex:1;min-width:0;}
  @media(max-width:760px){.ql-controls{flex-direction:column;align-items:flex-start;gap:8px;}.ql-jumps{width:100%;}}
  .ql-jump{padding:4px 9px;background:transparent;border:1px solid ${COLORS.ink};font-family:'DM Mono',monospace;font-size:8.5px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;cursor:pointer;white-space:nowrap;}
  .ql-cols{display:grid;grid-template-columns:1fr 1fr 1fr;gap:22px;align-items:start;}
  @media(max-width:1000px){.ql-cols{grid-template-columns:1fr 1fr;}}
  @media(max-width:760px){.ql-cols{grid-template-columns:1fr;}}
  .ql-col{scroll-margin-top:72px;min-width:0;}
  .ql-col-head{display:flex;align-items:center;gap:9px;padding-bottom:6px;border-bottom:2px solid ${COLORS.ink};}
  .ql-medal{flex:none;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;}
  .ql-name{font-family:'Fraunces',serif;font-weight:700;font-size:18px;letter-spacing:-0.01em;margin:0;color:${COLORS.ink};}
  .ql-toggle{margin-left:auto;display:inline-flex;border:1px solid rgba(26,22,17,0.28);flex:none;}
  .ql-tg{padding:5px 10px;background:transparent;border:none;border-left:1px solid rgba(26,22,17,0.16);font-family:'DM Mono',monospace;font-size:9px;letter-spacing:0.06em;text-transform:uppercase;font-weight:700;color:${COLORS.faded};cursor:pointer;white-space:nowrap;}
  .ql-tg:first-child{border-left:none;}
  .ql-list{display:flex;flex-direction:column;}
  .ql-row{display:flex;align-items:baseline;gap:10px;padding:7px 0;border-bottom:1px solid rgba(26,22,17,0.1);text-decoration:none;color:${COLORS.ink};}
  .ql-row:hover .ql-title{color:${COLORS.ember};}
  .ql-title{flex:1 1 auto;min-width:0;font-family:'Fraunces',serif;font-weight:500;font-size:14px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .ql-meta{flex:none;display:flex;align-items:center;gap:11px;font-family:'DM Sans',sans-serif;font-size:9.5px;font-weight:500;white-space:nowrap;}
  .ql-plays{color:${COLORS.faded};letter-spacing:0.04em;}
  .ql-leader{display:flex;align-items:center;gap:3px;max-width:130px;}
  .ql-lname{overflow:hidden;text-overflow:ellipsis;}
  .ql-viewall{margin-top:9px;background:transparent;border:none;padding:2px 0;font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:0.1em;text-transform:uppercase;font-weight:700;cursor:pointer;}
  @media(max-width:760px){.ql-name{font-size:17px;}.ql-meta{gap:8px;}.ql-leader{max-width:104px;}}
  .rb-cols{display:grid;gap:14px;min-height:120px;}
  .rb-fade{animation:rbfade 0.5s ease;}
  .rb-stat{margin-left:auto;font-family:'DM Mono',monospace;font-size:9px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#f4d9d4;white-space:normal;text-align:right;}
  .rb-stat.rb-flip{animation:rbfade 0.5s ease;}
  @keyframes rbfade{from{opacity:0}to{opacity:1}}
  .rb-dots{display:flex;justify-content:center;gap:6px;margin-top:10px;}
  .rb-dot{width:6px;height:6px;border-radius:50%;border:none;padding:0;background:rgba(26,22,17,0.22);cursor:pointer;}
  .rb-dot.on{background:${COLORS.ember};}
  .sp-spotlight-wrap{margin-bottom:12px;}
  .sp-shelves{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:12px;align-items:start;}
  .sp-head{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;}
  .sp-head .qb-title{justify-self:start;}
  .sp-head .qb-cta{justify-self:end;}
  .sp-hcat{justify-self:center;display:flex;align-items:center;gap:6px;font-family:'DM Mono',monospace;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#f4d9d4;text-align:center;}
  .sp-flex{display:grid;grid-template-columns:minmax(200px,0.85fr) minmax(0,2fr);gap:0;align-items:center;}
  .sp-feat{display:flex;align-items:center;gap:14px;min-width:0;padding-right:18px;}
  .sp-medal{width:50px;height:50px;border-radius:50%;background:#caa12e;border:1.5px solid ${COLORS.ink};display:flex;align-items:center;justify-content:center;flex:none;font-family:'DM Mono',monospace;font-size:20px;font-weight:500;color:#4a3608;}
  .sp-fname{font-family:'Fraunces',serif;font-size:22px;font-weight:600;color:${COLORS.ink};line-height:1.05;overflow-wrap:anywhere;}
  .sp-fstat{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.05em;text-transform:uppercase;color:${COLORS.faded};margin-top:4px;}
  .sp-fstat b{color:${COLORS.ember};font-weight:500;}
  .sp-rest{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1px 22px;align-content:center;border-left:1px solid rgba(26,22,17,0.18);padding-left:18px;min-width:0;}
  .sp-rest .lb-name{font-size:12px;}
  .sp-rest .lb-val{font-size:11px;}
  .sp-rrow{padding:3px 0;}
  .sp-rrow-hi{padding:5px 0;}
  .sp-rrow-hi .lb-rank{width:21px;height:21px;font-size:11px;}
  .sp-rrow-hi .lb-name{font-size:14px;}
  .sp-rrow-hi .lb-val{font-size:12px;color:${COLORS.ink};}
  .sp-new{flex:none;background:${COLORS.ember};color:${COLORS.cream};font-family:'DM Mono',monospace;font-size:9px;letter-spacing:0.08em;padding:2px 5px;text-transform:uppercase;margin-right:2px;}
  .sh-row{align-items:flex-start;}
  .sh-name{white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:anywhere;line-height:1.3;}
  @media(max-width:680px){.sp-shelves{grid-template-columns:1fr;gap:10px;}.sp-head{display:flex;flex-wrap:wrap;}.sp-hcat{flex-basis:100%;order:3;justify-content:center;margin-top:5px;}.sp-flex{grid-template-columns:1fr;}.sp-feat{padding-right:0;padding-bottom:12px;}.sp-rest{grid-template-columns:repeat(auto-fit,minmax(140px,1fr));border-left:none;border-top:1px solid rgba(26,22,17,0.18);padding-left:0;padding-top:8px;}}
  .ql-block{margin-top:4px;}
  .ql-bhead{display:flex;align-items:center;gap:11px;padding-bottom:7px;border-bottom:2px solid ${COLORS.ink};flex-wrap:wrap;}
  .ql-bname{font-family:'Fraunces',serif;font-weight:600;font-size:22px;letter-spacing:-0.01em;margin:0;color:${COLORS.ink};}
  .ql-2col{display:grid;grid-template-columns:1fr 1fr;column-gap:28px;margin-top:6px;}
  .lb-name-sm{display:none;}
  @media(max-width:760px){.ql-2col{grid-template-columns:1fr;}.ql-title{white-space:normal;overflow:visible;font-size:13px;line-height:1.25;}}
  @media(max-width:680px){.lb-name-lg{display:none;}.lb-name-sm{display:block;}}
  .ql-sortbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;}
  .ql-sortlabel{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:0.16em;text-transform:uppercase;color:${COLORS.faded};font-weight:700;}

`;

// Relative time since a play (compact): "just now", "5m", "3h", "2d", "3w".
function timeAgo(iso) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return '';
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 45) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.floor(d / 365)}y`;
}

// Short publication date for the Newest column: "Jun 14" (year added if not current).
function dateShort(q) {
  const iso = q.publishedAt || (q.publishedDate ? `${q.publishedDate}T12:00:00Z` : null);
  if (!iso) return '';
  const dt = new Date(iso);
  if (!Number.isFinite(dt.getTime())) return '';
  const now = new Date();
  const opts = dt.getFullYear() === now.getFullYear()
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: '2-digit' };
  return dt.toLocaleDateString('en-US', opts);
}

// One wide box holding the quiz boards (Most Played / Trending Now / Newest) as
// three distinct lists side by side. A kicker + CTA sit on top; each list shows
// its top three rows, every row a link to its quiz. On mobile the three lists
// stack into a single column with a divider between each.
function fmtDur(sec) {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  const totalMin = Math.round(s / 60);
  if (totalMin < 1) return `${s}s`;
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (d > 0 || h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(' ');
}

function QuizBoardWide({ title, cta, ctaHref, categories, mid }) {
  return (
    <div className="qb">
      <div className="qb-head">
        <span className="qb-title">{title}</span>
        {mid != null && <span className="qb-mid">{mid}</span>}
        <Link href={ctaHref} className="qb-cta">{cta} {'\u203A'}</Link>
      </div>
      <div className="qb-body">
      <div className="qz-wide-cols">
        {categories.map((c) => (
          <div className="qz-wide-col" key={c.id}>
            <div className="qz-wide-label" style={{ color: c.accent, background: 'transparent', borderBottom: `2px solid ${c.accent}`, padding: '6px 2px' }}>{c.icon}{c.label}</div>
            <div className="qz-wide-list">
              {c.rows.length > 0 ? c.rows.map((r, i) => {
                const inner = (
                  <>
                    <span className="lb-rank" style={r.noRank ? { background: 'transparent', border: 'none' } : { background: (i < 3 && !c.noMedals) ? MEDAL[i] : 'transparent' }}>{r.noRank ? '' : i + 1}</span>
                    <span className="lb-name">{r.full}</span>
                    {c.prize && (
                      <span aria-hidden="true" style={{ flex: 'none', width: 58, display: 'inline-flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1, color: '#15803d' }}>
                        {i < 3 && !r.noRank ? Array.from({ length: 3 - i }).map((_, d) => (<CircleDollarSign key={d} size={13} strokeWidth={2.25} />)) : null}
                      </span>
                    )}
                    {r.val != null && <span className="lb-val" style={c.prize ? { minWidth: 30, textAlign: 'right' } : undefined}>{r.val}</span>}
                  </>
                );
                return r.href
                  ? (<Link key={r.key} href={r.href} className="lb-row" title={r.full}>{inner}</Link>)
                  : (<div key={r.key} className="lb-row">{inner}</div>);
              }) : (<div className="lb-empty">{c.empty || 'No data yet.'}</div>)}
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

// Full-width row of three buttons: the latest Daily Market Moving News Quiz,
// the all-time player Leaderboard, and Quiz Stats. The news button finds the
// most recent daily-market-news-quiz-* entry so it always points at today's
// edition without a hardcoded id. The Leaderboard and Quiz Stats buttons always show.
function DailyNewsBanner({ totals }) {
  const [hover, setHover] = useState(null); // 'news' | 'lb' | 'stats' | null
  // Right button: the latest Daily Market Moving News Quiz edition.
  const newsQuiz = useMemo(() => {
    const cands = QUIZZES.filter((q) => /^(daily-market-news-quiz-|daily-business-quiz-)/.test(q.id || ''));
    cands.sort((a, b) => new Date(b.publishedAt || `${b.publishedDate || '1970-01-01'}T12:00:00Z`).getTime() - new Date(a.publishedAt || `${a.publishedDate || '1970-01-01'}T12:00:00Z`).getTime());
    return cands[0] || null;
  }, []);
  const liftStyle = (active) => ({ boxShadow: active ? `5px 5px 0 ${COLORS.ink}` : `3px 3px 0 ${COLORS.ink}`, transform: active ? 'translate(-2px, -2px)' : 'none' });
  return (
    <div className="dn-wrap">
      <style>{`
        .dn-wrap{display:flex;gap:12px;margin-bottom:16px;}
        .dn-btn{flex:1 1 auto;min-width:0;display:flex;align-items:center;justify-content:center;gap:10px;text-decoration:none;background:${COLORS.ember};color:${COLORS.cream};border:1.5px solid ${COLORS.ink};padding:13px 18px;transition:all 0.2s ease;}
        .dn-label{font-family:'DM Mono',monospace;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.cream};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        @media(max-width:640px){.dn-wrap{flex-direction:column;gap:9px;}.dn-label{white-space:normal;text-align:center;}}
      `}</style>
      {newsQuiz && (
        <Link href={`/quiz/${newsQuiz.id}`} className="dn-btn" onMouseEnter={() => setHover('news')} onMouseLeave={() => setHover(null)} style={liftStyle(hover === 'news')}>
          <span className="dn-label">{'▶'} Daily Market Moving News Quiz</span>
        </Link>
      )}
      <Link href="/leaderboard" className="dn-btn" onMouseEnter={() => setHover('lb')} onMouseLeave={() => setHover(null)} style={liftStyle(hover === 'lb')}>
        <Trophy size={15} strokeWidth={2.5} aria-hidden="true" style={{ flex: 'none' }} />
        <span className="dn-label">Leaderboard</span>
      </Link>
      <Link href="/quizzes/stats" className="dn-btn" onMouseEnter={() => setHover('stats')} onMouseLeave={() => setHover(null)} style={liftStyle(hover === 'stats')}>
        <BarChart3 size={15} strokeWidth={2.5} aria-hidden="true" style={{ flex: 'none' }} />
        <span className="dn-label">Quiz Stats</span>
      </Link>
    </div>
  );
}

// Per-department icon for the list-view column headers (mirrors DEPT_ICON in
// lib/quiz-departments so a column reads consistently).
const SECTION_ICON = {
  movies: Clapperboard, music: Music, gaming: Gamepad2, travel: Plane, sports: Trophy,
  geography: Globe, food: Utensils, business: Briefcase, science: Leaf,
  entertainment: Tv, literature: BookOpen, history: Landmark, misc: Sparkles,
};

// Type-bucket display meta for the "By Type" grouping.
const TYPE_META = {
  name: { label: 'Name', Icon: Type, accent: { c: '#c0392b', t: '#f3ddd8' } },
  match: { label: 'Match', Icon: Shuffle, accent: { c: '#2f6f9f', t: '#d9e6f0' } },
  locate: { label: 'Locate', Icon: MapPin, accent: { c: '#1f7a8c', t: '#d4e9ee' } },
  picture: { label: 'Picture', Icon: Image, accent: { c: '#7a4fb0', t: '#e6dcf1' } },
};

// One category (or type) column in the list view: header (icon + name, no
// count) with a Newest / Most Played / Trending sort toggle, a tight list of
// rows (title + play count + current leader), and a "View all" expander.
function QuizCategoryColumn({ sectionKey, label, accent, Icon, quizzes, totals, onViewAll }) {
  const [sortMode, setSortMode] = useState('popularity');
  const dseed = useMemo(() => (Math.random() * 1e9) >>> 0, []);
  const plays = (id) => totals.byQuiz[id] || 0;
  const trend = (id) => totals.trendingByQuiz[id] || totals.recent7[id] || 0;
  const ts = (q) => new Date(q.publishedAt || `${q.publishedDate || '1970-01-01'}T12:00:00Z`).getTime();
  const sorted = useMemo(() => {
    const arr = quizzes.slice();
    if (sortMode === 'discover') return seededShuffle(arr, dseed);
    if (sortMode === 'recent') arr.sort((a, b) => ts(b) - ts(a) || a.title.localeCompare(b.title));
    else arr.sort((a, b) => plays(b.id) - plays(a.id) || a.title.localeCompare(b.title));
    return arr;
  }, [quizzes, sortMode, totals, dseed]);
  const LIMIT = 6;
  const shown = sorted.slice(0, LIMIT);
  const total = quizzes.length;
  const TOGGLES = [['recent', 'New'], ['popularity', 'Popular'], ['discover', 'Discover']];
  return (
    <section id={`qzsec-${sectionKey}`} className="ql-col">
      <div className="ql-col-head" style={{ borderColor: accent.c }}>
        <span className="ql-medal" style={{ background: accent.t }}><Icon size={15} strokeWidth={2} aria-hidden="true" style={{ color: accent.c }} /></span>
        <h2 className="ql-name">{label}</h2>
        <div className="ql-toggle" role="group" aria-label={`Sort ${label}`}>
          {TOGGLES.map(([id, lbl]) => (
            <button key={id} type="button" className="ql-tg" onClick={() => setSortMode(id)} style={sortMode === id ? { background: accent.c, color: COLORS.cream } : undefined}>{lbl}</button>
          ))}
        </div>
      </div>
      <div className="ql-list">
        {shown.map((q) => {
          const leader = totals.leaders[q.id];
          const p = plays(q.id);
          return (
            <Link key={q.id} href={`/quiz/${q.id}`} className="ql-row" title={q.title}>
              <span className="ql-title">{boardTitle(q.title)}</span>
              <span className="ql-meta">
                {p > 0 && <span className="ql-plays">{'▶'} <Count value={p} /></span>}
                <span className="ql-leader" style={{ color: leader ? COLORS.ink : COLORS.faded }}>
                  <Crown size={11} strokeWidth={2.5} aria-hidden="true" style={{ flex: 'none', color: accent.c }} />
                  <span className="ql-lname">{leader || 'Empty'}</span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
      <button type="button" className="ql-viewall" onClick={onViewAll} style={{ color: accent.c }}>
        View all {total} {label} {'›'}
      </button>
    </section>
  );
}


// Two of these sit side by side (Players | Quizzes) in place of the old
// full-width boards. Each rotates through its lists every 5s with a crossfade;
// `perView` lists show at once (Players shows 2 of its 4, Quizzes 1 of 3). The
// header stays one fixed line with the box's stats flipping in sync. Hover
// pauses, dots jump. Not collapsible.
// Per-board phrasing for the rotating Player Spotlight headline stat.
const SPOT_UNIT = { today: ['correct today', 'today'], allcorrect: ['correct answers', 'correct'], perfect: ['perfect quizzes', 'perfect'], unique: ['quizzes played', 'played'] };

// Player Spotlight: rotates through the player leaderboards (Today's Correct,
// Total Correct, Most Perfect, Most Unique) every 8s with a crossfade; hover
// pauses, dots jump. Each shows its #1 large with #2 and #3 in the right-hand
// space. Header carries only the title + Leaderboard link (no inline stats).
function SpotlightBoard({ columns }) {
  const avail = columns.filter((c) => c.rows && c.rows.length > 0);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || avail.length <= 1) return undefined;
    const t = setInterval(() => setIdx((i) => (i + 1) % avail.length), 10000);
    return () => clearInterval(t);
  }, [paused, avail.length]);
  const safeIdx = avail.length ? idx % avail.length : 0;
  const cat = avail[safeIdx] || null;
  const [unit, unitShort] = (cat && SPOT_UNIT[cat.id]) || ['', ''];
  const feat = cat ? cat.rows[0] : null;
  const rest = cat ? cat.rows.slice(1, 10) : [];
  return (
    <div className="qb" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <Link href="/leaderboard" className="qb-head sp-head" style={{ textDecoration: 'none' }}>
        <span className="qb-title">Player Spotlight</span>
        {cat && <span className="sp-hcat">{cat.icon}{cat.label}</span>}
        <span className="qb-cta">Leaderboard {'→'}</span>
      </Link>
      <div className="qb-body">
        {cat && feat ? (
          <div key={safeIdx} className="rb-fade sp-flex">
            <div className="sp-feat">
              <span className="sp-medal">1</span>
              <div style={{ minWidth: 0 }}>
                <div className="sp-fname">{feat.full}</div>
                <div className="sp-fstat"><b>{feat.val}</b> {unit}</div>
              </div>
            </div>
            {rest.length > 0 && (
              <div className="sp-rest">
                {rest.map((r, i) => (
                  <div key={r.key} className={i < 2 ? 'lb-row sp-rrow sp-rrow-hi' : 'lb-row sp-rrow'}>
                    <span className="lb-rank" style={{ background: i < 2 ? MEDAL[i + 1] : 'transparent' }}>{i + 2}</span>
                    <span className="lb-name">{r.full}</span>
                    <span className="lb-val">{r.val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="lb-empty">No player stats yet.</div>
        )}
      </div>
    </div>
  );
}

// A quiz shelf (Recently Played / Just Added): the board's top three as a list.
// `href`/`cta` add a header link (Just Added -> Quiz Stats). `withNew` tags the
// freshest additions. Titles wrap on mobile via lb-name-lg / lb-name-sm.
function ShelfBoard({ title, href, cta, col, withNew, mid }) {
  if (!col) return null;
  const head = href
    ? (<Link href={href} className="qb-head" style={{ textDecoration: 'none' }}><span className="qb-title">{title}</span>{mid != null && <span className="qb-mid">{mid}</span>}<span className="qb-cta">{cta} {'→'}</span></Link>)
    : (<div className="qb-head"><span className="qb-title">{title}</span>{mid != null && <span className="qb-mid">{mid}</span>}</div>);
  return (
    <div className="qb">
      {head}
      <div className="qb-body">
        <div className="qz-wide-list" style={{ padding: 0 }}>
          {col.rows.length > 0 ? col.rows.map((r) => {
            const inner = (
              <>
                {withNew && r.fresh ? <span className="sp-new">New</span> : null}
                <span className="lb-name sh-name">{r.long || r.full}</span>
                {r.val != null && <span className="lb-val">{r.val}</span>}
              </>
            );
            return r.href
              ? (<Link key={r.key} href={r.href} className="lb-row sh-row" title={r.long || r.full}>{inner}</Link>)
              : (<div key={r.key} className="lb-row sh-row">{inner}</div>);
          }) : (<div className="lb-empty">{col.empty || 'No data yet.'}</div>)}
        </div>
      </div>
    </div>
  );
}

function RotatingBoard({ title, href, cta, columns, perView }) {
  const pages = Math.max(1, Math.ceil(columns.length / perView));
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || pages <= 1) return undefined;
    const t = setInterval(() => setPage((p) => (p + 1) % pages), 8000);
    return () => clearInterval(t);
  }, [paused, pages]);
  const safePage = page % pages;
  const view = columns.slice(safePage * perView, safePage * perView + perView);
  return (
    <div className="qb" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <Link href={href} className="qb-head" style={{ textDecoration: 'none' }}>
        <span className="qb-title">{title}</span>
        <span className="qb-cta">{cta} {'→'}</span>
      </Link>
      <div className="qb-body">
        <div key={safePage} className="rb-cols rb-fade" style={{ gridTemplateColumns: `repeat(${perView}, minmax(0, 1fr))` }}>
          {view.map((c) => (
            <div className="qz-wide-col" key={c.id}>
              <div className="qz-wide-label" style={{ color: COLORS.ink, background: 'transparent', borderBottom: `2px solid ${COLORS.ink}`, padding: '6px 2px' }}>{c.icon}{c.label}</div>
              <div className="qz-wide-list">
                {c.rows.length > 0 ? c.rows.map((r, i) => {
                  const inner = (
                    <>
                      <span className="lb-rank" style={{ background: (i < 3 && !c.noMedals) ? MEDAL[i] : 'transparent' }}>{i + 1}</span>
                      <span className="lb-name lb-name-lg">{r.full}</span><span className="lb-name lb-name-sm">{r.short || r.full}</span>
                      {r.val != null && <span className="lb-val">{r.val}</span>}
                    </>
                  );
                  return r.href
                    ? (<Link key={r.key} href={r.href} className="lb-row" title={r.full}>{inner}</Link>)
                    : (<div key={r.key} className="lb-row">{inner}</div>);
                }) : (<div className="lb-empty">{c.empty || 'No data yet.'}</div>)}
              </div>
            </div>
          ))}
        </div>
        {pages > 1 && (
          <div className="rb-dots">
            {Array.from({ length: pages }).map((_, i) => (
              <button key={i} type="button" aria-label={`Show set ${i + 1}`} className={i === safePage ? 'rb-dot on' : 'rb-dot'} onClick={() => setPage(i)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuizHomeClient() {
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('all');
  const [sortBy, setSortBy] = useState('discover');
  const [groupBy, setGroupBy] = useState('category');
  const [listSort, setListSort] = useState('popularity');
  const [sortOpen, setSortOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [totals, setTotals] = useState({ total: 0, today: 0, totalCorrect: 0, totalPerfect: 0, totalTime: 0, todayTime: 0, byQuiz: {}, recent7: {}, recent12h: {}, trendingByQuiz: {}, trendingWindowH: 0, leaders: {} });
  const [recent, setRecent] = useState([]);
  const [todayBoard, setTodayBoard] = useState({ leaders: [], correctToday: 0, perfectToday: 0, playsToday: 0 });
  const [visitors, setVisitors] = useState(0);
  const [quizStats, setQuizStats] = useState([]);
  const [champions, setChampions] = useState({ correctAnswers: [], perfectQuizzes: [], completed: [] });
  const seedRef = useRef((Date.now() & 0xffffffff) >>> 0);
  // Close the category / sort dropdowns on an outside click or Escape.
  const ribbonRef = useRef(null);
  const ribbonScrollRef = useRef(null);
  const [navScroll, setNavScroll] = useState({ left: false, right: false });
  // Anchor the open dropdown under its ribbon button (panels live outside the
  // horizontally-scrolling ribbon so they aren't clipped; mobile uses full width).
  const catBtnRef = useRef(null);
  const typeBtnRef = useRef(null);
  const sortBtnRef = useRef(null);
  const [panelLeft, setPanelLeft] = useState(16);
  useEffect(() => {
    const onDown = (e) => { if (ribbonRef.current && !ribbonRef.current.contains(e.target)) { setCatOpen(false); setSortOpen(false); setTypeOpen(false); } };
    const onKey = (e) => { if (e.key === 'Escape') { setCatOpen(false); setSortOpen(false); setTypeOpen(false); } };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);
  // Mobile ribbon is a horizontal scroller; track scroll position so the red
  // edge cues show when there's more to scroll left/right.
  useEffect(() => {
    const el = ribbonScrollRef.current;
    if (!el) return undefined;
    const update = () => {
      const more = el.scrollWidth - el.clientWidth;
      setNavScroll({ left: el.scrollLeft > 2, right: more > 2 && el.scrollLeft < more - 2 });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  useEffect(() => {
    fetch('/api/quiz/totals').then((r) => r.json()).then((d) => { if (d && !d.error) setTotals({ total: d.total || 0, today: d.today || 0, totalCorrect: d.totalCorrect || 0, totalPerfect: d.totalPerfect || 0, totalTime: d.totalTime || 0, todayTime: d.todayTime || 0, byQuiz: d.byQuiz || {}, recent7: d.recent7 || {}, recent12h: d.recent12h || {}, trendingByQuiz: d.trendingByQuiz || {}, trendingWindowH: d.trendingWindowH || 0, leaders: d.leaders || {} }); }).catch(() => {});
    fetch('/api/quiz/recent').then((r) => r.json()).then((d) => { if (d && Array.isArray(d.plays)) setRecent(d.plays); }).catch(() => {});
    fetch('/api/quiz/today').then((r) => r.json()).then((d) => { if (d && !d.error) setTodayBoard({ leaders: Array.isArray(d.leaders) ? d.leaders : [], correctToday: d.correctToday || 0, perfectToday: d.perfectToday || 0, playsToday: d.playsToday || 0 }); }).catch(() => {});
    // Visitors on this page reflect quiz traffic only (the quiz home page +
    // individual quiz pages), not the whole site. Quiz-page views are merged
    // into bootstrap views under `quiz::<id>` keys; sum only those.
    fetchBootstrap().then((data) => { if (data && data.views) setVisitors(Object.entries(data.views).reduce((sum, [k, v]) => (k.startsWith('quiz::') ? sum + (Number(v) || 0) : sum), 0)); }).catch(() => {});
    fetch('/api/quiz/stats').then((r) => r.json()).then((d) => { if (d && Array.isArray(d.quizzes)) setQuizStats(d.quizzes); }).catch(() => {});
    fetch('/api/quiz/champions').then((r) => r.json()).then((d) => { if (d && !d.error) setChampions({ correctAnswers: Array.isArray(d.correctAnswers) ? d.correctAnswers : [], perfectQuizzes: Array.isArray(d.perfectQuizzes) ? d.perfectQuizzes : [], completed: Array.isArray(d.completed) ? d.completed : [] }); }).catch(() => {});
  }, []);

  // Count quiz-home-page landings toward this page's visitor total, so it
  // reflects the quiz home page plus individual quiz pages. Logged under the
  // pseudo quiz id 'home' in quiz_views (bootstrap merges it as `quiz::home`),
  // deduped to once per browser session. Mirrors the site homepage's landing
  // tracking.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem('sot-quizhome-viewed') === '1';
      if (!seen) sessionStorage.setItem('sot-quizhome-viewed', '1');
    } catch (e) { /* sessionStorage unavailable: count this load */ }
    if (!seen) {
      fetch('/api/quiz/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: 'home' }),
      }).catch(() => {});
    }
  }, []);

  const titleById = useMemo(() => Object.fromEntries(QUIZZES.map((q) => [q.id, q.title])), []);
  const recentEntries = useMemo(() => recent.map((p) => {
    const t = (titleById[p.quizId] || '').replace(/^Name (the )?/, '');
    if (!t) return null;
    const who = p.username ? p.username : 'Anonymous User';
    return { quizId: p.quizId, text: `${who} scored ${p.score}/${p.total}: ${t}` };
  }).filter(Boolean), [recent, titleById]);

  const counts = useMemo(() => {
    const c = { all: QUIZZES.length };
    for (const q of QUIZZES) { const d = deptOf(q); c[d] = (c[d] || 0) + 1; }
    return c;
  }, []);

  // Category dropdown options: "All" first, then every department ordered by
  // how many quizzes it holds (most first), so the menu mirrors the old ribbon.
  const deptOptions = useMemo(() => {
    const ordered = DEPT_NAV.slice().sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0) || a.label.localeCompare(b.label));
    return [{ id: 'all', label: 'All' }, ...ordered];
  }, [counts]);
  const currentDeptLabel = dept === 'all' ? 'All' : (DEPT_LABEL[dept] || 'Category');

  // Quiz-type filter options (with live counts). Picture overlaps name/match.
  const TYPE_LABELS = { all: 'All', name: 'Name', match: 'Match', locate: 'Locate', picture: 'Picture' };
  const typeOptions = useMemo(() => ['all', 'name', 'match', 'locate', 'picture'].map((id) => ({
    id,
    label: TYPE_LABELS[id],
    count: id === 'all' ? QUIZZES.length : QUIZZES.filter((q) => quizMatchesType(q, id)).length,
  })), []);
  const currentTypeLabel = TYPE_LABELS[typeFilter] || 'All';

  // Per-quiz aggregate stats (avg score etc.) for the Highest Scored ranking.
  const statById = useMemo(() => Object.fromEntries((quizStats || []).map((st) => [st.quizId, st])), [quizStats]);

  // Quiz-side leaderboard: Most Played / Trending Now / Highest Scored. Each
  // row links to its quiz and shows full title on desktop, short on mobile.
  const { playerCols, quizCols } = useMemo(() => {
    const mk = (q, val) => ({ key: q.id, href: `/quiz/${q.id}`, full: boardTitle(q.title), short: shortTitle(q.title), long: cleanTitle(q.title), val });
    const plays = (id) => totals.byQuiz[id] || 0;
    const isNewsId = (id) => /^(daily-market-news-quiz-|daily-business-quiz-|daily-news-quiz-|weekly-business-quiz-|weekly-news-quiz-|earnings-reporter-quiz-|earnings-quiz-)/.test(id || '');
    // Most Played: quizzes with the most completed games, all-time, top 3.
    const mostPlayed = QUIZZES.filter((q) => plays(q.id) > 0)
      .sort((a, b) => plays(b.id) - plays(a.id) || a.title.localeCompare(b.title))
      .slice(0, 3).map((q) => mk(q, <Count value={plays(q.id)} />));
    // Last Played: the literal most-recently-completed games (from
    // /api/quiz/recent, newest first), de-duplicated by quiz, top 3.
    const quizById = Object.fromEntries(QUIZZES.map((q) => [q.id, q]));
    const lastPlayed = [];
    const seenLP = new Set();
    for (const p of recent) {
      if (!p || !p.quizId || seenLP.has(p.quizId)) continue;
      const q = quizById[p.quizId];
      if (!q) continue;
      seenLP.add(p.quizId);
      lastPlayed.push(mk(q, p.playedAt ? <span style={{ color: COLORS.faded }}>{timeAgo(p.playedAt)}</span> : null));
      if (lastPlayed.length >= 3) break;
    }
    // Newest: most recently published quizzes (news quizzes excluded), top 3.
    const ts = (q) => new Date(q.publishedAt || `${q.publishedDate || '1970-01-01'}T12:00:00Z`).getTime();
    const newest = QUIZZES.filter((q) => q.id && !isNewsId(q.id))
      .slice()
      .sort((a, b) => ts(b) - ts(a) || a.title.localeCompare(b.title))
      .slice(0, 3).map((q) => ({ ...mk(q, <span style={{ color: COLORS.faded }}>{dateShort(q)}</span>), fresh: (Date.now() - ts(q)) < 7 * 86400000 }));
    // Players: today's correct answers (since midnight ET, /api/quiz/today),
    // all-time correct answers and most perfect quizzes (/api/quiz/champions).
    const todaysCorrect = (todayBoard.leaders || []).slice(0, 10).map((u, i) => ({ key: `tc-${i}-${u.username}`, full: u.username, val: (u.correct || 0).toLocaleString() }));
    const totalCorrect = (champions.correctAnswers || []).slice(0, 10).map((u, i) => ({ key: `cc-${i}-${u.username}`, full: u.username, val: (u.correct || 0).toLocaleString() }));
    const mostPerfect = (champions.perfectQuizzes || []).slice(0, 10).map((u, i) => ({ key: `pf-${i}-${u.username}`, full: u.username, val: (u.perfect || 0).toLocaleString() }));
    const mostUnique = (champions.completed || []).slice(0, 10).map((u, i) => ({ key: `uq-${i}-${u.username}`, full: u.username, val: (u.quizzes || 0).toLocaleString() }));
    return {
      playerCols: [
        { id: 'today', label: "Today's Correct Answers", rows: todaysCorrect, empty: 'No correct answers yet today.', accent: '#c98a1b', icon: <Check size={12} strokeWidth={3} aria-hidden="true" />, prize: true },
        { id: 'allcorrect', label: 'Total Correct Answers', rows: totalCorrect, empty: 'No answers recorded yet.', accent: '#3d4f2b', icon: <BarChart3 size={12} strokeWidth={2.5} aria-hidden="true" /> },
        { id: 'perfect', label: 'Most Perfect Quizzes', rows: mostPerfect, empty: 'No perfect runs yet.', accent: '#a44a26', icon: <Trophy size={12} strokeWidth={2.5} aria-hidden="true" /> },
        { id: 'unique', label: 'Most Unique Quizzes Played', rows: mostUnique, empty: 'No quizzes played yet.', accent: '#1f7a8c', icon: <Sparkles size={12} strokeWidth={2.5} aria-hidden="true" /> },
      ],
      quizCols: [
        { id: 'played', label: 'Most Played', rows: mostPlayed, empty: 'No plays recorded yet.', noMedals: true, accent: '#c0392b', icon: <Flame size={12} strokeWidth={2.5} aria-hidden="true" /> },
        { id: 'lastplayed', label: 'Last Played', rows: lastPlayed, empty: 'No recent plays yet.', noMedals: true, accent: '#2f6f9f', icon: <Clock size={12} strokeWidth={2.5} aria-hidden="true" /> },
        { id: 'newest', label: 'Newest', rows: newest, empty: 'No quizzes yet.', noMedals: true, accent: '#7a4fae', icon: <Sparkles size={12} strokeWidth={2.5} aria-hidden="true" /> },
      ],
    };
  }, [totals, statById, recent, todayBoard, champions]);

  const sorted = useMemo(() => {
    const ql = query.trim().toLowerCase();
    // Match every word in the query, in any order (so "africa map" and
    // "map africa" both find the Africa map quiz), mirroring the homepage search.
    const tokens = ql.split(/\s+/).filter(Boolean);
    let list = QUIZZES.filter((q) => {
      if (dept !== 'all' && deptOf(q) !== dept) return false;
      if (typeFilter !== 'all' && !quizMatchesType(q, typeFilter)) return false;
      if (!tokens.length) return true;
      const hay = `${q.title || ''} ${q.category || ''} ${q.blurb || ''}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
    const plays = (id) => totals.byQuiz[id] || 0;
    const recent = (id) => totals.recent7[id] || 0;
    if (sortBy === 'discover') {
      // Default landing: the first two rows (8 tiles at the 4-column desktop
      // grid) are a random assortment of quizzes that have caught on (more than
      // 2 plays); after those, true discover takes over with a random shuffle of
      // everything else. Both halves are seeded so the order is stable per load.
      const shuffled = seededShuffle(list, seedRef.current);
      const FEATURED_SLOTS = 8;
      const featured = shuffled.filter((q) => plays(q.id) > 2).slice(0, FEATURED_SLOTS);
      if (featured.length) {
        const featuredIds = new Set(featured.map((q) => q.id));
        list = [...featured, ...shuffled.filter((q) => !featuredIds.has(q.id))];
      } else {
        list = shuffled;
      }
    } else if (sortBy === 'popularity') list = list.slice().sort((a, b) => plays(b.id) - plays(a.id) || a.title.localeCompare(b.title));
    else if (sortBy === 'trending') list = list.slice().sort((a, b) => recent(b.id) - recent(a.id) || plays(b.id) - plays(a.id) || a.title.localeCompare(b.title));
    else if (sortBy === 'recent') {
      const ts = (q) => new Date(q.publishedAt || `${q.publishedDate || '1970-01-01'}T12:00:00Z`).getTime();
      list = list.slice().sort((a, b) => ts(b) - ts(a) || a.title.localeCompare(b.title));
    }
    // Daily/weekly news quizzes always sink to the very bottom of every view (the
    // full grid and any department they file under); they are surfaced via the red
    // Daily News banner and direct URL, not promoted among the tiles.
    const isNewsQuiz = (q) => /^(daily-market-news-quiz-|daily-business-quiz-|daily-news-quiz-|weekly-business-quiz-|weekly-news-quiz-|earnings-reporter-quiz-|earnings-quiz-)/.test(q.id || '');
    list = [...list.filter((q) => !isNewsQuiz(q)), ...list.filter((q) => isNewsQuiz(q))];
    return list;
  }, [query, dept, typeFilter, sortBy, totals]);

  // List view: group quizzes into sections (news quizzes excluded). "By
  // Category" shuffles the section order each page load; "By Type" buckets into
  // Name / Match / Locate / Picture. Search filters the quizzes within sections.
  const isSearching = query.trim().length > 0;
  const sections = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const isNewsQuiz = (q) => /^(daily-market-news-quiz-|daily-business-quiz-|daily-news-quiz-|weekly-business-quiz-|weekly-news-quiz-|earnings-reporter-quiz-|earnings-quiz-)/.test(q.id || '');
    const matches = QUIZZES.filter((q) => {
      if (isNewsQuiz(q)) return false;
      if (!tokens.length) return true;
      const hay = `${q.title || ''} ${q.category || ''} ${q.blurb || ''}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
    if (groupBy === 'type') {
      const byType = {};
      for (const q of matches) { const k = quizIsPicture(q) ? 'picture' : quizPrimaryType(q); (byType[k] = byType[k] || []).push(q); }
      const ids = ['name', 'match', 'locate', 'picture'].filter((k) => byType[k] && byType[k].length).sort((a, b) => byType[b].length - byType[a].length);
      return ids.map((k) => ({ key: k, label: TYPE_META[k].label, accent: TYPE_META[k].accent, Icon: TYPE_META[k].Icon, quizzes: byType[k] }));
    }
    const byDept = {};
    for (const q of matches) { const d = deptOf(q); (byDept[d] = byDept[d] || []).push(q); }
    const ids = seededShuffle(Object.keys(byDept), seedRef.current);
    return ids.map((id) => ({ key: id, label: DEPT_LABEL[id] || 'Quizzes', accent: DEPT_COLOR[id] || DEPT_COLOR.misc, Icon: SECTION_ICON[id] || Sparkles, quizzes: byDept[id] }));
  }, [query, groupBy]);
  const scrollToSection = (key) => {
    if (typeof document === 'undefined') return;
    const el = document.getElementById(`qzsec-${key}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const listLabel = dept === 'all' ? 'All Quizzes' : (DEPT_LABEL[dept] || 'Quizzes');
  const filtered = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const isNewsQuiz = (q) => /^(daily-market-news-quiz-|daily-business-quiz-|daily-news-quiz-|weekly-business-quiz-|weekly-news-quiz-|earnings-reporter-quiz-|earnings-quiz-)/.test(q.id || '');
    let list = QUIZZES.filter((q) => {
      if (isNewsQuiz(q)) return false;
      if (dept !== 'all' && deptOf(q) !== dept) return false;
      if (typeFilter !== 'all' && !quizMatchesType(q, typeFilter)) return false;
      if (!tokens.length) return true;
      const hay = `${q.title || ''} ${q.category || ''} ${q.blurb || ''}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
    const plays = (id) => totals.byQuiz[id] || 0;
    const trend = (id) => totals.trendingByQuiz[id] || totals.recent7[id] || 0;
    const ts = (q) => new Date(q.publishedAt || `${q.publishedDate || '1970-01-01'}T12:00:00Z`).getTime();
    if (listSort === 'recent') list = list.slice().sort((a, b) => ts(b) - ts(a) || a.title.localeCompare(b.title));
    else if (listSort === 'discover') list = seededShuffle(list, seedRef.current);
    else list = list.slice().sort((a, b) => plays(b.id) - plays(a.id) || a.title.localeCompare(b.title));
    return list;
  }, [dept, typeFilter, query, listSort, totals]);
  const showColumns = dept === 'all' && typeFilter === 'all' && !query.trim();
  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, position: 'relative', overflow: 'clip' }}>
      <Grain />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <header style={{ padding: '20px 24px 18px', maxWidth: 1200, margin: '0 auto' }}>

          <div className="cg-head">
            <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 'clamp(40px, 9vw, 84px)', lineHeight: 0.9, letterSpacing: '-0.015em', margin: 0, fontVariationSettings: '"SOFT" 100', color: COLORS.ink, whiteSpace: 'nowrap' }}>
              Source<br /><span style={{ fontStyle: 'italic', fontWeight: 400, color: COLORS.ember }}>of</span> Truths
            </h1>
            <div className="cg-head-col">
              <div className="cg-tagline">The Quizzes</div>
              <div className="cg-blurb">Timed quizzes across film, music, sports, and beyond. Test what you actually know.</div>
              <div style={{ borderBottom: `1px solid ${COLORS.ink}`, marginBottom: 4 }} />
              <div style={{ borderBottom: `2px solid ${COLORS.ember}` }} />
            </div>
          </div>
          <style>{`
            .cg-head{display:flex;align-items:flex-end;gap:clamp(16px,4vw,28px);}
            .cg-head-col{flex:1;min-width:0;margin-bottom:clamp(8px,1.4vw,14px);}
            .cg-tagline{font-family:'DM Mono',monospace;font-size:clamp(9px,1.1vw,11px);letter-spacing:0.2em;text-transform:uppercase;font-weight:700;color:${COLORS.ink};text-align:right;margin-bottom:8px;line-height:1.4;}
            .cg-blurb{font-family:'DM Sans',sans-serif;font-size:clamp(11px,1.25vw,13px);line-height:1.5;color:${COLORS.ink};text-align:right;max-width:520px;margin-left:auto;margin-bottom:10px;}
            @media(max-width:640px){.cg-head{flex-direction:column;align-items:stretch;gap:14px;}.cg-head-col{margin-bottom:0;}.cg-tagline{text-align:left;}.cg-blurb{text-align:left;max-width:none;margin-left:0;font-size:14px;}}
            .qz-stats{margin-top:16px;display:flex;align-items:baseline;flex-wrap:nowrap;white-space:nowrap;gap:16px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:${COLORS.faded};}
            .qz-tape{flex:1 1 auto;min-width:0;overflow:hidden;margin-left:8px;}
            .qz-tape-track{display:inline-block;white-space:nowrap;animation-name:qz-tape-scroll;animation-timing-function:linear;animation-iteration-count:infinite;will-change:transform;}
            .qz-tape-track:hover{animation-play-state:paused;}
            @keyframes qz-tape-scroll{from{transform:translateX(0);}to{transform:translateX(-50%);}}
            @media(max-width:760px){.qz-tape{display:none;}}
            .qz-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;}
            @media(max-width:1000px){.qz-grid{grid-template-columns:repeat(3,minmax(0,1fr));}}
            @media(max-width:760px){.qz-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
            @media(max-width:480px){.qz-grid{grid-template-columns:1fr;}}
            ${boardCss}
            .qz-ribbon{display:flex;align-items:stretch;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none;background:${COLORS.ink};border-bottom:3px solid ${COLORS.ember};}
            .qz-ribbon::-webkit-scrollbar{display:none;}
            .qz-rb-btn{flex:0 0 auto;display:flex;align-items:center;gap:8px;height:46px;background:transparent;color:${COLORS.cream};border:none;border-right:1px solid rgba(244,237,224,0.18);padding:0 18px;font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;cursor:pointer;white-space:nowrap;}
            .qz-rb-btn .qz-rb-chev{transition:transform 0.15s;}
            .qz-rb-search{flex:1 1 220px;min-width:170px;display:flex;align-items:center;position:relative;padding:6px 10px;}
            .qz-rb-search input{width:100%;height:34px;box-sizing:border-box;padding:0 32px 0 38px;background:#fff;border:1.5px solid ${COLORS.ink};outline:none;font-family:'DM Sans',sans-serif;font-size:14px;color:${COLORS.ink};}
            .qz-rb-search input::placeholder{color:${COLORS.faded};}
            .qz-rb-req{flex:0 0 auto;display:flex;align-items:center;justify-content:center;gap:6px;height:46px;background:${COLORS.ember};color:${COLORS.cream};padding:0 20px;font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;text-decoration:none;white-space:nowrap;}
            .qz-pop{position:absolute;top:100%;left:16px;z-index:40;background:${COLORS.cream};border:1.5px solid ${COLORS.ink};box-shadow:0 10px 24px rgba(26,22,17,0.25);}
            .qz-pop-sort{min-width:210px;}
            .qz-pop-cat{width:min(320px,calc(100vw - 40px));display:flex;flex-wrap:wrap;gap:8px;padding:14px 16px 16px;}
            .qz-pop-item{width:100%;display:flex;align-items:center;border:none;padding:10px 14px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;font-weight:600;cursor:pointer;text-align:left;background:transparent;color:${COLORS.ink};}
            .qz-chip{display:inline-flex;align-items:center;gap:7px;border:1.5px solid ${COLORS.ink};padding:8px 14px;font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;cursor:pointer;}
            @keyframes qzNavNudge{0%,100%{transform:translate(0,-50%);}50%{transform:translate(3px,-50%);}}
            @keyframes qzNavNudgeL{0%,100%{transform:translate(0,-50%);}50%{transform:translate(-3px,-50%);}}
            .qz-navcue{position:absolute;top:50%;z-index:30;display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:${COLORS.ember};color:${COLORS.cream};box-shadow:0 1px 4px rgba(26,22,17,0.45);pointer-events:none;font-size:15px;line-height:1;}
            .qz-navcue-r{right:6px;animation:qzNavNudge 1.4s ease-in-out infinite;}
            .qz-navcue-l{left:6px;animation:qzNavNudgeL 1.4s ease-in-out infinite;}
            @media(min-width:760px){.qz-navcue{display:none;}}
            @media(max-width:760px){
              .qz-rb-pre{display:none;}
              .qz-rb-btn{padding:0 11px;font-size:9.5px;letter-spacing:0.08em;gap:5px;}
              .qz-rb-req{padding:0 12px;font-size:9px;letter-spacing:0.06em;}
              .qz-rb-search{flex:0 0 auto;width:170px;}
              .qz-rb-search input{font-size:16px;}
              .qz-pop{left:8px !important;right:8px;}
              .qz-pop-cat{width:auto;}
            }
          `}</style>
          <div className="qz-stats">
            <span>{QUIZZES.length} quizzes</span>
            <span><span style={{ opacity: 0.5 }}>·</span> <Count value={totals.total} /> plays</span>
            <span><span style={{ opacity: 0.5 }}>·</span> <Count value={visitors} /> visitors</span>
            {recentEntries.length > 0 && (
              <span className="qz-tape">
                <span className="qz-tape-track" style={{ animationDuration: `${Math.max(40, recentEntries.length * 9)}s` }}>
                  {[0, 1].map((dup) => (
                    <span key={dup} aria-hidden={dup === 1 ? 'true' : undefined}>
                      {recentEntries.map((e, i) => (
                        <Link key={`${dup}-${i}`} href={`/quiz/${e.quizId}`} style={{ color: COLORS.ember, textDecoration: 'none' }}>
                          {e.text}<span aria-hidden="true" style={{ color: COLORS.faded, padding: '0 14px' }}>{'◆'}</span>
                        </Link>
                      ))}
                    </span>
                  ))}
                </span>
              </span>
            )}
          </div>
        </header>

        <nav style={{ position: 'sticky', top: 0, zIndex: 25, background: COLORS.cream }}>
          <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.12, mixBlendMode: 'multiply' }}>
            <filter id="qz-nav-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" /></filter>
            <rect width="100%" height="100%" filter="url(#qz-nav-grain)" />
          </svg>
          <div ref={ribbonRef} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', position: 'relative' }}>
            <div ref={ribbonScrollRef} className="qz-ribbon">
                                          <button ref={catBtnRef} type="button" className="qz-rb-btn" aria-haspopup="true" aria-expanded={catOpen} onClick={() => { const willOpen = !catOpen; if (willOpen && catBtnRef.current) setPanelLeft(catBtnRef.current.offsetLeft); setCatOpen(willOpen); setSortOpen(false); setTypeOpen(false); }}>
                <span><span className="qz-rb-pre" style={{ opacity: 0.7 }}>Category:</span> {currentDeptLabel}</span>
                <ChevronDown className="qz-rb-chev" size={14} strokeWidth={2.5} style={{ transform: catOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              <button ref={typeBtnRef} type="button" className="qz-rb-btn" aria-haspopup="true" aria-expanded={typeOpen} onClick={() => { const willOpen = !typeOpen; if (willOpen && typeBtnRef.current) setPanelLeft(typeBtnRef.current.offsetLeft); setTypeOpen(willOpen); setCatOpen(false); setSortOpen(false); }}>
                <span><span className="qz-rb-pre" style={{ opacity: 0.7 }}>Type:</span> {currentTypeLabel}</span>
                <ChevronDown className="qz-rb-chev" size={14} strokeWidth={2.5} style={{ transform: typeOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              <div className="qz-rb-search">
                <Search size={16} strokeWidth={2.5} style={{ position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)', color: COLORS.faded }} />
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search quizzes" />
                {query && (<button onClick={() => setQuery('')} aria-label="Clear search" style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: COLORS.faded, cursor: 'pointer', padding: 6, display: 'flex' }}><X size={16} strokeWidth={2.5} /></button>)}
              </div>
              <Link href="/request" className="qz-rb-req">Request a Quiz</Link>
              <Link href="/" className="qz-rb-req" style={{ background: COLORS.ink }}>Top 10 Lists</Link>
            </div>
            {navScroll.left && <span aria-hidden="true" className="qz-navcue qz-navcue-l">&#8249;</span>}
            {navScroll.right && <span aria-hidden="true" className="qz-navcue qz-navcue-r">&#8250;</span>}
            {catOpen && (
              <div className="qz-pop qz-pop-cat" role="menu" style={{ left: panelLeft }}>
                {deptOptions.map((o) => {
                  const active = dept === o.id;
                  return (
                    <button key={o.id} role="menuitem" className="qz-chip" onClick={() => { setDept(o.id); setCatOpen(false); }} style={{ background: active ? COLORS.ember : COLORS.paper, color: active ? COLORS.cream : COLORS.ink }}>
                      {o.label}<span style={{ opacity: 0.55, marginLeft: 2 }}>{counts[o.id] || 0}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {typeOpen && (
              <div className="qz-pop qz-pop-cat" role="menu" style={{ left: panelLeft }}>
                {typeOptions.map((o) => {
                  const active = typeFilter === o.id;
                  return (
                    <button key={o.id} role="menuitem" className="qz-chip" onClick={() => { setTypeFilter(o.id); setTypeOpen(false); }} style={{ background: active ? COLORS.ember : COLORS.paper, color: active ? COLORS.cream : COLORS.ink }}>
                      {o.label}<span style={{ opacity: 0.55, marginLeft: 2 }}>{o.count}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {sortOpen && (
              <div className="qz-pop qz-pop-sort" role="menu" style={{ left: panelLeft }}>
                {SORTS.map((opt, i) => {
                  const active = sortBy === opt.id;
                  return (<button key={opt.id} role="menuitem" className="qz-pop-item" onClick={() => { setSortBy(opt.id); setSortOpen(false); }} style={{ background: active ? COLORS.ink : 'transparent', color: active ? COLORS.cream : COLORS.ink, borderTop: i === 0 ? 'none' : `0.5px solid ${COLORS.paper}` }}>{opt.label}</button>);
                })}
              </div>
            )}
          </div>
        </nav>

        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 16px 64px' }}>

                              <div className="sp-spotlight-wrap">
            <SpotlightBoard columns={playerCols} />
          </div>
          <div className="sp-shelves">
            <ShelfBoard title="Recently Played" mid={todayBoard.playsToday > 0 ? (<><span className="qz-pulse" />{todayBoard.playsToday.toLocaleString()} plays today</>) : null} col={quizCols.find((c) => c.id === 'lastplayed')} withNew={false} />
            <ShelfBoard title="Just Added" href="/quizzes/stats" cta="Quiz Stats" col={quizCols.find((c) => c.id === 'newest')} withNew />
          </div>

                                                  {showColumns ? (
            <div className="ql-cols">
              {sections.map((s) => (
                <QuizCategoryColumn key={s.key} sectionKey={s.key} label={s.label} accent={s.accent} Icon={s.Icon} quizzes={s.quizzes} totals={totals} onViewAll={() => setDept(s.key)} />
              ))}
            </div>
          ) : (
            <div className="ql-block">
              <div className="ql-bhead">
                <h2 className="ql-bname">{listLabel}</h2>
                <div className="ql-toggle" role="group" aria-label="Sort quizzes">
                  {[['recent', 'New'], ['popularity', 'Popular'], ['discover', 'Discover']].map(([id, lbl]) => (
                    <button key={id} type="button" className="ql-tg" onClick={() => setListSort(id)} style={listSort === id ? { background: COLORS.ember, color: COLORS.cream } : undefined}>{lbl}</button>
                  ))}
                </div>
              </div>
              {filtered.length > 0 ? (
                <div className="ql-2col">
                  {filtered.map((q) => {
                    const leader = totals.leaders[q.id];
                    const p = totals.byQuiz[q.id] || 0;
                    return (
                      <Link key={q.id} href={`/quiz/${q.id}`} className="ql-row" title={q.title}>
                        <span className="ql-title">{boardTitle(q.title)}</span>
                        <span className="ql-meta">
                          {p > 0 && <span className="ql-plays">{'▶'} <Count value={p} /></span>}
                          <span className="ql-leader" style={{ color: leader ? COLORS.ink : COLORS.faded }}>
                            <Crown size={11} strokeWidth={2.5} aria-hidden="true" style={{ flex: 'none', color: COLORS.ember }} />
                            <span className="ql-lname">{leader || 'Empty'}</span>
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 24px', fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18, color: COLORS.faded }}>No quizzes match that filter.</div>
              )}
            </div>
          )}

        </section>
      </div>
      <Footer />
    </div>
  );
}
