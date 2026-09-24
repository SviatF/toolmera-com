import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const toolsPath = path.join(repoRoot, 'src', 'data', 'tools.ts');
const pilotPath = path.join(repoRoot, 'src', 'data', 'localizedToolPilot.ts');
const publicDir = path.join(repoRoot, 'public');

const [toolsSource, pilotSource] = await Promise.all([
  readFile(toolsPath, 'utf8'),
  readFile(pilotPath, 'utf8'),
]);

function parseGlobalTools(source) {
  const marker = 'export const tools: Tool[] = [';
  const markerIndex = source.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error(`Could not find ${marker} in src/data/tools.ts`);
  }

  const lines = source.slice(markerIndex + marker.length).split(/\r?\n/);
  const tools = [];
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

      const idMatch = block.match(/\bid:\s*'([^']+)'/);
      const slugMatch = block.match(/\bslug:\s*'([^']+)'/);
      if (!idMatch || !slugMatch) continue;

      const countryMatch = block.match(/\bcountry:\s*'([^']+)'/);
      tools.push({
        id: idMatch[1],
        slug: slugMatch[1],
        country: countryMatch?.[1] ?? null,
      });
    }
  }

  if (tools.length < 50) {
    throw new Error(`Refusing to generate localized sitemaps: only ${tools.length} tools were detected.`);
  }

  return tools;
}

function parseCuratedLocale(source, locale) {
  const sectionPattern = new RegExp(`const ${locale}:LocalizedPilotTool\\[\\]=\\[([\\s\\S]*?)\\n\\];`);
  const sectionMatch = source.match(sectionPattern);

  if (!sectionMatch) {
    throw new Error(`Could not find curated ${locale} localization entries.`);
  }

  const entries = [];
  const entryPattern = /\{toolId:'([^']+)',slug:'([^']+)'/g;
  let match;

  while ((match = entryPattern.exec(sectionMatch[1])) !== null) {
    entries.push({ toolId: match[1], slug: match[2] });
  }

  if (entries.length < 10) {
    throw new Error(`Refusing to generate ${locale} sitemap: only ${entries.length} curated entries were detected.`);
  }

  return entries;
}

const globalTools = parseGlobalTools(toolsSource).filter((tool) => !tool.country);

const escapeXml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const locales = ['de', 'hi', 'ru'];
await mkdir(publicDir, { recursive: true });

for (const locale of locales) {
  const curated = parseCuratedLocale(pilotSource, locale);
  const curatedToolIds = new Set(curated.map((item) => item.toolId));
  const slugs = [
    ...curated.map((item) => item.slug),
    ...globalTools
      .filter((tool) => !curatedToolIds.has(tool.id))
      .map((tool) => tool.slug),
  ];
  const uniqueSlugs = [...new Set(slugs)];

  if (uniqueSlugs.length !== slugs.length) {
    throw new Error(`Duplicate localized slugs detected for ${locale}.`);
  }

  const urls = [
    `https://toolmera.com/${locale}/`,
    ...uniqueSlugs.map((slug) => `https://toolmera.com/${locale}/${slug}/`),
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
  console.log(`Generated sitemap-${locale}.xml with ${urls.length} URLs (${uniqueSlugs.length} tool pages + hub)`);
}
