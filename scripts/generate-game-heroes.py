#!/usr/bin/env python3
"""Build the daily-game hero banners in public/games/hero/.

The quiz hub's hero tiles (the photo card at the top of each browse column, and
the Quiz of the Day / Featured tiles) want a landscape image per quiz. Daily
games are abstract puzzles, so there is no honest photo for them and a stock
one would be arbitrary. Instead each game family gets a banner built from its
own button art: the icon on a white app-icon plate over the site navy, with a
soft glow tinted to the icon's dominant colour.

The white plate matters. The hero tile lays a dark scrim (rgba(8,15,35,.92) at
the bottom, fading up) over the whole image so the title stays legible, which
would swallow a light banner entirely. A bright plate punches through it.

Run from the repo root:  python3 scripts/generate-game-heroes.py
Requires Pillow. Output is committed; this only needs re-running when the
btn-*.png art changes or a new daily game ships (add it to NAMES).
"""
import os
import colorsys
from PIL import Image, ImageDraw, ImageFilter

SRC = 'public/games'
OUT = 'public/games/hero'
NAMES = ['alibi', 'carve', 'cipher', 'circa', 'crux', 'dating', 'emcee', 'extra',
         'garble', 'jester', 'links', 'outwit', 'ping', 'span', 'stet', 'suds',
         'sworn', 'tally', 'tuck', 'warmer']
W, H = 640, 360
SS = 2                      # supersample factor, for clean plate corners
PLATE, RADIUS, PAD = 194, 40, 26


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


def accent(im):
    """Most common strongly-saturated colour in the icon; site blue if it is grey."""
    small = im.resize((48, 48), Image.LANCZOS)
    counts = {}
    for r, g, b, a in list(small.getdata()):
        if a < 140:
            continue
        h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        if s < 0.28 or l < 0.12 or l > 0.93:
            continue
        key = (round(h * 24) / 24, round(s * 4) / 4, round(l * 4) / 4)
        counts[key] = counts.get(key, 0) + 1
    if not counts:
        return (91, 139, 255)                      # #5b8bff, the hub's blue
    (h, _s, _l), _n = max(counts.items(), key=lambda kv: kv[1])
    r, g, b = colorsys.hls_to_rgb(h, 0.58, 0.78)
    return (int(r * 255), int(g * 255), int(b * 255))


def ground(acc):
    """Navy field with an accent glow behind the plate, matching the hub tiles."""
    ar, ag, ab = acc
    sm = Image.new('RGB', (80, 45))
    px = sm.load()
    for y in range(45):
        for x in range(80):
            dx = (x / 79 - 0.50) / 0.60
            dy = (y / 44 - 0.40) / 0.62
            glow = (1 - min(1.0, (dx * dx + dy * dy) ** 0.5)) ** 1.7 * 0.42
            t = (x / 79) * 0.35 + (y / 44) * 0.65
            br, bg, bb = int(19 + (8 - 19) * t), int(42 + (15 - 42) * t), int(92 + (35 - 92) * t)
            px[x, y] = (int(br + (ar - br) * glow),
                        int(bg + (ag - bg) * glow),
                        int(bb + (ab - bb) * glow))
    return sm.resize((W, H), Image.BICUBIC).convert('RGBA')


def build(name):
    im = icon(name)
    canvas = ground(accent(im))

    big = Image.new('RGBA', (PLATE * SS, PLATE * SS), (0, 0, 0, 0))
    ImageDraw.Draw(big).rounded_rectangle(
        [0, 0, PLATE * SS - 1, PLATE * SS - 1], radius=RADIUS * SS, fill=(255, 255, 255, 255))
    plate = big.resize((PLATE, PLATE), Image.LANCZOS)

    inner = PLATE - PAD * 2
    sc = min(inner / im.width, inner / im.height)
    art = im.resize((max(1, int(im.width * sc)), max(1, int(im.height * sc))), Image.LANCZOS)
    plate.alpha_composite(art, ((PLATE - art.width) // 2, (PLATE - art.height) // 2))

    # Seated above the tile's title area, which occupies the bottom third.
    pos = (W // 2 - PLATE // 2, int(H * 0.40) - PLATE // 2)
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    shadow.paste(Image.new('RGBA', (PLATE, PLATE), (0, 0, 0, 120)), pos, plate)
    canvas = Image.alpha_composite(canvas, shadow.filter(ImageFilter.GaussianBlur(13)))
    canvas.alpha_composite(plate, pos)
    canvas.convert('RGB').save(os.path.join(OUT, '%s.png' % name), optimize=True)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for n in NAMES:
        build(n)
        print('wrote', os.path.join(OUT, '%s.png' % n))
