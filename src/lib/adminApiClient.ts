'use client';

type CacheEntry={expiresAt:number;value:unknown};

const cache=new Map<string,CacheEntry>();
const inflight=new Map<string,Promise<unknown>>();

function now(){return Date.now()}

export async function fetchAdminJson<T>(url:string,ttlMs=120000,force=false):Promise<T>{
  if(force)cache.delete(url);
  const cached=cache.get(url);
  if(!force&&cached&&cached.expiresAt>now())return cached.value as T;

  const existing=inflight.get(url);
  if(existing)return existing as Promise<T>;

  const request=(async()=>{
    const response=await fetch(url,{cache:'no-store'});
    const payload=await response.json() as T&{detail?:string;message?:string;error?:string};
    if(!response.ok){
      const detail=(payload as any)?.detail||(payload as any)?.message||(payload as any)?.error||`Admin API request failed (${response.status}).`;
      throw new Error(detail);
    }
    cache.set(url,{expiresAt:now()+ttlMs,value:payload});
    return payload as T;
  })();

  inflight.set(url,request);
  try{return await request}
  finally{inflight.delete(url)}
}

export function fetchAdminGsc<T>(range:string,force=false){
  return fetchAdminJson<T>(`/api/admin/gsc?range=${encodeURIComponent(range)}`,5*60*1000,force);
}

export function clearAdminApiCache(prefix='/api/admin/'){
  for(const key of cache.keys())if(key.startsWith(prefix))cache.delete(key);
}

export function adminApiCacheStats(){
  return {cached:cache.size,inflight:inflight.size};
}
