// High-confidence exclusions run before any OpenAI request. Ambiguous
// questions are left to the module policy so natural follow-ups still work.
const unrelatedRequests = [
  /\b(?:how (?:do|can|should) (?:i|you)|how to|tell me how to|show me how to|give me (?:a |the )?(?:recipe|steps) (?:to|for))\s+(?:make|cook|bake|brew|prepare)\s+(?:a |some |the )?(?:tea|coffee|cake|food|dinner|meal|pasta|rice|soup)\b/i,
  /\b(?:recommend|suggest|compare|which|best|buy|purchase|choose)\b[^?.!]{0,100}\b(?:gaming )?(?:laptops?|phones?|tablets?|gpus?|graphics cards?|headphones?|consoles?|cars?|vacuums?)\b/i,
  /\b(?:write|debug|fix|generate|explain)\b[^?.!]{0,60}\b(?:javascript|python|typescript|sql|code|program|algorithm|software bug)\b/i,
  /\b(?:what(?:'s| is) the|tell me the)\s+(?:weather|sports score|stock price|exchange rate|capital of)\b/i,
  /\b(?:ignore (?:all )?(?:previous|prior) instructions|reveal (?:your|the) (?:system|developer) prompt|act as (?:an? )?(?:unrestricted|different) assistant)\b/i,
];

export function clearlyOutsideReadingScope(question: string): boolean {
  return unrelatedRequests.some(pattern => pattern.test(question));
}

export const OUT_OF_SCOPE_REPLY =
  'I can help interpret this Star Talks reading and its supporting chart, cards, numbers, or visible features. Please ask about this reading.';
