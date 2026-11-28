import { AQICategory, PersonaType } from '@/types/aqi';

export const VALID_PERSONAS: ReadonlySet<PersonaType> = new Set<PersonaType>([
  'parent_kids',
  'senior_sensitive',
  'daily_commuter',
  'fitness_enthusiast',
]);

export const VALID_COMMUTE_MODES = new Set([
  'two_wheeler',
  'metro_transit',
  'car_cab',
  'walking',
] as const);

export function sanitizeText(value: unknown, maxLen = 100): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\r\n\t\x00-\x1F\x7F]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLen);
}

export interface AQITheme {
  label: AQICategory;
  max: number;
  hex: string;
  glowHex: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
}

export const AQI_PALETTE: Record<AQICategory, AQITheme> = {
  Good: {
    label: 'Good',
    max: 50,
    hex: '#10B981',
    glowHex: 'rgba(16, 185, 129, 0.16)',
    pillBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    pillText: 'text-emerald-700 dark:text-emerald-300',
    pillBorder: 'border-emerald-200 dark:border-emerald-800',
  },
  Satisfactory: {
    label: 'Satisfactory',
    max: 100,
    hex: '#10B981',
    glowHex: 'rgba(16, 185, 129, 0.16)',
    pillBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    pillText: 'text-emerald-700 dark:text-emerald-300',
    pillBorder: 'border-emerald-200 dark:border-emerald-800',
  },
  Moderate: {
    label: 'Moderate',
    max: 200,
    hex: '#F59E0B',
    glowHex: 'rgba(245, 158, 11, 0.16)',
    pillBg: 'bg-amber-50 dark:bg-amber-950/60',
    pillText: 'text-amber-800 dark:text-amber-300',
    pillBorder: 'border-amber-200 dark:border-amber-800',
  },
  Poor: {
    label: 'Poor',
    max: 300,
    hex: '#F97316',
    glowHex: 'rgba(249, 115, 22, 0.16)',
    pillBg: 'bg-orange-50 dark:bg-orange-950/60',
    pillText: 'text-orange-800 dark:text-orange-300',
    pillBorder: 'border-orange-200 dark:border-orange-800',
  },
  'Very Poor': {
    label: 'Very Poor',
    max: 400,
    hex: '#EF4444',
    glowHex: 'rgba(239, 68, 68, 0.20)',
    pillBg: 'bg-rose-50 dark:bg-rose-950/60',
    pillText: 'text-rose-800 dark:text-rose-300',
    pillBorder: 'border-rose-200 dark:border-rose-800',
  },
  Severe: {
    label: 'Severe',
    max: 999,
    hex: '#8B5CF6',
    glowHex: 'rgba(139, 92, 246, 0.22)',
    pillBg: 'bg-purple-50 dark:bg-purple-950/60',
    pillText: 'text-purple-800 dark:text-purple-300',
    pillBorder: 'border-purple-200 dark:border-purple-800',
  },
};

export function getAQICategory(aqi: number): AQICategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export function getAQITheme(category: AQICategory): AQITheme {
  return AQI_PALETTE[category] || AQI_PALETTE['Severe'];
}

export const INDIAN_MONITORED_CITIES = [
  { city: 'Delhi', state: 'Delhi', defaultStation: 'Anand Vihar, Delhi DPCC' },
  { city: 'Mumbai', state: 'Maharashtra', defaultStation: 'Bandra Kurla Complex (BKC), Mumbai MPCB' },
  { city: 'Kolkata', state: 'West Bengal', defaultStation: 'Ballygunge, Kolkata WBPCB' },
  { city: 'Bengaluru', state: 'Karnataka', defaultStation: 'BTM Layout / Silk Board, Bengaluru KSPCB' },
  { city: 'Pune', state: 'Maharashtra', defaultStation: 'Shivajinagar, Pune MPCB' },
  { city: 'Hyderabad', state: 'Telangana', defaultStation: 'US Consulate / Gachibowli, Hyderabad TSPCB' },
  { city: 'Lucknow', state: 'Uttar Pradesh', defaultStation: 'Lalbagh, Lucknow UPPCB' },
  { city: 'Patna', state: 'Bihar', defaultStation: 'Muradpur, Patna BSPCB' },
];
