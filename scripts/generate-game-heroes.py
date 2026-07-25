#!/usr/bin/env python3
"""Build the daily-game hero banners in public/games/hero/.

The quiz hub's hero tiles (the photo card at the top of each browse column) want
a landscape image per quiz. Daily games are abstract puzzles, so there is no
honest photo for them. Instead each family gets a banner that is just its own
button icon centred on the site navy, deliberately matching how the same icons
render in the daily games strip (app/DailyStrip.jsx draws /games/btn-*.png at
30px on a flat #0e1d40 ground, no plate, no filter). Owner call, 2026-07-20:
keep it exactly that plain.

The icon sits at 38% height because the hero tile lays a bottom-weighted dark
scrim over the image for its title, so the art has to live in the upper half.

Run from the repo root:  python3 scripts/generate-game-heroes.py
Requires Pillow. Output is committed; this only needs re-running when the
btn-*.png art changes or a new daily game ships (add it to NAMES). A family
with no btn art (e.g. `closer`) gets no banner and keeps its /quiz-heroes card.
"""
import os
from PIL import Image

SRC = 'public/games'
OUT = 'public/games/hero'
NAMES = ['alibi', 'axiom', 'carve', 'cipher', 'circa', 'crux', 'dating', 'emcee', 'extra',
         'garble', 'hearsay', 'jester', 'links', 'outwit', 'outrank', 'ping', 'span', 'stet', 'suds', 'venn', 'form',
         'sworn', 'tally', 'tuck', 'warmer']
# 1280x720, not 640x360, so a retina browser DOWNSCALES this PNG into the ~280px
# tile instead of upscaling it. And the art box is small on purpose: the source
# icons are only 88x76, so anything larger is a visible upscale (the first cut
# filled half the frame and read as pixel mush at real tile size).
W, H = 1280, 720
NAVY = (14, 29, 64)         # #0e1d40, the exact .dstrip background
# Square art box (owner feedback 2026-07-23): every icon's larger dimension fills
# the SAME box, so wide motifs (cipher, dating, span) no longer render markedly
# wider than the square icons and sprawl across the hero card. Side = 30% of the
# canvas height, matching the previous square-icon size.
ART_BOX = 0.30              # icon box side, as a fraction of the canvas HEIGHT
ART_Y = 0.38                # icon centre, above the tile's title scrim


def icon(name):
    """The button art, cropped to its ink (the source PNGs are padded)."""
    im = Image.open(os.path.join(SRC, 'btn-%s.png' % name)).convert('RGBA')
    flat = Image.alpha_composite(Image.new('RGBA', im.size, (255, 255, 255, 255)), im).convert('RGB')
    ink = flat.point(lambda v: 255 if v < 250 else 0).convert('L').getbbox()
    alpha = im.split()[3].getbbox()
    if ink and alpha:
        box = (min(ink[0], alpha[0]), min(ink[1], alpha[1]),
               max(ink[2], alpha[2]), max(ink[3], alpha[3]))
    else:
        box = ink or alpha
    return im.crop(box) if box else im


def build(name):
    im = icon(name)
    box = int(H * ART_BOX)
    sc = min(box / im.width, box / im.height)
    art = im.resize((max(1, int(im.width * sc)), max(1, int(im.height * sc))), Image.LANCZOS)
    canvas = Image.new('RGBA', (W, H), NAVY + (255,))
    canvas.alpha_composite(art, (W // 2 - art.width // 2, int(H * ART_Y) - art.height // 2))
    canvas.convert('RGB').save(os.path.join(OUT, '%s.png' % name), optimize=True)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for n in NAMES:
        build(n)
        print('wrote', os.path.join(OUT, '%s.png' % n))
