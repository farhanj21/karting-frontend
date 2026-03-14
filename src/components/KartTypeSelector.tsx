'use client';

import { Settings2, Car } from 'lucide-react';

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

  // If it's a track layout (like Apex), use the new Dropdown
  if (isTrackConfig) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-400 flex items-center gap-2 whitespace-nowrap">
          <Settings2 className="w-4 h-4 text-primary" />
          <span>Track Layout:</span>
        </div>
        <div className="relative group min-w-[160px]">
          <select
            value={selectedKartType}
            onChange={(e) => onKartTypeChange(e.target.value)}
            className="w-full bg-surfaceHover hover:bg-surface text-white text-sm font-semibold rounded-lg px-4 py-2 border border-surfaceHover hover:border-primary/50 focus:border-primary focus:outline-none transition-all cursor-pointer appearance-none"
          >
            {kartTypes.map((type) => (
              <option key={type} value={type} className="bg-surface text-white">
                {type}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, use the original Button Selector (for Kart Types)
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="text-sm text-gray-400 flex items-center gap-2 mr-2">
        <Car className="w-4 h-4" />
        <span>Kart Type:</span>
      </div>
      {kartTypes.map((type) => (
        <button
          type="button"
          key={type}
          onClick={() => onKartTypeChange(type)}
          className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
            selectedKartType === type
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-surfaceHover text-gray-400 hover:bg-surface hover:text-white'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
}
