'use client';
import Link from 'next/link';
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
      <circle cx="32" cy="32.5" r="16.4" stroke="#ffffff" strokeWidth="4.2" fill="none" />
      <circle cx="32" cy="32.5" r="9.6" stroke="#ffffff" strokeWidth="4.2" fill="none" strokeOpacity="0.9" />
      <path d="M 32 24.9 C 32.775 31.725 32.775 31.725 39.6 32.5 C 32.775 33.275 32.775 33.275 32 40.1 C 31.225 33.275 31.225 33.275 24.4 32.5 C 31.225 31.725 31.225 31.725 32 24.9 Z" fill="url(#shLogoGold)" />
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
      <circle cx="32" cy="32.5" r="16.4" stroke="#ffffff" strokeWidth="4.2" fill="none" />
      <circle cx="32" cy="32.5" r="9.6" stroke="#ffffff" strokeWidth="4.2" fill="none" strokeOpacity="0.9" />
      <path d="M 32 24.9 C 32.775 31.725 32.775 31.725 39.6 32.5 C 32.775 33.275 32.775 33.275 32 40.1 C 31.225 33.275 31.225 33.275 24.4 32.5 C 31.225 31.725 31.225 31.725 32 24.9 Z" fill={`url(#g-${uid})`} />
    </svg>
  );
}

// The two daily games surfaced in the command bar. Navy-legible accent dots
// match DailyStrip's per-game accents.
const SHC_GAMES = [
  { href: '/crux', name: 'Crux', tag: 'Daily word game', dot: '#5b9bff' },
  { href: '/tally', name: 'Tally', tag: 'Daily numbers game', dot: '#4cb377' },
];

// Full-bleed command-bar header used on the LISTS home page, mirroring the
// quizzes home (QuizCommandHeader) so both landing pages share one look: one
// blue gradient bar spanning the viewport with brand + sources on the left,
// the two daily-game buttons filling the middle, and the segmented
// Lists/Quizzes pill on the right. The list search box stays in the toolbar
// below (not moved into the header), so no search field lives here.
function CommandHeader({ active }) {
  return (
    <div className="shc" style={{ fontFamily: FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .shc{width:100vw;margin-left:calc(50% - 50vw);}
        .shc-bar{display:flex;align-items:center;gap:12px;min-height:56px;padding:9px clamp(14px,2vw,24px);background:linear-gradient(100deg,#14294d,#0a1730);}
        .shc-word{font-size:18px;font-weight:800;letter-spacing:-0.025em;line-height:1;color:#fff;text-decoration:underline;text-decoration-color:rgba(255,255,255,0.35);text-underline-offset:3px;text-decoration-thickness:1px;white-space:nowrap;flex:none;}
        .shc-word em{font-style:normal;color:#c9ced8;font-weight:600;}
        .shc-ws{display:none;}
        .shc-src{font-size:9.5px;font-weight:800;letter-spacing:normal;text-transform:uppercase;color:#fff;flex:none;}
        .shc-games{display:flex;align-items:center;gap:9px;margin-left:8px;min-width:0;}
        .shc-game{display:inline-flex;align-items:center;gap:9px;background:rgba(255,255,255,0.09);border:1px solid rgba(255,255,255,0.2);border-radius:11px;padding:6px 13px 6px 11px;text-decoration:none;transition:background .15s,border-color .15s;flex:none;}
        .shc-game:hover{background:rgba(255,255,255,0.16);border-color:rgba(255,255,255,0.42);}
        .shc-dot{width:8px;height:8px;border-radius:50%;flex:none;}
        .shc-gtxt{display:flex;flex-direction:column;gap:2px;line-height:1;}
        .shc-gnm{font-size:13px;font-weight:800;color:#fff;letter-spacing:-.2px;}
        .shc-gtag{font-size:9px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#9fb0d4;white-space:nowrap;}
        .shc-seg{display:flex;gap:2px;background:rgba(255,255,255,0.16);border-radius:999px;padding:3px;flex:none;margin-left:auto;}
        .shc-seg a{font-size:12px;font-weight:700;color:#fff;text-decoration:none;padding:6px 12px;border-radius:999px;white-space:nowrap;}
        .shc-seg a.on{background:#fff;color:#0e1d40;}
        @media(max-width:1180px){.shc-src{display:none;}}
        @media(max-width:900px){.shc-gtag{display:none;}.shc-game{padding:7px 12px;}}
        @media(max-width:820px){.shc-wl{display:none;}.shc-ws{display:inline;}}
        @media(max-width:640px){.shc-games{display:none;}}
        @media(max-width:560px){
          .shc{width:100vw;margin-left:calc(50% - 50vw);}
          .shc-bar{padding-top:calc(9px + env(safe-area-inset-top));padding-left:14px;padding-right:14px;gap:9px;}
          .shc-word{font-size:17px;}
          .shc-seg a{padding:6px 11px;font-size:11.5px;}
        }
      `}</style>
      <div className="shc-bar">
        <Link href="/" className="shc-brandlogo" style={{ flex: 'none', display: 'flex' }} aria-label="Source of Truths home"><CommandLogo size={30} /></Link>
        <Link href="/" className="shc-word"><span className="shc-wl">Source <em>of</em> Truths</span><span className="shc-ws">S<em>o</em>T</span></Link>
        <span className="shc-src"><SourcesPopover align="left" onDark href="/experts-and-aggregators" label={`${SOURCE_COUNT.toLocaleString()} Experts and Aggregators`} /></span>
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
          <Link href="/" className={active === 'lists' ? 'on' : undefined}>Top 10 Lists</Link>
          <Link href="/quizzes" className={active === 'quizzes' ? 'on' : undefined}>Quizzes</Link>
        </nav>
      </div>
    </div>
  );
}

export default function SiteHeader({ active = 'lists', maxWidth = 1180, visitors, bare = false, inlay = null, flush = false, command = false }) {
  if (command) return <CommandHeader active={active} />;
  return (
    <div className="sh-root" style={{ fontFamily: FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .sh-bar{display:flex;flex-direction:column;padding:12px 16px;background:#0e1d40;border-radius:16px;}
        .sh-bar.flush{border-radius:16px 16px 0 0;}
        .qzf-line{position:absolute;top:0;bottom:0;left:24px;right:24px;border-left:1px solid rgba(20,22,28,0.16);border-right:1px solid rgba(20,22,28,0.16);border-bottom:1px solid rgba(20,22,28,0.16);border-bottom-left-radius:16px;border-bottom-right-radius:16px;pointer-events:none;z-index:0;}
        @media(max-width:560px){.qzf-line{display:none;}.qzf-w{padding-left:14px !important;padding-right:14px !important;}}
        .sh-top{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:nowrap;}
        .sh-inlay{margin-top:12px;}
        .sh-outer{padding:10px 24px 0;}
        .sh-brand{display:flex;align-items:center;gap:11px;text-decoration:none;flex:none;}
        .sh-word{font-size:21px;font-weight:800;letter-spacing:-0.025em;line-height:1;color:#fff;}
        .sh-word-sot{display:none;}
        .sh-right{display:flex;align-items:center;justify-content:flex-end;gap:14px;flex:none;}
        .sh-nav{display:flex;align-items:center;gap:12px;justify-content:flex-end;flex-wrap:wrap;}
        .sh-navbtn{display:inline-flex;align-items:center;gap:5px;text-decoration:none;font-size:13.5px;font-weight:700;color:#fff;border:1px solid rgba(255,255,255,0.45);border-radius:8px;padding:7px 13px;background:transparent;transition:background .15s,border-color .15s,color .15s;}
        .sh-navbtn:hover{background:rgba(255,255,255,0.14);border-color:#fff;color:#fff;}
        .sh-navbtn.on{background:#fff;border-color:#fff;border-bottom:2px solid #e8b43a;color:#0e1d40;}
        @media(max-width:860px){.sh-tag{display:none;}}
        @media(max-width:560px){
          .sh-outer{padding:0;}
          .sh-root{width:100vw;margin-left:calc(50% - 50vw);}
          .sh-bar,.sh-bar.flush{border-radius:0;padding:calc(11px + env(safe-area-inset-top)) 14px 11px;}
          .sh-top{flex-wrap:nowrap;}
          .sh-word{font-size:18px;}
          .sh-tag{display:none;}
          .sh-right{gap:0;}
          .sh-nav{gap:2px;flex-wrap:nowrap;background:rgba(255,255,255,0.16);border-radius:999px;padding:2px;}
          .sh-navbtn{flex:none;border:none;padding:6px 13px;border-radius:999px;font-size:11.5px;}
          .sh-navbtn:hover{background:transparent;color:#fff;}
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
                <Link href="/" className="sh-word" style={{ textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.35)', textUnderlineOffset: '3px', textDecorationThickness: '1px', color: '#fff' }}><span className="sh-word-full">Source <span style={{ color: '#c9ced8', fontWeight: 600 }}>of</span> Truths</span><span className="sh-word-sot">S<span style={{ color: '#c9ced8', fontWeight: 600 }}>o</span>T</span></Link>
                <span className="sh-tag" style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 'normal', textTransform: 'uppercase', color: '#fff', marginTop: 0 }}>Where <SourcesPopover align="left" onDark href="/experts-and-aggregators" label={`${SOURCE_COUNT.toLocaleString()} Experts and Aggregators`} /> Agree</span>
              </span>
            </div>
            <div className="sh-right">
              <nav className="sh-nav">
                <Link href="/" className={`sh-navbtn${active === 'lists' ? ' on' : ''}`}>Top 10 Lists</Link>
                <Link href="/quizzes" className={`sh-navbtn${active === 'quizzes' ? ' on' : ''}`}>Quizzes</Link>
              </nav>
            </div>
          </div>
          {inlay ? <div className="sh-inlay">{inlay}</div> : null}
        </div>
      </div>
    </div>
  );
}
