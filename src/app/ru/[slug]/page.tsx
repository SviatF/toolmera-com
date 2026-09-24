import { notFound } from 'next/navigation';
import { LocalizedScaleToolPage, localizedScaleToolMetadata } from '@/components/LocalizedScalePage';
import { localizedPilotTools } from '@/data/localizedToolRegistry';

export function generateStaticParams(){return localizedPilotTools.ru.map(item=>({slug:item.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return localizedScaleToolMetadata('ru',slug)}
export default async function RussianTool({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!localizedPilotTools.ru.some(item=>item.slug===slug))notFound();return <LocalizedScaleToolPage locale="ru" slug={slug}/>}
