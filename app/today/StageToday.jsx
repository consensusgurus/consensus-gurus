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
import { DAILY_GAMES } from '@/lib/daily-games';
import { RAMP_ORDER, categoryColor, categoryColorLight, RAMP_INK } from '@/lib/category-ramp';
import { fetchDayStatus, etToday } from '../useDayStats';
import { useStageTheme } from '@/lib/stage-theme';
import StageLadder from '../StageLadder';

const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const SANS = "Manrope, ui-sans-serif, system-ui, -apple-system, sans-serif";

const routeOf = (g) => g.href || `/${g.key}`;

function fmtDate(ymd) {
  if (!ymd) return '';
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export default function StageToday() {
  const [stageTheme] = useStageTheme();
  const [done, setDone] = useState(() => new Set());
  const [inprog, setInprog] = useState(() => new Set());
  const [day, setDay] = useState('');

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
          <div><b>{playedCount}<i>/{total}</i></b><i>played</i></div>
          <div><b>{cats.filter((c) => c.games.every((g) => done.has(g.key))).length}<i>/{cats.length}</i></b><i>categories</i></div>
        </div>
        <a className="sty-cx" href="/quizzes" aria-label="Quizzes">Quizzes</a>
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
.sty-id b{font-size:16px;font-weight:800;letter-spacing:-0.01em;}
.sty-date{font-family:${MONO};font-size:10.5px;letter-spacing:.11em;
  text-transform:uppercase;color:var(--stg-mute);white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis;}
.sty-figs{display:flex;gap:20px;margin-left:auto;}
.sty-figs>div{text-align:right;}
.sty-figs b{display:block;font-size:15px;font-weight:800;font-variant-numeric:tabular-nums;line-height:1.1;}
.sty-figs b i{font-style:normal;font-weight:600;color:var(--stg-mute);font-size:12px;}
.sty-figs>div>i{font-style:normal;font-family:${MONO};font-size:9px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--stg-mute);}
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
  .sty-cap{flex-wrap:wrap;gap:10px 16px;padding:10px 14px;}
  .sty-date{width:100%;order:3;}
  .sty-figs{margin-left:auto;gap:16px;}
  .sty-wrap{padding:18px 14px 56px;gap:22px;}
  .sty-nm{font-size:21px;}
  .sty-next{padding:15px 16px;gap:12px;}
  .sty-go{padding:8px 13px;font-size:13px;}
  .sty-games{grid-template-columns:1fr 1fr;}
}
@media (prefers-reduced-motion:reduce){.sty-prog span{transition:none;}}
`;
