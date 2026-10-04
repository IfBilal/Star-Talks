// Original Star Talks interpretive rulebook. It uses Lal Kitab's planet-in-house
// framing and deliberately limits remedies to ordinary, optional conduct.
// A subject-matter review is required before marketing these as canonical rules.
export const LAL_KITAB_RULES_VERSION='star-talks-lal-kitab-house-rules/1.0.0';

const houses=[
  'self-conduct and everyday choices','family resources and speech','effort, courage and siblings',
  'home, roots and caregiving','learning, creativity and children','service, disputes and practical obligations',
  'partnership agreements and reciprocity','inheritance, secrecy and shared obligations','teachers, beliefs and ethical direction',
  'work, reputation and responsibility','gains, friends and mutual support','spending, solitude and withdrawal',
];
const planets:Record<string,{theme:string;practice:string}>={
  Sun:{theme:'authority and integrity',practice:'act fairly toward elders and mentors'},
  Moon:{theme:'care and emotional steadiness',practice:'make time for supportive family contact'},
  Mercury:{theme:'speech, trade and learning',practice:'check facts before making a promise'},
  Venus:{theme:'relationships and comfort',practice:'be considerate in close relationships'},
  Mars:{theme:'energy, conflict and initiative',practice:'pause before reacting to conflict'},
  Jupiter:{theme:'guidance, knowledge and generosity',practice:'share knowledge without expecting a reward'},
  Saturn:{theme:'duty, patience and limits',practice:'keep a realistic routine and honor commitments'},
  Rahu:{theme:'ambition, novelty and uncertainty',practice:'slow down major decisions and verify claims'},
  Ketu:{theme:'detachment and reflection',practice:'make space for reflection without neglecting obligations'},
};

export function lalKitabHouseRule(planet:string,house:number) {
  const item=planets[planet];
  if(!item||!Number.isInteger(house)||house<1||house>12)throw new Error('Unsupported Lal Kitab house rule.');
  return {id:`lal-kitab:rule:${planet.toLowerCase()}:house-${house}`,version:LAL_KITAB_RULES_VERSION,
    label:`${planet} in house ${house}`,
    interpretation:`Read ${item.theme} through house ${house}: ${houses[house-1]}. This is a house-based symbolic theme, not a factual life claim.`,
    optionalPractice:`Optional, low-cost practice: ${item.practice}. No purchase or ritual is required.`,
  };
}
