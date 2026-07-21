'use client';

import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChevronDown } from 'lucide-react';
import { KartingSession } from '@/types';
import { formatTime } from '@/lib/utils';

export default function ImprovementChart({ sessions }: { sessions: KartingSession[] }) {
  // Distinct track + kart-type groups, in first-seen order.
  const groups = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of sessions) {
      const key = `${s.trackSlug}::${s.kartType ?? ''}`;
      if (!map.has(key)) {
        map.set(key, s.kartType ? `${s.trackName} · ${s.kartType}` : s.trackName);
      }
    }
    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, [sessions]);

  const [selectedGroup, setSelectedGroup] = useState('');
  // Fall back to the first group if nothing is selected (or the selection is gone).
  const activeGroup = groups.some((g) => g.key === selectedGroup)
    ? selectedGroup
    : groups[0]?.key ?? '';

  const chartData = useMemo(() => {
    return sessions
      .filter(
        (s) =>
          `${s.trackSlug}::${s.kartType ?? ''}` === activeGroup && s.bestTime != null
      )
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((s) => ({
        date: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        best: Number(s.bestTime!.toFixed(3)),
        label: s.bestTimeStr,
      }));
  }, [sessions, activeGroup]);

  if (groups.length === 0) return null;

  return (
    <div className="rounded-xl border bg-surface p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Improvement over time</h3>
          <p className="mt-1 text-xs text-zinc-500">Best lap per session</p>
        </div>
        {groups.length > 1 && (
          <div className="relative">
            <select
              value={activeGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="cursor-pointer appearance-none rounded-lg border bg-background py-1.5 pl-3 pr-8 text-xs text-zinc-100 outline-none [color-scheme:dark] focus:border-accent"
            >
              {groups.map((g) => (
                <option key={g.key} value={g.key}>
                  {g.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          </div>
        )}
      </div>

      {chartData.length < 2 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          Log at least two sessions on this track to see your trend.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
            />
            <YAxis
              width={56}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
              tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
              tickFormatter={(v: number) => formatTime(v)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--chart-tooltip-bg)',
                border: '1px solid var(--chart-tooltip-border)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#fafafa',
              }}
              labelStyle={{ color: '#a1a1aa' }}
              formatter={(_value: number, _name: string, props: any) => [
                props.payload.label,
                'Best lap',
              ]}
            />
            <Line
              type="monotone"
              dataKey="best"
              stroke="var(--accent, #8b5cf6)"
              strokeWidth={2}
              dot={{ r: 3, fill: '#8b5cf6' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
