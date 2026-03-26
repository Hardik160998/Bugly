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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/60 p-4 flex flex-col h-32 sm:h-32 justify-between group hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} dark:bg-gray-800`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-2">{stat.name}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white leading-none mb-4">{stat.value}</p>
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
          
          <div className="mt-3 mb-3 flex flex-col gap-4">
            {!stats?.recentBugs.length ? (
              <p className="text-center py-12 text-gray-500 italic text-sm">No bug reports yet.</p>
            ) : (
              stats.recentBugs.map((bug: RecentBug) => {
                const status = bug.status.toLowerCase();
                const isResolved = status === 'resolved' || status === 'closed';
                const isOpen = status === 'open';
                
                const dotColor = isResolved ? 'bg-emerald-500' : isOpen ? 'bg-rose-600' : 'bg-indigo-500';
                const pillColor = isResolved ? 'bg-emerald-100 text-emerald-700' : isOpen ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700';
                const textColor = isResolved ? 'text-emerald-600' : isOpen ? 'text-rose-600' : 'text-indigo-600';
                
                return (
                  <div 
                    key={bug.id} 
                    onClick={() => router.push(`/dashboard/bugs/${bug.id}`)} 
                    className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer flex flex-col group mx-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                        <span className="font-bold text-gray-900 dark:text-white text-base tracking-tight">{bug.id.substring(0, 8).toUpperCase()}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${pillColor}`}>
                        {bug.status}
                      </span>
                    </div>

                    {/* Body with vertical line */}
                    <div className="relative pl-5 ml-[4.5px] border-l-2 border-gray-100 dark:border-gray-800/60 my-4 space-y-3">
                      <div className="flex items-start">
                        <span className="w-20 shrink-0 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Source:</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{bug.project.name}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="w-20 shrink-0 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Trigger:</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{bug.title || "Reported by platform"}</span>
                      </div>
                    </div>

                    <hr className="border-gray-100 dark:border-gray-800/60 mb-4" />

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                        Updated {timeAgo(bug.createdAt)}
                      </span>
                      <span className={`text-[11px] font-bold uppercase tracking-widest flex items-center gap-1 dark:text-gray-400`}>
                        Details <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
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

