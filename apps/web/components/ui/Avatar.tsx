'use client';
import { cn } from '@/lib/utils';

const SKIN_COLORS: Record<string, string> = {
  default: '#6B7280',
  hoodie: '#1F2937',
  suit: '#111827',
  casual: '#059669',
  dark: '#18181B',
  neon: '#7C3AED',
};

const MOOD_EMOJIS: Record<string, string> = {
  neutral: '😐',
  happy: '😊',
  serious: '😤',
  angry: '😠',
  sad: '😢',
  excited: '🤩',
};

interface AvatarProps {
  name: string;
  skin?: string;
  mood?: string;
  accessories?: string[];
  size?: 'sm' | 'md' | 'lg' | 'xl';
  speaking?: boolean;
  className?: string;
}

const sizes = { sm: 'w-12 h-12', md: 'w-20 h-20', lg: 'w-32 h-32', xl: 'w-48 h-48' };
const textSizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-5xl', xl: 'text-7xl' };

export function Avatar({ name, skin = 'default', mood = 'neutral', accessories = [], size = 'md', speaking, className }: AvatarProps) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const bgColor = SKIN_COLORS[skin] || SKIN_COLORS.default;
  const emoji = MOOD_EMOJIS[mood] || '';

  return (
    <div className={cn('relative flex items-center justify-center rounded-full', sizes[size], className)}
      style={{ backgroundColor: bgColor }}
    >
      <span className={cn('font-bold text-white', textSizes[size])}>{initials}</span>

      {/* Mood indicator */}
      {mood !== 'neutral' && (
        <span className="absolute -bottom-1 -right-1 text-lg">{emoji}</span>
      )}

      {/* Accessories overlay */}
      {accessories.includes('cap') && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm">🧢</div>
      )}
      {accessories.includes('glasses') && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs opacity-60">👓</div>
      )}
      {accessories.includes('headphones') && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-sm">🎧</div>
      )}

      {/* Speaking animation */}
      {speaking && (
        <div className="absolute inset-0 rounded-full border-2 border-deadbot-accent animate-ping opacity-30" />
      )}
    </div>
  );
}
