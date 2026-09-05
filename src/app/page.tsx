import Link from 'next/link';
import { ArrowRight, LockKeyhole, Zap, UserRoundCheck, ImageIcon, FileText, Calculator, Repeat2, TextCursorInput, Code2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolSearch } from '@/components/ToolSearch';
import { ToolCard } from '@/components/ToolCard';
import { categories, tools, toolUrl } from '@/data/tools';

const categoryIcons: Record<string, typeof ImageIcon> = { image: ImageIcon, pdf: FileText, calculators: Calculator, converters: Repeat2, text: TextCursorInput, developer: Code2 };

export default function Home() {
  const featured = tools.filter(t => ['png-webp','merge-pdf','emi-in','jpg-pdf','resize-image','age'].includes(t.id));
  const indiaFinance = tools.filter(t => t.country === 'in' && t.category === 'finance').slice(0, 4);
  const indiaTax = tools.filter(t => t.country === 'in' && t.category === 'tax').slice(0, 3);

  return <><Header/><main>
    <section className="hero">
      <div className="heroGlow heroGlowOne"/><div className="heroGlow heroGlowTwo"/>
      <div className="heroArc arcOne"/><div className="heroArc arcTwo"/><div className="heroArc arcThree"/>
      <div className="shell heroInner">
        <div className="heroCopy">
          <span className="eyebrow neonText">SIMPLE TOOLS. REAL PRODUCTIVITY.</span>
          <h1>Every tool. <span>One place.</span></h1>
          <p>Fast, private online tools for files, numbers and everyday tasks. No sign-up. No clutter. Just results.</p>
          <ToolSearch tools={tools}/>
          <div className="popular"><b>Popular:</b><Link href="/image/png-to-webp/">PNG to WebP</Link><Link href="/pdf/merge-pdf/">Merge PDF</Link><Link href="/in/finance/emi-calculator/">EMI Calculator</Link><Link href="/text/word-counter/">Word Counter</Link></div>
        </div>
        <div className="heroAside"><span>TOOLS</span><span>FOR A SMARTER</span><span>EVERYDAY.</span><i/></div>
      </div>
    </section>

    <section className="section shell featuredSection">
      <div className="sectionHead"><div><span className="sectionKicker">START HERE</span><h2>Featured tools</h2><p>The fastest routes to common tasks.</p></div><Link href="/tools/">See all tools <ArrowRight size={17}/></Link></div>
      <div className="toolGrid featuredGrid">{featured.map(t=><ToolCard key={t.id} tool={t}/>)}</div>
    </section>

    <section className="section shell" id="categories">
      <div className="sectionHead"><div><span className="sectionKicker">EXPLORE</span><h2>Browse by category</h2><p>One clean toolbox for every kind of work.</p></div></div>
      <div className="categoryGrid">{categories.map(cat=>{const Icon=categoryIcons[cat.slug];const count=tools.filter(t=>t.category===cat.slug&&!t.country).length;return <Link className={`categoryCard accent-${cat.accent}`} href={`/${cat.slug}/`} key={cat.slug}><span className="categoryIcon"><Icon size={26}/></span><div><h3>{cat.label}</h3><p>{cat.description}</p></div><span>{count}+ tools <ArrowRight size={15}/></span></Link>})}</div>
    </section>

    <section className="shell trustStrip">
      <div><LockKeyhole/><span><strong>Private by default</strong><small>Files stay on your device whenever possible.</small></span></div>
      <div><Zap/><span><strong>Instant results</strong><small>Fast tools that work right in your browser.</small></span></div>
      <div><UserRoundCheck/><span><strong>No sign-up needed</strong><small>Open a tool and get the job done.</small></span></div>
    </section>

    <section className="section shell indiaSection indiaSectionRich">
      <div>
        <span className="sectionKicker">LOCAL UTILITIES</span>
        <h2>Built globally. Useful locally.</h2>
        <p>Country-specific calculators live alongside global file and productivity tools. India is our first localized finance cluster.</p>
      </div>
      <div className="localClusters">
        <div className="localClusterCard">
          <div className="localClusterHead"><div><span>INDIA</span><h3>Finance</h3></div><Link href="/in/finance/">Explore <ArrowRight size={16}/></Link></div>
          <div className="localToolLinks">{indiaFinance.map(t=><Link href={toolUrl(t)} key={t.id}>{t.name}<ArrowRight size={14}/></Link>)}</div>
        </div>
        <div className="localClusterCard">
          <div className="localClusterHead"><div><span>INDIA</span><h3>Tax</h3></div><Link href="/in/tax/">Explore <ArrowRight size={16}/></Link></div>
          <div className="localToolLinks">{indiaTax.map(t=><Link href={toolUrl(t)} key={t.id}>{t.name}<ArrowRight size={14}/></Link>)}</div>
        </div>
      </div>
    </section>
  </main><Footer/></>;
}
