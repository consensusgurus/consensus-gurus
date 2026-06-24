'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BadgeCheck, UserPlus, ChevronDown } from 'lucide-react';
import { DEPT_LABEL } from '@/lib/quiz-departments';

// One shared player stat bar used in the SiteHeader inlay on every quiz surface.
// Renders a STABLE skeleton (same structure in every state) so values just fill
// in when /api/quiz/me resolves — no layout swap, no load/resize jitter. Mobile
// collapses to player + rank + Stat Hub; tap to expand the stats.
const ACCENT='#2563eb', INK='#1c1e24', MUTED='#6b7280', SOFT='#aeb4bd', LINE='rgba(20,22,28,0.09)';
const lbl={fontSize:10,fontWeight:600,letterSpacing:'.04em',textTransform:'uppercase',color:MUTED,marginBottom:2};

function getAnonId(){try{return localStorage.getItem('sot_quiz_anon');}catch{return null;}}
function getIdentity(){try{return JSON.parse(localStorage.getItem('sot_quiz_identity'));}catch{return null;}}

function Stat({value, rank, label}){
  return (
    <div>
      <div style={{display:'flex',alignItems:'baseline',gap:3}}>
        <span style={{fontSize:17,fontWeight:700,color:ACCENT}}>{value}</span>
        {rank?<span style={{fontSize:11,fontWeight:700,color:SOFT}}>#{rank}</span>:null}
      </div>
      <div style={lbl}>{label}</div>
    </div>
  );
}

export default function QuizPlayerBar(){
  const [me,setMe]=useState(undefined); // undefined=loading, null=guest, object=fetched
  const [open,setOpen]=useState(false);
  useEffect(()=>{
    const ident=getIdentity(); const anonId=getAnonId();
    const email=ident&&ident.email?ident.email:'';
    if(!anonId&&!email){setMe(null);return;}
    const params=new URLSearchParams();
    if(anonId)params.set('anonId',anonId);
    if(email)params.set('email',email);
    fetch(`/api/quiz/me?${params.toString()}`).then(r=>r.json()).then(d=>setMe(d||null)).catch(()=>setMe(null));
  },[]);
  const found=me&&me.found;
  const determined=me!==undefined;
  const a=(found&&me.activity)||{};
  const rk=(found&&me.ranks)||{};
  const rank=found&&((me.ranks&&me.ranks.rating)||me.rank);
  const denom=found&&me.totalPlayers;
  let bestCat=null;
  if(found&&me.byCategory){
    for(const k of Object.keys(me.byCategory)){
      const c=me.byCategory[k]; if(!c||!(c.matches>0)) continue;
      const cand={key:k, rank:c.completedRank??c.rank, catTotal:c.catTotal, cR:c.completedRank??Infinity, sR:c.rank??Infinity, pR:c.playedRank??Infinity};
      if(!bestCat||cand.cR<bestCat.cR||(cand.cR===bestCat.cR&&cand.sR<bestCat.sR)||(cand.cR===bestCat.cR&&cand.sR===bestCat.sR&&cand.pR<bestCat.pR)) bestCat=cand;
    }
  }
  const dash='—';
  return (
    <div className={`qpb${open?' open':''}`} onClick={()=>setOpen(v=>!v)} style={{display:'flex',flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:16,padding:'10px 14px',background:'#fff',borderRadius:11,minHeight:56,boxSizing:'border-box'}}>
      <style>{`.qpb-chev{display:none;}@media(max-width:1023px){.qpb-bestcat{display:none !important;}}@media(max-width:560px){.qpb{cursor:pointer;}.qpb:not(.open) .qpb-stats{display:none !important;}.qpb.open .qpb-stats{order:9 !important;flex:1 1 100% !important;margin-left:0 !important;justify-content:space-between !important;}.qpb-chev{display:inline-flex !important;}.qpb-hub{margin-left:auto !important;}}`}</style>
      <div style={{display:'flex',flexDirection:'column',minWidth:0}}>
        <div style={lbl}>Player</div>
        {found?(
          <div style={{display:'flex',alignItems:'center',gap:5,fontSize:16,fontWeight:800,color:INK,lineHeight:1.15,minWidth:0}}><span style={{minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{me.name}</span>{me.signed?<BadgeCheck size={13} strokeWidth={2.5} style={{color:ACCENT,flex:'none'}}/>:null}</div>
        ):determined?(
          <Link href="/quizzes/hub" onClick={e=>e.stopPropagation()} style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:14,fontWeight:800,color:ACCENT,lineHeight:1.15,textDecoration:'none'}}><UserPlus size={14}/> Sign up</Link>
        ):(
          <div style={{fontSize:16,fontWeight:800,color:SOFT,lineHeight:1.15}}>{dash}</div>
        )}
      </div>
      <div style={{width:1,height:34,background:LINE}}/>
      <div>
        <div style={lbl}>Rank</div>
        <div style={{display:'flex',alignItems:'baseline',gap:5}}><span style={{fontSize:17,fontWeight:800,color:rank?ACCENT:SOFT,lineHeight:1}}>{rank?`#${rank}`:dash}</span>{rank&&denom?<span style={{fontSize:11,color:MUTED}}>of {denom.toLocaleString()}</span>:null}</div>
      </div>
      <ChevronDown className="qpb-chev" size={15} strokeWidth={2.5} style={{color:'#9aa0aa',transition:'transform .15s',transform:open?'rotate(180deg)':'none'}}/>
      <div className="qpb-stats" style={{display:'flex',flex:'1 1 auto',justifyContent:'space-evenly',gap:14,marginLeft:18,flexWrap:'wrap'}}>
        <Stat value={found&&a.played!=null?a.played:dash} rank={found?rk.played:null} label="Played"/>
        <Stat value={found&&a.correct!=null?a.correct.toLocaleString():dash} rank={found?rk.correct:null} label="Correct"/>
        <Stat value={found&&a.accuracy!=null?`${a.accuracy}%`:dash} rank={found?rk.accuracy:null} label="Accuracy"/>
        <Stat value={found&&a.completed!=null?a.completed:dash} rank={found?rk.completed:null} label="Completed"/>
      </div>
      {bestCat?(
        <div className="qpb-bestcat">
          <div style={lbl}>Best category</div>
          <div style={{display:'flex',alignItems:'baseline',gap:5,whiteSpace:'nowrap'}}>
            <span style={{fontSize:14,fontWeight:700,color:INK,lineHeight:1.2}}>{DEPT_LABEL[bestCat.key]||'—'}</span>
            {bestCat.rank?<span style={{fontSize:11,color:MUTED}}>#{bestCat.rank}{bestCat.catTotal?` of ${bestCat.catTotal.toLocaleString()}`:''}</span>:null}
          </div>
        </div>
      ):null}
      <span className="qpb-hub"><Link href="/quizzes/hub" onClick={e=>e.stopPropagation()} style={{display:'inline-flex',alignItems:'center',gap:6,background:'#e9f1fd',color:ACCENT,border:'1px solid #cfe0fa',borderRadius:9,padding:'8px 14px',fontWeight:700,fontSize:13,textDecoration:'none',whiteSpace:'nowrap'}}>Stat Hub</Link></span>
    </div>
  );
}
