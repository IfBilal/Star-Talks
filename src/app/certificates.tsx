import { Award } from 'lucide-react-native';
import { AppBar, AppScreen, Card, go, ListRow } from '@/components/ui';

export default function Certificates() {
  return (
    <AppScreen tab="profile" header={<AppBar title="Certificates" />} contentStyle={{ paddingTop: 6 }}>
      <Card style={{ borderRadius: 14 }}>
        <ListRow icon={c => <Award size={20} color={c} strokeWidth={1.6} />} title="Vedic Astrology Foundation" subtitle="Certificate ID VC-2025-001  •  12 Apr 2025" onPress={() => go('/courses/vedic-foundation/certificate')} style={{ minHeight: 70 }} />
      </Card>
    </AppScreen>
  );
}
