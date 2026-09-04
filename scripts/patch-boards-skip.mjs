// The doorway holds the boards longer, and says how to leave.
//
// TWO OWNER NOTES, 2026-09-04, one change each.
//
// 1. "needs more time to read the leaderboards once pushed. maybe another 3
//    seconds". FLOOD_SETTLE (1200ms) was set for FIGURES: one number and a
//    label, glanced at rather than read. Ten leaderboard rows across two
//    columns is a list, and a list wants dwelling on. So when the boards are
//    actually on screen the settle runs BOARD_READ longer.
//
// 2. "with a skip or continue to site button". The curtain has always been
//    click-anywhere-to-dismiss and any key has always ended it, but nothing on
//    screen said so, so the only readers who knew were the ones who clicked at
//    random. Holding it three seconds longer without saying how to leave would
//    make that worse, which is why the two land together.
//
// The extension is deliberately NOT applied when FLOOD_HARD is what forced the
// exit: that backstop exists to stop a slow read holding the home hostage, and
// extending the one path that fires when everything is already late is the
// opposite of what it is for.
//
// Adding a focusable control changes the accessibility shape of the screen, so
// aria-hidden moves off the root and onto the words: every word on the curtain
// is repeated in place on the cap underneath, so the button is the one thing on
// it worth announcing. A focusable button INSIDE an aria-hidden subtree is the
// classic version of this bug and is what the root's old comment was guarding
// against.
//
// Anchored, not line-numbered: every anchor must match EXACTLY ONCE or the run
// aborts. Origin moves under this repo constantly.
//
//   node scripts/patch-boards-skip.mjs           # hash the blob, print its sha
//   node scripts/patch-boards-skip.mjs --write   # write the working tree
//
// BASE=<rev> selects what it reads (default FETCH_HEAD).

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const BASE = process.env.BASE || 'FETCH_HEAD';
const PATH = 'app/StageWelcome.jsx';
const WRITE = process.argv.includes('--write');

const sh = (...a) => execFileSync(a[0], a.slice(1), { maxBuffer: 1 << 28 });

function read(path) {
  const raw = sh('git', 'show', `${BASE}:${path}`);
  const want = Number(String(sh('git', 'cat-file', '-s', `${BASE}:${path}`)).trim());
  if (raw.length !== want) throw new Error(`${path}: read ${raw.length} bytes, object is ${want}`);
  return raw.toString('utf8');
}

function sub(text, old, next, label) {
  const n = text.split(old).length - 1;
  if (n !== 1) throw new Error(`${label}: anchor matched ${n} times`);
  return text.replace(old, next);
}

let src = read(PATH);

// ── 1. the constant ──────────────────────────────────────────────────────────
src = sub(src, `const FLOOD_SETTLE = 1200;  // a beat on the finished set, to read it whole
`, `const FLOOD_SETTLE = 1200;  // a beat on the finished set, to read it whole
// THE BOARDS ARE READ, NOT GLANCED AT (owner, 2026-09-04: "needs more time to
// read the leaderboards once pushed. maybe another 3 seconds"). FLOOD_SETTLE
// was set for figures, which are one number and a label each; ten leaderboard
// rows across two columns is a list, and the reader is looking for a name in
// it rather than taking in a headline. So the settle runs this much longer
// WHEN THE BOARDS ARE ACTUALLY ON SCREEN, and by exactly what was asked for.
// Not added to the FLOOD_HARD exit: that backstop fires when everything is
// already late, and holding a late screen longer is what it exists to prevent.
const BOARD_READ = 3000;
`, '1 BOARD_READ');

// ── 2. the settle ────────────────────────────────────────────────────────────
src = sub(src, `    goneRef.current = true;
    at(FLOOD_SETTLE, () => {
`, `    goneRef.current = true;
    // ONLY IF THE BOARDS ACTUALLY LANDED. The queue can be cut short by
    // FLOOD_MAX or FLOOD_HARD with the block still unshown, and a screen that
    // never printed a board has nothing extra to read.
    const boardsUp = view.figs.slice(0, shown).some((f) => f.boards);
    at(FLOOD_SETTLE + (boardsUp && !hard ? BOARD_READ : 0), () => {
`, '2 settle');

// ── 3. the root stops being aria-hidden, the words start ─────────────────────
src = sub(src, `    // aria-hidden because every word on it is read again, in place, on the cap
    // underneath, and there is nothing focusable inside it to strand.
    <div
      className={'stw' + (phase ? ' ' + phase : '')}
      aria-hidden="true"
      onClick={finish}
`, `    // THE ROOT IS NOT aria-hidden, THE WORDS ARE. It used to be, because every
    // word on the curtain is read again in place on the cap underneath and
    // there was nothing focusable inside it to strand. The skip control is
    // focusable, and a focusable control inside an aria-hidden subtree is
    // reachable by tab and invisible to the screen reader that just landed on
    // it. So the hiding moved down onto .stw-in and the button is the one
    // thing on this screen worth announcing.
    <div
      className={'stw' + (phase ? ' ' + phase : '')}
      onClick={finish}
`, '3a root');

src = sub(src, `      <div className="stw-in">
`, `      <div className="stw-in" aria-hidden="true">
`, '3b stw-in');

// ── 4. the control ───────────────────────────────────────────────────────────
src = sub(src, `        </div>
      </div>
    </div>
  );
}
`, `        </div>
      </div>
      {/* THE WAY OUT, SAID OUT LOUD. Clicking anywhere has always dismissed
          this screen and so has any key, but nothing on it said so, so the
          readers who knew were the ones who clicked at random. It appears with
          the words rather than with the ramp (\`held\`, at FLOOD_MIN): before the
          wipe there is nothing on screen to skip past, and a way out offered
          before there is anything to leave reads as an apology for the screen.
          It calls finish() directly AND lets the click reach the root's own
          handler; finish() is idempotent behind doneRef, so the double call is
          a no-op rather than something to stop propagating for. */}
      {held ? (
        <button type="button" className="stw-skip" onClick={finish}>
          Continue<b> to the site</b><span aria-hidden="true">{'\\u203A'}</span>
        </button>
      ) : null}
    </div>
  );
}
`, '4 button');

// ── 5. its style ─────────────────────────────────────────────────────────────
src = sub(src, `/* The reader's own row, in the same sky the mark wears. */
.stw-bdr.me b,.stw-bdr.me em{color:#7dd3fc;opacity:1;}
`, `/* The reader's own row, in the same sky the mark wears. */
.stw-bdr.me b,.stw-bdr.me em{color:#7dd3fc;opacity:1;}

/* THE WAY OUT sits in the bottom corner, clear of the ladder, in the ground's
   own ink at low weight. It is an escape rather than a call to action, so it
   never competes with the figures for the eye: no fill worth the name, and the
   one thing it borrows from the rest of the screen is the mono face the labels
   already wear. z-index 3 puts it over the words, which are 2. */
.stw-skip{position:absolute;right:clamp(14px,3vw,28px);bottom:clamp(16px,3.4vh,30px);
  z-index:3;-webkit-appearance:none;appearance:none;
  display:inline-flex;align-items:center;gap:7px;
  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.22);
  border-radius:999px;padding:9px 15px;cursor:pointer;color:#e9edf4;
  font-family:\${MONO};font-size:clamp(9.5px,1.05vw,11px);font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;
  animation:stw-fade .32s both;}
.stw-skip span{font-family:inherit;font-size:1.15em;line-height:1;opacity:.7;
  letter-spacing:0;}
.stw-skip:hover{background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.42);}
.stw-skip:focus-visible{outline:2px solid #7dd3fc;outline-offset:3px;}
`, '5 css');

// ── 6. reduced motion ────────────────────────────────────────────────────────
src = sub(src, `  .stw,.stw-in,.stw-fig,.stw-bds,.stw-b,.stw-b i,.stw-wipe,.stw-lad i,.stw-mark{transition:none !important;animation:none !important;}
`, `  .stw,.stw-in,.stw-fig,.stw-bds,.stw-b,.stw-b i,.stw-wipe,.stw-lad i,.stw-mark,.stw-skip{transition:none !important;animation:none !important;}
`, '6 reduced motion');

// ── 7. the phone: the label shortens rather than wrapping ────────────────────
src = sub(src, `  .stw-figs{margin-top:20px;gap:12px 26px;}
`, `  .stw-figs{margin-top:20px;gap:12px 26px;}
  /* The full label is 20 characters of tracked mono, which is most of a 390px
     screen. On a phone the arrow carries the meaning and the word is enough. */
  .stw-skip{padding:8px 13px;letter-spacing:.12em;}
  .stw-skip b{display:none;}
`, '7 phone');

const out = Buffer.from(src, 'utf8');

if (WRITE) {
  writeFileSync(PATH, out);
  console.log(`wrote ${PATH} (${out.length} bytes)`);
} else {
  const blob = String(execFileSync('git', ['hash-object', '-w', '--stdin'], { input: out })).trim();
  const back = sh('git', 'cat-file', 'blob', blob);
  if (!back.equals(out)) throw new Error('blob does not read back');
  console.log(`${PATH} ${blob} (${out.length} bytes)`);
}
