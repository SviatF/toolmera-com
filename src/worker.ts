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
  const response=await fetch(
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

  if(!response.ok){
    const detail=await response.text();
    throw new Error(`GA4 Data API failed: ${response.status} ${detail.slice(0,700)}`);
  }
  return await response.json() as Ga4Report;
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

  const [
    summaryReport,
    previousReport,
    landingReport,
    countryReport,
    eventReport,
    trendReport,
  ]=await Promise.all([
    ga4RunReport(token,propertyId,window.startDate,window.endDate,[],
      ['totalUsers','sessions','screenPageViews','engagedSessions','engagementRate','averageSessionDuration'],1),
    ga4RunReport(token,propertyId,window.previousStartDate,window.previousEndDate,[],
      ['totalUsers','sessions','screenPageViews','engagedSessions','engagementRate','averageSessionDuration'],1),
    ga4RunReport(token,propertyId,window.startDate,window.endDate,['landingPagePlusQueryString'],
      ['sessions','totalUsers','screenPageViews','engagementRate'],100),
    ga4RunReport(token,propertyId,window.startDate,window.endDate,['country'],
      ['totalUsers','sessions','screenPageViews'],100),
    ga4RunReport(token,propertyId,window.startDate,window.endDate,['eventName'],
      ['eventCount','totalUsers'],100),
    ga4RunReport(token,propertyId,window.startDate,window.endDate,['date'],
      ['totalUsers','sessions','screenPageViews'],100),
  ]);

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
        configured: Boolean(env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_ZONE_ID),
      },
      bing: {
        configured: Boolean(env.BING_API_KEY),
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
    const url = new URL(request.url);

    // Canonical host enforcement. Once www.toolmera.com is bound to this Worker,
    // every path and query is permanently redirected to the apex hostname.
    if (url.hostname === 'www.toolmera.com') {
      return Response.redirect(`https://toolmera.com${url.pathname}${url.search}`, 301);
    }

    if (url.pathname.startsWith('/api/admin/')) {
      if (!hasAccess(request, env)) {
        return json({ error: 'Unauthorized' }, 401);
      }

      try {
        if (url.pathname === '/api/admin/status') return handleStatus(env);
        if (url.pathname === '/api/admin/gsc') return handleGsc(request, env);
        if (url.pathname === '/api/admin/ga4') return handleGa4(request, env);
        return json({ error: 'Not found' }, 404);
      } catch (error) {
        return json({
          error: 'Admin API request failed.',
          detail: error instanceof Error ? error.message : 'Unknown error',
        }, 500);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
