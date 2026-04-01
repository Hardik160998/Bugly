"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  FolderKanban, 
  MoreVertical, 
  ExternalLink, 
  Trash2, 
  Copy, 
  X, 
  UserPlus, 
  Users, 
  Crown, 
  Bug, 
  CheckCircle, 
  AlertCircle, 
  Calendar 
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { ProjectsShimmer } from '@/components/ui/Shimmer';
import UpgradeModal from '@/components/ui/UpgradeModal';

interface Member {
  id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  domain: string;
  createdAt: string;
  ownerId: string;
  isOwner: boolean;
  owner: { id: string; name: string; email: string };
  _count: { bugs: number };
  _openCount: number;
}

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Share modal state
  const [shareProjectId, setShareProjectId] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      const [pRes, statsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/auth/profile/stats')
      ]);
      setProjects(pRes.data);
      setPlan(statsRes.data.plan);
      
      // Auto-show expired modal
      if (statsRes.data.plan.trial.isExpired) {
        setShowUpgradeModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openShareModal = async (projectId: string) => {
    if (plan && plan.limits.maxTeamMembers <= 0) {
      setOpenMenuId(null);
      setShowUpgradeModal(true);
      return;
    }
    setShareProjectId(projectId);
    setShareEmail('');
    setMembersLoading(true);
    try {
      const res = await api.get(`/projects/${projectId}/members`);
      setMembers(res.data);
    } catch {
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setShareError('');
    setSharing(true);
    try {
      const res = await api.post(`/projects/${shareProjectId}/members`, { email: shareEmail });
      setMembers(prev => [...prev, res.data.user]);
      setShareEmail('');
    } catch (err: any) {
      setShareError(err.response?.data?.error || 'Failed to share project');
    } finally {
      setSharing(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await api.delete(`/projects/${shareProjectId}/members/${userId}`);
      setMembers(prev => prev.filter(m => m.id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const res = await api.post('/projects', { name, domain });
      setProjects(prev => [res.data, ...prev]);
      setShowModal(false);
      setName('');
      setDomain('');
    } catch (err: any) {
      setCreateError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project and all its bugs?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
    setOpenMenuId(null);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    setOpenMenuId(null);
  };

  const inputClass = "w-full rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all";

  return (
    <div className="space-y-10">
      {/* Trial Banner */}
      {plan && !plan.trial.isExpired && plan.name === 'free' && plan.trial.daysRemaining <= 3 && (
        <div className="flex items-center justify-between gap-4 rounded-3xl bg-brand-600 p-6 text-white shadow-xl shadow-brand-600/20 relative overflow-hidden group">
          <div className="flex items-center gap-4 relative z-10">
            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">Trial ending soon</p>
              <p className="text-sm text-brand-100 font-medium opacity-90">You have {plan.trial.daysRemaining} days left. Upgrade to maintain your premium features.</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/dashboard/billing')}
            className="relative z-10 rounded-xl bg-white px-6 py-2.5 text-xs font-bold text-brand-600 hover:bg-brand-50 transition-all uppercase tracking-widest shadow-lg"
          >
            Upgrade Now
          </button>
          <Bug className="absolute -right-8 -bottom-8 h-40 w-40 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Projects</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Manage your monitored environments and team access.</p>
        </div>
        <div className="flex items-center gap-6">
          {!loading && plan && (
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2">Workspace limit</span>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-32 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                        (projects.filter(p => p.isOwner).length / plan.limits.maxProjects) > 0.8 ? 'bg-rose-500' : 'bg-brand-600'
                    }`} 
                    style={{ width: `${Math.min(100, (projects.filter(p => p.isOwner).length / plan.limits.maxProjects) * 100)}%` }} 
                  />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {projects.filter(p => p.isOwner).length}<span className="text-gray-400 font-medium mx-1">/</span>{plan.limits.maxProjects === Infinity ? '∞' : plan.limits.maxProjects}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => {
              if (plan?.trial.isExpired) {
                setShowUpgradeModal(true);
              } else if (plan && projects.filter(p => p.isOwner).length >= plan.limits.maxProjects) {
                setShowUpgradeModal(true);
              } else {
                setShowModal(true);
              }
            }}
            className="flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-xs font-bold text-white hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 uppercase tracking-widest"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>
      </div>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        isExpired={plan?.trial.isExpired}
        title={plan?.trial.isExpired ? "Trial Expired" : "Project Limit Reached"}
        description={
          plan?.trial.isExpired
            ? `Your free trial has ended. Upgrade to a paid plan to continue using Bugly.`
            : `Your current ${plan?.name} plan allows up to ${plan?.limits.maxProjects} projects. Upgrade to unlock more projects and keep building!`
        }
      />

      {/* Project grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <ProjectsShimmer />
        ) : projects.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl py-24 bg-white dark:bg-gray-950">
            <div className="h-20 w-20 rounded-3xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-6">
                <FolderKanban className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">No projects yet</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Create your first project to start monitoring bugs.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-8 flex items-center gap-2 rounded-2xl bg-gray-900 dark:bg-white px-8 py-3 text-xs font-bold text-white dark:text-gray-900 hover:opacity-90 transition-all uppercase tracking-widest"
            >
              <Plus className="h-4 w-4" />
              Get Started
            </button>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              onClick={() => router.push(`/dashboard/bugs?project=${project.id}`)}
              className="group rounded-3xl border border-gray-100 dark:border-gray-800/60 bg-white dark:bg-gray-950 p-8 shadow-premium hover:shadow-2xl hover:border-brand-200 dark:hover:border-brand-800/60 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 shadow-sm border border-brand-100 dark:border-brand-900/30 group-hover:scale-110 transition-transform duration-500">
                    <FolderKanban className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white truncate lg:max-w-[140px]">{project.name}</h3>
                      {!project.isOwner && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                          Shared
                        </span>
                      )}
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-medium">
                      <ExternalLink className="h-3 w-3" />
                      <span className="truncate max-w-[120px]">{project.domain}</span>
                    </p>
                  </div>
                </div>

                {/* Three-dot menu */}
                <div className="relative" ref={openMenuId === project.id ? menuRef : null}>
                  <button
                    onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === project.id ? null : project.id); }}
                    className="text-gray-300 hover:text-gray-600 dark:hover:text-gray-400 p-2 rounded-xl transition-colors"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  {openMenuId === project.id && (
                    <div onClick={e => e.stopPropagation()} className="absolute right-0 top-12 z-20 w-52 rounded-2xl border border-gray-100 dark:border-gray-800/60 bg-white dark:bg-gray-900 shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200">
                      <button
                        onClick={() => handleCopyId(project.id)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                        {copied === project.id ? 'Stored!' : 'Copy API Key'}
                      </button>
                      {project.isOwner && (
                        <>
                          <button
                            onClick={() => openShareModal(project.id)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <UserPlus className="h-4 w-4" />
                            Invite Team
                          </button>
                          <div className="my-1 border-t border-gray-50 dark:border-gray-800" />
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            Purge Project
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-10 flex items-end justify-between relative z-10">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{project._count?.bugs}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Logs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {project._openCount > 0 ? (
                       <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-900/20 px-3 py-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 uppercase tracking-widest">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                        {project._openCount} Action Required
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 uppercase tracking-widest">
                        <CheckCircle className="h-3 w-3" />
                        System Healthy
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Created</p>
                   <p className="text-xs font-bold text-gray-600 dark:text-gray-300">{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-brand-500/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
            </div>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 p-10 shadow-2xl border border-gray-100 dark:border-gray-800/60 animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">New Project</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Add a new environment to monitor</p>
              </div>
              <button 
                onClick={() => { setShowModal(false); setCreateError(''); }} 
                className="h-10 w-10 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-6">
              {createError && (
                <div className="rounded-xl bg-rose-50 p-4 border border-rose-100 text-xs font-bold text-rose-600 uppercase tracking-widest">{createError}</div>
              )}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Identify as</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Production Alpha" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Monitoring Domain</label>
                <input type="text" required value={domain} onChange={e => setDomain(e.target.value)} placeholder="app.domain.com" className={inputClass} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setCreateError(''); }} className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-800 px-6 py-3 text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all uppercase tracking-widest">Discard</button>
                <button type="submit" disabled={creating} className="flex-1 rounded-2xl bg-brand-600 px-6 py-3 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-60 transition-all shadow-lg shadow-brand-600/20 uppercase tracking-widest">
                  {creating ? 'Building...' : 'Initiate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Project Modal */}
      {shareProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 p-10 shadow-2xl border border-gray-100 dark:border-gray-800/60 animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Team Access</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Invite colleagues to this workspace</p>
              </div>
              <button 
                onClick={() => setShareProjectId(null)} 
                className="h-10 w-10 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleShare} className="flex gap-3 mb-8">
              <input
                type="email"
                required
                value={shareEmail}
                onChange={e => { setShareEmail(e.target.value); setShareError(''); }}
                placeholder="email@company.com"
                className="flex-1 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              />
              <button type="submit" disabled={sharing} className="rounded-xl bg-brand-600 px-4 py-2.5 text-[10px] font-black text-white hover:bg-brand-700 disabled:opacity-60 transition-all uppercase tracking-widest">
                {sharing ? '...' : 'Send'}
              </button>
            </form>

            {shareError && <p className="mb-6 rounded-xl bg-rose-50 p-4 border border-rose-100 text-[10px] font-bold text-rose-600 uppercase tracking-widest">{shareError}</p>}

            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorized Members</p>
              {membersLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : members.length === 0 ? (
                <div className="py-8 text-center bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">No collaborators yet</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {members.map(m => (
                    <li key={m.id} className="flex items-center justify-between rounded-2xl bg-gray-50/50 dark:bg-gray-950 px-4 py-3 border border-gray-50 dark:border-gray-800/60 group">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-xs font-black text-gray-400">
                            {m.name[0].toUpperCase()}
                         </div>
                         <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate lg:max-w-[180px]">{m.name}</p>
                            <p className="text-[10px] font-medium text-gray-400 truncate lg:max-w-[180px]">{m.email}</p>
                         </div>
                      </div>
                      <button onClick={() => handleRemoveMember(m.id)} className="text-gray-300 hover:text-rose-500 p-1 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
