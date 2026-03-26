"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bug, ArrowRight, Eye, EyeOff, CheckCircle2, Zap, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      setUser(response.data.user, response.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 8 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
  const strengthLabel = ['', 'Too short', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <div className="min-h-screen flex">

      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex-col justify-between p-12 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 left-1/4 h-64 w-64 rounded-full bg-indigo-500/30" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Bug className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Bugly</span>
        </Link>

        {/* Center content */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Start collecting<br />bug reports today.
            </h2>
            <p className="mt-4 text-blue-100 text-lg leading-relaxed max-w-sm">
              Set up your first project in minutes. Embed the widget, and let your users do the rest.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Zap, text: 'Free to get started — no credit card needed' },
              { icon: Shield, text: 'Screenshot + environment captured automatically' },
              { icon: Users, text: 'Manage multiple projects from one dashboard' },
              { icon: CheckCircle2, text: 'Track every bug from open to resolved' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <item.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm text-blue-100">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="relative space-y-2">
          <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">Get started in 3 steps</p>
          {['Create your account', 'Add your first project', 'Embed the widget'].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">{i + 1}</span>
              <span className="text-sm text-blue-100">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-white dark:bg-gray-950">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-10">
          <Bug className="h-7 w-7 text-blue-600" />
          <span className="text-lg font-bold text-gray-900 dark:text-white">Bugly</span>
        </Link>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
                <div className="h-2 w-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Hardik Kotadiya"
                className="block w-full rounded-lg border-0 py-2.5 px-3.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm transition-shadow"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="block w-full rounded-lg border-0 py-2.5 px-3.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm transition-shadow"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="block w-full rounded-lg border-0 py-2.5 pl-3.5 pr-10 text-gray-900 dark:text-white bg-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm transition-shadow"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength ? strengthColor[passwordStrength] : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${passwordStrength <= 1 ? 'text-red-500' : passwordStrength === 2 ? 'text-amber-500' : passwordStrength === 3 ? 'text-blue-500' : 'text-green-500'}`}>
                    {strengthLabel[passwordStrength]}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm password</label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`block w-full rounded-lg border-0 py-2.5 pl-3.5 pr-10 text-gray-900 dark:text-white bg-white dark:bg-gray-900 ring-1 ring-inset placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm transition-shadow ${
                    confirm.length > 0
                      ? confirm === password
                        ? 'ring-green-400 dark:ring-green-600'
                        : 'ring-red-400 dark:ring-red-600'
                      : 'ring-gray-300 dark:ring-gray-700'
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {confirm.length > 0 && confirm === password && (
                  <CheckCircle2 className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                <>Create account <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-600">
            By creating an account you agree to our{' '}
            <Link href="/about" className="underline hover:text-gray-600 dark:hover:text-gray-400 transition-colors">terms of service</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
