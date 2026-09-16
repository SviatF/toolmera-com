export type SeoPriorityTarget={
  id:string;
  anchor:string;
  note:string;
};

// Curated from current Search Console opportunity signals. Keep this list small:
// it exists to concentrate internal authority on pages Google is already testing,
// not to turn every page into a sitewide footer link.
export const seoPriorityTargets:SeoPriorityTarget[]=[
  {id:'website-analyzer',anchor:'Website Analyzer',note:'Full public-page SEO and technical audit.'},
  {id:'seo-checker',anchor:'SEO Checker',note:'Focused on-page and technical SEO checks.'},
  {id:'sitemap-checker',anchor:'XML Sitemap Checker',note:'Validate sitemap availability, URLs and lastmod signals.'},
  {id:'redirect-checker',anchor:'301 & Redirect Checker',note:'Trace redirect chains and final destinations.'},
  {id:'meta-tag-checker',anchor:'Title & Meta Tag Checker',note:'Inspect title, description, canonical and social tags.'},
  {id:'http-status-checker',anchor:'HTTP Status Checker',note:'Check 200, 301, 404 and response headers.'},
  {id:'percentage',anchor:'Percentage Calculator',note:'Percent-of-number, change and difference calculations.'},
  {id:'qr-code',anchor:'QR Code Generator',note:'Create customizable static QR codes in the browser.'},
];

export const seoPriorityIds=new Set(seoPriorityTargets.map(item=>item.id));
