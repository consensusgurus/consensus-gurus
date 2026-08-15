/* Home v3: the Loft gets a foot, the strip fills its width, one arrow on
 * mobile, and Sixes joins Sudoku. Operates on the CURRENT origin state.
 *
 *   node scripts/patch-home-v3e.mjs <indir> <outdir>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [, , IN, OUT] = process.argv;
if (!IN || !OUT) { console.error('usage: patch-home-v3e.mjs <indir> <outdir>'); process.exit(2); }
mkdirSync(OUT, { recursive: true });

let N = 0, SKIP = 0;
function sub(src, find, repl, label, mark = null) {
  if (mark ? src.includes(mark) : (repl !== '' && src.includes(repl))) { SKIP += 1; return src; }
  const n = src.split(find).length - 1;
  if (n !== 1) throw new Error(`ANCHOR ${label}: expected 1, found ${n}`);
  N += 1;
  return src.split(find).join(repl);
}

/* ══ DailyStrip ═══════════════════════════════════════════════════════════ */
let s = readFileSync(join(IN, 'DailyStrip.jsx'), 'utf8');

/* Sixes is the daily mini sudoku, so it belongs in Sudoku. It was left out of
   the owner's list, which gave that circuit four members and its own tagline
   says otherwise. */
s = sub(s,
  `  ['Sudoku', ['Suds', 'Quilt', 'Cages', 'Sando']],`,
  `  ['Sudoku', ['Suds', 'Quilt', 'Cages', 'Sando', 'Sixes']],`,
  'DS:sixes-sudoku');

/* The chips SPREAD to fill the strip. flex:1 0 auto, not 1 1 auto: grow into
   spare width, never shrink below the label. Row one has room and now uses it;
   row two overflows and still scrolls, because a no-shrink item cannot be
   squeezed into a line it does not fit. */
s = sub(s,
  `        .dhome.cats .sl-filt button{font-size:10px;letter-spacing:.06em;padding:7px 11px;display:inline-flex;align-items:center;gap:6px;}`,
  `        .dhome.cats .sl-filt button{font-size:10px;letter-spacing:.06em;padding:7px 11px;display:inline-flex;align-items:center;justify-content:center;gap:6px;flex:1 0 auto;}`,
  'DS:chips-spread');

/* ONE ARROW ON THE PHONE, moving both rows. Two sets of chevrons on a 390px
   screen is two controls doing nearly the same job, and they disagree the
   moment one row runs out before the other. Row one's pair drives both, each
   row stopping at its own end, and row two's own pair is hidden. Gated with
   matchMedia at CLICK time rather than on a rendered flag, so the markup is
   identical on the server and the desktop behaviour is untouched. */
s = sub(s,
  `  const nudgeFilt = (dir) => {
    const el = filtRef.current;`,
  `  const nudgeFilt = (dir) => {
    try {
      if (typeof window !== 'undefined' && window.matchMedia('(max-width:900px)').matches) {
        const e2 = filt2Ref.current;
        if (e2) e2.scrollBy({ left: dir * Math.max(120, Math.round(e2.clientWidth * 0.7)), behavior: 'smooth' });
      }
    } catch (e) {}
    const el = filtRef.current;`,
  'DS:mobile-one-arrow', "window.matchMedia('(max-width:900px)').matches) {\n        const e2");

/* Row one's chevrons have to APPEAR whenever either row can still move, or the
   combined control disappears while row two is still mid-scroll. */
s = sub(s,
  `        <div className={\`sl-filtw\${filtMore.l ? ' ml' : ''}\${filtMore.r ? ' mr' : ''}\`}>`,
  `        <div className={\`sl-filtw\${(filtMore.l || (phone && filt2More.l)) ? ' ml' : ''}\${(filtMore.r || (phone && filt2More.r)) ? ' mr' : ''}\`}>`,
  'DS:merged-nav');
s = sub(s,
  `        {filtMore.l ? (
          <button type="button" className="sl-fnav l" onClick={() => nudgeFilt(-1)}`,
  `        {(filtMore.l || (phone && filt2More.l)) ? (
          <button type="button" className="sl-fnav l" onClick={() => nudgeFilt(-1)}`,
  'DS:merged-nav-l');
s = sub(s,
  `        {filtMore.r ? (
          <button type="button" className="sl-fnav r" onClick={() => nudgeFilt(1)}`,
  `        {(filtMore.r || (phone && filt2More.r)) ? (
          <button type="button" className="sl-fnav r" onClick={() => nudgeFilt(1)}`,
  'DS:merged-nav-r');

s = sub(s,
  `        .dhome.cats .sl-filtw2{position:relative;flex:none;}`,
  `        .dhome.cats .sl-filtw2{position:relative;flex:none;}
        /* Row two keeps its own chevrons on desktop only; on the phone row one
           drives both and a second pair would just be a second control. */
        @media(max-width:900px){.dhome.cats .sl-filtw2 .sl-fnav{display:none;}}`,
  'DS:hide-row2-nav-phone');

writeFileSync(join(OUT, 'DailyStrip.jsx'), s);

/* ══ HomeRails: the Loft gets a foot ══════════════════════════════════════ */
let h = readFileSync(join(IN, 'HomeRails.jsx'), 'utf8');

h = sub(h,
  `  me,
  myCats = [],`,
  `  me,
  myCats = [],
  qotd = null,`,
  'HR:qotd-prop');

/* THE FOOT (owner, 2026-08-15). The Loft's boards are a list of names, and a
   list of names is as tall as it is: on a quiet day it left most of the panel
   empty, and stretching the rows to fill only made the emptiness taller. A foot
   fixes it the honest way, by putting something there. Quiz of the Day carries
   the panel's only photograph, and the duel is the one thing on this page that
   asks the reader to do something to somebody else, so it earns the last word.
   Outside the tab panes on purpose: it is true whichever board you are reading. */
h = sub(h,
  `          {bTab === 'you' ? (
            <div className="hrb-pane hrb-you">`,
  `          {bTab === 'you' ? (
            <div className="hrb-pane hrb-you">`,
  'HR:noop', 'hrb-foot');

h = sub(h,
  `        </section>
      </>
    );
  }

  if (side === 'left') {`,
  `          <div className="hrb-foot">
            {qotd ? (
              <a className="hrb-qotd" href={\`/quiz/\${qotd.id}\`}
                style={qotd.hero ? { backgroundImage: \`url(\${qotd.hero})\`, backgroundPosition: qotd.pos || 'center' } : undefined}>
                <span className="hrb-qe">{qotd.eyebrow}</span>
                <span className="hrb-qt">{qotd.title}</span>
              </a>
            ) : null}
            <Link href={rival ? duelHref : '/duel/new'} className="hrb-duel">
              <span className="hrb-dtx">
                <span className="hrb-de">{rival ? (rival.behind ? 'Right behind you' : 'Next one ahead') : 'Head to head'}</span>
                <span className="hrb-dn">{rival ? rival.username : 'Start a duel'}</span>
              </span>
              <span className="hrb-dgo">Duel</span>
            </Link>
          </div>
        </section>
      </>
    );
  }

  if (side === 'left') {`,
  'HR:foot');

h = sub(h,
  `          .hrb-body{min-height:0;overflow-y:auto;}`,
  `          .hrb-body{min-height:0;overflow-y:auto;}
          /* The foot. flex:none so it never gives up its height to the board
             above it, which is the whole point of it being here. */
          .hrb-foot{flex:none;border-top:1px solid var(--border);}
          .hrb-qotd{display:flex;flex-direction:column;justify-content:flex-end;gap:2px;min-height:104px;padding:11px 13px;text-decoration:none;
            background-color:var(--blue-dark);background-size:cover;background-position:center;position:relative;isolation:isolate;}
          /* The scrim, not a filter on the image: the photo keeps its colour
             and only the bottom third darkens, which is where the type sits. */
          .hrb-qotd::after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(to top,rgba(10,20,45,.88),rgba(10,20,45,.35) 55%,rgba(10,20,45,.12));}
          .hrb-qe{font-size:8.5px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:#bcd3ff;}
          .hrb-qt{font-size:15px;font-weight:800;line-height:1.25;color:var(--white);}
          .hrb-duel{display:flex;align-items:center;gap:10px;padding:10px 13px;text-decoration:none;background:var(--accent-soft);border-top:1px solid var(--border);}
          .hrb-duel:hover{background:var(--white);}
          .hrb-dtx{display:flex;flex-direction:column;min-width:0;}
          .hrb-de{font-size:8.5px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--slate);}
          .hrb-dn{font-size:14px;font-weight:800;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
          .hrb-dgo{margin-left:auto;flex:none;background:var(--blue);color:var(--white);border-radius:7px;padding:8px 15px;font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;}`,
  'HR:foot-css');

writeFileSync(join(OUT, 'HomeRails.jsx'), h);

/* ══ QuizHomeClient: hand it the quiz ═════════════════════════════════════ */
let q = readFileSync(join(IN, 'QuizHomeClient.jsx'), 'utf8');
q = sub(q,
  `              me={me}
              myCats={myCats}`,
  `              me={me}
              myCats={myCats}
              qotd={qotd}`,
  'QH:qotd-prop');
writeFileSync(join(OUT, 'QuizHomeClient.jsx'), q);

console.log(`patch-home-v3e: ${N} edits, ${SKIP} already present`);
