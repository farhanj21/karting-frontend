export interface Track {
  _id: string;
  name: string;
  slug: string;
  location: string;
  description?: string;
  logo?: string;
  stats: TrackStats;
  createdAt: string;
  updatedAt: string;
}

export interface TrackStats {
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
  lastUpdated: string;
}

export interface LapRecord {
  _id: string;
  trackId: string;
  trackName: string;
  trackSlug: string;
  driverId?: string;
  driverName: string;
  driverSlug: string;
  profileUrl: string;
  position: number;
  bestTime: number;
  bestTimeStr: string;
  date: string;
  maxKmh?: number;
  maxG?: number;
  tier: string;
  percentile: number;
  gapToP1: number;
  interval: number;
  zScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  _id: string;
  name: string;
  slug: string;
  profileUrl: string;
  records: DriverRecord[];
  bestOverallTime?: number;
  bestOverallTrack?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverRecord {
  trackId: string;
  trackName: string;
  trackSlug: string;
  position: number;
  bestTime: number;
  bestTimeStr: string;
  date: string;
  maxKmh?: number;
  maxG?: number;
  tier: string;
  percentile: number;
  gapToP1: number;
  interval: number;
}

export interface LeaderboardResponse {
  records: LapRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TierDistribution {
  tier: string;
  count: number;
  percentage: number;
}

export interface TimeDistribution {
  bin: string;
  count: number;
  minTime: number;
  maxTime: number;
}

export type Tier = 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';
