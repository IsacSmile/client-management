'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { ProjectStatus, PROJECT_STATUS_LABELS } from '@/lib/finance';

interface CustomSelectProps {
  value: ProjectStatus;
  onChange: (value: ProjectStatus) => void;
}

const STATUS_COLORS: Record<ProjectStatus, { bg: string; dot: string }> = {
  NotStarted: { bg: 'bg-zinc-100 text-zinc-700', dot: 'bg-zinc-400' },
  InProgress: { bg: 'bg-sky-50 text-sky-700', dot: 'bg-sky-500' },
  WaitingForClient: { bg: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  Completed: { bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  OnHold: { bg: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
};

export function CustomSelect({ value, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = PROJECT_STATUS_LABELS[value] || value;
  const currentConfig = STATUS_COLORS[value] || STATUS_COLORS.NotStarted;

  return (
    <div className="relative w-full text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 shadow-xs hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${currentConfig.dot} shrink-0`} />
          <span className="font-semibold">{selectedLabel}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-zinc-200/90 rounded-2xl shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
          {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((key) => {
            const label = PROJECT_STATUS_LABELS[key];
            const isSelected = key === value;
            const config = STATUS_COLORS[key];

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onChange(key);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  isSelected ? 'bg-zinc-100 text-zinc-900 font-bold' : 'text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`h-2 w-2 rounded-full ${config.dot} shrink-0`} />
                  <span>{label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-zinc-900" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
