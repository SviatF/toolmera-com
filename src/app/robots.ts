import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/'] },
    // Currency sitemap exists at /sitemap-currency.xml but is intentionally not
    // advertised here until the separate rate/update validation window is complete.
    sitemap: [
      'https://toolmera.com/sitemap.xml',
      'https://toolmera.com/sitemap-de.xml',
      'https://toolmera.com/sitemap-hi.xml',
      'https://toolmera.com/sitemap-ru.xml',
    ],
  };
}
