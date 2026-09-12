import appWorker, { SeoDeploymentStore, SeoTaskStore } from './workerWithDeployments';

export { SeoDeploymentStore, SeoTaskStore };

type AssetBinding={fetch(request:Request):Promise<Response>};
type Env={ASSETS:AssetBinding;[key:string]:unknown};
type WebsiteAnalysisMode='full'|'traffic'|'seo'|'meta'|'status'|'redirect'|'robots'|'sitemap'|'ssl'|'security'|'technology';

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
  const page=await fetchAsset(env,input);

  if(mode==='traffic'){
    const upstream=await appWorker.fetch(request,env as any);
    if(!upstream.ok)return upstream;
    const payload=await upstream.json() as Record<string,unknown>;
    payload.page={requestedUrl:page.requestedUrl,finalUrl:page.finalUrl,status:page.status,statusText:page.statusText,elapsedMs:page.elapsedMs,redirects:page.redirects,headers:{server:page.headers['server']||'Cloudflare',contentType:page.headers['content-type']||'',cacheControl:page.headers['cache-control']||'',contentEncoding:page.headers['content-encoding']||'',xRobotsTag:page.headers['x-robots-tag']||'',location:page.headers['location']||''},htmlBytes:new TextEncoder().encode(page.text).byteLength};
    return json(payload);
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
