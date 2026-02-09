'use client';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-cloned-muted">{label}</label>}
      <input
        className={cn(
          'bg-white border border-cloned-border rounded-xl px-4 py-2.5 text-cloned-text outline-none focus:border-cloned-accent focus:ring-2 focus:ring-cloned-accent/10 transition-all placeholder:text-cloned-muted/50',
          error && 'border-cloned-danger',
          className,
        )}
        {...props}
      />
      {error && <span className="text-cloned-danger text-xs">{error}</span>}
    </div>
  );
}
