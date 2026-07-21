'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2, X, ChevronDown, ImagePlus, Loader2 } from 'lucide-react';
import { Track, KartingSession } from '@/types';
import { parseLapTime } from '@/lib/validation/session';

/** Read a File as a bare base64 string (without the `data:...;base64,` prefix). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

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

/**
 * Convert a `datetime-local` value (a wall-clock string with no timezone, e.g.
 * "2026-07-21T14:30") into a full ISO instant. The input is interpreted in the
 * user's local timezone here on the client, so the server records the exact
 * moment they picked rather than re-interpreting the offset-less string in the
 * server's timezone (which is UTC in production).
 */
function dateTimeLocalToISO(value: string): string {
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toISOString();
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
  // A session with no recorded time (DNF, rained out, times not captured).
  const [noTime, setNoTime] = useState(
    !!initial && initial.bestTime == null && !initial.laps?.length
  );
  const [conditions, setConditions] = useState(initial?.conditions ?? '');
  const [kartNumber, setKartNumber] = useState(initial?.kartNumber ?? '');
  const [cost, setCost] = useState(initial?.cost != null ? String(initial.cost) : '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Screenshot import (Claude vision → prefilled times).
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');
  const [ocrNote, setOcrNote] = useState('');

  // Lap-row refs + a pending-focus index so pressing Enter focuses the new row.
  const lapRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusLapIndex, setFocusLapIndex] = useState<number | null>(null);
  useEffect(() => {
    if (focusLapIndex != null) {
      lapRefs.current[focusLapIndex]?.focus();
      setFocusLapIndex(null);
    }
  }, [focusLapIndex, laps.length]);

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
    setFocusLapIndex(laps.length); // focus the row we're about to append
  }
  function removeLap(i: number) {
    setLaps((prev) => prev.filter((_, idx) => idx !== i));
  }
  /** Enter inserts a new lap row right below the current one and focuses it. */
  function handleLapKeyDown(e: React.KeyboardEvent<HTMLInputElement>, i: number) {
    if (e.key === 'Enter') {
      e.preventDefault();
      setLaps((prev) => {
        const next = [...prev];
        next.splice(i + 1, 0, '');
        return next;
      });
      setFocusLapIndex(i + 1);
    }
  }

  async function handleScreenshot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;

    setOcrError('');
    setOcrNote('');
    if (!file.type.startsWith('image/')) {
      setOcrError('Please choose an image file.');
      return;
    }

    setOcrLoading(true);
    try {
      const imageBase64 = await fileToBase64(file);
      const res = await fetch('/api/sessions/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mediaType: file.type }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setOcrError(data.error || 'Could not read that screenshot.');
        return;
      }

      const d = data.data as {
        laps: string[];
        bestTimeStr: string;
        kartNumber: string;
        conditions: string;
      };

      const foundLaps = d.laps?.length > 0;
      if (foundLaps) setLaps(d.laps);
      if (d.bestTimeStr) setBestTimeStr(d.bestTimeStr);
      if (foundLaps || d.bestTimeStr) setNoTime(false);
      // Only fill optional fields that are still empty — never clobber typed input.
      if (d.kartNumber && !kartNumber) setKartNumber(d.kartNumber);
      if (d.conditions && !conditions) setConditions(d.conditions);

      if (!foundLaps && !d.bestTimeStr) {
        setOcrError('No lap times found in that image. You can still enter them manually.');
      } else {
        setErrors({});
        const n = d.laps?.length ?? 0;
        setOcrNote(
          n > 0
            ? `Imported ${n} lap${n === 1 ? '' : 's'} — please double-check them before saving.`
            : 'Imported a best lap — please double-check it before saving.'
        );
      }
    } catch {
      setOcrError('Could not read that screenshot. Please try again.');
    } finally {
      setOcrLoading(false);
    }
  }

  /** Client-side validation mirroring the server rules (fast feedback). */
  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!date) next.date = 'Session date & time is required.';
    else if (new Date(date).getTime() > Date.now() + 5 * 60 * 1000)
      next.date = 'Session date cannot be in the future.';

    if (!trackSlug) next.trackSlug = 'Please select a track.';
    if (kartOptions.length > 0 && !kartType) next.kartType = 'Please select a kart type / layout.';

    // Time validation is skipped entirely when "No time" is selected.
    if (!noTime) {
      laps.forEach((l, i) => {
        if (l.trim() && !parseLapTime(l)) next[`laps.${i}`] = 'Use MM:SS.mmm (e.g. 00:57.241).';
      });

      const hasBest = bestTimeStr.trim().length > 0;
      if (hasBest && !parseLapTime(bestTimeStr)) {
        next.bestTimeStr = 'Use MM:SS.mmm format, e.g. 00:57.241.';
      }
      if (!hasBest && !derivedBest) {
        next.bestTimeStr = 'Enter a best lap time, add individual laps, or select “No time”.';
      }
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
        date: dateTimeLocalToISO(date),
        trackSlug,
        kartType: kartType || undefined,
        noTime,
        bestTimeStr: noTime ? undefined : bestTimeStr.trim() || undefined,
        laps: noTime ? [] : laps.map((l) => l.trim()).filter(Boolean),
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
          <div className="relative">
            <select
              value={trackSlug}
              onChange={(e) => handleTrackChange(e.target.value)}
              className={`${inputClass} cursor-pointer appearance-none pr-9 [color-scheme:dark]`}
            >
              <option value="">Select a track…</option>
              {tracks.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          </div>
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

      {/* Times: screenshot import + no-time toggle */}
      <div className="rounded-xl border border-dashed p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-medium text-zinc-400">Lap times</span>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleScreenshot}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={ocrLoading}
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors duration-150 hover:border-zinc-600 hover:text-zinc-100 disabled:opacity-60"
            >
              {ocrLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5" />
              )}
              {ocrLoading ? 'Reading…' : 'Import from screenshot'}
            </button>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200">
              <input
                type="checkbox"
                checked={noTime}
                onChange={(e) => {
                  setNoTime(e.target.checked);
                  setErrors((prev) => ({ ...prev, bestTimeStr: '' }));
                }}
                className="h-3.5 w-3.5 accent-accent-strong"
              />
              No time
            </label>
          </div>
        </div>

        {ocrError && <p className={errorClass}>{ocrError}</p>}
        {ocrNote && <p className="mt-1 text-xs text-accent-soft">{ocrNote}</p>}

        {noTime ? (
          <p className="mt-3 text-xs text-zinc-500">
            This session will be saved without a recorded lap time (e.g. a DNF or a run where times weren’t captured).
          </p>
        ) : (
          <div className="mt-4 space-y-5">
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
                  Will use fastest lap:{' '}
                  <span className="font-mono text-accent-soft">{derivedBest.timeStr}</span>
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
                        ref={(el) => {
                          lapRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="decimal"
                        value={lap}
                        onChange={(e) => updateLap(i, e.target.value)}
                        onKeyDown={(e) => handleLapKeyDown(e, i)}
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
                  <p className="text-[11px] text-zinc-600">Press Enter to add the next lap.</p>
                  {laps.map((_, i) => errors[`laps.${i}`]).some(Boolean) && (
                    <p className={errorClass}>Some lap times are invalid — use MM:SS.mmm.</p>
                  )}
                </div>
              )}
            </div>
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
