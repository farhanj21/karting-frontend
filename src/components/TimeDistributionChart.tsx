'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TimeDistribution } from '@/types';
import { formatTime } from '@/lib/utils';

interface TimeDistributionChartProps {
  data: TimeDistribution[];
  onTimeRangeClick?: (minTime: number, maxTime: number, bin: string) => void;
}

export default function TimeDistributionChart({ data, onTimeRangeClick }: TimeDistributionChartProps) {
  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const payload = data.activePayload[0].payload;
      onTimeRangeClick?.(payload.minTime, payload.maxTime, payload.bin);
    }
  };
  return (
    <div className="rounded-xl border bg-surface p-5 md:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold tracking-tight">
          Time Distribution
        </h3>
        <p className="mt-1 text-xs text-zinc-500">Click a bar to see drivers in that time range</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} onClick={handleChartClick}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="bin"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            width={40}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: 'var(--chart-cursor)' }}
            contentStyle={{
              backgroundColor: 'var(--chart-tooltip-bg)',
              border: '1px solid var(--chart-tooltip-border)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#fafafa',
            }}
            itemStyle={{
              color: '#fafafa',
            }}
            labelStyle={{
              color: '#a1a1aa',
            }}
            formatter={(value: number, name: string, props: any) => {
              if (name === 'count') {
                const minTime = formatTime(props.payload.minTime);
                const maxTime = formatTime(props.payload.maxTime);
                return [
                  `${value} drivers`,
                  `${minTime} - ${maxTime}`,
                ];
              }
              return [value, name];
            }}
          />
          <Bar dataKey="count" fill="var(--chart-bar)" radius={[4, 4, 0, 0]} cursor="pointer" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
