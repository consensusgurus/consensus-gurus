// A colour written inside a TERNARY hides from a `color: COLORS.x` sweep, and
// the branch it hides in varies: Mate's status line hid in the TRUE branch,
// its Give-up link in the FALSE one. Match the whole colour VALUE instead.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const DARK = { ink: '--stg-ink', faded: '--stg-mute', accent: '--stg-acc', accentDeep: '--stg-acc', rust: '--stg-bad', slate: '--stg-ink2' };
const APPLY = process.argv[2] === '--apply';
let hits = 0, files = 0;
for (const d of readdirSync('app', { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  for (const f of readdirSync(join('app', d.name))) {
    if (!/^[A-Z][A-Za-z]*Client\.jsx$/.test(f)) continue;
    const p = join('app', d.name, f);
    const src = readFileSync(p, 'utf8');
    if (!/const STAGE = isStage\(/.test(src)) continue;
    let n = 0;
    const out = src.split('\n').map((l) => {
      // only a colour VALUE that is a ternary
      const m = l.match(/color: ([^,}]*\?[^,}]*)/);
      if (!m) return l;
      let val = m[1];
      if (/var\(--stg/.test(val)) return l;
      // LEAVE A LINE THAT STILL PAINTS A LIGHT GROUND. A legend swatch or a
      // meaning chip that deliberately stays pale needs DARK ink on it, and
      // lifting the ink there would produce the white-on-pale failure this
      // whole exercise has been removing.
      if (/background(Color)?:\s*(?!STAGE\s*\?|SURF|`?var\(--stg)[^,}]*(T\.white|COLORS\.(cream|paper)|'#(fff|[e-f][0-9a-f]{5}))/.test(l)) return l;
      let next = val;
      for (const [k, tok] of Object.entries(DARK)) {
        next = next.replace(new RegExp(`(?<![\\w.])COLORS\\.${k}(?![\\w])`, 'g'), '`var(' + tok + ', ${COLORS.' + k + '})`');
      }
      if (next === val) return l;
      n++;
      return l.replace(val, next);
    }).join('\n');
    if (n) { hits += n; files++; console.log(`  ${d.name.padEnd(9)} ${n}`); if (APPLY) writeFileSync(p, out); }
  }
}
console.log(`\n${hits} ternary colour value(s) across ${files} clients${APPLY ? ' — APPLIED' : ' (dry run)'}`);
