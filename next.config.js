/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Hero photos are referenced by remote URL (lib/hero-images.js) and
    // optimized/cached by the built-in image optimizer at request time.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async redirects() {
    return [
      // /snapshot/[id] removed 2026-06-11: the snapshot/share UI now lives in the
      // list page's Share tab (SnapshotClient renders there embedded). Preserve
      // old shared links by sending them to that tab. Also drops ~450 heavy
      // pages from the build prerender, which was overrunning the build memory.
      {
        source: '/snapshot/:id',
        destination: '/list/:id#share',
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
