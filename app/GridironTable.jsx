// The consensus ranking board, shared by /nflrankings and /collegefootballrankings.
//
// A SERVER component on purpose. The two sports live at their own URLs rather
// than behind a toggle, so nothing here needs client state, and the whole board
// ships as HTML: the ranking is in the source for search engines instead of
// being assembled by script after load.
//
// Layout rules live in CLAUDE-RANKINGS.md section 6. The load-bearing ones:
// the composite rating sits immediately beside the team name and ahead of every
// column; every column shows its own date; and a source excluded by the age
// gate keeps its column, struck through, rather than silently disappearing.
//
// v2 (2026-09-01): columns are the three PILLARS (results, betting markets,
// analytics models) with each pillar's sources beside it. There are no media
// or poll columns because nothing of that kind is scored.
import Image from 'next/image';
import { computeComposite, MAX_AGE_DAYS, PILLAR_LABEL, PILLAR_ORDER, RAMP_WEEKS, PILLARS } from '@/lib/gridiron';

// Pillar colours, used only on mobile, where the desktop column grouping is gone
// and a chip has to say which pillar it came from on its own. Descending the
// site's own blue ramp in weight order. No gold: the theme reserves that for medals.
const TIER_COLOR = {
  results: 'var(--accent)',
  market: 'var(--blue)',
  model: 'var(--blue-400)',
};
const MEDAL = ['#e8b43a', '#aeb4bd', '#c88a55'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Sources report freshness in whatever form they publish it: an ISO date, or a
// phrase like "2026 preseason" when the source genuinely has no finer stamp.
// Render an ISO date as "Aug 17" and pass anything else through untouched,
// rather than inventing a precision the source never claimed.
function fmtDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  return m ? `${MON[+m[2] - 1]} ${+m[3]}` : (s || 'undated');
}
const signed = (v, d = 1) => (v > 0 ? '+' : '') + v.toFixed(d);
const pct = (v) => (Math.abs(v * 100 - Math.round(v * 100)) < 0.05 ? (v * 100).toFixed(0) : (v * 100).toFixed(1));

export default function GridironTable({ data, fetchedAt, sport, eyebrow, boardTitle }) {
  const out = computeComposite(data, sport);
  const { ranked, columns, tierShare, depth, excluded, week, weeksPlayed } = out;
  const cols = [...columns].sort((a, b) => PILLAR_ORDER.indexOf(a.tier) - PILLAR_ORDER.indexOf(b.tier));
  const live = cols.filter((c) => c.kind === 'source' && c.ok);
  const nSrc = cols.filter((c) => c.kind === 'source').length;
  const gone = excluded;
  const maxGap = Math.max(...ranked.map((r) => Math.abs(r.gap || 0)), 1);
  const fullIn = RAMP_WEEKS[sport];
  const rampNote = weeksPlayed < fullIn
    ? `Results carry ${pct(tierShare.results || 0)}% this week and reach ${pct(PILLARS.results)}% after week ${fullIn}.`
    : `Results carry their full ${pct(PILLARS.results)}%.`;

  // Pillar header groups: one cell spanning each pillar's run of columns.
  const groups = [];
  cols.forEach((c, i) => {
    if (!groups.length || groups[groups.length - 1].tier !== c.tier) groups.push({ tier: c.tier, n: 1, at: i });
    else groups[groups.length - 1].n++;
  });
  const startsGroup = (i) => groups.some((g) => g.at === i && g.at !== 0);

  // Deviation shading scales with depth: 3 spots means much less on a 50-deep
  // board than on a 32-deep one.
  const hi = depth > 32 ? 5 : 3;
  const lo = depth > 32 ? 9 : 5;
  const weightText = (c) => {
    if (c.kind === 'record') return 'shown';
    if (!c.ok) return c.kind === 'source' ? 'excluded' : 'not yet';
    return `${(c.weight * 100).toFixed(1)}%`;
  };
  const cellTitle = (c, r) => {
    if (c.kind === 'pillar' && r.pts[c.id] != null) return `${signed(r.pts[c.id])} points vs an average team`;
    if (c.id === 'ats' && r.pts.ats != null) return `${signed(r.pts.ats)} per game against the closing spread, luck-adjusted`;
    if (c.kind === 'source' && r.ranks[c.id] != null) return `scored as rank ${r.ranks[c.id]}`;
    return undefined;
  };

  return (
    <div className="gr">
      <style dangerouslySetInnerHTML={{ __html: `
.gr{font-family:'Manrope',system-ui,-apple-system,sans-serif;color:var(--ink);}
.gr-console{background:var(--white);border:1.5px solid var(--border);border-radius:14px;overflow:hidden;}
.gr-chead{padding:14px 18px;background:var(--surface-alt);border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;}
.gr-eyebrow{font-size:10.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--slate);}
.gr-chead h2{margin:3px 0 0;font-size:17px;font-weight:800;letter-spacing:-.01em;}
.gr-stamp{font-size:11.5px;color:var(--muted);text-align:right;line-height:1.6;}
.gr-stamp b{color:var(--ink);}
.gr-warn{margin:10px 18px 0;padding:10px 12px;border-radius:9px;background:#fdf3f2;
  border:1px solid #f2d5d1;color:#8d2f24;font-size:12px;line-height:1.55;}
.gr-scroll{overflow-x:auto;}
.gr table{border-collapse:separate;border-spacing:0;width:100%;min-width:1260px;font-size:13px;}
/* Column widths are FIXED so the three sticky columns (rank 46 + team 224 +
   rating 74 = 344px) never overlap a scrolling column: with v2's fourteen
   columns the browser was shrinking the team column and the sticky rating box
   sat on top of the results column. Below the table's min-width the console
   scrolls sideways; the page container is 1440px on desktop so it fits on a
   wide screen without scrolling at all. */
.gr td.tm,.gr th.cTeam{width:224px;min-width:224px;max-width:224px;}
.gr td.cScore,.gr th.cScore{width:74px;min-width:74px;}
.gr td.cell,.gr thead .gr-srcs th:not(.cRank):not(.cTeam):not(.cScore){min-width:66px;}
.gr th,.gr td{padding:0;text-align:center;white-space:nowrap;}
.gr thead .gr-tiers th{padding:9px 8px 5px;font-size:9.5px;font-weight:800;letter-spacing:.12em;
  text-transform:uppercase;color:var(--slate);border-bottom:1px solid var(--border);background:var(--surface);}
.gr thead .gr-srcs th{padding:8px 8px 10px;font-size:11px;font-weight:700;color:var(--muted);
  background:var(--surface);border-bottom:2px solid var(--accent);vertical-align:bottom;}
.gr thead th.tg,.gr td.tg{border-left:1px solid var(--border);}
.gr-w{display:block;font-size:9.5px;font-weight:800;color:var(--blue);margin-top:2px;letter-spacing:.04em;}
.gr-asof{display:block;font-size:9.5px;font-weight:700;color:var(--slate);margin-top:3px;letter-spacing:.02em;}
.gr-asof.bad{color:var(--danger);font-weight:800;}
.gr-asof.bad::before{content:'\\25B2 ';font-size:8px;}
.gr thead .gr-srcs th.out{background:repeating-linear-gradient(135deg,#f7f8fa,#f7f8fa 6px,#f1f3f6 6px,#f1f3f6 12px);
  color:#9aa2b1;text-decoration:line-through;text-decoration-thickness:1px;}
.gr thead .gr-srcs th.out .gr-w{color:var(--danger);text-decoration:none;display:inline-block;
  text-transform:uppercase;letter-spacing:.08em;font-size:8.5px;}
.gr thead .gr-srcs th.out .gr-asof{text-decoration:none;}
.gr td.cell.out{color:#c3c9d4;font-weight:600;
  background:repeating-linear-gradient(135deg,#fcfcfd,#fcfcfd 6px,#f7f8fa 6px,#f7f8fa 12px)!important;}
.gr .cRank,.gr .cTeam,.gr .cScore{position:sticky;background:var(--white);z-index:2;}
.gr .cRank{left:0;width:46px;}
.gr .cTeam{left:46px;text-align:left;}
.gr .cScore{left:270px;box-shadow:1px 0 0 var(--border);}
.gr thead .cRank,.gr thead .cTeam,.gr thead .cScore{background:var(--surface);z-index:3;}
.gr tbody tr:nth-child(even) .cRank,.gr tbody tr:nth-child(even) .cTeam,
.gr tbody tr:nth-child(even) .cScore,.gr tbody tr:nth-child(even) td{background:#fbfcfe;}
.gr tbody tr:hover td,.gr tbody tr:hover .cRank,.gr tbody tr:hover .cTeam,
.gr tbody tr:hover .cScore{background:var(--accent-soft);}
.gr td.rk{font-size:15px;font-weight:800;color:var(--ink);padding:9px 0;}
.gr-medal{display:inline-flex;align-items:center;justify-content:center;width:25px;height:25px;
  border-radius:50%;color:#fff;font-size:12.5px;font-weight:800;}
.gr td.tm{padding:7px 14px 7px 8px;font-size:13.5px;font-weight:700;letter-spacing:-.01em;width:224px;}
.gr-tmw{display:flex;align-items:center;gap:9px;}
.gr-lg{width:26px;height:26px;flex:none;object-fit:contain;}
.gr-mono{width:26px;height:26px;flex:none;border-radius:6px;background:var(--surface-alt);
  color:var(--slate);font-size:9.5px;font-weight:800;display:flex;align-items:center;
  justify-content:center;letter-spacing:.02em;}
.gr-tmn{overflow:hidden;text-overflow:ellipsis;}
.gr-apps{display:block;font-size:10px;font-weight:600;color:var(--slate);letter-spacing:.02em;}
.gr td.cScore{padding:7px 12px 7px 4px;width:74px;}
.gr-score{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;
  min-width:56px;padding:4px 8px 5px;border-radius:8px;background:var(--accent);color:#fff;}
.gr-score b{font-size:15px;font-weight:800;letter-spacing:-.01em;line-height:1;font-variant-numeric:tabular-nums;}
.gr-score i{font-style:normal;font-size:8px;font-weight:800;letter-spacing:.1em;
  text-transform:uppercase;opacity:.72;margin-top:2px;}
.gr thead th.cScore{color:var(--accent);}
.gr td.cell{font-size:13px;font-weight:700;color:var(--muted);padding:9px 6px;border-left:1px solid transparent;}
.gr td.cell.nr{color:#c3c9d4;font-weight:600;}
.gr td.cell.rv{font-size:10px;font-weight:800;letter-spacing:.06em;color:var(--slate);}
.gr td.cell.up1{background:#eff5ff!important;color:var(--blue-deep);}
.gr td.cell.up2{background:#dbe9fe!important;color:var(--blue-deep);}
.gr td.cell.dn1{background:#fdf4e8!important;color:#9a6212;}
.gr td.cell.dn2{background:#fbe8cf!important;color:#8a5410;}
.gr td.sp{padding:9px 10px;width:112px;}
.gr-spbar{display:flex;align-items:center;gap:7px;justify-content:flex-end;}
.gr-spbar i{display:block;height:5px;border-radius:3px;background:var(--blue-200);}
.gr-spbar i.hot{background:var(--blue-deep);}
.gr-spbar span{font-size:11.5px;font-weight:800;color:var(--muted);width:20px;text-align:right;}
.gr-legend{display:flex;gap:20px;flex-wrap:wrap;align-items:center;padding:12px 18px;
  background:var(--surface);border-top:1px solid var(--border);font-size:11.5px;color:var(--muted);}
.gr-k{display:inline-flex;align-items:center;gap:6px;}
.gr-sw{width:15px;height:15px;border-radius:4px;border:1px solid var(--border);}
.gr-notes{padding:14px 18px;border-top:1px solid var(--border);font-size:12px;color:var(--muted);line-height:1.65;}
.gr-notes b{color:var(--ink);}
/* ---- mobile: one card per team ----
   A ten-column table behind a horizontal scrollbar is not a mobile layout: the
   whole point of this page is comparing sources, and on a phone every source
   was off-screen. Below 760px the table is replaced by a card per team that
   keeps EVERY source visible, as wrapped chips, with no sideways scrolling.
   Both renders sit in the DOM and CSS picks one, so the pages stay server
   components with no client JS; display:none also keeps the hidden one out of
   the accessibility tree. */
.gr-cards,.gr-tierkey{display:none;}
@media(max-width:760px){
  .gr-scroll{display:none;}
  .gr-cards{display:block;list-style:none;margin:0;padding:0;}
  .gr-tierkey{display:flex;flex-wrap:wrap;gap:10px 14px;padding:10px 14px;
    border-bottom:1px solid var(--border);background:var(--surface);}
  .gr-tk{display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:800;
    letter-spacing:.06em;text-transform:uppercase;color:var(--slate);}
  .gr-tk i{width:9px;height:9px;border-radius:3px;display:block;}
  .gr-chead{padding:10px 13px;}
  .gr-chead h2{font-size:15px;}
  .gr-stamp{font-size:10.5px;line-height:1.45;text-align:left;}
  .gr-warn{margin:8px 13px 0;padding:8px 10px;font-size:11px;line-height:1.45;}
  .gr-tierkey{padding:8px 13px;gap:7px 12px;}
  .gr-card{padding:11px 14px 12px;border-bottom:1px solid var(--border);}
  .gr-card:last-child{border-bottom:0;}
  .gr-chead2{display:flex;align-items:center;gap:9px;}
  .gr-crank{font-size:15px;font-weight:800;color:var(--ink);min-width:22px;text-align:center;flex:none;}
  .gr-card .gr-lg,.gr-card .gr-mono{width:28px;height:28px;}
  .gr-cname{flex:1;min-width:0;font-size:15px;font-weight:800;letter-spacing:-.01em;
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .gr-cscore{flex:none;display:inline-flex;flex-direction:column;align-items:center;
    min-width:56px;padding:4px 9px 5px;border-radius:8px;background:var(--accent);color:#fff;}
  .gr-cscore b{font-size:15px;font-weight:800;line-height:1;font-variant-numeric:tabular-nums;}
  .gr-cscore i{font-style:normal;font-size:7.5px;font-weight:800;letter-spacing:.1em;
    text-transform:uppercase;opacity:.72;margin-top:2px;}
  .gr-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px;}
  .gr-chip{display:inline-flex;align-items:baseline;gap:5px;padding:3px 8px 3px 6px;
    border:1px solid var(--border);border-left-width:3px;border-radius:6px;background:var(--white);}
  .gr-chip s{font-size:9.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;
    color:var(--slate);text-decoration:none;}
  .gr-chip b{font-size:12.5px;font-weight:800;color:var(--muted);font-variant-numeric:tabular-nums;}
  .gr-chip.up{background:#eff5ff;}   .gr-chip.up b{color:var(--blue-deep);}
  .gr-chip.dn{background:#fdf4e8;}   .gr-chip.dn b{color:#9a6212;}
  .gr-chip.rvc b{font-size:10px;letter-spacing:.06em;}
  .gr-chip.gone{background:repeating-linear-gradient(135deg,#fcfcfd,#fcfcfd 5px,#f5f6f8 5px,#f5f6f8 10px);
    border-left-color:#d7dbe2!important;}
  .gr-chip.gone s,.gr-chip.gone b{color:#b9bfc9;text-decoration:line-through;}
  .gr-crange{margin-top:8px;font-size:10.5px;font-weight:700;color:var(--slate);letter-spacing:.02em;}
  .gr-crange em{font-style:normal;color:var(--muted);}
}
      ` }} />
      <div className="gr-console">
        <div className="gr-chead">
          <div>
            <div className="gr-eyebrow">{eyebrow}</div>
            <h2>{boardTitle}</h2>
          </div>
          <div className="gr-stamp">
            <b>{live.length} of {nSrc} sources</b> scoring, across{' '}
            {Object.keys(tierShare).length} pillars<br />
            week {week} &middot; built {fetchedAt}
          </div>
        </div>

        {gone.length > 0 && (
          <div className="gr-warn">
            <b>{gone.length} source{gone.length > 1 ? 's' : ''} excluded by the {MAX_AGE_DAYS}-day rule.</b>{' '}
            {gone.map((s) => `${s.label} (${s.why})`).join('; ')}. Their columns are shown struck
            through for transparency, but they score nothing and their pillar reweighted around them.
          </div>
        )}

        <div className="gr-scroll">
          <table>
            <thead>
              <tr className="gr-tiers">
                <th className="cRank" /><th className="cTeam" /><th className="cScore" />
                {groups.map((g, i) => (
                  <th key={g.tier} colSpan={g.n} className={i ? 'tg' : undefined}>
                    {PILLAR_LABEL[g.tier]} &middot; {pct(tierShare[g.tier] || 0)}%
                  </th>
                ))}
                <th />
              </tr>
              <tr className="gr-srcs">
                <th className="cRank">#</th>
                <th className="cTeam">Team</th>
                <th className="cScore">Rating</th>
                {cols.map((c, i) => (
                  <th
                    key={c.id}
                    className={[startsGroup(i) ? 'tg' : '', c.ok || c.kind !== 'source' ? '' : 'out'].filter(Boolean).join(' ') || undefined}
                    title={`${c.label} — ${c.why}`}
                  >
                    {c.short || c.label}
                    <span className="gr-w">{weightText(c)}</span>
                    <span className={`gr-asof${c.ok || c.kind !== 'source' ? '' : ' bad'}`}>{fmtDate(c.asOf)}</span>
                  </th>
                ))}
                <th style={{ paddingRight: 16 }} title="Results rank minus market rank. Positive: the results say better than the market does.">Résumé vs market</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((r) => {
                const g = r.gap;
                const hot = g != null && Math.abs(g) >= Math.max(hi, maxGap * 0.6);
                return (
                  <tr key={r.team}>
                    <td className="cRank rk">
                      {r.rank <= 3
                        ? <span className="gr-medal" style={{ background: MEDAL[r.rank - 1] }}>{r.rank}</span>
                        : r.rank}
                    </td>
                    <td className="cTeam tm">
                      <div className="gr-tmw">
                        {r.logo
                          ? <Image className="gr-lg" src={r.logo} alt="" width={26} height={26} unoptimized={false} />
                          : <span className="gr-mono">{r.mono}</span>}
                        <div className="gr-tmn">
                          {r.team}
                          {r.record && <span className="gr-apps">{r.record.text}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="cScore">
                      <span className="gr-score"><b>{signed(r.score)}</b><i>pts</i></span>
                    </td>
                    {cols.map((c, i) => {
                      const tg = startsGroup(i) ? ' tg' : '';
                      const shown = r.shown[c.id];
                      if (c.kind === 'source' && !c.ok) return <td key={c.id} className={`cell out${tg}`}>{shown == null ? '—' : shown}</td>;
                      if (shown == null) return <td key={c.id} className={`cell nr${tg}`}>{'—'}</td>;
                      if (c.kind === 'record') return <td key={c.id} className={`cell rv${tg}`} title={cellTitle(c, r)}>{shown}</td>;
                      const v = r.ranks[c.id];
                      if (v == null) return <td key={c.id} className={`cell rv${tg}`}>{shown}</td>;
                      const dev = r.rank - v;   // positive: this column is HIGHER on them
                      const cls = dev >= lo ? ' up2' : dev >= hi ? ' up1' : dev <= -lo ? ' dn2' : dev <= -hi ? ' dn1' : '';
                      return <td key={c.id} className={`cell${cls}${tg}`} title={cellTitle(c, r)}>{shown}</td>;
                    })}
                    <td className="sp">
                      {g == null ? <span className="gr-spbar"><span>—</span></span> : (
                        <div className="gr-spbar">
                          <i className={hot ? 'hot' : undefined}
                             style={{ width: Math.max(4, (Math.abs(g) / maxGap) * 62) }} />
                          <span>{g > 0 ? `+${g}` : g}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile render. Same data, same order, no horizontal scrolling. */}
        <div className="gr-tierkey">
          {groups.map((g) => (
            <span key={g.tier} className="gr-tk">
              <i style={{ background: TIER_COLOR[g.tier] }} />
              {PILLAR_LABEL[g.tier]} {pct(tierShare[g.tier] || 0)}%
            </span>
          ))}
        </div>
        <ul className="gr-cards">
          {ranked.map((r) => (
            <li className="gr-card" key={r.team}>
              <div className="gr-chead2">
                <span className="gr-crank">
                  {r.rank <= 3
                    ? <span className="gr-medal" style={{ background: MEDAL[r.rank - 1] }}>{r.rank}</span>
                    : r.rank}
                </span>
                {r.logo
                  ? <Image className="gr-lg" src={r.logo} alt="" width={28} height={28} />
                  : <span className="gr-mono">{r.mono}</span>}
                <span className="gr-cname">{r.team}{r.record ? ` · ${r.record.text}` : ''}</span>
                <span className="gr-cscore"><b>{signed(r.score)}</b><i>pts</i></span>
              </div>
              <div className="gr-chips">
                {cols.map((c) => {
                  if (c.kind === 'record') return null;
                  const shown = r.shown[c.id];
                  if (shown == null) return null;
                  const v = r.ranks[c.id];
                  const dev = v == null ? 0 : r.rank - v;
                  const dead = c.kind === 'source' && !c.ok;
                  const cls = dead ? 'gone' : dev >= hi ? 'up' : dev <= -hi ? 'dn' : '';
                  return (
                    <span
                      key={c.id}
                      className={`gr-chip ${cls}${v == null ? ' rvc' : ''}`.trim()}
                      style={{ borderLeftColor: TIER_COLOR[c.tier] }}
                    >
                      <s>{c.short || c.label}</s><b>{shown}</b>
                    </span>
                  );
                })}
              </div>
              <div className="gr-crange">
                Results <em>{r.rR ? `#${r.rR}` : 'no games'}</em> &middot; market <em>#{r.rO}</em>
                {r.rA && <> &middot; models <em>#{r.rA}</em></>}
                {r.gap != null && <> &middot; résumé vs market <em>{r.gap > 0 ? `+${r.gap}` : r.gap}</em></>}
              </div>
            </li>
          ))}
        </ul>

        <div className="gr-legend">
          <span className="gr-k"><i className="gr-sw" style={{ background: '#dbe9fe' }} /> column ranks them higher than the composite</span>
          <span className="gr-k"><i className="gr-sw" style={{ background: '#fbe8cf' }} /> lower than the composite</span>
          <span className="gr-k"><i className="gr-sw" style={{ background: 'var(--blue-deep)' }} /> widest résumé-versus-market gap</span>
          <span className="gr-k">{'—'} not ranked by that column</span>
        </div>

        <div className="gr-notes">
          <b>How the rating is built.</b> Every team gets a rating in points better than an average{' '}
          {sport === 'nfl' ? 'NFL' : 'FBS'} team on a neutral field, from each of three pillars, and
          the composite is their weighted sum.{' '}
          <b>Results</b> is what actually happened, in three parts. A luck-adjusted margin: half the
          scoreboard, half what the yardage says the margin should have been, so a team that doubled
          its opponent&rsquo;s yards and lost on fumbles is docked about half of what the score says,
          while a team that was out-gained and still lost takes the full hit. Margins are capped at{' '}
          {sport === 'nfl' ? 21 : 28} points and solved across the whole schedule so that beating good
          teams counts for more than beating bad ones. A win rating, so a win counts beyond its margin.
          And performance against the spread: how far above or below the closing line&rsquo;s
          expectation each game landed, which already prices the opponent and the site. Blended
          45 / 30 / 25.{' '}
          <b>Betting markets</b> is what money says: a rating fit to the last three weeks of point
          spreads, blended with the futures boards.{' '}
          <b>Analytics models</b> is what the models say: every live model, placed on the same points
          scale by its position against the market.{' '}
          Full-season weights are results {pct(PILLARS.results)}%, markets {pct(PILLARS.market)}%,
          models {pct(PILLARS.model)}%; results phase in over the first {fullIn} weeks because a
          September record predicts almost nothing, and a pillar with nothing to say this week hands
          its share to the others. {rampNote}{' '}
          <b>There are no media rankings and no human polls in the score.</b> Voters anchor on where a
          team started the season, reward reputation, and see a fraction of the games they rank; the
          three pillars here are each accountable to something real, a score, a price, or a
          measurement.{' '}
          <b>Résumé vs market</b> is the results rank minus the market rank: a large positive number
          is a team whose record the market does not yet believe, a large negative one is a favourite
          that keeps losing. A source whose data is more than {MAX_AGE_DAYS} days old is excluded
          from scoring and shown struck through.
        </div>
      </div>
    </div>
  );
}
