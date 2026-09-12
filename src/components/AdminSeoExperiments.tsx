'use client';

import { ExternalLink, FlaskConical, Gauge } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { hasInternalLinkBoost, internalLinkBoosts } from '@/data/internalLinkBoosts';
import { seoExperiments } from '@/data/seoExperiments';
import { tools, toolUrl } from '@/data/tools';
import { semanticRelatedTools } from '@/lib/toolRelations';
import styles from './AdminSeoExperiments.module.css';

type MetricRow={clicks:number;impressions:number;ctr:number;position:number};
type PageRow=MetricRow&{page:string};
type QueryPageRow=MetricRow&{query:string;page:string};
type GscData={connected:true;range:string;pages?:PageRow[];queryPages?:QueryPageRow[];fetchedAt:string};
type Verdict='Observing'|'Winner'|'Neutral'|'Loser'|'Low data';
type Decision='DO NOW'|'WAIT'|'SCALE'|'FIX'|'DO NOT TOUCH';
type PageTrend='New'|'Growing'|'Stable'|'Declining';
type Confidence='High'|'Medium'|'Low';

type ExperimentRow={
  id:string;
  toolId:string;
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

type CannibalSignal={queries:number;highRisk:number};

type DecisionRow={
  toolId:string;
  name:string;
  path:string;
  metrics:MetricRow;
  opportunity:number;
  trend:PageTrend;
  experiment:ExperimentRow|null;
  cannibal:CannibalSignal;
  deployedLinks:number;
  linkIdeas:number;
  decision:Decision;
  confidence:Confidence;
  reason:string;
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

function expectedCtr(position:number){
  if(!position)return 0;
  if(position<=3)return .14;
  if(position<=5)return .08;
  if(position<=10)return .045;
  if(position<=20)return .018;
  if(position<=50)return .007;
  return .003;
}

function opportunityScore(row:MetricRow){
  if(row.impressions<=0)return 0;
  const demand=clamp(Math.log1p(row.impressions)/Math.log(51),0,1);
  const proximity=!row.position?.08:row.position<=3?.45:row.position<=10?.76:row.position<=20?1:row.position<=30?.88:row.position<=50?.58:row.position<=75?.32:.18;
  const expected=expectedCtr(row.position);
  const ctrHeadroom=expected?clamp((expected-row.ctr)/expected,0,1):.5;
  return Math.round(clamp(demand*proximity*(.72+.28*ctrHeadroom),0,1)*100);
}

function trendFor(current:MetricRow,previous:MetricRow):PageTrend{
  const impressions=relativeChange(current.impressions,previous.impressions);
  const positionGain=current.position&&previous.position?previous.position-current.position:0;
  if(current.impressions>=2&&previous.impressions<.5)return 'New';
  if(previous.impressions>=2&&((impressions!==null&&impressions<=-.4)||(positionGain<=-8&&current.impressions<=previous.impressions*1.2)))return 'Declining';
  if(current.impressions>=2&&((impressions!==null&&impressions>=.45)||positionGain>=5||(current.clicks>previous.clicks&&current.clicks>=1)))return 'Growing';
  return 'Stable';
}

function confidenceFor(metrics:MetricRow):Confidence{
  if(metrics.impressions>=10)return 'High';
  if(metrics.impressions>=3)return 'Medium';
  return 'Low';
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

function decisionTone(decision:Decision){
  if(decision==='SCALE')return styles.green;
  if(decision==='DO NOW')return styles.blue;
  if(decision==='FIX')return styles.red;
  if(decision==='DO NOT TOUCH')return styles.amber;
  return styles.muted;
}

function trendTone(trend:PageTrend){
  if(trend==='Growing'||trend==='New')return styles.green;
  if(trend==='Declining')return styles.red;
  return styles.muted;
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

  const latestExperimentByTool=useMemo(()=>{
    const map=new Map<string,ExperimentRow>();
    rows.forEach(row=>{
      const current=map.get(row.toolId);
      if(!current||row.changedAt>current.changedAt||(row.changedAt===current.changedAt&&row.id>current.id))map.set(row.toolId,row);
    });
    return map;
  },[rows]);

  const cannibalByPath=useMemo(()=>{
    const signals=new Map<string,CannibalSignal>();
    const groups=new Map<string,QueryPageRow[]>();
    (twentyEight?.queryPages||[]).forEach(row=>{
      if(!row.query||!row.page||row.impressions<=0)return;
      const key=row.query.toLowerCase();
      const list=groups.get(key)||[];
      list.push({...row,page:normalizePath(row.page)});
      groups.set(key,list);
    });
    groups.forEach(group=>{
      const byPage=new Map<string,QueryPageRow>();
      group.forEach(row=>{
        const current=byPage.get(row.page);
        if(!current)byPage.set(row.page,row);
        else{
          const impressions=current.impressions+row.impressions;
          byPage.set(row.page,{...row,clicks:current.clicks+row.clicks,impressions,ctr:impressions?(current.clicks+row.clicks)/impressions:0,position:impressions?((current.position*current.impressions)+(row.position*row.impressions))/impressions:0});
        }
      });
      const pages=[...byPage.values()];
      if(pages.length<2)return;
      const total=pages.reduce((sum,row)=>sum+row.impressions,0);
      const primary=Math.max(...pages.map(row=>row.impressions));
      const primaryShare=total?primary/total:1;
      const highRisk=total>=3&&(pages.length>=3||primaryShare<.65);
      pages.forEach(page=>{
        const current=signals.get(page.page)||{queries:0,highRisk:0};
        signals.set(page.page,{queries:current.queries+1,highRisk:current.highRisk+(highRisk?1:0)});
      });
    });
    return signals;
  },[twentyEight]);

  const decisions=useMemo<DecisionRow[]>(()=>{
    if(!seven||!twentyEight)return [];
    const sevenMap=new Map((seven.pages||[]).map(row=>[normalizePath(row.page),row]));
    const twentyEightMap=new Map((twentyEight.pages||[]).map(row=>[normalizePath(row.page),row]));

    return tools.map(tool=>{
      const path=normalizePath(toolUrl(tool));
      const metrics=twentyEightMap.get(path)||empty;
      const current=sevenMap.get(path)||empty;
      const previous=weeklyBaseline(current,metrics.impressions?metrics:current);
      const trend=trendFor(current,previous);
      const experiment=latestExperimentByTool.get(tool.id)||null;
      const cannibal=cannibalByPath.get(path)||{queries:0,highRisk:0};
      const deployedLinks=internalLinkBoosts.filter(link=>link.to===tool.id).length;
      const targetRelated=new Set(semanticRelatedTools(tool,tools,10).map(item=>item.id));
      const linkIdeas=tools.filter(source=>{
        if(source.id===tool.id||hasInternalLinkBoost(source.id,tool.id))return false;
        if(semanticRelatedTools(source,tools,4).some(item=>item.id===tool.id))return false;
        return targetRelated.has(source.id)||source.category===tool.category;
      }).length;
      const opportunity=opportunityScore(metrics);

      let decision:Decision='WAIT';
      let reason='No urgent signal. Keep collecting GSC data.';
      if(experiment&&experiment.finalDataDays<7){
        decision='DO NOT TOUCH';
        reason=`Active SEO experiment: only ${experiment.finalDataDays} final-data day${experiment.finalDataDays===1?'':'s'} available.`;
      }else if(cannibal.highRisk>0){
        decision='FIX';
        reason=`${cannibal.highRisk} high-risk query overlap${cannibal.highRisk===1?'':'s'} detected across multiple URLs.`;
      }else if(experiment?.verdict==='Loser'){
        decision='FIX';
        reason='Latest mature SEO experiment is losing on impressions, position or clicks.';
      }else if(trend==='Declining'){
        decision='FIX';
        reason='7-day visibility is declining against the prior weekly baseline.';
      }else if(experiment?.verdict==='Winner'){
        decision='SCALE';
        reason='Latest experiment is a winner; reinforce the cluster and internal-link support.';
      }else if(trend==='Growing'||trend==='New'){
        decision='SCALE';
        reason=trend==='New'?'New GSC visibility is appearing; expand supporting relevance carefully.':'7-day momentum is growing; strengthen the winning intent without rewriting the core page.';
      }else if(metrics.position>0&&metrics.position<=10&&metrics.impressions>=3){
        decision='SCALE';
        reason='Already in TOP 10 with repeat impressions; protect and expand the winning cluster.';
      }else if(opportunity>=35&&metrics.position>=8&&metrics.position<=30){
        decision='DO NOW';
        reason=linkIdeas>0?`Quick-win ranking window with ${linkIdeas} undeployed contextual-link source${linkIdeas===1?'':'s'}.`:'Quick-win ranking window with enough GSC demand for another focused SEO action.';
      }else if(metrics.impressions<3){
        decision='WAIT';
        reason='Too little repeat demand to justify another page rewrite yet.';
      }

      return {
        toolId:tool.id,
        name:tool.name,
        path,
        metrics,
        opportunity,
        trend,
        experiment,
        cannibal,
        deployedLinks,
        linkIdeas,
        decision,
        confidence:confidenceFor(metrics),
        reason,
      };
    }).filter(row=>row.metrics.impressions>0||row.experiment!==null||row.deployedLinks>0)
      .sort((a,b)=>{
        const weight:Record<Decision,number>={'FIX':5,'DO NOW':4,'SCALE':3,'DO NOT TOUCH':2,'WAIT':1};
        return (weight[b.decision]-weight[a.decision])||(b.opportunity-a.opportunity)||(b.metrics.impressions-a.metrics.impressions);
      });
  },[seven,twentyEight,latestExperimentByTool,cannibalByPath]);

  const summary=useMemo(()=>({
    total:rows.length,
    observing:rows.filter(row=>row.verdict==='Observing').length,
    winners:rows.filter(row=>row.verdict==='Winner').length,
    neutral:rows.filter(row=>row.verdict==='Neutral').length,
    losers:rows.filter(row=>row.verdict==='Loser').length,
    ready:rows.filter(row=>row.finalDataDays>=7).length,
  }),[rows]);

  const decisionSummary=useMemo(()=>({
    doNow:decisions.filter(row=>row.decision==='DO NOW').length,
    wait:decisions.filter(row=>row.decision==='WAIT').length,
    scale:decisions.filter(row=>row.decision==='SCALE').length,
    fix:decisions.filter(row=>row.decision==='FIX').length,
    locked:decisions.filter(row=>row.decision==='DO NOT TOUCH').length,
  }),[decisions]);

  if(!host)return null;

  return createPortal(<div className={styles.stack}>
    <section className={`${styles.panel} ${styles.decisionPanel}`}>
      <div className={styles.head}>
        <div>
          <span className={styles.kicker}>SEO DECISION ENGINE · ONE ACTION PER PAGE</span>
          <h2>What should we do with each ranking page right now?</h2>
          <p>Combines 28-day opportunity, 7-day momentum, cannibalization, experiment lock/status and internal-link coverage into one operational decision. A fresh experiment overrides everything else so we do not destroy our own test.</p>
        </div>
        <div className={styles.actions}>
          <button onClick={()=>void load()} disabled={loading}>{loading?'Refreshing…':'Refresh'}</button>
          <span><Gauge size={12}/>{decisions.length} page decisions</span>
        </div>
      </div>

      <div className={styles.summary}>
        <div><span>Do now</span><strong>{decisionSummary.doNow}</strong><small>Best immediate upside</small></div>
        <div><span>Scale</span><strong>{decisionSummary.scale}</strong><small>Winning momentum</small></div>
        <div><span>Fix</span><strong>{decisionSummary.fix}</strong><small>Decay / conflict</small></div>
        <div><span>Do not touch</span><strong>{decisionSummary.locked}</strong><small>Experiment locked</small></div>
        <div><span>Wait</span><strong>{decisionSummary.wait}</strong><small>Not enough evidence</small></div>
      </div>

      {error&&<div className={styles.error}>{error}</div>}
      {loading&&!twentyEight?<div className={styles.empty}><strong>Building page decisions…</strong><span>Combining GSC, experiment and internal-link signals.</span></div>:
      decisions.length?<div className={styles.tableWrap}><div className={styles.decisionTable}>
        <div className={`${styles.decisionRow} ${styles.tableHead}`}><span>Decision</span><span>Page</span><span>Why</span><span>28d impr.</span><span>Pos.</span><span>Trend</span><span>Experiment</span><span>Links</span></div>
        {decisions.slice(0,20).map(row=><div className={styles.decisionRow} key={row.toolId}>
          <span className={`${styles.pill} ${decisionTone(row.decision)}`}>{row.decision}</span>
          <a className={styles.page} href={row.path} target="_blank" rel="noreferrer"><strong>{row.name}</strong><small>{row.path}</small></a>
          <div className={styles.decisionReason}><strong>{row.reason}</strong><small>Opportunity {row.opportunity}/100 · {row.confidence} confidence{row.cannibal.queries?` · ${row.cannibal.queries} overlapping quer${row.cannibal.queries===1?'y':'ies'}`:''}</small></div>
          <span className={styles.metric}>{number(row.metrics.impressions)}</span>
          <span className={styles.metric}>{pos(row.metrics.position)}</span>
          <span className={`${styles.pill} ${trendTone(row.trend)}`}>{row.trend}</span>
          <span className={`${styles.pill} ${row.experiment?verdictTone(row.experiment.verdict):styles.muted}`}>{row.experiment?row.experiment.verdict:'No test'}</span>
          <div className={styles.linkSignal}><strong>{row.deployedLinks} live</strong><small>{row.linkIdeas} ideas</small><a href={row.path} target="_blank" rel="noreferrer" aria-label={`Open ${row.name}`}><ExternalLink size={11}/></a></div>
        </div>)}
      </div></div>:<div className={styles.empty}><strong>No page decisions yet</strong><span>Search Console needs at least one page signal before the decision engine can classify work.</span></div>}

      <div className={styles.legend}><b>DO NOW:</b><span>quick-win page with enough evidence and no active observation lock.</span><b>SCALE:</b><span>winner, growth or protected TOP-10 momentum.</span><b>FIX:</b><span>decay, losing experiment or high-risk cannibalization.</span><b>DO NOT TOUCH:</b><span>fresh experiment still inside the observation window.</span><b>WAIT:</b><span>insufficient evidence or upside.</span></div>
    </section>

    <section className={styles.panel}>
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
    </section>
  </div>,host);
}
