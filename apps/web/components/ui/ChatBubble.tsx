'use client';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  role: 'USER' | 'PERSONA' | 'SYSTEM';
  content: string;
  timestamp?: string;
}

export function ChatBubble({ role, content, timestamp }: ChatBubbleProps) {
  const isUser = role === 'USER';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-cloned-accent text-white rounded-br-md shadow-sm'
            : 'bg-white border border-cloned-border text-cloned-text rounded-bl-md shadow-sm',
          role === 'SYSTEM' && 'bg-amber-50 border-amber-200 text-amber-800 text-sm italic max-w-full',
        )}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
        {timestamp && (
            <p className={cn('text-xs mt-1', isUser ? 'text-white/70' : 'text-cloned-muted')}>
            {new Date(timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
