'use client';

// DailyEndCard — the shared end-of-game result popup for every daily game
// (Crux, Garble, Links, Span, Dating, Tally, Suds, Circa, Extra, Carve).
//
// One component, used by all daily clients. It renders:
//   1. a centered results block — the game's own finish graphic, the
//      headline (each client passes its "N% Complete"), the score subline,
//      and three actions (Share Result · Leaderboard · Replay); and
//   2. a "Keep playing — by category" tree of the four game families
//      (Word / History / Geography / Numbers), each showing its games.
//
// LAYOUT RULE (gridOrder): the family of the game you just finished is always
// TOP-LEFT and flagged "You're here". Numbers is always pinned BOTTOM-RIGHT —
// except when the finished game IS a Numbers game, in which case Numbers takes
// the top-left slot and the fourth family slides into the bottom-right. The
// current game's own leaf gets a check.
//
// Each client passes only its result strings + handlers:
//   <DailyEndCard self="garble"
//     headline={`${pct}% Complete`}
//     subline={<>Garble #{PUZZLE.num} &middot; {score}/10 &middot; {elapsed}</>}
//     onShare={copyShare} shareLabel={copied ? 'Copied' : 'Share Result'}
//     onReplay={resetGame} onClose={() => setJustWon(false)} />
// The finish graphic, accent color, category placement, and the tree all come
// from `self` via GAME_META + CATEGORIES below. Add a game in three places:
// GAME_META (graphic+accent), GAME_CATEGORY (family), and the family's leaves.

import React, { useState, useEffect } from 'react';
import {
  Type, Clock, Globe, Hash, Share2, BarChart3, RotateCcw, Check, X,
  Trophy, Link2, Flag, CalendarCheck, Scale, Grid3x3, LayoutGrid, Newspaper, FlagTriangleRight,
} from 'lucide-react';

const RUST = '#c0392b';

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
};

// ---- the four families ------------------------------------------------------
export const CATEGORIES = {
  word: {
    name: 'Word games', accent: '#0e1d40', border: 'rgba(14,29,64,0.32)', Icon: Type,
    leaves: [
      { key: 'crux', name: 'Crux', tag: 'A clueless crossword', href: '/crux' },
      { key: 'emcee', name: 'Emcee', tag: 'The daily mini crossword', href: '/emcee' },
      { key: 'links', name: 'Links', tag: 'Four hidden threads', href: '/links' },
      { key: 'garble', name: 'Garble', tag: 'Untangle five words', href: '/garble' },
    ],
  },
  history: {
    name: 'History', accent: '#6d28d9', border: 'rgba(109,40,217,0.3)', Icon: Clock,
    leaves: [
      { key: 'dating', name: 'Dating', tag: 'Put five moments in order', href: '/dating' },
      { key: 'circa', name: 'Circa', tag: 'Pin the year it happened', href: '/circa' },
      { key: 'extra', name: 'Extra', tag: 'Name the redacted front page', href: '/extra' },
    ],
  },
  geography: {
    name: 'Geography', accent: '#0e7c5a', border: 'rgba(14,124,90,0.32)', Icon: Globe,
    leaves: [
      { key: 'span', name: 'Span', tag: 'Cross the map, border by border', href: '/span' },
      { name: 'Map: Europe', tag: 'No outlines — our #1', href: '/quiz/europe-no-outline' },
      { name: 'Geo Guesser', tag: 'Name the city landmark', href: '/quiz/nyc-landmarks-geo-guesser' },
    ],
  },
  numbers: {
    name: 'Numbers', accent: '#ea580c', border: 'rgba(234,88,12,0.32)', Icon: Hash,
    leaves: [
      { key: 'tally', name: 'Tally', tag: 'Balance every row and column', href: '/tally' },
      { key: 'suds', name: 'Suds', tag: 'The daily 9×9 sudoku', href: '/suds' },
      { key: 'carve', name: 'Carve', tag: 'Carve equal-sum regions', href: '/carve' },
    ],
  },
};

// which family each daily game belongs to
export const GAME_CATEGORY = {
  crux: 'word', emcee: 'word', garble: 'word', links: 'word',
  span: 'geography',
  dating: 'history', circa: 'history', extra: 'history',
  tally: 'numbers', suds: 'numbers', carve: 'numbers',
};

const ORDER = ['word', 'history', 'geography', 'numbers'];

// THE RULE: self family top-left; Numbers pinned bottom-right unless self IS
// numbers (then numbers is top-left and the fourth family fills bottom-right).
export function gridOrder(selfCat) {
  if (selfCat === 'numbers') return ['numbers', ...ORDER.filter((c) => c !== 'numbers')];
  const mids = ORDER.filter((c) => c !== selfCat && c !== 'numbers');
  return [selfCat, mids[0], mids[1], 'numbers'];
}

function CategoryCol({ catKey, selfKey, isSelf }) {
  const c = CATEGORIES[catKey];
  const Icon = c.Icon;
  return (
    <div className="dec-col" style={{ borderColor: c.border, boxShadow: isSelf ? '0 0 0 2px rgba(28,30,36,0.10)' : 'none' }}>
      <div className="dec-head" style={{ background: c.accent }}>
        <Icon size={14} strokeWidth={2.4} />
        <span className="dec-cname">{c.name}</span>
        {isSelf && <span className="dec-here">You&rsquo;re here</span>}
      </div>
      <div className="dec-leaves">
        {c.leaves.map((l, i) =>
          l.soon ? (
            <span key={i} className="dec-leaf dec-soon">
              <span className="dec-ln">{l.name} <span className="dec-badge" style={{ color: c.accent, borderColor: c.accent }}>Coming soon</span></span>
              <span className="dec-lt">{l.tag}</span>
            </span>
          ) : (
            <a key={i} className="dec-leaf" href={l.href}>
              <span className="dec-ln">{l.name}{l.key === selfKey && <Check size={12} strokeWidth={3} style={{ color: '#16a34a' }} />}</span>
              <span className="dec-lt">{l.tag}</span>
            </a>
          )
        )}
      </div>
    </div>
  );
}

/**
 * @param self          game key, e.g. "garble" — decides finish graphic, accent, placement, check
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
  headline = '100% Complete',
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
  const selfCat = GAME_CATEGORY[self] || 'word';
  const order = gridOrder(selfCat);

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
        .dec-div{border-top:1px dashed rgba(28,30,36,0.16);margin:16px 0 0;}
        .dec-eyebrow{font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:${FADED};text-align:center;margin:14px 0 12px;}
        .dec-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;}
        .dec-col{border:1.5px solid;border-radius:12px;overflow:hidden;background:#fff;display:flex;flex-direction:column;}
        .dec-head{display:flex;align-items:center;gap:7px;padding:8px 11px;color:#fff;}
        .dec-cname{font-size:12.5px;font-weight:800;letter-spacing:.01em;}
        .dec-here{margin-left:auto;font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;background:rgba(255,255,255,0.25);color:#fff;border-radius:4px;padding:1px 5px;white-space:nowrap;}
        .dec-leaves{padding:5px 8px 8px;display:flex;flex-direction:column;gap:3px;flex:1 1 auto;justify-content:space-between;}
        .dec-leaf{position:relative;display:flex;flex-direction:column;padding:5px 4px 5px 15px;border-radius:7px;text-decoration:none;}
        .dec-leaf:hover{background:rgba(28,30,36,0.05);}
        .dec-leaf:before{content:"";position:absolute;left:4px;top:-2px;height:13px;width:8px;border-left:1.5px solid rgba(28,30,36,0.22);border-bottom:1.5px solid rgba(28,30,36,0.22);border-bottom-left-radius:5px;}
        .dec-ln{font-size:12.5px;font-weight:800;color:${INK};line-height:1.2;display:flex;align-items:center;gap:5px;}
        .dec-lt{font-size:10.5px;font-weight:600;color:${FADED};line-height:1.25;}
        .dec-soon{opacity:.7;}
        .dec-soon:hover{background:transparent;}
        .dec-soon .dec-ln{color:${FADED};}
        .dec-badge{font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;border:1px dashed;border-radius:4px;padding:0 4px;}
        .dec-foot{text-align:center;margin-top:13px;}
        .dec-foot a{font-family:${MONO};font-size:11px;letter-spacing:.06em;text-transform:uppercase;font-weight:500;color:#0e1d40;text-decoration:none;border-bottom:1px solid rgba(14,29,64,0.5);padding-bottom:1px;}
        @media(max-width:440px){.dec-grid{grid-template-columns:1fr;}}
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
      <p className="dec-eyebrow">Keep playing — by category</p>
      <div className="dec-grid">
        {order.map((catKey) => (
          <CategoryCol key={catKey} catKey={catKey} selfKey={self} isSelf={catKey === selfCat} />
        ))}
      </div>
      <div className="dec-foot"><a href="/daily">All daily games &amp; archive →</a></div>
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
