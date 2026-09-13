import type { ToolSeoContent, ToolSeoSection } from '@/data/seoContent';

const intentBoosts: Record<string, ToolSeoSection> = {
  'home-emi-in': {
    title: 'Home loan calculator: estimate EMI and total borrowing cost',
    paragraphs: [
      'If you are looking for a loan calculator for a home loan, this page is built around the core repayment question: how much will the monthly EMI be for a chosen principal, annual interest rate and tenure? Toolmera also separates total interest from total repayment so the monthly payment is not viewed in isolation.',
      'Use the calculator to compare home-loan scenarios one variable at a time. A lower rate, smaller principal or shorter tenure can materially change lifetime interest, while a longer tenure can lower the EMI but increase the total borrowing cost. The result is an estimate and should be checked against the lender’s current terms before a borrowing decision.'
    ]
  },
  'fd-in': {
    title: 'FD maturity calculator: estimate maturity amount and interest earned',
    paragraphs: [
      'Use this FD maturity calculator when the question is how a fixed deposit may grow from the opening principal to the maturity amount. Enter the deposit amount, annual rate, tenure and compounding frequency to estimate both the final value and the interest earned.',
      'The calculation is most useful for comparing deposit scenarios rather than predicting an exact bank payout. Actual maturity proceeds can differ because a bank may apply product-specific compounding, day-count, rounding, payout, tax or premature-withdrawal rules.'
    ]
  },
  'seo-checker': {
    title: 'SEO web checker: audit the live page signals search engines can read',
    paragraphs: [
      'This SEO web checker reads a public URL and inspects the page-level signals that can be verified from the live response: title, meta description, H1 structure, canonical URL, robots directives, image ALT coverage, internal and external links, schema, robots.txt and sitemap availability.',
      'Use it as a fast first-pass web SEO check before opening a full crawler or Search Console. The report can expose missing or conflicting technical signals, but it does not invent keyword rankings, backlink authority or Google index status that cannot be proven from a public page fetch.'
    ]
  },
  'qr-code': {
    title: 'Custom QR code generator: control colors, error correction and quiet zone',
    paragraphs: [
      'Use the custom QR code generator when you need more than a default black-and-white matrix. Toolmera lets you encode a URL or text, choose foreground and background colors, select an error-correction level and adjust the quiet zone before downloading the result.',
      'PNG is convenient for ordinary documents and web graphics, while SVG is better when the code needs to scale cleanly for design or print. Keep strong contrast and test the final code at the real display or print size before publishing it.'
    ]
  },
  'technology-checker': {
    title: 'Detect website technologies from public HTML and response headers',
    paragraphs: [
      'Use this tool to detect website technologies that leave recognizable public fingerprints. Toolmera checks fetched HTML and HTTP headers for supported signals associated with CMS platforms, frontend frameworks, analytics tags, marketing integrations, CDN providers and selected infrastructure services.',
      'The result is intentionally evidence-based. A detected fingerprint is a useful research clue, while a missing technology only means the current public scan did not find a supported signal. Private databases, internal services and hidden backend components cannot be reliably identified from a normal public page response.'
    ]
  }
};

export function applyCommandCenterIntentSeo(toolId: string, base: ToolSeoContent | undefined): ToolSeoContent | undefined {
  const boost = intentBoosts[toolId];
  if (!base || !boost) return base;
  if (base.sections.some(section => section.title === boost.title)) return base;
  return { ...base, sections: [...base.sections, boost] };
}
