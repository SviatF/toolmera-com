import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolSearch } from '@/components/ToolSearch';
import { ToolCard } from '@/components/ToolCard';
import { categories, tools } from '@/data/tools';

export const metadata:Metadata={
  title:'Free Online Tools — Browse All Tools',
  description:'Browse all Toolmera tools for images, PDFs, calculators, converters, text, developer tasks and India finance.',
  alternates:{canonical:'https://toolmera.com/tools/'},
  openGraph:{title:'Free Online Tools — Browse All Tools',description:'Browse the complete Toolmera utility library.',url:'https://toolmera.com/tools/',siteName:'Toolmera',type:'website'},
  twitter:{card:'summary',title:'Free Online Tools — Browse All Tools',description:'Browse the complete Toolmera utility library.'}
};

export default function AllToolsPage(){
  const toolsSchema={"@context":"https://schema.org","@type":"ItemList",name:"Toolmera tools",itemListElement:tools.map((tool,index)=>({"@type":"ListItem",position:index+1,name:tool.name,url:`https://toolmera.com${tool.country?`/${tool.country}/${tool.category}/${tool.slug}/`:`/${tool.category}/${tool.slug}/`}`}))};
  return <><Header/><main className="subPage">
    <section className="shell allToolsHero">
      <span className="eyebrow neonText">TOOLMERA / ALL TOOLS</span>
      <h1>Find the right tool.</h1>
      <p>Search the full Toolmera library or browse by category.</p>
      <ToolSearch tools={tools}/>
    </section>

    {categories.map(cat=>{
      const list=tools.filter(t=>!t.country&&t.category===cat.slug);
      return <section className="shell allToolsGroup" key={cat.slug}>
        <div className="sectionHead"><div><span className="sectionKicker">{cat.label.toUpperCase()}</span><h2>{cat.label}</h2><p>{cat.description}</p></div></div>
        <div className="toolGrid">{list.map(t=><ToolCard key={t.id} tool={t}/>)}</div>
      </section>
    })}

    <section className="shell allToolsGroup">
      <div className="sectionHead"><div><span className="sectionKicker">LOCAL UTILITIES</span><h2>India tools</h2><p>Finance and tax calculators localized for India.</p></div></div>
      <div className="toolGrid">{tools.filter(t=>t.country==='in').map(t=><ToolCard key={t.id} tool={t}/>)}</div>
    </section>
  </main><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(toolsSchema)}}/><Footer/></>
}
