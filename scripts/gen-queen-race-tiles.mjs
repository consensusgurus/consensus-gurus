#!/usr/bin/env node
// Draw the 76x76 daily tile art for Queen and Race, each in the full-colour
// AND the brand-blue palette, straight to public/games.
//
//   node scripts/gen-queen-race-tiles.mjs
//
// Writes: public/games/btn-queen.png,  public/games/blue/btn-queen.png,
//         public/games/btn-race.png,   public/games/blue/btn-race.png
//
// ALL FOUR ARE REQUIRED and the blue pair fails SILENTLY when missed: the
// homepage rewrites /games/btn- to /games/blue/btn- and tileFallback quietly
// swaps a missing blue file back to the full-colour original, leaving one
// garish tile in a blue table (rule 12 of the authoring standard in CLAUDE.md).
//
// THE DRAWINGS. Queen: a pawn on its home square with a crown floating above
// it and the promotion square glowing at the top, the whole story of the game
// in one glance. Race: two pawns mid-race in their lanes, the leader nearly at
// a checkered finish strip. Drawn procedurally at 4x and box-filtered down
// (the gen-sixes/gen-niche pipeline), so each blue tile is pixel-identical in
// shape to its full-colour original: same drawing, remapped palette, never a
// redraw. The two meaningful accents map to two DIFFERENT blue steps.
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
function circle(c, cx, cy, rad, rgb, a = 255) {
  const CX = cx * SS, CY = cy * SS, R = rad * SS;
  for (let py = Math.floor(CY - R); py <= Math.ceil(CY + R); py++) {
    for (let px = Math.floor(CX - R); px <= Math.ceil(CX + R); px++) {
      if ((px - CX) ** 2 + (py - CY) ** 2 <= R * R) put(c, px, py, rgb, a);
    }
  }
}
function poly(c, pts, rgb, a = 255) {
  const P = pts.map(([x, y]) => [x * SS, y * SS]);
  const ys = P.map((p) => p[1]);
  const y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
  for (let py = y0; py <= y1; py++) {
    const xs = [];
    for (let i = 0; i < P.length; i++) {
      const [xa, ya] = P[i], [xb, yb] = P[(i + 1) % P.length];
      if ((ya <= py && yb > py) || (yb <= py && ya > py)) {
        xs.push(xa + ((py - ya) / (yb - ya)) * (xb - xa));
      }
    }
    xs.sort((m, n) => m - n);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      for (let px = Math.floor(xs[k]); px <= Math.ceil(xs[k + 1]); px++) put(c, px, py, rgb, a);
    }
  }
}
// A pawn silhouette: head, collar, tapered body, base. Centred on cx; `s`
// scales the whole figure (1 = about 30px tall).
function pawn(c, cx, baseY, s, rgb) {
  circle(c, cx, baseY - 21 * s, 6.2 * s, rgb);
  roundRect(c, cx - 5.4 * s, baseY - 15.4 * s, 10.8 * s, 2.6 * s, 1.2 * s, rgb);
  poly(c, [
    [cx - 3.4 * s, baseY - 13 * s], [cx + 3.4 * s, baseY - 13 * s],
    [cx + 5.6 * s, baseY - 3 * s], [cx - 5.6 * s, baseY - 3 * s],
  ], rgb);
  roundRect(c, cx - 7.6 * s, baseY - 3.4 * s, 15.2 * s, 3.6 * s, 1.6 * s, rgb);
}
// A three-point crown with a band.
function crown(c, cx, topY, w, h, rgb) {
  const l = cx - w / 2, r = cx + w / 2;
  poly(c, [
    [l, topY + h], [l, topY + h * 0.35], [l + w * 0.25, topY + h * 0.62],
    [cx, topY], [r - w * 0.25, topY + h * 0.62], [r, topY + h * 0.35], [r, topY + h],
  ], rgb);
  roundRect(c, l, topY + h + 1, w, 3.2, 1.4, rgb);
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

// ── Queen ──────────────────────────────────────────────────────────────────
// Palette roles: ground, board light/dark (a 2-row checker footer), pawn (the
// figure), crown + glow (the first accent, the promotion), band (quiet base).
function drawQueen(p) {
  const c = canvas();
  roundRect(c, 0, 0, S, S, 16, hex(p.ground));
  // the promotion rank: a glowing strip along the top
  roundRect(c, 10, 9, S - 20, 6, 2.5, hex(p.glow));
  // crown floating where the pawn is headed
  crown(c, S / 2, 18, 22, 10, hex(p.crown));
  // the pawn, mid-walk
  pawn(c, S / 2, 58, 1.06, hex(p.pawn));
  // a two-row checkerboard footer, which is what says chess at a glance
  const cw = (S - 20) / 4;
  for (let i = 0; i < 4; i++) {
    roundRect(c, 10 + i * cw, 62, cw - 1, 4.6, 1.2, hex(i % 2 ? p.boardD : p.boardL));
    roundRect(c, 10 + i * cw, 67.6, cw - 1, 4.6, 1.2, hex(i % 2 ? p.boardL : p.boardD));
  }
  return downsample(c);
}

// ── Race ───────────────────────────────────────────────────────────────────
// Palette roles: ground, finish checker light/dark (the strip both pawns run
// at), lead pawn (the first accent, nearly home), chaser pawn (the second).
function drawRace(p) {
  const c = canvas();
  roundRect(c, 0, 0, S, S, 16, hex(p.ground));
  // checkered finish strip along the top
  const fw = (S - 16) / 8;
  for (let i = 0; i < 8; i++) {
    roundRect(c, 8 + i * fw, 8, fw, 4.4, 0.8, hex(i % 2 ? p.checkD : p.checkL));
    roundRect(c, 8 + i * fw, 12.4, fw, 4.4, 0.8, hex(i % 2 ? p.checkL : p.checkD));
  }
  // faint lane rules
  roundRect(c, 24.5, 20, 1.6, 48, 0.8, hex(p.lane));
  roundRect(c, 49.5, 20, 1.6, 48, 0.8, hex(p.lane));
  // the leader, one step from the line, and the chaser, lengths behind
  pawn(c, 38, 46, 0.92, hex(p.lead));
  pawn(c, 62, 70, 0.92, hex(p.chase));
  // dust ticks behind the leader
  roundRect(c, 35.5, 50, 5, 1.8, 0.9, hex(p.lane));
  roundRect(c, 34, 54.5, 8, 1.8, 0.9, hex(p.lane));
  return downsample(c);
}

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'public', 'games');
mkdirSync(join(out, 'blue'), { recursive: true });

writeFileSync(join(out, 'btn-queen.png'), encodePng(drawQueen({
  ground: '#3d2c15', glow: '#f2c14e', crown: '#f2c14e', pawn: '#f5efe4',
  boardL: '#efd9b5', boardD: '#8a6844',
})));
writeFileSync(join(out, 'blue', 'btn-queen.png'), encodePng(drawQueen({
  ground: '#16306e', glow: '#4a8cf0', crown: '#4a8cf0', pawn: '#dbe9ff',
  boardL: '#c2ddfe', boardD: '#0f1f4d',
})));
writeFileSync(join(out, 'btn-race.png'), encodePng(drawRace({
  ground: '#173ba3', checkL: '#f2f5fb', checkD: '#14141a', lead: '#f5f7fc',
  chase: '#14141a', lane: '#4a6fd8',
})));
writeFileSync(join(out, 'blue', 'btn-race.png'), encodePng(drawRace({
  ground: '#214bb2', checkL: '#dbe9ff', checkD: '#0f1f4d', lead: '#e8f2ff',
  chase: '#0f1f4d', lane: '#4a8cf0',
})));
console.log('wrote btn-queen.png, btn-race.png and their blue twins');
