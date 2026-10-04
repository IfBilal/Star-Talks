import type { User } from '@supabase/supabase-js';

export function hasVerifiedPhone(user: User | null | undefined): boolean {
  return Boolean(user?.phone && user.phone_confirmed_at);
}

export function normalizeE164(input: string): string | null {
  const value = input.replace(/[\s()\-]/g, '');
  return /^\+[1-9]\d{7,14}$/.test(value) ? value : null;
}
