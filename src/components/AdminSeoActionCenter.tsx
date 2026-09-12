'use client';

import { ExternalLink, ListChecks } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { hasInternalLinkBoost } from '@/data/internalLinkBoosts';
import { seoExperiments } from '@/data/seoExperiments';
import { tools, toolUrl, type Tool } from '@/data/tools';
import { semanticRelatedTools } from '@/lib/toolRelations';
import styles from './AdminSeoActionCenter.module.css';

type MetricRow={clicks:number;impressions:number;ctr:number;position:number};
type PageRow=MetricRow&{page:string};
type QueryPageRow=MetricRow&{query:string;page:string};
type GscData={connected:true;range:string;pages?:PageRow[];queryPages?:QueryPageRow[];fetchedAt:string};
type Priority='P0'|'P1'|'P2'|'HOLD';
type ActionType='Cannibalization'|'Decay audit'|'Internal links'|'CTR'|'Content gap'|'Scale winner'|'Observation';
type Trend='New'|'Growing'|'Stable'|'Declining';

type PageSignal={
  tool:Tool;
  path:string;
  metrics:MetricRow;
  current:MetricRow;
  previous:MetricRow;
  trend:Trend;
  opportunity:number;
  topQuery:string;
  expectedCtr:number;
  linkIdeas:number;
  cannibalQueries:string[];
  experimentDaysLeft:number|null;
  experimentLoser:boolean;
  experimentWinner:boolean;
};

type ActionItem={
  id:string;
  priority:Priority;
  type:ActionType;
  title:string;
  detail:string;
  signal:string;
  score:number;
  tool:Tool;
  path:string;
  query:string;
  metrics:MetricRow;
};

const empty:MetricRow={clicks:0,impressions:0,ctr:0,position:0};
const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));
const number=(value:number)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value);
const pct=(value:number)=>`${(value*100).toFixed(2)}%`;
const pos=(value:number)=>value?value.toFixed(1):'—';

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

function trendFor(current:MetricRow,previous:MetricRow):Trend{
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

function opportunityScore(row:MetricRow){
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

function experimentVerdict(current:MetricRow,previous:MetricRow,finalDataDays:number){
  if(finalDataDays<7)return 'Observing' as const;
  if(current.impressions+previous.impressions<2)return 'Low data' as const;
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
  if(score>=2)return 'Winner' as const;
  if(score<=-2)return 'Loser' as const;
  return 'Neutral' as const;
}

function priorityScore(priority:Priority,opportunity:number){
  const base:Record<Priority,number>={P0:400,P1:300,P2:200,HOLD:100};
  return base[priority]+opportunity;
}

function priorityTone(priority:Priority){
  if(priority==='P0')return styles.red;
  if(priority==='P1')return styles.amber;
  if(priority==='P2')return styles.blue;
  return styles.muted;
}

function actionTone(type:ActionType){
  if(type==='Cannibalization'||type==='Decay audit')return styles.red;
  if(type==='Scale winner')return styles.green;
  if(type==='Observation')return styles.muted;
  if(type==='Internal links')return styles.blue;
  return styles.amber;
}

export function AdminSeoActionCenter(){
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
        document.getElementById('toolmera-seo-action-center-host')?.remove();
        setHost(null);
        return;
      }
      const parent=querySection.parentElement;
      if(!parent)return;
      let portalHost=document.getElementById('toolmera-seo-action-center-host');
      if(!portalHost){
        portalHost=document.createElement('div');
        portalHost.id='toolmera-seo-action-center-host';
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
      document.getElementById('toolmera-seo-action-center-host')?.remove();
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
      if(!sevenResponse.ok)throw new Error('detail' in sevenPayload&&sevenPayload.detail?sevenPayload.detail:'Could not load 7-day GSC action data.');
      if(!twentyEightResponse.ok)throw new Error('detail' in twentyEightPayload&&twentyEightPayload.detail?twentyEightPayload.detail:'Could not load 28-day GSC action data.');
      setSeven(sevenPayload as GscData);
      setTwentyEight(twentyEightPayload as GscData);
    }catch(e){setError(e instanceof Error?e.message:'Could not load SEO action data.')}
    finally{setLoading(false)}
  },[host]);

  useEffect(()=>{if(host)void load()},[host,load]);

  const signals=useMemo<PageSignal[]>(()=>{
    if(!seven||!twentyEight)return [];
    const sevenMap=new Map((seven.pages||[]).map(row=>[normalizePath(row.page),row]));
    const totalMap=new Map((twentyEight.pages||[]).map(row=>[normalizePath(row.page),row]));
    const queryByPath=new Map<string,QueryPageRow[]>();
    (twentyEight.queryPages||[]).forEach(row=>{
      const path=normalizePath(row.page);
      const list=queryByPath.get(path)||[];
      list.push({...row,page:path});
      queryByPath.set(path,list);
    });

    const cannibalByPath=new Map<string,string[]>();
    const byQuery=new Map<string,QueryPageRow[]>();
    (twentyEight.queryPages||[]).forEach(row=>{
      if(!row.query||row.impressions<=0)return;
      const key=row.query.toLowerCase();
      const list=byQuery.get(key)||[];
      list.push({...row,page:normalizePath(row.page)});
      byQuery.set(key,list);
    });
    byQuery.forEach(group=>{
      const uniquePages=[...new Set(group.map(row=>row.page))];
      if(uniquePages.length<2)return;
      const total=group.reduce((sum,row)=>sum+row.impressions,0);
      const pageTotals=uniquePages.map(path=>group.filter(row=>row.page===path).reduce((sum,row)=>sum+row.impressions,0));
      const primary=Math.max(...pageTotals);
      const highRisk=total>=3&&(uniquePages.length>=3||(total?primary/total:1)<.65);
      if(!highRisk)return;
      uniquePages.forEach(path=>{
        const list=cannibalByPath.get(path)||[];
        const query=group[0]?.query||'';
        if(query&&!list.includes(query))list.push(query);
        cannibalByPath.set(path,list);
      });
    });

    return tools.map(tool=>{
      const path=normalizePath(toolUrl(tool));
      const metrics=totalMap.get(path)||empty;
      const current=sevenMap.get(path)||empty;
      const previous=weeklyBaseline(current,metrics.impressions?metrics:current);
      const queries=(queryByPath.get(path)||[]).sort((a,b)=>(b.impressions-a.impressions)||(a.position-b.position));
      const topQuery=queries[0]?.query||tool.name;
      const latest=seoExperiments
        .filter(item=>item.toolId===tool.id)
        .sort((a,b)=>b.changedAt.localeCompare(a.changedAt)||b.id.localeCompare(a.id))[0];
      let experimentDaysLeft:number|null=null;
      let experimentLoser=false;
      let experimentWinner=false;
      if(latest){
        const finalDataDays=Math.max(0,daysSince(latest.changedAt)-2);
        experimentDaysLeft=Math.max(0,7-finalDataDays);
        const verdict=experimentVerdict(current,previous,finalDataDays);
        experimentLoser=verdict==='Loser';
        experimentWinner=verdict==='Winner';
      }
      const targetRelated=new Set(semanticRelatedTools(tool,tools,10).map(item=>item.id));
      const linkIdeas=tools.filter(source=>{
        if(source.id===tool.id||hasInternalLinkBoost(source.id,tool.id))return false;
        if(semanticRelatedTools(source,tools,4).some(item=>item.id===tool.id))return false;
        return targetRelated.has(source.id)||source.category===tool.category;
      }).length;
      return {
        tool,path,metrics,current,previous,
        trend:trendFor(current,previous),
        opportunity:opportunityScore(metrics),
        topQuery,
        expectedCtr:expectedCtr(metrics.position),
        linkIdeas,
        cannibalQueries:cannibalByPath.get(path)||[],
        experimentDaysLeft,
        experimentLoser,
        experimentWinner,
      };
    }).filter(row=>row.metrics.impressions>0||row.experimentDaysLeft!==null);
  },[seven,twentyEight]);

  const actionItems=useMemo<ActionItem[]>(()=>{
    const actions:ActionItem[]=[];
    const push=(signal:PageSignal,priority:Priority,type:ActionType,title:string,detail:string,reason:string,suffix:string)=>{
      actions.push({
        id:`${signal.tool.id}-${suffix}`,
        priority,type,title,detail,signal:reason,
        score:priorityScore(priority,signal.opportunity),
        tool:signal.tool,path:signal.path,query:signal.topQuery,metrics:signal.metrics,
      });
    };

    signals.forEach(signal=>{
      if(signal.experimentDaysLeft!==null&&signal.experimentDaysLeft>0){
        push(signal,'HOLD','Observation',`Wait ${signal.experimentDaysLeft} more final-data day${signal.experimentDaysLeft===1?'':'s'}`,'Do not rewrite title, H1, body copy or URL while this SEO experiment is still inside the observation lock.','Fresh experiment overrides other optimization ideas.','wait');
        return;
      }

      if(signal.cannibalQueries.length){
        const query=signal.cannibalQueries[0];
        push(signal,'P0','Cannibalization',`Resolve competing intent for “${query}”`,`Compare every Toolmera URL ranking for this query. Choose the primary page, reduce duplicated intent, strengthen internal links to the primary URL and only consolidate content when the pages truly overlap.`,`${signal.cannibalQueries.length} high-risk overlapping quer${signal.cannibalQueries.length===1?'y':'ies'} detected.`,'cannibal');
      }

      if(signal.experimentLoser||signal.trend==='Declining'){
        push(signal,signal.experimentLoser?'P0':'P1','Decay audit','Investigate ranking decay before making another broad rewrite','Check indexability, canonical, recent title/H1 changes, intent match, internal links and whether the decline is isolated to one query cluster. Do not auto-rollback from one short window.',signal.experimentLoser?'Latest mature SEO experiment is losing.':'7-day visibility is declining versus the prior weekly baseline.','decay');
      }

      const quickWin=signal.metrics.position>=8&&signal.metrics.position<=30&&signal.opportunity>=25;
      if(quickWin&&signal.linkIdeas>0){
        const count=Math.min(3,signal.linkIdeas);
        push(signal,'P1','Internal links',`Deploy ${count} contextual internal link${count===1?'':'s'}`,`Use semantically relevant source pages and natural anchors around “${signal.topQuery}”. Prefer pages that already have impressions or strong topical adjacency; avoid footer-style sitewide repetition.`,`${signal.linkIdeas} undeployed source candidate${signal.linkIdeas===1?'':'s'} available for a position ${pos(signal.metrics.position)} page.`,'links');
      }

      const ctrGap=signal.metrics.impressions>=3&&signal.metrics.position>0&&signal.metrics.position<=20&&signal.expectedCtr>0&&signal.metrics.ctr<signal.expectedCtr*.6;
      if(ctrGap){
        push(signal,'P1','CTR',`Improve SERP snippet for “${signal.topQuery}”`,'Tighten the title and meta description around the exact search intent while keeping the canonical URL stable. Re-check that the visible H1 still supports the same promise.',`CTR ${pct(signal.metrics.ctr)} is materially below the position-based benchmark used by the dashboard.`,'ctr');
      }

      if(quickWin&&signal.metrics.position>15){
        push(signal,'P2','Content gap',`Expand coverage for “${signal.topQuery}”`,'Add one focused section, example, FAQ or supporting explanation only if the current page does not answer this intent directly. Avoid padding or creating a duplicate URL.',`Position ${pos(signal.metrics.position)} with opportunity ${signal.opportunity}/100 is close enough to justify focused relevance work.`,'content');
      }

      const winner=signal.experimentWinner||signal.trend==='Growing'||signal.trend==='New'||(signal.metrics.position>0&&signal.metrics.position<=10&&signal.metrics.impressions>=3);
      if(winner){
        push(signal,'P2','Scale winner','Scale the winning cluster without rewriting the core page',`Add adjacent semantic internal links and supporting intent around “${signal.topQuery}”. Preserve the title/H1/core answer unless new data shows a specific weakness.`,signal.experimentWinner?'Latest mature experiment is a winner.':signal.trend==='Growing'||signal.trend==='New'?`${signal.trend} GSC momentum detected.`:'Repeat impressions are already holding in TOP 10.','scale');
      }

      if(!quickWin&&!winner&&!signal.cannibalQueries.length&&!signal.experimentLoser&&signal.trend!=='Declining'&&signal.metrics.impressions<3){
        push(signal,'HOLD','Observation','Collect more repeat demand before changing the page','Leave the page stable until the query/page pair has enough repeated impressions to distinguish signal from one-off testing.','Fewer than 3 impressions in the 28-day decision window.','low-data');
      }
    });

    const seen=new Set<string>();
    return actions
      .sort((a,b)=>(b.score-a.score)||(b.metrics.impressions-a.metrics.impressions))
      .filter(item=>{if(seen.has(item.id))return false;seen.add(item.id);return true})
      .slice(0,30);
  },[signals]);

  const summary=useMemo(()=>({
    p0:actionItems.filter(item=>item.priority==='P0').length,
    p1:actionItems.filter(item=>item.priority==='P1').length,
    p2:actionItems.filter(item=>item.priority==='P2').length,
    hold:actionItems.filter(item=>item.priority==='HOLD').length,
    pages:new Set(actionItems.map(item=>item.tool.id)).size,
  }),[actionItems]);

  if(!host)return null;

  return createPortal(<section className={styles.panel}>
    <div className={styles.head}>
      <div>
        <span className={styles.kicker}>SEO ACTION CENTER · SIGNAL → TASK → EXECUTION</span>
        <h2>Exactly what should we do next?</h2>
        <p>Turns GSC opportunity, trend, experiments, CTR gaps, cannibalization and internal-link coverage into a prioritized execution queue. Observation locks suppress rewrite tasks until the current test has enough final Search Console data.</p>
      </div>
      <div className={styles.actions}>
        <button onClick={()=>void load()} disabled={loading}>{loading?'Refreshing…':'Refresh'}</button>
        <span><ListChecks size={12}/>{summary.pages} pages · {actionItems.length} tasks</span>
      </div>
    </div>

    <div className={styles.summary}>
      <div><span>P0</span><strong>{summary.p0}</strong><small>Fix first</small></div>
      <div><span>P1</span><strong>{summary.p1}</strong><small>Immediate upside</small></div>
      <div><span>P2</span><strong>{summary.p2}</strong><small>Scale / expand</small></div>
      <div><span>Hold</span><strong>{summary.hold}</strong><small>Do not touch yet</small></div>
    </div>

    {error&&<div className={styles.error}>{error}</div>}
    {loading&&!twentyEight?<div className={styles.empty}><strong>Building the execution queue…</strong><span>Combining 7-day and 28-day GSC signals with SEO experiments and internal-link coverage.</span></div>:
    actionItems.length?<div className={styles.list}>{actionItems.map((item,index)=><article className={styles.card} key={item.id}>
      <div className={styles.rank}>{String(index+1).padStart(2,'0')}</div>
      <div className={styles.badges}><span className={`${styles.pill} ${priorityTone(item.priority)}`}>{item.priority}</span><span className={`${styles.pill} ${actionTone(item.type)}`}>{item.type}</span></div>
      <a className={styles.page} href={item.path} target="_blank" rel="noreferrer"><strong>{item.tool.name}</strong><small>{item.path}</small></a>
      <div className={styles.task}><strong>{item.title}</strong><p>{item.detail}</p><small>{item.signal}</small></div>
      <div className={styles.metrics}><span><small>Impr.</small><b>{number(item.metrics.impressions)}</b></span><span><small>Position</small><b>{pos(item.metrics.position)}</b></span><span><small>CTR</small><b>{pct(item.metrics.ctr)}</b></span></div>
      <div className={styles.query}><small>Primary query</small><strong>“{item.query}”</strong></div>
      <a className={styles.open} href={item.path} target="_blank" rel="noreferrer" aria-label={`Open ${item.tool.name}`}><ExternalLink size={12}/></a>
    </article>)}</div>:<div className={styles.empty}><strong>No executable SEO tasks yet</strong><span>The current GSC window does not contain enough evidence for a prioritized action.</span></div>}

    <div className={styles.legend}><b>P0:</b><span>conflict or clear deterioration.</span><b>P1:</b><span>best near-term ranking/CTR/internal-link upside.</span><b>P2:</b><span>careful expansion of a winner or near-win.</span><b>HOLD:</b><span>observation lock or insufficient repeat demand.</span></div>
  </section>,host);
}
