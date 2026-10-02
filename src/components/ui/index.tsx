import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import {
  ArrowLeft, Bell, ChevronRight, ClipboardList, EllipsisVertical, GraduationCap, House, Menu, Sparkles, UserRound,
} from 'lucide-react-native';
import { useState, type PropsWithChildren, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';

export const go = (href: string) => router.push(href as Href);
export const replace = (href: string) => router.replace(href as Href);
export const back = () => (router.canGoBack() ? router.back() : router.replace('/home'));

export const F = { r: 'Poppins_400Regular', m: 'Poppins_500Medium', s: 'Poppins_600SemiBold', b: 'Poppins_700Bold', serif: 'PlayfairDisplay_600SemiBold', serifM: 'PlayfairDisplay_500Medium', serifB: 'PlayfairDisplay_700Bold', caps: 'Cinzel_500Medium' } as const;

export const Type = StyleSheet.create({
  h1: { fontFamily: F.s, fontSize: 20, color: Colors.navy },
  h2: { fontFamily: F.s, fontSize: 16, color: Colors.navy },
  section: { fontFamily: F.s, fontSize: 13.5, color: Colors.navy },
  rowTitle: { fontFamily: F.s, fontSize: 12, color: Colors.navy },
  rowSub: { fontFamily: F.r, fontSize: 10, color: Colors.slate },
  body: { fontFamily: F.r, fontSize: 12, lineHeight: 18, color: Colors.ink },
  caption: { fontFamily: F.r, fontSize: 10, color: Colors.slate },
});

/* ───────────── Layout ───────────── */

type TabId = 'home' | 'courses' | 'ai' | 'reports' | 'profile';
const tabs: { id: TabId; label: string; icon: typeof House; href: string }[] = [
  { id: 'home', label: 'Home', icon: House, href: '/home' },
  { id: 'courses', label: 'Courses', icon: GraduationCap, href: '/courses' },
  { id: 'ai', label: 'AI', icon: Sparkles, href: '/ai' },
  { id: 'reports', label: 'Reports', icon: ClipboardList, href: '/reports' },
  { id: 'profile', label: 'Profile', icon: UserRound, href: '/profile' },
];

export function TabBar({ active }: { active?: TabId }) {
  const { t } = useTranslation();
  return (
    <SafeAreaView edges={['bottom']} style={s.tabSafe}>
      <View style={s.tabRow}>
        {tabs.map(({ id, icon: Icon, href }) => {
          const on = id === active;
          const label = t(`common.tabs.${id}`);
          return (
            <Pressable key={id} accessibilityRole="button" accessibilityLabel={t('home.tabA11y', { name: label })} onPress={() => replace(href)} style={s.tabItem}>
              <Icon size={19} strokeWidth={on ? 2.2 : 1.7} color={on ? Colors.navy : Colors.tabInactive} fill={on && (id === 'home' || id === 'profile') ? Colors.navy : 'none'} />
              <Text style={[s.tabLabel, on && s.tabLabelOn]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export function AppBar({ title, onBack = back, right, align = 'left', brand, menu, dark, centerLogo }: {
  title?: string; onBack?: () => void; right?: ReactNode; align?: 'left' | 'center'; brand?: boolean; menu?: boolean; dark?: boolean; centerLogo?: boolean;
}) {
  const ink = dark ? '#FFFFFF' : Colors.navy;
  if (brand) {
    return (
      <LinearGradient colors={dark ? ['#1F2170', '#2C2B86'] : ['#E7E0F6', '#FBF5F3']} style={s.brandBar}>
        <Pressable onPress={menu ? undefined : onBack} hitSlop={10} style={s.brandLeft} accessibilityRole="button" accessibilityLabel={menu ? 'Menu' : 'Back'}>
          {menu ? <Menu size={20} color={ink} strokeWidth={2} /> : <ArrowLeft size={21} color={ink} />}
        </Pressable>
        <View style={[s.brandCenter, centerLogo && { justifyContent: 'center', marginLeft: 0 }]}>
          <Image source={require('../../../assets/images/star-talks-mark.png')} contentFit="contain" style={{ width: 44, height: 22 }} />
          <Text style={[s.brandWord, { color: ink }]}>STAR TALKS</Text>
        </View>
        <View style={s.brandRight}>{right ?? <EllipsisVertical size={18} color={ink} />}</View>
      </LinearGradient>
    );
  }
  return (
    <View style={s.bar}>
      <Pressable onPress={onBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back" style={s.barBack}>
        <ArrowLeft size={21} color={ink} />
      </Pressable>
      <Text numberOfLines={1} style={[s.barTitle, { color: ink }, align === 'center' && { textAlign: 'center', marginRight: 34 }]}>{title}</Text>
      {right ? <View style={s.barRight}>{right}</View> : null}
    </View>
  );
}

export function BellButton({ dot, dark }: { dot?: boolean; dark?: boolean }) {
  return (
    <Pressable onPress={() => go('/notifications')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Notifications">
      <Bell size={19} color={dark ? '#FFFFFF' : Colors.navy} strokeWidth={1.8} />
      {dot ? <View style={s.bellDot} /> : null}
    </Pressable>
  );
}

export function AppScreen({ children, tab, scroll = true, header, footer, bg, dark, pad = 16, contentStyle, noTopInset }: PropsWithChildren<{
  tab?: TabId; scroll?: boolean; header?: ReactNode; footer?: ReactNode; bg?: string; dark?: boolean; pad?: number; contentStyle?: StyleProp<ViewStyle>; noTopInset?: boolean;
}>) {
  const background = bg ?? (dark ? '#14155A' : Colors.ivory);
  const body = scroll ? (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[{ paddingHorizontal: pad, paddingBottom: 18 }, contentStyle]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, paddingHorizontal: pad }, contentStyle]}>{children}</View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} backgroundColor={background} />
      {noTopInset ? header : <SafeAreaView edges={['top']} style={{ backgroundColor: background }}>{header}</SafeAreaView>}
      {body}
      {footer}
      {tab ? <TabBar active={tab} /> : null}
      {!tab ? <SafeAreaView edges={['bottom']} style={{ backgroundColor: background }} /> : null}
    </View>
  );
}

/* ───────────── Surfaces & rows ───────────── */

export function Card({ children, style, onPress, tint }: PropsWithChildren<{ style?: StyleProp<ViewStyle>; onPress?: () => void; tint?: string }>) {
  const st = [s.card, tint ? { backgroundColor: tint } : null, style];
  return onPress ? <Pressable onPress={onPress} accessibilityRole="button" style={st}>{children}</Pressable> : <View style={st}>{children}</View>;
}

export function IconTile({ icon, size = 38, color = Colors.navy, bg = Colors.tile, radius }: { icon: ReactNode | ((c: string) => ReactNode); size?: number; color?: string; bg?: string; radius?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius ?? size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      {typeof icon === 'function' ? icon(color) : icon}
    </View>
  );
}

export function ListRow({ icon, title, subtitle, value, onPress, right, chevron = true, tileBg, iconColor, style, titleStyle, divider }: {
  icon?: (c: string) => ReactNode; title: string; subtitle?: string; value?: string; onPress?: () => void; right?: ReactNode; chevron?: boolean;
  tileBg?: string; iconColor?: string; style?: StyleProp<ViewStyle>; titleStyle?: StyleProp<TextStyle>; divider?: boolean;
}) {
  const content = (
    <>
      {icon ? <IconTile icon={icon} bg={tileBg} color={iconColor} /> : null}
      <View style={{ flex: 1 }}>
        <Text style={[Type.rowTitle, titleStyle]} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={[Type.rowSub, { marginTop: 1 }]} numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={s.rowValue}>{value}</Text> : null}
      {right}
      {chevron && !right ? <ChevronRight size={17} color={Colors.navy} /> : null}
    </>
  );
  const st = [s.row, divider && s.rowDivider, style];
  return onPress ? <Pressable onPress={onPress} accessibilityRole="button" style={st}>{content}</Pressable> : <View style={st}>{content}</View>;
}

export function SectionTitle({ children, action, onAction, style }: { children: string; action?: string; onAction?: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[s.sectionRow, style]}>
      <Text style={Type.section}>{children}</Text>
      {action ? <Pressable onPress={onAction}><Text style={s.sectionAction}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function Chip({ label, on, onPress, icon, style }: { label: string; on?: boolean; onPress?: () => void; icon?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[s.chip, on && s.chipOn, style]}>
      {icon}
      <Text style={[s.chipText, on && { color: '#FFFFFF' }]}>{label}</Text>
    </Pressable>
  );
}

export function Toggle({ value, onChange }: { value: boolean; onChange?: (v: boolean) => void }) {
  return (
    <Pressable onPress={() => onChange?.(!value)} accessibilityRole="switch" accessibilityState={{ checked: value }} style={[s.toggle, { backgroundColor: value ? Colors.primaryFrom : '#D9D7E2', alignItems: value ? 'flex-end' : 'flex-start' }]}>
      <View style={s.toggleKnob} />
    </Pressable>
  );
}

export function Segmented({ items, value, onChange, variant = 'underline' }: { items: string[]; value: string; onChange: (v: string) => void; variant?: 'underline' | 'pill' }) {
  if (variant === 'pill') {
    return (
      <View style={s.segPill}>
        {items.map(i => (
          <Pressable key={i} onPress={() => onChange(i)} style={[s.segPillItem, value === i && s.segPillOn]}>
            <Text style={[s.segPillText, value === i && { color: '#FFFFFF' }]}>{i}</Text>
          </Pressable>
        ))}
      </View>
    );
  }
  return (
    <View style={s.segLine}>
      {items.map(i => (
        <Pressable key={i} onPress={() => onChange(i)} style={[s.segLineItem, value === i && { borderBottomColor: Colors.navy }]}>
          <Text style={[s.segLineText, value === i && { color: Colors.navy, fontFamily: F.s }]}>{i}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Progress({ value, height = 6, from = Colors.primaryFrom, to = Colors.primaryTo, track = '#E0DDEC' }: { value: number; height?: number; from?: string; to?: string; track?: string }) {
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden' }}>
      <LinearGradient colors={[from, to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', borderRadius: height }} />
    </View>
  );
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <View style={s.stepper}>
      {steps.map((label, i) => {
        const done = i < current; const on = i === current;
        return (
          <View key={label} style={{ flex: 1, alignItems: 'center' }}>
            <View style={s.stepLineWrap}>
              <View style={[s.stepLine, { opacity: i === 0 ? 0 : 1, backgroundColor: i <= current ? Colors.primaryFrom : '#CFCBE2' }]} />
              <View style={[s.stepDot, (on || done) && { backgroundColor: Colors.primaryFrom, borderColor: Colors.primaryFrom }]}>
                <Text style={[s.stepNum, (on || done) && { color: '#FFFFFF' }]}>{i + 1}</Text>
              </View>
              <View style={[s.stepLine, { opacity: i === steps.length - 1 ? 0 : 1, backgroundColor: i < current ? Colors.primaryFrom : '#CFCBE2' }]} />
            </View>
            <Text style={[s.stepLabel, on && { color: Colors.navy, fontFamily: F.m }]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

/* ───────────── Buttons & inputs ───────────── */

export function Button({ title, onPress, variant = 'primary', icon, iconRight, style, height = 46, disabled, textStyle }: {
  title: string; onPress?: () => void; variant?: 'primary' | 'outline' | 'soft' | 'light' | 'danger'; icon?: ReactNode; iconRight?: ReactNode;
  style?: StyleProp<ViewStyle>; height?: number; disabled?: boolean; textStyle?: StyleProp<TextStyle>;
}) {
  const label = (color: string) => <Text style={[s.btnText, { color }, textStyle]}>{title}</Text>;
  if (variant === 'primary') {
    return (
      <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[{ height, borderRadius: 14, overflow: 'hidden', opacity: disabled ? 0.55 : 1 }, style]}>
        <LinearGradient colors={[Colors.primaryFrom, Colors.primaryTo]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={s.btnInner}>
          {icon}{label('#FFFFFF')}{iconRight}
        </LinearGradient>
      </Pressable>
    );
  }
  const map = {
    outline: { bg: Colors.card, border: Colors.primaryFrom, color: Colors.navy },
    soft: { bg: Colors.tile, border: 'transparent', color: Colors.navy },
    light: { bg: '#FFFFFF', border: Colors.cardBorder, color: Colors.navy },
    danger: { bg: Colors.dangerBg, border: 'transparent', color: Colors.danger },
  }[variant];
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[{ height, borderRadius: 14, backgroundColor: map.bg, borderWidth: 1, borderColor: map.border, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }, style]}>
      {icon}{label(map.color)}{iconRight}
    </Pressable>
  );
}

export function Field({ label, icon, right, style, ...props }: TextInputProps & { label?: string; icon?: ReactNode; right?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={[{ marginBottom: 12 }, style]}>
      {label ? <Text style={s.fieldLabel}>{label}</Text> : null}
      <View style={[s.field, focus && { borderColor: Colors.primaryFrom }]}>
        {icon}
        <TextInput placeholderTextColor="#9AA0B8" style={s.fieldInput} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} {...props} />
        {right}
      </View>
    </View>
  );
}

export function SearchBar({ placeholder, value, onChangeText, icon, iconRight, style }: { placeholder: string; value?: string; onChangeText?: (t: string) => void; icon?: ReactNode; iconRight?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[s.search, style]}>
      {icon}
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#9AA0B8" style={s.searchInput} />
      {iconRight}
    </View>
  );
}

export function Pill({ children, bg = Colors.tile, color = Colors.navy, style }: PropsWithChildren<{ bg?: string; color?: string; style?: StyleProp<ViewStyle> }>) {
  return <View style={[{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, alignSelf: 'flex-start' }, style]}><Text style={{ fontFamily: F.m, fontSize: 9.5, color }}>{children}</Text></View>;
}

export function Avatar({ name, size = 44, bg = Colors.tile, color = Colors.navy }: { name: string; size?: number; bg?: string; color?: string }) {
  const initials = name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: F.s, fontSize: size * 0.36, color }}>{initials}</Text></View>;
}


/** Outlined field whose label sits on the top border (as in the birth-details mockups). */
export function OutlineField({ label, value, onChangeText, right, placeholder, onPress, bg = Colors.ivory, style }: {
  label: string; value: string; onChangeText?: (t: string) => void; right?: ReactNode; placeholder?: string; onPress?: () => void; bg?: string; style?: StyleProp<ViewStyle>;
}) {
  const inner = (
    <View style={[{ height: 50, borderRadius: 10, borderWidth: 1, borderColor: '#D9D4EA', backgroundColor: '#FFFFFF', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
      <TextInput value={value} onChangeText={onChangeText} editable={!onPress} placeholder={placeholder} placeholderTextColor="#9AA0B8" style={{ flex: 1, fontFamily: F.r, fontSize: 13, color: Colors.ink, paddingVertical: 0 }} />
      {right}
    </View>
  );
  return (
    <View style={[{ marginTop: 10, marginBottom: 6 }, style]}>
      {onPress ? <Pressable onPress={onPress}>{inner}</Pressable> : inner}
      <Text style={{ position: 'absolute', left: 12, top: -8, paddingHorizontal: 4, backgroundColor: bg, fontFamily: F.r, fontSize: 10.5, color: Colors.slate }}>{label}</Text>
    </View>
  );
}

/** Row of small dots joined by a line; the first `current + 1` dots are filled. */
export function DotProgress({ count, current }: { count: number; current: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 }}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 11, height: 11, borderRadius: 6, borderWidth: 1.5, borderColor: i <= current ? Colors.primaryFrom : '#CFCBE2', backgroundColor: i === current ? '#FFFFFF' : i < current ? Colors.primaryFrom : '#FFFFFF' }} />
          {i < count - 1 ? <View style={{ width: 34, height: 1.5, backgroundColor: i < current ? Colors.primaryFrom : '#DDD9EC' }} /> : null}
        </View>
      ))}
    </View>
  );
}


export function Sheet({ visible, onClose, title, items, children }: {
  visible: boolean; onClose: () => void; title?: string; items?: { label: string; onPress?: () => void; danger?: boolean; icon?: ReactNode }[]; children?: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(20,20,60,0.4)', justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable onPress={() => {}} style={{ backgroundColor: Colors.ivory, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 10, paddingBottom: 26, paddingHorizontal: 18 }}>
          <View style={{ alignSelf: 'center', width: 42, height: 4, borderRadius: 2, backgroundColor: '#D6D1E6', marginBottom: 12 }} />
          {title ? <Text style={[Type.h2, { marginBottom: 8 }]}>{title}</Text> : null}
          {items?.map(it => (
            <Pressable key={it.label} accessibilityRole="button" onPress={() => { onClose(); it.onPress?.(); }} style={{ minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#EFEBF6' }}>
              {it.icon}
              <Text style={{ fontFamily: F.m, fontSize: 13, color: it.danger ? Colors.danger : Colors.navy }}>{it.label}</Text>
            </Pressable>
          ))}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  tabSafe: { backgroundColor: '#FFFDFB', borderTopWidth: 1, borderTopColor: '#EEEAF0' },
  tabRow: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  tabItem: { width: '20%', height: 54, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabLabel: { fontFamily: F.r, fontSize: 9.5, color: Colors.tabInactive },
  tabLabelOn: { fontFamily: F.s, color: Colors.navy },
  bar: { height: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  barBack: { width: 24, height: 30, justifyContent: 'center' },
  barTitle: { flex: 1, fontFamily: F.s, fontSize: 15.5 },
  barRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  brandBar: { height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  brandLeft: { width: 30, justifyContent: 'center' },
  brandCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 6, marginLeft: 6 },
  brandWord: { fontFamily: F.caps, fontSize: 14, letterSpacing: 3.4 },
  brandRight: { width: 30, alignItems: 'flex-end' },
  bellDot: { position: 'absolute', right: 0, top: -1, width: 7, height: 7, borderRadius: 4, backgroundColor: '#E5646E' },
  card: { backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.cardBorder, shadowColor: '#4A3F9F', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 9 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#EFEBF6' },
  rowValue: { fontFamily: F.m, fontSize: 11, color: Colors.slate },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 },
  sectionAction: { fontFamily: F.m, fontSize: 11, color: Colors.navy },
  chip: { height: 32, paddingHorizontal: 14, borderRadius: 16, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  chipOn: { backgroundColor: Colors.primaryFrom, borderColor: Colors.primaryFrom },
  chipText: { fontFamily: F.m, fontSize: 11.5, color: Colors.navy },
  toggle: { width: 42, height: 24, borderRadius: 12, padding: 3, justifyContent: 'center' },
  toggleKnob: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF' },
  segPill: { flexDirection: 'row', backgroundColor: '#EFEAF9', borderRadius: 12, padding: 3 },
  segPillItem: { flex: 1, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segPillOn: { backgroundColor: Colors.primaryFrom },
  segPillText: { fontFamily: F.m, fontSize: 12, color: Colors.navy },
  segLine: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E7E2F1' },
  segLineItem: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  segLineText: { fontFamily: F.m, fontSize: 12, color: Colors.slate },
  stepper: { flexDirection: 'row', marginTop: 4, marginBottom: 14 },
  stepLineWrap: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  stepLine: { flex: 1, height: 2 },
  stepDot: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: '#CFCBE2', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontFamily: F.s, fontSize: 11, color: Colors.slate },
  stepLabel: { fontFamily: F.r, fontSize: 10.5, color: Colors.slate, marginTop: 5 },
  btnInner: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText: { fontFamily: F.s, fontSize: 14 },
  fieldLabel: { fontFamily: F.m, fontSize: 12, color: Colors.ink, marginBottom: 6 },
  field: { height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#E6E1EF', backgroundColor: '#FFFFFF', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  fieldInput: { flex: 1, fontFamily: F.r, fontSize: 12, color: Colors.ink, paddingVertical: 0 },
  search: { height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6E1EF', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9 },
  searchInput: { flex: 1, fontFamily: F.r, fontSize: 12, color: Colors.ink, paddingVertical: 0 },
});

