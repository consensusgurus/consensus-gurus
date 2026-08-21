#!/usr/bin/env node
// Draw the 76x76 daily tile art for Niche, in both the full-colour and the
// brand-blue palette, and write them straight to public/games.
//
//   node scripts/gen-niche-tile.mjs
//
// Writes: public/games/btn-niche.png and public/games/blue/btn-niche.png
//
// BOTH FILES ARE REQUIRED and the second one fails SILENTLY when missed: the
// homepage rewrites /games/btn- to /games/blue/btn- for every slate row, and
// tileFallback quietly swaps a missing blue file back to the full-colour
// original. See rule 12 of the daily puzzle authoring standard in CLAUDE.md.
//
// THE DRAWING is a 3x3 answer grid with header strips on the top and left,
// one cell shaded as the GOLD rare find. That is the whole game in one glance:
// a grid with two axes of headers, and one square worth bragging about. The
// gold cell is the second accent; on the blue tile it maps to a mid blue so
// the two accents stay two different steps (rule 12: never collapse them).
//
// Drawn procedurally at 4x and box-filtered down, the same approach as
// scripts/gen-sixes-tile.mjs, so the two palettes are pixel-identical in
// shape: same drawing, remapped palette, never a redraw.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const S = 76;
const SS = 4;
const W = S * SS;

const canvas = () => ({ px: new Uint8ClampedArray(W * W * 4) });
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

function put(c, x, y, rgb, a = 255) {
  if (x < 0 || y < 0 || x >= W || y >= W) return;
  const o = (y * W + x) * 4;
  const src = a / 255;
  const dstA = c.px[o + 3] / 255;
  const outA = src + dstA * (1 - src);
  if (outA <= 0) return;
  for (let k = 0; k < 3; k++) c.px[o + k] = (rgb[k] * src + c.px[o + k] * dstA * (1 - src)) / outA;
  c.px[o + 3] = outA * 255;
}
function roundRect(c, x, y, w, h, r, rgb, a = 255) {
  const X = x * SS, Y = y * SS, Wd = w * SS, Hd = h * SS, R = r * SS;
  for (let py = Math.floor(Y); py < Math.ceil(Y + Hd); py++) {
    for (let px = Math.floor(X); px < Math.ceil(X + Wd); px++) {
      const dx = Math.min(px - X, X + Wd - 1 - px);
      const dy = Math.min(py - Y, Y + Hd - 1 - py);
      if (dx < R && dy < R) {
        const ox = px < X + R ? X + R : X + Wd - R;
        const oy = py < Y + R ? Y + R : Y + Hd - R;
        if ((px - ox) ** 2 + (py - oy) ** 2 > R * R) continue;
      }
      put(c, px, py, rgb, a);
    }
  }
}

function downsample(c) {
  const out = Buffer.alloc(S * S * 4);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const o = ((y * SS + sy) * W + (x * SS + sx)) * 4;
          const al = c.px[o + 3] / 255;
          r += c.px[o] * al; g += c.px[o + 1] * al; b += c.px[o + 2] * al; a += al;
        }
      }
      const n = SS * SS;
      const o = (y * S + x) * 4;
      out[o] = a > 0 ? Math.round(r / a) : 0;
      out[o + 1] = a > 0 ? Math.round(g / a) : 0;
      out[o + 2] = a > 0 ? Math.round(b / a) : 0;
      out[o + 3] = Math.round((a / n) * 255);
    }
  }
  return out;
}

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = c ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePng(rgba) {
  const raw = Buffer.alloc((S * 4 + 1) * S);
  for (let y = 0; y < S; y++) {
    raw[y * (S * 4 + 1)] = 0;
    rgba.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── the drawing ────────────────────────────────────────────────────────────
// Palette roles, identical in both versions so the shape never changes:
//   ground  the tile background
//   head    the header strips (top row and left column)
//   cell    an ordinary answer cell
//   gold    the rare-find cell, the first accent
//   fill    a second filled cell, the quieter accent
const PAD = 9;
const GAP = 2.4;
const HEAD = 10.5;                              // header strip thickness
const AREA = S - PAD * 2 - HEAD - GAP;          // the 3x3 answer area
const CW = (AREA - GAP * 2) / 3;

function drawNiche(p) {
  const c = canvas();
  roundRect(c, 0, 0, S, S, 16, hex(p.ground));
  const x0 = PAD + HEAD + GAP;
  const y0 = PAD + HEAD + GAP;
  // header strips: three column heads across the top, three row heads down
  // the left, which is what says "two axes" at a glance
  for (let i = 0; i < 3; i++) {
    roundRect(c, x0 + i * (CW + GAP), PAD, CW, HEAD, 2.5, hex(p.head));
    roundRect(c, PAD, y0 + i * (CW + GAP), HEAD, CW, 2.5, hex(p.head));
  }
  // the 3x3 answer cells
  for (let r = 0; r < 3; r++) {
    for (let col = 0; col < 3; col++) {
      let tone = p.cell;
      if (r === 1 && col === 2) tone = p.gold;       // the rare find
      else if (r === 2 && col === 0) tone = p.fill;  // a quieter filled cell
      roundRect(c, x0 + col * (CW + GAP), y0 + r * (CW + GAP), CW, CW, 3, hex(tone));
    }
  }
  return downsample(c);
}

// Full colour: Niche's deep teal as the ground, gold for the rare find.
// Brand blue: deep navy ground, the two accents on two DIFFERENT blue steps
// (gold -> mid blue, quiet fill -> pale) so they still read apart.
const COLOUR = { ground: '#115e59', head: '#0b3f3b', cell: '#ecfdf8', gold: '#e8b43a', fill: '#8fd6c9' };
const BLUE = { ground: '#182f71', head: '#0f1f4d', cell: '#dbe9ff', gold: '#4a8cf0', fill: '#8fb2f5' };

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
mkdirSync(join(root, 'public/games/blue'), { recursive: true });
writeFileSync(join(root, 'public/games/btn-niche.png'), encodePng(drawNiche(COLOUR)));
writeFileSync(join(root, 'public/games/blue/btn-niche.png'), encodePng(drawNiche(BLUE)));
console.log('wrote public/games/btn-niche.png and public/games/blue/btn-niche.png (76x76 RGBA, both)');
