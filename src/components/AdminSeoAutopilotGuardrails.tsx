'use client';

import { Bot, RefreshCw, ShieldAlert, ShieldCheck, UserCheck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { buildOutcomeLearning, type OutcomeLearningRow, type SeoVerificationEvent } from '@/lib/seoOutcomeLearning';
import styles from './AdminSeoAutopilotGuardrails.module.css';

type Priority='P0'|'P1'|'P2'|'HOLD';
type ActionType='Cannibalization'|'Decay audit'|'Internal links'|'CTR'|'Content gap'|'Scale winner'|'Observation';
type Decision='AUTO-APPROVE'|'HUMAN REVIEW'|'BLOCK';
type ParsedAction={id:string;priority:Priority;type:ActionType;tool:string;path:string;title:string};
type GuardrailRow=ParsedAction&{decision:Decision;reason:string;evidence?:OutcomeLearningRow};
type SharedState={history?:unknown[];revision?:number};

const priorities:Priority[]=['P0','P1','P2','HOLD'];
const actionTypes:ActionType[]=['Cannibalization','Decay audit','Internal links','CTR','Content gap','Scale winner','Observation'];

function isVerificationEvent(value:unknown):value is SeoVerificationEvent{
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  const event=value as Partial<SeoVerificationEvent>;
  return event.kind==='verification'&&typeof event.id==='string'&&typeof event.at==='string'&&Boolean(event.snapshot&&typeof event.snapshot==='object');
}

function parseActions(host:HTMLElement|null):ParsedAction[]{
  if(!host)return [];
  const rows:Array<ParsedAction|null>=[...host.querySelectorAll('article')].map((article,index)=>{
    const text=(article.textContent||'').replace(/\s+/g,' ').trim();
    const priority=priorities.find(value=>new RegExp(`(^|\\s)${value}(\\s|$)`).test(text));
    const type=actionTypes.find(value=>text.includes(value));
    const links=[...article.querySelectorAll<HTMLAnchorElement>('a[href]')];
    const page=links.find(link=>{
      const href=link.getAttribute('href')||'';
      return href.startsWith('/')&&href!=='/';
    });
    if(!priority||!type||!page)return null;
    const path=page.getAttribute('href')||'/';
    const tool=page.querySelector('strong')?.textContent?.trim()||path;
    const strongs=[...article.querySelectorAll('strong')].map(node=>node.textContent?.trim()||'').filter(Boolean);
    const title=strongs.find(value=>value!==tool&&!/^“.*”$/.test(value))||type;
    return {id:`${path}-${type}-${index}`,priority,type,tool,path,title};
  });
  return rows.filter((row):row is ParsedAction=>Boolean(row));
}

function decide(item:ParsedAction,evidence:OutcomeLearningRow|undefined,riskyPages:Set<string>,blockedPages:Set<string>):GuardrailRow{
  if(item.priority==='HOLD'||item.type==='Observation'||blockedPages.has(item.path)){
    return {...item,evidence,decision:'BLOCK',reason:'Observation lock or insufficient evidence: autopilot must not change this page yet.'};
  }

  if(evidence&&evidence.decisive>=3&&(evidence.recommendation==='Caution'||evidence.score<=40)){
    return {...item,evidence,decision:'BLOCK',reason:`Verified ${item.type} outcomes are currently weak (${evidence.score}/100, ${evidence.decisive} decisive samples).`};
  }

  if(item.priority==='P0'||item.type==='Cannibalization'||item.type==='Decay audit'||riskyPages.has(item.path)){
    return {...item,evidence,decision:'HUMAN REVIEW',reason:'This page has conflict/decay risk, so a person must validate intent, canonical and rollback impact first.'};
  }

  const directional=evidence&&(evidence.confidence==='Directional'||evidence.confidence==='Strong');
  if(item.type==='Internal links'&&evidence&&evidence.decisive>=3&&evidence.score>=60&&directional){
    return {...item,evidence,decision:'AUTO-APPROVE',reason:`Low-risk reversible action with positive verified evidence (${evidence.score}/100, ${evidence.decisive} decisive samples).`};
  }

  if(item.type==='Scale winner'&&evidence&&evidence.confidence==='Strong'&&evidence.decisive>=6&&evidence.score>=70){
    return {...item,evidence,decision:'AUTO-APPROVE',reason:`Strong repeat evidence supports this winner-scaling pattern (${evidence.score}/100 across ${evidence.decisive} decisive samples).`};
  }

  if(item.type==='CTR'||item.type==='Content gap'){
    return {...item,evidence,decision:'HUMAN REVIEW',reason:'Title/snippet or content changes can alter search intent and should remain human-reviewed even when evidence is positive.'};
  }

  return {...item,evidence,decision:'HUMAN REVIEW',reason:evidence&&evidence.decisive>=3?`Evidence is ${evidence.recommendation.toLowerCase()} (${evidence.score}/100), but not strong enough for autonomous approval.`:'Verified sample size is still too small for autonomous approval.'};
}

function tone(decision:Decision){
  if(decision==='AUTO-APPROVE')return styles.green;
  if(decision==='BLOCK')return styles.red;
  return styles.amber;
}

function icon(decision:Decision){
  if(decision==='AUTO-APPROVE')return <ShieldCheck size={12}/>;
  if(decision==='BLOCK')return <ShieldAlert size={12}/>;
  return <UserCheck size={12}/>;
}

export function AdminSeoAutopilotGuardrails(){
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [actions,setActions]=useState<ParsedAction[]>([]);
  const [history,setHistory]=useState<SeoVerificationEvent[]>([]);
  const [revision,setRevision]=useState(0);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

  const scan=useCallback(()=>{
    const actionHost=document.getElementById('toolmera-seo-action-center-host');
    setActions(parseActions(actionHost));
  },[]);

  useEffect(()=>{
    const syncHost=()=>{
      const actionHost=document.getElementById('toolmera-seo-action-center-host');
      if(!actionHost||!actionHost.parentElement){
        document.getElementById('toolmera-seo-autopilot-host')?.remove();
        setHost(null);
        return;
      }
      let node=document.getElementById('toolmera-seo-autopilot-host');
      if(!node){
        node=document.createElement('div');
        node.id='toolmera-seo-autopilot-host';
        actionHost.parentElement.insertBefore(node,actionHost.nextSibling);
      }
      setHost(node);
      scan();
    };
    syncHost();
    const observer=new MutationObserver(()=>{syncHost();scan()});
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    const interval=window.setInterval(()=>{syncHost();scan()},1500);
    return()=>{observer.disconnect();window.clearInterval(interval);document.getElementById('toolmera-seo-autopilot-host')?.remove()};
  },[scan]);

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const response=await fetch('/api/admin/seo-tasks',{cache:'no-store'});
      const payload=await response.json() as SharedState|{error?:string;message?:string};
      if(!response.ok)throw new Error('message' in payload&&payload.message?payload.message:'error' in payload&&payload.error?payload.error:'Could not load verified SEO outcomes.');
      const state=payload as SharedState;
      setHistory((Array.isArray(state.history)?state.history:[]).filter(isVerificationEvent));
      setRevision(state.revision||0);
      setError('');
      scan();
    }catch(e){setError(e instanceof Error?e.message:'Could not load autopilot evidence.')}
    finally{setLoading(false)}
  },[scan]);

  useEffect(()=>{
    if(!host)return;
    void load();
    const interval=window.setInterval(()=>void load(),30000);
    return()=>window.clearInterval(interval);
  },[host,load]);

  const learning=useMemo(()=>buildOutcomeLearning(history),[history]);
  const byType=useMemo(()=>new Map(learning.map(row=>[row.actionType,row])),[learning]);
  const rows=useMemo(()=>{
    const riskyPages=new Set(actions.filter(item=>item.type==='Cannibalization'||item.type==='Decay audit'||item.priority==='P0').map(item=>item.path));
    const blockedPages=new Set(actions.filter(item=>item.type==='Observation'||item.priority==='HOLD').map(item=>item.path));
    return actions.map(item=>decide(item,byType.get(item.type),riskyPages,blockedPages));
  },[actions,byType]);

  const summary=useMemo(()=>({
    auto:rows.filter(row=>row.decision==='AUTO-APPROVE').length,
    review:rows.filter(row=>row.decision==='HUMAN REVIEW').length,
    block:rows.filter(row=>row.decision==='BLOCK').length,
  }),[rows]);

  if(!host)return null;

  return createPortal(<section className={styles.panel}>
    <div className={styles.head}>
      <div>
        <span className={styles.kicker}>SEO AUTOPILOT GUARDRAILS · APPROVE → REVIEW → BLOCK</span>
        <h2>What can autopilot safely approve?</h2>
        <p>Conservative policy layer over the live SEO Action Center. It uses action risk, page-level cannibalization/decay conflicts, observation locks and Toolmera’s verified action-type evidence. This layer recommends a gate only; it does not execute SEO changes automatically.</p>
      </div>
      <div className={styles.actions}><button onClick={()=>void load()} disabled={loading}><RefreshCw size={11}/>{loading?'Refreshing':'Refresh'}</button><span><Bot size={11}/>rev {revision}</span></div>
    </div>

    <div className={styles.summary}>
      <div className={styles.auto}><span>Auto-approve</span><strong>{summary.auto}</strong><small>Low-risk + repeat evidence</small></div>
      <div className={styles.review}><span>Human review</span><strong>{summary.review}</strong><small>Intent / content / risk check</small></div>
      <div className={styles.block}><span>Blocked</span><strong>{summary.block}</strong><small>Lock or negative evidence</small></div>
    </div>

    {error&&<div className={styles.error}>{error}</div>}
    {!error&&rows.length===0?<div className={styles.empty}><Bot size={18}/><strong>No live actions to gate yet</strong><span>Guardrails populate from the current SEO Action Center queue.</span></div>:
    <div className={styles.tableWrap}><div className={styles.table}>
      <div className={`${styles.row} ${styles.tableHead}`}><span>Gate</span><span>Page</span><span>Action</span><span>Priority</span><span>Historical evidence</span><span>Why</span></div>
      {rows.map(row=><div className={styles.row} key={row.id}>
        <div><span className={`${styles.pill} ${tone(row.decision)}`}>{icon(row.decision)}{row.decision}</span></div>
        <a className={styles.page} href={row.path} target="_blank" rel="noreferrer"><strong>{row.tool}</strong><small>{row.path}</small></a>
        <div className={styles.action}><strong>{row.type}</strong><small>{row.title}</small></div>
        <span className={styles.priority}>{row.priority}</span>
        <div className={styles.evidence}>{row.evidence?<><strong>{row.evidence.score}/100 · {row.evidence.confidence}</strong><small>{row.evidence.winners}W / {row.evidence.neutral}N / {row.evidence.losers}L · win {row.evidence.winRate===null?'—':`${Math.round(row.evidence.winRate*100)}%`}</small></>:<><strong>No verified pattern yet</strong><small>Human review remains default</small></>}</div>
        <p className={styles.reason}>{row.reason}</p>
      </div>)}
    </div></div>}

    <div className={styles.legend}><b>AUTO-APPROVE:</b><span>only reversible low-risk patterns with repeat positive evidence.</span><b>HUMAN REVIEW:</b><span>default for content, CTR, P0 and ambiguous/risky cases.</span><b>BLOCK:</b><span>observation lock, insufficient-demand hold or repeat negative evidence.</span></div>
  </section>,host);
}
