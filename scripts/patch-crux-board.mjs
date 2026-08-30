// Crux's BOARD on the dark stage. patch-crux-stage.mjs converted the chrome;
// this converts the thing the chrome is wrapped around.
//
// WHY IT IS NOT ONE STYLESHEET. Almost every colour on this board is set
// INLINE, and the ones that matter vary by game state: a cell is empty, or
// selected, or locked, or revealed under its category, and a key is unplayed,
// or a hit, or a near miss, or spent. CSS cannot tell those apart, because the
// states carry no classes, so a scoped override would have to flatten all of
// them to one colour. The state-varying colours are therefore edited at their
// source, and only the genuinely static furniture is left to a stylesheet.
//
// WHAT IS DELIBERATELY NOT CHANGED. A near-black FILL is still fine on this
// ground: it reads as a darker block with white text, which is a legitimate
// object on a dark stage. Only the two places where near-black-on-near-black
// destroys the meaning are converted, the locked cell and the hit key, and
// both take the category step with dark ink. What does have to change
// everywhere is near-black TEXT, which is simply invisible here.
//
// EVERY ANCHOR MUST MATCH EXACTLY ONCE, and the two global replacements assert
// their own counts, so a file that has moved under this patch fails loudly
// rather than half-applying.
import { readFileSync, writeFileSync } from 'node:fs';

const path = process.argv[2];
if (!path) throw new Error('usage: node scripts/patch-crux-board.mjs <CruxClient.jsx>');
let s = readFileSync(path, 'utf8');
let n = 0;

function edit(name, anchor, replacement) {
  const hits = s.split(anchor).length - 1;
  if (hits !== 1) throw new Error(`anchor "${name}" matched ${hits} times, expected exactly 1`);
  s = s.replace(anchor, replacement);
  n += 1;
}
function replaceAll(name, re, to, expect) {
  const hits = (s.match(re) || []).length;
  if (hits !== expect) throw new Error(`"${name}" matched ${hits} times, expected ${expect}`);
  s = s.replace(re, to);
  n += 1;
}

// ── 1. the stage's own palette, declared before anything reads it ──────────
edit('palette',
  "  const STAGE_C = gameColor('crux');",
  "  const STAGE_C = gameColor('crux');\n"
  + "  // TEXT and FILL are different problems here, which is why there are two\n"
  + "  // names rather than one restyled COLORS. Near-black TEXT is invisible on\n"
  + "  // this ground and has to move; a near-black FILL is a perfectly good\n"
  + "  // object on it and stays. Conflating the two is what would turn every\n"
  + "  // dark chip on the board into a pale one.\n"
  + "  const INK = STAGE ? '#e9edf4' : COLORS.ink;\n"
  + "  const FADED = STAGE ? '#8b95a8' : COLORS.faded;\n"
  + "  const SPAL = STAGE ? {\n"
  + "    tile: 'rgba(255,255,255,0.045)',\n"
  + "    tileB: 'rgba(255,255,255,0.13)',\n"
  + "    sel: 'rgba(125,211,252,0.14)',\n"
  + "    selCur: 'rgba(125,211,252,0.26)',\n"
  + "    selB: 'rgba(125,211,252,0.5)',\n"
  + "    key: 'rgba(255,255,255,0.09)',\n"
  + "    keyB: '1.5px solid rgba(255,255,255,0.14)',\n"
  + "    spent: 'rgba(255,255,255,0.05)',\n"
  + "    spentInk: '#5a657d',\n"
  + "  } : null;");

// ── 2. the grid, one branch per state ─────────────────────────────────────
edit('cell locked',
  "    if (green) return { ...base, background: COLORS.ink, color: T.white, border: `1.5px solid ${COLORS.ink}`, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.5)' };",
  "    // A LOCKED LETTER IS THE WIN STATE, so on the stage it takes the game's\n"
  + "    // own category step. Left as near-black it would be a near-black cell on\n"
  + "    // a near-black ground: the one place the fill genuinely stops working.\n"
  + "    if (green) return { ...base, background: SPAL ? STAGE_C : COLORS.ink, color: SPAL ? RAMP_INK : T.white, border: `1.5px solid ${SPAL ? STAGE_C : COLORS.ink}`, boxShadow: SPAL ? 'none' : 'inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.5)' };");

edit('cell lost',
  "    if (lost) return { ...base, background: TILE, color: COLORS.rust, border: '1.5px dashed rgba(192,57,43,0.55)' };",
  "    if (lost) return { ...base, background: SPAL ? 'transparent' : TILE, color: COLORS.rust, border: '1.5px dashed rgba(192,57,43,0.55)' };");

edit('cell selected',
  "        background: isCursor ? '#dce9ff' : '#edf3ff',\n"
  + "        color: COLORS.ember,\n"
  + "        border: `2px solid ${isCursor ? COLORS.ember : 'rgba(37,99,235,0.5)'}`,",
  "        background: SPAL ? (isCursor ? SPAL.selCur : SPAL.sel) : (isCursor ? '#dce9ff' : '#edf3ff'),\n"
  + "        color: SPAL ? INK : COLORS.ember,\n"
  + "        border: `2px solid ${SPAL ? (isCursor ? STAGE_C : SPAL.selB) : (isCursor ? COLORS.ember : 'rgba(37,99,235,0.5)')}`,");

edit('cell empty',
  "    return { ...base, background: TILE, color: COLORS.ink, border: `1.5px solid ${TILE_BORDER}`, boxShadow: 'inset 0 1px 2px rgba(28,30,36,0.07)' };",
  "    return { ...base, background: SPAL ? SPAL.tile : TILE, color: SPAL ? INK : COLORS.ink, border: `1.5px solid ${SPAL ? SPAL.tileB : TILE_BORDER}`, boxShadow: SPAL ? 'none' : 'inset 0 1px 2px rgba(28,30,36,0.07)' };");

// ── 3. the keyboard and the tries marks ───────────────────────────────────
edit('kbColors',
  "  const kbColors = { g: { bg: COLORS.ink, fg: T.white }, y: { bg: '#e6b93f', fg: '#5c4a06' }, x: { bg: '#c9cdd4', fg: T.muted } };",
  "  // The HIT key follows the locked cell onto the category step, for the same\n"
  + "  // reason. The near miss keeps its amber and the spent key keeps being the\n"
  + "  // quietest thing on the board: both of those are meanings, not styling.\n"
  + "  const kbColors = STAGE\n"
  + "    ? { g: { bg: STAGE_C, fg: RAMP_INK }, y: { bg: '#e6b93f', fg: '#5c4a06' }, x: { bg: SPAL.spent, fg: SPAL.spentInk } }\n"
  + "    : { g: { bg: COLORS.ink, fg: T.white }, y: { bg: '#e6b93f', fg: '#5c4a06' }, x: { bg: '#c9cdd4', fg: T.muted } };");

edit('markColor',
  "  const markColor = { g: { bg: COLORS.ink, fg: T.white }, y: { bg: '#e6b93f', fg: '#5c4a06' }, x: { bg: '#c9cdd4', fg: '#40434b' } };",
  "  const markColor = STAGE\n"
  + "    ? { g: { bg: STAGE_C, fg: RAMP_INK }, y: { bg: '#e6b93f', fg: '#5c4a06' }, x: { bg: SPAL.spent, fg: SPAL.spentInk } }\n"
  + "    : { g: { bg: COLORS.ink, fg: T.white }, y: { bg: '#e6b93f', fg: '#5c4a06' }, x: { bg: '#c9cdd4', fg: '#40434b' } };");

// cl-kx marks a key whose colour is decided HERE, so the stylesheet below can
// take every other key without flattening the four letter states.
edit('enter key',
  "                    <button className=\"cl-key\" onClick={() => onKey('ENTER')} style={{ flex: '1.6 0 0', height: 44, background: COLORS.ember, color: T.white, fontSize: 11.5 }}>ENTER</button>",
  "                    <button className=\"cl-key cl-kx\" onClick={() => onKey('ENTER')} style={{ flex: '1.6 0 0', height: 44, background: STAGE ? STAGE_C : COLORS.ember, color: STAGE ? RAMP_INK : T.white, fontSize: 11.5 }}>ENTER</button>");

edit('letter keys',
  "                    const kc = st ? kbColors[st] : { bg: T.white, fg: COLORS.ink };\n"
  + "                    return (\n"
  + "                      <button key={ch} className=\"cl-key\" onClick={() => onKey(ch)} style={{ flex: '1 0 0', height: 44, background: kc.bg, color: kc.fg, fontSize: 15, border: st ? 'none' : '1.5px solid rgba(20,22,28,0.15)' }}>{ch}</button>",
  "                    const kc = st ? kbColors[st] : (SPAL ? { bg: SPAL.key, fg: INK } : { bg: T.white, fg: COLORS.ink });\n"
  + "                    return (\n"
  + "                      <button key={ch} className=\"cl-key cl-kx\" onClick={() => onKey(ch)} style={{ flex: '1 0 0', height: 44, background: kc.bg, color: kc.fg, fontSize: 15, border: st ? 'none' : (SPAL ? SPAL.keyB : '1.5px solid rgba(20,22,28,0.15)') }}>{ch}</button>");

// ── 4. the two cards ──────────────────────────────────────────────────────
edit('start tile',
  "            <div style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '22px', display: 'flex', flexDirection: 'column', marginBottom: 12 }}>",
  "            <div style={{ background: STAGE ? 'rgba(255,255,255,0.045)' : COLORS.cream, border: STAGE ? '1px solid rgba(255,255,255,0.10)' : `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '22px', display: 'flex', flexDirection: 'column', marginBottom: 12 }}>");

edit('board card',
  "          <div className={LOFT ? 'cl-panel loft-card' : 'cl-panel'} style={{ background: T.white, border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '14px 16px 16px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>",
  "          <div className={STAGE ? 'cl-panel' : (LOFT ? 'cl-panel loft-card' : 'cl-panel')} style={STAGE\n"
  + "            // NO CARD. The board sits on the ground, which is the whole point\n"
  + "            // of the stage: a white panel here reads as a cut-out, and a dark\n"
  + "            // panel reads as a second ground nobody asked for.\n"
  + "            ? { background: 'transparent', border: 'none', borderRadius: 0, padding: 0, boxShadow: 'none', marginBottom: 12 }\n"
  + "            : { background: T.white, border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '14px 16px 16px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>");

// the file-it-in button rides the same rule as every other primary here
edit('lock button',
  "background: armLock ? COLORS.ink : COLORS.ember, color: T.white, cursor: 'pointer', marginTop: 18, marginBottom: 14 }}>",
  "background: armLock ? (STAGE ? 'rgba(255,255,255,0.10)' : COLORS.ink) : (STAGE ? STAGE_C : COLORS.ember), color: STAGE ? (armLock ? INK : RAMP_INK) : T.white, cursor: 'pointer', marginTop: 18, marginBottom: 14 }}>");

// ── 5. the stylesheet, for the static furniture only ──────────────────────
edit('stylesheet',
  "      <div className=\"cx-wrap\" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: STAGE ? '10px 38px 40px' : '18px 38px 80px', fontFamily: SANS }}>",
  "      {STAGE && <style>{STAGE_BOARD_CSS}</style>}\n"
  + "      <div className=\"cx-wrap\" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: STAGE ? '10px 38px 40px' : '18px 38px 80px', fontFamily: SANS }}>");

// ── 6. TEXT colour, everywhere it is set inline ───────────────────────────
// Only `color:`. A `background:` of the same token is left alone on purpose.
replaceAll('ink text', /color: COLORS\.ink\b/g, 'color: INK', 12); // 13 in the file, one consumed by the cell-empty anchor above
replaceAll('faded text', /color: COLORS\.faded\b/g, 'color: FADED', 15);

// ── 7. the stylesheet itself, appended at module scope ────────────────────
const CSS = [
  '',
  '// Static furniture only: everything here is one colour whatever the game is',
  '// doing. Anything that varies by state is set at its source above, and the',
  '// cl-kx class exists to keep this rule off the four letter-key states.',
  '//',
  '// !important is load-bearing rather than lazy: these elements carry INLINE',
  '// styles from the Loft build, and a plain rule loses to an inline one.',
  'const STAGE_BOARD_CSS = `',
  '.stage-page .cl-key:not(.cl-kx){background:rgba(255,255,255,0.07)!important;',
  '  color:#e9edf4!important;border:1px solid rgba(255,255,255,0.13)!important;}',
  '.stage-page .cl-btn{background:transparent!important;color:#e9edf4!important;',
  '  border:1.5px solid rgba(255,255,255,0.18)!important;}',
  '.stage-page .cl-cat{border:1px solid rgba(255,255,255,0.10);border-radius:8px;}',
  '.stage-page .cx-tries{color:#8b95a8;}',
  '.stage-page hr{border-color:rgba(255,255,255,0.10);}',
  '`;',
  '',
].join('\n');
s = s.replace("const SANS = \"'Manrope', system-ui, -apple-system, sans-serif\";",
  "const SANS = \"'Manrope', system-ui, -apple-system, sans-serif\";" + CSS);
n += 1;

writeFileSync(path, s);
console.log(`patched ${n} edits`);
