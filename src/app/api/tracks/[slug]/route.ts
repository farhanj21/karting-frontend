import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Track from '@/lib/models/Track';
import LapRecord from '@/lib/models/LapRecord';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const track = await Track.findOne({ slug: params.slug }).lean();

    if (!track) {
      return NextResponse.json(
        {
          success: false,
          error: 'Track not found',
        },
        { status: 404 }
      );
    }

    // Calculate mean if not present
    if (!track.stats.mean) {
      const result = await LapRecord.aggregate([
        { $match: { trackSlug: params.slug } },
        {
          $group: {
            _id: null,
            mean: { $avg: '$bestTime' },
          },
        },
      ]);

      if (result.length > 0) {
        track.stats.mean = result[0].mean;
      } else {
        track.stats.mean = track.stats.median; // Fallback to median if no records
      }
    }

    return NextResponse.json({
      success: true,
      track,
    });
  } catch (error) {
    console.error('Error fetching track:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch track',
      },
      { status: 500 }
    );
  }
}
