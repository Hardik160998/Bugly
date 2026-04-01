"use client";

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Bug, LogOut, X, Menu, Sun, Moon, Search, ChevronDown, CheckCircle, UserCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore, useNotifStore, useThemeStore } from '@/lib/store';

interface Notification {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  project: { name: string };
}

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/projects': 'Projects',
  '/dashboard/bugs': 'Bugs & Feedback',
  '/dashboard/settings': 'Settings',
};

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const { dark, toggle: toggleTheme } = useThemeStore();

  const [open, setOpen] = useState(false); // notifications
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { seenIds, rehydrateNotifs, markAllSeen } = useNotifStore();
  const ref = useRef<HTMLDivElement>(null); // notifications
  const profileRef = useRef<HTMLDivElement>(null);

  const title = Object.entries(TITLES).findLast(([key]) => pathname?.startsWith(key))?.[1] ?? 'Dashboard';

  useEffect(() => { rehydrateNotifs(); }, []);

  const fetchNotifications = () => {
    api.get('/projects/stats')
      .then(res => setNotifications(
        res.data.recentBugs.filter((b: Notification) => b.status === 'Open')
      ))
      .catch(console.error);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.get('/projects/stats')
      .then(res => {
        const openBugs = res.data.recentBugs.filter((b: Notification) => b.status === 'Open');
        setNotifications(openBugs);
        markAllSeen(openBugs.map((b: Notification) => b.id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open]);

  const newCount = notifications.filter(n => !seenIds.has(n.id)).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 dark:border-gray-800/60 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center flex-1 gap-4">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search dashboard..."
            className="block w-full rounded-2xl border-0 py-2.5 pl-11 pr-3 text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-900/50 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-xs font-medium transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-brand-600 transition-all"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(o => !o)}
            className="relative rounded-xl p-2.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-brand-600 transition-all"
          >
            {newCount > 0 && (
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white dark:ring-gray-950" />
            )}
            <span className="sr-only">Notifications</span>
            <Bell className="h-5 w-5" />
          </button>

          {open && (
            <div className="fixed left-4 right-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-14 z-50 sm:w-96 max-w-sm sm:max-w-none mx-auto rounded-3xl border border-gray-100 dark:border-gray-800/60 bg-white dark:bg-gray-900 shadow-2xl sm:origin-top-right animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 dark:border-gray-800/60">
                <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Alerts</span>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 p-8 text-center font-bold animate-pulse">Checking...</p>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-gray-400 bg-gray-50/30 dark:bg-gray-900/30">
                    <div className="h-12 w-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mb-3 shadow-sm">
                        <CheckCircle className="h-6 w-6 text-emerald-500" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Inbox Clear</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {notifications.map(n => (
                      <li key={n.id}>
                        <Link
                          href={`/dashboard/bugs/${n.id}`}
                          onClick={() => setOpen(false)}
                          className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group"
                        >
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30">
                            <Bug className="h-4 w-4 text-rose-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-600 transition-colors">{n.title}</p>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest">
                              {n.project.name} • {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t border-gray-50 dark:border-gray-800/60 p-4 bg-gray-50/50 dark:bg-gray-900/50">
                <Link
                  href="/dashboard/bugs"
                  onClick={() => setOpen(false)}
                  className="block text-center text-[10px] font-bold text-brand-600 hover:text-brand-700 uppercase tracking-widest transition-colors"
                >
                  See all background reports
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-2xl p-1 pr-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
          >
            <div className="h-9 w-9 rounded-xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-premium group-hover:scale-105 transition-transform">
              <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=3758ff&color=ffffff&bold=true`} alt="avatar" />
            </div>
            <div className="hidden md:block text-left ml-1">
              <p className="text-xs font-bold text-gray-900 dark:text-white leading-none mb-0.5">{user?.name || 'User'}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user?.plan || 'Free'}</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-14 z-50 w-56 rounded-3xl border border-gray-100 dark:border-gray-800/60 bg-white dark:bg-gray-900 shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800/50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Connected as</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.email}</p>
              </div>
              <div className="p-2">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 rounded-2xl transition-all"
                >
                  <UserCircle className="h-4 w-4" />
                  Personal Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl transition-all text-left mt-1"
                >
                  <LogOut className="h-4 w-4" />
                  Terminate Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
