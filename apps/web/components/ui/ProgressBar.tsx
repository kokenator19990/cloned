'use client';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, className, showLabel = true }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-cloned-muted">Progreso</span>
          <span className="text-xs text-cloned-accent font-medium">{clamped}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-cloned-soft rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cloned-accent to-cloned-accent-light rounded-full transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
