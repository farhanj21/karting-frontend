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
    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 rounded-xl p-4">
      <div className="flex items-center gap-6">
        {/* Icon and Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg shrink-0">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <h3 className="text-lg font-display font-bold text-white whitespace-nowrap">THE WAR ZONE</h3>
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-12 w-px bg-orange-500/20" />

        {/* Time Range */}
        <div>
          <div className="text-xs text-gray-400 mb-1">Time Range</div>
          <div className="text-lg font-bold text-orange-400 whitespace-nowrap">
            {formatTime(timeStart)} - {formatTime(timeEnd)}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block h-12 w-px bg-orange-500/20" />

        {/* Drivers Count */}
        <div>
          <div className="text-xs text-gray-400 mb-1">Drivers Stuck</div>
          <div className="text-xl font-bold text-red-400">{driverCount} racers</div>
        </div>

        {/* Info Text */}
        <div className="hidden lg:flex items-center flex-1 ml-4">
          <p className="text-sm text-gray-300">
            Breaking out of this <span className="font-bold text-orange-400">{timeRange.toFixed(1)}s</span> window moves you past{' '}
            <span className="font-bold text-orange-400">{driverCount} drivers!</span>
          </p>
        </div>
      </div>
    </div>
  );
}
