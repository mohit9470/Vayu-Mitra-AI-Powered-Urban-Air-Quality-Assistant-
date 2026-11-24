import { describe, it, expect, beforeEach } from 'vitest';
import { getAirQuality, clearAQICache } from '../lib/aqi-service';
import { getAQICategory } from '../lib/constants';

describe('AQI Service & Categorization Engine', () => {
  beforeEach(() => {
    clearAQICache();
  });

  it('correctly maps Indian CPCB AQI bands to standard categories', () => {
    expect(getAQICategory(35)).toBe('Good');
    expect(getAQICategory(85)).toBe('Satisfactory');
    expect(getAQICategory(150)).toBe('Moderate');
    expect(getAQICategory(250)).toBe('Poor');
    expect(getAQICategory(350)).toBe('Very Poor');
    expect(getAQICategory(450)).toBe('Severe');
  });

  it('fetches verified station data for Delhi with exact attribution', async () => {
    const data = await getAirQuality('Delhi');
    expect(data.city).toBe('Delhi');
    expect(data.stationName).toContain('Anand Vihar');
    expect(data.aqi).toBeGreaterThan(0);
    expect(data.pollutants.pm25).toBeGreaterThan(0);
    expect(data.pollutants.pm10).toBeGreaterThan(0);
    expect(data.timestamp).toBeDefined();
    expect(data.source).toBeDefined();
  });

  it('fetches verified station data for Mumbai BKC', async () => {
    const data = await getAirQuality('Mumbai');
    expect(data.city).toBe('Mumbai');
    expect(data.stationName).toContain('Bandra Kurla Complex');
    expect(data.category).toBe('Moderate');
  });

  it('fetches verified station data for Kolkata Ballygunge', async () => {
    const data = await getAirQuality('Kolkata');
    expect(data.city).toBe('Kolkata');
    expect(data.stationName).toContain('Ballygunge');
    expect(data.category).toBe('Poor');
  });

  it('caches consecutive requests to minimize external API calls', async () => {
    const firstCall = await getAirQuality('Bengaluru');
    const secondCall = await getAirQuality('Bengaluru');
    expect(firstCall.timestamp).toBe(secondCall.timestamp);
  });
});
