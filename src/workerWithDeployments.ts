import taskWorker, { SeoTaskStore } from './workerWithTasks';
import { tools, toolUrl, type Tool } from './data/tools';
import { semanticRelatedTools } from './lib/toolRelations';

export { SeoTaskStore };

type DurableStorageLike={
  get<T>(key:string):Promise<T|undefined>;
  put<T>(key:string,value:T):Promise<void>;
};
type DurableObjectStateLike={storage:DurableStorageLike};
type DurableObjectIdLike=unknown;
type DurableObjectStubLike={fetch(request:Request):Promise<Response>};
type DurableObjectNamespaceLike={
  idFromName(name:string):DurableObjectIdLike;
  get(id:DurableObjectIdLike):DurableObjectStubLike;
};

type DeployEnv={
  SEO_TASKS?:DurableObjectNamespaceLike;
  SEO_DEPLOYMENTS?:DurableObjectNamespaceLike;
  REQUIRE_ACCESS?:string;
  GITHUB_DEPLOY_TOKEN?:string;
};

type ApprovalDecision='Approved'|'Rejected'|'Overridden'|'Snoozed';
type ApprovalGate='AUTO-APPROVE'|'HUMAN REVIEW'|'BLOCK';
type ApprovalRecord={
  actionKey:string;
  decision:ApprovalDecision;
  reviewer:string;
  note:string;
  guardrailDecision:ApprovalGate;
  updatedAt:string;
  snoozedUntil?:string;
  snapshot:{toolName:string;path:string;priority:string;type:string;title:string;query:string};
};
type ApprovalState={approvals:Record<string,ApprovalRecord>;revision:number};

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
  rollbackContent:string;
};
type DeploymentState={
  version:1;
  revision:number;
  updatedAt:string;
  records:Record<string,DeploymentRecord>;
};
type DeploymentPayload={
  mode?:unknown;
  actionKey?:unknown;
  links?:unknown;
  draftId?:unknown;
  deploymentId?:unknown;
};

type GithubFile={sha:string;content:string};
type GithubWriteResult={commitSha:string;contentSha:string};

const deploymentStorageKey='toolmera-seo-deployment-state-v1';
const repo='SviatF/toolmera-com';
const branch='main';
const registryPath='src/data/internalLinkBoosts.ts';
const maxRecords=120;

function apiJson(data:unknown,status=200){
  return new Response(JSON.stringify(data),{
    status,
    headers:{
      'content-type':'application/json; charset=utf-8',
      'cache-control':'no-store',
      'x-robots-tag':'noindex, nofollow',
    },
  });
}

function blankState():DeploymentState{
  return {version:1,revision:0,updatedAt:'',records:{}};
}

function asString(value:unknown,max=240){
  return typeof value==='string'?value.trim().slice(0,max):'';
}

function normalizePath(value:string){
  try{
    const pathname=new URL(value,'https://toolmera.com').pathname||'/';
    return pathname==='/'?'/':pathname.replace(/\/+$/,'')+'/';
  }catch{return value}
}

function toolPath(tool:Tool){return normalizePath(toolUrl(tool))}

function encodeUtf8(value:string){
  const bytes=new TextEncoder().encode(value);
  let binary='';
  for(let i=0;i<bytes.length;i+=0x8000){
    binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
  }
  return btoa(binary);
}

function decodeUtf8(value:string){
  const binary=atob(value.replace(/\s+/g,''));
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function githubHeaders(token?:string){
  const headers=new Headers({
    'accept':'application/vnd.github+json',
    'user-agent':'toolmera-seo-deployment-worker',
    'x-github-api-version':'2022-11-28',
  });
  if(token)headers.set('authorization',`Bearer ${token}`);
  return headers;
}

async function readRegistry(token?:string):Promise<GithubFile>{
  const url=`https://api.github.com/repos/${repo}/contents/${registryPath}?ref=${encodeURIComponent(branch)}`;
  const response=await fetch(url,{headers:githubHeaders(token)});
  const payload=await response.json() as {sha?:string;content?:string;message?:string};
  if(!response.ok||!payload.sha||!payload.content)throw new Error(payload.message||`GitHub registry read failed (${response.status}).`);
  return {sha:payload.sha,content:decodeUtf8(payload.content)};
}

async function writeRegistry(token:string,currentSha:string,content:string,message:string):Promise<GithubWriteResult>{
  const url=`https://api.github.com/repos/${repo}/contents/${registryPath}`;
  const response=await fetch(url,{
    method:'PUT',
    headers:new Headers({...Object.fromEntries(githubHeaders(token).entries()),'content-type':'application/json'}),
    body:JSON.stringify({message,content:encodeUtf8(content),sha:currentSha,branch}),
  });
  const payload=await response.json() as {commit?:{sha?:string};content?:{sha?:string};message?:string};
  const commitSha=payload.commit?.sha||'';
  const contentSha=payload.content?.sha||'';
  if(!response.ok||!commitSha||!contentSha)throw new Error(payload.message||`GitHub registry write failed (${response.status}).`);
  return {commitSha,contentSha};
}

function quote(value:string){
  return value.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r?\n/g,' ');
}

function buildRegistryContent(original:string,links:DeployLink[]){
  const marker='export const internalLinkBoosts:InternalLinkBoost[]=[';
  const start=original.indexOf(marker);
  if(start<0)throw new Error('Internal-link registry marker was not found.');
  const end=original.indexOf('\n];',start);
  if(end<0)throw new Error('Internal-link registry closing marker was not found.');

  const additions=links.filter(link=>!original.includes(`{from:'${quote(link.from)}',to:'${quote(link.to)}'`));
  if(!additions.length)return {content:original,additions:[] as DeployLink[],diff:''};
  const lines=additions.map(link=>`  {from:'${quote(link.from)}',to:'${quote(link.to)}',anchor:'${quote(link.anchor)}',reason:'${quote(link.reason)}'},`);
  const content=original.slice(0,end)+`\n${lines.join('\n')}`+original.slice(end);
  return {content,additions,diff:lines.map(line=>`+${line}`).join('\n')};
}

function publicState(state:DeploymentState,configured:boolean){
  const records=Object.fromEntries(Object.entries(state.records).map(([id,record])=>{
    const {rollbackContent,...safe}=record;
    void rollbackContent;
    return [id,safe];
  }));
  return {...state,records,githubConfigured:configured,repo,branch,registryPath};
}

function trimRecords(records:Record<string,DeploymentRecord>){
  const ordered=Object.values(records).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,maxRecords);
  return Object.fromEntries(ordered.map(record=>[record.id,record]));
}

function parseLinks(value:unknown):DeployLink[]{
  if(!Array.isArray(value)||value.length<1||value.length>3)throw new Error('Deployment must contain 1–3 internal links.');
  const seen=new Set<string>();
  return value.map(item=>{
    if(!item||typeof item!=='object'||Array.isArray(item))throw new Error('Invalid internal-link payload.');
    const record=item as Record<string,unknown>;
    const from=asString(record.from,100);
    const to=asString(record.to,100);
    const anchor=asString(record.anchor,100);
    const reason=asString(record.reason,240);
    if(!/^[a-z0-9-]+$/.test(from)||!/^[a-z0-9-]+$/.test(to))throw new Error('Invalid tool id in deployment payload.');
    if(!anchor||anchor.length<3)throw new Error('Every deployed link needs a natural anchor.');
    const signature=`${from}->${to}`;
    if(seen.has(signature))throw new Error('Duplicate source-target pair in deployment payload.');
    seen.add(signature);
    return {from,to,anchor,reason:reason||'Approved contextual internal-link deployment.'};
  });
}

function validateLinks(links:DeployLink[],target:Tool){
  const targetRelated=new Set(semanticRelatedTools(target,tools,10).map(item=>item.id));
  for(const link of links){
    const source=tools.find(item=>item.id===link.from);
    const targetTool=tools.find(item=>item.id===link.to);
    if(!source||!targetTool)throw new Error('Deployment references an unknown tool.');
    if(targetTool.id!==target.id)throw new Error('Every link must target the approved page.');
    if(source.id===target.id)throw new Error('A page cannot link to itself.');
    const semanticPair=targetRelated.has(source.id);
    const sameCluster=source.category===target.category;
    if(!semanticPair&&!sameCluster)throw new Error(`${source.name} is outside the approved semantic cluster.`);
    if(semanticRelatedTools(source,tools,4).some(item=>item.id===target.id))throw new Error(`${source.name} already links to ${target.name} through the base semantic graph.`);
  }
}

export class SeoDeploymentStore{
  private state:DurableObjectStateLike;
  private env:DeployEnv;

  constructor(state:DurableObjectStateLike,env:DeployEnv){this.state=state;this.env=env}

  private async approvalFor(actionKey:string){
    if(!this.env.SEO_TASKS)throw new Error('SEO approval storage is not configured.');
    const id=this.env.SEO_TASKS.idFromName('toolmera-global-seo-tasks');
    const stub=this.env.SEO_TASKS.get(id);
    const response=await stub.fetch(new Request('https://seo-task-store/approvals'));
    if(!response.ok)throw new Error('Could not validate the approval state.');
    const state=await response.json() as ApprovalState;
    const approval=state.approvals?.[actionKey];
    if(!approval)throw new Error('This action has no persistent approval.');
    if(approval.decision!=='Approved'&&approval.decision!=='Overridden')throw new Error(`Action is ${approval.decision}; deployment is not allowed.`);
    if(approval.snapshot.type!=='Internal links')throw new Error('Only approved Internal links actions are deployable in this version.');
    const target=tools.find(item=>toolPath(item)===normalizePath(approval.snapshot.path));
    if(!target)throw new Error('Could not resolve the approved target tool.');
    return {approval:approval as ApprovalRecord&{decision:'Approved'|'Overridden'},target};
  }

  async fetch(request:Request):Promise<Response>{
    const url=new URL(request.url);
    if(url.pathname!=='/state')return apiJson({error:'Not found'},404);
    const configured=Boolean(this.env.GITHUB_DEPLOY_TOKEN);

    if(request.method==='GET'){
      const current=await this.state.storage.get<DeploymentState>(deploymentStorageKey)||blankState();
      return apiJson(publicState(current,configured));
    }

    if(request.method!=='POST')return apiJson({error:'Method not allowed'},405);

    let payload:DeploymentPayload;
    try{payload=await request.json() as DeploymentPayload}
    catch{return apiJson({error:'Invalid JSON request body.'},400)}

    try{
      const mode=asString(payload.mode,30);
      const current=await this.state.storage.get<DeploymentState>(deploymentStorageKey)||blankState();
      const now=new Date().toISOString();

      if(mode==='dry-run'){
        const actionKey=asString(payload.actionKey,220);
        if(!actionKey)throw new Error('Action key is required.');
        const {approval,target}=await this.approvalFor(actionKey);
        const links=parseLinks(payload.links);
        validateLinks(links,target);
        const file=await readRegistry(this.env.GITHUB_DEPLOY_TOKEN);
        const built=buildRegistryContent(file.content,links);
        if(!built.additions.length)return apiJson({error:'All proposed links are already deployed.'},409);
        const id=`dry-${crypto.randomUUID()}`;
        const record:DeploymentRecord={
          id,actionKey,targetToolId:target.id,
          approvalDecision:approval.decision,
          reviewer:approval.reviewer,
          status:'Dry run',createdAt:now,updatedAt:now,
          baseSha:file.sha,links:built.additions,diff:built.diff,rollbackContent:file.content,
        };
        const next:DeploymentState={version:1,revision:current.revision+1,updatedAt:now,records:trimRecords({...current.records,[id]:record})};
        await this.state.storage.put(deploymentStorageKey,next);
        return apiJson({...publicState(next,configured),record:publicState({...next,records:{[id]:record}},configured).records[id]});
      }

      if(mode==='deploy'){
        if(!this.env.GITHUB_DEPLOY_TOKEN)return apiJson({error:'GITHUB_DEPLOY_TOKEN is not configured. Dry-run is available, but repository writes are disabled.'},503);
        const draftId=asString(payload.draftId,120);
        const draft=current.records[draftId];
        if(!draft||draft.status!=='Dry run')throw new Error('A valid dry-run draft is required before deployment.');
        await this.approvalFor(draft.actionKey);
        const file=await readRegistry(this.env.GITHUB_DEPLOY_TOKEN);
        if(file.sha!==draft.baseSha)return apiJson({error:'Registry changed after this dry run. Refresh and create a new preflight before deploying.'},409);
        const built=buildRegistryContent(draft.rollbackContent,draft.links);
        if(!built.additions.length)return apiJson({error:'No deployable registry changes remain.'},409);
        const write=await writeRegistry(this.env.GITHUB_DEPLOY_TOKEN,file.sha,built.content,`Deploy approved SEO internal links for ${draft.targetToolId}`);
        const updated:DeploymentRecord={...draft,status:'Deployed',updatedAt:now,deployedAt:now,commitSha:write.commitSha,deployedBlobSha:write.contentSha,error:undefined};
        const next:DeploymentState={version:1,revision:current.revision+1,updatedAt:now,records:trimRecords({...current.records,[draftId]:updated})};
        await this.state.storage.put(deploymentStorageKey,next);
        return apiJson({...publicState(next,configured),record:publicState({...next,records:{[draftId]:updated}},configured).records[draftId]});
      }

      if(mode==='rollback'){
        if(!this.env.GITHUB_DEPLOY_TOKEN)return apiJson({error:'GITHUB_DEPLOY_TOKEN is not configured. Rollback is disabled.'},503);
        const deploymentId=asString(payload.deploymentId,120);
        const record=current.records[deploymentId];
        if(!record||record.status!=='Deployed'||!record.deployedBlobSha)throw new Error('Only a currently deployed change can be rolled back.');
        const file=await readRegistry(this.env.GITHUB_DEPLOY_TOKEN);
        if(file.sha!==record.deployedBlobSha)return apiJson({error:'The registry changed after this deployment. Automatic rollback is blocked to avoid erasing newer SEO changes.'},409);
        const write=await writeRegistry(this.env.GITHUB_DEPLOY_TOKEN,file.sha,record.rollbackContent,`Rollback SEO internal links for ${record.targetToolId}`);
        const updated:DeploymentRecord={...record,status:'Rolled back',updatedAt:now,rolledBackAt:now,rollbackCommitSha:write.commitSha,error:undefined};
        const next:DeploymentState={version:1,revision:current.revision+1,updatedAt:now,records:trimRecords({...current.records,[deploymentId]:updated})};
        await this.state.storage.put(deploymentStorageKey,next);
        return apiJson({...publicState(next,configured),record:publicState({...next,records:{[deploymentId]:updated}},configured).records[deploymentId]});
      }

      return apiJson({error:'Unknown deployment mode.'},400);
    }catch(error){
      return apiJson({error:error instanceof Error?error.message:'SEO deployment failed.'},400);
    }
  }
}

async function handleDeployment(request:Request,env:DeployEnv){
  if(env.REQUIRE_ACCESS==='true'&&!request.headers.get('Cf-Access-Jwt-Assertion'))return apiJson({error:'Unauthorized'},401);
  if(!env.SEO_DEPLOYMENTS)return apiJson({error:'SEO deployment storage is not configured.'},503);
  const id=env.SEO_DEPLOYMENTS.idFromName('toolmera-global-seo-deployments');
  const stub=env.SEO_DEPLOYMENTS.get(id);
  const headers=new Headers();
  const contentType=request.headers.get('content-type');
  if(contentType)headers.set('content-type',contentType);
  return stub.fetch(new Request('https://seo-deployment-store/state',{
    method:request.method,
    headers,
    body:request.method==='GET'||request.method==='HEAD'?undefined:request.body,
  }));
}

export default{
  async fetch(request:Request,env:DeployEnv):Promise<Response>{
    const url=new URL(request.url);
    if(url.pathname==='/api/admin/seo-deployments')return handleDeployment(request,env);
    return taskWorker.fetch(request,env as any);
  },
};
