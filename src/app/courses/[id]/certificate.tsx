import { Download, Share2 } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppBar, AppScreen, Button, F } from '@/components/ui';
import { Colors } from '@/constants/theme';

export function Certificate({ name = 'Neha Sharma', course = 'Vedic Astrology Foundation', id = 'VC-2025-001', date = '12 Apr 2025' }: { name?: string; course?: string; id?: string; date?: string }) {
  const corner = (style: object) => (
    <View style={[{ position: 'absolute', width: 30, height: 30 }, style]}>
      <Svg width={30} height={30} viewBox="0 0 30 30" fill="none">
        <Path d="M2 28V8C2 4.7 4.7 2 8 2H28" stroke="#D3A046" strokeWidth="1.4" />
        <Path d="M7 24V12C7 9.8 8.8 8 11 8H24" stroke="#D3A046" strokeWidth="0.8" />
        <Circle cx="5" cy="5" r="1.6" fill="#D3A046" />
      </Svg>
    </View>
  );
  return (
    <View style={{ backgroundColor: '#FBF4E7', padding: 7, borderRadius: 6, shadowColor: '#6A4B12', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}>
      <View style={{ borderWidth: 1.6, borderColor: '#D9AB55', padding: 6 }}>
        <View style={{ borderWidth: 0.8, borderColor: '#E3BE78', paddingHorizontal: 16, paddingTop: 22, paddingBottom: 20, alignItems: 'center' }}>
          {corner({ top: -1, left: -1 })}
          {corner({ top: -1, right: -1, transform: [{ scaleX: -1 }] })}
          {corner({ bottom: -1, left: -1, transform: [{ scaleY: -1 }] })}
          {corner({ bottom: -1, right: -1, transform: [{ scale: -1 }] })}
          <Image source={require('../../../../assets/images/star-talks-mark.png')} contentFit="contain" style={{ width: 70, height: 34 }} />
          <Text style={{ fontFamily: F.caps, fontSize: 15, letterSpacing: 4, color: '#2B3270', marginTop: 4 }}>STAR TALKS</Text>
          <View style={{ width: 70, height: 1, backgroundColor: '#E0BD7E', marginTop: 10 }} />
          <Text style={{ fontFamily: F.serifM, fontSize: 22, color: '#7A4A1D', marginTop: 14, textAlign: 'center' }}>Certificate of Completion</Text>
          <View style={{ width: 90, height: 1, backgroundColor: '#E0BD7E', marginTop: 12 }} />
          <Text style={{ fontFamily: F.r, fontSize: 11, color: '#3A4585', marginTop: 16 }}>This certifies that</Text>
          <Text style={{ fontFamily: F.serif, fontSize: 24, color: '#1F2A6B', marginTop: 10 }}>{name}</Text>
          <Text style={{ fontFamily: F.r, fontSize: 10.5, color: '#3A4585', marginTop: 12 }}>has successfully completed the course</Text>
          <Text style={{ fontFamily: F.serif, fontSize: 19, color: '#1F2A6B', marginTop: 12, textAlign: 'center' }}>{course}</Text>
          <View style={{ width: 90, height: 1, backgroundColor: '#E0BD7E', marginTop: 14 }} />
          <Text style={{ fontFamily: F.r, fontSize: 11, color: '#3A4585', marginTop: 14 }}>{`Course ID: ${id}`}</Text>
          <Text style={{ fontFamily: F.r, fontSize: 11, color: '#3A4585', marginTop: 8 }}>{`Completion Date: ${date}`}</Text>
          <View style={{ alignSelf: 'stretch', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 26 }}>
            <View>
              <Svg width={96} height={34} viewBox="0 0 96 34" fill="none">
                <Path d="M4 26C12 6 20 4 22 14C24 24 14 28 12 22C18 12 32 6 40 14C48 22 52 12 60 10C68 8 74 14 82 10" stroke="#3B3B6B" strokeWidth="1.4" strokeLinecap="round" />
              </Svg>
              <View style={{ height: 1, backgroundColor: '#C9B99B', width: 100 }} />
              <Text style={{ fontFamily: F.r, fontSize: 8.5, color: '#3A4585', marginTop: 3 }}>Head of Education</Text>
            </View>
            <Svg width={54} height={54} viewBox="0 0 54 54">
              <Path d="M27 2l5 4 6-1 3 5 6 2-1 6 4 5-4 5 1 6-6 2-3 5-6-1-5 4-5-4-6 1-3-5-6-2 1-6-4-5 4-5-1-6 6-2 3-5 6 1Z" fill="#CF9B3F" stroke="#B7832C" strokeWidth="1" />
              <Circle cx="27" cy="27" r="14" fill="none" stroke="#F2D895" strokeWidth="1.2" />
              <Path d="M27 15c1 7 4 10 11 12c-7 1-10 4-11 12c-1-8-4-11-11-12c7-2 10-5 11-12Z" fill="#F2D895" />
            </Svg>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function CertificateScreen() {
  return (
    <AppScreen tab="profile" header={<AppBar title="Course Completed" align="center" />} pad={16} contentStyle={{ paddingTop: 6 }}>
      <Certificate />
      <Button title="Download Certificate" height={48} style={{ borderRadius: 12, marginTop: 18 }} icon={<Download size={18} color="#fff" />} onPress={() => {}} />
      <Button title="Share Certificate" variant="outline" height={48} style={{ borderRadius: 12, marginTop: 10 }} icon={<Share2 size={17} color={Colors.navy} />} onPress={() => {}} />
    </AppScreen>
  );
}
