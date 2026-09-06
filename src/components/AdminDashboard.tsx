'use client';

import {
  Activity, BarChart3, ChevronRight, CircleAlert, Cloud, ExternalLink, FileSearch,
  Gauge, Globe2, LayoutDashboard, Link2, ListChecks, RefreshCw, Search, Settings,
  ShieldCheck, Sparkles, TrendingDown, TrendingUp, Unplug, UsersRound, X, CheckCircle2, Clock3, ServerCog
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type View='overview'|'indexing'|'opportunities'|'pages'|'queries'|'countries'|'errors'|'integrations'|'settings';
type Status='Open'|'In progress'|'Done'|'Ignored';

type IntegrationStatus={configured:boolean;siteUrl?:string|null;propertyId?:string|null;missing?:string[]};
type AdminStatus={
  mode:string;
  domain:string;
  sitemapUrl:string;
  sitemapUrls:number|null;
  integrations:{
    gsc:IntegrationStatus;
    ga4:IntegrationStatus;
    cloudflare:IntegrationStatus;
    bing:IntegrationStatus;
  };
};

type MetricRow={
  clicks:number;
  impressions:number;
  ctr:number;
  position:number;
};
type PageRow=MetricRow&{page:string};
type QueryRow=MetricRow&{query:string};
type CountryRow=MetricRow&{country:string};
type TrendRow=MetricRow&{date:string};
type QueryPageRow=MetricRow&{query:string;page:string};

type GscData={
  connected:true;
  source:string;
  siteUrl:string;
  range:string;
  window:{startDate:string;endDate:string;previousStartDate:string;previousEndDate:string};
  summary:MetricRow&{changes:{clicks:number;impressions:number;ctr:number;position:number}};
  pages:PageRow[];
  queries:QueryRow[];
  countries:CountryRow[];
  trend:TrendRow[];
  queryPages:QueryPageRow[];
  fetchedAt:string;
};

type Ga4Data={
  connected:true;
  source:string;
  propertyId:string;
  range:string;
  window:{startDate:string;endDate:string;previousStartDate:string;previousEndDate:string};
  summary:{
    users:number;
    sessions:number;
    pageViews:number;
    engagedSessions:number;
    engagementRate:number;
    averageSessionDuration:number;
    changes:{users:number;sessions:number;pageViews:number;engagementRate:number};
  };
  landingPages:{page:string;sessions:number;users:number;pageViews:number;engagementRate:number}[];
  countries:{country:string;users:number;sessions:number;pageViews:number}[];
  events:{event:string;count:number;users:number}[];
  trend:{date:string;users:number;sessions:number;pageViews:number}[];
  fetchedAt:string;
};

type BingData={
  connected:true;
  source:string;
  siteUrl:string;
  range:string;
  window:{startDate:string;endDate:string;previousStartDate:string;previousEndDate:string};
  summary:{clicks:number;impressions:number;ctr:number;indexedPages:number;crawledPages:number;crawlErrors:number;inLinks:number};
  trend:{date:string;clicks:number;impressions:number}[];
  pages:{page:string;clicks:number;impressions:number;avgPosition:number}[];
  queries:{query:string;clicks:number;impressions:number;avgPosition:number}[];
  crawl:{date:string|null;code2xx:number;code301:number;code302:number;code4xx:number;code5xx:number;blockedByRobotsTxt:number;dnsFailures:number;connectionTimeout:number;containsMalware:number}|null;
  fetchedAt:string;
};

type CloudflareData={
  connected:true;
  source:string;
  window:{start:string;end:string;label:string};
  summary:{requests:number;visits:number;bandwidthBytes:number;errorRequests:number;errorRate:number};
  countries:{country:string;requests:number;visits:number;bandwidthBytes:number}[];
  paths:{path:string;requests:number;visits:number;bandwidthBytes:number}[];
  statuses:{status:number;requests:number}[];
  trend:{hour:string;requests:number;visits:number;bandwidthBytes:number}[];
  fetchedAt:string;
};

type IndexInspectionRow={
  url:string;
  verdict:string;
  indexed:boolean;
  coverageState:string;
  robotsTxtState:string;
  indexingState:string;
  pageFetchState:string;
  lastCrawlTime:string|null;
  googleCanonical:string|null;
  userCanonical:string|null;
  canonicalMatch:boolean|null;
  crawledAs:string|null;
  sitemapKnown:boolean;
  referringUrls:number;
  error?:string;
};
type IndexInspectionBatch={
  connected:true;
  source:string;
  total:number;
  offset:number;
  limit:number;
  nextOffset:number|null;
  results:IndexInspectionRow[];
  fetchedAt:string;
};

type CrossPageRow={
  path:string;
  gscClicks:number;
  gscImpressions:number;
  gscPosition:number;
  ga4Sessions:number;
  ga4Users:number;
  cfRequests:number;
  bingClicks:number;
  bingImpressions:number;
};

type Opportunity={
  id:string;
  page:string;
  query:string;
  impressions:number;
  clicks:number;
  ctr:number;
  position:number;
  score:number;
  action:string;
  reason:string;
};

const nav:{id:View;label:string;icon:any}[]=[
  {id:'overview',label:'Overview',icon:LayoutDashboard},
  {id:'indexing',label:'Indexing',icon:FileSearch},
  {id:'opportunities',label:'SEO Opportunities',icon:Sparkles},
  {id:'pages',label:'Pages / Tools',icon:ListChecks},
  {id:'queries',label:'Queries',icon:Search},
  {id:'countries',label:'Countries',icon:Globe2},
  {id:'errors',label:'Errors',icon:CircleAlert},
  {id:'integrations',label:'Integrations',icon:Unplug},
  {id:'settings',label:'Settings',icon:Settings},
];

const number=(value:number)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value);
const pct=(value:number)=>`${(value*100).toFixed(2)}%`;
const pos=(value:number)=>value?value.toFixed(1):'—';

function Pill({children,tone='neutral'}:{children:React.ReactNode;tone?:string}){
  return <span className={'adminPill '+tone}>{children}</span>;
}
function Trend({value}:{value:number}){
  const up=value>=0;
  return <span className={up?'trend positive':'trend negative'}>{up?<TrendingUp size={13}/>:<TrendingDown size={13}/>} {Math.abs(value).toFixed(1)}%</span>;
}
function Metric({label,value,change,icon:Icon,sub}:{label:string;value:string;change?:number;icon:any;sub?:string}){
  return <div className="adminMetric">
    <div className="adminMetricTop"><span>{label}</span><Icon size={17}/></div>
    <strong>{value}</strong>
    {typeof change==='number'?<Trend value={change}/>:<small>{sub||'Waiting for live source'}</small>}
  </div>;
}
function EmptyState({title,body,action}:{title:string;body:string;action?:React.ReactNode}){
  return <div className="adminEmptyState"><Unplug size={22}/><strong>{title}</strong><p>{body}</p>{action}</div>;
}

function opportunityFor(row:QueryPageRow,index:number):Opportunity|null{
  if(!row.query||!row.page||row.impressions<5)return null;
  let score=0;
  score+=Math.min(42,Math.log10(row.impressions+1)*10);
  if(row.position>=4&&row.position<=10)score+=26;
  else if(row.position>10&&row.position<=20)score+=30;
  else if(row.position>20&&row.position<=50)score+=15;
  if(row.ctr<.01)score+=20;
  else if(row.ctr<.02)score+=12;

  let action='Strengthen relevance';
  let reason='This query already has measurable impressions and can be improved with stronger page relevance and internal links.';
  if(row.position>=8&&row.position<=20&&row.ctr<.015){
    action='Improve title / query match';
    reason='The page is close to stronger visibility but CTR is low for its current position.';
  }else if(row.position>10&&row.position<=20){
    action='Push into top 10';
    reason='The query is ranking on the edge of page one / page two and already has search demand.';
  }else if(row.position>=4&&row.position<10){
    action='Quick-win optimization';
    reason='The page already ranks on page one; focused title, copy and internal-link improvements may unlock more clicks.';
  }else if(row.position>20&&row.impressions>=50){
    action='Build query-specific depth';
    reason='Google is testing the page for this query, but relevance is not yet strong enough.';
  }
  return {
    id:`gsc-${index}-${row.query}-${row.page}`,
    page:row.page,
    query:row.query,
    impressions:row.impressions,
    clicks:row.clicks,
    ctr:row.ctr,
    position:row.position,
    score:Math.min(100,Math.round(score)),
    action,
    reason,
  };
}

export function AdminDashboard(){
  const [view,setView]=useState<View>('overview');
  const [range,setRange]=useState('28d');
  const [status,setStatus]=useState<AdminStatus|null>(null);
  const [gsc,setGsc]=useState<GscData|null>(null);
  const [ga4,setGa4]=useState<Ga4Data|null>(null);
  const [cloudflare,setCloudflare]=useState<CloudflareData|null>(null);
  const [bing,setBing]=useState<BingData|null>(null);
  const [indexing,setIndexing]=useState<IndexInspectionRow[]>([]);
  const [indexingScannedAt,setIndexingScannedAt]=useState<string|null>(null);
  const [indexingProgress,setIndexingProgress]=useState({done:0,total:0});
  const [loading,setLoading]=useState(true);
  const [gscLoading,setGscLoading]=useState(false);
  const [ga4Loading,setGa4Loading]=useState(false);
  const [cloudflareLoading,setCloudflareLoading]=useState(false);
  const [bingLoading,setBingLoading]=useState(false);
  const [indexingLoading,setIndexingLoading]=useState(false);
  const [error,setError]=useState('');
  const [filter,setFilter]=useState('');
  const [selected,setSelected]=useState<Opportunity|null>(null);
  const [statuses,setStatuses]=useState<Record<string,Status>>({});
  const [notes,setNotes]=useState<Record<string,string>>({});

  useEffect(()=>{
    try{
      setStatuses(JSON.parse(localStorage.getItem('toolmera-admin-statuses')||'{}'));
      setNotes(JSON.parse(localStorage.getItem('toolmera-admin-notes')||'{}'));
      const cached=JSON.parse(localStorage.getItem('toolmera-indexing-scan-v1')||'null') as {scannedAt?:string;results?:IndexInspectionRow[]}|null;
      if(cached?.results?.length){
        setIndexing(cached.results);
        setIndexingScannedAt(cached.scannedAt||null);
        setIndexingProgress({done:cached.results.length,total:cached.results.length});
      }
    }catch{}
  },[]);
  useEffect(()=>{if(Object.keys(statuses).length)localStorage.setItem('toolmera-admin-statuses',JSON.stringify(statuses))},[statuses]);
  useEffect(()=>{if(Object.keys(notes).length)localStorage.setItem('toolmera-admin-notes',JSON.stringify(notes))},[notes]);

  const loadStatus=useCallback(async()=>{
    try{
      const response=await fetch('/api/admin/status',{cache:'no-store'});
      if(!response.ok)throw new Error('Admin API is not available yet.');
      const data=await response.json() as AdminStatus;
      setStatus(data);
      return data;
    }catch(e){
      setError(e instanceof Error?e.message:'Could not load admin API status.');
      return null;
    }finally{setLoading(false)}
  },[]);

  const loadGsc=useCallback(async(nextRange=range)=>{
    setGscLoading(true);
    try{
      const response=await fetch('/api/admin/gsc?range='+encodeURIComponent(nextRange),{cache:'no-store'});
      if(response.status===503){setGsc(null);return}
      const data=await response.json() as GscData|{detail?:string;message?:string};
      if(!response.ok)throw new Error('detail' in data&&data.detail?data.detail:'Could not load Search Console data.');
      setGsc(data as GscData);setError('');
    }catch(e){
      setGsc(null);setError(e instanceof Error?e.message:'Could not load Search Console data.');
    }finally{setGscLoading(false)}
  },[range]);

  const loadGa4=useCallback(async(nextRange=range)=>{
    setGa4Loading(true);
    try{
      const response=await fetch('/api/admin/ga4?range='+encodeURIComponent(nextRange),{cache:'no-store'});
      if(response.status===503){setGa4(null);return}
      const data=await response.json() as Ga4Data|{detail?:string;message?:string};
      if(!response.ok)throw new Error('detail' in data&&data.detail?data.detail:'Could not load Google Analytics data.');
      setGa4(data as Ga4Data);setError('');
    }catch(e){
      setGa4(null);setError(e instanceof Error?e.message:'Could not load Google Analytics data.');
    }finally{setGa4Loading(false)}
  },[range]);

  const loadCloudflare=useCallback(async()=>{
    setCloudflareLoading(true);
    try{
      const response=await fetch('/api/admin/cloudflare',{cache:'no-store'});
      if(response.status===503){setCloudflare(null);return}
      const data=await response.json() as CloudflareData|{detail?:string;message?:string};
      if(!response.ok)throw new Error('detail' in data&&data.detail?data.detail:'Could not load Cloudflare Analytics data.');
      setCloudflare(data as CloudflareData);setError('');
    }catch(e){
      setCloudflare(null);setError(e instanceof Error?e.message:'Could not load Cloudflare Analytics data.');
    }finally{setCloudflareLoading(false)}
  },[]);

  const loadBing=useCallback(async(nextRange=range)=>{
    setBingLoading(true);
    try{
      const response=await fetch('/api/admin/bing?range='+encodeURIComponent(nextRange),{cache:'no-store'});
      if(response.status===503){setBing(null);return}
      const data=await response.json() as BingData|{detail?:string;message?:string};
      if(!response.ok)throw new Error('detail' in data&&data.detail?data.detail:'Could not load Bing Webmaster data.');
      setBing(data as BingData);setError('');
    }catch(e){
      setBing(null);setError(e instanceof Error?e.message:'Could not load Bing Webmaster data.');
    }finally{setBingLoading(false)}
  },[range]);

  const runIndexingScan=useCallback(async()=>{
    setIndexingLoading(true);
    setError('');
    setIndexing([]);
    setIndexingProgress({done:0,total:0});
    try{
      let offset=0;
      let total=0;
      const collected:IndexInspectionRow[]=[];
      while(true){
        const response=await fetch('/api/admin/indexing?offset='+offset+'&limit=10',{cache:'no-store'});
        const data=await response.json() as IndexInspectionBatch|{detail?:string;message?:string};
        if(!response.ok)throw new Error('detail' in data&&data.detail?data.detail:'Could not load URL Inspection data.');
        const batch=data as IndexInspectionBatch;
        total=batch.total;
        collected.push(...batch.results);
        setIndexing([...collected]);
        setIndexingProgress({done:collected.length,total});
        if(batch.nextOffset==null)break;
        offset=batch.nextOffset;
      }
      const scannedAt=new Date().toISOString();
      setIndexingScannedAt(scannedAt);
      localStorage.setItem('toolmera-indexing-scan-v1',JSON.stringify({scannedAt,results:collected}));
    }catch(e){
      setError(e instanceof Error?e.message:'Could not inspect sitemap URLs.');
    }finally{
      setIndexingLoading(false);
    }
  },[]);

  useEffect(()=>{
    (async()=>{
      const s=await loadStatus();
      const jobs:Promise<unknown>[]=[];
      if(s?.integrations.gsc.configured)jobs.push(loadGsc(range));
      if(s?.integrations.ga4.configured)jobs.push(loadGa4(range));
      if(s?.integrations.cloudflare.configured)jobs.push(loadCloudflare());
      if(s?.integrations.bing.configured)jobs.push(loadBing(range));
      await Promise.all(jobs);
    })();
  },[loadStatus,loadGsc,loadGa4,loadCloudflare,loadBing,range]);

  const refresh=async()=>{
    setError('');
    const s=await loadStatus();
    const jobs:Promise<unknown>[]=[];
    if(s?.integrations.gsc.configured)jobs.push(loadGsc(range));
    if(s?.integrations.ga4.configured)jobs.push(loadGa4(range));
    if(s?.integrations.cloudflare.configured)jobs.push(loadCloudflare());
    if(s?.integrations.bing.configured)jobs.push(loadBing(range));
    await Promise.all(jobs);
  };

  const opportunities=useMemo(()=>gsc?.queryPages.map(opportunityFor).filter(Boolean).sort((a,b)=>(b?.score||0)-(a?.score||0)).slice(0,50) as Opportunity[]||[],[gsc]);
  const pages=useMemo(()=>gsc?.pages.filter(p=>p.page.toLowerCase().includes(filter.toLowerCase()))||[],[gsc,filter]);
  const queries=useMemo(()=>gsc?.queries.filter(q=>q.query.toLowerCase().includes(filter.toLowerCase()))||[],[gsc,filter]);
  const maxTrend=Math.max(1,...(gsc?.trend.map(r=>r.impressions)||[1]));
  const pathOnly=(value:string)=>{
    if(!value)return '/';
    try{return new URL(value,'https://toolmera.com').pathname||'/'}
    catch{return value.split('?')[0]||'/'}
  };
  const crossPages=useMemo(()=>{
    const map=new Map<string,CrossPageRow>();
    const ensure=(path:string)=>{
      const key=pathOnly(path);
      if(!map.has(key))map.set(key,{path:key,gscClicks:0,gscImpressions:0,gscPosition:0,ga4Sessions:0,ga4Users:0,cfRequests:0,bingClicks:0,bingImpressions:0});
      return map.get(key)!;
    };
    gsc?.pages.forEach(row=>{const item=ensure(row.page);item.gscClicks=row.clicks;item.gscImpressions=row.impressions;item.gscPosition=row.position});
    ga4?.landingPages.forEach(row=>{const item=ensure(row.page);item.ga4Sessions=row.sessions;item.ga4Users=row.users});
    cloudflare?.paths.forEach(row=>{const item=ensure(row.path);item.cfRequests=row.requests});
    bing?.pages.forEach(row=>{const item=ensure(row.page);item.bingClicks=row.clicks;item.bingImpressions=row.impressions});
    return [...map.values()].filter(row=>!row.path.startsWith('/admin')).sort((a,b)=>(b.gscImpressions+b.ga4Sessions+b.cfRequests+b.bingImpressions)-(a.gscImpressions+a.ga4Sessions+a.cfRequests+a.bingImpressions));
  },[gsc,ga4,cloudflare,bing]);

  const indexingSummary=useMemo(()=>{
    const inspected=indexing.filter(row=>!row.error).length;
    const indexed=indexing.filter(row=>row.indexed&&!row.error).length;
    const notIndexed=indexing.filter(row=>!row.indexed&&!row.error).length;
    const canonicalIssues=indexing.filter(row=>row.canonicalMatch===false&&!row.error).length;
    const fetchIssues=indexing.filter(row=>row.pageFetchState!=='SUCCESSFUL'&&!row.error).length;
    return {inspected,indexed,notIndexed,canonicalIssues,fetchIssues};
  },[indexing]);

  const integrationsLive=[Boolean(gsc),Boolean(ga4),Boolean(cloudflare),Boolean(bing)].filter(Boolean).length;
  const systemHealth=error?'Degraded':integrationsLive===4?'Operational':'Connecting';
  const technicalWarnings=[
    cloudflare&&cloudflare.summary.errorRate>.02?'Cloudflare edge error rate is '+pct(cloudflare.summary.errorRate):null,
    bing&&bing.summary.crawlErrors>0?'Bing reports '+number(bing.summary.crawlErrors)+' crawl errors':null,
    indexingSummary.fetchIssues>0?'Google inspection found '+number(indexingSummary.fetchIssues)+' fetch issues':null,
    indexingSummary.canonicalIssues>0?'Google inspection found '+number(indexingSummary.canonicalIssues)+' canonical mismatches':null,
  ].filter(Boolean) as string[];

  const sourceState=(key:keyof AdminStatus['integrations'])=>{
    const configured=status?.integrations[key]?.configured;
    if(key==='gsc'&&gsc)return <Pill tone="green">Live</Pill>;
    if(key==='ga4'&&ga4)return <Pill tone="green">Live</Pill>;
    if(key==='cloudflare'&&cloudflare)return <Pill tone="green">Live</Pill>;
    if(key==='bing'&&bing)return <Pill tone="green">Live</Pill>;
    return configured?<Pill tone="blue">Configured</Pill>:<Pill>Not connected</Pill>;
  };

  const summary=gsc?.summary;
  const sourceCards=[
    ['Google Search Console','Search clicks, impressions, CTR, pages, queries and countries.','gsc'],
    ['Google Analytics 4','Users, sessions, engagement, events and landing pages.','ga4'],
    ['Cloudflare Analytics','Requests, edge errors, bandwidth and traffic health.','cloudflare'],
    ['Bing Webmaster Tools','Bing search and indexing data.','bing'],
  ] as const;

  return <div className="adminApp">
    <aside className="adminSidebar">
      <div className="adminBrand"><span className="adminBrandMark">A</span><div><strong>TOOLMERA</strong><small>SEO Intelligence</small></div></div>
      <div className={systemHealth==='Operational'?'adminDemo adminLive':'adminDemo'}><span></span>{systemHealth==='Operational'?' System operational':systemHealth==='Degraded'?' Attention required':' Connecting sources'}</div>
      <nav>{nav.map(item=>{const Icon=item.icon;return <button key={item.id} className={view===item.id?'active':''} onClick={()=>setView(item.id)}><Icon size={17}/><span>{item.label}</span></button>})}</nav>
      <div className="adminSidebarFoot"><ShieldCheck size={16}/><div><strong>Private dashboard</strong><span>/admin/ · noindex</span></div></div>
    </aside>

    <main className="adminMain">
      <header className="adminTopbar">
        <div><span className="adminKicker">TOOLMERA.COM</span><h1>{nav.find(n=>n.id===view)?.label}</h1></div>
        <div className="adminTopActions">
          <div className={systemHealth==='Operational'?'adminSourceStatus live':'adminSourceStatus'}><span></span>{systemHealth==='Operational'?'All systems live':systemHealth==='Degraded'?'System attention':integrationsLive+'/4 sources live'}</div>
          <select value={range} onChange={e=>setRange(e.target.value)} disabled={gscLoading||ga4Loading||cloudflareLoading||bingLoading}><option value="today">Latest day</option><option value="7d">7 days</option><option value="28d">28 days</option><option value="3m">3 months</option></select>
          <button className="adminRefresh" onClick={refresh} disabled={gscLoading||ga4Loading||cloudflareLoading||bingLoading||loading}><RefreshCw size={14} className={(gscLoading||ga4Loading||cloudflareLoading||bingLoading)?'spinIcon':''}/> Refresh</button>
          <a href="https://toolmera.com/" target="_blank" rel="noreferrer">Open site <ExternalLink size={14}/></a>
        </div>
      </header>

      {error&&<div className="adminApiError"><CircleAlert size={16}/><span>{error}</span></div>}

      {view==='overview'&&<>
        <section className="adminMetrics">
          <Metric label="Organic clicks" value={summary?number(summary.clicks):'—'} change={summary?.changes.clicks} icon={Search}/>
          <Metric label="Impressions" value={summary?number(summary.impressions):'—'} change={summary?.changes.impressions} icon={BarChart3}/>
          <Metric label="CTR" value={summary?pct(summary.ctr):'—'} change={summary?.changes.ctr} icon={Gauge}/>
          <Metric label="Avg position" value={summary?pos(summary.position):'—'} icon={TrendingUp} sub={gsc?'Final GSC data':'Connect Search Console'}/>
          <Metric label="Users" value={ga4?number(ga4.summary.users):'—'} change={ga4?.summary.changes.users} icon={UsersRound} sub={status?.integrations.ga4.configured?'Waiting for GA4 data':'Connect GA4'}/>
          <Metric label="Sessions" value={ga4?number(ga4.summary.sessions):'—'} change={ga4?.summary.changes.sessions} icon={Activity} sub={status?.integrations.ga4.configured?'Waiting for GA4 data':'Connect GA4'}/>
          <Metric label="Sitemap URLs" value={status?.sitemapUrls!=null?number(status.sitemapUrls):'—'} icon={FileSearch} sub="Live sitemap count"/>
          <Metric label="Google indexed" value={indexingSummary.inspected?number(indexingSummary.indexed):'—'} icon={Link2} sub={indexingSummary.inspected?number(indexingSummary.inspected)+' inspected · cached':'Run URL Inspection scan'}/>
        </section>

        <section className="adminGrid adminGridMain">
          <div className="adminPanel adminChartPanel">
            <div className="adminPanelHead"><div><span>GOOGLE SEARCH CONSOLE</span><h2>Organic performance</h2></div>{gsc?<Pill tone="green">Live</Pill>:<Pill>Not connected</Pill>}</div>
            {gsc&&gsc.trend.length?<><div className="adminChart">{gsc.trend.map(row=><i key={row.date} title={`${row.date}: ${number(row.impressions)} impressions`} style={{height:Math.max(5,(row.impressions/maxTrend)*100)+'%'}}/>)}</div><div className="adminChartLegend"><span><b className="blueDot"></b> Impressions by day</span><span>{gsc.window.startDate} → {gsc.window.endDate}</span></div></>:<EmptyState title="No Search Console data yet" body="Finish GSC verification, then connect the Google service account to replace this empty state with live search performance." action={<button className="adminSecondary" onClick={()=>setView('integrations')}>Open integrations <ChevronRight size={15}/></button>}/>}
          </div>

          <div className="adminPanel">
            <div className="adminPanelHead"><div><span>SOURCES</span><h2>Integration status</h2></div></div>
            <div className="sourceList">{sourceCards.map(([name,,key])=><div key={key}><span>{status?.integrations[key]?.configured?<Cloud size={15}/>:<Unplug size={15}/>} {name}</span>{sourceState(key)}</div>)}</div>
            <button className="adminSecondary" onClick={()=>setView('integrations')}>Configure integrations <ChevronRight size={15}/></button>
          </div>
        </section>

        <section className="adminGrid adminGridMain">
          <div className="adminPanel">
            <div className="adminPanelHead"><div><span>GOOGLE ANALYTICS 4</span><h2>Traffic & engagement</h2></div>{ga4?<Pill tone="green">Live</Pill>:status?.integrations.ga4.configured?<Pill tone="blue">Configured</Pill>:<Pill>Not connected</Pill>}</div>
            {ga4?<div className="compactTable">
              <div><span>Page views</span><strong>{number(ga4.summary.pageViews)}</strong><span>{(ga4.summary.engagementRate*100).toFixed(1)}% engagement</span></div>
              <div><span>Engaged sessions</span><strong>{number(ga4.summary.engagedSessions)}</strong><span>{Math.round(ga4.summary.averageSessionDuration)}s avg session</span></div>
              {ga4.events.filter(e=>['tool_action','file_download','copy_result','search_used'].includes(e.event)).slice(0,4).map(e=><div key={e.event}><span>{e.event}</span><strong>{number(e.count)}</strong><span>{number(e.users)} users</span></div>)}
            </div>:<EmptyState title="Waiting for GA4" body="Once the GA4 Data API is available to the service account, users, sessions, landing pages and Toolmera events appear here automatically."/>}
          </div>
          <div className="adminPanel">
            <div className="adminPanelHead"><div><span>GA4 LANDING PAGES</span><h2>Top user entry pages</h2></div>{ga4?<Pill tone="green">Live</Pill>:<Pill>Pending</Pill>}</div>
            {ga4&&ga4.landingPages.length?<div className="compactTable">{ga4.landingPages.slice(0,8).map(p=><div key={p.page}><span>{p.page}</span><strong>{number(p.sessions)} sessions</strong><span>{number(p.users)} users</span></div>)}</div>:<EmptyState title="No landing-page data yet" body="This site is new, so the table can remain empty until Analytics has collected traffic."/>}
          </div>
        </section>

        <section className="adminGrid adminGridMain">
          <div className="adminPanel">
            <div className="adminPanelHead"><div><span>CLOUDFLARE EDGE</span><h2>Traffic health · last 24h</h2></div>{cloudflare?<Pill tone="green">Live</Pill>:status?.integrations.cloudflare.configured?<Pill tone="blue">Configured</Pill>:<Pill>Not connected</Pill>}</div>
            {cloudflare?<div className="compactTable">
              <div><span>Edge requests</span><strong>{number(cloudflare.summary.requests)}</strong><span>{number(cloudflare.summary.visits)} visits</span></div>
              <div><span>Bandwidth</span><strong>{(cloudflare.summary.bandwidthBytes/1024/1024).toFixed(1)} MB</strong><span>{pct(cloudflare.summary.errorRate)} error rate</span></div>
              <div><span>4xx / 5xx requests</span><strong>{number(cloudflare.summary.errorRequests)}</strong><span>HTTP edge responses</span></div>
            </div>:<EmptyState title="Connect Cloudflare Analytics" body="Add a read-only Cloudflare Analytics API token and the Toolmera Zone ID to see edge requests, bandwidth, top paths and response errors." action={<button className="adminSecondary" onClick={()=>setView('integrations')}>Open integrations <ChevronRight size={15}/></button>}/>}
          </div>
          <div className="adminPanel">
            <div className="adminPanelHead"><div><span>TOP EDGE PATHS</span><h2>Most requested URLs</h2></div>{cloudflare?<Pill tone="green">Live</Pill>:<Pill>Pending</Pill>}</div>
            {cloudflare&&cloudflare.paths.length?<div className="compactTable">{cloudflare.paths.slice(0,8).map(p=><div key={p.path}><span>{p.path}</span><strong>{number(p.requests)} requests</strong><span>{number(p.visits)} visits</span></div>)}</div>:<EmptyState title="No Cloudflare path data yet" body="This panel will populate after the Cloudflare Analytics connection is live."/ >}
          </div>
        </section>

        <section className="adminGrid adminGridMain">
          <div className="adminPanel">
            <div className="adminPanelHead"><div><span>BING WEBMASTER TOOLS</span><h2>Bing search performance</h2></div>{bing?<Pill tone="green">Live</Pill>:status?.integrations.bing.configured?<Pill tone="blue">Configured</Pill>:<Pill>Not connected</Pill>}</div>
            {bing?<div className="compactTable">
              <div><span>Clicks</span><strong>{number(bing.summary.clicks)}</strong><span>{number(bing.summary.impressions)} impressions</span></div>
              <div><span>Indexed pages</span><strong>{number(bing.summary.indexedPages)}</strong><span>{number(bing.summary.crawledPages)} crawled</span></div>
              <div><span>Crawl errors</span><strong>{number(bing.summary.crawlErrors)}</strong><span>{number(bing.summary.inLinks)} inbound links</span></div>
            </div>:<EmptyState title="Connect Bing Webmaster Tools" body="Import toolmera.com from Google Search Console in Bing, generate an API key, and add it as BING_API_KEY to Cloudflare."/>}
          </div>
          <div className="adminPanel">
            <div className="adminPanelHead"><div><span>BING TOP QUERIES</span><h2>Search demand</h2></div>{bing?<Pill tone="green">Live</Pill>:<Pill>Pending</Pill>}</div>
            {bing&&bing.queries.length?<div className="compactTable">{bing.queries.slice(0,8).map(q=><div key={q.query}><span>{q.query}</span><strong>{number(q.impressions)} imp.</strong><span>Pos. {q.avgPosition?q.avgPosition.toFixed(1):'—'}</span></div>)}</div>:<EmptyState title="No Bing query data yet" body="Bing typically needs time after verification before search-performance rows appear."/ >}
          </div>
        </section>

        <section className="adminGrid adminGridMain">
          <div className="adminPanel"><div className="adminPanelHead"><div><span>LANDING PAGES</span><h2>Top pages</h2></div><button className="textButton" onClick={()=>setView('pages')}>View all</button></div>
            {gsc&&gsc.pages.length?<div className="compactTable">{gsc.pages.slice(0,8).map(p=><div key={p.page}><span>{p.page.replace('https://toolmera.com','')}</span><strong>{number(p.clicks)} clicks</strong><span>{pos(p.position)} pos.</span></div>)}</div>:<EmptyState title="Waiting for GSC" body="Top landing pages will appear here once live Search Console data is connected."/>}
          </div>
          <div className="adminPanel"><div className="adminPanelHead"><div><span>ACTION QUEUE</span><h2>SEO opportunities</h2></div><button className="textButton" onClick={()=>setView('opportunities')}>View all</button></div>
            {opportunities.length?<div className="opportunityMini">{opportunities.slice(0,5).map(o=><button key={o.id} onClick={()=>{setView('opportunities');setSelected(o)}}><b>{o.score}</b><span><strong>{o.action}</strong><small>{o.query}</small></span><ChevronRight size={15}/></button>)}</div>:<EmptyState title="No calculated opportunities yet" body="Opportunity scoring starts automatically from real GSC query + page data. Nothing is fabricated."/>}
          </div>
        </section>
      </>}

      {view==='indexing'&&<>
        <section className="adminMetrics indexMetrics">
          <Metric label="Sitemap URLs" value={status?.sitemapUrls!=null?number(status.sitemapUrls):'—'} icon={FileSearch} sub="Read live from sitemap.xml"/>
          <Metric label="Google indexed" value={indexingSummary.inspected?number(indexingSummary.indexed):'—'} icon={Link2} sub={indexingSummary.inspected?number(indexingSummary.inspected)+' inspected':'Run inspection scan'}/>
          <Metric label="Not indexed" value={indexingSummary.inspected?number(indexingSummary.notIndexed):'—'} icon={CircleAlert} sub="Google URL Inspection verdict"/>
          <Metric label="Canonical issues" value={indexingSummary.inspected?number(indexingSummary.canonicalIssues):'—'} icon={Link2} sub="Declared vs Google canonical"/>
        </section>

        <section className="adminPanel indexingControlPanel">
          <div className="adminPanelHead"><div><span>GOOGLE URL INSPECTION</span><h2>Live sitemap inspection</h2></div>{indexingLoading?<Pill tone="blue">Scanning</Pill>:indexingSummary.inspected?<Pill tone="green">Cached live scan</Pill>:<Pill tone="amber">Not scanned</Pill>}</div>
          <div className="indexingControlRow">
            <div><strong>Inspect every canonical URL in sitemap.xml</strong><p>The scan checks Google&apos;s indexed version, crawl/fetch state and canonical selection. Results are cached in this browser to avoid wasting API quota.</p>{indexingScannedAt&&<small>Last scan: {new Date(indexingScannedAt).toLocaleString()}</small>}</div>
            <button className="adminPrimary inspectionButton" onClick={runIndexingScan} disabled={indexingLoading}><FileSearch size={15}/>{indexingLoading?'Inspecting…':indexingSummary.inspected?'Refresh inspection':'Run live inspection'}</button>
          </div>
          {indexingLoading&&<div className="inspectionProgress"><div><span style={{width:(indexingProgress.total?Math.min(100,indexingProgress.done/indexingProgress.total*100):3)+'%'}}/></div><small>{indexingProgress.done} / {indexingProgress.total||status?.sitemapUrls||'…'} URLs inspected</small></div>}
        </section>

        <section className="adminPanel indexingTablePanel">
          <div className="adminPanelHead"><div><span>INDEX COVERAGE</span><h2>URL-level diagnostics</h2></div>{indexingSummary.fetchIssues?<Pill tone="amber">{indexingSummary.fetchIssues} fetch issues</Pill>:indexingSummary.inspected?<Pill tone="green">Fetch healthy</Pill>:<Pill>Waiting</Pill>}</div>
          {indexing.length?<div className="inspectionTable">
            <div className="inspectionHead"><span>URL</span><span>Verdict</span><span>Coverage</span><span>Fetch</span><span>Canonical</span><span>Last crawl</span></div>
            {indexing.map(row=><div key={row.url} className={row.error?'inspectionError':''}>
              <strong>{row.url.replace('https://toolmera.com','')||'/'}</strong>
              <span><Pill tone={row.indexed?'green':row.verdict==='ERROR'?'red':'amber'}>{row.error?'Error':row.indexed?'Indexed':row.verdict}</Pill></span>
              <span title={row.coverageState}>{row.coverageState}</span>
              <span>{row.pageFetchState==='SUCCESSFUL'?<Pill tone="green">Successful</Pill>:<Pill tone="amber">{row.pageFetchState.replaceAll('_',' ')}</Pill>}</span>
              <span>{row.canonicalMatch===false?<Pill tone="amber">Mismatch</Pill>:row.googleCanonical?<Pill tone="green">Aligned</Pill>:<Pill>Unknown</Pill>}</span>
              <span>{row.lastCrawlTime?new Date(row.lastCrawlTime).toLocaleDateString():'—'}</span>
            </div>)}
          </div>:<EmptyState title="No URL Inspection scan yet" body="Run the live inspection once to populate authoritative Google index-status data for every URL in the current sitemap."/>}
        </section>
      </>}

      {view==='opportunities'&&<section className="adminPanel">
        <div className="adminPanelHead"><div><span>CALCULATED FROM LIVE GSC</span><h2>SEO opportunity queue</h2></div>{gsc?<Pill tone="green">{opportunities.length} signals</Pill>:<Pill>Waiting for GSC</Pill>}</div>
        {opportunities.length?<div className="oppList">{opportunities.map(o=>{const state=statuses[o.id]||'Open';return <button key={o.id} onClick={()=>setSelected(o)} className="oppRow"><b className="scoreRing">{o.score}</b><div className="oppMain"><strong>{o.action}</strong><span>{o.query}</span><small>{o.page.replace('https://toolmera.com','')}</small></div><div className="oppStats"><span>{number(o.impressions)} imp.</span><span>{pct(o.ctr)} CTR</span><span>Pos. {pos(o.position)}</span></div><span></span><Pill tone={state==='Done'?'green':state==='In progress'?'blue':state==='Ignored'?'neutral':'amber'}>{state}</Pill><ChevronRight size={16}/></button>})}</div>:<EmptyState title="No live opportunities yet" body="Once GSC starts returning query/page rows, Toolmera will score high-impression low-CTR and position 4–20 opportunities here."/>}
      </section>}

      {(view==='pages'||view==='queries')&&<>
        <div className="adminToolbar"><div className="adminSearch"><Search size={16}/><input value={filter} onChange={e=>setFilter(e.target.value)} placeholder={view==='pages'?'Filter live pages…':'Filter live queries…'}/></div></div>
        {view==='pages'?<section className="adminPanel">
          <div className="adminPanelHead"><div><span>CROSS-SOURCE PAGE INTELLIGENCE</span><h2>Pages / tools</h2></div><Pill tone="green">{integrationsLive}/4 live</Pill></div>
          {crossPages.length?<div className="crossPageTable"><div className="crossPageHead"><span>URL</span><span>GSC</span><span>GA4</span><span>Cloudflare</span><span>Bing</span></div>
            {crossPages.filter(row=>row.path.toLowerCase().includes(filter.toLowerCase())).map(row=><div key={row.path}><strong>{row.path}</strong><span>{number(row.gscClicks)} clicks · {number(row.gscImpressions)} imp.<small>{row.gscPosition?'Pos. '+row.gscPosition.toFixed(1):'No GSC rank yet'}</small></span><span>{number(row.ga4Sessions)} sessions<small>{number(row.ga4Users)} users</small></span><span>{number(row.cfRequests)} requests<small>Last 24h edge</small></span><span>{number(row.bingClicks)} clicks · {number(row.bingImpressions)} imp.<small>Bing weekly data</small></span></div>)}
          </div>:<EmptyState title="No page-level data yet" body="Page rows populate automatically from GSC, GA4, Cloudflare and Bing as each source collects traffic."/>}
        </section>:<>
          <section className="adminPanel"><div className="adminPanelHead"><div><span>GOOGLE SEARCH CONSOLE</span><h2>Search queries</h2></div>{gsc?<Pill tone="green">Live</Pill>:<Pill>Not connected</Pill>}</div>
            {gsc?<div className="adminTable queryTable"><div className="tableHead"><span>Query</span><span>Source</span><span>Clicks</span><span>Impressions</span><span>CTR</span><span>Position</span><span>Status</span></div>{queries.map(q=><div key={q.query}><strong>{q.query}</strong><span>GSC</span><span>{number(q.clicks)}</span><span>{number(q.impressions)}</span><span>{pct(q.ctr)}</span><span>{pos(q.position)}</span><Pill tone="green">Live</Pill></div>)}</div>:<EmptyState title="No Google query data yet" body="GSC query rows will appear automatically after Google records impressions."/>}
          </section>
          {bing&&<section className="adminPanel" style={{marginTop:14}}><div className="adminPanelHead"><div><span>BING WEBMASTER TOOLS</span><h2>Bing queries</h2></div><Pill tone="green">Live</Pill></div>{bing.queries.length?<div className="compactTable">{bing.queries.filter(q=>q.query.toLowerCase().includes(filter.toLowerCase())).slice(0,50).map(q=><div key={q.query}><span>{q.query}</span><strong>{number(q.clicks)} clicks</strong><span>{number(q.impressions)} imp. · Pos. {q.avgPosition?q.avgPosition.toFixed(1):'—'}</span></div>)}</div>:<EmptyState title="No Bing query data yet" body="Bing search-performance data is updated on its own reporting cadence."/>}</section>}
        </>}
      </>}

      {view==='countries'&&<><section className="adminPanel">
        <div className="adminPanelHead"><div><span>GOOGLE SEARCH CONSOLE</span><h2>Countries</h2></div>{gsc?<Pill tone="green">Live</Pill>:<Pill>Not connected</Pill>}</div>
        {gsc&&gsc.countries.length?<div className="countryList">{gsc.countries.map((c,i)=><div key={c.country}><b>{i+1}</b><span><strong>{c.country.toUpperCase()}</strong><small>{number(c.impressions)} impressions</small></span><span>{number(c.clicks)} clicks</span><span>{pct(c.ctr)}</span></div>)}</div>:<EmptyState title="No country data yet" body="Country-level search metrics will come directly from GSC. GA4 user/session geography will be added separately after GA4 is connected."/>}
      </section>
      {ga4&&<section className="adminPanel" style={{marginTop:14}}>
        <div className="adminPanelHead"><div><span>GOOGLE ANALYTICS 4</span><h2>User geography</h2></div><Pill tone="green">Live</Pill></div>
        {ga4.countries.length?<div className="countryList">{ga4.countries.map((c,i)=><div key={c.country}><b>{i+1}</b><span><strong>{c.country}</strong><small>{number(c.pageViews)} page views</small></span><span>{number(c.users)} users</span><span>{number(c.sessions)} sessions</span></div>)}</div>:<EmptyState title="No GA4 country data yet" body="Analytics has not collected enough traffic for country-level rows yet."/>}
      </section>}
      {cloudflare&&<section className="adminPanel" style={{marginTop:14}}>
        <div className="adminPanelHead"><div><span>CLOUDFLARE EDGE</span><h2>Request geography · last 24h</h2></div><Pill tone="green">Live</Pill></div>
        {cloudflare.countries.length?<div className="countryList">{cloudflare.countries.map((row,i)=><div key={row.country}><b>{i+1}</b><span><strong>{row.country}</strong><small>{(row.bandwidthBytes/1024/1024).toFixed(1)} MB served</small></span><span>{number(row.requests)} requests</span><span>{number(row.visits)} visits</span></div>)}</div>:<EmptyState title="No Cloudflare country data yet" body="Edge request geography will populate as traffic reaches the site."/>}
      </section>}
      </>}

      {view==='errors'&&<>
        <section className="adminHealthHero">
          <div className={systemHealth==='Operational'?'healthOrb healthy':'healthOrb attention'}>{systemHealth==='Operational'?<CheckCircle2 size={28}/>:<CircleAlert size={28}/>}</div>
          <div><span>SYSTEM HEALTH</span><h2>{systemHealth}</h2><p>{integrationsLive}/4 data sources live · {technicalWarnings.length} technical warning{technicalWarnings.length===1?'':'s'}</p></div>
          <Pill tone={systemHealth==='Operational'?'green':systemHealth==='Degraded'?'red':'amber'}>{systemHealth}</Pill>
        </section>

        <section className="healthSourceGrid">
          {[['GSC',Boolean(gsc),'Search performance API'],['GA4',Boolean(ga4),'Analytics Data API'],['Cloudflare',Boolean(cloudflare),'Edge GraphQL Analytics'],['Bing',Boolean(bing),'Webmaster API']].map(([name,live,desc])=><div key={String(name)} className="healthSourceCard"><span className={live?'healthDot live':'healthDot'}></span><div><strong>{String(name)}</strong><small>{String(desc)}</small></div><Pill tone={live?'green':'amber'}>{live?'Live':'Check'}</Pill></div>)}
        </section>

        <section className="adminGrid adminGridMain">
          <div className="adminPanel"><div className="adminPanelHead"><div><span>TECHNICAL SIGNALS</span><h2>Errors & warnings</h2></div>{technicalWarnings.length?<Pill tone="amber">{technicalWarnings.length} warnings</Pill>:<Pill tone="green">Clear</Pill>}</div>
            <div className="errorList">
              {error&&<div><Pill tone="red">API</Pill><span><strong>Admin source error</strong><small>{error}</small></span></div>}
              {technicalWarnings.map(item=><div key={item}><Pill tone="amber">Watch</Pill><span><strong>{item}</strong><small>Review the relevant source panel before changing production configuration.</small></span></div>)}
              {!error&&!technicalWarnings.length&&<div><Pill tone="green">Healthy</Pill><span><strong>No active integration or technical warnings</strong><small>All connected data sources are responding and no live threshold is currently tripped.</small></span></div>}
            </div>
          </div>
          <div className="adminPanel"><div className="adminPanelHead"><div><span>CRAWL HEALTH</span><h2>Search-engine diagnostics</h2></div></div>
            <div className="compactTable">
              <div><span>Bing crawl errors</span><strong>{bing?number(bing.summary.crawlErrors):'—'}</strong><span>{bing?number(bing.summary.crawledPages)+' crawled pages':'Waiting for Bing'}</span></div>
              <div><span>Google fetch issues</span><strong>{indexingSummary.inspected?number(indexingSummary.fetchIssues):'—'}</strong><span>{indexingSummary.inspected?number(indexingSummary.inspected)+' inspected URLs':'Run URL Inspection'}</span></div>
              <div><span>Canonical mismatches</span><strong>{indexingSummary.inspected?number(indexingSummary.canonicalIssues):'—'}</strong><span>Google vs declared canonical</span></div>
              <div><span>Cloudflare 4xx/5xx</span><strong>{cloudflare?number(cloudflare.summary.errorRequests):'—'}</strong><span>{cloudflare?pct(cloudflare.summary.errorRate)+' of edge requests':'Waiting for edge data'}</span></div>
            </div>
          </div>
        </section>
      </>}

      {view==='integrations'&&<section className="integrationGrid">{sourceCards.map(([name,desc,key])=><div className="integrationCard" key={key}><div><Cloud size={20}/>{sourceState(key)}</div><h3>{name}</h3><p>{desc}</p><span>{key==='gsc'?(status?.integrations.gsc.siteUrl||'sc-domain:toolmera.com'):key==='ga4'?(ga4?'Property 552958073 · live':'Property 552958073'):key==='cloudflare'?(cloudflare?'Last 24h edge analytics · live':'Requires Zone ID + read-only Analytics token'):key==='bing'?(bing?'toolmera.com · live':'Import from GSC + API key'):'Optional later'}</span><div className="integrationSecretList">{key==='gsc'&&<><code>GOOGLE_CLIENT_EMAIL</code><code>GOOGLE_PRIVATE_KEY</code><code>GSC_SITE_URL</code></>}{key==='ga4'&&<code>GA4_PROPERTY_ID</code>}{key==='cloudflare'&&<><code>CLOUDFLARE_ZONE_ID</code><code>CLOUDFLARE_API_TOKEN</code></>}{key==='bing'&&<code>BING_API_KEY</code>}</div></div>)}</section>}

      {view==='settings'&&<section className="adminGrid adminGridMain">
        <div className="adminPanel settingsPanel"><div className="adminPanelHead"><div><span>PROJECT</span><h2>Live configuration</h2></div></div><label>Tracked domain<input value="toolmera.com" readOnly/></label><label>GSC property<input value={status?.integrations.gsc.siteUrl||'Not connected'} readOnly/></label><label>Sitemap<input value="https://toolmera.com/sitemap.xml" readOnly/></label><label>Default report<select value={range} onChange={e=>setRange(e.target.value)}><option value="7d">7 days</option><option value="28d">28 days</option><option value="3m">3 months</option></select></label></div>
        <div className="adminPanel"><div className="adminPanelHead"><div><span>SECURITY</span><h2>Cloudflare Access</h2></div></div><div className="securityNote healthSecurity"><ShieldCheck size={24}/><div><strong>Cloudflare Access enforced</strong><p><code>/admin/*</code> and <code>/api/admin/*</code> are protected at the edge, while <code>REQUIRE_ACCESS=true</code> makes the Worker reject API requests without an Access assertion.</p></div><Pill tone="green">Protected</Pill></div></div>
      </section>}

      {selected&&<div className="adminDrawerBackdrop" onClick={()=>setSelected(null)}><aside className="adminDrawer" onClick={e=>e.stopPropagation()}><button className="drawerClose" onClick={()=>setSelected(null)}><X size={18}/></button><Pill tone="blue">Score {selected.score}/100</Pill><h2>{selected.action}</h2><p className="drawerQuery">{selected.query}</p><code>{selected.page.replace('https://toolmera.com','')}</code><div className="drawerMetrics"><div><span>Impressions</span><strong>{number(selected.impressions)}</strong></div><div><span>CTR</span><strong>{pct(selected.ctr)}</strong></div><div><span>Position</span><strong>{pos(selected.position)}</strong></div><div><span>Clicks</span><strong>{number(selected.clicks)}</strong></div></div><h3>Why this opportunity</h3><p>{selected.reason}</p><label>Status<select value={statuses[selected.id]||'Open'} onChange={e=>setStatuses({...statuses,[selected.id]:e.target.value as Status})}><option>Open</option><option>In progress</option><option>Done</option><option>Ignored</option></select></label><label>Notes<textarea value={notes[selected.id]||''} onChange={e=>setNotes({...notes,[selected.id]:e.target.value})} placeholder="Add an optimization note…"/></label><button className="adminPrimary" onClick={()=>setSelected(null)}>Save & close</button></aside></div>}
    </main>
  </div>;
}
