// Original, concise interpretation text keyed to the traditional 78-card deck.
// The card names and structure are public-domain conventions; no third-party artwork is bundled.
export const TAROT_LIBRARY_VERSION = 'tarot-rules/1.0.0';

type Card = { id: string; name: string; upright: string; reversed: string };
const major: Array<[string, string, string]> = [
  ['The Fool','a new beginning, trust and an open path','unprepared risks or hesitation at the threshold'],
  ['The Magician','intentional action with the tools already available','scattered effort or misuse of influence'],
  ['The High Priestess','intuition, quiet knowledge and what is still hidden','ignored intuition or secrets used poorly'],
  ['The Empress','nurture, growth and creative abundance','overgiving, neglect or blocked growth'],
  ['The Emperor','structure, boundaries and dependable leadership','rigidity, control or unstable authority'],
  ['The Hierophant','tradition, guidance and shared values','unquestioned convention or resisting useful guidance'],
  ['The Lovers','aligned values and a consequential choice','misalignment, avoidance or a strained bond'],
  ['The Chariot','focused movement and disciplined will','lost direction or pushing too hard'],
  ['Strength','patience, courage and gentle self-command','self-doubt or force replacing patience'],
  ['The Hermit','reflection and an honest search for insight','isolation or avoiding a needed answer'],
  ['Wheel of Fortune','a turning cycle and changing circumstances','resisting change or overlooking a pattern'],
  ['Justice','fairness, responsibility and clear consequences','imbalance, denial or an unfair decision'],
  ['The Hanged Man','pause, surrender and a changed perspective','stagnation or sacrifice without purpose'],
  ['Death','an ending that makes transformation possible','holding on after a cycle has ended'],
  ['Temperance','integration, moderation and patient healing','excess or difficulty finding a workable balance'],
  ['The Devil','attachment, temptation and a limiting pattern','recognizing and loosening an unhealthy attachment'],
  ['The Tower','sudden disruption that exposes weak foundations','avoiding a necessary truth or prolonged upheaval'],
  ['The Star','renewal, hope and a wider sense of possibility','discouragement or difficulty trusting renewal'],
  ['The Moon','uncertainty, dreams and partial visibility','confusion clearing or fear distorting perception'],
  ['The Sun','clarity, joy and visible progress','temporary doubt or difficulty enjoying progress'],
  ['Judgement','reckoning, renewal and an important decision','self-judgment or ignoring a call to change'],
  ['The World','completion, integration and a new horizon','unfinished business or delayed closure'],
];
const ranks = ['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'];
const minor: Record<string, Array<[string,string]>> = {
  Wands: [
    ['a spark of creative initiative','a delayed start'],['planning from new ground','fear of leaving familiar ground'],
    ['expansion after preparation','delayed expansion'],['shared celebration and a stable base','a celebration or home base needing care'],
    ['competition that tests resolve','conflict easing or turning inward'],['recognition after effort','recognition sought at too high a cost'],
    ['defending a hard-won position','exhaustion from constant defense'],['swift movement and incoming news','delays or scattered momentum'],
    ['resilience after repeated effort','guardedness becoming a burden'],['carrying too much responsibility','putting down an unsustainable load'],
    ['curious creative exploration','an idea needing practice before a leap'],['bold pursuit and fast action','impulsiveness or inconsistent drive'],
    ['warm leadership and confident expression','confidence slipping into overextension'],['a clear creative vision and steady command','domination or ambition without listening'],
  ],
  Cups: [
    ['an emotional opening or new connection','emotion held back or overflowing'],['mutual understanding and a chosen bond','a bond needing honest reciprocity'],
    ['friendship and shared joy','social friction or overindulgence'],['withdrawal to reconsider an offer','missing an opportunity through disengagement'],
    ['grief that still leaves something intact','readiness to notice what remains'],['generosity, memory and familiar comfort','living too heavily in the past'],
    ['many appealing possibilities','fantasy clouding a practical choice'],['leaving a familiar emotional pattern','returning before the lesson is understood'],
    ['earned satisfaction and gratitude','pleasure that does not resolve deeper needs'],['a vision of emotional belonging','a family ideal needing honest work'],
    ['gentle curiosity and an unexpected feeling','sensitivity without clear boundaries'],['an invitation led by feeling','charm outpacing follow-through'],
    ['empathy with clear emotional awareness','absorbing others’ feelings without rest'],['mature care and calm compassion','emotional control replacing openness'],
  ],
  Swords: [
    ['a sharp new insight or decisive truth','confusion or truth used harshly'],['a difficult choice and a need for clarity','avoidance prolonging a decision'],
    ['heartache and a truth that hurts','healing after disappointment'],['rest, recovery and a thoughtful pause','restlessness despite a need to recover'],
    ['conflict with a costly victory','repair after a needless conflict'],['moving toward calmer conditions','old worries carried into a new place'],
    ['strategy, secrecy or independent action','a hidden plan becoming visible'],['restriction shaped partly by fear','seeing a route out of a limiting story'],
    ['anxiety and repeated worry','worry easing through support and facts'],['a painful ending and a chance to rebuild','refusing to acknowledge an ending'],
    ['careful questions and mental alertness','gossip or conclusions drawn too fast'],['swift truth-seeking and decisive speech','recklessness in words or action'],
    ['clear boundaries and independent judgment','distance or criticism without warmth'],['reasoned authority and fair judgment','cold control or misuse of authority'],
  ],
  Pentacles: [
    ['a practical opening for work or resources','an opportunity needing a sound plan'],['balancing competing material demands','too many demands to juggle well'],
    ['skill built with others','poor coordination or underused skill'],['stability through careful stewardship','holding so tightly that growth stops'],
    ['a period of material strain','support or a path through hardship becoming visible'],['fair exchange and measured giving','uneven giving or dependency'],
    ['patience while work matures','reassessing effort that has stalled'],['practice and steady improvement','repetition without learning'],
    ['self-sufficiency and earned comfort','comfort that feels isolated'],['lasting resources and family legacy','tension over inheritance or security'],
    ['a useful chance to learn or build','a practical plan that needs discipline'],['reliable progress through routine','stagnation behind familiar routine'],
    ['practical care and generous provision','overwork or neglect of personal needs'],['resourceful leadership and long-term security','status or control outweighing stewardship'],
  ],
};

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const TAROT_DECK: readonly Card[] = [
  ...major.map(([name,upright,reversed]) => ({ id: slug(name), name, upright, reversed })),
  ...Object.entries(minor).flatMap(([suit, meanings]) => meanings.map(([upright,reversed], index) => ({
    id: slug(`${ranks[index]} of ${suit}`), name: `${ranks[index]} of ${suit}`, upright, reversed,
  }))),
];

const SPREADS = {
  three: [
    ['Past','influence or pattern carried into the present'],
    ['Present','what is active now'],
    ['Future','a possible direction if the current pattern continues'],
  ],
  celtic: [
    ['Present','the central situation'],['Challenge','what crosses or complicates it'],
    ['Foundation','an underlying influence'],['Recent Past','what is receding'],
    ['Conscious Aim','what is being sought'],['Near Future','a possible next development'],
    ['Self','the querent’s current stance'],['Environment','people and circumstances nearby'],
    ['Hopes and Fears','an emotionally charged possibility'],['Outcome','a possible direction, not a certainty'],
  ],
} as const;
export type SpreadId = keyof typeof SPREADS;

function unbiasedIndex(upperExclusive: number): number {
  const bound = Math.floor(0x100000000 / upperExclusive) * upperExclusive;
  const random = new Uint32Array(1);
  do { crypto.getRandomValues(random); } while (random[0] >= bound);
  return random[0] % upperExclusive;
}

export function drawTarot(spreadId: SpreadId = 'three') {
  const shuffled = [...TAROT_DECK];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = unbiasedIndex(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return SPREADS[spreadId].map(([position,positionMeaning], index) => {
    const card = shuffled[index];
    const orientation = unbiasedIndex(2) === 0 ? 'upright' : 'reversed';
    return {
      id: `tarot:${card.id}:${orientation}:${slug(position)}`,
      cardId: card.id, cardName: card.name, orientation, position, positionMeaning,
      meaning: card[orientation],
    };
  });
}
