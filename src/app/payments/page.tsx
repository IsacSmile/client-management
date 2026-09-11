'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  calculateTotalPaid, 
  calculateRemaining, 
  getPaymentStatus, 
  formatCurrency, 
  PaymentStatus 
} from '@/lib/finance';
import { CreditCard, Search, DollarSign, Wallet } from 'lucide-react';

interface PaymentRow {
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  totalAmount: number;
  paid: number;
  due: number;
  status: PaymentStatus;
}

export default function PaymentsPage() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | PaymentStatus>('All');

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const fetchPaymentsData = async () => {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const clients = await res.json();
        const paymentRows: PaymentRow[] = [];

        clients.forEach((c: any) => {
          c.projects.forEach((p: any) => {
            const paid = calculateTotalPaid(p.payments);
            const due = calculateRemaining(p.totalAmount, paid);
            const status = getPaymentStatus(p.totalAmount, paid);

            paymentRows.push({
              clientId: c.id,
              clientName: c.name,
              projectId: p.id,
              projectName: p.name,
              totalAmount: p.totalAmount,
              paid,
              due,
              status,
            });
          });
        });

        setRows(paymentRows);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const totalReceived = rows.reduce((sum, r) => sum + r.paid, 0);
  const totalDue = rows.reduce((sum, r) => sum + r.due, 0);

  // Filtered rows
  const filteredRows = rows.filter((r) => {
    const query = search.toLowerCase().trim();
    const matchesSearch = !query || r.clientName.toLowerCase().includes(query) || r.projectName.toLowerCase().includes(query);
    const matchesFilter = filter === 'All' || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-brand-bg">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Page Header */}
        <div className="border-b border-brand-border pb-4">
          <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Payments Ledger</h1>
          <p className="text-sm text-brand-secondary mt-1">Financial ledger of received payments and outstanding dues</p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-brand-border rounded-lg p-5 space-y-2">
            <div className="flex items-center justify-between text-brand-secondary">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Payment Received</span>
              <div className="p-2 bg-brand-surface rounded-md border border-brand-border">
                <DollarSign className="w-4 h-4 text-brand-dark" />
              </div>
            </div>
            <p className="text-3xl font-bold text-brand-dark">{formatCurrency(totalReceived)}</p>
          </div>

          <div className="bg-white border border-brand-border rounded-lg p-5 space-y-2">
            <div className="flex items-center justify-between text-brand-secondary">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Outstanding Due</span>
              <div className="p-2 bg-brand-surface rounded-md border border-brand-border">
                <Wallet className="w-4 h-4 text-brand-dark" />
              </div>
            </div>
            <p className="text-3xl font-bold text-brand-dark">{formatCurrency(totalDue)}</p>
          </div>
        </div>

        {/* Filter Tabs & Search Field */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['All', 'Paid', 'Partial Payment', 'Unpaid'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md border transition-colors whitespace-nowrap ${
                  filter === tab
                    ? 'bg-brand-dark text-white border-brand-dark'
                    : 'bg-white text-brand-dark border-brand-border hover:bg-brand-surface'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client or project..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none focus:border-brand-dark transition-colors"
            />
          </div>
        </div>

        {/* Payment Ledger Table */}
        {loading ? (
          <div className="bg-white border border-brand-border rounded-lg p-12 text-center text-brand-muted text-sm">
            Loading payments ledger...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="bg-white border border-brand-border rounded-lg p-12 text-center text-brand-muted text-sm space-y-2">
            <CreditCard className="w-8 h-8 text-brand-muted mx-auto" />
            <p>No payment entries match your filter criteria.</p>
          </div>
        ) : (
          <div className="bg-white border border-brand-border rounded-lg overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-xs font-semibold text-brand-secondary uppercase tracking-wider bg-brand-surface">
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Project</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Total Paid</th>
                    <th className="py-3.5 px-4">Remaining Due</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {filteredRows.map((r, idx) => (
                    <tr key={idx} className="hover:bg-brand-surface/50 transition-colors">
                      <td className="py-4 px-4 font-semibold text-brand-dark">
                        <Link href={`/clients/${r.clientId}`} className="hover:underline">
                          {r.clientName}
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-brand-secondary">{r.projectName}</td>
                      <td className="py-4 px-4 text-brand-dark">{formatCurrency(r.totalAmount)}</td>
                      <td className="py-4 px-4 text-brand-dark font-medium">{formatCurrency(r.paid)}</td>
                      <td className="py-4 px-4 text-brand-dark font-semibold">{formatCurrency(r.due)}</td>
                      <td className="py-4 px-4">
                        <StatusBadge type="payment" status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Collapsed Cards (<640px) */}
            <div className="sm:hidden divide-y divide-brand-border">
              {filteredRows.map((r, idx) => (
                <div key={idx} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/clients/${r.clientId}`} className="font-bold text-brand-dark hover:underline text-base">
                        {r.clientName}
                      </Link>
                      <p className="text-xs text-brand-secondary">Project: {r.projectName}</p>
                    </div>
                    <StatusBadge type="payment" status={r.status} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-brand-border text-center">
                    <div className="p-2 bg-brand-surface rounded border border-brand-border">
                      <span className="text-brand-muted block text-[10px]">TOTAL</span>
                      <span className="font-semibold text-brand-dark">{formatCurrency(r.totalAmount)}</span>
                    </div>
                    <div className="p-2 bg-brand-surface rounded border border-brand-border">
                      <span className="text-brand-muted block text-[10px]">PAID</span>
                      <span className="font-semibold text-brand-dark">{formatCurrency(r.paid)}</span>
                    </div>
                    <div className="p-2 bg-brand-surface rounded border border-brand-border">
                      <span className="text-brand-muted block text-[10px]">DUE</span>
                      <span className="font-semibold text-brand-dark">{formatCurrency(r.due)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
