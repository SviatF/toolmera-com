'use client';

import { useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

const number=(value:number,max=2)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:max}).format(Number.isFinite(value)?value:0);

function Metric({label,value}:{label:string;value:string|number}){
  return <div className="metricCard"><span>{label}</span><strong>{value}</strong></div>;
}

export function TipCalculator(){
  const [bill,setBill]=useState(86.5);
  const [tipPct,setTipPct]=useState(18);
  const [people,setPeople]=useState(2);

  const safeBill=Math.max(0,Number(bill)||0);
  const safeTip=Math.max(0,Number(tipPct)||0);
  const safePeople=Math.max(1,Math.floor(Number(people)||1));
  const tip=safeBill*safeTip/100;
  const total=safeBill+tip;

  return <div className="toolUi">
    <div className="fieldGrid calculatorTwoFields">
      <label>Bill amount<input type="number" min="0" step="0.01" value={bill} onChange={e=>setBill(+e.target.value)}/></label>
      <label>Tip percentage<input type="number" min="0" step="0.1" value={tipPct} onChange={e=>setTipPct(+e.target.value)}/></label>
      <label>People<input type="number" min="1" step="1" value={people} onChange={e=>setPeople(+e.target.value)}/></label>
    </div>
    <div className="calcModeTabs" aria-label="Tip percentage presets">
      {[10,15,18,20,25].map(pct=><button key={pct} className={tipPct===pct?'active':''} onClick={()=>setTipPct(pct)}>{pct}%</button>)}
    </div>
    <div className="metricGrid compactMetrics">
      <Metric label="Tip amount" value={number(tip,2)}/>
      <Metric label="Total with tip" value={number(total,2)}/>
      <Metric label="Tip per person" value={number(tip/safePeople,2)}/>
      <Metric label="Total per person" value={number(total/safePeople,2)}/>
    </div>
    <div className="formulaNote"><span>Formula</span><code>Tip = Bill × Tip % ÷ 100</code></div>
    <div className="toolNote"><ShieldCheck size={15}/><span>Use the same currency for the bill and result. Percentage presets are shortcuts, not tipping-etiquette advice.</span></div>
  </div>;
}

type FractionOperation='add'|'subtract'|'multiply'|'divide';

function gcd(a:number,b:number){
  a=Math.abs(Math.trunc(a));b=Math.abs(Math.trunc(b));
  while(b){const t=b;b=a%b;a=t}
  return a||1;
}

function normalize(n:number,d:number){
  if(d===0)return null;
  if(d<0){n=-n;d=-d}
  const g=gcd(n,d);
  return {n:n/g,d:d/g};
}

function fractionText(n:number,d:number){return d===1?String(n):`${n}/${d}`}

function mixedText(n:number,d:number){
  const sign=n<0?'-':'';
  const abs=Math.abs(n);
  const whole=Math.floor(abs/d);
  const rest=abs%d;
  if(!rest)return sign+String(whole);
  if(!whole)return sign+`${rest}/${d}`;
  return sign+`${whole} ${rest}/${d}`;
}

export function FractionCalculator(){
  const [a,setA]=useState(3),[b,setB]=useState(4),[c,setC]=useState(5),[d,setD]=useState(8);
  const [operation,setOperation]=useState<FractionOperation>('add');

  const result=useMemo(()=>{
    const A=Math.trunc(Number(a)||0),B=Math.trunc(Number(b)||0),C=Math.trunc(Number(c)||0),D=Math.trunc(Number(d)||0);
    if(B===0||D===0)return {error:'Denominators must not be zero.'} as const;
    let n=0,den=1,symbol='+';
    if(operation==='add'){n=A*D+C*B;den=B*D;symbol='+'}
    if(operation==='subtract'){n=A*D-C*B;den=B*D;symbol='−'}
    if(operation==='multiply'){n=A*C;den=B*D;symbol='×'}
    if(operation==='divide'){
      if(C===0)return {error:'Cannot divide by a zero fraction.'} as const;
      n=A*D;den=B*C;symbol='÷';
    }
    if(!Number.isSafeInteger(n)||!Number.isSafeInteger(den))return {error:'Use smaller integer values for an exact safe-integer result.'} as const;
    const reduced=normalize(n,den);
    if(!reduced)return {error:'The result is undefined.'} as const;
    return {
      n:reduced.n,d:reduced.d,symbol,
      exact:fractionText(reduced.n,reduced.d),
      mixed:mixedText(reduced.n,reduced.d),
      decimal:reduced.n/reduced.d,
      formula:`${A}/${B} ${symbol} ${C}/${D}`
    };
  },[a,b,c,d,operation]);

  return <div className="toolUi">
    <div className="calcModeTabs" role="tablist" aria-label="Fraction operation">
      <button className={operation==='add'?'active':''} onClick={()=>setOperation('add')}>Add +</button>
      <button className={operation==='subtract'?'active':''} onClick={()=>setOperation('subtract')}>Subtract −</button>
      <button className={operation==='multiply'?'active':''} onClick={()=>setOperation('multiply')}>Multiply ×</button>
      <button className={operation==='divide'?'active':''} onClick={()=>setOperation('divide')}>Divide ÷</button>
    </div>
    <div className="fieldGrid calculatorTwoFields">
      <label>First numerator<input type="number" step="1" value={a} onChange={e=>setA(+e.target.value)}/></label>
      <label>First denominator<input type="number" step="1" value={b} onChange={e=>setB(+e.target.value)}/></label>
      <label>Second numerator<input type="number" step="1" value={c} onChange={e=>setC(+e.target.value)}/></label>
      <label>Second denominator<input type="number" step="1" value={d} onChange={e=>setD(+e.target.value)}/></label>
    </div>
    {'error' in result?<div className="toolError">{result.error}</div>:<>
      <div className="metricGrid compactMetrics">
        <Metric label="Exact fraction" value={result.exact}/>
        <Metric label="Mixed number" value={result.mixed}/>
        <Metric label="Decimal" value={number(result.decimal,8)}/>
      </div>
      <div className="formulaNote"><span>Operation</span><code>{result.formula} = {result.exact}</code></div>
    </>}
    <div className="toolNote"><ShieldCheck size={15}/><span>Results are simplified exactly with integer arithmetic before the decimal value is shown.</span></div>
  </div>;
}
