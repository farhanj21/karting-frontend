'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, ChevronLeft, X, CalendarDays } from 'lucide-react';
import AuthNav from '@/components/auth/AuthNav';
import SessionForm from '@/components/sessions/SessionForm';
import SummaryTiles from '@/components/sessions/SummaryTiles';
import SessionTable from '@/components/sessions/SessionTable';
import SessionDetail from '@/components/sessions/SessionDetail';
import ImprovementChart from '@/components/sessions/ImprovementChart';
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
  const [detailTarget, setDetailTarget] = useState<KartingSession | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [sRes, tRes] = await Promise.all([fetch('/api/sessions'), fetch('/api/tracks')]);
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

  // Fastest session per track + kart type — used to highlight those rows.
  const personalBestIds = useMemo(() => {
    const bestByGroup = new Map<string, KartingSession>();
    for (const s of sessions) {
      const key = `${s.trackSlug}::${s.kartType ?? ''}`;
      const cur = bestByGroup.get(key);
      if (!cur || s.bestTime < cur.bestTime) bestByGroup.set(key, s);
    }
    return new Set(Array.from(bestByGroup.values()).map((s) => s._id));
  }, [sessions]);

  function handleSaved(saved: KartingSession) {
    setSessions((prev) => {
      const without = prev.filter((s) => s._id !== saved._id);
      return [saved, ...without].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });
    setModal({ mode: 'closed' });
    setDetailTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/sessions/${deleteTarget._id}`, { method: 'DELETE' });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s._id !== deleteTarget._id));
        setDetailTarget((cur) => (cur?._id === deleteTarget._id ? null : cur));
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
            {/* Summary tiles */}
            <div className="mt-8">
              <SummaryTiles sessions={sessions} />
            </div>

            {/* All sessions */}
            <div className="mt-10">
              <h2 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                All sessions
              </h2>
              <div className="mt-4">
                <SessionTable
                  sessions={sessions}
                  personalBestIds={personalBestIds}
                  onRowClick={(s) => setDetailTarget(s)}
                  onEdit={(s) => setModal({ mode: 'edit', session: s })}
                />
              </div>
            </div>

            {/* Improvement over time */}
            <div className="mt-10">
              <ImprovementChart sessions={sessions} />
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

      {/* Session detail */}
      {detailTarget && (
        <SessionDetail
          session={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={() => {
            setModal({ mode: 'edit', session: detailTarget });
            setDetailTarget(null);
          }}
          onDelete={() => {
            setDeleteTarget(detailTarget);
            setDetailTarget(null);
          }}
        />
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
