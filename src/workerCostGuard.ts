import appWorker, { SeoDeploymentStore, SeoTaskStore } from './workerSelfSeo';

export { SeoDeploymentStore, SeoTaskStore };

type Env={REQUIRE_ACCESS?:string;[key:string]:unknown};
type ExecutionContextLike={waitUntil(promise:Promise<unknown>):void};
type Snapshot={body:string;status:number;headers:Headers};

// GSC final data is intentionally delayed by ~2 days, so minute-level polling is wasteful.
// Keep server-side TTLs conservative enough for the dashboard while protecting Worker CPU.
const adminCacheTtl:Record<string,number>={
  '/api/admin/status':300,
  '/api/admin/gsc':900,
  '/api/admin/ga4':300,
  '/api/admin/cloudflare':60,
  '/api/admin/bing':900,
};

// Coalesce identical cache misses inside an isolate so a burst of clients cannot
// fan out into duplicate Google/Bing/Cloudflare upstream work before cache.put lands.
const inflight=new Map<string,Promise<Snapshot>>();

function cacheKeyFor(url:URL){
  return new Request(`https://toolmera.com/__admin-api-cache${url.pathname}${url.search}`);
}

function browserResponse(body:string,status:number,headers:Headers,cacheState:'HIT'|'MISS'|'COALESCED'){
  const next=new Headers(headers);
  next.set('cache-control','no-store');
  next.set('x-toolmera-admin-cache',cacheState);
  return new Response(body,{status,headers:next});
}

export default{
  async fetch(request:Request,env:Env,ctx?:ExecutionContextLike):Promise<Response>{
    void ctx;
    const url=new URL(request.url);
    const ttl=request.method==='GET'?adminCacheTtl[url.pathname]:undefined;

    if(!ttl)return appWorker.fetch(request,env as any);

    // Never let the cache bypass Cloudflare Access when it is enabled.
    if(env.REQUIRE_ACCESS==='true'&&!request.headers.get('Cf-Access-Jwt-Assertion')){
      return appWorker.fetch(request,env as any);
    }

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
};
