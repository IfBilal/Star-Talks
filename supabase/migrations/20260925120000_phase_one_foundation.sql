create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  gender text not null default 'prefer_not_to_say' check (gender in ('female','male','other','prefer_not_to_say','Female','Male','Other')),
  country_code text,
  country_name text,
  language_code text not null default 'en',
  currency_code text,
  date_format text not null default 'DD/MM/YYYY',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.birth_profiles (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  display_name text not null default 'My Birth Profile' check (char_length(display_name) between 1 and 120),
  relationship text not null default 'self' check (relationship in ('self','family','partner','friend','child','other')),
  birth_date date not null,
  birth_time time,
  birth_time_known boolean not null default true,
  place_label text not null check (char_length(place_label) between 1 and 300),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  time_zone text not null,
  birth_instant timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint birth_time_consistency check ((birth_time_known and birth_time is not null and birth_instant is not null) or (not birth_time_known and birth_time is null and birth_instant is null)),
  constraint birth_profiles_id_user_unique unique (id, user_id),
  constraint birth_profiles_user_relationship_unique unique (user_id, relationship)
);

create index birth_profiles_user_id_idx on public.birth_profiles (user_id, updated_at desc);

create table public.calculated_charts (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  birth_profile_id uuid not null,
  calculator_version text not null,
  method_settings jsonb not null default '{}'::jsonb,
  chart_data jsonb not null,
  generated_at timestamptz not null default now(),
  constraint calculated_charts_birth_owner_fk foreign key (birth_profile_id, user_id) references public.birth_profiles (id, user_id) on delete cascade,
  constraint calculated_charts_profile_version_unique unique (birth_profile_id, calculator_version)
);

create index calculated_charts_user_id_idx on public.calculated_charts (user_id, generated_at desc);

create table public.ai_modules (
  module_id text primary key check (module_id ~ '^[a-z][a-z0-9-]{1,50}$'),
  display_name text not null,
  methodology text not null,
  required_inputs text[] not null default '{}',
  question_domains text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.birth_profiles enable row level security;
alter table public.calculated_charts enable row level security;
alter table public.ai_modules enable row level security;

create policy "Users can view their profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Users can create their profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "Users can update their profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Users can view their birth profiles" on public.birth_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their birth profiles" on public.birth_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their birth profiles" on public.birth_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their birth profiles" on public.birth_profiles for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can view their calculated charts" on public.calculated_charts for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their calculated charts" on public.calculated_charts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their calculated charts" on public.calculated_charts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their calculated charts" on public.calculated_charts for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Anyone can read active AI modules" on public.ai_modules for select to anon, authenticated using (is_active);

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.birth_profiles to authenticated;
grant select, insert, update, delete on public.calculated_charts to authenticated;
grant select on public.ai_modules to anon, authenticated;

insert into public.ai_modules (module_id, display_name, methodology, required_inputs, question_domains) values
('tarot','AI Tarot','Randomized 78-card deck, upright and reversed readings, and position-aware spreads',array[]::text[],array['tarot','current-energy','card-spreads']::text[]),
('vedic','AI Vedic Astrology','Vedic chart, signs, houses, nakshatra and dasha methodology',array['birth-date','birth-place']::text[],array['vedic-astrology']::text[]),
('numerology','AI Numerology','Name and date based numerology calculations',array['birth-date','full-name']::text[],array['numerology']::text[]),
('western','AI Western Astrology','Tropical chart placements, aspects, houses and transits',array['birth-date','birth-time','birth-place']::text[],array['western-astrology']::text[]),
('lal-kitab','AI Lal Kitab','Lal Kitab planetary interpretation and traditional remedies',array['birth-date','birth-place']::text[],array['lal-kitab']::text[]),
('palmistry','AI Palmistry','Palm-line and hand-shape interpretation from an explicit user image',array['palm-image']::text[],array['palmistry']::text[]),
('chinese-zodiac','AI Chinese Zodiac','Chinese zodiac year and element system',array['birth-date']::text[],array['chinese-zodiac']::text[]),
('korean-astrology','AI Korean Astrology','Korean astrology method metadata; method configuration is intentionally versioned separately',array['birth-date','birth-time','birth-place']::text[],array['korean-astrology']::text[]),
('face-reading','AI Face Reading','Face analysis requires explicit image input and user consent',array['face-image']::text[],array['face-reading']::text[])
on conflict (module_id) do update set display_name=excluded.display_name, methodology=excluded.methodology, required_inputs=excluded.required_inputs, question_domains=excluded.question_domains, updated_at=now();
