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

const groupedCategoryTools: Record<string,{title:string;description:string;ids:string[]}[]> = {
  calculators: [
    { title: 'Finance & Growth', description: 'Loans, returns and interest calculations.', ids: ['loan','roi','simple-interest','compound','cagr'] },
    { title: 'Everyday Math & Shopping', description: 'Percentages, discounts and statistical averages.', ids: ['percentage','discount','average'] },
    { title: 'Date & Time', description: 'Calendar age and elapsed date calculations.', ids: ['age','date-difference'] },
    { title: 'Health', description: 'General health screening calculations.', ids: ['bmi'] },
  ],
  image: [
    { title: 'Format Conversion', description: 'Move between JPG, PNG, WebP and HEIC workflows.', ids: ['png-webp','webp-png','jpg-webp','jpg-png','png-jpg','webp-jpg','heic-jpg'] },
    { title: 'Optimization & Compression', description: 'Reduce file size with format-specific controls.', ids: ['compress-image','compress-jpg','compress-png'] },
    { title: 'Editing & Layout', description: 'Change composition or pixel dimensions.', ids: ['resize-image','crop-image'] },
  ],
  pdf: [
    { title: 'Organization & Editing', description: 'Combine, extract, rotate or remove PDF pages.', ids: ['merge-pdf','split-pdf','rotate-pdf','remove-pdf-pages'] },
    { title: 'Convert to PDF', description: 'Turn image files into ordered PDF pages.', ids: ['jpg-pdf','png-pdf'] },
    { title: 'Convert from PDF', description: 'Render PDF pages as downloadable image files.', ids: ['pdf-jpg'] },
  ],
  converters: [
    { title: 'Physical Measurements', description: 'Length, mass, surface area and volume conversions.', ids: ['length','weight','area','volume'] },
    { title: 'Temperature', description: 'Convert Celsius, Fahrenheit and Kelvin.', ids: ['temperature'] },
  ],
  generators: [
    { title: 'Codes & Identifiers', description: 'Create QR codes and UUID v4 identifiers.', ids: ['qr-code','uuid'] },
    { title: 'Secure & Random', description: 'Generate random passwords and numeric values.', ids: ['password','random-number'] },
  ],
  time: [
    { title: 'Epoch & Timestamps', description: 'Convert Unix time to readable dates and back.', ids: ['unix-timestamp'] },
  ],
  'website-analysis': [
    { title: 'Full Audit & SEO', description: 'Run broad website audits or focus on on-page search signals.', ids: ['website-analyzer','seo-checker','meta-tag-checker'] },
    { title: 'Crawl & HTTP', description: 'Inspect statuses, redirects and crawl-control files.', ids: ['http-status-checker','redirect-checker','robots-checker','sitemap-checker'] },
    { title: 'Security & Technology', description: 'Review HTTPS, browser security headers and public technology fingerprints.', ids: ['ssl-checker','security-headers-checker','technology-checker'] },
  ],
};

export function generateStaticParams(){return categories.map(c=>({category:c.slug}))}
export async function generateMetadata({params}:{params:Promise<{category:string}>}):Promise<Metadata>{
  const {category}=await params;const cat=categories.find(c=>c.slug===category);if(!cat)return{};
  const seo=categorySeoContent[category];
  const title=freeTitle(seo?.title||cat.label);
  const description=seo?.description||`${cat.description} Free, fast and privacy-minded online tools from Toolmera.`;
  const url=`https://toolmera.com/${category}/`;
  return{
    title,
    description,
    alternates:{canonical:url},
    openGraph:{title,description,url,siteName:'Toolmera',type:'website'},
    twitter:{card:'summary',title,description}
  }
}

export default async function CategoryPage({params}:{params:Promise<{category:string}>}){
  const {category}=await params;const cat=categories.find(c=>c.slug===category);if(!cat)notFound();
  const list=toolsForCategory(category);
  const seo=categorySeoContent[category];
  const categoryUrl=`https://toolmera.com/${category}/`;
  const categorySchemas=[
    {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[
      {"@type":"ListItem",position:1,name:"Home",item:"https://toolmera.com/"},
      {"@type":"ListItem",position:2,name:cat.label,item:categoryUrl}
    ]},
    {"@context":"https://schema.org","@type":"ItemList",name:`${cat.label} tools`,itemListElement:list.map((tool,index)=>({
      "@type":"ListItem",position:index+1,name:tool.name,url:`https://toolmera.com/${category}/${tool.slug}/`
    }))}
  ];

  return <><Header/><main className="subPage">
    <section className="shell categoryHero compactHero">
      <div className="breadcrumbs"><Link href="/">Home</Link><ChevronRight/><span>{cat.label}</span></div>
      <span className="eyebrow neonText">TOOLMERA / {cat.label.toUpperCase()}</span>
      <h1>{cat.label}</h1>
      <p>{seo?.intro||`${cat.description} Fast, focused and designed with privacy in mind.`}</p>
      <div className="categoryMeta"><span>{list.length} tools</span><span>Free to use</span><span>No account required</span></div>
    </section>

    {groupedCategoryTools[category]
      ? <section className="shell section categoryToolSection calculatorGroups">
          <div className="sectionHead"><div><span className="sectionKicker">{category==='calculators'?'GLOBAL CALCULATORS':'TOOL COLLECTION'}</span><h2>Choose by task</h2><p>{category==='calculators'?'Universal calculators grouped by what you are trying to solve.':'Focused utilities grouped around the workflow you need.'}</p></div></div>
          {groupedCategoryTools[category].map(group=>{
            const groupTools=list.filter(t=>group.ids.includes(t.id));
            if(!groupTools.length)return null;
            return <div className="calculatorGroup" key={group.title}>
              <div className="calculatorGroupHead"><h3>{group.title}</h3><p>{group.description}</p></div>
              <div className="toolGrid">{groupTools.map(t=><ToolCard key={t.id} tool={t}/>)}</div>
            </div>
          })}
        </section>
      : <section className="shell section categoryToolSection">
          <div className="sectionHead"><div><span className="sectionKicker">TOOLS</span><h2>Choose a tool</h2><p>Each page is built around one clear task.</p></div></div>
          <div className="toolGrid">{list.map(t=><ToolCard key={t.id} tool={t}/>)}</div>
        </section>}

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
  </main>{categorySchemas.map((schema,i)=><script key={i} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>)}<Footer/></>
}
