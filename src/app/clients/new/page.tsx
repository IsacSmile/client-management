'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Toast } from '@/components/Toast';
import { CustomSelect } from '@/components/CustomSelect';
import { ArrowLeft, User, Briefcase, IndianRupee } from 'lucide-react';
import { ProjectStatus, PROJECT_STATUS_LABELS } from '@/lib/finance';

export default function NewClientPage() {
  const router = useRouter();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [projectName, setProjectName] = useState('');
  const [scope, setScope] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [upfrontPayment, setUpfrontPayment] = useState('0');
  const [status, setStatus] = useState<ProjectStatus>('NotStarted');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form Validation
    if (!name.trim()) {
      setError('Client Name is required');
      return;
    }
    if (!projectName.trim()) {
      setError('Project Name is required');
      return;
    }
    const numTotal = parseFloat(totalAmount);
    if (isNaN(numTotal) || numTotal <= 0) {
      setError('Valid Total Amount is required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          projectName: projectName.trim(),
          scope: scope.trim(),
          totalAmount: numTotal,
          upfrontPayment: parseFloat(upfrontPayment) || 0,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create client');
        setLoading(false);
        return;
      }

      setToastMessage('Client added successfully');
      setTimeout(() => {
        router.push('/clients');
        router.refresh();
      }, 1000);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-50/50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Back link & Header */}
        <div className="space-y-2 pb-2">
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Clients</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">Add New Client</h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-normal">
            Enter client contact details and project financial information
          </p>
        </div>

        {error && (
          <div className="p-3.5 border border-rose-200/80 bg-rose-50/60 text-rose-700 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Client Information */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <User className="w-4 h-4 text-zinc-700" />
              <h2 className="text-base font-semibold text-zinc-900">Client Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Client Name <span className="text-zinc-900">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Corp / Jane Smith"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Project Information */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Briefcase className="w-4 h-4 text-zinc-700" />
              <h2 className="text-base font-semibold text-zinc-900">Project & Financial Setup</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Project Name <span className="text-zinc-900">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Corporate Website Redesign"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Scope of Work
                </label>
                <textarea
                  rows={3}
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="Describe key project deliverables, tech stack, and milestone expectations..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Total Amount (INR ₹) <span className="text-zinc-900">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="150000"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Upfront Payment (INR ₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={upfrontPayment}
                    onChange={(e) => setUpfrontPayment(e.target.value)}
                    placeholder="50000"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 transition-all"
                  />
                  <span className="text-[11px] text-zinc-400 block mt-1">
                    Initial payment recorded on creation
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Project Status
                  </label>
                  <CustomSelect 
                    value={status} 
                    onChange={(newStatus) => setStatus(newStatus)} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/clients"
              className="px-5 py-2.5 text-xs sm:text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all shadow-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs sm:text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              {loading ? 'Creating Client...' : 'Save & Create Client'}
            </button>
          </div>
        </form>

        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      </main>
    </div>
  );
}
