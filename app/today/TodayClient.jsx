'use client';

// The marquee category home (live preview at /today), on the PAPER ground since
// 2026-08-24 (owner-approved blend, artifact "the-blend"): the navy site header
// stays untouched above this component; the component itself flips to the light
// paper theme the game pages use. Top to bottom:
//   - a WELCOME band in the scheme blues: time-of-day greeting + the day meter
//     (played / pts / rank + progress bar), with Leaderboards and Live feed
//     chips on its right edge. The greeting and the clock are read in EFFECTS,
//     never during render, so SSR and the client agree.
//   - a FOR YOU row (blue chrome): paused games, the Daily Five's next game,
//     the next unplayed game, and a date-rotated spotlight pick. Every Resume
//     control is GOLD (owner rule); gold otherwise marks only paused tiles.
//   - one white shelf CARD per category: tinted header strip with a 4px rule
//     in the category color, a done-count + progress bar on the label, and a
//     CTA chip filled with the category color (gold when it is a Resume).
//     A category with every game done collapses to a green band with the
//     scores ("Show tiles" expands it).
//
// DATA is the same plumbing the slate uses, deliberately:
//   - done/paused detection is DailyStrip's three-pass recipe verbatim:
//     (1) sot_<key>_day breadcrumbs on first paint, (2) fetchDayStatus
//     (completed/played/abandoned/inProgress ids, streaks), (3) per-puzzle
//     saves keyed by the daily-combined payload's nums, gated on t0 per the
//     opening-is-not-starting rule.
//   - per-game plays/standings/leaders come from /api/quiz/daily-combined.
//   - a tile is a LINK AND NOTHING ELSE (owner, 2026-08-24). The status chip
//     used to open a DailyTilePanel drawer under the shelf; that panel now
//     lives at the foot of each game's own page, behind "See stats, archive,
//     leaderboard, and more" (app/GamePanel.jsx), where the person reading it
//     is the person playing. Nothing on this page expands any more.
//   - the Sudoku shelf is the sudoku circuit POOL (all eight grids publish a
//     puzzle every day). The date is read in an EFFECT, never during render,
//     so SSR and the client agree.
//   - the live feed section is ANONYMOUS by owner rule (2026-08-10): rows
//     carry results without attribution, the band carries the day's totals.
//   - completed games sink to the FAR RIGHT of their row (owner, 2026-08-24);
//     paused games are NOT moved.
//
// NEVER add a blanket `.tdy a { color: ... }` rule here. It out-specifies the
// single-class selectors the tiles and rails style their own anchors with, and
// it once turned a Play button white-on-white (caught live, 2026-08-24). Style
// anchors by their own class only.

import { useEffect, useMemo, useRef, useState } from 'react';
import { DAILY_GAMES, DAILY_GAME_MAP } from '@/lib/daily-games';
import { CIRCUITS, circuitById, circuitKeysFor, circuitPageHref } from '@/lib/circuits';
import { fiveFor } from '@/lib/daily-five';
import { catBlue } from '@/lib/home-blues';
import savedIdentity from '@/lib/saved-identity';
import useDayStats, { fetchDayStatus, etToday, DAY_ROSTER } from '../useDayStats';

const PAPER = '#f7f8fa';
const CAT_ORDER = ['Word', 'Sudoku', 'End Game', 'Logic', 'Numbers', 'Trivia', 'Crowd Psychology', 'Geography', 'Cards', 'Arcade'];
const SUDOKU_COLOR = '#1d4ed8'; // not in CAT_BLUE; the mockup's pick, distinct from Numbers and Trivia

// Sum a set of games' per-game boards into one standings list. Same known
// limit as the Loft's category leaders: each per-game board carries only its
// named top rows, so a player outside every game's top board is invisible to
// the sum. Shared by the shelf-header leader chip and the standings panel.
function aggregateShelf(bgames, games) {
  const acc = new Map();
  for (const g of games) {
    const bg = bgames.find((x) => x && x.key === g.key);
    const rows = bg && Array.isArray(bg.board) ? bg.board : [];
    for (const r of rows) {
      if (!r || !r.userKey) continue;
      const cur = acc.get(r.userKey) || { userKey: r.userKey, username: r.username, pts: 0, games: 0 };
      cur.pts += (typeof r.points === 'number' ? r.points : 0);
      cur.games += 1;
      acc.set(r.userKey, cur);
    }
  }
  return [...acc.values()]
    .sort((a, b) => b.pts - a.pts || a.games - b.games || String(a.username || '').localeCompare(String(b.username || '')));
}

function catColor(name) {
  if (name === 'Sudoku') return SUDOKU_COLOR;
  if (name === 'Crowd Psychology') return catBlue('crowd');
  return catBlue(name);
}

function identityQs() {
  const p = new URLSearchParams();
  try { const a = localStorage.getItem('sot_quiz_anon'); if (a) p.set('anonId', a); } catch (e) {}
  try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); if (id && id.email) p.set('email', id.email); } catch (e) {}
  return p.toString();
}

const TROPHY = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e8b43a" strokeWidth="2.1" aria-hidden="true" style={{ flex: 'none' }}>
    <path d="M6 4h12v3.5a6 6 0 0 1-12 0zM6 5H3.5v1.8a3 3 0 0 0 3 3M18 5h2.5v1.8a3 3 0 0 1-3 3M9.5 20h5M12 13.5V20" />
  </svg>
);
const CROWN = (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="#e8b43a" aria-hidden="true" style={{ flex: 'none' }}>
    <path d="M3 7l3.8 3.4L12 3l5.2 7.4L21 7l-1.7 12H4.7z" />
  </svg>
);

// A shelf's tile track with desktop scroll affordances: an edge nudge chip on
// whichever side has more to show, plus a short white fade under it (the
// tracks all live inside white cards on the paper ground). On touch the chips
// are hidden and the track simply flicks.
function TilesRow({ children, light = false }) {
  const ref = useRef(null);
  const [can, setCan] = useState({ l: false, r: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const upd = () => setCan({ l: el.scrollLeft > 4, r: el.scrollLeft < el.scrollWidth - el.clientWidth - 4 });
    upd();
    el.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(upd) : null;
    if (ro) ro.observe(el);
    return () => {
      el.removeEventListener('scroll', upd);
      window.removeEventListener('resize', upd);
      if (ro) ro.disconnect();
    };
  }, []);
  const nudge = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * Math.max(200, el.clientWidth - 160), behavior: 'smooth' });
  };
  return (
    <div className={'tdy-tw' + (light ? ' light' : '')}>
      <div className="tdy-tiles" ref={ref}>{children}</div>
      <div className={'tdy-fade l' + (can.l ? ' on' : '')} aria-hidden="true" />
      <div className={'tdy-fade r' + (can.r ? ' on' : '')} aria-hidden="true" />
      {can.l ? <button type="button" className="tdy-nud l" onClick={() => nudge(-1)} aria-label="Scroll back">‹</button> : null}
      {can.r ? <button type="button" className="tdy-nud r" onClick={() => nudge(1)} aria-label="Scroll forward">›</button> : null}
    </div>
  );
}

export default function TodayClient() {
  // Build the shelves once: the sudoku circuit pool leaves Numbers and becomes
  // its own category. Static, so the server and client render the same rows.
  const shelves = useMemo(() => {
    const live = new Set(DAY_ROSTER);
    const pool = (circuitById('sudoku') || { keys: [] }).keys.filter((k) => live.has(k));
    const poolSet = new Set(pool);
    return CAT_ORDER.map((name) => {
      let games;
      if (name === 'Sudoku') games = pool.map((k) => DAILY_GAME_MAP[k]).filter(Boolean);
      else games = DAILY_GAMES.filter((g) => live.has(g.key) && g.cat === name && !poolSet.has(g.key));
      // Alphabetical within each shelf (owner, 2026-08-24).
      games = games.slice().sort((a, b) => a.name.localeCompare(b.name));
      return { name, color: catColor(name), games };
    }).filter((s) => s.games.length);
  }, []);
  const totalGames = useMemo(() => shelves.reduce((n, s) => n + s.games.length, 0), [shelves]);

  // ── the day, read in an effect so SSR and the client never disagree ──
  const [today, setToday] = useState(null);
  const [dateLabel, setDateLabel] = useState('');
  const [greet, setGreet] = useState('Welcome back');
  const [who, setWho] = useState('');
  useEffect(() => {
    const iso = etToday();
    setToday(iso);
    try {
      setDateLabel(new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).replace(',', ' ·'));
    } catch (e) { setDateLabel(iso); }
    try {
      const h = new Date().getHours();
      setGreet(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
    } catch (e) {}
    setWho(savedIdentity().username || '');
  }, []);
  // NOTE: every sudoku grid publishes a puzzle every day. The circuit's 5-of-8
  // rotating window (circuitKeysFor) only decides which five count toward the
  // sudoku CIRCUIT that day; it is NOT a playability signal. An earlier version
  // dimmed the other three "Back soon" and blocked their clicks, which was
  // wrong (owner caught Mercury, 2026-08-24). All eight tiles render normally.

  // CATEGORIES vs CIRCUITS are separate views under a faint selector (owner,
  // 2026-08-24: "not mixing categories and circuits"). Categories is the pure
  // category slate; Circuits shows one shelf per circuit with that DAY'S
  // members (circuitKeysFor) and a Play-the-circuit control. A game can sit in
  // several circuits, which is the nature of circuits, not a bug.
  const [view, setView] = useState('cats');
  const circuitShelves = useMemo(() => {
    if (!today) return [];
    return CIRCUITS.map((c) => {
      let keys;
      try { keys = circuitKeysFor(c.id, today) || []; } catch (e) { keys = []; }
      const games = keys.map((k) => DAILY_GAME_MAP[k]).filter(Boolean);
      if (!games.length) return null;
      const color = c.id === 'sudoku' ? SUDOKU_COLOR : catColor(games[0].cat);
      return { kind: 'circuit', id: c.id, name: c.name, blurb: c.blurb || '', color, games };
    }).filter(Boolean);
  }, [today]);

  // The Daily Five: a game played on its own still counts toward the run, so
  // the For you tile reads progress straight off the same `done` set the
  // shelves use. An unbanked date returns no roster and the tile simply
  // doesn't render, same rule as the run itself.
  const fiveKeys = useMemo(() => {
    if (!today) return [];
    try { return fiveFor(today) || []; } catch (e) { return []; }
  }, [today]);

  // ── play state: DailyStrip's three passes ──
  const [done, setDone] = useState(() => new Set());
  const [inprog, setInprog] = useState(() => new Set());

  // (1) same-device breadcrumbs, first paint
  useEffect(() => {
    const t = etToday();
    const d = new Set(); const ip = new Set();
    for (const g of DAILY_GAMES) {
      try {
        const c = JSON.parse(localStorage.getItem(g.store) || 'null');
        if (c && c.d === t) { if (c.done) d.add(g.key); else ip.add(g.key); }
      } catch (e) {}
    }
    if (d.size) setDone(d);
    if (ip.size) setInprog(ip);
  }, []);

  // (2) cross-device, via the shared daily-status fetch
  useEffect(() => {
    let alive = true;
    fetchDayStatus().then((data) => {
      if (!alive || !data) return;
      const [Y, M, D] = etToday().split('-').map(Number);
      const yy = Y % 100;
      const completed = new Set(data.completed || []);
      const played = new Set(data.played || []);
      const abandoned = new Set(data.abandoned || []);
      const openIds = new Set(data.inProgress || []);
      setDone((cur) => {
        const next = new Set(cur);
        for (const g of DAILY_GAMES) {
          const id = `${g.key}-${M}-${D}-${yy}`;
          if (completed.has(id) || played.has(id)) next.add(g.key);
        }
        return next;
      });
      setInprog((cur) => {
        const next = new Set(cur);
        for (const g of DAILY_GAMES) {
          const id = `${g.key}-${M}-${D}-${yy}`;
          if ((abandoned.has(id) || openIds.has(id)) && !completed.has(id) && !played.has(id)) next.add(g.key);
        }
        return next;
      });
    });
    return () => { alive = false; };
  }, []);

  // ── the day's combined board: per-game plays, standings, leaders, my rows ──
  const [board, setBoard] = useState(null);
  useEffect(() => {
    let alive = true;
    const qs = identityQs();
    fetch('/api/quiz/daily-combined' + (qs ? `?${qs}` : ''))
      .then((r) => r.json())
      .then((d) => { if (alive && d && Array.isArray(d.overall)) setBoard(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  const bgames = board && Array.isArray(board.games) ? board.games : null;
  const meKey = board && board.me ? board.me.userKey : null;
  const bgFor = (key) => (bgames ? bgames.find((x) => x && x.key === key) || null : null);
  const playsOf = (key) => {
    const b = bgFor(key);
    return b && typeof b.plays === 'number' ? b.plays : null;
  };
  const leaderOf = (key) => {
    const b = bgFor(key);
    const top = b && Array.isArray(b.board) && b.board[0] ? b.board[0] : null;
    return top && top.username ? top.username : null;
  };
  const myRow = (key) => {
    const bg = bgFor(key);
    const onBoard = bg && Array.isArray(bg.board) && meKey ? bg.board.find((r) => r && r.userKey === meKey) || null : null;
    if (onBoard) return onBoard;
    const pg = board && board.me && board.me.perGame ? board.me.perGame[key] : null;
    if (!pg) return null;
    return { userKey: meKey, username: (board.me && board.me.username) || 'You', ...pg };
  };

  // (3) per-puzzle saves for today, keyed by the payload's puzzle nums
  useEffect(() => {
    if (!bgames || !bgames.length) return;
    const ip = new Set(); const dn = new Set();
    for (const g of bgames) {
      if (!g || g.num == null) continue;
      const saveKeys = [`sot_${g.key}_${g.num}`];
      if (g.key === 'crux' && g.rev) saveKeys.push(`sot_crux_${g.num}_r${g.rev}`);
      let playing = false, finished = false;
      for (const k of saveKeys) {
        try {
          const sv = JSON.parse(localStorage.getItem(k) || 'null') || {};
          // t0 is the started signal; 'playing' alone is a game merely opened.
          if (sv.status === 'playing') { if (sv.t0) playing = true; }
          else if (sv.status) finished = true;
        } catch (e) {}
      }
      if (finished) dn.add(g.key);
      else if (playing) ip.add(g.key);
    }
    if (dn.size) setDone((cur) => new Set([...cur, ...dn]));
    if (ip.size) setInprog((cur) => new Set([...cur, ...ip]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  // ── header figures + feed data ──
  const day = useDayStats();
  const [totals, setTotals] = useState(null);
  const [recent, setRecent] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch('/api/quiz/totals').then((r) => r.json()).then((d) => {
      if (alive && d && !d.error) setTotals({ today: d.today || 0, todayPlayers: d.todayPlayers || 0, todayTime: d.todayTime || 0 });
    }).catch(() => {});
    fetch('/api/quiz/recent').then((r) => r.json()).then((d) => {
      if (alive && d && Array.isArray(d.plays)) setRecent(d.plays.slice(0, 18));
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  // ── the foot leaderboards: Overall / By game / By category / Circuits ──
  const [mode, setMode] = useState('overall');
  const [pickGame, setPickGame] = useState('crux');
  const [pickCat, setPickCat] = useState('Word');
  const [pickCirc, setPickCirc] = useState(CIRCUITS[0] ? CIRCUITS[0].id : 'sudoku');
  const [circBoards, setCircBoards] = useState({});
  useEffect(() => {
    if (mode !== 'circuits' || !pickCirc || circBoards[pickCirc]) return;
    const qs = identityQs();
    let alive = true;
    fetch('/api/quiz/daily-combined?circuit=' + encodeURIComponent(pickCirc) + (qs ? `&${qs}` : ''))
      .then((r) => r.json())
      .then((d) => { if (alive && d && Array.isArray(d.overall)) setCircBoards((cur) => ({ ...cur, [pickCirc]: d })); })
      .catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, pickCirc]);

  // Continue: first paused game in shelf order, else first unplayed
  const flat = useMemo(() => shelves.flatMap((s) => s.games.map((g) => ({ g, shelf: s }))), [shelves]);
  const continueGame = useMemo(() => {
    const paused = flat.find(({ g }) => inprog.has(g.key) && !done.has(g.key));
    if (paused) return { g: paused.g, resume: true };
    const next = flat.find(({ g }) => !done.has(g.key));
    return next ? { g: next.g, resume: false } : null;
  }, [flat, inprog, done]);

  // THE FOR YOU ROW (owner-approved blend, 2026-08-24): paused games first,
  // then the Daily Five's next game (pushed before the plain next-unplayed so
  // the run's reason and its ?five=1 link win when they are the same game),
  // then the next unplayed game, then a spotlight pick rotated by date over
  // the whole roster, same for everyone, like the quiz hub's QOTD. Deduped by
  // game key. On the server this renders exactly one tile (the first game of
  // the first shelf as "Up next") because done/inprog/today all start empty,
  // so SSR and the first client paint agree; the effects fill it in.
  const spotKey = useMemo(() => {
    if (!today || !DAY_ROSTER.length) return null;
    let h = 0;
    for (const ch of today) h = ((h * 31) + ch.charCodeAt(0)) >>> 0;
    return DAY_ROSTER[h % DAY_ROSTER.length];
  }, [today]);
  const forYou = useMemo(() => {
    const items = []; const seen = new Set();
    const push = (g, why, cls, href) => {
      if (!g || seen.has(g.key)) return;
      seen.add(g.key);
      items.push({ g, why, cls, href: href || g.href });
    };
    let paused = 0;
    for (const { g } of flat) {
      if (paused >= 4) break;
      if (inprog.has(g.key) && !done.has(g.key)) { push(g, 'Paused', 'g'); paused += 1; }
    }
    if (fiveKeys.length >= 2) {
      const fiveDone = fiveKeys.filter((k) => done.has(k)).length;
      const nk = fiveKeys.find((k) => !done.has(k));
      const ng = nk ? DAILY_GAME_MAP[nk] : null;
      if (ng) push(ng, `Daily Five · ${fiveDone} of ${fiveKeys.length}`, 'b', `${ng.href}?five=1`);
    }
    const nxt = flat.find(({ g }) => !done.has(g.key) && !inprog.has(g.key));
    if (nxt) push(nxt.g, 'Up next', 'b');
    if (spotKey && DAILY_GAME_MAP[spotKey]) push(DAILY_GAME_MAP[spotKey], 'Spotlight today', 's');
    return items;
  }, [flat, inprog, done, fiveKeys, spotKey]);

  // A finished category collapses to a band with the scores; "Show tiles"
  // reopens it. `done` is empty on the server, so nothing is collapsed at
  // first paint and hydration agrees.
  const [openDone, setOpenDone] = useState(() => new Set());

  // Completed games sink to the FAR RIGHT of their row (owner, 2026-08-24). A
  // shelf is read left to right as "what should I play next", so a game you
  // have already finished today is the one tile on it with nothing left to
  // offer, and it was sitting mid-strip purely because of the alphabet. Stable
  // partition, so the shelf's alphabetical order survives inside each block,
  // and paused games are NOT moved: they are unfinished business and belong
  // where the reader expects them. `done` is empty on the first render and
  // filled in an effect, so the server and the first client paint agree and
  // the tiles reorder only once the day's state lands.
  const sinkDone = (games) => {
    const open = [];
    const finished = [];
    for (const g of games) (done.has(g.key) ? finished : open).push(g);
    return finished.length ? open.concat(finished) : games;
  };

  const shelfCta = (shelf) => {
    if (shelf.kind === 'circuit') return { label: 'Play the circuit', href: circuitPageHref(shelf.id), gold: false };
    const paused = shelf.games.find((g) => inprog.has(g.key) && !done.has(g.key));
    if (paused) return { label: `Resume · ${paused.name}`, href: paused.href, gold: true };
    const next = shelf.games.find((g) => !done.has(g.key));
    if (next) return { label: `Next · ${next.name}`, href: next.href, gold: false };
    return { label: 'All done today', href: shelf.games[0].href, gold: false };
  };

  const statusLine = (shelf, g) => {
    if (done.has(g.key)) {
      const r = myRow(g.key);
      const sc = r && r.score != null && r.total ? `${r.score}/${r.total}` : 'Done';
      return { cls: 'tk', text: `✓ ${sc}` };
    }
    if (inprog.has(g.key)) return { cls: 'tp', text: 'Resume' };
    const n = playsOf(g.key);
    return { cls: '', text: n != null ? `${n.toLocaleString()} playing` : ' ' };
  };

  const feedGame = (quizId) => {
    const m = /^([a-z]+)-\d/.exec(quizId || '');
    return m && DAILY_GAME_MAP[m[1]] ? DAILY_GAME_MAP[m[1]] : null;
  };
  const agoLabel = (iso) => {
    if (!iso) return '';
    const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (!(m >= 1)) return 'now';
    if (m < 60) return `${m}m ago`;
    return `${Math.round(m / 60)}h ago`;
  };
  const fmtPts = (n) => (typeof n === 'number' ? (Math.round(n * 10) / 10).toLocaleString() : '');
  const fmtClock = (s) => {
    if (typeof s !== 'number' || !(s >= 0)) return '';
    const m = Math.floor(s / 60), ss = Math.round(s % 60);
    return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}:${String(ss).padStart(2, '0')}`;
  };
  const fmtDur = (s) => {
    if (typeof s !== 'number' || s <= 0) return '0m';
    const m = Math.floor(s / 60);
    const d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
    const parts = [];
    if (d) parts.push(`${d}d`);
    if (h) parts.push(`${h}h`);
    if (mm || !parts.length) parts.push(`${mm}m`);
    return parts.join(' ');
  };

  // Category standings, summed from the per-game boards the payload already
  // carries (same approach as the Loft's category leaders, same known limit:
  // only each game's named top-board players are visible to the sum).
  const catAgg = useMemo(() => {
    if (!bgames) return null;
    const out = {};
    for (const s of shelves) out[s.name] = aggregateShelf(bgames, s.games).slice(0, 12);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgames]);

  // THE SHELF'S LEADER, rendered beside the category name (owner, 2026-08-24).
  // The per-tile crown names who is top of ONE game; this names who is top of
  // the whole CATEGORY today, on the same combined points the standings panel
  // below and the daily board itself run on. Keyed kind+name so the circuits
  // view gets one too (a circuit is a set of games like any other shelf).
  const shelfLead = useMemo(() => {
    if (!bgames) return {};
    const out = {};
    for (const s of [...shelves, ...circuitShelves]) {
      const top = aggregateShelf(bgames, s.games)[0];
      if (top && top.username) out[(s.kind || 'cat') + s.name] = top;
    }
    return out;
  }, [bgames, shelves, circuitShelves]);

  const overall = board && Array.isArray(board.overall) ? board.overall : [];
  const meInTop = meKey ? overall.slice(0, 12).some((r) => r && r.userKey === meKey) : true;
  const bestN = board && typeof board.bestN === 'number' ? board.bestN : 25;
  const myPts = board && board.me && typeof board.me.total === 'number' ? board.me.total : null;
  const heroSub = (() => {
    const parts = [];
    if (day.ready || day.done) parts.push(`${day.done} of ${day.total} played`);
    if (myPts != null && myPts > 0) parts.push(`${fmtPts(myPts)} pts`);
    if (day.dayRank) parts.push(`#${day.dayRank.toLocaleString()} today`);
    return parts.join(' · ');
  })();
  const heroPct = day.total ? Math.round((100 * day.done) / day.total) : 0;

  return (
    <div className="tdy">
      <style>{CSS}</style>

      <div className="tdy-wrap">
        <div className="tdy-hero">
          <div className="hl">
            <div className="hi">{dateLabel || ' '}</div>
            <h1>{who ? `${greet}, ${who}` : greet}</h1>
            <div className="sub">{heroSub || 'The day’s puzzles, by category'}</div>
            <div className="bar" aria-hidden="true"><span style={{ width: `${heroPct}%` }} /></div>
          </div>
          <div className="hr">
            <a className="tdy-mini" href="#tdy-boards">
              <span className="ic">{TROPHY}</span>
              <span><span className="k">Leaderboards</span><span className="v">{day.dayRank ? `You're #${day.dayRank.toLocaleString()} today` : "Today's standings"}</span></span>
            </a>
            <a className="tdy-mini" href="#tdy-boards">
              <span className="ic"><span className="tdy-pulse" /></span>
              <span><span className="k">Live feed</span><span className="v">{totals ? `${totals.today.toLocaleString()} plays today` : 'Across the Loft'}</span></span>
            </a>
          </div>
        </div>

        {forYou.length ? (
          <section className="tdy-shc foryou" style={{ '--cc': '#2563eb' }}>
            <div className="tdy-hd">
              <div>
                <div className="eb">For you</div>
                <div className="tdy-hnm"><h2>Continue</h2></div>
              </div>
              {continueGame ? (
                <a className={continueGame.resume ? 'tdy-cta gold' : 'tdy-cta'} style={continueGame.resume ? undefined : { background: '#2563eb', borderColor: '#2563eb' }} href={continueGame.g.href}>
                  {`${continueGame.resume ? 'Resume' : 'Play'} · ${continueGame.g.name}`}
                </a>
              ) : (
                <a className="tdy-cta" style={{ background: '#2563eb', borderColor: '#2563eb' }} href="/daily-five">All done today</a>
              )}
            </div>
            <TilesRow>
              {forYou.map(({ g, why, cls, href }) => (
                <a key={g.key} className={'tdy-t fy' + (cls === 'g' ? ' paused' : '')} href={href}>
                  <img src={g.img} alt="" aria-hidden="true" loading="lazy" />
                  <b>{g.name}</b>
                  <span className={`tdy-why ${cls}`}>{why}</span>
                </a>
              ))}
            </TilesRow>
          </section>
        ) : null}

        <div className="tdy-view" role="tablist" aria-label="Group the slate by">
          <button type="button" role="tab" aria-selected={view === 'cats'} className={'tdy-viewbtn' + (view === 'cats' ? ' on' : '')} onClick={() => setView('cats')}>Categories</button>
          <button type="button" role="tab" aria-selected={view === 'circuits'} className={'tdy-viewbtn' + (view === 'circuits' ? ' on' : '')} onClick={() => setView('circuits')}>Circuits</button>
        </div>

        {(view === 'circuits' ? circuitShelves : shelves).map((shelf, si) => {
          const cta = shelfCta(shelf);
          const dn = shelf.games.filter((g) => done.has(g.key)).length;
          const tot = shelf.games.length;
          const allDone = view === 'cats' && tot > 0 && dn >= tot;
          const collapsed = allDone && !openDone.has(shelf.name);
          const rest = view === 'cats' && si === 4 ? (
            <div className="tdy-restband"><h3>The rest of the slate</h3><i>{`${CAT_ORDER.length - 4} more categories`}</i></div>
          ) : null;
          if (collapsed) {
            return (
              <section key={(shelf.kind || 'cat') + shelf.name} className="tdy-row">
                {rest}
                <div className="tdy-catdone">
                  <b className="nm">{shelf.name}</b>
                  <span className="ck">{`All ${tot} done`}</span>
                  {shelf.games.map((g) => {
                    const r = myRow(g.key);
                    const sc = r && r.score != null && r.total ? `${r.score}/${r.total}` : '✓';
                    return (
                      <a key={g.key} className="it" href={g.href}>
                        <img src={g.img} alt="" aria-hidden="true" loading="lazy" />
                        <span>{`${g.name} ✓ ${sc}`}</span>
                      </a>
                    );
                  })}
                  <button type="button" className="show" onClick={() => setOpenDone((cur) => new Set([...cur, shelf.name]))}>Show tiles</button>
                </div>
              </section>
            );
          }
          return (
            <section key={(shelf.kind || 'cat') + shelf.name} className="tdy-row">
              {rest}
              <div className="tdy-shc" style={{ '--cc': shelf.color }}>
                <div className="tdy-hd">
                  <div>
                    <div className="eb">{shelf.kind === 'circuit' ? `Circuit · ${shelf.games.length} today` : (shelf.name === 'Sudoku' ? `Category · ${shelf.games.length} grids` : `Category · ${shelf.games.length} ${shelf.games.length === 1 ? 'game' : 'games'}`)}</div>
                    <div className="tdy-hnm">
                      <h2>{shelf.name}</h2>
                      <span className={'tdy-prg' + (dn >= tot ? ' full' : '')}>
                        <b>{`${dn} of ${tot}`}</b>
                        <span className="pb" aria-hidden="true"><span style={{ width: `${tot ? Math.round((100 * dn) / tot) : 0}%` }} /></span>
                      </span>
                      {(() => {
                        const L = shelfLead[(shelf.kind || 'cat') + shelf.name];
                        if (!L) return null;
                        return (
                          <span className="tdy-hld" title={L.username + ' leads ' + shelf.name + ' today: ' + L.pts + ' points across ' + L.games + (L.games === 1 ? ' game' : ' games')}>
                            {CROWN}<i>{L.username}</i><b>{L.pts} pts</b>
                          </span>
                        );
                      })()}
                    </div>
                    {shelf.kind === 'circuit' && shelf.blurb ? (
                      <div className="nt">{shelf.blurb}</div>
                    ) : null}
                  </div>
                  <a className={cta.gold ? 'tdy-cta gold' : 'tdy-cta'} style={cta.gold ? undefined : { background: shelf.color, borderColor: shelf.color }} href={cta.href}>{cta.label}</a>
                </div>
                <TilesRow>
                  {sinkDone(shelf.games).map((g) => {
                    const st = statusLine(shelf, g);
                    const leader = leaderOf(g.key);
                    const cls = ['tdy-t'];
                    if (done.has(g.key)) cls.push('done');
                    else if (inprog.has(g.key)) cls.push('paused');
                    return (
                      <a key={g.key} className={cls.join(' ')} href={g.href}>
                        <img src={g.img} alt="" aria-hidden="true" loading="lazy" />
                        <b>{g.name}</b>
                        <span className={'tdy-st' + (st.cls ? ` ${st.cls}` : '')}>{st.text}</span>
                        <span className="tdy-ld">{leader ? <>{CROWN}<i>{leader}</i></> : null}</span>
                      </a>
                    );
                  })}
                </TilesRow>
              </div>
            </section>
          );
        })}

        <div className="tdy-two" id="tdy-boards">
          <div>
            <div className="tdy-restband" style={{ paddingTop: 38 }}>
              <h3>{TROPHY}<span style={{ marginLeft: 8 }}>Today&rsquo;s leaderboards</span></h3>
              <i>Resets at midnight Eastern</i>
            </div>
            <div className="tdy-card">
              <div className="tdy-tabs">
                {[['overall', 'Overall'], ['games', 'By game'], ['cats', 'By category'], ['circuits', 'Circuits']].map(([k, l]) => (
                  <button key={k} type="button" className={'tdy-tab' + (mode === k ? ' on' : '')} onClick={() => setMode(k)}>{l}</button>
                ))}
              </div>

              {mode === 'games' ? (
                <TilesRow light>
                  {flat.map(({ g }) => (
                    <button key={g.key} type="button" className={'tdy-pick' + (pickGame === g.key ? ' on' : '')} onClick={() => setPickGame(g.key)}>
                      <img src={g.img} alt="" aria-hidden="true" loading="lazy" />{g.name}
                    </button>
                  ))}
                </TilesRow>
              ) : null}
              {mode === 'cats' ? (
                <TilesRow light>
                  {shelves.map((s) => (
                    <button key={s.name} type="button" className={'tdy-pick txt' + (pickCat === s.name ? ' on' : '')} onClick={() => setPickCat(s.name)}>{s.name}</button>
                  ))}
                </TilesRow>
              ) : null}
              {mode === 'circuits' ? (
                <TilesRow light>
                  {CIRCUITS.map((c) => (
                    <button key={c.id} type="button" className={'tdy-pick txt' + (pickCirc === c.id ? ' on' : '')} onClick={() => setPickCirc(c.id)}>{c.name}</button>
                  ))}
                </TilesRow>
              ) : null}

              {mode === 'overall' ? (
                overall.length ? (
                  <>
                    <div className="tdy-sub">{board && typeof board.maxTotal === 'number' ? `Best ${bestN} of ${totalGames} games · ${board.maxTotal.toLocaleString()} pts max` : 'Combined placement across the day'}</div>
                    <div className="tdy-cols"><b>#</b><span>Player</span><s>Games</s><s>Total</s></div>
                    {overall.slice(0, 12).map((r, i) => (
                      <div key={(r && r.userKey) || i} className={'tdy-lr' + (i === 0 ? ' first' : '') + (meKey && r && r.userKey === meKey ? ' me' : '')}>
                        <b>{(r && r.rank) || i + 1}</b>
                        <span className="nm">{i === 0 ? CROWN : null}{(r && r.username) || 'Player'}{meKey && r && r.userKey === meKey ? ' · You' : ''}</span>
                        <span className="cell">{r && typeof r.gamesPlayed === 'number' ? `${r.gamesPlayed}/${totalGames}` : ''}</span>
                        <span className="cell pts">{fmtPts(r && r.total)}</span>
                      </div>
                    ))}
                    {!meInTop && board && board.me && typeof board.me.rank === 'number' ? (
                      <div className="tdy-lr me">
                        <b>{board.me.rank}</b>
                        <span className="nm">{board.me.username || 'You'} · You</span>
                        <span className="cell">{typeof board.me.gamesPlayed === 'number' ? `${board.me.gamesPlayed}/${totalGames}` : ''}</span>
                        <span className="cell pts">{fmtPts(board.me.total)}</span>
                      </div>
                    ) : null}
                    <a className="tdy-more" href="/quizzes/hub?tab=daily">Full standings on the Stat Hub →</a>
                  </>
                ) : (
                  <div className="tdy-empty">The day&rsquo;s board is loading, or nobody has played yet.</div>
                )
              ) : null}

              {mode === 'games' ? (() => {
                const g = DAILY_GAME_MAP[pickGame];
                const bg = bgFor(pickGame);
                const rows = bg && Array.isArray(bg.board) ? bg.board : (bgames ? [] : null);
                const eg = g && g.cat === 'End Game';
                const missLabel = eg ? 'Tries' : (g && g.miss ? g.miss : null);
                return (
                  <>
                    <div className="tdy-sub">{bg ? `${(bg.field || 0).toLocaleString()} played today${g && g.tag ? ` · ${g.tag}` : ''}` : 'Loading the board…'}</div>
                    {rows === null ? (
                      <div className="tdy-empty">Loading the board&hellip;</div>
                    ) : rows.length ? (
                      <>
                        <div className="tdy-cols"><b>#</b><span>Player</span><s>Score</s>{missLabel ? <s>{missLabel}</s> : null}<s>Time</s><s>Pts</s></div>
                        {rows.slice(0, 12).map((r, i) => (
                          <div key={(r && r.userKey) || i} className={'tdy-lr' + (i === 0 ? ' first' : '') + (meKey && r && r.userKey === meKey ? ' me' : '')}>
                            <b>{(r && r.rank) || i + 1}</b>
                            <span className="nm">{i === 0 ? CROWN : null}{(r && r.username) || 'Player'}{meKey && r && r.userKey === meKey ? ' · You' : ''}</span>
                            <span className="cell">{r && r.score != null ? `${r.score}${r.total ? '/' + r.total : ''}` : ''}</span>
                            {missLabel ? <span className="cell">{eg ? (r && r.tries != null ? r.tries : '—') : (r && r.guessesUsed != null ? r.guessesUsed : '—')}</span> : null}
                            <span className="cell">{fmtClock(r && r.timeElapsed)}</span>
                            <span className="cell pts">{fmtPts(r && r.points)}</span>
                          </div>
                        ))}
                        <a className="tdy-more" href={g ? g.href : '#'}>{g ? `Play ${g.name} →` : ''}</a>
                      </>
                    ) : (
                      <div className="tdy-empty">No registered results on this board yet today.</div>
                    )}
                  </>
                );
              })() : null}

              {mode === 'cats' ? (() => {
                const s = shelves.find((x) => x.name === pickCat);
                const rows = catAgg ? (catAgg[pickCat] || []) : null;
                return (
                  <>
                    <div className="tdy-sub">{`Placement points summed across ${s ? s.games.length : 0} ${pickCat} games`}</div>
                    {rows === null ? (
                      <div className="tdy-empty">Loading the board&hellip;</div>
                    ) : rows.length ? (
                      <>
                        <div className="tdy-cols"><b>#</b><span>Player</span><s>Games</s><s>Pts</s></div>
                        {rows.map((r, i) => (
                          <div key={r.userKey} className={'tdy-lr' + (i === 0 ? ' first' : '') + (meKey && r.userKey === meKey ? ' me' : '')}>
                            <b>{i + 1}</b>
                            <span className="nm">{i === 0 ? CROWN : null}{r.username || 'Player'}{meKey && r.userKey === meKey ? ' · You' : ''}</span>
                            <span className="cell">{`${r.games}/${s ? s.games.length : 0}`}</span>
                            <span className="cell pts">{fmtPts(r.pts)}</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="tdy-empty">Nobody on this category&rsquo;s boards yet today.</div>
                    )}
                  </>
                );
              })() : null}

              {mode === 'circuits' ? (() => {
                const d = circBoards[pickCirc];
                const c = circuitById(pickCirc);
                const rows = d && Array.isArray(d.overall) ? d.overall : null;
                return (
                  <>
                    <div className="tdy-sub">{(c && c.blurb) || ''}{d && typeof d.maxTotal === 'number' ? `${c && c.blurb ? ' · ' : ''}Best ${d.bestN} · ${d.maxTotal} pts max` : ''}</div>
                    {rows === null ? (
                      <div className="tdy-empty">Loading the circuit board&hellip;</div>
                    ) : rows.length ? (
                      <>
                        <div className="tdy-cols"><b>#</b><span>Player</span><s>Games</s><s>Total</s></div>
                        {rows.slice(0, 12).map((r, i) => (
                          <div key={(r && r.userKey) || i} className={'tdy-lr' + (i === 0 ? ' first' : '') + (meKey && r && r.userKey === meKey ? ' me' : '')}>
                            <b>{(r && r.rank) || i + 1}</b>
                            <span className="nm">{i === 0 ? CROWN : null}{(r && r.username) || 'Player'}{meKey && r && r.userKey === meKey ? ' · You' : ''}</span>
                            <span className="cell">{r && typeof r.gamesPlayed === 'number' ? `${r.gamesPlayed}${d && d.gameCount ? '/' + d.gameCount : ''}` : ''}</span>
                            <span className="cell pts">{fmtPts(r && r.total)}</span>
                          </div>
                        ))}
                        <a className="tdy-more" href={circuitPageHref(pickCirc)}>{c ? `The ${c.name} circuit →` : ''}</a>
                      </>
                    ) : (
                      <div className="tdy-empty">No complete runs on this circuit yet today. A circuit ranks players who finish all of the day&rsquo;s games in it.</div>
                    )}
                  </>
                );
              })() : null}
            </div>
          </div>

          <div>
            <div className="tdy-restband" style={{ paddingTop: 38 }}>
              <h3><span className="tdy-pulse" style={{ display: 'inline-block' }} /><span style={{ marginLeft: 8 }}>Live feed</span></h3>
              <i>Results as they land, anonymous by design</i>
            </div>
            <div className="tdy-card">
              <div className="tdy-fstats">
                <div><b>{totals ? totals.today.toLocaleString() : '—'}</b><span>Plays today</span></div>
                <div><b>{totals ? totals.todayPlayers.toLocaleString() : '—'}</b><span>Players</span></div>
                <div><b>{totals ? fmtDur(totals.todayTime) : '—'}</b><span>Time played</span></div>
              </div>
              {recent && recent.length ? recent.map((p, i) => {
                const g = feedGame(p.quizId);
                return (
                  <div key={i} className="tdy-lr feed">
                    {g ? <img className="fic" src={g.img} alt="" aria-hidden="true" loading="lazy" /> : <span className="fdot" aria-hidden="true" />}
                    <span className="nm">{g ? g.name : (p.quizId || 'Quiz')}</span>
                    {p && p.total > 0 ? <span className="gm">{`${p.score}/${p.total}`}</span> : <span className="gm" />}
                    <span className="sc">{agoLabel(p.playedAt)}</span>
                  </div>
                );
              }) : (
                <div className="tdy-empty">Recent results land here.</div>
              )}
            </div>
          </div>
        </div>

        <div className="tdy-foot">{`${totalGames} daily puzzles · new drops at midnight Eastern`}</div>
      </div>
    </div>
  );
}

const CSS = `
.tdy{background:${PAPER};font-family:'Manrope',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;}
.tdy-wrap{max-width:1560px;margin:0 auto;padding:0 clamp(16px,1.7vw,24px) 24px;}
/* On the homepage the marquee lives inside .qzh (maxWidth 1560 with its own
   side padding), so the wrap sheds its own width cap and padding there to line
   up exactly with the quiz browse sections below. The phone negative margins
   mirror .qzh's side padding (16px to 900px, 14px under 560) so the full-bleed
   phone treatment still reaches the screen edges. */
.dhx-marquee .tdy-wrap{max-width:none;padding-left:0;padding-right:0;}

/* ── the welcome band: Dawn's greeting in the scheme blues ── */
.tdy-hero{background:linear-gradient(115deg,#dbeafe 0%,#e8effe 55%,#f2f6ff 100%);border-radius:18px;padding:20px 24px;display:flex;align-items:center;gap:22px;flex-wrap:wrap;margin:18px 2px 0;}
.tdy-hero .hi{font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;color:#1d4ed8;min-height:13px;}
.tdy-hero h1{font-size:clamp(21px,2.3vw,26px);font-weight:800;letter-spacing:-.02em;color:#16255f;margin:4px 0 0;}
.tdy-hero .sub{font-size:13px;font-weight:700;color:#5a6a8a;margin-top:6px;font-variant-numeric:tabular-nums;}
.tdy-hero .bar{width:170px;height:7px;border-radius:99px;background:rgba(255,255,255,.6);overflow:hidden;margin-top:9px;}
.tdy-hero .bar span{display:block;height:100%;background:#2563eb;border-radius:99px;transition:width .3s;}
.tdy-hero .hr{margin-left:auto;display:flex;gap:10px;flex-wrap:wrap;}
.tdy-mini{display:flex;align-items:center;gap:10px;background:var(--white);border-radius:12px;padding:8px 14px 8px 10px;text-decoration:none;box-shadow:0 8px 20px rgba(30,58,138,.12);}
.tdy-mini:hover{background:#fbfcff;}
.tdy-mini .ic{width:26px;height:26px;border-radius:8px;background:#eef3ff;display:flex;align-items:center;justify-content:center;flex:none;}
.tdy-mini .k{display:block;font-size:9px;letter-spacing:.13em;text-transform:uppercase;color:#1d4ed8;font-weight:800;line-height:1;}
.tdy-mini .v{display:block;font-size:12.5px;font-weight:800;color:var(--ink);line-height:1.2;white-space:nowrap;font-variant-numeric:tabular-nums;}
.tdy-pulse{width:6px;height:6px;border-radius:50%;background:#22a35f;box-shadow:0 0 0 0 rgba(34,163,95,.5);animation:tdypul 2s infinite;flex:none;}
@keyframes tdypul{0%{box-shadow:0 0 0 0 rgba(34,163,95,.5);}70%{box-shadow:0 0 0 7px rgba(34,163,95,0);}100%{box-shadow:0 0 0 0 rgba(34,163,95,0);}}

/* ── the view selector ── */
.tdy-view{display:flex;gap:6px;padding:14px 2px 0;}
.tdy-viewbtn{font-family:inherit;background:var(--white);border:1px solid #d7dce6;color:#6b7280;font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;border-radius:999px;padding:6px 14px;cursor:pointer;}
.tdy-viewbtn:hover{border-color:#a8b6cc;color:var(--ink);}
.tdy-viewbtn.on{background:#1e3a8a;border-color:#1e3a8a;color:var(--white);}

/* ── shelf cards: white on paper, tinted header strip, 4px category rule ── */
.tdy-row{display:block;}
.tdy-shc{background:var(--white);border:1px solid #e7e9ee;border-radius:14px;overflow:hidden;box-shadow:0 1px 2px rgba(16,24,40,.04);margin:14px 2px 0;}
.tdy-shc.foryou{margin-top:16px;}
.tdy-hd{display:flex;align-items:center;gap:12px;padding:9px 14px 9px 18px;position:relative;background:#eef2f8;background:color-mix(in srgb,var(--cc) 9%,#fff);}
.tdy-hd::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--cc);}
.tdy-hd .eb{font-size:9.5px;letter-spacing:.13em;text-transform:uppercase;font-weight:800;color:#6b7280;}
.tdy-hd h2{font-size:17px;font-weight:800;letter-spacing:-.02em;line-height:1.1;margin:2px 0 0;color:var(--ink);}
.tdy-hd .nt{font-size:11.5px;font-weight:600;color:#6b7280;margin-top:3px;}
.tdy-hnm{display:flex;align-items:center;gap:10px;min-width:0;}
.tdy-prg{display:inline-flex;align-items:center;gap:6px;flex:none;margin-top:2px;}
.tdy-prg b{font-size:11px;font-weight:800;color:#6b7280;font-variant-numeric:tabular-nums;white-space:nowrap;}
.tdy-prg .pb{width:44px;height:4px;border-radius:99px;background:rgba(16,24,40,.10);overflow:hidden;}
.tdy-prg .pb span{display:block;height:100%;background:var(--cc);border-radius:99px;transition:width .3s;}
.tdy-prg.full b{color:var(--success-deep);}
.tdy-prg.full .pb span{background:#22c55e;}
.tdy-hld{display:inline-flex;align-items:center;gap:5px;flex:none;max-width:190px;border-radius:999px;padding:2px 9px 2px 8px;background:#fdf3d7;border:1px solid #eeda9e;}
.tdy-hld i{font-style:normal;font-size:11px;font-weight:800;color:#8a6d1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tdy-hld b{font-size:10px;font-weight:800;color:#a1750b;font-variant-numeric:tabular-nums;flex:none;}
.tdy-cta{margin-left:auto;border:1px solid var(--cc);background:var(--cc);color:var(--white);font-size:10.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;border-radius:999px;padding:6px 13px;white-space:nowrap;flex:none;text-decoration:none;}
.tdy-cta:hover{filter:brightness(1.12);}
.tdy-cta.gold{background:var(--gold);border-color:var(--gold);color:#2a1f04;}
.tdy-cta.gold:hover{filter:none;background:#f2c451;}

/* ── tile tracks ── */
.tdy-tw{position:relative;}
.tdy-tiles{display:flex;gap:9px;overflow-x:auto;padding:12px 14px 12px;scrollbar-width:none;}
.tdy-tiles::-webkit-scrollbar{display:none;}
.tdy-fade{position:absolute;top:0;bottom:0;width:46px;pointer-events:none;opacity:0;transition:opacity .15s;z-index:3;}
.tdy-fade.l{left:0;background:linear-gradient(90deg,#fff,rgba(255,255,255,0));}
.tdy-fade.r{right:0;background:linear-gradient(270deg,#fff,rgba(255,255,255,0));}
.tdy-fade.on{opacity:1;}
.tdy-nud{position:absolute;top:50%;transform:translateY(-50%);width:30px;height:30px;border-radius:50%;background:var(--white);border:1px solid #d7dce6;color:var(--slate);font-size:17px;font-weight:800;line-height:1;cursor:pointer;z-index:4;display:flex;align-items:center;justify-content:center;padding:0 0 2px;font-family:inherit;box-shadow:0 2px 8px rgba(16,24,40,.14);}
.tdy-nud:hover{border-color:#a8b6cc;color:var(--ink);}
.tdy-nud.l{left:4px;}
.tdy-nud.r{right:4px;}
.tdy-t{flex:none;width:124px;background:${PAPER};border:1px solid #edeff3;border-radius:12px;padding:12px 6px 9px;display:flex;flex-direction:column;align-items:center;gap:7px;text-decoration:none;}
.tdy-t:hover{background:#eef2f7;}
.tdy-t img{width:48px;height:48px;border-radius:10px;display:block;flex:none;}
.tdy-t b{color:var(--ink);font-size:13px;font-weight:800;letter-spacing:-.01em;text-align:center;line-height:1.1;}
.tdy-st{font-style:normal;font-size:10.5px;font-weight:700;color:#6b7280;white-space:nowrap;padding:2px 7px;border-radius:999px;min-height:17px;}
.tdy-st.tk{color:var(--success-deep);font-weight:800;}
.tdy-st.tp{color:#a16207;font-weight:800;}
.tdy-ld{display:flex;align-items:center;gap:4px;min-height:12px;max-width:112px;overflow:hidden;}
.tdy-ld i{font-style:normal;font-size:9.5px;font-weight:700;color:#9aa0ab;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tdy-t.done{background:#eef7ef;border-color:#d8ecd9;}
.tdy-t.paused{background:#fff7e0;border-color:#ecd9a0;}
.tdy-t.fy{width:138px;}
.tdy-why{font-size:9.5px;font-weight:800;border-radius:999px;padding:3px 9px;white-space:nowrap;}
.tdy-why.g{background:#fdf3d7;color:#8a6d1a;}
.tdy-why.b{background:#e7eeff;color:#1d4ed8;}
.tdy-why.s{background:#e9edf5;color:#233a63;}

/* ── a finished category collapses to a band ── */
.tdy-catdone{display:flex;align-items:center;gap:14px;background:var(--white);border:1px solid #e7e9ee;border-left:4px solid var(--success-deep);border-radius:14px;padding:12px 16px;margin:14px 2px 0;flex-wrap:wrap;box-shadow:0 1px 2px rgba(16,24,40,.04);}
.tdy-catdone .nm{font-size:14.5px;font-weight:800;color:var(--ink);letter-spacing:-.01em;}
.tdy-catdone .ck{font-size:11px;font-weight:800;color:var(--success-deep);white-space:nowrap;}
.tdy-catdone .it{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:#3f4757;padding-left:10px;border-left:1px solid #e7e9ee;white-space:nowrap;text-decoration:none;}
.tdy-catdone .it img{width:20px;height:20px;border-radius:5px;display:block;}
.tdy-catdone .show{margin-left:auto;font-family:inherit;font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--blue-deep);border:1.5px solid #cddffb;background:#eef3ff;border-radius:999px;padding:6px 12px;cursor:pointer;white-space:nowrap;}
.tdy-catdone .show:hover{background:#e2ecff;}

.tdy-restband{display:flex;align-items:baseline;gap:12px;padding:26px 2px 0;flex-wrap:wrap;}
.tdy-restband h3{font-size:12px;letter-spacing:.15em;text-transform:uppercase;font-weight:800;color:#9aa0ab;margin:0;display:inline-flex;align-items:center;}
.tdy-restband i{font-style:normal;font-size:12px;font-weight:600;color:#b3b9c4;}

/* ── the foot boards + live feed ── */
.tdy-two{display:grid;grid-template-columns:1fr 1fr;gap:0 18px;align-items:start;}
.tdy-two>div{min-width:0;}
.tdy-card{background:var(--white);border:1px solid #e7e9ee;border-radius:12px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:10px 12px;margin:10px 2px 0;}
.tdy-cols{display:flex;align-items:center;gap:9px;padding:4px 10px 8px;font-size:9.5px;letter-spacing:.11em;text-transform:uppercase;color:#9aa0ab;font-weight:800;border-bottom:1px solid var(--border);margin-bottom:4px;}
.tdy-cols b{width:18px;flex:none;font-weight:800;}
.tdy-cols span{flex:1 1 auto;}
.tdy-cols s{text-decoration:none;flex:none;width:56px;text-align:right;}
.tdy-lr{display:flex;align-items:center;gap:9px;padding:8px 10px;border-left:4px solid transparent;border-radius:0 7px 7px 0;font-size:13px;color:var(--ink);}
.tdy-lr b{font-size:11px;color:#9aa0ab;width:18px;flex:none;font-variant-numeric:tabular-nums;font-weight:800;}
.tdy-lr .nm{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:800;flex:1 1 auto;display:inline-flex;align-items:center;gap:6px;}
.tdy-lr .gm{flex:none;width:56px;text-align:right;font-variant-numeric:tabular-nums;color:#9aa0ab;font-weight:700;font-size:11.5px;}
.tdy-lr .sc{flex:none;width:56px;text-align:right;font-variant-numeric:tabular-nums;color:var(--slate);white-space:nowrap;font-weight:800;font-size:12.5px;}
.tdy-lr.first{border-left-color:var(--gold);background:#fffaf0;}
.tdy-lr.me{border-left-color:var(--blue);background:#eef3ff;}
.tdy-lr.me .nm{color:var(--blue-deep);}
.tdy-lr .fic{width:22px;height:22px;border-radius:5px;flex:none;}
.tdy-lr .fdot{width:22px;height:22px;border-radius:5px;flex:none;background:var(--surface-alt);}
.tdy-lr.feed .sc{font-weight:700;color:#9aa0ab;font-size:11.5px;width:64px;}
.tdy-more{display:block;font-size:11.5px;font-weight:800;color:var(--blue-deep);padding:10px 10px 4px;text-decoration:none;}
.tdy-tabs{display:flex;gap:6px;padding:2px 4px 10px;border-bottom:1px solid var(--border);margin-bottom:8px;flex-wrap:wrap;}
.tdy-tab{font-family:inherit;font-size:10.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:6px 12px;border-radius:999px;background:var(--surface);color:var(--slate);border:0;cursor:pointer;}
.tdy-tab.on{background:var(--accent);color:var(--white);}
.tdy-tab:hover:not(.on){background:var(--surface-alt);color:var(--ink);}
.tdy-tw.light .tdy-tiles{padding:2px 2px 8px;gap:6px;}
.tdy-pick{font-family:inherit;display:inline-flex;align-items:center;gap:6px;flex:none;padding:5px 11px 5px 6px;border-radius:999px;background:var(--surface);font-size:11.5px;font-weight:800;color:var(--ink);border:0;cursor:pointer;white-space:nowrap;}
.tdy-pick img{width:18px;height:18px;border-radius:4px;display:block;}
.tdy-pick.txt{padding:6px 12px;}
.tdy-pick.on{background:var(--accent);color:var(--white);}
.tdy-pick:hover:not(.on){background:var(--surface-alt);}
.tdy-tw.light .tdy-fade{bottom:8px;}
.tdy-tw.light .tdy-fade.l{background:linear-gradient(90deg,var(--white),rgba(255,255,255,0));}
.tdy-tw.light .tdy-fade.r{background:linear-gradient(270deg,var(--white),rgba(255,255,255,0));}
.tdy-tw.light .tdy-nud{background:var(--white);border-color:var(--border);color:var(--slate);box-shadow:0 2px 8px rgba(3,7,18,.18);}
.tdy-tw.light .tdy-nud:hover{color:var(--ink);border-color:#c9d2e0;background:var(--white);}
.tdy-sub{font-size:11px;font-weight:700;color:#9aa0ab;padding:2px 10px 8px;}
.tdy-lr .cell{flex:none;width:52px;text-align:right;font-variant-numeric:tabular-nums;color:var(--slate);font-weight:700;font-size:12px;white-space:nowrap;}
.tdy-lr .cell.pts{font-weight:800;color:var(--ink);}
.tdy-cols s{width:52px;}
.tdy-fstats{display:flex;border-bottom:1px solid var(--border);margin-bottom:8px;padding:4px 0 10px;}
.tdy-fstats>div{flex:1 1 0;padding:0 12px;border-right:1px solid var(--border);}
.tdy-fstats>div:last-child{border-right:none;}
.tdy-fstats b{display:block;font-size:17px;font-weight:800;letter-spacing:-.01em;font-variant-numeric:tabular-nums;color:var(--ink);}
.tdy-fstats span{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#9aa0ab;font-weight:800;}
.tdy-empty{padding:14px 10px;font-size:12.5px;font-weight:600;color:var(--slate);}
.tdy-foot{padding:40px 2px 40px;color:#9aa0ab;font-size:11px;font-weight:600;letter-spacing:.04em;}
@media(max-width:900px){
  .tdy-wrap{padding:0 0 30px;}
  .dhx-marquee{margin-left:-16px;margin-right:-16px;}
  .tdy-hero{margin:0;border-radius:0;padding:18px 16px;}
  .tdy-hero .hr{flex:1 1 100%;margin-left:0;}
  .tdy-hero .hr .tdy-mini{flex:1 1 auto;}
  .tdy-hero .bar{width:100%;}
  .tdy-view{padding-left:16px;}
  .tdy-shc{border-radius:0;border-left:none;border-right:none;margin:14px 0 0;}
  .tdy-hd{padding-left:18px;padding-right:14px;}
  .tdy-hld{max-width:132px;}
  .tdy-tiles{padding-left:14px;padding-right:14px;}
  .tdy-t{width:118px;}
  .tdy-t.fy{width:130px;}
  .tdy-nud{display:none;}
  .tdy-fade{display:none;}
  .tdy-catdone{border-radius:0;border-left-width:4px;border-right:none;margin:14px 0 0;}
  .tdy-restband{padding-left:16px;padding-right:16px;}
  .tdy-two{grid-template-columns:1fr;}
  .tdy-card{border-radius:0;border-left:none;border-right:none;margin:10px 0 0;}
  .tdy-foot{padding-left:16px;}
}
@media(max-width:560px){
  .dhx-marquee{margin-left:-14px;margin-right:-14px;}
}
`;
