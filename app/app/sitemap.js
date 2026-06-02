import { LISTS } from '@/lib/data';

export default function sitemap() {
  const baseUrl = 'https://consensusgurus.com';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/submit`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/disclosure`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const listPages = LISTS.map((list) => ({
    url: `${baseUrl}/list/${list.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...listPages];
}