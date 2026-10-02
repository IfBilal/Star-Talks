import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => true } }));
jest.mock('@/components/ui', () => ({ go: jest.fn(), TabBar: () => null }));
jest.mock('react-native', () => {
  const React = require('react');
  const host = (name: string) => ({ children, ...props }: { children?: React.ReactNode }) => React.createElement(name, props, children);
  const animation = { start: jest.fn() };
  const animatedValue = () => ({ interpolate: ({ outputRange }: { outputRange: number[] }) => outputRange[1] });
  return {
    Animated: {
      Value: jest.fn(animatedValue),
      View: host('AnimatedView'),
      timing: jest.fn(() => animation),
      delay: jest.fn(() => animation),
      sequence: jest.fn(() => animation),
      stagger: jest.fn(() => animation),
    },
    Alert: { alert: jest.fn() },
    ImageBackground: host('ImageBackground'),
    Pressable: host('Pressable'),
    Platform: { OS: 'android', select: (values: Record<string, unknown>) => values.android ?? values.default },
    ScrollView: host('ScrollView'),
    StatusBar: () => null,
    Text: host('Text'),
    View: host('View'),
  };
});
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return { SafeAreaView: ({ children, ...props }: { children?: React.ReactNode }) => React.createElement('SafeAreaView', props, children) };
});
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  return { LinearGradient: ({ children, ...props }: { children?: React.ReactNode }) => React.createElement('LinearGradient', props, children) };
});
jest.mock('react-native-svg', () => {
  const React = require('react');
  const host = (name: string) => (props: object) => React.createElement(name, props);
  return { __esModule: true, default: host('Svg'), Circle: host('Circle'), Path: host('Path') };
});
jest.mock('lucide-react-native', () => new Proxy({}, {
  get: (_target, name) => {
    const React = require('react');
    return (props: object) => React.createElement(String(name), props);
  },
}));
jest.mock('@/lib/supabase', () => ({ requireSupabase: jest.fn(() => ({ auth: { getUser: async () => ({ data: { user: null } }) } })) }));
jest.mock('react-i18next', () => {
  const en = require('@/lib/i18n/locales/en').default as Record<string, unknown>;
  const get = (path: string): string => path.split('.').reduce<unknown>((node, key) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[key] : undefined), en) as string;
  const t = (key: string, vars?: Record<string, string>) => {
    let value = get(key) ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) value = value.replace(new RegExp(`{{${k}}}`, 'g'), v);
    return value;
  };
  return { useTranslation: () => ({ t, i18n: { language: 'en', changeLanguage: jest.fn() } }) };
});

import HomeScreen from '../../app/home';
import { Alert } from 'react-native';

const mockAlert = Alert.alert as jest.Mock;
import { go } from '@/components/ui';
const mockGo = go as jest.Mock;

describe('HomeScreen interactions and artwork', () => {
  beforeEach(() => {
    mockAlert.mockClear();
    mockGo.mockClear();
  });

  it('gives each dashboard button a live handler', () => {
    let tree!: renderer.ReactTestRenderer;
    renderer.act(() => { tree = renderer.create(React.createElement(HomeScreen)); });
    const buttons = tree.root.findAll(node => node.props.accessibilityRole === 'button');

    expect(buttons.length).toBeGreaterThanOrEqual(15);
    expect(buttons.every(button => typeof button.props.onPress === 'function')).toBe(true);
    tree.unmount();
  });

  it('shows the supplied splash artwork behind the question card', () => {
    let tree!: renderer.ReactTestRenderer;
    renderer.act(() => { tree = renderer.create(React.createElement(HomeScreen)); });
    const artwork = tree.root.find(node => String(node.type) === 'ImageBackground' && node.props.accessibilityLabel === 'Starry sunrise card background');

    expect(artwork.props.resizeMode).toBe('cover');
    expect(artwork.props.source).toBeDefined();
    expect(artwork.props.style).toMatchObject({ width: '100%', height: '100%' });
    tree.unmount();
  });

  it('navigates from the dashboard tiles, avatar, bell and ask bar', () => {
    let tree!: renderer.ReactTestRenderer;
    renderer.act(() => { tree = renderer.create(React.createElement(HomeScreen)); });
    const press = (label: string) => renderer.act(() => tree.root.find(node => node.props.accessibilityLabel === label).props.onPress());

    press('AI Astrology'); expect(mockGo).toHaveBeenLastCalledWith('/ai');
    press('Reports'); expect(mockGo).toHaveBeenLastCalledWith('/reports');
    press('Courses'); expect(mockGo).toHaveBeenLastCalledWith('/courses');
    press('Wallet & Credits'); expect(mockGo).toHaveBeenLastCalledWith('/wallet');
    press('Profile'); expect(mockGo).toHaveBeenLastCalledWith('/profile');
    press('Notifications'); expect(mockGo).toHaveBeenLastCalledWith('/notifications');
    press('Ask your question'); expect(mockGo).toHaveBeenLastCalledWith('/ai');
    press('Daily AI credit offer'); expect(mockGo).toHaveBeenLastCalledWith('/earn-credits');
    tree.unmount();
  });

  it('keeps excluded consultation services inert', () => {
    let tree!: renderer.ReactTestRenderer;
    renderer.act(() => { tree = renderer.create(React.createElement(HomeScreen)); });
    mockGo.mockClear();
    for (const label of ['Find Astrologers', 'Chat', 'Audio Consultation', 'Video Consultation']) {
      renderer.act(() => tree.root.find(node => node.props.accessibilityLabel === label).props.onPress());
    }
    expect(mockGo).not.toHaveBeenCalled();
    expect(mockAlert).toHaveBeenCalledTimes(4);
    tree.unmount();
  });
});
