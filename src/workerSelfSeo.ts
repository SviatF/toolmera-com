import appWorker, { SeoDeploymentStore, SeoTaskStore } from './workerWithDeployments';

export { SeoDeploymentStore, SeoTaskStore };

type AssetBinding={fetch(request:Request):Promise<Response>};
type Env={ASSETS:AssetBinding;[key:string]:unknown};
type WebsiteAnalysisMode='full'|'traffic'|'seo'|'meta'|'status'|'redirect'|'robots'|'sitemap'|'ssl'|'security'|'technology'|'broken-links'|'schema'|'dns';

type AssetPage={
  requestedUrl:string;
  finalUrl:string;
  status:number;
  statusText:string;
  headers:Record<string,string>;
  redirects:{url:string;status:number;location:string|null}[];
  elapsedMs:number;
  text:string;
};

function json(data:unknown,status=200){
  return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex, nofollow'}});
}

function normalizeInput(value:string){
  const raw=value.trim();
  if(!raw)throw new Error('Enter a website URL.');
  const parsed=new URL(/^https?:\/\//i.test(raw)?raw:`https://${raw}`);
  if(parsed.protocol!=='http:'&&parsed.protocol!=='https:')throw new Error('Only HTTP and HTTPS URLs are supported.');
  return parsed;
}

function isToolmeraHost(hostname:string){
  return hostname.toLowerCase().replace(/^www\./,'')==='toolmera.com';
}

function decodeHtml(value:string){
  return value
    .replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'")
    .replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&nbsp;/gi,' ')
    .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)));
}

function attr(tag:string,name:string){
  const dq=tag.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*"([^"]*)"`,'i'));
  if(dq)return decodeHtml((dq[1]||'').trim());
  const sq=tag.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*'([^']*)'`,'i'));
  if(sq)return decodeHtml((sq[1]||'').trim());
  const bare=tag.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*([^\\s>]+)`,'i'));
  return decodeHtml((bare?.[1]||'').trim());
}

function strip(value:string){
  return decodeHtml(value.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
}

function metaValue(html:string,key:string,attribute='name'){
  for(const tag of html.match(/<meta\b[^>]*>/gi)||[]){
    if(attr(tag,attribute).toLowerCase()===key.toLowerCase())return attr(tag,'content');
  }
  return '';
}

function linkValue(html:string,relName:string){
  for(const tag of html.match(/<link\b[^>]*>/gi)||[]){
    if(attr(tag,'rel').toLowerCase().split(/\s+/).includes(relName.toLowerCase()))return attr(tag,'href');
  }
  return '';
}

function headings(html:string,level:number,limit=30){
  const out:string[]=[];
  const re=new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`,'gi');
  let match:RegExpExecArray|null;
  while((match=re.exec(html))&&out.length<limit){const value=strip(match[1]||'');if(value)out.push(value)}
  return out;
}

function schemaTypes(html:string){
  const out=new Set<string>();
  for(const script of [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].slice(0,30)){
    for(const match of (script[1]||'').matchAll(/"@type"\s*:\s*"([^"]+)"/g))out.add(match[1]);
  }
  return [...out].slice(0,30);
}

function analyzeHtml(page:AssetPage){
  const html=page.text;
  const title=strip(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
  const description=metaValue(html,'description');
  const canonical=linkValue(html,'canonical');
  const robots=metaValue(html,'robots');
  const viewport=metaValue(html,'viewport');
  const generator=metaValue(html,'generator');
  const lang=attr(html.match(/<html\b[^>]*>/i)?.[0]||'','lang');
  const charset=(()=>{for(const tag of html.match(/<meta\b[^>]*>/gi)||[]){const direct=attr(tag,'charset');if(direct)return direct}return ''})();

  const anchorTags=html.match(/<a\b[^>]*>/gi)||[];
  let internal=0,external=0;
  const origin=new URL(page.finalUrl).origin;
  for(const tag of anchorTags.slice(0,5000)){
    const href=attr(tag,'href');
    if(!href||href.startsWith('#')||/^(mailto:|tel:|javascript:)/i.test(href))continue;
    try{const target=new URL(href,page.finalUrl);if(target.origin===origin)internal++;else external++}catch{}
  }

  const imageTags=html.match(/<img\b[^>]*>/gi)||[];
  const missingAlt=imageTags.filter(tag=>!/\salt\s*=/i.test(tag)||attr(tag,'alt').trim()==='').length;

  return{
    title,titleLength:title.length,description,descriptionLength:description.length,canonical,robots,viewport,lang,charset,generator,
    openGraph:{title:metaValue(html,'og:title','property'),description:metaValue(html,'og:description','property'),image:metaValue(html,'og:image','property'),url:metaValue(html,'og:url','property'),type:metaValue(html,'og:type','property')},
    twitter:{card:metaValue(html,'twitter:card'),title:metaValue(html,'twitter:title'),description:metaValue(html,'twitter:description'),image:metaValue(html,'twitter:image')},
    headings:{h1:headings(html,1),h2:headings(html,2),h3:headings(html,3)},
    links:{total:internal+external,internal,external},
    images:{total:imageTags.length,missingAlt},
    schemaTypes:schemaTypes(html),
  };
}


type SelfCheckedLink={url:string;text:string;internal:boolean};

function selfPageLinks(page:AssetPage){
  const links:SelfCheckedLink[]=[];
  const seen=new Set<string>();
  const sourceHost=new URL(page.finalUrl).hostname.replace(/^www\./,'').toLowerCase();
  const re=/<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match:RegExpExecArray|null;
  while((match=re.exec(page.text))&&links.length<250){
    const tag='<a '+(match[1]||'')+'>';
    const href=attr(tag,'href');
    if(!href||href.startsWith('#')||/^(mailto:|tel:|javascript:|data:)/i.test(href))continue;
    try{
      const target=new URL(href,page.finalUrl);
      if(target.protocol!=='http:'&&target.protocol!=='https:')continue;
      target.hash='';
      const normalized=target.toString();
      if(seen.has(normalized))continue;
      seen.add(normalized);
      links.push({
        url:normalized,
        text:strip(match[2]||'').slice(0,120),
        internal:target.hostname.replace(/^www\./,'').toLowerCase()===sourceHost
      });
    }catch{}
  }
  return links;
}

async function checkSelfPageLink(link:SelfCheckedLink,env:Env){
  const target=new URL(link.url);
  if(isToolmeraHost(target.hostname)){
    const assetTarget=new URL(target.toString());
    assetTarget.protocol='https:';
    assetTarget.hostname='toolmera.com';
    assetTarget.port='';
    try{
      const response=await env.ASSETS.fetch(new Request(assetTarget.toString(),{method:'GET'}));
      try{if(response.body)await response.body.cancel()}catch{}
      const status=response.status;
      return{...link,finalUrl:assetTarget.toString(),status,statusText:response.statusText||'',kind:(status===404||status===410?'broken':status>=400?'error':'working') as 'broken'|'error'|'working'|'redirected'};
    }catch(error){
      return{...link,finalUrl:'',status:0,statusText:error instanceof Error?error.message:'Request failed',kind:'error' as const};
    }
  }

  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),7000);
  try{
    const response=await fetch(link.url,{
      method:'GET',
      redirect:'follow',
      signal:controller.signal,
      headers:{accept:'text/html,application/xhtml+xml,*/*;q=0.5','user-agent':'ToolmeraLinkChecker/1.0 (+https://toolmera.com/website-analysis/broken-link-checker/)'}
    });
    try{if(response.body)await response.body.cancel()}catch{}
    const status=response.status;
    return{...link,finalUrl:response.url||link.url,status,statusText:response.statusText||'',kind:(status===404||status===410?'broken':status>=400?'error':response.redirected?'redirected':'working') as 'broken'|'error'|'working'|'redirected'};
  }catch(error){
    return{...link,finalUrl:'',status:0,statusText:error instanceof Error?error.message:'Request failed',kind:'error' as const};
  }finally{clearTimeout(timer)}
}

async function selfBrokenLinkReport(page:AssetPage,env:Env){
  const all=selfPageLinks(page);
  const sample=all.slice(0,20);
  const checked:Awaited<ReturnType<typeof checkSelfPageLink>>[]=[];
  for(let i=0;i<sample.length;i+=5){
    checked.push(...await Promise.all(sample.slice(i,i+5).map(link=>checkSelfPageLink(link,env))));
  }
  return{
    sourceUrl:page.finalUrl,totalFound:all.length,checked:checked.length,
    working:checked.filter(row=>row.kind==='working').length,
    redirected:checked.filter(row=>row.kind==='redirected').length,
    broken:checked.filter(row=>row.kind==='broken').length,
    errors:checked.filter(row=>row.kind==='error').length,
    skipped:Math.max(0,all.length-checked.length),links:checked
  };
}

function collectSelfJsonLdTypes(value:unknown,types:Set<string>){
  if(Array.isArray(value)){for(const item of value)collectSelfJsonLdTypes(item,types);return}
  if(!value||typeof value!=='object')return;
  const object=value as Record<string,unknown>;
  const own=object['@type'];
  if(typeof own==='string'&&own.trim())types.add(own.trim());
  if(Array.isArray(own))for(const item of own)if(typeof item==='string'&&item.trim())types.add(item.trim());
  for(const child of Object.values(object))collectSelfJsonLdTypes(child,types);
}

function selfStructuredDataReport(html:string){
  const scripts=[...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].slice(0,30);
  const allTypes=new Set<string>();
  const items=scripts.map((script,index)=>{
    try{
      const parsed=JSON.parse((script[1]||'').trim());
      const types=new Set<string>();collectSelfJsonLdTypes(parsed,types);
      for(const type of types)allTypes.add(type);
      const keys=parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?Object.keys(parsed as Record<string,unknown>).slice(0,20):[];
      return{index:index+1,valid:true,types:[...types].slice(0,30),keys,error:''};
    }catch(error){
      return{index:index+1,valid:false,types:[] as string[],keys:[] as string[],error:(error instanceof Error?error.message:String(error)).slice(0,220)};
    }
  });
  return{scripts:items.length,valid:items.filter(x=>x.valid).length,invalid:items.filter(x=>!x.valid).length,types:[...allTypes].slice(0,50),items};
}

function robotsSummary(text:string,url:string,status:number){
  const sitemaps=[...text.matchAll(/^\s*Sitemap:\s*(\S+)/gim)].map(m=>m[1]).slice(0,20);
  return{url,status,available:status>=200&&status<300,blocksAll:/User-agent:\s*\*[\s\S]{0,800}?Disallow:\s*\/\s*(?:#.*)?$/im.test(text),sitemaps,userAgents:(text.match(/^\s*User-agent:/gim)||[]).length,disallows:(text.match(/^\s*Disallow:/gim)||[]).length,allows:(text.match(/^\s*Allow:/gim)||[]).length,preview:text.slice(0,10000)};
}

function sitemapSummary(text:string,url:string,status:number){
  const urls=[...text.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(m=>decodeHtml(m[1].trim()));
  const urlCount=(text.match(/<url(?:\s|>)/gi)||[]).length;
  const sitemapCount=(text.match(/<sitemap(?:\s|>)/gi)||[]).length;
  const lastmodCount=(text.match(/<lastmod(?:\s|>)/gi)||[]).length;
  return{url,status,available:status>=200&&status<300,type:sitemapCount?'sitemap-index':urlCount?'urlset':'unknown',urlCount,sitemapCount,lastmodCount,sampleUrls:urls.slice(0,12)};
}

function securitySignals(headers:Record<string,string>,finalUrl:string){
  const values={hsts:headers['strict-transport-security']||'',csp:headers['content-security-policy']||'',xFrameOptions:headers['x-frame-options']||'',xContentTypeOptions:headers['x-content-type-options']||'',referrerPolicy:headers['referrer-policy']||'',permissionsPolicy:headers['permissions-policy']||''};
  const present=Object.values(values).filter(Boolean).length;
  const https=finalUrl.startsWith('https://');
  const points=present+(https?1:0);
  const grade=points>=7?'A':points===6?'B':points===5?'C':points>=3?'D':'F';
  return{https,grade,present,total:6,headers:values};
}

function score(page:AssetPage,html:ReturnType<typeof analyzeHtml>,robots:ReturnType<typeof robotsSummary>|null,sitemap:ReturnType<typeof sitemapSummary>|null){
  const checks=[page.status>=200&&page.status<300,html.title.length>=20&&html.title.length<=65,html.description.length>=60&&html.description.length<=180,html.headings.h1.length===1,Boolean(html.canonical),!/\bnoindex\b/i.test(html.robots),Boolean(html.viewport),html.images.total===0||html.images.missingAlt/html.images.total<=0.1,html.schemaTypes.length>0,Boolean(robots?.available),Boolean(sitemap?.available)];
  return Math.round(checks.filter(Boolean).length/checks.length*100);
}

async function fetchAsset(env:Env,target:URL):Promise<AssetPage>{
  const requestedUrl=target.toString();
  const final=new URL(target.toString());
  final.protocol='https:';
  final.hostname='toolmera.com';
  final.port='';
  const redirects:{url:string;status:number;location:string|null}[]=[];
  if(target.protocol!=='https:'||target.hostname.toLowerCase()!=='toolmera.com')redirects.push({url:requestedUrl,status:301,location:final.toString()});
  const started=Date.now();
  const response=await env.ASSETS.fetch(new Request(final.toString(),{headers:{accept:'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5'}}));
  const headers:Record<string,string>={};response.headers.forEach((value,key)=>{headers[key.toLowerCase()]=value});
  const text=await response.text();
  redirects.push({url:final.toString(),status:response.status,location:null});
  return{requestedUrl,finalUrl:final.toString(),status:response.status,statusText:response.statusText,headers,redirects,elapsedMs:Date.now()-started,text};
}

async function assetText(env:Env,path:string){
  const url=new URL(path,'https://toolmera.com');
  const response=await env.ASSETS.fetch(new Request(url.toString()));
  return{url:url.toString(),status:response.status,text:await response.text()};
}

async function selfAnalysis(request:Request,env:Env,body:{url?:string;mode?:WebsiteAnalysisMode}){
  const mode:WebsiteAnalysisMode=body.mode||'full';
  const input=normalizeInput(body.url||'');
  if(mode==='dns')return appWorker.fetch(request,env as any);
  const page=await fetchAsset(env,input);

  if(mode==='traffic'){
    const upstream=await appWorker.fetch(request,env as any);
    if(!upstream.ok)return upstream;
    const payload=await upstream.json() as Record<string,unknown>;
    payload.page={requestedUrl:page.requestedUrl,finalUrl:page.finalUrl,status:page.status,statusText:page.statusText,elapsedMs:page.elapsedMs,redirects:page.redirects,headers:{server:page.headers['server']||'Cloudflare',contentType:page.headers['content-type']||'',cacheControl:page.headers['cache-control']||'',contentEncoding:page.headers['content-encoding']||'',xRobotsTag:page.headers['x-robots-tag']||'',location:page.headers['location']||''},htmlBytes:new TextEncoder().encode(page.text).byteLength};
    return json(payload);
  }

  if(mode==='broken-links'){
    const brokenLinks=await selfBrokenLinkReport(page,env);
    return json({mode,inputUrl:input.toString(),page:{requestedUrl:page.requestedUrl,finalUrl:page.finalUrl,status:page.status,statusText:page.statusText,elapsedMs:page.elapsedMs,redirects:page.redirects,headers:{server:page.headers['server']||'Cloudflare',contentType:page.headers['content-type']||'',cacheControl:page.headers['cache-control']||'',contentEncoding:page.headers['content-encoding']||'',xRobotsTag:page.headers['x-robots-tag']||'',location:page.headers['location']||''},htmlBytes:new TextEncoder().encode(page.text).byteLength},brokenLinks,fetchedAt:new Date().toISOString()});
  }

  if(mode==='schema'){
    const structuredData=selfStructuredDataReport(page.text);
    return json({mode,inputUrl:input.toString(),page:{requestedUrl:page.requestedUrl,finalUrl:page.finalUrl,status:page.status,statusText:page.statusText,elapsedMs:page.elapsedMs,redirects:page.redirects,headers:{server:page.headers['server']||'Cloudflare',contentType:page.headers['content-type']||'',cacheControl:page.headers['cache-control']||'',contentEncoding:page.headers['content-encoding']||'',xRobotsTag:page.headers['x-robots-tag']||'',location:page.headers['location']||''},htmlBytes:new TextEncoder().encode(page.text).byteLength},structuredData,fetchedAt:new Date().toISOString()});
  }

  const robotsAsset=await assetText(env,'/robots.txt');
  const sitemapAsset=await assetText(env,'/sitemap.xml');
  const robots=robotsSummary(robotsAsset.text,robotsAsset.url,robotsAsset.status);
  const sitemap=sitemapSummary(sitemapAsset.text,sitemapAsset.url,sitemapAsset.status);

  if(mode==='robots')return json({mode,inputUrl:input.toString(),robots,fetchedAt:new Date().toISOString()});
  if(mode==='sitemap')return json({mode,inputUrl:input.toString(),robots,sitemap,fetchedAt:new Date().toISOString()});

  const html=analyzeHtml(page);
  const security=securitySignals(page.headers,page.finalUrl);
  const technologies=['Cloudflare',...( /\/_next\//i.test(page.text)?['Next.js']:[]),...( /googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]+/i.test(page.text)?['Google Tag Manager']:[]),...( /googletagmanager\.com\/gtag\/js|gtag\s*\(\s*['"]config/i.test(page.text)?['Google Analytics']:[])];
  const safeHeaders={server:page.headers['server']||'Cloudflare',contentType:page.headers['content-type']||'',cacheControl:page.headers['cache-control']||'',contentEncoding:page.headers['content-encoding']||'',xRobotsTag:page.headers['x-robots-tag']||'',location:page.headers['location']||''};

  return json({
    mode,inputUrl:input.toString(),
    page:{requestedUrl:page.requestedUrl,finalUrl:page.finalUrl,status:page.status,statusText:page.statusText,elapsedMs:page.elapsedMs,redirects:page.redirects,headers:safeHeaders,htmlBytes:new TextEncoder().encode(page.text).byteLength},
    meta:html,
    robots:(mode==='full'||mode==='seo')?robots:null,
    sitemap:(mode==='full'||mode==='seo')?sitemap:null,
    security,
    ssl:{https:true,secureConnection:page.status>0,hsts:Boolean(security.headers.hsts),httpRedirectToHttps:true},
    technologies:[...new Set(technologies)],
    seoScore:score(page,html,robots,sitemap),
    fetchedAt:new Date().toISOString(),
  });
}

export default{
  async fetch(request:Request,env:Env):Promise<Response>{
    const url=new URL(request.url);
    if(url.pathname==='/api/tools/website-analysis'&&request.method==='POST'){
      try{
        const body=await request.clone().json() as {url?:string;mode?:WebsiteAnalysisMode};
        const input=normalizeInput(body.url||'');
        if(isToolmeraHost(input.hostname))return await selfAnalysis(request,env,body);
      }catch(error){
        return json({error:error instanceof Error?error.message:'Website analysis failed.'},400);
      }
    }
    return appWorker.fetch(request,env as any);
  },
};
