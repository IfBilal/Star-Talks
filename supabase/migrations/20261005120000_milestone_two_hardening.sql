-- Explicit grants are required: Supabase default privileges otherwise grant ALL.
revoke all on public.phone_otp_challenges, public.phone_otp_sends,
  public.ai_request_claims, public.ai_conversations, public.ai_messages,
  public.ai_feedback, public.compatibility_analyses, public.ai_media,
  public.ai_consent from public, anon, authenticated;
grant all on public.phone_otp_challenges, public.phone_otp_sends,
  public.ai_request_claims, public.ai_conversations, public.ai_messages,
  public.ai_feedback, public.compatibility_analyses, public.ai_media,
  public.ai_consent to service_role;
grant select, update(title), delete on public.ai_conversations to authenticated;
grant select on public.ai_messages, public.ai_feedback, public.compatibility_analyses,
  public.ai_consent to authenticated;
grant select, insert, delete on public.ai_media to authenticated;
-- Feedback writes go through the API, which checks assistant role and reason limits.

-- Delivery failures must not erase the send cooldown.
create or replace function public.reserve_phone_otp(p_user_id uuid,p_phone text,p_hash text)
returns text language plpgsql security definer set search_path = '' as $$
declare v_last timestamptz;
begin
  if p_phone !~ '^\+[1-9][0-9]{7,14}$' or p_hash !~ '^[0-9a-f]{64}$' then raise exception 'Invalid phone challenge'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_user_id::text)::bigint);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_phone)::bigint);
  select max(sent_at) into v_last from public.phone_otp_sends where user_id=p_user_id;
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


-- Bind idempotency to the action and input; an ID cannot be reused for a different question.
alter table public.ai_request_claims add column request_fingerprint text;
drop function public.claim_ai_preview_request(uuid,uuid,integer);
create function public.claim_ai_preview_request(p_user_id uuid, p_request_id uuid, p_daily_limit integer, p_fingerprint text default null)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_count integer; v_existing text;
begin
  if p_daily_limit is null or p_daily_limit < 1 or p_daily_limit > 1000 then raise exception 'Invalid preview limit'; end if;
  if p_fingerprint is not null and p_fingerprint !~ '^[0-9a-f]{64}$' then raise exception 'Invalid request fingerprint'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_user_id::text)::bigint);
  select request_fingerprint into v_existing from public.ai_request_claims where user_id=p_user_id and request_id=p_request_id;
  if found then
    if v_existing is not null and p_fingerprint is not null and v_existing <> p_fingerprint then
      raise exception 'Request ID was reused with different input' using errcode='22023';
    end if;
    if v_existing is null and p_fingerprint is not null then
      update public.ai_request_claims set request_fingerprint=p_fingerprint where user_id=p_user_id and request_id=p_request_id;
    end if;
    return true;
  end if;
  select count(*) into v_count from public.ai_request_claims where user_id=p_user_id and created_at > now()-interval '24 hours';
  if v_count >= p_daily_limit then return false; end if;
  insert into public.ai_request_claims(user_id,request_id,request_fingerprint) values(p_user_id,p_request_id,p_fingerprint);
  return true;
end;
$$;
revoke all on function public.claim_ai_preview_request(uuid,uuid,integer,text) from public, anon, authenticated;
grant execute on function public.claim_ai_preview_request(uuid,uuid,integer,text) to service_role;
