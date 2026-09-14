'use client';

type CacheEntry={expiresAt:number;value:unknown};
type StoredGsc<T>={snapshotDay:string;snapshotAt:string;value:T};

const cache=new Map<string,CacheEntry>();
const inflight=new Map<string,Promise<unknown>>();
const gscStoragePrefix='toolmera-admin-gsc-daily-v1:';

function now(){return Date.now()}
function utcDay(){return new Date().toISOString().slice(0,10)}
function nextUtcMidnight(){
  const date=new Date();
  return Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()+1,0,0,0,0);
}

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

export async function fetchAdminGsc<T>(range:string,force=false):Promise<T>{
  const url=`/api/admin/gsc?range=${encodeURIComponent(range)}`;
  const storageKey=`${gscStoragePrefix}${range}`;
  const today=utcDay();

  if(force){
    cache.delete(url);
    try{localStorage.removeItem(storageKey)}catch{}
  }else{
    try{
      const raw=localStorage.getItem(storageKey);
      if(raw){
        const stored=JSON.parse(raw) as StoredGsc<T>;
        if(stored?.snapshotDay===today&&stored.value)return stored.value;
      }
    }catch{}

    const cached=cache.get(url);
    if(cached&&cached.expiresAt>now())return cached.value as T;
  }

  const existing=inflight.get(url);
  if(existing)return existing as Promise<T>;

  const request=(async()=>{
    // This endpoint is snapshot-only on the Worker. Even force=true never calls
    // Google directly; it only re-reads the already persisted daily snapshot.
    const response=await fetch(url,{cache:'no-store'});
    const payload=await response.json() as T&{detail?:string;message?:string;error?:string;fetchedAt?:string};
    if(!response.ok){
      const detail=(payload as any)?.detail||(payload as any)?.message||(payload as any)?.error||`Daily GSC snapshot request failed (${response.status}).`;
      throw new Error(detail);
    }

    const snapshotAt=response.headers.get('x-toolmera-gsc-snapshot-at')||((payload as any)?.fetchedAt as string)||new Date().toISOString();
    const snapshotDay=snapshotAt.slice(0,10);
    const expiresAt=Math.max(now()+60000,nextUtcMidnight());
    cache.set(url,{expiresAt,value:payload});

    try{
      localStorage.setItem(storageKey,JSON.stringify({snapshotDay,snapshotAt,value:payload} satisfies StoredGsc<T>));
    }catch{}

    return payload as T;
  })();

  inflight.set(url,request);
  try{return await request}
  finally{inflight.delete(url)}
}

export function clearAdminApiCache(prefix='/api/admin/'){
  for(const key of cache.keys())if(key.startsWith(prefix))cache.delete(key);
  if(prefix.startsWith('/api/admin')){
    try{
      for(let i=localStorage.length-1;i>=0;i--){
        const key=localStorage.key(i);
        if(key?.startsWith(gscStoragePrefix))localStorage.removeItem(key);
      }
    }catch{}
  }
}

export function adminApiCacheStats(){
  return {cached:cache.size,inflight:inflight.size};
}
