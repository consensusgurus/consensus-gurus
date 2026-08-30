// THE HOME BORROW: Your Sunday, and the strip.
//
// The study was explicit that the home is NOT a stage. You arrive here to
// CHOOSE, not to sit, so the takeover does not carry: the header, the footer,
// the browse row and the jump bar all stay. Strip a browse surface of its exits
// and it becomes a page you cannot leave.
//
// What DOES carry is rule three, the ladder. Eighty games as one picture, one
// rung per daily on the roster, one block per category, lit for what you have
// played and half-lit for what you have paused. It is the same drawing the run
// uses and the same component.
//
// TWO DELIBERATE DIFFERENCES FROM THE STAGE:
//
//   1. IT FOLLOWS THE READER'S OWN SHELF ORDER, not the canonical ramp order.
//      That is allowed precisely here and nowhere else: this is a client
//      component reading localStorage, so there is no server render to
//      disagree with. A game PAGE cannot do this and must not try.
//   2. IT USES THE HOME'S OWN COLOURS (catColor / CAT_BLUE), not the category
//      ramp. Owner ruling, 2026-08-30: the two tables are independent systems
//      and the ramp is not required to reproduce this one. The home keeps its
//      bands; the stage keeps its ramp.
//
// THE STRIP SCROLLS RATHER THAN EXPANDS. On the run it expands the board in
// flow because the run has no board anywhere else. The home already carries the
// full leaderboard at its foot, so an expansion here would be the same table
// twice. It summarises and jumps.
import { readFileSync, writeFileSync } from 'node:fs';

const path = process.argv[2];
if (!path) throw new Error('usage: patch-home-day-ladder.mjs <TodayClient.jsx>');
let s = readFileSync(path, 'utf8');
let n = 0;
function edit(name, anchor, replacement) {
  const hits = typeof anchor === 'string'
    ? s.split(anchor).length - 1
    : (s.match(new RegExp(anchor.source, anchor.flags.includes('g') ? anchor.flags : anchor.flags + 'g')) || []).length;
  if (hits !== 1) throw new Error(`anchor "${name}" matched ${hits} times, expected exactly 1`);
  s = s.replace(anchor, replacement);
  n += 1;
}

edit('import', "import { catBlue } from '@/lib/home-blues';",
  "import { catBlue } from '@/lib/home-blues';\nimport StageLadder from '../StageLadder';");

edit('derive',
  "  const overall = board && Array.isArray(board.overall) ? board.overall : [];",
  "  const overall = board && Array.isArray(board.overall) ? board.overall : [];\n"
  + "\n"
  + "  // ── YOUR SUNDAY ────────────────────────────────────────────────────\n"
  + "  // Behind ?stage=1 while it is reviewed. The flag is read in an EFFECT and\n"
  + "  // never during render: the server has no query string to read, so deciding\n"
  + "  // it during render makes the first client paint disagree with the server's\n"
  + "  // and React throws. Same rule isSundayET and contestIsLive follow.\n"
  + "  const [dayOn, setDayOn] = useState(false);\n"
  + "  useEffect(() => {\n"
  + "    try { setDayOn(new URLSearchParams(window.location.search).get('stage') === '1'); } catch (e) {}\n"
  + "  }, []);\n"
  + "  const dayBlocks = useMemo(() => orderedShelves.map((sh) => ({\n"
  + "    n: sh.games.length,\n"
  + "    c: sh.color,\n"
  + "    on: sh.games.map((g) => done.has(g.key)),\n"
  + "    half: sh.games.map((g) => !done.has(g.key) && inprog.has(g.key)),\n"
  + "  })), [orderedShelves, done, inprog]);\n"
  + "  const dayPlayed = useMemo(() => orderedShelves.reduce((a, sh) => a + sh.games.filter((g) => done.has(g.key)).length, 0), [orderedShelves, done]);\n"
  + "  const dayPaused = useMemo(() => orderedShelves.reduce((a, sh) => a + sh.games.filter((g) => !done.has(g.key) && inprog.has(g.key)).length, 0), [orderedShelves, done, inprog]);\n"
  + "  const dayLeader = overall[0] || null;\n"
  + "  const dayMyRank = meKey ? overall.findIndex((r) => r && r.userKey === meKey) + 1 : 0;\n"
  + "  const dayOrd = (v) => v + (['th', 'st', 'nd', 'rd'][((v % 100) - 20) % 10] || ['th', 'st', 'nd', 'rd'][v % 100] || 'th');");

edit('render',
  "        ) : null}\n\n        {canPin && pinned.length ? (",
  "        ) : null}\n"
  + "\n"
  + "        {dayOn ? (\n"
  + "          <section className=\"tdy-row\" id=\"tdy-day\" style={{ scrollMarginTop: 112 }}>\n"
  + "            <div className=\"tdy-day\">\n"
  + "              <div className=\"tdy-dayhd\">\n"
  + "                <h2>Your day</h2>\n"
  + "                <span className=\"tdy-dayfig\">\n"
  + "                  <b>{dayPlayed}</b> played{dayPaused ? <> &middot; <b>{dayPaused}</b> paused</> : null} &middot; <b>{totalGames}</b> on the slate\n"
  + "                </span>\n"
  + "              </div>\n"
  + "              <StageLadder height={46} blocks={dayBlocks} />\n"
  + "              <div className=\"tdy-daykey\">\n"
  + "                {orderedShelves.map((sh) => (\n"
  + "                  <span key={sh.name}>\n"
  + "                    <i style={{ background: sh.color }} aria-hidden=\"true\" />\n"
  + "                    {sh.name} {sh.games.filter((g) => done.has(g.key)).length}/{sh.games.length}\n"
  + "                  </span>\n"
  + "                ))}\n"
  + "              </div>\n"
  + "            </div>\n"
  + "            {/* The strip SCROLLS rather than expands: the full board is already\n"
  + "                at the foot of this page, and an expansion here would be the\n"
  + "                same table twice. It needs a leader to be drawn at all. */}\n"
  + "            {dayLeader ? (\n"
  + "              <button\n"
  + "                type=\"button\"\n"
  + "                className=\"tdy-daystrip\"\n"
  + "                onClick={() => { const el = document.getElementById('tdy-boards'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}\n"
  + "              >\n"
  + "                <span className=\"e\">Today</span>\n"
  + "                <b>{dayLeader.username || 'Player'}</b>\n"
  + "                <s>{dayLeader.pts} pts</s>\n"
  + "                <span className=\"d\">&middot; {overall.length} {overall.length === 1 ? 'player' : 'players'}</span>\n"
  + "                <u>{dayMyRank ? `You ${dayOrd(dayMyRank)}` : 'Not on the board yet'} &rsaquo;</u>\n"
  + "              </button>\n"
  + "            ) : null}\n"
  + "          </section>\n"
  + "        ) : null}\n"
  + "\n"
  + "        {canPin && pinned.length ? (");

edit('css',
  /^const CSS = `$/m,
  "const CSS = `\n"
  + "/* YOUR DAY. Eighty games as one picture, in the reader's own shelf order. */\n"
  + ".tdy-day{background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.09);\n"
  + "  border-radius:14px;padding:16px 18px 14px;}\n"
  + ".tdy-dayhd{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin-bottom:13px;flex-wrap:wrap;}\n"
  + ".tdy-dayhd h2{margin:0;font-size:20px;font-weight:800;letter-spacing:-.02em;color:#e9edf4;}\n"
  + ".tdy-dayfig{font-family:'DM Mono',ui-monospace,monospace;font-size:11.5px;color:#8b95a8;}\n"
  + ".tdy-dayfig b{color:#e9edf4;font-weight:500;}\n"
  + ".tdy-daykey{display:flex;flex-wrap:wrap;gap:9px 15px;margin-top:12px;}\n"
  + ".tdy-daykey span{display:flex;align-items:center;gap:6px;font-family:'DM Mono',ui-monospace,monospace;\n"
  + "  font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#8b95a8;}\n"
  + ".tdy-daykey i{width:9px;height:9px;border-radius:2px;display:block;flex:none;}\n"
  + ".tdy-daystrip{display:flex;align-items:center;gap:10px;width:100%;text-align:left;cursor:pointer;\n"
  + "  margin-top:10px;padding:9px 14px;border-radius:10px;font-size:12.5px;color:#e9edf4;\n"
  + "  background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);}\n"
  + ".tdy-daystrip:hover{background:rgba(255,255,255,.06);}\n"
  + ".tdy-daystrip .e{font-family:'DM Mono',ui-monospace,monospace;font-size:9.5px;letter-spacing:.14em;\n"
  + "  text-transform:uppercase;color:#8b95a8;}\n"
  + ".tdy-daystrip b{font-weight:800;}\n"
  + ".tdy-daystrip s{text-decoration:none;font-family:'DM Mono',ui-monospace,monospace;font-size:11.5px;color:#aab5c7;}\n"
  + ".tdy-daystrip .d{color:#8b95a8;font-size:11.5px;}\n"
  + ".tdy-daystrip u{text-decoration:none;margin-left:auto;font-family:'DM Mono',ui-monospace,monospace;\n"
  + "  font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#7dd3fc;flex:none;}\n"
  + "@media(max-width:640px){\n"
  + "  .tdy-day{padding:13px 13px 12px;border-radius:12px;}\n"
  + "  .tdy-dayhd h2{font-size:17px;}\n"
  + "  .tdy-daystrip .d{display:none;}\n"
  + "}\n");

writeFileSync(path, s);
console.log(`patched ${n} edits`);
