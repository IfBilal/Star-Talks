import { useTheme } from '@/lib/theme-context';
import { Award } from 'lucide-react-native';
import { AppBar, AppScreen, Card, go, ListRow } from '@/components/ui';

export default function Certificates() {
  const { themed } = useTheme();

  return (
    <AppScreen tab="profile" header={<AppBar title="Certificates" />} contentStyle={{ paddingTop: 6 }}>
      <Card style={{ borderRadius: 14 }}>
        <ListRow icon={c => <Award size={20} color={themed(c, 'foreground')} strokeWidth={1.6} />} title="Vedic Astrology Foundation" subtitle="Certificate ID VC-2025-001  •  12 Apr 2025" onPress={() => go('/courses/vedic-foundation/certificate')} style={{ minHeight: 70 }} />
      </Card>
    </AppScreen>
  );
}
