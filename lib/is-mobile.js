// Best-effort device classification for the quiz leaderboard "Mobile" view.
// Sent with every /api/quiz/result POST and stored as quiz_results.is_mobile.
// Browser-only; SSR-safe (returns false on the server). Heuristic, not exact:
// it favors NOT flagging a desktop as mobile over the reverse, because the
// Mobile leaderboard counts only rows where this is explicitly true.
export function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  try {
    const ua = navigator.userAgent || '';
    if (/Mobi|Android|iPhone|iPod|IEMobile|BlackBerry|Opera Mini/i.test(ua)) return true;
    // iPadOS 13+ reports as "Macintosh"; touch points disambiguate a tablet
    // (a desktop Mac reports maxTouchPoints 0).
    if (/iPad|Macintosh/.test(ua) && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1) return true;
    if (typeof window !== 'undefined' && window.matchMedia
        && window.matchMedia('(pointer: coarse)').matches
        && (window.innerWidth || 0) <= 820) return true;
  } catch (e) { /* fall through to false */ }
  return false;
}
