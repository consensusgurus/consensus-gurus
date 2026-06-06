// Source directory aggregation.
//
// Collapses the many raw source entries scattered across LISTS into a clean,
// deduped roster of the PUBLICATIONS behind the consensus, each with a logo
// (favicon) and a count of how many lists it contributes to. Used by the
// homepage "sources" hover popover and the /sources page.
//
// Grouping is by registrable domain (eTLD+1) derived from each source's `url`,
// which auto-merges year/city variants that share a domain
// (la.eater.com + ny.eater.com -> Eater; the World's-50-Best year editions; etc).
// Sources with no url are merged into their brand via ID_TO_DOMAIN where known,
// otherwise shown as a text-only chip keyed by their cleaned label.

import { LISTS } from './data';

// Two-level public suffixes, so eTLD+1 extraction doesn't collapse e.g.
// telegraph.co.uk down to "co.uk".
const TWO_LEVEL_TLDS = new Set([
  'co.uk', 'org.uk', 'gov.uk', 'ac.uk', 'com.au', 'net.au', 'co.nz',
  'co.il', 'com.br', 'co.za', 'com.mx', 'co.jp', 'com.tr', 'com.sg',
]);

function registrableDomain(hostname) {
  const h = String(hostname || '').replace(/^www\./, '').toLowerCase();
  const parts = h.split('.').filter(Boolean);
  if (parts.length <= 2) return h;
  const lastTwo = parts.slice(-2).join('.');
  if (TWO_LEVEL_TLDS.has(lastTwo)) return parts.slice(-3).join('.');
  return parts.slice(-2).join('.');
}

// Sister/regional domains folded into one canonical brand domain.
const DOMAIN_ALIASES = {
  'cntraveller.com': 'cntraveler.com',
  'yelp.co.uk': 'yelp.com',
  'yelp.ca': 'yelp.com',
};

// No-url sources merged into their brand by source id.
const ID_TO_DOMAIN = {
  google: 'google.com',
  yelp: 'yelp.com',
  imdb: 'imdb.com',
  amazon: 'amazon.com',
  amazonreviews: 'amazon.com',
  timeout: 'timeout.com',
  letterboxd: 'letterboxd.com',
  rt: 'rottentomatoes.com',
  infatuation: 'theinfatuation.com',
  tripadvisor: 'tripadvisor.com',
  miaminewtimes: 'miaminewtimes.com',
  eater: 'eater.com',
  worlds50best: 'theworlds50best.com',
  bostondotcom: 'boston.com',
  latimes: 'latimes.com',
  billionaire: 'billionaire.com',
  cltampa: 'cltampa.com',
  hotdinners: 'hot-dinners.com',
  michelin: 'guide.michelin.com',
  michelin_starred: 'guide.michelin.com',
  michelin_bestof: 'guide.michelin.com',
  walmart: 'walmart.com',
  target: 'target.com',
  untappd: 'untappd.com',
  beeradvocate: 'beeradvocate.com',
  tampamag: 'tampamagazine.com',
  tampa_mag_2026: 'tampamagazine.com',
  tampa_mag_2025: 'tampamagazine.com',
};

// Internal, synthetic scoring sources that are NOT external publications and
// should never appear in the public source roster.
const EXCLUDE_IDS = new Set([
  'ai',          // legacy consensus seed (never a real source)
  'positioning', // launch-price positioning axis for tech lists
  'pricing',     // live hotel pricing axis
  'sot',         // Source of Truths in-house house ranking
  'footprint',   // studio/location-count axis
  'peakbeers',   // computed per-beer average axis
  'campusvoices',// synthetic aggregate of student papers
]);

// Curated brand names for domains whose raw labels vary by city/edition/year,
// so the roster shows one clean name. Long-tail domains fall back to an
// auto-clean of their most common label.
const BRAND_NAMES = {
  'timeout.com': 'Time Out',
  'yelp.com': 'Yelp',
  'google.com': 'Google Reviews',
  'theinfatuation.com': 'The Infatuation',
  'amazon.com': 'Amazon',
  'michelin.com': 'Michelin Guide',
  'theworlds50best.com': "World's 50 Best",
  'rottentomatoes.com': 'Rotten Tomatoes',
  'cntraveler.com': 'Condé Nast Traveler',
  'eater.com': 'Eater',
  'tabelog.com': 'Tabelog',
  'goodreads.com': 'Goodreads',
  'tripadvisor.com': 'Tripadvisor',
  'nytimes.com': 'Wirecutter',
  'usnews.com': 'U.S. News',
  'onebite.app': 'One Bite by Dave Portnoy',
  'imdb.com': 'IMDb',
  'letterboxd.com': 'Letterboxd',
  'forbestravelguide.com': 'Forbes Travel Guide',
  'thegreatestbooks.org': 'The Greatest Books',
  'hopculture.com': 'Hop Culture',
  'trip.com': 'Trip.com',
  'cnn.com': 'CNN Underscored',
  'boston.com': 'Boston.com',
  'tampamagazine.com': 'Tampa Magazine',
  'cntraveller.com': 'Condé Nast Traveller',
};

// Reduce a raw source label to a brand-ish name when no curated name exists.
function cleanLabel(label) {
  let s = String(label || '').trim();
  if (!s) return '';
  // Keep the part before a " · " qualifier ("Yelp · Ranked by Rating" -> "Yelp").
  if (s.includes(' · ')) s = s.split(' · ')[0].trim();
  // Drop a trailing parenthetical ("(by key tier)", "(unordered roundup)").
  s = s.replace(/\s*\([^)]*\)\s*$/g, '').trim();
  // Drop a trailing month + year or bare year / year-range.
  s = s.replace(/\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}$/i, '').trim();
  s = s.replace(/\s+\d{4}(?:\s*[-–]\s*\d{2,4})?$/, '').trim();
  return s || String(label || '').trim();
}

function faviconUrl(domain) {
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

let _cache = null;

// Returns the deduped publication roster:
//   [{ key, name, domain, favicon, count }]  sorted by count desc, then name.
export function getAllSources() {
  if (_cache) return _cache;

  // group key -> { domain, lists:Set, labelCounts:{} }
  const groups = {};

  for (const list of LISTS) {
    const src = list.sources || {};
    // Track which group keys this list touched, so each list counts once
    // toward a source even if it appears under two ids in the same list.
    const seenKeys = new Set();

    for (const sid of Object.keys(src)) {
      if (EXCLUDE_IDS.has(sid)) continue;
      const s = src[sid] || {};

      let domain = null;
      if (s.url) {
        try {
          domain = registrableDomain(new URL(s.url).hostname);
        } catch (e) {
          domain = null;
        }
      }
      if (!domain && ID_TO_DOMAIN[sid]) {
        domain = registrableDomain(ID_TO_DOMAIN[sid]);
      }
      if (domain && DOMAIN_ALIASES[domain]) domain = DOMAIN_ALIASES[domain];

      const key = domain || `id:${sid}`;
      if (!groups[key]) groups[key] = { domain, lists: new Set(), labelCounts: {} };
      groups[key].lists.add(list.id);
      if (s.label) {
        groups[key].labelCounts[s.label] = (groups[key].labelCounts[s.label] || 0) + 1;
      }
      seenKeys.add(key);
    }
  }

  const out = Object.entries(groups).map(([key, g]) => {
    // Pick the most common raw label for this group, then resolve a name.
    let topLabel = '';
    let topN = -1;
    for (const [lab, n] of Object.entries(g.labelCounts)) {
      if (n > topN) { topN = n; topLabel = lab; }
    }
    const name =
      (g.domain && BRAND_NAMES[g.domain]) ||
      cleanLabel(topLabel) ||
      key.replace(/^id:/, '');
    return {
      key,
      name,
      domain: g.domain || null,
      favicon: faviconUrl(g.domain),
      count: g.lists.size,
    };
  });

  out.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  _cache = out;
  return out;
}

// Total number of distinct publications in the roster.
export function getSourceCount() {
  return getAllSources().length;
}
