'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Loader2 } from 'lucide-react';

export default function GuestPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createGuestSession = async () => {
      try {
        const response = await fetch('http://localhost:3001/auth/guest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al crear sesión de invitado');
        }

        const data = await response.json();
        
        // Guardar token en localStorage
        localStorage.setItem('token', data.accessToken);
        
        // Redirigir al dashboard
        router.push('/dashboard');
      } catch (err) {
        console.error('Error creating guest session:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    };

    createGuestSession();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-cloned-bg flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-cloned-text mb-2">
            Error
          </h2>
          <p className="text-cloned-muted mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-cloned-accent hover:bg-cloned-accent-dark text-white rounded-full transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cloned-bg flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-cloned-text mb-2">
          Creando sesión temporal...
        </h2>
        <p className="text-cloned-muted mb-6">
          Estás a punto de explorar Cloned como invitado. Tu sesión durará 20 minutos.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-cloned-muted">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Configurando perfil temporal</span>
        </div>
      </div>
    </div>
  );
}
