'use client';

import React from 'react';

interface LogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ variant = 'dark', size = 'md', className = '' }: LogoProps) {
  const isLight = variant === 'light';

  const heights = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
  };

  return (
    <img
      src="/logo.png"
      alt="Faiz Dev & Co."
      className={`${heights[size]} w-auto object-contain ${isLight ? 'brightness-0 invert' : ''} ${className}`}
    />
  );
}
