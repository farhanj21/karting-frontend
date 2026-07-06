'use client';

import { Settings2, Car, ChevronDown } from 'lucide-react';

interface KartTypeSelectorProps {
  kartTypes: string[];
  selectedKartType: string;
  onKartTypeChange: (kartType: string) => void;
}

export default function KartTypeSelector({
  kartTypes,
  selectedKartType,
  onKartTypeChange,
}: KartTypeSelectorProps) {
  // Don't show selector if no kart types available
  if (!kartTypes || kartTypes.length === 0) {
    return null;
  }

  // Determine if this is a track configuration or actual kart types
  const isTrackConfig = kartTypes.some(t => t.toLowerCase().includes('track'));

  // If it's a track layout (like Apex), use the Dropdown
  if (isTrackConfig) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 whitespace-nowrap text-xs text-zinc-500">
          <Settings2 className="h-3.5 w-3.5" />
          <span>Track layout</span>
        </div>
        <div className="relative min-w-[160px]">
          <select
            value={selectedKartType}
            onChange={(e) => onKartTypeChange(e.target.value)}
            className="h-9 w-full cursor-pointer appearance-none rounded-lg border bg-background/50 px-3 pr-8 text-sm font-medium text-zinc-100 transition-colors duration-150 focus:border-accent/60 focus:outline-none"
          >
            {kartTypes.map((type) => (
              <option key={type} value={type} className="bg-surface text-zinc-100">
                {type}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        </div>
      </div>
    );
  }

  // Otherwise, use the Button Selector (for Kart Types)
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="mr-1 flex items-center gap-1.5 text-xs text-zinc-500">
        <Car className="h-3.5 w-3.5" />
        <span>Kart type</span>
      </div>
      {kartTypes.map((type) => (
        <button
          type="button"
          key={type}
          onClick={() => onKartTypeChange(type)}
          className={`h-8 rounded-full border px-3 text-xs font-medium transition-colors duration-150 ${
            selectedKartType === type
              ? 'border-transparent bg-accent-strong text-white'
              : 'text-zinc-400 hover:border-zinc-600 hover:text-zinc-100'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
}
