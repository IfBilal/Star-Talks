import { router, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppBar, AppScreen, Button, Card, F, Segmented } from '@/components/ui';
import { CosmicBg } from '@/components/ui/art';
import { aiCall, type AiConversation } from '@/features/ai/api';
import { Colors } from '@/constants/theme';

type Analysis={id:string;relationship_type:string;module_id:string;created_at:string;result:{firstName:string;secondName:string;score:number|null;scoreExplanation:string;overview:string;strengths:string[];challenges:string[];dynamics:string;longTermOutlook:string;timing:string|null;warnings:string[]}};
const tabs=['Overview','Strengths','Challenges','Timing'];

export default function CompatibilityResult() {
  const {id}=useLocalSearchParams<{id?:string}>();
  const [tab,setTab]=useState('Overview');
  const [analysis,setAnalysis]=useState<Analysis|null>(null);
  const [stale,setStale]=useState(false);
  const [error,setError]=useState(id?'':'Select a saved compatibility analysis first.');
  const [chatBusy,setChatBusy]=useState(false);
  useEffect(()=>{if(!id)return;let alive=true;void aiCall<{analysis:Analysis;stale:boolean;error?:string}>('get-compatibility',{analysisId:id}).then(data=>{if(alive){setAnalysis(data.analysis);setStale(data.stale);}}).catch(cause=>{if(alive)setError(cause instanceof Error?cause.message:'Analysis is unavailable.');});return()=>{alive=false};},[id]);
  const openChat=async()=>{if(!analysis||chatBusy)return;setChatBusy(true);setError('');try{const result=await aiCall<{conversation:AiConversation;error?:string}>('open-compatibility-chat',{analysisId:analysis.id});router.push({pathname:'/ai/[module]',params:{module:result.conversation.module_id,conversationId:result.conversation.id}});}catch(cause){setError(cause instanceof Error?cause.message:'Compatibility chat could not be opened.');}finally{setChatBusy(false);}};
  const result=analysis?.result;
  const list=tab==='Strengths'?result?.strengths:tab==='Challenges'?result?.challenges:null;
  return <AppScreen header={<AppBar brand />} footer={analysis?<View style={{paddingHorizontal:16,paddingBottom:8,flexDirection:'row',gap:10}}><Button title="Saved Analysis" variant="light" height={46} style={{borderRadius:12,flex:1}} disabled onPress={()=>{}} /><Button title={chatBusy?'Opening…':'Ask AI About This'} height={46} style={{borderRadius:12,flex:1}} disabled={chatBusy} onPress={()=>void openChat()} /></View>:undefined} contentStyle={{paddingTop:2}}>
    {error?<Card style={{padding:18,borderRadius:14}}><Text accessibilityRole="alert" style={{fontFamily:F.r,fontSize:12,color:Colors.danger}}>{error}</Text></Card>:null}
    {!analysis&&!error?<Text style={{fontFamily:F.r,fontSize:12,color:Colors.slate,textAlign:'center',marginTop:30}}>Loading saved analysis…</Text>:null}
    {analysis&&result?<>
      {stale?<Card style={{padding:12,borderRadius:12,marginBottom:10,backgroundColor:'#FFF3DE'}}><Text style={{fontFamily:F.m,fontSize:11,color:Colors.navy}}>Based on earlier profile details</Text><Text style={{fontFamily:F.r,fontSize:10,color:Colors.slate,marginTop:3}}>A profile changed after this analysis was saved. Create a new analysis for current inputs.</Text><Pressable onPress={()=>router.push('/compatibility')} style={{paddingVertical:6}}><Text style={{fontFamily:F.m,fontSize:11,color:Colors.indigo}}>Create new analysis</Text></Pressable></Card>:null}
      <View style={{height:150,borderRadius:16,overflow:'hidden'}}><CosmicBg colors={['#22236F','#34308A','#4D3F9A']} style={{flex:1,padding:18,justifyContent:'center'}}>
        <Text numberOfLines={1} style={{fontFamily:F.serifM,fontSize:24,color:'#fff',maxWidth:'68%'}}>{result.firstName} &amp; {result.secondName}</Text>
        <Text style={{fontFamily:F.m,fontSize:13,color:'#fff',marginTop:8}}>{analysis.relationship_type[0].toUpperCase()+analysis.relationship_type.slice(1)} Compatibility</Text>
        <View style={{position:'absolute',right:14,top:16,alignItems:'center'}}><View style={{width:86,height:86,alignItems:'center',justifyContent:'center'}}><Svg width={86} height={86} viewBox="0 0 86 86"><Circle cx="43" cy="43" r="39" fill="none" stroke="#E9C77F" strokeWidth="3" /><Circle cx="43" cy="43" r="31" fill="none" stroke="#E9C77F" strokeWidth="0.8" opacity="0.5" /></Svg><Text style={{position:'absolute',fontFamily:F.serifM,fontSize:26,color:'#fff'}}>{result.score===null?'✦':`${result.score}%`}</Text></View><View style={{marginTop:-10,backgroundColor:'#F6E6C4',borderRadius:10,paddingHorizontal:10,paddingVertical:3}}><Text style={{fontFamily:F.m,fontSize:9.5,color:'#6B4A12'}}>{result.score===null?'Tarot Spread':'Symbolic Alignment'}</Text></View></View>
      </CosmicBg></View>
      <Text style={{fontFamily:F.r,fontSize:9.5,color:Colors.slate,marginTop:7}}>{result.scoreExplanation}</Text>
      <View style={{marginTop:10}}><Segmented items={tabs} value={tab} onChange={setTab} /></View>
      {tab==='Overview'?<>
        <Card style={{marginTop:14,padding:16,borderRadius:14}}><Text style={{fontFamily:F.s,fontSize:14,color:Colors.navy}}>Key Insights</Text><Text style={{fontFamily:F.r,fontSize:12,lineHeight:19,color:'#3B4373',marginTop:8}}>{result.overview}</Text><Text style={{fontFamily:F.r,fontSize:11,lineHeight:18,color:Colors.slate,marginTop:8}}>{result.dynamics}</Text></Card>
        <Card style={{marginTop:12,padding:16,borderRadius:14}}><Text style={{fontFamily:F.s,fontSize:14,color:Colors.navy}}>Long-term Outlook</Text><Text style={{fontFamily:F.r,fontSize:12,lineHeight:19,color:'#3B4373',marginTop:8}}>{result.longTermOutlook}</Text></Card>
      </>:tab==='Timing'?<Card style={{marginTop:14,padding:16,borderRadius:14}}><Text style={{fontFamily:F.s,fontSize:14,color:Colors.navy}}>Timing</Text><Text style={{fontFamily:F.r,fontSize:12,lineHeight:19,color:'#3B4373',marginTop:8}}>{result.timing??'No reliable joint timing window was calculated from these inputs.'}</Text>{result.warnings?.map(warning=><Text key={warning} style={{fontFamily:F.r,fontSize:10.5,color:Colors.slate,marginTop:8}}>{warning}</Text>)}</Card>:<Card style={{marginTop:14,padding:16,borderRadius:14}}><Text style={{fontFamily:F.s,fontSize:14,color:Colors.navy}}>{tab}</Text>{list?.map(item=><View key={item} style={{flexDirection:'row',alignItems:'center',gap:10,marginTop:11}}><View style={{width:18,height:18,borderRadius:9,borderWidth:1.3,borderColor:Colors.navy,alignItems:'center',justifyContent:'center'}}><Check size={11} color={Colors.navy} strokeWidth={3} /></View><Text style={{flex:1,fontFamily:F.r,fontSize:12,color:'#3B4373'}}>{item}</Text></View>)}</Card>}
      <Pressable onPress={()=>router.push('/compatibility')} style={{alignSelf:'center',padding:14}}><Text style={{fontFamily:F.m,fontSize:11,color:Colors.navy}}>Saved automatically • New analysis</Text></Pressable>
    </>:null}
  </AppScreen>;
}
