"use client";

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Bug, LogOut, X, Menu, Sun, Moon, Search, ChevronDown } from 'lucide-react';
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
    <header className="flex h-16 items-center justify-between border-b border-gray-100 dark:border-gray-800/60 bg-white dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center flex-1 gap-4">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search incidents, projects, or users..."
            className="block w-full rounded-xl border-0 py-2.5 pl-11 pr-3 text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-800/50 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(o => !o)}
            className="relative rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {newCount > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
            <span className="sr-only">Notifications</span>
            <Bell className="h-5 w-5" />
          </button>

          {open && (
            <div className="fixed left-4 right-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-12 z-50 sm:w-96 max-w-sm sm:max-w-none mx-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl sm:origin-top-right animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Open Bugs</span>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {loading ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 ms-5">Loading...</p>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-gray-400">
                    <Bug className="h-8 w-8 mb-2" />
                    <p className="text-sm">No open bugs — all clear!</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {notifications.map(n => (
                      <li key={n.id}>
                        <Link
                          href={`/dashboard/bugs/${n.id}`}
                          onClick={() => setOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30">
                            <Bug className="h-4 w-4 text-red-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{n.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {n.project.name} · {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2">
                <Link
                  href="/dashboard/bugs"
                  onClick={() => setOpen(false)}
                  className="block text-center text-xs font-medium text-blue-600 hover:underline py-1"
                >
                  View all bugs
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 rounded-xl p-1 pr-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
          >
            <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center overflow-hidden border border-white dark:border-gray-700 shadow-sm">
              <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=DBEAFE&color=2563EB&bold=true`} alt="avatar" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user?.name || 'User'}</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-800">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Account</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.email}</p>
              </div>
              <Link
                href="/dashboard/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Search className="h-4 w-4" /> {/* Use Profile icon if available, or just keeping it simple */}
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
