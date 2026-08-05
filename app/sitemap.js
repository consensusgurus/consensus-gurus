import { sitemapEntries } from '@/lib/sitemap-entries';
import { SITE_URL } from '@/lib/site';

// The url set itself lives in lib/sitemap-entries.js so the old hosts can serve the same
// pages under their own origin during the domain move. See app/legacy-sitemap.
export default function sitemap() {
  return sitemapEntries(SITE_URL);
}
