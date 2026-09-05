import type { MetadataRoute } from 'next';
import { categories, tools, toolUrl } from '@/data/tools';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages = ['tools','about','contact','privacy','terms','cookies','disclaimer'];

  return [
    { url: 'https://toolmera.com/', lastModified: now, priority: 1 },
    ...staticPages.map((page) => ({
      url: `https://toolmera.com/${page}/`,
      lastModified: now,
      priority: page === 'tools' ? 0.9 : 0.4,
    })),
    { url: 'https://toolmera.com/in/', lastModified: now, priority: 0.8 },
    { url: 'https://toolmera.com/in/finance/', lastModified: now, priority: 0.8 },
    { url: 'https://toolmera.com/in/tax/', lastModified: now, priority: 0.8 },
    ...categories.map((category) => ({
      url: `https://toolmera.com/${category.slug}/`,
      lastModified: now,
      priority: 0.8,
    })),
    ...tools.map((tool) => ({
      url: `https://toolmera.com${toolUrl(tool)}`,
      lastModified: now,
      priority: 0.9,
    })),
  ];
}
