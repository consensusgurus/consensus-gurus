#!/usr/bin/env node
// Draw the 76x76 daily tile art for Towers, Mercury and Polka, each in both
// the full-colour and the brand-blue palette, straight to public/games.
//
//   node scripts/gen-trio-tiles.mjs
//
// Writes: public/games/btn-{towers,mercury,polka}.png and the
// public/games/blue/ copies. BOTH files per game are required; the blue one
// fails SILENTLY when missed (rule 12 of the authoring standard). Same
// procedural 4x supersample approach as scripts/gen-sixes-tile.mjs: one
// drawing per game, two palettes, never a redraw.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const S = 76, SS = 4, W = S * SS;
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
const rect = (c, x, y, w, h, rgb, a = 255) => roundRect(c, x, y, w, h, 0, rgb, a);
const circle = (c, cx, cy, r, rgb, a = 255) => roundRect(c, cx - r, cy - r, r * 2, r * 2, r, rgb, a);
function downsample(c) {
  const out = Buffer.alloc(S * S * 4);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const o = ((y * SS + sy) * W + (x * SS + sx)) * 4;
      const al = c.px[o + 3] / 255;
      r += c.px[o] * al; g += c.px[o + 1] * al; b += c.px[o + 2] * al; a += al;
    }
    const n = SS * SS, o = (y * S + x) * 4;
    out[o] = a > 0 ? Math.round(r / a) : 0;
    out[o + 1] = a > 0 ? Math.round(g / a) : 0;
    out[o + 2] = a > 0 ? Math.round(b / a) : 0;
    out[o + 3] = Math.round((a / n) * 255);
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
const GLYPH = {
  1: ['..#.', '.##.', '..#.', '..#.', '..#.', '####'],
  2: ['.##.', '#..#', '...#', '..#.', '.#..', '####'],
  3: ['###.', '...#', '.##.', '...#', '#..#', '.##.'],
  4: ['..##', '.#.#', '#..#', '####', '...#', '...#'],
  5: ['####', '#...', '###.', '...#', '#..#', '.##.'],
  8: ['.##.', '#..#', '.##.', '#..#', '#..#', '.##.'],
  9: ['.##.', '#..#', '.###', '...#', '..#.', '.#..'],
};
function glyph(c, d, x, y, px, rgb) {
  const rows = GLYPH[d];
  for (let gy = 0; gy < rows.length; gy++) for (let gx = 0; gx < rows[gy].length; gx++) {
    if (rows[gy][gx] === '#') rect(c, x + gx * px, y + gy * px, px, px, rgb);
  }
}

// ── TOWERS: a skyline of four bars with the clue digits above it ──────────
// Palette roles: ground, frame, bar (the towers), digit (the clues).
function drawTowers(p) {
  const c = canvas();
  roundRect(c, 0, 0, S, S, 16, hex(p.ground));
  const PAD = 10, BASE = S - PAD - 2;
  const colW = (S - PAD * 2) / 4;
  const clue = [2, 1, 3, 2];
  const hgt = [2, 4, 1, 3]; // tower heights, in quarters of the plot
  const unit = (S - PAD * 2 - 16) / 4;
  const FONT_PX = 0.95, gw = 4 * FONT_PX;
  for (let i = 0; i < 4; i++) {
    const x = PAD + i * colW;
    glyph(c, clue[i], x + (colW - gw) / 2, PAD + 1, FONT_PX, hex(p.digit));
    const h2 = hgt[i] * unit;
    roundRect(c, x + 2, BASE - h2, colW - 4, h2, 1.5, hex(p.bar));
  }
  // the baseline
  rect(c, PAD - 1, BASE, S - PAD * 2 + 2, 1.6, hex(p.frame));
  return downsample(c);
}

// ── MERCURY: a grid with one thermometer, bulb and rising stem ────────────
// Palette roles: ground, line (grid rules), therm (bulb + stem), digit.
function drawMercury(p) {
  const c = canvas();
  roundRect(c, 0, 0, S, S, 16, hex(p.ground));
  const PAD = 10, CELL = (S - PAD * 2) / 4;
  for (let i = 1; i < 4; i++) {
    rect(c, PAD + CELL * i - 0.3, PAD, 0.6, CELL * 4, hex(p.line), 170);
    rect(c, PAD, PAD + CELL * i - 0.3, CELL * 4, 0.6, hex(p.line), 170);
  }
  rect(c, PAD - 0.7, PAD - 0.7, CELL * 4 + 1.4, 1.4, hex(p.line));
  rect(c, PAD - 0.7, PAD + CELL * 4 - 0.7, CELL * 4 + 1.4, 1.4, hex(p.line));
  rect(c, PAD - 0.7, PAD - 0.7, 1.4, CELL * 4 + 1.4, hex(p.line));
  rect(c, PAD + CELL * 4 - 0.7, PAD - 0.7, 1.4, CELL * 4 + 1.4, hex(p.line));
  // thermometer: bulb bottom-left cell, stem up two cells, then right one
  const bx = PAD + CELL * 0.5, by = PAD + CELL * 3.5;
  const stemW = CELL * 0.42;
  circle(c, bx, by, CELL * 0.34, hex(p.therm));
  roundRect(c, bx - stemW / 2, PAD + CELL * 1.5 - stemW / 2, stemW, CELL * 2 + stemW, stemW / 2, hex(p.therm));
  roundRect(c, bx - stemW / 2, PAD + CELL * 1.5 - stemW / 2, CELL + stemW, stemW, stemW / 2, hex(p.therm));
  // digits: a 1 on the bulb, an 8 and 9 rising off it
  const FONT_PX = 0.85, gw = 4 * FONT_PX, gh = 6 * FONT_PX;
  glyph(c, 1, bx - gw / 2, by - gh / 2, FONT_PX, hex(p.digit));
  glyph(c, 8, PAD + CELL * 2.5 - gw / 2, PAD + CELL * 2.5 - gh / 2, FONT_PX, hex(p.digitOn));
  glyph(c, 9, PAD + CELL * 3.5 - gw / 2, PAD + CELL * 1.5 - gh / 2, FONT_PX, hex(p.digitOn));
  return downsample(c);
}

// ── POLKA: an empty grid wearing its dots, white ringed and black filled ──
// Palette roles: ground, line, white (ringed dot fill), dark (filled dot).
function drawPolka(p) {
  const c = canvas();
  roundRect(c, 0, 0, S, S, 16, hex(p.ground));
  const PAD = 11, CELL = (S - PAD * 2) / 3;
  for (let i = 1; i < 3; i++) {
    rect(c, PAD + CELL * i - 0.3, PAD, 0.6, CELL * 3, hex(p.line), 170);
    rect(c, PAD, PAD + CELL * i - 0.3, CELL * 3, 0.6, hex(p.line), 170);
  }
  rect(c, PAD - 0.7, PAD - 0.7, CELL * 3 + 1.4, 1.4, hex(p.line));
  rect(c, PAD - 0.7, PAD + CELL * 3 - 0.7, CELL * 3 + 1.4, 1.4, hex(p.line));
  rect(c, PAD - 0.7, PAD - 0.7, 1.4, CELL * 3 + 1.4, hex(p.line));
  rect(c, PAD + CELL * 3 - 0.7, PAD - 0.7, 1.4, CELL * 3 + 1.4, hex(p.line));
  const R = 4.6;
  const at = (gx, gy) => [PAD + CELL * gx, PAD + CELL * gy];
  const whiteDot = (gx, gy) => { const [x, y] = at(gx, gy); circle(c, x, y, R, hex(p.dark)); circle(c, x, y, R - 1.5, hex(p.white)); };
  const blackDot = (gx, gy) => { const [x, y] = at(gx, gy); circle(c, x, y, R, hex(p.dark)); };
  whiteDot(1, 0.5); blackDot(2, 0.5);
  blackDot(0.5, 1); whiteDot(1.5, 1);
  whiteDot(2, 1.5); blackDot(1, 2.5);
  whiteDot(2.5, 2); whiteDot(0.5, 3);
  return downsample(c);
}

const TOWERS_COLOUR = { ground: '#075985', frame: '#dbe9ff', bar: '#bfe0f5', digit: '#ffffff' };
const TOWERS_BLUE = { ground: '#16306e', frame: '#dbe9ff', bar: '#4a8cf0', digit: '#dbe9ff' };
const MERCURY_COLOUR = { ground: '#991b1b', line: '#ffffff', therm: '#f2c2c2', digit: '#5f1010', digitOn: '#ffffff' };
const MERCURY_BLUE = { ground: '#182f71', line: '#dbe9ff', therm: '#4a8cf0', digit: '#0f1f4d', digitOn: '#dbe9ff' };
const POLKA_COLOUR = { ground: '#16a34a', line: '#ffffff', white: '#ffffff', dark: '#0e3a1e' };
const POLKA_BLUE = { ground: '#214bb2', line: '#dbe9ff', white: '#e8f2ff', dark: '#0f1f4d' };

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
mkdirSync(join(root, 'public/games/blue'), { recursive: true });
writeFileSync(join(root, 'public/games/btn-towers.png'), encodePng(drawTowers(TOWERS_COLOUR)));
writeFileSync(join(root, 'public/games/blue/btn-towers.png'), encodePng(drawTowers(TOWERS_BLUE)));
writeFileSync(join(root, 'public/games/btn-mercury.png'), encodePng(drawMercury(MERCURY_COLOUR)));
writeFileSync(join(root, 'public/games/blue/btn-mercury.png'), encodePng(drawMercury(MERCURY_BLUE)));
writeFileSync(join(root, 'public/games/btn-polka.png'), encodePng(drawPolka(POLKA_COLOUR)));
writeFileSync(join(root, 'public/games/blue/btn-polka.png'), encodePng(drawPolka(POLKA_BLUE)));
console.log('wrote 6 tiles (76x76 RGBA): btn-{towers,mercury,polka}.png in colour and blue');
