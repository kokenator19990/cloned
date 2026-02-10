'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Trash2 } from 'lucide-react';
import { ClonedLogo } from '@/components/ui/ClonedLogo';
import { GuestBanner } from '@/components/ui/GuestBanner';

interface UserData {
  id: string;
  email: string;
  name: string;
  isGuest?: boolean;
  expiresAt?: string;
}

// Decodificar JWT (simple, sin validación)
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/');
      return;
    }

    // Decodificar token para obtener datos del usuario
    const payload = decodeJWT(token);
    if (!payload) {
      localStorage.removeItem('token');
      router.push('/');
      return;
    }

    // Verificar si el token expiró
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      router.push('/');
      return;
    }

    setUser({
      id: payload.sub || payload.userId,
      email: payload.email,
      name: payload.name || payload.displayName || 'Usuario',
      isGuest: payload.isGuest || false,
      expiresAt: payload.expiresAt,
    });

    setLoading(false);
  }, [router]);

  const handleDeleteAccount = async () => {
    if (!confirm('¿Eliminar tu cuenta? Se borrarán TODOS tus perfiles, memorias y conversaciones. Esta acción es irreversible.')) return;
    if (!confirm('¿Estás SEGURO? No hay vuelta atrás.')) return;
    
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/auth/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem('token');
        router.push('/');
      } else {
        alert('Error al eliminar la cuenta');
      }
    } catch {
      alert('Error al eliminar la cuenta');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-cloned-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-cloned-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-cloned-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cloned-bg">
      <header className="border-b border-cloned-border bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <ClonedLogo size={32} className="rounded-lg" />
            <span className="font-display font-semibold text-cloned-text">Cloned</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-cloned-muted">
              <User className="w-4 h-4" />
              {user.name}
              {user.isGuest && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Invitado</span>}
            </div>
            {!user.isGuest && (
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="text-cloned-muted hover:text-cloned-danger transition-colors"
                title="Eliminar cuenta"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-cloned-muted hover:text-cloned-danger transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      
      {user.isGuest && user.expiresAt && (
        <GuestBanner expiresAt={new Date(user.expiresAt)} />
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
