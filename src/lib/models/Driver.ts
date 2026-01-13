import mongoose, { Schema, model, models } from 'mongoose';

interface IDriverRecord {
  trackId: mongoose.Types.ObjectId;
  trackName: string;
  trackSlug: string;
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
}

export interface IDriver {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  profileUrl: string;
  records: IDriverRecord[];
  bestOverallTime?: number;
  bestOverallTrack?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DriverRecordSchema = new Schema<IDriverRecord>(
  {
    trackId: { type: Schema.Types.ObjectId, ref: 'Track', required: true },
    trackName: { type: String, required: true },
    trackSlug: { type: String, required: true },
    position: { type: Number, required: true },
    bestTime: { type: Number, required: true },
    bestTimeStr: { type: String, required: true },
    date: { type: Date, required: true },
    maxKmh: { type: Number },
    maxG: { type: Number },
    tier: { type: String, required: true },
    percentile: { type: Number, required: true },
    gapToP1: { type: Number, required: true },
    interval: { type: Number, required: true },
  },
  { _id: false }
);

const DriverSchema = new Schema<IDriver>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    profileUrl: { type: String, required: true, unique: true },
    records: [DriverRecordSchema],
    bestOverallTime: { type: Number },
    bestOverallTrack: { type: String },
  },
  {
    timestamps: true,
  }
);

const Driver = models.Driver || model<IDriver>('Driver', DriverSchema);

export default Driver;
