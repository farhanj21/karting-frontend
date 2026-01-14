import mongoose, { Schema, model, models } from 'mongoose';

export interface ITrack {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  location: string;
  description?: string;
  logo?: string;
  kartTypes?: string[];
  stats: {
    totalDrivers: number;
    worldRecord: number;
    worldRecordStr: string;
    recordHolder: string;
    recordHolderSlug: string;
    top1Percent: number;
    top5Percent: number;
    top10Percent: number;
    median: number;
    mean?: number;
    slowest: number;
    metaTime?: number;
    warZone?: {
      start: number;
      end: number;
      driverCount: number;
    };
    lastUpdated: Date;
  };
  about?: {
    layoutImage?: string;
    description?: string;
    details?: {
      length?: string;
      width?: string;
      corners?: number;
      surface?: string;
      lapRecord?: string;
      kartType?: string;
    };
    videos?: string[];
    mapLocation?: {
      lat: number;
      lng: number;
      embedUrl?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const TrackSchema = new Schema<ITrack>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    location: { type: String, required: true },
    description: { type: String },
    logo: { type: String },
    kartTypes: [{ type: String }],
    stats: {
      totalDrivers: { type: Number, required: true },
      worldRecord: { type: Number, required: true },
      worldRecordStr: { type: String, required: true },
      recordHolder: { type: String, required: true },
      recordHolderSlug: { type: String, required: true },
      top1Percent: { type: Number, required: true },
      top5Percent: { type: Number, required: true },
      top10Percent: { type: Number, required: true },
      median: { type: Number, required: true },
      mean: { type: Number },
      slowest: { type: Number, required: true },
      metaTime: { type: Number },
      warZone: {
        start: { type: Number },
        end: { type: Number },
        driverCount: { type: Number },
      },
      lastUpdated: { type: Date, default: Date.now },
    },
    about: {
      layoutImage: { type: String },
      description: { type: String },
      details: {
        length: { type: String },
        width: { type: String },
        corners: { type: Number },
        surface: { type: String },
        lapRecord: { type: String },
        kartType: { type: String },
      },
      videos: [{ type: String }],
      mapLocation: {
        lat: { type: Number },
        lng: { type: Number },
        embedUrl: { type: String },
      },
    },
  },
  {
    timestamps: true,
  }
);

const Track = models.Track || model<ITrack>('Track', TrackSchema);

export default Track;
