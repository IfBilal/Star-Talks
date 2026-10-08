import { hasVerifiedPhone, needsPhoneVerification } from './phone-verification';
import type { User } from '@supabase/supabase-js';

jest.mock('@/lib/supabase', () => ({ requireSupabase: jest.fn() }));
const unverified={phone:null,phone_confirmed_at:null} as unknown as User;
const verified={phone:'+15555550123',phone_confirmed_at:'2026-10-01T00:00:00Z'} as unknown as User;

describe('deferred phone verification',()=>{
  const previous=process.env.EXPO_PUBLIC_REQUIRE_VERIFIED_PHONE;
  afterAll(()=>{if(previous===undefined)delete process.env.EXPO_PUBLIC_REQUIRE_VERIFIED_PHONE;else process.env.EXPO_PUBLIC_REQUIRE_VERIFIED_PHONE=previous;});
  it('does not treat an unverified phone as verified',()=>{
    expect(hasVerifiedPhone(unverified)).toBe(false);
    expect(hasVerifiedPhone(verified)).toBe(true);
  });
  it('defers the route gate until explicitly enabled',()=>{
    delete process.env.EXPO_PUBLIC_REQUIRE_VERIFIED_PHONE;
    expect(needsPhoneVerification(unverified)).toBe(false);
    process.env.EXPO_PUBLIC_REQUIRE_VERIFIED_PHONE='true';
    expect(needsPhoneVerification(unverified)).toBe(true);
    expect(needsPhoneVerification(verified)).toBe(false);
  });
});
