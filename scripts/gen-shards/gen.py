import random, sys, json
from common import DICT, build_common

COMMON_FULL = build_common(7, 3.5)
CAP = 900
COMMON = {L:(ws[:CAP]) for L,ws in COMMON_FULL.items()}
# position index: IDX[L][(pos,ch)] = set of word-indices in COMMON[L]
IDX = {}
for L,ws in COMMON.items():
    d={}
    for i,w in enumerate(ws):
        for pos,ch in enumerate(w):
            d.setdefault((pos,ch), set()).add(i)
    IDX[L]=d
# ---- templates (symmetric black-square patterns); '.'=fill '#'=block ----
T5 = [
 ["##...","#....",".....","....#","...##"],
 ["...##","....#",".....","#....","##..."],
]
T6 = [
 ["##....","#.....","......","......",".....#","....##"],
 ["....##",".....#","......","......","#.....","##...."],
 ["..##..","......",".....#","#.....","......","..##.."],
 [".##...","......","#.....",".....#","......","...##."],
]
T7 = [
 ["...#...","...#...",".......","##...##",".......","...#...","...#..."],
 ["..#.#..",".......",".......","#.....#",".......",".......","..#.#.."],
 ["...#...","..#.#..",".......","#.....#",".......","..#.#..","...#..."],
]
# 8x8 (Sunday Edition, added 2026-08-01). Rotationally symmetric, every run <= 7
# letters (the word list tops out at 7), no cell isolated in both directions, fill
# region connected, 48+ letter cells. Machine-searched and kept only if the pattern
# fills 4/4 times quickly, so the per-day search never burns its budget on a
# template that cannot be filled.
T8 = [
 ["#.......","..#...#.","....#...","..#...#.",".#...#..","...#....",".#...#..",".......#"],
 ["#.......","...##...","...#....","..#...#.",".#...#..","....#...","...##...",".......#"],
 ["..#.....","...#.#..",".#.....#","....#...","...#....","#.....#.","..#.#...",".....#.."],
 [".......#",".#......",".....##.","....##..","..##....",".##.....","......#.","#......."],
 ["......#.","#.......","#..#..#.",".....#..","..#.....",".#..#..#",".......#",".#......"],
 [".#......",".....#.#","....##..","...#....","....#...","..##....","#.#.....","......#."],
 ["......#.","..#..#..","#.....#.",".#..#...","...#..#.",".#.....#","..#..#..",".#......"],
 ["..#.....","..#..#..","....#.#.",".#.....#","#.....#.",".#.#....","..#..#..",".....#.."],
 [".#...#..","....#...","..#.....","#..#.#..","..#.#..#",".....#..","...#....","..#...#."],
 ["..#.....","....#.#.","#....#..","....##..","..##....","..#....#",".#.#....",".....#.."],
 ["...#....","....###.","#..#....","..#.....",".....#..","....#..#",".###....","....#..."],
 ["..#.....",".#....##",".#......","...#..#.",".#..#...","......#.","##....#.",".....#.."],
 ["..#.....",".#....##","...#...#","....#...","...#....","#...#...","##....#.",".....#.."],
 [".#.....#",".....#..",".#.#....","..#....#","#....#..","....#.#.","..#.....","#.....#."],
 [".....#..",".#....#.","...##...","...#...#","#...#...","...##...",".#....#.","..#....."],
 [".#..#...",".....#..",".#.#....","......##","##......","....#.#.","..#.....","...#..#."],
 [".#.....#","....#..#",".##.....","...#....","....#...",".....##.","#..#....","#.....#."],
 [".......#","..#.#...",".#.....#","#.#.....",".....#.#","#.....#.","...#.#..","#......."],
 ["..#.....","...#.#..","......##",".#..#...","...#..#.","##......","..#.#...",".....#.."],
 ["#.......","...#.#..","#....##.","....#...","...#....",".##....#","..#.#...",".......#"],
]
TEMPLATES = {5:T5,6:T6,7:T7,8:T8}

def slots(pat, n):
    S=[]
    for r in range(n):
        c=0
        while c<n:
            if pat[r][c]=='.':
                s=c
                while c<n and pat[r][c]=='.': c+=1
                if c-s>=2: S.append([(r,cc) for cc in range(s,c)])
            else: c+=1
    for c in range(n):
        r=0
        while r<n:
            if pat[r][c]=='.':
                s=r
                while r<n and pat[r][c]=='.': r+=1
                if r-s>=2: S.append([(rr,c) for rr in range(s,r)])
            else: r+=1
    return S

def fill(pat, n, rng, tries=8000):
    S=slots(pat,n)
    grid=[[None]*n for _ in range(n)]
    cnt=[0]
    def cand_idxs(slot):
        L=len(slot)
        fixed=[(i,grid[r][c]) for i,(r,c) in enumerate(slot) if grid[r][c] is not None]
        idx=IDX.get(L,{})
        if not fixed:
            return list(range(len(COMMON.get(L,[]))))
        sets=[]
        for pos,ch in fixed:
            s=idx.get((pos,ch))
            if not s: return []
            sets.append(s)
        sets.sort(key=len)
        acc=set(sets[0])
        for s in sets[1:]:
            acc &= s
            if not acc: return []
        return list(acc)
    used=set()
    def bt(placed):
        cnt[0]+=1
        if cnt[0]>tries: return False
        if len(placed)==len(S): return True
        best=None;bestc=None
        for i in range(len(S)):
            if i in placed: continue
            c=cand_idxs(S[i])
            if bestc is None or len(c)<len(bestc): best=i;bestc=c
            if len(c)==0: return False
        rng.shuffle(bestc)
        slot=S[best];L=len(slot);words=COMMON[L]
        saved=[grid[r][c] for (r,c) in slot]
        for wi in bestc[:80]:
            w=words[wi]
            if w in used: continue
            for i,(r,c) in enumerate(slot): grid[r][c]=w[i]
            used.add(w); placed.add(best)
            if bt(placed): return True
            placed.discard(best); used.discard(w)
            for i,(r,c) in enumerate(slot): grid[r][c]=saved[i]
        return False
    if bt(set()): return grid
    return None

def fillable(pat,n): return [(r,c) for r in range(n) for c in range(n) if pat[r][c]=='.']

def cut(cells, rng, kmin=5,kmax=8,smin=3,smax=6,attempts=200):
    cellset=set(cells)
    adj={p:[] for p in cells}
    for (r,c) in cells:
        for dr,dc in ((0,1),(0,-1),(1,0),(-1,0)):
            if (r+dr,c+dc) in cellset: adj[(r,c)].append((r+dr,c+dc))
    ncell=len(cells)
    for _ in range(attempts):
        K=rng.randint(max(kmin, (ncell+smax-1)//smax), min(kmax, ncell//smin))
        if K<kmin or K> kmax: 
            K=max(kmin,min(kmax,round(ncell/4)))
        seeds=rng.sample(cells,K)
        owner={s:i for i,s in enumerate(seeds)}
        sizes=[1]*K
        frontier=[[s] for s in seeds]
        order=list(range(K))
        # simultaneous region growth
        active=True
        allcells=set(seeds)
        while len(allcells)<ncell:
            rng.shuffle(order)
            progress=False
            for i in order:
                if sizes[i]>=smax: continue
                opts=[]
                for cell in [x for x in frontier[i]]:
                    for nb in adj[cell]:
                        if nb not in allcells: opts.append(nb)
                if not opts: continue
                nb=rng.choice(opts)
                owner[nb]=i; sizes[i]+=1; allcells.add(nb); frontier[i].append(nb)
                progress=True
            if not progress: break
        if len(allcells)<ncell:
            # leftover cells: assign to any adjacent owned region if it stays <=smax
            leftover=[c for c in cells if c not in owner]
            ok=True
            for cell in leftover:
                placed=False
                for nb in adj[cell]:
                    if nb in owner and sizes[owner[nb]]<smax:
                        owner[cell]=owner[nb]; sizes[owner[nb]]+=1; placed=True; break
                if not placed: ok=False;break
            if not ok: continue
        # build pieces, check sizes & contiguity & min size
        pieces={}
        for cell,i in owner.items(): pieces.setdefault(i,[]).append(cell)
        pl=list(pieces.values())
        if any(len(p)<smin or len(p)>smax for p in pl): continue
        if not (kmin<=len(pl)<=kmax): continue
        # contiguity check
        good=True
        for p in pl:
            ps=set(p); seen={p[0]};st=[p[0]]
            while st:
                x=st.pop()
                for nb in adj[x]:
                    if nb in ps and nb not in seen: seen.add(nb);st.append(nb)
            if len(seen)!=len(p): good=False;break
        if good: return pl
    return None

def norm_shard(cells, grid):
    mr=min(r for r,c in cells); mc=min(c for r,c in cells)
    offs={}
    for (r,c) in cells: offs[(r-mr,c-mc)]=grid[r][c]
    return offs, (mr,mc)

def runs_valid(gridletters, pat, n):
    # gridletters: dict (r,c)->ch ; check all runs len>=2 in DICT
    def get(r,c): return gridletters.get((r,c))
    for r in range(n):
        c=0
        while c<n:
            if pat[r][c]=='.':
                s=c;w=''
                while c<n and pat[r][c]=='.': w+=get(r,c); c+=1
                if len(w)>=2 and w.lower() not in DICT: return False
            else: c+=1
    for c in range(n):
        r=0
        while r<n:
            if pat[r][c]=='.':
                s=r;w=''
                while r<n and pat[r][c]=='.': w+=get(r,c); r+=1
                if len(w)>=2 and w.lower() not in DICT: return False
            else: r+=1
    return True

def enumerate_solutions(shards, fill_cells, pat, n, cap=3, nodecap=400000):
    # shards: list of {offs: {(dr,dc):ch}}
    fset=set(fill_cells)
    shp=[frozenset(s['offs'].keys()) for s in shards]
    valid_grids=set(); shape_grids=set()
    nodes=[0]
    used=[False]*len(shards)
    cover={}  # cell -> (shardidx letter)
    order_cells=sorted(fill_cells)
    def first_uncovered():
        for cell in order_cells:
            if cell not in cover: return cell
        return None
    def rec():
        if len(valid_grids)>=cap and len(shape_grids)>=cap: return
        nodes[0]+=1
        if nodes[0]>nodecap: return
        tgt=first_uncovered()
        if tgt is None:
            gl={cell:cover[cell][1] for cell in cover}
            sg=''.join(str(cover[cell][0]) if False else '' for cell in order_cells)
            # shape grid: map each cell to its shape signature index for geometric-count
            shpg=tuple(cover[cell][2] for cell in order_cells)
            shape_grids.add(shpg)
            if runs_valid(gl,pat,n):
                grid_str=''.join(gl[cell] for cell in order_cells)
                valid_grids.add(grid_str)
            return
        tr,tc=tgt
        for i in range(len(shards)):
            if used[i]: continue
            for (dr,dc) in shards[i]['offs']:
                otr=tr-dr; otc=tc-dc
                cells=[]
                okp=True
                for (odr,odc),ch in shards[i]['offs'].items():
                    cc=(otr+odr, otc+odc)
                    if cc not in fset or cc in cover: okp=False;break
                    cells.append((cc,ch))
                if not okp: continue
                sig=tuple(sorted(shp[i]))  # shape signature for geometric dedupe
                for (cc,ch) in cells: cover[cc]=(i,ch,sig)
                used[i]=True
                rec()
                used[i]=False
                for (cc,ch) in cells: del cover[cc]
                if nodes[0]>nodecap: return
        return
    rec()
    return valid_grids, shape_grids, nodes[0]

def gen_one(n, rng, want_trap=True, max_attempts=200):
    templ=TEMPLATES[n]
    if n==5: km,kx=5,7
    elif n==6: km,kx=6,8
    else: km,kx=7,10
    for _ in range(max_attempts):
        pat=templ[rng.randrange(len(templ))]
        grid=fill(pat,n,rng)
        if grid is None: continue
        cells=fillable(pat,n)
        fallback=None
        for _c in range(8):
            pl=cut(cells,rng,kmin=km,kmax=kx,smin=3,smax=6)
            if pl is None: continue
            shards=[]
            for p in pl:
                offs,anchor=norm_shard(p,grid)
                shards.append({'offs':offs,'anchor':anchor,'cells':p})
            vg,sg,nodes=enumerate_solutions(shards,cells,pat,n)
            if len(vg)!=1: continue
            res=dict(pat=pat,n=n,grid=grid,cells=cells,shards=shards,trap=len(sg)>=2,geom=len(sg),nodes=nodes)
            if res['trap'] or not want_trap:
                return res
            if fallback is None: fallback=res
        if fallback is not None:
            return fallback
    return None

if __name__=='__main__':
    seed=int(sys.argv[1]) if len(sys.argv)>1 else 1
    size=int(sys.argv[2]) if len(sys.argv)>2 else 5
    rng=random.Random(seed)
    p=gen_one(size,rng)
    if p is None: print("FAIL"); sys.exit(1)
    for row in p['grid']: print(''.join(ch or '#' for ch in row))
    print("shards", len(p['shards']), "trap", p['trap'], "geomTilings", p['geom'], "nodes", p['nodes'])
    for s in p['shards']:
        print(sorted(s['offs'].items()))
