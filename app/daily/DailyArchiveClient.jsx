'use client';

// Client for /daily. A daily-games LANDING PAGE (archive-complete):
//   • a "your day" header — games played today, aced, and your live daily
//     rank/total (from /api/quiz/daily-combined);
//   • a "still to play today" rail of the games you haven't opened yet;
//   • every game grouped by type as a two-up CARD. Each card shows the game's
//     art, a one-line stat, and three quiet actions: Play, Standings, Archive.
//     Standings and Archive expand IN PLACE (mutually exclusive), so the card
//     face stays calm and the archive/leaderboard are one tap away.
//       - Standings → that game's daily board (top 3 + your row, full-standings
//         expander, This-game / Overall tabs), styled like DailyCombinedLeaderboard.
//       - Archive → every past drop as a date chip, played ✓ / aced ★ marks read
//         from per-puzzle localStorage + server play history.
// Self-contained styling (its own <style>) so it matches the daily pages'
// navy-and-gold look. Two fetches for the whole page: daily-status and
// daily-combined, both already edge-cached.

import React, { useState, useEffect, useMemo } from 'react';
import useDailyOrder, { sortByDailyOrder } from '../useDailyOrder';

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const INK = '#1c1e24';
const FADED = '#6b7280';
const MUTED = '#46506a';
const BG = '#f7f8fa';
const LINE = '#e7eaf1';
const NAVY = '#0e1d40';
const GOLD = '#e8b43a';
const GOLD_B = '#f5d878';
const GREEN = '#16a34a';
const SUN = '#b45309';
const SUN_BG = '#fff7ed';

const CATEGORIES = [
  { key: 'word', label: 'Word', keys: ['crux', 'emcee', 'garble', 'links', 'stet', 'tuck', 'warmer'] },
  { key: 'history', label: 'History', keys: ['dating', 'circa', 'extra'] },
  { key: 'geography', label: 'Geography', keys: ['span', 'ping'] },
  { key: 'numbers', label: 'Numbers', keys: ['tally', 'suds', 'carve', 'outwit', 'cipher'] },
  { key: 'logic', label: 'Logic', keys: ['alibi', 'jester', 'sworn'] },
];
// Each game's accent, lightened for legibility on the dark leaderboard card
// (mirrors ACCENTS_NAVY in DailyCombinedLeaderboard).
const NAVY_ACCENT = {
  crux: '#5b9bff', emcee: '#e879f9', garble: '#f0c95a', links: '#4ca878', span: '#e06aa0', dating: '#a483f0',
  tally: '#4cb377', suds: '#f0894c', circa: '#38b6cf', extra: '#e06a6a', carve: '#a483f0', stet: '#41b1e8',
  outwit: '#c3cfe3', tuck: '#e0a568', alibi: '#ef8896', cipher: '#3fc9b8', ping: '#4cb3f0', warmer: '#f3705c',
  jester: '#a78bfa', sworn: '#f472b6',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
function tint(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
// Deterministic on server + client, so it can render during SSR without a
// hydration mismatch.
function dateHeadline(today) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(today || '');
  if (!m) return 'Today';
  const y = +m[1], mo = +m[2], d = +m[3];
  const wd = WEEKDAYS[new Date(y, mo - 1, d).getDay()];
  return `${wd}, ${MONTHS[mo - 1]} ${d}`;
}

// Cross-game daily streak: consecutive calendar days (newest first) where at
// least one game's drop for that day has a save. An unplayed today does not
// break the streak; it just doesn't count yet.
function computeStreak(games, played) {
  const byDate = new Map();
  for (const g of games) for (const p of g.puzzles) {
    const t = Date.parse(p.dateLabel || '');
    if (!isFinite(t)) continue;
    if (!byDate.has(t)) byDate.set(t, []);
    byDate.get(t).push(`${g.key}:${p.num}`);
  }
  const dates = [...byDate.keys()].sort((a, b) => b - a);
  let s = 0;
  for (let i = 0; i < dates.length; i++) {
    const any = byDate.get(dates[i]).some((k) => played.has(k));
    if (any) s++;
    else if (i === 0) continue;
    else break;
  }
  return s;
}

export default function DailyArchiveClient({ games = [], today = '' }) {
  const [played, setPlayed] = useState(() => new Set());
  const [completed, setCompleted] = useState(() => new Set());
  const [ready, setReady] = useState(false);
  const [combined, setCombined] = useState(null);

  const dailyOrder = useDailyOrder();

  // Deep-link support: /daily?archive=<gameKey> opens that game's Archive panel
  // and scrolls to it (used by the end-of-game "Play a past <Game>" action).
  useEffect(() => {
    let key = null;
    try { key = new URLSearchParams(window.location.search).get('archive'); } catch (e) {}
    if (!key) return undefined;
    const t = setTimeout(() => {
      const btn = document.querySelector('[data-arch="' + key + '"]');
      if (!btn) return;
      if (btn.getAttribute('aria-expanded') !== 'true') btn.click();
      const card = btn.closest('.dl-card');
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
    return () => clearTimeout(t);
  }, [ready]);
  const gamesByKey = useMemo(() => {
    const m = {};
    for (const g of games) m[g.key] = g;
    return m;
  }, [games]);

  useEffect(() => {
    let alive = true;
    const pl = new Set();
    const cp = new Set();
    const byQuiz = {};
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

  const streak = useMemo(() => (ready ? computeStreak(games, played) : 0), [ready, games, played]);

  const todayNum = (g) => (g.puzzles[0] ? g.puzzles[0].num : null);
  const isPlayedToday = (g) => { const n = todayNum(g); return n != null && played.has(`${g.key}:${n}`); };
  const isDoneToday = (g) => { const n = todayNum(g); return n != null && completed.has(`${g.key}:${n}`); };

  const playedToday = games.filter(isPlayedToday);
  const doneToday = games.filter(isDoneToday);
  const stillToPlay = sortByDailyOrder(games.filter((g) => !isPlayedToday(g)), dailyOrder);

  const groups = CATEGORIES.map((cat) => {
    const gs = sortByDailyOrder(cat.keys.map((k) => gamesByKey[k]).filter(Boolean), dailyOrder);
    return { ...cat, games: gs };
  }).filter((grp) => grp.games.length);

  const me = combined && combined.me;

  // Rival hook for the scoreboard card: the player directly ahead of you today.
  let rivalAv = '★';
  let rivalText = <>Post a score in any game to join today&rsquo;s board</>;
  if (me && combined) {
    const rows = combined.overall || [];
    if (me.rank === 1) {
      rivalAv = '♛';
      rivalText = <>You lead today&rsquo;s board. Keep it.</>;
    } else {
      const ahead = rows.find((r) => r.rank === me.rank - 1);
      if (ahead) {
        rivalAv = String(ahead.username || '?').trim().slice(0, 2).toUpperCase();
        rivalText = <><b>{ahead.username}</b> is {fmtPts(ahead.total - me.total)} pts ahead of you today</>;
      } else if (rows[9]) {
        rivalAv = '10';
        rivalText = <>{fmtPts(rows[9].total - me.total)} pts from today&rsquo;s top 10</>;
      }
    }
  }

  // Live ticker items from today's boards.
  const tickerItems = [];
  if (combined) {
    const o = (combined.overall || [])[0];
    if (o && o.username) tickerItems.push({ name: o.username, post: ` leads the day · ${fmtPts(o.total)}/${combined.maxTotal} pts`, accent: GOLD });
    for (const gb of combined.games || []) {
      const lead = gb.board && gb.board[0];
      const game = gamesByKey[gb.key];
      if (!lead || !lead.username || !game) continue;
      tickerItems.push({ name: lead.username, post: ` leads ${game.name} · ${fmtPts(lead.points)}/${combined.gameMax}`, accent: game.accent });
    }
  }

  const pt = playedToday.length;
  const gauntTease = pt >= games.length && games.length > 0 ? 'Perfect day · every game played'
    : pt < 5 ? `${5 - pt} more to warm-up`
    : pt < 10 ? `${10 - pt} more to grinder`
    : `${games.length - pt} more to a perfect day`;

  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      <style>{`
        .dl-wrap{max-width:1080px;margin:0 auto;padding:22px 22px 100px;font-family:${SANS};}
        .dl-nav a{font-family:${MONO};font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${FADED};text-decoration:none;border-bottom:1px solid rgba(28,30,36,0.22);padding-bottom:1px;}
        .dl-nav a:hover{color:${INK};border-color:${INK};}

        .dl-hero{display:flex;flex-wrap:wrap;gap:22px;align-items:center;justify-content:space-between;margin-top:16px;}
        .dl-kick{font-family:${MONO};font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:${FADED};font-weight:500;}
        .dl-h1{margin:8px 0 7px;font-size:34px;font-weight:800;letter-spacing:-0.9px;color:${INK};line-height:1.0;}
        .dl-sub{margin:0;font-size:14.5px;font-weight:500;color:${FADED};line-height:1.55;max-width:540px;}
        .dl-day{display:flex;flex-direction:column;gap:12px;background:linear-gradient(160deg,#16294f,#0c1a34);color:#fff;border-radius:16px;padding:16px 20px;box-shadow:0 6px 22px rgba(14,29,64,0.14);min-width:300px;}
        .dl-day .row{display:flex;gap:15px;align-items:center;}
        .dl-day .rn{font-size:25px;font-weight:800;letter-spacing:-.5px;line-height:1;}
        .dl-day .rn b{color:${GOLD};}
        .dl-day .rn .of{color:#8ea0c6;font-weight:700;font-size:15px;}
        .dl-day .rt{font-family:${MONO};font-size:9.5px;letter-spacing:.09em;text-transform:uppercase;color:#9fb0d4;margin-top:5px;}
        .dl-day .dv{width:1px;align-self:stretch;background:rgba(255,255,255,.16);}

        .dl-legend{display:flex;gap:18px;flex-wrap:wrap;margin-top:16px;font-family:${SANS};font-size:12.5px;font-weight:600;color:${FADED};}
        .dl-sun-tag{font-family:${MONO};font-size:9px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;border-radius:4px;padding:1px 5px;color:${SUN};background:${SUN_BG};border:1px solid rgba(180,83,9,0.35);}

        .dl-sec-h{display:flex;align-items:baseline;gap:12px;margin:34px 0 14px;}
        .dl-sec-h h2{margin:0;font-size:18px;font-weight:800;letter-spacing:-.4px;color:${INK};}
        .dl-sec-h span{font-family:${MONO};font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:${FADED};}

        .dl-rail{display:flex;gap:10px;overflow-x:auto;padding-bottom:8px;-webkit-overflow-scrolling:touch;}
        .dl-railcard{flex:0 0 auto;display:flex;align-items:center;gap:11px;border:1px solid ${LINE};border-radius:13px;background:#fff;padding:10px 15px 10px 11px;text-decoration:none;transition:border-color .15s,box-shadow .15s;}
        .dl-railcard:hover{border-color:#cdd6e6;box-shadow:0 4px 14px rgba(14,29,64,0.07);}
        .dl-alldone{border:1px dashed #cfd6e2;border-radius:13px;background:#fff;padding:15px 18px;font-size:13.5px;font-weight:600;color:${MUTED};}
        .dl-alldone b{color:${GREEN};}

        .dl-glabel{display:flex;align-items:center;gap:12px;margin:28px 0 14px;}
        .dl-glabel .k{font-family:${MONO};font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:500;color:${MUTED};}
        .dl-glabel .line{flex:1 1 auto;height:1px;background:${LINE};}
        .dl-glabel .ct{font-family:${MONO};font-size:10px;color:#9aa3b5;}
        .dl-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:start;}
        @media(max-width:820px){.dl-cards{grid-template-columns:1fr;}}

        .dl-card{border:1px solid ${LINE};border-radius:16px;background:#fff;transition:border-color .15s,box-shadow .15s;}
        .dl-card:hover{box-shadow:0 4px 16px rgba(14,29,64,0.06);}
        .dl-card.open{border-color:#c9d3e5;box-shadow:0 10px 30px rgba(14,29,64,0.10);}
        .dl-chead{display:flex;align-items:center;gap:14px;padding:16px 18px 0;}
        .dl-art{box-sizing:border-box;border-radius:13px;display:flex;align-items:center;justify-content:center;flex:0 0 auto;overflow:hidden;}
        .dl-art img{width:78%;height:78%;object-fit:contain;}
        .dl-cname{font-size:17.5px;font-weight:800;letter-spacing:-.4px;line-height:1.05;color:${INK};text-decoration:none;}
        .dl-cname:hover{text-decoration:underline;text-decoration-color:rgba(28,30,36,.3);text-underline-offset:2px;}
        .dl-ctag{font-size:12.5px;font-weight:500;color:${FADED};margin-top:3px;line-height:1.3;}
        .dl-cbody{padding:13px 18px 17px;}
        .dl-cstat{display:flex;align-items:center;gap:7px;flex-wrap:wrap;font-family:${MONO};font-size:11px;font-weight:400;color:${FADED};}
        .dl-cstat b{color:${MUTED};font-weight:500;}
        .dl-cstat .dot{color:#c8cede;}
        .dl-crown{color:${GOLD};}

        .dl-actions{display:flex;gap:8px;margin-top:15px;flex-wrap:wrap;}
        .dl-btn{flex:1 1 auto;text-align:center;font-family:${SANS};font-weight:700;font-size:12.5px;border-radius:10px;padding:10px 12px;cursor:pointer;text-decoration:none;transition:all .13s;white-space:nowrap;}
        .dl-play{flex:1.35 1 auto;color:#fff;font-weight:800;border:1px solid transparent;}
        .dl-play:hover{filter:brightness(1.06);}
        .dl-ghost{color:${MUTED};background:#fff;border:1px solid ${LINE};}
        .dl-ghost:hover{border-color:#c9d3e5;color:${INK};}
        .dl-ghost.on{background:#eef1f7;border-color:#c9d3e5;color:${INK};}
        .dl-ghost .cnt{color:#9aa3b5;font-weight:500;}

        /* expandable panels */
        .dl-panel{margin-top:14px;}
        .dl-archpanel{background:${BG};border:1px solid ${LINE};border-radius:12px;padding:13px 14px;}
        .dl-archpanel .lab{font-family:${MONO};font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:${FADED};margin-bottom:9px;}
        .dl-chips{display:flex;gap:7px;flex-wrap:wrap;}
        .dl-chip{display:inline-flex;align-items:center;gap:6px;font-family:${SANS};font-weight:600;font-size:12px;text-decoration:none;border-radius:8px;padding:6px 10px;border:1px solid ${LINE};color:${MUTED};background:#fff;}
        .dl-chip:hover{border-color:#c9d3e5;color:${INK};}
        .dl-tick{font-size:11px;font-weight:900;line-height:1;}
        .dl-today-tag{font-family:${MONO};font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;border-radius:4px;padding:1px 5px;color:#fff;}
        .dl-morechip{border-style:dashed;color:${FADED};font-family:${MONO};font-size:11px;cursor:pointer;}

        /* leaderboard panel (matches DailyCombinedLeaderboard navy/gold) */
        .lb{background:linear-gradient(165deg,#16294f,#0c1a34);border:1px solid rgba(232,180,58,0.26);border-radius:12px;padding:14px 15px 12px;}
        .lb-tabs{display:flex;gap:6px;margin-bottom:12px;}
        .lb-tab{font-family:${SANS};font-size:11.5px;font-weight:800;padding:6px 13px;border-radius:999px;cursor:pointer;border:1.5px solid rgba(255,255,255,0.14);background:transparent;color:#93a7cc;}
        .lb-tab.on{background:${GOLD};color:#10203f;border-color:${GOLD};}
        .lb-h{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:10px;}
        .lb-h a{font-size:12px;font-weight:800;text-decoration:none;}
        .lb-h .plays{font-size:11px;color:#93a7cc;font-weight:500;white-space:nowrap;}
        .lb-cols{display:grid;gap:8px;padding:0 12px 7px;font-family:${SANS};font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#93a7cc;}
        .lb-row{display:grid;gap:8px;align-items:center;padding:8px 12px;margin-bottom:5px;border-radius:10px;background:rgba(255,255,255,0.045);border:1px solid rgba(255,255,255,0.08);}
        .lb-row.top{background:rgba(232,180,58,0.08);border-color:rgba(232,180,58,0.22);}
        .lb-row.you{background:rgba(232,180,58,0.16);border:1px solid rgba(232,180,58,0.55);}
        .lb-r{text-align:right;}
        .lb-rk{font-family:${SANS};font-weight:800;font-size:15px;color:#93a7cc;font-variant-numeric:tabular-nums;}
        .lb-rk.gold{color:${GOLD_B};}
        .lb-nm{min-width:0;font-family:${SANS};font-size:14px;font-weight:500;color:#eaf0fb;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .lb-nm a{color:inherit;text-decoration:none;border-bottom:1px dotted rgba(147,167,204,0.5);}
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

        /* your-day extras: rival line + next-game CTA */
        .dl-rival{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.07);border-left:3px solid ${GOLD};border-radius:0 9px 9px 0;padding:7px 10px;font-size:12.5px;font-weight:500;color:#c9d3e5;}
        .dl-rival b{color:#fff;font-weight:700;}
        .dl-rival .av{width:22px;height:22px;border-radius:50%;background:${GOLD};color:#0e1d40;display:inline-flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:800;flex:0 0 auto;}
        .dl-cta{display:block;text-align:center;background:${GOLD};color:#10203f;font-weight:800;font-size:13px;border-radius:10px;padding:10px 14px;text-decoration:none;}
        .dl-cta:hover{filter:brightness(1.05);}
        .dl-cta.done{background:rgba(232,180,58,0.16);color:${GOLD_B};cursor:default;}

        /* live activity ticker */
        .dl-ticker{overflow:hidden;background:#fff;border:1px solid ${LINE};border-left:4px solid ${GOLD};border-radius:10px;padding:7px 0;margin-top:16px;}
        .dl-tickrow{display:flex;gap:34px;white-space:nowrap;width:max-content;animation:dlTick 30s linear infinite;font-size:12.5px;font-weight:500;color:${MUTED};padding-left:18px;align-items:center;}
        .dl-tickrow b{color:${INK};font-weight:700;}
        .dl-tickrow .sw{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:7px;}
        @keyframes dlTick{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @media (prefers-reduced-motion: reduce){.dl-tickrow{animation:none;}}

        /* gauntlet meter */
        .dl-gaunt{background:#fff;border:1px solid ${LINE};border-radius:16px;padding:15px 18px;margin-top:14px;}
        .dl-gaunt-h{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:10px;}
        .dl-gaunt-h h2{margin:0;font-size:16px;font-weight:800;letter-spacing:-.3px;color:${INK};}
        .dl-gaunt-h .tease{font-size:11.5px;font-weight:800;color:#fff;background:${NAVY};border-radius:999px;padding:4px 12px;}
        .dl-segs{display:flex;gap:3px;margin-bottom:9px;}
        .dl-seg{flex:1 1 auto;height:13px;border-radius:3px;background:#eef1f7;}
        .dl-seg.on{background:${GOLD};}
        .dl-gaunt-l{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-family:${MONO};font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;font-weight:500;color:${FADED};}

        /* card chase line */
        .dl-chase{margin-top:10px;}
        .dl-chase-t{font-size:12px;font-weight:600;color:${MUTED};}
        .dl-chase-t b{color:${INK};}
        .dl-bar{height:7px;border-radius:4px;background:#eef1f7;margin-top:5px;overflow:hidden;}
        .dl-bar div{height:100%;border-radius:4px;transition:width .3s;}
      `}</style>

      <div className="dl-wrap">
        <div className="dl-nav" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <a href="/">Quizzes</a>
          <a href="/lists">Top 10 Lists</a>
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
            <div className="row">
              <div>
                <div className="rn"><b>{ready ? streak : '—'}</b></div>
                <div className="rt">Day streak</div>
              </div>
              <div className="dv" />
              <div>
                <div className="rn">{ready ? playedToday.length : '—'}<span className="of"> / {games.length}</span></div>
                <div className="rt">Played today</div>
              </div>
              <div className="dv" />
              <div>
                <div className="rn">{ready ? doneToday.length : '—'}</div>
                <div className="rt">Aced today</div>
              </div>
              <div className="dv" />
              <div>
                <div className="rn">{me ? <><b>#{me.rank}</b></> : '—'}</div>
                <div className="rt">{me ? `${fmtPts(me.total)}/${combined.maxTotal} today` : 'Your rank'}</div>
              </div>
            </div>
            <div className="dl-rival">
              <span className="av" aria-hidden="true">{rivalAv}</span>
              <span>{rivalText}</span>
            </div>
            {ready && stillToPlay[0] ? (
              <a className="dl-cta" href={stillToPlay[0].path}>Play your next game · {stillToPlay[0].name} →</a>
            ) : ready && games.length ? (
              <span className="dl-cta done">★ Perfect day. Every game played.</span>
            ) : null}
          </div>
        </div>

        <div className="dl-legend">
          <span><span style={{ color: GREEN, fontWeight: 900 }}>&#10003;</span> Played</span>
          <span><span style={{ color: GOLD, fontWeight: 900 }}>&#9733;</span> Aced</span>
          <span><span className="dl-sun-tag" style={{ marginRight: 5 }}>Sun</span> Sunday edition — bigger &amp; tougher</span>
        </div>

        {tickerItems.length >= 3 && (
          <div className="dl-ticker" aria-label="Today's leaderboard activity">
            <div className="dl-tickrow">
              {[0, 1].map((rep2) => tickerItems.map((it, i) => (
                <span key={`${rep2}-${i}`} aria-hidden={rep2 === 1 ? 'true' : undefined}>
                  <span className="sw" style={{ background: it.accent }} aria-hidden="true" />
                  <b>{it.name}</b>{it.post}
                </span>
              )))}
            </div>
          </div>
        )}

        <div className="dl-gaunt" role="group" aria-label="Today's gauntlet">
          <div className="dl-gaunt-h">
            <h2>Today&rsquo;s gauntlet</h2>
            {ready && <span className="tease">{gauntTease}</span>}
          </div>
          <div className="dl-segs" aria-hidden="true">
            {games.map((g, i) => (
              <span key={g.key} className={`dl-seg${i < playedToday.length ? ' on' : ''}`} />
            ))}
          </div>
          <div className="dl-gaunt-l">
            <span style={{ color: INK }}>{ready ? `${playedToday.length}/${games.length} played` : '…'}</span>
            {games.length >= 12 && <span><span style={{ color: '#9aa3b5' }}>●</span> 5 · warm-up</span>}
            {games.length >= 12 && <span><span style={{ color: '#c8814b' }}>●</span> 10 · grinder</span>}
            <span style={{ color: '#8a6d1f' }}><span style={{ color: GOLD }}>★</span> {games.length} · perfect day</span>
          </div>
        </div>

        <div className="dl-sec-h">
          <h2>Still to play today</h2>
          <span>{ready ? `${stillToPlay.length} left` : ''}</span>
        </div>
        {ready && stillToPlay.length === 0 ? (
          <div className="dl-alldone"><b>&#9733; All caught up.</b> You&rsquo;ve played every game today. The archives below are always open.</div>
        ) : (
          <div className="dl-rail">
            {(ready ? stillToPlay : games).slice(0, 12).map((g) => (
              <a key={g.key} className="dl-railcard" href={g.path} aria-label={`Play ${g.name} today`}>
                <GameArt g={g} size={36} />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 800, letterSpacing: '-0.3px', color: INK, lineHeight: 1.1 }}>{g.name}</span>
                  <span style={{ display: 'block', fontFamily: MONO, fontSize: 9, letterSpacing: '0.05em', textTransform: 'uppercase', color: FADED, marginTop: 2 }}>Play today →</span>
                </span>
              </a>
            ))}
          </div>
        )}

        <div className="dl-sec-h" style={{ marginBottom: 6 }}>
          <h2>All daily games</h2>
          <span>play · standings · archive</span>
        </div>
        {groups.map((grp) => (
          <div key={grp.key}>
            <div className="dl-glabel">
              <span className="k">{grp.label}</span>
              <span className="line" />
              <span className="ct">{grp.games.length} game{grp.games.length === 1 ? '' : 's'}</span>
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

        <p style={{ marginTop: 34, fontSize: 12.5, fontWeight: 500, color: FADED }}>
          Played &amp; aced marks are saved on this device (and follow your account when signed in). Leaderboards
          refresh through the day. <a href="/" style={{ color: INK, fontWeight: 700, textDecoration: 'underline' }}>Back to all quizzes →</a>
        </p>
      </div>
    </div>
  );
}

// game art tile with a monogram fallback if the PNG is missing
function GameArt({ g, size = 52 }) {
  const [err, setErr] = useState(false);
  return (
    <div className="dl-art" style={{ width: size, height: size, background: tint(g.accent, 0.10) }}>
      {err
        ? <span style={{ fontWeight: 800, color: g.accent, fontSize: Math.round(size * 0.42) }}>{g.name[0]}</span>
        : <img src={`/games/tile/${g.key}.png`} alt="" aria-hidden="true" onError={() => setErr(true)} />}
    </div>
  );
}

// ---------------------------------------------------------------- one game card
function GameCard({ g, ready, played, completed, board, overall, me, myKey, maxTotal, gameMax, gameCount, combinedReady }) {
  const [panel, setPanel] = useState(null); // null | 'standings' | 'archive'
  const [tab, setTab] = useState('game');
  const toggle = (p) => setPanel((cur) => (cur === p ? null : p));

  const navy = NAVY_ACCENT[g.key] || '#93a7cc';
  const playedCount = g.puzzles.reduce((n, p) => n + (played.has(`${g.key}:${p.num}`) ? 1 : 0), 0);
  const leader = board && board.board && board.board[0];
  const myRow = myKey && board && board.board ? board.board.find((r) => r.userKey === myKey) : null;
  const todayQuiz = g.puzzles[0] && g.puzzles[0].quizId;
  const chasePct = myRow && leader && leader.points > 0 ? Math.min(100, Math.round((myRow.points / leader.points) * 100)) : 0;

  return (
    <section className={`dl-card${panel ? ' open' : ''}`}>
      <div className="dl-chead">
        <GameArt g={g} size={50} />
        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
          <a className="dl-cname" href={g.path}>{g.name}</a>
          <div className="dl-ctag">{g.tag}</div>
        </div>
      </div>

      <div className="dl-cbody">
        <div className="dl-cstat">
          <span><b>{g.puzzles.length}</b> puzzles</span>
          {ready && playedCount > 0 && <><span className="dot">·</span><span><b>{playedCount}</b> played</span></>}
          {leader && <><span className="dot">·</span><span><span className="dl-crown" aria-hidden="true">♛</span> led by <b>{leader.username}</b></span></>}
        </div>

        {leader && (
          <div className="dl-chase">
            <div className="dl-chase-t">
              {myRow
                ? (myRow.userKey === leader.userKey
                  ? <>You lead with <b>{fmtPts(myRow.points)}</b> pts <span style={{ color: GOLD }} aria-hidden="true">♛</span> · defend it</>
                  : <>You <b>{fmtPts(myRow.points)}</b> · leader <b>{fmtPts(leader.points)}</b> · {fmtPts(leader.points - myRow.points)} back</>)
                : <>Top score to beat: <b>{fmtPts(leader.points)}</b>/{gameMax} pts</>}
            </div>
            <div className="dl-bar"><div style={{ width: `${chasePct}%`, background: g.accent }} /></div>
          </div>
        )}

        <div className="dl-actions">
          <a className="dl-btn dl-play" href={g.path} style={{ background: g.accent }}>Play today →</a>
          {todayQuiz && <a className="dl-btn dl-ghost" href={`/duel/new?quiz=${encodeURIComponent(todayQuiz)}`} aria-label={`Challenge a friend to today's ${g.name}`}>⚔ Challenge</a>}
          <button type="button" className={`dl-btn dl-ghost${panel === 'standings' ? ' on' : ''}`} aria-expanded={panel === 'standings'} onClick={() => toggle('standings')}>Standings</button>
          <button type="button" className={`dl-btn dl-ghost${panel === 'archive' ? ' on' : ''}`} data-arch={g.key} aria-expanded={panel === 'archive'} onClick={() => toggle('archive')}>Archive <span className="cnt">{g.puzzles.length}</span></button>
        </div>

        {panel === 'standings' && (
          <div className="dl-panel">
            <StandingsPanel
              g={g} navy={navy} tab={tab} setTab={setTab}
              board={board} overall={overall} me={me} myKey={myKey}
              maxTotal={maxTotal} gameMax={gameMax} gameCount={gameCount} ready={combinedReady}
            />
          </div>
        )}
        {panel === 'archive' && (
          <div className="dl-panel">
            <ArchivePanel g={g} ready={ready} played={played} completed={completed} />
          </div>
        )}
      </div>
    </section>
  );
}

// -------------------------------------------------------------- archive (chips)
function ArchivePanel({ g, ready, played, completed }) {
  const [showAll, setShowAll] = useState(false);
  const PREVIEW = 14;
  const list = showAll ? g.puzzles : g.puzzles.slice(0, PREVIEW);
  const hidden = g.puzzles.length - list.length;
  const firstNum = g.puzzles[0] ? g.puzzles[0].num : null;
  return (
    <div className="dl-archpanel">
      <div className="lab">Every past drop — replay any day, your streak is safe</div>
      <div className="dl-chips">
        {list.map((p) => {
          const first = p.num === firstNum;
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
        {hidden > 0 && <button type="button" className="dl-chip dl-morechip" onClick={() => setShowAll(true)}>+{hidden} more</button>}
        {showAll && g.puzzles.length > PREVIEW && <button type="button" className="dl-chip dl-morechip" onClick={() => setShowAll(false)}>Show less</button>}
      </div>
    </div>
  );
}

// ------------------------------------------------------- expandable leaderboard
function StandingsPanel({ g, navy, tab, setTab, board, overall, me, myKey, maxTotal, gameMax, gameCount, ready }) {
  const [full, setFull] = useState(false);
  useEffect(() => { setFull(false); }, [tab]);

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
      {!full && meRow && !meInTop && <div className="lb-sep">{rowEl(meRow)}</div>}
      {!full && rows.length > 3 && <button type="button" className="lb-more" onClick={() => setFull(true)}>Show full standings ({rows.length})</button>}
      {full && rows.length > 3 && <button type="button" className="lb-more" onClick={() => setFull(false)}>Show less</button>}
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
      {!full && me && !meInTop && !meInRows && <div className="lb-sep">{rowEl(me)}</div>}
      {!full && rows.length > 3 && <button type="button" className="lb-more" onClick={() => setFull(true)}>Show full standings ({rows.length})</button>}
      {full && rows.length > 3 && <button type="button" className="lb-more" onClick={() => setFull(false)}>Show less</button>}
      <p className="lb-note">Your daily total is your best {gameCount ? Math.min(10, gameCount) : 10} of today&rsquo;s games.</p>
    </div>
  );
}
