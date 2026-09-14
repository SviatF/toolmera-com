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

export type CurrencyPairSeoCopy={
  meta:string;
  intro:string;
  context:string;
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

const pairSeo:Record<string,CurrencyPairSeoCopy>={
  'usd-to-inr':{
    meta:'Convert USD to INR with the latest reference rate, common amounts and 7/30/90-day trends for India travel, remittances and dollar payments.',
    intro:'USD to INR converts US dollars into Indian rupees, a heavily searched pair for India travel, remittances, overseas salaries and dollar-denominated purchases.',
    context:'Dollar-to-rupee checks are especially useful when comparing a US-dollar amount with an Indian-rupee budget, invoice, tuition payment or family transfer.'
  },
  'eur-to-inr':{
    meta:'Convert EUR to INR with the latest reference rate, common amounts and recent trends for Europe–India travel, tuition, remittances and euro payments.',
    intro:'EUR to INR converts euros into Indian rupees and is commonly checked for Europe–India travel, tuition, remittances and euro-denominated payments.',
    context:'This pair is useful when planning an Indian-rupee amount against a euro salary, education cost, trip budget or cross-border transfer.'
  },
  'gbp-to-inr':{
    meta:'Convert GBP to INR with the latest reference rate, common amounts and 7/30/90-day trends for UK–India remittances, education and travel.',
    intro:'GBP to INR converts British pounds into Indian rupees, a core UK–India pair for remittances, education costs, salaries and travel planning.',
    context:'Pound-to-rupee movement matters when a UK amount needs to be compared with an Indian budget, family transfer, tuition fee or property-related payment.'
  },
  'aed-to-inr':{
    meta:'Convert AED to INR with the latest reference rate, common amounts and recent trends for UAE–India salary transfers, remittances and travel.',
    intro:'AED to INR converts UAE dirhams into Indian rupees and is especially relevant to UAE–India salary transfers, remittances and travel budgets.',
    context:'Dirham-to-rupee checks are widely used to estimate how a UAE salary, family transfer or trip budget translates into Indian rupees.'
  },
  'cad-to-inr':{
    meta:'Convert CAD to INR with the latest reference rate, common amounts and recent trends for Canada–India tuition, family transfers and travel.',
    intro:'CAD to INR converts Canadian dollars into Indian rupees for Canada–India tuition planning, family transfers, travel and cross-border purchases.',
    context:'Canadian-dollar to rupee movement can materially change the INR value of education costs, relocation budgets and recurring family remittances.'
  },
  'aud-to-inr':{
    meta:'Convert AUD to INR with the latest reference rate, common amounts and recent trends for Australia–India tuition, travel and remittances.',
    intro:'AUD to INR converts Australian dollars into Indian rupees and is frequently used for Australia–India education, travel and family transfers.',
    context:'Australian-dollar to rupee checks help compare tuition, salary, migration and travel amounts across the two currencies.'
  },
  'sgd-to-inr':{
    meta:'Convert SGD to INR with the latest reference rate, common amounts and recent trends for Singapore–India salary transfers, travel and remittances.',
    intro:'SGD to INR converts Singapore dollars into Indian rupees for salary transfers, remittances, regional travel and Singapore–India payments.',
    context:'Singapore-dollar to rupee movement is useful for comparing employment income, family transfers and travel costs between Singapore and India.'
  },
  'sar-to-inr':{
    meta:'Convert SAR to INR with the latest reference rate, common amounts and recent trends for Saudi–India remittances, salaries and travel.',
    intro:'SAR to INR converts Saudi riyals into Indian rupees, a practical pair for Saudi–India remittances, salaries and travel-related conversions.',
    context:'Riyal-to-rupee checks help estimate the Indian-rupee value of Gulf earnings, family transfers and recurring cross-border payments.'
  },
  'qar-to-inr':{
    meta:'Convert QAR to INR with the latest reference rate, common amounts and recent trends for Qatar–India salaries, remittances and travel.',
    intro:'QAR to INR converts Qatari riyals into Indian rupees and is useful for Qatar–India salary transfers, remittances and travel budgets.',
    context:'Qatari-riyal to rupee movement helps workers and families compare Gulf income or transfers with expenses denominated in Indian rupees.'
  },
  'kwd-to-inr':{
    meta:'Convert KWD to INR with the latest reference rate, common amounts and recent trends for Kuwait–India salary transfers and remittances.',
    intro:'KWD to INR converts Kuwaiti dinars into Indian rupees, a high-value-unit pair used for Kuwait–India salaries, remittances and travel planning.',
    context:'Because one dinar represents a comparatively large rupee amount, even small rate changes can noticeably affect larger transfers.'
  },
  'omr-to-inr':{
    meta:'Convert OMR to INR with the latest reference rate, common amounts and recent trends for Oman–India salaries, remittances and travel.',
    intro:'OMR to INR converts Omani rials into Indian rupees and is commonly relevant to Oman–India salary transfers, remittances and travel.',
    context:'Omani-rial to rupee checks help compare Gulf income and family transfers with Indian expenses without manually calculating the cross rate.'
  },
  'usd-to-eur':{
    meta:'Convert USD to EUR with the latest reference rate, common amounts, inverse rate and 7/30/90-day trends for US–Europe travel and payments.',
    intro:'USD to EUR converts US dollars into euros, one of the world’s most watched currency pairs for travel, international invoices and cross-border purchases.',
    context:'Dollar-to-euro movement is useful when comparing US-denominated income or budgets with costs priced across the euro area.'
  },
  'eur-to-usd':{
    meta:'Convert EUR to USD with the latest reference rate, common amounts, inverse rate and 7/30/90-day trends for Europe–US travel and payments.',
    intro:'EUR to USD converts euros into US dollars and is a major global pair for transatlantic travel, invoices, subscriptions and international purchases.',
    context:'Euro-to-dollar movement helps translate euro income or budgets into US-dollar expenses and makes recent exchange-rate direction easier to compare.'
  },
  'gbp-to-usd':{
    meta:'Convert GBP to USD with the latest reference rate, common amounts, inverse rate and 7/30/90-day trends for UK–US travel and payments.',
    intro:'GBP to USD converts British pounds into US dollars, a major sterling pair used for UK–US travel, payments, purchases and business invoices.',
    context:'Pound-to-dollar changes affect the USD value of sterling budgets, salaries and international costs, making trend context useful alongside the current rate.'
  },
  'usd-to-gbp':{
    meta:'Convert USD to GBP with the latest reference rate, common amounts, inverse rate and 7/30/90-day trends for US–UK travel and payments.',
    intro:'USD to GBP converts US dollars into British pounds for US–UK travel, purchases, invoices and cross-border budgeting.',
    context:'Dollar-to-pound movement helps compare US-dollar income or savings with sterling-denominated costs such as travel, services and education.'
  },
  'usd-to-cad':{
    meta:'Convert USD to CAD with the latest reference rate, common amounts and recent trends for US–Canada travel, shopping and cross-border payments.',
    intro:'USD to CAD converts US dollars into Canadian dollars and is widely used for cross-border travel, shopping, business and North American payments.',
    context:'Dollar-to-Canadian-dollar checks are useful when comparing prices or budgets on either side of the US–Canada border.'
  },
  'cad-to-usd':{
    meta:'Convert CAD to USD with the latest reference rate, common amounts and recent trends for Canada–US travel, shopping and cross-border payments.',
    intro:'CAD to USD converts Canadian dollars into US dollars for Canada–US travel, online purchases, subscriptions and cross-border business.',
    context:'Canadian-dollar to US-dollar movement helps translate Canadian income or budgets into USD-denominated costs and invoices.'
  },
  'usd-to-aud':{
    meta:'Convert USD to AUD with the latest reference rate, common amounts and recent trends for US–Australia travel, purchases and international payments.',
    intro:'USD to AUD converts US dollars into Australian dollars for US–Australia travel, online purchases, invoices and international budgeting.',
    context:'Dollar-to-Australian-dollar movement is useful when comparing US income or prices with costs denominated in Australian dollars.'
  },
  'aud-to-usd':{
    meta:'Convert AUD to USD with the latest reference rate, common amounts and recent trends for Australia–US travel, purchases and international payments.',
    intro:'AUD to USD converts Australian dollars into US dollars for travel, digital purchases, business invoices and international payments.',
    context:'Australian-dollar to US-dollar changes influence how Australian budgets translate into USD-denominated products, services and travel costs.'
  },
  'usd-to-jpy':{
    meta:'Convert USD to JPY with the latest reference rate, common amounts and 7/30/90-day trends for US–Japan travel, purchases and payments.',
    intro:'USD to JPY converts US dollars into Japanese yen, a major global pair for US–Japan travel, trade, purchases and international budgeting.',
    context:'Because yen values use a very different numerical scale from dollars, an instant conversion and recent range are especially useful for quick comparisons.'
  },
  'jpy-to-usd':{
    meta:'Convert JPY to USD with the latest reference rate, common amounts and recent trends for Japan–US travel, purchases and international payments.',
    intro:'JPY to USD converts Japanese yen into US dollars for Japan–US travel, purchases, invoices and international budgeting.',
    context:'Yen-to-dollar checks make it easier to translate larger yen amounts into familiar USD values while keeping recent rate direction visible.'
  },
  'usd-to-chf':{
    meta:'Convert USD to CHF with the latest reference rate, common amounts and recent trends for US–Switzerland travel, payments and budgeting.',
    intro:'USD to CHF converts US dollars into Swiss francs for US–Switzerland travel, purchases, international services and cross-border payments.',
    context:'Dollar-to-franc movement helps compare US-dollar budgets with Swiss-franc prices while the trend shows whether the current rate sits near recent highs or lows.'
  },
  'chf-to-usd':{
    meta:'Convert CHF to USD with the latest reference rate, common amounts and recent trends for Switzerland–US travel, payments and budgeting.',
    intro:'CHF to USD converts Swiss francs into US dollars for Switzerland–US travel, purchases, invoices and international budgeting.',
    context:'Franc-to-dollar checks help translate Swiss income or savings into USD-denominated costs while providing context for recent rate movement.'
  },
  'eur-to-gbp':{
    meta:'Convert EUR to GBP with the latest reference rate, common amounts and recent trends for euro-area–UK travel, shopping and payments.',
    intro:'EUR to GBP converts euros into British pounds for euro-area–UK travel, shopping, invoices and cross-border budgeting.',
    context:'Euro-to-pound movement is useful when comparing euro income or travel funds with sterling-denominated prices in the United Kingdom.'
  },
  'gbp-to-eur':{
    meta:'Convert GBP to EUR with the latest reference rate, common amounts and recent trends for UK–Europe travel, shopping and payments.',
    intro:'GBP to EUR converts British pounds into euros for UK–Europe travel, shopping, invoices and everyday cross-border budgeting.',
    context:'Pound-to-euro movement helps translate sterling income or savings into euro-area costs and gives context to recent changes before a trip or payment.'
  },
  'usd-to-aed':{
    meta:'Convert USD to AED with the latest reference rate, common amounts and recent trends for US–UAE travel, purchases and dollar-dirham budgeting.',
    intro:'USD to AED converts US dollars into UAE dirhams for US–UAE travel, purchases, invoices and dollar-to-dirham budgeting.',
    context:'The dirham is managed closely against the US dollar, so this pair is typically more stable than many floating currency pairs.'
  },
  'aed-to-usd':{
    meta:'Convert AED to USD with the latest reference rate, common amounts and recent trends for UAE–US travel, purchases and dirham-dollar budgeting.',
    intro:'AED to USD converts UAE dirhams into US dollars for UAE–US travel, purchases, subscriptions and international payments.',
    context:'Because the dirham is managed closely against the US dollar, this pair generally shows a narrower range than many freely floating currencies.'
  },
  'usd-to-sgd':{
    meta:'Convert USD to SGD with the latest reference rate, common amounts and recent trends for US–Singapore travel, purchases and international payments.',
    intro:'USD to SGD converts US dollars into Singapore dollars for travel, regional business, digital purchases and cross-border payments.',
    context:'Dollar-to-Singapore-dollar movement helps compare US-denominated budgets with costs in one of Asia’s major financial and travel hubs.'
  },
  'sgd-to-usd':{
    meta:'Convert SGD to USD with the latest reference rate, common amounts and recent trends for Singapore–US travel, purchases and international payments.',
    intro:'SGD to USD converts Singapore dollars into US dollars for travel, international services, digital purchases and cross-border budgeting.',
    context:'Singapore-dollar to US-dollar movement is useful when comparing regional income or savings with USD-priced products, services and travel.'
  },
  'usd-to-cny':{
    meta:'Convert USD to CNY with the latest reference rate, common amounts and recent trends for US–China purchases, invoices and cross-border budgeting.',
    intro:'USD to CNY converts US dollars into Chinese yuan for US–China purchases, invoices, sourcing and cross-border budgeting.',
    context:'Dollar-to-yuan checks are useful when comparing US-dollar budgets with CNY-denominated supplier prices, travel costs or international payments.'
  },
};

export function currencyPairSeo(pair:CurrencyPair){
  return pairSeo[pair.slug]||{
    meta:`Convert ${pair.from} to ${pair.to} with the latest reference rate, common amounts, inverse rate and 7/30/90-day exchange-rate trends.`,
    intro:`Convert ${currencies[pair.from].name} to ${currencies[pair.to].name} with the latest stored reference rate and recent exchange-rate context.`,
    context:`Use the calculator to compare ${pair.from} and ${pair.to} amounts and review how the pair has moved across recent rate observations.`
  };
}

function ringNeighbors(group:CurrencyPair[],current:CurrencyPair){
  if(group.length<2)return [] as CurrencyPair[];
  const index=group.findIndex(item=>item.slug===current.slug);
  if(index<0)return [] as CurrencyPair[];
  const result:CurrencyPair[]=[];
  for(let step=1;step<group.length&&result.length<2;step++){
    for(const offset of [-step,step]){
      const item=group[(index+offset+group.length)%group.length];
      if(item&&item.slug!==current.slug&&!result.some(row=>row.slug===item.slug))result.push(item);
      if(result.length>=2)break;
    }
  }
  return result;
}

export function relatedCurrencyPairs(slug:string,limit=5){
  const current=currencyPairMap.get(slug);
  if(!current)return [];

  const selected:CurrencyPair[]=[];
  const add=(pair:CurrencyPair|undefined)=>{
    if(pair&&pair.slug!==current.slug&&!selected.some(item=>item.slug===pair.slug))selected.push(pair);
  };

  // Reciprocal intent first when an indexable reverse pair exists.
  add(currencyPairs.find(pair=>pair.from===current.to&&pair.to===current.from));

  // Circular neighbours guarantee that every member of a same-target/base cluster
  // receives contextual inbound links instead of concentrating PageRank on early rows.
  ringNeighbors(currencyPairs.filter(pair=>pair.to===current.to),current).forEach(add);
  ringNeighbors(currencyPairs.filter(pair=>pair.from===current.from),current).forEach(add);

  const score=(pair:CurrencyPair)=>
    (pair.from===current.from?5:0)+(pair.to===current.to?5:0)+(pair.from===current.to?3:0)+(pair.to===current.from?3:0)+(pair.priority==='P0'?2:pair.priority==='P1'?1:0);

  currencyPairs
    .filter(pair=>pair.slug!==current.slug)
    .sort((a,b)=>score(b)-score(a)||a.slug.localeCompare(b.slug))
    .forEach(add);

  return selected.slice(0,limit);
}

export function currencyPairTitle(pair:CurrencyPair){
  // Root layout appends "| Toolmera". Keep brand out here to avoid duplicate titles.
  return `${pair.from} to ${pair.to} Today — Exchange Rate & Converter`;
}

export function currencyPairDescription(pair:CurrencyPair){
  return currencyPairSeo(pair).meta;
}
