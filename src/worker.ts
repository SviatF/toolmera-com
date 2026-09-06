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

type UrlInspectionApiResponse = {
  inspectionResult?: {
    indexStatusResult?: {
      verdict?: string;
      coverageState?: string;
      robotsTxtState?: string;
      indexingState?: string;
      lastCrawlTime?: string;
      pageFetchState?: string;
      googleCanonical?: string;
      userCanonical?: string;
      crawledAs?: string;
      sitemap?: string[];
      referringUrls?: string[];
    };
  };
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


async function sitemapUrlList(env:Env){
  const response=await env.ASSETS.fetch(new Request('https://toolmera.com/sitemap.xml'));
  if(!response.ok)throw new Error('Could not read sitemap.xml: '+response.status);
  const xml=await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(match=>match[1]?.trim())
    .filter((url):url is string=>Boolean(url));
}

function normalizeCanonical(value?:string){
  if(!value)return '';
  try{
    const url=new URL(value);
    const path=url.pathname==='/'?'/':url.pathname.replace(/\/+$/,'')+'/';
    return url.origin.toLowerCase()+path+(url.search||'');
  }catch{return value.replace(/\/+$/,'')+'/'}
}

async function inspectGoogleUrl(token:string,siteUrl:string,inspectionUrl:string){
  const response=await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',{
    method:'POST',
    headers:{
      authorization:'Bearer '+token,
      'content-type':'application/json'
    },
    body:JSON.stringify({
      inspectionUrl,
      siteUrl,
      languageCode:'en-US'
    })
  });

  const raw=await response.text();
  if(!response.ok)throw new Error('URL Inspection failed: '+response.status+' '+raw.slice(0,700));

  let data:UrlInspectionApiResponse;
  try{data=JSON.parse(raw) as UrlInspectionApiResponse}
  catch{throw new Error('URL Inspection returned invalid JSON.')}

  const result=data.inspectionResult?.indexStatusResult||{};
  const userCanonical=result.userCanonical||'';
  const googleCanonical=result.googleCanonical||'';
  const canonicalMatch=Boolean(userCanonical&&googleCanonical)&&normalizeCanonical(userCanonical)===normalizeCanonical(googleCanonical);

  return {
    url:inspectionUrl,
    verdict:result.verdict||'VERDICT_UNSPECIFIED',
    indexed:result.verdict==='PASS',
    coverageState:result.coverageState||'Unknown',
    robotsTxtState:result.robotsTxtState||'ROBOTS_TXT_STATE_UNSPECIFIED',
    indexingState:result.indexingState||'INDEXING_STATE_UNSPECIFIED',
    pageFetchState:result.pageFetchState||'PAGE_FETCH_STATE_UNSPECIFIED',
    lastCrawlTime:result.lastCrawlTime||null,
    googleCanonical:googleCanonical||null,
    userCanonical:userCanonical||null,
    canonicalMatch:userCanonical&&googleCanonical?canonicalMatch:null,
    crawledAs:result.crawledAs||null,
    sitemapKnown:Boolean(result.sitemap?.length),
    referringUrls:Number(result.referringUrls?.length||0)
  };
}

async function handleIndexing(request:Request,env:Env){
  if(!env.GSC_SITE_URL||!env.GOOGLE_CLIENT_EMAIL||!env.GOOGLE_PRIVATE_KEY){
    return json({
      connected:false,
      code:'NOT_CONFIGURED',
      message:'Google Search Console service account is not configured yet.'
    },503);
  }

  const url=new URL(request.url);
  const offset=Math.max(0,Number(url.searchParams.get('offset')||0));
  const requestedLimit=Math.max(1,Number(url.searchParams.get('limit')||10));
  const limit=Math.min(10,requestedLimit);
  const urls=await sitemapUrlList(env);
  const slice=urls.slice(offset,offset+limit);
  const token=await googleAccessToken(env,['https://www.googleapis.com/auth/webmasters.readonly']);
  const results=[];

  // Intentionally sequential to keep Worker subrequests/connections predictable.
  for(const inspectionUrl of slice){
    try{
      results.push(await inspectGoogleUrl(token,env.GSC_SITE_URL,inspectionUrl));
    }catch(error){
      results.push({
        url:inspectionUrl,
        verdict:'ERROR',
        indexed:false,
        coverageState:'Inspection error',
        robotsTxtState:'UNKNOWN',
        indexingState:'UNKNOWN',
        pageFetchState:'UNKNOWN',
        lastCrawlTime:null,
        googleCanonical:null,
        userCanonical:null,
        canonicalMatch:null,
        crawledAs:null,
        sitemapKnown:false,
        referringUrls:0,
        error:error instanceof Error?error.message:String(error)
      });
    }
  }

  return json({
    connected:true,
    source:'Google URL Inspection',
    total:urls.length,
    offset,
    limit,
    nextOffset:offset+slice.length<urls.length?offset+slice.length:null,
    results,
    fetchedAt:new Date().toISOString()
  });
}


type WebsiteAnalysisMode='full'|'traffic'|'seo'|'meta'|'status'|'redirect'|'robots'|'sitemap'|'ssl'|'security'|'technology';

type PublicFetchResult={
  requestedUrl:string;
  finalUrl:string;
  status:number;
  statusText:string;
  headers:Record<string,string>;
  redirectChain:{url:string;status:number;location:string|null}[];
  elapsedMs:number;
  text:string;
};

function normalizePublicUrl(value:string){
  const trimmed=value.trim();
  if(!trimmed)throw new Error('Enter a public website URL.');
  const candidate=/^https?:\/\//i.test(trimmed)?trimmed:'https://'+trimmed;
  const url=new URL(candidate);
  if(url.protocol!=='http:'&&url.protocol!=='https:')throw new Error('Only HTTP and HTTPS URLs are supported.');
  if(url.username||url.password)throw new Error('URLs with embedded credentials are not supported.');
  if(url.port&&url.port!=='80'&&url.port!=='443')throw new Error('Only standard HTTP and HTTPS ports are supported.');
  assertPublicHostname(url.hostname);
  url.hash='';
  return url;
}

function assertPublicHostname(hostname:string){
  const host=hostname.toLowerCase().replace(/^\[|\]$/g,'');
  if(
    host==='localhost'||host.endsWith('.localhost')||host.endsWith('.local')||
    host.endsWith('.internal')||host==='metadata.google.internal'||host==='0.0.0.0'||
    host==='::'||host==='::1'||host.startsWith('fc')||host.startsWith('fd')||host.startsWith('fe80:')
  )throw new Error('Private or local network addresses are not allowed.');

  const ipv4=host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if(ipv4){
    const parts=ipv4.slice(1).map(Number);
    if(parts.some(part=>part<0||part>255))throw new Error('Invalid IP address.');
    const [a,b]=parts;
    if(
      a===0||a===10||a===127||a>=224||
      (a===100&&b>=64&&b<=127)||
      (a===169&&b===254)||
      (a===172&&b>=16&&b<=31)||
      (a===192&&b===168)
    )throw new Error('Private or reserved IP addresses are not allowed.');
  }
}

async function readResponseTextLimited(response:Response,maxBytes=1200000){
  if(!response.body)return '';
  const reader=response.body.getReader();
  const decoder=new TextDecoder();
  let total=0;
  let output='';
  try{
    while(true){
      const {done,value}=await reader.read();
      if(done)break;
      if(!value)continue;
      const remaining=maxBytes-total;
      if(remaining<=0){await reader.cancel();break}
      const chunk=value.byteLength>remaining?value.slice(0,remaining):value;
      total+=chunk.byteLength;
      output+=decoder.decode(chunk,{stream:true});
      if(value.byteLength>remaining){await reader.cancel();break}
    }
  }finally{
    output+=decoder.decode();
  }
  return output;
}

async function fetchPublicPage(value:string,maxRedirects=5,maxBytes=1200000):Promise<PublicFetchResult>{
  let current=normalizePublicUrl(value);
  const requestedUrl=current.toString();
  const redirectChain:{url:string;status:number;location:string|null}[]=[];
  const started=Date.now();

  for(let hop=0;hop<=maxRedirects;hop++){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),10000);
    let response:Response;
    try{
      response=await fetch(current.toString(),{
        redirect:'manual',
        signal:controller.signal,
        headers:{
          accept:'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5',
          'user-agent':'ToolmeraSiteAnalyzer/1.0 (+https://toolmera.com/website-analysis/)'
        }
      });
    }finally{clearTimeout(timer)}

    const location=response.headers.get('location');
    redirectChain.push({url:current.toString(),status:response.status,location});
    if(response.status>=300&&response.status<400&&location){
      if(hop===maxRedirects)throw new Error('Redirect chain is longer than '+maxRedirects+' hops.');
      const next=new URL(location,current);
      if(next.protocol!=='http:'&&next.protocol!=='https:')throw new Error('Redirect points to an unsupported protocol.');
      if(next.port&&next.port!=='80'&&next.port!=='443')throw new Error('Redirect points to a non-standard port.');
      assertPublicHostname(next.hostname);
      current=next;
      continue;
    }

    const headers:Record<string,string>={};
    response.headers.forEach((value,key)=>{headers[key.toLowerCase()]=value});
    const text=await readResponseTextLimited(response,maxBytes);
    return{
      requestedUrl,
      finalUrl:current.toString(),
      status:response.status,
      statusText:response.statusText,
      headers,
      redirectChain,
      elapsedMs:Date.now()-started,
      text
    };
  }
  throw new Error('Could not resolve the URL.');
}

function htmlDecode(value:string){
  return value
    .replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'")
    .replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&nbsp;/gi,' ')
    .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)));
}

function tagAttr(tag:string,name:string){
  const doubleQuoted=tag.match(new RegExp("(?:^|\\s)"+name+"\\s*=\\s*\"([^\"]*)\"","i"));
  if(doubleQuoted)return htmlDecode((doubleQuoted[1]||'').trim());
  const singleQuoted=tag.match(new RegExp("(?:^|\\s)"+name+"\\s*=\\s*'([^']*)'","i"));
  if(singleQuoted)return htmlDecode((singleQuoted[1]||'').trim());
  const bare=tag.match(new RegExp("(?:^|\\s)"+name+"\\s*=\\s*([^\\s>]+)","i"));
  return htmlDecode((bare?.[1]||'').trim());
}

function stripHtml(value:string){
  return htmlDecode(value.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
}

function metaValue(html:string,key:string,attribute='name'){
  const tags=html.match(/<meta\b[^>]*>/gi)||[];
  for(const tag of tags){
    if(tagAttr(tag,attribute).toLowerCase()===key.toLowerCase())return tagAttr(tag,'content');
  }
  return '';
}

function linkValue(html:string,relName:string){
  const tags=html.match(/<link\b[^>]*>/gi)||[];
  for(const tag of tags){
    const rel=tagAttr(tag,'rel').toLowerCase().split(/\s+/);
    if(rel.includes(relName.toLowerCase()))return tagAttr(tag,'href');
  }
  return '';
}

function headingValues(html:string,level:number,limit=30){
  const values:string[]=[];
  const re=new RegExp('<h'+level+'\\b[^>]*>([\\s\\S]*?)<\\/h'+level+'>','gi');
  let match:RegExpExecArray|null;
  while((match=re.exec(html))&&values.length<limit){
    const value=stripHtml(match[1]||'');
    if(value)values.push(value);
  }
  return values;
}

function extractSchemaTypes(html:string){
  const scripts=[...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const types=new Set<string>();
  for(const script of scripts.slice(0,30)){
    for(const match of (script[1]||'').matchAll(/"@type"\s*:\s*"([^"]+)"/g))types.add(match[1]);
    for(const match of (script[1]||'').matchAll(/"@type"\s*:\s*\[([^\]]+)\]/g)){
      for(const item of match[1].matchAll(/"([^"]+)"/g))types.add(item[1]);
    }
  }
  return [...types].slice(0,30);
}

function analyzeHtml(page:PublicFetchResult){
  const html=page.text;
  const title=stripHtml(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
  const description=metaValue(html,'description');
  const canonical=linkValue(html,'canonical');
  const robots=metaValue(html,'robots');
  const viewport=metaValue(html,'viewport');
  const generator=metaValue(html,'generator');
  const lang=tagAttr(html.match(/<html\b[^>]*>/i)?.[0]||'','lang');
  const charset=(()=>{
    const tags=html.match(/<meta\b[^>]*>/gi)||[];
    for(const tag of tags){
      const direct=tagAttr(tag,'charset');
      if(direct)return direct;
      if(tagAttr(tag,'http-equiv').toLowerCase()==='content-type'){
        const match=tagAttr(tag,'content').match(/charset=([^;\s]+)/i);
        if(match)return match[1];
      }
    }
    return '';
  })();

  const anchorTags=html.match(/<a\b[^>]*>/gi)||[];
  let internalLinks=0,externalLinks=0;
  let origin='';
  try{origin=new URL(page.finalUrl).origin}catch{}
  for(const tag of anchorTags.slice(0,5000)){
    const href=tagAttr(tag,'href');
    if(!href||href.startsWith('#')||/^(mailto:|tel:|javascript:)/i.test(href))continue;
    try{
      const target=new URL(href,page.finalUrl);
      if(target.origin===origin)internalLinks++;else externalLinks++;
    }catch{}
  }

  const imageTags=html.match(/<img\b[^>]*>/gi)||[];
  const missingAlt=imageTags.filter(tag=>!/\salt\s*=/i.test(tag)||tagAttr(tag,'alt').trim()==='').length;

  return{
    title,
    titleLength:title.length,
    description,
    descriptionLength:description.length,
    canonical,
    robots,
    viewport,
    lang,
    charset,
    generator,
    openGraph:{
      title:metaValue(html,'og:title','property'),
      description:metaValue(html,'og:description','property'),
      image:metaValue(html,'og:image','property'),
      url:metaValue(html,'og:url','property'),
      type:metaValue(html,'og:type','property')
    },
    twitter:{
      card:metaValue(html,'twitter:card'),
      title:metaValue(html,'twitter:title'),
      description:metaValue(html,'twitter:description'),
      image:metaValue(html,'twitter:image')
    },
    headings:{h1:headingValues(html,1),h2:headingValues(html,2),h3:headingValues(html,3)},
    links:{total:internalLinks+externalLinks,internal:internalLinks,external:externalLinks},
    images:{total:imageTags.length,missingAlt},
    schemaTypes:extractSchemaTypes(html)
  };
}

function securitySignals(headers:Record<string,string>,finalUrl:string){
  const values={
    hsts:headers['strict-transport-security']||'',
    csp:headers['content-security-policy']||'',
    xFrameOptions:headers['x-frame-options']||'',
    xContentTypeOptions:headers['x-content-type-options']||'',
    referrerPolicy:headers['referrer-policy']||'',
    permissionsPolicy:headers['permissions-policy']||''
  };
  const present=Object.values(values).filter(Boolean).length;
  const https=finalUrl.startsWith('https://');
  const points=present+(https?1:0);
  const grade=points>=7?'A':points===6?'B':points===5?'C':points>=3?'D':'F';
  return{https,grade,present,total:6,headers:values};
}

function detectTechnologies(page:PublicFetchResult,html:{generator:string}){
  const source=page.text;
  const headers=page.headers;
  const found=new Set<string>();
  const add=(name:string,condition:boolean)=>{if(condition)found.add(name)};
  add('WordPress',/wp-content|wp-includes|wordpress/i.test(source)||/wordpress/i.test(html.generator));
  add('Shopify',/cdn\.shopify\.com|shopify\.theme|shopify-section/i.test(source));
  add('Next.js',/__NEXT_DATA__|\/_next\/|next-route-announcer/i.test(source));
  add('React',/data-reactroot|react-dom|react\.production/i.test(source));
  add('Vue.js',/__vue__|data-v-[a-f0-9]{6,}|vue\.runtime/i.test(source));
  add('Nuxt',/__NUXT__|\/_nuxt\//i.test(source));
  add('Cloudflare',/cloudflare/i.test(headers['server']||'')||Boolean(headers['cf-ray']));
  add('Vercel',Boolean(headers['x-vercel-id'])||/vercel/i.test(headers['server']||''));
  add('Google Analytics',/googletagmanager\.com\/gtag\/js|gtag\s*\(\s*['"]config/i.test(source));
  add('Google Tag Manager',/googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]+/i.test(source));
  add('Meta Pixel',/connect\.facebook\.net\/.*fbevents\.js|fbq\s*\(/i.test(source));
  add('Hotjar',/static\.hotjar\.com|hj\s*\(/i.test(source));
  add('Stripe',/js\.stripe\.com|stripe\.com\/v3/i.test(source));
  add('jQuery',/jquery(?:\.min)?\.js|jquery-[\d.]+/i.test(source));
  add('Bootstrap',/bootstrap(?:\.min)?\.(?:css|js)/i.test(source));
  if(html.generator)found.add('Generator: '+html.generator);
  return [...found];
}

function robotsSummary(text:string,url:string,status:number){
  const sitemaps=[...text.matchAll(/^\s*Sitemap:\s*(\S+)/gim)].map(m=>m[1]).slice(0,20);
  const blocksAll=/User-agent:\s*\*[\s\S]{0,800}?Disallow:\s*\/\s*(?:#.*)?$/im.test(text);
  const userAgents=(text.match(/^\s*User-agent:/gim)||[]).length;
  const disallows=(text.match(/^\s*Disallow:/gim)||[]).length;
  const allows=(text.match(/^\s*Allow:/gim)||[]).length;
  return{url,status,available:status>=200&&status<300,blocksAll,sitemaps,userAgents,disallows,allows,preview:text.slice(0,10000)};
}

function sitemapSummary(text:string,url:string,status:number){
  const urls=[...text.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(m=>htmlDecode(m[1].trim()));
  const urlEntries=(text.match(/<url(?:\s|>)/gi)||[]).length;
  const sitemapEntries=(text.match(/<sitemap(?:\s|>)/gi)||[]).length;
  const lastmod=(text.match(/<lastmod(?:\s|>)/gi)||[]).length;
  return{
    url,status,available:status>=200&&status<300,
    type:sitemapEntries?'sitemap-index':urlEntries?'urlset':'unknown',
    urlCount:urlEntries,
    sitemapCount:sitemapEntries,
    lastmodCount:lastmod,
    sampleUrls:urls.slice(0,12)
  };
}

function seoScore(page:PublicFetchResult,html:ReturnType<typeof analyzeHtml>,robots:ReturnType<typeof robotsSummary>|null,sitemap:ReturnType<typeof sitemapSummary>|null){
  const checks=[
    page.status>=200&&page.status<300,
    html.title.length>=20&&html.title.length<=65,
    html.description.length>=60&&html.description.length<=180,
    html.headings.h1.length===1,
    Boolean(html.canonical),
    !/\bnoindex\b/i.test(html.robots),
    Boolean(html.viewport),
    html.images.total===0||html.images.missingAlt/html.images.total<=0.1,
    html.schemaTypes.length>0,
    Boolean(robots?.available),
    Boolean(sitemap?.available)
  ];
  return Math.round(checks.filter(Boolean).length/checks.length*100);
}

async function fetchRobots(origin:string){
  const result=await fetchPublicPage(new URL('/robots.txt',origin).toString(),3,250000);
  return robotsSummary(result.text,result.finalUrl,result.status);
}

async function fetchSitemap(origin:string,declared:string[]=[]){
  let candidate=new URL('/sitemap.xml',origin).toString();
  for(const value of declared){
    try{
      const parsed=normalizePublicUrl(value);
      if(parsed.origin===new URL(origin).origin){candidate=parsed.toString();break}
    }catch{}
  }
  const result=await fetchPublicPage(candidate,3,900000);
  return sitemapSummary(result.text,result.finalUrl,result.status);
}

type TrancoRankRow={date:string;rank:number};

function trafficPopularityLevel(rank:number|null){
  if(!rank)return 'Limited public data';
  if(rank<=1000)return 'Very high';
  if(rank<=10000)return 'High';
  if(rank<=100000)return 'Strong';
  if(rank<=500000)return 'Moderate';
  return 'Visible';
}

async function fetchTrafficPopularity(domain:string){
  const base={
    domain,
    source:'Tranco 30-day popularity ranking',
    sourceAvailable:true,
    ranked:false,
    latestRank:null as number|null,
    averageRank30d:null as number|null,
    bestRank30d:null as number|null,
    worstRank30d:null as number|null,
    change30d:null as number|null,
    popularityLevel:'Limited public data',
    daysObserved:0,
    history:[] as TrancoRankRow[],
    note:'Popularity rank is a public traffic/popularity proxy, not a monthly visit count or first-party analytics measurement.',
    error:'' as string
  };
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  try{
    const response=await fetch('https://tranco-list.eu/api/ranks/domain/'+encodeURIComponent(domain),{
      signal:controller.signal,
      headers:{accept:'application/json','user-agent':'ToolmeraTrafficChecker/1.0 (+https://toolmera.com/website-analysis/website-traffic-checker/)'}
    });
    if(response.status===404)return base;
    if(!response.ok)throw new Error('Popularity source returned HTTP '+response.status+'.');
    const payload=await response.json() as {ranks?:{date?:unknown;rank?:unknown}[]};
    const rows=(Array.isArray(payload.ranks)?payload.ranks:[])
      .map(row=>({date:String(row.date||''),rank:Number(row.rank)}))
      .filter(row=>/^\d{4}-\d{2}-\d{2}$/.test(row.date)&&Number.isFinite(row.rank)&&row.rank>0)
      .sort((a,b)=>a.date.localeCompare(b.date))
      .slice(-30);
    if(!rows.length)return base;
    const latest=rows[rows.length-1].rank;
    const oldest=rows[0].rank;
    const ranks=rows.map(row=>row.rank);
    return{
      ...base,
      ranked:true,
      latestRank:latest,
      averageRank30d:Math.round(ranks.reduce((sum,rank)=>sum+rank,0)/ranks.length),
      bestRank30d:Math.min(...ranks),
      worstRank30d:Math.max(...ranks),
      change30d:oldest-latest,
      popularityLevel:trafficPopularityLevel(latest),
      daysObserved:rows.length,
      history:rows
    };
  }catch(error){
    return{...base,sourceAvailable:false,error:error instanceof Error?error.message:String(error)};
  }finally{clearTimeout(timer)}
}

async function handleWebsiteAnalysis(request:Request){
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  let body:{url?:string;mode?:WebsiteAnalysisMode};
  try{body=await request.json() as {url?:string;mode?:WebsiteAnalysisMode}}
  catch{return json({error:'Invalid JSON request body.'},400)}

  const mode:WebsiteAnalysisMode=body.mode||'full';
  const allowed:WebsiteAnalysisMode[]=['full','traffic','seo','meta','status','redirect','robots','sitemap','ssl','security','technology'];
  if(!allowed.includes(mode))return json({error:'Unsupported analysis mode.'},400);

  try{
    const input=normalizePublicUrl(body.url||'');
    if(mode==='traffic'){
      const domain=input.hostname.toLowerCase().replace(/^www\./,'');
      const [traffic,pageResult]=await Promise.all([
        fetchTrafficPopularity(domain),
        fetchPublicPage(input.toString(),5,300000).catch(()=>null)
      ]);
      const page=pageResult?{
        requestedUrl:pageResult.requestedUrl,
        finalUrl:pageResult.finalUrl,
        status:pageResult.status,
        statusText:pageResult.statusText,
        elapsedMs:pageResult.elapsedMs,
        redirects:pageResult.redirectChain,
        headers:{
          server:pageResult.headers['server']||'',
          contentType:pageResult.headers['content-type']||'',
          cacheControl:pageResult.headers['cache-control']||'',
          contentEncoding:pageResult.headers['content-encoding']||'',
          xRobotsTag:pageResult.headers['x-robots-tag']||'',
          location:pageResult.headers['location']||''
        },
        htmlBytes:new TextEncoder().encode(pageResult.text).byteLength
      }:undefined;
      return json({mode,inputUrl:input.toString(),traffic,page,fetchedAt:new Date().toISOString()});
    }
    if(mode==='robots'){
      const robots=await fetchRobots(input.origin);
      return json({mode,inputUrl:input.toString(),robots,fetchedAt:new Date().toISOString()});
    }
    if(mode==='sitemap'){
      let robots:ReturnType<typeof robotsSummary>|null=null;
      try{robots=await fetchRobots(input.origin)}catch{}
      const sitemap=await fetchSitemap(input.origin,robots?.sitemaps||[]);
      return json({mode,inputUrl:input.toString(),robots,sitemap,fetchedAt:new Date().toISOString()});
    }

    const page=await fetchPublicPage(input.toString());
    const html=analyzeHtml(page);
    const security=securitySignals(page.headers,page.finalUrl);
    const technologies=detectTechnologies(page,html);
    let robots:ReturnType<typeof robotsSummary>|null=null;
    let sitemap:ReturnType<typeof sitemapSummary>|null=null;

    if(mode==='full'||mode==='seo'){
      const origin=new URL(page.finalUrl).origin;
      try{robots=await fetchRobots(origin)}catch{}
      try{sitemap=await fetchSitemap(origin,robots?.sitemaps||[])}catch{}
    }

    let httpRedirectToHttps:boolean|null=null;
    if(mode==='ssl'){
      try{
        const final=new URL(page.finalUrl);
        const httpUrl=new URL(final.toString());
        httpUrl.protocol='http:';
        httpUrl.port='';
        const httpCheck=await fetchPublicPage(httpUrl.toString(),5,4096);
        httpRedirectToHttps=httpCheck.finalUrl.startsWith('https://');
      }catch{httpRedirectToHttps=null}
    }

    const safeHeaders={
      server:page.headers['server']||'',
      contentType:page.headers['content-type']||'',
      cacheControl:page.headers['cache-control']||'',
      contentEncoding:page.headers['content-encoding']||'',
      xRobotsTag:page.headers['x-robots-tag']||'',
      location:page.headers['location']||''
    };

    return json({
      mode,
      inputUrl:input.toString(),
      page:{
        requestedUrl:page.requestedUrl,
        finalUrl:page.finalUrl,
        status:page.status,
        statusText:page.statusText,
        elapsedMs:page.elapsedMs,
        redirects:page.redirectChain,
        headers:safeHeaders,
        htmlBytes:new TextEncoder().encode(page.text).byteLength
      },
      meta:html,
      robots,
      sitemap,
      security,
      ssl:{
        https:security.https,
        secureConnection:security.https&&page.status>0,
        hsts:Boolean(security.headers.hsts),
        httpRedirectToHttps
      },
      technologies,
      seoScore:seoScore(page,html,robots,sitemap),
      fetchedAt:new Date().toISOString()
    });
  }catch(error){
    const message=error instanceof Error?error.message:String(error);
    return json({error:message},400);
  }
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

  const [summaryRows,previousRows,pageRows,queryRows]=await Promise.all([
    gscQuery(token,site,window.startDate,window.endDate,[],1),
    gscQuery(token,site,window.previousStartDate,window.previousEndDate,[],1),
    gscQuery(token,site,window.startDate,window.endDate,['page'],250),
    gscQuery(token,site,window.startDate,window.endDate,['query'],500),
  ]);
  const [countryRows,trendRows,pairRows]=await Promise.all([
    gscQuery(token,site,window.startDate,window.endDate,['country'],100),
    gscQuery(token,site,window.startDate,window.endDate,['date'],100),
    gscQuery(token,site,window.startDate,window.endDate,['query','page'],500),
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

      if(url.pathname==='/api/tools/website-analysis')return await handleWebsiteAnalysis(request);

      if(url.pathname.startsWith('/api/admin/')){
        if(!hasAccess(request,env))return json({error:'Unauthorized'},401);

        if(url.pathname==='/api/admin/status')return await handleStatus(env);
        if(url.pathname==='/api/admin/gsc')return await handleGsc(request,env);
        if(url.pathname==='/api/admin/indexing')return await handleIndexing(request,env);
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
