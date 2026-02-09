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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-deadbot-muted mt-2">Start building your cognitive twin</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-deadbot-card border border-deadbot-border rounded-xl p-8 space-y-5">
          {error && (
            <div className="bg-red-900/30 border border-red-700/40 text-red-300 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

          <Button type="submit" loading={loading} className="w-full">
            Create Account
          </Button>

          <p className="text-center text-sm text-deadbot-muted">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-deadbot-accent-light hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
