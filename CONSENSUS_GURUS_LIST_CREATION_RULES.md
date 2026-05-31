# Consensus Gurus — List Creation Rules

Paste this entire document into a new conversation before asking for list help.

---

## Site Overview

**consensusgurus.com** — a Next.js 14 app hosted on Vercel. Curated top-ten lists ranked by Borda consensus across multiple expert sources. Magazine aesthetic: cream paper background (`#f4ede0`), Fraunces serif headlines, DM Sans/DM Mono body, red accent (`#c0392b`).

**Data file to edit (the ONE canonical, live source):** `C:\Users\mhmen\OneDrive\Desktop\cg\files\consensus-gurus\consensus-gurus\lib\data.js` — this is the file inside the git repo that deploys to Vercel. All list edits go here.

> **⚠️ Two folders, one source of truth — read this first on every new session.**
> There are two Consensus Gurus folders on this machine, and only one is live:
> 1. **The git repo (LIVE):** `C:\Users\mhmen\OneDrive\Desktop\cg\files\consensus-gurus\consensus-gurus` — `lib/data.js` here is what deploys. **Always edit this one.**
> 2. **The Projects folder (reference only):** `C:\Users\mhmen\OneDrive\IDS Excel Files\Claude\Projects\Consensus Gurus` — holds this rules doc and `.deploy-secrets`. Any `data.js` / `data.js.bak` here is a **stale, non-canonical copy — do NOT edit it and do NOT treat it as the live data.** It can lag the live site by days.
>
> **First step on every new list / restart:** mount the LIVE repo with the directory-access tool using the path in #1 (Cowork sessions often start with only the Projects folder connected). Confirm you're on the live data by checking it against `consensusgurus.com` — e.g. `git show HEAD:lib/data.js` in the bash mount, or open the list URL — before editing. Then edit `lib/data.js` in the repo.

**GitHub Desktop** is used to commit and push. After editing `lib/data.js` locally, open GitHub Desktop, write a commit message, click "Commit to main", then "Push origin". Vercel auto-deploys on push (~1 minute).

**Supabase** stores live votes and view counts. The site fetches them on page load via `fetchBootstrap()`.

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

**Key implication:** If an important item is missing from the consensus, the fix is always to improve the expert source data — ensure the item appears in multiple sources at appropriate rank positions. Fan votes alone (at 0.75x) cannot overcome a weak showing across publications.

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
| `'votes'` | Fan vote list — no Sources tab |

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

## Common Mistakes to Avoid

- **Do not** use `booking` as a linkType — it is not used. All places use `mapsCity`.
- **Do not** treat the `ai` seed source as a real source — it is excluded from Borda by design.
- **Do not** use `mode: 'facts'` on a list that should have voting.
- **Do not** include off-tier items in any source — one bad source contaminates the entire consensus.
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

## Deploy Workflow — GitHub Desktop (DEFAULT, standing convention)

**The user deploys via GitHub Desktop. This is the default for this deploy and all future deploys.** The flow:

1. Claude builds the `lib/data.js` change on the latest `origin/main` (validated with `node --check`, written to the repo file, verified with the Read/Grep tools) and tells the user it's ready.
2. The user opens **GitHub Desktop** — the changed `lib/data.js` already appears under "Changes."
3. The user writes a commit message, clicks **Commit to main**, then **Push origin**. Vercel auto-deploys (~1 minute).

Why GitHub Desktop is the default: the user's terminal pushes freeze on the Windows Credential Manager popup, and the Cowork bash sandbox cannot push to the OneDrive-mounted repo at all. GitHub Desktop handles auth cleanly and avoids both problems. Claude should NOT hand over `git commit`/`git push` terminal commands unless the user explicitly asks for the terminal path.

**Things that are NOT part of the GitHub Desktop push** (they hit the live site's API, not the repo) and that Claude still handles or hands off each batch:
- **Fan-vote migration** when items are renamed — re-post each old vote under the new `listId::item` key via `/api/votes` (±3 chunks). Claude can do this through the user's connected Chrome browser (page-context `fetch`), or hand the user `curl` commands. CAUTION: a blocked browser-JS result may still have executed — verify the resulting score and correct any double-post with a negative delta.
- **Extras rename** via the admin `POST /api/admin/extras/rename` (needs the user logged into admin in the browser; that RPC moves the vote too, so don't also re-post it via `/api/votes`).

A `gc.auto 0` setting was applied to the repo to stop the git garbage-collection loop that OneDrive triggers; leave it off.

### (Legacy / not used) Claude pushes directly via PAT

The PAT-based direct-push path below is retained for reference only. It does not work from the Cowork sandbox (the OneDrive mount blocks ref updates and `.git/index.lock` removal), so Claude does NOT use it. Deploy via GitHub Desktop (above).

### One-time setup the user has already done

1. The repo folder is connected to Claude as a Cowork directory:
   `C:\Users\mhmen\OneDrive\Desktop\cg\files\consensus-gurus\consensus-gurus`
2. A fine-grained Personal Access Token (PAT) with `contents: read+write` for `consensusgurus/consensus-gurus` is saved at:
   `C:\Users\mhmen\OneDrive\IDS Excel Files\Claude\Projects\Consensus Gurus\.deploy-secrets`
   (Lives outside the git repo so it's never committed. Format: `GITHUB_PAT=...`, `GITHUB_REPO=...`, etc.)

### Claude's deploy procedure (every new list, every new conversation)

**STEP 0 — FIRST ACTION, before any research or editing.** At the very start of any deploy request, Claude connects the repo and enables delete, so the end-of-deploy local sync always works:

1. Connect the repo folder as a Cowork directory (request it if not already mounted):
   `C:\Users\mhmen\OneDrive\Desktop\cg\files\consensus-gurus\consensus-gurus`
2. Pre-enable file-delete permission for that folder via the allow-delete tool (target `<repo>/.git/index.lock`). Doing this up front avoids a mid-deploy failure where `git reset --hard` cannot unlink files and leaves a stale lock.

Do Step 0 first every time. It is cheap, idempotent, and makes the automatic local sync (step 6) reliable.

The bash sandbox in Cowork has two quirks that matter here. The deploy procedure works around both.

**Quirk 1 — Bash mount of the OneDrive-synced repo is stale.** When Claude writes to `lib/data.js` via the Edit tool, the file IS updated on disk (the host-side Read tool shows the full new content). But the bash sandbox sees a truncated, cached view of the file. Do NOT trust `cat lib/data.js` or `wc -l lib/data.js` from bash — use `git show HEAD:lib/data.js` instead, which reads from the git object store and is always correct.

**Quirk 2 — `.git/index.lock` cannot be removed from the bash sandbox once it gets created.** OneDrive's Windows filesystem driver blocks the Linux sandbox from unlinking the lock file, which then jams every subsequent `git add` / `git commit`. Therefore: NEVER run `git add` or `git commit` in this repo from bash. Use git plumbing commands instead (`git hash-object`, `git mktree`, `git commit-tree`, `git push <new-commit>:refs/heads/main`), which operate on the object store and refs and never touch the index.

### The exact procedure

```bash
set -e
cd /sessions/<session>/mnt/consensus-gurus     # path varies per session; bash mount of the repo

# Load PAT and config
source "/sessions/<session>/mnt/Consensus Gurus/.deploy-secrets"   # path of the Projects folder mount

# 1. Get the current lib/data.js. Source of truth is origin/main, NOT local HEAD.
#    Claude's pushes go straight to origin/main without updating the local refs/heads/main,
#    so on the second push of a session the local HEAD is stale by one or more commits.
#    Always fetch origin/main first and base the new commit on FETCH_HEAD.
git fetch "https://${GITHUB_PAT}@github.com/${GITHUB_REPO}.git" "${GITHUB_DEFAULT_BRANCH}"
BASE_COMMIT=$(git rev-parse FETCH_HEAD)
git show ${BASE_COMMIT}:lib/data.js > /tmp/data_orig.js

# 2. Build the new file content (insert your new entry before the closing '];' of LISTS).
#    Use python to find the exact pattern '\n];\n\nexport ' and splice the entry in.
python3 << 'PYEOF'
with open('/tmp/data_orig.js', 'r', encoding='utf-8') as f:
    content = f.read()
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
new_entry = """
  /* ----- NEW LIST COMMENT ----- */
  {
    id: 'new-list-id',
    publishedDate: 'YYYY-MM-DD',
    publishedAt: '<NOW from above>',     // REQUIRED — otherwise the list won't sort as most recent
    ...
  },
"""
target = "\n];\n\nexport "
idx = content.find(target)
assert idx > 0
new_content = content[:idx] + "\n" + new_entry.lstrip("\n").rstrip() + "\n];\n\nexport " + content[idx + len(target):]
with open('/tmp/new_data.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(new_content)
PYEOF

# 3. Syntax-check before pushing — non-negotiable.
node --check /tmp/new_data.js

# 4. Plumbing: blob → tree → tree → commit → push. Base everything on $BASE_COMMIT (origin/main).
NEW_BLOB=$(git hash-object -w /tmp/new_data.js)
LIB_TREE_SHA=$(git ls-tree $BASE_COMMIT lib | awk '{print $3}')
NEW_LIB_TREE=$(git ls-tree $LIB_TREE_SHA | awk -v b="$NEW_BLOB" '{ if ($4=="data.js") print $1" "$2" "b"\t"$4; else print $1" "$2" "$3"\t"$4 }' | git mktree)
NEW_TOP_TREE=$(git ls-tree $BASE_COMMIT  | awk -v t="$NEW_LIB_TREE" '{ if ($4=="lib")     print $1" "$2" "t"\t"$4; else print $1" "$2" "$3"\t"$4 }' | git mktree)
NEW_COMMIT=$(GIT_AUTHOR_NAME="$GIT_AUTHOR_NAME" GIT_AUTHOR_EMAIL="$GIT_AUTHOR_EMAIL" \
             GIT_COMMITTER_NAME="$GIT_AUTHOR_NAME" GIT_COMMITTER_EMAIL="$GIT_AUTHOR_EMAIL" \
             git commit-tree $NEW_TOP_TREE -p $BASE_COMMIT -m "Add <new list name>")

# 5. Push the new commit directly to refs/heads/main on origin.
#    This pushes the new commit AND any prior local commits that haven't been pushed yet.
git -c credential.helper= push "https://${GITHUB_PAT}@github.com/${GITHUB_REPO}.git" "$NEW_COMMIT:refs/heads/${GITHUB_DEFAULT_BRANCH}"
```

After the push, Vercel auto-deploys in about a minute. Verify at `consensusgurus.com/list/[new-list-id]`. (Newly added list slugs may serve a stale "List not found" edge cache for a minute or two; a fresh request with a cache-busting `?v=N` query confirms the page once the build is live.)

# 6. Sync the user's local clone (final step — see "Keeping the user's local repo in sync" below).
#    With the repo folder connected and delete permission granted:
#      cd "$REPO" && git fetch "$AUTH_URL" "$GITHUB_DEFAULT_BRANCH" && git reset --hard FETCH_HEAD
#    The user no longer runs any manual catch-up commands.

Important: the network allowlist permits `github.com` but blocks `api.github.com` and `raw.githubusercontent.com`. Do not try to push via the REST API — only Smart HTTP push (the snippet above) works.

### Keeping the user's local repo in sync — Claude does this automatically

Claude pushes straight to `origin/main`, so the user's local `main` would otherwise fall behind after every deploy. **Claude now syncs the local clone itself as the final step of every deploy.** The user does NOT need to run any catch-up commands.

Two one-time prerequisites must be in place (set up once per machine/session):

1. **The repo folder is connected to Claude as a Cowork directory:**
   `C:\Users\mhmen\OneDrive\Desktop\cg\files\consensus-gurus\consensus-gurus`
   If it is not mounted in the current session, Claude requests it with the directory-access tool before deploying.
2. **File-delete permission is granted for that folder.** This is the key that makes local sync work. Without it, the OneDrive mount blocks the Linux sandbox from unlinking working-tree files and `.git/*.lock`, so `git reset --hard` fails midway (`unable to unlink ... Operation not permitted`) and leaves a stale `.git/index.lock`. With delete enabled, a normal reset completes cleanly. Claude triggers the allow-delete tool automatically the first time an unlink hits "Operation not permitted".

**Sync procedure Claude runs after each push** (in the bash mount of the repo):

```bash
REPO=/sessions/<session>/mnt/consensus-gurus
cd "$REPO"
git fetch "https://${GITHUB_PAT}@github.com/${GITHUB_REPO}.git" "${GITHUB_DEFAULT_BRANCH}"
git reset --hard FETCH_HEAD
# verify: HEAD == the pushed commit, `git status` clean, no leftover .git/index.lock
ls .git/index.lock 2>/dev/null && rm -f .git/index.lock   # only if one lingered
```

With delete permission enabled this leaves the working tree, index, and HEAD all matching origin — `git status` reports "up to date with origin/main" and a clean tree.

**Fallback (only if the repo folder is not connected in a session):** the user runs, in their Git for Windows / PowerShell terminal:

```
git fetch origin
git reset --hard origin/main
```

If a stale `.git/index.lock` ever blocks that (from an interrupted sandbox op without delete permission), remove it first:

```
Remove-Item "C:\Users\mhmen\OneDrive\Desktop\cg\files\consensus-gurus\consensus-gurus\.git\index.lock" -Force
```

### Fallback: GitHub Desktop (if Claude's push fails)

1. Edit `lib/data.js` at: `C:\Users\mhmen\OneDrive\Desktop\cg\files\consensus-gurus\consensus-gurus\lib\data.js`
2. Save the file.
3. Open **GitHub Desktop** — `lib/data.js` will appear as a changed file.
4. Write a commit message.
5. Click **Commit to main**, then **Push origin**.
6. Vercel auto-deploys.

---

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
Each location displays a single **composite score on a 0–10 scale**, computed from the platform ratings. Two methods, pick per request:
- **Volume-weighted (default):** `composite = ((G·Gn) + (Y·Yn)) / (Gn + Yn) × 2`, where G/Y are the star ratings and Gn/Yn the review counts. Because Google usually has ~10× Yelp's review volume, this tracks Google closely and rewards locations with a large, consistent sample. This is what `best-run-chipotle-manhattan` uses.
- **Equal-weight:** simple average of the two star ratings × 2. Gives Yelp equal pull; a harsher-but-real signal. Changes the #1 spot.
- Round the displayed score to one decimal; sort the list by the *precise* (unrounded) composite so display ties keep a stable, correct order.

### Display format — `Address — Neighborhood — Score/10`
- Item name = `"<street address> — <neighborhood> — <score>/10"`, e.g. `"129 W 48th St — Midtown — 7.8/10"`. Em-dash separators. The composite is baked into the canonical name and must be byte-identical across the `ai` seed, every source, `vote.items`, and the `links` keys.
- Neighborhood should be accurate and recognizable; repeats are fine (three "Midtown" entries is honest, forced-unique labels are not).
- This supersedes the normal `(neighborhood)` parenthetical for this list type — the address is the identity, the neighborhood and score are appended.

### Mode — use `scores` (composite ranking + source chips, no voting). NOT `facts`.
Set `mode: 'scores'`. This is a custom mode built for these ranking lists: it shows the **volume-weighted composite as the ranking** and surfaces the platform sources (Google, Yelp) as informational **chips**, with **no fan-vote option** — a popularity vote shouldn't override a measured rating.

Do NOT use `facts` for these. The three relevant modes:
- **`facts`** — bare list: just the ranking from the single `ai` source, **no other chips at all**. For purely factual lists.
- **`scores`** — `ai` composite ranking **plus** the other sources (Google, Yelp) as selectable chips; **no voting**. This is what chain-city composite lists use.
- **`both`** (default) — Borda consensus of the sources + reader voting.

How `scores` behaves (shipped May 2026):
- The **detail page, share/poster page, and OG image all rank by the `ai` composite seed** (its array order). Put the `ai` seed items in composite order — that exact order is what every view shows, so the pages never disagree.
- The `google` and `yelp` sources render as **selectable chips** beside the composite, each in its own true star-rating order (review-count tiebreak), each with a `url`. They're shown for transparency but do NOT drive the ranking and are not Borda-scored.
- **No Vote tab / no "Reader Votes" chip** on either the detail or share page.
- Why not `both`: there the headline is Borda of the sources *plus live votes*, and the detail page counts votes while the share/poster page doesn't — so the pages can disagree and neither matches the printed composite. Why not `facts`: facts shows only the bare ranking with no Google/Yelp chips. `scores` is the middle ground.
- Label the `ai` source transparently, e.g. `"Composite Score · Google + Yelp, volume-weighted (May 2026)"`. Keep `vote.items` populated (10) for data integrity even though voting is off.

**Implementation note (already shipped):** the `facts` vs `scores` handling lives in `app/list/[id]/DetailClient.jsx`, `app/snapshot/[id]/SnapshotClient.jsx`, `scripts/generate-og-images.js`, `app/HomeClient.jsx`, and `app/list/[id]/page.js`. `facts` = bare `ai` list only; `scores` = `ai` composite ranking + the other sources as read-only chips, with voting suppressed. New chain-city lists only need `mode: 'scores'` plus the sources; no further code changes.

### Links
Still a `mapsCity` list, so an explicit `links` object is required. Key each by the full `Address — Neighborhood — Score/10` name; the URL is a clean sanitized Maps search built from **just the chain + address** (NOT the score-laden display name), e.g. `https://www.google.com/maps/search/?api=1&query=Chipotle%20129%20W%2048th%20St%20New%20York`. The explicit link wins over the auto-generated one, so the em-dashes and digits in the display name never reach the Maps query.

### Build & validate
Generate the entry with a script that takes the raw `(address, neighborhood, G, Gn, Y, Yn)` table, computes the composite, sorts, and emits the JS — then `node --check` the assembled file and assert every source/seed/vote name has a matching `links` key. See `staged_list_entries.py` / the build script used for the Chipotle list.

## Unranked Product Lists (`mode: 'unranked'`)

A deliberately different kind of list. Where every other list type produces an *ordered* ranking (Borda consensus, a composite score, or a vote tally), an **unranked** list is a **curated, subjective set of items** — "here are cool/handy/novel things worth owning," presented with **no rank numbers, no consensus math, and no voting**. Use it when ordering the items would be arbitrary or beside the point (e.g. fun single-purpose gadgets). The first one shipped is `unique-time-saving-kitchen-gadgets`.

### When to use it
- The value is the *collection*, not the order. Picking a #1 would be meaningless or misleading.
- You want editorial freedom to choose items by feel (cool, handy, novel) rather than by what the most sources happen to agree on. Ignore the consensus calculation entirely.
- Product round-ups (`linkType: 'amazon'`) are the natural fit, but it works for any `linkType`.

### How to build one
- Set `mode: 'unranked'`.
- Put the curated items in the **`ai` source** (`sources.ai.items`) in whatever order reads best — that exact array is what the page shows. There is **no Borda step**, so order is purely editorial.
- The `ai` source is the **only** source rendered. You do **not** need other publication sources, `unordered` flags, or a `links` object (for `amazon`, links auto-generate). You may still cite where items were "mentioned" in the blurb, but don't add scoring sources — they'd be ignored.
- Give the `ai` source a human label, e.g. `"Our handpicked set"`.
- Keep `vote.items` populated for data integrity even though voting is off.
- Products carry **no geographic parenthetical** (same as any product list).

### How it renders (shipped)
- **Detail page:** items shown in their curated order, each marked with a bullet (•) instead of a rank number; no Consensus/Vote tabs.
- **Home tile, snapshot/poster, and OG link-preview:** show the curated items (the OG preview shows the first five with bullets and the subtitle "A handpicked set. Not ranked"). No "counting down from ten" framing.
- Same code surfaces as `facts`/`scores`: `DetailClient.jsx`, `HomeClient.jsx`, `SnapshotClient.jsx`, `page.js`, `opengraph-image.js`, `twitter-image.js`, `scripts/generate-og-images.js`. New unranked lists need only `mode: 'unranked'` + the `ai` items; no further code changes.

### Don't
- Don't add ranked or `unordered` publication sources to an unranked list expecting them to do something — only `ai` is read.
- Don't use `unranked` for a list that genuinely has a best-to-worst order; use `both`/`facts`/`scores` so readers get the ranking.
