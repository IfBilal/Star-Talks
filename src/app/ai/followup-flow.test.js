import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import AiChat from './[module]';
import { aiCall } from '@/features/ai/api';

jest.mock('@/lib/theme-context', () => ({
  useTheme: () => ({
    Colors: { ink: '#111', navy: '#223', slate: '#667', danger: '#f00', tile: '#eee', indigo: '#55a', lavender: '#55a' },
    themed: value => value,
    isDark: false,
  }),
}));
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ module: 'tarot' }),
}));
jest.mock('expo-crypto', () => ({ randomUUID: () => '11111111-1111-4111-8111-111111111111' }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: require('react-native').View }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: require('react-native').View }));
jest.mock('lucide-react-native', () => ({
  ArrowLeft: () => null, EllipsisVertical: () => null, Gem: () => null,
  Send: () => null, ThumbsDown: () => null, ThumbsUp: () => null,
}));
jest.mock('@/features/uiData/ai', () => ({
  moduleById: () => ({ id: 'tarot', name: 'Tarot', badge: 'AI', readingTitle: 'Reading', icon: () => null }),
}));
jest.mock('@/features/ai/api', () => ({ aiCall: jest.fn() }));
jest.mock('@/components/ui', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  return {
    back: jest.fn(), go: jest.fn(),
    Button: ({ title, onPress }) => <Text onPress={onPress}>{title}</Text>,
    Card: ({ children }) => <View>{children}</View>,
    Chip: ({ label, onPress }) => <Text onPress={onPress}>{label}</Text>,
    Sheet: ({ visible, children }) => visible ? <View>{children}</View> : null,
  };
});

const first = {
  id: 'first', role: 'assistant', kind: 'first', body: 'First reading',
  structured_payload: { followUps: ['Love?', 'Work?', 'Family?'] },
};
const reply = {
  id: 'answer', role: 'assistant', kind: 'answer', body: 'Here is your answer',
  structured_payload: { followUps: ['Love?', 'Work?', 'Family?'] },
};

afterEach(() => jest.clearAllMocks());

it('sends a selected choice, shows the answer, and does not repeat the same choices', async () => {
  aiCall.mockImplementation(async action => {
    if (action === 'get-consent') return { accepted: { birth_and_questions: true } };
    if (action === 'start-reading') return { conversation: { id: 'chat', title: 'Reading' }, messages: [first] };
    if (action === 'ask-module') return { messages: [
      { id: 'question', role: 'user', kind: 'question', body: 'Love?' }, reply,
    ] };
    throw new Error(`Unexpected action: ${action}`);
  });
  let screen;
  await act(async () => { screen = TestRenderer.create(<AiChat />); });
  const textNodes = () => screen.root.findAllByType(require('react-native').Text);
  expect(textNodes().filter(node => ['Love?', 'Work?', 'Family?'].includes(node.props.children))).toHaveLength(3);
  await act(async () => {
    textNodes().find(node => node.props.children === 'Love?').props.onPress();
  });
  expect(aiCall).toHaveBeenCalledWith('ask-module', expect.objectContaining({ conversationId: 'chat', question: 'Love?' }));
  expect(textNodes().some(node => node.props.children === 'Here is your answer')).toBe(true);
  expect(textNodes().filter(node => ['Love?', 'Work?', 'Family?'].includes(node.props.children))).toHaveLength(1);
  await act(async () => { screen.unmount(); });
});

it('shows a follow-up failure beside the latest chat content', async () => {
  aiCall.mockImplementation(async action => {
    if (action === 'get-consent') return { accepted: { birth_and_questions: true } };
    if (action === 'start-reading') return { conversation: { id: 'chat', title: 'Reading' }, messages: [first] };
    if (action === 'ask-module') throw new Error('AI preview is temporarily at its usage limit. Please try again later.');
    throw new Error(`Unexpected action: ${action}`);
  });
  let screen;
  await act(async () => { screen = TestRenderer.create(<AiChat />); });
  await act(async () => {
    screen.root.findAllByType(require('react-native').Text).find(node => node.props.children === 'Love?').props.onPress();
  });
  const visibleText = screen.root.findAllByType(require('react-native').Text).map(node => node.props.children);
  expect(visibleText.at(-1)).toBe('AI preview is temporarily at its usage limit. Please try again later.');
  await act(async () => { screen.unmount(); });
});
