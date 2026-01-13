import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Track from '@/lib/models/Track';

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
