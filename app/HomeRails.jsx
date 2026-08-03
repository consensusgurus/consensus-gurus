'use client';

// The homepage's two side rails, rebuilt 2026-08-03 (owner-approved mockup:
// mindloft-B4-scoreboard).
//
// It replaces the three stacked hero-name leaderboard cards on the left and the
// Last Played / Quick play / Category Mastery stack on the right with a single
// consistent panel system: a tinted header band, a top-5 table, and a footer
// carrying the expander and the real "Full leaderboard" link.
//
// It is deliberately a PRESENTATION component. Every figure it renders is
// already fetched by QuizHomeClient and handed down as a prop, so no fetch,
// no identity read, and no API surface moved. The one exception is the "Your
// results" tab, which reuses the memoized fetchDayStatus() promise that
// useDayStats already fires for the header, so it costs no extra request.
//
// Left rail, top to bottom:
//   1. Top community member  (refData)          - fixed
//   2. Today's leaders       (dailyBoard/xpToday) - auto-flips every 7s
//   3. Top player            (xpAll/xp30)         - auto-flips every 7s
// Right rail:
//   1. The loft: Live feed | Your results tabs, over plays/time today
//   2. Featured: daily challenge, quiz of the day, duel
//
// The flip replaces the old dot-only affordance with a named pill plus dots, so
// a reader can always tell WHICH board they are looking at; hovering the pill
// pauses the rotation and the dots are clickable.

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { T } from '@/lib/theme';
import { DAILY_GAME_MAP } from '@/lib/daily-games';
import { fetchDayStatus } from './useDayStats';

const MEDAL = [T.gold, T.silver, T.bronze];

function num(n) { return (n || 0).toLocaleString(); }

// Two faint states only (owner, 2026-08-03): a solid green/gold/red chip column
// read as a traffic light and pulled the eye off the feed itself.
function scoreTone(pct) {
  return pct >= 70
    ? { background: '#f0faf5', color: T.successDeep, border: '1px solid #d8eee4' }
    : { background: '#fdf1f0', color: '#a8362c', border: '1px solid #f2dcd9' };
}

function ringTone(pct) { return pct >= 70 ? T.successDeep : '#c0392b'; }

// m:ss, or h:mm:ss on the rare long one. Seconds in, never a bare float.
function fmtTime(sec) {
  const t = Math.max(0, Math.round(Number(sec) || 0));
  if (!t) return null;
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  const two = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${two(m)}:${two(s)}` : `${m}:${two(s)}`;
}

function Rows({ rows, fmt, open, hrefFor }) {
  return (
    <table className="hr-tbl"><tbody>
      {rows.map((r, i) => (
        <tr key={`${r.name}-${i}`} className={i === 0 ? 'lead1' : undefined}>
          <td className="rk" style={i < 3 ? { color: MEDAL[i] } : undefined}>{i + 1}</td>
          <td><Link href={hrefFor(r.name)} className="hr-nm" style={{ fontWeight: i === 0 ? 800 : 600 }}>{r.name}</Link></td>
          <td className="r hr-v">{fmt(r.value)}</td>
        </tr>
      ))}
      {!rows.length ? <tr><td colSpan={3} className="hr-none">Nothing here yet today.</td></tr> : null}
    </tbody></table>
  );
}

// A panel whose body flips between two faces on a timer. `faces` is an array of
// { label, sub, rows, href }, and the pill names the face that is showing.
function FlipPanel({ icon, title, faces, expandKey, open, onToggle }) {
  const [ix, setIx] = useState(0);
  const holdRef = useRef(false);
  useEffect(() => {
    if (faces.length < 2) return undefined;
    const id = setInterval(() => { if (!holdRef.current) setIx((v) => (v + 1) % faces.length); }, 7000);
    return () => clearInterval(id);
  }, [faces.length]);
  const face = faces[Math.min(ix, faces.length - 1)] || faces[0];
  if (!face) return null;
  const shown = open ? face.rows : face.rows.slice(0, 5);
  return (
    <section className="hr-panel hr-flex">
      <div className="hr-ph">
        <span className="hr-pi">{icon}</span>
        <h2>{title}</h2>
        {faces.length > 1 ? (
          <span
            className="hr-flip"
            onMouseEnter={() => { holdRef.current = true; }}
            onMouseLeave={() => { holdRef.current = false; }}
          >
            <span className="hr-lbl">{face.label}</span>
            <span className="hr-dots">
              {faces.map((f, i) => (
                <i
                  key={f.label}
                  className={i === ix ? 'on' : undefined}
                  role="button"
                  tabIndex={0}
                  aria-label={f.label}
                  onClick={() => setIx(i)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIx(i); }}
                />
              ))}
            </span>
          </span>
        ) : null}
      </div>
      <div className="hr-sub">{face.sub}</div>
      <div className="hr-scroll hr-flex">
        <Rows rows={shown} fmt={face.fmt} hrefFor={face.hrefFor} />
      </div>
      <div className="hr-foot">
        {face.rows.length > 5 ? (
          <button type="button" className="hr-exp" onClick={onToggle}>
            {open ? 'Show top 5' : `Show all ${face.rows.length}`}
          </button>
        ) : <span className="hr-exp" style={{ opacity: 0 }} aria-hidden="true">·</span>}
        <Link href={face.href} className="hr-link">Full leaderboard &rarr;</Link>
      </div>
    </section>
  );
}

export default function HomeRails({
  side,
  refData,
  dailyBoard,
  xpToday = [],
  xp30 = [],
  xpAll = [],
  totals,
  lastPlayed = [],
  titleFor,
  catFor,
  hrefFor,
  onCredit,
  onAllLive,
  featured = [],
}) {
  const [open, setOpen] = useState({ com: false, tl: false, tp: false });
  const toggle = (k) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  // ── LEFT ──────────────────────────────────────────────────────────────────
  const community = useMemo(() => {
    const top = (refData && Array.isArray(refData.top)) ? refData.top : [];
    return top.map((r) => ({ name: r.username || 'Player', value: r.credits }));
  }, [refData]);

  // The combined daily-games score (best-N total), NOT games played: "29/42"
  // read as a fraction of the slate and told you nothing about how well anyone
  // did (owner, 2026-08-03).
  const dailyRows = useMemo(() => {
    const ov = (dailyBoard && Array.isArray(dailyBoard.overall)) ? dailyBoard.overall : [];
    return ov.map((r) => ({ name: r.username || 'Player', value: r.total }));
  }, [dailyBoard]);

  // ── RIGHT ─────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState('feed');
  const [mine, setMine] = useState(null);
  useEffect(() => {
    if (side !== 'right') return undefined;
    let alive = true;
    fetchDayStatus().then((d) => { if (alive) setMine(d || {}); });
    return () => { alive = false; };
  }, [side]);

  // "Your results" has no dedicated endpoint yet, so it is built from the same
  // daily-status payload the header already pulls: today's roster, in play
  // order, showing which are finished. When a per-player score feed lands this
  // is the one block to swap.
  // Only games actually FINISHED today, each with its score, board rank and
  // points, straight off the daily-combined payload's me.perGame. An unplayed
  // game has nothing to report, so it is simply absent rather than listed as a
  // row of dashes (owner, 2026-08-03).
  const myRows = useMemo(() => {
    const per = (dailyBoard && dailyBoard.me && dailyBoard.me.perGame) || null;
    if (!per) return [];
    return Object.keys(per)
      .filter((k) => per[k] && !per[k].abandoned)
      .map((k) => {
        const g = DAILY_GAME_MAP[k] || { name: k, cat: '' };
        const r = per[k];
        return {
          key: k, name: g.name, cat: g.cat, img: g.img,
          score: r.score, total: r.total, rank: r.rank, field: r.field,
          points: r.points, completion: r.completion, time: r.timeElapsed,
        };
      })
      .sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [dailyBoard]);

  const playsToday = (totals && totals.today) || 0;
  const timeToday = (() => {
    const x = Math.round((totals && totals.todayTime) || 0);
    const h = Math.floor(x / 3600); const m = Math.round((x % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  })();

  const CSS = (
    <style>{`
      .hr-panel{background:var(--white);border:1px solid var(--border);border-radius:12px;overflow:hidden;display:flex;flex-direction:column;min-height:0;}
      .hr-flex{flex:1 1 auto;min-height:0;}
      .hr-ph{display:flex;align-items:center;gap:9px;padding:9px 13px;background:var(--accent-soft);border-bottom:2px solid var(--accent);flex:none;}
      .hr-ph h2{font-size:11.5px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--accent);margin:0;}
      .hr-pi{width:24px;height:24px;border-radius:7px;background:var(--white);border:1px solid var(--accent-border);color:var(--blue-deep);display:flex;align-items:center;justify-content:center;flex:none;}
      .hr-flip{margin-left:auto;display:flex;align-items:center;gap:7px;}
      .hr-lbl{font-size:10px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--blue-deep);background:var(--white);border:1px solid var(--accent-border);padding:3px 9px;border-radius:999px;white-space:nowrap;}
      .hr-dots{display:flex;gap:4px;}
      .hr-dots i{width:6px;height:6px;border-radius:50%;background:#c3d1ea;cursor:pointer;display:block;}
      .hr-dots i.on{background:var(--blue);}
      .hr-sub{font-size:11px;color:var(--slate);padding:6px 13px 0;flex:none;}
      .hr-scroll{overflow-y:auto;scrollbar-width:thin;scrollbar-color:#d3d9e2 transparent;}
      .hr-scroll::-webkit-scrollbar{width:6px;}
      .hr-scroll::-webkit-scrollbar-track{background:transparent;}
      .hr-scroll::-webkit-scrollbar-thumb{background:#dfe4ec;border-radius:3px;}
      .hr-tbl{width:100%;border-collapse:collapse;}
      .hr-tbl td{padding:5px 13px;border-bottom:1px solid #f0f2f6;font-size:13px;}
      .hr-tbl tr:last-child td{border-bottom:none;}
      .hr-tbl tr:hover{background:var(--surface);}
      .hr-tbl td.r{text-align:right;}
      .hr-tbl td.rk{font-size:11px;font-weight:800;width:24px;color:#9aa2b1;font-variant-numeric:tabular-nums;}
      .hr-tbl tr.lead1 td{background:#fdf7e8;}
      .hr-nm{color:var(--ink);text-decoration:none;}
      .hr-nm:hover{text-decoration:underline;}
      .hr-v{font-weight:700;font-variant-numeric:tabular-nums;}
      .hr-none{font-size:12px;color:var(--muted);padding:8px 13px;}
      .hr-foot{display:flex;align-items:center;gap:10px;padding:7px 13px;border-top:1px solid var(--border);flex:none;}
      .hr-exp{border:0;background:none;padding:0;font:inherit;font-size:10.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--slate);cursor:pointer;white-space:nowrap;flex:none;}
      .hr-exp:hover{color:var(--blue-deep);}
      .hr-link{margin-left:auto;font-size:11px;font-weight:800;color:var(--blue-deep);text-decoration:none;white-space:nowrap;flex:none;}
      .hr-link:hover{text-decoration:underline;}
      .hr-tabs{display:flex;background:var(--accent-soft);border-bottom:2px solid var(--accent);flex:none;}
      .hr-tabs button{flex:1;border:0;border-radius:9px 9px 0 0;background:transparent;font:inherit;font-size:11.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#5a6b90;padding:11px 6px;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;}
      .hr-tabs button.on{color:var(--blue-deep);border-bottom-color:var(--blue);background:var(--white);}
      .hr-stats{display:flex;border-bottom:1px solid var(--border);background:var(--surface);flex:none;}
      .hr-stats > div{flex:1;padding:10px 13px;border-right:1px solid var(--border);}
      .hr-stats > div:last-child{border-right:none;}
      .hr-stats b{display:block;font-size:19px;font-weight:800;font-variant-numeric:tabular-nums;line-height:1.1;}
      .hr-stats span{display:block;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--slate);font-weight:800;}
      .hr-res{display:flex;align-items:center;gap:10px;padding:7px 13px;border-bottom:1px solid #f0f2f6;text-decoration:none;color:var(--ink);}
      .hr-res:last-child{border-bottom:none;}
      .hr-res:hover{background:var(--surface);}
      .hr-ic{height:30px;width:auto;background:var(--surface-alt);border-radius:7px;padding:3px;flex:none;}
      .hr-mid{flex:1;min-width:0;}
      .hr-t{display:flex;align-items:baseline;gap:7px;min-width:0;font-size:12.5px;font-weight:800;}
      .hr-ttl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}
      .hr-cat{flex:none;font-size:9.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;padding:2px 6px;border-radius:4px;}
      .hr-s{display:block;font-size:11px;color:var(--slate);}
      .hr-ring{width:32px;height:32px;flex:none;border-radius:999px;display:flex;align-items:center;justify-content:center;}
      .hr-ring .in{width:25px;height:25px;border-radius:999px;background:var(--white);display:flex;align-items:center;justify-content:center;font-size:8.5px;font-weight:800;color:var(--ink);font-variant-numeric:tabular-nums;}
      .hr-res-sc{font-weight:800;color:var(--ink);font-variant-numeric:tabular-nums;}
      .hr-sc{font-family:var(--font-mono,ui-monospace,monospace);font-size:12.5px;font-weight:700;padding:4px 8px;border-radius:6px;flex:none;min-width:54px;text-align:center;font-variant-numeric:tabular-nums;}
      .hr-feat{flex:none;}
      .hr-frow{display:flex;align-items:center;gap:11px;padding:11px 13px;border-bottom:1px solid #f0f2f6;text-decoration:none;color:var(--ink);}
      .hr-frow:last-child{border-bottom:none;}
      .hr-frow:hover{background:var(--surface);}
      .hr-fic{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:9px;flex:none;}
      .hr-fm{flex:1;min-width:0;}
      .hr-ft{display:block;font-size:13px;font-weight:800;}
      .hr-fs{display:block;font-size:11px;color:var(--slate);}
      .hr-fa{margin-left:auto;color:#9aa2b1;font-size:18px;line-height:1;}
      /* The rails stack at natural height on a phone, but the activity list is
         unbounded, so it alone keeps a cap and scrolls inside it. */
      @media(max-width:1200px){.hr-flex{flex:none;}.hr-scroll{overflow:visible;}.hr-actbody{max-height:360px;overflow-y:auto;}}
      /* Phone: the rail panels run edge to edge like the slate, rather than
         sitting as tiles inside the page gutter (owner, 2026-08-03). */
      @media(max-width:900px){
        .hr-panel{margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);width:auto;max-width:none;border-left:none;border-right:none;border-radius:0;}
      }
    `}</style>
  );

  if (side === 'left') {
    return (
      <>
        {CSS}
        <section className="hr-panel hr-flex">
          <div className="hr-ph">
            <span className="hr-pi"><CrownIcon /></span>
            <h2>Top community member</h2>
          </div>
          <div className="hr-sub">New players brought in, last 90 days</div>
          <div className="hr-scroll hr-flex">
            <Rows
              rows={open.com ? community : community.slice(0, 5)}
              fmt={(v) => `+${num(v)}`}
              hrefFor={(n) => `/player/${encodeURIComponent(n)}`}
            />
          </div>
          <div className="hr-foot">
            {community.length > 5
              ? <button type="button" className="hr-exp" onClick={() => toggle('com')}>{open.com ? 'Show top 5' : `Show all ${community.length}`}</button>
              : <button type="button" className="hr-exp" onClick={onCredit}>Get credit</button>}
            <Link href="/quizzes/community" className="hr-link">Full leaderboard &rarr;</Link>
          </div>
        </section>

        <FlipPanel
          icon={<FlameIcon />}
          title="Today's leaders"
          open={open.tl}
          onToggle={() => toggle('tl')}
          faces={[
            {
              label: 'Daily games',
              sub: 'Combined daily games score',
              rows: dailyRows,
              fmt: (v) => (Math.round((v || 0) * 10) / 10).toLocaleString(),
              hrefFor: (n) => `/player/${encodeURIComponent(n)}`,
              href: '/quizzes/hub?tab=daily',
            },
            ...(xpToday.length ? [{
              label: 'IQ gainers',
              sub: 'IQ points earned today',
              rows: xpToday,
              fmt: num,
              hrefFor: (n) => `/player/${encodeURIComponent(n)}`,
              href: '/quizzes/hub?tab=player',
            }] : []),
          ]}
        />

        <FlipPanel
          icon={<StarIcon />}
          title="Top player"
          open={open.tp}
          onToggle={() => toggle('tp')}
          faces={[
            {
              label: 'All time',
              sub: 'Lifetime IQ points',
              rows: xpAll.length ? xpAll : xp30,
              fmt: num,
              hrefFor: (n) => `/player/${encodeURIComponent(n)}`,
              href: '/quizzes/hub?tab=player',
            },
            {
              label: '30 days',
              sub: 'IQ points, last 30 days',
              rows: xp30.length ? xp30 : xpAll,
              fmt: num,
              hrefFor: (n) => `/player/${encodeURIComponent(n)}`,
              href: '/quizzes/hub?tab=player',
            },
          ]}
        />
      </>
    );
  }

  return (
    <>
      {CSS}
      <section className="hr-panel hr-flex">
        <div className="hr-tabs">
          <button type="button" className={tab === 'feed' ? 'on' : undefined} onClick={() => setTab('feed')}>Live feed</button>
          <button type="button" className={tab === 'mine' ? 'on' : undefined} onClick={() => setTab('mine')}>Your results</button>
        </div>
        <div className="hr-stats">
          <div><b>{num(playsToday)}</b><span>plays today</span></div>
          <div><b>{timeToday}</b><span>played today</span></div>
        </div>
        <div className="hr-scroll hr-flex hr-actbody">
          {tab === 'feed' ? (
            (lastPlayed || []).slice(0, 14).map((f, i) => {
              const frac = f.total ? f.score / f.total : 0;
              const pct = Math.round(frac * 100);
              const cat = catFor ? catFor(f.quizId) : null;
              return (
                <Link key={`${f.quizId}-${i}`} href={hrefFor ? hrefFor(f.quizId) : '#'} className="hr-res">
                  <span className="hr-mid">
                    <span className="hr-t">
                      <span className="hr-ttl">{titleFor ? titleFor(f.quizId) : f.quizId}</span>
                      {cat ? <span className="hr-cat" style={{ background: cat.tint, color: cat.color }}>{cat.label}</span> : null}
                    </span>
                    <span className="hr-s">
                      <b className="hr-res-sc">{f.score}/{f.total}</b>
                      {typeof f.pct === 'number' ? ` · beat ${f.pct}%` : ''}{f.when ? ` · ${f.when}` : ''}
                    </span>
                  </span>
                  <span className="hr-ring" style={{ background: `conic-gradient(${ringTone(pct)} ${pct}%, #eef1f6 0)` }}><span className="in">{pct}%</span></span>
                </Link>
              );
            })
          ) : (
            myRows.map((g) => {
              const pct = (g.completion != null)
                ? Math.round(g.completion)
                : (g.total ? Math.round((g.score / g.total) * 100) : 0);
              return (
                <Link key={g.key} href={`/${g.key}`} className="hr-res">
                  {g.img ? <img src={g.img} alt="" aria-hidden="true" className="hr-ic" /> : null}
                  <span className="hr-mid">
                    <span className="hr-t"><span className="hr-ttl">{g.name}</span></span>
                    <span className="hr-s">
                      {(g.score != null && g.total) ? <b className="hr-res-sc">{g.score}/{g.total}</b> : <b className="hr-res-sc">{g.points} pts</b>}
                      {g.rank ? ` · #${g.rank}${g.field ? ` of ${g.field}` : ''}` : ''}
                      {fmtTime(g.time) ? ` · ${fmtTime(g.time)}` : ''}
                      {g.points != null ? ` · ${g.points} pts` : ''}
                    </span>
                  </span>
                  <span className="hr-ring" style={{ background: `conic-gradient(${ringTone(pct)} ${pct}%, #eef1f6 0)` }}><span className="in">{pct}%</span></span>
                </Link>
              );
            })
          )}
          {tab === 'feed' && !(lastPlayed || []).length ? <div className="hr-none" style={{ padding: '10px 13px' }}>No recent plays yet.</div> : null}
          {tab === 'mine' && !myRows.length ? <div className="hr-none" style={{ padding: '10px 13px' }}>Finish a daily puzzle and your result shows up here.</div> : null}
        </div>
        <div className="hr-foot">
          <button type="button" className="hr-exp" onClick={onAllLive}>All activity</button>
          <Link href="/quizzes/hub?tab=player" className="hr-link">Category mastery &rarr;</Link>
        </div>
      </section>

      <section className="hr-panel hr-feat">
        <div className="hr-ph"><span className="hr-pi"><SparkIcon /></span><h2>Featured</h2></div>
        {featured.map((f) => (
          <Link key={f.title} href={f.href} className="hr-frow">
            <span className="hr-fic" style={{ background: f.tint, color: f.color }}>{f.icon}</span>
            <span className="hr-fm"><span className="hr-ft">{f.title}</span><span className="hr-fs">{f.sub}</span></span>
            <span className="hr-fa">&rsaquo;</span>
          </Link>
        ))}
      </section>
    </>
  );
}

/* Inline icons: the rails only need four, and importing four more lucide
   components onto a page that already ships ~30 of them is not worth the
   bytes. */
function CrownIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M3 17h18M4 17 3 7l5 4 4-7 4 7 5-4-1 10" /></svg>; }
function FlameIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M12 2c1 4-2 5.2-2 8a2 2 0 0 0 4 0c2 2 3 4 3 6a5 5 0 0 1-10 0C7 12 11 10 12 2z" /></svg>; }
function StarIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.7 5.6 6.1.8-4.5 4.2 1.2 6.1L12 16.3 6.5 19.2l1.2-6.1L3.2 8.9l6.1-.8z" /></svg>; }
function SparkIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></svg>; }
