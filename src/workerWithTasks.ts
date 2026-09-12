import baseWorker from './worker';

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

type TaskWorkerEnv={SEO_TASKS?:DurableObjectNamespaceLike;REQUIRE_ACCESS?:string};
type AuditTaskSnapshot={
  toolName:string;
  path:string;
  priority:string;
  type:string;
  title:string;
  query:string;
};
type AuditMetricSnapshot={clicks:number;impressions:number;ctr:number;position:number};
type AuditVerificationSnapshot={
  verdict:string;
  verifiedAt:string;
  current7?:AuditMetricSnapshot;
  impressionChange?:number|null;
  clickChange?:number|null;
  positionGain?:number;
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
  snapshot:AuditTaskSnapshot;
};
type ApprovalState={
  version:1;
  approvals:Record<string,ApprovalRecord>;
  updatedAt:string;
  revision:number;
};
type AuditEvent={
  id:string;
  at:string;
  revision:number;
  taskId:string;
  kind:'status'|'owner'|'verification'|'approval';
  actor:string;
  from?:string;
  to?:string;
  snapshot:AuditTaskSnapshot;
  baseline7?:AuditMetricSnapshot;
  verifyAt?:string;
  verification?:string;
  current7?:AuditMetricSnapshot;
  impressionChange?:number|null;
  clickChange?:number|null;
  positionGain?:number;
  approval?:ApprovalDecision;
  guardrailDecision?:ApprovalGate;
  note?:string;
  snoozedUntil?:string;
};
type SharedTaskState={
  version:1;
  tasks:Record<string,unknown>;
  owner:string;
  updatedAt:string;
  revision:number;
  history:AuditEvent[];
};

type StatePayload={tasks?:unknown;owner?:unknown};
type ApprovalPayload={
  actionKey?:unknown;
  decision?:unknown;
  reviewer?:unknown;
  note?:unknown;
  guardrailDecision?:unknown;
  snoozedUntil?:unknown;
  snapshot?:unknown;
};

const storageKey='toolmera-seo-task-state-v1';
const approvalStorageKey='toolmera-seo-approval-state-v1';
const historyLimit=500;

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

function blankState():SharedTaskState{
  return {version:1,tasks:{},owner:'Sviat',updatedAt:'',revision:0,history:[]};
}

function blankApprovalState():ApprovalState{
  return {version:1,approvals:{},updatedAt:'',revision:0};
}

function isPlainRecord(value:unknown):value is Record<string,unknown>{
  return Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
}

function asString(value:unknown,fallback=''){
  return typeof value==='string'?value.slice(0,240):fallback;
}

function finiteNumber(value:unknown){
  return typeof value==='number'&&Number.isFinite(value)?value:undefined;
}

function metricSnapshot(value:unknown):AuditMetricSnapshot|undefined{
  if(!isPlainRecord(value))return undefined;
  const number=(input:unknown)=>typeof input==='number'&&Number.isFinite(input)?input:0;
  return{
    clicks:number(value.clicks),
    impressions:number(value.impressions),
    ctr:number(value.ctr),
    position:number(value.position),
  };
}

function verificationSnapshot(value:unknown):AuditVerificationSnapshot|undefined{
  if(!isPlainRecord(value))return undefined;
  const verdict=asString(value.verdict);
  const verifiedAt=asString(value.verifiedAt);
  if(!verdict||!verifiedAt)return undefined;
  const impressionChange=value.impressionChange===null?null:finiteNumber(value.impressionChange);
  const clickChange=value.clickChange===null?null:finiteNumber(value.clickChange);
  return{
    verdict,
    verifiedAt,
    current7:metricSnapshot(value.current7),
    impressionChange,
    clickChange,
    positionGain:finiteNumber(value.positionGain),
  };
}

function taskSnapshot(value:unknown):AuditTaskSnapshot{
  const record=isPlainRecord(value)?value:{};
  const snapshot=isPlainRecord(record.snapshot)?record.snapshot:{};
  return{
    toolName:asString(snapshot.toolName,'Unknown page'),
    path:asString(snapshot.path,'/'),
    priority:asString(snapshot.priority,'—'),
    type:asString(snapshot.type,'Task'),
    title:asString(snapshot.title,'SEO task'),
    query:asString(snapshot.query,''),
  };
}

function approvalSnapshot(value:unknown):AuditTaskSnapshot{
  const snapshot=isPlainRecord(value)?value:{};
  return{
    toolName:asString(snapshot.toolName,'Unknown page').slice(0,120),
    path:asString(snapshot.path,'/').slice(0,220),
    priority:asString(snapshot.priority,'—').slice(0,20),
    type:asString(snapshot.type,'Task').slice(0,80),
    title:asString(snapshot.title,'SEO action').slice(0,240),
    query:asString(snapshot.query,'').slice(0,240),
  };
}

function taskStatus(value:unknown){
  if(!isPlainRecord(value))return 'Open';
  const status=asString(value.status,'Open');
  return ['Open','In progress','Done','Snoozed'].includes(status)?status:'Open';
}

function taskOwner(value:unknown,fallback:string){
  if(!isPlainRecord(value))return fallback;
  return asString(value.owner,fallback).trim()||fallback;
}

function auditEvents(previous:Record<string,unknown>,next:Record<string,unknown>,revision:number,at:string,defaultOwner:string){
  const events:AuditEvent[]=[];
  for(const [taskId,nextValue] of Object.entries(next)){
    if(!isPlainRecord(nextValue))continue;
    const previousValue=previous[taskId];
    const fromStatus=taskStatus(previousValue);
    const toStatus=taskStatus(nextValue);
    const previousOwner=taskOwner(previousValue,defaultOwner);
    const nextOwner=taskOwner(nextValue,defaultOwner);
    const snapshot=taskSnapshot(nextValue);

    if(fromStatus!==toStatus){
      events.push({
        id:`r${revision}-${encodeURIComponent(taskId)}-status`,
        at,revision,taskId,kind:'status',actor:nextOwner||defaultOwner,
        from:fromStatus,to:toStatus,snapshot,
        baseline7:toStatus==='Done'?metricSnapshot(nextValue.baseline7):undefined,
        verifyAt:toStatus==='Done'?asString(nextValue.verifyAt):undefined,
      });
    }

    if(previousOwner!==nextOwner&&nextOwner){
      events.push({
        id:`r${revision}-${encodeURIComponent(taskId)}-owner`,
        at,revision,taskId,kind:'owner',actor:nextOwner,
        from:previousOwner,to:nextOwner,snapshot,
      });
    }

    const previousVerification=isPlainRecord(previousValue)?verificationSnapshot(previousValue.verification):undefined;
    const nextVerification=verificationSnapshot(nextValue.verification);
    if(nextVerification&&(!previousVerification||previousVerification.verifiedAt!==nextVerification.verifiedAt||previousVerification.verdict!==nextVerification.verdict)){
      events.push({
        id:`r${revision}-${encodeURIComponent(taskId)}-verification`,
        at:nextVerification.verifiedAt||at,
        revision,taskId,kind:'verification',actor:'System',snapshot,
        baseline7:metricSnapshot(nextValue.baseline7),
        verifyAt:asString(nextValue.verifyAt),
        verification:nextVerification.verdict,
        current7:nextVerification.current7,
        impressionChange:nextVerification.impressionChange,
        clickChange:nextVerification.clickChange,
        positionGain:nextVerification.positionGain,
      });
    }
  }
  return events;
}

function sanitizePayload(payload:StatePayload){
  const tasks=isPlainRecord(payload.tasks)?payload.tasks:{};
  const entries=Object.entries(tasks);
  if(entries.length>500)throw new Error('Task state is too large.');
  for(const [key,value] of entries){
    if(!key||key.length>160||!isPlainRecord(value))throw new Error('Invalid task record.');
  }
  const owner=typeof payload.owner==='string'?payload.owner.trim().slice(0,80):'Sviat';
  const encoded=JSON.stringify(tasks);
  if(encoded.length>750000)throw new Error('Task state payload is too large.');
  return {tasks,owner:owner||'Admin'};
}

function sanitizeApprovalPayload(payload:ApprovalPayload){
  const actionKey=asString(payload.actionKey).trim().slice(0,220);
  const decision=asString(payload.decision) as ApprovalDecision;
  const reviewer=asString(payload.reviewer).trim().slice(0,80);
  const note=asString(payload.note).trim().slice(0,600);
  const guardrailDecision=asString(payload.guardrailDecision) as ApprovalGate;
  const snoozedUntil=asString(payload.snoozedUntil).trim().slice(0,20);
  if(!actionKey)throw new Error('Approval action key is required.');
  if(!['Approved','Rejected','Overridden','Snoozed'].includes(decision))throw new Error('Invalid approval decision.');
  if(!['AUTO-APPROVE','HUMAN REVIEW','BLOCK'].includes(guardrailDecision))throw new Error('Invalid guardrail decision.');
  if(!reviewer)throw new Error('Reviewer is required.');
  if(decision==='Overridden'&&note.length<4)throw new Error('Override reason is required.');
  if(decision==='Approved'&&guardrailDecision==='BLOCK')throw new Error('Blocked actions require an explicit Override, not Approve.');
  const snapshot=approvalSnapshot(payload.snapshot);
  return {actionKey,decision,reviewer,note,guardrailDecision,snoozedUntil,snapshot};
}

export class SeoTaskStore{
  private state:DurableObjectStateLike;

  constructor(state:DurableObjectStateLike){this.state=state}

  async fetch(request:Request):Promise<Response>{
    const url=new URL(request.url);

    if(url.pathname==='/state'){
      if(request.method==='GET'){
        const current=await this.state.storage.get<SharedTaskState>(storageKey);
        if(!current)return apiJson(blankState());
        return apiJson({...current,history:Array.isArray(current.history)?current.history:[]});
      }

      if(request.method==='PUT'){
        let payload:StatePayload;
        try{payload=await request.json() as StatePayload}
        catch{return apiJson({error:'Invalid JSON request body.'},400)}
        try{
          const clean=sanitizePayload(payload);
          const currentRaw=await this.state.storage.get<SharedTaskState>(storageKey);
          const current=currentRaw?{...currentRaw,history:Array.isArray(currentRaw.history)?currentRaw.history:[]}:blankState();
          const revision=current.revision+1;
          const updatedAt=new Date().toISOString();
          const events=auditEvents(current.tasks,clean.tasks,revision,updatedAt,clean.owner);
          const next:SharedTaskState={
            version:1,
            tasks:clean.tasks,
            owner:clean.owner,
            updatedAt,
            revision,
            history:[...events,...current.history].slice(0,historyLimit),
          };
          await this.state.storage.put(storageKey,next);
          return apiJson(next);
        }catch(error){
          return apiJson({error:error instanceof Error?error.message:'Invalid task state.'},400);
        }
      }

      return apiJson({error:'Method not allowed'},405);
    }

    if(url.pathname==='/approvals'){
      if(request.method==='GET'){
        const current=await this.state.storage.get<ApprovalState>(approvalStorageKey);
        return apiJson(current||blankApprovalState());
      }

      if(request.method==='POST'){
        let payload:ApprovalPayload;
        try{payload=await request.json() as ApprovalPayload}
        catch{return apiJson({error:'Invalid JSON request body.'},400)}
        try{
          const clean=sanitizeApprovalPayload(payload);
          const updatedAt=new Date().toISOString();
          const currentApproval=await this.state.storage.get<ApprovalState>(approvalStorageKey)||blankApprovalState();
          const previous=currentApproval.approvals[clean.actionKey];
          const record:ApprovalRecord={
            actionKey:clean.actionKey,
            decision:clean.decision,
            reviewer:clean.reviewer,
            note:clean.note,
            guardrailDecision:clean.guardrailDecision,
            updatedAt,
            snoozedUntil:clean.decision==='Snoozed'?(clean.snoozedUntil||undefined):undefined,
            snapshot:clean.snapshot,
          };
          const nextApproval:ApprovalState={
            version:1,
            approvals:{...currentApproval.approvals,[clean.actionKey]:record},
            updatedAt,
            revision:currentApproval.revision+1,
          };
          await this.state.storage.put(approvalStorageKey,nextApproval);

          const currentTaskRaw=await this.state.storage.get<SharedTaskState>(storageKey);
          const currentTask=currentTaskRaw?{...currentTaskRaw,history:Array.isArray(currentTaskRaw.history)?currentTaskRaw.history:[]}:blankState();
          const taskRevision=currentTask.revision+1;
          const event:AuditEvent={
            id:`r${taskRevision}-${encodeURIComponent(clean.actionKey)}-approval`,
            at:updatedAt,
            revision:taskRevision,
            taskId:`approval:${clean.actionKey}`,
            kind:'approval',
            actor:clean.reviewer,
            from:previous?.decision,
            to:clean.decision,
            snapshot:clean.snapshot,
            approval:clean.decision,
            guardrailDecision:clean.guardrailDecision,
            note:clean.note||undefined,
            snoozedUntil:record.snoozedUntil,
          };
          const nextTask:SharedTaskState={
            ...currentTask,
            updatedAt,
            revision:taskRevision,
            history:[event,...currentTask.history].slice(0,historyLimit),
          };
          await this.state.storage.put(storageKey,nextTask);
          return apiJson({...nextApproval,record,taskRevision});
        }catch(error){
          return apiJson({error:error instanceof Error?error.message:'Invalid approval decision.'},400);
        }
      }

      return apiJson({error:'Method not allowed'},405);
    }

    return apiJson({error:'Not found'},404);
  }
}

async function taskStoreStub(env:TaskWorkerEnv){
  if(!env.SEO_TASKS)return null;
  const id=env.SEO_TASKS.idFromName('toolmera-global-seo-tasks');
  return env.SEO_TASKS.get(id);
}

async function handleSharedTaskState(request:Request,env:TaskWorkerEnv){
  if(env.REQUIRE_ACCESS==='true'&&!request.headers.get('Cf-Access-Jwt-Assertion'))return apiJson({error:'Unauthorized'},401);
  const stub=await taskStoreStub(env);
  if(!stub){
    return apiJson({connected:false,code:'TASK_STORE_NOT_CONFIGURED',message:'Shared SEO task storage is not configured.'},503);
  }
  const headers=new Headers();
  const contentType=request.headers.get('content-type');
  if(contentType)headers.set('content-type',contentType);
  const forwarded=new Request('https://seo-task-store/state',{
    method:request.method,
    headers,
    body:request.method==='GET'||request.method==='HEAD'?undefined:request.body,
  });
  return stub.fetch(forwarded);
}

async function handleSharedApprovalState(request:Request,env:TaskWorkerEnv){
  if(env.REQUIRE_ACCESS==='true'&&!request.headers.get('Cf-Access-Jwt-Assertion'))return apiJson({error:'Unauthorized'},401);
  const stub=await taskStoreStub(env);
  if(!stub){
    return apiJson({connected:false,code:'TASK_STORE_NOT_CONFIGURED',message:'Shared SEO approval storage is not configured.'},503);
  }
  const headers=new Headers();
  const contentType=request.headers.get('content-type');
  if(contentType)headers.set('content-type',contentType);
  const forwarded=new Request('https://seo-task-store/approvals',{
    method:request.method,
    headers,
    body:request.method==='GET'||request.method==='HEAD'?undefined:request.body,
  });
  return stub.fetch(forwarded);
}

export default{
  async fetch(request:Request,env:TaskWorkerEnv):Promise<Response>{
    const url=new URL(request.url);
    if(url.pathname==='/api/admin/seo-tasks')return handleSharedTaskState(request,env);
    if(url.pathname==='/api/admin/seo-approvals')return handleSharedApprovalState(request,env);
    return baseWorker.fetch(request,env as any);
  },
};
