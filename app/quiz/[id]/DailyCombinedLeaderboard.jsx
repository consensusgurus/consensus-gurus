'use client';
import React, { useEffect, useMemo, useState } from 'react';

// Unified daily leaderboard (2026-07-16). Replaces the single-game
// <QuizLeaderboard daily/> on every daily-game page. One "Overall" tab ranks
// players by their best-5-of-10 daily total (0..75); one tab per game shows that
// game's own board with the points it fed into the total (0..15 each).
//
// Self-contained: fetches /api/quiz/daily-combined itself using the identity the
// quiz client stores in localStorage, so it needs no board prop. Pass `todayKey`
// (the current game's key) to mark its tab; pass `identity` only as a fallback
// label for the "you" highlight (the endpoint's `me` block is authoritative).
//
// STYLE: a self-contained NAVY + GOLD card so it pops on the (light) game pages,
// the /daily archive, and the Stat Hub. Because it owns the card, it neutralizes
// the light `#daily-leaderboard` wrapper the daily clients still provide (scoped
// CSS below) so there is no white frame around the navy.

const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
// Navy/gold theme tokens.
const T = {
  card: 'linear-gradient(165deg,#16294f,#0c1a34)',
  cardBorder: 'rgba(232,180,58,0.28)',
  gold: '#e8b43a', goldL: '#f5d878',
  light: '#eaf0fb', slate: '#93a7cc', dim: '#6a80a8',
  line: 'rgba(255,255,255,0.09)',
  row: 'rgba(255,255,255,0.045)',
  topRow: 'rgba(232,180,58,0.08)', topBorder: 'rgba(232,180,58,0.22)',
  meRow: 'rgba(232,180,58,0.16)', meBorder: 'rgba(232,180,58,0.55)',
};

// Name per game key. Accents are lightened for legibility on navy (used only for
// the per-game board title; tabs are uniform gold).
const GAME_META = {
  crux: { name: 'Crux', accent: '#5b9bff' },
  garble: { name: 'Garble', accent: '#f0c95a' },
  links: { name: 'Links', accent: '#4ca878' },
  span: { name: 'Span', accent: '#e06aa0' },
  dating: { name: 'Dating', accent: '#a483f0' },
  tally: { name: 'Tally', accent: '#4cb377' },
  suds: { name: 'Suds', accent: '#f0894c' },
  circa: { name: 'Circa', accent: '#38b6cf' },
  extra: { name: 'Extra', accent: '#e06a6a' },
  carve: { name: 'Carve', accent: '#a483f0' },
};

function fmtTime(sec) { if (sec == null) return '—'; const m = Math.floor(sec / 60), s = sec % 60; return `${m}:${String(s).padStart(2, '0')}`; }
function fmtPts(n) { const v = Math.round(Number(n) * 10) / 10; return Number.isInteger(v) ? String(v) : v.toFixed(1); }

// Injected once per mount: navy scrollbar for the tab scroller, and a reset for
// the daily clients' light `#daily-leaderboard` wrapper so the navy card is the
// only card (no white frame). Harmless where that id isn't present (archive/hub).
const CHROME = (
  <style>{`
    .dclb-tabs::-webkit-scrollbar{height:6px;}
    .dclb-tabs::-webkit-scrollbar-track{background:transparent;}
    .dclb-tabs::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.18);border-radius:999px;}
    #daily-leaderboard{background:transparent !important;border:none !important;padding:0 !important;box-shadow:none !important;}
  `}</style>
);

export default function DailyCombinedLeaderboard({ todayKey = null, identity = null, compact = false, quizId = null }) {
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading'); // loading | ok | error
  const [tab, setTab] = useState('overall');
  // On the /daily archive we start collapsed to the overall top 3; everywhere
  // else the full tabbed board is shown outright.
  const [expanded, setExpanded] = useState(!compact);

  useEffect(() => {
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    const qs = new URLSearchParams();
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    // Scope the board to the puzzle being viewed. Absent (the /daily archive) the
    // endpoint defaults to today. An archived puzzle shows THAT day's slate.
    if (quizId) qs.set('quizId', quizId);
    let alive = true;
    setState('loading'); setData(null);
    fetch('/api/quiz/daily-combined?' + qs.toString())
      .then((r) => r.json())
      .then((d) => { if (!alive) return; if (d && Array.isArray(d.overall)) { setData(d); setState('ok'); } else { setState('error'); } })
      .catch(() => { if (alive) setState('error'); });
    return () => { alive = false; };
  }, [quizId]);

  const myKey = data && data.me ? data.me.userKey : null;
  const maxTotal = (data && data.maxTotal) || 75;
  const gameMax = (data && data.gameMax) || 15;
  const gameCount = data ? (data.gameCount != null ? data.gameCount : (data.games || []).length) : null;
  const bestN = data && data.bestN != null ? data.bestN : null;

  // Tabs: Overall first, then every game that has a live puzzle today, current
  // game surfaced right after Overall so its tab is easy to find.
  const tabs = useMemo(() => {
    const list = [{ key: 'overall', name: 'Overall' }];
    const games = (data && data.games) || [];
    const ordered = games.slice().sort((a, b) => (a.key === todayKey ? -1 : 0) - (b.key === todayKey ? -1 : 0));
    for (const g of ordered) list.push({ key: g.key, name: (GAME_META[g.key] || {}).name || g.key });
    return list;
  }, [data, todayKey]);

  const wrap = { fontFamily: FONT, background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: '18px 18px 16px', boxShadow: '0 10px 30px rgba(10,18,38,0.25)' };
  // "Best N of M · P pts max" — scales to the day's game count (older days ran
  // fewer games). When only one game ran that day there's nothing to pick, so we
  // just show the ceiling.
  const subtitle = (data && gameCount)
    ? (gameCount > 1 ? `Best ${bestN} of ${gameCount} · ${maxTotal} pts max` : `${maxTotal} pts max`)
    : 'Best 5 of 10';
  const header = (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 13, gap: 10 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.gold, fontWeight: 800 }}>Daily Leaderboard</div>
      <div style={{ fontSize: 11, letterSpacing: '0.04em', color: T.slate, fontWeight: 600 }}>{subtitle}</div>
    </div>
  );

  if (state === 'loading') {
    return (
      <div style={wrap}>{CHROME}{header}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ height: 46, borderRadius: 11, background: 'linear-gradient(90deg,rgba(255,255,255,0.03),rgba(255,255,255,0.08),rgba(255,255,255,0.03))', border: `1px solid ${T.line}` }} />)}
        </div>
      </div>
    );
  }
  if (state === 'error' || !data) {
    return <div style={wrap}>{CHROME}{header}<p style={{ fontStyle: 'italic', fontSize: 15, color: T.slate }}>Couldn't load the daily leaderboard just now.</p></div>;
  }

  const active = tab;
  const tabBar = (
    <div className="dclb-tabs" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 14, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.22) transparent' }}>
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex: '0 0 auto', padding: '7px 14px', borderRadius: 999, cursor: 'pointer', fontFamily: FONT, fontSize: 12.5, fontWeight: 800, letterSpacing: '0.01em', whiteSpace: 'nowrap',
              background: on ? T.gold : 'transparent', color: on ? '#10203f' : T.slate, border: `1.5px solid ${on ? T.gold : T.line}` }}>
            {t.name}{t.key === todayKey ? ' •' : ''}
          </button>
        );
      })}
    </div>
  );

  const linkBtn = (label, onClick) => (
    <button onClick={onClick}
      style={{ width: '100%', marginTop: 10, padding: '9px 12px', borderRadius: 10, cursor: 'pointer', fontFamily: FONT, fontSize: 12.5, fontWeight: 800, color: T.goldL, background: 'transparent', border: '1.5px solid rgba(232,180,58,0.45)' }}>
      {label}
    </button>
  );

  const gc = gameCount || 0;
  const gameWord = gc === 1 ? 'game' : 'games';
  const totalLine = gc > 1
    ? `Your daily total is your best ${bestN} of the day's ${gc} games.`
    : 'One game ran this day, so your daily total is just that game.';

  // Collapsed (archive) view: overall top 3, expandable to the full tabbed board.
  if (compact && !expanded) {
    return (
      <div style={wrap}>{CHROME}
        {header}
        <OverallBoard data={data} myKey={myKey} maxTotal={maxTotal} gameCount={gc} limit={3} showMe={false} />
        {linkBtn(`Show all ${gc} ${gameWord} & full standings`, () => setExpanded(true))}
      </div>
    );
  }

  return (
    <div style={wrap}>{CHROME}
      {header}
      {tabBar}
      {active === 'overall'
        ? <OverallBoard data={data} myKey={myKey} maxTotal={maxTotal} gameCount={gc} />
        : <GameBoard game={(data.games || []).find((g) => g.key === active)} myKey={myKey} gameMax={gameMax} />}
      <p style={{ fontSize: 11, color: T.dim, marginTop: 12, lineHeight: 1.5 }}>
        Each game is worth 15: up to 5 for how much you got right, up to 10 for where you placed against that day's field. {totalLine}
      </p>
      {compact ? linkBtn('Show less', () => { setExpanded(false); setTab('overall'); }) : null}
    </div>
  );
}

function rowStyle(mine, rank) {
  const bg = mine ? T.meRow : (rank <= 3 ? T.topRow : T.row);
  const bd = mine ? T.meBorder : (rank <= 3 ? T.topBorder : T.line);
  return { background: bg, border: `1px solid ${bd}` };
}

function RankNum({ n }) {
  return <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 17, color: n <= 3 ? T.goldL : T.slate, fontVariantNumeric: 'tabular-nums' }}>{n}</span>;
}

function PlayerName({ row, mine }) {
  const label = row.username;
  return (
    <span style={{ minWidth: 0, fontFamily: FONT, fontSize: 16, fontWeight: 500, color: T.light, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {row.userKey ? <a href={`/quizzes/hub?player=${encodeURIComponent(row.userKey)}`} style={{ color: 'inherit', textDecoration: 'none', borderBottom: `1px dotted ${T.slate}88` }}>{label}</a> : label}
      {mine ? <span style={{ color: T.gold, fontWeight: 700 }}> (you)</span> : ''}
    </span>
  );
}

function OverallBoard({ data, myKey, maxTotal, gameCount = 10, limit = 10, showMe = true }) {
  const rows = (data.overall || []).slice(0, limit); // the viewer's own row is appended below if lower
  const grid = { display: 'grid', gridTemplateColumns: '40px 1fr 66px 72px', gap: 8 };
  const meShown = myKey && rows.some((r) => r.userKey === myKey);
  if (!rows.length) {
    return <p style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 15, color: T.slate }}>No one has posted a daily score yet. Be the first.</p>;
  }
  const totalCell = (v) => (
    <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, textAlign: 'right', color: T.goldL, fontVariantNumeric: 'tabular-nums' }}>{fmtPts(v)}<span style={{ fontSize: 11, fontWeight: 600, color: T.dim }}>/{maxTotal}</span></span>
  );
  return (
    <div>
      <div style={{ ...grid, padding: '0 14px 8px', fontFamily: FONT, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.dim }}>
        <span>#</span><span>Player</span><span style={{ textAlign: 'right' }}>Games</span><span style={{ textAlign: 'right' }}>Total</span>
      </div>
      {rows.map((r) => {
        const mine = myKey && r.userKey === myKey;
        return (
          <div key={r.userKey} style={{ ...grid, ...rowStyle(mine, r.rank), alignItems: 'center', padding: '10px 14px', marginBottom: 6, borderRadius: 11 }}>
            <RankNum n={r.rank} />
            <PlayerName row={r} mine={mine} />
            <span style={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 600, textAlign: 'right', color: T.slate, fontVariantNumeric: 'tabular-nums' }}>{r.gamesPlayed}/{gameCount}</span>
            {totalCell(r.total)}
          </div>
        );
      })}
      {showMe && myKey && data.me && !meShown ? (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${T.line}` }}>
          <div style={{ ...grid, ...rowStyle(true, data.me.rank), alignItems: 'center', padding: '10px 14px', borderRadius: 11 }}>
            <RankNum n={data.me.rank} />
            <PlayerName row={data.me} mine />
            <span style={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 600, textAlign: 'right', color: T.slate, fontVariantNumeric: 'tabular-nums' }}>{data.me.gamesPlayed}/{gameCount}</span>
            {totalCell(data.me.total)}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GameBoard({ game, myKey, gameMax }) {
  if (!game) return <p style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 15, color: T.slate }}>No board for this game today.</p>;
  const rows = game.board || [];
  const gridSm = '34px 1fr 54px 60px';
  if (!rows.length) {
    return <p style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 15, color: T.slate }}>No one has posted a score here yet. Be the first.</p>;
  }
  return (
    <div>
      <style>{`.dclb-g{grid-template-columns:40px 1fr 60px 58px 66px;}@media(max-width:520px){.dclb-g{grid-template-columns:${gridSm};}.dclb-time{display:none;}}`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <a href={game.href || `/${game.key}`} style={{ fontFamily: FONT, fontSize: 12, fontWeight: 800, color: (GAME_META[game.key] || {}).accent || T.goldL, textDecoration: 'none' }}>{(GAME_META[game.key] || {}).name || game.key} <span style={{ fontWeight: 700, opacity: 0.85 }}>&rarr;</span></a>
        <div style={{ fontFamily: FONT, fontSize: 11, color: T.slate }}>{(game.plays != null ? game.plays : game.field).toLocaleString()} {game.plays === 1 ? 'play' : 'plays'}</div>
      </div>
      <div className="dclb-g" style={{ display: 'grid', gap: 8, padding: '0 14px 8px', fontFamily: FONT, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.dim }}>
        <span>#</span><span>Player</span><span style={{ textAlign: 'right' }}>Score</span><span className="dclb-time" style={{ textAlign: 'right' }}>Time</span><span style={{ textAlign: 'right' }}>Pts</span>
      </div>
      {rows.map((r) => {
        const mine = myKey && r.userKey === myKey;
        return (
          <div key={r.userKey} className="dclb-g" style={{ display: 'grid', gap: 8, ...rowStyle(mine, r.rank), alignItems: 'center', padding: '10px 14px', marginBottom: 6, borderRadius: 11 }}>
            <RankNum n={r.rank} />
            <PlayerName row={r} mine={mine} />
            <span style={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 600, textAlign: 'right', color: T.slate, fontVariantNumeric: 'tabular-nums' }}>{r.score}/{r.total}</span>
            <span className="dclb-time" style={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 600, textAlign: 'right', color: T.slate, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(r.timeElapsed)}</span>
            <span style={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 800, textAlign: 'right', color: T.goldL, fontVariantNumeric: 'tabular-nums' }}>{fmtPts(r.points)}<span style={{ fontSize: 10.5, fontWeight: 600, color: T.dim }}>/{gameMax}</span></span>
          </div>
        );
      })}
    </div>
  );
}
