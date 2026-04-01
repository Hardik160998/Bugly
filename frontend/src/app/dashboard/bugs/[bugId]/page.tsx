"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Bug, ArrowLeft, Image as ImageIcon, Send, Monitor, MonitorSmartphone, Globe, ArrowRight, CheckCircle2, X, Maximize2, ExternalLink, FolderKanban, Clock } from 'lucide-react';
import api from '@/lib/api';
import { StatusSelect } from '@/components/ui/StyledSelect';
import { useNotifStore } from '@/lib/store';

interface Comment {
  id: string;
  message: string;
  createdAt: string;
  user: { name: string };
}

interface StatusHistory {
  id: string;
  fromStatus: string;
  toStatus: string;
  changedAt: string;
  user: { id: string; name: string };
}

interface BugReport {
  id: string;
  title: string;
  description: string;
  status: string;
  screenshotData: string | null;
  url: string | null;
  browser: string | null;
  os: string | null;
  screen: string | null;
  createdAt: string;
  comments: Comment[];
  statusHistory: StatusHistory[];
  project: { name: string };
}

const STATUS_COLORS: Record<string, string> = {
  'Open': 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30',
  'In Progress': 'bg-brand-50 text-brand-600 border-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-900/30',
  'Resolved': 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30',
  'Closed': 'bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/60',
};

function BugDetailShimmer() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="flex items-center gap-6">
        <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-gray-800" />
        <div className="space-y-3 flex-1">
          <div className="h-8 w-1/3 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          <div className="h-4 w-1/4 bg-gray-50 dark:bg-gray-900 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
            <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-3xl" />
            <div className="space-y-4">
                <div className="h-6 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                <div className="h-4 w-full bg-gray-50 dark:bg-gray-900 rounded" />
                <div className="h-4 w-full bg-gray-50 dark:bg-gray-900 rounded" />
            </div>
        </div>
        <div className="space-y-10">
            <div className="h-48 bg-gray-50 dark:bg-gray-900 rounded-3xl" />
            <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export default function BugDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [bug, setBug] = useState<BugReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const markSeen = useNotifStore(s => s.markSeen);

  const fetchBug = () => {
    if (!params?.bugId) return;
    api.get(`/bugs/${params.bugId}`).then(res => {
      setBug(res.data);
      markSeen(params.bugId as string);
    }).catch((err) => {
      setError(err.response?.data?.error || err.message || 'Failed to load bug');
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBug(); }, [params?.bugId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!bug) return;
    try {
      await api.patch(`/bugs/${bug.id}/status`, { status: newStatus });
      fetchBug();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bug || !commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/bugs/${bug.id}/comments`, { message: commentText });
      setBug({ ...bug, comments: [...bug.comments, { ...res.data, user: { name: 'You' } }] });
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const openFullSize = () => {
    if (!bug?.screenshotData) return;
    const win = window.open();
    if (win) win.document.write(`<img src="${bug.screenshotData}" style="max-width:100%" />`);
  };

  if (loading) return <BugDetailShimmer />;
  if (!bug) return <div className="py-20 text-center font-bold text-rose-500 uppercase tracking-widest">{error || 'Incident not found.'}</div>;

  const resolver = bug.statusHistory.findLast(h => h.toStatus === 'Resolved');
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
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-6">
            <button 
                onClick={() => router.back()} 
                className="h-12 w-12 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm"
            >
                <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white truncate lg:max-w-xl">{bug.title}</h2>
                    <span className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest">{bug.id.slice(0, 8)}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><FolderKanban className="h-3 w-3" /> {bug.project.name}</span>
                    <span className="h-1 w-1 rounded-full bg-gray-200 dark:bg-gray-800" />
                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {new Date(bug.createdAt).toLocaleDateString()}</span>
                    {resolver && (
                        <span className="flex items-center gap-1.5 text-emerald-500">
                             <CheckCircle2 className="h-3.5 w-3.5" />
                             Resolved
                        </span>
                    )}
                </div>
            </div>
        </div>
        <div className="shrink-0">
          <StatusSelect value={bug.status} onChange={handleStatusChange} />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Col */}
        <div className="lg:col-span-2 space-y-10">
          {/* Main Content */}
          <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-premium overflow-hidden">
            <div className="p-10 border-b border-gray-50 dark:border-gray-800/60">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Screenshot Artifact</h3>
                {bug.screenshotData ? (
                    <div 
                        className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-900 relative group cursor-zoom-in aspect-video shadow-inner" 
                        onClick={() => setLightbox(true)}
                    >
                        <img src={bug.screenshotData} alt="Incident" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-brand-900/40 transition-all flex items-center justify-center backdrop-blur-0 group-hover:backdrop-blur-[2px]">
                            <span className="opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 bg-white text-gray-900 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl flex items-center gap-2 shadow-2xl">
                                <Maximize2 className="h-3.5 w-3.5" /> Expand View
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-gray-50 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50">
                        <ImageIcon className="h-10 w-10 text-gray-200 dark:text-gray-800 mb-4" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">No visual evidence provided</span>
                    </div>
                )}
            </div>
            <div className="p-10">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Detailed Description</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-loose whitespace-pre-wrap">{bug.description}</p>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-premium p-10">
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8">Activity Timeline</h3>
             {bug.statusHistory.length === 0 ? (
               <div className="py-10 text-center bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Initial logging initiated</p>
               </div>
             ) : (
               <div className="space-y-8 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-50 dark:before:bg-gray-900">
                 {[...bug.statusHistory].reverse().map(h => (
                   <div key={h.id} className="relative pl-10">
                     <div className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border-4 border-white dark:border-gray-950 z-10 ${
                         h.toStatus === 'Resolved' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 
                         h.toStatus === 'Closed' ? 'bg-gray-400' : 
                         h.toStatus === 'In Progress' ? 'bg-brand-500 shadow-lg shadow-brand-500/20' : 'bg-rose-500'
                     }`} />
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                           <span className="text-sm font-bold text-gray-900 dark:text-white">{h.user.name}</span>
                           <span className="text-[10px] whitespace-nowrap px-3 py-1 rounded-lg font-bold uppercase tracking-widest bg-gray-50 dark:bg-gray-900 text-gray-400 border border-gray-100 dark:border-gray-800">
                                {h.fromStatus} <ArrowRight className="inline h-2.5 w-2.5 mx-1" /> {h.toStatus}
                           </span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(h.changedAt).toLocaleString()}</span>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-10">
          {/* Environment */}
          <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-premium p-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 dark:border-gray-800/60 pb-4">Diagnostics</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400">
                    <Globe className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Source URL</p>
                  <a href={bug.url || '#'} className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline truncate block" target="_blank" rel="noreferrer">{bug.url || 'Internal Platform'}</a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400">
                    <Monitor className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">User Agent</p>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{bug.browser || 'Generic'} on {bug.os || 'N/A'}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400">
                    <MonitorSmartphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Viewport</p>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{bug.screen || 'Fluid'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-premium flex flex-col h-[500px]">
             <div className="p-8 border-b border-gray-50 dark:border-gray-800/60">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Internal Thread</h3>
             </div>
             <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {bug.comments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                         <Send className="h-8 w-8 text-gray-300 mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-widest">No active discussion</p>
                    </div>
                ) : (
                    bug.comments.map(c => (
                        <div key={c.id} className="space-y-2">
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{c.user.name}</span>
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{timeAgo(c.createdAt)} ago</span>
                           </div>
                           <div className="bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/60">
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{c.message}</p>
                           </div>
                        </div>
                    ))
                )}
             </div>
             <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-50 dark:border-gray-800/60">
                <form onSubmit={handleAddComment} className="relative">
                  <input
                    type="text"
                    placeholder="Dispatch message..."
                    className="w-full rounded-2xl border-0 py-3.5 pl-5 pr-14 text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-950 shadow-sm ring-1 ring-inset ring-gray-100 dark:ring-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 transition-all"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={submitting || !commentText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 disabled:opacity-50 transition-all shadow-lg shadow-brand-600/20"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
             </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && bug.screenshotData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/90 backdrop-blur-md p-8 animate-in fade-in duration-300" onClick={() => setLightbox(false)}>
          <div className="relative max-w-7xl w-full animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-white" />
                 </div>
                 <span className="text-white text-xs font-black uppercase tracking-widest">Evidence Viewer</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={openFullSize}
                  className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white text-white hover:text-gray-950 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all border border-white/20"
                >
                  <ExternalLink className="h-4 w-4" /> Raw File
                </button>
                <button onClick={() => setLightbox(false)} className="h-12 w-12 rounded-xl bg-white/10 hover:bg-rose-500 text-white flex items-center justify-center transition-all border border-white/20">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 overflow-hidden bg-gray-900 shadow-2xl">
                <img src={bug.screenshotData} alt="Incident" className="w-full h-auto max-h-[80vh] object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
