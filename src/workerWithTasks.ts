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

type TaskWorkerEnv={SEO_TASKS?:DurableObjectNamespaceLike};
type SharedTaskState={
  version:1;
  tasks:Record<string,unknown>;
  owner:string;
  updatedAt:string;
  revision:number;
};

type StatePayload={tasks?:unknown;owner?:unknown};

const storageKey='toolmera-seo-task-state-v1';

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
  return {version:1,tasks:{},owner:'Sviat',updatedAt:'',revision:0};
}

function isPlainRecord(value:unknown):value is Record<string,unknown>{
  return Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
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

export class SeoTaskStore{
  private state:DurableObjectStateLike;

  constructor(state:DurableObjectStateLike){this.state=state}

  async fetch(request:Request):Promise<Response>{
    const url=new URL(request.url);
    if(url.pathname!=='/state')return apiJson({error:'Not found'},404);

    if(request.method==='GET'){
      const current=await this.state.storage.get<SharedTaskState>(storageKey);
      return apiJson(current||blankState());
    }

    if(request.method==='PUT'){
      let payload:StatePayload;
      try{payload=await request.json() as StatePayload}
      catch{return apiJson({error:'Invalid JSON request body.'},400)}
      try{
        const clean=sanitizePayload(payload);
        const current=await this.state.storage.get<SharedTaskState>(storageKey);
        const next:SharedTaskState={
          version:1,
          tasks:clean.tasks,
          owner:clean.owner,
          updatedAt:new Date().toISOString(),
          revision:(current?.revision||0)+1,
        };
        await this.state.storage.put(storageKey,next);
        return apiJson(next);
      }catch(error){
        return apiJson({error:error instanceof Error?error.message:'Invalid task state.'},400);
      }
    }

    return apiJson({error:'Method not allowed'},405);
  }
}

async function handleSharedTaskState(request:Request,env:TaskWorkerEnv){
  if(!env.SEO_TASKS){
    return apiJson({
      connected:false,
      code:'TASK_STORE_NOT_CONFIGURED',
      message:'Shared SEO task storage is not configured.',
    },503);
  }
  const id=env.SEO_TASKS.idFromName('toolmera-global-seo-tasks');
  const stub=env.SEO_TASKS.get(id);
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

export default{
  async fetch(request:Request,env:TaskWorkerEnv):Promise<Response>{
    const url=new URL(request.url);
    if(url.pathname==='/api/admin/seo-tasks'){
      return handleSharedTaskState(request,env);
    }
    return baseWorker.fetch(request,env as any);
  },
};
