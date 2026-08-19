# Shards puzzle generator (offline)

Build-time generator + verifier for the Shards daily bank (`app/shards/puzzles.js`).
Run offline; the bank is committed, there is no runtime generation.

Requires: `pip install wordfreq pillow`

- `common.py` - builds the common-word fill pool (wordfreq, zipf >= 3.5) and loads
  the full validation dictionary `public/tuck-dict.txt` (the same list the client
  and `scripts/verify-daily-banks.mjs` validate against).
- `gen.py` - fills a mini-crossword grid from common words, cuts it into rigid
  3-6 cell polyomino shards (preferring a "trap" cut with 2+ geometric tilings
  that letters resolve to one), and BRUTE-FORCES uniqueness: exactly one tiling of
  the shard set whose every across/down run is a dictionary word.
- `build.py` - generates a dated run of puzzles from 2026-07-24 (weekday 5x5/6x6,
  Sunday 7x7), gentle difficulty ramp, and emits the bank JSON.

The shipped bank is re-proven on every deploy by `node scripts/verify-daily-banks.mjs shards`.

## No run shorter than three (2026-08-19)

A two-letter slot cannot be filled with a word a reader accepts. wordfreq scores
two-letter strings on abbreviations and on foreign text bleeding into an English
corpus, so **108 of the 124 two-letter words in `tuck-dict.txt` clear the zipf 3.5
"common word" bar** (st 5.20, et 4.66, ky 3.77, pe 3.72, ja 3.71). The 6x6/7x7/8x8
templates shipped before this date manufactured six or more of those slots per
board, and every one of the 20 Sunday templates did. Boards were correct only by a
Scrabble dictionary nobody had told the player about.

The fix is geometric: no slot, no problem.

- `tsearch.py` machine-searches 180-degree-symmetric templates whose every across
  and down run is 3 to 7 letters, then screens them by actually filling them
  (`tsearch.pick`). `gen.py` re-checks the whole set at import via `MIN_RUN`, and
  `scripts/verify-daily-banks.mjs` re-proves it per board from `MINRUN_FROM`.
- `common.py` tightened with it, because the same failure repeats one size up:
  ING, ONS, ENG, REC, TAE and ISH all clear zipf 3.5 at length 3. Three-letter fill
  must now also be a LOWERCASE entry in `/usr/share/hunspell/en_US.dic` and clear
  zipf 4.0; every length drops words hunspell knows only capitalised (that is the
  only filter that catches DAN, since wordfreq is case-insensitive), plus explicit
  NAMES and BRITISH sets. Pool: 3-letter 505 -> 275.
- `CAP` went 900 -> 2100 (the whole zipf>=3.5 pool). With no two-letter slots to
  absorb an awkward crossing, a 900-word cut left 6x6 and 7x7 nearly unfillable:
  7x7 filled 10 times in 48 tries at 900, 40 at 2100.
- `build_ladder.py` recycles vetted fills from days it replaces, so it now also
  rejects any recycled fill whose pattern has a short run OR whose words are no
  longer in the pool. Without the second check a recycled board keeps its old ISH
  and ONS untouched, which is exactly what happened on the first rebuild.

Days already played are frozen and still carry two-letter answers. Both the
verifier check and the rules copy in `ShardsClient.jsx` are worded for both eras.
