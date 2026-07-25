# Freeze the word-frequency data Lode scores with.
#
# The shipped dictionary (public/tuck-dict.txt) is a Scrabble word list: about
# half of it is words no reader has ever met. Lode needs two things from a
# frequency source — a floor to drop that junk, and a tier per surviving word so
# rarity can drive the scoring. Both come from `wordfreq`'s Zipf scale (roughly
# 1 = vanishingly rare, 7 = "the").
#
# Run once and commit the output; the generator reads it, so a build never needs
# the Python dependency:
#     pip install wordfreq --break-system-packages
#     python3 scripts/lode-words.py > scripts/.lode-freq.json
import json
import os
import sys

from wordfreq import zipf_frequency

HERE = os.path.dirname(os.path.abspath(__file__))
DICT = os.path.join(HERE, "..", "public", "tuck-dict.txt")
FLOOR = 2.0  # keep a little headroom under the generator's own floor

out = {}
with open(DICT, encoding="utf8") as fh:
    for line in fh:
        w = line.strip().lower()
        if len(w) < 4:
            continue
        z = zipf_frequency(w, "en")
        if z >= FLOOR:
            out[w] = round(z, 2)

print(json.dumps(out, separators=(",", ":"), sort_keys=True))
print(f"{len(out)} words at or above Zipf {FLOOR}", file=sys.stderr)
