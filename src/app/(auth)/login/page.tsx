'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { sanitizeEmail } from '@/lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = sanitizeEmail(email);

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-slate-900 text-white">
      <div className="p-8 bg-slate-800 rounded-lg shadow-xl w-96 border border-slate-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-sky-400">Login to Kavach</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white focus:border-sky-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white focus:border-sky-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-sky-600 hover:bg-sky-500 rounded font-bold transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-red-400 font-medium">{message}</p>}
        <p className="mt-6 text-center text-xs text-slate-400">
          First time? <a href="/signup" className="text-sky-400 hover:underline">Create an account</a>
        </p>
      </div>
    </div>
  );
}