'use client';

import { useEffect, useRef } from 'react';

type MetricRow={clicks:number;impressions:number;ctr:number;position:number};
type PageRow=MetricRow&{page:string};
type GscData={connected:true;pages?:PageRow[]};
type Verification='Winner'|'Neutral'|'Loser'|'Low data';
type TaskRecord={
  status?:string;
  owner?:string;
  completedAt?:string;
  verifyAt?:string;
  baseline7?:MetricRow;
  snapshot?:{path?:string};
  verification?:{
    verdict:Verification;
    verifiedAt:string;
    current7:MetricRow;
    impressionChange:number|null;
    clickChange:number|null;
    positionGain:number;
  };
  [key:string]:unknown;
};

const taskStorageKey='toolmera-seo-task-state-v1';
const empty:MetricRow={clicks:0,impressions:0,ctr:0,position:0};

function normalizePath(value:string){
  try{
    const pathname=new URL(value,'https://toolmera.com').pathname||'/';
    return pathname==='/'?'/':pathname.replace(/\/+$/,'')+'/';
  }catch{return value}
}

function relativeChange(current:number,previous:number){
  if(previous<=0)return current>0?null:0;
  return (current-previous)/previous;
}

function daysSince(value:string){
  const then=new Date(`${value}T00:00:00Z`).getTime();
  const now=new Date();
  const today=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
  return Math.max(0,Math.floor((today-then)/86400000));
}

function daysUntil(value:string){
  const target=new Date(`${value}T00:00:00Z`).getTime();
  const now=new Date();
  const today=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
  return Math.ceil((target-today)/86400000);
}

function verdict(current:MetricRow,baseline:MetricRow):Verification{
  if(current.impressions+baseline.impressions<2)return 'Low data';
  const impressions=relativeChange(current.impressions,baseline.impressions);
  const positionGain=current.position&&baseline.position?baseline.position-current.position:0;
  let score=0;
  if(impressions===null&&current.impressions>=2)score+=2;
  else if(impressions!==null&&impressions>=.25)score+=2;
  else if(impressions!==null&&impressions<=-.25)score-=2;
  if(positionGain>=3)score+=2;
  else if(positionGain<=-3)score-=2;
  if(current.clicks>baseline.clicks&&current.clicks>=1)score+=1;
  else if(baseline.clicks>=1&&current.clicks<baseline.clicks)score-=1;
  if(score>=2)return 'Winner';
  if(score<=-2)return 'Loser';
  return 'Neutral';
}

export function AdminSeoVerificationRecorder(){
  const busy=useRef(false);

  useEffect(()=>{
    let cancelled=false;
    const run=async()=>{
      if(cancelled||busy.current)return;
      busy.current=true;
      try{
        const raw=window.localStorage.getItem(taskStorageKey);
        if(!raw)return;
        const tasks=JSON.parse(raw) as Record<string,TaskRecord>;
        const due=Object.entries(tasks).filter(([,record])=>record?.status==='Done'&&record.verifyAt&&daysUntil(record.verifyAt)<=0&&!record.verification&&record.baseline7&&record.snapshot?.path);
        if(!due.length)return;

        const response=await fetch('/api/admin/gsc?range=7d',{cache:'no-store'});
        if(!response.ok)return;
        const data=await response.json() as GscData;
        if(cancelled)return;
        const pages=new Map((data.pages||[]).map(row=>[normalizePath(row.page),row]));
        let changed=false;
        const now=new Date().toISOString();

        for(const [id,record] of due){
          const path=normalizePath(record.snapshot?.path||'');
          const current=pages.get(path)||empty;
          const baseline=record.baseline7||empty;
          const result=verdict(current,baseline);
          // Give low-data tasks a full 14 final-data days (+2 reporting-lag days) before closing them as inconclusive.
          if(result==='Low data'&&record.completedAt&&daysSince(record.completedAt)<16)continue;
          tasks[id]={
            ...record,
            verification:{
              verdict:result,
              verifiedAt:now,
              current7:current,
              impressionChange:relativeChange(current.impressions,baseline.impressions),
              clickChange:relativeChange(current.clicks,baseline.clicks),
              positionGain:current.position&&baseline.position?baseline.position-current.position:0,
            },
          };
          changed=true;
        }

        if(changed){
          window.localStorage.setItem(taskStorageKey,JSON.stringify(tasks));
          window.dispatchEvent(new Event('toolmera-seo-task-state-changed'));
        }
      }catch{}
      finally{busy.current=false}
    };

    void run();
    const interval=window.setInterval(()=>void run(),60000);
    const onStorage=(event:StorageEvent)=>{if(event.key===taskStorageKey)void run()};
    window.addEventListener('storage',onStorage);
    return()=>{cancelled=true;window.clearInterval(interval);window.removeEventListener('storage',onStorage)};
  },[]);

  return null;
}
