'use client';

import React from 'react';

interface CardSkeletonProps {
  count?: number;
}

export function CardSkeleton({ count = 1 }: CardSkeletonProps) {
  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-zinc-200/80 rounded-xl p-3 sm:p-4 space-y-2 shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 animate-skeleton rounded-md" />
            <div className="h-7 w-7 animate-skeleton rounded-lg shrink-0" />
          </div>
          <div className="h-6 sm:h-7 w-28 animate-skeleton rounded-md pt-1" />
        </div>
      ))}
    </>
  );
}
