'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Download, ShieldCheck } from 'lucide-react';
import type { Tool } from '@/data/tools';

function downloadTextFile(name:string,text:string,type='text/plain'){
  const blob=new Blob([text],{type});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=name;a.click();
  window.setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

async function copyPlainText(value:string){
  await navigator.clipboard.writeText(value);
}

function createUuidV4(){
  if(typeof crypto.randomUUID==='function')return crypto.randomUUID();
  const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);
  bytes[6]=(bytes[6]&0x0f)|0x40;bytes[8]=(bytes[8]&0x3f)|0x80;
  const hex=[...bytes].map(v=>v.toString(16).padStart(2,'0'));
  return hex.slice(0,4).join('')+'-'+hex.slice(4,6).join('')+'-'+hex.slice(6,8).join('')+'-'+hex.slice(8,10).join('')+'-'+hex.slice(10).join('');
}

function UuidGenerator(){
  const [quantity,setQuantity]=useState(5);
  const [upper,setUpper]=useState(false);
  const [hyphens,setHyphens]=useState(true);
  const [wrap,setWrap]=useState<'none'|'quotes'|'braces'|'json'>('none');
  const [values,setValues]=useState<string[]>([]);
  const [copied,setCopied]=useState(false);
  function generate(){const qty=Math.max(1,Math.min(1000,Math.round(quantity||1)));setQuantity(qty);setValues(Array.from({length:qty},()=>createUuidV4()));setCopied(false)}
  useEffect(()=>{generate()},[]);
  const formatted=useMemo(()=>values.map(raw=>{let value=upper?raw.toUpperCase():raw.toLowerCase();if(!hyphens)value=value.replace(/-/g,'');if(wrap==='quotes')value='"'+value+'"';if(wrap==='braces')value='{'+value+'}';return value}),[values,upper,hyphens,wrap]);
  const output=wrap==='json'?JSON.stringify(formatted.map(v=>v.replace(/^"|"$/g,'')),null,2):formatted.join('\n');
  async function copyAll(){if(!output)return;await copyPlainText(output);setCopied(true);window.setTimeout(()=>setCopied(false),1400)}
  return <div className="toolUi">
    <div className="fieldGrid generatorFields"><label>Quantity<input type="number" min="1" max="1000" value={quantity} onChange={e=>setQuantity(+e.target.value)}/></label><label>Letter case<select value={upper?'upper':'lower'} onChange={e=>setUpper(e.target.value==='upper')}><option value="lower">Lowercase</option><option value="upper">Uppercase</option></select></label><label>Wrapping<select value={wrap} onChange={e=>setWrap(e.target.value as typeof wrap)}><option value="none">None</option><option value="quotes">Quotes</option><option value="braces">Braces</option><option value="json">JSON array</option></select></label></div>
    <label className="checkControl"><input type="checkbox" checked={hyphens} onChange={e=>setHyphens(e.target.checked)}/><span>Include standard UUID hyphens</span></label>
    <div className="buttonRow"><button className="primaryButton" onClick={generate}>Generate new UUIDs</button><button className="secondaryButton" onClick={copyAll} disabled={!output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy all'}</button><button className="secondaryButton" onClick={()=>downloadTextFile('toolmera-uuids.txt',output)} disabled={!output}><Download size={15}/> Download TXT</button></div>
    <textarea className="textArea output codeArea uuidOutput" readOnly value={output}/>
    <div className="toolNote"><ShieldCheck size={15}/><span>UUID v4 values are generated locally with the browser cryptographic API. Toolmera does not provide timestamp-based UUID versions on this page.</span></div>
  </div>;
}

const secureRandom53=()=>{const a=new Uint32Array(2);crypto.getRandomValues(a);return (a[0]&0x1fffff)*4294967296+a[1]};
function secureRandomInt(min:number,max:number){if(!Number.isSafeInteger(min)||!Number.isSafeInteger(max)||max<min)throw new Error('Use safe integer range values.');const span=max-min+1;if(!Number.isSafeInteger(span)||span<1)throw new Error('The selected integer range is too large.');const universe=9007199254740992;const limit=Math.floor(universe/span)*span;let x=secureRandom53();while(x>=limit)x=secureRandom53();return min+(x%span)}
function secureShuffle<T>(items:T[]){const out=[...items];for(let i=out.length-1;i>0;i--){const j=secureRandomInt(0,i);[out[i],out[j]]=[out[j],out[i]]}return out}

function PasswordGenerator(){
  const [length,setLength]=useState(20),[upper,setUpper]=useState(true),[lower,setLower]=useState(true),[digits,setDigits]=useState(true),[symbols,setSymbols]=useState(true),[ambiguous,setAmbiguous]=useState(true),[password,setPassword]=useState(''),[error,setError]=useState(''),[copied,setCopied]=useState(false);
  function generate(){const sets=[upper?'ABCDEFGHIJKLMNOPQRSTUVWXYZ':'',lower?'abcdefghijklmnopqrstuvwxyz':'',digits?'0123456789':'',symbols?'!@#$%^&*()_+-=[]{}|;:,.<>?':''].filter(Boolean);if(!sets.length){setError('Select at least one character type.');setPassword('');return}const target=Math.max(8,Math.min(128,Math.round(length||20)));setLength(target);const banned=ambiguous?'Il1O0':'';const cleanSets=sets.map(set=>[...set].filter(ch=>!banned.includes(ch)).join('')).filter(Boolean);const pool=cleanSets.join('');if(!pool){setError('The selected rules leave no usable characters.');return}const chars:string[]=[];cleanSets.forEach(set=>chars.push(set[secureRandomInt(0,set.length-1)]));while(chars.length<target)chars.push(pool[secureRandomInt(0,pool.length-1)]);setPassword(secureShuffle(chars).join(''));setError('');setCopied(false)}
  useEffect(()=>{generate()},[]);
  const poolSize=useMemo(()=>{let pool=(upper?'ABCDEFGHIJKLMNOPQRSTUVWXYZ':'')+(lower?'abcdefghijklmnopqrstuvwxyz':'')+(digits?'0123456789':'')+(symbols?'!@#$%^&*()_+-=[]{}|;:,.<>?':'');if(ambiguous)pool=[...pool].filter(ch=>!'Il1O0'.includes(ch)).join('');return new Set(pool).size},[upper,lower,digits,symbols,ambiguous]);
  const entropy=poolSize>1?length*Math.log2(poolSize):0;const strength=entropy>=100?'Very strong':entropy>=70?'Strong':entropy>=50?'Moderate':'Limited';
  async function copyPassword(){if(!password)return;await copyPlainText(password);setCopied(true);window.setTimeout(()=>setCopied(false),1400)}
  return <div className="toolUi">
    <div className="passwordOutput"><code>{password||'—'}</code><button className="copyButton inlineCopy" onClick={copyPassword} disabled={!password}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy'}</button></div>
    <div className="entropyBar"><span>Character-space estimate</span><strong>{entropy.toFixed(0)} bits · {strength}</strong></div>
    <div className="controlRow"><label>Password length <b>{length}</b></label><input type="range" min="8" max="128" value={length} onChange={e=>setLength(+e.target.value)}/><input className="smallNumberInput" type="number" min="8" max="128" value={length} onChange={e=>setLength(+e.target.value)}/></div>
    <div className="toggleGrid"><label><input type="checkbox" checked={upper} onChange={e=>setUpper(e.target.checked)}/> Uppercase A–Z</label><label><input type="checkbox" checked={lower} onChange={e=>setLower(e.target.checked)}/> Lowercase a–z</label><label><input type="checkbox" checked={digits} onChange={e=>setDigits(e.target.checked)}/> Digits 0–9</label><label><input type="checkbox" checked={symbols} onChange={e=>setSymbols(e.target.checked)}/> Symbols</label><label><input type="checkbox" checked={ambiguous} onChange={e=>setAmbiguous(e.target.checked)}/> Exclude I, l, 1, O, 0</label></div>
    <button className="primaryButton wide" onClick={generate}>Regenerate password</button>{error&&<div className="toolError">{error}</div>}
    <div className="toolNote"><ShieldCheck size={15}/><span>Random choices use the browser Web Crypto API. The entropy number is an estimate of the selected character search space, not a guarantee about account security.</span></div>
  </div>;
}

type RandomMode='integer'|'decimal';
function RandomNumberGenerator(){
  const [min,setMin]=useState(1),[max,setMax]=useState(100),[quantity,setQuantity]=useState(1),[mode,setMode]=useState<RandomMode>('integer'),[precision,setPrecision]=useState(2),[unique,setUnique]=useState(false),[sort,setSort]=useState<'none'|'asc'|'desc'>('none'),[results,setResults]=useState<number[]>([]),[error,setError]=useState(''),[copied,setCopied]=useState(false);
  function generate(){try{const qty=Math.max(1,Math.min(10000,Math.round(quantity||1)));setQuantity(qty);const p=mode==='integer'?0:Math.max(0,Math.min(6,Math.round(precision)));const scale=10**p;const lo=mode==='integer'?Math.ceil(min):Math.ceil(min*scale);const hi=mode==='integer'?Math.floor(max):Math.floor(max*scale);if(!Number.isSafeInteger(lo)||!Number.isSafeInteger(hi)||hi<lo)throw new Error('Choose a valid range that can be represented safely.');const slots=hi-lo+1;if(unique&&qty>slots)throw new Error('Quantity exceeds the available unique values in this range.');const ticks:number[]=[];if(unique&&slots<=100000){const pool=Array.from({length:slots},(_,i)=>lo+i);for(let i=0;i<qty;i++){const j=secureRandomInt(i,pool.length-1);[pool[i],pool[j]]=[pool[j],pool[i]];ticks.push(pool[i])}}else{const seen=new Set<number>();while(ticks.length<qty){const value=secureRandomInt(lo,hi);if(!unique||!seen.has(value)){seen.add(value);ticks.push(value)}}}let out=ticks.map(v=>v/scale);if(sort==='asc')out=out.sort((a,b)=>a-b);if(sort==='desc')out=out.sort((a,b)=>b-a);setResults(out);setError('');setCopied(false)}catch(e){setResults([]);setError(e instanceof Error?e.message:'Could not generate this range.')}}
  useEffect(()=>{generate()},[]);
  const output=results.map(v=>mode==='decimal'?v.toFixed(precision):String(v)).join('\n');
  async function copyResults(){if(!output)return;await copyPlainText(output);setCopied(true);window.setTimeout(()=>setCopied(false),1400)}
  return <div className="toolUi">
    <div className="calcModeTabs unitTabs"><button className={mode==='integer'?'active':''} onClick={()=>setMode('integer')}>Integers</button><button className={mode==='decimal'?'active':''} onClick={()=>setMode('decimal')}>Decimals</button></div>
    <div className="fieldGrid randomFields"><label>Minimum<input type="number" value={min} onChange={e=>setMin(+e.target.value)}/></label><label>Maximum<input type="number" value={max} onChange={e=>setMax(+e.target.value)}/></label><label>Quantity<input type="number" min="1" max="10000" value={quantity} onChange={e=>setQuantity(+e.target.value)}/></label>{mode==='decimal'&&<label>Decimal places<select value={precision} onChange={e=>setPrecision(+e.target.value)}>{[1,2,3,4,5,6].map(v=><option key={v} value={v}>{v}</option>)}</select></label>}<label>Sort<select value={sort} onChange={e=>setSort(e.target.value as typeof sort)}><option value="none">Random order</option><option value="asc">Ascending</option><option value="desc">Descending</option></select></label></div>
    <label className="checkControl"><input type="checkbox" checked={unique} onChange={e=>setUnique(e.target.checked)}/><span>Unique values only</span></label>
    <div className="buttonRow"><button className="primaryButton" onClick={generate}>Generate</button><button className="secondaryButton" onClick={copyResults} disabled={!output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy results'}</button></div>
    {results.length===1?<div className="singleRandomResult">{mode==='decimal'?results[0].toFixed(precision):results[0]}</div>:<textarea className="textArea output codeArea randomOutput" readOnly value={output}/>} {error&&<div className="toolError">{error}</div>}
    <div className="toolNote"><ShieldCheck size={15}/><span>Bounded values use Web Crypto output with rejection sampling to avoid simple modulo bias. This utility is not a certified lottery or regulated drawing system.</span></div>
  </div>;
}

export function GeneratorsExperience({tool}:{tool:Tool}){
  let ui=null;
  if(tool.kind==='uuid-generator')ui=<UuidGenerator/>;
  else if(tool.kind==='password-generator')ui=<PasswordGenerator/>;
  else if(tool.kind==='random-number-generator')ui=<RandomNumberGenerator/>;
  return <section className={`toolExperience accent-${tool.accent}`}><div className="experienceTop"><div><span className="eyebrow">TOOLMERA / {tool.categoryLabel.toUpperCase()}</span><div className="experienceTitle">{tool.name}</div></div><span className="privatePill"><ShieldCheck size={15}/> Browser-first processing</span></div>{ui}</section>;
}
