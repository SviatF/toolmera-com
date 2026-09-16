'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LazyToolExperience } from '@/components/LazyToolExperience';
import type { Tool } from '@/data/tools';
import { getLocalizedPilotByToolId, type PilotLocale } from '@/data/localizedToolPilot';

type Dict = Record<string,string>;

const dictionaryLoaders:Record<PilotLocale,()=>Promise<Dict>> = {
  de:()=>import('@/data/localized-ui/de').then(mod=>mod.default),
  hi:()=>import('@/data/localized-ui/hi').then(mod=>mod.default),
  ru:()=>import('@/data/localized-ui/ru').then(mod=>mod.default),
};

const categoryLabels:Record<PilotLocale,Partial<Record<Tool['category'],string>>> = {
  de:{calculators:'RECHNER',converters:'KONVERTER',image:'BILD',pdf:'PDF',text:'TEXT',website:'WEBSITE',generators:'GENERATOREN'},
  hi:{calculators:'कैलकुलेटर',converters:'कन्वर्टर',image:'इमेज',pdf:'PDF',text:'टेक्स्ट',website:'वेबसाइट',generators:'जनरेटर'},
  ru:{calculators:'КАЛЬКУЛЯТОРЫ',converters:'КОНВЕРТЕРЫ',image:'ИЗОБРАЖЕНИЯ',pdf:'PDF',text:'ТЕКСТ',website:'САЙТЫ',generators:'ГЕНЕРАТОРЫ'},
};

function translateText(raw:string,locale:PilotLocale,dictionary:Dict){
  const lead=raw.match(/^\s*/)?.[0]||'';
  const tail=raw.match(/\s*$/)?.[0]||'';
  const core=raw.trim();
  if(!core)return raw;
  const exact=dictionary[core];
  if(exact)return lead+exact+tail;
  let out=core;
  if(locale==='de'){
    out=out.replace(/^(\d+) files ready$/,'$1 Dateien bereit').replace(/^Drop more files or click to add/,'Weitere Dateien ablegen oder zum Hinzufügen klicken').replace(/^Drop another file or click to replace$/,'Andere Datei ablegen oder zum Ersetzen klicken');
  }else if(locale==='hi'){
    out=out.replace(/^(\d+) files ready$/,'$1 फ़ाइलें तैयार हैं').replace(/^Drop more files or click to add/,'और फ़ाइलें छोड़ें या जोड़ने के लिए क्लिक करें').replace(/^Drop another file or click to replace$/,'दूसरी फ़ाइल छोड़ें या बदलने के लिए क्लिक करें');
  }else{
    out=out.replace(/^(\d+) files ready$/,'Готово файлов: $1').replace(/^Drop more files or click to add/,'Перетащите ещё файлы или нажмите, чтобы добавить').replace(/^Drop another file or click to replace$/,'Перетащите другой файл или нажмите, чтобы заменить');
  }
  return out===core?raw:lead+out+tail;
}

function translateTree(root:HTMLElement,locale:PilotLocale,dictionary:Dict){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes:Text[]=[];
  let node=walker.nextNode();
  while(node){nodes.push(node as Text);node=walker.nextNode()}
  for(const textNode of nodes){
    const parent=textNode.parentElement;
    if(!parent||['SCRIPT','STYLE','CODE'].includes(parent.tagName))continue;
    const next=translateText(textNode.nodeValue||'',locale,dictionary);
    if(next!==textNode.nodeValue)textNode.nodeValue=next;
  }
  root.querySelectorAll<HTMLElement>('[placeholder],[aria-label],[title]').forEach(el=>{
    for(const attr of ['placeholder','aria-label','title']){
      const current=el.getAttribute(attr);
      if(!current)continue;
      const next=translateText(current,locale,dictionary);
      if(next!==current)el.setAttribute(attr,next.trim());
    }
  });
}

export function LocalizedUi({locale,children}:{locale:PilotLocale;children:ReactNode}){
  const ref=useRef<HTMLDivElement>(null);
  const [dictionary,setDictionary]=useState<Dict|null>(null);

  useEffect(()=>{
    let active=true;
    setDictionary(null);
    dictionaryLoaders[locale]().then(next=>{if(active)setDictionary(next)});
    return()=>{active=false};
  },[locale]);

  const sync=useCallback(()=>{
    if(ref.current&&dictionary)translateTree(ref.current,locale,dictionary);
  },[locale,dictionary]);

  const schedule=useCallback(()=>{
    if(!dictionary)return;
    window.requestAnimationFrame(sync);
    window.setTimeout(sync,80);
    window.setTimeout(sync,320);
  },[dictionary,sync]);

  useEffect(()=>{
    if(!dictionary)return;
    sync();
    const ids=[80,320,900,1800].map(delay=>window.setTimeout(sync,delay));
    return()=>ids.forEach(id=>window.clearTimeout(id));
  },[dictionary,sync]);

  return <div ref={ref} lang={locale} onClickCapture={schedule} onInputCapture={schedule} onChangeCapture={schedule}>{children}</div>;
}

export function LocalizedToolExperience({tool,locale}:{tool:Tool;locale:PilotLocale}){
  const translatedTool=useMemo<Tool>(()=>{
    const localized=getLocalizedPilotByToolId(locale,tool.id);
    if(!localized)return tool;
    return {
      ...tool,
      name:localized.name,
      short:localized.intro,
      title:localized.title,
      description:localized.description,
      intro:localized.intro,
      benefits:localized.benefits,
      faq:localized.faq,
      categoryLabel:categoryLabels[locale][tool.category]||tool.categoryLabel,
    };
  },[locale,tool]);
  return <LocalizedUi locale={locale}><LazyToolExperience tool={translatedTool}/></LocalizedUi>;
}
