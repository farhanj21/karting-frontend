'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, MapPin, Video, Info, Ruler, Flag, Trophy } from 'lucide-react';
import { Track } from '@/types';

// Static track data
const TRACK_DATA: Record<string, any> = {
  'sportzilla-formula-karting': {
    name: 'Sportzilla Formula Karting Club',
    location: 'Bedian Road, Lahore, Pakistan',
    logo: '/tracks/sportzilla-formula-karting.png',
    about: {
      layoutImage: '/tracks/sportzilla-layout.png',
      description: 'Sportzilla Formula Karting is one of Lahore\'s premier karting venues, featuring a challenging outdoor circuit designed for competitive racing. The track offers an exciting mix of high-speed straights and technical corners, providing the perfect environment for both beginners and experienced racers.',
      details: {
        length: '800m',
        width: '8-10 meters',
        corners: 13,
        surface: 'Cemented',
        kartType: 'Sprint, Championship & Pro Karts',
      },
      videos: [
        'https://www.youtube.com/embed/0l0YKYczZCc',
        'https://www.youtube.com/embed/MczLVx0ZN7A',
      ],
      mapLocation: {
              lat: 31.4265328,
              lng: 74.4826657,
              embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.8!2d74.4800854!3d31.4265328!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391909e81df2bc71%3A0xf87288cf5260450b!2sSportzilla%20Formula%20Karting%20Club%20%26%20Sports%20Arena!5e0!3m2!1sen!2s!4v1700000000000",
            },
    },
  },
  'apex-autodrome': {
    name: 'Apex Autodrome',
    location: 'Lahore, Pakistan',
    logo: '/tracks/apex-autodrome.png',
    about: {
      layoutImage: '/tracks/apex-layout.png',
      description: 'Pakistan\'s premier indoor Go-Karting & immersive Gaming Arcade. For the first time, we bring together the adrenaline-pumping thrill of the most advanced and high-speed Italian karts - Apex Autodrome strikes the perfect balance between speed and control.',
      details: {
        length: '500m',
        width: '8-12 meters',
        corners: 8,
        surface: 'Premium Asphalt',
        kartType: 'TB Italy Karts',
      },
      videos: [
        'https://www.youtube.com/embed/ymK6WVsTjIk',
        'https://www.youtube.com/embed/zSNKQYIKRV0',
      ],
      mapLocation: {
              lat: 31.3588467,
              lng: 74.1830835,
              embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3448.7!2d74.1805032!3d31.3588467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3918558572063d93%3A0xb70e74c0053298ef!2sApex%20Autodrome!5e0!3m2!1sen!2s!4v1700000000000",
            },
    },
  },
  '2f2f-formula-karting': {
    name: '2F2F Formula Karting Lahore',
    location: 'Lahore, Pakistan',
    logo: '/tracks/2f2f-formula-karting.png',
    about: {
      layoutImage: '/tracks/2f2f-layout.png',
      description: 'Pakistan\'s Largest International Level Go Karting Track Located in Garrison Sports Arena, Adjacent to Askari X in Lahore. This is the Second Track of 2F2F Formula Karting Pakistan, The First Track is in Lake View Park in Islamabad.',
      details: {
        length: '1.2km',
        width: '8-10 meters',
        corners: 13,
        surface: 'Asphalt Road',
        kartType: 'RX8',
      },
      videos: ['https://www.youtube.com/embed/VWDUqCEZTQo', 'https://www.youtube.com/embed/Gbod4z8LHQ4'],
      mapLocation: {
              lat: 31.540781,
              lng: 74.4153437,
              embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1617.0642646972913!2d74.4153437!3d31.540781!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190f1c1e13b4dd%3A0x3640559c8a822e8!2s2F2F%20Formula%20Karting!5e0!3m2!1sen!2s!4v1700000000000",
            },
    },
  },
  '2f2f-formula-karting-islamabad': {
    name: '2F2F Formula Karting Islamabad',
    location: 'Islamabad, Pakistan',
    logo: '/tracks/2f2f-formula-karting-islamabad.png',
    about: {
      layoutImage: '/tracks/2f2f-layout.png',
      description: 'The first location of 2F2F Formula Karting Pakistan, situated in Lake View Park in Islamabad. This track features SR5 karts and provides an exciting karting experience in Pakistan\'s capital city.',
      details: {
        length: '1.2km',
        width: '8-10 meters',
        corners: 13,
        surface: 'Asphalt Road',
        kartType: 'SR5',
      },
      videos: ['https://www.youtube.com/embed/cymEdVyg_xk', 'https://www.youtube.com/embed/NDzHrceaDic'],
      mapLocation: {
        lat: 33.7199375,
        lng: 73.1323125,
        embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d408.5761182124575!2d73.1323125!3d33.7199375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfc101451c4a5d%3A0x74f31dfefb6112da!2s2F2F%20Formula%20Karting!5e0!3m2!1sen!2s!4v1700000000000",
      },
    },
  },
  'omni-karting-circuit': {
    name: 'Omni Karting Circuit',
    location: 'Karachi, Pakistan',
    logo: '/tracks/omni-karting-circuit.png',
    about: {
      layoutImages: [
        { url: '/tracks/omni-layout-half.jpg', label: 'Half Track Layout' },
        { url: '/tracks/omni-layout-full.jpg', label: 'Full Track Layout' },
      ],
      description: 'Omni Karting Circuit brings competitive karting to Karachi with two kart types: RT8 and RX250. Experience the thrill of racing on Pakistan\'s premier karting circuit in the heart of Karachi.',
      details: {
        length: '1.6km',
        width: '8-12 meters',
        corners: 19,
        surface: 'Asphalt Road',
        kartType: 'RT8, RX250',
      },
      videos: ['https://www.youtube.com/embed/rWsvqCVNF2k', 'https://www.youtube.com/embed/WQJ9Em7Ct9I'],
        mapLocation: {
            lat: 24.790941089600718,
            lng: 67.12270614495634,
            embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.8547892156!2d67.12270614495634!3d24.790941089600718!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQ3JzI3LjQiTiA2N8KwMDcnMjEuNyJF!5e0!3m2!1sen!2s!4v1234567890!5m2!1sen!2s"
        }
    },
  },
};

export default function AboutTrackPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [kartRecords, setKartRecords] = useState<Array<{
    kartType: string;
    worldRecord: string;
    recordHolder: string;
  }>>([]);

  useEffect(() => {
    async function fetchTrack() {
      try {
        const response = await fetch(`/api/tracks/${slug}`);
        const data = await response.json();
        if (data.success) {
          // Merge API data with static about data
          const staticData = TRACK_DATA[slug];
          const mergedTrack = {
            ...data.track,
            about: staticData?.about || null,
          };
          setTrack(mergedTrack);
        }
      } catch (error) {
        console.error('Error fetching track:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrack();
  }, [slug]);

  // Fetch kart records for all tracks
  useEffect(() => {
    async function fetchKartRecords() {
      if (!track || !track.kartTypes || track.kartTypes.length === 0) {
        return;
      }

      try {
        // Filter out LR5 for 2F2F Lahore track
        const kartTypesToShow = slug === '2f2f-formula-karting'
          ? track.kartTypes.filter(kt => kt !== 'LR5')
          : track.kartTypes;

        const records = await Promise.all(
          kartTypesToShow.map(async (kartType: string) => {
            const response = await fetch(
              `/api/tracks/${slug}/leaderboard?kartType=${kartType}&limit=1`
            );
            const data = await response.json();

            if (data.success && data.records.length > 0) {
              const record = data.records[0];
              return {
                kartType,
                worldRecord: record.bestTimeStr,
                recordHolder: record.driverName,
              };
            }

            return {
              kartType,
              worldRecord: 'N/A',
              recordHolder: 'Unknown',
            };
          })
        );

        setKartRecords(records);
      } catch (error) {
        console.error('Error fetching kart records:', error);
      }
    }

    fetchKartRecords();
  }, [track, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-surfaceHover border-t-accent" />
          <p className="text-sm text-zinc-500">Loading track information...</p>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-zinc-500">Track not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-3 sm:gap-4">
            <Link
              href={`/tracks/${slug}`}
              className="text-zinc-500 transition-colors duration-150 hover:text-zinc-100"
              aria-label="Back to leaderboard"
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
                About {track.name}
              </h1>
              <p className="truncate text-xs text-zinc-500">{track.location}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Track Layout Images - Multiple layouts */}
        {track.about?.layoutImages && track.about.layoutImages.length > 0 && (
          <div className="mb-8 rounded-xl border bg-surface p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Flag className="h-4 w-4 text-zinc-500" />
              <h2 className="text-lg font-semibold tracking-tight">Track Layouts</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {track.about.layoutImages.map((layout: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="text-center text-xs font-medium text-zinc-500">{layout.label}</div>
                  <div className="relative w-full aspect-video overflow-hidden rounded-lg border bg-background/40">
                    <Image
                      src={layout.url}
                      alt={`${track.name} - ${layout.label}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Track Layout Image - Single layout (backward compatibility) */}
        {track.about?.layoutImage && !track.about?.layoutImages && (
          <div className="mb-8 rounded-xl border bg-surface p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Flag className="h-4 w-4 text-zinc-500" />
              <h2 className="text-lg font-semibold tracking-tight">Track Layout</h2>
            </div>
            <div className="relative mx-auto aspect-video w-full max-w-3xl overflow-hidden rounded-lg border bg-background/40">
              <Image
                src={track.about.layoutImage}
                alt={`${track.name} track layout`}
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

        {/* Description */}
        {track.about?.description && (
          <div className="mb-8 rounded-xl border bg-surface p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-4 w-4 text-zinc-500" />
              <h2 className="text-lg font-semibold tracking-tight">About the Track</h2>
            </div>
            <p className="text-sm leading-relaxed text-zinc-300">{track.about.description}</p>
          </div>
        )}

        {/* Kart Records - Show for tracks with multiple kart types */}
        {kartRecords.length > 0 && (
          <div className="mb-8 rounded-xl border bg-surface p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-4 w-4 text-zinc-500" />
              <h2 className="text-lg font-semibold tracking-tight">Track Records by Kart Type</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kartRecords.map((record) => (
                <div
                  key={record.kartType}
                  className="rounded-lg border bg-background/40 p-4"
                >
                  <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{record.kartType}</div>
                  <div className="mt-1.5 font-mono text-xl tabular-nums text-accent-soft">
                    {record.worldRecord}
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500">{record.recordHolder}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Track Details */}
        {track.about?.details && (
          <div className="mb-8 rounded-xl border bg-surface p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Ruler className="h-4 w-4 text-zinc-500" />
              <h2 className="text-lg font-semibold tracking-tight">Track Specifications</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {track.about.details.length && track.about.details.length !== 'TBD' && (
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Track Length</div>
                  <div className="mt-1 text-sm font-medium text-zinc-100">{track.about.details.length}</div>
                </div>
              )}
              {track.about.details.width && track.about.details.width !== 'TBD' && (
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Track Width</div>
                  <div className="mt-1 text-sm font-medium text-zinc-100">{track.about.details.width}</div>
                </div>
              )}
              {track.about.details.corners && track.about.details.corners !== 0 && (
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Number of Corners</div>
                  <div className="mt-1 text-sm font-medium text-zinc-100">{track.about.details.corners}</div>
                </div>
              )}
              {track.about.details.surface && track.about.details.surface !== 'TBD' && (
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Surface Type</div>
                  <div className="mt-1 text-sm font-medium text-zinc-100">{track.about.details.surface}</div>
                </div>
              )}
              {track.about.details.kartType && (
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Kart Type</div>
                  <div className="mt-1 text-sm font-medium text-zinc-100">{track.about.details.kartType}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Videos */}
        {track.about?.videos && track.about.videos.length > 0 && (
          <div className="mb-8 rounded-xl border bg-surface p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Video className="h-4 w-4 text-zinc-500" />
              <h2 className="text-lg font-semibold tracking-tight">Track Videos</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {track.about.videos.map((videoUrl, index) => (
                <div key={index} className="relative w-full aspect-video overflow-hidden rounded-lg border bg-background/40">
                  <iframe
                    src={videoUrl}
                    title={`${track.name} video ${index + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map Location */}
        {track.about?.mapLocation && (
          <div className="rounded-xl border bg-surface p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-zinc-500" />
              <h2 className="text-lg font-semibold tracking-tight">Location</h2>
            </div>
            {track.about.mapLocation.embedUrl ? (
              <div className="relative h-96 w-full overflow-hidden rounded-lg border bg-background/40">
                <iframe
                  src={track.about.mapLocation.embedUrl}
                  title={`${track.name} location`}
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            ) : (
              <div className="text-sm text-zinc-400">
                Coordinates: {track.about.mapLocation.lat}, {track.about.mapLocation.lng}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!track.about && (
          <div className="rounded-xl border bg-surface p-12 text-center">
            <Info className="mx-auto mb-4 h-10 w-10 text-zinc-700" />
            <h3 className="text-lg font-semibold tracking-tight">No additional information available</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Track details, layout images, and videos will be added soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
