'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpDown, Clock3, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { currencies, currencyPairs, type CurrencyPair } from '@/data/currencyPairs';
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
type HubPayload={
  updatedAt:string;
  source:string;
  pairs:{slug:string;from:string;to:string;rate:number;providerDate:string;updatedAt:string}[];
};

function precision(rate:number){
  if(rate>=100)return 2;
  if(rate>=1)return 4;
  return 6;
}
function number(value:number,max=4){return new Intl.NumberFormat('en-US',{maximumFractionDigits:max}).format(value)}
function money(value:number,code:string){
  const meta=currencies[code as keyof typeof currencies];
  try{return new Intl.NumberFormat(meta?.locale||'en-US',{style:'currency',currency:code,maximumFractionDigits:precision(value)}).format(value)}
  catch{return `${meta?.symbol||code} ${number(value,precision(value))}`}
}
function timeAgo(value:string){
  const date=new Date(value);if(Number.isNaN(date.getTime()))return value;
  return date.toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'UTC'})+' UTC';
}
function trendSlice(history:HistoryPoint[],days:number){
  const cutoff=new Date();cutoff.setUTCDate(cutoff.getUTCDate()-days);
  const iso=cutoff.toISOString().slice(0,10);
  return history.filter(point=>point.date>=iso);
}
function trendSentence(pair:CurrencyPair,history:HistoryPoint[],days:number){
  const points=trendSlice(history,days);
  if(points.length<2)return `Not enough ${days}-day history has accumulated yet.`;
  const first=points[0].rate;const last=points.at(-1)!.rate;
  const change=(last-first)/first*100;
  const base=currencies[pair.from].name;const quote=currencies[pair.to].name;
  const abs=Math.abs(change);
  if(abs<.25)return `${base} has stayed broadly stable against ${quote} over the past ${days} days, moving ${abs.toFixed(2)}%.`;
  if(change>0){
    const verb=abs>=2.5?'moved decisively higher':'strengthened';
    return `${base} has ${verb} ${abs.toFixed(2)}% against ${quote} over the past ${days} days, from ${number(first,precision(first))} to ${number(last,precision(last))} ${pair.to}.`;
  }
  const verb=abs>=2.5?'moved decisively lower':'weakened';
  return `${base} has ${verb} ${abs.toFixed(2)}% against ${quote} over the past ${days} days, from ${number(first,precision(first))} to ${number(last,precision(last))} ${pair.to}.`;
}

function TrendChart({pair,history}:{pair:CurrencyPair;history:HistoryPoint[]}){
  const [days,setDays]=useState(30);
  const points=useMemo(()=>trendSlice(history,days),[history,days]);
  const values=points.map(p=>p.rate);
  const min=values.length?Math.min(...values):0;const max=values.length?Math.max(...values):0;
  const range=Math.max(max-min,Math.abs(max)*.002,1e-9);
  const width=720;const height=220;const pad=18;
  const path=points.map((point,index)=>{
    const x=pad+(index/Math.max(1,points.length-1))*(width-pad*2);
    const y=pad+((max-point.rate)/range)*(height-pad*2);
    return `${index?'L':'M'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
  const delta=points.length>1?(points.at(-1)!.rate-points[0].rate)/points[0].rate*100:0;
  return <section className={styles.panel}>
    <div className={styles.panelHead}><div><span className={styles.kicker}>RATE TREND</span><h2>{pair.from} to {pair.to} history</h2></div><div className={styles.rangeTabs}>{[7,30,90].map(value=><button key={value} type="button" className={days===value?styles.activeTab:''} onClick={()=>setDays(value)}>{value}D</button>)}</div></div>
    <div className={styles.chartWrap}>
      {points.length>1?<svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${pair.from} to ${pair.to} ${days}-day exchange-rate trend`}><path className={styles.gridLine} d={`M ${pad} ${height/2} L ${width-pad} ${height/2}`}/><path className={styles.chartLine} d={path}/></svg>:<div className={styles.chartEmpty}>Trend data is still accumulating.</div>}
    </div>
    <div className={styles.trendStats}><span>Low <strong>{min?number(min,precision(min)):'—'}</strong></span><span>High <strong>{max?number(max,precision(max)):'—'}</strong></span><span className={delta>=0?styles.up:styles.down}>{delta>=0?<TrendingUp size={14}/>:<TrendingDown size={14}/>} {Math.abs(delta).toFixed(2)}%</span></div>
    <p className={styles.trendCopy}>{trendSentence(pair,history,days)}</p>
  </section>;
}

export function CurrencyPairConverter({pair,related}:{pair:CurrencyPair;related:CurrencyPair[]}){
  const [data,setData]=useState<PairPayload|null>(null);const [amount,setAmount]=useState('1');const [error,setError]=useState('');
  useEffect(()=>{let cancelled=false;(async()=>{try{const response=await fetch(`/api/currency/rates?pair=${encodeURIComponent(pair.slug)}`);if(!response.ok)throw new Error('Rate snapshot unavailable');const payload=await response.json() as PairPayload;if(!cancelled)setData(payload)}catch{if(!cancelled)setError('Rate data is temporarily unavailable.')}})();return()=>{cancelled=true}},[pair.slug]);
  const numeric=Math.max(0,Number(amount)||0);const converted=data?numeric*data.rate:0;
  const common=[1,10,100,1000];
  return <div className={styles.stack}>
    <section className={styles.rateHero}>
      {data?<><div className={styles.directAnswer}>1 {pair.from} = <strong>{money(data.rate,pair.to)}</strong> today. <span>Rates update hourly.</span></div><div className={styles.updated}><Clock3 size={14}/> Last updated: {timeAgo(data.updatedAt)}</div></>:error?<div className={styles.directAnswer}>Latest stored rate will appear here when the snapshot is available.</div>:<div className={styles.directAnswer}><RefreshCw className={styles.spin} size={16}/> Loading the latest stored rate…</div>}
    </section>

    <section className={styles.converterCard}>
      <div className={styles.amountBox}><label htmlFor="currencyAmount">Amount</label><div><input id="currencyAmount" inputMode="decimal" value={amount} onChange={event=>setAmount(event.target.value.replace(/[^0-9.]/g,''))}/><span>{pair.from}</span></div></div>
      <ArrowRight className={styles.arrow}/>
      <div className={styles.resultBox}><span>Converted amount</span><strong>{data?money(converted,pair.to):'—'}</strong><small>{data?`Rate ${number(data.rate,precision(data.rate))} ${pair.to} per ${pair.from}`:'Waiting for rate snapshot'}</small></div>
    </section>

    <section className={styles.panel}>
      <div className={styles.panelHead}><div><span className={styles.kicker}>QUICK AMOUNTS</span><h2>Common {pair.from} conversions</h2></div></div>
      <div className={styles.amountTable}>{common.map(value=><div key={value}><span>{number(value)} {pair.from}</span><strong>{data?money(value*data.rate,pair.to):'—'}</strong></div>)}</div>
    </section>

    {data&&<TrendChart pair={pair} history={data.history||[]}/>} 

    <section className={styles.related}>
      <span className={styles.kicker}>RELATED PAIRS</span><h2>Continue with related currency pairs</h2>
      <div>{related.map(item=><Link href={`/currency/${item.slug}/`} key={item.slug}>{item.from} to {item.to}<ArrowRight size={14}/></Link>)}</div>
    </section>

    <p className={styles.sourceLine}>Rates update hourly from official-source reference data via Frankfurter.</p>
  </div>;
}

export function CurrencyHubConverter(){
  const [data,setData]=useState<HubPayload|null>(null);const [pairSlug,setPairSlug]=useState('usd-to-inr');const [amount,setAmount]=useState('100');
  useEffect(()=>{let cancelled=false;(async()=>{try{const response=await fetch('/api/currency/rates');if(!response.ok)return;const payload=await response.json() as HubPayload;if(!cancelled)setData(payload)}catch{}})();return()=>{cancelled=true}},[]);
  const pair=currencyPairs.find(item=>item.slug===pairSlug)||currencyPairs[0];
  const rate=data?.pairs.find(item=>item.slug===pair.slug)?.rate||0;
  const numeric=Math.max(0,Number(amount)||0);
  return <div className={styles.stack}>
    <section className={styles.converterCard}>
      <div className={styles.amountBox}><label htmlFor="hubAmount">Amount</label><div><input id="hubAmount" inputMode="decimal" value={amount} onChange={event=>setAmount(event.target.value.replace(/[^0-9.]/g,''))}/><span>{pair.from}</span></div></div>
      <ArrowUpDown className={styles.arrow}/>
      <div className={styles.hubSelect}><label htmlFor="hubPair">Currency pair</label><select id="hubPair" value={pairSlug} onChange={event=>setPairSlug(event.target.value)}>{currencyPairs.map(item=><option key={item.slug} value={item.slug}>{item.from} → {item.to}</option>)}</select></div>
      <div className={styles.resultBox}><span>Converted amount</span><strong>{rate?money(numeric*rate,pair.to):'—'}</strong><small>{rate?`1 ${pair.from} = ${number(rate,precision(rate))} ${pair.to}`:'Loading stored rates…'}</small></div>
    </section>
    <section className={styles.panel}><div className={styles.panelHead}><div><span className={styles.kicker}>POPULAR PAIRS</span><h2>Demand-gated currency converters</h2></div>{data&&<span className={styles.updated}><Clock3 size={14}/> {timeAgo(data.updatedAt)}</span>}</div><div className={styles.pairGrid}>{currencyPairs.map(item=>{const row=data?.pairs.find(rateRow=>rateRow.slug===item.slug);return <Link href={`/currency/${item.slug}/`} key={item.slug}><span>{item.from} → {item.to}</span><strong>{row?number(row.rate,precision(row.rate)):'—'}</strong><small>Open converter <ArrowRight size={12}/></small></Link>})}</div></section>
    <p className={styles.sourceLine}>Rates update hourly from official-source reference data via Frankfurter.</p>
  </div>;
}
