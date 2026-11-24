import { AQICategory, JudgePreset } from '@/types/aqi';

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
    hex: '#10B981',       // Emerald
    glowHex: 'rgba(16, 185, 129, 0.15)',
    pillBg: 'bg-emerald-50',
    pillText: 'text-emerald-700',
    pillBorder: 'border-emerald-200',
  },
  Satisfactory: {
    label: 'Satisfactory',
    max: 100,
    hex: '#10B981',       // Emerald
    glowHex: 'rgba(16, 185, 129, 0.15)',
    pillBg: 'bg-emerald-50',
    pillText: 'text-emerald-700',
    pillBorder: 'border-emerald-200',
  },
  Moderate: {
    label: 'Moderate',
    max: 200,
    hex: '#F59E0B',       // Amber
    glowHex: 'rgba(245, 158, 11, 0.15)',
    pillBg: 'bg-amber-50',
    pillText: 'text-amber-800',
    pillBorder: 'border-amber-200',
  },
  Poor: {
    label: 'Poor',
    max: 300,
    hex: '#F97316',       // Coral
    glowHex: 'rgba(249, 115, 22, 0.15)',
    pillBg: 'bg-orange-50',
    pillText: 'text-orange-800',
    pillBorder: 'border-orange-200',
  },
  'Very Poor': {
    label: 'Very Poor',
    max: 400,
    hex: '#EF4444',       // Rose / Crimson
    glowHex: 'rgba(239, 68, 68, 0.18)',
    pillBg: 'bg-rose-50',
    pillText: 'text-rose-800',
    pillBorder: 'border-rose-200',
  },
  Severe: {
    label: 'Severe',
    max: 999,
    hex: '#8B5CF6',       // Violet (emergency / toxic inversion)
    glowHex: 'rgba(139, 92, 246, 0.20)',
    pillBg: 'bg-purple-50',
    pillText: 'text-purple-800',
    pillBorder: 'border-purple-200',
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

export function getAQIStyle(category: AQICategory) {
  const theme = getAQITheme(category);
  return {
    color: theme.pillBg.replace('bg-', 'bg-'),
    textColor: theme.pillText,
    bgLight: theme.pillBg,
    border: theme.pillBorder,
    hex: theme.hex,
  };
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

export const JUDGE_PRESETS: JudgePreset[] = [
  {
    id: 'delhi-family',
    label: 'Delhi Family with Newborn',
    subtitle: 'Anand Vihar Station • Severe Smog Zone',
    city: 'Delhi',
    persona: 'parent_kids',
    routine: {
      morningOutdoorTime: '07:00 - 08:30 (Stroller / School Bus)',
      commuteTime: '08:45 - 09:30',
      commuteMode: 'car_cab',
      eveningOutdoorTime: '17:30 - 18:30 (Playground)',
      hasAirPurifier: true,
      indoorPlants: true,
    },
    badgeColor: 'border-purple-200 bg-purple-50 text-purple-900',
  },
  {
    id: 'mumbai-commuter',
    label: 'Mumbai Daily Commuter',
    subtitle: 'BKC Business Hub • High Traffic Exposure',
    city: 'Mumbai',
    persona: 'daily_commuter',
    routine: {
      morningOutdoorTime: '08:00 - 09:30 (Transit)',
      commuteTime: '08:30 - 09:45',
      commuteMode: 'two_wheeler',
      eveningOutdoorTime: '18:30 - 20:00 (Return Commute)',
      hasAirPurifier: false,
      indoorPlants: false,
    },
    badgeColor: 'border-amber-200 bg-amber-50 text-amber-900',
  },
  {
    id: 'kolkata-senior',
    label: 'Kolkata Asthmatic Senior',
    subtitle: 'Ballygunge Station • Sensitive Respiratory Profile',
    city: 'Kolkata',
    persona: 'senior_sensitive',
    routine: {
      morningOutdoorTime: '06:00 - 07:15 (Morning Walk in Park)',
      commuteTime: 'None (Retired)',
      commuteMode: 'walking',
      eveningOutdoorTime: '17:00 - 18:00 (Evening Balcony Sit)',
      hasAirPurifier: false,
      indoorPlants: true,
    },
    badgeColor: 'border-rose-200 bg-rose-50 text-rose-900',
  },
];
