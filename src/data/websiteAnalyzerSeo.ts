import type { ToolSeoContent } from './seoContent';

export const websiteAnalyzerBenefits = [
  'Free web page analyzer for public URLs',
  'On-page SEO, metadata and heading checks',
  'Robots.txt, sitemap and crawlability context',
  'Security headers, redirects and technology signals',
];

export const websiteAnalyzerSeo: ToolSeoContent = {
  title: 'Free Web Page Analyzer — SEO, Security & Technical Audit',
  description: 'Analyze a web page for free. Check SEO metadata, headings, crawlability, robots.txt, XML sitemap, redirects, security headers and public technology signals.',
  intro: 'Use this free web page and website analyzer to inspect a live public URL for SEO, crawlability, metadata, headings, redirects, robots.txt, XML sitemap, security headers and detectable technologies. The report is based on the page response and other public technical signals rather than estimated or private data.',
  sections: [
    {
      title: 'Free web page analyzer for a live public URL',
      paragraphs: [
        'A useful website analysis starts with what the server actually returns. Toolmera fetches the public page, follows the allowed redirect path and inspects the live HTML and HTTP response instead of relying on a saved screenshot or a manually entered checklist.',
        'The resulting report gives you a fast first-pass view of the page status, SEO score, headings, metadata, images, links and final URL. It is designed to surface obvious technical and on-page issues before you move into deeper crawling, performance testing or Search Console analysis.'
      ],
      facts: [
        { label: 'Page source', value: 'Live public HTML and HTTP response' },
        { label: 'SEO checks', value: 'Metadata, headings, links and images' },
        { label: 'Crawl context', value: 'robots.txt and XML sitemap' },
        { label: 'Technical checks', value: 'Redirects, headers and technologies' }
      ]
    },
    {
      title: 'Analyze on-page SEO, titles, headings and indexability signals',
      paragraphs: [
        'The analyzer reviews the page title, meta description, canonical URL, robots directives, heading structure, schema types, internal links, external links and image ALT coverage when those signals are available in the fetched page.',
        'These checks help identify common deployment problems such as a missing title, multiple or missing H1 headings, an unexpected canonical, an accidental noindex directive or images without useful alternative text. They are diagnostics rather than a guarantee of rankings.'
      ]
    },
    {
      title: 'Check robots.txt and XML sitemap context',
      paragraphs: [
        'A page can look correct in the browser while crawl-control files create a different search-engine experience. Toolmera checks public robots.txt availability and looks for a site-wide block, then verifies the XML sitemap signal and reports its detected entry count when available.',
        'This makes the analyzer useful after migrations, CMS changes and new deployments where crawl settings are easy to overlook. For a deeper inspection of either file, continue with the dedicated Robots.txt Checker or Sitemap Checker.'
      ]
    },
    {
      title: 'Review redirects, security headers and public technology signals',
      paragraphs: [
        'The full website analysis includes the final URL after redirects and can surface the redirect path when the request moves through one or more HTTP hops. That helps reveal unnecessary chains, protocol changes and hostname redirects that may otherwise be hidden by the browser.',
        'The report also summarizes detectable security headers and public technology fingerprints found in the response. A missing fingerprint does not prove a technology is absent, and a header check is not a penetration test; these are externally observable signals from the fetched page.'
      ]
    },
    {
      title: 'How to use a website analyzer in an SEO audit workflow',
      paragraphs: [
        'Start with the broad Website Analyzer to find the areas that need attention, then move into the dedicated tools for the specific problem. Use SEO Checker for a more focused on-page review, Meta Tag Checker for titles and social metadata, Redirect Checker for routing, and Sitemap Checker for XML sitemap validation.',
        'For indexing and search performance, combine these public technical checks with first-party data from Google Search Console and your analytics platform. A live page analyzer can verify what is publicly exposed, but it cannot see private search-console coverage, crawl-history or analytics data.'
      ]
    }
  ],
  faq: [
    {
      q: 'What does a web page analyzer check?',
      a: 'Toolmera checks the live public page response for SEO metadata, headings, links, images, indexability signals, redirects, crawl files, security headers and detectable technologies.'
    },
    {
      q: 'Is this a free website analyzer?',
      a: 'Yes. The core Website Analyzer is free to use for public HTTP and HTTPS URLs and does not require an account.'
    },
    {
      q: 'Can it check title tags and meta descriptions?',
      a: 'Yes. The analyzer inspects the title, meta description, canonical URL, robots metadata and other on-page signals returned in the live HTML.'
    },
    {
      q: 'Does the analyzer check robots.txt and sitemap.xml?',
      a: 'Yes. It checks public robots.txt and XML sitemap context when those resources can be reached and parsed by the tool.'
    },
    {
      q: 'Is this the same as a full website crawler?',
      a: 'No. The Website Analyzer is primarily a live analysis of the submitted public page plus related crawl-control signals. It does not replace a full multi-page crawler or private Search Console data.'
    },
    {
      q: 'Can it detect every technology used by a website?',
      a: 'No. Technology detection is based on public fingerprints in the fetched HTML and response headers. Some technologies leave no detectable public signature.'
    }
  ],
  related: [
    { id: 'seo-checker', anchor: 'run a focused SEO audit' },
    { id: 'meta-tag-checker', anchor: 'inspect title and meta tags' },
    { id: 'redirect-checker', anchor: 'trace the redirect chain' },
    { id: 'sitemap-checker', anchor: 'validate the XML sitemap' }
  ]
};
