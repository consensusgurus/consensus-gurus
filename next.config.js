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
      // Renamed 2026-06-09: "Best No-Budget Dinners in NYC" -> "Best Fine Dining Restaurants in NYC"
      {
        source: '/list/no-budget-dinners-nyc',
        destination: '/list/best-fine-dining-nyc',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
