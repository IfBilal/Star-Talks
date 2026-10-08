# Star Talks AI scope and cost controls

Checkpoint: 2026-10-09. This describes the new source changes. Deployment and live acceptance must be recorded separately in the [Milestone 2 handoff](milestone-2-deployment-handoff.md).

## Scope of the original milestone

The original proposal's weeks 3–4 are the nine AI modules, grounded readings, follow-ups, conversation memory, safety/feedback, multiple profiles and compatibility. WhatsApp OTP was added afterward; payments and wallet are weeks 5–6. The OTP code remains available, but normal authenticated accounts may use the original milestone while MSG91 is pending. The private database phone switch is off by default, and the pending access-changing script stays outside `supabase/migrations/`.

## Guardrails in the API

- A signed-in Supabase user and accepted AI consent are required. User IDs come from the verified bearer token, not the request body. The OpenAI key lives in Edge Function secrets only.
- Module-specific server instructions restrict each response to the supplied chart, card, number, pillar or visible-image evidence. Structured responses declare `scopeDecision`. The API discards model-written off-topic text and returns a fixed Star Talks response for `out_of_scope`.
- Clear unrelated prompts (recipes, device shopping, coding, weather/general facts, instruction override attempts) are blocked **before** contacting OpenAI. Ambiguous natural follow-ups go to the module with explicit scope instructions; this avoids silently rejecting valid chart questions. Scope classification is imperfect, so output and feedback remain reviewable.
- Input is capped at 800 characters; recent conversation context is capped at ten turns; summaries are bounded. The Responses API has per-call output token ceilings of 1,500 for readings, 900 for compatibility, 700 for image observations and 350 for summaries. Images require separate consent and are moderated before observation.
- Input and output moderation fail closed; structured fields and cited evidence IDs are validated. The safety policy forbids guaranteed predictions and binding medical, legal or financial advice. User prompts, prior messages and images are treated as untrusted data.
- Request IDs bind to a fingerprint of the operation/input and use an exclusive lease, preventing concurrent duplicate paid calls. Completed retries read stored results.

## Server quotas

`claim_ai_preview_request` checks all four limits atomically **before** paid provider work. Defaults are deliberately conservative previews, not purchased-credit entitlements:

| Limit | Default | Server environment override |
| --- | ---: | --- |
| Per account, rolling 24 hours | 10 requests | `AI_PREVIEW_DAILY_LIMIT` |
| All accounts, rolling 24 hours | 100 requests | `AI_GLOBAL_DAILY_LIMIT` |
| Per account, rolling minute | 2 requests | `AI_USER_MINUTE_LIMIT` |
| All accounts, rolling minute | 10 requests | `AI_GLOBAL_MINUTE_LIMIT` |

Every paid action—first reading, follow-up or compatibility—uses this quota. Rejected attempts and off-topic questions can consume a user's request allowance, but clear off-topic questions do not call OpenAI. A request may involve more than one provider call (especially image analysis), so these limits cap request volume rather than exact currency. The global cap limits account-creation abuse. The `AI_DISABLED` and `AI_DISABLED_MODULES` switches can stop new generation immediately while preserving saved history.

For a stronger billing ceiling, the client should set a small **project hard spend limit** and an earlier alert in the OpenAI dashboard. OpenAI notes that enforcement is not instantaneous, so a small overrun is possible: [spend limits](https://developers.openai.com/api/docs/guides/spend-limits). The app's moderation API is free according to [OpenAI safety guidance](https://developers.openai.com/api/docs/guides/safety-best-practices); generated readings and image analysis are billable.

## Minimal live acceptance when the key is installed

1. Confirm `OPENAI_API_KEY` is stored under **Star Talks** Edge Function Secrets; do not send it through chat or commit it. Confirm the client-approved test budget and project hard spend limit.
2. Keep `AI_GLOBAL_DAILY_LIMIT` low during smoke testing. Use one existing test account. Ask a clear off-topic question and confirm the fixed refusal with no OpenAI request; repeat the same request ID and confirm no duplicate provider work.
3. Run one in-scope first reading and one follow-up; inspect source IDs, saved messages, output usefulness and provider usage. Run one additional method or image only if the first two calls leave a specific uncovered risk. Use mocked provider tests for broad regression across nine modules.
4. Check OpenAI usage after the smoke test. Do not run live load or stress tests. Record exact call count, account and spending in the handoff. A small smoke test does **not** prove that every module produces expert-quality live readings; that remains a client/content review item.

When MSG91 works, apply `supabase/pending/activate_verified_phone_gate.sql` and publish a client build with `EXPO_PUBLIC_REQUIRE_VERIFIED_PHONE=true`. The database switch then enforces phone status for AI and owner-scoped data policies. Until that cutover, account sign-in and ownership policies still apply.
