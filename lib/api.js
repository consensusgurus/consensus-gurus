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
  return safeFetch('/api/votes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listId, itemName, delta }),
  });
}

export async function postView(listId) {
  return safeFetch('/api/views', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listId }),
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
