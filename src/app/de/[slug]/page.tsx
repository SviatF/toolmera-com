import { notFound } from 'next/navigation';
import { LocalizedPilotToolPage, localizedToolMetadata } from '@/components/LocalizedPilotPage';
import { localizedPilotTools } from '@/data/localizedToolPilot';

export function generateStaticParams(){return localizedPilotTools.de.map(item=>({slug:item.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return localizedToolMetadata('de',slug)}
export default async function GermanTool({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!localizedPilotTools.de.some(item=>item.slug===slug))notFound();return <LocalizedPilotToolPage locale="de" slug={slug}/>}
