'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ userName = 'Admin', userEmail = 'demo@example.com' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Clients', href: '/clients', icon: Users },
    { label: 'Projects', href: '/projects', icon: Briefcase },
    { label: 'Payments', href: '/payments', icon: CreditCard },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile Top Navigation */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-brand-nav text-white border-b border-brand-secondary">
        <Link href="/dashboard" className="flex items-center">
          <img src="/logo.png" alt="Faiz Dev & Co." className="h-7 w-auto brightness-0 invert object-contain" />
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-md hover:bg-brand-secondary text-brand-icon focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Collapsible Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-brand-nav text-white border-b border-brand-secondary px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-secondary text-white border-l-4 border-brand-icon'
                    : 'text-brand-icon hover:bg-brand-secondary hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-brand-secondary flex items-center justify-between text-xs text-brand-icon px-3">
            <div>
              <p className="font-medium text-white">{userName}</p>
              <p className="text-brand-icon truncate max-w-[180px]">{userEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-brand-icon hover:text-white px-2 py-1 rounded bg-brand-secondary"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-brand-nav text-white lg:sticky lg:top-0 lg:h-screen border-r border-brand-secondary flex-shrink-0 z-20">
        {/* Header */}
        <Link href="/dashboard" className="px-6 py-5 border-b border-brand-secondary flex items-center hover:bg-brand-secondary/40 transition-colors flex-shrink-0">
          <img src="/logo.png" alt="Faiz Dev & Co." className="h-9 w-auto brightness-0 invert object-contain" />
        </Link>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-secondary text-white border-l-4 border-brand-icon'
                    : 'text-brand-icon hover:bg-brand-secondary hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer & Logout */}
        <div className="p-4 border-t border-brand-secondary bg-[#2b3035] flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <p className="text-xs text-brand-icon truncate">{userEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-md hover:bg-brand-secondary text-brand-icon hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
