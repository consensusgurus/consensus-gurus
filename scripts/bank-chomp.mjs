// Bank generator for the walled Chomp era. Resumable: checkpoints every accept.
import { candidate, rng, MASCOTS } from './gen-chomp.mjs';
import fs from 'fs';
const OUT = './chomp-bank.json';
// dow -> rung. Spare bands are the shipped ramp; detour floor 8 everywhere
// (measured reachable at every rung with walls), bite >= 2, run <= 2.4.
const RAMP = {
  0: { cast: 11, spare: [0, 2] },
  1: { cast: 8,  spare: [9, 11] },
  2: { cast: 8,  spare: [7, 8] },
  3: { cast: 9,  spare: [6, 7] },
  4: { cast: 9,  spare: [5, 6] },
  5: { cast: 9,  spare: [4, 5] },
  6: { cast: 10, spare: [3, 5] },
};
const NEED = { 0: 8, 1: 8, 2: 8, 3: 8, 4: 8, 5: 9, 6: 8 };
const DET_FLOOR = 8, RUN_CAP = 2.4, BITE_MIN = 2;
let bank = {};
try { bank = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch (e) {}
for (const k of Object.keys(NEED)) bank[k] = bank[k] || [];
const layoutKey = (c) => JSON.stringify([c.p.start, c.p.pellets, c.p.walls]);
const seen = new Set(); const startUse = {};
for (const k of Object.keys(bank)) for (const c of bank[k]) {
  seen.add(layoutKey(c)); startUse[String(c.p.start)] = (startUse[String(c.p.start)] || 0) + 1;
}
const seed = Number(process.argv[2] || 1), budget = Number(process.argv[3] || 120000);
const dows = (process.argv[4] ? process.argv[4].split(',').map(Number) : [0,1,2,3,4,5,6]);
const rnd = rng(seed);
const t0 = Date.now();
let tried = 0;
while (Date.now() - t0 < budget) {
  // work the emptiest rung first (relative to need)
  const open = dows.filter((d) => bank[d].length < NEED[d]);
  if (!open.length) break;
  open.sort((a, b) => (bank[a].length / NEED[a]) - (bank[b].length / NEED[b]));
  const dow = open[0];
  const rung = RAMP[dow];
  const nW = 5 + ((rnd() * 3) | 0);
  tried++;
  const c = candidate(rung.cast, nW, rung.spare, [0, 40], rnd);
  if (!c) continue;
  if (c.spare < rung.spare[0] || c.spare > rung.spare[1]) continue;
  if (c.det < DET_FLOOR || c.run > RUN_CAP + 1e-9 || c.bite == null || c.bite < BITE_MIN) continue;
  const key = layoutKey(c);
  if (seen.has(key)) continue;
  if ((startUse[String(c.p.start)] || 0) >= 4) continue;
  seen.add(key); startUse[String(c.p.start)] = (startUse[String(c.p.start)] || 0) + 1;
  bank[dow].push(c);
  fs.writeFileSync(OUT, JSON.stringify(bank));
}
console.log('tried', tried, 'state:', Object.keys(NEED).map((d) => `${d}:${bank[d].length}/${NEED[d]}`).join(' '));
