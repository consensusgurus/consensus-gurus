"""Search 180-degree-symmetric block templates whose every across/down run is 3..MAXW.

Why: the shipped templates manufacture two-letter slots, and at length 2 the
'common word' frequency filter is useless (108 of the 124 two-letter dictionary
words clear zipf 3.5), so those slots fill with Scrabble junk (ST, JA, PE).
Banning runs shorter than 3 removes the slot, which removes the problem.
"""
import sys, itertools, random
from collections import deque

MAXW = 7   # the common-word fill pool tops out at 7 letters

def rows_ok(n, minr=3):
    """Every n-bit row pattern whose maximal '.' runs are all in [minr, MAXW]."""
    out = []
    for bits in range(1 << n):
        s = ''.join('#' if (bits >> i) & 1 else '.' for i in range(n))
        ok = True
        for seg in s.split('#'):
            if seg and not (minr <= len(seg) <= MAXW):
                ok = False; break
        if ok:
            out.append(s)
    return out

def cols_ok(pat, n, minr=3):
    for c in range(n):
        col = ''.join(pat[r][c] for r in range(n))
        for seg in col.split('#'):
            if seg and not (minr <= len(seg) <= MAXW):
                return False
    return True

def connected(pat, n):
    cells = [(r, c) for r in range(n) for c in range(n) if pat[r][c] == '.']
    if not cells: return False
    seen = {cells[0]}; q = deque([cells[0]])
    while q:
        r, c = q.popleft()
        for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
            p = (r+dr, c+dc)
            if p not in seen and 0 <= p[0] < n and 0 <= p[1] < n and pat[p[0]][p[1]] == '.':
                seen.add(p); q.append(p)
    return len(seen) == len(cells)

def search(n, minletters, minr=3):
    V = rows_ok(n, minr)
    half = n // 2
    found = []
    if n % 2 == 0:
        for combo in itertools.product(V, repeat=half):
            pat = list(combo) + [row[::-1] for row in reversed(combo)]
            if sum(row.count('.') for row in pat) < minletters: continue
            if not cols_ok(pat, n, minr): continue
            if not connected(pat, n): continue
            found.append(tuple(pat))
    else:
        pals = [r for r in V if r == r[::-1]]
        for combo in itertools.product(V, repeat=half):
            for mid in pals:
                pat = list(combo) + [mid] + [row[::-1] for row in reversed(combo)]
                if sum(row.count('.') for row in pat) < minletters: continue
                if not cols_ok(pat, n, minr): continue
                if not connected(pat, n): continue
                found.append(tuple(pat))
    return found

if __name__ == '__main__':
    for n, ml in ((6, 26), (7, 35), (8, 46)):
        f = search(n, ml)
        print(f'{n}x{n}: {len(f)} symmetric templates with every run 3..{MAXW}, >={ml} letters')

# ---- fill screen -------------------------------------------------------------
# A template that is legal is not necessarily USABLE: with no two-letter slots to
# absorb an awkward crossing, plenty of shapes cannot be filled from the common
# word pool at all. Keep only the ones that fill reliably, or the per-day search in
# build_ladder.py spends its budget on templates that were never going to work.

def fill_ok(pat, n, trials=6, tries=25000):
    """How many of `trials` random fills succeed. Returns (successes, seconds)."""
    import time, random, gen
    ok = 0; spent = 0.0
    for s in range(trials):
        t = time.time()
        g = gen.fill(list(pat), n, random.Random(9000 + s * 131), tries=tries)
        spent += time.time() - t
        if g: ok += 1
    return ok, spent


def pick(n, minletters, want, minok=4, wall=460):
    """Search, screen, and return the first `want` templates that fill reliably."""
    import time
    cands = search(n, minletters)
    cands.sort(key=lambda p: (-sum(r.count('.') for r in p), p))
    keep = []; t0 = time.time()
    for pat in cands:
        if time.time() - t0 > wall:
            break
        if fill_ok(pat, n, trials=3, tries=6000)[0] < 2:   # cheap screen first
            continue
        ok, dt = fill_ok(pat, n)
        if ok >= minok:
            keep.append(list(pat))
            print(f'  letters={sum(r.count(".") for r in pat)} fill={ok}/6 {dt:.2f}s  '
                  + '|'.join(pat), flush=True)
            if len(keep) >= want:
                break
    return keep
