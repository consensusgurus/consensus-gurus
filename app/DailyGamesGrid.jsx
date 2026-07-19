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
  { key: 'garble', href: '/garble', name: 'Garble', tag: 'Untangle five words', img: '/games/btn-garble.png' },
  { key: 'links', href: '/links', name: 'Links', tag: 'Four hidden threads', img: '/games/btn-links.png' },
  { key: 'span', href: '/span', name: 'Span', tag: 'Cross the map', img: '/games/btn-span.png' },
  { key: 'dating', href: '/dating', name: 'Dating', tag: 'Put history in order', img: '/games/btn-dating.png' },
  { key: 'tally', href: '/tally', name: 'Tally', tag: 'Balance the books', img: '/games/btn-tally.png' },
  { key: 'suds', href: '/suds', name: 'Suds', tag: 'The daily sudoku', img: '/games/btn-suds.png' },
  { key: 'carve', href: '/carve', name: 'Carve', tag: 'Equal-sum blocks', img: '/games/btn-carve.png' },
  { key: 'circa', href: '/circa', name: 'Circa', tag: 'Guess the year', img: '/games/btn-circa.png' },
  { key: 'extra', href: '/extra', name: 'Extra', tag: 'Name the story', img: '/games/btn-extra.png' },
  { key: 'stet', href: '/stet', name: 'Stet', tag: 'Fix the wrong word', img: '/games/btn-stet.png' },
  { key: 'outwit', href: '/outwit', name: 'Outwit', tag: 'Beat the crowd', img: '/games/btn-outwit.png' },
  { key: 'tuck', href: '/tuck', name: 'Tuck', tag: 'Build your own crossword', img: '/games/btn-tuck.png' },
  { key: 'alibi', href: '/alibi', name: 'Alibi', tag: 'Solve the nightly whodunit', img: '/games/btn-alibi.png' },
  { key: 'cipher', href: '/cipher', name: 'Cipher', tag: 'Crack the letter math', img: '/games/btn-cipher.png' },
  { key: 'ping', href: '/ping', name: 'Ping', tag: 'Find the secret city', img: '/games/btn-ping.png' },
  { key: 'warmer', href: '/warmer', name: 'Warmer', tag: 'Hotter or colder', img: '/games/btn-warmer.png' },
  { key: 'jester', href: '/jester', name: 'Jester', tag: 'Seat the court', img: '/games/btn-jester.png' },
  { key: 'sworn', href: '/sworn', name: 'Sworn', tag: 'Spot the liars', img: '/games/btn-sworn.png' },
];
const GAMES_BY_KEY = Object.fromEntries(GAMES.map((g) => [g.key, g]));

// Games grouped by category, matching the five families in the end-of-game
// card (DailyEndCard CAT_META / DAILY_GAMES.cat) so the two surfaces agree.
// Within each group the order is popularity (yesterday's plays), same as
// everywhere else.
const CATEGORIES = [
  { key: 'word', label: 'Word', keys: ['crux', 'emcee', 'garble', 'links', 'stet', 'tuck', 'warmer'] },
  { key: 'history', label: 'History', keys: ['dating', 'circa', 'extra'] },
  { key: 'geography', label: 'Geography', keys: ['span', 'ping'] },
  { key: 'numbers', label: 'Numbers', keys: ['tally', 'suds', 'carve', 'outwit', 'cipher'] },
  { key: 'logic', label: 'Logic', keys: ['alibi', 'jester', 'sworn'] },
];

export default function DailyGamesGrid({ self, maxWidth = 640, challengeHref = null, share = null, divider = false }) {
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
  const completed = donePerGame ? new Set(Object.keys(donePerGame)) : new Set();

  const actionCount = (challengeHref ? 1 : 0) + (share ? 1 : 0);

  return (
    <div style={{ maxWidth, margin: '18px auto 0' }}>
      <style>{`
        .dgg-actions{display:grid;gap:10px;margin-bottom:14px;}
        .dgg-grp{margin-bottom:14px;}
        .dgg-glabel{display:flex;align-items:center;gap:10px;margin:0 2px 8px;}
        .dgg-glabel .k{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#0e1d40;white-space:nowrap;}
        .dgg-glabel .line{flex:1;height:1px;background:rgba(28,30,36,0.12);}
        .dgg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
        @media(min-width:768px){.dgg{grid-template-columns:repeat(3,minmax(0,1fr));}}
        @media(max-width:359px){.dgg{grid-template-columns:1fr;}}
        .dgg-t{position:relative;display:flex;flex-direction:row;align-items:center;gap:10px;min-height:58px;border:1px solid rgba(28,30,36,0.14);border-radius:14px;background:#0e1d40;padding:10px 13px;text-decoration:none;overflow:hidden;box-sizing:border-box;}
        .dgg-t:hover{border-color:#5b8bff;}
        .dgg-txt{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1 1 auto;}
        .dgg-art{flex:0 0 auto;height:42px;width:auto;}
        .dgg-nm{font-size:15px;font-weight:800;letter-spacing:-.3px;color:#fff;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .dgg-p{font-size:10.5px;font-weight:700;color:#9fb0d4;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .dgg-done{background:linear-gradient(0deg,rgba(22,163,74,0.14),rgba(22,163,74,0.14)),#0e1d40;border-color:rgba(34,197,94,0.5);}
        .dgg-done .dgg-art{opacity:.5;}
        .dgg-done .dgg-nm{color:#dfeee4;}
        .dgg-check{position:absolute;top:7px;right:7px;width:19px;height:19px;border-radius:50%;background:#16a34a;color:#fff;display:flex;align-items:center;justify-content:center;border:2px solid #0e1d40;box-shadow:0 1px 2px rgba(0,0,0,0.35);}
        .dgg-act{min-height:76px;justify-content:center;gap:10px;cursor:pointer;font-family:inherit;width:100%;}
        .dgg-act .dgg-act-l{font-size:15px;font-weight:800;letter-spacing:.03em;text-transform:uppercase;color:#fff;line-height:1.15;text-align:center;}
        .dgg-act svg{flex:0 0 auto;}
        .dgg-act.dgg-challenge svg{color:#5b8bff;}
        .dgg-act.dgg-share svg{color:#f8b84a;}
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
              <span className="dgg-act-l">{share.label}</span>
            </button>
          ) : null}
        </div>
      ) : null}
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
                  aria-label={`${g.name} — daily game${done ? ', completed today' : ''}`}
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
          All daily games &amp; archive →
        </a>
      </div>
      {divider ? <div style={{ borderTop: '1px solid rgba(28,30,36,0.14)', marginTop: 22 }} /> : null}
    </div>
  );
}
