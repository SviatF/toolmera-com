import { localizedSitemapXml } from '@/lib/localizedSitemap';

export const dynamic='force-static';
export function GET(){return new Response(localizedSitemapXml('ru'),{headers:{'content-type':'application/xml; charset=utf-8','cache-control':'public, max-age=3600'}})}
