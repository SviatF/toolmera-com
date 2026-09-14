import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CurrencyHubConverter } from '@/components/CurrencyConverter';
import { currencyPairs } from '@/data/currencyPairs';

export const metadata:Metadata={
  title:'Currency Converter — Live Exchange Rates | Toolmera',
  description:'Convert popular currency pairs with hourly-updated reference rates, quick amounts, and pair-specific exchange-rate trends.',
  alternates:{canonical:'https://toolmera.com/currency/'},
  openGraph:{title:'Currency Converter — Live Exchange Rates | Toolmera',description:'Convert popular currency pairs with hourly-updated reference rates and trend data.',url:'https://toolmera.com/currency/',siteName:'Toolmera',type:'website'},
  twitter:{card:'summary',title:'Currency Converter — Live Exchange Rates | Toolmera',description:'Hourly-updated currency converter and popular exchange-rate pairs.'},
};

export default function CurrencyHubPage(){
  const schemas=[
    {"@context":"https://schema.org","@type":"WebPage",name:'Currency Converter — Live Exchange Rates',url:'https://toolmera.com/currency/',description:'Toolmera currency converter hub with hourly-updated reference rates.'},
    {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[
      {"@type":"ListItem",position:1,name:'Home',item:'https://toolmera.com/'},
      {"@type":"ListItem",position:2,name:'Currency Converter',item:'https://toolmera.com/currency/'},
    ]},
    {"@context":"https://schema.org","@type":"ItemList",name:'Active currency converter pairs',numberOfItems:currencyPairs.length,itemListElement:currencyPairs.map((pair,index)=>({"@type":"ListItem",position:index+1,name:`${pair.from} to ${pair.to}`,url:`https://toolmera.com/currency/${pair.slug}/`}))},
  ];
  return <><Header/><main className="subPage">
    <section className="shell categoryHero compactHero">
      <div className="breadcrumbs"><Link href="/">Home</Link><ChevronRight/><span>Currency Converter</span></div>
      <span className="eyebrow neonText">TOOLMERA / CURRENCY</span>
      <h1>Currency Converter — Live Exchange Rates</h1>
      <p>Convert the most useful global and India-focused currency pairs with hourly-updated reference rates. Pair pages include quick amounts and 7/30/90-day trend context.</p>
      <div className="categoryMeta"><span>{currencyPairs.length} active pairs</span><span>Hourly rate snapshots</span><span>No account required</span></div>
    </section>
    <section className="shell section"><CurrencyHubConverter/></section>
  </main>{schemas.map((schema,index)=><script key={index} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>)}<Footer/></>;
}
