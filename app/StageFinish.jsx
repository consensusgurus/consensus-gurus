'use client';

// THE ENDING IS A CURTAIN — the stage pattern's last rule, and the last piece
// of it to get built. Until now every stage game borrowed the Loft's finish
// card: a white panel tuned for a navy page, opening at the end of a near-black
// one. It worked, but it was the one moment on the stage that belonged to a
// different design.
//
// A curtain is not a card. The whole point of the ending is that the page
// CHANGES STATE, and the stage has spent the entire game refusing to spend its
// colour on anything but meaning — so the ending is where the accent finally
// floods. One band, edge to edge, carrying the verdict. That is the moment;
// everything after it is quiet again.
//
// SAME DATA, SAME CONTRACT. It takes LoftFinish's own props, so no game client
// changes and the two endings cannot disagree about a result. It also keeps
// LoftFinish's ordering rules rather than inventing new ones: the tone ranking
// below is that component's, and it encodes real decisions (a reveal leads,
// because showing a player what they missed is the one thing they want first;
// 'similar' comes OUT of the grid because a finisher was passing two exits
// before reaching the one that hands them forward).
import { useMemo } from 'react';

const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const SANS = "Manrope, ui-sans-serif, system-ui, -apple-system, sans-serif";

// LoftFinish's ranking, not a new one. A tone this table does not know falls to
// 5, and the gold Share declares no tone so it keeps rank 0, directly under the
// lead pair.
const RANK = { reveal: -3, board: -2, replay: -1, another: 3, similar: 4, main: 9 };
const rankOf = (o) => (RANK[o.tone] != null ? RANK[o.tone] : (o.kind === 'gold' ? 0 : 5));

export default function StageFinish({
  title, detail, iq = null, board = null, day = null, streak = null,
  missLabel = null, gameRank = null, outcome = null, options = [], name = null,
}) {
  const opts = useMemo(() => [...options.filter(Boolean)].sort((a, b) => rankOf(a) - rankOf(b)), [options]);
  const forward = opts.find((o) => o.tone === 'similar') || null;
  const rest = opts.filter((o) => o !== forward);

  const rows = board && Array.isArray(board.rows) ? board.rows.slice(0, 5) : [];
  const myRank = board && board.myRank != null ? board.myRank : null;
  const field = board && board.field != null ? board.field : null;

  // 'similar' arrives as `${name} · ${tag}`, which is the shape all 65 clients
  // already pass, so the heading and the line under it come off one prop.
  const fwdName = forward && forward.sub && forward.sub.includes('·')
    ? forward.sub.split('·')[0].trim() : (forward ? forward.label : '');
  const fwdTag = forward && forward.sub && forward.sub.includes('·')
    ? forward.sub.split('·').slice(1).join('·').trim() : '';

  return (
    <div className={'stf' + (outcome ? ' stf-' + outcome : '')}>
      <style>{CSS}</style>

      {/* THE CURTAIN. The one place on the stage where the accent covers
          something rather than marking it. Edge to edge, because a band with a
          margin reads as another card. */}
      <div className="stf-curtain">
        <div className="stf-cin">
          <div className="stf-verdict">{title}</div>
          {detail ? <div className="stf-detail">{detail}</div> : null}
        </div>
      </div>

      <div className="stf-wrap">
        {/* FIGURES, NEVER PROSE — and only the ones that are real. */}
        <div className="stf-figs">
          {iq && iq.gained != null ? (
            <div><b className="stf-up">+{Number(iq.gained).toLocaleString()}</b><i>IQ earned</i></div>
          ) : null}
          {day && day.ready && day.dayRank != null ? (
            <div><b>#{Number(day.dayRank).toLocaleString()}{day.dayField != null ? <i>/{Number(day.dayField).toLocaleString()}</i> : null}</b><i>today&rsquo;s board</i></div>
          ) : null}
          {gameRank && gameRank.value != null ? (
            <div><b>{gameRank.value}</b><i>{gameRank.label || 'all time'}</i></div>
          ) : null}
          {streak ? <div><b>{streak}</b><i>day streak</i></div> : null}
        </div>

        {/* THE HAND-FORWARD, first, for LoftFinish's own reason: it used to sit
            below the verdict, the IQ bar, four tiles and the whole board, so a
            finisher passed two exits before reaching the one that carries on. */}
        {forward ? (
          <a className="stf-fwd" href={forward.href} onClick={forward.onClick}>
            <div>
              <div className="stf-eb">Up next</div>
              <div className="stf-fwdn">{fwdName}</div>
              {fwdTag ? <div className="stf-fwdt">{fwdTag}</div> : null}
            </div>
            <span className="stf-go">Play</span>
          </a>
        ) : null}

        {rows.length ? (
          <section>
            <div className="stf-eb">Today&rsquo;s board{myRank != null ? <em> &middot; you are #{myRank}{field ? ` of ${field}` : ''}</em> : null}</div>
            <table className="stf-tbl">
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.username || i} className={r.me ? 'me' : undefined}>
                    <td className="stf-pos">{r.rank != null ? `#${r.rank}` : `#${i + 1}`}</td>
                    <td className="stf-who">{r.username || 'Guest'}</td>
                    <td className="stf-sc">{r.score != null ? r.score : '—'}</td>
                    <td className="stf-pt">{r.points != null ? r.points : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        <div className="stf-opts">
          {rest.map((o, i) => (
            o.href
              ? <a key={i} className={'stf-o' + (o.kind === 'gold' ? ' gold' : '')} href={o.href} onClick={o.onClick}>
                  <b>{o.label}</b>{o.sub ? <i>{o.sub}</i> : null}
                </a>
              : <button key={i} type="button" className={'stf-o' + (o.kind === 'gold' ? ' gold' : '')} onClick={o.onClick}>
                  <b>{o.label}</b>{o.sub ? <i>{o.sub}</i> : null}
                </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const CSS = `
.stf{font-family:${SANS};color:var(--stg-ink);}
.stf *{box-sizing:border-box;}

/* ── the curtain ───────────────────────────────────────────────────────── */
.stf-curtain{background:var(--stg-acc);color:var(--stg-onramp,#08222e);
  margin:0 calc(50% - 50vw);padding:30px calc(50vw - 50% + 4px) 26px;}
.stf-cin{max-width:720px;margin:0 auto;}
.stf-verdict{font-size:36px;font-weight:800;letter-spacing:-0.03em;line-height:1.05;
  text-wrap:balance;}
.stf-detail{margin-top:7px;font-size:14px;font-weight:700;opacity:.78;}

.stf-wrap{max-width:720px;margin:0 auto;padding:22px 4px 8px;
  display:flex;flex-direction:column;gap:20px;}
.stf-eb{font-family:${MONO};font-size:9.5px;letter-spacing:.15em;text-transform:uppercase;
  color:var(--stg-mute);margin-bottom:8px;}
.stf-eb em{font-style:normal;color:var(--stg-ink2);}

.stf-figs{display:flex;flex-wrap:wrap;gap:12px 26px;}
.stf-figs>div{min-width:0;}
.stf-figs b{display:block;font-size:22px;font-weight:800;line-height:1.1;
  font-variant-numeric:tabular-nums;letter-spacing:-0.01em;}
.stf-figs b i{font-style:normal;font-weight:600;font-size:13px;color:var(--stg-mute);}
.stf-figs>div>i{font-style:normal;font-family:${MONO};font-size:9px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--stg-mute);}
.stf-up{color:var(--stg-up);}

/* ── the hand-forward ──────────────────────────────────────────────────── */
.stf-fwd{display:flex;align-items:center;gap:16px;text-decoration:none;
  background:var(--stg-surf);border:1px solid var(--stg-line);
  border-left:4px solid var(--stg-acc);border-radius:10px;padding:14px 16px;color:var(--stg-ink);}
.stf-fwd:hover{border-color:var(--stg-line2);border-left-color:var(--stg-acc);}
.stf-fwdn{font-size:20px;font-weight:800;letter-spacing:-0.01em;line-height:1.15;}
.stf-fwdt{font-size:12.5px;font-weight:600;color:var(--stg-mute);margin-top:2px;}
.stf-go{margin-left:auto;flex:none;font-size:13px;font-weight:800;
  background:var(--stg-acc);color:var(--stg-onramp,#08222e);
  border-radius:8px;padding:8px 16px;}

/* ── the board ─────────────────────────────────────────────────────────── */
.stf-tbl{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums;}
.stf-tbl td{padding:7px 6px;border-bottom:1px solid var(--stg-line);font-size:13.5px;}
.stf-tbl tr:last-child td{border-bottom:0;}
.stf-tbl tr.me td{background:var(--stg-chip);font-weight:800;}
.stf-pos{width:44px;font-family:${MONO};font-size:12px;color:var(--stg-mute);}
.stf-who{font-weight:700;}
.stf-sc,.stf-pt{width:56px;text-align:right;color:var(--stg-ink2);}
.stf-pt{font-weight:800;color:var(--stg-ink);}

/* ── the options ───────────────────────────────────────────────────────── */
.stf-opts{display:grid;gap:7px;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));}
.stf-o{display:block;text-align:left;text-decoration:none;cursor:pointer;font:inherit;
  background:var(--stg-surf);border:1px solid var(--stg-line);border-radius:9px;
  padding:11px 13px;color:var(--stg-ink);}
.stf-o:hover{border-color:var(--stg-line2);}
.stf-o b{display:block;font-size:14px;font-weight:800;}
.stf-o i{display:block;font-style:normal;font-size:11.5px;font-weight:600;
  color:var(--stg-mute);margin-top:2px;}
/* The gold Share keeps its own weight: it is the one option that asks for
   something rather than offering something. */
.stf-o.gold{background:var(--stg-acc);color:var(--stg-onramp,#08222e);border-color:transparent;}
.stf-o.gold i{color:inherit;opacity:.78;}
.stf-o:focus-visible,.stf-fwd:focus-visible{outline:2px solid var(--stg-acc);outline-offset:2px;}

@media (max-width:640px){
  .stf-curtain{padding:22px 18px 20px;}
  .stf-verdict{font-size:27px;}
  .stf-wrap{padding:18px 2px 8px;gap:17px;}
  .stf-figs{gap:10px 18px;}
  .stf-figs b{font-size:19px;}
  .stf-opts{grid-template-columns:1fr 1fr;}
}
`;
