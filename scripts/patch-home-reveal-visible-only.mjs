#!/usr/bin/env node
// THE REVEAL IS ARMED ONLY WHEN THE PAGE IS VISIBLE (2026-09-01, the same day
// the reveal shipped).
//
// A CSS entrance animation holds its FROM state for as long as its clock has
// not advanced, and a browser does not advance that clock in a hidden tab. So
// on a page loaded in the background every one of these sections sat at
// opacity 0 with playState "running" and currentTime 0, indefinitely. For a
// reader that is self-healing and even correct, the fade plays the moment they
// look at the tab. For everything else that reads a page it is not: both
// browser harnesses available here report document.visibilityState === hidden,
// so the live home came back blank from every automated check, which in a repo
// whose first rule is to verify on the live site is a defect in itself.
//
// So the animation is scoped to an attribute the component sets only when the
// document is visible AT MOUNT. A page that loads hidden gets no animation at
// all and renders its content plainly, which is the right answer twice over:
// nobody watched it arrive, and anything reading it sees what is there.
// Deliberately NOT re-armed on a later visibilitychange, which would fade in
// content that has been sitting in the DOM for a minute.
//
// Usage: node scripts/patch-home-reveal-visible-only.mjs <file>
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('usage: patch-home-reveal-visible-only.mjs <StageToday.jsx>'); process.exit(1); }
let src = readFileSync(file, 'utf8');

let n = 0;
function edit(label, find, replace) {
  const parts = src.split(find);
  if (parts.length !== 2) throw new Error(`anchor ${parts.length - 1} match(es) (need exactly 1): ${label}`);
  src = parts[0] + replace + parts[1];
  n += 1;
}

// The effect. Placed beside the other mount-time effects, right after the one
// that reads the saved display name.
edit('arm effect',
`  useEffect(() => { setWho(savedIdentity().username || ''); }, []);`,
`  useEffect(() => { setWho(savedIdentity().username || ''); }, []);
  // ARM THE ARRIVAL REVEAL, and only for a page someone is actually looking at.
  // A hidden tab does not advance an animation clock, so a section that mounts
  // there holds the FROM state (opacity 0) for as long as the tab stays in the
  // background: harmless for a reader, since the fade plays when they look, but
  // it means every automated read of this page comes back blank. Without the
  // attribute the animation rules do not match at all and the content simply
  // renders. Not re-armed on a later visibilitychange: fading in a section that
  // has been sitting in the DOM for a minute is worse than not fading it.
  useEffect(() => {
    if (typeof document === 'undefined' || document.visibilityState !== 'visible') return undefined;
    const root = document.documentElement;
    root.setAttribute('data-sty-anim', '1');
    return () => root.removeAttribute('data-sty-anim');
  }, []);`);

// The CSS scope.
edit('scope rev',
`.sty-rev{animation:sty-in .34s cubic-bezier(.2,.7,.3,1) both;}`,
`[data-sty-anim] .sty-rev{animation:sty-in .34s cubic-bezier(.2,.7,.3,1) both;}`);

edit('scope revr',
`.sty-revr{animation:sty-in .3s cubic-bezier(.2,.7,.3,1) both;
  animation-delay:calc(min(var(--i,0),9) * 26ms);}`,
`[data-sty-anim] .sty-revr{animation:sty-in .3s cubic-bezier(.2,.7,.3,1) both;
  animation-delay:calc(min(var(--i,0),9) * 26ms);}`);

edit('scope reduced motion',
`@media (prefers-reduced-motion:reduce){
  .sty-rev,.sty-revr{animation:none;}
}`,
`@media (prefers-reduced-motion:reduce){
  [data-sty-anim] .sty-rev,[data-sty-anim] .sty-revr{animation:none;}
}`);

// And say so where the rule is written down.
edit('css note',
`   NO APOSTROPHES anywhere in this stylesheet: it is a text child of a style
   element, so React escapes them. */`,
`   ARMED BY [data-sty-anim], which the component sets only when the document is
   VISIBLE at mount. A browser does not advance an animation clock in a hidden
   tab, so without that gate a page loaded in the background holds every one of
   these at opacity 0 indefinitely and reads as blank to anything but a reader
   who focuses the tab. Unarmed, these rules do not match and the content simply
   renders.
   NO APOSTROPHES anywhere in this stylesheet: it is a text child of a style
   element, so React escapes them. */`);

writeFileSync(file, src);
console.log(`patched ${n} anchors -> ${file}`);
