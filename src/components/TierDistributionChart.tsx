'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TierDistribution } from '@/types';

interface TierDistributionChartProps {
  data: TierDistribution[];
  onTierClick?: (tier: string) => void;
  selectedTier?: string;
}

const TIER_COLORS: Record<string, string> = {
  'S+': '#a855f7',
  'S': '#fbbf24',
  'A': '#10b981',
  'B': '#3b82f6',
  'C': '#6b7280',
  'D': '#ef4444',
};

export default function TierDistributionChart({ data, onTierClick, selectedTier }: TierDistributionChartProps) {
  const handleChartClick = (event: any) => {
    // Check if we have activeLabel (the tier on X-axis that was clicked)
    if (event && event.activeLabel) {
      onTierClick?.(event.activeLabel);
    }
  };

  return (
    <div className="bg-surface border border-surfaceHover rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-display font-bold text-white">
          Tier Distribution
        </h3>
        <p className="text-xs text-gray-500 mt-1">Click on a bar to filter leaderboard</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} onClick={handleChartClick} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
          <XAxis
            dataKey="tier"
            stroke="#6b7280"
            style={{ fontSize: '14px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '14px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #252525',
              borderRadius: '8px',
              color: '#ffffff',
            }}
            itemStyle={{
              color: '#ffffff',
            }}
            labelStyle={{
              color: '#ffffff',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'count') return [value, 'Drivers'];
              return [value, name];
            }}
          />
          <Bar
            dataKey="count"
            radius={[8, 8, 0, 0]}
            cursor="pointer"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={TIER_COLORS[entry.tier] || '#6b7280'}
                opacity={selectedTier && selectedTier !== entry.tier ? 0.3 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        {data.map((item) => (
          <button
            key={item.tier}
            onClick={() => onTierClick?.(item.tier)}
            className={`flex items-center gap-2 text-sm transition-opacity hover:opacity-100 ${
              selectedTier && selectedTier !== item.tier ? 'opacity-30' : 'opacity-100'
            }`}
          >
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: TIER_COLORS[item.tier] }}
            />
            <span className="text-gray-400">
              {item.tier}: {item.count} ({item.percentage.toFixed(1)}%)
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
