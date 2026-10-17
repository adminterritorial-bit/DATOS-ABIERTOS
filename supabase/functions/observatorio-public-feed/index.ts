// Read-only public endpoint. Only the allowlisted SQL view is queried.
// Never returns private documents, member tables or unreviewed police rows.
const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
  'Cache-Control': 'public, max-age=180, s-maxage=600, stale-while-revalidate=900',
  'X-Content-Type-Options': 'nosniff',
};
Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers });
  }
  const base = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!base || !key) {
    return new Response(JSON.stringify({ error: 'configuration_unavailable' }), { status: 503, headers: { ...headers, 'Cache-Control': 'no-store' } });
  }
  try {
    const controller = new AbortController();
    const response = await fetch(base + '/rest/v1/rpc/observatorio_public_feed', {
      method: 'POST', signal: controller.signal,
      headers: { apikey: key, authorization: 'Bearer ' + key, 'content-type': 'application/json', accept: 'application/json' },
      body: '{}',
    });
    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'feed_unavailable', status: response.status }), { status: 503, headers: { ...headers, 'Cache-Control': 'no-store' } });
    }
    const data = await response.json();
    return new Response(request.method === 'HEAD' ? null : JSON.stringify(data), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ error: 'data_temporarily_unavailable' }), { status: 503, headers: { ...headers, 'Cache-Control': 'no-store' } });
  }
});
