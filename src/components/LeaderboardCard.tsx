'use client';

import TierBadge from './TierBadge';
import { formatGap, formatPercentile } from '@/lib/utils';
import { LapRecord } from '@/types';
import { ExternalLink } from 'lucide-react';

interface LeaderboardCardProps {
  record: LapRecord;
  showKartType?: boolean;
}

const positionDotClass: Record<number, string> = {
  1: 'bg-accent',
  2: 'bg-zinc-400',
  3: 'bg-zinc-600',
};

export default function LeaderboardCard({ record, showKartType = false }: LeaderboardCardProps) {
  return (
    <div className="p-4">
      {/* Top row: Position + Name + Tier */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {record.position <= 3 && (
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${positionDotClass[record.position]}`}
              aria-hidden
            />
          )}
          <span className="text-xs tabular-nums text-zinc-500">{record.position}</span>
          <span className="truncate text-sm font-medium text-zinc-100">
            {record.driverName}
          </span>
        </div>
        <TierBadge tier={record.tier} size="sm" />
      </div>

      {/* Best time */}
      <p
        className={`mt-2 font-mono text-xl tabular-nums ${
          record.position === 1 ? 'text-accent-soft' : 'text-zinc-100'
        }`}
      >
        {record.bestTimeStr}
      </p>

      {/* Stats grid */}
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Gap to P1</dt>
          <dd className="mt-0.5 text-sm tabular-nums text-zinc-300">
            {formatGap(record.gapToP1)}
          </dd>
        </div>

        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Percentile</dt>
          <dd className="mt-0.5 text-sm tabular-nums text-zinc-300">
            {formatPercentile(record.percentile)}
          </dd>
        </div>

        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Interval</dt>
          <dd className="mt-0.5 text-sm tabular-nums text-zinc-300">
            {formatGap(record.interval)}
          </dd>
        </div>

        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Date</dt>
          <dd className="mt-0.5 text-sm tabular-nums text-zinc-300">
            {new Date(record.date).toLocaleDateString()}
          </dd>
        </div>

        {showKartType && (
          <div className="col-span-2">
            <dt className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Kart Type</dt>
            <dd className="mt-0.5 text-sm text-zinc-300">
              {record.kartType || 'N/A'}
            </dd>
          </div>
        )}
      </dl>

      {/* Profile link */}
      <a
        href={record.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-xs text-zinc-500 transition-colors duration-150 hover:text-accent-soft"
      >
        RaceFacer Profile
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
