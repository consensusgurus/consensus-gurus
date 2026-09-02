'use client';

// THE BODY OF A PUZZLE CATEGORY PAGE (/sudoku, /crosswords, /word-games,
// /logic-puzzles, /number-puzzles, /trivia-games, /geography-games,
// /chess-puzzles). Copy and roster come from lib/puzzle-categories.js; the
// chrome is CircuitFrame, the same one-line cap, register switch and stage
// footer the circuit pages wear, so this reads as the same surface as the
// game a reader presses through to.
//
// A CLIENT COMPONENT ON PURPOSE. CircuitFrame's stylesheet is repaired on the
// client only when a client parent renders it (see the note in
// app/circuits/CircuitFrame.jsx); render it from a server page and the phone
// cap collapses. Nothing here fetches: everything on the page is evergreen and
// in the server HTML, which is the whole point of the page.
//
// NOTHING HERE MAY NAME AN ANSWER. These pages describe the games, never a
// day's board.

import { ArrowRight } from 'lucide-react';
import CircuitFrame from '../circuits/CircuitFrame';
import GameGlyph from '../GameGlyph';
import { categoryColor, categoryColorLight } from '@/lib/category-ramp';
import { circuitPageHref } from '@/lib/circuits';
import { useThemeQs } from '@/lib/stage-theme';
import { PUZZLE_CATEGORIES } from '@/lib/puzzle-categories';

const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

export default function CategoryLanding({ cat, games }) {
  const tq = useThemeQs();
  const withTq = (href) => (tq ? href + (href.includes('?') ? tq : `?${tq.slice(1)}`) : href);
  const first = games[0];
  const siblings = PUZZLE_CATEGORIES.filter((c) => c.slug !== cat.slug);

  return (
    <CircuitFrame cat={cat.cat} label={cat.label}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pcl">
        <section className="pcl-hero">
          <p className="pcl-eb">{cat.eyebrow}</p>
          <h1 className="pcl-h1">{cat.h1}</h1>
          <p className="pcl-lede">{cat.lede}</p>
          <div className="pcl-acts">
            {first ? <a className="pcl-go" href={withTq(first.href)}>Play today&apos;s {first.name} <ArrowRight size={15} strokeWidth={2.6} /></a> : null}
            {cat.circuit ? <a className="pcl-sh" href={withTq(circuitPageHref(cat.circuit))}>Run the {cat.label} circuit</a> : null}
          </div>
          <div className="pcl-figs">
            <div><b>{games.length}</b><i>{games.length === 1 ? 'game' : 'games'}</i></div>
            <div><b>1</b><i>new board a day, each</i></div>
            <div><b>0</b><i>signups needed</i></div>
          </div>
        </section>

        <section className="pcl-sec">
          <div className="pcl-head"><h2>Pick a puzzle</h2><b>{games.length}</b></div>
          <div className="pcl-cards">
            {games.map((g) => (
              <a key={g.key} className="pcl-c" href={withTq(g.href)}
                style={{ '--cc-dk': categoryColor(g.cat), '--cc-lt': categoryColorLight(g.cat) }}>
                <span className="pcl-ic"><GameGlyph gameKey={g.key} size={22} /></span>
                <span className="pcl-ct">
                  <span className="pcl-gen">{g.generic}</span>
                  <span className="pcl-cn">{g.name} <i>{g.tag}</i></span>
                  <span className="pcl-how">{g.how}</span>
                </span>
                <ArrowRight className="pcl-arr" size={16} strokeWidth={2.4} />
              </a>
            ))}
          </div>
        </section>

        <section className="pcl-two">
          <div className="pcl-prose">
            <h2>{cat.howTitle}</h2>
            {cat.how.map((p, i) => <p key={i}>{p}</p>)}
            <h3>{cat.startTitle}</h3>
            <p>{cat.start}</p>
          </div>
          <div>
            <h2>The week</h2>
            <table className="pcl-week">
              <tbody>
                {cat.week.map(([d, w]) => <tr key={d}><th scope="row">{d}</th><td>{w}</td></tr>)}
              </tbody>
            </table>
          </div>
        </section>

        <section className="pcl-faq">
          <h2>Questions</h2>
          {cat.faq.map(([q, a], i) => (
            <details key={q} open={i === 0}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>

        <nav className="pcl-more" aria-label="More puzzle categories">
          <span>More puzzles:</span>
          <a href={withTq('/')}>Today&apos;s puzzles</a>
          <a href={withTq('/daily')}>Archive</a>
          <a href={withTq('/circuits')}>Circuits</a>
          {siblings.map((c) => <a key={c.slug} href={withTq(`/${c.slug}`)}>{c.label}</a>)}
        </nav>
      </div>
    </CircuitFrame>
  );
}

// NOTE: a JS template literal, so no backticks and no apostrophes in comments.
const CSS = `
.pcl{display:flex;flex-direction:column;gap:34px;}
.pcl-hero{position:relative;padding-left:16px;}
.pcl-hero::before{content:'';position:absolute;left:0;top:3px;bottom:3px;width:4px;background:var(--stg-acc);border-radius:2px;}
.pcl-eb{margin:0;font-family:${MONO};font-size:9.5px;letter-spacing:.15em;text-transform:uppercase;color:var(--stg-mute);}
.pcl-h1{margin:7px 0 0;font-size:clamp(26px,4.2vw,38px);font-weight:800;letter-spacing:-0.025em;line-height:1.06;color:var(--stg-ink);text-wrap:balance;}
.pcl-lede{margin:12px 0 0;font-size:15.5px;font-weight:600;line-height:1.58;max-width:66ch;color:var(--stg-ink2);}
.pcl-acts{display:flex;gap:9px;margin-top:20px;flex-wrap:wrap;}
.pcl-go,.pcl-sh{display:inline-flex;align-items:center;gap:8px;border-radius:10px;padding:0 16px;height:42px;font-size:13.5px;font-weight:800;text-decoration:none;letter-spacing:-0.005em;}
.pcl-go{background:var(--stg-acc);color:var(--stg-onramp,#08222e);border:1.5px solid transparent;}
.pcl-go:hover{filter:brightness(1.07);}
.pcl-sh{background:none;color:var(--stg-ink);border:1.5px solid var(--stg-line2);}
.pcl-sh:hover{border-color:var(--stg-acc);color:var(--stg-acc);}
.pcl-go:focus-visible,.pcl-sh:focus-visible,.pcl-c:focus-visible,.pcl-more a:focus-visible{outline:2px solid var(--stg-acc);outline-offset:3px;}
.pcl-figs{display:flex;gap:26px;margin-top:20px;flex-wrap:wrap;}
.pcl-figs b{display:block;font-size:22px;font-weight:800;letter-spacing:-0.02em;line-height:1;color:var(--stg-ink);font-variant-numeric:tabular-nums;}
.pcl-figs i{font-style:normal;display:block;font-family:${MONO};font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--stg-mute);margin-top:5px;}
.pcl-sec{display:block;}
.pcl-head{display:flex;align-items:baseline;gap:11px;margin-bottom:11px;}
.pcl-head h2,.pcl-two h2,.pcl-faq h2{margin:0;font-size:13px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--stg-mute);}
.pcl-head b{font-family:${MONO};font-size:12px;font-weight:700;color:var(--stg-ink);}
.pcl-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px;}
.pcl-c{--cc:var(--cc-dk,var(--stg-ink2));position:relative;display:flex;align-items:flex-start;gap:12px;padding:13px 14px 13px 18px;background:var(--stg-surf);border:1px solid var(--stg-line);border-radius:10px;text-decoration:none;overflow:hidden;}
[data-stage-theme='light'] .pcl-c{--cc:var(--cc-lt,var(--stg-ink2));}
.pcl-c::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--cc);}
.pcl-c:hover{border-color:var(--cc);}
.pcl-ic{flex:none;display:flex;align-items:center;justify-content:center;color:var(--cc);margin-top:2px;}
.pcl-ct{min-width:0;flex:1;display:flex;flex-direction:column;gap:3px;}
.pcl-gen{font-family:${MONO};font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--cc);font-weight:700;}
.pcl-cn{font-size:16px;font-weight:800;letter-spacing:-0.015em;color:var(--stg-ink);}
.pcl-cn i{font-style:normal;font-weight:600;font-size:13px;color:var(--stg-mute);margin-left:6px;}
.pcl-how{font-size:12.5px;font-weight:600;line-height:1.5;color:var(--stg-mute);}
.pcl-arr{flex:none;color:var(--stg-mute);margin-top:4px;}
.pcl-two{display:grid;grid-template-columns:1.2fr .8fr;gap:34px;align-items:start;}
.pcl-prose{max-width:66ch;}
.pcl-prose p,.pcl-faq p{margin:8px 0 0;font-size:14.5px;line-height:1.62;color:var(--stg-ink2);font-weight:500;}
.pcl-prose h3{margin:18px 0 0;font-size:15px;font-weight:800;color:var(--stg-ink);}
.pcl-week{width:100%;border-collapse:collapse;margin-top:8px;font-size:13.5px;}
.pcl-week th,.pcl-week td{text-align:left;padding:8px 8px 8px 0;border-top:1px solid var(--stg-line);vertical-align:top;font-weight:500;color:var(--stg-ink2);line-height:1.5;}
.pcl-week th{font-weight:800;color:var(--stg-ink);white-space:nowrap;padding-right:14px;}
.pcl-faq details{border-top:1px solid var(--stg-line);padding:11px 0;}
.pcl-faq details:first-of-type{margin-top:8px;}
.pcl-faq summary{font-weight:800;font-size:14.5px;cursor:pointer;list-style:none;color:var(--stg-ink);}
.pcl-faq summary::-webkit-details-marker{display:none;}
.pcl-faq p{max-width:66ch;}
.pcl-more{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:13px;font-weight:600;color:var(--stg-mute);padding-top:18px;border-top:1px solid var(--stg-line);}
.pcl-more a{color:var(--stg-ink);font-weight:700;text-decoration:none;}
.pcl-more a:hover{color:var(--stg-acc);}
@media (max-width:720px){.pcl-two{grid-template-columns:1fr;}.pcl-cards{grid-template-columns:1fr;}}
`;
