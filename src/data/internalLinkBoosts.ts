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
  {from:'url-encoder',to:'qr-code',anchor:'turn the finished URL into a QR code',reason:'Connect URL preparation with a common QR-code publishing workflow.'},
  {from:'slug-generator',to:'qr-code',anchor:'create a QR code for the finished page URL',reason:'Connect URL publishing workflows with the QR generator.'},
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
