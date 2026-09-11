'use client';

import React from 'react';

interface LogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ variant = 'dark', size = 'md', className = '' }: LogoProps) {
  const isLight = variant === 'light'; // Light text on dark bg

  const iconSizes = {
    sm: 'w-7 h-7 text-[10px] rounded-lg',
    md: 'w-9 h-9 text-xs rounded-xl',
    lg: 'w-11 h-11 text-sm rounded-2xl',
  };

  const titleSizes = {
    sm: 'text-xs',
    md: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Brand Icon Badge */}
      <div className={`${iconSizes[size]} bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 text-white font-extrabold flex items-center justify-center shrink-0 shadow-xs border border-zinc-800`}>
        <span className="tracking-tight">FD</span>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col text-left min-w-0">
        <span className={`${titleSizes[size]} font-extrabold tracking-tight leading-none ${isLight ? 'text-white' : 'text-zinc-900'}`}>
          Faiz Dev &amp; Co.
        </span>
        <span className={`text-[9px] sm:text-[10px] font-bold tracking-wider uppercase mt-1 ${isLight ? 'text-zinc-400' : 'text-zinc-400'}`}>
          Client Portal
        </span>
      </div>
    </div>
  );
}
