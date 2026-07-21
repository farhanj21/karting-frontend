'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Track, KartingSession } from '@/types';
import { parseLapTime } from '@/lib/validation/session';

interface SessionFormProps {
  tracks: Track[];
  /** Provided when editing an existing session; omit to create a new one. */
  initial?: KartingSession;
  onSuccess: (session: KartingSession) => void;
  onCancel: () => void;
}

/** Convert an ISO string (or now) into a `datetime-local` value (local time). */
function toDateTimeLocal(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/** Some tracks list a kart type that isn't user-selectable on the leaderboard. */
function availableKartTypes(track: Track | undefined): string[] {
  if (!track?.kartTypes) return [];
  if (track.slug === '2f2f-formula-karting') {
    return track.kartTypes.filter((kt) => kt !== 'LR5');
  }
  return track.kartTypes;
}

const inputClass =
  'w-full rounded-lg border bg-background px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors duration-150 focus:border-accent';
const labelClass = 'mb-1.5 block text-xs font-medium text-zinc-400';
const errorClass = 'mt-1 text-xs text-tierD-text';

export default function SessionForm({ tracks, initial, onSuccess, onCancel }: SessionFormProps) {
  const [date, setDate] = useState(toDateTimeLocal(initial?.date));
  const [trackSlug, setTrackSlug] = useState(initial?.trackSlug ?? '');
  const [kartType, setKartType] = useState(initial?.kartType ?? '');
  const [bestTimeStr, setBestTimeStr] = useState(initial?.bestTimeStr ?? '');
  const [laps, setLaps] = useState<string[]>(
    initial?.laps?.length ? initial.laps.map((l) => l.timeStr) : []
  );
  const [conditions, setConditions] = useState(initial?.conditions ?? '');
  const [kartNumber, setKartNumber] = useState(initial?.kartNumber ?? '');
  const [cost, setCost] = useState(initial?.cost != null ? String(initial.cost) : '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const selectedTrack = useMemo(
    () => tracks.find((t) => t.slug === trackSlug),
    [tracks, trackSlug]
  );
  const kartOptions = availableKartTypes(selectedTrack);

  // Best lap derived from the entered laps (shown as a hint / fallback).
  const derivedBest = useMemo(() => {
    const parsed = laps.map((l) => parseLapTime(l)).filter((p): p is NonNullable<typeof p> => !!p);
    if (parsed.length === 0) return null;
    return parsed.reduce((a, b) => (b.seconds < a.seconds ? b : a));
  }, [laps]);

  function handleTrackChange(slug: string) {
    setTrackSlug(slug);
    setKartType(''); // reset dependent field whenever the track changes
    setErrors((e) => ({ ...e, trackSlug: '', kartType: '' }));
  }

  function updateLap(i: number, value: string) {
    setLaps((prev) => prev.map((l, idx) => (idx === i ? value : l)));
  }
  function addLap() {
    setLaps((prev) => [...prev, '']);
  }
  function removeLap(i: number) {
    setLaps((prev) => prev.filter((_, idx) => idx !== i));
  }

  /** Client-side validation mirroring the server rules (fast feedback). */
  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!date) next.date = 'Session date & time is required.';
    else if (new Date(date).getTime() > Date.now() + 5 * 60 * 1000)
      next.date = 'Session date cannot be in the future.';

    if (!trackSlug) next.trackSlug = 'Please select a track.';
    if (kartOptions.length > 0 && !kartType) next.kartType = 'Please select a kart type / layout.';

    laps.forEach((l, i) => {
      if (l.trim() && !parseLapTime(l)) next[`laps.${i}`] = 'Use MM:SS.mmm (e.g. 00:57.241).';
    });

    const hasBest = bestTimeStr.trim().length > 0;
    if (hasBest && !parseLapTime(bestTimeStr)) {
      next.bestTimeStr = 'Use MM:SS.mmm format, e.g. 00:57.241.';
    }
    if (!hasBest && !derivedBest) {
      next.bestTimeStr = 'Enter a best lap time, or add individual lap times.';
    }

    if (cost.trim() && (isNaN(Number(cost)) || Number(cost) < 0)) {
      next.cost = 'Cost must be a positive number.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        date,
        trackSlug,
        kartType: kartType || undefined,
        bestTimeStr: bestTimeStr.trim() || undefined,
        laps: laps.map((l) => l.trim()).filter(Boolean),
        conditions: conditions.trim() || undefined,
        kartNumber: kartNumber.trim() || undefined,
        cost: cost.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const url = initial ? `/api/sessions/${initial._id}` : '/api/sessions';
      const method = initial ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else setFormError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      onSuccess(data.session);
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Date & Track */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Date &amp; time</label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`${inputClass} [color-scheme:dark]`}
          />
          {errors.date && <p className={errorClass}>{errors.date}</p>}
        </div>
        <div>
          <label className={labelClass}>Track</label>
          <select
            value={trackSlug}
            onChange={(e) => handleTrackChange(e.target.value)}
            className={`${inputClass} [color-scheme:dark]`}
          >
            <option value="">Select a track…</option>
            {tracks.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
          {errors.trackSlug && <p className={errorClass}>{errors.trackSlug}</p>}
        </div>
      </div>

      {/* Kart type — dependent on the selected track */}
      {trackSlug && kartOptions.length > 0 && (
        <div>
          <label className={labelClass}>
            {kartOptions.some((k) => k.toLowerCase().includes('track')) ? 'Layout' : 'Kart type'}
          </label>
          <div className="flex flex-wrap gap-2">
            {kartOptions.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setKartType(k);
                  setErrors((e) => ({ ...e, kartType: '' }));
                }}
                className={`h-8 rounded-full border px-3 text-xs font-medium transition-colors duration-150 ${
                  kartType === k
                    ? 'border-transparent bg-accent-strong text-white'
                    : 'text-zinc-400 hover:border-zinc-600 hover:text-zinc-100'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
          {errors.kartType && <p className={errorClass}>{errors.kartType}</p>}
        </div>
      )}

      {/* Best lap time */}
      <div>
        <label className={labelClass}>Best lap time</label>
        <input
          type="text"
          inputMode="decimal"
          value={bestTimeStr}
          onChange={(e) => setBestTimeStr(e.target.value)}
          placeholder="00:57.241"
          className={`${inputClass} font-mono tabular-nums`}
        />
        {errors.bestTimeStr && <p className={errorClass}>{errors.bestTimeStr}</p>}
        {!bestTimeStr.trim() && derivedBest && (
          <p className="mt-1 text-xs text-zinc-500">
            Will use fastest lap: <span className="font-mono text-accent-soft">{derivedBest.timeStr}</span>
          </p>
        )}
      </div>

      {/* Individual laps (optional) */}
      <div>
        <div className="flex items-center justify-between">
          <label className={labelClass}>Individual lap times (optional)</label>
          <button
            type="button"
            onClick={addLap}
            className="flex items-center gap-1 text-xs font-medium text-accent-soft transition-colors duration-150 hover:text-accent"
          >
            <Plus className="h-3.5 w-3.5" /> Add lap
          </button>
        </div>
        {laps.length > 0 && (
          <div className="mt-2 space-y-2">
            {laps.map((lap, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-8 shrink-0 text-right text-xs text-zinc-600">{i + 1}.</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={lap}
                  onChange={(e) => updateLap(i, e.target.value)}
                  placeholder="00:57.241"
                  className={`${inputClass} font-mono tabular-nums`}
                />
                <button
                  type="button"
                  onClick={() => removeLap(i)}
                  className="shrink-0 rounded-md p-1.5 text-zinc-500 transition-colors duration-150 hover:bg-surfaceHover hover:text-tierD-text"
                  aria-label={`Remove lap ${i + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {laps.map((_, i) => errors[`laps.${i}`]).some(Boolean) && (
              <p className={errorClass}>Some lap times are invalid — use MM:SS.mmm.</p>
            )}
          </div>
        )}
      </div>

      {/* Optional details */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Conditions</label>
          <input
            type="text"
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            placeholder="Dry, sunny…"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Kart number</label>
          <input
            type="text"
            value={kartNumber}
            onChange={(e) => setKartNumber(e.target.value)}
            placeholder="#12"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Cost</label>
          <input
            type="text"
            inputMode="decimal"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0"
            className={inputClass}
          />
          {errors.cost && <p className={errorClass}>{errors.cost}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Setup, tyres, how it felt…"
          className={`${inputClass} resize-none`}
        />
      </div>

      {formError && (
        <div className="flex items-center gap-2 rounded-lg border border-tierD/40 bg-tierD/10 px-3 py-2 text-sm text-tierD-text">
          <X className="h-4 w-4 shrink-0" /> {formError}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors duration-150 hover:text-zinc-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-accent-strong px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent disabled:opacity-60"
        >
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add session'}
        </button>
      </div>
    </form>
  );
}
