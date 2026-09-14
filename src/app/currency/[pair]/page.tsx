import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CurrencyPairConverter } from '@/components/CurrencyConverter';
import { currencies, currencyPairDescription, currencyPairMap, currencyPairs, currencyPairSeo, currencyPairTitle, relatedCurrencyPairs } from '@/data/currencyPairs';

export function generateStaticParams(){return currencyPairs.map(item=>({pair:item.slug}))}

export async function generateMetadata({params}:{params:Promise<{pair:string}>}):Promise<Metadata>{
  const {pair:slug}=await params;const pair=currencyPairMap.get(slug);if(!pair)return{};
  const title=currencyPairTitle(pair);const description=currencyPairDescription(pair);const url=`https://toolmera.com/currency/${pair.slug}/`;
  return{
    title,description,alternates:{canonical:url},
    openGraph:{title:`${pair.from} to ${pair.to} Exchange Rate & Converter`,description,url,siteName:'Toolmera',type:'website'},
    twitter:{card:'summary',title:`${pair.from} to ${pair.to} Exchange Rate & Converter`,description},
  };
}

export default async function CurrencyPairPage({params}:{params:Promise<{pair:string}>}){
  const {pair:slug}=await params;const pair=currencyPairMap.get(slug);if(!pair)notFound();
  const from=currencies[pair.from];const to=currencies[pair.to];const url=`https://toolmera.com/currency/${pair.slug}/`;const related=relatedCurrencyPairs(pair.slug,5);const seo=currencyPairSeo(pair);
  const schemas=[
    {"@context":"https://schema.org","@type":"WebPage",name:`${pair.from} to ${pair.to} Exchange Rate & Converter`,url,description:currencyPairDescription(pair),isPartOf:{"@type":"WebSite",name:'Toolmera',url:'https://toolmera.com/'}},
    {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[
      {"@type":"ListItem",position:1,name:'Home',item:'https://toolmera.com/'},
      {"@type":"ListItem",position:2,name:'Currency Converter',item:'https://toolmera.com/currency/'},
      {"@type":"ListItem",position:3,name:`${pair.from} to ${pair.to}`,item:url},
    ]},
    {"@context":"https://schema.org","@type":"Dataset",name:`${pair.from} to ${pair.to} exchange rate history`,description:`Recent reference-rate observations for ${from.name} to ${to.name}, used by the Toolmera 7/30/90-day trend view.`,url,creator:{"@type":"Organization",name:'Toolmera',url:'https://toolmera.com/'},variableMeasured:[`${pair.from}/${pair.to} exchange rate`],distribution:{"@type":"DataDownload",encodingFormat:'application/json',contentUrl:`https://toolmera.com/api/currency/rates?pair=${pair.slug}`}},
  ];
  return <><Header/><main className="subPage">
    <section className="shell categoryHero compactHero">
      <div className="breadcrumbs"><Link href="/">Home</Link><ChevronRight/><Link href="/currency/">Currency</Link><ChevronRight/><span>{pair.from} to {pair.to}</span></div>
      <span className="eyebrow neonText">{pair.from} / {pair.to}</span>
      <h1>{pair.from} to {pair.to} — {from.name} to {to.name} Exchange Rate</h1>
      <p>{seo.intro}</p>
    </section>
    <section className="shell section"><CurrencyPairConverter pair={pair} related={related}/></section>
    <section className="shell categoryGuide">
      <article className="seoArticle">
        <h2>{pair.from} to {pair.to} conversion context</h2>
        <p>{seo.context}</p>
        <p>Use the amount converter for an instant calculation, then compare the current reference rate with the 7-day, 30-day and 90-day range to see whether the pair is near recent highs, lows or its recent average.</p>
      </article>
      <article className="seoArticle">
        <h2>How to read the {pair.from}/{pair.to} rate</h2>
        <p>A {pair.from}/{pair.to} rate shows how many {to.name.toLowerCase()} units one {from.name.toLowerCase()} buys. The inverse rate on this page shows the same relationship in the opposite direction, so you can compare both sides without opening another calculator.</p>
      </article>
    </section>
  </main>{schemas.map((schema,index)=><script key={index} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>)}<Footer/></>;
}
