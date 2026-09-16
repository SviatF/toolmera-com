import { notFound } from 'next/navigation';
import { LocalizedPilotToolPage, localizedToolMetadata } from '@/components/LocalizedPilotPage';
import { localizedPilotTools } from '@/data/localizedToolPilot';

export function generateStaticParams(){return localizedPilotTools.hi.map(item=>({slug:item.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return localizedToolMetadata('hi',slug)}
export default async function HindiTool({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!localizedPilotTools.hi.some(item=>item.slug===slug))notFound();return <LocalizedPilotToolPage locale="hi" slug={slug}/>}
