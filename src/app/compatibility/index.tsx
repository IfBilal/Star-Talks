import { Briefcase, Check, Heart, HeartHandshake, Hand, Users, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppBar, AppScreen, Avatar, Button, Card, F, go } from '@/components/ui';
import { PalmIcon } from '@/components/ui/icons';
import { PEOPLE } from '@/features/uiData/profiles';
import { Colors } from '@/constants/theme';

const types = [
  { id: 'Love', icon: <Heart size={16} color={Colors.navy} strokeWidth={1.7} /> },
  { id: 'Marriage', icon: <UserRound size={16} color={Colors.navy} strokeWidth={1.7} /> },
  { id: 'Friendship', icon: <Users size={16} color={Colors.navy} strokeWidth={1.7} /> },
  { id: 'Business', icon: <Briefcase size={16} color={Colors.navy} strokeWidth={1.7} /> },
];

export default function CompatibilityHome() {
  const [t, setT] = useState('Love');
  const [a, b] = [PEOPLE[0], PEOPLE[1]];
  return (
    <AppScreen tab="profile" header={<AppBar brand={false} title="Compatibility Analysis" />} contentStyle={{ paddingTop: 0 }}>
      <Text style={{ fontFamily: F.r, fontSize: 11.5, color: Colors.navy, marginBottom: 12 }}>Discover your relationship dynamics and compatibility.</Text>
      <View style={{ flexDirection: 'row' }}>
        {[a, b].map((p, i) => (
          <Pressable key={p.id} accessibilityRole="button" onPress={() => go('/profiles')} style={{ flex: 1, height: 150, backgroundColor: '#FFFDFB', borderWidth: 1, borderColor: '#F0EAF3', borderTopLeftRadius: i === 0 ? 16 : 0, borderBottomLeftRadius: i === 0 ? 16 : 0, borderTopRightRadius: i === 1 ? 16 : 0, borderBottomRightRadius: i === 1 ? 16 : 0, alignItems: 'center', paddingTop: 14 }}>
            <Avatar name={p.name} size={54} bg="#E6E0F6" />
            <Text style={{ fontFamily: F.s, fontSize: 12.5, color: Colors.navy, marginTop: 10 }}>{p.name}</Text>
            <Text style={{ fontFamily: F.r, fontSize: 10, color: Colors.slate, marginTop: 4 }}>{p.dob}</Text>
            <Text style={{ fontFamily: F.r, fontSize: 10, color: Colors.slate, marginTop: 2 }}>{`${p.time}  •  ${p.place}`}</Text>
          </Pressable>
        ))}
        <View style={{ position: 'absolute', left: '50%', top: 40, marginLeft: -30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#F6F1FC', alignItems: 'center', justifyContent: 'center' }}>
          <Heart size={28} color="#5B54B5" strokeWidth={1.6} />
        </View>
      </View>
      <Text style={{ fontFamily: F.s, fontSize: 13, color: Colors.navy, marginTop: 18, marginBottom: 10 }}>Select Compatibility Type</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {types.map(x => (
          <Pressable key={x.id} accessibilityRole="button" onPress={() => setT(x.id)} style={{ width: '31.4%', height: 46, borderRadius: 14, backgroundColor: t === x.id ? '#EEE9FB' : '#FFFDFB', borderWidth: t === x.id ? 1.6 : 1, borderColor: t === x.id ? '#5B54B5' : '#F0EAF3', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 7 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#EFEAF9', alignItems: 'center', justifyContent: 'center' }}>{x.icon}</View>
            <Text style={{ fontFamily: F.m, fontSize: 11, color: Colors.navy }}>{x.id}</Text>
          </Pressable>
        ))}
      </View>
      <Button title="Get Compatibility Analysis" height={50} style={{ borderRadius: 14, marginTop: 18 }} onPress={() => go('/compatibility/result')} />
      <Card style={{ marginTop: 16, padding: 16, borderRadius: 15, flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.s, fontSize: 13, color: Colors.navy, marginBottom: 10 }}>What You'll Get</Text>
          {['Compatibility score', 'Strengths & challenges', 'Relationship dynamics', 'Timing / important periods'].map(x => (
            <View key={x} style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 8 }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 1.2, borderColor: Colors.navy, alignItems: 'center', justifyContent: 'center' }}><Check size={10} color={Colors.navy} strokeWidth={3} /></View>
              <Text style={{ fontFamily: F.r, fontSize: 11, color: '#3B4373' }}>{x}</Text>
            </View>
          ))}
        </View>
        <View style={{ width: 120, borderRadius: 12, backgroundColor: '#F4EFFA', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
          <View style={{ transform: [{ rotate: '-14deg' }] }}><PalmIcon size={44} color="#8A84D6" strokeWidth={1.2} /></View>
          <View style={{ transform: [{ rotate: '14deg' }] }}><PalmIcon size={44} color="#E58A8A" strokeWidth={1.2} /></View>
        </View>
      </Card>
    </AppScreen>
  );
}
