export type Course = { id: string; title: string; level: string; modules: number; hours: number; instructor: string; price: string; rating: string; category: string };

export const COURSES: Course[] = [
  { id: 'vedic-foundation', title: 'Vedic Astrology Foundation', level: 'Beginner', modules: 6, hours: 12, instructor: 'Dr. Rhea Sharma', price: '₹4,999', rating: '4.8 (1.2k)', category: 'Astrology' },
  { id: 'tarot-mastery', title: 'Tarot Reading Mastery', level: 'Beginner', modules: 5, hours: 9, instructor: 'Anika Verma', price: '₹3,499', rating: '4.9 (980)', category: 'Tarot Reading' },
  { id: 'numerology-essentials', title: 'Numerology Essentials', level: 'Beginner', modules: 4, hours: 6, instructor: 'Kabir Mehta', price: '₹2,499', rating: '4.7 (760)', category: 'Numerology' },
  { id: 'vastu-basics', title: 'Vastu Shastra Basics', level: 'Beginner', modules: 4, hours: 5, instructor: 'Dr. Suresh Rao', price: '₹2,999', rating: '4.6 (540)', category: 'Vastu' },
  { id: 'palmistry-fundamentals', title: 'Palmistry Fundamentals', level: 'Intermediate', modules: 5, hours: 8, instructor: 'Meera Iyer', price: '₹2,799', rating: '4.8 (610)', category: 'Palmistry' },
];

export const CATEGORIES = ['Astrology', 'Tarot Reading', 'Numerology', 'Vastu', 'Palmistry', 'Other Subjects'];

export const LESSONS = [
  { title: 'Introduction to Vedic Astrology', length: '12:45', done: true },
  { title: 'The Twelve Houses', length: '18:20', done: false },
  { title: 'Planets and Their Meanings', length: '22:05', done: false, locked: true },
  { title: 'Nakshatras Explained', length: '16:40', done: false, locked: true },
  { title: 'Reading a Birth Chart', length: '25:10', done: false, locked: true },
  { title: 'Dashas and Timing', length: '20:30', done: false, locked: true },
];
