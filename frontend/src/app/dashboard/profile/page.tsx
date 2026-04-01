"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bug, FolderKanban, CheckCircle2, MessageSquare, TrendingUp, ArrowRight, Crown, Users, Clock, Activity, Zap } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface Project {
  id: string;
  name: string;
  domain: string;
  createdAt: string;
  total: number;
  open: number;
  resolved: number;
  isOwner: boolean;
}

interface ActivityItem {
  id: string;
  fromStatus: string;
  toStatus: string;
  changedAt: string;
  bug: { id: string; title: string };
}

interface Stats {
  totalBugs: number;
  openBugs: number;
  resolvedBugs: number;
  closedBugs: number;
  inProgressBugs: number;
  statusChanges: number;
  resolvedByUser: number;
  commentsMade: number;
  resolutionRate: number;
}

interface ProfileData {
  user: { id: string; name: string; email: string; createdAt: string };
  stats: Stats;
  projects: Project[];
  recentActivity: ActivityItem[];
}

const STATUS_COLORS: Record<string, string> = {
  'Open': 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30',
  'In Progress': 'bg-brand-50 text-brand-600 border-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-900/30',
  'Resolved': 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30',
  'Closed': 'bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/60',
};

const STATUS_DOT: Record<string, string> = {
  'Open': 'bg-rose-500',
  'In Progress': 'bg-brand-500',
  'Resolved': 'bg-emerald-500',
  'Closed': 'bg-gray-400',
};

function PerformanceBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{label}</span>
        <span className="text-[11px] font-black text-gray-900 dark:text-white leading-none">{value} <span className="text-gray-300 dark:text-gray-700 mx-1">/</span> {pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-50 dark:bg-gray-900/50 overflow-hidden shadow-inner border border-gray-100 dark:border-gray-800/40">
        <div className={`h-full rounded-full transition-all duration-1000 ease-out ${color} shadow-sm`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    api.get('/auth/profile/stats')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!mounted || loading) return (
    <div className="space-y-10 max-w-6xl animate-pulse">
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-50 dark:bg-gray-900 rounded-3xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="h-96 bg-gray-50 dark:bg-gray-900 rounded-3xl" />
          <div className="h-96 bg-gray-50 dark:bg-gray-900 rounded-3xl" />
      </div>
    </div>
  );

  if (!data) return <div className="py-20 text-center font-black text-rose-500 uppercase tracking-widest">Registry Synchronization Failed</div>;

  const { stats, projects, recentActivity } = data;
  const initial = data.user.name?.[0]?.toUpperCase() ?? 'U';
  const memberSince = new Date(data.user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const performanceScore = Math.min(100, Math.round(
    ((stats.resolutionRate || 0) * 0.5) +
    (Math.min(stats.resolvedByUser || 0, 20) / 20 * 30) +
    (Math.min(stats.commentsMade || 0, 10) / 10 * 20)
  ) || 0);

  const performanceLabel =
    performanceScore >= 80 ? { text: 'Expert Technician', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' } :
    performanceScore >= 60 ? { text: 'Reliable Contributor', color: 'text-brand-500', bg: 'bg-brand-500/10', border: 'border-brand-500/20' } :
    performanceScore >= 40 ? { text: 'Active Analyst', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' } :
                             { text: 'New Evaluator', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };

  return (
    <div className="space-y-10 max-w-6xl">

      {/* Profile hero */}
      <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-premium overflow-hidden">
        <div className="relative h-48 bg-gray-900 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-600 opacity-90" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
            <div className="absolute -bottom-10 left-10">
                <div className="h-24 w-24 rounded-3xl bg-white dark:bg-gray-900 shadow-2xl flex items-center justify-center text-4xl font-black text-brand-600 select-none border-4 border-white dark:border-gray-950">
                    {initial}
                </div>
            </div>
        </div>

        <div className="px-10 pb-10 pt-16">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
            <div className="space-y-1.5">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{data.user.name}</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{data.user.email}</p>
              <div className="flex items-center gap-4 mt-4">
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${performanceLabel.bg} ${performanceLabel.color} ${performanceLabel.border}`}>
                  <Zap className="h-3.5 w-3.5" />
                  {performanceLabel.text}
                </span>
                <span className="inline-flex items-center gap-2 text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest">
                  <Clock className="h-4 w-4" /> Joined {memberSince}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-8 pt-2">
              {[
                { label: 'Environments', value: projects.length },
                { label: 'Logged Incidents', value: stats.totalBugs },
                { label: 'Solved', value: stats.resolvedBugs + stats.closedBugs },
              ].map((s, i) => (
                <div key={s.label} className={`text-center ${i < 2 ? 'pr-8 border-r border-gray-50 dark:border-gray-900' : ''}`}>
                  <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{s.value}</p>
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {[
          { label: 'Total Volume', value: stats.totalBugs, icon: Bug, color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900' },
          { label: 'Operational', value: stats.openBugs, icon: Activity, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Authoritative', value: stats.resolvedByUser, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Commits', value: stats.commentsMade, icon: MessageSquare, color: 'text-brand-500', bg: 'bg-brand-500/10' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-premium p-6 flex flex-col gap-5 hover:translate-y-[-4px] transition-all">
            <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center border border-white/10`}>
              <s.icon className={`h-6 w-6 ${s.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Performance breakdown */}
        <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-premium p-10 space-y-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Efficiency Metrics</h3>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Workspace Contributions</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative h-20 w-20">
                <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" className="text-gray-50 dark:text-gray-900" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#gradient)" strokeWidth="3"
                    strokeDasharray={`${performanceScore} ${100 - performanceScore}`}
                    strokeLinecap="round" />
                  <defs>
                     <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#6366f1" />
                     </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-gray-900 dark:text-white tracking-tighter">{performanceScore}</span>
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">Rank Pct</span>
            </div>
          </div>

          <div className="space-y-8">
            <PerformanceBar label="Incident Resolution" value={stats.resolvedBugs + stats.closedBugs} max={stats.totalBugs} color="bg-emerald-500" />
            <PerformanceBar label="Ongoing Analysis" value={stats.inProgressBugs} max={stats.totalBugs} color="bg-brand-500" />
            <PerformanceBar label="Pending Triage" value={stats.openBugs} max={stats.totalBugs} color="bg-rose-500" />
          </div>

          <div className="grid grid-cols-3 gap-6 pt-10 border-t border-gray-50 dark:border-gray-900/40">
            {[
              { label: 'Direct Solutions', value: stats.resolvedByUser },
              { label: 'State Mutations', value: stats.statusChanges },
              { label: 'Sync Events', value: stats.commentsMade },
            ].map(m => (
              <div key={m.label} className="text-center space-y-1">
                <p className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">{m.value}</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-tight">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-premium flex flex-col h-[520px]">
          <div className="p-10 border-b border-gray-50 dark:border-gray-900/60">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Audit Event Stream</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
              {recentActivity.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <Activity className="h-10 w-10 text-gray-300 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No spectral events detected</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map(a => (
                    <div key={a.id}
                      onClick={() => router.push(`/dashboard/bugs/${a.bug.id}`)}
                      className="group flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-50 dark:border-gray-800/60 hover:border-brand-200 dark:hover:border-brand-800 transition-all cursor-pointer"
                    >
                      <div className={`mt-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-950 shrink-0 ${STATUS_DOT[a.toStatus] ?? 'bg-gray-400'}`} />
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-600 transition-colors">{a.bug.title}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${STATUS_COLORS[a.fromStatus] ?? 'bg-gray-100 text-gray-600'}`}>{a.fromStatus}</span>
                          <ArrowRight className="h-3 w-3 text-gray-300" />
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${STATUS_COLORS[a.toStatus] ?? 'bg-gray-100 text-gray-600'}`}>{a.toStatus}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{new Date(a.changedAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Project breakdown */}
      <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-premium p-10">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Environment Insights</h3>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Infrastructure Status</p>
          </div>
          <span className="px-4 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-[10px] font-black text-gray-400 uppercase tracking-widest">{projects.length} Nodes</span>
        </div>
        
        {projects.length === 0 ? (
           <div className="py-20 text-center bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-100 dark:border-gray-800">
                <FolderKanban className="h-10 w-10 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No active deployments identified</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map(p => {
              const pct = p.total > 0 ? Math.round(((p.resolved) / p.total) * 100) : 0;
              return (
                <div key={p.id}
                  onClick={() => router.push(`/dashboard/bugs?project=${p.id}`)}
                  className="group relative p-8 rounded-3xl bg-white dark:bg-gray-950 border border-gray-50 dark:border-gray-800/60 hover:border-brand-200 dark:hover:border-brand-800 transition-all cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 border border-brand-100 dark:border-brand-800 shadow-inner">
                      <FolderKanban className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-black text-gray-900 dark:text-white truncate group-hover:text-brand-600 transition-colors uppercase tracking-tight">{p.name}</h4>
                        {p.isOwner ? (
                             <Crown className="h-3.5 w-3.5 text-amber-500 shadow-lg" />
                        ) : (
                             <Users className="h-3.5 w-3.5 text-brand-400" />
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 truncate uppercase tracking-widest">{p.domain}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                     <div className="space-y-1">
                        <p className="text-sm font-black text-gray-900 dark:text-white tracking-tighter">{p.total}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Volume</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-sm font-black text-rose-500 tracking-tighter">{p.open}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-sm font-black text-emerald-500 tracking-tighter">{p.resolved}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Solved</p>
                     </div>
                  </div>

                  <div className="space-y-2">
                       <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest">Health Index</span>
                            <span className="text-[9px] font-black text-brand-600 uppercase tracking-widest">{pct}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-gray-50 dark:bg-gray-900 rounded-full overflow-hidden shadow-inner border border-gray-100 dark:border-gray-800/40">
                            <div className="h-full bg-brand-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                       </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
