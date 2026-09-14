import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CurrencyHubConverter } from '@/components/CurrencyConverter';
import { currencyPairs } from '@/data/currencyPairs';

export const metadata:Metadata={
  title:'Currency Converter — Exchange Rates Today',
  description:'Convert currencies with the latest official-source reference rates. Compare common amounts, inverse rates and demand-gated currency-pair trends.',
  alternates:{canonical:'https://toolmera.com/currency/'},
  openGraph:{title:'Currency Converter — Exchange Rates Today',description:'Convert currencies with the latest official-source reference rates and pair-specific trend data.',url:'https://toolmera.com/currency/',siteName:'Toolmera',type:'website'},
  twitter:{card:'summary',title:'Currency Converter — Exchange Rates Today',description:'Currency converter with official-source reference rates and pair-specific trend data.'},
};

const faq=[
  {q:'How often does the Toolmera currency converter update?',a:'Toolmera checks its stored reference-rate snapshot every hour. The underlying official-source rate date is shown on each currency-pair page.'},
  {q:'Can I convert currencies that do not have their own SEO page?',a:'Yes. The main currency converter can calculate across the supported currency set even when a dedicated pair URL has not been created.'},
  {q:'Where do the exchange rates come from?',a:'Rates are sourced through Frankfurter from official reference-rate providers and stored by Toolmera for fast conversion and recent trend views.'},
];

export default function CurrencyHubPage(){
  const schemas=[
    {"@context":"https://schema.org","@type":"WebPage",name:'Currency Converter — Exchange Rates Today',url:'https://toolmera.com/currency/',description:'Toolmera currency converter hub with official-source reference rates and demand-gated pair pages.'},
    {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[
      {"@type":"ListItem",position:1,name:'Home',item:'https://toolmera.com/'},
      {"@type":"ListItem",position:2,name:'Currency Converter',item:'https://toolmera.com/currency/'},
    ]},
    {"@context":"https://schema.org","@type":"ItemList",name:'Active currency converter pairs',numberOfItems:currencyPairs.length,itemListElement:currencyPairs.map((pair,index)=>({"@type":"ListItem",position:index+1,name:`${pair.from} to ${pair.to}`,url:`https://toolmera.com/currency/${pair.slug}/`}))},
    {"@context":"https://schema.org","@type":"FAQPage",mainEntity:faq.map(item=>({"@type":"Question",name:item.q,acceptedAnswer:{"@type":"Answer",text:item.a}}))},
  ];
  return <><Header/><main className="subPage">
    <section className="shell categoryHero compactHero">
      <div className="breadcrumbs"><Link href="/">Home</Link><ChevronRight/><span>Currency Converter</span></div>
      <span className="eyebrow neonText">TOOLMERA / CURRENCY</span>
      <h1>Currency Converter — Exchange Rates Today</h1>
      <p>Convert supported global currencies with the latest stored reference rates. Dedicated pair pages cover the strongest search intents with common amounts, inverse rates and 7/30/90-day trend context.</p>
      <div className="categoryMeta"><span>{currencyPairs.length} active pair pages</span><span>Snapshots checked hourly</span><span>No account required</span></div>
    </section>
    <section className="shell section"><CurrencyHubConverter/></section>
    <section className="shell categoryGuide">
      <article className="seoArticle"><h2>Convert currencies without hunting for a separate calculator</h2><p>Choose a source currency, target currency and amount on the main converter. Toolmera derives supported cross-rates from the same stored reference-rate graph used by the dedicated pair pages, so the calculator can cover more combinations than the SEO URL set.</p></article>
      <article className="seoArticle"><h2>Pair pages add trend context to the current rate</h2><p>Dedicated pages exist only for demand-gated currency pairs. They add common amount conversions, the inverse rate, recent highs and lows, the average rate and 7-day, 30-day and 90-day movement without creating thousands of thin pair URLs.</p></article>
    </section>
    <section className="shell faqSection"><span className="sectionKicker">FAQ</span><h2>Currency converter questions</h2>{faq.map(item=><details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</section>
  </main>{schemas.map((schema,index)=><script key={index} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>)}<Footer/></>;
}
