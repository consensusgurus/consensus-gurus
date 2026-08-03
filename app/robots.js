import { SITE_URL } from '@/lib/site';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    // Always the CANONICAL host, whichever domain served this robots.txt. Pointing each host
    // at its own sitemap would advertise two competing sites during the soft launch.
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
