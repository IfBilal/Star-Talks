-- Pending activation script, intentionally outside migrations/ so a normal
-- schema push cannot lock out users before WhatsApp delivery is live.
-- Apply only after WhatsApp delivery, phone confirmation, and recovery are live.
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

-- Apply only after WhatsApp OTP is live; activate the shared phone predicate
-- for both Phase 1 tables and the Milestone 2 AI/Storage owner policies.
update public.phone_gate_settings set enabled = true where id = true;
