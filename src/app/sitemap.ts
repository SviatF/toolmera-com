import type { MetadataRoute } from 'next';
import { categories, tools, toolUrl } from '@/data/tools';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ['tools','about','contact'];

  return [
    { url: 'https://toolmera.com/', priority: 1 },
    ...staticPages.map((page) => ({
      url: `https://toolmera.com/${page}/`,
      priority: page === 'tools' ? 0.9 : 0.5,
    })),
    { url: 'https://toolmera.com/in/', priority: 0.7 },
    { url: 'https://toolmera.com/in/finance/', priority: 0.7 },
    { url: 'https://toolmera.com/in/tax/', priority: 0.7 },
    ...categories.map((category) => ({
      url: `https://toolmera.com/${category.slug}/`,
      priority: 0.8,
    })),
    ...tools.map((tool) => ({
      url: `https://toolmera.com${toolUrl(tool)}`,
      priority: 0.9,
    })),
  ];
}
