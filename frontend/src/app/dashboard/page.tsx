"use client";

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bug, CheckCircle, Clock, FolderKanban, AlertCircle, ArrowRight, MoreVertical } from 'lucide-react';
import { DashboardShimmer } from '@/components/ui/Shimmer';
import api from '@/lib/api';

interface RecentBug {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  project: { name: string };
}

interface Project {
  id: string;
  name: string;
  domain: string;
  _count: { bugs: number };
}

interface Stats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  recentBugs: RecentBug[];
  projects: Project[];
}

const STATUS_COLORS: Record<string, string> = {
  'open': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'in progress': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  'resolved': 'bg-green-50 text-green-700 ring-green-600/20',
  'closed': 'bg-gray-50 text-gray-600 ring-gray-500/10',
};

function timeAgo(dateString: string) {
  const diffInSeconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
}

export default function DashboardHome() {
  const router = useRouter();

  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/projects/stats');
      return res.data;
    },
  });

  const statCards = stats ? [
    { name: 'Total Bugs', value: stats.total, icon: Bug, color: 'text-blue-600', bg: 'bg-blue-50/50' },
    { name: 'Open', value: stats.open, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50/50' },
    { name: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/50' },
    { name: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
  ] : [];

  if (isLoading || !stats) return <DashboardShimmer />;

  return (
    <div className="space-y-10 pb-10">
      {/* Premium Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div 
            key={stat.name} 
            className="flex items-center gap-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/60 p-5 shadow-premium hover:shadow-premium-hover transition-all group cursor-default"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.bg} ${stat.color} dark:bg-gray-800 transition-transform group-hover:scale-105`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tight">
                {stat.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Reports - 8 cols */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-premium overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800/60 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Recent Reports</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Latest incidents across all projects</p>
            </div>
            <Link href="/dashboard/bugs" className="px-4 py-2 text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/20 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-all uppercase tracking-widest">
              View All
            </Link>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
            {!stats?.recentBugs.length ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-40">
                <Bug className="h-12 w-12 mb-4" />
                <p className="font-medium">No reports recorded yet.</p>
              </div>
            ) : (
              stats.recentBugs.slice(0, 5).map((bug: RecentBug) => (
                <div
                  key={bug.id}
                  onClick={() => router.push(`/dashboard/bugs/${bug.id}`)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between px-8 py-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center group-hover:border-brand-200 dark:group-hover:border-brand-800 transition-colors">
                      <Bug className="h-5 w-5 text-gray-400 group-hover:text-brand-500 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-900 dark:text-white truncate lg:max-w-md">{bug.title || "Unknown Incident"}</span>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded uppercase">{bug.id.slice(0, 4)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                        <span className="flex items-center gap-1"><FolderKanban className="h-3 w-3" /> {bug.project.name}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(bug.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 sm:mt-0 flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                      bug.status.toLowerCase() === 'open' 
                        ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-900/20 dark:border-rose-900/30' 
                        : 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-900/30'
                    }`}>
                      {bug.status}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-brand-600 transform group-hover:translate-x-1 transition-all invisible sm:visible" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Projects - 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-premium p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Top Projects</h2>
              <button className="h-8 w-8 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {!stats?.projects.length ? (
                <p className="text-center py-8 text-gray-400 italic text-sm">No projects found.</p>
              ) : (
                stats.projects.slice(0, 4).map((project: Project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/bugs?project=${project.id}`}
                    className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 dark:border-gray-800 hover:border-brand-100 dark:hover:border-brand-900/50 hover:bg-brand-50/20 dark:hover:bg-brand-900/10 transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-brand-600 transition-colors">
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{project.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{project._count.bugs} BUGS</span>
                          <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                          <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Active</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-brand-600 transform group-hover:translate-x-1 transition-all" />
                  </Link>
                ))
              )}
            </div>
          </div>
          
          {/* Quick Support / Promotion Card */}
          <div className="bg-brand-600 rounded-3xl p-8 text-white relative overflow-hidden group shadow-lg shadow-brand-600/20">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Need help?</h3>
              <p className="text-brand-100 text-sm mb-6 leading-relaxed">Check our documentation or contact support for assistance.</p>
              <button className="bg-white text-brand-600 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-50 transition-colors">
                Get Support
              </button>
            </div>
            <Bug className="absolute -right-6 -bottom-6 h-32 w-32 text-brand-500/20 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

