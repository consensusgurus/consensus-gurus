# Source of Truths — Quiz Creation Rules

Companion to CLAUDE.md. That file governs **lists** (the Borda-consensus system in `lib/data.js`).
This file governs **quizzes** (`lib/quizzes.js` and the `/quiz/[id]` boards). If you are adding,
editing, or fixing a quiz, the rules below apply. When the two files disagree about quizzes, this file wins.

---

## 0. The one rule that matters most: never ship generated data you have not verified

Quizzes are full of data that is easy to fabricate plausibly and get wrong silently: map coordinates,
answer strings, capitals, aerial framings, image URLs. A wrong list entry looks wrong in review; a wrong
quiz coordinate renders a confident, broken question that no player can answer.

**Do not trust from-memory coordinates, capitals, or place data. Verify before shipping.** Specifically:

- Any quiz that renders a **map, aerial, satellite image, or geographic pin** must have every coordinate
  visually confirmed before it is staged for push. Geocode from an authoritative source (OpenStreetMap /
  Nominatim, Overpass), then **look at the actual rendered image for every item**, not a sample.
- Facts like capitals, "which major is hosted here," years, and rankings must come from a checked source,
  not recall. If you would not bet the deploy on it, look it up.

This rule exists because it was learned the hard way: a 62-course aerial quiz shipped with ~15 coordinates
that landed on water, farmland, or the wrong city, because they were set from memory and never eyeballed.

### How to visually verify map/aerial coordinates (the proven workflow)

1. **Geocode.** For each place, query Nominatim
   (`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=...`) for an authoritative
   lat/lon. Prefer results whose `type` is the thing you want (e.g. `golf_course`). Nominatim can still
   mismatch (return a same-named place elsewhere), so sanity-check the distance from your rough guess and
   discard wild outliers.
2. **Render a contact sheet.** Build the real image URLs and view them. The container sandbox usually
   cannot reach the imagery host, and fetching URLs with curl/python is disallowed, so use the connected
   Chrome: navigate to any ordinary https page, then inject the grid of `<img>` tags with
   `javascript_tool` (Chrome blocks `file://` and top-level `data:` navigation). Screenshot and read it.
3. **Eyeball every tile.** Confirm each one actually shows the subject (a golf course, not a marina).
   Coastal/links courses legitimately include sand and water; a tile that is *mostly* water or city is wrong.
4. **Fix and re-render** the failures with corrected coordinates until the whole sheet is right. Only then
   stage the file. Keep the coordinates in the generator so a future nudge is one line.

Esri World Imagery is the house satellite source (the `geo-aerial` quizzes already use it). A single
straight-down image for a bbox comes from its `export` endpoint:
`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=<xmin,ymin,xmax,ymax>&bboxSR=3857&imageSR=3857&size=1000,1000&format=jpg&f=image`.
Use Web Mercator (3857) with a square bbox for an undistorted image; frame a championship course at roughly
1.5–1.8 km across and widen for sprawling or multi-course sites.

---

## 1. Where quizzes live and how they ship

- **Definitions:** `lib/quizzes.js` (one big `QUIZZES` array, `getQuiz()` at the bottom). Insert new quiz
  objects immediately before the closing `];` marker.
- **Boards:** `app/quiz/[id]/*Board.jsx` / `QuizClient.jsx`, keyed off each quiz's `format`.
- **Deploy path (this environment):** the cloud sandbox **cannot push to GitHub** (proxy blocks it). Build
  and validate in the cloud clone, then stage the changed files onto the user's GitHub Desktop clone at
  `C:\dev\sot-live` (via SendUserFile + `device_commit_files`); the user commits and pushes there. Vercel
  builds on push. Do not attempt PAT/token pushes from the sandbox; they are dead here.
- Local commits in the cloud clone are only for a clean working tree. The stop-hook may flag an older
  owner commit (e.g. `consensusgurus@gmail.com`) as "unverified" — that is the user's own pushed commit;
  **do not rewrite it.**

## 2. The registration checklist (every NEW quiz, every time)

1. **Department:** add an id → dept entry in `lib/quiz-departments.js` (usually `'geography'`, `'sports'`,
   etc.). The id-heuristic fallback is not a substitute; add the explicit entry.
2. **Hero image:** the **newest** quiz (latest `publishedAt`) must have a hero in `lib/quiz-heroes.js`, or
   the featured slots fall back to a department photo. Register a hero for anything that could be newest or
   land in a featured slot. Every hero `src` must be a JPEG or PNG (never WebP/AVIF).
3. **`publishedAt` and newest-order:** stamp `publishedAt` with a real `date -u` captured at build time,
   in the past relative to now (a future timestamp hides the quiz until then). Give each quiz in a batch a
   distinct time. If you intend a quiz to be the newest, confirm no existing quiz has a later `publishedAt`.
4. **Validate:** `node --check lib/quizzes.js`; then load it
   (`node --input-type=module -e "import('./lib/quizzes.js')..."`) and confirm the new ids resolve, counts
   are right, and there are **no holes** (`undefined` array elements from a botched edit). If you touched a
   `.jsx` board, validate it with esbuild via stdin (`esbuild --loader=jsx --format=esm < file`), since
   `node --check` cannot parse JSX.
5. **Stage** the changed files to `C:\dev\sot-live` and tell the user exactly which files to commit.

## 3. Answer-key hygiene (keys are substring-matched)

The board matchers treat a key as a hit if the typed guess **contains** the normalized key
(`guess.includes(key)`), and a run can end if a typed value exactly equals a *different* item's candidate.
So:

- **No generic or ultra-short keys.** `tpc`, `riv`, `old`, bare `stadium course` collide across items.
- **No key shared by two answers** in the same quiz.
- After building a quiz, run a programmatic collision scan: for every key, list which answers it matches;
  fail the build if any key maps to more than one answer or is a substring of another answer's name/key.

## 4. Format quick-reference (`format` field → board)

- `type-it` / `bank` — name-them-all; `answers:[{t,keys}]` (+ `pairs`/`leftLabel` for matched banks).
- `photo` — one image per answer; `answers:[{t,keys,img,landmark}]`. Board uses a plain `<img>` (no Next
  optimizer, so any https host works). `landmark` shows **only on reveal**, so it is safe to put the
  location/answer there without spoiling play. Good fit for "name the X from an aerial/photo": set `img`
  to an Esri `export` URL per item and let players type the name. `photoAspect` controls the frame
  (`"1 / 1"` for square satellite tiles).
- `map` — click-the-region on `lib/<region>-geo.js` geometry; flags `noBorders` (blank silhouette),
  `erase` (wipe on click), `suddenDeath`, `mapImgPrompt` (flag prompt), `mapCapitalPrompt` (show a capital,
  click its country; each answer carries `cap`). New regions need a `lib/<region>-geo.js` and a `LOADERS`
  entry in `MapQuizBoard.jsx`.
- `geo-aerial` — pin-drop over a **single shared** live Esri tile basemap; `cities:[{name,lon,lat}]` plus a
  `basemap` block. Only works for places clustered in one area (a city, a resort). It does **not** fit
  subjects scattered worldwide — use `photo` with per-item aerials for those.
- Others: `timed-mcq`, `connections`, `word-scramble`, `matched`, `crux`, `logic-game`, `place-map`,
  `higher-lower`, `closer`, etc. Copy an existing quiz of the same format as the template.

## 5. Scoring and grandfathering

Scoring lives in `lib/quiz-scoring.js` / `lib/quiz-anon.js`. "Perfect" is `row.score === row.total`, and
each leaderboard row stores its own `total`. Because of that, **adding a new answer to an existing quiz
does not break prior perfect scores** — they were graded against the old total and stay perfect
automatically. No migration code is needed when you extend a quiz's answer set.

## 6. Definition of done for a quiz change

- [ ] Facts/coordinates/images verified against a real source (visually, for anything geographic).
- [ ] Dept entry added; newest quiz has a hero; `publishedAt` stamped and newest-order confirmed.
- [ ] Key-collision scan clean.
- [ ] `node --check` + load passes with no holes; any edited board passes esbuild.
- [ ] Files staged to `C:\dev\sot-live`; user told which files to commit and what to spot-check on preview.

---

## 7. Daily game puzzle banks (`app/<game>/puzzles.js`)

The 18 daily games (crux, emcee, garble, links, span, dating, tally, suds, circa,
extra, carve, stet, outwit, tuck, alibi, cipher, ping, warmer) each keep a dated `PUZZLES` array. These have failure modes a
`node --check` / "it parses" pass does **not** catch. **A puzzle that parses is not a puzzle
that is correct.** Before staging ANY daily puzzle — new or edited — run the checks below for
its game. Do not author a batch and ship on structural validation alone: that is exactly how
multi-solution and factual bugs reach players (learned the hard way — a Links board shipped
with four valid groupings, a Crux board with two, and three Span notes with false geography,
all of which "passed" structural checks).

**The solvers ARE in the repo now** (restored 2026-07-18). Run them after ANY bank edit:
- `node scripts/verify-daily-banks.mjs [game ...]` — suds/tally/carve (full uniqueness
  re-derivation + stored-sol match), garble (anagram + alternate-anagram scan), emcee
  (slot/grid consistency + dictionary review), links/crux (mechanical structure +
  crossing consistency; the SEMANTIC double-solution audit below stays manual), span
  (par = BFS incl. Sunday via/avoid), dating (strict ascending), circa/extra/outwit
  (structural; extra uses the client's own resolveHidden). ~6s for everything.
- `node scripts/verify-alibi.mjs` / `verify-cipher.mjs` / `verify-tuck.mjs` /
  `verify-stet.mjs` / `verify-ping.mjs` / `verify-warmer.mjs` — the per-game verifiers for the newer dailies.

### 7a. Solution uniqueness — the #1 rule for logic games

Every board of a logic game MUST have **exactly one** valid solution. "All the words are
unique" or "the grid geometry is valid" does NOT prove this — you must solve it.

- **Links & Crux (category filing):** the deadly bug is two words that each plausibly belong
  to the SAME two categories — they swap, yielding ≥2 valid groupings (a Connections-style
  double solution). A 3-cycle of collisions (A reads cat1/cat2, B reads cat2/cat3, C reads
  cat3/cat1) is almost always ambiguous. RULE: pin every trap word by elimination — its
  decoy category must ALREADY be full of that category's own true members, so the trap
  cannot actually be filed there. VERIFY with a solver, never by eye: build a *generous*
  membership matrix (for each word, EVERY category on the board it could plausibly read as),
  then count the partitions into the declared group shapes. The count MUST be 1. Classic
  traps that have bitten us: planet-names that are also Roman gods (Neptune/Saturn/Jupiter/
  Mercury), a gem that is also a shade (ruby/garnet), a word that is both a tree and a shade
  of green (olive/pine), boxing/dance/fishing overlaps (swing/hook/reel).
- **Suds / Tally / Carve (number games):** each board must have exactly one solution given
  its clues / rack / anchors. `scripts/verify-daily-banks.mjs` re-derives all three
  exhaustively and asserts the stored `sol` matches (Suds = standard sudoku; Tally =
  place the `bank` multiset to hit `rowT`/`colT`; Carve = connected equal-sum regions
  from the `seeds`).
- **UNIQUE IS NOT ENOUGH — verify DEDUCIBILITY (learned 2026-07-18):** a puzzle can have
  exactly one solution that is only reachable by guess-and-backtrack. Any game whose copy
  promises pure logic (Alibi, Cipher) must be solvable by human-standard moves with NO
  trial-and-error. `scripts/verify-alibi.mjs` enforces this with a propagation solver
  (eliminations, room↔object/time links, before-chain bounds, permutation singles/pairs) —
  9 of the first 14 Alibi cases were unique but guessy and 2 had to be regenerated. When
  banking a new logic game, build the equivalent no-guessing check FIRST.

### 7b. Factual accuracy — verify, never recall (extends §0)

- **Span notes:** every geographic claim in a `note` must be checked against
  `app/span/borders.js`. NEVER write "X is the only country that borders Y" without listing
  Y's full neighbour set from `PAIRS` (Panama borders Costa Rica AND Colombia; Chile borders
  Argentina, Bolivia AND Peru). Every `par` must equal `shortestHops` BFS — and the
  *constrained* BFS for Sunday via/avoid. Recompute every route claim ("one road", "+1 hop")
  with the BFS helpers (`shortestHops`, `distancesFrom`) before writing it.
- **Dating / Circa / Extra:** every year/date must be web-verified, not recalled. Dating
  events MUST be in strictly ascending true chronological order — array index is the answer key.

### 7c. Word / content validity

- **Emcee / Crux:** every across/down (or grid) answer must be a real dictionary word; clues
  accurate and breakfast-table fair.
- **Garble:** each `scramble` must be a true anagram of its `answer` (and not equal to it),
  and the letters at each word's `marks` must together anagram to `final`. The client is
  EXACT-MATCH, so no answer may have an alternate anagram that is a COMMON word (MELON vs
  LEMON would wrongly reject a fair unscramble) — verify-daily-banks flags alternates;
  obscure-dictionary alternates are fine, common ones are not.
- **Tuck:** every rack 14 letters / 4-6 vowels, and the stored `par` must be ACHIEVABLE —
  verify-tuck re-runs the ladder solver and fails otherwise. The dictionary asset
  (public/tuck-dict.txt) is player-facing validation: re-apply the slur blocklist any time
  it is regenerated from the npm word-list source (20 were scrubbed 2026-07-18).
- **Cipher:** every equation machine-verified to EXACTLY ONE solution, ≤10 letters,
  rhs length in [max(lhs), max(lhs)+1] — verify-cipher brute-forces all of it. Curate
  themes; random word combos read ugly.
- **Alibi:** unique solution AND pure-deduction solvable (see §7a); the stored solution
  must match the derived one; clue counts 8-11; venues/stolen items distinct across the
  bank. The client never receives the solution — page.js strips it (keep it that way).

### 7d. Definition of done for a daily puzzle change

- [ ] Ran the game's uniqueness/validity solver; every affected board returns exactly ONE
      solution (logic games) or passes its content checks (word/anagram validity).
- [ ] All facts (Span borders/pars/notes; Dating/Circa/Extra dates) verified against a real
      source or `borders.js`, never memory.
- [ ] `quizId` matches `live`; `dateLabel` matches; the `sunday` flag matches the real weekday.
- [ ] Applied on-device durably and re-verified ON the device — a container re-stage can serve
      a stale cached copy of a file you just overwrote.
