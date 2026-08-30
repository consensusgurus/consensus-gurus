import Grain from '../Grain';
import NavyFrame from './NavyFrame';
import QuizNavHeader from '../quizzes/QuizNavHeader';
import { ALL_CIRCUITS, DISPLAY_CIRCUITS, circuitGamesFor, circuitPageHref, isMarquee } from '@/lib/circuits';
import { SITE_URL } from '@/lib/site';

// /circuits — the index of all fifteen.
//
// Two jobs. It is the crawlable link path to every /circuits/<id> page (and
// through them to every daily), and it is where a circuit page sends a reader
// who wants the others. The home console band can only show one circuit at a
// time, so until this page there was no single surface listing the family.
//
// Fully server-rendered, no client island: nothing here depends on who is
// looking. The per-circuit pages carry the viewer's own state.

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Circuits: Daily Puzzle Runs by Skill | Mind Loft',
  description:
    'Fifteen circuits, each a run of daily puzzles played as one sitting and ranked on your combined placement across all of them. Crosswords, sudoku, deduction, mental math and more, free and with no account needed.',
  alternates: { canonical: '/circuits' },
  openGraph: {
    title: 'Mind Loft Circuits',
    description: 'Five daily puzzles, one run, one combined leaderboard. Pick the skill you want to work.',
    url: '/circuits',
    type: 'website',
    siteName: 'Mind Loft',
  },
};

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

export default function CircuitsIndexPage() {
  const day = etTodayServer();
  // Browse order, the same one the home page's shelf uses.
  const rows = DISPLAY_CIRCUITS.map((c) => ({
    id: c.id,
    name: c.name,
    marquee: !!isMarquee(c.id),
    invite: c.share.invite,
    tier: (c.trophy && c.trophy.tier) || null,
    games: circuitGamesFor(c.id, day).map((g) => g.name),
  })).filter((r) => r.games.length >= 2);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Mind Loft Circuits',
    url: `${SITE_URL}/circuits`,
    numberOfItems: rows.length,
    itemListElement: rows.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: r.marquee ? r.name : `The ${r.name} Circuit`,
      url: `${SITE_URL}${circuitPageHref(r.id)}`,
    })),
  };

  return (
    <>
      <Grain />
      <QuizNavHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* NavyFrame carries the footer, re-inked for this page's navy ground.
          See app/circuits/NavyFrame.jsx. */}
      <NavyFrame>
      <div className="cix">
        <style dangerouslySetInnerHTML={{ __html: `
          .cix{max-width:860px;margin:0 auto;padding:26px 18px 90px;
               font-family:'Manrope',system-ui,-apple-system,sans-serif;color:var(--ink);}
          .cix-hd{position:relative;background:var(--ground);color:#fff;border-radius:14px;
                  padding:22px 24px;overflow:hidden;}
          .cix-hd::before{content:'';position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--gold);}
          .cix-e{font-size:9.5px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);}
          .cix-h1{font-size:32px;font-weight:800;letter-spacing:-.8px;line-height:1.08;margin:4px 0 0;}
          .cix-sub{font-size:14px;font-weight:600;color:#c3d5f5;margin-top:8px;line-height:1.5;max-width:62ch;}
          .cix-sec{font-size:9.5px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;
                   color:#bfdbfe;margin:28px 0 9px;}
          .cix-cards{display:flex;flex-direction:column;gap:9px;}
          .cix-c{position:relative;display:block;background:var(--white);border:1.5px solid var(--border);
                 border-left-color:var(--blue);border-radius:12px;overflow:hidden;
                 padding:14px 16px 14px 19px;text-decoration:none;color:inherit;}
          .cix-c.marq{border-left-color:var(--gold);}
          .cix-c::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;
                         background:var(--blue);}
          .cix-c.marq::before{background:var(--gold);}
          .cix-c:hover{border-color:var(--blue);border-left-color:var(--blue);}
          .cix-c.marq:hover{border-left-color:var(--gold);}
          .cix-top{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;}
          .cix-nm{font-size:17px;font-weight:800;letter-spacing:-.35px;}
          .cix-tier{font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;
                    padding:4px 8px;border-radius:999px;background:var(--surface);color:var(--slate,#64748b);}
          .cix-tier.gold{background:#fdf3d8;color:#8a6a12;}
          .cix-tier.silver{background:#eef0f3;color:#5b6270;}
          .cix-tier.bronze{background:#f7ece2;color:#8a5a30;}
          .cix-iv{font-size:12.5px;font-weight:600;color:var(--slate,#475569);margin-top:5px;line-height:1.5;}
          .cix-gm{font-size:11px;font-weight:700;color:var(--slate,#94a3b8);margin-top:6px;}
          .cix-note{font-size:11.5px;font-weight:600;color:#9fb6e8;line-height:1.6;margin-top:12px;}
          @media(max-width:620px){
            .cix{padding:16px 12px 70px;}
            .cix-h1{font-size:25px;}
          }
        ` }} />

        <div className="cix-hd">
          <div className="cix-e">Circuits</div>
          <h1 className="cix-h1">One run, one combined board</h1>
          <p className="cix-sub">
            A circuit is a handful of daily puzzles played as one sitting and ranked on your combined
            placement across all of them, shortest game first. The Daily Five changes every day. The rest
            are fixed, so you can pick the skill you want to work and come back to it tomorrow.
          </p>
        </div>

        <div className="cix-sec">All {rows.length} circuits</div>
        <div className="cix-cards">
          {rows.map((r) => (
            <a key={r.id} className={`cix-c${r.marquee ? ' marq' : ''}`} href={circuitPageHref(r.id)}>
              <span className="cix-top">
                <span className="cix-nm">{r.marquee ? r.name : `The ${r.name} Circuit`}</span>
                {r.tier ? <span className={`cix-tier ${r.tier}`}>{r.tier}</span> : null}
              </span>
              <span className="cix-iv" style={{ display: 'block' }}>{r.invite}</span>
              <span className="cix-gm" style={{ display: 'block' }}>
                {r.games.length} games &middot; {r.games.join(', ')}
              </span>
            </a>
          ))}
        </div>
        <div className="cix-note">
          Every game is free and needs no account. A game played on its own still counts toward its
          circuit, but all of them have to land on the same day to take a rank on that circuit&rsquo;s board.
        </div>
      </div>
      </NavyFrame>
    </>
  );
}
