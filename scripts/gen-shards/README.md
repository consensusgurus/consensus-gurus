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
