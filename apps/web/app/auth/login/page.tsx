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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Sign In
          </h1>
          <p className="text-deadbot-muted mt-2">Welcome back to Deadbot</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-deadbot-card border border-deadbot-border rounded-xl p-8 space-y-5">
          {error && (
            <div className="bg-red-900/30 border border-red-700/40 text-red-300 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>

          <p className="text-center text-sm text-deadbot-muted">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-deadbot-accent-light hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
