import React from 'react';
import renderer from 'react-test-renderer';
jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('lucide-react-native', () => ({ Mail: () => null, Lock: () => null }));
jest.mock('expo-image', () => {
  const React = require('react');
  return { Image: (props: object) => React.createElement('Image', props) };
});
jest.mock('expo-web-browser', () => ({}));
jest.mock('expo-linking', () => ({ createURL: () => 'startalks://auth/callback' }));
jest.mock('@/lib/supabase', () => ({ requireSupabase: jest.fn() }));
jest.mock('react-native', () => {
  const React = require('react');
  const Host = ({ children }: { children: React.ReactNode }) => React.createElement('View', null, children);
  const Text = ({ children }: { children: React.ReactNode }) => React.createElement('Text', null, children);
  return { Platform: { OS: 'android' }, View: Host, Pressable: Host, Text };
});
jest.mock('@/components/brand', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    Screen: ({ children }: { children: React.ReactNode }) => React.createElement(View, null, children),
    Title: ({ children }: { children: React.ReactNode }) => React.createElement(Text, null, children),
    TextField: () => React.createElement(View),
    PrimaryButton: () => React.createElement(View),
  };
});
import AuthScreen from '../../app/auth';

describe('AuthScreen', () => {
  it('does not render bare strings inside native views', () => {
    let tree: renderer.ReactTestRenderer;
    renderer.act(() => {
      tree = renderer.create(React.createElement(AuthScreen));
    });
    const root = tree!.toJSON();
    const check = (node: unknown): void => {
      if (!node || typeof node !== 'object') return;
      const element = node as { type?: string; props?: Record<string, unknown>; children?: unknown[] };
      if (element.type === 'View') {
        expect((element.children ?? []).filter(child => typeof child === 'string')).toEqual([]);
      }
      if (element.type === 'Image' && element.props?.accessibilityLabel === 'Star Talks') {
        foundLogo = true;
      }
      (element.children ?? []).forEach(check);
    };
    let foundLogo = false;
    check(root);
    expect(foundLogo).toBe(true);
    tree!.unmount();
  });
});
