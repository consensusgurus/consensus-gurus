// Lightweight, dependency-free user-agent parser for the admin analytics.
// Classifies a UA string into a coarse browser, OS, and mobile flag. This is a
// best-effort heuristic for at-a-glance traffic breakdowns, not exact device
// detection. Order matters: browsers whose UA embeds another browser's token
// (Edge/Opera/Chrome all contain "Safari"; Edge contains "Chrome") are checked
// most-specific first.
export function parseUa(ua) {
  const s = String(ua || '');
  if (!s) return { browser: null, os: null, isMobile: null };

  const isMobile = /Mobi|Android|iPhone|iPad|iPod|IEMobile|Opera Mini|Windows Phone/i.test(s);

  let browser = 'Other';
  if (/Edg(A|iOS|)?\//i.test(s)) browser = 'Edge';
  else if (/OPR\/|Opera/i.test(s)) browser = 'Opera';
  else if (/SamsungBrowser/i.test(s)) browser = 'Samsung';
  else if (/CriOS/i.test(s)) browser = 'Chrome';
  else if (/FxiOS/i.test(s)) browser = 'Firefox';
  else if (/Firefox\//i.test(s)) browser = 'Firefox';
  else if (/Chromium/i.test(s)) browser = 'Chromium';
  else if (/Chrome\//i.test(s)) browser = 'Chrome';
  else if (/Version\/.*Safari\//i.test(s)) browser = 'Safari';
  else if (/MSIE|Trident/i.test(s)) browser = 'IE';

  let os = 'Other';
  if (/iPhone|iPad|iPod/i.test(s)) os = 'iOS';
  else if (/Android/i.test(s)) os = 'Android';
  else if (/CrOS/i.test(s)) os = 'ChromeOS';
  else if (/Windows/i.test(s)) os = 'Windows';
  else if (/Mac OS X|Macintosh/i.test(s)) os = 'macOS';
  else if (/Linux/i.test(s)) os = 'Linux';

  return { browser, os, isMobile };
}

// ISO-3166 alpha-2 country from Vercel's edge geo header. Returns null when the
// header is absent (local dev, non-Vercel) or malformed.
export function countryFromRequest(request) {
  try {
    const c = (request.headers.get('x-vercel-ip-country') || '').trim().toUpperCase();
    return /^[A-Z]{2}$/.test(c) ? c : null;
  } catch {
    return null;
  }
}

// Subdivision (state/province) code from Vercel's edge geo header, e.g. "CA"
// for California or "ON" for Ontario. Only meaningful alongside the country.
// Returns null when absent or implausibly long.
export function regionFromRequest(request) {
  try {
    const r = (request.headers.get('x-vercel-ip-country-region') || '').trim().toUpperCase();
    return /^[A-Z0-9]{1,6}$/.test(r) ? r : null;
  } catch {
    return null;
  }
}

// City name from Vercel's edge geo header, e.g. "Austin". Vercel URL-encodes it
// (spaces -> %20), so decode. Free on all plans. Null when absent/implausible.
export function cityFromRequest(request) {
  try {
    let c = (request.headers.get('x-vercel-ip-city') || '').trim();
    try { c = decodeURIComponent(c); } catch { /* keep raw if not encoded */ }
    c = c.replace(/\s+/g, ' ').trim();
    return c && c.length <= 80 ? c : null;
  } catch {
    return null;
  }
}

// IANA timezone from Vercel's edge geo header, e.g. "America/Chicago". Free on
// all plans. Null when absent or implausible.
export function timezoneFromRequest(request) {
  try {
    const t = (request.headers.get('x-vercel-ip-timezone') || '').trim();
    return /^[A-Za-z_]+\/[A-Za-z0-9_+-]+/.test(t) && t.length <= 60 ? t : null;
  } catch {
    return null;
  }
}

// Primary language tag from the browser's Accept-Language header, e.g. "en-US".
// Takes the first (highest-priority) tag, ignoring q-weights. Free; standard
// request header. Null when absent or implausible.
export function languageFromRequest(request) {
  try {
    const raw = (request.headers.get('accept-language') || '').trim();
    if (!raw) return null;
    const first = raw.split(',')[0].split(';')[0].trim();
    return /^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})?$/.test(first) ? first : null;
  } catch {
    return null;
  }
}

// Reduce a referrer URL (the browser's document.referrer, sent in the result
// body) to a bare host like "google.com". Strips a leading "www.". Returns null
// for an empty/"direct" referrer or an unparseable value. The caller decides
// how to label a self-referral (same host as the site).
export function referrerHost(value) {
  try {
    const v = String(value || '').trim();
    if (!v) return null;
    const h = new URL(v).hostname.replace(/^www\./i, '').toLowerCase();
    return h && h.length <= 100 ? h : null;
  } catch {
    return null;
  }
}

// -- Channel classification --------------------------------------------------
// Fold a view's referrer host + UTM tags into one coarse acquisition channel
// for the admin source breakdown: direct | organic | social | referral |
// internal. `referrerHost` is the output of referrerHost() above (bare host or
// null). Zero-dependency, matching the rest of this module.
const SEARCH_SOURCES = [
  'google', 'bing', 'duckduckgo', 'yahoo', 'yandex', 'baidu',
  'ecosia', 'brave', 'startpage', 'ask.com', 'aol', 'qwant',
];
const SOCIAL_SOURCES = [
  'facebook', 'fb.com', 'fb.me', 'instagram', 't.co', 'twitter', 'x.com',
  'reddit', 'linkedin', 'lnkd.in', 'pinterest', 'pin.it', 'tiktok',
  'youtube', 'youtu.be', 'threads', 'whatsapp', 'wa.me', 't.me',
  'telegram', 'snapchat', 'mastodon', 'bsky', 'quora', 'tumblr',
];

// Match a host or bare utm_source token against a source list, anchored on
// label boundaries so "notgoogle" never matches "google".
function sourceMatches(value, needles) {
  if (!value) return false;
  return needles.some(
    (n) =>
      value === n ||
      value.startsWith(n + '.') ||
      value.endsWith('.' + n) ||
      value.includes('.' + n + '.')
  );
}

// Hosts that are US. Keep both until sourceoftruths.com is fully retired.
export const INTERNAL_HOST = /(^|\.)(sourceoftruths|mindloftdaily)\.com$/i;

export function classifyChannel(referrerHost, utmSource, utmMedium) {
  const host = String(referrerHost || '').toLowerCase();
  const src = String(utmSource || '').toLowerCase().trim();
  const med = String(utmMedium || '').toLowerCase().trim();

  // Navigation from elsewhere on our own site. Both hosts count: mindloftdaily.com is
  // live alongside sourceoftruths.com, and a self-referral must never look like traffic
  // from a third party.
  if (host && INTERNAL_HOST.test(host)) return 'internal';

  // An explicit UTM medium is the campaign's own declaration -- trust it.
  if (med) {
    if (['social', 'social-network', 'social-media', 'sm'].includes(med)) return 'social';
    if (['organic', 'search'].includes(med)) return 'organic';
    if ([
      'cpc', 'ppc', 'paid', 'paidsearch', 'paid-search', 'display', 'banner',
      'cpm', 'affiliate', 'referral', 'email', 'newsletter',
    ].includes(med)) return 'referral';
  }

  const eff = host || src;
  if (!eff) return 'direct';
  if (sourceMatches(eff, SEARCH_SOURCES)) return 'organic';
  if (sourceMatches(eff, SOCIAL_SOURCES)) return 'social';
  return 'referral';
}
