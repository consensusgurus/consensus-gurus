// Server-side location resolution + aggregation for the admin player maps.
//
// Every completed game (quiz_results) carries best-effort Vercel edge-geo
// fields: country (ISO2, migration 26), region (subdivision code, 26) and city
// (name, 27). This module turns those strings back into map coordinates using
// the generated GeoNames index in lib/geo-cities.js, then aggregates the FULL
// history of located plays two ways:
//
//   users — one point per distinct player (registered user_id, else browser
//           anon_id, else lone row), pinned at their most recent located play;
//   plays — one point per location, counting every located game ever recorded.
//
// Resolution ladder per row: exact city match within the country (region code
// breaks ties between same-named cities, else largest population) -> region
// centroid -> country centroid. Rows that fall down the ladder are flagged
// approximate; rows with no country at all (played before migration 26, local
// dev, missing header) count as "unlocated" so the maps can say so.
//
// IMPORTANT: lib/geo-cities.js is ~2.3MB — this module is for SERVER code only
// (app/admin/page.js, app/api/admin/geo-map). Client components must import
// lib/admin-world-map.js + lib/geo-project.js instead, never this file.

import { CITY_DATA, REGION_CENTROIDS, COUNTRY_CENTROIDS } from './geo-cities.js';
import { WORLD } from './admin-world-map.js';
import { projectPoint } from './geo-project.js';

let cityIndex = null;
function getCityIndex() {
  if (cityIndex) return cityIndex;
  cityIndex = new Map();
  for (const rec of CITY_DATA.split(';')) {
    const parts = rec.split('~');
    if (parts.length < 2) continue;
    cityIndex.set(
      parts[0],
      parts.slice(1).map((s) => {
        const bits = s.split(',');
        return { a: bits[0] || '', lat: +bits[1], lon: +bits[2] };
      })
    );
  }
  return cityIndex;
}

// Same normalization the generator applied to GeoNames names: fold diacritics,
// lowercase, collapse anything non-alphanumeric to single spaces.
export function normCity(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

let displayNames = null;
export function countryName(cc) {
  if (!cc) return '';
  try {
    if (!displayNames && typeof Intl !== 'undefined' && Intl.DisplayNames) {
      displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    }
    const n = displayNames ? displayNames.of(cc) : null;
    return n || cc;
  } catch {
    return cc;
  }
}

// Resolve one play's geo fields. Returns null when there's nothing to go on,
// else { lat, lon, precision, approx, key, admin }:
//   precision 'city' | 'region' | 'country'  — what the pin actually is;
//   approx true  — a finer field existed but couldn't be matched, so the pin
//                  is coarser than the data (drawn dashed on the maps);
//   key   — merge key, so e.g. Springfield IL and Springfield MO stay separate
//           city points while region variants of one city fold together;
//   admin — matched subdivision code for display ("Washington, DC").
export function resolveGeo({ city, region, country }) {
  const cc = String(country || '').trim().toUpperCase();
  if (!cc) return null;
  const reg = String(region || '').trim().toUpperCase();
  if (city) {
    const cands = getCityIndex().get(`${cc}|${normCity(city)}`);
    if (cands && cands.length) {
      const hit = (reg && cands.find((c) => c.a === reg)) || cands[0];
      return {
        lat: hit.lat,
        lon: hit.lon,
        precision: 'city',
        approx: false,
        key: `${cc}|c:${normCity(city)}|${hit.a}`,
        admin: hit.a || reg,
      };
    }
  }
  if (reg) {
    const rc = REGION_CENTROIDS[`${cc}|${reg}`];
    if (rc) {
      return { lat: rc[0], lon: rc[1], precision: 'region', approx: Boolean(city), key: `${cc}|r:${reg}`, admin: reg };
    }
  }
  const kc = COUNTRY_CENTROIDS[cc];
  if (kc) {
    return { lat: kc[0], lon: kc[1], precision: 'country', approx: Boolean(city || region), key: cc, admin: '' };
  }
  return null;
}

// Short on-map label. US/CA/AU cities carry their state/province so duplicate
// names read unambiguously; region pins read "US-TX"; country pins the name.
const ADMIN_LABEL_CC = new Set(['US', 'CA', 'AU']);
function shortLabel(loc) {
  if (loc.city) {
    return ADMIN_LABEL_CC.has(loc.country) && loc.admin ? `${loc.city}, ${loc.admin}` : loc.city;
  }
  if (loc.precision === 'region' && loc.admin) return `${loc.country}-${loc.admin}`;
  return loc.countryName;
}

function addTo(agg, res, row) {
  let a = agg.get(res.key);
  if (!a) {
    a = {
      key: res.key,
      count: 0,
      approx: 0,
      lat: res.lat,
      lon: res.lon,
      precision: res.precision,
      admin: res.admin,
      country: String(row.country || '').toUpperCase(),
      city: null,
      region: null,
    };
    agg.set(res.key, a);
  }
  a.count += 1;
  if (res.approx) a.approx += 1;
  if (!a.city && row.city && res.precision === 'city') a.city = row.city;
  if (!a.region && (res.admin || row.region)) a.region = res.admin || row.region;
  return a;
}

function toPoints(agg) {
  const out = [];
  for (const a of agg.values()) {
    const cName = countryName(a.country);
    const loc = { ...a, countryName: cName };
    const [x, y] = projectPoint(WORLD, a.lon, a.lat);
    out.push({
      key: a.key,
      short: shortLabel(loc),
      city: a.city,
      region: a.region || null,
      country: a.country,
      countryName: cName,
      precision: a.precision,
      approx: a.approx > 0,
      count: a.count,
      lat: a.lat,
      lon: a.lon,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
    });
  }
  out.sort((p, q) => q.count - p.count || String(p.key).localeCompare(String(q.key)));
  return out;
}

// rows: quiz_results rows with at least { id, user_id, anon_id, created_at,
// country, region, city } — the full history, any order. Returns the payload
// the admin map panel renders.
export function buildGeoMapData(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const playAgg = new Map();
  const identBest = new Map(); // ident -> { t, res, row }
  const idents = new Set();
  const unresolved = new Map(); // city given but not matched -> row count
  let locatedPlays = 0;
  let approxPlays = 0;
  let since = '';
  for (const r of list) {
    const ident = r.user_id ? `u:${r.user_id}` : r.anon_id ? `a:${r.anon_id}` : `r:${r.id}`;
    idents.add(ident);
    const res = resolveGeo(r);
    if (!res) continue;
    locatedPlays += 1;
    if (res.approx) {
      approxPlays += 1;
      const uk = [r.city, r.region, r.country].filter(Boolean).join(', ');
      unresolved.set(uk, (unresolved.get(uk) || 0) + 1);
    }
    const t = String(r.created_at || '');
    if (t && (!since || t < since)) since = t;
    addTo(playAgg, res, r);
    const cur = identBest.get(ident);
    if (!cur || t > cur.t) identBest.set(ident, { t, res, row: r });
  }
  const userAgg = new Map();
  for (const { res, row } of identBest.values()) addTo(userAgg, res, row);
  const users = toPoints(userAgg);
  const plays = toPoints(playAgg);
  const countries = new Set();
  let cityCount = 0;
  for (const p of plays) {
    countries.add(p.country);
    if (p.precision === 'city') cityCount += 1;
  }
  return {
    since: since || null,
    users,
    plays,
    totals: {
      plays: list.length,
      locatedPlays,
      unlocatedPlays: list.length - locatedPlays,
      approxPlays,
      players: idents.size,
      locatedPlayers: identBest.size,
      unlocatedPlayers: idents.size - identBest.size,
      cities: cityCount,
      countries: countries.size,
    },
    unresolved: Array.from(unresolved.entries())
      .map(([geo, count]) => ({ geo, count }))
      .sort((a, b) => b.count - a.count),
  };
}
