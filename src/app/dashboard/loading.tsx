import React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Plus, Filter } from 'lucide-react';
import { CardSkeleton, TableSkeleton } from '@/components/skeletons';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-50/50">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Page Header (Static UI - Immediate) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-1">Overview of clients, projects, and financials</p>
          </div>
          <Link
            href="/clients/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </Link>
        </div>

        {/* Date Filter Bar (Static Shell UI) */}
        <div className="bg-white border border-zinc-200/80 p-3.5 sm:p-4.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-zinc-100/90 rounded-xl border border-zinc-200/60 text-zinc-700 shrink-0">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-extrabold text-zinc-900">Dashboard Filter</h2>
                <p className="hidden sm:block text-xs text-zinc-500">Filter summary metrics, clients, and payment ledgers</p>
              </div>
            </div>
            <div className="h-9 w-28 animate-skeleton rounded-xl" />
          </div>
        </div>

        {/* 4 Summary Card Skeletons (2x2 on Mobile, 4x1 on Desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <CardSkeleton count={4} />
        </div>

        {/* Recent Clients Table Skeleton */}
        <TableSkeleton rows={4} cols={6} title="Recent Clients" subtitle="Latest client onboarding & billing status" />

        {/* Payment Due Table Skeleton */}
        <TableSkeleton rows={3} cols={6} title="Payment Due" subtitle="Projects with outstanding balances" />
      </main>
    </div>
  );
}
