import mongoose, { Schema, model, models } from 'mongoose';

export interface ILapRecord {
  _id: mongoose.Types.ObjectId;
  trackId: mongoose.Types.ObjectId;
  trackName: string;
  trackSlug: string;
  driverId?: mongoose.Types.ObjectId;
  driverName: string;
  driverSlug: string;
  profileUrl: string;
  position: number;
  bestTime: number;
  bestTimeStr: string;
  date: Date;
  maxKmh?: number;
  maxG?: number;
  tier: string;
  percentile: number;
  gapToP1: number;
  interval: number;
  zScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const LapRecordSchema = new Schema<ILapRecord>(
  {
    trackId: { type: Schema.Types.ObjectId, ref: 'Track', required: true, index: true },
    trackName: { type: String, required: true },
    trackSlug: { type: String, required: true, index: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
    driverName: { type: String, required: true },
    driverSlug: { type: String, required: true, index: true },
    profileUrl: { type: String, required: true },
    position: { type: Number, required: true },
    bestTime: { type: Number, required: true },
    bestTimeStr: { type: String, required: true },
    date: { type: Date, required: true },
    maxKmh: { type: Number },
    maxG: { type: Number },
    tier: { type: String, required: true, index: true },
    percentile: { type: Number, required: true },
    gapToP1: { type: Number, required: true },
    interval: { type: Number, required: true },
    zScore: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
LapRecordSchema.index({ trackId: 1, position: 1 });
LapRecordSchema.index({ trackSlug: 1, position: 1 });
LapRecordSchema.index({ tier: 1, trackId: 1 });
LapRecordSchema.index({ trackSlug: 1, driverSlug: 1 }, { unique: true });

const LapRecord = models.LapRecord || model<ILapRecord>('LapRecord', LapRecordSchema);

export default LapRecord;
