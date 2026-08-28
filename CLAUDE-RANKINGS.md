# Sports Consensus Rankings — Working Instructions

The framework behind **The Sports Ranking Source of Truth**: weekly consensus rankings for college
football and the NFL, built from official polls, media power rankings, and analytics models, and
rebuilt automatically every week.

> **Working on a LIST (`lib/data.js`) or a QUIZ (`lib/quizzes.js`)?** Those have their own rules in
> `CLAUDE.md` and `CLAUDE-QUIZZES.md`. This file governs the football rankings ONLY, which run on
> their own engine and their own route for the reasons in §1.

---

## 0. HARD RULES (read before touching anything)

1. **Never write a ranking from memory.** Every number ships from a live fetch performed in the same
   session. This is the `lib/data.js` no-guessing rule, and it matters more here because the data
   changes weekly and a plausible-looking wrong poll is undetectable by eye.
2. **A source that returns HTTP 200 is not a source that returns CURRENT data.** As of 2026-08-28,
   four of the sources below serve complete, well-formed, entirely plausible tables that are months
   old. Every ingest MUST parse an as-of date and refuse the source when it is stale (§5).
3. **An unresolvable team name is a hard failure, never a silent drop.** If a source lists 25 teams
   and only 24 resolve, the ranks below the missing one shift up by one and the whole column is
   quietly wrong. Fail the source, do not publish a short column.
4. **Never modify `getSources` in `lib/helpers.js` for this feature.** That engine is capped at a
   top ten (`bordaFromRank` returns 0 past rank 10) and drives 500+ lists across four mirrors.
   Football rankings are 25 and 32 deep and run on `lib/gridiron.js` instead.
5. **The past is frozen.** A published week is history. Never rewrite a shipped week's composite;
   corrections go in the following week with a note.

---

## 0a. ⚠️ THESE PAGES ARE CANONICAL ON sourceoftruths.com

Owner decision, 2026-08-28. The Sports Ranking pages are a **Source of Truths** property and live
primarily on the OLD host, even though the rest of the site moved to mindloftdaily.com on 2026-08-04.

Three pieces make that work, and they must stay in agreement:

| Piece | Where |
|---|---|
| The two paths are SERVED on old hosts instead of 308ing | `middleware.js`, via `SOT_PATHS` |
| `alternates.canonical` and `openGraph.url` are absolute on the old host | both `page.js` files, via `SOT_URL` |
| The sitemap lists the same two absolute URLs | `lib/sitemap-entries.js` `pagesEntries` |

`SOT_URL` and `SOT_PATHS` are defined once in `lib/site.js`. **Adding a third ranking page means
adding its path to `SOT_PATHS` and its canonical, or it will silently 308 to the new host.**

**This is a deliberate exception to the rule stated at the top of `lib/site.js`**, which warns that
the sitemap, robots and `metadataBase` must all agree on one canonical host or the Change of Address
filed at cutover is undermined. The old property now says "I moved" for every path EXCEPT two.

**What to watch, and the cheap way out.** Check those two URLs in Search Console over the next few
weeks. Google may honour the carve-out, or it may fold them into mindloftdaily.com anyway because the
Change of Address is a sitewide signal and a self-referential canonical on a migrated domain is a
contradiction. **If it folds them, do not fight it**: delete the `SOT_PATHS` check in the middleware
and switch the two canonicals back to relative. The pages keep the Source of Truths masthead, titles
and share copy either way, because the branding never depended on the URL. Nothing else is at risk —
verified 2026-08-28 that every other old-host path still 308s (`sourceoftruths.com/lists` →
`mindloftdaily.com/lists`).

---

## 1. Why this is its own engine and its own route

The owner's call (2026-08-28) was "hybrid": the data reads like the existing sources shape so it is
familiar and the activity ledger can hook in later, but scoring and rendering are separate.

The existing consensus engine cannot express these rankings:

| | `lib/helpers.js` `getSources` | `lib/gridiron.js` |
|---|---|---|
| Depth | top 10, hardcoded | 25 (CFB) / 32 (NFL) |
| Weighting | per-source (`trueExpert`, `decisiveExpert`, `weight`) | per-TIER, split within tier |
| Sources | hand-authored, edited rarely | machine-gathered weekly |
| Mirrors to keep in sync | 4 | 0 |

Bending `getSources` to fit would mean a `SCORING_ENGINE_VERSION` bump and a four-mirror change that
touches every list on the site, to serve two pages. It stays separate.

**Files:**

```
lib/gridiron.js          scoring engine (computeComposite)
lib/gridiron-teams.js    canonical team registry + alias normalizer + logo URLs
lib/gridiron-sources.js  source registry: endpoint, tier, parser, freshness rule
data/gridiron/<sport>-<season>-w<week>.json   one frozen snapshot per published week
app/rankings/[sport]/page.js                  the route
app/api/cron/gridiron/route.js                the weekly job
```

---

## 2. The composite

### Depth and points

Every source is truncated to the evaluation depth for its sport, then scored as a straight Borda:

```
depth = 50 (CFB), 32 (NFL)
points(rank) = depth + 1 - rank      for rank 1..depth
points        = 0                     otherwise
```

**CFB runs to 50** (owner rule, 2026-08-28). Nobody else publishes a consensus top 50, and with 136
FBS teams there is real signal well below 25. See §2a for the poll-depth problem this creates and
how it is solved — the naive version of this change hands ranks 26-50 to the models alone.

**Truncation is the load-bearing part.** Sources rank to wildly different depths: the AP poll stops
at 25, FPI ranks 136 FBS teams, Sagarin ranks 266. Without truncation, FPI's #60 team would out-earn
the AP's #20 team purely because FPI ranks deeper. Truncating every source to the same depth puts
them on one scale, and an absent team earning ZERO is the same rule `getSources` already uses.

### Tier weights

Weight is assigned by TIER, not by source, so adding a fourth media outlet cannot drown out the AP
poll:

**TIER ORDER: MARKETS > MODELS > MEDIA > HUMAN POLLS** (owner rule, 2026-08-28). The tiers are
ordered by **how little bias they carry**, not by how famous they are:

- A **betting market** is the least biased signal available. It is real money, continuously
  repriced by people who lose that money when they are wrong, with no reason to favour a brand, a
  conference or a television window.
- An **analytics model** is objective and results-derived, but it is one method with one set of
  assumptions, and different models genuinely disagree.
- **Human rankings** come last because their known failure modes all point the same way: voters
  anchor on where a team started the season, reward reputation and blue-blood brands, are slow to
  drop a name team that keeps losing, and see a fraction of the games they rank.

That is not a knock on the AP poll, which is a fine measure of what people believe. It is the
reason it does not lead here. This is a real editorial position, not a neutral default, so the
argument is stated on the page rather than buried.

| Tier | CFB | NFL | Why |
|---|---|---|---|
| Betting markets | **40%** | **45%** | The least biased signal available, and the hardest single one to beat. The largest tier in both sports. |
| Analytics models | **35%** | **35%** | Objective and results-derived, but one method among several. |
| Media power rankings | **10%** | **20%** | The softest signal and the most duplicative of the polls. Currently unpopulated for CFB (every fetchable CFB "media ranking" is an AP/Coaches reprint, which would double-count the poll tier). |
| Official polls | **15%** | — | AP and Coaches still carry the historical consensus and the vote tail that makes a top 50 possible, but they are weighted last per the rule above. The NFL has no official poll. |

Live shares after renormalization: **CFB** market 44.4, model 38.9, official 16.7. **NFL** market
45.0, model 35.0, media 20.0.

Within a tier, sources split the tier's share equally, except the official tier:

```
before the CFP's first release:  AP 60%,  Coaches 40%
from the CFP's first release:    CFP 50%, AP 30%, Coaches 20%
```

This mirrors the `decisiveExpert` idea already in `CLAUDE.md`: the committee ranking is the one that
decides the playoff, so it outweighs the other polls once it exists.

⚠️ **Unresolved tension, needs an owner ruling before November, and it got sharper.** These two
rules pull against each other. With the official tier now at 16.7% live, the CFP committee ranking
would land at roughly **8% of the composite** — so the ranking that literally selects the playoff
field would carry less weight than any single analytics model. That is defensible if the page's claim is "who is actually best," and wrong if the
claim is "where does this team stand." Options when the committee's first release lands: leave it
(models-first is the stated rule), raise the official tier only for the CFP weeks, or promote CFP
out of the official tier into a decisive slot of its own. **Do not decide this silently in code.**

### Two normalizations that keep it honest

**Tier renormalization.** Tier shares are divided by the total share of the tiers that actually
published this week AND passed the age gate. A tier going dark reweights the rest instead of
shrinking the composite. CFB currently has no usable media source, so it runs market 44.4% /
model 38.9% / official 16.7%.

**The solo-tier cap (`SOLO_CAP = 0.35`).** A tier carrying exactly one source is capped at 35% and
the excess redistributes. One outlet is not a tier. Without this the NFL media tier — currently just
CBS — would carry 50% of the composite alone, more than three independent models combined.

**The market tier is EXEMPT from the cap, and that exemption is what makes the ordering possible.**
The cap exists to stop one publication's OPINION standing in for a whole category. A betting line is
not an opinion: it is already an aggregation, priced by everyone with money at stake and moved by
books balancing action against each other, so a single futures board carries the market rather than
one voice. Without the exemption the cap handed the top tier straight back to the models on college
football, where the market is one source. Adding a second CFB market source would make the point
moot and is worth doing.

### The 30-day rule (owner rule, 2026-08-28)

**A source whose data is more than 30 days old is EXCLUDED from the composite.** It scores nothing
and takes no tier weight; the remaining tiers renormalize around it.

- **The column stays on the page**, struck through, marked `EXCLUDED`, with its date and the reason.
  A dropped source that simply vanishes teaches the reader nothing, and hiding it is exactly how a
  thin week passes for a full one.
- **An undated source must name the current season in its own label** to survive (Sagarin's "2026
  preseason", the market's "2026 season"). Anything undated that does not name the season fails.
  This is the content-derived freshness test from §5 applied to sources that publish no timestamp.
- **A team ranked ONLY by an excluded source never reaches the board.** Excluded ranks are carried
  for display, never for membership.

⚠️ **The preseason trap, and it is live right now.** The rule is correct in season, when every
source re-publishes weekly. In the preseason it is brutal, because several sources legitimately have
not re-run since spring. As of 2026-08-28 it excludes:

| Sport | Excluded | Age |
|---|---|---|
| CFB | ESPN FPI | 38 days |
| NFL | ESPN FPI | 87 days |
| NFL | Sagarin | 201 days |
| NFL | CBS Sports | 122 days |

That leaves the **NFL model tier with a single source** (DRatings), which the solo cap then holds at
35% — one model carrying more than a third of the composite, which is the very concentration the cap
exists to prevent. CFB is fine (five sources, three tiers).

This resolves itself once the seasons start (NFL Sept 10), when every source returns to a weekly
cadence. **If it is still biting after Week 2, the fix is a phase-aware limit** — 30 days in season,
looser in the preseason — not a blanket loosening, because the whole point of the rule is to catch a
source that has stopped updating when it should be updating. Do not change `MAX_AGE_DAYS` without
re-reading this note.

---

## 2a. The poll-depth problem, and "others receiving votes"

**This is the thing that makes a CFB top 50 honest rather than a lie about its own methodology.**

The AP and Coaches polls rank exactly 25 teams. At depth 50 the naive implementation gives every
team below 25 a zero from both polls, so the official tier — 62.5% of the composite — contributes
**nothing at all** to half the page, and the models silently decide ranks 26-50 while the header
still claims polls carry 62.5%. The weights would be a lie below the fold.

The fix is that the polls are deeper than they look. Both publish **"others receiving votes"** with
vote totals, and ESPN's core API returns it as a populated `others[]` array alongside `ranks[]`
(same schema; `current: 0` is the reliable marker for an others row — do not rely on array
position). Measured 2026-08-28: **AP reaches 50 distinct teams, Coaches 55, union 59.** So the polls
genuinely cover the whole top 50 and the tier weights stay true all the way down.

Three rules for handling the tail:

1. **Rank the tail by VOTE POINTS, not array position.** Points are the only ordering a vote tail
   has.
2. **Ties share an averaged rank.** Ties are everywhere down there — the 2026 preseason AP has USC
   and BYU tied at 839 points in the ranked block, and four teams tied on a single point in the
   tail. Tied teams take the average of the ranks they span (standard competition ranking), so a
   coin-flip ordering inside a tie can never leak into the composite.
3. **The cell renders `RV`, never a number.** The AP did not rank Clemson 26th; it said Clemson
   received votes. Printing "#26" would invent a rank the poll never published. The effective rank
   is still used for scoring and appears in the cell's tooltip.

**Known limit, and it is real.** Counting only teams with 5+ votes, AP separates about 38 teams and
Coaches about 46. Below that the tail is 1-to-4-point near-ties that barely discriminate. So poll
input is genuinely informative to roughly rank 40-46, and **ranks ~46-50 remain substantially
model-driven** even with the tail folded in. That is a fair description of the data rather than a
bug, but do not claim the polls fully own the bottom of the board.

---

## 2b. Ordering

1. Composite score, descending
2. Number of sources ranking the team (a team five sources rank beats one that two rank)
3. Best single rank across sources
4. Alphabetical

Deterministic at every step, so the same inputs always produce the same published week.

### What the page shows beyond the ranking

**Spread** — the gap between a team's best and worst rank, and the single most interesting number
here, because no one else publishes it. It is computed **across the sources that rank the team**,
with the `ranked by only N of M` line under the team name carrying the caveat. (Requiring every
source to rank a team was fine at depth 25; at depth 50, with sources of wildly different depths, it
would make spread meaningless below 25.) In the 2026 preseason build, BYU spreads 12 (polls #15,
Sagarin #24) and the NFL's Cowboys spread 18 (CBS #8, Sagarin #26).

**Cell shading** — each source cell is tinted by its deviation from the composite: blue where that
source is 3+ spots higher on the team, amber where it is 3+ lower, deeper at 5+. This is how a
reader sees which outlet is the outlier without reading a single number.

---

## 3. Source registry (verified live 2026-08-28)

### The one endpoint that matters

```
https://sports.core.api.espn.com/v2/sports/football/leagues/college-football/
  seasons/{year}/types/{1|2}/weeks/{week}/rankings/{pollId}
```

Poll ids: **1 = AP**, **2 = AFCA Coaches**, **21 = CFP committee**, 20 = FCS Coaches, 12 = D-III.
**Preseason is season type 1; regular season is type 2.** Poll 21 does not exist in the index until
the committee's first release in early November, and appears automatically thereafter.

⚠️ **Do NOT use `site.api.espn.com/apis/site/v2/.../rankings`.** It returns valid JSON but serves
AP only and **silently ignores `season` and `week` parameters** — the same payload comes back for
every week requested. It never errors; it just hands you the wrong week forever.

### Confirmed sources

| Source | Sport | Tier | Endpoint | Updates | Notes |
|---|---|---|---|---|---|
| AP Top 25 | CFB | official | ESPN core, poll 1 | Sun | |
| AFCA Coaches | CFB | official | ESPN core, poll 2 | Sun | |
| CFP committee | CFB | official | ESPN core, poll 21 | Tue, Nov–Dec | 404s until the first release; tolerate it |
| ESPN FPI | both | model | `.../seasons/{yr}/powerindex` | Tue/Wed | **paginate at `limit=4&page=N`**; bigger limits truncate |
| Sagarin | CFB | model | `sagarin.com/sports/cfsend.htm` | Sun/Mon | fixed-width `<pre>`; header block reprints every 10 rows |
| BCF Toys F+ | CFB | model | `bcftoys.com/{year}-fplus` | weekly | clean table, all 138 FBS |
| DRatings | CFB | model | `dratings.com/sports/ncaa-fbs-football-ratings/` | ~daily | |
| Sagarin NFL | NFL | model | `sagarin.com/sports/nflsend.htm` | Tue | four sub-columns incl. STRONG RECENT |
| DRatings NFL | NFL | model | `dratings.com/sports/nfl-football-ratings/` | ~daily | parse its "Updated N ago" string |
| PFR SRS | NFL | model | `pro-football-reference.com/years/{year}/` | ~daily in season | **empty until Week 1**, then the most durable URL in the sport. Header casing is `SoS` / `MoV`, not `SOS` / `MOV` |
| Sharp Football | NFL | media | `sharpfootballanalysis.com/analysis/nfl-power-rankings/` | weekly | plain `<table>`, in-body "Last Updated". **The only NFL media ranking with a stable URL and an honest date** |
| CBS Sports | NFL | media | `cbssports.com/nfl/powerrankings/` | Tue | **serves stale editions; date check is mandatory** |
| Title futures | CFB | market | ESPN core `.../seasons/{yr}/futures/2758` | ~daily | DraftKings prices, 138 teams. See the CFB market note below — do NOT substitute win totals |
| Sportsbook futures | NFL | market | `vegasinsider.com/nfl/odds/futures/` | ~daily | median across five books → implied probability → rank. **The only source anywhere in the audit that prints its own edition date in the body** |
| Kalshi | NFL | market | `kalshi.com/nfl/power-rankings` | ~daily | prediction-market implied; explicit ET timestamp |
| Market win totals | NFL | market | `nfeloapp.com/nfl-power-ratings/nfl-win-totals/` | weekly | implied strength in points vs an average opponent |

### Collinearity — do not double-count one analyst

**BCF Toys F+ already contains both FEI and SP+.** Shipping F+ *and* FEI *and* CFBD SP+ gives
Fremeau and Connelly roughly double weight while looking like three independent models. Pick **F+
alone**, or **the FEI/SP+ pair**, never both.

The same trap applies inside ESPN's `predictives` array: `epaoffense` / `epadefense` are components
*of* FPI, not independent signals. Do not add them as columns.

**Sagarin's PREDICTOR, GOLDEN MEAN, RECENT and STRONG RECENT columns are byte-identical to the main
RATING until games are played.** Weighting PREDICTOR as its own source in the preseason is
double-counting one number. Gate it on the word `STARTING` disappearing from the page header.

### ⚠️ Two sources that are actively dangerous, not merely useless

**Sumer Sports** stamps "Last Updated 08-27-2026" over a table whose own filter reads `Season: 2025`.
**Pro Football Network** prints "Last updated: August 28, 2026" from a **client-side clock** over a
table that says "Entering Week 12 • 2025 Season" with 2025 records.

Both would pass an HTTP-200 check, a row-count check, AND a naive date check, and would quietly
poison the ranking forever. They are the reason §5's freshness gate must key off a **content-derived**
signal — a parsed week or season label that must advance week over week — and never off a date string
that the page itself renders.

### Not usable (verified, do not retry without cause)

- **Blocklisted (HTTP 403):** usatoday.com, apnews.com, theathletic.com, sportingnews.com. The ESPN
  core API supplies both blocked polls anyway.
- **JavaScript-gated:** Massey, PFF, FTN/FO DVOA, TeamRankings, ESPN's own web power-ranking pages.
- **No discoverable weekly URL:** NFL.com, Yahoo, SI, Bleacher Report. Their content is readable but
  only at a per-week article slug, which adds a search step and a second failure point per outlet
  per week.
- **collegepolltracker.com `/football/coaches` serves the AP poll under a Coaches URL.** Never point
  at it.
- **NFL media, 15 outlets tested, 14 unusable.** They fail three ways: blocklisted (USA Today, AP,
  The Athletic, Sporting News), no stable path at all (NFL.com, B/R, PFF, SI, NBC, Fox — a new dated
  slug every week, and Fox does not keep a landing page), or JS-gated (ESPN, The Ringer). Sharp
  Football is the only survivor. This is why the NFL media tier is weighted smallest.
- **ESPN SOR (`accomplishmentrank`)** is `0` for every team until games are played. Wire the field,
  suppress the column until it populates (~Week 3), then it becomes a genuinely independent
  résumé-based signal.

### The CFB betting-market tier

**Use ESPN's national-title futures, not win totals.** This is counter-intuitive and worth stating
plainly, because win totals look like the better source:

- **Win totals price all 137 FBS teams** and discriminate beautifully down the board
  (`sportsbettingdime.com/college-football/futures/win-totals-best-odds/`). **But they are a
  PRESEASON market.** Books pull them once games begin, so a weekly cron pointed at win totals
  returns the same frozen July numbers every week for four months, and the market tier silently
  becomes a preseason prior wearing a live-data costume. That is worse than an empty tier, because
  it looks fresh and the 30-day rule would eventually catch it only if the page's date moved.
- **Title futures re-price weekly all season**, cover 138 teams, and — unlike the NFL — keep
  discriminating deep enough for a top 50: 29 distinct prices through rank 50, with the real
  collapse at rank 53 (15 teams share +80000).

```
https://sports.core.api.espn.com/v2/sports/football/leagues/college-football/seasons/{yr}/futures/2758
```

Unauthenticated JSON, DraftKings prices, team `$ref`s that join on the ESPN ids already in the
registry. Ties are everywhere on a futures board, so it ranks through the same tie-averaging path as
a poll (source `kind: 'priced'`, `lowerIsBetter: true`).

**Two guards.** The market includes at least one FCS program (North Dakota State), so filter against
the FBS registry rather than trusting the board's membership. And for ranks 30-50 later in the
season, add the **conference-winner markets** (ids 4092 Big 12, 11071 ACC, 15225 AAC, 15226 Big Ten,
15227 CUSA, 15229 MAC, 15232 SEC, 15233 Sun Belt): when Toledo is +1000000 for the title in Week 8
it still carries a live, moving price to win the MAC. Id 15230 would not load and Mountain West /
Pac-12 coverage is unverified.

### Worth adding: collegefootballdata.com

The single biggest available expansion, and the only route to SP+. Free key at
`collegefootballdata.com/key` (email only, no card), 1,000 calls/month against a weekly job that
needs ~16. `Authorization: Bearer <key>`. Endpoints: `/ratings/sp`, `/ratings/srs`, `/ratings/elo`
(takes `week`, purpose-built for this), `/ratings/fpi`, `/ratings/core`, `/rankings`. It also
re-derives all three polls independently, which makes it the cross-check against ESPN.

---

## 4. Teams, aliases, and logos

Every source names teams differently. Sagarin says `Miami-Florida`, `Southern California`,
`Mississippi`, and still says `Washington Redskins`. DRatings appends mascots. CBS prints bare
nicknames. Nothing works until they all resolve to one canonical name, so `lib/gridiron-teams.js` is
the join key for the whole framework.

`resolveTeam(sport, raw)` tries, in order: exact canonical match, explicit alias, NFL trailing-token
nickname (every NFL nickname is one token and unique league-wide), then progressively shorter
prefixes to strip a mascot. It returns `null` on failure, which the caller must treat as a hard
error per §0.3.

**Logos** come from ESPN's CDN and the two sports key differently — this is not interchangeable:

```
CFB:  https://a.espncdn.com/i/teamlogos/ncaa/500/{numeric_id}.png
NFL:  https://a.espncdn.com/i/teamlogos/nfl/500/{lowercase_abbr}.png
```

A `500-dark` variant exists for both. Every FBS and NFL team has a logo, so the no-logo case does not
arise in practice — but render an `onerror` fallback to an initials badge anyway, because some hosts
(artifact previews, strict CSPs) block external images entirely and a broken image reads as a bug.

⚠️ **Do not build the id map from `teams?limit=900`.** That response truncates partway through the
alphabet, and a missing team then looks like "team not found" rather than "response truncated."
Resolve per-id, or page it.

---

## 5. The weekly cron, and the guards that make automation safe

Fully automated with no human in the loop (owner's call, 2026-08-28). That decision is only
defensible with the guards below, because **the dominant failure mode here is not an error, it is a
successful fetch of stale or wrong data.** Six sources in the audit fail by returning HTTP 200 with
either zero bytes or a months-old table.

`app/api/cron/gridiron/route.js`, Tuesdays ~09:00 UTC (after Sunday's polls and Tuesday's power
rankings), plus a Wednesday retry.

### Per-source gate — a source publishes only if it passes ALL of these

1. **Non-empty body.** Six sources fail by returning 200 with zero bytes, which a naive parser reads
   as "zero ranked teams" rather than as an error.
2. **A CONTENT-DERIVED freshness signal matches the week being built, and the source is within
   `MAX_AGE_DAYS` (30).** Prefer a parsed week/season label from the payload's own body over any
   rendered date string, because two sources print today's date over last season's table (see §3).
   This is the only guard that catches ESPN's `site.api` serving preseason data in November, CBS
   serving an April edition at a live URL, and the two poisoned sources above. See §2's 30-day rule
   for the exclusion behaviour and the preseason trap.
3. **Expected header.** The payload's own poll name must be the poll requested. The only thing that
   catches collegepolltracker serving AP under a Coaches URL.
4. **Expected depth.** The source must parse to the depth it is known to publish — 25 ranked plus a
   populated `others[]` for a poll, `depth` teams for a model. A short column means a broken parser.
   **The AP endpoint returns an empty body on first call and populates only on retry**, so ingest
   needs a retry plus a non-empty assertion, or the week silently ships with no AP column.
5. **Every team name resolves.** Per §0.3.
6. **Week-over-week sanity.** No team may move more than 15 spots, and at least 70% of last week's
   ranked teams must still appear. A parser that silently reverses or offsets a column trips this.

A source failing the gate is **excluded from this week's composite**, not substituted with last
week's. Tier renormalization (§2) absorbs the loss cleanly. The exclusion is recorded in the
snapshot and shown on the page, so a reader can see which outlet went missing and why.

### Publish gate — the week publishes only if

- At least **three** sources passed, across at least **two** tiers. Fewer than that is not a
  consensus and the previous week stands with a "not yet updated" stamp.
- The new composite's top 10 shares at least 6 teams with last week's. A wholesale change means a
  systemic parse failure, not a wild football weekend.

On a publish failure the job writes no snapshot, leaves the previous week live, and reports. **A
stale week clearly labelled is always better than a wrong week presented as current.**

### Deploy discipline

Per `CLAUDE.md`'s batching rule: **one push per week, not one per source.** The job assembles the
whole week, validates, and pushes once. Every deploy empties the CDN cache, and this is the only
recurring automated writer in the repo.

---

## 6. Layout rules

Live tokens from `lib/theme.js`; Manrope; the dark `--ground` page with a white console, matching
the Loft surfaces.

- **Masthead: these pages are a SOURCE OF TRUTHS property, not a Mind Loft one** (owner rule,
  2026-08-28). They render `app/SotHeader.jsx` instead of the site-wide `SiteHeader`: the Source of
  Truths wordmark, a two-item nav, and a quiet link back to Mind Loft. Titles and `og:siteName` read
  "Source of Truths". The Mind Loft **footer stays** — it carries the legal links and is the site's
  real internal-link registry, and a sub-brand inside a parent site is the normal shape for that.
  Branding only: the visual system is unchanged (Midnight blue, Manrope), NOT the pre-rebrand
  cream/Fraunces identity.
- **Column order is fixed: rank, team, CONSENSUS SCORE, then every source, then spread** (owner
  rule, 2026-08-28). The composite score sits immediately beside the team name, ahead of every
  source column, in a filled `--accent` box. It is the answer the page exists to give, so it is
  never pushed to the far right past a horizontal scroll.
- **Source columns are grouped under their tier and ordered HEAVIEST TIER FIRST** (owner rule,
  2026-08-28): market, model, media, official, left to right, so reading order matches how much each
  tier moves the consensus. `TIER_ORDER` in `app/GridironTable.jsx`. The tier's live weight sits in
  the group header and each source's own weight under its name: the weighting is the methodology, so
  it belongs on the page rather than in a footnote.
- **The header above the board is kept short** so the #1 team is visible on load (owner rule,
  2026-08-28). The intro is two sentences carrying the bias argument; the full methodology lives in
  the notes UNDER the table, where there is room for it. Do not grow the intro back.
- **Sticky columns (desktop).** Rank, team and score are pinned so the source columns scroll under
  a labelled row.
- **PHONE IS NOT THE TABLE. Below 760px the table is replaced by ONE CARD PER TEAM** (owner rule,
  2026-08-28). A ten-column table behind a horizontal scrollbar is not a mobile layout: comparing
  sources is the entire point of this page, and every source column started off-screen, so the page
  showed a ranking and hid its own argument. The card carries rank, logo, name and the consensus
  score on one line; then EVERY source as a wrapped chip, tinted by its deviation from the consensus
  and edged in its tier colour (the tier grouping is a column header on desktop, so on a phone the
  chip has to say it); then the rank range and spread. Nothing scrolls sideways and no source is
  hidden. A tier key sits above the list, phone only.
  - **Both renders sit in the DOM at once and CSS picks one** (`.gr-scroll` vs `.gr-cards`). That is
    what keeps the pages server components with no client JS, and `display:none` keeps the hidden
    one out of the accessibility tree. It is the same approach `HomeRails` uses for its phone hero.
  - **Anything added to one render must be added to the other.** They are two views of the same row,
    and a source added to the table but not the card silently disappears on mobile.
- **An excluded source keeps its column**, struck through on a hatched ground, weight replaced by
  `EXCLUDED`, its numbers greyed, plus a banner naming each one and its age. Never let a dropped
  source silently disappear.
- **Coverage counts SCORING sources only.** `ranked by only N of M` and the header's source count
  both use the live count, not the total. Counting an excluded column in the denominator put
  "ranked by only 6 of 7" on every single row, which is noise rather than information.
- **EVERY source column shows its last-updated date under the name** (owner rule, 2026-08-28), not
  just the stale ones. A reader comparing six columns needs to know one of them is four months old,
  and a date that appears only when something is wrong never teaches anyone what current looks like.
  A stale source turns that stamp red with a ▲ marker and adds a banner naming how many days old it
  is. Render an ISO date as `Aug 17`; pass a source's own coarser phrase (`2026 preseason`) through
  untouched rather than inventing a precision it never claimed.
- **`RV` is rendered as a label, not a number** (§2a), in a smaller, quieter style than a rank.
- **Deviation shading scales with depth.** A 3-spot gap means much less on a 50-deep board than on a
  32-deep one, so the shading thresholds are 5/9 at depth 50 and 3/5 at depth 32.
- **Callouts under the table are computed from the board, never hand-written**, so they cannot go
  stale against the data the following week.
- **`ranked by only N of M`** appears under a team's name only when a source left them off. When
  every source ranks them it is noise on every row.

**LIVE as of 2026-08-28** at `/collegefootballrankings` and `/nflrankings`, rendered by
`app/GridironTable.jsx`. That component is a **server component on purpose**: the two sports have
their own URLs rather than sharing a toggle, so nothing needs client state and the whole board ships
as HTML, which is what puts the ranking in the source for search engines. Keep it that way.

`football-rankings-mockup.html` in the repo root is the design prototype the live pages were built
from; it is not wired to anything and may drift. The live pages are the truth.

---

## 7. Weekly build checklist

1. Fetch every registered source; run the per-source gate (§5) on each.
2. Resolve all team names; abort any source with an unresolved name.
3. Compute the composite (`lib/gridiron.js`), including tier renormalization and the solo cap.
4. Diff against last week's snapshot; run the publish gate (§5).
5. Write `data/gridiron/<sport>-<season>-w<week>.json` with the composite, every source's raw
   column, each source's as-of date, and the list of excluded sources with reasons.
6. Validate: `node --input-type=module --check < <file>` on any edited `lib/*.js` (plain
   `node --check` is a **no-op on an ESM file** — see `CLAUDE.md`). **A page script built inside a
   template literal is parsed by nothing at build time**: a duplicate `const` shipped a completely
   blank table once, with no error raised anywhere. Any builder that emits a `<script>` must
   `new Function(script)` it and refuse to write on a throw.
7. One commit, one push, spliced onto a `FETCH_HEAD` copy taken in the same step (the stale-base
   rule in `CLAUDE.md` applies here exactly as it does to `lib/data.js`).
8. After the Vercel deploy is live, ping IndexNow for `/rankings/cfb` and `/rankings/nfl`.
9. Verify on the live site that the week stamp advanced and no source shows an unexpected stale flag.

---

## 8. Open items

- [ ] Register a collegefootballdata.com key and add SP+, SRS and Elo (§3). Drop F+ if SP+ is added.
- [ ] Wire CFP poll 21 with a tolerated 404 before the committee's first release in early November.
- [ ] Re-test CBS NFL power rankings in the first week of September; it has not refreshed past its
      April post-draft edition.
- [ ] Wire PFR SRS for the NFL — it is empty until Week 1 and then becomes the most durable model
      source available.
- [ ] **Rule the CFP weighting question before the committee's first release in early November**
      (see §2). At the current tier weights the playoff-selecting ranking carries 15% of the
      composite.
- [ ] Un-suppress the ESPN SOR column once `accomplishmentrank` populates, ~Week 3.
- [ ] Re-verify the CFP official site parser in early November; it was redesigned 2026-08-27 and its
      record strings render mangled (rank and team name are clean; records are not).
