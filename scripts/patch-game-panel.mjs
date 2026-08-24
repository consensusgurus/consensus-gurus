// patch-game-panel.mjs — mount GamePanel on every daily client (2026-08-24).
//
// Anchored edits, applied to a copy of each file taken from the SAME fetch the
// deploy commit is built on. This is the patch-daily-five.mjs pattern and it is
// here for the same reason: 70 clients is far too many to hand-edit, and a
// hand-edit against the working tree would be splicing onto a stale base.
//
// EVERY ANCHOR MUST MATCH EXACTLY ONCE. Zero means origin moved under us; two
// means the anchor is not specific enough and the patch would land twice. Both
// throw rather than guess. Audited across the roster before it was written: all
// 70 files carry exactly one `import LoftCap`, one `import ReportIssue`, one
// `{focusMode && (` block, and one `className="loft-showchrome"`.
//
// The two edits per file:
//   1. `import GamePanel from '../GamePanel';` after the LoftCap import.
//   2. The `{focusMode && (...)}` block — a wrapper holding the lone "Show
//      overview and more" button — becomes the GamePanel mount. GamePanel
//      renders its own button, always (not only in focus mode), and calls
//      onShow to do what that button did.
//
// `self` and `name` are lifted from the file's own ReportIssue line rather than
// derived from the directory, so the two games whose route differs from their
// registry key (/parker is `park`, /jesters is `jester`) come out right by
// construction. GamePanel resolves either form.
//
// Usage: node scripts/patch-game-panel.mjs <dir-of-extracted-clients>
// where the dir holds <slug>/<Slug>Client.jsx trees extracted from a git blob.

import fs from 'node:fs';
import path from 'node:path';

const MOUNT_COMMENT = `{/* The game's own record, archive and leaderboards, at the foot of the
            page (owner, 2026-08-24). This is the panel that used to open from a
            home-page puzzle tile. GamePanel renders its own button and also
            flips the page out of focus mode on first open, which is all the
            "Show overview and more" control it replaces ever did. */}`;

function once(src, needle, what, file) {
  const n = src.split(needle).length - 1;
  if (n !== 1) throw new Error(`${file}: expected 1 ${what}, found ${n}`);
}

export function patchOne(src, file) {
  once(src, "import LoftCap from '../LoftCap';", 'LoftCap import', file);
  once(src, '{focusMode && (', 'focusMode block', file);
  once(src, 'className="loft-showchrome"', 'showchrome button', file);

  const ri = src.match(/<ReportIssue self="([^"]+)" name="([^"]+)"/);
  if (!ri) throw new Error(`${file}: no ReportIssue self/name to read the game from`);
  const [, self, name] = ri;

  // 1. the import
  let out = src.replace(
    "import LoftCap from '../LoftCap';",
    "import LoftCap from '../LoftCap';\nimport GamePanel from '../GamePanel';",
  );

  // 2. the block. Bounded by its own opening and the `)}` that follows the
  //    wrapper's single closing </div>, so the inline style objects inside it
  //    (which differ file to file) never have to be matched.
  const i = out.indexOf('{focusMode && (');
  const closeDiv = out.indexOf('</div>', i);
  if (closeDiv < 0) throw new Error(`${file}: focusMode block has no closing div`);
  const end = out.indexOf(')}', closeDiv);
  if (end < 0) throw new Error(`${file}: focusMode block has no closing )}`);
  const block = out.slice(i, end + 2);
  if (!block.includes('loft-showchrome')) throw new Error(`${file}: focusMode block is not the showchrome block`);
  if (block.split('</div>').length - 1 !== 1) throw new Error(`${file}: focusMode block has more than one div`);

  // Keep the block's own indentation so the surrounding JSX stays readable.
  const lineStart = out.lastIndexOf('\n', i) + 1;
  const indent = out.slice(lineStart, i);
  const mount = `${MOUNT_COMMENT}\n${indent}<GamePanel self="${self}" name="${name}" onShow={() => setShowChrome(true)} />`;

  out = out.slice(0, i) + mount + out.slice(end + 2);

  once(out, "import GamePanel from '../GamePanel';", 'GamePanel import', file);
  once(out, '<GamePanel self=', 'GamePanel mount', file);
  if (out.includes('loft-showchrome')) throw new Error(`${file}: old showchrome button survived the patch`);
  return { out, self, name };
}

function main() {
  const root = process.argv[2];
  if (!root) { console.error('usage: node scripts/patch-game-panel.mjs <dir>'); process.exit(1); }
  const files = [];
  for (const dir of fs.readdirSync(root)) {
    const d = path.join(root, dir);
    if (!fs.statSync(d).isDirectory()) continue;
    for (const f of fs.readdirSync(d)) {
      if (!f.endsWith('.jsx')) continue;
      const p = path.join(d, f);
      const src = fs.readFileSync(p, 'utf8');
      if (src.includes('className="loft-showchrome"')) files.push(p);
    }
  }
  let n = 0;
  for (const p of files) {
    const src = fs.readFileSync(p, 'utf8');
    const { out, self } = patchOne(src, p);
    fs.writeFileSync(p, out);
    n += 1;
    console.log('patched', path.relative(root, p), '->', self);
  }
  console.log('files patched:', n);
  if (n !== 70) console.warn('WARNING: expected 70 daily clients, patched ' + n);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
