# Freeze the word data Lode scores with: a frequency per word, and a vocabulary
# gate that decides which words are allowed on a board at all.
#
# The shipped dictionary (public/tuck-dict.txt) is a permissive 115k word list,
# and roughly half of it is not vocabulary: proper nouns (james, texas, kiev),
# abbreviations (voip, comm, calif), brand names (facebook, honda, velcro) and
# internet spellings (nite, gawd, pfft). Lode needs two things from this step, a
# score signal and a junk filter.
#
# SCORE comes from `wordfreq`'s Zipf scale (roughly 1 = vanishingly rare, 7 =
# "the"), which the generator turns into the rarity tiers the whole game is
# built on.
#
# The JUNK FILTER used to be the Zipf floor alone, and that was the flaw this
# script exists to fix. Proper nouns are frequent, so a floor high enough to
# stop "paul" and "texas" also stops ordinary vocabulary that simply is not
# written down much: lard 2.98, howl 3.18, silt 2.96, coax 2.96, hilt 2.90,
# faze 2.91, cowl 2.87, ruse 3.16, yelp 3.25. Players typed those and got
# bounced, which is exactly the wrong failure. Frequency cannot separate "a word
# nobody knows" from "a word nobody writes"; only a dictionary can.
#
# So a spelling dictionary is now the primary gate. Hunspell's en_US is
# CASE SENSITIVE, which is the property that does the work here: `lard` is in it
# and `moby`, `aida`, `pele`, `zulu` and `gump` are not, because those exist only
# as capitalized names. That gives three classes:
#
#   known           lowercase is in the dictionary -> real vocabulary, allowed
#                   even well below the old floor.
#   proper noun     lowercase is out but Capitalized is in -> a name, dropped
#                   however frequent it is. This is what finally clears james,
#                   november, michael, india, texas and facebook off the boards.
#   unknown to both British spellings (metre, defence, realise, parlour),
#                   compounds (snowpack, drawdown, rebrand), slang, plus some
#                   junk. Kept only if it already cleared the OLD floor, so this
#                   change never takes away a word a player could type before it
#                   shipped.
#
# Run once and commit the output; the generator reads the JSON, so a build never
# needs Python, wordfreq or a hunspell dictionary:
#     pip install wordfreq spylls --break-system-packages
#     python3 scripts/lode-words.py > scripts/.lode-freq.json
#
# The hunspell dictionary is the system one (Debian/Ubuntu: apt install
# hunspell-en-us). Override the path with LODE_HUNSPELL if it lives elsewhere.
import json
import os
import sys

from spylls.hunspell import Dictionary
from wordfreq import zipf_frequency

HERE = os.path.dirname(os.path.abspath(__file__))
DICT = os.path.join(HERE, "..", "public", "tuck-dict.txt")
HUNSPELL = os.environ.get("LODE_HUNSPELL", "/usr/share/hunspell/en_US")

# Keep a little headroom under the generator's own floors (gen-lode.mjs FLOORS /
# FLOOR_LONG), so a small tweak there does not require re-running this script.
# Below roughly 1.9 the gated list stops being vocabulary a reader would place
# and turns into the Scrabble tail (fulvous, catechin, ecotone, bascule), which
# is the whole category Lode exists to keep off the board.
FLOOR = 1.9

# The generator's floors, mirrored here because the grandfather rule below needs
# to know what used to be allowed. OLD is the pre-gate floor set; NEW is what
# gen-lode.mjs uses now that the dictionary gate carries the quality burden.
# Keep NEW in sync with FLOORS / FLOOR_LONG in scripts/gen-lode.mjs.
OLD = {4: 3.4, 5: 2.6, 6: 2.25}
OLD_LONG = 2.1
NEW = {4: 2.7, 5: 2.25, 6: 2.1}
NEW_LONG = 2.05

# Words hunspell en_US files as capitalized-only that are still worth playing.
# Three groups: British spellings it only knows as surnames (Grey, Armour,
# Sabre, Tyre), genericized trademarks people write lowercase (velcro, kleenex,
# frisbee, teflon), and common nouns that share a capitalized sense (tory,
# realtor, parmesan, merlot, labrador). Everything else the proper-noun class
# catches is a genuine name, and names have no business on a word board.
KEEP = {
    # British spellings en_US knows only as names
    "grey", "coloured", "armour", "sabre", "tyre",
    # genericized trademarks, routinely lowercase
    "velcro", "kleenex", "frisbee", "teflon", "vaseline", "popsicle", "lycra",
    "formica", "valium", "humvee", "foosball",
    # food and drink written lowercase
    "parmesan", "merlot", "pinot", "chianti", "riesling", "marsala",
    # common nouns and adjectives with a capitalized sense
    "tory", "tories", "realtor", "afro", "cajun", "nordic", "utopian",
    "labrador", "savannah", "sherpa", "siamese", "maltese", "quaker",
    "jesuit", "flemish", "muppet", "jedi",
}


def old_floor(n):
    return OLD.get(n, OLD_LONG)


def new_floor(n):
    return NEW.get(n, NEW_LONG)


spell = Dictionary.from_files(HUNSPELL)
_seen = {}


def classify(w):
    """'known', 'proper' or 'unknown' - see the header."""
    if w not in _seen:
        if spell.lookup(w):
            _seen[w] = "known"
        elif spell.lookup(w.capitalize()):
            _seen[w] = "proper"
        else:
            _seen[w] = "unknown"
    return _seen[w]


out = {}
stats = {"known": 0, "proper": 0, "unknown": 0, "dropped_proper": 0, "below": 0}

with open(DICT, encoding="utf8") as fh:
    for line in fh:
        w = line.strip().lower()
        if len(w) < 4:
            continue
        z = zipf_frequency(w, "en")
        if z < FLOOR:
            continue
        cls = classify(w)
        stats[cls] += 1

        # A name is a name however often it is written.
        if cls == "proper" and w not in KEEP:
            stats["dropped_proper"] += 1
            continue

        if z >= old_floor(len(w)):
            pass  # grandfathered: allowed before the gate, still allowed
        elif cls == "known" and z >= new_floor(len(w)):
            pass  # newly admitted on the dictionary's word, not on frequency
        else:
            stats["below"] += 1
            continue

        out[w] = round(z, 2)

print(json.dumps(out, separators=(",", ":"), sort_keys=True))
print(
    f"{len(out)} words kept - dropped {stats['dropped_proper']} proper nouns, "
    f"{stats['below']} below floor - classes: {stats['known']} known / "
    f"{stats['proper']} proper / {stats['unknown']} unknown to en_US",
    file=sys.stderr,
)
