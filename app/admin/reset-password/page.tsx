'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

function ResetForm() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState<'idle' | 'exchanging' | 'ready' | 'submitting' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

  useEffect(() => {
    if (!code) {
      setStatus('error');
      setError('Invalid or missing reset link. Please request a new one.');
      return;
    }
    setStatus('exchanging');
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setStatus('error');
        setError('This reset link has expired or already been used. Please request a new one.');
      } else {
        setStatus('ready');
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError('');
    setStatus('submitting');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus('ready');
      setError(error.message);
    } else {
      await supabase.auth.signOut();
      setStatus('done');
    }
  }

  return (
    <>
      {status === 'exchanging' && (
        <div className="flex items-center justify-center gap-2 py-8 text-gray-500 text-sm">
          <Loader2 size={18} className="animate-spin" /> Verifying link…
        </div>
      )}

      {status === 'error' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 text-sm mb-6">{error}</p>
          <Link href="/admin/forgot-password" className="text-sm text-[#D93025] font-semibold hover:underline">
            Request a new reset link
          </Link>
        </div>
      )}

      {status === 'done' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <CheckCircle size={40} className="text-green-500 mx-auto mb-4" />
          <p className="text-gray-700 text-sm mb-6">Your password has been updated. You can now sign in.</p>
          <Link href="/admin/login" className="inline-block bg-[#D93025] text-white font-bold py-2.5 px-6 rounded-lg text-sm hover:bg-red-700 transition-colors">
            Go to login
          </Link>
        </div>
      )}

      {(status === 'ready' || status === 'submitting') && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">New password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:border-[#D93025] focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-gray-800 text-sm bg-white"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#D93025] focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-gray-800 text-sm bg-white"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-[#D93025] text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'submitting' ? <><Loader2 size={16} className="animate-spin" /> Updating…</> : 'Set new password'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[var(--astar-bg)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-5">
            <Image src="/logo.png" alt="A-Star" width={36} height={36} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
          <p className="text-gray-500 text-sm mt-1">Choose a strong password for your account.</p>
        </div>
        <Suspense fallback={<div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-gray-400" /></div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
