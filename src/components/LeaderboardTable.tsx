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
        <div className="hidden md:block space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-surface rounded skeleton" />
          ))}
        </div>
        {/* Mobile loading skeleton */}
        <div className="block md:hidden space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-48 bg-surface rounded skeleton" />
          ))}
        </div>
      </>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12 bg-surface rounded-lg border border-surfaceHover">
        <p className="text-gray-400">No records found</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surfaceHover">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Pos
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Driver
              </th>
              {showKartType && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {kartTypeLabel}
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Tier
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Best Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Gap to P1
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Interval
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Percentile
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surfaceHover">
            {records.map((record) => (
              <tr
                key={record._id}
                className="hover:bg-surfaceHover transition-colors"
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {record.position === 1 && (
                      <span className="text-2xl mr-2">🏆</span>
                    )}
                    {record.position === 2 && (
                      <span className="text-2xl mr-2">🥈</span>
                    )}
                    {record.position === 3 && (
                      <span className="text-2xl mr-2">🥉</span>
                    )}
                    <span className="text-sm font-semibold text-white">
                      {record.position}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {record.driverName}
                      </div>
                      <a
                        href={record.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-primary flex items-center gap-1 mt-1"
                      >
                        RaceFacer Profile
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </td>
                {showKartType && (
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {record.kartType || 'N/A'}
                    </div>
                  </td>
                )}
                <td className="px-4 py-4 whitespace-nowrap">
                  <TierBadge tier={record.tier} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono font-bold text-accent">
                    {record.bestTimeStr}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">
                    {formatGap(record.gapToP1)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">
                    {formatGap(record.interval)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">
                    {formatPercentile(record.percentile)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-400">
                    {new Date(record.date).toLocaleDateString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="block md:hidden space-y-3">
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
