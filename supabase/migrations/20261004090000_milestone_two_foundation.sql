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

-- Server-owned WhatsApp challenge avoids Supabase's ambiguous phone_change lookup.
create table public.phone_otp_challenges (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  code_hash text not null check (code_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null,
  sent_at timestamptz not null default now(),
  attempt_count integer not null default 0 check (attempt_count between 0 and 5)
);
create table public.phone_otp_sends (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phone text not null,
  sent_at timestamptz not null default now()
);
create index phone_otp_sends_user_recent on public.phone_otp_sends(user_id,sent_at desc);
create index phone_otp_sends_phone_recent on public.phone_otp_sends(phone,sent_at desc);
alter table public.phone_otp_challenges enable row level security;
alter table public.phone_otp_sends enable row level security;

create or replace function public.reserve_phone_otp(p_user_id uuid,p_phone text,p_hash text)
returns text language plpgsql security definer set search_path = '' as $$
declare v_last timestamptz;
begin
  if p_phone !~ '^\+[1-9][0-9]{7,14}$' or p_hash !~ '^[0-9a-f]{64}$' then raise exception 'Invalid phone challenge'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_user_id::text)::bigint);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_phone)::bigint);
  select sent_at into v_last from public.phone_otp_challenges where user_id=p_user_id;
  if v_last is not null and v_last > now()-interval '60 seconds' then return 'cooldown'; end if;
  if (select count(*) from public.phone_otp_sends where user_id=p_user_id and sent_at>now()-interval '24 hours')>=10 then return 'user_limit'; end if;
  if (select count(*) from public.phone_otp_sends where phone=p_phone and sent_at>now()-interval '24 hours')>=20 then return 'phone_limit'; end if;
  insert into public.phone_otp_challenges(user_id,phone,code_hash,expires_at,sent_at,attempt_count)
  values(p_user_id,p_phone,p_hash,now()+interval '5 minutes',now(),0)
  on conflict(user_id) do update set phone=excluded.phone,code_hash=excluded.code_hash,expires_at=excluded.expires_at,sent_at=excluded.sent_at,attempt_count=0;
  insert into public.phone_otp_sends(user_id,phone) values(p_user_id,p_phone);
  return 'reserved';
end;
$$;
revoke all on function public.reserve_phone_otp(uuid,text,text) from public, anon, authenticated;
grant execute on function public.reserve_phone_otp(uuid,text,text) to service_role;

create or replace function public.consume_phone_otp(p_user_id uuid,p_hash text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_challenge public.phone_otp_challenges%rowtype;
begin
  select * into v_challenge from public.phone_otp_challenges where user_id=p_user_id for update;
  if not found then return pg_catalog.jsonb_build_object('status','missing'); end if;
  if v_challenge.expires_at <= now() then
    delete from public.phone_otp_challenges where user_id=p_user_id;
    return pg_catalog.jsonb_build_object('status','expired');
  end if;
  if v_challenge.attempt_count >= 5 then return pg_catalog.jsonb_build_object('status','blocked'); end if;
  if v_challenge.code_hash <> p_hash then
    update public.phone_otp_challenges set attempt_count=attempt_count+1 where user_id=p_user_id;
    return pg_catalog.jsonb_build_object('status','invalid');
  end if;
  delete from public.phone_otp_challenges where user_id=p_user_id;
  return pg_catalog.jsonb_build_object('status','verified','phone',v_challenge.phone);
end;
$$;
revoke all on function public.consume_phone_otp(uuid,text) from public, anon, authenticated;
grant execute on function public.consume_phone_otp(uuid,text) to service_role;

-- Existing relationship uniqueness prevents two family or partner profiles.
alter table public.birth_profiles drop constraint if exists birth_profiles_user_relationship_unique;
create unique index if not exists birth_profiles_one_self_per_user
  on public.birth_profiles (user_id) where relationship = 'self';
alter table public.birth_profiles add column if not exists gender text;
alter table public.birth_profiles add column if not exists numerology_name text;

alter table public.calculated_charts add column if not exists input_fingerprint text;

update public.ai_modules set methodology='Four Pillars with solar-term year/month boundaries, Day Master, five elements and missing-hour limits',
  required_inputs=array['birth-date','birth-place']::text[],updated_at=now() where module_id='chinese-zodiac';
update public.ai_modules set methodology='Saju Palja interpretation of computed Four Pillars centered on Ilgan and element balance',
  required_inputs=array['birth-date','birth-place']::text[],updated_at=now() where module_id='korean-astrology';
update public.ai_modules set methodology='Pythagorean date numbers and name numbers only from a user-confirmed full birth name',
  required_inputs=array['birth-date']::text[],updated_at=now() where module_id='numerology';

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
  summary_message_count integer not null default 0,
  first_reading_status text not null default 'pending' check (first_reading_status in ('pending','ready','blocked','failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_conversations_profile_owner_fk foreign key (birth_profile_id,user_id) references public.birth_profiles(id,user_id) on delete set null (birth_profile_id)
);
create index ai_conversations_owner_recent on public.ai_conversations(user_id,updated_at desc);
create index ai_conversations_owner_module_recent on public.ai_conversations(user_id,module_id,updated_at desc);
create unique index ai_conversations_owner_start_request on public.ai_conversations(user_id,start_request_id) where start_request_id is not null;
alter table public.ai_conversations add constraint ai_conversations_id_user_unique unique (id,user_id);

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
alter table public.compatibility_analyses add constraint compatibility_analyses_id_user_unique unique(id,user_id);
alter table public.ai_conversations add column compatibility_analysis_id uuid;
alter table public.ai_conversations add constraint ai_conversations_compatibility_owner_fk
  foreign key (compatibility_analysis_id,user_id) references public.compatibility_analyses(id,user_id) on delete cascade;
create unique index ai_conversations_one_per_compatibility on public.ai_conversations(user_id,compatibility_analysis_id)
  where compatibility_analysis_id is not null;

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

create table public.ai_consent (
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null check (scope in ('birth_and_questions','palm_image','face_image')),
  text_version text not null,
  accepted_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (user_id,scope)
);

create table public.ai_request_claims (
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  created_at timestamptz not null default now(),
  leased_at timestamptz,
  completed_at timestamptz,
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

create or replace function public.lease_ai_preview_request(p_user_id uuid, p_request_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare v_claim public.ai_request_claims%rowtype;
begin
  select * into v_claim from public.ai_request_claims where user_id=p_user_id and request_id=p_request_id for update;
  if not found then raise exception 'Request was not claimed'; end if;
  if v_claim.completed_at is not null then return 'complete'; end if;
  if v_claim.leased_at is not null and v_claim.leased_at > now()-interval '2 minutes' then return 'busy'; end if;
  update public.ai_request_claims set leased_at=now() where user_id=p_user_id and request_id=p_request_id;
  return 'acquired';
end;
$$;
revoke all on function public.lease_ai_preview_request(uuid,uuid) from public, anon, authenticated;
grant execute on function public.lease_ai_preview_request(uuid,uuid) to service_role;

create or replace function public.finish_ai_preview_request(p_user_id uuid, p_request_id uuid, p_success boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.ai_request_claims
  set leased_at=null, completed_at=case when p_success then now() else completed_at end
  where user_id=p_user_id and request_id=p_request_id;
end;
$$;
revoke all on function public.finish_ai_preview_request(uuid,uuid,boolean) from public, anon, authenticated;
grant execute on function public.finish_ai_preview_request(uuid,uuid,boolean) to service_role;

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.compatibility_analyses enable row level security;
alter table public.ai_media enable row level security;
alter table public.ai_consent enable row level security;

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
create policy ai_consent_owner_read on public.ai_consent for select to authenticated using (user_id=(select auth.uid()) and (select public.has_verified_phone()));

grant select,update(title),delete on public.ai_conversations to authenticated;
grant select on public.ai_messages to authenticated;
grant select,insert,update on public.ai_feedback to authenticated;
grant select on public.compatibility_analyses to authenticated;
grant select,insert,delete on public.ai_media to authenticated;
grant select on public.ai_consent to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('ai-private','ai-private',false,10485760,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy ai_private_owner_read on storage.objects for select to authenticated using (bucket_id='ai-private' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.has_verified_phone()));
create policy ai_private_owner_upload on storage.objects for insert to authenticated with check (bucket_id='ai-private' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.has_verified_phone()));
create policy ai_private_owner_delete on storage.objects for delete to authenticated using (bucket_id='ai-private' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.has_verified_phone()));
