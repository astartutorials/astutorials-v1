'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-gray-800 bg-white text-sm';

function InviteForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) setError('No invite token found. Please use the link from your email.');
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Something went wrong. Please try again.'); return; }
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Account Created!</h2>
        <p className="text-gray-500 text-sm mb-6">Your account is ready. Log in to get started.</p>
        <button
          onClick={() => router.push('/admin/login')}
          className="w-full bg-[#D93025] text-white py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-all"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-[#0B1120] mb-1">Set up your account</h1>
      <p className="text-sm text-gray-500 mb-6">Choose a name and password to get started.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Full Name</label>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            className={inputClass}
            autoFocus
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading || !token}
          className="w-full bg-[#D93025] text-white py-3 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-red-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account…</> : 'Create Account'}
        </button>
      </form>
    </>
  );
}

export default function InvitePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 relative flex-shrink-0">
            <Image src="/logo.png" alt="A-Star" fill className="object-contain" />
          </div>
          <div>
            <p className="font-bold text-[#0B1120] text-sm leading-tight">A-Star Tutorials</p>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest">Admin Portal</p>
          </div>
        </div>
        <Suspense fallback={<div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-gray-400" /></div>}>
          <InviteForm />
        </Suspense>
      </div>
    </div>
  );
}
