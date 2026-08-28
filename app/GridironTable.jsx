// The consensus ranking board, shared by /nflrankings and /collegefootballrankings.
//
// A SERVER component on purpose. The two sports live at their own URLs rather
// than behind a toggle, so nothing here needs client state, and the whole board
// ships as HTML: the ranking is in the source for search engines instead of
// being assembled by script after load.
//
// Layout rules live in CLAUDE-RANKINGS.md section 6. The load-bearing ones:
// the composite score sits immediately beside the team name and ahead of every
// source column; every source shows its own last-updated date; and a source
// excluded by the age gate keeps its column, struck through, rather than
// silently disappearing.
import Image from 'next/image';
import { computeComposite, MAX_AGE_DAYS } from '@/lib/gridiron';

const TIER_LABEL = {
  official: 'Official polls',
  model: 'Analytics models',
  media: 'Media power rankings',
  market: 'Betting markets',
};
const TIER_ORDER = ['official', 'model', 'media', 'market'];
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

export default function GridironTable({ data, sport, eyebrow, boardTitle }) {
  const { ranked, weights, tierShare, depth, status } = computeComposite(data.sources, sport);

  const ids = Object.keys(data.sources).sort(
    (a, b) => TIER_ORDER.indexOf(data.sources[a].tier) - TIER_ORDER.indexOf(data.sources[b].tier)
      || ((weights[b] || 0) - (weights[a] || 0))
  );
  const S = ids.map((id) => ({ id, ...data.sources[id], weight: weights[id] || 0, ...status[id] }));
  const live = S.filter((s) => s.ok);
  const out = S.filter((s) => !s.ok);
  const maxSpread = Math.max(...ranked.map((r) => r.spread || 0), 1);
  const hasPoll = live.some((s) => s.tier === 'official');

  // Tier header groups: one cell spanning each tier's run of columns.
  const groups = [];
  S.forEach((s, i) => {
    if (!groups.length || groups[groups.length - 1].tier !== s.tier) groups.push({ tier: s.tier, n: 1, at: i });
    else groups[groups.length - 1].n++;
  });
  const startsGroup = (i) => groups.some((g) => g.at === i && g.at !== 0);
  const pct = (v) => (Math.abs(v * 100 - Math.round(v * 100)) < 0.05 ? (v * 100).toFixed(0) : (v * 100).toFixed(1));

  // Deviation shading scales with depth: 3 spots means much less on a 50-deep
  // board than on a 32-deep one.
  const hi = depth > 32 ? 5 : 3;
  const lo = depth > 32 ? 9 : 5;

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
.gr table{border-collapse:separate;border-spacing:0;width:100%;min-width:1030px;font-size:13px;}
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
.gr td.cell{font-size:13px;font-weight:700;color:var(--muted);padding:9px 8px;border-left:1px solid transparent;}
.gr td.cell.nr{color:#c3c9d4;font-weight:600;}
.gr td.cell.rv{font-size:10px;font-weight:800;letter-spacing:.06em;color:var(--slate);}
.gr td.cell.up1{background:#eff5ff!important;color:var(--blue-deep);}
.gr td.cell.up2{background:#dbe9fe!important;color:var(--blue-deep);}
.gr td.cell.dn1{background:#fdf4e8!important;color:#9a6212;}
.gr td.cell.dn2{background:#fbe8cf!important;color:#8a5410;}
.gr td.sp{padding:9px 10px;width:112px;}
.gr-spbar{display:flex;align-items:center;gap:7px;justify-content:flex-end;}
.gr-spbar i{display:block;height:5px;border-radius:3px;background:var(--blue-200);}
.gr-spbar i.hot{background:var(--gold);}
.gr-spbar span{font-size:11.5px;font-weight:800;color:var(--muted);width:20px;text-align:right;}
.gr-legend{display:flex;gap:20px;flex-wrap:wrap;align-items:center;padding:12px 18px;
  background:var(--surface);border-top:1px solid var(--border);font-size:11.5px;color:var(--muted);}
.gr-k{display:inline-flex;align-items:center;gap:6px;}
.gr-sw{width:15px;height:15px;border-radius:4px;border:1px solid var(--border);}
.gr-notes{padding:14px 18px;border-top:1px solid var(--border);font-size:12px;color:var(--muted);line-height:1.65;}
.gr-notes b{color:var(--ink);}
@media(max-width:760px){
  .gr .cRank{width:38px;left:0;}
  .gr .cTeam{left:38px;box-shadow:1px 0 0 var(--border);}
  .gr .cScore{position:static;padding-left:6px;padding-right:8px;}
  .gr td.tm{font-size:12.5px;padding:6px 10px 6px 6px;width:auto;}
  .gr-tmn{max-width:132px;}
  .gr-lg,.gr-mono{width:22px;height:22px;}
  .gr-score{min-width:44px;padding:3px 6px 4px;}
  .gr-score b{font-size:13px;}
  .gr table{font-size:12px;}
}
      ` }} />

      <div className="gr-console">
        <div className="gr-chead">
          <div>
            <div className="gr-eyebrow">{eyebrow}</div>
            <h2>{boardTitle}</h2>
          </div>
          <div className="gr-stamp">
            <b>{live.length} of {S.length} sources</b> scoring, across{' '}
            {new Set(live.map((s) => s.tier)).size} tiers<br />
            built {data.fetchedAt}
          </div>
        </div>

        {out.length > 0 && (
          <div className="gr-warn">
            <b>{out.length} source{out.length > 1 ? 's' : ''} excluded by the {MAX_AGE_DAYS}-day rule.</b>{' '}
            {out.map((s) => `${s.label} (${s.why})`).join('; ')}. Their columns are shown struck
            through for transparency, but they score nothing and the remaining tiers reweighted
            around them.
          </div>
        )}

        <div className="gr-scroll">
          <table>
            <thead>
              <tr className="gr-tiers">
                <th className="cRank" /><th className="cTeam" /><th className="cScore" />
                {groups.map((g, i) => (
                  <th key={g.tier} colSpan={g.n} className={i ? 'tg' : undefined}>
                    {TIER_LABEL[g.tier]} &middot; {pct(tierShare[g.tier] || 0)}%
                  </th>
                ))}
                <th />
              </tr>
              <tr className="gr-srcs">
                <th className="cRank">#</th>
                <th className="cTeam">Team</th>
                <th className="cScore">Consensus</th>
                {S.map((s, i) => (
                  <th
                    key={s.id}
                    className={[startsGroup(i) ? 'tg' : '', s.ok ? '' : 'out'].filter(Boolean).join(' ') || undefined}
                    title={`${s.label} — ${s.why}`}
                  >
                    {s.short || s.label}
                    <span className="gr-w">{s.ok ? `${(s.weight * 100).toFixed(1)}%` : 'excluded'}</span>
                    <span className={`gr-asof${s.ok ? '' : ' bad'}`}>{fmtDate(s.asOf)}</span>
                  </th>
                ))}
                <th style={{ paddingRight: 16 }}>Spread</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((r) => {
                const hot = r.spread >= maxSpread * 0.75;
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
                          {r.appearances < live.length && (
                            <span className="gr-apps">ranked by only {r.appearances} of {live.length}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="cScore">
                      <span className="gr-score"><b>{r.score.toFixed(1)}</b><i>score</i></span>
                    </td>
                    {S.map((s, i) => {
                      const tg = startsGroup(i) ? ' tg' : '';
                      const shown = r.shown[s.id];
                      const rv = shown === 'RV' ? ' rv' : '';
                      if (!s.ok) return <td key={s.id} className={`cell out${tg}${rv}`}>{shown == null ? '—' : shown}</td>;
                      const v = r.ranks[s.id];
                      if (v == null) return <td key={s.id} className={`cell nr${tg}`}>{'—'}</td>;
                      const dev = r.rank - v;   // positive: this source is HIGHER on them
                      const cls = dev >= lo ? ' up2' : dev >= hi ? ' up1' : dev <= -lo ? ' dn2' : dev <= -hi ? ' dn1' : '';
                      return <td key={s.id} className={`cell${cls}${tg}${rv}`} title={`scored as rank ${v}`}>{shown}</td>;
                    })}
                    <td className="sp">
                      <div className="gr-spbar">
                        <i className={hot ? 'hot' : undefined}
                           style={{ width: Math.max(4, (r.spread / maxSpread) * 62) }} />
                        <span>{Number.isInteger(r.spread) ? r.spread : r.spread.toFixed(1)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="gr-legend">
          <span className="gr-k"><i className="gr-sw" style={{ background: '#dbe9fe' }} /> source ranks them higher than consensus</span>
          <span className="gr-k"><i className="gr-sw" style={{ background: '#fbe8cf' }} /> lower than consensus</span>
          <span className="gr-k"><i className="gr-sw" style={{ background: 'var(--gold)' }} /> widest disagreement</span>
          <span className="gr-k">{'—'} not ranked by that source</span>
        </div>

        <div className="gr-notes">
          <b>How the composite is built.</b> Each source is truncated to its top {depth} and scored{' '}
          {depth} points for first down to 1 for {depth}th; a team a source does not rank earns
          nothing from it. Every source is then weighted by its tier share, split within the tier.
          Tier shares renormalize over the tiers that published this week, so a tier going dark never
          breaks the ranking, and a tier carrying only one source is capped at 35% because one outlet
          is not a tier. Ties break on how many sources ranked the team, then its single best rank,
          then alphabetically. <b>Analytics models are weighted above human polls</b>, because voters
          anchor on preseason expectation and on brand and are slow to drop a name team, while a
          model re-derives from results every week with no such memory.
          {hasPoll && (
            <>
              {' '}<b>RV means receiving votes.</b> The AP and Coaches polls publish 25 ranks plus a
              list of teams receiving votes, so below 25 they still carry real signal. Vote-getters
              are scored on their vote totals, and teams level on votes share an averaged rank rather
              than being ordered arbitrarily, but the cell reads RV because that is what the poll
              actually published.
            </>
          )}
          {' '}<b>Spread</b> is the gap between a team&rsquo;s best and worst rank among the sources
          that rank them; the count under a team name says how many of the {live.length} scoring
          sources that is. A source whose data is more than {MAX_AGE_DAYS} days old is excluded
          from scoring and shown struck through.
        </div>
      </div>
    </div>
  );
}
