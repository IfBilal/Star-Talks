# Star Talks Milestone 2 deployment and acceptance handoff

This records the source state for Weeks 3–4. Source implementation is not a production acceptance result. The Star Talks project is `thoknhjxmgsyisxuyamb`. Supabase MCP OAuth was connected and verified against this project on 2026-10-05. The separate CLI login still lists unrelated projects; do not use it for Star Talks deployments.

**Latest verification:** see [key-independent verification](milestone-2-key-independent-verification.md) for the earlier tests and method limits, and [AI scope and cost controls](milestone-2-ai-guardrails.md) for the current source changes and minimal live test budget.

**Deployed now:** the additive Milestone 2 foundation migration is recorded remotely as `20261005033657 milestone_two_foundation`. Edge Functions `ai`, `verify-whatsapp-phone`, and `delete-account` are deployed with JWT verification enabled: `ai` version 4, `verify-whatsapp-phone` version 2, `delete-account` version 2. The privilege/request hardening migration is deployed as `20261005103522 milestone_two_hardening`, and the AI message-order migration as `20261005155818 ai_message_order`. A request without a JWT returned HTTP 401 for each function. The deployed AI function includes the final ordered memory pagination and response handling, and the other deployed function sources match the repository. The original Phase 1 profile, birth-profile, and chart policies remain in place. **Pending:** `supabase/pending/activate_verified_phone_gate.sql` is deliberately outside `migrations/` so normal schema pushes cannot enable it before WhatsApp works. OpenAI key has been obtained but its server-secret status has not been confirmed; MSG91 is still pending.

## Deploy in this order

1. Confirm the MSG91 account has an eligible WhatsApp sender and an approved authentication template, and send a test template message to a consumer number. Check the exact template body/button variable names against `supabase/functions/verify-whatsapp-phone/index.ts`. The current source sends `body_1` and `button_1`; change it if the approved template differs.
2. Set server secrets in the **Star Talks** project: `PHONE_OTP_PEPPER` (random secret, at least 32 characters), `MSG91_AUTH_KEY`, `MSG91_WHATSAPP_SENDER`, `MSG91_WHATSAPP_TEMPLATE`, `MSG91_WHATSAPP_NAMESPACE`, optional `MSG91_WHATSAPP_LANGUAGE`, and `OPENAI_API_KEY`. Optional settings: `OPENAI_MODEL` (default `gpt-4o-mini`), `AI_PREVIEW_DAILY_LIMIT` (default 30), `AI_DISABLED`, `AI_DISABLED_MODULES`. Configure billing and spending limits in the provider accounts. Never place these secrets in Expo variables or Git.
3. Test WhatsApp delivery and verified-phone linkage against the deployed additive schema and function. Probe duplicate numbers, retries and the same-user-ID invariant. Only then apply `supabase/pending/activate_verified_phone_gate.sql` to Star Talks and enable `EXPO_PUBLIC_REQUIRE_VERIFIED_PHONE=true` in a new app build. The AI function reads the same private database switch as the RLS policies. This is the **access-changing** cutover; do not apply it while MSG91 is pending.
4. Test the deployed `ai` and `delete-account` functions with signed-in test users, keeping AI generation disabled until auth, RLS and provider calls are checked. Turn on one module at a time, inspect output and spend, then enable the other modules.
5. Build an installable Android preview with `eas build --platform android --profile preview`. The `development` profile produces a development client and is unsuitable for the client APK. Install the preview build and complete the checks below against the deployed Star Talks backend.

The server-owned OTP replaces the earlier Send SMS Hook design. A Supabase Send SMS Hook is **not** required for this implementation. The OTP challenge is bound to the authenticated user ID. The Admin API sets a confirmed phone only after server verification. Supabase Auth confirmed-phone fields are the source of truth for the route and RLS gates.

## Acceptance still required on the deployed project

- Email and Google account signup, login, password reset and logout continue to work. An unverified account cannot read profiles, charts, AI data or images through direct Supabase requests.
- OTP delivery succeeds on approved WhatsApp numbers; wrong, expired and exhausted codes fail; cooldown and daily limits hold; a duplicate phone cannot be linked to another account; `auth.getUser()` returns the **same user ID** and a confirmed phone after success. Test an abandoned attempt and a retry. Include at least one intended international market if supported by MSG91.
- The additive migration applied to the live Phase 1 shaped database. Three synthetic-user RLS/Storage/OTP/quota probes passed on the target database inside a rolled-back transaction. Repeat profile/chart access probes after enabling the separate phone gate.
- All nine modules produce a real first reading and a relevant follow-up for representative synthetic inputs. Review evidence IDs, no invented chart/card values, unknown birth-time limits, image retake behavior, safety responses, and output usefulness. An expert should review the Lal Kitab rulebook and the Vedic ephemeris/ayanamsa assumptions before accepting method-specific claims.
- Saved conversations reopen with message pagination; searches/filters, feedback, photo and history deletion, account deletion, preview quota and duplicate request handling work on an installed APK. Pairwise compatibility saves, detects changed profiles and opens linked follow-up chat. Tarot compatibility displays no made-up percentage.
- Visually compare the relevant AI screens against `docs/ui.jpeg` and the dev-plan PDF on actual Android device sizes. Check accessibility text, loading/error/empty states and camera/gallery permissions.
- Record project ref, migration ID, deployed function versions, build URL, Git commit, test accounts used (without credentials), actual provider charges, and owner review results here after live acceptance.

## Current local checks

- Current source: TypeScript, 16 Deno backend tests and 40 Jest app tests pass without live OpenAI calls; targeted app/component ESLint passes. Earlier Android export and browser appearance checks passed. Rebuild and device verification remain required after this phone-route change.
- No Android emulator/device is attached in this workspace. The local Supabase CLI identity currently sees only unrelated projects; use Supabase MCP for Star Talks deployments. The updated phone-gate/quota migration and AI source still need deployment after MCP OAuth reconnects. OpenAI live calls have not been made; MSG91 remains pending.
- Supabase security advisor lists the private OTP and request-claim tables as having RLS without policies; this is intentional because only service-role server code uses them. It also warns that `has_verified_phone()` is callable by signed-in users; it returns only their own verification status. Leaked-password protection is disabled in Supabase Auth and can be enabled separately by the project owner.

## Rollback and controls

- For an AI issue, set `AI_DISABLED=true` or name modules in `AI_DISABLED_MODULES`. Existing history stays readable.
- Preserve the previous working APK until sign-in, Home, profile, logout and reset-password regression checks pass with the new backend.
- Avoid dropping tables or deleting user data as an emergency rollback. Review a data-safe migration if the schema must be reversed.
