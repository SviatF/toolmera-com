import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';import { Footer } from '@/components/Footer';
export default function India(){return <><Header/><main className="subPage"><section className="shell categoryHero"><span className="eyebrow neonText">TOOLMERA / INDIA</span><h1>Tools built for India.</h1><p>Localized finance and tax calculators, alongside Toolmera's global utility platform.</p></section><section className="shell indiaHub"><Link href="/in/finance/"><span>01</span><h2>Finance</h2><p>EMI, SIP, FD, CAGR and loan calculators.</p><ArrowRight/></Link><Link href="/in/tax/"><span>02</span><h2>Tax</h2><p>GST tools for inclusive and exclusive calculations.</p><ArrowRight/></Link></section></main><Footer/></>}
