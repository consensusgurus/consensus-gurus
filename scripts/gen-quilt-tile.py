#!/usr/bin/env python3
"""Draw Quilt's two button tiles.

    python3 scripts/gen-quilt-tile.py

Writes public/games/btn-quilt.png and public/games/blue/btn-quilt.png, both
76x76 RGBA, which is the size every daily tile is and is load-bearing: Bracket
shipped 88x76 once and its icon rendered 28px wide in the home Daily Mastery
rail, pushing its name out of line with every other row in the column.

BOTH FILES MATTER, and the blue one fails SILENTLY. blueTile() in
app/DailyStrip.jsx rewrites /games/btn- to /games/blue/btn- for the home slate,
and tileFallback quietly swaps a missing blue file back to the full-colour
original. So a missing blue tile throws no error and logs nothing: the only
symptom is one garish tile sitting in a table of blue ones, which is how Hands
shipped.

THE DRAWING is the game: nine irregular regions as nine solid patches with heavy
navy seams between them, which is a quilt and is also exactly what the board
looks like. No digits and no internal grid, because at 76px a ninth of the tile
is 7px across: a digit there is mud, and a line around all 81 cells reads as
confetti (both were tried). That also keeps it clearly apart from Suds, whose
tile is a dark navy grid WITH digits, and from Carve's pastel 3x3 blocks.

Drawn at 4x and downsampled with LANCZOS, since the seams are sub-pixel at 76.
"""
import os
from PIL import Image, ImageDraw

S = 76           # final size, do not change
SS = 4           # supersample factor
W = S * SS
PAD = 5 * SS     # breathing room inside the rounded corner
RADIUS = 11 * SS
CELL = (W - PAD * 2) / 9.0

SEAM = (15, 31, 77, 255)      # region border, the site's deep navy ink
HAIR = (15, 31, 77, 70)       # (unused: see the seams-only note below)
EDGE = (11, 12, 14, 255)      # outer keyline

# The region map. A real generated Quilt layout (throwaway seed, confirmed
# absent from the shipped bank), so the tile shows shapes the game can actually
# produce rather than an invented pattern.
REG = [
    [1, 1, 1, 1, 1, 0, 0, 2, 2],
    [1, 1, 1, 0, 0, 0, 2, 2, 2],
    [1, 3, 0, 0, 0, 2, 2, 2, 2],
    [3, 3, 3, 4, 0, 4, 4, 8, 8],
    [6, 3, 4, 4, 4, 4, 4, 8, 5],
    [6, 3, 3, 3, 3, 8, 4, 8, 5],
    [6, 7, 7, 7, 8, 8, 8, 8, 5],
    [6, 6, 7, 7, 7, 5, 5, 5, 5],
    [6, 6, 6, 6, 7, 7, 7, 5, 5],
]

# Full colour: a patchwork. Nine distinct hues, mid-light so the navy seams and
# the white ground both read against them.
TINTS = ['#f9a8d4', '#93c5fd', '#86efac', '#fde047', '#d8b4fe',
         '#67e8f9', '#fdba74', '#cbd5e1', '#bef264']

# Blue: the same drawing on the brand ramp for the home surface. Deliberately
# all light-to-mid steps, because a deep-blue region would swallow the navy seam
# and the shapes are the whole point of the tile.
BLUES = ['#e8f2ff', '#4a8cf0', '#c2ddfe', '#245edf', '#dbe9ff',
         '#6ea6f5', '#cbe2fe', '#214bb2', '#8fbdf7']


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (255,)


def draw(tints, ground):
    img = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, W - 1, W - 1], RADIUS, fill=ground)

    def xy(r, c):
        return (PAD + c * CELL, PAD + r * CELL)

    for r in range(9):
        for c in range(9):
            x, y = xy(r, c)
            d.rectangle([x, y, x + CELL, y + CELL], fill=hexrgb(tints[REG[r][c]]))

    # SEAMS ONLY, no cell hairlines. Drawing the internal grid was the first
    # attempt and it destroys the tile: at 76px a line around every one of the
    # 81 cells reads as a checkerboard of confetti, and the nine regions, which
    # are the entire point of the game, disappear. Without it each region lands
    # as one solid patch, which is both the quilt and the board.
    for r in range(9):
        for c in range(9):
            x, y = xy(r, c)
            if c < 8 and REG[r][c + 1] != REG[r][c]:
                d.line([x + CELL, y, x + CELL, y + CELL], fill=SEAM, width=int(2.5 * SS))
            if r < 8 and REG[r + 1][c] != REG[r][c]:
                d.line([x, y + CELL, x + CELL, y + CELL], fill=SEAM, width=int(2.5 * SS))

    # the grid's own outer wall, then the tile keyline
    d.rectangle([PAD, PAD, PAD + CELL * 9, PAD + CELL * 9], outline=SEAM, width=2 * SS)
    d.rounded_rectangle([0, 0, W - 1, W - 1], RADIUS, outline=EDGE, width=SS)

    # clip everything back inside the rounded corner
    mask = Image.new('L', (W, W), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, W - 1, W - 1], RADIUS, fill=255)
    img.putalpha(mask)
    return img.resize((S, S), Image.LANCZOS)


root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
out_colour = os.path.join(root, 'public/games/btn-quilt.png')
out_blue = os.path.join(root, 'public/games/blue/btn-quilt.png')
os.makedirs(os.path.dirname(out_blue), exist_ok=True)

draw(TINTS, (255, 255, 255, 255)).save(out_colour)
draw(BLUES, (232, 242, 255, 255)).save(out_blue)

for p in (out_colour, out_blue):
    im = Image.open(p)
    assert im.size == (76, 76) and im.mode == 'RGBA', f'{p} is {im.size} {im.mode}, want (76, 76) RGBA'
    print(f'wrote {os.path.relpath(p, root)}  {im.size[0]}x{im.size[1]} {im.mode}')
