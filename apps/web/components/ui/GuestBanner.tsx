'use client';
import { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface GuestBannerProps {
  expiresAt: Date;
}

export function GuestBanner({ expiresAt }: GuestBannerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Sesión expirada');
        setIsExpiringSoon(true);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      setIsExpiringSoon(minutes < 5);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className={`border-b ${isExpiringSoon ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {isExpiringSoon ? (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          ) : (
            <Clock className="w-4 h-4 text-amber-600" />
          )}
          <span className={isExpiringSoon ? 'text-red-800 font-medium' : 'text-amber-800'}>
            Sesión temporal: <span className="font-mono font-semibold">{timeLeft}</span> restantes
          </span>
        </div>
        <Link
          href="/auth/register"
          className={`px-4 py-1.5 ${isExpiringSoon ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'} text-white rounded-full text-xs font-medium transition-colors`}
        >
          Crear cuenta para guardar
        </Link>
      </div>
    </div>
  );
}
