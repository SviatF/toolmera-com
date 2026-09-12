'use client';

import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './AdminSeoTaskSync.module.css';

type SharedTaskState={
  version:1;
  tasks:Record<string,unknown>;
  owner:string;
  updatedAt:string;
  revision:number;
};

type SyncState='loading'|'synced'|'saving'|'local'|'error';

const taskStorageKey='toolmera-seo-task-state-v1';
const ownerStorageKey='toolmera-seo-task-owner-v1';

function readLocal(){
  let tasks:Record<string,unknown>={};
  let owner='Sviat';
  try{
    const raw=window.localStorage.getItem(taskStorageKey);
    if(raw){
      const parsed=JSON.parse(raw);
      if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))tasks=parsed as Record<string,unknown>;
    }
    owner=window.localStorage.getItem(ownerStorageKey)||'Sviat';
  }catch{}
  return {tasks,owner};
}

function localSignature(){
  const local=readLocal();
  return JSON.stringify({tasks:local.tasks,owner:local.owner});
}

function serverSignature(state:SharedTaskState){
  return JSON.stringify({tasks:state.tasks||{},owner:state.owner||'Sviat'});
}

function applyServer(state:SharedTaskState){
  window.localStorage.setItem(taskStorageKey,JSON.stringify(state.tasks||{}));
  window.localStorage.setItem(ownerStorageKey,state.owner||'Sviat');
}

async function fetchShared(){
  const response=await fetch('/api/admin/seo-tasks',{cache:'no-store'});
  const payload=await response.json() as SharedTaskState|{message?:string;error?:string;code?:string};
  if(!response.ok)throw new Error('message' in payload&&payload.message?payload.message:'error' in payload&&payload.error?payload.error:'Could not load shared SEO task state.');
  return payload as SharedTaskState;
}

async function saveShared(tasks:Record<string,unknown>,owner:string){
  const response=await fetch('/api/admin/seo-tasks',{
    method:'PUT',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({tasks,owner}),
  });
  const payload=await response.json() as SharedTaskState|{message?:string;error?:string};
  if(!response.ok)throw new Error('message' in payload&&payload.message?payload.message:'error' in payload&&payload.error?payload.error:'Could not save shared SEO task state.');
  return payload as SharedTaskState;
}

export function AdminSeoTaskSync(){
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [status,setStatus]=useState<SyncState>('loading');
  const [lastSync,setLastSync]=useState('');
  const [detail,setDetail]=useState('Connecting shared task storage…');
  const lastLocal=useRef('');
  const lastServerRevision=useRef(0);
  const saving=useRef(false);
  const booted=useRef(false);

  useEffect(()=>{
    const syncHost=()=>{
      const bar=document.querySelector('[class*="stateBar"]') as HTMLElement|null;
      if(!bar){
        document.getElementById('toolmera-task-sync-host')?.remove();
        setHost(null);
        return;
      }
      let node=document.getElementById('toolmera-task-sync-host');
      if(!node){
        node=document.createElement('div');
        node.id='toolmera-task-sync-host';
        bar.appendChild(node);
      }
      setHost(node);
    };
    syncHost();
    const observer=new MutationObserver(syncHost);
    observer.observe(document.body,{subtree:true,childList:true});
    const interval=window.setInterval(syncHost,1200);
    return()=>{observer.disconnect();window.clearInterval(interval);document.getElementById('toolmera-task-sync-host')?.remove()};
  },[]);

  useEffect(()=>{
    let cancelled=false;
    const boot=async()=>{
      setStatus('loading');
      try{
        const server=await fetchShared();
        if(cancelled)return;
        const local=readLocal();
        const localSig=JSON.stringify(local);
        const remoteSig=serverSignature(server);
        const serverHasState=server.revision>0||Object.keys(server.tasks||{}).length>0;
        const localHasState=Object.keys(local.tasks).length>0||local.owner!=='Sviat';

        if(serverHasState&&localSig!==remoteSig){
          applyServer(server);
          lastLocal.current=remoteSig;
          lastServerRevision.current=server.revision;
          setStatus('synced');
          setLastSync(new Date().toISOString());
          setDetail('Shared state received. Reloading task board…');
          window.setTimeout(()=>window.location.reload(),120);
          return;
        }

        if(!serverHasState&&localHasState){
          const saved=await saveShared(local.tasks,local.owner);
          if(cancelled)return;
          lastServerRevision.current=saved.revision;
          lastLocal.current=serverSignature(saved);
        }else{
          lastServerRevision.current=server.revision;
          lastLocal.current=localSig;
        }
        booted.current=true;
        setStatus('synced');
        setLastSync(new Date().toISOString());
        setDetail('Shared across devices through Cloudflare Durable Objects.');
      }catch(error){
        if(cancelled)return;
        booted.current=true;
        lastLocal.current=localSignature();
        setStatus('local');
        setDetail(error instanceof Error?`${error.message} Using browser cache.`:'Using browser cache.');
      }
    };
    void boot();
    return()=>{cancelled=true};
  },[]);

  useEffect(()=>{
    const localWatcher=window.setInterval(async()=>{
      if(!booted.current||saving.current)return;
      const signature=localSignature();
      if(signature===lastLocal.current)return;
      const local=readLocal();
      lastLocal.current=signature;
      saving.current=true;
      setStatus('saving');
      setDetail('Saving shared SEO task state…');
      try{
        const saved=await saveShared(local.tasks,local.owner);
        lastServerRevision.current=saved.revision;
        lastLocal.current=serverSignature(saved);
        setStatus('synced');
        setLastSync(new Date().toISOString());
        setDetail('Shared across devices through Cloudflare Durable Objects.');
      }catch(error){
        lastLocal.current='';
        setStatus('error');
        setDetail(error instanceof Error?error.message:'Shared save failed.');
      }finally{saving.current=false}
    },1100);

    const remoteWatcher=window.setInterval(async()=>{
      if(!booted.current||saving.current)return;
      try{
        const server=await fetchShared();
        if(server.revision<=lastServerRevision.current)return;
        const remoteSig=serverSignature(server);
        const localSig=localSignature();
        lastServerRevision.current=server.revision;
        if(remoteSig===localSig){
          lastLocal.current=localSig;
          setStatus('synced');
          setLastSync(new Date().toISOString());
          return;
        }
        applyServer(server);
        lastLocal.current=remoteSig;
        setStatus('synced');
        setDetail('New task changes arrived from another device. Reloading…');
        window.setTimeout(()=>window.location.reload(),160);
      }catch(error){
        setStatus('local');
        setDetail(error instanceof Error?`${error.message} Using browser cache.`:'Using browser cache.');
      }
    },12000);

    return()=>{window.clearInterval(localWatcher);window.clearInterval(remoteWatcher)};
  },[]);

  if(!host)return null;
  const Icon=status==='local'||status==='error'?CloudOff:status==='saving'||status==='loading'?RefreshCw:Cloud;
  const label=status==='loading'?'Connecting':status==='saving'?'Saving':status==='synced'?'Shared sync':status==='local'?'Local fallback':'Sync error';
  const time=lastSync?new Date(lastSync).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'';

  return createPortal(<div className={`${styles.sync} ${status==='synced'?styles.ok:status==='saving'||status==='loading'?styles.busy:styles.warn}`} title={detail}>
    <Icon size={11}/><span>{label}</span>{time&&<small>{time}</small>}
  </div>,host);
}
