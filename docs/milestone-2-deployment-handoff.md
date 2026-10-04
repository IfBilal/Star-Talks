# Star Talks Milestone 2 deployment and acceptance handoff

This records the source state for Weeks 3–4. Source implementation is not a production acceptance result. The Star Talks project is `thoknhjxmgsyisxuyamb`; confirm that reference in the Supabase dashboard and CLI before any database or function command. The current CLI login does not list this project, so the migration and functions have **not** been deployed from this workspace.

## Deploy in this order

1. Obtain CLI access to the **Star Talks** Supabase organization/project. Check `supabase projects list` includes `thoknhjxmgsyisxuyamb`. Do not use the other projects visible under the current CLI identity.
2. Confirm the MSG91 account has an eligible WhatsApp sender and an approved authentication template, and send a test template message to a consumer number. Check the exact template body/button variable names against `supabase/functions/verify-whatsapp-phone/index.ts`. The current source sends `body_1` and `button_1`; change it if the approved template differs.
3. Set server secrets in the Star Talks project: `PHONE_OTP_PEPPER` (random secret, at least 32 characters), `MSG91_AUTH_KEY`, `MSG91_WHATSAPP_SENDER`, `MSG91_WHATSAPP_TEMPLATE`, `MSG91_WHATSAPP_NAMESPACE`, optional `MSG91_WHATSAPP_LANGUAGE`, and `OPENAI_API_KEY`. Optional settings: `OPENAI_MODEL` (default `gpt-4o-mini`), `AI_PREVIEW_DAILY_LIMIT` (default 30), `AI_DISABLED`, `AI_DISABLED_MODULES`. Configure billing and spending limits in the provider accounts. Never place these secrets in Expo variables or Git.
4. Deploy `verify-whatsapp-phone` with JWT verification enabled. Test it against a staging project that has the new OTP tables before applying the verified-phone RLS gate to Star Talks. The function authenticates the user itself and must remain accessible to signed-in users without a verified phone.
5. Apply `supabase/migrations/20261004090000_milestone_two_foundation.sql` to staging, including a Phase 1 shaped data set, and probe every owner policy and Storage policy. Then apply it to the verified Star Talks project. The migration changes existing account RLS, so a user without a verified phone will be routed to the OTP gate; check this path before releasing an APK.
6. Deploy `ai`, `delete-account`, and `verify-whatsapp-phone` Edge Functions to the same project. Keep `AI_DISABLED=true` until auth, RLS, and a test user are checked. Verify each function rejects missing/invalid JWTs. Turn on one AI module at a time, inspect output and spend, then enable the other modules.
7. Build an installable Android preview with `eas build --platform android --profile preview`. The `development` profile produces a development client and is unsuitable for the client APK. Install the preview build and complete the checks below against the deployed Star Talks backend.

The server-owned OTP replaces the earlier Send SMS Hook design. A Supabase Send SMS Hook is **not** required for this implementation. The OTP challenge is bound to the authenticated user ID. The Admin API sets a confirmed phone only after server verification. Supabase Auth confirmed-phone fields are the source of truth for the route and RLS gates.

## Acceptance still required on the deployed project

- Email and Google account signup, login, password reset and logout continue to work. An unverified account cannot read profiles, charts, AI data or images through direct Supabase requests.
- OTP delivery succeeds on approved WhatsApp numbers; wrong, expired and exhausted codes fail; cooldown and daily limits hold; a duplicate phone cannot be linked to another account; `auth.getUser()` returns the **same user ID** and a confirmed phone after success. Test an abandoned attempt and a retry. Include at least one intended international market if supported by MSG91.
- The migration applies cleanly to empty staging and Phase 1 shaped data. Two-user probes confirm no cross-account data access for profiles, charts, messages, feedback, media, compatibility or Storage.
- All nine modules produce a real first reading and a relevant follow-up for representative synthetic inputs. Review evidence IDs, no invented chart/card values, unknown birth-time limits, image retake behavior, safety responses, and output usefulness. An expert should review the Lal Kitab rulebook and the Vedic ephemeris/ayanamsa assumptions before accepting method-specific claims.
- Saved conversations reopen with message pagination; searches/filters, feedback, photo and history deletion, account deletion, preview quota and duplicate request handling work on an installed APK. Pairwise compatibility saves, detects changed profiles and opens linked follow-up chat. Tarot compatibility displays no made-up percentage.
- Visually compare the relevant AI screens against `docs/ui.jpeg` and the dev-plan PDF on actual Android device sizes. Check accessibility text, loading/error/empty states and camera/gallery permissions.
- Record project ref, migration ID, deployed function versions, build URL, Git commit, test accounts used (without credentials), actual provider charges, and owner review results here after live acceptance.

## Current local checks

- TypeScript, Edge Function Deno check, five Deno evidence tests, 28 Jest app tests, targeted ESLint, and Android export pass after the latest source changes.
- No Android emulator/device is attached in this workspace. The local Supabase CLI identity currently sees only unrelated projects. OpenAI and MSG91 live calls have not been verified here.

## Rollback and controls

- For an AI issue, set `AI_DISABLED=true` or name modules in `AI_DISABLED_MODULES`. Existing history stays readable.
- Preserve the previous working APK until sign-in, Home, profile, logout and reset-password regression checks pass with the new backend.
- Avoid dropping tables or deleting user data as an emergency rollback. Review a data-safe migration if the schema must be reversed.
