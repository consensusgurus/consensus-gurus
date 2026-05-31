# Best Sushi in Tokyo — source/neighborhood update (2026-05-30)

Edits applied directly to `lib/data.js`, object id `best-sushi-in-tokyo`. The site computes the
Consensus ranking at render time in `lib/helpers.js` (Borda; `unordered: true` sources contribute a
flat 5.5 pts/item via `FLAT_UNORDERED`), so only the source data needed changing — no hand-computed
ordering.

## Changes
1. **Michelin** source flagged `"unordered": true`. Michelin awards stars, not a 1–N ranking, so its
   on-page order must not drive Borda points.
2. **Time Out** ("Best Sushi for Every Budget") flagged `"unordered": true` — a budget-segmented
   roundup, not a quality ranking.
3. **Six items given verified Tokyo neighborhoods** (updated byte-identically across source items,
   vote items, and `links` keys + Maps URLs):
   - Mawashizushi Katsu → **(Meguro)** — the branch The Infatuation reviews (Katsu Midori, Meguro). Source: theinfatuation.com/tokyo/reviews/mawashizushi-katsu
   - Sushi Ishii → **(Akasaka)** — theinfatuation.com/tokyo/reviews/sushi-ishii
   - Ikina Sushidokoro Abe → **(Toranomon)** — timeout.com/tokyo/restaurants/ikina-sushidokoro-abe
   - Sushi Anjo → **(Nishi-Azabu)** — sushi-anjo.com
   - Umi → **(Minami-Aoyama)** — Sushi Umi, Minami-Aoyama, Minato-ku
   - Toriton → **(Oshiage)** — Time Out branch at Solamachi/Skytree. timeout.com/tokyo/restaurants/toriton

## New expert source ADDED
**Tabelog Gold 2026 · Tokyo Sushi** — `"unordered": true` (it is an annual award tier decided by
verified diners, not a 1–N list). Url: https://award.tabelog.com/en
Winners included (each with verified neighborhood), sourced from Food in Japan's Tabelog Gold writeup
(foodinjapan.org/article/best-sushi-in-tokyo, updated 2026-03-22):
- Sushi Saito (Ginza)  ← kept existing canonical spelling; see discrepancy note below
- Nihonbashi Kakigaracho Sugita (Nihonbashi)
- Higashiazabu Amamoto (Higashi-Azabu)
- Mitani (Yotsuya)
- Namba (Hibiya)
- Sushi Arai (Ginza)

## Sources requested but NOT added (no usable list retrieved — not fabricated)
- **OAD (Opinionated About Dining)**: confirmed Sushi Saito ranks #1–2 in Japan and Amamoto appears,
  but the OAD/Pearl ranking pages are JS-rendered and returned no parseable Tokyo-only ordered list.
  NO COMPLETE LIST RETRIEVED — left out rather than guess ranks.
- **Eater**: Eater has no dedicated Tokyo sushi guide that surfaced. NO USABLE LIST FOUND.
- **Savor Japan**: target article returned empty (JS). NO USABLE LIST RETRIEVED.
- **Condé Nast Traveler** ("23 best sushi in Tokyo") and **Travel + Leisure**: articles exist but the
  full named lists could not be fetched (JS-rendered / paywalled mirrors returned empty). NOT ADDED.

These six can be added later once their full lists are retrievable (or paste them and they'll wire in
directly). Tabelog's plain "online reservation ranking" page was deliberately NOT used — it ranks by
booking volume, not quality, so presenting it as a ranking would mislead.

## Discrepancy noted (not changed)
Existing data labels **Sushi Saito as "(Ginza)"**, but Saito is actually in **Roppongi** (Ark Hills
South Tower). Left as-is to preserve byte-identical matching with the existing items; flag for a
future cleanup if you want it corrected everywhere.

## Verification
- `node --check lib/data.js` passes.
- Every item in every source (and in vote.items) has a matching key in `links`.
