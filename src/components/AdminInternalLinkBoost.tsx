'use client';

import { ExternalLink, Link2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { tools, type Tool } from '@/data/tools';
import { semanticRelatedTools } from '@/lib/toolRelations';
import styles from './AdminInternalLinkBoost.module.css';

type MetricRow={clicks:number;impressions:number;ctr:number;position:number};
type PageRow=MetricRow&{page:string};
type QueryPageRow=MetricRow&{query:string;page:string};
type GscData={
  connected:true;
  range:string;
  pages?:PageRow[];
  queryPages:QueryPageRow[];
  fetchedAt:string;
};

type LinkSource={
  tool:Tool;
  path:string;
  metrics:MetricRow;
  relation:'Semantic pair'|'Same cluster';
  score:number;
};

type LinkOpportunity={
  target:Tool;
  targetPath:string;
  metrics:MetricRow;
  topQuery:string;
  boostScore:number;
  sources:LinkSource[];
};

const emptyMetric:MetricRow={clicks:0,impressions:0,ctr:0,position:0};
const number=(value:number)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value);
const pos=(value:number)=>value?value.toFixed(1):'—';
const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));

function normalizePath(value:string){
  try{
    const pathname=new URL(value,'https://toolmera.com').pathname||'/';
    return pathname==='/'?'/':pathname.replace(/\/+$/,'')+'/';
  }catch{
    const pathname=value.split('?')[0].split('#')[0]||'/';
    return pathname==='/'?'/':('/'+pathname.replace(/^\/+|\/+$/g,'')+'/').replace(/\/+/g,'/');
  }
}

function toolPath(tool:Tool){
  return normalizePath(`${tool.country?`/${tool.country}`:''}/${tool.category}/${tool.slug}/`);
}

function targetBoostScore(metrics:MetricRow){
  if(metrics.position<8||metrics.position>30||metrics.impressions<=0)return 0;
  const demand=clamp(Math.log1p(metrics.impressions)/Math.log(31),0,1);
  const proximity=metrics.position<=12?1:metrics.position<=20?.82:.58;
  const topTenEdge=metrics.position<=10?.12:0;
  return Math.round(clamp((demand*.58)+(proximity*.42)+topTenEdge,0,1)*100);
}

function sourceAuthority(metrics:MetricRow){
  const demand=clamp(Math.log1p(metrics.impressions)/Math.log(31),0,1);
  const position=metrics.position>0&&metrics.position<=10?1:metrics.position<=20?.72:metrics.position<=50?.4:.15;
  return demand*.72+position*.28;
}

export function AdminInternalLinkBoost(){
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [range,setRange]=useState('28d');
  const [data,setData]=useState<GscData|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const lastRange=useRef('');

  useEffect(()=>{
    const sync=()=>{
      const heading=document.querySelector('.adminTopbar h1')?.textContent?.trim();
      const queryTable=document.querySelector('.queryTable');
      const querySection=queryTable?.closest('.adminPanel') as HTMLElement|null;
      const rangeSelect=document.querySelector('.adminTopActions select') as HTMLSelectElement|null;
      const nextRange=rangeSelect?.value||'28d';
      if(nextRange!==lastRange.current){lastRange.current=nextRange;setRange(nextRange)}

      if(heading!=='Queries'||!querySection){
        document.getElementById('toolmera-internal-link-boost-host')?.remove();
        setHost(null);
        return;
      }

      const parent=querySection.parentElement;
      if(!parent)return;
      let portalHost=document.getElementById('toolmera-internal-link-boost-host');
      if(!portalHost){
        portalHost=document.createElement('div');
        portalHost.id='toolmera-internal-link-boost-host';
        parent.insertBefore(portalHost,querySection);
      }
      setHost(portalHost);
    };

    sync();
    const observer=new MutationObserver(sync);
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    const interval=window.setInterval(sync,900);
    return()=>{
      observer.disconnect();
      window.clearInterval(interval);
      document.getElementById('toolmera-internal-link-boost-host')?.remove();
    };
  },[]);

  const load=useCallback(async()=>{
    if(!host)return;
    setLoading(true);
    setError('');
    try{
      const response=await fetch('/api/admin/gsc?range='+encodeURIComponent(range),{cache:'no-store'});
      const payload=await response.json() as GscData|{detail?:string;message?:string};
      if(!response.ok)throw new Error('detail' in payload&&payload.detail?payload.detail:'Could not load internal-link GSC data.');
      setData(payload as GscData);
    }catch(e){
      setError(e instanceof Error?e.message:'Could not load internal-link GSC data.');
    }finally{setLoading(false)}
  },[host,range]);

  useEffect(()=>{if(host)void load()},[host,range,load]);

  const opportunities=useMemo<LinkOpportunity[]>(()=>{
    if(!data)return [];
    const metricByPath=new Map<string,MetricRow>();
    (data.pages||[]).forEach(row=>metricByPath.set(normalizePath(row.page),row));

    const topQueryByPath=new Map<string,QueryPageRow>();
    data.queryPages.forEach(row=>{
      const path=normalizePath(row.page);
      const current=topQueryByPath.get(path);
      if(!current||row.impressions>current.impressions||(row.impressions===current.impressions&&row.position<current.position))topQueryByPath.set(path,row);
    });

    return tools.map(target=>{
      const targetPath=toolPath(target);
      const metrics=metricByPath.get(targetPath)||emptyMetric;
      const boostScore=targetBoostScore(metrics);
      if(!boostScore)return null;

      const targetRelated=new Set(semanticRelatedTools(target,tools,10).map(tool=>tool.id));
      const sources=tools
        .filter(source=>source.id!==target.id)
        .map(source=>{
          const sourcePath=toolPath(source);
          const existingOutgoing=semanticRelatedTools(source,tools,4).some(item=>item.id===target.id);
          if(existingOutgoing)return null;
          const semanticPair=targetRelated.has(source.id);
          const sameCluster=source.category===target.category;
          if(!semanticPair&&!sameCluster)return null;
          const sourceMetrics=metricByPath.get(sourcePath)||emptyMetric;
          const relationScore=semanticPair?1:.58;
          const score=(relationScore*.72)+(sourceAuthority(sourceMetrics)*.28);
          return {
            tool:source,
            path:sourcePath,
            metrics:sourceMetrics,
            relation:semanticPair?'Semantic pair' as const:'Same cluster' as const,
            score,
          };
        })
        .filter((row):row is LinkSource=>row!==null)
        .sort((a,b)=>(b.score-a.score)||(b.metrics.impressions-a.metrics.impressions))
        .slice(0,3);

      if(!sources.length)return null;
      return {
        target,
        targetPath,
        metrics,
        topQuery:topQueryByPath.get(targetPath)?.query||target.name,
        boostScore,
        sources,
      };
    })
    .filter((row):row is LinkOpportunity=>row!==null)
    .sort((a,b)=>(b.boostScore-a.boostScore)||(b.metrics.impressions-a.metrics.impressions))
    .slice(0,10);
  },[data]);

  const sourceCount=useMemo(()=>opportunities.reduce((sum,row)=>sum+row.sources.length,0),[opportunities]);

  if(!host)return null;

  return createPortal(<section className={styles.panel}>
    <div className={styles.head}>
      <div>
        <span className={styles.kicker}>INTERNAL LINK BOOST ENGINE · GSC × SEMANTIC GRAPH</span>
        <h2>Quick-win pages that need stronger internal links</h2>
        <p>Targets are ranking roughly positions 8–30. Source pages are selected from Toolmera’s semantic graph and category clusters, while links that already exist in the Related Tools graph are excluded.</p>
      </div>
      <div className={styles.headActions}>
        <button onClick={()=>void load()} disabled={loading}>{loading?'Refreshing…':'Refresh'}</button>
        <span>{sourceCount} link ideas</span>
      </div>
    </div>

    {error&&<div className={styles.error}>{error}</div>}
    {loading&&!data?<div className={styles.empty}><strong>Building internal-link recommendations…</strong><span>Matching GSC quick wins to semantic source pages.</span></div>:
    opportunities.length?<div className={styles.grid}>{opportunities.map(row=><article className={styles.card} key={row.target.id}>
      <div className={styles.targetTop}>
        <div className={styles.score}><strong>{row.boostScore}</strong><small>BOOST</small></div>
        <a href={row.targetPath} target="_blank" rel="noreferrer" className={styles.target}>
          <span>{row.target.name}</span>
          <small>{row.targetPath}</small>
        </a>
        <ExternalLink size={13}/>
      </div>
      <div className={styles.metrics}>
        <span><small>Impr.</small><b>{number(row.metrics.impressions)}</b></span>
        <span><small>Position</small><b>{pos(row.metrics.position)}</b></span>
        <span className={styles.anchor}><small>Anchor direction</small><b>“{row.topQuery}”</b></span>
      </div>
      <div className={styles.sourceLabel}><Link2 size={12}/><span>Add contextual links from</span></div>
      <div className={styles.sources}>{row.sources.map(source=><a href={source.path} target="_blank" rel="noreferrer" className={styles.source} key={source.tool.id}>
        <div><strong>{source.tool.name}</strong><small>{source.path}</small></div>
        <span className={source.relation==='Semantic pair'?styles.semantic:styles.cluster}>{source.relation}</span>
        <em>{source.metrics.impressions?`${number(source.metrics.impressions)} impr.`:'no GSC signal'}</em>
      </a>)}</div>
    </article>)}</div>:<div className={styles.empty}><strong>No internal-link quick wins in this range</strong><span>No tool pages currently match the 8–30 position window with a missing semantic source-link opportunity.</span></div>}

    <div className={styles.legend}><b>BOOST:</b><span>target priority based on impressions and proximity to TOP 10.</span><b>Semantic pair:</b><span>closely related tool missing a reciprocal Related Tools link.</span><b>Same cluster:</b><span>same-category contextual opportunity; add only where the copy is genuinely relevant.</span></div>
  </section>,host);
}
