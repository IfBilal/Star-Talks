import type { SupabaseClient } from '@supabase/supabase-js';
import { calculateChart, CALCULATOR_VERSION } from './chart';

export async function ensureChartForProfile(db: SupabaseClient, userId: string, profileId: string) {
  const { data: profile, error: profileError } = await db.from('birth_profiles')
    .select('id,birth_instant,birth_time_known,latitude,longitude,time_zone')
    .eq('id', profileId).eq('user_id', userId).single();
  if (profileError) throw profileError;
  if (!profile.birth_time_known || !profile.birth_instant) return null;

  const inputFingerprint = JSON.stringify([
    profile.birth_instant, profile.latitude, profile.longitude, profile.time_zone,
    profile.birth_time_known, CALCULATOR_VERSION,
  ]);
  const { data: saved, error: readError } = await db.from('calculated_charts')
    .select('chart_data,input_fingerprint').eq('birth_profile_id', profile.id)
    .eq('calculator_version', CALCULATOR_VERSION).maybeSingle();
  if (readError) throw readError;
  if (saved?.input_fingerprint === inputFingerprint) return saved.chart_data;

  const chart = calculateChart({
    birthInstant: profile.birth_instant,
    latitude: profile.latitude,
    longitude: profile.longitude,
    timeKnown: profile.birth_time_known,
    timeZone: profile.time_zone,
  });
  const { error: saveError } = await db.from('calculated_charts').upsert({
    user_id: userId,
    birth_profile_id: profile.id,
    calculator_version: CALCULATOR_VERSION,
    input_fingerprint: inputFingerprint,
    method_settings: {
      westernHouseSystem: chart.western.houseSystem,
      vedicHouseSystem: chart.vedic.houseSystem,
      ayanamsa: chart.vedic.ayanamsa,
    },
    chart_data: chart,
  }, { onConflict: 'birth_profile_id,calculator_version' });
  if (saveError) throw saveError;
  return chart;
}

export async function ensureCurrentChart(db: SupabaseClient, userId: string) {
  const { data, error } = await db.from('birth_profiles').select('id')
    .eq('user_id', userId).eq('relationship', 'self').maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return ensureChartForProfile(db, userId, data.id);
}
