"use client";

import { X, Zap, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  isExpired?: boolean;
}

export default function UpgradeModal({ isOpen, onClose, title, description, isExpired }: UpgradeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header with Pattern */}
        <div className="bg-blue-600 p-6 text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap className="h-24 w-24 rotate-12" />
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold">{isExpired ? 'Trial Expired' : 'Upgrade Required'}</h3>
          </div>
          <p className="text-blue-100 text-sm leading-relaxed">
            {isExpired ? "Your 14-day free trial has ended. Please upgrade to continue." : title}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
            {description}
          </p>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Unlimited bug reports</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Collaborate with your team</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Advanced integrations & more</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Maybe Later
            </button>
            <button 
              onClick={() => {
                onClose();
                router.push('/dashboard/billing');
              }}
              className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              View Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
