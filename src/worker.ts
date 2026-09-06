type AssetBinding = { fetch(request: Request): Promise<Response> };

interface Env {
  ASSETS: AssetBinding;
  GOOGLE_CLIENT_EMAIL?: string;
  GOOGLE_PRIVATE_KEY?: string;
  GSC_SITE_URL?: string;
  GA4_PROPERTY_ID?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_ZONE_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  BING_API_KEY?: string;
  REQUIRE_ACCESS?: string;
}

type GscRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type Ga4Header = { name?: string };
type Ga4Value = { value?: string };
type Ga4Row = { dimensionValues?: Ga4Value[]; metricValues?: Ga4Value[] };
type Ga4Report = {
  dimensionHeaders?: Ga4Header[];
  metricHeaders?: Ga4Header[];
  rows?: Ga4Row[];
};
type Ga4BatchReport = { reports?: Ga4Report[] };

type CfAdaptiveRow = {
  count?: number;
  sum?: { visits?: number; edgeResponseBytes?: number };
  dimensions?: {
    clientCountryName?: string;
    clientRequestPath?: string;
    edgeResponseStatus?: number;
    datetimeHour?: string;
  };
};
type CfGraphqlResponse = {
  data?: {
    viewer?: {
      zones?: {
        overview?: CfAdaptiveRow[];
        countries?: CfAdaptiveRow[];
        paths?: CfAdaptiveRow[];
        statuses?: CfAdaptiveRow[];
        trend?: CfAdaptiveRow[];
      }[];
    };
  };
  errors?: { message?: string }[];
};

type BingEnvelope<T> = { d?: T[] };
type BingTrafficRow = {
  Clicks?: number;
  Impressions?: number;
  Date?: string;
};
type BingQueryRow = {
  AvgClickPosition?: number;
  AvgImpressionPosition?: number;
  Clicks?: number;
  Date?: string;
  Impressions?: number;
  Query?: string;
};
type BingCrawlRow = {
  AllOtherCodes?: number;
  BlockedByRobotsTxt?: number;
  Code2xx?: number;
  Code301?: number;
  Code302?: number;
  Code4xx?: number;
  Code5xx?: number;
  ConnectionTimeout?: number;
  ContainsMalware?: number;
  CrawledPages?: number;
  CrawlErrors?: number;
  Date?: string;
  DnsFailures?: number;
  InIndex?: number;
  InLinks?: number;
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });

function b64url(input: Uint8Array | string) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function pemToArrayBuffer(pem: string) {
  const normalized = pem.replace(/\\n/g, '\n');
  const body = normalized
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function googleAccessToken(env: Env, scopes: string[]) {
  if (!env.GOOGLE_CLIENT_EMAIL || !env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Google service account is not configured.');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(JSON.stringify({
    iss: env.GOOGLE_CLIENT_EMAIL,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claims}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(env.GOOGLE_PRIVATE_KEY),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned),
  );
  const assertion = `${unsigned}.${b64url(new Uint8Array(signature))}`;

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google auth failed: ${response.status} ${detail.slice(0, 300)}`);
  }

  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error('Google did not return an access token.');
  return data.access_token;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dateWindow(range: string) {
  const days = range === 'today' ? 1 : range === '7d' ? 7 : range === '3m' ? 90 : 28;
  // Search Console final data normally trails real time, so avoid the most recent two days.
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 2);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days + 1);

  const prevEnd = new Date(start);
  prevEnd.setUTCDate(prevEnd.getUTCDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setUTCDate(prevStart.getUTCDate() - days + 1);

  return {
    days,
    startDate: isoDate(start),
    endDate: isoDate(end),
    previousStartDate: isoDate(prevStart),
    previousEndDate: isoDate(prevEnd),
  };
}

async function gscQuery(
  token: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  dimensions: string[] = [],
  rowLimit = 1000,
) {
  const endpoint =
    'https://searchconsole.googleapis.com/webmasters/v3/sites/' +
    encodeURIComponent(siteUrl) +
    '/searchAnalytics/query';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions,
      rowLimit,
      dataState: 'final',
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GSC query failed: ${response.status} ${detail.slice(0, 500)}`);
  }

  const data = await response.json() as { rows?: GscRow[] };
  return data.rows || [];
}

function aggregate(rows: GscRow[]) {
  const row = rows[0] || {};
  return {
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  };
}

function percentChange(current: number, previous: number) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / previous) * 100;
}


function ga4DateWindow(range:string){
  const days=range==='today'?1:range==='7d'?7:range==='3m'?90:28;
  const end=new Date();
  const start=new Date(end);
  start.setUTCDate(start.getUTCDate()-days+1);

  const previousEnd=new Date(start);
  previousEnd.setUTCDate(previousEnd.getUTCDate()-1);
  const previousStart=new Date(previousEnd);
  previousStart.setUTCDate(previousStart.getUTCDate()-days+1);

  return {
    days,
    startDate:isoDate(start),
    endDate:isoDate(end),
    previousStartDate:isoDate(previousStart),
    previousEndDate:isoDate(previousEnd),
  };
}

async function ga4RunReport(
  token:string,
  propertyId:string,
  startDate:string,
  endDate:string,
  dimensions:string[],
  metrics:string[],
  limit=100,
){
  let response:Response;
  try{
    response=await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method:'POST',
        headers:{
          authorization:`Bearer ${token}`,
          'content-type':'application/json',
        },
        body:JSON.stringify({
          dateRanges:[{startDate,endDate}],
          dimensions:dimensions.map(name=>({name})),
          metrics:metrics.map(name=>({name})),
          limit,
          keepEmptyRows:false,
        }),
      },
    );
  }catch(error){
    throw new Error(`GA4 network request failed for [${dimensions.join(',')||'summary'}]: ${error instanceof Error?error.message:'unknown fetch error'}`);
  }

  if(!response.ok){
    const detail=await response.text();
    throw new Error(`GA4 Data API failed: ${response.status} ${detail.slice(0,700)}`);
  }
  return await response.json() as Ga4Report;
}


async function ga4BatchRunReports(
  token:string,
  propertyId:string,
  requests:{
    startDate:string;
    endDate:string;
    dimensions:string[];
    metrics:string[];
    limit?:number;
  }[],
){
  if(requests.length>5)throw new Error('GA4 batchRunReports supports at most 5 reports per request.');
  let response:Response;
  try{
    response=await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`,
      {
        method:'POST',
        headers:{
          authorization:`Bearer ${token}`,
          'content-type':'application/json',
        },
        body:JSON.stringify({
          requests:requests.map(item=>({
            dateRanges:[{startDate:item.startDate,endDate:item.endDate}],
            dimensions:item.dimensions.map(name=>({name})),
            metrics:item.metrics.map(name=>({name})),
            limit:item.limit??100,
            keepEmptyRows:false,
          })),
        }),
      },
    );
  }catch(error){
    throw new Error(`GA4 batch network request failed: ${error instanceof Error?error.message:'unknown fetch error'}`);
  }

  const body=await response.text();
  if(!response.ok){
    throw new Error(`GA4 Data API batch failed: ${response.status} ${body.slice(0,1000)}`);
  }
  let parsed:Ga4BatchReport;
  try{parsed=JSON.parse(body) as Ga4BatchReport}
  catch{throw new Error('GA4 Data API returned invalid JSON.')}
  return parsed.reports||[];
}

function ga4Rows(report:Ga4Report){
  const dimensions=(report.dimensionHeaders||[]).map(h=>h.name||'');
  const metrics=(report.metricHeaders||[]).map(h=>h.name||'');
  return (report.rows||[]).map(row=>{
    const out:Record<string,string|number>={};
    dimensions.forEach((name,index)=>{out[name]=row.dimensionValues?.[index]?.value||''});
    metrics.forEach((name,index)=>{
      const raw=row.metricValues?.[index]?.value||'0';
      out[name]=Number(raw);
    });
    return out;
  });
}

function ga4Summary(report:Ga4Report){
  const row=ga4Rows(report)[0]||{};
  return {
    users:Number(row.totalUsers||0),
    sessions:Number(row.sessions||0),
    pageViews:Number(row.screenPageViews||0),
    engagedSessions:Number(row.engagedSessions||0),
    engagementRate:Number(row.engagementRate||0),
    averageSessionDuration:Number(row.averageSessionDuration||0),
  };
}

async function handleGa4(request:Request,env:Env){
  if(!env.GA4_PROPERTY_ID||!env.GOOGLE_CLIENT_EMAIL||!env.GOOGLE_PRIVATE_KEY){
    return json({
      connected:false,
      code:'NOT_CONFIGURED',
      message:'Google Analytics 4 service account is not configured yet.',
    },503);
  }

  const url=new URL(request.url);
  const range=url.searchParams.get('range')||'28d';
  const window=ga4DateWindow(range);
  const token=await googleAccessToken(env,['https://www.googleapis.com/auth/analytics.readonly']);
  const propertyId=env.GA4_PROPERTY_ID;

  const reports=await ga4BatchRunReports(token,propertyId,[
    {
      startDate:window.startDate,endDate:window.endDate,dimensions:[],
      metrics:['totalUsers','sessions','screenPageViews','engagedSessions','engagementRate','averageSessionDuration'],limit:1
    },
    {
      startDate:window.previousStartDate,endDate:window.previousEndDate,dimensions:[],
      metrics:['totalUsers','sessions','screenPageViews','engagedSessions','engagementRate','averageSessionDuration'],limit:1
    },
    {
      startDate:window.startDate,endDate:window.endDate,dimensions:['landingPagePlusQueryString'],
      metrics:['sessions','totalUsers','screenPageViews','engagementRate'],limit:100
    },
    {
      startDate:window.startDate,endDate:window.endDate,dimensions:['country'],
      metrics:['totalUsers','sessions','screenPageViews'],limit:100
    },
    {
      startDate:window.startDate,endDate:window.endDate,dimensions:['eventName'],
      metrics:['eventCount','totalUsers'],limit:100
    },
  ]);

  const [summaryReport={},previousReport={},landingReport={},countryReport={},eventReport={}]=reports;
  const trendReport=await ga4RunReport(
    token,propertyId,window.startDate,window.endDate,['date'],
    ['totalUsers','sessions','screenPageViews'],100
  );

  const current=ga4Summary(summaryReport);
  const previous=ga4Summary(previousReport);

  const landing=ga4Rows(landingReport)
    .map(row=>({
      page:String(row.landingPagePlusQueryString||'(not set)'),
      sessions:Number(row.sessions||0),
      users:Number(row.totalUsers||0),
      pageViews:Number(row.screenPageViews||0),
      engagementRate:Number(row.engagementRate||0),
    }))
    .filter(row=>!row.page.startsWith('/admin'))
    .sort((a,b)=>b.sessions-a.sessions);

  const countries=ga4Rows(countryReport)
    .map(row=>({
      country:String(row.country||'(not set)'),
      users:Number(row.totalUsers||0),
      sessions:Number(row.sessions||0),
      pageViews:Number(row.screenPageViews||0),
    }))
    .sort((a,b)=>b.users-a.users);

  const events=ga4Rows(eventReport)
    .map(row=>({
      event:String(row.eventName||'(not set)'),
      count:Number(row.eventCount||0),
      users:Number(row.totalUsers||0),
    }))
    .sort((a,b)=>b.count-a.count);

  const trend=ga4Rows(trendReport)
    .map(row=>({
      date:String(row.date||''),
      users:Number(row.totalUsers||0),
      sessions:Number(row.sessions||0),
      pageViews:Number(row.screenPageViews||0),
    }))
    .sort((a,b)=>a.date.localeCompare(b.date));

  return json({
    connected:true,
    source:'Google Analytics 4',
    propertyId,
    range,
    window,
    summary:{
      ...current,
      changes:{
        users:percentChange(current.users,previous.users),
        sessions:percentChange(current.sessions,previous.sessions),
        pageViews:percentChange(current.pageViews,previous.pageViews),
        engagementRate:percentChange(current.engagementRate,previous.engagementRate),
      },
    },
    landingPages:landing,
    countries,
    events,
    trend,
    fetchedAt:new Date().toISOString(),
  });
}


function cfIso(date:Date){return date.toISOString().replace(/\.\d{3}Z$/,'Z')}

async function handleCloudflare(env:Env){
  if(!env.CLOUDFLARE_ZONE_ID||!env.CLOUDFLARE_API_TOKEN){
    return json({
      connected:false,
      code:'NOT_CONFIGURED',
      message:'Cloudflare Analytics credentials are not configured yet.'
    },503);
  }

  // On Cloudflare Free, adaptive HTTP analytics has a short query window.
  // Keep this dashboard panel to the most recent 24 hours for reliable results.
  const end=new Date();
  const start=new Date(end.getTime()-24*60*60*1000);
  const filter={
    datetime_geq:cfIso(start),
    datetime_lt:cfIso(end),
    requestSource:'eyeball'
  };

  const query=`
    query ToolmeraEdge($zoneTag: string, $filter: ZoneHttpRequestsAdaptiveGroupsFilter_InputObject) {
      viewer {
        zones(filter: {zoneTag: $zoneTag}) {
          overview: httpRequestsAdaptiveGroups(limit: 1, filter: $filter) {
            count
            sum { visits edgeResponseBytes }
          }
          countries: httpRequestsAdaptiveGroups(limit: 12, filter: $filter, orderBy: [count_DESC]) {
            count
            sum { visits edgeResponseBytes }
            dimensions { clientCountryName }
          }
          paths: httpRequestsAdaptiveGroups(limit: 12, filter: $filter, orderBy: [count_DESC]) {
            count
            sum { visits edgeResponseBytes }
            dimensions { clientRequestPath }
          }
          statuses: httpRequestsAdaptiveGroups(limit: 20, filter: $filter, orderBy: [count_DESC]) {
            count
            dimensions { edgeResponseStatus }
          }
          trend: httpRequestsAdaptiveGroups(limit: 48, filter: $filter, orderBy: [datetimeHour_ASC]) {
            count
            sum { visits edgeResponseBytes }
            dimensions { datetimeHour }
          }
        }
      }
    }
  `;

  const response=await fetch('https://api.cloudflare.com/client/v4/graphql',{
    method:'POST',
    headers:{
      authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN,
      'content-type':'application/json'
    },
    body:JSON.stringify({
      query,
      variables:{zoneTag:env.CLOUDFLARE_ZONE_ID,filter}
    })
  });

  const raw=await response.text();
  let parsed:CfGraphqlResponse;
  try{parsed=JSON.parse(raw) as CfGraphqlResponse}
  catch{throw new Error('Cloudflare Analytics returned invalid JSON.')}

  if(!response.ok||parsed.errors?.length){
    const detail=parsed.errors?.map(item=>item.message).filter(Boolean).join('; ')||raw.slice(0,1000);
    throw new Error('Cloudflare Analytics API failed: '+response.status+' '+detail);
  }

  const zone=parsed.data?.viewer?.zones?.[0];
  if(!zone)throw new Error('Cloudflare Analytics returned no zone data. Check Zone ID and token resource scope.');

  const overview=zone.overview?.[0]||{};
  const statuses=(zone.statuses||[]).map(row=>({
    status:Number(row.dimensions?.edgeResponseStatus||0),
    requests:Number(row.count||0)
  }));
  const errorRequests=statuses
    .filter(row=>row.status>=400)
    .reduce((sum,row)=>sum+row.requests,0);

  return json({
    connected:true,
    source:'Cloudflare Analytics',
    window:{start:cfIso(start),end:cfIso(end),label:'Last 24 hours'},
    summary:{
      requests:Number(overview.count||0),
      visits:Number(overview.sum?.visits||0),
      bandwidthBytes:Number(overview.sum?.edgeResponseBytes||0),
      errorRequests,
      errorRate:overview.count?errorRequests/Number(overview.count):0
    },
    countries:(zone.countries||[]).map(row=>({
      country:row.dimensions?.clientCountryName||'Unknown',
      requests:Number(row.count||0),
      visits:Number(row.sum?.visits||0),
      bandwidthBytes:Number(row.sum?.edgeResponseBytes||0)
    })),
    paths:(zone.paths||[])
      .filter(row=>!(row.dimensions?.clientRequestPath||'').startsWith('/admin'))
      .map(row=>({
        path:row.dimensions?.clientRequestPath||'/',
        requests:Number(row.count||0),
        visits:Number(row.sum?.visits||0),
        bandwidthBytes:Number(row.sum?.edgeResponseBytes||0)
      })),
    statuses,
    trend:(zone.trend||[]).map(row=>({
      hour:row.dimensions?.datetimeHour||'',
      requests:Number(row.count||0),
      visits:Number(row.sum?.visits||0),
      bandwidthBytes:Number(row.sum?.edgeResponseBytes||0)
    })),
    fetchedAt:new Date().toISOString()
  });
}


function bingDate(value?:string){
  if(!value)return null;
  const match=value.match(/\/Date\((\d+)/);
  if(match)return new Date(Number(match[1]));
  const parsed=new Date(value);
  return Number.isNaN(parsed.getTime())?null:parsed;
}

async function bingGet<T>(method:string,apiKey:string,siteUrl:string){
  const endpoint=new URL('https://ssl.bing.com/webmaster/api.svc/json/'+method);
  endpoint.searchParams.set('apikey',apiKey);
  endpoint.searchParams.set('siteUrl',siteUrl);

  const response=await fetch(endpoint.toString(),{
    headers:{accept:'application/json'}
  });
  const raw=await response.text();
  if(!response.ok)throw new Error('Bing Webmaster API '+method+' failed: '+response.status+' '+raw.slice(0,900));

  let data:BingEnvelope<T>;
  try{data=JSON.parse(raw) as BingEnvelope<T>}
  catch{throw new Error('Bing Webmaster API '+method+' returned invalid JSON.')}
  return data.d||[];
}

async function handleBing(request:Request,env:Env){
  if(!env.BING_API_KEY){
    return json({
      connected:false,
      code:'NOT_CONFIGURED',
      message:'Bing Webmaster Tools API key is not configured yet.'
    },503);
  }

  const siteUrl='https://toolmera.com/';
  const url=new URL(request.url);
  const range=url.searchParams.get('range')||'28d';
  const window=dateWindow(range);
  const start=new Date(window.startDate+'T00:00:00Z');
  const end=new Date(window.endDate+'T23:59:59Z');

  const traffic=await bingGet<BingTrafficRow>('GetRankAndTrafficStats',env.BING_API_KEY,siteUrl);
  const pages=await bingGet<BingQueryRow>('GetPageStats',env.BING_API_KEY,siteUrl);
  const queries=await bingGet<BingQueryRow>('GetQueryStats',env.BING_API_KEY,siteUrl);
  const crawl=await bingGet<BingCrawlRow>('GetCrawlStats',env.BING_API_KEY,siteUrl);

  const trafficRows=traffic
    .map(row=>({...row,_date:bingDate(row.Date)}))
    .filter(row=>!row._date||(row._date>=start&&row._date<=end))
    .sort((a,b)=>(a._date?.getTime()||0)-(b._date?.getTime()||0));

  const clicks=trafficRows.reduce((sum,row)=>sum+Number(row.Clicks||0),0);
  const impressions=trafficRows.reduce((sum,row)=>sum+Number(row.Impressions||0),0);

  const latestCrawl=[...crawl]
    .map(row=>({...row,_date:bingDate(row.Date)}))
    .sort((a,b)=>(b._date?.getTime()||0)-(a._date?.getTime()||0))[0];

  return json({
    connected:true,
    source:'Bing Webmaster Tools',
    siteUrl,
    range,
    window,
    summary:{
      clicks,
      impressions,
      ctr:impressions?clicks/impressions:0,
      indexedPages:Number(latestCrawl?.InIndex||0),
      crawledPages:Number(latestCrawl?.CrawledPages||0),
      crawlErrors:Number(latestCrawl?.CrawlErrors||0),
      inLinks:Number(latestCrawl?.InLinks||0)
    },
    trend:trafficRows.map(row=>({
      date:row._date?isoDate(row._date):'',
      clicks:Number(row.Clicks||0),
      impressions:Number(row.Impressions||0)
    })),
    pages:pages
      .map(row=>({
        page:String(row.Query||''),
        clicks:Number(row.Clicks||0),
        impressions:Number(row.Impressions||0),
        avgPosition:Number(row.AvgImpressionPosition||0)
      }))
      .filter(row=>!row.page.includes('/admin'))
      .sort((a,b)=>b.impressions-a.impressions)
      .slice(0,100),
    queries:queries
      .map(row=>({
        query:String(row.Query||''),
        clicks:Number(row.Clicks||0),
        impressions:Number(row.Impressions||0),
        avgPosition:Number(row.AvgImpressionPosition||0)
      }))
      .sort((a,b)=>b.impressions-a.impressions)
      .slice(0,100),
    crawl:latestCrawl?{
      date:latestCrawl._date?isoDate(latestCrawl._date):null,
      code2xx:Number(latestCrawl.Code2xx||0),
      code301:Number(latestCrawl.Code301||0),
      code302:Number(latestCrawl.Code302||0),
      code4xx:Number(latestCrawl.Code4xx||0),
      code5xx:Number(latestCrawl.Code5xx||0),
      blockedByRobotsTxt:Number(latestCrawl.BlockedByRobotsTxt||0),
      dnsFailures:Number(latestCrawl.DnsFailures||0),
      connectionTimeout:Number(latestCrawl.ConnectionTimeout||0),
      containsMalware:Number(latestCrawl.ContainsMalware||0)
    }:null,
    fetchedAt:new Date().toISOString()
  });
}

async function sitemapCount(env: Env) {
  try {
    const response = await env.ASSETS.fetch(new Request('https://toolmera.com/sitemap.xml'));
    if (!response.ok) return null;
    const xml = await response.text();
    return (xml.match(/<loc>/g) || []).length;
  } catch {
    return null;
  }
}

function hasAccess(request: Request, env: Env) {
  if (env.REQUIRE_ACCESS !== 'true') return true;
  return Boolean(request.headers.get('Cf-Access-Jwt-Assertion'));
}

async function handleStatus(env: Env) {
  const gscMissing=[
    !env.GOOGLE_CLIENT_EMAIL?'GOOGLE_CLIENT_EMAIL':null,
    !env.GOOGLE_PRIVATE_KEY?'GOOGLE_PRIVATE_KEY':null,
    !env.GSC_SITE_URL?'GSC_SITE_URL':null,
  ].filter(Boolean);
  const ga4Missing=[
    !env.GOOGLE_CLIENT_EMAIL?'GOOGLE_CLIENT_EMAIL':null,
    !env.GOOGLE_PRIVATE_KEY?'GOOGLE_PRIVATE_KEY':null,
    !env.GA4_PROPERTY_ID?'GA4_PROPERTY_ID':null,
  ].filter(Boolean);
  const cloudflareMissing=[
    !env.CLOUDFLARE_ZONE_ID?'CLOUDFLARE_ZONE_ID':null,
    !env.CLOUDFLARE_API_TOKEN?'CLOUDFLARE_API_TOKEN':null,
  ].filter(Boolean);
  const bingMissing=[
    !env.BING_API_KEY?'BING_API_KEY':null,
  ].filter(Boolean);
  const googleConfigured = gscMissing.length===0;
  return json({
    mode: googleConfigured ? 'live-ready' : 'setup',
    domain: 'toolmera.com',
    sitemapUrl: 'https://toolmera.com/sitemap.xml',
    sitemapUrls: await sitemapCount(env),
    integrations: {
      gsc: {
        configured: googleConfigured,
        siteUrl: env.GSC_SITE_URL || null,
        missing: gscMissing,
      },
      ga4: {
        configured: ga4Missing.length===0,
        propertyId: env.GA4_PROPERTY_ID ? 'configured' : null,
        missing: ga4Missing,
      },
      cloudflare: {
        configured: cloudflareMissing.length===0,
        missing: cloudflareMissing,
      },
      bing: {
        configured: bingMissing.length===0,
        missing: bingMissing,
      },
    },
  });
}

async function handleGsc(request: Request, env: Env) {
  if (!env.GSC_SITE_URL || !env.GOOGLE_CLIENT_EMAIL || !env.GOOGLE_PRIVATE_KEY) {
    return json({
      connected: false,
      code: 'NOT_CONFIGURED',
      message: 'Google Search Console service account is not configured yet.',
    }, 503);
  }

  const url = new URL(request.url);
  const range = url.searchParams.get('range') || '28d';
  const window = dateWindow(range);
  const token = await googleAccessToken(env, ['https://www.googleapis.com/auth/webmasters.readonly']);
  const site = env.GSC_SITE_URL;

  const [
    summaryRows,
    previousRows,
    pageRows,
    queryRows,
    countryRows,
    trendRows,
    pairRows,
  ] = await Promise.all([
    gscQuery(token, site, window.startDate, window.endDate, [], 1),
    gscQuery(token, site, window.previousStartDate, window.previousEndDate, [], 1),
    gscQuery(token, site, window.startDate, window.endDate, ['page'], 250),
    gscQuery(token, site, window.startDate, window.endDate, ['query'], 500),
    gscQuery(token, site, window.startDate, window.endDate, ['country'], 100),
    gscQuery(token, site, window.startDate, window.endDate, ['date'], 100),
    gscQuery(token, site, window.startDate, window.endDate, ['query', 'page'], 500),
  ]);

  const current = aggregate(summaryRows);
  const previous = aggregate(previousRows);

  return json({
    connected: true,
    source: 'Google Search Console',
    siteUrl: site,
    range,
    window,
    summary: {
      ...current,
      changes: {
        clicks: percentChange(current.clicks, previous.clicks),
        impressions: percentChange(current.impressions, previous.impressions),
        ctr: percentChange(current.ctr, previous.ctr),
        position: percentChange(current.position, previous.position),
      },
    },
    pages: pageRows.map(row => ({
      page: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    })),
    queries: queryRows.map(row => ({
      query: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    })),
    countries: countryRows.map(row => ({
      country: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    })),
    trend: trendRows.map(row => ({
      date: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    })),
    queryPages: pairRows.map(row => ({
      query: row.keys?.[0] || '',
      page: row.keys?.[1] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    })),
    fetchedAt: new Date().toISOString(),
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    let url:URL|undefined;
    try{
      url=new URL(request.url);

      if(url.hostname==='www.toolmera.com'){
        return Response.redirect(`https://toolmera.com${url.pathname}${url.search}`,301);
      }

      if(url.pathname.startsWith('/api/admin/')){
        if(!hasAccess(request,env))return json({error:'Unauthorized'},401);

        if(url.pathname==='/api/admin/status')return await handleStatus(env);
        if(url.pathname==='/api/admin/gsc')return await handleGsc(request,env);
        if(url.pathname==='/api/admin/ga4')return await handleGa4(request,env);
        if(url.pathname==='/api/admin/cloudflare')return await handleCloudflare(env);
        if(url.pathname==='/api/admin/bing')return await handleBing(request,env);
        return json({error:'Not found'},404);
      }

      return await env.ASSETS.fetch(request);
    }catch(error){
      const detail=error instanceof Error?`${error.name}: ${error.message}`:String(error);
      console.error('TOOLMERA_WORKER_ERROR',{
        path:url?.pathname||'unknown',
        detail,
        stack:error instanceof Error?error.stack:undefined,
      });
      if(url?.pathname.startsWith('/api/')){
        return json({error:'Worker request failed.',detail},500);
      }
      return new Response('Toolmera Worker error',{status:500,headers:{'content-type':'text/plain; charset=utf-8'}});
    }
  },
};
