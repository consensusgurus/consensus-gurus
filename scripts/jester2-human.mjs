// Pure-deduction solver for 2-star boards.
//
// Tier 1  forced      : a unit whose open cells exactly fill its quota; a full
//                       unit whose leftovers pencil out.
// Tier 2  resolution  : enumerate the ways ONE unit can seat its remaining
//                       jesters. A cell in every way is forced; a cell in none is out.
// Tier 3  confinement : the workhorse of 2-star play. If a set of courts needs
//                       exactly as many jesters as a set of rows can hold, those
//                       rows belong to those courts and everything else in them
//                       pencils out. Checked both directions, rows and columns,
//                       for sets of size 1 to 3.
// Tier 4  lookahead   : seat one jester, see a unit die, pencil the cell out.
const K = 2;
const adj = (r1,c1,r2,c2) => Math.abs(r1-r2)<=1 && Math.abs(c1-c2)<=1 && !(r1===r2&&c1===c2);
const combos = (arr, m) => { const out=[]; const go=(i,acc)=>{ if(acc.length===m){out.push(acc.slice());return;} for(let j=i;j<arr.length;j++){acc.push(arr[j]);go(j+1,acc);acc.pop();} }; go(0,[]); return out; };

export function humanSolve2(n, regions, maxSet = 3) {
  const cand = Array.from({length:n},()=>Array(n).fill(true));
  const star = Array.from({length:n},()=>Array(n).fill(false));
  const regCells = Array.from({length:n},()=>[]);
  for (let r=0;r<n;r++) for (let c=0;c<n;c++) regCells[regions[r][c]].push([r,c]);
  const tier = {1:0,2:0,3:0,4:0}; let rounds = 0;

  const mkUnits = () => {
    const u = [];
    for (let r=0;r<n;r++) u.push({kind:'row',key:r,cells:Array.from({length:n},(_,c)=>[r,c])});
    for (let c=0;c<n;c++) u.push({kind:'col',key:c,cells:Array.from({length:n},(_,r)=>[r,c])});
    for (let id=0;id<n;id++) u.push({kind:'reg',key:id,cells:regCells[id]});
    return u;
  };
  const units = mkUnits();
  const rowsU = units.filter(u=>u.kind==='row'), colsU = units.filter(u=>u.kind==='col'), regsU = units.filter(u=>u.kind==='reg');

  const placedIn = (u,s=star) => u.cells.reduce((a,[r,c])=>a+(s[r][c]?1:0),0);
  const needOf   = (u,s=star) => K - placedIn(u,s);
  const opensOf  = (u,g=cand,s=star) => u.cells.filter(([r,c])=>g[r][c] && !s[r][c]);

  const place = (r,c,g=cand,s=star) => {
    s[r][c]=true; g[r][c]=true;
    for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
      const a=r+dr,b=c+dc;
      if ((dr||dc)&&a>=0&&a<n&&b>=0&&b<n&&!s[a][b]) g[a][b]=false;
    }
  };
  const ways = (u,g=cand,s=star) => {
    const need = needOf(u,s), open = opensOf(u,g,s);
    if (need < 0) return null;
    if (need === 0) return [[]];
    if (open.length < need) return [];
    if (open.length > 14) return undefined;
    const out=[];
    const pick=(i,acc)=>{ if(acc.length===need){out.push(acc.slice());return;}
      if(i>=open.length||out.length>600)return;
      const [r,c]=open[i];
      if(!acc.some(([a,b])=>adj(r,c,a,b)) && !u.cells.some(([a,b])=>s[a][b]&&adj(r,c,a,b))) { acc.push([r,c]); pick(i+1,acc); acc.pop(); }
      pick(i+1,acc); };
    pick(0,[]);
    return out;
  };
  const alive = (g,s) => {
    for (const u of units) { const w = ways(u,g,s); if (w === null) return false; if (w && w.length === 0) return false; }
    return true;
  };

  // generalised confinement between two families of units
  const confine = (famA, famB, keyB) => {
    let prog = false;
    const activeA = famA.filter(u=>needOf(u)>0);
    for (let m=1; m<=Math.min(maxSet, activeA.length); m++) {
      for (const S of combos(activeA, m)) {
        const needS = S.reduce((a,u)=>a+needOf(u),0);
        const cells = S.flatMap(u=>opensOf(u));
        if (!cells.length) continue;
        const bKeys = new Set(cells.map(keyB));
        const B = famB.filter(u=>bKeys.has(u.key));
        const capB = B.reduce((a,u)=>a+needOf(u),0);
        if (needS !== capB) continue;
        const inS = new Set(S.map(u=>u.kind+':'+u.key));
        for (const u of B) for (const [r,c] of opensOf(u)) {
          const owner = famA.find(x=>x.cells.some(([a,b])=>a===r&&b===c) && inS.has(x.kind+':'+x.key));
          if (!owner) { cand[r][c]=false; prog = true; }
        }
        if (prog) return true;
      }
    }
    return false;
  };

  for (let iter=0; iter<n*n*12; iter++) {
    const total = star.flat().filter(Boolean).length;
    if (total === K*n) return { solved: units.every(u=>placedIn(u)===K), tier, rounds, star };
    rounds++;
    let prog = false;

    for (const u of units) {
      const need = needOf(u), open = opensOf(u);
      if (need < 0 || open.length < need) return {solved:false,tier,rounds};
      if (need > 0 && open.length === need) { for (const [r,c] of open) place(r,c); tier[1]++; prog = true; }
    }
    if (prog) continue;
    for (const u of units) {
      if (needOf(u) !== 0) continue;
      for (const [r,c] of u.cells) if (cand[r][c] && !star[r][c]) { cand[r][c]=false; tier[1]++; prog = true; }
    }
    if (prog) continue;

    for (const u of units) {
      const w = ways(u); if (w === undefined) continue;
      if (!w || !w.length) return {solved:false,tier,rounds};
      for (const [r,c] of opensOf(u)) {
        const inAll = w.every(sel=>sel.some(([a,b])=>a===r&&b===c));
        const inAny = w.some(sel=>sel.some(([a,b])=>a===r&&b===c));
        if (inAll) { place(r,c); tier[2]++; prog = true; }
        else if (!inAny) { cand[r][c]=false; tier[2]++; prog = true; }
      }
      if (prog) break;
    }
    if (prog) continue;

    if (confine(regsU, rowsU, ([r])=>r))       { tier[3]++; continue; }
    if (confine(regsU, colsU, ([,c])=>c))      { tier[3]++; continue; }
    if (confine(rowsU, regsU, ([r,c])=>regions[r][c])) { tier[3]++; continue; }
    if (confine(colsU, regsU, ([r,c])=>regions[r][c])) { tier[3]++; continue; }

    outer:
    for (let r=0;r<n;r++) for (let c=0;c<n;c++) {
      if (!cand[r][c]||star[r][c]) continue;
      const g = cand.map(x=>x.slice()), s = star.map(x=>x.slice());
      place(r,c,g,s);
      for (const u of units) {
        const p = placedIn(u,s);
        if (p > K) { cand[r][c]=false; tier[4]++; prog=true; break outer; }
        if (p === K) for (const [a,b] of u.cells) if (g[a][b]&&!s[a][b]) g[a][b]=false;
      }
      if (!alive(g,s)) { cand[r][c]=false; tier[4]++; prog=true; break outer; }
    }
    if (!prog) return {solved:false,tier,rounds};
  }
  return {solved:false,tier,rounds};
}
