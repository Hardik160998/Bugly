"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bug, ArrowRight, Heart, Target, Zap, Users, Shield, Globe, CheckCircle2, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function AboutPage() {
  const { user, rehydrate } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    rehydrate();
    setMounted(true);
  }, [rehydrate]);

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Bug className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-bold tracking-tight text-gray-900">Bugly</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="/#features" className="hover:text-gray-900 transition-colors">Features</Link>
            <Link href="/#pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
            <Link href="/about" className="text-gray-900 font-semibold">About</Link>
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

      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">About Bugly</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
            We&apos;re on a mission to make<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">every bug visible</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Bugly was born from a simple frustration: developers spend too much time chasing vague bug reports instead of building great products. We&apos;re here to change that.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Our Story</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                Built by developers,<br />for developers
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Every developer has been there — a user says &quot;it&apos;s broken&quot; with no screenshot, no URL, no browser info. You spend hours trying to reproduce a bug you can&apos;t even see.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We started Bugly because we believed there had to be a better way. A way for users to visually show exactly what went wrong, while automatically capturing all the technical context developers need to fix it — instantly.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Today, Bugly is a lightweight, embeddable widget and Chrome extension that bridges the gap between users experiencing problems and developers solving them. One script tag. Zero friction. Full context.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 ring-1 ring-gray-200 shadow-lg">
              <div className="space-y-6">
                {[
                  { val: '10,000+', label: 'Bug reports captured' },
                  { val: '500+', label: 'Teams using Bugly' },
                  { val: '95%', label: 'Faster issue resolution' },
                  { val: '< 2 min', label: 'Average setup time' },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <span className="text-sm text-gray-500">{stat.label}</span>
                    <span className="text-2xl font-bold text-gray-900">{stat.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Our Values</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">What drives us every day</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: 'User empathy', desc: 'We build for real people. Every feature starts with understanding the pain points of both the reporter and the developer.', color: 'text-red-600 bg-red-50' },
              { icon: Target, title: 'Context is everything', desc: 'A bug report without context is just noise. We capture everything automatically so nothing is lost in translation.', color: 'text-blue-600 bg-blue-50' },
              { icon: Zap, title: 'Speed matters', desc: 'From report to resolution, we optimize every step. Setup takes minutes, not days. Bug triage takes seconds, not hours.', color: 'text-amber-600 bg-amber-50' },
              { icon: Shield, title: 'Privacy first', desc: 'We take data security seriously. JWT auth, encrypted passwords, rate limiting, and CORS protection are built in from day one.', color: 'text-green-600 bg-green-50' },
              { icon: Globe, title: 'Works everywhere', desc: 'Our widget runs on any website. Our extension works on any page. No matter your stack, Bugly just works.', color: 'text-purple-600 bg-purple-50' },
              { icon: Users, title: 'Team-first design', desc: 'Bug fixing is a team sport. Comments, assignments, and status tracking keep everyone aligned and moving forward.', color: 'text-indigo-600 bg-indigo-50' },
            ].map(v => (
              <div key={v.title} className="group rounded-2xl border border-gray-100 bg-white p-8 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 hover:-translate-y-0.5">
                <div className={`inline-flex rounded-xl p-3 ${v.color}`}>
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{v.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Who It&apos;s For</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Made for every team size</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                title: 'Solo developers',
                desc: 'Building a side project or SaaS? Bugly gives you a professional bug reporting pipeline without the overhead of a full QA team.',
                tags: ['Side projects', 'SaaS', 'Freelancers'],
              },
              {
                title: 'Startups',
                desc: 'Move fast without breaking things silently. Get real user feedback from day one and iterate with confidence.',
                tags: ['Early-stage', 'Product teams', 'Agile'],
              },
              {
                title: 'Agencies & studios',
                desc: 'Manage bug reports across multiple client projects from one dashboard. Keep clients happy and delivery on track.',
                tags: ['Multi-project', 'Client work', 'Web agencies'],
              },
            ].map(a => (
              <div key={a.title} className="bg-white rounded-xl p-6 ring-1 ring-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-2">{a.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{a.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {a.tags.map(t => (
                    <span key={t} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Our Vision</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            A world where no bug goes unnoticed
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            We believe that the gap between users experiencing problems and developers fixing them should be as small as possible. Every second a bug goes unreported is a second a user loses trust in your product.
          </p>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            Bugly exists to close that gap. We&apos;re building tools that make it effortless for users to speak up and effortless for developers to act. No noise, no friction — just clear, actionable feedback that helps you ship better software.
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              { label: 'Simplicity first', desc: 'Every feature we build must be simple enough that anyone can use it without a manual.' },
              { label: 'Context is everything', desc: 'A bug report without context is just noise. We capture everything automatically so nothing is lost.' },
              { label: 'Built for speed', desc: 'From report to resolution, we optimize every step so your team can move fast and fix things.' },
            ].map(v => (
              <div key={v.label} className="bg-gray-50 rounded-xl p-6 ring-1 ring-gray-200">
                <CheckCircle2 className="h-5 w-5 text-blue-600 mb-3" />
                <p className="text-sm font-semibold text-gray-900 mb-1">{v.label}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-10 sm:p-14 shadow-2xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
            <div className="relative">
              <Bug className="h-10 w-10 text-white/80 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to join us?</h2>
              <p className="mt-4 text-blue-100 text-lg max-w-xl mx-auto">
                Start using Bugly today and see why developers love visual bug reporting.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-blue-600 hover:bg-blue-50 shadow-lg transition-all">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-6 py-3 text-base font-semibold text-white transition-all">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-gray-900">Bugly</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <Link href="/#features" className="hover:text-gray-700 transition-colors">Features</Link>
              <Link href="/#pricing" className="hover:text-gray-700 transition-colors">Pricing</Link>
              <Link href="/about" className="text-gray-900 font-medium">About</Link>
              <a href="#" className="hover:text-gray-700 transition-colors">Docs</a>
            </div>
            <p className="text-sm text-gray-400">&copy; 2026 Bugly. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
