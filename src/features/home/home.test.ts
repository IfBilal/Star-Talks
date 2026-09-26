import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn() } }));
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

import HomeScreen from '../../app/home';
import { router } from 'expo-router';
import { Alert } from 'react-native';

const mockAlert = Alert.alert as jest.Mock;
const mockPush = router.push as jest.Mock;
const mockReplace = router.replace as jest.Mock;

describe('HomeScreen interactions and artwork', () => {
  beforeEach(() => {
    mockAlert.mockClear();
    mockPush.mockClear();
    mockReplace.mockClear();
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

  it('routes profile and gives unavailable features visible feedback', () => {
    let tree!: renderer.ReactTestRenderer;
    renderer.act(() => { tree = renderer.create(React.createElement(HomeScreen)); });
    const profile = tree.root.find(node => node.props.accessibilityLabel === 'Profile tab');
    const astrology = tree.root.find(node => node.props.accessibilityLabel === 'AI Astrology');

    renderer.act(() => profile.props.onPress());
    renderer.act(() => astrology.props.onPress());

    expect(mockPush).toHaveBeenCalledWith('/profile');
    expect(mockAlert).toHaveBeenCalledWith('AI Astrology', expect.stringContaining('coming soon'));
    tree.unmount();
  });

  it('responds to search, notifications, rewards, and every non-profile tab', () => {
    let tree!: renderer.ReactTestRenderer;
    renderer.act(() => { tree = renderer.create(React.createElement(HomeScreen)); });
    const tap = (label: string) => tree.root.find(node => node.props.accessibilityLabel === label).props.onPress();

    renderer.act(() => {
      tap('Notifications');
      tap('Ask your question');
      tap('Daily AI credit offer');
      tap('Chat tab');
      tap('Reports tab');
      tap('Credits tab');
      tap('Home tab');
    });

    expect(mockAlert).toHaveBeenCalledWith('Notifications', "You're all caught up.");
    expect(mockAlert).toHaveBeenCalledWith('Ask your question', expect.any(String));
    expect(mockAlert).toHaveBeenCalledWith('Daily AI credits', expect.any(String));
    expect(mockAlert).toHaveBeenCalledWith('Chat', expect.stringContaining('coming soon'));
    expect(mockAlert).toHaveBeenCalledWith('Reports', expect.stringContaining('coming soon'));
    expect(mockAlert).toHaveBeenCalledWith('Credits', expect.stringContaining('coming soon'));
    expect(mockReplace).toHaveBeenCalledWith('/home');
    tree.unmount();
  });
});
