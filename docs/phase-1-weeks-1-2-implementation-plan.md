# Star Talks — Phase 1 (Weeks 1–2) Implementation Plan

## Goal

Deliver a reviewable Android app foundation for Star Talks that follows the first onboarding and home screens in `docs/ui.jpeg` and `docs/Aurelia - Dev Plan.docx.pdf`, while implementing the foundation milestone in `docs/Aurelia_AI_Proposal.pdf`.

The proposal calls this milestone **Foundation and calculations**. It requires backend, database and API structure; account creation and login; profile and birth detail entry with place lookup; region and time-zone detection; a calculation engine that handles historical time-zone and daylight-saving rules; and the AI module framework and registry. The proposal does not give a separate acceptance checklist, so the final checklist below translates that scope into things the client can open and verify.

## Source-of-truth rules

1. The current product name is **Star Talks**. Replace every Aurelia name and Aurelia “A” mark in implemented screens with the supplied Star Talks logo and wordmark. The old name in the reference files is historical only.
2. Use the proposal to decide what belongs in the build. Use the dev plan and UI JPEG for the visual design and user flow, while excluding items the proposal explicitly removes.
3. The Phase 1 screen flow ends at Home, matching the onboarding flow in the dev plan. Home is included as a reviewable destination, not as completion of every service shown on that screen.
4. Do not build human-astrologer search, profiles, live chat/calling, consultation timers, consultation billing, or review flows. Those screens/features are excluded by the proposal even where old mockups show them.
5. Palm image upload and its camera/gallery permission screen are deferred. They belong to the later palm-reading experience and are not needed to complete the Phase 1 onboarding path.
6. Build the foundational AI registry only. Specialized prompts, readings, AI chat, credit deductions, reports, and the nine finished AI experiences are later milestones.

## Phase 1 screen inventory

| Order | Screen | Reference | Phase 1 behavior |
| --- | --- | --- | --- |
| 1 | Splash | UI JPEG screen 1; dev-plan onboarding group | Show supplied Star Talks identity over the mockup’s deep-indigo cosmic sunrise treatment; continue into region setup or the saved onboarding state. |
| 2 | Region selection | UI JPEG screen 2 | Select country/region; save it; suggest a default language, currency, date format, and region. Location permission is not required just to choose a region. |
| 3 | Language selection | UI JPEG screen 3 | Choose a language from the planned list; remember selection and use it for Phase 1 UI strings. |
| 4 | Login / Sign up | UI JPEG screen 4 | Create an account, sign in, verify an email OTP, or use Google when its provider credentials are configured. Keep the mockup composition and button hierarchy. |
| 5 | Profile setup | UI JPEG screen 5 | Collect the user's display name and gender shown in the mockup; save or update the authenticated user's profile. Profile-photo capture is not required in Phase 1. |
| 6 | Birth details | UI JPEG screen 6 | Enter birth date, optional/unknown birth time, and birthplace; search and select a place; save coordinates and IANA time zone with the birth profile. |
| 7 | Home | UI JPEG screen 9; dev-plan Home screen | Reproduce the branded header, personalized greeting/hero, service-card grid, credits/promotional strip, and bottom navigation. Use only in-scope destinations; excluded consultation services must not be actionable. |

The UI JPEG is an overview rather than seven independent source files. Use its screens as the visual authority and the corresponding full-page images in the development-plan PDF for details. Preserve the device proportions, spacing, alignments, rounded controls, gradients, icon weight, and color hierarchy. Update old brand text/marks to Star Talks without redesigning the rest.

## Technology and architecture

- **Mobile:** React Native, Expo, TypeScript, Expo Router; Android is the delivery target. Keep dependencies pinned and commit the package lockfile.
- **Backend:** The client-owned Star-Talks Supabase project. Use Supabase Auth, PostgreSQL, and the generated Data API through `@supabase/supabase-js`. A publishable key may be in the mobile app; management, secret, and service-role credentials must never be shipped in it.
- **Database workflow:** Keep an imperative SQL migration in `supabase/migrations/` alongside the app. Enable RLS on every public table, explicitly grant only required roles, and scope user-owned rows to `auth.uid()`.
- **Location:** Use Geoapify Address Autocomplete behind a typed adapter. The free tier requires a client-owned API key (Geoapify advertises up to 3,000 requests/day without a card); keep it in ignored local environment settings, request only after user input, debounce and cache. Show Geoapify/OpenStreetMap attribution. Convert selected coordinates to an IANA time zone with a bundled lookup library.
- **Date/time correctness:** Store the entered local birth date/time, IANA time-zone ID, and resolved UTC instant. Preserve whether the time is unknown. Resolve historical DST using the IANA time-zone database; detect nonexistent and ambiguous local times and ask the user to resolve them rather than silently shifting the birth time.
- **Calculations:** Use a separable chart-calculation module with explicit input/output types, deterministic inputs, and recorded method/version metadata. Do not use a Swiss Ephemeris dependency unless its commercial license is approved. Record the selected ephemeris/ayanamsa assumptions in the implementation notes and expose a calculator interface so Phase 2 modules can consume one canonical result.
- **AI registry:** Register the nine proposal modules with stable IDs, display names, supported input requirements, methodology labels, and question-domain boundaries. The registry is metadata and routing structure only; it must not make generic AI calls in Phase 1.
- **UI assets:** Reuse `docs/logo.jpeg`. Create original SVG/native vector scenery, flags, map silhouette, buttons, and line icons from the references. Use a commercially usable bundled font selected in code; no additional client-sourced illustration/font pack is required.
- **Configuration:** Commit `.env.example`, never `.env` or secret keys. Required runtime settings are the Supabase URL and publishable key, plus the chosen place-provider setting. Clearly document provider-side setup for Google sign-in/OTP.

## Implementation phases and completion gates

### A. Baseline and reference extraction

- Confirm a clean repository state and preserve all four supplied reference files.
- Create this plan before adding application code.
- Set the app dimensions/safe-area baseline against the phone frames in the mockup; capture design tokens for indigo, gold, ivory, lavender, text, surfaces, borders, radii, and button heights.
- Build reusable branded primitives (screen shell, typography, primary button, inputs, selection rows, icon wrapper, status/header treatment) before composing screens.

**Gate:** Each implemented screen can be compared side by side with its relevant mockup, and the only intentional visible content differences are Star Talks branding and removal of out-of-scope consultation actions.

### B. Mobile shell and visual onboarding

- Scaffold Expo/TypeScript/Expo Router in the repository.
- Create the seven Phase 1 screens and transitions in the order above, with keyboard-aware forms, selected/disabled/loading/error states, and Android back behavior.
- Draw the splash/home sunrise artwork, region map, flags, and service icons as native vector artwork so no external asset download is needed.
- Build home cards with route destinations for Phase 1 screens and clearly inert/later-phase destinations for included services not yet implemented. Do not display astrologer-consultation features excluded by the proposal.

**Gate:** The full onboarding path is navigable on an Android-sized viewport and each screen matches its reference composition, palette, and visual rhythm.

### C. Supabase account and profile foundation

- Add the Supabase client, secure persisted session storage, app configuration, and auth state/navigation guards.
- Support email/password account creation/sign-in and email OTP verification. Add Google OAuth wiring using the app scheme and Supabase provider configuration; show a useful setup error when the provider is not enabled instead of pretending login succeeded.
- Add database entities for user preferences/profile, birth profiles/places, and module registry/config metadata. Keep private user data user-owned and prevent clients from changing server-controlled module configuration.
- Apply the migration only to the verified Star-Talks project; inspect existing tables first. Verify schema, grants, RLS, and representative authenticated access after deployment.

**Gate:** A real account can sign up/sign in, profile and birth details persist across app restarts, and one user cannot query or change another user's rows.

### D. Region, place search, and birth-time resolution

- Save manual country/region and language choices; derive sensible default currency/time display data from a maintained country/region map.
- Search places through the configured provider, show disambiguated results (city/region/country), and save the selected result's coordinates and place label.
- Resolve an IANA zone from coordinates; convert the entered wall-clock birth time using historical zone rules. Keep unknown-time birth charts marked as such rather than manufacturing noon or midnight.
- Validate required fields and explain ambiguous/nonexistent DST times in user language.

**Gate:** Searching and selecting a birthplace returns stable coordinates and time zone; historical DST cases resolve to the expected UTC instant; missing or unknown time remains explicit.

### E. Calculation engine and AI module registry

- Define `BirthData`, normalized UTC/time-zone input, chart result, planet position, house, and calculator-version types.
- Implement geocentric ecliptic longitudes for supported bodies, ascendant/houses, sign placement, and Vedic-derived nakshatra/dasha fields required as the Phase 1 calculation base. Keep system-specific settings explicit and separately versioned.
- Persist normalized chart results tied to the birth profile and calculation version so later modules do not recalculate inconsistently.
- Add unit-level fixtures for reference dates/locations and DST boundary cases; compare celestial outputs against an authoritative ephemeris reference within the declared accuracy tolerance.
- Add the nine-module registry described in the proposal with independent IDs and boundaries; verify every module resolves and unsupported/cross-module requests remain unhandled in Phase 1.

**Gate:** The same saved birth profile and calculator version produce repeatable chart data; the AI registry returns all nine configured module descriptors without mixing methodologies.

### F. Final integration and handoff

- Connect the screen flow to Supabase and calculation/location services; remove dead-end placeholders from the Phase 1 path.
- Verify fresh install → region → language → auth → profile → birth details/place selection → saved calculation → Home, plus returning-user sign-in and profile reload.
- Check Android layout at the reference viewport, one smaller viewport, keyboard-open forms, long place names, loading/error/empty states, and network failure recovery.
- Run type checking and Android/Expo production bundle checks; resolve all errors and review Supabase advisors for security findings.
- Update setup documentation with Android run steps, env variables, Supabase migration state, provider config, calculation assumptions, and known later-phase boundaries.

**Gate:** Phase 1 acceptance checklist below is complete; no test secrets are present in the repo; no work has been applied to Entertainment Power Players.

## Data model outline

- `profiles`: one row per `auth.users.id`; display name, gender, country/region, language, currency, date-format preference, timestamps.
- `birth_profiles`: owner ID, profile label/relationship, local birth date/time, `birth_time_known`, place label, latitude/longitude, IANA time-zone ID, resolved UTC timestamp, timestamps.
- `calculated_charts`: owner ID and birth-profile ID, calculator/version/method settings, normalized chart JSON, generated timestamp. Protect as private user data.
- `ai_modules`: stable module ID and display/config metadata. Client-readable if needed; writes reserved for trusted administrative paths, never self-editable by ordinary users.
- Add indexes for owner/profile lookups and uniqueness where required; enforce coordinate/date/time validity with database constraints where practical.

## Visual reference checklist

- **Splash:** deep-indigo full-screen field; centered current Star Talks logo; soft gold/lavender focal glow and layered mountain/sunrise silhouette; original brand replaces Aurelia wordmark/A icon.
- **Region:** warm-ivory background; centered title/subtitle; large soft map silhouette; white rounded region selection rows; indigo continue button; understated skip/sign-up text.
- **Language:** same ivory shell and top spacing; compact language rows with flag, language label, selected radio/check state; indigo continue button.
- **Login:** centered welcome title and helper copy; email/mobile and password controls; indigo login button; divider; social buttons; restrained links and ivory/lavender decoration.
- **Profile:** title/subtitle; centered circular camera/avatar treatment; full-name and gender fields; indigo continue button; subtle lower cosmic decoration.
- **Birth details:** date, time, and place fields with leading icons and trailing affordances; unknown-time option; indigo continue button; location result dropdown that visually belongs to the form.
- **Home:** deep-indigo top/header treatment and bottom tabs; greeting/avatar/notification; wide cosmic hero with prompt; two-column service cards; wallet/credit and daily-ad strip only where proposal scope supports them; all human consultation content removed.

## Phase 1 acceptance checklist

- [ ] Repository boots as a Star Talks Android app and identifies the app as Star Talks everywhere.
- [ ] Splash, region, language, login/sign-up, profile, birth details, and Home match the referenced screens closely at the intended device dimensions.
- [ ] The app supports the complete onboarding path and returning-user authentication without trapping the user on an unfinished screen.
- [ ] Region, language, profile, and birth details save and reload for the signed-in user.
- [ ] Birthplace search returns selectable places with coordinates and a resolved IANA time zone.
- [ ] Birth date/time converts correctly for historical DST; unknown, ambiguous, and nonexistent local times are handled explicitly.
- [ ] A versioned astrology calculator stores repeatable structured chart output for a saved birth profile.
- [ ] All nine specialized AI modules exist as isolated registry entries; no generic AI response path is invoked.
- [ ] Public tables have RLS and ownership policies; sensitive credentials are not committed or shipped to the app.
- [ ] A clean Android build and type-check complete, and the setup/handoff notes explain any third-party provider configuration still owned by the client.

## Known external setup

The client owns Supabase and any third-party provider accounts as required by the proposal. Supabase migrations are applied to the verified Star-Talks project. The ignored local `.env.local` contains the Star-Talks project URL and its publishable key, plus the Geoapify API key. A live Geoapify request for Lahore returned HTTP 200 with matching place results. Live Google/Apple sign-in requires those OAuth providers to be configured in Supabase.

## Implementation status

- [x] Expo/TypeScript/Expo Router Android app shell, Star Talks app identity, Poppins font, supplied logo conversion, and original vector splash/map decoration.
- [x] Seven Phase 1 routes and form flow; no live astrologer/consultation services or palm permissions.
- [x] Supabase Auth wiring for email/password, email OTP, and configurable OAuth providers; secure mobile token storage.
- [x] Applied profile, birth profile, calculated chart, and AI module schema with owner-scoped RLS and indexes to project `thoknhjxmgsyisxuyamb`.
- [x] Country/currency/date-format selection, language preference, Geoapify adapter, coordinate-to-time-zone lookup, and historical DST gap/overlap handling.
- [x] Versioned tropical/sidereal chart output and all nine AI module registry entries.
- [x] Unit coverage, TypeScript check, Android bundle export, and a mobile viewport visual pass.
- [x] Add the client-owned Geoapify key and verify live birthplace search.
- [ ] Configure Supabase email delivery and Google/Apple OAuth credentials for real provider sign-in.

The app bundle and core data/model work are implemented; the last two items require credentials and provider-side settings controlled by the client.
