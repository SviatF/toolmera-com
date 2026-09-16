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
  {from:'time-zone',to:'date-calculator',anchor:'calculate a future or past date',reason:'Create a useful bridge from time conversion to date arithmetic.'},
  {from:'unix-timestamp',to:'time-zone',anchor:'convert the date and time between time zones',reason:'Strengthen the Time Zone Converter quick win from the closely related Unix timestamp workflow.'},
  {from:'time-duration',to:'time-zone',anchor:'convert a date and time between time zones',reason:'Connect elapsed-time intent with timezone conversion when users need to compare local times.'},
  {from:'age',to:'date-calculator',anchor:'add or subtract time from a date',reason:'Support adjacent date-calculation intent from the age calculator.'},
  {from:'resize-image',to:'compress-jpg',anchor:'make a JPG file smaller after resizing',reason:'Link the image-size workflow from dimensions to file-size compression.'},
  {from:'crop-image',to:'compress-jpg',anchor:'compress the JPG after cropping',reason:'Continue the image-editing workflow into JPEG optimization.'},
  {from:'word-counter',to:'remove-duplicate-lines',anchor:'dedupe repeated lines in the text',reason:'Connect text measurement with list and text cleanup intent.'},
  {from:'case-converter',to:'remove-duplicate-lines',anchor:'remove duplicate lines from the cleaned text',reason:'Continue text-normalization workflows into deduplication.'},
  {from:'length',to:'speed',anchor:'convert MPH, KM/H, M/S and knots',reason:'Strengthen the speed-converter quick win from the adjacent unit-conversion cluster.'},
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
