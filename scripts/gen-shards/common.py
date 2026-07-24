import os
import sys, json
from wordfreq import zipf_frequency, top_n_list

DICT = set(w.strip() for w in open(os.path.join(os.path.dirname(__file__),'..','..','public','tuck-dict.txt')) if w.strip())

# offensive / undesirable fill words kept out of GRIDS (validation dict still allows
# them for uniqueness, but they never appear in an authored solution).
BLOCK = set("""
ass arse damn crap piss slut turd twat wog kike spic dago coon jap gyp
fag fags anal butt scum std sluts pube pubes puke boob boobs bra bras
nazi nazis rape raped rapes rapist hell dammit dumb ugly fart farts snot
""".split())

def build_common(maxlen=7, zmin=3.2):
    common = {}
    for w in DICT:
        L = len(w)
        if L < 2 or L > maxlen: continue
        if not w.isalpha(): continue
        if w in BLOCK: continue
        z = zipf_frequency(w, 'en')
        if z < zmin: continue
        common.setdefault(L, []).append((w, z))
    out = {}
    for L, lst in common.items():
        lst.sort(key=lambda x:-x[1])
        out[L] = [w for w,_ in lst]
    return out

if __name__ == '__main__':
    for zmin in (3.0, 3.2, 3.5, 4.0):
        c = build_common(7, zmin)
        print('zmin', zmin, {L: len(c.get(L,[])) for L in range(2,8)})
