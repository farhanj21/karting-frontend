'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Users, Clock, TrendingUp, ChevronLeft, Filter } from 'lucide-react';
import StatCard from '@/components/StatCard';
import SearchBar from '@/components/SearchBar';
import LeaderboardTable from '@/components/LeaderboardTable';
import TierDistributionChart from '@/components/TierDistributionChart';
import TimeDistributionChart from '@/components/TimeDistributionChart';
import TierBadge from '@/components/TierBadge';
import KartTypeSelector from '@/components/KartTypeSelector';
import { Track, LapRecord, TierDistribution, TimeDistribution } from '@/types';
import { formatTime, formatGap } from '@/lib/utils';

export default function TrackLeaderboardPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [track, setTrack] = useState<Track | null>(null);
  const [records, setRecords] = useState<LapRecord[]>([]);
  const [tierDistribution, setTierDistribution] = useState<TierDistribution[]>([]);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedKartType, setSelectedKartType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

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
          limit: rowsPerPage.toString(),
        });

        if (searchQuery) {
          params.append('search', searchQuery);
        }

        if (selectedTier) {
          params.append('tier', selectedTier);
        }

        if (selectedKartType) {
          params.append('kartType', selectedKartType);
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
  }, [slug, searchQuery, selectedTier, selectedKartType, page, rowsPerPage]);

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

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleTierFilter = useCallback((tier: string) => {
    setSelectedTier(prevTier => {
      const newTier = tier === prevTier ? '' : tier;
      return newTier;
    });
    setPage(1);
  }, []);

  const handleKartTypeChange = useCallback((kartType: string) => {
    setSelectedKartType(kartType);
    setPage(1);
  }, []);

  const handleRowsPerPageChange = useCallback((value: number) => {
    setRowsPerPage(value);
    setPage(1);
  }, []);

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
            {track.logo && (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                <Image
                  src={track.logo}
                  alt={`${track.name} logo`}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-white">
                {track.name}
              </h1>
              <p className="text-sm text-gray-400">{track.location}</p>
            </div>
            <Link
              href={`/tracks/${slug}/about`}
              className="px-4 py-2 bg-surfaceHover text-white rounded hover:bg-surface transition-colors text-sm font-medium"
            >
              About Track
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Drivers"
            value={track.stats.totalDrivers.toLocaleString()}
            icon={Users}
            iconColor="text-primary"
          />
          <StatCard
            title="Top 1% Time"
            value={formatTime(track.stats.top1Percent)}
            icon={TrendingUp}
            iconColor="text-secondary"
          />
          <StatCard
            title="Median Time"
            value={formatTime(track.stats.median)}
            icon={Clock}
            iconColor="text-tierC"
          />
          <StatCard
            title="Mean Time"
            value={track.stats.mean ? formatTime(track.stats.mean) : 'N/A'}
            icon={Clock}
            iconColor="text-tierB"
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-surface border border-surfaceHover rounded-lg p-6 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <SearchBar onSearch={handleSearch} placeholder="Search drivers..." />
            </div>

            {/* Kart Type Filter */}
            {track.kartTypes && track.kartTypes.length > 0 && (
              <KartTypeSelector
                kartTypes={track.kartTypes}
                selectedKartType={selectedKartType}
                onKartTypeChange={handleKartTypeChange}
              />
            )}

            {/* Tier Filter */}
            <div className="flex gap-2 flex-wrap">
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>Filter by tier:</span>
              </div>
              {['S+', 'S', 'A', 'B', 'C', 'D'].map((tier) => (
                <button
                  type="button"
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
                  type="button"
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
        <div className="mb-8">
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
            {selectedKartType && (
              <span className="text-sm text-gray-400 font-normal ml-2">
                ({selectedKartType})
              </span>
            )}
          </h2>

          {/* Podium - Only show on first page without filters */}
          {!loading && records.length >= 3 && page === 1 && !searchQuery && !selectedTier && !selectedKartType && (
            <div className="bg-gradient-to-b from-surface to-background border border-surfaceHover rounded-xl p-8 mb-6">
              <div className="flex items-center justify-center gap-4 max-w-4xl mx-auto">
                {/* 2nd Place */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg p-6 text-center border-2 border-gray-500">
                    <div className="text-4xl mb-2">🥈</div>
                    <div className="text-sm text-gray-400 mb-2">2nd Place</div>
                    <div className="text-lg font-display font-bold text-white mb-1">
                      {records[1].driverName}
                    </div>
                    <div className="flex justify-center mb-2">
                      <TierBadge tier={records[1].tier} />
                    </div>
                    <div className="text-2xl font-mono font-bold text-accent">
                      {records[1].bestTimeStr}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      +{formatGap(records[1].gapToP1)}
                    </div>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg p-6 text-center border-2 border-yellow-400 shadow-lg shadow-yellow-500/50">
                    <div className="text-5xl mb-2">🏆</div>
                    <div className="text-sm text-yellow-200 mb-2 font-semibold">Champion</div>
                    <div className="text-xl font-display font-bold text-white mb-1">
                      {records[0].driverName}
                    </div>
                    <div className="flex justify-center mb-2">
                      <TierBadge tier={records[0].tier} />
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {records[0].bestTimeStr}
                    </div>
                    <div className="text-xs text-yellow-200 mt-2 font-semibold">
                      World Record
                    </div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gradient-to-br from-orange-700 to-orange-900 rounded-lg p-6 text-center border-2 border-orange-600">
                    <div className="text-4xl mb-2">🥉</div>
                    <div className="text-sm text-gray-400 mb-2">3rd Place</div>
                    <div className="text-lg font-display font-bold text-white mb-1">
                      {records[2].driverName}
                    </div>
                    <div className="flex justify-center mb-2">
                      <TierBadge tier={records[2].tier} />
                    </div>
                    <div className="text-2xl font-mono font-bold text-accent">
                      {records[2].bestTimeStr}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      +{formatGap(records[2].gapToP1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rest of Leaderboard Table */}
          <div className="bg-surface border border-surfaceHover rounded-lg p-6">
            <LeaderboardTable
              records={page === 1 && !searchQuery && !selectedTier && !selectedKartType ? records.slice(3) : records}
              loading={loading}
              startPosition={page === 1 && !searchQuery && !selectedTier && !selectedKartType ? 4 : (page - 1) * rowsPerPage + 1}
              showKartType={!!selectedKartType || (track.kartTypes && track.kartTypes.length > 1)}
            />

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              {/* Rows per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                  className="px-3 py-2 bg-surfaceHover text-white rounded border border-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-3 py-2 bg-surfaceHover text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
                >
                  First
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-surfaceHover text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2 px-4">
                  <span className="text-gray-400">
                    Page {page} of {totalPages}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-surfaceHover text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="px-3 py-2 bg-surfaceHover text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
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
