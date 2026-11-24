import { NextRequest, NextResponse } from 'next/server';
import { getAirQuality } from '@/lib/aqi-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'Delhi';

    const data = await getAirQuality(city);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/aqi:', error);
    return NextResponse.json(
      { error: 'Failed to fetch air quality data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const city = body.city || 'Delhi';

    const data = await getAirQuality(city);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/aqi POST:', error);
    return NextResponse.json(
      { error: 'Failed to process air quality request' },
      { status: 500 }
    );
  }
}
