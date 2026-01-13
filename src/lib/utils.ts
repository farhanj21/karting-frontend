import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format seconds to lap time string (MM:SS.ms)
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${minutes.toString().padStart(2, '0')}:${secs.padStart(6, '0')}`;
}

/**
 * Parse lap time string to seconds
 */
export function parseTimeToSeconds(timeStr: string): number {
  try {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]);
      const seconds = parseFloat(parts[1]);
      return minutes * 60 + seconds;
    }
    return parseFloat(timeStr);
  } catch {
    return 0;
  }
}

/**
 * Get tier color class
 */
export function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    'S+': 'tierSPlus',
    'S': 'tierS',
    'A': 'tierA',
    'B': 'tierB',
    'C': 'tierC',
    'D': 'tierD',
  };
  return colors[tier] || 'tierC';
}

/**
 * Get tier class name for badge
 */
export function getTierClass(tier: string): string {
  const classes: Record<string, string> = {
    'S+': 'tier-s-plus',
    'S': 'tier-s',
    'A': 'tier-a',
    'B': 'tier-b',
    'C': 'tier-c',
    'D': 'tier-d',
  };
  return classes[tier] || 'tier-c';
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format percentile (e.g., 1.5 -> "Top 1.5%")
 */
export function formatPercentile(percentile: number): string {
  if (percentile < 1) {
    return `Top ${percentile.toFixed(1)}%`;
  } else if (percentile < 10) {
    return `Top ${percentile.toFixed(1)}%`;
  } else {
    return `Top ${Math.round(percentile)}%`;
  }
}

/**
 * Format gap time (e.g., 2.341 -> "+2.341s")
 */
export function formatGap(seconds: number): string {
  if (seconds === 0) {
    return '-';
  }
  return `+${seconds.toFixed(3)}s`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Create URL-safe slug
 */
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
