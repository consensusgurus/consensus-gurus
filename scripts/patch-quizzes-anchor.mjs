// GIVE THE HOME'S QUIZZES SECTION A NAME, AND MAKE ARRIVING ON IT WORK.
//
//   node scripts/patch-quizzes-anchor.mjs
//
// A quiz's end card used to send the reader to /quizzes, the quiz hub. Owner,
// 2026-09-04: it should land them on the QUIZZES SECTION of the daily puzzles
// page, which is where they came from. Two edits, and the second is the one
// that is easy to miss.
//
// 1. THE SECTION HAD NO id. Every other section on that page has one
//    (sty-standing, sty-board, sty-live) because the cap links to them; the
//    quizzes section was never linked to, so it was never named.
//
// 2. ⚠️ THE BROWSER'S OWN HASH SCROLL CANNOT WORK HERE, and a link that silently
//    lands at the top of the page reads as broken rather than as slow. The
//    browser scrolls to a hash at LOAD, and this whole page is a client
//    component whose sections do not exist until React has rendered, so there
//    is nothing with that id in the document at the moment it looks. The
//    section is lazy on top of that: its content waits on an
//    IntersectionObserver, so scrolling to it is also what fills it in.
//
//    So the page looks for the element itself, over a few seconds of animation
//    frames rather than once, and gives up rather than scrolling a page the
//    reader has since started reading.
//
// WRITTEN AS AN ANCHORED SCRIPT rather than a whole-file splice because
// app/today/StageToday.jsx is 2,495 lines and moves several times a day: it
// gained 203 lines from five commits between this session's clone and its push,
// and a splice of the copy read at the start would have erased all five. Each
// anchor must match EXACTLY ONCE -- zero means origin moved under the anchor,
// two means it would land twice -- and both throw rather than guessing.
import { readFileSync, writeFileSync } from 'node:fs';

const PATH = 'app/today/StageToday.jsx';
let s = readFileSync(PATH, 'utf8');
let n = 0;

function edit(name, anchor, to) {
  const hits = s.split(anchor).length - 1;
  if (hits !== 1) throw new Error(`anchor "${name}" matched ${hits} times, expected exactly 1`);
  s = s.replace(anchor, to);
  n += 1;
  console.log(`  + ${name}`);
}

if (/id="sty-quizzes"/.test(s)) {
  console.log('already applied; nothing to do');
} else {
  edit('the quizzes section takes a name',
    `        <section className="sty-cat sty-qsec" style={{ '--cc': 'var(--stg-ink2)' }} ref={footRef}>`,
    `        {/* THE ANCHOR. A quiz end card sends the reader back here rather than
            to the separate quiz hub, so this section needs a name to land on;
            it is the only one of the page's sections that had none. */}
        <section id="sty-quizzes" className="sty-cat sty-qsec" style={{ '--cc': 'var(--stg-ink2)' }} ref={footRef}>`);

  // The effect goes ABOVE the nearFoot fetch rather than replacing anything, so
  // the insertion is anchored on the two lines that open that effect.
  const OPEN = `  useEffect(() => {
    if (!nearFoot) return undefined;`;
  const hits = s.split(OPEN).length - 1;
  if (hits !== 1) throw new Error(`anchor "hash effect" matched ${hits} times, expected exactly 1`);
  s = s.replace(OPEN, `  // ── ARRIVING ON A SECTION BY HASH ───────────────────────────────────────
  //
  // A quiz end card sends the reader to /#sty-quizzes. The browser's own hash
  // scroll happens at load, and this whole page is a client component whose
  // sections do not exist until React has rendered, so the jump lands at the
  // top of the page every time and looks like a broken link rather than a slow
  // one. The section is then LAZY on top of that: its content waits on an
  // IntersectionObserver, so scrolling to it is also what fills it in.
  //
  // So: on mount, look for the element the hash names, and keep looking for a
  // short while rather than once. Capped at ~4s of animation frames, because a
  // page that scrolls itself a minute after it opened is worse than one that
  // never did. Runs only when a hash is actually present, so a plain visit is
  // untouched, and the id pattern is checked so nothing else can steer it.
  useEffect(() => {
    let hash = '';
    try { hash = String(window.location.hash || '').slice(1); } catch (e) { return undefined; }
    if (!hash || !/^sty-[a-z-]+$/.test(hash)) return undefined;
    let timer = 0;
    let done = false;
    const started = Date.now();
    const tick = () => {
      if (done) return;
      const el = document.getElementById(hash);
      // ⚠️ THE ARRIVAL CURTAIN LOCKS THE BODY WHILE IT PLAYS, so a scroll
      // issued under it does not merely land late, it does nothing at all and
      // the attempt is spent. A reader arriving here on a day they have not
      // seen the welcome would land at the top of the page, which is the exact
      // failure this effect exists to prevent. So wait for the lock to lift.
      let locked = false;
      try { locked = getComputedStyle(document.body).overflow === 'hidden'; } catch (e) {}
      if (el && !locked) {
        const before = window.scrollY;
        try { el.scrollIntoView({ block: 'start' }); } catch (e) { el.scrollIntoView(); }
        // Landing is CONFIRMED rather than assumed: the page either moved or
        // the section is already at the top. Anything else is a scroll that
        // did not take, and the loop is what gets another go at it.
        if (window.scrollY !== before || Math.abs(el.getBoundingClientRect().top) < 4) { done = true; return; }
      }
      if (Date.now() - started > 12000) return;
      timer = setTimeout(tick, 120);
    };
    // ⚠️ setTimeout, NOT requestAnimationFrame. A HIDDEN TAB RUNS NO rAF, so an
    // rAF loop never ticks once for a link opened in a background tab, which is
    // also why every automated check of this page reported it as not scrolling.
    // A timer runs either way, and this loop is cheap enough not to care.
    timer = setTimeout(tick, 0);
    // A reader who starts scrolling has taken over. Yanking them back to a
    // section they just left is worse than never having jumped.
    const stop = () => { done = true; };
    window.addEventListener('wheel', stop, { passive: true, once: true });
    window.addEventListener('touchstart', stop, { passive: true, once: true });
    window.addEventListener('keydown', stop, { once: true });
    return () => {
      done = true;
      clearTimeout(timer);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('keydown', stop);
    };
  }, []);

${OPEN}`);
  n += 1;
  console.log('  + hash effect');

  writeFileSync(PATH, s);
  console.log(`patched ${n} edits in ${PATH}`);
}
