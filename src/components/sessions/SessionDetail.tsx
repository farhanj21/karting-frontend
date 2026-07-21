'use client';

import { X, Pencil, Trash2, MapPin } from 'lucide-react';
import { KartingSession } from '@/types';

interface SessionDetailProps {
  session: KartingSession;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function fullDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</dt>
      <dd className="mt-1 text-sm text-zinc-200">{value}</dd>
    </div>
  );
}

export default function SessionDetail({ session, onClose, onEdit, onDelete }: SessionDetailProps) {
  const meta: { label: string; value: string }[] = [];
  if (session.conditions) meta.push({ label: 'Conditions', value: session.conditions });
  if (session.kartNumber) meta.push({ label: 'Kart number', value: session.kartNumber });
  if (session.cost != null) meta.push({ label: 'Cost', value: String(session.cost) });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8">
      <div className="my-auto w-full max-w-lg rounded-2xl border bg-surface p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-1.5 text-lg font-semibold tracking-tight">
                <MapPin className="h-4 w-4 text-zinc-500" />
                {session.trackName}
              </h2>
              {session.kartType && (
                <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium text-zinc-400">
                  {session.kartType}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs text-zinc-500">{fullDate(session.date)}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-zinc-500 transition-colors duration-150 hover:bg-surfaceHover hover:text-zinc-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Best lap */}
        <div className="mt-5 rounded-xl border bg-background p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Best lap</p>
          <p className="mt-1 font-mono text-2xl tabular-nums text-accent-soft">{session.bestTimeStr}</p>
        </div>

        {/* All laps */}
        {session.laps.length > 0 && (
          <div className="mt-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Lap times ({session.laps.length})
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {session.laps.map((lap) => (
                <div
                  key={lap.lapNumber}
                  className={`flex items-baseline justify-between rounded-md px-2.5 py-1.5 font-mono text-xs tabular-nums ${
                    lap.time === session.bestTime
                      ? 'bg-accent/15 text-accent-soft'
                      : 'bg-surfaceHover text-zinc-300'
                  }`}
                >
                  <span className="not-italic text-zinc-500">{lap.lapNumber}</span>
                  <span>{lap.timeStr}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        {meta.length > 0 && (
          <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {meta.map((m) => (
              <Meta key={m.label} label={m.label} value={m.value} />
            ))}
          </dl>
        )}

        {/* Notes */}
        {session.notes && (
          <div className="mt-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-300">{session.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4">
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors duration-150 hover:text-tierD-text"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg bg-accent-strong px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent"
          >
            <Pencil className="h-4 w-4" /> Edit
          </button>
        </div>
      </div>
    </div>
  );
}
