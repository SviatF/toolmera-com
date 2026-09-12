export type SeoMetricSnapshot={clicks:number;impressions:number;ctr:number;position:number};
export type SeoVerificationEvent={
  id:string;
  at:string;
  taskId:string;
  kind:'verification';
  snapshot:{
    toolName:string;
    path:string;
    priority:string;
    type:string;
    title:string;
    query:string;
  };
  verification?:string;
  impressionChange?:number|null;
  clickChange?:number|null;
  positionGain?:number;
};

export type OutcomeConfidence='No data'|'Early'|'Directional'|'Strong';
export type OutcomeRecommendation='Learning'|'Promising'|'Strong signal'|'Mixed'|'Caution';

export type OutcomeLearningRow={
  actionType:string;
  total:number;
  decisive:number;
  winners:number;
  neutral:number;
  losers:number;
  lowData:number;
  winRate:number|null;
  score:number;
  confidence:OutcomeConfidence;
  recommendation:OutcomeRecommendation;
  medianImpressionChange:number|null;
  medianClickChange:number|null;
  medianPositionGain:number|null;
  latestAt:string;
};

function finite(value:number|null|undefined):value is number{
  return typeof value==='number'&&Number.isFinite(value);
}

function median(values:number[]){
  if(!values.length)return null;
  const sorted=[...values].sort((a,b)=>a-b);
  const middle=Math.floor(sorted.length/2);
  return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;
}

function confidenceFor(samples:number):OutcomeConfidence{
  if(samples===0)return 'No data';
  if(samples<3)return 'Early';
  if(samples<6)return 'Directional';
  return 'Strong';
}

function recommendationFor(samples:number,score:number,winners:number,losers:number):OutcomeRecommendation{
  if(samples<3)return 'Learning';
  if(samples>=6&&score>=70&&winners>=3)return 'Strong signal';
  if(score>=60&&winners>=2)return 'Promising';
  if(score<=40&&losers>=2)return 'Caution';
  return 'Mixed';
}

export function buildOutcomeLearning(history:SeoVerificationEvent[]):OutcomeLearningRow[]{
  const groups=new Map<string,SeoVerificationEvent[]>();
  history.forEach(event=>{
    if(event.kind!=='verification')return;
    const type=(event.snapshot?.type||'Other').trim()||'Other';
    const list=groups.get(type)||[];
    list.push(event);
    groups.set(type,list);
  });

  return [...groups.entries()].map(([actionType,events])=>{
    const winners=events.filter(event=>event.verification==='Winner').length;
    const neutral=events.filter(event=>event.verification==='Neutral').length;
    const losers=events.filter(event=>event.verification==='Loser').length;
    const lowData=events.filter(event=>event.verification==='Low data').length;
    const decisive=winners+neutral+losers;
    // Shrink small samples toward 50 so one early win cannot dominate the learning table.
    const signed=winners-losers;
    const score=Math.round(Math.max(5,Math.min(95,50+45*(signed/(decisive+3)))));
    const winRate=decisive?winners/decisive:null;
    const medianImpressionChange=median(events.map(event=>event.impressionChange).filter(finite));
    const medianClickChange=median(events.map(event=>event.clickChange).filter(finite));
    const medianPositionGain=median(events.map(event=>event.positionGain).filter(finite));
    return {
      actionType,
      total:events.length,
      decisive,
      winners,
      neutral,
      losers,
      lowData,
      winRate,
      score,
      confidence:confidenceFor(decisive),
      recommendation:recommendationFor(decisive,score,winners,losers),
      medianImpressionChange,
      medianClickChange,
      medianPositionGain,
      latestAt:events.reduce((latest,event)=>event.at>latest?event.at:latest,''),
    };
  }).sort((a,b)=>(b.score-a.score)||(b.decisive-a.decisive)||(b.total-a.total)||a.actionType.localeCompare(b.actionType));
}
