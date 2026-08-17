'use client';

// /daily-five — where a run ends (owner, 2026-08-17).
//
// A player who opts into the Daily Five should not be handed five ordinary end
// cards. Each of those is a full page of its own: an IQ hero, rank tiles, a
// share bar, "up next", "easiest leaderboard", the whole of today's slate, a
// popular quiz per category and a footer. Five of them in a row is the same
// furniture five times, and every one of them points AWAY from the run the
// player is in the middle of. So during a run the end card collapses to a
// verdict and a Next control (see the run branch in DailyEndCard), and the
// summary they would otherwise have got arrives ONCE, here, at the end.
//
// The page is: the board for the five, then one ABRIDGED result card per game
// below it. Abridged means the result and nothing else. No "up next", no "play
// something similar", no "back to main", no share bar per game, no archive
// calendar, because those are page-level things and this is one page.
//
// It is a normal URL, so it is also the run's permalink: shareable, revisitable,
// and reachable without finishing (a half-done run renders honestly, with the
// unplayed games as empty cards).

import React, { useState, useEffect } from 'react';
import { ArrowRight, Trophy } from 'lucide-react';
import { fiveFor, fiveHref, FIVE_NAME } from '@/lib/daily-five';
import { DAILY_GAME_MAP, dailyScoreText } from '@/lib/daily-games';
import { dailyMeIdentity } from '../dailyMeClient';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

const etToday = () => {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
};

const r1 = (n) => Math.round(Number(n) * 10) / 10;
const clock = (s) => (Number.isFinite(s) && s > 0
  ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`
  : null);

// The site's own per-game score wording where it has one (Blocks counts shapes,
// Tuck counts points, and so on), falling back to a bare fraction. Wrapped
// because a game with no entry throws rather than returning null.
function scoreLine(key, score, total) {
  try {
    const t = dailyScoreText(key, score, total);
    if (t) return t;
  } catch (e) { /* fall through */ }
  return Number.isFinite(total) && total > 0 ? `${score} of ${total}` : null;
}

export default function DailyFiveSummary() {
  // Read in an effect, never during render: the server has no idea what today
  // is in Eastern, so deriving the run during render makes the first client
  // paint disagree with the server's.
  const [day, setDay] = useState(null);
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => { setDay(etToday()); }, []);

  useEffect(() => {
    if (!day) return undefined;
    let alive = true;
    const { anonId, email } = dailyMeIdentity();
    const qs = new URLSearchParams({ five: '1', fresh: '1' });
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    fetch(`/api/quiz/daily-combined?${qs.toString()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (alive) { if (d && !d.error) setData(d); else setErr(true); } })
      .catch(() => { if (alive) setErr(true); });
    return () => { alive = false; };
  }, [day]);

  const members = day ? fiveFor(day) : [];
  const ran = data && Array.isArray(data.games) && data.games.length
    ? new Set(data.games.map((g) => g.key)) : null;
  const run = ran ? members.filter((k) => ran.has(k)) : members;

  const me = (data && data.me) || null;
  const perGame = (me && me.perGame) || {};
  const played = run.filter((k) => perGame[k] && !perGame[k].abandoned);
  const complete = run.length > 0 && played.length === run.length;
  const maxTotal = (data && data.maxTotal) || run.length * 15;
  const board = (data && Array.isArray(data.overall) ? data.overall : []).slice(0, 10);
  const meInTop = !!(me && board.some((r) => r.userKey === me.userKey));

  const dateLabel = day
    ? `${MONTHS[Number(day.slice(5, 7)) - 1]} ${Number(day.slice(8, 10))}`
    : '';

  return (
    <div className="d5s">
      <style dangerouslySetInnerHTML={{ __html: `
        .d5s{max-width:860px;margin:0 auto;padding:26px 18px 90px;
             font-family:'Manrope',system-ui,-apple-system,sans-serif;color:var(--ink);}
        .d5s-hd{position:relative;background:var(--ground);color:#fff;border-radius:14px;
                padding:20px 22px;overflow:hidden;}
        .d5s-hd::before{content:'';position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--gold);}
        .d5s-hd.done::before{background:var(--success);}
        .d5s-e{font-size:9.5px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);}
        .d5s-hd.done .d5s-e{color:#7ff0c0;}
        .d5s-h1{font-size:30px;font-weight:800;letter-spacing:-.7px;line-height:1.1;margin:3px 0 0;}
        .d5s-sub{font-size:12.5px;font-weight:600;color:#9fb6e8;margin-top:5px;}
        .d5s-fig{display:flex;gap:26px;margin-top:15px;flex-wrap:wrap;}
        .d5s-fig div b{display:block;font-size:26px;font-weight:800;letter-spacing:-.7px;
                       font-variant-numeric:tabular-nums;line-height:1;}
        .d5s-fig div i{font-style:normal;display:block;font-size:9px;font-weight:800;letter-spacing:.12em;
                       text-transform:uppercase;color:#9fb6e8;margin-top:5px;}

        .d5s-sec{font-size:9.5px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;
                 color:var(--blue);margin:26px 0 9px;}
        .d5s-note{font-size:11.5px;font-weight:600;color:var(--slate);line-height:1.6;margin-top:9px;}

        /* board */
        .d5s-lb{border:1.5px solid var(--border);border-radius:13px;overflow:hidden;background:var(--white);}
        .d5s-lbr{display:flex;align-items:center;gap:11px;padding:9px 13px;border-bottom:1px solid #f0f2f6;}
        .d5s-lbr:last-child{border-bottom:none;}
        .d5s-lbr.me{background:var(--accent-soft);box-shadow:inset 3px 0 0 var(--blue);}
        .d5s-rk{flex:none;width:26px;text-align:right;font-size:15px;font-weight:800;
                font-variant-numeric:tabular-nums;color:var(--slate);}
        .d5s-rk.g1{color:var(--gold-ink);}.d5s-rk.g2{color:#8b919b;}.d5s-rk.g3{color:var(--bronze);}
        .d5s-who{flex:1;min-width:0;font-size:13.5px;font-weight:800;letter-spacing:-.15px;
                 white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .d5s-who s{display:block;text-decoration:none;font-size:10.5px;font-weight:700;color:var(--slate);margin-top:1px;}
        .d5s-pips{flex:none;display:flex;gap:3px;}
        .d5s-pip{width:16px;height:5px;border-radius:2px;background:#e3e8f0;}
        .d5s-pip.on{background:var(--blue);}
        .d5s-pip.top{background:var(--gold);}
        .d5s-tot{flex:none;width:66px;text-align:right;font-size:16px;font-weight:800;
                 color:var(--accent);font-variant-numeric:tabular-nums;}
        .d5s-tot i{font-style:normal;font-size:9.5px;font-weight:700;color:var(--slate);margin-left:2px;}

        /* one abridged result per game */
        .d5s-cards{display:flex;flex-direction:column;gap:9px;}
        .d5s-c{position:relative;display:flex;align-items:center;gap:13px;background:var(--white);
               border:1.5px solid var(--border);border-radius:12px;padding:13px 15px 13px 18px;}
        .d5s-c::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;
                       border-radius:12px 0 0 12px;background:var(--cc,#c9d2e0);}
        .d5s-c.unplayed{background:var(--surface);}
        .d5s-num{flex:none;width:22px;height:22px;border-radius:50%;background:var(--surface-alt);
                 color:var(--slate);font-size:11px;font-weight:800;display:flex;align-items:center;
                 justify-content:center;font-variant-numeric:tabular-nums;}
        .d5s-c.played .d5s-num{background:var(--success);color:#fff;}
        .d5s-ct{min-width:0;flex:1;}
        .d5s-cn{font-size:16px;font-weight:800;letter-spacing:-.3px;color:var(--ink);text-decoration:none;}
        .d5s-cn:hover{color:var(--blue-deep);}
        .d5s-cm{font-size:11px;font-weight:700;color:var(--slate);margin-top:2px;}
        .d5s-cm b{color:var(--ink);font-weight:800;}
        .d5s-cp{flex:none;text-align:right;}
        .d5s-cp b{display:block;font-size:19px;font-weight:800;color:var(--accent);
                  font-variant-numeric:tabular-nums;line-height:1;}
        .d5s-cp i{font-style:normal;display:block;font-size:8.5px;font-weight:800;letter-spacing:.11em;
                  text-transform:uppercase;color:var(--slate);margin-top:4px;}
        .d5s-go{flex:none;display:inline-flex;align-items:center;gap:6px;background:var(--cta);color:#fff;
                border-radius:8px;padding:9px 13px;font-size:11px;font-weight:800;letter-spacing:.06em;
                text-transform:uppercase;text-decoration:none;}
        .d5s-empty{padding:22px;text-align:center;font-size:13px;font-weight:600;color:var(--slate);
                   background:var(--surface);border:1.5px solid var(--border);border-radius:13px;}
        @media(max-width:620px){
          .d5s{padding:16px 12px 70px;}
          .d5s-h1{font-size:24px;}
          .d5s-lbr .d5s-pips{display:none;}
          .d5s-c{gap:10px;padding:11px 12px 11px 15px;}
          .d5s-cn{font-size:15px;}
        }
      ` }} />

      <div className={complete ? 'd5s-hd done' : 'd5s-hd'}>
        <div className="d5s-e">
          {FIVE_NAME} &middot; {dateLabel}
        </div>
        <h1 className="d5s-h1">{complete ? 'Run complete' : 'Your run'}</h1>
        <div className="d5s-sub">
          {complete
            ? 'All five played. Here is where that left you.'
            : `${played.length} of ${run.length} played. The rest are still open today.`}
        </div>
        <div className="d5s-fig">
          <div><b>{me ? r1(me.total) : 0}</b><i>of {maxTotal} pts</i></div>
          <div><b>{me && me.rank ? `#${me.rank}` : '—'}</b><i>of {(data && data.overallField) || 0} players</i></div>
          <div><b>{played.length}/{run.length}</b><i>games cleared</i></div>
        </div>
      </div>

      <div className="d5s-sec">Combined placement across the five</div>
      {board.length ? (
        <div className="d5s-lb">
          {board.map((row, i) => (
            <Row key={row.userKey} row={row} pos={i + 1} run={run} me={!!(me && row.userKey === me.userKey)} maxTotal={maxTotal} />
          ))}
          {me && !meInTop ? <Row row={me} pos={me.rank} run={run} me maxTotal={maxTotal} /> : null}
        </div>
      ) : (
        <div className="d5s-empty">{err ? 'The board could not be loaded just now.' : 'Nobody has scored on the run yet today.'}</div>
      )}
      <div className="d5s-note">
        Each game pays the same 15/12/10/8/7/6/5/4/3/2/1 by finish, and the run adds the five up.
        A game played on its own still counts.
      </div>

      <div className="d5s-sec">Your five</div>
      <div className="d5s-cards">
        {run.map((k, i) => {
          const g = DAILY_GAME_MAP[k];
          if (!g) return null;
          const p = perGame[k];
          const done = p && !p.abandoned;
          const line = done ? scoreLine(k, p.score, p.total) : null;
          const t = done ? clock(p.timeElapsed) : null;
          return (
            <div
              key={k}
              className={`d5s-c ${done ? 'played' : 'unplayed'}`}
              style={{ '--cc': g.colorNavy || g.color || '#c9d2e0' }}
            >
              <span className="d5s-num">{done ? '✓' : i + 1}</span>
              <div className="d5s-ct">
                {/* The name links to the game. That is identification, not
                    navigation furniture: it is how you get back to a board you
                    want to look at again, and it is the only link on the card. */}
                <a className="d5s-cn" href={g.href || `/${k}`}>{g.name}</a>
                <div className="d5s-cm">
                  {g.cat}
                  {done ? (
                    <>
                      {line ? <> &middot; <b>{line}</b></> : null}
                      {t ? <> &middot; {t}</> : null}
                      {p.rank ? <> &middot; #{p.rank} of {p.field}</> : null}
                    </>
                  ) : <> &middot; not played today</>}
                </div>
              </div>
              {done ? (
                <div className="d5s-cp"><b>{r1(p.points)}</b><i>points</i></div>
              ) : (
                <a className="d5s-go" href={fiveHref(k)}>Play<ArrowRight size={13} strokeWidth={2.6} /></a>
              )}
            </div>
          );
        })}
      </div>

      {complete ? (
        <div className="d5s-note" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 7 }}>
          <Trophy size={14} strokeWidth={2.4} style={{ color: 'var(--gold)' }} />
          A fresh five lands at midnight Eastern.
        </div>
      ) : null}
    </div>
  );
}

// One board row. The five pips say the SHAPE of a run at a glance (gold where
// they topped that game, blue where they finished it, empty where they have not
// played it), which is the thing a combined total on its own hides: an
// all-rounder and a specialist can reach the same number.
function Row({ row, pos, run, me, maxTotal }) {
  const pg = row.perGame || {};
  return (
    <div className={me ? 'd5s-lbr me' : 'd5s-lbr'}>
      <span className={`d5s-rk${pos === 1 ? ' g1' : pos === 2 ? ' g2' : pos === 3 ? ' g3' : ''}`}>{pos}</span>
      <span className="d5s-who">
        {me ? 'You' : (row.username || 'Guest')}
        <s>{row.gamesFinished || row.gamesPlayed || 0} of {run.length} played</s>
      </span>
      <span className="d5s-pips">
        {run.map((k) => {
          const p = pg[k];
          const cls = !p || p.abandoned ? '' : (p.rank === 1 ? 'top' : 'on');
          return <span key={k} className={`d5s-pip ${cls}`} />;
        })}
      </span>
      <span className="d5s-tot">{Math.round(Number(row.total) * 10) / 10}<i>/{maxTotal}</i></span>
    </div>
  );
}
