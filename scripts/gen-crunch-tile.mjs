// Redraw the 76x76 Crunch daily tile, in both the full-colour and the
// brand-blue palette, and write them straight to public/games.
//
// The original art had the 2x2 keypad laid out off-centre: a wide cream gutter
// on the left and top, while the right column and bottom row ran under the
// dark frame and were clipped by it. The drawing itself is unchanged (a
// calculator keypad: plus, equals, minus, and one solid accent key) — only the
// geometry is rebuilt, from a single centred grid so all four margins match.
//
//   node scripts/gen-crunch-tile.mjs
//
// Writes: public/games/btn-crunch.png and public/games/blue/btn-crunch.png
//
// Same helpers as scripts/gen-tile-art.mjs (procedural at 4x, box-filtered
// down), which keeps the two palettes pixel-identical in shape — rule 12 of the
// daily puzzle authoring standard: same drawing, remapped palette, never a
// redraw.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const S = 76;      // final tile size
const SS = 4;      // supersample factor
const W = S * SS;

// ── a tiny RGBA canvas ─────────────────────────────────────────────────────
function canvas() {
  return { px: new Uint8ClampedArray(W * W * 4) };
}
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
        const ox = px < X + R ? X + R : X + Wd - R, oy = py < Y + R ? Y + R : Y + Hd - R;
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
    raw[y * (S * 4 + 1)] = 0; // filter: none
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
//
// Palette roles, identical in both variants so the shape never changes:
//   frame   the dark bezel around the whole tile
//   ground  the keypad plate inside the bezel
//   face    a key top
//   stroke  the hairline around a key top
//   ink     the glyph on a key
//   accent  the plus glyph AND the one solid key, the second accent colour
//
// Geometry is derived, not hand-placed: the four keys come off one centred
// grid, so the plate margin is equal on all four sides and nothing can run
// under the bezel.
const BEZEL = 4.5;          // bezel thickness
const PLATE = BEZEL;        // plate starts where the bezel ends
const PAD = 7;              // plate margin around the keypad, all four sides
const GAP = 4;              // gutter between keys
const KEY = (S - 2 * PLATE - 2 * PAD - GAP) / 2;  // = 24.5

function drawCrunch(p) {
  const c = canvas();
  roundRect(c, 0, 0, S, S, 16, hex(p.frame));
  roundRect(c, PLATE, PLATE, S - 2 * PLATE, S - 2 * PLATE, 12, hex(p.ground));

  const o = PLATE + PAD;                   // first key origin, both axes
  const at = (i) => o + i * (KEY + GAP);
  const key = (col, row, solid) => {
    const x = at(col), y = at(row);
    if (solid) { roundRect(c, x, y, KEY, KEY, 5, hex(p.accent)); return [x + KEY / 2, y + KEY / 2]; }
    roundRect(c, x, y, KEY, KEY, 5, hex(p.stroke));
    roundRect(c, x + 1, y + 1, KEY - 2, KEY - 2, 4.2, hex(p.face));
    return [x + KEY / 2, y + KEY / 2];
  };
  // glyph bars, centred on a key
  const barH = (cx, cy, len, t, rgb) => roundRect(c, cx - len / 2, cy - t / 2, len, t, t / 2, rgb);
  const barV = (cx, cy, len, t, rgb) => roundRect(c, cx - t / 2, cy - len / 2, t, len, t / 2, rgb);

  const GL = 12.5, GT = 4.2;               // glyph length / thickness

  // top-left: plus, in the accent colour
  let [cx, cy] = key(0, 0, false);
  barH(cx, cy, GL, GT, hex(p.accent));
  barV(cx, cy, GL, GT, hex(p.accent));

  // top-right: equals
  [cx, cy] = key(1, 0, false);
  barH(cx, cy - 3.1, GL, GT, hex(p.ink));
  barH(cx, cy + 3.1, GL, GT, hex(p.ink));

  // bottom-left: minus
  [cx, cy] = key(0, 1, false);
  barH(cx, cy, GL, GT, hex(p.ink));

  // bottom-right: the solid accent key
  key(1, 1, true);

  return c;
}

const PALETTES = {
  // The original tile's own colours, unchanged.
  colour: { frame: '#2b2c31', ground: '#fdf3e3', face: '#ffffff', stroke: '#b8b9bd', ink: '#23262b', accent: '#b45309' },
  // Remapped onto the brand-blue ramp. Ink and accent take two DIFFERENT blue
  // steps so the plus and the solid key stay tellable apart from the equals.
  blue: { frame: '#14275d', ground: '#cde3fe', face: '#f4f8ff', stroke: '#a9c6ee', ink: '#0f1f4d', accent: '#245edf' },
};

mkdirSync('public/games/blue', { recursive: true });
for (const [variant, dir] of [['colour', 'public/games'], ['blue', 'public/games/blue']]) {
  const png = encodePng(downsample(drawCrunch(PALETTES[variant])));
  const path = `${dir}/btn-crunch.png`;
  writeFileSync(path, png);
  console.log(`${path}  ${png.length} bytes  ${S}x${S} RGBA`);
}
