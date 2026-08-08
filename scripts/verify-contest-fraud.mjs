// Sanity check for lib/contest-fraud.js against synthetic referral sets.
//
// The point is not coverage, it is calibration: a heuristic that flags the
// honest cases is worse than no heuristic, because it trains you to ignore it.
// Case 3 (six local friends, all on the same kind of phone, all in one city) is
// the one that matters most: it MUST stay out of the Review band.

import { buildFraudReview, BANDS, MIN_REFERRALS } from '../lib/contest-fraud.js';

const DAY = 86400000;
const base = Date.parse('2026-08-10T15:00:00Z');

function ref(o = {}) {
  return {
    referrer_user_id: o.owner || 'u1',
    username: o.owner || 'u1',
    ref_code: 'code',
    has_email: true,
    referrer_created_at: new Date(base - 30 * DAY).toISOString(),
    referred_key: o.key,
    referred_user_id: null,
    referred_username: null,
    credited_at: new Date(o.at).toISOString(),
    quiz_id: 'crux',
    first_play: new Date(o.at).toISOString(),
    last_play: new Date(o.at).toISOString(),
    plays: o.plays ?? 6,
    sessions: o.sessions ?? 3,
    city: o.city ?? 'Boston',
    region: 'MA',
    country: 'US',
    timezone: 'America/New_York',
    ua_browser: o.browser ?? 'Chrome',
    ua_os: o.os ?? 'Windows',
    is_mobile: o.mobile ?? false,
    language: 'en-US',
    referrer_host: o.from ?? 'facebook.com',
    campaign: null,
    ip_hash: o.ip ?? null,
    ip_match_referrer: o.ipSelf ?? false,
    self_city: 'Boston', self_region: 'MA', self_country: 'US',
    self_timezone: 'America/New_York', self_ua_browser: 'Chrome',
    self_ua_os: 'Windows', self_is_mobile: false,
  };
}

const cities = ['Boston', 'Austin', 'Denver', 'Seattle', 'Miami', 'Chicago'];
const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Chrome', 'Safari'];
const oses = ['Windows', 'iOS', 'macOS', 'Android', 'macOS', 'Windows'];

const cases = {
  // Real word of mouth: scattered people, scattered days, they stick around.
  clean: Array.from({ length: 6 }, (_, i) => ref({
    owner: 'clean', key: `c${i}`, at: base + i * DAY * 2,
    city: cities[i], browser: browsers[i], os: oses[i], mobile: i % 2 === 0,
    plays: 8 + i, sessions: 4, ip: `hash${i}`, from: i % 2 ? 'facebook.com' : 'direct',
  })),

  // The attack: private windows on one laptop, one quick daily in each.
  farm: Array.from({ length: 8 }, (_, i) => ref({
    owner: 'farm', key: `f${i}`, at: base + i * 6 * 60000,
    plays: 1, sessions: 1, ip: 'samehash', ipSelf: true, from: 'direct',
  })),

  // THE ONE THAT MUST NOT FLAG. Six friends in one city, all iPhones, told over
  // a week, all of whom actually play. Concentrated on geo and device, innocent.
  friends: Array.from({ length: 6 }, (_, i) => ref({
    owner: 'friends', key: `g${i}`, at: base + i * DAY,
    city: 'Boston', browser: 'Safari', os: 'iOS', mobile: true,
    plays: 12, sessions: 5, ip: `friend${i}`,
  })),

  // Too small to judge.
  tiny: Array.from({ length: 2 }, (_, i) => ref({
    owner: 'tiny', key: `t${i}`, at: base + i * 60000,
    plays: 1, sessions: 1, ip: 'samehash', ipSelf: true,
  })),

  // Farm-shaped, but every game predates migration 49 so there is no machine
  // data. The rescaling must still let it band, or the whole history reads clean.
  legacy: Array.from({ length: 8 }, (_, i) => ref({
    owner: 'legacy', key: `l${i}`, at: base + i * 5 * 60000,
    plays: 1, sessions: 1, ip: null, from: 'direct',
  })),
};

const { referrers } = buildFraudReview(Object.values(cases).flat());
const byName = Object.fromEntries(referrers.map((r) => [r.username, r]));

let failed = 0;
function expect(name, cond, detail) {
  const r = byName[name];
  const got = `risk=${r.risk} band=${r.band} n=${r.signals.n}`;
  if (cond(r)) {
    console.log(`PASS  ${name.padEnd(8)} ${got}`);
  } else {
    console.log(`FAIL  ${name.padEnd(8)} ${got}  -- expected ${detail}`);
    failed += 1;
  }
  for (const f of r.flags) console.log(`        flag: ${f}`);
}

expect('clean', (r) => r.band === 'low' && r.risk < 15, 'clear, near zero');
expect('farm', (r) => r.band === 'high' && r.risk >= 85, `high (>= ${BANDS.high}), near 100`);
expect('friends', (r) => r.risk < BANDS.review, `below the Review threshold (${BANDS.review})`);
expect('tiny', (r) => r.risk === null && r.band === 'none', `unscored under ${MIN_REFERRALS}`);
expect('legacy', (r) => r.band === 'high', 'still bands high with no machine data');

console.log(failed ? `\n${failed} FAILED` : '\nall calibration checks passed');
process.exit(failed ? 1 : 0);
