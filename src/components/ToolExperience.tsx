'use client';

import { DragEvent, PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Copy, Download, FileUp, RefreshCw, ShieldCheck, X } from 'lucide-react';
import type { Tool } from '@/data/tools';

type Result = { url: string; name: string; before?: number; after?: number };
const money = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0);

function DownloadResult({ result }: { result: Result }) {
  return <div className="resultBox"><div><strong>Ready</strong>{result.before && result.after ? <small>{(result.before/1024).toFixed(0)} KB → {(result.after/1024).toFixed(0)} KB</small> : <small>Your file is ready to download.</small>}</div><a className="primaryButton" href={result.url} download={result.name}><Download size={17}/> Download</a></div>;
}

const prettyFileSize=(bytes:number)=>{
  if(bytes<1024)return bytes+' B';
  if(bytes<1024*1024)return (bytes/1024).toFixed(bytes<10240?1:0)+' KB';
  return (bytes/(1024*1024)).toFixed(bytes<10*1024*1024?1:0)+' MB';
};

function FileDrop({
  accept,
  multiple = false,
  onChange,
  label = 'Choose file',
  files = [],
  busy = false,
  busyLabel = 'Processing…',
  maxFiles
}: {
  accept: string;
  multiple?: boolean;
  onChange: (files: File[]) => void;
  label?: string;
  files?: File[];
  busy?: boolean;
  busyLabel?: string;
  maxFiles?: number;
}) {
  const [dragActive,setDragActive]=useState(false);
  const dragDepth=useRef(0);

  function pick(next:File[]){
    if(!next.length)return;
    onChange(multiple?next:next.slice(0,1));
  }
  function drop(e:DragEvent<HTMLLabelElement>){
    e.preventDefault();e.stopPropagation();dragDepth.current=0;setDragActive(false);
    pick(Array.from(e.dataTransfer.files||[]));
  }
  function dragEnter(e:DragEvent<HTMLLabelElement>){
    e.preventDefault();e.stopPropagation();dragDepth.current+=1;setDragActive(true);
  }
  function dragLeave(e:DragEvent<HTMLLabelElement>){
    e.preventDefault();e.stopPropagation();dragDepth.current=Math.max(0,dragDepth.current-1);
    if(dragDepth.current===0)setDragActive(false);
  }

  return <label
    className={`fileDrop ${dragActive?'dragActive':''} ${files.length?'hasFiles':''} ${busy?'isBusy':''}`}
    onDragEnter={dragEnter}
    onDragOver={(e)=>{e.preventDefault();e.stopPropagation();e.dataTransfer.dropEffect='copy'}}
    onDragLeave={dragLeave}
    onDrop={drop}
  >
    {busy
      ? <div className="fileProcessState"><span className="processSpinner"></span><strong>{busyLabel}</strong><small>Processing locally in your browser</small><div className="processTrack"><i/></div></div>
      : files.length
        ? <div className="fileReadyState">
            <span className="fileReadyIcon"><Check size={19}/></span>
            <div className="fileReadyCopy"><strong>{files.length===1?'File ready':files.length+' files ready'}</strong><small>{files.length===1?files[0].name:files.map(f=>f.name).slice(0,2).join(' · ')+(files.length>2?' · +'+(files.length-2)+' more':'')}</small></div>
            <span className="fileReadySize">{files.length===1?prettyFileSize(files[0].size):prettyFileSize(files.reduce((sum,f)=>sum+f.size,0))}</span>
            <span className="fileReplaceHint">{multiple?(maxFiles?`Drop more files or click to add · ${files.length}/${maxFiles}`:'Drop more files or click to add'):'Drop another file or click to replace'}</span>
          </div>
        : <><FileUp size={30}/><strong>{dragActive?'Drop file here':label}</strong><span>{dragActive?'Release to add it':'or drag & drop from your folder'}</span></>}
    <input type="file" accept={accept} multiple={multiple} disabled={busy} onChange={(e)=>{pick(Array.from(e.target.files||[]));e.currentTarget.value=''}}/>
  </label>;
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
      <span><b>{index + 1}</b><span><strong>{file.name}</strong><small>{prettyFileSize(file.size)} · <em>Ready</em></small></span></span>
      <div>
        <button type="button" aria-label="Move up" onClick={()=>move(index,-1)} disabled={index===0}><ChevronUp size={15}/></button>
        <button type="button" aria-label="Move down" onClick={()=>move(index,1)} disabled={index===files.length-1}><ChevronDown size={15}/></button>
        <button type="button" aria-label="Remove file" onClick={()=>remove(index)}><X size={15}/></button>
      </div>
    </div>)}
  </div>;
}


const MAX_BATCH_FILES=4;

function mergeBatchFiles(current:File[],incoming:File[],max=MAX_BATCH_FILES){
  const seen=new Set(current.map(f=>[f.name,f.size,f.lastModified].join(':')));
  const next=[...current];
  let overflow=false;
  for(const file of incoming){
    const key=[file.name,file.size,file.lastModified].join(':');
    if(seen.has(key))continue;
    if(next.length>=max){overflow=true;break}
    seen.add(key);next.push(file);
  }
  if(incoming.length>Math.max(0,max-current.length))overflow=true;
  return {files:next,overflow};
}

function BatchFileList({files,onRemove,max=MAX_BATCH_FILES}:{files:File[];onRemove:(index:number)=>void;max?:number}){
  if(!files.length)return null;
  return <div className="batchFilePanel">
    <div className="batchFileHead"><span>Files to process</span><small>{files.length}/{max} selected</small></div>
    <div className="batchFileList">
      {files.map((file,index)=><div className="batchFileItem" key={[file.name,file.size,file.lastModified,index].join('-')}>
        <b>{index+1}</b>
        <span><strong>{file.name}</strong><small>{prettyFileSize(file.size)} · Ready</small></span>
        <button type="button" aria-label={'Remove '+file.name} onClick={()=>onRemove(index)}><X size={15}/></button>
      </div>)}
    </div>
  </div>;
}

function DownloadResults({results}:{results:Result[]}){
  if(!results.length)return null;
  if(results.length===1)return <DownloadResult result={results[0]}/>;
  return <div className="batchResults">
    <div className="batchResultsHead"><span><Check size={16}/> {results.length} files ready</span><small>Download each converted file below</small></div>
    {results.map((result,index)=><div className="batchResultItem" key={result.url}>
      <b>{index+1}</b>
      <span><strong>{result.name}</strong><small>{result.before&&result.after?prettyFileSize(result.before)+' → '+prettyFileSize(result.after):prettyFileSize(result.after||0)}</small></span>
      <a className="secondaryButton" href={result.url} download={result.name}><Download size={15}/> Download</a>
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

function ImageConvert({tool}:{tool:Tool}){
  const [quality,setQuality]=useState(82);
  const [results,setResults]=useState<Result[]>([]);
  const [busy,setBusy]=useState(false);
  const [busyLabel,setBusyLabel]=useState('Processing…');
  const [files,setFiles]=useState<File[]>([]);
  const [background,setBackground]=useState('#ffffff');
  const [error,setError]=useState('');

  function choose(incoming:File[]){
    const merged=mergeBatchFiles(files,incoming);
    setFiles(merged.files);setResults([]);setError(merged.overflow?'Maximum 4 files per batch. Remove one to add another.':'');
  }
  function remove(index:number){setFiles(files.filter((_,i)=>i!==index));setResults([]);setError('')}

  async function run(){
    if(!files.length)return;
    setBusy(true);setResults([]);setError('');
    const output:Result[]=[];
    try{
      for(let i=0;i<files.length;i++){
        const file=files[i];setBusyLabel(`Converting ${i+1} of ${files.length} to ${outputName}…`);
        const {bitmap,canvas,ctx}=await imageToCanvas(file);
        if(tool.outputFormat==='image/jpeg'){ctx.fillStyle=background;ctx.fillRect(0,0,canvas.width,canvas.height)}
        ctx.drawImage(bitmap,0,0);
        const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Conversion failed.')),tool.outputFormat,quality/100));
        const ext=tool.outputFormat?.split('/')[1].replace('jpeg','jpg')||'image';
        output.push({url:URL.createObjectURL(blob),name:file.name.replace(/\.[^.]+$/,'')+'.'+ext,before:file.size,after:blob.size});
        bitmap.close();
      }
      setResults(output);
    }catch(e){setError(e instanceof Error?e.message:'Could not convert one of these images.')}
    finally{setBusy(false)}
  }

  const outputName=tool.outputFormat?.split('/')[1].replace('jpeg','JPG').toUpperCase()||'IMAGE';
  return <div className="toolUi">
    <FileDrop accept={tool.inputFormat||'image/*'} multiple onChange={choose} label={'Choose '+tool.name.split(' to ')[0]+' files'} files={files} busy={busy} busyLabel={busyLabel} maxFiles={MAX_BATCH_FILES}/>
    {!busy&&<BatchFileList files={files} onRemove={remove}/>}
    {files.length>0&&!busy&&<>
      <div className="controlRow">
        <label>Quality <b>{quality}%</b></label>
        <input type="range" min="35" max="100" value={quality} onChange={e=>setQuality(+e.target.value)}/>
        {tool.outputFormat==='image/jpeg'&&<label className="colorControl">Background <input type="color" value={background} onChange={e=>setBackground(e.target.value)}/><b>{background.toUpperCase()}</b></label>}
      </div>
      <button className="primaryButton wide filePrimaryAction" onClick={run}>Convert {files.length} file{files.length===1?'':'s'} to {outputName}</button>
    </>}
    {error&&<div className="toolError">{error}</div>}
    <DownloadResults results={results}/>
  </div>;
}

function ImageCompress(){
  const [quality,setQuality]=useState(75);
  const [files,setFiles]=useState<File[]>([]);
  const [results,setResults]=useState<Result[]>([]);
  const [busy,setBusy]=useState(false);
  const [busyLabel,setBusyLabel]=useState('Compressing…');
  const [error,setError]=useState('');

  function choose(incoming:File[]){const merged=mergeBatchFiles(files,incoming);setFiles(merged.files);setResults([]);setError(merged.overflow?'Maximum 4 files per batch. Remove one to add another.':'')}
  function remove(index:number){setFiles(files.filter((_,i)=>i!==index));setResults([]);setError('')}

  async function run(){
    if(!files.length)return;setBusy(true);setResults([]);setError('');
    const output:Result[]=[];
    try{
      for(let i=0;i<files.length;i++){
        const file=files[i];setBusyLabel(`Compressing ${i+1} of ${files.length}…`);
        const {bitmap,canvas,ctx}=await imageToCanvas(file);ctx.drawImage(bitmap,0,0);
        const type=file.type==='image/png'?'image/webp':(file.type||'image/jpeg');
        const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Compression failed.')),type,quality/100));
        output.push({url:URL.createObjectURL(blob),name:file.name.replace(/\.[^.]+$/,'')+'-compressed.'+type.split('/')[1].replace('jpeg','jpg'),before:file.size,after:blob.size});
        bitmap.close();
      }
      setResults(output);
    }catch(e){setError(e instanceof Error?e.message:'Could not compress one of these images.')}
    finally{setBusy(false)}
  }

  const hasPng=files.some(file=>file.type==='image/png');
  return <div className="toolUi">
    <FileDrop accept="image/png,image/jpeg,image/webp" multiple onChange={choose} files={files} busy={busy} busyLabel={busyLabel} maxFiles={MAX_BATCH_FILES}/>
    {!busy&&<BatchFileList files={files} onRemove={remove}/>}
    {hasPng&&<div className="toolNote"><ShieldCheck size={15}/><span>PNG input is exported as WebP in the current general compressor for stronger browser-side size reduction.</span></div>}
    {files.length>0&&!busy&&<>
      <div className="controlRow"><label>Compression quality <b>{quality}%</b></label><input type="range" min="30" max="95" value={quality} onChange={e=>setQuality(+e.target.value)}/></div>
      <button className="primaryButton wide filePrimaryAction" onClick={run}>Compress {files.length} file{files.length===1?'':'s'}</button>
    </>}
    {error&&<div className="toolError">{error}</div>}
    <DownloadResults results={results}/>
  </div>;
}

function ImageResize() {
  const [file,setFile]=useState<File|null>(null);
  const [width,setWidth]=useState(1200);
  const [height,setHeight]=useState(800);
  const [ratio,setRatio]=useState(1.5);
  const [result,setResult]=useState<Result|null>(null);
  const [busy,setBusy]=useState(false);
  const [busyLabel,setBusyLabel]=useState('Reading image…');
  const [error,setError]=useState('');

  async function select(files:File[]){
    if(!files[0])return;
    const f=files[0];setFile(f);setResult(null);setError('');setBusyLabel('Reading image…');setBusy(true);
    try{
      const b=await createImageBitmap(f);
      setWidth(b.width);setHeight(b.height);setRatio(b.width/b.height);b.close();
    }catch(e){setError(e instanceof Error?e.message:'Could not read this image.');setFile(null)}
    finally{setBusy(false)}
  }

  async function resize(){
    if(!file)return;
    setBusyLabel('Resizing image…');setBusy(true);setResult(null);setError('');
    try{
      const b=await createImageBitmap(file);
      const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
      canvas.getContext('2d')!.drawImage(b,0,0,width,height);
      const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(x=>x?resolve(x):reject(new Error('Resize failed.')),file.type||'image/png',0.9));
      setResult({url:URL.createObjectURL(blob),name:file.name.replace(/\.[^.]+$/,'')+'-'+width+'x'+height+'.'+(file.type||'image/png').split('/')[1].replace('jpeg','jpg'),before:file.size,after:blob.size});
      b.close();
    }catch(e){setError(e instanceof Error?e.message:'Could not resize this image.')}
    finally{setBusy(false)}
  }

  return <div className="toolUi">
    <FileDrop accept="image/*" onChange={select} files={file?[file]:[]} busy={busy} busyLabel={busyLabel}/>
    {file&&!busy&&<>
      <div className="fieldGrid fileSettingsGrid">
        <label>Width<input type="number" value={width} onChange={e=>{const w=+e.target.value;setWidth(w);setHeight(Math.round(w/ratio))}}/></label>
        <label>Height<input type="number" value={height} onChange={e=>{const h=+e.target.value;setHeight(h);setWidth(Math.round(h*ratio))}}/></label>
      </div>
      <button className="primaryButton wide filePrimaryAction" onClick={resize}>Resize image</button>
    </>}
    {error&&<div className="toolError">{error}</div>}
    {result&&<DownloadResult result={result}/>}
  </div>;
}

function ImageCompressJpg(){
  const [quality,setQuality]=useState(80);
  const [files,setFiles]=useState<File[]>([]);
  const [results,setResults]=useState<Result[]>([]);
  const [busy,setBusy]=useState(false);
  const [busyLabel,setBusyLabel]=useState('Compressing JPG…');
  const [error,setError]=useState('');

  function choose(incoming:File[]){const valid=incoming.filter(f=>f.type==='image/jpeg'||/\.jpe?g$/i.test(f.name));const merged=mergeBatchFiles(files,valid);setFiles(merged.files);setResults([]);setError(valid.length!==incoming.length?'Only JPG/JPEG files were added.':merged.overflow?'Maximum 4 files per batch. Remove one to add another.':'')}
  function remove(index:number){setFiles(files.filter((_,i)=>i!==index));setResults([]);setError('')}

  async function run(){
    if(!files.length)return;setBusy(true);setResults([]);setError('');
    const output:Result[]=[];
    try{
      for(let i=0;i<files.length;i++){
        const file=files[i];setBusyLabel(`Compressing JPG ${i+1} of ${files.length}…`);
        const {bitmap,canvas,ctx}=await imageToCanvas(file);ctx.drawImage(bitmap,0,0);
        const encoded=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('JPEG compression failed.')),'image/jpeg',quality/100));
        const out=encoded.size<file.size?encoded:file;
        output.push({url:URL.createObjectURL(out),name:file.name.replace(/\.[^.]+$/,'')+'-compressed.jpg',before:file.size,after:out.size});bitmap.close();
      }
      setResults(output);
    }catch(e){setError(e instanceof Error?e.message:'Could not compress one of these JPG files.')}
    finally{setBusy(false)}
  }

  return <div className="toolUi">
    <FileDrop accept="image/jpeg,.jpg,.jpeg" multiple onChange={choose} label="Choose JPG files" files={files} busy={busy} busyLabel={busyLabel} maxFiles={MAX_BATCH_FILES}/>
    {!busy&&<BatchFileList files={files} onRemove={remove}/>}
    {files.length>0&&!busy&&<>
      <div className="controlRow"><label>JPEG quality <b>{quality}%</b></label><input type="range" min="30" max="95" value={quality} onChange={e=>setQuality(+e.target.value)}/></div>
      <button className="primaryButton wide filePrimaryAction" onClick={run}>Compress {files.length} JPG{files.length===1?'':'s'}</button>
    </>}
    <div className="toolNote"><ShieldCheck size={15}/><span>If re-encoding would make a file larger, Toolmera keeps the original JPG bytes for that file instead.</span></div>
    {error&&<div className="toolError">{error}</div>}
    <DownloadResults results={results}/>
  </div>;
}

function ImageCompressPng(){
  const [colors,setColors]=useState(256);
  const [files,setFiles]=useState<File[]>([]);
  const [results,setResults]=useState<Result[]>([]);
  const [busy,setBusy]=useState(false);
  const [busyLabel,setBusyLabel]=useState('Optimizing PNG…');
  const [error,setError]=useState('');

  function choose(incoming:File[]){const valid=incoming.filter(f=>f.type==='image/png'||/\.png$/i.test(f.name));const merged=mergeBatchFiles(files,valid);setFiles(merged.files);setResults([]);setError(valid.length!==incoming.length?'Only PNG files were added.':merged.overflow?'Maximum 4 files per batch. Remove one to add another.':'')}
  function remove(index:number){setFiles(files.filter((_,i)=>i!==index));setResults([]);setError('')}

  async function run(){
    if(!files.length)return;setBusy(true);setResults([]);setError('');
    const output:Result[]=[];
    try{
      const mod=await import('@upng/upng-js');
      const UPNG=(mod.default||mod) as unknown as {encode:(frames:ArrayBuffer[],w:number,h:number,cnum:number)=>ArrayBuffer};
      for(let i=0;i<files.length;i++){
        const file=files[i];setBusyLabel(`Optimizing PNG ${i+1} of ${files.length}…`);
        const {bitmap,canvas,ctx}=await imageToCanvas(file);ctx.drawImage(bitmap,0,0);
        const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
        const rgba=pixels.data.buffer.slice(pixels.data.byteOffset,pixels.data.byteOffset+pixels.data.byteLength) as ArrayBuffer;
        const encoded=UPNG.encode([rgba],canvas.width,canvas.height,colors);const blob=new Blob([encoded],{type:'image/png'});
        output.push({url:URL.createObjectURL(blob),name:file.name.replace(/\.[^.]+$/,'')+'-compressed.png',before:file.size,after:blob.size});bitmap.close();
      }
      setResults(output);
    }catch(e){setError(e instanceof Error?e.message:'Could not compress one of these PNG files.')}
    finally{setBusy(false)}
  }

  return <div className="toolUi">
    <FileDrop accept="image/png,.png" multiple onChange={choose} label="Choose PNG files" files={files} busy={busy} busyLabel={busyLabel} maxFiles={MAX_BATCH_FILES}/>
    {!busy&&<BatchFileList files={files} onRemove={remove}/>}
    {files.length>0&&!busy&&<>
      <div className="calcModeTabs unitTabs">{[256,128,64].map(v=><button key={v} className={colors===v?'active':''} onClick={()=>setColors(v)}>{v} colors</button>)}</div>
      <button className="primaryButton wide filePrimaryAction" onClick={run}>Compress {files.length} PNG{files.length===1?'':'s'}</button>
    </>}
    <div className="toolNote"><ShieldCheck size={15}/><span>PNG stays PNG. Palette quantization can reduce color precision, so compare each result before replacing an original asset.</span></div>
    {error&&<div className="toolError">{error}</div>}
    <DownloadResults results={results}/>
  </div>;
}

function HeicConverter(){
  const [files,setFiles]=useState<File[]>([]);
  const [format,setFormat]=useState<'jpg'|'png'>('jpg');
  const [quality,setQuality]=useState(85);
  const [results,setResults]=useState<Result[]>([]);
  const [busy,setBusy]=useState(false);
  const [busyLabel,setBusyLabel]=useState('Converting HEIC…');
  const [error,setError]=useState('');

  function choose(incoming:File[]){const valid=incoming.filter(f=>/\.(heic|heif)$/i.test(f.name)||['image/heic','image/heif'].includes(f.type));const merged=mergeBatchFiles(files,valid);setFiles(merged.files);setResults([]);setError(valid.length!==incoming.length?'Only HEIC/HEIF files were added.':merged.overflow?'Maximum 4 files per batch. Remove one to add another.':'')}
  function remove(index:number){setFiles(files.filter((_,i)=>i!==index));setResults([]);setError('')}

  async function run(){
    if(!files.length)return;setBusy(true);setResults([]);setError('');
    const output:Result[]=[];
    try{
      const mod=await import('heic2any');const convert=mod.default;
      for(let i=0;i<files.length;i++){
        const file=files[i];setBusyLabel(`Converting HEIC ${i+1} of ${files.length} to ${format.toUpperCase()}…`);
        const converted=await convert({blob:file,toType:format==='jpg'?'image/jpeg':'image/png',quality:quality/100});
        const blob=Array.isArray(converted)?converted[0]:converted;if(!blob)throw new Error('A HEIC file did not produce a usable image.');
        output.push({url:URL.createObjectURL(blob),name:file.name.replace(/\.[^.]+$/,'')+'.'+format,before:file.size,after:blob.size});
      }
      setResults(output);
    }catch(e){setError(e instanceof Error?e.message:'Could not decode one of these HEIC files.')}
    finally{setBusy(false)}
  }

  return <div className="toolUi">
    <FileDrop accept=".heic,.heif,image/heic,image/heif" multiple onChange={choose} label="Choose HEIC / HEIF photos" files={files} busy={busy} busyLabel={busyLabel} maxFiles={MAX_BATCH_FILES}/>
    {!busy&&<BatchFileList files={files} onRemove={remove}/>}
    {files.length>0&&!busy&&<>
      <div className="calcModeTabs unitTabs"><button className={format==='jpg'?'active':''} onClick={()=>setFormat('jpg')}>JPG output</button><button className={format==='png'?'active':''} onClick={()=>setFormat('png')}>PNG output</button></div>
      {format==='jpg'&&<div className="controlRow"><label>JPG quality <b>{quality}%</b></label><input type="range" min="40" max="100" value={quality} onChange={e=>setQuality(+e.target.value)}/></div>}
      <button className="primaryButton wide filePrimaryAction" onClick={run}>Convert {files.length} file{files.length===1?'':'s'} to {format.toUpperCase()}</button>
    </>}
    <div className="toolNote"><ShieldCheck size={15}/><span>The converted files are fresh images and do not preserve the original HEIC metadata. Very large phone photos can use substantial browser memory.</span></div>
    {error&&<div className="toolError">{error}</div>}
    <DownloadResults results={results}/>
  </div>;
}

type CropRect={x:number;y:number;w:number;h:number};

function CropImage(){
  const bitmapRef=useRef<ImageBitmap|null>(null);
  const canvasRef=useRef<HTMLCanvasElement|null>(null);
  const dragStart=useRef<{x:number;y:number}|null>(null);
  const [file,setFile]=useState<File|null>(null);
  const [crop,setCrop]=useState<CropRect>({x:0,y:0,w:1,h:1});
  const [ratio,setRatio]=useState<'free'|'1:1'|'4:3'|'16:9'|'9:16'>('free');
  const [result,setResult]=useState<Result|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [busyLabel,setBusyLabel]=useState('Reading image…');

  function redraw(){
    const bitmap=bitmapRef.current,canvas=canvasRef.current;
    if(!bitmap||!canvas)return;
    canvas.width=bitmap.width;canvas.height=bitmap.height;
    const ctx=canvas.getContext('2d')!;
    ctx.drawImage(bitmap,0,0);
    ctx.fillStyle='rgba(2,5,8,.58)';ctx.fillRect(0,0,canvas.width,canvas.height);
    if(crop.w>0&&crop.h>0){
      ctx.drawImage(bitmap,crop.x,crop.y,crop.w,crop.h,crop.x,crop.y,crop.w,crop.h);
      ctx.strokeStyle='#4cAAff';ctx.lineWidth=Math.max(2,Math.round(canvas.width/500));ctx.strokeRect(crop.x,crop.y,crop.w,crop.h);
    }
  }
  useEffect(redraw,[crop,file]);

  async function choose(files:File[]){
    if(!files[0])return;
    const input=files[0];setFile(input);setError('');setResult(null);setBusyLabel('Reading image…');setBusy(true);
    try{
      if(!['image/jpeg','image/png','image/webp'].includes(input.type))throw new Error('Choose a JPG, PNG or WebP image.');
      bitmapRef.current?.close();
      const bitmap=await createImageBitmap(input);
      bitmapRef.current=bitmap;setCrop({x:0,y:0,w:bitmap.width,h:bitmap.height});
    }catch(e){setError(e instanceof Error?e.message:'Could not open this image.');setFile(null)}
    finally{setBusy(false)}
  }

  function canvasPoint(e:PointerEvent<HTMLCanvasElement>){
    const canvas=canvasRef.current!;
    const box=canvas.getBoundingClientRect();
    return {x:Math.max(0,Math.min(canvas.width,(e.clientX-box.left)*canvas.width/box.width)),y:Math.max(0,Math.min(canvas.height,(e.clientY-box.top)*canvas.height/box.height))};
  }
  function ratioValue(){return ratio==='1:1'?1:ratio==='4:3'?4/3:ratio==='16:9'?16/9:ratio==='9:16'?9/16:null}
  function pointerDown(e:PointerEvent<HTMLCanvasElement>){if(!file)return;dragStart.current=canvasPoint(e);e.currentTarget.setPointerCapture(e.pointerId)}
  function pointerMove(e:PointerEvent<HTMLCanvasElement>){
    if(!dragStart.current||!bitmapRef.current)return;
    const p=canvasPoint(e),s=dragStart.current;
    let dx=p.x-s.x,dy=p.y-s.y;
    const rv=ratioValue();
    if(rv){
      const sx=dx<0?-1:1,sy=dy<0?-1:1;
      let w=Math.abs(dx),h=Math.abs(dy);
      if(w/Math.max(1,h)>rv)w=h*rv;else h=w/rv;
      dx=w*sx;dy=h*sy;
    }
    const x=Math.max(0,Math.min(s.x,s.x+dx)),y=Math.max(0,Math.min(s.y,s.y+dy));
    const w=Math.min(bitmapRef.current.width-x,Math.abs(dx)),h=Math.min(bitmapRef.current.height-y,Math.abs(dy));
    if(w>=1&&h>=1)setCrop({x:Math.round(x),y:Math.round(y),w:Math.round(w),h:Math.round(h)});
  }
  function pointerUp(){dragStart.current=null}

  function applyRatio(next:typeof ratio){
    setRatio(next);
    const bitmap=bitmapRef.current;if(!bitmap||next==='free')return;
    const rv=next==='1:1'?1:next==='4:3'?4/3:next==='16:9'?16/9:9/16;
    let w=bitmap.width,h=Math.round(w/rv);
    if(h>bitmap.height){h=bitmap.height;w=Math.round(h*rv)}
    setCrop({x:Math.round((bitmap.width-w)/2),y:Math.round((bitmap.height-h)/2),w,h});
  }

  async function exportCrop(){
    const bitmap=bitmapRef.current;
    if(!bitmap||!file||crop.w<1||crop.h<1)return;
    const canvas=document.createElement('canvas');canvas.width=crop.w;canvas.height=crop.h;
    canvas.getContext('2d')!.drawImage(bitmap,crop.x,crop.y,crop.w,crop.h,0,0,crop.w,crop.h);
    const type=['image/jpeg','image/png','image/webp'].includes(file.type)?file.type:'image/png';
    const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Crop export failed.')),type,type==='image/png'?undefined:.92));
    const ext=type.split('/')[1].replace('jpeg','jpg');
    setResult({url:URL.createObjectURL(blob),name:file.name.replace(/\.[^.]+$/,'')+'-cropped.'+ext,before:file.size,after:blob.size});
  }

  return <div className="toolUi">
    <FileDrop accept="image/jpeg,image/png,image/webp" onChange={choose} label="Choose image" files={file?[file]:[]} busy={busy} busyLabel={busyLabel}/>
    {file&&<>
      <div className="calcModeTabs unitTabs">{(['free','1:1','4:3','16:9','9:16'] as const).map(v=><button key={v} className={ratio===v?'active':''} onClick={()=>applyRatio(v)}>{v==='free'?'Free crop':v}</button>)}</div>
      <div className="cropStage"><canvas ref={canvasRef} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp}/><span>Drag across the image to draw a new crop area.</span></div>
      <div className="fieldGrid cropFields">
        <label>X<input type="number" min="0" max={bitmapRef.current?.width||0} value={crop.x} onChange={e=>setCrop({...crop,x:+e.target.value})}/></label>
        <label>Y<input type="number" min="0" max={bitmapRef.current?.height||0} value={crop.y} onChange={e=>setCrop({...crop,y:+e.target.value})}/></label>
        <label>Width<input type="number" min="1" max={bitmapRef.current?.width||1} value={crop.w} onChange={e=>setCrop({...crop,w:+e.target.value})}/></label>
        <label>Height<input type="number" min="1" max={bitmapRef.current?.height||1} value={crop.h} onChange={e=>setCrop({...crop,h:+e.target.value})}/></label>
      </div>
      <button className="primaryButton wide filePrimaryAction" onClick={exportCrop} disabled={busy}>{busy?'Cropping…':'Crop image'}</button>
    </>}
    {error&&<div className="toolError">{error}</div>}
    {result&&<DownloadResult result={result}/>}
  </div>;
}

function parsePageSet(input:string,pageCount:number){
  const clean=input.trim().toLowerCase();
  if(clean==='all')return new Set(Array.from({length:pageCount},(_,i)=>i));
  const out=new Set<number>();
  if(!clean)throw new Error('Enter page numbers such as 2, 5-9.');
  for(const part of clean.split(',').map(v=>v.trim()).filter(Boolean)){
    if(/^\d+$/.test(part)){
      const n=Number(part);if(n<1||n>pageCount)throw new Error('Page '+n+' is outside this '+pageCount+'-page PDF.');out.add(n-1);continue;
    }
    const m=part.match(/^(\d+)\s*-\s*(\d+)$/);
    if(!m)throw new Error('Use page syntax such as 2, 5-9, 12.');
    const a=Number(m[1]),b=Number(m[2]);if(a<1||b<1||a>pageCount||b>pageCount)throw new Error('Range '+part+' is outside this '+pageCount+'-page PDF.');
    const lo=Math.min(a,b),hi=Math.max(a,b);for(let n=lo;n<=hi;n++)out.add(n-1);
  }
  return out;
}

function PdfRotate(){
  const [file,setFile]=useState<File|null>(null);
  const [pageCount,setPageCount]=useState(0);
  const [mode,setMode]=useState<'all'|'odd'|'even'|'custom'>('all');
  const [custom,setCustom]=useState('1');
  const [angle,setAngle]=useState<90|-90|180>(90);
  const [result,setResult]=useState<Result|null>(null);
  const [busy,setBusy]=useState(false);
  const [busyLabel,setBusyLabel]=useState('Reading PDF…');
  const [error,setError]=useState('');

  async function choose(files:File[]){
    if(!files[0])return;setFile(files[0]);setResult(null);setError('');setBusyLabel('Reading PDF…');setBusy(true);
    try{const {PDFDocument}=await import('pdf-lib');const doc=await PDFDocument.load(await files[0].arrayBuffer());setPageCount(doc.getPageCount())}
    catch{setPageCount(0);setError('Could not read this PDF. It may be encrypted or damaged.');setFile(null)}
    finally{setBusy(false)}
  }
  async function run(){
    if(!file)return;setBusyLabel('Rotating PDF…');setBusy(true);setError('');setResult(null);
    try{
      const {PDFDocument,degrees}=await import('pdf-lib');
      const doc=await PDFDocument.load(await file.arrayBuffer());const count=doc.getPageCount();
      const selected=mode==='all'?new Set(Array.from({length:count},(_,i)=>i)):mode==='odd'?new Set(Array.from({length:count},(_,i)=>i).filter(i=>i%2===0)):mode==='even'?new Set(Array.from({length:count},(_,i)=>i).filter(i=>i%2===1)):parsePageSet(custom,count);
      doc.getPages().forEach((page,i)=>{if(selected.has(i)){const next=((page.getRotation().angle+angle)%360+360)%360;page.setRotation(degrees(next))}});
      const bytes=await doc.save();const blob=new Blob([bytes as BlobPart],{type:'application/pdf'});
      setResult({url:URL.createObjectURL(blob),name:file.name.replace(/\.pdf$/i,'')+'-rotated.pdf',before:file.size,after:blob.size});
    }catch(e){setError(e instanceof Error?e.message:'Could not rotate this PDF.')}
    finally{setBusy(false)}
  }

  return <div className="toolUi">
    <FileDrop accept="application/pdf,.pdf" onChange={choose} label="Choose PDF file" files={file?[file]:[]} busy={busy} busyLabel={busyLabel}/>
    {file&&<>
      <div className="calcModeTabs unitTabs">{(['all','odd','even','custom'] as const).map(v=><button key={v} className={mode===v?'active':''} onClick={()=>setMode(v)}>{v==='all'?'All pages':v==='odd'?'Odd pages':v==='even'?'Even pages':'Custom pages'}</button>)}</div>
      {mode==='custom'&&<label className="singleField">Pages to rotate<input value={custom} onChange={e=>setCustom(e.target.value)} placeholder="2, 5-8"/></label>}
      <div className="calcModeTabs unitTabs"><button className={angle===90?'active':''} onClick={()=>setAngle(90)}>90° clockwise</button><button className={angle===-90?'active':''} onClick={()=>setAngle(-90)}>90° counter-clockwise</button><button className={angle===180?'active':''} onClick={()=>setAngle(180)}>180°</button></div>
      <button className="primaryButton wide filePrimaryAction" onClick={run} disabled={busy}>{busy?'Rotating…':'Rotate PDF'}</button>
    </>}
    {error&&<div className="toolError">{error}</div>}
    {result&&<DownloadResult result={result}/>}
  </div>;
}

function PdfRemovePages(){
  const [file,setFile]=useState<File|null>(null);
  const [pageCount,setPageCount]=useState(0);
  const [selection,setSelection]=useState('2');
  const [result,setResult]=useState<Result|null>(null);
  const [busy,setBusy]=useState(false);
  const [busyLabel,setBusyLabel]=useState('Reading PDF…');
  const [error,setError]=useState('');

  async function choose(files:File[]){
    if(!files[0])return;setFile(files[0]);setResult(null);setError('');setBusyLabel('Reading PDF…');setBusy(true);
    try{const {PDFDocument}=await import('pdf-lib');const doc=await PDFDocument.load(await files[0].arrayBuffer());setPageCount(doc.getPageCount())}
    catch{setPageCount(0);setError('Could not read this PDF. It may be encrypted or damaged.');setFile(null)}
    finally{setBusy(false)}
  }
  const selectedCount=useMemo(()=>{try{return pageCount?parsePageSet(selection,pageCount).size:0}catch{return 0}},[selection,pageCount]);

  async function run(){
    if(!file)return;setBusyLabel('Removing PDF pages…');setBusy(true);setError('');setResult(null);
    try{
      const {PDFDocument}=await import('pdf-lib');
      const src=await PDFDocument.load(await file.arrayBuffer());const count=src.getPageCount();const remove=parsePageSet(selection,count);
      if(remove.size===0)throw new Error('Choose at least one page to remove.');
      if(remove.size>=count)throw new Error('A PDF must keep at least one page.');
      const keep=src.getPageIndices().filter(i=>!remove.has(i));
      const out=await PDFDocument.create();const pages=await out.copyPages(src,keep);pages.forEach(p=>out.addPage(p));
      const bytes=await out.save();const blob=new Blob([bytes as BlobPart],{type:'application/pdf'});
      setResult({url:URL.createObjectURL(blob),name:file.name.replace(/\.pdf$/i,'')+'-pages-removed.pdf',before:file.size,after:blob.size});
    }catch(e){setError(e instanceof Error?e.message:'Could not remove pages from this PDF.')}
    finally{setBusy(false)}
  }

  return <div className="toolUi">
    <FileDrop accept="application/pdf,.pdf" onChange={choose} label="Choose PDF file" files={file?[file]:[]} busy={busy} busyLabel={busyLabel}/>
    {file&&<>
      <label className="singleField">Pages to remove<input value={selection} onChange={e=>setSelection(e.target.value)} placeholder="2, 5-9, 12"/></label>
      {pageCount>0&&<div className="toolNote"><ShieldCheck size={15}/><span>{selectedCount} page{selectedCount===1?'':'s'} selected for removal · {Math.max(0,pageCount-selectedCount)} page{pageCount-selectedCount===1?'':'s'} would remain.</span></div>}
      <button className="primaryButton wide filePrimaryAction" onClick={run} disabled={busy}>{busy?'Removing pages…':'Remove pages'}</button>
    </>}
    {error&&<div className="toolError">{error}</div>}
    {result&&<DownloadResult result={result}/>}
  </div>;
}

function PdfToImage(){
  const [file,setFile]=useState<File|null>(null);
  const [pageCount,setPageCount]=useState(0);
  const [pages,setPages]=useState('all');
  const [format,setFormat]=useState<'jpg'|'png'>('jpg');
  const [scale,setScale]=useState(1.5);
  const [result,setResult]=useState<Result|null>(null);
  const [busy,setBusy]=useState(false);
  const [busyLabel,setBusyLabel]=useState('Reading PDF…');
  const [error,setError]=useState('');

  async function choose(files:File[]){
    if(!files[0])return;setFile(files[0]);setResult(null);setError('');setBusyLabel('Reading PDF…');setBusy(true);
    try{const {PDFDocument}=await import('pdf-lib');const doc=await PDFDocument.load(await files[0].arrayBuffer());setPageCount(doc.getPageCount())}
    catch{setPageCount(0);setError('Could not read this PDF. Password-protected or damaged PDFs are not supported in this converter.');setFile(null)}
    finally{setBusy(false)}
  }

  async function run(){
    if(!file)return;setBusyLabel('Rendering PDF pages…');setBusy(true);setError('');setResult(null);
    try{
      const pdfjs=await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/build/pdf.worker.min.mjs',import.meta.url).toString();
      const loading=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())});
      const pdf=await loading.promise;const selected=[...parsePageSet(pages,pdf.numPages)].sort((a,b)=>a-b);
      if(!selected.length)throw new Error('Choose at least one PDF page.');
      const outputs:{name:string;blob:Blob}[]=[];
      for(const index of selected){
        const page=await pdf.getPage(index+1);const viewport=page.getViewport({scale});
        const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
        const ctx=canvas.getContext('2d')!;
        if(format==='jpg'){ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height)}
        await page.render({canvas,canvasContext:ctx,viewport}).promise;
        const mime=format==='jpg'?'image/jpeg':'image/png';
        const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Page rendering failed.')),mime,format==='jpg'?.9:undefined));
        outputs.push({name:file.name.replace(/\.pdf$/i,'')+'-page-'+(index+1)+'.'+format,blob});
        canvas.width=0;canvas.height=0;page.cleanup();
      }
      if(outputs.length===1){
        const out=outputs[0];setResult({url:URL.createObjectURL(out.blob),name:out.name,after:out.blob.size});
      }else{
        const JSZip=(await import('jszip')).default;const zip=new JSZip();outputs.forEach(out=>zip.file(out.name,out.blob));
        const blob=await zip.generateAsync({type:'blob'});setResult({url:URL.createObjectURL(blob),name:file.name.replace(/\.pdf$/i,'')+'-images.zip',after:blob.size});
      }
      await loading.destroy();
    }catch(e){setError(e instanceof Error?e.message:'Could not convert this PDF to images.')}
    finally{setBusy(false)}
  }

  return <div className="toolUi">
    <FileDrop accept="application/pdf,.pdf" onChange={choose} label="Choose PDF file" files={file?[file]:[]} busy={busy} busyLabel={busyLabel}/>
    {file&&<>
      <div className="calcModeTabs unitTabs"><button className={format==='jpg'?'active':''} onClick={()=>setFormat('jpg')}>JPG</button><button className={format==='png'?'active':''} onClick={()=>setFormat('png')}>PNG</button></div>
      <div className="fieldGrid calculatorTwoFields">
        <label>Pages<input value={pages} onChange={e=>setPages(e.target.value)} placeholder="all or 1-3, 5"/></label>
        <label>Render scale<select value={scale} onChange={e=>setScale(+e.target.value)}><option value={1}>1× compact</option><option value={1.5}>1.5× standard</option><option value={2}>2× sharp</option><option value={3}>3× high detail</option></select></label>
      </div>
      <div className="toolNote"><ShieldCheck size={15}/><span>Pages render sequentially to limit memory use. Multiple outputs are bundled into a ZIP. Password-protected PDFs are not supported in this version.</span></div>
      <button className="primaryButton wide filePrimaryAction" onClick={run} disabled={busy}>{busy?'Rendering pages…':'Convert PDF to '+format.toUpperCase()}</button>
    </>}
    {error&&<div className="toolError">{error}</div>}
    {result&&<DownloadResult result={result}/>}
  </div>;
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
    <FileDrop accept={accept} multiple={tool.kind!=='pdf-split'} onChange={selectFiles} label="Choose files" files={files} busy={busy} busyLabel={tool.kind==='pdf-merge'?'Merging PDF files…':tool.kind==='pdf-split'?'Extracting PDF pages…':'Creating PDF…'}/>
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
    <button className="primaryButton wide filePrimaryAction" onClick={run} disabled={!files.length||busy}>{busy?'Processing…':tool.name}</button>
    {result&&<DownloadResult result={result}/>}
  </div>;
}

function MetricCard({ label, value, suffix='' }: {label:string;value:string|number;suffix?:string}){return <div className="metricCard"><span>{label}</span><strong>{value}{suffix}</strong></div>}

function EmiIndiaCalculator({variant}:{variant:'generic'|'home'|'car'}){
  const [amount,setAmount]=useState(variant==='home'?5000000:variant==='car'?1200000:1000000);
  const [downPayment,setDownPayment]=useState(variant==='car'?200000:0);
  const [rate,setRate]=useState(variant==='home'?8.5:variant==='car'?9.5:9);
  const [years,setYears]=useState(variant==='home'?20:5);

  const principal=variant==='car'?Math.max(0,amount-downPayment):amount;
  const result=useMemo(()=>{
    const n=Math.max(1,Math.round(years*12));
    if(principal<=0)return {error:'Enter a financed amount greater than zero.'} as const;
    if(rate<0)return {error:'Interest rate cannot be negative.'} as const;
    const r=rate/12/100;
    const emi=r===0?principal/n:principal*r*(1+r)**n/((1+r)**n-1);
    let balance=principal;
    const yearly:{year:number;principal:number;interest:number;balance:number;payments:number}[]=[];
    let yp=0,yi=0,ypay=0;
    for(let month=1;month<=n;month++){
      const interest=balance*r;
      const principalPaid=month===n?balance:Math.min(balance,emi-interest);
      const payment=principalPaid+interest;
      balance=Math.max(0,balance-principalPaid);
      yp+=principalPaid;yi+=interest;ypay+=payment;
      if(month%12===0||month===n){
        yearly.push({year:Math.ceil(month/12),principal:yp,interest:yi,balance,payments:ypay});
        yp=0;yi=0;ypay=0;
      }
    }
    const total=yearly.reduce((s,row)=>s+row.payments,0);
    return {emi,total,interest:total-principal,yearly,n};
  },[principal,rate,years]);

  return <div className="toolUi">
    <div className="fieldGrid batch5Fields">
      {variant==='car'?<>
        <label>Vehicle / on-road price (₹)<input type="number" min="0" step="10000" value={amount} onChange={e=>setAmount(+e.target.value)}/></label>
        <label>Down payment (₹)<input type="number" min="0" step="10000" value={downPayment} onChange={e=>setDownPayment(Math.max(0,+e.target.value))}/></label>
      </>:<label>Loan amount (₹)<input type="number" min="0" step="10000" value={amount} onChange={e=>setAmount(+e.target.value)}/></label>}
      <label>Annual interest rate (%)<input type="number" min="0" step="0.01" value={rate} onChange={e=>setRate(+e.target.value)}/></label>
      <label>Tenure (years)<input type="number" min="0.1" max={variant==='home'?50:20} step="0.5" value={years} onChange={e=>setYears(+e.target.value)}/></label>
    </div>
    {variant==='car'&&<div className="formulaNote"><span>Financed principal</span><code>₹{money(principal)} = price − down payment</code></div>}
    {'error' in result?<div className="toolError">{result.error}</div>:<>
      <div className="metricGrid compactMetrics">
        <MetricCard label="Monthly EMI" value={'₹'+money(result.emi)}/>
        <MetricCard label="Total interest" value={'₹'+money(result.interest)}/>
        <MetricCard label="Total repayment" value={'₹'+money(result.total)}/>
        {variant==='car'&&<MetricCard label="Financed amount" value={'₹'+money(principal)}/>}
      </div>
      <div className="formulaNote"><span>Reducing-balance formula</span><code>EMI = P × r × (1+r)^n ÷ ((1+r)^n − 1)</code></div>
      <div className="toolNote"><ShieldCheck size={15}/><span>{variant==='home'?'This is a constant-rate home-loan scenario. Floating-rate resets, fees, insurance, taxes and unscheduled prepayments can change the real repayment path.':variant==='car'?'The financed amount is modeled as vehicle price minus down payment. Processing fees, insurance, registration and other lender-specific charges are not added automatically.':'Fixed-rate reducing-balance estimate. Fees, insurance, rate resets and unscheduled prepayments are excluded.'}</span></div>
      {(variant==='home'||variant==='generic')&&<>
        <div className="tableToolbar"><div><strong>Amortization overview</strong><small>{result.n} monthly instalments</small></div></div>
        <div className="growthTableWrap"><table className="growthTable"><thead><tr><th>Year</th><th>Payments</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>{result.yearly.map(row=><tr key={row.year}><td>{row.year}</td><td>₹{money(row.payments)}</td><td>₹{money(row.principal)}</td><td>₹{money(row.interest)}</td><td>₹{money(row.balance)}</td></tr>)}</tbody></table></div>
      </>}
    </>}
  </div>;
}

function SipIndiaCalculator(){
  const [monthly,setMonthly]=useState(10000);
  const [annual,setAnnual]=useState(12);
  const [years,setYears]=useState(10);
  const result=useMemo(()=>{
    const n=Math.max(1,Math.round(years*12));
    const r=annual/12/100;
    const future=r===0?monthly*n:monthly*((1+r)**n-1)/r*(1+r);
    const invested=monthly*n;
    const rows=[];
    for(let year=1;year<=Math.ceil(n/12);year++){
      const months=Math.min(n,year*12);
      const fv=r===0?monthly*months:monthly*((1+r)**months-1)/r*(1+r);
      const inv=monthly*months;
      rows.push({year,invested:inv,value:fv,growth:fv-inv});
    }
    return {future,invested,growth:future-invested,rows,n};
  },[monthly,annual,years]);

  return <div className="toolUi">
    <div className="fieldGrid">
      <label>Monthly SIP (₹)<input type="number" min="0" step="500" value={monthly} onChange={e=>setMonthly(Math.max(0,+e.target.value))}/></label>
      <label>Expected annual return (%)<input type="number" step="0.1" value={annual} onChange={e=>setAnnual(+e.target.value)}/></label>
      <label>Investment period (years)<input type="number" min="0.1" max="60" step="0.5" value={years} onChange={e=>setYears(+e.target.value)}/></label>
    </div>
    <div className="metricGrid compactMetrics">
      <MetricCard label="Invested amount" value={'₹'+money(result.invested)}/>
      <MetricCard label="Estimated growth" value={'₹'+money(result.growth)}/>
      <MetricCard label="Projected value" value={'₹'+money(result.future)}/>
    </div>
    <div className="formulaNote"><span>Model</span><code>Monthly contribution · compounded scenario · contribution at period start</code></div>
    <div className="toolNote"><ShieldCheck size={15}/><span>Expected return is a planning assumption, not a guaranteed mutual-fund return. This projection excludes taxes, expense ratios, exit loads and real market volatility.</span></div>
    <div className="growthTableWrap"><table className="growthTable"><thead><tr><th>Year</th><th>Invested</th><th>Estimated growth</th><th>Projected value</th></tr></thead><tbody>{result.rows.map(row=><tr key={row.year}><td>{row.year}</td><td>₹{money(row.invested)}</td><td>₹{money(row.growth)}</td><td>₹{money(row.value)}</td></tr>)}</tbody></table></div>
  </div>;
}

function FdIndiaCalculator(){
  const [principal,setPrincipal]=useState(100000);
  const [annual,setAnnual]=useState(7);
  const [years,setYears]=useState(3);
  const [frequency,setFrequency]=useState<1|2|4|12>(4);
  const result=useMemo(()=>{
    const maturity=principal*(1+annual/100/frequency)**(frequency*years);
    return {maturity,interest:maturity-principal};
  },[principal,annual,years,frequency]);

  return <div className="toolUi">
    <div className="fieldGrid batch5Fields">
      <label>Deposit amount (₹)<input type="number" min="0" step="1000" value={principal} onChange={e=>setPrincipal(Math.max(0,+e.target.value))}/></label>
      <label>Annual interest rate (%)<input type="number" step="0.01" value={annual} onChange={e=>setAnnual(+e.target.value)}/></label>
      <label>Term (years)<input type="number" min="0.1" max="50" step="0.25" value={years} onChange={e=>setYears(+e.target.value)}/></label>
      <label>Compounding<select value={frequency} onChange={e=>setFrequency(+e.target.value as 1|2|4|12)}><option value={1}>Annually</option><option value={2}>Half-yearly</option><option value={4}>Quarterly</option><option value={12}>Monthly</option></select></label>
    </div>
    <div className="metricGrid compactMetrics">
      <MetricCard label="Maturity value" value={'₹'+money(result.maturity)}/>
      <MetricCard label="Interest earned" value={'₹'+money(result.interest)}/>
      <MetricCard label="Principal" value={'₹'+money(principal)}/>
    </div>
    <div className="formulaNote"><span>Compound model</span><code>A = P × (1 + r/m)^(m×t)</code></div>
    <div className="toolNote"><ShieldCheck size={15}/><span>Use the compounding frequency stated by the actual deposit product. This is a gross mathematical estimate and does not model TDS, tax, premature-withdrawal adjustments or bank-specific rounding.</span></div>
  </div>;
}

function GstIndiaCalculator(){
  const [mode,setMode]=useState<'add'|'remove'>('add');
  const [amount,setAmount]=useState(1000);
  const [rate,setRate]=useState(18);
  const result=useMemo(()=>{
    if(mode==='add'){
      const gst=amount*rate/100;
      return {base:amount,gst,total:amount+gst};
    }
    const base=amount/(1+rate/100);
    return {base,gst:amount-base,total:amount};
  },[mode,amount,rate]);

  return <div className="toolUi">
    <div className="calcModeTabs unitTabs">
      <button className={mode==='add'?'active':''} onClick={()=>setMode('add')}>Add GST</button>
      <button className={mode==='remove'?'active':''} onClick={()=>setMode('remove')}>Remove GST</button>
    </div>
    <div className="fieldGrid calculatorTwoFields">
      <label>{mode==='add'?'Base amount (₹)':'GST-inclusive amount (₹)'}<input type="number" min="0" step="0.01" value={amount} onChange={e=>setAmount(Math.max(0,+e.target.value))}/></label>
      <label>GST rate (%)<input type="number" min="0" step="0.01" value={rate} onChange={e=>setRate(Math.max(0,+e.target.value))}/></label>
    </div>
    <div className="quickPills">{[5,12,18,28].map(v=><button key={v} onClick={()=>setRate(v)}>{v}%</button>)}</div>
    <div className="metricGrid compactMetrics">
      <MetricCard label="Base amount" value={'₹'+money(result.base)}/>
      <MetricCard label="GST amount" value={'₹'+money(result.gst)}/>
      <MetricCard label="GST-inclusive total" value={'₹'+money(result.total)}/>
    </div>
    <div className="formulaNote"><span>{mode==='add'?'Add GST':'Remove GST'}</span><code>{mode==='add'?'GST = Base × rate ÷ 100':'Base = Inclusive total ÷ (1 + rate/100)'}</code></div>
    <div className="toolNote"><ShieldCheck size={15}/><span>The 5%, 12%, 18% and 28% buttons are common presets, not a classification decision. Verify the currently applicable GST rate for the specific goods or services using official CBIC/GST information.</span></div>
  </div>;
}

function CagrCoreCalculator(){
  const [begin,setBegin]=useState(100000);
  const [end,setEnd]=useState(200000);
  const [years,setYears]=useState(5);
  const rate=begin>0&&end>=0&&years>0?((end/begin)**(1/years)-1)*100:null;
  return <div className="toolUi">
    <div className="fieldGrid">
      <label>Beginning value<input type="number" value={begin} onChange={e=>setBegin(+e.target.value)}/></label>
      <label>Ending value<input type="number" value={end} onChange={e=>setEnd(+e.target.value)}/></label>
      <label>Years<input type="number" min="0.01" step="0.1" value={years} onChange={e=>setYears(+e.target.value)}/></label>
    </div>
    <div className="metricGrid compactMetrics"><MetricCard label="CAGR" value={rate===null?'—':rate.toFixed(2)+'%'}/></div>
    <div className="formulaNote"><span>Formula</span><code>CAGR = (Ending ÷ Beginning)^(1 ÷ Years) − 1</code></div>
  </div>;
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
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
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
        <MetricCard label="Next birthday" value={result.birthdayDays===0?'Today':`${money(result.birthdayDays)} days`}/>
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
      return {value:`${((a/b)*100).toFixed(2)}%`,label:'Result',formula:`(${a} ÷ ${b}) × 100`};
    }
    if(mode==='of'){
      return {value:(b*(a/100)).toFixed(2),label:'Result',formula:`${a}% × ${b}`};
    }
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


function LoanCalculator(){
  const [principal,setPrincipal]=useState(25000);
  const [rate,setRate]=useState(7);
  const [term,setTerm]=useState(5);
  const [termUnit,setTermUnit]=useState<'years'|'months'>('years');
  const [tableView,setTableView]=useState<'yearly'|'monthly'>('yearly');

  const result=useMemo(()=>{
    const n=termUnit==='years'?Math.round(term*12):Math.round(term);
    if(principal<=0)return {error:'Enter a loan amount greater than zero.'} as const;
    if(rate<0)return {error:'Interest rate cannot be negative.'} as const;
    if(n<=0)return {error:'Loan term must be greater than zero.'} as const;
    if(n>1200)return {error:'Choose a loan term of 100 years or less.'} as const;

    const r=rate/12/100;
    const payment=r===0?principal/n:principal*r*(1+r)**n/((1+r)**n-1);
    let balance=principal;
    const monthly:{period:number;payment:number;principal:number;interest:number;balance:number}[]=[];
    for(let i=1;i<=n;i++){
      const interest=balance*r;
      const principalPaid=i===n?balance:Math.min(balance,payment-interest);
      const actualPayment=principalPaid+interest;
      balance=Math.max(0,balance-principalPaid);
      monthly.push({period:i,payment:actualPayment,principal:principalPaid,interest,balance});
    }
    const totalRepayment=monthly.reduce((sum,row)=>sum+row.payment,0);
    const totalInterest=monthly.reduce((sum,row)=>sum+row.interest,0);
    const yearly=[];
    for(let i=0;i<monthly.length;i+=12){
      const chunk=monthly.slice(i,i+12);
      yearly.push({
        period:Math.floor(i/12)+1,
        payment:chunk.reduce((s,row)=>s+row.payment,0),
        principal:chunk.reduce((s,row)=>s+row.principal,0),
        interest:chunk.reduce((s,row)=>s+row.interest,0),
        balance:chunk[chunk.length-1].balance
      });
    }
    return {payment,totalRepayment,totalInterest,monthly,yearly,n};
  },[principal,rate,term,termUnit]);

  return <div className="toolUi">
    <div className="fieldGrid batch5Fields">
      <label>Loan amount<input type="number" min="0" step="100" value={principal} onChange={e=>setPrincipal(+e.target.value)}/></label>
      <label>Annual interest rate (%)<input type="number" min="0" step="0.01" value={rate} onChange={e=>setRate(+e.target.value)}/></label>
      <label>Loan term<input type="number" min="1" step="1" value={term} onChange={e=>setTerm(+e.target.value)}/></label>
      <label>Term unit<select value={termUnit} onChange={e=>setTermUnit(e.target.value as 'years'|'months')}><option value="years">Years</option><option value="months">Months</option></select></label>
    </div>
    {'error' in result?<div className="toolError">{result.error}</div>:<>
      <div className="metricGrid compactMetrics">
        <MetricCard label="Monthly payment" value={globalNumber(result.payment)}/>
        <MetricCard label="Total interest" value={globalNumber(result.totalInterest)}/>
        <MetricCard label="Total repayment" value={globalNumber(result.totalRepayment)}/>
      </div>
      <div className="toolNote"><ShieldCheck size={15}/><span>Fixed-rate amortization model. The calculator excludes fees, insurance, taxes, prepayments and variable-rate changes.</span></div>
      <div className="tableToolbar">
        <div><strong>Amortization schedule</strong><small>{result.n} monthly payments</small></div>
        <div className="calcModeTabs tableTabs">
          <button className={tableView==='yearly'?'active':''} onClick={()=>setTableView('yearly')}>Yearly</button>
          <button className={tableView==='monthly'?'active':''} onClick={()=>setTableView('monthly')}>Monthly</button>
        </div>
      </div>
      <div className="growthTableWrap"><table className="growthTable"><thead><tr><th>{tableView==='yearly'?'Year':'Month'}</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>{(tableView==='yearly'?result.yearly:result.monthly).map(row=><tr key={row.period}><td>{row.period}</td><td>{globalNumber(row.payment)}</td><td>{globalNumber(row.principal)}</td><td>{globalNumber(row.interest)}</td><td>{globalNumber(row.balance)}</td></tr>)}</tbody></table></div>
    </>}
  </div>;
}

function RoiCalculator(){
  const [invested,setInvested]=useState(10000);
  const [returned,setReturned]=useState(13500);
  const [years,setYears]=useState(3);

  const result=useMemo(()=>{
    if(invested<=0)return {error:'Initial investment must be greater than zero.'} as const;
    const net=returned-invested;
    const roi=net/invested*100;
    const annualized=years>0&&returned>0?((returned/invested)**(1/years)-1)*100:null;
    return {net,roi,annualized};
  },[invested,returned,years]);

  return <div className="toolUi">
    <div className="fieldGrid">
      <label>Amount invested<input type="number" step="100" value={invested} onChange={e=>setInvested(+e.target.value)}/></label>
      <label>Amount returned<input type="number" step="100" value={returned} onChange={e=>setReturned(+e.target.value)}/></label>
      <label>Duration (years, optional)<input type="number" min="0" step="0.1" value={years} onChange={e=>setYears(+e.target.value)}/></label>
    </div>
    {'error' in result?<div className="toolError">{result.error}</div>:<>
      <div className="metricGrid compactMetrics">
        <MetricCard label="Total ROI" value={result.roi.toFixed(2)+'%'}/>
        <MetricCard label={result.net>=0?'Net gain':'Net loss'} value={globalNumber(Math.abs(result.net))}/>
        <MetricCard label="Annualized ROI" value={result.annualized===null?'—':result.annualized.toFixed(2)+'%'}/>
      </div>
      <div className="formulaNote"><span>Formula</span><code>ROI = (Returned − Invested) ÷ Invested × 100</code></div>
      <div className="toolNote"><ShieldCheck size={15}/><span>Annualized ROI is shown only when duration is above zero and the ending value is positive. This is a mathematical scenario, not investment advice.</span></div>
    </>}
  </div>;
}

function DiscountCalculator(){
  const [mode,setMode]=useState<'percent'|'fixed'>('percent');
  const [price,setPrice]=useState(100);
  const [primary,setPrimary]=useState(20);
  const [secondary,setSecondary]=useState(10);

  const result=useMemo(()=>{
    if(price<=0)return {error:'Enter an original price greater than zero.'} as const;
    const firstSavings=mode==='percent'
      ? price*Math.min(100,Math.max(0,primary))/100
      : Math.min(price,Math.max(0,primary));
    const afterFirst=Math.max(0,price-firstSavings);
    const secondPct=Math.min(100,Math.max(0,secondary));
    const secondSavings=afterFirst*secondPct/100;
    const savings=Math.min(price,firstSavings+secondSavings);
    const finalPrice=Math.max(0,price-savings);
    const effective=savings/price*100;
    return {firstSavings,secondSavings,savings,finalPrice,effective};
  },[mode,price,primary,secondary]);

  return <div className="toolUi">
    <div className="calcModeTabs unitTabs">
      <button className={mode==='percent'?'active':''} onClick={()=>setMode('percent')}>Percentage off</button>
      <button className={mode==='fixed'?'active':''} onClick={()=>setMode('fixed')}>Fixed amount off</button>
    </div>
    <div className="fieldGrid">
      <label>Original price<input type="number" min="0" step="0.01" value={price} onChange={e=>setPrice(+e.target.value)}/></label>
      <label>{mode==='percent'?'Primary discount (%)':'Fixed discount amount'}<input type="number" min="0" step="0.01" value={primary} onChange={e=>setPrimary(+e.target.value)}/></label>
      <label>Extra discount (%)<input type="number" min="0" max="100" step="0.01" value={secondary} onChange={e=>setSecondary(+e.target.value)}/></label>
    </div>
    {mode==='percent'&&<div className="quickPills">{[10,15,20,25,50].map(v=><button key={v} onClick={()=>setPrimary(v)}>{v}% off</button>)}</div>}
    {'error' in result?<div className="toolError">{result.error}</div>:<>
      <div className="metricGrid compactMetrics">
        <MetricCard label="Final price" value={globalNumber(result.finalPrice)}/>
        <MetricCard label="Total savings" value={globalNumber(result.savings)}/>
        <MetricCard label="Effective discount" value={result.effective.toFixed(2)+'%'}/>
      </div>
      <div className="toolNote"><ShieldCheck size={15}/><span>The extra discount is applied sequentially to the already-reduced price. For example, 20% off plus 10% off is an effective 28% discount, not 30%.</span></div>
    </>}
  </div>;
}

function SimpleInterestCalculator(){
  const [principal,setPrincipal]=useState(10000);
  const [rate,setRate]=useState(5);
  const [time,setTime]=useState(2);
  const [unit,setUnit]=useState<'years'|'months'|'days'>('years');
  const [dayBasis,setDayBasis]=useState<365|360>(365);

  const result=useMemo(()=>{
    if(principal<=0)return {error:'Principal must be greater than zero.'} as const;
    if(rate<0)return {error:'Interest rate cannot be negative.'} as const;
    if(time<=0)return {error:'Time period must be greater than zero.'} as const;
    const years=unit==='years'?time:unit==='months'?time/12:time/dayBasis;
    const interest=principal*(rate/100)*years;
    const total=principal+interest;
    const annualInterest=principal*(rate/100);
    return {years,interest,total,annualInterest,monthlyInterest:annualInterest/12,dailyInterest:annualInterest/dayBasis};
  },[principal,rate,time,unit,dayBasis]);

  return <div className="toolUi">
    <div className="fieldGrid batch5Fields">
      <label>Principal amount<input type="number" min="0" step="100" value={principal} onChange={e=>setPrincipal(+e.target.value)}/></label>
      <label>Annual interest rate (%)<input type="number" min="0" step="0.01" value={rate} onChange={e=>setRate(+e.target.value)}/></label>
      <label>Time period<input type="number" min="0" step="0.01" value={time} onChange={e=>setTime(+e.target.value)}/></label>
      <label>Time unit<select value={unit} onChange={e=>setUnit(e.target.value as 'years'|'months'|'days')}><option value="years">Years</option><option value="months">Months</option><option value="days">Days</option></select></label>
      {unit==='days'&&<label>Day-count basis<select value={dayBasis} onChange={e=>setDayBasis(Number(e.target.value) as 365|360)}><option value={365}>365-day year</option><option value={360}>360-day banking year</option></select></label>}
    </div>
    {'error' in result?<div className="toolError">{result.error}</div>:<>
      <div className="metricGrid compactMetrics">
        <MetricCard label="Simple interest" value={globalNumber(result.interest)}/>
        <MetricCard label="Total amount" value={globalNumber(result.total)}/>
        <MetricCard label="Interest / month" value={globalNumber(result.monthlyInterest)}/>
      </div>
      <div className="formulaNote"><span>Formula</span><code>I = P × r × t</code></div>
      <div className="toolNote"><ShieldCheck size={15}/><span>Simple interest is calculated only on the original principal. Day calculations use the selected 365-day or 360-day basis.</span></div>
    </>}
  </div>;
}

function daysInMonth(year:number,month:number){return new Date(Date.UTC(year,month,0)).getUTCDate()}
function addYearsClamped(p:DateParts,years:number):DateParts{
  const y=p.y+years;
  return {y,m:p.m,d:Math.min(p.d,daysInMonth(y,p.m))};
}
function addMonthsClamped(p:DateParts,months:number):DateParts{
  const index=(p.m-1)+months;
  const y=p.y+Math.floor(index/12);
  const m=((index%12)+12)%12+1;
  return {y,m,d:Math.min(p.d,daysInMonth(y,m))};
}
function datePartsFromSerial(serial:number):DateParts{
  const d=new Date(serial*86400000);
  return {y:d.getUTCFullYear(),m:d.getUTCMonth()+1,d:d.getUTCDate()};
}
function calendarDifference(start:DateParts,end:DateParts){
  let years=end.y-start.y;
  let yearAnchor=addYearsClamped(start,years);
  if(dateSerial(yearAnchor)>dateSerial(end)){years--;yearAnchor=addYearsClamped(start,years)}
  let months=(end.y-yearAnchor.y)*12+(end.m-yearAnchor.m);
  let monthAnchor=addMonthsClamped(yearAnchor,months);
  if(dateSerial(monthAnchor)>dateSerial(end)){months--;monthAnchor=addMonthsClamped(yearAnchor,months)}
  const days=dateSerial(end)-dateSerial(monthAnchor);
  return {years,months,days};
}
function businessDaysBetween(startSerial:number,endExclusive:number){
  let count=0;
  for(let s=startSerial;s<endExclusive;s++){
    const day=new Date(s*86400000).getUTCDay();
    if(day!==0&&day!==6)count++;
  }
  return count;
}

function DateDifferenceCalculator(){
  const [startValue,setStartValue]=useState('2026-01-01');
  const [endValue,setEndValue]=useState(localTodayValue);
  const [includeEnd,setIncludeEnd]=useState(false);

  const result=useMemo(()=>{
    const start=parseDateParts(startValue),end=parseDateParts(endValue);
    if(!start||!end)return {error:'Enter two valid dates.'} as const;
    const startSerial=dateSerial(start),endSerial=dateSerial(end);
    if(endSerial<startSerial)return {error:'End date must be on or after the start date.'} as const;
    const endExclusive=endSerial+(includeEnd?1:0);
    const effectiveEnd=datePartsFromSerial(endExclusive);
    const duration=calendarDifference(start,effectiveEnd);
    const totalDays=endExclusive-startSerial;
    const fullWeeks=Math.floor(totalDays/7);
    const remainingDays=totalDays%7;
    const businessDays=businessDaysBetween(startSerial,endExclusive);
    return {duration,totalDays,fullWeeks,remainingDays,businessDays,hours:totalDays*24,minutes:totalDays*1440};
  },[startValue,endValue,includeEnd]);

  return <div className="toolUi">
    <div className="fieldGrid calculatorTwoFields">
      <label>Start date<input type="date" value={startValue} onChange={e=>setStartValue(e.target.value)}/></label>
      <label>End date<input type="date" value={endValue} onChange={e=>setEndValue(e.target.value)}/></label>
    </div>
    <label className="checkControl"><input type="checkbox" checked={includeEnd} onChange={e=>setIncludeEnd(e.target.checked)}/><span>Include end date (+1 day)</span></label>
    {'error' in result?<div className="toolError">{result.error}</div>:<>
      <div className="durationHero"><strong>{result.duration.years} years, {result.duration.months} months, {result.duration.days} days</strong><span>Calendar duration</span></div>
      <div className="metricGrid dateMetricGrid">
        <MetricCard label="Total days" value={globalNumber(result.totalDays)}/>
        <MetricCard label="Weeks + days" value={result.fullWeeks+'w '+result.remainingDays+'d'}/>
        <MetricCard label="Business days" value={globalNumber(result.businessDays)}/>
        <MetricCard label="Total hours" value={globalNumber(result.hours)}/>
      </div>
      <div className="toolNote"><ShieldCheck size={15}/><span>Business days exclude Saturdays and Sundays only. Public holidays vary by country and are not removed automatically.</span></div>
    </>}
  </div>;
}

const statNumber=(n:number)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:6}).format(Number.isFinite(n)?n:0);

function AverageCalculator(){
  const [text,setText]=useState('12, 18, 18, 24, 30');
  const [copied,setCopied]=useState(false);

  const result=useMemo(()=>{
    const trimmed=text.trim();
    if(!trimmed)return {empty:true} as const;
    const tokens=trimmed.split(/[\s,]+/).filter(Boolean);
    const values=tokens.map(Number);
    if(values.some(v=>!Number.isFinite(v)))return {error:'Enter numbers separated by spaces, commas or line breaks.'} as const;
    const sorted=[...values].sort((a,b)=>a-b);
    const count=values.length;
    const sum=values.reduce((s,v)=>s+v,0);
    const mean=sum/count;
    const median=count%2?sorted[(count-1)/2]:(sorted[count/2-1]+sorted[count/2])/2;
    const freq=new Map<number,number>();
    values.forEach(v=>freq.set(v,(freq.get(v)||0)+1));
    const maxFreq=Math.max(...freq.values());
    const modes=maxFreq<=1?[]:[...freq.entries()].filter(([,f])=>f===maxFreq).map(([v])=>v).sort((a,b)=>a-b);
    const min=sorted[0],max=sorted[sorted.length-1],range=max-min;
    return {values,count,sum,mean,median,modes,min,max,range};
  },[text]);

  async function copySummary(){
    if(!('mean' in result))return;
    const stats=result as {mean:number;median:number;modes:number[];range:number;count:number;sum:number;min:number;max:number};
    const summary=[
      'Mean: '+statNumber(stats.mean),
      'Median: '+statNumber(stats.median),
      'Mode: '+(stats.modes.length?stats.modes.map(statNumber).join(', '):'No mode'),
      'Range: '+statNumber(stats.range),
      'Count: '+stats.count,
      'Sum: '+statNumber(stats.sum),
      'Min: '+statNumber(stats.min),
      'Max: '+statNumber(stats.max)
    ].join('\n');
    await navigator.clipboard.writeText(summary);
    setCopied(true);window.setTimeout(()=>setCopied(false),1400);
  }

  return <div className="toolUi">
    <textarea className="textArea statsInput" value={text} onChange={e=>{setText(e.target.value);setCopied(false)}} placeholder="Enter numbers separated by commas, spaces or line breaks…"/>
    {'error' in result?<div className="toolError">{result.error}</div>:'empty' in result?<div className="toolNote"><ShieldCheck size={15}/><span>Enter at least one number to calculate the statistical summary.</span></div>:<>
      <div className="metricGrid statMetricGrid">
        <MetricCard label="Mean" value={statNumber(result.mean)}/>
        <MetricCard label="Median" value={statNumber(result.median)}/>
        <MetricCard label="Mode" value={result.modes.length?result.modes.map(statNumber).join(', '):'No mode'}/>
        <MetricCard label="Range" value={statNumber(result.range)}/>
        <MetricCard label="Count" value={result.count}/>
        <MetricCard label="Sum" value={statNumber(result.sum)}/>
        <MetricCard label="Minimum" value={statNumber(result.min)}/>
        <MetricCard label="Maximum" value={statNumber(result.max)}/>
      </div>
      <button className="secondaryButton summaryCopy" onClick={copySummary}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy statistical summary'}</button>
    </>}
  </div>;
}


function downloadTextFile(name:string,text:string,type='text/plain'){
  const blob=new Blob([text],{type});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=name;a.click();
  window.setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

async function copyPlainText(value:string){
  await navigator.clipboard.writeText(value);
}

function QrCodeGenerator(){
  const [content,setContent]=useState('https://toolmera.com');
  const [size,setSize]=useState(320);
  const [level,setLevel]=useState<'L'|'M'|'Q'|'H'>('M');
  const [foreground,setForeground]=useState('#05070A');
  const [background,setBackground]=useState('#FFFFFF');
  const [margin,setMargin]=useState(2);
  const [svg,setSvg]=useState('');
  const [png,setPng]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [copied,setCopied]=useState(false);

  useEffect(()=>{
    let cancelled=false;
    async function render(){
      if(!content){setSvg('');setPng('');setError('Enter text or a URL to generate a QR code.');return}
      setBusy(true);setError('');
      try{
        const QRCode=await import('qrcode');
        const options={errorCorrectionLevel:level,width:size,margin,color:{dark:foreground,light:background}};
        const [svgOut,pngOut]=await Promise.all([
          QRCode.toString(content,{...options,type:'svg'}),
          QRCode.toDataURL(content,{...options,type:'image/png'})
        ]);
        if(!cancelled){setSvg(svgOut);setPng(pngOut)}
      }catch(e){
        if(!cancelled){setSvg('');setPng('');setError(e instanceof Error?e.message:'Could not generate this QR code.')}
      }finally{if(!cancelled)setBusy(false)}
    }
    render();
    return()=>{cancelled=true};
  },[content,size,level,foreground,background,margin]);

  function downloadSvg(){if(svg)downloadTextFile('toolmera-qr-code.svg',svg,'image/svg+xml')}
  function downloadPng(){
    if(!png)return;
    const a=document.createElement('a');a.href=png;a.download='toolmera-qr-code.png';a.click();
  }
  async function copyImage(){
    if(!png)return;
    try{
      if(typeof ClipboardItem==='undefined')throw new Error('Image clipboard is not supported by this browser.');
      const blob=await (await fetch(png)).blob();
      await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
      setCopied(true);window.setTimeout(()=>setCopied(false),1400);
    }catch(e){setError(e instanceof Error?e.message:'Could not copy the QR image.')}
  }

  return <div className="toolUi">
    <textarea className="textArea qrInput" value={content} onChange={e=>setContent(e.target.value)} placeholder="Enter a URL or text…"/>
    <div className="fieldGrid qrFields">
      <label>Size (px)<input type="number" min="120" max="1000" step="10" value={size} onChange={e=>setSize(Math.max(120,Math.min(1000,+e.target.value||320)))}/></label>
      <label>Error correction<select value={level} onChange={e=>setLevel(e.target.value as 'L'|'M'|'Q'|'H')}><option value="L">Low (L)</option><option value="M">Medium (M)</option><option value="Q">Quartile (Q)</option><option value="H">High (H)</option></select></label>
      <label>Quiet zone<input type="number" min="0" max="8" value={margin} onChange={e=>setMargin(Math.max(0,Math.min(8,+e.target.value||0)))}/></label>
    </div>
    <div className="colorPair">
      <label>Foreground <input type="color" value={foreground} onChange={e=>setForeground(e.target.value)}/><code>{foreground}</code></label>
      <label>Background <input type="color" value={background} onChange={e=>setBackground(e.target.value)}/><code>{background}</code></label>
    </div>
    <div className="qrResult">
      <div className="qrPreview" dangerouslySetInnerHTML={{__html:svg}}/>
      <div>
        <strong>{busy?'Rendering…':'Static QR code ready'}</strong>
        <p>The encoded content is placed directly in the QR matrix. Toolmera does not create a redirect URL for this generator.</p>
        <div className="buttonRow">
          <button className="primaryButton" onClick={downloadPng} disabled={!png}>Download PNG</button>
          <button className="secondaryButton" onClick={downloadSvg} disabled={!svg}>Download SVG</button>
          <button className="secondaryButton" onClick={copyImage} disabled={!png}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy PNG'}</button>
        </div>
      </div>
    </div>
    {error&&<div className="toolError">{error}</div>}
  </div>;
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

  function generate(){
    const qty=Math.max(1,Math.min(1000,Math.round(quantity||1)));
    setQuantity(qty);setValues(Array.from({length:qty},()=>createUuidV4()));setCopied(false);
  }
  useEffect(()=>{generate()},[]);

  const formatted=useMemo(()=>values.map(raw=>{
    let value=upper?raw.toUpperCase():raw.toLowerCase();
    if(!hyphens)value=value.replace(/-/g,'');
    if(wrap==='quotes')value='"'+value+'"';
    if(wrap==='braces')value='{'+value+'}';
    return value;
  }),[values,upper,hyphens,wrap]);
  const output=wrap==='json'?JSON.stringify(formatted.map(v=>v.replace(/^"|"$/g,'')),null,2):formatted.join('\n');

  async function copyAll(){if(!output)return;await copyPlainText(output);setCopied(true);window.setTimeout(()=>setCopied(false),1400)}

  return <div className="toolUi">
    <div className="fieldGrid generatorFields">
      <label>Quantity<input type="number" min="1" max="1000" value={quantity} onChange={e=>setQuantity(+e.target.value)}/></label>
      <label>Letter case<select value={upper?'upper':'lower'} onChange={e=>setUpper(e.target.value==='upper')}><option value="lower">Lowercase</option><option value="upper">Uppercase</option></select></label>
      <label>Wrapping<select value={wrap} onChange={e=>setWrap(e.target.value as typeof wrap)}><option value="none">None</option><option value="quotes">Quotes</option><option value="braces">Braces</option><option value="json">JSON array</option></select></label>
    </div>
    <label className="checkControl"><input type="checkbox" checked={hyphens} onChange={e=>setHyphens(e.target.checked)}/><span>Include standard UUID hyphens</span></label>
    <div className="buttonRow"><button className="primaryButton" onClick={generate}>Generate new UUIDs</button><button className="secondaryButton" onClick={copyAll} disabled={!output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy all'}</button><button className="secondaryButton" onClick={()=>downloadTextFile('toolmera-uuids.txt',output)} disabled={!output}><Download size={15}/> Download TXT</button></div>
    <textarea className="textArea output codeArea uuidOutput" readOnly value={output}/>
    <div className="toolNote"><ShieldCheck size={15}/><span>UUID v4 values are generated locally with the browser cryptographic API. Toolmera does not provide timestamp-based UUID versions on this page.</span></div>
  </div>;
}

const secureRandom53=()=>{
  const a=new Uint32Array(2);crypto.getRandomValues(a);
  return (a[0]&0x1fffff)*4294967296+a[1];
};
function secureRandomInt(min:number,max:number){
  if(!Number.isSafeInteger(min)||!Number.isSafeInteger(max)||max<min)throw new Error('Use safe integer range values.');
  const span=max-min+1;
  if(!Number.isSafeInteger(span)||span<1)throw new Error('The selected integer range is too large.');
  const universe=9007199254740992;
  const limit=Math.floor(universe/span)*span;
  let x=secureRandom53();while(x>=limit)x=secureRandom53();
  return min+(x%span);
}
function secureShuffle<T>(items:T[]){
  const out=[...items];
  for(let i=out.length-1;i>0;i--){const j=secureRandomInt(0,i);[out[i],out[j]]=[out[j],out[i]]}
  return out;
}

function PasswordGenerator(){
  const [length,setLength]=useState(20);
  const [upper,setUpper]=useState(true);
  const [lower,setLower]=useState(true);
  const [digits,setDigits]=useState(true);
  const [symbols,setSymbols]=useState(true);
  const [ambiguous,setAmbiguous]=useState(true);
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [copied,setCopied]=useState(false);

  function generate(){
    const sets=[
      upper?'ABCDEFGHIJKLMNOPQRSTUVWXYZ':'',
      lower?'abcdefghijklmnopqrstuvwxyz':'',
      digits?'0123456789':'',
      symbols?'!@#$%^&*()_+-=[]{}|;:,.<>?':''
    ].filter(Boolean);
    if(!sets.length){setError('Select at least one character type.');setPassword('');return}
    const target=Math.max(8,Math.min(128,Math.round(length||20)));setLength(target);
    const banned=ambiguous?'Il1O0':'';
    const cleanSets=sets.map(set=>[...set].filter(ch=>!banned.includes(ch)).join('')).filter(Boolean);
    const pool=cleanSets.join('');
    if(!pool){setError('The selected rules leave no usable characters.');return}
    const chars:string[]=[];
    cleanSets.forEach(set=>chars.push(set[secureRandomInt(0,set.length-1)]));
    while(chars.length<target)chars.push(pool[secureRandomInt(0,pool.length-1)]);
    setPassword(secureShuffle(chars).join(''));setError('');setCopied(false);
  }
  useEffect(()=>{generate()},[]);

  const poolSize=useMemo(()=>{
    let pool=(upper?'ABCDEFGHIJKLMNOPQRSTUVWXYZ':'')+(lower?'abcdefghijklmnopqrstuvwxyz':'')+(digits?'0123456789':'')+(symbols?'!@#$%^&*()_+-=[]{}|;:,.<>?':'');
    if(ambiguous)pool=[...pool].filter(ch=>!'Il1O0'.includes(ch)).join('');
    return new Set(pool).size;
  },[upper,lower,digits,symbols,ambiguous]);
  const entropy=poolSize>1?length*Math.log2(poolSize):0;
  const strength=entropy>=100?'Very strong':entropy>=70?'Strong':entropy>=50?'Moderate':'Limited';

  async function copyPassword(){if(!password)return;await copyPlainText(password);setCopied(true);window.setTimeout(()=>setCopied(false),1400)}

  return <div className="toolUi">
    <div className="passwordOutput"><code>{password||'—'}</code><button className="copyButton inlineCopy" onClick={copyPassword} disabled={!password}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy'}</button></div>
    <div className="entropyBar"><span>Character-space estimate</span><strong>{entropy.toFixed(0)} bits · {strength}</strong></div>
    <div className="controlRow"><label>Password length <b>{length}</b></label><input type="range" min="8" max="128" value={length} onChange={e=>setLength(+e.target.value)}/><input className="smallNumberInput" type="number" min="8" max="128" value={length} onChange={e=>setLength(+e.target.value)}/></div>
    <div className="toggleGrid">
      <label><input type="checkbox" checked={upper} onChange={e=>setUpper(e.target.checked)}/> Uppercase A–Z</label>
      <label><input type="checkbox" checked={lower} onChange={e=>setLower(e.target.checked)}/> Lowercase a–z</label>
      <label><input type="checkbox" checked={digits} onChange={e=>setDigits(e.target.checked)}/> Digits 0–9</label>
      <label><input type="checkbox" checked={symbols} onChange={e=>setSymbols(e.target.checked)}/> Symbols</label>
      <label><input type="checkbox" checked={ambiguous} onChange={e=>setAmbiguous(e.target.checked)}/> Exclude I, l, 1, O, 0</label>
    </div>
    <button className="primaryButton wide" onClick={generate}>Regenerate password</button>
    {error&&<div className="toolError">{error}</div>}
    <div className="toolNote"><ShieldCheck size={15}/><span>Random choices use the browser Web Crypto API. The entropy number is an estimate of the selected character search space, not a guarantee about account security.</span></div>
  </div>;
}

type RandomMode='integer'|'decimal';
function RandomNumberGenerator(){
  const [min,setMin]=useState(1);
  const [max,setMax]=useState(100);
  const [quantity,setQuantity]=useState(1);
  const [mode,setMode]=useState<RandomMode>('integer');
  const [precision,setPrecision]=useState(2);
  const [unique,setUnique]=useState(false);
  const [sort,setSort]=useState<'none'|'asc'|'desc'>('none');
  const [results,setResults]=useState<number[]>([]);
  const [error,setError]=useState('');
  const [copied,setCopied]=useState(false);

  function generate(){
    try{
      const qty=Math.max(1,Math.min(10000,Math.round(quantity||1)));setQuantity(qty);
      const p=mode==='integer'?0:Math.max(0,Math.min(6,Math.round(precision)));
      const scale=10**p;
      const lo=mode==='integer'?Math.ceil(min):Math.ceil(min*scale);
      const hi=mode==='integer'?Math.floor(max):Math.floor(max*scale);
      if(!Number.isSafeInteger(lo)||!Number.isSafeInteger(hi)||hi<lo)throw new Error('Choose a valid range that can be represented safely.');
      const slots=hi-lo+1;
      if(unique&&qty>slots)throw new Error('Quantity exceeds the available unique values in this range.');
      const ticks:number[]=[];
      if(unique&&slots<=100000){
        const pool=Array.from({length:slots},(_,i)=>lo+i);
        for(let i=0;i<qty;i++){const j=secureRandomInt(i,pool.length-1);[pool[i],pool[j]]=[pool[j],pool[i]];ticks.push(pool[i])}
      }else{
        const seen=new Set<number>();
        while(ticks.length<qty){
          const value=secureRandomInt(lo,hi);
          if(!unique||!seen.has(value)){seen.add(value);ticks.push(value)}
        }
      }
      let out=ticks.map(v=>v/scale);
      if(sort==='asc')out=out.sort((a,b)=>a-b);
      if(sort==='desc')out=out.sort((a,b)=>b-a);
      setResults(out);setError('');setCopied(false);
    }catch(e){setResults([]);setError(e instanceof Error?e.message:'Could not generate this range.')}
  }
  useEffect(()=>{generate()},[]);

  const output=results.map(v=>mode==='decimal'?v.toFixed(precision):String(v)).join('\n');
  async function copyResults(){if(!output)return;await copyPlainText(output);setCopied(true);window.setTimeout(()=>setCopied(false),1400)}

  return <div className="toolUi">
    <div className="calcModeTabs unitTabs"><button className={mode==='integer'?'active':''} onClick={()=>setMode('integer')}>Integers</button><button className={mode==='decimal'?'active':''} onClick={()=>setMode('decimal')}>Decimals</button></div>
    <div className="fieldGrid randomFields">
      <label>Minimum<input type="number" value={min} onChange={e=>setMin(+e.target.value)}/></label>
      <label>Maximum<input type="number" value={max} onChange={e=>setMax(+e.target.value)}/></label>
      <label>Quantity<input type="number" min="1" max="10000" value={quantity} onChange={e=>setQuantity(+e.target.value)}/></label>
      {mode==='decimal'&&<label>Decimal places<select value={precision} onChange={e=>setPrecision(+e.target.value)}>{[1,2,3,4,5,6].map(v=><option key={v} value={v}>{v}</option>)}</select></label>}
      <label>Sort<select value={sort} onChange={e=>setSort(e.target.value as typeof sort)}><option value="none">Random order</option><option value="asc">Ascending</option><option value="desc">Descending</option></select></label>
    </div>
    <label className="checkControl"><input type="checkbox" checked={unique} onChange={e=>setUnique(e.target.checked)}/><span>Unique values only</span></label>
    <div className="buttonRow"><button className="primaryButton" onClick={generate}>Generate</button><button className="secondaryButton" onClick={copyResults} disabled={!output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy results'}</button></div>
    {results.length===1?<div className="singleRandomResult">{mode==='decimal'?results[0].toFixed(precision):results[0]}</div>:<textarea className="textArea output codeArea randomOutput" readOnly value={output}/>}
    {error&&<div className="toolError">{error}</div>}
    <div className="toolNote"><ShieldCheck size={15}/><span>Bounded values use Web Crypto output with rejection sampling to avoid simple modulo bias. This utility is not a certified lottery or regulated drawing system.</span></div>
  </div>;
}

function relativeTime(ms:number){
  const delta=ms-Date.now(),abs=Math.abs(delta);
  const units:[number,string][]=[[86400000,'day'],[3600000,'hour'],[60000,'minute'],[1000,'second']];
  for(const [size,label] of units)if(abs>=size||label==='second'){
    const value=Math.round(abs/size),word=label+(value===1?'':'s');
    return delta>=0?'in '+value+' '+word:value+' '+word+' ago';
  }
  return 'now';
}

function UnixTimestampConverter(){
  const [nowMs,setNowMs]=useState(0);
  const [timestamp,setTimestamp]=useState('');
  const [unit,setUnit]=useState<'auto'|'seconds'|'milliseconds'>('auto');
  const [dateInput,setDateInput]=useState('');
  const [dateMode,setDateMode]=useState<'local'|'utc'>('local');
  const [copied,setCopied]=useState('');

  useEffect(()=>{
    const tick=()=>{
      const now=Date.now();setNowMs(now);
      if(!timestamp)setTimestamp(String(Math.floor(now/1000)));
      if(!dateInput){
        const d=new Date(now),pad=(v:number)=>String(v).padStart(2,'0');
        setDateInput(d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds()));
      }
    };
    tick();const id=window.setInterval(tick,1000);return()=>window.clearInterval(id);
  },[]);

  const parsed=useMemo(()=>{
    const raw=timestamp.trim();if(!raw)return {error:'Enter a Unix timestamp.'} as const;
    const n=Number(raw);if(!Number.isFinite(n))return {error:'Timestamp must be numeric.'} as const;
    const detected=unit==='auto'?(Math.abs(n)>=1e11?'milliseconds':'seconds'):unit;
    const ms=detected==='seconds'?n*1000:n;
    const d=new Date(ms);if(!Number.isFinite(d.getTime()))return {error:'This timestamp is outside the supported JavaScript Date range.'} as const;
    return {date:d,ms,detected};
  },[timestamp,unit]);

  const reverse=useMemo(()=>{
    if(!dateInput)return null;
    const localDate=dateMode==='local'?new Date(dateInput):null;
    let ms:number;
    if(dateMode==='local')ms=localDate!.getTime();
    else{
      const m=dateInput.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
      if(!m)return null;
      ms=Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0));
    }
    return Number.isFinite(ms)?{ms,seconds:Math.floor(ms/1000)}:null;
  },[dateInput,dateMode]);

  async function copyValue(key:string,value:string){await copyPlainText(value);setCopied(key);window.setTimeout(()=>setCopied(''),1200)}
  const zone=typeof Intl!=='undefined'?Intl.DateTimeFormat().resolvedOptions().timeZone:'Local time';

  return <div className="toolUi">
    <div className="epochNow">
      <div><span>Current Unix seconds</span><strong>{nowMs?Math.floor(nowMs/1000):'—'}</strong><button onClick={()=>copyValue('now-sec',String(Math.floor(nowMs/1000)))}>{copied==='now-sec'?<Check size={14}/>:<Copy size={14}/>}</button></div>
      <div><span>Current milliseconds</span><strong>{nowMs||'—'}</strong><button onClick={()=>copyValue('now-ms',String(nowMs))}>{copied==='now-ms'?<Check size={14}/>:<Copy size={14}/>}</button></div>
    </div>
    <div className="toolSubsection">
      <h3>Timestamp → Date</h3>
      <div className="fieldGrid calculatorTwoFields">
        <label>Unix timestamp<input inputMode="numeric" value={timestamp} onChange={e=>setTimestamp(e.target.value)}/></label>
        <label>Unit<select value={unit} onChange={e=>setUnit(e.target.value as typeof unit)}><option value="auto">Auto detect</option><option value="seconds">Seconds</option><option value="milliseconds">Milliseconds</option></select></label>
      </div>
      {'error' in parsed?<div className="toolError">{parsed.error}</div>:<div className="epochOutputs">
        <div><span>Detected</span><strong>{parsed.detected}</strong></div>
        <div><span>UTC</span><strong>{parsed.date.toUTCString()}</strong><button onClick={()=>copyValue('utc',parsed.date.toUTCString())}>{copied==='utc'?<Check size={14}/>:<Copy size={14}/>}</button></div>
        <div><span>Local · {zone}</span><strong>{parsed.date.toLocaleString()}</strong><button onClick={()=>copyValue('local',parsed.date.toLocaleString())}>{copied==='local'?<Check size={14}/>:<Copy size={14}/>}</button></div>
        <div><span>ISO 8601</span><strong>{parsed.date.toISOString()}</strong><button onClick={()=>copyValue('iso',parsed.date.toISOString())}>{copied==='iso'?<Check size={14}/>:<Copy size={14}/>}</button></div>
        <div><span>Relative</span><strong>{relativeTime(parsed.ms)}</strong></div>
      </div>}
    </div>
    <div className="toolSubsection">
      <h3>Date → Timestamp</h3>
      <div className="calcModeTabs unitTabs"><button className={dateMode==='local'?'active':''} onClick={()=>setDateMode('local')}>Local time</button><button className={dateMode==='utc'?'active':''} onClick={()=>setDateMode('utc')}>UTC</button></div>
      <input className="dateTimeInput" type="datetime-local" step="1" value={dateInput} onChange={e=>setDateInput(e.target.value)}/>
      {reverse&&<div className="metricGrid calculatorTwoFields"><MetricCard label="Unix seconds" value={String(reverse.seconds)}/><MetricCard label="Milliseconds" value={String(reverse.ms)}/></div>}
    </div>
    <div className="toolNote"><ShieldCheck size={15}/><span>Unix time represents an instant relative to 1970-01-01T00:00:00Z. Local display uses your browser&apos;s current timezone rules.</span></div>
  </div>;
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
    {id:'kg',label:'Kilogram (kg)',factor:1},
    {id:'g',label:'Gram (g)',factor:.001},
    {id:'mg',label:'Milligram (mg)',factor:.000001},
    {id:'lb',label:'Pound (lb)',factor:.45359237},
    {id:'oz',label:'Ounce (oz)',factor:.028349523125},
    {id:'st',label:'Stone (st)',factor:6.35029318},
    {id:'t',label:'Metric tonne (t)',factor:1000},
  ];
  return <MatrixUnitConverter units={units} defaultFrom="kg" defaultTo="lb" note="Pound and ounce values use international avoirdupois definitions; precious-metal troy ounces are not included."/>;
}

function AreaConverter(){
  const units:MatrixUnit[]=[
    {id:'m2',label:'Square meter (m²)',factor:1},
    {id:'km2',label:'Square kilometer (km²)',factor:1000000},
    {id:'cm2',label:'Square centimeter (cm²)',factor:.0001},
    {id:'ft2',label:'Square foot (ft²)',factor:.09290304},
    {id:'yd2',label:'Square yard (yd²)',factor:.83612736},
    {id:'mi2',label:'Square mile (mi²)',factor:2589988.110336},
    {id:'acre',label:'Acre (ac)',factor:4046.8564224},
    {id:'ha',label:'Hectare (ha)',factor:10000},
  ];
  return <MatrixUnitConverter units={units} defaultFrom="acre" defaultTo="ft2" note="Area conversion uses international units. Linear lengths cannot be converted directly into area without a second dimension."/>;
}

function VolumeConverter(){
  const units:MatrixUnit[]=[
    {id:'ml',label:'Milliliter (mL)',factor:.001},
    {id:'l',label:'Liter (L)',factor:1},
    {id:'m3',label:'Cubic meter (m³)',factor:1000},
    {id:'us-tsp',label:'US teaspoon',factor:.00492892159375},
    {id:'us-tbsp',label:'US tablespoon',factor:.01478676478125},
    {id:'us-floz',label:'US fluid ounce',factor:.0295735295625},
    {id:'us-cup',label:'US customary cup',factor:.2365882365},
    {id:'us-pint',label:'US liquid pint',factor:.473176473},
    {id:'us-quart',label:'US liquid quart',factor:.946352946},
    {id:'us-gallon',label:'US liquid gallon',factor:3.785411784},
    {id:'imp-floz',label:'Imperial fluid ounce',factor:.0284130625},
    {id:'imp-pint',label:'Imperial pint',factor:.56826125},
    {id:'imp-quart',label:'Imperial quart',factor:1.1365225},
    {id:'imp-gallon',label:'Imperial gallon',factor:4.54609},
  ];
  return <MatrixUnitConverter units={units} defaultFrom="l" defaultTo="us-gallon" note="US customary and UK Imperial gallons, pints and fluid ounces are different units and are labeled separately here."/>;
}

function UnitConverter({temperature=false}:{temperature?:boolean}){
  const [v,setV]=useState(1);
  const [from,setFrom]=useState(temperature?'c':'m');
  const [to,setTo]=useState(temperature?'f':'ft');

  const lengthUnits=[
    {id:'m',label:'Meter (m)',factor:1},
    {id:'km',label:'Kilometer (km)',factor:1000},
    {id:'cm',label:'Centimeter (cm)',factor:.01},
    {id:'mm',label:'Millimeter (mm)',factor:.001},
    {id:'ft',label:'Foot (ft)',factor:.3048},
    {id:'in',label:'Inch (in)',factor:.0254},
    {id:'yd',label:'Yard (yd)',factor:.9144},
    {id:'mi',label:'Mile (mi)',factor:1609.344},
  ];
  const tempUnits=[
    {id:'c',label:'Celsius (°C)'},
    {id:'f',label:'Fahrenheit (°F)'},
    {id:'k',label:'Kelvin (K)'},
  ];
  const units=temperature?tempUnits:lengthUnits;

  const calculation=useMemo(()=>{
    if(temperature){
      const celsius=from==='c'?v:from==='f'?(v-32)*5/9:v-273.15;
      if(celsius < -273.15-1e-10) return {invalid:true,value:0};
      const result=to==='c'?celsius:to==='f'?celsius*9/5+32:celsius+273.15;
      return {invalid:false,value:result};
    }
    const meter=Object.fromEntries(lengthUnits.map(u=>[u.id,u.factor])) as Record<string,number>;
    return {invalid:false,value:v*meter[from]/meter[to]};
  },[v,from,to,temperature]);

  const quickLength=[
    {label:'in → cm',from:'in',to:'cm'},
    {label:'ft → m',from:'ft',to:'m'},
    {label:'mi → km',from:'mi',to:'km'},
    {label:'yd → m',from:'yd',to:'m'},
  ];
  const quickTemp=[
    {label:'Freezing',value:0,from:'c',to:'f'},
    {label:'Body 37°C',value:37,from:'c',to:'f'},
    {label:'Boiling',value:100,from:'c',to:'f'},
    {label:'−40°',value:-40,from:'c',to:'f'},
  ];
  const quickItems:{label:string;from:string;to:string;value?:number}[]=temperature?quickTemp:quickLength;

  return <div className="toolUi">
    <div className="fieldGrid">
      <label>Value<input type="number" value={v} onChange={e=>setV(+e.target.value)}/></label>
      <label>From<select value={from} onChange={e=>setFrom(e.target.value)}>{units.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}</select></label>
      <label>To<select value={to} onChange={e=>setTo(e.target.value)}>{units.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}</select></label>
    </div>

    <div className="quickPills">
      {quickItems.map(item=><button key={item.label} onClick={()=>{
        if(item.value!==undefined)setV(item.value);
        setFrom(item.from);setTo(item.to);
      }}>{item.label}</button>)}
    </div>

    {calculation.invalid
      ? <div className="toolError">That value is below absolute zero. Physical temperatures cannot be lower than 0 K (−273.15 °C / −459.67 °F).</div>
      : <MetricCard label="Converted value" value={Number(calculation.value.toFixed(6)).toString()}/>
    }
  </div>;
}

function countWords(text:string){
  if(!text.trim())return 0;
  const Segmenter=(Intl as typeof Intl & {Segmenter?:new(...args:any[])=>any}).Segmenter;
  if(Segmenter){
    const segmenter=new Segmenter(undefined,{granularity:'word'});
    return Array.from(segmenter.segment(text)).filter((s:any)=>s.isWordLike).length;
  }
  return text.trim().split(/\s+/).length;
}

function countSentences(text:string){
  if(!text.trim())return 0;
  const Segmenter=(Intl as typeof Intl & {Segmenter?:new(...args:any[])=>any}).Segmenter;
  if(Segmenter){
    const segmenter=new Segmenter(undefined,{granularity:'sentence'});
    return Array.from(segmenter.segment(text)).filter((s:any)=>s.segment.trim()).length;
  }
  return text.split(/[.!?]+/).filter(s=>s.trim()).length;
}

function WordCounter(){
  const [text,setText]=useState('');
  const words=useMemo(()=>countWords(text),[text]);
  const chars=useMemo(()=>Array.from(text).length,[text]);
  const charsNoSpaces=useMemo(()=>Array.from(text.replace(/\s/g,'')).length,[text]);
  const sentences=useMemo(()=>countSentences(text),[text]);
  const paragraphs=useMemo(()=>text.trim()?text.trim().split(/\n\s*\n+/).filter(p=>p.trim()).length:0,[text]);
  const reading=words?Math.max(1,Math.ceil(words/220)):0;

  return <div className="toolUi">
    <textarea className="textArea" value={text} onChange={e=>setText(e.target.value)} placeholder="Paste or type here…"/>
    <div className="metricGrid textMetricGrid">
      <MetricCard label="Words" value={words}/>
      <MetricCard label="Characters" value={chars}/>
      <MetricCard label="No spaces" value={charsNoSpaces}/>
      <MetricCard label="Sentences" value={sentences}/>
      <MetricCard label="Paragraphs" value={paragraphs}/>
      <MetricCard label="Reading time" value={reading} suffix=" min"/>
    </div>
    <div className="toolNote"><ShieldCheck size={15}/><span>Reading time uses an estimated 220 words per minute. Sentence and word segmentation use the browser&apos;s language-aware segmenter when available.</span></div>
  </div>;
}

function normalizeCaseWords(text:string){
  return text
    .replace(/([a-z0-9])([A-Z])/g,'$1 $2')
    .trim()
    .split(/[\s_-]+/)
    .map(w=>w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,''))
    .filter(Boolean);
}

function simpleTitleCase(text:string){
  return text.toLocaleLowerCase().replace(/\b(\p{L})/gu,(m)=>m.toLocaleUpperCase());
}

function sentenceCase(text:string){
  const lower=text.toLocaleLowerCase();
  return lower.replace(/(^|[.!?]\s+)(\p{L})/gu,(_,prefix,letter)=>prefix+letter.toLocaleUpperCase());
}

function CaseConverter(){
  const [text,setText]=useState('');
  const [output,setOutput]=useState('');
  const [copied,setCopied]=useState(false);

  function action(type:string){
    const words=normalizeCaseWords(text);
    if(type==='upper')setOutput(text.toLocaleUpperCase());
    if(type==='lower')setOutput(text.toLocaleLowerCase());
    if(type==='title')setOutput(simpleTitleCase(text));
    if(type==='sentence')setOutput(sentenceCase(text));
    if(type==='camel')setOutput(words.map((w,i)=>i===0?w.toLocaleLowerCase():w.charAt(0).toLocaleUpperCase()+w.slice(1).toLocaleLowerCase()).join(''));
    if(type==='pascal')setOutput(words.map(w=>w.charAt(0).toLocaleUpperCase()+w.slice(1).toLocaleLowerCase()).join(''));
    if(type==='snake')setOutput(words.map(w=>w.toLocaleLowerCase()).join('_'));
    if(type==='kebab')setOutput(words.map(w=>w.toLocaleLowerCase()).join('-'));
    if(type==='constant')setOutput(words.map(w=>w.toLocaleUpperCase()).join('_'));
    setCopied(false);
  }

  async function copy(){
    if(!output)return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(()=>setCopied(false),1400);
  }

  return <div className="toolUi">
    <textarea className="textArea" value={text} onChange={e=>setText(e.target.value)} placeholder="Paste or type here…"/>
    <div className="buttonRow caseButtons">
      <button className="secondaryButton" onClick={()=>action('upper')}>UPPERCASE</button>
      <button className="secondaryButton" onClick={()=>action('lower')}>lowercase</button>
      <button className="secondaryButton" onClick={()=>action('title')}>Simple Title Case</button>
      <button className="secondaryButton" onClick={()=>action('sentence')}>Sentence case</button>
      <button className="secondaryButton" onClick={()=>action('camel')}>camelCase</button>
      <button className="secondaryButton" onClick={()=>action('pascal')}>PascalCase</button>
      <button className="secondaryButton" onClick={()=>action('snake')}>snake_case</button>
      <button className="secondaryButton" onClick={()=>action('kebab')}>kebab-case</button>
      <button className="secondaryButton" onClick={()=>action('constant')}>CONSTANT_CASE</button>
    </div>
    <div className="outputWrap">
      <textarea className="textArea output" readOnly value={output} placeholder="Result…"/>
      <button className="copyButton" onClick={copy} disabled={!output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy'}</button>
    </div>
    <div className="toolNote"><ShieldCheck size={15}/><span>“Simple Title Case” capitalizes every word. It does not apply AP, Chicago, APA or other editorial minor-word rules.</span></div>
  </div>;
}

function jsonErrorDetail(message:string,input:string){
  const match=message.match(/position\s+(\d+)/i);
  if(!match)return message;
  const pos=Number(match[1]);
  const before=input.slice(0,pos);
  const line=before.split('\n').length;
  const col=before.length-before.lastIndexOf('\n');
  return `${message} · line ${line}, column ${col}`;
}

function JsonFormatter(){
  const [text,setText]=useState('');
  const [output,setOutput]=useState('');
  const [indent,setIndent]=useState<'2'|'4'|'tab'>('2');
  const [status,setStatus]=useState<'idle'|'valid'|'invalid'>('idle');
  const [copied,setCopied]=useState(false);

  function run(minify=false){
    try{
      const obj=JSON.parse(text);
      const spacing=minify?undefined:indent==='tab'?'\t':Number(indent);
      setOutput(JSON.stringify(obj,null,spacing));
      setStatus('valid');
    }catch(e){
      setOutput(`Invalid JSON: ${jsonErrorDetail((e as Error).message,text)}`);
      setStatus('invalid');
    }
    setCopied(false);
  }

  async function copy(){
    if(!output)return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(()=>setCopied(false),1400);
  }

  return <div className="toolUi">
    <textarea className="textArea codeArea" value={text} onChange={e=>{setText(e.target.value);setStatus('idle')}} placeholder={'{"name":"Toolmera","fast":true}'}/>
    <div className="jsonControls">
      <div className="buttonRow">
        <button className="primaryButton" onClick={()=>run(false)}>Format JSON</button>
        <button className="secondaryButton" onClick={()=>run(true)}>Minify</button>
      </div>
      <label>Indentation<select value={indent} onChange={e=>setIndent(e.target.value as '2'|'4'|'tab')}><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tabs</option></select></label>
    </div>
    {status!=='idle'&&<div className={`validationPill ${status}`}>{status==='valid'?'Valid JSON':'Invalid JSON'}</div>}
    <div className="outputWrap">
      <textarea className="textArea output codeArea" readOnly value={output} placeholder="Formatted or minified JSON appears here…"/>
      <button className="copyButton" onClick={copy} disabled={!output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy'}</button>
    </div>
  </div>;
}

function bytesToBase64(bytes:Uint8Array){
  let binary='';
  const chunk=0x8000;
  for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode(...bytes.subarray(i,i+chunk));
  return btoa(binary);
}

function base64ToBytes(value:string){
  const normalized=value.replace(/\s+/g,'');
  const binary=atob(normalized);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return bytes;
}

function Base64Tool(){
  const [text,setText]=useState('');
  const [output,setOutput]=useState('');
  const [mode,setMode]=useState<'standard'|'url'>('standard');
  const [error,setError]=useState('');
  const [copied,setCopied]=useState(false);

  function encode(){
    try{
      let encoded=bytesToBase64(new TextEncoder().encode(text));
      if(mode==='url')encoded=encoded.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
      setOutput(encoded);setError('');
    }catch{setError('Could not encode this text.');setOutput('')}
    setCopied(false);
  }

  function decode(){
    try{
      let input=text.trim();
      if(mode==='url'){
        input=input.replace(/-/g,'+').replace(/_/g,'/');
        input+='='.repeat((4-input.length%4)%4);
      }
      const decoded=new TextDecoder('utf-8',{fatal:true}).decode(base64ToBytes(input));
      setOutput(decoded);setError('');
    }catch{setError('Invalid Base64 or the decoded bytes are not valid UTF-8 text.');setOutput('')}
    setCopied(false);
  }

  async function copy(){
    if(!output)return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(()=>setCopied(false),1400);
  }

  return <div className="toolUi">
    <div className="calcModeTabs unitTabs">
      <button className={mode==='standard'?'active':''} onClick={()=>setMode('standard')}>Standard Base64</button>
      <button className={mode==='url'?'active':''} onClick={()=>setMode('url')}>Base64URL</button>
    </div>
    <textarea className="textArea codeArea" value={text} onChange={e=>setText(e.target.value)} placeholder="Enter text or Base64…"/>
    <div className="buttonRow">
      <button className="primaryButton" onClick={encode}>Encode</button>
      <button className="secondaryButton" onClick={decode}>Decode</button>
    </div>
    {error&&<div className="toolError">{error}</div>}
    <div className="outputWrap">
      <textarea className="textArea output codeArea" readOnly value={output} placeholder="Result…"/>
      <button className="copyButton" onClick={copy} disabled={!output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy'}</button>
    </div>
    <div className="toolNote"><ShieldCheck size={15}/><span>Base64 is an encoding format, not encryption. Do not use it by itself to protect secrets or passwords.</span></div>
  </div>;
}


function SpeedConverter(){
  const units:MatrixUnit[]=[
    {id:'ms',label:'Meter per second (m/s)',factor:1},
    {id:'kmh',label:'Kilometer per hour (km/h)',factor:1/3.6},
    {id:'mph',label:'Mile per hour (mph)',factor:.44704},
    {id:'fts',label:'Foot per second (ft/s)',factor:.3048},
    {id:'knot',label:'Knot (kn)',factor:.5144444444444445},
  ];
  return <MatrixUnitConverter units={units} defaultFrom="kmh" defaultTo="mph" note="Knots use the international nautical mile definition: 1 knot = 1 nautical mile per hour = 0.514444… m/s."/>;
}

function DataStorageConverter(){
  const [mode,setMode]=useState<'decimal'|'binary'>('decimal');
  const [value,setValue]=useState(1);
  const [from,setFrom]=useState('GB');
  const [to,setTo]=useState('MB');
  const [copied,setCopied]=useState('');
  const units=useMemo(()=>mode==='decimal'?[
    {id:'B',label:'Byte (B)',factor:1},
    {id:'KB',label:'Kilobyte (KB)',factor:1e3},
    {id:'MB',label:'Megabyte (MB)',factor:1e6},
    {id:'GB',label:'Gigabyte (GB)',factor:1e9},
    {id:'TB',label:'Terabyte (TB)',factor:1e12},
    {id:'PB',label:'Petabyte (PB)',factor:1e15},
  ]:[
    {id:'B',label:'Byte (B)',factor:1},
    {id:'KiB',label:'Kibibyte (KiB)',factor:1024},
    {id:'MiB',label:'Mebibyte (MiB)',factor:1024**2},
    {id:'GiB',label:'Gibibyte (GiB)',factor:1024**3},
    {id:'TiB',label:'Tebibyte (TiB)',factor:1024**4},
    {id:'PiB',label:'Pebibyte (PiB)',factor:1024**5},
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
function hexToRgbValue(hex:string):Rgb|null{
  let v=hex.trim().replace(/^#/,'');
  if(/^[0-9a-f]{3}$/i.test(v))v=v.split('').map(ch=>ch+ch).join('');
  if(!/^[0-9a-f]{6}$/i.test(v))return null;
  return {r:parseInt(v.slice(0,2),16),g:parseInt(v.slice(2,4),16),b:parseInt(v.slice(4,6),16)};
}
function rgbToHexValue({r,g,b}:Rgb){return '#'+[r,g,b].map(v=>clamp255(v).toString(16).padStart(2,'0')).join('').toUpperCase()}
function rgbToHslValue({r,g,b}:Rgb):Hsl{
  const rn=r/255,gn=g/255,bn=b/255,max=Math.max(rn,gn,bn),min=Math.min(rn,gn,bn);
  let h=0,s=0;const l=(max+min)/2,d=max-min;
  if(d){s=d/(1-Math.abs(2*l-1));if(max===rn)h=60*(((gn-bn)/d)%6);else if(max===gn)h=60*((bn-rn)/d+2);else h=60*((rn-gn)/d+4)}
  return {h:normalizeHue(h),s:s*100,l:l*100};
}
function hslToRgbValue({h,s,l}:Hsl):Rgb{
  const hue=normalizeHue(h),sat=Math.max(0,Math.min(100,s))/100,light=Math.max(0,Math.min(100,l))/100;
  const ch=(1-Math.abs(2*light-1))*sat,x=ch*(1-Math.abs((hue/60)%2-1)),m=light-ch/2;
  let rp=0,gp=0,bp=0;
  if(hue<60){rp=ch;gp=x}else if(hue<120){rp=x;gp=ch}else if(hue<180){gp=ch;bp=x}else if(hue<240){gp=x;bp=ch}else if(hue<300){rp=x;bp=ch}else{rp=ch;bp=x}
  return {r:(rp+m)*255,g:(gp+m)*255,b:(bp+m)*255};
}
function ColorConverter(){
  const [mode,setMode]=useState<'hex'|'rgb'|'hsl'>('hex');
  const [hex,setHex]=useState('#2F80FF');
  const [r,setR]=useState(47),[g,setG]=useState(128),[b,setB]=useState(255);
  const [h,setH]=useState(214),[s,setS]=useState(100),[l,setL]=useState(59);
  const [copied,setCopied]=useState('');
  function currentRgb():Rgb|null{
    if(mode==='hex')return hexToRgbValue(hex);
    if(mode==='rgb')return [r,g,b].some(v=>!Number.isFinite(v)||v<0||v>255)?null:{r,g,b};
    return !Number.isFinite(h)||!Number.isFinite(s)||!Number.isFinite(l)||s<0||s>100||l<0||l>100?null:hslToRgbValue({h,s,l});
  }
  const rgb=currentRgb();
  const outputs=rgb?(()=>{const hv=rgbToHexValue(rgb),hs=rgbToHslValue(rgb);return {hex:hv,rgb:'rgb('+clamp255(rgb.r)+', '+clamp255(rgb.g)+', '+clamp255(rgb.b)+')',hsl:'hsl('+Math.round(hs.h)+', '+Math.round(hs.s)+'%, '+Math.round(hs.l)+'%)'}})():null;
  function sync(next:'hex'|'rgb'|'hsl'){
    if(outputs&&rgb){const hs=rgbToHslValue(rgb);setHex(outputs.hex);setR(clamp255(rgb.r));setG(clamp255(rgb.g));setB(clamp255(rgb.b));setH(Math.round(hs.h));setS(Math.round(hs.s));setL(Math.round(hs.l))}
    setMode(next);
  }
  async function copy(key:string,value:string){await copyPlainText(value);setCopied(key);window.setTimeout(()=>setCopied(''),1200)}
  return <div className="toolUi">
    <div className="calcModeTabs unitTabs"><button className={mode==='hex'?'active':''} onClick={()=>sync('hex')}>HEX</button><button className={mode==='rgb'?'active':''} onClick={()=>sync('rgb')}>RGB</button><button className={mode==='hsl'?'active':''} onClick={()=>sync('hsl')}>HSL</button></div>
    {mode==='hex'&&<label className="singleField">HEX color<input value={hex} onChange={e=>setHex(e.target.value)} placeholder="#2F80FF"/></label>}
    {mode==='rgb'&&<div className="fieldGrid"><label>Red<input type="number" min="0" max="255" value={r} onChange={e=>setR(+e.target.value)}/></label><label>Green<input type="number" min="0" max="255" value={g} onChange={e=>setG(+e.target.value)}/></label><label>Blue<input type="number" min="0" max="255" value={b} onChange={e=>setB(+e.target.value)}/></label></div>}
    {mode==='hsl'&&<div className="fieldGrid"><label>Hue<input type="number" value={h} onChange={e=>setH(+e.target.value)}/></label><label>Saturation %<input type="number" min="0" max="100" value={s} onChange={e=>setS(+e.target.value)}/></label><label>Lightness %<input type="number" min="0" max="100" value={l} onChange={e=>setL(+e.target.value)}/></label></div>}
    {!outputs?<div className="toolError">Enter a valid {mode.toUpperCase()} color value.</div>:<>
      <div className="colorPreviewLarge" style={{background:outputs.hex}}><span>{outputs.hex}</span></div>
      <div className="conversionMatrix">{([['hex','HEX',outputs.hex],['rgb','RGB',outputs.rgb],['hsl','HSL',outputs.hsl]] as const).map(([key,label,value])=><div key={key}><span>{label}</span><strong>{value}</strong><button onClick={()=>copy(key,value)}>{copied===key?<Check size={14}/>:<Copy size={14}/>}</button></div>)}</div>
    </>}
  </div>;
}

function availableTimeZones(){
  const intl=Intl as typeof Intl & {supportedValuesOf?:(key:'timeZone')=>string[]};
  if(intl.supportedValuesOf){try{return intl.supportedValuesOf('timeZone')}catch{}}
  return ['UTC','America/New_York','America/Los_Angeles','America/Chicago','Europe/London','Europe/Berlin','Europe/Warsaw','Europe/Kyiv','Asia/Kolkata','Asia/Dubai','Asia/Singapore','Asia/Tokyo','Australia/Sydney'];
}
function zoneParts(epoch:number,zone:string){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(epoch));
  const get=(type:string)=>Number(parts.find(p=>p.type===type)?.value||0);
  return {year:get('year'),month:get('month'),day:get('day'),hour:get('hour'),minute:get('minute'),second:get('second')};
}
function wallTimeToEpoch(input:string,zone:string){
  const match=input.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if(!match)return null;
  const targetUtc=Date.UTC(+match[1],+match[2]-1,+match[3],+match[4],+match[5],+(match[6]||0));
  let guess=targetUtc;
  for(let i=0;i<3;i++){const p=zoneParts(guess,zone);const represented=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);guess=targetUtc-(represented-guess)}
  return guess;
}
function TimeZoneConverter(){
  const zones=useMemo(()=>availableTimeZones(),[]);
  const browserZone=typeof Intl!=='undefined'?Intl.DateTimeFormat().resolvedOptions().timeZone:'UTC';
  const [from,setFrom]=useState(browserZone||'UTC');
  const [to,setTo]=useState(browserZone==='America/New_York'?'Europe/London':'America/New_York');
  const [input,setInput]=useState('');
  const [copied,setCopied]=useState('');
  useEffect(()=>{if(input)return;const d=new Date(),pad=(v:number)=>String(v).padStart(2,'0');setInput(d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes()))},[input]);
  const epoch=useMemo(()=>wallTimeToEpoch(input,from),[input,from]);
  const sourceText=epoch!==null?new Intl.DateTimeFormat('en-US',{timeZone:from,dateStyle:'full',timeStyle:'long'}).format(new Date(epoch)):'';
  const targetText=epoch!==null?new Intl.DateTimeFormat('en-US',{timeZone:to,dateStyle:'full',timeStyle:'long'}).format(new Date(epoch)):'';
  async function copy(key:string,value:string){await copyPlainText(value);setCopied(key);window.setTimeout(()=>setCopied(''),1200)}
  return <div className="toolUi">
    <label className="singleField">Date & time in source zone<input type="datetime-local" value={input} onChange={e=>setInput(e.target.value)}/></label>
    <div className="fieldGrid timezoneFields"><label>From<select value={from} onChange={e=>setFrom(e.target.value)}>{zones.map(zone=><option key={zone} value={zone}>{zone}</option>)}</select></label><label>To<select value={to} onChange={e=>setTo(e.target.value)}>{zones.map(zone=><option key={zone} value={zone}>{zone}</option>)}</select></label><button className="secondaryButton matrixSwap" onClick={()=>{setFrom(to);setTo(from)}}><RefreshCw size={15}/> Swap zones</button></div>
    {epoch===null?<div className="toolError">Enter a valid date and time.</div>:<div className="timezoneResults">
      <div><span>Source · {from}</span><strong>{sourceText}</strong><button onClick={()=>copy('source',sourceText)}>{copied==='source'?<Check size={14}/>:<Copy size={14}/>}</button></div>
      <div className="targetZoneResult"><span>Converted · {to}</span><strong>{targetText}</strong><button onClick={()=>copy('target',targetText)}>{copied==='target'?<Check size={14}/>:<Copy size={14}/>}</button></div>
      <div><span>UTC / ISO 8601</span><strong>{new Date(epoch).toISOString()}</strong><button onClick={()=>copy('iso',new Date(epoch).toISOString())}>{copied==='iso'?<Check size={14}/>:<Copy size={14}/>}</button></div>
    </div>}
    <div className="toolNote"><ShieldCheck size={15}/><span>Time-zone rules come from the browser&apos;s IANA/Intl data. Around daylight-saving transitions, some local clock times can be ambiguous or may not exist.</span></div>
  </div>;
}

function UrlEncoderDecoder(){
  const [text,setText]=useState(''),[output,setOutput]=useState('');
  const [scope,setScope]=useState<'component'|'url'>('component');
  const [error,setError]=useState(''),[copied,setCopied]=useState(false);
  function run(action:'encode'|'decode'){try{const result=action==='encode'?(scope==='component'?encodeURIComponent(text):encodeURI(text)):(scope==='component'?decodeURIComponent(text):decodeURI(text));setOutput(result);setError('');setCopied(false)}catch(e){setOutput('');setError(e instanceof Error?e.message:'Could not transform this URL value.')}}
  async function copy(){if(!output)return;await copyPlainText(output);setCopied(true);window.setTimeout(()=>setCopied(false),1200)}
  return <div className="toolUi">
    <div className="calcModeTabs unitTabs"><button className={scope==='component'?'active':''} onClick={()=>setScope('component')}>URL component</button><button className={scope==='url'?'active':''} onClick={()=>setScope('url')}>Complete URL</button></div>
    <textarea className="textArea codeArea" value={text} onChange={e=>setText(e.target.value)} placeholder={scope==='component'?'Search term, path segment or query value…':'https://example.com/path?q=hello world'}/>
    <div className="buttonRow"><button className="primaryButton" onClick={()=>run('encode')}>Encode</button><button className="secondaryButton" onClick={()=>run('decode')}>Decode</button></div>
    {error&&<div className="toolError">{error}</div>}
    <div className="outputWrap"><textarea className="textArea output codeArea" readOnly value={output} placeholder="Encoded or decoded result…"/><button className="copyButton" onClick={copy} disabled={!output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy'}</button></div>
    <div className="toolNote"><ShieldCheck size={15}/><span>Component mode uses encodeURIComponent/decodeURIComponent. Full URL mode keeps URL syntax characters such as : / ? & = available where appropriate.</span></div>
  </div>;
}

function createSlug(text:string,separator:string,preserveUnicode:boolean){
  let value=text.trim().toLocaleLowerCase().normalize('NFKD').replace(/\p{M}+/gu,'');
  if(preserveUnicode)value=value.replace(/[^\p{L}\p{N}]+/gu,separator);
  else value=value.replace(/[^\x00-\x7F]/g,'').replace(/[^a-z0-9]+/g,separator);
  const repeats=separator==='-'?/-+/g:/_+/g;
  const edges=separator==='-'?/^-+|-+$/g:/^_+|_+$/g;
  return value.replace(repeats,separator).replace(edges,'');
}
function SlugGenerator(){
  const [text,setText]=useState(''),[separator,setSeparator]=useState('-'),[preserveUnicode,setPreserveUnicode]=useState(false),[copied,setCopied]=useState(false);
  const output=useMemo(()=>createSlug(text,separator,preserveUnicode),[text,separator,preserveUnicode]);
  async function copy(){if(!output)return;await copyPlainText(output);setCopied(true);window.setTimeout(()=>setCopied(false),1200)}
  return <div className="toolUi">
    <textarea className="textArea" value={text} onChange={e=>setText(e.target.value)} placeholder="Free Online Tools for Faster Everyday Work"/>
    <div className="fieldGrid generatorFields"><label>Separator<select value={separator} onChange={e=>setSeparator(e.target.value)}><option value="-">Hyphen (-)</option><option value="_">Underscore (_)</option></select></label><label className="checkControl slugCheck"><input type="checkbox" checked={preserveUnicode} onChange={e=>setPreserveUnicode(e.target.checked)}/><span>Preserve non-Latin letters</span></label></div>
    <div className="slugOutput"><span>URL slug</span><code>{output||'—'}</code><button className="copyButton" onClick={copy} disabled={!output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy'}</button></div>
    <div className="toolNote"><ShieldCheck size={15}/><span>ASCII mode removes non-Latin characters rather than guessing transliterations. Enable Unicode preservation when you want native-script URL slugs.</span></div>
  </div>;
}

function decodeJwtPart(value:string){
  let normalized=value.replace(/-/g,'+').replace(/_/g,'/');normalized+='='.repeat((4-normalized.length%4)%4);
  return new TextDecoder('utf-8',{fatal:true}).decode(base64ToBytes(normalized));
}
function JwtDecoder(){
  const [token,setToken]=useState(''),[header,setHeader]=useState(''),[payload,setPayload]=useState('');
  const [claims,setClaims]=useState<{exp?:number;iat?:number;nbf?:number}|null>(null);
  const [error,setError]=useState(''),[copied,setCopied]=useState('');
  function decode(){
    try{
      const parts=token.trim().split('.');if(parts.length!==3)throw new Error('A compact JWT should contain three dot-separated parts.');
      const headerObj=JSON.parse(decodeJwtPart(parts[0])),payloadObj=JSON.parse(decodeJwtPart(parts[1]));
      setHeader(JSON.stringify(headerObj,null,2));setPayload(JSON.stringify(payloadObj,null,2));
      setClaims({exp:typeof payloadObj.exp==='number'?payloadObj.exp:undefined,iat:typeof payloadObj.iat==='number'?payloadObj.iat:undefined,nbf:typeof payloadObj.nbf==='number'?payloadObj.nbf:undefined});setError('');setCopied('');
    }catch(e){setHeader('');setPayload('');setClaims(null);setError(e instanceof Error?e.message:'Could not decode this JWT.')}
  }
  async function copy(key:string,value:string){await copyPlainText(value);setCopied(key);window.setTimeout(()=>setCopied(''),1200)}
  const exp=claims?.exp?new Date(claims.exp*1000):null,status=exp?(exp.getTime()<Date.now()?'Expired':'Not expired by exp claim'):'No exp claim';
  return <div className="toolUi">
    <textarea className="textArea codeArea jwtInput" value={token} onChange={e=>setToken(e.target.value)} placeholder="eyJhbGciOi..."/>
    <button className="primaryButton wide" onClick={decode}>Decode JWT</button>
    {error&&<div className="toolError">{error}</div>}
    {header&&payload&&<>
      <div className="jwtStatus"><span>Token timing</span><strong>{status}</strong>{exp&&<small>exp · {exp.toISOString()}</small>}{claims?.iat&&<small>iat · {new Date(claims.iat*1000).toISOString()}</small>}{claims?.nbf&&<small>nbf · {new Date(claims.nbf*1000).toISOString()}</small>}</div>
      <div className="jwtGrid"><div><div className="queueHead"><span>Header</span><button className="copyButton" onClick={()=>copy('header',header)}>{copied==='header'?<Check size={14}/>:<Copy size={14}/>} Copy</button></div><textarea className="textArea output codeArea" readOnly value={header}/></div><div><div className="queueHead"><span>Payload</span><button className="copyButton" onClick={()=>copy('payload',payload)}>{copied==='payload'?<Check size={14}/>:<Copy size={14}/>} Copy</button></div><textarea className="textArea output codeArea" readOnly value={payload}/></div></div>
    </>}
    <div className="toolError jwtWarning"><ShieldCheck size={15}/><span>Decoding is not verification. Toolmera does not validate the JWT signature, issuer, audience or trustworthiness of any claim on this page.</span></div>
  </div>;
}


function graphemeLength(value:string){
  const Segmenter=(Intl as typeof Intl & {Segmenter?:new(...args:any[])=>any}).Segmenter;
  if(Segmenter)return Array.from(new Segmenter(undefined,{granularity:'grapheme'}).segment(value)).length;
  return Array.from(value).length;
}

function CharacterCounter(){
  const [text,setText]=useState('');
  const characters=useMemo(()=>graphemeLength(text),[text]);
  const noWhitespace=useMemo(()=>graphemeLength(text.replace(/\s/gu,'')),[text]);
  const spaces=useMemo(()=>graphemeLength(text.match(/\s/gu)?.join('')||''),[text]);
  const lines=useMemo(()=>text?text.split(/\r\n|\r|\n/).length:0,[text]);
  const words=useMemo(()=>countWords(text),[text]);
  const bytes=useMemo(()=>new TextEncoder().encode(text).length,[text]);
  return <div className="toolUi">
    <textarea className="textArea" value={text} onChange={x=>setText(x.target.value)} placeholder="Paste or type text here…"/>
    <div className="metricGrid textMetricGrid">
      <MetricCard label="Characters" value={characters}/>
      <MetricCard label="No whitespace" value={noWhitespace}/>
      <MetricCard label="Whitespace" value={spaces}/>
      <MetricCard label="Words" value={words}/>
      <MetricCard label="Lines" value={lines}/>
      <MetricCard label="UTF-8 bytes" value={bytes}/>
    </div>
    <div className="toolNote"><ShieldCheck size={15}/><span>Character counting uses Unicode grapheme segmentation when the browser supports it. UTF-8 bytes are a separate storage measurement and can exceed the visible character count.</span></div>
  </div>;
}

function RemoveDuplicateLines(){
  const [text,setText]=useState('');
  const [ignoreCase,setIgnoreCase]=useState(false);
  const [trim,setTrim]=useState(true);
  const [removeBlank,setRemoveBlank]=useState(true);
  const [sort,setSort]=useState<'preserve'|'az'|'za'>('preserve');
  const [copied,setCopied]=useState(false);
  const result=useMemo(()=>{
    const input=text?text.split(/\r\n|\r|\n/):[];
    const seen=new Set<string>();
    const unique:string[]=[];
    for(const raw of input){
      const value=trim?raw.trim():raw;
      if(removeBlank&&!value)continue;
      const key=ignoreCase?value.toLocaleLowerCase():value;
      if(seen.has(key))continue;
      seen.add(key);unique.push(value);
    }
    if(sort!=='preserve'){
      const collator=new Intl.Collator(undefined,{numeric:true,sensitivity:ignoreCase?'base':'variant'});
      unique.sort((a,b)=>sort==='az'?collator.compare(a,b):collator.compare(b,a));
    }
    return {output:unique.join('\n'),inputCount:input.length,uniqueCount:unique.length};
  },[text,ignoreCase,trim,removeBlank,sort]);
  async function copy(){if(!result.output)return;await copyPlainText(result.output);setCopied(true);window.setTimeout(()=>setCopied(false),1200)}
  return <div className="toolUi">
    <textarea className="textArea" value={text} onChange={x=>setText(x.target.value)} placeholder={'apple\nbanana\napple\nAPPLE'}/>
    <div className="fieldGrid generatorFields">
      <label>Order<select value={sort} onChange={x=>setSort(x.target.value as 'preserve'|'az'|'za')}><option value="preserve">Preserve input order</option><option value="az">Sort A–Z</option><option value="za">Sort Z–A</option></select></label>
      <label className="checkControl"><input type="checkbox" checked={ignoreCase} onChange={x=>setIgnoreCase(x.target.checked)}/><span>Ignore case</span></label>
      <label className="checkControl"><input type="checkbox" checked={trim} onChange={x=>setTrim(x.target.checked)}/><span>Trim whitespace</span></label>
      <label className="checkControl"><input type="checkbox" checked={removeBlank} onChange={x=>setRemoveBlank(x.target.checked)}/><span>Remove blank lines</span></label>
    </div>
    <div className="metricGrid textMetricGrid">
      <MetricCard label="Input lines" value={result.inputCount}/>
      <MetricCard label="Unique lines" value={result.uniqueCount}/>
      <MetricCard label="Removed" value={Math.max(0,result.inputCount-result.uniqueCount)}/>
    </div>
    <div className="outputWrap"><textarea className="textArea output" readOnly value={result.output} placeholder="Unique lines appear here…"/><button className="copyButton" onClick={copy} disabled={!result.output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy'}</button></div>
  </div>;
}

function SortLines(){
  const [text,setText]=useState('');
  const [direction,setDirection]=useState<'asc'|'desc'>('asc');
  const [natural,setNatural]=useState(true);
  const [ignoreCase,setIgnoreCase]=useState(true);
  const [removeBlank,setRemoveBlank]=useState(true);
  const [copied,setCopied]=useState(false);
  const output=useMemo(()=>{
    const lines=(text?text.split(/\r\n|\r|\n/):[]).filter(x=>!removeBlank||x.trim());
    const collator=new Intl.Collator(undefined,{numeric:natural,sensitivity:ignoreCase?'base':'variant'});
    return [...lines].sort((a,b)=>direction==='asc'?collator.compare(a,b):collator.compare(b,a)).join('\n');
  },[text,direction,natural,ignoreCase,removeBlank]);
  async function copy(){if(!output)return;await copyPlainText(output);setCopied(true);window.setTimeout(()=>setCopied(false),1200)}
  return <div className="toolUi">
    <textarea className="textArea" value={text} onChange={x=>setText(x.target.value)} placeholder={'file10\nfile2\nfile1'}/>
    <div className="fieldGrid generatorFields">
      <label>Direction<select value={direction} onChange={x=>setDirection(x.target.value as 'asc'|'desc')}><option value="asc">A → Z</option><option value="desc">Z → A</option></select></label>
      <label className="checkControl"><input type="checkbox" checked={natural} onChange={x=>setNatural(x.target.checked)}/><span>Natural numeric sort</span></label>
      <label className="checkControl"><input type="checkbox" checked={ignoreCase} onChange={x=>setIgnoreCase(x.target.checked)}/><span>Ignore case</span></label>
      <label className="checkControl"><input type="checkbox" checked={removeBlank} onChange={x=>setRemoveBlank(x.target.checked)}/><span>Remove blank lines</span></label>
    </div>
    <div className="outputWrap"><textarea className="textArea output" readOnly value={output} placeholder="Sorted lines appear here…"/><button className="copyButton" onClick={copy} disabled={!output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy'}</button></div>
  </div>;
}

type LineDiffItem={type:'same'|'add'|'remove';text:string};
function buildLineDiff(left:string,right:string){
  const a=left.split(/\r\n|\r|\n/),b=right.split(/\r\n|\r|\n/);
  if(a.length>600||b.length>600)throw new Error('For a responsive browser diff, keep each side to 600 lines or fewer.');
  const dp=Array.from({length:a.length+1},()=>new Uint16Array(b.length+1));
  for(let i=a.length-1;i>=0;i--)for(let j=b.length-1;j>=0;j--)dp[i][j]=a[i]===b[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
  const items:LineDiffItem[]=[];let i=0,j=0;
  while(i<a.length&&j<b.length){
    if(a[i]===b[j]){items.push({type:'same',text:a[i]});i++;j++;continue}
    if(dp[i+1][j]>=dp[i][j+1]){items.push({type:'remove',text:a[i]});i++}else{items.push({type:'add',text:b[j]});j++}
  }
  while(i<a.length)items.push({type:'remove',text:a[i++]});
  while(j<b.length)items.push({type:'add',text:b[j++]});
  return items;
}

function TextDiffChecker(){
  const [left,setLeft]=useState(''),[right,setRight]=useState('');
  const result=useMemo(()=>{
    if(!left&&!right)return {output:'',added:0,removed:0,unchanged:0,error:''};
    try{
      const items=buildLineDiff(left,right);
      return {output:items.map(x=>(x.type==='add'?'+ ':x.type==='remove'?'- ':'  ')+x.text).join('\n'),added:items.filter(x=>x.type==='add').length,removed:items.filter(x=>x.type==='remove').length,unchanged:items.filter(x=>x.type==='same').length,error:''};
    }catch(err){return {output:'',added:0,removed:0,unchanged:0,error:err instanceof Error?err.message:'Could not compare these texts.'}}
  },[left,right]);
  const [copied,setCopied]=useState(false);
  async function copy(){if(!result.output)return;await copyPlainText(result.output);setCopied(true);window.setTimeout(()=>setCopied(false),1200)}
  return <div className="toolUi">
    <div className="jwtGrid">
      <div><div className="queueHead"><span>Original</span></div><textarea className="textArea codeArea" value={left} onChange={x=>setLeft(x.target.value)} placeholder="Original text…"/></div>
      <div><div className="queueHead"><span>Changed</span></div><textarea className="textArea codeArea" value={right} onChange={x=>setRight(x.target.value)} placeholder="Changed text…"/></div>
    </div>
    {result.error&&<div className="toolError">{result.error}</div>}
    <div className="metricGrid textMetricGrid"><MetricCard label="Added" value={result.added}/><MetricCard label="Removed" value={result.removed}/><MetricCard label="Unchanged" value={result.unchanged}/></div>
    <div className="outputWrap"><textarea className="textArea output codeArea" readOnly value={result.output} placeholder="+ added, - removed and unchanged lines appear here…"/><button className="copyButton" onClick={copy} disabled={!result.output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy'}</button></div>
    <div className="toolNote"><ShieldCheck size={15}/><span>This is a line-level longest-common-subsequence diff, optimized for pasted text and small configuration files rather than very large repositories.</span></div>
  </div>;
}

function flattenJsonRecord(value:Record<string,unknown>,prefix='',out:Record<string,unknown>={}){
  for(const [key,item] of Object.entries(value)){
    const next=prefix?prefix+'.'+key:key;
    if(item&&typeof item==='object'&&!Array.isArray(item))flattenJsonRecord(item as Record<string,unknown>,next,out);
    else out[next]=item;
  }
  return out;
}
function csvCell(value:unknown,delimiter:string){
  const text=value==null?'':typeof value==='object'?JSON.stringify(value):String(value);
  return (text.includes(delimiter)||/["\r\n]/.test(text))?'"'+text.replace(/"/g,'""')+'"':text;
}

function JsonToCsv(){
  const [text,setText]=useState(''),[delimiter,setDelimiter]=useState(','),[flatten,setFlatten]=useState(true);
  const [output,setOutput]=useState(''),[error,setError]=useState(''),[copied,setCopied]=useState(false);
  function convert(){
    try{
      const parsed=JSON.parse(text);
      const source=Array.isArray(parsed)?parsed:[parsed];
      if(!source.length||source.some(x=>!x||typeof x!=='object'||Array.isArray(x)))throw new Error('Use a JSON object or an array of JSON objects.');
      const rows=(source as Record<string,unknown>[]).map(x=>flatten?flattenJsonRecord(x):x);
      const headers=Array.from(new Set(rows.flatMap(x=>Object.keys(x))));
      const csv=[headers.map(x=>csvCell(x,delimiter)).join(delimiter),...rows.map(row=>headers.map(h=>csvCell(row[h],delimiter)).join(delimiter))].join('\n');
      setOutput(csv);setError('');setCopied(false);
    }catch(err){setOutput('');setError(err instanceof Error?err.message:'Could not convert this JSON.')}
  }
  async function copy(){if(!output)return;await copyPlainText(output);setCopied(true);window.setTimeout(()=>setCopied(false),1200)}
  function download(){
    if(!output)return;
    const url=URL.createObjectURL(new Blob([output],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='toolmera-json.csv';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return <div className="toolUi">
    <textarea className="textArea codeArea" value={text} onChange={x=>setText(x.target.value)} placeholder={'[{"name":"Ada","age":36},{"name":"Grace","age":41}]'}/>
    <div className="fieldGrid generatorFields">
      <label>Delimiter<select value={delimiter} onChange={x=>setDelimiter(x.target.value)}><option value=",">Comma (,)</option><option value=";">Semicolon (;)</option><option value={'\t'}>Tab</option></select></label>
      <label className="checkControl"><input type="checkbox" checked={flatten} onChange={x=>setFlatten(x.target.checked)}/><span>Flatten nested objects</span></label>
    </div>
    <button className="primaryButton wide" onClick={convert}>Convert JSON to CSV</button>
    {error&&<div className="toolError">{error}</div>}
    <div className="outputWrap"><textarea className="textArea output codeArea" readOnly value={output} placeholder="CSV appears here…"/><button className="copyButton" onClick={copy} disabled={!output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy'}</button></div>
    <button className="secondaryButton wide" onClick={download} disabled={!output}><Download size={16}/> Download CSV</button>
  </div>;
}

function prettyXml(xml:string,indent:string){
  const normalized=xml.replace(/>\s*</g,'><').replace(/(>)(<)(\/*)/g,'$1\n$2$3');
  let depth=0;
  return normalized.split('\n').map(raw=>{
    const line=raw.trim();
    if(/^<\//.test(line))depth=Math.max(0,depth-1);
    const out=indent.repeat(depth)+line;
    if(/^<[^!?/][^>]*[^/]?>/.test(line)&&!/<\/[^>]+>\s*$/.test(line)&&!/^<[^>]+\/>/.test(line))depth++;
    return out;
  }).join('\n');
}
function XmlFormatter(){
  const [text,setText]=useState(''),[output,setOutput]=useState(''),[indent,setIndent]=useState<'2'|'4'|'tab'>('2');
  const [error,setError]=useState(''),[copied,setCopied]=useState(false);
  function format(){
    try{
      const doc=new DOMParser().parseFromString(text,'application/xml');
      const parserError=doc.querySelector('parsererror');
      if(parserError)throw new Error((parserError.textContent||'Invalid XML').replace(/\s+/g,' ').slice(0,220));
      const serialized=new XMLSerializer().serializeToString(doc);
      const pad=indent==='tab'?'\t':' '.repeat(Number(indent));
      setOutput(prettyXml(serialized,pad));setError('');setCopied(false);
    }catch(err){setOutput('');setError(err instanceof Error?err.message:'Invalid XML.')}
  }
  async function copy(){if(!output)return;await copyPlainText(output);setCopied(true);window.setTimeout(()=>setCopied(false),1200)}
  return <div className="toolUi">
    <textarea className="textArea codeArea" value={text} onChange={x=>setText(x.target.value)} placeholder={'<root><item id="1">Hello</item></root>'}/>
    <div className="jsonControls"><button className="primaryButton" onClick={format}>Format XML</button><label>Indentation<select value={indent} onChange={x=>setIndent(x.target.value as '2'|'4'|'tab')}><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tabs</option></select></label></div>
    {error&&<div className="toolError">{error}</div>}
    <div className="outputWrap"><textarea className="textArea output codeArea" readOnly value={output} placeholder="Formatted XML appears here…"/><button className="copyButton" onClick={copy} disabled={!output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy'}</button></div>
    <div className="toolNote"><ShieldCheck size={15}/><span>The browser XML parser validates well-formedness. Formatting can normalize serialization details, so review output before replacing whitespace-sensitive XML or signed documents.</span></div>
  </div>;
}

function parseLocalDate(value:string){
  const [y,m,d]=value.split('-').map(Number);
  return y&&m&&d?new Date(y,m-1,d):null;
}
function formatDateValue(date:Date){
  return date.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});
}
function shiftCalendarDate(base:Date,sign:number,years:number,months:number,weeks:number,days:number){
  const d=new Date(base.getFullYear(),base.getMonth(),1);
  const originalDay=base.getDate();
  d.setFullYear(d.getFullYear()+sign*years);
  d.setMonth(d.getMonth()+sign*months);
  const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
  d.setDate(Math.min(originalDay,last));
  d.setDate(d.getDate()+sign*(weeks*7+days));
  return d;
}
function DateCalculator(){
  const [date,setDate]=useState(''),[mode,setMode]=useState<'add'|'subtract'>('add');
  const [years,setYears]=useState(0),[months,setMonths]=useState(0),[weeks,setWeeks]=useState(0),[days,setDays]=useState(0);
  useEffect(()=>{if(!date){const n=new Date();setDate([n.getFullYear(),String(n.getMonth()+1).padStart(2,'0'),String(n.getDate()).padStart(2,'0')].join('-'))}},[date]);
  const result=useMemo(()=>{const base=parseLocalDate(date);return base?shiftCalendarDate(base,mode==='add'?1:-1,years,months,weeks,days):null},[date,mode,years,months,weeks,days]);
  return <div className="toolUi">
    <div className="calcModeTabs unitTabs"><button className={mode==='add'?'active':''} onClick={()=>setMode('add')}>Add</button><button className={mode==='subtract'?'active':''} onClick={()=>setMode('subtract')}>Subtract</button></div>
    <div className="fieldGrid">
      <label>Start date<input type="date" value={date} onChange={x=>setDate(x.target.value)}/></label>
      <label>Years<input type="number" min="0" value={years} onChange={x=>setYears(Math.max(0,Number(x.target.value)||0))}/></label>
      <label>Months<input type="number" min="0" value={months} onChange={x=>setMonths(Math.max(0,Number(x.target.value)||0))}/></label>
      <label>Weeks<input type="number" min="0" value={weeks} onChange={x=>setWeeks(Math.max(0,Number(x.target.value)||0))}/></label>
      <label>Days<input type="number" min="0" value={days} onChange={x=>setDays(Math.max(0,Number(x.target.value)||0))}/></label>
    </div>
    <div className="resultHero"><span>Result date</span><strong>{result?formatDateValue(result):'—'}</strong>{result&&<small>{[result.getFullYear(),String(result.getMonth()+1).padStart(2,'0'),String(result.getDate()).padStart(2,'0')].join('-')}</small>}</div>
    <div className="toolNote"><ShieldCheck size={15}/><span>Month and year changes clamp to the last valid day of the target month before weeks and days are applied.</span></div>
  </div>;
}

function TimeDurationCalculator(){
  const [start,setStart]=useState(''),[end,setEnd]=useState('');
  const result=useMemo(()=>{
    if(!start||!end)return null;
    const a=new Date(start),b=new Date(end),ms=b.getTime()-a.getTime();
    if(!Number.isFinite(ms)||ms<0)return {error:'End date-time must be after the start date-time.',ms:0};
    return {error:'',ms};
  },[start,end]);
  const seconds=result&&!result.error?Math.floor(result.ms/1000):0;
  const days=Math.floor(seconds/86400),hours=Math.floor((seconds%86400)/3600),minutes=Math.floor((seconds%3600)/60),secs=seconds%60;
  return <div className="toolUi">
    <div className="fieldGrid">
      <label>Start date & time<input type="datetime-local" value={start} onChange={x=>setStart(x.target.value)}/></label>
      <label>End date & time<input type="datetime-local" value={end} onChange={x=>setEnd(x.target.value)}/></label>
    </div>
    {result?.error&&<div className="toolError">{result.error}</div>}
    {result&&!result.error&&<><div className="metricGrid textMetricGrid"><MetricCard label="Days" value={days}/><MetricCard label="Hours" value={hours}/><MetricCard label="Minutes" value={minutes}/><MetricCard label="Seconds" value={secs}/></div><div className="resultHero"><span>Total elapsed time</span><strong>{(seconds/3600).toLocaleString(undefined,{maximumFractionDigits:4})} hours</strong><small>{Math.floor(seconds/60).toLocaleString()} minutes · {seconds.toLocaleString()} seconds</small></div></>}
    <div className="toolNote"><ShieldCheck size={15}/><span>Inputs are interpreted as local date-times by the browser. For cross-zone scheduling, use the Time Zone Converter instead.</span></div>
  </div>;
}


type WebsiteAnalysisResponse={
  error?:string;
  mode?:string;
  inputUrl?:string;
  page?:{
    requestedUrl:string;
    finalUrl:string;
    status:number;
    statusText:string;
    elapsedMs:number;
    htmlBytes:number;
    redirects:{url:string;status:number;location:string|null}[];
    headers:{server:string;contentType:string;cacheControl:string;contentEncoding:string;xRobotsTag:string;location:string};
  };
  meta?:{
    title:string;titleLength:number;description:string;descriptionLength:number;canonical:string;robots:string;viewport:string;lang:string;charset:string;generator:string;
    openGraph:{title:string;description:string;image:string;url:string;type:string};
    twitter:{card:string;title:string;description:string;image:string};
    headings:{h1:string[];h2:string[];h3:string[]};
    links:{total:number;internal:number;external:number};
    images:{total:number;missingAlt:number};
    schemaTypes:string[];
  };
  robots?:{url:string;status:number;available:boolean;blocksAll:boolean;sitemaps:string[];userAgents:number;disallows:number;allows:number;preview:string}|null;
  sitemap?:{url:string;status:number;available:boolean;type:string;urlCount:number;sitemapCount:number;lastmodCount:number;sampleUrls:string[]}|null;
  security?:{https:boolean;grade:string;present:number;total:number;headers:{hsts:string;csp:string;xFrameOptions:string;xContentTypeOptions:string;referrerPolicy:string;permissionsPolicy:string}};
  ssl?:{https:boolean;secureConnection:boolean;hsts:boolean;httpRedirectToHttps:boolean|null};
  technologies?:string[];
  seoScore?:number;
};

const websiteModeById:Record<string,string>={
  'website-analyzer':'full',
  'seo-checker':'seo',
  'meta-tag-checker':'meta',
  'http-status-checker':'status',
  'redirect-checker':'redirect',
  'robots-checker':'robots',
  'sitemap-checker':'sitemap',
  'ssl-checker':'ssl',
  'security-headers-checker':'security',
  'technology-checker':'technology'
};

function WebsiteSignal({label,value,ok}:{label:string;value:React.ReactNode;ok?:boolean|null}){
  return <div className="websiteSignal"><span>{label}</span><strong>{value||'Not detected'}</strong>{typeof ok==='boolean'&&<b className={ok?'signalPass':'signalWarn'}>{ok?'PASS':'CHECK'}</b>}</div>;
}

function WebsiteAnalysisTool({tool}:{tool:Tool}){
  const [url,setUrl]=useState('');
  const [result,setResult]=useState<WebsiteAnalysisResponse|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const mode=websiteModeById[tool.id]||'full';

  const analyze=async(e:React.FormEvent)=>{
    e.preventDefault();
    setLoading(true);setError('');setResult(null);
    try{
      const response=await fetch('/api/tools/website-analysis',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({url,mode})
      });
      const data=await response.json() as WebsiteAnalysisResponse;
      if(!response.ok||data.error)throw new Error(data.error||'Website analysis failed.');
      setResult(data);
    }catch(err){
      setError(err instanceof Error?err.message:'Website analysis failed.');
    }finally{setLoading(false)}
  };

  const page=result?.page,meta=result?.meta,robots=result?.robots,sitemap=result?.sitemap,security=result?.security,ssl=result?.ssl;
  const securityRows=security?[
    ['HSTS',security.headers.hsts],
    ['Content-Security-Policy',security.headers.csp],
    ['X-Frame-Options',security.headers.xFrameOptions],
    ['X-Content-Type-Options',security.headers.xContentTypeOptions],
    ['Referrer-Policy',security.headers.referrerPolicy],
    ['Permissions-Policy',security.headers.permissionsPolicy],
  ]:[];

  return <div className="toolUi">
    <form className="websiteAnalyzerForm" onSubmit={analyze}>
      <label className="websiteUrlField"><span>Public website URL</span><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com/page" inputMode="url" autoComplete="url"/></label>
      <button className="primaryButton websiteAnalyzeButton" disabled={loading||!url.trim()}>{loading?<><RefreshCw size={16} className="spin"/> Analyzing…</>:<>Analyze website</>}</button>
    </form>
    <div className="toolNote"><ShieldCheck size={15}/><span>Toolmera fetches only public HTTP/HTTPS pages. Local/private hosts and non-standard ports are blocked, redirects are capped, and response bodies are size-limited.</span></div>
    {error&&<div className="toolError">{error}</div>}

    {result&&<>
      {(mode==='full'||mode==='seo')&&page&&meta&&<div className="websiteReport">
        <div className="metricGrid websiteMetrics">
          <MetricCard label="SEO score" value={(result.seoScore??0)+'/100'}/>
          <MetricCard label="HTTP status" value={page.status}/>
          <MetricCard label="H1 tags" value={meta.headings.h1.length}/>
          <MetricCard label="Missing ALT" value={meta.images.missingAlt}/>
        </div>
        <div className="websiteReportGrid">
          <section className="websiteReportPanel"><span className="sectionKicker">ON-PAGE SEO</span><h3>Search signals</h3>
            <div className="websiteSignalList">
              <WebsiteSignal label="Title" value={meta.title?meta.title+' · '+meta.titleLength+' chars':'Missing'} ok={meta.titleLength>=20&&meta.titleLength<=65}/>
              <WebsiteSignal label="Meta description" value={meta.description?meta.description+' · '+meta.descriptionLength+' chars':'Missing'} ok={meta.descriptionLength>=60&&meta.descriptionLength<=180}/>
              <WebsiteSignal label="Canonical" value={meta.canonical||'Missing'} ok={Boolean(meta.canonical)}/>
              <WebsiteSignal label="Meta robots" value={meta.robots||'No restrictive directive detected'} ok={!/\bnoindex\b/i.test(meta.robots)}/>
              <WebsiteSignal label="Viewport" value={meta.viewport||'Missing'} ok={Boolean(meta.viewport)}/>
              <WebsiteSignal label="Schema types" value={meta.schemaTypes.join(', ')||'None detected'} ok={meta.schemaTypes.length>0}/>
            </div>
          </section>
          <section className="websiteReportPanel"><span className="sectionKicker">CRAWL FILES</span><h3>Indexability context</h3>
            <div className="websiteSignalList">
              <WebsiteSignal label="robots.txt" value={robots?robots.status+' · '+(robots.blocksAll?'site-wide block detected':'no site-wide block detected'):'Could not verify'} ok={Boolean(robots?.available&&!robots.blocksAll)}/>
              <WebsiteSignal label="XML sitemap" value={sitemap?sitemap.status+' · '+(sitemap.urlCount||sitemap.sitemapCount)+' entries':'Could not verify'} ok={Boolean(sitemap?.available)}/>
              <WebsiteSignal label="Internal links" value={meta.links.internal}/>
              <WebsiteSignal label="External links" value={meta.links.external}/>
              <WebsiteSignal label="Images" value={meta.images.total+' total · '+meta.images.missingAlt+' missing/empty ALT'}/>
              <WebsiteSignal label="Final URL" value={page.finalUrl}/>
            </div>
          </section>
        </div>
        {mode==='full'&&security&&<div className="websiteReportGrid">
          <section className="websiteReportPanel"><span className="sectionKicker">SECURITY</span><h3>Headers grade {security.grade}</h3><div className="websiteSignalList">{securityRows.map(([label,value])=><WebsiteSignal key={label} label={label} value={value||'Missing'} ok={Boolean(value)}/>)}</div></section>
          <section className="websiteReportPanel"><span className="sectionKicker">TECHNOLOGY</span><h3>Public fingerprints</h3>{result.technologies?.length?<div className="technologyTags">{result.technologies.map(t=><span key={t}>{t}</span>)}</div>:<p className="websiteMuted">No supported technology fingerprints were detected in the fetched HTML or response headers.</p>}</section>
        </div>}
      </div>}

      {mode==='meta'&&meta&&<div className="websiteReport">
        <div className="metricGrid websiteMetrics"><MetricCard label="Title chars" value={meta.titleLength}/><MetricCard label="Description chars" value={meta.descriptionLength}/><MetricCard label="H1 tags" value={meta.headings.h1.length}/><MetricCard label="Schema types" value={meta.schemaTypes.length}/></div>
        <div className="websiteReportGrid">
          <section className="websiteReportPanel"><span className="sectionKicker">SEO META</span><h3>Search metadata</h3><div className="websiteSignalList">
            <WebsiteSignal label="Title" value={meta.title||'Missing'}/><WebsiteSignal label="Description" value={meta.description||'Missing'}/><WebsiteSignal label="Canonical" value={meta.canonical||'Missing'}/><WebsiteSignal label="Robots" value={meta.robots||'Not set'}/><WebsiteSignal label="Viewport" value={meta.viewport||'Missing'}/><WebsiteSignal label="Language" value={meta.lang||'Not declared'}/><WebsiteSignal label="Charset" value={meta.charset||'Not declared'}/>
          </div></section>
          <section className="websiteReportPanel"><span className="sectionKicker">SOCIAL META</span><h3>Open Graph & Twitter</h3><div className="websiteSignalList">
            <WebsiteSignal label="og:title" value={meta.openGraph.title||'Missing'}/><WebsiteSignal label="og:description" value={meta.openGraph.description||'Missing'}/><WebsiteSignal label="og:image" value={meta.openGraph.image||'Missing'}/><WebsiteSignal label="twitter:card" value={meta.twitter.card||'Missing'}/><WebsiteSignal label="twitter:title" value={meta.twitter.title||'Missing'}/><WebsiteSignal label="twitter:image" value={meta.twitter.image||'Missing'}/>
          </div></section>
        </div>
      </div>}

      {mode==='status'&&page&&<div className="websiteReport">
        <div className="metricGrid websiteMetrics"><MetricCard label="HTTP status" value={page.status}/><MetricCard label="Response time" value={page.elapsedMs+' ms'}/><MetricCard label="Redirect hops" value={Math.max(0,page.redirects.length-1)}/><MetricCard label="HTML read" value={prettyFileSize(page.htmlBytes)}/></div>
        <section className="websiteReportPanel"><span className="sectionKicker">LIVE RESPONSE</span><h3>HTTP details</h3><div className="websiteSignalList"><WebsiteSignal label="Requested URL" value={page.requestedUrl}/><WebsiteSignal label="Final URL" value={page.finalUrl}/><WebsiteSignal label="Content-Type" value={page.headers.contentType||'Not sent'}/><WebsiteSignal label="Server" value={page.headers.server||'Not disclosed'}/><WebsiteSignal label="Cache-Control" value={page.headers.cacheControl||'Not sent'}/><WebsiteSignal label="X-Robots-Tag" value={page.headers.xRobotsTag||'Not sent'}/></div></section>
      </div>}

      {mode==='redirect'&&page&&<div className="websiteReport">
        <div className="metricGrid websiteMetrics"><MetricCard label="Redirect hops" value={Math.max(0,page.redirects.length-1)}/><MetricCard label="Final status" value={page.status}/><MetricCard label="Response time" value={page.elapsedMs+' ms'}/><MetricCard label="Chain result" value={page.redirects.length>1?'Redirected':'Direct'}/></div>
        <section className="websiteReportPanel"><span className="sectionKicker">REDIRECT CHAIN</span><h3>Every HTTP hop</h3><div className="redirectChain">{page.redirects.map((hop,i)=><div key={hop.url+'-'+i}><b>{i+1}</b><span><strong>{hop.status}</strong><small>{hop.url}</small>{hop.location&&<em>→ {hop.location}</em>}</span></div>)}</div></section>
      </div>}

      {mode==='robots'&&robots&&<div className="websiteReport">
        <div className="metricGrid websiteMetrics"><MetricCard label="HTTP status" value={robots.status}/><MetricCard label="Blocks all" value={robots.blocksAll?'YES':'NO'}/><MetricCard label="User-agent rules" value={robots.userAgents}/><MetricCard label="Sitemaps" value={robots.sitemaps.length}/></div>
        <section className="websiteReportPanel"><span className="sectionKicker">ROBOTS.TXT</span><h3>{robots.url}</h3><div className="websiteSignalList"><WebsiteSignal label="Availability" value={robots.available?'Reachable':'Not reachable'} ok={robots.available}/><WebsiteSignal label="Site-wide Disallow: /" value={robots.blocksAll?'Detected':'Not detected'} ok={!robots.blocksAll}/><WebsiteSignal label="Allow directives" value={robots.allows}/><WebsiteSignal label="Disallow directives" value={robots.disallows}/><WebsiteSignal label="Declared sitemaps" value={robots.sitemaps.join(', ')||'None declared'}/></div><pre className="websiteRaw">{robots.preview||'robots.txt is empty.'}</pre></section>
      </div>}

      {mode==='sitemap'&&sitemap&&<div className="websiteReport">
        <div className="metricGrid websiteMetrics"><MetricCard label="HTTP status" value={sitemap.status}/><MetricCard label="Type" value={sitemap.type}/><MetricCard label="URL entries" value={sitemap.urlCount}/><MetricCard label="Child sitemaps" value={sitemap.sitemapCount}/></div>
        <section className="websiteReportPanel"><span className="sectionKicker">XML SITEMAP</span><h3>{sitemap.url}</h3><div className="websiteSignalList"><WebsiteSignal label="Availability" value={sitemap.available?'Reachable':'Not reachable'} ok={sitemap.available}/><WebsiteSignal label="lastmod tags" value={sitemap.lastmodCount}/><WebsiteSignal label="Entry count" value={sitemap.urlCount||sitemap.sitemapCount}/></div>{sitemap.sampleUrls.length>0&&<div className="websiteUrlSamples">{sitemap.sampleUrls.map(x=><span key={x}>{x}</span>)}</div>}</section>
      </div>}

      {mode==='ssl'&&page&&ssl&&<div className="websiteReport">
        <div className="metricGrid websiteMetrics"><MetricCard label="HTTPS" value={ssl.https?'YES':'NO'}/><MetricCard label="HSTS" value={ssl.hsts?'YES':'NO'}/><MetricCard label="HTTP → HTTPS" value={ssl.httpRedirectToHttps===null?'UNKNOWN':ssl.httpRedirectToHttps?'YES':'NO'}/><MetricCard label="HTTP status" value={page.status}/></div>
        <section className="websiteReportPanel"><span className="sectionKicker">HTTPS CHECK</span><h3>Transport security signals</h3><div className="websiteSignalList"><WebsiteSignal label="Final URL uses HTTPS" value={ssl.https?'Yes':'No'} ok={ssl.https}/><WebsiteSignal label="Secure HTTPS connection completed" value={ssl.secureConnection?'Yes':'No'} ok={ssl.secureConnection}/><WebsiteSignal label="Strict-Transport-Security" value={security?.headers.hsts||'Missing'} ok={ssl.hsts}/><WebsiteSignal label="HTTP redirects to HTTPS" value={ssl.httpRedirectToHttps===null?'Could not verify':ssl.httpRedirectToHttps?'Yes':'No'} ok={ssl.httpRedirectToHttps}/></div><p className="websiteMuted">This checker verifies live HTTPS reachability and transport headers. It does not claim certificate issuer or expiry data because those details are not exposed by the current edge fetch interface.</p></section>
      </div>}

      {mode==='security'&&security&&<div className="websiteReport">
        <div className="metricGrid websiteMetrics"><MetricCard label="Grade" value={security.grade}/><MetricCard label="Headers present" value={security.present+'/'+security.total}/><MetricCard label="HTTPS" value={security.https?'YES':'NO'}/><MetricCard label="Missing headers" value={security.total-security.present}/></div>
        <section className="websiteReportPanel"><span className="sectionKicker">SECURITY HEADERS</span><h3>Browser-facing protections</h3><div className="websiteSignalList">{securityRows.map(([label,value])=><WebsiteSignal key={label} label={label} value={value||'Missing'} ok={Boolean(value)}/>)}</div></section>
      </div>}

      {mode==='technology'&&<div className="websiteReport">
        <div className="metricGrid websiteMetrics"><MetricCard label="Detected" value={result.technologies?.length||0}/><MetricCard label="HTTP status" value={page?.status||'—'}/><MetricCard label="Server" value={page?.headers.server||'Hidden'}/><MetricCard label="Generator" value={meta?.generator||'None'}/></div>
        <section className="websiteReportPanel"><span className="sectionKicker">TECH STACK</span><h3>Detected public technologies</h3>{result.technologies?.length?<div className="technologyTags">{result.technologies.map(t=><span key={t}>{t}</span>)}</div>:<p className="websiteMuted">No supported CMS, framework, analytics, CDN or integration fingerprints were detected. That does not prove the site uses no technologies; some stacks deliberately hide public fingerprints.</p>}</section>
      </div>}
    </>}
  </div>;
}


export function ToolExperience({tool}:{tool:Tool}){
  let ui;
  if(tool.kind==='image-convert') ui=<ImageConvert tool={tool}/>; else if(tool.kind==='image-compress')ui=<ImageCompress/>; else if(tool.kind==='image-compress-jpg')ui=<ImageCompressJpg/>; else if(tool.kind==='image-compress-png')ui=<ImageCompressPng/>; else if(tool.kind==='image-resize')ui=<ImageResize/>; else if(tool.kind==='image-crop')ui=<CropImage/>; else if(tool.kind==='heic-convert')ui=<HeicConverter/>; else if(tool.kind==='pdf-to-image')ui=<PdfToImage/>; else if(tool.kind==='pdf-rotate')ui=<PdfRotate/>; else if(tool.kind==='pdf-remove-pages')ui=<PdfRemovePages/>; else if(['pdf-merge','pdf-split','images-to-pdf'].includes(tool.kind))ui=<PdfTool tool={tool}/>; else if(tool.kind==='age')ui=<AgeCalculator/>; else if(tool.kind==='percentage')ui=<PercentageCalculator/>; else if(tool.kind==='bmi')ui=<BmiCalculator/>; else if(tool.kind==='interest')ui=<CompoundInterestCalculator/>; else if(tool.kind==='loan')ui=<LoanCalculator/>; else if(tool.kind==='roi')ui=<RoiCalculator/>; else if(tool.kind==='discount')ui=<DiscountCalculator/>; else if(tool.kind==='simple-interest')ui=<SimpleInterestCalculator/>; else if(tool.kind==='date-difference')ui=<DateDifferenceCalculator/>; else if(tool.kind==='average')ui=<AverageCalculator/>; else if(tool.kind==='emi')ui=<EmiIndiaCalculator variant={tool.id==='home-emi-in'?'home':tool.id==='car-emi-in'?'car':'generic'}/>; else if(tool.kind==='sip')ui=<SipIndiaCalculator/>; else if(tool.kind==='fd')ui=<FdIndiaCalculator/>; else if(tool.kind==='gst')ui=<GstIndiaCalculator/>; else if(tool.kind==='cagr')ui=<CagrCoreCalculator/>; else if(tool.kind==='unit-length')ui=<UnitConverter/>; else if(tool.kind==='unit-temperature')ui=<UnitConverter temperature/>; else if(tool.kind==='unit-weight')ui=<WeightConverter/>; else if(tool.kind==='unit-volume')ui=<VolumeConverter/>; else if(tool.kind==='unit-area')ui=<AreaConverter/>; else if(tool.kind==='unit-speed')ui=<SpeedConverter/>; else if(tool.kind==='data-storage')ui=<DataStorageConverter/>; else if(tool.kind==='color-converter')ui=<ColorConverter/>; else if(tool.kind==='time-zone')ui=<TimeZoneConverter/>; else if(tool.kind==='url-encoder')ui=<UrlEncoderDecoder/>; else if(tool.kind==='slug-generator')ui=<SlugGenerator/>; else if(tool.kind==='jwt-decoder')ui=<JwtDecoder/>; else if(tool.kind==='character-counter')ui=<CharacterCounter/>; else if(tool.kind==='remove-duplicate-lines')ui=<RemoveDuplicateLines/>; else if(tool.kind==='sort-lines')ui=<SortLines/>; else if(tool.kind==='text-diff')ui=<TextDiffChecker/>; else if(tool.kind==='json-to-csv')ui=<JsonToCsv/>; else if(tool.kind==='xml-formatter')ui=<XmlFormatter/>; else if(tool.kind==='date-calculator')ui=<DateCalculator/>; else if(tool.kind==='time-duration')ui=<TimeDurationCalculator/>; else if(tool.kind==='website-analysis')ui=<WebsiteAnalysisTool tool={tool}/>; else if(tool.kind==='qr-generator')ui=<QrCodeGenerator/>; else if(tool.kind==='uuid-generator')ui=<UuidGenerator/>; else if(tool.kind==='password-generator')ui=<PasswordGenerator/>; else if(tool.kind==='random-number-generator')ui=<RandomNumberGenerator/>; else if(tool.kind==='unix-timestamp')ui=<UnixTimestampConverter/>; else if(tool.kind==='word-counter')ui=<WordCounter/>; else if(tool.kind==='case-converter')ui=<CaseConverter/>; else if(tool.kind==='json-formatter')ui=<JsonFormatter/>; else if(tool.kind==='base64')ui=<Base64Tool/>; else ui=null;
  return <section className={`toolExperience accent-${tool.accent}`}><div className="experienceTop"><div><span className="eyebrow">TOOLMERA / {tool.categoryLabel.toUpperCase()}</span><div className="experienceTitle">{tool.name}</div></div><span className="privatePill"><ShieldCheck size={15}/> {tool.kind==='website-analysis'?'Live public URL analysis':'Browser-first processing'}</span></div>{ui}</section>
}
