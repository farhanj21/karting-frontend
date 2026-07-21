import mongoose, { Schema, model, models } from 'mongoose';

export interface ISessionLap {
  lapNumber: number;
  time: number; // seconds
  timeStr: string; // "MM:SS.mmm"
}

export interface IKartingSession {
  _id: mongoose.Types.ObjectId;
  userId: string; // Clerk user id — the ownership key
  date: Date; // date & time of the session
  trackSlug: string;
  trackName: string;
  kartType?: string; // track-dependent (e.g. "Pro Karts", "Track 1")
  bestTime: number; // seconds — canonical value for sorting / PB math
  bestTimeStr: string; // "MM:SS.mmm"
  laps: ISessionLap[]; // optional list of individual laps
  conditions?: string; // weather / track condition
  kartNumber?: string;
  cost?: number; // session cost
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionLapSchema = new Schema<ISessionLap>(
  {
    lapNumber: { type: Number, required: true },
    time: { type: Number, required: true },
    timeStr: { type: String, required: true },
  },
  { _id: false }
);

const KartingSessionSchema = new Schema<IKartingSession>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    trackSlug: { type: String, required: true, index: true },
    trackName: { type: String, required: true },
    kartType: { type: String },
    bestTime: { type: Number, required: true },
    bestTimeStr: { type: String, required: true },
    laps: { type: [SessionLapSchema], default: [] },
    conditions: { type: String },
    kartNumber: { type: String },
    cost: { type: Number, min: 0 },
    notes: { type: String, maxlength: 2000 },
  },
  {
    timestamps: true,
  }
);

// Ownership-scoped access patterns: list a user's sessions newest-first,
// and compute a user's personal best per track.
KartingSessionSchema.index({ userId: 1, date: -1 });
KartingSessionSchema.index({ userId: 1, trackSlug: 1, bestTime: 1 });

const KartingSession =
  models.KartingSession || model<IKartingSession>('KartingSession', KartingSessionSchema);

export default KartingSession;
