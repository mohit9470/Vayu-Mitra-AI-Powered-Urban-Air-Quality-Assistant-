import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAirQuality } from '@/lib/aqi-service';
import { sanitizeText } from '@/lib/constants';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const AQI_RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

const numericCoord = (min: number, max: number) =>
  z.string().trim().min(1).transform(Number).pipe(z.number().finite().min(min).max(max));

const aqiQuerySchema = z.object({
  city: z
    .string()
    .transform((s) => sanitizeText(s, 60))
    .pipe(z.string().min(2).max(60).regex(/^[a-zA-Z0-9\s,.-]+$/))
    .optional(),
  lat: numericCoord(-90, 90).optional(),
  lon: numericCoord(-180, 180).optional(),
  fresh: z.enum(['0', '1']).optional(),
});

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`aqi:${ip}`, AQI_RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawLat = searchParams.get('lat');
    const rawLon = searchParams.get('lon');
    const rawCity = searchParams.get('city');
    const rawFresh = searchParams.get('fresh');

    if ((rawLat !== null) !== (rawLon !== null)) {
      return NextResponse.json(
        { error: 'Both lat and lon parameters are required together.' },
        { status: 400 }
      );
    }

    const parsed = aqiQuerySchema.safeParse({
      city: rawCity ?? undefined,
      lat: rawLat ?? undefined,
      lon: rawLon ?? undefined,
      fresh: rawFresh ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters.' },
        { status: 400 }
      );
    }

    const { lat, lon, city, fresh } = parsed.data;
    const forceRefresh = fresh === '1';

    if (lat !== undefined && lon !== undefined) {
      const data = await getAirQuality({ lat, lon, forceRefresh });
      return NextResponse.json(data);
    }

    const data = await getAirQuality({ city: city ?? 'Delhi', forceRefresh });
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API /aqi] Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Unable to fetch air quality data' },
      { status: 500 }
    );
  }
}
