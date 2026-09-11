import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ShieldCheck, Zap, UserRoundCheck, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolExperience } from '@/components/ToolExperience';
import { ToolCard } from '@/components/ToolCard';
import { findTool, tools, toolUrl } from '@/data/tools';
import { toolSeoContent } from '@/data/seoContent';
import { websiteTrafficBenefits, websiteTrafficSeo } from '@/data/websiteTrafficSeo';
import { websiteSitemapBenefits, websiteSitemapSeo } from '@/data/websiteSitemapSeo';
import { websiteRedirectBenefits, websiteRedirectSeo } from '@/data/websiteRedirectSeo';
import { unixTimestampBenefits, unixTimestampSeo } from '@/data/unixTimestampSeo';
import { dateCalculatorBenefits, dateCalculatorSeo } from '@/data/dateCalculatorSeo';
import { percentageCalculatorBenefits, percentageCalculatorSeo } from '@/data/percentageCalculatorSeo';
import { volumeConverterBenefits, volumeConverterSeo } from '@/data/volumeConverterSeo';
import { compressJpgBenefits, compressJpgSeo } from '@/data/compressJpgSeo';
import { lengthConverterBenefits, lengthConverterSeo } from '@/data/lengthConverterSeo';
import { metaTagCheckerBenefits, metaTagCheckerSeo } from '@/data/metaTagCheckerSeo';
import { compoundInterestBenefits, compoundInterestSeo } from '@/data/compoundInterestSeo';
import { freeTitle } from '@/lib/seo';
import { howToForTool, semanticRelatedTools } from '@/lib/toolRelations';

export function generateStaticParams(){return tools.filter(t=>!t.country).map(t=>({category:t.category,slug:t.slug}))}

function seoForTool(toolId:string){
  if(toolId==='website-traffic-checker')return websiteTrafficSeo;
  if(toolId==='sitemap-checker')return websiteSitemapSeo;
  if(toolId==='redirect-checker')return websiteRedirectSeo;
  if(toolId==='unix-timestamp')return unixTimestampSeo;
  if(toolId==='date-calculator')return dateCalculatorSeo;
  if(toolId==='percentage')return percentageCalculatorSeo;
  if(toolId==='volume')return volumeConverterSeo;
  if(toolId==='compress-jpg')return compressJpgSeo;
  if(toolId==='length')return lengthConverterSeo;
  if(toolId==='meta-tag-checker')return metaTagCheckerSeo;
  if(toolId==='compound')return compoundInterestSeo;
  return toolSeoContent[toolId];
}

function benefitsForTool(toolId:string,fallback:string[]){
  if(toolId==='website-traffic-checker')return websiteTrafficBenefits;
  if(toolId==='sitemap-checker')return websiteSitemapBenefits;
  if(toolId==='redirect-checker')return websiteRedirectBenefits;
  if(toolId==='unix-timestamp')return unixTimestampBenefits;
  if(toolId==='date-calculator')return dateCalculatorBenefits;
  if(toolId==='percentage')return percentageCalculatorBenefits;
  if(toolId==='volume')return volumeConverterBenefits;
  if(toolId==='compress-jpg')return compressJpgBenefits;
  if(toolId==='length')return lengthConverterBenefits;
  if(toolId==='meta-tag-checker')return metaTagCheckerBenefits;
  if(toolId==='compound')return compoundInterestBenefits;
  return fallback;
}

function h1ForTool(tool:{id:string;kind:string;name:string}){
  if(tool.id==='meta-tag-checker')return 'Free Title Tag & Meta Tag Checker';
  return tool.kind==='website-analysis'?`Free ${tool.name}`:tool.name;
}

export async function generateMetadata({params}:{params:Promise<{category:string;slug:string}>}):Promise<Metadata>{
  const {category,slug}=await params;const tool=findTool(category,slug);if(!tool)return{};
  const seo=seoForTool(tool.id);
  const title=freeTitle(seo?.title||tool.title);
  const description=seo?.description||tool.description;
  const url=`https://toolmera.com/${category}/${slug}/`;
  return{
    title,
    description,
    alternates:{canonical:url},
    openGraph:{title,description,url,siteName:'Toolmera',type:'website'},
    twitter:{card:'summary',title,description}
  }
}

export default async function ToolPage({params}:{params:Promise<{category:string;slug:string}>}){
  const {category,slug}=await params;const tool=findTool(category,slug);if(!tool)notFound();
  const seo=seoForTool(tool.id);
  const benefits=benefitsForTool(tool.id,tool.benefits);
  const workflowIds=new Set(seo?.related?.map(item=>item.id)||[]);
  const semantic=semanticRelatedTools(tool,tools,8).filter(item=>!workflowIds.has(item.id));
  const related=(semantic.length?semantic:semanticRelatedTools(tool,tools,4)).slice(0,4);
  const howTo=howToForTool(tool);
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
      <h1>{h1ForTool(tool)}</h1>
      <p>{seo?.intro||tool.intro}</p>
    </section>

    <div className="shell"><ToolExperience tool={tool}/></div>

    <section className="shell toolTrustRow">
      <div><ShieldCheck/><span><strong>{tool.kind==='website-analysis'?'Public-data only':'Privacy-minded'}</strong><small>{tool.kind==='website-analysis'?'Live public HTTP/HTTPS checks':'Browser-first whenever possible'}</small></span></div>
      <div><Zap/><span><strong>Instant workflow</strong><small>No setup or account required</small></span></div>
      <div><UserRoundCheck/><span><strong>Free core tool</strong><small>Open it and get the task done</small></span></div>
    </section>

    <section className="shell toolContent">
      <div><span className="sectionKicker">WHY TOOLMERA</span><h2>Built to get the task done.</h2><ul>{benefits.map(x=><li key={x}>{x}</li>)}</ul></div>
      <div><span className="sectionKicker">ABOUT THIS TOOL</span><h2>{seo?.title||tool.title}</h2><p>{seo?.description||tool.description}</p></div>
    </section>

    {seo?.sections?.length&&<section className="shell seoDeepDive">
      {seo.sections.map(section=><article key={section.title} className="seoArticle">
        <h2>{section.title}</h2>
        {section.paragraphs.map((p,i)=><p key={i}>{p}</p>)}
        {section.facts?.length&&<div className="referenceFacts">{section.facts.map(f=><div key={f.label}><span>{f.label}</span><strong>{f.value}</strong></div>)}</div>}
      </article>)}
    </section>}

    <section className="shell howToSection">
      <span className="sectionKicker">HOW IT WORKS</span>
      <h2>How to use {tool.name}</h2>
      <div className="howToGrid">
        {howTo.map((step,index)=><div key={step.title}><span>{String(index+1).padStart(2,'0')}</span><h3>{step.title}</h3><p>{step.description}</p></div>)}
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
  </main><Footer/></>;
}
