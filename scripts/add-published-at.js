#!/usr/bin/env node
// Adds a `publishedAt` ISO-timestamp field next to every `publishedDate`
// field in lib/data.js. Same-day lists get spaced-out hours starting at
// 09:00 UTC, preserving the file's current order so existing recency
// ranking is unchanged within a day.
//
// Run from the repo root:
//   node scripts/add-published-at.js
//
// Safe to run multiple times — entries that already have publishedAt are
// skipped.

const fs = require('fs');
const path = require('path');

const TARGET = path.join(__dirname, '..', 'lib', 'data.js');
const src = fs.readFileSync(TARGET, 'utf8');
const lines = src.split('\n');

const dateCounter = new Map();
const out = [];
const dateLine = /^(\s*)publishedDate:\s*'(\d{4}-\d{2}-\d{2})',\s*$/;
let added = 0;
let skipped = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  out.push(line);
  const m = line.match(dateLine);
  if (!m) continue;

  // Skip if the very next line already declares publishedAt
  const next = lines[i + 1] || '';
  if (/^\s*publishedAt:/.test(next)) {
    skipped++;
    continue;
  }

  const [, indent, date] = m;
  const n = dateCounter.get(date) || 0;
  dateCounter.set(date, n + 1);

  // 09:00, 10:00, ... 22:00 UTC for up to 14 same-day lists, then minute spread
  let hour = 9 + n;
  let minute = 0;
  if (hour > 22) {
    hour = 22;
    minute = Math.min(59, (n - 13) * 4);
  }
  const pad = (x) => String(x).padStart(2, '0');
  const ts = `${date}T${pad(hour)}:${pad(minute)}:00Z`;
  out.push(`${indent}publishedAt: '${ts}',`);
  added++;
}

fs.writeFileSync(TARGET, out.join('\n'));
console.log(`Added publishedAt to ${added} list(s). Skipped ${skipped} (already present).`);
console.log('Per-day counts:');
for (const [date, count] of [...dateCounter.entries()].sort()) {
  console.log(`  ${date}: ${count}`);
}
