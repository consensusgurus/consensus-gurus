// A one-page PDF of the whole consensus, including the full source-by-source
// breakdown grid: rank, team, composite score, and every source's own rank.
//
// The bytes are emitted by hand rather than pulled from a PDF library, on
// purpose. The document is a text table in a base-14 font, which is the one
// case PDF makes genuinely easy, and the alternative was adding a heavy
// dependency (@react-pdf/renderer and friends) to a repo whose full build does
// not fit in the sandbox, so it could not be verified before shipping. No
// dependency, no build risk, and the output is a real .pdf rather than a print
// stylesheet the reader has to drive themselves.
//
// Helvetica and Helvetica-Bold are two of the 14 fonts every PDF reader is
// required to have, so nothing is embedded and the file stays a few KB.

const ENC = new TextEncoder();

// Helvetica advance widths, /1000 em, for the ASCII range. Needed for real
// right-alignment and for truncating a long team name to its column: guessing
// at an average character width visibly misaligns a numeric column.
const W_REG = { ' ': 278, '!': 278, '"': 355, '#': 556, $: 556, '%': 889, '&': 667, "'": 191, '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278, 0: 556, 1: 556, 2: 556, 3: 556, 4: 556, 5: 556, 6: 556, 7: 556, 8: 556, 9: 556, ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556, '@': 1015, A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500, K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611, '[': 278, '\\': 278, ']': 278, '^': 469, _: 556, '`': 333, a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222, k: 500, l: 222, m: 833, n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500 };
const W_BOLD = { ...W_REG, ' ': 278, 0: 556, 1: 556, 2: 556, 3: 556, 4: 556, 5: 556, 6: 556, 7: 556, 8: 556, 9: 556, A: 722, B: 722, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 556, K: 722, L: 611, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611, a: 556, b: 611, c: 556, d: 611, e: 556, f: 333, g: 611, h: 611, i: 278, j: 278, k: 556, l: 278, m: 889, n: 611, o: 611, p: 611, q: 611, r: 389, s: 556, t: 333, u: 611, v: 556, w: 778, x: 556, y: 556, z: 500 };

function textWidth(str, size, bold) {
  const tbl = bold ? W_BOLD : W_REG;
  let w = 0;
  for (const ch of String(str)) w += tbl[ch] != null ? tbl[ch] : 556;
  return (w / 1000) * size;
}

// Trim to fit a column, with an ellipsis, measured rather than guessed.
function fit(str, maxWidth, size, bold) {
  let s = String(str);
  if (textWidth(s, size, bold) <= maxWidth) return s;
  while (s.length > 1 && textWidth(`${s}…`, size, bold) > maxWidth) s = s.slice(0, -1);
  return `${s.trimEnd()}…`;
}

// PDF strings are wrapped in parentheses, so those and the escape character
// have to be escaped, and anything non-ASCII replaced: a raw byte over 127
// renders as mojibake in a base-14 font with no encoding declared.
function pdfStr(s) {
  return String(s)
    .replace(/…/g, '...')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/([\\()])/g, '\\$1');
}

class Content {
  constructor() { this.ops = []; }
  rect(x, y, w, h, [r, g, b]) {
    this.ops.push(`${r} ${g} ${b} rg`, `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
    return this;
  }
  text(x, y, str, { size = 8, bold = false, color = [0, 0, 0], align = 'left', width = 0 } = {}) {
    const s = pdfStr(str);
    if (!s) return this;
    let tx = x;
    if (align === 'right') tx = x + width - textWidth(str, size, bold);
    else if (align === 'center') tx = x + (width - textWidth(str, size, bold)) / 2;
    const [r, g, b] = color;
    this.ops.push('BT', `${r} ${g} ${b} rg`, `/${bold ? 'F2' : 'F1'} ${size} Tf`,
      `1 0 0 1 ${tx.toFixed(2)} ${y.toFixed(2)} Tm`, `(${s}) Tj`, 'ET');
    return this;
  }
  toString() { return this.ops.join('\n'); }
}

// `contents` is one Content per page. The object layout is laid out by hand, so
// the numbering is written out rather than left implicit: with N pages the
// catalog is 1, the page tree 2, the page objects 3..N+2, their content streams
// N+3..2N+2, and the two fonts 2N+3 and 2N+4. Every page shares the fonts.
function buildPdf(pageW, pageH, contents) {
  const N = contents.length;
  const fontR = 2 * N + 3;
  const fontB = 2 * N + 4;
  const kids = contents.map((_, i) => `${i + 3} 0 R`).join(' ');
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${kids}] /Count ${N} >>`,
    ...contents.map((_, i) =>
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] `
      + `/Resources << /Font << /F1 ${fontR} 0 R /F2 ${fontB} 0 R >> >> /Contents ${N + 3 + i} 0 R >>`),
    ...contents.map((c) => {
      const stream = c.toString();
      return `<< /Length ${ENC.encode(stream).length} >>\nstream\n${stream}\nendstream`;
    }),
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  ];

  let out = '%PDF-1.4\n';
  const offsets = [];
  objs.forEach((body, i) => {
    offsets.push(ENC.encode(out).length);
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = ENC.encode(out).length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) out += `${String(off).padStart(10, '0')} 00000 n \n`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return ENC.encode(out);
}

// lib/theme.js, as PDF 0-1 RGB.
const C = {
  ink: [0.043, 0.051, 0.071],
  slate: [0.392, 0.424, 0.478],
  muted: [0.247, 0.278, 0.341],
  accent: [0.137, 0.227, 0.388],
  blue: [0.145, 0.388, 0.922],
  ground: [0.043, 0.059, 0.102],
  white: [1, 1, 1],
  rule: [0.898, 0.906, 0.922],
  band: [0.969, 0.973, 0.980],
  amber: [0.984, 0.918, 0.812],
  sky: [0.859, 0.914, 0.996],
  gold: [0.910, 0.706, 0.227],
  silver: [0.682, 0.706, 0.741],
  bronze: [0.784, 0.541, 0.333],
};
const MEDAL = [C.gold, C.silver, C.bronze];

const TIER_LABEL = { results: 'Results', market: 'Betting markets', model: 'Analytics models' };
const TIER_ORDER = ['results', 'market', 'model'];

/*
  buildGridironPdf({ ranked, sources, tierShare, depth, fetchedAt, title, eyebrow, url })

  `sources` is the ordered column array the page renders (computeComposite's
  `columns`: the three pillars and their sources), each { id, short, label, tier,
  asOf, weight, ok, kind }. Excluded sources keep their column, as on the page, so the
  sheet does not quietly differ from the site.
*/
export function buildGridironPdf({ ranked, sources, tierShare, depth, fetchedAt, title, eyebrow, url }) {
  const PW = 612;      // US Letter portrait.
  const PH = 792;
  const M = 26;

  // The sheet PAGINATES rather than shrinking to fit (2026-09-04). At depth 50
  // one page worked because the old row height only had to fall to 14pt; the
  // full FBS board would need 4.6pt rows, which is smaller than the type sitting
  // in them. Row height is fixed and comfortable, and the board runs onto as
  // many pages as it takes. Page 1 carries the full masthead; later pages carry
  // a slim repeat, and every page repeats the column header, because a source
  // column with no name over it is unreadable on page 3.
  const weightLine = TIER_ORDER.filter((t) => tierShare[t])
    .map((t) => `${TIER_LABEL[t]} ${Math.round(tierShare[t] * 100)}%`).join('   |   ');

  const masthead = (c, first) => {
    const headH = first ? 62 : 34;
    c.rect(0, PH - headH, PW, headH, C.ground);
    if (first) {
      // Two runs so 'Truths' carries the brand blue, as the site masthead does.
      c.text(M, PH - 26, 'Source of ', { size: 13, bold: true, color: C.white });
      c.text(M + textWidth('Source of ', 13, true), PH - 26, 'Truths',
        { size: 13, bold: true, color: [0.376, 0.647, 0.980] });
      c.text(M, PH - 40, eyebrow.toUpperCase(), { size: 6.5, bold: true, color: [0.624, 0.690, 0.800] });
      c.text(M, PH - 54, title, { size: 15, bold: true, color: C.white });
      c.text(PW - M - textWidth(weightLine, 7, false), PH - 54, weightLine,
        { size: 7, color: [0.624, 0.690, 0.800] });
    } else {
      c.text(M, PH - 22, title, { size: 10, bold: true, color: C.white });
      c.text(PW - M - textWidth(weightLine, 6.5, false), PH - 22, weightLine,
        { size: 6.5, color: [0.624, 0.690, 0.800] });
    }
    c.rect(0, PH - headH - 2, PW, 2, C.blue);
    return headH;
  };

  // ---------- column geometry ----------
  const usable = PW - M * 2;
  const wRank = 20;
  const wScore = 30;
  const nSrc = sources.length;
  const wSrc = Math.min(42, Math.floor((usable - wRank - wScore - 96) / nSrc));
  const wTeam = usable - wRank - wScore - wSrc * nSrc;
  const xRank = M;
  const xTeam = xRank + wRank;
  const xScore = xTeam + wTeam;
  const xSrc = (i) => xScore + wScore + i * wSrc;

  // ---------- header row, repeated per page ----------
  const columnHeader = (c, headH) => {
    let y = PH - headH - 20;
    // tier bands across their own source columns
    let gi = 0;
    while (gi < nSrc) {
      let gj = gi;
      while (gj + 1 < nSrc && sources[gj + 1].tier === sources[gi].tier) gj++;
      const x0 = xSrc(gi);
      const w = wSrc * (gj - gi + 1);
      c.text(x0, y, fit(TIER_LABEL[sources[gi].tier], w, 5.5, true), { size: 5.5, bold: true, color: C.slate, align: 'center', width: w });
      gi = gj + 1;
    }
    y -= 10;
    c.text(xRank, y, '#', { size: 6.5, bold: true, color: C.slate });
    c.text(xTeam, y, 'TEAM', { size: 6.5, bold: true, color: C.slate });
    c.text(xScore, y, 'SCORE', { size: 6.5, bold: true, color: C.slate, align: 'right', width: wScore - 4 });
    sources.forEach((s, i) => {
      c.text(xSrc(i), y, fit((s.short || s.label).toUpperCase(), wSrc - 2, 6, true),
        { size: 6, bold: true, color: s.ok ? C.muted : C.slate, align: 'center', width: wSrc });
      c.text(xSrc(i), y - 7, s.ok ? `${(s.weight * 100).toFixed(0)}%` : 'excl',
        { size: 5.5, bold: true, color: s.ok ? C.blue : C.slate, align: 'center', width: wSrc });
    });
    y -= 12;
    c.rect(M, y, usable, 0.8, C.accent);
    return y;
  };

  // ---------- pagination ----------
  const footH = 30;
  const rowH = 12;
  const fs = 7.6;
  // Deviation shading matches app/GridironTable.jsx exactly, so the sheet and
  // the page tell the same story on a board of any depth.
  const hi = Math.max(3, Math.round(depth / 10));

  const capacity = (headH) => Math.floor((PH - headH - 20 - 10 - 12 - M - footH) / rowH);
  const pages = [];
  let at = 0;
  while (at < ranked.length) {
    const first = pages.length === 0;
    pages.push({ first, from: at, to: Math.min(ranked.length, at + capacity(first ? 62 : 34)) });
    at = pages[pages.length - 1].to;
  }

  const contents = pages.map((p, pi) => {
    const c = new Content();
    const headH = masthead(c, p.first);
    const y = columnHeader(c, headH);

    ranked.slice(p.from, p.to).forEach((r, k) => {
      const idx = p.from + k;
      const top = y - (k + 1) * rowH;
      if (idx % 2 === 1) c.rect(M, top, usable, rowH, C.band);
      const ty = top + rowH / 2 - fs * 0.34;

      // Tied teams print T<rank>, matching the page: where the composite cannot
      // separate them, neither sheet nor page invents an order.
      const rankStr = r.tied ? `T${r.rank}` : String(r.rank);
      if (r.rank <= 3) {
        c.rect(xRank - 1, top + 1, wRank - 3, rowH - 2, MEDAL[r.rank - 1]);
        c.text(xRank - 1, ty, rankStr, { size: fs, bold: true, color: C.white, align: 'center', width: wRank - 3 });
      } else {
        c.text(xRank - 1, ty, rankStr, { size: fs, color: C.slate, align: 'center', width: wRank - 3 });
      }

      c.text(xTeam, ty, fit(r.team, wTeam - 6, fs, true), { size: fs, bold: true, color: C.ink });
      c.text(xScore, ty, (r.score > 0 ? '+' : '') + r.score.toFixed(1), { size: fs, bold: true, color: C.accent, align: 'right', width: wScore - 4 });

      sources.forEach((s, i) => {
        const shown = r.shown[s.id];
        if (shown == null) {
          c.text(xSrc(i), ty, '-', { size: fs, color: [0.765, 0.788, 0.831], align: 'center', width: wSrc });
          return;
        }
        if (!s.ok) {
          c.text(xSrc(i), ty, String(shown), { size: fs - 0.6, color: [0.765, 0.788, 0.831], align: 'center', width: wSrc });
          return;
        }
        const v = r.ranks[s.id];
        const dev = v == null ? 0 : r.rank - v;
        if (dev >= hi) c.rect(xSrc(i) + 1, top + 1, wSrc - 2, rowH - 2, C.sky);
        else if (dev <= -hi) c.rect(xSrc(i) + 1, top + 1, wSrc - 2, rowH - 2, C.amber);
        c.text(xSrc(i), ty, String(shown),
          { size: shown === 'RV' ? fs - 1.2 : fs, bold: shown === 'RV', color: C.muted, align: 'center', width: wSrc });
      });
    });

    // ---------- footer ----------
    const fy = y - (p.to - p.from) * rowH - 12;
    c.rect(M, fy + 8, usable, 0.6, C.rule);
    c.text(M, fy, `Results, betting markets and analytics models; no polls  |  built ${fetchedAt}  |  blue = column ranks the team higher than the composite, amber = lower`,
      { size: 5.8, color: C.slate });
    c.text(M, fy - 8, url, { size: 5.8, bold: true, color: C.accent });
    const pg = `Ranks ${ranked[p.from].rank} to ${ranked[p.to - 1].rank}  |  page ${pi + 1} of ${pages.length}`;
    c.text(PW - M - textWidth(pg, 5.8, true), fy - 8, pg, { size: 5.8, bold: true, color: C.slate });

    return c;
  });

  return buildPdf(PW, PH, contents);
}
