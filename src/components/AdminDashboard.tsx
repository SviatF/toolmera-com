'use client';

import {
  Activity, BarChart3, ChevronRight, CircleAlert, Cloud, ExternalLink, FileSearch,
  Gauge, Globe2, LayoutDashboard, Link2, ListChecks, RefreshCw, Search, Settings,
  ShieldCheck, Sparkles, TrendingDown, TrendingUp, Unplug, UsersRound, X
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type View='overview'|'indexing'|'opportunities'|'pages'|'queries'|'countries'|'errors'|'integrations'|'settings';
type Status='Open'|'In progress'|'Done'|'Ignored';

type IntegrationStatus={configured:boolean;siteUrl?:string|null;propertyId?:string|null};
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
  const [loading,setLoading]=useState(true);
  const [gscLoading,setGscLoading]=useState(false);
  const [error,setError]=useState('');
  const [filter,setFilter]=useState('');
  const [selected,setSelected]=useState<Opportunity|null>(null);
  const [statuses,setStatuses]=useState<Record<string,Status>>({});
  const [notes,setNotes]=useState<Record<string,string>>({});

  useEffect(()=>{
    try{
      setStatuses(JSON.parse(localStorage.getItem('toolmera-admin-statuses')||'{}'));
      setNotes(JSON.parse(localStorage.getItem('toolmera-admin-notes')||'{}'));
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

  useEffect(()=>{
    (async()=>{
      const s=await loadStatus();
      if(s?.integrations.gsc.configured)await loadGsc(range);
    })();
  },[loadStatus,loadGsc,range]);

  const refresh=async()=>{
    setError('');
    const s=await loadStatus();
    if(s?.integrations.gsc.configured)await loadGsc(range);
  };

  const opportunities=useMemo(()=>gsc?.queryPages.map(opportunityFor).filter(Boolean).sort((a,b)=>(b?.score||0)-(a?.score||0)).slice(0,50) as Opportunity[]||[],[gsc]);
  const pages=useMemo(()=>gsc?.pages.filter(p=>p.page.toLowerCase().includes(filter.toLowerCase()))||[],[gsc,filter]);
  const queries=useMemo(()=>gsc?.queries.filter(q=>q.query.toLowerCase().includes(filter.toLowerCase()))||[],[gsc,filter]);
  const maxTrend=Math.max(1,...(gsc?.trend.map(r=>r.impressions)||[1]));

  const sourceState=(key:keyof AdminStatus['integrations'])=>{
    const configured=status?.integrations[key]?.configured;
    if(key==='gsc'&&gsc)return <Pill tone="green">Live</Pill>;
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
      <div className={gsc?'adminDemo adminLive':'adminDemo'}><span></span>{gsc?' Live data':' Setup mode'}</div>
      <nav>{nav.map(item=>{const Icon=item.icon;return <button key={item.id} className={view===item.id?'active':''} onClick={()=>setView(item.id)}><Icon size={17}/><span>{item.label}</span></button>})}</nav>
      <div className="adminSidebarFoot"><ShieldCheck size={16}/><div><strong>Private dashboard</strong><span>/admin/ · noindex</span></div></div>
    </aside>

    <main className="adminMain">
      <header className="adminTopbar">
        <div><span className="adminKicker">TOOLMERA.COM</span><h1>{nav.find(n=>n.id===view)?.label}</h1></div>
        <div className="adminTopActions">
          <div className={gsc?'adminSourceStatus live':'adminSourceStatus'}><span></span>{gsc?'GSC live':status?.integrations.gsc.configured?'GSC configured':'Waiting for GSC'}</div>
          <select value={range} onChange={e=>setRange(e.target.value)} disabled={gscLoading}><option value="today">Latest day</option><option value="7d">7 days</option><option value="28d">28 days</option><option value="3m">3 months</option></select>
          <button className="adminRefresh" onClick={refresh} disabled={gscLoading||loading}><RefreshCw size={14} className={gscLoading?'spinIcon':''}/> Refresh</button>
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
          <Metric label="Organic users" value="—" icon={UsersRound} sub="Connect GA4"/>
          <Metric label="Sessions" value="—" icon={Activity} sub="Connect GA4"/>
          <Metric label="Sitemap URLs" value={status?.sitemapUrls!=null?number(status.sitemapUrls):'—'} icon={FileSearch} sub="Live sitemap count"/>
          <Metric label="Indexed URLs" value="—" icon={Link2} sub="URL Inspection integration"/>
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
          <Metric label="Sitemap URLs" value={status?.sitemapUrls!=null?number(status.sitemapUrls):'—'} icon={FileSearch} sub="Read from sitemap.xml"/>
          <Metric label="Indexed URLs" value="—" icon={Link2} sub="Requires URL Inspection API"/>
          <Metric label="Not indexed" value="—" icon={CircleAlert} sub="Requires URL Inspection API"/>
          <Metric label="Canonical issues" value="—" icon={Link2} sub="Requires URL Inspection API"/>
        </section>
        <section className="adminPanel">
          <div className="adminPanelHead"><div><span>REAL STATUS ONLY</span><h2>Indexing diagnostics</h2></div><Pill tone="amber">Pending URL Inspection</Pill></div>
          <div className="securityNote"><FileSearch size={24}/><div><strong>We are not estimating indexed pages.</strong><p>The Search Analytics API does not provide authoritative bulk index coverage. This section stays empty until URL Inspection / Search Console indexing data is connected, so the dashboard never invents coverage numbers.</p></div></div>
        </section>
      </>}

      {view==='opportunities'&&<section className="adminPanel">
        <div className="adminPanelHead"><div><span>CALCULATED FROM LIVE GSC</span><h2>SEO opportunity queue</h2></div>{gsc?<Pill tone="green">{opportunities.length} signals</Pill>:<Pill>Waiting for GSC</Pill>}</div>
        {opportunities.length?<div className="oppList">{opportunities.map(o=>{const state=statuses[o.id]||'Open';return <button key={o.id} onClick={()=>setSelected(o)} className="oppRow"><b className="scoreRing">{o.score}</b><div className="oppMain"><strong>{o.action}</strong><span>{o.query}</span><small>{o.page.replace('https://toolmera.com','')}</small></div><div className="oppStats"><span>{number(o.impressions)} imp.</span><span>{pct(o.ctr)} CTR</span><span>Pos. {pos(o.position)}</span></div><span></span><Pill tone={state==='Done'?'green':state==='In progress'?'blue':state==='Ignored'?'neutral':'amber'}>{state}</Pill><ChevronRight size={16}/></button>})}</div>:<EmptyState title="No live opportunities yet" body="Once GSC starts returning query/page rows, Toolmera will score high-impression low-CTR and position 4–20 opportunities here."/>}
      </section>}

      {(view==='pages'||view==='queries')&&<>
        <div className="adminToolbar"><div className="adminSearch"><Search size={16}/><input value={filter} onChange={e=>setFilter(e.target.value)} placeholder={view==='pages'?'Filter live pages…':'Filter live queries…'}/></div></div>
        <section className="adminPanel"><div className="adminPanelHead"><div><span>{view==='pages'?'GSC PAGE PERFORMANCE':'GSC SEARCH DEMAND'}</span><h2>{view==='pages'?'Landing pages':'Search queries'}</h2></div>{gsc?<Pill tone="green">Live</Pill>:<Pill>Not connected</Pill>}</div>
          {!gsc?<EmptyState title="Connect Google Search Console" body="This table intentionally contains no sample rows. Live data will populate it automatically."/>:
          view==='pages'?<div className="adminTable pagesTable"><div className="tableHead"><span>URL</span><span>Source</span><span>Clicks</span><span>Impressions</span><span>CTR</span><span>Position</span><span>Status</span></div>{pages.map(p=><div key={p.page}><strong>{p.page.replace('https://toolmera.com','')||'/'}</strong><span>GSC</span><span>{number(p.clicks)}</span><span>{number(p.impressions)}</span><span>{pct(p.ctr)}</span><span>{pos(p.position)}</span><Pill tone="green">Live</Pill></div>)}</div>:
          <div className="adminTable queryTable"><div className="tableHead"><span>Query</span><span>Source</span><span>Clicks</span><span>Impressions</span><span>CTR</span><span>Position</span><span>Status</span></div>{queries.map(q=><div key={q.query}><strong>{q.query}</strong><span>GSC</span><span>{number(q.clicks)}</span><span>{number(q.impressions)}</span><span>{pct(q.ctr)}</span><span>{pos(q.position)}</span><Pill tone="green">Live</Pill></div>)}</div>}
        </section>
      </>}

      {view==='countries'&&<section className="adminPanel">
        <div className="adminPanelHead"><div><span>GOOGLE SEARCH CONSOLE</span><h2>Countries</h2></div>{gsc?<Pill tone="green">Live</Pill>:<Pill>Not connected</Pill>}</div>
        {gsc&&gsc.countries.length?<div className="countryList">{gsc.countries.map((c,i)=><div key={c.country}><b>{i+1}</b><span><strong>{c.country.toUpperCase()}</strong><small>{number(c.impressions)} impressions</small></span><span>{number(c.clicks)} clicks</span><span>{pct(c.ctr)}</span></div>)}</div>:<EmptyState title="No country data yet" body="Country-level search metrics will come directly from GSC. GA4 user/session geography will be added separately after GA4 is connected."/>}
      </section>}

      {view==='errors'&&<section className="adminPanel">
        <div className="adminPanelHead"><div><span>INTEGRATION HEALTH</span><h2>Errors & warnings</h2></div></div>
        <div className="errorList">
          {!status?.integrations.gsc.configured&&<div><Pill tone="amber">Setup</Pill><span><strong>Google Search Console not connected</strong><small>Finish GSC verification and add the Google service-account secrets to Cloudflare.</small></span></div>}
          {!status?.integrations.ga4.configured&&<div><Pill>Pending</Pill><span><strong>GA4 Data API not connected</strong><small>GTM collection can work while the admin API remains unconnected. GA4 Property ID and API access are still needed.</small></span></div>}
          {!status?.integrations.cloudflare.configured&&<div><Pill>Pending</Pill><span><strong>Cloudflare Analytics API not connected</strong><small>Add a read-only Cloudflare API token and Zone ID later.</small></span></div>}
          {!error&&status?.integrations.gsc.configured&&<div><Pill tone="green">Healthy</Pill><span><strong>Admin API reachable</strong><small>{gsc?'GSC data loaded successfully.':'GSC credentials are present; waiting for data or access.'}</small></span></div>}
          {error&&<div><Pill tone="red">Error</Pill><span><strong>Admin API / source error</strong><small>{error}</small></span></div>}
        </div>
      </section>}

      {view==='integrations'&&<section className="integrationGrid">{sourceCards.map(([name,desc,key])=><div className="integrationCard" key={key}><div><Cloud size={20}/>{sourceState(key)}</div><h3>{name}</h3><p>{desc}</p><span>{key==='gsc'?(status?.integrations.gsc.siteUrl||'sc-domain:toolmera.com'):key==='ga4'?'Requires numeric GA4 Property ID':key==='cloudflare'?'Requires read-only Zone API token':'Optional later'}</span><div className="integrationSecretList">{key==='gsc'&&<><code>GOOGLE_CLIENT_EMAIL</code><code>GOOGLE_PRIVATE_KEY</code><code>GSC_SITE_URL</code></>}{key==='ga4'&&<code>GA4_PROPERTY_ID</code>}{key==='cloudflare'&&<><code>CLOUDFLARE_ZONE_ID</code><code>CLOUDFLARE_API_TOKEN</code></>}{key==='bing'&&<code>BING_API_KEY</code>}</div></div>)}</section>}

      {view==='settings'&&<section className="adminGrid adminGridMain">
        <div className="adminPanel settingsPanel"><div className="adminPanelHead"><div><span>PROJECT</span><h2>Live configuration</h2></div></div><label>Tracked domain<input value="toolmera.com" readOnly/></label><label>GSC property<input value={status?.integrations.gsc.siteUrl||'Not connected'} readOnly/></label><label>Sitemap<input value="https://toolmera.com/sitemap.xml" readOnly/></label><label>Default report<select value={range} onChange={e=>setRange(e.target.value)}><option value="7d">7 days</option><option value="28d">28 days</option><option value="3m">3 months</option></select></label></div>
        <div className="adminPanel"><div className="adminPanelHead"><div><span>SECURITY</span><h2>Cloudflare Access</h2></div></div><div className="securityNote"><ShieldCheck size={24}/><div><strong>Protect both admin surfaces</strong><p>Cloudflare Access should cover <code>/admin/*</code> and <code>/api/admin/*</code>. Once enabled, set <code>REQUIRE_ACCESS=true</code> so the Worker rejects API requests without an Access assertion.</p></div></div></div>
      </section>}

      {selected&&<div className="adminDrawerBackdrop" onClick={()=>setSelected(null)}><aside className="adminDrawer" onClick={e=>e.stopPropagation()}><button className="drawerClose" onClick={()=>setSelected(null)}><X size={18}/></button><Pill tone="blue">Score {selected.score}/100</Pill><h2>{selected.action}</h2><p className="drawerQuery">{selected.query}</p><code>{selected.page.replace('https://toolmera.com','')}</code><div className="drawerMetrics"><div><span>Impressions</span><strong>{number(selected.impressions)}</strong></div><div><span>CTR</span><strong>{pct(selected.ctr)}</strong></div><div><span>Position</span><strong>{pos(selected.position)}</strong></div><div><span>Clicks</span><strong>{number(selected.clicks)}</strong></div></div><h3>Why this opportunity</h3><p>{selected.reason}</p><label>Status<select value={statuses[selected.id]||'Open'} onChange={e=>setStatuses({...statuses,[selected.id]:e.target.value as Status})}><option>Open</option><option>In progress</option><option>Done</option><option>Ignored</option></select></label><label>Notes<textarea value={notes[selected.id]||''} onChange={e=>setNotes({...notes,[selected.id]:e.target.value})} placeholder="Add an optimization note…"/></label><button className="adminPrimary" onClick={()=>setSelected(null)}>Save & close</button></aside></div>}
    </main>
  </div>;
}
