// Homepage blue palette (owner, 2026-08-04).
//
// The homepage was carrying four unrelated color systems at once: multicolor
// game tile art, six category hues on the slate, sixteen department hues in the
// live feed, and a green/red performance ring. Against a navy header and a blue
// CTA that read as noise. Everything on the home surface now resolves to one
// blue family.
//
// The rule is NOT "make it all one blue". Categories still need to be told
// apart at a glance, so each one gets its OWN shade inside the family, the same
// approach used for the recolored tile art: distinct values, single hue family.
//
// SCOPE: the homepage only. CAT_META (lib/DailyEndCard), DEPT_COLOR
// (lib/quiz-departments), and every game page keep their original colors, and
// are deliberately NOT imported here.

const FALLBACK = '#3d5a80';

// Daily slate categories. Ordered roughly deepest to lightest so the biggest
// categories carry the most weight on the page.
export const CAT_BLUE = {
  word: '#1e3a8a',
  numbers: '#0369a1',
  logic: '#3730a3',
  geography: '#075985',
  crowd: '#3d5a80',
  'crowd psychology': '#3d5a80',
  trivia: '#2563eb',
  'end game': '#475b78',
  endgame: '#475b78',
  cards: '#1e5f8f',
  arcade: '#0b4aa2',
};

// Quiz departments in the live feed. Sixteen departments into one family, so a
// few necessarily sit close together; the label carries the precise meaning and
// the color only groups.
export const DEPT_BLUE = {
  movies: '#1d4ed8', music: '#3730a3', gaming: '#4338ca', travel: '#0e6ba8',
  sports: '#2f6f9f', geography: '#075985', food: '#1e5fa8', business: '#3d5a80',
  science: '#1a4f7a', entertainment: '#4a4fb0', word: '#1e3a8a', literature: '#334e7a',
  history: '#2563eb', arts: '#5145cd', school: '#2f6f9f', misc: '#475b78',
};

export const catBlue = (name) => CAT_BLUE[String(name || '').toLowerCase()] || FALLBACK;
export const deptBlue = (dept) => DEPT_BLUE[String(dept || '').toLowerCase()] || DEPT_BLUE.misc;

// Completion ring. Hue no longer carries good/bad, DEPTH does: a strong run
// renders deep navy, a weak one renders pale. The arc length and the printed
// percentage were always the real readout, so nothing measurable is lost by
// dropping the green/red traffic light (owner call, 2026-08-04).
export function ringBlue(pct) {
  const p = Number(pct) || 0;
  if (p >= 90) return '#1e3a8a';
  if (p >= 70) return '#2563eb';
  if (p >= 40) return '#6f9ad8';
  return '#a9bcd8';
}
