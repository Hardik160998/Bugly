"use client";

import { useEffect, useState } from 'react';
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
  'open':        'bg-amber-50 text-amber-700 ring-amber-600/20',
  'in progress': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  'resolved':    'bg-green-50 text-green-700 ring-green-600/20',
  'closed':      'bg-gray-50 text-gray-600 ring-gray-500/10',
};

export default function DashboardHome() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { 
      name: 'Total Bugs',   
      value: stats.total.toLocaleString(),      
      icon: Bug,          
      color: 'text-blue-600', 
      bg: 'bg-blue-50'
    },
    { 
      name: 'Open',         
      value: stats.open.toLocaleString(),        
      icon: AlertCircle,  
      color: 'text-purple-600', 
      bg: 'bg-purple-50'
    },
    { 
      name: 'In Progress',  
      value: stats.inProgress.toLocaleString(),  
      icon: Clock,        
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50'
    },
    { 
      name: 'Resolved',     
      value: stats.resolved.toLocaleString(),    
      icon: CheckCircle,  
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100/50'
    },
  ] : [];

  if (loading) return <DashboardShimmer />;

  return (
    <div className="space-y-8 pb-8">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/60 p-6 flex flex-col h-32 justify-between group hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{stat.name}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Reports - 8 cols */}
        <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/60 flex flex-col overflow-hidden shadow-sm">
          <div className="p-6 pb-0 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Reports</h2>
            <Link href="/dashboard/bugs" className="px-3 py-1 text-xs font-bold border border-gray-900 rounded-md hover:bg-gray-50 transition-colors uppercase tracking-tight">
              View All
            </Link>
          </div>
          
          <div className="mt-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Incident</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {!stats?.recentBugs.length ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic text-sm">No bug reports yet.</td>
                  </tr>
                ) : (
                  stats.recentBugs.map((bug: RecentBug) => (
                    <tr key={bug.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors group cursor-pointer" onClick={() => router.push(`/dashboard/bugs/${bug.id}`)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            bug.status.toLowerCase() === 'resolved' ? 'bg-emerald-500' : 
                            bug.status.toLowerCase() === 'open' ? 'bg-rose-500' : 'bg-indigo-500'
                          }`} />
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{bug.id.substring(0, 8).toUpperCase()}: {bug.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5 mt-0.5">Reported by platform</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                        {bug.project.name}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(bug.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                          bug.status.toLowerCase() === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 
                          bug.status.toLowerCase() === 'open' ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {bug.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Projects - 4 cols */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/60 p-6 shadow-sm overflow-hidden flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Projects</h2>
              <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="h-4 w-4" /></button>
            </div>
            
            <div className="space-y-4">
              {!stats?.projects.length ? (
                <p className="text-center py-8 text-gray-400 italic text-sm">No projects found.</p>
              ) : (
                stats.projects.map((project: Project) => (
                  <Link 
                    key={project.id}
                    href={`/dashboard/bugs?project=${project.id}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-50 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-900/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50 dark:border-blue-900/30">
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{project.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{project._count.bugs} ACTIVE</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

