'use client';

import { CheckCircle2, Clock3, History, RefreshCw, UserRound } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './AdminSeoActivityLog.module.css';

type MetricSnapshot={clicks:number;impressions:number;ctr:number;position:number};
type TaskSnapshot={toolName:string;path:string;priority:string;type:string;title:string;query:string};
type AuditEvent={
  id:string;
  at:string;
  revision:number;
  taskId:string;
  kind:'status'|'owner'|'verification';
  actor:string;
  from?:string;
  to?:string;
  snapshot:TaskSnapshot;
  baseline7?:MetricSnapshot;
  verifyAt?:string;
  verification?:string;
  current7?:MetricSnapshot;
  impressionChange?:number|null;
  clickChange?:number|null;
  positionGain?:number;
};
type SharedState={history?:AuditEvent[];revision:number;updatedAt:string};
type Filter='all'|'status'|'owner'|'done'|'verified';

function eventTitle(event:AuditEvent){
  if(event.kind==='verification')return `Verification closed · ${event.verification||'Result recorded'}`;
  if(event.kind==='owner')return `Assignee changed to ${event.to||event.actor}`;
  if(event.to==='Done')return 'Task marked Done';
  if(event.to==='In progress')return 'Task started';
  if(event.to==='Snoozed')return 'Task snoozed';
  if(event.to==='Open')return 'Task reopened';
  return `Status changed to ${event.to||'Unknown'}`;
}

function eventTone(event:AuditEvent){
  if(event.kind==='verification'){
    if(event.verification==='Winner')return styles.green;
    if(event.verification==='Loser')return styles.red;
    if(event.verification==='Neutral')return styles.blue;
    return styles.amber;
  }
  if(event.kind==='owner')return styles.blue;
  if(event.to==='Done')return styles.green;
  if(event.to==='Snoozed')return styles.amber;
  if(event.to==='In progress')return styles.purple;
  return styles.muted;
}

function compactDate(value:string){
  if(!value)return '—';
  const date=new Date(value);
  return `${date.toLocaleDateString([],{month:'short',day:'2-digit'})} · ${date.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`;
}

function percentDelta(value:number|null|undefined){
  if(value===null)return 'NEW';
  if(value===undefined||!Number.isFinite(value))return '—';
  return `${value>=0?'+':''}${Math.round(value*100)}%`;
}

function positionDelta(value:number|undefined){
  if(value===undefined||!Number.isFinite(value))return '—';
  return `${value>=0?'+':''}${value.toFixed(1)}`;
}

export function AdminSeoActivityLog(){
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [history,setHistory]=useState<AuditEvent[]>([]);
  const [revision,setRevision]=useState(0);
  const [updatedAt,setUpdatedAt]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [filter,setFilter]=useState<Filter>('all');

  useEffect(()=>{
    const syncHost=()=>{
      const stateBar=document.querySelector('[class*="stateBar"]') as HTMLElement|null;
      const panel=stateBar?.closest('section') as HTMLElement|null;
      if(!panel||!panel.parentElement){
        document.getElementById('toolmera-seo-activity-host')?.remove();
        setHost(null);
        return;
      }
      let node=document.getElementById('toolmera-seo-activity-host');
      if(!node){
        node=document.createElement('div');
        node.id='toolmera-seo-activity-host';
        panel.parentElement.insertBefore(node,panel.nextSibling);
      }
      setHost(node);
    };
    syncHost();
    const observer=new MutationObserver(syncHost);
    observer.observe(document.body,{subtree:true,childList:true});
    const interval=window.setInterval(syncHost,1200);
    return()=>{observer.disconnect();window.clearInterval(interval);document.getElementById('toolmera-seo-activity-host')?.remove()};
  },[]);

  const load=useCallback(async(silent=false)=>{
    if(!silent)setLoading(true);
    try{
      const response=await fetch('/api/admin/seo-tasks',{cache:'no-store'});
      const payload=await response.json() as SharedState|{error?:string;message?:string};
      if(!response.ok)throw new Error('message' in payload&&payload.message?payload.message:'error' in payload&&payload.error?payload.error:'Could not load SEO activity history.');
      const state=payload as SharedState;
      setHistory(Array.isArray(state.history)?state.history:[]);
      setRevision(state.revision||0);
      setUpdatedAt(state.updatedAt||'');
      setError('');
    }catch(e){setError(e instanceof Error?e.message:'Could not load SEO activity history.')}
    finally{if(!silent)setLoading(false)}
  },[]);

  useEffect(()=>{
    if(!host)return;
    void load();
    const interval=window.setInterval(()=>void load(true),15000);
    return()=>window.clearInterval(interval);
  },[host,load]);

  const summary=useMemo(()=>({
    done:history.filter(item=>item.kind==='status'&&item.to==='Done').length,
    started:history.filter(item=>item.kind==='status'&&item.to==='In progress').length,
    verified:history.filter(item=>item.kind==='verification').length,
    reassigned:history.filter(item=>item.kind==='owner').length,
  }),[history]);

  const visible=useMemo(()=>history.filter(item=>{
    if(filter==='status')return item.kind==='status';
    if(filter==='owner')return item.kind==='owner';
    if(filter==='done')return item.kind==='status'&&item.to==='Done';
    if(filter==='verified')return item.kind==='verification';
    return true;
  }).slice(0,50),[history,filter]);

  if(!host)return null;

  return createPortal(<section className={styles.panel}>
    <div className={styles.head}>
      <div>
        <span className={styles.kicker}>SEO ACTIVITY LOG · PERSISTENT AUDIT TRAIL</span>
        <h2>Who changed what, when, and did it actually work?</h2>
        <p>Durable history of task status, assignee changes and automatic post-action verification. Completed work keeps its baseline, final 7-day result and ranking deltas across devices and browser resets.</p>
      </div>
      <div className={styles.actions}>
        <button onClick={()=>void load()} disabled={loading}><RefreshCw size={11}/>{loading?'Refreshing':'Refresh'}</button>
        <span><History size={11}/>rev {revision}</span>
      </div>
    </div>

    <div className={styles.summary}>
      <div><span>Completed</span><strong>{summary.done}</strong><small>Done events</small></div>
      <div><span>Started</span><strong>{summary.started}</strong><small>In progress</small></div>
      <div><span>Verified</span><strong>{summary.verified}</strong><small>Closed-loop results</small></div>
      <div><span>Reassigned</span><strong>{summary.reassigned}</strong><small>Owner changes</small></div>
    </div>

    <div className={styles.toolbar}>
      <div className={styles.filters}>{(['all','status','owner','done','verified'] as Filter[]).map(value=><button key={value} className={filter===value?styles.active:''} onClick={()=>setFilter(value)}>{value==='all'?'All activity':value==='status'?'Status changes':value==='owner'?'Assignees':value==='done'?'Completed':'Verified'}</button>)}</div>
      <small>{updatedAt?`Last shared update ${compactDate(updatedAt)}`:'Waiting for shared task activity'}</small>
    </div>

    {error&&<div className={styles.error}>{error}</div>}
    {!error&&visible.length===0?<div className={styles.empty}><History size={18}/><strong>No activity yet</strong><span>Change a task status or assignee in SEO Action Center and it will appear here permanently.</span></div>:
    <div className={styles.timeline}>{visible.map(event=><article className={styles.event} key={event.id}>
      <div className={`${styles.icon} ${eventTone(event)}`}>{event.kind==='owner'?<UserRound size={12}/>:event.kind==='verification'||event.to==='Done'?<CheckCircle2 size={12}/>:<Clock3 size={12}/>}</div>
      <div className={styles.main}>
        <div className={styles.eventTop}><strong>{eventTitle(event)}</strong><span>{compactDate(event.at)}</span></div>
        <a href={event.snapshot.path||'/'} target="_blank" rel="noreferrer">{event.snapshot.toolName||'Unknown page'}</a>
        <p>{event.snapshot.title||event.snapshot.type}{event.snapshot.query?` · “${event.snapshot.query}”`:''}</p>
        <div className={styles.meta}><span>{event.snapshot.priority||'—'}</span><span>{event.snapshot.type||'Task'}</span><span>by {event.actor||'Admin'}</span><span>revision {event.revision}</span></div>
      </div>
      <div className={styles.change}>
        {event.kind==='verification'?<><small>Final result</small><strong>{event.verification||'Recorded'}</strong></>:event.kind==='status'?<><small>Status</small><strong>{event.from||'Open'} → {event.to||'—'}</strong></>:<><small>Assignee</small><strong>{event.from||'—'} → {event.to||'—'}</strong></>}
        {event.kind==='verification'&&<div className={styles.baseline}><span><small>Impr. Δ</small><b>{percentDelta(event.impressionChange)}</b></span><span><small>Pos. Δ</small><b>{positionDelta(event.positionGain)}</b></span><span><small>Clicks Δ</small><b>{percentDelta(event.clickChange)}</b></span></div>}
        {event.to==='Done'&&event.baseline7&&<div className={styles.baseline}><span><small>7d impr.</small><b>{Math.round(event.baseline7.impressions)}</b></span><span><small>Position</small><b>{event.baseline7.position?event.baseline7.position.toFixed(1):'—'}</b></span><span><small>Verify</small><b>{event.verifyAt||'—'}</b></span></div>}
      </div>
    </article>)}</div>}
  </section>,host);
}
