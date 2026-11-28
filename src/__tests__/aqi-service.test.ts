import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getAirQuality,
  clearAQICache,
  parseWAQITimestamp,
  generate24HourDiurnalForecast,
  calculateIndianAQI,
} from '../lib/aqi-service';
import { getAQICategory } from '../lib/constants';

describe('AQI Service & Categorization Engine', () => {
  const originalEnv = process.env.WAQI_API_TOKEN;

  beforeEach(() => {
    clearAQICache();
    delete process.env.WAQI_API_TOKEN;
    // Default fetch stub ensures offline baseline tests remain deterministic even when online
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalEnv !== undefined) {
      process.env.WAQI_API_TOKEN = originalEnv;
    } else {
      delete process.env.WAQI_API_TOKEN;
    }
  });

  it('correctly maps Indian CPCB AQI bands to standard categories', () => {
    expect(getAQICategory(35)).toBe('Good');
    expect(getAQICategory(85)).toBe('Satisfactory');
    expect(getAQICategory(150)).toBe('Moderate');
    expect(getAQICategory(250)).toBe('Poor');
    expect(getAQICategory(350)).toBe('Very Poor');
    expect(getAQICategory(450)).toBe('Severe');
  });

  it('computes Indian CPCB AQI from PM2.5 and PM10 concentrations', () => {
    expect(calculateIndianAQI(0, 0)).toEqual({ aqi: 0, dominantPollutant: 'PM2.5' });
    expect(calculateIndianAQI(null, null)).toBeNull();
    const pm10Dominant = calculateIndianAQI(20, 250);
    expect(pm10Dominant?.dominantPollutant).toBe('PM10');
    expect(pm10Dominant?.aqi).toBe(200);
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

  it('caches consecutive requests and bypasses cache when forceRefresh is true', async () => {
    const firstCall = await getAirQuality('Bengaluru');
    const secondCall = await getAirQuality('Bengaluru');
    expect(firstCall.timestamp).toBe(secondCall.timestamp);

    await new Promise((r) => setTimeout(r, 15));
    const refreshedCall = await getAirQuality({ city: 'Bengaluru', forceRefresh: true });
    expect(refreshedCall.timestamp).not.toBe(firstCall.timestamp);
  });

  it('parses WAQI naive station timestamp with IST offset into UTC ISO', () => {
    const iso = parseWAQITimestamp('2026-11-27 22:00:00', '+05:30');
    expect(iso).toBe('2026-11-27T16:30:00.000Z');
  });

  it('never invents missing pollutants or AQI 120 when WAQI station reports "-"', async () => {
    process.env.WAQI_API_TOKEN = 'test-token';
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'ok',
            data: { aqi: '-', city: { name: 'Offline Station' }, iaqi: {} },
          }),
          { status: 200 }
        )
      )
      .mockRejectedValueOnce(new Error('open-meteo offline'));

    const data = await getAirQuality('Mumbai');
    expect(data.isFallback).toBe(true);
    expect(data.aqi).toBe(174);
  });

  it('leaves unreported live WAQI pollutants as null rather than fabricating ratios', async () => {
    process.env.WAQI_API_TOKEN = 'test-token';
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          status: 'ok',
          data: {
            aqi: 142,
            dominentpol: 'pm25',
            city: { name: 'Chennai Station' },
            time: { s: '2026-11-27 14:00:00', tz: '+05:30' },
            iaqi: { pm25: { v: 55 } },
          },
        }),
        { status: 200 }
      )
    );

    const data = await getAirQuality('Chennai');
    expect(data.isFallback).toBe(false);
    expect(data.aqi).toBe(142);
    expect(data.pollutants.pm25).toBe(55);
    expect(data.pollutants.pm10).toBeNull();
    expect(data.pollutants.no2).toBeNull();
    expect(data.timestamp).toBe('2026-11-27T08:30:00.000Z');
  });

  it('fetches live Open-Meteo data for GPS coordinates without WAQI token', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ city: 'Jaipur' }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            current: {
              time: '2026-11-27T17:30',
              pm2_5: 75,
              pm10: 140,
              carbon_monoxide: 1500,
              nitrogen_dioxide: 32,
              sulphur_dioxide: 10,
              ozone: 45,
            },
          }),
          { status: 200 }
        )
      );

    const data = await getAirQuality({ lat: 26.9124, lon: 75.7873 });
    expect(data.isFallback).toBe(false);
    expect(data.isLiveLocation).toBe(true);
    expect(data.city).toBe('Jaipur');
    expect(data.pollutants.co).toBe(1.5);
    expect(data.aqi).toBeGreaterThan(100);
    expect(data.source).toContain('Open-Meteo');
  });

  it('does not relabel Delhi baseline as an unmatched city when offline', async () => {
    const data = await getAirQuality('Chennai');
    expect(data.isFallback).toBe(true);
    expect(data.city).toBe('Delhi');
  });

  it('marks midday solar hours as safe windows in diurnal forecast', () => {
    const forecast = generate24HourDiurnalForecast(200, null);
    const midday = forecast.find((f) => f.hour === '14:00');
    const morning = forecast.find((f) => f.hour === '08:00');
    expect(midday?.isSafeWindow).toBe(true);
    expect(morning?.isSafeWindow).toBe(false);
    expect(midday?.pm25).toBeNull();
  });
});
