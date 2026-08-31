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
import { GLYPHS, GLYPH_BOX } from '@/lib/game-glyphs';
import { RAMP_ORDER, categoryColor, categoryColorLight, RAMP_INK } from '@/lib/category-ramp';
import useDayStats, { fetchDayStatus, etToday } from '../useDayStats';
import useMyGames from '../useMyGames';
import { savedIdentity } from '@/lib/saved-identity';
import { useStageTheme, useThemeQs, useThemeHint } from '@/lib/stage-theme';
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

const CIRC_PEEK = 3;

// ONE DRAWING PER GAME, PAINTED BY THE SURFACE. The glyph is a single stroke
// path in currentColor, so the card's own --cc (its category step) colours it,
// and it flips with the register for free. See lib/game-glyphs.js for why these
// replaced the two hand-maintained PNG sets.
// ONE GAME CARD, used by the category rows and by My games, so a star behaves
// the same in both and there is one place to change what a card shows.
function GameCard({ g, done, inprog, tq, canPin, favorites, toggleFavorite, hue }) {
  const state = done.has(g.key) ? 'done' : inprog.has(g.key) ? 'open' : '';
  const on = !!(favorites && favorites.includes(g.key));
  // MY GAMES MIXES CATEGORIES, so each card carries its OWN hue rather than
  // inheriting the section's (owner, 2026-08-31). In a category row every card
  // is that category anyway, so passing nothing keeps the row's colour.
  return (
    <a className={`sty-g ${state}`} href={`${routeOf(g)}?stage=1${tq}`}
      style={hue ? { '--cc': hue } : undefined}>
      <span className="sty-gn"><Glyph k={g.key} size={17} />{g.name}</span>
      <span className="sty-gt">{g.tag}</span>
      {canPin ? (
        <button
          type="button"
          className={'sty-star' + (on ? ' on' : '')}
          aria-label={on ? `Unstar ${g.name}` : `Star ${g.name}`}
          title={on ? 'Remove from My games' : 'Add to My games'}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(g.key); }}
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill={on ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 4l2.4 5 5.6.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.6-.8z" />
          </svg>
        </button>
      ) : null}
    </a>
  );
}

function Glyph({ k, size = 20 }) {
  const d = GLYPHS[k];
  if (!d) return null;
  return (
    <svg className="sty-gi" viewBox={GLYPH_BOX} width={size} height={size} fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"><path d={d} /></svg>
  );
}

export default function StageToday() {
  const [stageTheme, setStageTheme] = useStageTheme();
  const tq = useThemeQs();
  const hint = useThemeHint();  // one pointer at the light switch, first visit only   // carries a ?theme= review override across links
  // circuitEntryHref may or may not already carry a query, so the override
  // joins with the right separator rather than always an ampersand.
  const withTq = (href) => (tq ? href + (href.includes('?') ? tq : '?' + tq.slice(1)) : href);
  // The day's own numbers, from the hook the site header already uses, so this
  // cap and that one cannot disagree. Name resolves after mount because it
  // reads localStorage.
  const stats = useDayStats();
  const [who, setWho] = useState('');
  useEffect(() => { setWho(savedIdentity().username || ''); }, []);
  const [done, setDone] = useState(() => new Set());
  const [inprog, setInprog] = useState(() => new Set());
  const [day, setDay] = useState('');
  // Seventeen circuit cards is a wall on a page whose job is today's puzzles,
  // so the shelf opens on its lead three and the rest are one tap away (owner,
  // 2026-08-31). The three are DISPLAY_CIRCUITS' own lead order, which is
  // deliberate and lives in lib/circuits.js.
  const [allCircs, setAllCircs] = useState(false);

  // PINS LIVE ON THE ACCOUNT, via the hook the other home already uses, so a
  // star set on either surface is the same star. Nothing here keeps its own
  // copy of the list.
  const { favorites, canPin, toggleFavorite } = useMyGames();

  // How many of each game's archive this player has done, which is what "your
  // most played" means and what the default category order sorts by. It rides
  // on the fetchDayStatus payload the day state already reads, so it costs no
  // request.
  const [archive, setArchive] = useState(null);

  // THE HAND ORDER lives on this browser, under the SAME key the other home
  // writes (sot_cat_order), so a reader who dragged their categories there
  // finds them in that order here. Null means the default, which is how much
  // this player has played each category.
  const [handOrder, setHandOrder] = useState(null);
  const [reorder, setReorder] = useState(false);
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('sot_cat_order') || 'null');
      if (Array.isArray(raw) && raw.length) setHandOrder(raw);
    } catch (e) {}
  }, []);
  const saveOrder = (next) => {
    setHandOrder(next);
    try {
      if (next) localStorage.setItem('sot_cat_order', JSON.stringify(next));
      else localStorage.removeItem('sot_cat_order');
    } catch (e) {}
  };
  const [board, setBoard] = useState(null);
  // THE OVERALL RANK comes from /api/quiz/me, the same place the site header
  // reads it. daily-status computes the identical figure internally (posNow) but
  // does not return it, and adding a second source for one number is how two
  // surfaces end up disagreeing about a player's rank.
  const [mine, setMine] = useState(null);
  useEffect(() => {
    let alive = true;
    const qs = identityQs();
    if (!qs) return undefined;
    fetch('/api/quiz/me?light=1&' + qs)
      .then((r) => r.json())
      .then((d) => { if (alive && d && d.found !== false) setMine(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
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
      if (data.archive) setArchive(data.archive);
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  // One pass over the registry, grouped into the ramp's order. Categories with
  // no games simply do not render, so the page cannot show an empty block.
  const cats = useMemo(() => RAMP_ORDER
    .map((cat) => ({ cat, games: DAILY_GAMES.filter((g) => g.cat === cat) }))
    .filter((c) => c.games.length), []);

  const total = useMemo(() => cats.reduce((n, c) => n + c.games.length, 0), [cats]);

  // THE ORDER OF THE CATEGORY ROWS. A hand order wins; otherwise they sort by
  // how much of each category this player has actually played, so the page
  // opens on what they use. A category the stored order does not name (a new
  // one, most likely) keeps its ramp position at the end rather than vanishing.
  const orderedCats = useMemo(() => {
    if (handOrder && handOrder.length) {
      const rank = new Map(handOrder.map((c, i) => [c, i]));
      return [...cats].sort((a, b) =>
        (rank.has(a.cat) ? rank.get(a.cat) : 99) - (rank.has(b.cat) ? rank.get(b.cat) : 99));
    }
    if (!archive) return cats;
    const played = (c) => c.games.reduce((n, g) => n + ((archive[g.key] && archive[g.key].played) || 0), 0);
    return [...cats].map((c, i) => [c, i])
      .sort((a, b) => (played(b[0]) - played(a[0])) || (a[1] - b[1]))
      .map(([c]) => c);
  }, [cats, handOrder, archive]);

  const moveCat = (cat, dir) => {
    const cur = orderedCats.map((c) => c.cat);
    const i = cur.indexOf(cat);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= cur.length) return;
    const next = [...cur];
    next[i] = cur[j]; next[j] = cur[i];
    saveOrder(next);
  };

  // MY GAMES: the starred set, in the order they were starred. Games only, so a
  // pin on something that has since retired simply drops out.
  const pinned = useMemo(() => {
    if (!favorites || !favorites.length) return [];
    return favorites.map((k) => DAILY_GAME_MAP[k]).filter(Boolean);
  }, [favorites]);

  // THE THREE CARDS. Each answers a different question, and each falls back to
  // the best thing it can say with what has loaded (owner, 2026-08-31), because
  // a card that renders empty while a fetch settles is worse than one that
  // starts general and sharpens.
  //
  //   1  YOURS      the game you are mid-way through, else the one you have
  //                 played most and have not played today, else the next unplayed.
  //   2  EVERYONE'S the most played daily on the site today.
  //   3  THE BOARD  who is winning, and a way down to the standings.
  const mostPlayedMine = useMemo(() => {
    if (!archive) return null;
    const pool = DAILY_GAMES.filter((g) => !done.has(g.key));
    let best = null; let bn = 0;
    for (const g of pool) {
      const n = (archive[g.key] && archive[g.key].played) || 0;
      if (n > bn) { bn = n; best = g; }
    }
    return bn > 0 ? best : null;
  }, [archive, done]);

  const lead = useMemo(() => {
    const open = DAILY_GAMES.find((g) => inprog.has(g.key));
    if (open) return { game: open, eyebrow: 'Finish', cta: 'Resume' };
    if (mostPlayedMine) return { game: mostPlayedMine, eyebrow: 'Your most played', cta: 'Play' };
    const fresh = DAILY_GAMES.find((g) => !done.has(g.key));
    return fresh ? { game: fresh, eyebrow: 'Up next', cta: 'Play' } : null;
  }, [inprog, done, mostPlayedMine]);

  const popular = useMemo(() => {
    const bg = board && Array.isArray(board.games) ? board.games : null;
    if (!bg) return null;
    // NEVER THE SAME GAME AS THE LEAD CARD. The busiest daily is very often the
    // one you are mid-way through, and two cards side by side naming the same
    // game is one card's worth of information in two cards' worth of space.
    const skip = lead && lead.game ? lead.game.key : null;
    let best = null; let bn = -1;
    for (const b of bg) {
      const g = b && DAILY_GAME_MAP[b.key];
      if (!g || typeof b.plays !== 'number' || g.key === skip) continue;
      if (b.plays > bn) { bn = b.plays; best = { game: g, plays: b.plays }; }
    }
    return best;
  }, [board, lead]);

  // TODAY'S BOARD. Top eight, plus your own row appended when you are outside
  // it — a leaderboard that cannot show you your own position is a scoreboard
  // for other people.
  const overall = board && Array.isArray(board.overall) ? board.overall : [];
  const meKey = board && board.me ? board.me.userKey : null;
  const top = overall.slice(0, 8);
  const myRow = meKey ? overall.find((r) => r && r.userKey === meKey) : null;
  const myOut = myRow && !top.some((r) => r && r.userKey === meKey) ? myRow : null;
  const topRow = top[0] && top[0].total != null ? top[0] : null;

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
  // THE LADDER SHRINKS ON A PHONE and its key comes off entirely (owner,
  // 2026-08-31: "takes up too much space"). The key is nine labelled swatches,
  // which wrap to three lines at 390 and push the first playable thing off the
  // screen — and every one of those counts is repeated on its own category row
  // further down. The graphic itself still says which categories are done,
  // because that is what its colour is for; it just says it in less height.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const ladH = narrow ? 20 : 54;

  const playedCount = done.size;
  // light=1 returns the flat `rank`; full mode nests it under ranks.xp. Both are
  // the IQ board's position, so read either.
  const rank = mine ? ((mine.ranks && mine.ranks.xp) || mine.rank || null) : null;

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
          {/* NO NAME, NO FIGURES: a reader without an account has nothing to
              put in this bar, so it offers them the one thing that would fill
              it rather than sitting empty (owner, 2026-08-31). */}
          {!who ? (
            <a className="sty-signup" href="/quizzes?signup=1">
              <b>Sign up</b><i>keep your scores</i>
            </a>
          ) : null}
          {who ? <div className="sty-who"><b>{who}</b><i>player</i></div> : null}
          {/* FOUR FIGURES, in the order a player asks the questions: what did
              today earn me, where does that put me overall, where did I finish
              on today's board, and how much of the day is left.

              The previous cap tried to say the first two at once — the day's
              rank MOVEMENT with the IQ in parentheses — and broke on the common
              case: a move of 0 rendered an em dash under a label reading "rank
              today", with a dangling "(+130)" explaining a number that was not
              there. A day's play very often moves nobody, so the resting state
              of that cell was a dash. Rank and the day's gain are two figures
              and now read as two.

              Each is drawn only when it is real, and the movement chip appears
              only when there IS movement: no arrow means no change, which is
              the honest way to say it. */}
          {stats.todayXp ? (
            <div><b className="sty-up">+{stats.todayXp.toLocaleString()}</b><i>IQ today</i></div>
          ) : null}
          {rank ? (
            <div>
              <b>
                #{rank.toLocaleString()}
                {stats.rankChange ? (
                  <i className={stats.rankChange > 0 ? 'sty-up' : 'sty-dn'}>
                    {' '}{stats.rankChange > 0 ? '\u25b2' : '\u25bc'}{Math.abs(stats.rankChange)}
                  </i>
                ) : null}
              </b>
              <i>rank</i>
            </div>
          ) : null}
          {stats.dayRank ? (
            <div>
              <b>#{stats.dayRank}{stats.dayField ? <i>/{stats.dayField}</i> : null}</b>
              <i>today&rsquo;s board</i>
            </div>
          ) : null}
          {/* NO PLAYED COUNT HERE (owner, 2026-08-31): the ladder directly
              below is that number drawn, and every category row carries its own
              n/N. The cap says what the day has EARNED you. */}
        </div>
        {/* TWO MORE WAYS OUT, beside the light switch: down to today's standings
            and across to the activity feed (owner, 2026-08-31). On a phone
            these are the row-one controls and the figures take row two. */}
        <a className="sty-cx sty-lb" href="#sty-board" aria-label="Today's board" title="Today's board">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 21v-6M12 21V4M20 21v-10" />
          </svg>
        </a>
        <a className="sty-cx sty-lf" href="/feed" aria-label="Live feed" title="Live feed">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 12h3l2.5-6 4 13 2.5-7H21" />
          </svg>
        </a>
        <button
          type="button"
          className={'sty-cx sty-tg' + (hint ? ' hint' : '')}
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
      </div>
      <div className="sty-prog"><span style={{ width: `${total ? (playedCount / total) * 100 : 0}%` }} /></div>

      <div className="sty-wrap">
        {/* 2. THE DAY. The page's one graphic. */}
        <section className="sty-day">
          <div className="sty-eb">The day</div>
          <StageLadder height={ladH} blocks={blocks} light={light} />
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

        {/* 3. THREE CARDS, not one (owner, 2026-08-31). The single Up Next card
               answered one question; these answer the three a reader actually
               arrives with — what am I in the middle of, what is everyone
               playing, and who is winning. */}
        <div className="sty-three">
          {lead ? (
            <a className="sty-card lead" href={`${routeOf(lead.game)}?stage=1${tq}`} style={{ '--cc': hueFor(lead.game.cat) }}>
              <div className="sty-eb">{lead.eyebrow}</div>
              <div className="sty-nm"><Glyph k={lead.game.key} size={22} />{lead.game.name}</div>
              <div className="sty-tag">{lead.game.tag}</div>
              <span className="sty-go">{lead.cta}</span>
            </a>
          ) : (
            <div className="sty-card lead sty-allin" style={{ '--cc': hueFor(cats[0] && cats[0].cat) }}>
              <div className="sty-eb">The day</div>
              <div className="sty-nm">All {total} played</div>
            </div>
          )}

          {popular ? (
            <a className="sty-card" href={`${routeOf(popular.game)}?stage=1${tq}`} style={{ '--cc': hueFor(popular.game.cat) }}>
              <div className="sty-eb">Most played today</div>
              <div className="sty-nm"><Glyph k={popular.game.key} size={22} />{popular.game.name}</div>
              <div className="sty-tag">{popular.plays} {popular.plays === 1 ? 'player' : 'players'} so far</div>
              <span className="sty-go ghost">{done.has(popular.game.key) ? 'Played' : 'Play'}</span>
            </a>
          ) : null}

          {topRow ? (
            <a className="sty-card" href="#sty-board" style={{ '--cc': hueFor('Trivia') }}>
              <div className="sty-eb">Leading today</div>
              <div className="sty-nm">{topRow.username || 'Player'}</div>
              <div className="sty-tag">
                {Math.round(topRow.total)} points{overall.length ? ` of ${overall.length} playing` : ''}
              </div>
              <span className="sty-go ghost">The board</span>
            </a>
          ) : null}
        </div>

        {/* MY GAMES: the starred set, above everything a reader did not choose.
            Only shown when there are stars, so it never sits there empty asking
            to be filled. */}
        {/* The SECTION's rule is neutral because this row is not a category:
            the cards inside it carry their own categories' colours. */}
        {pinned.length ? (
          <section className="sty-cat sty-mine" style={{ '--cc': 'var(--stg-ink2)' }}>
            <div className="sty-cathead">
              <h2>My games</h2>
              <b>{pinned.filter((g) => done.has(g.key)).length}<i>/{pinned.length}</i></b>
            </div>
            <div className="sty-games">
              {pinned.map((g) => (
                <GameCard key={g.key} g={g} done={done} inprog={inprog} tq={tq}
                  canPin={canPin} favorites={favorites} toggleFavorite={toggleFavorite}
                  hue={hueFor(g.cat)} />
              ))}
            </div>
          </section>
        ) : null}

        {circuits.length ? (
          <section>
            <div className="sty-eb">Circuits <em>&middot; {circuits.length}</em></div>
            <div className="sty-circs">
              {(allCircs ? circuits : circuits.slice(0, CIRC_PEEK)).map((c) => (
                <a key={c.id} className={'sty-circ' + (c.n === c.games.length ? ' full' : '')}
                  href={withTq(circuitEntryHref(c.id))} style={{ '--cc': c.hue }}>
                  {/* The count sits IN the header row, not absolutely over the
                      card: floating it top-right meant a long name ran
                      underneath it, which "Trivia Gauntlet" did on every
                      width (owner, 2026-08-31). */}
                  <div className="sty-chead">
                    <div className="sty-cn">{c.name}</div>
                    <div className="sty-cnum">{c.n}<i>/{c.games.length}</i></div>
                  </div>
                  <div className="sty-cb">{c.blurb}</div>
                  <div className="sty-cbar"><span style={{ width: `${(c.n / c.games.length) * 100}%` }} /></div>
                </a>
              ))}
            </div>
            {circuits.length > CIRC_PEEK ? (
              <button type="button" className="sty-more" onClick={() => setAllCircs((v) => !v)}>
                {allCircs ? 'Show fewer' : `Show all ${circuits.length} circuits`}
              </button>
            ) : null}
          </section>
        ) : null}

        {/* THE ORDER IS THE READER'S. Arrows rather than dragging: they work
            with a thumb and with a keyboard, and the order they write is the
            same sot_cat_order the other home reads. */}
        <div className="sty-ord">
          <button type="button" className="sty-more sty-ordb" onClick={() => setReorder((v) => !v)}>
            {reorder ? 'Done reordering' : 'Reorder categories'}
          </button>
          {reorder && handOrder ? (
            <button type="button" className="sty-more sty-ordb" onClick={() => saveOrder(null)}>Reset to default</button>
          ) : null}
        </div>

        {/* 4. THE CATEGORIES. One row each: the 4px rule carries the hue, the
               figures carry the state, and the games are plain chips. */}
        {orderedCats.map(({ cat, games }, ci) => {
          const n = games.filter((g) => done.has(g.key)).length;
          return (
            <section key={cat} id={`cat-${cat.replace(/\s+/g, '-')}`} className="sty-cat" style={{ '--cc': hueFor(cat) }}>
              <div className="sty-cathead">
                <h2>{cat}</h2>
                <b>{n}<i>/{games.length}</i></b>
                {reorder ? (
                  <span className="sty-move">
                    <button type="button" onClick={() => moveCat(cat, -1)} disabled={ci === 0} aria-label={`Move ${cat} up`}>&uarr;</button>
                    <button type="button" onClick={() => moveCat(cat, 1)} disabled={ci === orderedCats.length - 1} aria-label={`Move ${cat} down`}>&darr;</button>
                  </span>
                ) : null}
              </div>
              <div className="sty-games">
                {games.map((g) => (
                  <GameCard key={g.key} g={g} done={done} inprog={inprog} tq={tq}
                    canPin={canPin} favorites={favorites} toggleFavorite={toggleFavorite} />
                ))}
              </div>
            </section>
          );
        })}

        {/* THE STANDINGS COME LAST (owner, 2026-08-31: the leaderboard does not
            need to be at the top of the page). The top of a home is for what you
            can play; where everyone finished is what you read once you have
            played it, so it sits under the games rather than above them. */}
        {top.length ? (
          <section id="sty-board">
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
/* The movement chip is an <i> INSIDE the figure, and .sty-figs b i (0,2,1)
   outranks a bare .sty-up (0,1,0), so the arrow would render mute grey.
   NOTE: this block is a JS template literal, so no backticks in comments. */
.sty-figs b i.sty-up{color:var(--stg-up);}
.sty-figs b i.sty-dn{color:var(--stg-dn);}
.sty-tg{display:inline-flex;align-items:center;justify-content:center;padding:6px 9px;
  background:none;cursor:pointer;font:inherit;}
.sty-tg.hint{border-color:var(--stg-acc);color:var(--stg-acc);animation:stg-hintring 1.9s ease-out 3;}
/* THE FIRST-VISIT POINTER at the light switch: a ring pulsing out of the glyph,
   three times, then gone for good. A ring rather than a colour change, so it
   draws the eye without the control ever looking like it is in a state it is
   not. */
@keyframes stg-hintring{
  0%{box-shadow:0 0 0 0 var(--stg-acc);}
  70%{box-shadow:0 0 0 10px transparent;}
  100%{box-shadow:0 0 0 0 transparent;}
}
@media (prefers-reduced-motion: reduce){ .hint{animation:none !important;} }
.sty-cx{flex:none;font-family:${MONO};font-size:10px;letter-spacing:.11em;text-transform:uppercase;
  color:var(--stg-ink2);text-decoration:none;border:1px solid var(--stg-line);
  border-radius:7px;padding:6px 10px;}
.sty-cx:hover{border-color:var(--stg-line2);color:var(--stg-ink);}
.sty-prog{height:2px;background:var(--stg-surf2);}
.sty-prog span{display:block;height:100%;background:var(--stg-ink2);transition:width .4s ease;}

/* FILLS THE SCREEN (owner, 2026-08-31). The 1100px column left a third of a
   desktop empty, and this page is a board of small tiles rather than a column
   of prose: the grids simply deal more per row as the window grows. The one
   thing that does NOT want the full width is the standings table, which is
   four columns of figures and reads worse the further apart they sit. */
.sty-wrap{max-width:none;margin:0 auto;padding:26px 22px 72px;
  display:flex;flex-direction:column;gap:26px;}
.sty-eb{font-family:${MONO};font-size:9.5px;letter-spacing:.15em;text-transform:uppercase;
  color:var(--stg-mute);margin-bottom:9px;}

/* ── the day ───────────────────────────────────────────────────────────── */
.sty-key{display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:12px;}
@media (max-width:640px){ .sty-key{display:none;} }
.sty-kc{display:inline-flex;align-items:center;gap:7px;text-decoration:none;
  font-size:12px;font-weight:700;color:var(--stg-ink2);}
.sty-kc:hover{color:var(--stg-ink);}
.sty-kc b{font-weight:800;font-variant-numeric:tabular-nums;color:var(--stg-ink);}
.sty-kc b i{font-style:normal;font-weight:600;color:var(--stg-mute);}
.sty-sw{width:9px;height:9px;border-radius:3px;flex:none;}

/* ── up next: the one filled control on the page ───────────────────────── */
/* ── the three cards ───────────────────────────────────────────────────── */
.sty-three{display:grid;gap:9px;grid-template-columns:1.4fr 1fr 1fr;align-items:stretch;}
/* The CTA is the LAST FLOW ITEM with margin-top:auto, not an absolutely
   positioned one over a reserved strip of padding. The padding version put the
   button on top of the tagline by a few pixels the moment a tagline ran long,
   and "a few pixels" is a thing that changes with every font and every string.
   In flow the card simply grows, and the row's cards match because the grid
   stretches them. */
.sty-card{display:flex;flex-direction:column;gap:2px;text-decoration:none;
  color:var(--stg-ink);background:var(--stg-surf);border:1px solid var(--stg-line);
  border-left:4px solid var(--cc);border-radius:11px;padding:14px 16px;min-width:0;}
.sty-card:hover{border-color:var(--stg-line2);border-left-color:var(--cc);}
.sty-card:focus-visible{outline:2px solid var(--stg-acc);outline-offset:2px;}
/* The LEAD card is the only filled thing on the page, as Up Next was: one
   control carries the accent, everything else marks with it. */
.sty-card.lead{background:var(--cc);border-color:transparent;color:var(--stg-onramp,#08222e);}
.sty-card.lead .sty-eb,.sty-card.lead .sty-tag{color:inherit;opacity:.78;}
.sty-card.lead .sty-gi{color:currentColor;}
.sty-card .sty-nm{font-size:20px;font-weight:800;letter-spacing:-0.015em;line-height:1.15;}
.sty-card.lead .sty-nm{font-size:24px;}
.sty-card .sty-tag{font-size:12px;font-weight:600;color:var(--stg-mute);margin-top:1px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.sty-card .sty-go{align-self:flex-start;margin-top:12px;}
.sty-card .sty-go.ghost{background:none;color:var(--cc);border:1px solid var(--cc);}
.sty-allin{justify-content:center;}

/* ── a star on every card ──────────────────────────────────────────────── */
.sty-g{position:relative;}
.sty-star{position:absolute;top:6px;right:6px;display:flex;align-items:center;justify-content:center;
  width:24px;height:24px;border:0;border-radius:6px;background:none;cursor:pointer;
  color:var(--stg-mute2);opacity:0;transition:opacity .12s;}
.sty-g:hover .sty-star,.sty-star:focus-visible,.sty-star.on{opacity:1;}
.sty-star.on{color:var(--cc);}
.sty-star:hover{background:var(--stg-chip);color:var(--cc);}
/* A touch screen has no hover, so the star is always there. */
@media (hover:none){ .sty-star{opacity:1;} }
.sty-mine .sty-cathead h2{letter-spacing:-0.01em;}

/* ── reordering ────────────────────────────────────────────────────────── */
.sty-signup{display:flex;flex-direction:column;text-decoration:none;color:var(--stg-onramp,#08222e);
  background:var(--stg-acc);border-radius:8px;padding:5px 12px;}
.sty-signup b{font-size:13px;font-weight:800;line-height:1.2;}
.sty-signup i{font-style:normal;font-family:${MONO};font-size:9px;letter-spacing:.11em;
  text-transform:uppercase;opacity:.8;}
.sty-ord{display:flex;gap:7px;}
.sty-ordb{width:auto;margin-top:0;padding:7px 13px;}
.sty-move{display:inline-flex;gap:4px;margin-left:10px;}
.sty-move button{width:24px;height:24px;border:1px solid var(--stg-line);border-radius:6px;
  background:none;color:var(--stg-ink2);cursor:pointer;font-size:12px;line-height:1;}
.sty-move button:hover:not(:disabled){border-color:var(--cc);color:var(--cc);}
.sty-move button:disabled{opacity:.3;cursor:default;}

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
.sty-tbl{width:100%;max-width:900px;border-collapse:collapse;font-variant-numeric:tabular-nums;}
.sty-tbl td{padding:7px 6px;border-bottom:1px solid var(--stg-line);font-size:13.5px;}
.sty-tbl tr:last-child td{border-bottom:0;}
.sty-tbl tr.me td{background:var(--stg-chip);font-weight:800;}
/* The mute token is tuned against the PAGE ground; on the me row's chip it
   lands at 4.34:1, so the supporting figures step up one token there. */
.sty-tbl tr.me .sty-pos,.sty-tbl tr.me .sty-gp{color:var(--stg-ink2);}
.sty-pos{width:40px;font-family:${MONO};font-size:12px;color:var(--stg-mute);}
.sty-who{font-weight:700;}
.sty-gp{width:70px;text-align:right;color:var(--stg-mute);font-size:12px;}
.sty-pts{width:56px;text-align:right;font-weight:800;}

/* ── circuits ──────────────────────────────────────────────────────────── */
.sty-circs{display:grid;gap:7px;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));}
.sty-more{display:block;width:100%;margin-top:7px;background:var(--stg-surf);
  border:1px solid var(--stg-line);border-radius:9px;padding:9px;cursor:pointer;
  font-family:${MONO};font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--stg-ink2);}
.sty-more:hover{border-color:var(--stg-line2);color:var(--stg-ink);}
.sty-more:focus-visible{outline:2px solid var(--stg-acc);outline-offset:2px;}
.sty-circ{position:relative;display:block;text-decoration:none;color:var(--stg-ink);
  background:var(--stg-surf);border:1px solid var(--stg-line);border-radius:10px;
  padding:12px 14px 13px 16px;overflow:hidden;}
.sty-circ::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--cc);}
.sty-circ:hover{border-color:var(--cc);}
.sty-chead{display:flex;align-items:baseline;gap:10px;}
.sty-cn{font-size:15px;font-weight:800;letter-spacing:-0.01em;min-width:0;}
.sty-cnum{margin-left:auto;flex:none;}
/* THREE lines, not two. Every circuit blurb is a full sentence and the two
   line clamp cut the longest of them off mid-clause; the cards share a grid
   row, so letting them run to three costs one line across the shelf and clips
   nothing. */
.sty-cb{font-size:11.5px;font-weight:600;color:var(--stg-mute);margin-top:3px;line-height:1.4;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
.sty-cbar{height:4px;border-radius:2px;background:var(--stg-surf2);margin-top:10px;overflow:hidden;}
.sty-cbar span{display:block;height:100%;background:var(--cc);}
.sty-cnum{font-family:${MONO};font-size:11.5px;font-weight:700;color:var(--stg-ink2);}
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
/* A grid track's automatic minimum is MIN-CONTENT, and .sty-gt is nowrap, so a
   long tagline widens its own track and pushes the ladder off a phone instead
   of ellipsing inside it. Measured: the ladder ran 426px wide at 390. The floor
   has to be released on the track AND on the item. */
.sty-g,.sty-circ{min-width:0;}
.sty-g>*{min-width:0;max-width:100%;}
.sty-g{display:block;text-decoration:none;background:var(--stg-surf);
  border:1px solid var(--stg-line);border-radius:9px;padding:10px 12px;color:var(--stg-ink);}
.sty-g:hover{border-color:var(--cc);}
.sty-gn{display:flex;align-items:center;gap:7px;font-size:14.5px;font-weight:800;
  letter-spacing:-0.01em;}
/* The glyph wears the row's hue while the name stays ink, so the colour marks
   the category without costing the name any contrast. BUT the Up Next card is
   FILLED with that same hue, so a glyph painted --cc there is invisible: on any
   surface whose ground is the accent, the glyph takes the card's own ink. */
.sty-gi{flex:none;color:var(--cc);}
.sty-next .sty-gi{color:currentColor;opacity:.85;}
.sty-nm{display:flex;align-items:center;gap:11px;}
.sty-gt{display:block;font-size:11.5px;font-weight:600;color:var(--stg-mute);margin-top:2px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
/* Played is DIM, not struck through: the day is a record, not a chore list. */
.sty-g.done{opacity:.42;}
.sty-g.open{border-color:var(--cc);}
.sty-g:focus-visible,.sty-next:focus-visible,.sty-kc:focus-visible,.sty-cx:focus-visible{
  outline:2px solid var(--cc, var(--stg-ink2));outline-offset:2px;}

@media (max-width:560px){
  .sty-gp{display:none;}
  .sty-circs{grid-template-columns:minmax(0,1fr);}
}
@media (max-width:640px){
  /* The name never wraps; the DATE is what gives way, onto its own line first
     and out of the flow entirely on the narrowest screens. */
  /* TWO DELIBERATE ROWS, not three accidental ones (owner, 2026-08-31:
     "quizzes wraps to its own line on mobile"). Left to flex-wrap the cap put
     the name on line 1, five figures on line 2, and stranded the toggle and the
     Quizzes link alone on line 3. Row 1 is the identity and the two controls,
     row 2 is the figures, and nothing is left over. */
  /* TWO BARS OF THE SAME HEIGHT (owner, 2026-08-31). Bar one is what this page
     is and how to move around it: the name, the date, and the three controls.
     Bar two is who you are and how the day is going — or, for a reader with no
     account, the one thing worth offering them. */
  .sty-cap{display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;
    grid-template-areas:'id lb lf tg' 'fg fg fg fg';
    align-items:center;gap:0 8px;padding:0 14px;}
  .sty-id{grid-area:id;flex:none;min-width:0;padding:9px 0;}
  .sty-tg{grid-area:tg;}
  .sty-lb{grid-area:lb;}
  .sty-lf{grid-area:lf;}
  .sty-date{width:100%;order:3;}
  .sty-figs{grid-area:fg;margin-left:0;gap:0;justify-content:space-between;
    border-top:1px solid var(--stg-line);padding:9px 0;min-height:44px;align-items:center;}
  .sty-figs>div{min-width:0;}
  .sty-three{grid-template-columns:1fr;}
  .sty-ord{flex-wrap:wrap;}
  .sty-wrap{padding:18px 14px 56px;gap:22px;}
  .sty-nm{font-size:21px;}
  .sty-next{padding:15px 16px;gap:12px;}
  .sty-go{padding:8px 13px;font-size:13px;}
  .sty-games{grid-template-columns:minmax(0,1fr) minmax(0,1fr);}
}
@media (max-width:380px){
  .sty-date{display:none;}
  .sty-figs{gap:12px;}
}
@media (prefers-reduced-motion:reduce){.sty-prog span{transition:none;}}
`;
