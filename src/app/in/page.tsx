import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Landmark, Percent, ShieldCheck, TrendingUp } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolCard } from '@/components/ToolCard';
import { tools } from '@/data/tools';

export const metadata:Metadata={
  title:'Free India Tools — Finance, EMI, SIP, FD & GST Calculators',
  description:'Free India-specific calculators for EMI, home loans, car loans, SIP, fixed deposits and GST, with transparent assumptions and official reference links.',
  alternates:{canonical:'https://toolmera.com/in/'},
  openGraph:{title:'Free India Tools — Finance, EMI, SIP, FD & GST Calculators',description:'India-specific finance and tax calculators with transparent assumptions.',url:'https://toolmera.com/in/',siteName:'Toolmera',type:'website'},
  twitter:{card:'summary',title:'Free India Tools — Finance, EMI, SIP, FD & GST Calculators',description:'India-specific finance and tax calculators with transparent assumptions.'}
};

export default function India(){
  const local=tools.filter(t=>t.country==='in');
  const finance=local.filter(t=>t.category==='finance');
  const tax=local.filter(t=>t.category==='tax');
  const schema={"@context":"https://schema.org","@type":"ItemList",name:"Toolmera India tools",itemListElement:local.map((tool,index)=>({"@type":"ListItem",position:index+1,name:tool.name,url:`https://toolmera.com/in/${tool.category}/${tool.slug}/`}))};

  return <><Header/><main className="subPage">
    <section className="shell categoryHero indiaPillarHero">
      <div className="breadcrumbs"><Link href="/">Home</Link><span>›</span><span>India</span></div>
      <span className="eyebrow neonText">TOOLMERA / INDIA</span>
      <h1>Free online tools for India.</h1>
      <p>Focused calculators for borrowing, investing, deposits and GST. Each local tool explains the mathematical assumptions behind the result and links to relevant official material where regulatory context matters.</p>
      <div className="categoryMeta"><span>{local.length} India tools</span><span>Finance + tax</span><span>Informational estimates</span></div>
    </section>

    <section className="shell indiaPillarGrid">
      <Link className="indiaPillarCard accent-blue" href="/in/finance/"><Landmark/><span>FINANCE</span><h2>India Finance Calculators</h2><p>EMI, home-loan, car-loan, SIP and fixed-deposit planning tools.</p><b>Explore finance <ArrowRight size={15}/></b></Link>
      <Link className="indiaPillarCard accent-pink" href="/in/tax/"><Percent/><span>TAX</span><h2>India Tax Tools</h2><p>GST arithmetic with add/remove modes, common presets and official-rate references.</p><b>Explore tax <ArrowRight size={15}/></b></Link>
    </section>

    <section className="shell section indiaToolCluster">
      <div className="sectionHead"><div><span className="sectionKicker">LOANS & EMI</span><h2>Borrowing scenarios</h2><p>Compare monthly repayment, total interest and the impact of tenure or down payment.</p></div></div>
      <div className="toolGrid">{finance.filter(t=>['emi-in','home-emi-in','car-emi-in'].includes(t.id)).map(t=><ToolCard key={t.id} tool={t}/>)}</div>
    </section>

    <section className="shell section indiaToolCluster">
      <div className="sectionHead"><div><span className="sectionKicker">INVESTING & DEPOSITS</span><h2>Growth scenarios</h2><p>Model an assumed SIP return or compare fixed-deposit compounding assumptions.</p></div></div>
      <div className="toolGrid">{finance.filter(t=>['sip-in','fd-in'].includes(t.id)).map(t=><ToolCard key={t.id} tool={t}/>)}</div>
    </section>

    <section className="shell section indiaToolCluster">
      <div className="sectionHead"><div><span className="sectionKicker">GST</span><h2>Tax arithmetic</h2><p>Add GST to a base price or reverse a GST-inclusive amount.</p></div></div>
      <div className="toolGrid">{tax.map(t=><ToolCard key={t.id} tool={t}/>)}</div>
    </section>

    <section className="shell indiaTrustGrid">
      <div><ShieldCheck/><strong>Assumptions are visible</strong><p>Finance and tax outputs are estimates, with important exclusions and model assumptions stated on each page.</p></div>
      <div><Landmark/><strong>Primary references</strong><p>Relevant pages link to official RBI, SEBI or CBIC material where regulatory context supports the explanation.</p></div>
      <div><TrendingUp/><strong>Scenario planning, not promises</strong><p>SIP returns are not guaranteed and lender terms can differ from a fixed-rate calculator scenario.</p></div>
    </section>

    <section className="shell seoPanel indiaMethodologyCta">
      <span className="sectionKicker">ACCURACY & REVIEW</span>
      <h2>See how Toolmera verifies calculations.</h2>
      <p>Our methodology explains worked examples, source selection, browser-side processing and the line between mathematical estimates and provider-specific advice.</p>
      <Link className="inlineArrowLink" href="/methodology/">Read the methodology <ArrowRight size={16}/></Link>
    </section>
  </main><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><Footer/></>;
}
