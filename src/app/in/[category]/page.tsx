import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';import { Footer } from '@/components/Footer';import { ToolCard } from '@/components/ToolCard';import { toolsForCategory } from '@/data/tools';
const labels:Record<string,string>={finance:'India Finance Calculators',tax:'India Tax Tools'};
export function generateStaticParams(){return [{category:'finance'},{category:'tax'}]}
export async function generateMetadata({params}:{params:Promise<{category:string}>}):Promise<Metadata>{const {category}=await params;return{title:labels[category]||'India Tools',description:`Free ${labels[category]||'India tools'} from Toolmera.`}}
export default async function IndiaCategory({params}:{params:Promise<{category:string}>}){const {category}=await params;if(!labels[category])notFound();const list=toolsForCategory(category,'in');return <><Header/><main className="subPage"><section className="shell categoryHero"><span className="eyebrow neonText">TOOLMERA / INDIA</span><h1>{labels[category]}</h1><p>Fast, focused calculators designed for common Indian finance decisions.</p></section><section className="shell section"><div className="toolGrid">{list.map(t=><ToolCard key={t.id} tool={t}/>)}</div></section></main><Footer/></>}
