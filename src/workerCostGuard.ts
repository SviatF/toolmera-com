import appWorker, { SeoDeploymentStore, SeoTaskStore } from './workerSelfSeo';

export { SeoDeploymentStore, SeoTaskStore };

type Env={REQUIRE_ACCESS?:string;[key:string]:unknown};
type ExecutionContextLike={waitUntil(promise:Promise<unknown>):void};

const adminCacheTtl:Record<string,number>={
  '/api/admin/status':60,
  '/api/admin/gsc':120,
  '/api/admin/ga4':120,
  '/api/admin/cloudflare':30,
  '/api/admin/bing':300,
};

function cacheKeyFor(url:URL){
  return new Request(`https://toolmera.com/__admin-api-cache${url.pathname}${url.search}`);
}

function browserResponse(body:string,status:number,headers:Headers,cacheState:'HIT'|'MISS'){
  const next=new Headers(headers);
  next.set('cache-control','no-store');
  next.set('x-toolmera-admin-cache',cacheState);
  return new Response(body,{status,headers:next});
}

export default{
  async fetch(request:Request,env:Env,ctx?:ExecutionContextLike):Promise<Response>{
    const url=new URL(request.url);
    const ttl=request.method==='GET'?adminCacheTtl[url.pathname]:undefined;

    if(!ttl)return appWorker.fetch(request,env as any);

    // Never let the cache bypass Cloudflare Access when it is enabled.
    if(env.REQUIRE_ACCESS==='true'&&!request.headers.get('Cf-Access-Jwt-Assertion')){
      return appWorker.fetch(request,env as any);
    }

    const cache=(caches as unknown as {default:Cache}).default;
    const key=cacheKeyFor(url);
    try{
      const cached=await cache.match(key);
      if(cached){
        const body=await cached.text();
        return browserResponse(body,cached.status,cached.headers,'HIT');
      }
    }catch{}

    const response=await appWorker.fetch(request,env as any);
    const body=await response.text();

    if(response.ok){
      const cacheHeaders=new Headers(response.headers);
      cacheHeaders.set('cache-control',`public, max-age=${ttl}`);
      cacheHeaders.set('x-toolmera-admin-cache','STORED');
      const write=cache.put(key,new Response(body,{status:response.status,headers:cacheHeaders}));
      if(ctx)ctx.waitUntil(write);
      else{try{await write}catch{}}
    }

    return browserResponse(body,response.status,response.headers,'MISS');
  },
};
