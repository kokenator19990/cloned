'use client';
import { cn } from '@/lib/utils';

const statusColors = {
  ENROLLING: 'bg-amber-50 text-amber-700 border-amber-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ARCHIVED: 'bg-gray-50 text-gray-500 border-gray-200',
};

export function Badge({ status }: { status: 'ENROLLING' | 'ACTIVE' | 'ARCHIVED' }) {
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', statusColors[status])}>
      {status}
    </span>
  );
}
