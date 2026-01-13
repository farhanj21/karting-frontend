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
  iconColor = 'text-primary',
}: StatCardProps) {
  return (
    <div className="bg-surface border border-surfaceHover rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm text-gray-400 mb-2">{title}</div>
          <div className="text-3xl font-bold text-white mb-1">{value}</div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
        {Icon && (
          <div className={`w-12 h-12 bg-${iconColor}/10 rounded-lg flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        )}
      </div>
    </div>
  );
}
