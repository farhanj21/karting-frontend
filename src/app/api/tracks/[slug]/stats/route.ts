import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LapRecord from '@/lib/models/LapRecord';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    // Get tier distribution
    const tierDistribution = await LapRecord.aggregate([
      { $match: { trackSlug: params.slug } },
      {
        $group: {
          _id: '$tier',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get time distribution (bins)
    const times = await LapRecord.find({ trackSlug: params.slug })
      .select('bestTime')
      .lean();

    const timeValues = times.map((t) => t.bestTime);
    const minTime = Math.min(...timeValues);
    const maxTime = Math.max(...timeValues);
    const binCount = 20;
    const binSize = (maxTime - minTime) / binCount;

    const timeDistribution = [];
    for (let i = 0; i < binCount; i++) {
      const binStart = minTime + i * binSize;
      const binEnd = binStart + binSize;
      const count = timeValues.filter((t) => t >= binStart && t < binEnd).length;

      if (count > 0) {
        timeDistribution.push({
          bin: `${(binStart / 60).toFixed(2)}-${(binEnd / 60).toFixed(2)}`,
          minTime: binStart,
          maxTime: binEnd,
          count,
        });
      }
    }

    // Calculate total for percentages
    const total = await LapRecord.countDocuments({ trackSlug: params.slug });

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
