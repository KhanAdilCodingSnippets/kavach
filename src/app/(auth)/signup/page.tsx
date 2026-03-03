'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { sanitizeInput, sanitizeEmail } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // New state for password
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = sanitizeEmail(email);
    const cleanName = sanitizeInput(fullName);

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password, // Using the actual password entered
      options: {
        data: { full_name: cleanName },
      },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Account created! Redirecting...');
      setTimeout(() => router.push('/dashboard'), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-slate-900 text-white">
      <div className="p-8 bg-slate-800 rounded-lg shadow-xl w-96 border border-slate-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-sky-400">Join Kavach</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white focus:border-sky-500 outline-none"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white focus:border-sky-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Create Password"
            className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white focus:border-sky-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-sky-600 hover:bg-sky-500 rounded font-bold transition-all disabled:opacity-50"
          >
            {loading ? 'Securing...' : 'Sign Up'}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-sky-400 font-medium">{message}</p>}
      </div>
    </div>
  );
}