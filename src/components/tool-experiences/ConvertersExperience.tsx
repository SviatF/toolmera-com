'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, RefreshCw, ShieldCheck } from 'lucide-react';
import type { Tool } from '@/data/tools';

function MetricCard({label,value}:{label:string;value:string|number}){
  return <div className="metricCard"><span>{label}</span><strong>{value}</strong></div>;
}

async function copyPlainText(value:string){
  await navigator.clipboard.writeText(value);
}

type MatrixUnit={id:string;label:string;factor:number};
function formatConverted(value:number){
  if(!Number.isFinite(value))return '—';
  const abs=Math.abs(value);
  if(abs!==0&&(abs>=1e9||abs<1e-6))return value.toExponential(8).replace(/\.?0+e/,'e');
  return new Intl.NumberFormat('en-US',{maximumSignificantDigits:10}).format(value);
}

function MatrixUnitConverter({units,defaultFrom,defaultTo,note}:{units:MatrixUnit[];defaultFrom:string;defaultTo:string;note?:string}){
  const [value,setValue]=useState(1);
  const [from,setFrom]=useState(defaultFrom);
  const [to,setTo]=useState(defaultTo);
  const fromUnit=units.find(u=>u.id===from)||units[0],toUnit=units.find(u=>u.id===to)||units[1];
  const base=value*fromUnit.factor;
  const target=base/toUnit.factor;
  async function copyValue(v:number){await copyPlainText(formatConverted(v))}
  return <div className="toolUi">
    <div className="fieldGrid matrixFields">
      <label>Value<input type="number" value={value} onChange={e=>setValue(+e.target.value)}/></label>
      <label>From<select value={from} onChange={e=>setFrom(e.target.value)}>{units.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}</select></label>
      <label>To<select value={to} onChange={e=>setTo(e.target.value)}>{units.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}</select></label>
      <button className="secondaryButton matrixSwap" onClick={()=>{setFrom(to);setTo(from)}}><RefreshCw size={15}/> Swap units</button>
    </div>
    <div className="durationHero matrixHero"><strong>{formatConverted(target)}</strong><span>{toUnit.label}</span></div>
    <div className="conversionMatrix">{units.map(unit=>{const converted=base/unit.factor;return <div key={unit.id}><span>{unit.label}</span><strong>{formatConverted(converted)}</strong><button onClick={()=>copyValue(converted)} aria-label={'Copy '+unit.label}><Copy size={14}/></button></div>})}</div>
    {note&&<div className="toolNote"><ShieldCheck size={15}/><span>{note}</span></div>}
  </div>;
}

function WeightConverter(){
  const units:MatrixUnit[]=[
    {id:'kg',label:'Kilogram (kg)',factor:1},{id:'g',label:'Gram (g)',factor:.001},{id:'mg',label:'Milligram (mg)',factor:.000001},
    {id:'lb',label:'Pound (lb)',factor:.45359237},{id:'oz',label:'Ounce (oz)',factor:.028349523125},{id:'st',label:'Stone (st)',factor:6.35029318},{id:'t',label:'Metric tonne (t)',factor:1000},
  ];
  return <MatrixUnitConverter units={units} defaultFrom="kg" defaultTo="lb" note="Pound and ounce values use international avoirdupois definitions; precious-metal troy ounces are not included."/>;
}

function AreaConverter(){
  const units:MatrixUnit[]=[
    {id:'m2',label:'Square meter (m²)',factor:1},{id:'km2',label:'Square kilometer (km²)',factor:1000000},{id:'cm2',label:'Square centimeter (cm²)',factor:.0001},
    {id:'ft2',label:'Square foot (ft²)',factor:.09290304},{id:'yd2',label:'Square yard (yd²)',factor:.83612736},{id:'mi2',label:'Square mile (mi²)',factor:2589988.110336},
    {id:'acre',label:'Acre (ac)',factor:4046.8564224},{id:'ha',label:'Hectare (ha)',factor:10000},
  ];
  return <MatrixUnitConverter units={units} defaultFrom="acre" defaultTo="ft2" note="Area conversion uses international units. Linear lengths cannot be converted directly into area without a second dimension."/>;
}

function VolumeConverter(){
  const units:MatrixUnit[]=[
    {id:'ml',label:'Milliliter (mL)',factor:.001},{id:'l',label:'Liter (L)',factor:1},{id:'m3',label:'Cubic meter (m³)',factor:1000},
    {id:'us-tsp',label:'US teaspoon',factor:.00492892159375},{id:'us-tbsp',label:'US tablespoon',factor:.01478676478125},{id:'us-floz',label:'US fluid ounce',factor:.0295735295625},
    {id:'us-cup',label:'US customary cup',factor:.2365882365},{id:'us-pint',label:'US liquid pint',factor:.473176473},{id:'us-quart',label:'US liquid quart',factor:.946352946},{id:'us-gallon',label:'US liquid gallon',factor:3.785411784},
    {id:'imp-floz',label:'Imperial fluid ounce',factor:.0284130625},{id:'imp-pint',label:'Imperial pint',factor:.56826125},{id:'imp-quart',label:'Imperial quart',factor:1.1365225},{id:'imp-gallon',label:'Imperial gallon',factor:4.54609},
  ];
  return <MatrixUnitConverter units={units} defaultFrom="l" defaultTo="us-gallon" note="US customary and UK Imperial gallons, pints and fluid ounces are different units and are labeled separately here."/>;
}

function SpeedConverter(){
  const units:MatrixUnit[]=[
    {id:'ms',label:'Meter per second (m/s)',factor:1},{id:'kmh',label:'Kilometer per hour (km/h)',factor:1/3.6},{id:'mph',label:'Mile per hour (mph)',factor:.44704},{id:'fts',label:'Foot per second (ft/s)',factor:.3048},{id:'knot',label:'Knot (kn)',factor:.5144444444444445},
  ];
  return <MatrixUnitConverter units={units} defaultFrom="kmh" defaultTo="mph" note="Knots use the international nautical mile definition: 1 knot = 1 nautical mile per hour = 0.514444… m/s."/>;
}

function UnitConverter({temperature=false}:{temperature?:boolean}){
  const [v,setV]=useState(1);
  const [from,setFrom]=useState(temperature?'c':'m');
  const [to,setTo]=useState(temperature?'f':'ft');
  const lengthUnits=[
    {id:'m',label:'Meter (m)',factor:1},{id:'km',label:'Kilometer (km)',factor:1000},{id:'cm',label:'Centimeter (cm)',factor:.01},{id:'mm',label:'Millimeter (mm)',factor:.001},
    {id:'ft',label:'Foot (ft)',factor:.3048},{id:'in',label:'Inch (in)',factor:.0254},{id:'yd',label:'Yard (yd)',factor:.9144},{id:'mi',label:'Mile (mi)',factor:1609.344},
  ];
  const tempUnits=[{id:'c',label:'Celsius (°C)'},{id:'f',label:'Fahrenheit (°F)'},{id:'k',label:'Kelvin (K)'}];
  const units=temperature?tempUnits:lengthUnits;
  const calculation=useMemo(()=>{
    if(temperature){
      const celsius=from==='c'?v:from==='f'?(v-32)*5/9:v-273.15;
      if(celsius < -273.15-1e-10)return {invalid:true,value:0};
      const result=to==='c'?celsius:to==='f'?celsius*9/5+32:celsius+273.15;
      return {invalid:false,value:result};
    }
    const meter=Object.fromEntries(lengthUnits.map(u=>[u.id,u.factor])) as Record<string,number>;
    return {invalid:false,value:v*meter[from]/meter[to]};
  },[v,from,to,temperature]);
  const quickLength=[{label:'in → cm',from:'in',to:'cm'},{label:'ft → m',from:'ft',to:'m'},{label:'mi → km',from:'mi',to:'km'},{label:'yd → m',from:'yd',to:'m'}];
  const quickTemp=[{label:'Freezing',value:0,from:'c',to:'f'},{label:'Body 37°C',value:37,from:'c',to:'f'},{label:'Boiling',value:100,from:'c',to:'f'},{label:'−40°',value:-40,from:'c',to:'f'}];
  const quickItems:{label:string;from:string;to:string;value?:number}[]=temperature?quickTemp:quickLength;
  return <div className="toolUi">
    <div className="fieldGrid">
      <label>Value<input type="number" value={v} onChange={e=>setV(+e.target.value)}/></label>
      <label>From<select value={from} onChange={e=>setFrom(e.target.value)}>{units.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}</select></label>
      <label>To<select value={to} onChange={e=>setTo(e.target.value)}>{units.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}</select></label>
    </div>
    <div className="quickPills">{quickItems.map(item=><button key={item.label} onClick={()=>{if(item.value!==undefined)setV(item.value);setFrom(item.from);setTo(item.to)}}>{item.label}</button>)}</div>
    {calculation.invalid?<div className="toolError">That value is below absolute zero. Physical temperatures cannot be lower than 0 K (−273.15 °C / −459.67 °F).</div>:<MetricCard label="Converted value" value={Number(calculation.value.toFixed(6)).toString()}/>} 
  </div>;
}

function DataStorageConverter(){
  const [mode,setMode]=useState<'decimal'|'binary'>('decimal');
  const [value,setValue]=useState(1);
  const [from,setFrom]=useState('GB');
  const [to,setTo]=useState('MB');
  const [copied,setCopied]=useState('');
  const units=useMemo(()=>mode==='decimal'?[
    {id:'B',label:'Byte (B)',factor:1},{id:'KB',label:'Kilobyte (KB)',factor:1e3},{id:'MB',label:'Megabyte (MB)',factor:1e6},{id:'GB',label:'Gigabyte (GB)',factor:1e9},{id:'TB',label:'Terabyte (TB)',factor:1e12},{id:'PB',label:'Petabyte (PB)',factor:1e15},
  ]:[
    {id:'B',label:'Byte (B)',factor:1},{id:'KiB',label:'Kibibyte (KiB)',factor:1024},{id:'MiB',label:'Mebibyte (MiB)',factor:1024**2},{id:'GiB',label:'Gibibyte (GiB)',factor:1024**3},{id:'TiB',label:'Tebibyte (TiB)',factor:1024**4},{id:'PiB',label:'Pebibyte (PiB)',factor:1024**5},
  ],[mode]);
  useEffect(()=>{if(mode==='decimal'){setFrom('GB');setTo('MB')}else{setFrom('GiB');setTo('MiB')}},[mode]);
  const fromUnit=units.find(u=>u.id===from)||units[0],toUnit=units.find(u=>u.id===to)||units[1];
  const bytes=value*fromUnit.factor,converted=bytes/toUnit.factor;
  const format=(n:number)=>Number.isFinite(n)?new Intl.NumberFormat('en-US',{maximumSignificantDigits:12}).format(n):'—';
  async function copy(key:string,v:string){await copyPlainText(v);setCopied(key);window.setTimeout(()=>setCopied(''),1200)}
  return <div className="toolUi">
    <div className="calcModeTabs unitTabs"><button className={mode==='decimal'?'active':''} onClick={()=>setMode('decimal')}>Decimal SI (1000)</button><button className={mode==='binary'?'active':''} onClick={()=>setMode('binary')}>Binary IEC (1024)</button></div>
    <div className="fieldGrid matrixFields">
      <label>Value<input type="number" value={value} onChange={e=>setValue(+e.target.value)}/></label>
      <label>From<select value={from} onChange={e=>setFrom(e.target.value)}>{units.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}</select></label>
      <label>To<select value={to} onChange={e=>setTo(e.target.value)}>{units.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}</select></label>
      <button className="secondaryButton matrixSwap" onClick={()=>{setFrom(to);setTo(from)}}><RefreshCw size={15}/> Swap units</button>
    </div>
    <div className="durationHero matrixHero"><strong>{format(converted)}</strong><span>{toUnit.label}</span></div>
    <div className="conversionMatrix">{units.map(unit=>{const v=bytes/unit.factor;const out=format(v);return <div key={unit.id}><span>{unit.label}</span><strong>{out}</strong><button onClick={()=>copy(unit.id,out)}>{copied===unit.id?<Check size={14}/>:<Copy size={14}/>}</button></div>})}</div>
    <div className="toolNote"><ShieldCheck size={15}/><span>{mode==='decimal'?'Decimal storage uses powers of 1000: 1 GB = 1,000,000,000 bytes.':'Binary IEC storage uses powers of 1024: 1 GiB = 1,073,741,824 bytes.'}</span></div>
  </div>;
}

type Rgb={r:number;g:number;b:number};
type Hsl={h:number;s:number;l:number};
function clamp255(n:number){return Math.max(0,Math.min(255,Math.round(n)))}
function normalizeHue(n:number){const h=n%360;return h<0?h+360:h}
function hexToRgbValue(hex:string):Rgb|null{let v=hex.trim().replace(/^#/,'');if(/^[0-9a-f]{3}$/i.test(v))v=v.split('').map(ch=>ch+ch).join('');if(!/^[0-9a-f]{6}$/i.test(v))return null;return {r:parseInt(v.slice(0,2),16),g:parseInt(v.slice(2,4),16),b:parseInt(v.slice(4,6),16)}}
function rgbToHexValue({r,g,b}:Rgb){return '#'+[r,g,b].map(v=>clamp255(v).toString(16).padStart(2,'0')).join('').toUpperCase()}
function rgbToHslValue({r,g,b}:Rgb):Hsl{const rn=r/255,gn=g/255,bn=b/255,max=Math.max(rn,gn,bn),min=Math.min(rn,gn,bn);let h=0,s=0;const l=(max+min)/2,d=max-min;if(d){s=d/(1-Math.abs(2*l-1));if(max===rn)h=60*(((gn-bn)/d)%6);else if(max===gn)h=60*((bn-rn)/d+2);else h=60*((rn-gn)/d+4)}return {h:normalizeHue(h),s:s*100,l:l*100}}
function hslToRgbValue({h,s,l}:Hsl):Rgb{const hue=normalizeHue(h),sat=Math.max(0,Math.min(100,s))/100,light=Math.max(0,Math.min(100,l))/100;const ch=(1-Math.abs(2*light-1))*sat,x=ch*(1-Math.abs((hue/60)%2-1)),m=light-ch/2;let rp=0,gp=0,bp=0;if(hue<60){rp=ch;gp=x}else if(hue<120){rp=x;gp=ch}else if(hue<180){gp=ch;bp=x}else if(hue<240){gp=x;bp=ch}else if(hue<300){rp=x;bp=ch}else{rp=ch;bp=x}return {r:(rp+m)*255,g:(gp+m)*255,b:(bp+m)*255}}
function ColorConverter(){
  const [mode,setMode]=useState<'hex'|'rgb'|'hsl'>('hex');
  const [hex,setHex]=useState('#2F80FF');const [r,setR]=useState(47),[g,setG]=useState(128),[b,setB]=useState(255);const [h,setH]=useState(214),[s,setS]=useState(100),[l,setL]=useState(59);const [copied,setCopied]=useState('');
  function currentRgb():Rgb|null{if(mode==='hex')return hexToRgbValue(hex);if(mode==='rgb')return [r,g,b].some(v=>!Number.isFinite(v)||v<0||v>255)?null:{r,g,b};return !Number.isFinite(h)||!Number.isFinite(s)||!Number.isFinite(l)||s<0||s>100||l<0||l>100?null:hslToRgbValue({h,s,l})}
  const rgb=currentRgb();
  const outputs=rgb?(()=>{const hv=rgbToHexValue(rgb),hs=rgbToHslValue(rgb);return {hex:hv,rgb:'rgb('+clamp255(rgb.r)+', '+clamp255(rgb.g)+', '+clamp255(rgb.b)+')',hsl:'hsl('+Math.round(hs.h)+', '+Math.round(hs.s)+'%, '+Math.round(hs.l)+'%)'}})():null;
  function sync(next:'hex'|'rgb'|'hsl'){if(outputs&&rgb){const hs=rgbToHslValue(rgb);setHex(outputs.hex);setR(clamp255(rgb.r));setG(clamp255(rgb.g));setB(clamp255(rgb.b));setH(Math.round(hs.h));setS(Math.round(hs.s));setL(Math.round(hs.l))}setMode(next)}
  async function copy(key:string,value:string){await copyPlainText(value);setCopied(key);window.setTimeout(()=>setCopied(''),1200)}
  return <div className="toolUi">
    <div className="calcModeTabs unitTabs"><button className={mode==='hex'?'active':''} onClick={()=>sync('hex')}>HEX</button><button className={mode==='rgb'?'active':''} onClick={()=>sync('rgb')}>RGB</button><button className={mode==='hsl'?'active':''} onClick={()=>sync('hsl')}>HSL</button></div>
    {mode==='hex'&&<label className="singleField">HEX color<input value={hex} onChange={e=>setHex(e.target.value)} placeholder="#2F80FF"/></label>}
    {mode==='rgb'&&<div className="fieldGrid"><label>Red<input type="number" min="0" max="255" value={r} onChange={e=>setR(+e.target.value)}/></label><label>Green<input type="number" min="0" max="255" value={g} onChange={e=>setG(+e.target.value)}/></label><label>Blue<input type="number" min="0" max="255" value={b} onChange={e=>setB(+e.target.value)}/></label></div>}
    {mode==='hsl'&&<div className="fieldGrid"><label>Hue<input type="number" value={h} onChange={e=>setH(+e.target.value)}/></label><label>Saturation %<input type="number" min="0" max="100" value={s} onChange={e=>setS(+e.target.value)}/></label><label>Lightness %<input type="number" min="0" max="100" value={l} onChange={e=>setL(+e.target.value)}/></label></div>}
    {!outputs?<div className="toolError">Enter a valid {mode.toUpperCase()} color value.</div>:<><div className="colorPreviewLarge" style={{background:outputs.hex}}><span>{outputs.hex}</span></div><div className="conversionMatrix">{([['hex','HEX',outputs.hex],['rgb','RGB',outputs.rgb],['hsl','HSL',outputs.hsl]] as const).map(([key,label,value])=><div key={key}><span>{label}</span><strong>{value}</strong><button onClick={()=>copy(key,value)}>{copied===key?<Check size={14}/>:<Copy size={14}/>}</button></div>)}</div></>}
  </div>;
}

function availableTimeZones(){const intl=Intl as typeof Intl & {supportedValuesOf?:(key:'timeZone')=>string[]};if(intl.supportedValuesOf){try{return intl.supportedValuesOf('timeZone')}catch{}}return ['UTC','America/New_York','America/Los_Angeles','America/Chicago','Europe/London','Europe/Berlin','Europe/Warsaw','Europe/Kyiv','Asia/Kolkata','Asia/Dubai','Asia/Singapore','Asia/Tokyo','Australia/Sydney']}
function zoneParts(epoch:number,zone:string){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(epoch));const get=(type:string)=>Number(parts.find(p=>p.type===type)?.value||0);return {year:get('year'),month:get('month'),day:get('day'),hour:get('hour'),minute:get('minute'),second:get('second')}}
function wallTimeToEpoch(input:string,zone:string){const match=input.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);if(!match)return null;const targetUtc=Date.UTC(+match[1],+match[2]-1,+match[3],+match[4],+match[5],+(match[6]||0));let guess=targetUtc;for(let i=0;i<3;i++){const p=zoneParts(guess,zone);const represented=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);guess=targetUtc-(represented-guess)}return guess}
function TimeZoneConverter(){
  const zones=useMemo(()=>availableTimeZones(),[]);const browserZone=typeof Intl!=='undefined'?Intl.DateTimeFormat().resolvedOptions().timeZone:'UTC';const [from,setFrom]=useState(browserZone||'UTC');const [to,setTo]=useState(browserZone==='America/New_York'?'Europe/London':'America/New_York');const [input,setInput]=useState('');const [copied,setCopied]=useState('');
  useEffect(()=>{if(input)return;const d=new Date(),pad=(v:number)=>String(v).padStart(2,'0');setInput(d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes()))},[input]);
  const epoch=useMemo(()=>wallTimeToEpoch(input,from),[input,from]);const sourceText=epoch!==null?new Intl.DateTimeFormat('en-US',{timeZone:from,dateStyle:'full',timeStyle:'long'}).format(new Date(epoch)):'';const targetText=epoch!==null?new Intl.DateTimeFormat('en-US',{timeZone:to,dateStyle:'full',timeStyle:'long'}).format(new Date(epoch)):'';
  async function copy(key:string,value:string){await copyPlainText(value);setCopied(key);window.setTimeout(()=>setCopied(''),1200)}
  return <div className="toolUi"><label className="singleField">Date & time in source zone<input type="datetime-local" value={input} onChange={e=>setInput(e.target.value)}/></label><div className="fieldGrid timezoneFields"><label>From<select value={from} onChange={e=>setFrom(e.target.value)}>{zones.map(zone=><option key={zone} value={zone}>{zone}</option>)}</select></label><label>To<select value={to} onChange={e=>setTo(e.target.value)}>{zones.map(zone=><option key={zone} value={zone}>{zone}</option>)}</select></label><button className="secondaryButton matrixSwap" onClick={()=>{setFrom(to);setTo(from)}}><RefreshCw size={15}/> Swap zones</button></div>{epoch===null?<div className="toolError">Enter a valid date and time.</div>:<div className="timezoneResults"><div><span>Source · {from}</span><strong>{sourceText}</strong><button onClick={()=>copy('source',sourceText)}>{copied==='source'?<Check size={14}/>:<Copy size={14}/>}</button></div><div className="targetZoneResult"><span>Converted · {to}</span><strong>{targetText}</strong><button onClick={()=>copy('target',targetText)}>{copied==='target'?<Check size={14}/>:<Copy size={14}/>}</button></div><div><span>UTC / ISO 8601</span><strong>{new Date(epoch).toISOString()}</strong><button onClick={()=>copy('iso',new Date(epoch).toISOString())}>{copied==='iso'?<Check size={14}/>:<Copy size={14}/>}</button></div></div>}<div className="toolNote"><ShieldCheck size={15}/><span>Time-zone rules come from the browser&apos;s IANA/Intl data. Around daylight-saving transitions, some local clock times can be ambiguous or may not exist.</span></div></div>;
}

export function ConvertersExperience({tool}:{tool:Tool}){
  let ui=null;
  if(tool.kind==='unit-length')ui=<UnitConverter/>;
  else if(tool.kind==='unit-temperature')ui=<UnitConverter temperature/>;
  else if(tool.kind==='unit-weight')ui=<WeightConverter/>;
  else if(tool.kind==='unit-volume')ui=<VolumeConverter/>;
  else if(tool.kind==='unit-area')ui=<AreaConverter/>;
  else if(tool.kind==='unit-speed')ui=<SpeedConverter/>;
  else if(tool.kind==='data-storage')ui=<DataStorageConverter/>;
  else if(tool.kind==='color-converter')ui=<ColorConverter/>;
  else if(tool.kind==='time-zone')ui=<TimeZoneConverter/>;
  return <section className={`toolExperience accent-${tool.accent}`}><div className="experienceTop"><div><span className="eyebrow">TOOLMERA / {tool.categoryLabel.toUpperCase()}</span><div className="experienceTitle">{tool.name}</div></div><span className="privatePill"><ShieldCheck size={15}/> Browser-first processing</span></div>{ui}</section>;
}
