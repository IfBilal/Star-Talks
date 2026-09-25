import { AI_MODULES, getModuleById } from './moduleRegistry';

describe('AI module registry',()=>{
  it('registers the nine isolated proposal modules with stable unique ids',()=>{
    const ids=AI_MODULES.map(module=>module.id);
    expect(ids).toHaveLength(9);
    expect(new Set(ids).size).toBe(9);
    expect(ids).toEqual(expect.arrayContaining(['tarot','vedic','numerology','western','lal-kitab','palmistry','chinese-zodiac','korean-astrology','face-reading']));
  });

  it('does not route unsupported topics into a default AI',()=>{
    expect(getModuleById('unknown')).toBeNull();
  });
});
