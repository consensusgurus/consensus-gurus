'use client';

// Client for /daily. Reworked 2026-07-18 from a plain archive list into a daily-
// games LANDING PAGE (still archive-complete):
//   • a "your day" header — games played today, completed, and your live daily
//     rank/total (from /api/quiz/daily-combined);
//   • a "still to play today" rail of the games you haven't opened yet;
//   • every game grouped by type as a two-up CARD. Each card carries today's
//     puzzle (Play), its full date archive (chips, played ✓ / aced ★ marks read
//     from per-puzzle localStorage + server play history), and a Standings toggle
//     that expands that game's daily leaderboard — top 3 + your own row, with a
//     "full standings" expander and a This-game / Overall tab pair.
// Self-contained styling (its own <style>) so it matches the daily pages'
// navy-and-gold look without depending on any game CSS. Two fetches total for the
// whole page: daily-status (played/completed) and daily-combined (leaderboards +
// your standing), each already cached at the edge.

import React, { useState, useEffect, useMemo } from 'react';
import useDailyOrder, { sortByDailyOrder } from '../useDailyOrder';

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const INK = '#1c1e24';
const FADED = '#6b7280';
const BG = '#f7f8fa';
const NAVY = '#0e1d40';
const GOLD = '#e8b43a';
const GOLD_B = '#f5d878';
const GREEN = '#16a34a';
const SUN = '#b45309';
const SUN_BG = '#fff7ed';

// Games grouped by type for the landing layout. Every key here must exist in the
// /daily registry (page.js); order within a group is re-sorted by yesterday's
// popularity once useDailyOrder resolves.
const CATEGORIES = [
  { key: 'word', label: 'Word & Letters', keys: ['crux', 'emcee', 'garble', 'links', 'stet', 'tuck'] },
  { key: 'logic', label: 'Logic & Deduction', keys: ['span', 'dating', 'outwit', 'alibi'] },
  { key: 'number', label: 'Numbers & Grids', keys: ['tally', 'suds', 'carve', 'cipher'] },
  { key: 'trivia', label: 'Time & Trivia', keys: ['circa', 'extra'] },
];
// Each game's accent, lightened for legibility on the dark leaderboard card
// (mirrors ACCENTS_NAVY in DailyCombinedLeaderboard so a game reads the same
// across surfaces).
const NAVY_ACCENT = {
  crux: '#5b9bff', emcee: '#e879f9', garble: '#f0c95a', links: '#4ca878', span: '#e06aa0', dating: '#a483f0',
  tally: '#4cb377', suds: '#f0894c', circa: '#38b6cf', extra: '#e06a6a', carve: '#a483f0', stet: '#41b1e8',
  outwit: '#c3cfe3', tuck: '#e0a568', alibi: '#ef8896', cipher: '#3fc9b8',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Every localStorage key a game might have written for one puzzle. Crux keys a
// mid-day revision as _r<rev>, and a player may have finished EITHER the bare key
// (pre-revision) or the revised one — so check both.
function keysFor(gameKey, num, rev) {
  if (gameKey === 'crux') {
    const ks = [`sot_crux_${num}`];
    if (rev) ks.push(`sot_crux_${num}_r${rev}`);
    return ks;
  }
  return [`sot_${gameKey}_${num}`];
}

function shortDate(dateLabel) {
  return (dateLabel || '').replace(/,\s*\d{4}$/, '');
}
function fmtTime(sec) {
  if (sec == null) return '—';
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
function fmtPts(n) {
  const v = Math.round(Number(n) * 10) / 10;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}
// Deterministic on server + client (numeric Date construction → same weekday
// everywhere), so it can render during SSR without a hydration mismatch.
function dateHeadline(today) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(today || '');
  if (!m) return 'Today';
  const y = +m[1], mo = +m[2], d = +m[3];
  const wd = WEEKDAYS[new Date(y, mo - 1, d).getDay()];
  return `${wd}, ${MONTHS[mo - 1]} ${d}`;
}

export default function DailyArchiveClient({ games = [], today = '' }) {
  // played = you've opened/attempted it (any save exists); completed = you aced it
  // (score === total). Filled after mount — localStorage is client-only, so SSR
  // renders the neutral state and hydration matches.
  const [played, setPlayed] = useState(() => new Set());
  const [completed, setCompleted] = useState(() => new Set());
  const [ready, setReady] = useState(false);
  // Combined daily leaderboard payload (today's slate): per-game boards, overall,
  // and the viewer's own standing. One fetch drives every card's Standings panel.
  const [combined, setCombined] = useState(null);

  const dailyOrder = useDailyOrder();
  const gamesByKey = useMemo(() => {
    const m = {};
    for (const g of games) m[g.key] = g;
    return m;
  }, [games]);

  useEffect(() => {
    let alive = true;
    const pl = new Set();
    const cp = new Set();
    const byQuiz = {}; // quizId -> "gameKey:num", to fold server rows back in
    for (const g of games) {
      for (const p of g.puzzles) {
        if (p.quizId) byQuiz[p.quizId] = `${g.key}:${p.num}`;
        let hasSave = false, won = false;
        for (const k of keysFor(g.key, p.num, p.rev)) {
          let raw = null;
          try { raw = localStorage.getItem(k); } catch (e) {}
          if (!raw) continue;
          hasSave = true;
          try { if ((JSON.parse(raw) || {}).status === 'won') won = true; } catch (e) {}
        }
        if (hasSave) pl.add(`${g.key}:${p.num}`);
        if (won) cp.add(`${g.key}:${p.num}`);
      }
    }
    setPlayed(new Set(pl));
    setCompleted(new Set(cp));
    setReady(true);

    // localStorage only knows THIS browser. The server has every completed play by
    // identity, so a signed-in player's marks follow them across devices — merge
    // those in (union, never removing a local mark). Same identity drives the
    // combined leaderboard fetch below.
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    const qs = new URLSearchParams();
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    const q = qs.toString();

    fetch('/api/quiz/daily-status?' + q)
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d) return;
        const p2 = new Set(pl), c2 = new Set(cp);
        for (const qid of (d.played || [])) { const k = byQuiz[qid]; if (k) p2.add(k); }
        for (const qid of (d.completed || [])) { const k = byQuiz[qid]; if (k) c2.add(k); }
        setPlayed(p2);
        setCompleted(c2);
      })
      .catch(() => {});

    fetch('/api/quiz/daily-combined?' + q)
      .then((r) => r.json())
      .then((d) => { if (alive && d && Array.isArray(d.overall)) setCombined(d); })
      .catch(() => {});

    return () => { alive = false; };
  }, [games]);

  const myKey = combined && combined.me ? combined.me.userKey : null;
  const boardsByKey = useMemo(() => {
    const m = {};
    if (combined && Array.isArray(combined.games)) for (const g of combined.games) m[g.key] = g;
    return m;
  }, [combined]);

  // "Today" for each game is its newest live puzzle (puzzles are sorted num-desc
  // in page.js, so index 0). played/completed against that id gives today's marks.
  const todayNum = (g) => (g.puzzles[0] ? g.puzzles[0].num : null);
  const isPlayedToday = (g) => { const n = todayNum(g); return n != null && played.has(`${g.key}:${n}`); };
  const isDoneToday = (g) => { const n = todayNum(g); return n != null && completed.has(`${g.key}:${n}`); };

  const playedToday = games.filter(isPlayedToday);
  const doneToday = games.filter(isDoneToday);
  const stillToPlay = sortByDailyOrder(games.filter((g) => !isPlayedToday(g)), dailyOrder);

  // Ordered games per category (popularity within each group).
  const groups = CATEGORIES.map((cat) => {
    const gs = sortByDailyOrder(cat.keys.map((k) => gamesByKey[k]).filter(Boolean), dailyOrder);
    return { ...cat, games: gs };
  }).filter((grp) => grp.games.length);

  const me = combined && combined.me;

  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      <style>{`
        .dl-wrap{max-width:1080px;margin:0 auto;padding:20px 22px 96px;font-family:${SANS};}
        .dl-nav a{font-family:${MONO};font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${FADED};text-decoration:none;border-bottom:1px solid rgba(28,30,36,0.25);padding-bottom:1px;}
        .dl-nav a:hover{color:${INK};border-color:${INK};}

        /* your-day header */
        .dl-hero{display:flex;flex-wrap:wrap;gap:20px;align-items:center;justify-content:space-between;margin-top:14px;}
        .dl-kick{font-family:${MONO};font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:${FADED};font-weight:500;}
        .dl-h1{margin:6px 0 6px;font-size:32px;font-weight:800;letter-spacing:-0.7px;color:${INK};line-height:1.02;}
        .dl-sub{margin:0;font-size:14.5px;font-weight:600;color:${FADED};line-height:1.5;max-width:520px;}
        .dl-day{display:flex;gap:16px;align-items:center;background:${NAVY};color:#fff;border-radius:16px;padding:14px 22px;}
        .dl-day .rn{font-size:26px;font-weight:800;letter-spacing:-.5px;line-height:1;}
        .dl-day .rn b{color:${GOLD};}
        .dl-day .rt{font-family:${MONO};font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#9fb0d4;margin-top:4px;}
        .dl-day .dv{width:1px;align-self:stretch;background:rgba(255,255,255,.18);}

        .dl-legend{display:flex;gap:18px;flex-wrap:wrap;margin-top:14px;font-family:${SANS};font-size:12.5px;font-weight:700;color:${FADED};}
        .dl-sun-tag{font-family:${MONO};font-size:9px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;border-radius:4px;padding:1px 5px;color:${SUN};background:${SUN_BG};border:1px solid rgba(180,83,9,0.4);}

        /* still-to-play rail */
        .dl-sec-h{display:flex;align-items:baseline;gap:12px;margin:30px 0 13px;}
        .dl-sec-h h2{margin:0;font-size:19px;font-weight:800;letter-spacing:-.4px;color:${INK};}
        .dl-sec-h span{font-family:${MONO};font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${FADED};}
        .dl-rail{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px;-webkit-overflow-scrolling:touch;}
        .dl-railcard{flex:0 0 auto;display:flex;align-items:center;gap:10px;border:1px solid #e2e6ee;border-radius:13px;background:#fff;padding:11px 14px 11px 12px;text-decoration:none;box-shadow:0 2px 8px rgba(14,29,64,0.05);}
        .dl-railcard:hover{border-color:${NAVY};}
        .dl-alldone{border:1px dashed #cfd6e2;border-radius:13px;background:#fff;padding:14px 16px;font-size:13.5px;font-weight:700;color:${GREEN};}

        /* group headers + card grid */
        .dl-glabel{display:flex;align-items:center;gap:10px;margin:26px 0 13px;}
        .dl-glabel .k{font-family:${MONO};font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:600;color:${INK};}
        .dl-glabel .line{flex:1 1 auto;height:1px;background:#e2e6ee;}
        .dl-glabel .ct{font-family:${MONO};font-size:10.5px;color:${FADED};}
        .dl-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;align-items:start;}
        @media(max-width:820px){.dl-cards{grid-template-columns:1fr;}}

        .dl-card{border:1px solid #e2e6ee;border-radius:16px;background:#fff;box-shadow:0 2px 8px rgba(14,29,64,0.05);overflow:hidden;}
        .dl-card.open{border-color:${NAVY};box-shadow:0 8px 24px rgba(14,29,64,0.12);}
        .dl-chead{display:flex;align-items:flex-start;gap:13px;padding:15px 16px 0;}
        .dl-mono{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:21px;color:#fff;flex:0 0 auto;box-shadow:0 3px 8px rgba(0,0,0,.16);}
        .dl-cname{font-size:18px;font-weight:800;letter-spacing:-.35px;line-height:1.05;text-decoration:none;}
        .dl-ctag{font-size:12.5px;font-weight:600;color:${FADED};margin-top:2px;line-height:1.3;}
        .dl-cbody{padding:12px 16px 16px;}
        .dl-cstat{display:flex;gap:14px;flex-wrap:wrap;font-family:${MONO};font-size:11px;font-weight:500;color:${FADED};}
        .dl-cstat b{color:${INK};font-weight:600;}

        .dl-archwrap{margin-top:13px;}
        .dl-arch-l{font-family:${MONO};font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:${FADED};margin-bottom:8px;display:flex;align-items:center;gap:8px;}
        .dl-chips{display:flex;gap:7px;flex-wrap:wrap;}
        .dl-chip{display:inline-flex;align-items:center;gap:6px;font-family:${SANS};font-weight:700;font-size:12px;text-decoration:none;border-radius:9px;padding:6px 10px;border:1.5px solid rgba(28,30,36,0.16);color:${INK};background:#fff;}
        .dl-chip:hover{border-color:${INK};}
        .dl-tick{font-size:11px;font-weight:900;line-height:1;}
        .dl-today-tag{font-family:${MONO};font-size:9px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;border-radius:4px;padding:1px 5px;color:#fff;}
        .dl-morechip{border-style:dashed;color:${FADED};font-family:${MONO};font-size:11px;letter-spacing:.03em;cursor:pointer;background:transparent;}

        .dl-actions{display:flex;gap:8px;margin-top:14px;}
        .dl-play{flex:1 1 auto;text-align:center;text-decoration:none;color:#fff;font-weight:800;font-size:13px;border-radius:10px;padding:10px 12px;}
        .dl-play:hover{filter:brightness(1.07);}
        .dl-stand{flex:1 1 auto;text-align:center;font-family:${SANS};font-weight:800;font-size:13px;border-radius:10px;padding:10px 12px;cursor:pointer;border:1.5px solid #dfe3ec;color:${INK};background:#fff;}
        .dl-stand:hover{border-color:${NAVY};}
        .dl-stand.on{background:${NAVY};color:#fff;border-color:${NAVY};}

        /* leaderboard panel (matches DailyCombinedLeaderboard navy/gold) */
        .dl-lbwrap{margin-top:13px;}
        .lb{background:linear-gradient(165deg,#16294f,#0c1a34);border:1px solid rgba(232,180,58,0.28);border-radius:13px;padding:14px 15px 12px;}
        .lb-tabs{display:flex;gap:6px;margin-bottom:12px;}
        .lb-tab{font-family:${SANS};font-size:11.5px;font-weight:800;padding:6px 13px;border-radius:999px;cursor:pointer;border:1.5px solid rgba(255,255,255,0.14);background:transparent;color:#93a7cc;}
        .lb-tab.on{background:${GOLD};color:#10203f;border-color:${GOLD};}
        .lb-h{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:10px;}
        .lb-h a{font-size:12px;font-weight:800;text-decoration:none;}
        .lb-h .plays{font-size:11px;color:#93a7cc;font-weight:600;white-space:nowrap;}
        .lb-cols{display:grid;gap:8px;padding:0 12px 7px;font-family:${SANS};font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#93a7cc;}
        .lb-row{display:grid;gap:8px;align-items:center;padding:8px 12px;margin-bottom:5px;border-radius:10px;background:rgba(255,255,255,0.045);border:1px solid rgba(255,255,255,0.08);}
        .lb-row.top{background:rgba(232,180,58,0.08);border-color:rgba(232,180,58,0.22);}
        .lb-row.you{background:rgba(232,180,58,0.16);border:1px solid rgba(232,180,58,0.55);}
        .lb-r{text-align:right;}
        .lb-rk{font-family:${SANS};font-weight:800;font-size:15px;color:#93a7cc;font-variant-numeric:tabular-nums;}
        .lb-rk.gold{color:${GOLD_B};}
        .lb-nm{min-width:0;font-family:${SANS};font-size:14px;font-weight:500;color:#eaf0fb;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .lb-nm a{color:inherit;text-decoration:none;border-bottom:1px dotted rgba(147,167,204,0.53);}
        .lb-nm .you{color:${GOLD};font-weight:700;}
        .lb-num{font-family:${SANS};font-size:12.5px;font-weight:600;text-align:right;color:#93a7cc;font-variant-numeric:tabular-nums;}
        .lb-pt{font-family:${SANS};font-size:13.5px;font-weight:800;text-align:right;color:${GOLD_B};font-variant-numeric:tabular-nums;}
        .lb-pt small{font-size:9.5px;font-weight:600;color:#6a80a8;}
        .lb-more{width:100%;margin-top:4px;padding:8px 12px;border-radius:10px;cursor:pointer;font-family:${SANS};font-size:12px;font-weight:800;color:${GOLD_B};background:transparent;border:1.5px solid rgba(232,180,58,0.4);}
        .lb-sep{margin-top:7px;padding-top:8px;border-top:1px dashed rgba(255,255,255,0.14);}
        .lb-note{font-size:10.5px;color:#6a80a8;margin:9px 2px 0;line-height:1.5;}
        .lb-empty{font-family:${SANS};font-style:italic;font-size:14px;color:#93a7cc;padding:4px 2px;}
        .lb-g5{grid-template-columns:34px 1fr 48px 52px 54px;}
        .lb-g3{grid-template-columns:34px 1fr 62px;}
        @media(max-width:440px){.lb-g5{grid-template-columns:30px 1fr 44px 50px;}.lb-time{display:none;}}
      `}</style>

      <div className="dl-wrap">
        <div className="dl-nav" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <a href="/quizzes">Quizzes</a>
          <a href="/">Top 10 Lists</a>
        </div>

        <div className="dl-hero">
          <div>
            <div className="dl-kick">Source of Truths · Daily · {dateHeadline(today)}</div>
            <h1 className="dl-h1">Daily Games</h1>
            <p className="dl-sub">
              {games.length} original puzzles, a fresh one in each every day. Play today, chase the leaderboard,
              or replay any past drop — archive runs never touch your streak.
            </p>
          </div>
          <div className="dl-day" role="group" aria-label="Your day">
            <div>
              <div className="rn">{ready ? doneToday.length : '—'}<span style={{ color: '#9fb0d4', fontWeight: 700 }}> / {games.length}</span></div>
              <div className="rt">Aced today</div>
            </div>
            <div className="dv" />
            <div>
              <div className="rn">{ready ? playedToday.length : '—'}</div>
              <div className="rt">Played today</div>
            </div>
            <div className="dv" />
            <div>
              <div className="rn">{me ? <><b>#{me.rank}</b></> : '—'}</div>
              <div className="rt">{me ? `${fmtPts(me.total)}/${combined.maxTotal} today` : 'Your rank'}</div>
            </div>
          </div>
        </div>

        <div className="dl-legend">
          <span><span style={{ color: GREEN, fontWeight: 900 }}>&#10003;</span> Played</span>
          <span><span style={{ color: GOLD, fontWeight: 900 }}>&#9733;</span> Aced</span>
          <span><span className="dl-sun-tag" style={{ marginRight: 5 }}>Sun</span> Sunday edition — bigger &amp; tougher</span>
        </div>

        {/* still to play today */}
        <div className="dl-sec-h">
          <h2>Still to play today</h2>
          <span>{ready ? `${stillToPlay.length} left` : ''}</span>
        </div>
        {ready && stillToPlay.length === 0 ? (
          <div className="dl-alldone">&#9733; You&rsquo;ve played every game today. Nice. The archives below are always open.</div>
        ) : (
          <div className="dl-rail">
            {(ready ? stillToPlay : games).slice(0, 12).map((g) => (
              <a key={g.key} className="dl-railcard" href={g.path} aria-label={`Play ${g.name} today`}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: g.accent, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flex: '0 0 auto' }}>{g.name[0]}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 800, letterSpacing: '-0.3px', color: g.accent, lineHeight: 1.05 }}>{g.name}</span>
                  <span style={{ display: 'block', fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.05em', textTransform: 'uppercase', color: FADED }}>Play today →</span>
                </span>
              </a>
            ))}
          </div>
        )}

        {/* games by type */}
        <div className="dl-sec-h" style={{ marginBottom: 4 }}>
          <h2>All daily games</h2>
          <span>play · standings · full archive</span>
        </div>
        {groups.map((grp) => (
          <div key={grp.key}>
            <div className="dl-glabel">
              <span className="k">{grp.label}</span>
              <span className="line" />
              <span className="ct">{grp.games.length} games</span>
            </div>
            <div className="dl-cards">
              {grp.games.map((g) => (
                <GameCard
                  key={g.key}
                  g={g}
                  ready={ready}
                  played={played}
                  completed={completed}
                  board={boardsByKey[g.key]}
                  overall={combined ? combined.overall : null}
                  me={me}
                  myKey={myKey}
                  maxTotal={combined ? combined.maxTotal : 75}
                  gameMax={combined ? combined.gameMax : 15}
                  gameCount={combined ? combined.gameCount : null}
                  combinedReady={!!combined}
                />
              ))}
            </div>
          </div>
        ))}

        <p style={{ marginTop: 30, fontSize: 12.5, fontWeight: 600, color: FADED }}>
          Played &amp; aced marks are saved on this device (and follow your account when signed in). Leaderboards
          refresh through the day. <a href="/quizzes" style={{ color: INK, fontWeight: 800, textDecoration: 'underline' }}>Back to all quizzes →</a>
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- one game card
function GameCard({ g, ready, played, completed, board, overall, me, myKey, maxTotal, gameMax, gameCount, combinedReady }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('game');
  const [showAllArch, setShowAllArch] = useState(false);
  const navy = NAVY_ACCENT[g.key] || '#93a7cc';

  const playedCount = g.puzzles.reduce((n, p) => n + (played.has(`${g.key}:${p.num}`) ? 1 : 0), 0);
  const leader = board && board.board && board.board[0];
  const ARCH_PREVIEW = 10;
  const archList = showAllArch ? g.puzzles : g.puzzles.slice(0, ARCH_PREVIEW);
  const hiddenArch = g.puzzles.length - archList.length;

  return (
    <section className={`dl-card${open ? ' open' : ''}`} style={{ borderColor: open ? NAVY : undefined }}>
      <div className="dl-chead">
        <div className="dl-mono" style={{ background: g.accent }} aria-hidden="true">{g.name[0]}</div>
        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
          <a className="dl-cname" href={g.path} style={{ color: g.accent }}>{g.name}</a>
          <div className="dl-ctag">{g.tag}</div>
        </div>
      </div>

      <div className="dl-cbody">
        <div className="dl-cstat">
          <span><b>{g.puzzles.length}</b> in archive</span>
          {ready && playedCount > 0 && <span><b>{playedCount}</b> played</span>}
          {leader && <span>👑 <b>{leader.username}</b> · {fmtTime(leader.timeElapsed)}</span>}
          {board && <span><b>{(board.field || 0).toLocaleString()}</b> ranked today</span>}
        </div>

        <div className="dl-archwrap">
          <div className="dl-arch-l">Archive</div>
          <div className="dl-chips">
            {archList.map((p) => {
              const first = p.num === g.puzzles[0].num;
              const isPlayed = played.has(`${g.key}:${p.num}`);
              const isDone = completed.has(`${g.key}:${p.num}`);
              const href = first ? g.path : `${g.path}?p=${p.num}`;
              return (
                <a
                  key={p.num}
                  href={href}
                  className="dl-chip"
                  style={first ? { background: g.bg, borderColor: g.accent, color: g.accent, fontWeight: 800 } : isPlayed ? { borderColor: g.accent } : undefined}
                  aria-label={`${g.name} — ${shortDate(p.dateLabel)}${first ? ' (today)' : ''}${p.sunday ? ', Sunday edition' : ''}${isDone ? ', aced' : isPlayed ? ', played' : ''}`}
                >
                  {first && <span className="dl-today-tag" style={{ background: g.accent }}>Today</span>}
                  {p.sunday && <span className="dl-sun-tag" title="Sunday edition — bigger &amp; tougher">Sun</span>}
                  <span>{shortDate(p.dateLabel)}</span>
                  {ready && isDone && <span className="dl-tick" style={{ color: GOLD }} aria-hidden="true">&#9733;</span>}
                  {ready && !isDone && isPlayed && <span className="dl-tick" style={{ color: GREEN }} aria-hidden="true">&#10003;</span>}
                </a>
              );
            })}
            {hiddenArch > 0 && (
              <button type="button" className="dl-chip dl-morechip" onClick={() => setShowAllArch(true)}>+{hiddenArch} more</button>
            )}
            {showAllArch && g.puzzles.length > ARCH_PREVIEW && (
              <button type="button" className="dl-chip dl-morechip" onClick={() => setShowAllArch(false)}>Show less</button>
            )}
          </div>
        </div>

        <div className="dl-actions">
          <a className="dl-play" href={g.path} style={{ background: g.accent }}>Play today →</a>
          <button
            type="button"
            className={`dl-stand${open ? ' on' : ''}`}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Hide standings' : 'Standings'}
          </button>
        </div>

        {open && (
          <div className="dl-lbwrap">
            <StandingsPanel
              g={g} navy={navy} tab={tab} setTab={setTab}
              board={board} overall={overall} me={me} myKey={myKey}
              maxTotal={maxTotal} gameMax={gameMax} gameCount={gameCount} ready={combinedReady}
            />
          </div>
        )}
      </div>
    </section>
  );
}

// ------------------------------------------------------- expandable leaderboard
function StandingsPanel({ g, navy, tab, setTab, board, overall, me, myKey, maxTotal, gameMax, gameCount, ready }) {
  const [full, setFull] = useState(false);
  useEffect(() => { setFull(false); }, [tab]); // collapse when switching tabs

  return (
    <div className="lb">
      <div className="lb-tabs">
        <button type="button" className={`lb-tab${tab === 'game' ? ' on' : ''}`} onClick={() => setTab('game')}>This game</button>
        <button type="button" className={`lb-tab${tab === 'overall' ? ' on' : ''}`} onClick={() => setTab('overall')}>Overall</button>
      </div>
      {!ready ? (
        <p className="lb-empty">Loading today&rsquo;s leaderboard…</p>
      ) : tab === 'game' ? (
        <GameBoard g={g} navy={navy} board={board} myKey={myKey} gameMax={gameMax} full={full} setFull={setFull} />
      ) : (
        <OverallBoard overall={overall} me={me} myKey={myKey} maxTotal={maxTotal} gameCount={gameCount} full={full} setFull={setFull} />
      )}
    </div>
  );
}

function PlayerName({ row, mine }) {
  const label = mine ? 'you' : row.username;
  return (
    <span className="lb-nm">
      {mine ? <span className="you">you</span>
        : row.userKey ? <a href={`/quizzes/hub?player=${encodeURIComponent(row.userKey)}`}>{label}</a>
        : label}
    </span>
  );
}

function GameBoard({ g, navy, board, myKey, gameMax, full, setFull }) {
  const rows = (board && board.board) || [];
  const plays = board ? (board.plays != null ? board.plays : board.field) || 0 : 0;
  const head = (
    <div className="lb-h">
      <a href={(board && board.href) || g.path} style={{ color: navy }}>{g.name} today →</a>
      <span className="plays">{plays.toLocaleString()} {plays === 1 ? 'play' : 'plays'} today</span>
    </div>
  );
  if (!rows.length) {
    return (
      <div>{head}
        <p className="lb-empty">{plays > 0 ? 'No ranked scores here yet — sign in and play to claim the top spot.' : 'No one has posted a score here yet. Be the first.'}</p>
      </div>
    );
  }
  const meRow = myKey ? rows.find((r) => r.userKey === myKey) : null;
  const top = rows.slice(0, 3);
  const meInTop = meRow && top.some((r) => r.userKey === myKey);
  const shown = full ? rows : top;
  const rowEl = (r) => {
    const mine = myKey && r.userKey === myKey;
    return (
      <div key={r.userKey || r.rank} className={`lb-row lb-g5${mine ? ' you' : r.rank <= 3 ? ' top' : ''}`}>
        <span className={`lb-rk${r.rank <= 3 ? ' gold' : ''}`}>{r.rank}</span>
        <PlayerName row={r} mine={mine} />
        <span className="lb-num">{r.score}/{r.total}</span>
        <span className="lb-num lb-time">{fmtTime(r.timeElapsed)}</span>
        <span className="lb-pt">{fmtPts(r.points)}<small>/{gameMax}</small></span>
      </div>
    );
  };
  return (
    <div>
      {head}
      <div className="lb-cols lb-g5"><span>#</span><span>Player</span><span className="lb-r">Score</span><span className="lb-r lb-time">Time</span><span className="lb-r">Pts</span></div>
      {shown.map(rowEl)}
      {!full && meRow && !meInTop && (
        <div className="lb-sep">{rowEl(meRow)}</div>
      )}
      {!full && rows.length > 3 && (
        <button type="button" className="lb-more" onClick={() => setFull(true)}>Show full standings ({rows.length})</button>
      )}
      {full && rows.length > 3 && (
        <button type="button" className="lb-more" onClick={() => setFull(false)}>Show less</button>
      )}
      <p className="lb-note">15 per game: up to 5 for accuracy, up to 10 for where you placed against today&rsquo;s field.</p>
    </div>
  );
}

function OverallBoard({ overall, me, myKey, maxTotal, gameCount, full, setFull }) {
  const rows = overall || [];
  if (!rows.length) {
    return <p className="lb-empty">No one has posted a daily score yet. Be the first.</p>;
  }
  const meInRows = myKey && rows.some((r) => r.userKey === myKey);
  const top = rows.slice(0, 3);
  const meInTop = me && top.some((r) => r.userKey === myKey);
  const shown = full ? rows : top;
  const rowEl = (r) => {
    const mine = myKey && r.userKey === myKey;
    return (
      <div key={r.userKey || r.rank} className={`lb-row lb-g3${mine ? ' you' : r.rank <= 3 ? ' top' : ''}`}>
        <span className={`lb-rk${r.rank <= 3 ? ' gold' : ''}`}>{r.rank}</span>
        <PlayerName row={r} mine={mine} />
        <span className="lb-pt">{fmtPts(r.total)}<small>/{maxTotal}</small></span>
      </div>
    );
  };
  return (
    <div>
      <div className="lb-h">
        <span style={{ fontSize: 12, fontWeight: 800, color: '#e8b43a' }}>Overall standings</span>
        <span className="plays">{gameCount ? `best ${Math.min(10, gameCount)} of ${gameCount}` : ''} · {maxTotal} max</span>
      </div>
      <div className="lb-cols lb-g3"><span>#</span><span>Player</span><span className="lb-r">Total</span></div>
      {shown.map(rowEl)}
      {!full && me && !meInTop && !meInRows && (
        <div className="lb-sep">{rowEl(me)}</div>
      )}
      {!full && rows.length > 3 && (
        <button type="button" className="lb-more" onClick={() => setFull(true)}>Show full standings ({rows.length})</button>
      )}
      {full && rows.length > 3 && (
        <button type="button" className="lb-more" onClick={() => setFull(false)}>Show less</button>
      )}
      <p className="lb-note">Your daily total is your best {gameCount ? Math.min(10, gameCount) : 10} of today&rsquo;s games.</p>
    </div>
  );
}
