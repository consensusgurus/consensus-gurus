# Generate Lode's image assets: the games-grid button, the hub tile, the hero
# card, and the PWA icon set. Kept in the repo so the art can be regenerated
# from source rather than re-drawn by hand if the palette ever moves.
#
# Manrope (the site face) is not vendored in the repo, so fetch it from npm and
# convert once before running:
#     npm install @fontsource/manrope --no-save
#     python3 -c "from fontTools.ttLib import TTFont; f=TTFont('node_modules/@fontsource/manrope/files/manrope-latin-800-normal.woff'); f.flavor=None; f.save('/tmp/Manrope-800.ttf')"
#     python3 scripts/gen-lode-art.py /tmp/Manrope-800.ttf /tmp/Manrope-700.ttf
#
# The motif is the game: four stone tiles spelling LODE with the O struck in
# brass, because the core letter is the thing every word has to run through.
import os
import sys

from PIL import Image, ImageDraw, ImageFont

F800 = sys.argv[1] if len(sys.argv) > 1 else "/tmp/Manrope-800.ttf"
F700 = sys.argv[2] if len(sys.argv) > 2 else "/tmp/Manrope-700.ttf"
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")

BRASS = (161, 98, 7)
BRASS_DEEP = (122, 74, 5)
STONE = (43, 47, 56)
INK = (28, 30, 36)
CREAM = (247, 248, 250)
TILE = (254, 247, 224)
NAVY = (10, 23, 48)
FADED = (107, 114, 128)
WHITE = (255, 255, 255)

SS = 4  # supersample factor, downscaled at the end for clean edges


def font(path, size):
    return ImageFont.truetype(path, size)


def centred(d, box, text, f, fill):
    x0, y0, x1, y1 = box
    l, t, r, b = d.textbbox((0, 0), text, font=f)
    d.text((x0 + (x1 - x0 - (r - l)) / 2 - l, y0 + (y1 - y0 - (b - t)) / 2 - t), text, font=f, fill=fill)


def tile(d, box, ch, f, core, radius, outline_w):
    """One lettered stone. The core tile is filled brass with a white letter."""
    fill = BRASS if core else TILE
    line = BRASS_DEEP if core else (STONE if not core else BRASS_DEEP)
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=line, width=outline_w)
    centred(d, box, ch, f, WHITE if core else INK)


def four_tiles(size, pad, gap, radius, outline_w, bg=None):
    """The LODE motif as a 2x2 of tiles, rendered at supersample scale."""
    W = H = size * SS
    pad, gap, radius, outline_w = pad * SS, gap * SS, radius * SS, outline_w * SS
    im = Image.new("RGBA", (W, H), bg or (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cell = (W - 2 * pad - gap) / 2
    f = font(F800, int(cell * 0.62))
    for i, ch in enumerate("LODE"):
        r, c = divmod(i, 2)
        x0 = pad + c * (cell + gap)
        y0 = pad + r * (cell + gap)
        tile(d, (x0, y0, x0 + cell, y0 + cell), ch, f, ch == "O", radius, outline_w)
    return im


def save(im, *parts):
    p = os.path.join(ROOT, *parts)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    im.save(p)
    print(p)


# ── games-grid button (88x76) and hub tile (65x65) ────────────────────────────
btn = four_tiles(88, 4, 4, 5, 2).resize((88, 88), Image.LANCZOS).crop((0, 6, 88, 82))
save(btn, "games", "btn-lode.png")
save(four_tiles(65, 3, 3, 4, 2).resize((65, 65), Image.LANCZOS), "games", "tile", "lode.png")

# ── PWA icons ────────────────────────────────────────────────────────────────
icon = four_tiles(512, 74, 26, 34, 10, bg=CREAM + (255,)).resize((512, 512), Image.LANCZOS)
save(icon, "lode-icons", "icon-512.png")
save(icon.resize((192, 192), Image.LANCZOS), "lode-icons", "icon-192.png")
save(icon.resize((180, 180), Image.LANCZOS), "lode-icons", "apple-touch-icon.png")
save(icon.resize((32, 32), Image.LANCZOS), "lode-icons", "favicon-32.png")
# Maskable needs its art inside the safe zone (80% of the canvas).
mask = Image.new("RGBA", (512, 512), CREAM + (255,))
mask.paste(icon.resize((410, 410), Image.LANCZOS), (51, 51))
save(mask, "lode-icons", "icon-512-maskable.png")


# ── hero card (1200x630) and wide hero (1280x720) ────────────────────────────
def hero(W, H):
    im = Image.new("RGB", (W, H), (236, 239, 245))
    d = ImageDraw.Draw(im)
    bar = int(H * 0.043)
    d.rectangle((0, 0, W, bar), fill=NAVY)
    d.rectangle((0, H - bar, W, H), fill=NAVY)

    x = int(W * 0.052)
    ttl = font(F800, int(H * 0.175))
    d.text((x, int(H * 0.135)), "Lode", font=ttl, fill=INK)
    d.rectangle((x, int(H * 0.325), x + int(W * 0.095), int(H * 0.335)), fill=NAVY)
    d.text((x, int(H * 0.365)), "Seven letters. Rare words pay.", font=font(F800, int(H * 0.048)), fill=BRASS)
    d.text((x, int(H * 0.443)), "A free daily game from Source of Truths", font=font(F700, int(H * 0.036)), fill=FADED)
    d.text((x, int(H * 0.865)), "PLAY FREE  ·  SOURCEOFTRUTHS.COM/LODE", font=font(F800, int(H * 0.031)), fill=INK)

    # the board motif: outer letters above and below a brass core
    panel = int(H * 0.53)
    px0, py0 = int(W * 0.645), int((H - panel) / 2)
    d.rounded_rectangle((px0, py0, px0 + panel, py0 + panel), radius=int(H * 0.028), fill=TILE, outline=INK, width=max(3, int(H * 0.008)))
    cell = int(panel * 0.185)
    gap = int(panel * 0.055)
    cf = font(F800, int(cell * 0.6))
    cx = px0 + panel / 2
    rows = [("A", "G", "R"), ("N",), ("I", "T", "Y")]
    for ri, row in enumerate(rows):
        ry = py0 + panel * 0.18 + ri * (cell + gap)
        tot = len(row) * cell + (len(row) - 1) * gap
        for ci, ch in enumerate(row):
            rx = cx - tot / 2 + ci * (cell + gap)
            core = ri == 1
            d.rounded_rectangle((rx, ry, rx + cell, ry + cell), radius=int(cell * 0.17),
                                fill=BRASS if core else WHITE,
                                outline=BRASS_DEEP if core else (200, 205, 212), width=max(2, int(H * 0.004)))
            centred(d, (rx, ry, rx + cell, ry + cell), ch, cf, WHITE if core else INK)
    centred(d, (px0, py0 + panel * 0.83, px0 + panel, py0 + panel * 0.95), "GRAINY  ·  RARE  ·  +15", font(F800, int(H * 0.028)), BRASS)
    return im


save(hero(1200, 630), "quiz-heroes", "lode.png")
save(hero(1280, 720), "games", "hero", "lode.png")
