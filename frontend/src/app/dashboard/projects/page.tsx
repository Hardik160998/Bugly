"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FolderKanban, MoreVertical, ExternalLink, Trash2, Copy, X, UserPlus, Users, Crown } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { ProjectsShimmer } from '@/components/ui/Shimmer';
import UpgradeModal from '@/components/ui/UpgradeModal';
import { AlertCircle, Calendar } from 'lucide-react';

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

  const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-6">
      {/* Trial Banner */}
      {plan && !plan.trial.isExpired && plan.name === 'free' && plan.trial.daysRemaining <= 3 && (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-blue-600 p-4 text-white shadow-lg shadow-blue-600/20">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2">
              <Calendar className="h-5 w-5" />
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Projects</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your active projects and domains.</p>
        </div>
        <div className="flex items-center gap-4">
          {!loading && plan && (
            <div className="flex flex-col items-end mr-4">
              <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Project Usage</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-32 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                        (projects.filter(p => p.isOwner).length / plan.limits.maxProjects) > 0.8 ? 'bg-amber-500' : 'bg-blue-600'
                    }`} 
                    style={{ width: `${Math.min(100, (projects.filter(p => p.isOwner).length / plan.limits.maxProjects) * 100)}%` }} 
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {projects.filter(p => p.isOwner).length} / {plan.limits.maxProjects === Infinity ? '∞' : plan.limits.maxProjects}
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
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <ProjectsShimmer />
        ) : projects.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl py-16 bg-white dark:bg-gray-900">
            <FolderKanban className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No projects found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new project.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </button>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              onClick={() => router.push(`/dashboard/bugs?project=${project.id}`)}
              className="rounded-xl border border-gray-100 dark:border-gray-800/60 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-2 ring-blue-100">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate w-28 md:w-40">{project.name}</h3>
                      {!project.isOwner && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-purple-200">
                          <Crown className="h-3 w-3" />{project.owner?.name}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <ExternalLink className="h-3 w-3" />
                      <a
                        href={project.domain.startsWith('http') ? project.domain : `https://${project.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-blue-600 hover:underline transition-colors"
                        onClick={e => e.stopPropagation()}
                      >
                        {project.domain}
                      </a>
                    </p>
                  </div>
                </div>

                {/* Three-dot menu */}
                <div className="relative" ref={openMenuId === project.id ? menuRef : null}>
                  <button
                    onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === project.id ? null : project.id); }}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  {openMenuId === project.id && (
                    <div onClick={e => e.stopPropagation()} className="absolute right-0 top-8 z-10 w-44 rounded-lg border border-gray-100 dark:border-gray-800/60 bg-white dark:bg-gray-900 shadow-lg py-1">
                      <button
                        onClick={() => handleCopyId(project.id)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Copy className="h-4 w-4" />
                        {copied === project.id ? 'Copied!' : 'Copy Project ID'}
                      </button>
                      {project.isOwner && (
                        <>
                          <button
                            onClick={() => openShareModal(project.id)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <UserPlus className="h-4 w-4" />
                            Share Project
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Project
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  {project._count?.bugs === 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-green-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      All clear
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-white">{project._count?.bugs}</span> total
                      </span>
                      {project._openCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          {project._openCount} open
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Project</h3>
              <button onClick={() => { setShowModal(false); setCreateError(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {createError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{createError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="My Website" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Domain</label>
                <input type="text" required value={domain} onChange={e => setDomain(e.target.value)} placeholder="mywebsite.com" className={inputClass} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setCreateError(''); }} className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60">
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Project Modal */}
      {shareProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Share Project</h3>
              </div>
              <button onClick={() => setShareProjectId(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleShare} className="flex gap-2 mb-6">
              <input
                type="email"
                required
                value={shareEmail}
                onChange={e => { setShareEmail(e.target.value); setShareError(''); }}
                placeholder="colleague@example.com"
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" disabled={sharing} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60">
                {sharing ? '...' : 'Invite'}
              </button>
            </form>

            {shareError && <p className="mb-4 text-sm text-red-600">{shareError}</p>}

            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Members with access</p>
              {membersLoading ? (
                <p className="text-sm text-gray-400">Loading...</p>
              ) : members.length === 0 ? (
                <p className="text-sm text-gray-400">No members yet. Invite someone above.</p>
              ) : (
                <ul className="space-y-2">
                  {members.map(m => (
                    <li key={m.id} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{m.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{m.email}</p>
                      </div>
                      <button onClick={() => handleRemoveMember(m.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X className="h-4 w-4" />
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
