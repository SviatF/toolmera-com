import { notFound } from 'next/navigation';
import { LocalizedScaleToolPage, localizedScaleToolMetadata } from '@/components/LocalizedScalePage';
import { localizedPilotTools } from '@/data/localizedToolRegistry';

export function generateStaticParams(){return localizedPilotTools.hi.map(item=>({slug:item.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return localizedScaleToolMetadata('hi',slug)}
export default async function HindiTool({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!localizedPilotTools.hi.some(item=>item.slug===slug))notFound();return <LocalizedScaleToolPage locale="hi" slug={slug}/>}
