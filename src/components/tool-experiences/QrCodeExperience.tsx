'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, ShieldCheck } from 'lucide-react';
import type { Tool } from '@/data/tools';

function downloadTextFile(name:string,text:string,type='text/plain'){
  const blob=new Blob([text],{type});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=name;a.click();
  window.setTimeout(()=>URL.revokeObjectURL(a.href),1000);
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
  function downloadPng(){if(png){const a=document.createElement('a');a.href=png;a.download='toolmera-qr-code.png';a.click()}}
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

export function QrCodeExperience({tool}:{tool:Tool}){
  return <section className={`toolExperience accent-${tool.accent}`}>
    <div className="experienceTop"><div><span className="eyebrow">TOOLMERA / {tool.categoryLabel.toUpperCase()}</span><div className="experienceTitle">{tool.name}</div></div><span className="privatePill"><ShieldCheck size={15}/> Browser-first processing</span></div>
    <QrCodeGenerator/>
  </section>;
}
