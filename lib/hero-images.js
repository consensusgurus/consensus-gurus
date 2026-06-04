// Hero photos for the top-3 tiles on the list overview page.
// Key: list ID -> item name (exact string, parenthetical included) -> path
// under /public. Images are pre-optimized WebP (~640px wide, quality ~72,
// roughly 25-60KB each) and rendered with loading="lazy" decoding="async",
// so they cost almost nothing in memory or bandwidth until scrolled into view.
export const HERO_IMAGES = {
  'best-tom-hardy-movies': {
    'Mad Max: Fury Road': '/heroes/best-tom-hardy-movies/mad-max-fury-road.webp',
    'Warrior': '/heroes/best-tom-hardy-movies/warrior.webp',
    'Locke': '/heroes/best-tom-hardy-movies/locke.webp',
  },
  'best-denzel-washington-movies': {
    'Malcolm X': '/heroes/best-denzel-washington-movies/malcolm-x.webp',
    'Training Day': '/heroes/best-denzel-washington-movies/training-day.webp',
    'Glory': '/heroes/best-denzel-washington-movies/glory.webp',
  },
  'best-robin-williams-movies': {
    'Good Will Hunting': '/heroes/best-robin-williams-movies/good-will-hunting.webp',
    'Dead Poets Society': '/heroes/best-robin-williams-movies/dead-poets-society.webp',
    'Good Morning, Vietnam': '/heroes/best-robin-williams-movies/good-morning-vietnam.webp',
  },
  'best-matt-damon-movies': {
    'Good Will Hunting': '/heroes/best-matt-damon-movies/good-will-hunting.webp',
    'The Martian': '/heroes/best-matt-damon-movies/the-martian.webp',
    'The Departed': '/heroes/best-matt-damon-movies/the-departed.webp',
  },
  'best-ben-affleck-movies': {
    'Good Will Hunting': '/heroes/best-ben-affleck-movies/good-will-hunting.webp',
    'Argo': '/heroes/best-ben-affleck-movies/argo.webp',
    'Gone Girl': '/heroes/best-ben-affleck-movies/gone-girl.webp',
  },
  'best-meryl-streep-movies': {
    "Sophie's Choice": '/heroes/best-meryl-streep-movies/sophies-choice.webp',
    'Kramer vs. Kramer': '/heroes/best-meryl-streep-movies/kramer-vs-kramer.webp',
    'The Devil Wears Prada': '/heroes/best-meryl-streep-movies/the-devil-wears-prada.webp',
  },
  'best-jodie-foster-movies': {
    'The Silence of the Lambs': '/heroes/best-jodie-foster-movies/the-silence-of-the-lambs.webp',
    'Taxi Driver': '/heroes/best-jodie-foster-movies/taxi-driver.webp',
    'The Accused': '/heroes/best-jodie-foster-movies/the-accused.webp',
  },
};
