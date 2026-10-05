import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme, THEME_KEY } from './theme-context';

let current: ReturnType<typeof useTheme>;
function Probe() { current = useTheme(); return null; }
const render = async () => {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => { tree = renderer.create(React.createElement(ThemeProvider, null, React.createElement(Probe))); });
  return tree;
};
beforeEach(async () => { jest.clearAllMocks(); await AsyncStorage.clear(); });
it('restores dark mode across remounts and changes colors immediately', async () => {
  const tree = await render();
  expect(current.mode).toBe('light');
  await act(async () => { await current.setMode('dark'); });
  expect(current.isDark).toBe(true);
  expect(current.Colors.card).toBe('#1F2032');
  expect(await AsyncStorage.getItem(THEME_KEY)).toBe('dark');
  act(() => tree.unmount());
  const next = await render();
  expect(current.mode).toBe('dark');
  await act(async () => { await current.setMode('light'); });
  expect(current.Colors.card).toBe('#FFFDFB');
  act(() => next.unmount());
});
it('uses light mode for invalid stored data', async () => {
  await AsyncStorage.setItem(THEME_KEY, 'invalid');
  const tree = await render();
  expect(current.mode).toBe('light');
  act(() => tree.unmount());
});
it('serializes rapid preference changes', async () => {
  const tree = await render();
  await act(async () => { await Promise.all([current.setMode('dark'), current.setMode('light'), current.setMode('dark')]); });
  expect(await AsyncStorage.getItem(THEME_KEY)).toBe('dark');
  expect(current.mode).toBe('dark');
  act(() => tree.unmount());
});
