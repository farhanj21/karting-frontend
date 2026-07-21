'use client';

import { useMemo } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { KartingSession } from '@/types';

export default function SummaryTiles({ sessions }: { sessions: KartingSession[] }) {
  const trackCount = useMemo(
    () => new Set(sessions.map((s) => s.trackSlug)).size,
    [sessions]
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <StatCard title="Sessions logged" value={sessions.length} icon={CalendarDays} />
      <StatCard title="Tracks visited" value={trackCount} icon={MapPin} />
    </div>
  );
}
