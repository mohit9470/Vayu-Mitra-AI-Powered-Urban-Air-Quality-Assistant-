import { NextRequest, NextResponse } from 'next/server';
import { getAirQuality } from '@/lib/aqi-service';
import { isValidCityInput, parseCoordinates, sanitizeText } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawLat = searchParams.get('lat');
    const rawLon = searchParams.get('lon');
    const forceRefresh = searchParams.get('fresh') === '1';

    if (rawLat !== null || rawLon !== null) {
      const coords = parseCoordinates(rawLat, rawLon);
      if (!coords) {
        return NextResponse.json(
          { error: 'Invalid lat/lon coordinates.' },
          { status: 400 }
        );
      }
      const data = await getAirQuality({
        lat: coords.latitude,
        lon: coords.longitude,
        forceRefresh,
      });
      return NextResponse.json(data);
    }

    const rawCity = searchParams.get('city');
    const city = rawCity ? sanitizeText(rawCity, 60) : 'Delhi';

    if (!isValidCityInput(city)) {
      return NextResponse.json(
        { error: 'Invalid city parameter. Provide 2-60 alphanumeric characters.' },
        { status: 400 }
      );
    }

    const data = await getAirQuality({ city, forceRefresh });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/aqi:', error);
    return NextResponse.json(
      { error: 'Failed to fetch air quality data' },
      { status: 500 }
    );
  }
}
