"use client";

import { useEffect, useState } from 'react';
import { Copy, Key, Users, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function SettingsPage() {
  const { user, setUser, token } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [snippetProjectId, setSnippetProjectId] = useState('');
  const [widgetPosition, setWidgetPosition] = useState('bottom-right');
  const [copied, setCopied] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://bugly-backend.vercel.app/api' : (mounted ? `${window.location.origin.replace('3000', '5000')}/api` : 'http://localhost:5000/api'));
  const snippet = `<script\n  src="${mounted ? window.location.origin : 'http://localhost:3000'}/widget.js"\n  data-project-id="${snippetProjectId.trim() || 'YOUR_PROJECT_ID'}"\n  data-api-url="${apiUrl}"\n  data-position="${widgetPosition}"\n></script>`;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Populate fields once user is available after rehydration
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);
    setSaving(true);
    try {
      const res = await api.patch('/auth/profile', { name, email });
      setUser(res.data.user, token);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.response?.data?.error || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "block w-full rounded-2xl border-0 py-3.5 px-5 text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-900/50 shadow-sm ring-1 ring-inset ring-gray-100 dark:ring-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-xs font-bold transition-all";

  return (
    <div className="space-y-12 max-w-5xl">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Workspace Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Configure your environment and team integration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: General Settings */}
        <div className="lg:col-span-1 space-y-4">
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Global Profile</h3>
           <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">Update your professional identity and contact email associated with this workspace.</p>
        </div>

        <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-premium p-10">
                <form onSubmit={handleSave} className="space-y-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Name</label>
                            <input
                                type="text"
                                required
                                value={mounted ? name : ''}
                                onChange={e => { setName(e.target.value); setSaveSuccess(false); }}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Email</label>
                            <input
                                type="email"
                                required
                                value={mounted ? email : ''}
                                onChange={e => { setEmail(e.target.value); setSaveSuccess(false); }}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {saveError && (
                        <div className="rounded-xl bg-rose-50 p-4 border border-rose-100 text-[10px] font-bold text-rose-600 uppercase tracking-widest">{saveError}</div>
                    )}

                    <div className="pt-4 flex items-center gap-6">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-2xl bg-brand-600 px-8 py-4 text-xs font-bold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 disabled:opacity-60 transition-all uppercase tracking-widest"
                        >
                            {saving ? 'Syncing...' : 'Update Profile'}
                        </button>
                        {saveSuccess && (
                            <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-in fade-in slide-in-from-left-4 duration-500">
                                <CheckCircle className="h-4 w-4" />
                                Synchronized
                            </span>
                        )}
                    </div>
                </form>
            </div>
        </div>

        <div className="col-span-full border-t border-gray-50 dark:border-gray-900/50 my-4" />

        {/* Integration */}
        <div className="lg:col-span-1 space-y-4">
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">SDK Integration</h3>
           <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">Embed the monitoring agent into your production environment. Paste the artifact ID and choose your UI preference.</p>
        </div>

        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-premium p-10 space-y-10">
                <div className="max-w-md space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Active Artifact ID</label>
                    <input
                        type="text"
                        value={snippetProjectId}
                        onChange={e => { setSnippetProjectId(e.target.value); setCopied(false); }}
                        placeholder="00000000-0000-0000-0000-000000000000"
                        className={inputClass}
                    />
                </div>

                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observer Position</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {([
                        { value: 'top-left',     label: 'T-Left' },
                        { value: 'top-right',    label: 'T-Right' },
                        { value: 'bottom-left',  label: 'B-Left' },
                        { value: 'bottom-right', label: 'B-Right' },
                    ] as const).map(opt => (
                        <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setWidgetPosition(opt.value); setCopied(false); }}
                        className={`group relative flex flex-col items-center gap-3 rounded-2xl border-2 p-3 transition-all ${
                            widgetPosition === opt.value
                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/20'
                            : 'border-gray-50 dark:border-gray-900 bg-white dark:bg-gray-950 hover:border-brand-200 dark:hover:border-brand-800'
                        }`}
                        >
                        <div className="w-full h-10 bg-gray-50 dark:bg-gray-900 rounded-lg relative overflow-hidden border border-gray-100 dark:border-gray-800 shadow-inner">
                            <div className={`absolute w-2 h-2 rounded-full bg-brand-500 shadow-sm shadow-brand-500/50 transition-all duration-500 ${
                            opt.value === 'top-left'     ? 'top-1 left-1' :
                            opt.value === 'top-right'    ? 'top-1 right-1' :
                            opt.value === 'bottom-left'  ? 'bottom-1 left-1' :
                                                            'bottom-1 right-1'
                            }`} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${ widgetPosition === opt.value ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 group-hover:text-gray-600' }`}>{opt.label}</span>
                        </button>
                    ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between ml-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Integration Payload</label>
                        <button
                            onClick={() => { navigator.clipboard.writeText(snippet); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                            className="flex items-center gap-2 text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest hover:opacity-70 transition-all"
                        >
                            {copied ? <><CheckCircle className="h-3.5 w-3.5" /> Copied Artifact</> : <><Copy className="h-3.5 w-3.5" /> Duplicate Script</>}
                        </button>
                    </div>
                    <div className="group relative">
                         <div className="rounded-2xl bg-gray-900 dark:bg-black p-8 font-mono text-[11px] text-brand-400/80 leading-relaxed overflow-x-auto border border-gray-800 shadow-2xl custom-scrollbar-mini">
                            <pre className="whitespace-pre">{snippet}</pre>
                         </div>
                         <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-rose-500/40 animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
