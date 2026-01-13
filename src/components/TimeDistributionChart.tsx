'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TimeDistribution } from '@/types';
import { formatTime } from '@/lib/utils';

interface TimeDistributionChartProps {
  data: TimeDistribution[];
}

export default function TimeDistributionChart({ data }: TimeDistributionChartProps) {
  return (
    <div className="bg-surface border border-surfaceHover rounded-lg p-6">
      <h3 className="text-xl font-display font-bold text-white mb-6">
        Time Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
          <XAxis
            dataKey="bin"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '14px' }}
            label={{ value: 'Driver Count', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #252525',
              borderRadius: '8px',
              color: '#ffffff',
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
          <Bar dataKey="count" fill="#ff3333" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 mt-4 text-center">
        Distribution of lap times across all drivers
      </p>
    </div>
  );
}
