// 2-star board producer for the Thu-Sun rollout. Imports the REPO's generator
// primitives and deduction solver so what we bank is what the verifier proves.
import { rng, randomPlacement, growRegions, makeSolver, repair, contiguous } from './jester2-generate.mjs';
import { humanSolve2 } from './jester2-human.mjs';
import { PUZZLES } from '../app/jesters/puzzles.js';
import fs from 'fs';
const N = 10, TARGET = Number(process.argv[2]||60), BUDGET = Number(process.argv[3]||60000);
const OUT = process.argv[4] || '/tmp/j2bank.json';
let bank = [];
try { bank = JSON.parse(fs.readFileSync(OUT,'utf8')); } catch(e) {}
const seen = new Set(bank.map(b=>JSON.stringify(b.regions)));
// never collide with a layout already in the live bank (the 7 banked Sundays)
for (const p of PUZZLES) seen.add(JSON.stringify(p.regions));
const rnd = rng(Number(process.argv[5]|| (Date.now()%1e9)));
const t0 = Date.now();
let checked=0, rejected=0;
while (bank.length < TARGET && Date.now()-t0 < BUDGET) {
  const rows = randomPlacement(N, rnd); if (!rows) continue;
  const g = growRegions(N, rows, rnd); if (!g) continue;
  let reg = g.reg;
  if (makeSolver(N,reg)(2).length !== 1) { const f = repair(N,reg,g.stars,rnd); if(!f) continue; reg=f; }
  const hs = humanSolve2(N, reg);
  if (!hs.solved) continue;
  checked++;
  const sols = makeSolver(N,reg)(3);
  if (sols.length !== 1) { rejected++; continue; }
  const exact = sols[0];
  const human = Array.from({length:N},(_,r)=>{ const cs=[]; for(let c=0;c<N;c++) if(hs.star[r][c]) cs.push(c); return cs; });
  if (JSON.stringify(human) !== JSON.stringify(exact)) { rejected++; continue; }
  let structOK = true;
  const sizes = Array(N).fill(0);
  for (let r=0;r<N;r++) for (let c=0;c<N;c++) { const id=reg[r][c];
    if(!Number.isInteger(id)||id<0||id>=N) structOK=false; else sizes[id]++; }
  for (let id=0;id<N&&structOK;id++) if (sizes[id]<4 || !contiguous(N,reg,id)) structOK=false;
  const flat=[]; for(let r=0;r<N;r++) for(const c of exact[r]) flat.push([r,c]);
  if (flat.length !== 2*N) structOK=false;
  const colN=Array(N).fill(0), regN=Array(N).fill(0);
  for (const [r,c] of flat){ colN[c]++; regN[reg[r][c]]++; }
  if (colN.some(x=>x!==2)||regN.some(x=>x!==2)) structOK=false;
  for (let i=0;i<flat.length;i++) for (let j=i+1;j<flat.length;j++){
    const [a,b]=flat[i],[c2,d]=flat[j];
    if (Math.abs(a-c2)<=1 && Math.abs(b-d)<=1) structOK=false; }
  if (!structOK) { rejected++; continue; }
  const key = JSON.stringify(reg);
  if (seen.has(key)) continue;
  seen.add(key);
  const score = +(hs.tier[2]*1 + hs.tier[3]*4 + hs.tier[4]*6 + hs.rounds*0.25).toFixed(2);
  bank.push({ regions: reg, solution: exact, tier: hs.tier, rounds: hs.rounds, score });
  fs.writeFileSync(OUT, JSON.stringify(bank));
}
fs.writeFileSync(OUT, JSON.stringify(bank));
console.log(`banked ${bank.length}/${TARGET} (validated ${checked}, rejected ${rejected}) in ${((Date.now()-t0)/1000).toFixed(1)}s`);
