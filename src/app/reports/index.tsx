import { useTheme } from '@/lib/theme-context';
import { Orbit, BriefcaseBusiness, CircleUserRound, FilePlus2, GraduationCap, Heart, Plus, Sparkle, Wallet } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { AppBar, AppScreen, Card, go, ListRow, useTypography } from '@/components/ui';

const types = [
  { icon: (c: string) => <Orbit size={20} color={c} strokeWidth={1.6} />, title: 'Birth Chart Report', sub: 'Your cosmic blueprint' },
  { icon: (c: string) => <CircleUserRound size={20} color="#6A4FA6" strokeWidth={1.6} />, title: 'Personality Report', sub: 'Understand your true self' },
  { icon: (c: string) => <BriefcaseBusiness size={20} color="#8B2E55" strokeWidth={1.6} />, title: 'Career Report', sub: 'Find your ideal career path' },
  { icon: (c: string) => <Heart size={20} color="#C2416C" strokeWidth={1.7} />, title: 'Love & Marriage Report', sub: 'Relationships & compatibility', bg: '#FCE3EA' },
  { icon: (c: string) => <Wallet size={20} color={c} strokeWidth={1.6} />, title: 'Finance Report', sub: 'Wealth & financial growth' },
  { icon: (c: string) => <GraduationCap size={20} color={c} strokeWidth={1.6} />, title: 'Education Report', sub: 'Learning & higher studies' },
  { icon: (c: string) => <FilePlus2 size={20} color={c} strokeWidth={1.6} />, title: 'More Reports', sub: undefined },
] as { icon: (c: string) => React.ReactNode; title: string; sub?: string; bg?: string }[];

export default function ReportsHome() {
  const { Colors: palette, themed } = useTheme();
  const Type = useTypography();

  return (
    <AppScreen tab="reports" header={<AppBar brand centerLogo right={<View style={{ flexDirection: 'row', gap: 12 }}><Sparkle size={14} color={palette.slate} /><Plus size={15} color={palette.slate} /></View>} />} contentStyle={{ paddingTop: 10 }}>
      <Text style={[Type.h1, { fontSize: 22 }]}>Astrology Reports</Text>
      <Text style={[Type.body, { color: palette.slate, marginTop: 3, marginBottom: 16, fontSize: 12.5 }]}>Discover what the stars reveal about you</Text>
      <View style={{ gap: 7 }}>
        {types.map(r => (
          <Card key={r.title} style={{ borderRadius: 13 }}>
            <ListRow icon={r.icon} tileBg={themed(r.bg, 'surface')} title={r.title} subtitle={r.sub} onPress={() => go('/reports/birth-details')} style={{ minHeight: 60 }} />
          </Card>
        ))}
      </View>
    </AppScreen>
  );
}
