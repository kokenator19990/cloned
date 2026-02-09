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
            ? 'bg-deadbot-accent text-white rounded-br-md'
            : 'bg-deadbot-card border border-deadbot-border text-deadbot-text rounded-bl-md',
          role === 'SYSTEM' && 'bg-yellow-900/20 border-yellow-700/30 text-yellow-200 text-sm italic max-w-full',
        )}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
        {timestamp && (
          <p className={cn('text-xs mt-1', isUser ? 'text-purple-200' : 'text-deadbot-muted')}>
            {new Date(timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
