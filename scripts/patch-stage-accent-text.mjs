// ACCENT-AS-TEXT, wherever it sits.
//
// The converter turns `color: COLORS.accent` into ACC, but only BELOW the
// declaration, because ACC is a component const and several clients paint in
// helper components above it. Everything above kept the game's own identity
// hue: Alibi's oxblood #8b1e2d on the near-black ground is 2.12:1, and it is
// also the off-palette colour the owner flagged on that board.
//
// The CSS variable has no scope problem and fixes both at once: on the stage
// the highlight becomes the category's step, off it the client's own hue.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
let files = 0, edits = 0;
const rows = [];
for (const d of readdirSync('app', { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  for (const f of readdirSync(join('app', d.name))) {
    if (!/^[A-Z][A-Za-z]*Client\.jsx$/.test(f)) continue;
    const p = join('app', d.name, f);
    const src = readFileSync(p, 'utf8');
    if (!/const STAGE = isStage\(/.test(src)) continue;
    let n = 0;
    const out = src.split('\n').map((l) => {
      if (/^\s*(import|\/\/)/.test(l)) return l;
      if (/color:\s*(?:STAGE\s*\?|ACC|`?var\(--stg)/.test(l)) return l;
      const next = l
        .replace(/color: COLORS\.accentDeep\b/g, 'color: `var(--stg-acc, ${COLORS.accentDeep})`')
        .replace(/color: COLORS\.accent\b/g, 'color: `var(--stg-acc, ${COLORS.accent})`')
        .replace(/color:\$\{COLORS\.accent\}/g, 'color:var(--stg-acc, ${COLORS.accent})');
      if (next !== l) n++;
      return next;
    }).join('\n');
    if (n) { writeFileSync(p, out); files++; edits += n; rows.push(`  ${d.name.padEnd(10)} ${n}`); }
  }
}
console.log(rows.join('\n'));
console.log(`\naccent-as-text: ${edits} lines across ${files} files`);
