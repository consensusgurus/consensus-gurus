// EVERY NAME A CONVERTED CLIENT USES MUST BE IMPORTED OR DECLARED.
//
//   node scripts/verify-stage-imports.mjs
//
// esbuild parses an undefined identifier without complaint, so a converter that
// emits a call it forgot to import produces a page that throws ReferenceError on
// its FIRST RENDER — live, for every player, flag or no flag. That shipped: the
// stage converter emitted gameColorLight into STAGE_ACC and only ever imported
// gameColor, and thirteen daily pages went down.
//
// This checks the names the stage machinery introduces, which is the set a
// converter can get wrong. It is deliberately narrow: a general no-undef pass is
// eslint's job, and eslint is not run per client here.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const NEEDED = [
  'gameColor', 'gameColorLight', 'RAMP_INK', 'STAGE_GROUND', 'CATEGORY_RAMP',
  'isStage', 'useStageTheme', 'useStageRoom', 'StageChrome', 'StageLadder', 'LoftSheet',
];

let bad = 0;
let checked = 0;
for (const d of readdirSync('app', { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  for (const f of readdirSync(join('app', d.name))) {
    if (!/^[A-Z][A-Za-z]*Client\.jsx$/.test(f)) continue;
    const rel = join('app', d.name, f);
    const src = readFileSync(rel, 'utf8');
    if (!/const STAGE = isStage\(/.test(src)) continue;   // unconverted
    checked++;
    // Everything the file imports, by name, plus everything it declares.
    const imported = new Set();
    for (const m of src.matchAll(/import\s+(?:(\w+)\s*,\s*)?\{([^}]*)\}\s+from/g)) {
      if (m[1]) imported.add(m[1]);
      for (const n of m[2].split(',')) {
        const nm = n.trim().split(/\s+as\s+/).pop().trim();
        if (nm) imported.add(nm);
      }
    }
    for (const m of src.matchAll(/import\s+(\w+)\s+from/g)) imported.add(m[1]);
    const declared = new Set([...src.matchAll(/(?:^|\n)\s*(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]));
    for (const name of NEEDED) {
      const used = new RegExp(String.raw`(?<![\w$.])${name}\s*[({[]`).test(src)
        || new RegExp(String.raw`(?<![\w$.])${name}(?![\w$])`).test(src.replace(/^import[^\n]*$/gm, ''));
      if (used && !imported.has(name) && !declared.has(name)) {
        console.log(`✗ ${rel}: uses ${name} but never imports or declares it`);
        bad++;
      }
    }
  }
}
console.log(bad ? `\n${bad} undefined name(s) across ${checked} converted clients` : `clean: ${checked} converted clients, every stage name imported`);
process.exit(bad ? 1 : 0);
