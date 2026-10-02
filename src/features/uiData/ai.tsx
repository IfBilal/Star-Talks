import {
  Aperture, BookMarked, Brain, Briefcase, Compass, Flame, Gem, Globe, Hash, HeartPulse, Layers, Moon, Percent, ScanFace, ShieldCheck, Sparkles, Sun, SunMoon,
  TrendingUp, UserRound, Users, Wallet, Hourglass, Mountain, Eye, Hexagon, Landmark, Smile, Leaf, Star,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { PalmIcon } from '@/components/ui/icons';

export type ModuleId = 'vedic' | 'tarot' | 'palmistry' | 'numerology' | 'western' | 'lal-kitab' | 'chinese-zodiac' | 'korean-astrology' | 'face-reading';

export type Insight = { icon: (c: string) => ReactNode; title: string; text: string };
export type ModuleUi = {
  id: ModuleId; name: string; badge: string; tagline: string; tint: string; ink: string;
  icon: (c: string, size?: number) => ReactNode;
  readingTitle: string; readingSub?: string; titleColor?: string;
  insights: Insight[]; question: string; chips: string[];
};

const i = (Icon: any) => (c: string) => <Icon size={19} color={c} strokeWidth={1.6} />;
const big = (Icon: any) => (c: string, size = 22) => <Icon size={size} color={c} strokeWidth={1.6} />;

export const MODULES: ModuleUi[] = [
  {
    id: 'vedic', name: 'Vedic Astrology', badge: 'Vedic AI', tagline: 'Ancient wisdom, modern guidance', tint: '#FBE8D0', ink: '#B5712B',
    icon: big(Sun), readingTitle: 'Your Vedic Reading', readingSub: 'What I notice in your chart', titleColor: '#8C5A2B',
    insights: [
      { icon: i(Briefcase), title: 'Career & Work', text: 'Strong potential for leadership roles, but you may face changes in job profiles. MNC environment suits you.' },
      { icon: i(Users), title: 'Family Influence', text: 'Your father has a strong influence on your decisions and career path.' },
      { icon: i(HeartPulse), title: 'Health', text: 'Stomach sensitivity is indicated. You may need to watch your diet and stress levels.' },
      { icon: i(Gem), title: 'Relationships', text: "You're not married yet, and your chart shows a focus on personal growth before commitment." },
    ],
    question: 'Would you like me to check the best time for a career shift or explore your love life in your chart?', chips: ['Career timing', 'Love & Marriage', 'More'],
  },
  {
    id: 'tarot', name: 'Tarot', badge: 'Tarot AI', tagline: "Cards reveal what's hidden", tint: '#E6E0F8', ink: '#5B4FB0',
    icon: big(Layers), readingTitle: 'Your Current Energy', readingSub: 'What I see in your cards',
    insights: [
      { icon: i(Flame), title: 'Emotional Energy', text: "You're feeling torn between what you want and what you think you should do." },
      { icon: i(Brain), title: 'On Your Mind', text: 'A decision about your career or next step.' },
      { icon: i(Hourglass), title: 'Current Struggle', text: 'Overthinking and fear of making the wrong choice.' },
      { icon: i(Leaf), title: 'Opportunity', text: 'A new door is opening, but it requires trust and patience.' },
    ],
    question: 'Would you like me to explore your career path or get clarity on your love life?', chips: ['Career Path', 'Love Life', 'More'],
  },
  {
    id: 'palmistry', name: 'Palmistry', badge: 'Palmistry AI', tagline: 'Your hands hold the answers', tint: '#FCE4DA', ink: '#C4573F',
    icon: (c, size = 22) => <PalmIcon size={size} color={c} strokeWidth={1.5} />, readingTitle: 'What Stands Out in Your Palm',
    insights: [
      { icon: i(Mountain), title: 'Head Line', text: 'Long and straight – strong focus and planning.' },
      { icon: i(HeartPulse), title: 'Heart Line', text: 'Clear and well-defined – balanced emotions.' },
      { icon: i(TrendingUp), title: 'Life Line', text: 'Steady and unbroken – good vitality.' },
      { icon: i(Compass), title: 'Fate Line', text: 'Visible and rising – career growth after mid-20s.' },
    ],
    question: 'Would you like me to know more about your career, love life or overall life path?', chips: ['Career', 'Love', 'Overall Life'],
  },
  {
    id: 'numerology', name: 'Numerology', badge: 'Numerology AI', tagline: 'Numbers shape your destiny', tint: '#FBE8D0', ink: '#C47A2B',
    icon: big(Percent), readingTitle: 'What Your Numbers Reveal First',
    insights: [
      { icon: i(Hash), title: 'Life Path 7', text: 'Seeker, analyst, deep thinker.' },
      { icon: i(Sparkles), title: 'Expression 3', text: 'Creative, expressive, natural communicator.' },
      { icon: i(HeartPulse), title: 'Soul Urge 6', text: 'Values love, harmony and family.' },
      { icon: i(Star), title: 'Personality 5', text: 'Adventurous, adaptable, curious.' },
    ],
    question: 'Would you like to know how these numbers influence your career or relationships?', chips: ['Career', 'Relationships', 'More'],
  },
  {
    id: 'western', name: 'Western Astrology', badge: 'Western AI', tagline: 'Align with the stars', tint: '#E4E1F8', ink: '#5A52B8',
    icon: big(Aperture), readingTitle: 'What Immediately Stands Out in Your Chart',
    insights: [
      { icon: i(Brain), title: 'Personality', text: 'A mix of logic and emotion. You think deeply but feel intensely.' },
      { icon: i(Briefcase), title: 'Career', text: 'Creative and analytical fields suit you.' },
      { icon: i(Users), title: 'Relationships', text: 'You crave deep connections, but need space.' },
      { icon: i(Moon), title: 'Current Theme', text: 'A period of transition and new opportunities.' },
    ],
    question: 'Would you like to know more about your career, love life or upcoming transits?', chips: ['Career', 'Love', 'Transits'],
  },
  {
    id: 'lal-kitab', name: 'Lal Kitab', badge: 'Lal Kitab AI', tagline: 'Practical remedies for life', tint: '#FADCD3', ink: '#C4432E',
    icon: big(BookMarked), readingTitle: 'What Stands Out in Your Lal Kitab Reading',
    insights: [
      { icon: i(Globe), title: 'Planetary Influence', text: 'Strong Saturn influence – teaches patience and discipline.' },
      { icon: i(Briefcase), title: 'Career', text: 'Good potential in structured environments.' },
      { icon: i(HeartPulse), title: 'Relationships', text: 'You carry responsibilities that may affect personal life.' },
      { icon: i(ShieldCheck), title: 'Remedies', text: 'Simple remedies can help reduce obstacles and bring stability.' },
    ],
    question: 'Would you like me to know about your career, family or financial situation?', chips: ['Career', 'Family', 'Finance'],
  },
  {
    id: 'chinese-zodiac', name: 'Chinese Zodiac', badge: 'Chinese Zodiac AI', tagline: 'Year, element and four pillars', tint: '#F9E2E0', ink: '#B5412F',
    icon: big(SunMoon), readingTitle: 'What Your Zodiac Reveals First',
    insights: [
      { icon: i(Flame), title: 'Year Animal: Dragon', text: 'Bold, charismatic and ambitious.' },
      { icon: i(Leaf), title: 'Element: Wood', text: 'Growth, creativity and flexibility.' },
      { icon: i(Sun), title: 'Day Master: Yang Fire', text: 'A warm, expressive natural leader.' },
      { icon: i(Hexagon), title: 'Element Balance', text: 'Strong Wood and Fire, weaker Metal.' },
    ],
    question: 'Would you like to explore how your four pillars shape your career or love life?', chips: ['Career', 'Love', 'Luck Cycles'],
  },
  {
    id: 'korean-astrology', name: 'Korean Astrology', badge: 'Korean AI', tagline: 'Saju Palja, the four pillars', tint: '#E3E8F8', ink: '#3F58B0',
    icon: big(Landmark), readingTitle: 'What Your Saju Reveals First',
    insights: [
      { icon: i(UserRound), title: 'Ilgan (Day Master)', text: 'Steady, principled and growth-minded.' },
      { icon: i(Users), title: 'Year Pillar', text: 'Shapes your early life and family roots.' },
      { icon: i(Briefcase), title: 'Month Pillar', text: 'Shows your career environment and talents.' },
      { icon: i(Hourglass), title: 'Hour Pillar', text: 'Hints at your later years and ambitions.' },
    ],
    question: 'Would you like to know how your pillars relate to your career or relationships?', chips: ['Career', 'Love', 'Wealth'],
  },
  {
    id: 'face-reading', name: 'Face Reading', badge: 'Face Reading AI', tagline: 'Read the story in your face', tint: '#E0F0EA', ink: '#3E8B72',
    icon: big(ScanFace), readingTitle: 'What Stands Out in Your Face',
    insights: [
      { icon: i(Brain), title: 'Forehead', text: 'A broad forehead – strong thinking and planning.' },
      { icon: i(Eye), title: 'Eyes', text: 'Clear and steady – honest and perceptive.' },
      { icon: i(Wallet), title: 'Nose', text: 'Well-formed – good earning potential.' },
      { icon: i(Smile), title: 'Mouth & Chin', text: 'A firm chin – determination and stamina.' },
    ],
    question: 'Would you like me to read more about your career, love life or character?', chips: ['Career', 'Love', 'Character'],
  },
];

export const moduleById = (id?: string) => MODULES.find(m => m.id === id) ?? MODULES[0];

export const HISTORY = [
  { title: 'Career guidance', module: 'vedic' as ModuleId, date: '12 Apr 2025' },
  { title: 'Love reading', module: 'tarot' as ModuleId, date: '10 Apr 2025' },
  { title: 'Palm reading', module: 'palmistry' as ModuleId, date: '8 Apr 2025' },
  { title: 'Life path analysis', module: 'numerology' as ModuleId, date: '5 Apr 2025' },
  { title: 'Future predictions', module: 'western' as ModuleId, date: '2 Apr 2025' },
  { title: 'Financial growth', module: 'lal-kitab' as ModuleId, date: '28 Mar 2025' },
];
