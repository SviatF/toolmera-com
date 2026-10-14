export type InternalLinkBoost={
  from:string;
  to:string;
  anchor:string;
  reason:string;
};

// Centrally deployed contextual links. Add or remove an entry here and every
// affected public tool page updates automatically on the next build.
// These are intentionally directed links: source page -> target page.
export const internalLinkBoosts:InternalLinkBoost[]=[
  {from:'technology-checker',to:'website-traffic-checker',anchor:'check website traffic and popularity',reason:'Strengthen the traffic-checker quick win from a closely related website-analysis page.'},
  {from:'technology-checker',to:'website-analyzer',anchor:'run a complete website and SEO audit',reason:'Send authority from technology detection into the broader website-analysis intent.'},
  {from:'website-traffic-checker',to:'website-analyzer',anchor:'analyze the website SEO and technical setup',reason:'Connect public popularity signals with the broader website-analysis workflow.'},
  {from:'seo-checker',to:'website-analyzer',anchor:'analyse the website with a broader technical audit',reason:'Strengthen the high-impression analyse-my-website intent from the focused SEO checker.'},
  {from:'meta-tag-checker',to:'website-analyzer',anchor:'analyse the full website page beyond meta tags',reason:'Move users from metadata diagnostics into the broader website analysis workflow.'},
  {from:'website-analyzer',to:'website-traffic-checker',anchor:'compare the domain traffic ranking and popularity trend',reason:'Send contextual authority from the broad website audit into the high-impression domain traffic ranking intent.'},
  {from:'seo-checker',to:'website-traffic-checker',anchor:'compare the site’s public traffic ranking',reason:'Connect SEO research with the current high-impression domain traffic ranking opportunity.'},
  {from:'website-analyzer',to:'seo-checker',anchor:'run a focused SEO website check',reason:'Strengthen the dedicated SEO checker from the broader analyzer page.'},
  {from:'website-traffic-checker',to:'seo-checker',anchor:'check the domain’s on-page and technical SEO',reason:'Connect the largest traffic-intent page with the focused SEO workflow.'},
  {from:'website-traffic-checker',to:'meta-tag-checker',anchor:'inspect the site’s title, description and canonical tags',reason:'Move traffic-research users into exact metadata diagnostics.'},
  {from:'meta-tag-checker',to:'website-traffic-checker',anchor:'compare the domain’s public traffic ranking and popularity trend',reason:'Send metadata authority into the highest-impression traffic-checker page.'},
  {from:'redirect-checker',to:'website-analyzer',anchor:'run a complete website audit after checking redirects',reason:'Connect redirect diagnostics back to the main analysis hub page.'},
  {from:'redirect-checker',to:'website-traffic-checker',anchor:'compare the domain’s public popularity signals',reason:'Strengthen the traffic checker from a high-impression HTTP workflow.'},
  {from:'sitemap-checker',to:'website-analyzer',anchor:'audit the website beyond its sitemap',reason:'Route crawl-discovery users into the broader website audit.'},
  {from:'sitemap-checker',to:'website-traffic-checker',anchor:'compare the website’s public popularity ranking',reason:'Add a relevant inbound path into the traffic-checker opportunity.'},
  {from:'robots-checker',to:'website-analyzer',anchor:'run a broader crawl and SEO audit',reason:'Connect robots diagnostics with the main Website Analyzer.'},
  {from:'ssl-checker',to:'website-analyzer',anchor:'check the rest of the website’s SEO and technical signals',reason:'Connect transport-security checks with the full audit.'},
  {from:'security-headers-checker',to:'website-analyzer',anchor:'run a complete website technical audit',reason:'Route security diagnostics into the full Website Analyzer.'},
  {from:'website-analyzer',to:'sitemap-checker',anchor:'check the XML sitemap',reason:'Give sitemap intent a direct contextual path from the broad site audit.'},
  {from:'website-analyzer',to:'redirect-checker',anchor:'trace redirects and 301 chains',reason:'Connect the broad audit with redirect diagnostics.'},
  {from:'http-status-checker',to:'website-traffic-checker',anchor:'compare website traffic and popularity signals',reason:'Connect HTTP diagnostics with the traffic/popularity workflow.'},
  {from:'http-status-checker',to:'sitemap-checker',anchor:'validate the XML sitemap',reason:'Support sitemap discovery from a technical website-analysis page.'},
  {from:'http-status-checker',to:'meta-tag-checker',anchor:'check the title tag and meta tags',reason:'Bridge technical status checks into on-page metadata diagnostics.'},
  {from:'seo-checker',to:'redirect-checker',anchor:'check redirects and 301 chains',reason:'Give redirect intent a direct contextual path from the broader SEO audit.'},
  {from:'seo-checker',to:'sitemap-checker',anchor:'validate the XML sitemap',reason:'Strengthen sitemap relevance from the dedicated SEO workflow.'},
  {from:'seo-checker',to:'meta-tag-checker',anchor:'inspect title tags, descriptions and canonicals',reason:'Connect broad SEO analysis with exact metadata intent.'},
  {from:'robots-checker',to:'sitemap-checker',anchor:'check the XML sitemap declared for the site',reason:'Robots and sitemap diagnostics are a natural crawl-control workflow.'},
  {from:'sitemap-checker',to:'seo-checker',anchor:'check the rest of the page SEO signals',reason:'Return sitemap users into the broader SEO audit cluster.'},
  {from:'redirect-checker',to:'meta-tag-checker',anchor:'review the final page title and meta tags',reason:'Help users validate on-page metadata after resolving the final URL.'},
  {from:'redirect-checker',to:'http-status-checker',anchor:'check the final HTTP status and response headers',reason:'Connect redirect-chain intent with final-response diagnostics.'},
  {from:'date-difference',to:'date-calculator',anchor:'add or subtract days, weeks and months',reason:'Connect date comparison intent with date arithmetic intent.'},
  {from:'date-difference',to:'time-duration',anchor:'calculate the exact elapsed time between date-times',reason:'Strengthen the time-duration intent from the adjacent calendar-difference workflow.'},
  {from:'time-zone',to:'date-calculator',anchor:'calculate a future or past date',reason:'Create a useful bridge from time conversion to date arithmetic.'},
  {from:'time-zone',to:'time-duration',anchor:'measure the elapsed duration between two date-times',reason:'Connect time-zone workflows with exact elapsed-duration calculation.'},
  {from:'time-duration',to:'date-calculator',anchor:'add days, weeks or months to a starting date',reason:'Strengthen the date-addition intent from an adjacent time calculation workflow.'},
  {from:'age',to:'date-calculator',anchor:'add or subtract time from a date',reason:'Support adjacent date-calculation intent from the age calculator.'},
  {from:'date-calculator',to:'unix-timestamp',anchor:'convert the resulting date to Unix or Linux time',reason:'Connect date arithmetic with the high-impression Unix/Linux time conversion intent.'},
  {from:'time-duration',to:'unix-timestamp',anchor:'convert Unix or Linux timestamps to readable dates',reason:'Strengthen the timestamp converter from an adjacent time workflow.'},
  {from:'unix-timestamp',to:'time-duration',anchor:'calculate elapsed time between decoded date-times',reason:'Create a direct workflow from timestamp decoding to duration calculation.'},
  {from:'jwt-decoder',to:'unix-timestamp',anchor:'convert JWT exp or iat timestamps to readable dates',reason:'JWT exp and iat claims commonly use Unix timestamps, creating a precise developer workflow link.'},
  {from:'unix-timestamp',to:'time-zone',anchor:'convert the date and time between time zones',reason:'Strengthen the Time Zone Converter quick win from the closely related Unix timestamp workflow.'},
  {from:'time-duration',to:'time-zone',anchor:'convert a date and time between time zones',reason:'Connect elapsed-time intent with timezone conversion when users need to compare local times.'},
  {from:'merge-pdf',to:'rotate-pdf',anchor:'rotate PDF pages after merging',reason:'Support the near-page-one Rotate PDF opportunity from a closely related PDF workflow.'},
  {from:'split-pdf',to:'rotate-pdf',anchor:'rotate the extracted PDF pages',reason:'Connect PDF extraction with page-orientation correction.'},
  {from:'remove-pdf-pages',to:'rotate-pdf',anchor:'rotate the remaining PDF pages',reason:'Create a natural follow-up from PDF cleanup to page rotation.'},
  {from:'resize-image',to:'compress-jpg',anchor:'make a JPG file smaller after resizing',reason:'Link the image-size workflow from dimensions to file-size compression.'},
  {from:'crop-image',to:'compress-jpg',anchor:'compress the JPG after cropping',reason:'Continue the image-editing workflow into JPEG optimization.'},
  {from:'compress-image',to:'compress-jpg',anchor:'decrease the size of a JPG and keep JPEG output',reason:'Strengthen the exact JPG-size-reduction intent from the broader image compressor.'},
  {from:'jpg-webp',to:'compress-jpg',anchor:'make the JPG smaller without changing its format',reason:'Offer same-format JPG compression as an alternative to format conversion.'},
  {from:'word-counter',to:'remove-duplicate-lines',anchor:'dedupe repeated lines in the text',reason:'Connect text measurement with list and text cleanup intent.'},
  {from:'case-converter',to:'remove-duplicate-lines',anchor:'remove duplicate lines from the cleaned text',reason:'Continue text-normalization workflows into deduplication.'},
  {from:'length',to:'speed',anchor:'convert MPH, KM/H, M/S and knots',reason:'Strengthen the speed-converter quick win from the adjacent unit-conversion cluster.'},
  {from:'area',to:'length',anchor:'convert a linear length measurement instead',reason:'Strengthen the length measurement converter from the adjacent dimensions cluster.'},
  {from:'volume',to:'length',anchor:'convert metric and Imperial length measurements',reason:'Connect adjacent measurement-conversion workflows to the length intent.'},
  {from:'speed',to:'length',anchor:'convert distance and length units',reason:'Link speed users to the underlying distance-unit conversion workflow.'},
  {from:'uuid',to:'random-number',anchor:'generate decimal or integer random numbers',reason:'Strengthen the random-number generator from an adjacent developer generator workflow.'},
  {from:'password-generator',to:'random-number',anchor:'generate random decimal or integer values instead',reason:'Connect adjacent random-generation workflows without creating a sitewide link.'},
  {from:'discount',to:'percentage',anchor:'calculate percentage change and percent of a number',reason:'Strengthen the percentage calculator from a closely related shopping calculation.'},
  {from:'roi',to:'percentage',anchor:'calculate a percentage increase or decrease',reason:'Connect return calculations with the underlying percentage workflow.'},
  {from:'average',to:'percentage',anchor:'calculate percentages from the same dataset',reason:'Create a useful bridge from summary statistics into percentage calculations.'},
  {from:'percentage',to:'loan',anchor:'estimate a fixed-rate loan payment from an interest rate',reason:'Complete the Loan Calculator inbound cluster: percentage-rate intent naturally leads into monthly payment and total-interest calculations.'},
  {from:'url-encoder',to:'qr-code',anchor:'turn the finished URL into a QR code',reason:'Connect URL preparation with a common QR-code publishing workflow.'},
  {from:'slug-generator',to:'qr-code',anchor:'create a QR code for the finished page URL',reason:'Connect URL publishing workflows with the QR generator.'},
  {from:'website-analyzer',to:'broken-link-checker',anchor:'scan the page for broken 404 and 410 links',reason:'Extend the broad audit into a focused live link check.'},
  {from:'website-analyzer',to:'schema-checker',anchor:'inspect the page’s JSON-LD structured data',reason:'Move from broad schema detection into block-level JSON-LD inspection.'},
  {from:'website-analyzer',to:'dns-lookup',anchor:'check the domain’s public DNS records',reason:'Connect website diagnostics with the DNS layer behind the hostname.'},
  {from:'seo-checker',to:'broken-link-checker',anchor:'check whether page links lead to broken destinations',reason:'Turn an SEO audit finding into a focused link-health workflow.'},
  {from:'seo-checker',to:'schema-checker',anchor:'inspect JSON-LD blocks and schema types',reason:'Give structured-data intent a dedicated diagnostic next step.'},
  {from:'meta-tag-checker',to:'schema-checker',anchor:'check structured data alongside page metadata',reason:'Connect two source-level search appearance diagnostics.'},
  {from:'redirect-checker',to:'broken-link-checker',anchor:'scan the source page for other broken or redirected links',reason:'Connect single-URL redirect debugging with page-wide link checking.'},
  {from:'http-status-checker',to:'broken-link-checker',anchor:'check multiple links from one page for HTTP failures',reason:'Scale from one HTTP status check to a bounded page link scan.'},
  {from:'ssl-checker',to:'dns-lookup',anchor:'inspect DNS records behind the HTTPS hostname',reason:'Connect transport diagnostics to hostname resolution.'},
  {from:'security-headers-checker',to:'dns-lookup',anchor:'check the domain’s public DNS setup',reason:'Connect response security diagnostics to public DNS configuration.'},
  {from:'percentage',to:'tip',anchor:'apply a percentage directly to a bill and split the total',reason:'Move from general percentage math into a real tipping workflow.'},
  {from:'discount',to:'tip',anchor:'calculate a tip after finding the final sale price',reason:'Connect two common checkout calculations.'},
  {from:'average',to:'fraction',anchor:'work with exact fractions instead of decimal-only values',reason:'Connect general numerical summaries with exact rational arithmetic.'},
  {from:'percentage',to:'fraction',anchor:'calculate with exact fractions before converting to percentages',reason:'Bridge percentage and fraction representations without creating duplicate intents.'},
  {from:'tip',to:'percentage',anchor:'solve a custom percentage question',reason:'Return from the tipping workflow to general percentage math.'},
  {from:'fraction',to:'percentage',anchor:'convert the ratio into a percentage question',reason:'Connect exact fraction results to percentage calculations.'},
];

export function internalLinkBoostsFrom(sourceId:string){
  return internalLinkBoosts.filter(item=>item.from===sourceId);
}

export function internalLinkBoostTargetIds(sourceId:string){
  return internalLinkBoostsFrom(sourceId).map(item=>item.to);
}

export function hasInternalLinkBoost(sourceId:string,targetId:string){
  return internalLinkBoosts.some(item=>item.from===sourceId&&item.to===targetId);
}
