'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BadgeCheck, UserPlus, ChevronDown, ArrowRight, X, Crown, Medal } from 'lucide-react';
import { DEPT_LABEL } from '@/lib/quiz-departments';

const ACCENT='#2563eb', INK='#1c1e24', MUTED='#6b7280', SOFT='#aeb4bd', LINE='rgba(20,22,28,0.09)';
const BARBG='#1e54cf', ONBLUE='#ffffff', ONBLUE_SOFT='#bcd2fb', ONBLUE_LINE='rgba(255,255,255,0.22)';
const MEDAL=['#e8b43a','#c3c7cf','#cf8b4e'];
const lbl={fontSize:10,fontWeight:600,letterSpacing:'.04em',textTransform:'uppercase',color:ONBLUE_SOFT,marginBottom:2};
const chip={display:'inline-flex',alignItems:'center',gap:6,background:'#3b74e8',color:'#fff',border:'1px solid rgba(255,255,255,0.35)',borderRadius:9,padding:'8px 14px',fontWeight:700,fontSize:13,textDecoration:'none',whiteSpace:'nowrap',cursor:'pointer',fontFamily:'inherit'};

function getAnonId(){try{return localStorage.getItem('sot_quiz_anon');}catch{return null;}}
function ensureAnonId(){
  try{
    let a=localStorage.getItem('sot_quiz_anon');
    if(!a){a=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():`a_${Date.now()}_${Math.random().toString(36).slice(2)}`;localStorage.setItem('sot_quiz_anon',a);}
    return a;
  }catch{return null;}
}
function getIdentity(){try{return JSON.parse(localStorage.getItem('sot_quiz_identity'));}catch{return null;}}

// Self-contained sign-up modal so the player-bar "Sign up" button actually signs
// the player up wherever the bar appears (index, quiz pages, Stat Hub), instead
// of routing to a page with no obvious sign-up. Posts to /api/quiz/join, stores
// the identity, and reloads so every surface picks up the signed-in state.
function SignupModal({ onClose }){
  const [u,setU]=useState(''); const [em,setEm]=useState(''); const [busy,setBusy]=useState(false); const [err,setErr]=useState('');
  const inp={width:'100%',boxSizing:'border-box',border:`1px solid ${LINE}`,borderRadius:10,padding:'11px 13px',fontFamily:'inherit',fontSize:15,color:INK,outline:'none'};
  async function submit(){
    setErr('');
    if(!u.trim()){setErr('Pick a display name');return;}
    setBusy(true);
    try{
      const r=await fetch('/api/quiz/join',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u.trim(),email:em.trim()||undefined,anonId:ensureAnonId()})});
      const d=await r.json();
      if(d&&d.username){
        try{localStorage.setItem('sot_quiz_identity',JSON.stringify({username:d.username,email:d.email||undefined}));}catch(e){}
        window.location.reload();
      }else{setErr((d&&d.error)||'Could not sign up. Try again.');setBusy(false);}
    }catch(e){setErr('Could not sign up. Try again.');setBusy(false);}
  }
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:300,background:'rgba(20,22,28,0.45)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{width:380,maxWidth:'100%',background:'#fff',borderRadius:14,border:`1px solid ${LINE}`,padding:22,fontFamily:'inherit'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
          <div style={{fontSize:18,fontWeight:800,color:INK}}>Claim your name</div>
          <button onClick={onClose} aria-label="Close" style={{border:'none',background:'transparent',cursor:'pointer',color:SOFT,display:'flex'}}><X size={18}/></button>
        </div>
        <p style={{fontSize:13,color:MUTED,margin:'0 0 16px',lineHeight:1.5}}>Pick a display name to appear on the leaderboards. Email is optional, only used to recover your name on another device. No password needed.</p>
        {err&&<div style={{marginBottom:12,padding:10,borderRadius:8,background:'rgba(192,57,43,0.08)',border:'1px solid rgba(192,57,43,0.4)',color:'#c0392b',fontSize:13}}>{err}</div>}
        <input value={u} onChange={e=>setU(e.target.value)} placeholder="Display name" maxLength={15} autoCapitalize="none" autoCorrect="off" spellCheck={false} style={inp}/>
        <input value={em} onChange={e=>setEm(e.target.value)} placeholder="Email (optional)" maxLength={120} type="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} style={{...inp,marginTop:10}}/>
        <button onClick={submit} disabled={busy} style={{marginTop:16,width:'100%',background:ACCENT,color:'#fff',border:'none',borderRadius:10,padding:'12px',fontFamily:'inherit',fontWeight:700,fontSize:14,cursor:busy?'wait':'pointer',opacity:busy?0.6:1}}>{busy?'Joining…':'Join the leaderboard'}</button>
      </div>
    </div>
  );
}

function Stat({value, rank, label, cls}){
  return (
    <div className={cls}>
      <div style={{display:'flex',alignItems:'baseline',gap:3}}>
        <span style={{fontSize:17,fontWeight:700,color:ONBLUE}}>{value}</span>
        {rank?<span style={{fontSize:11,fontWeight:700,color:ONBLUE_SOFT}}>#{rank}</span>:null}
      </div>
      <div style={lbl}>{label}</div>
    </div>
  );
}

export default function QuizPlayerBar({ me: meProp, controlled = false, rightAction = 'stathub', onShare, leaderboard = null }){
  const [meState,setMe]=useState(undefined);
  const [signupOpen,setSignupOpen]=useState(false);
  const me = controlled ? meProp : meState;
  useEffect(()=>{
    if(controlled) return;
    const ident=getIdentity(); const anonId=getAnonId();
    const email=ident&&ident.email?ident.email:'';
    /* signed-out visitors still fetch (empty params) so the bar shows the total player count */
    const params=new URLSearchParams();
    if(anonId)params.set('anonId',anonId);
    if(email)params.set('email',email);
    fetch(`/api/quiz/me?${params.toString()}`).then(r=>r.json()).then(d=>setMe(d||null)).catch(()=>setMe(null));
  },[controlled]);
  const found=me&&me.found;
  const determined=me!==undefined;
  const a=(found&&me.activity)||{};
  const rk=(found&&me.ranks)||{};
  const rank=found&&((me.ranks&&me.ranks.rating)||me.rank);
  const denom=(me&&me.totalPlayers)||0;
  let bestCat=null;
  if(found&&me.byCategory){
    for(const k of Object.keys(me.byCategory)){
      const c=me.byCategory[k]; if(!c||!(c.matches>0)) continue;
      const cand={key:k, rank:c.completedRank??c.rank, catTotal:c.catTotal, cR:c.completedRank??Infinity, sR:c.rank??Infinity, pR:c.playedRank??Infinity};
      if(!bestCat||cand.cR<bestCat.cR||(cand.cR===bestCat.cR&&cand.sR<bestCat.sR)||(cand.cR===bestCat.cR&&cand.sR===bestCat.sR&&cand.pR<bestCat.pR)) bestCat=cand;
    }
  }
  const dash='—';
  const signed = !!(found && me && me.signed);
  const hubMode = leaderboard != null;
  const lbRows = (leaderboard && Array.isArray(leaderboard.rows)) ? leaderboard.rows.slice(0, 3) : [];
  const rightBtn = rightAction==='share'
    ? <button onClick={(e)=>{e.stopPropagation(); onShare&&onShare();}} style={chip}>Share Stats</button>
    : <Link href="/quizzes/hub" onClick={e=>e.stopPropagation()} style={chip}>{(found && !signed)?'Sign Up / Stat Hub':'Stat Hub'} <ArrowRight size={14}/></Link>;
  const lbRef = useRef(null);
  useEffect(() => {
    const wrap = lbRef.current; if (!wrap) return;
    const rows = wrap.querySelector('.qpb-lbrows'); if (!rows) return;
    const fit = () => {
      const kids = Array.from(rows.children);
      kids.forEach((k) => { k.style.display = ''; });
      const avail = rows.clientWidth; let used = 0, over = false;
      kids.forEach((k, idx) => {
        if (over) { k.style.display = 'none'; return; }
        const w = k.getBoundingClientRect().width;
        const next = used + (idx > 0 ? 22 : 0) + w;
        if (idx > 0 && next > avail) { over = true; k.style.display = 'none'; }
        else used = next;
      });
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(wrap);
    window.addEventListener('resize', fit);
    return () => { ro.disconnect(); window.removeEventListener('resize', fit); };
  }, [lbRows, hubMode]);
  return (
    <div className="qpb" style={{display:'flex',flexDirection:'row',alignItems:'center',flexWrap:'nowrap',gap:16,padding:'10px 14px',background:BARBG,borderRadius:11,minHeight:56,boxSizing:'border-box',overflow:'hidden'}}>
      <style>{`.qpb-chev{display:none;}@media(max-width:1023px){.qpb-bestcat{display:none !important;}}@media(max-width:920px){.qpb-s-correct{display:none !important;}}@media(max-width:820px){.qpb-s-accuracy{display:none !important;}}@media(max-width:700px){.qpb-s-played{display:none !important;}}@media(max-width:620px){.qpb-lb,.qpb-lbdiv{display:none !important;}.qpb-hub{margin-left:auto !important;}}@media(max-width:560px){.qpb .qpb-stats{display:none !important;}.qpb-s-completed{display:none !important;}.qpb-hub{margin-left:auto !important;}}`}</style>
      <div style={{display:'flex',flexDirection:'column',minWidth:0}}>
        <div style={lbl}>Player</div>
        {found?(
          <div style={{display:'flex',alignItems:'center',gap:5,fontSize:16,fontWeight:800,color:ONBLUE,lineHeight:1.15,minWidth:0}}><span style={{minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{me.name}</span>{me.signed?<BadgeCheck size={13} strokeWidth={2.5} style={{color:ONBLUE,flex:'none'}}/>:null}</div>
        ):determined?(
          <button onClick={e=>{e.stopPropagation(); setSignupOpen(true);}} style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:14,fontWeight:800,color:ONBLUE,lineHeight:1.15,background:'none',border:'none',padding:0,cursor:'pointer',fontFamily:'inherit'}}><UserPlus size={14}/> Sign Up</button>
        ):(
          <div style={{fontSize:16,fontWeight:800,color:ONBLUE_SOFT,lineHeight:1.15}}>{dash}</div>
        )}
      </div>
      <div style={{width:1,height:34,background:ONBLUE_LINE}}/>
      <div>
        <div style={lbl}>Rank</div>
        <div style={{display:'flex',alignItems:'baseline',gap:5}}><span style={{fontSize:17,fontWeight:800,color:rank?ONBLUE:ONBLUE_SOFT,lineHeight:1}}>{rank?`#${rank}`:dash}</span>{denom?<span style={{fontSize:11,color:ONBLUE_SOFT}}>of {denom.toLocaleString()}</span>:null}</div>
      </div>
      {hubMode ? (
        <>
          <Stat value={found&&a.completed!=null?a.completed:dash} rank={found?rk.completed:null} label="Completed" cls="qpb-s-completed"/>
          {lbRows.length ? (
            <>
              <div className="qpb-lbdiv" style={{width:2,height:34,background:'rgba(255,255,255,0.32)',borderRadius:2,flex:'none'}}/>
              <div className="qpb-lb" ref={lbRef} style={{flex:'1 1 auto',minWidth:0,overflow:'hidden',display:'flex',alignItems:'center',gap:16}}>
                <div style={{...lbl,fontSize:13,display:'inline-flex',alignItems:'center',gap:6,marginBottom:0,flex:'none',whiteSpace:'nowrap',fontWeight:800,color:ONBLUE}}><Crown size={12} strokeWidth={2} style={{color:'#e8b43a',flex:'none'}}/>{leaderboard.label}</div>
                <div className="qpb-lbrows" style={{display:'flex',flexWrap:'nowrap',gap:22,whiteSpace:'nowrap',overflow:'hidden',alignItems:'center',justifyContent:'space-evenly',flex:'1 1 auto',minWidth:0}}>
                  {lbRows.map((r,i)=>(<span key={i} className={`qpb-lb${i+1}`} style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:16,fontWeight:800,color:ONBLUE}}><Medal size={16} strokeWidth={2} style={{color:MEDAL[i]||ONBLUE_SOFT,flex:'none'}}/>{r.name}</span>))}
                </div>
              </div>
            </>
          ) : <div style={{flex:'1 1 auto'}}/>}
        </>
      ) : (
        <>
          <div className="qpb-stats" style={{display:'flex',flex:'1 1 auto',minWidth:0,justifyContent:'space-evenly',gap:14,marginLeft:18,flexWrap:'nowrap'}}>
            <Stat value={found&&a.played!=null?a.played:dash} rank={found?rk.played:null} label="Played" cls="qpb-s-played"/>
            <Stat value={found&&a.correct!=null?a.correct.toLocaleString():dash} rank={found?rk.correct:null} label="Correct" cls="qpb-s-correct"/>
            <Stat value={found&&a.accuracy!=null?`${a.accuracy}%`:dash} rank={found?rk.accuracy:null} label="Accuracy" cls="qpb-s-accuracy"/>
            <Stat value={found&&a.completed!=null?a.completed:dash} rank={found?rk.completed:null} label="Completed" cls="qpb-s-completed"/>
          </div>
          {bestCat?(
            <div className="qpb-bestcat">
              <div style={lbl}>Best category</div>
              <div style={{display:'flex',alignItems:'baseline',gap:5,whiteSpace:'nowrap'}}>
                <span style={{fontSize:14,fontWeight:700,color:ONBLUE,lineHeight:1.2}}>{DEPT_LABEL[bestCat.key]||'—'}</span>
                {bestCat.rank?<span style={{fontSize:11,color:ONBLUE_SOFT}}>#{bestCat.rank}{bestCat.catTotal?` of ${bestCat.catTotal.toLocaleString()}`:''}</span>:null}
              </div>
            </div>
          ):null}
        </>
      )}
      <span className="qpb-hub">{rightBtn}</span>
      {signupOpen && <SignupModal onClose={()=>setSignupOpen(false)} />}
    </div>
  );
}
