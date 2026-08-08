'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { DAILY_GAME_MAP } from '@/lib/daily-games';
import { T } from '@/lib/theme';

// Unified daily leaderboard (2026-07-16). Replaces the single-game
// <QuizLeaderboard daily/> on every daily-game page. One "Overall" tab ranks
// players by their best-10 daily total (0..150); one tab per game shows that
// game's own board with the points it fed into the total (0..15 each).
//
// Self-contained: fetches /api/quiz/daily-combined itself using the identity the
// quiz client stores in localStorage. Props: `todayKey` (mark current game's
// tab), `identity` (fallback label), `compact` (collapsed top-3 + expander),
// `quizId` (scopes the fetch to a puzzle/date), and `light` (theme — see below).
//
// THEME: default is a NAVY + GOLD card (daily game pages + /daily archive), which
// owns its card and resets the light `#daily-leaderboard` wrapper the daily
// clients provide. Pass `light` for the white/blue/grey/black look (the Stat Hub,
// where navy clashes with the surrounding light cards).

const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
// gold / silver / bronze for the top-3 podium highlight (light theme)
const MEDAL = [T.gold, '#a9b0bd', '#c8814b'];
const MEDAL_BG = ['#fdf8ec', '#f4f5f7', '#f8f1e9'];
const MEDAL_BD = ['#f0e2ba', '#e3e5ea', '#e8d6c2'];

const GAME_NAMES = Object.fromEntries(Object.values(DAILY_GAME_MAP).map((g) => [g.key, g.name]));
// Per-game accent for the game-board title. Light = the games' own (darker)
// colors; navy = lightened for legibility on the dark card.
const ACCENTS_LIGHT = Object.fromEntries(Object.values(DAILY_GAME_MAP).map((g) => [g.key, g.color]));
const ACCENTS_NAVY = Object.fromEntries(Object.values(DAILY_GAME_MAP).map((g) => [g.key, g.colorNavy]));

function theme(light) {
  if (light) return {
    light: true,
    card: T.white, cardBorder: 'rgba(20,22,28,0.12)', boxShadow: 'none',
    label: T.muted, labelWeight: 700, sub: T.muted,
    line: 'rgba(20,22,28,0.30)',
    row: T.white, topRow: T.white, topBorder: 'rgba(20,22,28,0.30)',
    meRow: T.accentSoft, meBorder: T.accentBorder,
    rankTop: T.accent, rankOther: T.muted,
    name: T.ink, nameDot: '#262b3588', you: T.muted,
    dim: T.muted, total: T.ink, unit: T.muted,
    tabOnText: T.white, tabOffBg: T.white, tabOffText: T.muted,
    expandColor: T.accent, expandBorder: T.accentBorder,
    note: T.muted, empty: T.muted,
    skeleton: 'linear-gradient(90deg,#f2f4f7,#f8fafc,#f2f4f7)',
    scrollThumb: 'rgba(20,22,28,0.18)',
    accents: ACCENTS_LIGHT, overallAccent: T.accent,
  };
  return {
    light: false,
    card: 'linear-gradient(165deg,#16294f,#0c1a34)', cardBorder: 'rgba(232,180,58,0.28)', boxShadow: '0 10px 30px rgba(10,18,38,0.25)',
    label: T.gold, labelWeight: 800, sub: '#93a7cc',
    line: 'rgba(255,255,255,0.09)',
    row: 'rgba(255,255,255,0.045)', topRow: 'rgba(232,180,58,0.08)', topBorder: 'rgba(232,180,58,0.22)',
    meRow: 'rgba(232,180,58,0.16)', meBorder: 'rgba(232,180,58,0.55)',
    rankTop: '#f5d878', rankOther: '#93a7cc',
    name: '#eaf0fb', nameDot: '#93a7cc88', you: T.gold,
    dim: '#93a7cc', total: '#f5d878', unit: '#6a80a8',
    tabOnText: '#10203f', tabOffBg: 'transparent', tabOffText: '#93a7cc',
    expandColor: '#f5d878', expandBorder: 'rgba(232,180,58,0.45)',
    note: '#6a80a8', empty: '#93a7cc',
    skeleton: 'linear-gradient(90deg,rgba(255,255,255,0.03),rgba(255,255,255,0.08),rgba(255,255,255,0.03))',
    scrollThumb: 'rgba(255,255,255,0.18)',
    accents: ACCENTS_NAVY, overallAccent: T.gold,
  };
}
// Active-tab fill: navy = uniform gold; light = the game's own accent (blue for Overall).
function tabAccent(th, key) { return th.light ? (key === 'overall' ? th.overallAccent : th.accents[key] || T.accent) : th.overallAccent; }

function fmtTime(sec) { if (sec == null) return '—'; const m = Math.floor(sec / 60), s = sec % 60; return `${m}:${String(s).padStart(2, '0')}`; }
function fmtPts(n) { const v = Math.round(Number(n) * 10) / 10; return Number.isInteger(v) ? String(v) : v.toFixed(1); }

export default function DailyCombinedLeaderboard({ todayKey = null, identity = null, compact = false, quizId = null, light = false, allTimeToggle = false, embedded = false, initialTab = null, dense = false }) {
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading'); // loading | ok | error
  const [tab, setTab] = useState(initialTab || todayKey || 'overall');
  const [expanded, setExpanded] = useState(!compact);
  // Per-game "Today vs All-time" scope (only when allTimeToggle is on). The
  // Overall/combined board has no all-time dimension, so it always reads today.
  const [gameScope, setGameScope] = useState('today'); // 'today' | 'alltime'
  const [allTimeCache, setAllTimeCache] = useState({}); // gameKey -> { board, field } | 'loading'
  const th = useMemo(() => ({ ...theme(light), dense }), [light, dense]);

  useEffect(() => {
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    const qs = new URLSearchParams();
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    if (quizId) qs.set('quizId', quizId);
    let alive = true;
    // Live board: standings and point awards shift through the day as new
    // players post, so after the first load we silently re-poll (and refresh on
    // tab focus) instead of freezing on the mount snapshot.
    const load = (silent, fresh) => {
      if (!silent) { setState('loading'); setData(null); }
      const p = new URLSearchParams(qs);
      if (fresh) { p.set('fresh', '1'); p.set('_', String(Date.now())); }
      fetch('/api/quiz/daily-combined?' + p.toString(), { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => { if (!alive) return; if (d && Array.isArray(d.overall)) { setData(d); setState('ok'); } else { setState((s) => (s === 'ok' ? 'ok' : 'error')); } })
        .catch(() => { if (alive) setState((s) => (s === 'ok' ? 'ok' : 'error')); });
    };
    load(false);
    const iv = setInterval(() => { if (typeof document === 'undefined' || document.visibilityState === 'visible') load(true); }, 45000);
    const onVis = () => { if (typeof document !== 'undefined' && document.visibilityState === 'visible') load(true); };
    // A daily game just finished on this page: the end card confirms the moment
    // the player's row has actually landed and dispatches this event. Reload the
    // board fresh (cache-bypassed) so the new row shows at once, instead of
    // waiting up to 45s for the next poll and risking the edge cache.
    const onUpdated = () => { if (alive) load(true, true); };
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVis);
    if (typeof window !== 'undefined') { window.addEventListener('focus', onVis); window.addEventListener('sot:daily-updated', onUpdated); }
    return () => { alive = false; clearInterval(iv); if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVis); if (typeof window !== 'undefined') { window.removeEventListener('focus', onVis); window.removeEventListener('sot:daily-updated', onUpdated); } };
  }, [quizId]);

  // Switching to a different tab always returns to that game's Today board; the
  // player opts back into All-time per game.
  useEffect(() => { setGameScope('today'); }, [tab]);

  // All-time per game (opt-in via allTimeToggle): the game's OWN cumulative board
  // across every drop, from /api/quiz/daily-game. Fetched lazily the first time a
  // game is viewed all-time, then cached for the session.
  // NOTE: allTimeCache is intentionally NOT a dependency. Setting it to 'loading'
  // would otherwise re-run this effect, whose cleanup flips the in-flight fetch's
  // `alive` to false and drops the result — leaving the board stuck on skeleton.
  // A ref tracks which keys are already fetching so we never double-fetch.
  const atFetchedRef = React.useRef({});
  useEffect(() => {
    if (!allTimeToggle || tab === 'overall' || gameScope !== 'alltime') return undefined;
    const key = tab;
    if (atFetchedRef.current[key]) return undefined; // already fetching or fetched
    atFetchedRef.current[key] = true;
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    const p = new URLSearchParams({ game: key, fresh: '1' });
    if (anonId) p.set('anonId', anonId);
    if (email) p.set('email', email);
    let alive = true;
    setAllTimeCache((c) => ({ ...c, [key]: 'loading' }));
    fetch('/api/quiz/daily-game?' + p.toString(), { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (!alive) { delete atFetchedRef.current[key]; setAllTimeCache((c) => { if (c[key] === 'loading') { const n = { ...c }; delete n[key]; return n; } return c; }); return; } const at = d && d.allTime; setAllTimeCache((c) => ({ ...c, [key]: { board: (at && at.board) || [], field: (at && at.field) || 0 } })); })
      .catch(() => { if (alive) { delete atFetchedRef.current[key]; setAllTimeCache((c) => { const n = { ...c }; delete n[key]; return n; }); } });
    return () => { alive = false; };
  }, [allTimeToggle, tab, gameScope]);

  const myKey = data && data.me ? data.me.userKey : null;
  const maxTotal = (data && data.maxTotal) || 150;
  const gameMax = (data && data.gameMax) || 15;
  const gameCount = data ? (data.gameCount != null ? data.gameCount : (data.games || []).length) : null;
  const bestN = data && data.bestN != null ? data.bestN : null;

  // Tab order on a game page: the page's own game first (leftmost + default),
  // then Overall (the combined board), then every other game. Off a game page
  // (no todayKey, e.g. the Stat Hub) Overall stays first.
  const tabs = useMemo(() => {
    const games = (data && data.games) || [];
    const overallTab = { key: 'overall', name: 'Overall' };
    const gameTab = (g) => ({ key: g.key, name: GAME_NAMES[g.key] || g.key });
    if (!todayKey) return [overallTab, ...games.map(gameTab)];
    const mine = games.filter((g) => g.key === todayKey).map(gameTab);
    const rest = games.filter((g) => g.key !== todayKey).map(gameTab);
    // Even if the page's game has no board rows yet today, still show it first.
    if (!mine.length) mine.push({ key: todayKey, name: GAME_NAMES[todayKey] || todayKey });
    return [...mine, overallTab, ...rest];
  }, [data, todayKey]);

  // Scoped chrome: navy scrollbar for the tab scroller + a reset of the daily
  // clients' light `#daily-leaderboard` wrapper (navy owns the card). Harmless
  // where that id is absent (archive/hub).
  const chrome = (
    <style>{`
      .dclb-tabs::-webkit-scrollbar{height:6px;}
      .dclb-tabs::-webkit-scrollbar-track{background:transparent;}
      .dclb-tabs::-webkit-scrollbar-thumb{background:${th.scrollThumb};border-radius:999px;}
      ${th.light ? '' : '#daily-leaderboard{background:transparent !important;border:none !important;padding:0 !important;box-shadow:none !important;}'}
    `}</style>
  );

  const wrap = embedded
    ? { fontFamily: FONT, background: 'transparent', border: 'none', borderRadius: 0, padding: 0, boxShadow: 'none' }
    : { fontFamily: FONT, background: th.card, border: `1px solid ${th.cardBorder}`, borderRadius: 16, padding: '18px 18px 16px', boxShadow: th.boxShadow };
  const subtitle = (data && gameCount)
    ? (gameCount > 1 ? `Best ${bestN} of ${gameCount} · ${maxTotal} pts max` : `${maxTotal} pts max`)
    : 'Best 10';
  const header = (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 13, gap: 10 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: th.label, fontWeight: th.labelWeight }}>Daily Leaderboard</div>
      <div style={{ fontSize: 11, letterSpacing: '0.04em', color: th.sub, fontWeight: 600 }}>{subtitle}</div>
    </div>
  );

  if (state === 'loading') {
    return (
      <div style={wrap}>{chrome}{header}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ height: 46, borderRadius: 11, background: th.skeleton, border: `1px solid ${th.line}` }} />)}
        </div>
      </div>
    );
  }
  if (state === 'error' || !data) {
    return <div style={wrap}>{chrome}{header}<p style={{ fontStyle: 'italic', fontSize: 15, color: th.dim }}>Couldn't load the daily leaderboard just now.</p></div>;
  }

  const active = tab;
  const tabBar = (
    <div className="dclb-tabs" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 14, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin', scrollbarColor: `${th.scrollThumb} transparent` }}>
      {tabs.map((t) => {
        const on = t.key === active;
        const acc = tabAccent(th, t.key);
        // Overall (the combined board) is the anchor tab, so it always stands
        // out from the per-game tabs: when it isn't the active tab it keeps a
        // fatter accent-colored outline and accent text instead of the muted
        // off-tab look every other tab uses.
        const anchor = t.key === 'overall';
        const offBorder = anchor ? th.overallAccent : th.line;
        const offText = anchor ? th.overallAccent : th.tabOffText;
        const bw = on ? 1.5 : (anchor ? 2.5 : 1.5);
        return (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex: '0 0 auto', padding: '7px 14px', borderRadius: 999, cursor: 'pointer', fontFamily: FONT, fontSize: 12.5, fontWeight: anchor ? 900 : 800, letterSpacing: '0.01em', whiteSpace: 'nowrap',
              background: on ? acc : th.tabOffBg, color: on ? th.tabOnText : offText, border: `${bw}px solid ${on ? acc : offBorder}` }}>
            {t.name}{t.key === todayKey ? ' •' : ''}
          </button>
        );
      })}
    </div>
  );

  const linkBtn = (label, onClick) => (
    <button onClick={onClick}
      style={{ width: '100%', marginTop: 10, padding: '9px 12px', borderRadius: 10, cursor: 'pointer', fontFamily: FONT, fontSize: 12.5, fontWeight: 800, color: th.expandColor, background: 'transparent', border: `1.5px solid ${th.expandBorder}` }}>
      {label}
    </button>
  );

  const gc = gameCount || 0;
  const gameWord = gc === 1 ? 'game' : 'games';
  const totalLine = gc > 1
    ? `Your daily total is your best ${bestN} of the day's ${gc} games.`
    : 'One game ran this day, so your daily total is just that game.';

  if (compact && !expanded) {
    return (
      <div style={wrap}>{chrome}
        {header}
        <OverallBoard data={data} myKey={myKey} maxTotal={maxTotal} gameCount={gc} limit={3} showMe={false} th={th} />
        {linkBtn(`Show all ${gc} ${gameWord} & full standings`, () => setExpanded(true))}
      </div>
    );
  }

  const showScope = allTimeToggle && active !== 'overall';
  const scopeToggle = showScope ? (
    <div style={{ display: 'flex', gap: 4, marginBottom: 12, background: th.light ? '#f2f4f7' : 'rgba(255,255,255,0.06)', borderRadius: 999, padding: 3, width: 'fit-content' }}>
      {[['today', 'Today'], ['alltime', 'All-time']].map(([k, lbl]) => {
        const on = gameScope === k;
        return (
          <button key={k} onClick={() => setGameScope(k)}
            style={{ padding: '5px 14px', borderRadius: 999, cursor: 'pointer', fontFamily: FONT, fontSize: 11.5, fontWeight: 800, whiteSpace: 'nowrap', border: 'none',
              background: on ? (th.light ? T.white : 'rgba(255,255,255,0.16)') : 'transparent', color: on ? th.total : th.dim, boxShadow: on && th.light ? '0 1px 2px rgba(20,22,28,0.12)' : 'none' }}>
            {lbl}
          </button>
        );
      })}
    </div>
  ) : null;
  const activeGame = (data.games || []).find((g) => g.key === active);
  const gameView = active === 'overall'
    ? <OverallBoard data={data} myKey={myKey} maxTotal={maxTotal} gameCount={gc} th={th} />
    : (showScope && gameScope === 'alltime')
      ? <AllTimeBoard game={activeGame} entry={allTimeCache[active]} myKey={myKey} th={th} />
      : <GameBoard game={activeGame} myKey={myKey} gameMax={gameMax} th={th} />;

  return (
    <div style={wrap}>{chrome}
      {header}
      {tabBar}
      {scopeToggle}
      {gameView}
      <p style={{ fontSize: 11, color: th.note, marginTop: 12, lineHeight: 1.5 }}>
        Each game is worth 15: up to 5 for how much you got right, up to 10 for where you placed against that day's field. {totalLine} Points reflect results from unregistered users.
      </p>
      {compact ? linkBtn('Show less', () => { setExpanded(false); setTab(todayKey || 'overall'); }) : null}
    </div>
  );
}

function rowStyle(th, mine, rank) {
  if (mine) return { background: th.meRow, border: `1px solid ${th.meBorder}` };
  // Podium: gold / silver / bronze tint for the top three (light theme).
  if (th.light && rank >= 1 && rank <= 3) return { background: MEDAL_BG[rank - 1], border: `1px solid ${MEDAL_BD[rank - 1]}` };
  const bg = rank <= 3 ? th.topRow : th.row;
  const bd = rank <= 3 ? th.topBorder : th.line;
  return { background: bg, border: `1px solid ${bd}` };
}

function RankNum({ n, th }) {
  const d = th.dense;
  // Top three get a filled gold/silver/bronze medal badge (light theme).
  if (th.light && n >= 1 && n <= 3) {
    const sz = d ? 19 : 23;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: sz, height: sz, borderRadius: '50%', background: MEDAL[n - 1], color: T.white, fontFamily: FONT, fontWeight: 900, fontSize: d ? 11 : 13, fontVariantNumeric: 'tabular-nums', boxShadow: '0 1px 2px rgba(20,22,28,0.18)' }}>{n}</span>
    );
  }
  return <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: d ? 14 : 17, color: n <= 3 ? th.rankTop : th.rankOther, fontVariantNumeric: 'tabular-nums' }}>{n}</span>;
}

function PlayerName({ row, mine, th }) {
  const label = row.username;
  return (
    <span style={{ minWidth: 0, fontFamily: FONT, fontSize: th.dense ? 13.5 : 16, fontWeight: 500, color: th.name, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {row.userKey ? <a href={`/quizzes/hub?player=${encodeURIComponent(row.userKey)}`} style={{ color: 'inherit', textDecoration: 'none', borderBottom: `1px dotted ${th.nameDot}` }}>{label}</a> : label}
      {mine ? <span style={{ color: th.you, fontWeight: 700 }}> (you)</span> : ''}
    </span>
  );
}

function OverallBoard({ data, myKey, maxTotal, gameCount = 10, limit = 10, showMe = true, th }) {
  const rows = (data.overall || []).slice(0, limit);
  const grid = { display: 'grid', gridTemplateColumns: '40px 1fr 66px 72px', gap: 8 };
  const meShown = myKey && rows.some((r) => r.userKey === myKey);
  if (!rows.length) {
    return <p style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 15, color: th.empty }}>No one has posted a daily score yet. Be the first.</p>;
  }
  const totalCell = (v) => (
    <span style={{ fontFamily: FONT, fontSize: th.dense ? 13 : 15, fontWeight: 800, textAlign: 'right', color: th.total, fontVariantNumeric: 'tabular-nums' }}>{fmtPts(v)}<span style={{ fontSize: 11, fontWeight: 600, color: th.unit }}>/{maxTotal}</span></span>
  );
  return (
    <div>
      <div style={{ ...grid, padding: '0 14px 8px', fontFamily: FONT, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: th.dim }}>
        <span>#</span><span>Player</span><span style={{ textAlign: 'right' }}>Games</span><span style={{ textAlign: 'right' }}>Total</span>
      </div>
      {rows.map((r) => {
        const mine = myKey && r.userKey === myKey;
        return (
          <div key={r.userKey} style={{ ...grid, ...rowStyle(th, mine, r.rank), alignItems: 'center', padding: th.dense ? '7px 12px' : '10px 14px', marginBottom: th.dense ? 5 : 6, borderRadius: 10 }}>
            <RankNum n={r.rank} th={th} />
            <PlayerName row={r} mine={mine} th={th} />
            <span style={{ fontFamily: FONT, fontSize: th.dense ? 12 : 13.5, fontWeight: 600, textAlign: 'right', color: th.dim, fontVariantNumeric: 'tabular-nums' }}>{r.gamesPlayed}/{gameCount}</span>
            {totalCell(r.total)}
          </div>
        );
      })}
      {showMe && myKey && data.me && !meShown ? (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${th.line}` }}>
          <div style={{ ...grid, ...rowStyle(th, true, data.me.rank), alignItems: 'center', padding: th.dense ? '7px 12px' : '10px 14px', borderRadius: 10 }}>
            <RankNum n={data.me.rank} th={th} />
            <PlayerName row={data.me} mine th={th} />
            <span style={{ fontFamily: FONT, fontSize: th.dense ? 12 : 13.5, fontWeight: 600, textAlign: 'right', color: th.dim, fontVariantNumeric: 'tabular-nums' }}>{data.me.gamesPlayed}/{gameCount}</span>
            {totalCell(data.me.total)}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GameBoard({ game, myKey, gameMax, th }) {
  if (!game) return <p style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 15, color: th.empty }}>No board for this game today.</p>;
  const rows = game.board || [];
  const gridSm = '34px 1fr 54px 60px';
  const acc = th.accents[game.key] || th.total;
  const plays = (game.plays != null ? game.plays : game.field) || 0;
  // Header (game link + play count) shows in EVERY state, so a game whose only
  // plays today are guests still reports its play count instead of looking dead.
  const gameHeader = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
      <a href={game.href || `/${game.key}`} style={{ fontFamily: FONT, fontSize: 12, fontWeight: 800, color: acc, textDecoration: 'none' }}>{GAME_NAMES[game.key] || game.key} <span style={{ fontWeight: 700, opacity: 0.85 }}>&rarr;</span></a>
      <div style={{ fontFamily: FONT, fontSize: 11, color: th.dim }}>{plays.toLocaleString()} {plays === 1 ? 'play' : 'plays'}</div>
    </div>
  );
  if (!rows.length) {
    return (
      <div>
        {gameHeader}
        <p style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 15, color: th.empty }}>{plays > 0 ? 'No ranked scores here yet — sign in and play to claim the top spot.' : 'No one has posted a score here yet. Be the first.'}</p>
      </div>
    );
  }
  return (
    <div>
      <style>{`.dclb-g{grid-template-columns:40px 1fr 60px 58px 66px;}@media(max-width:520px){.dclb-g{grid-template-columns:${gridSm};}.dclb-time{display:none;}}`}</style>
      {gameHeader}
      <div className="dclb-g" style={{ display: 'grid', gap: 8, padding: '0 14px 8px', fontFamily: FONT, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: th.dim }}>
        <span>#</span><span>Player</span><span style={{ textAlign: 'right' }}>Score</span><span className="dclb-time" style={{ textAlign: 'right' }}>Time</span><span style={{ textAlign: 'right' }}>Pts</span>
      </div>
      {rows.map((r) => {
        const mine = myKey && r.userKey === myKey;
        return (
          <div key={r.userKey} className="dclb-g" style={{ display: 'grid', gap: 8, ...rowStyle(th, mine, r.rank), alignItems: 'center', padding: th.dense ? '7px 12px' : '10px 14px', marginBottom: th.dense ? 5 : 6, borderRadius: 10 }}>
            <RankNum n={r.rank} th={th} />
            <PlayerName row={r} mine={mine} th={th} />
            <span style={{ fontFamily: FONT, fontSize: th.dense ? 12 : 13.5, fontWeight: 600, textAlign: 'right', color: th.dim, fontVariantNumeric: 'tabular-nums' }}>{(DAILY_GAME_MAP[game.key] || {}).unit ? r.score : <>{r.score}/{r.total}</>}</span>
            <span className="dclb-time" style={{ fontFamily: FONT, fontSize: th.dense ? 12 : 13.5, fontWeight: 600, textAlign: 'right', color: th.dim, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(r.timeElapsed)}</span>
            <span style={{ fontFamily: FONT, fontSize: th.dense ? 12.5 : 14.5, fontWeight: 800, textAlign: 'right', color: th.total, fontVariantNumeric: 'tabular-nums' }}>{fmtPts(r.points)}<span style={{ fontSize: 10.5, fontWeight: 600, color: th.unit }}>/{gameMax}</span></span>
          </div>
        );
      })}
    </div>
  );
}

// The game's OWN cumulative all-time board: each registered player's per-drop
// points summed across every drop of this game to date (from /api/quiz/daily-game).
// Points are cumulative (no fixed max), so there is no /15 denominator or time.
function AllTimeBoard({ game, entry, myKey, th }) {
  const key = game ? game.key : null;
  const acc = (key && th.accents[key]) || th.total;
  const gameHeader = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
      <a href={(game && game.href) || `/${key || ''}`} style={{ fontFamily: FONT, fontSize: 12, fontWeight: 800, color: acc, textDecoration: 'none' }}>{(key && GAME_NAMES[key]) || key} <span style={{ fontWeight: 700, opacity: 0.85 }}>&rarr;</span></a>
      <div style={{ fontFamily: FONT, fontSize: 11, color: th.dim }}>All-time · cumulative points</div>
    </div>
  );
  if (entry === 'loading' || entry == null) {
    return <div>{gameHeader}<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[0, 1, 2].map((i) => <div key={i} style={{ height: 40, borderRadius: 11, background: th.skeleton, border: `1px solid ${th.line}` }} />)}</div></div>;
  }
  const rows = entry.board || [];
  if (!rows.length) {
    return <div>{gameHeader}<p style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 15, color: th.empty }}>No all-time scores here yet. Play a drop to get on the board.</p></div>;
  }
  const grid = { display: 'grid', gridTemplateColumns: '40px 1fr 84px', gap: 8 };
  return (
    <div>
      {gameHeader}
      <div style={{ ...grid, padding: '0 14px 8px', fontFamily: FONT, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: th.dim }}>
        <span>#</span><span>Player</span><span style={{ textAlign: 'right' }}>Points</span>
      </div>
      {rows.map((r) => {
        const mine = !!(r.isMe || (myKey && r.userKey === myKey));
        return (
          <div key={r.userKey || r.rank} style={{ ...grid, ...rowStyle(th, mine, r.rank), alignItems: 'center', padding: th.dense ? '7px 12px' : '10px 14px', marginBottom: th.dense ? 5 : 6, borderRadius: 10 }}>
            <RankNum n={r.rank} th={th} />
            <PlayerName row={r} mine={mine} th={th} />
            <span style={{ fontFamily: FONT, fontSize: th.dense ? 12.5 : 14.5, fontWeight: 800, textAlign: 'right', color: th.total, fontVariantNumeric: 'tabular-nums' }}>{fmtPts(r.points)}<span style={{ fontSize: 10.5, fontWeight: 600, color: th.unit }}> pts</span></span>
          </div>
        );
      })}
    </div>
  );
}
