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
  'Open': 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Resolved': 'bg-green-100 text-green-700',
  'Closed': 'bg-gray-100 text-gray-600',
};

const STATUS_DOT: Record<string, string> = {
  'Open': 'bg-amber-400',
  'In Progress': 'bg-blue-500',
  'Resolved': 'bg-green-500',
  'Closed': 'bg-gray-400',
};

function PerformanceBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{value} <span className="text-xs text-gray-400 font-normal">({pct}%)</span></span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
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
    <div className="space-y-5 max-w-5xl animate-pulse">
      {/* Hero card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl ring-1 ring-gray-200 dark:ring-gray-800 overflow-hidden">
        <div className="h-36 bg-gray-200 dark:bg-gray-700" />
        <div className="px-6 pb-6 pt-14">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3.5 w-52 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded-full mt-1" />
            </div>
            <div className="flex items-center gap-5 pt-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`text-center px-4 ${i < 2 ? 'border-r border-gray-100 dark:border-gray-800' : ''}`}>
                  <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
                  <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto mt-1.5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200 dark:ring-gray-800 p-5 flex flex-col gap-3">
            <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="space-y-1.5">
              <div className="h-7 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
      {/* Performance + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200 dark:ring-gray-800 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
          ))}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center space-y-1">
                <div className="h-5 w-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200 dark:ring-gray-800 p-6 space-y-3">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3">
              <div className="mt-1 h-2 w-2 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="flex gap-1.5">
                  <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
              <div className="h-3 w-14 bg-gray-200 dark:bg-gray-700 rounded shrink-0" />
            </div>
          ))}
        </div>
      </div>
      {/* Project breakdown */}
      <div className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200 dark:ring-gray-800 p-6 space-y-3">
        <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-5" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
            <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-44 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="flex gap-6 shrink-0">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="text-center space-y-1">
                  <div className="h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
                  <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
                </div>
              ))}
              <div className="w-20 space-y-1">
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!data) return <div className="py-12 text-center text-sm text-red-500">Failed to load profile.</div>;

  const { stats, projects, recentActivity } = data;
  const initial = data.user.name?.[0]?.toUpperCase() ?? 'U';
  const memberSince = new Date(data.user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Performance score: weighted metric out of 100
  const performanceScore = Math.min(100, Math.round(
    (stats.resolutionRate * 0.5) +
    (Math.min(stats.resolvedByUser, 20) / 20 * 30) +
    (Math.min(stats.commentsMade, 10) / 10 * 20)
  ));

  const performanceLabel =
    performanceScore >= 80 ? { text: 'Excellent', color: 'text-green-600', bg: 'bg-green-50', ring: 'ring-green-200' } :
    performanceScore >= 60 ? { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-200' } :
    performanceScore >= 40 ? { text: 'Average', color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200' } :
                             { text: 'Needs Work', color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-200' };

  return (
    <div className="space-y-5 max-w-5xl">

      {/* Profile hero */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="relative h-36 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
          <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 right-24 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute top-4 left-1/3 h-16 w-16 rounded-full bg-white/5" />
          {/* Avatar sits on the banner bottom edge */}
          <div className="absolute -bottom-10 left-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 ring-4 ring-white dark:ring-gray-900 shadow-xl flex items-center justify-center text-3xl font-bold text-white select-none">
              {initial}
            </div>
          </div>
        </div>

        {/* Body — padded top to clear the avatar */}
        <div className="px-6 pb-6 pt-14">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{data.user.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{data.user.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${performanceLabel.bg} ${performanceLabel.color} ${performanceLabel.ring}`}>
                  <Zap className="h-3 w-3" />
                  {performanceLabel.text}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <Clock className="h-3.5 w-3.5" /> Member since {memberSince}
                </span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-5 pt-1">
              {[
                { label: 'Projects', value: projects.length },
                { label: 'Total Bugs', value: stats.totalBugs },
                { label: 'Resolved', value: stats.resolvedBugs + stats.closedBugs },
              ].map((s, i) => (
                <div key={s.label} className={`text-center px-4 ${i < 2 ? 'border-r border-gray-100 dark:border-gray-800' : ''}`}>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Bugs', value: stats.totalBugs, icon: Bug, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-800' },
          { label: 'Open Bugs', value: stats.openBugs, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Resolved by You', value: stats.resolvedByUser, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Comments Made', value: stats.commentsMade, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm p-5 flex flex-col gap-3">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Performance breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Performance</h3>
            </div>
            {/* Score ring */}
            <div className="flex flex-col items-center">
              <div className="relative h-14 w-14">
                <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2563eb" strokeWidth="3"
                    strokeDasharray={`${performanceScore} ${100 - performanceScore}`}
                    strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900 dark:text-white">{performanceScore}</span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Score</span>
            </div>
          </div>

          <div className="space-y-4">
            <PerformanceBar label="Resolution Rate" value={stats.resolvedBugs + stats.closedBugs} max={stats.totalBugs} color="bg-green-500" />
            <PerformanceBar label="In Progress" value={stats.inProgressBugs} max={stats.totalBugs} color="bg-blue-500" />
            <PerformanceBar label="Open (unresolved)" value={stats.openBugs} max={stats.totalBugs} color="bg-amber-400" />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            {[
              { label: 'Resolved by you', value: stats.resolvedByUser },
              { label: 'Status changes', value: stats.statusChanges },
              { label: 'Comments', value: stats.commentsMade },
            ].map(m => (
              <div key={m.label} className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{m.value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Activity className="h-8 w-8 mb-2" />
              <p className="text-sm">No activity yet.</p>
            </div>
          ) : (
            <ol className="space-y-3">
              {recentActivity.map(a => (
                <li key={a.id}
                  onClick={() => router.push(`/dashboard/bugs/${a.bug.id}`)}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group"
                >
                  <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${STATUS_DOT[a.toStatus] ?? 'bg-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">{a.bug.title}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_COLORS[a.fromStatus] ?? 'bg-gray-100 text-gray-600'}`}>{a.fromStatus}</span>
                      <ArrowRight className="h-3 w-3 text-gray-400 shrink-0" />
                      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_COLORS[a.toStatus] ?? 'bg-gray-100 text-gray-600'}`}>{a.toStatus}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{new Date(a.changedAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Project breakdown */}
      <div className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <FolderKanban className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Project Breakdown</h3>
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
        </div>
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <FolderKanban className="h-8 w-8 mb-2" />
            <p className="text-sm">No projects yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map(p => {
              const pct = p.total > 0 ? Math.round(((p.resolved) / p.total) * 100) : 0;
              return (
                <div key={p.id}
                  onClick={() => router.push(`/dashboard/bugs?project=${p.id}`)}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-100 dark:ring-blue-800 flex items-center justify-center shrink-0">
                      <FolderKanban className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">{p.name}</p>
                        {p.isOwner
                          ? <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200 shrink-0"><Crown className="h-3 w-3" />Owner</span>
                          : <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-purple-200 shrink-0"><Users className="h-3 w-3" />Member</span>
                        }
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{p.domain}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{p.total}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-amber-600">{p.open}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Open</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-green-600">{p.resolved}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Resolved</p>
                    </div>
                    <div className="w-20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400 dark:text-gray-500">Progress</span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <div className="h-full rounded-full bg-green-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
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
