import { replace } from '@/components/ui';
import { Camera, Images } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Linking, Pressable, Text, View } from 'react-native';
import { PrimaryButton, Screen, Title } from '@/components/brand';
import { Colors } from '@/constants/theme';

function BlueToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable onPress={() => onChange(!value)} accessibilityRole="switch" accessibilityState={{ checked: value }} style={{ width: 44, height: 26, borderRadius: 13, padding: 3, backgroundColor: value ? '#2F6ADB' : '#D9D7E2', alignItems: value ? 'flex-end' : 'flex-start', justifyContent: 'center' }}>
      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' }} />
    </Pressable>
  );
}

export default function PermissionsScreen() {
  const [camera, setCamera] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [notice,setNotice]=useState('');
  useEffect(()=>{void Promise.all([ImagePicker.getCameraPermissionsAsync(),ImagePicker.getMediaLibraryPermissionsAsync()]).then(([c,g])=>{setCamera(c.granted);setGallery(g.granted);});},[]);
  const requestCamera=async(next:boolean)=>{if(!next){setNotice('To turn off camera access, change it in device settings.');await Linking.openSettings();return;}const status=await ImagePicker.requestCameraPermissionsAsync();setCamera(status.granted);if(!status.granted)setNotice('Camera access can be changed in device settings. You can also choose a gallery photo later.');};
  const requestGallery=async(next:boolean)=>{if(!next){setNotice('To turn off photo access, change it in device settings.');await Linking.openSettings();return;}const status=await ImagePicker.requestMediaLibraryPermissionsAsync();setGallery(status.granted);if(!status.granted)setNotice('Photo access can be changed in device settings. You can also use the camera later.');};
  const items = [
    { icon: Camera, title: 'Camera', text: 'To take palm or face photos for readings', value: camera, set: (next:boolean) => void requestCamera(next) },
    { icon: Images, title: 'Photo Gallery', text: 'To choose palm or face photos for readings', value: gallery, set: (next:boolean) => void requestGallery(next) },
  ];
  return (
    <Screen style={{ paddingTop: 34 }}>
      <View style={{ flex: 1 }}>
        <Title star subtitle={'We need a few permissions to give\nyou the best experience.'}>Allow Access</Title>
        <View style={{ gap: 14, marginTop: 6 }}>
          {items.map(({ icon: Icon, title, text, value, set }) => (
            <View key={title} style={{ minHeight: 118, borderRadius: 16, borderWidth: 1, borderColor: '#EFEAEA', backgroundColor: '#FFFDFA', padding: 16, flexDirection: 'row', gap: 12 }}>
              <Icon size={22} color={Colors.navy} strokeWidth={1.8} style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: Colors.navy }}>{title}</Text>
                <Text style={{ marginTop: 5, fontFamily: 'Poppins_400Regular', fontSize: 10.5, lineHeight: 17, color: Colors.slate }}>{text}</Text>
              </View>
              <BlueToggle value={value} onChange={set} />
            </View>
          ))}
        </View>
        {notice?<Text accessibilityRole="alert" style={{fontFamily:'Poppins_400Regular',fontSize:11,color:Colors.slate,marginTop:12}}>{notice}</Text>:null}
        <View style={{ flex: 1, minHeight: 16 }} />
        <PrimaryButton title="Continue" onPress={() => replace('/home')} />
        <Pressable onPress={() => replace('/home')} style={{ alignItems: 'center', padding: 12 }}>
          <Text style={{ color: Colors.muted, fontSize: 11, fontFamily: 'Poppins_400Regular' }}>Not now</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
