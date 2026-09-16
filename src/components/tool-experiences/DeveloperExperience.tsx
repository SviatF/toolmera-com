'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, Download, ShieldCheck } from 'lucide-react';
import type { Tool } from '@/data/tools';

async function copyPlainText(value:string){await navigator.clipboard.writeText(value)}

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
    try{const obj=JSON.parse(text);const spacing=minify?undefined:indent==='tab'?'\t':Number(indent);setOutput(JSON.stringify(obj,null,spacing));setStatus('valid')}
    catch(e){setOutput(`Invalid JSON: ${jsonErrorDetail((e as Error).message,text)}`);setStatus('invalid')}
    setCopied(false);
  }
  async function copy(){if(!output)return;await copyPlainText(output);setCopied(true);window.setTimeout(()=>setCopied(false),1400)}
  return <div className="toolUi">
    <textarea className="textArea codeArea" value={text} onChange={e=>{setText(e.target.value);setStatus('idle')}} placeholder={'{"name":"Toolmera","fast":true}'}/>
    <div className="jsonControls"><div className="buttonRow"><button className="primaryButton" onClick={()=>run(false)}>Format JSON</button><button className="secondaryButton" onClick={()=>run(true)}>Minify</button></div><label>Indentation<select value={indent} onChange={e=>setIndent(e.target.value as '2'|'4'|'tab')}><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tabs</option></select></label></div>
    {status!=='idle'&&<div className={`validationPill ${status}`}>{status==='valid'?'Valid JSON':'Invalid JSON'}</div>}
    <div className="outputWrap"><textarea className="textArea output codeArea" readOnly value={output} placeholder="Formatted or minified JSON appears here…"/><button className="copyButton" onClick={copy} disabled={!output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy'}</button></div>
  </div>;
}

function bytesToBase64(bytes:Uint8Array){let binary='';const chunk=0x8000;for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode(...bytes.subarray(i,i+chunk));return btoa(binary)}
function base64ToBytes(value:string){const normalized=value.replace(/\s+/g,'');const binary=atob(normalized);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes}

function Base64Tool(){
  const [text,setText]=useState(''),[output,setOutput]=useState(''),[mode,setMode]=useState<'standard'|'url'>('standard'),[error,setError]=useState(''),[copied,setCopied]=useState(false);
  function encode(){try{let encoded=bytesToBase64(new TextEncoder().encode(text));if(mode==='url')encoded=encoded.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');setOutput(encoded);setError('')}catch{setError('Could not encode this text.');setOutput('')}setCopied(false)}
  function decode(){try{let input=text.trim();if(mode==='url'){input=input.replace(/-/g,'+').replace(/_/g,'/');input+='='.repeat((4-input.length%4)%4)}const decoded=new TextDecoder('utf-8',{fatal:true}).decode(base64ToBytes(input));setOutput(decoded);setError('')}catch{setError('Invalid Base64 or the decoded bytes are not valid UTF-8 text.');setOutput('')}setCopied(false)}
  async function copy(){if(!output)return;await copyPlainText(output);setCopied(true);window.setTimeout(()=>setCopied(false),1400)}
  return <div className="toolUi"><div className="calcModeTabs unitTabs"><button className={mode==='standard'?'active':''} onClick={()=>setMode('standard')}>Standard Base64</button><button className={mode==='url'?'active':''} onClick={()=>setMode('url')}>Base64URL</button></div><textarea className="textArea codeArea" value={text} onChange={e=>setText(e.target.value)} placeholder="Enter text or Base64…"/><div className="buttonRow"><button className="primaryButton" onClick={encode}>Encode</button><button className="secondaryButton" onClick={decode}>Decode</button></div>{error&&<div className="toolError">{error}</div>}<div className="outputWrap"><textarea className="textArea output codeArea" readOnly value={output} placeholder="Result…"/><button className="copyButton" onClick={copy} disabled={!output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy'}</button></div><div className="toolNote"><ShieldCheck size={15}/><span>Base64 is an encoding format, not encryption. Do not use it by itself to protect secrets or passwords.</span></div></div>;
}

function UrlEncoderDecoder(){
  const [text,setText]=useState(''),[output,setOutput]=useState(''),[scope,setScope]=useState<'component'|'url'>('component'),[error,setError]=useState(''),[copied,setCopied]=useState(false);
  function run(action:'encode'|'decode'){try{const result=action==='encode'?(scope==='component'?encodeURIComponent(text):encodeURI(text)):(scope==='component'?decodeURIComponent(text):decodeURI(text));setOutput(result);setError('');setCopied(false)}catch(e){setOutput('');setError(e instanceof Error?e.message:'Could not transform this URL value.')}}
  async function copy(){if(!output)return;await copyPlainText(output);setCopied(true);window.setTimeout(()=>setCopied(false),1200)}
  return <div className="toolUi"><div className="calcModeTabs unitTabs"><button className={scope==='component'?'active':''} onClick={()=>setScope('component')}>URL component</button><button className={scope==='url'?'active':''} onClick={()=>setScope('url')}>Complete URL</button></div><textarea className="textArea codeArea" value={text} onChange={e=>setText(e.target.value)} placeholder={scope==='component'?'Search term, path segment or query value…':'https://example.com/path?q=hello world'}/><div className="buttonRow"><button className="primaryButton" onClick={()=>run('encode')}>Encode</button><button className="secondaryButton" onClick={()=>run('decode')}>Decode</button></div>{error&&<div className="toolError">{error}</div>}<div className="outputWrap"><textarea className="textArea output codeArea" readOnly value={output} placeholder="Encoded or decoded result…"/><button className="copyButton" onClick={copy} disabled={!output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy'}</button></div><div className="toolNote"><ShieldCheck size={15}/><span>Component mode uses encodeURIComponent/decodeURIComponent. Full URL mode keeps URL syntax characters such as : / ? & = available where appropriate.</span></div></div>;
}

function createSlug(text:string,separator:string,preserveUnicode:boolean){let value=text.trim().toLocaleLowerCase().normalize('NFKD').replace(/\p{M}+/gu,'');if(preserveUnicode)value=value.replace(/[^\p{L}\p{N}]+/gu,separator);else value=value.replace(/[^\x00-\x7F]/g,'').replace(/[^a-z0-9]+/g,separator);const repeats=separator==='-'?/-+/g:/_+/g;const edges=separator==='-'?/^-+|-+$/g:/^_+|_+$/g;return value.replace(repeats,separator).replace(edges,'')}
function SlugGenerator(){
  const [text,setText]=useState(''),[separator,setSeparator]=useState('-'),[preserveUnicode,setPreserveUnicode]=useState(false),[copied,setCopied]=useState(false);
  const output=useMemo(()=>createSlug(text,separator,preserveUnicode),[text,separator,preserveUnicode]);
  async function copy(){if(!output)return;await copyPlainText(output);setCopied(true);window.setTimeout(()=>setCopied(false),1200)}
  return <div className="toolUi"><textarea className="textArea" value={text} onChange={e=>setText(e.target.value)} placeholder="Free Online Tools for Faster Everyday Work"/><div className="fieldGrid generatorFields"><label>Separator<select value={separator} onChange={e=>setSeparator(e.target.value)}><option value="-">Hyphen (-)</option><option value="_">Underscore (_)</option></select></label><label className="checkControl slugCheck"><input type="checkbox" checked={preserveUnicode} onChange={e=>setPreserveUnicode(e.target.checked)}/><span>Preserve non-Latin letters</span></label></div><div className="slugOutput"><span>URL slug</span><code>{output||'—'}</code><button className="copyButton" onClick={copy} disabled={!output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy'}</button></div><div className="toolNote"><ShieldCheck size={15}/><span>ASCII mode removes non-Latin characters rather than guessing transliterations. Enable Unicode preservation when you want native-script URL slugs.</span></div></div>;
}

function decodeJwtPart(value:string){let normalized=value.replace(/-/g,'+').replace(/_/g,'/');normalized+='='.repeat((4-normalized.length%4)%4);return new TextDecoder('utf-8',{fatal:true}).decode(base64ToBytes(normalized))}
function JwtDecoder(){
  const [token,setToken]=useState(''),[header,setHeader]=useState(''),[payload,setPayload]=useState(''),[claims,setClaims]=useState<{exp?:number;iat?:number;nbf?:number}|null>(null),[error,setError]=useState(''),[copied,setCopied]=useState('');
  function decode(){try{const parts=token.trim().split('.');if(parts.length!==3)throw new Error('A compact JWT should contain three dot-separated parts.');const headerObj=JSON.parse(decodeJwtPart(parts[0])),payloadObj=JSON.parse(decodeJwtPart(parts[1]));setHeader(JSON.stringify(headerObj,null,2));setPayload(JSON.stringify(payloadObj,null,2));setClaims({exp:typeof payloadObj.exp==='number'?payloadObj.exp:undefined,iat:typeof payloadObj.iat==='number'?payloadObj.iat:undefined,nbf:typeof payloadObj.nbf==='number'?payloadObj.nbf:undefined});setError('');setCopied('')}catch(e){setHeader('');setPayload('');setClaims(null);setError(e instanceof Error?e.message:'Could not decode this JWT.')}}
  async function copy(key:string,value:string){await copyPlainText(value);setCopied(key);window.setTimeout(()=>setCopied(''),1200)}
  const exp=claims?.exp?new Date(claims.exp*1000):null,status=exp?(exp.getTime()<Date.now()?'Expired':'Not expired by exp claim'):'No exp claim';
  return <div className="toolUi"><textarea className="textArea codeArea jwtInput" value={token} onChange={e=>setToken(e.target.value)} placeholder="eyJhbGciOi..."/><button className="primaryButton wide" onClick={decode}>Decode JWT</button>{error&&<div className="toolError">{error}</div>}{header&&payload&&<><div className="jwtStatus"><span>Token timing</span><strong>{status}</strong>{exp&&<small>exp · {exp.toISOString()}</small>}{claims?.iat&&<small>iat · {new Date(claims.iat*1000).toISOString()}</small>}{claims?.nbf&&<small>nbf · {new Date(claims.nbf*1000).toISOString()}</small>}</div><div className="jwtGrid"><div><div className="queueHead"><span>Header</span><button className="copyButton" onClick={()=>copy('header',header)}>{copied==='header'?<Check size={14}/>:<Copy size={14}/>} Copy</button></div><textarea className="textArea output codeArea" readOnly value={header}/></div><div><div className="queueHead"><span>Payload</span><button className="copyButton" onClick={()=>copy('payload',payload)}>{copied==='payload'?<Check size={14}/>:<Copy size={14}/>} Copy</button></div><textarea className="textArea output codeArea" readOnly value={payload}/></div></div></>}<div className="toolError jwtWarning"><ShieldCheck size={15}/><span>Decoding is not verification. Toolmera does not validate the JWT signature, issuer, audience or trustworthiness of any claim on this page.</span></div></div>;
}

function flattenJsonRecord(value:Record<string,unknown>,prefix='',out:Record<string,unknown>={}){for(const [key,item] of Object.entries(value)){const next=prefix?prefix+'.'+key:key;if(item&&typeof item==='object'&&!Array.isArray(item))flattenJsonRecord(item as Record<string,unknown>,next,out);else out[next]=item}return out}
function csvCell(value:unknown,delimiter:string){const text=value==null?'':typeof value==='object'?JSON.stringify(value):String(value);return (text.includes(delimiter)||/["\r\n]/.test(text))?'"'+text.replace(/"/g,'""')+'"':text}
function JsonToCsv(){
  const [text,setText]=useState(''),[delimiter,setDelimiter]=useState(','),[flatten,setFlatten]=useState(true),[output,setOutput]=useState(''),[error,setError]=useState(''),[copied,setCopied]=useState(false);
  function convert(){try{const parsed=JSON.parse(text);const source=Array.isArray(parsed)?parsed:[parsed];if(!source.length||source.some(x=>!x||typeof x!=='object'||Array.isArray(x)))throw new Error('Use a JSON object or an array of JSON objects.');const rows=(source as Record<string,unknown>[]).map(x=>flatten?flattenJsonRecord(x):x);const headers=Array.from(new Set(rows.flatMap(x=>Object.keys(x))));const csv=[headers.map(x=>csvCell(x,delimiter)).join(delimiter),...rows.map(row=>headers.map(h=>csvCell(row[h],delimiter)).join(delimiter))].join('\n');setOutput(csv);setError('');setCopied(false)}catch(err){setOutput('');setError(err instanceof Error?err.message:'Could not convert this JSON.')}}
  async function copy(){if(!output)return;await copyPlainText(output);setCopied(true);window.setTimeout(()=>setCopied(false),1200)}
  function download(){if(!output)return;const url=URL.createObjectURL(new Blob([output],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='toolmera-json.csv';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000)}
  return <div className="toolUi"><textarea className="textArea codeArea" value={text} onChange={x=>setText(x.target.value)} placeholder={'[{"name":"Ada","age":36},{"name":"Grace","age":41}]'}/><div className="fieldGrid generatorFields"><label>Delimiter<select value={delimiter} onChange={x=>setDelimiter(x.target.value)}><option value=",">Comma (,)</option><option value=";">Semicolon (;)</option><option value={'\t'}>Tab</option></select></label><label className="checkControl"><input type="checkbox" checked={flatten} onChange={x=>setFlatten(x.target.checked)}/><span>Flatten nested objects</span></label></div><button className="primaryButton wide" onClick={convert}>Convert JSON to CSV</button>{error&&<div className="toolError">{error}</div>}<div className="outputWrap"><textarea className="textArea output codeArea" readOnly value={output} placeholder="CSV appears here…"/><button className="copyButton" onClick={copy} disabled={!output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy'}</button></div><button className="secondaryButton wide" onClick={download} disabled={!output}><Download size={16}/> Download CSV</button></div>;
}

function prettyXml(xml:string,indent:string){const normalized=xml.replace(/>\s*</g,'><').replace(/(>)(<)(\/*)/g,'$1\n$2$3');let depth=0;return normalized.split('\n').map(raw=>{const line=raw.trim();if(/^<\//.test(line))depth=Math.max(0,depth-1);const out=indent.repeat(depth)+line;if(/^<[^!?/][^>]*[^/]?>/.test(line)&&!/<\/[^>]+>\s*$/.test(line)&&!/^<[^>]+\/>/.test(line))depth++;return out}).join('\n')}
function XmlFormatter(){
  const [text,setText]=useState(''),[output,setOutput]=useState(''),[indent,setIndent]=useState<'2'|'4'|'tab'>('2'),[error,setError]=useState(''),[copied,setCopied]=useState(false);
  function format(){try{const doc=new DOMParser().parseFromString(text,'application/xml');const parserError=doc.querySelector('parsererror');if(parserError)throw new Error((parserError.textContent||'Invalid XML').replace(/\s+/g,' ').slice(0,220));const serialized=new XMLSerializer().serializeToString(doc);const pad=indent==='tab'?'\t':' '.repeat(Number(indent));setOutput(prettyXml(serialized,pad));setError('');setCopied(false)}catch(err){setOutput('');setError(err instanceof Error?err.message:'Invalid XML.')}}
  async function copy(){if(!output)return;await copyPlainText(output);setCopied(true);window.setTimeout(()=>setCopied(false),1200)}
  return <div className="toolUi"><textarea className="textArea codeArea" value={text} onChange={x=>setText(x.target.value)} placeholder={'<root><item id="1">Hello</item></root>'}/><div className="jsonControls"><button className="primaryButton" onClick={format}>Format XML</button><label>Indentation<select value={indent} onChange={x=>setIndent(x.target.value as '2'|'4'|'tab')}><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tabs</option></select></label></div>{error&&<div className="toolError">{error}</div>}<div className="outputWrap"><textarea className="textArea output codeArea" readOnly value={output} placeholder="Formatted XML appears here…"/><button className="copyButton" onClick={copy} disabled={!output}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy'}</button></div><div className="toolNote"><ShieldCheck size={15}/><span>The browser XML parser validates well-formedness. Formatting can normalize serialization details, so review output before replacing whitespace-sensitive XML or signed documents.</span></div></div>;
}

export function DeveloperExperience({tool}:{tool:Tool}){
  let ui=null;
  if(tool.kind==='json-formatter')ui=<JsonFormatter/>;
  else if(tool.kind==='base64')ui=<Base64Tool/>;
  else if(tool.kind==='url-encoder')ui=<UrlEncoderDecoder/>;
  else if(tool.kind==='slug-generator')ui=<SlugGenerator/>;
  else if(tool.kind==='jwt-decoder')ui=<JwtDecoder/>;
  else if(tool.kind==='json-to-csv')ui=<JsonToCsv/>;
  else if(tool.kind==='xml-formatter')ui=<XmlFormatter/>;
  return <section className={`toolExperience accent-${tool.accent}`}><div className="experienceTop"><div><span className="eyebrow">TOOLMERA / {tool.categoryLabel.toUpperCase()}</span><div className="experienceTitle">{tool.name}</div></div><span className="privatePill"><ShieldCheck size={15}/> Browser-first processing</span></div>{ui}</section>;
}
