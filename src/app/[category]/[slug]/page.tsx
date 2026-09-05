import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ShieldCheck, Zap, UserRoundCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolExperience } from '@/components/ToolExperience';
import { ToolCard } from '@/components/ToolCard';
import { findTool, tools, toolsForCategory } from '@/data/tools';

export function generateStaticParams(){return tools.filter(t=>!t.country).map(t=>({category:t.category,slug:t.slug}))}
export async function generateMetadata({params}:{params:Promise<{category:string;slug:string}>}):Promise<Metadata>{
  const {category,slug}=await params;const tool=findTool(category,slug);if(!tool)return{};
  return{title:tool.title,description:tool.description,alternates:{canonical:`https://toolmera.com/${category}/${slug}/`}}
}

export default async function ToolPage({params}:{params:Promise<{category:string;slug:string}>}){
  const {category,slug}=await params;const tool=findTool(category,slug);if(!tool)notFound();
  const related=toolsForCategory(category).filter(t=>t.id!==tool.id).slice(0,4);
  const url=`https://toolmera.com/${category}/${slug}/`;
  const schemas=[
    {"@context":"https://schema.org","@type":"WebApplication",name:tool.name,applicationCategory:"UtilitiesApplication",operatingSystem:"Any",url,description:tool.description,offers:{"@type":"Offer",price:"0",priceCurrency:"USD"}},
    {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[
      {"@type":"ListItem",position:1,name:"Home",item:"https://toolmera.com/"},
      {"@type":"ListItem",position:2,name:tool.categoryLabel,item:`https://toolmera.com/${category}/`},
      {"@type":"ListItem",position:3,name:tool.name,item:url}
    ]}
  ];
  return <><Header/><main className="subPage">
    <section className="shell toolHero compactToolHero">
      <div className="breadcrumbs"><Link href="/">Home</Link><ChevronRight/><Link href={`/${category}/`}>{tool.categoryLabel}</Link><ChevronRight/><span>{tool.name}</span></div>
      <span className="eyebrow neonText">FAST. PRIVATE. NO SIGN-UP.</span>
      <h1>{tool.name}</h1>
      <p>{tool.intro}</p>
    </section>

    <div className="shell"><ToolExperience tool={tool}/></div>

    <section className="shell toolTrustRow">
      <div><ShieldCheck/><span><strong>Privacy-minded</strong><small>Browser-first whenever possible</small></span></div>
      <div><Zap/><span><strong>Instant workflow</strong><small>No setup or account required</small></span></div>
      <div><UserRoundCheck/><span><strong>Free core tool</strong><small>Open it and get the task done</small></span></div>
    </section>

    <section className="shell toolContent">
      <div><span className="sectionKicker">WHY TOOLMERA</span><h2>Built to get the task done.</h2><ul>{tool.benefits.map(x=><li key={x}>{x}</li>)}</ul></div>
      <div><span className="sectionKicker">ABOUT THIS TOOL</span><h2>{tool.title}</h2><p>{tool.description}</p></div>
    </section>

    <section className="shell howToSection">
      <span className="sectionKicker">HOW IT WORKS</span>
      <h2>Three steps. That&apos;s it.</h2>
      <div className="howToGrid">
        <div><span>01</span><h3>Open the tool</h3><p>Start immediately. No sign-up, onboarding or dashboard.</p></div>
        <div><span>02</span><h3>Add your input</h3><p>Upload a file or enter the values needed for this calculation.</p></div>
        <div><span>03</span><h3>Get the result</h3><p>Download the output or use the result instantly.</p></div>
      </div>
    </section>

    {related.length>0&&<section className="shell section">
      <div className="sectionHead"><div><span className="sectionKicker">KEEP GOING</span><h2>Related tools</h2><p>Useful next steps in the same category.</p></div></div>
      <div className="toolGrid relatedGrid">{related.map(t=><ToolCard key={t.id} tool={t}/>)}</div>
    </section>}

    <section className="shell faqSection"><span className="sectionKicker">FAQ</span><h2>Common questions</h2>{tool.faq.map(f=><details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</section>
    {schemas.map((schema,i)=><script key={i} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>)}
  </main><Footer/></>
}
