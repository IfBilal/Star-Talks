import { Camera, CalendarDays, ChevronDown, Clock3, MapPin } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppBar, AppScreen, Button, Field, F, go, OutlineField, replace, Sheet, Stepper } from '@/components/ui';
import { Colors } from '@/constants/theme';

function Upload({ label, sub }: { label: string; sub: string }) {
  return (
    <Pressable accessibilityRole="button" style={{ height: 120, borderRadius: 14, borderWidth: 1.2, borderStyle: 'dashed', borderColor: '#D3CFDB', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      <Camera size={22} color={Colors.navy} strokeWidth={1.6} />
      <Text style={{ fontFamily: F.s, fontSize: 11.5, color: Colors.navy }}>{label}</Text>
      <Text style={{ fontFamily: F.r, fontSize: 10, color: Colors.slate }}>{sub}</Text>
    </Pressable>
  );
}

export default function NewProfile() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [rel, setRel] = useState('');
  const [relOpen, setRelOpen] = useState(false);
  const [gender, setGender] = useState('Female');
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');
  return (
    <AppScreen header={<AppBar title="Add New Profile" right={<Image source={require('../../../assets/images/star-talks-mark.png')} contentFit="contain" style={{ width: 40, height: 20 }} />} />} contentStyle={{ paddingTop: 6 }}>
      <Stepper steps={['Personal', 'Birth Details', 'Optional']} current={step} />
      {step === 0 ? (
        <>
          <Field label="Name *" placeholder="Enter name" value={name} onChangeText={setName} />
          <Text style={{ fontFamily: F.m, fontSize: 12, color: Colors.ink, marginBottom: 6 }}>Relationship *</Text>
          <Pressable onPress={() => setRelOpen(true)} style={{ height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#E6E1EF', backgroundColor: '#fff', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontFamily: F.r, fontSize: 12, color: rel ? Colors.ink : '#9AA0B8' }}>{rel || 'Select relationship'}</Text>
            <ChevronDown size={17} color={Colors.navy} />
          </Pressable>
          <Text style={{ fontFamily: F.m, fontSize: 12, color: Colors.ink, marginBottom: 8 }}>Gender</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
            {['Male', 'Female', 'Other'].map(g => (
              <Pressable key={g} onPress={() => setGender(g)} style={{ flex: 1, height: 42, borderRadius: 10, backgroundColor: gender === g ? '#4B4FAE' : '#fff', borderWidth: 1, borderColor: gender === g ? '#4B4FAE' : '#ECE7F4', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: F.m, fontSize: 12, color: gender === g ? '#fff' : Colors.navy }}>{g}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={{ fontFamily: F.m, fontSize: 12, color: Colors.ink, marginBottom: 8 }}>Palm Image (Optional)</Text>
          <Upload label="Upload palm image" sub="(for Palmistry AI)" />
        </>
      ) : step === 1 ? (
        <>
          <OutlineField label="Date of Birth" value={dob} onChangeText={setDob} placeholder="12 Mar 1995" right={<CalendarDays size={18} color={Colors.navy} />} />
          <OutlineField label="Time of Birth" value={time} onChangeText={setTime} placeholder="10:30 AM" right={<Clock3 size={18} color={Colors.navy} />} />
          <OutlineField label="Place of Birth" value={place} onChangeText={setPlace} placeholder="Search city or town" right={<MapPin size={18} color={Colors.navy} />} />
          <Text style={{ fontFamily: F.r, fontSize: 10.5, color: Colors.slate, marginTop: 14 }}>Not sure about the time? You can still get a general reading.</Text>
        </>
      ) : (
        <>
          <Text style={{ fontFamily: F.m, fontSize: 12, color: Colors.ink, marginBottom: 8 }}>Face Photo (Optional)</Text>
          <Upload label="Upload face photo" sub="(for Face Reading AI)" />
          <Text style={{ fontFamily: F.r, fontSize: 11, lineHeight: 17, color: Colors.slate, marginTop: 14 }}>Photos are only used for the reading you request and can be deleted anytime from Privacy Settings.</Text>
        </>
      )}
      <Button title={step < 2 ? 'Next' : 'Save Profile'} height={50} style={{ borderRadius: 14, marginTop: 22 }} onPress={() => (step < 2 ? setStep(step + 1) : replace('/profiles'))} />
      {step > 0 ? <Pressable onPress={() => setStep(step - 1)} style={{ alignItems: 'center', padding: 14 }}><Text style={{ fontFamily: F.m, fontSize: 12, color: Colors.navy }}>Back</Text></Pressable> : null}
      <Sheet visible={relOpen} onClose={() => setRelOpen(false)} title="Relationship" items={['Family', 'Partner', 'Friend', 'Child', 'Other'].map(r => ({ label: r, onPress: () => setRel(r) }))} />
    </AppScreen>
  );
}
