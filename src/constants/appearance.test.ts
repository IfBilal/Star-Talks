import { adaptColor, contrast, DarkColors } from './appearance';
import { Colors } from './theme';

describe('appearance colors', () => {
  it('preserves original mockup colors in light mode', () => {
    for (const value of Object.values(Colors)) {
      for (const role of ['surface', 'foreground', 'border'] as const) expect(adaptColor(value, 'light', role)).toBe(value);
    }
  });
  it('keeps dark theme text and icons readable on its surfaces', () => {
    for (const foreground of [DarkColors.text, DarkColors.navy, DarkColors.muted, DarkColors.slate, DarkColors.danger, DarkColors.success, DarkColors.tabInactive]) {
      for (const background of [DarkColors.ivory, DarkColors.card, DarkColors.tile, DarkColors.lavenderCard]) expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('adapts legacy pastel cards and their ink together without changing primary white labels', () => {
    for (const [background, foreground] of [['#FBE8D0','#B5712B'],['#E6E0F8','#5B4FB0'],['#FCE4DA','#C4573F'],['#FFFFFF','#9698A8']]) {
      expect(contrast(adaptColor(foreground,'dark')!, adaptColor(background,'dark','surface')!)).toBeGreaterThanOrEqual(4.5);
    }
    expect(adaptColor('#FFFFFF', 'dark')).toBe('#FFFFFF');
    expect(adaptColor(Colors.primaryFrom, 'dark', 'surface')).toBe(Colors.primaryFrom);
    expect(contrast('#FFFFFF',Colors.primaryTo)).toBeGreaterThanOrEqual(4.5);
  });
  it('preserves transparent overlays and is idempotent for nested themed components', () => {
    expect(adaptColor('transparent','dark','surface')).toBe('transparent');
    for (const role of ['foreground','surface','border'] as const) {
      const once=adaptColor('#EFEAF9','dark',role);
      expect(adaptColor(once,'dark',role)).toBe(once);
    }
  });
});
