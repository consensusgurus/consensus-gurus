/*
  Turn a gathered MLB snapshot into the `mlb` block of lib/gridiron-data.js.

  The GATHER runs in a browser (ESPN's APIs are open to a www.espn.com tab and
  closed to everything else, see CLAUDE-RANKINGS.md section 3) and writes a
  JSON file; this script is the deterministic half, so a week can be rebuilt
  from its snapshot without re-fetching and a reviewer can see exactly what
  the file was made from. It invents nothing: every number here is copied.

  Usage: node scripts/mlb-snapshot-to-data.mjs <snapshot.json> [models.json]
  Prints the block to stdout.

  Snapshot shape:
    { fetchedAt, season, brK, cols, teams: [[id, abbr, displayName, ...]],
      games: ["<id-401000000>,MMDD,hid,aid,neutral,hs,as,hbr*100,abr*100,hml,aml"],
      futures: [[board, providerId, teamId, americanOdds]] }
*/
import fs from 'fs';

const OPENING_DAY = '2026-03-26';
const weekOf = (iso) => Math.floor((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${OPENING_DAY}T00:00:00Z`)) / 604800000) + 1;

const snapPath = process.argv[2];
const modelPath = process.argv[3];
if (!snapPath) { console.error('usage: node scripts/mlb-snapshot-to-data.mjs <snapshot.json> [models.json]'); process.exit(1); }
const snap = JSON.parse(fs.readFileSync(snapPath, 'utf8'));
const models = modelPath ? JSON.parse(fs.readFileSync(modelPath, 'utf8')) : { sources: {} };

// ESPN files the ALL-STAR GAME under season type 2 alongside the real ones,
// played by two entities with their own team ids (31 AL, 32 NL) that are not
// clubs. A regular-season filter therefore lets it through, and it then trips
// the unresolved-team rule in lib/gridiron.js exactly as it should. Drop it at
// the source rather than teaching the registry about a team that is not one.
const EXHIBITION_TEAM_IDS = new Set([31, 32]);

const games = [], lines = [];
let dropped = 0;
for (const row of snap.games) {
  const c = row.split(',').map(Number);
  if (EXHIBITION_TEAM_IDS.has(c[2]) || EXHIBITION_TEAM_IDS.has(c[3])) { dropped++; continue; }
  const id = String(401000000 + c[0]);
  const d = `${snap.season}-${String(c[1]).padStart(4, '0').slice(0, 2)}-${String(c[1]).padStart(4, '0').slice(2)}`;
  const w = weekOf(d);
  const [hid, aid, n, hs, as] = [String(c[2]), String(c[3]), c[4], c[5], c[6]];
  games.push({ w, id, d, hid, aid, n, hs, as, hbr: c[7] / 100, abr: c[8] / 100 });
  lines.push({ w, id, hid, aid, n, hml: c[9], aml: c[10] });
}
games.sort((a, b) => a.d.localeCompare(b.d) || Number(a.id) - Number(b.id));
lines.sort((a, b) => a.w - b.w || Number(a.id) - Number(b.id));

if (dropped) console.error(`dropped ${dropped} exhibition game(s) (All-Star)`);
const lastDate = games[games.length - 1].d;
const week = weekOf(lastDate);

// Futures: ESPN BET's World Series board is the only one that prices all 30
// teams. It is carried for DISPLAY (see the market note in section 3) and is
// not scored, so only the widest board is worth keeping.
const byId = new Map(snap.teams.map((t) => [t[0], t[2]]));
const ws = snap.futures.filter((f) => /World Series/i.test(f[0]));
const counts = {};
for (const f of ws) counts[f[1]] = (counts[f[1]] || 0) + 1;
// Keep the board that prices the MOST teams. On 2026-09-04 that is ESPN BET
// with all 30; DraftKings had dropped to 25, and every division board was down
// to two to five teams, which is why only this one is carried.
const bestProvider = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
const PROVIDERS = { 58: 'ESPN BET', 100: 'DraftKings' };
const wsRows = ws.filter((f) => String(f[1]) === String(bestProvider))
  .map((f) => [byId.get(f[2]), f[3]])
  .filter((r) => r[0]);
const providerName = PROVIDERS[bestProvider] || `provider ${bestProvider}`;

const sources = {
  ...models.sources,
  wsfutures: {
    label: `World Series Futures · ${providerName}`,
    short: 'Futures',
    tier: 'market',
    kind: 'priced',
    lowerIsBetter: true,
    asOf: snap.fetchedAt,
    url: 'https://www.espn.com/mlb/futures',
    values: wsRows,
  },
};

const J = (v) => JSON.stringify(v);
const out = [];
out.push('  mlb: {');
out.push(`    sport: 'mlb', week: ${week}, gamesAt: ${J(snap.fetchedAt)}, linesAt: ${J(snap.fetchedAt)},`);
out.push(`    // BaseRuns B-multiplier fit so that league BaseRuns equals league runs`);
out.push(`    // on this season's 2,109 games (18,898 of each). Re-fit every January.`);
out.push(`    brK: ${snap.brK},`);
out.push('    sources: {');
for (const [id, src] of Object.entries(sources)) {
  out.push(`      ${id}: {`);
  for (const k of ['label', 'short', 'tier', 'kind', 'lowerIsBetter', 'asOf', 'url']) {
    if (src[k] !== undefined) out.push(`        ${k}: ${J(src[k])},`);
  }
  if (src.teams) {
    out.push('        teams: [');
    for (const t of src.teams) out.push(`          ${J(t)},`);
    out.push('        ],');
  }
  if (src.values) {
    out.push('        values: [');
    for (const v of src.values) out.push(`          ${J(v)},`);
    out.push('        ],');
  }
  out.push('      },');
}
out.push('    },');
out.push(`    games: [`);
for (const g of games) out.push(`      ${J(g)},`);
out.push('    ],');
out.push(`    lines: [`);
for (const l of lines) out.push(`      ${J(l)},`);
out.push('    ],');
out.push('  },');
process.stdout.write(out.join('\n') + '\n');
