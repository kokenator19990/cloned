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
        'bg-deadbot-card border border-deadbot-border rounded-xl p-6',
        onClick && 'cursor-pointer hover:border-deadbot-accent/50 transition-colors',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
