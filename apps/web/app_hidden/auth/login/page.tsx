'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cloned-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-cloned-text">
            Bienvenido de vuelta
          </h1>
          <p className="text-cloned-muted mt-2">Inicia sesión en Cloned</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-cloned-border rounded-2xl p-8 space-y-5 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">
              {error}
            </div>
          )}

          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <Button type="submit" loading={loading} className="w-full">
            Iniciar Sesión
          </Button>

          <p className="text-center text-sm text-cloned-muted">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" className="text-cloned-accent hover:underline">
              Registrarse
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
