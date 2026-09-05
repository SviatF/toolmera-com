import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';import { Footer } from '@/components/Footer';
export const metadata:Metadata={title:'Free India Tools — Finance & Tax Calculators',description:'Free India-specific finance and tax calculators from Toolmera.',alternates:{canonical:'https://toolmera.com/in/'}};
export default function India(){return <><Header/><main className="subPage"><section className="shell categoryHero"><span className="eyebrow neonText">TOOLMERA / INDIA</span><h1>Tools built for India.</h1><p>Country-specific finance and tax calculators for India, while universal calculators remain in Toolmera's global library.</p></section><section className="shell indiaHub"><Link href="/in/finance/"><span>01</span><h2>Finance</h2><p>EMI, SIP, FD and India-specific loan calculators.</p><ArrowRight/></Link><Link href="/in/tax/"><span>02</span><h2>Tax</h2><p>GST tools for inclusive and exclusive calculations.</p><ArrowRight/></Link></section></main><Footer/></>}
