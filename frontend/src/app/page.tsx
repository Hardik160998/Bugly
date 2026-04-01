"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bug, Camera, MessageSquare, Zap, Shield, Globe, ArrowRight, CheckCircle, Star, Users, BarChart3, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function HomePage() {
  const { user, rehydrate } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    rehydrate();
    setMounted(true);
  }, [rehydrate]);

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Bug className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-bold tracking-tight text-gray-900">Bugly</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-3">
            {!mounted ? (
              <div className="h-9 w-32 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex flex-col items-end">
                    <span className="text-sm font-bold text-gray-900">{user.name}</span>
                    <span className="text-[10px] text-gray-500 font-medium">{user.email}</span>
                </div>
                <Link href="/dashboard" className="flex items-center gap-2 rounded-full bg-gray-50 p-1 pr-4 hover:bg-white transition-all ring-1 ring-gray-200 hover:ring-blue-600 group">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
                        <UserIcon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Dashboard</span>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Sign in</Link>
                <Link href="/login" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(59,130,246,0.08),transparent)]" />
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 mb-8">
            <Zap className="h-3.5 w-3.5" />
            Visual Bug Reporting Made Simple
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]">
            Capture bugs<br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">visually, fix faster</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 leading-relaxed">
            Let your users click anywhere on your website to report issues with annotated screenshots,
            browser metadata, and console logs — all in one place.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition-all hover:shadow-xl hover:shadow-blue-600/30">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how-it-works" className="flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50 transition-colors">
              See How It Works
            </a>
          </div>
          <p className="mt-4 text-xs text-gray-400">No credit card required · 14-day free trial</p>

          {/* Hero visual — mock dashboard */}
          <div className="mt-16 mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-gray-50 shadow-2xl shadow-gray-200/50 overflow-hidden">
            <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="rounded-md bg-white px-20 py-1 text-xs text-gray-400 ring-1 ring-gray-200">app.bugly.dev/dashboard</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-0 h-80">
              <div className="col-span-1 border-r border-gray-200 bg-white p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900"><Bug className="h-4 w-4 text-blue-600" /> Bugly</div>
                <div className="mt-4 space-y-1.5">
                  <div className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">Dashboard</div>
                  <div className="rounded-md px-3 py-1.5 text-xs text-gray-500">Projects</div>
                  <div className="rounded-md px-3 py-1.5 text-xs text-gray-500">Bugs &amp; Feedback</div>
                  <div className="rounded-md px-3 py-1.5 text-xs text-gray-500">Settings</div>
                </div>
              </div>
              <div className="col-span-3 p-6 space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Total Bugs', val: '124', color: 'bg-blue-500' },
                    { label: 'Open', val: '45', color: 'bg-amber-500' },
                    { label: 'Resolved', val: '79', color: 'bg-green-500' },
                    { label: 'Team', val: '8', color: 'bg-purple-500' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-100">
                      <div className={`h-2 w-8 rounded-full ${s.color} mb-2`} />
                      <div className="text-lg font-bold text-gray-900">{s.val}</div>
                      <div className="text-[10px] text-gray-400">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100 flex-1">
                  <div className="text-xs font-medium text-gray-500 mb-3">Recent Reports</div>
                  <div className="space-y-2">
                    {['Button not clickable on /pricing', 'Layout broken on mobile', 'Form validation missing'].map((t, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <span className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-red-400' : i === 1 ? 'bg-amber-400' : 'bg-blue-400'}`} />
                        <span className="text-gray-700 flex-1">{t}</span>
                        <span className="text-gray-400">2h ago</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Logos / Trust Bar ─── */}
      <section className="border-y border-gray-100 bg-gray-50/50 py-10">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500 mb-6 font-bold">Trusted by teams building great products</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-gray-400">
            {['Acme Corp', 'TechFlow', 'CloudBase', 'DevStack', 'StartupOS'].map(name => (
              <span key={name} className="text-lg font-bold tracking-tight opacity-70 hover:opacity-100 transition-opacity cursor-default">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Everything you need for<br />visual bug tracking</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">From screenshot capture to team collaboration — Bugly covers the full feedback loop.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Camera, title: 'Screenshot Capture', desc: 'Automatically capture the page with one click. Users can annotate, draw, and highlight problem areas.', color: 'text-blue-600 bg-blue-50' },
              { icon: Globe, title: 'Browser Metadata', desc: 'Collect URL, browser version, OS, screen size, and console errors automatically with every report.', color: 'text-green-600 bg-green-50' },
              { icon: MessageSquare, title: 'Team Comments', desc: 'Collaborate directly on bug reports. Assign team members, change status, and resolve issues together.', color: 'text-purple-600 bg-purple-50' },
              { icon: Zap, title: 'JS Widget & Extension', desc: 'Embed a lightweight widget on any site, or use the Chrome extension to capture bugs anywhere.', color: 'text-amber-600 bg-amber-50' },
              { icon: BarChart3, title: 'Dashboard Analytics', desc: 'Track open issues, resolution rates, and team performance with beautiful charts and statistics.', color: 'text-red-600 bg-red-50' },
              { icon: Shield, title: 'Secure & Private', desc: 'JWT authentication, encrypted passwords, rate limiting, and CORS protection built in from day one.', color: 'text-indigo-600 bg-indigo-50' },
            ].map((f) => (
              <div key={f.title} className="group rounded-2xl border border-gray-100 bg-white p-8 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 hover:-translate-y-0.5">
                <div className={`inline-flex rounded-xl p-3 ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">How Bugly works</h2>
            <p className="mt-4 text-lg text-gray-500">Get started in under 2 minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Add the widget', desc: 'Drop a single script tag into your website or install our Chrome extension.' },
              { step: '02', title: 'User clicks "Report Bug"', desc: 'A floating button appears. Users click it to open the feedback form.' },
              { step: '03', title: 'Screenshot + Annotate', desc: 'The page is captured automatically. Users can highlight and comment on the issue.' },
              { step: '04', title: 'Team resolves', desc: 'Bug arrives in your dashboard with full context. Assign, discuss, and close.' },
            ].map((s) => (
              <div key={s.step} className="text-center md:text-left">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white text-sm font-bold mb-4">{s.step}</div>
                <h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing Section ─── */}
      <section id="pricing" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-gray-500">Start free. Upgrade when you need more power.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$19',
                desc: 'Perfect for solo developers and small projects.',
                features: ['3 projects', '500 bug reports / mo', 'Screenshot capture', 'Email notifications'],
                cta: 'Start Free Trial',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '$49',
                desc: 'For growing teams who need full collaboration.',
                features: ['15 projects', 'Unlimited bug reports', 'Annotations & drawing', 'Team comments', 'Slack integration'],
                cta: 'Start Free Trial',
                highlight: true,
              },
              {
                name: 'Agency',
                price: '$99',
                desc: 'For agencies managing many client projects.',
                features: ['Unlimited projects', 'Unlimited bug reports', 'All integrations', 'Custom branding', 'API access'],
                cta: 'Contact Sales',
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 flex flex-col ${
                  plan.highlight
                    ? 'ring-2 ring-blue-600 bg-white shadow-xl shadow-blue-600/10 relative'
                    : 'ring-1 ring-gray-200 bg-white'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                      <Star className="h-3 w-3" /> Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">{plan.desc}</p>
                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`mt-8 block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-500'
                      : 'bg-white text-gray-900 ring-1 ring-inset ring-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="bg-blue-600 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Ready to squash bugs faster?</h2>
          <p className="mt-4 text-lg text-blue-100">Join hundreds of teams using Bugly to ship better products.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-600 shadow-lg hover:bg-blue-50 transition-colors">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-blue-200">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> 14-day trial</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-gray-900">Bugly</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <a href="#features" className="hover:text-gray-700 transition-colors">Features</a>
              <a href="#pricing" className="hover:text-gray-700 transition-colors">Pricing</a>
              <Link href="/about" className="hover:text-gray-700 transition-colors">About</Link>
              <a href="#" className="hover:text-gray-700 transition-colors">Docs</a>
            </div>
            <p className="text-sm text-gray-400">&copy; 2026 Bugly. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
