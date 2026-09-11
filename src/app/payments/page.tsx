'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  formatCurrency, 
  getInitials,
  PaymentStatus 
} from '@/lib/finance';
import { DatePreset, getPresetLabel } from '@/lib/date-filters';
import { CustomDateRangePicker } from '@/components/CustomDateRangePicker';
import { CreditCard, Search, IndianRupee, Wallet, Calendar, AlertCircle, Briefcase } from 'lucide-react';

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

function PaymentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL query state
  const rangeParam = (searchParams.get('range') || 'all_time') as DatePreset;
  const fromParam = searchParams.get('from') || '';
  const toParam = searchParams.get('to') || '';

  // Data state
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [totalReceived, setTotalReceived] = useState<number>(0);
  const [totalDueAllTime, setTotalDueAllTime] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | PaymentStatus>('All');

  // Date filter state
  const [preset, setPreset] = useState<DatePreset>(rangeParam);
  const [customFrom, setCustomFrom] = useState<string>(fromParam);
  const [customTo, setCustomTo] = useState<string>(toParam);

  // Sync component state & fetch data when URL search params update
  useEffect(() => {
    setPreset(rangeParam);
    setCustomFrom(fromParam);
    setCustomTo(toParam);
    fetchPaymentsData(rangeParam, fromParam, toParam);
  }, [searchParams]);

  const fetchPaymentsData = async (
    activePreset: string,
    activeFrom: string,
    activeTo: string
  ) => {
    setLoading(true);
    try {
      let url = `/api/payments?range=${activePreset}`;
      if (activePreset === 'custom' && activeFrom && activeTo) {
        url += `&from=${activeFrom}&to=${activeTo}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRows(data.rows || []);
        setTotalReceived(data.totalReceived || 0);
        setTotalDueAllTime(data.totalDueAllTime || 0);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle preset dropdown change
  const handlePresetChange = (newPreset: DatePreset) => {
    setPreset(newPreset);
    if (newPreset !== 'custom') {
      const params = new URLSearchParams();
      if (newPreset !== 'all_time') {
        params.set('range', newPreset);
      }
      const queryString = params.toString();
      router.push(queryString ? `/payments?${queryString}` : '/payments');
    }
  };

  // Custom range validation logic
  const isInvalidCustomRange = preset === 'custom' && Boolean(customFrom && customTo && customFrom > customTo);
  const isApplyDisabled = preset === 'custom' && (!customFrom || !customTo || isInvalidCustomRange);

  const handleApplyCustomRange = () => {
    if (isApplyDisabled) return;
    const params = new URLSearchParams();
    params.set('range', 'custom');
    params.set('from', customFrom);
    params.set('to', customTo);
    router.push(`/payments?${params.toString()}`);
  };

  // Combined client-side filtering (Search + Status Filter)
  const filteredRows = rows.filter((r) => {
    const query = search.toLowerCase().trim();
    const matchesSearch = !query || r.clientName.toLowerCase().includes(query) || r.projectName.toLowerCase().includes(query);
    const matchesFilter = filter === 'All' || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Dynamic received card title
  const receivedCardTitle = preset === 'all_time' 
    ? 'Total Payment Received'
    : `Payment Received (${getPresetLabel(preset)})`;

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
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{receivedCardTitle}</span>
              <div className="p-2 bg-zinc-100/80 rounded-xl border border-zinc-200/60">
                <IndianRupee className="w-4 h-4 text-zinc-700" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">{formatCurrency(totalReceived)}</p>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Total Outstanding Due (All Time)</span>
              <div className="p-2 bg-zinc-100/80 rounded-xl border border-zinc-200/60">
                <Wallet className="w-4 h-4 text-zinc-700" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">{formatCurrency(totalDueAllTime)}</p>
          </div>
        </div>

        {/* Filter Toolbar (Status, Date Range, Search) */}
        <div className="flex flex-col gap-3 bg-white border border-zinc-200/80 p-3.5 sm:p-4 rounded-2xl shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            {/* Left: Status Filter Tabs & Custom Date Range Calendar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Tabs */}
              <div className="flex items-center gap-1 bg-zinc-100/80 p-1 rounded-xl border border-zinc-200/60">
                {(['All', 'Paid', 'Partial Payment', 'Unpaid'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                      filter === tab
                        ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Custom Date Range Calendar Popover */}
              <CustomDateRangePicker
                preset={preset}
                customFrom={customFrom}
                customTo={customTo}
                onPresetChange={(newPreset) => handlePresetChange(newPreset)}
                onCustomRangeApply={(from, to) => {
                  setCustomFrom(from);
                  setCustomTo(to);
                  const params = new URLSearchParams();
                  params.set('range', 'custom');
                  params.set('from', from);
                  params.set('to', to);
                  router.push(`/payments?${params.toString()}`);
                }}
              />
            </div>

            {/* Right: Search Input */}
            <div className="relative w-full lg:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search client or project..."
                className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 transition-all shadow-xs"
              />
            </div>
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
            <p>
              {preset !== 'all_time' 
                ? 'No payments in this range.' 
                : 'No payment entries match your filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50/60">
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Project</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">
                      {preset !== 'all_time' ? `Paid (${getPresetLabel(preset)})` : 'Total Paid'}
                    </th>
                    <th className="py-3.5 px-4">Remaining Due</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredRows.map((r, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                            {getInitials(r.clientName)}
                          </div>
                          <Link href={`/clients/${r.clientId}`} className="font-semibold text-zinc-900 hover:text-zinc-600 transition-colors">
                            {r.clientName}
                          </Link>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 font-medium">{r.projectName}</td>
                      <td className="py-3.5 px-4 text-zinc-700 font-medium">{formatCurrency(r.totalAmount)}</td>
                      <td className="py-3.5 px-4 text-zinc-700 font-medium">{formatCurrency(r.paid)}</td>
                      <td className={`py-3.5 px-4 font-bold ${r.due > 0 ? 'text-rose-600' : 'text-zinc-900'}`}>{formatCurrency(r.due)}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge type="payment" status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Redesigned Mobile Collapsed Cards (<640px) */}
            <div className="sm:hidden p-3 space-y-3 bg-zinc-50/40">
              {filteredRows.map((r, idx) => (
                <div key={idx} className="p-4 border border-zinc-200/80 rounded-2xl bg-white shadow-xs hover:shadow-md transition-all space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs border border-zinc-800">
                        {getInitials(r.clientName)}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/clients/${r.clientId}`} className="font-bold text-zinc-900 hover:text-zinc-600 transition-colors text-sm truncate block">
                          {r.clientName}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[11px] font-medium border border-zinc-200/50">
                            <Briefcase className="w-3 h-3 text-zinc-400" />
                            <span className="truncate max-w-[140px]">{r.projectName}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge type="payment" status={r.status} />
                  </div>

                  {/* 3-Column Financial Grid */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-zinc-50/80 rounded-xl border border-zinc-200/60 text-center">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">TOTAL</span>
                      <span className="text-xs font-semibold text-zinc-900">{formatCurrency(r.totalAmount)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600/90 uppercase tracking-wider block">
                        {preset !== 'all_time' ? 'PAID (RANGE)' : 'PAID'}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700">{formatCurrency(r.paid)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-rose-500/90 uppercase tracking-wider block">DUE</span>
                      <span className={`text-xs font-bold ${r.due > 0 ? 'text-rose-600' : 'text-zinc-900'}`}>{formatCurrency(r.due)}</span>
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

export default function PaymentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50/50 flex items-center justify-center text-zinc-400 text-sm">
        Loading payments ledger...
      </div>
    }>
      <PaymentsPageContent />
    </Suspense>
  );
}
