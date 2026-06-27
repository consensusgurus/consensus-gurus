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
