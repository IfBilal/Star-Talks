import type { AiMessage } from './api';

const normalize = (value: string) => value.trim().toLocaleLowerCase().replace(/[?.!,]+/g, '').replace(/\s+/g, ' ');

export function latestFollowUps(messages: AiMessage[]): { messageId: string; choices: string[] } | null {
  if (messages.some(message => message.role === 'user')) return null;
  const latest = [...messages].reverse().find(message => message.role === 'assistant');
  if (latest?.kind !== 'first' || !latest.structured_payload?.followUps?.length) return null;

  const alreadySeen = new Set(messages.flatMap(message => {
    if (message.role === 'user') return [normalize(message.body)];
    if (message.id === latest.id) return [];
    return (message.structured_payload?.followUps ?? []).map(normalize);
  }));
  const choices = latest.structured_payload.followUps.filter(choice => !alreadySeen.has(normalize(choice)));
  return choices.length ? { messageId: latest.id, choices } : null;
}
