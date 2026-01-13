import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Track from '@/lib/models/Track';

export async function GET() {
  try {
    await connectDB();

    const tracks = await Track.find({}).sort({ 'stats.totalDrivers': -1 }).lean();

    return NextResponse.json({
      success: true,
      tracks,
    });
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tracks',
      },
      { status: 500 }
    );
  }
}
