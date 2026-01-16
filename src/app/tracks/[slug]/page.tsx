'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Users, Clock, TrendingUp, ChevronLeft, Filter, Flame, BarChart3, Award, ExternalLink } from 'lucide-react';
import StatCard from '@/components/StatCard';
import SearchBar from '@/components/SearchBar';
import LeaderboardTable from '@/components/LeaderboardTable';
import TierDistributionChart from '@/components/TierDistributionChart';
import TimeDistributionChart from '@/components/TimeDistributionChart';
import TierBadge from '@/components/TierBadge';
import KartTypeSelector from '@/components/KartTypeSelector';
import WarZoneCard from '@/components/track/WarZoneCard';
import HallOfFameTimeline from '@/components/track/HallOfFameTimeline';
import DifficultyWallChart from '@/components/track/DifficultyWallChart';
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
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Advanced stats state
  const [warZoneData, setWarZoneData] = useState<any>(null);
  const [hallOfFameData, setHallOfFameData] = useState<any[]>([]);
  const [difficultyWallData, setDifficultyWallData] = useState<any[]>([]);
  const [advancedStatsLoading, setAdvancedStatsLoading] = useState(false);

  // Ref for scrolling to leaderboard
  const leaderboardRef = useRef<HTMLDivElement>(null);

  // Time range modal state
  const [timeRangeModalOpen, setTimeRangeModalOpen] = useState(false);
  const [timeRangeDrivers, setTimeRangeDrivers] = useState<LapRecord[]>([]);
  const [timeRangeInfo, setTimeRangeInfo] = useState({ minTime: 0, maxTime: 0, bin: '' });
  const [timeRangeLoading, setTimeRangeLoading] = useState(false);

  // Fetch track data
  useEffect(() => {
    async function fetchTrack() {
      try {
        const response = await fetch(`/api/tracks/${slug}`);
        const data = await response.json();
        if (data.success) {
          setTrack(data.track);
          // Set default kart type
          if (data.track.kartTypes && data.track.kartTypes.length > 0) {
            // Filter out LR5 for 2F2F track
            const availableKartTypes = slug === '2f2f-formula-karting'
              ? data.track.kartTypes.filter((kt: string) => kt !== 'LR5')
              : data.track.kartTypes;

            // Debug log to see what kart types are available
            console.log('Track slug:', slug);
            console.log('Available kart types:', availableKartTypes);

            // Set default kart type based on track
            if (slug === 'sportzilla-formula-karting') {
              // Try to find Sprint Kart (case-insensitive search)
              const sprintKart = availableKartTypes.find((kt: string) =>
                kt.toLowerCase().includes('sprint')
              );
              if (sprintKart) {
                console.log('Setting default to:', sprintKart);
                setSelectedKartType(sprintKart);
              } else {
                console.log('Sprint kart not found, using first:', availableKartTypes[0]);
                setSelectedKartType(availableKartTypes[0]);
              }
            } else {
              setSelectedKartType(availableKartTypes[0]);
            }
          }
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

  // Fetch advanced stats (war zone, hall of fame, difficulty wall)
  useEffect(() => {
    async function fetchAdvancedStats() {
      if (!selectedKartType) return;

      setAdvancedStatsLoading(true);
      try {
        const kartTypeParam = `?kartType=${selectedKartType}`;

        // Fetch all three endpoints in parallel
        const [warZoneRes, hallOfFameRes, difficultyWallRes] = await Promise.all([
          fetch(`/api/tracks/${slug}/war-zone${kartTypeParam}`).catch(() => null),
          fetch(`/api/tracks/${slug}/hall-of-fame${kartTypeParam}`).catch(() => null),
          fetch(`/api/tracks/${slug}/difficulty-wall${kartTypeParam}`).catch(() => null),
        ]);

        // Parse responses
        const [warZone, hallOfFame, difficultyWall] = await Promise.all([
          warZoneRes?.json().catch(() => null),
          hallOfFameRes?.json().catch(() => null),
          difficultyWallRes?.json().catch(() => null),
        ]);

        // Update state
        if (warZone?.success) {
          setWarZoneData(warZone.warZone);
        } else {
          setWarZoneData(null);
        }

        if (hallOfFame?.success) {
          setHallOfFameData(hallOfFame.hallOfFame);
        } else {
          setHallOfFameData([]);
        }

        if (difficultyWall?.success) {
          setDifficultyWallData(difficultyWall.difficultyWall);
        } else {
          setDifficultyWallData([]);
        }
      } catch (error) {
        console.error('Error fetching advanced stats:', error);
        setWarZoneData(null);
        setHallOfFameData([]);
        setDifficultyWallData([]);
      } finally {
        setAdvancedStatsLoading(false);
      }
    }

    fetchAdvancedStats();
  }, [slug, selectedKartType]);

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

    // Scroll to leaderboard with offset for sticky header
    setTimeout(() => {
      if (leaderboardRef.current) {
        const yOffset = -100; // Offset for sticky header
        const y = leaderboardRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  }, []);

  const handleKartTypeChange = useCallback((kartType: string) => {
    setSelectedKartType(kartType);
    setPage(1);
  }, []);

  const handleRowsPerPageChange = useCallback((value: number) => {
    setRowsPerPage(value);
    setPage(1);
  }, []);

  const handleTimeRangeClick = useCallback(async (minTime: number, maxTime: number, bin: string) => {
    setTimeRangeInfo({ minTime, maxTime, bin });
    setTimeRangeModalOpen(true);
    setTimeRangeLoading(true);

    try {
      const params = new URLSearchParams({
        minTime: minTime.toString(),
        maxTime: maxTime.toString(),
      });

      if (selectedKartType) {
        params.append('kartType', selectedKartType);
      }

      const response = await fetch(`/api/tracks/${slug}/time-range?${params}`);
      const data = await response.json();

      if (data.success) {
        setTimeRangeDrivers(data.records);
      }
    } catch (error) {
      console.error('Error fetching time range drivers:', error);
    } finally {
      setTimeRangeLoading(false);
    }
  }, [slug, selectedKartType]);

  // Handle escape key to close modal and prevent body scroll
  useEffect(() => {
    if (timeRangeModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && timeRangeModalOpen) {
        setTimeRangeModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [timeRangeModalOpen]);

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
            <div className="relative w-12 h-12 rounded-lg overflow-hidden">
              <Image
                src={`/tracks/${slug}.png`}
                alt={`${track.name} logo`}
                fill
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-display font-bold text-white">
                {track.name}
              </h1>
              <p className="text-xs md:text-sm text-gray-400">{track.location}</p>
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
        {/* 2F2F Layout Disclaimer */}
        {(slug === '2f2f-formula-karting' || slug === '2f2f-formula-karting-islamabad') && (
          <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="text-amber-500 mt-0.5">⚠️</div>
              <div>
                <h3 className="text-amber-400 font-semibold text-sm mb-1">Track Layout Notice</h3>
                <p className="text-amber-200/80 text-sm">
                  2F2F sometimes varies their track layouts. Some lap times around 50 seconds may reflect a different track configuration.
                </p>
              </div>
            </div>
          </div>
        )}

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
        <div className="bg-surface border border-surfaceHover rounded-lg p-4 md:p-6 mb-8">
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <SearchBar onSearch={handleSearch} placeholder="Search drivers..." />
            </div>

            {/* Kart Type and Tier Filters */}
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              {/* Kart Type Filter */}
              {track.kartTypes && track.kartTypes.length > 0 && (
                <KartTypeSelector
                  kartTypes={slug === '2f2f-formula-karting' ? track.kartTypes.filter((kt: string) => kt !== 'LR5') : track.kartTypes}
                  selectedKartType={selectedKartType}
                  onKartTypeChange={handleKartTypeChange}
                />
              )}

              {/* Tier Filter */}
              <div className="flex gap-2 flex-wrap items-center">
                <div className="text-xs md:text-sm text-gray-400 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>Filter by tier:</span>
                </div>
                {['S+', 'S', 'A', 'B', 'C', 'D'].map((tier) => (
                  <button
                    type="button"
                    key={tier}
                    onClick={() => handleTierFilter(tier)}
                    className={`px-2 py-1 md:px-3 md:py-1.5 rounded text-xs md:text-sm font-semibold transition-all ${
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
                    className="px-2 py-1 md:px-3 md:py-1.5 rounded text-xs md:text-sm text-gray-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div ref={leaderboardRef} className="mb-8">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-display font-bold text-white mb-6">
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
          {!loading && records.length >= 3 && page === 1 && !searchQuery && !selectedTier && (
            <div className="bg-gradient-to-b from-surface to-background border border-surfaceHover rounded-xl p-4 md:p-8 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
                {/* 1st Place - First on mobile */}
                <div className="flex flex-col items-center md:order-2">
                  <div className="w-full bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg p-4 md:p-6 text-center border-2 border-yellow-400 shadow-lg shadow-yellow-500/50">
                    <div className="text-4xl md:text-5xl mb-2">🏆</div>
                    <div className="text-xs md:text-sm text-yellow-200 mb-2 font-semibold">Champion</div>
                    <div className="text-lg md:text-xl font-display font-bold text-white mb-1">
                      {records[0].driverName}
                    </div>
                    <div className="flex justify-center mb-2">
                      <TierBadge tier={records[0].tier} />
                    </div>
                    <div className="text-2xl md:text-3xl font-mono font-bold text-white">
                      {records[0].bestTimeStr}
                    </div>
                    <div className="text-xs text-yellow-200 mt-2 font-semibold">
                      Track Record
                    </div>
                    <a
                      href={records[0].profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-yellow-200 hover:text-white mt-3 transition-colors"
                    >
                      View Profile
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* 2nd Place */}
                <div className="flex flex-col items-center md:order-1">
                  <div className="w-full bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg p-4 md:p-6 text-center border-2 border-gray-500">
                    <div className="text-3xl md:text-4xl mb-2">🥈</div>
                    <div className="text-xs md:text-sm text-gray-400 mb-2">2nd Place</div>
                    <div className="text-base md:text-lg font-display font-bold text-white mb-1">
                      {records[1].driverName}
                    </div>
                    <div className="flex justify-center mb-2">
                      <TierBadge tier={records[1].tier} />
                    </div>
                    <div className="text-xl md:text-2xl font-mono font-bold text-accent">
                      {records[1].bestTimeStr}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {formatGap(records[1].gapToP1)}
                    </div>
                    <a
                      href={records[1].profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-gray-300 hover:text-white mt-3 transition-colors"
                    >
                      View Profile
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center md:order-3">
                  <div className="w-full bg-gradient-to-br from-orange-700 to-orange-900 rounded-lg p-4 md:p-6 text-center border-2 border-orange-600">
                    <div className="text-3xl md:text-4xl mb-2">🥉</div>
                    <div className="text-xs md:text-sm text-gray-400 mb-2">3rd Place</div>
                    <div className="text-base md:text-lg font-display font-bold text-white mb-1">
                      {records[2].driverName}
                    </div>
                    <div className="flex justify-center mb-2">
                      <TierBadge tier={records[2].tier} />
                    </div>
                    <div className="text-xl md:text-2xl font-mono font-bold text-accent">
                      {records[2].bestTimeStr}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {formatGap(records[2].gapToP1)}
                    </div>
                    <a
                      href={records[2].profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-gray-300 hover:text-white mt-3 transition-colors"
                    >
                      View Profile
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rest of Leaderboard Table */}
          <div className="bg-surface border border-surfaceHover rounded-lg p-6">
            <LeaderboardTable
              records={page === 1 && !searchQuery && !selectedTier ? records.slice(3) : records}
              loading={loading}
              showKartType={track.kartTypes && track.kartTypes.length > 1}
            />

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-6">
              {/* Rows per page selector */}
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs sm:text-sm text-gray-400">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                  className="px-2 sm:px-3 py-2 bg-surfaceHover text-white text-sm rounded border border-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Page navigation */}
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="hidden sm:inline-block px-2 sm:px-3 py-2 bg-surfaceHover text-white text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
                >
                  First
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 sm:px-4 py-2 bg-surfaceHover text-white text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
                >
                  Prev
                </button>
                <div className="flex items-center gap-2 px-2 sm:px-4">
                  <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                    Page {page} of {totalPages}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 sm:px-4 py-2 bg-surfaceHover text-white text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="hidden sm:inline-block px-2 sm:px-3 py-2 bg-surfaceHover text-white text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Stats Sections */}
        {selectedKartType && (
          <>
            {/* Hall of Fame */}
            {hallOfFameData.length > 0 && !advancedStatsLoading && (
              <div className="bg-surface border border-surfaceHover rounded-xl p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-display font-bold text-white">Hall of Fame</h2>
                </div>
                <p className="text-sm text-gray-400 mb-6">
                  Track record history for {selectedKartType}
                </p>
                <HallOfFameTimeline records={hallOfFameData} />
              </div>
            )}

            {/* War Zone Section */}
            {warZoneData && !advancedStatsLoading && (
              <div className="mb-8">
                <WarZoneCard
                  timeStart={warZoneData.timeStart}
                  timeEnd={warZoneData.timeEnd}
                  driverCount={warZoneData.driverCount}
                />
              </div>
            )}

            {/* Difficulty Wall Chart */}
            {difficultyWallData.length > 0 && !advancedStatsLoading && (
              <div className="bg-surface border border-surfaceHover rounded-xl p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-display font-bold text-white">The Difficulty Wall</h2>
                </div>
                <p className="text-sm text-gray-400 mb-6">
                  Distribution of lap times for {selectedKartType}
                </p>
                <DifficultyWallChart
                  data={difficultyWallData}
                  warZoneStart={warZoneData?.timeStart}
                  warZoneEnd={warZoneData?.timeEnd}
                />
              </div>
            )}

            {/* Loading State for Advanced Stats */}
            {advancedStatsLoading && (
              <div className="bg-surface border border-surfaceHover rounded-xl p-12 mb-8 text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading track statistics...</p>
              </div>
            )}
          </>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <TimeDistributionChart
            data={timeDistribution}
            onTimeRangeClick={handleTimeRangeClick}
          />
          <TierDistributionChart
            data={tierDistribution}
            onTierClick={handleTierFilter}
            selectedTier={selectedTier}
          />
        </div>

        {/* Time Range Modal */}
        {timeRangeModalOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setTimeRangeModalOpen(false)}
          >
            <div
              className="bg-surface border border-surfaceHover rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-surfaceHover">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white">
                      Drivers in Time Range
                      {!timeRangeLoading && timeRangeDrivers.length > 0 && (
                        <span className="ml-3 text-lg text-gray-400 font-normal">
                          ({timeRangeDrivers.length})
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {timeRangeInfo.bin}
                    </p>
                  </div>
                  <button
                    onClick={() => setTimeRangeModalOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {timeRangeLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : timeRangeDrivers.length > 0 ? (
                  <div className="space-y-2">
                    {timeRangeDrivers.map((record) => (
                      <div
                        key={`${record.driverSlug}-${record.date}`}
                        className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-surfaceHover transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-sm font-semibold text-gray-500 w-12">
                            #{record.position}
                          </div>
                          <div className="flex-1">
                            <a
                              href={record.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white font-semibold hover:text-primary transition-colors"
                            >
                              {record.driverName}
                            </a>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-mono font-bold text-accent">
                              {record.bestTimeStr}
                            </div>
                          </div>
                          <div>
                            <TierBadge tier={record.tier} size="sm" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    No drivers found in this time range
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
