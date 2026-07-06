interface KartTypeSelectorProps {
  kartTypes: string[];
  selectedKartType: string | null;
  onKartTypeChange: (kartType: string | null) => void;
}

export default function KartTypeSelector({
  kartTypes,
  selectedKartType,
  onKartTypeChange,
}: KartTypeSelectorProps) {
  if (kartTypes.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onKartTypeChange(null)}
        className={`h-8 rounded-full border px-3 text-xs font-medium transition-colors duration-150 ${
          selectedKartType === null
            ? 'border-transparent bg-accent-strong text-white'
            : 'text-zinc-400 hover:border-zinc-600 hover:text-zinc-100'
        }`}
      >
        All Karts
      </button>

      {kartTypes.map((kartType) => (
        <button
          key={kartType}
          onClick={() => onKartTypeChange(kartType)}
          className={`h-8 rounded-full border px-3 text-xs font-medium transition-colors duration-150 ${
            selectedKartType === kartType
              ? 'border-transparent bg-accent-strong text-white'
              : 'text-zinc-400 hover:border-zinc-600 hover:text-zinc-100'
          }`}
        >
          {kartType}
        </button>
      ))}
    </div>
  );
}
