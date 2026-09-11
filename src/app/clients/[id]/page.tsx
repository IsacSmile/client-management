'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Toast } from '@/components/Toast';
import { 
  calculateTotalPaid, 
  calculateRemaining, 
  getPaymentStatus, 
  formatCurrency, 
  PROJECT_STATUS_LABELS,
  ProjectStatus 
} from '@/lib/finance';
import { 
  ArrowLeft, 
  User, 
  Briefcase, 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  Calendar,
  FileText
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  amount: number;
  paymentDate: string;
  note: string | null;
}

interface ProjectRecord {
  id: string;
  name: string;
  scope: string;
  totalAmount: number;
  status: string;
  progress: number;
  payments: PaymentRecord[];
}

interface ClientDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  projects: ProjectRecord[];
  payments: PaymentRecord[];
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editProjectName, setEditProjectName] = useState('');
  const [editScope, setEditScope] = useState('');
  const [editTotalAmount, setEditTotalAmount] = useState('');

  // Add Payment form state
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().substring(0, 10));
  const [payNote, setPayNote] = useState('');
  const [payLoading, setPayLoading] = useState(false);

  // Delete modal & Toast state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchClientDetail();
  }, [clientId]);

  const fetchClientDetail = async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      if (res.ok) {
        const data: ClientDetail = await res.json();
        setClient(data);

        // Populate edit state
        setEditName(data.name);
        setEditEmail(data.email);
        setEditPhone(data.phone);
        if (data.projects[0]) {
          setEditProjectName(data.projects[0].name);
          setEditScope(data.projects[0].scope || '');
          setEditTotalAmount(data.projects[0].totalAmount.toString());
        }
      }
    } catch (err) {
      console.error('Failed to load client detail:', err);
    } finally {
      setLoading(false);
    }
  };

  // Progress update (0%, 25%, 50%, 75%, 100%)
  const handleProgressChange = async (newProgress: number) => {
    if (!client || !client.projects[0]) return;
    const project = client.projects[0];

    try {
      const newStatus = newProgress === 100 ? 'Completed' : project.status;
      const res = await fetch(`/api/projects/${project.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: newProgress, status: newStatus }),
      });

      if (res.ok) {
        setToastMessage('Project progress updated');
        fetchClientDetail();
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  // Submit new payment
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !client.projects[0]) return;

    const numAmount = parseFloat(payAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setPayLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          projectId: client.projects[0].id,
          amount: numAmount,
          paymentDate: payDate,
          note: payNote,
        }),
      });

      if (res.ok) {
        setPayAmount('');
        setPayNote('');
        setToastMessage('Payment recorded successfully');
        fetchClientDetail();
      }
    } catch (err) {
      console.error('Add payment error:', err);
    } finally {
      setPayLoading(false);
    }
  };

  // Save Edit Client Info
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
          projectName: editProjectName,
          scope: editScope,
          totalAmount: parseFloat(editTotalAmount),
        }),
      });

      if (res.ok) {
        setIsEditing(false);
        setToastMessage('Client updated successfully');
        fetchClientDetail();
      }
    } catch (err) {
      console.error('Update client error:', err);
    }
  };

  // Confirm Delete Client
  const handleDeleteClient = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/clients');
        router.refresh();
      }
    } catch (err) {
      console.error('Delete client error:', err);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-brand-bg">
        <Sidebar />
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full text-center text-brand-muted text-sm">
          Loading client details...
        </main>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-brand-bg">
        <Sidebar />
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full text-center space-y-4">
          <p className="text-lg font-bold text-brand-dark">Client not found.</p>
          <Link href="/clients" className="text-xs font-semibold text-brand-dark underline">
            Return to Clients List
          </Link>
        </main>
      </div>
    );
  }

  const mainProject = client.projects[0];
  const totalAmount = mainProject ? mainProject.totalAmount : 0;
  const totalPaid = mainProject ? calculateTotalPaid(mainProject.payments) : 0;
  const remaining = calculateRemaining(totalAmount, totalPaid);
  const payStatus = mainProject ? getPaymentStatus(totalAmount, totalPaid) : 'Unpaid';

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-brand-bg">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Top Navigation & Action Buttons */}
        <div className="space-y-4 border-b border-brand-border pb-4">
          <Link
            href="/clients"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-secondary hover:text-brand-dark transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Clients</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-brand-dark tracking-tight">{client.name}</h1>
                <StatusBadge type="payment" status={payStatus} />
              </div>
              <p className="text-sm text-brand-secondary">
                Project: <strong className="text-brand-dark">{mainProject?.name || 'N/A'}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-brand-dark bg-white border border-brand-border rounded-md hover:bg-brand-surface transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Client'}</span>
              </button>

              <button
                onClick={() => setIsDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-brand-dark border border-brand-dark rounded-md hover:bg-brand-nav transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Inline Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveEdit} className="bg-white border border-brand-border rounded-lg p-6 space-y-4 animate-in fade-in duration-150">
            <h3 className="text-lg font-semibold text-brand-dark border-b border-brand-border pb-2">
              Edit Client & Project Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">Client Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">Phone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">Total Project Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={editTotalAmount}
                  onChange={(e) => setEditTotalAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1">Scope</label>
              <textarea
                rows={2}
                value={editScope}
                onChange={(e) => setEditScope(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-medium text-brand-dark bg-white border border-brand-border rounded-md hover:bg-brand-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-brand-nav rounded-md hover:bg-brand-dark"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* Overview Grid: Client Info + Project Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Info Card */}
          <div className="bg-white border border-brand-border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-brand-border pb-3">
              <User className="w-5 h-5 text-brand-dark" />
              <h2 className="text-xl font-semibold text-brand-dark">Client Information</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-brand-border/60">
                <span className="text-brand-secondary">Full Name</span>
                <span className="font-semibold text-brand-dark">{client.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-border/60">
                <span className="text-brand-secondary">Email</span>
                <span className="font-medium text-brand-dark">{client.email || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-border/60">
                <span className="text-brand-secondary">Phone</span>
                <span className="font-medium text-brand-dark">{client.phone || '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-brand-secondary">Created On</span>
                <span className="text-brand-dark">{new Date(client.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Project Info Card */}
          <div className="bg-white border border-brand-border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-dark" />
                <h2 className="text-xl font-semibold text-brand-dark">Project Details</h2>
              </div>
              {mainProject && <StatusBadge type="project" status={mainProject.status} />}
            </div>

            {mainProject ? (
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-xs font-semibold text-brand-secondary uppercase tracking-wider block">
                    Project Name
                  </span>
                  <p className="font-semibold text-brand-dark text-base">{mainProject.name}</p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-brand-secondary uppercase tracking-wider block mb-1">
                    Scope of Work
                  </span>
                  <p className="text-brand-secondary text-sm bg-brand-surface p-3 rounded-md border border-brand-border">
                    {mainProject.scope || 'No scope details added.'}
                  </p>
                </div>

                {/* Progress Controls */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-brand-dark">
                    <span>Completion Progress</span>
                    <span>{mainProject.progress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-brand-surface border border-brand-border rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-brand-dark h-full transition-all duration-300"
                      style={{ width: `${mainProject.progress}%` }}
                    />
                  </div>

                  {/* 0 / 25 / 50 / 75 / 100% Quick Buttons */}
                  <div className="flex items-center justify-between gap-1 pt-1">
                    {[0, 25, 50, 75, 100].map((val) => (
                      <button
                        key={val}
                        onClick={() => handleProgressChange(val)}
                        className={`flex-1 py-1 text-xs font-semibold border rounded-md transition-colors ${
                          mainProject.progress === val
                            ? 'bg-brand-dark text-white border-brand-dark'
                            : 'bg-white text-brand-dark border-brand-border hover:bg-brand-surface'
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-brand-muted">No active project linked.</p>
            )}
          </div>
        </div>

        {/* Financial Summary & Add Payment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Summary KPI Card */}
          <div className="lg:col-span-1 bg-white border border-brand-border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-brand-border pb-3">
              <CreditCard className="w-5 h-5 text-brand-dark" />
              <h2 className="text-xl font-semibold text-brand-dark">Payment Summary</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-brand-border/60">
                <span className="text-brand-secondary">Project Value</span>
                <span className="font-semibold text-brand-dark">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-brand-border/60">
                <span className="text-brand-secondary">Total Received</span>
                <span className="font-semibold text-brand-dark">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-brand-border/60">
                <span className="text-brand-secondary">Remaining Balance</span>
                <span className="font-bold text-brand-dark text-base">{formatCurrency(remaining)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-brand-secondary">Status</span>
                <StatusBadge type="payment" status={payStatus} />
              </div>
            </div>
          </div>

          {/* Add Payment Form */}
          <div className="lg:col-span-2 bg-white border border-brand-border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-brand-border pb-3">
              <Plus className="w-5 h-5 text-brand-dark" />
              <h2 className="text-xl font-semibold text-brand-dark">Record New Payment</h2>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                    Amount (INR ₹) <span className="text-brand-dark">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none focus:border-brand-dark transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                    Payment Date <span className="text-brand-dark">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none focus:border-brand-dark transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                  Note / Description (Optional)
                </label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="e.g. Milestone 2 installment / Final settlement"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none focus:border-brand-dark transition-colors"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={payLoading}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-brand-nav hover:bg-brand-dark border border-brand-dark rounded-md transition-colors"
                >
                  {payLoading ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Payment History Table */}
        <div className="bg-white border border-brand-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-brand-dark border-b border-brand-border pb-3">
            Payment History Ledger
          </h2>

          {client.payments.length === 0 ? (
            <p className="text-sm text-brand-muted py-4">No payments recorded yet.</p>
          ) : (
            <>
              {/* Desktop & Tablet Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-brand-border text-xs font-semibold text-brand-secondary uppercase tracking-wider bg-brand-surface">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Description / Note</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {client.payments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-brand-surface/50 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-brand-dark">
                          {new Date(pay.paymentDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-brand-secondary">
                          {pay.note || 'General Payment'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-brand-dark">
                          {formatCurrency(pay.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {client.payments.map((pay) => (
                  <div key={pay.id} className="p-4 border border-brand-border rounded-md bg-brand-bg flex items-center justify-between">
                    <div>
                      <p className="text-xs text-brand-muted">{new Date(pay.paymentDate).toLocaleDateString('en-IN')}</p>
                      <p className="text-xs font-medium text-brand-dark mt-0.5">{pay.note || 'General Payment'}</p>
                    </div>
                    <span className="text-sm font-bold text-brand-dark">{formatCurrency(pay.amount)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Confirm Delete Modal */}
        <ConfirmModal
          isOpen={isDeleteOpen}
          title="Delete Client Profile"
          clientName={client.name}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteClient}
          isDeleting={isDeleting}
        />

        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      </main>
    </div>
  );
}
