import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ShieldCheck, Zap, UserRoundCheck, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolExperience } from '@/components/ToolExperience';
import { ToolCard } from '@/components/ToolCard';
import { findTool, tools, toolsForCategory, toolUrl } from '@/data/tools';
import { toolSeoContent } from '@/data/seoContent';

export function generateStaticParams(){return tools.filter(t=>!t.country).map(t=>({category:t.category,slug:t.slug}))}
export async function generateMetadata({params}:{params:Promise<{category:string;slug:string}>}):Promise<Metadata>{
  const {category,slug}=await params;const tool=findTool(category,slug);if(!tool)return{};
  const seo=toolSeoContent[tool.id];
  return{
    title:seo?.title||tool.title,
    description:seo?.description||tool.description,
    alternates:{canonical:`https://toolmera.com/${category}/${slug}/`}
  }
}

export default async function ToolPage({params}:{params:Promise<{category:string;slug:string}>}){
  const {category,slug}=await params;const tool=findTool(category,slug);if(!tool)notFound();
  const seo=toolSeoContent[tool.id];
  const fallbackRelated=toolsForCategory(category).filter(t=>t.id!==tool.id).slice(0,4);
  const related=seo?.related?.length
    ? seo.related.map(item=>tools.find(t=>t.id===item.id)).filter((t):t is NonNullable<typeof t>=>Boolean(t))
    : fallbackRelated;
  const url=`https://toolmera.com/${category}/${slug}/`;
  const description=seo?.description||tool.description;
  const faq=seo?.faq||tool.faq;
  const schemas:Record<string,unknown>[]=[
    {"@context":"https://schema.org","@type":"WebApplication",name:tool.name,applicationCategory:"UtilitiesApplication",operatingSystem:"Any",url,description,offers:{"@type":"Offer",price:"0",priceCurrency:"USD"}},
    {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[
      {"@type":"ListItem",position:1,name:"Home",item:"https://toolmera.com/"},
      {"@type":"ListItem",position:2,name:tool.categoryLabel,item:`https://toolmera.com/${category}/`},
      {"@type":"ListItem",position:3,name:tool.name,item:url}
    ]}
  ];
  if(seo?.faq?.length){
    schemas.push({"@context":"https://schema.org","@type":"FAQPage",mainEntity:seo.faq.map(item=>({
      "@type":"Question",name:item.q,acceptedAnswer:{"@type":"Answer",text:item.a}
    }))});
  }

  return <><Header/><main className="subPage">
    <section className="shell toolHero compactToolHero">
      <div className="breadcrumbs"><Link href="/">Home</Link><ChevronRight/><Link href={`/${category}/`}>{tool.categoryLabel}</Link><ChevronRight/><span>{tool.name}</span></div>
      <span className="eyebrow neonText">FAST. PRIVATE. NO SIGN-UP.</span>
      <h1>{tool.name}</h1>
      <p>{seo?.intro||tool.intro}</p>
    </section>

    <div className="shell"><ToolExperience tool={tool}/></div>

    <section className="shell toolTrustRow">
      <div><ShieldCheck/><span><strong>Privacy-minded</strong><small>Browser-first whenever possible</small></span></div>
      <div><Zap/><span><strong>Instant workflow</strong><small>No setup or account required</small></span></div>
      <div><UserRoundCheck/><span><strong>Free core tool</strong><small>Open it and get the task done</small></span></div>
    </section>

    <section className="shell toolContent">
      <div><span className="sectionKicker">WHY TOOLMERA</span><h2>Built to get the task done.</h2><ul>{tool.benefits.map(x=><li key={x}>{x}</li>)}</ul></div>
      <div><span className="sectionKicker">ABOUT THIS TOOL</span><h2>{seo?.title||tool.title}</h2><p>{seo?.description||tool.description}</p></div>
    </section>

    {seo?.sections?.length&&<section className="shell seoDeepDive">
      {seo.sections.map(section=><article key={section.title} className="seoArticle">
        <h2>{section.title}</h2>
        {section.paragraphs.map((p,i)=><p key={i}>{p}</p>)}
      </article>)}
    </section>}

    <section className="shell howToSection">
      <span className="sectionKicker">HOW IT WORKS</span>
      <h2>Three steps. That&apos;s it.</h2>
      <div className="howToGrid">
        <div><span>01</span><h3>Open the tool</h3><p>Start immediately. No sign-up, onboarding or dashboard.</p></div>
        <div><span>02</span><h3>Add your input</h3><p>Upload a file or enter the values needed for this calculation.</p></div>
        <div><span>03</span><h3>Get the result</h3><p>Download the output or use the result instantly.</p></div>
      </div>
    </section>

    {seo?.sources?.length&&<section className="shell sourcePanel">
      <span className="sectionKicker">SOURCES</span>
      <p>Reference material used for this page:</p>
      <div>{seo.sources.map(source=><a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.label}<ArrowRight size={14}/></a>)}</div>
    </section>}

    {seo?.related?.length&&<section className="shell workflowLinks">
      <span className="sectionKicker">NEXT STEP</span>
      <h2>Continue your workflow</h2>
      <div>
        {seo.related.map(item=>{
          const next=tools.find(t=>t.id===item.id);if(!next)return null;
          return <Link href={toolUrl(next)} key={item.id}>{item.anchor}<ArrowRight size={15}/></Link>
        })}
      </div>
    </section>}

    {related.length>0&&<section className="shell section">
      <div className="sectionHead"><div><span className="sectionKicker">KEEP GOING</span><h2>Related tools</h2><p>Useful next steps in the same workflow.</p></div></div>
      <div className="toolGrid relatedGrid">{related.map(t=><ToolCard key={t.id} tool={t}/>)}</div>
    </section>}

    <section className="shell faqSection"><span className="sectionKicker">FAQ</span><h2>Common questions</h2>{faq.map(f=><details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</section>
    {schemas.map((schema,i)=><script key={i} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>)}
  </main><Footer/></>
}
