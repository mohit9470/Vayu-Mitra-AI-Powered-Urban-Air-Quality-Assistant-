import { describe, it, expect } from 'vitest';
import { generateDeterministicPlan } from '../lib/gemini-service';
import { AirQualityData, UserContext } from '../types/aqi';

describe('GenAI Reasoning & Impact Calculation Engine', () => {
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

    // Pillar 1: Low-Emission Daily Routines & Activity Rescheduling
    expect(plan.outdoorSchedulePlan.length).toBeGreaterThanOrEqual(1);
    expect(plan.outdoorSchedulePlan[0].category).toBe('outdoor_schedule');
    expect(plan.outdoorSchedulePlan[0].impactJustification).toBeDefined();

    // Pillar 2: Actionable Indoor Air Quality (IAQ) Hacks
    expect(plan.indoorAirHacks.length).toBeGreaterThanOrEqual(1);
    expect(plan.indoorAirHacks[0].category).toBe('indoor_hacks');

    // Pillar 3: Sustainable Alternatives & Commute Optimization
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
});
