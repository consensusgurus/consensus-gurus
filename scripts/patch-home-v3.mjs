/* Home v3 preview patch.
 *
 * Applies the decluttered homepage (Mock A v3) as an ADDITIVE preview at
 * /home-preview. Nothing on / changes: every branch added here is gated on a
 * new `variant` prop that defaults to the current layout, on a new DailyStrip
 * `layout="catboard"` value, and on a new HomeRails `side="board"` value.
 *
 * WHY A SCRIPT AND NOT DIRECT EDITS: CLAUDE.md's stale-base rule. The working
 * tree can be behind origin, and a direct edit pushed from it silently
 * overwrites whatever landed in between. This script is run against a FRESH
 * `git show FETCH_HEAD:<path>` copy in the same step as the push, so the base is
 * never stale. Every anchor is asserted: a missing or duplicated anchor throws
 * rather than producing a half-patched file.
 *
 * RE-RUNNABLE: sub() skips an edit whose replacement is already present, so the
 * script can be re-run against an origin that already carries it in order to
 * ship a follow-up. The rule that falls out of that: when an edit INSERTS
 * around its anchor, any later fix to the inserted text must be a SEPARATE
 * sub() rather than an amendment to the insert, because the insert is skipped
 * and the amendment would go with it.
 *
 *   node scripts/patch-home-v3.mjs <indir> <outdir>
 *
 * Reads  <indir>/{QuizHomeClient.jsx,DailyStrip.jsx,HomeRails.jsx}
 * Writes <outdir>/{same three}, plus <outdir>/page.js for app/home-preview/.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [, , IN, OUT] = process.argv;
if (!IN || !OUT) { console.error('usage: patch-home-v3.mjs <indir> <outdir>'); process.exit(2); }
mkdirSync(OUT, { recursive: true });

let CHANGES = 0;
let SKIPPED = 0;
/* Exact-once replacement, and IDEMPOTENT: once this patch is on origin the
 * script has to be re-runnable to ship a follow-up fix, so an anchor whose
 * replacement is ALREADY present is skipped rather than treated as missing.
 * Anything else still throws, which is what stops a half-applied patch. */
function sub(src, find, repl, label, count = 1) {
  // ALREADY-APPLIED IS TESTED FIRST, and it has to be. Several of these edits
  // INSERT before their anchor rather than replacing it, so the anchor is still
  // there afterwards and an occurrence count alone reads a patched file as
  // unpatched: the first version of this guard checked `n === 0 && ...` and
  // would have inserted the whole board branch a second time.
  if (src.includes(repl)) { SKIPPED += 1; return src; }
  const n = src.split(find).length - 1;
  if (n !== count) throw new Error(`ANCHOR ${label}: expected ${count} occurrence(s), found ${n}`);
  CHANGES += n;
  return src.split(find).join(repl);
}

/* ══════════════════════════════════════════════════════════════════════════
   1. HomeRails.jsx  ·  side="board"
   One pinned panel replacing both rails: a tab strip (Leaderboard / Live /
   You) over four accordion sections. Exactly one section is open and it takes
   the leftover height, so the panel never exceeds the viewport.
   ══════════════════════════════════════════════════════════════════════════ */
{
  let s = readFileSync(join(IN, 'HomeRails.jsx'), 'utf8');

  // (a) Accordion + tab state. Sits with the other hooks, never behind the
  //     side branch: hook order has to be identical on every render.
  s = sub(s,
    `  const toggle = (k) => setOpen((p) => ({ ...p, [k]: !p[k] }));`,
    `  const toggle = (k) => setOpen((p) => ({ ...p, [k]: !p[k] }));
  // side="board" only: which tab is showing, and which accordion section is
  // open inside the Leaderboard tab. Declared here with the other hooks.
  const [bTab, setBTab] = useState('lb');
  const [bSec, setBSec] = useState('today');`,
    'HR:state');

  // (b) The two side-gated effects have to fire for the board too, or the
  //     Contest face and the You tab come up empty.
  s = sub(s,
    `  useEffect(() => { if (side === 'left') setContestLive(contestIsLive()); }, [side]);`,
    `  useEffect(() => { if (side === 'left' || side === 'board') setContestLive(contestIsLive()); }, [side]);`,
    'HR:contest-gate');
  s = sub(s,
    `    if (side !== 'right') return undefined;`,
    `    if (side !== 'right' && side !== 'board') return undefined;`,
    'HR:day-gate');

  // (c) The branch itself, inserted after CSS is defined and before the two
  //     existing returns.
  const BOARD = `  if (side === 'board') {
    /* ONE PINNED PANEL (home v3). The left rail is gone and its two elements,
       the three-face leaderboard and Category leaders, moved in here as
       accordion sections alongside two IQ boards. Only one section is open at
       a time and the open one is the flex child that grows, which is what
       keeps the whole panel inside the viewport no matter how many rows a
       board holds. Closed bands still carry their leader, so shutting three of
       them loses nothing you came for.

       Nothing here is new data: dailyRows, catLeaders, xp30 and xpAll are all
       already computed above for the left rail, and the Live and You tabs
       reuse the right rail's own feed, streak and rival. */
    const bRows = (rows, fmt, unit, eyebrow, sub_, href, footLabel) => (
      <>
        <div className="hr-scroll hrb-body">
          <Rows
            rows={boardSlice(rows, true)}
            fmt={fmt}
            hrefFor={(n) => \`/player/\${encodeURIComponent(n)}\`}
            hero={{ eyebrow, sub: sub_, unit, tone: 'lite' }}
          />
        </div>
        <div className="hr-foot">
          <span className="hr-exp" style={{ opacity: 0 }} aria-hidden="true">&middot;</span>
          <Link href={href} className="hr-link">{footLabel} &rarr;</Link>
        </div>
      </>
    );
    const lead = (rows) => ((rows && rows.length) ? rows[0].name : null);
    const catLed = catLeaders.filter((c) => c.leader).length;
    const SECS = [
      {
        k: 'today',
        label: 'Today \\u00b7 Combined',
        cap: lead(dailyRows),
        body: () => bRows(dailyRows, (v) => v, 'points', "Today's leader", 'Combined daily games score', '/quizzes/hub?tab=daily', 'Full daily board'),
      },
      {
        k: 'cats',
        label: 'By category',
        cap: catLeaders.length ? \`\${catLed} of \${catLeaders.length} led\` : null,
        body: () => (
          <>
            <div className="hr-scroll hrb-body">
              {catLeaders.map((row) => <CatSlip key={row.name} row={row} />)}
              {!catLeaders.length ? <div className="hr-none" style={{ padding: '10px 13px' }}>No categories on the board yet today.</div> : null}
            </div>
            <div className="hr-foot">
              <span className="hr-exp" style={{ opacity: 0 }} aria-hidden="true">&middot;</span>
              <Link href="/quizzes/hub?tab=daily" className="hr-link">Daily boards &rarr;</Link>
            </div>
          </>
        ),
      },
      {
        k: 'm30',
        label: 'Last 30 days',
        cap: lead(xp30),
        body: () => bRows(xp30, num, 'IQ pts', 'Top of the month', 'IQ points earned in 30 days', '/quizzes/hub?tab=player', 'Monthly board'),
      },
      {
        k: 'all',
        label: 'All time \\u00b7 IQ Points',
        cap: lead(xpAll.length ? xpAll : xp30),
        body: () => bRows(xpAll.length ? xpAll : xp30, num, 'IQ pts', 'Top player, all time', 'Lifetime IQ points', '/quizzes/hub?tab=player', 'All time board'),
      },
    ];
    const TABS = [['lb', 'Leaderboard'], ['live', 'Live'], ['you', 'You']];
    return (
      <>
        {CSS}
        <style>{\`
          /* Scoped to .hr-board and placed AFTER the shared sheet on purpose:
             the max-width:1200px block in CSS flattens .hr-flex to flex:none,
             so anything that has to stretch must be declared later. Pinning is
             min-width:1201px only, which is the same threshold the parent uses
             to pin a rail at all, so 901-1200 and mobile keep their natural
             stacked flow untouched. */
          .hr-board{display:flex;flex-direction:column;min-height:0;}
          .hrb-tabs{display:flex;flex:none;background:#0e2a63;}
          .hrb-tabs button{flex:1;border:none;background:transparent;color:#a3bce8;font:inherit;font-size:10.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:10px 4px;cursor:pointer;border-bottom:3px solid transparent;}
          .hrb-tabs button.on{color:var(--white);border-bottom-color:var(--white);background:var(--accent);}
          .hrb-acc{display:flex;flex-direction:column;min-height:0;}
          .hrb-sec{display:flex;flex-direction:column;min-height:0;flex:none;}
          .hrb-band{display:flex;align-items:center;gap:8px;width:100%;flex:none;border:none;border-top:1px solid var(--border);background:#eef2f8;color:#41506b;font:inherit;font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;padding:9px 13px;cursor:pointer;text-align:left;border-radius:0;}
          .hrb-band .ch{flex:none;width:10px;text-align:center;font-size:10px;color:#7b8496;}
          .hrb-band .cv{margin-left:auto;font-size:10px;font-weight:800;letter-spacing:.02em;text-transform:none;color:var(--blue-dark);max-width:46%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
          .hrb-band.on{background:var(--accent);color:var(--white);border-top-color:var(--accent);}
          .hrb-band.on .ch,.hrb-band.on .cv{color:#bcd3ff;}
          .hrb-body{min-height:0;overflow-y:auto;}
          .hrb-pane{display:flex;flex-direction:column;min-height:0;}
          @media(min-width:1201px){
            .hr-board{flex:1 1 auto;}
            .hrb-acc{flex:1 1 auto;}
            .hrb-sec.on{flex:1 1 auto;min-height:0;}
            .hrb-sec.on .hrb-body{flex:1 1 auto;}
            .hrb-pane{flex:1 1 auto;}
            .hrb-pane .hrb-body{flex:1 1 auto;}
          }
        \`}</style>
        <section className="hr-panel hr-board">
          <div className="hr-ph">
            <span className="hr-pi"><CrownIcon /></span>
            <h2>Leaderboards</h2>
            <span className="hr-chip">TODAY</span>
          </div>
          <div className="hrb-tabs" role="tablist">
            {TABS.map(([k, label]) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={bTab === k}
                className={bTab === k ? 'on' : undefined}
                onClick={() => setBTab(k)}
              >{label}</button>
            ))}
          </div>

          {bTab === 'lb' ? (
            <div className="hrb-acc">
              {SECS.map((sc) => {
                const on = bSec === sc.k;
                return (
                  <div key={sc.k} className={\`hrb-sec\${on ? ' on' : ''}\`}>
                    <button type="button" className={\`hrb-band\${on ? ' on' : ''}\`} aria-expanded={on} onClick={() => setBSec(sc.k)}>
                      <span className="ch" aria-hidden="true">{on ? '\\u25be' : '\\u25b8'}</span>
                      <span>{sc.label}</span>
                      {sc.cap ? <span className="cv">{sc.cap}</span> : null}
                    </button>
                    {on ? sc.body() : null}
                  </div>
                );
              })}
            </div>
          ) : null}

          {bTab === 'live' ? (
            <div className="hrb-pane">
              <div className="hr-lslab lite">
                <div className="hr-lstxt">
                  <div className="hr-lseye">Live &middot; today</div>
                  <div className="hr-lsnm">{num(playsToday)} {playsToday === 1 ? 'play' : 'plays'}</div>
                  <div className="hr-lssub">every puzzle and quiz</div>
                </div>
                <div className="hr-lspair">
                  <span>{num(playersToday)}<i>{playersToday === 1 ? 'player' : 'players'}</i></span>
                  <span>{timeToday}<i>played</i></span>
                </div>
              </div>
              <div className="hr-scroll hrb-body">
                {(lastPlayed || []).map((f, i) => {
                  const frac = f.total ? f.score / f.total : 0;
                  const pct = Math.round(frac * 100);
                  const cat = catFor ? catFor(f.quizId) : null;
                  return (
                    <Link key={\`\${f.quizId}-\${i}\`} href={hrefFor ? hrefFor(f.quizId) : '#'} className="hr-res rule">
                      <i className="hr-rl" style={{ background: ringTone(pct) }} aria-hidden="true" />
                      <span className="hr-mid">
                        <span className="hr-t">
                          <span className="hr-ttl">{titleFor ? titleFor(f.quizId) : f.quizId}</span>
                          {f.dayCount > 0 ? <span className="hr-x">(x{f.dayCount})</span> : null}
                          {cat ? <span className="hr-cat" style={{ background: cat.tint, color: cat.color }}>{cat.label}</span> : null}
                        </span>
                        <span className="hr-s">
                          <b className="hr-res-sc">{f.score}/{f.total}</b>
                          {typeof f.pct === 'number' ? \` \\u00b7 beat \${f.pct}%\` : ''}{f.when ? \` \\u00b7 \${f.when}\` : ''}
                        </span>
                      </span>
                      <span className="hr-pc">{pct}%</span>
                    </Link>
                  );
                })}
                {!(lastPlayed || []).length ? <div className="hr-none" style={{ padding: '10px 13px' }}>No recent plays yet.</div> : null}
              </div>
              <div className="hr-foot">
                <button type="button" className="hr-exp" onClick={onAllLive}>All activity</button>
                <Link href="/quizzes/hub?tab=player" className="hr-link">Stat hub &rarr;</Link>
              </div>
            </div>
          ) : null}

          {bTab === 'you' ? (
            <div className="hrb-pane">
              <div className={\`hr-lslab\${streak > 0 ? ' lite' : ''}\`}>
                <div className="hr-lstxt">
                  <div className="hr-lseye">Days in a row</div>
                  <div className="hr-lsnm">{streak > 0 ? \`\${streak} \${streak === 1 ? 'day' : 'days'}\` : 'Not started'}</div>
                  <div className="hr-lssub">
                    {streak <= 0
                      ? 'Finish any daily today and it begins'
                      : (playedToday ? 'Today is in. Back tomorrow to extend it.' : 'Finish any daily today to keep it')}
                  </div>
                </div>
              </div>
              <div className="hrb-body">
                {rival ? (
                  <Link href={duelHref} className="hr-fcard t0">
                    <span className="hr-fctxt">
                      <span className="hr-fceye">{rival.behind ? 'Right behind you' : 'Next one ahead'}</span>
                      <span className="hr-fcnm">{rival.username}</span>
                      <span className="hr-fcsub">
                        {rival.rank ? \`#\${rival.rank} today\` : 'On the board today'}
                        {gapLine ? <span className="hr-fcdot">&middot;</span> : null}
                        {gapLine || null}
                      </span>
                    </span>
                    <span className="hr-fcgo">Duel</span>
                  </Link>
                ) : (
                  <Link href="/duel/new" className="hr-fcard t0">
                    <span className="hr-fctxt">
                      <span className="hr-fceye">Head to head</span>
                      <span className="hr-fcnm">Start a duel</span>
                      <span className="hr-fcsub">Pick anyone and a quiz, one round each</span>
                    </span>
                    <span className="hr-fcgo">Open</span>
                  </Link>
                )}
              </div>
              <div className="hr-foot">
                <span className="hr-exp" style={{ opacity: 0 }} aria-hidden="true">&middot;</span>
                <Link href="/quizzes/hub?tab=player" className="hr-link">Your stat hub &rarr;</Link>
              </div>
            </div>
          ) : null}
        </section>
      </>
    );
  }

`;
  s = sub(s, `  if (side === 'left') {`, BOARD + `  if (side === 'left') {`, 'HR:branch');
  writeFileSync(join(OUT, 'HomeRails.jsx'), s);
}

/* ══════════════════════════════════════════════════════════════════════════
   2. DailyStrip.jsx  ·  layout="catboard"
   NOT layout="tiles": that string is already the default and means the legacy
   tile-card grid, so reusing it would repurpose the default for every caller.
   ══════════════════════════════════════════════════════════════════════════ */
{
  let s = readFileSync(join(IN, 'DailyStrip.jsx'), 'utf8');

  // (a) The flag. `slate` is left exactly as it was so every existing branch
  //     is byte-identical; `cats` is a second, independent mode.
  s = sub(s,
    `  const slate = layout === 'slate';`,
    `  // The category-tile board (home v3). Deliberately NOT the string 'tiles',
  // which is already this component's DEFAULT layout and means the legacy
  // tile-card grid: reusing it would silently change every caller that omits
  // the prop.
  //
  // catboard IMPLIES slate, and that is the whole trick. The category board is
  // not a third layout, it is the slate with a desktop-only override layer on
  // top: the slate's own markup, effects, fit measurement and phone styling all
  // still run, and above 901px CSS hides the rows and the four-card cap and
  // shows the tiles and the two-card cap instead. Both renders sit in the DOM
  // at once, which is the same approach the home rails already use for their
  // phone hero, and it means the phone is byte-identical to today and there is
  // no viewport branch in the markup to desynchronise SSR from hydration.
  const cats = layout === 'catboard';
  const slate = layout === 'slate' || cats;`,
    'DS:flag');

  // (b) Carry a root class so every new rule can be scoped.
  s = sub(s,
    `    <div className={'dhome' + (selGame ? ' open' : '') + (slate ? ' slate' : '')}>`,
    `    <div className={'dhome' + (selGame ? ' open' : '') + (slate ? ' slate' : '') + (cats ? ' cats' : '')}>`,
    'DS:root-class');

  // (c) The tile-board row window, translate shift and pager are gated on
  //     !slate, so without this they would arm on the catboard and clip it to
  //     a 30-tile window with a floating chevron.
  s = sub(s, `!slate && metrics`, `!slate && !cats && metrics`, 'DS:metrics-gates', 4);

  // (d) Two rules blank the cap and board for a non-slate layout with a panel
  //     open, between 901 and 980px. The catboard must be excluded.
  s = sub(s, `.dhome.open:not(.slate) .dh-sbar{display:none;}`,
    `.dhome.open:not(.slate):not(.cats) .dh-sbar{display:none;}`, 'DS:980-cap');
  s = sub(s, `.dhome.open:not(.slate) .dh-boardwrap{display:none;}`,
    `.dhome.open:not(.slate):not(.cats) .dh-boardwrap{display:none;}`, 'DS:980-board');

  // (e) The board render fork.
  s = sub(s,
    `            {slate ? renderSlate(slateList, false) : renderTiles(list, false)}`,
    `            {cats ? renderCatBoard() : null}
            {slate ? renderSlate(slateList, false) : renderTiles(list, false)}`,
    'DS:board-fork');

  // (f) The cap fork. The existing four-card cap is untouched; the catboard
  //     renders its own two-across cap instead.
  s = sub(s,
    `      <div className="dh-sbar">
        <div className="dh-cell up">`,
    `      <div className="dh-sbar">
        {cats ? renderCatCap() : null}
        <div className="dh-cell up">`,
    'DS:cap-fork');

  // (g) renderCatCap + renderCatBoard, inserted just before the render fork's
  //     owning return by hanging them off renderSlate's definition site.
  const RENDERERS = `  /* ── HOME v3: the category board ──────────────────────────────────────
     Two things replace the slate at layout="catboard": a cap of TWO cards
     across instead of four, and nine category tiles instead of 63 rows.
     Clicking a tile sets the SAME \`filter\` state the slate's chip strip
     drives, so the games list below is the existing filter machinery rather
     than a second source of truth. Everything here reads values the component
     already computes (nextGame, easiest, capState, capLead, games, slateCats,
     done, inprog, isFail, playsOf); no new state, no new data. */
  const catOf = (c) => games.filter((g) => g.cat === c);
  const renderCatCap = () => {
    // Up next always leads. The second card is whatever is most worth acting
    // on: a paused board if there is one, else the easiest leaderboard. The
    // two picks that lose their card move to the "Also today" line, so nothing
    // is dropped, it just stops competing for the eye.
    const second = capState.length
      ? { kind: capState[0].kind, game: capState[0].game }
      : (easiest ? { kind: 'easy', game: easiest.game } : null);
    const alsoRaw = [
      (capState.length && easiest) ? { lbl: 'Easiest board', g: easiest.game } : null,
      (capLead && capLead.length) ? { lbl: CAP_LEAD_LABEL[capLead[0].kind], g: capLead[0].game } : null,
    ].filter(Boolean);
    const paused = second && second.kind === 'prog';
    const failed = second && second.kind === 'fail';
    return (
      <>
        <div className="cb-cap">
          {nextGame ? (
            <a href={nextGame.href} className="cb-card up">
              <span className="cb-ct">
                <span className="cb-ce">Up next</span>
                <span className="cb-cn">{nextGame.name}</span>
                <span className="cb-cs">{nextGame.tag}{playsNote(nextPlays)}</span>
              </span>
              <span className="cb-cb"><Play size={11} fill="currentColor" strokeWidth={0} />Play</span>
            </a>
          ) : (
            <span className="cb-card up">
              <span className="cb-ct">
                <span className="cb-ce">Clean sweep</span>
                <span className="cb-cn">All {GAMES.length} done</span>
                <span className="cb-cs">A fresh slate lands at midnight</span>
              </span>
            </span>
          )}
          {second ? (
            <a href={second.game.href} className={'cb-card ' + (paused ? 'prog' : failed ? 'fail' : 'easy')}>
              <span className="cb-ct">
                <span className="cb-ce">{paused ? 'Paused' : failed ? 'Unfinished' : 'Easiest leaderboard'}</span>
                <span className="cb-cn">{second.game.name}</span>
                <span className="cb-cs">{second.game.tag}</span>
              </span>
              <span className="cb-cb"><Play size={11} fill="currentColor" strokeWidth={0} />{paused ? 'Resume' : 'Play'}</span>
            </a>
          ) : null}
        </div>
        {alsoRaw.length ? (
          <div className="cb-also">
            <span className="cb-al">Also today</span>
            {alsoRaw.map((a, i) => (
              <a key={a.g.key} href={a.g.href} className="cb-ali">
                {i ? <i className="cb-adot" aria-hidden="true">&middot;</i> : null}
                <b>{a.g.name}</b><span>{a.lbl}</span>
              </a>
            ))}
          </div>
        ) : null}
      </>
    );
  };

  const renderCatBoard = () => {
    const openCat = slateCats.includes(filter) ? filter : null;
    const out = [];
    out.push(
      <div className="cb-tiles" key="cb-tiles">
        {slateCats.map((c) => {
          const list = catOf(c);
          const nD = list.filter((g) => done.has(g.key)).length;
          const nP = list.filter((g) => inprog.has(g.key) && !done.has(g.key)).length;
          const on = openCat === c;
          const label = CAT_SHORT[c] || c;
          return (
            <button
              type="button"
              key={c}
              className={'cb-tile' + (on ? ' on' : '')}
              style={{ '--cc': catCol(c) }}
              aria-expanded={on}
              onClick={() => setFilter(on ? 'all' : c)}
            >
              <span className="cb-trow">
                <span className="cb-sq">{label.slice(0, 1)}</span>
                <span className="cb-tnm">{label}</span>
                <span className="cb-tct">{list.length}</span>
              </span>
              <span className="cb-bar"><i style={{ width: (list.length ? Math.round((nD / list.length) * 100) : 0) + '%' }} /></span>
              <span className="cb-tmt">
                <span>{nD ? nD + ' played' : (nP ? nP + ' paused' : 'None played')}</span>
                <span className="cb-pk">{list.slice(0, 2).map((g) => g.name).join(', ')}{list.length > 2 ? '\\u2026' : ''}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
    if (openCat) {
      const list = catOf(openCat);
      const label = CAT_SHORT[openCat] || openCat;
      out.push(
        <button type="button" className="cb-hd" key="cb-hd" onClick={() => setFilter('all')}>
          {label} &middot; {list.length} game{list.length === 1 ? '' : 's'}
          <span>Collapse &#9650;</span>
        </button>
      );
      list.forEach((g) => {
        const isDone = done.has(g.key);
        const fail = isFail(g.key);
        const ip = inprog.has(g.key) && !isDone;
        out.push(
          <a href={g.href} className="cb-row" key={'cb-' + g.key} style={{ '--cc': catCol(g.cat) }}>
            <span className="cb-rsq">{(CAT_SHORT[g.cat] || g.cat).slice(0, 1)}</span>
            <span className="cb-rt">
              <b>{g.name}</b>
              <span>{g.tag}</span>
            </span>
            {fail ? <span className="cb-rs fail">Unfinished</span>
              : isDone ? <span className="cb-rs done">Done</span>
                : ip ? <span className="cb-rs prog">Resume</span>
                  : <span className="cb-rs go">Play &rarr;</span>}
          </a>
        );
      });
    }
    return out;
  };

`;
  s = sub(s, `  const renderSlate = (rows0, dim) => {`, RENDERERS + `  const renderSlate = (rows0, dim) => {`, 'DS:renderers');

  // (h) The stylesheet. Appended at the very end of the template literal so it
  //     wins on source order, and wrapped in min-width:901px so the phone is
  //     untouched. NO BACKTICKS anywhere in here, including in comments: this
  //     whole sheet is one template literal.
  const CSS = `
      /* ── HOME v3 category board (min-width:901px only) ───────────────────
         Everything is scoped to .dhome.cats, so the slate and the legacy tile
         board are untouched. Below 901px this block does not apply at all and
         the phone keeps the layout it ships with. */
      @media(min-width:901px){
        /* The override layer. The slate's own rows, bands, column header and
           chip strip are still in the DOM and still correct on a phone; up
           here they step aside for the tiles, and the four-card cap steps
           aside for the two-card one. */
        .dhome.cats .sl-row,.dhome.cats .sl-drawer,.dhome.cats .sl-band,.dhome.cats .sl-head,.dhome.cats .sl-filtw,.dhome.cats .sl-more{display:none !important;}
        .dhome.cats .dh-sbar > .dh-cell,.dhome.cats .dh-sbar > .dh-cprog{display:none !important;}
        .dhome.cats .dh-board{display:block;height:auto;max-height:none;overflow:visible;gap:0;background:transparent;}
        .dhome.cats .dh-boardwrap{height:auto;overflow:visible;}
        .dhome.cats .dh-sbar{display:block;padding:0;gap:0;background:transparent;border:none;}
        .cb-cap{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:12px;background:var(--surface-alt);}
        .cb-card{display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:8px;text-decoration:none;border-left:5px solid rgba(255,255,255,0.45);min-width:0;}
        .cb-card.up{background:var(--blue);color:var(--white);}
        .cb-card.easy{background:var(--blue-dark);color:var(--white);}
        .cb-card.prog{background:var(--gold);color:#3a2a05;border-left-color:#f7d98a;}
        .cb-card.fail{background:#b91c1c;color:var(--white);border-left-color:#f3a5a5;}
        .cb-ct{display:flex;flex-direction:column;min-width:0;}
        .cb-ce{font-size:9.5px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;opacity:.8;margin-bottom:5px;}
        .cb-cn{font-size:23px;font-weight:800;letter-spacing:-.015em;line-height:1.1;}
        .cb-cs{font-size:12.5px;font-weight:500;opacity:.85;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .cb-cb{margin-left:auto;flex:none;display:inline-flex;align-items:center;gap:6px;background:var(--white);color:var(--accent);border-radius:7px;padding:12px 22px;font-size:12px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;white-space:nowrap;}
        .cb-card.prog .cb-cb{color:#3a2a05;}
        .cb-also{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:11px 16px;background:var(--white);border-top:1px solid var(--border);font-size:13.5px;}
        .cb-al{font-size:9.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--slate);}
        .cb-ali{display:inline-flex;align-items:center;gap:7px;text-decoration:none;color:var(--muted);font-weight:600;}
        .cb-ali b{color:var(--ink);font-weight:800;}
        .cb-ali:hover b{color:var(--blue);}
        .cb-adot{font-style:normal;color:#c3c9d4;margin-right:2px;}
        .cb-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border-top:1px solid var(--border);}
        .cb-tile{display:flex;flex-direction:column;gap:8px;align-items:stretch;text-align:left;background:var(--white);border:none;border-radius:0;padding:14px 15px 12px;font:inherit;cursor:pointer;color:var(--ink);min-width:0;}
        .cb-tile:hover{background:var(--surface);}
        .cb-tile.on{background:var(--accent-soft);box-shadow:inset 0 0 0 2px var(--blue);}
        .cb-trow{display:flex;align-items:center;gap:10px;min-width:0;}
        .cb-sq{width:30px;height:30px;border-radius:7px;flex:none;display:flex;align-items:center;justify-content:center;background:var(--cc,var(--blue-dark));color:var(--white);font-size:13px;font-weight:800;}
        .cb-tnm{font-size:15px;font-weight:800;letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .cb-tct{margin-left:auto;flex:none;font-size:11px;font-weight:700;color:var(--slate);}
        .cb-bar{display:block;height:4px;border-radius:4px;background:var(--surface-alt);overflow:hidden;}
        .cb-bar i{display:block;height:100%;border-radius:4px;background:var(--cc,var(--blue-dark));}
        .cb-tmt{display:flex;justify-content:space-between;gap:8px;font-size:11.5px;font-weight:600;color:var(--muted);min-width:0;}
        .cb-pk{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--slate);}
        .cb-hd{display:flex;align-items:center;width:100%;border:none;border-top:1px solid var(--border);background:var(--surface-alt);color:#4a5468;font:inherit;font-size:10.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;padding:8px 14px;cursor:pointer;border-radius:0;text-align:left;}
        .cb-hd span{margin-left:auto;letter-spacing:.04em;color:var(--slate);}
        .cb-row{display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid var(--border);text-decoration:none;color:var(--ink);background:var(--white);}
        .cb-row:hover{background:var(--surface);}
        .cb-rsq{width:26px;height:26px;border-radius:6px;flex:none;display:flex;align-items:center;justify-content:center;background:var(--cc,var(--blue-dark));color:var(--white);font-size:11px;font-weight:800;}
        .cb-rt{display:flex;flex-direction:column;min-width:0;}
        .cb-rt b{font-size:14.5px;font-weight:800;}
        .cb-rt span{font-size:12px;color:var(--muted);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .cb-rs{margin-left:auto;flex:none;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;}
        .cb-rs.go{color:var(--blue);}
        .cb-rs.prog{color:#8a5300;}
        .cb-rs.done{color:var(--success-deep);}
        .cb-rs.fail{color:var(--danger);}
      }
      @media(min-width:901px) and (max-width:1200px){
        .cb-tiles{grid-template-columns:repeat(2,1fr);}
      }
      /* Below 901px the catboard does not exist: every rule above is desktop
         only, so without this its elements would render unstyled underneath a
         perfectly good phone slate. MOBILE IS UNTOUCHED, and this is the line
         that guarantees it. */
      @media(max-width:900px){
        .dhome.cats .cb-cap,.dhome.cats .cb-also,.dhome.cats .cb-tiles,.dhome.cats .cb-hd,.dhome.cats .cb-row{display:none !important;}
      }
`;
  // The sheet's closing marker. Appending before it keeps the block last.
  if (s.includes('.dhome.cats .dh-board{')) {
    SKIPPED += 1; // stylesheet already appended by an earlier run
  } else {
    const CLOSE = '\n      ` }} />';
    if (s.split(CLOSE).length - 1 < 1) throw new Error('ANCHOR DS:css-close not found');
    const at = s.lastIndexOf(CLOSE);
    s = s.slice(0, at) + '\n' + CSS + s.slice(at);
    CHANGES += 1;
  }
  writeFileSync(join(OUT, 'DailyStrip.jsx'), s);
}

/* ══════════════════════════════════════════════════════════════════════════
   3. QuizHomeClient.jsx  ·  variant="v3"
   Two columns instead of three, and the right rail pinned to the viewport.
   ══════════════════════════════════════════════════════════════════════════ */
{
  let s = readFileSync(join(IN, 'QuizHomeClient.jsx'), 'utf8');

  s = sub(s,
    `export default function QuizHomeClient() {`,
    `export default function QuizHomeClient({ variant = 'current' }) {
  // HOME v3, served at /home-preview only. Everything it changes is gated on
  // this one flag, so / renders byte-identically to before.
  const v3 = variant === 'v3';`,
    'QH:signature');

  // The pinned rail needs the height of whatever is sticky above it. Measured,
  // never hardcoded: the masthead's first row is the sticky part and its
  // height moves with the viewport.
  s = sub(s,
    `  const centerRef = useRef(null);
  const [railH, setRailH] = useState(null);`,
    `  const centerRef = useRef(null);
  const [railH, setRailH] = useState(null);
  // v3 only: publish the sticky masthead's height so the pinned rail can sit
  // directly under it and size itself to the rest of the viewport. Measured
  // rather than hardcoded, the same reasoning as --dh-fit on the slate board.
  useEffect(() => {
    if (!v3 || typeof window === 'undefined') return undefined;
    const set = () => {
      try {
        const el = document.querySelector('.qchm-r1') || document.querySelector('.qchm');
        const h = el ? Math.round(el.getBoundingClientRect().height) : 56;
        document.documentElement.style.setProperty('--v3top', (h + 12) + 'px');
      } catch (e) {}
    };
    set();
    const t = setTimeout(set, 500);
    window.addEventListener('resize', set);
    return () => { window.removeEventListener('resize', set); clearTimeout(t); };
  }, [v3]);`,
    'QH:v3top');

  // Sizing fix, kept as its OWN edit rather than folded into the insert above,
  // because the insert is skipped once it is on origin and a follow-up buried
  // inside it would then never apply.
  s = sub(s,
    `        document.documentElement.style.setProperty('--v3top', (h + 12) + 'px');`,
    `        document.documentElement.style.setProperty('--v3top', (h + 12) + 'px');
        // The rail STICKS at --v3top, but until the page is scrolled it SITS
        // lower than that, because the stat bar above it is not sticky. Sizing
        // it off the sticky offset therefore hangs it below the fold at scroll
        // zero by exactly that difference (measured: sticks at 67, sits at 133,
        // so 66px of it was under the fold and three of the four accordion
        // bands with it). Size it off where it actually STARTS instead. The
        // centre column is not sticky, so its document top is the row's true
        // top, and the rail can then only ever come up SHORT once stuck, which
        // is invisible, never long, which is the bug.
        const row = document.querySelector('.dhx-v3 .dhx-center');
        if (row) document.documentElement.style.setProperty('--v3nat', Math.round(row.getBoundingClientRect().top + window.scrollY) + 'px');`,
    'QH:v3nat');

  s = sub(s,
    `        <div className="dhx">`,
    `        <div className={v3 ? 'dhx dhx-v3' : 'dhx'}>`,
    'QH:dhx-class');

  s = sub(s,
    `            .qzh .dhx{display:grid;grid-template-columns:284px minmax(0,1fr) 300px;gap:10px;align-items:start;margin-bottom:12px;}`,
    `            .qzh .dhx{display:grid;grid-template-columns:284px minmax(0,1fr) 300px;gap:10px;align-items:start;margin-bottom:12px;}
            /* HOME v3: the left rail is gone, so two columns. Declared here,
               BEFORE the stacked and phone blocks further down, so those keep
               overriding it and mobile is untouched. The rail is pinned only
               above 1200px, which is the same threshold railH uses. */
            .qzh .dhx-v3{grid-template-columns:minmax(0,1fr) 340px;}
            @media(min-width:1201px){
              .qzh .dhx-v3 .dhx-right{position:sticky;top:var(--v3top,86px);height:calc(100vh - var(--v3top,86px) - 16px);align-self:start;overflow:hidden;}
              .qzh .dhx-v3 .dhx-right > .hr-panel{flex:1 1 auto;min-height:0;}
            }`,
    'QH:dhx-css');

  // Same reasoning as QH:v3nat: a follow-up to an insert has to be its own
  // edit, or it is skipped along with the insert once that is on origin.
  s = sub(s,
    `height:calc(100vh - var(--v3top,86px) - 16px);align-self:start;`,
    `height:calc(100vh - var(--v3nat,140px) - 16px);align-self:start;`,
    'QH:railheight');

  s = sub(s,
    `          <div className="dhx-rail dhx-left" style={{ height: railH || undefined }}>`,
    `          {v3 ? null : (
          <div className="dhx-rail dhx-left" style={{ height: railH || undefined }}>`,
    'QH:left-open');

  s = sub(s,
    `              onCredit={() => { setCreditQr(false); setCreditOpen(true); }}
            />
          </div>
          <div className="dhx-center" ref={centerRef}>
            <DailyStrip board={dailyBoard} layout="slate" />
          </div>
          <div className="dhx-rail dhx-right" style={{ height: railH || undefined }}>
            <HomeRails
              side="right"`,
    `              onCredit={() => { setCreditQr(false); setCreditOpen(true); }}
            />
          </div>
          )}
          <div className="dhx-center" ref={centerRef}>
            <DailyStrip board={dailyBoard} layout={v3 ? 'catboard' : 'slate'} />
          </div>
          <div className="dhx-rail dhx-right" style={{ height: v3 ? undefined : (railH || undefined) }}>
            <HomeRails
              side={v3 ? 'board' : 'right'}
              refData={refData}
              xp30={xp30}
              xpAll={xpAll}
              onCredit={() => { setCreditQr(false); setCreditOpen(true); }}`,
    'QH:cols');

  writeFileSync(join(OUT, 'QuizHomeClient.jsx'), s);
}

/* ══════════════════════════════════════════════════════════════════════════
   4. app/home-preview/page.js  ·  the route
   ══════════════════════════════════════════════════════════════════════════ */
writeFileSync(join(OUT, 'page.js'), `import QuizHomeClient from '../quizzes/QuizHomeClient';

/* HOME v3 PREVIEW. The decluttered homepage, rendered by the SAME client the
   real homepage uses, with variant="v3". It is a preview rather than a
   redesign in place so / cannot break while it is being judged: when it is
   approved, / switches to variant="v3" and this route is deleted.

   noindex, because it is a duplicate of the homepage and must never compete
   with it in search. */
export const metadata = {
  title: 'Home preview | Mind Loft',
  robots: { index: false, follow: false },
  alternates: { canonical: '/' },
};

export default function HomePreviewPage() {
  return <QuizHomeClient variant="v3" />;
}
`);
CHANGES += 1;

console.log('patch-home-v3: ' + CHANGES + ' anchored edits applied, ' + SKIPPED + ' already present');
