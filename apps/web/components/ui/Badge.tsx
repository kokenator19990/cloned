'use client';
import { cn } from '@/lib/utils';

const statusColors = {
  ENROLLING: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
  ACTIVE: 'bg-green-600/20 text-green-400 border-green-600/30',
  ARCHIVED: 'bg-gray-600/20 text-gray-400 border-gray-600/30',
};

export function Badge({ status }: { status: 'ENROLLING' | 'ACTIVE' | 'ARCHIVED' }) {
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', statusColors[status])}>
      {status}
    </span>
  );
}
