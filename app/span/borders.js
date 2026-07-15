// Country adjacency for Span — the daily border-hop game.
//
// RULES OF THE GRAPH (also stated in the game's Help):
// - Sovereign states only. Mainland/contiguous land borders count, including
//   contiguous exclaves (Kaliningrad makes Russia border Poland and Lithuania;
//   Nakhchivan makes Azerbaijan border Turkey; Cabinda makes Angola border the
//   Republic of the Congo). Borders that exist only through overseas
//   territories do NOT count (so no France-Brazil, no Spain-Morocco, no
//   Netherlands-France). Bridges, tunnels, and causeways don't count.
// - Western Sahara is drawn with Morocco on our world map, and this graph
//   matches the map: Morocco-Mauritania connect.
// - Kosovo is on our map and in this graph (so Serbia and Albania do NOT
//   touch directly). Palestine is not on our map and sits out of v1.
// - Zambia-Botswana (the ~150m Kazungula strip) is NOT an edge, matching the
//   50m map geometry. Island states with no land border exist in the name
//   list only so typing them gives a sensible error.
//
// Verified 2026-07-12 two ways: hand-checked against the standard land-border
// list, and cross-checked against shared boundary points in lib/world-geo.js
// (the site's own map geometry). See scripts note in the repo docs.
//
// This file ships to the client (it validates moves as you type). It contains
// no puzzle answers — daily routes live in app/span/puzzles.js, server-only.

// Each pair listed once; ADJ below symmetrizes. Keep pairs alphabetical by
// first member to make diffs reviewable.
export const PAIRS = [
  // ─── Europe ───
  ['Portugal', 'Spain'],
  ['Spain', 'France'], ['Spain', 'Andorra'],
  ['Andorra', 'France'],
  ['France', 'Monaco'], ['France', 'Italy'], ['France', 'Switzerland'], ['France', 'Germany'], ['France', 'Luxembourg'], ['France', 'Belgium'],
  ['Belgium', 'Luxembourg'], ['Belgium', 'Germany'], ['Belgium', 'Netherlands'],
  ['Netherlands', 'Germany'],
  ['Luxembourg', 'Germany'],
  ['Germany', 'Switzerland'], ['Germany', 'Austria'], ['Germany', 'Czechia'], ['Germany', 'Poland'], ['Germany', 'Denmark'],
  ['Switzerland', 'Austria'], ['Switzerland', 'Liechtenstein'], ['Switzerland', 'Italy'],
  ['Liechtenstein', 'Austria'],
  ['Austria', 'Czechia'], ['Austria', 'Slovakia'], ['Austria', 'Hungary'], ['Austria', 'Slovenia'], ['Austria', 'Italy'],
  ['Italy', 'Slovenia'], ['Italy', 'San Marino'], ['Italy', 'Vatican City'],
  ['Czechia', 'Poland'], ['Czechia', 'Slovakia'],
  ['Poland', 'Slovakia'], ['Poland', 'Ukraine'], ['Poland', 'Belarus'], ['Poland', 'Lithuania'], ['Poland', 'Russia'],
  ['Slovakia', 'Ukraine'], ['Slovakia', 'Hungary'],
  ['Hungary', 'Ukraine'], ['Hungary', 'Romania'], ['Hungary', 'Serbia'], ['Hungary', 'Croatia'], ['Hungary', 'Slovenia'],
  ['Slovenia', 'Croatia'],
  ['Croatia', 'Serbia'], ['Croatia', 'Bosnia and Herzegovina'], ['Croatia', 'Montenegro'],
  ['Bosnia and Herzegovina', 'Serbia'], ['Bosnia and Herzegovina', 'Montenegro'],
  ['Serbia', 'Romania'], ['Serbia', 'Bulgaria'], ['Serbia', 'North Macedonia'], ['Serbia', 'Kosovo'], ['Serbia', 'Montenegro'],
  ['Montenegro', 'Kosovo'], ['Montenegro', 'Albania'],
  ['Kosovo', 'Albania'], ['Kosovo', 'North Macedonia'],
  ['Albania', 'North Macedonia'], ['Albania', 'Greece'],
  ['North Macedonia', 'Greece'], ['North Macedonia', 'Bulgaria'],
  ['Greece', 'Bulgaria'], ['Greece', 'Turkey'],
  ['Bulgaria', 'Turkey'], ['Bulgaria', 'Romania'],
  ['Romania', 'Moldova'], ['Romania', 'Ukraine'],
  ['Moldova', 'Ukraine'],
  ['Ukraine', 'Belarus'], ['Ukraine', 'Russia'],
  ['Belarus', 'Lithuania'], ['Belarus', 'Latvia'], ['Belarus', 'Russia'],
  ['Lithuania', 'Latvia'], ['Lithuania', 'Russia'],
  ['Latvia', 'Estonia'], ['Latvia', 'Russia'],
  ['Estonia', 'Russia'],
  ['Finland', 'Sweden'], ['Finland', 'Norway'], ['Finland', 'Russia'],
  ['Sweden', 'Norway'],
  ['Norway', 'Russia'],
  ['United Kingdom', 'Ireland'],
  // ─── Caucasus & Middle East ───
  ['Russia', 'Georgia'], ['Russia', 'Azerbaijan'], ['Russia', 'Kazakhstan'], ['Russia', 'Mongolia'], ['Russia', 'China'], ['Russia', 'North Korea'],
  ['Georgia', 'Azerbaijan'], ['Georgia', 'Armenia'], ['Georgia', 'Turkey'],
  ['Armenia', 'Azerbaijan'], ['Armenia', 'Iran'], ['Armenia', 'Turkey'],
  ['Azerbaijan', 'Iran'], ['Azerbaijan', 'Turkey'],
  ['Turkey', 'Iran'], ['Turkey', 'Iraq'], ['Turkey', 'Syria'],
  ['Syria', 'Iraq'], ['Syria', 'Jordan'], ['Syria', 'Israel'], ['Syria', 'Lebanon'],
  ['Lebanon', 'Israel'],
  ['Israel', 'Jordan'], ['Israel', 'Egypt'],
  ['Jordan', 'Iraq'], ['Jordan', 'Saudi Arabia'],
  ['Iraq', 'Saudi Arabia'], ['Iraq', 'Kuwait'], ['Iraq', 'Iran'],
  ['Kuwait', 'Saudi Arabia'],
  ['Saudi Arabia', 'Qatar'], ['Saudi Arabia', 'United Arab Emirates'], ['Saudi Arabia', 'Oman'], ['Saudi Arabia', 'Yemen'],
  ['United Arab Emirates', 'Oman'],
  ['Oman', 'Yemen'],
  ['Iran', 'Turkmenistan'], ['Iran', 'Afghanistan'], ['Iran', 'Pakistan'],
  // ─── Central, South & East Asia ───
  ['Kazakhstan', 'China'], ['Kazakhstan', 'Kyrgyzstan'], ['Kazakhstan', 'Uzbekistan'], ['Kazakhstan', 'Turkmenistan'],
  ['Uzbekistan', 'Kyrgyzstan'], ['Uzbekistan', 'Tajikistan'], ['Uzbekistan', 'Afghanistan'], ['Uzbekistan', 'Turkmenistan'],
  ['Turkmenistan', 'Afghanistan'],
  ['Kyrgyzstan', 'Tajikistan'], ['Kyrgyzstan', 'China'],
  ['Tajikistan', 'Afghanistan'], ['Tajikistan', 'China'],
  ['Afghanistan', 'China'], ['Afghanistan', 'Pakistan'],
  ['Pakistan', 'China'], ['Pakistan', 'India'],
  ['India', 'China'], ['India', 'Nepal'], ['India', 'Bhutan'], ['India', 'Bangladesh'], ['India', 'Myanmar'],
  ['Nepal', 'China'],
  ['Bhutan', 'China'],
  ['Bangladesh', 'Myanmar'],
  ['China', 'Mongolia'], ['China', 'Myanmar'], ['China', 'Laos'], ['China', 'Vietnam'], ['China', 'North Korea'],
  ['North Korea', 'South Korea'],
  // ─── Southeast Asia ───
  ['Myanmar', 'Laos'], ['Myanmar', 'Thailand'],
  ['Thailand', 'Laos'], ['Thailand', 'Cambodia'], ['Thailand', 'Malaysia'],
  ['Laos', 'Vietnam'], ['Laos', 'Cambodia'],
  ['Vietnam', 'Cambodia'],
  ['Malaysia', 'Indonesia'], ['Malaysia', 'Brunei'],
  ['Indonesia', 'Papua New Guinea'], ['Indonesia', 'Timor-Leste'],
  // ─── Africa ───
  ['Morocco', 'Algeria'], ['Morocco', 'Mauritania'],
  ['Algeria', 'Tunisia'], ['Algeria', 'Libya'], ['Algeria', 'Niger'], ['Algeria', 'Mali'], ['Algeria', 'Mauritania'],
  ['Tunisia', 'Libya'],
  ['Libya', 'Niger'], ['Libya', 'Chad'], ['Libya', 'Sudan'], ['Libya', 'Egypt'],
  ['Egypt', 'Sudan'],
  ['Mauritania', 'Mali'], ['Mauritania', 'Senegal'],
  ['Senegal', 'Mali'], ['Senegal', 'Guinea'], ['Senegal', 'Guinea-Bissau'], ['Senegal', 'The Gambia'],
  ['Guinea-Bissau', 'Guinea'],
  ['Guinea', 'Mali'], ['Guinea', 'Ivory Coast'], ['Guinea', 'Liberia'], ['Guinea', 'Sierra Leone'],
  ['Sierra Leone', 'Liberia'],
  ['Liberia', 'Ivory Coast'],
  ['Ivory Coast', 'Mali'], ['Ivory Coast', 'Burkina Faso'], ['Ivory Coast', 'Ghana'],
  ['Mali', 'Niger'], ['Mali', 'Burkina Faso'],
  ['Burkina Faso', 'Niger'], ['Burkina Faso', 'Benin'], ['Burkina Faso', 'Togo'], ['Burkina Faso', 'Ghana'],
  ['Ghana', 'Togo'],
  ['Togo', 'Benin'],
  ['Benin', 'Niger'], ['Benin', 'Nigeria'],
  ['Niger', 'Chad'], ['Niger', 'Nigeria'],
  ['Nigeria', 'Chad'], ['Nigeria', 'Cameroon'],
  ['Chad', 'Cameroon'], ['Chad', 'Central African Republic'], ['Chad', 'Sudan'],
  ['Cameroon', 'Central African Republic'], ['Cameroon', 'Republic of the Congo'], ['Cameroon', 'Gabon'], ['Cameroon', 'Equatorial Guinea'],
  ['Equatorial Guinea', 'Gabon'],
  ['Gabon', 'Republic of the Congo'],
  ['Republic of the Congo', 'Central African Republic'], ['Republic of the Congo', 'Democratic Republic of the Congo'], ['Republic of the Congo', 'Angola'],
  ['Central African Republic', 'Sudan'], ['Central African Republic', 'South Sudan'], ['Central African Republic', 'Democratic Republic of the Congo'],
  ['Sudan', 'South Sudan'], ['Sudan', 'Ethiopia'], ['Sudan', 'Eritrea'],
  ['South Sudan', 'Democratic Republic of the Congo'], ['South Sudan', 'Uganda'], ['South Sudan', 'Kenya'], ['South Sudan', 'Ethiopia'],
  ['Eritrea', 'Ethiopia'], ['Eritrea', 'Djibouti'],
  ['Djibouti', 'Ethiopia'], ['Djibouti', 'Somalia'],
  ['Ethiopia', 'Somalia'], ['Ethiopia', 'Kenya'],
  ['Somalia', 'Kenya'],
  ['Kenya', 'Uganda'], ['Kenya', 'Tanzania'],
  ['Uganda', 'Democratic Republic of the Congo'], ['Uganda', 'Rwanda'], ['Uganda', 'Tanzania'],
  ['Rwanda', 'Democratic Republic of the Congo'], ['Rwanda', 'Burundi'], ['Rwanda', 'Tanzania'],
  ['Burundi', 'Democratic Republic of the Congo'], ['Burundi', 'Tanzania'],
  ['Democratic Republic of the Congo', 'Tanzania'], ['Democratic Republic of the Congo', 'Zambia'], ['Democratic Republic of the Congo', 'Angola'],
  ['Tanzania', 'Zambia'], ['Tanzania', 'Malawi'], ['Tanzania', 'Mozambique'],
  ['Angola', 'Zambia'], ['Angola', 'Namibia'],
  ['Zambia', 'Namibia'], ['Zambia', 'Zimbabwe'], ['Zambia', 'Mozambique'], ['Zambia', 'Malawi'],
  ['Malawi', 'Mozambique'],
  ['Mozambique', 'Zimbabwe'], ['Mozambique', 'South Africa'], ['Mozambique', 'Eswatini'],
  ['Zimbabwe', 'South Africa'], ['Zimbabwe', 'Botswana'],
  ['Botswana', 'Namibia'], ['Botswana', 'South Africa'],
  ['Namibia', 'South Africa'],
  ['South Africa', 'Eswatini'], ['South Africa', 'Lesotho'],
  // ─── Americas ───
  ['Canada', 'United States'],
  ['United States', 'Mexico'],
  ['Mexico', 'Guatemala'], ['Mexico', 'Belize'],
  ['Guatemala', 'Belize'], ['Guatemala', 'Honduras'], ['Guatemala', 'El Salvador'],
  ['El Salvador', 'Honduras'],
  ['Honduras', 'Nicaragua'],
  ['Nicaragua', 'Costa Rica'],
  ['Costa Rica', 'Panama'],
  ['Panama', 'Colombia'],
  ['Colombia', 'Venezuela'], ['Colombia', 'Brazil'], ['Colombia', 'Peru'], ['Colombia', 'Ecuador'],
  ['Venezuela', 'Brazil'], ['Venezuela', 'Guyana'],
  ['Guyana', 'Brazil'], ['Guyana', 'Suriname'],
  ['Suriname', 'Brazil'],
  ['Ecuador', 'Peru'],
  ['Peru', 'Brazil'], ['Peru', 'Bolivia'], ['Peru', 'Chile'],
  ['Brazil', 'Bolivia'], ['Brazil', 'Paraguay'], ['Brazil', 'Argentina'], ['Brazil', 'Uruguay'],
  ['Bolivia', 'Paraguay'], ['Bolivia', 'Argentina'], ['Bolivia', 'Chile'],
  ['Paraguay', 'Argentina'],
  ['Chile', 'Argentina'],
  ['Argentina', 'Uruguay'],
  ['Haiti', 'Dominican Republic'],
];

// Typing aliases: normalized exact-match only (never substring), so short
// forms are safe. Normalization lowercases, strips accents and non-letters.
export const ALIASES = {
  'United States': ['usa', 'us', 'america', 'united states of america'],
  'United Kingdom': ['uk', 'britain', 'great britain'],
  'United Arab Emirates': ['uae', 'emirates'],
  'Democratic Republic of the Congo': ['drc', 'dr congo', 'congo kinshasa', 'democratic republic of congo'],
  'Republic of the Congo': ['congo brazzaville', 'congo republic', 'republic of congo'],
  'Ivory Coast': ["cote d'ivoire", 'cote divoire'],
  'Myanmar': ['burma'],
  'Czechia': ['czech republic'],
  'North Macedonia': ['macedonia'],
  'Eswatini': ['swaziland'],
  'Timor-Leste': ['east timor', 'timor leste'],
  'Netherlands': ['holland', 'the netherlands'],
  'Vatican City': ['vatican', 'holy see'],
  'Bosnia and Herzegovina': ['bosnia', 'bosnia herzegovina'],
  'Papua New Guinea': ['png'],
  'The Gambia': ['gambia'],
  'South Korea': ['republic of korea'],
  'North Korea': ['dprk'],
  'Kyrgyzstan': ['kirghizia', 'kyrgyz republic'],
  'Central African Republic': ['central african rep'],
  'Saudi Arabia': ['ksa'],
};

// name -> Set(neighbors)
export function buildAdj() {
  const adj = {};
  for (const [a, b] of PAIRS) {
    (adj[a] = adj[a] || new Set()).add(b);
    (adj[b] = adj[b] || new Set()).add(a);
  }
  return adj;
}

export const COUNTRIES = Object.keys(buildAdj()).sort();

export function normName(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '');
}

// normalized string -> canonical country name (names + aliases)
export function buildLookup() {
  const m = new Map();
  for (const c of COUNTRIES) m.set(normName(c), c);
  for (const [c, list] of Object.entries(ALIASES)) {
    for (const a of list) m.set(normName(a), c);
  }
  return m;
}

// Normalize the optional `blocked` argument (a country name, an array, a
// Set, or nothing) into a Set. Used by the Sunday Edition "avoid" rule and
// by hints that must route around the player's existing chain.
function blockSet(blocked) {
  if (!blocked) return null;
  if (blocked instanceof Set) return blocked;
  return new Set(Array.isArray(blocked) ? blocked : [blocked]);
}

// BFS shortest hop count between two countries; -1 if unreachable.
// `blocked` (optional): country name / array / Set that the path may not enter.
export function shortestHops(adj, from, to, blocked) {
  if (from === to) return 0;
  const block = blockSet(blocked);
  const seen = new Set([from]);
  let frontier = [from];
  let d = 0;
  while (frontier.length) {
    d += 1;
    const next = [];
    for (const c of frontier) {
      for (const n of adj[c] || []) {
        if (seen.has(n) || (block && block.has(n))) continue;
        if (n === to) return d;
        seen.add(n);
        next.push(n);
      }
    }
    frontier = next;
  }
  return -1;
}

// One shortest route (for the reveal / hint), BFS parent-tracking.
// `blocked` (optional): country name / array / Set that the route may not enter.
export function shortestRoute(adj, from, to, blocked) {
  if (from === to) return [from];
  const block = blockSet(blocked);
  const parent = { [from]: null };
  let frontier = [from];
  while (frontier.length) {
    const next = [];
    for (const c of frontier) {
      for (const n of adj[c] || []) {
        if (n in parent || (block && block.has(n))) continue;
        parent[n] = c;
        if (n === to) {
          const path = [to];
          let cur = c;
          while (cur) { path.unshift(cur); cur = parent[cur]; }
          return path;
        }
        next.push(n);
      }
    }
    frontier = next;
  }
  return null;
}

// BFS distances from one country to every reachable country; used to find
// ALL countries that sit on some shortest road (v is on one iff
// dist(start,v) + dist(v,end) === par). `blocked` as in shortestHops.
export function distancesFrom(adj, from, blocked) {
  const block = blockSet(blocked);
  const dist = { [from]: 0 };
  let frontier = [from];
  let d = 0;
  while (frontier.length) {
    d += 1;
    const next = [];
    for (const c of frontier) {
      for (const n of adj[c] || []) {
        if (n in dist || (block && block.has(n))) continue;
        dist[n] = d;
        next.push(n);
      }
    }
    frontier = next;
  }
  return dist;
}

// A shortest SIMPLE route from `from` to `to` that passes through `via`
// (the Sunday Edition "via" rule). Two BFS legs; the second leg is kept
// disjoint from the first by blocking it (and vice versa if the first try
// comes up long). Puzzles are validated so a disjoint composition always
// achieves hops(from,via) + hops(via,to); the naive concat is a display-only
// fallback that never ships for a validated puzzle.
export function viaRoute(adj, from, via, to) {
  const leg1 = shortestRoute(adj, from, via);
  if (!leg1) return null;
  const leg2 = shortestRoute(adj, via, to, new Set(leg1.filter((c) => c !== via)));
  if (leg2 && leg2.length - 1 === shortestHops(adj, via, to)) return [...leg1, ...leg2.slice(1)];
  const leg2b = shortestRoute(adj, via, to);
  if (!leg2b) return null;
  const leg1b = shortestRoute(adj, from, via, new Set(leg2b.filter((c) => c !== via)));
  if (leg1b && leg1b.length - 1 === shortestHops(adj, from, via)) return [...leg1b, ...leg2b.slice(1)];
  return [...leg1, ...leg2b.slice(1)];
}
