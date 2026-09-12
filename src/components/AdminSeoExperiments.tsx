'use client';

import { ExternalLink, FlaskConical } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { seoExperiments } from '@/data/seoExperiments';
import { tools, toolUrl } from '@/data/tools';
import styles from './AdminSeoExperiments.module.css';

type MetricRow={clicks:number;impressions:number;ctr:number;position:number};
type PageRow=MetricRow&{page:string};
type GscData={connected:true;range:string;pages?:PageRow[];fetchedAt:string};
type Verdict='Observing'|'Winner'|'Neutral'|'Loser'|'Low data';

type ExperimentRow={
  id:string;
  name:string;
  path:string;
  changedAt:string;
  change:string;
  commit?:string;
  ageDays:number;
  finalDataDays:number;
  current:MetricRow;
  previous:MetricRow;
  impressionChange:number|null;
  clickChange:number|null;
  positionGain:number;
  verdict:Verdict;
  phase:'Warm-up'|'Readable'|'Mature';
};

const empty:MetricRow={clicks:0,impressions:0,ctr:0,position:0};
const number=(value:number)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value);
const pos=(value:number)=>value?value.toFixed(1):'—';
const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));

function normalizePath(value:string){
  try{
    const pathname=new URL(value,'https://toolmera.com').pathname||'/';
    return pathname==='/'?'/':pathname.replace(/\/+$/,'')+'/';
  }catch{return value}
}

function utcDay(value:string|Date){
  const date=typeof value==='string'?new Date(`${value}T00:00:00Z`):value;
  return Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate());
}

function daysSince(value:string){
  return Math.max(0,Math.floor((utcDay(new Date())-utcDay(value))/86400000));
}

function weeklyBaseline(current:MetricRow,total28:MetricRow):MetricRow{
  const priorImpressions=Math.max(0,total28.impressions-current.impressions);
  const priorClicks=Math.max(0,total28.clicks-current.clicks);
  const weightedPosition=Math.max(0,(total28.position*total28.impressions)-(current.position*current.impressions));
  return {
    clicks:priorClicks/3,
    impressions:priorImpressions/3,
    ctr:priorImpressions?priorClicks/priorImpressions:0,
    position:priorImpressions?weightedPosition/priorImpressions:0,
  };
}

function relativeChange(current:number,previous:number){
  if(previous<=0)return current>0?null:0;
  return (current-previous)/previous;
}

function experimentVerdict(current:MetricRow,previous:MetricRow,finalDataDays:number):Verdict{
  if(finalDataDays<7)return 'Observing';
  if(current.impressions+previous.impressions<2)return 'Low data';

  const impressions=relativeChange(current.impressions,previous.impressions);
  const positionGain=current.position&&previous.position?previous.position-current.position:0;
  let score=0;
  if(impressions===null&&current.impressions>=2)score+=2;
  else if(impressions!==null&&impressions>=.25)score+=2;
  else if(impressions!==null&&impressions<=-.25)score-=2;

  if(positionGain>=3)score+=2;
  else if(positionGain<=-3)score-=2;

  if(current.clicks>previous.clicks&&current.clicks>=1)score+=1;
  else if(previous.clicks>=1&&current.clicks<previous.clicks)score-=1;

  if(score>=2)return 'Winner';
  if(score<=-2)return 'Loser';
  return 'Neutral';
}

function percentLabel(value:number|null){
  if(value===null)return 'NEW';
  if(Math.abs(value)<.005)return '0%';
  return `${value>0?'+':''}${Math.round(value*100)}%`;
}

function positionLabel(value:number){
  if(Math.abs(value)<.05)return '0.0';
  return `${value>0?'+':''}${value.toFixed(1)}`;
}

function verdictTone(verdict:Verdict){
  if(verdict==='Winner')return styles.green;
  if(verdict==='Loser')return styles.red;
  if(verdict==='Neutral')return styles.blue;
  if(verdict==='Low data')return styles.muted;
  return styles.amber;
}

function deltaTone(value:number|null,positiveIsGood=true){
  if(value===null)return styles.deltaUp;
  const adjusted=positiveIsGood?value:-value;
  if(adjusted>.001)return styles.deltaUp;
  if(adjusted<-.001)return styles.deltaDown;
  return styles.deltaFlat;
}

export function AdminSeoExperiments(){
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [seven,setSeven]=useState<GscData|null>(null);
  const [twentyEight,setTwentyEight]=useState<GscData|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>{
    const sync=()=>{
      const heading=document.querySelector('.adminTopbar h1')?.textContent?.trim();
      const queryTable=document.querySelector('.queryTable');
      const querySection=queryTable?.closest('.adminPanel') as HTMLElement|null;
      if(heading!=='Queries'||!querySection){
        document.getElementById('toolmera-seo-experiments-host')?.remove();
        setHost(null);
        return;
      }
      const parent=querySection.parentElement;
      if(!parent)return;
      let portalHost=document.getElementById('toolmera-seo-experiments-host');
      if(!portalHost){
        portalHost=document.createElement('div');
        portalHost.id='toolmera-seo-experiments-host';
        parent.insertBefore(portalHost,querySection);
      }
      setHost(portalHost);
    };
    sync();
    const observer=new MutationObserver(sync);
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    const interval=window.setInterval(sync,1000);
    return()=>{
      observer.disconnect();
      window.clearInterval(interval);
      document.getElementById('toolmera-seo-experiments-host')?.remove();
    };
  },[]);

  const load=useCallback(async()=>{
    if(!host)return;
    setLoading(true);
    setError('');
    try{
      const [sevenResponse,twentyEightResponse]=await Promise.all([
        fetch('/api/admin/gsc?range=7d',{cache:'no-store'}),
        fetch('/api/admin/gsc?range=28d',{cache:'no-store'}),
      ]);
      const [sevenPayload,twentyEightPayload]=await Promise.all([sevenResponse.json(),twentyEightResponse.json()]) as [GscData|{detail?:string},GscData|{detail?:string}];
      if(!sevenResponse.ok)throw new Error('detail' in sevenPayload&&sevenPayload.detail?sevenPayload.detail:'Could not load 7-day GSC experiment data.');
      if(!twentyEightResponse.ok)throw new Error('detail' in twentyEightPayload&&twentyEightPayload.detail?twentyEightPayload.detail:'Could not load 28-day GSC experiment data.');
      setSeven(sevenPayload as GscData);
      setTwentyEight(twentyEightPayload as GscData);
    }catch(e){setError(e instanceof Error?e.message:'Could not load SEO experiment data.')}
    finally{setLoading(false)}
  },[host]);

  useEffect(()=>{if(host)void load()},[host,load]);

  const rows=useMemo<ExperimentRow[]>(()=>{
    const sevenMap=new Map((seven?.pages||[]).map(row=>[normalizePath(row.page),row]));
    const twentyEightMap=new Map((twentyEight?.pages||[]).map(row=>[normalizePath(row.page),row]));
    return seoExperiments.map(experiment=>{
      const tool=tools.find(item=>item.id===experiment.toolId);
      if(!tool)return null;
      const path=normalizePath(toolUrl(tool));
      const current=sevenMap.get(path)||empty;
      const total=twentyEightMap.get(path)||current;
      const previous=weeklyBaseline(current,total);
      const ageDays=daysSince(experiment.changedAt);
      // Search Console final data is intentionally read with a two-day lag.
      const finalDataDays=Math.max(0,ageDays-2);
      const verdict=experimentVerdict(current,previous,finalDataDays);
      const phase=finalDataDays<7?'Warm-up':finalDataDays<14?'Readable':'Mature';
      return {
        ...experiment,
        name:tool.name,
        path,
        ageDays,
        finalDataDays,
        current,
        previous,
        impressionChange:relativeChange(current.impressions,previous.impressions),
        clickChange:relativeChange(current.clicks,previous.clicks),
        positionGain:current.position&&previous.position?previous.position-current.position:0,
        verdict,
        phase,
      };
    }).filter((row):row is ExperimentRow=>row!==null)
      .sort((a,b)=>{
        const weight:Record<Verdict,number>={Loser:5,Observing:4,Winner:3,Neutral:2,'Low data':1};
        return (weight[b.verdict]-weight[a.verdict])||(b.changedAt.localeCompare(a.changedAt));
      });
  },[seven,twentyEight]);

  const summary=useMemo(()=>({
    total:rows.length,
    observing:rows.filter(row=>row.verdict==='Observing').length,
    winners:rows.filter(row=>row.verdict==='Winner').length,
    neutral:rows.filter(row=>row.verdict==='Neutral').length,
    losers:rows.filter(row=>row.verdict==='Loser').length,
    ready:rows.filter(row=>row.finalDataDays>=7).length,
  }),[rows]);

  if(!host)return null;

  return createPortal(<section className={styles.panel}>
    <div className={styles.head}>
      <div>
        <span className={styles.kicker}>SEO EXPERIMENT TRACKER · CHANGE → OBSERVE → DECIDE</span>
        <h2>Stop rewriting pages before Google has time to react</h2>
        <p>Each material SEO edit starts an observation window. Verdicts stay locked until at least seven days of final GSC data exist, then compare the latest 7 days with the weekly average of the preceding 21 days.</p>
      </div>
      <div className={styles.actions}>
        <button onClick={()=>void load()} disabled={loading}>{loading?'Refreshing…':'Refresh'}</button>
        <span><FlaskConical size={12}/>{summary.total} experiments</span>
      </div>
    </div>

    <div className={styles.summary}>
      <div><span>Observing</span><strong>{summary.observing}</strong><small>Verdict locked</small></div>
      <div><span>Data ready</span><strong>{summary.ready}</strong><small>7+ final GSC days</small></div>
      <div><span>Winners</span><strong>{summary.winners}</strong><small>Positive evidence</small></div>
      <div><span>Neutral</span><strong>{summary.neutral}</strong><small>No decisive move</small></div>
      <div><span>Losers</span><strong>{summary.losers}</strong><small>Needs review</small></div>
    </div>

    {error&&<div className={styles.error}>{error}</div>}
    {loading&&!seven?<div className={styles.empty}><strong>Building experiment reads…</strong><span>Loading 7-day and 28-day Search Console page data.</span></div>:
    rows.length?<div className={styles.tableWrap}><div className={styles.table}>
      <div className={`${styles.row} ${styles.tableHead}`}><span>Verdict</span><span>Experiment / page</span><span>Window</span><span>7d impr.</span><span>Impr. Δ</span><span>7d pos.</span><span>Pos. Δ</span><span>7d clicks</span><span>Change</span></div>
      {rows.map(row=>{
        const progress=Math.round(clamp(row.finalDataDays/14,0,1)*100);
        return <div className={styles.row} key={row.id}>
          <span className={`${styles.pill} ${verdictTone(row.verdict)}`}>{row.verdict}</span>
          <a className={styles.page} href={row.path} target="_blank" rel="noreferrer"><strong>{row.name}</strong><small>{row.path}</small></a>
          <div className={styles.window}><div><i style={{width:`${progress}%`}}/></div><strong>{row.phase}</strong><small>{row.finalDataDays} final-data day{row.finalDataDays===1?'':'s'} · changed {row.changedAt}</small></div>
          <span className={styles.metric}>{number(row.current.impressions)}</span>
          <span className={`${styles.delta} ${deltaTone(row.impressionChange)}`}>{percentLabel(row.impressionChange)}</span>
          <span className={styles.metric}>{pos(row.current.position)}</span>
          <span className={`${styles.delta} ${deltaTone(row.positionGain)}`}>{positionLabel(row.positionGain)}</span>
          <span className={styles.metric}>{number(row.current.clicks)}</span>
          <div className={styles.change}><span>{row.change}</span>{row.commit&&<small>{row.commit}</small>}</div>
        </div>;
      })}
    </div></div>:<div className={styles.empty}><strong>No experiments registered</strong><span>Add material SEO changes to the central experiment registry before re-optimizing the page again.</span></div>}

    <div className={styles.legend}><b>Observation lock:</b><span>no Winner/Neutral/Loser before 7 final-data days.</span><b>Winner:</b><span>meaningful gain in impressions, rankings or clicks.</span><b>Loser:</b><span>meaningful deterioration that deserves inspection, not an automatic rollback.</span><b>14 days:</b><span>the preferred mature observation horizon.</span></div>
  </section>,host);
}
