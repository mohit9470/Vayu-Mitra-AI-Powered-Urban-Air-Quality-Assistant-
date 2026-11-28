import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generateActionPlan, generateDeterministicPlan } from '../lib/gemini-service';
import { AirQualityData, UserContext } from '../types/aqi';

describe('GenAI Reasoning & Impact Calculation Engine', () => {
  const originalKey = process.env.GEMINI_API_KEY;

  const mockDelhiSevereAQI: AirQualityData = {
    city: 'Delhi',
    stationName: 'Anand Vihar, Delhi DPCC',
    country: 'India',
    aqi: 388,
    category: 'Very Poor',
    dominantPollutant: 'PM2.5',
    pollutants: {
      pm25: 236.4,
      pm10: 362.1,
      no2: 68.2,
      so2: 18.5,
      co: 2.8,
    },
    timestamp: '2026-11-24T12:00:00.000Z',
    source: 'CPCB / DPCC Real-Time Feed',
  };

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalKey !== undefined) {
      process.env.GEMINI_API_KEY = originalKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  it('generates grounded plan strictly matching input AQI metrics without hallucination', () => {
    const context: UserContext = {
      city: 'Delhi',
      persona: 'parent_kids',
      routine: {
        hasAirPurifier: true,
        indoorPlants: true,
      },
    };

    const plan = generateDeterministicPlan(mockDelhiSevereAQI, context);

    expect(plan.liveAQI).toBe(388);
    expect(plan.category).toBe('Very Poor');
    expect(plan.city).toBe('Delhi');
    expect(plan.personaTitle).toContain('Child Health');
  });

  it('includes all 3 required core functional pillars', () => {
    const context: UserContext = {
      city: 'Delhi',
      persona: 'parent_kids',
      routine: {
        hasAirPurifier: true,
        indoorPlants: false,
      },
    };

    const plan = generateDeterministicPlan(mockDelhiSevereAQI, context);

    expect(plan.outdoorSchedulePlan.length).toBeGreaterThanOrEqual(1);
    expect(plan.outdoorSchedulePlan[0].category).toBe('outdoor_schedule');
    expect(plan.outdoorSchedulePlan[0].impactJustification).toBeDefined();

    expect(plan.indoorAirHacks.length).toBeGreaterThanOrEqual(1);
    expect(plan.indoorAirHacks[0].category).toBe('indoor_hacks');

    expect(plan.commuteAlternatives.length).toBeGreaterThanOrEqual(1);
    expect(plan.commuteAlternatives[0].category).toBe('sustainable_commute');
  });

  it('calculates significant personal exposure reduction and environmental benefits', () => {
    const context: UserContext = {
      city: 'Delhi',
      persona: 'daily_commuter',
      routine: {
        commuteMode: 'two_wheeler',
        hasAirPurifier: false,
        indoorPlants: false,
      },
    };

    const plan = generateDeterministicPlan(mockDelhiSevereAQI, context);

    expect(plan.overallExposureReduction).toBeGreaterThan(0);
    expect(plan.overallExposureReduction).toBeLessThanOrEqual(100);
    expect(plan.environmentalBenefit).toContain('CO2');
    expect(plan.actionChecklist.length).toBeGreaterThanOrEqual(3);
  });

  it('customizes advice for Senior / Sensitive profile', () => {
    const context: UserContext = {
      city: 'Kolkata',
      persona: 'senior_sensitive',
      routine: {
        hasAirPurifier: false,
        indoorPlants: true,
      },
    };

    const plan = generateDeterministicPlan(mockDelhiSevereAQI, context);

    expect(plan.personaTitle).toContain('Cardiopulmonary');
    expect(plan.outdoorSchedulePlan[0].description).toContain('indoor');
  });

  it('generates dedicated aerobic training guidance for fitness_enthusiast persona', () => {
    const context: UserContext = {
      city: 'Delhi',
      persona: 'fitness_enthusiast',
      routine: {
        hasAirPurifier: false,
        indoorPlants: true,
      },
    };

    const plan = generateDeterministicPlan(mockDelhiSevereAQI, context);

    expect(plan.personaTitle).toContain('Aerobic Threshold');
    expect(plan.outdoorSchedulePlan[0].description).toContain('minute ventilation');
  });

  it('passes Gemini API key in header and sanitizes markdown fences', async () => {
    process.env.GEMINI_API_KEY = 'secret-gemini-key';
    const validGeminiPayload = {
      personaTitle: 'Custom Gemini Title',
      summaryQuote: 'Stay indoors this morning.',
      outdoorSchedulePlan: [
        {
          id: 'g-out-1',
          title: 'Afternoon outing',
          description: 'Go out at 1 PM.',
          category: 'outdoor_schedule',
          impactJustification: 'Lower PM2.5 load.',
          exposureReductionPercent: 45,
          timeframe: '13:00',
          difficulty: 'Easy',
        },
      ],
      indoorAirHacks: [
        {
          id: 'g-in-1',
          title: 'Wet mop',
          description: 'Avoid dry sweeping.',
          category: 'indoor_hacks',
          impactJustification: 'Less dust.',
          exposureReductionPercent: 30,
          difficulty: 'Easy',
        },
      ],
      commuteAlternatives: [
        {
          id: 'g-com-1',
          title: 'Take Metro',
          description: 'Avoid open roads.',
          category: 'sustainable_commute',
          impactJustification: 'Reduced exhaust.',
          exposureReductionPercent: 50,
          difficulty: 'Moderate',
        },
      ],
      overallExposureReduction: 48,
      environmentalBenefit: 'Saves 2 kg CO2.',
      actionChecklist: [{ id: 'c1', text: 'Use metro', category: 'Commute' }],
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [{ text: '```json\n' + JSON.stringify(validGeminiPayload) + '\n```' }],
              },
            },
          ],
        }),
        { status: 200 }
      )
    );

    const plan = await generateActionPlan(mockDelhiSevereAQI, {
      city: 'Delhi',
      persona: 'daily_commuter',
      routine: { hasAirPurifier: false, indoorPlants: true },
    });

    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).not.toContain('secret-gemini-key');
    expect((init?.headers as Record<string, string>)['x-goog-api-key']).toBe('secret-gemini-key');
    expect(plan.personaTitle).toBe('Custom Gemini Title');
    expect(plan.liveAQI).toBe(388);
  });

  it('falls back to deterministic plan if Gemini returns incomplete JSON schema', async () => {
    process.env.GEMINI_API_KEY = 'secret-gemini-key';
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: '{"personaTitle":"Broken"}' }] } }],
        }),
        { status: 200 }
      )
    );

    const plan = await generateActionPlan(mockDelhiSevereAQI, {
      city: 'Delhi',
      persona: 'parent_kids',
      routine: { hasAirPurifier: true, indoorPlants: true },
    });

    expect(plan.outdoorSchedulePlan.length).toBeGreaterThan(0);
    expect(plan.personaTitle).toContain('Child Health');
  });
});
