import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LapRecord from '@/lib/models/LapRecord';

// Helper function to format seconds to MM:SS
function formatTimeSimple(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const kartType = searchParams.get('kartType');

    const matchQuery: any = { trackSlug: params.slug };
    if (kartType) {
      matchQuery.kartType = kartType;
    }

    // Get tier distribution
    const tierDistribution = await LapRecord.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$tier',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get time distribution (bins)
    const times = await LapRecord.find(matchQuery)
      .select('bestTime')
      .lean();

    if (times.length === 0) {
      return NextResponse.json({
        success: true,
        tierDistribution: [],
        timeDistribution: [],
      });
    }

    const timeValues = times.map((t) => t.bestTime);
    const minTime = Math.min(...timeValues);
    const maxTime = Math.max(...timeValues);
    const binCount = Math.min(20, timeValues.length);
    const binSize = (maxTime - minTime) / binCount;

    const timeDistribution = [];
    if (binSize > 0) {
      for (let i = 0; i < binCount; i++) {
        const binStart = minTime + i * binSize;
        const binEnd = binStart + binSize;
        const count = timeValues.filter((t) => t >= binStart && (i === binCount - 1 ? t <= binEnd : t < binEnd)).length;

        if (count > 0) {
          timeDistribution.push({
            bin: `${formatTimeSimple(binStart)} - ${formatTimeSimple(binEnd)}`,
            minTime: binStart,
            maxTime: binEnd,
            count,
          });
        }
      }
    } else {
      // All times are the same
      timeDistribution.push({
        bin: formatTimeSimple(minTime),
        minTime,
        maxTime,
        count: timeValues.length,
      });
    }

    // Calculate total for percentages
    const total = times.length;

    const tierDistributionWithPercentage = tierDistribution.map((item) => ({
      tier: item._id,
      count: item.count,
      percentage: (item.count / total) * 100,
    }));

    return NextResponse.json({
      success: true,
      tierDistribution: tierDistributionWithPercentage,
      timeDistribution,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch stats',
      },
      { status: 500 }
    );
  }
}
