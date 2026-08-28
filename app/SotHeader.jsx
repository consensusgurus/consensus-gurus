// Source of Truths masthead, used only by the Sports Ranking pages.
//
// These pages are a Source of Truths property rather than a Mind Loft one
// (owner rule, 2026-08-28), so they lead with that wordmark instead of the
// site-wide SiteHeader. The Mind Loft footer still runs at the bottom: it
// carries the legal links and is the site's real internal-link registry, and a
// sub-brand sitting inside a parent site is the normal shape for that.
//
// Server component, like the pages that use it, so the ranking still ships as
// HTML with no client JS.
import Link from 'next/link';
import { T } from '@/lib/theme';

const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

export default function SotHeader({ active }) {
  return (
    <header className="soth">
      <style dangerouslySetInnerHTML={{ __html: `
.soth{width:100vw;margin-left:calc(50% - 50vw);background:var(--ground);color:#fff;
  border-bottom:none;position:relative;}
/* The brand rule is the site's own navy-to-blue gradient (the same device
   app/sporcle-alternative uses), not a gold bar. Gold is reserved for medals. */
.soth::after{content:'';position:absolute;left:0;right:0;bottom:0;height:3px;
  background:linear-gradient(90deg,var(--accent),var(--blue) 55%,var(--blue-400));}
.soth-in{max-width:1180px;margin:0 auto;padding:13px clamp(14px,2vw,24px);
  display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
.soth-brand{display:flex;flex-direction:column;gap:2px;text-decoration:none;color:inherit;margin-right:auto;}
.soth-wm{font-size:19px;font-weight:800;letter-spacing:-.02em;line-height:1;color:#fff;}
.soth-wm b{color:var(--blue-400);font-weight:800;}
.soth-tag{font-size:9.5px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:#9fb0cc;}
.soth-nav{display:flex;gap:6px;flex-wrap:wrap;}
.soth-nav a{font-size:12.5px;font-weight:700;padding:7px 13px;border-radius:8px;
  text-decoration:none;color:#c3d1e8;border:1px solid rgba(255,255,255,.16);white-space:nowrap;}
.soth-nav a.on{background:var(--cta);border-color:var(--cta);color:#fff;}
.soth-back{font-size:11px;font-weight:700;color:#8fa3c2;text-decoration:none;white-space:nowrap;}
.soth-back:hover{color:#fff;}
@media(max-width:560px){
  .soth-in{padding:11px 12px;gap:10px;}
  .soth-wm{font-size:17px;}
  .soth-brand{margin-right:0;width:100%;}
  .soth-nav a{font-size:12px;padding:6px 11px;}
}
      ` }} />
      <div className="soth-in">
        <Link href="/collegefootballrankings" className="soth-brand">
          <span className="soth-wm">Source of <b>Truths</b></span>
          <span className="soth-tag">Sports Rankings</span>
        </Link>
        <nav className="soth-nav">
          <Link href="/collegefootballrankings" className={active === 'cfb' ? 'on' : undefined}>
            College Football
          </Link>
          <Link href="/nflrankings" className={active === 'nfl' ? 'on' : undefined}>
            NFL
          </Link>
        </nav>
        <Link href="/" className="soth-back" style={{ fontFamily: FONT, color: T.blue200 }}>
          Mind&nbsp;Loft&nbsp;&rsaquo;
        </Link>
      </div>
    </header>
  );
}
