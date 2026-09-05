import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolCard } from '@/components/ToolCard';
import { toolsForCategory } from '@/data/tools';

const labels:Record<string,string>={finance:'India Finance Calculators',tax:'India Tax Tools'};
const descriptions:Record<string,string>={
  finance:'Estimate India-specific loan payments, SIP scenarios and fixed-deposit growth with focused local finance calculators.',
  tax:'Simple India-focused tax utilities for quick estimates and everyday calculations.'
};

export function generateStaticParams(){return [{category:'finance'},{category:'tax'}]}
export async function generateMetadata({params}:{params:Promise<{category:string}>}):Promise<Metadata>{
  const {category}=await params;return{title:labels[category]||'India Tools',description:descriptions[category]||'Free India tools from Toolmera.',alternates:{canonical:`https://toolmera.com/in/${category}/`}}
}

export default async function IndiaCategory({params}:{params:Promise<{category:string}>}){
  const {category}=await params;if(!labels[category])notFound();const list=toolsForCategory(category,'in');
  return <><Header/><main className="subPage">
    <section className="shell categoryHero compactHero">
      <div className="breadcrumbs"><Link href="/">Home</Link><ChevronRight/><Link href="/in/">India</Link><ChevronRight/><span>{labels[category]}</span></div>
      <span className="eyebrow neonText">TOOLMERA / INDIA</span>
      <h1>{labels[category]}</h1>
      <p>{descriptions[category]}</p>
      <div className="categoryMeta"><span>{list.length} tools</span><span>India focused</span><span>Instant estimates</span></div>
    </section>

    <section className="shell section">
      <div className="toolGrid">{list.map(t=><ToolCard key={t.id} tool={t}/>)}</div>
    </section>

    <section className="shell seoPanel">
      <span className="sectionKicker">LOCAL UTILITIES</span>
      <h2>Clear tools for common India-specific calculations.</h2>
      <p>These calculators are designed for fast estimates and planning. Results are informational and should be checked against current lender, tax or investment terms when making financial decisions.</p>
      <Link className="inlineArrowLink" href="/in/">Explore all India tools <ArrowRight size={16}/></Link>
    </section>
  </main><Footer/></>
}
