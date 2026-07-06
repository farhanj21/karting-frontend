import { Flame } from 'lucide-react';

interface WarZoneCardProps {
  timeStart: number;
  timeEnd: number;
  driverCount: number;
}

const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  const milliseconds = Math.round((seconds % 1) * 1000);
  const secs = Math.floor(seconds);

  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

export default function WarZoneCard({ timeStart, timeEnd, driverCount }: WarZoneCardProps) {
  const timeRange = timeEnd - timeStart;

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
      <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
        {/* Icon and Title */}
        <div className="flex items-center gap-2.5">
          <Flame className="h-4 w-4 shrink-0 text-amber-400" />
          <h3 className="whitespace-nowrap text-sm font-semibold tracking-tight text-zinc-100">
            The War Zone
          </h3>
        </div>

        {/* Time Range */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Time Range</p>
          <p className="mt-0.5 whitespace-nowrap font-mono text-sm tabular-nums text-amber-300">
            {formatTime(timeStart)} – {formatTime(timeEnd)}
          </p>
        </div>

        {/* Drivers Count */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Drivers Stuck</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-100">{driverCount} racers</p>
        </div>

        {/* Info Text */}
        <p className="hidden min-w-0 flex-1 text-sm text-zinc-500 lg:block">
          Breaking out of this <span className="font-medium text-amber-300">{timeRange.toFixed(1)}s</span> window moves you past{' '}
          <span className="font-medium text-amber-300">{driverCount} drivers</span>.
        </p>
      </div>
    </div>
  );
}
