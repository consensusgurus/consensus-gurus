#!/usr/bin/env node
// Generates stylized, copyright-safe schematic transit diagrams for the
// "Name the City from Its Metro Map" quiz (format: 'photo').
// Each map is an ORIGINAL stylized drawing — not a copy of any official map —
// that leans on the target system's signature shape (ring / radial / river /
// loop / grid) and its real official line COLORS, which are facts. No station
// names and no city name appear anywhere, so the image never leaks the answer.
// Output: public/metro-maps/city-01.svg .. city-12.svg (anonymous ids, shuffled
// away from answer order in the quiz file). 1000x800 landscape.
// Re-run after editing: node scripts/generate-metro-maps.mjs

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'metro-maps');
mkdirSync(OUT, { recursive: true });

const W = 1000, H = 800;
const INK = '#2b2b31';

// ---- drawing helpers -------------------------------------------------------
// A polyline with rounded caps/joins. pts = [[x,y],...].
function L(pts, color, w = 10, opts = {}) {
  const d = pts.map((p) => p.join(',')).join(' ');
  const dash = opts.dash ? ` stroke-dasharray="${opts.dash}"` : '';
  return `<polyline points="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"${dash}/>`;
}
// Smooth curve through pts (Catmull-Rom -> cubic bezier), rounded.
function curve(pts, color, w = 10) {
  if (pts.length < 3) return L(pts, color, w);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
}
function ellipseRing(cx, cy, rx, ry, color, w = 11) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
}
// A ring made of only part of an ellipse (start->end degrees), for split loops.
function arc(cx, cy, rx, ry, a0, a1, color, w = 11) {
  const rad = (d) => (d * Math.PI) / 180;
  const x0 = cx + rx * Math.cos(rad(a0)), y0 = cy + ry * Math.sin(rad(a0));
  const x1 = cx + rx * Math.cos(rad(a1)), y1 = cy + ry * Math.sin(rad(a1));
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return `<path d="M ${x0} ${y0} A ${rx} ${ry} 0 ${large} ${sweep} ${x1} ${y1}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
}
function rectRing(x, y, rw, rh, r, color, w = 11) {
  return `<rect x="${x}" y="${y}" width="${rw}" height="${rh}" rx="${r}" ry="${r}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
}
// White-cored interchange marker (classic transit "station" dot).
function stn(x, y, r = 8) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" stroke="${INK}" stroke-width="3"/>`;
}
function stns(list, r = 8) { return list.map((p) => stn(p[0], p[1], r)).join(''); }
// NYC-style colored route bullet with a white glyph.
function bullet(x, y, color, glyph, r = 21, textColor = '#ffffff') {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>` +
    `<text x="${x}" y="${y + r * 0.36}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="bold" font-size="${r * 1.05}" fill="${textColor}">${glyph}</text>`;
}
// A thick soft-blue river band.
function river(pts, w = 30) { return curve(pts, '#a9d4e6', w); }

function frame(bg, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${bg}"/>
<rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="14" fill="none" stroke="#00000014" stroke-width="2"/>
${inner}
</svg>`;
}

// ---- cities ----------------------------------------------------------------
const CITIES = {};

// 1) LONDON — Thames + yellow Circle line + Beck-style diagonals, on cream.
CITIES.london = () => {
  const parts = [];
  // River Thames (the central meander): runs W->E dipping in the middle.
  parts.push(river([[60, 430], [250, 430], [370, 540], [560, 545], [690, 435], [940, 430]], 34));
  // Piccadilly (dark blue) NE-SW diagonal
  parts.push(L([[150, 170], [500, 400], [860, 640]], '#003688', 10));
  // Victoria (light blue) NW-SE... SW-NE diagonal
  parts.push(L([[150, 660], [500, 400], [880, 190]], '#0098D4', 10));
  // Central (red) horizontal across the top
  parts.push(L([[90, 300], [500, 300], [910, 300]], '#E32017', 11));
  // Northern (black) vertical with a kink
  parts.push(L([[500, 120], [500, 300], [470, 470], [520, 690]], '#000000', 10));
  // Metropolitan (magenta) from top down into the circle
  parts.push(L([[360, 120], [400, 250], [520, 470]], '#9B0056', 10));
  // District (green) low horizontal, hugging under the circle
  parts.push(L([[120, 470], [330, 470], [690, 470], [900, 470]], '#00782A', 10));
  // Circle line (yellow) — the signature rounded loop
  parts.push(rectRing(330, 250, 370, 220, 60, '#FFD300', 12));
  // interchanges
  parts.push(stns([[500, 300], [330, 360], [700, 360], [500, 470], [400, 250], [520, 470]]));
  return frame('#f5efe2', parts.join('\n'));
};

// 2) PARIS — lines 2(blue)+6(green) form the ring; Seine curves through; dense web.
CITIES.paris = () => {
  const cx = 500, cy = 410, rx = 350, ry = 250;
  const parts = [];
  // Seine
  parts.push(river([[80, 330], [280, 360], [470, 450], [520, 470], [700, 380], [940, 400]], 26));
  // dense diagonal web (draw under the ring)
  parts.push(L([[120, 400], [880, 400]], '#FFCD00', 9));           // L1 yellow horiz
  parts.push(L([[500, 140], [500, 690]], '#CF009E', 9));           // L4 magenta vert
  parts.push(L([[170, 200], [820, 640]], '#62259D', 9));           // L14 purple diag
  parts.push(L([[180, 640], [830, 200]], '#FF7E2E', 9));           // L5 orange diag
  parts.push(L([[250, 150], [560, 690]], '#837902', 9));           // L3 olive
  parts.push(L([[150, 470], [500, 300], [860, 300]], '#FA9ABA', 9)); // L7 pink
  parts.push(L([[150, 300], [520, 520], [840, 520]], '#B6BD00', 9)); // L9 lime
  // Ring: line 2 (blue) top half, line 6 (green) bottom half
  parts.push(arc(cx, cy, rx, ry, 180, 360, '#0064B0', 12));        // top (blue)
  parts.push(arc(cx, cy, rx, ry, 0, 180, '#6ECA97', 12));          // bottom (green)
  parts.push(stns([[500, 400], [350, 320], [650, 320], [400, 520], [640, 500]]));
  return frame('#faf9f6', parts.join('\n'));
};

// 3) NEW YORK — narrow island between two rivers, vertical colored trunks, MTA bullets.
CITIES.newyork = () => {
  const parts = [];
  // Hudson (left) & East River (right) as pale bands framing "Manhattan"
  parts.push(`<path d="M 150 40 L 210 40 L 250 760 L 190 760 Z" fill="#a9d4e6"/>`);
  parts.push(`<path d="M 760 40 L 830 40 L 900 400 L 760 760 L 700 760 L 740 400 Z" fill="#a9d4e6"/>`);
  // trunks running the length of the island, fanning at the bottom (downtown)
  parts.push(L([[360, 70], [380, 300], [430, 560], [470, 720]], '#0039A6', 11)); // A/C/E blue (8th Ave)
  parts.push(L([[430, 70], [440, 300], [470, 560], [500, 720]], '#FF6319', 11)); // B/D/F/M orange (6th)
  parts.push(L([[500, 70], [500, 300], [510, 560], [530, 720]], '#EE352E', 11)); // 1/2/3 red (7th)
  parts.push(L([[300, 120], [470, 360], [545, 560], [560, 720]], '#FCCC0A', 11)); // N/Q/R/W yellow (Bway diag)
  parts.push(L([[600, 70], [590, 300], [560, 560], [575, 720]], '#00933C', 11)); // 4/5/6 green (Lex)
  // 7 line (purple) crossing to Queens (upper right), L line (grey) crossing at 14th
  parts.push(L([[470, 360], [700, 300], [860, 240]], '#B933AD', 11));
  parts.push(L([[300, 470], [520, 470], [720, 470]], '#808183', 10));
  parts.push(stns([[500, 300], [470, 360], [545, 560], [510, 470]]));
  // signature MTA bullets
  parts.push(bullet(520, 150, '#EE352E', '1'));
  parts.push(bullet(360, 200, '#0039A6', 'A'));
  parts.push(bullet(600, 210, '#00933C', '6'));
  parts.push(bullet(710, 300, '#B933AD', '7'));
  parts.push(bullet(455, 640, '#FF6319', 'F'));
  return frame('#ffffff', parts.join('\n'));
};

// 4) TOKYO — green Yamanote oval loop + colorful metro lines + inner Oedo loop.
CITIES.tokyo = () => {
  const cx = 500, cy = 400;
  const parts = [];
  // radiating metro lines (draw under the loops)
  parts.push(L([[90, 250], [500, 400], [910, 250]], '#F62E36', 10));   // Marunouchi red
  parts.push(L([[120, 400], [880, 400]], '#009BBF', 10));              // Tozai cyan (E-W)
  parts.push(L([[500, 90], [500, 710]], '#8F76D6', 10));               // Hanzomon purple (N-S)
  parts.push(L([[120, 560], [500, 400], [900, 560]], '#00BB85', 10));  // Chiyoda green
  parts.push(L([[200, 120], [500, 400], [820, 700]], '#FF9500', 10));  // Ginza orange diag
  parts.push(L([[180, 700], [500, 400], [830, 130]], '#B5A462', 10));  // Yurakucho gold diag
  // Yamanote loop (signature green oval)
  parts.push(ellipseRing(cx, cy, 300, 262, '#9ACD32', 14));
  // Oedo inner loop (magenta) — smaller offset ring
  parts.push(ellipseRing(cx + 20, cy + 10, 170, 150, '#CE045B', 9));
  // Chuo line straight across the loop (orange-red)
  parts.push(L([[210, 360], [790, 360]], '#F15A22', 9));
  parts.push(stns([[500, 138], [500, 662], [200, 400], [800, 400], [500, 400], [330, 250], [670, 250]]));
  return frame('#ffffff', parts.join('\n'));
};

// 5) MOSCOW — brown Koltsevaya ring + many bold straight radials through center.
CITIES.moscow = () => {
  const cx = 500, cy = 400, r = 232;
  const parts = [];
  const rad = [
    [[500, 80], [500, 720], '#EF161E'],   // red vertical
    [[110, 400], [890, 400], '#0078BE'],  // blue horizontal
    [[175, 150], [825, 650], '#8E479C'],  // purple diag
    [[175, 650], [825, 150], '#ED9121'],  // orange diag
    [[300, 105], [700, 695], '#4FB14E'],  // green steep diag
    [[105, 300], [895, 500], '#19C1F3'],  // cyan shallow diag
    [[105, 500], [895, 300], '#B1D332'],  // lime shallow diag
    [[300, 695], [700, 105], '#FFD702'],  // yellow steep diag
  ];
  rad.forEach((s) => parts.push(L([s[0], s[1]], s[2], 10)));
  parts.push(ellipseRing(cx, cy, r, r, '#894E35', 13)); // brown ring
  // interchange dots where radials meet the ring (8 around) + center
  const marks = [[500, 400]];
  for (let a = 0; a < 360; a += 45) {
    marks.push([cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)]);
  }
  parts.push(stns(marks, 8));
  return frame('#fbfaf8', parts.join('\n'));
};

// 6) WASHINGTON DC — six colored lines sharing central trunks, fanning at the ends.
CITIES.washingtondc = () => {
  const parts = [];
  // central E-W trunk shared by Blue / Orange / Silver (three close parallels)
  parts.push(L([[250, 430], [430, 430], [560, 430], [760, 430]], '#F7941E', 11)); // orange
  parts.push(L([[250, 448], [430, 448], [560, 448], [760, 448]], '#0077C0', 11)); // blue
  parts.push(L([[250, 466], [430, 466], [560, 466], [760, 466]], '#A1A3A1', 11)); // silver
  // fan at the west end
  parts.push(L([[430, 430], [300, 360], [150, 330]], '#F7941E', 11));
  parts.push(L([[430, 448], [300, 470], [150, 520]], '#0077C0', 11));
  parts.push(L([[430, 466], [320, 560], [180, 650]], '#A1A3A1', 11));
  // fan at the east end
  parts.push(L([[560, 430], [720, 360], [860, 340]], '#F7941E', 11));
  parts.push(L([[560, 448], [740, 470], [880, 520]], '#0077C0', 11));
  parts.push(L([[560, 466], [720, 560], [860, 650]], '#A1A3A1', 11));
  // Red line — big shallow arc across the top (Shady Grove <-> Glenmont)
  parts.push(curve([[140, 360], [320, 220], [520, 250], [700, 210], [880, 360]], '#E51937', 12));
  // Yellow + Green share a N-S trunk, split at the bottom (yellow crosses river SW)
  parts.push(L([[505, 120], [505, 300], [505, 448]], '#00A94F', 11));   // green top trunk
  parts.push(L([[520, 120], [520, 300], [520, 448]], '#FFD200', 11));   // yellow (paired)
  parts.push(L([[505, 448], [505, 600], [505, 700]], '#00A94F', 11));   // green continues S
  parts.push(L([[520, 448], [430, 580], [330, 690]], '#FFD200', 11));   // yellow branches SW
  parts.push(stns([[505, 448], [430, 439], [560, 448], [520, 300]]));
  return frame('#ffffff', parts.join('\n'));
};

// 7) BERLIN — orange S-Bahn Ringbahn + green east-west Stadtbahn + straight U-Bahn.
CITIES.berlin = () => {
  const parts = [];
  // U-Bahn straight grid (draw under)
  parts.push(L([[150, 300], [850, 300]], '#55A822', 9));   // U1 green horiz (upper)
  parts.push(L([[150, 520], [850, 520]], '#F0D722', 9));   // U4/U55 yellow horiz (lower)
  parts.push(L([[360, 120], [360, 690]], '#8C6DAB', 9));   // U6 purple vert
  parts.push(L([[640, 120], [640, 690]], '#224F86', 9));   // U8 dark blue vert
  parts.push(L([[500, 110], [500, 700]], '#F3791D', 9));   // U9 orange vert (center)
  // Ringbahn (signature orange-red rounded rectangle ring)
  parts.push(rectRing(250, 220, 500, 380, 120, '#E2001A', 13));
  // Stadtbahn S-Bahn — straight green line E-W across the ring (the viaduct)
  parts.push(L([[120, 400], [880, 400]], '#007A33', 12));
  parts.push(stns([[360, 400], [640, 400], [500, 300], [500, 520], [360, 300], [640, 520]]));
  return frame('#ffffff', parts.join('\n'));
};

// 8) MADRID — central grey Circular (L6) + colorful radials + detached MetroSur loop.
CITIES.madrid = () => {
  const cx = 500, cy = 330, r = 200;
  const parts = [];
  parts.push(L([[500, 90], [500, 560]], '#4FB4E4', 10));          // L1 light blue vert
  parts.push(L([[150, 330], [850, 330]], '#E10E17', 10));         // L2 red horiz
  parts.push(L([[230, 130], [760, 540]], '#FFD200', 10));         // L3 yellow diag
  parts.push(L([[230, 540], [770, 140], [860, 120]], '#96BF0D', 10)); // L5 green diag
  parts.push(L([[180, 250], [500, 330], [840, 430]], '#A60084', 10)); // L9 magenta
  parts.push(L([[300, 120], [500, 330], [700, 560]], '#005AA9', 10)); // L10 dark blue
  parts.push(ellipseRing(cx, cy, r, r * 0.86, '#9C9E9F', 12));    // L6 grey circular
  // MetroSur — a detached large olive loop to the south (Madrid signature)
  parts.push(ellipseRing(430, 660, 150, 96, '#8FA01E', 10));
  parts.push(stns([[cx, cy], [340, 300], [660, 300], [430, 420]]));
  return frame('#ffffff', parts.join('\n'));
};

// 9) CHICAGO — the downtown Loop rectangle + colored spokes radiating out.
CITIES.chicago = () => {
  const lx = 430, ly = 340, lw = 150, lh = 150; // the Loop rectangle
  const parts = [];
  // spokes radiating from the Loop corners
  parts.push(L([[lx, ly], [280, 210], [150, 150]], '#00A1DE', 11));        // Blue NW (O'Hare)
  parts.push(L([[lx + lw, ly], [720, 210], [860, 160]], '#62361B', 11));   // Brown NW-ish
  parts.push(L([[lx + lw / 2, ly], [lx + lw / 2, 150], [560, 90]], '#009B3A', 11)); // Green N
  parts.push(L([[lx + lw, ly + lh], [760, 620], [880, 700]], '#F9461C', 11)); // Orange SE (Midway-ish)
  parts.push(L([[lx, ly + lh], [300, 620], [170, 700]], '#E27EA6', 11));   // Pink SW
  parts.push(L([[lx + lw / 2, ly + lh], [lx + lw / 2, 640], [540, 720]], '#522398', 11)); // Purple S
  // Red line straight vertical subway through the Loop
  parts.push(L([[505, 90], [505, 340], [505, 490], [505, 710]], '#C60C30', 11));
  // Blue line straight through (Dearborn subway) horizontal-ish under
  parts.push(L([[120, 470], [430, 470], [580, 470], [880, 470]], '#00A1DE', 10));
  // the Loop rectangle (brown, the icon) with colored inner offsets
  parts.push(rectRing(lx, ly, lw, lh, 6, '#62361B', 12));
  parts.push(rectRing(lx + 10, ly + 10, lw - 20, lh - 20, 4, '#F9461C', 6));
  parts.push(stns([[lx, ly], [lx + lw, ly], [lx, ly + lh], [lx + lw, ly + lh], [505, 470]]));
  return frame('#ffffff', parts.join('\n'));
};

// 10) BEIJING — two concentric rectangular ring lines + straight crossing lines.
CITIES.beijing = () => {
  const parts = [];
  // crossing straight lines (draw under rings)
  parts.push(L([[110, 400], [890, 400]], '#A62035', 11));   // Line 1 red E-W
  parts.push(L([[500, 90], [500, 710]], '#A6217F', 11));    // Line 5 purple N-S
  parts.push(L([[330, 90], [330, 710]], '#008E9C', 10));    // Line 4 teal N-S
  parts.push(L([[670, 90], [670, 710]], '#009B77', 10));    // Line 8 green N-S
  // Line 13 — inverted-U over the north (a real Beijing signature)
  parts.push(curve([[180, 460], [180, 200], [500, 150], [820, 200], [820, 460]], '#F8D71C', 10));
  // Line 2 (blue) inner rectangle ring
  parts.push(rectRing(350, 270, 300, 260, 14, '#006CB6', 12));
  // Line 10 (light blue) outer rectangle ring
  parts.push(rectRing(210, 160, 580, 480, 20, '#009BC0', 11));
  parts.push(stns([[350, 400], [650, 400], [500, 270], [500, 530], [330, 270], [670, 530]]));
  return frame('#ffffff', parts.join('\n'));
};

// 11) BARCELONA — tilted (Eixample) diagonal grid meeting the Mediterranean coast.
CITIES.barcelona = () => {
  const parts = [];
  // sea in the bottom-right corner (coastline runs SW->NE)
  parts.push(`<path d="M 1000 300 L 1000 800 L 350 800 Z" fill="#a9d4e6"/>`);
  parts.push(`<path d="M 350 800 L 1000 300" fill="none" stroke="#7fb8cc" stroke-width="3"/>`);
  // lines on a ~30-degree tilted grid (parallel & perpendicular to the coast)
  parts.push(L([[110, 300], [520, 470], [900, 620]], '#E1000F', 11));   // L1 red ∥ coast (inland)
  parts.push(L([[150, 170], [560, 330], [940, 480]], '#00A94F', 11));   // L3 green ∥ coast
  parts.push(L([[220, 90], [640, 250], [1000, 380]], '#FDB913', 10));   // L4 yellow ∥ coast
  parts.push(L([[120, 560], [430, 250], [640, 120]], '#0079C1', 11));   // L5 blue ⟂ (to sea)
  parts.push(L([[300, 660], [560, 330], [760, 150]], '#92348C', 11));   // L2 purple ⟂
  parts.push(L([[520, 720], [720, 430], [880, 250]], '#FF9E18', 10));   // L9/L10 orange ⟂
  parts.push(stns([[520, 470], [560, 330], [430, 250], [640, 250], [560, 415]]));
  return frame('#ffffff', parts.join('\n'));
};

// 12) MEXICO CITY — big orthogonal very-colorful web, bold hot-pink Line 1 across the middle.
CITIES.mexicocity = () => {
  const parts = [];
  parts.push(L([[90, 410], [910, 410]], '#E6007E', 13));          // Line 1 hot pink (signature)
  parts.push(L([[300, 90], [300, 710]], '#005EB8', 11));          // Line 2 blue vert
  parts.push(L([[640, 90], [640, 710]], '#B4A91F', 11));          // Line 3 olive vert
  parts.push(L([[120, 250], [880, 250]], '#7EC0C4', 10));         // Line 4 cyan horiz (upper)
  parts.push(L([[120, 560], [880, 560]], '#FFDD00', 11));         // Line 5 yellow horiz (lower)
  parts.push(L([[300, 250], [640, 410], [830, 560]], '#009A44', 11)); // Line 8 green diag
  parts.push(L([[120, 620], [300, 560], [640, 320], [880, 180]], '#96005B', 11)); // Line A purple diag
  parts.push(L([[170, 150], [300, 410], [470, 690]], '#EA7C0B', 11)); // Line 7 orange
  parts.push(L([[120, 330], [880, 470]], '#C09E6B', 10));         // Line 12 gold shallow
  parts.push(stns([[300, 410], [640, 410], [300, 250], [640, 560], [300, 560], [640, 250]]));
  return frame('#ffffff', parts.join('\n'));
};

// ---- write -----------------------------------------------------------------
// Answer order in the quiz is NOT this order; file ids are anonymous so a
// player inspecting the URL cannot read the city name. Mapping kept here.
const ORDER = [
  ['city-01', 'moscow'],
  ['city-02', 'london'],
  ['city-03', 'tokyo'],
  ['city-04', 'newyork'],
  ['city-05', 'paris'],
  ['city-06', 'beijing'],
  ['city-07', 'washingtondc'],
  ['city-08', 'barcelona'],
  ['city-09', 'berlin'],
  ['city-10', 'chicago'],
  ['city-11', 'madrid'],
  ['city-12', 'mexicocity'],
];

let n = 0;
for (const [fileId, city] of ORDER) {
  const svg = CITIES[city]();
  writeFileSync(join(OUT, `${fileId}.svg`), svg);
  n++;
}
console.log(`Wrote ${n} metro maps to public/metro-maps/`);
