'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DifficultyData {
  timeInSeconds: number;
  count: number;
}

interface DifficultyWallChartProps {
  data: DifficultyData[];
  warZoneStart?: number;
  warZoneEnd?: number;
  onTimeClick?: (timeInSeconds: number) => void;
  selectedTime?: number;
}

const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface border border-surfaceHover rounded-lg p-3 shadow-lg">
        <p className="text-sm text-gray-400 mb-1">Lap Time</p>
        <p className="text-lg font-bold text-white mb-2">{formatTime(data.timeInSeconds)}</p>
        <p className="text-sm text-gray-400 mb-1">Drivers</p>
        <p className="text-xl font-bold text-accent">{data.count}</p>
      </div>
    );
  }
  return null;
};

export default function DifficultyWallChart({
  data,
  warZoneStart,
  warZoneEnd,
  onTimeClick,
  selectedTime,
}: DifficultyWallChartProps) {
  // Determine if a bar is in the war zone
  const isInWarZone = (timeInSeconds: number) => {
    if (!warZoneStart || !warZoneEnd) return false;
    return timeInSeconds >= Math.floor(warZoneStart) && timeInSeconds <= Math.floor(warZoneEnd);
  };

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const payload = data.activePayload[0].payload;
      onTimeClick?.(payload.timeInSeconds);
    }
  };

  return (
    <div className="w-full">
      <p className="text-xs text-gray-500 mb-4">Click on a bar to filter drivers by lap time</p>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            onClick={handleChartClick}
            barCategoryGap="10%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="timeInSeconds"
              tickFormatter={formatTime}
              stroke="#9CA3AF"
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              label={{
                value: 'Number of Drivers',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#9CA3AF', fontSize: 14 },
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} cursor="pointer">
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    isInWarZone(entry.timeInSeconds)
                      ? 'url(#warZoneGradient)'
                      : 'url(#normalGradient)'
                  }
                  opacity={selectedTime !== undefined && selectedTime !== entry.timeInSeconds ? 0.3 : 1}
                />
              ))}
            </Bar>
            <defs>
              <linearGradient id="normalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="warZoneGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F97316" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0.6} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
