'use client';

// The "keep playing / share" group shown on each daily-game page, directly under
// the puzzle and above the leaderboard. Two parts:
//   1. an actions row (Challenge a Friend + Share This Puzzle) — a larger 2-up
//      block on its own (only when the page passes challengeHref/share); and
//   2. the games grid — the OTHER dailies (plus one evergreen popular quiz to
//      keep the count even), 2-wide on phones and 3-wide on desktop.
// Games the viewer has already finished today get a faint green wash + a check
// badge (from /api/quiz/daily-combined, same source as the end card).
//
// Same tile look as the /quizzes hub games row, but self-contained (its own
// styles) since the game pages don't load the hub CSS. Adding a game to the
// registry here adds it to every other game's page.

import React, { useState, useEffect } from 'react';
import { Swords, Share2, Check } from 'lucide-react';
import useDailyOrder, { sortByDailyOrder } from './useDailyOrder';
import ReportIssue from './ReportIssue';

const GAMES = [
  { key: 'crux', href: '/crux', name: 'Crux', tag: 'A clueless crossword', img: '/games/btn-crux.png' },
  { key: 'emcee', href: '/emcee', name: 'Emcee', tag: 'The daily mini crossword', img: '/games/btn-emcee.png' },
  { key: 'shards', href: '/shards', name: 'Shards', tag: 'Reassemble the crossword', img: '/games/btn-shards.png' },
  { key: 'garble', href: '/garble', name: 'Garble', tag: 'Untangle five words', img: '/games/btn-garble.png' },
  { key: 'links', href: '/links', name: 'Links', tag: 'Four hidden threads', img: '/games/btn-links.png' },
  { key: 'span', href: '/span', name: 'Span', tag: 'Cross the map', img: '/games/btn-span.png' },
  { key: 'dating', href: '/dating', name: 'Dating', tag: 'Put history in order', img: '/games/btn-dating.png' },
  { key: 'tally', href: '/tally', name: 'Tally', tag: 'Balance the books', img: '/games/btn-tally.png' },
  { key: 'suds', href: '/suds', name: 'Suds', tag: 'The daily sudoku', img: '/games/btn-suds.png' },
  { key: 'carve', href: '/carve', name: 'Carve', tag: 'Equal-sum blocks', img: '/games/btn-carve.png' },
  { key: 'extra', href: '/extra', name: 'Extra', tag: 'Name the story', img: '/games/btn-extra.png' },
  { key: 'stet', href: '/stet', name: 'Stet', tag: 'Spot the error, fix the copy', img: '/games/btn-stet.png' },
  { key: 'outwit', href: '/outwit', name: 'Outwit', tag: 'Beat the crowd', img: '/games/btn-outwit.png' },
  { key: 'outrank', href: '/outrank', name: 'Outrank', tag: "Call the crowd's order", img: '/games/btn-outrank.png' },
  { key: 'tuck', href: '/tuck', name: 'Tuck', tag: 'Same letters, highest score wins', img: '/games/btn-tuck.png' },
  { key: 'alibi', href: '/alibi', name: 'Alibi', tag: 'Solve the nightly whodunit', img: '/games/btn-alibi.png' },
  { key: 'cipher', href: '/cipher', name: 'Cipher', tag: 'Crack the letter math', img: '/games/btn-cipher.png' },
  { key: 'ping', href: '/ping', name: 'Ping', tag: 'Find the secret city', img: '/games/btn-ping.png' },
  { key: 'warmer', href: '/warmer', name: 'Warmer', tag: 'Hotter or colder', img: '/games/btn-warmer.png' },
  { key: 'jester', href: '/jester', name: 'Jesters', tag: 'Seat the court', img: '/games/btn-jester.png' },
  { key: 'sworn', href: '/sworn', name: 'Sworn', tag: 'Spot the liars', img: '/games/btn-sworn.png' },
  { key: 'axiom', href: '/axiom', name: 'Axiom', tag: 'Find the hidden rule', img: '/games/btn-axiom.png' },
  { key: 'hearsay', href: '/hearsay', name: 'Hearsay', tag: "Deduce what they don't know", img: '/games/btn-hearsay.png' },
  { key: 'venn', href: '/venn', name: 'Venn', tag: 'Sort the overlaps', img: '/games/btn-venn.png' },
  { key: 'stands', href: '/stands', name: 'Stands', tag: 'Rebuild the results', img: '/games/btn-stands.png' },
  { key: 'bracket', href: '/bracket', name: 'Bracket', tag: 'Name every winner', img: '/games/btn-bracket.png' },
  { key: 'lode', href: '/lode', name: 'Lode', tag: 'Seven letters, rare words pay', img: '/games/btn-lode.png' },
  { key: 'etch', href: '/etch', name: 'Etch', tag: 'A picture in the numbers', img: '/games/btn-etch.png' },
  { key: 'hedge', href: '/hedge', name: 'Hedge', tag: 'Draw one closed loop', img: '/games/btn-hedge.png' },
  { key: 'listed', href: '/listed', name: 'Listed', tag: 'Rank the list, top to bottom', img: '/games/btn-listed.png' },
  { key: 'mate', href: '/mate', name: 'Mate', tag: 'White to play and mate', img: '/games/btn-mate.png' },
  { key: 'four', href: '/four', name: 'Four', tag: 'One column wins', img: '/games/btn-four.png' },
];
const GAMES_BY_KEY = Object.fromEntries(GAMES.map((g) => [g.key, g]));

// Games grouped by category, matching the five families in the end-of-game
// card (DailyEndCard CAT_META / DAILY_GAMES.cat) so the two surfaces agree.
// Within each group the order is popularity (yesterday's plays), same as
// everywhere else.
const CATEGORIES = [
  { key: 'word', label: 'Word', keys: ['crux', 'lode', 'emcee', 'shards', 'garble', 'links', 'stet', 'tuck', 'warmer'] },
  { key: 'history', label: 'History', keys: ['dating', 'extra', 'bracket', 'listed'] },
  { key: 'geography', label: 'Geography', keys: ['span', 'ping'] },
  { key: 'numbers', label: 'Numbers', keys: ['tally', 'suds', 'carve', 'cipher', 'hedge'] },
  { key: 'crowd', label: 'Crowd Psychology', keys: ['outwit', 'outrank'] },
  { key: 'logic', label: 'Logic', keys: ['alibi', 'jester', 'sworn', 'axiom', 'hearsay', 'venn', 'stands', 'etch', 'mate', 'four'] },
];

export default function DailyGamesGrid({ self, maxWidth = 640, challengeHref = null, share = null, divider = false, boardSlot = null, light = false }) {
  // "(for credit)" is appended only for a registered viewer: their share link
  // carries their referral code, so the share genuinely earns them credit. A
  // signed-out visitor sees the plain label rather than a promise we can't keep.
  // Resolved in an effect so server and first client render agree.
  // Display order within each category = yesterday's popularity (canonical
  // until the order loads).
  const dailyOrder = useDailyOrder();
  // The other dailies (everything but the game you're on), grouped by category
  // to match the /daily hub, with each group popularity-sorted.
  const groups = CATEGORIES
    .map((c) => ({
      key: c.key,
      label: c.label,
      games: sortByDailyOrder(
        c.keys.filter((k) => k !== self).map((k) => GAMES_BY_KEY[k]).filter(Boolean),
        dailyOrder
      ),
    }))
    .filter((c) => c.games.length > 0);

  // Which dailies the viewer has already finished today (registered viewers) —
  // those tiles show a faint wash + check. Guests get no marks (empty set).
  const [donePerGame, setDonePerGame] = useState(null);
  useEffect(() => {
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    const qs = new URLSearchParams();
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    let alive = true;
    fetch('/api/quiz/daily-combined?' + qs.toString())
      .then((r) => r.json())
      .then((d) => { if (alive && d && d.me && d.me.perGame) setDonePerGame(d.me.perGame); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  const completed = donePerGame ? new Set(Object.keys(donePerGame).filter((k) => !(donePerGame[k] && donePerGame[k].abandoned))) : new Set();

  const actionCount = (challengeHref ? 1 : 0) + (share ? 1 : 0);

  return (
    <div className={light ? 'dgg-light' : undefined} style={{ maxWidth, margin: '18px auto 0' }}>
      <style>{`
        .dgg-actions{display:grid;gap:10px;margin-bottom:14px;}
        .dgg-grp{margin-bottom:14px;}
        .dgg-glabel{display:flex;align-items:center;gap:10px;margin:0 2px 8px;}
        .dgg-glabel .k{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#0e1d40;white-space:nowrap;}
        .dgg-glabel .line{flex:1;height:1px;background:rgba(28,30,36,0.12);}
        .dgg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
        @media(min-width:768px){.dgg{grid-template-columns:repeat(3,minmax(0,1fr));}}
        @media(max-width:359px){.dgg{grid-template-columns:1fr;}}
        .dgg-t{position:relative;display:flex;flex-direction:row;align-items:center;gap:10px;min-height:58px;border:1px solid rgba(28,30,36,0.14);border-radius:14px;background:#ffffff;padding:10px 13px;text-decoration:none;overflow:hidden;box-sizing:border-box;}
        .dgg-t:hover{border-color:#5b8bff;}
        .dgg-txt{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1 1 auto;}
        .dgg-art{flex:0 0 auto;height:42px;width:auto;}
        .dgg-nm{font-size:15px;font-weight:800;letter-spacing:-.3px;color:#1c1e24;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .dgg-p{font-size:10.5px;font-weight:700;color:#262b35;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .dgg-done{background:linear-gradient(0deg,rgba(22,163,74,0.14),rgba(22,163,74,0.14)),#0e1d40;border-color:rgba(34,197,94,0.5);}
        .dgg-done .dgg-art{opacity:.5;}
        .dgg-done .dgg-nm{color:#dfeee4;}
        .dgg-check{position:absolute;top:7px;right:7px;width:19px;height:19px;border-radius:50%;background:#16a34a;color:#1c1e24;display:flex;align-items:center;justify-content:center;border:2px solid #0e1d40;box-shadow:0 1px 2px rgba(0,0,0,0.35);}
        .dgg-act{min-height:76px;justify-content:center;gap:10px;cursor:pointer;font-family:inherit;width:100%;}
        .dgg-act .dgg-act-l{font-size:15px;font-weight:800;letter-spacing:.03em;text-transform:uppercase;color:#1c1e24;line-height:1.15;text-align:center;}
        .dgg-act svg{flex:0 0 auto;}
        .dgg-act.dgg-challenge svg{color:#5b8bff;}
        .dgg-act.dgg-share svg{color:#f8b84a;}

        /* Light theme (owner, 2026-07-23): drop the navy fill so the daily-game
           bottom section matches the end-of-game card. Game icons are kept. */
        .dgg-light .dgg-t{background:#fff;border-color:rgba(20,22,28,0.12);}
        .dgg-light .dgg-t:hover{border-color:#5b8bff;}
        .dgg-light .dgg-nm{color:#1c1e24;}
        .dgg-light .dgg-p{color:#262b35;}
        /* The letter-tile game icons are drawn for a dark ground and wash out on
           white, so give the icon its own navy chip on the light tiles. */
        .dgg-light .dgg-art{background:#f1f3f6;border-radius:9px;padding:5px;box-sizing:border-box;}
        .dgg-light .dgg-done{background:linear-gradient(0deg,rgba(22,163,74,0.10),rgba(22,163,74,0.10)),#fff;border-color:rgba(34,197,94,0.5);}
        .dgg-light .dgg-done .dgg-art{opacity:.6;}
        .dgg-light .dgg-done .dgg-nm{color:#15803d;}
        .dgg-light .dgg-check{border-color:#1c1e24;}
        .dgg-light .dgg-act.dgg-challenge{background:#eff4fd;border-color:#d7e3f8;}
        .dgg-light .dgg-act.dgg-challenge .dgg-act-l{color:#1e3a8a;}
        .dgg-light .dgg-act.dgg-challenge svg{color:#2563eb;}
        .dgg-light .dgg-act.dgg-share{background:#fdf6e4;border-color:#f0e3bb;}
        .dgg-light .dgg-act.dgg-share .dgg-act-l{color:#5c4a06;}
        .dgg-light .dgg-act.dgg-share svg{color:#c58a12;}
      `}</style>
      {self ? (
        <div style={{ marginBottom: 12 }}>
          <ReportIssue self={self} name={GAMES_BY_KEY[self] ? GAMES_BY_KEY[self].name : undefined} accent="#0e1d40" />
        </div>
      ) : null}
      {actionCount > 0 ? (
        <div className="dgg-actions" style={{ gridTemplateColumns: actionCount === 1 ? '1fr' : 'repeat(2,minmax(0,1fr))' }}>
          {challengeHref ? (
            <a href={challengeHref} className="dgg-t dgg-act dgg-challenge" aria-label="Challenge a friend">
              <Swords size={20} strokeWidth={2.5} />
              <span className="dgg-act-l">Challenge a Friend</span>
            </a>
          ) : null}
          {share ? (
            <button type="button" onClick={share.onClick} className="dgg-t dgg-act dgg-share" aria-label="Share this puzzle">
              <Share2 size={20} strokeWidth={2.5} />
              <span className="dgg-act-l">{share.label}{!/copied/i.test(share.label || '') ? ' (for credit)' : ''}</span>
            </button>
          ) : null}
        </div>
      ) : null}
      {/* The daily-leaderboard panel sits directly under the Challenge / Share
          actions, above the games grid (owner layout, 2026-07-23). */}
      {boardSlot}
      {groups.map((grp) => (
        <div className="dgg-grp" key={grp.key}>
          <div className="dgg-glabel">
            <span className="k">{grp.label}</span>
            <span className="line" />
          </div>
          <div className="dgg">
            {grp.games.map((g) => {
              const done = completed.has(g.key);
              return (
                <a
                  key={g.href}
                  href={g.href}
                  className={`dgg-t${done ? ' dgg-done' : ''}`}
                  aria-label={`${g.name} — daily puzzle${done ? ', completed today' : ''}`}
                >
                  <span className="dgg-txt">
                    <span className="dgg-nm">{g.name}</span>
                    <span className="dgg-p">{g.tag} →</span>
                  </span>
                  <img className="dgg-art" src={g.img} alt="" aria-hidden="true" />
                  {done ? <span className="dgg-check"><Check size={11} strokeWidth={3.4} /></span> : null}
                </a>
              );
            })}
          </div>
        </div>
      ))}
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <a href="/daily" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 11.5, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, color: '#5b8bff', textDecoration: 'none', borderBottom: '1px solid rgba(91,139,255,0.5)', paddingBottom: 1 }}>
          All daily puzzles &amp; archive →
        </a>
      </div>
      {divider ? <div style={{ borderTop: '1px solid rgba(28,30,36,0.14)', marginTop: 22 }} /> : null}
    </div>
  );
}
