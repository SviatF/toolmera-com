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
  [key:string]:unknown;
};
type ExecutionContextLike={waitUntil(promise:Promise<unknown>):void};
type ScheduledControllerLike={cron?:string;scheduledTime?:number};
type Snapshot={body:string;status:number;headers:Headers};
type GscEntry={range:string;body:string;status:number;storedAt:string};
type GscSnapshotState={
  version:1;
  day:string;
  updatedAt:string;
  entries:Record<string,GscEntry>;
};

const gscStorageKey='toolmera-gsc-daily-snapshot-v1';
const gscStoreName='toolmera-global-seo-data';
const gscRanges=['today','7d','28d','3m'] as const;

function json(data:unknown,status=200){
  return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex, nofollow'}});
}

function utcDay(){return new Date().toISOString().slice(0,10)}

export class SeoDataStore{
  private state:DurableObjectStateLike;
  constructor(state:DurableObjectStateLike){this.state=state}

  async fetch(request:Request):Promise<Response>{
    const url=new URL(request.url);
    const current=await this.state.storage.get<GscSnapshotState>(gscStorageKey);

    if(request.method==='GET'&&url.pathname==='/meta'){
      return json(current?{version:current.version,day:current.day,updatedAt:current.updatedAt,ranges:Object.keys(current.entries)}:{version:1,day:'',updatedAt:'',ranges:[]});
    }

    if(request.method==='GET'&&url.pathname==='/gsc'){
      const range=url.searchParams.get('range')||'28d';
      const entry=current?.entries?.[range];
      if(!entry)return json({error:'GSC daily snapshot is not ready yet.',range},404);
      return new Response(entry.body,{
        status:entry.status,
        headers:{
          'content-type':'application/json; charset=utf-8',
          'cache-control':'no-store',
          'x-robots-tag':'noindex, nofollow',
          'x-toolmera-gsc-source':'daily-snapshot',
          'x-toolmera-gsc-snapshot-at':entry.storedAt,
        },
      });
    }

    if(request.method==='PUT'&&url.pathname==='/gsc'){
      let payload:{day?:unknown;storedAt?:unknown;entries?:unknown};
      try{payload=await request.json() as {day?:unknown;storedAt?:unknown;entries?:unknown}}
      catch{return json({error:'Invalid snapshot payload.'},400)}

      const day=typeof payload.day==='string'?payload.day.slice(0,10):utcDay();
      const storedAt=typeof payload.storedAt==='string'?payload.storedAt:new Date().toISOString();
      const supplied=payload.entries&&typeof payload.entries==='object'&&!Array.isArray(payload.entries)?payload.entries as Record<string,unknown>:{};
      const entries={...(current?.entries||{})};

      for(const range of gscRanges){
        const raw=supplied[range];
        if(!raw||typeof raw!=='object'||Array.isArray(raw))continue;
        const item=raw as Record<string,unknown>;
        if(typeof item.body!=='string'||typeof item.status!=='number')continue;
        entries[range]={range,body:item.body,status:item.status,storedAt};
      }

      const next:GscSnapshotState={version:1,day,updatedAt:storedAt,entries};
      await this.state.storage.put(gscStorageKey,next);
      return json({ok:true,day,updatedAt:storedAt,ranges:Object.keys(entries)});
    }

    return json({error:'Not found'},404);
  }
}

// GSC is intentionally NOT in this short-lived cache. It is served from the
// persistent daily snapshot below, so opening/refreshing Admin never hits Google.
const adminCacheTtl:Record<string,number>={
  '/api/admin/status':300,
  '/api/admin/ga4':300,
  '/api/admin/cloudflare':60,
  '/api/admin/bing':900,
};

// Coalesce identical cache misses inside an isolate so a burst of clients cannot
// fan out into duplicate Google/Bing/Cloudflare upstream work before cache.put lands.
const inflight=new Map<string,Promise<Snapshot>>();
let gscRefreshInflight:Promise<void>|null=null;

function cacheKeyFor(url:URL){
  return new Request(`https://toolmera.com/__admin-api-cache${url.pathname}${url.search}`);
}

function browserResponse(body:string,status:number,headers:Headers,cacheState:'HIT'|'MISS'|'COALESCED'){
  const next=new Headers(headers);
  next.set('cache-control','no-store');
  next.set('x-toolmera-admin-cache',cacheState);
  return new Response(body,{status,headers:next});
}

function seoDataStub(env:Env){
  if(!env.SEO_DATA)return null;
  const id=env.SEO_DATA.idFromName(gscStoreName);
  return env.SEO_DATA.get(id);
}

async function readGscSnapshot(env:Env,range:string){
  const stub=seoDataStub(env);
  if(!stub)return null;
  const response=await stub.fetch(new Request(`https://seo-data-store/gsc?range=${encodeURIComponent(range)}`));
  if(response.status===404)return null;
  return response;
}

async function snapshotMeta(env:Env){
  const stub=seoDataStub(env);
  if(!stub)return null;
  const response=await stub.fetch(new Request('https://seo-data-store/meta'));
  if(!response.ok)return null;
  return await response.json() as {day?:string;updatedAt?:string;ranges?:string[]};
}

async function refreshDailyGsc(env:Env,reason:'cron'|'bootstrap'){
  if(!env.SEO_DATA)throw new Error('SEO_DATA Durable Object binding is not configured.');
  if(gscRefreshInflight)return gscRefreshInflight;

  const work=(async()=>{
    const day=utcDay();
    const meta=await snapshotMeta(env);
    // Cron retries or duplicate scheduled events must not fetch Google twice in one UTC day.
    if(reason==='cron'&&meta?.day===day&&gscRanges.every(range=>meta.ranges?.includes(range)))return;

    const storedAt=new Date().toISOString();
    const entries:Record<string,{body:string;status:number}>={};

    // Run sequentially to avoid a subrequest burst. This is the ONLY place that
    // calls the live GSC handler. Admin page views only read the stored snapshot.
    for(const range of gscRanges){
      const request=new Request(`https://toolmera.com/api/admin/gsc?range=${encodeURIComponent(range)}`,{
        headers:{'x-toolmera-internal-snapshot':'1'},
      });
      const internalEnv={...env,REQUIRE_ACCESS:'false'};
      const response=await appWorker.fetch(request,internalEnv as any);
      const body=await response.text();
      if(response.ok)entries[range]={body,status:response.status};
    }

    if(!Object.keys(entries).length)throw new Error('Daily GSC refresh returned no successful ranges.');
    const stub=seoDataStub(env)!;
    const save=await stub.fetch(new Request('https://seo-data-store/gsc',{
      method:'PUT',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({day,storedAt,entries}),
    }));
    if(!save.ok)throw new Error(`Could not persist daily GSC snapshot (${save.status}).`);
  })();

  gscRefreshInflight=work;
  try{await work}
  finally{gscRefreshInflight=null}
}

async function dailyGscResponse(request:Request,env:Env){
  const url=new URL(request.url);
  const range=url.searchParams.get('range')||'28d';

  let snapshot=await readGscSnapshot(env,range);
  if(snapshot)return snapshot;

  // One-time bootstrap after first deployment. It seeds all ranges once; after that
  // only the midnight cron talks to Google. Never fall back to per-view live GSC.
  try{await refreshDailyGsc(env,'bootstrap')}
  catch(error){
    return json({
      error:'Daily GSC snapshot is not ready.',
      detail:error instanceof Error?error.message:'Snapshot bootstrap failed.',
    },503);
  }

  snapshot=await readGscSnapshot(env,range);
  return snapshot||json({error:'Daily GSC snapshot is not ready.',range},503);
}

export default{
  async fetch(request:Request,env:Env,ctx?:ExecutionContextLike):Promise<Response>{
    void ctx;
    const url=new URL(request.url);

    // Keep Cloudflare Access authoritative before serving any stored admin data.
    if(url.pathname.startsWith('/api/admin/')&&env.REQUIRE_ACCESS==='true'&&!request.headers.get('Cf-Access-Jwt-Assertion')){
      return appWorker.fetch(request,env as any);
    }

    if(request.method==='GET'&&url.pathname==='/api/admin/gsc'){
      return dailyGscResponse(request,env);
    }

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
    }finally{
      inflight.delete(signature);
    }
  },

  async scheduled(_controller:ScheduledControllerLike,env:Env,ctx:ExecutionContextLike){
    ctx.waitUntil(refreshDailyGsc(env,'cron'));
  },
};
