'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, ArrowRight, BadgeCheck, UserPlus, ChevronDown } from 'lucide-react';

// One shared player stat bar used in the SiteHeader inlay on every quiz surface
// (hub, play pages, Stat Hub, Business News). Self-fetches /api/quiz/me. Stat
// values stay full-size; the per-category rank sits as a tiny superscript to the
// SIDE so the bar never changes height. Mobile collapses to player + rank + Stat
// Hub; tap to expand the four stats.
const ACCENT='#2563eb', INK='#1c1e24', MUTED='#6b7280', SOFT='#aeb4bd', LINE='rgba(20,22,28,0.09)';
const lbl={fontSize:10,fontWeight:600,letterSpacing:'.04em',textTransform:'uppercase',color:MUTED,marginBottom:2};

function getAnonId(){try{return localStorage.getItem('sot_quiz_anon');}catch{return null;}}
function getIdentity(){try{return JSON.parse(localStorage.getItem('sot_quiz_identity'));}catch{return null;}}

function Stat({value, rank, label}){
  return (
    <div>
      <div style={{display:'flex',alignItems:'baseline',gap:3}}>
        <span style={{fontSize:17,fontWeight:700,color:ACCENT}}>{value}</span>
        {rank?<span style={{fontSize:9,fontWeight:700,color:SOFT}}>#{rank}</span>:null}
      </div>
      <div style={lbl}>{label}</div>
    </div>
  );
}

export default function QuizPlayerBar(){
  const [me,setMe]=useState(null);
  const [open,setOpen]=useState(false);
  useEffect(()=>{
    const ident=getIdentity(); const anonId=getAnonId();
    const email=ident&&ident.email?ident.email:'';
    if(!anonId&&!email){setMe(null);return;}
    const params=new URLSearchParams();
    if(anonId)params.set('anonId',anonId);
    if(email)params.set('email',email);
    fetch(`/api/quiz/me?${params.toString()}`).then(r=>r.json()).then(d=>{if(d)setMe(d);}).catch(()=>{});
  },[]);
  const found=me&&me.found;
  const a=(me&&me.activity)||{};
  const rk=(me&&me.ranks)||{};
  const rank=me&&((me.ranks&&me.ranks.rating)||me.rank);
  const denom=me&&me.totalPlayers;
  return (
    <div className={`qpb${open?' open':''}`} onClick={()=>setOpen(v=>!v)} style={{display:'flex',flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:16,padding:'10px 14px',background:'#fff',borderRadius:11}}>
      <style>{`.qpb-chev{display:none;}@media(max-width:560px){.qpb{cursor:pointer;}.qpb:not(.open) .qpb-stats{display:none !important;}.qpb.open .qpb-stats{order:9 !important;flex:1 1 100% !important;margin-left:0 !important;justify-content:space-between !important;}.qpb-chev{display:inline-flex !important;}.qpb-hub{margin-left:auto !important;}}`}</style>
      {found?(
        <div style={{display:'flex',flexDirection:'column',minWidth:0}}>
          <div style={lbl}>Player</div>
          <div style={{display:'flex',alignItems:'center',gap:5,fontSize:16,fontWeight:800,color:INK,lineHeight:1.15,minWidth:0}}><span style={{minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{me.name}</span>{me.signed?<BadgeCheck size={13} strokeWidth={2.5} style={{color:ACCENT,flex:'none'}}/>:null}</div>
        </div>
      ):(
        <Link href="/quizzes/hub" onClick={e=>e.stopPropagation()} style={{display:'inline-flex',alignItems:'center',gap:6,background:ACCENT,color:'#fff',border:'none',borderRadius:9,padding:'9px 14px',fontWeight:700,fontSize:13,textDecoration:'none',whiteSpace:'nowrap'}}><UserPlus size={15}/> Sign up</Link>
      )}
      {found?(<>
        <div style={{width:1,height:34,background:LINE}}/>
        <div>
          <div style={lbl}>Rank</div>
          {rank?<div style={{display:'flex',alignItems:'baseline',gap:5}}><span style={{fontSize:17,fontWeight:800,color:ACCENT,lineHeight:1}}>{`#${rank}`}</span>{denom?<span style={{fontSize:11,color:MUTED}}>of {denom.toLocaleString()}</span>:null}</div>:<div style={{fontSize:12,fontWeight:600,color:MUTED}}>—</div>}
        </div>
        <ChevronDown className="qpb-chev" size={15} strokeWidth={2.5} style={{color:'#9aa0aa',transition:'transform .15s',transform:open?'rotate(180deg)':'none'}}/>
        <div className="qpb-stats" style={{display:'flex',flex:'1 1 auto',justifyContent:'space-evenly',gap:14,marginLeft:18,flexWrap:'wrap'}}>
          <Stat value={a.played!=null?a.played:'—'} rank={rk.played} label="Played"/>
          <Stat value={a.correct!=null?a.correct.toLocaleString():'—'} rank={rk.correct} label="Correct"/>
          <Stat value={a.accuracy!=null?`${a.accuracy}%`:'—'} rank={rk.accuracy} label="Accuracy"/>
          <Stat value={a.completed!=null?a.completed:'—'} rank={rk.completed} label="Completed"/>
        </div>
      </>):(
        <div style={{flex:'1 1 60px',minWidth:0,color:MUTED,fontSize:13,fontWeight:600}}>Play to track your stats</div>
      )}
      <span className="qpb-hub"><Link href="/quizzes/hub" onClick={e=>e.stopPropagation()} style={{display:'inline-flex',alignItems:'center',gap:6,background:'#e9f1fd',color:ACCENT,border:'1px solid #cfe0fa',borderRadius:9,padding:'8px 13px',fontWeight:700,fontSize:13,textDecoration:'none',whiteSpace:'nowrap'}}><BarChart3 size={15}/> Stat Hub <ArrowRight size={14}/></Link></span>
    </div>
  );
}
