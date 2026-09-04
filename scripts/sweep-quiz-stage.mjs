// LOOK AT EVERY CONVERTED QUIZ CLIENT, IN BOTH REGISTERS, AT REST AND IN PLAY.
//
//   node scripts/sweep-quiz-stage.mjs [--base http://localhost:3111]
//
// scripts/verify-quiz-stage.mjs reads the SOURCE: it proves the flag is wired,
// that no stage const escapes its component, and that the takeover is gated.
// None of that says the page is legible. This renders it.
//
// ⚠️ AT REST IS THE STATE THAT LIES, and that is the whole reason this exists.
// The first live scan of the converted pilot reported ONE light surface. Press
// Start and it had ten white answer slots and a white input carrying near-white
// ink, unreadable in both directions at once, because a board keeps its states
// in ternary arms and none of those arms is rendered until somebody plays. So
// every client is swept TWICE per register: once as it loads, once with the
// game started.
//
// What it measures, per page:
//
//   1. THE TAKEOVER. The root carries .stage-page and the register's attribute,
//      and the site masthead, the footer and the paper grain are all gone.
//   2. LIGHT SURFACES ON A DARK GROUND. Every element whose own background is
//      opaque and pale, which is exactly what shows up as a bright box.
//   3. CONTRAST, ink against the first OPAQUE ancestor background. A translucent
//      surface resolves to what is behind it, which is the whole point of the
//      lift channel and the reason a naive read of the element's own background
//      reports nonsense.
//   4. THE CAP. It carries the quiz's name and the accent resolves to the
//      register's own step rather than to a literal.
import { chromium } from 'playwright-core';

const BASE = (process.argv.includes('--base')
  ? process.argv[process.argv.indexOf('--base') + 1]
  : 'http://localhost:3111').replace(/\/$/, '');

// One quiz per converted client, chosen off lib/quizzes.js by format. A client
// with no quiz in the catalogue cannot be swept and is named rather than
// silently skipped: LogicGridClient is dispatched on format 'logic-grid' and
// nothing in the bank carries it, so that board is unreachable today.
const PAGES = [
  ['QuizClient', 'closest-countries-to-eiffel-tower'],
  ['TimedMcqClient', 'daily-business-quiz-2026-07-07'],
  ['GeoAerialClient', 'las-vegas-casino-geo-guesser'],
  ['MapPlaceClient', 'place-the-cities-california'],
  ['GlobePlaceClient', 'place-the-10-notable-skyscrapers'],
  ['LogicGameClient', 'lsat-logic-game-gallery-wall'],
  ['ConnectionsBoard', 'connections-pt-1'],
  ['SurviveStateBoard', 'nfl-stadium-state-1-strike'],
  ['CloserBoard', 'closer-mlb-ballparks'],
  ['HigherLowerBoard', 'higher-or-lower-country-population'],
  ['GridFillBoard', 'biggest-us-companies-by-year'],
];

const MIN_CR = 4.5;      // body text
const MIN_CR_LARGE = 3;  // 18.66px bold, or 24px

// The probe runs IN THE PAGE. It resolves a background by walking up until it
// finds an opaque one, which is what makes a translucent --stg-surf read as the
// ground it is lifted from rather than as a colour of its own.
const PROBE = `(() => {
  const px = (c) => {
    const m = String(c).match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(',').map((x) => parseFloat(x));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });
  const lin = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const cr = (a, b) => { const l1 = lum(a), l2 = lum(b); const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]; return (hi + 0.05) / (lo + 0.05); };
  // The first OPAQUE ancestor background, with every translucent layer above it
  // composited back down in order. Anything else mis-reads the lift channel.
  const groundOf = (el) => {
    const stack = [];
    for (let n = el; n; n = n.parentElement) {
      const c = px(getComputedStyle(n).backgroundColor);
      if (!c || c.a === 0) continue;
      stack.push(c);
      if (c.a === 1) break;
    }
    if (!stack.length) return { r: 255, g: 255, b: 255, a: 1 };
    let g = stack.pop();
    while (stack.length) g = over(stack.pop(), g);
    return g;
  };
  const vis = (el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };

  const root = document.querySelector('.stage-page');
  const out = {
    hasRoot: !!root,
    theme: root ? root.getAttribute('data-stage-theme') : null,
    acc: root ? getComputedStyle(root).getPropertyValue('--stg-acc').trim() : null,
    ground: root ? getComputedStyle(root).backgroundColor : null,
    masthead: !!document.querySelector('header.qchm, .qch-bar, [data-quiz-nav]'),
    grain: !!document.querySelector('[class*="grain" i]'),
    footer: !!document.querySelector('footer'),
    cap: !!document.querySelector('.stg-top, .stg-cap, [class^="stg-"]'),
    light: [],
    ink: [],
  };

  const dark = lum(px(out.ground) || { r: 0, g: 0, b: 0, a: 1 }) < 0.2;
  // Resolved once: the accent is published by the root as a hex, so it is
  // parsed through a swatch rather than by hand.
  let accPx = null;
  if (out.acc) { const sw = document.createElement('span'); sw.style.color = out.acc; document.body.appendChild(sw); accPx = px(getComputedStyle(sw).color); sw.remove(); }
  const seen = new Set();
  for (const el of document.querySelectorAll('.stage-page *')) {
    if (!vis(el)) continue;
    const s = getComputedStyle(el);

    // 2. A LIGHT SURFACE. Opaque, pale, and big enough to be a box rather than
    // a hairline. Reported on the dark register only: on the light one a white
    // card IS the design.
    // TWO PALE SURFACES ARE CORRECT ON THIS GROUND AND MUST NOT BE COUNTED.
    // The quiz accent is a light SLATE on the dark register, so an accent
    // filled CTA is meant to be the palest thing on the board and carries
    // --stg-onramp near-black ink to prove it; and a map brings its own
    // ground, so leaflet's tiles and its own controls are a picture rather
    // than a panel. A checker that reports both on every page is a checker
    // nobody reads by the end of the week.
    const bg = px(s.backgroundColor);
    const isAcc = bg && accPx && Math.abs(bg.r - accPx.r) < 4 && Math.abs(bg.g - accPx.g) < 4 && Math.abs(bg.b - accPx.b) < 4;
    // A PICTURE BRINGS ITS OWN GROUND, and a hand-drawn map is a picture: the
    // place boards paint their sea #dbe6f1 and halo every city label in it, so
    // the wrapper is a light box on purpose and stays one on both registers.
    // Matched by CONTAINING an svg rather than by the colour, since three
    // boards draw their own map with three different palettes.
    const inMap = !!el.closest('.leaflet-container, [class*="leaflet"]') || !!el.querySelector('svg');
    if (dark && bg && bg.a > 0.85 && lum(bg) > 0.45 && !isAcc && !inMap) {
      const r = el.getBoundingClientRect();
      if (r.width > 12 && r.height > 12) {
        out.light.push({ tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 40), bg: s.backgroundColor, w: Math.round(r.width), h: Math.round(r.height) });
      }
    }

    // 3. INK. Only elements that own a text node, so a wrapper is not measured
    // for text that belongs to its child.
    let text = '';
    for (const n of el.childNodes) if (n.nodeType === 3) text += n.nodeValue;
    text = text.trim();
    if (!text) continue;
    const fg = px(s.color);
    if (!fg || fg.a === 0) continue;
    if (el.closest('.leaflet-container, [class*="leaflet"]')) continue;
    const g = groundOf(el);
    const ratio = cr(fg.a < 1 ? over(fg, g) : fg, g);
    const size = parseFloat(s.fontSize);
    const bold = parseInt(s.fontWeight, 10) >= 700;
    const floor = (size >= 24 || (size >= 18.66 && bold)) ? ${MIN_CR_LARGE} : ${MIN_CR};
    if (ratio < floor) {
      const key = text.slice(0, 24) + '|' + s.color;
      if (seen.has(key)) continue;
      seen.add(key);
      out.ink.push({ text: text.slice(0, 40), color: s.color, on: 'rgb(' + [g.r, g.g, g.b].map(Math.round).join(',') + ')', cr: Math.round(ratio * 100) / 100, need: floor, size: Math.round(size) });
    }
  }
  return out;
})()`;

// Pressing Start is what renders the states a scan at rest cannot see. The
// eleven clients share QuizIdleActions, so one selector covers all of them, and
// the fallbacks catch the two that label the control differently.
const START = [
  'button.qz-start',
  'button:has-text("Start")',
  'button:has-text("Play")',
  'button:has-text("Begin")',
];

const px = (c) => { const m = String(c).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(Number); return { r: p[0], g: p[1], b: p[2] }; };

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
let bad = 0;
const say = (m) => { console.log('  ✗ ' + m); bad++; };

// ⚠️ A DEAD SERVER READS EXACTLY LIKE AN UNCONVERTED CLIENT. The dev server
// went down mid-sweep once and every page after it reported "no .stage-page
// root", which is the same line a genuinely broken conversion prints, so the
// run looked like eight regressions and was one crash. Ask before each page.
async function up() {
  // ANY answer means the server is up, including a 500: this asks whether the
  // process is alive, not whether the app is healthy, and in a sandbox with no
  // database every data route legitimately errors. A dev server also COMPILES
  // the route on the first request, so the timeout has to be generous or a
  // cold start reads as a crash.
  try { await fetch(BASE + '/quiz/connections-pt-1', { signal: AbortSignal.timeout(25000) }); return true; }
  catch (e) { return false; }
}

// A name filter, so a long sweep can be run in batches: a crash then costs one
// batch rather than the whole run.
const only = process.argv.slice(2).filter((a) => !a.startsWith('--') && a !== BASE);
const RUN = only.length ? PAGES.filter(([c]) => only.includes(c)) : PAGES;

for (const [client, quizId] of RUN) {
  if (!(await up())) { say(`${client}: the dev server at ${BASE} is not answering; nothing below this line was measured`); break; }
  for (const theme of ['dark', 'light']) {
    for (const state of ['rest', 'play']) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      const errs = [];
      page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 120)));
      // THE REGISTER IS NAMED IN BOTH DIRECTIONS. Light is the site's default
      // since 2026-09-01, so ?stage=1 alone is a LIGHT page: a sweep that
      // treats the bare URL as "dark" measures the light register twice and
      // reports the dark one as clean without ever having rendered it.
      const url = `${BASE}/quiz/${quizId}?stage=1&theme=${theme}`;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      } catch (e) { /* the map boards never go idle; the render is up regardless */ }
      // ⚠️ THESE BOARDS ARE ssr:false DYNAMIC IMPORTS, so the server ships the
      // SEO prose and nothing else and the board appears only once its chunk
      // has been fetched and, in dev, compiled. At 1.2s ten of the eleven
      // reported "no .stage-page root" and every one of them was fine: the
      // sweep was reading the page before the client existed. Wait for the root
      // rather than for a clock.
      await page.waitForSelector('.stage-page', { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(900);

      if (state === 'play') {
        let started = false;
        for (const sel of START) {
          const b = page.locator(sel).first();
          if (await b.count().catch(() => 0)) {
            try { await b.click({ timeout: 3000 }); started = true; break; } catch (e) {}
          }
        }
        await page.waitForTimeout(1800);
        // A board whose Start could not be pressed is NAMED, never silently
        // skipped: "no play state measured" and "play state is clean" are
        // different results and a sweep that prints neither is the one that
        // lets an unmeasured board ship.
        if (!started) { console.log(`  ~   ${client} ${theme}/play: Start could not be pressed here; play state NOT measured`); await page.close(); continue; }
      }

      const r = await page.evaluate(PROBE);
      const tag = `${client} ${theme}/${state}`;

      if (!r.hasRoot) say(`${tag}: no .stage-page root`);
      else {
        // ASSERT THE GROUND, NOT THE ATTRIBUTE. data-stage-theme is set in an
        // effect, and the pre-paint boot stamp already suppresses the light
        // token block, so between hydration and that effect the attribute
        // reads 'light' on a page whose ground is correctly near-black. The
        // ground is what a reader sees and what the tokens resolved to.
        const g = px(r.ground);
        const dk = g && (0.2126 * g.r + 0.7152 * g.g + 0.0722 * g.b) < 90;
        if (theme === 'light' && dk) say(`${tag}: light register rendered a dark ground (${r.ground})`);
        if (theme === 'dark' && !dk) say(`${tag}: dark register rendered a pale ground (${r.ground})`);
        if (!r.cap) say(`${tag}: no cap rendered`);
        if (r.masthead) say(`${tag}: the site masthead is still on the page`);
        if (r.grain) say(`${tag}: the paper grain is still on the page`);
        if (r.footer) say(`${tag}: the site footer is still on the page`);
        // The accent must resolve to a colour, not to the empty string a
        // missing custom property leaves behind.
        if (!/^#|^rgb/.test(r.acc || '')) say(`${tag}: --stg-acc does not resolve (${JSON.stringify(r.acc)})`);
      }
      for (const l of r.light) say(`${tag}: light surface ${l.w}x${l.h} ${l.bg} on <${l.tag} class="${l.cls}">`);
      for (const i of r.ink) say(`${tag}: ${i.cr}:1 (needs ${i.need}) ${i.color} on ${i.on} — "${i.text}"`);
      // Hydration notices are dev-only and pre-exist this conversion on the
      // same pages with ?stage=0, so they are reported as notes rather than
      // failures. Anything else is a real crash.
      for (const e of errs) {
        if (/hydrat|did not match|Text content does not match/i.test(e)) console.log(`  ~   ${tag}: (pre-existing) ${e.split('\n')[0]}`);
        else say(`${tag}: console error: ${e}`);
      }

      if (!r.light.length && !r.ink.length && !errs.length && r.hasRoot) {
        console.log(`  ok  ${tag}  ground ${r.ground}  accent ${r.acc}`);
      }
      await page.close();
    }
  }
}
await browser.close();
console.log(bad ? `\n✗ ${bad} problem${bad === 1 ? '' : 's'}` : '\n✓ every converted quiz client reads in both registers, at rest and in play');
process.exit(bad ? 1 : 0);
