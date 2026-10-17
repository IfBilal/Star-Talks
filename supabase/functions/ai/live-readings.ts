// Live sample readings for review. Runs the REAL action handler (calculators, rule library, prompts, validation)
// against the in-memory test database with REAL OpenAI calls. It costs money: every module makes about 3 generation calls.
//
//   cd supabase/functions && deno run -A --config deno.json ai/live-readings.ts <outDir> [module,module] [imageDir]
//
// The OpenAI key is read from supabase/functions/.env.local (git-ignored) and is never printed.
// Fictional profile only. Photo modules need palm.jpg and face.jpg in imageDir (public-domain test images, never committed).
import { Buffer } from 'node:buffer';
import { handleAction } from './index.ts';
import { fixture, user, profileId, mediaId } from './test-fixture.ts';

const [outDir, only, imageDir] = Deno.args;
if (!outDir) throw new Error('usage: live-readings.ts <outDir> [modules] [imageDir]');
for (const line of Deno.readTextFileSync(new URL('../.env.local', import.meta.url)).split('\n')) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !Deno.env.get(match[1])) Deno.env.set(match[1], match[2].replace(/^["']|["']$/g, ''));
}
await Deno.mkdir(outDir, { recursive: true });

const PROFILE = { display_name: 'Sample Profile', birth_date: '1985-03-14', birth_time: '10:30:00', birth_instant: '1985-03-14T05:00:00.000Z', birth_time_known: true, latitude: 28.61, longitude: 77.21, time_zone: 'Asia/Kolkata', numerology_name: 'Asha Verma Rao' };
const MODULES = ['vedic', 'western', 'numerology', 'tarot', 'chinese-zodiac', 'korean-astrology', 'palmistry', 'face-reading', 'lal-kitab'];
const QUESTIONS: Record<string, string[]> = {
  default: ['Will I change my job this year? When is the best time for me to do it?', 'What about marriage? Does that fit with what you told me about my career?'],
  tarot: ['What should I focus on in my work right now?', 'And what does the spread say about my relationships, in light of that?'],
  palmistry: ['What does my palm say about my career direction?', 'And how do my relationships look in my palm, in light of that?'],
  'face-reading': ['What do my facial features traditionally say about how I approach work?', 'And what do they traditionally say about how I approach relationships?'],
};
const wanted = (only ? only.split(',') : MODULES);
const dataUrl = (file: string) => `data:image/jpeg;base64,${Buffer.from(Deno.readFileSync(`${imageDir}/${file}`)).toString('base64')}`;
const results: Record<string, unknown> = {};

for (const moduleId of wanted) {
  const photo = moduleId === 'palmistry' ? 'palm.jpg' : moduleId === 'face-reading' ? 'face.jpg' : null;
  if (photo && !imageDir) { console.log(`skip ${moduleId}: no imageDir`); continue; }
  const f = fixture({ profile: PROFILE, signedUrl: photo ? dataUrl(photo) : undefined });
  if (moduleId === 'face-reading') f.rows.ai_media[0].kind = 'face';
  const turns: Array<{ question: string; answer: unknown; ms?: number }> = [];
  const started = Date.now();
  try {
    const first: any = await handleAction(f.db, user, { action: 'start-reading', moduleId, profileId, mediaId, requestId: crypto.randomUUID() });
    turns.push({ question: '(first reading)', answer: first.messages[0].structured_payload, ms: Date.now() - started });
    let conversationId = first.conversation.id;
    for (const question of QUESTIONS[moduleId] ?? QUESTIONS.default) {
      const reply: any = await handleAction(f.db, user, { action: 'ask-module', conversationId, question, requestId: crypto.randomUUID() });
      turns.push({ question, answer: reply.messages.at(-1).structured_payload });
    }
  } catch (error) { turns.push({ question: '(error)', answer: String((error as Error).message ?? error) }); }
  const usage = [...f.claims.values()].reduce((sum, claim) => ({ input: sum.input + (claim.inputTokens ?? 0), output: sum.output + (claim.outputTokens ?? 0) }), { input: 0, output: 0 });
  results[moduleId] = { turns, usage, model: Deno.env.get('OPENAI_MODEL_READING') ?? 'gpt-6-sol' };
  console.log(`${moduleId}: ${turns.length} turns, ${usage.input} in / ${usage.output} out tokens`);
  await Deno.writeTextFile(`${outDir}/${moduleId}.json`, JSON.stringify(results[moduleId], null, 1));
}
