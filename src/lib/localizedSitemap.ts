import { localizedPilotTools, type PilotLocale } from '@/data/localizedToolRegistry';

function escapeXml(value:string){return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;')}

export function localizedSitemapXml(locale:PilotLocale){
  const urls=[`https://toolmera.com/${locale}/`,...localizedPilotTools[locale].map(item=>`https://toolmera.com/${locale}/${item.slug}/`)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url=>`  <url><loc>${escapeXml(url)}</loc></url>`).join('\n')}\n</urlset>\n`;
}
