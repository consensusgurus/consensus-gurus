'use client';

// DailyEndCard — the shared end-of-game result popup for every daily game
// (Crux, Emcee, Garble, Links, Span, Dating, Tally, Suds, Circa, Extra,
// Carve, Stet, Outwit, Tuck, Alibi, Cipher, Ping).
//
// One component, used by all daily clients. It renders:
//   1. a centered results block — the game's own finish graphic, the
//      headline (each client passes its "N% Complete"), the score subline,
//      and three actions (Share Result · Leaderboard · Replay); and
//   2. a "Your day so far" completion journey — the 16 daily games in one
//      flat two-column list. The games you have already finished float to the
//      top-left and fill straight down column 1, each shaded in its family
//      color with a filled check; the games still to play sit below and in
//      column 2, lighter, each showing its family type. The game you just
//      finished is pinned first with a "Just finished" tag.
//
// Each client passes only its result strings + handlers:
//   <DailyEndCard self="garble"
//     headline={`${pct}% Complete`}
//     subline={<>Garble #{PUZZLE.num} &middot; {score}/10 &middot; {elapsed}</>}
//     onShare={copyShare} shareLabel={copied ? 'Copied' : 'Share Result'}
//     onReplay={resetGame} onClose={() => setJustWon(false)} />
// The finish graphic + accent come from `self` via GAME_META. To add a game:
// add it to GAME_META (graphic+accent) and to DAILY_GAMES (family + tile copy).

import React, { useState, useEffect } from 'react';
import {
  Type, Clock, Globe, Hash, Share2, BarChart3, RotateCcw, Check, X,
  Trophy, Link2, Flag, CalendarCheck, Scale, Grid3x3, LayoutGrid, Newspaper, FlagTriangleRight,
  Pencil, Users, ArrowRight, Puzzle, Fingerprint, KeyRound, Thermometer,
} from 'lucide-react';
import ReportIssue from './ReportIssue';

const RUST = '#c0392b';

// LAUNCH WINDOW (owner ruling 2026-07-18): brand-new daily games lead the
// "still to play" list for their first FOUR days so players actually meet
// them; after `until` (ET, inclusive) the canonical order resumes. Keep in
// sync with the same pin in app/api/quiz/daily-order/route.js.
const LAUNCH_PIN = { keys: ['warmer', 'ping', 'tuck', 'alibi', 'cipher'], until: '2026-07-21' };
function etTodayEC() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const INK = '#1c1e24';
const FADED = '#6b7280';

// ---- per-game finish graphic + accent (keyed by self) ----------------------
// accent = headline + primary button color. badgeBg/badgeInk = the finish
// medallion. Fin = the lucide glyph shown in it.
const GOLD_BADGE = 'radial-gradient(circle at 50% 38%,#f5d878,#e6b93f 62%,#cfa22e)';
export const GAME_META = {
  crux:   { accent: '#2563eb', badgeBg: '#2563eb', badgeInk: '#fff', Fin: LayoutGrid },
  emcee:  { accent: '#c026d3', badgeBg: '#c026d3', badgeInk: '#fff', Fin: Type },
  garble: { accent: '#0e1d40', badgeBg: GOLD_BADGE, badgeInk: '#5c4a06', Fin: Trophy },
  links:  { accent: '#166534', badgeBg: '#166534', badgeInk: '#fff', Fin: Link2 },
  span:   { accent: '#9d174d', badgeBg: '#9d174d', badgeInk: '#fff', Fin: Flag },
  dating: { accent: '#6d28d9', badgeBg: '#6d28d9', badgeInk: '#fff', Fin: CalendarCheck },
  circa:  { accent: '#0e7490', badgeBg: '#0e7490', badgeInk: '#fff', Fin: Clock },
  extra:  { accent: '#b91c1c', badgeBg: '#b91c1c', badgeInk: '#fff', Fin: Newspaper },
  tally:  { accent: '#15803d', badgeBg: '#15803d', badgeInk: '#fff', Fin: Scale },
  suds:   { accent: '#ea580c', badgeBg: '#ea580c', badgeInk: '#fff', Fin: Grid3x3 },
  carve:  { accent: '#7c3aed', badgeBg: '#7c3aed', badgeInk: '#fff', Fin: LayoutGrid },
  stet:   { accent: '#0369a1', badgeBg: '#0369a1', badgeInk: '#fff', Fin: Pencil },
  outwit: { accent: '#1f2937', badgeBg: '#1f2937', badgeInk: '#e8b43a', Fin: Users },
  tuck:   { accent: '#92400e', badgeBg: '#92400e', badgeInk: '#fff', Fin: Puzzle },
  alibi:  { accent: '#8b1e2d', badgeBg: '#8b1e2d', badgeInk: '#fff', Fin: Fingerprint },
  cipher: { accent: '#0f766e', badgeBg: '#0f766e', badgeInk: '#fff', Fin: KeyRound },
  ping:   { accent: '#0284c7', badgeBg: '#0284c7', badgeInk: '#fff', Fin: Globe },
  warmer: { accent: '#dc2626', badgeBg: '#dc2626', badgeInk: '#fff', Fin: Thermometer },
};

// ---- the five families (type label shown on each tile) ---------------------
export const CAT_META = {
  word:      { name: 'Word',      color: '#2563eb', Icon: Type },
  history:   { name: 'History',   color: '#6d28d9', Icon: Clock },
  geography: { name: 'Geography', color: '#0e7c5a', Icon: Globe },
  numbers:   { name: 'Numbers',   color: '#ea580c', Icon: Hash },
  logic:     { name: 'Logic',     color: '#9f1239', Icon: Fingerprint },
};

// ---- the daily slate (16 games) --------------------------------------------
// Canonical order = the order the "still to play" tiles appear in. Completed
// games are lifted out of this order to the top of the list at render time.
export const DAILY_GAMES = [
  { key: 'crux',   cat: 'word',      name: 'Crux',   tag: 'A clueless crossword',      href: '/crux' },
  { key: 'emcee',  cat: 'word',      name: 'Emcee',  tag: 'The daily mini crossword',  href: '/emcee' },
  { key: 'links',  cat: 'word',      name: 'Links',  tag: 'Four hidden threads',       href: '/links' },
  { key: 'garble', cat: 'word',      name: 'Garble', tag: 'Untangle five words',       href: '/garble' },
  { key: 'stet',   cat: 'word',      name: 'Stet',   tag: 'Fix the wrong word',        href: '/stet' },
  { key: 'tuck',   cat: 'word',      name: 'Tuck',   tag: 'Build your own crossword',  href: '/tuck' },
  { key: 'dating', cat: 'history',   name: 'Dating', tag: 'Put five moments in order', href: '/dating' },
  { key: 'circa',  cat: 'history',   name: 'Circa',  tag: 'Pin the year it happened',  href: '/circa' },
  { key: 'extra',  cat: 'history',   name: 'Extra',  tag: 'Name the redacted front page', href: '/extra' },
  { key: 'span',   cat: 'geography', name: 'Span',   tag: 'Cross the map, border by border', href: '/span' },
  { key: 'ping',   cat: 'geography', name: 'Ping',   tag: 'Find the secret city',        href: '/ping' },
  { key: 'tally',  cat: 'numbers',   name: 'Tally',  tag: 'Balance every row and column', href: '/tally' },
  { key: 'suds',   cat: 'numbers',   name: 'Suds',   tag: 'The daily 9×9 sudoku',      href: '/suds' },
  { key: 'carve',  cat: 'numbers',   name: 'Carve',  tag: 'Carve equal-sum regions',   href: '/carve' },
  { key: 'outwit', cat: 'numbers',   name: 'Outwit', tag: 'Beat the crowd',            href: '/outwit' },
  { key: 'cipher', cat: 'numbers',   name: 'Cipher', tag: 'Crack the letter math',     href: '/cipher' },
  { key: 'alibi',  cat: 'logic',     name: 'Alibi',  tag: 'Solve the nightly whodunit', href: '/alibi' },
  { key: 'warmer', cat: 'word',      name: 'Warmer', tag: 'Hotter or colder',           href: '/warmer' },
];

/**
 * @param self          game key, e.g. "garble" — decides finish graphic, accent, "Just finished" tile
 * @param headline      node/string, e.g. `${pct}% Complete` (client computes pct)
 * @param subline       node, e.g. <>Garble #{num} · {score}/10 · {elapsed}</>
 * @param onShare / shareLabel   share handler + label
 * @param onReplay      replay handler
 * @param onClose       closes any celebration modal (e.g. () => setJustWon(false)); run before scroll
 * @param boardId       leaderboard element id to scroll to (default "daily-leaderboard")
 * @param onLeaderboard optional override for the whole close+scroll behavior
 */
export default function DailyEndCard({
  self,
  won = true,
  modal = false,
  headline = 'You scored 100%',
  subline = null,
  onShare, shareLabel = 'Share Result',
  onReplay,
  onClose,
  boardId = 'daily-leaderboard',
  onLeaderboard,
}) {
  const [dailyMe, setDailyMe] = useState(null);
  useEffect(() => {
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    const qs = new URLSearchParams();
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    let alive = true;
    fetch('/api/quiz/daily-combined?' + qs.toString())
      .then((r) => r.json())
      .then((d) => { if (alive && d && d.me) setDailyMe({ ...d.me, maxTotal: d.maxTotal, gameCount: d.gameCount }); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  const leftToPlay = dailyMe ? Math.max(0, (dailyMe.gameCount || 0) - (dailyMe.gamesPlayed || 0)) : 0;
  const meta = GAME_META[self] || GAME_META.crux;
  // On a win, the game's own celebratory badge + accent. On a loss, a neutral
  // badge and rust headline so the card never congratulates a miss.
  const Fin = won ? meta.Fin : FlagTriangleRight;
  const badgeBg = won ? meta.badgeBg : '#eceef1';
  const badgeInk = won ? meta.badgeInk : '#6b7280';
  const headColor = won ? meta.accent : RUST;

  // Which daily games the viewer has completed today. The just-finished game is
  // always checked (works for guests too, before the API resolves); dailyMe.perGame
  // — the registered viewer's per-game results for today's slate — fills in every
  // OTHER game they've already played so their whole day shows as done, not just
  // the leaf they just came from.
  const completed = new Set();
  if (self) completed.add(self);
  if (dailyMe && dailyMe.perGame) {
    for (const k of Object.keys(dailyMe.perGame)) completed.add(k);
  }

  // The journey order: the just-finished game first, then every other game the
  // viewer has completed (canonical order), then everything still to play —
  // with just-launched games pinned to the front of that segment during
  // their launch window.
  let todo = DAILY_GAMES.filter((g) => !completed.has(g.key));
  if (etTodayEC() <= LAUNCH_PIN.until) {
    todo = [
      ...todo.filter((g) => LAUNCH_PIN.keys.includes(g.key)),
      ...todo.filter((g) => !LAUNCH_PIN.keys.includes(g.key)),
    ];
  }
  const ordered = [
    ...DAILY_GAMES.filter((g) => g.key === self),
    ...DAILY_GAMES.filter((g) => g.key !== self && completed.has(g.key)),
    ...todo,
  ];
  const total = DAILY_GAMES.length;
  const doneCount = DAILY_GAMES.filter((g) => completed.has(g.key)).length;
  const pctDone = total ? Math.round((doneCount / total) * 100) : 0;

  // Leaderboard: close the popup, then smooth-scroll to the board below the card.
  const goBoard = () => {
    if (onLeaderboard) { onLeaderboard(); return; }
    if (onClose) onClose();
    if (typeof document !== 'undefined') {
      const el = document.getElementById(boardId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const inner = (
    <div className="dec-card" style={modal ? { position: 'relative', maxHeight: '92vh', overflowY: 'auto' } : undefined}>
      {modal && (
        <button type="button" className="dec-x" onClick={onClose} aria-label="Close">
          <X size={18} strokeWidth={2.4} />
        </button>
      )}
      <style>{`
        .dec-card{background:#fff;border:2px solid ${INK};border-radius:14px;padding:22px 18px 16px;max-width:472px;width:100%;margin:0 auto;font-family:${SANS};}
        .dec-backdrop{position:fixed;inset:0;z-index:85;background:rgba(20,22,28,0.55);display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto;}
        .dec-x{position:absolute;top:10px;right:10px;background:none;border:none;cursor:pointer;color:${FADED};padding:4px;display:flex;line-height:0;z-index:2;}
        .dec-x:hover{color:${INK};}
        .dec-top{text-align:center;}
        .dec-finish{width:62px;height:62px;border-radius:50%;margin:0 auto 11px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 0 rgba(20,22,28,0.14),inset 0 1px 2px rgba(255,255,255,0.55);}
        .dec-headline{font-size:22px;font-weight:800;margin:0 0 3px;letter-spacing:-.01em;}
        .dec-subline{font-size:13.5px;font-weight:700;color:${FADED};margin:0 0 14px;}
        .dec-btnrow{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;}
        .dec-chase{display:inline-flex;align-items:center;gap:6px;margin:2px 0 14px;padding:6px 12px;border-radius:999px;background:#eef3ff;border:1px solid #cddffb;color:#37506e;font-size:12.5px;font-weight:700;text-decoration:none;}
        .dec-chase b{color:#1c1e24;}
        .dec-btn{font-family:${SANS};font-weight:800;font-size:13.5px;border:2px solid ${INK};background:#fff;color:${INK};border-radius:8px;padding:9px 14px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;text-decoration:none;}
        .dec-btn.primary{color:#fff;}
        .dec-btn.ghost{border-color:#c3c8cf;color:${FADED};}
        .dec-div{border-top:1px dashed rgba(28,30,36,0.16);margin:14px 0 0;}

        .jr-head{display:flex;align-items:baseline;justify-content:space-between;margin:12px 2px 4px;}
        .jr-eyebrow{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:${FADED};}
        .jr-count{font-size:11px;font-weight:800;color:${INK};}
        .jr-count b{color:#0e7c5a;}
        .jr-bar{height:6px;border-radius:99px;background:#e9edf2;overflow:hidden;margin:0 2px 10px;}
        .jr-bar > span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#0e7c5a,#16a34a);}

        .jr-grid{column-count:2;column-gap:7px;}
        .jr-tile{break-inside:avoid;margin:0 0 6px;position:relative;display:block;border-radius:9px;padding:6px 9px 6px 10px;text-decoration:none;border:1px solid #e2e6eb;background:#fff;}
        .jr-tile.todo:hover{border-color:#c6ccd4;background:#fafbfc;}
        .jr-tile.done{border-color:transparent;padding-left:12px;}
        .jr-tile.done:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3.5px;border-radius:9px 0 0 9px;background:var(--c);}
        .jr-type{display:inline-flex;align-items:center;gap:3px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--c);margin-bottom:1px;}
        .jr-name{display:block;font-size:12.5px;font-weight:800;color:${INK};line-height:1.15;}
        .jr-tag{display:block;font-size:10px;font-weight:600;color:${FADED};line-height:1.2;margin-top:1px;}
        .jr-mark{position:absolute;top:50%;transform:translateY(-50%);right:9px;display:flex;align-items:center;}
        .jr-check{width:17px;height:17px;border-radius:50%;background:#16a34a;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 0 rgba(20,22,28,0.12);}
        .jr-play{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#aeb4bd;display:inline-flex;align-items:center;gap:2px;}
        .jr-here{position:absolute;top:-6px;left:10px;font-size:7.5px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#fff;background:#0e7c5a;border-radius:4px;padding:1px 5px;box-shadow:0 1px 0 rgba(20,22,28,0.14);}

        .dec-foot{text-align:center;margin-top:12px;}
        .dec-foot a{font-family:${MONO};font-size:11px;letter-spacing:.06em;text-transform:uppercase;font-weight:500;color:#0e1d40;text-decoration:none;border-bottom:1px solid rgba(14,29,64,0.5);padding-bottom:1px;}
        @media(max-width:440px){.jr-grid{column-count:1;}}
      `}</style>

      <div className="dec-top">
        <div className="dec-finish" style={{ background: badgeBg, color: badgeInk }}>
          <Fin size={30} strokeWidth={2} />
        </div>
        <div className="dec-headline" style={{ color: headColor }}>{headline}</div>
        {subline ? <div className="dec-subline">{subline}</div> : null}
        {dailyMe && dailyMe.total != null ? (
          <a href="/daily" className="dec-chase">
            <Trophy size={13} strokeWidth={2.2} /> You&rsquo;re <b>#{dailyMe.rank}</b> on today&rsquo;s daily board &middot; <b>{dailyMe.total}/{dailyMe.maxTotal}</b>{leftToPlay > 0 ? <> &middot; {leftToPlay} game{leftToPlay === 1 ? '' : 's'} left</> : null}
          </a>
        ) : null}
        <div className="dec-btnrow">
          <button type="button" className="dec-btn primary" style={{ background: meta.accent, borderColor: meta.accent }} onClick={onShare}>
            <Share2 size={15} strokeWidth={2} /> {shareLabel}
          </button>
          <button type="button" className="dec-btn" onClick={goBoard}>
            <BarChart3 size={15} strokeWidth={2} /> Leaderboard
          </button>
          <button type="button" className="dec-btn ghost" onClick={onReplay}>
            <RotateCcw size={15} strokeWidth={2} /> Replay
          </button>
        </div>
      </div>

      <div className="dec-div" />
      <div className="jr-head">
        <span className="jr-eyebrow">Your day so far</span>
        <span className="jr-count"><b>{doneCount}</b> of {total} done</span>
      </div>
      <div className="jr-bar"><span style={{ width: `${pctDone}%` }} /></div>
      <div className="jr-grid">
        {ordered.map((g) => {
          const cm = CAT_META[g.cat];
          const Icon = cm.Icon;
          const isDone = completed.has(g.key);
          const isSelf = g.key === self;
          return (
            <a
              key={g.key}
              href={g.href}
              className={`jr-tile ${isDone ? 'done' : 'todo'}`}
              style={isDone ? { '--c': cm.color, background: cm.color + '14' } : { '--c': cm.color }}
            >
              {isSelf && <span className="jr-here">Just finished</span>}
              <span className="jr-type"><Icon size={10} strokeWidth={2.4} />{cm.name}</span>
              <span className="jr-name">{g.name}</span>
              <span className="jr-tag">{g.tag}</span>
              <span className="jr-mark">
                {isDone ? (
                  <span className="jr-check"><Check size={10} strokeWidth={3.4} /></span>
                ) : (
                  <span className="jr-play">Play<ArrowRight size={10} strokeWidth={2.6} /></span>
                )}
              </span>
            </a>
          );
        })}
      </div>
      <div className="dec-foot"><a href="/daily">All daily games &amp; archive →</a></div>
      {self ? (
        <ReportIssue
          self={self}
          name={(DAILY_GAMES.find((g) => g.key === self) || {}).name}
          accent={meta.accent}
        />
      ) : null}
    </div>
  );

  if (!modal) return inner;
  return (
    <div className="dec-backdrop" onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 472, margin: 'auto' }} onClick={(e) => e.stopPropagation()}>
        {inner}
      </div>
    </div>
  );
}
