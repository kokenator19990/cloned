'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store';
import { LogOut, User, Trash2 } from 'lucide-react';
import api from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, loadFromStorage, logout } = useAuthStore();
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, user, router]);

  const handleDeleteAccount = async () => {
    if (!confirm('¿Eliminar tu cuenta? Se borrarán TODOS tus perfiles, memorias y conversaciones. Esta acción es irreversible.')) return;
    if (!confirm('¿Estás SEGURO? No hay vuelta atrás.')) return;
    setDeleting(true);
    try {
      await api.delete('/auth/account');
      logout();
      router.push('/');
    } catch {
      alert('Error al eliminar la cuenta');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cloned-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cloned-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cloned-bg">
      <header className="border-b border-cloned-border bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <Image src="/ClonedLogo.png" alt="Cloned" width={32} height={32} className="rounded-lg" />
            <span className="font-display font-semibold text-cloned-text">Cloned</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-cloned-muted">
              <User className="w-4 h-4" />
              {user.displayName}
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="text-cloned-muted hover:text-cloned-danger transition-colors"
              title="Eliminar cuenta"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="text-cloned-muted hover:text-cloned-danger transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
