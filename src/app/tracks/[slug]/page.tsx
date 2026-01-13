'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Users, Clock, TrendingUp, ChevronLeft, Filter } from 'lucide-react';
import StatCard from '@/components/StatCard';
import SearchBar from '@/components/SearchBar';
import LeaderboardTable from '@/components/LeaderboardTable';
import TierDistributionChart from '@/components/TierDistributionChart';
import TimeDistributionChart from '@/components/TimeDistributionChart';
import { Track, LapRecord, TierDistribution, TimeDistribution } from '@/types';
import { formatTime } from '@/lib/utils';

export default function TrackLeaderboardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [track, setTrack] = useState<Track | null>(null);
  const [records, setRecords] = useState<LapRecord[]>([]);
  const [tierDistribution, setTierDistribution] = useState<TierDistribution[]>([]);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch track data
  useEffect(() => {
    async function fetchTrack() {
      try {
        const response = await fetch(`/api/tracks/${slug}`);
        const data = await response.json();
        if (data.success) {
          setTrack(data.track);
        }
      } catch (error) {
        console.error('Error fetching track:', error);
      }
    }
    fetchTrack();
  }, [slug]);

  // Fetch leaderboard
  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '50',
        });

        if (searchQuery) {
          params.append('search', searchQuery);
        }

        if (selectedTier) {
          params.append('tier', selectedTier);
        }

        const response = await fetch(`/api/tracks/${slug}/leaderboard?${params}`);
        const data = await response.json();

        if (data.success) {
          setRecords(data.records);
          setTotalPages(data.pagination.totalPages);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [slug, searchQuery, selectedTier, page]);

  // Fetch stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/tracks/${slug}/stats`);
        const data = await response.json();

        if (data.success) {
          setTierDistribution(data.tierDistribution);
          setTimeDistribution(data.timeDistribution);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }

    fetchStats();
  }, [slug]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleTierFilter = (tier: string) => {
    setSelectedTier(tier === selectedTier ? '' : tier);
    setPage(1);
  };

  if (!track) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading track data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-surface sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-white">
                {track.name}
              </h1>
              <p className="text-sm text-gray-400">{track.location}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="World Record"
            value={track.stats.worldRecordStr}
            subtitle={track.stats.recordHolder}
            icon={Trophy}
            iconColor="text-accent"
          />
          <StatCard
            title="Total Drivers"
            value={track.stats.totalDrivers.toLocaleString()}
            icon={Users}
            iconColor="text-primary"
          />
          <StatCard
            title="Top 1% Time"
            value={formatTime(track.stats.top1Percent)}
            subtitle="Elite threshold"
            icon={TrendingUp}
            iconColor="text-secondary"
          />
          <StatCard
            title="Median Time"
            value={formatTime(track.stats.median)}
            subtitle="Average performance"
            icon={Clock}
            iconColor="text-tierC"
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-surface border border-surfaceHover rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar onSearch={handleSearch} placeholder="Search drivers..." />
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>Filter by tier:</span>
              </div>
              {['S+', 'S', 'A', 'B', 'C', 'D'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => handleTierFilter(tier)}
                  className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                    selectedTier === tier
                      ? 'bg-primary text-white'
                      : 'bg-surfaceHover text-gray-400 hover:bg-surface'
                  }`}
                >
                  {tier}
                </button>
              ))}
              {selectedTier && (
                <button
                  onClick={() => setSelectedTier('')}
                  className="px-3 py-1 rounded text-sm text-gray-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-surface border border-surfaceHover rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-display font-bold text-white mb-6">
            Leaderboard
            {searchQuery && (
              <span className="text-sm text-gray-400 font-normal ml-2">
                (searching for "{searchQuery}")
              </span>
            )}
            {selectedTier && (
              <span className="text-sm text-gray-400 font-normal ml-2">
                (Tier {selectedTier})
              </span>
            )}
          </h2>
          <LeaderboardTable records={records} loading={loading} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-surfaceHover text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">
                  Page {page} of {totalPages}
                </span>
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-surfaceHover text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <TimeDistributionChart data={timeDistribution} />
          <TierDistributionChart data={tierDistribution} />
        </div>
      </div>
    </div>
  );
}
