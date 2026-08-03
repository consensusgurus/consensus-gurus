/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Hero photos are referenced by remote URL (lib/hero-images.js) and
    // optimized/cached by the built-in image optimizer at request time.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  // mindloftdaily.com is live so the rebrand can be seen on a real domain, but it serves the
  // SAME content as sourceoftruths.com. Two hosts returning identical 200s is duplicate
  // content, and letting Google index both would split signals and undercut the Change of
  // Address filed at cutover. So the new host is noindexed until it becomes canonical.
  //
  // DELETE THIS BLOCK AT CUTOVER, in the same change that flips the 301s to point AT
  // mindloftdaily.com. Leaving it in place would silently deindex the live site.
  async headers() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: '(www\\.)?mindloftdaily\\.com' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
  async redirects() {
    return [
      // 2026-07-18: the Quizzes hub is now the site root (sourceoftruths.com).
      // The legacy /quizzes index 308s to it. Sub-pages (/quizzes/hub, etc.)
      // are matched exactly here, so they are unaffected.
      {
        source: '/quizzes',
        destination: '/',
        permanent: true,
      },
      // Renamed 2026-07-06: the Crosslock word game relaunched as Crux (same
      // game, same puzzle #1). Old links 308 to the new home.
      {
        source: '/crosslock',
        destination: '/crux',
        permanent: true,
      },
      // Renamed 2026-07-31: Park relaunched as Parker (same game, same board
      // numbering, same 'park-M-D-YY' quiz ids and leaderboards). Old links,
      // including archive deep links like /park?p=2, 308 to the new home. Next
      // carries the query string through, so ?p=N survives the hop.
      {
        source: '/park',
        destination: '/parker',
        permanent: true,
      },
      // /unpark was the name for about an hour on 2026-07-31 before it settled
      // on Parker. It was live and IndexNow-pinged, so it gets its own 308.
      {
        source: '/unpark',
        destination: '/parker',
        permanent: true,
      },
      // Renamed 2026-06-19: 'Inputs' rebranded to 'Experts and Aggregators'.
      // Old /sources and /inputs both 308 to the new path.
      {
        source: '/sources',
        destination: '/experts-and-aggregators',
        permanent: true,
      },
      {
        source: '/inputs',
        destination: '/experts-and-aggregators',
        permanent: true,
      },
      // Canonicalize host: 308 all www traffic to the apex domain. Fixes the
      // GSC "Duplicate without user-selected canonical" flag, where
      // www.sourceoftruths.com was serving duplicate 200 content. 2026-06-16.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.sourceoftruths.com' }],
        destination: 'https://sourceoftruths.com/:path*',
        permanent: true,
      },
      // Renamed 2026-06-10: legacy slug 'dive-bars-istanbul' (pre-rework dive-bar build) -> meyhanes
      {
        source: '/list/dive-bars-istanbul',
        destination: '/list/best-meyhanes-istanbul',
        permanent: true,
      },
      // Renamed 2026-06-09: "Best No-Budget Dinners in NYC" -> "Best Fine Dining Restaurants in NYC"
      {
        source: '/list/no-budget-dinners-nyc',
        destination: '/list/best-fine-dining-nyc',
        permanent: true,
      },
      // Renamed 2026-06-10: "Best No-Budget Dinners in London" -> "Best Fine Dining Restaurants in London"
      {
        source: '/list/no-budget-dinners-london',
        destination: '/list/best-fine-dining-london',
        permanent: true,
      },
      // Renamed 2026-06-10: "Best No-Budget Dinners in Paris" -> "Best Fine Dining Restaurants in Paris"
      {
        source: '/list/no-budget-dinners-paris',
        destination: '/list/best-fine-dining-paris',
        permanent: true,
      },
      // Renamed 2026-06-10: "Best No-Budget Dinners in Miami" -> "Best Fine Dining Restaurants in Miami"
      {
        source: '/list/no-budget-dinners-miami',
        destination: '/list/best-fine-dining-miami',
        permanent: true,
      },
      // Renamed 2026-06-10: "Best No-Budget Dinners in Tokyo" -> "Best Fine Dining Restaurants in Tokyo"
      {
        source: '/list/no-budget-dinners-tokyo',
        destination: '/list/best-fine-dining-tokyo',
        permanent: true,
      },
      // Renamed 2026-06-10: "Best No-Budget Dinners in Shanghai" -> "Best Fine Dining Restaurants in Shanghai"
      {
        source: '/list/no-budget-dinners-shanghai',
        destination: '/list/best-fine-dining-shanghai',
        permanent: true,
      },
      // Renamed 2026-06-10: "Best No-Budget Dinners in Toronto" -> "Best Fine Dining Restaurants in Toronto"
      {
        source: '/list/no-budget-dinners-toronto',
        destination: '/list/best-fine-dining-toronto',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
