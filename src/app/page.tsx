import Link from 'next/link';
import Image from 'next/image';
import { Users, Clock, TrendingUp } from 'lucide-react';
import { Track } from '@/types';
import connectDB from '@/lib/mongodb';
import TrackModel from '@/lib/models/Track';

async function getTracks(): Promise<Track[]> {
  try {
    await connectDB();
    const tracks = await TrackModel.find({}).sort({ 'stats.totalDrivers': -1 }).lean();
    return JSON.parse(JSON.stringify(tracks));
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
      <header className="border-b border-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-white">
                <span className="text-primary">Karting</span> Analysis
              </h1>
              <p className="text-sm text-gray-400 mt-1">Lahore Track Leaderboards</p>
            </div>
            <nav className="flex items-center gap-6">
              <Link
                href="/tracks/sportzilla-formula-karting"
                className="text-gray-400 hover:text-primary transition-colors font-medium"
              >
                Sportzilla
              </Link>
              <Link
                href="/tracks/apex-autodrome"
                className="text-gray-400 hover:text-primary transition-colors font-medium"
              >
                Apex Autodrome
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-display font-bold text-white mb-4">
            Track Your <span className="text-primary">Racing</span> Performance
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Comprehensive lap time analysis with tier rankings, percentiles, and competitive insights
            for Lahore's premier karting tracks.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-surface border border-surfaceHover rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-white mb-2">Tier Rankings</h3>
            <p className="text-sm text-gray-400">S+ to D tier classification based on statistical analysis</p>
          </div>

          <div className="bg-surface border border-surfaceHover rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-display font-semibold text-white mb-2">Live Leaderboards</h3>
            <p className="text-sm text-gray-400">Real-time rankings with search and filters</p>
          </div>

          <div className="bg-surface border border-surfaceHover rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-display font-semibold text-white mb-2">Gap Analysis</h3>
            <p className="text-sm text-gray-400">See your gap to P1 and nearby competitors</p>
          </div>

          <div className="bg-surface border border-surfaceHover rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-tierA/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-tierA" />
            </div>
            <h3 className="font-display font-semibold text-white mb-2">Statistics</h3>
            <p className="text-sm text-gray-400">Percentiles, distributions, and insights</p>
          </div>
        </div>

                {/* Track Selection */}
        <div>
          <h3 className="text-3xl font-display font-bold text-white mb-8 text-center">
            Select a Track
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tracks.map((track) => (
              <Link
                key={track.slug}
                href={`/tracks/${track.slug}`}
                className="group bg-surface border border-surfaceHover rounded-xl p-8 hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h4 className="text-2xl font-display font-bold text-white group-hover:text-primary transition-colors mb-2">
                      {track.name}
                    </h4>
                    <p className="text-gray-400">{track.location}</p>
                  </div>
                  {track.logo && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden group-hover:scale-110 transition-transform">
                      <Image
                        src={track.logo}
                        alt={`${track.name} logo`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">World Record</div>
                    <div className="text-xl font-bold text-accent">{track.stats?.worldRecordStr || 'N/A'}</div>
                    <div className="text-xs text-gray-500 mt-1">{track.stats?.recordHolder || 'Unknown'}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">Total Drivers</div>
                    <div className="text-xl font-bold text-white">{(track.stats?.totalDrivers || 0).toLocaleString()}</div>
                  </div>

                  <div className="flex items-end justify-end">
                    <div className="text-primary group-hover:translate-x-2 transition-transform">
                      View Leaderboard →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

        

      {/* Footer */}
      <footer className="border-t border-surface mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400 text-sm">
            <p>Data sourced from RaceFacer • Updated every day at 2PM PKT</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
