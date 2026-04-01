"use client";

import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface StyledSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
}

export default function StyledSelect({ value, onChange, options, className = '' }: StyledSelectProps) {
  const selected = options.find(o => o.value === value);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none w-full bg-white dark:bg-gray-800 pl-3 pr-9 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
    </div>
  );
}

const STATUS_DOT: Record<string, string> = {
  'Open': 'bg-amber-400',
  'In Progress': 'bg-blue-500',
  'Resolved': 'bg-green-500',
  'Closed': 'bg-gray-400',
};

interface StatusSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function StatusSelect({ value, onChange }: StatusSelectProps) {
  const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

  const borderColor: Record<string, string> = {
    'Open': 'border-amber-300 focus:ring-amber-400 focus:border-amber-400',
    'In Progress': 'border-blue-300 focus:ring-blue-400 focus:border-blue-400',
    'Resolved': 'border-green-300 focus:ring-green-400 focus:border-green-400',
    'Closed': 'border-gray-300 focus:ring-gray-400 focus:border-gray-400',
  };

  const bgColor: Record<string, string> = {
    'Open': 'bg-amber-50',
    'In Progress': 'bg-blue-50',
    'Resolved': 'bg-green-50',
    'Closed': 'bg-gray-50',
  };

  return (
    <div className="relative inline-flex items-center">
      <div className={`absolute left-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full ${STATUS_DOT[value] ?? 'bg-gray-400'}`} />
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`appearance-none pl-7 pr-9 py-2 text-sm font-semibold rounded-lg border shadow-sm hover:shadow-md focus:outline-none focus:ring-2 transition-all cursor-pointer ${bgColor[value] ?? 'bg-gray-50'} ${borderColor[value] ?? 'border-gray-300'}`}
      >
        {statuses.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
    </div>
  );
}
