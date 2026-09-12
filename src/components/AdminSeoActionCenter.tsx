'use client';

import { ExternalLink, ListChecks } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { hasInternalLinkBoost } from '@/data/internalLinkBoosts';
import { seoExperiments } from '@/data/seoExperiments';
import { tools, toolUrl, type Tool } from '@/data/tools';
import { buildOutcomeLearning, type OutcomeLearningRow, type SeoVerificationEvent } from '@/lib/seoOutcomeLearning';
import { semanticRelatedTools } from '@/lib/toolRelations';
import styles from './AdminSeoActionCenter.module.css';

type MetricRow={clicks:number;impressions:number;ctr:number;position:number};
type PageRow=MetricRow&{page:string};
type QueryPageRow=MetricRow&{query:string;page:string};
type GscData={connected:true;range:string;pages?:PageRow[];queryPages?:QueryPageRow[];fetchedAt:string};
type Priority='P0'|'P1'|'P2'|'HOLD';
type ActionType='Cannibalization'|'Decay audit'|'Internal links'|'CTR'|'Content gap'|'Scale winner'|'Observation';
type Trend='New'|'Growing'|'Stable'|'Declining';
type TaskStatus='Open'|'In progress'|'Done'|'Snoozed';
type Verification='Pending'|'Winner'|'Neutral'|'Loser'|'Low data';
type LearningStatus='loading'|'active'|'collecting'|'offline';

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

type LearningSignal={
  score:number;
  decisive:number;
  confidence:OutcomeLearningRow['confidence'];
  recommendation:OutcomeLearningRow['recommendation'];
  adjustment:number;
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
  learning?:LearningSignal;
};

type TaskSnapshot={
  toolId:string;
  toolName:string;
  path:string;
  priority:Priority;
  type:ActionType;
  title:string;
  query:string;
};

type StoredVerification={
  verdict:Exclude<Verification,'Pending'>;
  verifiedAt:string;
  current7?:MetricRow;
  impressionChange?:number|null;
  clickChange?:number|null;
  positionGain?:number;
};

type TaskRecord={
  status:TaskStatus;
  owner:string;
  updatedAt:string;
  completedAt?:string;
  snoozedUntil?:string;
  verifyAt?:string;
  baseline7?:MetricRow;
  verification?:StoredVerification;
  snapshot:TaskSnapshot;
};

type SharedTaskState={history?:unknown[]};

const empty:MetricRow={clicks:0,impressions:0,ctr:0,position:0};
const taskStorageKey='toolmera-seo-task-state-v1';
const ownerStorageKey='toolmera-seo-task-owner-v1';
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

function todayIso(){return new Date().toISOString().slice(0,10)}
function addDays(value:string,days:number){
  const date=new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate()+days);
  return date.toISOString().slice(0,10);
}
function daysSince(value:string){return Math.max(0,Math.floor((utcDay(new Date())-utcDay(value))/86400000))}
function daysUntil(value:string){return Math.ceil((utcDay(value)-utcDay(new Date()))/86400000)}

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

function taskVerification(record:TaskRecord,signal:PageSignal|undefined):Verification|null{
  if(record.verification?.verdict)return record.verification.verdict;
  if(record.status!=='Done'||!record.verifyAt)return null;
  if(daysUntil(record.verifyAt)>0)return 'Pending';
  if(!record.baseline7||!signal)return 'Low data';
  const current=signal.current;
  const baseline=record.baseline7;
  if(current.impressions+baseline.impressions<2)return 'Low data';
  const impressions=relativeChange(current.impressions,baseline.impressions);
  const positionGain=current.position&&baseline.position?baseline.position-current.position:0;
  let score=0;
  if(impressions===null&&current.impressions>=2)score+=2;
  else if(impressions!==null&&impressions>=.25)score+=2;
  else if(impressions!==null&&impressions<=-.25)score-=2;
  if(positionGain>=3)score+=2;
  else if(positionGain<=-3)score-=2;
  if(current.clicks>baseline.clicks&&current.clicks>=1)score+=1;
  else if(baseline.clicks>=1&&current.clicks<baseline.clicks)score-=1;
  if(score>=2)return 'Winner';
  if(score<=-2)return 'Loser';
  return 'Neutral';
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

function statusTone(status:TaskStatus){
  if(status==='Done')return styles.green;
  if(status==='In progress')return styles.blue;
  if(status==='Snoozed')return styles.amber;
  return styles.muted;
}

function verificationTone(verdict:Verification){
  if(verdict==='Winner')return styles.green;
  if(verdict==='Loser')return styles.red;
  if(verdict==='Neutral')return styles.blue;
  if(verdict==='Pending')return styles.amber;
  return styles.muted;
}

function isVerificationEvent(value:unknown):value is SeoVerificationEvent{
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  const event=value as Partial<SeoVerificationEvent>;
  return event.kind==='verification'&&typeof event.id==='string'&&typeof event.at==='string'&&Boolean(event.snapshot&&typeof event.snapshot==='object');
}

function learningAdjustment(row:OutcomeLearningRow|undefined,priority:Priority){
  if(!row||row.decisive<3||priority==='P0'||priority==='HOLD')return 0;
  const strength=row.confidence==='Strong'?.8:.55;
  return Math.round(clamp((row.score-50)*strength,-18,18));
}

function learningTone(signal:LearningSignal){
  if(signal.score>=60)return styles.green;
  if(signal.score<=40)return styles.red;
  if(signal.decisive<3)return styles.muted;
  return styles.amber;
}

export function AdminSeoActionCenter(){
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [seven,setSeven]=useState<GscData|null>(null);
  const [twentyEight,setTwentyEight]=useState<GscData|null>(null);
  const [outcomeHistory,setOutcomeHistory]=useState<SeoVerificationEvent[]>([]);
  const [learningStatus,setLearningStatus]=useState<LearningStatus>('loading');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [taskStates,setTaskStates]=useState<Record<string,TaskRecord>>({});
  const [taskHydrated,setTaskHydrated]=useState(false);
  const [defaultOwner,setDefaultOwner]=useState('Sviat');

  useEffect(()=>{
    try{
      const saved=window.localStorage.getItem(taskStorageKey);
      if(saved)setTaskStates(JSON.parse(saved) as Record<string,TaskRecord>);
      const savedOwner=window.localStorage.getItem(ownerStorageKey);
      if(savedOwner)setDefaultOwner(savedOwner);
    }catch{}
    setTaskHydrated(true);
  },[]);

  useEffect(()=>{
    if(!taskHydrated)return;
    try{window.localStorage.setItem(taskStorageKey,JSON.stringify(taskStates))}catch{}
  },[taskStates,taskHydrated]);

  useEffect(()=>{
    if(!taskHydrated)return;
    try{window.localStorage.setItem(ownerStorageKey,defaultOwner)}catch{}
  },[defaultOwner,taskHydrated]);

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
    setLearningStatus('loading');
    try{
      const sharedPromise=fetch('/api/admin/seo-tasks',{cache:'no-store'})
        .then(async response=>response.ok?await response.json() as SharedTaskState:null)
        .catch(()=>null);
      const [sevenResponse,twentyEightResponse,shared]=await Promise.all([
        fetch('/api/admin/gsc?range=7d',{cache:'no-store'}),
        fetch('/api/admin/gsc?range=28d',{cache:'no-store'}),
        sharedPromise,
      ]);
      const [sevenPayload,twentyEightPayload]=await Promise.all([sevenResponse.json(),twentyEightResponse.json()]) as [GscData|{detail?:string},GscData|{detail?:string}];
      if(!sevenResponse.ok)throw new Error('detail' in sevenPayload&&sevenPayload.detail?sevenPayload.detail:'Could not load 7-day GSC action data.');
      if(!twentyEightResponse.ok)throw new Error('detail' in twentyEightPayload&&twentyEightPayload.detail?twentyEightPayload.detail:'Could not load 28-day GSC action data.');
      setSeven(sevenPayload as GscData);
      setTwentyEight(twentyEightPayload as GscData);
      if(shared){
        const verified=(Array.isArray(shared.history)?shared.history:[]).filter(isVerificationEvent);
        setOutcomeHistory(verified);
        setLearningStatus(verified.length?'active':'collecting');
      }else{
        setOutcomeHistory([]);
        setLearningStatus('offline');
      }
    }catch(e){
      setError(e instanceof Error?e.message:'Could not load SEO action data.');
      setLearningStatus('offline');
    }finally{setLoading(false)}
  },[host]);

  useEffect(()=>{if(host)void load()},[host,load]);

  const learningRows=useMemo(()=>buildOutcomeLearning(outcomeHistory),[outcomeHistory]);
  const learningByType=useMemo(()=>new Map(learningRows.map(row=>[row.actionType,row])),[learningRows]);
  const learnedTypes=useMemo(()=>learningRows.filter(row=>row.decisive>=3).length,[learningRows]);

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

  const signalByTool=useMemo(()=>new Map(signals.map(signal=>[signal.tool.id,signal])),[signals]);

  const actionItems=useMemo<ActionItem[]>(()=>{
    const actions:ActionItem[]=[];
    const push=(signal:PageSignal,priority:Priority,type:ActionType,title:string,detail:string,reason:string,suffix:string)=>{
      const learned=learningByType.get(type);
      const adjustment=learningAdjustment(learned,priority);
      actions.push({
        id:`${signal.tool.id}-${suffix}`,
        priority,type,title,detail,signal:reason,
        score:priorityScore(priority,signal.opportunity)+adjustment,
        tool:signal.tool,path:signal.path,query:signal.topQuery,metrics:signal.metrics,
        learning:learned?{
          score:learned.score,
          decisive:learned.decisive,
          confidence:learned.confidence,
          recommendation:learned.recommendation,
          adjustment,
        }:undefined,
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
  },[signals,learningByType]);

  const updateTaskStatus=useCallback((item:ActionItem,status:TaskStatus)=>{
    const today=todayIso();
    const signal=signalByTool.get(item.tool.id);
    setTaskStates(previous=>{
      const existing=previous[item.id];
      const record:TaskRecord={
        status,
        owner:(existing?.owner||defaultOwner||'Admin').trim()||'Admin',
        updatedAt:today,
        snapshot:{
          toolId:item.tool.id,
          toolName:item.tool.name,
          path:item.path,
          priority:item.priority,
          type:item.type,
          title:item.title,
          query:item.query,
        },
      };
      if(status==='Done'){
        record.completedAt=today;
        record.verifyAt=addDays(today,9);
        record.baseline7=signal?.current||empty;
      }else if(status==='Snoozed'){
        record.snoozedUntil=addDays(today,7);
      }
      return {...previous,[item.id]:record};
    });
  },[defaultOwner,signalByTool]);

  const updateTaskOwner=useCallback((item:ActionItem,owner:string)=>{
    const today=todayIso();
    setTaskStates(previous=>{
      const existing=previous[item.id];
      return {...previous,[item.id]:{
        status:existing?.status||'Open',
        owner,
        updatedAt:today,
        completedAt:existing?.completedAt,
        snoozedUntil:existing?.snoozedUntil,
        verifyAt:existing?.verifyAt,
        baseline7:existing?.baseline7,
        verification:existing?.verification,
        snapshot:existing?.snapshot||{
          toolId:item.tool.id,toolName:item.tool.name,path:item.path,priority:item.priority,type:item.type,title:item.title,query:item.query,
        },
      }};
    });
  },[]);

  const summary=useMemo(()=>({
    p0:actionItems.filter(item=>item.priority==='P0').length,
    p1:actionItems.filter(item=>item.priority==='P1').length,
    p2:actionItems.filter(item=>item.priority==='P2').length,
    hold:actionItems.filter(item=>item.priority==='HOLD').length,
    pages:new Set(actionItems.map(item=>item.tool.id)).size,
  }),[actionItems]);

  const taskSummary=useMemo(()=>{
    const currentIds=new Set(actionItems.map(item=>item.id));
    const current=Object.entries(taskStates).filter(([id])=>currentIds.has(id)).map(([,record])=>record);
    const allDone=Object.values(taskStates).filter(record=>record.status==='Done');
    const verifyDue=allDone.filter(record=>record.verifyAt&&daysUntil(record.verifyAt)<=0&&!record.verification).length;
    return {
      open:actionItems.length-current.filter(record=>record.status!=='Open').length,
      progress:current.filter(record=>record.status==='In progress').length,
      done:allDone.length,
      snoozed:current.filter(record=>record.status==='Snoozed').length,
      verifyDue,
    };
  },[actionItems,taskStates]);

  const verificationRows=useMemo(()=>Object.entries(taskStates)
    .filter(([,record])=>record.status==='Done'&&record.snapshot)
    .map(([id,record])=>({id,record,signal:signalByTool.get(record.snapshot.toolId),verification:taskVerification(record,signalByTool.get(record.snapshot.toolId))}))
    .sort((a,b)=>(b.record.completedAt||'').localeCompare(a.record.completedAt||''))
    .slice(0,10),[taskStates,signalByTool]);

  const learningLabel=learningStatus==='offline'?'Learning offline':learningStatus==='loading'?'Learning…':learnedTypes?`Learning active · ${learnedTypes} types`:`Learning · ${outcomeHistory.length} verified`;

  if(!host)return null;

  return createPortal(<section className={styles.panel}>
    <div className={styles.head}>
      <div>
        <span className={styles.kicker}>SEO ACTION CENTER · SIGNAL → TASK → EXECUTION</span>
        <h2>Exactly what should we do next?</h2>
        <p>Combines GSC opportunity, trend, experiments, CTR gaps, cannibalization and internal-link coverage with Toolmera’s own verified SEO outcomes. Learned evidence re-ranks non-critical P1/P2 work only after at least three decisive samples; P0 incidents and observation locks are never overridden.</p>
      </div>
      <div className={styles.actions}>
        <label className={styles.ownerField}><span>Assignee</span><input value={defaultOwner} onChange={event=>setDefaultOwner(event.target.value)} placeholder="Name"/></label>
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

    <div className={styles.stateBar}>
      <span><b>{taskSummary.open}</b> Open</span><span><b>{taskSummary.progress}</b> In progress</span><span><b>{taskSummary.done}</b> Done</span><span><b>{taskSummary.snoozed}</b> Snoozed</span><span className={taskSummary.verifyDue?styles.verifyDue:''}><b>{taskSummary.verifyDue}</b> Verify due</span><span><b>{outcomeHistory.length}</b> {learningLabel}</span>
    </div>

    {error&&<div className={styles.error}>{error}</div>}
    {loading&&!twentyEight?<div className={styles.empty}><strong>Building the execution queue…</strong><span>Combining 7-day and 28-day GSC signals, experiments, internal-link coverage and verified outcome learning.</span></div>:
    actionItems.length?<div className={styles.list}>{actionItems.map((item,index)=>{
      const task=taskStates[item.id];
      const status=task?.status||'Open';
      const verification=task?taskVerification(task,signalByTool.get(item.tool.id)):null;
      const learningTitle=item.learning?`${item.type}: evidence ${item.learning.score}/100 · ${item.learning.decisive} decisive samples · ${item.learning.recommendation}${item.learning.adjustment?` · queue ${item.learning.adjustment>0?'+':''}${item.learning.adjustment}`:' · no queue adjustment yet'}`:'';
      return <article className={`${styles.card} ${status==='Done'?styles.cardDone:''}`} key={item.id}>
        <div className={styles.rank}>{String(index+1).padStart(2,'0')}</div>
        <div className={styles.badges}>
          <span className={`${styles.pill} ${priorityTone(item.priority)}`}>{item.priority}</span>
          <span className={`${styles.pill} ${actionTone(item.type)}`}>{item.type}</span>
          {item.learning&&<span title={learningTitle} className={`${styles.pill} ${learningTone(item.learning)}`}>{item.learning.decisive<3?`Learn ${item.learning.decisive}`:`L ${item.learning.adjustment>=0?'+':''}${item.learning.adjustment}`}</span>}
        </div>
        <a className={styles.page} href={item.path} target="_blank" rel="noreferrer"><strong>{item.tool.name}</strong><small>{item.path}</small></a>
        <div className={styles.task}><strong>{item.title}</strong><p>{item.detail}</p><small>{item.signal}</small></div>
        <div className={styles.metrics}><span><small>Impr.</small><b>{number(item.metrics.impressions)}</b></span><span><small>Position</small><b>{pos(item.metrics.position)}</b></span><span><small>CTR</small><b>{pct(item.metrics.ctr)}</b></span></div>
        <div className={styles.query}><small>Primary query</small><strong>“{item.query}”</strong></div>
        <div className={styles.taskState}>
          <select className={`${styles.statusSelect} ${statusTone(status)}`} value={status} onChange={event=>updateTaskStatus(item,event.target.value as TaskStatus)}>
            <option>Open</option><option>In progress</option><option>Done</option><option>Snoozed</option>
          </select>
          <input value={task?.owner??defaultOwner} onChange={event=>updateTaskOwner(item,event.target.value)} aria-label={`Owner for ${item.title}`} />
          <small>{status==='Done'&&task?.verifyAt?verification==='Pending'?`Verify ${task.verifyAt}`:`Result: ${verification}`:status==='Snoozed'&&task?.snoozedUntil?`Until ${task.snoozedUntil}`:task?.updatedAt?`Updated ${task.updatedAt}`:'Not started'}</small>
        </div>
        <a className={styles.open} href={item.path} target="_blank" rel="noreferrer" aria-label={`Open ${item.tool.name}`}><ExternalLink size={12}/></a>
      </article>})}</div>:<div className={styles.empty}><strong>No executable SEO tasks yet</strong><span>The current GSC window does not contain enough evidence for a prioritized action.</span></div>}

    {verificationRows.length>0&&<div className={styles.verificationSection}>
      <div className={styles.verificationHead}><div><span className={styles.kicker}>POST-ACTION VERIFICATION</span><h3>Did the completed SEO work actually help?</h3></div><small>Baseline = 7-day GSC snapshot when task was marked Done</small></div>
      <div className={styles.verificationList}>{verificationRows.map(row=>{
        const verification=row.verification||'Low data';
        const baseline=row.record.baseline7||empty;
        const current=row.record.verification?.current7||row.signal?.current||empty;
        const positionGain=row.record.verification?.positionGain??(current.position&&baseline.position?baseline.position-current.position:0);
        const impressionChange=row.record.verification?.impressionChange??relativeChange(current.impressions,baseline.impressions);
        return <div className={styles.verificationRow} key={row.id}>
          <span className={`${styles.pill} ${verificationTone(verification)}`}>{verification}</span>
          <div><strong>{row.record.snapshot.toolName}</strong><small>{row.record.snapshot.title}</small></div>
          <div><small>Owner</small><strong>{row.record.owner||'Admin'}</strong></div>
          <div><small>Completed</small><strong>{row.record.completedAt||'—'}</strong></div>
          <div><small>Impr. Δ</small><strong>{verification==='Pending'?'—':impressionChange===null?'NEW':`${impressionChange>=0?'+':''}${Math.round(impressionChange*100)}%`}</strong></div>
          <div><small>Pos. Δ</small><strong>{verification==='Pending'?'—':`${positionGain>=0?'+':''}${positionGain.toFixed(1)}`}</strong></div>
          <a href={row.record.snapshot.path} target="_blank" rel="noreferrer"><ExternalLink size={11}/></a>
        </div>})}</div>
    </div>}

    <div className={styles.legend}><b>P0:</b><span>conflict or clear deterioration; learning cannot demote it.</span><b>P1/P2:</b><span>verified action-type evidence can re-rank work by up to ±18 queue points after 3+ decisive samples.</span><b>HOLD:</b><span>observation lock or insufficient repeat demand; learning cannot override it.</span><b>Learn N:</b><span>evidence exists but sample size is still too small to change ordering.</span></div>
  </section>,host);
}