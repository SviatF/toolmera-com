'use client';

import { ExternalLink, GitBranch, RefreshCw, RotateCcw, Rocket, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { hasInternalLinkBoost } from '@/data/internalLinkBoosts';
import { tools, toolUrl, type Tool } from '@/data/tools';
import { semanticRelatedTools } from '@/lib/toolRelations';
import styles from './AdminSeoDeployment.module.css';

type MetricRow={clicks:number;impressions:number;ctr:number;position:number};
type PageRow=MetricRow&{page:string};
type QueryPageRow=MetricRow&{query:string;page:string};
type GscData={pages?:PageRow[];queryPages?:QueryPageRow[]};
type ApprovalDecision='Approved'|'Rejected'|'Overridden'|'Snoozed';
type ApprovalRecord={
  actionKey:string;
  decision:ApprovalDecision;
  reviewer:string;
  note:string;
  updatedAt:string;
  guardrailDecision:'AUTO-APPROVE'|'HUMAN REVIEW'|'BLOCK';
  snapshot:{toolName:string;path:string;priority:string;type:string;title:string;query:string};
};
type ApprovalState={approvals:Record<string,ApprovalRecord>};
type DeployLink={from:string;to:string;anchor:string;reason:string};
type DeploymentStatus='Dry run'|'Deployed'|'Rolled back'|'Failed';
type DeploymentRecord={
  id:string;
  actionKey:string;
  targetToolId:string;
  approvalDecision:'Approved'|'Overridden';
  reviewer:string;
  status:DeploymentStatus;
  createdAt:string;
  updatedAt:string;
  baseSha:string;
  deployedBlobSha?:string;
  commitSha?:string;
  rollbackCommitSha?:string;
  deployedAt?:string;
  rolledBackAt?:string;
  links:DeployLink[];
  diff:string;
  error?:string;
};
type DeploymentState={
  version:1;
  revision:number;
  updatedAt:string;
  records:Record<string,DeploymentRecord>;
  githubConfigured:boolean;
  repo:string;
  branch:string;
  registryPath:string;
};
type SourceCandidate={tool:Tool;path:string;metrics:MetricRow;relation:'Semantic pair'|'Same cluster';score:number};
type DeploymentPlan={
  actionKey:string;
  approval:ApprovalRecord;
  target:Tool;
  targetPath:string;
  topQuery:string;
  sources:SourceCandidate[];
  links:DeployLink[];
  latest?:DeploymentRecord;
};

const empty:MetricRow={clicks:0,impressions:0,ctr:0,position:0};
const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));
const number=(value:number)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value);

function normalizePath(value:string){
  try{
    const pathname=new URL(value,'https://toolmera.com').pathname||'/';
    return pathname==='/'?'/':pathname.replace(/\/+$/,'')+'/';
  }catch{return value}
}

function toolPath(tool:Tool){return normalizePath(toolUrl(tool))}

function sourceAuthority(metrics:MetricRow){
  const demand=clamp(Math.log1p(metrics.impressions)/Math.log(31),0,1);
  const position=metrics.position>0&&metrics.position<=10?1:metrics.position<=20?.72:metrics.position<=50?.4:.15;
  return demand*.72+position*.28;
}

function cleanAnchorQuery(value:string){
  const query=value.replace(/[“”"']/g,'').replace(/\s+/g,' ').trim().toLowerCase();
  if(query.length<5||query.length>78||query.includes('toolmera')||/^mera\b/.test(query))return '';
  return query;
}

function anchorFor(target:Tool,query:string,index:number){
  const exact=cleanAnchorQuery(query);
  if(index===0&&exact)return exact;
  if(index===1)return `use the ${target.name.toLowerCase()}`;
  return index===2?`continue with the ${target.name.toLowerCase()}`:target.name.toLowerCase();
}

function compactDate(value:string|undefined){
  if(!value)return '—';
  const date=new Date(value);
  return `${date.toLocaleDateString([],{month:'short',day:'2-digit'})} · ${date.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`;
}

function statusTone(status:DeploymentStatus|undefined){
  if(status==='Deployed')return styles.green;
  if(status==='Rolled back')return styles.muted;
  if(status==='Dry run')return styles.blue;
  if(status==='Failed')return styles.red;
  return styles.amber;
}

export function AdminSeoDeployment(){
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [approvals,setApprovals]=useState<Record<string,ApprovalRecord>>({});
  const [deployments,setDeployments]=useState<DeploymentState|null>(null);
  const [gsc,setGsc]=useState<GscData|null>(null);
  const [loading,setLoading]=useState(false);
  const [busy,setBusy]=useState('');
  const [error,setError]=useState('');

  useEffect(()=>{
    const syncHost=()=>{
      const approvalHost=document.getElementById('toolmera-seo-approval-host');
      if(!approvalHost||!approvalHost.parentElement){
        document.getElementById('toolmera-seo-deployment-host')?.remove();
        setHost(null);
        return;
      }
      let node=document.getElementById('toolmera-seo-deployment-host');
      if(!node){
        node=document.createElement('div');
        node.id='toolmera-seo-deployment-host';
        approvalHost.parentElement.insertBefore(node,approvalHost.nextSibling);
      }
      setHost(node);
    };
    syncHost();
    const observer=new MutationObserver(syncHost);
    observer.observe(document.body,{subtree:true,childList:true});
    const interval=window.setInterval(syncHost,1400);
    return()=>{observer.disconnect();window.clearInterval(interval);document.getElementById('toolmera-seo-deployment-host')?.remove()};
  },[]);

  const load=useCallback(async(silent=false)=>{
    if(!silent)setLoading(true);
    try{
      const [approvalResponse,deploymentResponse,gscResponse]=await Promise.all([
        fetch('/api/admin/seo-approvals',{cache:'no-store'}),
        fetch('/api/admin/seo-deployments',{cache:'no-store'}),
        fetch('/api/admin/gsc?range=28d',{cache:'no-store'}),
      ]);
      const [approvalPayload,deploymentPayload,gscPayload]=await Promise.all([approvalResponse.json(),deploymentResponse.json(),gscResponse.json()]);
      if(!approvalResponse.ok)throw new Error(approvalPayload?.error||approvalPayload?.message||'Could not load approvals.');
      if(!deploymentResponse.ok)throw new Error(deploymentPayload?.error||deploymentPayload?.message||'Could not load deployment state.');
      if(!gscResponse.ok)throw new Error(gscPayload?.detail||gscPayload?.message||'Could not load GSC link data.');
      setApprovals((approvalPayload as ApprovalState).approvals||{});
      setDeployments(deploymentPayload as DeploymentState);
      setGsc(gscPayload as GscData);
      setError('');
    }catch(e){setError(e instanceof Error?e.message:'Could not load SEO deployment console.')}
    finally{if(!silent)setLoading(false)}
  },[]);

  useEffect(()=>{
    if(!host)return;
    void load();
    const interval=window.setInterval(()=>void load(true),20000);
    const onApproval=()=>void load(true);
    window.addEventListener('toolmera-seo-approval-changed',onApproval);
    return()=>{window.clearInterval(interval);window.removeEventListener('toolmera-seo-approval-changed',onApproval)};
  },[host,load]);

  const plans=useMemo<DeploymentPlan[]>(()=>{
    if(!gsc||!deployments)return [];
    const metricsByPath=new Map<string,MetricRow>();
    (gsc.pages||[]).forEach(row=>metricsByPath.set(normalizePath(row.page),row));
    const topQueryByPath=new Map<string,QueryPageRow>();
    (gsc.queryPages||[]).forEach(row=>{
      const path=normalizePath(row.page);
      const current=topQueryByPath.get(path);
      if(!current||row.impressions>current.impressions||(row.impressions===current.impressions&&row.position<current.position))topQueryByPath.set(path,row);
    });

    const livePairs=new Set<string>();
    Object.values(deployments.records||{}).forEach(record=>{
      if(record.status==='Deployed')record.links.forEach(link=>livePairs.add(`${link.from}->${link.to}`));
    });

    const latestByAction=new Map<string,DeploymentRecord>();
    Object.values(deployments.records||{}).forEach(record=>{
      const current=latestByAction.get(record.actionKey);
      if(!current||record.updatedAt>current.updatedAt)latestByAction.set(record.actionKey,record);
    });

    const result:DeploymentPlan[]=[];
    for(const approval of Object.values(approvals)){
      if(!((approval.decision==='Approved'||approval.decision==='Overridden')&&approval.snapshot.type==='Internal links'))continue;
      const target=tools.find(item=>toolPath(item)===normalizePath(approval.snapshot.path));
      if(!target)continue;
      const targetPath=toolPath(target);
      const targetRelated=new Set(semanticRelatedTools(target,tools,10).map(item=>item.id));
      const sources=tools
        .filter(source=>source.id!==target.id)
        .map(source=>{
          if(hasInternalLinkBoost(source.id,target.id)||livePairs.has(`${source.id}->${target.id}`))return null;
          if(semanticRelatedTools(source,tools,4).some(item=>item.id===target.id))return null;
          const semanticPair=targetRelated.has(source.id);
          const sameCluster=source.category===target.category;
          if(!semanticPair&&!sameCluster)return null;
          const metrics=metricsByPath.get(toolPath(source))||empty;
          const relationScore=semanticPair?1:.58;
          return {
            tool:source,
            path:toolPath(source),
            metrics,
            relation:semanticPair?'Semantic pair' as const:'Same cluster' as const,
            score:relationScore*.72+sourceAuthority(metrics)*.28,
          };
        })
        .filter((item):item is SourceCandidate=>item!==null)
        .sort((a,b)=>(b.score-a.score)||(b.metrics.impressions-a.metrics.impressions))
        .slice(0,3);
      const topQuery=topQueryByPath.get(targetPath)?.query||target.name;
      const links:DeployLink[]=sources.map((source,index)=>({
        from:source.tool.id,
        to:target.id,
        anchor:anchorFor(target,topQuery,index),
        reason:`${source.relation} approved deployment to strengthen ${target.name}.`,
      }));
      const latest=latestByAction.get(approval.actionKey);
      result.push(latest
        ?{actionKey:approval.actionKey,approval,target,targetPath,topQuery,sources,links,latest}
        :{actionKey:approval.actionKey,approval,target,targetPath,topQuery,sources,links});
    }
    return result.sort((a,b)=>a.target.name.localeCompare(b.target.name));
  },[approvals,deployments,gsc]);

  const run=useCallback(async(mode:'dry-run'|'deploy'|'rollback',plan:DeploymentPlan)=>{
    if(busy)return;
    setBusy(plan.actionKey);
    setError('');
    try{
      const body=mode==='dry-run'
        ?{mode,actionKey:plan.actionKey,links:plan.links}
        :mode==='deploy'
          ?{mode,draftId:plan.latest?.id}
          :{mode,deploymentId:plan.latest?.id};
      const response=await fetch('/api/admin/seo-deployments',{
        method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),
      });
      const payload=await response.json();
      if(!response.ok)throw new Error(payload?.error||payload?.message||'Deployment operation failed.');
      setDeployments(payload as DeploymentState);
      window.dispatchEvent(new Event('toolmera-seo-deployment-changed'));
      await load(true);
    }catch(e){setError(e instanceof Error?e.message:'Deployment operation failed.')}
    finally{setBusy('')}
  },[busy,load]);

  const summary=useMemo(()=>({
    approved:plans.length,
    ready:plans.filter(plan=>plan.links.length>0&&!plan.latest).length,
    dry:plans.filter(plan=>plan.latest?.status==='Dry run').length,
    deployed:plans.filter(plan=>plan.latest?.status==='Deployed').length,
  }),[plans]);

  if(!host)return null;

  return createPortal(<section className={styles.panel}>
    <div className={styles.head}>
      <div>
        <span className={styles.kicker}>APPROVAL-AWARE DEPLOYMENT · PREFLIGHT → COMMIT → ROLLBACK</span>
        <h2>Deploy only approved, reversible SEO changes</h2>
        <p>Version 1 deploys only contextual Internal links. Every deployment requires a persistent Approved or Overridden decision, a dry-run against the current GitHub registry SHA, and an exact rollback snapshot. If the registry changes after preflight, deployment is blocked instead of overwriting newer work.</p>
      </div>
      <div className={styles.actions}>
        <button onClick={()=>void load()} disabled={loading}><RefreshCw size={11}/>{loading?'Refreshing':'Refresh'}</button>
        <span className={deployments?.githubConfigured?styles.configured:styles.unconfigured}><GitBranch size={11}/>{deployments?.githubConfigured?'GitHub write ready':'Dry-run only'}</span>
      </div>
    </div>

    <div className={styles.summary}>
      <div><span>Approved link actions</span><strong>{summary.approved}</strong><small>Eligible after human decision</small></div>
      <div><span>Need preflight</span><strong>{summary.ready}</strong><small>Generate exact diff first</small></div>
      <div><span>Dry runs</span><strong>{summary.dry}</strong><small>SHA-locked deployment drafts</small></div>
      <div><span>Deployed</span><strong>{summary.deployed}</strong><small>Rollback snapshot retained</small></div>
    </div>

    {deployments&&!deployments.githubConfigured&&<div className={styles.notice}><ShieldCheck size={13}/><span><b>Repository writes are intentionally disabled until `GITHUB_DEPLOY_TOKEN` is added as a Cloudflare secret.</b> Preflight/dry-run still works and never exposes a token to the browser.</span></div>}
    {error&&<div className={styles.error}>{error}</div>}

    {!error&&plans.length===0?<div className={styles.empty}><Rocket size={18}/><strong>No approved internal-link deployment is waiting</strong><span>Approve an Internal links action first. CTR/content/cannibalization changes intentionally remain outside one-click deployment.</span></div>:
    <div className={styles.list}>{plans.map(plan=>{
      const latest=plan.latest;
      const busyRow=busy===plan.actionKey;
      const canDry=plan.links.length>0&&latest?.status!=='Deployed';
      const canDeploy=latest?.status==='Dry run'&&Boolean(deployments?.githubConfigured);
      const canRollback=latest?.status==='Deployed'&&Boolean(deployments?.githubConfigured);
      return <article className={styles.card} key={plan.actionKey}>
        <div className={styles.identity}>
          <div className={styles.badges}><span className={styles.approved}>{plan.approval.decision}</span><span>{plan.approval.guardrailDecision}</span><span>{plan.approval.snapshot.priority}</span></div>
          <a href={plan.targetPath} target="_blank" rel="noreferrer"><strong>{plan.target.name}</strong><small>{plan.targetPath}</small></a>
          <p>Anchor direction: <b>“{plan.topQuery}”</b></p>
          <em>{plan.approval.reviewer} · {compactDate(plan.approval.updatedAt)}</em>
        </div>

        <div className={styles.sources}>
          <small>Proposed contextual links</small>
          {plan.sources.length?plan.sources.map((source,index)=><div key={source.tool.id}>
            <a href={source.path} target="_blank" rel="noreferrer"><strong>{source.tool.name}</strong><ExternalLink size={10}/></a>
            <span>{source.relation}</span><em>{source.metrics.impressions?`${number(source.metrics.impressions)} impr.`:'no GSC signal'}</em>
            <code>“{plan.links[index]?.anchor}”</code>
          </div>):<p className={styles.noLinks}>All safe source-target pairs are already deployed or covered by the semantic graph.</p>}
        </div>

        <div className={styles.preflight}>
          <div><small>Deployment state</small><span className={`${styles.status} ${statusTone(latest?.status)}`}>{latest?.status||'Not prepared'}</span></div>
          {latest&&<><p><b>Base SHA</b> {latest.baseSha.slice(0,10)}…</p><p><b>Updated</b> {compactDate(latest.updatedAt)}</p></>}
          {latest?.commitSha&&<p><b>Deploy commit</b> {latest.commitSha.slice(0,10)}…</p>}
          {latest?.rollbackCommitSha&&<p><b>Rollback commit</b> {latest.rollbackCommitSha.slice(0,10)}…</p>}
        </div>

        <div className={styles.controls}>
          <button disabled={busyRow||!canDry} onClick={()=>void run('dry-run',plan)}><GitBranch size={11}/>{latest?.status==='Dry run'?'Refresh dry run':'Prepare dry run'}</button>
          <button className={styles.deploy} disabled={busyRow||!canDeploy} title={!deployments?.githubConfigured?'Add GITHUB_DEPLOY_TOKEN to enable writes':''} onClick={()=>void run('deploy',plan)}><Rocket size={11}/>Deploy</button>
          <button className={styles.rollback} disabled={busyRow||!canRollback} onClick={()=>void run('rollback',plan)}><RotateCcw size={11}/>Rollback</button>
        </div>

        {latest?.diff&&<pre className={styles.diff}>{latest.diff}</pre>}
      </article>})}</div>}

    <div className={styles.legend}><b>Preflight:</b><span>validates approval, target page, semantic source pages, duplicate links and current GitHub blob SHA.</span><b>Deploy:</b><span>commits only the approved internal-link registry diff; CI then rebuilds the static site.</span><b>Rollback:</b><span>restores the exact prior registry snapshot only if no newer registry change exists.</span></div>
  </section>,host);
}
