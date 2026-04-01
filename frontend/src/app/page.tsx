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
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-[100] border-b border-gray-100 dark:border-gray-900/40 bg-white/70 dark:bg-gray-950/70 backdrop-blur-3xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/20 group-hover:scale-110 transition-transform duration-500">
                <Bug className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">Bugly</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-10">
            {['Solutions', 'Features', 'Pricing', 'Docs'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {!mounted ? (
              <div className="h-10 w-32 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-900" />
            ) : user ? (
              <Link href="/dashboard" className="flex items-center gap-3 pl-2 pr-6 py-2 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:shadow-xl transition-all group overflow-hidden relative">
                  <div className="absolute inset-0 bg-brand-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                  <div className="h-8 w-8 rounded-xl bg-gray-800 dark:bg-gray-100 flex items-center justify-center relative z-10">
                      <UserIcon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest relative z-10">Console</span>
              </Link>
            ) : (
              <div className="flex items-center gap-8">
                <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">Identity</Link>
                <Link href="/login" className="rounded-2xl bg-brand-600 px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-600/20 hover:bg-brand-700 hover:shadow-brand-600/40 transition-all active:scale-95">
                  Initialize Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-7xl h-full">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="mx-auto max-w-7xl px-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-white dark:bg-gray-900 px-5 py-2 text-[10px] font-black text-brand-600 uppercase tracking-widest ring-1 ring-gray-100 dark:ring-gray-800 shadow-premium mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Zap className="h-3.5 w-3.5 fill-brand-600" />
            Infrastructure for Visual Feedback
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 dark:text-white leading-[0.9] mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            Capture Reality<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-600">Solve Complexity</span>
          </h1>
          
          <p className="max-w-2xl text-lg font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-14 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            Transform ambiguous bug reports into actionable technical artifacts. Annotate, collaborate, and ship software with enterprise-grade visual context.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <Link href="/login" className="group flex items-center gap-4 rounded-2xl bg-gray-900 dark:bg-white px-10 py-5 text-[10px] font-black uppercase tracking-widest text-white dark:text-gray-900 shadow-2xl hover:scale-105 transition-all">
              Initialize Workspace
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#how-it-works" className="flex items-center gap-4 rounded-2xl bg-white dark:bg-gray-900 px-10 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 shadow-premium border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-all">
              Technical Overview
            </a>
          </div>

          {/* Hero Artifact */}
          <div className="mt-32 w-full relative animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-500">
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-950 via-transparent to-transparent z-10 h-1/3 bottom-0 top-auto" />
            <div className="rounded-[40px] border border-gray-100 dark:border-gray-800/60 bg-white/40 dark:bg-gray-900/40 shadow-premium-lg backdrop-blur-sm overflow-hidden p-3">
                <div className="rounded-[30px] overflow-hidden bg-gray-50 dark:bg-gray-950 h-[600px] border border-gray-100 dark:border-gray-800/40 relative">
                    {/* Mock Console Header */}
                    <div className="h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800/60 flex items-center px-10 justify-between">
                        <div className="flex gap-2">
                            <div className="h-3 w-3 rounded-full bg-rose-500" />
                            <div className="h-3 w-3 rounded-full bg-amber-500" />
                            <div className="h-3 w-3 rounded-full bg-emerald-500" />
                        </div>
                        <div className="h-6 w-64 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 mx-auto" />
                    </div>
                    {/* Mock Layout */}
                    <div className="flex h-full">
                        <div className="w-64 border-r border-gray-100 dark:border-gray-800/60 p-8 space-y-6">
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-full" />
                            <div className="space-y-3">
                                <div className="h-8 w-full bg-brand-500/10 rounded-2xl" />
                                <div className="h-8 w-full bg-gray-50 dark:bg-gray-900 rounded-2xl" />
                                <div className="h-8 w-full bg-gray-50 dark:bg-gray-900 rounded-2xl" />
                            </div>
                        </div>
                        <div className="flex-1 p-10 space-y-10">
                            <div className="grid grid-cols-3 gap-6">
                                <div className="h-32 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-sm" />
                                <div className="h-32 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-sm" />
                                <div className="h-32 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-sm" />
                            </div>
                            <div className="h-[280px] bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800/60 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-600/5 to-transparent" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Logos / Trust Bar ─── */}
      <section className="py-20 border-y border-gray-50 dark:border-gray-900/40">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 max-w-[200px] leading-relaxed">Trusted by engineering teams globally</p>
            <div className="flex-1 flex flex-wrap items-center justify-center md:justify-end gap-x-12 gap-y-8 grayscale opacity-40">
              {['Acme Corp', 'TechFlow', 'CloudBase', 'DevStack', 'StartupOS'].map(name => (
                <span key={name} className="text-xl font-black tracking-tighter hover:opacity-100 transition-opacity cursor-default dark:text-white uppercase">{name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="py-40 bg-gray-50/50 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-8 text-center sm:text-left">
          <div className="max-w-3xl mb-24">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 dark:text-white leading-[0.9] mb-8">
              Engineered for<br />
              <span className="text-brand-500">Precision Analysis</span>
            </h2>
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Everything required to transition from identification to resolution.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { icon: Camera, title: 'Optical Capture', desc: 'Instant DOM snapshots with high-fidelity annotation tools for precise issue isolation.', color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/20' },
              { icon: Globe, title: 'Network Context', desc: 'Automated retrieval of browser metadata, network conditions, and console environmental logs.', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
              { icon: MessageSquare, title: 'Async Threads', desc: 'Contextual communication modules integrated directly into each bug reporting artifact.', color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20' },
              { icon: Zap, title: 'Hybrid Integration', desc: 'Lightweight JS injection scripts or enterprise browser extensions for cross-environment coverage.', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
              { icon: BarChart3, title: 'Velocity Tracking', desc: 'Holistic performance dashboards monitoring workspace health and resolution speed metrics.', color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' },
              { icon: Shield, title: 'Encrypted Records', desc: 'End-to-end data safety with high-availability infrastructure and role-based access protocol.', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
            ].map((f) => (
              <div key={f.title} className="group p-10 rounded-[40px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/60 shadow-premium hover:shadow-brand-600/5 transition-all duration-500 hover:translate-y-[-8px]">
                <div className={`h-16 w-16 rounded-[24px] mb-8 flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 ${f.color}`}>
                  <f.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">{f.title}</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-40">
        <div className="mx-auto max-w-7xl px-8 flex flex-col lg:flex-row items-center gap-24">
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 dark:text-white leading-[0.9] mb-8 uppercase">Rapid<br />Implementation</h2>
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-12">Establish a high-performance feedback loop in minutes.</p>
            
            <div className="space-y-12">
              {[
                { step: '01', title: 'Injection', desc: 'Deploy the lightweight JS kernel into your production or staging environments.' },
                { step: '02', title: 'Identification', desc: 'End-users utilize the visual overlay to flag inconsistencies in real-time.' },
                { step: '03', title: 'Artifact Gen', desc: 'Bugly automatically constructs a technical case including metadata and screenshots.' },
                { step: '04', title: 'Resolution', desc: 'Engineers consume the artifact context to synchronize solutions instantly.' },
              ].map((s) => (
                <div key={s.step} className="flex gap-8">
                  <div className="text-[10px] font-black text-brand-600 p-2 h-10 w-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-2">{s.title}</h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="aspect-[4/5] rounded-[60px] bg-gray-900 dark:bg-white overflow-hidden relative shadow-2xl scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-indigo-700 opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="h-40 w-40 text-white/20 fill-white/10 animate-pulse" />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing Section ─── */}
      <section id="pricing" className="py-40 bg-gray-50/50 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-8">
          <div className="text-center mb-24 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 dark:text-white leading-[0.9] mb-8">Transparent<br />Economics</h2>
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest text-[10px] font-black">Free entry. Scalability for enterprise requirements.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter Tier',
                price: '$19',
                desc: 'Optimized for independent developers and startups.',
                features: ['3 Integrated Nodes', '500 Monthly Records', 'High-Res Captures', 'Direct Webhooks'],
                highlight: false,
              },
              {
                name: 'Professional',
                price: '$49',
                desc: 'Built for high-velocity teams needing full sync.',
                features: ['15 Integrated Nodes', 'Unlimited Records', 'Advanced Annotations', 'Shared Channels', 'HubSpot / Slack Tier'],
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: '$99',
                desc: 'Strategic oversight for consolidated multi-client management.',
                features: ['Unlimited Scale', 'Volume Independent', 'Custom Branding', 'Identity Bridge', 'Full API Surface'],
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`group p-12 rounded-[48px] flex flex-col transition-all duration-500 ${
                  plan.highlight
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-2xl scale-105 z-10'
                    : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-premium'
                }`}
              >
                {plan.highlight && (
                   <span className="inline-block self-start px-4 py-1.5 rounded-full bg-brand-500 text-white text-[9px] font-black uppercase tracking-widest mb-10 shadow-xl">Top Selection</span>
                )}
                <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${plan.highlight ? 'text-brand-400' : 'text-gray-400'}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${plan.highlight ? 'text-gray-500' : 'text-gray-400'}`}>/mon</span>
                </div>
                <p className={`text-xs font-medium mb-10 leading-relaxed ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>{plan.desc}</p>
                
                <div className={`h-px w-full mb-10 ${plan.highlight ? 'bg-gray-800 dark:bg-gray-100' : 'bg-gray-50 dark:bg-gray-800'}`} />
                
                <ul className="space-y-5 flex-1 mb-12">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <CheckCircle className={`h-4 w-4 shrink-0 ${plan.highlight ? 'text-brand-400' : 'text-brand-600'}`} />
                      <span className={`text-[11px] font-black uppercase tracking-tight ${plan.highlight ? 'text-gray-300 dark:text-gray-700' : 'text-gray-600 dark:text-gray-400'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`w-full rounded-2xl py-5 text-[10px] font-black uppercase tracking-widest text-center transition-all ${
                    plan.highlight
                      ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-xl shadow-brand-500/20'
                      : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 shadow-xl'
                  } active:scale-95`}
                >
                  Access Console
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-40 relative overflow-hidden bg-brand-600">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-50" />
        <div className="mx-auto max-w-4xl px-8 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-10 uppercase">Synchronize Your Engineering Stream</h2>
          <p className="text-lg font-medium text-brand-100 mb-14">Accelerate resolution speed across your entire architecture.</p>
          <Link href="/login" className="inline-flex items-center gap-6 rounded-3xl bg-white dark:bg-gray-950 px-12 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400 shadow-2xl hover:scale-105 transition-all active:scale-95">
            Initialize Free Trial
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-[10px] font-black text-white/50 uppercase tracking-widest">
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Zero Commitment</span>
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> High Availability</span>
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Instant Activation</span>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-20 bg-white dark:bg-gray-950 border-t border-gray-50 dark:border-gray-900/40">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
                    <Bug className="h-5 w-5 text-white dark:text-gray-900" />
               </div>
               <span className="text-lg font-black tracking-tighter text-gray-900 dark:text-white uppercase italic">Bugly</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-10">
              {['Security', 'Privacy', 'Compliance', 'Terms', 'Docs'].map(item => (
                 <a key={item} href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">{item}</a>
              ))}
            </div>
            <p className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest">&copy; 2026 Bugly Ecosystem. Global Operations.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
