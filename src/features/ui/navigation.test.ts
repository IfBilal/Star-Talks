/* eslint-disable @typescript-eslint/no-require-imports */
import fs from 'fs';
import path from 'path';

const srcDir = path.join(__dirname, '../..');
const appDir = path.join(srcDir, 'app');

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e: fs.Dirent) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

const appFiles = walk(appDir).filter(f => f.endsWith('.tsx') && !f.endsWith('_layout.tsx'));
const routes = appFiles.map(f => {
  const r = path.relative(appDir, f).replace(/\\/g, '/').replace(/\.tsx$/, '').replace(/(^|\/)index$/, '');
  return '/' + r;
});

const resolves = (target: string) => {
  const p = target.split('?')[0].split('#')[0];
  return routes.some(r => r === p || new RegExp('^' + r.replace(/\[[^\]]+\]/g, '[^/]+') + '$').test(p));
};

describe('screen navigation', () => {
  it('has a substantial set of screens and each exports a default component', () => {
    expect(appFiles.length).toBeGreaterThan(60);
    for (const f of appFiles) expect(fs.readFileSync(f, 'utf8')).toMatch(/export default/);
  });

  it('every hard-coded navigation target resolves to a real screen', () => {
    const sources = [...appFiles, ...walk(path.join(srcDir, 'components')), ...walk(path.join(srcDir, 'features/uiData'))].filter(f => /\.tsx?$/.test(f));
    const code = sources.map(f => fs.readFileSync(f, 'utf8')).join('\n');
    const targets = new Set<string>();
    for (const m of code.matchAll(/(?:go|replace|router\.push|router\.replace)\(\s*['"`](\/[^'"`$]*)['"`]/g)) targets.add(m[1]);
    for (const m of code.matchAll(/(?:href|route):\s*'(\/[^']*)'/g)) targets.add(m[1]);
    expect([...targets].filter(t => !resolves(t))).toEqual([]);
    expect(targets.size).toBeGreaterThan(55);
  });

  it('every dynamic link builds a path that exists', () => {
    for (const id of ['vedic', 'tarot', 'palmistry', 'numerology', 'western', 'lal-kitab', 'chinese-zodiac', 'korean-astrology', 'face-reading']) expect(resolves(`/ai/${id}`)).toBe(true);
    for (const id of ['vedic-foundation', 'tarot-mastery', 'numerology-essentials', 'vastu-basics', 'palmistry-fundamentals']) {
      for (const suffix of ['', '/lesson', '/certificate']) expect(resolves(`/courses/${id}${suffix}`)).toBe(true);
    }
    for (const k of ['conversations', 'profiles', 'account', 'request']) expect(resolves(`/settings/delete/${k}`)).toBe(true);
    for (const p of ['privacy', 'terms', 'consent', 'data']) expect(resolves(`/legal/${p}`)).toBe(true);
    for (const t of ['4521', '4388', '4102', '3977']) expect(resolves(`/support/tickets/${t}`)).toBe(true);
  });

  it('the onboarding flow is wired end to end', () => {
    for (const r of ['/', '/region', '/language', '/auth', '/profile-setup', '/birth-details', '/palm-photo', '/permissions', '/home']) expect(resolves(r)).toBe(true);
  });

  it('every bottom-tab destination exists', () => {
    for (const r of ['/home', '/courses', '/ai', '/reports', '/profile']) expect(resolves(r)).toBe(true);
  });

  it('excluded astrologer and consultation screens are not built', () => {
    for (const r of routes) expect(r).not.toMatch(/astrologer|consultation|video-call|audio-call/i);
  });
});
