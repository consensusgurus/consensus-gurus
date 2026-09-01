#!/usr/bin/env node
// Two changes to app/today/StageToday.jsx, applied as ANCHORED edits against a
// copy taken from the SAME fetch the deploy commit is built on (the stale-base
// rule). Every anchor must match EXACTLY ONCE: zero means origin moved, two
// means the anchor is too loose and the patch would land twice, and both throw.
//
//   1. AN UNFINISHED GAME SHOWS NO RANK (owner, 2026-09-01). A game the reader
//      started and left still files a row, and that row still scores, so
//      `me.perGame` carried it and the home printed "You: #12 of 30" on the
//      card and a ranked row in Your standing for a game they never finished.
//      One filter in the `standing` memo fixes all three surfaces, because the
//      card reads `standBy` off that same memo and the eyebrow counts it.
//
//   2. A SECTION FADES IN AS ITS DATA LANDS (owner, 2026-09-01: "it just
//      appears piecemeal"). Fade only, no skeletons, per the owner's choice.
//
// Usage: node scripts/patch-home-standing-and-reveal.mjs <file>
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('usage: patch-home-standing-and-reveal.mjs <StageToday.jsx>'); process.exit(1); }
let src = readFileSync(file, 'utf8');

let n = 0;
function edit(label, find, replace) {
  const parts = src.split(find);
  if (parts.length !== 2) {
    throw new Error(`anchor ${parts.length - 1} match(es) (need exactly 1): ${label}`);
  }
  src = parts[0] + replace + parts[1];
  n += 1;
}

// ── 1a. A flag saying day status has actually landed ────────────────────────
edit('statusIn state',
`  const [done, setDone] = useState(() => new Set());
  const [inprog, setInprog] = useState(() => new Set());`,
`  const [done, setDone] = useState(() => new Set());
  const [inprog, setInprog] = useState(() => new Set());
  // Whether daily-status has ANSWERED, which is a different question from
  // whether \`done\` has anything in it: an empty \`done\` means "nothing finished"
  // once the answer is in and "we do not know yet" before it. The unfinished
  // filter below has to tell those apart, or a guest would be told they
  // finished nothing for as long as that request is in flight.
  const [statusIn, setStatusIn] = useState(false);`);

edit('statusIn set',
`      setDone(d);
      setInprog(p);`,
`      setDone(d);
      setInprog(p);
      setStatusIn(true);`);

// ── 1b. The filter ─────────────────────────────────────────────────────────
edit('standing filter',
`      const g = DAILY_GAME_MAP[key];
      const r = pg[key];
      if (!g || !LIVE_KEYS.has(key) || !r || r.rank == null) continue;
      out.push({ ...r, key, g });
    }`,
`      const g = DAILY_GAME_MAP[key];
      const r = pg[key];
      if (!g || !LIVE_KEYS.has(key) || !r || r.rank == null) continue;
      // AN UNFINISHED GAME HAS NO STANDING (owner, 2026-09-01). An abandoned
      // row is a started-and-left run: it is filed, and it does score, so it
      // arrives here carrying a real rank. But "you came 12th" is not true of a
      // game the reader walked out of, and it read as one more finished game on
      // the card and in this table. Dropping it here fixes all three at once,
      // since the card reads standBy off this memo and the eyebrow counts it.
      //
      // THE TEST IS POSITIVE EVIDENCE OF A FINISH, not the absence of a flag,
      // and it takes two signals because neither one covers both readers.
      // \`abandoned\` travels on the row itself and is exact for a REGISTERED
      // player: a real finish supersedes an earlier abandon in combineDaily, so
      // the flag is true only when they never finished, and an explicit \`false\`
      // is a finish we can vouch for the moment the board lands. A GUEST's
      // perGame comes from guestProvisional, which carries rank and field and
      // nothing else, so the flag is undefined and the local \`done\` set is the
      // test instead — daily-status builds it from the same never-finished
      // definition and it crosses devices.
      //
      // Written this way round so no row can appear ranked and then vanish: an
      // undefined flag waits for the status rather than being read as a finish.
      if (!(r.abandoned === false || (statusIn && done.has(key)))) continue;
      out.push({ ...r, key, g });
    }`);

edit('standing deps',
`      || a.g.name.localeCompare(b.g.name));
    return out;
  }, [board]);`,
`      || a.g.name.localeCompare(b.g.name));
    return out;
  }, [board, done, statusIn]);`);

// ── 2. The arrival reveal ──────────────────────────────────────────────────
// A section whose data has not landed is not rendered, so it mounts at exactly
// the moment its payload arrives and a plain CSS animation on that element
// plays once, with no state and no effect to keep in step. Rows stagger off an
// --i index. Opacity and a 6px rise only: no height, no scale, so the board's
// ResizeObserver (which reads box size, not transforms) is untouched.
edit('reveal css',
`@media (prefers-reduced-motion:reduce){.sty-cav{transition:none;}}
\``,
`@media (prefers-reduced-motion:reduce){.sty-cav{transition:none;}}

/* ── A SECTION FADES IN AS ITS DATA LANDS (owner, 2026-09-01) ──
   The page is fed by four separate requests (day status, the combined board,
   totals, the feed) and every section they fill used to snap into place as its
   payload happened to arrive, which read as the page assembling itself in
   pieces. Each of those sections is rendered only once it has something to
   say, so it MOUNTS at the moment its data lands and this animation plays once
   off the mount: no state, no effect, nothing to keep in step with the fetch.
   Opacity and a 6px rise, never height or scale, so the ResizeObserver on the
   board (which watches box size, not transforms) reads one height throughout.
   NO APOSTROPHES anywhere in this stylesheet: it is a text child of a style
   element, so React escapes them. */
@keyframes sty-in{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
.sty-rev{animation:sty-in .34s cubic-bezier(.2,.7,.3,1) both;}
/* The rows of a table or a feed come in as a run rather than a block, capped
   so a long standing never keeps the reader waiting on its last row. */
.sty-revr{animation:sty-in .3s cubic-bezier(.2,.7,.3,1) both;
  animation-delay:calc(min(var(--i,0),9) * 26ms);}
@media (prefers-reduced-motion:reduce){
  .sty-rev,.sty-revr{animation:none;}
}
\``);

// The ladder, My games and Circuits: each mounts when day status (or the day
// itself) resolves.
edit('ladder reveal',
`        <section className="sty-day">`,
`        <section className="sty-day sty-rev">`);

edit('my games reveal',
`          <section className="sty-cat sty-mine" style={{ '--cc': 'var(--stg-ink2)' }}>`,
`          <section className="sty-cat sty-mine sty-rev" style={{ '--cc': 'var(--stg-ink2)' }}>`);

edit('circuits reveal',
`          <section className="sty-cat sty-circsec" style={{ '--cc': 'var(--stg-ink2)' }}>`,
`          <section className="sty-cat sty-circsec sty-rev" style={{ '--cc': 'var(--stg-ink2)' }}>`);

// The two tables and the feed panel.
edit('standing reveal',
`          <section id="sty-standing">`,
`          <section id="sty-standing" className="sty-rev">`);

edit('standing rows',
`                  {standing.map((r) => (
                    <tr key={r.key} style={{ '--cc': hueFor(r.g.cat) }}>`,
`                  {standing.map((r, i) => (
                    <tr key={r.key} className="sty-revr" style={{ '--cc': hueFor(r.g.cat), '--i': i }}>`);

edit('board reveal',
`          <section id="sty-board" ref={lbRef}>`,
`          <section id="sty-board" className="sty-rev" ref={lbRef}>`);

edit('board rows',
`                  <tr key={(r && r.userKey) || i} className={meKey && r.userKey === meKey ? 'me' : undefined}>`,
`                  <tr key={(r && r.userKey) || i} style={{ '--i': i }}
                    className={'sty-revr' + (meKey && r.userKey === meKey ? ' me' : '')}>`);

edit('feed rows',
`                  <a key={\`\${fp.quizId}-\${i}\`} className="sty-lrow" href={\`\${routeOf(fp.game)}?stage=1\${tq}\`}
                    style={{ '--cc': hueFor(fp.game.cat) }}>`,
`                  <a key={\`\${fp.quizId}-\${i}\`} className="sty-lrow sty-revr" href={\`\${routeOf(fp.game)}?stage=1\${tq}\`}
                    style={{ '--cc': hueFor(fp.game.cat), '--i': i }}>`);

edit('feed panel reveal',
`              <div className="sty-lstats">`,
`              <div className="sty-lstats sty-rev">`);

// The two per-card result lines, which swap in over a tagline or a blurb when
// the board (or a circuit board) answers. Both appear twice in the file — the
// circuit card is rendered once in My games and once in Circuits, and the game
// card is one component — so the circuit one is replaced globally.
edit('card result reveal',
`        <span className="sty-gres">`,
`        <span className="sty-gres sty-rev">`);

// The two are indented differently (one sits a level deeper inside My games),
// so the anchor carries no leading whitespace.
const circFind = `<div className="sty-cres">`;
const circHits = src.split(circFind).length - 1;
if (circHits !== 2) throw new Error(`circuit result anchor: ${circHits} match(es) (need exactly 2)`);
src = src.split(circFind).join(`<div className="sty-cres sty-rev">`);
n += 1;

writeFileSync(file, src);
console.log(`patched ${n} anchors -> ${file}`);
