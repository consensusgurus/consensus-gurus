'use client';
// The public player profile page (/player/<name>): header identity card,
// trophy case, and the same category / IQ / activity views the Stat Hub's
// Player tab renders, from the shared components in app/player/ProfileShared.
// Data: /api/quiz/player?username=<name> (full profile + trophies + duels).
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, Trophy, ListChecks, FunctionSquare, Clock, BarChart3 } from 'lucide-react';
import { QUIZZES } from '@/lib/quizzes';
import { quizDept as deptOf, DEPT_COLOR, DEPT_LABEL, DEPT_NAV } from '@/lib/quiz-departments';
import QuizNavHeader from '../../quizzes/QuizNavHeader';
import Grain from '../../Grain';
import Footer from '../../Footer';
import { notifyShareCredit } from '../../ShareCreditPop';
import {
  C, FONT, Avatar, RankChip, TrophyCase, CategoryView, ActivityFeed, XpPanel, profileCss,
} from '../ProfileShared';

function cleanTitle(t) { return (t || '').replace(/^Name (the )?/i, '').trim(); }
function getIdentity() { if (typeof window === 'undefined') return null; try { return JSON.parse(localStorage.getItem('sot_quiz_identity')); } catch (e) { return null; } }

const PILLS = [
  ['trophies', 'Trophies', Trophy],
  ['category', 'Categories', ListChecks],
  ['rating', 'IQ & Level', FunctionSquare],
  ['activity', 'Activity', Clock],
];

export default function PlayerProfileClient({ name }) {
  const [prof, setProf] = useState(null);
  const [pview, setPview] = useState('trophies');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!name) { setProf({ found: false }); return undefined; }
    let on = true;
    fetch(`/api/quiz/player?username=${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((d) => { if (on) setProf(d || { found: false }); })
      .catch(() => { if (on) setProf({ found: false }); });
    return () => { on = false; };
  }, [name]);

  const mine = useMemo(() => {
    const id = getIdentity();
    return !!(id && id.username && name && id.username.toLowerCase() === name.toLowerCase());
  }, [name]);

  const catalog = useMemo(() => (QUIZZES || []).filter((q) => q && q.id).map((q) => ({
    id: q.id, title: q.navTitle || cleanTitle(q.title) || q.id, dept: deptOf(q),
  })), []);
  const titleById = useMemo(() => Object.fromEntries(catalog.map((q) => [q.id, q.title])), [catalog]);
  const cats = useMemo(() => {
    const byDept = new Map();
    for (const q of catalog) { if (!byDept.has(q.dept)) byDept.set(q.dept, []); byDept.get(q.dept).push(q); }
    const list = [];
    for (const { id } of DEPT_NAV) if (byDept.has(id)) list.push(id);
    for (const k of byDept.keys()) if (!list.includes(k)) list.push(k);
    return list.map((key) => ({ key, label: DEPT_LABEL[key] || 'Quiz', c: (DEPT_COLOR[key] || DEPT_COLOR.misc).c, count: byDept.get(key).length }))
      .sort((a, b) => b.count - a.count);
  }, [catalog]);

  const found = prof && prof.found;
  const loading = prof == null;
  // First played = the oldest game in the (full) history.
  const memberSince = useMemo(() => {
    if (!found || !Array.isArray(prof.recent) || !prof.recent.length) return null;
    const oldest = prof.recent[prof.recent.length - 1];
    if (!oldest || !oldest.createdAt) return null;
    try { return new Date(oldest.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); } catch (e) { return null; }
  }, [prof, found]);

  const trophies = found ? prof.trophies : null;
  const tierBg = found && prof.tierBg ? prof.tierBg : '#eceef1';
  const tierFg = found && prof.tierFg ? prof.tierFg : C.muted;

  function share() {
    const url = typeof window !== 'undefined' ? window.location.origin + `/player/${encodeURIComponent(name)}` : '';
    const line = found
      ? `${mine ? 'My' : `${prof.name}'s`} Source of Truths player card: Level ${prof.level || 1}, ${(prof.xp || 0).toLocaleString()} IQ, rank #${prof.rank || '?'}${trophies ? `, ${trophies.earnedCount} trophies` : ''}.`
      : `Source of Truths player profile: ${name}`;
    if (!notifyShareCredit(line, url)) {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(`${line} ${url}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }).catch(() => {});
      }
    }
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', position: 'relative' }}>
      <Grain />
      <style>{profileCss}</style>
      <QuizNavHeader />
      <div className="qzhub qzf-w" style={{ maxWidth: 1180, margin: '0 auto', padding: '12px 38px 70px', position: 'relative', fontFamily: FONT }}>
        <div style={{ marginTop: 6 }}>
          <Link href="/quizzes/hub" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.muted, textDecoration: 'none', fontSize: 13 }}><ArrowLeft size={15} /> Stat Hub</Link>
        </div>

        {loading ? (
          <div className="card" style={{ marginTop: 14, padding: '30px 20px', fontSize: 13.5, color: C.soft, textAlign: 'center' }}>Loading player profile…</div>
        ) : !found ? (
          <div className="card" style={{ marginTop: 14, padding: '34px 22px', textAlign: 'center' }}>
            <div style={{ fontSize: 19, fontWeight: 800 }}>No player named &ldquo;{name}&rdquo;</div>
            <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6, margin: '10px auto 16px', maxWidth: 420 }}>Profiles exist for registered display names. The name may be spelled differently, or this player may not have claimed a name yet.</p>
            <Link href="/quizzes/hub" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: C.accent, color: '#fff', borderRadius: 10, padding: '11px 18px', fontWeight: 700, fontSize: 13.5, textDecoration: 'none' }}><BarChart3 size={15} /> Open the Stat Hub</Link>
          </div>
        ) : (
          <>
            <div className="card" style={{ marginTop: 14, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <Avatar name={prof.name} size={58} bg={tierBg} fg={tierFg} />
                <div style={{ minWidth: 0, flex: '1 1 220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{prof.name}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 800, background: tierBg, color: tierFg, borderRadius: 999, padding: '3px 9px', textTransform: 'uppercase', letterSpacing: '.03em' }}>{(prof.tier || 'Bronze Tier').replace(/ Tier$/, '')}</span>
                    {mine ? <span style={{ fontSize: 10, fontWeight: 800, color: C.accent, background: C.accsoft, borderRadius: 999, padding: '3px 8px' }}>YOU</span> : null}
                  </div>
                  <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, marginTop: 4 }}>
                    Level {prof.level || 1} · {(prof.xp || 0).toLocaleString()} IQ
                    {memberSince ? ` · Playing since ${memberSince}` : ''}
                    {prof.activity ? ` · ${(prof.activity.daysPlayed || 0).toLocaleString()} days played` : ''}
                  </div>
                  {trophies ? (
                    <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Trophy size={13} style={{ color: '#a97b12' }} /> {trophies.earnedCount} of {trophies.total} trophies
                    </div>
                  ) : null}
                </div>
                <div style={{ textAlign: 'right', flex: 'none' }}>
                  <div className="lbl">Overall rank</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: C.accent, lineHeight: 1 }}>{prof.rank ? `#${prof.rank}` : '—'}</div>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{prof.totalPlayers ? `of ${prof.totalPlayers.toLocaleString()} players` : ''}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 'none' }}>
                  <button onClick={share} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: C.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 15px', fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}><Share2 size={14} /> {copied ? 'Copied!' : 'Share profile (for credit)'}</button>
                  {mine ? <Link href="/quizzes/hub" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${C.line}`, background: '#fff', color: C.ink, borderRadius: 10, padding: '9px 15px', fontWeight: 700, fontSize: 12.5, textDecoration: 'none' }}><BarChart3 size={14} /> Open Stat Hub</Link> : null}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '14px 0 12px' }}>
              {PILLS.map(([v, lbl, Ic]) => (
                <button key={v} className={`pill${pview === v ? ' on' : ''}`} onClick={() => setPview(v)}><Ic size={14} /> {lbl}</button>
              ))}
            </div>

            {pview === 'trophies' ? (
              <TrophyCase trophies={trophies} viewing={!mine} />
            ) : pview === 'category' ? (
              <CategoryView me={prof} scope="all" cats={cats} totalQuizzes={catalog.length} viewing={!mine} />
            ) : pview === 'rating' ? (
              <XpPanel me={prof} titleById={titleById} viewing={!mine} />
            ) : (
              <ActivityFeed recent={prof.recent || []} titleById={titleById} viewing={!mine} />
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
