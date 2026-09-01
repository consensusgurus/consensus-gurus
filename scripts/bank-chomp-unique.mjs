// Bank Chomp boards for the UNIQUENESS ERA. Resumable: every accepted board is
// written to the checkpoint immediately, so a run that is cut short loses at most
// the board it was working on. Background processes do not survive between shell
// calls here and /tmp can be wiped mid-session, so the checkpoint lives beside
// this script.
//
// THE WEEK RUNS THE OTHER WAY NOW. Every board has exactly one winning route, so
// the dial is how many SIGNPOSTS mark it: each mascot is a fixed point on the one
// path, and fewer of them is harder. The cast therefore FALLS Monday to Saturday.
//
// Sunday is the exception and keeps the site's Sunday Edition convention intact:
// a BIGGER BOARD, 8x8 instead of 7x7, carrying the whole cast of eleven. Measured,
// eleven is exactly minimal there (no mascot on a Sunday board can be spared), and
// the route runs 63 moves against a weekday's 48, so Sunday is still the peak
// without having to invert what a Sunday Edition means.
import fs from 'fs';
import { carve, rng } from './gen-chomp-unique.mjs';
import { countRoutes } from './chomp-count.mjs';

export const MASCOTS = ['bulldog', 'ibis', 'gamecock', 'tiger', 'eagle', 'longhorn', 'wildcat', 'seminole', 'knight', 'smokey', 'bull'];
const FIRST = 'bulldog';

// indexed by getUTCDay, 0 = Sunday
export const RUNGS = [
  { w: 8, h: 8, cast: 11, forks: 28, red: 1 },   // Sun: the bigger board and the whole cast
  { w: 7, h: 7, cast: 10, forks: 18, red: 4 },   // Mon: the most signposted board of the week
  { w: 7, h: 7, cast: 10, forks: 19, red: 4 },
  { w: 7, h: 7, cast: 9, forks: 20, red: 4 },
  { w: 7, h: 7, cast: 9, forks: 21, red: 4 },
  { w: 7, h: 7, cast: 9, forks: 22, red: 4 },
  { w: 7, h: 7, cast: 8, forks: 23, red: 1 },    // Sat: the leanest 7x7, every mascot earning its place
];

const CKPT = new URL('./bank-chomp.ckpt.json', import.meta.url).pathname;
const FROM = process.env.FROM || '2026-09-01';
const TO = process.env.TO || '2026-10-16';
const BUDGET = Number(process.env.BUDGET || 150000);

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dates = [];
for (let d = new Date(`${FROM}T12:00:00Z`); d <= new Date(`${TO}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
  dates.push(new Date(d));
}

let done = {};
try { done = JSON.parse(fs.readFileSync(CKPT, 'utf8')); } catch (e) {}

const rnd = rng(((Date.now() / 7) | 0) % 2147483647);
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };

// variety, measured over everything banked so far
const startCount = {}, castOrders = new Set(), boardKeys = new Set();
for (const k of Object.keys(done)) {
  const r = done[k];
  startCount[String(r.start)] = (startCount[String(r.start)] || 0) + 1;
  castOrders.add(r.cast.join('|'));
  boardKeys.add(JSON.stringify([r.start, r.pellets]));
}

function castFor(n) {
  for (let t = 0; t < 200; t++) {
    const rest = shuffle(MASCOTS.filter((m) => m !== FIRST)).slice(0, n - 1);
    const cast = [FIRST, ...rest];
    if (!castOrders.has(cast.join('|'))) return cast;
  }
  return null;
}

function redundantCount(board) {
  let n = 0;
  for (let i = 0; i < board.pellets.length; i++) {
    const q = { ...board, pellets: board.pellets.filter((_, k) => k !== i) };
    const c = countRoutes(q, 2, 900000);
    if (!c.capped && c.n === 1) n += 1;
  }
  return n;
}

const t0 = Date.now();
let made = 0;
for (const d of dates) {
  const live = d.toISOString().slice(0, 10);
  if (done[live]) continue;
  if (Date.now() - t0 > BUDGET) break;
  const rung = RUNGS[d.getUTCDay()];
  let got = null;
  const deadline = Date.now() + (rung.w === 8 ? 120000 : 45000);
  while (Date.now() < deadline && Date.now() - t0 < BUDGET) {
    const r = carve(rung.w, rung.h, 0, 0, rung.cast, rnd);
    if (!r || r.tooTight || r.short) continue;
    if (r.forks < rung.forks) continue;
    // REDUNDANT MASCOTS: how many could be removed one at a time and still leave
    // one path. Each one is a signpost the board did not need, so the cap falls
    // through the week and Saturday and Sunday run at most one.
    if (redundantCount(r.board) > rung.red) continue;
    if ((startCount[String(r.board.start)] || 0) >= 5) continue;
    if (boardKeys.has(JSON.stringify([r.board.start, r.board.pellets]))) continue;
    got = r; break;
  }
  if (!got) { console.log(`${live}  STARVED (${rung.w}x${rung.h}, cast ${rung.cast}, forks >= ${rung.forks})`); continue; }
  const cast = castFor(rung.cast);
  if (!cast) { console.log(`${live}  no fresh cast order left`); continue; }
  // independent re-proof before anything is written down
  const proof = countRoutes(got.board, 2, 6000000);
  if (proof.capped || proof.n !== 1) { console.log(`${live}  re-proof failed (${proof.n}${proof.capped ? ' capped' : ''})`); continue; }

  const row = {
    live,
    dateLabel: `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`,
    quizId: `chomp-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${String(d.getUTCFullYear()).slice(2)}`,
    sunday: d.getUTCDay() === 0,
    w: rung.w, h: rung.h,
    start: got.board.start, pellets: got.board.pellets,
    cast, floor: got.floor, min: got.min,
    forks: got.forks, minimal: got.minimal, playable: got.playable,
  };
  done[live] = row;
  startCount[String(row.start)] = (startCount[String(row.start)] || 0) + 1;
  castOrders.add(cast.join('|'));
  boardKeys.add(JSON.stringify([row.start, row.pellets]));
  fs.writeFileSync(CKPT, JSON.stringify(done, null, 1));
  made += 1;
  console.log(`${live}  ${rung.w}x${rung.h} cast ${rung.cast} forks ${got.forks} minimal ${got.minimal} route ${got.min}`);
}
const total = Object.keys(done).length;
console.log(`\n${made} this run, ${total} of ${dates.length} banked, ${dates.length - total} to go`);
