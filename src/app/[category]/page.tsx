import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolCard } from '@/components/ToolCard';
import { categories, toolsForCategory } from '@/data/tools';

export function generateStaticParams(){return categories.map(c=>({category:c.slug}))}
export async function generateMetadata({params}:{params:Promise<{category:string}>}):Promise<Metadata>{const {category}=await params;const cat=categories.find(c=>c.slug===category);if(!cat)return{};return{title:cat.label,description:`${cat.description} Free, fast and private online tools from Toolmera.`}}
export default async function CategoryPage({params}:{params:Promise<{category:string}>}){const {category}=await params;const cat=categories.find(c=>c.slug===category);if(!cat)notFound();const list=toolsForCategory(category);return <><Header/><main className="subPage"><section className="shell categoryHero"><span className="eyebrow neonText">TOOLMERA / {cat.label.toUpperCase()}</span><h1>{cat.label}</h1><p>{cat.description} Fast, simple and designed with privacy in mind.</p></section><section className="shell section"><div className="toolGrid">{list.map(t=><ToolCard key={t.id} tool={t}/>)}</div></section><section className="shell seoPanel"><h2>Simple tools, without the clutter.</h2><p>Toolmera keeps each utility focused on a single task, with related tools one click away. Most lightweight file operations are designed to run locally in your browser.</p></section></main><Footer/></>}
