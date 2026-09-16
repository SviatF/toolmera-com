'use client';

import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import type { Tool } from '@/data/tools';

type WebsiteAnalysisResponse={
  error?:string;
  mode?:string;
  inputUrl?:string;
  page?:{
    requestedUrl:string;
    finalUrl:string;
    status:number;
    statusText:string;
    elapsedMs:number;
    htmlBytes:number;
    redirects:{url:string;status:number;location:string|null}[];
    headers:{server:string;contentType:string;cacheControl:string;contentEncoding:string;xRobotsTag:string;location:string};
  };
  meta?:{
    title:string;titleLength:number;description:string;descriptionLength:number;canonical:string;robots:string;viewport:string;lang:string;charset:string;generator:string;
    openGraph:{title:string;description:string;image:string;url:string;type:string};
    twitter:{card:string;title:string;description:string;image:string};
    headings:{h1:string[];h2:string[];h3:string[]};
    links:{total:number;internal:number;external:number};
    images:{total:number;missingAlt:number};
    schemaTypes:string[];
  };
  robots?:{url:string;status:number;available:boolean;blocksAll:boolean;sitemaps:string[];userAgents:number;disallows:number;allows:number;preview:string}|null;
  sitemap?:{url:string;status:number;available:boolean;type:string;urlCount:number;sitemapCount:number;lastmodCount:number;sampleUrls:string[]}|null;
  security?:{https:boolean;grade:string;present:number;total:number;headers:{hsts:string;csp:string;xFrameOptions:string;xContentTypeOptions:string;referrerPolicy:string;permissionsPolicy:string}};
  ssl?:{https:boolean;secureConnection:boolean;hsts:boolean;httpRedirectToHttps:boolean|null};
  technologies?:string[];
  seoScore?:number;
  traffic?:{
    domain:string;
    source:string;
    sourceAvailable:boolean;
    ranked:boolean;
    latestRank:number|null;
    averageRank30d:number|null;
    bestRank30d:number|null;
    worstRank30d:number|null;
    change30d:number|null;
    popularityLevel:string;
    daysObserved:number;
    history:{date:string;rank:number}[];
    note:string;
    error?:string;
  };
};

const websiteModeById:Record<string,string>={
  'website-analyzer':'full',
  'website-traffic-checker':'traffic',
  'seo-checker':'seo',
  'meta-tag-checker':'meta',
  'http-status-checker':'status',
  'redirect-checker':'redirect',
  'robots-checker':'robots',
  'sitemap-checker':'sitemap',
  'ssl-checker':'ssl',
  'security-headers-checker':'security',
  'technology-checker':'technology'
};

const prettyFileSize=(bytes:number)=>{
  if(bytes<1024)return bytes+' B';
  if(bytes<1024*1024)return (bytes/1024).toFixed(bytes<10240?1:0)+' KB';
  return (bytes/(1024*1024)).toFixed(bytes<10*1024*1024?1:0)+' MB';
};

function MetricCard({label,value}:{label:string;value:string|number}){
  return <div className="metricCard"><span>{label}</span><strong>{value}</strong></div>;
}

function WebsiteSignal({label,value,ok}:{label:string;value:ReactNode;ok?:boolean|null}){
  return <div className="websiteSignal"><span>{label}</span><strong>{value||'Not detected'}</strong>{typeof ok==='boolean'&&<b className={ok?'signalPass':'signalWarn'}>{ok?'PASS':'CHECK'}</b>}</div>;
}

function WebsiteAnalysisTool({tool}:{tool:Tool}){
  const [url,setUrl]=useState('');
  const [result,setResult]=useState<WebsiteAnalysisResponse|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const mode=websiteModeById[tool.id]||'full';

  const analyze=async(e:FormEvent)=>{
    e.preventDefault();
    setLoading(true);setError('');setResult(null);
    try{
      const response=await fetch('/api/tools/website-analysis',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({url,mode})
      });
      const data=await response.json() as WebsiteAnalysisResponse;
      if(!response.ok||data.error)throw new Error(data.error||'Website analysis failed.');
      setResult(data);
    }catch(err){setError(err instanceof Error?err.message:'Website analysis failed.')}finally{setLoading(false)}
  };

  const page=result?.page,meta=result?.meta,robots=result?.robots,sitemap=result?.sitemap,security=result?.security,ssl=result?.ssl;
  const securityRows=security?[
    ['HSTS',security.headers.hsts],
    ['Content-Security-Policy',security.headers.csp],
    ['X-Frame-Options',security.headers.xFrameOptions],
    ['X-Content-Type-Options',security.headers.xContentTypeOptions],
    ['Referrer-Policy',security.headers.referrerPolicy],
    ['Permissions-Policy',security.headers.permissionsPolicy],
  ]:[];

  return <div className="toolUi">
    <form className="websiteAnalyzerForm" onSubmit={analyze}>
      <label className="websiteUrlField"><span>Public website URL</span><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com/page" inputMode="url" autoComplete="url"/></label>
      <button className="primaryButton websiteAnalyzeButton" disabled={loading||!url.trim()}>{loading?<><RefreshCw size={16} className="spin"/> Analyzing…</>:<>Analyze website</>}</button>
    </form>
    <div className="toolNote"><ShieldCheck size={15}/><span>Toolmera fetches only public HTTP/HTTPS pages. Local/private hosts and non-standard ports are blocked, redirects are capped, and response bodies are size-limited.</span></div>
    {error&&<div className="toolError">{error}</div>}

    {result&&<>
      {(mode==='full'||mode==='seo')&&page&&meta&&<div className="websiteReport">
        <div className="metricGrid websiteMetrics">
          <MetricCard label="SEO score" value={(result.seoScore??0)+'/100'}/><MetricCard label="HTTP status" value={page.status}/><MetricCard label="H1 tags" value={meta.headings.h1.length}/><MetricCard label="Missing ALT" value={meta.images.missingAlt}/>
        </div>
        <div className="websiteReportGrid">
          <section className="websiteReportPanel"><span className="sectionKicker">ON-PAGE SEO</span><h3>Search signals</h3><div className="websiteSignalList">
            <WebsiteSignal label="Title" value={meta.title?meta.title+' · '+meta.titleLength+' chars':'Missing'} ok={meta.titleLength>=20&&meta.titleLength<=65}/>
            <WebsiteSignal label="Meta description" value={meta.description?meta.description+' · '+meta.descriptionLength+' chars':'Missing'} ok={meta.descriptionLength>=60&&meta.descriptionLength<=180}/>
            <WebsiteSignal label="Canonical" value={meta.canonical||'Missing'} ok={Boolean(meta.canonical)}/>
            <WebsiteSignal label="Meta robots" value={meta.robots||'No restrictive directive detected'} ok={!/\bnoindex\b/i.test(meta.robots)}/>
            <WebsiteSignal label="Viewport" value={meta.viewport||'Missing'} ok={Boolean(meta.viewport)}/>
            <WebsiteSignal label="Schema types" value={meta.schemaTypes.join(', ')||'None detected'} ok={meta.schemaTypes.length>0}/>
          </div></section>
          <section className="websiteReportPanel"><span className="sectionKicker">CRAWL FILES</span><h3>Indexability context</h3><div className="websiteSignalList">
            <WebsiteSignal label="robots.txt" value={robots?robots.status+' · '+(robots.blocksAll?'site-wide block detected':'no site-wide block detected'):'Could not verify'} ok={Boolean(robots?.available&&!robots.blocksAll)}/>
            <WebsiteSignal label="XML sitemap" value={sitemap?sitemap.status+' · '+(sitemap.urlCount||sitemap.sitemapCount)+' entries':'Could not verify'} ok={Boolean(sitemap?.available)}/>
            <WebsiteSignal label="Internal links" value={meta.links.internal}/><WebsiteSignal label="External links" value={meta.links.external}/><WebsiteSignal label="Images" value={meta.images.total+' total · '+meta.images.missingAlt+' missing/empty ALT'}/><WebsiteSignal label="Final URL" value={page.finalUrl}/>
          </div></section>
        </div>
        {mode==='full'&&security&&<div className="websiteReportGrid">
          <section className="websiteReportPanel"><span className="sectionKicker">SECURITY</span><h3>Headers grade {security.grade}</h3><div className="websiteSignalList">{securityRows.map(([label,value])=><WebsiteSignal key={label} label={label} value={value||'Missing'} ok={Boolean(value)}/>)}</div></section>
          <section className="websiteReportPanel"><span className="sectionKicker">TECHNOLOGY</span><h3>Public fingerprints</h3>{result.technologies?.length?<div className="technologyTags">{result.technologies.map(t=><span key={t}>{t}</span>)}</div>:<p className="websiteMuted">No supported technology fingerprints were detected in the fetched HTML or response headers.</p>}</section>
        </div>}
      </div>}

      {mode==='traffic'&&result.traffic&&<div className="websiteReport">
        <div className="metricGrid websiteMetrics"><MetricCard label="Latest popularity rank" value={result.traffic.latestRank?'#'+result.traffic.latestRank.toLocaleString():'Not in top 1M'}/><MetricCard label="30-day average" value={result.traffic.averageRank30d?'#'+result.traffic.averageRank30d.toLocaleString():'—'}/><MetricCard label="Best rank" value={result.traffic.bestRank30d?'#'+result.traffic.bestRank30d.toLocaleString():'—'}/><MetricCard label="Traffic popularity" value={result.traffic.popularityLevel}/></div>
        <div className="websiteReportGrid">
          <section className="websiteReportPanel"><span className="sectionKicker">PUBLIC TRAFFIC SIGNALS</span><h3>{result.traffic.domain}</h3><div className="websiteSignalList">
            <WebsiteSignal label="Ranking status" value={!result.traffic.sourceAvailable?'Popularity source temporarily unavailable':result.traffic.ranked?'Ranked in the public popularity dataset':'No top-1M rank found'} ok={result.traffic.sourceAvailable?result.traffic.ranked:null}/>
            <WebsiteSignal label="30-day movement" value={result.traffic.change30d===null?'Not enough history':result.traffic.change30d===0?'No net rank change':(result.traffic.change30d>0?'+':'')+result.traffic.change30d.toLocaleString()+' places'}/><WebsiteSignal label="Worst rank" value={result.traffic.worstRank30d?'#'+result.traffic.worstRank30d.toLocaleString():'—'}/><WebsiteSignal label="Days observed" value={result.traffic.daysObserved}/><WebsiteSignal label="Live website status" value={page?page.status+' · '+page.elapsedMs+' ms':'Could not verify live page'}/><WebsiteSignal label="Data source" value={result.traffic.source}/>
          </div></section>
          <section className="websiteReportPanel"><span className="sectionKicker">30-DAY TREND</span><h3>Popularity rank history</h3>{result.traffic.history.length?<div className="trafficHistory">{result.traffic.history.slice(-14).map(row=><div key={row.date}><span>{row.date}</span><strong>#{row.rank.toLocaleString()}</strong></div>)}</div>:<p className="websiteMuted">This domain has no rank history in the returned public dataset. That does not prove the website has zero traffic.</p>}</section>
        </div>
        <div className="toolNote"><ShieldCheck size={15}/><span>{result.traffic.note}{result.traffic.error?' Source status: '+result.traffic.error:''}</span></div>
      </div>}

      {mode==='meta'&&meta&&<div className="websiteReport"><div className="metricGrid websiteMetrics"><MetricCard label="Title chars" value={meta.titleLength}/><MetricCard label="Description chars" value={meta.descriptionLength}/><MetricCard label="H1 tags" value={meta.headings.h1.length}/><MetricCard label="Schema types" value={meta.schemaTypes.length}/></div><div className="websiteReportGrid">
        <section className="websiteReportPanel"><span className="sectionKicker">SEO META</span><h3>Search metadata</h3><div className="websiteSignalList"><WebsiteSignal label="Title" value={meta.title||'Missing'}/><WebsiteSignal label="Description" value={meta.description||'Missing'}/><WebsiteSignal label="Canonical" value={meta.canonical||'Missing'}/><WebsiteSignal label="Robots" value={meta.robots||'Not set'}/><WebsiteSignal label="Viewport" value={meta.viewport||'Missing'}/><WebsiteSignal label="Language" value={meta.lang||'Not declared'}/><WebsiteSignal label="Charset" value={meta.charset||'Not declared'}/></div></section>
        <section className="websiteReportPanel"><span className="sectionKicker">SOCIAL META</span><h3>Open Graph & Twitter</h3><div className="websiteSignalList"><WebsiteSignal label="og:title" value={meta.openGraph.title||'Missing'}/><WebsiteSignal label="og:description" value={meta.openGraph.description||'Missing'}/><WebsiteSignal label="og:image" value={meta.openGraph.image||'Missing'}/><WebsiteSignal label="twitter:card" value={meta.twitter.card||'Missing'}/><WebsiteSignal label="twitter:title" value={meta.twitter.title||'Missing'}/><WebsiteSignal label="twitter:image" value={meta.twitter.image||'Missing'}/></div></section>
      </div></div>}

      {mode==='status'&&page&&<div className="websiteReport"><div className="metricGrid websiteMetrics"><MetricCard label="HTTP status" value={page.status}/><MetricCard label="Response time" value={page.elapsedMs+' ms'}/><MetricCard label="Redirect hops" value={Math.max(0,page.redirects.length-1)}/><MetricCard label="HTML read" value={prettyFileSize(page.htmlBytes)}/></div><section className="websiteReportPanel"><span className="sectionKicker">LIVE RESPONSE</span><h3>HTTP details</h3><div className="websiteSignalList"><WebsiteSignal label="Requested URL" value={page.requestedUrl}/><WebsiteSignal label="Final URL" value={page.finalUrl}/><WebsiteSignal label="Content-Type" value={page.headers.contentType||'Not sent'}/><WebsiteSignal label="Server" value={page.headers.server||'Not disclosed'}/><WebsiteSignal label="Cache-Control" value={page.headers.cacheControl||'Not sent'}/><WebsiteSignal label="X-Robots-Tag" value={page.headers.xRobotsTag||'Not sent'}/></div></section></div>}

      {mode==='redirect'&&page&&<div className="websiteReport"><div className="metricGrid websiteMetrics"><MetricCard label="Redirect hops" value={Math.max(0,page.redirects.length-1)}/><MetricCard label="Final status" value={page.status}/><MetricCard label="Response time" value={page.elapsedMs+' ms'}/><MetricCard label="Chain result" value={page.redirects.length>1?'Redirected':'Direct'}/></div><section className="websiteReportPanel"><span className="sectionKicker">REDIRECT CHAIN</span><h3>Every HTTP hop</h3><div className="redirectChain">{page.redirects.map((hop,i)=><div key={hop.url+'-'+i}><b>{i+1}</b><span><strong>{hop.status}</strong><small>{hop.url}</small>{hop.location&&<em>→ {hop.location}</em>}</span></div>)}</div></section></div>}

      {mode==='robots'&&robots&&<div className="websiteReport"><div className="metricGrid websiteMetrics"><MetricCard label="HTTP status" value={robots.status}/><MetricCard label="Blocks all" value={robots.blocksAll?'YES':'NO'}/><MetricCard label="User-agent rules" value={robots.userAgents}/><MetricCard label="Sitemaps" value={robots.sitemaps.length}/></div><section className="websiteReportPanel"><span className="sectionKicker">ROBOTS.TXT</span><h3>{robots.url}</h3><div className="websiteSignalList"><WebsiteSignal label="Availability" value={robots.available?'Reachable':'Not reachable'} ok={robots.available}/><WebsiteSignal label="Site-wide Disallow: /" value={robots.blocksAll?'Detected':'Not detected'} ok={!robots.blocksAll}/><WebsiteSignal label="Allow directives" value={robots.allows}/><WebsiteSignal label="Disallow directives" value={robots.disallows}/><WebsiteSignal label="Declared sitemaps" value={robots.sitemaps.join(', ')||'None declared'}/></div><pre className="websiteRaw">{robots.preview||'robots.txt is empty.'}</pre></section></div>}

      {mode==='sitemap'&&sitemap&&<div className="websiteReport"><div className="metricGrid websiteMetrics"><MetricCard label="HTTP status" value={sitemap.status}/><MetricCard label="Type" value={sitemap.type}/><MetricCard label="URL entries" value={sitemap.urlCount}/><MetricCard label="Child sitemaps" value={sitemap.sitemapCount}/></div><section className="websiteReportPanel"><span className="sectionKicker">XML SITEMAP</span><h3>{sitemap.url}</h3><div className="websiteSignalList"><WebsiteSignal label="Availability" value={sitemap.available?'Reachable':'Not reachable'} ok={sitemap.available}/><WebsiteSignal label="lastmod tags" value={sitemap.lastmodCount}/><WebsiteSignal label="Entry count" value={sitemap.urlCount||sitemap.sitemapCount}/></div>{sitemap.sampleUrls.length>0&&<div className="websiteUrlSamples">{sitemap.sampleUrls.map(x=><span key={x}>{x}</span>)}</div>}</section></div>}

      {mode==='ssl'&&page&&ssl&&<div className="websiteReport"><div className="metricGrid websiteMetrics"><MetricCard label="HTTPS" value={ssl.https?'YES':'NO'}/><MetricCard label="HSTS" value={ssl.hsts?'YES':'NO'}/><MetricCard label="HTTP → HTTPS" value={ssl.httpRedirectToHttps===null?'UNKNOWN':ssl.httpRedirectToHttps?'YES':'NO'}/><MetricCard label="HTTP status" value={page.status}/></div><section className="websiteReportPanel"><span className="sectionKicker">HTTPS CHECK</span><h3>Transport security signals</h3><div className="websiteSignalList"><WebsiteSignal label="Final URL uses HTTPS" value={ssl.https?'Yes':'No'} ok={ssl.https}/><WebsiteSignal label="Secure HTTPS connection completed" value={ssl.secureConnection?'Yes':'No'} ok={ssl.secureConnection}/><WebsiteSignal label="Strict-Transport-Security" value={security?.headers.hsts||'Missing'} ok={ssl.hsts}/><WebsiteSignal label="HTTP redirects to HTTPS" value={ssl.httpRedirectToHttps===null?'Could not verify':ssl.httpRedirectToHttps?'Yes':'No'} ok={ssl.httpRedirectToHttps}/></div><p className="websiteMuted">This checker verifies live HTTPS reachability and transport headers. It does not claim certificate issuer or expiry data because those details are not exposed by the current edge fetch interface.</p></section></div>}

      {mode==='security'&&security&&<div className="websiteReport"><div className="metricGrid websiteMetrics"><MetricCard label="Grade" value={security.grade}/><MetricCard label="Headers present" value={security.present+'/'+security.total}/><MetricCard label="HTTPS" value={security.https?'YES':'NO'}/><MetricCard label="Missing headers" value={security.total-security.present}/></div><section className="websiteReportPanel"><span className="sectionKicker">SECURITY HEADERS</span><h3>Browser-facing protections</h3><div className="websiteSignalList">{securityRows.map(([label,value])=><WebsiteSignal key={label} label={label} value={value||'Missing'} ok={Boolean(value)}/>)}</div></section></div>}

      {mode==='technology'&&<div className="websiteReport"><div className="metricGrid websiteMetrics"><MetricCard label="Detected" value={result.technologies?.length||0}/><MetricCard label="HTTP status" value={page?.status||'—'}/><MetricCard label="Server" value={page?.headers.server||'Hidden'}/><MetricCard label="Generator" value={meta?.generator||'None'}/></div><section className="websiteReportPanel"><span className="sectionKicker">TECH STACK</span><h3>Detected public technologies</h3>{result.technologies?.length?<div className="technologyTags">{result.technologies.map(t=><span key={t}>{t}</span>)}</div>:<p className="websiteMuted">No supported CMS, framework, analytics, CDN or integration fingerprints were detected. That does not prove the site uses no technologies; some stacks deliberately hide public fingerprints.</p>}</section></div>}
    </>}
  </div>;
}

export function WebsiteAnalysisExperience({tool}:{tool:Tool}){
  return <section className={`toolExperience accent-${tool.accent}`}>
    <div className="experienceTop"><div><span className="eyebrow">TOOLMERA / {tool.categoryLabel.toUpperCase()}</span><div className="experienceTitle">{tool.name}</div></div><span className="privatePill"><ShieldCheck size={15}/> Live public URL analysis</span></div>
    <WebsiteAnalysisTool tool={tool}/>
  </section>;
}
