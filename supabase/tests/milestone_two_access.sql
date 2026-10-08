-- Transaction-only synthetic fixtures. Never confirms or changes an existing account.
-- Run as postgres on Star Talks after the additive hardening migration.
begin;
insert into auth.users(id,email,aud,role,phone,phone_confirmed_at) values
 ('11111111-1111-4111-8111-111111111111','m2-a@example.invalid','authenticated','authenticated','15555550111',now()),
 ('22222222-2222-4222-8222-222222222222','m2-b@example.invalid','authenticated','authenticated','15555550222',now()),
 ('33333333-3333-4333-8333-333333333333','m2-c@example.invalid','authenticated','authenticated',null,null);
insert into public.ai_conversations(id,user_id,module_id,title,methodology_version,prompt_version) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','tarot','Owner A','test','test'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','tarot','Owner B','test','test'),
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','33333333-3333-4333-8333-333333333333','tarot','Unverified','test','test');
insert into public.ai_messages(conversation_id,user_id,role,kind,body) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','assistant','first','Fixture');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
 if (select count(*) from public.ai_conversations where id in ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'))<>1 then raise exception 'Cross-owner conversation isolation failed'; end if;
 if (select count(*) from public.ai_messages where conversation_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')<>1 then raise exception 'Own messages missing'; end if;
 update public.ai_conversations set title='Renamed' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 if not found then raise exception 'Owner rename failed'; end if;
 begin
  update public.ai_conversations set input_snapshot='{"forged":true}' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  raise exception 'Evidence forgery allowed';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.ai_messages(conversation_id,user_id,role,kind,body) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','assistant','answer','forged');
  raise exception 'Message forgery allowed';
 exception when insufficient_privilege then null; end;
 begin perform * from public.phone_otp_challenges; raise exception 'OTP data visible'; exception when insufficient_privilege then null; end;
end $$;
-- Explicit check for denied server-only RPC and tables.
do $$ begin
 begin perform public.reserve_phone_otp('11111111-1111-4111-8111-111111111111','+15555550111',repeat('a',64)); raise exception 'OTP RPC exposed'; exception when insufficient_privilege then null; end;
 begin perform * from public.ai_request_claims; raise exception 'Quota table exposed'; exception when insufficient_privilege then null; end;
 begin perform * from public.phone_gate_settings; raise exception 'Phone gate switch exposed'; exception when insufficient_privilege then null; end;
end $$;
insert into storage.objects(bucket_id,name) values('ai-private','11111111-1111-4111-8111-111111111111/test.jpg');
do $$ begin
 begin insert into storage.objects(bucket_id,name) values('ai-private','22222222-2222-4222-8222-222222222222/forged.jpg'); raise exception 'Cross-owner storage upload allowed'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ begin
 if exists(select 1 from storage.objects where bucket_id='ai-private' and name='11111111-1111-4111-8111-111111111111/test.jpg') then raise exception 'Cross-owner storage read allowed'; end if;
 if exists(select 1 from public.ai_messages where conversation_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') then raise exception 'Cross-owner message read allowed'; end if;
end $$;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $$ begin
 if not public.has_verified_phone() then raise exception 'Deferred phone gate denied an authenticated user'; end if;
 if not exists(select 1 from public.ai_conversations where id='cccccccc-cccc-4ccc-8ccc-cccccccccccc') then raise exception 'Deferred phone gate hid own conversation'; end if;
end $$;
reset role;
update public.phone_gate_settings set enabled=true where id=true;
set local role authenticated;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $$ begin
 if public.has_verified_phone() then raise exception 'Unverified phone accepted'; end if;
 if exists(select 1 from public.ai_conversations where id='cccccccc-cccc-4ccc-8ccc-cccccccccccc') then raise exception 'Unverified conversation read allowed'; end if;
 begin insert into storage.objects(bucket_id,name) values('ai-private','33333333-3333-4333-8333-333333333333/no.jpg'); raise exception 'Unverified storage upload allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.phone_gate_settings set enabled=false where id=true;
do $$ declare result text; item jsonb; global_count integer; begin
 result:=public.reserve_phone_otp('11111111-1111-4111-8111-111111111111','+15555550111',repeat('a',64));
 if result<>'reserved' then raise exception 'Initial OTP reservation failed'; end if;
 delete from public.phone_otp_challenges where user_id='11111111-1111-4111-8111-111111111111';
 if public.reserve_phone_otp('11111111-1111-4111-8111-111111111111','+15555550111',repeat('a',64))<>'cooldown' then raise exception 'Delivery failure bypasses cooldown'; end if;
 update public.phone_otp_sends set sent_at=now()-interval '61 seconds' where user_id='11111111-1111-4111-8111-111111111111';
 perform public.reserve_phone_otp('11111111-1111-4111-8111-111111111111','+15555550111',repeat('a',64));
 for attempt in 1..5 loop
  item:=public.consume_phone_otp('11111111-1111-4111-8111-111111111111',repeat('b',64));
  if item->>'status'<>'invalid' then raise exception 'Wrong-code accounting failed'; end if;
 end loop;
 if public.consume_phone_otp('11111111-1111-4111-8111-111111111111',repeat('a',64))->>'status'<>'blocked' then raise exception 'Exhausted code accepted'; end if;
 update public.phone_otp_challenges set expires_at=now()-interval '1 second' where user_id='11111111-1111-4111-8111-111111111111';
 if public.consume_phone_otp('11111111-1111-4111-8111-111111111111',repeat('a',64))->>'status'<>'expired' then raise exception 'Expired code accepted'; end if;
 if not public.claim_ai_preview_request('11111111-1111-4111-8111-111111111111','dddddddd-dddd-4ddd-8ddd-dddddddddddd',1,repeat('a',64),100000,3,10000) then raise exception 'Quota initial claim failed'; end if;
 if not public.claim_ai_preview_request('11111111-1111-4111-8111-111111111111','dddddddd-dddd-4ddd-8ddd-dddddddddddd',1,repeat('a',64),100000,3,10000) then raise exception 'Idempotent retry failed'; end if;
 if not public.claim_ai_preview_request('11111111-1111-4111-8111-111111111111','dddddddd-dddd-4ddd-8ddd-dddddddddddd',1,null,100000,3,10000) then raise exception 'Saved failed-reading retry was blocked'; end if;
 if public.claim_ai_preview_request('11111111-1111-4111-8111-111111111111','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',1,repeat('b',64),100000,3,10000) then raise exception 'Daily quota bypassed'; end if;
 if public.claim_ai_preview_request('11111111-1111-4111-8111-111111111111','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',1000,repeat('b',64),100000,1,10000) then raise exception 'User minute quota bypassed'; end if;
 select count(*) into global_count from public.ai_request_claims where created_at > now()-interval '24 hours';
 if public.claim_ai_preview_request('22222222-2222-4222-8222-222222222222','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',1000,repeat('b',64),global_count,3,10000) then raise exception 'Global daily quota bypassed'; end if;
 select count(*) into global_count from public.ai_request_claims where created_at > now()-interval '1 minute';
 if public.claim_ai_preview_request('22222222-2222-4222-8222-222222222222','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',1000,repeat('b',64),100000,3,global_count) then raise exception 'Global minute quota bypassed'; end if;
 begin perform public.claim_ai_preview_request('22222222-2222-4222-8222-222222222222','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',1000,null,100000,3,10000); raise exception 'New request without fingerprint accepted'; exception when raise_exception then if sqlerrm='New request without fingerprint accepted' then raise; end if; end;
 begin perform public.claim_ai_preview_request('11111111-1111-4111-8111-111111111111','dddddddd-dddd-4ddd-8ddd-dddddddddddd',1,repeat('b',64),100000,3,10000); raise exception 'Input binding bypassed'; exception when invalid_parameter_value then null; end;
 if public.lease_ai_preview_request('11111111-1111-4111-8111-111111111111','dddddddd-dddd-4ddd-8ddd-dddddddddddd')<>'acquired' then raise exception 'Lease unavailable'; end if;
 if public.lease_ai_preview_request('11111111-1111-4111-8111-111111111111','dddddddd-dddd-4ddd-8ddd-dddddddddddd')<>'busy' then raise exception 'Concurrent provider request allowed'; end if;
 perform public.finish_ai_preview_request('11111111-1111-4111-8111-111111111111','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
 if public.lease_ai_preview_request('11111111-1111-4111-8111-111111111111','dddddddd-dddd-4ddd-8ddd-dddddddddddd')<>'acquired' then raise exception 'Failure retry blocked'; end if;
 perform public.finish_ai_preview_request('11111111-1111-4111-8111-111111111111','dddddddd-dddd-4ddd-8ddd-dddddddddddd',true);
 if public.lease_ai_preview_request('11111111-1111-4111-8111-111111111111','dddddddd-dddd-4ddd-8ddd-dddddddddddd')<>'complete' then raise exception 'Completed request executed again'; end if;
end $$;
insert into public.ai_messages(id,conversation_id,user_id,role,kind,body,request_id) values
 ('ffffffff-ffff-4fff-8fff-ffffffffffff','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','user','question','Question','99999999-9999-4999-8999-999999999999'),
 ('00000000-0000-4000-8000-000000000001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','assistant','answer','Answer','99999999-9999-4999-8999-999999999999');
do $$ begin
 if (select array_agg(role order by sequence) from public.ai_messages where request_id='99999999-9999-4999-8999-999999999999')<>array['user','assistant'] then raise exception 'Question/answer order depends on random UUID'; end if;
end $$;
rollback;
select 'PASS: owner isolation, deferred/active phone gates, private storage, field grants, OTP limits, user/global AI quotas, request binding and leases; all fixtures rolled back' as result;
