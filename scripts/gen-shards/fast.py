"""Fast tiling analysis for Shards.

Two questions get asked of every candidate puzzle, and they want different engines:

1. UNIQUENESS (the ship gate): is there exactly one way to reassemble the shards
   so that every across/down run of 2+ letters is a dictionary word? This must be
   a COMPLETE search, so it prunes hard: the moment a placement finishes a run,
   that run is checked against the dictionary and a bad word kills the branch.
   That pruning collapses the tree by orders of magnitude versus validating only
   at the leaves, which is what made the original enumerator time out at 8x8.

2. AMBIGUITY (the difficulty metric): how many ways could the shard SHAPES tile
   the outline, ignoring letters? A puzzle where the shapes fit only one way is
   solved by shape alone and never makes the player read a letter. This search is
   deliberately unpruned, but it only ever needs to answer "at least F?", so it
   stops counting the moment it reaches the floor.

Cells are bit indices; placements are integer bitmasks, so covering test and
update are single machine ops.
"""

from common import DICT


def build_geometry(cells, n):
    """Index cells and the across/down runs they belong to."""
    idx = {cell: i for i, cell in enumerate(sorted(cells))}
    cellset = set(cells)
    runs = []          # list of [cell indices] for every run of length >= 2
    cell_runs = {i: [] for i in idx.values()}
    for r in range(n):
        c = 0
        while c < n:
            if (r, c) in cellset:
                s = c
                while c < n and (r, c) in cellset:
                    c += 1
                if c - s >= 2:
                    runs.append([idx[(r, cc)] for cc in range(s, c)])
            else:
                c += 1
    for c in range(n):
        r = 0
        while r < n:
            if (r, c) in cellset:
                s = r
                while r < n and (r, c) in cellset:
                    r += 1
                if r - s >= 2:
                    runs.append([idx[(rr, c)] for rr in range(s, r)])
            else:
                r += 1
    for ri, run in enumerate(runs):
        for ci in run:
            cell_runs[ci].append(ri)
    return idx, runs, cell_runs


def placements(shard, idx, n):
    """Every legal position of one shard, as (bitmask, {cellIndex: letter})."""
    offs = list(shard['offs'].items())
    out = []
    for base_r in range(n):
        for base_c in range(n):
            mask = 0
            letters = {}
            ok = True
            for (dr, dc), ch in offs:
                cell = (base_r + dr, base_c + dc)
                if cell not in idx:
                    ok = False
                    break
                ci = idx[cell]
                mask |= 1 << ci
                letters[ci] = ch
            if ok:
                out.append((mask, letters))
    return out


def unique_solutions(shards, cells, n, cap=2, nodecap=3_000_000):
    """Complete search with incremental dictionary pruning.

    Returns (solutions, nodes, exhausted). `exhausted` is False if the node cap
    was hit, which means the search was NOT complete and uniqueness has not been
    proven: callers must reject such a puzzle rather than trust the count.
    Stops early once `cap` solutions exist (2 disproves uniqueness).
    """
    idx, runs, cell_runs = build_geometry(cells, n)
    ncells = len(idx)
    full = (1 << ncells) - 1
    place = [placements(s, idx, n) for s in shards]
    # placements that cover a given cell, per shard
    by_cell = [[[] for _ in range(ncells)] for _ in shards]
    for si, pl in enumerate(place):
        for mask, letters in pl:
            for ci in letters:
                by_cell[si][ci].append((mask, letters))

    runlen = [len(r) for r in runs]
    letters_at = [None] * ncells
    found = set()
    nodes = [0]
    capped = [False]

    def rec(covered, used, filled_runs):
        if len(found) >= cap or capped[0]:
            return
        nodes[0] += 1
        if nodes[0] > nodecap:
            capped[0] = True
            return
        if covered == full:
            found.add(''.join(letters_at[i] for i in range(ncells)))
            return
        # lowest uncovered cell
        tgt = (~covered & full)
        tgt = (tgt & -tgt).bit_length() - 1
        for si in range(len(shards)):
            if used >> si & 1:
                continue
            for mask, lets in by_cell[si][tgt]:
                if mask & covered:
                    continue
                # place, then validate every run this placement completes
                for ci, ch in lets.items():
                    letters_at[ci] = ch
                newcov = covered | mask
                bad = False
                touched = []
                for ci in lets:
                    for ri in cell_runs[ci]:
                        cnt = filled_runs[ri] = filled_runs[ri] + 1
                        touched.append(ri)
                        if cnt == runlen[ri]:
                            w = ''.join(letters_at[x] for x in runs[ri]).lower()
                            if w not in DICT:
                                bad = True
                    if bad:
                        break
                if not bad:
                    rec(newcov, used | (1 << si), filled_runs)
                for ri in touched:
                    filled_runs[ri] -= 1
                for ci in lets:
                    letters_at[ci] = None
                if len(found) >= cap or capped[0]:
                    return
        return

    rec(0, 0, [0] * len(runs))
    return found, nodes[0], not capped[0]


def geom_count(shards, cells, n, floor=None, nodecap=2_000_000):
    """Count distinct geometric tilings (letters ignored).

    With `floor` set, stops as soon as that many exist and returns it, so the
    difficulty gate costs almost nothing on a genuinely ambiguous puzzle.
    Returns (count, hit_nodecap).
    """
    idx, _runs, _cr = build_geometry(cells, n)
    ncells = len(idx)
    full = (1 << ncells) - 1
    sigs = []
    for s in shards:
        off = sorted(s['offs'].keys())
        mr = min(o[0] for o in off); mc = min(o[1] for o in off)
        sigs.append(tuple(sorted((a - mr, b - mc) for a, b in off)))
    place = [placements(s, idx, n) for s in shards]
    by_cell = [[[] for _ in range(ncells)] for _ in shards]
    for si, pl in enumerate(place):
        for mask, letters in pl:
            for ci in letters:
                by_cell[si][ci].append(mask)

    owner = [-1] * ncells
    seen = set()
    nodes = [0]
    capped = [False]

    def rec(covered, used):
        if floor is not None and len(seen) >= floor:
            return
        nodes[0] += 1
        if nodes[0] > nodecap:
            capped[0] = True
            return
        if covered == full:
            seen.add(tuple(sigs[owner[i]] for i in range(ncells)))
            return
        tgt = (~covered & full)
        tgt = (tgt & -tgt).bit_length() - 1
        for si in range(len(shards)):
            if used >> si & 1:
                continue
            for mask in by_cell[si][tgt]:
                if mask & covered:
                    continue
                m = mask
                while m:
                    b = (m & -m).bit_length() - 1
                    owner[b] = si
                    m &= m - 1
                rec(covered | mask, used | (1 << si))
                if capped[0] or (floor is not None and len(seen) >= floor):
                    return
        return

    rec(0, 0)
    return len(seen), capped[0]
