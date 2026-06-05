import { LISTS } from '@/lib/data';

export default function sitemap() {
  const baseUrl = 'https://sourceoftruths.com';

  // Newest list's publish time doubles as the homepage lastModified,
  // since the homepage changes whenever a list is added.
  const listDates = LISTS.map((list) =>
    new Date(list.publishedAt || `${list.publishedDate}T12:00:00Z`)
  );
  const newestList = new Date(Math.max(...listDates.map((d) => d.getTime())));

  const staticPages = [
    { url: baseUrl, lastModified: newestList, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/request`, lastModified: new Date('2026-01-01'), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date('2026-01-01'), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date('2026-01-01'), changeFrequ