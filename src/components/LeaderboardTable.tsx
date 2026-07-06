'use client';

import TierBadge from './TierBadge';
import LeaderboardCard from './LeaderboardCard';
import { formatGap, formatPercentile } from '@/lib/utils';
import { LapRecord } from '@/types';
import { ExternalLink } from 'lucide-react';

interface LeaderboardTableProps {
  records: LapRecord[];
  loading?: boolean;
  showKartType?: boolean;
  kartTypeLabel?: string;
}

const positionDotClass: Record<number, string> = {
  1: 'bg-accent',
  2: 'bg-zinc-400',
  3: 'bg-zinc-600',
};

export default function LeaderboardTable({
  records,
  loading,
  showKartType = false,
  kartTypeLabel = 'Kart Type'
}: LeaderboardTableProps) {
  if (loading) {
    return (
      <>
        {/* Desktop loading skeleton */}
        <div className="hidden space-y-2 p-4 md:block">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-lg" />
          ))}
        </div>
        {/* Mobile loading skeleton */}
        <div className="block space-y-2 p-4 md:hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-lg" />
          ))}
        </div>
      </>
    );
  }

  if (records.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-zinc-500">No records found</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table view */}
      <div className="hidden max-h-[75vh] overflow-auto md:block">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky top-0 z-[1] whitespace-nowrap border-b bg-surface px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Pos
              </th>
              <th className="sticky top-0 z-[1] whitespace-nowrap border-b bg-surface px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Driver
              </th>
              {showKartType && (
                <th className="sticky top-0 z-[1] whitespace-nowrap border-b bg-surface px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  {kartTypeLabel}
                </th>
              )}
              <th className="sticky top-0 z-[1] whitespace-nowrap border-b bg-surface px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Tier
              </th>
              <th className="sticky top-0 z-[1] whitespace-nowrap border-b bg-surface px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Best Time
              </th>
              <th className="sticky top-0 z-[1] whitespace-nowrap border-b bg-surface px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Gap to P1
              </th>
              <th className="sticky top-0 z-[1] whitespace-nowrap border-b bg-surface px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Interval
              </th>
              <th className="sticky top-0 z-[1] whitespace-nowrap border-b bg-surface px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Percentile
              </th>
              <th className="sticky top-0 z-[1] whitespace-nowrap border-b bg-surface px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="[&>tr:last-child>td]:border-b-0">
            {records.map((record) => (
              <tr
                key={record._id}
                className="transition-colors duration-150 hover:bg-surfaceHover/40"
              >
                <td className="whitespace-nowrap border-b border-surfaceHover/60 px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    {record.position <= 3 && (
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${positionDotClass[record.position]}`}
                        aria-hidden
                      />
                    )}
                    <span className="text-xs tabular-nums text-zinc-500">
                      {record.position}
                    </span>
                  </div>
                </td>
                <td className="border-b border-surfaceHover/60 px-4 py-3.5">
                  <div className="text-sm font-medium text-zinc-100">
                    {record.driverName}
                  </div>
                  <a
                    href={record.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-xs text-zinc-500 transition-colors duration-150 hover:text-accent-soft"
                  >
                    RaceFacer Profile
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
                {showKartType && (
                  <td className="whitespace-nowrap border-b border-surfaceHover/60 px-4 py-3.5 text-sm text-zinc-400">
                    {record.kartType || 'N/A'}
                  </td>
                )}
                <td className="whitespace-nowrap border-b border-surfaceHover/60 px-4 py-3.5">
                  <TierBadge tier={record.tier} />
                </td>
                <td className="whitespace-nowrap border-b border-surfaceHover/60 px-4 py-3.5">
                  <span
                    className={`font-mono text-sm font-medium tabular-nums ${
                      record.position === 1 ? 'text-accent-soft' : 'text-zinc-100'
                    }`}
                  >
                    {record.bestTimeStr}
                  </span>
                </td>
                <td className="whitespace-nowrap border-b border-surfaceHover/60 px-4 py-3.5 text-sm tabular-nums text-zinc-400">
                  {formatGap(record.gapToP1)}
                </td>
                <td className="whitespace-nowrap border-b border-surfaceHover/60 px-4 py-3.5 text-sm tabular-nums text-zinc-400">
                  {formatGap(record.interval)}
                </td>
                <td className="whitespace-nowrap border-b border-surfaceHover/60 px-4 py-3.5 text-sm tabular-nums text-zinc-400">
                  {formatPercentile(record.percentile)}
                </td>
                <td className="whitespace-nowrap border-b border-surfaceHover/60 px-4 py-3.5 text-sm text-zinc-500">
                  {new Date(record.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="block divide-y divide-surfaceHover/60 md:hidden">
        {records.map((record) => (
          <LeaderboardCard
            key={record._id}
            record={record}
            showKartType={showKartType}
          />
        ))}
      </div>
    </>
  );
}
