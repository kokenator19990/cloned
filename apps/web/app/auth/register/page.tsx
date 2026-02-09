'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, displayName);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cloned-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-cloned-text">
            Crear Cuenta
          </h1>
          <p className="text-cloned-muted mt-2">Empieza a preservar la esencia de quien amas</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-cloned-border rounded-2xl p-8 space-y-5 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">
              {error}
            </div>
          )}

          <Input label="Nombre" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required placeholder="Tu nombre" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

          <Button type="submit" loading={loading} className="w-full">
            Crear Cuenta
          </Button>

          <p className="text-center text-sm text-cloned-muted">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-cloned-accent hover:underline">
              Iniciar Sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
