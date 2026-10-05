import fs from 'fs';
import path from 'path';

const source = fs.readFileSync(path.join(__dirname, '../../app/ai/index.tsx'), 'utf8');

describe('AI landing layout regression', () => {
  it('uses the supplied transparent app mark and theme white wordmark', () => {
    expect(source).toContain('star-talks-mark.png');
    expect(source).not.toContain('<Compass');
    expect(source).toContain('color: palette.white');
  });
  it('fills each two-column row without mixing percentage widths and fixed gaps', () => {
    expect(source).toContain("width: '48.5%'");
    expect(source).toContain("justifyContent: 'space-between'");
    expect(source).toContain('rowGap: 12');
    expect(source).not.toContain("width: '31.6%'");
  });
  it('lets header content and safe-area height determine the background height', () => {
    expect(source).toContain('paddingBottom: 60');
    expect(source).not.toContain('height: 262');
  });
});
