'use client';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-deadbot-muted">{label}</label>}
      <input
        className={cn(
          'bg-deadbot-card border border-deadbot-border rounded-lg px-4 py-2.5 text-deadbot-text outline-none focus:border-deadbot-accent transition-colors',
          error && 'border-red-500',
          className,
        )}
        {...props}
      />
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  );
}
