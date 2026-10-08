-- WhatsApp OTP is a separately activated requirement. Keep owner policies in
-- place while allowing authenticated accounts to complete the original AI
-- milestone. Flip this flag only together with the verified-phone policy gate.
create table public.phone_gate_settings (
  id boolean primary key default true check (id),
  enabled boolean not null default false
);
insert into public.phone_gate_settings (id, enabled) values (true, false);
alter table public.phone_gate_settings enable row level security;
revoke all on public.phone_gate_settings from public, anon, authenticated;
grant select, update on public.phone_gate_settings to service_role;

create or replace function public.has_verified_phone()
returns boolean language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null and (
    not (select enabled from public.phone_gate_settings where id = true)
    or exists (
      select 1 from auth.users u
      where u.id = (select auth.uid())
        and u.phone is not null and u.phone <> ''
        and u.phone_confirmed_at is not null
    )
  );
$$;

-- All paid actions share one atomic quota. A rolling global cap limits spend
-- even if someone creates many accounts; minute caps limit bursts. Repeated
-- request IDs return the original claim without charging quota a second time.
drop function public.claim_ai_preview_request(uuid, uuid, integer, text);
create function public.claim_ai_preview_request(
  p_user_id uuid, p_request_id uuid, p_daily_limit integer,
  p_fingerprint text, p_global_daily_limit integer,
  p_user_minute_limit integer, p_global_minute_limit integer
)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_existing text;
begin
  if p_daily_limit not between 1 and 1000
    or p_global_daily_limit not between 1 and 100000
    or p_user_minute_limit not between 1 and 100
    or p_global_minute_limit not between 1 and 10000
    or (p_fingerprint is not null and p_fingerprint !~ '^[0-9a-f]{64}$')
  then raise exception 'Invalid AI quota parameters'; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('star-talks-ai-global')::bigint);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_user_id::text)::bigint);
  select request_fingerprint into v_existing from public.ai_request_claims
    where user_id = p_user_id and request_id = p_request_id;
  if found then
    if v_existing is not null and p_fingerprint is not null and v_existing <> p_fingerprint then
      raise exception 'Request ID was reused with different input' using errcode = '22023';
    end if;
    if v_existing is null and p_fingerprint is not null then
      update public.ai_request_claims set request_fingerprint = p_fingerprint
        where user_id = p_user_id and request_id = p_request_id;
    end if;
    return true;
  end if;

  if p_fingerprint is null then raise exception 'New AI requests require a fingerprint'; end if;

  if (select count(*) from public.ai_request_claims
      where user_id = p_user_id and created_at > now() - interval '24 hours') >= p_daily_limit
    or (select count(*) from public.ai_request_claims
      where created_at > now() - interval '24 hours') >= p_global_daily_limit
    or (select count(*) from public.ai_request_claims
      where user_id = p_user_id and created_at > now() - interval '1 minute') >= p_user_minute_limit
    or (select count(*) from public.ai_request_claims
      where created_at > now() - interval '1 minute') >= p_global_minute_limit
  then return false; end if;

  insert into public.ai_request_claims (user_id, request_id, request_fingerprint)
    values (p_user_id, p_request_id, p_fingerprint);
  return true;
end;
$$;
revoke all on function public.claim_ai_preview_request(uuid,uuid,integer,text,integer,integer,integer)
  from public, anon, authenticated;
grant execute on function public.claim_ai_preview_request(uuid,uuid,integer,text,integer,integer,integer)
  to service_role;
