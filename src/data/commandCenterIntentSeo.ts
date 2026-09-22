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
  'gst-in': {
    title: 'Inclusive GST calculator: find the base price and GST inside a tax-inclusive total',
    paragraphs: [
      'Use the inclusive GST calculator when the amount you already have includes GST and you need to separate it into the pre-tax base value and the GST component. Choose Remove GST, enter the GST-inclusive total and the applicable rate, and Toolmera reverses the tax without treating the full amount as the taxable base.',
      'For an inclusive amount, the base value is Inclusive total ÷ (1 + rate/100). The GST portion can then be found as Inclusive total − base value, or directly as Inclusive total × rate ÷ (100 + rate). For example, ₹1,180 inclusive of 18% GST resolves to a ₹1,000 base amount and ₹180 GST.'
    ],
    facts: [
      { label: 'Base amount', value: 'Inclusive total ÷ (1 + rate/100)' },
      { label: 'GST included', value: 'Inclusive total × rate ÷ (100 + rate)' },
      { label: '18% example', value: '₹1,180 → ₹1,000 + ₹180 GST' }
    ]
  },
  'rotate-pdf': {
    title: 'Rotate PDF online and save the page rotation permanently',
    paragraphs: [
      'Use Rotate PDF when pages are sideways or upside down and the correction needs to remain in the downloaded file. Upload the PDF, choose all pages, odd pages, even pages or a custom page selection, then rotate by 90 degrees clockwise, 90 degrees counter-clockwise or 180 degrees.',
      'Toolmera creates a new PDF with the selected page rotations saved into the document. The original file is not modified, and the browser-side workflow is designed for fixing page orientation rather than only rotating the on-screen preview.'
    ],
    facts: [
      { label: 'Page selection', value: 'All, odd, even or custom pages' },
      { label: 'Rotation', value: '90° clockwise, 90° counter-clockwise or 180°' },
      { label: 'Output', value: 'New PDF with rotation saved' }
    ]
  },
  'length': {
    title: 'Converter of length measurement units: metric and Imperial',
    paragraphs: [
      'If you need a converter of length measurement units, this page converts one-dimensional distance and size values between millimeters, centimeters, meters, kilometers, inches, feet, yards and miles. Enter a value once, choose the source and target units, and the converted measurement is calculated immediately.',
      'Use it for metric-to-Imperial and Imperial-to-metric work such as meters to feet, centimeters to inches, kilometers to miles and the reverse conversions. Area and volume are separate measurement types, so square or cubic units should use the dedicated Area or Volume Converter instead.'
    ],
    facts: [
      { label: 'Metric', value: 'mm, cm, m, km' },
      { label: 'Imperial / US', value: 'in, ft, yd, mi' },
      { label: 'Measurement type', value: 'Length / distance' }
    ]
  },
  'website-traffic-checker': {
    title: 'Domain traffic ranking: compare relative website popularity',
    paragraphs: [
      'Use the domain traffic ranking view to compare a website’s relative popularity in the available public ranking dataset. A lower numerical rank represents a stronger position in that dataset, while a higher number represents a weaker relative position. The current rank is shown together with recent history so one observation is not treated as the whole story.',
      'This is a ranking and popularity signal, not a claim about an exact number of monthly visitors. Compare the same metrics across competitor domains, watch whether rank improves or declines over time, and use first-party analytics when an exact traffic count is required.'
    ],
    facts: [
      { label: 'Ranking direction', value: 'Lower numerical rank is stronger' },
      { label: 'Trend', value: 'Up to 30 days of available rank history' },
      { label: 'Exact visitors', value: 'Not inferred from public rank' }
    ]
  },
  'date-calculator': {
    title: 'Date calculator to add days, weeks, months or years',
    paragraphs: [
      'Use this date calculator to add time to a starting date when you need a future deadline, renewal date or schedule date. Choose Add, then enter any combination of years, months, weeks and days. The result includes the calculated calendar date and its weekday.',
      'For example, you can add 45 days to a date, add 6 weeks, or add 2 months and 10 days in one calculation. Calendar months are handled as calendar units rather than being replaced with a fixed 30-day assumption, which matters around shorter months and end-of-month dates.'
    ],
    facts: [
      { label: 'Add units', value: 'Years, months, weeks and days' },
      { label: 'Combined input', value: 'Multiple date units in one calculation' },
      { label: 'Result', value: 'New calendar date and weekday' }
    ]
  },
  'unix-timestamp': {
    title: 'Convert Linux time to a readable date and time',
    paragraphs: [
      'If you need to convert Linux time, the value usually follows the Unix epoch convention: elapsed seconds since 1970-01-01 00:00:00 UTC. Paste the timestamp into Toolmera to convert it to a readable UTC date and your local date-time representation.',
      'Linux and Unix workflows can also expose millisecond timestamps, especially in JavaScript, APIs and application logs. Check whether the source value is in seconds or milliseconds before interpreting it, and use the reverse converter when you need to turn a date back into Unix epoch time.'
    ],
    facts: [
      { label: 'Linux / Unix epoch', value: '1970-01-01 00:00:00 UTC' },
      { label: 'Supported precision', value: 'Seconds and milliseconds' },
      { label: 'Output', value: 'UTC and local readable date-time' }
    ]
  },
  'compress-jpg': {
    title: 'Decrease the size of a JPG while keeping JPEG output',
    paragraphs: [
      'To decrease the size of a JPG, upload the JPEG image and lower the compression quality until the output reaches a useful balance between file size and visible detail. Toolmera re-encodes the image as JPG, so this workflow reduces storage size without changing the result to WebP or PNG.',
      'Compare the original and compressed byte size after each run instead of relying on a fixed reduction promise. If a photo is much larger in pixel dimensions than the final use requires, resize it first and then compress the resized JPG for a stronger overall reduction.'
    ],
    facts: [
      { label: 'Input', value: 'JPG / JPEG' },
      { label: 'Output', value: 'JPG' },
      { label: 'Size control', value: 'Adjustable JPEG quality' },
      { label: 'Verification', value: 'Original vs compressed file size' }
    ]
  },
  'speed': {
    title: 'Convert to MPH from km/h, m/s, ft/s or knots',
    paragraphs: [
      'Use the speed converter when you need to convert to MPH from another supported speed unit. Enter the source value, choose kilometers per hour, meters per second, feet per second or knots, and select miles per hour as the target to get the MPH result immediately.',
      'The same value can also be compared across all supported speed units, which is useful for road speeds, engineering data, marine or aviation values and technical sources that report velocity in a different unit.'
    ],
    facts: [
      { label: 'Target', value: 'Miles per hour (MPH)' },
      { label: 'Sources', value: 'km/h, m/s, ft/s and knots' },
      { label: 'Direction', value: 'Two-way speed conversion' }
    ]
  },
  'random-number': {
    title: 'Decimal random number generator with custom precision',
    paragraphs: [
      'Use the decimal random number generator when you need random values with fractional digits instead of whole integers. Set the minimum and maximum range, choose decimal output, select the required precision and generate one value or a list inside that range.',
      'Decimal precision controls how many digits appear after the decimal point. This makes the generator useful for test data, simulations, examples and other workflows where a bounded random decimal value is more useful than an integer.'
    ],
    facts: [
      { label: 'Output modes', value: 'Integer or decimal' },
      { label: 'Range', value: 'Custom minimum and maximum' },
      { label: 'Decimal control', value: 'Custom precision' },
      { label: 'Quantity', value: 'Single value or list' }
    ]
  },
  'time-duration': {
    title: 'Time duration calculator: exact elapsed difference between two dates or times',
    paragraphs: [
      'A time duration calculator measures the exact elapsed interval between a start and end date-time. Toolmera breaks the interval into whole days plus remaining hours, minutes and seconds, and also shows total elapsed hours, minutes and seconds for workflows that need one continuous duration.',
      'Calendar years and months are not fixed-duration units, so this tool does not label an elapsed interval as an exact number of years or months. If you need a calendar-style difference in years, months and days, use the Date Difference Calculator; use this page when the goal is exact clock-time duration.'
    ],
    facts: [
      { label: 'Elapsed breakdown', value: 'Days, hours, minutes and seconds' },
      { label: 'Totals', value: 'Total hours, minutes and seconds' },
      { label: 'Calendar years/months', value: 'Use Date Difference Calculator' }
    ]
  },
  'website-analyzer': {
    title: 'Analyse my website: run a live SEO and technical page check',
    paragraphs: [
      'If you want to analyse your website, enter a public HTTP or HTTPS URL and Toolmera inspects the live page response for on-page SEO and technical signals. The analysis covers the title, meta description, H1 structure, canonical URL, robots directives, image ALT coverage, internal and external links, schema, redirects and the final URL.',
      'The broader report also checks public robots.txt and sitemap context, security headers and detectable technology fingerprints when those signals are available. This is a live public-page analysis rather than a full multi-page crawl, private analytics report or Search Console index-coverage check.'
    ],
    facts: [
      { label: 'SEO', value: 'Title, metadata, headings, canonical and robots' },
      { label: 'Crawl context', value: 'robots.txt and XML sitemap' },
      { label: 'Technical', value: 'Redirects, headers and public technologies' },
      { label: 'Scope', value: 'Submitted public page plus crawl-control signals' }
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
