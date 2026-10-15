# Star Talks Milestone 2 — client directives, decisions and work plan

Recorded 2026-10-15 from two client messages (directive message, then decisions reply) plus a code audit. This supersedes the "no RAG / no LangChain" stance in `milestone-2-weeks-3-4-implementation-plan.md`: that stance was a previous agent's choice, not the client's. It also supersedes the claim that the AI "is done". Read this before any Milestone 2 work.

## 0. Status and ground rules

- Milestone 2 is **not signed off**. The client wants the deliverables in section 6 first, then an in-house astrologer reviews.
- **WhatsApp OTP / MSG91 is out of scope** for now (user decision). Leave the phone gate off.
- Do not claim "expert validated" until a practitioner has reviewed. Do not call placeholder text a reading.
- Every sample reading shown to the client must come from the user's actual calculated data, never fixed text.
- Never commit unless the user asks. Never put secrets in the repo.
- Client-paid costs: OpenAI test spend is capped at **US$10**. Ask the client before exceeding it. Track spend per run from `recordUsage`/provider usage.
- The proposal was a fixed USD 700 with change requests quoted separately. The client asks for "any additional costs" in the plan; the user decides the quote.

## 1. Key finding: the praised Vedic reading was hardcoded demo text

The client saw "leadership potential, job changes, MNC environment, father's influence, stomach sensitivity, not married yet / growth before marriage". That is the mockup sample in `src/features/uiData/ai.tsx` lines 26-29, identical for every user. The live screen (`src/app/ai/[module].tsx`) now renders server `structured_payload.insights`, not that text. Vedic has **never been run live**; only tarot and numerology have. The client was told this and accepted it. He now wants a real chart-generated Vedic reading.

Decide at implementation time whether to delete the sample `insights` and `question` fields from `uiData/ai.tsx` (the plan says presentation metadata only).

## 2. Client directives (message 1)

**Vedic / Lal Kitab**
- Vedic is the primary foundation. Use a reliable engine for chart, planets, ascendant, houses, nakshatras, yogas, dashas.
- Lal Kitab: use documented rules from clearly identified traditional texts attributed to Pandit Roop Chand Joshi. Keep interpretation and remedy logic distinct from Vedic, while the AI may explain connections between systems when appropriate.
- Interpret actual calculated data, explain supporting factors, never invent placements, predictions or remedies.

**Validation**
- No astrologer is available for every module. Build a structured validation process: fictional birth profiles, reference calculations, a bank of realistic questions.
- Cover career, job change, marriage, relationships, compatibility, family, finances, business, personal growth, planetary periods, traditional remedies, follow-ups, and incomplete birth details.
- Test against independently calculated charts. Do not claim expert validation before review.

**Personalisation and memory**
- Within a thread the AI must use the whole relevant conversation: birth details, calculated chart, earlier readings, personal circumstances the user shared, earlier questions and follow-ups, corrections. E.g. after a career reading, "best time to change jobs?" continues from it and never re-asks birth details. A later marriage question uses the same chart and stays consistent, acknowledging uncertainty or correcting itself.
- Use complete relevant history plus structured chart data with context management for long threads.

**Response quality**
- Specific to the question and chart; cite supporting factors; balance supporting and conflicting factors; practical guidance alongside tradition; natural follow-ups without repeating the whole reading; no generic text; never fabricate chart details; no fear-based predictions, guaranteed outcomes or remedy-purchase pressure. Distinguish traditional interpretation from established science without sounding impersonal.

**Disclaimers (per feature, shown before or alongside the feature, plain language)**
- Face reading: may describe visible features and traditional interpretations as cultural/spiritual belief. Must not claim ethnicity, health, attractiveness or objective personality/character. Not scientifically verified.
- Palm: describe visible lines/markings and traditional meanings; state they do not reliably establish future events or health outcomes.
- Vedic, Lal Kitab, Tarot: interpretive spiritual guidance, not guaranteed predictions; no health, financial or relationship certainties.

**Photo consent and retention**
- Before sending a palm/face photo to OpenAI, explain what is processed, why, which service receives it, how it is handled. Explicit consent. Prefer not retaining photos. Any temporary storage needs a short retention period, and actual deletion behaviour (logs, backups) must be confirmed before any privacy commitment.

**Budget and limits**
- Beta budget ₹3,000-₹5,000/month, subject to our estimate. Proposed limits: **10 questions per user per day, 100 globally per day**. Add monitoring, cost alerts, rate limits, spend safeguards. Estimate cost for ordinary questions, longer readings and image readings before finalising.

**Languages**
- English and Hindi first, natural Hinglish where feasible, Bengali only if quality is adequate. Preserve astrological terminology and personalisation across languages.

**Tarot art**
- Rider-Waite-Smith as reference. Art must be original, public domain or licensed for commercial use; verify rights for the specific edition/scan.

**Safety**
- No predictions or guidance facilitating harm (murder, violent crime). No lottery, gambling or competition-winner predictions. Handle safely and redirect.

**Model selection**
- Evaluate OpenAI models per task: strong reasoning model for detailed interpretation, cost-efficient model for follow-ups and summaries, vision model for images, and models for Hindi/English/Hinglish. Benchmark quality, consistency, latency, actual cost. Every model must receive the correct chart data and relevant history.

**Consistency across modules**
- One verified birth profile app-wide with consent and privacy controls. Reliable engine per system. Consistency between calculations, interpretations and earlier readings. Where systems address the same question, state genuine similarities and differences transparently; do not force identical predictions; never invent calculations or reasons to look consistent. Explain uncertainty, incomplete birth data and disagreement rather than presenting conflicts as fact. Retain history so the AI can refer back without changing calculations or contradicting itself.
- Share the implementation plan and sample outputs before Milestone 2 sign-off.

## 3. Client decisions (reply)

1. **Placeholder text:** accepted. He wants the current version's real chart-generated reading. All samples must come from calculated data.
2. **Sources:** he has no PDFs or books. We must propose a source list: title, author, edition, usage/licensing terms. Cover Lal Kitab (Roop Chand Joshi, rules plus remedies), Vedic (placements, houses, yogas, nakshatras, dashas, transits), Tarot (standard RWS meanings), Numerology (the system we implement), Chinese/BaZi/Saju, Palmistry and Face Reading (traditions and limitations). No unverified sources; do not assume general AI knowledge is enough; use legally accessible references and respect copyright/licensing. His in-house astrologer will review sources, rules and sample readings, including by testing in-house people's birth dates to see if readings resonate.
3. **Swiss Ephemeris:** do **not** buy the CHF 700 licence yet. First confirm the exact licence needed (server-side use, commercial distribution, deployment obligations), compare alternatives (accuracy, features, licence obligations, total cost), then recommend.
4. **Memory:** same chat = full memory (history, birth details, chart, readings, personal context). Across chats = optional, user-controlled; explain what is saved and give manage/delete. Across modules = the verified birth profile is available to relevant modules subject to consent/privacy. The AI must separate calculated data from user-supplied personal info and must not treat an earlier prediction as confirmed fact.
5. **Comparing systems:** modules stay on their own system by default. Compare only when the user explicitly asks. If the user asks why two modules disagree, explain; never force identical predictions.
6. **Testing budget:** may spend up to **US$10** on model tests and sample outputs; ask before exceeding. Test quality, consistency, reasoning, latency, actual cost across ordinary questions, detailed readings, follow-up conversations, image analysis. Then report and recommend a model per task. Monthly budget stays ₹3,000-₹5,000 subject to results.
7. **Photos:** delete immediately after analysis wherever technically possible, keep only a text description if the user consented. Before finalising confirm the data flow, OpenAI retention terms, temporary storage and logs, deletion behaviour. Promise nothing until verified.
8. **Profile and language:** use each user's own verified birth profile as default for relevant modules, with privacy controls. English and Hindi at launch, Hinglish as an option, Bengali later if quality holds.
9. **Daily limits:** approved in principle. Count questions, not the initial reading. The initial reading still needs cost controls and abuse prevention so users cannot bypass limits by recreating profiles or requesting new initial readings repeatedly.
10. **Tarot art:** RWS reference. 1909 originals only if public-domain status is confirmed for our commercial use and jurisdictions. Verify the specific scans; no modern copyrighted reproductions without permission.

## 4. Code audit: where the repo stands against this (2026-10-15)

| Area | Current state | Gap |
|---|---|---|
| Chart engine | `src/features/astrology/chart.ts`: Lahiri ayanamsa is a "linear precession approximation", mean node, whole-sign houses, Vimshottari at birth. `supabase/functions/_shared/chart-evidence.ts` adds aspects, dasha timeline, 30-day transits. | No yogas or divisional charts found in these files. Ayanamsa accuracy unverified. Needs reference comparison and an engine/licence decision. |
| Lal Kitab | `_shared/lal-kitab.ts`: 32 lines, 12 house themes x 9 planet themes, templated sentences, rule IDs like `lal-kitab:rule:sun:house-4`. Header says expert review needed. | No sourced rules or remedies. Needs source-based ruleset with citations. |
| Interpretation data | Planet, sign, house themes are one-liners in `chart-evidence.ts`. | No card meaning, number meaning, BaZi/Saju or Vedic yoga/nakshatra data. Plan: versioned, source-cited rule data looked up by ID and passed to the model. Add vector RAG only if a corpus needs it. |
| Models | `AI_MODEL` = `OPENAI_MODEL` or `gpt-4o-mini` for everything (`_shared/openai.ts`). Requests use `store:false`. | Per-task model config and benchmark. |
| Memory | `ai/index.ts` ~lines 217-246: last 10 messages plus rolling summary, per conversation, module-bound (`ai_conversations.module_id` immutable). | Cross-chat optional memory with manage/delete, shared profile, "calculated vs user-stated vs earlier prediction" labelling, and an on-request cross-module comparison path. |
| Language | `languageFor()` reads `profiles.language_code` only. | Hinglish option, Hindi quality checks. |
| Photos | Stored in private bucket `ai-private` until the user deletes. 90 s signed URL goes to moderation and `observeImage`. Consent scopes `palm_image`, `face_image`. | Delete right after analysis, keep observation text only if consented. Verify OpenAI retention, logs, backups first. Review the face prompt (`openai.ts` ~line 128) against the client's face-reading rules. |
| Limits | Deployed defaults in `ai/index.ts` lines 68-73: 30/user/day, 300/global/day, 5/user/min, 30/global/min, 300k/3M weighted token units. | Change to 10/user/day and 100/global/day. Count questions not first reading. Add abuse control on first readings and profile recreation. Re-check migration `20261013100000` weighting, since first reading currently consumes a slot. |
| Safety | `SHARED_SAFETY` plus `scope.ts` block off-topic. | Add violence/murder, lottery, gambling, competition-winner rules and redirects. |
| Disclaimers | Generic `src/app/ai/safety.tsx`. | Per-feature disclaimers shown before or beside each module. |
| Tarot art | None. | Verified public-domain RWS scans with provenance record. |
| Live tests | tarot and numerology only (Oct 9, Oct 11). Others mocked. | Live runs for all nine within the $10 cap. |
| Deployed | Project `thoknhjxmgsyisxuyamb`, `ai` function v10. Deploying needs the owner-provided Supabase token. | Any change must be redeployed and recorded in the handoff doc. |

## 5. Work plan (suggested order)

1. **Swiss Ephemeris licence and alternatives research.** Verify on astro.com: dual AGPL / Professional licence, whether server-side use triggers AGPL, what CHF 700 covers. Compare astronomy-engine (already used), an accurate in-house Lahiri formula, others. Compare accuracy, features, obligations, cost. Recommend. Validate against independent references (e.g. JPL Horizons).
2. **Source list.** Per system: title, author, edition, licence/copyright status, how we use it (own rule summaries with citations rather than copying text where copyright applies). Verify Lal Kitab copyright status in India before anything else. Send to the client.
3. **Rule data.** Build versioned per-module rule sets from approved sources, cited by ID, supplied to the model as evidence.
4. **Real sample reading.** Run Vedic on a fictional profile (cents of spend). Show chart data next to the reading.
5. **Memory and privacy build.** Cross-chat opt-in memory with view/delete, shared profile, labelled fact types, comparison-on-request.
6. **Limits, safety, disclaimers, photo flow, Hinglish.**
7. **Model benchmark** within $10: ordinary questions, detailed readings, follow-up threads, images, Hindi/Hinglish. Record quality, consistency, latency, cost. Recommend per task. Check Edge Function time limits for slower reasoning models.
8. **Validation process:** fictional profiles, reference calculations, question bank across the listed domains, incomplete-data cases.
9. **Tarot art** from verified scans with provenance.
10. **Update handoff docs** with what is verified. Remove "ready" claims that aren't backed.

## 6. Deliverables the client wants before sign-off

1. Implementation plan and any additional costs.
2. Reference list and the rules each module follows.
3. Sample reading from actual calculated birth-chart data.
4. Sample follow-up conversations showing memory and consistency.
5. Model test results with quality and cost.
6. Recommended calculation engine and licensing approach.

Then his in-house astrologer reviews; then final feedback and approval.

## 7. Open items

- OpenAI key for local test runs (the deployed key is a server secret). Tests must stay under the $10 cap.
- Additional-cost quote for the extra scope: the user decides.
- WhatsApp OTP: deferred by the user.

## 8. Progress log

- 2026-10-15: Engine/licence research done. Result in `docs/calculation-engine-licence-recommendation.md`: keep `astronomy-engine`; do not buy Swiss Ephemeris. Measured accuracy vs Swiss Ephemeris 0.4 arcmin or better for 1900-2050 (the section 4 worry about the "approximate Lahiri" ayanamsa is not borne out numerically; still no yogas/divisional charts). Scripts in `scripts/validation/`. Not yet sent to the client.
- 2026-10-15: Source list draft done: `docs/reference-sources-proposal.md`. Found: Waite 1911 Pictorial Key (sacred-texts, PD), Cheiro Language of the Hand (HathiTrust), Joshi Lal Kitab 5 classics (Urdu, treat as in copyright until 2043, authorship disputed), BPHS (translations copyrighted), Yuanhai Ziping. Still "to verify": Pythagorean numerology source, Saju source, Mian Xiang English source, Benham scan, classical Vedic PD translations. Not yet sent to client.
- 2026-10-15: User says the client has **no astrologer available for verification**, despite the reply mentioning an "in-house astrologer". Do not rely on expert review in plans or messages. Validation = cited sources, reference calculations, fictional-profile question bank. Never claim expert validation.
