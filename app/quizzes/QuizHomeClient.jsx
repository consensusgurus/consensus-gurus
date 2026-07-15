'use client';
import React, { useState, useEffect, useMemo, useRef, createContext, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QUIZ_COUNT } from '../SiteHeader';
import QuizCommandHeader from './QuizCommandHeader';
import DuelTile from './DuelTile';
import {
  Search, ChevronDown, ArrowRight, BarChart3, Crown, Sparkles, Flame,
  BadgeCheck, Clapperboard, Music, Gamepad2, Plane, Globe, Utensils,
  Briefcase, Leaf, Tv, BookOpen, Landmark, Trophy, UserPlus, Play, X,
  Check, Star, Target, Swords, Newspaper, Blocks, GraduationCap,
} from 'lucide-react';
import { QUIZZES } from '@/lib/quizzes';
import { KIDS_GAMES } from '@/lib/kids';
import DailyStrip from '../DailyStrip';
import { QUIZ_HEROES, qotdIdFor } from '@/lib/quiz-heroes';
import {
  quizDept as deptOf, DEPT_COLOR, DEPT_LABEL, DEPT_NAV,
} from '@/lib/quiz-departments';
import { getDailyChallenge, dailyChallengeId, openChallenges, challengeQuizIds, DAILY_CHALLENGE_ON, easternYmd } from '@/lib/challenges';
import { isBusinessNewsHubQuiz } from '@/lib/business-news-hub';
import Grain from '../Grain';
import Footer from '../Footer';

// Brand mark (gradient ids suffixed per render so multiple instances stay unique).
let __logoSeq = 0;
function Logo({ size = 22 }) {
  const uid = useMemo(() => `l${(__logoSeq += 1)}`, []);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flex: 'none' }} aria-hidden="true">
      <defs>
        <linearGradient id={`bh-${uid}`} x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3b74f0" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <radialGradient id={`gh-${uid}`} cx="0.5" cy="0.42" r="0.7">
          <stop offset="0" stopColor="#ffe24d" />
          <stop offset="0.55" stopColor="#fbb615" />
          <stop offset="1" stopColor="#f59008" />
        </radialGradient>
      </defs>
      <rect x="3" y="3" width="58" height="58" rx="17.5" fill={`url(#bh-${uid})`} />
      <circle cx="32" cy="32.5" r="16.4" stroke="#fff" strokeWidth="4.2" fill="none" />
      <circle cx="32" cy="32.5" r="9.6" stroke="#fff" strokeWidth="4.2" fill="none" strokeOpacity="0.9" />
      <path d="M 32 24.9 C 32.775 31.725 32.775 31.725 39.6 32.5 C 32.775 33.275 32.775 33.275 32 40.1 C 31.225 33.275 31.225 33.275 24.4 32.5 C 31.225 31.725 31.225 31.725 32 24.9 Z" fill={`url(#gh-${uid})`} />
    </svg>
  );
}

// ─── palette / type ─────────────────────────────────────────────────────────
const C = {
  bg: '#f7f8fa', surface: '#fff', ink: '#1c1e24', muted: '#6b7280',
  soft: '#9aa0ab', line: 'rgba(20,22,28,0.09)', accent: '#2563eb',
  accsoft: '#e8effb', live: '#10b981',
};
const MEDAL = ['#e8b43a', '#b8bcc4', '#c8814b'];
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const STATUS_LABEL = { unplayed: 'Unplayed', played: 'Played', completed: 'Completed' };
// Quiz of the Day is computed per render from the hero registry + rotation (see the qotd useMemo).
const DEPT_HERO = {
  movies: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Hollywood_sign_%288485145044%29.jpg/1280px-Hollywood_sign_%288485145044%29.jpg',
  music: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/D%C3%BClmen%2C_D%C3%BClmener_Sommer%2C_Open-Air-Konzert%2C_%22Bounce%22_--_2018_--_0051.jpg/960px-D%C3%BClmen%2C_D%C3%BClmener_Sommer%2C_Open-Air-Konzert%2C_%22Bounce%22_--_2018_--_0051.jpg',
  gaming: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Universum_TV_Multispiel_2006.jpg/960px-Universum_TV_Multispiel_2006.jpg',
  travel: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Beach_at_Fort_Lauderdale.jpg/960px-Beach_at_Fort_Lauderdale.jpg',
  sports: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Michigan_Stadium_Aerial.jpg/960px-Michigan_Stadium_Aerial.jpg',
  geography: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Meteosat-12-fci-march-equinox-2025-noon.jpg/960px-Meteosat-12-fci-march-equinox-2025-noon.jpg',
  food: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Barbieri_-_ViaSophia25668.jpg/960px-Barbieri_-_ViaSophia25668.jpg',
  business: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/NYC_Downtown_Manhattan_Skyline_seen_from_Paulus_Hook_2019-12-20_IMG_7347_FRD.jpg/960px-NYC_Downtown_Manhattan_Skyline_seen_from_Paulus_Hook_2019-12-20_IMG_7347_FRD.jpg',
  science: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Startrails_above_Gunung_Bromo_-_Indonesia.jpg/960px-Startrails_above_Gunung_Bromo_-_Indonesia.jpg',
  entertainment: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/%ED%8F%AC%EC%8B%9C%EC%A6%8C%EC%8A%A4_%EC%82%B0%EB%A6%AC%EC%98%A4%EB%8C%84%EC%8A%A4%ED%83%80%EC%9E%84_2025.jpg/960px-%ED%8F%AC%EC%8B%9C%EC%A6%8C%EC%8A%A4_%EC%82%B0%EB%A6%AC%EC%98%A4%EB%8C%84%EC%8A%A4%ED%83%80%EC%9E%84_2025.jpg',
  literature: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/SanDiegoCityCollegeLearningResource_-_bookshelf.jpg/960px-SanDiegoCityCollegeLearningResource_-_bookshelf.jpg',
  history: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/960px-Colosseo_2020.jpg',
  arts: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Museo_Chileno_de_Arte_Precolombino_-_2020_-_10.jpg/960px-Museo_Chileno_de_Arte_Precolombino_-_2020_-_10.jpg',
};

// Alternate department heroes, used ONLY when the Trending tile would repeat
// the Newest tile's image (both quizzes falling back to the same DEPT_HERO,
// or two quizzes sharing one hero). A department without an entry falls back
// to its plain category-color block instead of repeating the photo.
const DEPT_HERO_ALT = {
  geography: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/960px-The_Earth_seen_from_Apollo_17.jpg',
};

// Per-sport hero photos for the "Top Sports" tile, matched by keyword against the
// quiz title/id so e.g. a golf quiz shows a golf course, not a football stadium.
// First match wins; a quiz with its own QUIZ_HEROES entry still overrides this.
const SPORT_HERO = [
  [/\b(golf|pga|masters|ryder\s*cup|open\s*championship|augusta|st\.?\s*andrews)\b/i, 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Pebble_Beach_Golf_Links_02.jpg/960px-Pebble_Beach_Golf_Links_02.jpg'],
  [/\b(tennis|wimbledon|roland\s*garros|australian\s*open|atp|wta)\b/i, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/National_Tennis_Center_outside_courts_and_stadium.jpg/960px-National_Tennis_Center_outside_courts_and_stadium.jpg'],
  [/\b(nba|basketball|march\s*madness|wnba)\b/i, 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Rose_Garden_Arena_Interior.jpg/960px-Rose_Garden_Arena_Interior.jpg'],
  [/\b(nfl|super\s*bowl|american\s*football|quarterback|heisman|college\s*football)\b/i, 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Michigan_Stadium_Aerial.jpg/960px-Michigan_Stadium_Aerial.jpg'],
  [/\b(soccer|premier\s*league|fifa|world\s*cup|la\s*liga|uefa|champions\s*league|bundesliga|serie\s*a|mls)\b/i, 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Kashima_Soccer_Stadium_1.jpg/960px-Kashima_Soccer_Stadium_1.jpg'],
  [/\b(baseball|mlb|world\s*series|home\s*run)\b/i, 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Tianmu_Baseball_Stadium_aerial_photograph.jpg/960px-Tianmu_Baseball_Stadium_aerial_photograph.jpg'],
  [/\b(hockey|nhl|stanley\s*cup)\b/i, 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Ice_Hockey_Game_-_Madison_Square_Garden_-_Boston_vs_New_York.jpg/960px-Ice_Hockey_Game_-_Madison_Square_Garden_-_Boston_vs_New_York.jpg'],
  [/\b(olympic|olympics|olympian)\b/i, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/London_Olympic_Stadium_West_Ham.jpg/960px-London_Olympic_Stadium_West_Ham.jpg'],
  [/\b(formula\s*1|formula\s*one|f1|grand\s*prix|nascar|indycar|motogp|le\s*mans|racing)\b/i, 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Formula_1_race_cars_on_display.jpg/960px-Formula_1_race_cars_on_display.jpg'],
  [/\b(boxing|heavyweight|ufc|mma|knockout)\b/i, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mall_of_Asia_Arena_during_Pacquiao-Bradley_PPV.jpg/960px-Mall_of_Asia_Arena_during_Pacquiao-Bradley_PPV.jpg'],
];
function sportHeroFor(q) {
  if (!q) return null;
  const hay = ((q.title || '') + ' ' + (q.id || ''));
  for (let i = 0; i < SPORT_HERO.length; i++) { if (SPORT_HERO[i][0].test(hay)) return SPORT_HERO[i][1]; }
  return null;
}

// Daily-game quizzes are date/topic-stamped (crux-*, garble-*, links-*, span-*,
// closer-*) and every entry in a family shares ONE hero image, so the two hero
// tiles (Newest + Trending) must never both draw from the same family.
const DAILY_GAME_FAMILY_RE = /^(crux|garble|links|span|dating|tally|suds|closer)-/;
function gameFamily(id) { const m = (id || '').match(DAILY_GAME_FAMILY_RE); return m ? m[1] : null; }
// Rule: daily games (Crux, Garble, Links, Span, Dating, Closer) publish a fresh
// dated entry every day, so by publishedAt they are ALWAYS the "newest" quiz and
// would monopolize the Newest tile. They have their own hub tiles, so the Newest
// tile/list must never surface one. Keep this in sync with DAILY_GAME_FAMILY_RE.
const isDailyGame = (id) => DAILY_GAME_FAMILY_RE.test(id || '');

// Per-quiz completion status for the CURRENT player, supplied once at the top of
// the tree so any quiz row can show a check (played) or a circled check (aced at
// 100%) without threading props. Visible only to that player (built from their
// own profile). Empty for signed-out/preview visitors.
const QuizDoneContext = createContext({ played: null, completed: null });
function DoneMark({ id, size = 13 }) {
  const { played, completed } = useContext(QuizDoneContext);
  if (!id || (!played && !completed)) return null;
  if (completed && completed.has(id)) {
    return <Star className="donemark" size={size} strokeWidth={1.5} fill="#e8b43a" color="#e8b43a" style={{ flex: 'none', marginLeft: 5, verticalAlign: '-2px' }} aria-label="Completed (100%)" />;
  }
  if (played && played.has(id)) {
    return <Check className="donemark" size={size} strokeWidth={2.75} style={{ color: C.live, flex: 'none', marginLeft: 5, verticalAlign: '-2px' }} aria-label="Played" />;
  }
  return null;
}

// One lucide icon per department (no global CSS / webfonts).
const DEPT_ICON = {
  movies: Clapperboard, music: Music, gaming: Gamepad2, travel: Plane,
  sports: Trophy, geography: Globe, food: Utensils, business: Briefcase,
  science: Leaf, entertainment: Tv, literature: BookOpen, history: Landmark,
  school: GraduationCap, misc: Sparkles,
};

function seededShuffle(arr, seed) {
  const out = arr.slice();
  let s = (seed >>> 0) || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    const j = (s >>> 0) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function cleanTitle(t) { return (t || '').replace(/^Name (the )?/i, '').trim(); }
// Drop a leading action verb (and an optional the/all the/these) from a browse
// title for a tighter, scannable label. The FULL title is kept as the link's
// tooltip. e.g. "Click the Countries of Europe" -> "Countries of Europe",
// "Match the Slogan to the Company" -> "Slogan to the Company".
const VERB_RE = /^(Click|Name|Guess|Find|Identify|Pick|Select|Match|Pinpoint)\b\s*(all the|the|these)?\s*/i;
const FALLBACK_HERO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Earth%27s_City_Lights_by_DMSP%2C_1994-1995_%28large%29.jpg/1280px-Earth%27s_City_Lights_by_DMSP%2C_1994-1995_%28large%29.jpg';
// Promo tiles pinned to the very end of the browse grid (they link OUT of the
// main quiz catalog). Heroes are local SVGs in /public.
const PROMO_HERO = {
  business: '/qhero-business.svg',
  kids: '/qhero-kids.svg',
  tests: '/qhero-tests.svg',
};
// Rows shown inside the Standardized Tests tile (the six /exams practice tests).
const EXAM_TILE_ROWS = [
  { id: 'gmat', title: 'GMAT', href: '/gmat' },
  { id: 'sat', title: 'SAT', href: '/sat' },
  { id: 'act', title: 'ACT', href: '/act' },
  { id: 'gre', title: 'GRE', href: '/gre' },
  { id: 'lsat', title: 'LSAT', href: '/lsat' },
  { id: 'lsat-logic-game-gallery-wall', title: 'Logic Games: The Gallery Wall', rawTitle: 'LSAT Logic Games: The Gallery Wall', href: '/quiz/lsat-logic-game-gallery-wall' },
];
// The six standardized-test practice tests (/lsat, /gmat, /sat, /act, /gre,
// /mcat). Finishing one (tracked in localStorage 'sot_exam_done' by
// ExamQuizClient) counts toward the Standardized Tests mastery bar alongside
// the LSAT logic-game quizzes (dept 'school').
const EXAM_SLUGS = ['lsat', 'gmat', 'sat', 'act', 'gre', 'mcat'];
function stripVerb(t) {
  const out = (t || '').replace(VERB_RE, '').trim();
  return out || (t || '');
}
function relTime(iso) {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '';
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}
function getAnonId() {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem('sot_quiz_anon'); } catch { return null; }
}
function getIdentity() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('sot_quiz_identity')); } catch { return null; }
}

// ─── small presentational bits ──────────────────────────────────────────────
// Wraps a player name so clicking it opens that player on the Stat Hub
// (?player=<key>). Used inside quiz-row anchors, so it suppresses the parent
// link's navigation. No key (unattributable play) renders plain, unlinked.
function PlayerLink({ userKey, children }) {
  const router = useRouter();
  if (!userKey) return children;
  const go = (e) => { e.preventDefault(); e.stopPropagation(); router.push(`/quizzes/hub?player=${encodeURIComponent(userKey)}`); };
  return (
    <span role="link" tabIndex={0} onClick={go} onKeyDown={(e) => { if (e.key === 'Enter') go(e); }} style={{ cursor: 'pointer' }}>{children}</span>
  );
}

function WhoTag({ name, isAnon }) {
  if (isAnon) return (
    <span style={{ whiteSpace: 'nowrap' }}>
      <span style={{ fontWeight: 600, color: C.muted }}>{name}</span>{' '}
      <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: C.soft, border: `1px solid ${C.line}`, borderRadius: 4, padding: '1px 4px' }}>guest</span>
    </span>
  );
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      <span style={{ fontWeight: 700 }}>{name}</span>{' '}
      <BadgeCheck size={12} strokeWidth={2.5} style={{ color: C.accent, verticalAlign: '-2px' }} aria-hidden="true" />
    </span>
  );
}

function Medal({ i }) {
  if (i < 3) return (
    <span className="medaldot" style={{ flex: 'none', width: 18, height: 18, borderRadius: '50%', background: MEDAL[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: C.ink }}>{i + 1}</span>
  );
  return <span style={{ flex: 'none', width: 18, textAlign: 'center', fontSize: 11, color: C.soft }}>{i + 1}</span>;
}

// Leaderboard row: medal + name + value, with a gold/silver/bronze (neutral
// for 4th+) progress bar under the name scaled to the top score.
function LbRow({ i, name, value, frac }) {
  const col = i < 3 ? MEDAL[i] : C.soft;
  const w = Math.max(4, Math.min(100, Math.round((frac || 0) * 100)));
  return (
    <div className="lrow">
      <Medal i={i} />
      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="qtitle" style={{ flex: '1 1 auto' }}>{name}</span>
          <span style={{ flex: 'none', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        </div>
        <div style={{ height: 3, borderRadius: 3, background: '#eef1f5', marginTop: 4, overflow: 'hidden' }}><div className="lbbar" style={{ height: '100%', width: `${w}%`, background: col }} /></div>
      </div>
    </div>
  );
}

// Sign-up popup: claim a display name (email optional) so the player's name
// shows on the leaderboards. Posts to /api/quiz/join, stores identity, reloads.
function SignupModal({ onClose }) {
  const [u, setU] = useState('');
  const [em, setEm] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const inp = { width: '100%', boxSizing: 'border-box', border: `1px solid ${C.line}`, borderRadius: 10, padding: '11px 13px', fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 15, color: C.ink, outline: 'none' };
  async function submit() {
    setErr('');
    if (!u.trim()) { setErr('Pick a display name'); return; }
    setBusy(true);
    try {
      const r = await fetch('/api/quiz/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u.trim(), email: em.trim() || undefined, anonId: getAnonId() }) });
      const d = await r.json();
      if (d && d.username) {
        try { localStorage.setItem('sot_quiz_identity', JSON.stringify({ username: d.username, email: d.email || undefined })); } catch (e) {}
        window.location.reload();
      } else { setErr((d && d.error) || 'Could not sign up. Try again.'); setBusy(false); }
    } catch (e) { setErr('Could not sign up. Try again.'); setBusy(false); }
  }
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(20,22,28,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 380, maxWidth: '100%', background: '#fff', borderRadius: 14, border: `1px solid ${C.line}`, padding: 22, fontFamily: 'Manrope, system-ui, -apple-system, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>Claim your name</div>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: C.soft, display: 'flex' }}><X size={18} /></button>
        </div>
        <p style={{ fontSize: 13, color: C.muted, margin: '0 0 16px', lineHeight: 1.5 }}>Pick a display name to appear on the leaderboards. Email is optional, only used to recover your name on another device. No password needed.</p>
        {err && <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.4)', color: '#c0392b', fontSize: 13 }}>{err}</div>}
        <input value={u} onChange={(e) => setU(e.target.value)} placeholder="Display name" maxLength={15} style={inp} />
        <input value={em} onChange={(e) => setEm(e.target.value)} placeholder="Email (optional)" maxLength={120} style={{ ...inp, marginTop: 10 }} />
        <button onClick={submit} disabled={busy} style={{ marginTop: 16, width: '100%', background: C.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontWeight: 700, fontSize: 14, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1 }}>{busy ? 'Joining…' : 'Join the leaderboard'}</button>
      </div>
    </div>
  );
}

// ─── main ───────────────────────────────────────────────────────────────────
export default function QuizHomeClient() {
  const [scope, setScope] = useState('all');
  const [ddOpen, setDdOpen] = useState(false);
  const playerBarRef = useRef(null);
  const bestCatRef = useRef(null);
  const quizzesRef = useRef(null);
  const [search, setSearch] = useState('');
  const [listMode, setListMode] = useState(null); // null | 'newest' | 'mostplayed' | 'live' (View all expansions)
  const [doneFilter, setDoneFilter] = useState('all'); // 'all' | 'unplayed' | 'played' | 'completed' (my-progress filter)
  const [boardsExpanded, setBoardsExpanded] = useState(false); // header click expands both boards 5 -> 10
  const [mobileBoard, setMobileBoard] = useState(null); // mobile-only: null | 'lb' | 'live' (which board panel is shown)
  // Daily games row: Crux is pinned top-right on mobile; the top-LEFT slot
  // cycles through the other dailies on each page load (localStorage counter,
  // set post-mount so SSR/hydration stay deterministic).
  const [gameRot, setGameRot] = useState('garble');
  useEffect(() => {
    try {
      const others = ['garble', 'links', 'span', 'dating', 'tally'];
      const n = (parseInt(localStorage.getItem('sot_hub_game_rot') || '-1', 10) + 1) % others.length;
      localStorage.setItem('sot_hub_game_rot', String(n));
      setGameRot(others[n]);
    } catch (e) {}
  }, []);
  const lastTapRef = useRef({ k: null, t: 0 });
  const dblTapBoard = (k) => {
    const now = Date.now(); const last = lastTapRef.current;
    if (last.k === k && now - last.t < 400) { setMobileBoard((v) => (v === k ? null : k)); lastTapRef.current = { k: null, t: 0 }; }
    else { lastTapRef.current = { k, t: now }; }
  };

  const [totals, setTotals] = useState({ byQuiz: {}, recent7: {}, leaders: {}, leaderKeys: {}, today: 0 });
  const [xpBoard, setXpBoard] = useState([]); // [{rank,name,isAnon,userKey}]
  const [xpScope, setXpScope] = useState('all');
  const [catBoards, setCatBoards] = useState({}); // { dept: [{rank,name,isAnon,userKey,rating}] } for the "Top Rated <Category>" slides
  const [recent, setRecent] = useState([]); // [{quizId,username,score,total,playedAt,isAnon,attempt}]
  const [me, setMe] = useState(null);
  const [lbIdx, setLbIdx] = useState(0); // which leaderboard stat is showing
  const [view, setView] = useState('compact'); // 'compact' | 'detailed' browse layout
  const [statsById, setStatsById] = useState({}); // /api/quiz/stats keyed by quizId
  const [signupOpen, setSignupOpen] = useState(false);
  const [duels, setDuels] = useState([]); // last few completed duels, for the header ticker
  const [statsOpen, setStatsOpen] = useState(false);
  const [dailyLb, setDailyLb] = useState(null); // today's daily-challenge standings (registered players)
  const [chRun, setChRun] = useState(null); // local run-state for today's daily challenge (completion ticks)
  const [examsDone, setExamsDone] = useState({}); // { <examSlug>: true } finished practice tests (localStorage 'sot_exam_done')
  const [isMobile, setIsMobile] = useState(false);
  const [acc, setAcc] = useState({ lastplayed: true, mostplayed: true, newest: true, daily: true }); // mobile-only: which accordion panels are open
  const [lbLiveTab, setLbLiveTab] = useState(null); // mobile combined leaderboard/live: null | 'lb' | 'live'
  const toggleAcc = (k) => setAcc((o) => ({ ...o, [k]: !o[k] }));
  const mobLbOpen = false; // mobile leaderboard shows top 5 (desktop click-to-expand still applies via boardsExpanded)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width:560px)');
    const on = () => setIsMobile(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const [todayData, setTodayData] = useState({ byCorrect: [], byQuizzes: [] }); // /api/quiz/today leaders
  // Today's daily challenge (deterministic from the date; no server state needed).
  const daily = useMemo(() => getDailyChallenge(), []);
  const qotd = useMemo(() => {
    const existing = new Set(QUIZZES.map((q) => q.id));
    let id = qotdIdFor(easternYmd(), existing);
    let q = id ? QUIZZES.find((x) => x.id === id) : null;
    if (!q) { for (const hid of Object.keys(QUIZ_HEROES)) { const cand = QUIZZES.find((x) => x.id === hid); if (cand) { q = cand; id = hid; break; } } }
    if (!q) return null;
    const h = QUIZ_HEROES[id] || {};
    return { id: q.id, eyebrow: `Quiz of the Day · ${DEPT_LABEL[deptOf(q)] || 'Quiz'}`, title: cleanTitle(q.title), blurb: q.blurb || '', hero: h.src || '', pos: h.pos };
  }, []);
  const dailyCat = daily ? daily.accent : '';
  // Every challenge open right now (today's daily + open events like the Outline
  // Challenge). The header CTA rotates through these like the leaderboard slides.
  const openChs = useMemo(() => openChallenges(), []);
  // Business News moved to its own tile at the end of the browse grid, so the
  // browse-row rotating CTA is now empty (curCh becomes null → nothing renders).
  const rotation = useMemo(() => [], []);
  const [chSlide, setChSlide] = useState(0);
  useEffect(() => {
    if (rotation.length < 2) return;
    const id = setTimeout(() => setChSlide((i) => (i + 1) % rotation.length), 5000);
    return () => clearTimeout(id);
  }, [chSlide, rotation.length]);
  const curCh = rotation.length ? rotation[chSlide % rotation.length] : null;
  // Count visits to the quizzes index in the per-quiz analytics, under the
  // pseudo quiz id 'home' (mirrors the homepage's 'home' list-view row).
  // Deduped to once per browser session. Restored 2026-06-28 after the June 18
  // redesign dropped it.
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

  // Restore the saved browse-view preference once on mount.
  useEffect(() => {
    try { const v = localStorage.getItem('sot_quiz_browse_view'); if (v === 'detailed' || v === 'compact') setView(v); } catch {}
  }, []);
  function setBrowseView(v) { setView(v); try { localStorage.setItem('sot_quiz_browse_view', v); } catch {} }

  // Build the catalog once: every quiz, with its department + nav title.
  const catalog = useMemo(() => (QUIZZES || []).filter((q) => q && q.id && !q.unlisted && (!q.publishedAt || Date.parse(q.publishedAt) <= Date.now())).map((q) => ({
    id: q.id,
    title: q.navTitle || cleanTitle(q.title) || q.id,
    rawTitle: q.title || '',
    category: q.category || '',
    blurb: q.blurb || '',
    dept: deptOf(q),
    publishedAt: q.publishedAt || (q.publishedDate ? `${q.publishedDate}T12:00:00Z` : ''),
  })), []);

  const titleById = useMemo(() => Object.fromEntries(catalog.map((q) => [q.id, q.title])), [catalog]);

  // Today's daily challenge: ordered quiz ids + local completion (run-state).
  const dailyId = daily ? daily.id : null;
  const dailyIds = useMemo(() => (daily ? challengeQuizIds(daily) : []), [daily]);
  const chScores = (chRun && chRun.scores) || {};
  // Server-truth completion for the signed-in player (cross-device): the daily
  // challenge leaderboard carries each registered user's per-quiz scores today.
  const myDaily = useMemo(() => (dailyLb || []).find((u) => (me && me.userKey && u.userKey === me.userKey) || (me && me.username && u.username && u.username.toLowerCase() === me.username.toLowerCase())) || null, [dailyLb, me]);
  const serverScores = (myDaily && myDaily.scores) || {};
  const dailyIsDone = (id) => !!chScores[id] || serverScores[id] != null;
  const dailyDoneCount = dailyIds.filter(dailyIsDone).length;
  const dailyAllDone = dailyIds.length > 0 && dailyDoneCount === dailyIds.length;
  const dailyNextIdx = (() => { const k = dailyIds.findIndex((id) => !dailyIsDone(id)); return k < 0 ? 0 : k; })();
  const dailyEntryUrl = (dailyId && dailyIds.length) ? `/quiz/${dailyIds[dailyNextIdx]}?ch=${encodeURIComponent(dailyId)}&i=${dailyNextIdx}` : '/quizzes';
  const dailyDateLabel = daily ? (() => { try { return new Date(`${daily.date}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); } catch { return ''; } })() : '';

  // Departments present, with counts, ordered by size desc (mockup order).
  const cats = useMemo(() => {
    const byDept = new Map();
    for (const q of catalog) {
      if (!byDept.has(q.dept)) byDept.set(q.dept, []);
      byDept.get(q.dept).push(q);
    }
    const list = [];
    for (const { id } of DEPT_NAV) if (byDept.has(id)) list.push(id);
    for (const k of byDept.keys()) if (!list.includes(k)) list.push(k);
    return list.map((key) => {
      const color = DEPT_COLOR[key] || DEPT_COLOR.misc;
      return {
        key,
        label: DEPT_LABEL[key] || 'Quiz',
        c: color.c, t: color.t,
        Icon: DEPT_ICON[key] || Sparkles,
        quizzes: byDept.get(key),
        count: byDept.get(key).length,
      };
    }).sort((a, b) => b.count - a.count);
  }, [catalog]);
  const byKey = useMemo(() => Object.fromEntries(cats.map((c) => [c.key, c])), [cats]);

  const totalCount = catalog.length;
  const scopeCount = scope === 'all' ? totalCount : (byKey[scope]?.count || 0);
  // My-progress filter: split the catalog by the player's played/aced status,
  // matching the row icons (green check = played, gold star = aced at 100%).
  const statusSets = useMemo(() => ({
    played: new Set((me && me.found && me.playedIds) || []),
    completed: new Set((me && me.found && me.completedIds) || []),
  }), [me]);
  const statusCounts = useMemo(() => {
    const pl = statusSets.played, cp = statusSets.completed;
    const playedNotAced = [...pl].filter((id) => !cp.has(id)).length;
    return { unplayed: Math.max(0, totalCount - pl.size), played: playedNotAced, completed: cp.size };
  }, [statusSets, totalCount]);
  const statusList = useMemo(() => {
    if (doneFilter === 'all') return null;
    const pl = statusSets.played, cp = statusSets.completed;
    return catalog.filter((q) => {
      const p = pl.has(q.id), c = cp.has(q.id);
      if (doneFilter === 'completed') return c;
      if (doneFilter === 'played') return p && !c;
      return !p; // unplayed
    }).sort((a, b) => a.title.localeCompare(b.title));
  }, [doneFilter, catalog, statusSets]);

  // ── data loads ──
  useEffect(() => {
    fetch('/api/quiz/totals').then((r) => r.json()).then((d) => {
      if (d && !d.error) setTotals({ byQuiz: d.byQuiz || {}, recent7: d.recent7 || {}, leaders: d.leaders || {}, leaderKeys: d.leaderKeys || {}, today: d.today || 0 });
    }).catch(() => {});
    fetch('/api/quiz/recent').then((r) => r.json()).then((d) => {
      if (d && Array.isArray(d.plays)) setRecent(d.plays);
    }).catch(() => {});
    fetch('/api/quiz/stats').then((r) => r.json()).then((d) => {
      if (d && Array.isArray(d.quizzes)) setStatsById(Object.fromEntries(d.quizzes.map((q) => [q.quizId, q])));
    }).catch(() => {});
    if (DAILY_CHALLENGE_ON) fetch(`/api/quiz/challenge-leaderboard?id=${encodeURIComponent(dailyChallengeId())}`).then((r) => r.json()).then((d) => {
      if (d && Array.isArray(d.users)) setDailyLb(d.users);
    }).catch(() => {});
    fetch('/api/quiz/today').then((r) => r.json()).then((d) => {
      if (d) setTodayData({ byCorrect: Array.isArray(d.leaders) ? d.leaders : [], byQuizzes: Array.isArray(d.quizLeaders) ? d.quizLeaders : [] });
    }).catch(() => {});
    fetch('/api/duel/latest').then((r) => r.json()).then((d) => {
      if (d) setDuels(Array.isArray(d.duels) ? d.duels : (d.duel ? [d.duel] : []));
    }).catch(() => {});
  }, []);

  // Read today's daily-challenge run-state from localStorage (drives the box's
  // per-quiz completion ticks); refresh on focus so finishing a quiz updates it.
  useEffect(() => {
    if (!dailyId) return;
    const read = () => { try { setChRun(JSON.parse(localStorage.getItem(`sot_chrun_${dailyId}`) || 'null')); } catch { setChRun(null); } };
    read();
    const onVis = () => { if (!document.hidden) read(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', read);
    return () => { document.removeEventListener('visibilitychange', onVis); window.removeEventListener('focus', read); };
  }, [dailyId]);

  // Standardized-test practice completions (finished once, stored by
  // ExamQuizClient); refresh on focus so finishing a test updates the
  // Standardized Tests mastery bar.
  useEffect(() => {
    const read = () => { try { setExamsDone(JSON.parse(localStorage.getItem('sot_exam_done') || '{}') || {}); } catch { setExamsDone({}); } };
    read();
    const onVis = () => { if (!document.hidden) read(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', read);
    return () => { document.removeEventListener('visibilitychange', onVis); window.removeEventListener('focus', read); };
  }, []);

  // XP leaderboard re-loads when the scope changes.
  useEffect(() => {
    // Pull the FULL ranking (not just top-12-by-XP) so the cycling
    // leaderboard's non-XP slides (Most Correct, etc.) surface the true
    // per-metric leaders, not just whoever is already top by XP.
    const q = scope === 'all' ? '?full=1' : `?scope=${encodeURIComponent(scope)}&full=1`;
    let alive = true;
    fetch(`/api/quiz/xp${q}`).then((r) => r.json()).then((d) => {
      if (!alive) return;
      if (d && Array.isArray(d.players)) { setXpBoard(d.players); setXpScope(d.scope || scope); }
    }).catch(() => {});
    return () => { alive = false; };
  }, [scope]);

  // Per-category XP boards (computed once) power the rotating
  // "<Category> XP Leaders" leaderboard slides.
  useEffect(() => {
    fetch('/api/quiz/xp-categories').then((r) => r.json()).then((d) => {
      if (d && d.boards) setCatBoards(d.boards);
    }).catch(() => {});
  }, []);

  const [duelNotif, setDuelNotif] = useState({ challenges: [], results: [], yourTurn: [] });
  const [duelSeen, setDuelSeen] = useState({});
  const [duelLater, setDuelLater] = useState({});
  const [duelMuted, setDuelMuted] = useState({});
  const [duelMuteAll, setDuelMuteAll] = useState(false);
  function loadDuelNotif() {
    const anon = getAnonId();
    if (!anon) return;
    const em = getIdentity();
    const emq = em && em.email ? `&email=${encodeURIComponent(em.email)}` : '';
    fetch(`/api/duel/notifications?anonId=${encodeURIComponent(anon)}${emq}`).then((r) => r.json()).then((d) => { if (d) setDuelNotif({ challenges: d.challenges || [], results: d.results || [], yourTurn: d.yourTurn || [] }); }).catch(() => {});
  }
  useEffect(() => {
    try { setDuelSeen(JSON.parse(localStorage.getItem('sot_duel_seen') || '{}') || {}); } catch {}
    try { setDuelLater(JSON.parse(localStorage.getItem('sot_duel_later') || '{}') || {}); } catch {}
    try { setDuelMuted(JSON.parse(localStorage.getItem('sot_duel_muted') || '{}') || {}); } catch {}
    try { setDuelMuteAll(localStorage.getItem('sot_duel_mute_all') === '1'); } catch {}
    loadDuelNotif();
    // 45s -> 120s and skip hidden tabs (egress fix 2026-07-12); the
    // visibilitychange refresh catches up as soon as the tab returns.
    const _dnPoll = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') loadDuelNotif();
    }, 120000);
    const _dnVis = () => { if (document.visibilityState === 'visible') loadDuelNotif(); };
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', _dnVis);
    return () => {
      clearInterval(_dnPoll);
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', _dnVis);
    };
  }, []);
  async function duelDecline(token) { const idn = getIdentity(); const nm = (idn && idn.username) || 'Player'; try { await fetch('/api/duel/decline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, anonId: getAnonId(), name: nm, email: (idn && idn.email) || undefined }) }); } catch {} loadDuelNotif(); }
  function duelDismissServer(token, kind) { try { const anon = getAnonId(); if (!anon) return; const idn = getIdentity(); fetch('/api/duel/dismiss', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, kind, anonId: anon, email: (idn && idn.email) || undefined }) }).catch(() => {}); } catch {} }
  function duelSeenAdd(token) { duelDismissServer(token, 'seen'); setDuelSeen((s) => { const n = { ...s, [token]: 1 }; try { localStorage.setItem('sot_duel_seen', JSON.stringify(n)); } catch {} return n; }); }
  function duelLaterAdd(token) { duelDismissServer(token, 'later'); setDuelLater((s) => { const n = { ...s, [token]: 1 }; try { localStorage.setItem('sot_duel_later', JSON.stringify(n)); } catch {} return n; }); }
  function duelMuteAdd(anon, name, token) { if (!anon) { duelLaterAdd(token); return; } setDuelMuted((m) => { const n = { ...m, [anon]: name || 'Player' }; try { localStorage.setItem('sot_duel_muted', JSON.stringify(n)); } catch {} return n; }); duelLaterAdd(token); }

  // Current player's stats (overall — used for the player bar + pinned "You").
  useEffect(() => {
    const ident = getIdentity();
    const anonId = getAnonId();
    const email = ident && ident.email ? ident.email : '';
    if (!anonId && !email) { setMe(null); return; }
    const params = new URLSearchParams();
    if (anonId) params.set('anonId', anonId);
    if (email) params.set('email', email);
    fetch(`/api/quiz/me?${params.toString()}`).then((r) => r.json()).then((d) => {
      if (d) setMe(d);
    }).catch(() => {});
  }, []);

  function plays(id) { return totals.byQuiz[id] || 0; }
  function leader(id) { return totals.leaders[id] || ''; }
  function leaderKey(id) { return (totals.leaderKeys && totals.leaderKeys[id]) || ''; }

  // Player-bar stats: overall by default; for a selected category, the player's
  // figures + rank WITHIN that category (from me.byCategory[scope]). Falls back
  // to overall / '—' when the player has no matches in the chosen category.
  const playerStats = useMemo(() => {
    if (!me || !me.found) return null;
    if (scope === 'all') {
      const a = me.activity || {};
      return {
        rank: (me.ranks && me.ranks.xp) || me.rank || null,
        denom: me.totalPlayers || 0,
        correct: a.correct ?? null,
        played: a.played ?? null,
        completed: a.completed ?? null,
        accuracy: a.accuracy ?? null,
        playedRank: (me.ranks && me.ranks.played) || null,
        correctRank: (me.ranks && me.ranks.correct) || null,
        completedRank: (me.ranks && me.ranks.completed) || null,
        accuracyRank: (me.ranks && me.ranks.accuracy) || null,
      };
    }
    const c = me.byCategory ? me.byCategory[scope] : null;
    if (!c) return { rank: null, denom: 0, correct: null, played: null, completed: null, accuracy: null };
    return {
      rank: c.rank || null,
      denom: c.catTotal || 0,
      correct: c.correct ?? null,
      played: c.played ?? null,
      completed: c.completed ?? null,
      accuracy: c.accuracy ?? null,
      playedRank: c.playedRank || null,
      correctRank: c.correctRank || null,
      completedRank: c.completedRank || null,
      accuracyRank: c.accuracyRank || null,
    };
  }, [me, scope]);

  // ── leaderboard: re-ranks per slide AND per category ──
  // Each slide sorts the board by that slide's metric (desc; ties by XP then
  // name), scoped to the selected category (the XP API already returns the
  // per-category metric values). The Most XP slide DOES show the XP total.
  // Today's daily-challenge standings, ranked by total correct then least time.
  const dailyRows = useMemo(() => (dailyLb || []).slice()
    .sort((a, b) => (b.totalCorrect || 0) - (a.totalCorrect || 0) || (a.totalTime || 0) - (b.totalTime || 0) || (a.username || '').localeCompare(b.username || ''))
    .slice(0, (boardsExpanded || mobLbOpen) ? 10 : 5), [dailyLb, boardsExpanded, mobLbOpen]);
  const todayCorrectRows = useMemo(() => (todayData.byCorrect || []).slice(0, (boardsExpanded || mobLbOpen) ? 10 : 5), [todayData, boardsExpanded, mobLbOpen]);
  const todayQuizRows = useMemo(() => (todayData.byQuizzes || []).slice(0, (boardsExpanded || mobLbOpen) ? 10 : 5), [todayData, boardsExpanded, mobLbOpen]);
  const bestCat = useMemo(() => {
    if (!me || !me.byCategory) return null;
    // Best category = where the player ranks highest on COMPLETED; ties break to
    // XP rank in that category, then to played rank.
    let best = null;
    for (const k of Object.keys(me.byCategory)) {
      const c = me.byCategory[k];
      if (!c || !(c.matches > 0)) continue;
      const cand = { key: k, rank: c.completedRank ?? c.rank, catTotal: c.catTotal,
        cR: c.completedRank ?? Infinity, sR: c.rank ?? Infinity, pR: c.playedRank ?? Infinity };
      if (!best || cand.cR < best.cR
          || (cand.cR === best.cR && cand.sR < best.sR)
          || (cand.cR === best.cR && cand.sR === best.sR && cand.pR < best.pR)) best = cand;
    }
    return best;
  }, [me]);
  // The daily-challenge slide joins the rotation ONLY once >=2 registered
  // players have played today's challenge.
  const LB_METRICS = useMemo(() => {
    const base = [
      { key: 'xp', label: 'Most XP', fmt: (v) => (v || 0).toLocaleString(), ms: 7000 },
      { key: 'correct', label: 'Most Correct Answers', fmt: (v) => (v || 0).toLocaleString(), ms: 5000 },
      { key: 'completed', label: 'Most Quizzes Aced (100%)', fmt: (v) => (v || 0).toLocaleString(), ms: 5000 },
      { key: 'daysPlayed', label: 'Most Days Played', fmt: (v) => (v || 0).toLocaleString(), ms: 5000 },
      { key: 'accuracy', label: 'Highest Accuracy', fmt: (v) => `${v || 0}%`, ms: 5000 },
    ];
    if (DAILY_CHALLENGE_ON && dailyRows.length >= 2) base.splice(1, 0, { key: 'dailyChallenge', special: true, label: `Today's Challenge${dailyCat ? ` · ${dailyCat}` : ''}`, fmt: (v) => (v || 0).toLocaleString(), ms: 6000 });
    const extra = [];
    if (todayCorrectRows.length >= 1) extra.push({ key: 'correctToday', special: true, label: 'Correct Today', fmt: (v) => (v || 0).toLocaleString(), ms: 5000 });
    if (todayQuizRows.length >= 1) extra.push({ key: 'quizzesToday', special: true, label: 'Quizzes Today', fmt: (v) => (v || 0).toLocaleString(), ms: 5000 });
    if (extra.length) base.splice((DAILY_CHALLENGE_ON && dailyRows.length >= 2) ? 2 : 1, 0, ...extra);
    // Per-category "Top Rated <Category>" slides join the rotation only on the
    // overall view (Category: All), in DEPT_NAV order, skipping empty boards.
    const catSlides = scope === 'all'
      ? DEPT_NAV
          .filter((d) => Array.isArray(catBoards[d.id]) && catBoards[d.id].length > 0)
          .map((d) => ({ key: 'catRating', catKey: d.id, special: true, label: `${DEPT_LABEL[d.id] || d.label} XP Leaders`, fmt: (v) => (v || 0).toLocaleString(), ms: 5000 }))
      : [];
    return [...base, ...catSlides];
  }, [dailyRows.length, dailyCat, todayCorrectRows.length, todayQuizRows.length, scope, catBoards]);
  const lbMetric = LB_METRICS[Math.min(lbIdx, LB_METRICS.length - 1)];
  // Per-slide timeout: the XP slide holds 7s, every other slide 5s.
  useEffect(() => {
    const id = setTimeout(() => setLbIdx((i) => (i + 1) % LB_METRICS.length), lbMetric.ms);
    return () => clearTimeout(id);
  }, [lbIdx, lbMetric.ms, LB_METRICS.length]);
  // Sort the displayed board by the active slide's metric, scoped to the current
  // category (xpBoard is already category-scoped via the /api/quiz/xp refetch).
  const leaderRows = useMemo(() => {
    const k = lbMetric.key;
    // Highest Accuracy needs a real sample: only players with >=10 unique
    // quizzes played qualify (a 100% from one quiz shouldn't top the board).
    const pool = k === 'accuracy' ? xpBoard.filter((p) => (p.played || 0) >= 10) : xpBoard;
    const sorted = pool.slice().sort((a, b) =>
      ((b[k] || 0) - (a[k] || 0))
      || ((b.xp || 0) - (a.xp || 0))
      || (a.name || '').localeCompare(b.name || '')
    );
    // Guests are included in the public board (owner rule 2026-06-30).
    const list = sorted;
    return list.slice(0, 20);
  }, [xpBoard, lbMetric.key, boardsExpanded, mobLbOpen]);

  // Compact top-3 for the active leaderboard slide, shown in the player stat
  // bar on the quiz hub (the leaderboard lives in the stat line here).
  const lbBar = useMemo(() => {
    const label = (lbMetric.special || scope === 'all' ? lbMetric.label : `${(byKey[scope] && byKey[scope].label) || ''} ${lbMetric.label}`.trim()) + ':';
    let rows = [];
    if (lbMetric.special) {
      if (lbMetric.key === 'catRating') {
        rows = (catBoards[lbMetric.catKey] || []).filter((r) => !r.isAnon).slice(0, 3).map((r) => ({ name: r.name || 'Player', value: lbMetric.fmt(r.xp) }));
      } else {
        const src = lbMetric.key === 'dailyChallenge' ? dailyRows : lbMetric.key === 'correctToday' ? todayCorrectRows : todayQuizRows;
        const valOf = lbMetric.key === 'dailyChallenge' ? ((r) => r.totalCorrect) : lbMetric.key === 'correctToday' ? ((r) => r.correct) : ((r) => r.quizzes);
        rows = src.filter((r) => !r.isAnon).slice(0, 3).map((r) => ({ name: r.username || 'Player', value: (valOf(r) || 0).toLocaleString() }));
      }
    } else {
      rows = leaderRows.filter((r) => !r.isAnon).slice(0, 3).map((r) => ({ name: r.name || 'Player', value: lbMetric.fmt(r[lbMetric.key]) }));
    }
    return { label, rows };
  }, [lbMetric, scope, byKey, catBoards, dailyRows, todayCorrectRows, todayQuizRows, leaderRows]);

  // ── live feed (scoped by quiz department) ──
  const liveRows = useMemo(() => {
    const rows = recent.filter((p) => p && p.quizId && titleById[p.quizId]).map((p) => ({ ...p, dept: deptOf({ id: p.quizId }), title: titleById[p.quizId] }));
    const scoped = scope === 'all' ? rows : rows.filter((r) => r.dept === scope);
    return scoped.slice(0, boardsExpanded ? 10 : 4);
  }, [recent, scope, titleById, boardsExpanded]);

  const playsToday = totals.today || 0;

  // ── browse columns ──
  // Newest first (so the dedupe sets below can reference it), then Most Played
  // excluding anything already in Newest, then each category column excluding
  // everything shown in Newest + Most Played. No quiz appears twice on the page.
  const newest = useMemo(() => catalog.slice()
    .filter((q) => !isBusinessNewsHubQuiz(q.id) && !isDailyGame(q.id))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0))
    .slice(0, 6), [catalog]);
  // ── header ticker: recent plays + today's leaders + duels + new quizzes ──
  // Round-robin interleaved so types alternate. Built from data the page
  // already loads; the only extra fetch is /api/duel/latest (last few duels).
  const tickerItems = useMemo(() => {
    const ago = (iso) => {
      if (!iso) return null;
      const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
      if (!(m >= 1)) return 'now';
      if (m < 60) return `${m}m`;
      const h = Math.round(m / 60);
      return h < 24 ? `${h}h` : `${Math.round(h / 24)}d`;
    };
    const playRows = (recent || [])
      .filter((p) => p && p.quizId && titleById[p.quizId])
      .slice(0, 8)
      .map((p) => ({ type: 'play', href: `/quiz/${p.quizId}`, segs: [
        { text: p.name || 'Player', strong: true },
        { text: ` ${p.score}/${p.total} on ` },
        { text: titleById[p.quizId], strong: true },
        ...(ago(p.playedAt) ? [{ text: ` · ${ago(p.playedAt)}`, dim: true }] : []),
      ] }));
    const leads = (todayCorrectRows || []).filter((r) => !r.isAnon).slice(0, 3).map((r, i) => ({
      type: 'lead', href: '/quizzes/hub', segs: [
        { text: r.username || 'Player', strong: true },
        { text: i === 0 ? ' leads Correct Today' : ` is #${i + 1} for Correct Today` },
        { text: ` · ${(r.correct || 0).toLocaleString()}`, dim: true },
      ] }));
    if (DAILY_CHALLENGE_ON && dailyRows.length && dailyRows[0] && !dailyRows[0].isAnon) {
      leads.push({ type: 'lead', href: '/quizzes/hub', segs: [
        { text: dailyRows[0].username || 'Player', strong: true },
        { text: ` leads Today's Challenge${dailyCat ? ` (${dailyCat})` : ''}` },
      ] });
    }
    const duelRows = (duels || []).slice(0, 4).map((d) => {
      const tie = d.winner === 'tie';
      const chWon = d.winner === 'challenger';
      const w = (tie || chWon) ? d.challenger_name : d.opponent_name;
      const l = (tie || chWon) ? d.opponent_name : d.challenger_name;
      const ws = (tie || chWon) ? d.challenger_score : d.opponent_score;
      const ls = (tie || chWon) ? d.opponent_score : d.challenger_score;
      return { type: 'duel', href: '/quizzes/hub?tab=duels', segs: tie
        ? [{ text: w || 'Player', strong: true }, { text: ' and ' }, { text: l || 'Player', strong: true }, { text: ` tied a Duel ${ws} to ${ls}` }]
        : [{ text: w || 'Player', strong: true }, { text: ' beat ' }, { text: l || 'Player', strong: true }, { text: ` in a Duel ${ws} to ${ls}` }] };
    });
    const fresh = (newest || []).slice(0, 2).map((q) => ({ type: 'new', href: `/quiz/${q.id}`, segs: [
      { text: 'New quiz: ' }, { text: q.title, strong: true },
    ] }));
    const stat = playsToday > 0 ? [{ type: 'stat', href: '/quizzes/hub', segs: [
      { text: `${playsToday.toLocaleString()} plays today`, strong: true },
    ] }] : [];
    const pools = [playRows, [...leads, ...stat], duelRows, fresh];
    const out = [];
    for (let i = 0; out.length < 24; i += 1) {
      const before = out.length;
      for (const pool of pools) { if (pool[i]) out.push(pool[i]); }
      if (out.length === before) break;
    }
    return out;
  }, [recent, titleById, todayCorrectRows, dailyRows, dailyCat, duels, newest, playsToday]);
  // Business News hub quizzes (market-moving recaps, earnings, sector updates),
  // newest first — shown inside the Business News promo tile.
  const businessNewsRows = useMemo(() => catalog.slice()
    .filter((q) => isBusinessNewsHubQuiz(q.id))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0))
    .slice(0, 6), [catalog]);
  const newestIds = useMemo(() => new Set(newest.map((q) => q.id)), [newest]);
  const mostPlayed = useMemo(() => {
    let pool;
    if (scope === 'all') pool = catalog;
    else pool = byKey[scope] ? byKey[scope].quizzes : [];
    const exclude = scope === 'all' ? newestIds : new Set();
    return pool.map((q) => ({ ...q, p: plays(q.id) }))
      .filter((q) => q.p > 0 && !exclude.has(q.id))
      .sort((a, b) => b.p - a.p || a.title.localeCompare(b.title))
      .slice(0, 15);
  }, [catalog, byKey, scope, totals, newestIds]);

  // Trending = highest-plays quiz that is NOT in the top-3 most played, NOT the
  // newest, and NOT the quiz of the day. Drives the second hero tile.
  const trending = useMemo(() => {
    const week = (id) => (totals.recent7 && totals.recent7[id]) || 0;
    // Exclusions stay the same: the top-3 most-played (ALL-TIME, since those are
    // the tiles shown in the Most Played board), the newest quiz, and the quiz of
    // the day, so the tile never repeats what is already featured elsewhere.
    const rankedAll = catalog.map((q) => ({ ...q, p: plays(q.id) })).filter((q) => q.p > 0)
      .sort((a, b) => b.p - a.p || (a.title || '').localeCompare(b.title || ''));
    const excl = new Set(rankedAll.slice(0, 3).map((q) => q.id));
    if (newest[0]) excl.add(newest[0].id);
    if (qotd) excl.add(qotd.id);
    // Newest and Trending must never be the same daily-game family (they'd share
    // one hero image), so also block whatever family the Newest / QOTD tiles use.
    const blockedFams = new Set([newest[0] && gameFamily(newest[0].id), qotd && gameFamily(qotd.id)].filter(Boolean));
    const blocked = (cand) => excl.has(cand.id) || blockedFams.has(gameFamily(cand.id));
    // Pick the single most-played quiz OVER THE LAST 7 DAYS among the rest. Fall
    // back to the all-time pick only if nothing was played this week (edge case),
    // so the tile never goes empty.
    const rankedWeek = catalog.map((q) => ({ ...q, p: week(q.id) })).filter((q) => q.p > 0)
      .sort((a, b) => b.p - a.p || (a.title || '').localeCompare(b.title || ''));
    return rankedWeek.find((cand) => !blocked(cand)) || rankedAll.find((cand) => !blocked(cand)) || null;
  }, [catalog, newest, qotd, totals]);
  // Ids already surfaced in the Newest + Most Played columns (all-scope only).
  const shownIds = useMemo(() => {
    if (scope !== 'all') return new Set();
    const set = new Set(newestIds);
    mostPlayed.slice(0, 6).forEach((q) => set.add(q.id));
    return set;
  }, [scope, newestIds, mostPlayed]);
  // Full "View all" lists (every quiz, not the 6-row column preview).
  // Conditional navy backdrops for the hero-tile leader chips: probe the photo
  // behind each footer overlay (scrim folded in) and pill only when too light.
  const nQH = newest[0] ? QUIZ_HEROES[newest[0].id] : null;
  const nHero = newest[0] ? ((nQH && nQH.src) || DEPT_HERO[newest[0].dept] || null) : null;
  const nHeroPos = nQH ? nQH.pos : undefined;
  const [ntileProbeRef, ntilePill] = usePillProbe(nHero, PILL_REGION_FOOTER, 0.72, true);
  // Rule: the Trending tile may never repeat the Newest tile's hero image.
  // When both resolve to the same src, Trending swaps to the department's
  // alternate hero (DEPT_HERO_ALT), or to its category-color block if the
  // department has no alternate. Computed BEFORE the pill probe so the probe
  // samples the image actually rendered.
  const tQH = trending ? QUIZ_HEROES[trending.id] : null;
  let tHero = trending ? ((tQH && tQH.src) || DEPT_HERO[trending.dept] || null) : null;
  let tHeroPos = tQH ? tQH.pos : undefined;
  if (tHero && tHero === nHero) { tHero = DEPT_HERO_ALT[trending.dept] || FALLBACK_HERO; tHeroPos = undefined; }
  const [ttileProbeRef, ttilePill] = usePillProbe(tHero, PILL_REGION_FOOTER, 0.72, true);

  // ── Daily-rotating category hero tiles ────────────────────────────────────
  // "Top Geo Guesser" cycles through the Geo Guesser games; "Top Sports" cycles
  // through Sports quizzes. Both advance once per Eastern day (midnight ET) and
  // are ordered by 7-day plays so the most-trending surfaces first in the cycle.
  // [[timezone: rotations key off easternYmd, never the sandbox UTC clock]]
  const rotDay = useMemo(() => {
    try { return Math.round((Date.parse(easternYmd() + 'T00:00:00.000Z') - Date.parse('2026-07-01T00:00:00.000Z')) / 86400000); }
    catch { return 0; }
  }, []);
  const wkPlays = (id) => (totals.recent7 && totals.recent7[id]) || 0;
  const pickDaily = (pool) => (pool.length ? pool[((rotDay % pool.length) + pool.length) % pool.length] : null);
  const geoPick = useMemo(() => {
    const excl = new Set([qotd && qotd.id, newest[0] && newest[0].id, trending && trending.id].filter(Boolean));
    const pool = catalog.filter((q) => /geo-guesser/.test(q.id) && !excl.has(q.id))
      .sort((a, b) => wkPlays(b.id) - wkPlays(a.id) || plays(b.id) - plays(a.id) || (a.title || '').localeCompare(b.title || ''));
    return pickDaily(pool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, totals, rotDay, qotd, newest, trending]);
  const sportsPick = useMemo(() => {
    const excl = new Set([qotd && qotd.id, newest[0] && newest[0].id, trending && trending.id, geoPick && geoPick.id].filter(Boolean));
    const pool = catalog.filter((q) => q.dept === 'sports' && !excl.has(q.id))
      .sort((a, b) => wkPlays(b.id) - wkPlays(a.id) || plays(b.id) - plays(a.id) || (a.title || '').localeCompare(b.title || ''));
    return pickDaily(pool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, totals, rotDay, qotd, newest, trending, geoPick]);
  const geoQH = geoPick ? QUIZ_HEROES[geoPick.id] : null;
  const geoHero = geoPick ? ((geoQH && geoQH.src) || DEPT_HERO[geoPick.dept] || DEPT_HERO.geography || FALLBACK_HERO) : null;
  const geoPos = geoQH ? geoQH.pos : undefined;
  const sptQH = sportsPick ? QUIZ_HEROES[sportsPick.id] : null;
  const sptHero = sportsPick ? ((sptQH && sptQH.src) || sportHeroFor(sportsPick) || DEPT_HERO[sportsPick.dept] || DEPT_HERO.sports || FALLBACK_HERO) : null;
  const sptPos = sptQH ? sptQH.pos : undefined;

  const newestAll = useMemo(() => catalog.slice()
    .filter((q) => !isBusinessNewsHubQuiz(q.id) && !isDailyGame(q.id))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0)), [catalog]);
  const mostPlayedAll = useMemo(() => catalog.slice()
    .sort((a, b) => plays(b.id) - plays(a.id) || a.title.localeCompare(b.title)), [catalog, totals]);
  const liveAll = useMemo(() => recent.filter((p) => p && p.quizId && titleById[p.quizId]).map((p) => ({ ...p, title: titleById[p.quizId] })), [recent, titleById]);
  // "Last Played" browse column: most recent plays, deduped to distinct quizzes
  // (the live feed relocated into the browse grid as the first column).
  const lastPlayed = useMemo(() => {
    // Multiplier: how many of the recent raw plays (across the whole fetched
    // feed, which now reaches back ~1000 games) were this quiz, so repeat plays
    // hidden by the distinct-quiz dedupe still surface as "xN". Capped x99. The
    // deep window lets the distinct-quiz list fill its 5 rows even when the
    // newest plays are dominated by a single quiz.
    const windowCounts = {};
    for (const f of liveAll) { if (f && f.quizId) windowCounts[f.quizId] = (windowCounts[f.quizId] || 0) + 1; }
    const seen = new Set(); const out = [];
    for (const f of liveAll) { if (!f || !f.quizId || seen.has(f.quizId)) continue; seen.add(f.quizId); out.push({ ...f, mult: Math.min(99, windowCounts[f.quizId] || 1) }); if (out.length >= 15) break; }
    return out;
  }, [liveAll]);
  // Newest-tile hero resolves deterministically from QUIZ_HEROES / DEPT_HERO (no async lookup, so it never flashes a fallback photo first).
  const [chCopied, setChCopied] = useState(false);
  const [mDaily, setMDaily] = useState(false);
  const [mLb, setMLb] = useState(false);
  function shareChallenge() {
    const url = (typeof window !== 'undefined' ? window.location.origin : '') + `/quiz/${qotd ? qotd.id : ''}`;
    const data = { title: 'Source of Truths', text: 'Can you beat me on today’s quiz?', url };
    if (typeof navigator !== 'undefined' && navigator.share) { navigator.share(data).catch(() => {}); }
    else if (typeof navigator !== 'undefined' && navigator.clipboard) { navigator.clipboard.writeText(url).then(() => { setChCopied(true); setTimeout(() => setChCopied(false), 2000); }).catch(() => {}); }
  }
  function goCat(key) { setScope(key); setDoneFilter('all'); setListMode(null); setSearch(''); try { if (quizzesRef.current) quizzesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {} }
  const catMastery = useMemo(() => {
    if (!cats || !cats.length) return [];
    const bc = (me && me.byCategory) || {};
    // Standardized Tests (dept 'school') completion blends the LSAT logic-game
    // quizzes with the six practice tests: denominator = logic games + 6 tests,
    // numerator = distinct logic games played + distinct tests finished once.
    const examsDoneCount = EXAM_SLUGS.filter((s) => examsDone && examsDone[s]).length;
    const rows = cats.map((c) => {
      const cc = bc[c.key] || {};
      let played = cc.played || 0;
      let total = c.count || 0;
      if (c.key === 'school') { played += examsDoneCount; total += EXAM_SLUGS.length; }
      const pct = total > 0 ? Math.round((played / total) * 100) : 0;
      return { key: c.key, label: c.label, pct };
    }).sort((a, b) => b.pct - a.pct || a.label.localeCompare(b.label));
    if (!rows.length || rows[0].pct === 0) return [];
    return rows.map((r) => ({ key: r.key, label: r.label, acc: r.pct }));
  }, [me, cats, examsDone]);

  function colRows(cat, lim, exclude) {
    // Business tile preview hides the whole Business News quiz hub (daily/weekly
    // recaps, company earnings, sector updates); they still show under View all.
    const base = cat.key === 'business' ? cat.quizzes.filter((q) => !isBusinessNewsHubQuiz(q.id)) : cat.quizzes;
    const sorted = base.slice()
      .sort((a, b) => plays(b.id) - plays(a.id) || a.title.localeCompare(b.title));
    if (!exclude) return sorted.slice(0, lim);
    const primary = sorted.filter((q) => !exclude.has(q.id));
    // Backfill short department columns (e.g. a small/new-heavy dept whose newest
    // quizzes are surfaced in the Newest column and thus excluded) so the card is
    // never left near-empty; big columns never run short and keep full de-dup.
    if (primary.length >= lim) return primary.slice(0, lim);
    const backfill = sorted.filter((q) => exclude.has(q.id));
    return primary.concat(backfill).slice(0, lim);
  }

  // Search across the whole catalog.
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    const terms = q.split(/\s+/).filter(Boolean);
    return catalog.filter((c) => {
      const hay = (c.rawTitle + ' ' + c.title + ' ' + c.category + ' ' + c.blurb).toLowerCase();
      return terms.every((t) => hay.includes(t));
    }).slice(0, 80);
  }, [search, catalog]);

  // Hide "Best category" only when the player bar is forced to wrap to a new
  // row. Gated on width change so toggling the element (a height-only change)
  // can't cause a feedback loop. Below the mobile breakpoint CSS owns layout.
  useEffect(() => {
    const bar = playerBarRef.current;
    if (!bar) return;
    let lastW = -1;
    const evaluate = () => {
      const w = bar.clientWidth;
      if (w === lastW) return;
      lastW = w;
      const el = bestCatRef.current;
      if (el) el.style.display = '';
      const maxRows = w <= 560 ? 2 : 1;
      // Count visual rows by each child's vertical CENTER: with align-items:center
      // all items on one flex line share a center, so this is robust to the
      // differing item heights that make raw offsetTop read as multiple rows.
      const rows = [];
      for (const child of bar.children) {
        if (child.offsetWidth === 0 && child.offsetHeight === 0) continue;
        const cen = child.offsetTop + child.offsetHeight / 2;
        if (!rows.some((x) => Math.abs(x - cen) <= 6)) rows.push(cen);
      }
      if (el) el.style.display = rows.length > maxRows ? 'none' : '';
      bar.classList.toggle('hub-bleed', rows.length === 1 && w > 560);
    };
    const ro = new ResizeObserver(evaluate);
    ro.observe(bar);
    evaluate();
    return () => ro.disconnect();
  }, [bestCat, playerStats, scope]);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
    .qzh{font-family:${FONT};color:${C.ink};}
    .qzh .lbl{font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:${C.muted};}
    .qzh .card{background:${C.surface};border:1px solid ${C.line};border-radius:12px;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
    .qzh .boards .card{background:${C.surface};border-color:${C.line};}
    .qzh .head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 13px 9px;background:#f1f3f6;border-bottom:1px solid ${C.line};min-height:42px;cursor:pointer;}
    .qzh .head .lbl{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px;}
    .qzh .head .qlink{flex:none;white-space:nowrap;}
    .qzh .lrow{display:flex;align-items:center;gap:9px;padding:5.5px 13px;font-size:12.5px;}
    .qzh .qtitle{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .qzh .att{font-size:9.5px;font-weight:700;color:${C.soft};}
    .qzh .score{flex:none;font-weight:700;color:${C.accent};font-variant-numeric:tabular-nums;}
    @media(max-width:680px){.qzh .lf-extra{display:none;}}
    @keyframes qzp{0%{opacity:1}50%{opacity:.35}100%{opacity:1}}
    .qzh .dd{position:relative;}
    .qzh .ddbtn{display:flex;align-items:center;gap:8px;background:#fff;border:1.5px solid #b8c0cc;border-radius:10px;padding:9px 12px;cursor:pointer;font:inherit;}
    .qzh .qz-searchwrap input::placeholder{color:#5b6472;opacity:1;}
    .qzh .ddmenu{position:absolute;top:calc(100% + 6px);right:0;z-index:30;background:#fff;border:1px solid ${C.line};border-radius:10px;box-shadow:0 8px 24px rgba(20,22,28,0.12);padding:6px;min-width:430px;display:grid;grid-template-columns:1fr 1fr;gap:1px 4px;}
    .qzh .ddmenu .ddall{grid-column:1 / -1;}
    @media(max-width:560px){.qzh .ddmenu{left:0;right:auto;width:88vw;min-width:0;max-width:88vw;grid-template-columns:1fr 1fr;max-height:60vh;overflow-y:auto;}}
    .qzh .dditem{display:flex;align-items:center;gap:9px;padding:7px 9px;border-radius:7px;cursor:pointer;font-size:13px;}
    .qzh .ddhead{display:none;}
    @media(max-width:560px){.qzh .ddhead{display:flex !important;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;margin:-6px -6px 5px;padding:10px 12px;border-bottom:1px solid ${C.line};z-index:3;font-weight:700;font-size:13px;color:${C.ink};}.qzh .ddhead .ddclose{background:#eef1f6;border:none;border-radius:8px;width:34px;height:34px;font-size:17px;line-height:1;cursor:pointer;color:${C.ink};display:flex;align-items:center;justify-content:center;flex:none;}}
    .qzh .dditem:hover{background:${C.bg};}
    .qzh .dot{width:9px;height:9px;border-radius:3px;flex:none;}
    /* Daily games row: four half-height buttons above the hero tiles */
    .qzh .th-games{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin-bottom:14px;}
    @media(min-width:761px){.qzh .th-g-crux{order:1;}.qzh .th-g-garble{order:2;}.qzh .th-g-links{order:3;}.qzh .th-g-span{order:4;}.qzh .th-g-dating{order:5;}.qzh .th-g-tally{order:6;}}
    .qzh .th-game{position:relative;display:flex;flex-direction:row;align-items:center;gap:10px;min-height:86px;border:1px solid ${C.line};border-radius:14px;background:#0e1d40;padding:11px 15px;text-decoration:none;overflow:hidden;}
    .qzh .th-game:hover{border-color:#5b8bff;}
    .qzh .th-game-txt{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1 1 auto;overflow:hidden;}
    .qzh .th-game-art{flex:0 0 auto;height:52px;width:auto;max-width:56px;object-fit:contain;}
    .qzh .th-game-tag{font-size:9px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:#f8b84a;margin-bottom:3px;}
    .qzh .th-game-t{font-size:17px;font-weight:800;letter-spacing:-.3px;color:#fff;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .qzh .th-game-p{font-size:11.5px;font-weight:700;color:#9fb0d4;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    @media(max-width:1180px){.qzh .th-game-art{height:44px;max-width:48px;}.qzh .th-game-p{display:none;}}
    @media(max-width:1080px){.qzh .th-game-art{height:40px;}.qzh .th-game{padding:11px 12px;gap:8px;}}
    @media(max-width:980px){.qzh .th-game-art{height:34px;max-width:36px;}.qzh .th-game{padding:10px 10px;gap:7px;}.qzh .th-game-t{font-size:15.5px;}}
    @media(max-width:900px){.qzh .th-game{min-height:64px;}}
    @media(max-width:760px){
      .qzh .th-games{grid-template-columns:repeat(6,minmax(0,1fr));gap:9px;}
      .qzh .th-game{min-height:58px;background-position:right center;}
      .qzh .th-game:nth-child(-n+2){grid-column:span 3;}
      .qzh .th-game:nth-child(n+3){grid-column:span 3;min-height:44px;padding:8px 9px;gap:6px;}
      .qzh .th-game:nth-child(n+3) .th-game-tag{display:none;}
      .qzh .th-game:nth-child(n+3) .th-game-t{font-size:13.5px;}
      .qzh .th-game:nth-child(n+3) .th-game-art{height:24px;}
    }
    .qzh .qotd{display:flex;align-items:stretch;gap:0;background:#0e1d40;border:1px solid ${C.line};border-radius:14px;overflow:hidden;min-height:215px;text-decoration:none;color:#fff;}
    .qzh .qotd-photo{flex:0 0 48%;background-size:cover;background-position:center;min-height:180px;}
    .qzh .qotd-body{flex:1 1 auto;min-width:0;padding:18px 22px;display:flex;flex-direction:column;justify-content:center;}
    .qzh .qotd-eyebrow{font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#f8b84a;margin-bottom:7px;}
    .qzh .qotd-title{font-size:28px;font-weight:800;letter-spacing:-.02em;line-height:1.04;color:#fff;}
    .qzh .qotd-meta{font-size:13px;color:#9fb0d4;margin-top:7px;max-width:560px;line-height:1.45;}
    .qzh .qotd-foot{display:flex;align-items:center;gap:14px;margin-top:15px;flex-wrap:wrap;}
    .qzh .qotd-play{display:inline-flex;align-items:center;gap:7px;background:${C.accent};color:#fff;border-radius:9px;padding:10px 20px;font-weight:800;font-size:14px;}
    .qzh .qotd:hover .qotd-play{background:#1d4ed8;}
    .qzh .th-heroes{display:grid;grid-template-columns:minmax(0,0.95fr) minmax(0,0.95fr) minmax(0,1fr) minmax(0,1fr);gap:12px;}
    /* Desktop: top row shares the second row's 4-col template so QOTD lines up exactly over Geo+Sports, Newest over Trending, Daily Challenge over Duel. */
    @media(min-width:1025px){.qzh .th-heroes .th-qotd{grid-column:1 / 3;}}
    @media(max-width:760px){.qzh .th-heroes{grid-template-columns:minmax(0,1fr);}}
    .qzh .ttile{position:relative;border:1px solid ${C.line};border-radius:14px;overflow:hidden;text-decoration:none;display:flex;flex-direction:column;justify-content:flex-end;min-height:215px;background-size:cover;background-position:center;background-color:#0e1d40;}
    .qzh .ttile-tag{position:absolute;top:12px;left:12px;font-size:10px;font-weight:800;letter-spacing:.08em;background:#fff;border-radius:10px;padding:4px 10px;z-index:2;color:#c2410c;display:inline-flex;align-items:center;gap:4px;}
    .qzh .ttile-ov{position:relative;z-index:1;padding:18px 16px 15px;background:linear-gradient(to top, rgba(8,15,35,0.9), rgba(8,15,35,0.45) 55%, rgba(8,15,35,0));}
    .qzh .ttile-t{font-size:20px;font-weight:800;letter-spacing:-.3px;line-height:1.1;color:#fff;}
    .qzh .ttile-foot{display:flex;align-items:center;gap:12px;margin-top:9px;}
    .qzh .ttile-p{font-size:13px;font-weight:800;color:#fff;}
    .qzh .ttile-plays{font-size:12px;font-weight:800;color:#fff;}
    /* Daily-rotating category hero tiles (Top Geo Guesser / Top Sports): same look as .ttile, own class so th-r2 order rules do not collide. */
    .qzh .hstile{position:relative;border:1px solid ${C.line};border-radius:14px;overflow:hidden;text-decoration:none;display:flex;flex-direction:column;justify-content:flex-end;min-height:215px;background-size:cover;background-position:center;background-color:#0e1d40;}
    .qzh .qotd-stats{font-size:12px;color:#fff;font-weight:800;display:inline-flex;align-items:center;gap:6px;min-width:0;}
    @media(max-width:760px){.qzh .qotd{flex-direction:column;min-height:0;}.qzh .qotd-photo{flex:none;height:128px;}.qzh .qotd-title{font-size:21px;}}
    .qzh .thub{display:flex;gap:12px;margin-bottom:14px;align-items:stretch;}
    .qzh .thub-left{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:12px;}
    .qzh .th-rail{flex:0 0 188px;}
    .qzh .th-r2{display:grid;grid-template-columns:minmax(0,0.95fr) minmax(0,0.95fr) minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:stretch;}
    .qzh .th-r2 .th-slot-hold{min-height:215px;}
    @media(max-width:820px){.qzh .thub{flex-direction:column;}.qzh .th-rail{align-self:stretch;}.qzh .th-r2{grid-template-columns:1fr 1fr;}.qzh .th-r2 .dtile{grid-column:1 / -1;}.qzh .th-r2 .dueltile{grid-column:1 / -1;}}
    @media(max-width:560px){.qzh .th-r2{grid-template-columns:minmax(0,1fr);}.qzh .th-rail{display:none !important;}.qzh .th-heroes .ntile{min-height:220px;background-position:center 12%;}.qzh .th-r2 .ttile{order:1;min-height:220px;}.qzh .th-r2 .stile{order:2;min-height:220px;}.qzh .th-r2 .dtile{order:3;}.qzh .th-r2 .dueltile{order:4;}.qzh .th-r2 .th-slot-hold{display:none;}.qzh .duelbtn{display:none !important;}/* Stacked full-width hero tiles: Newest matches Trending typography on mobile (needs .th-heroes for specificity over the base rules below) */.qzh .th-heroes .ntile-t{font-size:20px;}.qzh .th-heroes .ntile-tag{font-size:10px;padding:4px 10px;top:12px;left:12px;}.qzh .th-heroes .ntile-ov{padding:18px 16px 15px;}}
    /* Narrow desktop / tablet (561-1024px): mirror the mobile combine - pair the promo tiles two-up (QOTD full row, Newest+Geo, Daily+Trending, Sports+Duel) and drop the Category Mastery rail. minmax(0,1fr) keeps the Newest/Geo hero images clipped inside their tiles (bare 1fr let them bleed). Added 2026-07-15 per Marshall. */
    @media (min-width:561px) and (max-width:1024px){.qzh .thub{flex-direction:column;}.qzh .th-rail{display:none !important;}.qzh .th-heroes{grid-template-columns:minmax(0,1fr) minmax(0,1fr);}.qzh .th-heroes .th-qotd{grid-column:1 / -1;}.qzh .th-r2{grid-template-columns:minmax(0,1fr) minmax(0,1fr);}.qzh .th-r2 .dtile{grid-column:auto;}.qzh .th-r2 .dueltile{grid-column:auto;}}
    /* Short landscape phones (iPhone landscape ~<=480px tall): the header tiles get too narrow to wrap cleanly, so hide the two daily-rotating promo tiles there and reflow. Portrait phones keep them (full-width, wrap fine). */
    @media (max-height:480px){.qzh .gtile{display:none !important;}.qzh .stile{display:none !important;}}
    @media (max-height:480px) and (min-width:561px){.qzh .th-heroes{grid-template-columns:minmax(0,2fr) minmax(0,1fr);}.qzh .th-r2{grid-template-columns:minmax(0,1.1fr) minmax(0,0.9fr) minmax(0,1fr);}.qzh .th-r2 .dtile{grid-column:auto;}.qzh .th-r2 .dueltile{grid-column:auto;}.qzh .th-r2 .th-slot-hold{display:none;}}
    .qzh .dtile{background:#0e1d40;border-radius:14px;padding:14px 15px;color:#fff;display:flex;flex-direction:column;min-height:190px;}
    .qzh .th-only-desk{display:none !important;}
    @media(min-width:1025px){.qzh .th-only-mob{display:none !important;}.qzh .th-only-desk{display:flex !important;}}
    .qzh .dtile-head{display:flex;align-items:center;gap:8px;margin-bottom:9px;}
    .qzh .dtile-chip{font-size:10px;font-weight:800;background:rgba(255,255,255,0.2);border-radius:12px;padding:2px 9px;text-transform:uppercase;letter-spacing:.04em;}
    .qzh .dtile-prog{display:flex;gap:5px;margin-bottom:10px;}
    .qzh .dtile-rows{display:flex;flex-direction:column;justify-content:space-evenly;flex:1;margin:2px 0 8px;}
    .qzh .dtile-row{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:#fff;text-decoration:none;padding:2px 0;}
    .qzh .dtile-num{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,0.6);flex:none;font-size:9px;display:flex;align-items:center;justify-content:center;}
    .qzh .dtile-name{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .qzh .dtile-cta{margin-top:auto;display:flex;align-items:center;justify-content:center;gap:7px;background:${C.accent};color:#fff;border-radius:10px;padding:10px;font-weight:800;font-size:12.5px;text-decoration:none;}
    .qzh .ntile{position:relative;border:1px solid ${C.line};border-radius:14px;overflow:hidden;text-decoration:none;display:flex;flex-direction:column;justify-content:flex-end;min-height:172px;background-size:cover;background-position:center 22%;background-color:${C.accsoft};}
    .qzh .ntile-tag{position:absolute;top:10px;left:11px;font-size:9px;font-weight:800;letter-spacing:.08em;background:#fff;border-radius:10px;padding:3px 9px;z-index:2;}
    .qzh .ntile-ov{position:relative;z-index:1;padding:16px 14px 13px;background:linear-gradient(to top, rgba(8,15,35,0.88), rgba(8,15,35,0.45) 55%, rgba(8,15,35,0));}
    .qzh .ntile-t{font-size:16px;font-weight:800;letter-spacing:-.3px;line-height:1.14;color:#fff;}
    .qzh .ntile-p{margin-top:8px;font-size:13px;font-weight:800;color:#fff;}
    .qzh .lbtile{background:#fff;border:1px solid ${C.line};border-radius:14px;padding:12px 15px;flex:1;display:flex;flex-direction:column;min-height:132px;overflow:hidden;}
    .qzh .lbtile-head{display:flex;align-items:center;gap:7px;margin-bottom:6px;}
    .qzh .duelbtn{background:${C.accent};color:#fff;border:none;border-radius:12px;padding:12px;font-weight:800;font-size:12px;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;flex:none;}
    .qzh .dueltile-chev{display:none;}
    .qzh .duel-mob-last{display:none;flex-direction:column;flex:1;}
    @media(max-width:560px){.qzh .dueltile{min-height:0 !important;}.qzh .dueltile-head{cursor:pointer;}.qzh .dueltile-chev{display:inline-flex !important;transition:transform .15s;}.qzh .dueltile.mc-closed .dueltile-body{display:none !important;}.qzh .dueltile.has-mob-last .duel-flip{display:none !important;}.qzh .dueltile.has-mob-last .duel-mob-last{display:flex !important;}}
    .qzh .rail{background:#0e1d40;border:1px solid #1e3a6b;border-radius:14px;padding:10px 9px 9px;display:flex;flex-direction:column;}
    .qzh .rail-head{display:flex;align-items:center;gap:5px;margin-bottom:7px;}
    .qzh .rail-bars{flex:1;display:flex;flex-direction:column;gap:3px;min-height:0;}
    .qzh .rseg{position:relative;isolation:isolate;overflow:hidden;flex:1 1 0;min-height:24px;display:flex;align-items:center;background:#122446;border:none;border-radius:7px;margin:0;padding:0 9px;cursor:pointer;width:100%;text-align:left;}
    .qzh .rseg:hover{background:#16294f;}
    .qzh .rseg:hover .rmeter{filter:brightness(1.18);}
    .qzh .rmeter{position:absolute;left:0;top:0;bottom:0;z-index:0;min-width:3px;background:linear-gradient(90deg,rgba(91,139,255,.45),rgba(91,139,255,.18));border-right:2px solid #6f9bff;border-radius:7px 0 0 7px;}
    .qzh .rseg-top{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;}
    .qzh .rseg .rnm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:600;color:#eaf0fc;}
    .qzh .rseg .rpct{font-size:10.5px;font-weight:800;flex:none;color:#c2d4ff;font-variant-numeric:tabular-nums;}
    /* Search + category + submit moved into the top command bar on desktop, so
       the browse control row collapses to just its (conditional) heading there. */
    @media(min-width:821px){.qzh .qz-browserow .qz-catbtn,.qzh .qz-browserow .qz-searchwrap,.qzh .qz-browserow .qz-submit,.qzh .qz-browserow .qz-daily{display:none !important;}}
    @media(max-width:820px){.qzh .qz-browserow{margin-bottom:14px !important;}}
    .qzh .dchev,.qzh .lchev{display:none;}
    @media(max-width:560px){
      .qzh .dtile-head,.qzh .lbtile-head{cursor:pointer;}
      .qzh .dchev,.qzh .lchev{display:inline-flex;flex:none;transition:transform .15s;}
      .qzh .dtile.mc-closed .dtile-collapse{display:none !important;}
      .qzh .lbtile{min-height:0 !important;}
      .qzh .dtile.mc-closed{min-height:0;padding-bottom:12px;}
      .qzh .lbtile.mc-closed .lbtile-collapse{display:none !important;}
      /* Collapsed leaderboard on mobile mirrors the blue Daily Challenge tile;
         stays white on desktop and when expanded. */
      .qzh .lbtile.mc-closed{background:${C.accent};border-color:${C.accent};}
      .qzh .lbtile.mc-closed .lbtile-head{color:#fff;}
      .qzh .lbtile.mc-closed .lbtile-head .x8{color:#fff !important;}
      .qzh .lbtile.mc-closed .lbtile-head a{color:#fff !important;}
      .qzh .lbtile.mc-closed .lbtile-head .lchev{color:#fff !important;}
    }
    .qzh .boards{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:12px;align-items:stretch;margin-bottom:12px;}
    .qzh .qz-mobtoggle{display:none;}
    /* Desktop: leaderboard LEFT (1fr), daily challenge WIDE MIDDLE (1.5fr),
       last-played feed RIGHT (1fr) via the min-width:681px order rule below. */
    @media(max-width:760px){.qzh .boards{grid-template-columns:1fr;}}
    /* Desktop (3-col) only: daily challenge in the WIDE middle track, last-played feed on the RIGHT, leaderboard LEFT. Tablet single-col (<=680) and mobile (<=560) unchanged. */
    @media(min-width:761px){.qzh .boards .daily-card{order:1;}.qzh .boards .lb-card{order:2;}.qzh .boards .live-card{display:none;}}
    .qzh .qcols{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:12px;}
    .qzh .qfull{column-count:2;column-gap:26px;}
    .qzh .qfull > a{display:flex;break-inside:avoid;-webkit-column-break-inside:avoid;}
    .qzh .qflow{column-width:310px;column-gap:26px;}
    .qzh .qflow > a{display:flex;break-inside:avoid;-webkit-column-break-inside:avoid;}
    @media(max-width:680px){.qzh .qfull{column-count:1;}}
    .qzh .colhead{display:flex;align-items:center;gap:9px;padding:8px 11px;border-bottom:2px solid ${C.ink};border-radius:8px 8px 0 0;margin-bottom:3px;}
    .qzh .viewall{margin-left:auto;font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;}
    .qzh .qrow{display:flex;align-items:baseline;gap:10px;padding:6px 0;border-bottom:1px solid rgba(20,22,28,0.07);text-decoration:none;color:${C.ink};min-width:0;overflow:hidden;}
    .qzh .qrow:hover .qtitle{color:${C.accent};}
    .qzh .qrow .qtitle{font-size:13px;font-weight:500;}
    .qzh .qmeta{flex:none;display:flex;align-items:center;gap:10px;font-size:10.5px;}
    .qzh .catcard{border:1px solid ${C.line};border-radius:12px;overflow:hidden;background:#fff;display:flex;flex-direction:column;padding-bottom:4px;}
    /* Hero height = 7 row-units (7 x 31px .qrow) so its bottom edge lands flush
   on a list-row gridline instead of ending mid-row; keeps quiz rows aligned
   across neighbouring columns with no ragged end gap. cover = crop, no stretch. */
    .qzh .cc-hero{position:relative;display:block;min-height:217px;background-size:cover;background-position:center;background-color:${C.accsoft};text-decoration:none;}
    .qzh .cc-ov{position:absolute;inset:0;background:linear-gradient(to top, rgba(8,15,35,0.92), rgba(8,15,35,0.4) 52%, rgba(8,15,35,0.05));z-index:1;}
    .qzh .cc-stat{position:absolute;top:8px;left:10px;z-index:2;font-size:10px;font-weight:700;color:#fff;display:inline-flex;align-items:center;gap:3px;border-radius:999px;padding:3px 9px;max-width:calc(100% - 20px);white-space:nowrap;overflow:hidden;text-shadow:0 1px 6px rgba(0,0,0,.65);transition:background-color .18s ease;}
    .qzh .cc-stat.pill{background:rgba(17,32,74,.82);backdrop-filter:blur(2px);text-shadow:none;}
    .qzh .hpill{background:rgba(17,32,74,.85);border-radius:999px;padding:2px 8px;backdrop-filter:blur(2px);}
    .qzh .cc-btm{position:absolute;left:12px;right:12px;bottom:11px;z-index:2;display:flex;flex-direction:column;gap:5px;}
    .qzh .cc-htitle{color:#fff;font-size:17px;font-weight:800;letter-spacing:-.2px;line-height:1.14;text-shadow:0 1px 8px rgba(0,0,0,.5);}
    .qzh .cc-play{font-size:13px;font-weight:800;color:#fff;display:inline-flex;align-items:center;gap:4px;}
    .qzh .catcard .colhead.cc-head{border-radius:0;border:none;margin:0;order:-1;}
    .qzh .catcard .qrow{padding-left:11px;padding-right:11px;}
    .qzh .catcard .qrow:last-child{border-bottom:none;}
    .qzh .colhead.cc-filled{border-bottom:none;}
    .qzh .hubbtn{display:flex;align-items:center;gap:7px;background:#fff;color:${C.accent};border:1px solid #cddffb;border-right:3px solid ${C.accent};padding:10px 15px;border-radius:10px;font-weight:700;font-size:13px;text-decoration:none;white-space:nowrap;}
    .qzh .qz-playerbar.hub-bleed .hubbtn{align-self:stretch;padding:0 18px;margin:-11px -14px -11px 0;border-radius:0 11px 11px 0;border-top:none;border-bottom:none;border-left:none;}
    .qz-playerbar .qz-skill-empty{display:none !important;}
    .qz-playerbar .lbl{font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#6b7280;margin-bottom:2px;}
    .qz-chev{display:none;}
    @media(max-width:560px){.qz-playerbar{flex-wrap:wrap !important;align-items:center !important;gap:10px 14px !important;}.qz-playerbar .qz-div{display:none !important;}.qz-playerbar:not(.open) .qz-stats{display:none !important;}.qz-playerbar.open .qz-stats{order:9 !important;flex:1 1 100% !important;margin-left:0 !important;justify-content:space-between !important;gap:10px !important;}.qz-playerbar{cursor:pointer;}.qz-chev{display:inline-flex !important;}.qz-playerbar .qz-bestcat{display:none !important;}.qz-playerbar .hubbtn{order:4 !important;margin-left:auto !important;flex:0 0 auto !important;}.qzh .boards{display:flex !important;flex-direction:column;gap:12px;}.qzh .boards .lb-card{display:none !important;}.qzh .boards .live-card{display:none !important;}.qzh .boards .lblive-card{order:1;}.qzh .boards .daily-card{order:2;}.qz-submit{display:none !important;}.qzh{padding-left:14px !important;padding-right:14px !important;}}
    .qzh .hubbtn:hover{background:${C.accsoft};}
    .qzh .crumb1{font-size:18px;font-weight:800;letter-spacing:-0.02em;}
    .qzh .crumb2{font-size:18px;font-weight:600;color:${C.accent};}
    .qzh a.qlink{text-decoration:none;color:inherit;}
    .qzh .qz-catbtn .ddmenu{left:0;right:auto;}
    .qzh .qz-catbtn{align-self:stretch;}
    .qzh .qz-searchwrap{align-self:stretch;}
    .qzh .qz-searchwrap input{height:100%;box-sizing:border-box;}
    .qzh .qz-submit{align-self:stretch;}
    .qzh .qz-daily{align-self:stretch;}
    .qzh .qz-srank{font-size:9px;font-weight:600;color:${C.soft};}
    .qzh .qz-pname{max-width:160px;}
    @media(max-width:560px){.qzh .qz-pname{max-width:120px;}}
    @media(max-width:560px){.qzh .qz-srank{display:none !important;}}
    .qzh .qz-catbtn .ddbtn{height:100%;box-sizing:border-box;}
    @media(max-width:560px){.qzh .qz-browserow{align-items:stretch !important;gap:8px !important;}.qzh .qz-catbtn{display:none !important;}.qzh .qz-daily{display:none !important;}.qzh .qz-searchwrap{flex:1 1 100% !important;order:3 !important;}}
    /* Mobile: the category menu can be taller than the space below its button,
       and the outside-click overlay freezes the page so the page itself can't
       scroll to reveal the rest. Anchor it as a viewport-bounded fixed sheet so
       every category is reachable via the menu's own internal scroll. */
    @media(max-width:560px){.qzh .qz-catbtn .ddmenu{position:fixed;z-index:60;left:50%;right:auto;transform:translateX(-50%);top:auto;bottom:12px;width:92vw;max-width:92vw;min-width:0;max-height:72vh;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;grid-template-columns:1fr 1fr;box-shadow:0 -8px 28px rgba(20,22,28,0.18);}}
    @media(max-width:560px){.qzh .qz-dd-overlay{z-index:55 !important;background:rgba(20,22,28,0.4);}}
    /* Mobile: surface the leaderboard + last-played boards (otherwise display:none on phones)
       as two side-by-side toggle buttons; tapping one expands its existing card full-width below. */
    @media(max-width:560px){
      .qzh .qz-mobtoggle{display:flex;gap:4px;margin-bottom:12px;background:#eef1f5;border-radius:12px;padding:4px;}
      .qzh .qz-mobtoggle .mtbtn{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center;gap:7px;background:transparent;border:none;border-radius:9px;padding:9px 12px;cursor:pointer;font:inherit;color:${C.soft};font-weight:700;font-size:12.5px;}
      .qzh .qz-mobtoggle .mtbtn.active{background:#fff;color:${C.ink};box-shadow:0 1px 2px rgba(20,22,28,0.06);}
      .qzh .qz-mobtoggle .mtbtn .mtlbl{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .qzh .qz-mobtoggle .mtbtn{justify-content:center !important;}
      .qzh .qz-mobtoggle .mtbtn svg:last-child{margin-left:0 !important;}
      .qzh .boards.show-lb .lb-card{display:flex !important;order:-1;}
      .qzh .boards.show-live .live-card{display:flex !important;order:-1;}
    }
    /* Mobile landscape (short viewport): keep the browse row on ONE line by letting the
       search field shrink, and stretch all four controls to a single shared height. */
    @media (orientation: landscape) and (max-height: 500px){
      .qzh .qz-browserow{flex-wrap:nowrap !important;align-items:stretch !important;gap:8px !important;}
      .qzh .qz-catbtn{flex:0 0 auto !important;align-self:stretch;}
      .qzh .qz-catbtn .ddbtn{height:100%;box-sizing:border-box;}
      .qzh .qz-searchwrap{flex:1 1 0 !important;min-width:90px !important;}
      .qzh .qz-searchwrap input{height:100%;box-sizing:border-box;}
      .qzh .qz-submit{flex:0 0 auto !important;align-self:stretch;box-sizing:border-box;}
      .qzh .qz-daily{flex:0 0 auto !important;align-self:stretch;box-sizing:border-box;}
    }
    .qzh .qz-mobhub{display:none;}
    .qzh .duelbtn-mob{display:none;}    .qzh .lblive-card{display:none;}
    .qzh .accchev{display:none;}
    @media(max-width:560px){
      .qzh .boards .head{cursor:pointer;}
      .qzh .accchev{display:inline-flex !important;transition:transform .15s;}
      .qzh .boards .card.mc-closed > div:not(.head){display:none !important;}
      .qzh section.mc-closed > .qrow{display:none !important;}
      .qzh .dailyicon{color:#374151 !important;}
      .qzh .livedot{background:#9aa1ab !important;animation:none !important;}
      .qzh .colhead{background:${C.accent} !important;}
      .qzh .colhead .colicon{background:rgba(255,255,255,0.22) !important;color:#fff !important;}
      .qzh .colhead h3{color:#fff !important;}
      .qzh .colhead .viewall{color:#fff !important;}
      .qzh .dot{background:#9aa1ab !important;}
      .qzh .mc-closed .vall{display:none !important;}
      .qzh .vall{text-transform:uppercase !important;font-size:10px !important;font-weight:700 !important;letter-spacing:.05em !important;}
      .qzh .lb-card.mc-open .lbbody{max-height:50vh;overflow-y:auto;justify-content:flex-start;}
      .qzh .qz-searchwrap input{font-size:16px !important;}
      .qzh .qz-mobhub{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px;background:${C.accsoft};color:${C.accent};border:1px solid #cddffb;border-radius:12px;padding:14px 16px;text-decoration:none;font-family:${FONT};}
      .qzh .duelbtn-mob{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;background:${C.accent};color:#fff;border:none;border-radius:12px;padding:14px;font-weight:800;font-size:14px;text-decoration:none;font-family:${FONT};}      .qzh .lblive-card{display:flex;flex-direction:column;}
      .qzh .lblive-head{background:#fff !important;}
      .qzh .lblive-tabs{display:flex;gap:4px;flex:1 1 auto;min-width:0;background:#eef1f5;border-radius:10px;padding:4px;}
      .qzh .lblive-tab{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center;gap:6px;background:transparent;border:none;border-radius:8px;padding:8px 6px;font:inherit;font-weight:700;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#5f5e5a;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .qzh .lblive-tab.on{background:#fff;color:#1c1e24;box-shadow:0 1px 2px rgba(20,22,28,0.08);}
      .qzh .lblive-tab .livedot2{width:8px;height:8px;border-radius:50%;background:#9aa1ab;flex:none;}
      .qzh .lblive-body{max-height:50vh;overflow-y:auto;padding:3px 0;}
      .qzh .lblive-sub{position:sticky;top:0;z-index:1;display:block;padding:9px 13px 8px;background:#fff;border-bottom:1px solid ${C.line};font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${C.soft};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    }
  `;

  const renderLb = () => (
    lbMetric.special ? (
                (() => {
                  if (lbMetric.key === 'catRating') {
                    const rows = (catBoards[lbMetric.catKey] || []).slice(0, 3);
                    if (rows.length === 0) return <div style={{ padding: '12px 13px', fontSize: 12, color: C.soft }}>No ranked players yet.</div>;
                    return rows.map((r, i) => (
                      <LbRow key={r.userKey || i} i={i}
                        name={r.userKey ? <Link href={`/quizzes/hub?player=${encodeURIComponent(r.userKey)}`} style={{ color: 'inherit', textDecoration: 'none' }}><WhoTag name={r.name} isAnon={r.isAnon} /></Link> : <WhoTag name={r.name} isAnon={r.isAnon} />}
                        value={lbMetric.fmt(r.xp)} frac={(r.xp || 0) / (rows[0]?.xp || 1)} />
                    ));
                  }
                  const rows = (lbMetric.key === 'dailyChallenge' ? dailyRows : lbMetric.key === 'correctToday' ? todayCorrectRows : todayQuizRows).slice(0, 3);
                  const valOf = lbMetric.key === 'dailyChallenge' ? ((r) => r.totalCorrect) : lbMetric.key === 'correctToday' ? ((r) => r.correct) : ((r) => r.quizzes);
                  if (rows.length === 0) return <div style={{ padding: '12px 13px', fontSize: 12, color: C.soft }}>No plays yet today.</div>;
                  return rows.map((r, i) => (
                    <LbRow key={`s${i}`} i={i}
                      name={r.userKey ? <Link href={`/quizzes/hub?player=${encodeURIComponent(r.userKey)}`} style={{ color: 'inherit', textDecoration: 'none' }}><WhoTag name={r.username || 'Player'} isAnon={false} /></Link> : <WhoTag name={r.username || 'Player'} isAnon={false} />}
                      value={(valOf(r) || 0).toLocaleString()} frac={(valOf(r) || 0) / (valOf(rows[0]) || 1)} />
                  ));
                })()
              ) : (
                <>
                  {leaderRows.length === 0 && <div style={{ padding: '12px 13px', fontSize: 12, color: C.soft }}>No ranked players yet.</div>}
                  {leaderRows.map((r, i) => (
                    <LbRow key={r.userKey || i} i={i}
                      name={r.userKey ? <Link href={`/quizzes/hub?player=${encodeURIComponent(r.userKey)}`} style={{ color: 'inherit', textDecoration: 'none' }}><WhoTag name={r.name} isAnon={r.isAnon} /></Link> : <WhoTag name={r.name} isAnon={r.isAnon} />}
                      value={lbMetric.fmt(r[lbMetric.key])} frac={(r[lbMetric.key] || 0) / (leaderRows[0]?.[lbMetric.key] || 1)} />
                  ))}
                </>
              )
  );
  const renderLive = () => (
    <>
      {liveRows.length === 0 && <div style={{ padding: '12px 13px', fontSize: 12, color: C.soft }}>No recent plays{scope === 'all' ? '' : ' in this category'} yet.</div>}
              {liveRows.map((f, i) => (
                <Link href={`/quiz/${f.quizId}`} className="qlink" key={i}>
                  <div className="lrow" style={{ gap: 4, flexDirection: 'column', alignItems: 'stretch', padding: '7px 13px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      <span className="qtitle" style={{ fontWeight: 600 }}>{f.title}</span>
                      {dailyIds.includes(f.quizId) ? <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 800, letterSpacing: '.03em', textTransform: 'uppercase', color: C.accent, background: C.accsoft, padding: '1px 6px', borderRadius: 6 }}><Flame size={10} />Daily</span> : null}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10.5, color: C.soft }}>
                          <span className="scorebadge" style={{ flex: 'none', fontWeight: 700, padding: '1px 6px', borderRadius: 6, fontVariantNumeric: 'tabular-nums', background: f.total && f.score / f.total >= 0.8 ? '#e7f7ed' : '#eef1f6', color: f.total && f.score / f.total >= 0.8 ? '#16a34a' : C.soft }}>{f.score}/{f.total}</span>
                      <span style={{ fontWeight: 700 }}>{f.attempt > 1 ? `attempt ${f.attempt}` : '1st try'}</span>
                      <span style={{ marginLeft: 'auto' }}>{relTime(f.playedAt)}</span>
                    </span>
                  </div>
                </Link>
              ))}
    </>
  );

  const doneCtx = useMemo(() => ({
    played: (me && me.found && Array.isArray(me.playedIds)) ? new Set(me.playedIds) : null,
    completed: (me && me.found && Array.isArray(me.completedIds)) ? new Set(me.completedIds) : null,
  }), [me]);

  return (
    <QuizDoneContext.Provider value={doneCtx}>
    <div style={{ background: C.bg, minHeight: '100vh', position: 'relative' }}>
      <Grain />
      <style>{css}</style>
      <QuizCommandHeader search={search} onSearch={setSearch} me={me} onSignup={() => setSignupOpen(true)} ticker={tickerItems} />
      <div className="qzh qzf-w" style={{ maxWidth: 1480, margin: '0 auto', padding: '14px clamp(16px, 2.5vw, 34px) 70px', position: 'relative' }}><style>{`@media(max-width:560px){.qzf-w{padding-left:14px !important;padding-right:14px !important;}}`}</style>

        {(() => {
          if (duelMuteAll) return null;
          const myA = getAnonId();
          const q = [];
          (duelNotif.yourTurn || []).forEach((c) => { if (duelLater[c.token]) return; q.push({ kind: 'yourturn', ...c }); });
          (duelNotif.challenges || []).forEach((c) => { if (duelLater[c.token]) return; if (c.challenger_anon && duelMuted[c.challenger_anon]) return; q.push({ kind: 'challenge', ...c }); });
          (duelNotif.results || []).forEach((r) => { if (duelSeen[r.token]) return; const iAmCh = r.mine ? r.mine === 'challenger' : r.challenger_anon === myA; if (r.status === 'declined' && !iAmCh) return; q.push({ kind: 'result', iAmCh, ...r }); });
          if (!q.length) return null;
          const it = q[0];
          const qTitle = (titleById[it.quiz_id] || it.quiz_id);
          const more = q.length > 1 ? q.length - 1 : 0;
          let outcome = '';
          if (it.kind === 'result') {
            if (it.status === 'declined') outcome = `${it.opponent_name || 'Your opponent'} turned down your duel`;
            else if (it.winner === 'tie') outcome = 'It was a tie!';
            else { const iWon = (it.iAmCh && it.winner === 'challenger') || (!it.iAmCh && it.winner === 'opponent'); outcome = iWon ? 'You won your duel!' : 'You lost your duel'; }
          }
          const txtBtn = { background: 'transparent', border: 'none', fontFamily: FONT, fontWeight: 800, fontSize: 13, cursor: 'pointer' };
          return (
            <div style={{ position: 'fixed', right: 18, bottom: 18, zIndex: 90, width: 352, maxWidth: 'calc(100vw - 28px)', background: '#fff', borderRadius: 16, border: `2px solid ${C.accent}`, boxShadow: '0 16px 44px rgba(20,22,28,0.22)', overflow: 'hidden', fontFamily: FONT }}>
              <div style={{ background: C.accent, color: '#fff', padding: '11px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', display: 'inline-flex', alignItems: 'center', gap: 7 }}><Swords size={16} /> {it.kind === 'challenge' ? 'DUEL CHALLENGE' : it.kind === 'yourturn' ? 'YOUR MOVE' : 'DUEL RESULT'}</span>
                <button onClick={() => (it.kind === 'challenge' || it.kind === 'yourturn') ? duelLaterAdd(it.token) : duelSeenAdd(it.token)} aria-label="Dismiss" style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1, opacity: 0.85 }}>×</button>
              </div>
              <div style={{ padding: '16px 16px 15px' }}>
                {(it.kind === 'challenge' || it.kind === 'yourturn') ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 36, height: 36, borderRadius: '50%', background: C.accsoft, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>{((it.kind === 'yourturn' ? it.opponent_name : it.challenger_name) || 'P').slice(0, 2).toUpperCase()}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.soft }}>VS</span>
                      <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#faedd0', color: '#a9781a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>YOU</span>
                      {it.device && it.device !== 'any' && <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, color: '#fff', background: C.ink, borderRadius: 999, padding: '3px 9px', textTransform: 'uppercase' }}>{it.device === 'mobile' ? 'Mobile Only' : 'Desktop Only'}</span>}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: '13px 0 3px' }}>{it.kind === 'yourturn' ? `${it.opponent_name || 'Your opponent'} played, your move` : `${it.challenger_name || 'Someone'} Challenged You`}</div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>{qTitle}{more ? ` · +${more} More` : ''}</div>
                    <a href={`/duel/${it.token}`} style={{ display: 'block', textAlign: 'center', background: C.accent, color: '#fff', padding: '12px', borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>Play Now →</a>
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16, marginTop: 11 }}>
                      {it.kind === 'challenge' && <button onClick={() => duelDecline(it.token)} style={{ ...txtBtn, color: '#c0392b' }}>Turn Down</button>}
                      <button onClick={() => duelLaterAdd(it.token)} style={{ ...txtBtn, color: C.soft }}>Maybe Later</button>
                      {it.kind === 'challenge' && <button onClick={() => duelMuteAdd(it.challenger_anon, it.challenger_name, it.token)} style={{ ...txtBtn, color: C.soft }}>Mute User</button>}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, marginBottom: 3 }}>{outcome}</div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>{qTitle}{more ? ` · +${more} More` : ''}</div>
                    <a href={`/duel/${it.token}`} style={{ display: 'block', textAlign: 'center', background: C.accent, color: '#fff', padding: '11px', borderRadius: 10, fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>See Duel →</a>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 11 }}>
                      <button onClick={() => duelSeenAdd(it.token)} style={{ ...txtBtn, color: C.soft }}>Dismiss</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })()}

        {signupOpen && <SignupModal onClose={() => setSignupOpen(false)} />}

        {/* Daily games row: one button per daily. Art lives in /public/games;
            each button is ~half the Newest tile's height. */}
        <DailyStrip />

        <div className="thub">
          <div className="thub-left">
          <div className="th-heroes">
          {qotd && (<Link href={`/quiz/${qotd.id}`} className="qotd th-qotd" aria-label={`Quiz of the day: ${qotd.title}`}>
            <div className="qotd-photo" style={{ backgroundImage: `url("${qotd.hero}")`, backgroundPosition: qotd.pos || 'center' }} aria-hidden="true" />
            <div className="qotd-body">
              <div className="qotd-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}><span>Quiz of the Day</span>{plays(qotd.id) > 0 ? <span style={{ textTransform: 'none', letterSpacing: 0, color: '#9fb0d4', fontWeight: 700 }}>{plays(qotd.id).toLocaleString()} plays</span> : null}</div>
              <div className="qotd-title">{qotd.title}</div>
              <div className="qotd-foot">
                <span className="qotd-play"><Play size={15} fill="#fff" strokeWidth={0} />Play now</span>
                <span className="qotd-stats">{leader(qotd.id) ? <><Crown size={12} style={{ color: '#e8b43a', flex: 'none' }} />{leader(qotd.id)}</> : (plays(qotd.id) > 0 ? null : <span>New quiz</span>)}</span>
              </div>
            </div>
          </Link>)}
          {newest[0] ? (() => { const nc = byKey[newest[0].dept] || {}; const NIcon = nc.Icon || Sparkles; const nPos = nHeroPos; return (
              <Link href={`/quiz/${newest[0].id}`} className="ntile" style={nHero ? { backgroundImage: `url("${nHero}")`, backgroundPosition: nPos || 'center' } : { background: nc.c || C.accent }}>
                <span className="ntile-tag" style={{ color: C.accent }}><Sparkles size={10} style={{ verticalAlign: -1 }} /> NEWEST</span>
                <div className="ntile-ov" ref={ntileProbeRef}>
                  <div className="ntile-t">{stripVerb(newest[0].title)}</div>
                  <div className="ntile-p" style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span>Play <ArrowRight size={13} style={{ verticalAlign: -1 }} /></span>{leader(newest[0].id) ? <span className={ntilePill ? 'hpill' : undefined} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Crown size={12} style={{ color: '#e8b43a', flex: 'none' }} />{leader(newest[0].id)}</span> : null}</div>
                </div>
              </Link>
            ); })() : <div />}
          {geoPick ? (
            <Link href={`/quiz/${geoPick.id}`} className="hstile gtile th-only-mob" style={geoHero ? { backgroundImage: `url("${geoHero}")`, backgroundPosition: geoPos || 'center' } : { background: C.accent }}>
              <span className="ttile-tag" style={{ color: '#0f766e', whiteSpace: 'nowrap' }}><Globe size={11} style={{ verticalAlign: -1 }} /> FEATURED GEO GUESSER</span>
              <div className="ttile-ov">
                <div className="ttile-t">{stripVerb(geoPick.title)}</div>
                <div className="ttile-foot" style={{ flexWrap: 'nowrap' }}><span className="ttile-p" style={{ flex: 'none' }}>Play <ArrowRight size={13} style={{ verticalAlign: -1 }} /></span>{leader(geoPick.id) ? <span className="ttile-plays hpill" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0 }}><Crown size={12} style={{ color: '#e8b43a', flex: 'none' }} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leader(geoPick.id)}</span></span> : null}</div>
              </div>
            </Link>
          ) : <div className="th-only-mob" />}
            {daily && DAILY_CHALLENGE_ON ? (
              <div className={`dtile th-only-desk mc-${mDaily ? 'open' : 'closed'}`}>
                <div className="dtile-head" onClick={() => { if (isMobile) setMDaily((v) => !v); }}>
                  <Target size={16} style={{ flex: 'none', color: '#f8b84a' }} />
                  <span className="x8" style={{ fontSize: 14, fontWeight: 800 }}>Daily Challenge</span>
                  {dailyCat ? <span className="dtile-chip">{dailyCat}</span> : null}
                  <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800 }}>{dailyDoneCount}/{dailyIds.length}</span>
                  <ChevronDown className="dchev" size={16} strokeWidth={2.5} style={{ color: '#fff', transform: mDaily ? 'rotate(180deg)' : 'none' }} />
                </div>
                <div className="dtile-collapse" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="dtile-prog">{dailyIds.map((qid) => (<span key={qid} style={{ flex: 1, height: 6, borderRadius: 3, background: dailyIsDone(qid) ? '#a5f3c9' : 'rgba(255,255,255,0.3)' }} />))}</div>
                  <div className="dtile-rows">
                    {dailyIds.map((qid, k) => { const done = dailyIsDone(qid); return (
                      <Link key={qid} href={`/quiz/${qid}?ch=${encodeURIComponent(dailyId)}&i=${k}`} className="dtile-row">
                        {done ? <Check size={13} strokeWidth={3} style={{ color: '#a5f3c9', flex: 'none' }} /> : <span className="dtile-num">{k + 1}</span>}
                        <span className="dtile-name">{stripVerb(titleById[qid] || qid)}</span>
                      </Link>
                    ); })}
                  </div>
                  <Link href={dailyAllDone ? `/challenge/${dailyId}?done=1` : dailyEntryUrl} className="dtile-cta">{dailyAllDone ? 'See Your Results' : dailyDoneCount > 0 ? 'Continue Challenge' : 'Play Today’s Challenge'}{dailyRows && dailyRows.length ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Crown size={12} style={{ color: '#e8b43a' }} /> {dailyRows[0].username || 'Player'}</span> : <ArrowRight size={15} style={{ flex: 'none' }} />}</Link>
                </div>
              </div>
            ) : <div className="th-only-desk" />}
          </div>

          <div className="th-r2">
          {geoPick ? (
            <Link href={`/quiz/${geoPick.id}`} className="hstile gtile th-only-desk" style={geoHero ? { backgroundImage: `url("${geoHero}")`, backgroundPosition: geoPos || 'center' } : { background: C.accent }}>
              <span className="ttile-tag" style={{ color: '#0f766e', whiteSpace: 'nowrap' }}><Globe size={11} style={{ verticalAlign: -1 }} /> FEATURED GEO GUESSER</span>
              <div className="ttile-ov">
                <div className="ttile-t">{stripVerb(geoPick.title)}</div>
                <div className="ttile-foot" style={{ flexWrap: 'nowrap' }}><span className="ttile-p" style={{ flex: 'none' }}>Play <ArrowRight size={13} style={{ verticalAlign: -1 }} /></span>{leader(geoPick.id) ? <span className="ttile-plays hpill" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0 }}><Crown size={12} style={{ color: '#e8b43a', flex: 'none' }} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leader(geoPick.id)}</span></span> : null}</div>
              </div>
            </Link>
          ) : <div className="th-only-desk" />}

            {daily && DAILY_CHALLENGE_ON ? (
              <div className={`dtile th-only-mob mc-${mDaily ? 'open' : 'closed'}`}>
                <div className="dtile-head" onClick={() => { if (isMobile) setMDaily((v) => !v); }}>
                  <Target size={16} style={{ flex: 'none', color: '#f8b84a' }} />
                  <span className="x8" style={{ fontSize: 14, fontWeight: 800 }}>Daily Challenge</span>
                  {dailyCat ? <span className="dtile-chip">{dailyCat}</span> : null}
                  <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800 }}>{dailyDoneCount}/{dailyIds.length}</span>
                  <ChevronDown className="dchev" size={16} strokeWidth={2.5} style={{ color: '#fff', transform: mDaily ? 'rotate(180deg)' : 'none' }} />
                </div>
                <div className="dtile-collapse" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="dtile-prog">{dailyIds.map((qid) => (<span key={qid} style={{ flex: 1, height: 6, borderRadius: 3, background: dailyIsDone(qid) ? '#a5f3c9' : 'rgba(255,255,255,0.3)' }} />))}</div>
                  <div className="dtile-rows">
                    {dailyIds.map((qid, k) => { const done = dailyIsDone(qid); return (
                      <Link key={qid} href={`/quiz/${qid}?ch=${encodeURIComponent(dailyId)}&i=${k}`} className="dtile-row">
                        {done ? <Check size={13} strokeWidth={3} style={{ color: '#a5f3c9', flex: 'none' }} /> : <span className="dtile-num">{k + 1}</span>}
                        <span className="dtile-name">{stripVerb(titleById[qid] || qid)}</span>
                      </Link>
                    ); })}
                  </div>
                  <Link href={dailyAllDone ? `/challenge/${dailyId}?done=1` : dailyEntryUrl} className="dtile-cta">{dailyAllDone ? 'See Your Results' : dailyDoneCount > 0 ? 'Continue Challenge' : 'Play Today’s Challenge'}{dailyRows && dailyRows.length ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Crown size={12} style={{ color: '#e8b43a' }} /> {dailyRows[0].username || 'Player'}</span> : <ArrowRight size={15} style={{ flex: 'none' }} />}</Link>
                </div>
              </div>
            ) : <div className="th-only-mob" />}

            {sportsPick ? (
            <Link href={`/quiz/${sportsPick.id}`} className="hstile stile" style={sptHero ? { backgroundImage: `url("${sptHero}")`, backgroundPosition: sptPos || 'center' } : { background: C.accent }}>
              <span className="ttile-tag" style={{ color: '#b45309', whiteSpace: 'nowrap' }}><Trophy size={11} style={{ verticalAlign: -1 }} /> FEATURED SPORTS</span>
              <div className="ttile-ov">
                <div className="ttile-t">{stripVerb(sportsPick.title)}</div>
                <div className="ttile-foot" style={{ flexWrap: 'nowrap' }}><span className="ttile-p" style={{ flex: 'none' }}>Play <ArrowRight size={13} style={{ verticalAlign: -1 }} /></span>{leader(sportsPick.id) ? <span className="ttile-plays hpill" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0 }}><Crown size={12} style={{ color: '#e8b43a', flex: 'none' }} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leader(sportsPick.id)}</span></span> : null}</div>
              </div>
            </Link>
          ) : <div className="th-slot-hold" />}

            {trending ? (() => { const tc = byKey[trending.dept] || {}; const tPos = tHeroPos; return (
            <Link href={`/quiz/${trending.id}`} className="ttile" style={tHero ? { backgroundImage: `url("${tHero}")`, backgroundPosition: tPos || 'center' } : { background: tc.c || C.accent }}>
              <span className="ttile-tag"><Flame size={11} style={{ verticalAlign: -1 }} /> TRENDING</span>
              <div className="ttile-ov" ref={ttileProbeRef}>
                <div className="ttile-t">{stripVerb(trending.title)}</div>
                <div className="ttile-foot" style={{ flexWrap: 'nowrap' }}><span className="ttile-p" style={{ flex: 'none' }}>Play <ArrowRight size={13} style={{ verticalAlign: -1 }} /></span>{leader(trending.id) ? <span className={`ttile-plays${ttilePill ? ' hpill' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0 }}><Crown size={12} style={{ color: '#e8b43a', flex: 'none' }} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leader(trending.id)}</span></span> : null}</div>
              </div>
            </Link>
          ); })() : <div className="th-slot-hold" />}

            <DuelTile />
          </div>

          </div>
          <div className="rail th-rail">
            <div className="rail-head"><BarChart3 size={14} style={{ color: '#5b8bff', flex: 'none' }} /><span className="x8" style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.03em', color: '#f8b84a' }}>CATEGORY MASTERY</span></div>
            {catMastery.length > 0 ? (
              <div className="rail-bars">
                {catMastery.slice(0, 14).map((m) => (
                  <button type="button" key={m.key} onClick={() => goCat(m.key)} className="rseg" title={`${m.label} · ${m.acc}%`}>
                    <span className="rmeter" style={{ width: `${m.acc}%` }} aria-hidden="true" />
                    <span className="rseg-top"><span className="rnm">{m.label}</span><span className="rpct">{m.acc}%</span></span>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 11, color: '#7d92bd', fontWeight: 600, padding: '0 6px' }}>Play a few quizzes to build your category mastery.</div>
            )}
          </div>
        </div>

        {/* browse header + search (in the left column, beside the mastery rail) */}
        <div ref={quizzesRef} className="qz-browserow" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0, flexWrap: 'wrap' }}>
          {(searchResults || listMode || doneFilter !== 'all' || scope !== 'all') && (
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 10 }}>
              {!searchResults && (listMode || doneFilter !== 'all' || scope !== 'all') && (
                <button type="button" onClick={() => { setListMode(null); setDoneFilter('all'); setScope('all'); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: C.accent, fontWeight: 700, fontSize: 14 }}>‹ Back</button>
              )}
              {searchResults ? `Search Results · ${searchResults.length}`
                : doneFilter !== 'all' ? `${STATUS_LABEL[doneFilter]} Quizzes · ${(statusList || []).length}`
                : scope !== 'all' ? `${byKey[scope]?.label} Quizzes`
                : listMode === 'newest' ? `Newest Quizzes · ${newestAll.length}`
                : listMode === 'mostplayed' ? `Most Played · ${mostPlayedAll.length}`
                : 'Live Quiz Feed'}
            </h2>
          )}
          <div className="dd qz-catbtn" onClick={(e) => e.stopPropagation()}>
            <button className="ddbtn" onClick={(e) => { e.stopPropagation(); setDdOpen((o) => !o); }}>
              <span className="dot" style={{ background: scope === 'all' ? C.ink : (byKey[scope]?.c || C.ink) }} />
              <span style={{ fontWeight: 600, fontSize: 13 }}>{doneFilter !== 'all' ? STATUS_LABEL[doneFilter] : (scope === 'all' ? 'Category: All' : byKey[scope]?.label)}</span>
              <ChevronDown size={16} style={{ color: C.muted }} />
            </button>
            {ddOpen && (
              <div className="ddmenu" onClick={(e) => e.stopPropagation()}>
                <div className="ddall ddhead"><span>Categories</span><button type="button" className="ddclose" aria-label="Close" onClick={() => setDdOpen(false)}>✕</button></div>
                {me && me.found && (
                  <>
                    <div className="ddall" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: C.soft, padding: '4px 9px 2px' }}>My progress</div>
                    {[['unplayed', 'Unplayed'], ['played', 'Played'], ['completed', 'Completed']].map(([k, lbl]) => (
                      <div key={k} className="dditem ddall" onClick={() => { setDoneFilter(k); setScope('all'); setDdOpen(false); setSearch(''); setListMode(null); }} style={doneFilter === k ? { background: C.accsoft } : undefined}>
                        {k === 'completed' ? <Star size={14} strokeWidth={1.5} fill="#e8b43a" color="#e8b43a" /> : k === 'played' ? <Check size={14} strokeWidth={2.75} style={{ color: C.live }} /> : <span style={{ width: 13, height: 13, borderRadius: '50%', border: `1.5px solid ${C.soft}`, display: 'inline-block' }} />}
                        <span style={{ flex: 1 }}>{lbl}</span>
                        <span style={{ fontSize: 11, color: C.soft }}>{statusCounts[k]}</span>
                      </div>
                    ))}
                    <div className="ddall" style={{ height: 1, background: C.line, margin: '5px 2px' }} />
                  </>
                )}
                {openChs.length > 0 && (
                  <>
                    <div className="ddall" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: C.soft, padding: '4px 9px 2px' }}>Active challenges</div>
                    {openChs.map((c) => (
                      <Link key={c.id} href={`/quizzes/hub?tab=challenges&ch=${encodeURIComponent(c.id)}`} className="dditem ddall" onClick={() => setDdOpen(false)} style={{ textDecoration: 'none', color: C.ink }}>
                        <Flame size={14} style={{ color: C.accent, flex: 'none' }} />
                        <span style={{ flex: 1 }}>{c.title}</span>
                        <span style={{ fontSize: 11, color: C.soft, whiteSpace: 'nowrap' }}>{c.sub}</span>
                      </Link>
                    ))}
                    <div className="ddall" style={{ height: 1, background: C.line, margin: '5px 2px' }} />
                  </>
                )}
                <div className="dditem ddall" onClick={() => { setScope('all'); setDoneFilter('all'); setDdOpen(false); setSearch(''); setListMode(null); }}>
                  <span className="dot" style={{ background: C.ink }} /><span style={{ flex: 1 }}>All Categories</span>
                  <span style={{ fontSize: 11, color: C.soft }}>{totalCount}</span>
                </div>
                {cats.map((c) => (
                  <div key={c.key} className="dditem" onClick={() => { setScope(c.key); setDoneFilter('all'); setDdOpen(false); setSearch(''); setListMode(null); }}>
                    <span className="dot" style={{ background: c.c }} /><span style={{ flex: 1 }}>{c.label}</span>
                    <span style={{ fontSize: 11, color: C.soft }}>{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="qz-searchwrap" style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.soft }} />
            <input
              id="qz-main-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${QUIZ_COUNT.toLocaleString()} quizzes…`}
              autoComplete="off"
              style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1.5px solid #b8c0cc', borderRadius: 10, font: 'inherit', fontFamily: FONT, fontSize: 13.5, background: '#fff', color: C.ink, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {(!searchResults && scope === 'all' && !listMode) && (
            <Link href="/submit?for=quiz" className="qz-submit" style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 6, background: C.accent, color: '#fff', border: `1px solid ${C.accent}`, padding: '8px 14px', borderRadius: 10, fontFamily: FONT, fontWeight: 700, fontSize: 12.5, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Submit a Quiz
            </Link>
          )}
          {curCh && (
            <Link key={curCh.id} href={curCh.href || `/quizzes/hub?tab=challenges&ch=${encodeURIComponent(curCh.id)}`} className="qz-daily" style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 9, background: C.accsoft, color: C.accent, border: '1px solid #cddffb', padding: '8px 14px', borderRadius: 10, textDecoration: 'none' }} title={curCh.title}>
              <Flame size={17} style={{ flex: 'none' }} />
              <span style={{ lineHeight: 1.15, display: 'grid' }}>
                {rotation.map((c, i) => (
                  <span key={c.id} style={{ gridArea: '1 / 1', visibility: i === (chSlide % rotation.length) ? 'visible' : 'hidden' }}>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 800 }}>{c.title}</span>
                    <span style={{ display: 'block', fontSize: 10, fontWeight: 600, opacity: 0.85 }}>{c.sub || 'Open now'}</span>
                  </span>
                ))}
              </span>
              {rotation.length > 1 ? (
                <span aria-hidden="true" style={{ display: 'flex', gap: 3, flex: 'none', marginLeft: 1 }}>
                  {rotation.map((_, i) => (
                    <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: C.accent, opacity: i === (chSlide % rotation.length) ? 1 : 0.4 }} />
                  ))}
                </span>
              ) : null}
              <ArrowRight size={15} style={{ flex: 'none' }} />
            </Link>
          )}
        </div>

        {/* lists */}
        {searchResults ? (
          searchResults.length === 0 ? (
            <div style={{ padding: '18px 2px', color: C.soft, fontSize: 14 }}>No quizzes match “{search}”.</div>
          ) : (
            <div className="qflow">
              {searchResults.map((r) => {
                const cc = (DEPT_COLOR[r.dept] || DEPT_COLOR.misc).c;
                return (
                  <Link href={`/quiz/${r.id}`} className="qrow" key={r.id} title={r.rawTitle || r.title}>
                    <span className="dot" style={{ background: cc, alignSelf: 'center' }} />
                    <span className="qtitle">{stripVerb(r.title)}</span><DoneMark id={r.id} />
                    <span className="qmeta" style={{ color: C.soft, fontSize: 10, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }}>{DEPT_LABEL[r.dept]}</span>
                  </Link>
                );
              })}
            </div>
          )
        ) : doneFilter !== 'all' ? (
          (statusList && statusList.length) ? (
            <div className="qflow">
              {statusList.map((q) => {
                const cc = (DEPT_COLOR[q.dept] || DEPT_COLOR.misc).c;
                return (
                  <Link href={`/quiz/${q.id}`} className="qrow" key={q.id} title={q.rawTitle || q.title}>
                    <span className="dot" style={{ background: cc, alignSelf: 'center' }} />
                    <span className="qtitle">{stripVerb(q.title)}</span><DoneMark id={q.id} />
                    <span className="qmeta" style={{ color: C.soft, fontSize: 10, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }}>{DEPT_LABEL[q.dept]}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '18px 2px', color: C.soft, fontSize: 14 }}>{doneFilter === 'unplayed' ? 'You have played every quiz. Nice.' : doneFilter === 'completed' ? 'No quizzes aced at 100% yet. Go get a perfect score.' : 'No quizzes in progress yet. Play one to start.'}</div>
          )
        ) : scope !== 'all' ? (
          <CategoryFull cat={byKey[scope]} plays={plays} leader={leader} leaderKey={leaderKey} />
        ) : listMode === 'live' ? (
          <div className="qfull">
            {liveAll.length === 0 ? (
              <div style={{ padding: '18px 2px', color: C.soft, fontSize: 14 }}>No recent plays yet.</div>
            ) : liveAll.map((f, i) => (
              <Link href={`/quiz/${f.quizId}`} className="qrow" key={i} title={f.title}>
                <span className="qtitle">{stripVerb(f.title)}</span>
                <span className="qmeta" style={{ gap: 8 }}>
                  <span className="lf-extra scorebadge" style={{ flex: 'none', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 7, fontVariantNumeric: 'tabular-nums', background: f.total && f.score / f.total >= 0.8 ? '#e7f7ed' : '#eef1f6', color: f.total && f.score / f.total >= 0.8 ? '#16a34a' : C.soft }}>{f.score}/{f.total}</span>
                  <span className="lf-extra" style={{ color: C.soft }}>{relTime(f.playedAt)}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : listMode ? (
          <div className="qflow">
            {(listMode === 'newest' ? newestAll : mostPlayedAll).map((q) => {
              const cc = (DEPT_COLOR[q.dept] || DEPT_COLOR.misc).c;
              return (
                <Link href={`/quiz/${q.id}`} className="qrow" key={q.id} title={q.rawTitle || q.title}>
                  <span className="dot" style={{ background: cc, alignSelf: 'center' }} />
                  <span className="qtitle">{stripVerb(q.title)}</span><DoneMark id={q.id} />
                  <span className="qmeta">{listMode === 'newest' ? <NewRight q={q} /> : <PlaysRight id={q.id} plays={plays} leader={leader} leaderKey={leaderKey} color={C.accent} />}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="qcols">
            <BrowseColumn label={<>Last Played{playsToday ? <span style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.82)' }}> · {playsToday.toLocaleString()} plays today</span> : null}</>} Icon={Play} color="#10b981" tint="#d8f3e6" filled fill baseCount={5}
              rows={lastPlayed.map((f) => ({ q: { id: f.quizId, title: f.title, rawTitle: f.title }, right: (<>{f.mult > 1 ? <span style={{ fontSize: 10, fontWeight: 800, color: '#10b981', background: '#d8f3e6', borderRadius: 6, padding: '1px 6px' }}>×{f.mult}</span> : null}<span className="score" style={{ fontSize: 11, color: f.total && f.score / f.total >= 0.8 ? '#16a34a' : C.soft }}>{f.score}/{f.total}</span><span style={{ color: C.soft }}>{relTime(f.playedAt)}</span></>) }))} cta="View all ›" onCta={() => setListMode('live')} />
            <BrowseColumn label="Most Played" Icon={Flame} color="#c2691c" tint="#f4e2cd" filled fill baseCount={5}
              rows={mostPlayed.map((q) => ({ q, right: <PlaysRight id={q.id} plays={plays} leader={leader} leaderKey={leaderKey} color="#c2691c" hidePlays /> }))} cta="View all ›" onCta={() => setListMode('mostplayed')} />
            <BrowseColumn label="Newest" Icon={Sparkles} color={C.accent} tint={C.accsoft} filled fill baseCount={5}
              rows={newestAll.slice(0, 15).map((q) => ({ q, right: <NewRight q={q} /> }))} cta="View all ›" onCta={() => setListMode('newest')} />
            {cats.filter((c) => c.key !== 'school').map((c) => {
              const topQ = c.quizzes.slice().sort((a, b) => plays(b.id) - plays(a.id) || a.title.localeCompare(b.title))[0];
              const heroCand = c.quizzes.slice().filter((q) => QUIZ_HEROES[q.id]).sort((a, b) => plays(b.id) - plays(a.id) || a.title.localeCompare(b.title))[0];
              const heroQ = heroCand || topQ;
              const heroId = heroQ && heroQ.id;
              const hh = heroId ? QUIZ_HEROES[heroId] : null;
              const heroUrl = hh ? hh.src : (DEPT_HERO[c.key] || FALLBACK_HERO);
              const heroPos = hh ? hh.pos : undefined;
              const heroTitle = heroId ? (titleById[heroId] || '') : '';
              const exSet = heroId ? new Set([...shownIds, heroId]) : shownIds;
              const rowq = colRows(c, 7, exSet).filter((q) => q.id !== heroId).slice(0, 6);
              return (
                <BrowseColumn key={c.key} label={c.label} Icon={c.Icon} color={c.c} tint={c.t}
                  heroUrl={heroUrl} heroPos={heroPos} heroId={heroId} heroTitle={heroTitle}
                  heroPlays={heroId ? plays(heroId) : 0} heroLeader={heroId ? leader(heroId) : ''}
                  rows={rowq.map((q) => ({ q, right: <PlaysRight id={q.id} plays={plays} leader={leader} leaderKey={leaderKey} color={c.c} hidePlays /> }))}
                  cta={`View all ${c.count} ›`} onCta={() => setScope(c.key)} />
              );
            })}
            {/* Promo tiles — always the last three (Kids Corner last). */}
            <BrowseColumn label="Business News" Icon={Newspaper} color="#4d6b8a" tint="#dbe4ee"
              heroUrl={PROMO_HERO.business} heroHref="/quizzes/business-news" heroCta="Open" heroTitle="Market-moving business quizzes"
              rows={businessNewsRows.map((q) => ({ q, href: `/quiz/${q.id}`, right: <PlaysRight id={q.id} plays={plays} leader={leader} leaderKey={leaderKey} color="#4d6b8a" hidePlays /> }))}
              cta="View all ›" ctaHref="/quizzes/business-news" />
            <BrowseColumn label="Standardized Tests" Icon={GraduationCap} color="#2f6f9f" tint="#d9e6f0"
              heroUrl={PROMO_HERO.tests} heroHref="/exams" heroCta="Start" heroTitle="Where will you get in?"
              rows={EXAM_TILE_ROWS.map((e) => ({ q: { id: e.id, title: e.title, rawTitle: e.title }, href: e.href }))}
              cta="View all ›" ctaHref="/exams" />
            <BrowseColumn label="Kids Corner" Icon={Blocks} color="#3ea0e0" tint="#d7ecfb"
              heroUrl={PROMO_HERO.kids} heroHref="/kids" heroCta="Play" heroTitle="Tap-and-play games for kids"
              rows={KIDS_GAMES.slice(0, 6).map((g) => ({ q: { id: g.id, title: g.title, rawTitle: g.title }, href: g.href }))}
              cta="View all ›" ctaHref="/kids" />
          </div>
        )}
      </div>

      {/* close the dropdown on outside click */}
      {ddOpen && <div className="qz-dd-overlay" onClick={() => setDdOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 20 }} />}

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, flexWrap: 'wrap', margin: '30px 0 8px', fontSize: 12.5, color: C.muted, fontFamily: FONT }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Check className="donemark" size={14} strokeWidth={2.75} style={{ color: C.live }} /> Played</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Star className="donemark" size={14} strokeWidth={1.5} fill="#e8b43a" color="#e8b43a" /> Completed (100%)</span>
      </div>

      <Footer />
    </div>
    </QuizDoneContext.Provider>
  );
}

function fmtAvgTime(s, plays) {
  if (!plays || !Number.isFinite(s) || s <= 0) return '—';
  const avg = Math.round(s / plays);
  const m = Math.floor(avg / 60);
  const sec = avg % 60;
  return m ? `${m}m ${sec}s` : `${sec}s`;
}

// Detailed browse card: title + department dot, then plays / current leader /
// high score / avg time, sourced from /api/quiz/stats + the totals leaders map.
function DetailCard({ q, s, leader, color }) {
  const plays = s ? (s.plays || 0) : 0;
  const high = s ? (s.bestScore || 0) : 0;
  const avgTime = fmtAvgTime(s ? s.totalTime : 0, plays);
  const Stat = ({ label, value }) => (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: C.soft }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
  return (
    <Link href={`/quiz/${q.id}`} className="qlink" title={q.rawTitle || q.title}>
      <div className="card" style={{ padding: '12px 14px', gap: 10, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="dot" style={{ background: color, flex: 'none' }} />
          <span style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stripVerb(q.title)}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
          <Stat label="Plays" value={plays ? plays.toLocaleString() : '0'} />
          <Stat label="Current Leader" value={leader || '—'} />
          <Stat label="High Score" value={plays ? high.toLocaleString() : '—'} />
          <Stat label="Avg Time" value={avgTime} />
        </div>
      </div>
    </Link>
  );
}

function PlaysRight({ id, plays, leader, leaderKey, color, hidePlays }) {
  const p = plays(id);
  const ld = leader(id);
  return (
    <>
      {!hidePlays && p > 0 ? <span className="score" style={{ fontSize: 11 }}>▶ {p.toLocaleString()}</span> : null}
      {ld ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Crown size={11} style={{ color }} /><PlayerLink userKey={leaderKey ? leaderKey(id) : ''}>{ld}</PlayerLink></span>
      ) : <span style={{ color: C.soft }}>Empty</span>}
    </>
  );
}

function NewRight({ q }) {
  const t = Date.parse(q.publishedAt);
  let when = '';
  if (Number.isFinite(t)) {
    const d = new Date(t);
    when = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return (
    <>
      <span style={{ color: C.soft }}>{when}</span>
    </>
  );
}

// Selected-category compact view: the WHOLE category, leader-only, laid out in
// two columns (single column under ~680px). Header shows the category icon +
// label + total count.
function CategoryFull({ cat, plays, leader, leaderKey }) {
  if (!cat) return null;
  const rows = cat.quizzes.slice()
    .sort((a, b) => plays(b.id) - plays(a.id) || a.title.localeCompare(b.title));
  const { Icon, c: color, t: tint } = cat;
  return (
    <section style={{ minWidth: 0 }}>
      <div className="colhead" style={{ borderColor: C.accent, background: C.accent }}>
        <span style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(255,255,255,0.22)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} />
        </span>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#fff' }}>{cat.label}</h3>
        <span className="viewall" style={{ color: '#fff' }}>{cat.count} quizzes</span>
      </div>
      <div className="qfull">
        {rows.map((q) => (
          <Link href={`/quiz/${q.id}`} className="qrow" key={q.id} title={q.rawTitle || q.title}>
            <span className="qtitle">{stripVerb(q.title)}</span><DoneMark id={q.id} />
            <span className="qmeta"><PlaysRight id={q.id} plays={plays} leader={leader} leaderKey={leaderKey} color={color} hidePlays /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ---------- Conditional overlay backdrop (navy pill only when the photo needs it) ----------
// Samples the region of a cover-cropped hero photo that sits behind a small white
// text overlay and reports whether bare white text would blend in (light or busy
// area), in which case the caller adds a navy backdrop pill. `region` is
// [x0,y0,x1,y1] in fractions of the tile box; `scrim` (0..1) folds in any dark
// gradient already covering that region; `useParentBox` measures the ref
// element's parent (for refs attached to an inner overlay div). Fails safe: if
// the image cannot be read even via the same-origin optimizer, the pill goes on.
const PILL_REGION_TOPLEFT = [0.02, 0.02, 0.66, 0.18];
const PILL_REGION_FOOTER = [0.03, 0.76, 0.97, 0.98];
function usePillProbe(url, region, scrim, useParentBox) {
  const ref = useRef(null);
  const [pill, setPill] = useState(false);
  useEffect(() => {
    if (!url) { setPill(false); return undefined; }
    let dead = false;
    const raw = ref.current;
    const el = useParentBox && raw && raw.parentElement ? raw.parentElement : raw;
    const box = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null;
    const tw = box && box.width > 10 ? box.width : 340;
    const th = box && box.height > 10 ? box.height : 215;
    const proxied = `/_next/image?url=${encodeURIComponent(url)}&w=384&q=50`;
    const attempt = (src, last) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (dead) return;
        try {
          const W = 96;
          const H = Math.max(24, Math.round((W * th) / tw));
          const c = document.createElement('canvas');
          c.width = W; c.height = H;
          const g = c.getContext('2d', { willReadFrequently: true });
          const sc = Math.max(W / img.naturalWidth, H / img.naturalHeight);
          g.drawImage(img, (W - img.naturalWidth * sc) / 2, (H - img.naturalHeight * sc) / 2, img.naturalWidth * sc, img.naturalHeight * sc);
          const rx = Math.max(0, Math.floor(region[0] * W));
          const ry = Math.max(0, Math.floor(region[1] * H));
          const rw = Math.min(W - rx, Math.max(1, Math.ceil((region[2] - region[0]) * W)));
          const rh = Math.min(H - ry, Math.max(1, Math.ceil((region[3] - region[1]) * H)));
          const d = g.getImageData(rx, ry, rw, rh).data;
          let sum = 0; let bright = 0; const n = d.length / 4;
          for (let i = 0; i < d.length; i += 4) {
            let L = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
            L = L * (1 - scrim) + 0.05 * scrim;
            sum += L; if (L > 0.6) bright += 1;
          }
          if (!dead) setPill(sum / n > 0.44 || bright / n > 0.3);
        } catch (e) {
          if (!dead) { if (last) setPill(true); else attempt(proxied, true); }
        }
      };
      img.onerror = () => { if (!dead) { if (last) setPill(true); else attempt(proxied, true); } };
      img.src = src;
    };
    attempt(url, false);
    return () => { dead = true; };
  }, [url, scrim]);
  return [ref, pill];
}

function BrowseColumn({ label, Icon, color, tint, rows, cta, onCta, ctaHref, heroUrl, heroPos, heroId, heroHref, heroCta, heroTitle, heroPlays, heroLeader, filled, fill, baseCount }) {
  const hasHero = !!heroUrl;
  const blueHead = hasHero || filled;
  const headFg = blueHead ? '#fff' : color;
  const heroLink = heroHref || (heroId ? `/quiz/${heroId}` : '#');
  const base = baseCount || rows.length;
  const secRef = useRef(null);
  const headRef = useRef(null);
  const [shown, setShown] = useState(base);
  const [pillRef, statPill] = usePillProbe(hasHero && heroId ? heroUrl : null, PILL_REGION_TOPLEFT, 0.06, false);
  // A filled column (Last Played / Most Played / Newest) that shares a grid row
  // with a taller hero card gets stretched by align-items:stretch, leaving a
  // blank gap below its rows. Fill that gap with more quiz-title rows. We size
  // to the hero sibling's own (fixed) height, NOT this column's stretched
  // height: sizing to self would let a filled column prop up its own grid row
  // and ratchet taller on resize (ResizeObserver feedback). Sizing to the hero
  // means no feedback loop, and the column collapses back to `base` whenever it
  // no longer sits beside a hero (e.g. after resizing 2-col -> 3-col). Works on
  // every viewport, desktop included.
  useEffect(() => {
    if (!fill || typeof window === 'undefined') return;
    const sec = secRef.current; if (!sec) return;
    const measure = () => {
      const grid = sec.parentElement; if (!grid) return;
      const myTop = sec.getBoundingClientRect().top;
      let rowHeroH = 0;
      for (const sib of grid.children) {
        if (sib === sec) continue;
        const r = sib.getBoundingClientRect();
        if (Math.abs(r.top - myTop) > 2) continue;            // same grid row only
        if (sib.querySelector('.cc-hero')) rowHeroH = Math.max(rowHeroH, r.height);
      }
      let n = base;
      if (rowHeroH > 0) {
        const headH = headRef.current ? headRef.current.offsetHeight : 44;
        const firstRow = sec.querySelector('.qrow');
        const rowH = firstRow ? firstRow.getBoundingClientRect().height : 34;
        n = Math.max(base, Math.floor((rowHeroH - headH) / Math.max(1, rowH)));
      }
      setShown(Math.min(rows.length, n));
    };
    measure();
    const grid = sec.parentElement;
    const ro = new ResizeObserver(measure);
    ro.observe(sec);
    if (grid) ro.observe(grid);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [fill, base, rows.length]);
  const shownRows = fill ? rows.slice(0, shown) : rows;
  return (
    <section ref={secRef} className={`mc-open${(hasHero || filled) ? ' catcard' : ''}`} style={{ minWidth: 0 }}>
      {hasHero ? (
        <Link href={heroLink} className="cc-hero" style={{ backgroundImage: `url("${heroUrl}")`, backgroundPosition: heroPos || 'center' }} title={heroTitle}>
          <span className="cc-ov" ref={pillRef} />
          {heroId ? <span className={`cc-stat${statPill ? ' pill' : ''}`}>{heroPlays > 0 ? `${heroPlays.toLocaleString()} plays` : 'New quiz'}{heroLeader ? <><span aria-hidden="true"> · </span><Crown size={11} style={{ color: '#e8b43a', flex: 'none' }} /> {heroLeader}</> : null}</span> : null}
          <div className="cc-btm">
            <span className="cc-htitle">{stripVerb(heroTitle)}</span>
            <span className="cc-play">{heroCta || 'Play'} <ArrowRight size={13} style={{ verticalAlign: -2 }} /></span>
          </div>
        </Link>
      ) : null}
      <div ref={headRef} className={`colhead${(hasHero || filled) ? ' cc-head' : ''}${filled ? ' cc-filled' : ''}`} style={{ borderColor: blueHead ? C.accent : color, background: blueHead ? C.accent : `color-mix(in srgb, ${color} 6%, #fff)` }}>
        <span className="colicon" style={{ width: 24, height: 24, borderRadius: 7, background: blueHead ? 'rgba(255,255,255,0.22)' : tint, color: blueHead ? '#fff' : color, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <Icon size={14} />
        </span>
        <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: headFg }}>{label}</h3>
        {ctaHref
          ? <Link href={ctaHref} className="viewall vall" style={{ color: headFg, textDecoration: 'none', fontSize: 10, fontWeight: 700 }}>{cta}</Link>
          : onCta
          ? <button type="button" onClick={(e) => { e.stopPropagation(); onCta(); }} className="viewall vall" style={{ color: headFg, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, fontWeight: 700 }}>{cta}</button>
          : <span className="viewall vall" style={{ color: headFg }}>{cta}</span>}
      </div>
      {shownRows.map(({ q, right, href }) => (
        <Link href={href || `/quiz/${q.id}`} className="qrow" key={q.id} title={q.rawTitle || q.title}>
          <span className="qtitle">{stripVerb(q.title)}</span><DoneMark id={q.id} />
          <span className="qmeta">{right}</span>
        </Link>
      ))}
    </section>
  );
}
