import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-zinc-600',
}: StatCardProps) {
  return (
    <div className="rounded-xl border bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{title}</p>
        {Icon && <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} aria-hidden />}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-zinc-50">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}
    </div>
  );
}
