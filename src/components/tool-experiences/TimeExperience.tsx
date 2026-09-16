'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, ShieldCheck } from 'lucide-react';
import type { Tool } from '@/data/tools';

function MetricCard({label,value}:{label:string;value:string|number}){return <div className="metricCard"><span>{label}</span><strong>{value}</strong></div>}
async function copyPlainText(value:string){await navigator.clipboard.writeText(value)}

function relativeTime(ms:number){
  const delta=ms-Date.now(),abs=Math.abs(delta);
  const units:[number,string][]=[[86400000,'day'],[3600000,'hour'],[60000,'minute'],[1000,'second']];
  for(const [size,label] of units)if(abs>=size||label==='second'){const value=Math.round(abs/size),word=label+(value===1?'':'s');return delta>=0?'in '+value+' '+word:value+' '+word+' ago'}
  return 'now';
}

function UnixTimestampConverter(){
  const [nowMs,setNowMs]=useState(0),[timestamp,setTimestamp]=useState(''),[unit,setUnit]=useState<'auto'|'seconds'|'milliseconds'>('auto'),[dateInput,setDateInput]=useState(''),[dateMode,setDateMode]=useState<'local'|'utc'>('local'),[copied,setCopied]=useState('');
  useEffect(()=>{const tick=()=>{const now=Date.now();setNowMs(now);if(!timestamp)setTimestamp(String(Math.floor(now/1000)));if(!dateInput){const d=new Date(now),pad=(v:number)=>String(v).padStart(2,'0');setDateInput(d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds()))}};tick();const id=window.setInterval(tick,1000);return()=>window.clearInterval(id)},[]);
  const parsed=useMemo(()=>{const raw=timestamp.trim();if(!raw)return {error:'Enter a Unix timestamp.'} as const;const n=Number(raw);if(!Number.isFinite(n))return {error:'Timestamp must be numeric.'} as const;const detected=unit==='auto'?(Math.abs(n)>=1e11?'milliseconds':'seconds'):unit;const ms=detected==='seconds'?n*1000:n;const d=new Date(ms);if(!Number.isFinite(d.getTime()))return {error:'This timestamp is outside the supported JavaScript Date range.'} as const;return {date:d,ms,detected}},[timestamp,unit]);
  const reverse=useMemo(()=>{if(!dateInput)return null;const localDate=dateMode==='local'?new Date(dateInput):null;let ms:number;if(dateMode==='local')ms=localDate!.getTime();else{const m=dateInput.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);if(!m)return null;ms=Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0))}return Number.isFinite(ms)?{ms,seconds:Math.floor(ms/1000)}:null},[dateInput,dateMode]);
  async function copyValue(key:string,value:string){await copyPlainText(value);setCopied(key);window.setTimeout(()=>setCopied(''),1200)}
  const zone=typeof Intl!=='undefined'?Intl.DateTimeFormat().resolvedOptions().timeZone:'Local time';
  return <div className="toolUi">
    <div className="epochNow"><div><span>Current Unix seconds</span><strong>{nowMs?Math.floor(nowMs/1000):'—'}</strong><button onClick={()=>copyValue('now-sec',String(Math.floor(nowMs/1000)))}>{copied==='now-sec'?<Check size={14}/>:<Copy size={14}/>}</button></div><div><span>Current milliseconds</span><strong>{nowMs||'—'}</strong><button onClick={()=>copyValue('now-ms',String(nowMs))}>{copied==='now-ms'?<Check size={14}/>:<Copy size={14}/>}</button></div></div>
    <div className="toolSubsection"><h3>Timestamp → Date</h3><div className="fieldGrid calculatorTwoFields"><label>Unix timestamp<input inputMode="numeric" value={timestamp} onChange={e=>setTimestamp(e.target.value)}/></label><label>Unit<select value={unit} onChange={e=>setUnit(e.target.value as typeof unit)}><option value="auto">Auto detect</option><option value="seconds">Seconds</option><option value="milliseconds">Milliseconds</option></select></label></div>
      {'error' in parsed?<div className="toolError">{parsed.error}</div>:<div className="epochOutputs"><div><span>Detected</span><strong>{parsed.detected}</strong></div><div><span>UTC</span><strong>{parsed.date.toUTCString()}</strong><button onClick={()=>copyValue('utc',parsed.date.toUTCString())}>{copied==='utc'?<Check size={14}/>:<Copy size={14}/>}</button></div><div><span>Local · {zone}</span><strong>{parsed.date.toLocaleString()}</strong><button onClick={()=>copyValue('local',parsed.date.toLocaleString())}>{copied==='local'?<Check size={14}/>:<Copy size={14}/>}</button></div><div><span>ISO 8601</span><strong>{parsed.date.toISOString()}</strong><button onClick={()=>copyValue('iso',parsed.date.toISOString())}>{copied==='iso'?<Check size={14}/>:<Copy size={14}/>}</button></div><div><span>Relative</span><strong>{relativeTime(parsed.ms)}</strong></div></div>}
    </div>
    <div className="toolSubsection"><h3>Date → Timestamp</h3><div className="calcModeTabs unitTabs"><button className={dateMode==='local'?'active':''} onClick={()=>setDateMode('local')}>Local time</button><button className={dateMode==='utc'?'active':''} onClick={()=>setDateMode('utc')}>UTC</button></div><input className="dateTimeInput" type="datetime-local" step="1" value={dateInput} onChange={e=>setDateInput(e.target.value)}/>{reverse&&<div className="metricGrid calculatorTwoFields"><MetricCard label="Unix seconds" value={String(reverse.seconds)}/><MetricCard label="Milliseconds" value={String(reverse.ms)}/></div>}</div>
    <div className="toolNote"><ShieldCheck size={15}/><span>Unix time represents an instant relative to 1970-01-01T00:00:00Z. Local display uses your browser&apos;s current timezone rules.</span></div>
  </div>;
}

function parseLocalDate(value:string){const [y,m,d]=value.split('-').map(Number);return y&&m&&d?new Date(y,m-1,d):null}
function formatDateValue(date:Date){return date.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
function shiftCalendarDate(base:Date,sign:number,years:number,months:number,weeks:number,days:number){const d=new Date(base.getFullYear(),base.getMonth(),1);const originalDay=base.getDate();d.setFullYear(d.getFullYear()+sign*years);d.setMonth(d.getMonth()+sign*months);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(originalDay,last));d.setDate(d.getDate()+sign*(weeks*7+days));return d}

function DateCalculator(){
  const [date,setDate]=useState(''),[mode,setMode]=useState<'add'|'subtract'>('add');const [years,setYears]=useState(0),[months,setMonths]=useState(0),[weeks,setWeeks]=useState(0),[days,setDays]=useState(0);
  useEffect(()=>{if(!date){const n=new Date();setDate([n.getFullYear(),String(n.getMonth()+1).padStart(2,'0'),String(n.getDate()).padStart(2,'0')].join('-'))}},[date]);
  const result=useMemo(()=>{const base=parseLocalDate(date);return base?shiftCalendarDate(base,mode==='add'?1:-1,years,months,weeks,days):null},[date,mode,years,months,weeks,days]);
  return <div className="toolUi"><div className="calcModeTabs unitTabs"><button className={mode==='add'?'active':''} onClick={()=>setMode('add')}>Add</button><button className={mode==='subtract'?'active':''} onClick={()=>setMode('subtract')}>Subtract</button></div><div className="fieldGrid"><label>Start date<input type="date" value={date} onChange={x=>setDate(x.target.value)}/></label><label>Years<input type="number" min="0" value={years} onChange={x=>setYears(Math.max(0,Number(x.target.value)||0))}/></label><label>Months<input type="number" min="0" value={months} onChange={x=>setMonths(Math.max(0,Number(x.target.value)||0))}/></label><label>Weeks<input type="number" min="0" value={weeks} onChange={x=>setWeeks(Math.max(0,Number(x.target.value)||0))}/></label><label>Days<input type="number" min="0" value={days} onChange={x=>setDays(Math.max(0,Number(x.target.value)||0))}/></label></div><div className="resultHero"><span>Result date</span><strong>{result?formatDateValue(result):'—'}</strong>{result&&<small>{[result.getFullYear(),String(result.getMonth()+1).padStart(2,'0'),String(result.getDate()).padStart(2,'0')].join('-')}</small>}</div><div className="toolNote"><ShieldCheck size={15}/><span>Month and year changes clamp to the last valid day of the target month before weeks and days are applied.</span></div></div>;
}

function TimeDurationCalculator(){
  const [start,setStart]=useState(''),[end,setEnd]=useState('');
  const result=useMemo(()=>{if(!start||!end)return null;const a=new Date(start),b=new Date(end),ms=b.getTime()-a.getTime();if(!Number.isFinite(ms)||ms<0)return {error:'End date-time must be after the start date-time.',ms:0};return {error:'',ms}},[start,end]);
  const seconds=result&&!result.error?Math.floor(result.ms/1000):0;const days=Math.floor(seconds/86400),hours=Math.floor((seconds%86400)/3600),minutes=Math.floor((seconds%3600)/60),secs=seconds%60;
  return <div className="toolUi"><div className="fieldGrid"><label>Start date & time<input type="datetime-local" value={start} onChange={x=>setStart(x.target.value)}/></label><label>End date & time<input type="datetime-local" value={end} onChange={x=>setEnd(x.target.value)}/></label></div>{result?.error&&<div className="toolError">{result.error}</div>}{result&&!result.error&&<><div className="metricGrid textMetricGrid"><MetricCard label="Days" value={days}/><MetricCard label="Hours" value={hours}/><MetricCard label="Minutes" value={minutes}/><MetricCard label="Seconds" value={secs}/></div><div className="resultHero"><span>Total elapsed time</span><strong>{(seconds/3600).toLocaleString(undefined,{maximumFractionDigits:4})} hours</strong><small>{Math.floor(seconds/60).toLocaleString()} minutes · {seconds.toLocaleString()} seconds</small></div></>}<div className="toolNote"><ShieldCheck size={15}/><span>Inputs are interpreted as local date-times by the browser. For cross-zone scheduling, use the Time Zone Converter instead.</span></div></div>;
}

export function TimeExperience({tool}:{tool:Tool}){
  let ui=null;
  if(tool.kind==='unix-timestamp')ui=<UnixTimestampConverter/>;
  else if(tool.kind==='date-calculator')ui=<DateCalculator/>;
  else if(tool.kind==='time-duration')ui=<TimeDurationCalculator/>;
  return <section className={`toolExperience accent-${tool.accent}`}><div className="experienceTop"><div><span className="eyebrow">TOOLMERA / {tool.categoryLabel.toUpperCase()}</span><div className="experienceTitle">{tool.name}</div></div><span className="privatePill"><ShieldCheck size={15}/> Browser-first processing</span></div>{ui}</section>;
}
