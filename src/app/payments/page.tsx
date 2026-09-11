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
import { CreditCard, Search, IndianRupee, Wallet } from 'lucide-react';

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
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-50/50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Page Header */}
        <div className="pb-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">Payments Ledger</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-normal">Financial ledger of received payments and outstanding dues</p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total Payment Received</span>
              <div className="p-2 bg-zinc-100/80 rounded-xl border border-zinc-200/60">
                <IndianRupee className="w-4 h-4 text-zinc-700" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">{formatCurrency(totalReceived)}</p>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total Outstanding Due</span>
              <div className="p-2 bg-zinc-100/80 rounded-xl border border-zinc-200/60">
                <Wallet className="w-4 h-4 text-zinc-700" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">{formatCurrency(totalDue)}</p>
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
                className={`px-3.5 py-1.5 text-xs font-medium rounded-xl border transition-all whitespace-nowrap ${
                  filter === tab
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client or project..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Payment Ledger Table */}
        {loading ? (
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-12 text-center text-zinc-400 text-xs sm:text-sm shadow-sm">
            Loading payments ledger...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-12 text-center text-zinc-400 text-xs sm:text-sm space-y-2 shadow-sm">
            <CreditCard className="w-8 h-8 text-zinc-300 mx-auto" />
            <p>No payment entries match your filter criteria.</p>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-50/60">
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Project</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Total Paid</th>
                    <th className="py-3.5 px-4">Remaining Due</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredRows.map((r, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-zinc-900">
                        <Link href={`/clients/${r.clientId}`} className="hover:text-zinc-600 transition-colors">
                          {r.clientName}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 font-normal">{r.projectName}</td>
                      <td className="py-3.5 px-4 text-zinc-700 font-medium">{formatCurrency(r.totalAmount)}</td>
                      <td className="py-3.5 px-4 text-zinc-700 font-medium">{formatCurrency(r.paid)}</td>
                      <td className="py-3.5 px-4 text-zinc-900 font-semibold">{formatCurrency(r.due)}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge type="payment" status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Collapsed Cards (<640px) */}
            <div className="sm:hidden divide-y divide-zinc-100">
              {filteredRows.map((r, idx) => (
                <div key={idx} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/clients/${r.clientId}`} className="font-bold text-zinc-900 hover:underline text-base">
                        {r.clientName}
                      </Link>
                      <p className="text-xs text-zinc-400">Project: {r.projectName}</p>
                    </div>
                    <StatusBadge type="payment" status={r.status} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-zinc-100 text-center">
                    <div className="p-2 bg-zinc-50/80 rounded-xl border border-zinc-100">
                      <span className="text-zinc-400 block text-[10px]">TOTAL</span>
                      <span className="font-semibold text-zinc-900">{formatCurrency(r.totalAmount)}</span>
                    </div>
                    <div className="p-2 bg-zinc-50/80 rounded-xl border border-zinc-100">
                      <span className="text-zinc-400 block text-[10px]">PAID</span>
                      <span className="font-semibold text-zinc-900">{formatCurrency(r.paid)}</span>
                    </div>
                    <div className="p-2 bg-zinc-50/80 rounded-xl border border-zinc-100">
                      <span className="text-zinc-400 block text-[10px]">DUE</span>
                      <span className="font-semibold text-zinc-900">{formatCurrency(r.due)}</span>
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
