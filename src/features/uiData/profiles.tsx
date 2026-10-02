import { Gem, Heart, Sparkles, UserRound, Users, UsersRound } from 'lucide-react-native';
import type { ReactNode } from 'react';

export type Person = { id: string; name: string; rel: 'Self' | 'Partner' | 'Child' | 'Family' | 'Friend' | 'Other'; dob: string; time: string; place: string };

export const PEOPLE: Person[] = [
  { id: 'neha', name: 'Neha Sharma', rel: 'Self', dob: '12 Apr 1995', time: '10:30 AM', place: 'Mumbai' },
  { id: 'rahul', name: 'Rahul Sharma', rel: 'Partner', dob: '15 Aug 1992', time: '06:15 PM', place: 'Delhi' },
  { id: 'riya', name: 'Riya Sharma', rel: 'Child', dob: '10 Jan 2018', time: '09:20 AM', place: 'Jaipur' },
  { id: 'mom', name: 'Mom', rel: 'Family', dob: '01 Jan 1968', time: '07:45 AM', place: 'Bhopal' },
];

export const REL_TYPES: { id: Person['rel']; icon: (c: string, s?: number) => ReactNode }[] = [
  { id: 'Self', icon: (c, s = 22) => <UserRound size={s} color={c} strokeWidth={1.6} /> },
  { id: 'Family', icon: (c, s = 22) => <UsersRound size={s} color={c} strokeWidth={1.6} /> },
  { id: 'Partner', icon: (c, s = 22) => <Heart size={s} color={c} strokeWidth={1.6} /> },
  { id: 'Friend', icon: (c, s = 22) => <Users size={s} color={c} strokeWidth={1.6} /> },
  { id: 'Child', icon: (c, s = 22) => <Gem size={s} color={c} strokeWidth={1.6} /> },
  { id: 'Other', icon: (c, s = 22) => <Sparkles size={s} color={c} strokeWidth={1.6} /> },
];
