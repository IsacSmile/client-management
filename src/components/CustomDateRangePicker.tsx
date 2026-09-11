'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isBefore,
  startOfDay,
} from 'date-fns';
import { DatePreset, getPresetLabel } from '@/lib/date-filters';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface CustomDateRangePickerProps {
  preset: DatePreset;
  customFrom: string;
  customTo: string;
  onPresetChange: (preset: DatePreset) => void;
  onCustomRangeApply: (from: string, to: string) => void;
}

export function CustomDateRangePicker({
  preset,
  customFrom,
  customTo,
  onPresetChange,
  onCustomRangeApply,
}: CustomDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // Pending selected dates inside popover
  const [tempFrom, setTempFrom] = useState<Date | null>(
    customFrom ? new Date(customFrom) : null
  );
  const [tempTo, setTempTo] = useState<Date | null>(
    customTo ? new Date(customTo) : null
  );

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync state when props change
  useEffect(() => {
    if (customFrom) setTempFrom(new Date(customFrom));
    if (customTo) setTempTo(new Date(customTo));
  }, [customFrom, customTo]);

  // Calendar Day Grid Computation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const handleDayClick = (day: Date) => {
    const targetDay = startOfDay(day);

    if (!tempFrom || (tempFrom && tempTo)) {
      setTempFrom(targetDay);
      setTempTo(null);
    } else if (tempFrom && !tempTo) {
      if (isBefore(targetDay, tempFrom)) {
        setTempFrom(targetDay);
        setTempTo(null);
      } else {
        setTempTo(targetDay);
      }
    }
  };

  const handleApply = () => {
    if (tempFrom && tempTo) {
      const fromStr = format(tempFrom, 'yyyy-MM-dd');
      const toStr = format(tempTo, 'yyyy-MM-dd');
      onCustomRangeApply(fromStr, toStr);
      setIsOpen(false);
    } else if (tempFrom) {
      const fromStr = format(tempFrom, 'yyyy-MM-dd');
      onCustomRangeApply(fromStr, fromStr);
      setIsOpen(false);
    }
  };

  // Trigger Button Label
  let displayLabel = getPresetLabel(preset);
  if (preset === 'custom' && customFrom && customTo) {
    try {
      const fDate = new Date(customFrom);
      const tDate = new Date(customTo);
      displayLabel = `${format(fDate, 'MMM d, yyyy')} – ${format(tDate, 'MMM d, yyyy')}`;
    } catch {
      displayLabel = 'Custom Range';
    }
  }

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all shadow-xs"
      >
        <CalendarIcon className="w-4 h-4 text-zinc-500" />
        <span>{displayLabel}</span>
        <span className="text-[10px] text-zinc-400">▼</span>
      </button>

      {/* Popover Custom Calendar (Right Aligned to Prevent Off-Screen Clipping) */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] max-w-[calc(100vw-2rem)] bg-white border border-zinc-200/90 rounded-2xl shadow-2xl z-50 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Preset Buttons Grid */}
          <div className="flex flex-wrap items-center gap-1 bg-zinc-100/80 p-1 rounded-xl border border-zinc-200/60">
            {(['all_time', 'this_month', 'last_month', 'last_3_months', 'custom'] as const).map((pKey) => (
              <button
                key={pKey}
                onClick={() => {
                  onPresetChange(pKey);
                  if (pKey !== 'custom') {
                    setIsOpen(false);
                  }
                }}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                  preset === pKey
                    ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {getPresetLabel(pKey)}
              </button>
            ))}
          </div>

          {/* Month Navigation Header */}
          <div className="flex items-center justify-between px-1 pt-1">
            <h4 className="text-xs font-bold text-zinc-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-1">
            {/* Weekdays Row */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider pb-1 border-b border-zinc-100">
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
              <span>Su</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
              {calendarDays.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isFrom = tempFrom && isSameDay(day, tempFrom);
                const isTo = tempTo && isSameDay(day, tempTo);
                const inRange =
                  tempFrom &&
                  tempTo &&
                  isWithinInterval(day, { start: tempFrom, end: tempTo });

                let dayClass = 'h-8 w-8 mx-auto flex items-center justify-center rounded-lg text-xs transition-all cursor-pointer ';

                if (!isCurrentMonth) {
                  dayClass += 'text-zinc-300 hover:text-zinc-500 ';
                } else {
                  dayClass += 'text-zinc-800 ';
                }

                if (isFrom || isTo) {
                  dayClass += 'bg-zinc-900 text-white font-bold shadow-xs ';
                } else if (inRange) {
                  dayClass += 'bg-zinc-100 text-zinc-900 font-semibold ';
                } else {
                  dayClass += 'hover:bg-zinc-100 ';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={dayClass}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Custom Range Footer & Apply Controls */}
          <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between">
            <div className="text-[11px] text-zinc-500">
              {tempFrom && tempTo ? (
                <span>
                  {format(tempFrom, 'MMM d')} – {format(tempTo, 'MMM d')}
                </span>
              ) : tempFrom ? (
                <span>Select end date...</span>
              ) : (
                <span>Select start date...</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!tempFrom}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 transition-all shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
