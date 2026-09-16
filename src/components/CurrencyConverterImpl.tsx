'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpDown, Clock3, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { currencies, currencyPairs, type CurrencyCode, type CurrencyPair } from '@/data/currencyPairs';
import styles from './CurrencyConverter.module.css';

type HistoryPoint={date:string;rate:number};
type PairPayload={
  slug:string;
  from:string;
  to:string;
  rate:number;
  providerDate:string;
  updatedAt:string;
  history:HistoryPoint[];
  source:string;
  cadence:string;
};
type HubRateRow={slug:string;from:string;to:string;rate:number;providerDate:string;updatedAt:string};
type HubPayload={
  updatedAt:string;
  source:string;
  pairs:HubRateRow[];
};
type WindowStats={points:HistoryPoint[];min:number;max:number;avg:number;first:number;last:number;change:number;rangePct:number;position:number};

function precision(rate:number){
  if(rate>=100)return 2;
  if(rate>=1)return 4;
  return 6;
}
function number(value:number,max=4){return new Intl.NumberFormat('en-US',{maximumFractionDigits:max}).format(value)}
function money(value:number,code:string){
  const meta=currencies[code as CurrencyCode];
  try{return new Intl.NumberFormat(meta?.locale||'en-US',{style:'currency',currency:code,maximumFractionDigits:precision(value)}).format(value)}
  catch{return `${meta?.symbol||code} ${number(value,precision(value))}`}
}
function timeLabel(value:string){
  const date=new Date(value);if(Number.isNaN(date.getTime()))return value;
  return date.toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'UTC'})+' UTC';
}
function providerDateLabel(value:string){
  const date=new Date(`${value}T00:00:00Z`);if(Number.isNaN(date.getTime()))return value;
  return date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
}
function trendSlice(history:HistoryPoint[],days:number){
  const cutoff=new Date();cutoff.setUTCDate(cutoff.getUTCDate()-days);
  const iso=cutoff.toISOString().slice(0,10);
  return history.filter(point=>point.date>=iso);
}
function windowStats(history:HistoryPoint[],days:number):WindowStats|null{
  const points=trendSlice(history,days);
  if(points.length<2)return null;
  const values=points.map(point=>point.rate);
  const min=Math.min(...values);const max=Math.max(...values);const first=points[0].rate;const last=points.at(-1)!.rate;
  const avg=values.reduce((sum,value)=>sum+value,0)/values.length;
  const change=first>0?(last-first)/first*100:0;
  const span=Math.max(max-min,1e-12);
  const rangePct=avg>0?(max-min)/avg*100:0;
  const position=Math.max(0,Math.min(1,(last-min)/span));
  return {points,min,max,avg,first,last,change,rangePct,position};
}
function rangePosition(position:number){
  if(position>=.85)return 'near the top';
  if(position>=.62)return 'in the upper part';
  if(position<=.15)return 'near the bottom';
  if(position<=.38)return 'in the lower part';
  return 'near the middle';
}
function trendSentence(pair:CurrencyPair,history:HistoryPoint[],days:number){
  const stats=windowStats(history,days);
  if(!stats)return `Not enough ${days}-day history has accumulated yet.`;
  const base=currencies[pair.from].name;const quote=currencies[pair.to].name;const abs=Math.abs(stats.change);
  const zone=rangePosition(stats.position);
  let movement:string;
  if(abs<.25)movement=`${base} has stayed broadly stable against ${quote} over the past ${days} days, moving ${abs.toFixed(2)}%.`;
  else if(stats.change>0)movement=`${base} has ${abs>=2.5?'moved decisively higher':'strengthened'} ${abs.toFixed(2)}% against ${quote} over the past ${days} days.`;
  else movement=`${base} has ${abs>=2.5?'moved decisively lower':'weakened'} ${abs.toFixed(2)}% against ${quote} over the past ${days} days.`;

  const short=days>=30?windowStats(history,7):null;
  let momentum='';
  if(short&&Math.abs(short.change)>=.35){
    const direction=short.change>0?'higher':'lower';
    momentum=` The most recent 7-day move is ${Math.abs(short.change).toFixed(2)}% ${direction}.`;
  }
  return `${movement} The latest rate sits ${zone} of its ${days}-day range; that range spans ${stats.rangePct.toFixed(2)}% around the period average.${momentum}`;
}

function deriveCrossRate(rows:HubRateRow[],from:CurrencyCode,to:CurrencyCode){
  if(from===to)return 1;
  const graph=new Map<string,{code:CurrencyCode;rate:number}[]>();
  const add=(a:CurrencyCode,b:CurrencyCode,rate:number)=>{
    if(!Number.isFinite(rate)||rate<=0)return;
    const list=graph.get(a)||[];list.push({code:b,rate});graph.set(a,list);
  };
  for(const row of rows){
    const a=row.from as CurrencyCode;const b=row.to as CurrencyCode;
    add(a,b,row.rate);add(b,a,1/row.rate);
  }
  const queue:{code:CurrencyCode;rate:number}[]=[{code:from,rate:1}];
  const seen=new Set<CurrencyCode>([from]);
  while(queue.length){
    const current=queue.shift()!;
    for(const edge of graph.get(current.code)||[]){
      if(seen.has(edge.code))continue;
      const nextRate=current.rate*edge.rate;
      if(edge.code===to)return nextRate;
      seen.add(edge.code);queue.push({code:edge.code,rate:nextRate});
    }
  }
  return 0;
}

function TrendChart({pair,history}:{pair:CurrencyPair;history:HistoryPoint[]}){
  const [days,setDays]=useState(30);
  const stats=useMemo(()=>windowStats(history,days),[history,days]);
  const points=stats?.points||[];
  const min=stats?.min||0;const max=stats?.max||0;
  const range=Math.max(max-min,Math.abs(max)*.002,1e-9);
  const width=720;const height=220;const pad=18;
  const path=points.map((point,index)=>{
    const x=pad+(index/Math.max(1,points.length-1))*(width-pad*2);
    const y=pad+((max-point.rate)/range)*(height-pad*2);
    return `${index?'L':'M'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
  const delta=stats?.change||0;
  return <section className={styles.panel}>
    <div className={styles.panelHead}><div><span className={styles.kicker}>RATE TREND</span><h2>{pair.from} to {pair.to} history</h2></div><div className={styles.rangeTabs}>{[7,30,90].map(value=><button key={value} type="button" className={days===value?styles.activeTab:''} onClick={()=>setDays(value)}>{value}D</button>)}</div></div>
    <div className={styles.chartWrap}>
      {points.length>1?<svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${pair.from} to ${pair.to} ${days}-day exchange-rate trend`}><path className={styles.gridLine} d={`M ${pad} ${height/2} L ${width-pad} ${height/2}`}/><path className={styles.chartLine} d={path}/></svg>:<div className={styles.chartEmpty}>Trend data is still accumulating.</div>}
    </div>
    <div className={styles.trendStats}><span>Low <strong>{stats?number(stats.min,precision(stats.min)):'—'}</strong></span><span>Average <strong>{stats?number(stats.avg,precision(stats.avg)):'—'}</strong></span><span>High <strong>{stats?number(stats.max,precision(stats.max)):'—'}</strong></span><span className={delta>=0?styles.up:styles.down}>{delta>=0?<TrendingUp size={14}/>:<TrendingDown size={14}/>} {Math.abs(delta).toFixed(2)}%</span></div>
    <p className={styles.trendCopy}>{trendSentence(pair,history,days)}</p>
  </section>;
}

export function CurrencyPairConverter({pair,related}:{pair:CurrencyPair;related:CurrencyPair[]}){
  const [data,setData]=useState<PairPayload|null>(null);const [amount,setAmount]=useState('1');const [unavailable,setUnavailable]=useState(false);
  useEffect(()=>{let cancelled=false;(async()=>{try{const response=await fetch(`/api/currency/rates?pair=${encodeURIComponent(pair.slug)}`);if(!response.ok)throw new Error('snapshot unavailable');const payload=await response.json() as PairPayload;if(!cancelled){setData(payload);setUnavailable(false)}}catch{if(!cancelled)setUnavailable(true)}})();return()=>{cancelled=true}},[pair.slug]);
  const numeric=Math.max(0,Number(amount)||0);const converted=data?numeric*data.rate:0;
  const common=[1,5,10,25,50,100,500,1000];
  const inverse=data?.rate?1/data.rate:0;
  return <div className={styles.stack}>
    <section className={styles.rateHero}>
      {data?<><div className={styles.directAnswer}>Latest {pair.from} to {pair.to} reference rate: <strong>1 {pair.from} = {money(data.rate,pair.to)}</strong></div><div className={styles.updated}><Clock3 size={14}/> Rate date: {providerDateLabel(data.providerDate)} · Snapshot checked: {timeLabel(data.updatedAt)}</div></>:unavailable?<div className={styles.directAnswer}>The latest stored reference-rate snapshot is being prepared.</div>:<div className={styles.directAnswer}><RefreshCw className={styles.spin} size={16}/> Loading the latest stored reference rate…</div>}
    </section>

    <section className={styles.converterCard}>
      <div className={styles.amountBox}><label htmlFor="currencyAmount">Amount</label><div><input id="currencyAmount" inputMode="decimal" value={amount} onChange={event=>setAmount(event.target.value.replace(/[^0-9.]/g,''))}/><span>{pair.from}</span></div></div>
      <ArrowRight className={styles.arrow}/>
      <div className={styles.resultBox}><span>Converted amount</span><strong>{data?money(converted,pair.to):'—'}</strong><small>{data?`1 ${pair.from} = ${number(data.rate,precision(data.rate))} ${pair.to}`:'Waiting for stored rate snapshot'}</small>{data&&<small>Inverse: 1 {pair.to} = {number(inverse,precision(inverse))} {pair.from}</small>}</div>
    </section>

    <section className={styles.panel}>
      <div className={styles.panelHead}><div><span className={styles.kicker}>QUICK AMOUNTS</span><h2>Common {pair.from} to {pair.to} conversions</h2></div></div>
      <div className={styles.amountTable}>{common.map(value=><div key={value}><span>{number(value)} {pair.from}</span><strong>{data?money(value*data.rate,pair.to):'—'}</strong></div>)}</div>
    </section>

    {data&&<TrendChart pair={pair} history={data.history||[]}/>} 

    <section className={styles.related}>
      <span className={styles.kicker}>RELATED PAIRS</span><h2>Continue with related currency pairs</h2>
      <div>{related.map(item=><Link href={`/currency/${item.slug}/`} key={item.slug}>{item.from} to {item.to}<ArrowRight size={14}/></Link>)}</div>
    </section>

    <p className={styles.sourceLine}>Reference-rate snapshots are checked hourly from official-source data via Frankfurter.</p>
  </div>;
}

export function CurrencyHubConverter(){
  const [data,setData]=useState<HubPayload|null>(null);const [fromCode,setFromCode]=useState<CurrencyCode>('USD');const [toCode,setToCode]=useState<CurrencyCode>('INR');const [amount,setAmount]=useState('100');
  useEffect(()=>{let cancelled=false;(async()=>{try{const response=await fetch('/api/currency/rates');if(!response.ok)return;const payload=await response.json() as HubPayload;if(!cancelled)setData(payload)}catch{}})();return()=>{cancelled=true}},[]);
  const rate=useMemo(()=>deriveCrossRate(data?.pairs||[],fromCode,toCode),[data,fromCode,toCode]);
  const numeric=Math.max(0,Number(amount)||0);
  const exactPair=currencyPairs.find(item=>item.from===fromCode&&item.to===toCode);
  const codes=Object.keys(currencies) as CurrencyCode[];
  const swap=()=>{setFromCode(toCode);setToCode(fromCode)};
  return <div className={styles.stack}>
    <section className={styles.converterCard}>
      <div className={styles.amountBox}><label htmlFor="hubAmount">Amount</label><div><input id="hubAmount" inputMode="decimal" value={amount} onChange={event=>setAmount(event.target.value.replace(/[^0-9.]/g,''))}/><span>{fromCode}</span></div></div>
      <div className={styles.pairChooser}>
        <div className={styles.hubSelect}><label htmlFor="hubFrom">From</label><select id="hubFrom" value={fromCode} onChange={event=>setFromCode(event.target.value as CurrencyCode)}>{codes.map(code=><option key={code} value={code}>{code} — {currencies[code].name}</option>)}</select></div>
        <button type="button" className={styles.swapButton} onClick={swap} aria-label="Swap currencies"><ArrowUpDown size={17}/></button>
        <div className={styles.hubSelect}><label htmlFor="hubTo">To</label><select id="hubTo" value={toCode} onChange={event=>setToCode(event.target.value as CurrencyCode)}>{codes.map(code=><option key={code} value={code}>{code} — {currencies[code].name}</option>)}</select></div>
      </div>
      <div className={styles.resultBox}><span>Converted amount</span><strong>{rate?money(numeric*rate,toCode):'—'}</strong><small>{rate?`1 ${fromCode} = ${number(rate,precision(rate))} ${toCode}`:'Loading stored rates…'}</small>{exactPair&&<Link className={styles.inlinePairLink} href={`/currency/${exactPair.slug}/`}>Open {fromCode} to {toCode} trend page <ArrowRight size={13}/></Link>}</div>
    </section>
    <section className={styles.panel}><div className={styles.panelHead}><div><span className={styles.kicker}>POPULAR PAIRS</span><h2>Demand-gated currency converter pages</h2></div>{data&&<span className={styles.updated}><Clock3 size={14}/> Snapshot checked {timeLabel(data.updatedAt)}</span>}</div><div className={styles.pairGrid}>{currencyPairs.map(item=>{const row=data?.pairs.find(rateRow=>rateRow.slug===item.slug);return <Link href={`/currency/${item.slug}/`} key={item.slug}><span>{item.from} → {item.to}</span><strong>{row?number(row.rate,precision(row.rate)):'—'}</strong><small>Open converter <ArrowRight size={12}/></small></Link>})}</div></section>
    <p className={styles.sourceLine}>Reference-rate snapshots are checked hourly from official-source data via Frankfurter.</p>
  </div>;
}
