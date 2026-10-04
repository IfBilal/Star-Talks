import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ExpoCrypto from 'expo-crypto';
import { File } from 'expo-file-system';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera, ImagePlus, ShieldCheck, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppBar, AppScreen, Button, Card, F } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { requireSupabase } from '@/lib/supabase';

export default function AiUpload() {
  const { module } = useLocalSearchParams<{ module?: string }>();
  const kind = module === 'face-reading' ? 'face' : 'palm';
  const [uri, setUri] = useState('');
  const [consent, setConsent] = useState(false);
  const [hand, setHand] = useState<'left'|'right'>('right');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const choose = async (camera: boolean) => {
    setMessage('');
    try {
      const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) { setMessage(`Allow ${camera ? 'camera' : 'photo library'} access in device settings, or choose the other option.`); return; }
      const result = camera ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, allowsMultipleSelection: false });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      if (asset.width < 300 || asset.height < 300) throw new Error('Choose a clearer photo at least 300 pixels wide and tall.');
      const edit = ImageManipulator.ImageManipulator.manipulate(asset.uri);
      if (asset.width > 1280) edit.resize({ width: 1280 });
      const rendered = await edit.renderAsync();
      const saved = await rendered.saveAsync({ compress: 0.82, format: ImageManipulator.SaveFormat.JPEG });
      setUri(saved.uri);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not open that photo.'); }
  };

  const upload = async () => {
    if (busy || !uri || !consent) return;
    setBusy(true); setMessage('');
    try {
      const db = requireSupabase();
      const { data: { user }, error: authError } = await db.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Please sign in again.');
      const bytes = await new File(uri).arrayBuffer();
      if (bytes.byteLength > 10 * 1024 * 1024) throw new Error('This image is too large. Choose a smaller one.');
      const path = `${user.id}/${kind}/${ExpoCrypto.randomUUID()}.jpg`;
      const { error: uploadError } = await db.storage.from('ai-private').upload(path, bytes, { contentType: 'image/jpeg', upsert: false });
      if (uploadError) throw uploadError;
      const { data: media, error: saveError } = await db.from('ai_media').insert({ user_id: user.id, kind, storage_path: path, mime_type: 'image/jpeg', metadata: kind === 'palm' ? { hand } : {}, consent_at: new Date().toISOString() }).select('id').single();
      if (saveError || !media) { await db.storage.from('ai-private').remove([path]); throw saveError ?? new Error('Photo could not be saved.'); }
      router.replace({ pathname: '/ai/[module]', params: { module: kind === 'palm' ? 'palmistry' : 'face-reading', mediaId: media.id } });
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Upload failed. Please try again.'); }
    finally { setBusy(false); }
  };

  return <AppScreen header={<AppBar title={kind === 'palm' ? 'Upload Palm Photo' : 'Upload Face Photo'} />} contentStyle={{ paddingTop: 10 }}>
    <Text style={{ fontFamily: F.s, fontSize: 20, color: Colors.navy, textAlign: 'center' }}>{kind === 'palm' ? 'Your palm, clearly seen' : 'A clear front-facing photo'}</Text>
    <Text style={{ fontFamily: F.r, fontSize: 11, lineHeight: 18, color: Colors.slate, textAlign: 'center', marginTop: 5, marginBottom: 17 }}>{kind === 'palm' ? 'Show the whole palm and fingers, with sharp lines, even light and no face in the background.' : 'Face the camera in even light, with your full face visible and no heavy filter.'}</Text>
    <Card style={{ minHeight: 228, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#D3CFDB', padding: 10, alignItems: 'center', justifyContent: 'center' }}>
      {uri ? <Image source={{ uri }} contentFit="contain" style={{ width: '100%', height: 210, borderRadius: 10 }} /> : <><ImagePlus size={32} color={Colors.indigo} /><Text style={{ fontFamily: F.m, fontSize: 12, color: Colors.navy, marginTop: 8 }}>Choose a photo to preview</Text></>}
    </Card>
    <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}><Button title="Camera" icon={<Camera size={16} color="#fff" />} style={{ flex: 1 }} onPress={() => void choose(true)} /><Button title="Gallery" variant="light" icon={<ImagePlus size={16} color={Colors.navy} />} style={{ flex: 1 }} onPress={() => void choose(false)} /></View>
    {uri ? <Pressable onPress={() => setUri('')} style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, padding: 12 }}><Trash2 size={15} color={Colors.danger} /><Text style={{ fontFamily: F.m, fontSize: 11, color: Colors.danger }}>Remove and choose another</Text></Pressable> : null}
    {kind === 'palm' ? <View style={{ marginTop: 12 }}><Text style={{ fontFamily: F.m, fontSize: 12, color: Colors.navy, marginBottom: 8 }}>Which hand is shown?</Text><View style={{ flexDirection: 'row', gap: 10 }}>{(['left','right'] as const).map(value => <Pressable key={value} onPress={() => setHand(value)} style={{ flex: 1, padding: 11, borderRadius: 10, backgroundColor: hand === value ? '#5B54B5' : '#fff', alignItems: 'center' }}><Text style={{ fontFamily: F.m, fontSize: 12, color: hand === value ? '#fff' : Colors.navy }}>{value === 'left' ? 'Left hand' : 'Right hand'}</Text></Pressable>)}</View></View> : null}
    <Pressable onPress={() => setConsent(value => !value)} accessibilityRole="checkbox" accessibilityState={{ checked: consent }} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 20, padding: 8 }}>
      <View style={{ width: 20, height: 20, borderRadius: 5, borderWidth: 1, borderColor: Colors.indigo, backgroundColor: consent ? Colors.indigo : '#fff', alignItems: 'center', justifyContent: 'center' }}>{consent ? <ShieldCheck size={14} color="#fff" /> : null}</View>
      <Text style={{ flex: 1, fontFamily: F.r, fontSize: 10.5, lineHeight: 17, color: Colors.navy }}>I agree to upload this {kind} photo to private storage and send it to the AI provider for the reading I requested. I can delete the photo later.</Text>
    </Pressable>
    {message ? <Text accessibilityRole="alert" style={{ fontFamily: F.r, color: Colors.danger, fontSize: 11, marginTop: 10 }}>{message}</Text> : null}
    <Button title={busy ? 'Uploading…' : 'Continue to Reading'} disabled={!uri || !consent || busy} height={50} style={{ borderRadius: 14, marginTop: 16 }} onPress={() => void upload()} />
  </AppScreen>;
}
