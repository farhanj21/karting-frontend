'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { debounce } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Search drivers...' }: SearchBarProps) {
  const [query, setQuery] = useState('');

  // Debounced search
  useEffect(() => {
    const debouncedSearch = debounce((q: string) => {
      onSearch(q);
    }, 300);

    debouncedSearch(query);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-zinc-500" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="block h-10 w-full rounded-lg border bg-background/50 pl-9 pr-9 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors duration-150 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 transition-colors duration-150 hover:text-zinc-100"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
