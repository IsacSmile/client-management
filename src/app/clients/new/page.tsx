'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Toast } from '@/components/Toast';
import { ArrowLeft, User, Briefcase, DollarSign } from 'lucide-react';
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-brand-bg">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Back link & Header */}
        <div className="space-y-2 border-b border-brand-border pb-4">
          <Link
            href="/clients"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-secondary hover:text-brand-dark transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Clients</span>
          </Link>
          <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Add New Client</h1>
          <p className="text-sm text-brand-secondary">
            Enter client contact details and project financial information
          </p>
        </div>

        {error && (
          <div className="p-3 border border-brand-border bg-brand-surface text-brand-dark rounded-md text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Client Information */}
          <div className="bg-white border border-brand-border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-brand-border pb-3">
              <User className="w-5 h-5 text-brand-dark" />
              <h2 className="text-xl font-semibold text-brand-dark">Client Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                  Client Name <span className="text-brand-dark">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Corp / Jane Smith"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none focus:border-brand-dark transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="[email protected]"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none focus:border-brand-dark transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none focus:border-brand-dark transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Project Information */}
          <div className="bg-white border border-brand-border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-brand-border pb-3">
              <Briefcase className="w-5 h-5 text-brand-dark" />
              <h2 className="text-xl font-semibold text-brand-dark">Project & Financial Setup</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                  Project Name <span className="text-brand-dark">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Corporate Website Redesign"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none focus:border-brand-dark transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                  Scope of Work
                </label>
                <textarea
                  rows={3}
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="Describe key project deliverables, tech stack, and milestone expectations..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none focus:border-brand-dark transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                    Total Amount (INR ₹) <span className="text-brand-dark">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="150000"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none focus:border-brand-dark transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                    Upfront Payment (INR ₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={upfrontPayment}
                    onChange={(e) => setUpfrontPayment(e.target.value)}
                    placeholder="50000"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none focus:border-brand-dark transition-colors"
                  />
                  <span className="text-[11px] text-brand-muted block mt-1">
                    Initial payment recorded on creation
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                    Project Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none focus:border-brand-dark transition-colors"
                  >
                    {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((key) => (
                      <option key={key} value={key}>
                        {PROJECT_STATUS_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/clients"
              className="px-5 py-2.5 text-sm font-medium text-brand-dark bg-white border border-brand-border rounded-md hover:bg-brand-surface transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-brand-nav hover:bg-brand-dark border border-brand-dark rounded-md transition-colors shadow-none"
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
