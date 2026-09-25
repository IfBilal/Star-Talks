import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { ChevronDown, ChevronRight, CircleCheck, Eye, EyeOff, MapPin, Sparkles } from 'lucide-react-native';
import { useState, type PropsWithChildren, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Ellipse, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';
import { Colors, Radius } from '@/constants/theme';

export function Screen({ children, dark = false, scroll = false, style }: PropsWithChildren<{dark?: boolean; scroll?: boolean; style?: ViewStyle}>) {
  const inner = <View style={[styles.screenInner, style]}>{children}</View>;
  return <SafeAreaView style={[styles.safe, dark && styles.dark]} edges={['top','bottom']}>
    {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>{inner}</ScrollView> : inner}
  </SafeAreaView>;
}

export function BrandLogo({ size = 112, wordmark = false }: {size?: number; wordmark?: boolean}) {
  return <View style={{alignItems:'center'}}>
    <Image source={require('../../assets/images/star-talks-logo.png')} contentFit="contain" style={{width:size,height:size,borderRadius:size * .2}} />
    {wordmark && <Text style={styles.wordmark}>STAR TALKS</Text>}
  </View>;
}

export function Sunrise({height = 240}: {height?: number}) {
  return <View style={{height,width:'100%',overflow:'hidden'}}>
    <Svg width="100%" height="100%" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice">
      <Defs><SvgGradient id="sky" x1="0" y1="0" x2="0" y2="1"><Stop offset="0%" stopColor="#090A45"/><Stop offset="58%" stopColor="#17205F"/><Stop offset="100%" stopColor="#514486"/></SvgGradient><SvgGradient id="sun" x1="0" y1="0" x2="0" y2="1"><Stop offset="0%" stopColor="#FFF7DF"/><Stop offset="100%" stopColor="#E8BC73"/></SvgGradient></Defs>
      <Path d="M0 0h400v240H0z" fill="url(#sky)"/>
      {[23,55,92,128,166,214,249,286,327,369,388,75,304,188].map((x,i)=><Circle key={`${x}-${i}`} cx={x} cy={[18,43,26,61,34,57,22,48,31,65,14,82,91,104][i]} r={i%4===0?1.8:1.2} fill="#F9EBC6" opacity={i%3===0?.8:.55}/>) }
      <Circle cx="200" cy="188" r="69" fill="#F5D68B" opacity=".11"/><Circle cx="200" cy="188" r="43" fill="#F5D68B" opacity=".13"/><Circle cx="200" cy="188" r="34" fill="url(#sun)"/>
      <Path d="M0 171 28 175 51 161 79 169 104 151 133 162 158 147 183 164 210 155 236 164 264 150 291 162 316 145 345 159 370 150 400 166v74H0z" fill="#464079" opacity=".86"/>
      <Path d="M0 190q31-9 58 2t54-3q29-16 58 0t56-1q30-15 59 0t58-4q30-12 57 1v55H0z" fill="#252B5C"/>
      <Path d="M0 218q40-18 79-4t78 0q38-16 78-2t81 0q43-14 84 3v25H0z" fill="#171C5D"/>
    </Svg>
  </View>;
}

export function MapArtwork() {
  return <View style={{alignItems:'center',justifyContent:'center',height:205,opacity:.25}}><Svg width="100%" height="190" viewBox="0 0 380 190">
    <Path fill="#9B9B9D" d="m27 41 22-21 39 4 20 18-6 20-22 6-8 18-20-5-8-20-19 1zm62 52 26 3 15 18-8 23-13 31-18-10-6-23-14-15zm61-58 20-19 54 3 18 16 28-2 31 15 28-2 19 20-25 11-17 22-25-7-18 14-25-11-24 4-17-19-21 1-12-21-24-4zm83 92 15-19 25 4 17 15-7 25-26 13-23-14z"/>
  </Svg></View>;
}

export function Title({children, subtitle}: {children: ReactNode; subtitle?: string}) { return <View style={styles.titleBlock}><Text style={styles.title}>{children}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>; }
export function PrimaryButton({title,onPress,loading,disabled}: {title:string; onPress:()=>void; loading?:boolean; disabled?:boolean}) {return <Pressable accessibilityRole="button" disabled={disabled||loading} onPress={onPress} style={({pressed})=>[styles.primary, (pressed||disabled)&&{opacity:.8}]}><LinearGradient colors={['#302B86',Colors.indigo]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.primaryGradient}>{loading?<ActivityIndicator color="white"/>:<><Text style={styles.primaryText}>{title}</Text><ChevronRight color="white" size={18}/></>}</LinearGradient></Pressable>;}
export function TextField({label,icon,secure,...props}: TextInputProps & {label?:string;icon?:ReactNode;secure?:boolean}) {
  const [hidden,setHidden]=useState(secure??false);
  return <View style={styles.fieldWrap}>{label?<Text style={styles.fieldLabel}>{label}</Text>:null}<View style={styles.field}>{icon?<View style={styles.fieldIcon}>{icon}</View>:null}<TextInput placeholderTextColor="#9698A8" style={styles.input} secureTextEntry={secure?hidden:false} autoCapitalize={props.keyboardType==='email-address'?'none':props.autoCapitalize} {...props}/>{secure?<Pressable onPress={()=>setHidden(!hidden)}>{hidden?<Eye color={Colors.muted} size={18}/>:<EyeOff color={Colors.muted} size={18}/>}</Pressable>:null}</View></View>
}
export function SelectRow({children,selected,onPress,flag}: {children:string;selected:boolean;onPress:()=>void;flag?:string}){return <Pressable onPress={onPress} style={[styles.selectRow,selected&&styles.selectSelected]}><Text style={styles.flag}>{flag}</Text><Text style={styles.selectText}>{children}</Text><View style={[styles.radio,selected&&styles.radioOn]}>{selected?<CircleCheck size={17} color="white" fill={Colors.indigo}/>:null}</View></Pressable>}
export function ScreenDecoration(){return <View style={styles.decoration}><Svg width="100%" height="100%" viewBox="0 0 400 150"><Path d="M0 58q95 30 168-2t232 2v92H0z" fill="#EBE8FA"/><Path d="M0 86q100-35 185 8t215-12v68H0z" fill="#DBD6F4"/></Svg></View>}
export const Icon = { MapPin, ChevronDown, Sparkles };
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:Colors.ivory},dark:{backgroundColor:Colors.midnight},screenInner:{flex:1,paddingHorizontal:25,paddingTop:18,paddingBottom:14},scroll:{flexGrow:1},wordmark:{color:'white',fontFamily:'Poppins_600SemiBold',letterSpacing:4,fontSize:14,marginTop:8},titleBlock:{alignItems:'center',marginTop:15,marginBottom:18,width:'100%'},title:{fontFamily:'Poppins_600SemiBold',fontSize:23,color:Colors.indigo,textAlign:'center'},subtitle:{fontFamily:'Poppins_400Regular',fontSize:12,color:Colors.muted,textAlign:'center',marginTop:5},primary:{height:48,borderRadius:Radius.pill,overflow:'hidden',marginTop:17},primaryGradient:{flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8},primaryText:{fontFamily:'Poppins_600SemiBold',fontSize:14,color:'white'},fieldWrap:{marginBottom:12},fieldLabel:{fontFamily:'Poppins_500Medium',fontSize:12,color:Colors.text,marginBottom:5},field:{height:46,borderWidth:1,borderColor:'#E5E3DF',borderRadius:8,backgroundColor:'white',paddingHorizontal:12,flexDirection:'row',alignItems:'center',gap:9},input:{flex:1,color:Colors.text,fontFamily:'Poppins_400Regular',fontSize:12,paddingVertical:0},fieldIcon:{width:18,alignItems:'center'},selectRow:{height:51,backgroundColor:'white',borderWidth:1,borderColor:'#E9E7E3',borderRadius:9,paddingHorizontal:13,marginBottom:8,flexDirection:'row',alignItems:'center'},selectSelected:{borderColor:Colors.indigo},flag:{fontSize:18,width:30},selectText:{fontFamily:'Poppins_500Medium',fontSize:13,color:Colors.text,flex:1},radio:{width:19,height:19,borderWidth:1.5,borderColor:'#CACBD2',borderRadius:99,alignItems:'center',justifyContent:'center'},radioOn:{borderColor:Colors.indigo,backgroundColor:Colors.indigo},decoration:{height:92,position:'absolute',bottom:0,left:0,right:0,zIndex:0,pointerEvents:'none'}});
