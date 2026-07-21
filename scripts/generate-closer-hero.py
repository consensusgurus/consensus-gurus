#!/usr/bin/env python3
"""Build public/quiz-heroes/closer.png, the shared hero for the whole
"Which Is Closer" quiz family (25 quizzes, all pointing at this one file in
lib/quiz-heroes.js).

It is deliberately TEXTLESS. The hub tile lays its own title over the image
(.ttile-ov, a dark scrim rising from the bottom), so any words baked into the
art collide with the rendered title. It is also deliberately dark and centred:
tiles render background-size:cover at anything from square to 2:1, so the art
has to survive a centre crop, and a dark field keeps the white title legible.

Language-free by design so it reads for every list in the family (ballparks,
capitals, volcanoes, theme parks): a target reticle, two competing map pins,
and the two dashed runs between them.

Run from the repo root:  python3 scripts/generate-closer-hero.py
Requires Pillow. Output is committed.
"""
import math
from PIL import Image, ImageDraw, ImageFilter

W, H = 1200, 675
SS = 3                      # supersample, for clean curves
NAVY_HI = (18, 34, 68)      # centre of the field
NAVY_LO = (6, 11, 26)       # corners / bottom
RED = (226, 62, 62)
BLUE = (59, 130, 246)
GOLD = (248, 184, 74)
OUT = 'public/quiz-heroes/closer.png'

TARGET = (600, 248)
PIN_A = (392, 430)          # the farther one
PIN_B = (802, 396)          # the nearer one


def field():
    """Navy ground, brightest just behind the reticle and falling off to the
    corners, so the bottom stays dark under the tile's title scrim."""
    sm = Image.new('RGB', (120, 68))
    px = sm.load()
    cx, cy = 0.50 * 120, 0.37 * 68
    for y in range(68):
        for x in range(120):
            d = math.hypot((x - cx) / 120, (y - cy) / 68 * 0.92) / 0.62
            t = min(1.0, d) ** 1.35
            px[x, y] = tuple(int(hi + (lo - hi) * t) for hi, lo in zip(NAVY_HI, NAVY_LO))
    return sm.resize((W * SS, H * SS), Image.BICUBIC)


def graticule(img):
    """A faint globe grid, drawn on its own layer and blurred so it reads as
    texture rather than as lines competing with the pins."""
    lay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    gx, gy, R = 600 * SS, 300 * SS, 640 * SS
    ink = (120, 170, 255)
    for i in range(-4, 5):                       # parallels
        yy = gy + i * R * 0.235
        rx, ry = R * math.sqrt(max(0.04, 1 - (i * 0.235) ** 2)), R * 0.115
        d.ellipse([gx - rx, yy - ry, gx + rx, yy + ry], outline=ink + (30,), width=int(2.2 * SS))
    for i in range(-4, 5):                       # meridians
        rx = R * abs(i) * 0.25 or R * 0.03
        d.ellipse([gx - rx, gy - R, gx + rx, gy + R], outline=ink + (26,), width=int(2.2 * SS))
    lay = lay.filter(ImageFilter.GaussianBlur(1.6 * SS))
    img.alpha_composite(lay)


def rings(img):
    """Range rings off the reticle: the 'how far is it' idea, no numbers."""
    lay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    tx, ty = TARGET[0] * SS, TARGET[1] * SS
    for r, a in ((104, 46), (168, 32), (238, 20), (312, 12)):
        rr = r * SS
        d.ellipse([tx - rr, ty - rr * 0.94, tx + rr, ty + rr * 0.94],
                  outline=GOLD + (a,), width=int(1.8 * SS))
    lay = lay.filter(ImageFilter.GaussianBlur(0.9 * SS))
    img.alpha_composite(lay)


def dashed(img, p0, p1, color, alpha, width=4.0, dash=17, gap=13):
    lay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    x0, y0 = p0
    x1, y1 = p1
    L = math.hypot(x1 - x0, y1 - y0)
    ux, uy = (x1 - x0) / L, (y1 - y0) / L
    t = 26                                        # clear of the reticle
    while t < L - 44:                             # stop short of the pin
        e = min(t + dash, L - 44)
        d.line([(x0 + ux * t) * SS, (y0 + uy * t) * SS,
                (x0 + ux * e) * SS, (y0 + uy * e) * SS],
               fill=color + (alpha,), width=int(width * SS))
        t += dash + gap
    img.alpha_composite(lay)


def glow(img, x, y, color, r, a=110):
    lay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    ImageDraw.Draw(lay).ellipse([(x - r) * SS, (y - r) * SS, (x + r) * SS, (y + r) * SS],
                                fill=color + (a,))
    img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(r * 0.42 * SS)))


def pin(img, x, y, color, r=41):
    """Teardrop map marker with a punched-out centre."""
    glow(img, x, y + r * 0.7, color, r * 1.85, 96)
    sh = Image.new('RGBA', img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse([(x - r * 0.80) * SS, (y + r * 1.94) * SS, (x + r * 0.80) * SS, (y + r * 2.26) * SS],
                               fill=(2, 6, 18, 96))
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(r * 0.16 * SS)))
    lay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.ellipse([(x - r) * SS, (y - r) * SS, (x + r) * SS, (y + r) * SS], fill=color + (255,))
    d.polygon([((x - r * 0.60) * SS, (y + r * 0.60) * SS),
               ((x + r * 0.60) * SS, (y + r * 0.60) * SS),
               (x * SS, (y + r * 2.10) * SS)], fill=color + (255,))
    hr = r * 0.355
    d.ellipse([(x - hr) * SS, (y - hr) * SS, (x + hr) * SS, (y + hr) * SS], fill=(255, 255, 255, 236))
    img.alpha_composite(lay)


def reticle(img, x, y, r=46):
    """The unknown point both pins are measured against."""
    glow(img, x, y, GOLD, r * 2.1, 74)
    lay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.ellipse([(x - r) * SS, (y - r) * SS, (x + r) * SS, (y + r) * SS],
              outline=GOLD + (255,), width=int(5.0 * SS))
    d.ellipse([(x - r * 0.60) * SS, (y - r * 0.60) * SS, (x + r * 0.60) * SS, (y + r * 0.60) * SS],
              outline=(255, 255, 255, 215), width=int(2.6 * SS))
    d.ellipse([(x - r * 0.17) * SS, (y - r * 0.17) * SS, (x + r * 0.17) * SS, (y + r * 0.17) * SS],
              fill=(255, 255, 255, 255))
    for dx, dy in ((0, -1), (0, 1), (-1, 0), (1, 0)):     # crosshair ticks
        d.line([(x + dx * r * 1.14) * SS, (y + dy * r * 1.14) * SS,
                (x + dx * r * 1.62) * SS, (y + dy * r * 1.62) * SS],
               fill=GOLD + (235,), width=int(4.4 * SS))
    img.alpha_composite(lay)


def build():
    img = field().convert('RGBA')
    graticule(img)
    rings(img)
    dashed(img, TARGET, PIN_A, RED, 150)
    dashed(img, TARGET, PIN_B, BLUE, 215)
    pin(img, *PIN_A, RED)
    pin(img, *PIN_B, BLUE)
    reticle(img, *TARGET)
    # settle the bottom edge so the tile's title scrim lands on clean dark
    fade = Image.new('RGBA', img.size, (0, 0, 0, 0))
    fd = ImageDraw.Draw(fade)
    for i in range(180):
        yy = H * SS - 1 - i
        fd.line([0, yy, W * SS, yy], fill=(4, 9, 22, int(96 * (i / 180) ** 0.8)))
    img.alpha_composite(fade)
    return img.convert('RGB').resize((W, H), Image.LANCZOS)


if __name__ == '__main__':
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else OUT
    build().save(out, 'PNG', optimize=True)
    print('wrote', out)
