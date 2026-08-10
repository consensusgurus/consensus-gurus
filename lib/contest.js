// Referral contest: the single source of truth for the window, the scoring
// formula, eligibility and the reader-facing copy.
//
// Everything else (the SQL board function, /api/quiz/contest, the modal, the
// end-card teaser, the contest surface) reads its numbers and its wording from
// HERE. Changing the prize, the dates or a weight is a one-file edit; nothing
// downstream carries a hardcoded date or dollar figure.
//
// The scoring formula is owner-set (2026-08-05):
//
//     score = users x 1  +  sessions x 0.5  +  plays x 0.025
//
// summed over everyone a referrer brought in during the window, where for each
// referred person:
//   users    = 1 (they exist, and they only ever count once, see migration 38)
//   sessions = distinct DAYS on which they finished a game. There is no session
//              concept in the schema, and a day is the better metric anyway:
//              page views are trivial to spam, and nobody can manufacture five
//              separate days on the last night of the contest.
//   plays    = games they finished (abandoned runs excluded).
//
// Note the weights make SESSIONS the dominant term in practice: a referral who
// comes back five times contributes 3.75 from sessions against 1.0 for being a
// person. That is deliberate per the owner; lower SESSION_WEIGHT to shift the
// balance back toward raw headcount.

export const CONTEST = {
  id: 'launch-referral-aug-2026',

  // --- window ---------------------------------------------------------------
  // 30 days (owner, 2026-08-05; was 14). August 5 through September 3
  // inclusive is exactly 30 days: 27 in August, 3 in September.
  //
  // Stored as UTC instants because Postgres and JS both compare those without a
  // timezone library; the ET wall-clock times they correspond to are in
  // startLabel / deadlineLabel and are what the reader is shown.
  // 2026-08-05 00:00 ET = 04:00 UTC (EDT, UTC-4).
  // Ends 11:59:59pm ET on 2026-09-03, i.e. 03:59:59 UTC on 2026-09-04.
  // Both ends fall inside EDT, so the offset is UTC-4 throughout; a window
  // crossing the November DST change would need the second instant shifted.
  startsAt: '2026-08-05T04:00:00Z',
  endsAt: '2026-09-04T03:59:59Z',
  startLabel: 'August 5',
  endLabel: 'September 3',
  // Said in full wherever a deadline is stated. "Midnight ET" is ambiguous to
  // most readers (midnight of which day?), so the copy never uses it alone.
  deadlineLabel: '11:59pm ET on September 3',
  days: 30,

  // --- prize ----------------------------------------------------------------
  // Weighted to first place (owner, 2026-08-05; was a flat $5 each), then
  // raised tenfold to 200 / 20 / 10 (owner, 2026-08-08). One big headline
  // number is a better hook than three small ones, and second and third still
  // pay, so the chase does not collapse once someone pulls ahead. Every place
  // now pays a DIFFERENT amount, so nothing downstream may assume second and
  // third are equal; build reader-facing copy from the array, never by hand.
  // Index 0 is first place; `winners` is derived, never hardcoded.
  prizes: [200, 20, 10],
  get winners() { return this.prizes.length; },
  get prizeTotal() { return this.prizes.reduce((a, b) => a + b, 0); },
  // The headline figure is the TOP prize, which is what the promo leads with.
  prizeLabel: '$200',
  // Two rails, one menu. Venmo is the frictionless US option (free, instant,
  // already on the winner's phone); Tremendous covers everyone else and lets
  // the recipient choose PayPal, a bank transfer or a regional gift card, which
  // is what makes a worldwide small-dollar prize practical without asking a
  // stranger for an IBAN. The reader is shown the OPTIONS, never the rails.
  payoutRails: ['venmo', 'tremendous'],
  // NOT a guarantee of all four to every winner. Tremendous lets the RECIPIENT
  // choose, but only from the options the SENDER enables, and availability is
  // country-dependent (114 countries, but not every method in each). Venmo is
  // US-only. So the reader-facing copy promises "the options available in your
  // country" and treats this list as examples, never as a menu everyone gets.
  payoutOptions: ['PayPal', 'bank transfer', 'gift cards'],
  payoutUsOnly: ['Venmo'],

  // --- scoring --------------------------------------------------------------
  // Owner-set. Plays were cut from 0.1 to 0.025 (2026-08-05): at 0.1 a single
  // grinder could out-earn a real referral in a day, whereas at 0.025 it takes
  // 40 games to equal one player, which makes plays a tiebreaker rather than a
  // lever. Sessions carry the weight.
  USER_WEIGHT: 1,
  SESSION_WEIGHT: 0.5,
  PLAY_WEIGHT: 0.025,
  // Sessions are capped PER REFERRED PERSON (owner, 2026-08-05). Uncapped, a
  // referral who plays 30 days is worth 15 points on sessions alone, so three
  // devoted friends beat ten real new players and headcount stops leading.
  // Capped at 5, one person contributes at most 1 + 2.5 + plays, so volume
  // leads and engagement breaks the near-ties, which is the stated intent.
  // The cap is applied per person in SQL BEFORE summing; the sums reaching
  // contestScore() are already capped.
  SESSION_CAP: 5,
  // Plays are capped per person for the same reason, and capping sessions is
  // what exposed it: at 0.025 a superfan playing 150 games contributes 3.75,
  // so three of them (21.75) still beat ten genuine new players (15.25). At a
  // cap of 25 the same three score 12.375 and headcount leads as intended.
  // Set either cap to 0 to disable it.
  PLAY_CAP: 25,

  // --- eligibility ----------------------------------------------------------
  // OPEN WORLDWIDE (owner, 2026-08-05). The contest was scoped US-only when
  // Venmo was the only rail; adding Tremendous removed that constraint, so the
  // geo gate is off. An EMPTY array means no country restriction.
  //
  // The gate is kept as working code rather than deleted because a future promo
  // may need it, and because re-deriving it under time pressure is how these
  // things ship wrong. Populate it and the promo surfaces re-gate themselves.
  countries: [],
  // Country header missing (local dev, a slice of real traffic). Only consulted
  // when `countries` is non-empty.
  showOnUnknownCountry: true,
  minAge: 18,
};

// Same arithmetic as quiz_contest_board() in migration 46. Kept here so the
// client can show a live "your score" without a round trip, and so a drift
// between the two is a visible one-line diff rather than a mystery.
//
// `sessions` MUST already be the per-person-capped sum (SQL applies
// least(sessions, SESSION_CAP) per referred person before summing). Capping a
// total here would be wrong: it would cap the referrer, not each referral.
export function contestScore({ users = 0, sessions = 0, plays = 0 } = {}) {
  return (
    users * CONTEST.USER_WEIGHT +
    sessions * CONTEST.SESSION_WEIGHT +
    plays * CONTEST.PLAY_WEIGHT
  );
}

// ONE decimal for display. The 0.025 play weight means full precision gives
// ragged three-decimal scores (21.375 against 16.85 against 8.325), which reads
// as a float artifact rather than a score and is unreadable at the 13px rail
// size. Ranking always uses the FULL precision from SQL, so two scores can
// display equal while still being correctly ordered; the full board shows the
// players / sessions / plays columns, so the exact figure is recoverable there.
export function formatScore(n) {
  const v = Math.round((Number(n) || 0) * 10) / 10;
  return v.toFixed(1).replace(/\.0$/, '');
}

export function contestIsLive(now = Date.now()) {
  const t = typeof now === 'number' ? now : new Date(now).getTime();
  return t >= Date.parse(CONTEST.startsAt) && t <= Date.parse(CONTEST.endsAt);
}

export function contestHasEnded(now = Date.now()) {
  const t = typeof now === 'number' ? now : new Date(now).getTime();
  return t > Date.parse(CONTEST.endsAt);
}

// Whole days left, rounded up, for the "N days left" chip. Returns 0 once ended.
export function daysLeft(now = Date.now()) {
  const t = typeof now === 'number' ? now : new Date(now).getTime();
  const ms = Date.parse(CONTEST.endsAt) - t;
  return ms <= 0 ? 0 : Math.ceil(ms / 86400000);
}

// Country gate for the promo surfaces. `code` is the ISO2 from the sot_geo
// cookie (set by middleware from the Vercel edge header).
export function countryEligible(code) {
  // Empty list = open worldwide, which is the live setting. Short-circuit
  // before the cookie is even read so an absent cookie costs nothing.
  if (!CONTEST.countries.length) return true;
  const c = (code || '').trim().toUpperCase();
  if (!c) return CONTEST.showOnUnknownCountry;
  return CONTEST.countries.includes(c);
}

// The one place that decides whether a promo surface may render at all.
// Eligibility to WIN additionally requires an email on the account, which only
// the server can confirm; that is `eligible` on the /api/quiz/contest response.
export function canShowPromo({ country, now = Date.now() } = {}) {
  return contestIsLive(now) && countryEligible(country);
}

// Surfaces a promo pop-up may appear on. They are for PLAYERS, so they stay off
// the editorial list pages (/list/...) and off admin entirely.
//
// The HOMEPAGE (/) is the single most important entry point and was missing
// from this list on first ship, which silently suppressed the pop-up for every
// first-time visitor landing on the root, i.e. exactly the audience the promo
// exists to reach. Anchored as /^\/$/ so it matches the root ONLY and does not
// turn into a match-everything rule.
//
// It lives HERE rather than inside ContestPop because there is now more than one
// promo surface: the QR poster pop-up is a follow-on to the contest pop-up and
// must never appear somewhere its predecessor could not have.
export const PROMO_PATHS = [/^\/$/, /^\/quizzes/, /^\/quiz\//, /^\/daily/, /^\/player\//];

export function onPromoPath(path) {
  return PROMO_PATHS.some((re) => re.test(path || ''));
}

// Read the country the middleware stamped. Client-side only; server code reads
// the header directly via lib/ua.js.
export const GEO_COOKIE = 'sot_geo';

export function readGeoCookie() {
  if (typeof document === 'undefined') return null;
  try {
    const m = document.cookie.match(/(?:^|;\s*)sot_geo=([^;]*)/);
    return m ? decodeURIComponent(m[1]).trim().toUpperCase().slice(0, 2) : null;
  } catch {
    return null;
  }
}

// --- reader-facing copy -----------------------------------------------------
// Kept here so the modal, the end-card teaser, the share pop and the contest
// surface cannot drift apart on the terms.
// Ordinal words for prizeLine. A contest paying more than five places would
// fall through to "#6", which no live contest has needed.
const PLACE_WORDS = ['first', 'second', 'third', 'fourth', 'fifth'];

export const COPY = {
  headline: `Win ${CONTEST.prizeLabel}`,
  teaser: `Share for your chance at ${CONTEST.prizeLabel}*`,
  sub: 'Bring the most new players to Mind Loft',
  // "$200 first, $20 second, $10 third" rather than a total: the reader wants
  // to know what THEY could win, not the size of the pot. Mapped over the
  // array so changing a place, or how many places pay, needs no edit here.
  prizeLine: CONTEST.prizes.map((p, i) => `$${p} ${PLACE_WORDS[i] || `#${i + 1}`}`).join(', '),
  prizeOrdinal: (i) => `$${CONTEST.prizes[i] ?? 0}`,
  emailLine: 'An email on your account is required to be eligible and to get paid.',
  deadlineLine: `Ends ${CONTEST.deadlineLabel}.`,
  payoutLine: 'Open worldwide. Winners choose how to get paid from the options available in their country.',
  fraudLine:
    'Fake or spoofed accounts mean disqualification. Referrals are reviewed before payout.',
  formulaLine: 'Players (x1) + Sessions (x0.5) + Plays (x0.025)',
  formulaSub:
    'Counted for everyone you bring in. Players who keep coming back are worth far more than one-time clicks.',
  legal: `No purchase necessary. Free to enter and play. Open to entrants ${CONTEST.minAge}+. Winners contacted by email.`,
};
