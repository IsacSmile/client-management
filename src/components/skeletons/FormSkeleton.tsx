'use client';

import React from 'react';

interface FormSkeletonProps {
  fields?: number;
}

export function FormSkeleton({ fields = 6 }: FormSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Section 1: Client Info */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="h-5 w-32 animate-skeleton rounded-md border-b border-zinc-100 pb-3" />
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="h-3 w-24 animate-skeleton rounded-md" />
            <div className="h-10 w-full animate-skeleton rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
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

      {/* Section 2: Project Info */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="h-5 w-44 animate-skeleton rounded-md border-b border-zinc-100 pb-3" />
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="h-3 w-24 animate-skeleton rounded-md" />
            <div className="h-10 w-full animate-skeleton rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-24 animate-skeleton rounded-md" />
            <div className="h-20 w-full animate-skeleton rounded-xl" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <div className="h-3 w-20 animate-skeleton rounded-md" />
              <div className="h-10 w-full animate-skeleton rounded-xl" />
            </div>
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
