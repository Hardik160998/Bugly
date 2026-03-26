"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BugListShimmer } from '@/components/ui/Shimmer';
import StyledSelect from '@/components/ui/StyledSelect';
import UpgradeModal from '@/components/ui/UpgradeModal';
import { Zap, AlertTriangle, Calendar, Search, Clock, Bug } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Project { id: string; name: string; }
interface BugReport { id: string; title: string; status: string; createdAt: string; browser: string; os: string; }

const STATUSES = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

const STATUS_STYLES: Record<string, string> = {
  'Open': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'In Progress': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  'Resolved': 'bg-green-50 text-green-700 ring-green-600/20',
  'Closed': 'bg-gray-50 text-gray-600 ring-gray-500/10',
};

const TAB_ACTIVE: Record<string, string> = {
  'All': 'border-blue-600 text-blue-600',
  'Open': 'border-amber-500 text-amber-600',
  'In Progress': 'border-blue-500 text-blue-600',
  'Resolved': 'border-green-500 text-green-600',
  'Closed': 'border-gray-400 text-gray-600',
};

export default function BugsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState('Open');
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/projects'),
      api.get('/auth/profile/stats')
    ]).then(([pRes, sRes]) => {
      setProjects(pRes.data);
      setPlan(sRes.data.plan);
      
      if (sRes.data.plan.trial.isExpired) {
        setShowUpgradeModal(true);
      }

      const fromQuery = searchParams.get('project');
      const match = pRes.data.find((p: Project) => p.id === fromQuery);
      setSelectedProjectId(match ? match.id : pRes.data[0]?.id ?? '');
    }).catch(console.error).finally(() => setIsInitializing(false));
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    api.get(`/projects/${selectedProjectId}/bugs`)
      .then(res => setBugs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedProjectId]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: bugs.length };
    STATUSES.slice(1).forEach(s => { c[s] = bugs.filter(b => b.status === s).length; });
    return c;
  }, [bugs]);

  const filtered = useMemo(() => bugs.filter(b => {
    const matchStatus = activeStatus === 'All' || b.status === activeStatus;
    const matchSearch = !search.trim() || b.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  }), [bugs, activeStatus, search]);

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Bugs & Feedback</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track, manage, and resolve user reports.</p>
        </div>
        <StyledSelect
          value={selectedProjectId}
          onChange={val => { setSelectedProjectId(val); setActiveStatus('Open'); setSearch(''); }}
          options={isInitializing
            ? [{ value: '', label: 'Loading projects...' }]
            : projects.length === 0
              ? [{ value: '', label: 'No projects' }]
              : projects.map(p => ({ value: p.id, label: p.name }))
          }
          className="w-full sm:w-auto"
        />
      </div>

      {/* Trial Banner */}
      {plan && !plan.trial.isExpired && plan.name === 'free' && plan.trial.daysRemaining <= 3 && (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-blue-600 p-4 text-white shadow-lg shadow-blue-600/20">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold">Trial Ending Soon!</p>
              <p className="text-xs text-blue-100">You have {plan.trial.daysRemaining} days left in your free trial. Upgrade now to avoid any interruption.</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/dashboard/billing')}
            className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
          >
            Upgrade Now
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800/60 flex-1 flex flex-col overflow-hidden">
        {/* Plan Limit Banner */}
        {!loading && plan && plan.limits.maxBugsPerMonth !== Infinity && bugs.length >= plan.limits.maxBugsPerMonth && (
          <div className="mx-4 mt-4 sm:mx-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-950 rounded-lg shadow-sm">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Bug Report Limit Reached</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This project has reached its monthly limit of {plan.limits.maxBugsPerMonth} reports. Upgrade to keep receiving feedback.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
            >
              Upgrade Now
            </button>
          </div>
        )}

        {/* Search */}
        <div className="px-4 pt-4 pb-0 sm:px-6">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search bugs..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 dark:text-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            />
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex gap-0 border-b border-gray-200 dark:border-gray-800 mt-3 px-4 sm:px-6 overflow-x-auto">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeStatus === s
                  ? TAB_ACTIVE[s]
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'
              }`}
            >
              {s}
              <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                activeStatus === s ? 'bg-current/10' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}>
                {counts[s] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <BugListShimmer />
          ) : bugs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 mb-4">
                <Bug className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">No bugs reported yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                {projects.find(p => p.id === selectedProjectId)?.name ?? 'This project'} is all clear.
                Install the widget on your site to start collecting bug reports.
              </p>
              <Link
                href="/dashboard/settings"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                Get widget snippet
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
              <Bug className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No bugs found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {search ? 'No bugs match your search.' : `No ${activeStatus === 'All' ? '' : activeStatus.toLowerCase() + ' '}bugs for this project.`}
              </p>
            </div>
          ) : (
            <ul role="list" className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(bug => (
                <li key={bug.id} className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 sm:px-6 transition-colors cursor-pointer">
                  <div className="flex min-w-0 gap-x-4 items-center">
                    <div className="h-10 w-10 flex-none rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                      <Bug className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                        <Link href={`/dashboard/bugs/${bug.id}`}>
                          <span className="absolute inset-x-0 -top-px bottom-0" />
                          {bug.title}
                        </Link>
                      </p>
                      <p className="mt-1 flex text-xs leading-5 text-gray-500 dark:text-gray-400 gap-2 items-center">
                        <span>{bug.browser || 'Unknown Browser'}</span>
                        <span>&middot;</span>
                        <span>{bug.os || 'Unknown OS'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-x-4">
                    <div className="hidden sm:flex sm:flex-col sm:items-end">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[bug.status] || 'bg-gray-50 text-gray-600 ring-gray-500/10'}`}>
                        {bug.status}
                      </span>
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        {new Date(bug.createdAt).toLocaleDateString()}
                      </p>
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
        title="Bug Report Limit Reached"
        description={`Your current ${plan?.name} plan is capped at ${plan?.limits.maxBugsPerMonth} reports per month. Upgrade to Pro for unlimited bug reports and advanced features!`}
      />
    </div>
  );
}
