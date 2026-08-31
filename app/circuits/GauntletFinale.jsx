'use client';

// THE BROADCAST — the run's ending, before the scorecard (owner, 2026-08-30).
//
// A run of 180 questions used to end on a card that faded in. This is the ten
// seconds before it: every bank paints the whole screen in its own colour while
// its count runs, the ladder fills its block along the bottom and the climb
// column grows up the side, then the paint drops out, the two edges repaint
// themselves in the ramp at once, and the position falls to the player's slot.
//
// IT IS A CURTAIN, NOT A REPLACEMENT. It plays once, over the finished run, and
// unmounts onto the `rn-done` card underneath, which still carries the ladder,
// the figures, the board, the share button and Claim your spot. Nothing that
// already works moves, and it posts nothing: every result row was filed by
// finishSection long before this mounts.
//
// IT INVENTS NOTHING. Every figure is one the finish already holds: the counts
// and the clock from the run's own state, the average off useGauntletField's
// survival curves, the leader and the rank off the board the finish already
// fetches. Where a figure is missing (a small field, a guest with no
// provisional rank) its line is simply not drawn — the sequence never fills a
// gap with a guess, and it never scrolls a field of invented names past.
//
// FOUR RULES IT MUST KEEP:
//   1. Any tap, any key, skips to the end. It is on the way to the scorecard,
//      never in front of it.
//   2. prefers-reduced-motion gets no curtain at all: the card, immediately.
//   3. It plays ONCE per run. A player who comes back to a finished run, or who
//      finished the seven games on their own pages, gets the card directly.
//   4. It never congratulates. A player who missed on question one is watching
//      a row of low numbers, so the copy states them and says nothing else.
//
// THE PAINT GOES ON THE ROOT ELEMENT of the overlay. A full-bleed child of the
// stage did not render its own background when this was prototyped, and the
// colour is the whole idea, so it sits on the fixed element that IS the screen.
//
// The graphics are CSS transitions rather than per-frame React state: each
// ladder block is one masked fill whose width animates, and each column segment
// is a height. Only the numbers tick per frame, inside their own components, so
// a step costs one render of ten nodes rather than sixty renders of two hundred.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { rampFor } from '@/lib/circuits';

const PAINT_MS = 980;      // one bank owns the screen for this long
const COUNT_MS = 560;      // its number, its ladder block and its segment
const REPAINT_MS = 1250;   // the colours come back, the total lands
const CLIMB_MS = 3400;     // the position falls to the player's slot
const HOLD_MS = 1500;      // the finished frame, before the card

// A dark ink for a ramp colour. Every colour in LADDER_RAMP is a high-lightness
// pastel, so a flat scale toward black is legible on all eight without a table
// of hand-picked inks that would have to grow with the roster.
function inkFor(hex) {
  const h = String(hex || '').replace('#', '');
  if (h.length !== 6) return '#0b0f1a';
  const n = parseInt(h, 16);
  const r = Math.round(((n >> 16) & 255) * 0.17);
  const g = Math.round(((n >> 8) & 255) * 0.17);
  const b = Math.round((n & 255) * 0.17);
  return `rgb(${r},${g},${b})`;
}

const ease = (t) => 1 - Math.pow(1 - t, 3);

// A number that counts. It owns its own frame loop so a tick re-renders this
// component and nothing else.
function Count({ to, ms = COUNT_MS, from = 0, resetKey, fmt }) {
  const [v, setV] = useState(from);
  const cur = useRef(from);
  useEffect(() => {
    cur.current = from;
    setV(from);
    const a = from;
    const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    let raf = 0;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / Math.max(1, ms));
      cur.current = a + (to - a) * ease(p);
      setV(cur.current);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, ms, resetKey]);
  const n = Math.round(v);
  return <>{fmt ? fmt(n) : n}</>;
}

export default function GauntletFinale({
  sections = [],
  results = [],
  score = 0,
  total = 0,
  avgTotal = null,
  leaderScore = null,
  rank = null,
  fieldSize = null,
  rows = [],
  meKey = null,
  guest = false,
  onDone,
}) {
  const N = sections.length;
  // -1 waiting a beat, 0..N-1 a bank, N the repaint and the total, N+1 the board.
  // NOTHING IS DRAWN AT -1. The middle's non-painting branch is the TOTAL, so
  // rendering it before the first bank flashed the run's final score for a
  // quarter of a second and gave away the ending the sequence exists to build.
  const [step, setStep] = useState(-1);
  const doneRef = useRef(false);

  const banks = useMemo(() => sections.map((s, i) => {
    const res = results[i] || null;
    const asked = (s.questions && s.questions.length) || (res && res.total) || 0;
    const got = res && Number.isFinite(res.score) ? res.score : 0;
    const colour = rampFor(Number.isFinite(s.slot) ? s.slot : i);
    return { key: s.key, name: s.name || s.key, subject: s.subject || '', asked, got, colour, ink: inkFor(colour) };
  }), [sections, results]);

  const running = useMemo(() => {
    const out = [];
    let n = 0;
    banks.forEach((b) => { n += b.got; out.push(n); });
    return out;
  }, [banks]);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (typeof onDone === 'function') onDone();
  };

  // The whole schedule, laid out once. Every timer is cleared on unmount, so a
  // skip mid-sequence cannot fire a later beat onto a card that is already up.
  useEffect(() => {
    const reduced = typeof window !== 'undefined' && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !N) { finish(); return undefined; }
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    banks.forEach((b, i) => at(260 + i * PAINT_MS, () => setStep(i)));
    const end = 260 + N * PAINT_MS;
    at(end, () => setStep(N));
    at(end + REPAINT_MS, () => setStep(N + 1));
    at(end + REPAINT_MS + CLIMB_MS + HOLD_MS, finish);
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [N]);

  // Any tap, any key.
  useEffect(() => {
    const go = () => finish();
    window.addEventListener('keydown', go);
    return () => window.removeEventListener('keydown', go);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const painting = step >= 0 && step < N;
  const cur = painting ? banks[step] : null;
  const restored = step >= N;
  const ground = painting ? cur.colour : '#0b0f1a';
  const ink = painting ? cur.ink : '#f2f6ff';

  const avgPct = avgTotal != null && total > 0 ? Math.min(100, (avgTotal / total) * 100) : null;
  const leadPct = leaderScore != null && total > 0 ? Math.min(100, (leaderScore / total) * 100) : null;
  const passedAvg = avgTotal != null && (painting ? running[step] : score) >= avgTotal;

  const top = Array.isArray(rows) ? rows.slice(0, 5) : [];
  const meIn = !!(meKey && top.some((x) => x.userKey === meKey));
  const meRow = meKey ? (rows || []).find((x) => x.userKey === meKey) : null;

  return (
    <div
      className={`gfin${restored ? ' restored' : ''}`}
      style={{ background: ground, color: ink }}
      onClick={finish}
      role="button"
      tabIndex={0}
      aria-label="Skip to your scorecard"
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="gfin-run">
        {step < 0 ? null : restored
          ? <><Count to={score} ms={800} from={0} resetKey="tot" /> of {total} right</>
          : <>running · <Count to={running[step]} ms={COUNT_MS} from={step > 0 ? running[step - 1] : 0} resetKey={step} /></>}
      </div>

      {/* THE MIDDLE. One bank at a time while the paint is up, then the total,
          then out of the way so the board owns the screen. */}
      <div className={`gfin-mid${step === N + 1 ? ' gone' : ''}${restored ? ' up' : ''}`}>
        {step < 0 ? null : painting ? (
          <>
            {cur.subject ? <div className="gfin-sub">{cur.subject}</div> : null}
            <div className="gfin-nm">{cur.name}</div>
            <div className="gfin-n"><Count to={cur.got} ms={COUNT_MS} from={0} resetKey={step} /></div>
            <div className="gfin-of">{cur.got === cur.asked ? 'cleared' : `of ${cur.asked} before the miss`}</div>
          </>
        ) : (
          <>
            <div className="gfin-sub">questions right</div>
            <div className="gfin-n"><Count to={score} ms={800} from={0} resetKey="total" /></div>
            <div className="gfin-of">of {total} asked</div>
          </>
        )}
      </div>

      {/* THE LADDER, along the bottom. One masked fill per bank rather than a
          rung per question: the mask draws the rungs and the width animates. */}
      <div className="gfin-lad">
        {banks.map((b, i) => {
          const pct = i < step || restored ? (b.asked ? (b.got / b.asked) * 100 : 0)
            : i === step ? (b.asked ? (b.got / b.asked) * 100 : 0) : 0;
          const mask = `repeating-linear-gradient(90deg,#000 0 calc(100% / ${Math.max(1, b.asked)} * 0.78),transparent calc(100% / ${Math.max(1, b.asked)} * 0.78) calc(100% / ${Math.max(1, b.asked)}))`;
          return (
            <div className="gfin-blk" key={b.key} style={{ flex: `${Math.max(1, b.asked)} 1 0` }}>
              <div className="gfin-trk" style={{ WebkitMaskImage: mask, maskImage: mask }} />
              <div
                className={`gfin-fill${i === step ? ' cur' : ''}`}
                style={{
                  clipPath: `inset(0 ${100 - pct}% 0 0)`,
                  WebkitClipPath: `inset(0 ${100 - pct}% 0 0)`,
                  WebkitMaskImage: mask,
                  maskImage: mask,
                  background: restored ? b.colour : 'currentColor',
                  transitionDuration: `${COUNT_MS}ms`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* THE CLIMB, up the side, against the two lines that were drawn before
          the player started. */}
      <div className="gfin-side">
        <div className="gfin-track" />
        <div className="gfin-col">
          {banks.map((b, i) => (
            <div
              key={b.key}
              className="gfin-seg"
              style={{
                height: `${(i <= step || restored) && total > 0 ? (b.got / total) * 100 : 0}%`,
                background: restored ? b.colour : 'currentColor',
                transitionDuration: `${COUNT_MS + 60}ms`,
              }}
            />
          ))}
        </div>
        {avgPct != null ? (
          <div className={`gfin-mark${passedAvg ? ' hit' : ''}`} style={{ bottom: `${avgPct}%` }}>
            <span className="tx">average {Math.round(avgTotal)}</span><span className="ln" />
          </div>
        ) : null}
        {leadPct != null ? (
          <div className={`gfin-mark lead${restored ? ' hit' : ''}`} style={{ bottom: `${leadPct}%` }}>
            <span className="tx">lead {leaderScore}</span><span className="ln" />
          </div>
        ) : null}
      </div>

      {/* THE BOARD. The position falls to the player's slot over the real top
          five. There is no field of names scrolling past, because the only way
          to draw one would be to invent the names. */}
      <div className={`gfin-board${step === N + 1 ? ' in' : ''}`}>
        {rank != null && fieldSize ? (
          <div className="gfin-pos">
            <span className="h">position</span>
            <span className="n">#<Count to={rank} ms={CLIMB_MS} from={fieldSize} resetKey="pos" /></span>
          </div>
        ) : null}
        {/* A GUEST'S POSITION IS PROVISIONAL, and the number alone does not say
            so (owner, 2026-08-31). The ladder pays registered names only, so a
            guest watching their slot land is watching a spot nobody is holding.
            The card underneath carries the form; this line is the only thing on
            the curtain that says the spot has to be claimed. It is drawn on the
            same condition as the number, because it is a note about that
            number and nothing else. */}
        {rank != null && fieldSize && guest ? (
          <div className="gfin-claim">(select a name to claim)</div>
        ) : null}
        <div className="gfin-rows">
          {top.map((row, i) => (
            <div key={row.userKey || i} className={`gfin-row${meKey && row.userKey === meKey ? ' me' : ''}`}>
              <span className="p">#{i + 1}</span>
              <span className="nm">{row.username || 'Guest'}</span>
              <span className="s">{Math.round(Number(row.total) * 10) / 10}</span>
            </div>
          ))}
          {!meIn && meRow ? (
            <div className="gfin-row me">
              <span className="p">{rank != null ? `#${rank}` : ''}</span>
              <span className="nm">{meRow.username || 'You'}</span>
              <span className="s">{Math.round(Number(meRow.total) * 10) / 10}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="gfin-skip">tap to skip</div>
    </div>
  );
}

const CSS = `
.gfin{position:fixed;inset:0;z-index:80;overflow:hidden;cursor:pointer;
  transition:background-color .42s ease,color .42s ease;
  font-family:Manrope,system-ui,-apple-system,'Segoe UI',sans-serif}
.gfin:focus{outline:none}
.gfin-run{position:absolute;left:30px;top:58px;font-size:12px;font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;opacity:.72}
.gfin-mid{position:absolute;left:0;right:0;top:50%;transform:translateY(-58%);
  display:flex;flex-direction:column;align-items:center;gap:1px;text-align:center;
  padding:0 132px 0 46px;
  transition:top .5s cubic-bezier(.2,.8,.25,1),transform .5s ease,opacity .4s ease}
.gfin-mid.up{top:15%;transform:none}
.gfin-mid.gone{opacity:0}
.gfin-sub{font-size:13px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;opacity:.62}
.gfin-nm{font-size:clamp(34px,6.5vw,72px);font-weight:800;letter-spacing:-.04em;line-height:.98}
.gfin-n{font-size:clamp(76px,15vw,164px);font-weight:800;letter-spacing:-.05em;line-height:.9;
  font-variant-numeric:tabular-nums;transition:font-size .5s ease}
.gfin-mid.up .gfin-n{font-size:clamp(44px,7vw,78px)}
.gfin-of{font-size:13px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;opacity:.62}

.gfin-lad{position:absolute;left:30px;right:126px;bottom:76px;height:42px;display:flex;gap:5px}
.gfin-blk{position:relative;height:100%}
.gfin-trk{position:absolute;inset:0;background:currentColor;opacity:.14}
.gfin-fill{position:absolute;inset:0;opacity:.55;clip-path:inset(0 100% 0 0);
  transition:clip-path 560ms cubic-bezier(.2,.75,.3,1),background-color .5s ease,opacity .3s ease}
.gfin-blk .gfin-fill.cur{opacity:1}
.gfin.restored .gfin-fill{opacity:1}

.gfin-side{position:absolute;right:34px;top:64px;bottom:76px;width:58px}
.gfin-track{position:absolute;inset:0;background:currentColor;opacity:.12;border-radius:8px}
.gfin-col{position:absolute;inset:0;display:flex;flex-direction:column-reverse;
  border-radius:8px;overflow:hidden}
.gfin-seg{width:100%;height:0;opacity:.6;
  transition:height 620ms cubic-bezier(.2,.75,.3,1),background-color .5s ease,opacity .5s ease}
.gfin.restored .gfin-seg{opacity:1}
.gfin-mark{position:absolute;right:66px;display:flex;align-items:center;gap:9px;white-space:nowrap;
  transform:translateY(50%);font-size:11px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;opacity:.45;transition:opacity .3s ease}
.gfin-mark .ln{width:30px;height:1px;background:currentColor}
.gfin-mark.hit{opacity:1}

.gfin-board{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:14px;padding:0 132px 96px 46px;opacity:0;
  transition:opacity .45s ease;pointer-events:none}
.gfin-board.in{opacity:1}
.gfin-pos{display:flex;align-items:baseline;gap:12px}
.gfin-pos .h{font-size:clamp(14px,2.4vw,20px);font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;opacity:.5}
.gfin-pos .n{font-size:clamp(64px,13vw,120px);font-weight:800;letter-spacing:-.05em;
  line-height:.9;font-variant-numeric:tabular-nums}
.gfin-claim{margin-top:-8px;font-size:clamp(12.5px,1.9vw,16px);font-weight:700;
  letter-spacing:.03em;opacity:.62;text-align:center}
.gfin-rows{width:min(520px,100%);display:flex;flex-direction:column;gap:2px}
.gfin-row{display:grid;grid-template-columns:44px 1fr auto;gap:12px;align-items:center;
  padding:7px 14px;border-radius:8px;font-size:14px;font-weight:600;
  font-variant-numeric:tabular-nums;background:rgba(255,255,255,.04)}
.gfin-row .p{opacity:.5}
.gfin-row .nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gfin-row.me{background:#7dd3fc;color:#08222e}
.gfin-skip{position:absolute;left:0;right:0;bottom:26px;text-align:center;font-size:11px;
  font-weight:600;letter-spacing:.18em;text-transform:uppercase;opacity:.34}

@media (max-width: 760px){
  .gfin-run{left:16px;top:42px;font-size:10px;letter-spacing:.1em}
  .gfin-mid{padding:0 70px 0 18px}
  .gfin-sub{font-size:10px;letter-spacing:.2em}
  .gfin-nm{font-size:38px}
  .gfin-n{font-size:84px}
  .gfin-mid.up .gfin-n{font-size:52px}
  .gfin-of{font-size:10.5px}
  .gfin-lad{left:16px;right:62px;bottom:56px;height:28px;gap:3px}
  .gfin-side{right:16px;top:44px;bottom:56px;width:32px}
  .gfin-mark{right:40px;gap:5px;font-size:9px;letter-spacing:.06em}
  .gfin-mark .ln{width:12px}
  .gfin-board{padding:0 62px 74px 18px;gap:10px}
  .gfin-pos .n{font-size:62px}
  .gfin-claim{margin-top:-4px;font-size:12px}
  .gfin-rows{width:100%}
  .gfin-row{grid-template-columns:34px 1fr auto;gap:8px;padding:6px 10px;font-size:12.5px}
  .gfin-skip{bottom:18px;font-size:10px}
}

@media (prefers-reduced-motion: reduce){
  .gfin,.gfin-mid,.gfin-fill,.gfin-seg,.gfin-board,.gfin-mark,.gfin-n{transition:none}
}
`;
