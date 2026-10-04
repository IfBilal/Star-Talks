import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { CalendarDays, ChevronDown, Clock3, MapPin } from 'lucide-react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';
import tzLookup from 'tz-lookup';
import { AppBar, AppScreen, Button, Field, F, OutlineField, Sheet, Stepper } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { ensureChartForProfile } from '@/features/astrology/ensureCurrentChart';
import { resolveLocalBirthTime } from '@/features/birth/timezone';
import { searchBirthplaces, type Place } from '@/features/places/geoapify';
import { requireSupabase } from '@/lib/supabase';

const apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY ?? '';
const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const dateValue = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const timeValue = (d: Date) => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:00`;

export default function NewProfile() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [rel, setRel] = useState('');
  const [relOpen, setRelOpen] = useState(false);
  const [gender, setGender] = useState('Female');
  const [dob, setDob] = useState(new Date(1995, 0, 12));
  const [birthTime, setBirthTime] = useState(new Date(1995, 0, 12, 10, 30));
  const [timeKnown, setTimeKnown] = useState(true);
  const [picker, setPicker] = useState<'date'|'time'|null>(null);
  const [placeQuery, setPlaceQuery] = useState('');
  const [place, setPlace] = useState<Place | null>(null);
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const db = requireSupabase();
      const { data, error } = await db.from('birth_profiles').select('*').eq('id', id).single();
      if (error) { setMessage(error.message); return; }
      setName(data.display_name);
      setRel(data.relationship[0].toUpperCase() + data.relationship.slice(1));
      setGender(data.gender || 'Other');
      const [year, month, day] = data.birth_date.split('-').map(Number);
      setDob(new Date(year, month - 1, day));
      if (data.birth_time) { const [hour, minute] = data.birth_time.split(':').map(Number); setBirthTime(new Date(year, month - 1, day, hour, minute)); }
      setTimeKnown(data.birth_time_known);
      setPlace({ id: data.id, label: data.place_label, lat: data.latitude, lon: data.longitude });
      setPlaceQuery(data.place_label);
    })();
  }, [id]);

  useEffect(() => {
    if (place || placeQuery.trim().length < 3) return;
    const timer = setTimeout(async () => {
      abort.current?.abort();
      const controller = new AbortController(); abort.current = controller;
      setSearching(true);
      try { const found = await searchBirthplaces(placeQuery, apiKey, controller.signal); if (!controller.signal.aborted) setResults(found); }
      catch (error) { if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : 'Place search failed.'); }
      finally { if (!controller.signal.aborted) setSearching(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [place, placeQuery]);

  const onPicker = (event: DateTimePickerEvent, value?: Date) => {
    if (Platform.OS === 'android') setPicker(null);
    if (event.type !== 'set' || !value) return;
    if (picker === 'date') setDob(value); else setBirthTime(value);
  };

  const next = async () => {
    if (step === 0) {
      if (name.trim().length < 2 || !rel) { setMessage('Enter a name and choose a relationship.'); return; }
      setMessage(''); setStep(1); return;
    }
    if (step === 1) {
      if (!place) { setMessage('Select a place from the search results.'); return; }
      setMessage(''); setStep(2); return;
    }
    if (!place || busy) return;
    setBusy(true); setMessage('');
    try {
      const zone = tzLookup(place.lat, place.lon);
      let instant: string | null = null;
      if (timeKnown) {
        const result = resolveLocalBirthTime({ year: dob.getFullYear(), month: dob.getMonth() + 1, day: dob.getDate(), hour: birthTime.getHours(), minute: birthTime.getMinutes() }, zone);
        if (result.status !== 'resolved') throw new Error(result.status === 'ambiguous' ? 'This local birth time occurred twice. Please confirm the correct historical time offset.' : 'This local birth time did not occur because of a clock change. Please correct it.');
        instant = result.instant.toISOString();
      }
      const db = requireSupabase();
      const { data: { user }, error: authError } = await db.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Please sign in again.');
      const payload = {
        user_id: user.id, display_name: name.trim(), numerology_name: /^[A-Za-zÀ-ž\s.'-]+$/.test(name.trim()) ? name.trim() : null, relationship: rel.toLowerCase(), gender,
        birth_date: dateValue(dob), birth_time: timeKnown ? timeValue(birthTime) : null,
        birth_time_known: timeKnown, place_label: place.label, latitude: place.lat,
        longitude: place.lon, time_zone: zone, birth_instant: instant,
      };
      const query = id ? db.from('birth_profiles').update(payload).eq('id', id).eq('user_id', user.id) : db.from('birth_profiles').insert(payload);
      const { data, error } = await query.select('id').single();
      if (error) throw error;
      if (instant) await ensureChartForProfile(db, user.id, data.id);
      else { const result = await db.from('calculated_charts').delete().eq('birth_profile_id', data.id); if (result.error) throw result.error; }
      router.replace('/profiles');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save profile.'); }
    finally { setBusy(false); }
  };

  return <AppScreen header={<AppBar title={id ? 'Edit Profile' : 'Add New Profile'} right={<Image source={require('../../../assets/images/star-talks-mark.png')} contentFit="contain" style={{ width: 40, height: 20 }} />} />} contentStyle={{ paddingTop: 6 }}>
    <Stepper steps={['Personal', 'Birth Details', 'Review']} current={step} />
    {step === 0 ? <>
      <Field label="Full Name *" placeholder="Enter full name" value={name} onChangeText={setName} />
      <Text style={{ fontFamily: F.m, fontSize: 12, color: Colors.ink, marginBottom: 6 }}>Relationship *</Text>
      <Pressable onPress={() => setRelOpen(true)} style={{ height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#E6E1EF', backgroundColor: '#fff', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}><Text style={{ fontFamily: F.r, fontSize: 12, color: rel ? Colors.ink : '#9AA0B8' }}>{rel || 'Select relationship'}</Text><ChevronDown size={17} color={Colors.navy} /></Pressable>
      <Text style={{ fontFamily: F.m, fontSize: 12, color: Colors.ink, marginBottom: 8 }}>Gender</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>{['Male', 'Female', 'Other'].map(g => <Pressable key={g} onPress={() => setGender(g)} style={{ flex: 1, height: 42, borderRadius: 10, backgroundColor: gender === g ? '#4B4FAE' : '#fff', borderWidth: 1, borderColor: gender === g ? '#4B4FAE' : '#ECE7F4', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: F.m, fontSize: 12, color: gender === g ? '#fff' : Colors.navy }}>{g}</Text></Pressable>)}</View>
      <Text style={{ fontFamily: F.r, fontSize: 10.5, color: Colors.slate }}>Use the full birth name for name-based Numerology. You can edit it later.</Text>
    </> : step === 1 ? <>
      <OutlineField label="Date of Birth" value={formatDate(dob)} onPress={() => setPicker('date')} right={<CalendarDays size={18} color={Colors.navy} />} />
      <OutlineField label="Time of Birth" value={timeKnown ? birthTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Unknown'} onPress={() => timeKnown && setPicker('time')} right={<Clock3 size={18} color={Colors.navy} />} />
      <Pressable onPress={() => setTimeKnown(value => !value)} style={{ padding: 11, alignSelf: 'flex-start' }}><Text style={{ fontFamily: F.m, fontSize: 11, color: Colors.navy }}>{timeKnown ? 'I do not know the birth time' : 'I know the birth time'}</Text></Pressable>
      <OutlineField label="Place of Birth" value={placeQuery} onChangeText={value => { setPlace(null); setPlaceQuery(value); setResults([]); }} placeholder="Search city or town" right={<MapPin size={18} color={Colors.navy} />} />
      {searching ? <ActivityIndicator color={Colors.indigo} /> : null}
      {results.map(item => <Pressable key={item.id} onPress={() => { setPlace(item); setPlaceQuery(item.label); setResults([]); }} style={{ padding: 11, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' }}><Text style={{ fontFamily: F.r, fontSize: 11, color: Colors.navy }}>{item.label}</Text></Pressable>)}
      <Text style={{ fontFamily: F.r, fontSize: 10.5, color: Colors.slate, marginTop: 14 }}>Unknown time limits house, rising-sign and hour-pillar readings.</Text>
      {picker ? <DateTimePicker value={picker === 'date' ? dob : birthTime} mode={picker} display={Platform.OS === 'ios' ? 'spinner' : 'default'} maximumDate={picker === 'date' ? new Date() : undefined} onChange={onPicker} /> : null}
    </> : <>
      <Text style={{ fontFamily: F.s, fontSize: 18, color: Colors.navy, marginBottom: 15 }}>Review birth profile</Text>
      {[["Name",name],["Relationship",rel],["Date",formatDate(dob)],["Time",timeKnown ? birthTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Unknown'],["Place",place?.label ?? '']].map(([label,value]) => <View key={label} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E9E5F0' }}><Text style={{ fontFamily: F.r, fontSize: 10, color: Colors.slate }}>{label}</Text><Text style={{ fontFamily: F.m, fontSize: 12, color: Colors.navy }}>{value}</Text></View>)}
    </>}
    {message ? <Text accessibilityRole="alert" style={{ fontFamily: F.r, fontSize: 11, color: Colors.danger, marginTop: 12 }}>{message}</Text> : null}
    <Button title={step < 2 ? 'Next' : 'Save Profile'} height={50} disabled={busy} style={{ borderRadius: 14, marginTop: 22 }} onPress={() => void next()} />
    {step > 0 ? <Pressable onPress={() => { setMessage(''); setStep(step - 1); }} style={{ alignItems: 'center', padding: 14 }}><Text style={{ fontFamily: F.m, fontSize: 12, color: Colors.navy }}>Back</Text></Pressable> : null}
    <Sheet visible={relOpen} onClose={() => setRelOpen(false)} title="Relationship" items={['Family', 'Partner', 'Friend', 'Child', 'Other'].map(r => ({ label: r, onPress: () => setRel(r) }))} />
  </AppScreen>;
}
