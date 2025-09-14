export function corsHeaders() {
  const origins = process.env.ALLOWED_ORIGINS || '*';
  return {
    'Access-Control-Allow-Origin': origins,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };
}

export function withCors(body, init = {}) {
  const headers = { ...(init.headers || {}), ...corsHeaders() };
  return new Response(body, { ...init, headers });
}

export function preflight() {
  return withCors(null, { status: 204 });
}
