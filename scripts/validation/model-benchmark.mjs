// Dev-only model benchmark. Runs the REAL answer pipeline (supabase/functions/_shared) for one model.
// Usage: node scripts/validation/model-benchmark.mjs <model> [taskIds,comma]
// Key is read from supabase/functions/.env.local (git-ignored); never printed.
// Cost is tracked in a shared ledger file and the run aborts above the cap.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const envFile = path.join(root, 'supabase/functions/.env.local');
for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const model = process.argv[2]; if (!model) throw new Error('model required');
process.env.OPENAI_MODEL = model;
const only = process.argv[3] ? process.argv[3].split(',') : null;
const outDir = process.env.BENCH_OUT || path.join(root, 'scripts/validation/results'); fs.mkdirSync(outDir, { recursive: true });
const ledger = path.join(outDir, 'ledger.json');
const CAP = Number(process.env.BENCH_CAP_USD || 6); // hard stop well under the client's US$10 approval

// USD per 1M tokens: [input, output] (standard tier, from OpenAI pricing page, 2026-10-16). Cached discount ignored (conservative).
const PRICE = { 'gpt-4o-mini':[.15,.6],'gpt-4.1':[2,8],'gpt-4.1-mini':[.4,1.6],'gpt-5':[1.25,10],'gpt-5-mini':[.25,2],'gpt-5.1':[1.25,10],'gpt-5.2':[1.75,14],'gpt-5.4':[2.5,15],'gpt-5.4-mini':[.75,4.5],'gpt-5.4-nano':[.2,1.25],'gpt-5.5':[5,30],'gpt-5.6-luna':[.2,1.2],'gpt-5.6-sol':[4,20],'gpt-5.6-terra':[2,12],'gpt-6-astra':[10,50],'gpt-6-luna':[.1,.5],'gpt-6-sol':[2,10],'gpt-6.1-sol':[2,10],'o3':[2,8],'o4-mini':[1.1,4.4] };
const price = PRICE[model]; if (!price) throw new Error('no price for ' + model);
const reasoning = !/^gpt-(4o|4\.1)/.test(model);
const readLedger = () => fs.existsSync(ledger) ? JSON.parse(fs.readFileSync(ledger, 'utf8')) : { total: 0, calls: 0 };
const addLedger = (c) => { const l = readLedger(); l.total += c; l.calls += 1; fs.writeFileSync(ledger, JSON.stringify(l)); return l.total; };

// Wrap fetch: lift the output cap for reasoning models (thinking tokens count against it), measure usage/latency, enforce the spend cap.
const realFetch = globalThis.fetch; let last = null;
globalThis.fetch = async (url, init) => {
  if (String(url).endsWith('/responses')) {
    if (readLedger().total >= CAP) throw new Error('Budget cap reached; stopping.');
    const body = JSON.parse(init.body); if (reasoning) body.max_output_tokens = 12000; init = { ...init, body: JSON.stringify(body) };
    const t0 = Date.now(); let res;
    for (let attempt = 0; ; attempt++) { // retry connection-level failures only (no tokens are billed when no response arrives)
      try { res = await realFetch(url, init); break; } catch (e) { if (attempt >= 2 || /abort|timeout/i.test(String(e))) throw e; await new Promise(r => setTimeout(r, 3000)); }
    }
    const copy = res.clone();
    copy.json().then(j => { const u = j.usage || {}; const cost = ((u.input_tokens || 0) * price[0] + (u.output_tokens || 0) * price[1]) / 1e6;
      last = { ms: Date.now() - t0, in: u.input_tokens, out: u.output_tokens, reasoning: u.output_tokens_details?.reasoning_tokens ?? null, cost, status: j.status, incomplete: j.incomplete_details?.reason ?? null }; addLedger(cost); }).catch(() => {});
    return res;
  }
  return realFetch(url, init);
};
globalThis.Deno = { env: { get: (k) => process.env[k] } };

const { buildChartEvidence } = await import(path.join(root, 'supabase/functions/_shared/chart-evidence.ts'));
const { generateAnswer } = await import(path.join(root, 'supabase/functions/_shared/openai.ts'));

// --- Vision mode: node model-benchmark.mjs <model> VISION  (images read from $VISION_DIR: palm.jpg, face.jpg; never committed)
if (process.argv[3] === 'VISION') {
  const { observeImage } = await import(path.join(root, 'supabase/functions/_shared/openai.ts'));
  const dir = process.env.VISION_DIR; const url = (f) => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(dir, f)).toString('base64');
  const jobs = [['V1-palm', 'palm', 'palm.jpg'], ['V2-face', 'face', 'face.jpg'], ['V3-palm-as-face', 'face', 'palm.jpg']];
  const vres = [];
  for (const [id, kind, file] of jobs) {
    last = null; let r; const t0 = Date.now();
    try { r = { ok: true, observation: await observeImage(kind, url(file)) }; } catch (e) { r = { ok: false, error: String(e.message || e) }; }
    await new Promise(res => setTimeout(res, 400));
    vres.push({ task: id, wallMs: Date.now() - t0, ...r, usage: last }); const u = last || {};
    console.log(`${model} ${id}: ${r.ok ? 'OK obs=' + r.observation.observations.length + ' retake=' + (r.observation.retakeReason ? 'YES' : 'no') : 'FAIL ' + r.error} | ${u.ms ?? '?'}ms in=${u.in} out=${u.out} $${(u.cost ?? 0).toFixed(4)} | ledger $${readLedger().total.toFixed(3)}`);
  }
  fs.writeFileSync(path.join(outDir, `${model}.vision.json`), JSON.stringify({ model, results: vres }, null, 1));
  process.exit(0);
}

// Fictional profile (not a real person): Delhi, 14 Mar 1985, 10:30 IST.
const profile = { birth_date: '1985-03-14', birth_instant: '1985-03-14T05:00:00.000Z', birth_time_known: true, latitude: 28.61, longitude: 77.21, time_zone: 'Asia/Kolkata' };
const ev = buildChartEvidence(profile, 'vedic', new Date('2026-10-16T06:00:00Z'));
const snapshot = { moduleId: 'vedic', version: ev.version, factors: ev.factors, warnings: ev.warnings, data: {} };
const refs = ev.factors.map(f => f.id);

const tasks = [
  { id: 'T1-first', first: true, lang: 'English', q: 'First Instinct Reading' },
  { id: 'T2-career', lang: 'English', q: 'Will I change my job this year? When is the best time for me to do it?' },
  { id: 'T3-marriage', lang: 'English', q: 'Okay. What about marriage? Does my chart support it, and does that fit with what you told me about my career?' },
  { id: 'T4-hindi', lang: 'Hindi', q: 'मेरी शादी कब होगी और मेरा वैवाहिक जीवन कैसा रहेगा?' },
  { id: 'T5-hinglish', lang: 'Hinglish', q: 'Mera career kaisa rahega? Kya mujhe job change karni chahiye ya nahi?' },
  { id: 'T6-lottery', lang: 'English', q: 'Which lottery numbers will win for me this week?' },
  { id: 'T7-health', lang: 'English', q: 'Will I get a serious disease like cancer? Tell me honestly.' },
  { id: 'T8-othermodule', lang: 'English', q: 'What do my Tarot cards say about my love life?' },
];
const history = []; const results = [];
for (const t of tasks) {
  if (only && !only.includes(t.id)) continue;
  last = null; let r; const t0 = Date.now();
  try {
    const { answer } = await generateAnswer({ moduleId: 'vedic', evidence: snapshot, allowedSourceRefs: refs, question: t.q, history: [...history], summary: '', language: t.lang, first: !!t.first });
    r = { ok: true, answer };
    history.push({ role: 'user', body: t.q }, { role: 'assistant', body: answer.directAnswer });
  } catch (e) { r = { ok: false, error: String(e.message || e) }; }
  await new Promise(res => setTimeout(res, 400));
  results.push({ task: t.id, wallMs: Date.now() - t0, ...r, usage: last });
  const u = last || {}; console.log(`${model} ${t.id}: ${r.ok ? 'OK' : 'FAIL ' + r.error} | ${u.ms ?? '?'}ms in=${u.in} out=${u.out} think=${u.reasoning} $${(u.cost ?? 0).toFixed(4)} | ledger $${readLedger().total.toFixed(3)}`);
}
const outFile = path.join(outDir, `${model}.json`); let merged = results;
if (only && fs.existsSync(outFile)) { // partial rerun: keep earlier results for other tasks
  const prev = JSON.parse(fs.readFileSync(outFile, 'utf8')).results.filter(r => !results.some(n => n.task === r.task));
  merged = [...prev, ...results].sort((a, b) => a.task.localeCompare(b.task));
}
fs.writeFileSync(outFile, JSON.stringify({ model, factors: refs.length, results: merged }, null, 1));
