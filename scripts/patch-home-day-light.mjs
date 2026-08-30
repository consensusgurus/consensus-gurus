import { readFileSync, writeFileSync } from 'node:fs';
const [, , ladderPath, todayPath] = process.argv;
let n = 0;
function edit(file, name, anchor, replacement) {
  let s = readFileSync(file, 'utf8');
  const hits = s.split(anchor).length - 1;
  if (hits !== 1) throw new Error(`"${name}" matched ${hits}, expected 1`);
  writeFileSync(file, s.replace(anchor, replacement));
  n += 1;
}

// THE LADDER LEARNS WHERE IT IS. Its unlit rung is white at 10%, which is the
// right dim on a near-black stage and invisible on anything pale. The home is
// the first surface to mount it off the stage, so the ground becomes a prop
// rather than an assumption baked into the component.
edit(ladderPath, 'ladder signature',
  "export default function StageLadder({\n  blocks = [],\n  vertical = false,",
  "export default function StageLadder({\n  blocks = [],\n  light = false,\n  vertical = false,");
edit(ladderPath, 'ladder dim const',
  "const DIM = 'rgba(255,255,255,0.10)';",
  "// An unlit rung, by ground. White at 10% is the right dim on near-black and\n"
  + "// is simply not there on a pale surface, which is what the home is.\n"
  + "const DIM = 'rgba(255,255,255,0.10)';\nconst DIM_LIGHT = 'rgba(11,15,26,0.11)';");
edit(ladderPath, 'ladder field fn',
  "function fieldInk(v) {\n  const f = Math.max(0, Math.min(1, Number(v) || 0));\n  return 'rgba(255,255,255,' + (0.07 + 0.16 * f).toFixed(3) + ')';\n}",
  "function fieldInk(v, light) {\n  const f = Math.max(0, Math.min(1, Number(v) || 0));\n  return light\n    ? 'rgba(11,15,26,' + (0.07 + 0.14 * f).toFixed(3) + ')'\n    : 'rgba(255,255,255,' + (0.07 + 0.16 * f).toFixed(3) + ')';\n}");
edit(ladderPath, 'ladder half',
  "                  + ',' + b.c + ' 50%,' + DIM + ' 50%)';",
  "                  + ',' + b.c + ' 50%,' + (light ? DIM_LIGHT : DIM) + ' 50%)';");
edit(ladderPath, 'ladder none',
  "                style.background = b.field ? fieldInk(b.field[i]) : DIM;",
  "                style.background = b.field ? fieldInk(b.field[i], light) : (light ? DIM_LIGHT : DIM);");

// THE BAND IS ON A PALE GROUND, not a stage. I read the navy header and assumed
// the page was dark; the content column behind this band is near-white, so every
// dark token was invisible on it. The lit rungs survived because CAT_BLUE was
// built for white in the first place.
edit(todayPath, 'ladder call', "<StageLadder height={46} blocks={dayBlocks} />", "<StageLadder light height={46} blocks={dayBlocks} />");
edit(todayPath, 'leader points',
  "                <s>{dayLeader.pts} pts</s>",
  "                <s>{dayLeader.pts != null ? dayLeader.pts : (dayLeader.points || 0)} pts</s>");
edit(todayPath, 'band css',
  ".tdy-day{background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.09);\n  border-radius:14px;padding:16px 18px 14px;}",
  ".tdy-day{background:#fff;border:1px solid #e7e9ee;border-radius:14px;padding:16px 18px 14px;}");
edit(todayPath, 'band h2', ".tdy-dayhd h2{margin:0;font-size:20px;font-weight:800;letter-spacing:-.02em;color:#e9edf4;}",
  ".tdy-dayhd h2{margin:0;font-size:20px;font-weight:800;letter-spacing:-.02em;color:#1c1e24;}");
edit(todayPath, 'band fig', ".tdy-dayfig{font-family:'DM Mono',ui-monospace,monospace;font-size:11.5px;color:#8b95a8;}\n.tdy-dayfig b{color:#e9edf4;font-weight:500;}",
  ".tdy-dayfig{font-family:'DM Mono',ui-monospace,monospace;font-size:11.5px;color:#6b7280;}\n.tdy-dayfig b{color:#1c1e24;font-weight:500;}");
edit(todayPath, 'band key', "  font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#8b95a8;}",
  "  font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;}");
edit(todayPath, 'band strip',
  "  margin-top:10px;padding:9px 14px;border-radius:10px;font-size:12.5px;color:#e9edf4;\n  background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);}\n.tdy-daystrip:hover{background:rgba(255,255,255,.06);}",
  "  margin-top:10px;padding:9px 14px;border-radius:10px;font-size:12.5px;color:#1c1e24;\n  background:#fff;border:1px solid #e7e9ee;}\n.tdy-daystrip:hover{background:#f4f6f9;}");
edit(todayPath, 'strip ink',
  "  text-transform:uppercase;color:#8b95a8;}\n.tdy-daystrip b{font-weight:800;}\n.tdy-daystrip s{text-decoration:none;font-family:'DM Mono',ui-monospace,monospace;font-size:11.5px;color:#aab5c7;}\n.tdy-daystrip .d{color:#8b95a8;font-size:11.5px;}",
  "  text-transform:uppercase;color:#6b7280;}\n.tdy-daystrip b{font-weight:800;}\n.tdy-daystrip s{text-decoration:none;font-family:'DM Mono',ui-monospace,monospace;font-size:11.5px;color:#3f4757;}\n.tdy-daystrip .d{color:#6b7280;font-size:11.5px;}");
edit(todayPath, 'strip accent',
  "  font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#7dd3fc;flex:none;}",
  "  font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#2563eb;flex:none;}");
console.log(`patched ${n} edits`);
