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
type Decision='DO NOW'|'SCALE'|'FIX'|'ANALYZE'|'WAIT'|'DO NOT TOUCH';
type ActionKind='internal-links'|'snippet'|'content-depth'|'intent-analysis'|'cannibalization'|'decay-audit'|'cluster'|'wait';
type QuickFilter='all'|'3plus'|'top10'|'top20'|'quick'|'growing'|'declining'|'cannibal'|'locked'|'observing';

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
  actionKind:ActionKind;
  actionKey:string;
  reason:string;
  nextMove:string;
};

type CannibalRow={query:string;pages:number;impressions:number;primaryShare:number;risk:'High'|'Medium'};
type TaskRecord={
  status?:'Open'|'In progress'|'Done'|'Snoozed';
  owner?:string;
  baseline7?:Metric;
  verifyAt?:string;
  completedAt?:string;
  actionKind?:ActionKind;
  recommendation?:string;
  snapshot?:{toolName:string;path:string;priority:string;type:string;title:string;query:string};
};
type TaskState={version?:1;tasks:Record<string,TaskRecord>;owner:string;updatedAt?:string;revision?:number};
type Outcome='OBSERVING'|'WIN'|'NEUTRAL'|'LOSER';

const empty:Metric={clicks:0,impressions:0,ctr:0,position:0};
const emptyTaskState:TaskState={tasks:{},owner:'Sviat'};
const taskStorageKey='toolmera-command-center-state-v2';
const number=(value:number)=>new Intl.NumberFormat('uk-UA',{maximumFractionDigits:0}).format(value);
const pct=(value:number)=>`${(value*100).toFixed(2)}%`;
const pos=(value:number)=>value?value.toFixed(1):'—';
const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));

const decisionLabel:Record<Decision,string>={
  'DO NOW':'КАЧАТИ ЗАРАЗ',
  'SCALE':'МАСШТАБУВАТИ',
  'FIX':'ВИПРАВИТИ',
  'ANALYZE':'РОЗІБРАТИ INTENT',
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
function addDays(days:number){const date=new Date();date.setUTCDate(date.getUTCDate()+days);return date.toISOString()}
function daysUntil(value?:string){if(!value)return 0;return Math.max(0,Math.ceil((new Date(value).getTime()-Date.now())/86400000))}

function toneFor(decision:Decision){
  if(decision==='FIX')return styles.red;
  if(decision==='DO NOW')return styles.blue;
  if(decision==='SCALE')return styles.green;
  if(decision==='DO NOT TOUCH'||decision==='ANALYZE')return styles.amber;
  return styles.muted;
}
function trendTone(trend:Trend){
  if(trend==='Growing'||trend==='New')return styles.green;
  if(trend==='Declining')return styles.red;
  return styles.muted;
}
function outcomeTone(outcome:Outcome){
  if(outcome==='WIN')return styles.green;
  if(outcome==='LOSER')return styles.red;
  if(outcome==='OBSERVING')return styles.amber;
  return styles.muted;
}

function taskOutcome(task:TaskRecord|undefined,current:Metric):Outcome{
  if(!task||task.status!=='Done'||!task.baseline7)return 'NEUTRAL';
  if(task.verifyAt&&new Date(task.verifyAt).getTime()>Date.now())return 'OBSERVING';
  const baseline=task.baseline7;
  const impressionChange=baseline.impressions>0?(current.impressions-baseline.impressions)/baseline.impressions:(current.impressions>0?1:0);
  const positionGain=baseline.position&&current.position?baseline.position-current.position:0;
  if(positionGain>=3||(impressionChange>=.25&&positionGain>=-2))return 'WIN';
  if(impressionChange<=-.4||(positionGain<=-3&&impressionChange<=-.2))return 'LOSER';
  return 'NEUTRAL';
}

function matchesFilter(row:PageSignal,filter:QuickFilter,task?:TaskRecord){
  if(filter==='observing')return task?.status==='Done';
  if(filter==='3plus')return row.metrics.impressions>=3;
  if(filter==='top10')return row.metrics.position>0&&row.metrics.position<=10;
  if(filter==='top20')return row.metrics.position>0&&row.metrics.position<=20;
  if(filter==='quick')return row.decision==='DO NOW'&&row.metrics.position>0&&row.metrics.position<=20;
  if(filter==='growing')return row.trend==='Growing'||row.trend==='New';
  if(filter==='declining')return row.trend==='Declining';
  if(filter==='cannibal')return row.highCannibal>0;
  if(filter==='locked')return Boolean(row.experiment&&row.experiment.daysLeft>0);
  return true;
}

export function AdminSeoSafeSuite(){
  const [seven,setSeven]=useState<GscData|null>(null);
  const [twentyEight,setTwentyEight]=useState<GscData|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [loadedAt,setLoadedAt]=useState('');
  const [quickFilter,setQuickFilter]=useState<QuickFilter>('all');
  const [search,setSearch]=useState('');
  const [taskState,setTaskState]=useState<TaskState>(emptyTaskState);
  const [taskStore,setTaskStore]=useState<'cloud'|'local'>('cloud');
  const [savingTask,setSavingTask]=useState('');

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

  useEffect(()=>{void load(false)},[load]);

  useEffect(()=>{
    let cancelled=false;
    (async()=>{
      try{
        const response=await fetch('/api/admin/seo-tasks',{cache:'no-store'});
        if(!response.ok)throw new Error('Task store unavailable');
        const data=await response.json() as TaskState;
        if(!cancelled){setTaskState({tasks:data.tasks||{},owner:data.owner||'Sviat',updatedAt:data.updatedAt,revision:data.revision});setTaskStore('cloud')}
      }catch{
        try{
          const cached=JSON.parse(localStorage.getItem(taskStorageKey)||'null') as TaskState|null;
          if(!cancelled&&cached?.tasks){setTaskState(cached);setTaskStore('local')}
          else if(!cancelled)setTaskStore('local');
        }catch{if(!cancelled)setTaskStore('local')}
      }
    })();
    return()=>{cancelled=true};
  },[]);

  const persistTasks=useCallback(async(next:TaskState)=>{
    setTaskState(next);
    localStorage.setItem(taskStorageKey,JSON.stringify(next));
    try{
      const response=await fetch('/api/admin/seo-tasks',{
        method:'PUT',headers:{'content-type':'application/json'},cache:'no-store',
        body:JSON.stringify({tasks:next.tasks,owner:next.owner||'Sviat'}),
      });
      if(!response.ok)throw new Error('Could not persist task state');
      const saved=await response.json() as TaskState;
      setTaskState({tasks:saved.tasks||next.tasks,owner:saved.owner||next.owner,updatedAt:saved.updatedAt,revision:saved.revision});
      setTaskStore('cloud');
    }catch{setTaskStore('local')}
  },[]);

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
      let actionKind:ActionKind='wait';
      let reason='Поки недостатньо даних, щоб безпечно щось змінювати.';
      let nextMove='Нічого не міняй. Дочекайся повторних показів у Google.';

      if(experiment&&experiment.daysLeft>0){
        decision='DO NOT TOUCH';actionKind='wait';
        reason=`SEO-зміна ще в періоді спостереження: залишилось ${experiment.daysLeft} дн. фінальних даних.`;
        nextMove=`Не змінюй Title, H1, URL та основний текст. Перевір через ${experiment.daysLeft} дн.`;
      }else if(highCannibal>0){
        decision='FIX';actionKind='cannibalization';
        reason=`Google показує кілька наших URL за однаковим запитом (${highCannibal} ризикових перетинів).`;
        nextMove='Вибери одну головну сторінку під цей intent і підсиль внутрішні сигнали саме на неї.';
      }else if(trend==='Declining'&&previous.impressions>=2){
        decision='FIX';actionKind='decay-audit';
        reason='За останні 7 днів видимість падає проти попереднього тижневого baseline.';
        nextMove='Перевір індексацію, canonical, intent і останні SEO-зміни. Не переписуй сторінку повністю.';
      }else if(metrics.position>0&&metrics.position<=10&&metrics.impressions>=3){
        decision='SCALE';
        reason=trend==='Growing'||trend==='New'?'Google вже дає позитивний ріст на першій сторінці.':'Сторінка вже має повторну TOP10-видимість.';
        if(deployedLinks<2&&linkIdeas>0){actionKind='internal-links';nextMove=`Додай ${Math.min(3,linkIdeas)} релевантні внутрішні посилання на цю сторінку. Title/H1 не чіпай.`}
        else{actionKind='cluster';nextMove='Не переписуй ядро сторінки. Розширюй суміжний кластер або FAQ під близькі запити.'}
      }else if(metrics.position>=8&&metrics.position<=20&&metrics.impressions>=3){
        decision='DO NOW';
        reason=`Позиція ${pos(metrics.position)} і ${number(metrics.impressions)} показів — реальний шанс зайти вище в TOP10.`;
        const ctrGap=metrics.ctr<expectedCtr(metrics.position)*.6;
        if(deployedLinks<2&&linkIdeas>0){actionKind='internal-links';nextMove=`Перший крок: додай ${Math.min(3,linkIdeas)} контекстні внутрішні посилання під запит «${topQuery}».`}
        else if(ctrGap){actionKind='snippet';nextMove=`Покращ Title і description під запит «${topQuery}». URL та H1 не чіпай.`}
        else{actionKind='content-depth';nextMove=`Додай одну корисну секцію або FAQ точно під запит «${topQuery}».`}
      }else if(metrics.position>20&&metrics.position<=50&&metrics.impressions>=10){
        decision='DO NOW';
        reason=`Google вже тестує сторінку: ${number(metrics.impressions)} показів на позиції ${pos(metrics.position)}. Тут потрібна сильніша relevance, а не повний редизайн.`;
        actionKind='content-depth';
        nextMove=`Посиль одну секцію сторінки точно під запит «${topQuery}» і дай прямішу відповідь на intent. Після цього — 10 днів без нових SEO-змін.`;
      }else if(metrics.position>50&&metrics.impressions>=20){
        decision='ANALYZE';actionKind='intent-analysis';
        reason=`${number(metrics.impressions)} показів при позиції ${pos(metrics.position)} означають, що Google тестує URL, але relevance ще слабка.`;
        nextMove=`Спочатку перевір intent запиту «${topQuery}». Не міняй Title навмання. Якщо сторінка відповідає intent — додай одну точну секцію під цей запит.`;
      }

      return {tool,path,metrics,current,previous,trend,opportunity,topQuery,highCannibal,deployedLinks,linkIdeas,experiment,decision,actionKind,actionKey:`command:${tool.id}`,reason,nextMove};
    }).filter(row=>row.metrics.impressions>0||row.experiment!==null)
      .sort((a,b)=>{
        const weight:Record<Decision,number>={'FIX':6,'DO NOW':5,'SCALE':4,'ANALYZE':3,'DO NOT TOUCH':2,'WAIT':1};
        return (weight[b.decision]-weight[a.decision])||(b.opportunity-a.opportunity)||(b.metrics.impressions-a.metrics.impressions);
      });
  },[seven,twentyEight,highCannibalByPath,latestExperimentByTool]);

  const markDone=useCallback(async(row:PageSignal)=>{
    setSavingTask(row.actionKey);
    const task:TaskRecord={
      status:'Done',owner:taskState.owner||'Sviat',baseline7:row.current,verifyAt:addDays(10),completedAt:new Date().toISOString(),
      actionKind:row.actionKind,recommendation:row.nextMove,
      snapshot:{toolName:row.tool.name,path:row.path,priority:decisionLabel[row.decision],type:row.actionKind,title:row.nextMove,query:row.topQuery},
    };
    await persistTasks({...taskState,tasks:{...taskState.tasks,[row.actionKey]:task}});
    setSavingTask('');
  },[persistTasks,taskState]);

  const resetCycle=useCallback(async(row:PageSignal)=>{
    setSavingTask(row.actionKey);
    const task:TaskRecord={status:'Open',owner:taskState.owner||'Sviat',snapshot:{toolName:row.tool.name,path:row.path,priority:decisionLabel[row.decision],type:row.actionKind,title:row.nextMove,query:row.topQuery}};
    await persistTasks({...taskState,tasks:{...taskState.tasks,[row.actionKey]:task}});
    setSavingTask('');
  },[persistTasks,taskState]);

  const isDone=(row:PageSignal)=>taskState.tasks[row.actionKey]?.status==='Done';
  const counts=useMemo(()=>signals.reduce((acc,row)=>{if(!isDone(row))acc[row.decision]=(acc[row.decision]||0)+1;return acc},{'DO NOW':0,SCALE:0,FIX:0,ANALYZE:0,WAIT:0,'DO NOT TOUCH':0} as Record<Decision,number>),[signals,taskState]);
  const observingCount=signals.filter(row=>isDone(row)).length;

  const filterCounts=useMemo(()=>({
    all:signals.length,
    '3plus':signals.filter(row=>matchesFilter(row,'3plus',taskState.tasks[row.actionKey])).length,
    top10:signals.filter(row=>matchesFilter(row,'top10',taskState.tasks[row.actionKey])).length,
    top20:signals.filter(row=>matchesFilter(row,'top20',taskState.tasks[row.actionKey])).length,
    quick:signals.filter(row=>matchesFilter(row,'quick',taskState.tasks[row.actionKey])).length,
    growing:signals.filter(row=>matchesFilter(row,'growing',taskState.tasks[row.actionKey])).length,
    declining:signals.filter(row=>matchesFilter(row,'declining',taskState.tasks[row.actionKey])).length,
    cannibal:signals.filter(row=>matchesFilter(row,'cannibal',taskState.tasks[row.actionKey])).length,
    locked:signals.filter(row=>matchesFilter(row,'locked',taskState.tasks[row.actionKey])).length,
    observing:signals.filter(row=>matchesFilter(row,'observing',taskState.tasks[row.actionKey])).length,
  }),[signals,taskState]);

  const filteredSignals=useMemo(()=>{
    const needle=search.trim().toLowerCase();
    return signals.filter(row=>matchesFilter(row,quickFilter,taskState.tasks[row.actionKey])).filter(row=>!needle||row.path.toLowerCase().includes(needle)||row.topQuery.toLowerCase().includes(needle)||row.tool.name.toLowerCase().includes(needle));
  },[signals,quickFilter,search,taskState]);

  const topActions=signals.filter(row=>!isDone(row)&&(row.decision==='FIX'||row.decision==='DO NOW'||row.decision==='SCALE'||row.decision==='ANALYZE')).slice(0,5);
  const observationRows=signals.filter(row=>isDone(row)).sort((a,b)=>new Date(taskState.tasks[a.actionKey]?.verifyAt||0).getTime()-new Date(taskState.tasks[b.actionKey]?.verifyAt||0).getTime()).slice(0,20);
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
    {id:'observing',label:'Спостереження',count:filterCounts.observing},
  ];

  return <section className={styles.shell}>
    <div className={styles.head}>
      <div>
        <span>SEO КОМАНДНИЙ ЦЕНТР</span>
        <h2>Що робити прямо зараз</h2>
        <p>Система дає конкретну SEO-задачу. Після реалізації натисни «Виконано» — сторінка зникне з активної черги й піде на 10 днів у спостереження.</p>
      </div>
      <button onClick={()=>void load(true)} disabled={loading}><RefreshCw size={14} className={loading?styles.spin:''}/> {loading?'Оновлюю…':'Оновити GSC'}</button>
    </div>

    {error&&<div className={styles.error}><AlertTriangle size={16}/>{error}</div>}

    <div className={styles.safeNote}><ShieldCheck size={16}/><div><strong>Cloudflare safe mode</strong><span>На відкриття: 2 shared GSC reads (7д + 28д) і 1 маленький read стану задач. Немає polling, таймерів чи циклів. Фільтри, score, тренди та результати рахуються локально. Стан задач: {taskStore==='cloud'?'Cloudflare Durable Object':'локальний fallback'}.</span></div></div>

    <div className={styles.summary}>
      <div><strong>{counts['DO NOW']}</strong><span>КАЧАТИ ЗАРАЗ</span></div>
      <div><strong>{counts.SCALE}</strong><span>МАСШТАБУВАТИ</span></div>
      <div><strong>{counts.FIX}</strong><span>ВИПРАВИТИ</span></div>
      <div><strong>{counts.ANALYZE}</strong><span>АНАЛІЗ INTENT</span></div>
      <div><strong>{observingCount}</strong><span>СПОСТЕРЕЖЕННЯ</span></div>
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
          <div className={styles.commandControls}><button onClick={()=>void markDone(row)} disabled={savingTask===row.actionKey}><CheckCircle2 size={14}/>{savingTask===row.actionKey?'Зберігаю…':'Виконано → спостерігати 10 днів'}</button><span>Після натискання ця рекомендація не буде повторюватись під час observation.</span></div>
        </div>
      </div>)}</div>:<div className={styles.empty}>Зараз немає сторінок, які треба терміново змінювати. Це нормально — чекаємо нових GSC-сигналів.</div>}
    </div>

    {observationRows.length>0&&<div className={styles.panel}>
      <div className={styles.panelHead}><div><span>КОНТРОЛЬ ПІСЛЯ ЗМІН</span><h3>Спостереження та результат</h3></div><span className={styles.localOnly}>не доводить causality — показує GSC-сигнал</span></div>
      <div className={styles.observationList}>{observationRows.map(row=>{
        const task=taskState.tasks[row.actionKey];
        const outcome=taskOutcome(task,row.current);
        const left=daysUntil(task?.verifyAt);
        const baseline=task?.baseline7||empty;
        const positionGain=baseline.position&&row.current.position?baseline.position-row.current.position:0;
        const impressionDelta=baseline.impressions?((row.current.impressions-baseline.impressions)/baseline.impressions)*100:0;
        return <div className={styles.observationCard} key={row.actionKey}>
          <div><b className={`${styles.badge} ${outcomeTone(outcome)}`}>{outcome==='OBSERVING'?`СПОСТЕРЕЖЕННЯ · ${left} дн.`:outcome==='WIN'?'ПОЗИТИВНИЙ СИГНАЛ':outcome==='LOSER'?'ПОГІРШЕННЯ':'НЕЙТРАЛЬНО'}</b><strong>{row.path}</strong><small>{task?.recommendation||row.nextMove}</small></div>
          <div className={styles.observationMetrics}><span>Baseline: {number(baseline.impressions)} imp. · pos {pos(baseline.position)}</span><span>Зараз: {number(row.current.impressions)} imp. · pos {pos(row.current.position)}</span>{outcome!=='OBSERVING'&&<span>{impressionDelta>=0?'+':''}{impressionDelta.toFixed(0)}% imp. · {positionGain>=0?'+':''}{positionGain.toFixed(1)} позицій</span>}</div>
          {outcome!=='OBSERVING'&&<button onClick={()=>void resetCycle(row)} disabled={savingTask===row.actionKey}>{savingTask===row.actionKey?'Зберігаю…':'Закрити цикл → дозволити нову задачу'}</button>}
        </div>
      })}</div>
    </div>}

    <div className={styles.panel}>
      <div className={styles.panelHead}><div><span>ВСІ SEO-СИГНАЛИ</span><h3>Швидкі фільтри</h3></div><span className={styles.localOnly}>без нових API-запитів</span></div>
      <div className={styles.filters}>{filters.map(item=><button key={item.id} className={quickFilter===item.id?styles.filterActive:''} onClick={()=>setQuickFilter(item.id)}>{item.label}<b>{item.count}</b></button>)}</div>
      <div className={styles.search}><Search size={15}/><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Пошук сторінки або запиту…"/></div>

      {filteredSignals.length?<div className={styles.table}>
        <div className={styles.tableHead}><span>Що робити</span><span>Сторінка / запит</span><span>Покази</span><span>Позиція</span><span>CTR</span><span>Тренд</span><span>Score</span><span>Конкретний крок</span></div>
        {filteredSignals.slice(0,50).map(row=>{const task=taskState.tasks[row.actionKey];const done=task?.status==='Done';const outcome=done?taskOutcome(task,row.current):null;return <div className={styles.row} key={row.tool.id}>
          <span><b className={`${styles.badge} ${done?outcomeTone(outcome||'NEUTRAL'):toneFor(row.decision)}`}>{done?(outcome==='OBSERVING'?'СПОСТЕРЕЖЕННЯ':'ПЕРЕВІРИТИ'):decisionLabel[row.decision]}</b></span>
          <span><strong>{row.path}</strong><small>{row.topQuery}</small></span>
          <span>{number(row.metrics.impressions)}</span>
          <span>{pos(row.metrics.position)}</span>
          <span>{pct(row.metrics.ctr)}</span>
          <span><b className={`${styles.badge} ${trendTone(row.trend)}`}>{trendLabel[row.trend]}</b></span>
          <span><b>{row.opportunity}</b>/100</span>
          <span className={styles.next}>{done?`Виконано. ${outcome==='OBSERVING'?`Не чіпати ще ${daysUntil(task?.verifyAt)} дн.`:'Перевір результат вище.'}`:row.nextMove}</span>
        </div>})}
      </div>:<div className={styles.empty}>За цим фільтром зараз немає сигналів.</div>}
    </div>

    <div className={styles.grid}>
      <div className={styles.panel}>
        <div className={styles.panelHead}><div><span>КАНІБАЛІЗАЦІЯ</span><h3>Один запит → кілька наших URL</h3></div><AlertTriangle size={18}/></div>
        {cannibalRows.length?<div className={styles.compact}>{cannibalRows.slice(0,10).map(row=><div key={row.query}><span><strong>{row.query}</strong><small>{row.pages} сторінки · {number(row.impressions)} показів</small></span><b className={`${styles.badge} ${row.risk==='High'?styles.red:styles.amber}`}>{row.risk==='High'?'ВИСОКИЙ':'СЕРЕДНІЙ'}</b><span>{Math.round(row.primaryShare*100)}% на головному URL</span></div>)}</div>:<div className={styles.empty}>Конфліктів між сторінками зараз не видно.</div>}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}><div><span>НЕ ЧІПАТИ</span><h3>Сторінки під experiment lock</h3></div><CheckCircle2 size={18}/></div>
        {experimentRows.length?<div className={styles.compact}>{experimentRows.map(row=><div key={row.tool.id}><span><strong>{row.path}</strong><small>Зміна: {row.experiment?.changedAt}</small></span><b className={`${styles.badge} ${(row.experiment?.daysLeft||0)>0?styles.amber:styles.green}`}>{(row.experiment?.daysLeft||0)>0?`ще ${row.experiment?.daysLeft} дн.`:'можна оцінювати'}</b><span>{row.experiment?.change}</span></div>)}</div>:<div className={styles.empty}>Немає активних SEO-спостережень.</div>}
      </div>
    </div>

    <div className={styles.footer}><Link2 size={15}/> Internal links, score, filters і trend рахуються локально. <ShieldCheck size={15}/> Виконана задача блокує нові зміни на сторінці на 10 днів. <span>{loadedAt?`GSC завантажено о ${new Date(loadedAt).toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'})}`:'Дані ще не завантажені'}</span></div>
  </section>;
}
