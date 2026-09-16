import { notFound } from 'next/navigation';
import { LocalizedPilotToolPage, localizedToolMetadata } from '@/components/LocalizedPilotPage';
import { localizedPilotTools } from '@/data/localizedToolPilot';

export function generateStaticParams(){return localizedPilotTools.ru.map(item=>({slug:item.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return localizedToolMetadata('ru',slug)}
export default async function RussianTool({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!localizedPilotTools.ru.some(item=>item.slug===slug))notFound();return <LocalizedPilotToolPage locale="ru" slug={slug}/>}
