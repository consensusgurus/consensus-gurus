// Draws public/games/btn-strata.png and its blue twin. No image library: the
// tile is a handful of rounded rectangles rasterised into an RGBA buffer and
// zlib-deflated into a PNG by hand, which keeps the sandbox off npm entirely.
//
// The drawing IS the mechanic, not a letter in a box: three courses of tiles
// with the middle course lit and lifting out, and the course above it already
// sliding down into the gap.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { crc32 as _crc32 } from 'node:zlib';

const W = 76, H = 76;

function crc32(buf) { return _crc32(buf) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(rgba, w, h) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];

function canvas() { return Buffer.alloc(W * H * 4, 0); }
function px(buf, x, y, [r, g, b], a) {
  if (x < 0 || y < 0 || x >= W || y >= H || a <= 0) return;
  const i = (y * W + x) * 4;
  const na = a + (buf[i + 3] / 255) * (1 - a);
  const mix = (c, o) => Math.round((c * a + o * (buf[i + 3] / 255) * (1 - a)) / na);
  buf[i] = mix(r, buf[i]); buf[i + 1] = mix(g, buf[i + 1]); buf[i + 2] = mix(b, buf[i + 2]);
  buf[i + 3] = Math.round(na * 255);
}
// A rounded rect with 2x2 supersampled edges, so the corners do not look chewed.
function rrect(buf, x0, y0, w, h, r, col, alpha = 1) {
  const inside = (px_, py) => {
    const dx = Math.min(Math.max(x0 + r - px_, 0), Math.max(px_ - (x0 + w - r), 0));
    const dy = Math.min(Math.max(y0 + r - py, 0), Math.max(py - (y0 + h - r), 0));
    if (px_ < x0 || py < y0 || px_ > x0 + w || py > y0 + h) return false;
    return dx * dx + dy * dy <= r * r;
  };
  for (let y = Math.floor(y0) - 1; y <= Math.ceil(y0 + h) + 1; y++) {
    for (let x = Math.floor(x0) - 1; x <= Math.ceil(x0 + w) + 1; x++) {
      let hits = 0;
      for (const oy of [0.25, 0.75]) for (const ox of [0.25, 0.75]) if (inside(x + ox, y + oy)) hits++;
      if (hits) px(buf, x, y, col, alpha * (hits / 4));
    }
  }
}

// palette per variant. Two meaningful accents (the lit word, and the falling
// course) map to two DIFFERENT blue steps in the blue build rather than
// collapsing into one, per the tile rule.
const FULL = { dark: hex('#0f1f4d'), lit: hex('#15803d'), fall: hex('#9a3412'), pale: hex('#e8d9cf') };
const BLUE = { dark: hex('#16306e'), lit: hex('#245edf'), fall: hex('#214bb2'), pale: hex('#cbe2fe') };

function draw(P) {
  const buf = canvas();
  const TW = 13, TH = 12, GAP = 3, R = 3.5;
  const span = 4 * TW + 3 * GAP;                  // 61
  const left = Math.round((W - span) / 2);

  // Three courses of rock at the top. The lowest of them is already sliding, so
  // it sits a few pixels low and lighter: that offset is the whole idea of the
  // game in one gesture.
  const courses = [
    { y: 5, col: P.dark, a: 1, dy: 0 },
    { y: 20, col: P.dark, a: 1, dy: 0 },
    { y: 35, col: P.fall, a: 0.9, dy: 4 },
  ];
  for (const cs of courses) {
    for (let c = 0; c < 4; c++) {
      rrect(buf, left + c * (TW + GAP), cs.y + cs.dy, TW, TH, R, cs.col, cs.a);
    }
  }
  // The seam it is falling into.
  rrect(buf, left, 54, span, 2, 1, P.pale, 0.75);
  // The word going out, lit, one solid bar rather than separate tiles because it
  // is being read as a single thing.
  rrect(buf, left, 59, span, TH, R, P.lit, 1);
  return buf;
}

mkdirSync(new URL('./games/blue/', import.meta.url), { recursive: true });
writeFileSync(new URL('./games/btn-strata.png', import.meta.url), png(draw(FULL), W, H));
writeFileSync(new URL('./games/blue/btn-strata.png', import.meta.url), png(draw(BLUE), W, H));
console.log('wrote btn-strata.png (full + blue), 76x76 RGBA');
