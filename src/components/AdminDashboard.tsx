'use client';

import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, Check,
  ChevronRight, CircleAlert, Cloud, FileSearch, Gauge, Globe2, LayoutDashboard,
  Link2, ListChecks, Search, Settings, ShieldCheck, Sparkles, TrendingDown,
  TrendingUp, Unplug, UsersRound, Wrench, X, ExternalLink
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type View = 'overview'|'indexing'|'opportunities'|'pages'|'queries'|'countries'|'errors'|'integrations'|'settings';
type Status = 'Open'|'In progress'|'Done'|'Ignored';

type Opportunity = {
  id:string;
  page:string;
  query:string;
  impressions:number;
  clicks:number;
  ctr:number;
  position:number;
  trend:number;
  score:number;
  action:string;
  reason:string;
};

const kpis = [
  {label:'Organic clicks',value:'12,482',delta:18.4,icon:Search},
  {label:'Impressions',value:'918K',delta:31.7,icon:BarChart3},
  {label:'CTR',value:'1.36%',delta:-4.8,icon:Gauge},
  {label:'Avg position',value:'14.8',delta:7.2,icon:TrendingUp},
  {label:'Organic users',value:'10,904',delta:22.1,icon:UsersRound},
  {label:'Sessions',value:'13,226',delta:19.9,icon:Activity},
  {label:'Indexed pages',value:'58 / 65',delta:9.4,icon:FileSearch},
  {label:'Active users',value:'286',delta:11.2,icon:Globe2},
];

const pages = [
  {url:'/generators/qr-code-generator/',cat:'Generators',clicks:2894,imp:182400,ctr:1.59,pos:8.4,users:2512,sessions:3018,trend:41.7,indexed:true},
  {url:'/image/png-to-webp/',cat:'Image',clicks:2142,imp:136800,ctr:1.57,pos:9.8,users:1934,sessions:2287,trend:24.1,indexed:true},
  {url:'/pdf/merge-pdf/',cat:'PDF',clicks:1768,imp:124900,ctr:1.42,pos:11.3,users:1580,sessions:1866,trend:16.5,indexed:true},
  {url:'/generators/password-generator/',cat:'Generators',clicks:1244,imp:88700,ctr:1.40,pos:13.7,users:1110,sessions:1382,trend:35.6,indexed:true},
  {url:'/calculators/loan-calculator/',cat:'Calculators',clicks:1036,imp:112300,ctr:.92,pos:12.1,users:948,sessions:1184,trend:12.4,indexed:true},
  {url:'/converters/weight-converter/',cat:'Converters',clicks:714,imp:79400,ctr:.90,pos:15.4,users:662,sessions:791,trend:28.2,indexed:true},
  {url:'/time/unix-timestamp-converter/',cat:'Time',clicks:601,imp:52100,ctr:1.15,pos:17.2,users:552,sessions:640,trend:46.9,indexed:true},
  {url:'/developer/json-formatter/',cat:'Developer',clicks:483,imp:48600,ctr:.99,pos:19.7,users:430,sessions:515,trend:-8.2,indexed:false},
];

const queries = [
  {q:'free qr code generator',page:'/generators/qr-code-generator/',clicks:1842,imp:74200,ctr:2.48,pos:7.2,trend:48.1},
  {q:'png to webp',page:'/image/png-to-webp/',clicks:1441,imp:68100,ctr:2.12,pos:8.9,trend:19.8},
  {q:'merge pdf online free',page:'/pdf/merge-pdf/',clicks:998,imp:62700,ctr:1.59,pos:10.4,trend:14.4},
  {q:'loan calculator free',page:'/calculators/loan-calculator/',clicks:508,imp:59300,ctr:.86,pos:11.8,trend:9.1},
  {q:'kg to lbs converter',page:'/converters/weight-converter/',clicks:313,imp:44800,ctr:.70,pos:14.3,trend:33.2},
  {q:'unix timestamp converter',page:'/time/unix-timestamp-converter/',clicks:297,imp:21800,ctr:1.36,pos:12.8,trend:52.4},
  {q:'json formatter online',page:'/developer/json-formatter/',clicks:181,imp:33100,ctr:.55,pos:18.6,trend:-11.6},
];

const opportunities: Opportunity[] = [
  {id:'o1',page:'/calculators/loan-calculator/',query:'loan calculator free',impressions:59300,clicks:508,ctr:.86,position:11.8,trend:9.1,score:94,action:'Improve title / CTR',reason:'High impressions + position 8–20 + CTR below page cluster average.'},
  {id:'o2',page:'/converters/weight-converter/',query:'kg to lbs converter',impressions:44800,clicks:313,ctr:.70,position:14.3,trend:33.2,score:91,action:'Add query-specific conversion block',reason:'Fast-growing long-tail query with strong impressions and mid-page-one / page-two position.'},
  {id:'o3',page:'/developer/json-formatter/',query:'json formatter online',impressions:33100,clicks:181,ctr:.55,position:18.6,trend:-11.6,score:89,action:'Investigate ranking drop',reason:'Traffic is declining while impressions remain meaningful.'},
  {id:'o4',page:'/pdf/merge-pdf/',query:'merge pdf online free',impressions:62700,clicks:998,ctr:1.59,position:10.4,trend:14.4,score:86,action:'Strengthen internal links',reason:'Already close to top 10 with room to consolidate authority from related PDF tools.'},
  {id:'o5',page:'/time/unix-timestamp-converter/',query:'epoch milliseconds to date',impressions:12600,clicks:86,ctr:.68,position:16.1,trend:72.5,score:84,action:'Add query-specific content block',reason:'Rapidly growing secondary intent with clear product relevance.'},
];

const countries = [
  {name:'United States',users:2920,clicks:3114,imp:210400,trend:21.4},
  {name:'India',users:2418,clicks:2821,imp:188900,trend:29.8},
  {name:'United Kingdom',users:1014,clicks:1102,imp:78800,trend:18.1},
  {name:'Canada',users:821,clicks:946,imp:63300,trend:24.6},
  {name:'Germany',users:704,clicks:778,imp:59200,trend:35.9},
  {name:'Australia',users:632,clicks:709,imp:54100,trend:16.3},
];

const errors = [
  {severity:'High',type:'Indexing',item:'/developer/json-formatter/',detail:'URL discovered but not indexed in demo Search Console dataset.'},
  {severity:'Medium',type:'404',item:'/node/1234/',detail:'Legacy domain URL receives crawler requests. Current 404 behavior is correct.'},
  {severity:'Medium',type:'CTR',item:'/calculators/loan-calculator/',detail:'CTR significantly below similar-position pages.'},
  {severity:'Low',type:'Sitemap',item:'sitemap.xml',detail:'65 indexable URLs submitted; 58 currently indexed in demo dataset.'},
];

const trendValues = [32,35,34,41,45,43,49,53,56,59,63,61,68,72,71,78,83,81,88,94,99,101,108,114,119,126,132,141];

const nav: {id:View;label:string;icon:any}[] = [
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

function Metric({label,value,delta,icon:Icon}:{label:string;value:string;delta:number;icon:any}){
  const up=delta>=0;
  return <div className="adminMetric"><div className="adminMetricTop"><span>{label}</span><Icon size={17}/></div><strong>{value}</strong><small className={up?'positive':'negative'}>{up?<ArrowUpRight size={13}/>:<ArrowDownRight size={13}/>} {Math.abs(delta)}% vs prev.</small></div>
}

function Trend({value}:{value:number}){
  return <span className={value>=0?'trend positive':'trend negative'}>{value>=0?<TrendingUp size={13}/>:<TrendingDown size={13}/>} {Math.abs(value)}%</span>
}

function Pill({children,tone='neutral'}:{children:React.ReactNode;tone?:string}){return <span className={'adminPill '+tone}>{children}</span>}

export function AdminDashboard(){
  const [view,setView]=useState<View>('overview');
  const [range,setRange]=useState('28d');
  const [statuses,setStatuses]=useState<Record<string,Status>>({});
  const [notes,setNotes]=useState<Record<string,string>>({});
  const [selected,setSelected]=useState<Opportunity|null>(null);
  const [filter,setFilter]=useState('');

  useEffect(()=>{
    try{
      setStatuses(JSON.parse(localStorage.getItem('toolmera-admin-statuses')||'{}'));
      setNotes(JSON.parse(localStorage.getItem('toolmera-admin-notes')||'{}'));
    }catch{}
  },[]);
  useEffect(()=>{if(Object.keys(statuses).length)localStorage.setItem('toolmera-admin-statuses',JSON.stringify(statuses))},[statuses]);
  useEffect(()=>{if(Object.keys(notes).length)localStorage.setItem('toolmera-admin-notes',JSON.stringify(notes))},[notes]);

  const filteredPages=useMemo(()=>pages.filter(p=>(p.url+' '+p.cat).toLowerCase().includes(filter.toLowerCase())),[filter]);
  const filteredQueries=useMemo(()=>queries.filter(q=>(q.q+' '+q.page).toLowerCase().includes(filter.toLowerCase())),[filter]);

  return <div className="adminApp">
    <aside className="adminSidebar">
      <div className="adminBrand"><span className="adminBrandMark">A</span><div><strong>TOOLMERA</strong><small>SEO Intelligence</small></div></div>
      <div className="adminDemo"><span></span> Demo data</div>
      <nav>{nav.map(item=>{const Icon=item.icon;return <button key={item.id} className={view===item.id?'active':''} onClick={()=>setView(item.id)}><Icon size={17}/><span>{item.label}</span></button>})}</nav>
      <div className="adminSidebarFoot"><ShieldCheck size={16}/><div><strong>Private dashboard</strong><span>/admin/ · noindex</span></div></div>
    </aside>

    <main className="adminMain">
      <header className="adminTopbar">
        <div><span className="adminKicker">TOOLMERA.COM</span><h1>{nav.find(n=>n.id===view)?.label}</h1></div>
        <div className="adminTopActions">
          <div className="adminSourceStatus"><span></span> Demo mode</div>
          <select value={range} onChange={e=>setRange(e.target.value)}><option value="today">Today</option><option value="7d">7 days</option><option value="28d">28 days</option><option value="3m">3 months</option></select>
          <a href="https://toolmera.com/" target="_blank" rel="noreferrer">Open site <ExternalLink size={14}/></a>
        </div>
      </header>

      {view==='overview'&&<>
        <section className="adminMetrics">{kpis.map(k=><Metric key={k.label}{...k}/>)}</section>
        <section className="adminGrid adminGridMain">
          <div className="adminPanel adminChartPanel"><div className="adminPanelHead"><div><span>SEARCH GROWTH</span><h2>Organic performance</h2></div><Pill tone="blue">28-day trend</Pill></div><div className="adminChart">{trendValues.map((v,i)=><i key={i} style={{height:Math.max(12,(v/145)*100)+'%'}}></i>)}</div><div className="adminChartLegend"><span><b className="blueDot"></b> Clicks</span><span><b className="violetDot"></b> Impressions</span></div></div>
          <div className="adminPanel"><div className="adminPanelHead"><div><span>SOURCES</span><h2>Sync status</h2></div></div><div className="sourceList">{['Google Search Console','Google Analytics 4','Cloudflare Analytics','Bing Webmaster Tools'].map(name=><div key={name}><span><Unplug size={15}/>{name}</span><Pill>Not connected</Pill></div>)}</div><button className="adminSecondary" onClick={()=>setView('integrations')}>Configure integrations <ChevronRight size={15}/></button></div>
        </section>
        <section className="adminGrid adminGridMain">
          <div className="adminPanel"><div className="adminPanelHead"><div><span>TOP LANDING PAGES</span><h2>Traffic leaders</h2></div><button className="textButton" onClick={()=>setView('pages')}>View all</button></div><div className="compactTable">{pages.slice(0,6).map(p=><div key={p.url}><span>{p.url}</span><strong>{p.clicks.toLocaleString()} clicks</strong><Trend value={p.trend}/></div>)}</div></div>
          <div className="adminPanel"><div className="adminPanelHead"><div><span>ACTION QUEUE</span><h2>Highest opportunities</h2></div><button className="textButton" onClick={()=>setView('opportunities')}>View all</button></div><div className="opportunityMini">{opportunities.slice(0,4).map(o=><button key={o.id} onClick={()=>{setView('opportunities');setSelected(o)}}><b>{o.score}</b><span><strong>{o.action}</strong><small>{o.page}</small></span><ChevronRight size={15}/></button>)}</div></div>
        </section>
      </>}

      {view==='indexing'&&<>
        <section className="adminMetrics indexMetrics"><Metric label="Indexed URLs" value="58" delta={9.4} icon={Check}/><Metric label="Not indexed" value="7" delta={-12.5} icon={AlertTriangle}/><Metric label="Sitemap URLs" value="65" delta={0} icon={FileSearch}/><Metric label="Canonical issues" value="0" delta={0} icon={Link2}/></section>
        <section className="adminPanel"><div className="adminPanelHead"><div><span>SITEMAP HEALTH</span><h2>https://toolmera.com/sitemap.xml</h2></div><Pill tone="green">Healthy</Pill></div><div className="indexHealth"><div><strong>65</strong><span>Submitted</span></div><div><strong>58</strong><span>Indexed</span></div><div><strong>7</strong><span>Pending / excluded</span></div><div><strong>0</strong><span>Canonical conflicts</span></div></div></section>
        <section className="adminPanel"><div className="adminPanelHead"><div><span>URL STATUS</span><h2>Tracked pages</h2></div></div><div className="adminTable"><div className="tableHead"><span>URL</span><span>Category</span><span>Index status</span><span>Position</span><span>Clicks</span></div>{pages.map(p=><div key={p.url}><strong>{p.url}</strong><span>{p.cat}</span><Pill tone={p.indexed?'green':'amber'}>{p.indexed?'Indexed':'Not indexed'}</Pill><span>{p.pos}</span><span>{p.clicks}</span></div>)}</div></section>
      </>}

      {view==='opportunities'&&<section className="adminPanel">
        <div className="adminPanelHead"><div><span>PRIORITIZED BY IMPACT</span><h2>SEO opportunity queue</h2></div><Pill tone="blue">{opportunities.length} open signals</Pill></div>
        <div className="oppList">{opportunities.map(o=>{const status=statuses[o.id]||'Open';return <button key={o.id} onClick={()=>setSelected(o)} className="oppRow"><b className="scoreRing">{o.score}</b><div className="oppMain"><strong>{o.action}</strong><span>{o.query}</span><small>{o.page}</small></div><div className="oppStats"><span>{o.impressions.toLocaleString()} imp.</span><span>{o.ctr}% CTR</span><span>Pos. {o.position}</span></div><Trend value={o.trend}/><Pill tone={status==='Done'?'green':status==='In progress'?'blue':status==='Ignored'?'neutral':'amber'}>{status}</Pill><ChevronRight size={16}/></button>})}</div>
      </section>}

      {(view==='pages'||view==='queries')&&<>
        <div className="adminToolbar"><div className="adminSearch"><Search size={16}/><input value={filter} onChange={e=>setFilter(e.target.value)} placeholder={view==='pages'?'Filter pages or categories…':'Filter queries or pages…'}/></div></div>
        <section className="adminPanel"><div className="adminPanelHead"><div><span>{view==='pages'?'PAGE PERFORMANCE':'SEARCH DEMAND'}</span><h2>{view==='pages'?'All tracked pages':'Search queries'}</h2></div></div>
          {view==='pages'?<div className="adminTable pagesTable"><div className="tableHead"><span>URL</span><span>Category</span><span>Clicks</span><span>Impressions</span><span>CTR</span><span>Position</span><span>Trend</span></div>{filteredPages.map(p=><div key={p.url}><strong>{p.url}</strong><span>{p.cat}</span><span>{p.clicks.toLocaleString()}</span><span>{p.imp.toLocaleString()}</span><span>{p.ctr}%</span><span>{p.pos}</span><Trend value={p.trend}/></div>)}</div>
          :<div className="adminTable queryTable"><div className="tableHead"><span>Query</span><span>Page</span><span>Clicks</span><span>Impressions</span><span>CTR</span><span>Position</span><span>Trend</span></div>{filteredQueries.map(q=><div key={q.q}><strong>{q.q}</strong><span>{q.page}</span><span>{q.clicks.toLocaleString()}</span><span>{q.imp.toLocaleString()}</span><span>{q.ctr}%</span><span>{q.pos}</span><Trend value={q.trend}/></div>)}</div>}
        </section>
      </>}

      {view==='countries'&&<section className="adminGrid adminGridMain">
        <div className="adminPanel"><div className="adminPanelHead"><div><span>GLOBAL SEARCH TRAFFIC</span><h2>Top countries</h2></div></div><div className="countryList">{countries.map((c,i)=><div key={c.name}><b>{i+1}</b><span><strong>{c.name}</strong><small>{c.imp.toLocaleString()} impressions</small></span><span>{c.clicks.toLocaleString()} clicks</span><Trend value={c.trend}/></div>)}</div></div>
        <div className="adminPanel"><div className="adminPanelHead"><div><span>GROWTH</span><h2>Fastest-growing GEOs</h2></div></div>{[...countries].sort((a,b)=>b.trend-a.trend).slice(0,5).map(c=><div className="geoGrowth" key={c.name}><span>{c.name}</span><strong>+{c.trend}%</strong><div><i style={{width:Math.min(100,c.trend*2)+'%'}}></i></div></div>)}</div>
      </section>}

      {view==='errors'&&<section className="adminPanel"><div className="adminPanelHead"><div><span>TECHNICAL WATCHLIST</span><h2>Errors & issues</h2></div></div><div className="errorList">{errors.map((e,i)=><div key={i}><Pill tone={e.severity==='High'?'red':e.severity==='Medium'?'amber':'neutral'}>{e.severity}</Pill><span><strong>{e.type} · {e.item}</strong><small>{e.detail}</small></span></div>)}</div></section>}

      {view==='integrations'&&<section className="integrationGrid">{[
        ['Google Search Console','Search clicks, impressions, CTR, queries, positions and indexing signals.','Search'],
        ['Google Analytics 4','Users, sessions, landing pages, engagement, countries and device data.','Analytics'],
        ['Cloudflare Analytics','Requests, bandwidth, edge errors, traffic spikes and cache signals.','Edge'],
        ['Bing Webmaster Tools','Bing queries, impressions, clicks and indexing diagnostics.','Search'],
      ].map(([name,desc,type])=><div className="integrationCard" key={name}><div><Cloud size={20}/><Pill>Not connected</Pill></div><h3>{name}</h3><p>{desc}</p><span>{type} source</span><button className="adminPrimary" onClick={()=>alert('Live credentials will be connected through protected Worker endpoints after Cloudflare Access is enabled for /admin/*.')}>Configure</button></div>)}</section>}

      {view==='settings'&&<section className="adminGrid adminGridMain">
        <div className="adminPanel settingsPanel"><div className="adminPanelHead"><div><span>PROJECT</span><h2>Dashboard settings</h2></div></div><label>Tracked domain<input value="toolmera.com" readOnly/></label><label>Default comparison period<select defaultValue="28d"><option>7 days</option><option value="28d">28 days</option><option>3 months</option></select></label><label>Timezone<select defaultValue="UTC"><option>UTC</option><option>Europe/Kyiv</option><option>America/Los_Angeles</option></select></label><button className="adminPrimary">Save settings</button></div>
        <div className="adminPanel"><div className="adminPanelHead"><div><span>SECURITY</span><h2>Access model</h2></div></div><div className="securityNote"><ShieldCheck size={24}/><div><strong>Cloudflare Access recommended</strong><p>Protect <code>/admin/*</code> at the edge. API credentials should live only in Worker secrets, never in this client bundle.</p></div></div></div>
      </section>}

      {selected&&<div className="adminDrawerBackdrop" onClick={()=>setSelected(null)}><aside className="adminDrawer" onClick={e=>e.stopPropagation()}><button className="drawerClose" onClick={()=>setSelected(null)}><X size={18}/></button><Pill tone="blue">Score {selected.score}/100</Pill><h2>{selected.action}</h2><p className="drawerQuery">{selected.query}</p><code>{selected.page}</code><div className="drawerMetrics"><div><span>Impressions</span><strong>{selected.impressions.toLocaleString()}</strong></div><div><span>CTR</span><strong>{selected.ctr}%</strong></div><div><span>Position</span><strong>{selected.position}</strong></div><div><span>Trend</span><strong className={selected.trend>=0?'positive':'negative'}>{selected.trend>=0?'+':''}{selected.trend}%</strong></div></div><h3>Why this opportunity</h3><p>{selected.reason}</p><label>Status<select value={statuses[selected.id]||'Open'} onChange={e=>setStatuses({...statuses,[selected.id]:e.target.value as Status})}><option>Open</option><option>In progress</option><option>Done</option><option>Ignored</option></select></label><label>Notes<textarea value={notes[selected.id]||''} onChange={e=>setNotes({...notes,[selected.id]:e.target.value})} placeholder="Add an optimization note…"/></label><button className="adminPrimary" onClick={()=>setSelected(null)}>Save & close</button></aside></div>}
    </main>
  </div>
}
