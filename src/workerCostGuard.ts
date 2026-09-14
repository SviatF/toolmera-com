import appWorker, { SeoDeploymentStore, SeoTaskStore } from './workerSelfSeo';

export { SeoDeploymentStore, SeoTaskStore };

type DurableStorageLike={
  get<T>(key:string):Promise<T|undefined>;
  put<T>(key:string,value:T):Promise<void>;
};
type DurableObjectStateLike={storage:DurableStorageLike};
type DurableObjectIdLike=unknown;
type DurableObjectStubLike={fetch(request:Request):Promise<Response>};
type DurableObjectNamespaceLike={
  idFromName(name:string):DurableObjectIdLike;
  get(id:DurableObjectIdLike):DurableObjectStubLike;
};
type Env={
  REQUIRE_ACCESS?:string;
  SEO_DATA?:DurableObjectNamespaceLike;
  GOOGLE_CLIENT_EMAIL?:string;
  GOOGLE_PRIVATE_KEY?:string;
  GSC_SITE_URL?:string;
  GA4_PROPERTY_ID?:string;
  CLOUDFLARE_ACCOUNT_ID?:string;
  CLOUDFLARE_ZONE_ID?:string;
  CLOUDFLARE_API_TOKEN?:string;
  BING_API_KEY?:string;
  [key:string]:unknown;
};
type ExecutionContextLike={waitUntil(promise:Promise<unknown>):void};
type ScheduledControllerLike={cron?:string;scheduledTime?:number};
type Snapshot={body:string;status:number;headers:Headers};
type AnalyticsSource='gsc'|'ga4'|'cloudflare'|'bing';
type SnapshotEntry={source:AnalyticsSource;range:string;body:string;status:number;storedAt:string};
type AnalyticsSnapshotState={
  version:2;
  day:string;
  updatedAt:string;
  entries:Record<string,SnapshotEntry>;
};

const snapshotStorageKey='toolmera-analytics-daily-snapshot-v2';
const dataStoreName='toolmera-global-seo-data';
const rangedSources:Record<Exclude<AnalyticsSource,'cloudflare'>,readonly string[]>={
  gsc:['today','7d','28d','3m'],
  ga4:['today','7d','28d','3m'],
  bing:['today','7d','28d','3m'],
};

function json(data:unknown,status=200){
  return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex, nofollow'}});
}
function utcDay(){return new Date().toISOString().slice(0,10)}
function snapshotKey(source:AnalyticsSource,range:string){return `${source}:${range}`}
function rangesFor(source:AnalyticsSource){return source==='cloudflare'?['default']:rangedSources[source]}
function sourceFromPath(pathname:string):AnalyticsSource|null{
  if(pathname==='/api/admin/gsc')return 'gsc';
  if(pathname==='/api/admin/ga4')return 'ga4';
  if(pathname==='/api/admin/cloudflare')return 'cloudflare';
  if(pathname==='/api/admin/bing')return 'bing';
  return null;
}
function sourceConfigured(source:AnalyticsSource,env:Env){
  if(source==='gsc')return Boolean(env.GOOGLE_CLIENT_EMAIL&&env.GOOGLE_PRIVATE_KEY&&env.GSC_SITE_URL);
  if(source==='ga4')return Boolean(env.GOOGLE_CLIENT_EMAIL&&env.GOOGLE_PRIVATE_KEY&&env.GA4_PROPERTY_ID);
  if(source==='cloudflare')return Boolean(env.CLOUDFLARE_ACCOUNT_ID&&env.CLOUDFLARE_ZONE_ID&&env.CLOUDFLARE_API_TOKEN);
  return Boolean(env.BING_API_KEY);
}
function liveUrl(source:AnalyticsSource,range:string){
  if(source==='cloudflare')return 'https://toolmera.com/api/admin/cloudflare';
  return `https://toolmera.com/api/admin/${source}?range=${encodeURIComponent(range)}`;
}

export class SeoDataStore{
  private state:DurableObjectStateLike;
  private env:Env;
  constructor(state:DurableObjectStateLike,env:Env){this.state=state;this.env=env}

  private async current(){
    return await this.state.storage.get<AnalyticsSnapshotState>(snapshotStorageKey)||{version:2 as const,day:'',updatedAt:'',entries:{}};
  }

  private async refreshSource(source:AnalyticsSource){
    if(!sourceConfigured(source,this.env))return json({ok:false,source,skipped:true,reason:'not-configured'},503);

    const today=utcDay();
    const current=await this.current();
    const ranges=rangesFor(source);
    const fresh=ranges.every(range=>current.entries[snapshotKey(source,range)]?.storedAt?.slice(0,10)===today);
    if(fresh)return json({ok:true,source,day:today,refreshed:false,ranges});

    const entries={...current.entries};
    const storedAt=new Date().toISOString();
    const errors:string[]=[];
    let refreshed=0;

    // This Durable Object is the only place that calls the live analytics handlers.
    // Each source is refreshed in its own DO invocation, keeping subrequests bounded.
    for(const range of ranges){
      const key=snapshotKey(source,range);
      if(entries[key]?.storedAt?.slice(0,10)===today)continue;
      const request=new Request(liveUrl(source,range),{headers:{'x-toolmera-internal-snapshot':'1'}});
      const internalEnv={...this.env,REQUIRE_ACCESS:'false'};
      try{
        const response=await appWorker.fetch(request,internalEnv as any);
        const body=await response.text();
        if(response.ok){
          entries[key]={source,range,body,status:response.status,storedAt};
          refreshed+=1;
        }else{
          errors.push(`${range}:${response.status}`);
        }
      }catch(error){
        errors.push(`${range}:${error instanceof Error?error.message:'fetch failed'}`);
      }
    }

    if(refreshed>0){
      const next:AnalyticsSnapshotState={version:2,day:today,updatedAt:storedAt,entries};
      await this.state.storage.put(snapshotStorageKey,next);
    }

    if(refreshed===0&&errors.length)return json({ok:false,source,day:today,errors},503);
    return json({ok:true,source,day:today,refreshed:true,ranges:refreshed,errors});
  }

  async fetch(request:Request):Promise<Response>{
    const url=new URL(request.url);
    const current=await this.current();

    if(request.method==='GET'&&url.pathname==='/meta'){
      const entries=Object.fromEntries(Object.entries(current.entries).map(([key,value])=>[key,value.storedAt]));
      return json({version:current.version,day:current.day,updatedAt:current.updatedAt,entries});
    }

    if(request.method==='GET'&&url.pathname==='/snapshot'){
      const source=url.searchParams.get('source') as AnalyticsSource|null;
      if(!source||!['gsc','ga4','cloudflare','bing'].includes(source))return json({error:'Invalid analytics source.'},400);
      const range=source==='cloudflare'?'default':(url.searchParams.get('range')||'28d');
      const entry=current.entries[snapshotKey(source,range)];
      if(!entry)return json({error:'Daily analytics snapshot is not ready yet.',source,range},404);
      return new Response(entry.body,{
        status:entry.status,
        headers:{
          'content-type':'application/json; charset=utf-8',
          'cache-control':'no-store',
          'x-robots-tag':'noindex, nofollow',
          'x-toolmera-analytics-source':'daily-snapshot',
          'x-toolmera-analytics-snapshot-at':entry.storedAt,
          'x-toolmera-analytics-provider':entry.source,
        },
      });
    }

    if(request.method==='POST'&&url.pathname==='/refresh'){
      const source=url.searchParams.get('source') as AnalyticsSource|null;
      if(!source||!['gsc','ga4','cloudflare','bing'].includes(source))return json({error:'Invalid analytics source.'},400);
      return await this.refreshSource(source);
    }

    return json({error:'Not found'},404);
  }
}

const inflight=new Map<string,Promise<Snapshot>>();
const adminCacheTtl:Record<string,number>={
  '/api/admin/status':300,
};

function cacheKeyFor(url:URL){return new Request(`https://toolmera.com/__admin-api-cache${url.pathname}${url.search}`)}
function browserResponse(body:string,status:number,headers:Headers,cacheState:'HIT'|'MISS'|'COALESCED'){
  const next=new Headers(headers);
  next.set('cache-control','no-store');
  next.set('x-toolmera-admin-cache',cacheState);
  return new Response(body,{status,headers:next});
}
function dataStub(env:Env){
  if(!env.SEO_DATA)return null;
  return env.SEO_DATA.get(env.SEO_DATA.idFromName(dataStoreName));
}
async function readSnapshot(env:Env,source:AnalyticsSource,range:string){
  const stub=dataStub(env);
  if(!stub)return null;
  const response=await stub.fetch(new Request(`https://seo-data-store/snapshot?source=${source}&range=${encodeURIComponent(range)}`));
  if(response.status===404)return null;
  return response;
}
async function refreshSource(env:Env,source:AnalyticsSource){
  const stub=dataStub(env);
  if(!stub)throw new Error('SEO_DATA Durable Object binding is not configured.');
  return await stub.fetch(new Request(`https://seo-data-store/refresh?source=${source}`,{method:'POST'}));
}
async function dailyAnalyticsResponse(request:Request,env:Env,source:AnalyticsSource){
  const url=new URL(request.url);
  const range=source==='cloudflare'?'default':(url.searchParams.get('range')||'28d');
  let snapshot=await readSnapshot(env,source,range);
  if(snapshot)return snapshot;

  // Bootstrap only when a source has never been snapshotted. After that, page views
  // can never cause a live provider fetch because the daily entry already exists.
  try{await refreshSource(env,source)}
  catch(error){
    return json({error:'Daily analytics snapshot is not ready.',detail:error instanceof Error?error.message:'Snapshot bootstrap failed.',source,range},503);
  }
  snapshot=await readSnapshot(env,source,range);
  return snapshot||json({error:'Daily analytics snapshot is not ready.',source,range},503);
}

export default{
  async fetch(request:Request,env:Env,ctx?:ExecutionContextLike):Promise<Response>{
    void ctx;
    const url=new URL(request.url);

    if(url.pathname.startsWith('/api/admin/')&&env.REQUIRE_ACCESS==='true'&&!request.headers.get('Cf-Access-Jwt-Assertion')){
      return appWorker.fetch(request,env as any);
    }

    const source=request.method==='GET'?sourceFromPath(url.pathname):null;
    if(source)return dailyAnalyticsResponse(request,env,source);

    const ttl=request.method==='GET'?adminCacheTtl[url.pathname]:undefined;
    if(!ttl)return appWorker.fetch(request,env as any);

    const cache=(caches as unknown as {default:Cache}).default;
    const key=cacheKeyFor(url);
    const signature=key.url;
    try{
      const cached=await cache.match(key);
      if(cached){
        const body=await cached.text();
        return browserResponse(body,cached.status,cached.headers,'HIT');
      }
    }catch{}

    const existing=inflight.get(signature);
    if(existing){
      const shared=await existing;
      return browserResponse(shared.body,shared.status,shared.headers,'COALESCED');
    }

    const work=(async():Promise<Snapshot>=>{
      const response=await appWorker.fetch(request,env as any);
      const body=await response.text();
      const headers=new Headers(response.headers);
      if(response.ok){
        const cacheHeaders=new Headers(headers);
        cacheHeaders.set('cache-control',`public, max-age=${ttl}`);
        cacheHeaders.set('x-toolmera-admin-cache','STORED');
        try{await cache.put(key,new Response(body,{status:response.status,headers:cacheHeaders}))}catch{}
      }
      return {body,status:response.status,headers};
    })();

    inflight.set(signature,work);
    try{
      const result=await work;
      return browserResponse(result.body,result.status,result.headers,'MISS');
    }finally{inflight.delete(signature)}
  },

  async scheduled(_controller:ScheduledControllerLike,env:Env,ctx:ExecutionContextLike){
    const sources=(['gsc','ga4','cloudflare','bing'] as AnalyticsSource[]).filter(source=>sourceConfigured(source,env));
    const stub=dataStub(env);
    if(!stub)return;
    // All providers refresh at the same 00:00 UTC cron. Each provider runs in its
    // own Durable Object request so one source cannot create a giant subrequest burst.
    ctx.waitUntil(Promise.all(sources.map(async source=>{
      const response=await stub.fetch(new Request(`https://seo-data-store/refresh?source=${source}`,{method:'POST'}));
      if(!response.ok){
        const detail=await response.text();
        throw new Error(`Daily ${source} snapshot failed: ${response.status} ${detail.slice(0,300)}`);
      }
    })).then(()=>undefined));
  },
};
