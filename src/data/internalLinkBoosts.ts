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
  {from:'http-status-checker',to:'website-traffic-checker',anchor:'compare website traffic and popularity signals',reason:'Connect HTTP diagnostics with the traffic/popularity workflow.'},
  {from:'http-status-checker',to:'sitemap-checker',anchor:'validate the XML sitemap',reason:'Support sitemap discovery from a technical website-analysis page.'},
  {from:'seo-checker',to:'redirect-checker',anchor:'check redirects and 301 chains',reason:'Give redirect intent a direct contextual path from the broader SEO audit.'},
  {from:'date-difference',to:'date-calculator',anchor:'add or subtract days, weeks and months',reason:'Connect date comparison intent with date arithmetic intent.'},
  {from:'time-zone',to:'date-calculator',anchor:'calculate a future or past date',reason:'Create a useful bridge from time conversion to date arithmetic.'},
  {from:'age',to:'date-calculator',anchor:'add or subtract time from a date',reason:'Support adjacent date-calculation intent from the age calculator.'},
  {from:'resize-image',to:'compress-jpg',anchor:'make a JPG file smaller after resizing',reason:'Link the image-size workflow from dimensions to file-size compression.'},
  {from:'crop-image',to:'compress-jpg',anchor:'compress the JPG after cropping',reason:'Continue the image-editing workflow into JPEG optimization.'},
  {from:'http-status-checker',to:'meta-tag-checker',anchor:'check the title tag and meta tags',reason:'Bridge technical status checks into on-page metadata diagnostics.'},
  {from:'redirect-checker',to:'meta-tag-checker',anchor:'review the final page title and meta tags',reason:'Help users validate on-page metadata after resolving the final URL.'},
  {from:'word-counter',to:'remove-duplicate-lines',anchor:'dedupe repeated lines in the text',reason:'Connect text measurement with list and text cleanup intent.'},
  {from:'case-converter',to:'remove-duplicate-lines',anchor:'remove duplicate lines from the cleaned text',reason:'Continue text-normalization workflows into deduplication.'},
  {from:'length',to:'speed',anchor:'convert MPH, KM/H, M/S and knots',reason:'Strengthen the speed-converter quick win from the adjacent unit-conversion cluster.'},
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
