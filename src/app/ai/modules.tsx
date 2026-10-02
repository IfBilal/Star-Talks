import { ChevronRight, Search } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { AppBar, AppScreen, Card, go, ListRow, Type } from '@/components/ui';
import { MODULES } from '@/features/uiData/ai';
import { Colors } from '@/constants/theme';

export default function ModuleSelection() {
  return (
    <AppScreen header={<AppBar brand={false} title="AI Astrology" right={<Search size={19} color={Colors.navy} />} />} contentStyle={{ paddingTop: 10 }}>
      <Text style={[Type.h1, { fontSize: 19 }]}>Choose a Module</Text>
      <Text style={[Type.body, { color: Colors.navy, marginTop: 3, marginBottom: 14, fontSize: 12.5 }]}>Select your preferred astrology system</Text>
      <View style={{ gap: 7 }}>
        {MODULES.map(m => (
          <Card key={m.id} style={{ borderRadius: 14 }}>
            <ListRow
              icon={() => m.icon(m.ink, 22)}
              tileBg={m.tint}
              title={m.name}
              subtitle={m.tagline}
              onPress={() => go(`/ai/${m.id}`)}
              style={{ minHeight: 68 }}
            />
          </Card>
        ))}
      </View>
    </AppScreen>
  );
}
