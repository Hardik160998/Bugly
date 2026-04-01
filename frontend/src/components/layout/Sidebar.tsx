"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Bug, Settings, FolderKanban, X, UserCircle, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Bugs & Feedback', href: '/dashboard/bugs', icon: Bug },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Profile', href: '/dashboard/profile', icon: UserCircle },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore(s => s.user);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const displayUser = mounted ? user : null;
  const initial = displayUser?.name?.[0]?.toUpperCase() ?? 'U';

  const content = (
    <div className="flex h-full w-64 flex-col border-r border-gray-100 dark:border-gray-800/60 bg-white dark:bg-gray-950">
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-50/50 dark:border-gray-900/40">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-brand-600 p-1.5 rounded-xl shadow-lg shadow-brand-600/20 group-hover:scale-110 transition-transform duration-500">
              <Bug className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black text-gray-900 dark:text-white tracking-widest uppercase italic">Bugly</span>
        </Link>
        {/* Close button — mobile only */}
        <button onClick={onClose} className="lg:hidden h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col px-4 py-8 space-y-2">
        {navigation.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center rounded-2xl px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.1em] transition-all border ${
                isActive
                  ? 'bg-brand-50/50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400 border-brand-100/50 dark:border-brand-900/30'
                  : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50/80 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white border-transparent'
              }`}
            >
              <item.icon
                className={`mr-3.5 h-4 w-4 shrink-0 transition-colors ${
                  isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50 dark:border-gray-900/40 bg-gray-50/30 dark:bg-gray-900/20">
        <Link href="/dashboard/profile" onClick={onClose} className="flex items-center gap-3 rounded-2xl p-3 hover:bg-white dark:hover:bg-gray-900 transition-all group border border-transparent hover:border-gray-100 dark:hover:border-gray-800/60 shadow-sm hover:shadow-premium">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold group-hover:scale-105 transition-transform overflow-hidden border-2 border-white dark:border-gray-700">
             <img src={`https://ui-avatars.com/api/?name=${displayUser?.name || 'User'}&background=111827&color=ffffff&bold=true`} alt="avatar" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-black text-gray-900 dark:text-white truncate uppercase tracking-tight">{displayUser?.name ?? 'User'}</span>
            <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 truncate uppercase tracking-[0.2em]">{displayUser?.plan || 'Free'} Core</span>
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden lg:flex h-full shrink-0">
        {content}
      </div>

      {/* Mobile: slide-in drawer */}
      <div className={`fixed inset-y-0 left-0 z-30 lg:hidden transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {content}
      </div>
    </>
  );
}
