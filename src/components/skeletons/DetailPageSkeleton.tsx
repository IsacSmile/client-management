'use client';

import React from 'react';

export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="space-y-3 pb-2">
        <div className="h-3 w-24 animate-skeleton rounded-md" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-44 animate-skeleton rounded-lg" />
              <div className="h-6 w-16 animate-skeleton rounded-full" />
            </div>
            <div className="h-4 w-36 animate-skeleton rounded-md" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-24 animate-skeleton rounded-xl" />
            <div className="h-9 w-20 animate-skeleton rounded-xl" />
          </div>
        </div>
      </div>

      {/* Overview Grid: Client Info + Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Info Skeleton */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="h-5 w-36 animate-skeleton rounded-md border-b border-zinc-100 pb-3" />
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-zinc-100">
              <div className="h-3 w-16 animate-skeleton rounded-md" />
              <div className="h-3.5 w-28 animate-skeleton rounded-md" />
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-100">
              <div className="h-3 w-12 animate-skeleton rounded-md" />
              <div className="h-3.5 w-36 animate-skeleton rounded-md" />
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-100">
              <div className="h-3 w-14 animate-skeleton rounded-md" />
              <div className="h-3.5 w-24 animate-skeleton rounded-md" />
            </div>
          </div>
        </div>

        {/* Project Info Skeleton */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="h-5 w-32 animate-skeleton rounded-md" />
            <div className="h-5 w-16 animate-skeleton rounded-full" />
          </div>
          <div className="space-y-3">
            <div className="h-3.5 w-40 animate-skeleton rounded-md" />
            <div className="h-16 w-full animate-skeleton rounded-xl" />
            <div className="h-3 w-full animate-skeleton rounded-full" />
          </div>
        </div>
      </div>

      {/* Financial Summary & Add Payment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Summary KPI 2x2 Grid Skeleton */}
        <div className="lg:col-span-1 bg-white border border-zinc-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="h-5 w-36 animate-skeleton rounded-md border-b border-zinc-100 pb-3" />
          <div className="grid grid-cols-2 gap-2.5">
            <div className="h-14 animate-skeleton rounded-xl" />
            <div className="h-14 animate-skeleton rounded-xl" />
            <div className="h-14 animate-skeleton rounded-xl" />
            <div className="h-14 animate-skeleton rounded-xl" />
          </div>
        </div>

        {/* Record New Payment Form Skeleton */}
        <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="h-5 w-40 animate-skeleton rounded-md border-b border-zinc-100 pb-3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="h-3 w-20 animate-skeleton rounded-md" />
              <div className="h-10 w-full animate-skeleton rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-20 animate-skeleton rounded-md" />
              <div className="h-10 w-full animate-skeleton rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
