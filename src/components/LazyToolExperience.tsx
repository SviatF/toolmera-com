'use client';

import dynamic from 'next/dynamic';
import type { Tool } from '@/data/tools';

const DeferredToolExperience=dynamic(
  ()=>import('@/components/ToolExperience').then(mod=>mod.ToolExperience),
  {
    ssr:false,
    loading:()=> <section className="toolExperience toolExperienceLoading" aria-busy="true"><div className="experienceTop"><div><span className="eyebrow">TOOLMERA</span><div className="experienceTitle">Loading tool…</div></div></div><div className="toolUi"><div className="toolNote"><span>Preparing the interactive tool in your browser…</span></div></div></section>,
  }
);

// Keeps the heavy interactive ToolExperience bundle out of the initial server-rendered
// page payload. SEO content, headings, links and explanatory sections remain static HTML.
export function LazyToolExperience({tool}:{tool:Tool}){
  return <DeferredToolExperience tool={tool}/>;
}
