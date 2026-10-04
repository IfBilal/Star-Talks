import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';

type SmsHookPayload = {
  user?: { id?: string; phone?: string; new_phone?: string };
  sms?: { otp?: string };
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: { http_code: 405, message: 'Method not allowed' } }, 405);
  const signedBody = await request.text();
  const rawSecrets = Deno.env.get('SEND_SMS_HOOK_SECRETS') ?? '';
  let event: SmsHookPayload | null = null;
  for (const raw of rawSecrets.split('|').filter(Boolean)) {
    try {
      const secret = raw.replace(/^v1,whsec_/, '');
      event = new Webhook(secret).verify(signedBody, Object.fromEntries(request.headers)) as SmsHookPayload;
      break;
    } catch { /* Try a previous rotation secret. */ }
  }
  if (!event) return json({ error: { http_code: 401, message: 'Invalid hook signature' } }, 401);

  const phone = event.user?.new_phone || event.user?.phone;
  const otp = event.sms?.otp;
  if (!phone || !/^\+[1-9]\d{7,14}$/.test(phone) || !otp || !/^\d{4,8}$/.test(otp)) {
    return json({ error: { http_code: 400, message: 'Invalid phone verification request' } }, 400);
  }

  const authKey = Deno.env.get('MSG91_AUTH_KEY');
  const sender = Deno.env.get('MSG91_WHATSAPP_SENDER');
  const template = Deno.env.get('MSG91_WHATSAPP_TEMPLATE');
  const language = Deno.env.get('MSG91_WHATSAPP_LANGUAGE') || 'en';
  const namespace = Deno.env.get('MSG91_WHATSAPP_NAMESPACE');
  if (!authKey || !sender || !template || !namespace) {
    return json({ error: { http_code: 503, message: 'WhatsApp verification is unavailable' } }, 503);
  }

  try {
    const response = await fetch('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/', {
      method: 'POST',
      headers: { authkey: authKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        integrated_number: sender,
        content_type: 'template',
        payload: {
          messaging_product: 'whatsapp', type: 'template',
          template: {
            name: template,
            language: { code: language, policy: 'deterministic' },
            namespace,
            to_and_components: [{
              to: [phone.replace(/^\+/, '')],
              components: {
                body_1: { type: 'text', value: otp },
                button_1: { subtype: 'url', type: 'text', value: otp },
              },
            }],
          },
        },
      }),
      signal: AbortSignal.timeout(4000),
    });
    // Never log the response body: a provider error can echo the request and OTP.
    if (!response.ok) return json({ error: { http_code: 502, message: 'WhatsApp delivery could not be started' } }, 502);
    return json({});
  } catch {
    return json({ error: { http_code: 502, message: 'WhatsApp delivery could not be started' } }, 502);
  }
});
