-- Milestone 2: owner-scoped data, verified-phone gate, and conversation persistence.
create or replace function public.has_verified_phone()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from auth.users u
    where u.id = (select auth.uid())
      and u.phone is not null and u.phone <> ''
      and u.phone_confirmed_at is not null
  );
$$;
revoke all on function public.has_verified_phone() from public, anon;
grant execute on function public.has_verified_phone() to authenticated;

-- Existing relationship uniqueness prevents two family or partner profiles.
alter table public.birth_profiles drop constraint if exists birth_profiles_user_relationship_unique;
create unique index if not exists birth_profiles_one_self_per_user
  on public.birth_profiles (user_id) where relationship = 'self';
alter table public.birth_profiles add column if not exists gender text;
alter table public.birth_profiles add column if not exists numerology_name text;

alter table public.calculated_charts add column if not exists input_fingerprint text;

-- Remove Phase 1 policies before granting verified accounts access.
drop policy if exists "Users can view their profile" on public.profiles;
drop policy if exists "Users can create their profile" on public.profiles;
drop policy if exists "Users can update their profile" on public.profiles;
drop policy if exists "Users can view their birth profiles" on public.birth_profiles;
drop policy if exists "Users can create their birth profiles" on public.birth_profiles;
drop policy if exists "Users can update their birth profiles" on public.birth_profiles;
drop policy if exists "Users can delete their birth profiles" on public.birth_profiles;
drop policy if exists "Users can view their calculated charts" on public.calculated_charts;
drop policy if exists "Users can create their calculated charts" on public.calculated_charts;
drop policy if exists "Users can update their calculated charts" on public.calculated_charts;
drop policy if exists "Users can delete their calculated charts" on public.calculated_charts;

create policy profiles_verified_owner_select on public.profiles for select to authenticated using (id = (select auth.uid()) and (select public.has_verified_phone()));
create policy profiles_verified_owner_insert on public.profiles for insert to authenticated with check (id = (select auth.uid()) and (select public.has_verified_phone()));
create policy profiles_verified_owner_update on public.profiles for update to authenticated using (id = (select auth.uid()) and (select public.has_verified_phone())) with check (id = (select auth.uid()) and (select public.has_verified_phone()));
create policy birth_verified_owner_select on public.birth_profiles for select to authenticated using (user_id = (select auth.uid()) and (select public.has_verified_phone()));
create policy birth_verified_owner_insert on public.birth_profiles for insert to authenticated with check (user_id = (select auth.uid()) and (select public.has_verified_phone()));
create policy birth_verified_owner_update on public.birth_profiles for update to authenticated using (user_id = (select auth.uid()) and (select public.has_verified_phone())) with check (user_id = (select auth.uid()) and (select public.has_verified_phone()));
create policy birth_verified_owner_delete on public.birth_profiles for delete to authenticated using (user_id = (select auth.uid()) and (select public.has_verified_phone()));
create policy chart_verified_owner_select on public.calculated_charts for select to authenticated using (user_id = (select auth.uid()) and (select public.has_verified_phone()));
create policy chart_verified_owner_insert on public.calculated_charts for insert to authenticated with check (user_id = (select auth.uid()) and (select public.has_verified_phone()));
create policy chart_verified_owner_update on public.calculated_charts for update to authenticated using (user_id = (select auth.uid()) and (select public.has_verified_phone())) with check (user_id = (select auth.uid()) and (select public.has_verified_phone()));
create policy chart_verified_owner_delete on public.calculated_charts for delete to authenticated using (user_id = (select auth.uid()) and (select public.has_verified_phone()));

create table public.ai_conversations (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null references public.ai_modules(module_id),
  birth_profile_id uuid,
  title text not null default 'New reading' check (char_length(title) between 1 and 120),
  methodology_version text not null,
  prompt_version text not null,
  start_request_id uuid,
  calculator_version text,
  input_fingerprint text,
  input_snapshot jsonb not null default '{}'::jsonb,
  summary text not null default '',
  first_reading_status text not null default 'pending' check (first_reading_status in ('pending','ready','blocked','failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_conversations_profile_owner_fk foreign key (birth_profile_id,user_id) references public.birth_profiles(id,user_id) on delete set null (birth_profile_id)
);
create index ai_conversations_owner_recent on public.ai_conversations(user_id,updated_at desc);
create index ai_conversations_owner_module_recent on public.ai_conversations(user_id,module_id,updated_at desc);
create unique index ai_conversations_owner_start_request on public.ai_conversations(user_id,start_request_id) where start_request_id is not null;

create table public.ai_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  kind text not null check (kind in ('first','question','answer','clarification','redirect','blocked','error')),
  body text not null default '',
  structured_payload jsonb not null default '{}'::jsonb,
  source_refs text[] not null default '{}',
  request_id uuid,
  provider_model text,
  status text not null default 'complete' check (status in ('pending','complete','failed')),
  created_at timestamptz not null default now(),
  constraint ai_messages_conversation_owner_fk foreign key (conversation_id,user_id) references public.ai_conversations(id,user_id) on delete cascade
);
alter table public.ai_conversations add constraint ai_conversations_id_user_unique unique (id,user_id);
create index ai_messages_conversation_order on public.ai_messages(conversation_id,created_at,id);
create unique index ai_messages_owner_request_role_unique on public.ai_messages(user_id,request_id,role) where request_id is not null;
alter table public.ai_messages add constraint ai_messages_id_user_unique unique(id,user_id);

create table public.ai_feedback (
  message_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  helpful boolean,
  reasons text[] not null default '{}',
  report_note text,
  reported_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint ai_feedback_message_owner_fk foreign key (message_id,user_id) references public.ai_messages(id,user_id) on delete cascade
);

create table public.compatibility_analyses (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  first_profile_id uuid not null,
  second_profile_id uuid not null,
  relationship_type text not null check (relationship_type in ('love','marriage','friendship','business')),
  module_id text not null references public.ai_modules(module_id),
  method_version text not null,
  factors jsonb not null default '[]'::jsonb,
  result jsonb not null default '{}'::jsonb,
  request_id uuid not null,
  created_at timestamptz not null default now(),
  constraint compatibility_different_profiles check (first_profile_id <> second_profile_id),
  constraint compatibility_first_owner_fk foreign key (first_profile_id,user_id) references public.birth_profiles(id,user_id) on delete cascade,
  constraint compatibility_second_owner_fk foreign key (second_profile_id,user_id) references public.birth_profiles(id,user_id) on delete cascade,
  constraint compatibility_owner_request_unique unique (user_id,request_id)
);

create table public.ai_media (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('palm','face')),
  storage_path text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp')),
  metadata jsonb not null default '{}'::jsonb,
  consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint ai_media_owner_path check (split_part(storage_path,'/',1)=user_id::text)
);

create table public.ai_request_claims (
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  created_at timestamptz not null default now(),
  primary key(user_id,request_id)
);
create index ai_request_claims_recent on public.ai_request_claims(user_id,created_at desc);
alter table public.ai_request_claims enable row level security;

create or replace function public.claim_ai_preview_request(p_user_id uuid, p_request_id uuid, p_daily_limit integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_count integer;
begin
  if p_daily_limit < 1 or p_daily_limit > 1000 then raise exception 'Invalid preview limit'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_user_id::text)::bigint);
  if exists (select 1 from public.ai_request_claims where user_id=p_user_id and request_id=p_request_id) then return true; end if;
  select count(*) into v_count from public.ai_request_claims
    where user_id=p_user_id and created_at > now()-interval '24 hours';
  if v_count >= p_daily_limit then return false; end if;
  insert into public.ai_request_claims(user_id,request_id) values (p_user_id,p_request_id);
  return true;
end;
$$;
revoke all on function public.claim_ai_preview_request(uuid,uuid,integer) from public, anon, authenticated;
grant execute on function public.claim_ai_preview_request(uuid,uuid,integer) to service_role;

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.compatibility_analyses enable row level security;
alter table public.ai_media enable row level security;

create policy ai_conversations_owner_read on public.ai_conversations for select to authenticated using (user_id=(select auth.uid()) and (select public.has_verified_phone()));
create policy ai_conversations_owner_delete on public.ai_conversations for delete to authenticated using (user_id=(select auth.uid()) and (select public.has_verified_phone()));
create policy ai_conversations_owner_rename on public.ai_conversations for update to authenticated using (user_id=(select auth.uid()) and (select public.has_verified_phone())) with check (user_id=(select auth.uid()) and (select public.has_verified_phone()));
create policy ai_messages_owner_read on public.ai_messages for select to authenticated using (user_id=(select auth.uid()) and (select public.has_verified_phone()));
create policy ai_feedback_owner_read on public.ai_feedback for select to authenticated using (user_id=(select auth.uid()) and (select public.has_verified_phone()));
create policy ai_feedback_owner_write on public.ai_feedback for insert to authenticated with check (user_id=(select auth.uid()) and (select public.has_verified_phone()) and exists (select 1 from public.ai_messages m where m.id=message_id and m.user_id=(select auth.uid()) and m.role='assistant'));
create policy ai_feedback_owner_update on public.ai_feedback for update to authenticated using (user_id=(select auth.uid()) and (select public.has_verified_phone())) with check (user_id=(select auth.uid()) and (select public.has_verified_phone()));
create policy compatibility_owner_read on public.compatibility_analyses for select to authenticated using (user_id=(select auth.uid()) and (select public.has_verified_phone()));
create policy ai_media_owner_read on public.ai_media for select to authenticated using (user_id=(select auth.uid()) and (select public.has_verified_phone()));
create policy ai_media_owner_insert on public.ai_media for insert to authenticated with check (user_id=(select auth.uid()) and (select public.has_verified_phone()));
create policy ai_media_owner_delete on public.ai_media for delete to authenticated using (user_id=(select auth.uid()) and (select public.has_verified_phone()));

grant select,update(title),delete on public.ai_conversations to authenticated;
grant select on public.ai_messages to authenticated;
grant select,insert,update on public.ai_feedback to authenticated;
grant select on public.compatibility_analyses to authenticated;
grant select,insert,delete on public.ai_media to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('ai-private','ai-private',false,10485760,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy ai_private_owner_read on storage.objects for select to authenticated using (bucket_id='ai-private' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.has_verified_phone()));
create policy ai_private_owner_upload on storage.objects for insert to authenticated with check (bucket_id='ai-private' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.has_verified_phone()));
create policy ai_private_owner_delete on storage.objects for delete to authenticated using (bucket_id='ai-private' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.has_verified_phone()));
