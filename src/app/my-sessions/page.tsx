'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ChevronLeft, X, MapPin, CalendarDays } from 'lucide-react';
import AuthNav from '@/components/auth/AuthNav';
import SessionForm from '@/components/sessions/SessionForm';
import SessionStats from '@/components/sessions/SessionStats';
import { Track, KartingSession } from '@/types';

type ModalState =
  | { mode: 'closed' }
  | { mode: 'add' }
  | { mode: 'edit'; session: KartingSession };

function formatSessionDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MySessionsPage() {
  const [sessions, setSessions] = useState<KartingSession[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' });
  const [deleteTarget, setDeleteTarget] = useState<KartingSession | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [sRes, tRes] = await Promise.all([
          fetch('/api/sessions'),
          fetch('/api/tracks'),
        ]);
        const [sData, tData] = await Promise.all([sRes.json(), tRes.json()]);
        if (!active) return;
        if (sData.success) setSessions(sData.sessions);
        else setLoadError('Could not load your sessions.');
        if (tData.success) setTracks(tData.tracks);
      } catch {
        if (active) setLoadError('Could not load your sessions.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  function handleSaved(saved: KartingSession) {
    setSessions((prev) => {
      const without = prev.filter((s) => s._id !== saved._id);
      return [saved, ...without].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });
    setModal({ mode: 'closed' });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/sessions/${deleteTarget._id}`, { method: 'DELETE' });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s._id !== deleteTarget._id));
        setDeleteTarget(null);
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors duration-150 hover:text-zinc-100"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Leaderboards</span>
            </Link>
            <AuthNav />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">My Sessions</h1>
            <p className="mt-1.5 text-sm text-zinc-400">
              Your personal karting log — lap times, tracks, and progress over time.
            </p>
          </div>
          <button
            onClick={() => setModal({ mode: 'add' })}
            className="flex items-center gap-1.5 rounded-lg bg-accent-strong px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent"
          >
            <Plus className="h-4 w-4" /> Add session
          </button>
        </div>

        {loading ? (
          <p className="mt-16 text-center text-sm text-zinc-500">Loading your sessions…</p>
        ) : loadError ? (
          <p className="mt-16 text-center text-sm text-tierD-text">{loadError}</p>
        ) : sessions.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed bg-surface/40 p-12 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-zinc-600" />
            <p className="mt-3 text-sm font-medium text-zinc-300">No sessions logged yet</p>
            <p className="mt-1 text-sm text-zinc-500">
              Add your first session to start tracking your lap times and improvement.
            </p>
            <button
              onClick={() => setModal({ mode: 'add' })}
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-accent-strong px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent"
            >
              <Plus className="h-4 w-4" /> Add session
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mt-8">
              <SessionStats sessions={sessions} />
            </div>

            {/* Session list */}
            <div className="mt-10">
              <h2 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                All sessions
              </h2>
              <ul className="mt-4 space-y-3">
                {sessions.map((s) => (
                  <li
                    key={s._id}
                    className="group rounded-xl border bg-surface p-5 transition-colors duration-150 hover:border-zinc-700"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-100">
                            <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                            {s.trackName}
                          </span>
                          {s.kartType && (
                            <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium text-zinc-400">
                              {s.kartType}
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-xs text-zinc-500">{formatSessionDate(s.date)}</p>
                        {(s.conditions || s.kartNumber || s.cost != null) && (
                          <p className="mt-1 text-xs text-zinc-600">
                            {[
                              s.conditions,
                              s.kartNumber ? `Kart ${s.kartNumber}` : null,
                              s.cost != null ? `Cost ${s.cost}` : null,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        )}
                        {s.notes && <p className="mt-2 text-sm text-zinc-400">{s.notes}</p>}
                        {s.laps.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {s.laps.map((lap) => (
                              <span
                                key={lap.lapNumber}
                                className={`rounded-md px-2 py-0.5 font-mono text-xs tabular-nums ${
                                  lap.time === s.bestTime
                                    ? 'bg-accent/15 text-accent-soft'
                                    : 'bg-surfaceHover text-zinc-400'
                                }`}
                              >
                                {lap.timeStr}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Best</p>
                          <p className="font-mono text-lg tabular-nums text-accent-soft">
                            {s.bestTimeStr}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
                          <button
                            onClick={() => setModal({ mode: 'edit', session: s })}
                            className="rounded-md p-1.5 text-zinc-500 transition-colors duration-150 hover:bg-surfaceHover hover:text-zinc-100"
                            aria-label="Edit session"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="rounded-md p-1.5 text-zinc-500 transition-colors duration-150 hover:bg-surfaceHover hover:text-tierD-text"
                            aria-label="Delete session"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </main>

      {/* Add / Edit modal */}
      {modal.mode !== 'closed' && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8">
          <div className="my-auto w-full max-w-2xl rounded-2xl border bg-surface p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                {modal.mode === 'edit' ? 'Edit session' : 'Add session'}
              </h2>
              <button
                onClick={() => setModal({ mode: 'closed' })}
                className="rounded-lg p-1.5 text-zinc-500 transition-colors duration-150 hover:bg-surfaceHover hover:text-zinc-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SessionForm
              tracks={tracks}
              initial={modal.mode === 'edit' ? modal.session : undefined}
              onSuccess={handleSaved}
              onCancel={() => setModal({ mode: 'closed' })}
            />
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border bg-surface p-6 shadow-2xl">
            <h2 className="text-base font-semibold tracking-tight">Delete this session?</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {deleteTarget.trackName} · {formatSessionDate(deleteTarget.date)}. This can&apos;t be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors duration-150 hover:text-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-tierD px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
