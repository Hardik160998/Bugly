"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Bug, ArrowLeft, Image as ImageIcon, Send, Monitor, MonitorSmartphone, Globe, ArrowRight, CheckCircle2, X, Maximize2, ExternalLink } from 'lucide-react';
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
  'Open': 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Resolved': 'bg-green-100 text-green-700',
  'Closed': 'bg-gray-100 text-gray-600',
};

function BugDetailShimmer() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0" />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left */}
        <div className="lg:flex-[2] bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200 dark:ring-gray-800 p-6 space-y-8">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-4/6 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>

        {/* Right */}
        <div className="lg:flex-[1] flex flex-col gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200 dark:ring-gray-800 p-5 space-y-4">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200 dark:ring-gray-800 p-5 space-y-3">
            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-700 mt-1 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200 dark:ring-gray-800 p-5 space-y-3">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
            <div className="flex gap-2 pt-1">
              <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-700 rounded-md" />
              <div className="h-9 w-10 bg-gray-200 dark:bg-gray-700 rounded-md" />
            </div>
          </div>
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

  if (loading) return <BugDetailShimmer />;
  if (!bug) return <div className="py-12 text-center text-sm text-red-500">{error || 'Bug not found.'}</div>;

  const resolver = bug.statusHistory.findLast(h => h.toStatus === 'Resolved');

  const openFullSize = () => {
    if (!bug.screenshotData) return;
    const win = window.open();
    if (win) win.document.write(`<img src="${bug.screenshotData}" style="max-width:100%" />`);
  };

  return (
    <div className="space-y-4 flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors self-start shrink-0">
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white break-words">{bug.title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
            <span>Project: <span className="font-semibold text-gray-700 dark:text-gray-300">{bug.project.name}</span></span>
            <span className="hidden sm:inline">&middot;</span>
            <span>{new Date(bug.createdAt).toLocaleString()}</span>
            {resolver && (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Resolved by {resolver.user.name}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <StatusSelect value={bug.status} onChange={handleStatusChange} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left: description + screenshot */}
        <div className="lg:flex-[2] bg-white dark:bg-gray-900 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 p-4 sm:p-6 space-y-8">
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2 border-b border-gray-100 dark:border-gray-800 pb-2">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{bug.description}</p>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Screenshot</h3>
            {bug.screenshotData ? (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800 relative group cursor-zoom-in" onClick={() => setLightbox(true)}>
                <img src={bug.screenshotData} alt="Bug Screenshot" className="max-w-full h-auto object-contain" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
                    <Maximize2 className="h-3.5 w-3.5" /> Click to enlarge
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                <ImageIcon className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400">No screenshot attached</span>
              </div>
            )}
          </section>
        </div>

        {/* Right: env + activity + comments */}
        <div className="lg:flex-[1] flex flex-col gap-4">
          {/* Environment */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 p-5 space-y-3 shrink-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Environment</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Globe className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                <div className="flex-1 truncate">
                  <span className="block font-medium text-gray-900 dark:text-white">URL</span>
                  <a href={bug.url || '#'} className="text-blue-600 hover:underline truncate block" target="_blank" rel="noreferrer">{bug.url || 'N/A'}</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Monitor className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <span className="block font-medium text-gray-900 dark:text-white">Browser & OS</span>
                  <span className="text-gray-600 dark:text-gray-400 truncate block">{bug.browser || 'N/A'} on {bug.os || 'N/A'}</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MonitorSmartphone className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <span className="block font-medium text-gray-900 dark:text-white">Screen Size</span>
                  <span className="text-gray-600 dark:text-gray-400">{bug.screen || 'N/A'}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Status Activity */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 p-5 shrink-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">Status Activity</h3>
            {bug.statusHistory.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500">No status changes yet.</p>
            ) : (
              <ol className="space-y-3">
                {bug.statusHistory.map(h => (
                  <li key={h.id} className="flex items-start gap-2 text-xs">
                    <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${h.toStatus === 'Resolved' ? 'bg-green-500' : h.toStatus === 'Closed' ? 'bg-gray-400' : h.toStatus === 'In Progress' ? 'bg-blue-500' : 'bg-amber-400'}`} />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900 dark:text-white">{h.user.name}</span>
                      <span className="text-gray-500 dark:text-gray-400"> changed </span>
                      <span className={`inline-flex items-center rounded px-1.5 py-0.5 font-medium ${STATUS_COLORS[h.fromStatus] || 'bg-gray-100 text-gray-600'}`}>{h.fromStatus}</span>
                      <ArrowRight className="inline h-3 w-3 mx-1 text-gray-400" />
                      <span className={`inline-flex items-center rounded px-1.5 py-0.5 font-medium ${STATUS_COLORS[h.toStatus] || 'bg-gray-100 text-gray-600'}`}>{h.toStatus}</span>
                      {h.toStatus === 'Resolved' && <span className="ml-1 text-green-600 font-semibold">✓ Resolved</span>}
                      <span className="block text-gray-400 dark:text-gray-500 mt-0.5">{new Date(h.changedAt).toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 p-5 flex flex-col">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">Comments</h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {bug.comments.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No comments yet.</p>
              ) : (
                bug.comments.map(c => (
                  <div key={c.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">{c.user.name}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{c.message}</p>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleAddComment} className="mt-4 shrink-0 flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 rounded-md border-0 py-1.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && bug.screenshotData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setLightbox(false)}>
          <div className="relative max-w-6xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-medium">Screenshot</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={openFullSize}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View Full Size
                </button>
                <button onClick={() => setLightbox(false)} className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-lg transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <img src={bug.screenshotData} alt="Bug Screenshot" className="w-full h-auto max-h-[85vh] object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}
