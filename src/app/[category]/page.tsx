import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolCard } from '@/components/ToolCard';
import { categories, toolsForCategory } from '@/data/tools';
import { categorySeoContent } from '@/data/seoContent';
import { freeTitle } from '@/lib/seo';

export function generateStaticParams(){return categories.map(c=>({category:c.slug}))}
export async function generateMetadata({params}:{params:Promise<{category:string}>}):Promise<Metadata>{
  const {category}=await params;const cat=categories.find(c=>c.slug===category);if(!cat)return{};
  const seo=categorySeoContent[category];
  return{
    title:freeTitle(seo?.title||cat.label),
    description:seo?.description||`${cat.description} Free, fast and private online tools from Toolmera.`,
    alternates:{canonical:`https://toolmera.com/${category}/`}
  }
}

export default async function CategoryPage({params}:{params:Promise<{category:string}>}){
  const {category}=await params;const cat=categories.find(c=>c.slug===category);if(!cat)notFound();
  const list=toolsForCategory(category);
  const seo=categorySeoContent[category];

  return <><Header/><main className="subPage">
    <section className="shell categoryHero compactHero">
      <div className="breadcrumbs"><Link href="/">Home</Link><ChevronRight/><span>{cat.label}</span></div>
      <span className="eyebrow neonText">TOOLMERA / {cat.label.toUpperCase()}</span>
      <h1>{cat.label}</h1>
      <p>{seo?.intro||`${cat.description} Fast, focused and designed with privacy in mind.`}</p>
      <div className="categoryMeta"><span>{list.length} tools</span><span>Free to use</span><span>No account required</span></div>
    </section>

    <section className="shell section categoryToolSection">
      <div className="sectionHead"><div><span className="sectionKicker">TOOLS</span><h2>Choose a tool</h2><p>Each page is built around one clear task.</p></div></div>
      <div className="toolGrid">{list.map(t=><ToolCard key={t.id} tool={t}/>)}</div>
    </section>

    {seo?.sections?.length&&<section className="shell categoryGuide">
      {seo.sections.map(section=><article className="seoArticle" key={section.title}>
        <h2>{section.title}</h2>
        {section.paragraphs.map((p,i)=><p key={i}>{p}</p>)}
      </article>)}
    </section>}

    <section className="shell categoryBenefits">
      <div><ShieldCheck/><strong>Privacy-minded</strong><span>Lightweight tasks run locally whenever possible.</span></div>
      <div><Zap/><strong>Fast by design</strong><span>No dashboards, onboarding or unnecessary steps.</span></div>
      <div><Sparkles/><strong>One-task focus</strong><span>Open the tool, finish the task, move on.</span></div>
    </section>

    {!seo&&<section className="shell seoPanel categorySeoPanel">
      <span className="sectionKicker">ABOUT {cat.label.toUpperCase()}</span>
      <h2>Useful {cat.label.toLowerCase()}, without the clutter.</h2>
      <p>Toolmera keeps every utility focused on a specific intent, while related tools and category navigation make the next step easy to find. The platform is built as a fast, static-first product with browser-side processing wherever the task allows it.</p>
      <Link className="inlineArrowLink" href="/tools/">Browse every Toolmera tool <ArrowRight size={16}/></Link>
    </section>}
  </main><Footer/></>
}
