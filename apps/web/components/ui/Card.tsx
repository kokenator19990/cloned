'use client';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-cloned-border rounded-2xl p-6 shadow-sm',
        onClick && 'cursor-pointer hover:border-cloned-accent/40 hover:shadow-md transition-all',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
