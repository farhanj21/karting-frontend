'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Clock, TrendingUp, ChevronLeft, Filter, BarChart3, Award, ExternalLink, AlertTriangle, X } from 'lucide-react';
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
  const [timeRangePage, setTimeRangePage] = useState(1);
  const [timeRangeHasMore, setTimeRangeHasMore] = useState(false);
  const [timeRangeTotalCount, setTimeRangeTotalCount] = useState(0);
  const [timeRangeLoadingMore, setTimeRangeLoadingMore] = useState(false);

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
        const kartTypeParam = selectedKartType ? `?kartType=${selectedKartType}` : '';
        const response = await fetch(`/api/tracks/${slug}/stats${kartTypeParam}`);
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
  }, [slug, selectedKartType]);

  // Fetch advanced stats (war zone, hall of fame, difficulty wall)
  useEffect(() => {
    async function fetchAdvancedStats() {
      // Skip if track has kart types but none selected yet
      if (track?.kartTypes && track.kartTypes.length > 0 && !selectedKartType) return;

      setAdvancedStatsLoading(true);
      try {
        const kartTypeParam = selectedKartType ? `?kartType=${selectedKartType}` : '';

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
  }, [slug, selectedKartType, track]);

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
    setTimeRangePage(1);

    try {
      const params = new URLSearchParams({
        minTime: minTime.toString(),
        maxTime: maxTime.toString(),
        page: '1',
        limit: '100',
      });

      if (selectedKartType) {
        params.append('kartType', selectedKartType);
      }

      const response = await fetch(`/api/tracks/${slug}/time-range?${params}`);
      const data = await response.json();

      if (data.success) {
        setTimeRangeDrivers(data.records);
        setTimeRangeHasMore(data.hasMore || false);
        setTimeRangeTotalCount(data.totalCount || data.count);
      }
    } catch (error) {
      console.error('Error fetching time range drivers:', error);
    } finally {
      setTimeRangeLoading(false);
    }
  }, [slug, selectedKartType]);

  const handleDifficultyWallClick = useCallback(async (timeInSeconds: number) => {
    const formattedTime = formatTime(timeInSeconds);
    setTimeRangeInfo({ minTime: timeInSeconds, maxTime: timeInSeconds + 1, bin: formattedTime });
    setTimeRangeModalOpen(true);
    setTimeRangeLoading(true);
    setTimeRangePage(1);

    try {
      const params = new URLSearchParams({
        minTime: timeInSeconds.toString(),
        maxTime: (timeInSeconds + 1).toString(),
        page: '1',
        limit: '100',
      });

      if (selectedKartType) {
        params.append('kartType', selectedKartType);
      }

      const response = await fetch(`/api/tracks/${slug}/time-range?${params}`);
      const data = await response.json();

      if (data.success) {
        setTimeRangeDrivers(data.records);
        setTimeRangeHasMore(data.hasMore || false);
        setTimeRangeTotalCount(data.totalCount || data.count);
      }
    } catch (error) {
      console.error('Error fetching time range drivers:', error);
    } finally {
      setTimeRangeLoading(false);
    }
  }, [slug, selectedKartType]);

  const handleLoadMoreTimeRange = useCallback(async () => {
    setTimeRangeLoadingMore(true);
    const nextPage = timeRangePage + 1;

    try {
      const params = new URLSearchParams({
        minTime: timeRangeInfo.minTime.toString(),
        maxTime: timeRangeInfo.maxTime.toString(),
        page: nextPage.toString(),
        limit: '100',
      });

      if (selectedKartType) {
        params.append('kartType', selectedKartType);
      }

      const response = await fetch(`/api/tracks/${slug}/time-range?${params}`);
      const data = await response.json();

      if (data.success) {
        setTimeRangeDrivers(prev => [...prev, ...data.records]);
        setTimeRangeHasMore(data.hasMore || false);
        setTimeRangePage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more drivers:', error);
    } finally {
      setTimeRangeLoadingMore(false);
    }
  }, [slug, selectedKartType, timeRangePage, timeRangeInfo]);

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
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-surfaceHover border-t-accent" />
          <p className="text-sm text-zinc-500">Loading track data...</p>
        </div>
      </div>
    );
  }

  // Determine which stats to show
  const displayStats = (selectedKartType && track.statsByKartType?.[selectedKartType]) 
    ? track.statsByKartType[selectedKartType] 
    : track.stats;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="text-zinc-500 transition-colors duration-150 hover:text-zinc-100"
              aria-label="Back to tracks"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={`/tracks/${slug}.png`}
                alt={`${track.name} logo`}
                fill
                className="object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold tracking-tight md:text-xl">
                {track.name}
              </h1>
              <p className="truncate text-xs text-zinc-500">{track.location}</p>
            </div>
            <Link
              href={`/tracks/${slug}/about`}
              className="shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors duration-150 hover:bg-surfaceHover/60 hover:text-zinc-100"
            >
              About Track
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 2F2F Layout Disclaimer */}
        {(slug === '2f2f-formula-karting' || slug === '2f2f-formula-karting-islamabad') && (
          <div className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div>
                <h3 className="text-sm font-medium text-amber-300">Track Layout Notice</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  2F2F sometimes varies their track layouts. Some lap times around 50 seconds may reflect a different track configuration.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Drivers"
            value={displayStats.totalDrivers.toLocaleString()}
            icon={Users}
          />
          <StatCard
            title="Top 1% Time"
            value={formatTime(displayStats.top1Percent)}
            icon={TrendingUp}
          />
          <StatCard
            title="Median Time"
            value={formatTime(displayStats.median)}
            icon={Clock}
          />
          <StatCard
            title="Mean Time"
            value={displayStats.mean ? formatTime(displayStats.mean) : 'N/A'}
            icon={Clock}
          />
        </div>

        {/* Search and Filters */}
        <div className="mb-8 rounded-xl border bg-surface p-4 md:p-5">
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
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filter by tier</span>
                </div>
                {['S+', 'S', 'A', 'B', 'C', 'D'].map((tier) => (
                  <button
                    type="button"
                    key={tier}
                    onClick={() => handleTierFilter(tier)}
                    className={`h-8 rounded-full border px-3 text-xs font-medium transition-colors duration-150 ${
                      selectedTier === tier
                        ? 'border-transparent bg-accent-strong text-white'
                        : 'text-zinc-400 hover:border-zinc-600 hover:text-zinc-100'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
                {selectedTier && (
                  <button
                    type="button"
                    onClick={() => setSelectedTier('')}
                    className="px-2 text-xs text-zinc-500 transition-colors duration-150 hover:text-zinc-100"
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
          <h2 className="mb-4 text-xl font-semibold tracking-tight md:text-2xl">
            Leaderboard
            {searchQuery && (
              <span className="ml-2 text-sm font-normal text-zinc-500">
                (searching for "{searchQuery}")
              </span>
            )}
            {selectedTier && (
              <span className="ml-2 text-sm font-normal text-zinc-500">
                (Tier {selectedTier})
              </span>
            )}
            {selectedKartType && (
              <span className="ml-2 text-sm font-normal text-zinc-500">
                ({selectedKartType})
              </span>
            )}
          </h2>

          {/* Podium - Only show on first page without filters */}
          {!loading && records.length >= 3 && page === 1 && !searchQuery && !selectedTier && (
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              {records.slice(0, 3).map((record, i) => (
                <div
                  key={record._id}
                  className={`rounded-xl border bg-surface p-5 ${i === 0 ? 'border-accent/40' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {i === 0 && <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />}
                      <span className={`font-mono text-xs tabular-nums ${i === 0 ? 'text-accent-soft' : 'text-zinc-500'}`}>
                        P{i + 1}
                      </span>
                    </span>
                    <TierBadge tier={record.tier} size="sm" />
                  </div>
                  <p className="mt-3 truncate text-base font-semibold text-zinc-100">
                    {record.driverName}
                  </p>
                  <p className={`mt-1 font-mono text-2xl tabular-nums ${i === 0 ? 'text-accent-soft' : 'text-zinc-100'}`}>
                    {record.bestTimeStr}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {i === 0 ? 'Track record' : formatGap(record.gapToP1)}
                  </p>
                  <a
                    href={record.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-xs text-zinc-500 transition-colors duration-150 hover:text-accent-soft"
                  >
                    View Profile
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Rest of Leaderboard Table */}
          <div className="overflow-hidden rounded-xl border bg-surface">
            <LeaderboardTable
              records={page === 1 && !searchQuery && !selectedTier ? records.slice(3) : records}
              loading={loading}
              showKartType={track.kartTypes && track.kartTypes.length > 1}
              kartTypeLabel={track.kartTypes?.some(t => t.toLowerCase().includes('track')) ? 'Track Layout' : 'Kart Type'}
            />

            {/* Pagination */}
            <div className="flex flex-col gap-4 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Rows per page selector */}
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs text-zinc-500">Rows per page</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                  className="h-8 rounded-lg border bg-surface px-2 text-sm text-zinc-300 focus:border-accent/60 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Page navigation */}
              <div className="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="hidden h-8 items-center rounded-lg border px-3 text-sm text-zinc-300 transition-colors duration-150 hover:bg-surfaceHover/60 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 sm:inline-flex"
                >
                  First
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex h-8 items-center rounded-lg border px-3 text-sm text-zinc-300 transition-colors duration-150 hover:bg-surfaceHover/60 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="whitespace-nowrap px-2 text-xs tabular-nums text-zinc-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex h-8 items-center rounded-lg border px-3 text-sm text-zinc-300 transition-colors duration-150 hover:bg-surfaceHover/60 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="hidden h-8 items-center rounded-lg border px-3 text-sm text-zinc-300 transition-colors duration-150 hover:bg-surfaceHover/60 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 sm:inline-flex"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Stats Sections */}
        {(selectedKartType || (!track?.kartTypes || track.kartTypes.length === 0)) && (
          <>
            {/* Hall of Fame */}
            {hallOfFameData.length > 0 && !advancedStatsLoading && 
             !['2f2f-formula-karting', '2f2f-formula-karting-islamabad', 'omni-karting-circuit'].includes(slug) && (
              <div className="mb-8 rounded-xl border bg-surface p-5 md:p-6">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-lg font-semibold tracking-tight">Hall of Fame</h2>
                </div>
                <p className="mb-5 mt-1 text-sm text-zinc-500">
                  {selectedKartType ? `Track record history for ${selectedKartType}` : 'Track record history'}
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
              <div className="mb-8 rounded-xl border bg-surface p-5 md:p-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-lg font-semibold tracking-tight">The Difficulty Wall</h2>
                </div>
                <p className="mb-5 mt-1 text-sm text-zinc-500">
                  Distribution of lap times for {selectedKartType}
                </p>
                <DifficultyWallChart
                  data={difficultyWallData}
                  warZoneStart={warZoneData?.timeStart}
                  warZoneEnd={warZoneData?.timeEnd}
                  onTimeClick={handleDifficultyWallClick}
                />
              </div>
            )}

            {/* Loading State for Advanced Stats */}
            {advancedStatsLoading && (
              <div className="mb-8 rounded-xl border bg-surface p-10 text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-surfaceHover border-t-accent" />
                <p className="text-sm text-zinc-500">Loading track statistics...</p>
              </div>
            )}
          </>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setTimeRangeModalOpen(false)}
          >
            <div
              className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border bg-surface"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="border-b p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                      Drivers in Time Range
                      {!timeRangeLoading && timeRangeTotalCount > 0 && (
                        <span className="ml-2 text-sm font-normal text-zinc-500">
                          ({timeRangeDrivers.length} of {timeRangeTotalCount})
                        </span>
                      )}
                    </h2>
                    <p className="mt-1 font-mono text-sm tabular-nums text-zinc-400">
                      {timeRangeInfo.bin}
                    </p>
                  </div>
                  <button
                    onClick={() => setTimeRangeModalOpen(false)}
                    className="rounded-lg p-1.5 text-zinc-500 transition-colors duration-150 hover:bg-surfaceHover/60 hover:text-zinc-100"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-5">
                {timeRangeLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-surfaceHover border-t-accent" />
                  </div>
                ) : timeRangeDrivers.length > 0 ? (
                  <>
                    <div className="divide-y divide-surfaceHover/60">
                      {timeRangeDrivers.map((record) => (
                        <div
                          key={`${record.driverSlug}-${record.date}`}
                          className="flex items-center gap-4 py-3"
                        >
                          <span className="w-10 shrink-0 text-xs tabular-nums text-zinc-500">
                            {record.position}
                          </span>
                          <a
                            href={record.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-100 transition-colors duration-150 hover:text-accent-soft"
                          >
                            {record.driverName}
                          </a>
                          <span className="font-mono text-sm tabular-nums text-zinc-100">
                            {record.bestTimeStr}
                          </span>
                          <TierBadge tier={record.tier} size="sm" />
                        </div>
                      ))}
                    </div>
                    {timeRangeHasMore && (
                      <div className="mt-5 text-center">
                        <button
                          onClick={handleLoadMoreTimeRange}
                          disabled={timeRangeLoadingMore}
                          className="rounded-lg bg-accent-strong px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {timeRangeLoadingMore ? (
                            <span className="flex items-center gap-2">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                              Loading...
                            </span>
                          ) : (
                            `Load More (${timeRangeTotalCount - timeRangeDrivers.length} remaining)`
                          )}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-12 text-center text-sm text-zinc-500">
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
