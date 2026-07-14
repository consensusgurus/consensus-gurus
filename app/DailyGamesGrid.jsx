'use client';

// The combined "keep playing / share" group shown on each daily-game page,
// directly under the puzzle and above the leaderboard. One tidy grid of
// equal-size tiles: the two share actions (Challenge a Friend, Share This
// Puzzle) on top, then the OTHER dailies plus one evergreen popular quiz — so
// on any given daily page the games row is always an even 2-wide block. Same
// tile look as the /quizzes hub games row, but self-contained (its own styles)
// since the game pages don't load the hub CSS.
//
// Pass challengeHref + share to get the two action tiles on top (they adopt the
// same tile box as the games, so all six read as one set). Pass divider to draw
// the section rule below the archive link. Adding a game to the registry here
// adds it to every other game's page.

import React from 'react';
import { Swords, Share2 } from 'lucide-react';

const GAMES = [
  { key: 'crux', href: '/crux', name: 'Crux', tag: 'A clueless crossword', img: '/games/btn-crux.png', label: 'Daily' },
  { key: 'garble', href: '/garble', name: 'Garble', tag: 'Untangle five words', img: '/games/btn-garble.png', label: 'Daily' },
  { key: 'links', href: '/links', name: 'Links', tag: 'Four hidden threads', img: '/games/btn-links.png', label: 'Daily' },
  { key: 'span', href: '/span', name: 'Span', tag: 'Cross the map', img: '/games/btn-span.png', label: 'Daily' },
  { key: 'dating', href: '/dating', name: 'Dating', tag: 'Put history in order', img: '/games/btn-dating.png', label: 'Daily' },
];
// The evergreen fill tile: the site's most-played quiz, so the games block is
// always a full 2-wide even though there are only three "other" dailies.
const POPULAR = { key: 'popular', href: '/quiz/europe-no-outline', name: 'Map: Europe', tag: 'No outlines — our #1', img: '/games/btn-map.png', label: 'Popular' };

export default function DailyGamesGrid({ self, maxWidth = 640, challengeHref = null, share = null, divider = false }) {
  // Keep the games row an even 2-wide: with an even count of "other" dailies the
  // dailies fill it alone; with an odd count the evergreen POPULAR tile evens
  // it out (4 games -> 3 others + POPULAR; 5 games -> 4 others, no POPULAR).
  const others = GAMES.filter((g) => g.key !== self);
  const tiles = others.length % 2 === 0 ? others : [...others, POPULAR];
  return (
    <div style={{ maxWidth, margin: '18px auto 0' }}>
      <style>{`
        .dgg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
        @media(max-width:359px){.dgg{grid-template-columns:1fr;}}
        .dgg-t{display:flex;flex-direction:row;align-items:center;gap:10px;min-height:66px;border:1px solid rgba(28,30,36,0.14);border-radius:14px;background:#0e1d40;padding:10px 13px;text-decoration:none;overflow:hidden;box-sizing:border-box;}
        .dgg-t:hover{border-color:#5b8bff;}
        .dgg-txt{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1 1 auto;}
        .dgg-art{flex:0 0 auto;height:44px;width:auto;}
        .dgg-tag{font-size:8.5px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:#f8b84a;margin-bottom:2px;}
        .dgg-nm{font-size:15px;font-weight:800;letter-spacing:-.3px;color:#fff;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .dgg-p{font-size:10.5px;font-weight:700;color:#9fb0d4;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .dgg-act{justify-content:center;gap:9px;cursor:pointer;font-family:inherit;width:100%;}
        .dgg-act .dgg-act-l{font-size:13px;font-weight:800;letter-spacing:.03em;text-transform:uppercase;color:#fff;line-height:1.15;text-align:center;}
        .dgg-act svg{flex:0 0 auto;}
        .dgg-act.dgg-challenge svg{color:#5b8bff;}
        .dgg-act.dgg-share svg{color:#f8b84a;}
      `}</style>
      <div className="dgg">
        {challengeHref ? (
          <a href={challengeHref} className="dgg-t dgg-act dgg-challenge" aria-label="Challenge a friend">
            <Swords size={17} strokeWidth={2.5} />
            <span className="dgg-act-l">Challenge a Friend</span>
          </a>
        ) : null}
        {share ? (
          <button type="button" onClick={share.onClick} className="dgg-t dgg-act dgg-share" aria-label="Share this puzzle">
            <Share2 size={17} strokeWidth={2.5} />
            <span className="dgg-act-l">{share.label}</span>
          </button>
        ) : null}
        {tiles.map((g) => (
          <a key={g.href} href={g.href} className="dgg-t" aria-label={`${g.name} — ${g.label === 'Daily' ? 'daily game' : 'popular quiz'}`}>
            <span className="dgg-txt">
              <span className="dgg-tag">{g.label}</span>
              <span className="dgg-nm">{g.name}</span>
              <span className="dgg-p">{g.tag} →</span>
            </span>
            <img className="dgg-art" src={g.img} alt="" aria-hidden="true" />
          </a>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 11 }}>
        <a href="/daily" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 11.5, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, color: '#5b8bff', textDecoration: 'none', borderBottom: '1px solid rgba(91,139,255,0.5)', paddingBottom: 1 }}>
          All daily games &amp; archive →
        </a>
      </div>
      {divider ? <div style={{ borderTop: '1px solid rgba(28,30,36,0.14)', marginTop: 22 }} /> : null}
    </div>
  );
}
