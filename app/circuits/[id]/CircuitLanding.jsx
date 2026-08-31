'use client';

// The circuit landing page's body. Server-rendered content comes in as props
// (name, blurb, share copy, trophy, the games in run order); everything this
// component fetches is the VIEWER'S own state, which is why it is a client
// island rather than part of the page.
//
// THE SHARE BUTTON IS THE POINT OF THE PAGE. It hands over
// circuitShareInvite(id) — the circuit's evergreen line plus a link back to
// this page — through the same notifyShareCredit pop-up every daily uses, so a
// registered sharer's referral code is stamped in and a signed-out sharer still
// gets the text and the link rather than a sign-up wall.
//
// The link is passed EXPLICITLY as the second argument. ShareCreditPop defaults
// to the current page URL, which happens to be right here, but a bare default
// would carry any query string the visitor arrived with (a ?ref, a campaign
// tag) into the thing they share. Naming the canonical page keeps every shared
// link identical.

import { useEffect, useState } from 'react';
import { ArrowRight, Share2, Trophy, Check } from 'lucide-react';
import { circuitShareInvite, circuitShareUrl, circuitHref, MARQUEE_ID, CIRCUIT_PARAM, isRunnableCircuit, runHref, runSummaryHref, circuitScoreMode } from '@/lib/circuits';
import { notifyShareCredit } from '../../ShareCreditPop';
import { dailyMeIdentity } from '../../dailyMeClient';
import { isMobileDevice } from '@/lib/is-mobile';
import { withRef } from '@/lib/referrals';
import GameGlyph from '../../GameGlyph';

export default function CircuitLanding({ circuit, games }) {
  const { id, name, share, trophy, marquee } = circuit;
  const n = games.length;

  // The viewer's own state, and today's field. Read in an effect, never during
  // render: the server has no idea what today is in Eastern or who is looking,
  // so deriving either during render makes the first client paint disagree with
  // the server's.
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    const { anonId, email } = dailyMeIdentity();
    const qs = new URLSearchParams();
    if (marquee) qs.set('five', '1');
    else qs.set(CIRCUIT_PARAM, id);
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    fetch(`/api/quiz/daily-combined?${qs.toString()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (alive && d && !d.error) setData(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, [id, marquee]);

  const perGame = (data && data.me && data.me.perGame) || {};
  const donePlayed = games.filter((g) => perGame[g.key] && !perGame[g.key].abandoned);
  const done = donePlayed.length;
  const complete = n > 0 && done === n;
  const field = (data && data.overallField) || 0;
  // WHAT THEY SCORED, on the page that told them they had finished (owner,
  // 2026-08-29, having completed the Gauntlet and found no score anywhere on
  // it). The figures come out of the same payload the progress does; the
  // scorecard proper lives on the run summary, and the first action becomes a
  // link to it the moment the run is complete.
  const me = (data && data.me) || null;
  // Does this circuit's board count QUESTIONS RIGHT rather than ladder points?
  // Read off the circuit, not off the payload, because the copy under the run
  // list has to be right on the first paint, before any fetch lands.
  const byCorrect = circuitScoreMode(id) === 'correct';
  // A questions-right circuit has no ceiling until the day's banks are known,
  // so it shows none rather than a points figure that is not its unit.
  const maxTotal = (data && Number.isFinite(data.maxTotal) ? data.maxTotal : 0) || (byCorrect ? 0 : n * 15);
  const points = me && Number.isFinite(me.total) ? Math.round(me.total * 10) / 10 : null;
  const rank = me && Number.isFinite(me.rank) && me.rank > 0 ? me.rank : null;
  // The first game they have NOT played, so the button starts where they are
  // rather than always at the top of the run.
  const nextGame = games.find((g) => !(perGame[g.key] && !perGame[g.key].abandoned)) || games[0];
  // Can this circuit be played as one continuous quiz? Read off the circuit
  // rather than a name, so a second runnable circuit needs no edit here.
  const runnable = isRunnableCircuit(id);
  // Does this circuit shuffle its order daily? The copy under the run list has
  // to say which, because "shortest first" stops being true the moment it does.
  const ordered = !!(circuit.order && Array.isArray(circuit.order.tail));

  function doShare() {
    const url = withRef(circuitShareUrl(id));
    const text = circuitShareInvite(id, url);
    // The pop-up handles copy and the native sheet for everyone, so a true
    // return means this handler is done.
    if (notifyShareCredit(text, `https://${circuitShareUrl(id)}`)) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.share && isMobileDevice()) {
        navigator.share({ text }).catch(() => {});
        return;
      }
    } catch (e) {}
    try {
      navigator.clipboard?.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    } catch (e) {}
  }

  return (
    <div className="clp">
      <style dangerouslySetInnerHTML={{ __html: `
        .clp{max-width:860px;margin:0 auto;padding:26px 18px 90px;
             font-family:'Manrope',system-ui,-apple-system,sans-serif;color:var(--ink);}
        .clp-hd{position:relative;background:var(--ground);color:#fff;border-radius:14px;
                padding:22px 24px;overflow:hidden;}
        .clp-hd::before{content:'';position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--blue);}
        .clp-hd.marq::before{background:var(--gold);}
        .clp-hd.done::before{background:var(--success);}
        .clp-e{font-size:9.5px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:#9fc2ff;}
        .clp-hd.marq .clp-e{color:var(--gold);}
        .clp-h1{font-size:32px;font-weight:800;letter-spacing:-.8px;line-height:1.08;margin:4px 0 0;}
        .clp-sub{font-size:14px;font-weight:600;color:#c3d5f5;margin-top:8px;line-height:1.5;max-width:60ch;}
        .clp-acts{display:flex;gap:9px;margin-top:17px;flex-wrap:wrap;}
        .clp-go{display:inline-flex;align-items:center;gap:8px;background:var(--cta,#2563eb);color:#fff;
                border:none;border-radius:10px;padding:13px 19px;font-size:13px;font-weight:800;
                letter-spacing:.03em;text-decoration:none;cursor:pointer;}
        .clp-sh{display:inline-flex;align-items:center;gap:8px;background:transparent;color:#fff;
                border:1.5px solid #253357;border-radius:10px;padding:13px 17px;font-size:13px;
                font-weight:800;letter-spacing:.03em;cursor:pointer;font-family:inherit;}
        .clp-sh:hover{background:#101c39;}
        .clp-meta{display:flex;gap:22px;margin-top:16px;flex-wrap:wrap;}
        .clp-meta div b{display:block;font-size:21px;font-weight:800;letter-spacing:-.5px;
                        font-variant-numeric:tabular-nums;line-height:1;}
        .clp-meta div i{font-style:normal;display:block;font-size:9px;font-weight:800;letter-spacing:.12em;
                        text-transform:uppercase;color:#9fb6e8;margin-top:5px;}

        /* On the site's navy ground, not inside a card, so these need a light
           colour chosen against navy rather than against white. */
        .clp-sec{font-size:9.5px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;
                 color:#bfdbfe;margin:28px 0 9px;}
        .clp-note{font-size:11.5px;font-weight:600;color:#9fb6e8;line-height:1.6;margin-top:10px;}
        .clp-note a{color:#bfdbfe;}

        .clp-cards{display:flex;flex-direction:column;gap:9px;}
        .clp-c{position:relative;display:flex;align-items:center;gap:13px;background:var(--white);
               border:1.5px solid var(--border);border-left-color:var(--cc,#c9d2e0);
               border-radius:12px;padding:13px 15px 13px 18px;overflow:hidden;
               text-decoration:none;color:inherit;}
        .clp-c::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;
                       background:var(--cc,#c9d2e0);}
        .clp-c:hover{border-color:var(--blue);border-left-color:var(--cc,#c9d2e0);}
        .clp-num{flex:none;width:24px;height:24px;border-radius:50%;background:var(--surface-alt,#eef1f6);
                 color:var(--slate,#64748b);font-size:11px;font-weight:800;display:flex;align-items:center;
                 justify-content:center;font-variant-numeric:tabular-nums;}
        .clp-c.played .clp-num{background:var(--success);color:#fff;}
        .clp-ic{flex:none;width:34px;height:34px;border-radius:8px;display:flex;align-items:center;
          justify-content:center;color:var(--cc,#33415c);background:var(--surface,#f7f8fa);}
        .clp-ct{min-width:0;flex:1;}
        /* BLOCK, both of them. They are <span>s inside .clp-ct, and .clp-ct being a
           flex ITEM blockifies the box itself but NOT its children, so the two
           stayed inline and rendered as "DeepTrivia · One topic, fifteen
           questions" on one run-on line (owner report, 2026-08-18). */
        .clp-cn{display:block;font-size:16px;font-weight:800;letter-spacing:-.3px;color:var(--ink);}
        .clp-cm{display:block;font-size:11.5px;font-weight:700;color:var(--slate,#64748b);margin-top:2px;}
        .clp-arr{flex:none;color:var(--slate,#94a3b8);}

        .clp-tro{display:flex;align-items:center;gap:12px;background:var(--white);
                 border:1.5px solid var(--border);border-radius:12px;padding:14px 16px;}
        .clp-tro b{display:block;font-size:15px;font-weight:800;letter-spacing:-.2px;}
        /* A SPAN, never <s>. The band and the run summary both use <s> as a
           bare sub-line hook with text-decoration:none, which is fine on a
           surface nothing crawls. This page IS crawled, and <s> means "no
           longer accurate": a reader-mode pass, a screen reader and an indexer
           all render this trophy's own description as struck through. */
        .clp-trosub{display:block;font-size:11.5px;font-weight:700;
                    color:var(--slate,#64748b);margin-top:2px;}
        .clp-tier{flex:none;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;
                  padding:5px 9px;border-radius:999px;background:var(--surface);color:var(--slate,#64748b);}
        .clp-tier.gold{background:#fdf3d8;color:#8a6a12;}
        .clp-tier.silver{background:#eef0f3;color:#5b6270;}
        .clp-tier.bronze{background:#f7ece2;color:#8a5a30;}

        .clp-all{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:22px;
                 background:var(--white);color:var(--accent,#233a63);border:1.5px solid #1a2748;
                 border-radius:11px;padding:14px 18px;font-size:13px;font-weight:800;
                 letter-spacing:.03em;text-decoration:none;}
        .clp-all:hover{background:#eef3ff;}
        @media(max-width:620px){
          .clp{padding:16px 12px 70px;}
          .clp-h1{font-size:25px;}
          .clp-acts{flex-direction:column;align-items:stretch;}
          .clp-go,.clp-sh{justify-content:center;}
          .clp-c{gap:10px;padding:11px 12px 11px 15px;}
          .clp-ic{display:none;}
        }
      ` }} />

      <div className={`clp-hd${marquee ? ' marq' : ''}${complete ? ' done' : ''}`}>
        <div className="clp-e">{marquee ? 'The marquee circuit' : `${n} games · one run`}</div>
        <h1 className="clp-h1">{marquee ? name : `The ${name} Circuit`}</h1>
        <p className="clp-sub">{share.invite}</p>

        <div className="clp-acts">
          {/* A RUNNABLE circuit leads with the continuous board, because that is
              what the circuit is for: one sitting, no hand-offs. Playing the
              games one at a time still works and is the second control, since a
              player part way through a run should be able to pick up a single
              game without starting the whole thing again. */}
          {complete ? (
            <a className="clp-go" href={runSummaryHref(marquee ? MARQUEE_ID : id)}>
              See how the run went
              <ArrowRight size={15} strokeWidth={2.6} />
            </a>
          ) : null}
          {runnable ? (
            <a className={complete ? 'clp-sh' : 'clp-go'} href={runHref(id)}>
              {complete ? 'Run it again' : done ? 'Carry on with the run' : `Play all ${n} as one quiz`}
              <ArrowRight size={15} strokeWidth={2.6} />
            </a>
          ) : null}
          {nextGame ? (
            <a className={runnable || complete ? 'clp-sh' : 'clp-go'} href={circuitHref(nextGame.key, marquee ? MARQUEE_ID : id)}>
              {runnable
                ? `Or just ${nextGame.name}`
                : (complete ? 'Play it again' : done ? `Continue with ${nextGame.name}` : `Start the run with ${nextGame.name}`)}
              <ArrowRight size={15} strokeWidth={2.6} />
            </a>
          ) : null}
          <button type="button" className="clp-sh" onClick={doShare}>
            {copied ? <Check size={15} strokeWidth={2.6} /> : <Share2 size={15} strokeWidth={2.6} />}
            {copied ? 'Copied' : 'Share this circuit'}
          </button>
        </div>

        <div className="clp-meta">
          <div><b>{n}</b><i>games</i></div>
          {byCorrect
            ? (maxTotal ? <div><b>{maxTotal}</b><i>questions on offer</i></div> : null)
            : <div><b>{n * 15}</b><i>points on offer</i></div>}
          <div><b>{done}/{n}</b><i>played today</i></div>
          {complete && points !== null
            ? <div><b>{points}</b><i>{byCorrect
                ? (maxTotal ? `of ${maxTotal} right` : 'questions right')
                : `of ${maxTotal} points`}</i></div>
            : null}
          {complete && rank ? <div><b>{`#${rank}`}</b><i>on the circuit board</i></div> : null}
          {field ? <div><b>{field}</b><i>on it today</i></div> : null}
        </div>
      </div>

      <div className="clp-sec">The run, in order</div>
      <div className="clp-cards">
        {games.map((g, i) => {
          const played = !!(perGame[g.key] && !perGame[g.key].abandoned);
          return (
            <a
              key={g.key}
              className={`clp-c${played ? ' played' : ''}`}
              style={{ '--cc': g.color }}
              href={circuitHref(g.key, marquee ? MARQUEE_ID : id)}
            >
              <span className="clp-num">{played ? '✓' : i + 1}</span>
              <span className="clp-ic"><GameGlyph gameKey={g.key} size={22} /></span>
              <span className="clp-ct">
                <span className="clp-cn">{g.name}</span>
                <span className="clp-cm">{g.subject || g.cat}</span>
              </span>
              <ArrowRight className="clp-arr" size={16} strokeWidth={2.4} />
            </a>
          );
        })}
      </div>
      <div className="clp-note">
        {ordered
          ? `The last two are always the last two. The rest are shuffled fresh every day, so the run has a different shape each morning. `
          : 'Shortest first, longest last. '}
        {byCorrect
          ? `The board is the plain count of questions you get right across all ${n}, and the shorter clock takes a tie. `
          : `Each game pays 15 points for a win down to 1 for finishing, and the circuit adds all ${n} up. `}
        A game played on its own still counts toward it, but you need all {n} in
        the same day to take a rank on the circuit board.
      </div>

      {trophy ? (
        <>
          <div className="clp-sec">What finishing it pays</div>
          <div className="clp-tro">
            <Trophy size={20} strokeWidth={2.3} style={{ flex: 'none', color: 'var(--gold)' }} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <b>{trophy.name}</b>
              <span className="clp-trosub">Finish every game in this circuit on the same day.</span>
            </span>
            <span className={`clp-tier ${trophy.tier}`}>{trophy.tier}</span>
          </div>
        </>
      ) : null}

      <div className="clp-note">
        {marquee
          ? 'A fresh five lands at midnight Eastern, one game from each of five different categories.'
          : `The same ${n} games every day, with new puzzles in each of them at midnight Eastern.`}
      </div>

      <a className="clp-all" href="/circuits">
        See all the circuits
        <ArrowRight size={15} strokeWidth={2.6} />
      </a>
    </div>
  );
}
