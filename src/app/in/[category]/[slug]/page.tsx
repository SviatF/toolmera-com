import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolExperience } from '@/components/ToolExperience';
import { ToolCard } from '@/components/ToolCard';
import { findTool, tools, toolsForCategory } from '@/data/tools';

export function generateStaticParams(){return tools.filter(t=>t.country==='in').map(t=>({category:t.category,slug:t.slug}))}
export async function generateMetadata({params}:{params:Promise<{category:string;slug:string}>}):Promise<Metadata>{
  const {category,slug}=await params;const tool=findTool(category,slug,'in');if(!tool)return{};
  return{title:tool.title,description:tool.description,alternates:{canonical:`https://toolmera.com/in/${category}/${slug}/`}}
}

export default async function IndiaTool({params}:{params:Promise<{category:string;slug:string}>}){
  const {category,slug}=await params;const tool=findTool(category,slug,'in');if(!tool)notFound();
  const related=toolsForCategory(category,'in').filter(t=>t.id!==tool.id).slice(0,4);
  const url=`https://toolmera.com/in/${category}/${slug}/`;
  const schema={"@context":"https://schema.org","@type":"WebApplication",name:tool.name,applicationCategory:"FinanceApplication",operatingSystem:"Any",url,description:tool.description,offers:{"@type":"Offer",price:"0",priceCurrency:"INR"}};

  return <><Header/><main className="subPage">
    <section className="shell toolHero compactToolHero">
      <div className="breadcrumbs"><Link href="/">Home</Link><ChevronRight/><Link href="/in/">India</Link><ChevronRight/><Link href={`/in/${category}/`}>{tool.categoryLabel}</Link><ChevronRight/><span>{tool.name}</span></div>
      <span className="eyebrow neonText">INDIA / FAST & FREE</span><h1>{tool.name}</h1><p>{tool.intro}</p>
    </section>

    <div className="shell"><ToolExperience tool={tool}/></div>

    <section className="shell toolTrustRow">
      <div><BarChart3/><span><strong>Instant estimate</strong><small>Change inputs and compare scenarios</small></span></div>
      <div><Zap/><span><strong>Fast calculation</strong><small>Results update without a sign-up</small></span></div>
      <div><ShieldCheck/><span><strong>Informational use</strong><small>Use current provider terms for decisions</small></span></div>
    </section>

    <section className="shell toolContent">
      <div><span className="sectionKicker">RESULTS</span><h2>Clear numbers for faster decisions.</h2><ul>{tool.benefits.map(b=><li key={b}>{b}</li>)}</ul></div>
      <div><span className="sectionKicker">ABOUT</span><h2>{tool.title}</h2><p>{tool.description}</p><p className="mutedNote">Figures are estimates for informational use and are not financial, tax or investment advice.</p></div>
    </section>

    <section className="shell howToSection">
      <span className="sectionKicker">HOW TO USE IT</span><h2>Adjust. Compare. Decide.</h2>
      <div className="howToGrid">
        <div><span>01</span><h3>Enter your values</h3><p>Use the fields above with the numbers relevant to your scenario.</p></div>
        <div><span>02</span><h3>Review the estimate</h3><p>See the result and supporting totals immediately.</p></div>
        <div><span>03</span><h3>Compare scenarios</h3><p>Change rate, tenure or amount to understand the difference.</p></div>
      </div>
    </section>

    {related.length>0&&<section className="shell section"><div className="sectionHead"><div><span className="sectionKicker">RELATED</span><h2>More India tools</h2></div></div><div className="toolGrid relatedGrid">{related.map(t=><ToolCard key={t.id} tool={t}/>)}</div></section>}

    <section className="shell faqSection"><span className="sectionKicker">FAQ</span><h2>Common questions</h2>{tool.faq.map(f=><details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
  </main><Footer/></>
}
