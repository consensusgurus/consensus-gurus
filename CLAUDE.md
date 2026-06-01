# Consensus Gurus — Working Instructions & List Creation Rules

This file is the single, auto-loaded source of truth for working on consensusgurus.com. It lives at the
root of the repo, and Cowork loads it every session, so there is no need to paste anything into chat.

## Setup & site overview

- **Repo (the only folder):** the connected repo, currently `C:\dev\consensus-gurus` (moved off OneDrive to
  stop sync/lock issues). Everything lives here: the Next.js app, `lib/data.js`, and this file.
- **Live data file to edit:** `lib/data.js` in this repo. That is the only file that deploys to Vercel.
- **Stack:** Next.js 14 on Vercel. Supabase stores live votes and view counts (fetched on page load via
  `fetchBootstrap()`). Magazine look: cream `#f4ede0`, Fraunces headlines, DM Sans / DM Mono body, red `#c0392b`.
- **Deploy:** Claude pushes `lib/data.js` straight to `origin/main` via the stored PAT (see the Deploy
  section); Vercel auto-deploys in ~1 minute. GitHub Desktop is the manual fallback.

## This file is a living document

These conventions have changed over time and will keep changing. Update this file in place whenever a
convention is added or revised, so future sessions inherit the latest version automatically.

---

## How Consensus Works

The Consensus tab on each list is computed live using **Borda scoring**:

- Each publication source ranks its items. Rank 1 = 10 pts, rank 2 = 9 pts ... rank 10 = 1 pt.
- Items not ranked by a source receive that source's average score (not zero).
- The `seed` source (keyed `ai` internally) is **excluded from Borda** — it is a display placeholder only, never used in scoring.
- Live fan votes from Supabase are weighted at **0.75x** of one publication.
- Tie-break: by appearance count across sources, then alphabetically.
- Consensus is always exactly the **top 10** items by Borda score.
- Expert source lists can have **any number of items** — not limited to 10.
- A source flagged `"trueExpert": true` is weighted more heavily than a normal expert — see **True Expert Sources** below.

**Key implication:** If an important item is missing from the consensus, the fix is always to improve the expert source data — ensure the item appears in multiple sources at appropriate rank positions. Fan votes alone (at 0.75x) cannot overcome a weak showing across publications.

### True Expert Sources

Some sources are exceptionally authoritative for a topic, and should pull more weight than an ordinary publication. Flag these with `"trueExpert": true` on the source object.

A true expert's Borda contribution is scaled by a weight equal to **half the combined weight of all the other (non-true-expert) experts, with a floor of 2x one normal expert**: `weight = max(2, N_other / 2)`, where `N_other` is the summed weight of the other experts (each normal expert is weight 1). Worked examples:

| Other experts (`N_other`) | True expert counts for |
|---|---|
| 1 | 2 (floor) |
| 2 | 2 (floor) |
| 3 | 2 (floor) |
| 4 | 2 (floor) |
| 5 | 2.5 |
| 6 | 3 |
| 8 | 4 |

The floor guarantees a true expert always counts for at least two ordinary experts; beyond that it scales to half the rest of the expert field. Everything else (rank ordering, the `unordered` flat-5.5 rule, the top-10 cutoff, tie-breaks) works exactly as for a normal source — only the per-source multiplier changes. A source may also set an explicit numeric `"weight"` to override the default 1 for fine control.

Implemented in `lib/helpers.js` `getSources` and mirrored in `scripts/generate-og-images.js` (`computeConsensus`) — keep the two in sync.

**Known true experts:**

- **Johnny Novo** (`johnnynovo.com/rankings/...`) — a rigorous, single-author burger ranking with per-establishment ratings. Used as a true expert on `burgers-nyc`. Order his source by the published rating, descending (it is a ranked source, not `unordered`).

---

## Data Structure

Each list entry in `lib/data.js` follows this structure:

```javascript
{
  id: 'kebab-case-unique-id',            // URL slug: /list/kebab-case-unique-id
  publishedDate: 'YYYY-MM-DD',           // Required. Use today's date.
  title: 'Best [Thing] in [Place]',      // Must start with Best, Most, or Top-Grossing
  category: 'New York',                  // Short label shown on card and OG image
  type: 'travel',                        // Primary type for legacy code (see valid values)
  tags: ['travel', 'luxury'],            // All applicable tags — be generous (see tag rules)
  linkType: 'mapsCity',                  // Controls item links (see values below)
  blurb: 'One or two sentences...',      // Editorial description shown on list page
  defaultSource: 'ai',                   // Always 'ai'
  mode: 'facts',                         // OPTIONAL — omit for default behavior
  links: { 'Item Name': 'https://...' }, // OPTIONAL — direct affiliate URLs for product lists
  sources: {
    ai: {
      label: 'Consensus Seed',
      items: [ /* 10 items */ ],         // Seed/placeholder — NOT used in Borda scoring
    },
    sourceid: {
      label: 'Source Display Name 2025',
      items: [ /* any number of items */ ],
    },
    // additional sources...
  },
  vote: {
    items: [ /* exactly 10 items */ ],   // Seeds the voting UI — same tier as sources
  },
},
```

---

## Field Reference

### `id`
Kebab-case, globally unique. Becomes the URL: `/list/[id]`. Examples: `pizza-nyc`, `thailand-beachfront-hotels`, `headphones-overear`.

### `publishedDate`
Always `'YYYY-MM-DD'`. Use today's date for new lists.

### `publishedAt`
**Required for new lists.** Full ISO 8601 UTC timestamp, e.g. `'2026-05-28T16:05:09Z'`. The homepage "Most Recent" sort prefers `publishedAt` over `publishedDate`. If `publishedAt` is omitted, the list falls back to noon UTC on `publishedDate`, which ties with every other list published that day and the tiebreaker is original array order — which puts new entries at the BOTTOM of the day, not the top. Always set `publishedAt` to the actual moment Claude is pushing the list so the list appears as the freshest.

To get the current UTC timestamp in bash: `date -u +"%Y-%m-%dT%H:%M:%SZ"`.

### `title`
Must start with **Best**, **Most**, or **Top-Grossing**. Title case. Examples:
- `Best Pizza in NYC`
- `Most Exclusive Golf Clubs in the World`
- `Top-Grossing Films of 1990`

### `category`
Short label shown on the card and in the OG preview image. Use the city, region, or topic. Examples: `New York`, `Travel`, `Tech`, `Thailand`.

### `type`
Primary category for legacy code paths. Use one of: `travel`, `food`, `entertainment`, `product`, `other`, `stores`.

### `tags`
Controls the filter chips on the homepage. **Be generous — apply every tag that reasonably fits.** A bar or speakeasy, for example, should carry all of: `bars`, `nightlife`, `stores`, `food-drink`, `entertainment`. A luxury hotel should carry `travel` and `luxury`. Valid values:

| Tag | Use for |
|-----|---------|
| `travel` | Hotels, resorts, destinations |
| `food` | Restaurants, food items, food spots |
| `food-drink` | Any food or drink establishment |
| `bars` | Bars, cocktail bars, speakeasies, pubs |
| `nightlife` | Clubs, late-night venues, dive bars |
| `stores` | Any physical place people visit |
| `entertainment` | Movies, TV, games, books, music, events |
| `tech` | Tech products |
| `product` | Physical products (non-tech) |
| `luxury` | Any luxury travel, hotel, or lifestyle list |
| `other` | Anything that doesn't fit above |

When in doubt, include the tag. It is better to over-tag than under-tag.

### `linkType`
Controls what each item name links to when clicked:

| Value | Links to | Use for |
|-------|----------|---------|
| `mapsCity` | Google Maps search by name | All restaurants, bars, hotels (US and international), any place findable by name |
| `amazon` | Amazon search with affiliate tag `cgurus-20` | Physical products |
| `imdb` | IMDB search | Films, TV shows |
| `steam` | Steam search | Video games |
| `wiki` | Wikipedia search | Historical items, factual lists |
| `google` | Google search | Anything not covered above |

**All hotels — US and international — use `mapsCity`.** Google Maps finds international hotels by name accurately. Do not use `booking` for any list.

**IMPORTANT — `mapsCity` links and parentheticals.** Item names carry a parenthetical for context (e.g. `Amanoi (Vinh Hy Bay, Vietnam)`). If that raw string is dropped into a Maps URL, Google reads the parentheses and commas as a separator between two waypoints and opens a **driving-directions** screen (origin `Amanoi` → destination `Vinh Hy Bay`) instead of a location pin. Two safeguards prevent this:

1. The link builder must sanitize the name before building the URL — strip `(` `)` `,` `;` `&` (replace with spaces) and use the location endpoint `https://www.google.com/maps/search/?api=1&query=<encoded text>`. This endpoint always resolves to a single place. See `maps-link-fix.js`.
2. For any `mapsCity` list, also provide an explicit `links` object mapping each item name to its sanitized search URL. An explicit link always wins over the auto-generated one, so this guarantees correct behavior even if the helper is not yet patched.

### `mode`
Optional. Omit for default behavior.

| Value | Effect |
|-------|--------|
| omitted | Default — Consensus tab, Sources tab, and Vote tab all shown |
| `'facts'` | Factual/objective list — no voting, Sources tab only |
| `'scores'` | Composite-ranking list — `ai` ranking + read-only source chips, no voting (chain-city lists) |
| `'unranked'` | Unranked products — a curated, subjective set shown with no rank numbers, no consensus math, no voting |
| `'votes'` | Fan vote list — no Sources tab, no Rankings tab. The "Back to Rankings" button on the vote UI is automatically hidden for this mode since there are no rankings to return to. |

### `links`
Optional in general, but **required for `mapsCity` lists** (see the linking note under `linkType`). Maps item names to direct URLs. The key must match the exact item-name string, parenthetical and all. When a direct link exists, the site uses it instead of the auto-generated search link.

For product lists, point to specific Amazon URLs:
```javascript
links: {
  'Sony WH-1000XM6': 'https://amzn.to/XXXXXXX',
  'Bose QuietComfort Ultra': 'https://amzn.to/XXXXXXX',
}
```

For `mapsCity` lists, point to a sanitized Google Maps **search** URL (parentheses, commas, semicolons and ampersands removed, then URL-encoded; encode any apostrophe as `%27` so it is safe inside the single-quoted JS string):
```javascript
links: {
  'Amanoi (Vinh Hy Bay, Vietnam)': 'https://www.google.com/maps/search/?api=1&query=Amanoi%20Vinh%20Hy%20Bay%20Vietnam',
  'The Setai, Miami Beach': 'https://www.google.com/maps/search/?api=1&query=The%20Setai%20Miami%20Beach',
  "Red's Eats": 'https://www.google.com/maps/search/?api=1&query=Red%27s%20Eats',
}
```
Cover the union of all item names in the list — every name appearing in any source and in `vote.items`.

### `sources`
The expert publication rankings that drive Borda scoring. Rules:
- Always include the `ai` seed source (required by the data structure, ignored by scoring).
- **Use more than two sources whenever more exist — required, not optional.** Search broadly and gather every credible ranked/unordered list you can find before building; never settle for two if a third, fourth, or fifth is findable. Two sources is acceptable ONLY when you've genuinely confirmed no more exist (a niche brand/topic). More sources always produce a more reliable consensus.
- Each source list can have any number of items — not limited to 10.
- The source `label` is shown to users on the Sources tab. Include the year: `'Condé Nast Traveler 2024'` not just `'Condé Nast Traveler'`.
- Source IDs are internal only (e.g. `cntraveler`, `michelin`, `infatuation`).
- Sources must be **real and verifiable**. Do not invent rankings.
- Sources must be **recent** — published within the last 2–3 years. A 2019 ranking is not acceptable.
- Every item in every source must match the tier of the list (see Quality rules below).
- **Every list MUST carry a ranking element — at least one ordered source is mandatory** (the only exception is `mode: 'unranked'` lists, which are curated by hand and intentionally have no consensus math). A list whose sources are ALL unordered (every source flagged `"unordered": true`) is NOT allowed: with no rank signal the Borda math collapses to a frequency/alphabetical tally and the "By the Rankings" view becomes meaningless. When the editorial sources for a topic happen to all be unordered, add at least one platform-rating source that genuinely ranks the items:
  - **Pick the platform by category.** For **food & drink** — restaurants, coffee shops, bars, bakeries, cafés — **Yelp is the priority platform: always include it, and list it first.** **Google Reviews is the secondary platform and should be included too** — both are considered. (For non-food place lists — hotels, shops, attractions — lead with Google and add TripAdvisor where relevant.) Two rating platforms beat one; they balance each other, since Yelp typically runs about half a star below Google.
  - Order each platform source by aggregate rating (rating descending, review count as the tiebreak). Gather the ratings **live through the connected Chrome browser** — never from memory or search snippets (the same no-guessing rule used for chain-city lists). On Yelp, confirm you're reading the flagship listing (the one with the most reviews), not a stray duplicate — pull rating + review count from the business page when the search card is ambiguous.
  - Label each as an ordered source, e.g. `'Yelp · Ranked by Rating (May 2026)'` and `'Google Reviews · Ranked by Rating (May 2026)'`, and do NOT set `"unordered": true` on them.
  - Only include items already on the list (every item in a ranked source needs a `links` entry). It's fine to omit a place a platform has no real presence for.
  - After adding rating-based sources, re-seed `ai` and `vote.items` so they reflect the blended consensus (editorial frequency + Yelp + Google), not a single signal.
  - **Weighting caveat:** the Borda engine weights every source equally — it cannot give Yelp literally more pull than Google without a code change. "Yelp prioritized" is therefore implemented by always including Yelp (and listing it first) for food & drink. True numeric weighting would be an engine change, not a data change.
- **The Infatuation sources — order by their 0–10 score, never "unordered."** The Infatuation publishes a numeric review score (0–10, e.g. `8.4`) for nearly every restaurant, shown on each spot's page and in the guide imagery. Their roundup guides *look* unordered (the list order is editorial/geographic), but the scores ARE a ranking. So whenever an Infatuation guide is a source: pull each listed restaurant's individual 0–10 score (open the spot's review page or read it off the guide), and order the source by score, highest first. Do NOT flag an Infatuation source `"unordered": true` and do NOT trust the raw guide order. Note the basis in the label, e.g. `'The Infatuation Boston · Best Italian 2026 (by 0–10 score)'`. Ties: break by review recency or list order. If a spot genuinely has no published score, place it last or omit it.

### `vote.items`
Exactly 10 items. These seed the voting UI before live Supabase data loads. Must be the same quality tier as the expert sources.

---

## Content Rules

### "Best" means best — not cheapest

For hotels, products, restaurants, and any list where quality has a clear hierarchy:
- **Best = highest quality, most prestigious, most acclaimed.**
- Best does not mean best value. Best does not mean best for the budget traveler.
- A luxury hotel list must contain only luxury hotels. No Marriott Courtyard, no Holiday Inn, no Hilton Garden Inn — even if they top a TripAdvisor popularity ranking.
- A fine dining list must contain only fine dining. No fast casual, no chains, no "hidden gem" budget spots.
- If a source you want to use contains off-tier items, either drop that source or replace the off-tier items with appropriate ones before adding it.

### Nuanced "Best" categories

Some categories require a more considered definition of "best":

- **Dive bars:** Best means most authentic, most character, most storied — not fanciest. A "best dive bars" list should contain actual dive bars, not upscale cocktail bars.
- **Street food:** Best means most iconic, most beloved by locals — not most expensive.
- **Budget travel:** Best means best within the budget category.

Read the list title and apply the most natural definition of "best" for that specific category. When in doubt, ask.

### Hotels and resorts: five-star standard

For any list titled "Best Hotels," "Best Resorts," or similar accommodation list:
- **Default tier is five-star (or equivalent luxury).** This means Forbes Five-Star, AAA Five Diamond, Small Luxury Hotels of the World, Leading Hotels of the World, Relais & Châteaux, or independently acclaimed luxury properties of demonstrably equivalent product and service. No four-star chain hotels, no "boutique-but-budget," no properties that rank well on TripAdvisor popularity but don't meet the luxury threshold.
- **Exception for niche or underserved destinations.** In destinations where no five-star properties exist (a small island, a remote area), the best genuinely available, critically acclaimed properties qualify. Note this context in the blurb.
- Off-tier items contaminate the consensus for the whole list. When a source includes non-five-star properties, drop those items from the source before adding it — even if they rank highly in the publication's list.
- **Large resort complexes are not automatically five-star.** A sprawling all-inclusive or destination-resort-with-condos requires the same scrutiny: does it meet the luxury product and service standard, or is it just large and popular?

### Pricing as a quality signal for hotel and resort lists

Nightly rate is a meaningful proxy for hotel quality — properties that command the highest prices in a market do so because of superior product, service, and demand. Use live pricing as an additional Borda source:

- **Gather live rates 5–6 months out** using Google Hotels or a major booking site, through the connected Chrome browser — never from memory. Use the cheapest available room for a **Tuesday or Wednesday night** in a **non-holiday period** 5–6 months from today. To identify a safe date: count forward 5–6 months, then check that the chosen week is not within 7 days of a major holiday (US Thanksgiving, Christmas/New Year's, Easter, school spring break peak, local national holidays). If it lands too close to a holiday, move one week earlier or later.
- **Add an ordered `pricing` source** ranked by nightly rate descending (highest rate = rank 1). Label it `'Live Pricing · 5–6 Months Out (Month YYYY)'` — do NOT set `"unordered": true`.
- **No online rate for the date? Rank it in the UPPER HALF of the pricing source — do not omit it or rank it last.** Ultra-exclusive properties (Aman, Cheval Blanc, Eden Rock, Cap Juluca, many small Relais & Châteaux) often sell only direct/on-request and show "Contact this property" on Google Hotels with no bookable nightly rate. A missing OTA rate signals exclusivity, not cheapness, so these belong in the upper half of the price ranking. Place them beginning at the list's midpoint rank (e.g. rank 11 of 21), so they sit at the top-half boundary rather than being inflated above the most expensive *available* properties, and order them alphabetically among themselves. Never drop a no-rate property from the pricing source or sink it to the bottom — that would wrongly read as 'cheap.'
- **Tiebreak:** when two properties are editorially equivalent across other sources, the higher-priced one wins.
- **Cost-of-living adjustment for global-scope lists.** A $400/night room in Hanoi and a $400/night room in New York City represent radically different quality levels. For lists spanning multiple countries or regions with substantially different cost-of-living baselines (e.g., "Best Hotels in Asia," "Best Budget Resorts Worldwide"):
  - Express each property's rate as a **multiple of the local luxury floor** — i.e., the cheapest available five-star hotel in that same destination on the same date.
  - A hotel priced at 3× its local luxury floor is equivalent to one at 3× the New York luxury floor — both signal exceptional demand and quality within their market.
  - Rank the pricing source by this multiple, not by absolute dollar figure.
  - For single-region lists where all properties price in the same market context (e.g., Caribbean resorts, European ski chalets, Maldives overwater villas), this adjustment is not needed — absolute USD rates are directly comparable.
- **Caveat:** the pricing source carries equal Borda weight with any other source. It is one signal among several, not the whole answer. Always combine it with at least two editorial sources.
- **Displaying the nightly price (do NOT embed it in item names).** Store each item's nightly rate in a `prices` object on the list (`{ 'Jumby Bay Island (Antigua)': '$3,357/n', 'Eden Rock (St. Barths)': 'rate on request' }`) and let the UI append it. The price is shown ONLY when the pricing source is the selected view on the list page (via `priceDecorate` in `DetailClient`), never in the consensus view, the vote tab, the share poster, or the home-page tile. Item names themselves stay clean (`'Jumby Bay Island (Antigua)'`) so the price never leaks into other views and never becomes part of the link/vote key. Re-gathering prices then only touches the `prices` map, not every name.

### Source requirements

- Sources must be **real and verifiable**. Web-search to confirm they exist before adding them.
- Sources must be **recent** — within the last 2–3 years. Check the publication date.
- The source label must accurately name the source and year: `'The Infatuation NYC 2024'`, not `'The Infatuation'`.
- **Always use more than two sources when more are available — this is a hard rule, not a suggestion.** One source means no real consensus; two is weak and allowed only when no third credible source exists anywhere. Before finalizing ANY list, search broadly (editorial guides, local press, rated guides, reader polls, roundups) and add every credible source you find. For well-covered topics (city restaurant lists, popular products, big hotel brands) expect 4-6+ sources, not the bare minimum.
- Prefer authoritative sources: Michelin, Condé Nast Traveler, Travel + Leisure, Eater, The Infatuation, Robb Report, Forbes, Time Out, etc.

### Source item ordering — order is rank, so order it correctly

**The order of items inside each source IS its ranking.** Borda scoring reads position: the 1st item in a source array gets that source's top score, the 2nd gets the next, and so on. So the array order directly drives the consensus. Getting it wrong silently corrupts the result. Before saving any source, confirm its items are in true best-to-worst order.

**Verify the real published order — do not trust the order things appear in the article.** Many publications present spots in an order that is NOT their quality ranking. The on-page sequence may be editorial flow, neighborhood grouping, "newest additions first," or alphabetical. Always look for the publication's own ranking signal and sort by that:

- **The Infatuation (and any rated guide):** each spot carries a **numeric score** (e.g. `9.1`, `8.4`). The article frequently lists higher-scored spots *lower down the page* and vice-versa. **Order the source items by the numeric score, descending — never by the order they appear in the article.** Break ties by the on-page order. List unrated/unscored spots last. (This caught us once: Infatuation NYC showed Taqueria Ramirez at 9.1 far down the page while a 8.2 spot appeared near the top.)
- **Explicitly numbered lists** ("1. … 2. …", "The 20 best, ranked"): the numbers ARE the order — use them directly.
- **Alphabetical or unordered lists** (Texas Monthly's taco trail, many "10 best" roundups with no scores or numbers): the order carries **no quality signal**. Do one of: (a) find a different version of the list that is ranked, (b) drop the source, or (c) keep it but **label it as alphabetical/unordered in the source `label`** (e.g. `'Texas Monthly · 22 Best Taco Spots (alphabetical) 2026'`, `'The Points Guy (unordered roundup)'`) AND set `"unordered": true` on that source object (see the flat-scoring rule below). Never silently feed an alphabetical list in as if its order were a ranking.

### Unordered sources score FLAT, not by rank — set `"unordered": true`

When a source's order is NOT a ranking (alphabetical, "in no particular order," an unordered roundup, or a set of "best in class" picks), it must contribute **equal flat points to every item it lists** — never rank-decaying Borda points. Two requirements, both mandatory:

1. **Label it** so it's transparent: `(alphabetical)` or `(unordered roundup)` in the source `label`.
2. **Flag it** with `"unordered": true` on the source object. This is what actually changes the scoring — the label alone does nothing.

How the scoring works (implemented in `lib/helpers.js` `getSources` and `scripts/generate-og-images.js`):
- A **ranked** source gives `11 − rank` points: 10 to its #1, 9 to #2, … 1 to #10, 0 beyond.
- An **unordered** source (`"unordered": true`) gives every item it lists a **flat `5.5` points** (the constant `FLAT_UNORDERED`, the midpoint of the 1–10 scale) and 0 to items it doesn't list. So a spot on an unordered roundup counts as a solid mid-pack endorsement — enough to matter, but not enough on its own to top the consensus (real winners stack points across multiple *ranked* sources).
- To change the flat value, edit `FLAT_UNORDERED` in both files (keep them in sync).

Example (Four Seasons list): The Points Guy's worldwide "16 best" roundup is unordered, so it's labeled `'The Points Guy (unordered roundup)'` with `"unordered": true`; each of its 16 properties gets a flat 5.5, while the five genuinely-ranked sources drive the order.

**When unsure how a source is ordered, fetch the actual page and check** — look for scores, rank numbers, or an "in no particular order" disclaimer. If the page is paywalled or JavaScript-only and the real order cannot be read, follow the rule below.

### Never guess an order or a list

If a source is paywalled, renders as a JavaScript shell with no readable content, serves the wrong article body, or otherwise cannot be read, **do not reconstruct its list or its order from memory or from search snippets.** Either (a) obtain the list from another readable place, (b) drop that source, or (c) substitute a comparable readable source. Fabricated or guessed orderings are worse than one fewer source.

### Blocked-fetch domains (e.g. travelandleisure.com) — have the user paste the list

Some domains are on a **fetch blocklist** and return `HTTP 403 — "URL is on blocklist"`. This is a content-access restriction, not a rendering problem, so it applies to **every** retrieval method — `web_fetch`, the Chrome browser tools, and shell commands (`curl`/`wget`/Python) alike. Do **not** try to route around it with Chrome, archives, caches, or mirror sites; that is not permitted. (The Chrome browser is only for pages that genuinely load but render their content via JavaScript — not for blocklisted domains.)

The correct, rules-compliant workflow when a blocked page looks like a good source:
1. **Notify the user** that the page is blocked and can't be retrieved by any tool.
2. Ask them to **open it themselves and paste or screenshot** the relevant content (e.g. the ranked list) into the chat. Claude can read a pasted screenshot directly, so a screenshot of the list is perfectly fine.
3. Build the source from what they provide, and still set the source's `url` to the original page so its chip/button links there.

This is exactly how the **Travel + Leisure World's Best Awards 2025 hotel-brands** ranking was added to `best-luxury-hotel-brands-world` (T+L is blocklisted; the user pasted the top‑25, and the source links to the travelandleisure.com article). Known blocklisted domains so far: `travelandleisure.com`.

### Parenthetical context — REQUIRED, scaled to the list's geographic scope

Every item on a **location-based** list (restaurants, bars, hotels/resorts, beach clubs, schools, venues, etc.) MUST carry a geographic parenthetical. The **form** of that parenthetical depends on how wide the list's geography is — always give the reader the next level of detail beyond the list's own scope:

| List scope | Example list | Parenthetical form | Example item |
|------------|--------------|--------------------|--------------|
| **Neighborhood** | Best Dive Bars in Greenpoint; Best Cocktail Bars in SoHo | **none** | `'Spritzenhaus 33'`, `'Pegu Club'` |
| **City** | Best Pizza in NYC; Best Dive Bars in Atlanta | `(neighborhood)` | `'Lucali (Carroll Gardens)'`, `'Northside Tavern (West Midtown)'` |
| **Country / state / region** | Best Resorts in Turkey; Best Private Schools in Florida | `(neighborhood, city)` | `'Mandarin Oriental Bodrum (Yalıkavak, Bodrum)'`, `'Ransom Everglades School (Coconut Grove, Miami)'` |
| **World / continent** | Best Aman Resorts in the World; Best Beach Clubs on the Mediterranean | `(city, country)` | `'Amanpuri (Phuket, Thailand)'`, `'Nikki Beach (Saint-Tropez, France)'` |

Rules:
- **Neighborhood-scope lists take NO geographic parenthetical.** When the list's title already names a single neighborhood (e.g. `Best Dive Bars in Greenpoint`, `Best Cocktail Bars in the West Village`, `Best Dive Bars in the East Village`), every item is already in that neighborhood, so a `(neighborhood)` tag would just repeat the list scope. Leave these item names bare. Add a parenthetical only where one genuinely disambiguates two similarly-named spots, never as a blanket geographic tag.
- For every wider scope, this is **mandatory** for every location item, not just for disambiguation. A city-level list with bare names (`'Lucali'`) is incorrect — it must read `'Lucali (Carroll Gardens)'`.
- The parenthetical is part of the **canonical item name**: it must be byte-for-byte identical across the `ai` seed, every source's `items`, `vote.items`, and the keys of the `links` object. Build the Maps URL from the full `name + parenthetical`.
- **Non-location lists** (products, films, games, etc.) take no geographic parenthetical — use a clarifying parenthetical only where it genuinely helps (`'Tsuta (first Michelin-starred ramen)'`).
- Renaming an existing item (e.g. adding a parenthetical) **changes its fan-vote key** (`listId::item name`). When you retroactively re-parenthesize a list that already has votes, migrate each existing vote to the new name (re-post it under the new key) so the votes aren't orphaned.

Beyond geography, still be generous: add a parenthetical wherever it clarifies the item or disambiguates similar names (`'The Ritz-Carlton (South Beach)'` vs `'The Ritz-Carlton (Key Biscayne)'`).

### Naming & labeling conventions — addenda (learned in practice)

These refine how to apply the parenthetical rules above. They are universal — follow them on every list.

- **Strip a trailing comma-locator before adding the parenthetical.** If an item name already ends with a `", <place>"` locator (e.g. `'Perivolas, Santorini'`, `'Verbier, Switzerland'`, `'The Setai, Miami Beach'`), remove that trailing locator and replace it with the scaled parenthetical — `'Perivolas (Oia, Santorini)'`, `'Verbier (Valais, Switzerland)'`, `'The Setai (South Beach)'`. Never keep both the comma-locator and the parenthetical. (A genuine brand suffix that isn't a locator stays, e.g. `'Grace Hotel Santorini, Auberge Resorts Collection (Imerovigli, Santorini)'`.)

- **Don't duplicate a locale that's already in the name.** If the resort's own name already contains the locale the parenthetical would name, drop that element to avoid literal repetition. For **world/continent** scope `(city, country)`: when the city/island is in the name (`'Four Seasons Resort Bora Bora'`, `'Le Taha'a by Pearl Resorts'`, `'COMO Laucala Island'`), use just `(country)` → `'Four Seasons Resort Bora Bora (French Polynesia)'`. Use the full `(city, country)` only when the name does **not** already contain the city/island (`'The Brando (Tetiaroa, French Polynesia)'`). Minor repetition of the *country* alone is acceptable when it adds a finer locale (`'Six Senses Fiji (Malolo Island, Fiji)'`).

- **When the list's items are themselves places (towns/regions), shift one level finer.** A ski-resort list (`Best European Ski Resorts`) has towns as items, so the literal `(city, country)` would just repeat the item. Use `(region, country)` instead — the administrative region/canton/department/state: `'Verbier (Valais, Switzerland)'`, `'Courchevel (Savoie, France)'`, `'Kitzbühel (Tyrol, Austria)'`, `'Val Gardena (South Tyrol, Italy)'`.

- **Match the list's existing diacritic style.** If a list already ASCII-izes names (e.g. Turkish resorts written `Bodrum`, `Yalikavak`, `Ciragan`), use ASCII in the parentheticals too (`(Golturkbuku, Bodrum)`). If a list keeps diacritics (`Kitzbühel`, `Val d'Isère`), keep them in the parentheticals (`(Graubünden, Switzerland)`). The Maps link builder percent-encodes either correctly.

- **Collapse duplicate entries for the same property.** If two item strings refer to the same place (e.g. `'Laucala Island Resort, Fiji'` and `'COMO Laucala Island'` after an operator change), keep one canonical name across the whole list.

- **Migrate user-submitted "extras" too, via the admin endpoint.** Renaming a seed/source item to add a parenthetical orphans any matching row in the `extras` table (e.g. a fan-added `'The Newbury Boston'`). Rename the extra with the admin `POST /api/admin/extras/rename` (`{listId, oldName, newName}`), which **atomically moves the extra AND its aggregated vote score**. Because that RPC moves the vote, do **not** also re-post that item's vote through `/api/votes` — that would double-count. (Seed/source items that are *not* extras still migrate via `/api/votes` as described above.)

- **Items must match the list's defining geography.** Before re-parenthesizing, confirm every item actually belongs in the list's scope. A `Best Pacific Ocean Island Resorts` list must not contain Indian Ocean resorts (Maldives, Seychelles); remove off-geography items and rebuild the sources from verifiable, recent, correctly-ranked publications rather than leaving a mislabeled list.

- **Drop permanently-closed locations.** A "best" list must only contain places that are currently open. When working a list, verify open status (a quick web check — watch for "permanently closed" on Google/Yelp/Tripadvisor, or a closure announcement) and remove any closed item everywhere it appears: the `ai` seed, every source's `items`, `vote.items`, and the `links` keys. If the removed item was in the `ai` seed or `vote.items` (which should stay at 10), replace it with another currently-open, on-tier place so those stay at 10; removing it from a source alone just shortens that source, which is fine. (Example: Ensenada in Williamsburg closed Oct 2025 and was dropped from `tacos-nyc`.)

### Titles
- Must start with **Best**, **Most**, or **Top-Grossing**.
- Title case throughout.
- No clickbait or superlative stacking ("Most Incredible Best-Ever").

### Blurb
- 1–2 sentences. Specific, editorial, no filler.
- Good: `'Private pools, limestone karsts, and turquoise waters. The Andaman Sea and Gulf of Siam are home to Thailand's most coveted beachfront sanctuaries.'`
- Bad: `'A list of the best hotels in Thailand for luxury travelers looking for the best experience.'`

---

## Writing Style

Site-facing copy — blurbs, titles, categories, and any prose shown on a list page — follows these rules:

- **Never use the em dash (—) in site copy.** Not in blurbs, not in titles, not anywhere a reader sees. Replace it with a comma, colon, or period. A colon fits when the second part labels or summarizes the first (`Tonkotsu, shio, tsukemen: the Tokyo ramen counters most worth the queue`); a comma fits a trailing modifier (`ranked on sound and craft, not value`); a period fits two independent clauses (`A sense of place raised to an art. Rosewood Hong Kong was named the world's best hotel for 2025.`). Hyphens (`-`) in compound words are fine.
- **Chain-city composite lists use parentheticals like every other list.** Chain item names are `address (neighborhood)` (e.g. `129 W 48th St (Midtown)`), NOT em-dash separators. The composite score is NOT part of the name (see the chain section below). So the em-dash ban applies to chain names too.

---

## Affiliate Links

### Amazon products
- Use `linkType: 'amazon'` for all physical product lists.
- The site auto-generates Amazon search links using the affiliate tag `cgurus-20`.
- Auto-generated search URL format: `https://www.amazon.com/s?k=PRODUCT+NAME&tag=cgurus-20`
- For direct product links (better for conversion), use the ASIN: `https://www.amazon.com/dp/ASIN?tag=cgurus-20`
- Store direct links in the `links` object, keyed by the exact item name string.
- If direct links are not available yet, omit the `links` object and add them later.

### Amazon reviews as a ranking source (product lists)
- **Every product list (`linkType: 'amazon'`) should include an Amazon-ratings source as a ranking element**, the same way food & drink lists use Yelp/Google. Amazon star ratings are the buyer-consensus signal for products.
- Gather each product's **Amazon star rating (out of 5) and review count live** through the connected Chrome browser (search the product, open the listing) — never from memory. Order the source by rating descending, then review count as the tiebreak. (A 4.7 with 30,000 ratings outranks a 4.7 with 200.)
- Label it `'Amazon Reviews · Ranked by Rating (May 2026)'` and do NOT flag it `"unordered"`.
- Combine it with editorial "best of" review sources (Wirecutter, Good Housekeeping, CNET, Serious Eats, Reviewed, etc.). Re-seed `ai` and `vote.items` to reflect the blend of editorial picks + Amazon rating, not a single signal.
- This applies to physical products (air fryers, headphones, etc.) and to product-style media sold on Amazon (cookbooks, books) where an Amazon rating exists.

---

## Per-entry hover link menu (`itemLinks`)

**Scope: location-based lists only** (hotels, resorts, restaurants, bars, cafes, beach clubs, venues, and any other place a person physically visits). Non-location lists (products, films, TV, games, books, music, factual rankings, etc.) do NOT get the hover menu, since Map / Website / photo links are meaningless for them. Simply do not add `itemLinks` to those lists.

A location-based list opts into the list-page hover menu by adding an `itemLinks` object mapping each exact item name to its official **Website** URL (gathered live, never guessed). When present, hovering a ranked entry reveals: **Website** (from `itemLinks`), **Map** (the existing `mapsCity` link), and a category-specific "pics" group built automatically from the item name + neighborhood:

- **Food / restaurants (default):** label `Food Pics:` with `Yelp` and `Google`.
- **Hotels / resorts** (`type: 'travel'`, or a `travel`/`luxury` tag): label `Property Pics:` with `TripAdvisor` and `Google`.
- **Bars** (`bars`/`nightlife` tag): label `Pics:` with `Yelp` and `Google`.

The `Google` link defaults to Google **Image** search (`&tbm=isch`) so it lands on photos directly, not a web-results page. Only the Website per item needs gathering; Map / Yelp / Google / TripAdvisor are constructed from the name. Implemented in `buildAuxLinks` and `entryPicsConfig` in `app/list/[id]/DetailClient.jsx`. The reveal uses a generous `max-height` so wrapped chips are not clipped on mobile.

## Common Mistakes to Avoid

- **Do not** use `booking` as a linkType — it is not used. All places use `mapsCity`.
- **Do not** treat the `ai` seed source as a real source — it is excluded from Borda by design.
- **Do not** use `mode: 'facts'` on a list that should have voting.
- **Do not** include off-tier items in any source — one bad source contaminates the entire consensus.
- **Do not** include non-five-star properties on a hotel or resort list unless the destination genuinely has no five-star options.
- **Do not** use absolute nightly rate for cross-region pricing comparisons — normalize against the local luxury floor when regions have very different cost-of-living baselines.
- **Do not** invent source rankings — research real ones.
- **Do not** order a source by the order spots appear in the article when the publication ranks by score or number — order Infatuation and other rated guides by their **numeric score, descending**.
- **Do not** feed an alphabetical or unordered list in as if its order were a quality ranking — find a ranked version, drop it, or label it `(alphabetical)` in the source name.
- **Do not** reconstruct a paywalled or JavaScript-only source's list/order from memory or search snippets — get it elsewhere, drop it, or substitute a readable source.
- **Do not** use sources older than 2–3 years.
- **Do not** under-tag — apply every tag that reasonably fits.
- **Do not** omit `publishedDate`.
- **Do not** seed `vote.items` with items that would be off-tier for the list.
- **Do not** leave item names ambiguous when a parenthetical would help.
- **Do not** ship a `mapsCity` list without an explicit `links` object — the raw parenthetical name makes Google Maps open driving directions instead of a location pin.
- **Do not** build a Maps URL by pasting the raw item name. Strip `(` `)` `,` `;` `&` first and use `https://www.google.com/maps/search/?api=1&query=...`.
- **Do not** forget to encode an apostrophe as `%27` in a link URL — a literal `'` breaks the single-quoted JS string.

---

## Deploy — Claude pushes directly via the stored PAT (DEFAULT)

Claude deploys by pushing the new `lib/data.js` straight to `origin/main` using a stored fine-grained
Personal Access Token. The repo now lives **outside OneDrive** (`C:\dev\consensus-gurus`), which is what
makes direct sandbox pushes reliable: the OneDrive mount used to block ref updates and `.git/index.lock`
removal, and moving off it removes that blocker. Vercel auto-deploys on push (~1 minute).

**Direct push by Claude is the ONLY default deploy path. Do NOT use GitHub Desktop except as a true
last-resort emergency if the push pipeline itself is broken.** Claude carries out the push itself rather
than handing it back to the user.

### Session-start preflight (run this first, every new chat)

1. Confirm the connected folder is `C:\dev\consensus-gurus` — the repo that actually contains `.git` and
   `lib/data.js`. It is NOT the OneDrive "Consensus Gurus" project folder (that one has no `.git` and is the
   wrong target). The connection persists between sessions; re-connect via the folder picker if it dropped.
2. Verify the git mount is healthy BEFORE touching anything: in the bash mount run
   `cd /sessions/<session>/mnt/consensus-gurus && GIT_DISCOVERY_ACROSS_FILESYSTEM=1 git rev-parse HEAD`.
   If that errors, or `ls .git` shows nothing (the known "broken mount" state where `.git` isn't exposed to
   the sandbox), **restart the session** so the mount remaps cleanly, then re-check. Never push from a
   half-mounted state — the commit could be based on stale or empty tree state.
3. So the bash/git/web steps don't pause for an approval click, run the session in **"Act without asking"**
   mode (mode selector on the chat input, or set it as the default in Settings > Cowork). File deletions
   still prompt by design and can't be turned off.

Then run the push procedure below.

### One-time setup (already in place)

- **Repo connected to Cowork:** `C:\dev\consensus-gurus` (re-connect it at the start of a session if needed).
- **`.deploy-secrets`** holds the PAT and config and lives OUTSIDE the repo so it is never committed. Format:
  `GITHUB_PAT=...`, `GITHUB_REPO=consensusgurus/consensus-gurus`, `GITHUB_DEFAULT_BRANCH=main`,
  `GIT_AUTHOR_NAME=...`, `GIT_AUTHOR_EMAIL=...`. Keep it readable from a connected folder (the Projects folder,
  or a gitignored copy in the repo root). Never commit it.

### The procedure (run in the bash mount of the repo)

Never run `git add` / `git commit` (they touch the index and can jam on a `.git/index.lock`). Use git
plumbing on the object store and refs instead:

```bash
set -e
cd /sessions/<session>/mnt/consensus-gurus            # bash mount of C:\dev\consensus-gurus
source "/path/to/.deploy-secrets"                     # load GITHUB_PAT, GITHUB_REPO, etc.

# 1. Base the new commit on origin/main (a direct push does not move local refs, so always fetch first).
git fetch "https://${GITHUB_PAT}@github.com/${GITHUB_REPO}.git" "${GITHUB_DEFAULT_BRANCH}"
BASE_COMMIT=$(git rev-parse FETCH_HEAD)
git show ${BASE_COMMIT}:lib/data.js > /tmp/data_orig.js

# 2. Build the new lib/data.js (splice the new entry in before the closing '];' of LISTS), then:
node --check /tmp/new_data.js                         # non-negotiable syntax check

# 3. blob -> tree -> tree -> commit -> push, all based on $BASE_COMMIT.
NEW_BLOB=$(git hash-object -w /tmp/new_data.js)
LIB_TREE_SHA=$(git ls-tree $BASE_COMMIT lib | awk '{print $3}')
NEW_LIB_TREE=$(git ls-tree $LIB_TREE_SHA | awk -v b="$NEW_BLOB" '{ if ($4=="data.js") print $1" "$2" "b"\t"$4; else print $1" "$2" "$3"\t"$4 }' | git mktree)
NEW_TOP_TREE=$(git ls-tree $BASE_COMMIT  | awk -v t="$NEW_LIB_TREE" '{ if ($4=="lib")     print $1" "$2" "t"\t"$4; else print $1" "$2" "$3"\t"$4 }' | git mktree)
NEW_COMMIT=$(GIT_AUTHOR_NAME="$GIT_AUTHOR_NAME" GIT_AUTHOR_EMAIL="$GIT_AUTHOR_EMAIL" \
             GIT_COMMITTER_NAME="$GIT_AUTHOR_NAME" GIT_COMMITTER_EMAIL="$GIT_AUTHOR_EMAIL" \
             git commit-tree $NEW_TOP_TREE -p $BASE_COMMIT -m "Add <list name>")

# 4. Push straight to origin/main via Smart HTTP. (api.github.com REST is blocked; only this push works.)
git -c credential.helper= push "https://${GITHUB_PAT}@github.com/${GITHUB_REPO}.git" "$NEW_COMMIT:refs/heads/${GITHUB_DEFAULT_BRANCH}"
```

To commit more than `lib/data.js` in one push (e.g. updating this file too), add each changed file as its own
blob and fold it into the tree the same way before `commit-tree`.

**Critical: always use two separate steps to build the new lib tree** — never combine them into one pipe, or you get a double-nested `lib/lib/` tree that breaks Vercel:

```bash
# CORRECT — two steps:
LIB_TREE_SHA=$(git ls-tree $BASE_COMMIT lib | awk '{print $3}')       # get SHA of lib tree
NEW_LIB_TREE=$(git ls-tree $LIB_TREE_SHA | awk -v b="$NEW_BLOB" \
  '{ if ($4=="data.js") print $1" "$2" "b"\t"$4; else print $1" "$2" "$3"\t"$4 }' | git mktree)

# WRONG — one combined pipe (git ls-tree $BASE_COMMIT lib returns the lib entry itself, not its contents):
# LIB_TREE=$(git ls-tree $BASE_COMMIT lib | awk ... | git mktree)   ← DO NOT DO THIS
```

### Notes & fallback

- **Repo reads can lag right after an edit.** Trust `git show HEAD:lib/data.js` (or `FETCH_HEAD:lib/data.js`)
  over `cat` when verifying repo content.
- **If a fresh session's bash mount looks broken** right after the folder was moved or re-connected (can't see
  `.git` or subfiles, contradictory `ls`), restart the session so the mount remaps cleanly before pushing.
- **GitHub Desktop — emergency only.** Not a normal path. Use it solely if the direct-push pipeline is down
  (e.g. PAT revoked, GitHub Smart HTTP unreachable): edit `lib/data.js`, save, then in GitHub Desktop commit
  to `main` and push origin. Otherwise always push directly per the procedure above.

## Full Example List Entry

```javascript
{
  id: 'cocktails-west-village',
  publishedDate: '2026-05-27',
  title: 'Best Cocktail Bars in the West Village',
  category: 'New York',
  type: 'food',
  tags: ['bars', 'nightlife', 'food-drink', 'stores', 'entertainment'],
  linkType: 'mapsCity',
  blurb: 'Intimate rooms, serious bartenders, and menus that reward attention. The West Village does cocktails better than almost anywhere.',
  defaultSource: 'ai',
  sources: {
    ai: {
      label: 'Consensus Seed',
      items: [
        'Dante NYC',
        'Employees Only',
        'The Nines',
        'Slowly Shirley',
        'Bar Pisellino',
        'Little Branch',
        'Amor y Amargo',
        'Clover Club (Brooklyn)',
        'The Up & Up',
        'Attaboy',
      ],
    },
    infatuation: {
      label: 'The Infatuation NYC 2024',
      items: [
        'Dante NYC',
        'Employees Only',
        'Bar Pisellino',
        'Little Branch',
        'Amor y Amargo',
        'The Nines',
        'Slowly Shirley',
      ],
    },
    timeout: {
      label: 'Time Out New York 2024',
      items: [
        'Employees Only',
        'Dante NYC',
        'Little Branch',
        'Slowly Shirley',
        'The Up & Up',
        'Amor y Amargo',
        'Bar Pisellino',
        'The Nines',
      ],
    },
    eater: {
      label: 'Eater NY Cocktail Bar Map 2024',
      items: [
        'Dante NYC',
        'Bar Pisellino',
        'Employees Only',
        'Amor y Amargo',
        'Little Branch',
        'Slowly Shirley',
        'The Nines',
        'Attaboy',
      ],
    },
  },
  vote: {
    items: [
      'Dante NYC',
      'Employees Only',
      'Bar Pisellino',
      'Little Branch',
      'Amor y Amargo',
      'The Nines',
      'Slowly Shirley',
      'The Up & Up',
      'Attaboy',
      'White Lyan',
    ],
  },
},
```

---

## Quick Reference Card

| Question | Answer |
|----------|--------|
| Amazon affiliate tag | `cgurus-20` |
| linkType for restaurants and bars | `mapsCity` |
| linkType for US hotels | `mapsCity` |
| linkType for international hotels | `mapsCity` |
| Maps URL format | `https://www.google.com/maps/search/?api=1&query=...` |
| Do `mapsCity` lists need an explicit `links` object? | Yes — always, to avoid the directions bug |
| Characters to strip from a Maps query | `(` `)` `,` `;` `&` (replace with spaces) |
| How to encode an apostrophe in a link URL | `%27` |
| linkType for products | `amazon` |
| Minimum sources | Use ALL credible sources you can find — never stop at 2 if more exist. 3+ required when available; 4-6+ for well-covered topics. |
| Source list length | Any number of items |
| How do I order items within a source? | By the source's true rank — score descending (Infatuation) or its numbers. Never article order. |
| Source has scores but lists them out of order? | Sort by numeric score, descending; ties keep page order; unrated last. |
| Source is alphabetical/unordered? | Find a ranked version, drop it, or label it `(alphabetical)`/`(unordered roundup)` AND set `"unordered": true` (flat 5.5 pts/item, not ranked). |
| Source paywalled or JS-only / unreadable? | Don't guess — get it elsewhere, drop it, or substitute. |
| Consensus output length | Always exactly 10 |
| Is the seed (`ai`) source used in scoring | No — excluded from Borda |
| Fan vote weight | 0.75x one publication |
| City-level items need parentheses? | Optional but encouraged for neighborhoods |
| Country/world-level items need parentheses? | Yes — always include city or country |
| Can a luxury list include mid-tier hotels? | Never |
| What tier for hotel/resort lists? | Five-star default (Forbes 5-star, AAA 5-diamond, SLH, LHW, R&C, or demonstrably equivalent). Exception only for destinations with no five-star options. |
| Large resort complex = five-star? | Not automatically — must meet the luxury product/service standard, not just be large or popular. |
| Use pricing as a rank input for hotels? | Yes — live rates 5–6 months out, non-holiday Tuesday or Wednesday, ordered descending as a `pricing` Borda source. |
| How to pick a non-holiday pricing date? | Count 5–6 months forward, confirm the chosen week is ≥7 days from any major holiday (Thanksgiving, Christmas/New Year's, Easter, spring-break peak). Move a week if needed. |
| Pricing comparison across global regions? | Use rate-as-multiple-of-local-luxury-floor (not absolute USD) when regions have very different cost-of-living baselines. Not needed for single-region lists (Caribbean, European ski, etc.). |
| How recent must sources be? | Within 2–3 years |
| Should I over-tag or under-tag? | Always over-tag |

---

## Single-City Chain Ranking Lists (e.g. "Best-Run Chipotle in Manhattan")

A different kind of list: instead of ranking *different* restaurants by editorial acclaim, this ranks the *individual locations of one chain* within a city by how well each is run, using customer-rating platforms as the sources. The first one built was `best-run-chipotle-manhattan`. These lists follow their own rules, which differ from the editorial-source lists above.

### What "best" means here
"Best-run" = highest customer satisfaction across rating platforms (food quality, accuracy, speed, cleanliness, service). It is measured, not editorial. There are no Michelin/Eater/Infatuation sources — the rating platforms themselves are the sources.

### Sources = rating platforms, each ranked by its own star rating
- Use the major per-location rating platforms: **Google Maps** and **Yelp** are the reliable, accessible two. Each platform becomes one source; within a source, order the locations by that platform's star rating, descending, with review count as the tiebreak.
- **Gather the data live through the connected Chrome browser**, not from memory or search snippets (the no-guessing rule applies just as hard here):
  - **Google Maps:** search `Chipotle` with the map centered on the city (URL form `https://www.google.com/maps/search/Chipotle/@LAT,LNG,13z`). Pan to a few neighborhoods (downtown / midtown / uptown) because Maps only returns ~11–20 nearest results per view. Extract each result's rating, review count, and street address from the results feed. Exclude results from other cities/boroughs that bleed in (check the address).
  - **Yelp:** the search cards show only the neighborhood, not the street address, so they cannot be matched to a Google address directly. Instead open each location's **business page** — the page `<title>` contains the exact address and review count (e.g. `… 180 Reviews - 620 9th Ave, New York …`), and the star rating is in the `[aria-label$="star rating"]` element. Resolve every location's Yelp listing to its real address this way before attributing a rating. Searching Yelp by a specific street address returns the *nearest* store as result #1, which is often a different nearby branch — always confirm via the business-page title, never trust nearest-result matching.

### Sources that don't work for this (learned in practice)
- **TripAdvisor:** does not maintain per-location pages for fast-food chains — it had a single citywide "Chipotle" listing for all of NYC. Unusable for ranking individual locations. Drop it.
- **Uber Eats:** hard anti-bot challenge (CAPTCHA) on the search page. Do **not** attempt to bypass bot detection — drop it.
- **DoorDash:** reachable, but its search surfaces only one aggregated store per chain per delivery address and requires setting an address per query, so per-store enumeration by address is unreliable. Drop it unless a clean per-store-by-address path appears.
- **Bing / Apple Maps:** Bing local ratings tend to mirror other platforms; Apple Maps has no clean web surface. Not worth it.
- If only two solid platforms (Google + Yelp) are obtainable, that is acceptable for this list type — better two real, correctly-attributed sources than a third faked or mis-attributed one.

### Composite score (the headline number)

Chain item names are clean parentheticals like every other list (`'129 W 48th St (Midtown)'`), never em-dash separators and never with the score in the name. The per-location composite score is stored in a `scores` object on the list (`{ '129 W 48th St (Midtown)': '7.8' }`) and rendered ONLY on the list page (via `scoreDecorate` in `DetailClient`), appended into the parenthetical as `(Midtown; 7.8)`. It never appears on the home-page tile or the share poster, and is never part of the item name / link key. Re-scoring then only touches the `scores` map, not the names.

### Composite score (the headline number)
Each location displays a single **composite score on a 0–10 scale**, computed from the platform ratings. Two methods, pick per request:
- **Volume-weighted (default):** `composite = ((G·Gn) + (Y·Yn)) / (Gn + Yn) × 2`, where G/Y are the star ratings and Gn/Yn the review counts. Because Google usually has ~10× Yelp's review volume, this tracks Google