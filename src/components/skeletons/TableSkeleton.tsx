'use client';

import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  title?: string;
  subtitle?: string;
}

export function TableSkeleton({
  rows = 4,
  cols = 5,
  title,
  subtitle,
}: TableSkeletonProps) {
  const rowList = Array.from({ length: rows });
  const colList = Array.from({ length: cols });

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
      {/* Table Header Section */}
      {(title || subtitle) && (
        <div className="border-b border-zinc-100 pb-3 space-y-1">
          {title && <div className="h-5 w-36 animate-skeleton rounded-md" />}
          {subtitle && <div className="h-3 w-56 animate-skeleton rounded-md" />}
        </div>
      )}

      {/* Desktop Table View (≥640px) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-zinc-200/80 bg-zinc-50/60">
              {colList.map((_, i) => (
                <th key={i} className="py-3 px-4">
                  <div className="h-3 w-16 animate-skeleton rounded-md" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rowList.map((_, rIdx) => (
              <tr key={rIdx}>
                {colList.map((_, cIdx) => (
                  <td key={cIdx} className="py-3.5 px-4">
                    {cIdx === 0 ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg animate-skeleton shrink-0" />
                        <div className="space-y-1">
                          <div className="h-3.5 w-28 animate-skeleton rounded-md" />
                          <div className="h-3 w-20 animate-skeleton rounded-md" />
                        </div>
                      </div>
                    ) : cIdx === colList.length - 1 ? (
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-6 w-14 animate-skeleton rounded-lg" />
                      </div>
                    ) : (
                      <div className="h-3.5 w-20 animate-skeleton rounded-md" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card Skeletons (<640px) */}
      <div className="sm:hidden space-y-3 pt-1">
        {rowList.map((_, idx) => (
          <div
            key={idx}
            className="p-3.5 border border-zinc-200/80 rounded-xl bg-white space-y-2.5 shadow-2xs"
          >
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg animate-skeleton shrink-0" />
                <div className="space-y-1 min-w-0">
                  <div className="h-3.5 w-24 animate-skeleton rounded-md" />
                  <div className="h-3 w-16 animate-skeleton rounded-md" />
                </div>
              </div>
              <div className="h-5 w-14 animate-skeleton rounded-full shrink-0" />
            </div>
            <div className="h-8 w-full animate-skeleton rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
