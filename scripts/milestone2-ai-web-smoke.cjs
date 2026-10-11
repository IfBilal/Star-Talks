// Signed-in browser check for the deployed AI registry. Makes no OpenAI calls.
// Requires a running Expo web server and SUPABASE_ACCESS_TOKEN in the environment.
const { chromium } = require('playwright');
const crypto = require('crypto');
const ref = 'thoknhjxmgsyisxuyamb';
const base = `https://${ref}.supabase.co`;

async function request(url, method = 'GET', body, headers = {}) {
  const response = await fetch(url, {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const raw = await response.text();
  const value = raw ? JSON.parse(raw) : {};
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${JSON.stringify(value).slice(0, 200)}`);
  return value;
}

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error('SUPABASE_ACCESS_TOKEN is required');
  const keys = await request(`https://api.supabase.com/v1/projects/${ref}/api-keys?reveal=true`, 'GET', undefined, { authorization: `Bearer ${token}` });
  const admin = keys.find(key => key.type === 'legacy' && key.name === 'service_role').api_key;
  const headers = { apikey: admin, authorization: `Bearer ${admin}` };
  const email = `star-talks-web-qa-${crypto.randomUUID().slice(0, 8)}@example.com`;
  const password = crypto.randomBytes(24).toString('base64url');
  let user;
  let browser;
  try {
    user = await request(base + '/auth/v1/admin/users', 'POST', { email, password, email_confirm: true, user_metadata: { test_account: true } }, headers);
    const restHeaders = { ...headers, Prefer: 'return=representation' };
    await request(base + '/rest/v1/profiles', 'POST', { id: user.id, display_name: 'Web QA', language_code: 'en' }, restHeaders);
    await request(base + '/rest/v1/birth_profiles', 'POST', {
      user_id: user.id, display_name: 'Web QA', relationship: 'self', birth_date: '1995-05-15',
      birth_time: '12:00:00', birth_time_known: true, birth_instant: '1995-05-15T06:30:00Z',
      place_label: 'New Delhi, India', latitude: 28.6139, longitude: 77.209,
      time_zone: 'Asia/Kolkata', numerology_name: 'Web QA',
    }, restHeaders);
    const conversations = await request(base + '/rest/v1/ai_conversations', 'POST', {
      user_id: user.id, module_id: 'tarot', title: 'QA history fixture',
      methodology_version: 'qa-fixture', prompt_version: 'qa-fixture', first_reading_status: 'ready',
      input_snapshot: { moduleId: 'tarot', version: 'qa-fixture', warnings: [], factors: [{ id: 'card:qa', value: 'The Star' }] },
    }, restHeaders);
    await request(base + '/rest/v1/ai_messages', 'POST', {
      user_id: user.id, conversation_id: conversations[0].id, role: 'assistant', kind: 'first',
      body: 'Synthetic saved reading for browser QA', source_refs: ['card:qa'],
    }, restHeaders);

    browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => {
      if (request.url().includes('/functions/v1/ai')) errors.push(`AI request: ${request.failure()?.errorText}`);
    });
    await page.goto(process.env.EXPO_WEB_URL || 'http://localhost:19006/auth', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.getByPlaceholder('Email address').fill(email);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByText('Log In', { exact: true }).click();
    await page.waitForURL('**/home', { timeout: 20000 });
    await page.getByText('AI', { exact: true }).last().click();
    await page.waitForURL('**/ai', { timeout: 10000 });
    const numerology = page.getByText('Numerology', { exact: true }).first();
    let body = '';
    for (let attempt = 0; attempt < 40; attempt++) {
      body = await page.locator('body').innerText();
      if (body.includes('Failed to send a request to the Edge Function') || await numerology.isEnabled()) break;
      await page.waitForTimeout(250);
    }
    if (body.includes('Failed to send a request to the Edge Function') || !(await numerology.isEnabled())) {
      throw new Error(`AI cards disabled; ${errors.slice(0, 3).join(' | ') || 'network response unavailable'}`);
    }
    if (errors.length) throw new Error(`Browser errors: ${errors.slice(0, 3).join(' | ')}`);
    console.log('PASS signed-in browser AI registry loads and module cards are enabled');
    await numerology.click();
    await page.waitForURL('**/ai/numerology', { timeout: 10000 });
    await page.getByText('I agree and continue', { exact: true }).waitFor({ timeout: 10000 });
    console.log('PASS module requests AI data consent before generating');
    await page.goto(process.env.EXPO_WEB_URL?.replace(/\/auth$/, '/ai') || 'http://localhost:19006/ai', { waitUntil: 'domcontentloaded' });
    await page.getByLabel('AI menu').waitFor({ timeout: 10000 });
    await page.getByLabel('AI menu').click();
    await page.getByText('Conversation history', { exact: true }).click();
    await page.waitForURL('**/ai/history', { timeout: 10000 });
    await page.getByText('QA history fixture', { exact: true }).waitFor({ timeout: 10000 });
    await page.getByText('QA history fixture', { exact: true }).click();
    await page.getByText('I agree and continue', { exact: true }).click();
    try {
      await page.getByText('Synthetic saved reading for browser QA', { exact: true }).waitFor({ timeout: 10000 });
    } catch {
      throw new Error(`Saved chat did not render at ${page.url()}: ${(await page.locator('body').innerText()).slice(0, 500)}; ${errors.slice(0, 2).join(' | ')}`);
    }
    console.log('PASS saved AI history opens in the browser');
    await page.getByLabel('Helpful').first().click();
    await page.getByText('Submit feedback', { exact: true }).click();
    await page.getByText('Submit feedback', { exact: true }).waitFor({ state: 'hidden', timeout: 10000 });
    console.log('PASS browser feedback submits and closes');
  } finally {
    if (browser) await browser.close();
    if (user) {
      await request(base + '/auth/v1/admin/users/' + user.id, 'DELETE', undefined, headers);
      console.log('PASS disposable browser account removed');
    }
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
