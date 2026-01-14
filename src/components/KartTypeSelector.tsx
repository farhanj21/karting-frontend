'use client';

import { Car } from 'lucide-react';

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
  // Don't show selector if no kart types available or only one type
  if (!kartTypes || kartTypes.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="text-sm text-gray-400 flex items-center gap-2">
        <Car className="w-4 h-4" />
        <span>Kart Type:</span>
      </div>
      <button
        type="button"
        onClick={() => onKartTypeChange('')}
        className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
          selectedKartType === ''
            ? 'bg-primary text-white'
            : 'bg-surfaceHover text-gray-400 hover:bg-surface'
        }`}
      >
        All Karts
      </button>
      {kartTypes.map((type) => (
        <button
          type="button"
          key={type}
          onClick={() => onKartTypeChange(type)}
          className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
            selectedKartType === type
              ? 'bg-primary text-white'
              : 'bg-surfaceHover text-gray-400 hover:bg-surface'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
}
