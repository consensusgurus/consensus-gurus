'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import DailyCombinedLeaderboard from './DailyCombinedLeaderboard';

// DailyBoardPanel — the on-page daily-leaderboard section, in the light page
// theme, placed directly under the Challenge / Share actions on every daily-game
// page. Collapsed by default: a header plus four rank tiles that mirror the
// end-of-game card —
//   1. <Game> Today      — my rank of today's per-game field
//   2. <Game> All-time    — my rank of the game's cumulative field
//   3. Combined Today     — my rank of today's combined (best-5) board
//   4. <Game> Archive     — % of this game's drops I've completed
// Each of the first three expands in place to its top-10 board; the fourth
// expands to the game's drop calendar. A "Show full standings" button reveals
// the complete tabbed DailyCombinedLeaderboard (with a per-game Today/All-time
// toggle) inline below.
//
// Self-contained: fetches /api/quiz/daily-combined (me + combined + today's
// per-game boards) and /api/quiz/daily-game (this game's all-time board + drop
// calendar), using the identity the quiz client stores in localStorage — the
// same two endpoints the end card reads, so the two surfaces always agree.
//
// Props: `self` (game key, e.g. "dating"), `quizId` (scopes the combined fetch
// to this puzzle/date), `maxWidth` (defaults 620 to match the page column).

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
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function etTodayEC() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}
function fmtPts(x) { return x == null ? '' : `${Math.round(Number(x) * 10) / 10} pts`; }

export default function DailyBoardPanel({ self, quizId = null, maxWidth = 620 }) {
  const [combined, setCombined] = useState(null); // /api/quiz/daily-combined payload
  const [gameData, setGameData] = useState(null); // /api/quiz/daily-game payload (allTime + drops)
  const [openTile, setOpenTile] = useState(null);  // 'today' | 'alltime' | 'combined' | 'calendar' | null
  const [showFull, setShowFull] = useState(false);
  const [calMonth, setCalMonth] = useState(() => etTodayEC().slice(0, 7)); // 'YYYY-MM'

  const selfName = GAME_NAMES[self] || self;

  // Combined board (me + today's per-game boards). Re-polls quietly and reloads
  // fresh when a game finishes on this page (the end card dispatches the event).
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

  // --- expanded top-10 rows for a board tile --------------------------------
  function tileRows(which) {
    if (which === 'today') {
      const rows = (todayGame && Array.isArray(todayGame.board)) ? todayGame.board : [];
      return rows.map((r) => ({ rank: r.rank, name: r.username, val: fmtPts(r.points), me: !!(myKey && r.userKey === myKey) }));
    }
    if (which === 'combined') {
      const rows = Array.isArray(overallBoard) ? overallBoard : [];
      return rows.map((r) => ({ rank: r.rank, name: r.username, val: fmtPts(r.total), me: !!(myKey && r.userKey === myKey) }));
    }
    if (which === 'alltime') {
      const rows = (allTime && Array.isArray(allTime.board)) ? allTime.board : [];
      return rows.map((r) => ({ rank: r.rank, name: r.username, val: fmtPts(r.points), me: !!r.isMe }));
    }
    return [];
  }

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

  const toggleTile = (id) => setOpenTile((o) => (o === id ? null : id));

  // A rank tile (Today / All-time / Combined). `dash` = no rank yet.
  const renderRankTile = (id, label, rank, field, dash, prov) => (
    <button type="button" className={`dbp-tile${openTile === id ? ' open' : ''}`} onClick={() => toggleTile(id)} aria-expanded={openTile === id} key={id}>
      <div className="dbp-tile-lbl">{label}</div>
      {dash ? (
        <div className="dbp-tile-rk"><span className="dash">&mdash;</span></div>
      ) : rank ? (
        <div className="dbp-tile-rk">#{rank}{prov ? <span className="prov"> prov.</span> : null}</div>
      ) : (
        <div className="dbp-tile-rk"><span className="dash">&middot;</span></div>
      )}
      <div className="dbp-tile-of">{field ? <>of {field}</> : (dash ? 'registered only' : ' ')}</div>
      <ChevronDown className="dbp-tile-cx" size={15} strokeWidth={2.4} style={{ transform: openTile === id ? 'rotate(180deg)' : 'none' }} />
    </button>
  );

  const subtitle = combined
    ? (combined.gameCount > 1 ? `Best ${combined.bestN} of ${combined.gameCount} · ${combined.maxTotal || 75} pts` : `${combined.maxTotal || 75} pts max`)
    : ' ';

  return (
    <div id="daily-leaderboard" className="dbp" style={{ maxWidth, margin: '18px auto 0' }}>
      <style>{`
        .dbp{font-family:${SANS};background:#fff;border:1.5px solid rgba(20,22,28,0.12);border-radius:12px;padding:15px 16px 13px;}
        .dbp-hd{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:12px;}
        .dbp-hd .t{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${SLATE};font-weight:800;}
        .dbp-hd .s{font-size:11px;letter-spacing:.04em;color:${FADED};font-weight:600;}
        .dbp-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;}
        .dbp-tile{position:relative;text-align:left;border:1px solid ${BORD};background:#f7f8fa;border-radius:12px;padding:11px 11px 10px;min-width:0;cursor:pointer;font-family:${SANS};display:block;}
        .dbp-tile:hover{border-color:#cfd6e2;}
        .dbp-tile.open{border-color:${BLUE};box-shadow:0 0 0 1px ${BLUE};background:#fff;}
        .dbp-tile-lbl{font-family:${MONO};font-size:9.5px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:${SLATE};padding-right:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .dbp-tile-rk{font-size:22px;font-weight:800;letter-spacing:-.02em;color:${INK};line-height:1.15;margin-top:3px;}
        .dbp-tile-rk .prov{font-size:10.5px;font-weight:700;color:${FADED};}
        .dbp-tile-rk .dash{color:#c2c8d2;}
        .dbp-tile-of{font-size:11px;color:${FADED};margin-top:1px;}
        .dbp-tile-cx{position:absolute;top:9px;right:8px;color:${SLATE};transition:transform .15s ease;pointer-events:none;}

        .dbp-exp{border:1px solid ${BORD};border-radius:12px;padding:11px 13px 9px;margin-top:10px;background:#fff;}
        .dbp-exp-hd{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:6px;}
        .dbp-exp-ti{font-family:${MONO};font-size:10px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:${SLATE};}
        .dbp-lbrow{display:flex;align-items:center;gap:9px;font-size:13px;padding:5px 7px;border-radius:7px;}
        .dbp-lbrow.me{background:#eff4fd;}
        .dbp-lbrow .rk{font-family:${MONO};font-size:11px;color:${FADED};width:26px;flex-shrink:0;}
        .dbp-lbrow .nm{font-weight:700;color:${INK};min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;}
        .dbp-lbrow.me .nm{font-weight:800;}
        .dbp-lbrow .vl{font-family:${MONO};font-size:11.5px;color:${SLATE};flex-shrink:0;}
        .dbp-lbempty{font-size:12.5px;color:${FADED};padding:6px 2px;}

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
        .dbp-fullbox{margin-top:12px;padding-top:14px;border-top:1px solid ${BORD};}

        @media(max-width:480px){
          .dbp-tiles{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;}
          .dbp-tile{padding:10px 10px 9px;}
          .dbp-tile-lbl{font-size:9px;letter-spacing:.04em;padding-right:16px;}
          .dbp-tile-rk{font-size:20px;}
        }
      `}</style>

      <div className="dbp-hd">
        <span className="t">Daily Leaderboard</span>
        <span className="s">{subtitle}</span>
      </div>

      <div className="dbp-tiles">
        {renderRankTile('today', `${selfName} Today`, gameTodayRank, gameTodayField, false, provisional)}
        {renderRankTile('alltime', `${selfName} All-Time`, allTimeRank, allTimeField, !(allTime && allTime.myRank != null), allTimeProv)}
        {renderRankTile('combined', 'Combined Today', combinedRank, combinedField, false, provisional)}
        {/* archive / % complete tile */}
        <button type="button" className={`dbp-tile${openTile === 'calendar' ? ' open' : ''}`} onClick={() => toggleTile('calendar')} aria-expanded={openTile === 'calendar'}>
          <div className="dbp-tile-lbl">{selfName} Archive</div>
          <div className="dbp-tile-rk">{pct == null ? <span className="dash">&mdash;</span> : <>{pct}%</>}</div>
          <div className="dbp-tile-of">{totalDrops ? <>{playedCount}/{totalDrops} played</> : ' '}</div>
          <ChevronDown className="dbp-tile-cx" size={15} strokeWidth={2.4} style={{ transform: openTile === 'calendar' ? 'rotate(180deg)' : 'none' }} />
        </button>
      </div>

      {/* board tile expansion */}
      {(openTile === 'today' || openTile === 'alltime' || openTile === 'combined') ? (() => {
        const rows = tileRows(openTile);
        const ti = openTile === 'today' ? `${selfName} · today`
          : openTile === 'alltime' ? `${selfName} · all-time`
          : 'Combined · today';
        return (
          <div className="dbp-exp">
            <div className="dbp-exp-hd"><span className="dbp-exp-ti">{ti} &middot; top 10</span></div>
            {rows.length ? rows.map((r, i) => (
              <div className={`dbp-lbrow${r.me ? ' me' : ''}`} key={i}>
                <span className="rk">#{r.rank}</span>
                <span className="nm">{r.name || '—'}</span>
                <span className="vl">{r.val}</span>
              </div>
            )) : <div className="dbp-lbempty">No board yet. Be the first to post a score.</div>}
          </div>
        );
      })() : null}

      {/* calendar expansion */}
      {openTile === 'calendar' ? (
        <div className="dbp-exp">
          {drops && drops.length ? (
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
          ) : <div className="dbp-lbempty">No archive of {selfName} games yet.</div>}
        </div>
      ) : null}

      {/* full standings (tabbed board with per-game Today/All-time toggle) */}
      <button type="button" className="dbp-full" onClick={() => setShowFull((v) => !v)} aria-expanded={showFull}>
        {showFull ? 'Hide full standings' : 'Show full standings & every game'}
        <ChevronDown size={14} strokeWidth={2.6} style={{ transform: showFull ? 'rotate(180deg)' : 'none', transition: 'transform .15s ease' }} />
      </button>
      {showFull ? (
        <div className="dbp-fullbox">
          <DailyCombinedLeaderboard todayKey={self} quizId={quizId} light allTimeToggle embedded />
        </div>
      ) : null}
    </div>
  );
}
