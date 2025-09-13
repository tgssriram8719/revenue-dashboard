import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  delay?: number;
}

export const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue, 
  className,
  delay = 0 
}: MetricCardProps) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <div 
      className={cn(
        "metric-card animate-slide-up neon-glow",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-primary/10 neon-glow">
          {icon}
        </div>
        {trend && trendValue && (
          <div className={cn("flex items-center text-sm font-medium", getTrendColor())}>
            <span className="mr-1">{getTrendIcon()}</span>
            {trendValue}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-bold neon-text">{value}</h3>
        <p className="text-sm text-muted-foreground uppercase tracking-wide">{title}</p>
        {subtitle && (
          <p className="text-xs text-accent">{subtitle}</p>
        )}
      </div>
    </div>
  );
};