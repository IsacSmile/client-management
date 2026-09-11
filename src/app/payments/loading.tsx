import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { CardSkeleton, TableSkeleton } from '@/components/skeletons';

export default function PaymentsLoading() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-50/50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Page Header (Static UI) */}
        <div className="pb-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">Payments Ledger</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-normal">Financial ledger of received payments and outstanding dues</p>
        </div>

        {/* Top 2 Summary Cards Skeletons (Total Received & Total Due) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <CardSkeleton count={2} />
        </div>

        {/* Payments Ledger Table / Cards Skeleton */}
        <TableSkeleton rows={5} cols={7} />
      </main>
    </div>
  );
}
