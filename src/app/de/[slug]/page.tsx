import { notFound } from 'next/navigation';
import { LocalizedScaleToolPage, localizedScaleToolMetadata } from '@/components/LocalizedScalePage';
import { localizedPilotTools } from '@/data/localizedToolRegistry';

export function generateStaticParams(){return localizedPilotTools.de.map(item=>({slug:item.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return localizedScaleToolMetadata('de',slug)}
export default async function GermanTool({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!localizedPilotTools.de.some(item=>item.slug===slug))notFound();return <LocalizedScaleToolPage locale="de" slug={slug}/>}
