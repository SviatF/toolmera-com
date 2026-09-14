import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/'] },
    // Currency sitemap exists at /sitemap-currency.xml but is intentionally not
    // advertised here until the 3–5 day rate/update validation window is complete.
    sitemap: 'https://toolmera.com/sitemap.xml',
  };
}
