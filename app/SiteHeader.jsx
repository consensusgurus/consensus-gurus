'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ArrowDownUp, ChevronDown, X } from 'lucide-react';
import SourcesPopover from './SourcesPopover';
import { getAllSources } from '@/lib/sources';
import { LISTS } from '@/lib/data';
import { QUIZZES } from '@/lib/quizzes';
import { KIDS_GAMES } from '@/lib/kids';
import { EXAM_ORDER } from './exams/examData';

// Shared site header. Blue header card with the brand + Lists/Quizzes nav on the
// top row, and an optional INLAY slot (a white pill the page passes in) below it:
// category nav on lists home, the section tabs on a list, the player stat bar on
// quizzes. Desktop keeps the card inset and rounded; mobile goes full-bleed and
// the nav condenses to a compact segmented toggle next to the "SoT" mark.
const C = { ink: '#1c1e24', accent: '#0e1d40', muted: '#6b7280', line: 'rgba(20,22,28,0.09)' };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const SOURCE_COUNT = getAllSources().length;

// Header tagline. The Top 10 Lists section keeps the consensus line; everywhere
// else carries the site slogan (owner rule, July 2026). Neither is underlined.
function HeaderTagline({ active }) {
  if (active === 'lists') {
    return <>Where <SourcesPopover align="left" onDark href="/experts-and-aggregators" label={`${SOURCE_COUNT.toLocaleString()} Experts and Aggregators`} /> Agree</>;
  }
  return <>Exercise Your Mind</>;
}
export const LIST_COUNT = LISTS.length;
// Total "quizzes" shown in the header: trivia quizzes + live Kids Corner games
// + exam practice tests.
export const QUIZ_COUNT = (Array.isArray(QUIZZES) ? QUIZZES.length : 0)
  + (Array.isArray(KIDS_GAMES) ? KIDS_GAMES.length : 0)
  + (Array.isArray(EXAM_ORDER) ? EXAM_ORDER.length : 0);

function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Source of Truths" style={{ flex: 'none' }}>
      <defs>
        <linearGradient id="shLogoBlue" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1e3a6b" /><stop offset="1" stopColor="#0a1730" />
        </linearGradient>
        <radialGradient id="shLogoGold" cx="0.5" cy="0.42" r="0.7">
          <stop offset="0" stopColor="#ffe24d" /><stop offset="0.55" stopColor="#fbb615" /><stop offset="1" stopColor="#f59008" />
        </radialGradient>
      </defs>
      <rect x="3" y="3" width="58" height="58" rx="17.5" fill="url(#shLogoBlue)" />
      <circle cx="32" cy="32.5" r="16.4" fill="#ffffff" /><circle cx="32" cy="32.5" r="12.2" fill="#112446" />
      <circle cx="32" cy="32.5" r="9.6" fill="#e8eaed" />
      <path d="M 32 25.1 L 33.77 30.73 L 36.1 32.5 L 33.77 34.27 L 32 39.9 L 30.23 34.27 L 27.9 32.5 L 30.23 30.73 Z" stroke="#0e1d40" strokeWidth="0.4" strokeLinejoin="round" fill="url(#shLogoGold)" />
    </svg>
  );
}

// Logo variant for the full-bleed command bar: translucent-white tile so the
// mark reads on the blue gradient (matches app/quizzes/QuizCommandHeader).
let __shcLogoSeq = 0;
function CommandLogo({ size = 30 }) {
  const uid = `shc${(__shcLogoSeq += 1)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Source of Truths" style={{ flex: 'none', display: 'block' }}>
      <defs>
        <radialGradient id={`g-${uid}`} cx="0.5" cy="0.42" r="0.7">
          <stop offset="0" stopColor="#ffe24d" /><stop offset="0.55" stopColor="#fbb615" /><stop offset="1" stopColor="#f59008" />
        </radialGradient>
      </defs>
      <rect x="3" y="3" width="58" height="58" rx="17.5" fill="rgba(255,255,255,0.14)" />
      <circle cx="32" cy="32.5" r="16.4" fill="#ffffff" /><circle cx="32" cy="32.5" r="12.2" fill="#112446" />
      <circle cx="32" cy="32.5" r="9.6" fill="#e8eaed" />
      <path d="M 32 25.1 L 33.77 30.73 L 36.1 32.5 L 33.77 34.27 L 32 39.9 L 30.23 34.27 L 27.9 32.5 L 30.23 30.73 Z" stroke="#0e1d40" strokeWidth="0.4" strokeLinejoin="round" fill={`url(#g-${uid})`} />
    </svg>
  );
}

// The two daily games surfaced in the command bar. Navy-legible accent dots
// match DailyStrip's per-game accents.
const SHC_GAMES = [
  { href: '/crux', name: 'Crux', tag: 'Daily word puzzle', dot: '#5b9bff' },
  { href: '/tally', name: 'Tally', tag: 'Daily numbers puzzle', dot: '#4cb377' },
];

// Full-bleed command-bar header used on the LISTS home page, mirroring the
// quizzes home (QuizCommandHeader) so both landing pages share one look: one
// blue gradient bar spanning the viewport with brand + sources on the left,
// the two daily-game buttons in the middle, then the list SEARCH box and the
// SORT dropdown (both moved up out of the old body toolbar), and the segmented
// Lists/Quizzes pill on the right. Search + sort are wired to the page's own
// state via the search/onSearch/sortBy/onSort/sortButtons props.
function CommandHeader({ active, search, onSearch, sortBy, onSort, sortButtons, listCount }) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);
  useEffect(() => {
    if (!sortOpen) return undefined;
    const close = (e) => { if (!sortRef.current || !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [sortOpen]);
  const showSearch = typeof onSearch === 'function';
  const sortOpts = Array.isArray(sortButtons) ? sortButtons : [];
  const showSort = typeof onSort === 'function' && sortOpts.length > 0;
  const curSort = showSort ? (sortOpts.find((o) => o.id === sortBy) || sortOpts[0]) : null;
  return (
    <div className="shc" style={{ fontFamily: FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .shc{width:100vw;margin-left:calc(50% - 50vw);}
        .shc-bar{display:flex;align-items:center;gap:12px;min-height:56px;padding:9px clamp(14px,2vw,24px);background:#ffffff;border-bottom:1px solid #e6e8ee;}
        .shc-word{font-size:18px;font-weight:800;letter-spacing:-0.025em;line-height:1;color:#1c1e24;text-decoration:none;white-space:nowrap;flex:none;}
        .shc-word em{font-style:normal;color:#6b7280;font-weight:600;}
        .shc-ws{display:none;}
        .shc-src{font-size:9.5px;font-weight:800;letter-spacing:normal;text-transform:uppercase;color:#1c1e24;flex:none;}
        .shc-games{display:flex;align-items:center;gap:9px;min-width:0;flex:none;}
        .shc-game{display:inline-flex;align-items:center;gap:9px;background:#f7f8fa;border:1px solid #eef1f5;border-radius:11px;padding:6px 13px 6px 11px;text-decoration:none;transition:background .15s,border-color .15s;flex:none;}
        .shc-game:hover{background:#eef1f5;border-color:#46506a;}
        .shc-dot{width:8px;height:8px;border-radius:50%;flex:none;}
        .shc-gtxt{display:flex;flex-direction:column;gap:2px;line-height:1;}
        .shc-gnm{font-size:13px;font-weight:800;color:#1c1e24;letter-spacing:-.2px;}
        .shc-gtag{font-size:9px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#6b7280;white-space:nowrap;}
        .shc-search{flex:0 1 auto;width:clamp(200px,26vw,460px);min-width:130px;margin-left:auto;display:flex;align-items:center;gap:7px;height:36px;padding:0 10px 0 12px;background:#eef1f5;border:1px solid #eef1f5;border-radius:11px;}
        .shc-search svg{flex:none;color:#6b7280;}
        .shc-search input{flex:1;min-width:0;background:transparent;border:none;outline:none;color:#1c1e24;font-family:inherit;font-size:13px;font-weight:600;}
        .shc-search input::placeholder{color:#6b7280;opacity:1;}
        .shc-search:focus-within{border-color:#46506a;background:#eef1f5;}
        .shc-clear{display:flex;align-items:center;justify-content:center;background:none;border:none;color:#6b7280;cursor:pointer;padding:2px;flex:none;}
        .shc-clear:hover{color:#1c1e24;}
        /* margin-left:auto pins the Sort + Lists/Quizzes toggle group to the
           far-right edge. When the search box caps at its max width on wide
           screens, the leftover space now flows into this margin instead of
           pooling to the RIGHT of the toggle, so the toggle is anchored right
           (matching the quizzes header) rather than tied to the search box. */
        .shc-sortwrap{position:relative;flex:none;}
        .shc-right{display:flex;align-items:center;gap:9px;margin-left:auto;flex:none;}
        .shc-sort{display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 12px;background:#f7f8fa;border:1px solid #eef1f5;border-radius:11px;color:#1c1e24;font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;white-space:nowrap;}
        .shc-sort:hover{background:#eef1f5;border-color:#46506a;}
        .shc-sort svg{flex:none;}
        .shc-sortmenu{position:absolute;top:calc(100% + 6px);right:0;z-index:60;min-width:200px;background:#fff;border:1px solid rgba(20,22,28,0.12);border-radius:10px;box-shadow:0 12px 30px rgba(10,16,32,0.28);overflow:hidden;}
        .shc-sortitem{width:100%;display:block;text-align:left;border:none;background:#fff;padding:10px 14px;font-family:inherit;font-size:13px;font-weight:600;color:#1c1e24;cursor:pointer;}
        .shc-sortitem.on,.shc-sortitem:hover{background:#eef2fb;color:#0e1d40;}
        .shc-seg{display:flex;gap:2px;background:#eef1f5;border-radius:999px;padding:3px;flex:none;}.shc-burger{display:none;position:relative;flex:none;}.shc-burger>summary{list-style:none;display:flex;align-items:center;justify-content:center;width:38px;height:34px;border-radius:9px;background:#eef1f5;border:1px solid #eef1f5;cursor:pointer;}.shc-burger>summary::-webkit-details-marker{display:none;}.shc-bmenu{position:absolute;top:calc(100% + 8px);right:0;z-index:70;min-width:200px;background:#fff;border:1px solid rgba(20,22,28,0.12);border-radius:11px;box-shadow:0 12px 30px rgba(10,16,32,0.28);padding:4px;}.shc-bmenu a{display:block;padding:11px 13px;border-radius:8px;font-size:14px;font-weight:700;color:#1c1e24;text-decoration:none;white-space:nowrap;}.shc-bmenu a.on,.shc-bmenu a:hover{background:#eef2fb;color:#0e1d40;}@media(max-width:600px){.shc-seg{display:none;}.shc-burger{display:block;}}
        .shc-seg a{font-size:12px;font-weight:700;color:#1c1e24;text-decoration:none;padding:6px 12px;border-radius:999px;white-space:nowrap;}
        .shc-seg a.on{background:#fff;color:#0e1d40;}
        @media(max-width:1180px){.shc-src{display:none;}}
        @media(max-width:1080px){.shc-gtag{display:none;}.shc-game{padding:7px 12px;}}
        @media(max-width:900px){.shc-games{display:none;}}
        @media(max-width:820px){.shc-wl{display:none;}.shc-ws{display:inline;}}
        @media(max-width:640px){.shc-sortwrap{display:none;}.shc-sorttxt{display:none;}}
        @media(max-width:560px){
          .shc{width:100vw;margin-left:calc(50% - 50vw);}
          .shc-bar{padding-top:calc(9px + env(safe-area-inset-top));padding-left:14px;padding-right:14px;gap:9px;}
          .shc-word{font-size:17px;}
          .shc-search{min-width:0;}
          .shc-seg a{padding:6px 11px;font-size:11.5px;}
        }
      `}</style>
      <div className="shc-bar">
        <Link href="/" className="shc-brandlogo" style={{ flex: 'none', display: 'flex' }} aria-label="Source of Truths home"><CommandLogo size={30} /></Link>
        <Link href="/" className="shc-word"><span className="shc-wl">Source <em>of</em> Truths</span><span className="shc-ws">S<em>o</em>T</span></Link>
        <span className="shc-src"><HeaderTagline active={active} /></span>
        {showSearch && (
          <div className="shc-search" onClick={(e) => e.stopPropagation()}>
            <Search size={15} strokeWidth={2.4} />
            <input
              value={search || ''}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={`Search ${(listCount || LIST_COUNT).toLocaleString()} lists…`}
              aria-label="Search lists"
              autoComplete="off"
            />
            {search ? (
              <button type="button" className="shc-clear" aria-label="Clear search" onClick={() => onSearch('')}><X size={15} strokeWidth={2.5} /></button>
            ) : null}
          </div>
        )}
        {showSort && (
          <div className="shc-sortwrap" ref={sortRef} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="shc-sort" onClick={() => setSortOpen((o) => !o)}>
              <ArrowDownUp size={14} strokeWidth={2.25} />
              <span className="shc-sorttxt">Sort: {(curSort && (curSort.short || curSort.label)) || 'Discover'}</span>
              <ChevronDown size={14} strokeWidth={2.5} style={{ opacity: 0.85 }} />
            </button>
            {sortOpen && (
              <div className="shc-sortmenu">
                {sortOpts.map((opt) => (
                  <button key={opt.id} type="button" className={'shc-sortitem' + (sortBy === opt.id ? ' on' : '')} onClick={() => { onSort(opt.id); setSortOpen(false); }}>{opt.label}</button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="shc-right">
          <div className="shc-games">
            {SHC_GAMES.map((g) => (
              <Link key={g.href} href={g.href} className="shc-game" aria-label={`${g.name} — ${g.tag}`}>
                <span className="shc-dot" style={{ background: g.dot }} />
                <span className="shc-gtxt">
                  <span className="shc-gnm">{g.name}</span>
                  <span className="shc-gtag">{g.tag}</span>
                </span>
              </Link>
            ))}
          </div>
          <nav className="shc-seg">
            <Link href="/" className={active === 'quizzes' ? 'on' : undefined}>Puzzles &amp; Quizzes</Link>
            <Link href="/lists" className={active === 'lists' ? 'on' : undefined}>Top 10 Lists</Link>
          </nav>
          <details className="shc-burger">
            <summary aria-label="Open menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg></summary>
            <div className="shc-bmenu">
              <Link href="/" className={active === 'quizzes' ? 'on' : undefined}>Puzzles &amp; Quizzes</Link>
              <Link href="/lists" className={active === 'lists' ? 'on' : undefined}>Top 10 Lists</Link>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

export default function SiteHeader({ active = 'lists', maxWidth = 1180, visitors, bare = false, inlay = null, flush = false, command = false, search, onSearch, sortBy, onSort, sortButtons, listCount }) {
  if (command) return <CommandHeader active={active} search={search} onSearch={onSearch} sortBy={sortBy} onSort={onSort} sortButtons={sortButtons} listCount={listCount} />;
  return (
    <div className="sh-root" style={{ fontFamily: FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .sh-bar{display:flex;flex-direction:column;padding:12px 16px;background:#ffffff;border:1px solid #e6e8ee;;border-radius:16px;}
        .sh-bar.flush{border-radius:16px 16px 0 0;}
        .qzf-line{position:absolute;top:0;bottom:0;left:24px;right:24px;border-left:1px solid rgba(20,22,28,0.16);border-right:1px solid rgba(20,22,28,0.16);border-bottom:1px solid rgba(20,22,28,0.16);border-bottom-left-radius:16px;border-bottom-right-radius:16px;pointer-events:none;z-index:0;}
        @media(max-width:560px){.qzf-line{display:none;}.qzf-w{padding-left:14px !important;padding-right:14px !important;}}
        .sh-top{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:nowrap;}
        .sh-inlay{margin-top:12px;}
        .sh-outer{padding:10px 24px 0;}
        .sh-brand{display:flex;align-items:center;gap:11px;text-decoration:none;flex:none;}
        .sh-word{font-size:21px;font-weight:800;letter-spacing:-0.025em;line-height:1;color:#1c1e24;}
        .sh-word-sot{display:none;}
        .sh-right{display:flex;align-items:center;justify-content:flex-end;gap:14px;flex:none;}
        .sh-nav{display:flex;align-items:center;gap:12px;justify-content:flex-end;flex-wrap:wrap;}.sh-burger{display:none;position:relative;flex:none;}.sh-burger>summary{list-style:none;display:flex;align-items:center;justify-content:center;width:38px;height:34px;border-radius:9px;background:#eef1f5;border:1px solid #eef1f5;cursor:pointer;}.sh-burger>summary::-webkit-details-marker{display:none;}.sh-bmenu{position:absolute;top:calc(100% + 8px);right:0;z-index:70;min-width:200px;background:#fff;border:1px solid rgba(20,22,28,0.12);border-radius:11px;box-shadow:0 12px 30px rgba(10,16,32,0.28);padding:4px;}.sh-bmenu a{display:block;padding:11px 13px;border-radius:8px;font-size:14px;font-weight:700;color:#1c1e24;text-decoration:none;white-space:nowrap;}.sh-bmenu a.on,.sh-bmenu a:hover{background:#eef2fb;color:#0e1d40;}@media(max-width:600px){.sh-nav{display:none;}.sh-burger{display:block;}}
        .sh-navbtn{display:inline-flex;align-items:center;gap:5px;text-decoration:none;font-size:13.5px;font-weight:700;color:#1c1e24;border:1px solid #e6e8ee;border-radius:8px;padding:7px 13px;background:transparent;transition:background .15s,border-color .15s,color .15s;}
        .sh-navbtn:hover{background:#eef1f5;border-color:#1c1e24;color:#1c1e24;}
        .sh-navbtn.on{background:#fff;border-color:#1c1e24;border-bottom:2px solid #e8b43a;color:#0e1d40;}
        @media(max-width:860px){.sh-tag{display:none;}}
        @media(max-width:560px){
          .sh-outer{padding:0;}
          .sh-root{width:100vw;margin-left:calc(50% - 50vw);}
          .sh-bar,.sh-bar.flush{border-radius:0;padding:calc(11px + env(safe-area-inset-top)) 14px 11px;}
          .sh-top{flex-wrap:nowrap;}
          .sh-word{font-size:18px;}
          .sh-tag{display:none;}
          .sh-right{gap:0;}
          .sh-nav{gap:2px;flex-wrap:nowrap;background:#eef1f5;border-radius:999px;padding:2px;}
          .sh-navbtn{flex:none;border:none;padding:6px 13px;border-radius:999px;font-size:11.5px;}
          .sh-navbtn:hover{background:transparent;color:#1c1e24;}
          .sh-navbtn.on{background:#fff;color:#0e1d40;}
          .sh-inlay{margin-top:10px;}
        }
      `}</style>
      <div className={bare ? undefined : 'sh-outer'} style={bare ? { padding: '2px 0 0' } : { maxWidth, margin: '0 auto' }}>
        <div className={`sh-bar${flush ? ' flush' : ''}`}>
          <div className="sh-top">
            <div className="sh-brand">
              <Link href="/" style={{ flex: 'none', display: 'flex' }} aria-label="Source of Truths home"><Logo size={34} /></Link>
              <span style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'nowrap' }}>
                <Link href="/" className="sh-word" style={{ textDecoration: 'none', color:'#1c1e24' }}><span className="sh-word-full">Source <span style={{ color: '#6b7280', fontWeight: 600 }}>of</span> Truths</span><span className="sh-word-sot">S<span style={{ color: '#6b7280', fontWeight: 600 }}>o</span>T</span></Link>
                <span className="sh-tag" style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 'normal', textTransform: 'uppercase', color:'#1c1e24', marginTop: 0 }}><HeaderTagline active={active} /></span>
              </span>
            </div>
            <div className="sh-right">
              <nav className="sh-nav">
                <Link href="/" className={`sh-navbtn${active === 'quizzes' ? ' on' : ''}`}>Puzzles &amp; Quizzes</Link>
                <Link href="/lists" className={`sh-navbtn${active === 'lists' ? ' on' : ''}`}>Top 10 Lists</Link>
              </nav>
              <details className="sh-burger">
                <summary aria-label="Open menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg></summary>
                <div className="sh-bmenu">
                  <Link href="/" className={active === 'quizzes' ? 'on' : undefined}>Puzzles &amp; Quizzes</Link>
                  <Link href="/lists" className={active === 'lists' ? 'on' : undefined}>Top 10 Lists</Link>
                </div>
              </details>
            </div>
          </div>
          {inlay ? <div className="sh-inlay">{inlay}</div> : null}
        </div>
      </div>
    </div>
  );
}
