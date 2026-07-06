import { Crown, Medal } from 'lucide-react';
import { format } from 'date-fns';

interface WorldRecord {
  driverName: string;
  driverSlug: string;
  profileUrl?: string;
  recordTime: number;
  recordTimeStr: string;
  dateBroken: string;
  daysReigned: number;
  isCurrent: boolean;
}

interface HallOfFameTimelineProps {
  records: WorldRecord[];
}

export default function HallOfFameTimeline({ records }: HallOfFameTimelineProps) {
  const maxReign = Math.max(...records.map((r) => r.daysReigned));

  return (
    <div className="divide-y divide-surfaceHover/60">
      {records.map((record) => {
        const date = new Date(record.dateBroken);

        return (
          <div
            key={`${record.driverSlug}-${record.dateBroken}`}
            className="flex items-center gap-4 py-3"
          >
            {/* Icon */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center">
              {record.isCurrent ? (
                <Crown className="h-4 w-4 text-accent-soft" />
              ) : (
                <Medal className="h-4 w-4 text-zinc-600" />
              )}
            </div>

            {/* Driver Name */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-zinc-100">{record.driverName}</span>
                {record.isCurrent && (
                  <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent-soft">
                    WR
                  </span>
                )}
              </div>
            </div>

            {/* Record Time */}
            <div
              className={`shrink-0 text-right font-mono text-sm tabular-nums ${
                record.isCurrent ? 'text-accent-soft' : 'text-zinc-100'
              }`}
            >
              {record.recordTimeStr}
            </div>

            {/* Reign Duration */}
            <div className="hidden w-28 shrink-0 items-center gap-2 sm:flex">
              <span className="text-xs tabular-nums text-zinc-500">
                {record.daysReigned}d
              </span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-surfaceHover/60">
                <div
                  className={`h-full ${record.isCurrent ? 'bg-accent' : 'bg-zinc-600'}`}
                  style={{
                    width: `${Math.min((record.daysReigned / maxReign) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Date */}
            <div className="hidden w-24 shrink-0 text-right text-xs text-zinc-500 md:block">
              {format(date, 'MMM dd, yy')}
            </div>
          </div>
        );
      })}
    </div>
  );
}
