import { LinearGradient } from 'expo-linear-gradient';
import * as ExpoCrypto from 'expo-crypto';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ArrowLeft, EllipsisVertical, Gem, Send, ThumbsDown, ThumbsUp } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { back, Button, Card, Chip, go, Sheet } from '@/components/ui';
import { aiCall, type AiConversation, type AiFeedback, type AiMessage } from '@/features/ai/api';
import { moduleById } from '@/features/uiData/ai';
import { Colors } from '@/constants/theme';

const body = { fontFamily: 'Poppins_400Regular', fontSize: 11.8, lineHeight: 18.5, color: '#2B3270' } as const;
const reasons = ['Too generic', 'Did not answer', 'Incorrect interpretation', 'Unclear', 'Too long', 'Other'];

function Bubble({ children, mine, style }: { children: React.ReactNode; mine?: boolean; style?: object }) {
  return <View style={[{ borderRadius: 16, backgroundColor: mine ? '#E9E3FB' : '#F1EDFB', paddingHorizontal: 14, paddingVertical: 11 }, mine ? { alignSelf: 'flex-end', maxWidth: '84%' } : { borderTopLeftRadius: 4 }, style]}>{children}</View>;
}
const Avatar = () => <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#E6DFF7', alignItems: 'center', justifyContent: 'center' }}><Gem size={15} color="#5B4FB0" strokeWidth={1.8} /></View>;

export default function AiChat() {
  const params = useLocalSearchParams<{ module: string; conversationId?: string; profileId?: string; mediaId?: string }>();
  const m = moduleById(params.module);
  const [conversation, setConversation] = useState<AiConversation | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [restart, setRestart] = useState(0);
  const [menu, setMenu] = useState(false);
  const [feedback, setFeedback] = useState<AiMessage | null>(null);
  const [feedbackById,setFeedbackById]=useState<Record<string,AiFeedback>>({});
  const [feedbackReasons, setFeedbackReasons] = useState<string[]>([]);
  const [vote, setVote] = useState<boolean | null>(null);
  const [reportNote, setReportNote] = useState('');
  const [rename, setRename] = useState(false);
  const [title, setTitle] = useState('');
  const [consentNeeded, setConsentNeeded] = useState(false);
  const startRequest = useRef(ExpoCrypto.randomUUID());
  const scroll = useRef<ScrollView>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const consent = await aiCall<{accepted:{birth_and_questions:boolean};error?:string}>('get-consent');
        if (!consent.accepted.birth_and_questions) { if(active){setConsentNeeded(true);setLoading(false);} return; }
        if(active)setConsentNeeded(false);
        const result = params.conversationId
          ? await aiCall('get-conversation', { conversationId: params.conversationId })
          : await aiCall('start-reading', { moduleId: m.id, profileId: params.profileId, mediaId: params.mediaId, requestId: startRequest.current });
        if (active) { setConversation(result.conversation ?? null); setMessages(result.messages ?? []); setTitle(result.conversation?.title ?? '');setFeedbackById(Object.fromEntries((result.feedback??[]).map(item=>[item.message_id,item]))); }
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : 'Reading is unavailable.'); }
      finally { if (active) setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [m.id, params.conversationId, params.mediaId, params.profileId, restart]);

  const send = async (value: string) => {
    const question = value.trim();
    if (!conversation || question.length < 2 || busy) return;
    setBusy(true); setError('');
    const requestId = ExpoCrypto.randomUUID();
    try {
      const result = await aiCall('ask-module', { conversationId: conversation.id, question, requestId });
      setMessages(previous => [...previous, ...(result.messages ?? [])]);
      setText('');
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 100);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not send your question.'); }
    finally { setBusy(false); }
  };

  const acceptConsent = async () => {
    setBusy(true);setError('');
    try { await aiCall('accept-consent',{consentScope:'birth_and_questions'});setConsentNeeded(false);setLoading(true);setRestart(n=>n+1); }
    catch(cause){setError(cause instanceof Error?cause.message:'Consent could not be saved.');}
    finally{setBusy(false);}
  };

  const submitFeedback = async () => {
    if (!conversation || !feedback) return;
    try {
      await aiCall('submit-ai-feedback', { conversationId: conversation.id, messageId: feedback.id, helpful: vote, reasons: feedbackReasons, reportNote:reportNote.trim()||null });
      setFeedbackById(previous=>({...previous,[feedback.id]:{message_id:feedback.id,helpful:vote,reasons:feedbackReasons,report_note:reportNote.trim()||null,reported_at:reportNote.trim()?new Date().toISOString():null}}));
      setFeedback(null); setFeedbackReasons([]);setReportNote('');setVote(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save feedback.'); }
  };

  const saveTitle = async () => {
    if (!conversation || !title.trim()) return;
    try {
      await aiCall('rename-conversation', { conversationId: conversation.id, title: title.trim() });
      setConversation({ ...conversation, title: title.trim() }); setRename(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not rename conversation.'); }
  };

  const deleteConversation = () => {
    if (!conversation) return;
    Alert.alert('Delete conversation?', 'This removes this saved reading and its messages.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void (async () => {
        try { await aiCall('delete-conversation', { conversationId: conversation.id }); router.replace('/ai/history'); }
        catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not delete conversation.'); }
      })() },
    ]);
  };
  const deletePhoto = () => {
    if (!conversation) return;
    Alert.alert('Delete uploaded photo?', 'The saved reading remains, but new questions in this conversation will require a new photo and reading.', [
      {text:'Cancel',style:'cancel'},
      {text:'Delete photo',style:'destructive',onPress:()=>void aiCall('delete-reading-photo',{conversationId:conversation.id}).catch(cause=>setError(cause instanceof Error?cause.message:'Could not delete photo.'))},
    ]);
  };
  const openFeedback=(message:AiMessage,value:boolean|null)=>{const saved=feedbackById[message.id];setFeedback(message);setVote(value??saved?.helpful??null);setFeedbackReasons(saved?.reasons??[]);setReportNote(saved?.report_note??'');};

  const answerBody = (message: AiMessage) => {
    const payload = message.structured_payload;
    return <>
      <Text style={body}>{message.body}</Text>
      {payload?.supportingFactors?.length ? <View style={{ marginTop: 9 }}><Text style={{ ...body, fontFamily: 'Poppins_600SemiBold', color: Colors.navy }}>Why this reading</Text>{payload.supportingFactors.map((factor, index) => <Text key={`${factor.sourceRef}-${index}`} style={{ ...body, marginTop: 3 }}>{'•  '}{factor.explanation}</Text>)}</View> : null}
      {payload?.conflictingFactors?.length ? <View style={{ marginTop: 8 }}><Text style={{ ...body, fontFamily: 'Poppins_600SemiBold', color: Colors.navy }}>What may complicate it</Text>{payload.conflictingFactors.map((factor, index) => <Text key={`${factor.sourceRef}-${index}`} style={{ ...body, marginTop: 3 }}>{'•  '}{factor.explanation}</Text>)}</View> : null}
      {payload?.timing ? <Text style={{ ...body, marginTop: 8 }}>Timing: {payload.timing}</Text> : null}
      {payload?.uncertainty ? <Text style={{ ...body, marginTop: 8, color: Colors.slate }}>{payload.uncertainty}</Text> : null}
      <View style={{ flexDirection: 'row', gap: 14, marginTop: 10 }}>
        <Pressable hitSlop={8} accessibilityLabel="Helpful" onPress={() => openFeedback(message,true)}><ThumbsUp size={15} color={feedbackById[message.id]?.helpful===true?Colors.indigo:Colors.slate} /></Pressable>
        <Pressable hitSlop={8} accessibilityLabel="Not helpful" onPress={() => openFeedback(message,false)}><ThumbsDown size={15} color={feedbackById[message.id]?.helpful===false?Colors.indigo:Colors.slate} /></Pressable>
        <Pressable hitSlop={8} accessibilityLabel="Report response" onPress={() => openFeedback(message,null)}><Text style={{fontFamily:'Poppins_500Medium',fontSize:10,color:feedbackById[message.id]?.reported_at?Colors.indigo:Colors.slate}}>Report</Text></Pressable>
      </View>
    </>;
  };

  return <View style={{ flex: 1, backgroundColor: '#FCF7F3' }}>
    <LinearGradient colors={['#E6DDF6', '#F3EDF8', '#FCF7F3']} style={{ paddingBottom: 6 }}><SafeAreaView edges={['top']}>
      <View style={{ height: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 }}>
        <Pressable onPress={back} hitSlop={10} accessibilityLabel="Back" accessibilityRole="button"><ArrowLeft size={21} color={Colors.navy} /></Pressable>
        <View><Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: Colors.navy }}>{m.name}</Text>{conversation?.input_snapshot?.profileName?<Text style={{fontFamily:'Poppins_400Regular',fontSize:9,color:Colors.slate}}>Reading for {conversation.input_snapshot.profileName}</Text>:null}</View>
        <View style={{ height: 24, paddingHorizontal: 11, borderRadius: 12, backgroundColor: '#5B54B5', justifyContent: 'center' }}><Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 9.5, color: '#fff' }}>{m.badge}</Text></View>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => setMenu(true)} hitSlop={10} accessibilityLabel="More" accessibilityRole="button"><EllipsisVertical size={18} color={Colors.navy} /></Pressable>
      </View>
    </SafeAreaView></LinearGradient>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView ref={scroll} contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 4, paddingBottom: 14 }} showsVerticalScrollIndicator={false}>
        {loading ? <Text style={{ ...body, textAlign: 'center', padding: 22 }}>Preparing your {m.name} reading…</Text> : null}
        {error ? <Card style={{ borderRadius: 14, padding: 16, marginTop: 10 }}><Text accessibilityRole="alert" style={{ ...body, color: Colors.danger }}>{error}</Text>{!conversation ? <Button title={m.id === 'palmistry' || m.id === 'face-reading' ? 'Choose a photo' : error.includes('birth profile')?'Add birth profile':'Try again'} height={40} style={{ marginTop: 12 }} onPress={() => { if (m.id === 'palmistry' || m.id === 'face-reading') router.push(`/ai/upload?module=${m.id}` as Href); else if(error.includes('birth profile'))router.push('/profiles/new'); else { setLoading(true); setError(''); setRestart(n => n + 1); } }} /> : null}</Card> : null}
        {messages.map(message => {
          if (message.role === 'user') return <Bubble key={message.id} mine style={{ marginTop: 10 }}><Text style={{ ...body, color: Colors.navy }}>{message.body}</Text></Bubble>;
          if (message.kind === 'first') return <View key={message.id}>
            <Card style={{ borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8E9D6', alignItems: 'center', justifyContent: 'center' }}>{m.icon('#9A6A35', 20)}</View>
              <View style={{ flex: 1 }}><Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: m.titleColor ?? Colors.navy }}>{m.readingTitle}</Text>{m.readingSub ? <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11.5, color: Colors.navy }}>{m.readingSub}</Text> : null}</View>
            </Card>
            {m.id==='tarot'&&conversation?.input_snapshot?.tarotCards?.length?<View style={{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:8}}>{conversation.input_snapshot.tarotCards.map(card=><LinearGradient key={card.id} colors={['#28256E','#5C50A0']} style={{width:conversation.input_snapshot!.tarotCards!.length>3?'18%':'31%',minHeight:92,borderRadius:9,borderWidth:1,borderColor:'#DCC58E',alignItems:'center',justifyContent:'center',padding:5}}><Gem size={16} color="#E4C681" /><Text numberOfLines={2} style={{fontFamily:'Poppins_600SemiBold',fontSize:9,color:'#fff',textAlign:'center',marginTop:4}}>{card.cardName}</Text><Text style={{fontFamily:'Poppins_400Regular',fontSize:8,color:'#E9E4F7',textAlign:'center'}}>{card.position} • {card.orientation}</Text></LinearGradient>)}</View>:null}
            {message.structured_payload?.insights?.map((insight,index)=><Card key={`${message.id}:${index}`} style={{borderRadius:14,padding:12,marginTop:7,flexDirection:'row',gap:11,alignItems:'flex-start'}}><View style={{width:32,height:32,borderRadius:16,backgroundColor:m.tint,alignItems:'center',justifyContent:'center'}}>{m.icon(m.ink,16)}</View><View style={{flex:1}}><Text style={{fontFamily:'Poppins_600SemiBold',fontSize:12,color:Colors.navy}}>{insight.title}</Text><Text style={{...body,fontSize:10.5,lineHeight:16,marginTop:2}}>{insight.body}</Text></View></Card>)}
            {conversation?.input_snapshot?.warnings?.map((warning,index)=><View key={`${message.id}:warning:${index}`} style={{marginTop:8}}><Text style={{...body,fontSize:10.5,color:Colors.slate}}>{warning}</Text>{m.id==='numerology'&&warning.includes('full birth name')&&conversation.birth_profile_id?<Pressable onPress={()=>router.push({pathname:'/profiles/new',params:{id:conversation.birth_profile_id!}})} style={{paddingVertical:5}}><Text style={{fontFamily:'Poppins_500Medium',fontSize:11,color:Colors.indigo}}>Confirm birth name in profile</Text></Pressable>:null}</View>)}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}><Avatar /><Bubble style={{ flex: 1 }}>{answerBody(message)}</Bubble></View>
            {message.structured_payload?.followUps?.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginLeft: 42, marginTop: 10 }}>{message.structured_payload.followUps.map(chip => <Chip key={chip} label={chip} onPress={() => void send(chip)} style={{ height: 34, paddingHorizontal: 15, borderRadius: 17, backgroundColor: '#fff', borderColor: '#D9D4EC' }} />)}</View> : null}
          </View>;
          return <View key={message.id} style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}><Avatar /><Bubble style={{ flex: 1 }}>{message.kind === 'redirect' ? <><Text style={body}>{message.body}</Text><Button title="Switch module" height={38} style={{ marginTop: 10 }} onPress={() => go(`/ai/${message.structured_payload?.recommendedModuleId ?? 'modules'}`)} /></> : answerBody(message)}</Bubble></View>;
        })}
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#FCF7F3' }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingBottom: 10, paddingTop: 4 }}>
        <View style={{ flex: 1, height: 48, borderRadius: 24, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EFEAF5', paddingHorizontal: 18, justifyContent: 'center' }}><TextInput value={text} onChangeText={setText} onSubmitEditing={() => void send(text)} placeholder="Ask a question..." placeholderTextColor="#9AA0B8" returnKeyType="send" editable={Boolean(conversation) && !busy} style={{ fontFamily: 'Poppins_400Regular', fontSize: 12.5, color: Colors.ink, paddingVertical: 0 }} /></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Send" disabled={!conversation || busy} onPress={() => void send(text)} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: busy ? '#B9B4D8' : '#6B63C4', alignItems: 'center', justifyContent: 'center' }}><Send size={18} color="#fff" strokeWidth={1.9} /></Pressable>
      </View></SafeAreaView>
    </KeyboardAvoidingView>
    <Sheet visible={menu} onClose={() => setMenu(false)} items={[
      { label: 'Rename conversation', onPress: () => setRename(true) },
      { label: 'Conversation history', onPress: () => go('/ai/history') },
      { label: 'Switch module', onPress: () => go('/ai/modules') },
      { label: m.id==='tarot'?'Draw new cards':'New reading', onPress: () => router.push({pathname:'/ai/[module]',params:{module:m.id,nonce:ExpoCrypto.randomUUID()}}) },
      ...(m.id==='palmistry'||m.id==='face-reading'?[{label:'Delete uploaded photo',danger:true,onPress:deletePhoto}]:[]),
      { label: 'Delete conversation', danger: true, onPress: deleteConversation },
    ]} />
    <Sheet visible={rename} onClose={() => setRename(false)} title="Rename conversation"><TextInput value={title} onChangeText={setTitle} placeholder="Conversation title" style={{ borderWidth: 1, borderColor: '#D9D4EC', borderRadius: 10, padding: 10, fontFamily: 'Poppins_400Regular', fontSize: 13, color: Colors.navy, marginBottom: 12 }} /><Button title="Save title" onPress={() => void saveTitle()} /></Sheet>
    <Sheet visible={feedback !== null} onClose={() => setFeedback(null)} title="How was this response?">
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}><Button title="Helpful" variant={vote === true ? 'primary' : 'light'} height={42} style={{ flex: 1 }} onPress={() => setVote(true)} /><Button title="Not helpful" variant={vote === false ? 'primary' : 'light'} height={42} style={{ flex: 1 }} onPress={() => setVote(false)} /></View>
      <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 12, color: Colors.navy, marginBottom: 8 }}>What could improve?</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>{reasons.map(reason => <Chip key={reason} label={reason} on={feedbackReasons.includes(reason)} onPress={() => setFeedbackReasons(previous => previous.includes(reason) ? previous.filter(value => value !== reason) : [...previous, reason])} />)}</View>
      <TextInput value={reportNote} onChangeText={setReportNote} maxLength={1000} multiline placeholder="Report a safety or accuracy concern (optional)" placeholderTextColor={Colors.slate} style={{borderWidth:1,borderColor:'#D9D4EC',borderRadius:10,padding:10,minHeight:62,fontFamily:'Poppins_400Regular',fontSize:11,color:Colors.navy,marginBottom:12}} />
      <Button title="Submit feedback" height={46} onPress={() => void submitFeedback()} />
    </Sheet>
    <Sheet visible={consentNeeded} onClose={() => { setConsentNeeded(false); back(); }} title="Before your AI reading">
      <Text style={{ ...body, marginBottom: 14 }}>Star Talks sends the birth details you select, your questions, and relevant conversation context to its AI provider to create this reading. Your conversations are saved privately in your account so you can return to them. You can delete them from AI History and revoke future AI use in Settings.</Text>
      <Button title={busy?'Saving…':'I agree and continue'} disabled={busy} onPress={()=>void acceptConsent()} />
      <Button title="Not now" variant="light" style={{marginTop:8}} onPress={back} />
    </Sheet>
  </View>;
}
