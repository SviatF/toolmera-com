'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { Download, FileUp, RefreshCw, ShieldCheck } from 'lucide-react';
import type { Tool } from '@/data/tools';

type Result = { url: string; name: string; before?: number; after?: number };
const money = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0);

function DownloadResult({ result }: { result: Result }) {
  return <div className="resultBox"><div><strong>Ready</strong>{result.before && result.after ? <small>{(result.before/1024).toFixed(0)} KB → {(result.after/1024).toFixed(0)} KB</small> : <small>Your file is ready to download.</small>}</div><a className="primaryButton" href={result.url} download={result.name}><Download size={17}/> Download</a></div>;
}

function FileDrop({ accept, multiple = false, onChange, label = 'Choose file' }: { accept: string; multiple?: boolean; onChange: (files: File[]) => void; label?: string }) {
  return <label className="fileDrop"><FileUp size={28}/><strong>{label}</strong><span>or drag files here</span><input type="file" accept={accept} multiple={multiple} onChange={(e) => onChange(Array.from(e.target.files || []))}/></label>;
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
  const [files,setFiles]=useState<File[]>([]); const [result,setResult]=useState<Result|null>(null); const [range,setRange]=useState('1-1'); const [busy,setBusy]=useState(false);
  async function run(){ if(!files.length)return; setBusy(true); const { PDFDocument } = await import('pdf-lib'); let out=await PDFDocument.create();
    if(tool.kind==='pdf-merge'){ for(const file of files){ const src=await PDFDocument.load(await file.arrayBuffer()); const pages=await out.copyPages(src,src.getPageIndices()); pages.forEach(p=>out.addPage(p)); } }
    if(tool.kind==='pdf-split'){ const src=await PDFDocument.load(await files[0].arrayBuffer()); const [a,b]=range.split('-').map(v=>Math.max(1,parseInt(v)||1)); const start=Math.min(a,b)-1,end=Math.max(a,b)-1; const indexes=src.getPageIndices().filter(i=>i>=start&&i<=end); const pages=await out.copyPages(src,indexes); pages.forEach(p=>out.addPage(p)); }
    if(tool.kind==='images-to-pdf'){ for(const file of files){ const bytes=await file.arrayBuffer(); const img=file.type==='image/png'?await out.embedPng(bytes):await out.embedJpg(bytes); const page=out.addPage([img.width,img.height]); page.drawImage(img,{x:0,y:0,width:img.width,height:img.height}); } }
    const bytes=await out.save(); const blob=new Blob([bytes as BlobPart],{type:'application/pdf'}); setResult({url:URL.createObjectURL(blob),name:`toolmera-${tool.slug}.pdf`,after:blob.size}); setBusy(false); }
  const accept=tool.kind==='images-to-pdf'?(tool.inputFormat||'image/*'):'application/pdf';
  return <div className="toolUi"><FileDrop accept={accept} multiple={tool.kind!=='pdf-split'} onChange={setFiles} label={files.length?`${files.length} file${files.length>1?'s':''} selected`:'Choose files'}/>{tool.kind==='pdf-split'&&<label className="singleField">Page range<input value={range} onChange={e=>setRange(e.target.value)} placeholder="1-3"/></label>}<button className="primaryButton wide" onClick={run} disabled={!files.length||busy}>{busy?'Processing…':tool.name}</button>{result&&<DownloadResult result={result}/>}</div>;
}

function MetricCard({ label, value, suffix='' }: {label:string;value:string|number;suffix?:string}){return <div className="metricCard"><span>{label}</span><strong>{value}{suffix}</strong></div>}

function Calculator({ kind }: { kind: Tool['kind'] }) {
  const [a,setA]=useState(kind==='emi'?500000:kind==='sip'?10000:kind==='fd'?100000:kind==='cagr'?100000:kind==='gst'?1000:kind==='bmi'?70:kind==='interest'?10000:25);
  const [b,setB]=useState(kind==='emi'?10:kind==='sip'?12:kind==='fd'?7:kind==='cagr'?200000:kind==='gst'?18:kind==='bmi'?175:kind==='interest'?8:100);
  const [c,setC]=useState(kind==='emi'?5:kind==='sip'?10:kind==='fd'?3:kind==='cagr'?5:kind==='interest'?10:0);
  const values=useMemo(()=>{
    if(kind==='percentage') return [{l:'Result',v:b?`${((a/b)*100).toFixed(2)}%`:'0%'}];
    if(kind==='bmi'){const bmi=a/((b/100)**2);return [{l:'BMI',v:bmi.toFixed(1)},{l:'Range',v:bmi<18.5?'Underweight':bmi<25?'Healthy':bmi<30?'Overweight':'High'}]}
    if(kind==='emi'){const r=b/12/100,n=c*12,emi=r? a*r*(1+r)**n/((1+r)**n-1):a/n;return [{l:'Monthly EMI',v:`₹${money(emi)}`},{l:'Total interest',v:`₹${money(emi*n-a)}`},{l:'Total repayment',v:`₹${money(emi*n)}`}]}
    if(kind==='sip'){const r=b/12/100,n=c*12,fv=r?a*((1+r)**n-1)/r*(1+r):a*n;return [{l:'Invested',v:`₹${money(a*n)}`},{l:'Estimated returns',v:`₹${money(fv-a*n)}`},{l:'Future value',v:`₹${money(fv)}`}]}
    if(kind==='fd'){const fv=a*(1+b/100)**c;return [{l:'Maturity value',v:`₹${money(fv)}`},{l:'Interest earned',v:`₹${money(fv-a)}`}]}
    if(kind==='cagr'){const rate=((b/a)**(1/c)-1)*100;return [{l:'CAGR',v:`${rate.toFixed(2)}%`}];}
    if(kind==='gst'){const tax=a*b/100;return [{l:'GST amount',v:`₹${money(tax)}`},{l:'Total incl. GST',v:`₹${money(a+tax)}`},{l:'Base from inclusive',v:`₹${money(a/(1+b/100))}`}]}
    if(kind==='interest'){const fv=a*(1+b/100)**c;return [{l:'Future value',v:money(fv)},{l:'Interest earned',v:money(fv-a)}]}
    return [];
  },[a,b,c,kind]);
  const labels:Record<string,[string,string,string?]>={percentage:['Value','Total'],bmi:['Weight (kg)','Height (cm)'],emi:['Loan amount (₹)','Interest rate (%)','Tenure (years)'],sip:['Monthly SIP (₹)','Expected return (%)','Period (years)'],fd:['Deposit amount (₹)','Interest rate (%)','Term (years)'],cagr:['Beginning value','Ending value','Years'],gst:['Amount (₹)','GST rate (%)'],interest:['Principal','Annual rate (%)','Years']}; const lab=labels[kind]||['Value A','Value B','Value C'];
  return <div className="toolUi"><div className="fieldGrid"><label>{lab[0]}<input type="number" value={a} onChange={e=>setA(+e.target.value)}/></label><label>{lab[1]}<input type="number" value={b} onChange={e=>setB(+e.target.value)}/></label>{lab[2]&&<label>{lab[2]}<input type="number" value={c} onChange={e=>setC(+e.target.value)}/></label>}</div><div className="metricGrid">{values.map(v=><MetricCard key={v.l} label={v.l} value={v.v}/>)}</div></div>;
}

function AgeCalculator(){const [dob,setDob]=useState('1995-01-01');const d=new Date(dob),now=new Date();let y=now.getFullYear()-d.getFullYear();let m=now.getMonth()-d.getMonth();let day=now.getDate()-d.getDate();if(day<0){m--;day+=30}if(m<0){y--;m+=12}const total=Math.max(0,Math.floor((now.getTime()-d.getTime())/86400000));return <div className="toolUi"><label className="singleField">Date of birth<input type="date" value={dob} onChange={e=>setDob(e.target.value)}/></label><div className="metricGrid"><MetricCard label="Years" value={y}/><MetricCard label="Months" value={m}/><MetricCard label="Days" value={day}/><MetricCard label="Total days" value={money(total)}/></div></div>}

function UnitConverter({temperature=false}:{temperature?:boolean}){const [v,setV]=useState(1);const [from,setFrom]=useState(temperature?'c':'m');const [to,setTo]=useState(temperature?'f':'ft');const units=temperature?['c','f','k']:['m','km','cm','mm','ft','in','mi'];const result=useMemo(()=>{if(temperature){let c=from==='c'?v:from==='f'?(v-32)*5/9:v-273.15;return to==='c'?c:to==='f'?c*9/5+32:c+273.15}const meter:Record<string,number>={m:1,km:1000,cm:.01,mm:.001,ft:.3048,in:.0254,mi:1609.344};return v*meter[from]/meter[to]},[v,from,to,temperature]);return <div className="toolUi"><div className="fieldGrid"><label>Value<input type="number" value={v} onChange={e=>setV(+e.target.value)}/></label><label>From<select value={from} onChange={e=>setFrom(e.target.value)}>{units.map(u=><option key={u}>{u}</option>)}</select></label><label>To<select value={to} onChange={e=>setTo(e.target.value)}>{units.map(u=><option key={u}>{u}</option>)}</select></label></div><MetricCard label="Converted value" value={Number(result.toFixed(6)).toString()}/></div>}

function TextTool({kind}:{kind:Tool['kind']}){const [text,setText]=useState('');const [output,setOutput]=useState('');const stats={words:text.trim()?text.trim().split(/\s+/).length:0,chars:text.length,sentences:text?text.split(/[.!?]+/).filter(Boolean).length:0};function action(type:string){if(kind==='case-converter'){setOutput(type==='upper'?text.toUpperCase():type==='lower'?text.toLowerCase():text.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()))}if(kind==='json-formatter'){try{const obj=JSON.parse(text);setOutput(type==='minify'?JSON.stringify(obj):JSON.stringify(obj,null,2))}catch(e){setOutput(`Invalid JSON: ${(e as Error).message}`)}}if(kind==='base64'){try{setOutput(type==='encode'?btoa(unescape(encodeURIComponent(text))):decodeURIComponent(escape(atob(text))))}catch{setOutput('Invalid Base64 input')}}}
  return <div className="toolUi"><textarea className="textArea" value={text} onChange={e=>setText(e.target.value)} placeholder="Paste or type here…"/>{kind==='word-counter'?<div className="metricGrid"><MetricCard label="Words" value={stats.words}/><MetricCard label="Characters" value={stats.chars}/><MetricCard label="Sentences" value={stats.sentences}/><MetricCard label="Reading time" value={Math.max(1,Math.ceil(stats.words/220))} suffix=" min"/></div>:<><div className="buttonRow">{kind==='case-converter'&&<><button className="secondaryButton" onClick={()=>action('upper')}>UPPERCASE</button><button className="secondaryButton" onClick={()=>action('lower')}>lowercase</button><button className="secondaryButton" onClick={()=>action('title')}>Title Case</button></>}{kind==='json-formatter'&&<><button className="primaryButton" onClick={()=>action('format')}>Format JSON</button><button className="secondaryButton" onClick={()=>action('minify')}>Minify</button></>}{kind==='base64'&&<><button className="primaryButton" onClick={()=>action('encode')}>Encode</button><button className="secondaryButton" onClick={()=>action('decode')}>Decode</button></>}</div><textarea className="textArea output" readOnly value={output} placeholder="Result…"/></>}</div>}

export function ToolExperience({tool}:{tool:Tool}){
  let ui;
  if(tool.kind==='image-convert') ui=<ImageConvert tool={tool}/>; else if(tool.kind==='image-compress')ui=<ImageCompress/>; else if(tool.kind==='image-resize')ui=<ImageResize/>; else if(['pdf-merge','pdf-split','images-to-pdf'].includes(tool.kind))ui=<PdfTool tool={tool}/>; else if(tool.kind==='age')ui=<AgeCalculator/>; else if(['percentage','bmi','interest','emi','sip','fd','cagr','gst'].includes(tool.kind))ui=<Calculator kind={tool.kind}/>; else if(tool.kind==='unit-length')ui=<UnitConverter/>; else if(tool.kind==='unit-temperature')ui=<UnitConverter temperature/>; else ui=<TextTool kind={tool.kind}/>;
  return <section className={`toolExperience accent-${tool.accent}`}><div className="experienceTop"><div><span className="eyebrow">TOOLMERA / {tool.categoryLabel.toUpperCase()}</span><h2>{tool.name}</h2></div><span className="privatePill"><ShieldCheck size={15}/> Browser-first processing</span></div>{ui}</section>
}
