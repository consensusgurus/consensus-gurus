'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';

// DailyBoardPanel — the on-page "<player> Stats" section, in the light page
// theme, placed directly under the Challenge / Share actions on every daily-game
// page. It mirrors the end-of-game card. Header shows the player's name (or a
// sign-up prompt for guests, who still see their hypothetical standings). Below
// sit four punchy tiles that double as the leaderboard selector —
//   1. Today          — my rank of today's per-game field
//   2. All-time       — my rank of the game's cumulative field
//   3. Combined Today — my rank of today's combined (best-N) board
//   4. <Game> Archive — % of this game's drops I've completed
// The board area under the tiles is collapsed by default and defaults to Today's
// daily board; clicking a tile flips the category. Today, All-time and Combined
// Today all render the same condensed top-10 board style for consistency (the
// Combined view carries the "best N of M / max pts" caption). Archive opens this
// game's drop calendar.
//
// Self-contained: fetches /api/quiz/daily-combined (me + combined + today's
// per-game boards) and /api/quiz/daily-game (this game's all-time board + drop
// calendar) — the same two endpoints the end card reads, so the two agree.
//
// Props: `self` (game key), `quizId` (scopes the combined fetch), `maxWidth`.

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const INK = '#1c1e24';
const SLATE = '#46506a';
const FADED = '#6b7280';
const BORD = '#e7eaf1';
const BLUE = '#2563eb';

const GAME_NAMES = {
  crux: 'Crux', emcee: 'Emcee', garble: 'Garble', links: 'Links', span: 'Span', dating: 'Dating',
  tally: 'Tally', suds: 'Suds', circa: 'Circa', extra: 'Extra', carve: 'Carve', stet: 'Stet', outwit: 'Outwit',
  tuck: 'Tuck', alibi: 'Alibi', cipher: 'Cipher', ping: 'Ping', warmer: 'Warmer',
  jester: 'Jesters', sworn: 'Sworn', outrank: 'Outrank',
};
// Per-game brand accent (matches the end card / DailyCombinedLeaderboard).
const ACCENTS = { crux: '#2563eb', emcee: '#c026d3', garble: '#b7791f', links: '#166534', span: '#9d174d', dating: '#6d28d9', tally: '#15803d', suds: '#ea580c', circa: '#0e7490', extra: '#b91c1c', carve: '#7c3aed', stet: '#0369a1', outwit: '#1f2937', tuck: '#92400e', alibi: '#8b1e2d', cipher: '#0f766e', ping: '#0284c7', warmer: '#dc2626', jester: '#7c3aed', sworn: '#be185d', outrank: '#4338ca' };
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function etTodayEC() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}
function fmtPts(x) { return x == null ? '' : `${Math.round(Number(x) * 10) / 10} pts`; }
function fmtNum(x) { return x == null ? '' : String(Math.round(Number(x) * 10) / 10); }
function fmtTime(sec) { if (sec == null) return '—'; const m = Math.floor(sec / 60), s = sec % 60; return `${m}:${String(s).padStart(2, '0')}`; }

export default function DailyBoardPanel({ self, quizId = null, maxWidth = 620, streak = null }) {
  const [ident, setIdent] = useState(null);        // { email, username } from localStorage
  const [combined, setCombined] = useState(null);  // /api/quiz/daily-combined payload
  const [gameData, setGameData] = useState(null);  // /api/quiz/daily-game payload (allTime + drops)
  const [sel, setSel] = useState('today');          // 'today' | 'alltime' | 'combined' | 'archive'
  const [open, setOpen] = useState(false);          // is the board area expanded
  const [calMonth, setCalMonth] = useState(() => etTodayEC().slice(0, 7)); // 'YYYY-MM'

  const selfName = GAME_NAMES[self] || self;
  const accent = ACCENTS[self] || BLUE;

  useEffect(() => { try { setIdent(JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null')); } catch (e) {} }, []);

  // The end-game card's "Full leaderboard" / "Leaderboards" buttons dispatch this
  // so we unfurl to the same view the reader was looking at (Today / All-time /
  // Combined / archive), instead of just scrolling to the collapsed tiles.
  useEffect(() => {
    const onOpen = (e) => {
      const v = e && e.detail && e.detail.view;
      const valid = ['today', 'alltime', 'combined', 'archive'];
      if (valid.includes(v)) { setSel(v); setOpen(true); }
      else setOpen(true);
    };
    if (typeof window !== 'undefined') window.addEventListener('sot:open-daily-board', onOpen);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('sot:open-daily-board', onOpen); };
  }, []);

  // Combined board (me + today's per-game boards). Reloads fresh when a game
  // finishes on this page (the end card dispatches sot:daily-updated).
  useEffect(() => {
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    const qs = new URLSearchParams();
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    if (quizId) qs.set('quizId', quizId);
    let alive = true;
    const load = (fresh) => {
      const p = new URLSearchParams(qs);
      if (fresh) { p.set('fresh', '1'); p.set('_', String(Date.now())); }
      fetch('/api/quiz/daily-combined?' + p.toString(), { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => { if (alive && d) setCombined(d); })
        .catch(() => {});
    };
    load(false);
    const onUpdated = () => { if (alive) load(true); };
    if (typeof window !== 'undefined') window.addEventListener('sot:daily-updated', onUpdated);
    return () => { alive = false; if (typeof window !== 'undefined') window.removeEventListener('sot:daily-updated', onUpdated); };
  }, [quizId]);

  // This game's all-time board + drop calendar.
  useEffect(() => {
    if (!self) return undefined;
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    const qs = new URLSearchParams({ game: self, fresh: '1' });
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    let alive = true;
    const load = () => {
      fetch('/api/quiz/daily-game?' + qs.toString(), { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => { if (alive && d) setGameData(d); })
        .catch(() => {});
    };
    load();
    const onUpdated = () => { if (alive) load(); };
    if (typeof window !== 'undefined') window.addEventListener('sot:daily-updated', onUpdated);
    return () => { alive = false; if (typeof window !== 'undefined') window.removeEventListener('sot:daily-updated', onUpdated); };
  }, [self]);

  // --- identity --------------------------------------------------------------
  const username = ident && ident.username ? ident.username : null;
  const registered = !!(ident && ident.email);

  // --- derived figures -------------------------------------------------------
  const me = combined && combined.me ? combined.me : null;
  const guest = combined && combined.meProvisional ? combined.meProvisional : null;
  const games = (combined && combined.games) || [];
  const overallBoard = (combined && combined.overall) || [];
  const todayGame = games.find((g) => g.key === self) || null;
  const allTime = gameData && gameData.allTime ? gameData.allTime : null;
  const drops = (gameData && gameData.drops) || [];

  const myKey = me ? me.userKey : null;
  const provisional = !me && !!guest;

  const gameTodayRank = (me && me.perGame && me.perGame[self] && me.perGame[self].rank)
    || (guest && guest.perGame && guest.perGame[self] && guest.perGame[self].rank) || null;
  const gameTodayField = (todayGame && todayGame.field)
    || (guest && guest.perGame && guest.perGame[self] && guest.perGame[self].field) || null;
  const combinedRank = (me && me.rank) || (guest && guest.rank) || null;
  const combinedField = (combined && typeof combined.overallField === 'number') ? combined.overallField : null;
  const allTimeRank = allTime ? allTime.myRank : null;
  const allTimeField = allTime ? allTime.field : null;
  const allTimeProv = !!(allTime && allTime.provisional);

  const playedCount = drops.filter((d) => d.played).length;
  const totalDrops = drops.length;
  const pct = totalDrops ? Math.round((playedCount / totalDrops) * 100) : null;

  // --- board rows for the condensed views -----------------------------------
  const todayRows = (todayGame && Array.isArray(todayGame.board)) ? todayGame.board : [];
  const allTimeRows = (allTime && Array.isArray(allTime.board)) ? allTime.board : [];
  const combinedRows = Array.isArray(overallBoard) ? overallBoard : [];
  const maxTotal = (combined && combined.maxTotal) || 150;

  // --- calendar month cells --------------------------------------------------
  const dropByISO = useMemo(() => new Map((drops || []).map((d) => [d.dateISO, d])), [drops]);
  const todayISO = etTodayEC();
  const monthYMs = (drops && drops.length)
    ? { earliest: drops[0].dateISO.slice(0, 7), latest: todayISO.slice(0, 7) }
    : { earliest: todayISO.slice(0, 7), latest: todayISO.slice(0, 7) };
  const [calY, calM] = calMonth.split('-').map(Number);
  const monthLabel = `${MONTH_NAMES[(calM - 1) % 12]} ${calY}`;
  const firstWeekday = new Date(Date.UTC(calY, calM - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(calY, calM, 0)).getUTCDate();
  const calCells = [];
  for (let k = 0; k < firstWeekday; k++) calCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calCells.push(d);
  const shiftMonth = (delta) => {
    let y = calY, m = calM + delta;
    while (m < 1) { m += 12; y -= 1; }
    while (m > 12) { m -= 12; y += 1; }
    setCalMonth(`${y}-${String(m).padStart(2, '0')}`);
  };
  const canPrev = calMonth > monthYMs.earliest;
  const canNext = calMonth < monthYMs.latest;

  // Click a tile: select it and open the board. Clicking the selected tile while
  // open collapses; the expand button toggles open without changing selection.
  const clickTile = (id) => {
    if (open && sel === id) { setOpen(false); return; }
    setSel(id); setOpen(true);
  };
  const goRegister = () => {
    if (typeof document === 'undefined') return;
    const el = document.getElementById('daily-join') || document.getElementById('daily-leaderboard');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // A punchy selector tile. `dash` = no rank yet; `big` overrides the numeral
  // (the archive tile shows a percentage).
  const rankTile = (id, label, rank, field, dash, prov, big) => {
    const on = sel === id;
    return (
      <button type="button" key={id} onClick={() => clickTile(id)} aria-expanded={on && open}
        className={`dbp-tile${on ? ' on' : ''}`}
        style={on ? { borderColor: accent, boxShadow: `0 0 0 1px ${accent}` } : undefined}>
        <span className="dbp-accent" style={{ background: on ? accent : '#e2e6ee' }} />
        <div className="dbp-tile-lbl" style={on ? { color: accent } : undefined}>{label}</div>
        <div className="dbp-tile-rk">
          {big != null ? big
            : dash ? <span className="dash">&mdash;</span>
            : rank ? <>#{rank}{prov ? <span className="prov"> prov.</span> : null}</>
            : <span className="dash">&middot;</span>}
        </div>
        <div className="dbp-tile-of">{field ? <>of {field}</> : (dash ? 'registered only' : ' ')}</div>
        <ChevronDown className="dbp-tile-cx" size={14} strokeWidth={2.6} style={{ transform: on && open ? 'rotate(180deg)' : 'none' }} />
      </button>
    );
  };

  const simpleBoard = (rows, valOf, emptyMsg) => {
    if (!rows.length) return <div className="dbp-lbempty">{emptyMsg}</div>;
    return rows.slice(0, 10).map((r, i) => {
      const mine = !!(r.isMe || (myKey && r.userKey === myKey));
      return (
        <div className={`dbp-lbrow${mine ? ' me' : ''}`} key={r.userKey || i}>
          <span className="rk">#{r.rank}</span>
          <span className="nm">{r.username || '—'}{mine ? <span className="you"> (you)</span> : null}</span>
          <span className="vl">{valOf(r)}</span>
        </div>
      );
    });
  };

  return (
    <div id="daily-leaderboard" className="dbp" style={{ maxWidth, margin: '18px auto 26px' }}>
      <style>{`
        .dbp{font-family:${SANS};background:#fff;border:1.5px solid rgba(20,22,28,0.12);border-radius:14px;padding:15px 16px 14px;}
        .dbp-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:13px;}
        .dbp-hd .t{font-size:16px;font-weight:800;letter-spacing:-.01em;color:${INK};display:flex;align-items:center;gap:8px;min-width:0;}
        .dbp-hd .t .av{width:22px;height:22px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;}
        .dbp-hd .t .nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dbp-hd .s{font-family:${MONO};font-size:10.5px;letter-spacing:.04em;color:${FADED};font-weight:500;white-space:nowrap;flex-shrink:0;}
        .dbp-signup{display:inline-flex;align-items:center;gap:6px;font-family:${SANS};font-size:12px;font-weight:800;color:${BLUE};background:#eff4fd;border:1px solid #cfe0fb;border-radius:999px;padding:6px 12px;cursor:pointer;white-space:nowrap;flex-shrink:0;}
        .dbp-signup:hover{background:#e4eefc;}
        .dbp-streak{font-family:${SANS};font-size:11.5px;font-weight:600;color:${SLATE};white-space:nowrap;flex-shrink:0;}
        .dbp-streak b{font-weight:800;color:${INK};}
        .dbp-streak .best{color:${FADED};}

        .dbp-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;}
        .dbp-tile{position:relative;overflow:hidden;text-align:left;border:1px solid ${BORD};background:#f7f8fa;border-radius:12px;padding:12px 12px 11px;min-width:0;cursor:pointer;font-family:${SANS};display:block;transition:background .12s ease,border-color .12s ease;}
        .dbp-tile:hover{background:#fff;border-color:#cfd6e2;}
        .dbp-tile.on{background:#fff;}
        .dbp-accent{position:absolute;left:0;top:0;bottom:0;width:3px;}
        .dbp-tile-lbl{font-family:${MONO};font-size:9.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${SLATE};padding-right:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        /* Rank number and "of N" share ONE baseline-aligned line (of N to the
           right of the number) to reclaim vertical space and fill the tile width. */
        .dbp-tile-rk{font-size:27px;font-weight:900;letter-spacing:-.03em;color:${INK};line-height:1.05;margin-top:4px;font-variant-numeric:tabular-nums;display:inline-block;vertical-align:baseline;}
        .dbp-tile-rk .prov{font-size:11px;font-weight:700;color:${FADED};}
        .dbp-tile-rk .dash{color:#c2c8d2;}
        .dbp-tile-of{font-size:11px;color:${FADED};display:inline-block;vertical-align:baseline;margin-left:6px;}
        .dbp-tile-cx{position:absolute;top:11px;right:9px;color:${SLATE};transition:transform .15s ease;pointer-events:none;}

        .dbp-board{border:1px solid ${BORD};border-radius:12px;padding:11px 13px 10px;margin-top:11px;background:#fff;}
        .dbp-board.plain{padding:0;border:none;}
        .dbp-board-ti{font-family:${MONO};font-size:10px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:${SLATE};margin-bottom:7px;}
        .dbp-lbrow{display:flex;align-items:center;gap:9px;font-size:13.5px;padding:6px 8px;border-radius:8px;}
        .dbp-lbrow.me{background:#eff4fd;}
        .dbp-lbrow .rk{font-family:${MONO};font-size:11.5px;color:${FADED};width:30px;flex-shrink:0;}
        .dbp-lbrow .nm{font-weight:700;color:${INK};min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;}
        .dbp-lbrow .nm .you{color:${BLUE};font-weight:800;}
        .dbp-lbrow.me .nm{font-weight:800;}
        .dbp-lbrow .vl{font-family:${MONO};font-size:12px;color:${SLATE};flex-shrink:0;}
        .dbp-lbrow .vl .u{color:#9aa0ab;}
        .dbp-lbempty{font-size:12.5px;color:${FADED};padding:6px 2px;}

        /* Today board: richer per-attempt detail (score / time / mistakes / pts) */
        .dbp-g{display:grid;grid-template-columns:30px 1fr 52px 54px 46px 46px;gap:8px;align-items:center;}
        .dbp-gh{padding:0 8px 7px;}
        .dbp-gh .h{font-family:${MONO};font-size:9px;letter-spacing:.09em;text-transform:uppercase;color:${FADED};}
        .dbp-grow{padding:7px 8px;border-radius:8px;}
        .dbp-grow.me{background:#eff4fd;}
        .dbp-g .rk{font-family:${MONO};font-size:11.5px;color:${FADED};}
        .dbp-g .nm{font-weight:700;color:${INK};font-size:13.5px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dbp-g .nm .you{color:${BLUE};font-weight:800;}
        .dbp-g .num{font-family:${MONO};font-size:11.5px;color:${SLATE};text-align:right;font-variant-numeric:tabular-nums;}
        .dbp-g .pts{font-weight:800;color:${INK};text-align:right;font-variant-numeric:tabular-nums;font-size:13px;}
        @media(max-width:520px){
          .dbp-g{grid-template-columns:26px 1fr 46px 44px;}
          .dbp-ctime,.dbp-cmiss{display:none;}
        }

        .dbp-cal-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;}
        .dbp-cal-mo{font-size:14px;font-weight:800;color:${INK};}
        .dbp-cal-nav{display:flex;gap:6px;}
        .dbp-cal-nav button{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid ${BORD};background:#fff;color:${SLATE};cursor:pointer;}
        .dbp-cal-nav button:disabled{opacity:.4;cursor:default;}
        .dbp-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;}
        .dbp-cal-wd{font-family:${MONO};font-size:9.5px;color:${FADED};text-align:center;padding-bottom:2px;}
        .dbp-cal-cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border-radius:8px;color:#c2c8d2;}
        .dbp-cal-cell.empty{background:transparent;}
        .dbp-cal-cell.none{color:#c9cdd6;}
        a.dbp-cal-cell{text-decoration:none;}
        a.dbp-cal-cell.played{background:#e8f5ec;color:#15803d;border:1px solid #bfe3ca;}
        a.dbp-cal-cell.unplayed{background:#fff;color:${SLATE};border:1px solid ${BORD};}
        a.dbp-cal-cell.unplayed:hover{border-color:${BLUE};color:${BLUE};}
        a.dbp-cal-cell.today{box-shadow:0 0 0 2px ${BLUE};}
        .dbp-cal-key{display:flex;flex-wrap:wrap;gap:10px 14px;margin-top:10px;font-size:11px;color:${FADED};}
        .dbp-cal-key span{display:inline-flex;align-items:center;gap:5px;}
        .dbp-cal-sw{width:11px;height:11px;border-radius:3px;flex-shrink:0;}

        .dbp-full{width:100%;margin-top:11px;padding:9px 12px;border-radius:10px;cursor:pointer;font-family:${SANS};font-size:12.5px;font-weight:800;color:${BLUE};background:transparent;border:1.5px solid #cddffb;display:inline-flex;align-items:center;justify-content:center;gap:5px;}
        .dbp-full:hover{background:#f5f8ff;}

        @media(max-width:480px){
          .dbp-tiles{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;}
          .dbp-tile{padding:11px 11px 10px;}
          .dbp-tile-lbl{font-size:9px;letter-spacing:.04em;padding-right:16px;}
          .dbp-tile-rk{font-size:24px;}
          .dbp-hd .t{font-size:15px;}
        }
      `}</style>

      <div className="dbp-hd">
        <span className="t">
          {registered && username ? <span className="av" style={{ background: accent }}>{String(username).slice(0, 1).toUpperCase()}</span> : null}
          <span className="nm">{registered && username ? `${username} Stats` : 'Your Stats'}</span>
        </span>
        {registered
          ? (streak ? <span className="dbp-streak">Current {selfName} streak: <b>{streak.current || 0}</b> <span className="best">({streak.best || 0} best)</span></span> : null)
          : <button type="button" className="dbp-signup" onClick={goRegister}><UserPlus size={13} strokeWidth={2.4} /> Sign up</button>}
      </div>

      <div className="dbp-tiles">
        {rankTile('today', 'Today', gameTodayRank, gameTodayField, false, provisional)}
        {rankTile('alltime', 'All-time', allTimeRank, allTimeField, !(allTime && allTime.myRank != null), allTimeProv)}
        {rankTile('combined', 'Combined Today', combinedRank, combinedField, false, provisional)}
        {rankTile('archive', `${selfName} Archive`, null, null, false, false, (pct == null ? <span className="dash">&mdash;</span> : `${pct}%`))}
      </div>

      {open ? (
        <div className="dbp-board">
          {sel === 'today' ? (
            <>
              <div className="dbp-board-ti">{selfName} &middot; today &middot; top 10</div>
              {todayRows.length ? (
                <>
                  <div className="dbp-g dbp-gh">
                    <span className="h">#</span>
                    <span className="h">Player</span>
                    <span className="h" style={{ textAlign: 'right' }}>Score</span>
                    <span className="h dbp-ctime" style={{ textAlign: 'right' }}>Time</span>
                    <span className="h dbp-cmiss" style={{ textAlign: 'right' }}>Miss</span>
                    <span className="h" style={{ textAlign: 'right' }}>Pts</span>
                  </div>
                  {todayRows.slice(0, 10).map((r, i) => {
                    const mine = !!(myKey && r.userKey === myKey);
                    return (
                      <div className={`dbp-g dbp-grow${mine ? ' me' : ''}`} key={r.userKey || i}>
                        <span className="rk">#{r.rank}</span>
                        <span className="nm">{r.username || '—'}{mine ? <span className="you"> (you)</span> : null}</span>
                        <span className="num">{r.score}/{r.total}</span>
                        <span className="num dbp-ctime">{fmtTime(r.timeElapsed)}</span>
                        <span className="num dbp-cmiss">{r.guessesUsed == null ? '—' : r.guessesUsed}</span>
                        <span className="pts">{fmtNum(r.points)}</span>
                      </div>
                    );
                  })}
                </>
              ) : <div className="dbp-lbempty">No board yet. Be the first to post a score.</div>}
            </>
          ) : null}

          {sel === 'alltime' ? (
            <>
              <div className="dbp-board-ti">{selfName} &middot; all-time &middot; top 10</div>
              {simpleBoard(allTimeRows, (r) => fmtPts(r.points), 'No all-time scores yet. Play a drop to get on the board.')}
            </>
          ) : null}

          {sel === 'combined' ? (
            <>
              <div className="dbp-board-ti">Combined today &middot; top 10{combined && combined.gameCount > 1 ? <> &middot; best {combined.bestN} of {combined.gameCount} &middot; {maxTotal} pts</> : null}</div>
              {simpleBoard(combinedRows, (r) => <>{fmtNum(r.total)}<span className="u">/{maxTotal}</span></>, 'No combined scores yet. Play a game to get on the board.')}
            </>
          ) : null}

          {sel === 'archive' ? (
            drops && drops.length ? (
              <>
                <div className="dbp-cal-hd">
                  <span className="dbp-cal-mo">{monthLabel}</span>
                  <div className="dbp-cal-nav">
                    <button type="button" onClick={() => shiftMonth(-1)} disabled={!canPrev} aria-label="Previous month"><ChevronLeft size={16} strokeWidth={2.4} /></button>
                    <button type="button" onClick={() => shiftMonth(1)} disabled={!canNext} aria-label="Next month"><ChevronRight size={16} strokeWidth={2.4} /></button>
                  </div>
                </div>
                <div className="dbp-cal-grid">
                  {WEEKDAYS.map((w, i) => <div className="dbp-cal-wd" key={`wd${i}`}>{w}</div>)}
                  {calCells.map((d, i) => {
                    if (d == null) return <div className="dbp-cal-cell empty" key={`e${i}`} />;
                    const iso = `${calMonth}-${String(d).padStart(2, '0')}`;
                    const drop = dropByISO.get(iso);
                    const isToday = iso === todayISO;
                    if (!drop) return <div className={`dbp-cal-cell none${isToday ? ' today' : ''}`} key={iso}>{d}</div>;
                    const cls = drop.played ? 'played' : 'unplayed';
                    return <a className={`dbp-cal-cell ${cls}${isToday ? ' today' : ''}`} href={drop.href} key={iso} title={drop.played ? 'Played' : 'Play this drop'}>{d}</a>;
                  })}
                </div>
                <div className="dbp-cal-key">
                  <span><span className="dbp-cal-sw" style={{ background: '#e8f5ec', border: '1px solid #bfe3ca' }} />Played</span>
                  <span><span className="dbp-cal-sw" style={{ background: '#fff', border: `1px solid ${BORD}` }} />Unplayed</span>
                  <span><span className="dbp-cal-sw" style={{ background: '#fff', boxShadow: `0 0 0 2px ${BLUE}` }} />Today</span>
                </div>
              </>
            ) : <div className="dbp-lbempty">No archive of {selfName} games yet.</div>
          ) : null}
        </div>
      ) : null}

      <button type="button" className="dbp-full" onClick={() => { if (open) { setOpen(false); } else { setSel('today'); setOpen(true); } }} aria-expanded={open}>
        {open ? 'Hide leaderboard' : 'Show leaderboard'}
        <ChevronDown size={14} strokeWidth={2.6} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s ease' }} />
      </button>
    </div>
  );
}
