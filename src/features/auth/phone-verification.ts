import type { User } from '@supabase/supabase-js';
import { requireSupabase } from '@/lib/supabase';

export function hasVerifiedPhone(user: User | null | undefined): boolean {
  return Boolean(user?.phone && user.phone_confirmed_at);
}

// WhatsApp OTP is a separately activated feature. Keep the actual verification
// predicate above strict; only the route gate is deferred until delivery works.
export function needsPhoneVerification(user: User | null | undefined): boolean {
  return process.env.EXPO_PUBLIC_REQUIRE_VERIFIED_PHONE === 'true' && !hasVerifiedPhone(user);
}

export function normalizeE164(input: string): string | null {
  const value = input.replace(/[\s()\-]/g, '');
  return /^\+[1-9]\d{7,14}$/.test(value) ? value : null;
}

export async function phoneVerificationCall<T extends {error?:string}>(action:'send'|'verify',payload:{phone?:string;code?:string}):Promise<T> {
  const {data,error}=await requireSupabase().functions.invoke('verify-whatsapp-phone',{body:{action,...payload}});
  if(error){
    let detail:string|undefined;
    try{detail=(await (error as {context?:Response}).context?.json() as {error?:string}|undefined)?.error;}catch{}
    throw new Error(detail||error.message||'Phone verification is unavailable.');
  }
  if(data?.error)throw new Error(data.error);
  return data as T;
}
