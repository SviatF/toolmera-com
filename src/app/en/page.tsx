import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Globe2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { localizedPilotTools } from '@/data/localizedToolRegistry';
import { tools, toolUrl } from '@/data/tools';

const localizedIds=localizedPilotTools.de.map(item=>item.toolId);

const languages={
  en:'https://toolmera.com/en/',
  de:'https://toolmera.com/de/',
  hi:'https://toolmera.com/hi/',
  ru:'https://toolmera.com/ru/',
  'x-default':'https://toolmera.com/en/',
};

export const metadata:Metadata={
  title:'Free Online Tools — English | Toolmera',
  description:'Browse Toolmera calculators, converters, image, PDF, text, developer, time and website tools in English with matching German, Hindi and Russian versions.',
  alternates:{canonical:'https://toolmera.com/en/',languages},
  openGraph:{title:'Free Online Tools — English | Toolmera',description:'Toolmera tools with matching German, Hindi and Russian versions.',url:'https://toolmera.com/en/',siteName:'Toolmera',type:'website',locale:'en_US'},
  twitter:{card:'summary',title:'Free Online Tools — English | Toolmera',description:'Toolmera tools with German, Hindi and Russian versions.'},
};

function englishItem(toolId:string){
  if(toolId==='currency')return{name:'Currency Converter',description:'Convert supported currencies with stored reference rates.',href:'/currency/'};
  const tool=tools.find(item=>item.id===toolId&&!item.country);
  return tool?{name:tool.name,description:tool.intro,href:toolUrl(tool)}:null;
}

export default function EnglishLocalizedHub(){
  const items=localizedIds.map(englishItem).filter((item):item is NonNullable<typeof item>=>Boolean(item));
  const schemas=[
    {"@context":"https://schema.org","@type":"CollectionPage",name:'Free Online Tools — English',url:'https://toolmera.com/en/',description:'English Toolmera tools with matching German, Hindi and Russian versions.',inLanguage:'en'},
    {"@context":"https://schema.org","@type":"ItemList",numberOfItems:items.length,itemListElement:items.map((item,index)=>({"@type":"ListItem",position:index+1,name:item.name,url:`https://toolmera.com${item.href}`}))},
  ];
  return <><Header/><main className="subPage" lang="en">
    <section className="shell categoryHero compactHero">
      <div className="breadcrumbs"><Link href="/">Home</Link><ChevronRight/><span>English</span></div>
      <span className="eyebrow neonText">TOOLMERA / ENGLISH</span>
      <h1>Free online tools in English</h1>
      <p>Browse the current global Toolmera tool set with matching German, Hindi and Russian versions for the same workflows.</p>
      <div className="categoryMeta"><span>{items.length} tools</span><span>Free to use</span><span>No account required</span></div>
    </section>
    <section className="shell section">
      <div className="sectionHead"><div><span className="sectionKicker">TOOLS</span><h2>Choose a tool</h2><p>Each English tool page links directly to the same tool in German, Hindi and Russian.</p></div></div>
      <div className="categoryGrid">{items.map(item=><Link className="categoryCard accent-blue" href={item.href} key={item.href}><span className="categoryIcon"><Globe2 size={24}/></span><div><h3>{item.name}</h3><p>{item.description}</p></div><span>Open tool <ArrowRight size={14}/></span></Link>)}</div>
    </section>
    <section className="shell workflowLinks"><span className="sectionKicker">LANGUAGE VERSIONS</span><div><Link href="/de/">Deutsch<ArrowRight size={14}/></Link><Link href="/hi/">हिन्दी<ArrowRight size={14}/></Link><Link href="/ru/">Русский<ArrowRight size={14}/></Link></div></section>
    {schemas.map((schema,index)=><script key={index} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>)}
  </main><Footer/></>;
}
