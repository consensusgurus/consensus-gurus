'use client';

// The homepage's two side rails, rebuilt 2026-08-03 (owner-approved mockup:
// mindloft-B4-scoreboard).
//
// It replaces the three stacked hero-name leaderboard cards on the left and the
// Last Played / Quick play / Category Mastery stack on the right with a single
// consistent panel system: a solid navy header band, a top-5 table, and a footer
// carrying the expander and the real "Full leaderboard" link.
//
// It is deliberately a PRESENTATION component. Every figure it renders is
// already fetched by QuizHomeClient and handed down as a prop, so no fetch, no
// identity read, and no API surface moved. That held again on 2026-08-12: the
// category leaders are derived from the per-game boards already in `dailyBoard`
// and the day's player count is a field on the totals payload the header
// already reads.
//
// Left rail, top to bottom:
//   1. Top community member  (refData)          - fixed
//   1b. Share strip           - PHONE ONLY, sits directly under the board above
//   2. Today's leaders       (dailyBoard/xpToday) - auto-flips every 7s
//   3. Top player            (xpAll/xp30)         - auto-flips every 7s
// Right rail:
//   1. The Loft: Live feed | Daily category leaders, auto-flips every 8s, each
//      face leading with its own cap slab
//   2. Featured: daily challenge, quiz of the day, duel, as three cap cards
//
// The flip replaces the old dot-only affordance with a named pill plus dots, so
// a reader can always tell WHICH board they are looking at; hovering the pill
// pauses the rotation and the dots are clickable.
//
// 2026-08-08 (owner): the right rail's Live feed | Your results TABS became a
// timed flip like the left rail's panels. The "Your results" face became DAILY
// MASTERY, which in turn moved out to the Category Mastery tile on 2026-08-12,
// see the note above.
//
// 2026-08-12 (owner): DAILY MASTERY LEFT THE LOFT for the Category Mastery tile
// on the browse row, which now flips between Quiz mastery and Daily mastery on
// the same 8s beat. In its place the Loft's second face is DAILY CATEGORY
// LEADERS: who is top of End Game, Word, Logic and the rest today, each one a
// hero slip. Nine categories do not fit one panel, so that face SUB-ROTATES
// three views of three on the same timer, which is why the flip now has four
// steps (live, then leaders 1/2/3) rather than two. The live face gained the
// day's PLAYER count beside its play count: plays and time said how busy the
// day was without saying how many people that was.
//
// 2026-08-10 (owner, mockup home-rails-mockups.html): the last two elements
// still on the pre-direction-B look were brought over. The Loft gained a cap
// slab per face (the live one deliberately anonymous: day TOTALS, never the
// newest player), its feed rings became 4px left rules, and its mastery list is
// now banded closest-to-done first with category-coloured bars. Featured became
// three cap cards on the ramp with a real control each, replacing three equal
// pastel rows. The remaining pastel-free rule: no tinted icon squares and no
// chevrons anywhere in these rails.

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { T } from '@/lib/theme';
import { DAILY_GAME_MAP, liveDailyKeys } from '@/lib/daily-games';
import { notifyShareCredit } from './ShareCreditPop';
import { ringBlue, catBlue } from '@/lib/home-blues';
import { CONTEST, COPY, contestIsLive, formatScore } from '@/lib/contest';

const MEDAL = [T.gold, T.silver, T.bronze];

// Collapsed every board shows five; expanded it shows TEN, never "all"
// (owner, 2026-08-08). The boards run to dozens of rows, so "Show all 11" both
// under-promised and over-delivered: it named a number that is not the size of
// the field, and dumping the whole field into a rail is not what the reader
// wanted from a top-five card either. Ten is the readable full page.
const ROWS_COLLAPSED = 5;
const ROWS_OPEN = 10;
function boardSlice(rows, open) {
  return (rows || []).slice(0, open ? ROWS_OPEN : ROWS_COLLAPSED);
}
// The expander only earns its place when there is a second page to show.
function hasMore(rows) { return (rows || []).length > ROWS_COLLAPSED; }

// Blue tile art, the same pair DailyStrip uses for the slate rows and cap tiles
// (kept local rather than imported: DailyStrip does not export them, and this is
function num(n) { return (n || 0).toLocaleString(); }

// Two faint states only (owner, 2026-08-03): a solid green/gold/red chip column
// read as a traffic light and pulled the eye off the feed itself.
function scoreTone(pct) {
  return pct >= 70
    ? { background: '#f0faf5', color: T.successDeep, border: '1px solid #d8eee4' }
    : { background: '#fdf1f0', color: '#a8362c', border: '1px solid #f2dcd9' };
}

// The green/red traffic light was retired 2026-08-04: the ring now steps down a
// blue ramp, deep navy for a strong run through pale for a weak one. The arc
// length and the printed percentage were always the actual readout.
function ringTone(pct) { return ringBlue(pct); }

function Rows({ rows, fmt, open, hrefFor, hero, cap }) {
  // The phone hero slab: the panel's #1 rendered in the same shape as the Up
  // next / Easiest board cap bars (eyebrow, big name, sub, big figure), with
  // its table row hidden underneath so the list starts at 2. Both renders sit
  // in the DOM at once and each is display:none at the other width, which keeps
  // the hidden one out of the accessibility tree, so nothing is read twice.
  const lead = (hero && rows.length) ? rows[0] : null;
  return (
    <>
    {lead ? (
      <div className={`hr-hero${hero.tone === 'lite' ? ' lite' : ''}`}>
        <div className="hr-htxt">
          <div className="hr-heye">{hero.eyebrow}</div>
          <div className="hr-hnm"><Link href={hrefFor(lead.name)}>{lead.name}</Link></div>
          {hero.sub ? <div className="hr-hsub">{hero.sub}</div> : null}
        </div>
        <div className="hr-hval"><b>{fmt(lead.value)}</b><span>{hero.unit || 'score'}</span></div>
      </div>
    ) : null}
    <table className={`hr-tbl${cap ? ' cap3' : ''}`}><tbody>
      {rows.map((r, i) => (
        <tr key={`${r.name}-${i}`} className={i === 0 ? 'lead1' : undefined}>
          <td className="rk" style={i < 3 ? { color: MEDAL[i] } : undefined}>{i + 1}</td>
          <td><Link href={hrefFor(r.name)} className="hr-nm" style={{ fontWeight: i === 0 ? 800 : 600 }}>{r.name}</Link></td>
          <td className="r hr-v">{fmt(r.value)}</td>
        </tr>
      ))}
      {!rows.length ? <tr><td colSpan={3} className="hr-none">Nothing here yet today.</td></tr> : null}
    </tbody></table>
    </>
  );
}

// Shared face rotation for every flipping panel: which face is showing, a hover
// hold so a reader can stop it on the one they are looking at, and the pill +
// dots control. `ms` is per panel (the leaderboards run at 7s, the right rail's
// Loft at 8s, per owner) so the two rails never tick in lockstep.
function useFlip(count, ms) {
  const [ix, setIx] = useState(0);
  const holdRef = useRef(false);
  useEffect(() => {
    if (count < 2) return undefined;
    const id = setInterval(() => { if (!holdRef.current) setIx((v) => (v + 1) % count); }, ms);
    return () => clearInterval(id);
  }, [count, ms]);
  return { ix: Math.min(ix, Math.max(0, count - 1)), setIx, holdRef };
}

// The pill naming the visible face, plus its clickable dots. Rendered into the
// panel's navy header band, where the flip control has always lived.
// `names` is optional and only for assistive tech: the Loft's three leader
// views all show the same pill label ("Category leaders"), so the labels array
// carries duplicates and the dots need their own distinct descriptions. Keys are
// the INDEX for the same reason, a duplicate label cannot be a React key.
function FlipPill({ labels, names, ix, setIx, holdRef }) {
  if (labels.length < 2) return null;
  return (
    <span
      className="hr-flip"
      onMouseEnter={() => { holdRef.current = true; }}
      onMouseLeave={() => { holdRef.current = false; }}
    >
      <span className="hr-lbl">{labels[ix]}</span>
      <span className="hr-dots">
        {labels.map((l, i) => (
          <i
            key={`${l}-${i}`}
            className={i === ix ? 'on' : undefined}
            role="button"
            tabIndex={0}
            aria-label={(names && names[i]) || l}
            onClick={() => setIx(i)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIx(i); }}
          />
        ))}
      </span>
    </span>
  );
}

// A panel whose body flips between two faces on a timer. `faces` is an array of
// { label, sub, rows, href }, and the pill names the face that is showing.
function FlipPanel({ icon, title, faces, expandKey, open, onToggle }) {
  const { ix, setIx, holdRef } = useFlip(faces.length, 7000);
  const face = faces[Math.min(ix, faces.length - 1)] || faces[0];
  if (!face) return null;
  return (
    <section className="hr-panel hr-flex">
      <div className="hr-ph">
        <span className="hr-pi">{icon}</span>
        <h2>{title}</h2>
        <FlipPill labels={faces.map((f) => f.label)} ix={ix} setIx={setIx} holdRef={holdRef} />
      </div>
      <div className="hr-sub">{face.sub}</div>
      <div className="hr-scroll hr-flex">
        <Rows
          rows={boardSlice(face.rows, open)}
          cap={!open}
          fmt={face.fmt}
          hrefFor={face.hrefFor}
          hero={{ eyebrow: face.eyebrow || face.label, sub: face.sub, unit: face.unit, tone: face.tone }}
        />
      </div>
      <div className="hr-foot">
        {hasMore(face.rows) ? (
          <button type="button" className="hr-exp" onClick={onToggle}>
            {open ? 'Show fewer' : `Show top ${ROWS_OPEN}`}
          </button>
        ) : <span className="hr-exp" style={{ opacity: 0 }} aria-hidden="true">·</span>}
        <Link href={face.href} className="hr-link">Full leaderboard &rarr;</Link>
      </div>
    </section>
  );
}

export default function HomeRails({
  side,
  refData,
  dailyBoard,
  xpToday = [],
  xp30 = [],
  xpAll = [],
  totals,
  lastPlayed = [],
  titleFor,
  catFor,
  hrefFor,
  onCredit,
  onAllLive,
  featured = [],
}) {
  const [open, setOpen] = useState({ com: false, tl: false, tp: false });
  const toggle = (k) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  // ── LEFT ──────────────────────────────────────────────────────────────────
  const community = useMemo(() => {
    const top = (refData && Array.isArray(refData.top)) ? refData.top : [];
    return top.map((r) => ({ name: r.username || 'Player', value: r.credits }));
  }, [refData]);

  // Contest board for the top-left slot. Resolved after mount (contestIsLive
  // reads the clock, so evaluating it during SSR risks a hydration mismatch at
  // the window boundary), and fetched only while the contest is running, so a
  // finished contest costs nothing. A failed fetch leaves contestRows empty and
  // the panel falls back to the normal community board.
  const [contestLive, setContestLive] = useState(false);
  const [contest, setContest] = useState(null);
  useEffect(() => { if (side === 'left') setContestLive(contestIsLive()); }, [side]);
  useEffect(() => {
    if (!contestLive) return undefined;
    let alive = true;
    const qs = new URLSearchParams();
    try {
      const anon = localStorage.getItem('sot_quiz_anon') || '';
      if (anon) qs.set('anonId', anon);
      const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null');
      if (id && id.email) qs.set('email', id.email);
    } catch { /* private mode */ }
    fetch(`/api/quiz/contest${qs.toString() ? `?${qs}` : ''}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d) setContest(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, [contestLive]);

  const contestRows = useMemo(() => {
    const b = (contest && Array.isArray(contest.board)) ? contest.board : [];
    return b.map((r) => ({ name: r.username || 'Player', value: r.score }));
  }, [contest]);

  const contestDays = contest && contest.contest ? contest.contest.daysLeft : 0;
  // Only take over the slot once there is actually something to show; an empty
  // contest board would otherwise blank a panel that had real content in it.
  const showContest = contestLive && contestRows.length > 0;
  const communityRows = showContest ? contestRows : community;

  // The combined daily-games score (best-N total), NOT games played: "29/42"
  // read as a fraction of the slate and told you nothing about how well anyone
  // did (owner, 2026-08-03).
  const dailyRows = useMemo(() => {
    const ov = (dailyBoard && Array.isArray(dailyBoard.overall)) ? dailyBoard.overall : [];
    return ov.map((r) => ({ name: r.username || 'Player', value: r.total }));
  }, [dailyBoard]);

  // ── RIGHT ─────────────────────────────────────────────────────────────────
  // THE DAILY-GAME CATEGORIES, in the order the slate's filter strip lists them:
  // first appearance down the live roster, so the two surfaces name the same
  // groups in the same order without either owning a hardcoded list. Built from
  // the STATIC roster rather than from today's board, which is what makes the
  // view count stable from the first render: the flip timer resets whenever its
  // count changes, and a count that waited on a fetch would restart the rotation
  // the moment the board landed.
  const catList = useMemo(() => {
    const out = [];
    for (const k of liveDailyKeys()) {
      const c = (DAILY_GAME_MAP[k] || {}).cat;
      if (c && !out.includes(c)) out.push(c);
    }
    return out;
  }, []);

  // DAILY CATEGORY LEADERS (owner, 2026-08-12). Who is top of End Game, of Word,
  // of Logic today. The leader of a category is the player with the MOST
  // COMBINED POINTS across every game in it, the same currency the combined
  // daily board runs on, so sweeping five Word games beats one big Crux run,
  // which is the behaviour the owner asked for.
  //
  // It is computed from `dailyBoard.games`, which the page already fetches, so
  // this costs no request. The caveat that comes with that: each per-game board
  // carries its top 10 NAMED players, so a player who is 11th in every game of a
  // category is invisible here. That cannot cost anyone the lead in practice (a
  // leader is by definition near the top of the games they played) and the
  // alternative is a new server route to answer a rail slip.
  const catLeaders = useMemo(() => {
    const games = (dailyBoard && Array.isArray(dailyBoard.games)) ? dailyBoard.games : [];
    const acc = new Map();
    for (const c of catList) acc.set(c, { games: 0, plays: 0, players: new Map() });
    for (const g of games) {
      const c = acc.get((DAILY_GAME_MAP[g.key] || {}).cat);
      if (!c) continue;
      c.games += 1;
      c.plays += Number(g.plays) || 0;
      for (const pl of (g.board || [])) {
        if (!pl || !pl.username) continue;
        const cur = c.players.get(pl.username) || { name: pl.username, pts: 0, n: 0 };
        cur.pts += Number(pl.points) || 0;
        cur.n += 1;
        c.players.set(pl.username, cur);
      }
    }
    return catList.map((name) => {
      const c = acc.get(name) || { games: 0, plays: 0, players: new Map() };
      // Points, then games played in the category, then name: a tie on points
      // goes to whoever earned it across more of the category.
      const ranked = [...c.players.values()]
        .sort((a, b) => b.pts - a.pts || b.n - a.n || a.name.localeCompare(b.name));
      const best = ranked[0] || null;
      return {
        name,
        games: c.games,
        plays: c.plays,
        field: c.players.size,
        leader: best ? { name: best.name, pts: Math.round(best.pts * 10) / 10, n: best.n } : null,
      };
    });
  }, [dailyBoard, catList]);

  // ALWAYS THREE SUB-VIEWS (owner, 2026-08-12), whatever the category count: a
  // hero slip is a third of the panel, so nine categories cannot share one face
  // and a per-view cap would silently drop the tail. Chunking to
  // ceil(n / 3) per view shows every category in three turns and keeps the last
  // view from being a lone slip on a tall panel.
  const catViews = useMemo(() => {
    if (!catLeaders.length) return [];
    const per = Math.ceil(catLeaders.length / 3);
    const out = [];
    for (let i = 0; i < catLeaders.length; i += per) out.push(catLeaders.slice(i, i + per));
    return out;
  }, [catLeaders]);

  // The Loft's flip: face 0 is the live feed, faces 1..n are the leader views,
  // all on the one 8s beat (owner, 2026-08-08 for the beat, 2026-08-12 for the
  // sub-views). So a full turn is live, leaders, leaders, leaders, live.
  const loft = useFlip(1 + catViews.length, 8000);
  const leadView = loft.ix > 0 ? (catViews[loft.ix - 1] || null) : null;

  const playsToday = (totals && totals.today) || 0;
  // Distinct PLAYERS today, guests included, straight off /api/quiz/totals
  // (added 2026-08-12 with this slip). Plays and time said how busy the day was
  // without ever saying how many people that was: 600 plays is a different day
  // depending on whether it is eighty people or eight.
  const playersToday = (totals && totals.todayPlayers) || 0;
  const timeToday = (() => {
    const x = Math.round((totals && totals.todayTime) || 0);
    const h = Math.floor(x / 3600); const m = Math.round((x % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  })();

  // Time left on today's slate, for the Featured header chip. Every puzzle on
  // the panel rolls at Eastern midnight, and a panel of today-only things
  // should say how much of today is left. Resolved in an effect and re-ticked
  // once a minute, never during render: it reads the clock, so evaluating it on
  // the server would hydrate against a different value (the same reason
  // contestIsLive above is deferred, and the reason isSundayET is called from
  // an effect in the daily surfaces). An empty string renders no chip, which is
  // what the server emits.
  const [resetIn, setResetIn] = useState('');
  useEffect(() => {
    if (side !== 'right') return undefined;
    const calc = () => {
      let et;
      try { et = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })); }
      catch (e) { et = new Date(); }
      const left = 86400 - (et.getHours() * 3600 + et.getMinutes() * 60 + et.getSeconds());
      const h = Math.floor(left / 3600); const m = Math.floor((left % 3600) / 60);
      setResetIn(h > 0 ? `${h}h ${m}m` : `${Math.max(1, m)}m`);
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [side]);

  const CSS = (
    <style>{`
      .hr-panel{background:var(--white);border:1px solid #d9dfe9;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;min-height:0;box-shadow:0 1px 2px rgba(16,24,40,.06),0 8px 20px -12px rgba(16,24,40,.28);}
      .hr-flex{flex:1 1 auto;min-height:0;}
      /* Every panel header is the SAME height across all three columns, so the
         first band of each panel (the hero slab here, the Up next bar on the
         slate) starts on one line (owner, 2026-08-08). Two things enforce it:
         a min-height of 42px (the 24px icon plus 9px of pad either side, which
         is what a one-line header already measured), and a title that can never
         wrap. A wrapped title is what broke the row before: "Community
         Leaderboard ($)" ran to two lines in a 282px rail and pushed that one
         header to 48px. Titles are kept SHORT for that reason; nowrap plus
         ellipsis is the belt-and-braces so a future rename cannot reintroduce
         the misalignment, it just clips. The slate's .sl-bar in DailyStrip.jsx
         carries the matching 43px (42 plus the 1px panel border the rails have
         above their header) and must move with this number. */
      .hr-ph{display:flex;align-items:center;gap:9px;padding:9px 13px;min-height:42px;box-sizing:border-box;background:var(--accent);flex:none;}
      .hr-ph h2{font-size:11.5px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--white);margin:0;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .hr-pi{width:24px;height:24px;border-radius:7px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.24);color:var(--white);display:flex;align-items:center;justify-content:center;flex:none;}
      /* Countdown chip in the panel header, contest only. Sits where the flip
         pill sits on the rotating panels, so the header keeps one shape. */
      .hr-chip{margin-left:auto;flex-shrink:0;font-size:10px;font-weight:800;letter-spacing:.06em;color:#bfdbfe;background:rgba(255,255,255,.14);border-radius:999px;padding:3px 8px;}
      .hr-flip{margin-left:auto;display:flex;align-items:center;gap:7px;}
      .hr-lbl{font-size:10px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--white);background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.26);padding:3px 9px;border-radius:999px;white-space:nowrap;}
      .hr-dots{display:flex;gap:4px;}
      .hr-dots i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.38);cursor:pointer;display:block;}
      .hr-dots i.on{background:var(--white);}
      .hr-sub{font-size:11px;color:var(--slate);padding:7px 13px;background:var(--surface);border-bottom:1px solid var(--border);flex:none;}
      .hr-scroll{overflow-y:auto;scrollbar-width:thin;scrollbar-color:#d3d9e2 transparent;}
      .hr-scroll::-webkit-scrollbar{width:6px;}
      .hr-scroll::-webkit-scrollbar-track{background:transparent;}
      .hr-scroll::-webkit-scrollbar-thumb{background:#dfe4ec;border-radius:3px;}
      .hr-tbl{width:100%;border-collapse:collapse;}
      .hr-tbl td{padding:5px 13px;border-bottom:1px solid #f0f2f6;font-size:13px;}
      .hr-tbl tr:last-child td{border-bottom:none;}
      .hr-tbl tr:hover{background:var(--surface);}
      .hr-tbl td.r{text-align:right;}
      .hr-tbl td.rk{font-size:11px;font-weight:800;width:24px;color:#9aa2b1;font-variant-numeric:tabular-nums;}
      /* The #1 is the SLAB at both widths now, so its table row is always
         hidden and the list starts at 2, and cap3 holds the desktop panel to a
         slab plus a top THREE (owner, 2026-08-08). That is what keeps all three
         boards stacked in the rail: hero and two names each, rather than a
         five-row table and no hero. The phone lifts the cap again below,
         because it stacks and has the height to spare. */
      .hr-tbl tr.lead1{display:none;}
      .hr-tbl.cap3 tr:nth-child(n+4){display:none;}
      .hr-nm{color:var(--ink);text-decoration:none;}
      .hr-nm:hover{text-decoration:underline;}
      .hr-v{font-weight:700;font-variant-numeric:tabular-nums;}
      .hr-none{font-size:12px;color:var(--muted);padding:8px 13px;}
      /* Phone hero slab (direction B, owner-approved 2026-08-07). Hidden above
         900px, where the panel keeps its plain ranked table. Below 900px it
         shows, the #1 table row hides, and the panel's grey sub-strip folds
         INTO the slab so each rail reads with the cap bars' shape. The strip is
         hidden only where a hero actually rendered (:has), so an empty board
         keeps its descriptor.
         The ground is BLUE, not the header's navy: .hr-ph stays visible (it
         carries the contest countdown and the flip panel's face switcher, which
         a phone still needs), so a navy slab would abut a navy header with no
         edge between them. Blue over navy is the same pairing the two cap bars
         already use, and the gold rule marks this one as a leaderboard #1
         rather than a "go play this". */
      .hr-hero{display:flex;position:relative;align-items:center;gap:12px;padding:14px 14px 14px 22px;background:var(--blue);color:var(--white);}
      .hr-hero::before{content:'';position:absolute;left:10px;top:13px;bottom:13px;width:4px;border-radius:2px;background:var(--gold);}
      .hr-hero.lite{background:#4d84f3;}
      .hr-htxt{min-width:0;}
      .hr-heye{font-size:9.5px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:#dbe8ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      /* line-height 1.3 plus a pixel of pad, not 1.1: these lines are
         overflow:hidden for the ellipsis, so a tight box clips a descender. */
      .hr-hnm{font-size:19px;font-weight:800;letter-spacing:-.3px;line-height:1.3;padding-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .hr-hnm a{color:var(--white);text-decoration:none;}
      .hr-hsub{font-size:11px;font-weight:600;line-height:1.35;padding-bottom:1px;color:var(--blue-200);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .hr-hval{margin-left:auto;flex:none;text-align:right;}
      .hr-hval b{display:block;font-size:23px;font-weight:800;letter-spacing:-.6px;line-height:1.1;font-variant-numeric:tabular-nums;}
      .hr-hval span{display:block;font-size:8.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--blue-200);margin-top:2px;}
      .hr-panel:has(.hr-hero) .hr-sub{display:none;}
      .hr-foot{display:flex;align-items:center;gap:10px;padding:7px 13px;border-top:1px solid var(--border);flex:none;}
      .hr-exp{border:0;background:none;padding:0;font:inherit;font-size:10.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--slate);cursor:pointer;white-space:nowrap;flex:none;}
      .hr-exp:hover{color:var(--blue-deep);}
      .hr-link{margin-left:auto;font-size:11px;font-weight:800;color:var(--blue-deep);text-decoration:none;white-space:nowrap;flex:none;}
      .hr-link:hover{text-decoration:underline;}
      /* The Loft's own slab, one per face. Same object as .hr-hero above (the
         leaderboard #1 on a phone) but it shows at EVERY width, because the two
         Loft faces are lists rather than boards and neither had an anchor of
         any kind. The live face takes the lighter blue and the leader slips the
         navy ramp below, so a flip is visible even before the pill is read. */
      /* IT IS EXACTLY AS TALL AS A CAP BAR, and that is measured, not eyeballed
         (owner, 2026-08-10: the first cut came out 80.5px against the cap's
         84.8px and read as a near miss, which is worse than an obvious
         difference). It sits directly beside the Up next / Easiest cap cards in
         the three-column console, so the two have to start and end on the same
         lines. Every number below is copied from .dh-cell / .dh-bue / .dh-bun /
         .dh-busub in DailyStrip.jsx: 14px padding, a 9.5px eyebrow, a 20px name
         on a 26px line with 1px of pad, and an 11px sub with a 1px top margin.
         14 + 13 + 27 + 15.8 + 14 = 84.8. IF THE CAP BAR'S TYPE OR PADDING
         CHANGES, CHANGE IT HERE TOO, and re-measure both rather than trusting
         the arithmetic in this comment. */
      .hr-lslab{position:relative;display:flex;align-items:center;gap:12px;flex:none;
                padding:14px 14px 14px 22px;background:var(--accent);color:var(--white);}
      .hr-lslab::before{content:'';position:absolute;left:10px;top:13px;bottom:13px;width:4px;border-radius:2px;background:var(--blue-400);}
      .hr-lslab.lite{background:var(--blue);}
      .hr-lslab.lite::before{background:var(--blue-200);}
      .hr-lstxt{min-width:0;flex:1;}
      .hr-lseye{font-size:9.5px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:#dbe8ff;
                white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      /* An explicit 26px line plus a pixel of pad, not a tight multiple: these
         lines are overflow:hidden for the ellipsis, so a tight box clips a
         descender, and a unitless line-height would drift from the cap bar the
         moment either font size moved. Same reasoning as .hr-hnm. */
      .hr-lsnm{font-size:20px;font-weight:800;letter-spacing:-.3px;line-height:26px;padding-bottom:1px;
               font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .hr-lssub{font-size:11px;font-weight:600;line-height:1.35;margin-top:1px;padding-bottom:1px;color:var(--blue-200);
                white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .hr-lsval{margin-left:auto;flex:none;text-align:right;}
      .hr-lsval b{display:block;font-size:20px;font-weight:800;letter-spacing:-.5px;line-height:1.1;font-variant-numeric:tabular-nums;}
      .hr-lsval span{display:block;font-size:8.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--blue-200);margin-top:2px;}
      /* CATEGORY LEADER SLIPS (owner, 2026-08-12). Each one is .hr-lslab, the
         same object the live face's totals bar is, so nothing new was invented
         for this face and the LEAD slip inherits the cap-bar height the panel's
         first band has to match. What varies is the ground (stepping navy /
         blue / pale down the ramp, the Featured cards' own progression, so
         three stacked slabs still read as three) and the left rule, which takes
         that CATEGORY's colour from lib/home-blues, the same value its chip
         wears on the slate. So the rule is the one thing on the slip that is
         not a shade of the panel, and it names the category twice over.
         The body slips GROW: the panel is pinned to the console's height, and
         two fixed 85px bars under the lead one left a band of white above the
         footer. */
      .hr-scroll.hr-clbody{display:flex;flex-direction:column;min-height:0;overflow:hidden;}
      .hr-clbody > .hr-lslab{flex:1 1 auto;border-top:1px solid rgba(255,255,255,.16);}
      .hr-cls::before{background:var(--clr,var(--blue-400));}
      .hr-cls.c0{background:var(--accent);}
      .hr-cls.c1{background:var(--blue);}
      .hr-cls.c2{background:#4d84f3;}
      /* A category nobody has played today still gets its slip, greyed back:
         an empty slot in a rotation reads as a bug, and "nobody yet" is a real
         and useful thing for the panel to say. */
      .hr-cls.open .hr-lsnm{color:var(--blue-200);font-weight:700;}
      .hr-res{display:flex;align-items:center;gap:10px;padding:7px 13px;border-bottom:1px solid #f0f2f6;text-decoration:none;color:var(--ink);}
      .hr-res:last-child{border-bottom:none;}
      .hr-res:hover{background:var(--surface);}
      .hr-mid{flex:1;min-width:0;}
      .hr-t{display:flex;align-items:baseline;gap:7px;min-width:0;font-size:12.5px;font-weight:800;}
      .hr-ttl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}
      .hr-cat{flex:none;font-size:9.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;padding:2px 6px;border-radius:4px;}
      /* "(x25)": how many times this game has been played today, site-wide. */
      .hr-x{flex:none;font-size:10.5px;font-weight:700;color:#8b90a0;font-variant-numeric:tabular-nums;}
      .hr-s{display:block;font-size:11px;color:var(--slate);}
      /* The live feed's completion cue: a 4px left rule on the blue ramp, which
         replaced the 32px conic ring this panel used to stack fourteen of
         (2026-08-10). ringBlue still supplies the colour, so a strong run still
         renders deep and a weak one pale; only the shape changed, and the
         printed percentage on the right edge was always the real readout. */
      .hr-res.rule{position:relative;padding-left:20px;}
      .hr-rl{position:absolute;left:9px;top:9px;bottom:9px;width:4px;border-radius:2px;}
      .hr-pc{flex:none;font-size:13px;font-weight:800;color:var(--ink);font-variant-numeric:tabular-nums;}
      .hr-res-sc{font-weight:800;color:var(--ink);font-variant-numeric:tabular-nums;}
      .hr-sc{font-family:var(--font-mono,ui-monospace,monospace);font-size:12.5px;font-weight:700;padding:4px 8px;border-radius:6px;flex:none;min-width:54px;text-align:center;font-variant-numeric:tabular-nums;}
      .hr-feat{flex:none;}
      /* Featured cap cards. Each one is .hr-lslab's shape at a slightly tighter
         padding, on its own step of the ramp, with a real control on the right
         edge instead of a chevron. */
      .hr-fcard{position:relative;display:flex;align-items:center;gap:11px;padding:12px 13px 12px 22px;
                text-decoration:none;color:var(--white);border-bottom:1px solid rgba(255,255,255,.16);}
      .hr-fcard:last-child{border-bottom:none;}
      .hr-fcard::before{content:'';position:absolute;left:10px;top:12px;bottom:12px;width:4px;border-radius:2px;background:var(--blue-200);}
      /* The leading card is the day's event, so it takes the deepest ground and
         the gold rule the site reserves for "this is the one". */
      .hr-fcard.t0{background:var(--accent);}
      .hr-fcard.t0::before{background:var(--gold);}
      .hr-fcard.t1{background:var(--blue);}
      .hr-fcard.t2{background:#4d84f3;}
      .hr-fcard:hover .hr-fcgo{background:var(--blue-200);}
      .hr-fctxt{flex:1;min-width:0;}
      .hr-fceye{display:block;font-size:9.5px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:#dbe8ff;
                white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .hr-fcnm{display:block;font-size:16px;font-weight:800;letter-spacing:-.2px;line-height:1.3;padding-bottom:1px;
               white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .hr-fcsub{display:flex;align-items:center;gap:5px;min-width:0;font-size:11px;font-weight:600;line-height:1.35;
                color:var(--blue-200);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .hr-fcdot{flex:none;opacity:.7;}
      /* Current leader (owner, 2026-08-04). Only the cards that HAVE a live
         board carry one; the duel card passes no leader and renders without it.
         On a coloured ground the gold ink it used on white is unreadable, so it
         takes the medal gold itself. */
      .hr-fl{display:inline-flex;align-items:center;gap:3px;min-width:0;flex:none;max-width:60%;
             font-size:10.5px;font-weight:800;color:var(--gold);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .hr-fl svg{flex:none;}
      .hr-fcgo{margin-left:auto;flex:none;font-size:11px;font-weight:800;letter-spacing:.04em;
               background:var(--white);color:var(--blue-deep);border-radius:8px;padding:8px 15px;transition:background .12s;}
      /* PHONE SHARE STRIP (owner, 2026-08-08). The only share affordance on the
         phone home used to be a text button far down the page, below every
         board, which nobody was going to find. This is a full-bleed bar sitting
         directly under the community leaderboard, i.e. immediately under the
         board that ranks people BY sharing, so the ask lands where the reason
         for it is already on screen.
         It is PHONE ONLY: the desktop rail keeps its "Get credit" footer button
         and the header carries the same offer, so a second full-width bar there
         would be a third ask in one column. Tapping it fires the global
         share-credit pop-up, the same one every Share button on the site opens,
         which is where the contest terms are stated. */
      /* GOLD, not --cta. --cta is #2563eb, the same family as the navy panel
         headers this bar is sandwiched between, and a blue bar between two blue
         bands is precisely the "not obvious enough" problem it exists to fix
         (compared side by side on the live page before choosing). Gold is
         already the money colour here, on the #1 rules and the leader crowns,
         so it reads as "there is a prize" and is the one tone on the phone
         stack that nothing else is wearing. Ink is a dark brown rather than
         --gold-ink (#a16207), which is a text-on-white tone and far too low
         contrast on the gold itself.
         border-radius:0 is explicit and required: a global button rule gives
         every button an 8px radius, so the strip shipped with rounded corners
         inside a stack of square full-bleed bands (owner, 2026-08-08). */
      .hr-share{display:none;width:100%;box-sizing:border-box;align-items:center;gap:11px;padding:13px 16px;border:0;border-radius:0;background:var(--gold,#e8b43a);color:#3a2a05;font:inherit;font-family:inherit;text-align:left;cursor:pointer;}
      .hr-share:active{background:#d9a52e;}
      .hr-share .hr-shtxt{flex:1;min-width:0;}
      .hr-share b{display:block;font-size:15px;font-weight:800;letter-spacing:-.2px;line-height:1.25;}
      .hr-share span{display:block;font-size:11px;font-weight:700;opacity:.78;line-height:1.35;margin-top:2px;}
      .hr-share .hr-sharr{flex:none;font-size:19px;font-weight:800;line-height:1;opacity:.55;}
      /* The rails stack at natural height on a phone, but the activity list is
         unbounded, so it alone keeps a cap and scrolls inside it. The leader
         slips are two fixed bars and need no cap, but they DO need a height to
         grow into once .hr-flex stops stretching them. */
      @media(max-width:1200px){.hr-flex{flex:none;}.hr-scroll{overflow:visible;}.hr-actbody{max-height:360px;overflow-y:auto;}
        .hr-clbody{min-height:170px;}}
      /* The rail pins every panel to the center console's measured height, so a
         slab plus two names left a band of white sitting above the footer
         (owner, 2026-08-08). The TABLE takes that slack rather than the scroll
         box: as a flex child at flex:1 it hands the extra height to rows 2 and
         3, which fills the panel and buys the two names room to read a size up.
         It follows the rail, so nothing here needs retuning when the center's
         cap changes. :has(> .hr-tbl) keeps it off the right rail, whose scroll
         box holds the feed rather than a board. */
      @media(min-width:901px){
        .hr-scroll:has(> .hr-tbl){display:flex;flex-direction:column;}
        .hr-scroll > .hr-tbl{flex:1 1 auto;}
        .hr-scroll > .hr-tbl td{font-size:14.5px;vertical-align:middle;}
        .hr-scroll > .hr-tbl td.rk{font-size:12px;}
      }
      /* Phone: the rail panels run edge to edge like the slate, rather than
         sitting as tiles inside the page gutter (owner, 2026-08-03). */
      @media(max-width:900px){
        .hr-panel{margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);width:auto;max-width:none;border-left:none;border-right:none;border-radius:0;box-shadow:none;}
        .hr-tbl.cap3 tr:nth-child(n+4){display:table-row;}
        .hr-share{display:flex;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);width:100vw;max-width:none;}
        /* The panels butt against each other on a phone (the rail gap is zeroed
           in QuizHomeClient), so the second of any adjacent pair would otherwise
           draw a second 1px line right under the first one's. */
        .hr-panel + .hr-panel,.hr-share + .hr-panel{border-top:0;}
      }
      /* ...but from 641px the two rails sit SIDE BY SIDE (the tablet tier in
         QuizHomeClient), and a full-bleed child of a two-column grid escapes its
         column: measured once at 800px, every panel came out 785px wide with the
         left rail at x=-190 and the right at x=190, overlapping each other and
         hanging off the page. The BLEED MOVES UP THERE, onto .dhx itself, so the
         bands still run to both page edges; a panel just stays inside its own
         half. It keeps the square, borderless, shadowless edge-to-edge look the
         phone gives it, since the rails are still full-bleed as a pair. */
      @media(min-width:641px) and (max-width:900px){
        .hr-panel,.hr-share{margin-left:0;margin-right:0;width:100%;}
      }
    `}</style>
  );

  if (side === 'left') {
    return (
      <>
        {CSS}
        {/* Top-left panel. While the referral contest is live this slot shows
            the CONTEST board instead of the rolling 90-day community board, and
            reverts on its own the moment the contest ends (owner, 2026-08-05).
            A swap rather than a second panel: both answer "who is bringing
            people in", and side by side they would show two different rankings
            of the same thing (rolling credits vs fixed-window weighted score)
            with no way for a reader to tell which one counted. */}
        <section className="hr-panel hr-flex">
          <div className="hr-ph">
            <span className="hr-pi"><CrownIcon /></span>
            {/* Flattened to "Leaderboard" (owner, 2026-08-08): the full
                "Community Leaderboard ($)" wrapped to two lines in the rail and
                made this one header taller than every other panel's. The ($)
                stays, marking that there is prize money on it while the contest
                runs (owner, 2026-08-05), and the hero slab's eyebrow below still
                names the board in full, so nothing is lost by the short title.
                The /quizzes/community PAGE is unaffected and keeps its rolling
                90-day board. */}
            <h2>{showContest ? 'Leaderboard ($)' : 'Leaderboard'}</h2>
            {showContest && contestDays ? <span className="hr-chip">{contestDays}d left</span> : null}
          </div>
          <div className="hr-sub">
            {showContest
              ? `${COPY.prizeLine} · ${COPY.formulaLine}`
              : 'New players brought in, last 90 days'}
          </div>
          <div className="hr-scroll hr-flex">
            <Rows
              rows={boardSlice(communityRows, open.com)}
              cap={!open.com}
              fmt={showContest ? (v) => formatScore(v) : (v) => `+${num(v)}`}
              hrefFor={(n) => `/player/${encodeURIComponent(n)}`}
              hero={{
                eyebrow: showContest ? 'Contest leader' : 'Top community member',
                // Prize line only, no formula: the slab's sub is one nowrap
                // line and the pair clipped mid-word on a 390px frame. The
                // countdown already rides in the panel header beside the title.
                sub: showContest ? COPY.prizeLine : 'New players brought in, last 90 days',
                unit: showContest ? 'score' : 'brought in',
              }}
            />
          </div>
          <div className="hr-foot">
            {hasMore(communityRows)
              ? <button type="button" className="hr-exp" onClick={() => toggle('com')}>{open.com ? 'Show fewer' : `Show top ${ROWS_OPEN}`}</button>
              : <button type="button" className="hr-exp" onClick={onCredit}>Get credit</button>}
            <Link href={showContest ? '/quizzes/contest' : '/quizzes/community'} className="hr-link">
              {showContest ? 'Board and rules' : 'Full leaderboard'} &rarr;
            </Link>
          </div>
        </section>

        {/* Phone-only share bar, directly under the board it explains. The
            headline names the prize only while the contest is actually running,
            so the offer can never outlive it: contestLive is resolved after
            mount for the same hydration reason the contest board is. */}
        <button type="button" className="hr-share" onClick={() => { if (!notifyShareCredit('')) { if (onCredit) onCredit(); } }}>
          <span className="hr-shtxt">
            <b>{contestLive ? `Share Mind Loft for ${CONTEST.prizeLabel}*` : 'Share Mind Loft for credit'}</b>
            <span>{contestLive ? `${COPY.prizeLine}. Ends ${CONTEST.endLabel}.` : 'Anyone who plays through your link credits you.'}</span>
          </span>
          <span className="hr-sharr" aria-hidden="true">&rsaquo;</span>
        </button>

        {/* "Today", not "Today's leaders": the longer name wrapped beside the
            face-switcher pill and broke the header-height match (owner,
            2026-08-08). The pill and the hero eyebrow both still say which
            board is showing. */}
        <FlipPanel
          icon={<FlameIcon />}
          title="Today"
          open={open.tl}
          onToggle={() => toggle('tl')}
          faces={[
            {
              label: 'Daily games',
              eyebrow: "Today's leader",
              unit: 'points',
              tone: 'lite',
              sub: 'Combined daily games score',
              rows: dailyRows,
              fmt: (v) => (Math.round((v || 0) * 10) / 10).toLocaleString(),
              hrefFor: (n) => `/player/${encodeURIComponent(n)}`,
              href: '/quizzes/hub?tab=daily',
            },
            ...(xpToday.length ? [{
              label: 'IQ gainers',
              eyebrow: "Today's top gainer",
              unit: 'IQ pts',
              tone: 'lite',
              sub: 'IQ points earned today',
              rows: xpToday,
              fmt: num,
              hrefFor: (n) => `/player/${encodeURIComponent(n)}`,
              href: '/quizzes/hub?tab=player',
            }] : []),
          ]}
        />

        <FlipPanel
          icon={<StarIcon />}
          title="Top player"
          open={open.tp}
          onToggle={() => toggle('tp')}
          faces={[
            {
              label: 'All time',
              eyebrow: 'Top player, all time',
              unit: 'IQ pts',
              sub: 'Lifetime IQ points',
              rows: xpAll.length ? xpAll : xp30,
              fmt: num,
              hrefFor: (n) => `/player/${encodeURIComponent(n)}`,
              href: '/quizzes/hub?tab=player',
            },
            {
              label: '30 days',
              eyebrow: 'Top player, 30 days',
              unit: 'IQ pts',
              sub: 'IQ points, last 30 days',
              rows: xp30.length ? xp30 : xpAll,
              fmt: num,
              hrefFor: (n) => `/player/${encodeURIComponent(n)}`,
              href: '/quizzes/hub?tab=player',
            },
          ]}
        />
      </>
    );
  }

  return (
    <>
      {CSS}
      <section className="hr-panel hr-flex">
        <div className="hr-ph">
          <span className="hr-pi"><PulseIcon /></span>
          <h2>The Loft</h2>
          {/* Every leader view shows the SAME pill label: the three of them are
              one face that happens not to fit on one panel, so naming them
              "Leaders 1/3" would advertise the mechanism rather than the
              content. The dots still address each view individually, and
              `names` gives assistive tech the distinct description.
              "Leaders", not "Category leaders": the panel header is one row of
              a 282px rail and its TITLE is the thing that must never wrap, so a
              long pill ate it down to "THE L..." (owner, 2026-08-12). Any new
              pill label here gets checked against the rendered header, not
              against how it reads on its own. */}
          <FlipPill
            labels={['Live feed', ...catViews.map(() => 'Leaders')]}
            names={['Live feed', ...catViews.map((v, i) => `Daily category leaders, view ${i + 1} of ${catViews.length}`)]}
            ix={loft.ix}
            setIx={loft.setIx}
            holdRef={loft.holdRef}
          />
        </div>
        {/* THE SLAB, one per face (owner-approved direction B1/B2, 2026-08-10).
            The panel used to open on a bordered stat strip and then fifty rows
            of 12.5px type with nothing to anchor the eye, and the two faces were
            structurally different but rendered identically. Each face now leads
            with the same cap-bar shape the slate's Up next bar uses, which is
            also what carries each face's headline figures, so the old .hr-stats
            strip is gone from this panel.

            THE LIVE FACE'S SLAB IS DELIBERATELY ANONYMOUS (owner, 2026-08-10).
            It reads the day's TOTALS, plays and time played, never the newest
            player's name or score: the rows below already carry results without
            attribution, and promoting one person's run into a headline is a
            different thing from a live feed. */}
        {!leadView ? (
          <div className="hr-lslab lite">
            <div className="hr-lstxt">
              <div className="hr-lseye">Live &middot; today</div>
              <div className="hr-lsnm">{num(playsToday)} {playsToday === 1 ? 'play' : 'plays'}</div>
              <div className="hr-lssub">across every puzzle and quiz</div>
            </div>
            {/* Two figures, players then time. Players leads because it is the
                one that tells you whether the day is busy; the play count above
                is already the headline, so the pair reads people, plays,
                minutes without repeating itself. */}
            <div className="hr-lsval"><b>{num(playersToday)}</b><span>{playersToday === 1 ? 'player' : 'players'}</span></div>
            <div className="hr-lsval"><b>{timeToday}</b><span>played</span></div>
          </div>
        ) : (
          /* The LEAD slip of a leader view sits in the slab slot, so it keeps
             the measured cap-bar height and the Loft's first band still starts
             on the same line as the console's Up next bar beside it. The other
             two slips grow to fill the body below. */
          <CatSlip row={leadView[0]} tone={0} />
        )}
        <div className={`hr-scroll hr-flex${leadView ? ' hr-clbody' : ' hr-actbody'}`}>
          {!leadView ? (
            (lastPlayed || []).slice(0, 14).map((f, i) => {
              const frac = f.total ? f.score / f.total : 0;
              const pct = Math.round(frac * 100);
              const cat = catFor ? catFor(f.quizId) : null;
              return (
                /* The 32px conic ring became the 4px left rule the rest of the
                   page uses: fourteen of them stacked down a 300px rail were
                   the busiest object on the homepage, and the percentage was
                   always the real readout. The rule keeps the depth cue (ramp
                   deep for a strong run, pale for a weak one) and the number
                   moves out to the right edge as plain text. */
                <Link key={`${f.quizId}-${i}`} href={hrefFor ? hrefFor(f.quizId) : '#'} className="hr-res rule">
                  <i className="hr-rl" style={{ background: ringTone(pct) }} aria-hidden="true" />
                  <span className="hr-mid">
                    <span className="hr-t">
                      <span className="hr-ttl">{titleFor ? titleFor(f.quizId) : f.quizId}</span>
                      {f.dayCount > 0 ? <span className="hr-x" title={`${f.dayCount} play${f.dayCount === 1 ? '' : 's'} today`}>(x{f.dayCount})</span> : null}
                      {cat ? <span className="hr-cat" style={{ background: cat.tint, color: cat.color }}>{cat.label}</span> : null}
                    </span>
                    <span className="hr-s">
                      <b className="hr-res-sc">{f.score}/{f.total}</b>
                      {typeof f.pct === 'number' ? ` · beat ${f.pct}%` : ''}{f.when ? ` · ${f.when}` : ''}
                    </span>
                  </span>
                  <span className="hr-pc">{pct}%</span>
                </Link>
              );
            })
          ) : (
            leadView.slice(1).map((row, i) => <CatSlip key={row.name} row={row} tone={i + 1} />)
          )}
          {!leadView && !(lastPlayed || []).length ? <div className="hr-none" style={{ padding: '10px 13px' }}>No recent plays yet.</div> : null}
        </div>
        <div className="hr-foot">
          <button type="button" className="hr-exp" onClick={onAllLive}>All activity</button>
          {/* The footer link follows the visible face, so it points at whichever
              board the reader is actually looking at. */}
          <Link href={leadView ? '/quizzes/hub?tab=daily' : '/quizzes/hub?tab=player'} className="hr-link">
            {leadView ? 'Daily boards' : 'Stat hub'} &rarr;
          </Link>
        </div>
      </section>

      {/* FEATURED: every slot is a cap card (owner-approved direction B2,
          2026-08-10). It was three identical rows, each with a pastel tinted
          icon square (the only pastels left on the page, in three near
          identical blues) and a chevron (the only chevrons on the page), and
          nothing on any of them was a control. The Daily Challenge has a board
          and a deadline; Start a duel is an evergreen link. Rendering them at
          the same weight said they were the same kind of thing.

          Each card is the slate's cap-bar shape, stepping navy / blue / pale
          down the ramp so three solid blocks still read as three, with the
          leading card carrying the gold rule that marks the day's event. The
          header chip says how long today's slate has left, which is the fact
          that makes the panel worth a second look.

          Fields: `eyebrow` / `name` / `sub` / `cta`, with fallbacks onto the
          older { title, sub } shape so a caller that has not been updated still
          renders something sensible rather than a blank card. */}
      <section className="hr-panel hr-feat">
        <div className="hr-ph">
          <span className="hr-pi"><SparkIcon /></span><h2>Featured</h2>
          {resetIn ? <span className="hr-chip">RESETS IN {resetIn}</span> : null}
        </div>
        {featured.map((f, i) => {
          const eyebrow = f.eyebrow || f.title;
          const name = f.name || f.sub;
          const sub = f.name ? f.sub : '';
          return (
            <Link key={f.title || eyebrow} href={f.href} className={`hr-fcard t${Math.min(i, 2)}`}>
              <span className="hr-fctxt">
                <span className="hr-fceye">{eyebrow}</span>
                <span className="hr-fcnm">{name}</span>
                <span className="hr-fcsub">
                  {f.leader ? <span className="hr-fl"><CrownIcon />{f.leader}</span> : null}
                  {f.leader && sub ? <span className="hr-fcdot">&middot;</span> : null}
                  {sub || null}
                </span>
              </span>
              <span className="hr-fcgo">{f.cta || 'Play'}</span>
            </Link>
          );
        })}
      </section>
    </>
  );
}

/* One category leader, as a hero slip. `tone` 0 is the lead slip, which the
   Loft renders into its slab slot (so it keeps the cap-bar height); 1 and 2
   are the pair below it, which grow to fill the body.

   A category with no board yet renders the same slip reading "Nobody yet", so
   the rotation never lands on a hole. */
function CatSlip({ row, tone }) {
  if (!row) return null;
  const led = row.leader;
  const games = `${row.games} game${row.games === 1 ? '' : 's'}`;
  return (
    <div
      className={`hr-lslab hr-cls c${Math.min(tone, 2)}${led ? '' : ' open'}`}
      style={{ '--clr': catBlue(row.name) }}
    >
      <div className="hr-lstxt">
        <div className="hr-lseye">{row.name}</div>
        <div className="hr-lsnm">{led ? led.name : 'Nobody yet'}</div>
        <div className="hr-lssub">
          {led
            // No "Top across" prefix: the big line is already the leader, so
            // the words are implied, and at 282px they pushed the play count
            // into an ellipsis on the wider categories.
            ? `${led.n} of ${games} · ${num(row.plays)} play${row.plays === 1 ? '' : 's'} today`
            : `${games} · first one on the board leads it`}
        </div>
      </div>
      {led ? <div className="hr-lsval"><b>{led.pts}</b><span>pts</span></div> : null}
    </div>
  );
}

/* Inline icons: the rails only need four, and importing four more lucide
   components onto a page that already ships ~30 of them is not worth the
   bytes. */
function CrownIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M3 17h18M4 17 3 7l5 4 4-7 4 7 5-4-1 10" /></svg>; }
function FlameIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M12 2c1 4-2 5.2-2 8a2 2 0 0 0 4 0c2 2 3 4 3 6a5 5 0 0 1-10 0C7 12 11 10 12 2z" /></svg>; }
function StarIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.7 5.6 6.1.8-4.5 4.2 1.2 6.1L12 16.3 6.5 19.2l1.2-6.1L3.2 8.9l6.1-.8z" /></svg>; }
function SparkIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></svg>; }
function PulseIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12h4l3-8 4 16 3-8h4" /></svg>; }
