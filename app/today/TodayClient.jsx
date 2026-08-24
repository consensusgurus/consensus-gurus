'use client';

// The marquee category home (live preview at /today). One sideways-scrolling
// shelf per category on the midnight ground, ordered Word, Sudoku, End Game,
// Logic, then the rest. White tiles carry the ORIGINAL colored game art
// (/games/btn-<key>.png); state language matches the slate: gold = paused,
// green = done, dimmed = a sudoku resting out of today's five, crowd count on
// unplayed tiles. Each tile also names the game's current leader.
//
// DATA is the same plumbing the slate uses, deliberately:
//   - done/paused detection is DailyStrip's three-pass recipe verbatim:
//     (1) sot_<key>_day breadcrumbs on first paint, (2) fetchDayStatus
//     (completed/played/abandoned/inProgress ids, streaks), (3) per-puzzle
//     saves keyed by the daily-combined payload's nums, gated on t0 per the
//     opening-is-not-starting rule.
//   - per-game plays/standings/leaders come from /api/quiz/daily-combined.
//   - the drawer IS DailyTilePanel, mounted static (its own <=900 branch
//     proves it renders position:static; .tdy-pw forces that at every width).
//   - the Sudoku shelf is the sudoku circuit: pool of eight, today's five from
//     circuitKeysFor, the resting three dimmed. The date is read in an EFFECT,
//     never during render, so SSR and the client agree.
//   - the live feed section is ANONYMOUS by owner rule (2026-08-10): rows
//     carry results without attribution, the band carries the day's totals.
//
// NEVER add a blanket `.tdy a { color: ... }` rule here. The drawer is
// DailyTilePanel, whose link colors are single-class selectors; a `.tdy a`
// rule out-specifies them and turned the slab's Play button white-on-white
// (caught live, 2026-08-24). Style anchors by their own class only.

import { useEffect, useMemo, useRef, useState } from 'react';
import { DAILY_GAMES, DAILY_GAME_MAP } from '@/lib/daily-games';
import { circuitById, circuitKeysFor, circuitPageHref } from '@/lib/circuits';
import { catBlue } from '@/lib/home-blues';
import DailyTilePanel from '../DailyTilePanel';
import useDayStats, { fetchDayStatus, etToday, DAY_ROSTER } from '../useDayStats';

const GROUND = '#0b0f1a';
const CAT_ORDER = ['Word', 'Sudoku', 'End Game', 'Logic', 'Numbers', 'Trivia', 'Crowd Psychology', 'Geography', 'Cards', 'Arcade'];
const SUDOKU_COLOR = '#1d4ed8'; // not in CAT_BLUE; the mockup's pick, distinct from Numbers and Trivia

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
// whichever side has more to show, plus a short ground-colored fade under it.
// Same idea as the slate's category-strip cue, made clickable for a mouse; on
// touch the chips are hidden and the track simply flicks.
function TilesRow({ children }) {
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
    <div className="tdy-tw">
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
      return { name, color: catColor(name), games };
    }).filter((s) => s.games.length);
  }, []);
  const totalGames = useMemo(() => shelves.reduce((n, s) => n + s.games.length, 0), [shelves]);

  // ── the day, read in an effect so SSR and the client never disagree ──
  const [today, setToday] = useState(null);
  const [dateLabel, setDateLabel] = useState('');
  useEffect(() => {
    const iso = etToday();
    setToday(iso);
    try {
      setDateLabel(new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).replace(',', ' ·'));
    } catch (e) { setDateLabel(iso); }
  }, []);
  const sudokuActive = useMemo(() => {
    if (!today) return null;
    try { return new Set(circuitKeysFor('sudoku', today)); } catch (e) { return null; }
  }, [today]);

  // ── play state: DailyStrip's three passes ──
  const [done, setDone] = useState(() => new Set());
  const [inprog, setInprog] = useState(() => new Set());
  const [streaks, setStreaks] = useState({});

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
      if (data.streaks && typeof data.streaks === 'object') setStreaks(data.streaks);
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
      if (alive && d && !d.error) setTotals({ today: d.today || 0, todayPlayers: d.todayPlayers || 0 });
    }).catch(() => {});
    fetch('/api/quiz/recent').then((r) => r.json()).then((d) => {
      if (alive && d && Array.isArray(d.plays)) setRecent(d.plays.slice(0, 18));
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  // ── the drawer: selected game + its archive/all-time payload ──
  const [sel, setSel] = useState(null);
  const [gameData, setGameData] = useState({});
  useEffect(() => {
    if (!sel || gameData[sel]) return;
    const qs = new URLSearchParams({ game: sel });
    try { const a = localStorage.getItem('sot_quiz_anon'); if (a) qs.set('anonId', a); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); if (id && id.email) qs.set('email', id.email); } catch (e) {}
    let alive = true;
    fetch('/api/quiz/daily-game?' + qs.toString())
      .then((r) => r.json())
      .then((d) => { if (alive && d && !d.error) setGameData((cur) => ({ ...cur, [sel]: d })); })
      .catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel]);

  const isResting = (shelf, key) => shelf.name === 'Sudoku' && sudokuActive && !sudokuActive.has(key);

  // Continue: first paused game in shelf order, else first unplayed
  const flat = useMemo(() => shelves.flatMap((s) => s.games.map((g) => ({ g, shelf: s }))), [shelves]);
  const continueGame = useMemo(() => {
    const paused = flat.find(({ g }) => inprog.has(g.key) && !done.has(g.key));
    if (paused) return { g: paused.g, resume: true };
    const next = flat.find(({ g, shelf }) => !done.has(g.key) && !isResting(shelf, g.key));
    return next ? { g: next.g, resume: false } : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flat, inprog, done, sudokuActive]);

  const shelfCta = (shelf) => {
    if (shelf.name === 'Sudoku') return { label: 'Play the circuit', href: circuitPageHref('sudoku'), gold: false };
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
    if (isResting(shelf, g.key)) return { cls: 'tr', text: 'Back soon' };
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

  const overall = board && Array.isArray(board.overall) ? board.overall : [];
  const meInTop = meKey ? overall.slice(0, 12).some((r) => r && r.userKey === meKey) : true;
  const bestN = board && typeof board.bestN === 'number' ? board.bestN : 25;

  return (
    <div className="tdy">
      <style>{CSS}</style>

      <div className="tdy-wrap">
        <div className="tdy-today">
          <div>
            <div className="tdy-eb">{dateLabel || ' '}</div>
            <h1>The day&rsquo;s puzzles, by category</h1>
          </div>
          <div className="tdy-right">
            <span className="tdy-ct">{day.ready || day.done ? `${day.done} of ${day.total} played today` : ' '}</span>
            <a className="tdy-mini" href="#tdy-boards">
              <span className="ic"><span className="tdy-pulse" /></span>
              <span><span className="k">Live feed</span><span className="v">{totals ? `${totals.today.toLocaleString()} plays today` : 'Across the Loft'}</span></span>
            </a>
            <a className="tdy-mini" href="#tdy-boards">
              <span className="ic">{TROPHY}</span>
              <span><span className="k">Leaderboards</span><span className="v">{day.dayRank ? `You're #${day.dayRank.toLocaleString()} today` : "Today's standings"}</span></span>
            </a>
            {continueGame ? (
              <a className="tdy-go" href={continueGame.g.href}>{`${continueGame.resume ? 'Continue' : 'Play'} · ${continueGame.g.name}`}</a>
            ) : null}
          </div>
        </div>

        {shelves.map((shelf, si) => {
          const cta = shelfCta(shelf);
          const selHere = sel && shelf.games.some((g) => g.key === sel) ? shelf.games.find((g) => g.key === sel) : null;
          const selBg = selHere ? bgFor(selHere.key) : null;
          return (
            <section key={shelf.name} className="tdy-row">
              {si === 4 ? (
                <div className="tdy-restband"><h3>The rest of the slate</h3><i>{`${CAT_ORDER.length - 4} more categories`}</i></div>
              ) : null}
              <div className="tdy-hd" style={{ borderLeftColor: shelf.color }}>
                <div>
                  <div className="eb">{shelf.name === 'Sudoku' ? `Category · ${shelf.games.length} grids · 5 today` : `Category · ${shelf.games.length} ${shelf.games.length === 1 ? 'game' : 'games'}`}</div>
                  <h2>{shelf.name}</h2>
                  {shelf.name === 'Sudoku' ? (
                    <div className="nt">Five on the card each day from a pool of eight, easiest grid first. A different mix tomorrow.</div>
                  ) : null}
                </div>
                <a className={cta.gold ? 'tdy-cta gold' : 'tdy-cta'} href={cta.href}>{cta.label}</a>
              </div>
              <TilesRow>
                {shelf.games.map((g) => {
                  const st = statusLine(shelf, g);
                  const resting = isResting(shelf, g.key);
                  const leader = resting ? null : leaderOf(g.key);
                  const cls = ['tdy-t'];
                  if (done.has(g.key)) cls.push('done');
                  else if (inprog.has(g.key)) cls.push('paused');
                  else if (resting) cls.push('resting');
                  if (sel === g.key) cls.push('sel');
                  return (
                    <a key={g.key} className={cls.join(' ')} href={g.href} onClick={resting ? (e) => e.preventDefault() : undefined} aria-disabled={resting || undefined}>
                      <img src={g.img} alt="" aria-hidden="true" loading="lazy" />
                      <b>{g.name}</b>
                      <span
                        className={'tdy-st' + (st.cls ? ` ${st.cls}` : '')}
                        role="button"
                        tabIndex={0}
                        title="Record, board & archive"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSel(sel === g.key ? null : g.key); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setSel(sel === g.key ? null : g.key); } }}
                      >{st.text}</span>
                      <span className="tdy-ld">{leader ? <>{CROWN}<i>{leader}</i></> : null}</span>
                    </a>
                  );
                })}
              </TilesRow>
              {selHere ? (
                <div className="tdy-pw">
                  <DailyTilePanel
                    key={'panel-' + selHere.key}
                    game={selHere}
                    accent={shelf.color}
                    isDone={done.has(selHere.key)}
                    inProgress={inprog.has(selHere.key)}
                    streak={streaks[selHere.key] || 0}
                    todayRow={myRow(selHere.key)}
                    todayField={selBg && typeof selBg.field === 'number' ? selBg.field : null}
                    standings={selBg && Array.isArray(selBg.board) ? selBg.board : []}
                    meKey={meKey}
                    data={gameData[selHere.key] || null}
                    canPin={false}
                    onClose={() => setSel(null)}
                  />
                </div>
              ) : null}
            </section>
          );
        })}

        <div className="tdy-two" id="tdy-boards">
          <div>
            <div className="tdy-restband" style={{ paddingTop: 38 }}>
              <h3>{TROPHY}<span style={{ marginLeft: 8 }}>Today&rsquo;s leaderboard</span></h3>
              <i>{board && typeof board.maxTotal === 'number' ? `Best ${bestN} of ${totalGames} · ${board.maxTotal.toLocaleString()} pts max · resets at midnight` : 'Combined placement across the day'}</i>
            </div>
            <div className="tdy-card">
              {overall.length ? (
                <>
                  <div className="tdy-cols"><b>#</b><span>Player</span><s>Games</s><s>Total</s></div>
                  {overall.slice(0, 12).map((r, i) => (
                    <div key={(r && r.userKey) || i} className={'tdy-lr' + (i === 0 ? ' first' : '') + (meKey && r && r.userKey === meKey ? ' me' : '')}>
                      <b>{(r && r.rank) || i + 1}</b>
                      <span className="nm">{i === 0 ? CROWN : null}{(r && r.username) || 'Player'}{meKey && r && r.userKey === meKey ? ' · You' : ''}</span>
                      <span className="gm">{r && typeof r.gamesPlayed === 'number' ? `${r.gamesPlayed}/${totalGames}` : ''}</span>
                      <span className="sc">{fmtPts(r && r.total)}</span>
                    </div>
                  ))}
                  {!meInTop && board && board.me && typeof board.me.rank === 'number' ? (
                    <div className="tdy-lr me">
                      <b>{board.me.rank}</b>
                      <span className="nm">{board.me.username || 'You'} · You</span>
                      <span className="gm">{typeof board.me.gamesPlayed === 'number' ? `${board.me.gamesPlayed}/${totalGames}` : ''}</span>
                      <span className="sc">{fmtPts(board.me.total)}</span>
                    </div>
                  ) : null}
                  <a className="tdy-more" href="/quizzes/hub?tab=daily">Full standings &amp; per-game boards →</a>
                </>
              ) : (
                <div className="tdy-empty">The day&rsquo;s board is loading, or nobody has played yet.</div>
              )}
            </div>
          </div>

          <div>
            <div className="tdy-restband" style={{ paddingTop: 38 }}>
              <h3><span className="tdy-pulse" style={{ display: 'inline-block' }} /><span style={{ marginLeft: 8 }}>Live feed</span></h3>
              <i>{totals ? `${totals.today.toLocaleString()} plays · ${totals.todayPlayers.toLocaleString()} players today` : 'Results as they land'}</i>
            </div>
            <div className="tdy-card">
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
.tdy{background:${GROUND};font-family:'Manrope',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;}
.tdy-wrap{max-width:1280px;margin:0 auto;padding:0 clamp(16px,1.7vw,24px) 24px;}
.tdy-today{display:flex;align-items:flex-end;gap:16px;padding:26px 2px 18px;color:var(--white);}
.tdy-eb{font-size:11px;letter-spacing:.15em;text-transform:uppercase;font-weight:800;color:#8fa8dc;min-height:13px;}
.tdy-today h1{font-size:clamp(21px,2.4vw,27px);font-weight:800;letter-spacing:-.02em;margin:5px 0 0;color:var(--white);}
.tdy-right{margin-left:auto;display:flex;align-items:center;gap:9px;}
.tdy-ct{font-size:12.5px;font-weight:700;color:#8fa8dc;white-space:nowrap;font-variant-numeric:tabular-nums;margin-right:5px;}
.tdy-mini{display:flex;align-items:center;gap:10px;background:#121f3f;border:1px solid #22345e;border-radius:10px;padding:7px 13px 7px 9px;text-decoration:none;}
.tdy-mini:hover{background:#182a52;border-color:#2f4a85;}
.tdy-mini .ic{width:26px;height:26px;border-radius:8px;background:#16306e;display:flex;align-items:center;justify-content:center;flex:none;}
.tdy-mini .k{display:block;font-size:9px;letter-spacing:.13em;text-transform:uppercase;color:#8fa8dc;font-weight:800;line-height:1;}
.tdy-mini .v{display:block;font-size:12.5px;font-weight:800;color:var(--white);line-height:1.2;white-space:nowrap;font-variant-numeric:tabular-nums;}
.tdy-pulse{width:6px;height:6px;border-radius:50%;background:#5ad48f;box-shadow:0 0 0 0 rgba(90,212,143,.5);animation:tdypul 2s infinite;flex:none;}
@keyframes tdypul{0%{box-shadow:0 0 0 0 rgba(90,212,143,.5);}70%{box-shadow:0 0 0 7px rgba(90,212,143,0);}100%{box-shadow:0 0 0 0 rgba(90,212,143,0);}}
.tdy-go{background:var(--gold);color:#2a1f04;font-size:12px;font-weight:800;letter-spacing:.03em;text-transform:uppercase;border-radius:8px;padding:9px 14px;white-space:nowrap;text-decoration:none;}
.tdy-go:hover{background:#f2c451;}
.tdy-row{display:block;}
.tdy-hd{display:flex;align-items:center;gap:12px;color:var(--white);border-left:4px solid #2563eb;padding:2px 2px 2px 12px;margin:16px 0 10px;}
.tdy-hd .eb{font-size:10px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;color:#8fa8dc;}
.tdy-hd h2{font-size:19px;font-weight:800;letter-spacing:-.02em;line-height:1.1;margin:2px 0 0;color:var(--white);}
.tdy-hd .nt{font-size:11.5px;font-weight:600;color:#7d95c9;margin-top:3px;}
.tdy-cta{margin-left:auto;border:1px solid #2c437c;color:#cfe0ff;font-size:10.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;border-radius:999px;padding:6px 12px;white-space:nowrap;flex:none;text-decoration:none;}
.tdy-cta:hover{border-color:#4f74cc;color:#fff;}
.tdy-cta.gold{background:var(--gold);border-color:var(--gold);color:#2a1f04;}
.tdy-tw{position:relative;}
.tdy-tiles{display:flex;gap:9px;overflow-x:auto;padding:2px 2px 10px;scrollbar-width:none;}
.tdy-tiles::-webkit-scrollbar{display:none;}
.tdy-fade{position:absolute;top:0;bottom:10px;width:46px;pointer-events:none;opacity:0;transition:opacity .15s;z-index:3;}
.tdy-fade.l{left:0;background:linear-gradient(90deg,${GROUND},rgba(11,15,26,0));}
.tdy-fade.r{right:0;background:linear-gradient(270deg,${GROUND},rgba(11,15,26,0));}
.tdy-fade.on{opacity:1;}
.tdy-nud{position:absolute;top:50%;transform:translateY(-60%);width:30px;height:30px;border-radius:50%;background:#121f3f;border:1px solid #2c437c;color:#cfe0ff;font-size:17px;font-weight:800;line-height:1;cursor:pointer;z-index:4;display:flex;align-items:center;justify-content:center;padding:0 0 2px;font-family:inherit;}
.tdy-nud:hover{border-color:#4f74cc;color:#fff;background:#182a52;}
.tdy-nud.l{left:-8px;}
.tdy-nud.r{right:-8px;}
.tdy-t{flex:none;width:130px;background:var(--white);border-radius:12px;padding:14px 8px 10px;display:flex;flex-direction:column;align-items:center;gap:7px;box-shadow:0 6px 18px rgba(3,7,18,.45);text-decoration:none;}
.tdy-t:hover{background:var(--surface);}
.tdy-t img{width:52px;height:52px;border-radius:11px;display:block;flex:none;}
.tdy-t b{color:var(--ink);font-size:13.5px;font-weight:800;letter-spacing:-.01em;text-align:center;line-height:1.1;}
.tdy-st{font-style:normal;font-size:10.5px;font-weight:700;color:#6b7280;white-space:nowrap;padding:2px 7px;border-radius:999px;min-height:17px;cursor:pointer;}
.tdy-st:hover{background:var(--surface-alt);color:var(--ink);}
.tdy-st.tk{color:var(--success-deep);font-weight:800;}
.tdy-st.tp{color:#a16207;font-weight:800;}
.tdy-st.tr{color:#9aa0ab;font-weight:800;font-size:10px;letter-spacing:.08em;text-transform:uppercase;cursor:default;}
.tdy-ld{display:flex;align-items:center;gap:4px;min-height:12px;max-width:114px;overflow:hidden;}
.tdy-ld i{font-style:normal;font-size:9.5px;font-weight:700;color:#9aa0ab;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tdy-t.done{background:#f0f7f1;}
.tdy-t.paused{background:#fffaeb;box-shadow:inset 0 0 0 1.5px var(--gold),0 6px 18px rgba(3,7,18,.45);}
.tdy-t.resting{opacity:.5;cursor:default;}
.tdy-t.sel{box-shadow:0 0 0 2.5px var(--blue),0 6px 18px rgba(3,7,18,.45);}
.tdy-pw{position:relative;margin:0 2px 12px;}
.tdy-pw .dtp{position:static;overflow:visible;height:auto;animation:none;}
.tdy-restband{display:flex;align-items:baseline;gap:12px;color:var(--white);padding:30px 2px 4px;flex-wrap:wrap;}
.tdy-restband h3{font-size:12px;letter-spacing:.15em;text-transform:uppercase;font-weight:800;color:#8fa8dc;margin:0;display:inline-flex;align-items:center;}
.tdy-restband i{font-style:normal;font-size:12px;font-weight:600;color:#5a6f9e;}
.tdy-two{display:grid;grid-template-columns:1fr 1fr;gap:0 18px;align-items:start;}
.tdy-card{background:var(--white);border-radius:12px;box-shadow:0 10px 30px rgba(3,7,18,.5);padding:10px 12px;margin:10px 2px 0;}
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
.tdy-empty{padding:14px 10px;font-size:12.5px;font-weight:600;color:var(--slate);}
.tdy-foot{padding:40px 2px 40px;color:#3d4d75;font-size:11px;font-weight:600;letter-spacing:.04em;}
@media(max-width:900px){
  .tdy-wrap{padding:0 0 30px;}
  .tdy-today{padding:20px 16px 14px;flex-wrap:wrap;}
  .tdy-right{flex:1 1 100%;margin-left:0;flex-wrap:wrap;gap:8px;}
  .tdy-ct{flex:1 1 100%;margin-right:0;}
  .tdy-mini{flex:1 1 auto;}
  .tdy-go{flex:1 1 100%;text-align:center;}
  .tdy-hd{margin-left:14px;margin-right:14px;}
  .tdy-tiles{padding-left:14px;padding-right:14px;}
  .tdy-t{width:118px;}
  .tdy-nud{display:none;}
  .tdy-fade{display:none;}
  .tdy-restband{padding-left:16px;padding-right:16px;}
  .tdy-two{grid-template-columns:1fr;}
  .tdy-card{border-radius:0;margin:10px 0 0;}
  .tdy-pw{margin:0 0 12px;}
  .tdy-foot{padding-left:16px;}
}
`;
