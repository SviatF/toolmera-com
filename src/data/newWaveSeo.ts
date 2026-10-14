import type { ToolSeoContent } from './seoContent';

export const newWaveSeoContent: Record<string, ToolSeoContent> = {
  'broken-link-checker': {
    title: 'Free Broken Link Checker — Find 404 Links on a Web Page',
    description: 'Check links on a public web page and separate working destinations from redirects, true 404/410 links and other HTTP errors.',
    intro: 'Scan a live public page for the links it actually exposes, then check a bounded set of destinations so you can find broken references without pretending this is a full-site crawler.',
    sections: [
      {
        title: 'A broken-link check should show evidence, not just a red badge',
        paragraphs: [
          'Toolmera first reads the submitted page and extracts unique HTTP and HTTPS links from its server-returned HTML. It then checks a bounded sample of those destinations and reports the observed HTTP result, whether the link stayed on the same site, and whether the destination redirected.',
          'That distinction matters. A link returning 404 or 410 is a strong broken-link signal; a 301 or 302 may still work but can deserve cleanup; a 403, 429 or timeout can mean the destination blocks automated requests rather than proving that a visitor cannot open it.'
        ],
        facts: [
          { label: 'True broken signal', value: '404 or 410 response' },
          { label: 'Redirect signal', value: 'Destination changes before the final response' },
          { label: 'Scope', value: 'Bounded sample from one submitted page' }
        ]
      },
      {
        title: 'Internal and external links fail for different reasons',
        paragraphs: [
          'Internal broken links often appear after URL migrations, deleted content, CMS changes or a typo in a navigation element. They are usually under your control and can create dead ends for users and crawlers.',
          'External links are different: the destination belongs to another site and may disappear, block bots, move behind authentication or rate-limit automated checks. The report keeps internal and external links visible so you can prioritize fixes you actually control.'
        ]
      },
      {
        title: 'Use redirects as a cleanup signal, not automatically as an error',
        paragraphs: [
          'A redirect can be perfectly valid, especially after a planned migration. The problem is when an old URL remains linked everywhere even though the preferred destination has changed, creating unnecessary hops and making maintenance harder.',
          'For a redirect that needs deeper inspection, open Toolmera Redirect Checker to see the chain. For one suspicious URL, HTTP Status Checker is the faster way to inspect its response without rescanning the whole source page.'
        ]
      },
      {
        title: 'Why this is intentionally not an unlimited site crawler',
        paragraphs: [
          'A full crawler can request thousands of URLs and needs crawl-delay, concurrency, robots and resource controls. This checker is deliberately narrower: it answers the practical question “which links on this page look broken or redirected?” with a bounded request budget.',
          'That makes it useful for landing pages, navigation checks, freshly published articles and post-migration spot checks without turning a free utility into an uncontrolled crawl service.'
        ]
      }
    ],
    faq: [
      { q: 'What counts as a broken link?', a: 'Toolmera treats HTTP 404 and 410 as strong broken-link signals. Other failures such as 403, 429 or timeouts are reported separately because they can reflect access controls or rate limits.' },
      { q: 'Does it scan an entire website?', a: 'No. It scans links exposed by the submitted page and checks a bounded set of unique destinations. It is not an unlimited multi-page crawler.' },
      { q: 'Does a redirect mean the link is broken?', a: 'No. A redirect can work normally. The report flags it separately so you can decide whether to update the source link to the final destination.' },
      { q: 'Can it check external links?', a: 'Yes. Public HTTP and HTTPS links can be checked, but external sites may block or throttle automated requests.' },
      { q: 'Why can a link work in my browser but show an HTTP error here?', a: 'Some sites require cookies, JavaScript, authentication or browser-specific challenges. The checker reports the public HTTP response it receives rather than simulating a full logged-in browser.' }
    ],
    related: [
      { id: 'redirect-checker', anchor: 'trace a redirected destination in detail' },
      { id: 'http-status-checker', anchor: 'inspect one suspicious URL response' },
      { id: 'website-analyzer', anchor: 'run a broader website audit' },
      { id: 'sitemap-checker', anchor: 'compare page links with sitemap discovery' }
    ],
    sources: [
      { label: 'MDN — HTTP response status codes', href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status' },
      { label: 'Google Search Central — Make links crawlable', href: 'https://developers.google.com/search/docs/crawling-indexing/links-crawlable' }
    ]
  },

  'schema-checker': {
    title: 'Free Schema Markup Checker — Inspect JSON-LD Structured Data',
    description: 'Inspect JSON-LD on a public page, list declared schema types and surface invalid JSON blocks without claiming rich-result eligibility.',
    intro: 'Read the structured data that a public page actually returns and inspect each JSON-LD block for parse validity, declared @type values and top-level properties.',
    sections: [
      {
        title: 'See the JSON-LD that is really present in the server HTML',
        paragraphs: [
          'Structured-data debugging often starts with a simple question: did the markup reach the page at all? Toolmera reads application/ld+json blocks from the HTML response and reports how many were found, which ones parse as JSON and which schema types they declare.',
          'This is useful after template changes, CMS migrations and conditional rendering bugs where the intended schema exists in code but never reaches the public HTML returned to a crawler.'
        ],
        facts: [
          { label: 'Detected format', value: 'JSON-LD script blocks' },
          { label: 'Syntax check', value: 'JSON parse success or parse error' },
          { label: 'Type inventory', value: '@type values, including @graph nodes' }
        ]
      },
      {
        title: 'Valid JSON is not the same as valid rich-result markup',
        paragraphs: [
          'A JSON-LD block can be perfectly valid JSON and still be incomplete for a particular Schema.org type or a Google search feature. Toolmera therefore separates syntax inspection from eligibility claims.',
          'Use the report to catch malformed JSON, missing markup or unexpected @type values. For Google-specific rich-result requirements, continue with Google documentation or Rich Results Test because those rules change by feature and are stricter than basic JSON syntax.'
        ]
      },
      {
        title: 'Multiple schema blocks and @graph structures are normal',
        paragraphs: [
          'Modern sites often publish Organization, WebSite, BreadcrumbList, Article, Product or other entities in separate blocks or inside one @graph. The checker inventories the types it can parse instead of assuming there should be exactly one schema object.',
          'That makes the report especially useful when plugins, themes and custom code all inject markup and you want to see the combined public result.'
        ]
      },
      {
        title: 'Server HTML and client-rendered schema can differ',
        paragraphs: [
          'The current checker reads the HTML response and does not run a full browser rendering engine. If a site injects structured data only after client-side JavaScript executes, that late markup may not appear in this report.',
          'For SEO debugging this limitation is useful to know explicitly: the checker tells you what the server response contains, not what a fully executed browser DOM might eventually contain.'
        ]
      }
    ],
    faq: [
      { q: 'Does the Schema Markup Checker validate rich-result eligibility?', a: 'No. It checks JSON-LD presence, JSON syntax and declared schema types. Google rich-result eligibility has feature-specific requirements that should be checked with Google tools and documentation.' },
      { q: 'Does it support @graph?', a: 'Yes. The type inventory walks parsed JSON-LD structures and can surface @type values inside @graph nodes.' },
      { q: 'What happens if a JSON-LD block is malformed?', a: 'The block is reported as invalid with a shortened parse-error message so you can locate the syntax problem.' },
      { q: 'Does it detect Microdata or RDFa?', a: 'This version focuses on JSON-LD because it is the format explicitly extracted by the checker.' },
      { q: 'Does it execute JavaScript?', a: 'No. It analyzes structured data returned in the server HTML response.' }
    ],
    related: [
      { id: 'meta-tag-checker', anchor: 'inspect the rest of the page metadata' },
      { id: 'seo-checker', anchor: 'review structured data in a broader SEO context' },
      { id: 'website-analyzer', anchor: 'run a complete technical page audit' },
      { id: 'technology-checker', anchor: 'see which public stack fingerprints are exposed' }
    ],
    sources: [
      { label: 'Schema.org — Getting started', href: 'https://schema.org/docs/gs.html' },
      { label: 'Google Search Central — Structured data', href: 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data' }
    ]
  },

  'dns-lookup': {
    title: 'Free DNS Lookup — Check A, AAAA, MX, TXT, CNAME & NS Records',
    description: 'Look up common public DNS records for a domain and review returned values and TTLs through a public DNS-over-HTTPS resolver.',
    intro: 'Inspect the DNS records behind a public domain without pretending a single resolver represents every cache on the internet.',
    sections: [
      {
        title: 'One lookup, six records that answer different questions',
        paragraphs: [
          'An A record maps a name to IPv4, while AAAA does the same for IPv6. CNAME points one hostname at another canonical hostname. MX identifies mail exchangers, TXT carries free-form data used by systems such as SPF and domain verification, and NS identifies authoritative name servers.',
          'Toolmera requests these record types separately and keeps the returned TTL beside each answer so you can see both the value and the cache lifetime reported by the resolver.'
        ],
        facts: [
          { label: 'Web addressing', value: 'A, AAAA and CNAME' },
          { label: 'Email routing', value: 'MX' },
          { label: 'Verification / policy', value: 'TXT' },
          { label: 'Authoritative DNS', value: 'NS' }
        ]
      },
      {
        title: 'TTL is a cache instruction, not a propagation countdown',
        paragraphs: [
          'DNS TTL tells resolvers how long an answer may be cached. It does not guarantee that every resolver worldwide will update at the same second, because existing caches, provider behavior and delegation changes can all affect what different users see.',
          'That is why this lookup reports the resolver result it actually received rather than displaying a fictional “propagation complete” percentage.'
        ]
      },
      {
        title: 'Use DNS records to separate web, mail and ownership problems',
        paragraphs: [
          'If a website does not resolve, start with A, AAAA and CNAME. If email delivery is the problem, inspect MX and the relevant TXT records. If a domain appears delegated to the wrong provider, compare its NS answers with the nameservers configured at the registrar.',
          'This does not replace a full DNS diagnostic trace, but it gives a compact snapshot of the records most people need during deployments, migrations and verification setup.'
        ]
      },
      {
        title: 'A public resolver view is useful precisely because it is external',
        paragraphs: [
          'A record can look correct inside a hosting dashboard while public DNS still returns something different. Querying an external DNS-over-HTTPS resolver gives you a view outside the application or hosting control panel.',
          'For propagation-sensitive work, compare more than one resolver and remember that cached answers can legitimately differ for a while.'
        ]
      }
    ],
    faq: [
      { q: 'Which DNS records does Toolmera check?', a: 'The lookup requests A, AAAA, CNAME, MX, TXT and NS records for the submitted public domain.' },
      { q: 'What does TTL mean?', a: 'TTL is the number of seconds a resolver may cache a DNS answer before it should refresh it.' },
      { q: 'Can this prove DNS has propagated everywhere?', a: 'No. It shows the answer returned by the resolver used for this request. Other resolvers can temporarily hold different cached answers.' },
      { q: 'Why are there multiple A or MX records?', a: 'Domains can intentionally publish multiple addresses or mail exchangers for redundancy, distribution or provider-specific routing.' },
      { q: 'Can I enter a full URL?', a: 'Yes. The tool extracts the hostname from a normal public HTTP or HTTPS URL; a bare domain also works.' }
    ],
    related: [
      { id: 'ssl-checker', anchor: 'check HTTPS after DNS points to the server' },
      { id: 'http-status-checker', anchor: 'verify the web response after DNS resolves' },
      { id: 'website-analyzer', anchor: 'continue with a broader website audit' },
      { id: 'security-headers-checker', anchor: 'inspect browser-facing response security' }
    ],
    sources: [
      { label: 'Google Public DNS — DNS-over-HTTPS JSON API', href: 'https://developers.google.com/speed/public-dns/docs/doh/json' },
      { label: 'Cloudflare Learning Center — DNS record types', href: 'https://www.cloudflare.com/learning/dns/dns-records/' }
    ]
  },

  'tip': {
    title: 'Free Tip Calculator — Tip Amount, Total Bill & Split Per Person',
    description: 'Calculate the tip, final bill, tip per person and total per person from any bill amount, tip percentage and group size.',
    intro: 'Work out the numbers before the check gets passed around: choose a tip percentage, set the number of people and see both the full bill and each person’s share.',
    sections: [
      {
        title: 'A tip calculation is really two calculations',
        paragraphs: [
          'First, the tip amount is Bill × Tip Percentage ÷ 100. Then the final bill is the original amount plus that tip. When a group is splitting the check, both totals can be divided by the number of people so everyone sees the same basis.',
          'Toolmera keeps the full tip, full total, tip per person and total per person visible together. That makes it easier to catch a mistaken percentage or head count before anyone pays.'
        ],
        facts: [
          { label: 'Tip amount', value: 'Bill × tip % ÷ 100' },
          { label: 'Final total', value: 'Bill + tip' },
          { label: 'Per person', value: 'Final total ÷ number of people' }
        ]
      },
      {
        title: 'Preset percentages are shortcuts, not etiquette advice',
        paragraphs: [
          'The quick percentage buttons are there to save typing. They are not a recommendation about what you should tip, because tipping customs vary by country, venue, service type and sometimes by whether a service charge is already included.',
          'If the bill already includes a mandatory service charge, decide whether an additional tip is appropriate before applying another percentage.'
        ]
      },
      {
        title: 'The calculator is currency-agnostic',
        paragraphs: [
          'There is no exchange-rate logic in a tip calculation. Enter the bill in dollars, euros, pounds, rupees or another currency and the result stays in that same unit.',
          'The only requirement is consistency: the bill and the amounts you interpret from the result should all use the same currency.'
        ]
      }
    ],
    faq: [
      { q: 'How do I calculate a 20% tip?', a: 'Multiply the bill by 0.20. For a bill of 80, the tip is 16 and the total is 96.' },
      { q: 'Can I split the bill between several people?', a: 'Yes. Enter the number of people to see both the tip per person and the total bill per person.' },
      { q: 'Does the calculator recommend a tip percentage?', a: 'No. The percentage presets are calculation shortcuts, not etiquette guidance.' },
      { q: 'Can I use any currency?', a: 'Yes. The math is currency-agnostic as long as you interpret every monetary value in the same currency.' }
    ],
    related: [
      { id: 'percentage', anchor: 'solve a custom percentage question' },
      { id: 'discount', anchor: 'calculate a sale price before tipping' },
      { id: 'average', anchor: 'calculate an average from several amounts' }
    ]
  },

  'fraction': {
    title: 'Free Fraction Calculator — Add, Subtract, Multiply & Divide Fractions',
    description: 'Calculate two fractions with exact simplification, mixed-number output and a decimal result for addition, subtraction, multiplication or division.',
    intro: 'Keep the exact fraction instead of losing it to decimals: enter two fractions, choose the operation and see the reduced answer, mixed-number form and decimal together.',
    sections: [
      {
        title: 'Exact fraction arithmetic keeps information a decimal can hide',
        paragraphs: [
          'For addition and subtraction, fractions are moved to a common denominator before the numerators are combined. Multiplication multiplies numerators and denominators directly, while division multiplies by the reciprocal of the second fraction.',
          'After every operation, Toolmera reduces the result by the greatest common divisor so an answer such as 22/16 is shown as 11/8 rather than left unsimplified.'
        ],
        facts: [
          { label: 'Addition', value: 'a/b + c/d = (ad + bc) / bd' },
          { label: 'Multiplication', value: 'a/b × c/d = ac / bd' },
          { label: 'Division', value: 'a/b ÷ c/d = ad / bc' }
        ]
      },
      {
        title: 'Improper fractions, mixed numbers and decimals answer different needs',
        paragraphs: [
          'An improper fraction such as 11/8 is often the cleanest exact result for further calculation. The mixed-number form 1 3/8 can be easier to read in everyday measurements, while 1.375 is convenient when the next step expects a decimal.',
          'Showing all three avoids forcing one representation onto every workflow and makes it easier to verify that the simplified fraction and decimal agree.'
        ]
      },
      {
        title: 'Zero denominators are errors, not special values',
        paragraphs: [
          'A denominator of zero does not define a real fraction, so the calculator stops and asks for a valid denominator instead of returning Infinity or a misleading result.',
          'Division by a second fraction whose numerator is zero is also undefined because taking its reciprocal would create a zero denominator.'
        ]
      }
    ],
    faq: [
      { q: 'How does the calculator simplify fractions?', a: 'It divides the numerator and denominator by their greatest common divisor and normalizes the sign so the denominator stays positive.' },
      { q: 'Can it show a mixed number?', a: 'Yes. Improper results are also displayed as a whole number plus the remaining proper fraction.' },
      { q: 'Can I divide fractions?', a: 'Yes. Division is calculated by multiplying the first fraction by the reciprocal of the second, provided the second numerator is not zero.' },
      { q: 'Why is a denominator of zero invalid?', a: 'Division by zero is undefined, so a fraction with denominator zero has no valid real-number value.' }
    ],
    related: [
      { id: 'percentage', anchor: 'convert a ratio question into percentages' },
      { id: 'average', anchor: 'calculate statistics from decimal values' },
      { id: 'simple-interest', anchor: 'use exact ratios in an interest calculation' }
    ]
  }
};
