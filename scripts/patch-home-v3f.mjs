/* Home: the Loft foot gets its space, and the duel says what it does.
 *
 * Owner, 2026-08-15: give Quiz of the Day more room so it does not look
 * scrunched, there is still too much space above it, and the button should read
 * Challenge your rival rather than Duel.
 *
 *   node scripts/patch-home-v3f.mjs <indir> <outdir>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [, , IN, OUT] = process.argv;
if (!IN || !OUT) { console.error('usage: patch-home-v3f.mjs <indir> <outdir>'); process.exit(2); }
mkdirSync(OUT, { recursive: true });

let N = 0, SKIP = 0;
function sub(src, find, repl, label, mark = null) {
  if (mark ? src.includes(mark) : (repl !== '' && src.includes(repl))) { SKIP += 1; return src; }
  const n = src.split(find).length - 1;
  if (n !== 1) throw new Error(`ANCHOR ${label}: expected 1, found ${n}`);
  N += 1;
  return src.split(find).join(repl);
}

let h = readFileSync(join(IN, 'HomeRails.jsx'), 'utf8');

/* CHALLENGE YOUR RIVAL, and it is a full-width button under the name rather
   than a chip beside it. "Duel" is what the thing is called, not what pressing
   it does, and at 340px a chip that says the whole sentence leaves the name
   nowhere to go. Stacking gives the sentence its own line and gives the foot
   the height the panel above it was wasting. */
h = sub(h,
  `              <span className="hrb-dgo">Duel</span>`,
  `              <span className="hrb-dgo">Challenge your rival</span>`,
  'HR:duel-label');

/* THE FOOT TAKES THE SLACK. The pane above is flex:1 and the foot is flex:none,
   so every pixel the foot claims is a pixel the leaderboard stops padding: the
   emptiness above was the board stretching ten rows down a panel built for
   more, and the answer is not to stretch them further but to give the space to
   something that wants it. The photo roughly doubles, which is also what stops
   Quiz of the Day looking scrunched: at 104px it was a letterbox with two lines
   of type crammed into the bottom of it. */
h = sub(h,
  `          .hrb-qotd{display:flex;flex-direction:column;justify-content:flex-end;gap:2px;min-height:104px;padding:11px 13px;text-decoration:none;`,
  `          .hrb-qotd{display:flex;flex-direction:column;justify-content:flex-end;gap:3px;min-height:196px;padding:14px 15px;text-decoration:none;`,
  'HR:qotd-taller');

h = sub(h,
  `          .hrb-qt{font-size:15px;font-weight:800;line-height:1.25;color:var(--white);}`,
  `          .hrb-qt{font-size:19px;font-weight:800;line-height:1.2;letter-spacing:-.01em;color:var(--white);}`,
  'HR:qotd-title');

h = sub(h,
  `          .hrb-duel{display:flex;align-items:center;gap:10px;padding:10px 13px;text-decoration:none;background:var(--accent-soft);border-top:1px solid var(--border);}`,
  `          .hrb-duel{display:flex;flex-direction:column;align-items:stretch;gap:9px;padding:12px 13px;text-decoration:none;background:var(--accent-soft);border-top:1px solid var(--border);}`,
  'HR:duel-stack');

h = sub(h,
  `          .hrb-dgo{margin-left:auto;flex:none;background:var(--blue);color:var(--white);border-radius:7px;padding:8px 15px;font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;}`,
  `          .hrb-dgo{display:block;text-align:center;background:var(--blue);color:var(--white);border-radius:7px;padding:11px 15px;font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;}
          .hrb-duel:hover .hrb-dgo{background:var(--cta-hover);}`,
  'HR:duel-button');

writeFileSync(join(OUT, 'HomeRails.jsx'), h);
console.log(`patch-home-v3f: ${N} edits, ${SKIP} already present`);
