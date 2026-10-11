# Milestone 2 test report — 2026-10-11

Project: Star Talks (`thoknhjxmgsyisxuyamb`). Branch: `milestone-2-implementation`. All remote tests used disposable accounts and removed them afterward. No credential or user data was saved in this report or the smoke scripts.

## Result

The original weeks 3–4 AI implementation passed automated coverage for all nine modules, a real Supabase API smoke run, a small live OpenAI run, browser UI navigation, and Android bundle export. This is **not** installed-APK or expert-content acceptance. WhatsApp OTP was added after the original proposal and remains separately pending while MSG91 onboarding is incomplete.

## Coverage

| Area | Result | Evidence / limit |
| --- | --- | --- |
| App TypeScript and UI logic | Pass | `npm run typecheck`; 40 Jest tests across 13 suites. |
| Backend modules and provider contracts | Pass with mocked OpenAI | 16 Deno tests. All nine module handlers start readings, persist replies, handle follow-ups and retries; memory pagination, compatibility, chart/numerology/tarot/Four Pillars methods, safety and photo cleanup are covered. No billable provider calls in these tests. |
| Real Supabase auth and isolation | Pass | Disposable email accounts signed up and logged in. Another account could not read a birth profile, AI conversation, or private image. |
| Real AI API without generation | Pass | Nine active modules listed; consent saved/read; history retrieval, rename, search/filter, feedback, deletion and account deletion passed. Quota claim/replay/cap passed. Private image upload, metadata and deletion passed. |
| Live OpenAI integration in this run | Pass | One numerology first reading returned cited evidence. One tarot compatibility analysis saved, reopened, produced no invented percentage, and opened a linked chat. Exactly **two AI generation actions** were run; no load/stress test. |
| Earlier live AI check (2026-10-09) | Pass after fixes | Tarot first reading, grounded follow-up, off-topic refusal and same-request replay. Three OpenAI Responses attempts in that earlier check, including one rejected by our validator before its fix. |
| Browser UI at 390 × 844 | Pass after CORS fix | Signed-in Home and AI registry loaded. Module card opened consent before generation. Saved history opened and feedback submitted. No extra OpenAI calls. |
| Android bundling | Pass | `npx expo export --platform android` produced the Hermes Android bundle. |

## Bug found and fixed during this run

The AI page initially displayed “Failed to send a request to the Edge Function” and disabled all module cards in the browser. Its preflight response omitted `x-client-info`, which the Supabase browser client sends. A shared CORS allow-list now covers Supabase client headers in `ai`, `verify-whatsapp-phone`, and `delete-account`. The browser regression script was red before the fix and green afterward; all three deployed functions returned HTTP 204 to preflight with `x-client-info` allowed.

## Cost and cleanup

This run made two billable OpenAI Responses generation actions. The broad nine-module suite used mocked responses; the real photo test exercised private storage without image inference. Exact charges must be checked in the client's OpenAI billing account. Both remote and browser smoke scripts removed their disposable accounts. No live MSG91 request was made.

## Remaining acceptance limits

- No Android emulator or physical device is attached here. Android export proves bundling, not installed APK behavior, device camera/gallery permissions or native layout.
- Only tarot and numerology have live first-reading results; the other seven modules passed mocked handler tests. Palm and face AI image recognition was not called live. An astrology expert still needs to judge method-specific Vedic and Lal Kitab claims and reading quality.
- Google OAuth and existing email reset flows were outside this Milestone 2 smoke. Final client APK review should include those regressions, appearance on device, and the user's expected flow.
- MSG91 WhatsApp sender/template approval and live OTP delivery are pending. The phone gate remains off until delivery and same-account verification succeed.

## Reproduce

From the repository root, with a Star Talks authorized `SUPABASE_ACCESS_TOKEN` set in the environment:

```bash
python3 scripts/milestone2-remote-smoke.py
python3 scripts/milestone2-remote-smoke.py --live  # exactly two generation actions
CI=1 npx expo start --web --port 19006 --localhost
node scripts/milestone2-ai-web-smoke.cjs
```

The scripts never print or store the token. The browser smoke uses local Chrome at `/usr/bin/google-chrome`; the remote smoke uses Python's standard library. Run the no-cost mode by default.
