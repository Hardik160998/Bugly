"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore, useThemeStore } from '@/lib/store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const rehydrate = useAuthStore(s => s.rehydrate);
  const rehydrateTheme = useThemeStore(s => s.rehydrateTheme);
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    rehydrate();
    rehydrateTheme();
    setReady(true);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(o => !o)} />
        <main className="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950">
          {ready ? children : null}
        </main>
      </div>
    </div>
  );
}
