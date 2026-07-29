'use client';

// The expanded state of a daily-puzzle tile on the quiz home board (owner
// request, 2026-07-29). It OVERLAYS the tile grid rather than being inserted
// into it, so the board's height never changes and nothing on the page moves.
// DailyStrip renders it absolutely inside .dh-boardwrap.
//
// FILL DISCIPLINE (owner, 2026-07-29: "make sure it fills the space very
// cleanly"): the panel is a flex column pinned to all four edges of the board
// body. The header is fixed height, the three columns take every remaining
// pixel, and inside each column the content STRETCHES to the bottom rather than
// stacking at the top and leaving a gap: the stat rows distribute with
// space-between, the calendar weeks are 1fr each so the month fills its column,
// and the leaderboard rows share the leftover height. Nothing scrolls and
// nothing floats in dead space at any board size.
//
// What it shows: identity plus a one-sentence how-to-play (roster field `how` in
// lib/daily-games.js), a large Play button and an equally obvious close, today's
// record, the viewer's all-time record for the game, archive completion, streak
// detail, community size, a month calendar of the archive, and the game's
// all-time leaderboard. Everything past "today" comes from ONE lazy fetch of
// /api/quiz/daily-game, cached per game by the parent.

import React, { useEffect, useMemo, useState } from 'react';
import { Play, X, Flame, Crown, ChevronLeft, ChevronRight, CalendarDays, Trophy } from 'lucide-react';
import { DAILY_GAME_MAP } from '../lib/daily-games';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const CAL_WD = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function etTodayISO() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}
function fmtPts(x) { const v = Math.round(Number(x) * 10) / 10; return Number.isInteger(v) ? String(v) : v.toFixed(1); }

export default function DailyTilePanel({
  game, accent, isDone = false, inProgress = false, streak = 0,
  todayRow = null, todayField = null, standings = [], meKey = null,
  data = null, onClose,
}) {
  const todayISO = etTodayISO();
  const how = (DAILY_GAME_MAP[game.key] && DAILY_GAME_MAP[game.key].how) || game.tag;

  const drops = (data && Array.isArray(data.drops)) ? data.drops : [];
  const allTime = (data && data.allTime) || null;
  const mine = (data && data.mine) || null;
  const loading = !data;

  const [calMonth, setCalMonth] = useState(() => todayISO.slice(0, 7));
  useEffect(() => { setCalMonth(todayISO.slice(0, 7)); }, [game.key, todayISO]);

  // Esc closes, matching the Close button.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const dropByISO = useMemo(() => new Map(drops.map((d) => [d.dateISO, d])), [drops]);
  const earliestYM = drops.length ? drops[0].dateISO.slice(0, 7) : todayISO.slice(0, 7);
  const latestYM = todayISO.slice(0, 7);
  const [calY, calM] = calMonth.split('-').map(Number);
  const firstWeekday = new Date(Date.UTC(calY, calM - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(calY, calM, 0)).getUTCDate();
  const cells = [];
  for (let k = 0; k < firstWeekday; k++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);
  const weeks = Math.max(1, cells.length / 7);
  const shiftMonth = (delta) => {
    let y = calY, m = calM + delta;
    while (m < 1) { m += 12; y -= 1; }
    while (m > 12) { m -= 12; y += 1; }
    setCalMonth(y + '-' + String(m).padStart(2, '0'));
  };

  const todayScore = todayRow
    ? (todayRow.total != null && Number(todayRow.total) > 0
      ? fmtPts(todayRow.score) + '/' + fmtPts(todayRow.total)
      : (todayRow.score != null ? fmtPts(todayRow.score) : fmtPts(todayRow.points)))
    : null;
  const beatPct = (todayRow && todayField > 0)
    ? Math.max(0, Math.round(((todayField - todayRow.rank) / todayField) * 100)) : null;

  const totalDrops = drops.length;
  const playedCount = mine ? mine.plays : drops.filter((d) => d.played).length;
  const archivePct = totalDrops ? Math.round((playedCount / totalDrops) * 100) : null;
  const longest = mine ? Math.max(mine.longestStreak || 0, streak || 0) : streak;
  const dash = loading ? '·' : '—';

  const board = (allTime && Array.isArray(allTime.board)) ? allTime.board.slice(0, 5) : [];
  const meOnBoard = board.some((r) => r.isMe);
  const myRank = allTime && allTime.myRank;

  return (
    <div className="dtp" style={{ '--gc': accent }} role="region" aria-label={game.name + ' details'}>
      <div className="dtp-hd">
        <span className="dtp-ic"><img src={game.img} alt="" aria-hidden="true" /></span>
        <div className="dtp-idt">
          <div className="dtp-nm">
            {game.name}
            {streak >= 2 ? <span className="dtp-flame"><Flame size={12} strokeWidth={2.6} />{streak}</span> : null}
            {isDone ? <span className="dtp-donechip">Done today</span> : null}
          </div>
          <p className="dtp-how">{how}</p>
        </div>
        <div className="dtp-acts">
          <a href={game.href} className="dtp-play">
            <Play size={15} fill="#1c1e24" strokeWidth={0} />
            {isDone ? 'Play again' : (inProgress ? 'Resume' : 'Play')}
          </a>
          <button type="button" className="dtp-shrink" onClick={onClose}><X size={14} strokeWidth={2.6} />Close</button>
        </div>
      </div>

      <div className="dtp-grid">
        <section className="dtp-col">
          <div className="dtp-lab">Your record</div>
          <div className="dtp-stats">
            <div><b>{todayScore || (isDone ? 'Done' : '—')}</b><span>Today</span></div>
            <div><b>{todayRow && todayRow.rank ? '#' + todayRow.rank : '—'}</b><span>Rank today</span></div>
            <div><b>{streak || '—'}</b><span>Streak</span></div>
            <div><b>{loading ? dash : (myRank ? '#' + myRank : '—')}</b><span>All-time rank</span></div>
          </div>
          <div className="dtp-rows">
            <div className="dtp-row"><span>Archive played</span><b>{loading ? dash : playedCount + ' of ' + totalDrops + (archivePct != null ? ' · ' + archivePct + '%' : '')}</b></div>
            <div className="dtp-row"><span>Best day</span><b>{loading ? dash : (mine && mine.bestPoints != null ? fmtPts(mine.bestPoints) + ' pts' : '—')}</b></div>
            <div className="dtp-row"><span>Average day</span><b>{loading ? dash : (mine && mine.avgPoints != null ? fmtPts(mine.avgPoints) + ' pts' : '—')}</b></div>
            <div className="dtp-row"><span>Longest streak</span><b>{loading ? dash : (longest ? longest + ' day' + (longest === 1 ? '' : 's') : '—')}</b></div>
            <div className="dtp-row"><span>Players all-time</span><b>{loading ? dash : ((allTime && allTime.plays != null) ? allTime.plays.toLocaleString() : '—')}</b></div>
            <div className="dtp-row"><span>Playing today</span><b>{todayField != null ? todayField.toLocaleString() : '—'}</b></div>
            {beatPct != null ? <div className="dtp-row beat"><span>Today you beat</span><b>{beatPct}% of players</b></div> : null}
          </div>
        </section>

        <section className="dtp-col">
          <div className="dtp-lab"><CalendarDays size={12} strokeWidth={2.4} />Archive</div>
          <div className="dtp-calhd">
            <button type="button" onClick={() => shiftMonth(-1)} disabled={calMonth <= earliestYM} aria-label="Previous month"><ChevronLeft size={15} strokeWidth={2.6} /></button>
            <span className="dtp-mo">{MONTH_NAMES[(calM - 1) % 12]} {calY}</span>
            <button type="button" onClick={() => shiftMonth(1)} disabled={calMonth >= latestYM} aria-label="Next month"><ChevronRight size={15} strokeWidth={2.6} /></button>
          </div>
          <div className="dtp-wd">{CAL_WD.map((w, i) => <span key={'w' + i}>{w}</span>)}</div>
          <div className="dtp-cal" style={{ gridTemplateRows: 'repeat(' + weeks + ', minmax(0, 1fr))' }}>
            {cells.map((d, i) => {
              if (d === null) return <span key={'e' + i} className="dtp-cell empty" />;
              const iso = calY + '-' + String(calM).padStart(2, '0') + '-' + String(d).padStart(2, '0');
              const drop = dropByISO.get(iso);
              if (!drop) return <span key={iso} className="dtp-cell none">{d}</span>;
              const cls = 'dtp-cell' + (drop.played ? ' played' : ' open') + (drop.isToday ? ' today' : '');
              return <a key={iso} href={drop.href} className={cls} title={drop.played ? 'Played' : 'Not played yet'}>{d}</a>;
            })}
          </div>
          <div className="dtp-key">
            <span><i className="sw played" />Played</span>
            <span><i className="sw open" />Open</span>
            <span><i className="sw today" />Today</span>
          </div>
        </section>

        <section className="dtp-col">
          <div className="dtp-lab"><Trophy size={12} strokeWidth={2.4} />All-time leaderboard</div>
          <div className="dtp-lb">
            {loading ? (
              <div className="dtp-empty">Loading standings…</div>
            ) : board.length ? (
              <>
                {board.map((r, i) => (
                  <div key={r.userKey || i} className={'dtp-lrow' + (r.isMe ? ' me' : '')}>
                    <span className="pl">{r.rank === 1 ? <Crown size={12} /> : r.rank}</span>
                    <b>{r.username || 'Player'}{r.isMe ? ' (you)' : ''}</b>
                    <span className="sc">{fmtPts(r.points)}</span>
                  </div>
                ))}
                {myRank && !meOnBoard ? (
                  <div className="dtp-lrow me">
                    <span className="pl">{myRank}</span>
                    <b>You{allTime && allTime.provisional ? ' (prov.)' : ''}</b>
                    <span className="sc">{allTime.myPoints != null ? fmtPts(allTime.myPoints) : '—'}</span>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="dtp-empty">No all-time standings yet. Be the first.</div>
            )}
          </div>
          {standings && standings.length ? (
            <>
              <div className="dtp-lab sm">Today&rsquo;s top</div>
              <div className="dtp-lb">
                {standings.slice(0, 3).map((r, i) => {
                  const mineRow = meKey && r.userKey === meKey;
                  return (
                    <div key={'t' + (r.userKey || i)} className={'dtp-lrow' + (mineRow ? ' me' : '')}>
                      <span className="pl">{r.rank || i + 1}</span>
                      <b>{r.username || 'Player'}{mineRow ? ' (you)' : ''}</b>
                      <span className="sc">{fmtPts(r.points)}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
          <div className="dtp-lfoot">
            {allTime && allTime.field ? allTime.field.toLocaleString() + ' ranked' : ''}
            <a href="/daily">Full standings →</a>
          </div>
        </section>
      </div>

      <style>{`
        .dtp{position:absolute;inset:0;z-index:6;background:#0e1d40;border-radius:0 0 13px 13px;color:#eef3fb;
             padding:14px 16px 13px;display:flex;flex-direction:column;gap:12px;overflow:hidden;
             font-family:'Manrope',system-ui,-apple-system,sans-serif;animation:dtpIn .16s ease-out;}
        @keyframes dtpIn{from{opacity:0;transform:scale(.99);}to{opacity:1;transform:none;}}
        .dtp-hd{display:flex;align-items:flex-start;gap:13px;flex:none;}
        .dtp-ic{flex:none;width:50px;height:50px;border-radius:12px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;}
        .dtp-ic img{height:32px;width:auto;max-width:42px;object-fit:contain;}
        .dtp-idt{flex:1;min-width:0;}
        .dtp-nm{font-size:22px;font-weight:800;letter-spacing:-.3px;display:flex;align-items:center;gap:9px;flex-wrap:wrap;line-height:1.1;}
        .dtp-flame{display:inline-flex;align-items:center;gap:3px;background:rgba(232,180,58,0.16);border:1px solid rgba(232,180,58,0.42);border-radius:999px;padding:1px 8px;font-size:11.5px;font-weight:800;color:#e8b43a;}
        .dtp-donechip{display:inline-flex;background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.4);border-radius:999px;padding:1px 9px;font-size:11px;font-weight:800;color:#6ee7b7;}
        .dtp-how{font-size:12.5px;line-height:1.4;color:#c3d2e8;font-weight:600;margin:4px 0 0;max-width:64ch;}
        .dtp-acts{flex:none;display:flex;align-items:center;gap:8px;}
        .dtp-play{display:inline-flex;align-items:center;justify-content:center;gap:7px;background:#e8b43a;color:#1c1e24;font-weight:800;font-size:15px;
                  border-radius:10px;padding:12px 24px;text-decoration:none;border:none;cursor:pointer;transition:background .12s,transform .12s;}
        .dtp-play:hover{background:#f0c358;transform:translateY(-1px);}
        .dtp-shrink{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid #2a4166;background:transparent;color:#c3d2e8;
                    font-weight:700;font-size:12.5px;border-radius:10px;padding:12px 14px;cursor:pointer;font-family:inherit;transition:background .12s,color .12s;}
        .dtp-shrink:hover{background:rgba(255,255,255,0.07);color:#fff;}
        /* three columns take every remaining pixel */
        .dtp-grid{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:1.05fr .95fr .95fr;gap:20px;}
        .dtp-col{min-width:0;min-height:0;display:flex;flex-direction:column;}
        .dtp-lab{display:flex;align-items:center;gap:6px;font-family:'DM Mono',ui-monospace,monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#6c7e9b;font-weight:500;margin-bottom:8px;flex:none;}
        .dtp-lab.sm{margin-top:10px;}
        .dtp-lab svg{color:var(--gc);}
        .dtp-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:none;}
        .dtp-stats>div{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:7px 10px;}
        .dtp-stats b{display:block;font-size:18px;font-weight:800;line-height:1.15;font-variant-numeric:tabular-nums;}
        .dtp-stats span{font-family:'DM Mono',ui-monospace,monospace;font-size:8.5px;letter-spacing:.06em;text-transform:uppercase;color:#6c7e9b;margin-top:2px;display:block;}
        /* the rows stretch to the bottom of the column instead of bunching at the top */
        .dtp-rows{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;justify-content:space-between;margin-top:9px;}
        .dtp-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:3px 0;border-bottom:1px solid #1e3050;font-size:12px;}
        .dtp-row:last-child{border-bottom:none;}
        .dtp-row span{color:#93a3bd;font-weight:600;}
        .dtp-row b{color:#fff;font-weight:700;font-variant-numeric:tabular-nums;text-align:right;}
        .dtp-row.beat b{color:#6ee7b7;}
        .dtp-calhd{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;flex:none;}
        .dtp-mo{font-size:13px;font-weight:800;}
        .dtp-calhd button{width:25px;height:25px;display:flex;align-items:center;justify-content:center;border-radius:7px;border:1px solid #2a4166;background:transparent;color:#c3d2e8;cursor:pointer;}
        .dtp-calhd button:hover:not(:disabled){background:rgba(255,255,255,0.08);color:#fff;}
        .dtp-calhd button:disabled{opacity:.3;cursor:default;}
        .dtp-wd{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;flex:none;margin-bottom:3px;}
        .dtp-wd span{font-family:'DM Mono',ui-monospace,monospace;font-size:9px;color:#6c7e9b;text-align:center;}
        /* the month fills the column: each week row is an equal share of the height */
        .dtp-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;flex:1 1 auto;min-height:0;}
        .dtp-cell{display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:700;border-radius:7px;color:#5a6d8f;text-decoration:none;font-variant-numeric:tabular-nums;min-height:0;}
        .dtp-cell.empty{background:transparent;}
        .dtp-cell.none{color:#3d4f70;}
        a.dtp-cell.played{background:rgba(34,197,94,0.2);border:1px solid rgba(34,197,94,0.45);color:#6ee7b7;}
        a.dtp-cell.open{background:rgba(255,255,255,0.05);border:1px solid #2a4166;color:#c3d2e8;}
        a.dtp-cell.open:hover{border-color:var(--gc);color:#fff;}
        a.dtp-cell.today{box-shadow:0 0 0 2px #e8b43a;}
        .dtp-key{display:flex;flex-wrap:wrap;gap:5px 13px;margin-top:8px;font-size:10.5px;color:#93a3bd;font-weight:600;flex:none;}
        .dtp-key span{display:inline-flex;align-items:center;gap:5px;}
        .dtp-key .sw{width:10px;height:10px;border-radius:3px;flex:none;}
        .dtp-key .sw.played{background:rgba(34,197,94,0.35);border:1px solid rgba(34,197,94,0.55);}
        .dtp-key .sw.open{background:rgba(255,255,255,0.06);border:1px solid #2a4166;}
        .dtp-key .sw.today{background:transparent;border:2px solid #e8b43a;}
        /* leaderboard rows share the leftover height the same way */
        .dtp-lb{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;justify-content:space-evenly;}
        .dtp-lrow{display:flex;align-items:center;gap:9px;padding:3px 0;border-bottom:1px solid #1e3050;font-size:12px;color:#93a3bd;}
        .dtp-lrow:last-child{border-bottom:none;}
        .dtp-lrow .pl{width:17px;font-family:'DM Mono',ui-monospace,monospace;font-size:10.5px;color:#6c7e9b;flex:none;display:flex;align-items:center;}
        .dtp-lrow .pl svg{color:#e8b43a;}
        .dtp-lrow b{color:#fff;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1;}
        .dtp-lrow .sc{margin-left:auto;font-family:'DM Mono',ui-monospace,monospace;font-size:11.5px;color:#fff;flex:none;}
        .dtp-lrow.me{background:#2a2107;border-radius:6px;padding:3px 8px;border-bottom:none;margin:1px -8px;}
        .dtp-lrow.me b,.dtp-lrow.me .pl,.dtp-lrow.me .sc{color:#e8b43a;}
        .dtp-lfoot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:8px;font-size:10.5px;color:#6c7e9b;font-weight:600;flex:none;}
        .dtp-lfoot a{color:#e8b43a;text-decoration:none;font-weight:700;}
        .dtp-lfoot a:hover{text-decoration:underline;}
        .dtp-empty{font-size:12px;color:#6c7e9b;font-weight:600;padding:6px 0;}
        @media(max-width:980px){
          .dtp{overflow:auto;}
          .dtp-grid{grid-template-columns:1fr 1fr;gap:16px;}
          .dtp-col:nth-child(3){grid-column:1/-1;}
        }
        @media(max-width:720px){
          .dtp{padding:13px;}
          .dtp-hd{flex-wrap:wrap;gap:11px;}
          .dtp-acts{width:100%;}
          .dtp-play{flex:1;font-size:14px;padding:12px 16px;}
          .dtp-nm{font-size:19px;}
          .dtp-grid{grid-template-columns:1fr;gap:15px;}
          .dtp-col:nth-child(3){grid-column:auto;}
        }
      `}</style>
    </div>
  );
}
