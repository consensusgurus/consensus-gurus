import { PUZZLES } from '@/app/focus/puzzles';

// /api/focus/img?n=<puzzle number>   (GET)
//
// The one place a Focus photo comes from. The bank in app/focus/puzzles.js
// names a Wikimedia Commons file per day and nothing else; this route fetches
// the Commons-rendered 1000px thumbnail through Special:FilePath (stable
// across re-uploads of the same title) and hands it on with a one-year edge
// cache, so after the first request of a day Vercel's CDN serves the bytes
// and Commons is not in the loop. That is the "banked" half of the plan: the
// bytes live at the edge rather than in the repo, because the build sandbox
// cannot reach Commons and 47 photos in git would be a permanent 5MB tax on
// every clone.
//
// TWO GATES, both deliberate:
//   - a day that is not yet live in Eastern time is a 404, whatever the
//     number, so tomorrow's photo is never fetchable ahead of its day;
//   - the number must name a bank row, so this is not an open proxy.
//
// The key is the puzzle NUMBER, not the title, so the URL never leaks the
// answer (most Commons titles are the answer written out).

export const dynamic = 'force-dynamic';

function etToday() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const n = Number(searchParams.get('n'));
  const p = Number.isInteger(n) && n > 0 ? PUZZLES.find((x) => x.num === n) : null;
  if (!p || p.live > etToday()) return new Response('Not found', { status: 404 });
  const src = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(p.t)}?width=1000`;
  let up;
  try {
    up = await fetch(src, {
      headers: { 'User-Agent': 'MindLoft/1.0 (https://mindloftdaily.com; focus daily) node-fetch' },
      redirect: 'follow',
      next: { revalidate: 86400 },
    });
  } catch (e) {
    return new Response('Upstream unavailable', { status: 502 });
  }
  if (!up.ok) return new Response('Upstream unavailable', { status: 502 });
  const type = up.headers.get('content-type') || 'image/jpeg';
  const buf = await up.arrayBuffer();
  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': type,
      // A bank row never changes its photo once live, so the edge may keep it
      // for the year. The 404 for a not-yet-live day is NOT cached (it has no
      // cache header), so the first fetch after midnight goes upstream.
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000, immutable',
      'X-Focus-Day': String(p.num),
    },
  });
}
