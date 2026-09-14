export type CurrencyCode='USD'|'EUR'|'GBP'|'INR'|'AED'|'CAD'|'AUD'|'SGD'|'SAR'|'QAR'|'KWD'|'OMR'|'JPY'|'CHF'|'CNY';

export type CurrencyMeta={
  code:CurrencyCode;
  name:string;
  symbol:string;
  locale:string;
};

export type CurrencyPair={
  slug:string;
  from:CurrencyCode;
  to:CurrencyCode;
  priority:'P0'|'P1'|'P2';
};

export const currencies:Record<CurrencyCode,CurrencyMeta>={
  USD:{code:'USD',name:'US Dollar',symbol:'$',locale:'en-US'},
  EUR:{code:'EUR',name:'Euro',symbol:'€',locale:'de-DE'},
  GBP:{code:'GBP',name:'British Pound',symbol:'£',locale:'en-GB'},
  INR:{code:'INR',name:'Indian Rupee',symbol:'₹',locale:'en-IN'},
  AED:{code:'AED',name:'UAE Dirham',symbol:'د.إ',locale:'en-AE'},
  CAD:{code:'CAD',name:'Canadian Dollar',symbol:'C$',locale:'en-CA'},
  AUD:{code:'AUD',name:'Australian Dollar',symbol:'A$',locale:'en-AU'},
  SGD:{code:'SGD',name:'Singapore Dollar',symbol:'S$',locale:'en-SG'},
  SAR:{code:'SAR',name:'Saudi Riyal',symbol:'﷼',locale:'en-SA'},
  QAR:{code:'QAR',name:'Qatari Riyal',symbol:'ر.ق',locale:'en-QA'},
  KWD:{code:'KWD',name:'Kuwaiti Dinar',symbol:'د.ك',locale:'en-KW'},
  OMR:{code:'OMR',name:'Omani Rial',symbol:'ر.ع.',locale:'en-OM'},
  JPY:{code:'JPY',name:'Japanese Yen',symbol:'¥',locale:'ja-JP'},
  CHF:{code:'CHF',name:'Swiss Franc',symbol:'CHF',locale:'de-CH'},
  CNY:{code:'CNY',name:'Chinese Yuan',symbol:'¥',locale:'zh-CN'},
};

// Demand-gated v1 set. Intentionally small: no mathematical pair explosion.
// Expansion happens only after GSC demonstrates new pair demand.
export const currencyPairs:CurrencyPair[]=[
  {slug:'usd-to-inr',from:'USD',to:'INR',priority:'P0'},
  {slug:'eur-to-inr',from:'EUR',to:'INR',priority:'P0'},
  {slug:'gbp-to-inr',from:'GBP',to:'INR',priority:'P0'},
  {slug:'aed-to-inr',from:'AED',to:'INR',priority:'P0'},
  {slug:'cad-to-inr',from:'CAD',to:'INR',priority:'P0'},
  {slug:'aud-to-inr',from:'AUD',to:'INR',priority:'P0'},
  {slug:'sgd-to-inr',from:'SGD',to:'INR',priority:'P0'},
  {slug:'sar-to-inr',from:'SAR',to:'INR',priority:'P1'},
  {slug:'qar-to-inr',from:'QAR',to:'INR',priority:'P1'},
  {slug:'kwd-to-inr',from:'KWD',to:'INR',priority:'P1'},
  {slug:'omr-to-inr',from:'OMR',to:'INR',priority:'P1'},
  {slug:'usd-to-eur',from:'USD',to:'EUR',priority:'P0'},
  {slug:'eur-to-usd',from:'EUR',to:'USD',priority:'P0'},
  {slug:'gbp-to-usd',from:'GBP',to:'USD',priority:'P0'},
  {slug:'usd-to-gbp',from:'USD',to:'GBP',priority:'P0'},
  {slug:'usd-to-cad',from:'USD',to:'CAD',priority:'P1'},
  {slug:'cad-to-usd',from:'CAD',to:'USD',priority:'P1'},
  {slug:'usd-to-aud',from:'USD',to:'AUD',priority:'P1'},
  {slug:'aud-to-usd',from:'AUD',to:'USD',priority:'P1'},
  {slug:'usd-to-jpy',from:'USD',to:'JPY',priority:'P0'},
  {slug:'jpy-to-usd',from:'JPY',to:'USD',priority:'P1'},
  {slug:'usd-to-chf',from:'USD',to:'CHF',priority:'P1'},
  {slug:'chf-to-usd',from:'CHF',to:'USD',priority:'P1'},
  {slug:'eur-to-gbp',from:'EUR',to:'GBP',priority:'P1'},
  {slug:'gbp-to-eur',from:'GBP',to:'EUR',priority:'P1'},
  {slug:'usd-to-aed',from:'USD',to:'AED',priority:'P1'},
  {slug:'aed-to-usd',from:'AED',to:'USD',priority:'P1'},
  {slug:'usd-to-sgd',from:'USD',to:'SGD',priority:'P2'},
  {slug:'sgd-to-usd',from:'SGD',to:'USD',priority:'P2'},
  {slug:'usd-to-cny',from:'USD',to:'CNY',priority:'P1'},
];

export const currencyPairMap=new Map(currencyPairs.map(pair=>[pair.slug,pair]));

export function relatedCurrencyPairs(slug:string,limit=5){
  const current=currencyPairMap.get(slug);
  if(!current)return [];
  return currencyPairs
    .filter(pair=>pair.slug!==slug&&(pair.from===current.from||pair.to===current.to||pair.from===current.to||pair.to===current.from))
    .sort((a,b)=>{
      const score=(pair:CurrencyPair)=>
        (pair.from===current.from?4:0)+(pair.to===current.to?4:0)+(pair.from===current.to?2:0)+(pair.to===current.from?2:0)+(pair.priority==='P0'?2:pair.priority==='P1'?1:0);
      return score(b)-score(a);
    })
    .slice(0,limit);
}

export function currencyPairTitle(pair:CurrencyPair){
  return `${pair.from} to ${pair.to} — Live Exchange Rate Today | Toolmera`;
}

export function currencyPairDescription(pair:CurrencyPair){
  return `Convert ${pair.from} to ${pair.to} at today's live reference rate, updated hourly. Use the calculator, typical amounts, and 7/30/90-day trend.`;
}
