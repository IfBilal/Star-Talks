import { Colors as LightColors } from './theme';

export type ThemeMode = 'light' | 'dark';
export type Palette = { [K in keyof typeof LightColors]: string };
export type ColorRole = 'surface' | 'foreground' | 'border';
export type ThemeColor = (value: string | undefined, role?: ColorRole) => string | undefined;

export const DarkColors: Palette = {
  ...LightColors,
  indigo: '#D9D5FF', ivory: '#121320', lavender: '#BFB3F1', lavenderTint: '#29253F',
  text: '#F0EDF8', muted: '#B6B3C9', border: '#514D68', success: '#83D7AD',
  danger: '#FFACB6', navy: '#DDD8FF', ink: '#F0EDF8', slate: '#BBB6CE',
  card: '#1F2032', cardBorder: '#454158', tile: '#302C48', lavenderCard: '#2C2843',
  tabInactive: '#B7B2C9', track: '#504C65', goldSoft: '#493B29',
  successBg: '#203F34', dangerBg: '#482A37',
};

function rgb(value: string): number[] | null {
  if (value === 'white') return [255, 255, 255];
  if (value === 'black') return [0, 0, 0];
  if (!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value)) return null;
  const hex = value.length === 4 ? value.slice(1).split('').map(c => c + c).join('') : value.slice(1);
  return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
}
export function luminance(value: string): number {
  const channels = rgb(value);
  if (!channels) throw new Error(`Unsupported contrast color: ${value}`);
  const [r, g, b] = channels.map(c => c / 255).map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a: string, b: string): number {
  const [lo, hi] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (hi + 0.05) / (lo + 0.05);
}
const hex = (channels: number[]) => '#' + channels.map(c => Math.round(c).toString(16).padStart(2, '0')).join('');

/** Adapt legacy mockup colors by their role, retaining hue. Artwork is not transformed. */
export function adaptColor(value: string | undefined, mode: ThemeMode, role: ColorRole = 'foreground'): string | undefined {
  if (!value || mode === 'light') return value;
  const channels = rgb(value);
  if (!channels) return value; // Transparent/rgba overlays and SVG paint servers remain intentional.
  if (role === 'border') return DarkColors.border;
  if (role === 'surface') {
    if (luminance(value) < 0.16) return value; // Branded primary buttons and cosmic surfaces.
    const max = Math.max(...channels);
    return hex(channels.map((c, i) => [38, 36, 51][i] + (c - max) * 0.12));
  }
  if (luminance(value) >= 0.6) return value;
  let output = channels;
  for (let t = 0.05; t <= 1; t += 0.05) {
    output = channels.map(c => c + (255 - c) * t);
    if (luminance(hex(output)) >= 0.6) break;
  }
  return hex(output);
}
