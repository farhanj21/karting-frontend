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
      <div className="rounded-lg border bg-surface px-3 py-2 shadow-md">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Lap Time</p>
        <p className="font-mono text-sm tabular-nums text-zinc-100">{formatTime(data.timeInSeconds)}</p>
        <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Drivers</p>
        <p className="text-sm font-semibold tabular-nums text-zinc-100">{data.count}</p>
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

  const hasWarZone = Boolean(warZoneStart && warZoneEnd);

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const payload = data.activePayload[0].payload;
      onTimeClick?.(payload.timeInSeconds);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-zinc-500">Click a bar to filter drivers by lap time</p>
        {hasWarZone && (
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: 'var(--chart-bar)' }} />
              Lap times
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: 'var(--chart-warzone)' }} />
              War zone
            </span>
          </div>
        )}
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            onClick={handleChartClick}
            barCategoryGap="10%"
          >
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis
              dataKey="timeInSeconds"
              tickFormatter={formatTime}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
            />
            <YAxis
              width={40}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--chart-cursor)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} cursor="pointer">
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={isInWarZone(entry.timeInSeconds) ? 'var(--chart-warzone)' : 'var(--chart-bar)'}
                  opacity={selectedTime !== undefined && selectedTime !== entry.timeInSeconds ? 0.3 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
