import { NextRequest, NextResponse } from 'next/server';
import { getAirQuality } from '@/lib/aqi-service';
import { generateActionPlan } from '@/lib/gemini-service';
import { UserContext } from '@/types/aqi';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const city = body.city || 'Delhi';
    const userContext: UserContext = {
      persona: body.persona || 'daily_commuter',
      city,
      routine: body.routine || {
        hasAirPurifier: false,
        indoorPlants: true,
      },
      notes: body.notes,
    };

    // 1. Fetch verified live air quality metrics first
    // (Never invent or hallucinate AQI values)
    const airQuality = await getAirQuality(city);

    // 2. Generate grounded actionable plan
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
