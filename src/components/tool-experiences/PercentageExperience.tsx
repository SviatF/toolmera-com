'use client';

import { useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { Tool } from '@/data/tools';

type PercentageMode='part'|'of'|'change'|'difference';

function MetricCard({label,value}:{label:string;value:string|number}){
  return <div className="metricCard"><span>{label}</span><strong>{value}</strong></div>;
}

function PercentageCalculator(){
  const [mode,setMode]=useState<PercentageMode>('part');
  const [a,setA]=useState(42);
  const [b,setB]=useState(60);

  const result=useMemo(()=>{
    if(mode==='part'){
      if(b===0)return {value:'Undefined',label:'Result',formula:'Total cannot be zero.'};
      return {value:`${((a/b)*100).toFixed(2)}%`,label:'Result',formula:`(${a} ÷ ${b}) × 100`};
    }
    if(mode==='of')return {value:(b*(a/100)).toFixed(2),label:'Result',formula:`${a}% × ${b}`};
    if(mode==='change'){
      if(a===0)return {value:'Undefined',label:'Change',formula:'The starting value cannot be zero.'};
      const pct=((b-a)/Math.abs(a))*100;
      return {value:`${pct>=0?'+':''}${pct.toFixed(2)}%`,label:pct>=0?'Increase':'Decrease',formula:`((${b} − ${a}) ÷ |${a}|) × 100`};
    }
    const avg=(Math.abs(a)+Math.abs(b))/2;
    if(avg===0)return {value:'0.00%',label:'Difference',formula:'Both values are zero.'};
    return {value:`${(Math.abs(a-b)/avg*100).toFixed(2)}%`,label:'Difference',formula:`|${a} − ${b}| ÷ average × 100`};
  },[a,b,mode]);

  const labels:Record<PercentageMode,[string,string]>={
    part:['Value','Total'],
    of:['Percent (%)','Number'],
    change:['Starting value','New value'],
    difference:['First value','Second value']
  };

  return <div className="toolUi">
    <div className="calcModeTabs" role="tablist" aria-label="Percentage calculation mode">
      <button className={mode==='part'?'active':''} onClick={()=>setMode('part')}>X is what % of Y?</button>
      <button className={mode==='of'?'active':''} onClick={()=>setMode('of')}>What is X% of Y?</button>
      <button className={mode==='change'?'active':''} onClick={()=>setMode('change')}>Increase / decrease</button>
      <button className={mode==='difference'?'active':''} onClick={()=>setMode('difference')}>Percentage difference</button>
    </div>
    <div className="fieldGrid calculatorTwoFields">
      <label>{labels[mode][0]}<input type="number" value={a} onChange={e=>setA(+e.target.value)}/></label>
      <label>{labels[mode][1]}<input type="number" value={b} onChange={e=>setB(+e.target.value)}/></label>
    </div>
    <div className="metricGrid compactMetrics"><MetricCard label={result.label} value={result.value}/></div>
    <div className="formulaNote"><span>Formula</span><code>{result.formula}</code></div>
  </div>;
}

export function PercentageExperience({tool}:{tool:Tool}){
  return <section className={`toolExperience accent-${tool.accent}`}>
    <div className="experienceTop"><div><span className="eyebrow">TOOLMERA / {tool.categoryLabel.toUpperCase()}</span><div className="experienceTitle">{tool.name}</div></div><span className="privatePill"><ShieldCheck size={15}/> Browser-first processing</span></div>
    <PercentageCalculator/>
  </section>;
}
