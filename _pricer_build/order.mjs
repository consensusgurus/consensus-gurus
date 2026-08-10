import {B1} from './data1.mjs'; import {B2} from './data2.mjs'; import {B3} from './data3.mjs'; import {B4} from './data4.mjs';
const ALL=[...B1,...B2,...B3,...B4];
const by=n=>ALL.find(b=>b.n===n);
const D0=Date.UTC(2026,7,10);                        // Monday 2026-08-10
const dayOf=s=>new Date(D0+(s-1)*86400000);
const SUN=[]; for(let s=1;s<=30;s++) if(dayOf(s).getUTCDay()===0) SUN.push(s);
const BIG=ALL.filter(b=>b.items.length===32).map(b=>b.n);      // 5,12,19,26
const PIN={1:2, 2:1};                                          // slot1 McDonald's(n=2), slot2 Coffee(n=1)
const rest=ALL.map(b=>b.n).filter(n=>!BIG.includes(n)&&n!==1&&n!==2);
const freeSlots=[]; for(let s=1;s<=30;s++) if(!SUN.includes(s)&&!PIN[s]) freeSlots.push(s);
if(freeSlots.length!==rest.length) throw new Error('slot/board mismatch');

let seed=987654321; const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

function check(assign){                                        // assign: slot -> board n
  const fam={},last={}; let prev=null,run=1,wk={};
  for(let s=1;s<=30;s++){
    const b=by(assign[s]), d=dayOf(s);
    if((d.getUTCDay()===0)!==(b.items.length===32)) return 'sunday/size';
    fam[b.fam]=(fam[b.fam]||0)+1;
    if(fam[b.fam]>2) return 'fam>2 '+b.fam;
    if(last[b.fam]!=null && (s-last[b.fam])<=10) return 'famgap '+b.fam;
    last[b.fam]=s;
    run = b.dir===prev ? run+1 : 1; prev=b.dir;
    if(run>4) return 'dirrun';
    const w=Math.floor((s-1)/7); if(b.link) wk[w]=(wk[w]||0)+1;
  }
  for(const w of [0,1,2,3]) if((wk[w]||0)<2||(wk[w]||0)>3) return `week${w} shoppable=${wk[w]||0}`;
  if((wk[4]||0)>2) return 'week4 shoppable';
  return null;
}
let found=null, tries=0;
for(;tries<400000 && !found;tries++){
  const a={...PIN}; const bigs=shuffle(BIG), r=shuffle(rest);
  SUN.forEach((s,i)=>a[s]=bigs[i]); freeSlots.forEach((s,i)=>a[s]=r[i]);
  if(!check(a)) found=a;
}
if(!found) throw new Error('no arrangement found in '+tries+' tries');
console.log(`solved in ${tries} tries\n`);
const order=[]; for(let s=1;s<=30;s++) order.push(found[s]);
console.log('export const ORDER = '+JSON.stringify(order)+';');
const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
let wk={};
for(let s=1;s<=30;s++){const b=by(found[s]),d=dayOf(s);const w=Math.floor((s-1)/7);if(b.link)wk[w]=(wk[w]||0)+1;
  console.log(`${String(s).padStart(2)} ${d.toISOString().slice(0,10)} ${DOW[d.getUTCDay()]}${d.getUTCDay()===0?'*':' '} ${String(b.items.length).padStart(2)} ${b.dir==='min'?'LESS':'MORE'} ${(b.link||'-').padEnd(6)} ${b.fam.padEnd(13)} ${b.cat}`);}
console.log('\nshoppable per week:',[0,1,2,3,4].map(w=>wk[w]||0).join(', '));
