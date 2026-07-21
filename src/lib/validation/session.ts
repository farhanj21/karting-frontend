import { formatTime } from '@/lib/utils';

/**
 * Lap-time input rules — matches the site's existing format, e.g. "00:57.241".
 *
 * Accepted inputs (all normalized to canonical "MM:SS.mmm"):
 *   - "00:57.241" / "1:02.5"    → minutes:seconds.millis
 *   - "1:26:880"                → minutes:seconds:millis (colon separator too)
 *   - "1:03,483"                → comma decimal separator
 *   - "01:03"                   → whole seconds (milliseconds optional → .000)
 *   - "57.241"                  → bare seconds
 *   - "63.483"                  → bare seconds over a minute (a 1:03 lap)
 * Seconds may be 1–2 digits after a colon. The millis separator may be ".", ","
 * or ":", and milliseconds are optional and 1–3 digits, right-padded (".5" →
 * ".500"). The overall value is still range-checked below, so nonsense is
 * rejected even though the shape is lenient.
 */
const MMSS = /^(\d{1,2}):([0-5]?\d)(?:[.,:](\d{1,3}))?$/;
const SECONDS_ONLY = /^(\d{1,3})(?:[.,](\d{1,3}))?$/;

export interface ParsedTime {
  seconds: number;
  timeStr: string; // canonical "MM:SS.mmm"
}

/** Returns null if the string is not a valid lap time. */
export function parseLapTime(input: string): ParsedTime | null {
  const raw = input.trim();
  if (!raw) return null;

  let minutes = 0;
  let secs = 0;
  let millis = '';

  const mmss = raw.match(MMSS);
  const secOnly = raw.match(SECONDS_ONLY);

  if (mmss) {
    minutes = parseInt(mmss[1], 10);
    secs = parseInt(mmss[2], 10);
    millis = mmss[3] ?? ''; // milliseconds are optional
  } else if (secOnly) {
    secs = parseInt(secOnly[1], 10);
    millis = secOnly[2] ?? '';
  } else {
    return null;
  }

  const ms = millis ? parseInt(millis.padEnd(3, '0'), 10) : 0;
  const seconds = minutes * 60 + secs + ms / 1000;

  // Guard against implausible values (> 20 min lap is almost certainly a typo).
  if (seconds <= 0 || seconds > 1200) return null;

  return { seconds, timeStr: formatTime(seconds) };
}

/**
 * Shared rule: if a track defines kart types, the submitted one must be one of
 * them. Returns an error message, or null when acceptable. The track's kart
 * list is the single source of truth (read from the Track collection).
 */
export function validateKartType(
  trackKartTypes: string[] | undefined,
  kartType: string | undefined
): string | null {
  const options = trackKartTypes ?? [];
  if (options.length === 0) return null; // track has no kart-type distinction
  if (!kartType) return 'Please select a kart type / layout.';
  if (!options.includes(kartType)) return 'Invalid kart type for this track.';
  return null;
}

export interface SessionInput {
  date?: unknown;
  trackSlug?: unknown;
  kartType?: unknown;
  bestTimeStr?: unknown;
  laps?: unknown; // array of time strings
  noTime?: unknown; // when true, the session is saved without any recorded time
  conditions?: unknown;
  kartNumber?: unknown;
  cost?: unknown;
  notes?: unknown;
}

export interface ValidatedSession {
  date: Date;
  trackSlug: string;
  kartType?: string;
  bestTime?: number; // undefined when noTime
  bestTimeStr?: string; // undefined when noTime
  laps: { lapNumber: number; time: number; timeStr: string }[];
  conditions?: string;
  kartNumber?: string;
  cost?: number;
  notes?: string;
}

export type ValidationResult =
  | { ok: true; value: ValidatedSession }
  | { ok: false; errors: Record<string, string> };

/**
 * Validates and normalizes a session payload. Note: this checks *shape and
 * format*. Whether the trackSlug/kartType actually exist is verified against
 * the Track collection in the API route (single source of truth).
 */
export function validateSession(input: SessionInput): ValidationResult {
  const errors: Record<string, string> = {};

  // --- Date & time ---
  let date: Date | null = null;
  if (typeof input.date !== 'string' || !input.date.trim()) {
    errors.date = 'Session date & time is required.';
  } else {
    const d = new Date(input.date);
    if (isNaN(d.getTime())) {
      errors.date = 'Enter a valid date and time.';
    } else if (d.getTime() > Date.now() + 5 * 60 * 1000) {
      errors.date = 'Session date cannot be in the future.';
    } else {
      date = d;
    }
  }

  // --- Track ---
  let trackSlug = '';
  if (typeof input.trackSlug !== 'string' || !input.trackSlug.trim()) {
    errors.trackSlug = 'Please select a track.';
  } else {
    trackSlug = input.trackSlug.trim();
  }

  const kartType =
    typeof input.kartType === 'string' && input.kartType.trim()
      ? input.kartType.trim()
      : undefined;

  // --- Lap times: either an explicit best time, a list of laps, or "no time" ---
  // When noTime is set the session is logged without any recorded lap time
  // (e.g. a DNF, a rained-out session, or a run where times weren't captured).
  const noTime = input.noTime === true;

  const laps: { lapNumber: number; time: number; timeStr: string }[] = [];
  if (!noTime && Array.isArray(input.laps)) {
    input.laps.forEach((lap, i) => {
      if (typeof lap !== 'string' || !lap.trim()) return; // skip blanks
      const parsed = parseLapTime(lap);
      if (!parsed) {
        errors[`laps.${i}`] = `Lap ${i + 1}: use MM:SS.mmm (e.g. 00:57.241).`;
      } else {
        laps.push({ lapNumber: laps.length + 1, time: parsed.seconds, timeStr: parsed.timeStr });
      }
    });
  }

  let best: ParsedTime | null = null;
  if (!noTime) {
    const hasBestInput = typeof input.bestTimeStr === 'string' && input.bestTimeStr.trim();
    if (hasBestInput) {
      best = parseLapTime(input.bestTimeStr as string);
      if (!best) {
        errors.bestTimeStr = 'Use MM:SS.mmm format, e.g. 00:57.241.';
      }
    }

    // Derive best from laps when no explicit best was given.
    if (!best && laps.length > 0) {
      const fastest = laps.reduce((a, b) => (b.time < a.time ? b : a));
      best = { seconds: fastest.time, timeStr: fastest.timeStr };
    }

    if (!best && laps.length === 0 && !errors.bestTimeStr) {
      errors.bestTimeStr = 'Enter a best lap time, add individual lap times, or select "No time".';
    }
  }

  // --- Optional fields ---
  let cost: number | undefined;
  if (input.cost !== undefined && input.cost !== null && input.cost !== '') {
    const n = Number(input.cost);
    if (isNaN(n) || n < 0) {
      errors.cost = 'Cost must be a positive number.';
    } else {
      cost = n;
    }
  }

  const conditions =
    typeof input.conditions === 'string' && input.conditions.trim()
      ? input.conditions.trim()
      : undefined;
  const kartNumber =
    typeof input.kartNumber === 'string' && input.kartNumber.trim()
      ? input.kartNumber.trim()
      : undefined;
  const notes =
    typeof input.notes === 'string' && input.notes.trim()
      ? input.notes.trim().slice(0, 2000)
      : undefined;

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      date: date!,
      trackSlug,
      kartType,
      bestTime: best?.seconds,
      bestTimeStr: best?.timeStr,
      laps,
      conditions,
      kartNumber,
      cost,
      notes,
    },
  };
}
