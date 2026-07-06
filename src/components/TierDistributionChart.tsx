'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TierDistribution } from '@/types';

interface TierDistributionChartProps {
  data: TierDistribution[];
  onTierClick?: (tier: string) => void;
  selectedTier?: string;
}

const TIER_COLORS: Record<string, string> = {
  'S+': 'var(--tier-s-plus)',
  'S': 'var(--tier-s)',
  'A': 'var(--tier-a)',
  'B': 'var(--tier-b)',
  'C': 'var(--tier-c)',
  'D': 'var(--tier-d)',
};

export default function TierDistributionChart({ data, onTierClick, selectedTier }: TierDistributionChartProps) {
  const handleChartClick = (event: any) => {
    // Check if we have activeLabel (the tier on X-axis that was clicked)
    if (event && event.activeLabel) {
      onTierClick?.(event.activeLabel);
    }
  };

  return (
    <div className="rounded-xl border bg-surface p-5 md:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold tracking-tight">
          Tier Distribution
        </h3>
        <p className="mt-1 text-xs text-zinc-500">Click a bar to filter the leaderboard</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} onClick={handleChartClick} barCategoryGap="20%">
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="tier"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
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
            formatter={(value: number, name: string) => {
              if (name === 'count') return [value, 'Drivers'];
              return [value, name];
            }}
          />
          <Bar
            dataKey="count"
            radius={[4, 4, 0, 0]}
            cursor="pointer"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={TIER_COLORS[entry.tier] || 'var(--tier-c)'}
                opacity={selectedTier && selectedTier !== entry.tier ? 0.3 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
        {data.map((item) => (
          <button
            key={item.tier}
            onClick={() => onTierClick?.(item.tier)}
            className={`flex items-center gap-2 text-xs transition-opacity duration-150 hover:opacity-100 ${
              selectedTier && selectedTier !== item.tier ? 'opacity-30' : 'opacity-100'
            }`}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: TIER_COLORS[item.tier] }}
            />
            <span className="tabular-nums text-zinc-400">
              {item.tier}: {item.count} ({item.percentage.toFixed(1)}%)
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
