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
import { CalendarDays, MapPin, Timer } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { KartingSession } from '@/types';
import { formatTime } from '@/lib/utils';

interface SessionStatsProps {
  sessions: KartingSession[];
}

interface PersonalBest {
  key: string;
  trackName: string;
  kartType?: string;
  bestTime: number;
  bestTimeStr: string;
  date: string;
}

export default function SessionStats({ sessions }: SessionStatsProps) {
  // --- Personal best per track + kart type ---
  const personalBests = useMemo<PersonalBest[]>(() => {
    const map = new Map<string, PersonalBest>();
    for (const s of sessions) {
      const key = `${s.trackSlug}::${s.kartType ?? ''}`;
      const existing = map.get(key);
      if (!existing || s.bestTime < existing.bestTime) {
        map.set(key, {
          key,
          trackName: s.trackName,
          kartType: s.kartType,
          bestTime: s.bestTime,
          bestTimeStr: s.bestTimeStr,
          date: s.date,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.trackName.localeCompare(b.trackName));
  }, [sessions]);

  const overallBest = useMemo(
    () => personalBests.reduce<PersonalBest | null>((best, pb) => (!best || pb.bestTime < best.bestTime ? pb : best), null),
    [personalBests]
  );

  const trackCount = useMemo(
    () => new Set(sessions.map((s) => s.trackSlug)).size,
    [sessions]
  );

  // --- Improvement over time, for a selected track+kart group ---
  const groups = personalBests.map((pb) => ({
    key: pb.key,
    label: pb.kartType ? `${pb.trackName} · ${pb.kartType}` : pb.trackName,
  }));
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.key ?? '');

  const chartData = useMemo(() => {
    return sessions
      .filter((s) => `${s.trackSlug}::${s.kartType ?? ''}` === selectedGroup)
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((s) => ({
        date: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        best: Number(s.bestTime.toFixed(3)),
        label: s.bestTimeStr,
      }));
  }, [sessions, selectedGroup]);

  if (sessions.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Summary tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Sessions logged" value={sessions.length} icon={CalendarDays} />
        <StatCard title="Tracks visited" value={trackCount} icon={MapPin} />
        <StatCard
          title="Best lap"
          value={overallBest?.bestTimeStr ?? '—'}
          subtitle={overallBest ? overallBest.trackName : undefined}
          icon={Timer}
          iconColor="text-accent-soft"
        />
      </div>

      {/* Personal bests per track */}
      {personalBests.length > 0 && (
        <div className="rounded-xl border bg-surface p-5 md:p-6">
          <h3 className="text-lg font-semibold tracking-tight">Personal bests</h3>
          <dl className="mt-4 space-y-2.5">
            {personalBests.map((pb) => (
              <div key={pb.key} className="flex items-baseline justify-between gap-4">
                <dt className="truncate text-sm text-zinc-400">
                  {pb.trackName}
                  {pb.kartType && <span className="text-zinc-600"> · {pb.kartType}</span>}
                </dt>
                <dd className="font-mono text-sm tabular-nums text-accent-soft">{pb.bestTimeStr}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Improvement over time */}
      {groups.length > 0 && (
        <div className="rounded-xl border bg-surface p-5 md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Improvement over time</h3>
              <p className="mt-1 text-xs text-zinc-500">Best lap per session</p>
            </div>
            {groups.length > 1 && (
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="rounded-lg border bg-background px-3 py-1.5 text-xs text-zinc-100 outline-none [color-scheme:dark] focus:border-accent"
              >
                {groups.map((g) => (
                  <option key={g.key} value={g.key}>
                    {g.label}
                  </option>
                ))}
              </select>
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
      )}
    </div>
  );
}
