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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const tier = searchParams.get('tier') || '';
    const sort = searchParams.get('sort') || 'position';

    // Build query
    const query: any = { trackSlug: params.slug };

    if (search) {
      query.driverName = { $regex: search, $options: 'i' };
    }

    if (tier) {
      query.tier = tier;
    }

    // Build sort
    let sortQuery: any = {};
    switch (sort) {
      case 'position':
        sortQuery = { position: 1 };
        break;
      case 'time':
        sortQuery = { bestTime: 1 };
        break;
      case 'tier':
        sortQuery = { tier: 1, position: 1 };
        break;
      default:
        sortQuery = { position: 1 };
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Fetch records with pagination
    const [records, total] = await Promise.all([
      LapRecord.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      LapRecord.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      records,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch leaderboard',
      },
      { status: 500 }
    );
  }
}
