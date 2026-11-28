import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getAQI } from '../app/api/aqi/route';
import { POST as postRecommend } from '../app/api/recommend/route';
import { clearAQICache } from '../lib/aqi-service';
import { clearRateLimits } from '../lib/rate-limit';

describe('API Route Handlers Validation, Security & Grounding', () => {
  beforeEach(() => {
    clearAQICache();
    clearRateLimits();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /api/aqi rejects invalid city parameters and partial coords with 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/aqi?city=!!!invalid!!!');
    const res = await getAQI(req);
    expect(res.status).toBe(400);

    const partialCoords = new NextRequest('http://localhost:3000/api/aqi?lat=28.6');
    expect((await getAQI(partialCoords)).status).toBe(400);
  });

  it('GET /api/aqi rejects out-of-range coordinates with 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/aqi?lat=999&lon=77.2');
    const res = await getAQI(req);
    expect(res.status).toBe(400);
  });

  it('GET /api/aqi returns station telemetry for valid city and valid coordinates', async () => {
    const cityReq = new NextRequest('http://localhost:3000/api/aqi?city=Mumbai');
    const cityRes = await getAQI(cityReq);
    const cityJson = await cityRes.json();
    expect(cityRes.status).toBe(200);
    expect(cityJson.city).toBe('Mumbai');
    expect(cityJson.aqi).toBeGreaterThan(0);

    const geoReq = new NextRequest('http://localhost:3000/api/aqi?lat=19.07&lon=72.87&fresh=1');
    const geoRes = await getAQI(geoReq);
    const geoJson = await geoRes.json();
    expect(geoRes.status).toBe(200);
    expect(geoJson.isLiveLocation).toBe(true);
    expect(geoJson.city).toBe('Mumbai');
  });

  it('POST /api/recommend returns 400 for malformed JSON or unknown fields', async () => {
    const badJson = new NextRequest('http://localhost:3000/api/recommend', {
      method: 'POST',
      body: '{not-valid-json',
    });
    expect((await postRecommend(badJson)).status).toBe(400);

    const extraField = new NextRequest('http://localhost:3000/api/recommend', {
      method: 'POST',
      body: JSON.stringify({ city: 'Delhi', user_id: 'attacker-spoof' }),
    });
    expect((await postRecommend(extraField)).status).toBe(400);
  });

  it('POST /api/recommend rejects oversized payloads with 413', async () => {
    const hugeBody = JSON.stringify({ city: 'Delhi', notes: 'a'.repeat(20_000) });
    const req = new NextRequest('http://localhost:3000/api/recommend', {
      method: 'POST',
      body: hugeBody,
    });
    const res = await postRecommend(req);
    expect(res.status).toBe(413);
  });

  it('POST /api/recommend enforces per-IP rate limiting with 429', async () => {
    for (let i = 0; i < 20; i++) {
      const okReq = new NextRequest('http://localhost:3000/api/recommend', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.50' },
        body: JSON.stringify({ city: 'Delhi', persona: 'daily_commuter' }),
      });
      expect((await postRecommend(okReq)).status).toBe(200);
    }

    const blockedReq = new NextRequest('http://localhost:3000/api/recommend', {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.50' },
      body: JSON.stringify({ city: 'Delhi', persona: 'daily_commuter' }),
    });
    const blockedRes = await postRecommend(blockedReq);
    expect(blockedRes.status).toBe(429);
    expect(Number(blockedRes.headers.get('retry-after'))).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/recommend rejects invalid persona or invalid coordinates with 400', async () => {
    const badPersonaReq = new NextRequest('http://localhost:3000/api/recommend', {
      method: 'POST',
      body: JSON.stringify({ city: 'Delhi', persona: 'unknown_role' }),
    });
    expect((await postRecommend(badPersonaReq)).status).toBe(400);

    const badCoordReq = new NextRequest('http://localhost:3000/api/recommend', {
      method: 'POST',
      body: JSON.stringify({ coordinates: { latitude: 'bad', longitude: 77 }, persona: 'daily_commuter' }),
    });
    expect((await postRecommend(badCoordReq)).status).toBe(400);
  });

  it('POST /api/recommend returns grounded airQuality and 3-pillar plan for city or GPS coordinates', async () => {
    const req = new NextRequest('http://localhost:3000/api/recommend', {
      method: 'POST',
      body: JSON.stringify({
        coordinates: { latitude: 22.528, longitude: 88.3653 },
        persona: 'fitness_enthusiast',
        routine: { commuteMode: 'walking', hasAirPurifier: false, indoorPlants: true },
      }),
    });
    const res = await postRecommend(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.airQuality.isLiveLocation).toBe(true);
    expect(json.airQuality.city).toBe('Kolkata');
    expect(json.plan.personaTitle).toContain('Aerobic Threshold');
  });
});
