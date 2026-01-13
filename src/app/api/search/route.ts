import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Driver from '@/lib/models/Driver';

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        drivers: [],
      });
    }

    const drivers = await Driver.find({
      name: { $regex: query, $options: 'i' },
    })
      .select('name slug profileUrl records')
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      drivers,
    });
  } catch (error) {
    console.error('Error searching drivers:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search drivers',
      },
      { status: 500 }
    );
  }
}
