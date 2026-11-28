import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAirQuality } from '@/lib/aqi-service';
import { generateActionPlan } from '@/lib/gemini-service';
import { sanitizeText } from '@/lib/constants';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { UserContext } from '@/types/aqi';

const RECOMMEND_RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;
const MAX_BODY_BYTES = 16_384;

const optionalRoutineText = z
  .string()
  .transform((s) => sanitizeText(s, 100) || undefined)
  .optional();

const recommendBodySchema = z
  .object({
    city: z
      .string()
      .transform((s) => sanitizeText(s, 60))
      .pipe(z.string().min(2).max(60).regex(/^[a-zA-Z0-9\s,.-]+$/))
      .optional(),
    coordinates: z
      .object({
        latitude: z.number().finite().min(-90).max(90),
        longitude: z.number().finite().min(-180).max(180),
      })
      .strict()
      .optional(),
    persona: z
      .enum(['parent_kids', 'senior_sensitive', 'daily_commuter', 'fitness_enthusiast'])
      .default('daily_commuter'),
    routine: z
      .object({
        morningOutdoorTime: optionalRoutineText,
        commuteTime: optionalRoutineText,
        commuteMode: z
          .enum(['two_wheeler', 'metro_transit', 'car_cab', 'walking'])
          .optional(),
        eveningOutdoorTime: optionalRoutineText,
        hasAirPurifier: z.boolean().default(false),
        indoorPlants: z.boolean().default(true),
      })
      .optional(),
    notes: z
      .string()
      .transform((s) => sanitizeText(s, 160) || undefined)
      .optional(),
    forceRefresh: z.boolean().optional(),
  })
  .strict();

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`recommend:${ip}`, RECOMMEND_RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Request payload too large' }, { status: 413 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: 'Unable to read request body' }, { status: 400 });
  }

  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Request payload too large' }, { status: 413 });
  }

  let jsonInput: unknown;
  try {
    jsonInput = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
  }

  const parsed = recommendBodySchema.safeParse(jsonInput);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }

  const { city, coordinates, persona, routine, notes, forceRefresh } = parsed.data;

  try {
    const airQuality = await getAirQuality(
      coordinates
        ? { lat: coordinates.latitude, lon: coordinates.longitude, forceRefresh }
        : { city: city ?? 'Delhi', forceRefresh }
    );

    const userContext: UserContext = {
      persona,
      city: airQuality.city,
      routine: {
        morningOutdoorTime: routine?.morningOutdoorTime,
        commuteTime: routine?.commuteTime,
        commuteMode: routine?.commuteMode,
        eveningOutdoorTime: routine?.eveningOutdoorTime,
        hasAirPurifier: routine?.hasAirPurifier ?? false,
        indoorPlants: routine?.indoorPlants ?? true,
      },
      notes,
    };

    const plan = await generateActionPlan(airQuality, userContext);

    return NextResponse.json({
      success: true,
      airQuality,
      plan,
    });
  } catch (error) {
    console.error('[API /recommend] Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Unable to process recommendation request' },
      { status: 500 }
    );
  }
}
