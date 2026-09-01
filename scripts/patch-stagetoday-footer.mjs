// Move the stage home's footer out into app/StageFooter.jsx, so the circuit
// pages and the home draw ONE footer rather than two copies of one.
//
// Anchored edits, every anchor asserted to match EXACTLY once: zero means
// origin moved, two means the edit would land twice. Reads the file handed to
// it on argv (a FETCH_HEAD blob, per the stale-base rule) and writes the result
// to argv[2].
import { readFileSync, writeFileSync } from 'node:fs';

const src = process.argv[2];
const out = process.argv[3];
if (!src || !out) { console.error('usage: patch-stagetoday-footer.mjs <in> <out>'); process.exit(1); }
let s = readFileSync(src, 'utf8');

const cut = (label, from, to, replace) => {
  const a = s.indexOf(from);
  if (a < 0) throw new Error(`${label}: start anchor not found`);
  if (s.indexOf(from, a + 1) >= 0) throw new Error(`${label}: start anchor matched twice`);
  const b = s.indexOf(to, a);
  if (b < 0) throw new Error(`${label}: end anchor not found`);
  if (s.indexOf(to, b + 1) >= 0) throw new Error(`${label}: end anchor matched twice`);
  s = s.slice(0, a) + replace + s.slice(b + to.length);
};

const swap = (label, from, to) => {
  const a = s.indexOf(from);
  if (a < 0) throw new Error(`${label}: anchor not found`);
  if (s.indexOf(from, a + 1) >= 0) throw new Error(`${label}: anchor matched twice`);
  s = s.slice(0, a) + to + s.slice(a + from.length);
};

// 1. The import. FOOTER_COLS moves with the drawing, so its comment goes too.
cut('import',
  '// ONE LINK MAP, NOT TWO.',
  "import { FOOTER_COLS } from '../Footer';",
  `// THE FOOTER IS SHARED (2026-08-31). It used to be drawn here, because this
// was the only stage surface that needed one; the circuit pages needed the
// same object, and two drawings of one footer is exactly the drift this file
// warns about elsewhere. app/StageFooter.jsx owns the drawing and imports
// FOOTER_COLS from app/Footer.jsx, so the site's link map is still the only
// copy of the links.
import StageFooter from '../StageFooter';`);

// 2. The markup.
cut('markup',
  '      {/* THE FOOTER, FULL BLEED (owner, 2026-08-31).',
  '      </footer>',
  `      {/* The visitor count rides the observer this page already runs for its
          topics, so the footer asks for nothing of its own here. */}
      <StageFooter visitors={visitors} />`);

// 3. The rules.
cut('css',
  '/* -- the footer, edge to edge -------------------------------------------- */',
  'font-family:${MONO};font-size:10px;letter-spacing:.06em;color:var(--stg-mute2);}\n\n',
  '');

// 4. The four footer lines inside the phone media query.
cut('css-phone',
  '  .sty-foot{padding:26px 14px 20px;}\n',
  '  .sty-fcol{flex:1 1 132px;}\n',
  '');

// Nothing that belonged to the footer may survive in this file.
// The name still appears in the replacement COMMENT, which is the point of the
// comment, so the check is for the two ways it can still be code.
for (const dead of ['sty-foot', 'sty-fin', 'sty-fbrand', 'sty-fcol', 'sty-fbase',
  'sty-fvis', 'sty-fabout', '{ FOOTER_COLS }', 'FOOTER_COLS.map']) {
  if (s.includes(dead)) throw new Error(`residue: ${dead} still present`);
}
// And the things the page still needs must not have gone with them.
for (const keep of ['StageFooter', 'visitors={visitors}', 'setVisitors', 'footRef']) {
  if (!s.includes(keep)) throw new Error(`lost: ${keep}`);
}

writeFileSync(out, s);
console.log(`ok  ${src} -> ${out}  (${s.split('\n').length} lines)`);
