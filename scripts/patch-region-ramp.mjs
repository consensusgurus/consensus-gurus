// Region boards onto the ramp (owner-approved 2026-09-03, Parker option A).
// Reads FETCH_HEAD copies from IN, writes patched files to OUT. Every anchor
// must match EXACTLY once, or the run stops.
import fs from 'node:fs';
const IN = process.argv[2], OUT = process.argv[3];
const R = (f) => fs.readFileSync(`${IN}/${f}`, 'utf8');
const W = (f, s) => { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(`${OUT}/${f}`, s); };
function once(s, from, to, label) {
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`${label}: anchor matched ${n} times`);
  return s.replace(from, () => to);
}
const IMPORT = (s, extra, file) => once(s, "import { useStageTheme } from '@/lib/stage-theme';",
  `import { useStageTheme } from '@/lib/stage-theme';\nimport { ${extra} } from '@/lib/category-ramp';`, `${file} import`);

// ---------------- lib/category-ramp.js ----------------
{
  let s = R('category-ramp.js');
  s = s.trimEnd() + `

// THE REGION RAMP: what a board that colours cells BY GROUP indexes (owner,
// 2026-09-03). Carve, Cages, Jesters, Plot, Shards and Quilt each used to carry
// a private pastel list painted as flat literals in both registers; on the dark
// stage that made every region a pale slab and the board a heat map, which is
// why Carve was held back on 8/31. Parker's fleet and Sweep's count colours
// index it too. The hues are the category ramp's own, in a SPREAD order so two
// list-neighbours never sit near each other in hue, and gold, orange and amber
// (within 25 degrees of each other) are LAST: a board of six, seven or nine
// regions never reaches two of them, and only a ten-region board takes all
// three, where its adjacency colouring keeps them apart on the board.
//
// Each entry publishes THREE values because a hue is three things: the pastel
// it is on the dark stage (a fill and an ink both), the deep twin it is on the
// light stage (CATEGORY_RAMP_LIGHT), and the ink that twin needs as text
// (CATEGORY_RAMP_INK_LIGHT). regionStyle() folds them into two custom
// properties on the cell, --hue and --hue-ink, resolved per register by the
// --stg-dk token in app/globals.css (100% dark, 0% light), so a cell never has
// to know which register it stands in and never repaints after hydration.
// Every fill is then a color-mix of --hue into --stg-cell at --stg-tint-mix.
export const REGION_RAMP = [
  { name: 'sky',        dk: CATEGORY_RAMP[0], lt: CATEGORY_RAMP_LIGHT[0], ink: CATEGORY_RAMP_INK_LIGHT[0] },
  { name: 'gold',       dk: CATEGORY_RAMP[3], lt: CATEGORY_RAMP_LIGHT[3], ink: CATEGORY_RAMP_INK_LIGHT[3] },
  { name: 'mint',       dk: CATEGORY_RAMP[1], lt: CATEGORY_RAMP_LIGHT[1], ink: CATEGORY_RAMP_INK_LIGHT[1] },
  { name: 'rose',       dk: CATEGORY_RAMP[5], lt: CATEGORY_RAMP_LIGHT[5], ink: CATEGORY_RAMP_INK_LIGHT[5] },
  { name: 'violet',     dk: CATEGORY_RAMP[7], lt: CATEGORY_RAMP_LIGHT[7], ink: CATEGORY_RAMP_INK_LIGHT[7] },
  { name: 'lime',       dk: CATEGORY_RAMP[2], lt: CATEGORY_RAMP_LIGHT[2], ink: CATEGORY_RAMP_INK_LIGHT[2] },
  { name: 'magenta',    dk: CATEGORY_RAMP[6], lt: CATEGORY_RAMP_LIGHT[6], ink: CATEGORY_RAMP_INK_LIGHT[6] },
  { name: 'periwinkle', dk: CATEGORY_RAMP[9], lt: CATEGORY_RAMP_LIGHT[9], ink: CATEGORY_RAMP_INK_LIGHT[9] },
  { name: 'orange',     dk: CATEGORY_RAMP[4], lt: CATEGORY_RAMP_LIGHT[4], ink: CATEGORY_RAMP_INK_LIGHT[4] },
  { name: 'amber',      dk: CATEGORY_RAMP[8], lt: CATEGORY_RAMP_LIGHT[8], ink: CATEGORY_RAMP_INK_LIGHT[8] },
];
export function regionHue(k) { return REGION_RAMP[((k % REGION_RAMP.length) + REGION_RAMP.length) % REGION_RAMP.length]; }
// Inline-style object for a cell (or any element) that wears region k.
export function regionStyle(k) {
  const h = regionHue(k);
  return {
    '--hue': \`color-mix(in srgb, \${h.dk} var(--stg-dk, 100%), \${h.lt})\`,
    '--hue-ink': \`color-mix(in srgb, \${h.dk} var(--stg-dk, 100%), \${h.ink})\`,
  };
}
// The fills. mult scales the register's mix: 1 is a region, 2 a locked block or
// a placed piece, 0.5 a court that is already full.
export function regionMix(mult = 1) {
  const m = mult === 1 ? 'var(--stg-tint-mix, 26%)' : \`calc(var(--stg-tint-mix, 26%) * \${mult})\`;
  return \`color-mix(in srgb, var(--hue) \${m}, var(--stg-cell, #1a1d28))\`;
}
export const REGION_INK = 'var(--hue-ink)';
`;
  W('category-ramp.js', s);
}

// ---------------- app/globals.css ----------------
{
  let s = R('globals.css');
  s = once(s, `  --stg-tint-mix: 26%;`,
`  --stg-tint-mix: 26%;
  /* WHICH REGISTER A REGION HUE RESOLVES TO. lib/category-ramp.js regionStyle()
     writes a cell's --hue as color-mix(<dark pastel> var(--stg-dk), <light
     deep twin>): 100% here, 0% in the light block, so the same inline style
     lands on the right hue in either register with no class and no repaint. */
  --stg-dk: 100%;`, 'globals dark dk');
  s = once(s, `  --stg-tint-mix: 7%;`,
`  --stg-tint-mix: 12%;   /* was 7% (Quilt's own near-white pastels); the region
                            boards' pastels were stronger, and 12 is the value
                            the owner approved in the 9/3 mockups for all six */
  --stg-dk: 0%;`, 'globals light dk');
  W('globals.css', s);
}

// ---------------- Carve ----------------
{
  let s = R('carve.jsx');
  s = IMPORT(s, 'regionStyle, regionMix, REGION_INK', 'carve');
  s = once(s, `    let bg = STAGE ? 'var(--stg-surf)' : THEME.white;
    if (hue) bg = isLocked ? hue.mid : hue.soft;`,
`    let bg = STAGE ? 'var(--stg-surf)' : THEME.white;
    // On the stage a carved block is its ramp hue mixed into the cell at the
    // register's tint mix, a locked one at twice it, and the digit is page ink;
    // the Loft keeps its nine pastels with dark ink, untouched.
    if (hue) bg = STAGE ? regionMix(isLocked ? 2 : 1) : (isLocked ? hue.mid : hue.soft);`, 'carve bg');
  s = once(s, `    const onStage = STAGE && !hue;
    const thin = \`1px solid \${onStage ? 'var(--stg-line)' : 'rgba(28,30,36,0.16)'}\`;
    const thickColor = onStage ? 'var(--stg-line3)' : 'rgba(28,30,36,0.78)';
    return {
      background: bg,
      color: hue ? '#0b0d12' : undefined,`,
`    const onStage = STAGE && !hue;
    const thin = \`1px solid \${STAGE ? 'var(--stg-line)' : 'rgba(28,30,36,0.16)'}\`;
    const thickColor = STAGE ? (hue ? REGION_INK : 'var(--stg-line3)') : 'rgba(28,30,36,0.78)';
    return {
      ...(STAGE && hue ? regionStyle(reg) : null),
      background: bg,
      color: hue ? (STAGE ? 'var(--stg-ink)' : '#0b0d12') : undefined,`, 'carve style');
  if (!/const onStage = STAGE && !hue;\n/.test(s)) throw new Error('carve onStage');
  s = once(s, `                    {isSeed && hue && <span className="cv-seed-ring" style={{ border: \`2.5px solid \${hue.line}\` }} />}
                    <span style={{ fontSize: cellPx, fontWeight: isSeed ? 700 : 500, color: hue ? '#0b0d12' : INK, position: 'relative' }}>{gridFlat[idx]}</span>`,
`                    {isSeed && hue && <span className="cv-seed-ring" style={{ border: \`2.5px solid \${STAGE ? REGION_INK : hue.line}\` }} />}
                    <span style={{ fontSize: cellPx, fontWeight: isSeed ? 700 : 500, color: hue ? (STAGE ? 'var(--stg-ink)' : '#0b0d12') : INK, position: 'relative' }}>{gridFlat[idx]}</span>`, 'carve seed ring');
  s = once(s, `                      style={{ borderColor: on ? hue.line : undefined, background: done ? hue.mid : (on ? hue.soft : (STAGE ? 'var(--stg-surf)' : THEME.white)) }}>
                      <span style={{ width: 14, height: 14, borderRadius: 99, background: hue.line, display: 'inline-block' }} />
                      <span style={{ fontSize: 10.5, fontWeight: 500, color: (done || on) ? '#0b0d12' : \`var(--stg-ink, \${COLORS.ink})\`, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>`,
`                      style={STAGE
                        ? { ...regionStyle(k), borderColor: on ? REGION_INK : undefined, background: done ? regionMix(2) : (on ? regionMix(1) : 'var(--stg-surf)') }
                        : { borderColor: on ? hue.line : undefined, background: done ? hue.mid : (on ? hue.soft : THEME.white) }}>
                      <span style={{ width: 14, height: 14, borderRadius: 99, background: STAGE ? REGION_INK : hue.line, display: 'inline-block' }} />
                      <span style={{ fontSize: 10.5, fontWeight: 500, color: (done || on) && !STAGE ? '#0b0d12' : \`var(--stg-ink, \${COLORS.ink})\`, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>`, 'carve chip');
  W('carve.jsx', s);
}

// ---------------- Cages ----------------
{
  let s = R('cages.jsx');
  s = IMPORT(s, 'regionStyle, regionMix', 'cages');
  s = once(s, `    return col.map((c) => CAGE_TINTS[c % CAGE_TINTS.length]);`,
`    // The colour INDEX is what the board decided; the Loft reads a pastel off
    // it and the stage reads a ramp hue (regionStyle) in cellStyle below.
    return col;`, 'cages tint index');
  s = once(s, `    const bg = CAGE_TINT[CAGE[idx]];
    let wash = null;
    if (peer) wash = 'rgba(22,26,42,0.055)';
    if (sel >= 0 && CAGE[idx] === selK && !isSel) wash = 'rgba(107,33,168,0.13)';
    if (sameVal) wash = 'rgba(107,33,168,0.2)';
    if (isSel) wash = 'rgba(107,33,168,0.3)';
    const shadow = [];
    if (isSel) shadow.push(\`inset 0 0 0 2.5px \${COLORS.accent}\`);   // listed first, so it paints above the wash
    if (wash) shadow.push(\`inset 0 0 0 999px \${wash}\`);
    return {
      background: bg,`,
`    const tone = CAGE_TINT[CAGE[idx]];
    // On the stage the cage tint is its ramp hue mixed into the cell at the
    // register's mix, and the three highlights are mixed INTO it rather than
    // washed over it, exactly as Quilt's regions are (peer a neutral ink lift,
    // same-digit and selected carrying the accent). The Loft keeps its seven
    // pastels and its translucent washes untouched.
    const tint = STAGE ? regionMix(1) : CAGE_TINTS[tone % CAGE_TINTS.length];
    let bg = tint;
    if (STAGE) {
      if (peer) bg = \`color-mix(in srgb, var(--stg-ink) 12%, \${tint})\`;
      if (sameVal) bg = \`color-mix(in srgb, var(--stg-acc) 24%, \${tint})\`;
      if (isSel) bg = \`color-mix(in srgb, var(--stg-acc) 40%, \${tint})\`;
    }
    let wash = null;
    if (!STAGE) {
      if (peer) wash = 'rgba(22,26,42,0.055)';
      if (sel >= 0 && CAGE[idx] === selK && !isSel) wash = 'rgba(107,33,168,0.13)';
      if (sameVal) wash = 'rgba(107,33,168,0.2)';
      if (isSel) wash = 'rgba(107,33,168,0.3)';
    }
    const shadow = [];
    if (isSel) shadow.push(\`inset 0 0 0 2.5px \${STAGE ? 'var(--stg-acc)' : COLORS.accent}\`);   // listed first, so it paints above the wash
    if (wash) shadow.push(\`inset 0 0 0 999px \${wash}\`);
    return {
      ...(STAGE ? regionStyle(tone) : null),
      background: bg,`, 'cages cellStyle');
  s = once(s, `      color: '#0b0d12',
      boxShadow: shadow.length ? shadow.join(', ') : undefined,`,
`      // On the stage the tint follows the register, so the digit ink comes from
      // .cg-given / .cg-user as Quilt's does; only the SELECTED cell, whose
      // fill carries the accent, still pins page ink.
      color: STAGE ? (isSel ? 'var(--stg-ink)' : undefined) : '#0b0d12',
      boxShadow: shadow.length ? shadow.join(', ') : undefined,`, 'cages ink pin');
  s = once(s, `.cg-sum{position:absolute;top:5px;left:5.5px;font-family:\${SANS};font-size:10px;line-height:1;font-weight:800;color:#2f1259;pointer-events:none;letter-spacing:-0.02em;}
          .cg-sum.done{color:rgba(47,18,89,0.32);}`,
`.cg-sum{position:absolute;top:5px;left:5.5px;font-family:\${SANS};font-size:10px;line-height:1;font-weight:800;color:var(--hue-ink, #2f1259);pointer-events:none;letter-spacing:-0.02em;}
          .cg-sum.done{color:color-mix(in srgb, var(--hue-ink, #2f1259) 40%, transparent);}`, 'cages sum ink');
  W('cages.jsx', s);
}

// ---------------- Jesters ----------------
{
  let s = R('jesters.jsx');
  s = IMPORT(s, 'regionStyle, regionMix', 'jesters');
  s = once(s, `                      style={{ width: cellPx, height: cellPx, background: conflict ? '#fecaca' : (doneRegions.has(id) ? REGION_FILLS_DONE : REGION_FILLS)[id % REGION_FILLS.length],`,
`                      style={{ ...(STAGE ? regionStyle(id) : null), width: cellPx, height: cellPx,
                        // Stage: the court's ramp hue mixed into the cell at the register's mix, a
                        // full court at half of it (it fades on either ground instead of washing
                        // toward a literal white), a quarrel in the page's own red. Loft: untouched.
                        background: STAGE
                          ? (conflict ? 'color-mix(in srgb, var(--stg-bad) 38%, var(--stg-cell))' : regionMix(doneRegions.has(id) ? 0.5 : 1))
                          : (conflict ? '#fecaca' : (doneRegions.has(id) ? REGION_FILLS_DONE : REGION_FILLS)[id % REGION_FILLS.length]),`, 'jesters cell');
  W('jesters.jsx', s);
}

// ---------------- Plot ----------------
{
  let s = R('plot.jsx');
  s = IMPORT(s, 'regionStyle, regionMix, REGION_INK', 'plot');
  s = once(s, `                    position: 'absolute', left: pct(p[1]), top: pct(p[0]), width: pct(p[2]), height: pct(p[3]),
                    background: bad ? WRONG_BG : tint[0], border: \`2px solid \${bad ? WRONG_EDGE : tint[1]}\`,`,
`                    ...(STAGE ? regionStyle(p[4]) : null),
                    position: 'absolute', left: pct(p[1]), top: pct(p[0]), width: pct(p[2]), height: pct(p[3]),
                    // Stage: the plot's ramp hue mixed into the cell, edged in the hue's ink.
                    background: STAGE ? (bad ? 'color-mix(in srgb, var(--stg-bad) 38%, var(--stg-cell))' : regionMix(1)) : (bad ? WRONG_BG : tint[0]),
                    border: \`2px solid \${STAGE ? (bad ? 'var(--stg-bad)' : REGION_INK) : (bad ? WRONG_EDGE : tint[1])}\`,`, 'plot fill');
  s = once(s, `                const col = i >= 0 ? (bad ? WRONG_EDGE : TINT[plots[i][4] % TINT.length][1]) : \`var(--stg-ink, \${COLORS.ink})\`;
                return (
                  <div key={\`c\${k}\`} className="pl-num" style={{ left: pct(cl[1]), top: pct(cl[0]), width: pct(1), height: pct(1), fontSize: numFs, color: col }}>{cl[2]}</div>`,
`                const col = i >= 0 ? (bad ? (STAGE ? 'var(--stg-bad)' : WRONG_EDGE) : (STAGE ? REGION_INK : TINT[plots[i][4] % TINT.length][1])) : \`var(--stg-ink, \${COLORS.ink})\`;
                return (
                  <div key={\`c\${k}\`} className="pl-num" style={{ ...(STAGE && i >= 0 ? regionStyle(plots[i][4]) : null), left: pct(cl[1]), top: pct(cl[0]), width: pct(1), height: pct(1), fontSize: numFs, color: col }}>{cl[2]}</div>`, 'plot number');
  W('plot.jsx', s);
}

// ---------------- Shards ----------------
{
  let s = R('shards.jsx');
  s = IMPORT(s, 'regionStyle, regionMix, regionHue, REGION_INK', 'shards');
  s = once(s, `                        style={tint ? { '--tint': COLORS.accentSoft, background: tintBg(tint), color: '#12312e' } : undefined}`,
`                        style={tint
                          // Stage: a placed piece is its ramp hue at twice the register's mix (a piece
                          // is a mark you pick up, so it sits a step above a region), edged in the
                          // hue's ink, lettered in page ink. Loft: the lightened tint, untouched.
                          ? (STAGE
                            ? { ...regionStyle(cell.id), '--tint': COLORS.accentSoft, background: regionMix(2), color: 'var(--stg-ink)', borderColor: \`color-mix(in srgb, \${REGION_INK} 55%, transparent)\` }
                            : { '--tint': COLORS.accentSoft, background: tintBg(tint), color: '#12312e' })
                          : undefined}`, 'shards cell');
  // tray pieces and the drag ghost paint the deep tint as a solid: on the stage that is the hue itself (the pastel on dark, the deep twin on light) with matching ink
  s = once(s, `                    const tint = SHARD_TINTS[id % SHARD_TINTS.length];
                    return (
                      <div
                        key={id}
                        className={\`sh-piece\${armed === id ? ' armed' : ''}\${drag && drag.id === id ? ' dragging' : ''}\`}
                        style={{ gridTemplateColumns: \`repeat(\${s.w}, \${TRAYCELL}px)\`, gridTemplateRows: \`repeat(\${s.h}, \${TRAYCELL}px)\` }}`,
`                    const tint = STAGE ? 'var(--hue)' : SHARD_TINTS[id % SHARD_TINTS.length];
                    return (
                      <div
                        key={id}
                        className={\`sh-piece\${armed === id ? ' armed' : ''}\${drag && drag.id === id ? ' dragging' : ''}\`}
                        style={{ ...(STAGE ? regionStyle(id) : null), gridTemplateColumns: \`repeat(\${s.w}, \${TRAYCELL}px)\`, gridTemplateRows: \`repeat(\${s.h}, \${TRAYCELL}px)\` }}`, 'shards tray');
  s = once(s, `        const tint = SHARD_TINTS[drag.id % SHARD_TINTS.length];
        // Always board scale:`,
`        const tint = STAGE ? 'var(--hue)' : SHARD_TINTS[drag.id % SHARD_TINTS.length];
        // Always board scale:`, 'shards ghost tint');
  s = once(s, `          <div className="sh-ghost" style={{ left:`, `          <div className="sh-ghost" style={{ ...(STAGE ? regionStyle(drag.id) : null), left:`, 'shards ghost style');
  W('shards.jsx', s);
}

// ---------------- Parker (option A) ----------------
{
  let s = R('parker.jsx');
  s = IMPORT(s, 'regionStyle, REGION_INK', 'parker');
  s = once(s, `const BLOCK_LIFT = ['var(--stg-b1)', 'var(--stg-b2)', 'var(--stg-b3)', 'var(--stg-b4)'];
// Raised from [.34 .48 .64 .82] after looking at the LIGHT register live: a green
// edge at 34% on a near-white block is not an edge. These read on both grounds.
const BLOCK_EDGE = [0.46, 0.60, 0.74, 0.90];`,
`// THE FLEET WEARS THE RAMP (owner, 2026-09-03, "proposed A"). Six region-ramp
// indices: never lime, which is Logic's accent and marks the block you hold, and
// never rose, orange or amber, the red car's neighbours. A block is its hue at
// 2.2x the register's tint mix into the cell, edged in the hue's ink, so the
// fleet is quiet on the dark stage and pastel on the light one, and the red is
// the loudest thing in the lot in both. Replaces four grey lifts told apart by
// edge weight (BLOCK_EDGE), which the owner found too uniform.
const FLEET = [0, 2, 1, 4, 7, 6];   // sky, mint, gold, violet, periwinkle, magenta (REGION_RAMP order)
const BLOCK_LIFT = FLEET.map(() => null);   // length only: blockTones() walks it
const BLOCK_FILL = 'color-mix(in srgb, var(--hue) calc(var(--stg-tint-mix, 26%) * 2.2), var(--stg-cell, #1a1d28))';`, 'parker consts');
  s = once(s, `                const fill = isRed ? RED_BLOCK
                  : STAGE ? BLOCK_LIFT[tone]
                  : truck ? TRUCK[i % TRUCK.length] : PAINT[i % PAINT.length];
                const carEdge = STAGE
                  ? \`\${truck ? 2 : 1}px solid color-mix(in srgb, var(--stg-acc) \${Math.round(BLOCK_EDGE[tone] * 100)}%, transparent)\`
                  : 'none';`,
`                const fill = isRed ? RED_BLOCK
                  : STAGE ? BLOCK_FILL
                  : truck ? TRUCK[i % TRUCK.length] : PAINT[i % PAINT.length];
                const carEdge = STAGE
                  ? \`\${truck ? 2 : 1}px solid color-mix(in srgb, \${REGION_INK} 70%, transparent)\`
                  : 'none';`, 'parker fill');
  s = once(s, `                  <div key={i} className="pk-blk"
                    style={{
                      left:`,
`                  <div key={i} className="pk-blk"
                    style={{
                      ...(STAGE && !isRed ? regionStyle(FLEET[tone]) : null),
                      left:`, 'parker style');
  W('parker.jsx', s);
}

// ---------------- Sweep ----------------
{
  let s = R('sweep.jsx');
  s = IMPORT(s, 'regionHue', 'sweep');
  s = once(s, `const NUM_COLOR = ['', '#2563eb', '#15803d', '#c0392b', '#233a63', '#a16207', '#0e7490', '#0b0d12', '#6b7280'];`,
`const NUM_COLOR = ['', '#2563eb', '#15803d', '#c0392b', '#233a63', '#a16207', '#0e7490', '#0b0d12', '#6b7280'];
// On the stage the eight counts take ramp ink (the 7 above is near-black and
// vanished on the dark register): sky, mint, rose, periwinkle, gold, magenta,
// violet, then page ink for 8. Loosely the classic order (1 cool, 3 red) so a
// habit still works. Resolved per register by --stg-dk, as regionStyle() does.
const NUM_RAMP = [null, 0, 2, 3, 7, 1, 6, 4, null];
const numInk = (n) => {
  const k = NUM_RAMP[n];
  if (k == null) return 'var(--stg-ink)';
  const h = regionHue(k);
  return \`color-mix(in srgb, \${h.dk} var(--stg-dk, 100%), \${h.ink})\`;
};`, 'sweep consts');
  s = once(s, `            color: isBoom ? '#fff' : NUM_COLOR[n] || \`var(--stg-mute, \${COLORS.faded})\`,`,
`            color: isBoom ? '#fff' : (STAGE && n ? numInk(n) : NUM_COLOR[n] || \`var(--stg-mute, \${COLORS.faded})\`),`, 'sweep ink');
  W('sweep.jsx', s);
}

// ---------------- Quilt (same vocabulary) ----------------
{
  let s = R('quilt.jsx');
  s = IMPORT(s, 'regionStyle, regionMix', 'quilt');
  s = once(s, `  const regionTint = (b) => (STAGE
    ? \`color-mix(in srgb, \${REGION_HUE[b] || REGION_HUE[0]} var(--stg-tint-mix, 26%), var(--stg-cell, #ffffff))\`
    : (REGION_TINT[b] || T.white));`,
`  // On the stage the nine regions index the shared REGION_RAMP (one vocabulary
  // with Carve, Cages, Jesters, Plot and Shards, owner 2026-09-03); the hue is
  // published on the cell by regionStyle() below and mixed in here.
  const regionTint = (b) => (STAGE ? regionMix(1) : (REGION_TINT[b] || T.white));`, 'quilt tint');
  s = once(s, `    return {
      background: bg,
      // Digit ink comes from .ql-given and .ql-user, both of which the register`,
`    return {
      ...(STAGE ? regionStyle(b) : null),
      background: bg,
      // Digit ink comes from .ql-given and .ql-user, both of which the register`, 'quilt style');
  W('quilt.jsx', s);
}
console.log('patched');
