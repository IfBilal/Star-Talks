import { useTheme } from '@/lib/theme-context';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { AppBar, AppScreen, Card, F, Toggle } from '@/components/ui';
import { aiCall } from '@/features/ai/api';

const pages: Record<string, { title: string; sections: [string, string][] }> = {
  privacy: { title: 'Privacy Policy', sections: [['What we collect', 'Your name, email, birth date, time and place, and any photos you choose to upload for a reading.'], ['How we use it', 'To create charts and readings, selected birth details, questions and consented photos are sent to our AI provider. Your AI conversations are saved in your account. We do not sell your data.'], ['Your rights', 'You can delete AI history and manage future AI consent from Account Settings.']] },
  terms: { title: 'Terms & Conditions', sections: [['Using Star Talks', 'Readings are for guidance and entertainment and are not guaranteed predictions or professional advice.'], ['AI preview', 'AI readings currently use a daily preview limit. The app does not deduct AI credits during this milestone.'], ['Your account', 'Keep your login secure. You can manage your data in Account Settings.']] },
  data: { title: 'Data Protection', sections: [['How your data is stored', 'Birth details and AI records are stored in your private account. Reading photos use a private storage bucket.'], ['Who can see it', 'Your account can access its own saved records. The AI service receives selected information only after you consent to a reading.'], ['Deletion', 'You can remove AI history and uploaded reading photos from Account Settings. Backup and provider retention follow their respective service policies.']] },
};

export default function Legal() {
  const { Colors: palette, themed } = useTheme();

  const { page } = useLocalSearchParams<{ page: string }>();
  const [c, setC] = useState({ birth_and_questions: false, palm_image: false, face_image: false });
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>{if(page!=='consent')return;let active=true;void aiCall<{accepted:typeof c;error?:string}>('get-consent').then(result=>{if(active)setC(result.accepted);}).catch(cause=>{if(active)setMessage(cause instanceof Error?cause.message:'Consent could not be loaded.');});return()=>{active=false};},[page]);
  const setConsent=async(scope:keyof typeof c,value:boolean)=>{if(busy)return;setBusy(true);setMessage('');try{await aiCall(value?'accept-consent':'revoke-consent',{consentScope:scope});setC(previous=>({...previous,[scope]:value}));}catch(cause){setMessage(cause instanceof Error?cause.message:'Consent could not be changed.');}finally{setBusy(false);}};
  if (page === 'consent') {
    const rows: [keyof typeof c, string, string][] = [['birth_and_questions', 'AI birth details & questions', 'Send selected birth details, questions and conversation context to the AI provider.'], ['palm_image', 'Palm photos', 'Send a selected palm photo for a Palmistry reading.'], ['face_image', 'Face photos', 'Send a selected face photo for a Face Reading.']];
    return (
      <AppScreen header={<AppBar title="Consent Management" />} contentStyle={{ paddingTop: 6 }}>
        <Text style={{ fontFamily: F.r, fontSize: 11.5, lineHeight: 18, color: palette.slate, marginBottom: 12 }}>Choose how your information is used. You can change this at any time.</Text>
        <Card style={{ borderRadius: 14 }}>
          {rows.map(([k, t, s], i) => (
            <View key={k} style={{ minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, borderBottomWidth: i < rows.length - 1 ? 1 : 0, borderBottomColor: themed('#EFEBF6', 'border') }}>
              <View style={{ flex: 1 }}><Text style={{ fontFamily: F.s, fontSize: 12.5, color: palette.navy }}>{t}</Text><Text style={{ fontFamily: F.r, fontSize: 10.5, color: palette.slate, marginTop: 2 }}>{s}</Text></View>
              <Toggle value={c[k]} onChange={v => void setConsent(k,v)} />
            </View>
          ))}
        </Card>
        {message?<Text accessibilityRole="alert" style={{fontFamily:F.r,fontSize:11,color:palette.danger,marginTop:10}}>{message}</Text>:null}
        <Text style={{fontFamily:F.r,fontSize:10.5,lineHeight:17,color:palette.slate,marginTop:12}}>Turning off consent stops future AI requests using that data. To remove saved readings and uploaded photos, delete your AI history in Account Settings.</Text>
      </AppScreen>
    );
  }
  const p = pages[page] ?? pages.privacy;
  return (
    <AppScreen header={<AppBar title={p.title} />} contentStyle={{ paddingTop: 6 }}>
      <View style={{ gap: 14 }}>
        {p.sections.map(([h, b]) => (
          <Card key={h} style={{ borderRadius: 14, padding: 16 }}>
            <Text style={{ fontFamily: F.s, fontSize: 13, color: palette.navy }}>{h}</Text>
            <Text style={{ fontFamily: F.r, fontSize: 12, lineHeight: 19, color: palette.ink, marginTop: 6 }}>{b}</Text>
          </Card>
        ))}
      </View>
    </AppScreen>
  );
}
