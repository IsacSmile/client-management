import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { DetailPageSkeleton } from '@/components/skeletons';

export default function ClientDetailLoading() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-50/50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <DetailPageSkeleton />
      </main>
    </div>
  );
}
