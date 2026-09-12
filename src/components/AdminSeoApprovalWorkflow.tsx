'use client';

import { Check, Clock3, RefreshCw, ShieldCheck, ShieldX, UserCheck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './AdminSeoApprovalWorkflow.module.css';

type Gate='AUTO-APPROVE'|'HUMAN REVIEW'|'BLOCK';
type Decision='Approved'|'Rejected'|'Overridden'|'Snoozed';
type LiveAction={
  actionKey:string;
  gate:Gate;
  path:string;
  type:string;
  tool:string;
  title:string;
  priority:string;
};
type ApprovalRecord={
  actionKey:string;
  decision:Decision;
  reviewer:string;
  note:string;
  guardrailDecision:Gate;
  updatedAt:string;
  snoozedUntil?:string;
  snapshot:{toolName:string;path:string;priority:string;type:string;title:string;query:string};
};
type ApprovalState={
  version:1;
  approvals:Record<string,ApprovalRecord>;
  updatedAt:string;
  revision:number;
};

const reviewerStorageKey='toolmera-seo-approval-reviewer-v1';

function scanActions():LiveAction[]{
  return [...document.querySelectorAll<HTMLElement>('[data-guardrail-row="true"]')].map(row=>({
    actionKey:row.dataset.actionKey||'',
    gate:(row.dataset.gate||'HUMAN REVIEW') as Gate,
    path:row.dataset.path||'/',
    type:row.dataset.type||'SEO action',
    tool:row.dataset.tool||'Unknown page',
    title:row.dataset.title||row.dataset.type||'SEO action',
    priority:row.dataset.priority||'—',
  })).filter(item=>item.actionKey&&item.path);
}

function plusDays(days:number){
  const date=new Date();
  date.setUTCDate(date.getUTCDate()+days);
  return date.toISOString().slice(0,10);
}

function compactDate(value:string){
  if(!value)return '—';
  const date=new Date(value);
  return `${date.toLocaleDateString([],{month:'short',day:'2-digit'})} · ${date.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`;
}

function gateTone(gate:Gate){
  if(gate==='AUTO-APPROVE')return styles.green;
  if(gate==='BLOCK')return styles.red;
  return styles.amber;
}

function decisionTone(decision:Decision|undefined){
  if(decision==='Approved'||decision==='Overridden')return styles.green;
  if(decision==='Rejected')return styles.red;
  if(decision==='Snoozed')return styles.amber;
  return styles.muted;
}

export function AdminSeoApprovalWorkflow(){
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [actions,setActions]=useState<LiveAction[]>([]);
  const [approvals,setApprovals]=useState<Record<string,ApprovalRecord>>({});
  const [revision,setRevision]=useState(0);
  const [reviewer,setReviewer]=useState('Sviat');
  const [notes,setNotes]=useState<Record<string,string>>({});
  const [saving,setSaving]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>{
    try{setReviewer(window.localStorage.getItem(reviewerStorageKey)||'Sviat')}catch{}
  },[]);

  useEffect(()=>{
    try{window.localStorage.setItem(reviewerStorageKey,reviewer)}catch{}
  },[reviewer]);

  const scan=useCallback(()=>setActions(scanActions()),[]);

  useEffect(()=>{
    const syncHost=()=>{
      const guardrailHost=document.getElementById('toolmera-seo-autopilot-host');
      if(!guardrailHost||!guardrailHost.parentElement){
        document.getElementById('toolmera-seo-approval-host')?.remove();
        setHost(null);
        return;
      }
      let node=document.getElementById('toolmera-seo-approval-host');
      if(!node){
        node=document.createElement('div');
        node.id='toolmera-seo-approval-host';
        guardrailHost.parentElement.insertBefore(node,guardrailHost.nextSibling);
      }
      setHost(node);
      scan();
    };
    syncHost();
    const observer=new MutationObserver(()=>{syncHost();scan()});
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    const interval=window.setInterval(()=>{syncHost();scan()},1400);
    return()=>{observer.disconnect();window.clearInterval(interval);document.getElementById('toolmera-seo-approval-host')?.remove()};
  },[scan]);

  const load=useCallback(async(silent=false)=>{
    if(!silent)setLoading(true);
    try{
      const response=await fetch('/api/admin/seo-approvals',{cache:'no-store'});
      const payload=await response.json() as ApprovalState|{error?:string;message?:string};
      if(!response.ok)throw new Error('message' in payload&&payload.message?payload.message:'error' in payload&&payload.error?payload.error:'Could not load SEO approvals.');
      const state=payload as ApprovalState;
      setApprovals(state.approvals||{});
      setRevision(state.revision||0);
      setError('');
    }catch(e){setError(e instanceof Error?e.message:'Could not load SEO approvals.')}
    finally{if(!silent)setLoading(false)}
  },[]);

  useEffect(()=>{
    if(!host)return;
    void load();
    const interval=window.setInterval(()=>void load(true),20000);
    return()=>window.clearInterval(interval);
  },[host,load]);

  const save=useCallback(async(item:LiveAction,decision:Decision)=>{
    if(saving)return;
    const cleanReviewer=reviewer.trim();
    const note=(notes[item.actionKey]??approvals[item.actionKey]?.note??'').trim();
    if(!cleanReviewer){setError('Reviewer name is required.');return}
    if(decision==='Overridden'&&note.length<4){setError('Override requires a clear reason in the reviewer note.');return}
    setSaving(item.actionKey);
    setError('');
    try{
      const response=await fetch('/api/admin/seo-approvals',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({
          actionKey:item.actionKey,
          decision,
          reviewer:cleanReviewer,
          note,
          guardrailDecision:item.gate,
          snoozedUntil:decision==='Snoozed'?plusDays(7):undefined,
          snapshot:{toolName:item.tool,path:item.path,priority:item.priority,type:item.type,title:item.title,query:''},
        }),
      });
      const payload=await response.json() as ApprovalState&{record?:ApprovalRecord}|{error?:string;message?:string};
      if(!response.ok)throw new Error('message' in payload&&payload.message?payload.message:'error' in payload&&payload.error?payload.error:'Could not save approval decision.');
      const state=payload as ApprovalState&{record?:ApprovalRecord};
      setApprovals(state.approvals||{});
      setRevision(state.revision||0);
      if(state.record)setNotes(previous=>({...previous,[item.actionKey]:state.record?.note||''}));
      window.dispatchEvent(new Event('toolmera-seo-approval-changed'));
    }catch(e){setError(e instanceof Error?e.message:'Could not save approval decision.')}
    finally{setSaving('')}
  },[approvals,notes,reviewer,saving]);

  const liveApprovals=useMemo(()=>actions.map(item=>approvals[item.actionKey]).filter(Boolean),[actions,approvals]);
  const summary=useMemo(()=>({
    approved:liveApprovals.filter(item=>item.decision==='Approved').length,
    overridden:liveApprovals.filter(item=>item.decision==='Overridden').length,
    rejected:liveApprovals.filter(item=>item.decision==='Rejected').length,
    snoozed:liveApprovals.filter(item=>item.decision==='Snoozed').length,
    pending:Math.max(0,actions.length-liveApprovals.length),
  }),[actions,liveApprovals]);

  if(!host)return null;

  return createPortal(<section className={styles.panel}>
    <div className={styles.head}>
      <div>
        <span className={styles.kicker}>SEO APPROVAL WORKFLOW · REVIEW → DECIDE → AUDIT</span>
        <h2>Human control before deployment</h2>
        <p>Approvals are persistent across devices and every decision is written into the SEO audit trail. A blocked guardrail cannot be approved directly — it requires an explicit override with a reason.</p>
      </div>
      <div className={styles.actions}>
        <label><span>Reviewer</span><input value={reviewer} onChange={event=>setReviewer(event.target.value)} placeholder="Name"/></label>
        <button onClick={()=>void load()} disabled={loading}><RefreshCw size={11}/>{loading?'Refreshing':'Refresh'}</button>
        <span><UserCheck size={11}/>rev {revision}</span>
      </div>
    </div>

    <div className={styles.summary}>
      <div><span>Pending</span><strong>{summary.pending}</strong><small>No decision yet</small></div>
      <div><span>Approved</span><strong>{summary.approved}</strong><small>Ready after review</small></div>
      <div><span>Overridden</span><strong>{summary.overridden}</strong><small>Blocked gate bypassed</small></div>
      <div><span>Rejected</span><strong>{summary.rejected}</strong><small>Do not execute</small></div>
      <div><span>Snoozed</span><strong>{summary.snoozed}</strong><small>Review later</small></div>
    </div>

    {error&&<div className={styles.error}>{error}</div>}
    {!error&&actions.length===0?<div className={styles.empty}><UserCheck size={18}/><strong>No live actions awaiting approval</strong><span>The workflow follows the current Autopilot Guardrails queue.</span></div>:
    <div className={styles.list}>{actions.map(item=>{
      const current=approvals[item.actionKey];
      const busy=saving===item.actionKey;
      const note=notes[item.actionKey]??current?.note??'';
      return <article className={styles.card} key={item.actionKey}>
        <div className={styles.identity}>
          <div className={styles.badges}><span className={`${styles.pill} ${gateTone(item.gate)}`}>{item.gate}</span><span className={styles.priority}>{item.priority}</span></div>
          <a href={item.path} target="_blank" rel="noreferrer"><strong>{item.tool}</strong><small>{item.path}</small></a>
          <p><b>{item.type}</b> · {item.title}</p>
        </div>
        <div className={styles.current}>
          <small>Approval state</small>
          <span className={`${styles.pill} ${decisionTone(current?.decision)}`}>{current?.decision||'Pending'}</span>
          <em>{current?`${current.reviewer} · ${compactDate(current.updatedAt)}`:'Awaiting reviewer'}</em>
          {current?.snoozedUntil&&<em>Snoozed until {current.snoozedUntil}</em>}
        </div>
        <div className={styles.review}>
          <textarea value={note} onChange={event=>setNotes(previous=>({...previous,[item.actionKey]:event.target.value}))} placeholder={item.gate==='BLOCK'?'Override reason required to bypass this block':'Reviewer note (optional)'}/>
          <div className={styles.buttons}>
            <button className={styles.approve} disabled={busy||item.gate==='BLOCK'} title={item.gate==='BLOCK'?'Blocked actions require Override':''} onClick={()=>void save(item,'Approved')}><Check size={11}/>Approve</button>
            <button className={styles.reject} disabled={busy} onClick={()=>void save(item,'Rejected')}><ShieldX size={11}/>Reject</button>
            {item.gate==='BLOCK'&&<button className={styles.override} disabled={busy} onClick={()=>void save(item,'Overridden')}><ShieldCheck size={11}/>Override</button>}
            <button className={styles.snooze} disabled={busy} onClick={()=>void save(item,'Snoozed')}><Clock3 size={11}/>Snooze 7d</button>
          </div>
        </div>
      </article>})}</div>}

    <div className={styles.legend}><b>Approve:</b><span>human sign-off for AUTO-APPROVE or HUMAN REVIEW gates.</span><b>Override:</b><span>the only path around a BLOCK and always requires a written reason.</span><b>Reject:</b><span>explicitly stops the action.</span><b>Snooze:</b><span>defers the decision for seven days without approving execution.</span></div>
  </section>,host);
}
