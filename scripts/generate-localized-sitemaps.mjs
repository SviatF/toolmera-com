import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const toolsPath = path.join(repoRoot, 'src', 'data', 'tools.ts');
const publicDir = path.join(repoRoot, 'public');
const source = await readFile(toolsPath, 'utf8');
const marker = 'export const tools: Tool[] = [';
const markerIndex = source.indexOf(marker);

if (markerIndex === -1) {
  throw new Error(`Could not find ${marker} in src/data/tools.ts`);
}

const lines = source.slice(markerIndex + marker.length).split(/\r?\n/);
const slugs = [];
const seen = new Set();
let current = null;

for (const line of lines) {
  if (line === '];') break;

  if (line === '  {') {
    current = [line];
    continue;
  }

  if (!current) continue;
  current.push(line);

  if (line === '  },' || line === '  }') {
    const block = current.join('\n');
    current = null;

    const slugMatch = block.match(/\bslug:\s*'([^']+)'/);
    if (!slugMatch) continue;

    const countryMatch = block.match(/\bcountry:\s*'([^']+)'/);
    if (countryMatch) continue;

    const slug = slugMatch[1];
    if (!seen.has(slug)) {
      seen.add(slug);
      slugs.push(slug);
    }
  }
}

if (slugs.length < 50) {
  throw new Error(`Refusing to generate localized sitemaps: only ${slugs.length} global tool slugs were detected.`);
}

const escapeXml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const locales = ['de', 'hi', 'ru'];
await mkdir(publicDir, { recursive: true });

for (const locale of locales) {
  const urls = [
    `https://toolmera.com/${locale}/`,
    ...slugs.map((slug) => `https://toolmera.com/${locale}/${slug}/`),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');

  const outputPath = path.join(publicDir, `sitemap-${locale}.xml`);
  await writeFile(outputPath, xml, 'utf8');
  console.log(`Generated sitemap-${locale}.xml with ${urls.length} URLs`);
}
