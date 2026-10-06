-- A question and its answer share a database transaction timestamp. Random UUIDs
-- must not decide which one appears first. Use a database-owned insertion order.
alter table public.ai_messages add column sequence bigint generated always as identity;
create index ai_messages_conversation_sequence on public.ai_messages(conversation_id,sequence);
