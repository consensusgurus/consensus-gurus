#!/usr/bin/env node
// Generates the FDA-style Nutrition Facts label SVGs for the
// "Name the ___ from Its Nutrition Label" quiz series (format: 'photo').
// Data lives in scripts/nutrition-label-data.mjs; output lands in
// public/nutrition-labels/<id>.svg (750x1000, 3:4 portrait).
// Re-run after editing the data file: node scripts/generate-nutrition-labels.mjs

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUCTS } from './nutrition-label-data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'nutrition-labels');
mkdirSync(OUT, { recursive: true });

const W = 750, H = 1000, PAD = 46, LX = PAD + 18, RX = W - PAD - 18;
const IW = RX - LX; // inner width

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// FDA adult daily values (2016 label rules).
const DV = { fat: 78, satFat: 20, sodium: 2300, carb: 275, fiber: 28, addedSugars: 50 };
const pctDV = (val, key) => {
  if (typeof val !== 'number' || !DV[key]) return null;
  return Math.round((val / DV[key]) * 100);
};

// Greedy word-wrap by estimated glyph width (uppercase Helvetica ~0.64em).
function wrap(text, fontSize, maxWidth, avgEm = 0.64) {
  const avg = fontSize * avgEm;
  const perLine = Math.max(8, Math.floor(maxWidth / avg));
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (t.length > perLine && cur) { lines.push(cur); cur = w; } else { cur = t; }
  }
  if (cur) lines.push(cur);
  return lines;
}

const g = (v, unit = 'g') => (v === null || v === undefined) ? null : `${v}${unit}`;

function labelSvg(p) {
  const rows = [];
  let y = 0;
  const line = (h) => { rows.push(`<rect x="${LX}" y="${y}" width="${IW}" height="${h}" fill="#1c1e24"/>`); y += h; };
  const text = (str, x, yy, size, opts = {}) => {
    const { bold = false, anchor = 'start' } = opts;
    return `<text x="${x}" y="${yy}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" ${bold ? 'font-weight="bold"' : ''} text-anchor="${anchor}" fill="#1c1e24">${esc(str)}</text>`;
  };

  // ── Header ──
  y = 108;
  rows.push(text('Nutrition Facts', LX - 2, y, 56, { bold: true }));
  y += 16;
  line(1);
  y += 27;
  if (p.servingsPerContainer) { rows.push(text(p.servingsPerContainer, LX, y, 21)); y += 31; }
  rows.push(text('Serving size', LX, y, 22, { bold: true }));
  rows.push(text(p.servingSize, RX, y, 22, { bold: true, anchor: 'end' }));
  y += 15;
  line(9);

  // ── Calories ──
  y += 28;
  rows.push(text('Amount per serving', LX, y, 18, { bold: true }));
  y += 42;
  rows.push(text('Calories', LX, y, 38, { bold: true }));
  rows.push(text(String(p.calories), RX, y, 50, { bold: true, anchor: 'end' }));
  y += 13;
  line(5);
  y += 24;
  rows.push(text('% Daily Value*', RX, y, 17, { bold: true, anchor: 'end' }));
  y += 8;
  line(1);

  // ── Nutrient rows ──
  const nutrient = (label, val, dvKey, { bold = true, indent = 0, raw = null } = {}) => {
    if (val === null || val === undefined) return;
    y += 28;
    if (raw) {
      rows.push(text(raw, LX + indent, y, 20));
    } else {
      rows.push(`<text x="${LX + indent}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="20" fill="#1c1e24"><tspan${bold ? ' font-weight="bold"' : ''}>${esc(label)}</tspan><tspan> ${esc(val)}</tspan></text>`);
    }
    const dv = dvKey ? pctDV(typeof val === 'string' && val.startsWith('<') ? null : parseFloat(val), dvKey) : null;
    if (dv !== null) rows.push(text(`${dv}%`, RX, y, 20, { bold: true, anchor: 'end' }));
    y += 9;
    line(1);
  };
  nutrient('Total Fat', g(p.fat), 'fat');
  nutrient('Saturated Fat', g(p.satFat), 'satFat', { bold: false, indent: 24 });
  nutrient('Sodium', g(p.sodium, 'mg'), 'sodium');
  nutrient('Total Carbohydrate', g(p.carb), 'carb');
  nutrient('Dietary Fiber', g(p.fiber), 'fiber', { bold: false, indent: 24 });
  nutrient('Total Sugars', g(p.sugars), null, { bold: false, indent: 24 });
  if (p.addedSugars !== null && p.addedSugars !== undefined) {
    nutrient('', '', null, { raw: `Includes ${p.addedSugars}g Added Sugars`, bold: false, indent: 48 });
    // DV for added sugars drawn by the raw row above; add it manually:
    const adv = pctDV(parseFloat(p.addedSugars), 'addedSugars');
    if (adv !== null) rows.push(text(`${adv}%`, RX, y - 10, 20, { bold: true, anchor: 'end' }));
  }
  nutrient('Protein', g(p.protein), null);
  y += 3;
  line(9);

  // ── Extra facts (caffeine, juice %) ──
  if (p.extras && p.extras.length) {
    for (const ex of p.extras) {
      y += 27;
      rows.push(text(ex, LX, y, 19, { bold: true }));
    }
    y += 13;
    line(4);
  }

  // ── Ingredients ──
  y += 33;
  rows.push(text('INGREDIENTS:', LX, y, 20, { bold: true }));
  const ingLines = wrap(p.ingredients.toUpperCase(), 18, IW);
  const reserve = p.contains ? 2 : 0;
  const maxIng = Math.max(1, Math.floor((H - 76 - y) / 25) - reserve);
  let shown = ingLines;
  if (ingLines.length > maxIng) {
    shown = ingLines.slice(0, maxIng);
    shown[maxIng - 1] = shown[maxIng - 1].replace(/[,;]?\s*\S*$/, ' ...');
  }
  for (const l of shown) { y += 25; rows.push(text(l, LX, y, 18)); }
  if (p.contains) {
    y += 31;
    for (const l of wrap(p.contains.toUpperCase(), 18, IW, 0.68).slice(0, 2)) {
      rows.push(text(l, LX, y, 18, { bold: true }));
      y += 25;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#f2f0ea"/>
<rect x="${PAD - 14}" y="${PAD - 14}" width="${W - 2 * (PAD - 14)}" height="${H - 2 * (PAD - 14)}" rx="6" fill="#ffffff" stroke="#d8d5cc" stroke-width="1"/>
<rect x="${PAD}" y="${PAD}" width="${W - 2 * PAD}" height="${H - 2 * PAD}" fill="none" stroke="#1c1e24" stroke-width="3"/>
${rows.join('\n')}
</svg>`;
}

let n = 0;
for (const p of PRODUCTS) {
  writeFileSync(join(OUT, `${p.id}.svg`), labelSvg(p));
  n++;
}
console.log(`Wrote ${n} labels to public/nutrition-labels/`);
