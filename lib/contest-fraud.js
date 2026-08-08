// Contest referral fraud signals.
//
// Input: the rows from quiz_contest_referrals() (migration 49), one per credited
// referral, each carrying the referred person's activity and device/geo
// fingerprint plus the referrer's own.
//
// Output: one summary per referrer, with six independent signals, a composite
// 0-100 risk number, and a list of plain-English flags.
//
// ---------------------------------------------------------------------------
// THIS IS A QUEUE, NOT A VERDICT.
//
// Every signal here has an innocent explanation. A family shares a router. A
// dorm floor shares a city, a campus IP and the same laptop. A good post lands
// twenty people on the same evening from the same referrer. None of that is
// cheating, and a high number is a reason to open the drill-down and look, not
// a reason to disqualify anyone. Nothing in the codebase consumes `risk`
// automatically, and nothing should: the contest copy promises a human review
// ("Referrals are reviewed before payout"), and that is what this supports.
//
// ---------------------------------------------------------------------------
// WHAT WE ARE ACTUALLY LOOKING FOR
//
// The contest's structural defenses (migrations 38 and 46) already stop the
// obvious attacks: one credit per referred browser ever, self-referral rejected
// by both anon_id and user_id, credit only on a finished non-abandoned game,
// and per-person caps of 5 sessions / 25 plays so no single superfan can be
// farmed. What remains is the cheap one: open N private windows on one machine,
// each mints a fresh visitor id, finish one quick daily in each. That nets
// roughly 1.5 points a pop.
//
// Those fakes cannot help sharing a machine, and that is what these signals
// look for. A real referrer's people are scattered across devices, cities and
// days; a farm's are not.
//
// The scoring is deliberately in JS rather than SQL: these weights are judgement
// calls that want tuning against real data, and tuning should not mean running
// another migration by hand.

// Referrers below this many referrals are not scored at all. With one or two
// referrals every share statistic is either 0 or 1 and the composite is noise:
// two friends in the same city on the same phone model is a Tuesday, not a
// pattern. They still appear in the table, banded "—", so nobody is hidden.
export const MIN_REFERRALS = 3;

// Composite weights, in points out of 100. Ordered by how hard the signal is to
// produce innocently. The two IP terms carry 65 of the 100 between them because
// a shared machine is the only signal here that is genuinely difficult to
// explain away at volume; the geo/device terms are corroborating detail.
//
// When a signal has no data (no referral carries an ip_hash, because the whole
// window predates migration 49), its weight is REMOVED FROM THE DENOMINATOR and
// the rest rescale to 100. Otherwise every historical referrer would band low
// purely because the column did not exist yet, which is precisely the false
// reassurance this tool exists to avoid.
export const WEIGHTS = {
  ipSelf: 40,     // referrals sharing a machine with the REFERRER themselves
  ipCluster: 25,  // referrals sharing a machine with EACH OTHER
  fingerprint: 15,// referrals on one city + browser + OS + device tuple
  oneAndDone: 10, // referrals that finished one game and never returned
  burst: 5,       // referrals credited inside one hour
  sameDay: 5,     // referrals credited on one calendar day
};

// A signal only starts scoring above its tolerance, because real referrers sit
// well above zero on all of these. Someone who tells six local friends will show
// a fingerprint share near 1.0 and a same-day share near 1.0 with nothing wrong.
const TOLERANCE = {
  fingerprint: 0.5,
  oneAndDone: 0.3,
  burst: 0.5,
  sameDay: 0.6,
};

export const BANDS = { high: 60, review: 30 };

// Eastern calendar day, the clock the rest of the admin reports in.
const ET_DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
});
export function etDay(iso) {
  if (!iso) return 'unknown';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 'unknown' : ET_DAY.format(d);
}

// Ramp a raw share into 0..1, starting at `tol` and reaching 1 at 1.0. A share
// at or below tolerance scores nothing at all rather than a small amount, so a
// clean account lands on a true zero instead of a vague low number.
function ramp(share, tol) {
  if (!(share > tol)) return 0;
  return Math.min(1, (share - tol) / (1 - tol));
}

// The device/geo tuple a farm cannot vary without real effort. City rather than
// region because region is far too coarse to mean anything (an entire state),
// and country would group half the entrants together.
function fingerprintKey(r) {
  return [
    r.city || '?',
    r.ua_browser || '?',
    r.ua_os || '?',
    r.is_mobile === true ? 'm' : r.is_mobile === false ? 'd' : '?',
  ].join('|');
}

// Largest number of entries sharing one key. Entries with a null key are each
// counted as unique (an unknown fingerprint is not evidence of anything).
function largestGroup(rows, keyOf) {
  const counts = new Map();
  let top = 0;
  let topKey = null;
  for (const r of rows) {
    const k = keyOf(r);
    if (!k) continue;
    const n = (counts.get(k) || 0) + 1;
    counts.set(k, n);
    if (n > top) { top = n; topKey = k; }
  }
  return { top, topKey };
}

// Most referrals credited inside any 60-minute window, by a forward sweep over
// the sorted timestamps. Twenty credits in an hour from an account that had none
// yesterday is the loudest timing signal available.
export function maxBurst(times, windowMs = 3600000) {
  const ts = times.filter(Boolean).map((t) => Date.parse(t)).filter((n) => !Number.isNaN(n)).sort((a, b) => a - b);
  let best = 0;
  let lo = 0;
  for (let hi = 0; hi < ts.length; hi += 1) {
    while (ts[hi] - ts[lo] > windowMs) lo += 1;
    best = Math.max(best, hi - lo + 1);
  }
  return best;
}

// Group the flat referral rows into one record per referrer.
export function groupByReferrer(rows) {
  const by = new Map();
  for (const r of rows || []) {
    const id = r.referrer_user_id;
    if (!id) continue;
    if (!by.has(id)) {
      by.set(id, {
        id,
        username: r.username || 'Unknown',
        refCode: r.ref_code || null,
        hasEmail: r.has_email === true,
        createdAt: r.referrer_created_at || null,
        self: {
          city: r.self_city || null,
          region: r.self_region || null,
          country: r.self_country || null,
          timezone: r.self_timezone || null,
          browser: r.self_ua_browser || null,
          os: r.self_ua_os || null,
          isMobile: r.self_is_mobile ?? null,
        },
        referrals: [],
      });
    }
    by.get(id).referrals.push(r);
  }
  return Array.from(by.values());
}

// Score one referrer. Returns the raw signals alongside the composite so the
// admin table can show the working, never just the number.
export function scoreReferrer(group) {
  const rs = group.referrals;
  const n = rs.length;

  const withIp = rs.filter((r) => r.ip_hash);
  const ipCoverage = n ? withIp.length / n : 0;
  const ipSelf = rs.filter((r) => r.ip_match_referrer === true).length;
  const ipGroup = largestGroup(withIp, (r) => r.ip_hash);
  const fpGroup = largestGroup(rs, fingerprintKey);
  const oneAndDone = rs.filter((r) => Number(r.plays || 0) <= 1).length;
  const direct = rs.filter((r) => !r.referrer_host || r.referrer_host === 'direct').length;
  const burst = maxBurst(rs.map((r) => r.credited_at));
  const dayGroup = largestGroup(rs, (r) => etDay(r.credited_at));

  const signals = {
    n,
    ipCoverage,
    ipSelf,
    ipSelfShare: n ? ipSelf / n : 0,
    // "How many of these are the same machine as another of these." One row is
    // subtracted because a group of one is not a cluster.
    ipCluster: ipGroup.top > 1 ? ipGroup.top : 0,
    ipClusterShare: n && ipGroup.top > 1 ? (ipGroup.top - 1) / n : 0,
    fingerprint: fpGroup.top,
    fingerprintKey: fpGroup.topKey,
    fingerprintShare: n ? fpGroup.top / n : 0,
    oneAndDone,
    oneAndDoneShare: n ? oneAndDone / n : 0,
    direct,
    directShare: n ? direct / n : 0,
    burst,
    burstShare: n ? burst / n : 0,
    sameDay: dayGroup.top,
    sameDayKey: dayGroup.topKey,
    sameDayShare: n ? dayGroup.top / n : 0,
    plays: rs.reduce((a, r) => a + Number(r.plays || 0), 0),
    sessions: rs.reduce((a, r) => a + Number(r.sessions || 0), 0),
  };

  if (n < MIN_REFERRALS) {
    return { ...group, signals, risk: null, band: 'none', flags: [] };
  }

  // Each term is (weight, earned fraction). A term with no data underneath it is
  // dropped from both numerator and denominator rather than scored as zero.
  const terms = [];
  const hasIp = withIp.length > 0;
  if (hasIp) {
    terms.push([WEIGHTS.ipSelf, signals.ipSelfShare]);
    terms.push([WEIGHTS.ipCluster, signals.ipClusterShare]);
  }
  terms.push([WEIGHTS.fingerprint, ramp(signals.fingerprintShare, TOLERANCE.fingerprint)]);
  terms.push([WEIGHTS.oneAndDone, ramp(signals.oneAndDoneShare, TOLERANCE.oneAndDone)]);
  terms.push([WEIGHTS.burst, ramp(signals.burstShare, TOLERANCE.burst)]);
  terms.push([WEIGHTS.sameDay, ramp(signals.sameDayShare, TOLERANCE.sameDay)]);

  const totalWeight = terms.reduce((a, [w]) => a + w, 0);
  const earned = terms.reduce((a, [w, f]) => a + w * f, 0);
  const risk = totalWeight ? Math.round((earned / totalWeight) * 100) : 0;

  const flags = [];
  if (ipSelf > 0) {
    flags.push(`${ipSelf} of ${n} played on the same machine as ${group.username}`);
  }
  if (signals.ipCluster > 1) {
    flags.push(`${signals.ipCluster} played on one shared machine`);
  }
  if (signals.fingerprintShare > TOLERANCE.fingerprint && fpGroup.topKey) {
    const [city, browser, os] = fpGroup.topKey.split('|');
    flags.push(`${fpGroup.top} of ${n} on the same device profile (${[city, browser, os].filter((v) => v && v !== '?').join(', ') || 'unknown'})`);
  }
  if (signals.oneAndDoneShare > TOLERANCE.oneAndDone) {
    flags.push(`${oneAndDone} of ${n} finished one game and never came back`);
  }
  if (burst >= 3 && signals.burstShare > TOLERANCE.burst) {
    flags.push(`${burst} credited inside one hour`);
  }
  if (signals.sameDayShare > TOLERANCE.sameDay && dayGroup.top >= 3) {
    flags.push(`${dayGroup.top} of ${n} credited on ${dayGroup.topKey}`);
  }
  if (!group.hasEmail) {
    flags.push('No email on the account, cannot be paid or contacted');
  }
  if (hasIp && ipCoverage < 0.5) {
    flags.push(`Only ${Math.round(ipCoverage * 100)}% of these have machine data, so the IP signals are partial`);
  }

  const band = risk >= BANDS.high ? 'high' : risk >= BANDS.review ? 'review' : 'low';
  return { ...group, signals, risk, band, flags };
}

// The whole review, worst first. Unscored referrers (under MIN_REFERRALS) sort
// to the bottom by referral count, since there is nothing to judge.
export function buildFraudReview(rows) {
  const scored = groupByReferrer(rows).map(scoreReferrer);
  scored.sort((a, b) => {
    if (a.risk == null && b.risk == null) return b.signals.n - a.signals.n;
    if (a.risk == null) return 1;
    if (b.risk == null) return -1;
    return b.risk - a.risk || b.signals.n - a.signals.n;
  });
  const totals = {
    referrers: scored.length,
    referrals: rows ? rows.length : 0,
    high: scored.filter((s) => s.band === 'high').length,
    review: scored.filter((s) => s.band === 'review').length,
    // Share of all referrals that carry machine data, which sets how much the
    // IP signals can be trusted for this window.
    ipCoverage: rows && rows.length
      ? rows.filter((r) => r.ip_hash).length / rows.length
      : 0,
  };
  return { referrers: scored, totals };
}
