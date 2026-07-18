'use client';
import React, { useEffect, useMemo, useState } from 'react';

// Unified daily leaderboard (2026-07-16). Replaces the single-game
// <QuizLeaderboard daily/> on every daily-game page. One "Overall" tab ranks
// players by their best-5-of-10 daily total (0..75); one tab per game shows that
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

const GAME_NAMES = {
  crux: 'Crux', emcee: 'Emcee', garble: 'Garble', links: 'Links', span: 'Span', dating: 'Dating',
  tally: 'Tally', suds: 'Suds', circa: 'Circa', extra: 'Extra', carve: 'Carve', stet: 'Stet', outwit: 'Outwit',
  tuck: 'Tuck', alibi: 'Alibi', cipher: 'Cipher',
};
// Per-game accent for the game-board title. Light = the games' own (darker)
// colors; navy = lightened for legibility on the dark card.
const ACCENTS_LIGHT = { crux: '#0e1d40', emcee: '#c026d3', garble: '#8a6d1a', links: '#166534', span: '#9d174d', dating: '#6d28d9', tally: '#15803d', suds: '#ea580c', circa: '#0e7490', extra: '#b91c1c', carve: '#7c3aed', stet: '#0369a1', outwit: '#1f2937', tuck: '#92400e', alibi: '#8b1e2d', cipher: '#0f766e' };
const ACCENTS_NAVY = { crux: '#5b9bff', emcee: '#e879f9', garble: '#f0c95a', links: '#4ca878', span: '#e06aa0', dating: '#a483f0', tally: '#4cb377', suds: '#f0894c', circa: '#38b6cf', extra: '#e06a6a', carve: '#a483f0', stet: '#41b1e8', outwit: '#c3cfe3', tuck: '#e0a568', alibi: '#ef8896', cipher: '#3fc9b8' };

function theme(light) {
  if (light) return {
    light: true,
    card: '#fff', cardBorder: 'rgba(20,22,28,0.12)', boxShadow: 'none',
    label: '#6b7280', labelWeight: 700, sub: '#9aa0ab',
    line: 'rgba(20,22,28,0.09)',
    row: '#fff', topRow: '#fff', topBorder: 'rgba(20,22,28,0.09)',
    meRow: '#eef3ff', meBorder: '#cddffb',
    rankTop: '#0e1d40', rankOther: '#6b7280',
    name: '#1c1e24', nameDot: '#6b728088', you: '#6b7280',
    dim: '#6b7280', total: '#1c1e24', unit: '#9aa0ab',
    tabOnText: '#fff', tabOffBg: '#fff', tabOffText: '#6b7280',
    expandColor: '#0e1d40', expandBorder: '#cddffb',
    note: '#9aa0ab', empty: '#6b7280',
    skeleton: 'linear-gradient(90deg,#f2f4f7,#f8fafc,#f2f4f7)',
    scrollThumb: 'rgba(20,22,28,0.18)',
    accents: ACCENTS_LIGHT, overallAccent: '#0e1d40',
  };
  return {
    light: false,
    card: 'linear-gradient(165deg,#16294f,#0c1a34)', cardBorder: 'rgba(232,180,58,0.28)', boxShadow: '0 10px 30px rgba(10,18,38,0.25)',
    label: '#e8b43a', labelWeight: 800, sub: '#93a7cc',
    line: 'rgba(255,255,255,0.09)',
    row: 'rgba(255,255,255,0.045)', topRow: 'rgba(232,180,58,0.08)', topBorder: 'rgba(232,180,58,0.22)',
    meRow: 'rgba(232,180,58,0.16)', meBorder: 'rgba(232,180,58,0.55)',
    rankTop: '#f5d878', rankOther: '#93a7cc',
    name: '#eaf0fb', nameDot: '#93a7cc88', you: '#e8b43a',
    dim: '#93a7cc', total: '#f5d878', unit: '#6a80a8',
    tabOnText: '#10203f', tabOffBg: 'transparent', tabOffText: '#93a7cc',
    expandColor: '#f5d878', expandBorder: 'rgba(232,180,58,0.45)',
    note: '#6a80a8', empty: '#93a7cc',
    skeleton: 'linear-gradient(90deg,rgba(255,255,255,0.03),rgba(255,255,255,0.08),rgba(255,255,255,0.03))',
    scrollThumb: 'rgba(255,255,255,0.18)',
    accents: ACCENTS_NAVY, overallAccent: '#e8b43a',
  };
}
// Active-tab fill: navy = uniform gold; light = the game's own accent (blue for Overall).
function tabAccent(th, key) { return th.light ? (key === 'overall' ? th.overallAccent : th.accents[key] || '#0e1d40') : th.overallAccent; }

function fmtTime(sec) { if (sec == null) return '—'; const m = Math.floor(sec / 60), s = sec % 60; return `${m}:${String(s).padStart(2, '0')}`; }
function fmtPts(n) { const v = Math.round(Number(n) * 10) / 10; return Number.isInteger(v) ? String(v) : v.toFixed(1); }

export default function DailyCombinedLeaderboard({ todayKey = null, identity = null, compact = false, quizId = null, light = false }) {
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading'); // loading | ok | error
  const [tab, setTab] = useState('overall');
  const [expanded, setExpanded] = useState(!compact);
  const th = useMemo(() => theme(light), [light]);

  useEffect(() => {
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    const qs = new URLSearchParams();
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
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

  const tabs = useMemo(() => {
    const list = [{ key: 'overall', name: 'Overall' }];
    const games = (data && data.games) || [];
    const ordered = games.slice().sort((a, b) => (a.key === todayKey ? -1 : 0) - (b.key === todayKey ? -1 : 0));
    for (const g of ordered) list.push({ key: g.key, name: GAME_NAMES[g.key] || g.key });
    return list;
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

  const wrap = { fontFamily: FONT, background: th.card, border: `1px solid ${th.cardBorder}`, borderRadius: 16, padding: '18px 18px 16px', boxShadow: th.boxShadow };
  const subtitle = (data && gameCount)
    ? (gameCount > 1 ? `Best ${bestN} of ${gameCount} · ${maxTotal} pts max` : `${maxTotal} pts max`)
    : 'Best 5 of 10';
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
        return (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex: '0 0 auto', padding: '7px 14px', borderRadius: 999, cursor: 'pointer', fontFamily: FONT, fontSize: 12.5, fontWeight: 800, letterSpacing: '0.01em', whiteSpace: 'nowrap',
              background: on ? acc : th.tabOffBg, color: on ? th.tabOnText : th.tabOffText, border: `1.5px solid ${on ? acc : th.line}` }}>
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

  return (
    <div style={wrap}>{chrome}
      {header}
      {tabBar}
      {active === 'overall'
        ? <OverallBoard data={data} myKey={myKey} maxTotal={maxTotal} gameCount={gc} th={th} />
        : <GameBoard game={(data.games || []).find((g) => g.key === active)} myKey={myKey} gameMax={gameMax} th={th} />}
      <p style={{ fontSize: 11, color: th.note, marginTop: 12, lineHeight: 1.5 }}>
        Each game is worth 15: up to 5 for how much you got right, up to 10 for where you placed against that day's field. {totalLine}
      </p>
      {compact ? linkBtn('Show less', () => { setExpanded(false); setTab('overall'); }) : null}
    </div>
  );
}

function rowStyle(th, mine, rank) {
  const bg = mine ? th.meRow : (rank <= 3 ? th.topRow : th.row);
  const bd = mine ? th.meBorder : (rank <= 3 ? th.topBorder : th.line);
  return { background: bg, border: `1px solid ${bd}` };
}

function RankNum({ n, th }) {
  return <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 17, color: n <= 3 ? th.rankTop : th.rankOther, fontVariantNumeric: 'tabular-nums' }}>{n}</span>;
}

function PlayerName({ row, mine, th }) {
  const label = row.username;
  return (
    <span style={{ minWidth: 0, fontFamily: FONT, fontSize: 16, fontWeight: 500, color: th.name, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
    <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, textAlign: 'right', color: th.total, fontVariantNumeric: 'tabular-nums' }}>{fmtPts(v)}<span style={{ fontSize: 11, fontWeight: 600, color: th.unit }}>/{maxTotal}</span></span>
  );
  return (
    <div>
      <div style={{ ...grid, padding: '0 14px 8px', fontFamily: FONT, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: th.dim }}>
        <span>#</span><span>Player</span><span style={{ textAlign: 'right' }}>Games</span><span style={{ textAlign: 'right' }}>Total</span>
      </div>
      {rows.map((r) => {
        const mine = myKey && r.userKey === myKey;
        return (
          <div key={r.userKey} style={{ ...grid, ...rowStyle(th, mine, r.rank), alignItems: 'center', padding: '10px 14px', marginBottom: 6, borderRadius: 11 }}>
            <RankNum n={r.rank} th={th} />
            <PlayerName row={r} mine={mine} th={th} />
            <span style={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 600, textAlign: 'right', color: th.dim, fontVariantNumeric: 'tabular-nums' }}>{r.gamesPlayed}/{gameCount}</span>
            {totalCell(r.total)}
          </div>
        );
      })}
      {showMe && myKey && data.me && !meShown ? (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${th.line}` }}>
          <div style={{ ...grid, ...rowStyle(th, true, data.me.rank), alignItems: 'center', padding: '10px 14px', borderRadius: 11 }}>
            <RankNum n={data.me.rank} th={th} />
            <PlayerName row={data.me} mine th={th} />
            <span style={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 600, textAlign: 'right', color: th.dim, fontVariantNumeric: 'tabular-nums' }}>{data.me.gamesPlayed}/{gameCount}</span>
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
          <div key={r.userKey} className="dclb-g" style={{ display: 'grid', gap: 8, ...rowStyle(th, mine, r.rank), alignItems: 'center', padding: '10px 14px', marginBottom: 6, borderRadius: 11 }}>
            <RankNum n={r.rank} th={th} />
            <PlayerName row={r} mine={mine} th={th} />
            <span style={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 600, textAlign: 'right', color: th.dim, fontVariantNumeric: 'tabular-nums' }}>{r.score}/{r.total}</span>
            <span className="dclb-time" style={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 600, textAlign: 'right', color: th.dim, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(r.timeElapsed)}</span>
            <span style={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 800, textAlign: 'right', color: th.total, fontVariantNumeric: 'tabular-nums' }}>{fmtPts(r.points)}<span style={{ fontSize: 10.5, fontWeight: 600, color: th.unit }}>/{gameMax}</span></span>
          </div>
        );
      })}
    </div>
  );
}
