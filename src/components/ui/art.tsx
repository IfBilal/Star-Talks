import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';

const STARS = [[10, 14], [24, 62], [38, 28], [52, 80], [66, 18], [80, 48], [91, 12], [15, 84], [72, 88], [45, 50]];

/** Dark cosmic card background with scattered stars. */
export function CosmicBg({ children, style, colors = ['#1B1C5E', '#2F2A80', '#4B3F99'] }: { children?: ReactNode; style?: StyleProp<ViewStyle>; colors?: [string, string, string] }) {
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[{ overflow: 'hidden' }, style]}>
      {STARS.map(([x, y], i) => (
        <View key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: i % 3 === 0 ? 2.4 : 1.6, height: i % 3 === 0 ? 2.4 : 1.6, borderRadius: 2, backgroundColor: '#F6E9C5', opacity: i % 2 ? 0.55 : 0.85 }} />
      ))}
      {children}
    </LinearGradient>
  );
}

/** Seated meditating figure in front of a glowing golden mandala. */
export function Meditator({ size = 150 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 150 150">
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="48%" r="50%">
          <Stop offset="0" stopColor="#F4D48F" stopOpacity="0.85" />
          <Stop offset="0.55" stopColor="#B99AE8" stopOpacity="0.25" />
          <Stop offset="1" stopColor="#3B3A90" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="75" cy="68" r="72" fill="url(#glow)" />
      <Circle cx="75" cy="68" r="50" fill="none" stroke="#E8C77F" strokeWidth="1" opacity="0.8" />
      <Circle cx="75" cy="68" r="62" fill="none" stroke="#E8C77F" strokeWidth="0.8" opacity="0.5" />
      <Circle cx="75" cy="68" r="38" fill="none" stroke="#E8C77F" strokeWidth="0.8" opacity="0.6" />
      <Path d="M75 6V130M13 68H137M31 24L119 112M119 24L31 112" stroke="#E8C77F" strokeWidth="0.6" opacity="0.45" />
      <Circle cx="75" cy="46" r="8.5" fill="#15164F" />
      <Path d="M63 62c2-7 6-10 12-10s10 3 12 10l4 22c-7 3-21 3-28 0Z" fill="#15164F" />
      <Path d="M44 100c8-10 20-14 31-14s23 4 31 14c-10 6-20 9-31 9s-21-3-31-9Z" fill="#15164F" />
      <Ellipse cx="75" cy="112" rx="42" ry="6" fill="#1B1C5E" opacity="0.8" />
    </Svg>
  );
}

/** Dark square with a golden zodiac wheel, used as a course thumbnail. */
export function CourseThumb({ size = 96, radius = 12 }: { size?: number; radius?: number }) {
  const c = 50;
  const spokes = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    return `M${c + 14 * Math.cos(a)} ${c + 14 * Math.sin(a)}L${c + 42 * Math.cos(a)} ${c + 42 * Math.sin(a)}`;
  }).join('');
  return (
    <CosmicBg colors={['#15164F', '#23236E', '#2F2A80']} style={{ width: size, height: size, borderRadius: radius, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size * 0.94} height={size * 0.94} viewBox="0 0 100 100">
        <Circle cx={c} cy={c} r="44" fill="none" stroke="#D9B25F" strokeWidth="0.9" />
        <Circle cx={c} cy={c} r="35" fill="none" stroke="#D9B25F" strokeWidth="0.7" />
        <Circle cx={c} cy={c} r="14" fill="none" stroke="#D9B25F" strokeWidth="0.9" />
        <Path d={spokes} stroke="#D9B25F" strokeWidth="0.7" opacity={0.85} />
        <Path d="M50 40c1 6 4 9 10 10c-6 1-9 4-10 10c-1-6-4-9-10-10c6-1 9-4 10-10Z" fill="#F0D79E" />
      </Svg>
    </CosmicBg>
  );
}
