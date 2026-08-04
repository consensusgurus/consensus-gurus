// Generates the Mind Loft app icon set from the brand mark. Run from the repo root:
//
//   npm i --no-save @resvg/resvg-js && node scripts/build-app-icons.mjs
//
// resvg is deliberately NOT a package.json dependency: this runs by hand when the mark or the
// palette changes, never in the Vercel build. Outputs overwrite app/icon.png, app/apple-icon.png,
// app/favicon.ico and the three public/web-app-manifest-* files in place.
//
// WHY THIS FILE EXISTS. The icons used to be a straight export of the logo SVG on a TRANSPARENT
// ground, full bleed. Three things were wrong with that, and all three are structural rather
// than matters of taste:
//
//   1. iOS has no alpha in home-screen icons, so it composited the mark onto BLACK. The
//      installed app was a black square with a nearly invisible dark caret in it.
//   2. The mark ran to the edges. Both the iOS squircle and the Android adaptive-icon circle
//      clipped the caret tips and the ends of the floor rule.
//   3. One drawing was used at every size. A 7px stroke on a 120 grid is a hairline by 32px.
//
// A logo and an app icon are not the same drawing. This file keeps the mark from
// app/MindLoftMark.jsx but re-cuts it twice, on an opaque field, inside the platform safe zones.
//
//   LARGE cut (>=48px)   caret + brain + floor rule, mark at ~64% of the tile.
//   SMALL cut (16/32px)  floor rule DROPPED (it degrades to a smudge at 2px), caret thickened
//                        and shallowed, brain enlarged. Scaling the large cut down does not work.
//
// Colours come from lib/theme.js. The brain uses blue400 rather than blue: #2563eb on #0b0c0e is
// only 3.6:1 and mushes at favicon size, where blue400 is 7.7:1.

import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'node:fs';

const INK = '#0b0c0e';      // T.ink, the field
const WHITE = '#ffffff';    // T.white, caret + floor rule
const BRAIN_C = '#60a5fa';  // T.blue400

const BRAIN =
  'M14 42C12 28 22 16 36 16C40 8 54 6 60 14C70 8 84 14 86 26C96 30 98 44 88 50C92 58 86 66 76 64'
  + 'C74 72 64 74 60 66C48 70 36 66 32 56C20 56 12 50 14 42Z';

// The BRAIN path's real bbox, measured off a render rather than guessed from its control points
// (control points overstate a cubic's extent): x 13.70..94.50 (cx 54.10), y 8.90..71.00. Every
// translate below is derived from it, so the brain lands optically centred instead of a pixel left.
const BX = 54.10, BY1 = 71.00;
const place = (scale, cx, bottom) =>
  `translate(${(cx - BX * scale).toFixed(3)},${(bottom - BY1 * scale).toFixed(3)}) scale(${scale})`;

// Mark bounds land at x 21.5..98.5, y 23.5..98 in the 120 grid: 64% of the tile, clear of the
// Apple squircle and inside the Android 80% safe circle once the maskable scale is applied.
const largeCut = `
  <path d="M26 54l34-26 34 26" stroke="${WHITE}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M28 94h64" stroke="${WHITE}" stroke-width="8" stroke-linecap="round"/>
  <g transform="${place(0.45, 60, 85)}"><path d="${BRAIN}" fill="${BRAIN_C}"/></g>`;

// Small cut fills ~72% of the tile: at 16px a generous mark beats a well-padded one. The caret is
// both thicker and shallower than the large cut, and the brain larger, so the two shapes stay a
// full pixel apart at 16px instead of blurring into one grey mass.
const smallCut = `
  <path d="M22 54l38-26 38 26" stroke="${WHITE}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <g transform="${place(0.6, 60, 103)}"><path d="${BRAIN}" fill="${BRAIN_C}"/></g>`;

function svg(inner, scale) {
  const art = scale === 1 ? inner : `<g transform="translate(60,60) scale(${scale}) translate(-60,-60)">${inner}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">`
    + `<rect width="120" height="120" fill="${INK}"/>${art}</svg>`;
}

const png = (source, size) =>
  new Resvg(source, { fitTo: { mode: 'width', value: size } }).render().asPng();

const LARGE = svg(largeCut, 1);
const SMALL = svg(smallCut, 1);
// Android crops a maskable icon to the inner 80% circle, so the art is pulled in a further 15%.
const MASKABLE = svg(largeCut, 0.85);

// No baked corner radius anywhere: every platform applies its own mask, and a pre-rounded icon
// under a squircle mask shows the tell-tale double corner.
const targets = [
  ['app/icon.png', LARGE, 512],
  ['app/apple-icon.png', LARGE, 180],
  ['public/web-app-manifest-192x192.png', LARGE, 192],
  ['public/web-app-manifest-512x512.png', LARGE, 512],
  ['public/web-app-manifest-512x512-maskable.png', MASKABLE, 512],
];

for (const [path, source, size] of targets) {
  const buf = png(source, size);
  writeFileSync(path, buf);
  console.log(path, size + 'px', buf.length + ' bytes');
}

// favicon.ico as PNG-in-ICO (Vista+, and every current browser). 16 and 32 use the SMALL cut,
// 48 uses the LARGE cut. That mixture is the entire point of a multi-size ico: each entry is
// the drawing that works at that size, not one drawing resampled three times.
function ico(entries) {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  entries.forEach((e, i) => {
    const o = i * 16;
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, o);
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, o + 1);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(e.data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += e.data.length;
  });
  return Buffer.concat([head, dir, ...entries.map((e) => e.data)]);
}

const icoBuf = ico([
  { size: 16, data: png(SMALL, 16) },
  { size: 32, data: png(SMALL, 32) },
  { size: 48, data: png(LARGE, 48) },
]);
writeFileSync('app/favicon.ico', icoBuf);
console.log('app/favicon.ico', icoBuf.length + ' bytes');

// Proof sheet for eyeballing every size at once, including the Android circle crop and the
// small sizes magnified. Not shipped; .gitignore keeps it out.
mkdirSync('.icon-proof', { recursive: true });
const u = (b) => 'data:image/png;base64,' + b.toString('base64');
const at = (source, size, x, y, draw, pix) =>
  `<image href="${u(png(source, size))}" x="${x}" y="${y}" width="${draw}" height="${draw}"`
  + `${pix ? ' image-rendering="optimizeSpeed"' : ''}/>`;
const lbl = (t, x, y) => `<text x="${x}" y="${y}" font-family="sans-serif" font-size="11" fill="#5f5e5a">${t}</text>`;
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="470" viewBox="0 0 900 470">
<rect width="900" height="470" fill="#ffffff"/>
${lbl('512', 20, 18)}${at(LARGE, 512, 20, 26, 180)}
${lbl('512 maskable, Android circle crop', 230, 18)}${at(MASKABLE, 512, 230, 26, 180)}
<circle cx="320" cy="116" r="90" fill="none" stroke="#e24b4a" stroke-width="2" stroke-dasharray="5 4"/>
${lbl('180 apple-touch', 440, 18)}${at(LARGE, 180, 440, 26, 180)}
${lbl('192', 650, 18)}${at(LARGE, 192, 650, 26, 96)}
${lbl('actual pixel sizes', 20, 250)}
${at(LARGE, 48, 20, 260, 48)}${at(SMALL, 32, 84, 260, 32)}${at(SMALL, 16, 132, 260, 16)}
${lbl('48', 20, 326)}${lbl('32', 84, 326)}${lbl('16', 132, 326)}
${lbl('16px magnified 8x', 220, 250)}${at(SMALL, 16, 220, 260, 128, true)}
${lbl('32px magnified 4x', 380, 250)}${at(SMALL, 32, 380, 260, 128, true)}
${lbl('48px magnified 4x', 540, 250)}${at(LARGE, 48, 540, 260, 192, true)}
</svg>`;
writeFileSync('.icon-proof/proof.png', new Resvg(sheet, { fitTo: { mode: 'width', value: 900 } }).render().asPng());
console.log('.icon-proof/proof.png');
