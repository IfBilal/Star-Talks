import { latestFollowUps } from './followUps';
import type { AiMessage } from './api';

const assistant = (id: string, choices: string[]): AiMessage => ({
  id, role: 'assistant', kind: id === 'first' ? 'first' : 'answer', body: 'Reading', created_at: '',
  structured_payload: { followUps: choices },
});
const question = (body: string): AiMessage => ({ id: 'question', role: 'user', kind: 'question', body, created_at: '' });

describe('AI follow-up choices', () => {
  it('shows the initial suggestions before a question is sent', () => {
    expect(latestFollowUps([assistant('first', ['Love?', 'Work?', 'Family?'])])).toEqual({
      messageId: 'first', choices: ['Love?', 'Work?', 'Family?'],
    });
  });

  it('never repeats the first three choices after the user selects one', () => {
    const messages = [assistant('first', ['Love?', 'Work?', 'Family?']), question('Love?'), assistant('answer', ['Love?', 'Work?', 'Family?'])];
    expect(latestFollowUps(messages)).toBeNull();
  });

  it('does not turn a follow-up answer into another choice prompt', () => {
    const messages = [assistant('first', ['Love?', 'Work?', 'Family?']), question('Love?'), assistant('answer', ['Love?', 'How does timing affect this?', 'What should I consider next?'])];
    expect(latestFollowUps(messages)).toBeNull();
  });
});
