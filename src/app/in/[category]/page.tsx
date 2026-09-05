import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ArrowRight, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolCard } from '@/components/ToolCard';
import { toolsForCategory } from '@/data/tools';
import { freeTitle } from '@/lib/seo';

const labels:Record<string,string>={finance:'India Finance Calculators',tax:'India Tax Tools'};
const descriptions:Record<string,string>={
  finance:'Estimate India-specific loan payments, SIP scenarios and fixed-deposit growth with focused local finance calculators.',
  tax:'Simple India-focused tax utilities for quick estimates and everyday calculations.'
};

export function generateStaticParams(){return [{category:'finance'},{category:'tax'}]}
export async function generateMetadata({params}:{params:Promise<{category:string}>}):Promise<Metadata>{
  const {category}=await params;
  const title=freeTitle(labels[category]||'India Tools');
  const description=descriptions[category]||'Free India tools from Toolmera.';
  const url=`https://toolmera.com/in/${category}/`;
  return{title,description,alternates:{canonical:url},openGraph:{title,description,url,siteName:'Toolmera',type:'website'},twitter:{card:'summary',title,description}}
}

export default async function IndiaCategory({params}:{params:Promise<{category:string}>}){
  const {category}=await params;if(!labels[category])notFound();const list=toolsForCategory(category,'in');const categoryUrl=`https://toolmera.com/in/${category}/`;const categorySchemas=[{"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:"https://toolmera.com/"},{"@type":"ListItem",position:2,name:"India",item:"https://toolmera.com/in/"},{"@type":"ListItem",position:3,name:labels[category],item:categoryUrl}]},{"@context":"https://schema.org","@type":"ItemList",name:labels[category],itemListElement:list.map((tool,index)=>({"@type":"ListItem",position:index+1,name:tool.name,url:`https://toolmera.com/in/${category}/${tool.slug}/`}))}];
  return <><Header/><main className="subPage">
    <section className="shell categoryHero compactHero">
      <div className="breadcrumbs"><Link href="/">Home</Link><ChevronRight/><Link href="/in/">India</Link><ChevronRight/><span>{labels[category]}</span></div>
      <span className="eyebrow neonText">TOOLMERA / INDIA</span>
      <h1>{labels[category]}</h1>
      <p>{descriptions[category]}</p>
      <div className="categoryMeta"><span>{list.length} tools</span><span>India focused</span><span>Instant estimates</span></div>
    </section>

    {category==='finance'?<section className="shell section calculatorGroups">
      <div className="calculatorGroup">
        <div className="calculatorGroupHead"><h3>Loans & EMI</h3><p>Compare repayment scenarios for general, home and car loans.</p></div>
        <div className="toolGrid">{list.filter(t=>['emi-in','home-emi-in','car-emi-in'].includes(t.id)).map(t=><ToolCard key={t.id} tool={t}/>)}</div>
      </div>
      <div className="calculatorGroup">
        <div className="calculatorGroupHead"><h3>Investing & deposits</h3><p>Model SIP growth assumptions and fixed-deposit maturity.</p></div>
        <div className="toolGrid">{list.filter(t=>['sip-in','fd-in'].includes(t.id)).map(t=><ToolCard key={t.id} tool={t}/>)}</div>
      </div>
    </section>:<section className="shell section"><div className="toolGrid">{list.map(t=><ToolCard key={t.id} tool={t}/>)}</div></section>}

    <section className="shell seoPanel">
      <span className="sectionKicker">LOCAL UTILITIES</span>
      <h2>Clear tools for common India-specific calculations.</h2>
      <p>These calculators are designed for transparent scenario planning. Finance and tax pages state their assumptions and link to official reference material where regulatory context matters.</p>
      <div className="indiaHubActions"><Link className="inlineArrowLink" href="/in/">Explore all India tools <ArrowRight size={16}/></Link><Link className="inlineArrowLink" href="/methodology/"><ShieldCheck size={15}/> Accuracy methodology</Link></div>
    </section>
  </main>{categorySchemas.map((schema,i)=><script key={i} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>)}<Footer/></>
}
