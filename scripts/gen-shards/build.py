import random, datetime, json, sys
import gen

MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December']

def gen_size(size, seed_start, want, difficulty_prefer_traps=True):
    """Return `want` distinct puzzles of given size."""
    out=[]; seen=set(); s=seed_start
    while len(out)<want and s < seed_start+20000:
        rng=random.Random(s); s+=1
        p=gen.gen_one(size,rng,want_trap=difficulty_prefer_traps,max_attempts=300)
        if p is None: continue
        key=''.join(''.join(ch or '#' for ch in row) for row in p['grid'])
        if key in seen: continue
        seen.add(key); out.append(p)
    return out, s

def puzzle_cells(p):
    # shards -> list of {cells:[[r,c,'L']...]} in SOLVED coords, uppercase
    shards=[]
    for sh in p['shards']:
        cells=[[r,c,p['grid'][r][c].upper()] for (r,c) in sorted(sh['cells'])]
        shards.append({'cells':cells})
    # deterministic-ish shuffle of shard order so the tray isn't solved-order
    return shards

def blocks_of(p):
    n=p['n']; return [[r,c] for r in range(n) for c in range(n) if p['pat'][r][c]=='#']

def difficulty(p):
    return len(p['shards'])*2 + (1 if p['trap'] else 0) + (0 if p['n']==5 else (3 if p['n']==6 else 6))

def main():
    start=datetime.date(2026,7,24)
    NDAYS=42
    dates=[start+datetime.timedelta(days=i) for i in range(NDAYS)]
    sundays=[d for d in dates if d.weekday()==6]   # Monday=0..Sunday=6
    weekdays=[d for d in dates if d.weekday()!=6]
    print(f"{len(weekdays)} weekday + {len(sundays)} Sunday dates", file=sys.stderr)

    # weekday pool: ramp size 5 (first ~55%) then 6
    n5=int(round(len(weekdays)*0.58)); n6=len(weekdays)-n5
    pool5,s=gen_size(5, 1000, n5)
    pool6,s=gen_size(6, s+1, n6)
    pool7,s=gen_size(7, s+1, len(sundays))
    print(f"generated pool5={len(pool5)} pool6={len(pool6)} pool7={len(pool7)}", file=sys.stderr)
    if len(pool5)<n5 or len(pool6)<n6 or len(pool7)<len(sundays):
        print("UNDERFILLED", file=sys.stderr); sys.exit(2)

    weekday_pool=pool5+pool6
    weekday_pool.sort(key=difficulty)   # gentle ramp: easiest first

    puzzles=[]
    wi=0; si=0; num=0
    for d in dates:
        num+=1
        if d.weekday()==6:
            p=pool7[si]; si+=1; sunday=True; start_b=150; floor=15; hints=[15,20,30]
        else:
            p=weekday_pool[wi]; wi+=1; sunday=False; start_b=100; floor=10; hints=[10,15,20]
        q=f"shards-{d.month}-{d.day}-{str(d.year)[2:]}"
        entry={
            'num':num,'quizId':q,'live':d.isoformat(),
            'dateLabel':f"{MONTHS[d.month-1]} {d.day}, {d.year}",
            'sunday':sunday,'rows':p['n'],'cols':p['n'],
            'blocks':blocks_of(p),'shards':puzzle_cells(p),
            'start':start_b,'floor':floor,'hints':hints,
            '_grid':[''.join(ch or '#' for ch in row) for row in p['grid']],
            '_trap':p['trap'],'_geom':p['geom'],
        }
        puzzles.append(entry)
    json.dump(puzzles, open('/tmp/shards-build/puzzles.json','w'))
    # summary
    for e in puzzles[:6]+puzzles[-3:]:
        print(e['num'],e['quizId'],'Sun' if e['sunday'] else 'wk',f"{e['rows']}x{e['cols']}",
              len(e['shards']),'shards','trap' if e['_trap'] else '-', e['_grid'][0]+'/'+e['_grid'][-1], file=sys.stderr)
    print(f"TOTAL {len(puzzles)} puzzles ("
          f"{sum(1 for e in puzzles if not e['sunday'])} weekday + {sum(1 for e in puzzles if e['sunday'])} Sunday)", file=sys.stderr)

main()
