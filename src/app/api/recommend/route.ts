import { NextRequest, NextResponse } from 'next/server';
import { getAirQuality } from '@/lib/aqi-service';
import { generateActionPlan } from '@/lib/gemini-service';
import {
  isValidCityInput,
  parseCoordinates,
  sanitizeText,
  VALID_COMMUTE_MODES,
  VALID_PERSONAS,
} from '@/lib/constants';
import { PersonaType, UserContext } from '@/types/aqi';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
  }

  let coords: { latitude: number; longitude: number } | null = null;
  if (body.coordinates !== undefined && body.coordinates !== null) {
    if (typeof body.coordinates !== 'object' || Array.isArray(body.coordinates)) {
      return NextResponse.json({ error: 'Invalid coordinates object' }, { status: 400 });
    }
    const rawCoords = body.coordinates as Record<string, unknown>;
    coords = parseCoordinates(rawCoords.latitude, rawCoords.longitude);
    if (!coords) {
      return NextResponse.json({ error: 'Invalid latitude/longitude values' }, { status: 400 });
    }
  }

  const city = body.city !== undefined ? sanitizeText(body.city, 60) : 'Delhi';
  if (!coords && !isValidCityInput(city)) {
    return NextResponse.json({ error: 'Invalid city name' }, { status: 400 });
  }

  const persona = (body.persona ?? 'daily_commuter') as PersonaType;
  if (!VALID_PERSONAS.has(persona)) {
    return NextResponse.json({ error: 'Invalid persona selection' }, { status: 400 });
  }

  const rawRoutine =
    body.routine && typeof body.routine === 'object'
      ? (body.routine as Record<string, unknown>)
      : {};

  const commuteMode = rawRoutine.commuteMode as UserContext['routine']['commuteMode'] | undefined;
  if (commuteMode !== undefined && !VALID_COMMUTE_MODES.has(commuteMode)) {
    return NextResponse.json({ error: 'Invalid commuteMode selection' }, { status: 400 });
  }

  const forceRefresh = Boolean(body.forceRefresh);

  try {
    const airQuality = await getAirQuality(
      coords
        ? { lat: coords.latitude, lon: coords.longitude, forceRefresh }
        : { city, forceRefresh }
    );

    const userContext: UserContext = {
      persona,
      city: airQuality.city,
      routine: {
        morningOutdoorTime: sanitizeText(rawRoutine.morningOutdoorTime, 100) || undefined,
        commuteTime: sanitizeText(rawRoutine.commuteTime, 100) || undefined,
        commuteMode,
        eveningOutdoorTime: sanitizeText(rawRoutine.eveningOutdoorTime, 100) || undefined,
        hasAirPurifier: Boolean(rawRoutine.hasAirPurifier),
        indoorPlants: rawRoutine.indoorPlants !== undefined ? Boolean(rawRoutine.indoorPlants) : true,
      },
      notes: sanitizeText(body.notes, 160) || undefined,
    };

    const plan = await generateActionPlan(airQuality, userContext);

    return NextResponse.json({
      success: true,
      airQuality,
      plan,
    });
  } catch (error) {
    console.error('Error in /api/recommend:', error);
    return NextResponse.json(
      { error: 'Failed to generate action plan' },
      { status: 500 }
    );
  }
}
