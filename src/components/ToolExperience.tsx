'use client';

import { DragEvent, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Download, FileUp, RefreshCw, ShieldCheck, X } from 'lucide-react';
import type { Tool } from '@/data/tools';

type Result = { url: string; name: string; before?: number; after?: number };
const money = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0);

function DownloadResult({ result }: { result: Result }) {
  return <div className="resultBox"><div><strong>Ready</strong>{result.before && result.after ? <small>{(result.before/1024).toFixed(0)} KB → {(result.after/1024).toFixed(0)} KB</small> : <small>Your file is ready to download.</small>}</div><a className="primaryButton" href={result.url} download={result.name}><Download size={17}/> Download</a></div>;
}

function FileDrop({ accept, multiple = false, onChange, label = 'Choose file' }: { accept: string; multiple?: boolean; onChange: (files: File[]) => void; label?: string }) {
  function drop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) onChange(multiple ? files : files.slice(0,1));
  }
  return <label className="fileDrop" onDragOver={(e)=>e.preventDefault()} onDrop={drop}><FileUp size={28}/><strong>{label}</strong><span>or drag files here</span><input type="file" accept={accept} multiple={multiple} onChange={(e) => onChange(Array.from(e.target.files || []))}/></label>;
}

function FileQueue({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= files.length) return;
    const next = [...files];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  function remove(index: number) {
    onChange(files.filter((_,i)=>i!==index));
  }
  return <div className="fileQueue">
    {files.map((file,index)=><div className="fileQueueItem" key={`${file.name}-${file.size}-${index}`}>
      <span><b>{index + 1}</b><span><strong>{file.name}</strong><small>{Math.max(1,Math.round(file.size/1024))} KB</small></span></span>
      <div>
        <button type="button" aria-label="Move up" onClick={()=>move(index,-1)} disabled={index===0}><ChevronUp size={15}/></button>
        <button type="button" aria-label="Move down" onClick={()=>move(index,1)} disabled={index===files.length-1}><ChevronDown size={15}/></button>
        <button type="button" aria-label="Remove file" onClick={()=>remove(index)}><X size={15}/></button>
      </div>
    </div>)}
  </div>;
}

async function imageToCanvas(file: File) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width; canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d')!;
  return { bitmap, canvas, ctx };
}

function ImageConvert({ tool }: { tool: Tool }) {
  const [quality, setQuality] = useState(82);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [background, setBackground] = useState('#ffffff');

  async function run(input?: File) {
    const source = input || file;
    if (!source) return;
    setBusy(true);
    setResult(null);
    const { bitmap, canvas, ctx } = await imageToCanvas(source);
    if (tool.outputFormat === 'image/jpeg') {
      ctx.fillStyle = background;
      ctx.fillRect(0,0,canvas.width,canvas.height);
    }
    ctx.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Conversion failed')), tool.outputFormat, quality/100)
    );
    const ext = tool.outputFormat?.split('/')[1].replace('jpeg','jpg') || 'image';
    setResult({ url: URL.createObjectURL(blob), name: `${source.name.replace(/\.[^.]+$/, '')}.${ext}`, before: source.size, after: blob.size });
    setBusy(false);
  }

  async function choose(files: File[]) {
    if (!files[0]) return;
    setFile(files[0]);
    await run(files[0]);
  }

  return <div className="toolUi">
    <FileDrop accept={tool.inputFormat || 'image/*'} onChange={choose} label={busy ? 'Converting…' : `Choose ${tool.name.split(' to ')[0]} file`}/>
    <div className="controlRow">
      <label>Quality <b>{quality}%</b></label>
      <input type="range" min="35" max="100" value={quality} onChange={(e)=>setQuality(+e.target.value)}/>
      {tool.outputFormat === 'image/jpeg' && <label className="colorControl">Background <input type="color" value={background} onChange={(e)=>setBackground(e.target.value)}/><b>{background.toUpperCase()}</b></label>}
      {file && <button className="secondaryButton" onClick={()=>run()} disabled={busy}><RefreshCw size={15}/> {busy ? 'Converting…' : 'Reconvert'}</button>}
    </div>
    {result && <DownloadResult result={result}/>}
  </div>;
}

function ImageCompress() {
  const [quality, setQuality] = useState(75);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function run(next?: File) {
    const input = next || file;
    if (!input) return;
    setFile(input);
    const { bitmap, canvas, ctx } = await imageToCanvas(input);
    ctx.drawImage(bitmap,0,0);
    const type = input.type === 'image/png' ? 'image/webp' : (input.type || 'image/jpeg');
    const blob = await new Promise<Blob>((resolve,reject)=>canvas.toBlob((b)=>b?resolve(b):reject(),type,quality/100));
    setResult({url:URL.createObjectURL(blob),name:`${input.name.replace(/\.[^.]+$/,'')}-compressed.${type.split('/')[1].replace('jpeg','jpg')}`,before:input.size,after:blob.size});
  }

  return <div className="toolUi">
    <FileDrop accept="image/png,image/jpeg,image/webp" onChange={(f)=>f[0]&&run(f[0])}/>
    {file?.type === 'image/png' && <div className="toolNote"><ShieldCheck size={15}/><span>PNG input is exported as WebP in the current compressor for stronger browser-side size reduction.</span></div>}
    <div className="controlRow"><label>Compression quality <b>{quality}%</b></label><input type="range" min="30" max="95" value={quality} onChange={(e)=>setQuality(+e.target.value)}/><button className="secondaryButton" onClick={()=>run()}><RefreshCw size={15}/> Recompress</button></div>
    {result&&<DownloadResult result={result}/>}
  </div>;
}

function ImageResize() {
  const [file,setFile]=useState<File|null>(null); const [width,setWidth]=useState(1200); const [height,setHeight]=useState(800); const [ratio,setRatio]=useState(1.5); const [result,setResult]=useState<Result|null>(null);
  async function select(files:File[]){ if(!files[0])return; const f=files[0]; const b=await createImageBitmap(f); setFile(f); setWidth(b.width); setHeight(b.height); setRatio(b.width/b.height); }
  async function resize(){ if(!file)return; const b=await createImageBitmap(file); const c=document.createElement('canvas');c.width=width;c.height=height; c.getContext('2d')!.drawImage(b,0,0,width,height); const blob=await new Promise<Blob>((r,j)=>c.toBlob(x=>x?r(x):j(),file.type||'image/png',0.9)); setResult({url:URL.createObjectURL(blob),name:`${file.name.replace(/\.[^.]+$/,'')}-${width}x${height}.${(file.type||'image/png').split('/')[1].replace('jpeg','jpg')}`,before:file.size,after:blob.size}); }
  return <div className="toolUi"><FileDrop accept="image/*" onChange={select}/>{file&&<><div className="fieldGrid"><label>Width<input type="number" value={width} onChange={(e)=>{const w=+e.target.value;setWidth(w);setHeight(Math.round(w/ratio));}}/></label><label>Height<input type="number" value={height} onChange={(e)=>{const h=+e.target.value;setHeight(h);setWidth(Math.round(h*ratio));}}/></label></div><button className="primaryButton wide" onClick={resize}>Resize image</button></>}{result&&<DownloadResult result={result}/>}</div>;
}

function PdfTool({ tool }: { tool: Tool }) {
  const [files,setFiles]=useState<File[]>([]);
  const [result,setResult]=useState<Result|null>(null);
  const [range,setRange]=useState('1-1');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  function selectFiles(next: File[]) {
    setFiles(next);
    setResult(null);
    setError('');
  }

  async function run(){
    if(!files.length)return;
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const out=await PDFDocument.create();

      if(tool.kind==='pdf-merge'){
        for(const file of files){
          const src=await PDFDocument.load(await file.arrayBuffer());
          const pages=await out.copyPages(src,src.getPageIndices());
          pages.forEach(p=>out.addPage(p));
        }
      }

      if(tool.kind==='pdf-split'){
        const src=await PDFDocument.load(await files[0].arrayBuffer());
        const match=range.trim().match(/^(\d+)\s*-\s*(\d+)$/);
        if(!match) throw new Error('Use one page range, for example 4-9.');
        const a=Math.max(1,parseInt(match[1]));
        const b=Math.max(1,parseInt(match[2]));
        const start=Math.min(a,b)-1;
        const end=Math.max(a,b)-1;
        const indexes=src.getPageIndices().filter(i=>i>=start&&i<=end);
        if(!indexes.length) throw new Error(`That range is outside this PDF. It has ${src.getPageCount()} pages.`);
        const pages=await out.copyPages(src,indexes);
        pages.forEach(p=>out.addPage(p));
      }

      if(tool.kind==='images-to-pdf'){
        for(const file of files){
          const bytes=await file.arrayBuffer();
          const img=file.type==='image/png'?await out.embedPng(bytes):await out.embedJpg(bytes);
          const page=out.addPage([img.width,img.height]);
          page.drawImage(img,{x:0,y:0,width:img.width,height:img.height});
        }
      }

      const bytes=await out.save();
      const blob=new Blob([bytes as BlobPart],{type:'application/pdf'});
      setResult({url:URL.createObjectURL(blob),name:`toolmera-${tool.slug}.pdf`,after:blob.size});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not process this file.');
    } finally {
      setBusy(false);
    }
  }

  const accept=tool.kind==='images-to-pdf'?(tool.inputFormat||'image/*'):'application/pdf';
  const reorderable=tool.kind==='pdf-merge'||tool.kind==='images-to-pdf';

  return <div className="toolUi">
    <FileDrop accept={accept} multiple={tool.kind!=='pdf-split'} onChange={selectFiles} label={files.length?`${files.length} file${files.length>1?'s':''} selected`:'Choose files'}/>
    {reorderable&&files.length>0&&<>
      <div className="queueHead"><span>Output order</span><small>Use the arrows to arrange files before creating the PDF.</small></div>
      <FileQueue files={files} onChange={selectFiles}/>
    </>}
    {tool.kind==='pdf-split'&&files.length>0&&<>
      <label className="singleField">Page range<input value={range} onChange={e=>setRange(e.target.value)} placeholder="4-9"/></label>
      <div className="toolNote"><ShieldCheck size={15}/><span>One continuous range per export, for example <b>4-9</b>. The source PDF is never modified.</span></div>
    </>}
    {tool.kind==='images-to-pdf'&&files.length>0&&<div className="toolNote"><ShieldCheck size={15}/><span>Each image becomes one PDF page sized to that image&apos;s own dimensions.</span></div>}
    {error&&<div className="toolError">{error}</div>}
    <button className="primaryButton wide" onClick={run} disabled={!files.length||busy}>{busy?'Processing…':tool.name}</button>
    {result&&<DownloadResult result={result}/>}
  </div>;
}

function MetricCard({ label, value, suffix='' }: {label:string;value:string|number;suffix?:string}){return <div className="metricCard"><span>{label}</span><strong>{value}{suffix}</strong></div>}

function CoreCalculator({ kind }: { kind: Tool['kind'] }) {
  const [a,setA]=useState(kind==='emi'?500000:kind==='sip'?10000:kind==='fd'?100000:kind==='cagr'?100000:kind==='gst'?1000:25);
  const [b,setB]=useState(kind==='emi'?10:kind==='sip'?12:kind==='fd'?7:kind==='cagr'?200000:kind==='gst'?18:100);
  const [c,setC]=useState(kind==='emi'?5:kind==='sip'?10:kind==='fd'?3:kind==='cagr'?5:0);
  const values=useMemo(()=>{
    if(kind==='emi'){const r=b/12/100,n=c*12,emi=r? a*r*(1+r)**n/((1+r)**n-1):a/n;return [{l:'Monthly EMI',v:\`₹\${money(emi)}\`},{l:'Total interest',v:\`₹\${money(emi*n-a)}\`},{l:'Total repayment',v:\`₹\${money(emi*n)}\`}]}
    if(kind==='sip'){const r=b/12/100,n=c*12,fv=r?a*((1+r)**n-1)/r*(1+r):a*n;return [{l:'Invested',v:\`₹\${money(a*n)}\`},{l:'Estimated returns',v:\`₹\${money(fv-a*n)}\`},{l:'Future value',v:\`₹\${money(fv)}\`}]}
    if(kind==='fd'){const fv=a*(1+b/100)**c;return [{l:'Maturity value',v:\`₹\${money(fv)}\`},{l:'Interest earned',v:\`₹\${money(fv-a)}\`}]}
    if(kind==='cagr'){const rate=a>0&&c>0?((b/a)**(1/c)-1)*100:0;return [{l:'CAGR',v:\`\${rate.toFixed(2)}%\`}]}
    if(kind==='gst'){const tax=a*b/100;return [{l:'GST amount',v:\`₹\${money(tax)}\`},{l:'Total incl. GST',v:\`₹\${money(a+tax)}\`},{l:'Base from inclusive',v:\`₹\${money(a/(1+b/100))}\`}]}
    return [];
  },[a,b,c,kind]);
  const labels:Record<string,[string,string,string?]>={
    emi:['Loan amount (₹)','Interest rate (%)','Tenure (years)'],
    sip:['Monthly SIP (₹)','Expected return (%)','Period (years)'],
    fd:['Deposit amount (₹)','Interest rate (%)','Term (years)'],
    cagr:['Beginning value','Ending value','Years'],
    gst:['Amount (₹)','GST rate (%)']
  };
  const lab=labels[kind]||['Value A','Value B','Value C'];
  return <div className="toolUi"><div className="fieldGrid"><label>{lab[0]}<input type="number" value={a} onChange={e=>setA(+e.target.value)}/></label><label>{lab[1]}<input type="number" value={b} onChange={e=>setB(+e.target.value)}/></label>{lab[2]&&<label>{lab[2]}<input type="number" value={c} onChange={e=>setC(+e.target.value)}/></label>}</div><div className="metricGrid">{values.map(v=><MetricCard key={v.l} label={v.l} value={v.v}/>)}</div></div>;
}

type DateParts = { y:number; m:number; d:number };

function parseDateParts(value:string):DateParts|null{
  const match=value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!match)return null;
  const y=+match[1],m=+match[2],d=+match[3];
  if(m<1||m>12||d<1||d>new Date(Date.UTC(y,m,0)).getUTCDate())return null;
  return {y,m,d};
}

function dateSerial(p:DateParts){return Math.floor(Date.UTC(p.y,p.m-1,p.d)/86400000)}
function isLeapYear(y:number){return y%4===0&&(y%100!==0||y%400===0)}
function anniversaryFor(start:DateParts,year:number):DateParts{
  if(start.m===2&&start.d===29&&!isLeapYear(year)) return {y:year,m:2,d:28};
  return {y:year,m:start.m,d:start.d};
}

function calendarAge(start:DateParts,end:DateParts){
  if(dateSerial(start)>dateSerial(end))return null;
  let years=end.y-start.y;
  let anchor=anniversaryFor(start,start.y+years);
  if(dateSerial(anchor)>dateSerial(end)){years--;anchor=anniversaryFor(start,start.y+years)}
  let months=(end.y-anchor.y)*12+(end.m-anchor.m);
  let days=end.d-anchor.d;
  if(days<0){
    months--;
    let pm=end.m-1,py=end.y;
    if(pm===0){pm=12;py--}
    days+=new Date(Date.UTC(py,pm,0)).getUTCDate();
  }
  if(months<0)months=0;
  return {years,months,days};
}

function localTodayValue(){
  const d=new Date();
  const pad=(v:number)=>String(v).padStart(2,'0');
  return \`\${d.getFullYear()}-\${pad(d.getMonth()+1)}-\${pad(d.getDate())}\`;
}

function AgeCalculator(){
  const [dob,setDob]=useState('1995-01-01');
  const [asOf,setAsOf]=useState(localTodayValue);
  const result=useMemo(()=>{
    const start=parseDateParts(dob),end=parseDateParts(asOf);
    if(!start||!end)return {error:'Enter valid dates.'} as const;
    const age=calendarAge(start,end);
    if(!age)return {error:'Date of birth must be on or before the comparison date.'} as const;
    const totalDays=dateSerial(end)-dateSerial(start);
    let next=anniversaryFor(start,end.y);
    if(dateSerial(next)<dateSerial(end))next=anniversaryFor(start,end.y+1);
    const birthdayDays=dateSerial(next)-dateSerial(end);
    return {age,totalDays,totalWeeks:Math.floor(totalDays/7),totalHours:totalDays*24,birthdayDays};
  },[dob,asOf]);

  return <div className="toolUi">
    <div className="fieldGrid ageFields">
      <label>Date of birth<input type="date" value={dob} onChange={e=>setDob(e.target.value)}/></label>
      <label>Age as of<input type="date" value={asOf} onChange={e=>setAsOf(e.target.value)}/></label>
    </div>
    {'error' in result?<div className="toolError">{result.error}</div>:<>
      <div className="metricGrid">
        <MetricCard label="Years" value={result.age.years}/>
        <MetricCard label="Months" value={result.age.months}/>
        <MetricCard label="Days" value={result.age.days}/>
        <MetricCard label="Total days" value={money(result.totalDays)}/>
      </div>
      <div className="metricGrid compactMetrics">
        <MetricCard label="Total weeks" value={money(result.totalWeeks)}/>
        <MetricCard label="Total hours" value={money(result.totalHours)}/>
        <MetricCard label="Next birthday" value={result.birthdayDays===0?'Today':\`\${money(result.birthdayDays)} days\`}/>
      </div>
      <div className="toolNote"><ShieldCheck size={15}/><span>Calendar-based calculation. For Feb 29 birthdays, Toolmera treats Feb 28 as the anniversary in non-leap years.</span></div>
    </>}
  </div>;
}

type PercentageMode='part'|'of'|'change'|'difference';

function PercentageCalculator(){
  const [mode,setMode]=useState<PercentageMode>('part');
  const [a,setA]=useState(42);
  const [b,setB]=useState(60);

  const result=useMemo(()=>{
    if(mode==='part'){
      if(b===0)return {value:'Undefined',label:'Result',formula:'Total cannot be zero.'};
      return {value:\`\${((a/b)*100).toFixed(2)}%\`,label:'Result',formula:\`(\${a} ÷ \${b}) × 100\`};
    }
    if(mode==='of'){
      return {value:(b*(a/100)).toFixed(2),label:'Result',formula:\`\${a}% × \${b}\`};
    }
    if(mode==='change'){
      if(a===0)return {value:'Undefined',label:'Change',formula:'The starting value cannot be zero.'};
      const pct=((b-a)/Math.abs(a))*100;
      return {value:\`\${pct>=0?'+':''}\${pct.toFixed(2)}%\`,label:pct>=0?'Increase':'Decrease',formula:\`((\${b} − \${a}) ÷ |\${a}|) × 100\`};
    }
    const avg=(Math.abs(a)+Math.abs(b))/2;
    if(avg===0)return {value:'0.00%',label:'Difference',formula:'Both values are zero.'};
    return {value:\`\${(Math.abs(a-b)/avg*100).toFixed(2)}%\`,label:'Difference',formula:\`|\${a} − \${b}| ÷ average × 100\`};
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

function BmiCalculator(){
  const [unit,setUnit]=useState<'metric'|'imperial'>('metric');
  const [weightKg,setWeightKg]=useState(70);
  const [heightCm,setHeightCm]=useState(175);
  const bmi=heightCm>0?weightKg/((heightCm/100)**2):0;
  const category=bmi<18.5?'Underweight':bmi<25?'Healthy weight':bmi<30?'Overweight':'Obesity';
  const obesityClass=bmi<30?'—':bmi<35?'Class 1':bmi<40?'Class 2':'Class 3';

  const weight=unit==='metric'?weightKg:weightKg*2.2046226218;
  const height=unit==='metric'?heightCm:heightCm/2.54;

  return <div className="toolUi">
    <div className="calcModeTabs unitTabs">
      <button className={unit==='metric'?'active':''} onClick={()=>setUnit('metric')}>Metric · kg / cm</button>
      <button className={unit==='imperial'?'active':''} onClick={()=>setUnit('imperial')}>Imperial · lb / in</button>
    </div>
    <div className="fieldGrid calculatorTwoFields">
      <label>{unit==='metric'?'Weight (kg)':'Weight (lb)'}<input type="number" min="0" step="0.1" value={Number(weight.toFixed(1))} onChange={e=>{const v=+e.target.value;setWeightKg(unit==='metric'?v:v/2.2046226218)}}/></label>
      <label>{unit==='metric'?'Height (cm)':'Height (in)'}<input type="number" min="0" step="0.1" value={Number(height.toFixed(1))} onChange={e=>{const v=+e.target.value;setHeightCm(unit==='metric'?v:v*2.54)}}/></label>
    </div>
    <div className="metricGrid compactMetrics">
      <MetricCard label="BMI" value={bmi>0?bmi.toFixed(1):'—'}/>
      <MetricCard label="Adult category" value={bmi>0?category:'—'}/>
      <MetricCard label="Obesity class" value={bmi>0?obesityClass:'—'}/>
    </div>
    <div className="toolNote healthNote"><ShieldCheck size={15}/><span>BMI is a general adult screening measure, not a diagnosis. Standard adult categories are not intended for children, teenagers or pregnancy and can be less informative for very muscular or older adults.</span></div>
  </div>;
}

const globalNumber=(n:number)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(Number.isFinite(n)?n:0);

function CompoundInterestCalculator(){
  const [principal,setPrincipal]=useState(10000);
  const [rate,setRate]=useState(6);
  const [years,setYears]=useState(10);
  const [frequency,setFrequency]=useState('monthly');
  const [monthlyContribution,setMonthlyContribution]=useState(0);

  const result=useMemo(()=>{
    const periods:Record<string,number>={annual:1,quarterly:4,monthly:12,daily:365};
    const n=periods[frequency]||12;
    const r=Math.max(0,rate)/100;
    const months=Math.max(0,Math.round(years*12));
    const annualFactor=(1+r/n)**n;
    const monthlyRate=annualFactor**(1/12)-1;
    let balance=Math.max(0,principal);
    const rows:{year:number;balance:number;contributions:number;interest:number}[]=[];
    for(let month=1;month<=months;month++){
      balance*=1+monthlyRate;
      balance+=Math.max(0,monthlyContribution);
      if(month%12===0||month===months){
        const contributions=Math.max(0,principal)+Math.max(0,monthlyContribution)*month;
        rows.push({year:month/12,balance,contributions,interest:balance-contributions});
      }
    }
    const contributions=Math.max(0,principal)+Math.max(0,monthlyContribution)*months;
    return {future:balance,contributions,interest:balance-contributions,rows};
  },[principal,rate,years,frequency,monthlyContribution]);

  return <div className="toolUi">
    <div className="fieldGrid compoundFields">
      <label>Starting amount<input type="number" min="0" value={principal} onChange={e=>setPrincipal(+e.target.value)}/></label>
      <label>Annual rate (%)<input type="number" min="0" step="0.1" value={rate} onChange={e=>setRate(+e.target.value)}/></label>
      <label>Years<input type="number" min="0" step="1" value={years} onChange={e=>setYears(+e.target.value)}/></label>
      <label>Compounding<select value={frequency} onChange={e=>setFrequency(e.target.value)}><option value="annual">Annually</option><option value="quarterly">Quarterly</option><option value="monthly">Monthly</option><option value="daily">Daily</option></select></label>
      <label>Monthly contribution<input type="number" min="0" value={monthlyContribution} onChange={e=>setMonthlyContribution(+e.target.value)}/></label>
    </div>
    <div className="metricGrid compactMetrics">
      <MetricCard label="Future value" value={globalNumber(result.future)}/>
      <MetricCard label="Total contributed" value={globalNumber(result.contributions)}/>
      <MetricCard label="Interest earned" value={globalNumber(result.interest)}/>
    </div>
    <div className="toolNote"><ShieldCheck size={15}/><span>Monthly contributions are modeled at the end of each month. The selected compounding frequency is converted to its equivalent monthly growth rate for contribution modeling.</span></div>
    {result.rows.length>0&&<div className="growthTableWrap"><table className="growthTable"><thead><tr><th>Year</th><th>Balance</th><th>Contributed</th><th>Interest</th></tr></thead><tbody>{result.rows.map(row=><tr key={row.year}><td>{Number(row.year.toFixed(2))}</td><td>{globalNumber(row.balance)}</td><td>{globalNumber(row.contributions)}</td><td>{globalNumber(row.interest)}</td></tr>)}</tbody></table></div>}
  </div>;
}

function UnitConverter({temperature=false}:{temperature?:boolean}){const [v,setV]=useState(1);const [from,setFrom]=useState(temperature?'c':'m');const [to,setTo]=useState(temperature?'f':'ft');const units=temperature?['c','f','k']:['m','km','cm','mm','ft','in','mi'];const result=useMemo(()=>{if(temperature){let c=from==='c'?v:from==='f'?(v-32)*5/9:v-273.15;return to==='c'?c:to==='f'?c*9/5+32:c+273.15}const meter:Record<string,number>={m:1,km:1000,cm:.01,mm:.001,ft:.3048,in:.0254,mi:1609.344};return v*meter[from]/meter[to]},[v,from,to,temperature]);return <div className="toolUi"><div className="fieldGrid"><label>Value<input type="number" value={v} onChange={e=>setV(+e.target.value)}/></label><label>From<select value={from} onChange={e=>setFrom(e.target.value)}>{units.map(u=><option key={u}>{u}</option>)}</select></label><label>To<select value={to} onChange={e=>setTo(e.target.value)}>{units.map(u=><option key={u}>{u}</option>)}</select></label></div><MetricCard label="Converted value" value={Number(result.toFixed(6)).toString()}/></div>}

function TextTool({kind}:{kind:Tool['kind']}){const [text,setText]=useState('');const [output,setOutput]=useState('');const stats={words:text.trim()?text.trim().split(/\s+/).length:0,chars:text.length,sentences:text?text.split(/[.!?]+/).filter(Boolean).length:0};function action(type:string){if(kind==='case-converter'){setOutput(type==='upper'?text.toUpperCase():type==='lower'?text.toLowerCase():text.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()))}if(kind==='json-formatter'){try{const obj=JSON.parse(text);setOutput(type==='minify'?JSON.stringify(obj):JSON.stringify(obj,null,2))}catch(e){setOutput(`Invalid JSON: ${(e as Error).message}`)}}if(kind==='base64'){try{setOutput(type==='encode'?btoa(unescape(encodeURIComponent(text))):decodeURIComponent(escape(atob(text))))}catch{setOutput('Invalid Base64 input')}}}
  return <div className="toolUi"><textarea className="textArea" value={text} onChange={e=>setText(e.target.value)} placeholder="Paste or type here…"/>{kind==='word-counter'?<div className="metricGrid"><MetricCard label="Words" value={stats.words}/><MetricCard label="Characters" value={stats.chars}/><MetricCard label="Sentences" value={stats.sentences}/><MetricCard label="Reading time" value={Math.max(1,Math.ceil(stats.words/220))} suffix=" min"/></div>:<><div className="buttonRow">{kind==='case-converter'&&<><button className="secondaryButton" onClick={()=>action('upper')}>UPPERCASE</button><button className="secondaryButton" onClick={()=>action('lower')}>lowercase</button><button className="secondaryButton" onClick={()=>action('title')}>Title Case</button></>}{kind==='json-formatter'&&<><button className="primaryButton" onClick={()=>action('format')}>Format JSON</button><button className="secondaryButton" onClick={()=>action('minify')}>Minify</button></>}{kind==='base64'&&<><button className="primaryButton" onClick={()=>action('encode')}>Encode</button><button className="secondaryButton" onClick={()=>action('decode')}>Decode</button></>}</div><textarea className="textArea output" readOnly value={output} placeholder="Result…"/></>}</div>}

export function ToolExperience({tool}:{tool:Tool}){
  let ui;
  if(tool.kind==='image-convert') ui=<ImageConvert tool={tool}/>; else if(tool.kind==='image-compress')ui=<ImageCompress/>; else if(tool.kind==='image-resize')ui=<ImageResize/>; else if(['pdf-merge','pdf-split','images-to-pdf'].includes(tool.kind))ui=<PdfTool tool={tool}/>; else if(tool.kind==='age')ui=<AgeCalculator/>; else if(tool.kind==='percentage')ui=<PercentageCalculator/>; else if(tool.kind==='bmi')ui=<BmiCalculator/>; else if(tool.kind==='interest')ui=<CompoundInterestCalculator/>; else if(['emi','sip','fd','cagr','gst'].includes(tool.kind))ui=<CoreCalculator kind={tool.kind}/>; else if(tool.kind==='unit-length')ui=<UnitConverter/>; else if(tool.kind==='unit-temperature')ui=<UnitConverter temperature/>; else ui=<TextTool kind={tool.kind}/>;
  return <section className={`toolExperience accent-${tool.accent}`}><div className="experienceTop"><div><span className="eyebrow">TOOLMERA / {tool.categoryLabel.toUpperCase()}</span><h2>{tool.name}</h2></div><span className="privatePill"><ShieldCheck size={15}/> Browser-first processing</span></div>{ui}</section>
}
