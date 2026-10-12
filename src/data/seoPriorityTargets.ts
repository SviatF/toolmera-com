export type SeoPriorityTarget={
  id:string;
  anchor:string;
  note:string;
};

// Curated from current Search Console opportunity signals. Keep this list small:
// it exists to concentrate internal authority on pages Google is already testing,
// not to turn every page into a sitewide footer link.
export const seoPriorityTargets:SeoPriorityTarget[]=[
  {id:'website-traffic-checker',anchor:'Website Traffic Checker',note:'Highest-impression website-analysis opportunity; public popularity and traffic-rank signals.'},
  {id:'website-analyzer',anchor:'Website Analyzer',note:'Full public-page SEO and technical audit with proven organic clicks.'},
  {id:'seo-checker',anchor:'SEO Checker',note:'Focused on-page and technical SEO checks inside the strongest topic cluster.'},
  {id:'meta-tag-checker',anchor:'Title & Meta Tag Checker',note:'Metadata checker already earning organic clicks.'},
  {id:'redirect-checker',anchor:'301 & Redirect Checker',note:'High-impression redirect intent inside the website-analysis silo.'},
  {id:'percentage',anchor:'Percentage Calculator',note:'Near-page-one calculator intent with expanding impressions.'},
  {id:'sitemap-checker',anchor:'XML Sitemap Checker',note:'Validate sitemap availability, URLs and lastmod signals.'},
  {id:'http-status-checker',anchor:'HTTP Status Checker',note:'Check 200, 301, 404 and response headers.'},
];

export const seoPriorityIds=new Set(seoPriorityTargets.map(item=>item.id));
