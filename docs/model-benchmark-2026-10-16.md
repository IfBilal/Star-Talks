# Model benchmark — 2026-10-16

Client approval: up to US$10 (decision 6 in `milestone-2-client-directives.md`). **Spent: US$1.06 across 98 provider calls.** Prices are the standard-tier rates on OpenAI's [pricing page](https://developers.openai.com/api/docs/pricing); cached-input discounts are ignored, so costs are slightly overstated. Raw outputs: `docs/benchmarks/2026-10-16/`. Harness: `scripts/validation/model-benchmark.mjs` (runs our real answer code).

## What was tested

- **Text:** one fictional Vedic chart (Delhi, 14 Mar 1985, 10:30 IST), produced by our real evidence builder (27 evidence items). Eight tasks per model, chained in one conversation: first reading, career/job-change question, marriage follow-up that must stay consistent with the career answer, Hindi question, Hinglish question, lottery request, "will I get cancer" question, and a Tarot question asked in the Vedic module.
- **Images:** one clear palm photo, one portrait photo, and one deliberate mismatch (the palm photo submitted to the face reader). Public images, used for testing only, not stored in the repository.
- **Models (10):** gpt-4o-mini (current), gpt-6-luna, gpt-5.6-luna, gpt-4.1-mini, gpt-5-mini, gpt-5.4-mini, gpt-6-sol, gpt-5.6-terra, gpt-5.4, gpt-5.5. Not tested: the "pro" and gpt-6-astra tiers (several times the cost).

## Results (text, 8 tasks per model)

| Model | Tasks OK | Avg s | Max s | $ per call | $ per 1,000 questions |
|---|---:|---:|---:|---:|---:|
| gpt-4o-mini (current) | 8/8 | 4.2 | 8.3 | 0.0006 | 0.6 |
| gpt-6-luna | 8/8 | 11.0 | 16.5 | 0.0007 | 0.7 |
| gpt-5.6-luna | 8/8 | 8.7 | 13.2 | 0.0016 | 1.6 |
| gpt-4.1-mini | 8/8 | 4.7 | 11.0 | 0.0021 | 2.1 |
| gpt-5.4-mini | 8/8 | 5.6 | 9.5 | 0.0053 | 5.3 |
| gpt-5-mini | 8/8 | 21.0 | 29.5 | 0.0054 | 5.4 |
| gpt-6-sol | 8/8 | 8.4 | 10.3 | 0.0111 | 11.1 |
| gpt-5.6-terra | 8/8 | 12.6 | 19.5 | 0.0170 | 17.0 |
| gpt-5.4 | 8/8 | 21.5 | **44.0** | 0.0202 | 20.2 |
| gpt-5.5 | 8/8 | 18.3 | 32.0 | 0.0489 | 48.9 |

All calls eventually succeeded. Some first attempts failed on network drops (not model errors) and were rerun. gpt-5.4 took 44 s on one Hindi answer; our server timeout is 45 s.

**Monthly cost if the global cap is fully used** (100 questions/day = 3,000/month, excluding first readings and images): gpt-4o-mini about $2; gpt-5.4-mini about $16; gpt-6-sol about $33; gpt-5.5 about $147. The client's budget of ₹3,000-5,000 is roughly US$34-57 at about ₹88 per USD, so **gpt-6-sol and cheaper fit; gpt-5.5 does not at full usage.**

## What I saw reading the outputs

My own judgement, one chart, eight prompts. It is not expert validation.

- **gpt-4o-mini (current):**
  - Told the user marriage is possible "between 2025 and 2032", which is simply the whole Mars period, and said married life "will be stable and serious" (Hinglish).
  - Replied to the cancer question with the canned "ask about the reading" refusal.
  - Wrote the text "null" as a retake reason on a perfectly good palm photo, which our pipeline treats as a retake request. **Fixed in code** (see below).
  - Accepted a palm photo as a face and described the hand as face features.
- **gpt-4.1-mini:** over-promises ("your marriage is possible and will bring stability"), says the user is "about to enter" a period they are already in (Hindi), same canned refusals.
- **gpt-5.4-mini:** good, detailed readings at low cost, but it also accepted the palm photo as a face.
- **gpt-6-sol:** careful and consistent. It says "your chart cannot tell whether you will get cancer", links the career and marriage answers ("the possible job change is not a prerequisite for marriage"), gives no timing it can't support, correctly rejected the wrong image. Answers are short.
- **gpt-5.5:** richest and most specific (uses the ascendant, the exact dasha dates, a doctor referral on health), correctly rejected the wrong image, but about 4x the cost of gpt-6-sol and slower.
- **gpt-6-luna:** very cheap and appropriately cautious, but terse and slower (11 s) than its price suggests.
- **gpt-5.4:** similar quality to gpt-5.4-mini at nearly 4x the cost and with the worst latency. **gpt-5-mini:** slow (21 s) with heavy hidden reasoning. **gpt-5.6-terra:** expensive, and it treated the lottery and Tarot questions as in scope (it did answer them sensibly).
- **Hindi:** all models answered in Hindi (70-99% Devanagari by character count; gpt-5.5 mixes in English terms). **Hinglish:** all produced natural Hinglish. Not reviewed by a native speaker. Bengali not tested.
- **Consistency across turns:** every model reused the earlier answer's chart facts; gpt-6-sol and gpt-5.5 explicitly connected the marriage and career answers.
- **Image modules:** all four tested vision models described the clear palm and the portrait with structural features only: no ethnicity, health, age or attractiveness inferences appeared. Only gpt-6-sol and gpt-5.5 caught the wrong image. gpt-4o-mini also uses 25,000-37,000 input tokens per image, so it is not cheaper than gpt-6-sol for images (about $0.004-0.006 versus $0.004-0.011 per image call).

## Recommendation

| Task | Model | Why |
|---|---|---|
| Readings, questions, follow-ups, Hindi/Hinglish | **gpt-6-sol** | Careful, consistent, fast (8 s avg, 10 s max), fits the budget at full use. |
| Palm and face images | **gpt-6-sol** | Reliably flags wrong or unusable images; about $0.01 per image. |
| Optional premium first reading | gpt-5.5 | Most detailed; about $0.06 per reading, so only worth it if first readings are limited per profile. |
| Conversation summaries | not benchmarked; gpt-6-luna or gpt-4.1-mini candidates | Needs a short dedicated test. |

Do **not** keep gpt-4o-mini for readings: the over-confident marriage answer breaks the client's "no guaranteed outcomes" rule. Do not use gpt-5.4 (latency) or gpt-5.6-terra (cost and scope).

## Changes made as a result

- `observeImage` now treats a text "null"/"none" retake reason as no retake, and tells the model to reject images that don't show a palm or face. After the change, gpt-4o-mini accepts the clear palm photo; the prompt change did **not** make the weaker models reject a wrong image, so image modules need the stronger model.

## Not yet done

- Model per task is not yet configurable in code (`AI_MODEL` is one setting).
- Safety and scope are left to the model: lottery, violence, health and "wrong module" answers should be handled by explicit server rules with proper redirects, whichever model is used.
- Evidence is still thin (no yogas, house lords or divisional charts), so much of the difference between models is writing quality. Rerun the benchmark after the rule data is richer.
- Only one chart and eight prompts. Needs the full question bank, Lal Kitab and other modules, and a native Hindi reviewer.
