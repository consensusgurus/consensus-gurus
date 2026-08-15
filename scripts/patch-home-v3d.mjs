/* Home v3, going live. Operates on the CURRENT origin state.
 *
 * Owner, 2026-08-15: push this live on main, the arrows do not work for both
 * rows, the rows are not actually broken up (big categories on one row, the
 * subcategories like Sudoku on the second), and Easiest leaderboard should not
 * match the header colour.
 *
 *   node scripts/patch-home-v3d.mjs <indir> <outdir>
 *
 * Reads/writes DailyStrip.jsx and page.js.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [, , IN, OUT] = process.argv;
if (!IN || !OUT) { console.error('usage: patch-home-v3d.mjs <indir> <outdir>'); process.exit(2); }
mkdirSync(OUT, { recursive: true });

let N = 0, SKIP = 0;
/* `mark` is what to test for "already applied". It exists because the obvious
 * test, does the file already contain the replacement, is WRONG whenever the
 * replacement is a substring of what it replaces: removing a line from a chain
 * of .concat() calls leaves a replacement that was always present, so the edit
 * skips itself and nothing happens. That is exactly why the filter strip never
 * actually split into two rows. */
function sub(src, find, repl, label, mark = null) {
  if (mark ? src.includes(mark) : (repl !== '' && src.includes(repl))) { SKIP += 1; return src; }
  const n = src.split(find).length - 1;
  if (n !== 1) throw new Error(`ANCHOR ${label}: expected 1, found ${n}`);
  N += 1;
  return src.split(find).join(repl);
}
function del_(src, text, label) {
  if (!src.includes(text)) { SKIP += 1; return src; }
  N += 1;
  return src.split(text).join('');
}

let s = readFileSync(join(IN, 'DailyStrip.jsx'), 'utf8');

/* ── 1. the circuits really do leave row one ──────────────────────────────
   They were still in it: the edit that was supposed to remove them replaced a
   chain of .concat() calls with the same chain minus one line, and since that
   is a substring of the original the guard read it as already applied. Deleting
   the line outright has no such ambiguity. */
s = del_(s, `            // The circuits, on the same strip and driving the same state. A
            // category says what a game IS, a circuit what SKILL it exercises,
            // so they are two axes over one list rather than two controls.
            .concat(cats ? CIRCUITS.map(([n]) => ['circuit:' + n, n]) : [])
`, 'DS:row1-drop-circuits');

/* ── 2. row two gets its own arrows ───────────────────────────────────────
   The chevrons are driven by a ref, a bit of state and a scroll listener, all
   of which existed once, for one strip. Row two needs its own of each: one
   listener cannot describe two scrollers. */
s = sub(s,
  `  const filtRef = useRef(null);
  const [filtMore, setFiltMore] = useState({ l: false, r: false });`,
  `  const filtRef = useRef(null);
  const [filtMore, setFiltMore] = useState({ l: false, r: false });
  // Row two of the filter strip, the circuits. Its own ref and its own state,
  // because the overflow of one scroller says nothing about the other.
  const filt2Ref = useRef(null);
  const [filt2More, setFilt2More] = useState({ l: false, r: false });`,
  'DS:row2-state', 'const filt2Ref');

s = sub(s,
  `  const nudgeFilt = (dir) => {
    const el = filtRef.current;`,
  `  useEffect(() => {
    const el = filt2Ref.current;
    if (!el) return undefined;
    const update = () => {
      const more = el.scrollWidth - el.clientWidth;
      setFilt2More({ l: el.scrollLeft > 2, r: more > 2 && el.scrollLeft < more - 2 });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [slate, cats]);
  const nudgeFilt2 = (dir) => {
    const el = filt2Ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(120, Math.round(el.clientWidth * 0.7)), behavior: 'smooth' });
  };
  const nudgeFilt = (dir) => {
    const el = filtRef.current;`,
  'DS:row2-effect', 'const nudgeFilt2');

/* Wrap row two so the arrows have something to sit on, and hang them off it. */
s = sub(s,
  `          <div className="sl-filt sl-filt2" role="tablist" aria-label="Filter by circuit">`,
  `          <div className={\`sl-filtw sl-filtw2\${filt2More.l ? ' ml' : ''}\${filt2More.r ? ' mr' : ''}\`}>
          <div className="sl-filt sl-filt2" ref={filt2Ref} role="tablist" aria-label="Filter by circuit">`,
  'DS:row2-wrap-open', 'sl-filtw2');

s = sub(s,
  `              >{n}</button>
            ))}
          </div>
        ) : null}`,
  `              >{n}</button>
            ))}
          </div>
          {filt2More.l ? (
            <button type="button" className="sl-fnav l" onClick={() => nudgeFilt2(-1)} aria-label="Scroll the circuits left">
              <ChevronLeft size={14} strokeWidth={3} />
            </button>
          ) : null}
          {filt2More.r ? (
            <button type="button" className="sl-fnav r" onClick={() => nudgeFilt2(1)} aria-label="Scroll the circuits right">
              <ChevronRight size={14} strokeWidth={3} />
            </button>
          ) : null}
          </div>
        ) : null}`,
  'DS:row2-arrows');

/* The fades are painted from --accent, which is row one's navy. Row two is a
   lighter blue, so it needs its own or the fade shows as a dark smear on it. */
s = sub(s,
  `        .dhome.cats .sl-filt2{background:#2c4fa8;border-top:1px solid #16306e;}`,
  `        .dhome.cats .sl-filtw2{position:relative;flex:none;}
        .dhome.cats .sl-filt2{background:#2c4fa8;border-top:1px solid #16306e;}
        .dhome.cats .sl-filtw2.ml::before{background:linear-gradient(to right,#2c4fa8 0,#2c4fa8 30px,rgba(44,79,168,0) 100%);}
        .dhome.cats .sl-filtw2.mr::after{background:linear-gradient(to left,#2c4fa8 0,#2c4fa8 30px,rgba(44,79,168,0) 100%);}`,
  'DS:row2-fades');

/* ── 3. Easiest leaderboard stops wearing the header's navy ───────────────
   It was --blue-dark, which is the same value as the masthead and the panel
   heads, so the middle card read as a piece of chrome that had slipped into the
   cap rather than as one of the three picks. */
s = sub(s,
  `        .cb-card.easy,.cb-card.lead{background:var(--blue-dark);color:var(--white);}`,
  `        .cb-card.easy,.cb-card.lead{background:var(--blue-deep);color:var(--white);}`,
  'DS:easy-colour');

/* ── 5. the state chips carry their colour ───────────────────────────────
   Ready, Paused, Failed and Done are the four things the header pills already
   name in colour, so the chips take the same dots. The colour is the fastest
   read on the strip and it costs nothing: without it the four state chips look
   like four more categories. */
s = sub(s,
  `            .concat(cats ? [['ready', 'Ready ' + nReadyAll]] : [])
            .concat(cats && nProgAll ? [['paused', 'Paused ' + nProgAll]] : [])
            .concat(cats && nFailAll ? [['failed', 'Failed ' + nFailAll]] : [])
            .concat(cats && nDoneAll ? [['done', 'Done ' + nDoneAll]] : [])`,
  `            .concat(cats ? [['ready', <><i className="sl-sdot rdy" />Ready {nReadyAll}</>]] : [])
            .concat(cats && nProgAll ? [['paused', <><i className="sl-sdot prg" />Paused {nProgAll}</>]] : [])
            .concat(cats && nFailAll ? [['failed', <><i className="sl-sdot fal" />Failed {nFailAll}</>]] : [])
            .concat(cats && nDoneAll ? [['done', <><i className="sl-sdot dne" />Done {nDoneAll}</>]] : [])`,
  'DS:state-dots', 'sl-sdot');

s = sub(s,
  `        .dhome.cats .sl-filt button{font-size:10px;letter-spacing:.06em;padding:7px 11px;}`,
  `        .dhome.cats .sl-filt button{font-size:10px;letter-spacing:.06em;padding:7px 11px;display:inline-flex;align-items:center;gap:6px;}
        /* The same four colours the header pills use, so the strip and the
           header say the same thing the same way. */
        .sl-sdot{width:6px;height:6px;border-radius:50%;flex:none;display:block;}
        .sl-sdot.rdy{background:#9dbcf7;}
        .sl-sdot.prg{background:var(--gold);}
        .sl-sdot.fal{background:#f08a8a;}
        .sl-sdot.dne{background:#5ad48f;}`,
  'DS:state-dot-css');

writeFileSync(join(OUT, 'DailyStrip.jsx'), s);

/* ── 4. live on main ──────────────────────────────────────────────────────
   The preview route stays for now so the two can be compared side by side and
   so there is somewhere to try the next change; / simply renders the same
   client with the same flag. */
let p = readFileSync(join(IN, 'page.js'), 'utf8');
p = sub(p,
  `      <QuizHomeClient />`,
  `      <QuizHomeClient variant="v3" />`,
  'PAGE:go-live');
writeFileSync(join(OUT, 'page.js'), p);

console.log(`patch-home-v3d: ${N} edits, ${SKIP} already present`);
