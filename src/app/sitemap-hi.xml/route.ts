import { localizedSitemapXml } from '@/lib/localizedSitemap';

export const dynamic='force-static';
// Keep this as a statically exported XML asset so Cloudflare serves the exact /sitemap-hi.xml path.
export function GET(){return new Response(localizedSitemapXml('hi'),{headers:{'content-type':'application/xml; charset=utf-8','cache-control':'public, max-age=3600'}})}
