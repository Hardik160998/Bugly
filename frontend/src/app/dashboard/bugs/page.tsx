"use client";

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BugListShimmer } from '@/components/ui/Shimmer';
import StyledSelect from '@/components/ui/StyledSelect';
import UpgradeModal from '@/components/ui/UpgradeModal';
import { 
  Zap, 
  AlertTriangle, 
  Calendar, 
  Search, 
  Clock, 
  Bug, 
  ArrowRight 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Project { id: string; name: string; }
interface BugReport { id: string; title: string; status: string; createdAt: string; browser: string; os: string; }

const STATUSES = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

const STATUS_STYLES: Record<string, string> = {
  'Open': 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-900/20 dark:border-rose-900/30',
  'In Progress': 'bg-brand-50 border-brand-100 text-brand-600 dark:bg-brand-900/20 dark:border-brand-900/30',
  'Resolved': 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-900/30',
  'Closed': 'bg-gray-50 border-gray-100 text-gray-500 dark:bg-gray-900/20 dark:border-gray-800/60',
};

export default function BugsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [activeStatus, setActiveStatus] = useState('Open');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Fetch Projects and Plan
  const { data: initData, isLoading: isInitializing } = useQuery({
    queryKey: ['bugs-init-data'],
    queryFn: async () => {
      const [pRes, sRes] = await Promise.all([
        api.get('/projects'),
        api.get('/auth/profile/stats')
      ]);
      return { projects: pRes.data, plan: sRes.data.plan };
    },
  });

  const projects = initData?.projects || [];
  const plan = initData?.plan || null;

  // Set initial project ID once projects are loaded
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      const fromQuery = searchParams.get('project');
      const match = projects.find((p: Project) => p.id === fromQuery);
      setSelectedProjectId(match ? match.id : projects[0].id);
    }
  }, [projects, selectedProjectId, searchParams]);

  // Handle auto-show upgrade modal
  useEffect(() => {
    if (plan?.trial.isExpired) {
      setShowUpgradeModal(true);
    }
  }, [plan]);

  // Fetch Bugs for selected project
  const { data: bugsData, isLoading: isBugsLoading } = useQuery({
    queryKey: ['project-bugs', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return { bugs: [] };
      const res = await api.get(`/projects/${selectedProjectId}/bugs`);
      return Array.isArray(res.data) ? { bugs: res.data } : res.data;
    },
    enabled: !!selectedProjectId,
  });

  const bugs = bugsData?.bugs || [];
  const loading = isInitializing || isBugsLoading;

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: bugs.length };
    STATUSES.slice(1).forEach(s => { c[s] = bugs.filter((b: BugReport) => b.status === s).length; });
    return c;
  }, [bugs]);

  const filtered = useMemo(() => bugs.filter((b: BugReport) => {
    const matchStatus = activeStatus === 'All' || b.status === activeStatus;
    const matchSearch = !debouncedSearch.trim() || b.title.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchStatus && matchSearch;
  }), [bugs, activeStatus, debouncedSearch]);

  const timeAgo = (date: string) => {
      const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + "y";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + "mo";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + "d";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + "h";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + "m";
      return Math.floor(seconds) + "s";
  };

  return (
    <div className="space-y-10 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Monitoring</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Real-time bug logs and user feedback.</p>
        </div>
        <StyledSelect
          value={selectedProjectId}
          onChange={val => { setSelectedProjectId(val); setActiveStatus('Open'); setSearch(''); }}
          options={isInitializing
            ? [{ value: '', label: 'Loading projects...' }]
            : projects.length === 0
              ? [{ value: '', label: 'No active projects' }]
              : projects.map((p: Project) => ({ value: p.id, label: p.name }))
          }
          className="w-full sm:w-64"
        />
      </div>

      {/* Trial Banner */}
      {plan && !plan.trial.isExpired && plan.name === 'free' && plan.trial.daysRemaining <= 3 && (
         <div className="rounded-3xl bg-brand-600 p-6 text-white shadow-xl shadow-brand-600/20 flex items-center justify-between gap-4 relative overflow-hidden group">
            <div className="flex items-center gap-4 relative z-10">
                <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
                    <Calendar className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-lg font-bold">Trial ending soon</p>
                    <p className="text-sm opacity-90">Upgrade for continued premium monitoring.</p>
                </div>
            </div>
            <button onClick={() => router.push('/dashboard/billing')} className="relative z-10 bg-white text-brand-600 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-50 transition-all shadow-lg">Upgrade</button>
         </div>
      )}

      <div className="bg-white dark:bg-gray-950 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-800/60 flex-1 flex flex-col overflow-hidden">
        {/* Search & Tabs Segment */}
        <div className="px-8 pt-8 border-b border-gray-50 dark:border-gray-800/60 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6">
            <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Filter incidents..."
                    className="block w-full rounded-2xl border-0 py-3 pl-12 pr-4 text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-900/50 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-xs font-medium transition-all"
                />
            </div>
            
            <div className="flex items-center gap-1.5 p-1 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100/50 dark:border-gray-800/50">
                {STATUSES.map(s => (
                    <button
                        key={s}
                        onClick={() => setActiveStatus(s)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            activeStatus === s 
                                ? 'bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-gray-100 dark:ring-gray-700/50' 
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                    >
                        {s} <span className="ml-1 opacity-50">{counts[s] ?? 0}</span>
                    </button>
                ))}
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <BugListShimmer />
          ) : bugs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center h-full">
              <div className="h-20 w-20 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-6 border border-emerald-100 dark:border-emerald-900/40">
                <Bug className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight text-emerald-600">Zero active incidents</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium max-w-sm">No bugs reported yet for this environment. Your system appears healthy.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center h-full opacity-40">
              <Bug className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-6" />
              <h3 className="text-lg font-bold">No results found</h3>
              <p className="text-sm font-medium">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {filtered.map((bug: BugReport) => (
                <li 
                  key={bug.id} 
                  onClick={() => router.push(`/dashboard/bugs/${bug.id}`)}
                  className="group relative flex items-center justify-between gap-x-6 px-10 py-6 hover:bg-gray-50/50 dark:hover:bg-brand-900/5 transition-all cursor-pointer"
                >
                  <div className="flex min-w-0 gap-x-5 items-center">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center group-hover:border-brand-200 dark:group-hover:border-brand-800 transition-colors">
                      <Bug className="h-6 w-6 text-rose-500 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-base font-bold text-gray-900 dark:text-white truncate lg:max-w-xl group-hover:text-brand-600 transition-colors">
                          {bug.title}
                        </p>
                        <span className="text-[10px] font-bold text-gray-300 dark:text-gray-700 uppercase tracking-widest">
                            {bug.id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Zap className="h-3 w-3" /> {bug.browser || 'Generic'}</span>
                        <span className="h-1 w-1 rounded-full bg-gray-200 dark:bg-gray-800" />
                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {timeAgo(bug.createdAt)} ago</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                     <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${STATUS_STYLES[bug.status] || 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                        {bug.status}
                      </span>
                      <div className="h-10 w-10 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-300 group-hover:text-brand-600 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/20 transition-all hidden sm:flex">
                        <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        isExpired={plan?.trial.isExpired}
        title="Limit Reached"
        description={`Your current ${plan?.name} plan highlights essential logs. Upgrade to Unlock full monitoring capabilities and history.`}
      />
    </div>
  );
}
