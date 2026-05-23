'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await fetch('/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--astar-bg)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-5">
            <Image src="/logo.png" alt="A-Star" width={36} height={36} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
          <p className="text-gray-500 text-sm mt-1">
            {sent ? 'Check your email for a reset link.' : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <CheckCircle size={40} className="text-green-500 mx-auto mb-4" />
            <p className="text-gray-700 text-sm mb-6">
              If <span className="font-semibold">{email}</span> has an account, a password reset link has been sent. Check your inbox (and spam folder).
            </p>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 text-sm text-[#D93025] font-semibold hover:underline"
            >
              <ArrowLeft size={14} /> Back to login
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#D93025] focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-gray-800 text-sm bg-white"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#D93025] text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : 'Send reset link'}
              </button>
            </form>

            <div className="mt-5 text-center">
              <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                <ArrowLeft size={13} /> Back to login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
