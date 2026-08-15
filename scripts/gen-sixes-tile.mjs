#!/usr/bin/env node
// Draw the 76x76 daily tile art for Sixes, in both the full-colour and the
// brand-blue palette, and write them straight to public/games.
//
//   node scripts/gen-sixes-tile.mjs
//
// Writes: public/games/btn-sixes.png and public/games/blue/btn-sixes.png
//
// BOTH FILES ARE REQUIRED and the second one fails SILENTLY when missed: the
// homepage rewrites /games/btn- to /games/blue/btn- for every slate row, and
// tileFallback quietly swaps a missing blue file back to the full-colour
// original. There is no broken image and no console error, just one garish tile
// in a blue table. Hands shipped that way and the owner caught it. See rule 12
// of the daily puzzle authoring standard in CLAUDE.md.
//
// Drawn procedurally at 4x and box-filtered down, the same approach as
// scripts/gen-tile-art.mjs, so the two palettes are pixel-identical in shape:
// same drawing, remapped palette, never a redraw.
//
// THE DRAWING is a 6x6 grid with its top-right BOX shaded, because that shape
// is the whole point of the game and the one thing that has to read at 76px. A
// glance has to say "this is a sudoku, and its boxes are two tall and three
// wide", which is what separates the tile from Suds sitting next to it in the
// Numbers row. Digits are drawn from a 4x6 bitmap font below rather than a real
// typeface: at this size a font would be resampled to mush anyway, and a hand
// set bitmap stays crisp.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const S = 76;      // final tile size
const SS = 4;      // supersample factor
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
// Rounded rectangle, in FINAL-size units.
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
const rect = (c, x, y, w, h, rgb, a = 255) => roundRect(c, x, y, w, h, 0, rgb, a);

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

// ── PNG encoding (RGBA, 8-bit, colour type 6) ──────────────────────────────
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

// ── a 4x6 bitmap font, digits 1-6 only, which is all this game has ─────────
const GLYPH = {
  1: ['..#.', '.##.', '..#.', '..#.', '..#.', '####'],
  2: ['.##.', '#..#', '...#', '..#.', '.#..', '####'],
  3: ['###.', '...#', '.##.', '...#', '#..#', '.##.'],
  4: ['..##', '.#.#', '#..#', '####', '...#', '...#'],
  5: ['####', '#...', '###.', '...#', '#..#', '.##.'],
  6: ['.##.', '#...', '###.', '#..#', '#..#', '.##.'],
};
// x,y are the top-left in FINAL-size units; px is the size of one font pixel.
function glyph(c, d, x, y, px, rgb) {
  const rows = GLYPH[d];
  for (let gy = 0; gy < rows.length; gy++) {
    for (let gx = 0; gx < rows[gy].length; gx++) {
      if (rows[gy][gx] === '#') rect(c, x + gx * px, y + gy * px, px, px, rgb);
    }
  }
}

// ── the drawing ────────────────────────────────────────────────────────────
//
// Palette roles, identical in both versions so the shape never changes:
//   ground  the tile background
//   line    the thin square rules
//   heavy   the three box rules, which carry the 2x3 shape
//   shade   the one shaded box, the second accent
//   ink     digits sitting on the ground
//   inkOn   digits sitting on the shaded box
const PAD = 9;              // inset from the tile edge
const CELL = (S - PAD * 2) / 6;

function drawSixes(p) {
  const c = canvas();
  roundRect(c, 0, 0, S, S, 16, hex(p.ground));

  // the shaded box: rows 0-1, columns 3-5. Two tall, three wide.
  rect(c, PAD + CELL * 3, PAD, CELL * 3, CELL * 2, hex(p.shade));

  // thin rules between squares
  for (let i = 1; i < 6; i++) {
    rect(c, PAD + CELL * i - 0.25, PAD, 0.5, CELL * 6, hex(p.line), 150);
    rect(c, PAD, PAD + CELL * i - 0.25, CELL * 6, 0.5, hex(p.line), 150);
  }
  // heavy rules on the BOX edges: after column 2, after rows 1 and 3
  rect(c, PAD + CELL * 3 - 0.6, PAD, 1.2, CELL * 6, hex(p.heavy));
  rect(c, PAD, PAD + CELL * 2 - 0.6, CELL * 6, 1.2, hex(p.heavy));
  rect(c, PAD, PAD + CELL * 4 - 0.6, CELL * 6, 1.2, hex(p.heavy));
  // and the outer frame
  rect(c, PAD - 0.6, PAD - 0.6, CELL * 6 + 1.2, 1.2, hex(p.heavy));
  rect(c, PAD - 0.6, PAD + CELL * 6 - 0.6, CELL * 6 + 1.2, 1.2, hex(p.heavy));
  rect(c, PAD - 0.6, PAD - 0.6, 1.2, CELL * 6 + 1.2, hex(p.heavy));
  rect(c, PAD + CELL * 6 - 0.6, PAD - 0.6, 1.2, CELL * 6 + 1.2, hex(p.heavy));

  // five digits, enough to read as a filled-in sudoku without crowding
  const FONT_PX = 0.92;                       // one font pixel, in final units
  const gw = 4 * FONT_PX, gh = 6 * FONT_PX;
  const at = (r, col, d, rgb) => glyph(c, d, PAD + CELL * col + (CELL - gw) / 2, PAD + CELL * r + (CELL - gh) / 2, FONT_PX, hex(rgb));
  at(0, 4, 6, p.inkOn);
  at(1, 3, 2, p.inkOn);
  at(2, 1, 4, p.ink);
  at(3, 5, 1, p.ink);
  at(5, 2, 3, p.ink);
  return downsample(c);
}

// Full colour: the identity blue as the GROUND, which is what makes Sixes read
// as "the blue one" in the colour rows. Brand blue: the deep navy ground from
// the house ramp, with the shade stepped to a mid blue so the box still shows.
const COLOUR = { ground: '#1d4ed8', line: '#ffffff', heavy: '#ffffff', shade: '#dbe9ff', ink: '#ffffff', inkOn: '#12327f' };
const BLUE = { ground: '#16306e', line: '#dbe9ff', heavy: '#dbe9ff', shade: '#245edf', ink: '#dbe9ff', inkOn: '#0f1f4d' };

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
mkdirSync(join(root, 'public/games/blue'), { recursive: true });
writeFileSync(join(root, 'public/games/btn-sixes.png'), encodePng(drawSixes(COLOUR)));
writeFileSync(join(root, 'public/games/blue/btn-sixes.png'), encodePng(drawSixes(BLUE)));
console.log('wrote public/games/btn-sixes.png and public/games/blue/btn-sixes.png (76x76 RGBA, both)');
