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

  const inputClass = "mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account and integrations.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 divide-y divide-gray-100 dark:divide-gray-800">

        {/* Profile */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-1">
            <Users className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile Information</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Update your account's profile information and email address.</p>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white">Name</label>
                <input
                  type="text"
                  required
                  value={mounted ? name : ''}
                  onChange={e => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white">Email</label>
                <input
                  type="email"
                  required
                  value={mounted ? email : ''}
                  onChange={e => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {saveError && (
              <p className="mt-4 text-sm text-red-600">{saveError}</p>
            )}

            <div className="mt-6 flex items-center gap-4">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              {saveSuccess && (
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Saved successfully
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Integration snippet */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-1">
            <Key className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Widget Integration</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Enter your Project ID to generate the snippet. Copy it and paste it into your website's <code className="bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-1 rounded text-xs">&lt;body&gt;</code> tag.
          </p>

          <div className="mb-4 max-w-md">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Project ID</label>
            <input
              type="text"
              value={snippetProjectId}
              onChange={e => { setSnippetProjectId(e.target.value); setCopied(false); }}
              placeholder="Paste your project UUID here"
              className={inputClass}
            />
          </div>

          {/* Widget Position */}
          <div className="mb-6 max-w-md">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Widget Position</label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Choose where the "Report a Bug" button appears on your website.</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'top-left',     label: 'Top Left',     desc: 'Top-left corner of the page' },
                { value: 'top-right',    label: 'Top Right',    desc: 'Top-right corner of the page' },
                { value: 'bottom-left',  label: 'Bottom Left',  desc: 'Bottom-left corner of the page' },
                { value: 'bottom-right', label: 'Bottom Right', desc: 'Bottom-right corner — most common' },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setWidgetPosition(opt.value); setCopied(false); }}
                  className={`relative flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-left transition-all ${
                    widgetPosition === opt.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {/* Mini page preview */}
                  <div className="w-full h-14 bg-gray-100 dark:bg-gray-700 rounded relative border border-gray-200 dark:border-gray-600">
                    <div className={`absolute w-3 h-3 rounded-full bg-blue-500 ${
                      opt.value === 'top-left'     ? 'top-1 left-1' :
                      opt.value === 'top-right'    ? 'top-1 right-1' :
                      opt.value === 'bottom-left'  ? 'bottom-1 left-1' :
                                                     'bottom-1 right-1'
                    }`} />
                  </div>
                  <span className={`text-xs font-semibold ${ widgetPosition === opt.value ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300' }`}>{opt.label}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 leading-tight">{opt.desc}</span>
                  {widgetPosition === opt.value && (
                    <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="relative max-w-2xl">
            <div className="rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 font-mono text-xs text-gray-800 dark:text-gray-200 leading-relaxed select-all whitespace-pre pr-24">
              {snippet}
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(snippet); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="absolute top-2 right-2 flex items-center gap-1.5 rounded-md bg-white dark:bg-gray-700 px-2.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              {copied ? <><CheckCircle className="h-3.5 w-3.5 text-green-500" />Copied!</> : <><Copy className="h-3.5 w-3.5" />Copy</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
