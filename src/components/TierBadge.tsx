import { getTierClass } from '@/lib/utils';

interface TierBadgeProps {
  tier: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function TierBadge({ tier, size = 'md' }: TierBadgeProps) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span className={`tier-badge ${getTierClass(tier)} ${sizeClasses[size]}`}>
      {tier}
    </span>
  );
}
