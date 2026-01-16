import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WarZone, { IWarZone } from '@/lib/models/WarZone';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const kartType = searchParams.get('kartType');

    // Build query
    const query: any = { trackSlug: params.slug };

    if (kartType) {
      query.kartType = kartType;
    } else {
      // If no kartType specified, get the one with null kartType (track-wide)
      query.kartType = null;
    }

    const warZone = await WarZone.findOne(query).lean() as unknown as IWarZone | null;

    if (!warZone) {
      return NextResponse.json({
        success: false,
        error: 'War zone not found for this track/kart type',
      }, { status: 404 });
    }

    // Format response
    const response = {
      success: true,
      trackSlug: warZone.trackSlug,
      kartType: warZone.kartType,
      warZone: {
        timeStart: warZone.timeStart,
        timeEnd: warZone.timeEnd,
        driverCount: warZone.driverCount,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching war zone:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch war zone data',
      },
      { status: 500 }
    );
  }
}
