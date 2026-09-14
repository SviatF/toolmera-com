import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CurrencyPairConverter } from '@/components/CurrencyConverter';
import { currencies, currencyPairDescription, currencyPairMap, currencyPairs, currencyPairTitle, relatedCurrencyPairs } from '@/data/currencyPairs';

export function generateStaticParams(){return currencyPairs.map(item=>({pair:item.slug}))}

export async function generateMetadata({params}:{params:Promise<{pair:string}>}):Promise<Metadata>{
  const {pair:slug}=await params;const pair=currencyPairMap.get(slug);if(!pair)return{};
  const title=currencyPairTitle(pair);const description=currencyPairDescription(pair);const url=`https://toolmera.com/currency/${pair.slug}/`;
  return{
    title,description,alternates:{canonical:url},
    openGraph:{title,description,url,siteName:'Toolmera',type:'website'},
    twitter:{card:'summary',title,description},
  };
}

export default async function CurrencyPairPage({params}:{params:Promise<{pair:string}>}){
  const {pair:slug}=await params;const pair=currencyPairMap.get(slug);if(!pair)notFound();
  const from=currencies[pair.from];const to=currencies[pair.to];const url=`https://toolmera.com/currency/${pair.slug}/`;const related=relatedCurrencyPairs(pair.slug,5);
  const schemas=[
    {"@context":"https://schema.org","@type":"WebPage",name:`${pair.from} to ${pair.to} — Live Exchange Rate`,url,description:currencyPairDescription(pair),isPartOf:{"@type":"WebSite",name:'Toolmera',url:'https://toolmera.com/'}},
    {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[
      {"@type":"ListItem",position:1,name:'Home',item:'https://toolmera.com/'},
      {"@type":"ListItem",position:2,name:'Currency Converter',item:'https://toolmera.com/currency/'},
      {"@type":"ListItem",position:3,name:`${pair.from} to ${pair.to}`,item:url},
    ]},
    {"@context":"https://schema.org","@type":"Dataset",name:`${pair.from} to ${pair.to} exchange rate history`,description:`Recent reference-rate observations for ${from.name} to ${to.name}, used by the Toolmera 7/30/90-day trend view.`,url,creator:{"@type":"Organization",name:'Toolmera',url:'https://toolmera.com/'},temporalCoverage:'P90D',variableMeasured:[`${pair.from}/${pair.to} exchange rate`],distribution:{"@type":"DataDownload",encodingFormat:'application/json',contentUrl:`https://toolmera.com/api/currency/rates?pair=${pair.slug}`}},
  ];
  return <><Header/><main className="subPage">
    <section className="shell categoryHero compactHero">
      <div className="breadcrumbs"><Link href="/">Home</Link><ChevronRight/><Link href="/currency/">Currency</Link><ChevronRight/><span>{pair.from} to {pair.to}</span></div>
      <span className="eyebrow neonText">{pair.from} / {pair.to}</span>
      <h1>{from.name} to {to.name} — Live Exchange Rate</h1>
      <p>Convert {pair.from} to {pair.to} with the latest stored reference rate, quick amount conversions, and recent exchange-rate trend data.</p>
    </section>
    <section className="shell section"><CurrencyPairConverter pair={pair} related={related}/></section>
  </main>{schemas.map((schema,index)=><script key={index} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>)}<Footer/></>;
}
