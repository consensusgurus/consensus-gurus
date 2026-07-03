// Client-side API helpers. All return JSON.
// Errors are logged but not thrown so the UI can degrade gracefully.

async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error('API error', url, res.status);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error('Network error', url, e);
    return null;
  }
}

export async function fetchBootstrap() {
  return safeFetch('/api/bootstrap');
}

export async function postVote(listId, itemName, delta) {
  // Native voting removed (2026-06-18). Kept as an inert no-op so any lingering
  // caller does not break; performs no network request.
  return null;
}

// Read the visitor's landing context so /api/views can attribute the view.
// Runs in the browser: document.referrer is the external source (empty on
// direct/typed loads, or stripped by referrer policy) and the utm_* params come
// from the landing URL. Mirrors how the quiz result beacon sends referrer. All
// best-effort -- never blocks the view beacon.
function landingContext() {
  if (typeof document === 'undefined') return {};
  const ctx = { referrer: '', utm_source: '', utm_medium: '', utm_campaign: '' };
  try { ctx.referrer = document.referrer || ''; } catch (e) {}
  try {
    const q = new URLSearchParams(window.location.search);
    ctx.utm_source = q.get('utm_source') || '';
    ctx.utm_medium = q.get('utm_medium') || '';
    ctx.utm_campaign = q.get('utm_campaign') || '';
  } catch (e) {}
  return ctx;
}

export async function postView(listId) {
  return safeFetch('/api/views', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listId, ...landingContext() }),
  });
}

export async function postExtra(listId, itemName) {
  return safeFetch('/api/extras', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listId, itemName }),
  });
}

export async function postList(list) {
  return safeFetch('/api/lists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(list),
  });
}
