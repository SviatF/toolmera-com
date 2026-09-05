import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';

export function InfoPage({ eyebrow, title, intro, children }:{ eyebrow:string; title:string; intro:string; children:React.ReactNode }) {
  return <><Header/><main className="subPage">
    <section className="shell infoHero">
      <Link className="backLink" href="/"><ArrowLeft size={15}/> Back to Toolmera</Link>
      <span className="eyebrow neonText">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{intro}</p>
    </section>
    <section className="shell infoContent">{children}</section>
  </main><Footer/></>
}
