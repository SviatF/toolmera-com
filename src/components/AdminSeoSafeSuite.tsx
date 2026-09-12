'use client';

import { AlertTriangle, ArrowUpRight, CheckCircle2, Link2, RefreshCw, ShieldCheck, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { hasInternalLinkBoost, internalLinkBoosts } from '@/data/internalLinkBoosts';
import { seoExperiments } from '@/data/seoExperiments';
import { tools, toolUrl, type Tool } from '@/data/tools';
import { fetchAdminGsc } from '@/lib/adminApiClient';
import { semanticRelatedTools } from '@/lib/toolRelations';
import styles from './AdminSeoSafeSuite.module.css';

type Metric={clicks:number;impressions:number;ctr:number;position:number};
type PageRow=Metric&{page:string};
type QueryPageRow=Metric&{query:string;page:string};
type GscData={connected:true;range:string;pages?:PageRow[];queryPages?:QueryPageRow[];fetchedAt:string};
type Trend='New'|'Growing'|'Stable'|'Declining';
type Decision='DO NOW'|'SCALE'|'FIX'|'WAIT'|'DO NOT TOUCH';

type ExperimentState={
  id:string;
  changedAt:string;
  change:string;
  finalDays:number;
  daysLeft:number;
  phase:'Warm-up'|'Readable'|'Mature';
};

type PageSignal={
  tool:Tool;
  path:string;
  metrics:Metric;
  current:Metric;
  previous:Metric;
  trend:Trend;
  opportunity:number;
  topQuery:string;
  highCannibal:number;
  deployedLinks:number;
  linkIdeas:number;
  experiment:ExperimentState|null;
  decision:Decision;
  reason:string;
  nextMove:string;
};

type CannibalRow={query:string;pages:number;impressions:number;primaryShare:number;risk:'High'|'Medium'};

const empty:Metric={clicks:0,impressions:0,ctr:0,position:0};
const number=(value:number)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value);
const pct=(value:number)=>`${(value*100).toFixed(2)}%`;
const pos=(value:number)=>value?value.toFixed(1):'—';
const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));

function normalizePath(value:string){
  try{
    const pathname=new URL(value,'https://toolmera.com').pathname||'/';
    return pathname==='/'?'/':pathname.replace(/\/+$/,'')+'/';
  }catch{return value}
}

function weeklyBaseline(current:Metric,total28:Metric):Metric{
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

function trendFor(current:Metric,previous:Metric):Trend{
  const impressions=relativeChange(current.impressions,previous.impressions);
  const positionGain=current.position&&previous.position?previous.position-current.position:0;
  if(current.impressions>=2&&previous.impressions<.5)return 'New';
  if(previous.impressions>=2&&((impressions!==null&&impressions<=-.4)||(positionGain<=-8&&current.impressions<=previous.impressions*1.2)))return 'Declining';
  if(current.impressions>=2&&((impressions!==null&&impressions>=.45)||positionGain>=5||(current.clicks>previous.clicks&&current.clicks>=1)))return 'Growing';
  return 'Stable';
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

function opportunityScore(row:Metric){
  if(row.impressions<=0)return 0;
  const demand=clamp(Math.log1p(row.impressions)/Math.log(51),0,1);
  let proximity=.18;
  if(!row.position)proximity=.08;
  else if(row.position<=3)proximity=.45;
  else if(row.position<=10)proximity=.76;
  else if(row.position<=20)proximity=1;
  else if(row.position<=30)proximity=.88;
  else if(row.position<=50)proximity=.58;
  else if(row.position<=75)proximity=.32;
  const expected=expectedCtr(row.position);
  const ctrHeadroom=expected?clamp((expected-row.ctr)/expected,0,1):.5;
  return Math.round(clamp(demand*proximity*(.72+.28*ctrHeadroom),0,1)*100);
}

function utcDay(value:string|Date){
  const date=typeof value==='string'?new Date(`${value}T00:00:00Z`):value;
  return Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate());
}

function daysSince(value:string){return Math.max(0,Math.floor((utcDay(new Date())-utcDay(value))/86400000))}

function toneFor(decision:Decision){
  if(decision==='FIX')return styles.red;
  if(decision==='DO NOW')return styles.blue;
  if(decision==='SCALE')return styles.green;
  if(decision==='DO NOT TOUCH')return styles.amber;
  return styles.muted;
}

function trendTone(trend:Trend){
  if(trend==='Growing'||trend==='New')return styles.green;
  if(trend==='Declining')return styles.red;
  return styles.muted;
}

function observeQueriesView(setActive:(value:boolean)=>void){
  const read=()=>setActive(document.querySelector('.adminTopbar h1')?.textContent?.trim()==='Queries');
  read();
  const heading=document.querySelector('.adminTopbar h1');
  if(!heading)return()=>{};
  const observer=new MutationObserver(read);
  observer.observe(heading,{subtree:true,childList:true,characterData:true});
  return()=>observer.disconnect();
}

export function AdminSeoSafeSuite(){
  const [active,setActive]=useState(false);
  const [seven,setSeven]=useState<GscData|null>(null);
  const [twentyEight,setTwentyEight]=useState<GscData|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [loadedAt,setLoadedAt]=useState('');

  useEffect(()=>observeQueriesView(setActive),[]);

  const load=useCallback(async(force=false)=>{
    setLoading(true);
    setError('');
    try{
      const [sevenData,twentyEightData]=await Promise.all([
        fetchAdminGsc<GscData>('7d',force),
        fetchAdminGsc<GscData>('28d',force),
      ]);
      setSeven(sevenData);
      setTwentyEight(twentyEightData);
      setLoadedAt(new Date().toISOString());
    }catch(e){setError(e instanceof Error?e.message:'Could not load safe SEO intelligence.')}
    finally{setLoading(false)}
  },[]);

  useEffect(()=>{if(active&&!seven&&!twentyEight)void load(false)},[active,seven,twentyEight,load]);

  const cannibalRows=useMemo<CannibalRow[]>(()=>{
    const groups=new Map<string,QueryPageRow[]>();
    (twentyEight?.queryPages||[]).forEach(row=>{
      if(!row.query||!row.page||row.impressions<=0)return;
      const key=row.query.toLowerCase();
      const list=groups.get(key)||[];
      list.push({...row,page:normalizePath(row.page)});
      groups.set(key,list);
    });
    const rows:CannibalRow[]=[];
    groups.forEach(group=>{
      const byPage=new Map<string,number>();
      group.forEach(row=>byPage.set(row.page,(byPage.get(row.page)||0)+row.impressions));
      if(byPage.size<2)return;
      const values=[...byPage.values()];
      const impressions=values.reduce((sum,value)=>sum+value,0);
      const primary=Math.max(...values);
      const primaryShare=impressions?primary/impressions:1;
      const risk: CannibalRow['risk']=impressions>=3&&(byPage.size>=3||primaryShare<.65)?'High':'Medium';
      rows.push({query:group[0]?.query||'',pages:byPage.size,impressions,primaryShare,risk});
    });
    return rows.sort((a,b)=>(a.risk===b.risk?b.impressions-a.impressions:a.risk==='High'?-1:1)).slice(0,12);
  },[twentyEight]);

  const highCannibalByPath=useMemo(()=>{
    const map=new Map<string,number>();
    const groups=new Map<string,QueryPageRow[]>();
    (twentyEight?.queryPages||[]).forEach(row=>{
      const key=row.query?.toLowerCase();
      if(!key||!row.page||row.impressions<=0)return;
      const list=groups.get(key)||[];
      list.push({...row,page:normalizePath(row.page)});
      groups.set(key,list);
    });
    groups.forEach(group=>{
      const byPage=new Map<string,number>();
      group.forEach(row=>byPage.set(row.page,(byPage.get(row.page)||0)+row.impressions));
      if(byPage.size<2)return;
      const values=[...byPage.values()];
      const total=values.reduce((sum,value)=>sum+value,0);
      const primary=Math.max(...values);
      const high=total>=3&&(byPage.size>=3||(total?primary/total:1)<.65);
      if(high)for(const path of byPage.keys())map.set(path,(map.get(path)||0)+1);
    });
    return map;
  },[twentyEight]);

  const latestExperimentByTool=useMemo(()=>{
    const map=new Map<string,(typeof seoExperiments)[number]>();
    seoExperiments.forEach(item=>{
      const current=map.get(item.toolId);
      if(!current||item.changedAt>current.changedAt||(item.changedAt===current.changedAt&&item.id>current.id))map.set(item.toolId,item);
    });
    return map;
  },[]);

  const signals=useMemo<PageSignal[]>(()=>{
    if(!seven||!twentyEight)return [];
    const sevenMap=new Map((seven.pages||[]).map(row=>[normalizePath(row.page),row]));
    const twentyEightMap=new Map((twentyEight.pages||[]).map(row=>[normalizePath(row.page),row]));
    const queriesByPath=new Map<string,QueryPageRow[]>();
    (twentyEight.queryPages||[]).forEach(row=>{
      const path=normalizePath(row.page);
      const list=queriesByPath.get(path)||[];
      list.push(row);
      queriesByPath.set(path,list);
    });

    return tools.map(tool=>{
      const path=normalizePath(toolUrl(tool));
      const metrics=twentyEightMap.get(path)||empty;
      const current=sevenMap.get(path)||empty;
      const previous=weeklyBaseline(current,metrics.impressions?metrics:current);
      const trend=trendFor(current,previous);
      const opportunity=opportunityScore(metrics);
      const topQuery=[...(queriesByPath.get(path)||[])].sort((a,b)=>(b.impressions-a.impressions)||(a.position-b.position))[0]?.query||tool.name;
      const latest=latestExperimentByTool.get(tool.id);
      let experiment:ExperimentState|null=null;
      if(latest){
        const finalDays=Math.max(0,daysSince(latest.changedAt)-2);
        experiment={
          id:latest.id,changedAt:latest.changedAt,change:latest.change,finalDays,
          daysLeft:Math.max(0,7-finalDays),
          phase:finalDays<7?'Warm-up':finalDays<14?'Readable':'Mature',
        };
      }

      const targetRelated=new Set(semanticRelatedTools(tool,tools,10).map(item=>item.id));
      const linkIdeas=tools.filter(source=>{
        if(source.id===tool.id||hasInternalLinkBoost(source.id,tool.id))return false;
        if(semanticRelatedTools(source,tools,4).some(item=>item.id===tool.id))return false;
        return targetRelated.has(source.id)||source.category===tool.category;
      }).length;
      const deployedLinks=internalLinkBoosts.filter(link=>link.to===tool.id).length;
      const highCannibal=highCannibalByPath.get(path)||0;

      let decision:Decision='WAIT';
      let reason='Not enough evidence to justify another change.';
      let nextMove='Keep collecting repeat GSC signal.';
      if(experiment&&experiment.daysLeft>0){
        decision='DO NOT TOUCH';
        reason=`SEO experiment is still inside its observation lock (${experiment.daysLeft} final-data day${experiment.daysLeft===1?'':'s'} left).`;
        nextMove='Leave title, H1, URL and core copy stable.';
      }else if(highCannibal>0){
        decision='FIX';
        reason=`${highCannibal} high-risk overlapping quer${highCannibal===1?'y':'ies'} detected for this page.`;
        nextMove='Choose a primary intent and strengthen internal signals to the correct URL.';
      }else if(trend==='Declining'){
        decision='FIX';
        reason='7-day visibility is declining versus the preceding weekly baseline.';
        nextMove='Audit indexing, intent match, recent SEO changes and internal links before rewriting broadly.';
      }else if(trend==='Growing'||trend==='New'||(metrics.position>0&&metrics.position<=10&&metrics.impressions>=3)){
        decision='SCALE';
        reason=trend==='Growing'||trend==='New'?`${trend} search momentum detected.`:'The page already holds repeat TOP10 visibility.';
        nextMove='Expand supporting cluster/internal links without changing the winning core intent.';
      }else if(metrics.position>=8&&metrics.position<=30&&metrics.impressions>=3&&opportunity>=25){
        decision='DO NOW';
        reason=`Position ${pos(metrics.position)} with ${number(metrics.impressions)} impressions and opportunity ${opportunity}/100.`;
        nextMove=linkIdeas>0?`Add up to ${Math.min(3,linkIdeas)} contextual internal links first.`:'Improve query coverage or SERP snippet with one controlled change.';
      }

      return {tool,path,metrics,current,previous,trend,opportunity,topQuery,highCannibal,deployedLinks,linkIdeas,experiment,decision,reason,nextMove};
    }).filter(row=>row.metrics.impressions>0||row.experiment!==null)
      .sort((a,b)=>{
        const weight:Record<Decision,number>={'FIX':5,'DO NOW':4,'SCALE':3,'DO NOT TOUCH':2,'WAIT':1};
        return (weight[b.decision]-weight[a.decision])||(b.opportunity-a.opportunity)||(b.metrics.impressions-a.metrics.impressions);
      });
  },[seven,twentyEight,highCannibalByPath,latestExperimentByTool]);

  const counts=useMemo(()=>signals.reduce((acc,row)=>{acc[row.decision]=(acc[row.decision]||0)+1;return acc},{'DO NOW':0,SCALE:0,FIX:0,WAIT:0,'DO NOT TOUCH':0} as Record<Decision,number>),[signals]);
  const topActions=signals.filter(row=>row.decision!=='WAIT').slice(0,14);
  const experimentRows=signals.filter(row=>row.experiment).sort((a,b)=>(a.experiment?.daysLeft||0)-(b.experiment?.daysLeft||0)).slice(0,12);

  if(!active)return null;

  return <section className={styles.shell}>
    <div className={styles.head}>
      <div>
        <span>SAFE SEO INTELLIGENCE · SHARED DATA LAYER</span>
        <h2>One data load. All SEO decisions.</h2>
        <p>Only two shared GSC reads are used here: 7d and 28d. No DOM polling loops, no portal remounts and no per-widget API fetches.</p>
      </div>
      <button onClick={()=>void load(true)} disabled={loading}><RefreshCw size={14} className={loading?styles.spin:''}/> {loading?'Loading…':'Refresh data'}</button>
    </div>

    {error&&<div className={styles.error}><AlertTriangle size={16}/>{error}</div>}

    <div className={styles.summary}>
      <div><strong>{counts['DO NOW']}</strong><span>DO NOW</span></div>
      <div><strong>{counts.SCALE}</strong><span>SCALE</span></div>
      <div><strong>{counts.FIX}</strong><span>FIX</span></div>
      <div><strong>{counts['DO NOT TOUCH']}</strong><span>LOCKED</span></div>
      <div><strong>{cannibalRows.filter(row=>row.risk==='High').length}</strong><span>HIGH CANNIBAL</span></div>
      <div><strong>{loadedAt?new Date(loadedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):'—'}</strong><span>CLIENT LOAD</span></div>
    </div>

    <div className={styles.panel}>
      <div className={styles.panelHead}><div><span>SEO ACTION CENTER</span><h3>Priority queue</h3></div><ShieldCheck size={18}/></div>
      {topActions.length?<div className={styles.table}>
        <div className={styles.tableHead}><span>Decision</span><span>Page</span><span>Signal</span><span>Impr.</span><span>Pos.</span><span>Trend</span><span>Links</span><span>Next move</span></div>
        {topActions.map(row=><div className={styles.row} key={row.tool.id}>
          <span><b className={`${styles.badge} ${toneFor(row.decision)}`}>{row.decision}</b></span>
          <span><strong>{row.path}</strong><small>{row.topQuery}</small></span>
          <span className={styles.reason}>{row.reason}</span>
          <span>{number(row.metrics.impressions)}</span>
          <span>{pos(row.metrics.position)}</span>
          <span><b className={`${styles.badge} ${trendTone(row.trend)}`}>{row.trend}</b></span>
          <span>{row.deployedLinks} live · {row.linkIdeas} ideas</span>
          <span className={styles.next}>{row.nextMove}</span>
        </div>)}
      </div>:<div className={styles.empty}>No actionable GSC signal yet.</div>}
    </div>

    <div className={styles.grid}>
      <div className={styles.panel}>
        <div className={styles.panelHead}><div><span>CANNIBALIZATION</span><h3>Queries with 2+ ranking URLs</h3></div><AlertTriangle size={18}/></div>
        {cannibalRows.length?<div className={styles.compact}>{cannibalRows.map(row=><div key={row.query}><span><strong>{row.query}</strong><small>{row.pages} pages · {number(row.impressions)} impressions</small></span><b className={`${styles.badge} ${row.risk==='High'?styles.red:styles.amber}`}>{row.risk}</b><span>{Math.round(row.primaryShare*100)}% primary share</span></div>)}</div>:<div className={styles.empty}>No multi-page query conflicts in current GSC data.</div>}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}><div><span>EXPERIMENT LOCKS</span><h3>Re-optimization protection</h3></div><CheckCircle2 size={18}/></div>
        {experimentRows.length?<div className={styles.compact}>{experimentRows.map(row=><div key={row.tool.id}><span><strong>{row.path}</strong><small>{row.experiment?.changedAt} · {row.experiment?.phase}</small></span><b className={`${styles.badge} ${(row.experiment?.daysLeft||0)>0?styles.amber:styles.green}`}>{(row.experiment?.daysLeft||0)>0?`${row.experiment?.daysLeft}d lock`:'Readable'}</b><span>{row.experiment?.change}</span></div>)}</div>:<div className={styles.empty}>No tracked experiments.</div>}
      </div>
    </div>

    <div className={styles.footer}><Link2 size={15}/> Internal-link recommendations are computed locally from the semantic graph and deployed-link registry. <TrendingUp size={15}/> Trend math is computed locally from the same shared 7d/28d payloads. <ArrowUpRight size={15}/> Deployment automation remains disabled.</div>
  </section>;
}
