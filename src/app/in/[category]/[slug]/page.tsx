import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ShieldCheck, Zap, BarChart3, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolExperience } from '@/components/ToolExperience';
import { ToolCard } from '@/components/ToolCard';
import { findTool, tools, toolUrl } from '@/data/tools';
import { freeTitle } from '@/lib/seo';
import { indiaToolSeoContent } from '@/data/indiaSeoContent';
import { howToForTool, semanticRelatedTools } from '@/lib/toolRelations';

export function generateStaticParams(){return tools.filter(t=>t.country==='in').map(t=>({category:t.category,slug:t.slug}))}
export async function generateMetadata({params}:{params:Promise<{category:string;slug:string}>}):Promise<Metadata>{
  const {category,slug}=await params;const tool=findTool(category,slug,'in');if(!tool)return{};
  const seo=indiaToolSeoContent[tool.id];
  const title=freeTitle(seo?.title||tool.title);const description=seo?.description||tool.description;const url=`https://toolmera.com/in/${category}/${slug}/`;
  return{title,description,alternates:{canonical:url},openGraph:{title,description,url,siteName:'Toolmera',type:'website'},twitter:{card:'summary',title,description}}
}

export default async function IndiaTool({params}:{params:Promise<{category:string;slug:string}>}){
  const {category,slug}=await params;const tool=findTool(category,slug,'in');if(!tool)notFound();
  const seo=indiaToolSeoContent[tool.id];
  const workflowIds=new Set(seo?.related?.map(item=>item.id)||[]);
  const related=semanticRelatedTools(tool,tools,8).filter(item=>!workflowIds.has(item.id)).slice(0,4);
  const howTo=howToForTool(tool);
  const faq=seo?.faq||tool.faq;
  const url=`https://toolmera.com/in/${category}/${slug}/`;
  const schemas:Record<string,unknown>[]=[
    {"@context":"https://schema.org","@type":"WebApplication",name:tool.name,applicationCategory:"FinanceApplication",operatingSystem:"Any",url,description:tool.description,offers:{"@type":"Offer",price:"0",priceCurrency:"INR"}},
    {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[
      {"@type":"ListItem",position:1,name:"Home",item:"https://toolmera.com/"},
      {"@type":"ListItem",position:2,name:"India",item:"https://toolmera.com/in/"},
      {"@type":"ListItem",position:3,name:tool.categoryLabel,item:`https://toolmera.com/in/${category}/`},
      {"@type":"ListItem",position:4,name:tool.name,item:url}
    ]}
  ];
  if(seo?.faq?.length){
    schemas.push({"@context":"https://schema.org","@type":"FAQPage",mainEntity:seo.faq.map(item=>({
      "@type":"Question",name:item.q,acceptedAnswer:{"@type":"Answer",text:item.a}
    }))});
  }

  return <><Header/><main className="subPage">
    <section className="shell toolHero compactToolHero">
      <div className="breadcrumbs"><Link href="/">Home</Link><ChevronRight/><Link href="/in/">India</Link><ChevronRight/><Link href={`/in/${category}/`}>{tool.categoryLabel}</Link><ChevronRight/><span>{tool.name}</span></div>
      <span className="eyebrow neonText">INDIA / FAST & FREE</span><h1>{tool.name}</h1><p>{seo?.intro||tool.intro}</p>
    </section>

    <div className="shell"><ToolExperience tool={tool}/></div>

    <section className="shell toolTrustRow">
      <div><BarChart3/><span><strong>Instant estimate</strong><small>Change inputs and compare scenarios</small></span></div>
      <div><Zap/><span><strong>Fast calculation</strong><small>Results update without a sign-up</small></span></div>
      <div><ShieldCheck/><span><strong>Informational use</strong><small>Use current provider terms for decisions</small></span></div>
    </section>

    <section className="shell toolContent">
      <div><span className="sectionKicker">RESULTS</span><h2>Clear numbers for faster decisions.</h2><ul>{tool.benefits.map(b=><li key={b}>{b}</li>)}</ul></div>
      <div><span className="sectionKicker">ABOUT</span><h2>{seo?.title||tool.title}</h2><p>{seo?.description||tool.description}</p><p className="mutedNote">Figures are estimates for informational use and are not financial, tax or investment advice. Verify current provider and regulatory terms before making decisions.</p></div>
    </section>

    {seo?.sections?.length&&<section className="shell seoDeepDive indiaDeepDive">
      {seo.sections.map(section=><article key={section.title} className="seoArticle">
        <h2>{section.title}</h2>
        {section.paragraphs.map((p,i)=><p key={i}>{p}</p>)}
        {section.facts?.length&&<div className="referenceFacts">{section.facts.map(f=><div key={f.label}><span>{f.label}</span><strong>{f.value}</strong></div>)}</div>}
      </article>)}
    </section>}

    <section className="shell howToSection">
      <span className="sectionKicker">HOW TO USE IT</span><h2>How to use {tool.name}</h2>
      <div className="howToGrid">
        {howTo.map((step,index)=><div key={step.title}><span>{String(index+1).padStart(2,'0')}</span><h3>{step.title}</h3><p>{step.description}</p></div>)}
      </div>
    </section>

    {seo?.sources?.length&&<section className="shell sourcePanel">
      <span className="sectionKicker">OFFICIAL SOURCES</span>
      <p>Reference material used for assumptions and regulatory context:</p>
      <div>{seo.sources.map(source=><a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.label}<ArrowRight size={14}/></a>)}</div>
    </section>}

    {seo?.related?.length&&<section className="shell workflowLinks">
      <span className="sectionKicker">NEXT STEP</span>
      <h2>Continue with a related calculation</h2>
      <div>{seo.related.map(item=>{const next=tools.find(t=>t.id===item.id);if(!next)return null;return <Link href={toolUrl(next)} key={item.id}>{item.anchor}<ArrowRight size={15}/></Link>})}</div>
    </section>}

    {related.length>0&&<section className="shell section"><div className="sectionHead"><div><span className="sectionKicker">RELATED</span><h2>More India tools</h2></div></div><div className="toolGrid relatedGrid">{related.map(t=><ToolCard key={t.id} tool={t}/>)}</div></section>}

    <section className="shell faqSection"><span className="sectionKicker">FAQ</span><h2>Common questions</h2>{faq.map(f=><details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</section>
    {schemas.map((schema,i)=><script key={i} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>)}
  </main><Footer/></>
}
