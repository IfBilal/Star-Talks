import { useTheme } from '@/lib/theme-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Expand, X } from 'lucide-react-native';
import { PalmIcon } from '@/components/ui/icons';
import { Pressable, Text, View } from 'react-native';
import { PrimaryButton, Screen, Title } from '@/components/brand';
import { go } from '@/components/ui';

const examples = [
  { from: '#E5B9A8', to: '#D49C8A', tint: '#F3D8CD' },
  { from: '#C9A08C', to: '#B58670', tint: '#E8CFC1' },
  { from: '#F7E4DB', to: '#EBC6B8', tint: '#FFFFFF' },
];

export default function PalmPhotoScreen() {
  const { Colors: palette, themed } = useTheme();

  return (
    <Screen style={{ paddingTop: 34 }}>
      <View style={{ flex: 1 }}>
        <Title star subtitle={'This helps us give you a more accurate\npalm reading.'}>Upload Palm Photo</Title>

        <Pressable accessibilityRole="button" onPress={() => {}} style={{ height: 250, borderRadius: 14, borderWidth: 1.2, borderStyle: 'dashed', borderColor: themed('#D3CFDB', 'border'), alignItems: 'center', justifyContent: 'center', marginTop: 40 }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: themed('#F6EEE3', 'surface'), alignItems: 'center', justifyContent: 'center' }}>
            <PalmIcon size={62} color={palette.navy} strokeWidth={1.3} />
          </View>
          <Text style={{ marginTop: 28, fontFamily: 'Poppins_400Regular', fontSize: 12, color: palette.ink }}>
            <Text style={{ fontFamily: 'Poppins_600SemiBold' }}>Tap to upload</Text> or
          </Text>
          <Text style={{ marginTop: 2, fontFamily: 'Poppins_500Medium', fontSize: 12, color: themed('#3D6FC4', 'foreground') }}>choose from gallery</Text>
        </Pressable>

        <Text style={{ marginTop: 14, fontFamily: 'Poppins_500Medium', fontSize: 10.5, color: palette.ink }}>Examples</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          {examples.map((e, i) => (
            <LinearGradient key={i} colors={[e.from, e.to]} style={{ width: 84, height: 80, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <PalmIcon size={48} color={themed(e.tint, 'foreground')} strokeWidth={1.2} />
              {i === 2 ? <View style={{ position: 'absolute', top: 5, right: 5 }}><Expand size={11} color={themed("#2E9E5B", 'foreground')} strokeWidth={2.4} /></View> : null}
              {i === 2 ? <View style={{ position: 'absolute', bottom: 6, right: 6, width: 14, height: 14, borderRadius: 7, backgroundColor: themed('#D9434F', 'surface'), alignItems: 'center', justifyContent: 'center' }}><X size={9} color={themed("#fff", 'foreground')} strokeWidth={3} /></View> : null}
            </LinearGradient>
          ))}
        </View>
        <Text style={{ marginTop: 12, fontFamily: 'Poppins_400Regular', fontSize: 10.5, color: palette.ink }}>Make sure your palm is clear and well lit.</Text>

        <View style={{ flex: 1, minHeight: 16 }} />
        <PrimaryButton title="Continue" onPress={() => go('/permissions')} />
        <View style={{ height: 52 }} />
      </View>
    </Screen>
  );
}
