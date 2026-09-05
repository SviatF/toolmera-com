import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileCheck2, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata:Metadata={
  title:'Free Online Tools — Toolmera Methodology & Accuracy',
  description:'How Toolmera tests calculations, documents assumptions, uses authoritative sources and handles browser-side file processing.',
  alternates:{canonical:'https://toolmera.com/methodology/'},
  openGraph:{title:'Toolmera Methodology & Accuracy',description:'How Toolmera verifies calculations and documents assumptions.',url:'https://toolmera.com/methodology/',siteName:'Toolmera',type:'website'},
  twitter:{card:'summary',title:'Toolmera Methodology & Accuracy',description:'How Toolmera verifies calculations and documents assumptions.'}
};

export default function MethodologyPage(){
  const schema={"@context":"https://schema.org","@type":"WebPage",name:"Toolmera Methodology & Accuracy",url:"https://toolmera.com/methodology/",description:"How Toolmera verifies calculations, assumptions and source material."};
  return <><Header/><main className="subPage">
    <section className="shell infoHero methodologyHero">
      <span className="eyebrow neonText">METHODOLOGY</span>
      <h1>How Toolmera checks its tools.</h1>
      <p>Every utility should make its assumptions visible. This page explains how calculations, conversions, file workflows and source material are reviewed before we rely on them in the product.</p>
    </section>

    <section className="shell methodologyGrid">
      <article className="methodologyCard"><FileCheck2/><h2>Calculation verification</h2><p>Calculator formulas are implemented from documented mathematical definitions or recognized reference material. We compare representative inputs against hand calculations and test edge cases such as zero rates, invalid ranges, leap dates and unit boundaries.</p></article>
      <article className="methodologyCard"><CheckCircle2/><h2>Worked examples</h2><p>Important calculators include worked examples so users can sanity-check the output. Examples are treated as illustrations, not forecasts, quotes or individualized advice.</p></article>
      <article className="methodologyCard"><ShieldCheck/><h2>Browser-side processing</h2><p>File tools are designed to process locally in the browser whenever the implementation supports it. Tool pages state limitations such as unsupported encryption, animation, metadata preservation or output behavior instead of implying capabilities that are not present.</p></article>
    </section>

    <section className="shell seoDeepDive methodologyDeepDive">
      <article className="seoArticle">
        <h2>Sources and regulatory context</h2>
        <p>When a tool touches finance, tax or health, Toolmera prefers primary or authoritative references such as regulators, government agencies and recognized scientific or standards organizations. Sources are linked on the relevant tool page when they materially support a formula, classification or limitation.</p>
        <p>A source link does not mean the source endorses Toolmera. Regulatory and product terms can change, so users should verify current official information when a decision depends on it.</p>
      </article>
      <article className="seoArticle">
        <h2>Estimates are not provider quotes</h2>
        <p>Loan, investment, deposit and tax calculators are mathematical planning tools. They do not know your lender terms, tax position, fees, eligibility, risk tolerance or future market returns unless those values are explicitly entered.</p>
        <p>For finance and tax tools, the interface and supporting content identify important exclusions and assumptions. Results are informational and are not financial, investment, legal or tax advice.</p>
      </article>
      <article className="seoArticle">
        <h2>Product-content consistency</h2>
        <p>Documentation is reviewed when tool behavior changes. If a converter gains batch processing, a calculator changes its formula or a file workflow changes its output format, the page copy and FAQ should be updated to describe the current implementation rather than an older version.</p>
      </article>
      <article className="seoArticle">
        <h2>Reporting an error</h2>
        <p>If a result looks wrong, include the tool URL, the inputs you used, the output you received and what you expected. That gives us enough information to reproduce the issue and review both the implementation and explanatory content.</p>
        <Link className="inlineArrowLink" href="/contact/">Report a problem <ArrowRight size={16}/></Link>
      </article>
    </section>

    <section className="shell reviewStamp"><span>Last methodology review</span><strong>September 5, 2026</strong><p>Methodology is updated as the tool library and reference requirements change.</p></section>
  </main><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><Footer/></>;
}
