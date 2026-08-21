// Homepage brand palette (owner, 2026-08-04; recoloured 2026-08-21).
//
// The homepage was carrying four unrelated colour systems at once: multicolor game tile
// art, six category hues on the slate, sixteen department hues in the live feed, and a
// green/red performance ring. Everything on the home surface resolves to ONE family.
//
// The rule is NOT "make it all one colour". Categories still need to be told apart at a
// glance, so each gets its OWN shade inside the family: distinct values, single family.
//
// THE FAMILY IS NOW WARM SLATE, not blue, and the EXPORT NAMES ARE DELIBERATELY UNCHANGED.
// CAT_BLUE / DEPT_BLUE / catBlue / deptBlue / ringBlue are imported by name across the home
// surface; renaming them to chase a hue is how a rename codemod takes something with it.
// The name is the role, the value is the colour, exactly as with `blue` in lib/theme.js.
//
// One exception to the family, carried over from the blue version: `trivia` was the
// brightest blue (the CTA value), so it is now the CTA coral. It is the only hot chip on
// the slate and that is intentional.
//
// SCOPE: the homepage only. CAT_META (lib/DailyEndCard), DEPT_COLOR (lib/quiz-departments)
// and every game page keep their original colours, and are deliberately NOT imported here.

const FALLBACK = '#5b5a63';

// Daily slate categories. Ordered roughly deepest to lightest so the biggest categories
// carry the most weight on the page.
export const CAT_BLUE = {
  word: '#2c3140',
  numbers: '#4a5266',
  logic: '#3d3a4d',
  geography: '#3f4a4a',
  crowd: '#5b5a63',
  'crowd psychology': '#5b5a63',
  trivia: '#c04a34',
  'end game': '#4d4a52',
  endgame: '#4d4a52',
  cards: '#5a4a44',
  arcade: '#8a5a48',
};

// Quiz departments in the live feed. Sixteen departments into one family, so a few
// necessarily sit close together; the label carries the precise meaning and the colour
// only groups.
export const DEPT_BLUE = {
  movies: '#3a4152', music: '#3d3a4d', gaming: '#4a4352', travel: '#3f4a4a',
  sports: '#4a5266', geography: '#38484c', food: '#6b4a3e', business: '#5b5a63',
  science: '#334049', entertainment: '#544a5c', word: '#2c3140', literature: '#4a4740',
  history: '#8a5a48', arts: '#6d4a52', school: '#465061', misc: '#4d4a52',
};

export const catBlue = (name) => CAT_BLUE[String(name || '').toLowerCase()] || FALLBACK;
export const deptBlue = (dept) => DEPT_BLUE[String(dept || '').toLowerCase()] || DEPT_BLUE.misc;

// Completion ring. Hue does not carry good/bad, DEPTH does: a strong run renders deep, a
// weak one renders pale. The arc length and the printed percentage were always the real
// readout, so nothing measurable is lost by having dropped the green/red traffic light
// (owner call, 2026-08-04). Same four steps, now down the coral ramp.
export function ringBlue(pct) {
  const p = Number(pct) || 0;
  if (p >= 90) return '#a83f28';
  if (p >= 70) return '#c04a34';
  if (p >= 40) return '#e9917c';
  return '#e8c4bb';
}
