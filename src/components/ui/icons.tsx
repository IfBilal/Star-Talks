import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';

/** Open raised palm, drawn to match the line-art hand in the mockups. */
export function PalmIcon({ size = 24, color = '#2A3785', strokeWidth = 1.6 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M8 13.4V5.6a1.35 1.35 0 0 1 2.7 0V11" />
      <Path d="M10.7 11V4.1a1.35 1.35 0 0 1 2.7 0V11" />
      <Path d="M13.4 11V5.3a1.35 1.35 0 0 1 2.7 0V12" />
      <Path d="M16.1 12V7.6a1.35 1.35 0 0 1 2.7 0v7.9c0 4-2.3 6.5-6.2 6.5-2.3 0-3.6-1-4.8-2.4l-3.5-4.2a1.3 1.3 0 0 1 1.9-1.8L8 15.6v-2.2" />
    </Svg>
  );
}

/** Four-point gold sparkle used as decoration across the mockups. */
export function GoldStar({ size = 14, color = '#E7B766', opacity = 1 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity}>
      <Path d="M12 0C12.9 7.2 16.8 11.1 24 12C16.8 12.9 12.9 16.8 12 24C11.1 16.8 7.2 12.9 0 12C7.2 11.1 11.1 7.2 12 0Z" fill={color} />
    </Svg>
  );
}

/** Natal-chart style wheel: outer ring, twelve houses, inner ring and a centre star. */
export function ZodiacWheel({ size = 120 }: { size?: number }) {
  const c = 60;
  const lines = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    return { x1: c + 26 * Math.cos(a), y1: c + 26 * Math.sin(a), x2: c + 56 * Math.cos(a), y2: c + 56 * Math.sin(a) };
  });
  const dots = Array.from({ length: 12 }, (_, i) => {
    const a = ((i * 30 + 15) * Math.PI) / 180;
    return { x: c + 47 * Math.cos(a), y: c + 47 * Math.sin(a) };
  });
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Path d="M60 4a56 56 0 1 0 0.01 0Z" fill="#FFFDF8" stroke="#E5B46A" strokeWidth={1.1} />
      <Path d="M60 15a45 45 0 1 0 0.01 0Z" fill="none" stroke="#E5B46A" strokeWidth={1} />
      <Path d="M60 34a26 26 0 1 0 0.01 0Z" fill="#F3EEFB" stroke="#5B5BC0" strokeWidth={1.2} />
      {lines.map((l, i) => <Path key={i} d={`M${l.x1} ${l.y1}L${l.x2} ${l.y2}`} stroke="#E5B46A" strokeWidth={0.9} />)}
      <Path d="M4 60H116" stroke="#5B5BC0" strokeWidth={0.8} />
      {dots.map((d, i) => <Path key={i} d={`M${d.x} ${d.y - 1.6}a1.6 1.6 0 1 0 0.01 0Z`} fill="#5B5BC0" />)}
      <Path d="M60 47c1 8 5 12 13 13c-8 1-12 5-13 13c-1-8-5-12-13-13c8-1 12-5 13-13Z" fill="#E8D3A4" stroke="#3A3A9A" strokeWidth={0.9} />
    </Svg>
  );
}

/** Dark disc with a gold star and soft halo, used on the "generating" screen. */
export function Emblem({ size = 150 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 150 150">
      <Path d="M75 4a71 71 0 1 0 0.01 0Z" fill="#F1ECFB" opacity={0.7} />
      <Path d="M75 16a59 59 0 1 0 0.01 0Z" fill="#E8E1F7" stroke="#D9D0F0" strokeWidth={1} />
      <Path d="M75 32a43 43 0 1 0 0.01 0Z" fill="#3C3B9E" />
      <Path d="M75 32a43 43 0 1 0 0.01 0Z" fill="none" stroke="#9C94E0" strokeWidth={1.2} />
      <Path d="M75 48c2 14 11 23 25 27c-14 4-23 13-25 27c-2-14-11-23-25-27c14-4 23-13 25-27Z" fill="#F2D9A4" />
    </Svg>
  );
}

/** Stylised tarot card (The Star / The Moon / The Sun) drawn as vector art. */
export function TarotCard({ kind, width = 66 }: { kind: 'star' | 'moon' | 'sun'; width?: number }) {
  const h = width * 1.72;
  const bg = { star: ['#2A6AA8', '#79B58A'], moon: ['#3A3E96', '#C4754F'], sun: ['#F1C44B', '#E8A93C'] }[kind];
  const label = { star: 'The Star', moon: 'The Moon', sun: 'The Sun' }[kind];
  return (
    <Svg width={width} height={h} viewBox="0 0 66 114">
      <Defs>
        <SvgGradient id={`g-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={bg[0]} />
          <Stop offset="1" stopColor={bg[1]} />
        </SvgGradient>
      </Defs>
      <Rect x="1.5" y="1.5" width="63" height="111" rx="3" fill="#E8B75E" stroke="#B98527" strokeWidth="1.5" />
      <Rect x="5" y="5" width="56" height="84" rx="2" fill={`url(#g-${kind})`} stroke="#7A5A1E" strokeWidth="1" />
      {kind === 'star' ? (
        <>
          <Path d="M33 12c1.4 8 4.6 11 12 12c-7.4 1-10.6 4-12 12c-1.4-8-4.6-11-12-12c7.4-1 10.6-4 12-12Z" fill="#F7E27A" />
          <Circle cx="16" cy="22" r="1.8" fill="#F7E27A" /><Circle cx="50" cy="20" r="1.8" fill="#F7E27A" /><Circle cx="14" cy="42" r="1.4" fill="#F7E27A" /><Circle cx="52" cy="40" r="1.4" fill="#F7E27A" />
          <Path d="M33 52c-5 0-8 4-8 9c0 5 3 8 8 8s8-3 8-8c0-5-3-9-8-9Z" fill="#F2DBC4" />
          <Path d="M20 89c2-14 8-20 13-20s11 6 13 20Z" fill="#6FA276" />
        </>
      ) : null}
      {kind === 'moon' ? (
        <>
          <Circle cx="33" cy="30" r="15" fill="#F2D27A" opacity={0.9} />
          <Circle cx="33" cy="30" r="9" fill="#C59A52" />
          <Path d="M25 89c2-22 4-34 8-34s6 12 8 34Z" fill="#E7D1E8" opacity={0.85} />
          <Circle cx="14" cy="66" r="1.5" fill="#F7E27A" /><Circle cx="52" cy="62" r="1.5" fill="#F7E27A" />
        </>
      ) : null}
      {kind === 'sun' ? (
        <>
          <Circle cx="33" cy="32" r="17" fill="#F7D658" stroke="#C98A1F" strokeWidth="1.2" />
          <Circle cx="27" cy="30" r="1.8" fill="#8A4B12" /><Circle cx="39" cy="30" r="1.8" fill="#8A4B12" />
          <Path d="M27 38c3 3 9 3 12 0" stroke="#8A4B12" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <Path d="M8 70c4-10 10-14 16-14v33H8Z" fill="#D98A4A" /><Path d="M44 60c6 0 12 6 14 29H44Z" fill="#E3B15A" />
        </>
      ) : null}
      <Rect x="5" y="93" width="56" height="16" rx="2" fill="#F1D08A" stroke="#B98527" strokeWidth="0.8" />
      <SvgText x="33" y="104.5" fontSize="8" fontWeight="bold" fill="#5A3C0C" textAnchor="middle">{label}</SvgText>
    </Svg>
  );
}
