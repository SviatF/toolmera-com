'use client';

import dynamic from 'next/dynamic';
import type { Tool } from '@/data/tools';

function LoadingTool(){
  return <section className="toolExperience toolExperienceLoading" aria-busy="true"><div className="experienceTop"><div><span className="eyebrow">TOOLMERA</span><div className="experienceTitle">Loading tool…</div></div></div><div className="toolUi"><div className="toolNote"><span>Preparing the interactive tool in your browser…</span></div></div></section>;
}

const WebsiteAnalysisChunk=dynamic(()=>import('@/components/tool-experiences/WebsiteAnalysisExperience').then(mod=>mod.WebsiteAnalysisExperience),{ssr:false,loading:LoadingTool});
const PercentageChunk=dynamic(()=>import('@/components/tool-experiences/PercentageExperience').then(mod=>mod.PercentageExperience),{ssr:false,loading:LoadingTool});
const QrCodeChunk=dynamic(()=>import('@/components/tool-experiences/QrCodeExperience').then(mod=>mod.QrCodeExperience),{ssr:false,loading:LoadingTool});
const ConvertersChunk=dynamic(()=>import('@/components/tool-experiences/ConvertersExperience').then(mod=>mod.ConvertersExperience),{ssr:false,loading:LoadingTool});
const GeneratorsChunk=dynamic(()=>import('@/components/tool-experiences/GeneratorsExperience').then(mod=>mod.GeneratorsExperience),{ssr:false,loading:LoadingTool});
const TimeChunk=dynamic(()=>import('@/components/tool-experiences/TimeExperience').then(mod=>mod.TimeExperience),{ssr:false,loading:LoadingTool});
const TextChunk=dynamic(()=>import('@/components/tool-experiences/TextExperience').then(mod=>mod.TextExperience),{ssr:false,loading:LoadingTool});
const DeveloperChunk=dynamic(()=>import('@/components/tool-experiences/DeveloperExperience').then(mod=>mod.DeveloperExperience),{ssr:false,loading:LoadingTool});
const ImageChunk=dynamic(()=>import('@/components/tool-experiences/ImageExperience').then(mod=>mod.ImageExperience),{ssr:false,loading:LoadingTool});
const PdfChunk=dynamic(()=>import('@/components/tool-experiences/PdfExperience').then(mod=>mod.PdfExperience),{ssr:false,loading:LoadingTool});

const converterKinds=new Set(['unit-length','unit-temperature','unit-weight','unit-volume','unit-area','unit-speed','data-storage','color-converter','time-zone']);
const generatorKinds=new Set(['uuid-generator','password-generator','random-number-generator']);
const timeKinds=new Set(['unix-timestamp','date-calculator','time-duration']);
const textKinds=new Set(['word-counter','case-converter','character-counter','remove-duplicate-lines','sort-lines','text-diff']);
const developerKinds=new Set(['json-formatter','base64','url-encoder','slug-generator','jwt-decoder','json-to-csv','xml-formatter']);
const imageKinds=new Set(['image-convert','image-compress','image-compress-jpg','image-compress-png','image-resize','image-crop','heic-convert']);
const pdfKinds=new Set(['pdf-to-image','pdf-rotate','pdf-remove-pages','pdf-merge','pdf-split','images-to-pdf']);

const DeferredToolExperience=dynamic(()=>import('@/components/ToolExperience').then(mod=>mod.ToolExperience),{ssr:false,loading:LoadingTool});

export function LazyToolExperience({tool}:{tool:Tool}){
  if(tool.kind==='website-analysis')return <WebsiteAnalysisChunk tool={tool}/>;
  if(tool.kind==='percentage')return <PercentageChunk tool={tool}/>;
  if(tool.kind==='qr-generator')return <QrCodeChunk tool={tool}/>;
  if(converterKinds.has(tool.kind))return <ConvertersChunk tool={tool}/>;
  if(generatorKinds.has(tool.kind))return <GeneratorsChunk tool={tool}/>;
  if(timeKinds.has(tool.kind))return <TimeChunk tool={tool}/>;
  if(textKinds.has(tool.kind))return <TextChunk tool={tool}/>;
  if(developerKinds.has(tool.kind))return <DeveloperChunk tool={tool}/>;
  if(imageKinds.has(tool.kind))return <ImageChunk tool={tool}/>;
  if(pdfKinds.has(tool.kind))return <PdfChunk tool={tool}/>;
  return <DeferredToolExperience tool={tool}/>;
}
