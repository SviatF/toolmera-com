'use client';

import { ExternalLink, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './AdminQueryIntelligence.module.css';

type MetricRow={clicks:number;impressions:number;ctr:number;position:number};
type QueryRow=MetricRow&{query:string};
type PageRow=MetricRow&{page:string};
type QueryPageRow=MetricRow&{query:string;page:string};
type GscData={
  connected:true;
  range:string;
  pages?:PageRow[];
  queries:QueryRow[];
  queryPages:QueryPageRow[];
  fetchedAt:string;
};
type SortKey='query'|'clicks'|'impressions'|'ctr'|'position'|'priority';
type SortDirection='asc'|'desc';
type QuickFilter='all'|'priority'|'cannibalized'|'growing'|'declining'|'3plus'|'top20'|'quick';
type OpportunityPriority='P0'|'P1'|'P2'|'Watch';
type OpportunityAction='Optimize now'|'Grow winner'|'Next'|'Watch';
type CannibalRisk='High'|'Medium'|'Low';
type CannibalAction='Consolidate intent'|'Strengthen primary'|'Monitor';
type TrendState='New winner'|'Growing'|'Stable'|'Declining';
type TrendAction='Expand cluster'|'Scale winner'|'Investigate decay'|'Monitor';

type EnrichedQuery=QueryRow&{
  page:string|null;
  pageCount:number;
  bucket:'TOP 1–10'|'11–20'|'21–50'|'51+'|'No rank';
  signal:'Grow TOP 10'|'Quick win'|'Opportunity'|'Demand signal'|'Early signal';
  priority:number;
  trend:TrendState;
};

type PageOpportunity=MetricRow&{
  page:string;
  queryCount:number;
  top10:number;
  top20:number;
  topQuery:string;
  score:number;
  priority:OpportunityPriority;
  action:OpportunityAction;
};

type Cannibalization=MetricRow&{
  query:string;
  pages:QueryPageRow[];
  primaryPage:string;
  primaryShare:number;
  score:number;
  risk:CannibalRisk;
  action:CannibalAction;
};

type TrendRow={
  key:string;
  label:string;
  current:MetricRow;
  previous:MetricRow;
  impressionChange:number|null;
  clickChange:number|null;
  positionChange:number;
  state:TrendState;
  action:TrendAction;
};

const number=(value:number)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value);
const pct=(value:number)=>`${(value*100).toFixed(2)}%`;
const pos=(value:number)=>value?value.toFixed(1):'—';
const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));
const emptyMetric:MetricRow={clicks:0,impressions:0,ctr:0,position:0};
const pathOnly=(value:string)=>{
  try{return new URL(value,'https://toolmera.com').pathname||'/'}catch{return value||'/'}
};

function bucketFor(position:number):EnrichedQuery['bucket']{
  if(!position)return 'No rank';
  if(position<=10)return 'TOP 1–10';
  if(position<=20)return '11–20';
  if(position<=50)return '21–50';
  return '51+';
}

function signalFor(row:QueryRow):EnrichedQuery['signal']{
  if(row.impressions>=3&&row.position>0&&row.position<=10)return 'Grow TOP 10';
  if(row.impressions>=3&&row.position>10&&row.position<=20)return 'Quick win';
  if(row.impressions>=5&&row.position>20&&row.position<=50)return 'Opportunity';
  if(row.impressions>=3)return 'Demand signal';
  return 'Early signal';
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

function demandFactor(impressions:number){
  if(impressions<=0)return 0;
  return clamp(Math.log1p(impressions)/Math.log(51),0,1);
}

function proximityFactor(position:number){
  if(!position)return .08;
  if(position<=3)return .45;
  if(position<=10)return .76;
  if(position<=20)return 1;
  if(position<=30)return .88;
  if(position<=50)return .58;
  if(position<=75)return .32;
  return .18;
}

function opportunityScore(row:MetricRow){
  if(row.impressions<=0)return 0;
  const expected=expectedCtr(row.position);
  const ctrOpportunity=expected?clamp((expected-row.ctr)/expected,0,1):.5;
  const score=demandFactor(row.impressions)*proximityFactor(row.position)*(.72+.28*ctrOpportunity);
  return Math.round(clamp(score,0,1)*100);
}

function priorityFor(score:number):OpportunityPriority{
  if(score>=60)return 'P0';
  if(score>=42)return 'P1';
  if(score>=25)return 'P2';
  return 'Watch';
}

function actionFor(row:MetricRow,score:number):OpportunityAction{
  if(row.position>0&&row.position<=10&&row.impressions>=3)return 'Grow winner';
  if(score>=50&&row.position>10)return 'Optimize now';
  if(score>=30)return 'Next';
  return 'Watch';
}

function cannibalRiskFor(score:number):CannibalRisk{
  if(score>=55)return 'High';
  if(score>=35)return 'Medium';
  return 'Low';
}

function cannibalActionFor(impressions:number,pageCount:number,primaryShare:number):CannibalAction{
  if(impressions<3)return 'Monitor';
  if(pageCount>=3||primaryShare<.65)return 'Consolidate intent';
  return 'Strengthen primary';
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

function trendStateFor(current:MetricRow,previous:MetricRow):TrendState{
  const impressionChange=relativeChange(current.impressions,previous.impressions);
  const positionGain=current.position&&previous.position?previous.position-current.position:0;
  if(current.impressions>=2&&previous.impressions<.5)return 'New winner';
  if(previous.impressions>=2&&(
    (impressionChange!==null&&impressionChange<=-.4)||
    (positionGain<=-8&&current.impressions<=previous.impressions*1.2)
  ))return 'Declining';
  if(current.impressions>=2&&(
    (impressionChange!==null&&impressionChange>=.45)||
    positionGain>=5||
    (current.clicks>previous.clicks&&current.clicks>=1)
  ))return 'Growing';
  return 'Stable';
}

function trendActionFor(state:TrendState):TrendAction{
  if(state==='New winner')return 'Expand cluster';
  if(state==='Growing')return 'Scale winner';
  if(state==='Declining')return 'Investigate decay';
  return 'Monitor';
}

function buildTrendRows<T extends MetricRow>(
  currentRows:T[],
  totalRows:T[],
  keyFor:(row:T)=>string,
  labelFor:(row:T)=>string,
):TrendRow[]{
  const currentMap=new Map(currentRows.map(row=>[keyFor(row).toLowerCase(),row]));
  const totalMap=new Map(totalRows.map(row=>[keyFor(row).toLowerCase(),row]));
  const keys=new Set([...currentMap.keys(),...totalMap.keys()]);
  const rows:TrendRow[]=[];
  keys.forEach(key=>{
    const current=currentMap.get(key)||emptyMetric as T;
    const total=totalMap.get(key)||current;
    const previous=weeklyBaseline(current,total);
    if(current.impressions<1&&previous.impressions<1)return;
    const state=trendStateFor(current,previous);
    rows.push({
      key,
      label:currentMap.has(key)?labelFor(current):labelFor(total),
      current,
      previous,
      impressionChange:relativeChange(current.impressions,previous.impressions),
      clickChange:relativeChange(current.clicks,previous.clicks),
      positionChange:current.position&&previous.position?previous.position-current.position:0,
      state,
      action:trendActionFor(state),
    });
  });
  const weight:Record<TrendState,number>={'Declining':4,'New winner':3,'Growing':2,'Stable':1};
  return rows.sort((a,b)=>(weight[b.state]-weight[a.state])||(Math.max(b.current.impressions,b.previous.impressions)-Math.max(a.current.impressions,a.previous.impressions)));
}

function bucketTone(bucket:EnrichedQuery['bucket']){
  if(bucket==='TOP 1–10')return styles.green;
  if(bucket==='11–20')return styles.blue;
  if(bucket==='21–50')return styles.amber;
  return styles.muted;
}

function signalTone(signal:EnrichedQuery['signal']){
  if(signal==='Grow TOP 10')return styles.green;
  if(signal==='Quick win')return styles.blue;
  if(signal==='Opportunity')return styles.amber;
  if(signal==='Demand signal')return styles.amber;
  return styles.muted;
}

function priorityTone(priority:OpportunityPriority){
  if(priority==='P0')return styles.red;
  if(priority==='P1')return styles.amber;
  if(priority==='P2')return styles.blue;
  return styles.muted;
}

function actionTone(action:OpportunityAction){
  if(action==='Optimize now')return styles.red;
  if(action==='Grow winner')return styles.green;
  if(action==='Next')return styles.blue;
  return styles.muted;
}

function cannibalRiskTone(risk:CannibalRisk){
  if(risk==='High')return styles.red;
  if(risk==='Medium')return styles.amber;
  return styles.muted;
}

function cannibalActionTone(action:CannibalAction){
  if(action==='Consolidate intent')return styles.red;
  if(action==='Strengthen primary')return styles.amber;
  return styles.muted;
}

function trendTone(state:TrendState){
  if(state==='Growing')return styles.green;
  if(state==='New winner')return styles.blue;
  if(state==='Declining')return styles.red;
  return styles.muted;
}

function trendActionTone(action:TrendAction){
  if(action==='Scale winner')return styles.green;
  if(action==='Expand cluster')return styles.blue;
  if(action==='Investigate decay')return styles.red;
  return styles.muted;
}

function deltaClass(value:number){
  if(value>.001)return styles.deltaUp;
  if(value<-.001)return styles.deltaDown;
  return styles.deltaFlat;
}

function percentDeltaLabel(value:number|null){
  if(value===null)return 'NEW';
  if(Math.abs(value)<.005)return '0%';
  return `${value>0?'+':''}${Math.round(value*100)}%`;
}

function positionDeltaLabel(value:number){
  if(Math.abs(value)<.05)return '0.0';
  return `${value>0?'+':''}${value.toFixed(1)}`;
}

export function AdminQueryIntelligence(){
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [range,setRange]=useState('28d');
  const [data,setData]=useState<GscData|null>(null);
  const [trendSeven,setTrendSeven]=useState<GscData|null>(null);
  const [trendTwentyEight,setTrendTwentyEight]=useState<GscData|null>(null);
  const trendCache=useRef<{seven:GscData|null;twentyEight:GscData|null}>({seven:null,twentyEight:null});
  const [loading,setLoading]=useState(false);
  const [trendLoading,setTrendLoading]=useState(false);
  const [error,setError]=useState('');
  const [filter,setFilter]=useState('');
  const [quickFilter,setQuickFilter]=useState<QuickFilter>('all');
  const [sort,setSort]=useState<{key:SortKey;direction:SortDirection}>({key:'priority',direction:'desc'});
  const hiddenSection=useRef<HTMLElement|null>(null);
  const hiddenToolbar=useRef<HTMLElement|null>(null);

  useEffect(()=>{
    const restore=()=>{
      hiddenSection.current?.style.removeProperty('display');
      hiddenToolbar.current?.style.removeProperty('display');
      hiddenSection.current=null;
      hiddenToolbar.current=null;
    };

    const sync=()=>{
      const heading=document.querySelector('.adminTopbar h1')?.textContent?.trim();
      const rangeSelect=document.querySelector('.adminTopActions select') as HTMLSelectElement|null;
      if(rangeSelect?.value)setRange(rangeSelect.value);

      const queryTable=document.querySelector('.queryTable');
      const querySection=queryTable?.closest('.adminPanel') as HTMLElement|null;
      const isQueries=heading==='Queries'&&Boolean(querySection);

      if(!isQueries){
        restore();
        const existing=document.getElementById('toolmera-query-intelligence-host');
        if(existing)existing.remove();
        setHost(null);
        return;
      }

      const parent=querySection!.parentElement;
      if(!parent)return;
      let portalHost=document.getElementById('toolmera-query-intelligence-host');
      if(!portalHost){
        portalHost=document.createElement('div');
        portalHost.id='toolmera-query-intelligence-host';
        parent.insertBefore(portalHost,querySection!);
      }

      if(hiddenSection.current!==querySection){
        restore();
        hiddenSection.current=querySection;
        querySection!.style.display='none';
        const previous=portalHost.previousElementSibling as HTMLElement|null;
        if(previous?.classList.contains('adminToolbar')){
          hiddenToolbar.current=previous;
          previous.style.display='none';
        }
      }
      setHost(portalHost);
    };

    sync();
    const observer=new MutationObserver(sync);
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    const interval=window.setInterval(sync,800);
    return()=>{
      observer.disconnect();
      window.clearInterval(interval);
      restore();
      document.getElementById('toolmera-query-intelligence-host')?.remove();
    };
  },[]);

  const fetchGsc=useCallback(async(targetRange:string)=>{
    const response=await fetch('/api/admin/gsc?range='+encodeURIComponent(targetRange),{cache:'no-store'});
    const payload=await response.json() as GscData|{detail?:string;message?:string};
    if(!response.ok)throw new Error('detail' in payload&&payload.detail?payload.detail:'Could not load Search Console query intelligence.');
    return payload as GscData;
  },[]);

  const load=useCallback(async(forceTrend=false)=>{
    if(!host)return;
    setLoading(true);
    setError('');
    if(forceTrend){
      trendCache.current={seven:null,twentyEight:null};
      setTrendSeven(null);
      setTrendTwentyEight(null);
    }
    try{
      const main=await fetchGsc(range);
      setData(main);

      let seven=range==='7d'?main:trendCache.current.seven;
      let twentyEight=range==='28d'?main:trendCache.current.twentyEight;
      if(range==='7d'){trendCache.current.seven=main;setTrendSeven(main)}
      if(range==='28d'){trendCache.current.twentyEight=main;setTrendTwentyEight(main)}

      const missing:string[]=[];
      if(!seven)missing.push('7d');
      if(!twentyEight)missing.push('28d');
      if(missing.length){
        setTrendLoading(true);
        const results=await Promise.all(missing.map(item=>fetchGsc(item)));
        results.forEach((result,index)=>{
          const key=missing[index];
          if(key==='7d'){seven=result;trendCache.current.seven=result;setTrendSeven(result)}
          if(key==='28d'){twentyEight=result;trendCache.current.twentyEight=result;setTrendTwentyEight(result)}
        });
      }
    }catch(e){
      setError(e instanceof Error?e.message:'Could not load Search Console query intelligence.');
    }finally{
      setLoading(false);
      setTrendLoading(false);
    }
  },[host,range,fetchGsc]);

  useEffect(()=>{if(host)void load()},[host,range,load]);

  const pageTrends=useMemo(()=>{
    if(!trendSeven||!trendTwentyEight)return [];
    return buildTrendRows<PageRow>(trendSeven.pages||[],trendTwentyEight.pages||[],row=>row.page,row=>row.page);
  },[trendSeven,trendTwentyEight]);

  const queryTrends=useMemo(()=>{
    if(!trendSeven||!trendTwentyEight)return [];
    return buildTrendRows<QueryRow>(trendSeven.queries||[],trendTwentyEight.queries||[],row=>row.query,row=>row.query);
  },[trendSeven,trendTwentyEight]);

  const queryTrendMap=useMemo(()=>new Map(queryTrends.map(row=>[row.key,row])),[queryTrends]);

  const enriched=useMemo<EnrichedQuery[]>(()=>{
    if(!data)return [];
    const byQuery=new Map<string,QueryPageRow[]>();
    data.queryPages.forEach(row=>{
      const key=row.query.toLowerCase();
      const list=byQuery.get(key)||[];
      list.push(row);
      byQuery.set(key,list);
    });
    return data.queries.map(query=>{
      const key=query.query.toLowerCase();
      const matches=[...(byQuery.get(key)||[])].sort((a,b)=>
        (b.impressions-a.impressions)||(a.position-b.position)||(b.clicks-a.clicks)
      );
      return {
        ...query,
        page:matches[0]?.page||null,
        pageCount:new Set(matches.map(row=>row.page)).size,
        bucket:bucketFor(query.position),
        signal:signalFor(query),
        priority:opportunityScore(query),
        trend:queryTrendMap.get(key)?.state||'Stable',
      };
    });
  },[data,queryTrendMap]);

  const pageOpportunities=useMemo<PageOpportunity[]>(()=>{
    if(!data)return [];
    type Aggregate={
      clicks:number;
      impressions:number;
      weightedPosition:number;
      queries:Set<string>;
      top10:Set<string>;
      top20:Set<string>;
      topQuery:string;
      topQueryImpressions:number;
    };
    const byPage=new Map<string,Aggregate>();
    data.queryPages.forEach(row=>{
      if(!row.page||row.impressions<=0)return;
      const current=byPage.get(row.page)||{
        clicks:0,impressions:0,weightedPosition:0,queries:new Set<string>(),top10:new Set<string>(),top20:new Set<string>(),topQuery:'',topQueryImpressions:-1,
      };
      current.clicks+=row.clicks;
      current.impressions+=row.impressions;
      current.weightedPosition+=row.position*row.impressions;
      current.queries.add(row.query);
      if(row.position>0&&row.position<=10)current.top10.add(row.query);
      if(row.position>0&&row.position<=20)current.top20.add(row.query);
      if(row.impressions>current.topQueryImpressions){current.topQuery=row.query;current.topQueryImpressions=row.impressions}
      byPage.set(row.page,current);
    });

    return [...byPage.entries()].map(([page,value])=>{
      const metrics:MetricRow={
        clicks:value.clicks,
        impressions:value.impressions,
        ctr:value.impressions?value.clicks/value.impressions:0,
        position:value.impressions?value.weightedPosition/value.impressions:0,
      };
      const score=opportunityScore(metrics);
      return {
        ...metrics,
        page,
        queryCount:value.queries.size,
        top10:value.top10.size,
        top20:value.top20.size,
        topQuery:value.topQuery,
        score,
        priority:priorityFor(score),
        action:actionFor(metrics,score),
      };
    }).sort((a,b)=>(b.score-a.score)||(b.impressions-a.impressions)||(a.position-b.position));
  },[data]);

  const cannibalizations=useMemo<Cannibalization[]>(()=>{
    if(!data)return [];
    const queryMetrics=new Map(data.queries.map(row=>[row.query.toLowerCase(),row]));
    const grouped=new Map<string,{query:string;pages:Map<string,QueryPageRow>}>();

    data.queryPages.forEach(row=>{
      if(!row.query||!row.page||row.impressions<=0)return;
      const key=row.query.toLowerCase();
      const group=grouped.get(key)||{query:row.query,pages:new Map<string,QueryPageRow>()};
      const current=group.pages.get(row.page);
      if(current){
        const impressions=current.impressions+row.impressions;
        group.pages.set(row.page,{
          query:row.query,
          page:row.page,
          clicks:current.clicks+row.clicks,
          impressions,
          ctr:impressions?(current.clicks+row.clicks)/impressions:0,
          position:impressions?((current.position*current.impressions)+(row.position*row.impressions))/impressions:0,
        });
      }else group.pages.set(row.page,{...row});
      grouped.set(key,group);
    });

    const result:Cannibalization[]=[];
    grouped.forEach((group,key)=>{
      const pages=[...group.pages.values()].sort((a,b)=>(b.impressions-a.impressions)||(a.position-b.position));
      if(pages.length<2)return;
      const pageImpressions=pages.reduce((sum,row)=>sum+row.impressions,0);
      const pageClicks=pages.reduce((sum,row)=>sum+row.clicks,0);
      const weightedPosition=pageImpressions?pages.reduce((sum,row)=>sum+(row.position*row.impressions),0)/pageImpressions:0;
      const aggregate=queryMetrics.get(key);
      const impressions=aggregate?.impressions||pageImpressions;
      const clicks=aggregate?.clicks??pageClicks;
      const ctr=aggregate?.ctr??(impressions?clicks/impressions:0);
      const position=aggregate?.position||weightedPosition;
      const primaryShare=pageImpressions?pages[0].impressions/pageImpressions:1;
      const splitFactor=1-primaryShare;
      const pageFactor=clamp((pages.length-1)/3,0,1);
      const score=Math.round(clamp(
        demandFactor(impressions)*.45+
        splitFactor*.25+
        pageFactor*.15+
        proximityFactor(position)*.15,
      0,1)*100);
      result.push({
        query:aggregate?.query||group.query,
        pages,
        primaryPage:pages[0].page,
        primaryShare,
        clicks,
        impressions,
        ctr,
        position,
        score,
        risk:cannibalRiskFor(score),
        action:cannibalActionFor(impressions,pages.length,primaryShare),
      });
    });

    return result.sort((a,b)=>(b.score-a.score)||(b.impressions-a.impressions)||(a.position-b.position));
  },[data]);

  const trendDisplay=useMemo(()=>{
    const meaningful=pageTrends.filter(row=>row.state!=='Stable');
    return (meaningful.length?meaningful:pageTrends).slice(0,12);
  },[pageTrends]);

  const rows=useMemo(()=>{
    const search=filter.trim().toLowerCase();
    const filtered=enriched.filter(row=>{
      const matchesSearch=!search||row.query.toLowerCase().includes(search)||(row.page||'').toLowerCase().includes(search);
      if(!matchesSearch)return false;
      if(quickFilter==='priority')return row.priority>=30;
      if(quickFilter==='cannibalized')return row.pageCount>=2;
      if(quickFilter==='growing')return row.trend==='Growing'||row.trend==='New winner';
      if(quickFilter==='declining')return row.trend==='Declining';
      if(quickFilter==='3plus')return row.impressions>=3;
      if(quickFilter==='top20')return row.position>0&&row.position<=20;
      if(quickFilter==='quick')return row.impressions>=3&&row.position>0&&row.position<=20;
      return true;
    });
    return filtered.sort((a,b)=>{
      const direction=sort.direction==='asc'?1:-1;
      if(sort.key==='query')return a.query.localeCompare(b.query)*direction;
      const aValue=sort.key==='priority'?a.priority:a[sort.key];
      const bValue=sort.key==='priority'?b.priority:b[sort.key];
      if(sort.key==='position'){
        const aMissing=!aValue;
        const bMissing=!bValue;
        if(aMissing!==bMissing)return aMissing?1:-1;
      }
      return (Number(aValue)-Number(bValue))*direction;
    });
  },[enriched,filter,quickFilter,sort]);

  const summary=useMemo(()=>({
    top10:enriched.filter(row=>row.position>0&&row.position<=10).length,
    top20:enriched.filter(row=>row.position>0&&row.position<=20).length,
    strong:enriched.filter(row=>row.impressions>=3).length,
    quick:enriched.filter(row=>row.impressions>=3&&row.position>0&&row.position<=20).length,
    optimize:pageOpportunities.filter(row=>row.action==='Optimize now').length,
    cannibalized:cannibalizations.length,
    cannibalHigh:cannibalizations.filter(row=>row.risk==='High').length,
    growing:pageTrends.filter(row=>row.state==='Growing'||row.state==='New winner').length,
    declining:pageTrends.filter(row=>row.state==='Declining').length,
  }),[enriched,pageOpportunities,cannibalizations,pageTrends]);

  const toggleSort=(key:SortKey)=>setSort(current=>current.key===key
    ?{key,direction:current.direction==='asc'?'desc':'asc'}
    :{key,direction:key==='query'||key==='position'?'asc':'desc'});
  const sortMark=(key:SortKey)=>sort.key===key?(sort.direction==='asc'?'↑':'↓'):'';

  if(!host)return null;

  return createPortal(<div className={styles.wrap}>
    <div className={styles.summary}>
      <div className={styles.summaryCard}><span>TOP 10 queries</span><strong>{summary.top10}</strong><small>Current GSC positions 1–10</small></div>
      <div className={styles.summaryCard}><span>TOP 20 queries</span><strong>{summary.top20}</strong><small>Positions 1–20</small></div>
      <div className={styles.summaryCard}><span>3+ impressions</span><strong>{summary.strong}</strong><small>Signals worth watching</small></div>
      <div className={styles.summaryCard}><span>Quick wins</span><strong>{summary.quick}</strong><small>3+ impressions and TOP 20</small></div>
      <div className={styles.summaryCard}><span>Optimize now</span><strong>{summary.optimize}</strong><small>Pages with highest current upside</small></div>
      <div className={styles.summaryCard}><span>2+ ranking pages</span><strong>{summary.cannibalized}</strong><small>{summary.cannibalHigh} high-risk query{summary.cannibalHigh===1?'':'ies'}</small></div>
      <div className={styles.summaryCard}><span>Growing pages</span><strong>{summary.growing}</strong><small>7d momentum vs prior weekly baseline</small></div>
      <div className={styles.summaryCard}><span>Declining pages</span><strong>{summary.declining}</strong><small>Potential SEO decay to inspect</small></div>
    </div>

    <section className={`${styles.panel} ${styles.queuePanel}`}>
      <div className={styles.panelHead}>
        <div><span className={styles.kicker}>SEO OPPORTUNITY QUEUE · PAGE LEVEL</span><h2>What should we optimize next?</h2><p className={styles.panelCopy}>Priority score combines demand, distance to TOP 10 and CTR headroom while damping one-impression noise.</p></div>
        <span className={styles.live}>Auto-ranked</span>
      </div>
      {data&&pageOpportunities.length?<div className={styles.queueTable}>
        <div className={`${styles.queueRow} ${styles.queueHead}`}><span>Priority</span><span>Landing page</span><span>Queries</span><span>Impressions</span><span>Avg pos.</span><span>CTR</span><span>TOP 20</span><span>Action</span></div>
        {pageOpportunities.slice(0,10).map(row=><div className={styles.queueRow} key={row.page}>
          <span className={styles.scoreCell}><b>{row.score}</b><em className={`${styles.pill} ${priorityTone(row.priority)}`}>{row.priority}</em></span>
          <a className={styles.queuePage} href={row.page} target="_blank" rel="noreferrer" title={row.page}><strong>{pathOnly(row.page)}</strong><small>{row.topQuery||'No dominant query'}</small></a>
          <span className={styles.metric}>{number(row.queryCount)}</span><span className={styles.metric}>{number(row.impressions)}</span><span className={styles.metric}>{pos(row.position)}</span><span className={styles.metric}>{pct(row.ctr)}</span><span className={styles.metric}>{number(row.top20)}</span>
          <span className={`${styles.pill} ${actionTone(row.action)}`}>{row.action}</span>
        </div>)}
      </div>:loading?<div className={styles.loading}><strong>Building opportunity queue…</strong><span>Scoring page-level GSC demand and ranking proximity.</span></div>:<div className={styles.empty}><strong>No page opportunities yet</strong><span>More GSC query/page rows are needed to rank opportunities.</span></div>}
      <div className={styles.legend}><b>Score 60–100:</b><span>P0</span><b>42–59:</b><span>P1</span><b>25–41:</b><span>P2</span><b>0–24:</b><span>Watch</span><b>TOP 20:</b><span>number of ranking queries for that page.</span></div>
    </section>

    <section className={`${styles.panel} ${styles.trendPanel}`}>
      <div className={styles.panelHead}>
        <div><span className={styles.kicker}>SEO TREND & DECAY · PAGE LEVEL</span><h2>7-day momentum vs prior 21-day weekly baseline</h2><p className={styles.panelCopy}>The latest 7 days are compared with the weekly average of the preceding 21 days. This reduces day-to-day noise while still surfacing new winners, growth and meaningful decay.</p></div>
        <span className={`${styles.live} ${summary.declining?styles.warningLive:''}`}>{summary.declining?`${summary.declining} declining`:'7d momentum'}</span>
      </div>
      {trendSeven&&trendTwentyEight&&trendDisplay.length?<div className={styles.trendTable}>
        <div className={`${styles.trendRow} ${styles.queueHead}`}><span>Trend</span><span>Landing page</span><span>7d impr.</span><span>Prev / wk</span><span>Impr. Δ</span><span>7d pos.</span><span>Pos. Δ</span><span>Action</span></div>
        {trendDisplay.map(row=><div className={styles.trendRow} key={row.key}>
          <span className={`${styles.pill} ${trendTone(row.state)}`}>{row.state}</span>
          <a className={styles.queuePage} href={row.label} target="_blank" rel="noreferrer" title={row.label}><strong>{pathOnly(row.label)}</strong><small>{number(row.current.clicks)} clicks · {pct(row.current.ctr)}</small></a>
          <span className={styles.metric}>{number(row.current.impressions)}</span><span className={styles.metric}>{number(row.previous.impressions)}</span>
          <span className={`${styles.trendDelta} ${row.impressionChange===null?styles.deltaUp:deltaClass(row.impressionChange)}`}>{percentDeltaLabel(row.impressionChange)}</span>
          <span className={styles.metric}>{pos(row.current.position)}</span><span className={`${styles.trendDelta} ${deltaClass(row.positionChange)}`}>{positionDeltaLabel(row.positionChange)}</span>
          <span className={`${styles.pill} ${trendActionTone(row.action)}`}>{row.action}</span>
        </div>)}
      </div>:trendLoading?<div className={styles.loading}><strong>Building SEO trend baseline…</strong><span>Comparing the latest 7 days with the prior 21-day weekly average.</span></div>:<div className={styles.empty}><strong>No trend signal yet</strong><span>More Search Console page data is needed before momentum can be classified.</span></div>}
      <div className={styles.legend}><b>New winner:</b><span>new 7-day visibility with little or no prior baseline.</span><b>Growing:</b><span>meaningful impression, click or position improvement.</span><b>Declining:</b><span>large visibility loss or ranking deterioration.</span><b>Pos. Δ:</b><span>positive means ranking improved.</span></div>
    </section>

    <section className={`${styles.panel} ${styles.cannibalPanel}`}>
      <div className={styles.panelHead}>
        <div><span className={styles.kicker}>CANNIBALIZATION DETECTOR · QUERY LEVEL</span><h2>Queries ranking with multiple pages</h2><p className={styles.panelCopy}>Potential cannibalization is flagged when the same GSC query appears for 2+ Toolmera URLs. It is a diagnostic signal, not proof that pages should be merged.</p></div>
        <span className={`${styles.live} ${summary.cannibalHigh?styles.warningLive:''}`}>{summary.cannibalHigh?`${summary.cannibalHigh} high risk`:'Watching'}</span>
      </div>
      {data&&cannibalizations.length?<div className={styles.cannibalTable}>
        <div className={`${styles.cannibalRow} ${styles.queueHead}`}><span>Risk</span><span>Query</span><span>Primary page</span><span>Other ranking pages</span><span>Impr.</span><span>Avg pos.</span><span>Primary share</span><span>Action</span></div>
        {cannibalizations.slice(0,10).map(row=>{
          const secondary=row.pages.slice(1);
          return <div className={styles.cannibalRow} key={row.query.toLowerCase()}>
            <span className={styles.scoreCell}><b>{row.score}</b><em className={`${styles.pill} ${cannibalRiskTone(row.risk)}`}>{row.risk}</em></span>
            <strong className={styles.query} title={row.query}>{row.query}</strong>
            <a className={styles.queuePage} href={row.primaryPage} target="_blank" rel="noreferrer" title={row.primaryPage}><strong>{pathOnly(row.primaryPage)}</strong><small>{number(row.pages[0].impressions)} impressions · pos {pos(row.pages[0].position)}</small></a>
            <div className={styles.competingPages}>{secondary.slice(0,2).map(page=><a key={page.page} href={page.page} target="_blank" rel="noreferrer" title={page.page}>{pathOnly(page.page)}</a>)}{secondary.length>2&&<small>+{secondary.length-2} more</small>}</div>
            <span className={styles.metric}>{number(row.impressions)}</span><span className={styles.metric}>{pos(row.position)}</span>
            <span className={styles.shareCell}><span><i style={{width:`${Math.round(row.primaryShare*100)}%`}}/></span><small>{Math.round(row.primaryShare*100)}%</small></span>
            <span className={`${styles.pill} ${cannibalActionTone(row.action)}`}>{row.action}</span>
          </div>;
        })}
      </div>:loading?<div className={styles.loading}><strong>Checking ranking-page overlap…</strong><span>Grouping GSC query/page rows by search query.</span></div>:<div className={styles.empty}><strong>No multi-page query overlap detected</strong><span>Each recorded query currently maps to one ranking URL in the available GSC data.</span></div>}
      <div className={styles.legend}><b>High risk:</b><span>meaningful demand plus a strong split across multiple URLs.</span><b>Consolidate intent:</b><span>review titles, content intent and internal links before merging or redirecting anything.</span><b>Primary share:</b><span>share of query/page impressions held by the leading URL.</span></div>
    </section>

    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div><span className={styles.kicker}>GOOGLE SEARCH CONSOLE · QUERY → PAGE</span><h2>Search query intelligence</h2></div>
        <div className={styles.panelActions}><button className={styles.refresh} onClick={()=>void load(true)} disabled={loading}>{loading?'Refreshing…':'Refresh'}</button><span className={styles.live}>Live</span></div>
      </div>

      <div className={styles.controls}>
        <div className={styles.filters}>
          {([['all','All'],['priority','Priority 30+'],['growing','Growing'],['declining','Declining'],['cannibalized','2+ pages'],['3plus','3+ impressions'],['top20','TOP 20'],['quick','Quick wins']] as [QuickFilter,string][]).map(([key,label])=><button key={key} className={`${styles.filterButton} ${quickFilter===key?styles.active:''}`} onClick={()=>setQuickFilter(key)}>{label}</button>)}
        </div>
        <div className={styles.search}><Search size={14}/><input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter query or landing page…"/></div>
      </div>

      {error&&<div className={styles.error}>{error}</div>}
      {loading&&!data?<div className={styles.loading}><strong>Loading live GSC query intelligence…</strong><span>Mapping queries to their landing pages.</span></div>:
      data?<div className={styles.tableWrap}><div className={styles.table}>
        <div className={`${styles.row} ${styles.head}`}>
          <button className={`${styles.sortButton} ${sort.key==='query'?styles.active:''}`} onClick={()=>toggleSort('query')}>Query {sortMark('query')}</button>
          <span>Landing page</span>
          <button className={`${styles.sortButton} ${sort.key==='clicks'?styles.active:''}`} onClick={()=>toggleSort('clicks')}>Clicks {sortMark('clicks')}</button>
          <button className={`${styles.sortButton} ${sort.key==='impressions'?styles.active:''}`} onClick={()=>toggleSort('impressions')}>Impressions {sortMark('impressions')}</button>
          <button className={`${styles.sortButton} ${sort.key==='ctr'?styles.active:''}`} onClick={()=>toggleSort('ctr')}>CTR {sortMark('ctr')}</button>
          <button className={`${styles.sortButton} ${sort.key==='position'?styles.active:''}`} onClick={()=>toggleSort('position')}>Position {sortMark('position')}</button>
          <button className={`${styles.sortButton} ${sort.key==='priority'?styles.active:''}`} onClick={()=>toggleSort('priority')}>Priority {sortMark('priority')}</button>
          <span>Trend</span><span>Position bucket</span><span>SEO signal</span>
        </div>
        {rows.map(row=><div className={styles.row} key={row.query}>
          <strong className={styles.query} title={row.query}>{row.query}</strong>
          {row.page?<a className={styles.pageLink} href={row.page} target="_blank" rel="noreferrer" title={row.page}><span>{pathOnly(row.page)}</span>{row.pageCount>1&&<small>+{row.pageCount-1} page{row.pageCount>2?'s':''}</small>}<ExternalLink size={11}/></a>:<span className={styles.muted}>No page row</span>}
          <span className={styles.metric}>{number(row.clicks)}</span><span className={styles.metric}>{number(row.impressions)}</span><span className={styles.metric}>{pct(row.ctr)}</span><span className={styles.metric}>{pos(row.position)}</span><span className={styles.priorityMetric}>{row.priority}</span>
          <span className={`${styles.pill} ${trendTone(row.trend)}`}>{row.trend}</span><span className={`${styles.pill} ${bucketTone(row.bucket)}`}>{row.bucket}</span><span className={`${styles.pill} ${signalTone(row.signal)}`}>{row.signal}</span>
        </div>)}
        {!rows.length&&<div className={styles.empty}><strong>No queries match this filter</strong><span>Change the search or opportunity filter.</span></div>}
      </div></div>:<div className={styles.empty}><strong>No GSC query data yet</strong><span>Search Console will populate this view after impressions are recorded.</span></div>}

      <div className={styles.legend}><b>Trend:</b><span>latest 7 days vs prior 21-day weekly baseline.</span><b>Priority:</b><span>0–100 opportunity score, not a ranking score.</span><b>Quick win:</b><span>3+ impressions + position 1–20.</span><b>Primary landing page:</b><span>query/page row with the most impressions; multiple ranking pages are flagged.</span></div>
    </section>
  </div>,host);
}
