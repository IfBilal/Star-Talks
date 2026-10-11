import fs from 'fs';
import path from 'path';

it('keeps test files outside Expo Router app routes', () => {
  const appDir = path.join(__dirname, '../../app');
  const testRoutes = fs.readdirSync(appDir, { recursive: true })
    .map(String)
    .filter(file => /\.(test|spec)\.[jt]sx?$/.test(file));
  expect(testRoutes).toEqual([]);
});
