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
    <div className="flex flex-col lg:flex-row min-h-screen bg-brand-bg">
      <Sidebar userName={userName} userEmail={userEmail} />

      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8">
        {/* Page Header */}
        <div className="border-b border-brand-border pb-4">
          <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Settings</h1>
          <p className="text-sm text-brand-secondary mt-1">Manage profile information, currency defaults, and security</p>
        </div>

        {/* Profile Section */}
        <div className="bg-white border border-brand-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <User className="w-5 h-5 text-brand-dark" />
            <h2 className="text-xl font-semibold text-brand-dark">Profile Settings</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-brand-surface border border-brand-border rounded-md">
              <span className="text-xs text-brand-secondary uppercase tracking-wider block font-semibold">User Name</span>
              <span className="text-base font-semibold text-brand-dark">{userName}</span>
            </div>
            <div className="p-3 bg-brand-surface border border-brand-border rounded-md">
              <span className="text-xs text-brand-secondary uppercase tracking-wider block font-semibold">Email Address</span>
              <span className="text-base font-semibold text-brand-dark">{userEmail}</span>
            </div>
          </div>
        </div>

        {/* Application Preferences */}
        <div className="bg-white border border-brand-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <IndianRupee className="w-5 h-5 text-brand-dark" />
            <h2 className="text-xl font-semibold text-brand-dark">Application Preferences</h2>
          </div>

          <div className="p-4 bg-brand-surface border border-brand-border rounded-md flex items-center justify-between text-sm">
            <div>
              <span className="font-semibold text-brand-dark block">Default Currency</span>
              <span className="text-xs text-brand-secondary">Fixed system currency for all financial calculations & invoice values</span>
            </div>
            <span className="px-3 py-1.5 bg-white border border-brand-border text-brand-dark font-bold rounded-md text-sm">
              INR (₹) Fixed
            </span>
          </div>
        </div>

        {/* Security / Password Change */}
        <div className="bg-white border border-brand-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <Shield className="w-5 h-5 text-brand-dark" />
            <h2 className="text-xl font-semibold text-brand-dark">Security & Password</h2>
          </div>

          {passError && (
            <div className="p-3 border border-brand-border bg-brand-surface text-brand-dark rounded-md text-xs font-medium">
              {passError}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1">
                Current Password <span className="text-brand-dark">*</span>
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none focus:border-brand-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1">
                New Password <span className="text-brand-dark">*</span>
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none focus:border-brand-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1">
                Confirm New Password <span className="text-brand-dark">*</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none focus:border-brand-dark"
              />
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand-nav hover:bg-brand-dark border border-brand-dark rounded-md transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              <span>{passLoading ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </form>
        </div>

        {/* Logout Section */}
        <div className="bg-white border border-brand-border rounded-lg p-6 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-brand-dark">Sign Out of Account</h3>
            <p className="text-xs text-brand-secondary">End your active session on this device</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-dark border border-brand-dark rounded-md hover:bg-brand-nav transition-colors"
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
