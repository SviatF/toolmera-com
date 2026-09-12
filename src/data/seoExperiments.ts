export type SeoExperiment={
  id:string;
  toolId:string;
  changedAt:string;
  change:string;
  commit?:string;
};

// One entry = one meaningful SEO change on one landing page.
// Keep the original experiment immutable; if the same page changes again,
// add a new entry so the observation window restarts instead of overwriting history.
export const seoExperiments:SeoExperiment[]=[
  {id:'traffic-seo-v1',toolId:'website-traffic-checker',changedAt:'2026-09-11',change:'Expanded traffic/popularity intent, metadata and supporting SEO copy.',commit:'edf5ace3'},
  {id:'sitemap-seo-v1',toolId:'sitemap-checker',changedAt:'2026-09-11',change:'Expanded XML sitemap validation intent, FAQ and supporting content.',commit:'be22354e'},
  {id:'redirect-seo-v1',toolId:'redirect-checker',changedAt:'2026-09-11',change:'Expanded redirect checker intent around 301 chains, hops and final URL.',commit:'a525c2cc'},
  {id:'unix-seo-v1',toolId:'unix-timestamp',changedAt:'2026-09-11',change:'Expanded Unix timestamp and epoch conversion search intent.',commit:'11970846'},
  {id:'date-calculator-seo-v1',toolId:'date-calculator',changedAt:'2026-09-11',change:'Expanded add/subtract date intent across days, weeks and months.',commit:'23a55a4b'},
  {id:'percentage-seo-v1',toolId:'percentage',changedAt:'2026-09-11',change:'Expanded percentage gain, increase, decrease and change intent.',commit:'82f15f14'},
  {id:'volume-seo-v1',toolId:'volume',changedAt:'2026-09-11',change:'Expanded cups, mL, liters and related volume-conversion intent.',commit:'a2103598'},
  {id:'compress-jpg-seo-v1',toolId:'compress-jpg',changedAt:'2026-09-11',change:'Expanded make-JPG-smaller and JPEG compression intent.',commit:'4b64a5cf'},
  {id:'length-seo-v1',toolId:'length',changedAt:'2026-09-11',change:'Expanded metric and Imperial length conversion intent.',commit:'fd3da058'},
  {id:'meta-tag-seo-v1',toolId:'meta-tag-checker',changedAt:'2026-09-11',change:'Expanded title-tag checker and metadata audit intent.',commit:'144471de'},
  {id:'compound-seo-v1',toolId:'compound',changedAt:'2026-09-11',change:'Expanded compound-interest and fixed-deposit growth intent.',commit:'2448b46b'},
  {id:'dedupe-seo-v1',toolId:'remove-duplicate-lines',changedAt:'2026-09-11',change:'Expanded dedupe-online and remove-duplicate-lines intent.',commit:'7ff47678'},
  {id:'speed-seo-v1',toolId:'speed',changedAt:'2026-09-11',change:'Expanded MPH, KM/H, M/S, knots and speed-conversion intent.',commit:'7ca11651'},
  {id:'website-analyzer-seo-v1',toolId:'website-analyzer',changedAt:'2026-09-11',change:'Expanded free web-page analyzer, SEO and technical-audit intent.',commit:'19f4dcd9'},
];
