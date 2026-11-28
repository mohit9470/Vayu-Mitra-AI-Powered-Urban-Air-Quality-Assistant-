import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getAQI } from '../app/api/aqi/route';
import { POST as postRecommend } from '../app/api/recommend/route';
import { clearAQICache } from '../lib/aqi-service';
import { AQI_PALETTE, getAQICategory, getAQITheme } from '../lib/constants';
import { PersonaType } from '../types/aqi';

describe('Normal User Flows & Edge Cases', () => {
  beforeEach(() => {
    clearAQICache();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('supports every normal-user persona and commute mode across cities without errors', async () => {
    const scenarios: Array<{
      city: string;
      persona: PersonaType;
      commuteMode: 'two_wheeler' | 'metro_transit' | 'car_cab' | 'walking';
      hasAirPurifier: boolean;
      indoorPlants: boolean;
    }> = [
      { city: 'Delhi', persona: 'daily_commuter', commuteMode: 'metro_transit', hasAirPurifier: false, indoorPlants: true },
      { city: 'Mumbai', persona: 'daily_commuter', commuteMode: 'two_wheeler', hasAirPurifier: false, indoorPlants: false },
      { city: 'Bengaluru', persona: 'fitness_enthusiast', commuteMode: 'walking', hasAirPurifier: true, indoorPlants: true },
      { city: 'Pune', persona: 'parent_kids', commuteMode: 'car_cab', hasAirPurifier: true, indoorPlants: false },
      { city: 'Hyderabad', persona: 'senior_sensitive', commuteMode: 'walking', hasAirPurifier: false, indoorPlants: true },
    ];

    for (const s of scenarios) {
      const req = new NextRequest('http://localhost:3000/api/recommend', {
        method: 'POST',
        body: JSON.stringify({
          city: s.city,
          persona: s.persona,
          routine: {
            commuteMode: s.commuteMode,
            hasAirPurifier: s.hasAirPurifier,
            indoorPlants: s.indoorPlants,
          },
        }),
      });
      const res = await postRecommend(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.airQuality.city).toBe(s.city);
      expect(json.plan.outdoorSchedulePlan.length).toBeGreaterThanOrEqual(1);
      expect(json.plan.indoorAirHacks.length).toBeGreaterThanOrEqual(1);
      expect(json.plan.commuteAlternatives.length).toBeGreaterThanOrEqual(1);
      expect(json.plan.actionChecklist.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('rejects XSS-like or invalid city inputs safely with HTTP 400', async () => {
    const xssReq = new NextRequest(
      'http://localhost:3000/api/aqi?city=' + encodeURIComponent('<script>alert(1)</script>')
    );
    const xssRes = await getAQI(xssReq);
    expect(xssRes.status).toBe(400);

    const postXssReq = new NextRequest('http://localhost:3000/api/recommend', {
      method: 'POST',
      body: JSON.stringify({ city: '<img src=x onerror=alert(1)>', persona: 'daily_commuter' }),
    });
    const postXssRes = await postRecommend(postXssReq);
    expect(postXssRes.status).toBe(400);
  });

  it('provides valid light and dark mode palette classes for every AQI category', () => {
    const sampleAQIs = [20, 80, 150, 250, 350, 460];
    for (const aqi of sampleAQIs) {
      const category = getAQICategory(aqi);
      const theme = getAQITheme(category);
      expect(AQI_PALETTE[category]).toBeDefined();
      expect(theme.pillBg).toContain('dark:bg-');
      expect(theme.pillText).toContain('dark:text-');
      expect(theme.pillBorder).toContain('dark:border-');
    }
  });
});
