'use client';

// THE ENDING IS A CURTAIN — the stage pattern's last rule, and the last piece
// of it to get built. Until now every stage game borrowed the Loft's finish
// card: a white panel tuned for a navy page, opening at the end of a near-black
// one. It worked, but it was the one moment on the stage that belonged to a
// different design.
//
// A curtain is not a card. The whole point of the ending is that the page
// CHANGES STATE, and the stage has spent the entire game refusing to spend its
// colour on anything but meaning — so the ending is where the accent finally
// floods. One band, edge to edge, carrying the verdict. That is the moment;
// everything after it is quiet again.
//
// SAME DATA, SAME CONTRACT. It takes LoftFinish's own props, so no game client
// changes and the two endings cannot disagree about a result. It also keeps
// LoftFinish's ordering rules rather than inventing new ones: the tone ranking
// below is that component's, and it encodes real decisions (a reveal leads,
// because showing a player what they missed is the one thing they want first;
// 'similar' comes OUT of the grid because a finisher was passing two exits
// before reaching the one that hands them forward).
import { useEffect, useMemo, useRef, useState } from 'react';
import { DAILY_GAMES, liveDailyKeys } from '@/lib/daily-games';
import { RAMP_ORDER, categoryColor } from '@/lib/category-ramp';
import GameGlyph from './GameGlyph';

// Which dailies are finished TODAY, from the breadcrumb every client writes on
// finishing. Read once on mount: a finish page is a snapshot, not live data.
// THE LIVE ROSTER, not DAILY_GAMES. A retired game stays in that array so its
// archived days keep scoring, so listing from it put Circa (retired 2026-07-20)
// back on screen (owner, 2026-08-31). Reading through liveDailyKeys fixes Extra
// on 2026-09-29 too, without anyone remembering to come back.
const LIVE = () => {
  const live = new Set(liveDailyKeys());
  return DAILY_GAMES.filter((g) => live.has(g.key));
};

function doneToday() {
  const out = new Set();
  let today = '';
  try { today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); } catch (e) { return out; }
  for (const g of LIVE()) {
    try {
      const c = JSON.parse(localStorage.getItem(`sot_${g.key}_day`) || 'null');
      if (c && c.d === today && c.done) out.add(g.key);
    } catch (e) {}
  }
  return out;
}

function Tile({ g, played }) {
  return (
    <a className={'stf-tile' + (played ? ' done' : '')} href={g.href || `/${g.key}`}
      style={{ '--tc': categoryColor(g.cat) }}>
      <GameGlyph gameKey={g.key} size={14} />
      <span>{g.name}</span>
    </a>
  );
}

const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const SANS = "Manrope, ui-sans-serif, system-ui, -apple-system, sans-serif";

// LoftFinish's ranking, not a new one. A tone this table does not know falls to
// 5, and the gold Share declares no tone so it keeps rank 0, directly under the
// lead pair.
const RANK = { reveal: -3, board: -2, replay: -1, another: 3, similar: 4, main: 9 };
const rankOf = (o) => (RANK[o.tone] != null ? RANK[o.tone] : (o.kind === 'gold' ? 0 : 5));

export default function StageFinish({
  // `day` is gone with the today's-board FIGURE it was the only reader of. The
  // callers still pass it, harmlessly, so putting that figure back is a one-line
  // change here rather than a sweep through 80 clients.
  title, detail, iq = null, board = null, streak = null,
  missLabel = null, gameRank = null, outcome = null, options = [], name = null,
  archive = null,
  retry = null,
}) {
  // THE RETRY ENDING. On the nine games where a replay genuinely counts, an
  // unsolved finish is not a page of furniture, it is one control (see the
  // fast-retry panel in app/LoftFinish.jsx, which owns the decision of WHEN
  // this shows). What it was NOT, until now, was a stage ending: it opened the
  // old white Loft card at the foot of a near-black page, the last thing on the
  // site still doing that once the stage went sitewide (owner, 2026-08-31).
  //
  // So it renders here instead, and takes the curtain -- the same full-bleed
  // accent band every other ending gets -- with the replay control under it and
  // nothing else. It shares this component rather than restating the curtain
  // somewhere else precisely so the two endings cannot drift into two different
  // bands, and so that the retry ending collapses the gameplay area on exactly
  // the same terms every other ending does (see the effect below).
  const isRetry = !!retry;
  // THE COLLAPSE IS THE CARD'S TO RELEASE. A finished page hides the board, the
  // leader strip and the play figures (app/globals.css), and it is keyed on a
  // class this component owns rather than on :has(.stf) — because 'Return to
  // board' flips CLIENT state to show that body again, and a rule keyed on the
  // card's mere presence overrode it, so the button did nothing (owner,
  // 2026-08-31). Anything that asks for the board back takes the class off
  // first; everything else leaves it on.
  // THE RETRY ENDING COLLAPSES TOO, and the reason is the ANIMATION rather
  // than the card (owner, 2026-08-31). It shipped earlier today leaving the
  // board up, on the argument that the position you just lost is the argument
  // for playing it again. What that missed is that the board does not go quiet
  // when the game ends: the engine's winning move animates in, and the client
  // prints its own line under it. The player watches that land -- every client
  // holds the finished board for HOLD_LONG before any of this renders, which is
  // exactly the window the animation plays in -- and THEN the curtain arrives,
  // into a page that was still carrying the gameplay area. Two things about the
  // same result, colliding.
  //
  // So the losing move plays out, and then the board goes. The hold shows the
  // ending; the curtain replaces it.
  useEffect(() => {
    const root = document.querySelector('.stage-page');
    if (!root) return undefined;
    root.classList.add('stf-collapse');
    // AND THE WAY BACK IN. 'Hide game board' is the client's own button and it
    // only flips client state, which under the collapse model nothing acts on:
    // pressing it made the button vanish and left the board (owner,
    // 2026-08-31). It is the exact inverse of Return to board, so it re-adds
    // the class. Delegated because the button belongs to 80 different clients
    // and mounts and unmounts with their own state.
    const back = (e) => {
      const t = e.target && e.target.closest && e.target.closest('.stf-hideboard');
      if (t) root.classList.add('stf-collapse');
    };
    document.addEventListener('click', back);
    return () => {
      document.removeEventListener('click', back);
      root.classList.remove('stf-collapse');
    };
  }, []);
  // THE REST OF THE SITE, from the one page a reader reliably reaches (owner,
  // 2026-08-31). Three doors, and none of them can appear before the game is
  // over because this component only exists then.
  const [cat, setCat] = useState(null);        // null | a category | 'all'
  const [arch, setArch] = useState(false);     // this game's own back catalogue
  const [played, setPlayed] = useState(() => new Set());
  useEffect(() => { setPlayed(doneToday()); }, []);

  const me = useMemo(() => LIVE().find((g) => g.name === name) || null, [name]);
  // MORE OF WHAT THEY JUST PLAYED. Unplayed first, so the row leads with
  // somewhere to actually go rather than with what they have already done.
  const sameCat = useMemo(() => {
    if (!me) return [];
    return LIVE()
      .filter((g) => g.cat === me.cat && g.key !== me.key)
      .sort((a, b) => (played.has(a.key) - played.has(b.key)) || a.name.localeCompare(b.name))
      .slice(0, 8);
  }, [me, played]);
  // The arrows are only worth showing when the row actually overflows, which
  // only the rendered row can say.
  const catsRef = useRef(null);
  const [over, setOver] = useState(false);
  useEffect(() => {
    const el = catsRef.current;
    if (!el) return undefined;
    const read = () => setOver(el.scrollWidth > el.clientWidth + 4);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const nudge = (dir) => {
    const el = catsRef.current;
    if (el) el.scrollBy({ left: dir * Math.max(160, el.clientWidth * 0.7), behavior: 'smooth' });
  };

  const catList = useMemo(() => (cat
    ? LIVE().filter((g) => cat === 'all' || g.cat === cat).slice().sort((a, b) => a.name.localeCompare(b.name))
    : []), [cat]);

  const uncollapse = () => {
    const root = document.querySelector('.stage-page');
    if (root) root.classList.remove('stf-collapse');
  };
  // 'board' and 'reveal' are the two that put the board back on screen.
  const wrap = (o) => (o.tone === 'board' || o.tone === 'reveal'
    ? { ...o, onClick: (e) => { uncollapse(); if (o.onClick) o.onClick(e); } }
    : o);

  const opts = useMemo(
    () => [...options.filter(Boolean)].map(wrap).sort((a, b) => rankOf(a) - rankOf(b)),
    [options],   // eslint-disable-line react-hooks/exhaustive-deps
  );
  const forward = opts.find((o) => o.tone === 'similar') || null;
  const rest = opts.filter((o) => o !== forward);

  const archiveRows = Array.isArray(archive) ? archive : [];
  const archiveBtn = (
    <button key="arch" type="button" className={'stf-o' + (arch ? ' on' : '')}
      onClick={() => setArch((v) => !v)}>
      <b>{name ? `Full ${name} archive` : 'Full archive'}</b>
      <i>{arch ? 'Hide the list' : `Every one of the ${archiveRows.length}`}</i>
    </button>
  );

  const rows = board && Array.isArray(board.rows) ? board.rows.slice(0, 5) : [];
  const myRank = board && board.myRank != null ? board.myRank : null;
  const field = board && board.field != null ? board.field : null;

  // 'similar' arrives as `${name} · ${tag}`, which is the shape all 65 clients
  // already pass, so the heading and the line under it come off one prop.
  const fwdName = forward && forward.sub && forward.sub.includes('·')
    ? forward.sub.split('·')[0].trim() : (forward ? forward.label : '');
  const fwdTag = forward && forward.sub && forward.sub.includes('·')
    ? forward.sub.split('·').slice(1).join('·').trim() : '';

  // The two standings that used to be figures. Strings, not elements, so the
  // line under the verdict reads as one sentence of figures rather than as a
  // row of blocks that happens to be inline. gameRank arrives split into a
  // value and its own label ('#5' + 'of 348 Four all time'), which is why this
  // rejoins them rather than composing the label here.
  // WHERE THEY RENDER depends on whether the board section is there to carry
  // them. The eyebrow over the leaderboard is already a line of standings
  // ('Today's board · you are #7 of 11'), so these belong on the end of it. A
  // game with no board rows has no such line, and the verdict's own detail is
  // the fallback rather than dropping two real figures off the card.
  const standings = [];
  if (gameRank && gameRank.value != null) {
    standings.push(`${gameRank.value} ${gameRank.label || 'all time'}`);
  }
  if (streak) standings.push(`${streak} day streak`);
  const rowsPresent = board && Array.isArray(board.rows) && board.rows.length > 0;
  const loose = rowsPresent ? [] : standings;

  // Placed AFTER every hook above, so the two endings run the same hooks in
  // the same order on every render.
  if (isRetry) {
    return (
      <div className={'stf stf-rtwrap' + (outcome ? ' stf-' + outcome : '')}>
        <style>{CSS}</style>

        <div className="stf-curtain">
          <div className="stf-cin">
            <div className="stf-verdict">{title}</div>
            {detail ? <div className="stf-detail">{detail}</div> : null}
          </div>
        </div>

        <div className="stf-wrap">
          {/* The one control, in the hand-forward's own shape: this IS the
              hand-forward on these games, it just points back at the board
              instead of on to the next game. */}
          <button type="button" className="stf-fwd stf-rt" onClick={retry.onReplay}>
            <div>
              {/* Both lines come from dailyAttemptRule, so what a replay is
                  worth is stated by the registry that decides it and can never
                  drift from the same sentence on the full card. */}
              {retry.eyebrow ? <div className="stf-eb">{retry.eyebrow}</div> : null}
              <div className="stf-fwdn">Replay instantly</div>
              {retry.sub ? <div className="stf-fwdt">{retry.sub}</div> : null}
            </div>
            <span className="stf-go">Replay</span>
          </button>

          <div className="stf-opts">
            <button type="button" className="stf-o" onClick={retry.onCard}>
              <b>Show end game card</b>
              <i>Your IQ, today&rsquo;s board, the archive and what to play next</i>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={'stf' + (outcome ? ' stf-' + outcome : '')}>
      <style>{CSS}</style>

      {/* THE CURTAIN. The one place on the stage where the accent covers
          something rather than marking it. Edge to edge, because a band with a
          margin reads as another card. */}
      {/* THE IQ IS THE ONE FIGURE THAT BELONGS ON THE BAND (owner, 2026-08-31).
          It was the first of four stats in a row underneath, all at the same
          weight, which asked the reader to find the number they came for among
          three they did not. It is what the run was WORTH, so it goes on the
          verdict's own band, opposite the verdict, and it is set larger than the
          stats ever were.

          IT IS PINNED TO THE CONTENT COLUMN, not the viewport. The band is
          full-bleed, so a right-aligned figure inside it would sit against the
          screen edge with nothing under it; .stf-cin is the same 720px .stf-wrap
          uses, so the number lands over the blocks it belongs to.

          The other three stats: today's board is gone (the table directly below
          says it, in full), and the all-time rank and the streak go onto the end
          of that table's own eyebrow, which is already a line of standings. They
          spent one deploy on the verdict's line and crowded the one sentence
          that describes the run itself. On a phone they do not render at all
          -- see .stf-dx in the media query. */}
      <div className="stf-curtain">
        <div className="stf-cin">
          <div className="stf-ctop">
            <div className="stf-cl">
              <div className="stf-verdict">{title}</div>
              {(detail || loose.length) ? (
                <div className="stf-detail">
                  {detail}
                  {loose.length ? (
                    <span className="stf-dx">{detail ? ' \u00b7 ' : ''}{loose.join(' \u00b7 ')}</span>
                  ) : null}
                </div>
              ) : null}
            </div>
            {iq && iq.gained != null ? (
              <div className="stf-ciq">
                <b>+{Number(iq.gained).toLocaleString()}</b>
                <i>IQ earned</i>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="stf-wrap">
        {/* THE BOARD LEADS NOW. It used to sit under a row of four figures whose
            first line said #22 of 137; the table is what that number means, and
            the figure that announced it has moved onto the band. */}
        {rows.length ? (
          <section>
            <div className="stf-eb">Today&rsquo;s board{myRank != null ? <em> &middot; you are #{myRank}{field ? ` of ${field}` : ''}</em> : null}{standings.length ? <em className="stf-dx"> &middot; {standings.join(' \u00b7 ')}</em> : null}</div>
            <table className="stf-tbl">
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.username || i} className={r.me ? 'me' : undefined}>
                    <td className="stf-pos">{r.rank != null ? `#${r.rank}` : `#${i + 1}`}</td>
                    <td className="stf-who">{r.username || 'Guest'}</td>
                    <td className="stf-sc">{r.score != null ? r.score : '—'}</td>
                    <td className="stf-pt">{r.points != null ? r.points : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        {/* THE HAND-FORWARD, for LoftFinish's own reason: it used to sit
            below the verdict, the IQ bar, four tiles and the whole board, so a
            finisher passed two exits before reaching the one that carries on. */}
        {forward ? (
          <a className="stf-fwd" href={forward.href} onClick={forward.onClick}>
            <div>
              <div className="stf-eb">Up next</div>
              <div className="stf-fwdn">{fwdName}</div>
              {fwdTag ? <div className="stf-fwdt">{fwdTag}</div> : null}
            </div>
            <span className="stf-go">Play</span>
          </a>
        ) : null}

        {/* MORE OF THE SAME, directly under the one recommendation. Up next is
            a single pick; a reader who does not want it should not have to go
            back to the home to find its neighbours. */}
        {sameCat.length ? (
          <section>
            <div className="stf-eb">{me ? `More ${me.cat} puzzles` : 'More puzzles'}</div>
            <div className="stf-tiles">
              {sameCat.map((g) => <Tile key={g.key} g={g} played={played.has(g.key)} />)}
            </div>
          </section>
        ) : null}

        {/* EVERY CATEGORY, under the one they just played (owner, 2026-08-31).
            It sat above the verdict, which put a browse control ahead of the
            result. Here it reads as the next widening step: this game, then its
            category, then all of them. Same eyebrow as the section above it, so
            the two are plainly the same kind of thing. Pressing a category
            lists it A to Z; pressing it again puts it away. */}
        <section>
          <div className="stf-eb">All categories</div>
          <div className="stf-catrow">
            {/* ONE LINE, ALWAYS. Nine chips wrapped to a second row and left
                Arcade stranded (owner, 2026-08-31), so the row scrolls: a flick
                on a phone, arrows on a desktop where there is no obvious way to
                swipe. The arrows appear only when something is out of view. */}
            <button type="button" className="stf-catnav" aria-label="Scroll categories left"
              onClick={() => nudge(-1)} hidden={!over}>&#8249;</button>
            <div className="stf-cats" ref={catsRef}>
              {RAMP_ORDER.map((c) => (
                <button key={c} type="button"
                  className={'stf-cat' + (cat === c ? ' on' : '')}
                  style={{ '--tc': categoryColor(c) }}
                  onClick={() => setCat((v) => (v === c ? null : c))}>{c}</button>
              ))}
            </div>
            <button type="button" className="stf-catnav" aria-label="Scroll categories right"
              onClick={() => nudge(1)} hidden={!over}>&#8250;</button>
          </div>
          {cat ? (
            <div className="stf-catlist">
              <div className="stf-eb">
                {cat === 'all' ? 'All daily puzzles' : cat} <em>&middot; {catList.length}</em>
              </div>
              <div className="stf-tiles">
                {catList.map((g) => <Tile key={g.key} g={g} played={played.has(g.key)} />)}
              </div>
            </div>
          ) : null}
        </section>

        <div className="stf-opts">
          {rest.map((o, i) => {
            const node = o.href
              ? <a key={i} className={'stf-o' + (o.kind === 'gold' ? ' gold' : '')} href={o.href} onClick={o.onClick}>
                  <b>{o.label}</b>{o.sub ? <i>{o.sub}</i> : null}
                </a>
              : <button key={i} type="button" className={'stf-o' + (o.kind === 'gold' ? ' gold' : '')} onClick={o.onClick}>
                  <b>{o.label}</b>{o.sub ? <i>{o.sub}</i> : null}
                </button>;
            // THE ARCHIVE SITS BESIDE 'Play another' (owner, 2026-08-31),
            // because they are the same question at two sizes: one more day of
            // this game, or every day of it. All 80 clients already pass
            // `archive` to LoftFinish; the stage ending simply never took it.
            return (o.tone === 'another' && archiveRows.length)
              ? [node, archiveBtn] : node;
          })}
          {/* No 'Play another'? The archive still belongs on the card. */}
          {archiveRows.length && !rest.some((o) => o.tone === 'another') ? archiveBtn : null}
          {/* THE OLD BROWSE BUTTON, back in the slot the grid left empty. It
              opens the same A-to-Z panel the category row above does, rather
              than navigating away. */}
          <button type="button" className={'stf-o' + (cat === 'all' ? ' on' : '')}
            onClick={() => setCat((v) => (v === 'all' ? null : 'all'))}>
            <b>All daily puzzles</b><i>{cat === 'all' ? 'Hide the list' : `Every one of the ${LIVE().length}`}</i>
          </button>
        </div>

        {/* The list opens under the button that asked for it, newest first. */}
        {arch && archiveRows.length ? (
          <section>
            <div className="stf-eb">
              {name ? `${name} archive` : 'Archive'} <em>&middot; {archiveRows.length}</em>
            </div>
            <div className="stf-arch">
              {archiveRows.map((a) => (
                <a key={a.num} className={'stf-archr' + (a.done ? ' done' : '')} href={a.href}>
                  <span className="d">{a.dateLabel}{a.sunday ? <i>Sunday</i> : null}</span>
                  <span className="n">No. {a.num}</span>
                  {/* Played is STATED, not implied: a bare score next to a row
                      that says Play reads as noise. */}
                  <span className="v">{a.done
                    ? <>{a.score != null ? <b>{a.score}</b> : null}<em>Played</em></>
                    : 'Play'}</span>
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

const CSS = `
.stf{font-family:${SANS};color:var(--stg-ink);}
.stf *{box-sizing:border-box;}

/* ── the curtain ───────────────────────────────────────────────────────── */
/* ── the category row, and the list it opens ───────────────────────────── */
/* The label is now the section's own eyebrow above the row, so the row is
   just the scroller and its two arrows. */
.stf-catrow{display:flex;align-items:center;gap:8px;min-width:0;}
.stf-cats{display:flex;flex-wrap:nowrap;gap:6px;overflow-x:auto;scrollbar-width:none;
  -webkit-overflow-scrolling:touch;scroll-snap-type:x proximity;min-width:0;}
.stf-cats::-webkit-scrollbar{display:none;}
.stf-cat{scroll-snap-align:start;flex:none;}
.stf-catnav{flex:none;background:var(--stg-surf);border:1px solid var(--stg-line);border-radius:7px;
  color:var(--stg-ink2);cursor:pointer;font-size:14px;line-height:1;padding:5px 9px;}
.stf-catnav:hover{border-color:var(--stg-line2);color:var(--stg-ink);}
@media (hover:none){ .stf-catnav{display:none;} }
.stf-cat{font-family:${MONO};font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;
  /* THE CHIPS TAKE THE SURFACE (owner, 2026-08-31). They were the one row on
     the card still transparent, so on the light register they showed the pale
     page ground through them while every tile and option beside them was white.
     --stg-surf is that white, and the near-black raise on the dark one. */
  font-weight:700;background:var(--stg-surf);cursor:pointer;color:var(--stg-ink2);
  border:1px solid var(--stg-line);border-left:3px solid var(--tc);border-radius:7px;
  padding:6px 11px;}
.stf-cat:hover{color:var(--stg-ink);border-color:var(--stg-line2);border-left-color:var(--tc);}
.stf-cat.on{color:var(--tc);border-color:var(--tc);}
.stf-catlist{margin-top:12px;}

/* One tile shape for both lists: the A-to-Z panel and More-of-the-same. */
.stf-tiles{display:grid;gap:6px;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));}
.stf-tile{display:flex;align-items:center;gap:7px;text-decoration:none;color:var(--stg-ink);
  background:var(--stg-surf);border:1px solid var(--stg-line);border-left:3px solid var(--tc);
  border-radius:8px;padding:8px 10px;font-size:12.5px;font-weight:700;min-width:0;}
.stf-tile svg{flex:none;color:var(--tc);}
.stf-tile span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.stf-tile:hover{border-color:var(--stg-line2);border-left-color:var(--tc);}
/* Played today reads as done without leaving the list: the tile keeps its
   colour on the rule and gives up only its fill. */
.stf-tile.done{background:none;color:var(--stg-mute);}
.stf-o.on{border-color:var(--stg-acc);color:var(--stg-acc);}

.stf-curtain{background:var(--stg-acc);color:var(--stg-onramp,#08222e);
  margin:0 calc(50% - 50vw);padding:30px calc(50vw - 50% + 4px) 26px;}
.stf-cin{max-width:720px;margin:0 auto;}
.stf-ctop{display:flex;align-items:flex-end;gap:22px;}
.stf-cl{flex:1;min-width:0;}
.stf-verdict{font-size:36px;font-weight:800;letter-spacing:-0.03em;line-height:1.05;
  text-wrap:balance;}
.stf-detail{margin-top:7px;font-size:14px;font-weight:700;opacity:.78;}
/* Bigger than the 22px the stats row used, smaller than the verdict: it is the
   second thing on the band, not the first. It takes the band's own ink rather
   than the green the figures row gave it, because green on the accent is the
   one colour pairing the stage does not have. */
.stf-ciq{flex:none;text-align:right;}
.stf-ciq b{display:block;font-size:34px;font-weight:800;line-height:1;
  letter-spacing:-0.02em;font-variant-numeric:tabular-nums;}
.stf-ciq i{display:block;font-style:normal;font-family:${MONO};font-size:11.5px;
  letter-spacing:.1em;text-transform:uppercase;opacity:.8;margin-top:7px;}

.stf-wrap{max-width:720px;margin:0 auto;padding:22px 4px 8px;
  display:flex;flex-direction:column;gap:20px;}
.stf-eb{font-family:${MONO};font-size:9.5px;letter-spacing:.15em;text-transform:uppercase;
  color:var(--stg-mute);margin-bottom:8px;}
.stf-eb em{font-style:normal;color:var(--stg-ink2);}

/* ── the hand-forward ──────────────────────────────────────────────────── */
.stf-fwd{display:flex;align-items:center;gap:16px;text-decoration:none;
  background:var(--stg-surf);border:1px solid var(--stg-line);
  border-left:4px solid var(--stg-acc);border-radius:10px;padding:14px 16px;color:var(--stg-ink);}
.stf-fwd:hover{border-color:var(--stg-line2);border-left-color:var(--stg-acc);}
.stf-fwdn{font-size:20px;font-weight:800;letter-spacing:-0.01em;line-height:1.15;}
.stf-fwdt{font-size:12.5px;font-weight:600;color:var(--stg-mute);margin-top:2px;}
.stf-go{margin-left:auto;flex:none;font-size:13px;font-weight:800;
  background:var(--stg-acc);color:var(--stg-onramp,#08222e);
  border-radius:8px;padding:8px 16px;}
/* The retry control is the hand-forward as a BUTTON: same shape, same accent
   rule, same chip. .stf-fwd is written for an <a>, so a button needs the four
   properties a form control does not inherit. */
.stf-rt{width:100%;font:inherit;text-align:left;cursor:pointer;}
.stf-rt .stf-eb{margin-bottom:5px;}
/* Nothing follows the curtain but the control, so the page does not need the
   full ending's breathing room above it. */
.stf-rtwrap .stf-wrap{padding-top:18px;gap:9px;}

/* ── the board ─────────────────────────────────────────────────────────── */
.stf-tbl{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums;}
.stf-tbl td{padding:7px 6px;border-bottom:1px solid var(--stg-line);font-size:13.5px;}
.stf-tbl tr:last-child td{border-bottom:0;}
.stf-tbl tr.me td{background:var(--stg-chip);font-weight:800;}
.stf-pos{width:44px;font-family:${MONO};font-size:12px;color:var(--stg-mute);}
.stf-who{font-weight:700;}
.stf-sc,.stf-pt{width:56px;text-align:right;color:var(--stg-ink2);}
.stf-pt{font-weight:800;color:var(--stg-ink);}

/* ── this game's back catalogue ────────────────────────────────────────── */
.stf-arch{display:grid;gap:5px;max-height:420px;overflow-y:auto;}
.stf-archr{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--stg-ink);
  background:var(--stg-surf);border:1px solid var(--stg-line);border-radius:8px;
  padding:9px 12px;font-size:13px;}
.stf-archr:hover{border-color:var(--stg-line2);}
.stf-archr .d{font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.stf-archr .d i{font-style:normal;font-family:${MONO};font-size:8.5px;letter-spacing:.1em;
  text-transform:uppercase;color:var(--stg-acc);margin-left:7px;}
.stf-archr .n{font-family:${MONO};font-size:11px;color:var(--stg-mute);}
.stf-archr .v{margin-left:auto;flex:none;display:flex;align-items:center;gap:7px;
  font-size:12.5px;font-weight:800;color:var(--stg-acc);}
.stf-archr .v em{font-style:normal;font-family:${MONO};font-size:8.5px;letter-spacing:.1em;
  text-transform:uppercase;font-weight:700;color:var(--stg-mute);}
.stf-archr .v b{font-variant-numeric:tabular-nums;color:var(--stg-ink);}
/* Played gives up its fill, exactly as a played tile does. */
.stf-archr.done{background:none;}
.stf-archr.done .d{color:var(--stg-mute);}

/* ── the options ───────────────────────────────────────────────────────── */
.stf-opts{display:grid;gap:7px;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));}
.stf-o{display:block;text-align:left;text-decoration:none;cursor:pointer;font:inherit;
  background:var(--stg-surf);border:1px solid var(--stg-line);border-radius:9px;
  padding:11px 13px;color:var(--stg-ink);}
.stf-o:hover{border-color:var(--stg-line2);}
.stf-o b{display:block;font-size:14px;font-weight:800;}
.stf-o i{display:block;font-style:normal;font-size:11.5px;font-weight:600;
  color:var(--stg-mute);margin-top:2px;}
/* The gold Share keeps its own weight: it is the one option that asks for
   something rather than offering something. */
.stf-o.gold{background:var(--stg-acc);color:var(--stg-onramp,#08222e);border-color:transparent;}
.stf-o.gold i{color:inherit;opacity:.78;}
.stf-o:focus-visible,.stf-fwd:focus-visible{outline:2px solid var(--stg-acc);outline-offset:2px;}

@media (max-width:640px){
  .stf-curtain{padding:22px 18px 20px;}
  .stf-verdict{font-size:27px;}
  /* THE STANDINGS COME OFF THE PHONE (owner, 2026-08-31). The line under the
     verdict is the run itself -- the score, the misses, the clock -- and at
     390px appending a rank and a streak to it wraps that sentence onto a third
     and fourth line to say what the card says again further down. The IQ stays,
     smaller: it is the number the reader came for. */
  .stf-dx{display:none;}
  .stf-ctop{gap:14px;}
  .stf-ciq b{font-size:26px;}
  .stf-ciq i{font-size:10px;margin-top:5px;}
  .stf-wrap{padding:18px 2px 8px;gap:17px;}
  .stf-opts{grid-template-columns:1fr 1fr;}
}
`;
