// Keep browser invocations aligned with headers sent by supabase-js.
export const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization,x-client-info,apikey,content-type,x-retry-count,traceparent,tracestate,baggage',
  'access-control-allow-methods': 'POST,OPTIONS',
};
