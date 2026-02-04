import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LapRecord from '@/lib/models/LapRecord';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const minTime = parseFloat(searchParams.get('minTime') || '0');
    const maxTime = parseFloat(searchParams.get('maxTime') || '999999');
    const kartType = searchParams.get('kartType') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query
    const query: any = {
      trackSlug: params.slug,
      bestTime: { $gte: minTime, $lte: maxTime }
    };

    if (kartType) {
      query.kartType = kartType;
    }

    // Get total count
    const totalCount = await LapRecord.countDocuments(query);

    // Fetch records in time range with pagination
    const records = await LapRecord.find(query)
      .sort({ bestTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      records,
      count: records.length,
      totalCount,
      hasMore: page * limit < totalCount,
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching time range drivers:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch time range drivers',
      },
      { status: 500 }
    );
  }
}
