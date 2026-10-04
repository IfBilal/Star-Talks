# Star Talks — Milestone 2 (Weeks 3–4) implementation plan

**Status:** implementation plan; no Milestone 2 functionality is claimed complete by this document.

**Product:** Star Talks. “Aurelia” and “AstroSage” in historical references are replaced by Star Talks in the shipped application.

**Delivery target:** Android app backed by the existing Star Talks Supabase project.
**Milestone name in the proposal:** “The nine AI modules.”

## 0. How to use this plan

1. Read this document, the proposal, the dev plan, and the relevant reference crops before changing an AI screen.
2. Complete the phases in order. A phase is finished only when its gate and the corresponding acceptance checks are satisfied.
3. Keep the existing visual design. Replace sample data and inert controls with real states and actions without redesigning the mockups.
4. Record any intentional departure from the mockup in the visual deviation log in the implementation PR or handoff notes.
5. Treat user-owned data and AI provider credentials as separate trust domains. All paid AI calls run on the server.
6. Never present a generated reading as verified fact or as a medical, legal, or financial instruction.
7. Use Star Talks in labels, notifications, prompts, logs shown to a user, and assets. Historical document filenames may remain unchanged.

### Source precedence

| Question | Source of truth |
| --- | --- |
| What belongs in Weeks 3–4? | `docs/Aurelia_AI_Proposal.pdf`, section 7, milestone 2. |
| What must each AI do? | Proposal sections 2–4; dev plan sections 8, 18, and 19. |
| What should the screen look like? | `docs/reference/ai-00.png` through `ai-11.png`, `compat-00.png`, `compat-01.png`, `my-profiles.png`, `add-profile.png`, `safety.png`; corresponding dev plan pages. |
| Which brand appears? | Current Star Talks app assets and theme. |
| What exists today? | The code and migrations in this repository, inspected again before implementation. |

### Milestone outcome

By the end of Weeks 3–4, a signed-in user can select any of the nine AI modules, supply only that module's required data, receive a real first reading, ask a custom question, receive a methodology-specific answer and relevant follow-ups, return to a saved conversation, give feedback, manage multiple profiles, and run a compatibility analysis for two profiles. The experience uses actual calculations, cards, or user-provided images as appropriate. Demo text is removed from live flows.

## 1. Scope and boundaries

### In scope now

- Nine operational modules: Tarot, Vedic Astrology, Numerology, Western Astrology, Lal Kitab, Palmistry, Chinese Zodiac/BaZi, Korean Astrology/Saju, and Face Reading/Mian Xiang.
- Separate instructions, factual inputs, interpretation constraints, conversation history, and version metadata for each module.
- Short, evidence-based First Instinct Reading on entering a module with adequate inputs.
- Custom questions in the proposal's domains: love, marriage, career, finance, education, family, children, business, travel/relocation, relationships, general future, and other.
- Question classification, genuine clarification when necessary, module boundary handling, and deliberate module switching.
- Professional reading form: direct answer, multiple supporting factors, counter-indications, timing only where data supports it, plain-language explanation, uncertainty, and one to three relevant suggested follow-ups.
- Conversation persistence and per-module history: list, filter, search, reopen, rename, delete one, and delete all owned AI history.
- Response feedback: helpful, not helpful, reasons, and report. Store enough context for eventual admin review.
- Multiple profiles: add, edit, delete, select for reading, and select two for compatibility.
- Compatibility for love, marriage, friendship, and business with a saved result, strengths, challenges, dynamics, long-term outlook, and conditional timing.
- Palm and face image selection/capture, upload, private storage, analysis of visible features, and user consent. Do not force these inputs during general onboarding.
- Server-side AI orchestration, moderation, access control, limits, observability, and reproducible evaluation fixtures.

### Explicitly scheduled for later milestones

- Milestone 3: production wallet, purchased/promotional/free credit buckets, deductions, rewards from ads, payments, coupons/referrals, paid report generation, daily readings, and courses.
- Milestone 4: full admin panel, admin-configurable methods and prompts, token/cost dashboard, user support operations, and full localization rollout.
- Human astrologer search, live consultation, chat/calls with people, and per-minute billing are excluded from this proposal entirely.
- “Ask AI About This Report” cannot be fully exercised until reports exist in Milestone 3. Define the attachment contract now; activate the entry point with real report data then.
- The Compatibility screen's saved analysis belongs here. A separately priced downloadable compatibility report belongs with Milestone 3 reports.

### Milestone 2 pricing behavior

The current AI mockups say “Consumes 1 AI credit,” but credit accounting belongs to Milestone 3. In this milestone, show a truthful preview label such as “Available during preview” or a configured free-use allowance. Enforce a server-side per-user request limit so the provider account cannot be abused. Do not decrement a nonexistent wallet, display fabricated balances, or silently charge users. The AI request API must have a hook where a future credit authorization/settlement service can be added without rewriting module logic.

## 2. Current repository baseline and gaps

Recheck these observations against the branch at implementation time; another agent may have changed the code.

| Existing asset | Current state | Required conversion |
| --- | --- | --- |
| `src/app/ai/index.tsx`, `modules.tsx` | Nine-module UI and navigation exist. | Load availability/required-input status from the canonical registry; route to real start flows. |
| `src/app/ai/[module].tsx` | Sample insights, hard-coded answers and local-only messages; `send()` synthesizes text from UI fixtures. | Load real conversation, first reading, messages and suggestions from server; persist messages and feedback; eliminate fictional claims. |
| `src/app/ai/history.tsx` | Filters static `HISTORY` array. | Query owned conversations with pagination, module filter, search, rename/delete/reopen. |
| `src/features/uiData/ai.tsx` | Visual descriptions, icons and hard-coded readings. | Keep presentation metadata only; remove sample text from production response paths. |
| `src/features/ai/moduleRegistry.ts` and `public.ai_modules` | Nine IDs exist, but metadata is duplicated and some methodologies are too broad. | One canonical typed registry; DB rows synced from versioned definitions; server validates active module and input policy. |
| `src/app/profiles/index.tsx`, `new.tsx` | UI mockup flow. | Real CRUD and selection; form validation; birth place/time rules; empty/error states. |
| `src/app/compatibility/index.tsx`, `result.tsx` | Demonstration score and text. | Two saved profiles, selected system and relationship type, calculation, generated explanation, persisted result. |
| `src/app/palm-photo.tsx`, `permissions.tsx` | Presentational upload and toggles. | Real picker/camera permissions when used, preview/retake, upload and consent; remove consultation copy. |
| `public.birth_profiles` | Basic owner-scoped birth data; `unique(user_id,relationship)`. | Preserve one `self` row only; allow multiple `family`, `partner`, etc.; add needed person data and image ownership. |
| `public.calculated_charts` | Versioned chart data for one self profile. | Calculate for any selected profile; detect input changes; add derived fields needed by modules. |
| `src/features/astrology/chart.ts` | Tropical/sidereal longitudes, whole-sign houses, nakshatra and dasha at birth. | Audit accuracy and extend aspects, transit snapshots and full dasha periods; do not let AI invent absent fields. |
| Supabase migrations | Phase 1 tables and RLS exist. | New migrations for conversations, messages, analyses, attachments, feedback, consent and private Storage policies. |

Important existing data defect: `birth_profiles_user_relationship_unique` permits only one row per relationship. Replace it with a **partial unique index for `relationship = 'self'`** before enabling multi-profile creation. Preserve existing rows and chart foreign keys. Important chart-cache defect: a cached chart is currently found by profile ID and calculator version, so an edited birth profile may reuse stale chart data. Include a stable input fingerprint and regenerate when it changes.

## 3. Client inputs and decisions

The coding agent handles application code, SQL, visual asset preparation, fixtures, and setup documentation. The following items require the product owner or a delegated account owner because they involve external accounts, costs, consent, or brand decisions.

| Needed from owner | Why | Latest safe point | Default used while planning |
| --- | --- | --- | --- |
| AI inference account with API access, billing/spend cap, and a secret API key placed in Supabase Edge Function secrets. | Nine real text/vision modules cannot run on mock text. Never place this key in `EXPO_PUBLIC_*` or app source. | Before the first live backend call in Phase 2D. | OpenAI Responses API through a provider adapter; the exact model is chosen after current price/quality evaluation. |
| Permission to transmit selected birth data, questions, and uploaded palm/face images to that AI provider; approved privacy wording and retention expectations. | These are sensitive personal inputs. | Before live user use, especially image analysis. | Explicit first-use consent per data type; no image upload until consent. |
| Expected launch language(s) for AI answers. | Six languages appear in current UI/localization; quality must be measured per language. | Before prompt/evaluation freeze. | Answer in the user's selected app language where supported, fall back visibly to English. |
| Whether client owns licensed Tarot card artwork or wants the agent to source verified reusable art/create original art. | The mockup shows illustrated cards; a full 78-card deck needs lawful artwork. | Before final Tarot visual pass. | Agent creates or sources permissible artwork and documents provenance; no card art copied from unlicensed mockups. |
| Brand-approved wording for spiritual guidance and face reading. | Readings must not imply factual diagnosis or certainty. | Before client acceptance. | Conservative symbolic language with visible-feature evidence. |
| A small set of representative, consented or synthetic example profiles/questions for acceptance review. | Needed to judge specificity and whether outputs feel useful. | Before final evaluation. | Agent creates synthetic fixtures; no real personal information in repository. |
| Budget ceiling for preview requests and image calls. | Prevents runaway AI cost before wallet work ships. | Before public distribution. | Conservative server quota and provider spend limit; values kept configurable. |

If an AI provider credential is unavailable, complete the deterministic calculations, database, UI and mocked-server integration locally, but **do not mark Milestone 2 delivered** until live server calls pass all nine module acceptance checks. No additional assets are strictly required from the owner if the agent can create lawful Tarot artwork and capture guidance illustrations.

## 4. Technical architecture and trust boundaries

### Chosen baseline

- Mobile: retain React Native, Expo Router, TypeScript, current theme, fonts and shared UI components.
- Data/auth: retain Supabase Auth and PostgreSQL. Read/write user records through authenticated requests with RLS.
- Server: Supabase Edge Functions in `supabase/functions/`, with shared typed services under `_shared/` and versioned SQL in `supabase/migrations/`.
- AI: server-side adapter for OpenAI Responses API by default, using structured outputs for machine-readable answers; a separate text-only or vision model can be selected through server secrets/config.
- Provider secrecy: only Edge Functions read the provider key; no AI provider request originates from the app.
- Storage: two private buckets, or one private bucket with separate palm and face prefixes, protected by owner-scoped Storage policies.
- Deterministic engines: pure TypeScript calculation packages callable from server workflows and fixture tests; reuse the Phase 1 chart model when validated.
- Networking: app calls typed backend functions; no direct client writes to server-controlled AI answer/status fields.

### Request path

```text
Android app (authenticated Supabase session)
  → invoke Edge Function with module ID, profile ID, conversation ID, request ID
  → validate user and ownership, module status, consent and quota
  → load versioned calculations / Tarot draw / image feature description
  → check safety and module scope
  → call the configured AI provider with module-specific instructions
  → validate structured output, citations to supplied factors and safety constraints
  → persist user turn, assistant turn, evidence, feedback-ready IDs
  → return a typed response to the app
```

### API surface and ownership checks

| Operation | Input | Server behavior | Output |
| --- | --- | --- | --- |
| `list-modules` | none | Return active module descriptors and input requirements. | Typed list, version. |
| `start-reading` | `moduleId`, optional `profileId`, optional `imageId`, optional `spread`, `requestId` | Verify ownership; assemble input; create or reopen conversation; generate first reading exactly once per input version. | Conversation, first message, readiness state. |
| `ask-module` | `conversationId`, question, `requestId` | Verify ownership and immutable module/profile binding; classify; clarify or redirect if needed; generate answer. | Saved assistant message and suggestions. |
| `get-conversation` | `conversationId`, page cursor | RLS-scoped fetch including cards/evidence references. | Ordered messages and next cursor. |
| `list-conversations` | module filter, search, cursor | RLS-scoped indexed query. | Summaries and next cursor. |
| `rename-conversation` | ID, title | Validate length and owner. | Updated summary. |
| `delete-conversation` | ID | Owner-only deletion and attachment cleanup policy. | Success/failure. |
| `delete-all-ai-history` | explicit confirmation | Owner-only deletion across all nine modules. | Deleted count and completion result. |
| `submit-ai-feedback` | `messageId`, helpful state, reason, optional report note | One owner feedback record per message, editable; reports preserved for later admin review. | Saved feedback. |
| `analyze-compatibility` | two distinct profile IDs, relationship type, method/module, `requestId` | Verify both owned; compute method-specific factors; generate and persist analysis. | Analysis ID and result. |

Ordinary read operations may use direct Supabase table queries where RLS and simple pagination suffice. AI generation, entitlement/quota decisions, moderation, and server-controlled writes must use functions. A function using a privileged key must recheck every user ID and profile ownership itself; never trust IDs sent by the app.

### Shared typed contracts

Define and validate request/response objects at both the Edge Function and app boundary. Suggested top-level result forms:

```text
ModuleDescriptor { id, label, methodologyVersion, requiredInputs, supportedDomains, available }
ProfileReadiness { ready, missing[], partialDataWarnings[], supportedQuestionKinds[] }
FirstReading { title, insights[3..6], sourceRefs[], uncertainty, suggestions[1..3] }
Answer { directAnswer, supportingFactors[], conflictingFactors[], timing?, uncertainty,
         plainLanguageExplanation, followUps[1..3], sourceRefs[], safetyCategory? }
Redirect { explanation, recommendedModuleId, originalQuestion }
Clarification { question, choices?, pendingUserQuestionId }
Conversation { id, moduleId, profileId?, title, createdAt, updatedAt, lastMessagePreview }
Message { id, role, kind, body, structuredPayload, status, createdAt, requestId }
CompatibilityResult { id, profiles[2], type, methodVersion, score?, factors[], strengths[],
                      challenges[], dynamics, longTermOutlook, timing?, limitations }
```

Use explicit result unions (`answer`, `clarification`, `redirect`, `blocked`, `error`) instead of inferring state from free text. Store `module_id`, `methodology_version`, `prompt_version`, `calculator_version`, `input_fingerprint`, `provider_model` and generation timestamp with each reading. Structured output improves parsing; the server must still check schema, evidence IDs, content length and prohibited claims before publishing an answer.

## 5. Data design and migrations

### Migration sequence

1. Inspect live Star Talks schema, policies and row counts; verify the project ID before migration.
2. Add new nullable fields and new tables without breaking Phase 1 clients.
3. Backfill self-profile names and calculation fingerprints where possible; never invent birth times.
4. Remove the relationship-wide unique constraint and create a unique partial index on `(user_id)` for `relationship = 'self'`.
5. Enable RLS, add owner policies, explicit grants and indexes in the same migration as each new table.
6. Configure private bucket limits, MIME allowlist and Storage RLS. Test upload, read and delete for two separate users.
7. Deploy functions after the migration; check old-app compatibility before a client APK update.
8. Record migration IDs and deployment status in handoff notes; provide a data-safe rollback plan.

### Profile and derived-data changes

- Extend `birth_profiles` with person name distinct from row label where necessary, optional gender if a selected method genuinely requires it, and a clear `birth_time_known` state.
- Use the existing `birth_date`, `birth_time`, `birth_instant`, `place_label`, coordinates and IANA zone as canonical inputs.
- Preserve relationship enum (`self`, `family`, `partner`, `friend`, `child`, `other`); allow multiple rows of every non-self relationship.
- Update all queries that currently assume `relationship='self'` to accept a selected owned `profileId`; default to self only when the user has not selected another profile.
- For edited birth details, invalidate or supersede derived data by `input_fingerprint`; never use a chart tied to the old date, time or place.
- Add `calculation_snapshots` or versioned JSON columns for numerology, transit and Four Pillars results. Key uniqueness by profile, calculator version, input fingerprint and any as-of date.
- Preserve old chart rows for audit or replace safely; do not silently overwrite historical answers whose source calculation changed.

### New entities

| Entity | Required fields / constraints | Privacy and indexing |
| --- | --- | --- |
| `ai_conversations` | UUID; `user_id`; immutable `module_id`; optional `birth_profile_id`; optional `image_id`; title; status; timestamps; input fingerprint; last message time. | Composite owner/profile foreign key; RLS owner only; index `(user_id,module_id,updated_at desc)`; title search index. |
| `ai_messages` | UUID; conversation ID and owner ID; role; typed kind; text; validated structured payload; request ID; status; versions; timestamps. | Owner-scoped composite FK; index `(conversation_id,created_at,id)`; unique `(conversation_id,request_id,role)` for retry safety. |
| `ai_generation_jobs` | Request ID; owner; operation; state (`pending`,`running`,`completed`,`failed`); attempt count; provider metadata; error category; timestamps. | Server-write only; limited owner read; unique request ID per owner/operation. |
| `ai_evidence` or embedded snapshot | Message ID; factor IDs; calculation or card references; sanitized image observations; version/hash. | Owner only; never public. Store enough to reproduce why a reading said something. |
| `ai_feedback` | Message ID; owner; helpful flag; reason enum; optional redacted comment; report flag; timestamps. | Owner create/read/edit; future admin review via privileged path; unique owner/message. |
| `ai_media` | Owner, optional profile, kind (`palm`,`face`), object path, MIME, size, consent version/date, upload status, created/deleted timestamps. | No public URL; owner-only row and Storage path; index owner/profile/kind. |
| `compatibility_analyses` | Owner, two distinct profile IDs, relationship type, method, calculation/prompt versions, score if defensible, structured result, input fingerprint, timestamps. | Composite ownership FKs for both profiles; owner-only RLS; index owner and date. |
| `ai_consent` | Owner, consent scope, text version, accepted/revoked time. | Owner-only; server checks before provider call and image use. |
| `ai_usage_limits` or RPC-backed counters | Owner, rolling period, allowed/used requests, request IDs. | Server-managed atomically; no client-modifiable allowance. |

### Data and deletion invariants

- Every conversation and message belongs to exactly one authenticated user.
- Every referenced birth profile and media object belongs to that same user; enforce with composite keys or checked server transactions.
- A conversation's module ID and selected profile are fixed after creation. Switching module starts another conversation; changing profile starts a new input version/conversation.
- Deleting a profile either blocks with a clear warning or cascades its derived calculations, media links and compatibility analyses according to a documented rule. Never leave an AI thread pointing to another person's deleted record.
- Deleting AI history removes messages, evidence, feedback links and provider-side persisted state if any. Do not promise physical deletion from third-party retention beyond the provider's actual policy.
- Image replacement deletes or expires the old private object after references are updated; orphan cleanup is idempotent.
- Search indexes contain only user-owned summaries and are queried with owner scope. No public vector store or anonymous image URL.
- Migrations and policies must be verified using two separate real/synthetic user identities and an anonymous client.

## 6. Module-specific calculation and evidence contracts

The AI provider writes explanations; it does not invent cards, charts, numeric values, dates, lines, pillars or scores. Each module's deterministic input builder returns a compact, versioned, server-validated evidence bundle. A generated statement must reference one or more evidence IDs, or clearly be framed as a broad symbolic interpretation rather than a personal fact. If an input is missing, the module says what is missing and either asks for it or limits its interpretation.

### 6.1 Tarot

- Define the complete 78-card canonical deck: 22 Major Arcana and 56 Minor Arcana, four suits, ranks, stable card IDs, upright and reversed meanings, and image attribution/source.
- Implement a cryptographically seeded Fisher–Yates shuffle or equivalent unbiased draw. Persist the draw order, orientation, spread ID, position and seed reference or draw snapshot so reopening a conversation never changes its cards.
- Support at minimum a three-card past/present/future spread and a ten-card Celtic Cross with named positions and position meanings.
- Generate the first “Current Energy” reading from an actual recorded opening spread; cover 3–6 of the proposal's themes only where the cards support them (emotion, focus, tension, transition, unresolved situation, opportunity, contradiction).
- Compose connected spread interpretations: the same card in a different position changes its role; interactions between cards matter. Do not output a sequence of independent dictionary entries.
- On follow-up, use the existing spread by default. Offer an explicit “Draw new cards” action when new evidence is needed; never silently reshuffle a prior spread.
- Tarot works for a new account with no birth date or profile. The screen must not gate Tarot on profile completion.
- Tarot answers Tarot-domain questions only. A request for Vedic dasha returns a module redirect without making up a dasha.
- Test deck uniqueness, 78-card count, suit/rank coverage, no replacement within a draw, orientation handling, persisted redraw behavior and position-aware explanation.

### 6.2 Vedic Astrology

- Consume the selected profile's validated sidereal chart, not a model-generated chart. Confirm the exact ayanamsa and house method in the calculation metadata.
- Audit Phase 1's approximate Lahiri ayanamsa, ascendant and planetary results against an authoritative ephemeris before using them for personal timing claims. If the declared accuracy is insufficient, upgrade the calculator and bump its version. Preserve migration compatibility.
- Extend the deterministic builder with house occupancy, planetary relationships/aspects, current sidereal transits, full Vimshottari period timeline and relevant subperiods rather than only the birth mahadasha lord.
- First reading examines combinations of factors for 3–6 defensible patterns in work, relationships, family, education, talents or recurring obstacles. It must not assert “you are unmarried” or name a parent's influence without evidence.
- Answer format states the conclusion first, cites relevant planets/houses/dasha/transit references, notes contradictions, and gives a timing interval only when the period calculations support it.
- Unknown birth time suppresses ascendant, houses and time-dependent dasha precision where necessary; ask for a known time or provide a limited date-only reading. Never substitute noon without labeling it.
- Test known charts, time-zone edges, chart changes after editing a profile, interpretation evidence references and no use of tropical positions in the Vedic module.

### 6.3 Numerology

- Define one named, versioned numerology system for this release (default: Pythagorean); document letter-to-number mapping, handling of 11/22/33, reductions, vowels, `Y`, punctuation, accents and spaces.
- Compute Life Path from birth date; Birthday number from day; Destiny/Expression from confirmed full name; Soul Urge from vowels; Personality from consonants; Personal Year and Personal Month from the user's local calendar date.
- Do not derive name-based numbers from an abbreviated display name. Ask for the person's full birth name or a confirmed numerology name field. For names written in another script, request a user-confirmed Latin transliteration rather than silently inventing one.
- Store normalized input and version with the numeric result. Never send the AI a sample fixed “Life Path 7” unless that profile computes to 7.
- First reading connects multiple actual numbers and cycles into 3–6 specific themes; avoid reducing the answer to one Life Path definition.
- Unknown birth time does not block Numerology. Missing birth date or confirmed name yields targeted input requests, with date-only output limited to date-derived numbers.
- Test published example calculations, reduction boundaries, non-Latin name flow, leap dates, cycles at year/month boundaries and name edits invalidating cached results.

### 6.4 Western Astrology

- Use the selected profile's tropical chart from the audited calculator. Make house system and aspect-orb rules explicit and versioned.
- Add deterministic natal aspects (for example conjunction, opposition, square, trine and sextile under configured orbs), house occupancy and current transits with exact as-of timestamp and time zone.
- First reading combines placements and aspects for 3–6 themes such as career, relationships, contradictions, creativity and current transitions.
- For timing, derive windows from transit/orb rules rather than telling the model to guess future months. Label wider windows as approximate.
- Unknown birth time limits ascendant/houses and Moon-dependent claims when birth-day movement matters; explain which insights remain available.
- Test aspect wraparound at 0°/360°, retrograde/transit dates, source references and separation from sidereal/Vedic methods.

### 6.5 Lal Kitab

- Use the audited sidereal birth data as input, but provide **Lal Kitab-specific** rule data and prompt instructions. Do not relabel a standard Vedic answer.
- Create a reviewed/versioned ruleset for its planetary-house interpretations, relationships and candidate remedies. Reference the exact rule IDs supplied to the model.
- Keep remedies optional, practical and non-harmful. Avoid expensive purchases, medical substitutions, ritual coercion or guaranteed outcomes.
- If an accurate birth time or house placement is unavailable, avoid house-specific claims and request the needed detail.
- First reading covers 3–6 supported patterns; answer cites Lal Kitab rule IDs and relevant chart factors.
- Test at least one case where Vedic and Lal Kitab receive the same chart but produce methodologically distinct, correctly labeled explanations.

### 6.6 Palmistry

- Ask which hand the image shows and whether the user is comfortable with a symbolic palm reading. Provide photo guidance: whole palm visible, fingers extended, good light, sharp focus and no background face.
- Let the user capture or select, preview, retake, upload, replace and remove a palm image. Request camera/gallery permission only at action time; denial leaves another valid path.
- Validate MIME, dimensions, file size and orientation; strip unnecessary metadata, resize/compress on-device where appropriate, store in private Storage and use an expiring server-side access mechanism.
- Have the vision stage return structured observations for only visible head, heart, life and fate lines, mounts, fingers, palm shape, depth, branches and unusual markings. Each observation includes `visible`, `confidence/quality`, and an image region or textual location.
- A second interpretation stage may use only visible observations. Unclear or occluded features are identified as such; it must not claim an unseen line, infer a factual diagnosis, or treat “life line” as lifespan.
- First reading gives 3–6 clear observations if the image supports them; otherwise ask for a better photo with concrete guidance and do not fabricate a full reading.
- Test poor lighting, blur, cropped palm, multiple hands, non-hand image, upload failure, permission denial, photo replacement and private-access policy.

### 6.7 Chinese Zodiac / BaZi

- Implement **Four Pillars**, not only a birth-year animal. Derive year, month, day and hour pillars as Heavenly Stem plus Earthly Branch, the Day Master, five-element balance across all eight characters and year/inner/secret animal labels.
- Use an explicit solar-term algorithm and a versioned source for exact term instants. The sexagenary year turns at **Lichun**, not January 1. Month pillars follow the relevant solar terms; day/hour boundaries and location time zone are documented.
- Resolve the user's historical local time through the existing IANA time-zone pathway; test on either side of Lichun and at DST transitions.
- When birth time is unknown, produce only the pillars the evidence supports and label the hour pillar unavailable. Never silently fill it with noon.
- First reading uses the Day Master and element interactions, not generic year-animal stereotypes.
- Test all 60 sexagenary combinations, solar-term edge cases, a leap year, IANA historical offsets, unknown hour and at least two independent reference examples.

### 6.8 Korean Astrology / Saju Palja

- Reuse the validated Four Pillars calculation, but render Korean stem/branch terminology and a distinct Saju interpretation policy centered on the **Ilgan** (day stem) and its relation to the other characters.
- Keep Saju prompt/rules versioned separately from BaZi. Do not reuse Chinese Zodiac output text or present a translated copy as a separate module.
- Show how year, month, day and hour pillars interact, including missing-hour limitations. Respect the same local-time and Lichun calculation boundaries.
- First reading emphasizes distinct Saju themes and references exact pillar/factor IDs.
- Test shared pillar numbers against the BaZi engine while verifying separate terminology, interpretation instructions and history isolation.

### 6.9 Face Reading / Mian Xiang

- Request a user-selected, well-lit, front-facing image and explicit consent before analysis. Support camera and gallery, preview, retake and removal.
- Vision may describe only visible, non-sensitive facial structure relevant to the proposed symbolic framework: three zones, five key features and broad proportions, with uncertainty and image-quality flags.
- Do not infer ethnicity, religion, attractiveness, health, weight, exact age, trustworthiness, criminality, income or factual personality from appearance. Keep any Mian Xiang explanation clearly symbolic, not a claim about the person's actual traits or future.
- If this constraint prevents a meaningful output under the selected provider's rules, show a narrower feature-based symbolic reading rather than inventing private facts. Escalate unresolved product/policy conflicts before claiming acceptance.
- First reading names the exact visible feature behind each interpretation; poor or ambiguous images request a new image.
- Test faces at varied lighting and skin tones, occlusions, non-face images, multiple faces, image deletion, permission denial and sensitive-attribute prompts.

### Shared module rules

- Only modules with sufficient data may enter `ready` state. Show a specific next action for missing inputs rather than a generic failure.
- Never mix a module's concepts or prompts with another module's context. A question about another module returns `redirect` with a button to switch deliberately.
- All nine modules store independent conversations; the same selected profile may be used across modules without copying one module's history into another.
- A first reading is created once per conversation/evidence snapshot/request ID and reopened without another provider call. An explicit New Reading starts a new conversation; Tarot then draws new cards.
- A new reading after an input edit is explicitly versioned and identified as new; old saved threads remain intelligible.
- Server-side response verification rejects unsupported source references, missing required sections, excessive certainty and prohibited sensitive claims; retry once under the same request ID, then return a recoverable error.

## 7. AI orchestration, prompts and answer lifecycle

### Prompt package per module

Each module gets its own checked-in prompt policy file with: objective, allowed inputs, prohibited cross-module facts, interpretation rules, evidence formatting, first-reading instructions, question categories, clarification criteria, follow-up style, safety rules, and structured response schema. Prompts are versioned and reviewed like code. The system prompt never embeds a user's real data; the server supplies a separately delimited, typed evidence bundle for that request.

The app does not trust user-entered text, image content or past assistant messages as instructions. The server explicitly labels them as untrusted data. A user asking “ignore the Vedic module and use Tarot” receives a deliberate switch option, not a silent change of methodology. Prompt injection attempts contained in uploaded images or quoted prior conversation do not change server rules.

### Request state machine

1. `received`: parse and validate request size, UUIDs, module ID, message length and request ID.
2. `authorized`: verify the current Supabase user, ownership of conversation/profile/image and consent.
3. `eligible`: enforce module input readiness, server preview quota and concurrency/rate limits.
4. `classified`: identify topic, safety needs and cross-module routing; choose answer, clarification, redirect or refusal.
5. `prepared`: load the smallest necessary conversation window plus durable summary, calculations, cards or image observations; assemble evidence IDs.
6. `generating`: call model through server adapter with timeout, bounded token budget and structured output schema.
7. `validated`: parse output, check evidence references, avoid unsupported certainty, check moderation and module scope.
8. `committed`: atomically persist the user turn, assistant result, usage and request ID; return stored result.
9. `failed`: keep retry-safe state, communicate a useful error, and never create a fake success message.

### Structured answer requirements

- Direct answer in one or two paragraphs before detailed factors.
- Two or more evidence-linked supporting factors when the evidence permits; otherwise say data is insufficient.
- Conflicting indications if present. Do not invent a conflict just to fill a field.
- Timing object only when backed by a deterministic calculation or clear Tarot spread framing. Include window, basis and confidence language.
- Uncertainty field with plain-language limitations, especially unknown birth time, unclear images and non-deterministic symbolic methods.
- One to three personalized follow-up questions after an actual answer, all in the active module.
- No generic fallback prose copied across users. A retry or insufficient-input state is its own response type.
- Clear language that readings are interpretive guidance, not certain events.

### Context and memory

- Load only the current conversation's module, profile and recent messages. Never pass another module's transcript into this module automatically.
- Store a compact server-generated conversation summary when threads grow; retain the latest turns and exact underlying calculations/cards as source data.
- Separate user-provided facts from inferred interpretations. Quote a user fact only if it was actually provided in that conversation.
- Reopened conversations show their original first reading, cards, image version and messages in order.
- If the user changes their profile, the old thread keeps its original input snapshot; continuing it either uses that snapshot with a warning or offers a new thread with current data. Choose one policy and show it explicitly.
- Clarification messages do not count as answered questions; a clarified response resolves the pending question rather than becoming a second paid request when Milestone 3 credits arrive.
- Suggested follow-up chips are free to display. Submitting one invokes the same path as a typed question.

### Safety and resilience

- Moderate text and images as appropriate before generation; classify high-risk topics and apply a module-independent safety policy before module prompting.
- For self-harm/violence/immediate danger, respond with supportive real-world help and do not generate deterministic predictions.
- For medical, legal and financial questions, keep content informational, avoid diagnosis or binding instructions, and encourage qualified help where appropriate.
- Refuse exact death predictions, guaranteed marriages/jobs, identity or sensitive-trait guesses from images and fabricated personal details.
- Rate-limit by authenticated user and device/request fingerprint as appropriate; protect against retries causing duplicate provider calls.
- A provider timeout, invalid JSON, moderation block or empty output produces a visible retry/clarify state; no placeholder insight card is shown as if it were genuine.
- Log request ID, module, version, duration, token usage and error category. Never log raw birth details, full messages, access tokens or uploaded image bytes by default.
- Keep an emergency server-side disable switch per module and a global disable switch for AI calls; show an honest unavailable state in the app.

### Provider and runtime checks

- The selected AI provider must support text generation, image understanding and a structured output mechanism suitable for the schemas above. Keep text and vision model IDs server-configured.
- Use provider project spending limits and server quota before exposing the APK to testers. Estimate cost using representative text and image requests; record the chosen budget in handoff notes.
- Evaluate endpoint timeouts and Supabase Edge Function execution limits with realistic longest responses; if image analysis or complex readings exceed them, split feature extraction and answer generation into persisted jobs with polling.
- Do not claim a free, cardless inference tier will support this milestone unless it has been demonstrated with all nine modules under the agreed volume.
- Never send the full image to a text-only module or unrelated conversation; use the minimum data for each call.

## 8. Mobile screen conversion and visual requirements

The already-built UI is the starting point. For each route, open the named mockup crop, list all visible elements, states and spacing, then compare a phone-sized screenshot after wiring real data. Preserve the warm ivory surfaces, lavender cards, deep indigo headings, circular icons, module badges, rounded inputs and bottom navigation. Only dynamic content, required loading/empty/error states and honest Milestone 2 copy should differ from the reference.

| Route or component | Reference | Required live behavior |
| --- | --- | --- |
| `/ai` | `ai-00.png` | Nine modules visible. Module tile opens selected module or a specific required-input flow. Current module status and availability must be truthful. |
| `/ai/modules` | `ai-01.png` | Full nine-module list with subtitle and icon, not only the six pictured. Search/filter if UI shows it. Missing data call-to-action is explicit. |
| `/ai/[module]` first reading | `ai-02.png` through `ai-07.png` | First reading title, 3–6 evidence-based insight cards, source/context where helpful, 1–3 suggestions, composer. Vedic/Tarot/Palmistry/Numerology/Western/Lal Kitab follow their exact reference arrangement. |
| `/ai/[module]` derived variants | Pattern of `ai-02.png` through `ai-07.png` | Chinese, Korean and Face Reading use the same geometry with their own badges/icons, readiness prompts and genuine content. |
| `/ai/[module]` answered thread | `ai-08.png` | User bubble, assistant answer, support/counterfactors, timing only when justified, feedback controls, follow-up chips and persistent composer. |
| `/ai/[module]` Tarot spread | `ai-09.png` | Real persisted card identities, orientation, spread positions and interpretation. Art has lawful provenance. |
| `/ai/[module]` module protection | `ai-10.png` | Explain boundary and button to deliberately open suggested module. Preserve unsent original question for optional copy into destination composer; do not auto-submit. |
| `/ai/history` | `ai-11.png` | Filter chips for all nine modules, search, list, reopen, rename, delete and empty states. No static `HISTORY`. |
| `/ai/safety` | `safety.png` | Explain interpretive nature, uncertainty, data use and feedback route in approved language. |
| `/profiles` | `my-profiles.png` | List saved people, active selection, add/edit/delete, relationship labels, loading and empty states. |
| `/profiles/new` | `add-profile.png` | Multi-step name/relationship/birth details/place validation, unknown-time handling and save confirmation. |
| `/compatibility` | `compat-00.png` | Choose two distinct saved profiles, relationship type and supported method; disable submit until valid. |
| `/compatibility/result` | `compat-01.png` | Real persisted result across Overview, Strengths, Challenges and Timing tabs; share/save only when implemented truthfully. |
| `/palm-photo` and image picker | `ui.jpeg` screen 7 | Real palm capture/selection, clear photo examples, image preview, permission recovery, consent and upload state. |
| New face capture/consent state | Derived from palm UI and the first-reading screen pattern | Face capture/gallery, consent, photo guidance, preview/retake/delete; same design system. |
| `/permissions` | `ui.jpeg` screen 8 | Reflect actual system permission state when used; remove the existing “video consultations” copy because human consultations are excluded. |
| Global `/history`, `/saved` links | Dev plan history/saved mockups | Route to the real AI records where applicable; do not show duplicate fake entries. |

### Per-screen states to implement

- Initial loading skeleton/progress, with no flash of sample data.
- Authentication expired: send to login and preserve a safe return route.
- Module unavailable: clear reason and retry later.
- Missing birth date, time, place, full numerology name or image: precise edit/capture action.
- Consent required or revoked: explanatory prompt and no provider call.
- Image permission denied, picker canceled, invalid file, upload interrupted and uploaded image replaced.
- First reading pending, generation in progress, server timeout, moderation/safety intervention and retry.
- Empty history, zero search results, invalid profile selection, and deleted conversation deep link.
- Keyboard open, long localized text, screen-reader focus, Android hardware Back, and rapid double taps.
- Offline: show cached saved threads when available, queue no paid generation unless a deliberate retry occurs online.

### Interaction details

- Keep send disabled for blank/whitespace-only input and during the same request; trim and impose a documented maximum length.
- Assign a client request UUID before sending so a double tap, network retry or app resume cannot create duplicate messages/provider calls.
- Do not optimistically show a completed AI answer. A pending user bubble may appear, then resolve or show retry/error in place.
- A follow-up chip fills or submits one question consistently; copy must state future credit behavior without claiming a current deduction.
- Every answer's feedback buttons target its own message ID, not the latest answer globally.
- The conversation menu exposes rename, view history, switch module, delete thread and safety info with confirmation for deletion.
- Switching selected profile always displays that person's name and starts a separate conversation/input version.
- Preserve user drafts when temporarily opening a profile form or module list; discard only on explicit new-thread action.
- Image previews use private local URIs; signed URLs are short-lived and never copied into public analytics or share sheets.
- A compatibility result deep link reloads its record from the server and does not rely on navigation params containing a score.

### Asset inventory

| Asset | Agent responsibility | Owner input |
| --- | --- | --- |
| Star Talks logo, theme, fonts, existing icons | Reuse current app assets and code. | None. |
| Tarot cards | Source a verified reusable 78-card set or create original, consistent card art; optimize and document provenance. | Optional licensed deck if the client has a preferred look. |
| Palm/face capture guide examples | Create neutral illustrations or photographs with clear permission to use; avoid storing real user photos in repo. | None unless client has preferred examples. |
| Compatibility and AI illustrations | Reuse mockup-derived vector/UI primitives already in `src/components/ui/`. | None. |
| Test images | Generate synthetic/consented fixtures and keep sensitive originals out of the repo. | Optional consented examples for client review. |

## 9. Phased implementation schedule and gates

The ordering below is a dependency sequence, not a promise that all work can fit into fourteen calendar days with one engineer. The milestone is complete only after every gate passes. Parallelize independent calculation modules only after the contracts and privacy model are fixed; avoid parallel edits to migrations or shared route components.

### Phase 2A — Freeze references, audit baseline and decide external inputs

**Work**

1. Confirm the branch and clean worktree; preserve the Phase 1 release tag/build information.
2. Map every relevant proposal paragraph and dev plan mockup to an acceptance item in this file.
3. Inventory the current UI, fake data, inert actions and hard-coded credit labels; identify every path that can show ungrounded claims.
4. Inspect Star Talks Supabase schema and migrations. Confirm project ID before touching remote data.
5. Review Phase 1 chart calculation assumptions, cache invalidation and unknown-time behavior against the nine-module requirements.
6. Choose AI provider account, acceptable budget, image retention wording, launch languages and Tarot art path; capture any unresolved item as a blocker with owner and deadline.
7. Take baseline screenshots at the mockup phone size and a smaller Android size for all AI, profiles and compatibility screens.

**Gate:** scoped screen inventory, provider/input decisions, known gaps, baseline screenshots and explicit budgets are recorded. No real user data appears in development fixtures.

### Phase 2B — Data migration, RLS and storage foundation

**Work**

1. Implement the profile uniqueness correction with a data-safe migration and retain one-self invariant.
2. Add missing profile fields, canonical input fingerprint and calculation snapshot/version fields.
3. Create conversation, message, job, feedback, consent, media and compatibility tables with constraints and indexes from section 5.
4. Create private palm/face Storage policy, path convention (`user-id/profile-id/kind/object-id`) and bucket MIME/size limits.
5. Add read/write grants narrowly; reserve job/answer/usage writes for authenticated functions or trusted server RPCs.
6. Add transactional or idempotent stored procedures only where multi-table consistency is required (start request, commit answer, delete related data).
7. Apply migration to a local/staging project first, then the verified Star Talks project; compare schema and RLS after deployment.

**Gate:** two test users cannot read or alter one another's profiles, media, conversations, messages or results; anonymous callers have no private access; existing self-profile and chart data survive.

### Phase 2C — Deterministic calculators and profile readiness

**Work**

1. Audit and version the existing tropical/sidereal chart. Fix any accuracy issue that would produce misleading houses, dasha or timing.
2. Add full dasha periods, selected natal aspects, current transit snapshots, Numerology, Four Pillars and compatibility factor builders.
3. Implement pure readiness checks per module so the UI can ask for exactly the missing date, time, name, place, hand or image.
4. Implement chart/snapshot invalidation on profile edits and selected-profile support across all calculation APIs.
5. Validate against independent references and boundary fixtures; document tolerances and method settings.

**Gate:** each module receives a deterministic evidence bundle for the same fixed input; boundary dates and unknown birth time yield explicit limitations; no stale chart is reused after an edit.

### Phase 2D — Authenticated backend and provider adapter

**Work**

1. Create versioned Edge Function endpoints and shared validation/types from section 4.
2. Put the provider secret and model names in server secrets; confirm they are absent from app bundle, `.env.example` values, logs and Git history.
3. Verify JWT and row ownership on every request; use server-managed quota and unique request IDs.
4. Implement provider adapter, timeouts, structured output parsing, token/cost recording and retry behavior.
5. Add text/image moderation and module-independent safety policy before model calls.
6. Build a small synthetic fixture runner to exercise every function locally and against staging.
7. Deploy only after the database is ready; verify an authenticated APK can invoke one safe test function.

**Gate:** unauthorized calls fail; repeated request ID returns the same persisted result; provider failures produce recoverable errors; the app never sees the provider key.

### Phase 2E — Module prompt packages and first readings

**Work**

1. Add nine separate prompt/rule packages, each with a methodology and prompt version.
2. Implement first-reading generation against the module evidence bundle, returning 3–6 supported insights or a targeted missing-data state.
3. Implement Tarot opening draw and persisted cards. Do not make the new user complete a birth profile to use Tarot.
4. Implement text-only first readings first; add image modules after the private image path is working.
5. Validate structured outputs and source references; remove live use of `MODULES.insights` and fixed initial messages.
6. Add the server disable switch so a faulty module can be paused without shipping a new APK.

**Gate:** nine distinct first readings work with suitable synthetic inputs; changing inputs changes the evidence and output; repeating the same open operation shows the saved reading without another provider charge.

### Phase 2F — Questions, follow-ups and conversation memory

**Work**

1. Implement question classification and targeted clarification. Keep the original pending question linked to the clarification answer.
2. Implement domain protection before generation, including explicit redirect cards and deliberate switching.
3. Implement answer generation with evidence references, counterfactors and bounded timing claims.
4. Generate one to three suggestions from that answer, not a static per-module list; display the future credit implication truthfully.
5. Persist messages and a bounded memory summary; reopen threads without re-entering birth details.
6. Handle duplicate sends, app background/resume, timeout and offline retry with request IDs.

**Gate:** each module answers in its own method, refuses cross-module calculations, remembers an in-thread follow-up, and stores no duplicate answers on retries.

### Phase 2G — Multiple profiles and photo workflows

**Work**

1. Wire `My Profiles` and add/edit forms to owner-scoped Supabase data; preserve Phase 1 self-profile behavior.
2. Support two or more family profiles and two or more partners/friends without unique-constraint failures.
3. Reuse birth place lookup and DST/unknown-time resolution for every profile.
4. Add selected-profile controls to modules that use a person; clarify which profile a conversation belongs to.
5. Implement camera/gallery selection, permission prompts, preview, quality checks, private upload and deletion for palm and face images.
6. Store consent version/time; handle revoked consent and choose not to resend an old image.

**Gate:** a user can create/edit/select/delete multiple owned profiles; photo modules use only consented, owned images; another user cannot access their images by guessing a path or URL.

### Phase 2H — Compatibility analysis

**Work**

1. Replace static profile names and score in the two compatibility routes with real selected records.
2. Accept two distinct owned profiles and one of love, marriage, friendship or business.
3. Let the user choose a supported method. Initially support only methods with a documented pairwise calculation: Vedic, Western, Numerology, BaZi/Saju, and a labeled Tarot relationship spread where appropriate. Add Lal Kitab only with reviewed pairwise rules; do not invent palm/face compatibility from images.
4. Calculate the factors deterministically, including a versioned weighted score only when a defensible rubric exists. Explain how to interpret the score; no fixed mockup `78%`.
5. Generate strengths, challenges, dynamics, long-term outlook and timing where method data supports it; persist the full result and its inputs/versions.
6. Make result tabs load saved data after an app restart. Deletion of either underlying profile follows the documented cascade/retention policy.

**Gate:** changing either profile or relationship type changes the factors/result; unsupported method combinations are unavailable with a reason; saved analyses reopen accurately.

### Phase 2I — History, feedback and safety UI

**Work**

1. Replace static `HISTORY` with paginated owned conversations; wire all nine filter chips and text search.
2. Implement rename, delete-one and delete-all with confirmation, undo only if technically backed by soft deletion, and clear empty states.
3. Save likes/dislikes and negative reasons per message; allow a report and prevent duplicate rows.
4. Update safety copy and route from AI menus/feedback to it.
5. Ensure the global History/Saved routes use live AI records where they expose AI activity.

**Gate:** a conversation survives restart, can be found and reopened in its own module, and can be renamed/deleted without affecting another account's data. Feedback attaches to the correct answer.

### Phase 2J — Visual integration and accessibility

**Work**

1. For every named crop in section 8, capture current screens at the same relative phone dimensions and compare side by side.
2. Preserve layout hierarchy, colors, padding, text styles, icon weight, gradients, card radii, bottom composer and tab navigation.
3. Fit dynamic text without clipping or fake placeholder content; check long profile names and two-line translated labels.
4. Verify Android hardware Back, keyboard avoidance, focus order, screen-reader labels, minimum touch targets and reduced-motion behavior.
5. Complete lawful Tarot art and photo guidance art; document intentional visual deviations.

**Gate:** visually reviewable AI and compatibility flows match the mocks in structure and theme; all visible buttons have an action or an honest unavailable state.

### Phase 2K — Full integration, evaluation and handoff

**Work**

1. Run the full acceptance matrix in section 10 with synthetic accounts and real provider calls.
2. Exercise a clean install, returning-user sign-in, profile selection, each module's first reading/question/follow-up/history, photo capture and compatibility.
3. Run unauthorized-user/RLS and Storage access checks, calculation fixtures, response schema/scope checks, typecheck, Android bundle and installable preview build.
4. Inspect provider cost and function logs for timeouts, PII leakage and repeated billing on retries.
5. Update setup docs with migration IDs, function deployment, secret names, model/prompt/calculator versions, limits, known method caveats and rollback process.
6. Push coherent checkpoints as phases finish; keep the branch/release state reviewable and avoid leaving only local unpushed work.

**Gate:** all mandatory checks pass on the current Android APK and deployed Star Talks backend; any remaining product limitation is explicitly documented and accepted, not hidden by demo UI.

## 10. Acceptance matrix

The proposal has a milestone description rather than a formal test checklist. These are concrete release checks derived from its requirements. Record pass/fail, build ID, function version, test account and evidence for each check. Do not treat a passing unit test as a substitute for the app interaction where the check names a device flow.

### Module readiness and first reading

| Case | Expected result |
| --- | --- |
| New account opens Tarot without any birth profile. | Tarot can generate a real persisted Current Energy spread/reading. No birth-data gate. |
| User opens Vedic with complete birth data. | 3–6 insight cards trace to the selected profile's sidereal calculation and version. |
| User opens Vedic with unknown birth time. | Time-dependent claims are withheld; exact missing data/limitations are explained. |
| User opens Numerology with confirmed birth name/date. | All applicable numbers and cycles are computed and evidence-linked; no fixed Life Path example. |
| User opens Numerology with only display name. | App asks for the appropriate name input instead of guessing name numbers. |
| User opens Western with complete birth data. | Tropical chart/aspect/transit factors appear; Vedic labels do not leak in. |
| User opens Lal Kitab. | Distinct Lal Kitab-specific rule references and safe remedies; no generic Vedic reskin. |
| User opens Chinese Zodiac near Lichun. | Year and month pillars match versioned solar-term fixtures; no January 1 rollover assumption. |
| User opens Korean Astrology. | Correct shared pillars with distinct Saju/Ilgan explanation. |
| User opens Palmistry with a clear image. | Reading names 3–6 actually visible palm features and their locations; image remains private. |
| User opens Palmistry with blurred/cropped image. | App requests a better image and makes no unseen-line claim. |
| User opens Face Reading with consent and clear image. | Output names visible structure only and uses symbolic framing; no sensitive/personality diagnosis. |
| User revokes image consent. | New provider calls using that image stop; access/deletion behavior matches privacy copy. |
| Same user reopens the same conversation's first reading. | Previously saved reading is returned; no second draw or model charge. |
| User edits date, place, time, name or image. | A new fingerprint causes recalculation/new reading path; old thread is not silently rewritten. |

### Conversation, scope and answer quality

| Case | Expected result |
| --- | --- |
| Ask a custom career question in each module. | Direct answer first, module-specific evidence, understandable explanation and 1–3 relevant follow-ups. |
| Ask Tarot for Vedic dasha. | `redirect` result, no invented dasha, explicit switch button. |
| Ask Vedic for Tarot card meanings. | Same isolation in the opposite direction. |
| Ask an underspecified question. | A useful clarification is asked before generation; original question is retained. |
| Tap a follow-up chip. | It submits that exact question in the active conversation; the answer uses prior context. |
| Send twice rapidly or retry after timeout. | One saved user turn and one assistant result for the request ID; no duplicate provider charge. |
| Ask for an exact job offer date or guaranteed marriage. | No fabricated precise event or guaranteed prediction; uncertainty is explained. |
| Ask a sensitive health/legal/financial question. | Safe informational response; no diagnosis or binding instruction. |
| Ask about self-harm or immediate danger. | Safety response takes priority over divination. |
| Open conversation after app restart. | Same messages, cards, profile/version context, suggestions and feedback state appear. |
| Search/filter history by all nine modules. | Only matching owned conversations appear, newest first with stable pagination. |
| Rename, delete one, delete all. | Results persist after restart; no unrelated user's content changes. |
| Submit helpful/unhelpful/report on one answer. | Feedback persists against that answer ID, reason enum validates, duplicate tap is idempotent. |

### Profiles, compatibility and data access

| Case | Expected result |
| --- | --- |
| Add two family profiles and two partner/friend profiles. | All save; only one self profile is allowed. |
| Change selected profile in AI. | New thread references chosen person; previous person's evidence never appears. |
| Select the same profile twice for compatibility. | Submit blocked with a clear message. |
| Select two profiles and love/marriage/friendship/business. | Chosen method produces stored factors and a result tailored to that relationship type. |
| Reopen a saved compatibility result. | Score, strengths, challenges and timing match the saved version; no fixed mockup sample. |
| Edit one profile after compatibility generation. | Old result is labeled as based on earlier inputs; regeneration is offered. |
| User B requests User A's profile, conversation, media or analysis IDs. | Denied by server checks and RLS; no metadata or signed image URL leaks. |
| Anonymous user invokes an AI endpoint. | Authentication required; no provider call. |
| User cancels picker or denies camera permission. | App remains usable and offers gallery or retry where available. |
| User deletes an image/profile/account. | Documented cascade/retention action completes; no orphaned public object or leaked reading. |

### Evaluation set and quality bar

1. Create at least two synthetic profiles per date/name/image-based module, plus boundary cases for missing time, DST transitions, Lichun, unclear images and incomplete names.
2. Run a fixed question set across the proposal's domains for all applicable modules, including deliberately wrong-module questions.
3. For every output, automatically check schema validity, allowed module ID, valid evidence references, absence of forbidden sensitive claims and follow-up count.
4. Manually review a representative sample for directness, specificity, counter-indications, timing support, repetition, tone and uncertainty; record examples and needed prompt/method revisions.
5. Require **zero critical** failures in the curated acceptance set: unauthorized data access, fabricated chart/card values, cross-module answer, leaked image, duplicated billable request, or dangerous advice.
6. Track noncritical quality issues separately; revise prompt/calculator versions rather than quietly changing text with no audit trail.
7. Have the product owner review at least one full reading and one answered question for each module in the installed APK before client-facing acceptance.

### Build and operations gate

- `npm run typecheck` and the project's relevant test suite pass on the release commit.
- Database migration applies cleanly to an empty staging database and upgrades a copy of Phase 1-shaped data.
- All new public tables and private buckets have reviewed access policies; ownership probes pass.
- Server secrets exist only in server configuration; Android bundle inspection finds no provider key.
- Android preview APK installs, signs in, survives restart and exercises nine modules over a real network.
- Measured provider use stays within the agreed preview budget during representative tests.
- Common network failures and provider outages have visible recovery, with no synthetic “success” answer.
- Screen screenshots are compared with the specified crops at reference and small Android sizes; deviations are documented.

## 11. Week-by-week execution and checkpoints

This is an implementation sequence to make work reviewable. If a gate slips, move the completion claim; do not silently remove a module or substitute static text.

| Window | Critical path | Client-visible checkpoint |
| --- | --- | --- |
| Start of Week 3 | Phase 2A decisions, migration design, photo/privacy wording. | Reviewable data/API contract and screen-gap list. |
| Week 3, first half | Phase 2B database/RLS/Storage and Phase 2C deterministic calculators. | Two-user access checks and calculation fixtures. |
| Week 3, second half | Phase 2D server/provider adapter, Phase 2E Tarot plus one chart-based first reading. | Live Tarot and Vedic examples on an installed preview build. |
| Start of Week 4 | Remaining seven first readings, image workflow, scope protection. | Every module opens a real first reading or a precise missing-input state. |
| Week 4, middle | Questions, follow-ups, memory, multi-profile and compatibility. | Client walks a real conversation and two-profile compatibility result. |
| Week 4, end | History, feedback, safety, visual pass, adversarial tests, APK and handoff. | End-to-end milestone review with no demo AI content in live paths. |

The largest schedule risks are verified AI provider access/budget, accuracy of full Four Pillars and dasha/transit calculations, lawful 78-card art, and privacy-safe image analysis. Surface a risk as soon as its gate is threatened. Do not defer these until the visual pass.

## 12. Deployment, rollback and handoff

### Release sequence

1. Freeze source revisions for the database migration, server functions, model configuration and Android app.
2. Apply additive migration and verify RLS/storage before enabling the new mobile routes remotely.
3. Deploy functions with AI globally disabled; confirm health/auth and test-account calls.
4. Set the owner-provided provider secret and spending ceiling in Supabase/AI provider settings.
5. Enable one module for test users, inspect outputs/costs, then enable the remaining modules in controlled batches.
6. Build and install the Android preview APK; complete the acceptance matrix using the same backend environment the client will test.
7. Keep the previous working APK available until the new one passes sign-in, Home, profile, logout and reset-password regression checks.
8. Record deployed migration IDs, function versions, feature switches, build URL, checks run and reviewer sign-off in handoff notes.

### Rollback rules

- If an AI module misbehaves, disable that module server-side; preserve existing conversations and show an unavailable message.
- If provider costs spike, disable generation globally and keep history readable.
- If an app-only regression appears, distribute the previous APK while preserving additive database compatibility.
- Do not drop a table, overwrite user photos or delete conversation history as a quick rollback. Use a reviewed data migration if cleanup is required.
- A request that was already charged by the provider but failed to persist must be traceable by request ID and visible in operations logs for reconciliation.

### Handoff artifacts

- This plan with checked acceptance results and any approved deviations.
- SQL migrations, Storage policy definition and project ID verification record.
- Server function source, deployment instructions, secret **names** and rotation steps (never secret values).
- AI provider/model configuration, budget and per-user limits, prompt/method/calculator versions.
- Tarot artwork license/provenance and image consent/privacy wording.
- Calculation reference fixtures and tolerated error bounds.
- Android preview build link and exact Git commit, plus known limitations.
- A list of Milestone 3 integration points: future credit authorization/settlement, report attachment and compatibility report purchase.

## 13. Rules for the implementation agent

1. Work in the actual Star Talks project, not Entertainment Power Players or a local-only Supabase project.
2. Before editing any screen, inspect its exact reference crop and current implementation; keep the visual hierarchy.
3. Do not “complete” AI by filling the current sample arrays with more canned paragraphs. Replace the production data path.
4. Do not hide missing functionality behind a button that always shows a static success state.
5. Do not use `Math.random()` for Tarot draws or ask an LLM to invent cards/calculations.
6. Do not assume a saved chart is current after birth details change.
7. Do not use a shared generic prompt for the nine modules; use a shared transport with separate methodology packages.
8. Do not move provider credentials into Expo public environment variables, the React Native bundle, SQL migration values or commits.
9. Do not enable a table or Storage bucket without access policies and a two-account ownership check.
10. Do not send palm/face photos to an AI provider before the stated consent and ownership checks.
11. Do not claim the current sample Vedic statements about jobs, marital state, health or family are actual calculated output.
12. Do not display an AI-credit deduction before the Milestone 3 wallet and transaction logic exists.
13. Preserve honest module limitations: unknown time, uncertain image features, symbolic interpretation and provider outage.
14. Push code in coherent reviewable checkpoints, as requested by the project owner; verify the pushed commit/build match the accepted test evidence.
15. Stop only after all nine module flows, profile/compatibility flows, server/storage security and APK gates pass, or report the precise unresolved external dependency that prevents delivery.

## 14. Current technical references for implementation

These sources support architecture decisions; verify their current syntax and limits at implementation time. The local proposal and dev plan remain the product requirements.

- [Supabase authenticated Edge Functions](https://supabase.com/docs/guides/functions/auth): user JWT handling and secure server paths.
- [Supabase Edge Function secrets](https://supabase.com/docs/guides/functions/secrets): server-side provider key storage.
- [Supabase Edge Function limits](https://supabase.com/docs/guides/functions/limits): request timeout, CPU and memory constraints.
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control): private object policies.
- [Expo ImagePicker](https://docs.expo.dev/versions/latest/sdk/imagepicker/): camera/gallery selection and permissions.
- [OpenAI Responses API text generation](https://developers.openai.com/api/docs/guides/text): default provider adapter path.
- [OpenAI structured output](https://developers.openai.com/api/docs/guides/structured-outputs): typed server response schema.
- [OpenAI images and vision](https://developers.openai.com/api/docs/guides/images-vision): image input for visible-feature extraction.
- [OpenAI moderation](https://developers.openai.com/api/docs/guides/moderation): text/image safety screening.
- [Astronomy Engine documentation](https://github.com/cosinekitty/astronomy/wiki) and [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/manual.html): calculator behavior and independent ephemeris comparison.

**Definition of done:** The client can install the current Android APK and use all nine genuinely data-backed modules, their separated saved conversations and feedback, multiple saved profiles, and a real compatibility result; backend ownership and safety checks pass; visual differences from the supplied mockups are explained; no live screen presents fixture text as a personal reading.
