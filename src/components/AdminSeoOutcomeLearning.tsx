'use client';

import { BrainCircuit, RefreshCw, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { buildOutcomeLearning, type SeoVerificationEvent } from '@/lib/seoOutcomeLearning';
import styles from './AdminSeoOutcomeLearning.module.css';

type SharedState={history?:Array<SeoVerificationEvent|Record<string,unknown>>;revision:number;updatedAt:string};
type VerificationEvent=SeoVerificationEvent;

function isVerificationEvent(value:unknown):value is VerificationEvent{
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  const event=value as Partial<VerificationEvent>;
  return event.kind==='verification'&&typeof event.id==='string'&&typeof event.at==='string'&&Boolean(event.snapshot&&typeof event.snapshot==='object');
}

function pct(value:number|null){
  if(value===null)return '—';
  return `${Math.round(value*100)}%`;
}

function deltaPct(value:number|null){
  if(value===null)return '—';
  return `${value>=0?'+':''}${Math.round(value*100)}%`;
}

function deltaPos(value:number|null){
  if(value===null)return '—';
  return `${value>=0?'+':''}${value.toFixed(1)}`;
}

function recommendationTone(value:string){
  if(value==='Strong signal'||value==='Promising')return styles.green;
  if(value==='Caution')return styles.red;
  if(value==='Mixed')return styles.amber;
  return styles.muted;
}

function scoreTone(score:number){
  if(score>=65)return styles.scoreGood;
  if(score<=40)return styles.scoreRisk;
  return styles.scoreMid;
}

export function AdminSeoOutcomeLearning(){
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [history,setHistory]=useState<VerificationEvent[]>([]);
  const [revision,setRevision]=useState(0);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>{
    const syncHost=()=>{
      const anchor=document.getElementById('toolmera-seo-activity-host');
      if(!anchor||!anchor.parentElement){
        document.getElementById('toolmera-seo-outcome-learning-host')?.remove();
        setHost(null);
        return;
      }
      let node=document.getElementById('toolmera-seo-outcome-learning-host');
      if(!node){
        node=document.createElement('div');
        node.id='toolmera-seo-outcome-learning-host';
        anchor.parentElement.insertBefore(node,anchor.nextSibling);
      }
      setHost(node);
    };
    syncHost();
    const observer=new MutationObserver(syncHost);
    observer.observe(document.body,{subtree:true,childList:true});
    const interval=window.setInterval(syncHost,1200);
    return()=>{observer.disconnect();window.clearInterval(interval);document.getElementById('toolmera-seo-outcome-learning-host')?.remove()};
  },[]);

  const load=useCallback(async(silent=false)=>{
    if(!silent)setLoading(true);
    try{
      const response=await fetch('/api/admin/seo-tasks',{cache:'no-store'});
      const payload=await response.json() as SharedState|{error?:string;message?:string};
      if(!response.ok)throw new Error('message' in payload&&payload.message?payload.message:'error' in payload&&payload.error?payload.error:'Could not load SEO outcome history.');
      const state=payload as SharedState;
      const verified=(Array.isArray(state.history)?state.history:[]).filter(isVerificationEvent);
      setHistory(verified);
      setRevision(state.revision||0);
      setError('');
    }catch(e){setError(e instanceof Error?e.message:'Could not load SEO outcome history.')}
    finally{if(!silent)setLoading(false)}
  },[]);

  useEffect(()=>{
    if(!host)return;
    void load();
    const interval=window.setInterval(()=>void load(true),20000);
    return()=>window.clearInterval(interval);
  },[host,load]);

  const rows=useMemo(()=>buildOutcomeLearning(history),[history]);
  const summary=useMemo(()=>{
    const decisive=history.filter(event=>event.verification==='Winner'||event.verification==='Neutral'||event.verification==='Loser');
    const winners=decisive.filter(event=>event.verification==='Winner').length;
    const losers=decisive.filter(event=>event.verification==='Loser').length;
    const learned=rows.filter(row=>row.decisive>=3).length;
    return {
      verified:history.length,
      decisive:decisive.length,
      winners,
      losers,
      winRate:decisive.length?winners/decisive.length:null,
      learned,
    };
  },[history,rows]);

  const strongest=rows.find(row=>row.decisive>=3&&row.score>=60)||null;
  const caution=[...rows].reverse().find(row=>row.decisive>=3&&row.score<=40)||null;

  if(!host)return null;

  return createPortal(<section className={styles.panel}>
    <div className={styles.head}>
      <div>
        <span className={styles.kicker}>SEO OUTCOME LEARNING ENGINE · VERIFIED ACTION → EVIDENCE</span>
        <h2>Which SEO actions are actually working for Toolmera?</h2>
        <p>Aggregates closed-loop verification events by action type. Scores are deliberately shrunk toward neutral when sample sizes are small, so one lucky win does not become a strategy.</p>
      </div>
      <div className={styles.actions}>
        <button onClick={()=>void load()} disabled={loading}><RefreshCw size={11}/>{loading?'Refreshing':'Refresh'}</button>
        <span><BrainCircuit size={11}/>rev {revision}</span>
      </div>
    </div>

    <div className={styles.summary}>
      <div><span>Verified outcomes</span><strong>{summary.verified}</strong><small>Closed-loop task results</small></div>
      <div><span>Decisive samples</span><strong>{summary.decisive}</strong><small>Winner / Neutral / Loser</small></div>
      <div><span>Winner rate</span><strong>{summary.winRate===null?'—':pct(summary.winRate)}</strong><small>{summary.winners} winners · {summary.losers} losers</small></div>
      <div><span>Learned action types</span><strong>{summary.learned}</strong><small>3+ decisive samples</small></div>
    </div>

    {(strongest||caution)&&<div className={styles.insights}>
      {strongest&&<div className={styles.insight}><Sparkles size={13}/><div><small>Strongest current evidence</small><strong>{strongest.actionType}</strong><span>{strongest.recommendation} · score {strongest.score}/100 · {strongest.decisive} samples</span></div></div>}
      {caution&&<div className={`${styles.insight} ${styles.insightRisk}`}><TriangleAlert size={13}/><div><small>Needs caution</small><strong>{caution.actionType}</strong><span>{caution.recommendation} · score {caution.score}/100 · {caution.decisive} samples</span></div></div>}
    </div>}

    {error&&<div className={styles.error}>{error}</div>}
    {!error&&rows.length===0?<div className={styles.empty}><BrainCircuit size={19}/><strong>Learning starts after verified tasks</strong><span>Once completed SEO actions receive Winner / Neutral / Loser results, this engine will rank which action types are producing repeatable outcomes.</span></div>:
    <div className={styles.tableWrap}><div className={styles.table}>
      <div className={`${styles.row} ${styles.tableHead}`}><span>Action type</span><span>Signal</span><span>Evidence score</span><span>Verified</span><span>W / N / L</span><span>Win rate</span><span>Median impr. Δ</span><span>Median pos. Δ</span><span>Confidence</span></div>
      {rows.map(row=><div className={styles.row} key={row.actionType}>
        <div className={styles.actionType}><strong>{row.actionType}</strong><small>{row.lowData?`${row.lowData} low-data result${row.lowData===1?'':'s'}`:'No low-data closes'}</small></div>
        <span className={`${styles.pill} ${recommendationTone(row.recommendation)}`}>{row.recommendation}</span>
        <div className={styles.score}><div><i className={scoreTone(row.score)} style={{width:`${row.score}%`}}/></div><strong>{row.score}</strong></div>
        <span className={styles.metric}>{row.total}</span>
        <span className={styles.metric}>{row.winners} / {row.neutral} / {row.losers}</span>
        <span className={styles.metric}>{pct(row.winRate)}</span>
        <span className={styles.metric}>{deltaPct(row.medianImpressionChange)}</span>
        <span className={styles.metric}>{deltaPos(row.medianPositionGain)}</span>
        <div className={styles.confidence}><ShieldCheck size={11}/><span>{row.confidence}</span><small>{row.decisive} decisive</small></div>
      </div>)}
    </div></div>}

    <div className={styles.legend}><b>Evidence score:</b><span>heuristic 0–100, shrunk toward 50 for small samples.</span><b>Win rate:</b><span>Winner ÷ all decisive outcomes, so Neutral results remain in the denominator.</span><b>Important:</b><span>this is before/after operational evidence, not causal proof; use it to prioritize tests, not to guarantee rankings.</span></div>
  </section>,host);
}
