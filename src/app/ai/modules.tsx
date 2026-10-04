import { Search } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { AppBar, AppScreen, Card, ListRow, Type } from '@/components/ui';
import { MODULES } from '@/features/uiData/ai';
import { Colors } from '@/constants/theme';
import { aiCall } from '@/features/ai/api';

export default function ModuleSelection() {
  const { profileId } = useLocalSearchParams<{ profileId?: string }>();
  const [searchOpen,setSearchOpen]=useState(false);
  const [query,setQuery]=useState('');
  const [availability,setAvailability]=useState<Record<string,boolean>|null>(null);
  const [serviceMessage,setServiceMessage]=useState('');
  useEffect(()=>{let active=true;void aiCall<{modules:{id:string;available:boolean}[];error?:string}>('list-modules').then(result=>{if(active)setAvailability(Object.fromEntries(result.modules.map(item=>[item.id,item.available])));}).catch(cause=>{if(active)setServiceMessage(cause instanceof Error?cause.message:'AI modules are unavailable.');});return()=>{active=false};},[]);
  const visible=MODULES.filter(module=>`${module.name} ${module.tagline}`.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <AppScreen header={<AppBar brand={false} title="AI Astrology" right={<Pressable onPress={()=>setSearchOpen(value=>!value)} accessibilityRole="button" accessibilityLabel="Search AI modules" hitSlop={10}><Search size={19} color={Colors.navy} /></Pressable>} />} contentStyle={{ paddingTop: 10 }}>
      <Text style={[Type.h1, { fontSize: 19 }]}>Choose a Module</Text>
      <Text style={[Type.body, { color: Colors.navy, marginTop: 3, marginBottom: 14, fontSize: 12.5 }]}>Select your preferred astrology system</Text>
      {serviceMessage?<Text accessibilityRole="alert" style={[Type.body,{color:Colors.danger,marginBottom:12}]}>{serviceMessage}</Text>:null}
      {searchOpen?<TextInput value={query} onChangeText={setQuery} placeholder="Search modules" autoFocus style={{height:42,borderRadius:11,borderWidth:1,borderColor:'#E5DDF1',backgroundColor:'#fff',paddingHorizontal:12,marginBottom:12,fontSize:12,color:Colors.navy}} />:null}
      <View style={{ gap: 7 }}>
        {visible.map(m => (
          <Card key={m.id} style={{ borderRadius: 14 }}>
            <ListRow
              icon={() => m.icon(m.ink, 22)}
              tileBg={m.tint}
              title={m.name}
              subtitle={availability&&availability[m.id]===false?'Temporarily unavailable':m.tagline}
              chevron={Boolean(availability?.[m.id])}
              onPress={availability?.[m.id]?() => router.push({pathname:'/ai/[module]',params:{module:m.id,...(profileId?{profileId}:{})}}):undefined}
              style={{ minHeight: 68,opacity:availability?.[m.id]?1:0.5 }}
            />
          </Card>
        ))}
        {!visible.length?<Text style={[Type.body,{textAlign:'center',marginTop:18}]}>No modules match your search.</Text>:null}
      </View>
    </AppScreen>
  );
}
