import React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Search } from 'lucide-react';
import { CardSkeleton, TableSkeleton } from '@/components/skeletons';

export default function ProjectsLoading() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-50/50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header (Static UI) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">Projects</h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-normal">Track ongoing deliverables, completion progress, and project values</p>
          </div>
          <Link
            href="/clients/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-medium rounded-xl transition-all shadow-sm active:scale-[0.98]"
          >
            <span>+ Add Client & Project</span>
          </Link>
        </div>

        {/* Top 2 Summary Cards Skeletons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <CardSkeleton count={2} />
        </div>

        {/* Search Bar (Static UI Shell) */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            disabled
            placeholder="Search by project name or client name..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 opacity-60"
          />
        </div>

        {/* Projects Table / Cards Skeleton */}
        <TableSkeleton rows={5} cols={7} />
      </main>
    </div>
  );
}
