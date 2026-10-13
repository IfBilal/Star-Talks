-- Preview limits: request counts prevent bursts; weighted provider tokens
-- prevent long prompts, images, and summaries from exhausting the budget.
-- One unit is one input token; one output token is four units on gpt-4o-mini.
alter table public.ai_request_claims
  add column reserved_units integer not null default 0 check (reserved_units >= 0),
  add column charged_units integer not null default 0 check (charged_units >= 0),
  add column input_tokens integer not null default 0 check (input_tokens >= 0),
  add column output_tokens integer not null default 0 check (output_tokens >= 0),
  add column provider_model text,
  add column attempt_count integer not null default 0 check (attempt_count >= 0);

drop function public.claim_ai_preview_request(uuid,uuid,integer,text,integer,integer,integer);
create function public.claim_ai_preview_request(
  p_user_id uuid, p_request_id uuid, p_daily_limit integer,
  p_fingerprint text, p_global_daily_limit integer,
  p_user_minute_limit integer, p_global_minute_limit integer,
  p_user_daily_unit_limit integer, p_global_daily_unit_limit integer,
  p_reserved_units integer
)
returns text language plpgsql security definer set search_path = '' as $$
declare v_existing text; v_user_units bigint; v_global_units bigint;
begin
  if p_daily_limit not between 1 and 1000
    or p_global_daily_limit not between 1 and 100000
    or p_user_minute_limit not between 1 and 100
    or p_global_minute_limit not between 1 and 10000
    or p_user_daily_unit_limit not between 1000 and 100000000
    or p_global_daily_unit_limit not between 1000 and 1000000000
    or p_reserved_units not between 1 and 1000000
    or p_reserved_units > p_user_daily_unit_limit
    or p_reserved_units > p_global_daily_unit_limit
    or p_fingerprint is null or p_fingerprint !~ '^[0-9a-f]{64}$'
  then raise exception 'Invalid AI quota parameters'; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('star-talks-ai-global')::bigint);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_user_id::text)::bigint);
  select request_fingerprint into v_existing from public.ai_request_claims
    where user_id=p_user_id and request_id=p_request_id;
  if found then
    if v_existing is not null and v_existing <> p_fingerprint then
      raise exception 'Request ID was reused with different input' using errcode='22023';
    end if;
    if v_existing is null then
      update public.ai_request_claims set request_fingerprint=p_fingerprint
        where user_id=p_user_id and request_id=p_request_id;
    end if;
    return 'existing';
  end if;

  if (select count(*) from public.ai_request_claims
      where user_id=p_user_id and created_at>now()-interval '1 minute') >= p_user_minute_limit then return 'user_minute'; end if;
  if (select count(*) from public.ai_request_claims
      where created_at>now()-interval '1 minute') >= p_global_minute_limit then return 'global_minute'; end if;
  if (select count(*) from public.ai_request_claims
      where user_id=p_user_id and created_at>now()-interval '24 hours') >= p_daily_limit then return 'user_daily'; end if;
  if (select count(*) from public.ai_request_claims
      where created_at>now()-interval '24 hours') >= p_global_daily_limit then return 'global_daily'; end if;

  select coalesce(sum(greatest(reserved_units,charged_units)),0) into v_user_units
    from public.ai_request_claims where user_id=p_user_id and created_at>now()-interval '24 hours';
  select coalesce(sum(greatest(reserved_units,charged_units)),0) into v_global_units
    from public.ai_request_claims where created_at>now()-interval '24 hours';
  if v_user_units+p_reserved_units > p_user_daily_unit_limit then return 'user_tokens'; end if;
  if v_global_units+p_reserved_units > p_global_daily_unit_limit then return 'global_tokens'; end if;

  insert into public.ai_request_claims(user_id,request_id,request_fingerprint,reserved_units)
    values(p_user_id,p_request_id,p_fingerprint,p_reserved_units);
  return 'claimed';
end;
$$;
revoke all on function public.claim_ai_preview_request(uuid,uuid,integer,text,integer,integer,integer,integer,integer,integer)
  from public,anon,authenticated;
grant execute on function public.claim_ai_preview_request(uuid,uuid,integer,text,integer,integer,integer,integer,integer,integer)
  to service_role;

create function public.record_ai_provider_usage(
  p_user_id uuid, p_request_id uuid, p_input_tokens integer,
  p_output_tokens integer, p_model text
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_input_tokens not between 0 and 1000000
    or p_output_tokens not between 0 and 1000000
    or p_model is null or pg_catalog.char_length(p_model) not between 1 and 100
  then raise exception 'Invalid AI provider usage'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('star-talks-ai-global')::bigint);
  update public.ai_request_claims set
    input_tokens=input_tokens+p_input_tokens,
    output_tokens=output_tokens+p_output_tokens,
    charged_units=charged_units+p_input_tokens+(p_output_tokens*4),
    provider_model=p_model
  where user_id=p_user_id and request_id=p_request_id and completed_at is null;
  if not found then raise exception 'Active AI request was not found'; end if;
end;
$$;
revoke all on function public.record_ai_provider_usage(uuid,uuid,integer,integer,text)
  from public,anon,authenticated;
grant execute on function public.record_ai_provider_usage(uuid,uuid,integer,integer,text)
  to service_role;

create or replace function public.lease_ai_preview_request(p_user_id uuid,p_request_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare v_claim public.ai_request_claims%rowtype;
begin
  select * into v_claim from public.ai_request_claims
    where user_id=p_user_id and request_id=p_request_id for update;
  if not found then raise exception 'Request was not claimed'; end if;
  if v_claim.completed_at is not null then return 'complete'; end if;
  if v_claim.leased_at is not null and v_claim.leased_at>now()-interval '2 minutes' then return 'busy'; end if;
  if v_claim.attempt_count>=2 then return 'exhausted'; end if;
  update public.ai_request_claims set leased_at=now(),attempt_count=attempt_count+1
    where user_id=p_user_id and request_id=p_request_id;
  return 'acquired';
end;
$$;

create or replace function public.finish_ai_preview_request(p_user_id uuid,p_request_id uuid,p_success boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.ai_request_claims set
    leased_at=null, reserved_units=0,
    completed_at=case when p_success then now() else completed_at end
  where user_id=p_user_id and request_id=p_request_id;
end;
$$;
