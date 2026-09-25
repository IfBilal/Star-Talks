# Star Talks

Star Talks is an Android-first astrology app built with Expo, React Native, TypeScript, Expo Router, and Supabase. Phase 1 implements onboarding through the Home screen and the account, birth data, place/time-zone, chart-calculation, and AI-module registry foundations.

## Run locally

1. Install Node.js and Android Studio (or use an Android device with Expo Go / a development build).
2. Install packages with `npm install`.
3. Copy `.env.example` to `.env.local` and add the project’s Supabase URL and publishable API key. Add a Geoapify key for live birthplace search.
4. Run `npm run android` for the Android emulator or `npm start` and scan the QR code on a device.

The ignored `.env.local` file is loaded by Expo and is not committed. Supabase publishable keys are intended for client applications; never put a Supabase secret/service-role key in the app.

## Services

- **Supabase:** Project `thoknhjxmgsyisxuyamb` (Star-Talks). The SQL source of truth is in `supabase/migrations/`. The Phase 1 migrations are applied to this project. Email sign-in and verification use Supabase Auth. Google and Apple buttons use Supabase OAuth and require each provider to be enabled and its redirect URLs configured in the client-owned Supabase project.
- **Geoapify:** Create a client-owned free account and an API key, then set `EXPO_PUBLIC_GEOAPIFY_API_KEY` in `.env.local`. Geoapify currently advertises 3,000 free requests/day without a payment card. The app sends requests only after a user types at least three characters, waits 450 ms, caches results briefly, and shows Geoapify/OpenStreetMap attribution. API keys embedded in a mobile app can be extracted; configure quota and endpoint restrictions for the key and rotate it if exposed. If production traffic grows, move the proxy/key to a Supabase Edge Function.
- **Time zones:** `tz-lookup` maps selected coordinates to IANA time-zone identifiers. `src/features/birth/timezone.ts` resolves local birth time to UTC using the runtime IANA database and returns ambiguous/nonexistent DST cases for explicit user handling.
- **Charts:** `astronomy-engine` supplies planetary positions. `src/features/astrology/chart.ts` records tropical and sidereal placements, whole-sign ascendants/houses, lunar nakshatra/pada and the birth Vimshottari mahadasha balance. The Lahiri correction is a documented mean precession approximation. The calculator version and assumptions are saved with each chart. Unknown birth time remains unknown and does not generate a chart using an invented clock time. Do not use these results for professional-grade predictions without validating the ephemeris and ayanamsa choices against an agreed reference.
- **AI registry:** `src/features/ai/moduleRegistry.ts` describes nine isolated modules. It does not call a general-purpose AI endpoint; module experiences are later milestones.

## Check the work

- `npm run typecheck`
- `npm test`
- `npx expo export --platform android`

## Phase boundaries

This build intentionally excludes live astrologer discovery/consultations. It does not implement AI readings, wallet/credit transactions, payment processing, reports, courses, ads, or palm-photo permissions. The Home cards are design previews for later milestones.

The original Aurelia proposal and design references remain in `docs/`; the current product name and supplied Star Talks logo are used in the app.
