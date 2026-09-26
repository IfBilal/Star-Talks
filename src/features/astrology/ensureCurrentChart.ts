import type { SupabaseClient } from '@supabase/supabase-js';
import { calculateChart, CALCULATOR_VERSION } from './chart';

export async function ensureCurrentChart(db: SupabaseClient, userId: string) {
  const { data: birthProfile, error: birthProfileError } = await db
    .from('birth_profiles')
    .select('id,birth_instant,birth_time_known,latitude,longitude,time_zone')
    .eq('user_id', userId)
    .eq('relationship', 'self')
    .maybeSingle();
  if (birthProfileError) throw birthProfileError;
  if (!birthProfile?.birth_time_known || !birthProfile.birth_instant) return;

  const { data: currentChart, error: chartError } = await db
    .from('calculated_charts')
    .select('id')
    .eq('birth_profile_id', birthProfile.id)
    .eq('calculator_version', CALCULATOR_VERSION)
    .maybeSingle();
  if (chartError) throw chartError;
  if (currentChart) return;

  const chart = calculateChart({
    birthInstant: birthProfile.birth_instant,
    latitude: birthProfile.latitude,
    longitude: birthProfile.longitude,
    timeKnown: birthProfile.birth_time_known,
    timeZone: birthProfile.time_zone,
  });
  const { error: saveError } = await db.from('calculated_charts').upsert({
    user_id: userId,
    birth_profile_id: birthProfile.id,
    calculator_version: CALCULATOR_VERSION,
    method_settings: {
      westernHouseSystem: chart.western.houseSystem,
      vedicHouseSystem: chart.vedic.houseSystem,
      ayanamsa: chart.vedic.ayanamsa,
    },
    chart_data: chart,
  }, { onConflict: 'birth_profile_id,calculator_version' });
  if (saveError) throw saveError;
}
