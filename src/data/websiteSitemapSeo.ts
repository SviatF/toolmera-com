import type { ToolSeoContent } from './seoContent';

export const websiteSitemapBenefits = [
  'Free XML sitemap checker and validator',
  'Detect URL sets and sitemap indexes',
  'Count URLs, child sitemaps and lastmod tags',
  'Preview submitted URLs from the live sitemap',
];

export const websiteSitemapSeo: ToolSeoContent = {
  title: 'Free Sitemap Checker — Validate XML Sitemap Online',
  description: 'Check and validate an XML sitemap for free. Test sitemap.xml availability, detect sitemap indexes, count URLs, inspect lastmod tags and preview submitted URLs.',
  intro: 'Use this free sitemap checker to test a live XML sitemap or sitemap index. Enter a website or sitemap URL to verify availability, identify the sitemap type, count submitted URLs or child sitemaps, inspect lastmod coverage and preview entries.',
  sections: [
    {
      title: 'XML sitemap checker: verify the sitemap search engines can fetch',
      paragraphs: [
        'An XML sitemap is useful only when crawlers can actually reach it. Toolmera checks the live sitemap response and reports the HTTP status, availability and detected sitemap type so you can quickly catch missing files, broken endpoints or an unexpected response.',
        'This is especially useful after a migration, CMS change, domain move or sitemap regeneration. Instead of assuming /sitemap.xml is valid, you can test the deployed file that search engines are expected to request.'
      ],
      facts: [
        { label: 'Availability', value: 'Live HTTP check' },
        { label: 'Sitemap type', value: 'URL set or sitemap index' },
        { label: 'Entry count', value: 'URLs or child sitemaps' },
        { label: 'lastmod coverage', value: 'Counted when present' }
      ]
    },
    {
      title: 'Validate sitemap structure before submitting it to Google',
      paragraphs: [
        'A sitemap can be reachable and still be unhelpful if it contains the wrong type of entries, an empty URL set or an unexpected sitemap index. Toolmera distinguishes a standard URL sitemap from a sitemap index and shows the number of entries it finds.',
        'The checker also previews submitted URLs. That gives you a fast sanity check that the file points to the pages you intended to expose instead of staging URLs, old domains or unrelated paths. For complete indexing diagnostics, use Google Search Console after confirming the sitemap itself is reachable.'
      ]
    },
    {
      title: 'Sitemap index vs. regular sitemap',
      paragraphs: [
        'A regular sitemap contains page URLs, while a sitemap index contains links to other sitemap files. Large websites commonly use sitemap indexes so content can be split across multiple files by type, section or publication date.',
        'Toolmera reports URL entries and child sitemap counts separately. If you expected thousands of page URLs but the checker reports child sitemaps instead, you are probably looking at the index file and should inspect the linked sitemap files as the next step.'
      ]
    },
    {
      title: 'What lastmod tells you — and what it does not',
      paragraphs: [
        'The lastmod element can tell search engines when a URL was last significantly updated, but it should reflect meaningful page changes rather than being rewritten automatically on every request. Toolmera counts how many entries include lastmod so you can see whether the field is being used across the sitemap.',
        'A sitemap checker cannot confirm that every lastmod timestamp is factually correct or guarantee that a submitted URL will be indexed. Sitemap submission is a discovery signal, not an indexing guarantee.'
      ]
    },
    {
      title: 'How to use sitemap checking in a technical SEO workflow',
      paragraphs: [
        'Start by checking the sitemap itself, then inspect robots.txt to make sure the sitemap is declared where appropriate and important crawling is not blocked. After that, use the SEO Checker or Website Analyzer to inspect canonical, robots and on-page signals on representative URLs.',
        'If the sitemap is valid but pages remain unindexed, move the investigation to Google Search Console URL Inspection. That is where you can see indexing state, Google-selected canonical information and crawl details for individual URLs.'
      ]
    }
  ],
  faq: [
    {
      q: 'Is this a free XML sitemap checker?',
      a: 'Yes. Toolmera checks a live XML sitemap or sitemap index for free and reports availability, type, entry counts, lastmod usage and sample URLs.'
    },
    {
      q: 'Can I validate sitemap.xml with this tool?',
      a: 'Yes. The checker verifies the live sitemap response and parses the XML structure it receives. It is designed for practical deployment checks rather than replacing a full XML schema validator.'
    },
    {
      q: 'What is the difference between a sitemap and a sitemap index?',
      a: 'A regular sitemap lists page URLs. A sitemap index lists other sitemap files. Toolmera detects the type and reports URL entries and child sitemaps separately.'
    },
    {
      q: 'Does a valid sitemap guarantee Google will index every URL?',
      a: 'No. A sitemap helps search engines discover URLs, but indexing still depends on crawlability, canonicalization, content quality and other signals.'
    },
    {
      q: 'Should every sitemap URL have a lastmod date?',
      a: 'It is optional. If you use lastmod, it should represent the date of a meaningful page update rather than an automatically changing timestamp that does not reflect content changes.'
    },
    {
      q: 'Can I check a sitemap index with multiple child sitemaps?',
      a: 'Yes. Toolmera identifies sitemap indexes, counts the child sitemap entries and previews entries returned by the live XML file.'
    }
  ],
  related: [
    { id: 'robots-checker', anchor: 'check robots.txt and sitemap declarations' },
    { id: 'seo-checker', anchor: 'check indexability and on-page SEO signals' },
    { id: 'website-analyzer', anchor: 'run a full technical website analysis' },
    { id: 'redirect-checker', anchor: 'check redirects affecting submitted URLs' }
  ],
  sources: [
    { label: 'Google Search Central — Sitemaps overview', href: 'https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview' },
    { label: 'Sitemaps.org — XML sitemap protocol', href: 'https://www.sitemaps.org/protocol.html' }
  ]
};
