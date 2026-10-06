# Milestone 2: work completed without provider credentials

Checkpoint: 2026-10-06. Target: **Star-Talks**, `thoknhjxmgsyisxuyamb`.

This report separates executed checks from final acceptance. No live OpenAI or MSG91 request was made. Mocked provider responses exercise the real action handlers and calculators but do not establish real reading quality, image-recognition quality, WhatsApp deliverability or installed-device behavior.

## App appearance

- Profile → Account Settings → Appearance → **Dark mode** switches immediately and persists on this device, including after logout/restart. Default is light.
- A context-owned palette updates mounted screens, shared typography, cards, forms, navigation, icons, bottom sheets, status bars and date pickers. It does not reload the navigation stack or discard draft form state.
- Static shared styles are now theme factories; light/dark changes do not leave previously created styles stuck in light mode.
- Existing mockup colors remain the light palette. Cosmic artwork and the supplied logo stay unchanged. Pale surfaces and their foreground colors are adapted together in dark mode.
- The AI landing page uses the supplied transparent logo, white Star Talks heading, content-sized header and two equal-width module columns. No percentage-plus-fixed-gap overflow. The last of nine cards occupies one column consistently.
- Unavailable module labels remain legible and expose disabled state rather than fading all text.
- `npm run test:appearance` renders the real AI and account-settings components with isolated native/backend boundaries. It checks widths 320/390/430 in both modes, equal outer margins, same row alignment, toggle interaction and reload persistence. Fonts are loaded from the app's Poppins assets.
- Screenshots: [light AI](qa/appearance/ai-light.png), [dark AI](qa/appearance/ai-dark.png), [dark Settings](qa/appearance/settings-dark.png). These are browser component checks, not photographs of an installed Android APK.
- `app.json` supports both native appearances. A new preview APK is needed for the native configuration change.

## Backend corrections

### Database privileges

Supabase default table grants were broader than the intended migration grants. The correction explicitly revokes defaults before granting the small allowed client surface:

- Conversations: owned select/delete and **title-only** update.
- Messages, compatibility results and consent: owned reads; service-owned writes.
- Feedback: owned reads, validated writes through the AI endpoint.
- Media: owned select/insert/delete subject to RLS and owner-path constraints.
- OTP challenges/send logs and quota claims: service only, with no client policies or grants.

Migration `20261005120000_milestone_two_hardening.sql` is deployed remotely as `20261005103522 milestone_two_hardening`. The access-changing Phase 1 verified-phone gate remains unapplied until real WhatsApp delivery works.

Migration `20261005130000_ai_message_order.sql` is deployed remotely as `20261005155818 ai_message_order`. It gives messages a monotonic sequence for stable history and bounded memory pagination. The final AI function source is deployed as version 4 with JWT verification enabled.

### Request integrity, cost and safety

- Generation request IDs are bound to a SHA-256 fingerprint of the operation and input. Reusing one ID with a different question, module, profile, method or pair returns conflict.
- The exclusive request lease is acquired **before** photo moderation/vision or question moderation; duplicate requests cannot run those provider calls outside quota accounting.
- Failed requests release their lease; completed requests return persisted data. The daily preview counter continues to count attempts, including failed ones; it is a provider-cost limit, not wallet billing.
- Failed first-reading retries obey global/module switches; fetching an older page cannot accidentally generate a new first reading.
- Missing/malformed moderation results fail closed. Structured answers, image observations, compatibility output and memory summaries receive runtime field checks, not just TypeScript casts.
- Evidence references must match supplied IDs. Answers must include supporting evidence and follow-up suggestions. Every displayed answer field is covered by output moderation.
- Wrong/expired/exhausted OTPs fail. Deleting a failed delivery challenge no longer removes its cooldown because send history drives the cooldown.
- Phone comparisons accept Supabase's normalized international number with or without `+`, while preserving the same verified user ID invariant.
- Account/history photo cleanup paginates the private owner prefix, including orphan uploads and nested objects. Metadata failures are reported rather than silently ignored.

## Calculation corrections and declared methods

- Numerology: rejects impossible dates and partial-script names. Accented Latin letters normalize consistently. The user must confirm the whole Latin spelling; non-Latin characters are never silently removed. Missing vowel/consonant factors are omitted with warnings rather than inventing number zero.
- Four Pillars: preserves seconds; verifies the saved instant against historical local civil time; explicitly selects the library's midnight day convention (sect 2). Solar-term lookup uses **fixed UTC+8**, not historical Shanghai daylight-saving offsets. Unknown birth hours use explicitly limited local noon, with no hour pillar.
- Western/Vedic date-only calculations resolve noon in the actual IANA zone rather than substituting noon UTC. Unknown-hour readings omit precise natal degrees, Moon-dependent evidence, houses and exact timing.
- Vedic evidence uses classical whole-sign graha drishti, including the special Mars/Jupiter/Saturn aspects, rather than Western sextiles/squares/trines. Disputed node aspect rules are omitted.
- Vimshottari output includes a contiguous major-period timeline, nine subperiods per major period and current major/subperiod references. It uses a stated 365.2425-day year and retains full remaining-period precision internally.
- Western timing includes next-30-day Mars/Jupiter/Saturn aspect windows against selected natal planets, sampled daily within a 3° orb. It labels those as sampled date intervals, not exact event times or guaranteed events. Disconnected passes are not merged.
- Vedic compatibility now compares sidereal Moon signs/nakshatras and classical planetary signs. It does **not** present Western aspect scoring as Vedic or invent a traditional guna percentage. The app labels it “Chart Comparison”; Tarot remains “Tarot Spread.”

### Method limits that must remain visible in acceptance

The Lahiri ayanamsa remains a versioned approximation. The existing JPL fixture checks tropical planetary longitudes and the ascendant, not an expert-certified full Vedic calculator. Lal Kitab's library is original symbolic guidance, not an independently reviewed canonical rule corpus. Four Pillars uses civil-time pillars, not a longitude-corrected true-solar-time school. Compatibility is a defined symbolic comparison; it is not a full traditional marriage-matching system. Do not market those broader claims or mark method-specific expert review passed on the basis of automated tests. These limitations need review with the client alongside the live readings.

References: [Astronomy Engine](https://github.com/cosinekitty/astronomy), [JPL Horizons manual](https://ssd.jpl.nasa.gov/horizons/manual.html), [Swiss Ephemeris documentation on sidereal modes and ayanamsa](https://www.astro.com/swisseph/swisseph.pdf), [lunar-typescript](https://github.com/6tail/lunar-typescript). Runtime calculations use Astronomy Engine and lunar-typescript; Swiss Ephemeris is not bundled or used at runtime. A separate attempted Python reference installation failed and was removed; no additional independent Swiss validation is claimed.

## Executed verification

| Check | Result | Evidence / limit |
| --- | --- | --- |
| App TypeScript | Passed | `npm run typecheck` |
| App tests | 38 passed, 12 suites | `npm test -- --silent` |
| Backend tests | 14 passed | `npx -y deno@2.5.0 test --allow-env --config supabase/functions/deno.json supabase/functions/_shared/*.test.ts supabase/functions/ai/ai-contract.test.ts` |
| Nine modules | Mocked first reading + follow-up + retries passed for each | Real handler, evidence builder and provider adapter; fake transport/DB boundary |
| Provider errors | Passed | Missing/flagged moderation, HTTP 429, refusals, malformed JSON fields, invented citations, retake result |
| WhatsApp transport | Mocked contract passed | HMAC user/phone/code binding; template parameters; provider errors. No real delivery |
| Media deletion | Passed | 206 synthetic objects including pagination and nested orphan upload |
| RLS / privileges / Storage | Passed on target database | `supabase/tests/milestone_two_access.sql`; three synthetic users, all inserts rolled back |
| OTP and quota RPCs | Passed on target database | Cooldown after failed delivery, five wrong attempts, expiry, daily quota, input binding, exclusive lease and retries |
| Appearance | Passed | Six viewport/theme combinations plus Settings persistence; native adapters isolated |
| Android export | Passed after theme changes | `/tmp/star-talks-m2-final-export.log`; local export only |
| Targeted app/component lint | Passed | `npx eslint src/app src/components src/lib/theme-context.tsx src/constants/appearance.ts --quiet` |
| Installed-device test | Not run | No attached device/emulator; not equivalent to the browser/export checks |
| Live AI / WhatsApp | Not run | Credentials absent |

The machine ran out of disk space during testing. Regenerable npm download cache and this task's temporary artifacts were cleared; an interrupted source write was restored from the already deployed function, and checks rerun. No personal files were removed.

## Final activation after credentials arrive

1. Configure server secrets and confirm the exact approved MSG91 template components against the client guide. Generate the server-only OTP pepper; never put provider credentials into Expo variables.
2. Run real WhatsApp send/verify and failed/expired/reused-code tests with consented test numbers; confirm same-user-ID linkage.
3. Apply the separate verified-phone gate only after existing users can complete verification. Repeat direct profile/chart access checks as verified and unverified users.
4. Run live first readings and follow-ups for all nine modules, all supported compatibility methods, photo retake/revocation/deletion, memory, safety and retry cases. Review output relevance and method limits; record actual usage/cost.
5. Build `eas build --platform android --profile preview`; check email/Google auth, recovery, logout/back protection, onboarding, phone verification and M2 screens on an installed APK in both themes.
6. Record deployment versions, build URL, Git commit, test results and client/content-review decisions in the deployment handoff. Only then call the milestone accepted end to end.
