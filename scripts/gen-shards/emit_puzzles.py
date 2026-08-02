"""Render /tmp/shards-build/puzzles.json as app/shards/puzzles.js.

Matches the existing hand-written formatting exactly (2-space indent, one shard
per line) so the diff reads as data changes rather than a reformat.
"""
import json, sys

HEADER = """// Puzzle data for Shards - the daily jigsaw crossword. Imported ONLY by the
// server page (app/shards/page.js), which filters live<=today before passing
// puzzles to the client, so future grids never ship to the browser (same gating
// as every other daily).
//
// Each puzzle is a filled mini-crossword grid, shattered into rigid polyomino
// shards. `shards[i].cells` are [row, col, LETTER] in SOLVED coordinates; the
// UNIQUE reassembly is implicit in those coordinates. Uniqueness (exactly one
// tiling of the shard set whose every across/down run of 2+ is a real word) is
// proven offline by scripts/gen-shards and re-proven in scripts/verify-daily-banks.mjs
// against the shared /public/tuck-dict.txt the client also validates against.
// `blocks` are black squares. The client scrambles tray order.
//
// DIFFICULTY LADDER (owner ruling, 2026-08-01; in force from 2026-08-02):
//   Mon-Thu  6x6, start 100, floor 10
//   Fri-Sat  7x7, start 150, floor 15
//   Sunday   8x8, start 200, floor 20   <- Sunday Edition
// Every puzzle from 2026-08-02 also clears an AMBIGUITY FLOOR: the shard shapes
// must tile the outline at least 8 (6x6) / 12 (7x7) / 12 (8x8) different ways.
// The launch bank was almost entirely shape-forced, one legal tiling, so it was
// solved by fitting shapes without ever reading a letter. Cuts now carry
// repeated shard shapes on purpose, which is what makes the letters do the work.
// Days before 2026-08-02 are the original, easier bank and are left frozen.
export const PUZZLES = [
"""


def fmt(p):
    blocks = ', '.join(f"[{r},{c}]" for r, c in p['blocks'])
    lines = []
    lines.append(f"  {{ num: {p['num']}, quizId: '{p['quizId']}', live: '{p['live']}', "
                 f"dateLabel: '{p['dateLabel']}', sunday: {'true' if p['sunday'] else 'false'},")
    lines.append(f"    rows: {p['rows']}, cols: {p['cols']}, start: {p['start']}, "
                 f"floor: {p['floor']}, hints: [{', '.join(str(h) for h in p['hints'])}],")
    lines.append(f"    blocks: [{blocks}],")
    lines.append("    shards: [")
    for sh in p['shards']:
        cells = ', '.join(f"[{r},{c},'{ch}']" for r, c, ch in sh['cells'])
        lines.append(f"      {{ cells: [{cells}] }},")
    lines.append("    ] },")
    return '\n'.join(lines)


def main():
    P = json.load(open('/tmp/shards-build/puzzles.json'))
    out = [HEADER]
    for p in P:
        out.append(fmt(p) + '\n')
    out.append('];\n')
    src = ''.join(out)
    dest = sys.argv[1] if len(sys.argv) > 1 else '/tmp/shards-build/puzzles.js'
    open(dest, 'w', encoding='utf-8').write(src)
    print(f"wrote {dest}: {len(P)} puzzles, {len(src.splitlines())} lines")


if __name__ == '__main__':
    main()
