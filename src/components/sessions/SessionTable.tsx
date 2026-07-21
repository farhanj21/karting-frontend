'use client';

import { Pencil } from 'lucide-react';
import { KartingSession } from '@/types';

interface SessionTableProps {
  sessions: KartingSession[];
  /** Session ids that are a personal best (fastest for their track + kart). */
  personalBestIds: Set<string>;
  onRowClick: (session: KartingSession) => void;
  onEdit: (session: KartingSession) => void;
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function SessionTable({
  sessions,
  personalBestIds,
  onRowClick,
  onEdit,
}: SessionTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead>
          <tr className="border-b bg-surface/60 text-[11px] uppercase tracking-wider text-zinc-500">
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Track</th>
            <th className="px-4 py-3 font-medium">Kart / layout</th>
            <th className="px-4 py-3 text-right font-medium">Laps</th>
            <th className="px-4 py-3 text-right font-medium">Best lap</th>
            <th className="px-4 py-3 text-right font-medium">
              <span className="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => {
            const isPB = personalBestIds.has(s._id);
            return (
              <tr
                key={s._id}
                onClick={() => onRowClick(s)}
                tabIndex={0}
                role="button"
                title={isPB ? 'Personal best on this track' : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRowClick(s);
                  }
                }}
                className={`cursor-pointer border-b outline-none transition-colors duration-150 last:border-b-0 focus-visible:bg-surfaceHover ${
                  isPB
                    ? 'bg-accent/[0.07] hover:bg-accent/[0.12]'
                    : 'bg-surface hover:bg-surfaceHover'
                }`}
              >
                <td className="whitespace-nowrap px-4 py-3 text-zinc-300">{shortDate(s.date)}</td>
                <td className="px-4 py-3 font-medium text-zinc-100">{s.trackName}</td>
                <td className="px-4 py-3 text-zinc-400">{s.kartType ?? '—'}</td>
                <td className="px-4 py-3 text-right tabular-nums text-zinc-400">
                  {s.laps.length || '—'}
                </td>
                <td
                  className={`whitespace-nowrap px-4 py-3 text-right font-mono tabular-nums ${
                    isPB ? 'font-semibold text-accent-soft' : 'text-accent-soft'
                  }`}
                >
                  {s.bestTimeStr}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(s);
                    }}
                    className="rounded-md p-1.5 text-zinc-500 transition-colors duration-150 hover:bg-surfaceHover hover:text-zinc-100"
                    aria-label={`Edit session at ${s.trackName}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
