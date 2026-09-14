'use client';

import { RotateCcw, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { AdminSeoSafeSuite } from '@/components/AdminSeoSafeSuite';
import styles from './AdminCommandCenterBridge.module.css';

type CommandTask={status?:string;completedAt?:string};
type CommandTaskState={tasks?:Record<string,CommandTask>;owner?:string;updatedAt?:string;revision?:number};

const localTaskKey='toolmera-command-center-state-v2';
const recoveryMarker='toolmera-command-center-accidental-reset-2026-09-12-v1';
const recentWindowMs=12*60*60*1000;

export function AdminCommandCenterBridge(){
  const [active,setActive]=useState(false);
  const [navHost,setNavHost]=useState<HTMLElement|null>(null);
  const [suiteKey,setSuiteKey]=useState(0);
  const [recovering,setRecovering]=useState(false);
  const [recoveryMessage,setRecoveryMessage]=useState('');

  useEffect(()=>{
    const mount=()=>{
      const nav=document.querySelector('.adminSidebar nav');
      if(!nav)return false;
      let host=document.getElementById('toolmera-command-center-nav-host');
      if(!host){
        host=document.createElement('div');
        host.id='toolmera-command-center-nav-host';
        host.className=styles.navHost;
        const buttons=[...nav.querySelectorAll('button')];
        const queriesButton=buttons.find(button=>button.textContent?.trim()==='Queries');
        if(queriesButton?.parentElement===nav)queriesButton.insertAdjacentElement('afterend',host);
        else nav.appendChild(host);
      }
      setNavHost(host);
      return true;
    };

    if(!mount()){
      const frame=requestAnimationFrame(()=>mount());
      return()=>cancelAnimationFrame(frame);
    }

    const nav=document.querySelector('.adminSidebar nav');
    const handleNavClick=(event:Event)=>{
      const target=event.target as HTMLElement|null;
      const button=target?.closest('button');
      if(button&&!button.closest('#toolmera-command-center-nav-host'))setActive(false);
    };
    nav?.addEventListener('click',handleNavClick);
    return()=>{
      nav?.removeEventListener('click',handleNavClick);
      document.getElementById('toolmera-command-center-nav-host')?.remove();
    };
  },[]);

  const persistRecoveredTasks=async(state:CommandTaskState,tasks:Record<string,CommandTask>)=>{
    const next={...state,tasks,owner:state.owner||'Sviat'};
    localStorage.setItem(localTaskKey,JSON.stringify(next));
    const response=await fetch('/api/admin/seo-tasks',{
      method:'PUT',
      headers:{'content-type':'application/json'},
      cache:'no-store',
      body:JSON.stringify({tasks,owner:next.owner}),
    });
    if(!response.ok)throw new Error('Не вдалося зберегти відновлення задач.');
    const saved=await response.json() as CommandTaskState;
    localStorage.setItem(localTaskKey,JSON.stringify(saved));
  };

  const restoreRecentDone=async(silent=false)=>{
    if(recovering)return;
    if(!silent){
      const ok=window.confirm('Повернути в активну чергу всі SEO-задачі, які були позначені «Виконано» протягом останніх 12 годин? Реальні зміни на сайті це НЕ відкочує — зміниться лише статус у Командному центрі.');
      if(!ok)return;
    }
    setRecovering(true);
    setRecoveryMessage('');
    try{
      const response=await fetch('/api/admin/seo-tasks',{cache:'no-store'});
      if(!response.ok)throw new Error('Сховище задач недоступне.');
      const state=await response.json() as CommandTaskState;
      const tasks={...(state.tasks||{})};
      const now=Date.now();
      let restored=0;
      for(const [key,task] of Object.entries(tasks)){
        if(!key.startsWith('command:')||task?.status!=='Done'||!task.completedAt)continue;
        const completedAt=new Date(task.completedAt).getTime();
        if(!Number.isFinite(completedAt)||now-completedAt>recentWindowMs)continue;
        delete tasks[key];
        restored+=1;
      }
      if(restored>0){
        await persistRecoveredTasks(state,tasks);
        setSuiteKey(value=>value+1);
        setRecoveryMessage(`Повернуто ${restored} задач у активну чергу.`);
      }else{
        setRecoveryMessage('Недавніх помилково виконаних задач не знайдено.');
      }
    }catch(error){
      setRecoveryMessage(error instanceof Error?error.message:'Не вдалося відновити задачі.');
    }finally{
      setRecovering(false);
    }
  };

  useEffect(()=>{
    if(!active)return;
    try{
      if(localStorage.getItem(recoveryMarker))return;
      localStorage.setItem(recoveryMarker,'1');
      void restoreRecentDone(true);
    }catch{}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[active]);

  const guardCompletion=(event:ReactMouseEvent<HTMLDivElement>)=>{
    const target=event.target as HTMLElement|null;
    const button=target?.closest('button');
    if(!button)return;
    const label=button.textContent||'';
    if(!label.includes('Виконано → спостерігати 10 днів'))return;
    if(button.dataset.toolmeraConfirmed==='1'){
      delete button.dataset.toolmeraConfirmed;
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const confirmed=window.confirm('ВАЖЛИВО: ця кнопка НЕ виконує SEO-зміну. Натискай «OK» тільки якщо рекомендацію вже реально внесено в код/контент і вона вже на сайті.\n\nЗміна справді вже реалізована?');
    if(!confirmed)return;
    button.dataset.toolmeraConfirmed='1';
    window.setTimeout(()=>button.click(),0);
  };

  return <>
    {navHost&&createPortal(
      <button type="button" className={`${styles.navButton} ${active?styles.navButtonActive:''}`} onClick={()=>setActive(true)}>
        <Sparkles size={17}/><span>SEO Командний центр</span>
      </button>,
      navHost,
    )}

    {active&&createPortal(
      <section className={styles.overlay} aria-label="SEO Командний центр">
        <header className={styles.topbar}>
          <div><span className={styles.kicker}>TOOLMERA.COM</span><h1>SEO Командний центр</h1></div>
          <div className={styles.actions}>
            {recoveryMessage&&<span className={styles.recoveryMessage}>{recoveryMessage}</span>}
            <button type="button" className={styles.recover} onClick={()=>void restoreRecentDone(false)} disabled={recovering}><RotateCcw size={14}/>{recovering?'Відновлюю…':'Повернути недавні «Виконано»'}</button>
            <span className={styles.safe}><ShieldCheck size={14}/> GSC snapshot · 1× на добу</span>
            <button type="button" className={styles.close} onClick={()=>setActive(false)}><X size={15}/> Закрити</button>
          </div>
        </header>
        <div className={styles.content} onClickCapture={guardCompletion}><AdminSeoSafeSuite key={suiteKey}/></div>
      </section>,
      document.body,
    )}
  </>;
}
