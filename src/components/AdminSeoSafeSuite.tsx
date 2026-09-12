'use client';

import { AlertTriangle, CheckCircle2, Link2, RefreshCw, Search, ShieldCheck, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { hasInternalLinkBoost, internalLinkBoosts } from '@/data/internalLinkBoosts';
import { seoExperiments } from '@/data/seoExperiments';
import { tools, toolUrl, type Tool } from '@/data/tools';
import { fetchAdminGsc } from '@/lib/adminApiClient';
import { semanticRelatedTools } from '@/lib/toolRelations';
import styles from './AdminSeoSafeSuite.module.css';

type Metric={clicks:number;impressions:number;ctr:number;position:number};
type PageRow=Metric&{page:string};
type QueryPageRow=Metric&{query:string;page:string};
type GscData={connected:true;range:string;pages?:PageRow[];queryPages?:QueryPageRow[];fetchedAt:string};
type Trend='New'|'Growing'|'Stable'|'Declining';
type Decision='DO NOW'|'SCALE'|'FIX'|'WAIT'|'DO NOT TOUCH';
type QuickFilter='all'|'3plus'|'top10'|'top20'|'quick'|'growing'|'declining'|'cannibal'|'locked';

type ExperimentState={
  id:string;
  changedAt:string;
  change:string;
  finalDays:number;
  daysLeft:number;
  phase:'Warm-up'|'Readable'|'Mature';
};

type PageSignal={
  tool:Tool;
  path:string;
  metrics:Metric;
  current:Metric;
  previous:Metric;
  trend:Trend;
  opportunity:number;
  topQuery:string;
  highCannibal:number;
  deployedLinks:number;
  linkIdeas:number;
  experiment:ExperimentState|null;
  decision:Decision;
  reason:string;
  nextMove:string;
};

type CannibalRow={query:string;pages:number;impressions:number;primaryShare:number;risk:'High'|'Medium'};

const empty:Metric={clicks:0,impressions:0,ctr:0,position:0};
const number=(value:number)=>new Intl.NumberFormat('uk-UA',{maximumFractionDigits:0}).format(value);
const pct=(value:number)=>`${(value*100).toFixed(2)}%`;
const pos=(value:number)=>value?value.toFixed(1):'—';
const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));

const decisionLabel:Record<Decision,string>={
  'DO NOW':'КАЧАТИ ЗАРАЗ',
  'SCALE':'МАСШТАБУВАТИ',
  'FIX':'ВИПРАВИТИ',
  'WAIT':'ЧЕКАТИ',
  'DO NOT TOUCH':'НЕ ЧІПАТИ',
};
const trendLabel:Record<Trend,string>={New:'НОВИЙ РІСТ',Growing:'РОСТЕ',Stable:'СТАБІЛЬНО',Declining:'ПАДАЄ'};

function normalizePath(value:string){
  try{
    const pathname=new URL(value,'https://toolmera.com').pathname||'/';
    return pathname==='/'?'/':pathname.replace(/\/+$/,'')+'/';
  }catch{return value}
}

function weeklyBaseline(current:Metric,total28:Metric):Metric{
  const priorImpressions=Math.max(0,total28.impressions-current.impressions);
  const priorClicks=Math.max(0,total28.clicks-current.clicks);
  const weightedPosition=Math.max(0,(total28.position*total28.impressions)-(current.position*current.impressions));
  return {
    clicks:priorClicks/3,
    impressions:priorImpressions/3,
    ctr:priorImpressions?priorClicks/priorImpressions:0,
    position:priorImpressions?weightedPosition/priorImpressions:0,
  };
}

function relativeChange(current:number,previous:number){
  if(previous<=0)return current>0?null:0;
  return (current-previous)/previous;
}

function trendFor(current:Metric,previous:Metric):Trend{
  const impressions=relativeChange(current.impressions,previous.impressions);
  const positionGain=current.position&&previous.position?previous.position-current.position:0;
  if(current.impressions>=2&&previous.impressions<.5)return 'New';
  if(previous.impressions>=2&&((impressions!==null&&impressions<=-.4)||(positionGain<=-8&&current.impressions<=previous.impressions*1.2)))return 'Declining';
  if(current.impressions>=2&&((impressions!==null&&impressions>=.45)||positionGain>=5||(current.clicks>previous.clicks&&current.clicks>=1)))return 'Growing';
  return 'Stable';
}

function expectedCtr(position:number){
  if(!position)return 0;
  if(position<=3)return .14;
  if(position<=5)return .08;
  if(position<=10)return .045;
  if(position<=20)return .018;
  if(position<=50)return .007;
  return .003;
}

function opportunityScore(row:Metric){
  if(row.impressions<=0)return 0;
  const demand=clamp(Math.log1p(row.impressions)/Math.log(51),0,1);
  let proximity=.18;
  if(!row.position)proximity=.08;
  else if(row.position<=3)proximity=.45;
  else if(row.position<=10)proximity=.76;
  else if(row.position<=20)proximity=1;
  else if(row.position<=30)proximity=.88;
  else if(row.position<=50)proximity=.58;
  else if(row.position<=75)proximity=.32;
  const expected=expectedCtr(row.position);
  const ctrHeadroom=expected?clamp((expected-row.ctr)/expected,0,1):.5;
  return Math.round(clamp(demand*proximity*(.72+.28*ctrHeadroom),0,1)*100);
}

function utcDay(value:string|Date){
  const date=typeof value==='string'?new Date(`${value}T00:00:00Z`):value;
  return Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate());
}
function daysSince(value:string){return Math.max(0,Math.floor((utcDay(new Date())-utcDay(value))/86400000))}

function toneFor(decision:Decision){
  if(decision==='FIX')return styles.red;
  if(decision==='DO NOW')return styles.blue;
  if(decision==='SCALE')return styles.green;
  if(decision==='DO NOT TOUCH')return styles.amber;
  return styles.muted;
}
function trendTone(trend:Trend){
  if(trend==='Growing'||trend==='New')return styles.green;
  if(trend==='Declining')return styles.red;
  return styles.muted;
}

function observeQueriesView(setActive:(value:boolean)=>void){
  const read=()=>setActive(document.querySelector('.adminTopbar h1')?.textContent?.trim()==='Queries');
  read();
  const heading=document.querySelector('.adminTopbar h1');
  if(!heading)return()=>{};
  const observer=new MutationObserver(read);
  observer.observe(heading,{subtree:true,childList:true,characterData:true});
  return()=>observer.disconnect();
}

function matchesFilter(row:PageSignal,filter:QuickFilter){
  if(filter==='3plus')return row.metrics.impressions>=3;
  if(filter==='top10')return row.metrics.position>0&&row.metrics.position<=10;
  if(filter==='top20')return row.metrics.position>0&&row.metrics.position<=20;
  if(filter==='quick')return row.decision==='DO NOW'||(row.metrics.impressions>=3&&row.metrics.position>10&&row.metrics.position<=20);
  if(filter==='growing')return row.trend==='Growing'||row.trend==='New';
  if(filter==='declining')return row.trend==='Declining';
  if(filter==='cannibal')return row.highCannibal>0;
  if(filter==='locked')return Boolean(row.experiment&&row.experiment.daysLeft>0);
  return true;
}

export function AdminSeoSafeSuite(){
  const [active,setActive]=useState(false);
  const [seven,setSeven]=useState<GscData|null>(null);
  const [twentyEight,setTwentyEight]=useState<GscData|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [loadedAt,setLoadedAt]=useState('');
  const [quickFilter,setQuickFilter]=useState<QuickFilter>('all');
  const [search,setSearch]=useState('');

  useEffect(()=>observeQueriesView(setActive),[]);

  const load=useCallback(async(force=false)=>{
    setLoading(true);
    setError('');
    try{
      const [sevenData,twentyEightData]=await Promise.all([
        fetchAdminGsc<GscData>('7d',force),
        fetchAdminGsc<GscData>('28d',force),
      ]);
      setSeven(sevenData);
      setTwentyEight(twentyEightData);
      setLoadedAt(new Date().toISOString());
    }catch(e){setError(e instanceof Error?e.message:'Не вдалося завантажити SEO-дані.')}
    finally{setLoading(false)}
  },[]);

  useEffect(()=>{if(active&&!seven&&!twentyEight)void load(false)},[active,seven,twentyEight,load]);

  const cannibalRows=useMemo<CannibalRow[]>(()=>{
    const groups=new Map<string,QueryPageRow[]>();
    (twentyEight?.queryPages||[]).forEach(row=>{
      if(!row.query||!row.page||row.impressions<=0)return;
      const key=row.query.toLowerCase();
      const list=groups.get(key)||[];
      list.push({...row,page:normalizePath(row.page)});
      groups.set(key,list);
    });
    const rows:CannibalRow[]=[];
    groups.forEach(group=>{
      const byPage=new Map<string,number>();
      group.forEach(row=>byPage.set(row.page,(byPage.get(row.page)||0)+row.impressions));
      if(byPage.size<2)return;
      const values=[...byPage.values()];
      const impressions=values.reduce((sum,value)=>sum+value,0);
      const primary=Math.max(...values);
      const primaryShare=impressions?primary/impressions:1;
      const risk:CannibalRow['risk']=impressions>=3&&(byPage.size>=3||primaryShare<.65)?'High':'Medium';
      rows.push({query:group[0]?.query||'',pages:byPage.size,impressions,primaryShare,risk});
    });
    return rows.sort((a,b)=>(a.risk===b.risk?b.impressions-a.impressions:a.risk==='High'?-1:1)).slice(0,20);
  },[twentyEight]);

  const highCannibalByPath=useMemo(()=>{
    const map=new Map<string,number>();
    const groups=new Map<string,QueryPageRow[]>();
    (twentyEight?.queryPages||[]).forEach(row=>{
      const key=row.query?.toLowerCase();
      if(!key||!row.page||row.impressions<=0)return;
      const list=groups.get(key)||[];
      list.push({...row,page:normalizePath(row.page)});
      groups.set(key,list);
    });
    groups.forEach(group=>{
      const byPage=new Map<string,number>();
      group.forEach(row=>byPage.set(row.page,(byPage.get(row.page)||0)+row.impressions));
      if(byPage.size<2)return;
      const values=[...byPage.values()];
      const total=values.reduce((sum,value)=>sum+value,0);
      const primary=Math.max(...values);
      const high=total>=3&&(byPage.size>=3||(total?primary/total:1)<.65);
      if(high)for(const path of byPage.keys())map.set(path,(map.get(path)||0)+1);
    });
    return map;
  },[twentyEight]);

  const latestExperimentByTool=useMemo(()=>{
    const map=new Map<string,(typeof seoExperiments)[number]>();
    seoExperiments.forEach(item=>{
      const current=map.get(item.toolId);
      if(!current||item.changedAt>current.changedAt||(item.changedAt===current.changedAt&&item.id>current.id))map.set(item.toolId,item);
    });
    return map;
  },[]);

  const signals=useMemo<PageSignal[]>(()=>{
    if(!seven||!twentyEight)return [];
    const sevenMap=new Map((seven.pages||[]).map(row=>[normalizePath(row.page),row]));
    const twentyEightMap=new Map((twentyEight.pages||[]).map(row=>[normalizePath(row.page),row]));
    const queriesByPath=new Map<string,QueryPageRow[]>();
    (twentyEight.queryPages||[]).forEach(row=>{
      const path=normalizePath(row.page);
      const list=queriesByPath.get(path)||[];
      list.push(row);
      queriesByPath.set(path,list);
    });

    return tools.map(tool=>{
      const path=normalizePath(toolUrl(tool));
      const metrics=twentyEightMap.get(path)||empty;
      const current=sevenMap.get(path)||empty;
      const previous=weeklyBaseline(current,metrics.impressions?metrics:current);
      const trend=trendFor(current,previous);
      const opportunity=opportunityScore(metrics);
      const topQuery=[...(queriesByPath.get(path)||[])].sort((a,b)=>(b.impressions-a.impressions)||(a.position-b.position))[0]?.query||tool.name;
      const latest=latestExperimentByTool.get(tool.id);
      let experiment:ExperimentState|null=null;
      if(latest){
        const finalDays=Math.max(0,daysSince(latest.changedAt)-2);
        experiment={id:latest.id,changedAt:latest.changedAt,change:latest.change,finalDays,daysLeft:Math.max(0,7-finalDays),phase:finalDays<7?'Warm-up':finalDays<14?'Readable':'Mature'};
      }

      const targetRelated=new Set(semanticRelatedTools(tool,tools,10).map(item=>item.id));
      const linkIdeas=tools.filter(source=>{
        if(source.id===tool.id||hasInternalLinkBoost(source.id,tool.id))return false;
        if(semanticRelatedTools(source,tools,4).some(item=>item.id===tool.id))return false;
        return targetRelated.has(source.id)||source.category===tool.category;
      }).length;
      const deployedLinks=internalLinkBoosts.filter(link=>link.to===tool.id).length;
      const highCannibal=highCannibalByPath.get(path)||0;

      let decision:Decision='WAIT';
      let reason='Поки недостатньо даних, щоб безпечно щось змінювати.';
      let nextMove='Нічого не міняй. Дочекайся повторних показів у Google.';
      if(experiment&&experiment.daysLeft>0){
        decision='DO NOT TOUCH';
        reason=`SEO-зміна ще в періоді спостереження: залишилось ${experiment.daysLeft} дн. фінальних даних.`;
        nextMove=`Не змінюй Title, H1, URL та основний текст. Перевір через ${experiment.daysLeft} дн.`;
      }else if(highCannibal>0){
        decision='FIX';
        reason=`Google показує кілька наших URL за однаковим запитом (${highCannibal} ризикових перетинів).`;
        nextMove='Вибери одну головну сторінку під цей intent і підсиль внутрішні посилання саме на неї.';
      }else if(trend==='Declining'){
        decision='FIX';
        reason='За останні 7 днів видимість падає проти попереднього тижневого baseline.';
        nextMove='Перевір індексацію, canonical, intent і останні SEO-зміни. Не переписуй сторінку повністю.';
      }else if(trend==='Growing'||trend==='New'||(metrics.position>0&&metrics.position<=10&&metrics.impressions>=3)){
        decision='SCALE';
        reason=trend==='Growing'||trend==='New'?'Google вже дає позитивний ріст.':'Сторінка вже стабільно заходить у TOP10.';
        nextMove=linkIdeas>0?`Додай 2–3 релевантні внутрішні посилання на цю сторінку. Не змінюй її основний intent.`:'Не переписуй ядро сторінки. Розширюй лише суміжний кластер.';
      }else if(metrics.position>=8&&metrics.position<=30&&metrics.impressions>=3&&opportunity>=25){
        decision='DO NOW';
        reason=`Позиція ${pos(metrics.position)}, ${number(metrics.impressions)} показів і Opportunity ${opportunity}/100 — це реальний quick win.`;
        const ctrGap=metrics.position<=20&&metrics.ctr<expectedCtr(metrics.position)*.6;
        nextMove=linkIdeas>0?`Перший крок: додай ${Math.min(3,linkIdeas)} контекстні внутрішні посилання під запит «${topQuery}».`:ctrGap?`Покращ Title і description під запит «${topQuery}». URL та H1 не чіпай.`:`Додай одну корисну секцію або FAQ точно під запит «${topQuery}».`;
      }

      return {tool,path,metrics,current,previous,trend,opportunity,topQuery,highCannibal,deployedLinks,linkIdeas,experiment,decision,reason,nextMove};
    }).filter(row=>row.metrics.impressions>0||row.experiment!==null)
      .sort((a,b)=>{
        const weight:Record<Decision,number>={'FIX':5,'DO NOW':4,'SCALE':3,'DO NOT TOUCH':2,'WAIT':1};
        return (weight[b.decision]-weight[a.decision])||(b.opportunity-a.opportunity)||(b.metrics.impressions-a.metrics.impressions);
      });
  },[seven,twentyEight,highCannibalByPath,latestExperimentByTool]);

  const counts=useMemo(()=>signals.reduce((acc,row)=>{acc[row.decision]=(acc[row.decision]||0)+1;return acc},{'DO NOW':0,SCALE:0,FIX:0,WAIT:0,'DO NOT TOUCH':0} as Record<Decision,number>),[signals]);
  const filterCounts=useMemo(()=>({
    all:signals.length,
    '3plus':signals.filter(row=>matchesFilter(row,'3plus')).length,
    top10:signals.filter(row=>matchesFilter(row,'top10')).length,
    top20:signals.filter(row=>matchesFilter(row,'top20')).length,
    quick:signals.filter(row=>matchesFilter(row,'quick')).length,
    growing:signals.filter(row=>matchesFilter(row,'growing')).length,
    declining:signals.filter(row=>matchesFilter(row,'declining')).length,
    cannibal:signals.filter(row=>matchesFilter(row,'cannibal')).length,
    locked:signals.filter(row=>matchesFilter(row,'locked')).length,
  }),[signals]);

  const filteredSignals=useMemo(()=>{
    const needle=search.trim().toLowerCase();
    return signals.filter(row=>matchesFilter(row,quickFilter)).filter(row=>!needle||row.path.toLowerCase().includes(needle)||row.topQuery.toLowerCase().includes(needle)||row.tool.name.toLowerCase().includes(needle));
  },[signals,quickFilter,search]);

  const topActions=signals.filter(row=>row.decision==='FIX'||row.decision==='DO NOW'||row.decision==='SCALE').slice(0,5);
  const experimentRows=signals.filter(row=>row.experiment).sort((a,b)=>(a.experiment?.daysLeft||0)-(b.experiment?.daysLeft||0)).slice(0,10);

  const filters:{id:QuickFilter;label:string;count:number}[]=[
    {id:'all',label:'Усі',count:filterCounts.all},
    {id:'3plus',label:'3+ показів',count:filterCounts['3plus']},
    {id:'top10',label:'TOP 10',count:filterCounts.top10},
    {id:'top20',label:'TOP 20',count:filterCounts.top20},
    {id:'quick',label:'Quick wins',count:filterCounts.quick},
    {id:'growing',label:'Ростуть',count:filterCounts.growing},
    {id:'declining',label:'Падають',count:filterCounts.declining},
    {id:'cannibal',label:'Канібалізація',count:filterCounts.cannibal},
    {id:'locked',label:'Не чіпати',count:filterCounts.locked},
  ];

  if(!active)return null;

  return <section className={styles.shell}>
    <div className={styles.head}>
      <div>
        <span>SEO КОМАНДНИЙ ЦЕНТР</span>
        <h2>Що робити прямо зараз</h2>
        <p>Тут не треба самому аналізувати таблиці. Система показує, яку сторінку качати, що саме зробити, а що не чіпати.</p>
      </div>
      <button onClick={()=>void load(true)} disabled={loading}><RefreshCw size={14} className={loading?styles.spin:''}/> {loading?'Оновлюю…':'Оновити дані'}</button>
    </div>

    {error&&<div className={styles.error}><AlertTriangle size={16}/>{error}</div>}

    <div className={styles.safeNote}><ShieldCheck size={16}/><div><strong>Cloudflare safe mode</strong><span>Максимум 2 shared GSC reads: 7 днів + 28 днів. Усі фільтри, score, тренди, канібалізація та рекомендації рахуються локально в браузері. Автоматичних циклів і polling немає.</span></div></div>

    <div className={styles.summary}>
      <div><strong>{counts['DO NOW']}</strong><span>КАЧАТИ ЗАРАЗ</span></div>
      <div><strong>{counts.SCALE}</strong><span>МАСШТАБУВАТИ</span></div>
      <div><strong>{counts.FIX}</strong><span>ВИПРАВИТИ</span></div>
      <div><strong>{counts['DO NOT TOUCH']}</strong><span>НЕ ЧІПАТИ</span></div>
      <div><strong>{filterCounts['3plus']}</strong><span>3+ ПОКАЗІВ</span></div>
      <div><strong>{filterCounts.top20}</strong><span>У TOP 20</span></div>
    </div>

    <div className={styles.panel}>
      <div className={styles.panelHead}><div><span>ПРІОРИТЕТ №1</span><h3>Роби ці задачі зверху вниз</h3></div><TrendingUp size={18}/></div>
      {topActions.length?<div className={styles.commandList}>{topActions.map((row,index)=><div className={styles.commandCard} key={row.tool.id}>
        <div className={styles.commandIndex}>#{index+1}</div>
        <div className={styles.commandBody}>
          <div className={styles.commandTop}><b className={`${styles.badge} ${toneFor(row.decision)}`}>{decisionLabel[row.decision]}</b><strong>{row.path}</strong></div>
          <div className={styles.commandQuery}>Запит: <b>{row.topQuery}</b> · {number(row.metrics.impressions)} показів · позиція {pos(row.metrics.position)} · CTR {pct(row.metrics.ctr)}</div>
          <p>{row.reason}</p>
          <div className={styles.commandAction}><CheckCircle2 size={16}/><span><b>ЗРОБИТИ:</b> {row.nextMove}</span></div>
        </div>
      </div>)}</div>:<div className={styles.empty}>Зараз немає сторінок, які треба терміново змінювати. Це нормально — чекаємо нових GSC-сигналів.</div>}
    </div>

    <div className={styles.panel}>
      <div className={styles.panelHead}><div><span>ВСІ SEO-СИГНАЛИ</span><h3>Швидкі фільтри</h3></div><span className={styles.localOnly}>без нових API-запитів</span></div>
      <div className={styles.filters}>{filters.map(item=><button key={item.id} className={quickFilter===item.id?styles.filterActive:''} onClick={()=>setQuickFilter(item.id)}>{item.label}<b>{item.count}</b></button>)}</div>
      <div className={styles.search}><Search size={15}/><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Пошук сторінки або запиту…"/></div>

      {filteredSignals.length?<div className={styles.table}>
        <div className={styles.tableHead}><span>Що робити</span><span>Сторінка / запит</span><span>Покази</span><span>Позиція</span><span>CTR</span><span>Тренд</span><span>Score</span><span>Конкретний крок</span></div>
        {filteredSignals.slice(0,50).map(row=><div className={styles.row} key={row.tool.id}>
          <span><b className={`${styles.badge} ${toneFor(row.decision)}`}>{decisionLabel[row.decision]}</b></span>
          <span><strong>{row.path}</strong><small>{row.topQuery}</small></span>
          <span>{number(row.metrics.impressions)}</span>
          <span>{pos(row.metrics.position)}</span>
          <span>{pct(row.metrics.ctr)}</span>
          <span><b className={`${styles.badge} ${trendTone(row.trend)}`}>{trendLabel[row.trend]}</b></span>
          <span><b>{row.opportunity}</b>/100</span>
          <span className={styles.next}>{row.nextMove}</span>
        </div>)}
      </div>:<div className={styles.empty}>За цим фільтром зараз немає сигналів.</div>}
    </div>

    <div className={styles.grid}>
      <div className={styles.panel}>
        <div className={styles.panelHead}><div><span>КАНІБАЛІЗАЦІЯ</span><h3>Один запит → кілька наших URL</h3></div><AlertTriangle size={18}/></div>
        {cannibalRows.length?<div className={styles.compact}>{cannibalRows.slice(0,10).map(row=><div key={row.query}><span><strong>{row.query}</strong><small>{row.pages} сторінки · {number(row.impressions)} показів</small></span><b className={`${styles.badge} ${row.risk==='High'?styles.red:styles.amber}`}>{row.risk==='High'?'ВИСОКИЙ':'СЕРЕДНІЙ'}</b><span>{Math.round(row.primaryShare*100)}% на головному URL</span></div>)}</div>:<div className={styles.empty}>Конфліктів між сторінками зараз не видно.</div>}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}><div><span>НЕ ЧІПАТИ</span><h3>Сторінки під спостереженням</h3></div><CheckCircle2 size={18}/></div>
        {experimentRows.length?<div className={styles.compact}>{experimentRows.map(row=><div key={row.tool.id}><span><strong>{row.path}</strong><small>Зміна: {row.experiment?.changedAt}</small></span><b className={`${styles.badge} ${(row.experiment?.daysLeft||0)>0?styles.amber:styles.green}`}>{(row.experiment?.daysLeft||0)>0?`ще ${row.experiment?.daysLeft} дн.`:'можна оцінювати'}</b><span>{row.experiment?.change}</span></div>)}</div>:<div className={styles.empty}>Немає активних SEO-спостережень.</div>}
      </div>
    </div>

    <div className={styles.footer}><Link2 size={15}/> Internal links, score, filters і trend рахуються локально. <ShieldCheck size={15}/> Worker cache лишається увімкненим. <span>{loadedAt?`Дані завантажено о ${new Date(loadedAt).toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'})}`:'Дані ще не завантажені'}</span></div>
  </section>;
}
