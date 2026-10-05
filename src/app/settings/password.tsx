import { useTheme } from '@/lib/theme-context';
import { Eye, EyeOff, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppBar, AppScreen, Button, F, Field, back } from '@/components/ui';

export default function ChangePassword() {
  const { Colors: palette } = useTheme();

  const [show, setShow] = useState(false);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const eye = <Pressable onPress={() => setShow(!show)}>{show ? <EyeOff size={17} color={palette.slate} /> : <Eye size={17} color={palette.slate} />}</Pressable>;
  return (
    <AppScreen header={<AppBar title="Change Password" />} footer={<View style={{ paddingHorizontal: 16, paddingBottom: 10 }}><Button title="Update Password" height={50} style={{ borderRadius: 14 }} onPress={back} /></View>} contentStyle={{ paddingTop: 8 }}>
      <Field label="Current password" icon={<Lock size={16} color={palette.slate} />} right={eye} secureTextEntry={!show} value={a} onChangeText={setA} placeholder="Current password" />
      <Field label="New password" icon={<Lock size={16} color={palette.slate} />} right={eye} secureTextEntry={!show} value={b} onChangeText={setB} placeholder="New password" />
      <Field label="Confirm new password" icon={<Lock size={16} color={palette.slate} />} right={eye} secureTextEntry={!show} value={c} onChangeText={setC} placeholder="Re-enter new password" />
      <Text style={{ fontFamily: F.r, fontSize: 10.5, lineHeight: 16, color: palette.slate }}>Use at least 8 characters with a mix of letters and numbers.</Text>
    </AppScreen>
  );
}
