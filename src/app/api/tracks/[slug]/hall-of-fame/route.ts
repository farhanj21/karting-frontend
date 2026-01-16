import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WorldRecordHistory, { IWorldRecordHistory } from '@/lib/models/WorldRecordHistory';

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
      // If no kartType specified, get the ones with null kartType (track-wide)
      query.kartType = null;
    }

    // Get all world record history entries for this track/kart type
    // Sort by date broken (ascending) to show chronological progression
    const history = await WorldRecordHistory.find(query)
      .sort({ dateBroken: 1 })
      .lean() as unknown as IWorldRecordHistory[];

    if (!history || history.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No world record history found for this track/kart type',
      }, { status: 404 });
    }

    // Format response
    const response = {
      success: true,
      trackSlug: params.slug,
      kartType: kartType,
      hallOfFame: history.map((record) => ({
        driverName: record.driverName,
        driverSlug: record.driverSlug,
        profileUrl: record.profileUrl,
        recordTime: record.recordTime,
        recordTimeStr: record.recordTimeStr,
        dateBroken: record.dateBroken,
        daysReigned: record.daysReigned,
        isCurrent: record.isCurrent,
      })),
      totalRecords: history.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching hall of fame:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch hall of fame data',
      },
      { status: 500 }
    );
  }
}
