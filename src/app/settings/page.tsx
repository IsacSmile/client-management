'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Toast } from '@/components/Toast';
import { User, Shield, IndianRupee, LogOut, KeyRound } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Admin User');
  const [userEmail, setUserEmail] = useState('demo@example.com');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters');
      return;
    }

    setPassLoading(true);

    try {
      const res = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPassError(data.error || 'Failed to update password');
        setPassLoading(false);
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToastMessage('Password updated successfully');
    } catch (err) {
      setPassError('An unexpected error occurred. Please try again.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-50/50">
      <Sidebar userName={userName} userEmail={userEmail} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Page Header */}
        <div className="pb-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">Settings</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-normal">Manage profile information, currency defaults, and security</p>
        </div>

        {/* Profile Section */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <User className="w-4 h-4 text-zinc-700" />
            <h2 className="text-base font-semibold text-zinc-900">Profile Settings</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-3.5 bg-zinc-50/70 border border-zinc-100 rounded-xl">
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider block font-semibold">User Name</span>
              <span className="text-sm font-semibold text-zinc-900 mt-0.5 block">{userName}</span>
            </div>
            <div className="p-3.5 bg-zinc-50/70 border border-zinc-100 rounded-xl">
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider block font-semibold">Email Address</span>
              <span className="text-sm font-semibold text-zinc-900 mt-0.5 block">{userEmail}</span>
            </div>
          </div>
        </div>

        {/* Application Preferences */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <IndianRupee className="w-4 h-4 text-zinc-700" />
            <h2 className="text-base font-semibold text-zinc-900">Application Preferences</h2>
          </div>

          <div className="p-4 bg-zinc-50/70 border border-zinc-100 rounded-xl flex items-center justify-between text-xs sm:text-sm">
            <div>
              <span className="font-semibold text-zinc-900 block">Default Currency</span>
              <span className="text-xs text-zinc-500 font-normal">Fixed system currency for all financial calculations & invoice values</span>
            </div>
            <span className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-900 font-semibold rounded-xl text-xs shadow-sm">
              INR (₹) Fixed
            </span>
          </div>
        </div>

        {/* Security / Password Change */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Shield className="w-4 h-4 text-zinc-700" />
            <h2 className="text-base font-semibold text-zinc-900">Security & Password</h2>
          </div>

          {passError && (
            <div className="p-3.5 border border-rose-200/80 bg-rose-50/60 text-rose-700 rounded-xl text-xs font-medium">
              {passError}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Current Password <span className="text-zinc-900">*</span>
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                New Password <span className="text-zinc-900">*</span>
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Confirm New Password <span className="text-zinc-900">*</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              <KeyRound className="w-4 h-4" />
              <span>{passLoading ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </form>
        </div>

        {/* Logout Section */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-zinc-900">Sign Out of Account</h3>
            <p className="text-xs text-zinc-500 font-normal">End your active session on this device</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-rose-600 bg-rose-50/70 border border-rose-200/80 rounded-xl hover:bg-rose-100/80 transition-all shadow-sm active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      </main>
    </div>
  );
}
