import { currencyPairs } from '../data/currencyPairs';

type DurableStorageLike={
  get<T>(key:string):Promise<T|undefined>;
  put<T>(key:string,value:T):Promise<void>;
};

type RateRow={date?:string;base?:string;quote?:string;rate?:number};
type HistoryPoint={date:string;rate:number};
type PairSnapshot={
  slug:string;
  from:string;
  to:string;
  rate:number;
  providerDate:string;
  updatedAt:string;
  history:HistoryPoint[];
};
type CurrencyState={
  version:1;
  hour:string;
  updatedAt:string;
  pairs:Record<string,PairSnapshot>;
};

const storageKey='toolmera-currency-rates-v1';
const api='https://api.frankfurter.dev/v2/rates';
const retentionDays=92;

function json(data:unknown,status=200){
  return new Response(JSON.stringify(data),{status,headers:{
    'content-type':'application/json; charset=utf-8',
    'cache-control':'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
    'x-robots-tag':'noindex, nofollow',
  }});
}

function hourBucket(){return new Date().toISOString().slice(0,13)}
function dayOffset(days:number){const d=new Date();d.setUTCDate(d.getUTCDate()-days);return d.toISOString().slice(0,10)}
function cleanCode(value:string){return value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,3)}

function groupedPairs(){
  const groups=new Map<string,Set<string>>();
  for(const pair of currencyPairs){
    const quotes=groups.get(pair.from)||new Set<string>();
    quotes.add(pair.to);
    groups.set(pair.from,quotes);
  }
  return groups;
}

async function fetchRows(base:string,quotes:string[],from?:string){
  const url=new URL(api);
  url.searchParams.set('base',base.toLowerCase());
  url.searchParams.set('quotes',quotes.map(q=>q.toLowerCase()).join(','));
  if(from)url.searchParams.set('from',from);
  const response=await fetch(url.toString(),{headers:{accept:'application/json','user-agent':'toolmera-currency/1.0'}});
  if(!response.ok)throw new Error(`Frankfurter ${base} request failed (${response.status}).`);
  const payload=await response.json();
  if(!Array.isArray(payload))throw new Error(`Frankfurter ${base} returned an invalid payload.`);
  return payload as RateRow[];
}

function historyMap(rows:RateRow[]){
  const out=new Map<string,HistoryPoint[]>();
  for(const row of rows){
    const quote=cleanCode(row.quote||'');
    const rate=Number(row.rate||0);
    const date=(row.date||'').slice(0,10);
    if(!quote||!date||!Number.isFinite(rate)||rate<=0)continue;
    const list=out.get(quote)||[];
    list.push({date,rate});
    out.set(quote,list);
  }
  for(const [quote,list] of out){
    const dedup=new Map(list.map(point=>[point.date,point]));
    out.set(quote,[...dedup.values()].sort((a,b)=>a.date.localeCompare(b.date)).slice(-retentionDays));
  }
  return out;
}

export async function refreshCurrencySnapshot(storage:DurableStorageLike,force=false){
  const previous=await storage.get<CurrencyState>(storageKey);
  const hour=hourBucket();
  if(!force&&previous?.hour===hour&&Object.keys(previous.pairs||{}).length>=currencyPairs.length){
    return json({ok:true,refreshed:false,hour,updatedAt:previous.updatedAt,pairs:Object.keys(previous.pairs).length});
  }

  const groups=groupedPairs();
  const currentRows=new Map<string,RateRow[]>();
  const historyRows=new Map<string,RateRow[]>();
  const needHistory=!previous||Object.keys(previous.pairs||{}).length<currencyPairs.length;
  const historyFrom=dayOffset(91);
  const errors:string[]=[];

  // Sequential by base keeps the hourly cron comfortably below the Worker subrequest cap.
  for(const [base,quotesSet] of groups){
    const quotes=[...quotesSet];
    try{currentRows.set(base,await fetchRows(base,quotes))}
    catch(error){errors.push(`${base}: ${error instanceof Error?error.message:'current fetch failed'}`)}
    if(needHistory){
      try{historyRows.set(base,await fetchRows(base,quotes,historyFrom))}
      catch(error){errors.push(`${base} history: ${error instanceof Error?error.message:'history fetch failed'}`)}
    }
  }

  const now=new Date().toISOString();
  const nextPairs:Record<string,PairSnapshot>={...previous?.pairs};
  let updated=0;

  for(const pair of currencyPairs){
    const current=(currentRows.get(pair.from)||[]).filter(row=>cleanCode(row.quote||'')===pair.to).sort((a,b)=>(a.date||'').localeCompare(b.date||'')).at(-1);
    const rate=Number(current?.rate||0);
    const old=previous?.pairs?.[pair.slug];
    if(!Number.isFinite(rate)||rate<=0){
      if(old)nextPairs[pair.slug]=old;
      continue;
    }

    const providerDate=(current?.date||now).slice(0,10);
    const seeded=needHistory?historyMap(historyRows.get(pair.from)||[]).get(pair.to)||[]:old?.history||[];
    const merged=new Map<string,HistoryPoint>((seeded||[]).map(point=>[point.date,point]));
    merged.set(providerDate,{date:providerDate,rate});
    const history=[...merged.values()].sort((a,b)=>a.date.localeCompare(b.date)).slice(-retentionDays);
    nextPairs[pair.slug]={slug:pair.slug,from:pair.from,to:pair.to,rate,providerDate,updatedAt:now,history};
    updated+=1;
  }

  if(!updated&&previous){
    return json({ok:true,refreshed:false,fallback:true,hour:previous.hour,updatedAt:previous.updatedAt,pairs:Object.keys(previous.pairs).length,errors});
  }
  if(!updated)return json({ok:false,error:'No currency rates could be refreshed.',errors},503);

  const next:CurrencyState={version:1,hour,updatedAt:now,pairs:nextPairs};
  await storage.put(storageKey,next);
  return json({ok:true,refreshed:true,hour,updatedAt:now,pairs:Object.keys(nextPairs).length,errors});
}

export async function currencySnapshotResponse(storage:DurableStorageLike,slug:string|null){
  const state=await storage.get<CurrencyState>(storageKey);
  if(!state)return json({error:'Currency snapshot is not ready yet.'},404);

  if(!slug){
    return json({
      updatedAt:state.updatedAt,
      source:'Frankfurter official-source reference rates',
      pairs:Object.values(state.pairs).map(pair=>({slug:pair.slug,from:pair.from,to:pair.to,rate:pair.rate,providerDate:pair.providerDate,updatedAt:pair.updatedAt})),
    });
  }

  const pair=state.pairs[slug.toLowerCase()];
  if(!pair)return json({error:'Currency pair is not active.'},404);
  return json({
    ...pair,
    source:'Frankfurter official-source reference rates',
    cadence:'hourly',
  });
}
