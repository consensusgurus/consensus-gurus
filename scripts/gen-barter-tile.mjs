// Draw the 76x76 daily tile art for Barter, in both the full-colour and the
// brand-blue palette, straight to public/games (rule 12 of the daily puzzle
// authoring standard: same drawing, remapped palette, never a redraw).
//
//   node scripts/gen-barter-tile.mjs
//
// The drawing: a 3x3 lattice fragment with the centre hole, six neutral tiles,
// and the two tiles above and below the hole in the game's two accent roles
// with a double-headed trade arrow running between them.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const S = 76, SS = 4, W = S * SS;

function canvas() { return { px: new Uint8ClampedArray(W * W * 4) }; }
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
        const ox = px < X + R ? X + R : X + Wd - R, oy = py < Y + R ? Y + R : Y + Hd - R;
        if ((px - ox) ** 2 + (py - oy) ** 2 > R * R) continue;
      }
      put(c, px, py, rgb, a);
    }
  }
}
function bar(c, x1, y1, x2, y2, t, rgb, a = 255) {
  const half = t / 2;
  if (y1 === y2) roundRect(c, Math.min(x1, x2) - half, y1 - half, Math.abs(x2 - x1) + t, t, half, rgb, a);
  else roundRect(c, x1 - half, Math.min(y1, y2) - half, t, Math.abs(y2 - y1) + t, half, rgb, a);
}
function tri(c, p1, p2, p3, rgb) {
  const pts = [p1, p2, p3].map(([x, y]) => [x * SS, y * SS]);
  const minX = Math.floor(Math.min(...pts.map((p) => p[0]))), maxX = Math.ceil(Math.max(...pts.map((p) => p[0])));
  const minY = Math.floor(Math.min(...pts.map((p) => p[1]))), maxY = Math.ceil(Math.max(...pts.map((p) => p[1])));
  const sign = (a, b, p) => (p[0] - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (p[1] - b[1]);
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    const d1 = sign(pts[0], pts[1], [x, y]), d2 = sign(pts[1], pts[2], [x, y]), d3 = sign(pts[2], pts[0], [x, y]);
    const neg = (d1 < 0) || (d2 < 0) || (d3 < 0), pos = (d1 > 0) || (d2 > 0) || (d3 > 0);
    if (!(neg && pos)) put(c, x, y, rgb);
  }
}
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

// Palette roles (identical shape in both versions):
//   ground   the icon background
//   tile     the six neutral lattice tiles
//   accentA  the tile ABOVE the hole (a green in full colour)
//   accentB  the tile BELOW the hole (an amber in full colour)
//   arrow    the double-headed trade arrow
function draw(p) {
  const c = canvas();
  roundRect(c, 0, 0, S, S, 16, hex(p.ground));
  const X = [8, 29, 50], cell = 18;
  for (const [gx, gy] of [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]]) {
    roundRect(c, X[gx], X[gy], cell, cell, 4, hex(p.tile));
  }
  roundRect(c, X[1], X[0], cell, cell, 4, hex(p.accentA));
  roundRect(c, X[1], X[2], cell, cell, 4, hex(p.accentB));
  // the trade arrow through the centre hole
  bar(c, 38, 32, 38, 44, 4, hex(p.arrow));
  tri(c, [38, 24], [32.5, 33], [43.5, 33], hex(p.arrow));
  tri(c, [38, 52], [32.5, 43], [43.5, 43], hex(p.arrow));
  return encodePng(downsample(c));
}

const FULL = { ground: '#be123c', tile: '#fdf1f3', accentA: '#1f9d55', accentB: '#e9b949', arrow: '#ffffff' };
const BLUE = { ground: '#182f71', tile: '#dbe9ff', accentA: '#4a8cf0', accentB: '#a8c7fb', arrow: '#e8f2ff' };

mkdirSync(join(ROOT, 'public/games/blue'), { recursive: true });
writeFileSync(join(ROOT, 'public/games/btn-barter.png'), draw(FULL));
writeFileSync(join(ROOT, 'public/games/blue/btn-barter.png'), draw(BLUE));
console.log('wrote public/games/btn-barter.png and public/games/blue/btn-barter.png');
