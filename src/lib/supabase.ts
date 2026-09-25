import { createClient } from '@supabase/supabase-js';
import * as ExpoCrypto from 'expo-crypto';
import { Platform } from 'react-native';

import { secureSessionStorage } from './secure-storage';
import { installNativeWebCrypto } from './native-webcrypto';

if (Platform.OS !== 'web') installNativeWebCrypto(globalThis, ExpoCrypto);

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serverMemory = new Map<string,string>();
const webSessionStorage = {
  async getItem(key:string){try{return typeof window==='undefined'?serverMemory.get(key)??null:window.localStorage.getItem(key)}catch{return serverMemory.get(key)??null}},
  async setItem(key:string,value:string){serverMemory.set(key,value);try{if(typeof window!=='undefined')window.localStorage.setItem(key,value)}catch{}},
  async removeItem(key:string){serverMemory.delete(key);try{if(typeof window!=='undefined')window.localStorage.removeItem(key)}catch{}},
};

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        storage: Platform.OS === 'web' ? webSessionStorage : secureSessionStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
        flowType: 'pkce',
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) throw new Error('Star Talks is not connected to Supabase yet. Add the project URL and publishable key to .env.local.');
  return supabase;
}
