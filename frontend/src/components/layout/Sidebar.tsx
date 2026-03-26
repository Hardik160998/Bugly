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
    <div className="flex h-full w-64 flex-col border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-50/50 dark:border-gray-800/60">
        <Link href="/" className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm shadow-blue-600/20">
                <Bug className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Bugly</span>
          </div>
        </Link>
        {/* Close button — mobile only */}
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600 p-1">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 shrink-0 ${
                  isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <Link href="/dashboard/profile" onClick={onClose} className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold select-none group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-colors">
            {initial}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{displayUser?.name ?? 'User'}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{displayUser?.email ?? ''}</span>
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
