'use client';

// THE HOME, ON THE STAGE.
//
// The first attempt at this was a token remap over the existing home, and it
// produced exactly the failure the stage rollout spent a day removing: the
// text moved and the artwork did not, so band headings went dark on dark and
// tile names went near-white on light plates. The home is not convertible by
// swapping variables, because the parts that make it the home — every tile's
// artwork, every band's hue — are not variables. It needs its own design.
//
// So this is a separate surface, and it applies the stage's seven rules to a
// HOME rather than to a board:
//
//   1. THE PAGE IS THE THING. One cap line. No masthead, no stat bar, no rails.
//   2. ONE GROUND, ONE COLOUR FAMILY. The ground is --stg-ground; the family is
//      the nine category steps, and nothing else on the page spends a colour.
//   3. ONE GRAPHIC IN THREE LAYERS. On a board that is the ladder of the game's
//      own units. A home's units are the eighty dailies, so THE DAY is one
//      ladder of eighty rungs in nine blocks — lit for played, half for in
//      progress, dark for untouched. It is the page's hero, and the block
//      widths are honest: the categories genuinely differ in size.
//   4. FIGURES, NEVER PROSE. Played, rank, category counts. No sentences.
//   5. DRAW THE FIELD ONLY WHEN REAL. A crowd count renders only above zero.
//   6. EXPAND IN FLOW. Nothing here overlays anything.
//
// The registry's nine categories map exactly onto the nine ramp steps and add
// up to eighty games, so the ladder is the whole roster with nothing left over.
//
// Data comes from fetchDayStatus, the same call the existing home makes, so
// this surface adds no new endpoint and cannot disagree with the other one
// about what has been played.
import { useEffect, useMemo, useState } from 'react';
import { DAILY_GAMES, DAILY_GAME_MAP } from '@/lib/daily-games';
import { DISPLAY_CIRCUITS, circuitKeysFor, circuitEntryHref } from '@/lib/circuits';
import { RAMP_ORDER, categoryColor, categoryColorLight, RAMP_INK } from '@/lib/category-ramp';
import useDayStats, { fetchDayStatus, etToday } from '../useDayStats';
import { savedIdentity } from '@/lib/saved-identity';
import { useStageTheme } from '@/lib/stage-theme';
import StageLadder from '../StageLadder';

const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const SANS = "Manrope, ui-sans-serif, system-ui, -apple-system, sans-serif";

const routeOf = (g) => g.href || `/${g.key}`;

// The same identity the rest of the site sends: this surface must not disagree
// with the old home about whose board it is showing.
function identityQs() {
  const p = new URLSearchParams();
  try { const a = localStorage.getItem('sot_quiz_anon'); if (a) p.set('anonId', a); } catch (e) {}
  try {
    const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null');
    if (id && id.email) p.set('email', id.email);
  } catch (e) {}
  return p.toString();
}

function fmtDate(ymd) {
  if (!ymd) return '';
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export default function StageToday() {
  const [stageTheme, setStageTheme] = useStageTheme();
  // The day's own numbers, from the hook the site header already uses, so this
  // cap and that one cannot disagree. Name resolves after mount because it
  // reads localStorage.
  const stats = useDayStats();
  const [who, setWho] = useState('');
  useEffect(() => { setWho(savedIdentity().username || ''); }, []);
  const [done, setDone] = useState(() => new Set());
  const [inprog, setInprog] = useState(() => new Set());
  const [day, setDay] = useState('');
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

  // The register decides which end of the ramp a category wears, exactly as it
  // does on a board: the pale step on the dark ground, its dark twin on the pale.
  const light = stageTheme === 'light';
  const hueFor = (cat) => (light ? categoryColorLight(cat) : categoryColor(cat));

  useEffect(() => {
    let alive = true;
    setDay(etToday());
    fetchDayStatus().then((data) => {
      if (!alive || !data) return;
      const [Y, M, D] = etToday().split('-').map(Number);
      const yy = Y % 100;
      const completed = new Set(data.completed || []);
      const played = new Set(data.played || []);
      const abandoned = new Set(data.abandoned || []);
      const open = new Set(data.inProgress || []);
      const d = new Set();
      const p = new Set();
      for (const g of DAILY_GAMES) {
        const id = `${g.key}-${M}-${D}-${yy}`;
        if (completed.has(id) || played.has(id)) d.add(g.key);
        else if (abandoned.has(id) || open.has(id)) p.add(g.key);
      }
      setDone(d);
      setInprog(p);
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  // One pass over the registry, grouped into the ramp's order. Categories with
  // no games simply do not render, so the page cannot show an empty block.
  const cats = useMemo(() => RAMP_ORDER
    .map((cat) => ({ cat, games: DAILY_GAMES.filter((g) => g.cat === cat) }))
    .filter((c) => c.games.length), []);

  const total = useMemo(() => cats.reduce((n, c) => n + c.games.length, 0), [cats]);

  // TODAY'S BOARD. Top eight, plus your own row appended when you are outside
  // it — a leaderboard that cannot show you your own position is a scoreboard
  // for other people.
  const overall = board && Array.isArray(board.overall) ? board.overall : [];
  const meKey = board && board.me ? board.me.userKey : null;
  const top = overall.slice(0, 8);
  const myRow = meKey ? overall.find((r) => r && r.userKey === meKey) : null;
  const myOut = myRow && !top.some((r) => r && r.userKey === meKey) ? myRow : null;

  // CIRCUITS. The set is DISPLAY_CIRCUITS and the membership is
  // circuitKeysFor(id, day), which is the call that owns rotation — reading
  // the raw keys instead would show yesterday's run on a rotating circuit.
  const circuits = useMemo(() => {
    if (!day) return [];
    return DISPLAY_CIRCUITS.map((c) => {
      let keys = [];
      try { keys = circuitKeysFor(c.id, day) || []; } catch (e) { keys = []; }
      const games = keys.map((k) => DAILY_GAME_MAP[k]).filter(Boolean);
      if (!games.length) return null;
      const n = games.filter((g) => done.has(g.key)).length;
      // A circuit spans categories, so it wears its LEAD game's step rather
      // than inventing a tenth colour.
      return { id: c.id, name: c.name, blurb: c.blurb || '', games, n, hue: hueFor(games[0].cat) };
    }).filter(Boolean);
  }, [day, done, light]);   // eslint-disable-line react-hooks/exhaustive-deps
  const playedCount = done.size;

  // THE DAY, as one ladder. Blocks flex by their game count, so a block's width
  // says how big its category is, which is true and useful rather than decorative.
  const blocks = useMemo(() => cats.map(({ cat, games }) => ({
    n: games.length,
    c: hueFor(cat),
    on: games.map((g) => done.has(g.key)),
    half: games.map((g) => inprog.has(g.key)),
  })), [cats, done, inprog, light]);   // eslint-disable-line react-hooks/exhaustive-deps

  // UP NEXT is the first game of the day nobody has started, in registry order,
  // preferring one already in progress: finishing beats starting.
  const next = useMemo(() => {
    const open = DAILY_GAMES.find((g) => inprog.has(g.key));
    return open || DAILY_GAMES.find((g) => !done.has(g.key)) || null;
  }, [done, inprog]);

  return (
    <div className="sty stage-page" data-stage-theme={stageTheme}>
      <style>{CSS}</style>

      {/* 1. THE CAP. One line, and everything on it is either the identity or a
             figure. The controls sit at the right edge, as on every board. */}
      <div className="sty-cap">
        <div className="sty-id">
          <b>Mind Loft</b>
          <span className="sty-date">{fmtDate(day)}</span>
        </div>
        <div className="sty-figs">
          {who ? <div className="sty-who"><b>{who}</b><i>player</i></div> : null}
          {/* THE DAY'S GAINS, not the totals: what a cap on a home is for is
              what has happened since midnight. The headline is the OVERALL rank
              movement, with the IQ that earned it in parentheses — the rank is
              the thing a player is climbing and the points are how they climbed
              it, so the points read as the explanation rather than as a rival
              figure. rankChange is POSITIVE for a climb toward #1, which is why
              the arrow is not simply the sign. Each renders only when real. */}
          {(stats.rankChange != null || stats.todayXp) ? (
            <div>
              <b className={stats.rankChange > 0 ? 'sty-up' : stats.rankChange < 0 ? 'sty-dn' : ''}>
                {stats.rankChange > 0 ? `\u25b2${stats.rankChange}` : stats.rankChange < 0 ? `\u25bc${Math.abs(stats.rankChange)}` : '\u2014'}
                {stats.todayXp ? <i> (+{stats.todayXp.toLocaleString()})</i> : null}
              </b>
              <i>rank today</i>
            </div>
          ) : null}
          {stats.dayRank ? (
            <div>
              <b>#{stats.dayRank}{stats.dayField ? <i>/{stats.dayField}</i> : null}</b>
              <i>today&rsquo;s board</i>
            </div>
          ) : null}
          <div><b>{playedCount}<i>/{total}</i></b><i>played</i></div>
        </div>
        <button
          type="button"
          className="sty-cx sty-tg"
          onClick={() => setStageTheme(stageTheme === 'light' ? 'dark' : 'light')}
          aria-label={stageTheme === 'light' ? 'Switch to dark' : 'Switch to light'}
          title={stageTheme === 'light' ? 'Switch to dark' : 'Switch to light'}
        >
          {stageTheme === 'light' ? (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
            </svg>
          )}
        </button>
        <a className="sty-cx" href="/quizzes">Quizzes</a>
      </div>
      <div className="sty-prog"><span style={{ width: `${total ? (playedCount / total) * 100 : 0}%` }} /></div>

      <div className="sty-wrap">
        {/* 2. THE DAY. The page's one graphic. */}
        <section className="sty-day">
          <div className="sty-eb">The day</div>
          <StageLadder height={54} blocks={blocks} light={light} />
          <div className="sty-key">
            {cats.map(({ cat, games }) => {
              const n = games.filter((g) => done.has(g.key)).length;
              return (
                <a key={cat} className="sty-kc" href={`#cat-${cat.replace(/\s+/g, '-')}`}>
                  <span className="sty-sw" style={{ background: hueFor(cat) }} />
                  {cat}
                  <b>{n}<i>/{games.length}</i></b>
                </a>
              );
            })}
          </div>
        </section>

        {/* 3. UP NEXT. One card, in its own category's colour, and the only
               filled control on the page. */}
        {next ? (
          <a className="sty-next" href={`${routeOf(next)}?stage=1`} style={{ '--cc': hueFor(next.cat) }}>
            <div>
              <div className="sty-eb">{inprog.has(next.key) ? 'Finish' : 'Up next'}</div>
              <div className="sty-nm">{next.name}</div>
              <div className="sty-tag">{next.tag}</div>
            </div>
            <span className="sty-go">{inprog.has(next.key) ? 'Resume' : 'Play'}</span>
          </a>
        ) : (
          <div className="sty-next sty-allin" style={{ '--cc': hueFor(cats[0] && cats[0].cat) }}>
            <div>
              <div className="sty-eb">The day</div>
              <div className="sty-nm">All eighty played</div>
            </div>
          </div>
        )}

        {top.length ? (
          <section>
            <div className="sty-eb">Today&rsquo;s board <em>&middot; {overall.length} {overall.length === 1 ? 'player' : 'players'}</em></div>
            <table className="sty-tbl">
              <tbody>
                {[...top, ...(myOut ? [myOut] : [])].map((r, i) => (
                  <tr key={(r && r.userKey) || i} className={meKey && r.userKey === meKey ? 'me' : undefined}>
                    <td className="sty-pos">{r.rank || i + 1}</td>
                    <td className="sty-who">{r.username || 'Player'}</td>
                    <td className="sty-gp">{typeof r.gamesPlayed === 'number' ? `${r.gamesPlayed}/${total}` : ''}</td>
                    <td className="sty-pts">{r.total != null ? Math.round(r.total) : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        {circuits.length ? (
          <section>
            <div className="sty-eb">Circuits</div>
            <div className="sty-circs">
              {circuits.map((c) => (
                <a key={c.id} className={'sty-circ' + (c.n === c.games.length ? ' full' : '')}
                  href={circuitEntryHref(c.id)} style={{ '--cc': c.hue }}>
                  <div className="sty-cn">{c.name}</div>
                  <div className="sty-cb">{c.blurb}</div>
                  <div className="sty-cbar"><span style={{ width: `${(c.n / c.games.length) * 100}%` }} /></div>
                  <div className="sty-cnum">{c.n}<i>/{c.games.length}</i></div>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {/* 4. THE CATEGORIES. One row each: the 4px rule carries the hue, the
               figures carry the state, and the games are plain chips. */}
        {cats.map(({ cat, games }) => {
          const n = games.filter((g) => done.has(g.key)).length;
          return (
            <section key={cat} id={`cat-${cat.replace(/\s+/g, '-')}`} className="sty-cat" style={{ '--cc': hueFor(cat) }}>
              <div className="sty-cathead">
                <h2>{cat}</h2>
                <b>{n}<i>/{games.length}</i></b>
              </div>
              <div className="sty-games">
                {games.map((g) => {
                  const state = done.has(g.key) ? 'done' : inprog.has(g.key) ? 'open' : '';
                  return (
                    <a key={g.key} className={`sty-g ${state}`} href={`${routeOf(g)}?stage=1`}>
                      <span className="sty-gn">{g.name}</span>
                      <span className="sty-gt">{g.tag}</span>
                    </a>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

const CSS = `
.sty{min-height:100vh;background:var(--stg-ground);color:var(--stg-ink);
  font-family:${SANS};-webkit-font-smoothing:antialiased;}
.sty *{box-sizing:border-box;}

/* ── the cap: one line ─────────────────────────────────────────────────── */
.sty-cap{display:flex;align-items:center;gap:22px;padding:11px 22px;
  border-bottom:1px solid var(--stg-line);}
.sty-id{display:flex;align-items:baseline;gap:11px;min-width:0;}
.sty-id b{font-size:16px;font-weight:800;letter-spacing:-0.01em;white-space:nowrap;}
.sty-date{font-family:${MONO};font-size:10.5px;letter-spacing:.11em;
  text-transform:uppercase;color:var(--stg-mute);white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis;}
.sty-figs{display:flex;gap:20px;margin-left:auto;}
.sty-figs>div{text-align:right;}
.sty-figs b{display:block;font-size:15px;font-weight:800;font-variant-numeric:tabular-nums;line-height:1.1;}
.sty-figs b i{font-style:normal;font-weight:600;color:var(--stg-mute);font-size:12px;}
.sty-figs>div>i{font-style:normal;font-family:${MONO};font-size:9px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--stg-mute);}
.sty-who b{font-weight:800;}
/* The only semantic colour on this page: a climb and a slip have to read
   apart at a glance, and they are not the category family. */
.sty-up{color:var(--stg-up);}
.sty-dn{color:var(--stg-dn);}
.sty-tg{display:inline-flex;align-items:center;justify-content:center;padding:6px 9px;
  background:none;cursor:pointer;font:inherit;}
.sty-cx{flex:none;font-family:${MONO};font-size:10px;letter-spacing:.11em;text-transform:uppercase;
  color:var(--stg-ink2);text-decoration:none;border:1px solid var(--stg-line);
  border-radius:7px;padding:6px 10px;}
.sty-cx:hover{border-color:var(--stg-line2);color:var(--stg-ink);}
.sty-prog{height:2px;background:var(--stg-surf2);}
.sty-prog span{display:block;height:100%;background:var(--stg-ink2);transition:width .4s ease;}

.sty-wrap{max-width:1100px;margin:0 auto;padding:26px 22px 72px;
  display:flex;flex-direction:column;gap:26px;}
.sty-eb{font-family:${MONO};font-size:9.5px;letter-spacing:.15em;text-transform:uppercase;
  color:var(--stg-mute);margin-bottom:9px;}

/* ── the day ───────────────────────────────────────────────────────────── */
.sty-key{display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:12px;}
.sty-kc{display:inline-flex;align-items:center;gap:7px;text-decoration:none;
  font-size:12px;font-weight:700;color:var(--stg-ink2);}
.sty-kc:hover{color:var(--stg-ink);}
.sty-kc b{font-weight:800;font-variant-numeric:tabular-nums;color:var(--stg-ink);}
.sty-kc b i{font-style:normal;font-weight:600;color:var(--stg-mute);}
.sty-sw{width:9px;height:9px;border-radius:3px;flex:none;}

/* ── up next: the one filled control on the page ───────────────────────── */
.sty-next{display:flex;align-items:center;gap:18px;text-decoration:none;
  background:var(--cc);color:var(--stg-onramp, ${RAMP_INK});
  border-radius:12px;padding:18px 20px;}
.sty-next .sty-eb{color:inherit;opacity:.72;margin-bottom:5px;}
.sty-nm{font-size:26px;font-weight:800;letter-spacing:-0.02em;line-height:1.1;}
.sty-tag{font-size:13.5px;font-weight:600;opacity:.8;margin-top:3px;}
.sty-go{margin-left:auto;flex:none;font-size:14px;font-weight:800;
  border:1.5px solid currentColor;border-radius:9px;padding:9px 18px;}
.sty-next:hover .sty-go{background:currentColor;color:var(--cc);}
.sty-allin{cursor:default;}

/* ── today's board ─────────────────────────────────────────────────────── */
.sty-tbl{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums;}
.sty-tbl td{padding:7px 6px;border-bottom:1px solid var(--stg-line);font-size:13.5px;}
.sty-tbl tr:last-child td{border-bottom:0;}
.sty-tbl tr.me td{background:var(--stg-chip);font-weight:800;}
.sty-pos{width:40px;font-family:${MONO};font-size:12px;color:var(--stg-mute);}
.sty-who{font-weight:700;}
.sty-gp{width:70px;text-align:right;color:var(--stg-mute);font-size:12px;}
.sty-pts{width:56px;text-align:right;font-weight:800;}

/* ── circuits ──────────────────────────────────────────────────────────── */
.sty-circs{display:grid;gap:7px;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));}
.sty-circ{position:relative;display:block;text-decoration:none;color:var(--stg-ink);
  background:var(--stg-surf);border:1px solid var(--stg-line);border-radius:10px;
  padding:12px 14px 13px 16px;overflow:hidden;}
.sty-circ::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--cc);}
.sty-circ:hover{border-color:var(--cc);}
.sty-cn{font-size:15px;font-weight:800;letter-spacing:-0.01em;}
.sty-cb{font-size:11.5px;font-weight:600;color:var(--stg-mute);margin-top:2px;line-height:1.4;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.sty-cbar{height:4px;border-radius:2px;background:var(--stg-surf2);margin-top:10px;overflow:hidden;}
.sty-cbar span{display:block;height:100%;background:var(--cc);}
.sty-cnum{position:absolute;top:12px;right:14px;font-family:${MONO};font-size:11.5px;
  font-weight:700;color:var(--stg-ink2);}
.sty-cnum i{font-style:normal;color:var(--stg-mute);}
/* A finished circuit is MARKED, not dimmed. The ladder dims a played rung
   because a rung is a graphic; a card carries prose, and half-strength prose on
   this ground reads at 2.4:1. So completion moves into the figure — the count
   takes the category hue and the bar fills — and the words stay legible. */
.sty-circ.full .sty-cnum{color:var(--cc);}
.sty-circ.full .sty-cnum i{color:var(--cc);opacity:.6;}
.sty-circ.full{border-color:color-mix(in srgb, var(--cc) 40%, transparent);}

/* ── the categories ────────────────────────────────────────────────────── */
.sty-cat{position:relative;padding-left:16px;}
.sty-cat::before{content:'';position:absolute;left:0;top:2px;bottom:2px;width:4px;
  border-radius:2px;background:var(--cc);}
.sty-cathead{display:flex;align-items:baseline;gap:11px;margin-bottom:10px;}
.sty-cathead h2{margin:0;font-size:13px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;}
.sty-cathead b{font-family:${MONO};font-size:12px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--stg-ink2);}
.sty-cathead b i{font-style:normal;color:var(--stg-mute);}
.sty-games{display:grid;gap:7px;grid-template-columns:repeat(auto-fill,minmax(184px,1fr));}
.sty-g{display:block;text-decoration:none;background:var(--stg-surf);
  border:1px solid var(--stg-line);border-radius:9px;padding:10px 12px;color:var(--stg-ink);}
.sty-g:hover{border-color:var(--cc);}
.sty-gn{display:block;font-size:14.5px;font-weight:800;letter-spacing:-0.01em;}
.sty-gt{display:block;font-size:11.5px;font-weight:600;color:var(--stg-mute);margin-top:2px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
/* Played is DIM, not struck through: the day is a record, not a chore list. */
.sty-g.done{opacity:.42;}
.sty-g.open{border-color:var(--cc);}
.sty-g:focus-visible,.sty-next:focus-visible,.sty-kc:focus-visible,.sty-cx:focus-visible{
  outline:2px solid var(--cc, var(--stg-ink2));outline-offset:2px;}

@media (max-width:640px){
  /* The name never wraps; the DATE is what gives way, onto its own line first
     and out of the flow entirely on the narrowest screens. */
  .sty-cap{flex-wrap:wrap;gap:10px 16px;padding:10px 14px;}
  .sty-id{flex:none;}
  .sty-date{width:100%;order:3;}
  .sty-figs{margin-left:auto;gap:16px;}
  .sty-wrap{padding:18px 14px 56px;gap:22px;}
  .sty-nm{font-size:21px;}
  .sty-next{padding:15px 16px;gap:12px;}
  .sty-go{padding:8px 13px;font-size:13px;}
  .sty-games{grid-template-columns:1fr 1fr;}
}
@media (max-width:380px){
  .sty-date{display:none;}
  .sty-figs{gap:12px;}
}
@media (prefers-reduced-motion:reduce){.sty-prog span{transition:none;}}
`;
