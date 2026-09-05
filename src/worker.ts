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

async function googleAccessToken(env: Env) {
  if (!env.GOOGLE_CLIENT_EMAIL || !env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Google service account is not configured.');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(JSON.stringify({
    iss: env.GOOGLE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
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
  const googleConfigured = Boolean(env.GOOGLE_CLIENT_EMAIL && env.GOOGLE_PRIVATE_KEY && env.GSC_SITE_URL);
  return json({
    mode: googleConfigured ? 'live-ready' : 'setup',
    domain: 'toolmera.com',
    sitemapUrl: 'https://toolmera.com/sitemap.xml',
    sitemapUrls: await sitemapCount(env),
    integrations: {
      gsc: {
        configured: googleConfigured,
        siteUrl: env.GSC_SITE_URL || null,
      },
      ga4: {
        configured: Boolean(env.GOOGLE_CLIENT_EMAIL && env.GOOGLE_PRIVATE_KEY && env.GA4_PROPERTY_ID),
        propertyId: env.GA4_PROPERTY_ID ? 'configured' : null,
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
  const token = await googleAccessToken(env);
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
