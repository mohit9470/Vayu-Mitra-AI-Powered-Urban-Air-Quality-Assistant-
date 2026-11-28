export type AQICategory =
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe';

export interface PollutantValues {
  pm25: number | null; // µg/m³
  pm10: number | null; // µg/m³
  no2?: number | null; // µg/m³
  so2?: number | null; // µg/m³
  co?: number | null;  // mg/m³
  o3?: number | null;  // µg/m³
}

export interface HourlyForecast {
  hour: string;        // e.g. "06:00"
  displayTime: string; // e.g. "6 AM"
  aqi: number;
  pm25: number | null;
  category: AQICategory;
  isSafeWindow: boolean;
  notes: string;
}

export interface AirQualityData {
  city: string;
  stationName: string;
  state?: string;
  country: string;
  aqi: number;
  category: AQICategory;
  dominantPollutant: string;
  pollutants: PollutantValues;
  timestamp: string;
  source: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isFallback?: boolean;
  isLiveLocation?: boolean;
  hourlyForecast?: HourlyForecast[];
  primaryHealthAction?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type PersonaType =
  | 'parent_kids'
  | 'senior_sensitive'
  | 'daily_commuter'
  | 'fitness_enthusiast';

export interface UserContext {
  persona: PersonaType;
  city: string;
  routine: {
    morningOutdoorTime?: string;
    commuteTime?: string;
    commuteMode?: 'two_wheeler' | 'metro_transit' | 'car_cab' | 'walking';
    eveningOutdoorTime?: string;
    hasAirPurifier: boolean;
    indoorPlants: boolean;
  };
  notes?: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  category: 'outdoor_schedule' | 'indoor_hacks' | 'sustainable_commute';
  impactJustification: string;
  exposureReductionPercent: number;
  timeframe?: string;
  difficulty: 'Easy' | 'Moderate' | 'Proactive';
}

export interface RecommendationResponse {
  timestamp: string;
  city: string;
  liveAQI: number;
  category: AQICategory;
  personaTitle: string;
  summaryQuote: string;
  outdoorSchedulePlan: RecommendationItem[];
  indoorAirHacks: RecommendationItem[];
  commuteAlternatives: RecommendationItem[];
  overallExposureReduction: number;
  environmentalBenefit: string;
  actionChecklist: Array<{
    id: string;
    text: string;
    category: string;
  }>;
}
