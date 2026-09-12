'use client';

import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './AdminPageRankingCoverage.module.css';

type QueryPageRow={query:string;page:string;clicks:number;impressions:number;ctr:number;position:number};
type GscData={queryPages?:QueryPageRow[];range:string};
type CoverageRow={page:string;queries:number;top10:number;top20:number;top50:number;outside50:number;impressions:number};

const number=(value:number)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value);
const pathOnly=(value:string)=>{try{return new URL(value,'https://toolmera.com').pathname||'/'}catch{return value||'/'}};

export function AdminPageRankingCoverage(){
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [range,setRange]=useState('28d');
  const [data,setData]=useState<GscData|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const lastRange=useRef('');

  useEffect(()=>{
    const sync=()=>{
      const heading=document.querySelector('.adminTopbar h1')?.textContent?.trim();
      const intelligenceHost=document.getElementById('toolmera-query-intelligence-host');
      const select=document.querySelector('.adminTopActions select') as HTMLSelectElement|null;
      const nextRange=select?.value||'28d';
      if(nextRange!==lastRange.current){lastRange.current=nextRange;setRange(nextRange)}
      if(heading!=='Queries'||!intelligenceHost||!intelligenceHost.parentElement){
        document.getElementById('toolmera-page-ranking-coverage-host')?.remove();
        setHost(null);
        return;
      }
      let node=document.getElementById('toolmera-page-ranking-coverage-host');
      if(!node){
        node=document.createElement('div');
        node.id='toolmera-page-ranking-coverage-host';
        intelligenceHost.parentElement.insertBefore(node,intelligenceHost.nextSibling);
      }
      setHost(node);
    };
    sync();
    const observer=new MutationObserver(sync);
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    const interval=window.setInterval(sync,1000);
    return()=>{observer.disconnect();window.clearInterval(interval);document.getElementById('toolmera-page-ranking-coverage-host')?.remove()};
  },[]);

  const load=useCallback(async()=>{
    if(!host)return;
    setLoading(true);setError('');
    try{
      const response=await fetch('/api/admin/gsc?range='+encodeURIComponent(range),{cache:'no-store'});
      const payload=await response.json() as GscData|{detail?:string;message?:string};
      if(!response.ok)throw new Error('detail' in payload&&payload.detail?payload.detail:'Could not load page ranking coverage.');
      setData(payload as GscData);
    }catch(e){setError(e instanceof Error?e.message:'Could not load page ranking coverage.')}
    finally{setLoading(false)}
  },[host,range]);

  useEffect(()=>{if(host)void load()},[host,range,load]);

  const rows=useMemo<CoverageRow[]>(()=>{
    if(!data)return [];
    const grouped=new Map<string,{queries:Set<string>;top10:Set<string>;top20:Set<string>;top50:Set<string>;outside50:Set<string>;impressions:number}>();
    (data.queryPages||[]).forEach(row=>{
      if(!row.page||!row.query||row.impressions<=0)return;
      const current=grouped.get(row.page)||{queries:new Set<string>(),top10:new Set<string>(),top20:new Set<string>(),top50:new Set<string>(),outside50:new Set<string>(),impressions:0};
      current.queries.add(row.query);current.impressions+=row.impressions;
      if(row.position>0&&row.position<=10)current.top10.add(row.query);
      if(row.position>0&&row.position<=20)current.top20.add(row.query);
      if(row.position>0&&row.position<=50)current.top50.add(row.query);
      if(row.position>50)current.outside50.add(row.query);
      grouped.set(row.page,current);
    });
    return [...grouped.entries()].map(([page,value])=>({
      page,queries:value.queries.size,top10:value.top10.size,top20:value.top20.size,top50:value.top50.size,outside50:value.outside50.size,impressions:value.impressions,
    })).sort((a,b)=>(b.top10-a.top10)||(b.top20-a.top20)||(b.top50-a.top50)||(b.impressions-a.impressions)).slice(0,15);
  },[data]);

  if(!host)return null;
  return createPortal(<section className={styles.panel}>
    <div className={styles.head}><div><span>PAGE-LEVEL RANKING COVERAGE · TOP10 / TOP20 / TOP50</span><h2>How deep is each URL ranking?</h2><p>Counts distinct GSC queries per landing page so we can distinguish a page with one lucky query from a page building broader search coverage.</p></div><button onClick={()=>void load()} disabled={loading}><RefreshCw size={11}/>{loading?'Refreshing':'Refresh'}</button></div>
    {error&&<div className={styles.error}>{error}</div>}
    {!error&&rows.length?<div className={styles.table}>
      <div className={`${styles.row} ${styles.header}`}><span>Landing page</span><span>Queries</span><span>TOP 10</span><span>TOP 20</span><span>TOP 50</span><span>51+</span><span>Impressions</span></div>
      {rows.map(row=><div className={styles.row} key={row.page}>
        <a href={row.page} target="_blank" rel="noreferrer" title={row.page}>{pathOnly(row.page)}</a><b>{number(row.queries)}</b><b>{number(row.top10)}</b><b>{number(row.top20)}</b><b className={styles.top50}>{number(row.top50)}</b><b>{number(row.outside50)}</b><b>{number(row.impressions)}</b>
      </div>)}
    </div>:!error&&<div className={styles.empty}>{loading?'Building TOP50 page coverage…':'No page-level ranking coverage yet.'}</div>}
    <div className={styles.legend}><b>TOP 10 / 20 / 50</b><span>are cumulative counts of distinct queries at or above each ranking threshold in the selected GSC range.</span></div>
  </section>,host);
}
