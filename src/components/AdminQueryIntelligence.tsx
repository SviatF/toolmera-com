'use client';

import { ExternalLink, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './AdminQueryIntelligence.module.css';

type MetricRow={clicks:number;impressions:number;ctr:number;position:number};
type QueryRow=MetricRow&{query:string};
type QueryPageRow=MetricRow&{query:string;page:string};
type GscData={
  connected:true;
  range:string;
  queries:QueryRow[];
  queryPages:QueryPageRow[];
  fetchedAt:string;
};
type SortKey='query'|'clicks'|'impressions'|'ctr'|'position'|'priority';
type SortDirection='asc'|'desc';
type QuickFilter='all'|'priority'|'3plus'|'top20'|'quick';
type OpportunityPriority='P0'|'P1'|'P2'|'Watch';
type OpportunityAction='Optimize now'|'Grow winner'|'Next'|'Watch';

type EnrichedQuery=QueryRow&{
  page:string|null;
  pageCount:number;
  bucket:'TOP 1–10'|'11–20'|'21–50'|'51+'|'No rank';
  signal:'Grow TOP 10'|'Quick win'|'Opportunity'|'Demand signal'|'Early signal';
  priority:number;
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

const number=(value:number)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value);
const pct=(value:number)=>`${(value*100).toFixed(2)}%`;
const pos=(value:number)=>value?value.toFixed(1):'—';
const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));
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

export function AdminQueryIntelligence(){
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [range,setRange]=useState('28d');
  const [data,setData]=useState<GscData|null>(null);
  const [loading,setLoading]=useState(false);
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

  const load=useCallback(async()=>{
    if(!host)return;
    setLoading(true);
    setError('');
    try{
      const response=await fetch('/api/admin/gsc?range='+encodeURIComponent(range),{cache:'no-store'});
      const json=await response.json() as GscData|{detail?:string;message?:string};
      if(!response.ok)throw new Error('detail' in json&&json.detail?json.detail:'Could not load Search Console query intelligence.');
      setData(json as GscData);
    }catch(e){
      setError(e instanceof Error?e.message:'Could not load Search Console query intelligence.');
    }finally{
      setLoading(false);
    }
  },[host,range]);

  useEffect(()=>{if(host)void load()},[host,range,load]);

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
      const matches=[...(byQuery.get(query.query.toLowerCase())||[])].sort((a,b)=>
        (b.impressions-a.impressions)||(a.position-b.position)||(b.clicks-a.clicks)
      );
      return {
        ...query,
        page:matches[0]?.page||null,
        pageCount:new Set(matches.map(row=>row.page)).size,
        bucket:bucketFor(query.position),
        signal:signalFor(query),
        priority:opportunityScore(query),
      };
    });
  },[data]);

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

  const rows=useMemo(()=>{
    const search=filter.trim().toLowerCase();
    const filtered=enriched.filter(row=>{
      const matchesSearch=!search||row.query.toLowerCase().includes(search)||(row.page||'').toLowerCase().includes(search);
      if(!matchesSearch)return false;
      if(quickFilter==='priority')return row.priority>=30;
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
  }),[enriched,pageOpportunities]);

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

    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div><span className={styles.kicker}>GOOGLE SEARCH CONSOLE · QUERY → PAGE</span><h2>Search query intelligence</h2></div>
        <div className={styles.panelActions}><button className={styles.refresh} onClick={()=>void load()} disabled={loading}>{loading?'Refreshing…':'Refresh'}</button><span className={styles.live}>Live</span></div>
      </div>

      <div className={styles.controls}>
        <div className={styles.filters}>
          {([['all','All'],['priority','Priority 30+'],['3plus','3+ impressions'],['top20','TOP 20'],['quick','Quick wins']] as [QuickFilter,string][]).map(([key,label])=><button key={key} className={`${styles.filterButton} ${quickFilter===key?styles.active:''}`} onClick={()=>setQuickFilter(key)}>{label}</button>)}
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
          <span>Position bucket</span><span>SEO signal</span>
        </div>
        {rows.map(row=><div className={styles.row} key={row.query}>
          <strong className={styles.query} title={row.query}>{row.query}</strong>
          {row.page?<a className={styles.pageLink} href={row.page} target="_blank" rel="noreferrer" title={row.page}><span>{pathOnly(row.page)}</span>{row.pageCount>1&&<small>+{row.pageCount-1} page{row.pageCount>2?'s':''}</small>}<ExternalLink size={11}/></a>:<span className={styles.muted}>No page row</span>}
          <span className={styles.metric}>{number(row.clicks)}</span><span className={styles.metric}>{number(row.impressions)}</span><span className={styles.metric}>{pct(row.ctr)}</span><span className={styles.metric}>{pos(row.position)}</span><span className={styles.priorityMetric}>{row.priority}</span>
          <span className={`${styles.pill} ${bucketTone(row.bucket)}`}>{row.bucket}</span><span className={`${styles.pill} ${signalTone(row.signal)}`}>{row.signal}</span>
        </div>)}
        {!rows.length&&<div className={styles.empty}><strong>No queries match this filter</strong><span>Change the search or opportunity filter.</span></div>}
      </div></div>:<div className={styles.empty}><strong>No GSC query data yet</strong><span>Search Console will populate this view after impressions are recorded.</span></div>}

      <div className={styles.legend}><b>Priority:</b><span>0–100 opportunity score, not a ranking score.</span><b>Quick win:</b><span>3+ impressions + position 1–20.</span><b>Primary landing page:</b><span>query/page row with the most impressions; multiple ranking pages are flagged.</span></div>
    </section>
  </div>,host);
}
