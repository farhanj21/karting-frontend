import Link from 'next/link';
import Image from 'next/image';
import MobileNav from '@/components/MobileNav';
import { SignatureInView } from '@/components/ui/SignatureInView';
import { Track } from '@/types';
import connectDB from '@/lib/mongodb';
import TrackModel from '@/lib/models/Track';
import LapRecord from '@/lib/models/LapRecord';

interface TrackWithKartRecords extends Track {
  kartRecords?: Array<{
    kartType: string;
    worldRecord: string;
    recordHolder: string;
  }>;
}

async function getTracks(): Promise<TrackWithKartRecords[]> {
  try {
    await connectDB();
    const tracks = await TrackModel.find({}).sort({ 'stats.totalDrivers': -1 }).lean();

    // For each track, get the world record for each kart type
    const tracksWithKartRecords = await Promise.all(
      tracks.map(async (track) => {
        if (track.kartTypes && track.kartTypes.length > 1) {
          // Fetch world record for each kart type
          const kartRecords = await Promise.all(
            track.kartTypes.map(async (kartType: string) => {
              const record: any = await LapRecord.findOne({
                trackSlug: track.slug,
                kartType: kartType,
              })
                .sort({ bestTime: 1 })
                .limit(1)
                .lean();

              return {
                kartType,
                worldRecord: record?.bestTimeStr || 'N/A',
                recordHolder: record?.driverName || 'Unknown',
              };
            })
          );

          return {
            ...track,
            kartRecords,
          };
        }

        return track;
      })
    );

    return JSON.parse(JSON.stringify(tracksWithKartRecords));
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return [];
  }
}

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  const tracks = await getTracks();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div>
              <p className="text-base font-semibold tracking-tight">Karting Analysis</p>
              <p className="text-xs text-zinc-500">Pakistan track leaderboards</p>
            </div>

            {/* Mobile navigation */}
            <MobileNav />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="max-w-2xl">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Lap time analysis for Pakistan&apos;s karting tracks
          </h1>
          <p className="mt-4 text-base text-zinc-400">
            Leaderboards, tier rankings, and lap time distributions for every driver,
            sourced from official RaceFacer timing data.
          </p>
        </div>

        {/* Track Selection */}
        <div className="mt-12 md:mt-16">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Select a track
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {tracks.map((track) => (
              <Link
                key={track.slug}
                href={`/tracks/${track.slug}`}
                className="group rounded-xl border bg-surface p-6 transition-colors duration-150 hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold tracking-tight transition-colors duration-150 group-hover:text-accent-soft">
                      {track.name}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">{track.location}</p>
                  </div>
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={`/tracks/${track.slug}.png`}
                      alt={`${track.name} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {track.kartRecords && track.kartRecords.length > 0 ? (
                  <div className="mt-6">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      {track.kartTypes?.some(t => t.toLowerCase().includes('track'))
                        ? 'Records by layout'
                        : 'Records by kart type'}
                    </p>
                    <dl className="mt-3 space-y-2.5">
                      {track.kartRecords.map((kartRecord) => (
                        <div key={kartRecord.kartType} className="flex items-baseline justify-between gap-4">
                          <dt className="truncate text-sm text-zinc-400">{kartRecord.kartType}</dt>
                          <dd className="flex items-baseline gap-2 text-right">
                            <span className="text-xs text-zinc-500">{kartRecord.recordHolder}</span>
                            <span className="font-mono text-sm tabular-nums text-accent-soft">
                              {kartRecord.worldRecord}
                            </span>
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-5 flex items-center justify-between border-t pt-4">
                      <p className="text-sm text-zinc-500">
                        {(track.stats?.totalDrivers || 0).toLocaleString()} drivers
                      </p>
                      <span className="text-sm font-medium text-accent-soft">
                        View leaderboard →
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                          Track record
                        </p>
                        <p className="mt-1.5 font-mono text-lg tabular-nums text-accent-soft">
                          {track.stats?.worldRecordStr || 'N/A'}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">{track.stats?.recordHolder || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                          Total drivers
                        </p>
                        <p className="mt-1.5 text-lg font-semibold tabular-nums text-zinc-100">
                          {(track.stats?.totalDrivers || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm font-medium text-accent-soft">
                      View leaderboard →
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 border-t">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-zinc-500 sm:text-left">
            Data sourced from RaceFacer
          </p>
          <div className="flex justify-center">
            <SignatureInView />
          </div>
          <p className="text-center text-xs text-zinc-500 sm:text-right">
            Updated to 9th July 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
