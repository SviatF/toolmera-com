'use client';

import { ShieldCheck, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AdminSeoSafeSuite } from '@/components/AdminSeoSafeSuite';
import styles from './AdminCommandCenterBridge.module.css';

export function AdminCommandCenterBridge(){
  const [active,setActive]=useState(false);
  const [navHost,setNavHost]=useState<HTMLElement|null>(null);

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
            <span className={styles.safe}><ShieldCheck size={14}/> Safe mode · shared GSC data</span>
            <button type="button" className={styles.close} onClick={()=>setActive(false)}><X size={15}/> Закрити</button>
          </div>
        </header>
        <div className={styles.content}><AdminSeoSafeSuite/></div>
      </section>,
      document.body,
    )}
  </>;
}
