'use client';

import { DragEvent, useRef } from 'react';
import { Check, ChevronDown, ChevronUp, Download, FileUp, X } from 'lucide-react';

export type Result={url:string;name:string;before?:number;after?:number};

export function DownloadResult({result}:{result:Result}){
  return <div className="resultBox"><div><strong>Ready</strong>{result.before&&result.after?<small>{(result.before/1024).toFixed(0)} KB → {(result.after/1024).toFixed(0)} KB</small>:<small>Your file is ready to download.</small>}</div><a className="primaryButton" href={result.url} download={result.name}><Download size={17}/> Download</a></div>;
}

export const prettyFileSize=(bytes:number)=>{
  if(bytes<1024)return bytes+' B';
  if(bytes<1024*1024)return (bytes/1024).toFixed(bytes<10240?1:0)+' KB';
  return (bytes/(1024*1024)).toFixed(bytes<10*1024*1024?1:0)+' MB';
};

export function FileDrop({accept,multiple=false,onChange,label='Choose file',files=[],busy=false,busyLabel='Processing…',maxFiles}:{accept:string;multiple?:boolean;onChange:(files:File[])=>void;label?:string;files?:File[];busy?:boolean;busyLabel?:string;maxFiles?:number}){
  const dragDepth=useRef(0);
  function pick(next:File[]){if(next.length)onChange(multiple?next:next.slice(0,1))}
  function drop(e:DragEvent<HTMLLabelElement>){e.preventDefault();e.stopPropagation();dragDepth.current=0;pick(Array.from(e.dataTransfer.files||[]))}
  return <label className={`fileDrop ${files.length?'hasFiles':''} ${busy?'isBusy':''}`}
    onDragEnter={e=>{e.preventDefault();e.stopPropagation();dragDepth.current+=1}}
    onDragOver={e=>{e.preventDefault();e.stopPropagation();e.dataTransfer.dropEffect='copy'}}
    onDragLeave={e=>{e.preventDefault();e.stopPropagation();dragDepth.current=Math.max(0,dragDepth.current-1)}}
    onDrop={drop}>
    {busy?<div className="fileProcessState"><span className="processSpinner"></span><strong>{busyLabel}</strong><small>Processing locally in your browser</small><div className="processTrack"><i/></div></div>:files.length?<div className="fileReadyState"><span className="fileReadyIcon"><Check size={19}/></span><div className="fileReadyCopy"><strong>{files.length===1?'File ready':files.length+' files ready'}</strong><small>{files.length===1?files[0].name:files.map(f=>f.name).slice(0,2).join(' · ')+(files.length>2?' · +'+(files.length-2)+' more':'')}</small></div><span className="fileReadySize">{files.length===1?prettyFileSize(files[0].size):prettyFileSize(files.reduce((sum,f)=>sum+f.size,0))}</span><span className="fileReplaceHint">{multiple?(maxFiles?`Drop more files or click to add · ${files.length}/${maxFiles}`:'Drop more files or click to add'):'Drop another file or click to replace'}</span></div>:<><FileUp size={30}/><strong>{label}</strong><span>or drag & drop from your folder</span></>}
    <input type="file" accept={accept} multiple={multiple} disabled={busy} onChange={e=>{pick(Array.from(e.target.files||[]));e.currentTarget.value=''}}/>
  </label>;
}

export function FileQueue({files,onChange}:{files:File[];onChange:(files:File[])=>void}){
  function move(index:number,delta:number){const target=index+delta;if(target<0||target>=files.length)return;const next=[...files];[next[index],next[target]]=[next[target],next[index]];onChange(next)}
  return <div className="fileQueue">{files.map((file,index)=><div className="fileQueueItem" key={`${file.name}-${file.size}-${index}`}><span><b>{index+1}</b><span><strong>{file.name}</strong><small>{prettyFileSize(file.size)} · <em>Ready</em></small></span></span><div><button type="button" aria-label="Move up" onClick={()=>move(index,-1)} disabled={index===0}><ChevronUp size={15}/></button><button type="button" aria-label="Move down" onClick={()=>move(index,1)} disabled={index===files.length-1}><ChevronDown size={15}/></button><button type="button" aria-label="Remove file" onClick={()=>onChange(files.filter((_,i)=>i!==index))}><X size={15}/></button></div></div>)}</div>;
}

export const MAX_BATCH_FILES=4;
export function mergeBatchFiles(current:File[],incoming:File[],max=MAX_BATCH_FILES){
  const seen=new Set(current.map(f=>[f.name,f.size,f.lastModified].join(':'))),next=[...current];let overflow=false;
  for(const file of incoming){const key=[file.name,file.size,file.lastModified].join(':');if(seen.has(key))continue;if(next.length>=max){overflow=true;break}seen.add(key);next.push(file)}
  if(incoming.length>Math.max(0,max-current.length))overflow=true;
  return {files:next,overflow};
}

export function BatchFileList({files,onRemove,max=MAX_BATCH_FILES}:{files:File[];onRemove:(index:number)=>void;max?:number}){
  if(!files.length)return null;
  return <div className="batchFilePanel"><div className="batchFileHead"><span>Files to process</span><small>{files.length}/{max} selected</small></div><div className="batchFileList">{files.map((file,index)=><div className="batchFileItem" key={[file.name,file.size,file.lastModified,index].join('-')}><b>{index+1}</b><span><strong>{file.name}</strong><small>{prettyFileSize(file.size)} · Ready</small></span><button type="button" aria-label={'Remove '+file.name} onClick={()=>onRemove(index)}><X size={15}/></button></div>)}</div></div>;
}

export function DownloadResults({results}:{results:Result[]}){
  if(!results.length)return null;if(results.length===1)return <DownloadResult result={results[0]}/>;
  return <div className="batchResults"><div className="batchResultsHead"><span><Check size={16}/> {results.length} files ready</span><small>Download each converted file below</small></div>{results.map((result,index)=><div className="batchResultItem" key={result.url}><b>{index+1}</b><span><strong>{result.name}</strong><small>{result.before&&result.after?prettyFileSize(result.before)+' → '+prettyFileSize(result.after):prettyFileSize(result.after||0)}</small></span><a className="secondaryButton" href={result.url} download={result.name}><Download size={15}/> Download</a></div>)}</div>;
}

export async function imageToCanvas(file:File){const bitmap=await createImageBitmap(file);const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext('2d')!;return {bitmap,canvas,ctx}}
