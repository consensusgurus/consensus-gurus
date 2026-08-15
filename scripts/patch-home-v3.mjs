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
let REGIONS = 0;

/* Replace everything from startMark up to endMark with body. When startMark is
 * absent the block has never been applied, so body is INSERTED before endMark
 * instead. endMark is never consumed. This is what lets the three big blocks
 * (the rail, the category board, the stylesheet) be redesigned by editing this
 * file and re-running it against an origin that already carries an older
 * version of them. */
function region(src, startMark, endMark, body, label) {
  const j0 = src.indexOf(endMark);
  if (j0 === -1) throw new Error(`REGION ${label}: end marker missing`);
  const i = src.indexOf(startMark);
  REGIONS += 1;
  if (i === -1) return src.slice(0, j0) + body + src.slice(j0);
  const j = src.indexOf(endMark, i);
  if (j === -1) throw new Error(`REGION ${label}: end marker missing after start`);
  return src.slice(0, i) + body + src.slice(j);
}
/* Remove text if it is there, no-op if it is not. Needed when this file STOPS
 * making an edit it used to make: the sub() that added it is gone, so nothing
 * would ever take it back off an origin that already carries it. */
function drop(src, text, label) {
  if (!src.includes(text)) return src;
  CHANGES += 1;
  return src.split(text).join('');
}

/* Exact-once replacement, and IDEMPOTENT: once this patch is on origin the
 * script has to be re-runnable to ship a follow-up fix, so an anchor whose
 * replacement is ALREADY present is skipped rather than treated as missing.
 * Anything else still throws, which is what stops a half-applied patch. */
function sub(src, find, repl, label, count = 1, mark = null) {
  // `mark` is an ALREADY-APPLIED fingerprint, for an insert whose body this
  // file later edits: once the body changes, `repl` stops matching what is on
  // origin and the insert fires a SECOND time. Give such an insert a mark that
  // does not move (a declaration name, not its value) and ship the body change
  // as its own sub(). Dropping this parameter while a call site still passes it
  // silently reintroduces the duplicate, which is exactly what happened.
  if (mark && src.includes(mark)) { SKIPPED += 1; return src; }
  // ALREADY-APPLIED IS TESTED SECOND, and before the count. Several of these edits
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
    'HR:state', 1, `  const [bTab, setBTab] = useState(`);

  // Community leads the sub-sorts, so it is also the one that opens.
  s = sub(s,
    `  const [bSec, setBSec] = useState('today');`,
    `  const [bSec, setBSec] = useState('comm');`,
    'HR:sec-default');

  // (b) The two side-gated effects have to fire for the board too, or the
  //     Contest face and the You tab come up empty.
  s = sub(s,
    `  useEffect(() => { if (side === 'left') setContestLive(contestIsLive()); }, [side]);`,
    `  useEffect(() => { if (side === 'left' || side === 'board') setContestLive(contestIsLive()); }, [side]);`,
    'HR:contest-gate');
  s = sub(s,
    `  refData,
  dailyBoard,`,
    `  refData,
  dailyBoard,
  me,
  myCats = [],`,
    'HR:props');

  s = sub(s,
    `    if (side !== 'right') return undefined;`,
    `    if (side !== 'right' && side !== 'board') return undefined;`,
    'HR:day-gate');

  // (c) The branch itself, inserted after CSS is defined and before the two
  //     existing returns.
  const BOARD = `  if (side === 'board') {
    /* THE LOFT (home v3). One pinned panel replacing both rails: the left
       rail's three-face leaderboard and its Category leaders, plus the right
       rail's live feed and streak, all in one place.

       TWO LEVELS OF TABS, not an accordion. The accordion this replaced put the
       other boards as bands at the FOOT of the open one, so the thing you
       wanted was always below the thing you did not (owner, 2026-08-15). The
       sub-sorts now sit directly under Leaderboard / Live / You, where they
       read as what they are: another way to slice the same board. Exactly one
       pane is mounted, so the panel's height is the height of ONE board and
       nothing stacks, which is what keeps it inside a single screen.

       COMMUNITY LEADS, because it is the board with something at stake on it:
       it carries the contest while one is running and falls back to referrals
       otherwise (owner, 2026-08-15).

       No new data. communityRows, dailyRows, catLeaders, xp30 and xpAll are all
       already computed above for the left rail, and Live and You reuse the
       right rail's own feed, streak and rival. */
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
    const TABS = [['lb', 'Leaderboard'], ['live', 'Live'], ['you', 'You']];
    const SUBS = [['comm', showContest ? 'Contest' : 'Community'], ['today', 'Today'],
      ['cats', 'Category'], ['m30', '30 days'], ['all', 'All time']];
    const sec = SUBS.some((x) => x[0] === bSec) ? bSec : 'comm';
    return (
      <>
        {CSS}
        <style>{\`
          /* Scoped to .hr-board and placed AFTER the shared sheet on purpose:
             the max-width:1200px block in CSS flattens .hr-flex to flex:none,
             so anything that has to stretch must be declared later. Pinning is
             min-width:1201px only, the same threshold the parent uses to pin a
             rail at all, so 901-1200 and mobile keep their stacked flow.

             EVERY CONTROL IN HERE IS A RECTANGLE. globals.css rounds every
             button on the site to 8px, so a tab strip built out of buttons
             arrives with rounded corners unless it says otherwise, which is
             what it looked like and what the owner objected to. */
          .hr-board{display:flex;flex-direction:column;min-height:0;}
          .hrb-tabs{display:flex;flex:none;background:#0e2a63;}
          .hrb-tabs button{flex:1;border:none;border-radius:0;background:transparent;color:#a3bce8;font:inherit;font-size:10.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:11px 4px;cursor:pointer;border-bottom:3px solid transparent;}
          .hrb-tabs button.on{color:var(--white);border-bottom-color:var(--white);background:var(--accent);}
          /* ALL FIVE ON ONE LINE. They used to wrap 3 and 2, and the owner read
             the strip as three sub-sorts and asked where All time had gone: a
             wrapped second row does not look like more of the same control, it
             looks like a different one. Tightened until five fit (9px, .03em,
             2px side padding), which they do inside 340px with room over. */
          .hrb-subs{display:flex;flex-wrap:nowrap;flex:none;background:#eef2f8;border-bottom:1px solid var(--border);}
          .hrb-subs button{flex:1 1 auto;min-width:0;border:none;border-radius:0;background:transparent;color:#5b6478;font:inherit;font-size:9px;font-weight:800;letter-spacing:.03em;text-transform:uppercase;padding:9px 2px;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
          .hrb-subs button:hover{color:var(--ink);}
          .hrb-subs button.on{color:var(--blue-dark);border-bottom-color:var(--blue);background:var(--white);}
          .hrb-pane{display:flex;flex-direction:column;min-height:0;}
          .hrb-body{min-height:0;overflow-y:auto;}
          /* YOU IS A REAL PANEL NOW (owner, 2026-08-15: it needs more content,
             your ranking and stats across categories). Streak, three headline
             figures, then where you rank inside every category you have played,
             then the duel. The category list is the part that scrolls, so the
             panel fills its height whatever the player's history looks like. */
          .hrb-stats{display:flex;flex:none;border-bottom:1px solid var(--border);}
          .hrb-stats span{flex:1;display:flex;flex-direction:column;gap:1px;padding:9px 11px;border-right:1px solid var(--border);min-width:0;}
          .hrb-stats span:last-child{border-right:none;}
          .hrb-stats i{font-style:normal;font-size:8.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--slate);}
          .hrb-stats b{font-size:16px;font-weight:800;letter-spacing:-.01em;}
          .hrb-stats em{font-style:normal;font-size:9.5px;font-weight:700;color:var(--slate);}
          .hrb-clab{padding:8px 13px 6px;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--slate);background:#f5f7fa;border-bottom:1px solid var(--border);position:sticky;top:0;z-index:1;}
          .hrb-duel{flex:none;}
          @media(min-width:1201px){
            .hrb-you .hrb-body{flex:1 1 auto;}
          }
          @media(min-width:1201px){
            .hr-board{flex:1 1 auto;}
            .hrb-pane{flex:1 1 auto;}
            .hrb-pane .hrb-body{flex:1 1 auto;}
          }
        \`}</style>
        <section className="hr-panel hr-board">
          <div className="hr-ph">
            <span className="hr-pi"><CrownIcon /></span>
            <h2>The Loft</h2>
            <span className="hr-chip">TODAY</span>
          </div>
          <div className="hrb-tabs" role="tablist">
            {TABS.map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={bTab === k}
                className={bTab === k ? 'on' : undefined} onClick={() => setBTab(k)}>{label}</button>
            ))}
          </div>

          {bTab === 'lb' ? (
            <>
              <div className="hrb-subs" role="tablist">
                {SUBS.map(([k, label]) => (
                  <button key={k} type="button" role="tab" aria-selected={sec === k}
                    className={sec === k ? 'on' : undefined} onClick={() => setBSec(k)}>{label}</button>
                ))}
              </div>
              <div className="hrb-pane">
                {sec === 'comm' ? bRows(
                  communityRows,
                  showContest ? ((v) => formatScore(v)) : ((v) => '+' + num(v)),
                  showContest ? 'score' : 'brought in',
                  showContest ? 'Contest leader' : 'Top community member',
                  showContest ? COPY.prizeLine : 'New players brought in, last 90 days',
                  showContest ? '/quizzes/contest' : '/quizzes/community',
                  showContest ? 'Board and rules' : 'Full leaderboard') : null}
                {sec === 'today' ? bRows(dailyRows, (v) => v, 'points', "Today's leader", 'Combined daily games score', '/quizzes/hub?tab=daily', 'Full daily board') : null}
                {sec === 'm30' ? bRows(xp30, num, 'IQ pts', 'Top of the month', 'IQ points earned in 30 days', '/quizzes/hub?tab=player', 'Monthly board') : null}
                {sec === 'all' ? bRows(xpAll.length ? xpAll : xp30, num, 'IQ pts', 'Top player, all time', 'Lifetime IQ points', '/quizzes/hub?tab=player', 'All time board') : null}
                {sec === 'cats' ? (
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
                ) : null}
              </div>
            </>
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
                  const pct = Math.round((f.total ? f.score / f.total : 0) * 100);
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
                          {typeof f.pct === 'number' ? ' \\u00b7 beat ' + f.pct + '%' : ''}{f.when ? ' \\u00b7 ' + f.when : ''}
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
            <div className="hrb-pane hrb-you">
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
              {me && me.found ? (
                <div className="hrb-stats">
                  {/* These are the fields me.activity actually carries
                      (correct, played, completed, accuracy) and the rank the
                      player bar itself reads. There is no activity.xp, so an IQ
                      figure here would have rendered a confident zero. */}
                  <span><i>Rank</i><b>{((me.ranks && me.ranks.xp) || me.rank) ? '#' + num((me.ranks && me.ranks.xp) || me.rank) : '—'}</b>{me.totalPlayers ? <em>of {num(me.totalPlayers)}</em> : null}</span>
                  <span><i>Played</i><b>{num((me.activity && me.activity.played) || 0)}</b></span>
                  <span><i>Completed</i><b>{num((me.activity && me.activity.completed) || 0)}</b></span>
                </div>
              ) : null}
              {myCats.length ? (
                <div className="hr-scroll hrb-body">
                  <div className="hrb-clab">Your rank by category</div>
                  {myCats.map((c) => (
                    <div key={c.key} className="hr-cl" style={{ '--clr': catBlue(c.key) }}>
                      <span className="hr-cltxt">
                        <span className="hr-clcat">{c.name}</span>
                        <span className="hr-clnm">{c.rank ? '#' + num(c.rank) + (c.total ? ' of ' + num(c.total) : '') : 'Unranked'}</span>
                      </span>
                      <span className="hr-clr">
                        <span className="hr-clg">{num(c.completed)} done</span>
                        <span className="hr-clv">{num(c.matches)}<i>played</i></span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className={myCats.length ? 'hrb-duel' : 'hrb-body'}>
                {rival ? (
                  <Link href={duelHref} className="hr-fcard t0">
                    <span className="hr-fctxt">
                      <span className="hr-fceye">{rival.behind ? 'Right behind you' : 'Next one ahead'}</span>
                      <span className="hr-fcnm">{rival.username}</span>
                      <span className="hr-fcsub">
                        {rival.rank ? '#' + rival.rank + ' today' : 'On the board today'}
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
  s = region(s, `  if (side === 'board') {`, `  if (side === 'left') {`, BOARD, 'HR:branch');
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
  // The Daily/Quizzes switch is gone, so its state has to come back off any
  // origin that already carries it.
  s = drop(s, `
  const [catKind, setCatKind] = useState('daily');`, 'DS:catkind-drop');

  s = sub(s,
    `export default function DailyStrip({ board = null, layout = 'tiles' }) {`,
    `export default function DailyStrip({ board = null, layout = 'tiles', quizCats = [] }) {`,
    'DS:signature');

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

  // Marks the board while a category is open, so the tiles only stretch to fill
  // the screen when they ARE the board and not when a games list is under them.
  s = sub(s,
    `            className={'dh-board' + (showAll ? '' : ' mcut') + (slate ? ' slate' : '') + (slate && myGamesOn ? ' pins' : '')}`,
    `            className={'dh-board' + (showAll ? '' : ' mcut') + (slate ? ' slate' : '') + (slate && myGamesOn ? ' pins' : '') + (cats && slateCats.includes(filter) ? ' cb-open' : '')}`,
    'DS:board-open');

  // Category glyphs. lucide is already a dependency and already imported here,
  // so this is nine more names on the existing import rather than any new art.
  s = sub(s,
    `import { Crown, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Trophy, Play, Flame, ArrowRight, Users, X, BarChart3, Star } from 'lucide-react';`,
    `import { Crown, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Trophy, Play, Flame, ArrowRight, Users, X, BarChart3, Star, Type, Hash, Puzzle, HelpCircle, Globe2, Swords, Spade, Gamepad2 } from 'lucide-react';`,
    'DS:icons-import');

  s = sub(s,
    `import { catBlue } from '@/lib/home-blues';`,
    `import { catBlue, deptBlue } from '@/lib/home-blues';`,
    'DS:deptblue');

  // Arcade was the ONE category with no entry here, so catCol fell through to
  // grey and it was the only tile on the board not wearing the blue family.
  s = sub(s,
    `  'End Game': catBlue('end game'), Cards: catBlue('cards'),
};`,
    `  'End Game': catBlue('end game'), Cards: catBlue('cards'), Arcade: catBlue('arcade'),
};`,
    'DS:arcade-blue');

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
     Two things replace the slate at layout="catboard": a cap of picks, and
     nine category tiles instead of 63 rows. Everything reads values the
     component already computes; no new state, no new data. The one piece of
     state is \`filter\`, the SAME one the slate's chip strip drives, so the
     open category is not a second source of truth.

     THE BOARD HAS TWO MODES (owner, 2026-08-15):
       shut  cap of SIX picks, and the nine tiles own the rest of the screen.
       open  cap shrinks to THREE, the tiles step aside, and the chosen
             category takes the whole board.
     So the cap is the "what should I play" zone and it yields space the
     moment you have answered that question yourself by picking a category. */
  /* CIRCUITS (owner list, 2026-08-15). The cross-cut: a category says what a
     game IS, a circuit says what SKILL it exercises, so the two are different
     axes and a game can sit in one, both or neither. Six of the owner's
     twenty-one were dropped before this shipped because they only restated a
     top-level category and would have rendered as "Trivia: Trivia 7" (Trivia,
     End Games, Solitaire, Arcade, Crowd, Geography).

     CIRCUITS CROSS CATEGORIES ON PURPOSE. Babel is Word Building and a Classic
     Board Game, Blitz is Mental Math and Survival, Span is Spatial and the
     whole of Geography, Outrank is Ranking and Crowd. A tile therefore counts
     only ITS OWN members of a circuit, and opening one shows the circuit whole,
     across every category it reaches. Keyed by display name because that is how
     the list was given and how the roster reads. */
  const CIRCUITS = [
    ['Crosswords', ['Emcee', 'Crux', 'Shards', 'Glyph', 'Anon']],
    ['Word Building', ['Tuck', 'Lode', 'Babel']],
    ['Anagrams', ['Garble', 'Barter', 'Strata']],
    ['Word Ladders', ['Rung', 'Warmer']],
    ['Sorting', ['Links', 'Venn']],
    ['Sudoku', ['Suds', 'Quilt', 'Cages', 'Sando']],
    ['Mental Math', ['Blitz', 'Crunch', 'Cipher', 'Tally']],
    ['Spatial Puzzles', ['Carve', 'Plot', 'Parker', 'Paths', 'Chomp', 'Span']],
    ['Deduction', ['Alibi', 'Sworn', 'Hearsay', 'Stands', 'Docket', 'Suffice', 'Axiom']],
    ['Pencil Puzzles', ['Etch', 'Hedge', 'Jesters', 'Fib']],
    ['History', ['Dating', 'Extra', 'Redact']],
    ['Ranking', ['Listed', 'Bracket', 'Outrank']],
    ['Survival', ['Streak', 'Deep', 'Blitz']],
    ['Chess', ['Mate', 'Defend']],
    ['Classic Board Games', ['Check', 'Four', 'Turn', 'Chain', 'Babel']],
  ];
  const circuitsOf = (g) => CIRCUITS.filter(([, names]) => names.includes(g.name)).map(([n]) => n);
  const circuitGames = (name) => {
    const row = CIRCUITS.find(([n]) => n === name);
    if (!row) return [];
    return games.filter((g) => row[1].includes(g.name));
  };
  const openCircuit = String(filter || '').startsWith('circuit:') ? filter.slice(8) : null;

  const catOf = (c) => games.filter((g) => g.cat === c);
  const catOpen = slateCats.includes(filter) ? filter : null;
  const boardOpen = catOpen || openCircuit;

  /* The cap's candidates, best first, deduped. The first three are the old
     cap's own ranking and keep its wording: play, resume, retry. After those
     come the easiest leaderboard and the lead picks (familiar favorite, new to
     you, crowd favorite), and if the day is quiet enough that even those run
     out it fills from unplayed games in board order, so six slots are always
     six real suggestions rather than four and two holes. */
  const capPool = (() => {
    const out = []; const seen = new Set();
    const add = (kind, eb, g, btn, note) => {
      if (!g || seen.has(g.key)) return;
      seen.add(g.key); out.push({ kind, eb, g, btn, note });
    };
    if (nextGame) add('up', 'Up next', nextGame, 'Play', playsNote(nextPlays));
    /* AT MOST TWO STATE CARDS (owner, 2026-08-15: more of the original blue
       tiles up top, such as the easiest board). Paused and failed boards are
       unbounded, so a busy day filled five of the six slots with gold and red
       and the cap stopped suggesting anything: it just listed what you had left
       lying around. Two is enough to say you have unfinished business and it
       leaves four slots for picks that actually recommend something. */
    let stateN = 0;
    for (const c of capState) {
      if (stateN >= 2) break;
      stateN += 1;
      const paused = c.kind === 'prog';
      // FAILED, not "Unfinished" (owner, 2026-08-15): a paused board is also
      // unfinished, so the word said nothing that told the two apart. Failed is
      // the wording the old cap used for exactly this state and it is the one
      // the red already means.
      add(paused ? 'prog' : 'fail', paused ? 'Paused' : 'Failed', c.game,
        paused ? 'Resume' : 'Retry', paused ? playsNote(playsOf(c.game.key)) : '');
    }
    if (easiest) add('easy', 'Easiest leaderboard', easiest.game, 'Play', fieldNote(easiest.players));
    for (const c of (capLead || [])) add('lead', CAP_LEAD_LABEL[c.kind], c.game, 'Play', '');
    for (const g of games) {
      if (out.length >= 6) break;
      if (done.has(g.key) || inprog.has(g.key)) continue;
      add('lead', CAT_SHORT[g.cat] || g.cat, g, 'Play', playsNote(playsOf(g.key)));
    }
    return out;
  })();

  const renderCatCap = () => {
    const slots = capPool.slice(0, boardOpen ? 3 : 6);
    if (!slots.length) {
      return (
        <div className="cb-cap" style={{ gridTemplateColumns: '1fr' }}>
          <span className="cb-card up">
            <span className="cb-ct">
              <span className="cb-ce">Clean sweep</span>
              <span className="cb-cn">All {GAMES.length} done</span>
              <span className="cb-cs">A fresh slate lands at midnight</span>
            </span>
          </span>
        </div>
      );
    }
    return (
      <div className={'cb-cap' + (slots.length > 3 ? ' six' : '')}>
        {slots.map((sl) => (
          <a key={sl.g.key} href={sl.g.href} className={'cb-card ' + sl.kind} aria-label={sl.btn + ' ' + sl.g.name}>
            <span className="cb-ct">
              <span className="cb-ce">{sl.eb}</span>
              <span className="cb-cn">{sl.g.name}</span>
              <span className="cb-cs">{sl.g.tag}{sl.note}</span>
            </span>
            <span className="cb-cb"><Play size={11} fill="currentColor" strokeWidth={0} />{sl.btn}</span>
          </a>
        ))}
      </div>
    );
  };

  const renderCatBoard = () => {
    if (boardOpen) {
      const list = openCircuit ? circuitGames(openCircuit) : catOf(catOpen);
      const label = openCircuit || CAT_SHORT[catOpen] || catOpen;
      return (
        <div className="cb-open-wrap" key="cb-open">
          <button type="button" className="cb-hd" onClick={() => setFilter('all')}>
            <span className="cb-hsq" style={{ '--cc': openCircuit ? T.blue : catCol(catOpen) }}>
              {(() => { const G = openCircuit ? Puzzle : (CAT_GLYPH[catOpen] || Star); return <G size={15} strokeWidth={2.4} />; })()}
            </span>
            {label} &middot; {list.length} game{list.length === 1 ? '' : 's'}
            <span>All categories &#9650;</span>
          </button>
          <div className="cb-rows">
            {list.map((g) => {
              const isDone = done.has(g.key);
              const fl = isFail(g.key);
              const ip = inprog.has(g.key) && !isDone;
              return (
                <a href={g.href} className="cb-row" key={'cb-' + g.key}>
                  <img className="cb-rsq" src={blueTile(g.img)} alt="" aria-hidden="true" onError={tileFallback} />
                  <span className="cb-rt"><b>{g.name}</b><span>{openCircuit ? (CAT_SHORT[g.cat] || g.cat) + ' \u00b7 ' + g.tag : g.tag}</span></span>
                  {fl ? <span className="cb-rs fail">Retry</span>
                    : isDone ? <span className="cb-rs done">Done</span>
                      : ip ? <span className="cb-rs prog">Resume</span>
                        : <span className="cb-rs go">Play &rarr;</span>}
                </a>
              );
            })}
          </div>
        </div>
      );
    }
    /* ONE FLAT GRID OF SMALL TILES (owner, 2026-08-15). Nine big tiles could
       not be filled: whatever went inside them, a two-name peek, sixty-three
       icons, four circuit rows, was either too thin to justify the box or too
       busy to read, and every version left a hole. So the box stops being big.
       Categories and circuits sit together as 24 equal tiles carrying only what
       a tile needs to say: what it is, how many, how far in you are. Four
       across and six down is exactly 24, so the grid fills the board evenly and
       never scrolls until something is opened.

       NO QUIZ TAB here either. That was built on a misread: the ask was for
       subcategories WITHIN the daily categories, not the quiz catalogue hoisted
       onto the board. The quizCats prop is left plumbed but unrendered. */
    const tiles = slateCats.map((c) => {
      const list = catOf(c);
      return {
        k: 'cat:' + c, kind: 'cat', label: CAT_SHORT[c] || c, n: list.length,
        nDone: list.filter((g) => done.has(g.key)).length,
        nProg: list.filter((g) => inprog.has(g.key) && !done.has(g.key)).length,
        col: catCol(c), glyph: CAT_GLYPH[c] || Star, go: () => setFilter(c),
      };
    }).concat(CIRCUITS.map(([name]) => {
      const list = circuitGames(name);
      return {
        k: 'cir:' + name, kind: 'cir', label: name, n: list.length,
        nDone: list.filter((g) => done.has(g.key)).length,
        nProg: list.filter((g) => inprog.has(g.key) && !done.has(g.key)).length,
        col: T.blueDark, glyph: null, go: () => setFilter('circuit:' + name),
      };
    }));
    return (
      <div className="cb-tiles" key="cb-tiles">
        {tiles.map((t) => (
          <button type="button" key={t.k} className={'cb-tile ' + t.kind}
            style={{ '--cc': t.col }} onClick={t.go}>
            <span className="cb-trow">
              {t.glyph
                ? <span className="cb-sq">{(() => { const G = t.glyph; return <G size={16} strokeWidth={2.3} />; })()}</span>
                : <span className="cb-dot" aria-hidden="true" />}
              <span className="cb-tnm">{t.label}</span>
              <span className="cb-tct">{t.n}</span>
            </span>
            <span className="cb-bar"><i style={{ width: (t.n ? Math.round((t.nDone / t.n) * 100) : 0) + '%' }} /></span>
            <span className="cb-tmt">
              <span>{t.nDone ? t.nDone + ' of ' + t.n : (t.nProg ? t.nProg + ' paused' : 'None played')}</span>
            </span>
          </button>
        ))}
      </div>
    );
  };

`;  s = region(s, `  /* ── HOME v3: the category board`, `  const renderSlate = (rows0, dim) => {`, RENDERERS, 'DS:renderers');

  // (h) The stylesheet. Appended at the very end of the template literal so it
  //     wins on source order, and wrapped in min-width:901px so the phone is
  //     untouched. NO BACKTICKS anywhere in here, including in comments: this
  //     whole sheet is one template literal.
  const CSS = `
      /* ── HOME v3 category board (min-width:901px only) ───────────────────
         Everything is scoped to .dhome.cats, so the slate and the legacy tile
         board are untouched. Below 901px this block does not apply and the
         phone keeps the layout it ships with. NO BACKTICKS anywhere in here,
         comments included: the whole sheet is one template literal. */
      @media(min-width:901px){
        /* THE CONSOLE FILLS THE SCREEN (owner, 2026-08-15). It is a flex column
           pinned to the height its column hands it, the cap is fixed, and the
           board takes the rest and scrolls INSIDE itself, so opening a sixteen
           game category never grows the page. Same shape as the rail beside it,
           which is what makes the two columns end on one line. */
        .dhome.cats{display:flex;flex-direction:column;height:100%;min-height:0;}
        .dhome.cats .sl-bar{flex:none;}
        .dhome.cats .dh-sbar{flex:none;display:block;padding:0;gap:0;background:transparent;border:none;}
        /* THE WHOLE CHAIN HAS TO GROW, not just the ends. Between the board
           wrapper and the board sit .dh-vpwrap and .dh-vp, and .dh-vpwrap is a
           plain block at flex:0 0 auto, so it stopped the height dead and
           everything under it fell back to content size however many flex:1
           rules were on the board itself. Measured: wrapper 607, vpwrap 369.
           Every link in the chain is a growing flex column here. */
        .dhome.cats .dh-boardwrap{flex:1 1 auto;min-height:0;height:auto;overflow:hidden;display:flex;flex-direction:column;}
        .dhome.cats .dh-vpwrap,.dhome.cats .dh-vp{flex:1 1 auto;min-height:0;height:auto;display:flex;flex-direction:column;}
        /* LESS WHITE (owner, 2026-08-15: the face is still far too white). The
           board was a white sheet edge to edge with white tiles on it, which
           next to a navy header and a saturated cap read as glare rather than
           as paper. Everything steps one value down into the same blue family:
           the board ground goes blue-grey, the tiles a barely-tinted off-white,
           and the grid lines a blue-grey rather than neutral. White is kept for
           HOVER, so it now means "this one", which is what it should have been
           spending itself on all along. */
                .dhome.cats .dh-board{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;height:auto;max-height:none;overflow:hidden;gap:0;background:#e4ebf5;}
        /* Shut, the grid fits by construction and must not scroll. Open, the
           game list is as long as the category is and scrolling is the point. */
        .dhome.cats .dh-board.cb-open{overflow-y:auto;}
        /* The override layer: the slate's own rows, bands, column header and
           chip strip are still in the DOM and still correct on a phone; up here
           they step aside for the tiles, and the four-card cap for the three. */
        .dhome.cats .sl-row,.dhome.cats .sl-drawer,.dhome.cats .sl-band,.dhome.cats .sl-head,.dhome.cats .sl-filtw,.dhome.cats .sl-more{display:none !important;}
        .dhome.cats .dh-sbar > .dh-cell,.dhome.cats .dh-sbar > .dh-cprog{display:none !important;}

        /* THE CAP IS THE "WHAT SHOULD I PLAY" ZONE, six picks wide open and three
           once you have answered that yourself by choosing a category. Always
           three across, so six is two rows and the shrink is a row leaving
           rather than the cards resizing. */
        .cb-cap{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;padding:10px;background:#e4ebf5;}
        /* NO ART ON THE CAP CARDS, and none in the tiles either (owner,
           2026-08-15). Sixty-three little pictures on one board read as noise
           rather than detail, and the cards are the one place on the page that
           has to be legible at a glance. The cards keep their full size at six,
           tagline and all: the extra row is what pays for the space, not
           shrinking the cards. */
        .cb-card{display:flex;align-items:center;gap:10px;padding:12px 13px;border-radius:8px;text-decoration:none;border-left:5px solid rgba(255,255,255,0.45);min-width:0;}
        .cb-card.up{background:var(--blue);color:var(--white);}
        .cb-card.easy,.cb-card.lead{background:var(--blue-dark);color:var(--white);}
        .cb-card.prog{background:var(--gold);color:#3a2a05;border-left-color:#f7d98a;}
        .cb-card.fail{background:#b91c1c;color:var(--white);border-left-color:#f3a5a5;}
        .cb-ct{display:flex;flex-direction:column;min-width:0;}
        .cb-ce{font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;opacity:.82;margin-bottom:4px;}
        .cb-cn{font-size:20px;font-weight:800;letter-spacing:-.015em;line-height:1.1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .cb-cs{font-size:11.5px;font-weight:500;opacity:.85;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .cb-cb{margin-left:auto;flex:none;display:inline-flex;align-items:center;gap:5px;background:var(--white);color:var(--accent);border-radius:7px;padding:10px 14px;font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;white-space:nowrap;}
        .cb-card.prog .cb-cb{color:#3a2a05;}
        .cb-card.fail .cb-cb{color:#b91c1c;}
        .cb-also{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:10px 16px;background:#eef3fa;border-top:1px solid #d3ddec;font-size:13px;}
        .cb-al{font-size:9.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--slate);}
        .cb-ali{display:inline-flex;align-items:center;gap:7px;text-decoration:none;color:var(--muted);font-weight:600;}
        .cb-ali b{color:var(--ink);font-weight:800;}
        .cb-ali:hover b{color:var(--blue);}
        .cb-adot{font-style:normal;color:#c3c9d4;margin-right:2px;}

        /* BIGGER TILES (owner, 2026-08-15). They are the primary navigation on
           this page now, so they carry a 38px emblem, a 17px name and real
           breathing room rather than reading as a dense index. They also GROW
           into whatever height the board has spare, which is what fills the
           screen when no category is open. */
        /* 24 tiles, four across and six down, sharing the board's height
           exactly. grid-auto-rows:1fr is what makes them EVEN and what makes
           the board fit without scrolling: the rows divide whatever height
           there is rather than each taking its content height and spilling. */
        .cb-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:1fr;gap:1px;background:#d3ddec;border-top:1px solid #d3ddec;}
                .cb-tile{display:flex;flex-direction:column;justify-content:center;gap:7px;align-items:stretch;text-align:left;background:#f4f7fc;border:none;border-radius:0;padding:11px 13px;font:inherit;color:var(--ink);cursor:pointer;min-width:0;min-height:0;}
        /* A circuit is a cut ACROSS the categories, not one of them, so it
           reads one step quieter: a dot where a category has its glyph, and a
           lighter ground. Same size, because they are peers to browse by. */
        .cb-tile.cir{background:#eef3fa;}
        .cb-dot{width:9px;height:9px;border-radius:3px;flex:none;background:var(--cc,var(--blue-dark));margin:0 3px;}
        .cb-tile:hover{background:var(--white);}
        .cb-tile.on{background:var(--accent-soft);box-shadow:inset 0 0 0 2px var(--blue);}
        .cb-sq{width:26px;height:26px;border-radius:7px;flex:none;display:flex;align-items:center;justify-content:center;background:var(--cc,var(--blue-dark));color:var(--white);}
        .cb-sq svg{display:block;}
        .cb-tnm{font-size:13.5px;font-weight:800;letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .cb-tct{margin-left:auto;flex:none;font-size:11.5px;font-weight:800;color:var(--slate);}
        .cb-bar{display:block;height:4px;border-radius:4px;background:#dbe4f1;overflow:hidden;}
        .cb-bar i{display:block;height:100%;border-radius:5px;background:var(--cc,var(--blue-dark));}
        /* NO margin-top:auto here. With the game art gone the tile has three short
           rows and a tall box, and an auto top margin pinned this one to the
           floor and opened a 92px hole above it. Centred as a group instead,
           which is what justify-content on the tile was already asking for. */
        .cb-tmt{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:10.5px;font-weight:600;color:var(--muted);min-width:0;}
        .cb-gnm{font-size:11px;font-weight:700;color:var(--muted);line-height:1.15;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;}
        /* With no category open the nine tiles ARE the board, so they take the
           whole of it: three equal rows rather than a short block with a void
           of ground under it. */
        /* THE TILES GROW INTO THE BOARD. min-height:100% could never have done
           this: a percentage min-height resolves against a parent whose height
           property is auto, so it was ignored and the tiles sat in a short block
           with a void of ground underneath (owner, 2026-08-15: far too much dead
           space). As a flex child with a definite parent height it just works. */
        .dhome.cats .cb-tiles{flex:1 1 auto;grid-auto-rows:1fr;}
        /* Open: the category owns the whole board. The tiles are not shrunk,
           they are not rendered at all, which is what "takes over the full
           space" has to mean if the list is going to be worth opening. */
        .dhome.cats .cb-open-wrap{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;}
        .dhome.cats .cb-rows{flex:1 1 auto;min-height:0;overflow-y:auto;}
        .dhome.cats .cb-hd,.dhome.cats .cb-row{flex:none;}
        .cb-hsq{width:22px;height:22px;border-radius:6px;flex:none;display:flex;align-items:center;justify-content:center;background:var(--cc,var(--blue-dark));color:var(--white);margin-right:9px;}

        .cb-hd{display:flex;align-items:center;width:100%;flex:none;border:none;border-top:1px solid #d3ddec;background:#dde6f3;color:#4a5468;font:inherit;font-size:10.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;padding:9px 16px;cursor:pointer;border-radius:0;text-align:left;position:sticky;top:0;z-index:2;}
        .cb-hd span{margin-left:auto;letter-spacing:.04em;color:var(--slate);}
        .cb-row{display:flex;align-items:center;gap:13px;padding:13px 18px;border-bottom:1px solid #d3ddec;text-decoration:none;color:var(--ink);background:#f4f7fc;}
        .cb-row:hover{background:var(--white);}
        /* Rows carry the game's OWN art, already remapped onto the blue ramp by
           blueTile, so a row is identifiable at a glance without adding a
           tenth colour to the page. */
        .cb-rsq{width:30px;height:30px;border-radius:7px;flex:none;object-fit:contain;background:var(--surface-alt);}
        .cb-rt{display:flex;flex-direction:column;min-width:0;}
        .cb-rt b{font-size:15px;font-weight:800;}
        .cb-rt span{font-size:12px;color:var(--muted);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .cb-rs{margin-left:auto;flex:none;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;}
        .cb-rs.go{color:var(--blue);}
        .cb-rs.prog{color:#8a5300;}
        .cb-rs.done{color:var(--success-deep);}
        .cb-rs.fail{color:var(--danger);}
      }
      /* 901-1200px: the columns are NOT pinned at this width (railH is not set
         either), so the console goes back to natural height and scrolls with
         the page. Two tiles across, and a tighter cap. */
      @media(min-width:901px) and (max-width:1200px){
        .cb-cap{gap:8px;padding:8px;}
        .cb-card{padding:12px;}
        .cb-cn{font-size:17px;}
        .cb-cb{padding:9px 11px;}
        .cb-tiles{grid-template-columns:repeat(2,minmax(0,1fr));}
        .dhome.cats{height:auto;}
        .dhome.cats .dh-board{overflow:visible;}
        .dhome.cats .cb-tiles{flex:none;grid-auto-rows:auto;}
      }
      /* Below 901px the catboard does not exist: every rule above is desktop
         only, so without this its elements would render unstyled underneath a
         perfectly good phone slate. MOBILE IS UNTOUCHED, and this is the line
         that guarantees it. */
      @media(max-width:900px){
        .dhome.cats .cb-cap,.dhome.cats .cb-also,.dhome.cats .cb-tiles,.dhome.cats .cb-hd,.dhome.cats .cb-row{display:none !important;}
      }
`;
  s = region(s, '      /* ── HOME v3 category board', '\n      ` }} />', CSS, 'DS:css');
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

  // The You tab's content. me.byCategory already carries the player's rank and
  // completion WITHIN each category, which is exactly what was asked for, and
  // it is already fetched for the player bar, so this costs no request. Labels
  // come from this file's own DEPT_LABEL rather than being reinvented in the
  // rail.
  s = sub(s,
    `  const bestCat = useMemo(() => {`,
    `  const myCats = useMemo(() => {
    const bc = (me && me.byCategory) || {};
    return Object.keys(bc).map((k) => {
      const c = bc[k] || {};
      if (!(c.matches > 0)) return null;
      return {
        key: k,
        name: DEPT_LABEL[k] || k,
        rank: c.completedRank ?? c.rank ?? null,
        total: c.catTotal || 0,
        completed: c.completed || 0,
        matches: c.matches || 0,
      };
    }).filter(Boolean).sort((x, y) => (x.rank || 1e9) - (y.rank || 1e9));
  }, [me]);

  const bestCat = useMemo(() => {`,
    'QH:mycats');

  // The quiz half of the board. `cats` already holds every department with its
  // quizzes and counts, and me.playedIds the player's history, so the tiles get
  // a real count, a real progress figure and real titles for no extra request.
  s = sub(s,
    `  const byKey = useMemo(() => Object.fromEntries(cats.map((c) => [c.key, c])), [cats]);`,
    `  const byKey = useMemo(() => Object.fromEntries(cats.map((c) => [c.key, c])), [cats]);
  const quizCats = useMemo(() => {
    const seen = new Set((me && me.found && me.playedIds) || []);
    return cats.map((c) => ({
      key: c.key,
      label: c.label,
      count: c.count,
      played: c.quizzes.reduce((n, q) => n + (seen.has(q.id) ? 1 : 0), 0),
      top: c.quizzes.slice(0, 6).map((q) => ({ id: q.id, title: q.title || q.id, done: seen.has(q.id) })),
    }));
  }, [cats, me]);`,
    'QH:quizcats');

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

  const V3CSS = `            /* HOME v3: the left rail is gone, so two columns, and BOTH are pinned
               to the viewport so the page is exactly one screen (owner,
               2026-08-15: the slate must fill the whole screen). Each column is
               a flex box that hands its height to the one scrollable region
               inside it: the games list on the left, the open board on the
               right. Declared here, BEFORE the stacked and phone blocks further
               down, so those keep overriding it and mobile is untouched. Pinned
               above 1200px only, the same threshold railH uses. */
            .qzh .dhx-v3{grid-template-columns:minmax(0,1fr) 340px;}
            @media(min-width:1201px){
              .qzh .dhx-v3 .dhx-center,.qzh .dhx-v3 .dhx-right{height:calc(100vh - var(--v3nat,140px) - 16px);min-height:0;}
              .qzh .dhx-v3 .dhx-center{display:flex;flex-direction:column;}
              .qzh .dhx-v3 .dhx-center > *{flex:1 1 auto;min-height:0;}
              .qzh .dhx-v3 .dhx-right{position:sticky;top:var(--v3top,86px);align-self:start;overflow:hidden;}
              .qzh .dhx-v3 .dhx-right > .hr-panel{flex:1 1 auto;min-height:0;}
            }
`;
  s = region(s, `            /* HOME v3: the left rail is gone`, `            /* start, not stretch:`, V3CSS, 'QH:v3css');

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
    'QH:cols', 1, `              side={v3 ? 'board' : 'right'}`);

  // Its own edit, NOT folded into QH:cols. That one is an insert and is skipped
  // once it is on origin, so the prop went with it and the Quizzes tab shipped
  // reading zero. Fourth time this rule has bitten; the marker comment above
  // sub() is not decoration.
  s = sub(s,
    `            <DailyStrip board={dailyBoard} layout={v3 ? 'catboard' : 'slate'} />`,
    `            <DailyStrip board={dailyBoard} layout={v3 ? 'catboard' : 'slate'} quizCats={v3 ? quizCats : undefined} />`,
    'QH:quizcats-prop');

  // The You tab's data. Its own edit, not folded into QH:cols above, because
  // that one is an insert and is skipped once it is on origin.
  s = sub(s,
    `              side={v3 ? 'board' : 'right'}
              refData={refData}`,
    `              side={v3 ? 'board' : 'right'}
              refData={refData}
              me={me}
              myCats={myCats}`,
    'QH:me-props');

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

console.log(`patch-home-v3: ${CHANGES} anchored edits, ${SKIPPED} already present, ${REGIONS} regions rebuilt`);
