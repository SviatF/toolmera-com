'use client';

import dynamic from 'next/dynamic';
import type { Tool } from '@/data/tools';

function LoadingTool(){
  return <section className="toolExperience toolExperienceLoading" aria-busy="true"><div className="experienceTop"><div><span className="eyebrow">TOOLMERA</span><div className="experienceTitle">Loading tool…</div></div></div><div className="toolUi"><div className="toolNote"><span>Preparing the interactive tool in your browser…</span></div></div></section>;
}

const WebsiteAnalysisChunk=dynamic(
  ()=>import('@/components/tool-experiences/WebsiteAnalysisExperience').then(mod=>mod.WebsiteAnalysisExperience),
  {ssr:false,loading:LoadingTool}
);

const PercentageChunk=dynamic(
  ()=>import('@/components/tool-experiences/PercentageExperience').then(mod=>mod.PercentageExperience),
  {ssr:false,loading:LoadingTool}
);

const QrCodeChunk=dynamic(
  ()=>import('@/components/tool-experiences/QrCodeExperience').then(mod=>mod.QrCodeExperience),
  {ssr:false,loading:LoadingTool}
);

const DeferredToolExperience=dynamic(
  ()=>import('@/components/ToolExperience').then(mod=>mod.ToolExperience),
  {ssr:false,loading:LoadingTool}
);

// High-opportunity tools get real isolated chunks so those pages no longer need the
// monolithic ToolExperience bundle. The remaining tools stay on the deferred fallback
// until their domain chunk is extracted in later passes.
export function LazyToolExperience({tool}:{tool:Tool}){
  if(tool.kind==='website-analysis')return <WebsiteAnalysisChunk tool={tool}/>;
  if(tool.kind==='percentage')return <PercentageChunk tool={tool}/>;
  if(tool.kind==='qr-generator')return <QrCodeChunk tool={tool}/>;
  return <DeferredToolExperience tool={tool}/>;
}
